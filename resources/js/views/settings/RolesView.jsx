import axios from 'axios'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Plus, Search, Edit2, Trash2, AlertTriangle, CheckCircle2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import BaseButton from '../../components/ui/BaseButton.jsx'
import BaseInput from '../../components/ui/BaseInput.jsx'
import { useAuthStore } from '../../stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export default function RolesView() {
  const auth = useAuthStore()
  
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Role Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [form, setForm] = useState({ name: '', is_active: true })
  const [formErrors, setFormErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  // Delete Modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, role: null })
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchRoles = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = {}
      // Removed saloon_id filter so we can see roles with saloon_id = null
      
      const response = await axios.get(`${API_BASE_URL}/v1/roles`, {
        params,
        headers: {
          ...auth.authHeaders(),
          'Accept': 'application/json'
        },
      })
      const data = response.data.data?.roles || response.data.data || response.data
      setRoles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      setRoles([])
    } finally {
      setIsLoading(false)
    }
  }, [auth])

  useEffect(() => {
    void fetchRoles()
  }, [fetchRoles])

  const filteredRoles = useMemo(() => {
    return roles.filter(r => 
      r.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [roles, search])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + itemsPerPage)

  const showSuccess = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // --- ROLE CRUD ---

  const openCreateModal = () => {
    setEditingRole(null)
    setForm({ name: '', is_active: true })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (role) => {
    setEditingRole(role)
    setForm({ name: role.name, is_active: role.is_active })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const saveRole = async (e) => {
    e.preventDefault()
    setFormErrors({})
    
    if (!form.name.trim()) {
      setFormErrors({ name: 'Role name is required.' })
      return
    }

    setIsSaving(true)
    try {
      const payload = { ...form }
      // The user explicitly requested saloon_id to be null
      payload.saloon_id = null

      if (editingRole) {
        const response = await axios.put(`${API_BASE_URL}/v1/roles/${editingRole.id}`, payload, {
          headers: { ...auth.authHeaders(), 'Accept': 'application/json' },
        })
        const updated = response.data.data?.role || response.data.data || response.data
        setRoles(prev => prev.map(r => r.id === updated.id ? updated : r))
        showSuccess('Role updated successfully.')
      } else {
        const response = await axios.post(`${API_BASE_URL}/v1/roles`, payload, {
          headers: { ...auth.authHeaders(), 'Accept': 'application/json' },
        })
        const created = response.data.data?.role || response.data.data || response.data
        setRoles(prev => [created, ...prev])
        showSuccess('Role created successfully.')
      }
      setIsModalOpen(false)
    } catch (error) {
      const serverErrors = error?.response?.data?.errors || {}
      if (Object.keys(serverErrors).length > 0) {
        const newErrors = {}
        for (const key in serverErrors) {
          newErrors[key] = serverErrors[key][0]
        }
        setFormErrors(newErrors)
      } else {
        setFormErrors({ _general: error?.response?.data?.message || 'Failed to save role.' })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.role) return
    setIsDeleting(true)
    try {
      await axios.delete(`${API_BASE_URL}/v1/roles/${deleteModal.role.id}`, {
        headers: { ...auth.authHeaders(), 'Accept': 'application/json' },
      })
      setRoles(prev => prev.filter(r => r.id !== deleteModal.role.id))
      showSuccess('Role deleted successfully.')
      setDeleteModal({ isOpen: false, role: null })
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to delete role.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Manage Roles"
          subtitle={auth.isSystemAdmin ? "Manage all platform roles globally." : "Manage access control roles."}
        />
        {auth.can('roles.create') && (
          <BaseButton onClick={openCreateModal} size="sm" leftIcon={Plus}>
            Add Role
          </BaseButton>
        )}
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <p className="text-sm font-semibold">{successMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search roles..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <svg className="h-8 w-8 animate-spin text-teal-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
              </svg>
              <p>Loading roles...</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      Role Name
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      Permissions Count
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap w-32">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap w-24 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRoles.length > 0 ? (
                    paginatedRoles.map((role, i) => (
                      <motion.tr
                        key={role.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        whileHover={{ backgroundColor: 'rgba(248,250,252,0.8)' }}
                        className="border-b border-slate-100 group"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{role.name}</p>
                              {auth.isSystemAdmin && (
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">
                                  {role.saloon_id ? `Tenant: ${role.saloon_id}` : 'Global Role'}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {role.permissions?.length > 0 ? (
                              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                {role.permissions.length} Assigned
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">No permissions</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {role.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              <AlertTriangle className="w-3.5 h-3.5" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            {auth.can('roles.update') && (
                              <button 
                                onClick={() => openEditModal(role)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-600 text-slate-400 transition cursor-pointer"
                                title="Edit Role"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {auth.can('roles.delete') && (
                              <button 
                                onClick={() => setDeleteModal({ isOpen: true, role })}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition cursor-pointer"
                                title="Delete Role"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-16 text-center text-slate-400">
                        <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="text-lg font-semibold text-slate-600">No roles found</p>
                        <p className="text-sm mt-1">
                          {search ? 'Try adjusting your search criteria.' : 'Create your first role to manage access.'}
                        </p>
                        {!search && auth.can('roles.create') && (
                          <BaseButton onClick={openCreateModal} className="mt-4" size="sm" leftIcon={Plus}>
                            Add Role
                          </BaseButton>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {!isLoading && filteredRoles.length > 0 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium">Rows per page:</span>
                <select 
                  value={itemsPerPage} 
                  onChange={e => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="text-sm border border-slate-200 rounded-lg bg-white px-2 py-1 outline-none focus:border-teal-500 font-medium text-slate-700 cursor-pointer shadow-sm"
                >
                  {[5, 10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 font-medium">
                  {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRoles.length)} of {filteredRoles.length}
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingRole ? 'Edit Role' : 'Create Role'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={saveRole} className="p-6 space-y-5">
                {formErrors._general && (
                  <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                    {formErrors._general}
                  </div>
                )}
                
                <BaseInput
                  label="Role Name"
                  placeholder="e.g. Manager"
                  modelValue={form.name}
                  onUpdateModelValue={(v) => setForm({ ...form, name: v })}
                  error={formErrors.name}
                  autoFocus
                />

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Active Status</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Inactive roles cannot be assigned.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.is_active}
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                      form.is_active ? 'bg-teal-500' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        form.is_active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <BaseButton type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </BaseButton>
                  <BaseButton type="submit" className="flex-1" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Role'}
                  </BaseButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setDeleteModal({ isOpen: false, role: null })}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden p-6 text-center"
            >
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Role</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete the role <span className="font-semibold text-slate-700">"{deleteModal.role?.name}"</span>? Any staff assigned to this role may lose access.
              </p>
              <div className="flex gap-3">
                <BaseButton type="button" variant="secondary" className="flex-1" onClick={() => setDeleteModal({ isOpen: false, role: null })} disabled={isDeleting}>
                  Cancel
                </BaseButton>
                <BaseButton type="button" className="flex-1 !bg-rose-600 hover:!bg-rose-700" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </BaseButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
