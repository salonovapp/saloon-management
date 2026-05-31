import axios from 'axios'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, UsersRound, CheckCircle2, Shield, Save } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import BaseButton from '../../components/ui/BaseButton.jsx'
import { useAuthStore } from '../../stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export default function AssignPermissionsView() {
  const auth = useAuthStore()

  const [roles, setRoles] = useState([])
  const [allPermissions, setAllPermissions] = useState([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [isPermsLoading, setIsPermsLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')

  // Local state to track selected permissions per role before saving.
  // Record<RoleId, Set<PermissionId>>
  const [selections, setSelections] = useState({})
  // Track loading state for individual role save buttons
  const [savingRoles, setSavingRoles] = useState(new Set())

  const fetchRoles = useCallback(async () => {
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
      const rolesData = Array.isArray(data) ? data : []
      setRoles(rolesData)
      
      // Initialize local selections from fetched roles
      const initialSelections = {}
      rolesData.forEach(role => {
        initialSelections[role.id] = new Set((role.permissions || []).map(p => p.id))
      })
      setSelections(initialSelections)
      
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      setRoles([])
    } finally {
      setIsLoading(false)
    }
  }, [auth])

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/v1/permissions`, {
        headers: { ...auth.authHeaders(), 'Accept': 'application/json' },
      })
      const perms = res.data.data?.permissions || res.data.data || res.data
      setAllPermissions(Array.isArray(perms) ? perms : [])
    } catch (error) {
      console.error('Failed to load permissions', error)
      setAllPermissions([])
    } finally {
      setIsPermsLoading(false)
    }
  }, [auth])

  useEffect(() => {
    void fetchRoles()
    void fetchPermissions()
  }, [fetchRoles, fetchPermissions])

  const showSuccess = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const toggleCheckbox = (roleId, permId) => {
    setSelections(prev => {
      const currentSet = prev[roleId] || new Set()
      const newSet = new Set(currentSet)
      if (newSet.has(permId)) {
        newSet.delete(permId)
      } else {
        newSet.add(permId)
      }
      return { ...prev, [roleId]: newSet }
    })
  }

  const selectAll = (roleId) => {
    setSelections(prev => {
      const allIds = allPermissions.map(p => p.id)
      return { ...prev, [roleId]: new Set(allIds) }
    })
  }

  const clearAll = (roleId) => {
    setSelections(prev => ({ ...prev, [roleId]: new Set() }))
  }

  const saveRolePermissions = async (roleId) => {
    const selectedIds = Array.from(selections[roleId] || new Set())
    
    setSavingRoles(prev => new Set(prev).add(roleId))
    try {
      await axios.put(`${API_BASE_URL}/v1/roles/${roleId}/permissions`, { permission_ids: selectedIds }, {
        headers: { ...auth.authHeaders(), 'Accept': 'application/json' },
      })
      
      showSuccess('Permissions saved successfully.')
      
      // Update the roles array with new permissions so it reflects truth if they navigate away
      const updatedPermissionsObjects = allPermissions.filter(p => selectedIds.includes(p.id))
      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions: updatedPermissionsObjects } : r))
      
      // If updating own role, refresh session
      if (auth.role?.id === roleId) {
        auth.fetchMe()
      }
    } catch (error) {
      console.error(error)
      alert(error?.response?.data?.message || 'Failed to update permissions.')
    } finally {
      setSavingRoles(prev => {
        const next = new Set(prev)
        next.delete(roleId)
        return next
      })
    }
  }

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Assign Permissions to Roles"
          subtitle="Map capabilities to your configured roles."
        />
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

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[500px]">
        {(isLoading || isPermsLoading) ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 h-full">
            <svg className="h-8 w-8 animate-spin text-teal-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
            </svg>
            <p>Loading matrix...</p>
          </div>
        ) : allPermissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 h-full">
            <KeyRound className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-semibold text-slate-600">No Permissions Found</p>
            <p className="text-sm mt-1 max-w-sm text-center">
              There are currently no permissions configured in the system.
            </p>
          </div>
        ) : roles.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-slate-400 h-full">
            <UsersRound className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-semibold text-slate-600">No Roles Available</p>
            <p className="text-sm mt-1 max-w-sm text-center">
              Please create a role first before assigning permissions.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto bg-white scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-slate-50">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr>
                  <th className="sticky top-0 left-0 z-20 bg-white/95 backdrop-blur border-b border-r border-slate-200 p-6 min-w-[280px] shadow-[1px_0_0_0_rgba(226,232,240,1)] align-middle">
                    <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                      Permissions & Modules
                    </div>
                  </th>
                  {roles.map(role => (
                     <th key={role.id} className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-r border-slate-200 p-6 min-w-[220px] text-center align-top transition-colors hover:bg-slate-50/50">
                        <div className="flex flex-col items-center gap-1">
                          <span 
                            title={role.name}
                            className={`font-bold text-lg tracking-tight block max-w-[160px] truncate ${!role.is_active ? 'text-rose-500' : 'text-slate-800'}`}
                          >
                            {role.name}
                          </span>
                          
                          <div className="flex items-center justify-center mt-3">
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <input 
                                type="checkbox"
                                checked={selections[role.id]?.size === allPermissions.length && allPermissions.length > 0}
                                onChange={(e) => e.target.checked ? selectAll(role.id) : clearAll(role.id)}
                                className="w-4 h-4 text-teal-500 bg-white border-2 border-slate-300 rounded focus:ring-teal-500 cursor-pointer transition-all group-hover:border-teal-400 checked:border-teal-500 shadow-sm"
                              />
                              <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-700 uppercase tracking-wider">
                                All
                              </span>
                            </label>
                          </div>
                          
                          <button 
                            onClick={() => saveRolePermissions(role.id)}
                            disabled={savingRoles.has(role.id)}
                            className="mt-4 flex items-center justify-center gap-1.5 px-6 py-2.5 w-full max-w-[140px] bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 disabled:from-slate-300 disabled:to-slate-300 text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_16px_rgba(20,184,166,0.35)] disabled:shadow-none transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {savingRoles.has(role.id) ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                     </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPermissions.map(perm => (
                  <tr key={perm.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="p-5 border-b border-r border-slate-100 sticky left-0 bg-white group-hover:bg-slate-50/70 transition-colors shadow-[1px_0_0_0_rgba(226,232,240,1)] z-10 align-top border-l-2 border-l-transparent group-hover:border-l-teal-400">
                      <div className="flex flex-col gap-1.5">
                        <div className="font-bold text-sm text-slate-800">{perm.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 uppercase tracking-widest ring-1 ring-slate-200/50">
                            {perm.module || 'Other'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono tracking-tight">{perm.code}</span>
                        </div>
                      </div>
                    </td>
                    {roles.map(role => {
                       const isSelected = selections[role.id]?.has(perm.id) || false
                       return (
                         <td key={role.id} className="p-5 border-b border-r border-slate-100 text-center align-middle bg-slate-50/20 group-hover:bg-transparent transition-colors">
                           <div className="flex items-center justify-center w-full h-full">
                             <div className="relative flex items-center justify-center">
                               <input 
                                 type="checkbox" 
                                 checked={isSelected}
                                 onChange={() => toggleCheckbox(role.id, perm.id)}
                                 className="peer w-5 h-5 text-teal-500 bg-white border-2 border-slate-300 rounded focus:ring-teal-500 focus:ring-offset-2 cursor-pointer transition-all hover:border-teal-400 checked:border-teal-500 shadow-sm"
                               />
                             </div>
                           </div>
                         </td>
                       )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
