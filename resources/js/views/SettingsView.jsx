import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Lock, Camera, CheckCircle2, ShieldAlert, Loader2, Save, KeyRound, Mail, Phone, Contact
} from 'lucide-react'
import { useAuthStore } from '../stores/auth'
import BaseInput from '../components/ui/BaseInput.jsx'
import BaseButton from '../components/ui/BaseButton.jsx'
import BaseBadge from '../components/ui/BaseBadge.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import axios from 'axios'

// ── API base: reads VITE_API_BASE_URL from .env (e.g. http://localhost:8001/api)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api'


export default function SettingsView() {
  const auth = useAuthStore()
  // Derive Bearer token from auth store
  const bearerToken = auth.token
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'password'

  
  // Profile update states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [profileErrors, setProfileErrors] = useState({})
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  // Password change states
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  const fileInputRef = useRef(null)

  // Populate profile form from auth store
  useEffect(() => {
    if (auth.user) {
      setProfileForm({
        name: auth.user.name || '',
        email: auth.user.email || '',
        phone: auth.user.phone || '',
      })
      setPhotoPreview(auth.user.photo || null)
    }
  }, [auth.user])

  // Get Initials for Avatar Fallback
  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'AD'
  }

  // Handle Photo Selection
  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setProfileErrors((prev) => ({ ...prev, photo: 'Image size must be less than 2 MB.' }))
      return
    }

    setSelectedPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setProfileErrors((prev) => {
      const next = { ...prev }
      delete next.photo
      return next
    })
  }

  // Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileErrors({})
    setProfileSuccess(false)
    setProfileMessage('')

    try {
      let response

      // Common auth headers (NO Content-Type — let axios/browser set it)
      const authHeaders = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      }

      if (selectedPhoto) {
        // ── Photo upload: multipart/form-data via POST + _method=PUT (Laravel requirement)
        const formData = new FormData()
        formData.append('_method', 'PUT')           // Laravel method spoofing
        formData.append('name',  profileForm.name)
        formData.append('email', profileForm.email)
        if (profileForm.phone) formData.append('phone', profileForm.phone)
        formData.append('photo', selectedPhoto)      // field name MUST be 'photo'

        // ⚠️ Do NOT set 'Content-Type' header manually — browser will set multipart/form-data
        //    with the correct boundary automatically.
        response = await axios.post(`${API_BASE}/v1/profile`, formData, {
          headers: authHeaders,
        })
      } else {
        // ── Text-only update: JSON PUT
        response = await axios.put(`${API_BASE}/v1/profile`, {
          name:  profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone,
        }, {
          headers: authHeaders,
        })
      }

      setProfileSuccess(true)
      setProfileMessage(response.data?.message || 'Profile updated successfully.')
      setSelectedPhoto(null)

      // Update the global user state from the API response (avoids an extra /me call)
      const updatedUser = response.data?.data?.user
      if (updatedUser) {
        // Re-fetch so auth store has the fresh photo URL etc.
        await auth.fetchMe()
      }

      setTimeout(() => setProfileSuccess(false), 4000)
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        auth.clearAuthState()
        window.location.href = '/login'
        return
      }
      if (status === 422) {
        setProfileErrors(err?.response?.data?.errors || {})
      } else {
        setProfileMessage(
          err?.response?.data?.message || 'Unable to update profile. Please try again.'
        )
      }
    } finally {
      setProfileSaving(false)
    }
  }


  // Save Password
  const handleSavePassword = async (e) => {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordErrors({})
    setPasswordSuccess(false)
    setPasswordMessage('')

    // Front-end confirmation match check
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setPasswordErrors({ new_password_confirmation: ['Passwords do not match.'] })
      setPasswordSaving(false)
      return
    }

    try {
      // PUT /password with Bearer token
      const response = await axios.put(`${API_BASE}/v1/password`, passwordForm, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
      })

      setPasswordSuccess(true)
      setPasswordMessage(response.data?.message || 'Password changed successfully.')
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      })

      setTimeout(() => setPasswordSuccess(false), 4000)
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        auth.clearAuthState()
        window.location.href = '/login'
        return
      }
      if (status === 422) {
        setPasswordErrors(err?.response?.data?.errors || {})
      } else {
        setPasswordMessage(
          err?.response?.data?.message || 'Unable to update password. Please try again.'
        )
      }
    } finally {
      setPasswordSaving(false)
    }
  }


  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Account Settings"
        subtitle="Manage your personal profile, email settings, and security preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar (3 Cols) */}
        <aside className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition w-full text-left cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/20'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <User className="w-4.5 h-4.5" />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition w-full text-left cursor-pointer ${
              activeTab === 'password'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/20'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Lock className="w-4.5 h-4.5" />
            <span>Password & Security</span>
          </button>
        </aside>

        {/* Content Box (9 Cols) */}
        <section className="lg:col-span-9 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden min-h-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="p-6 md:p-8"
            >
              
              {/* PROFILE PANEL */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                    <p className="text-xs text-slate-500 mt-1">Configure your public profile and login contact info.</p>
                  </div>

                  {profileSuccess && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-fade-in">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                      <span>{profileMessage}</span>
                    </div>
                  )}

                  {profileMessage && !profileSuccess && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 font-semibold flex items-center gap-2">
                      <ShieldAlert className="w-4.5 h-4.5 text-rose-600" />
                      <span>{profileMessage}</span>
                    </div>
                  )}

                  {/* Photo Uploader */}
                  <div className="flex items-center gap-5">
                    <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-50 relative flex items-center justify-center">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black text-slate-400">
                            {getInitials(profileForm.name)}
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 rounded-2xl">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Profile Photo</h4>
                      <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG formats up to 2 MB.</p>
                      <button
                        type="button"
                        onClick={handlePhotoClick}
                        className="text-xs font-bold text-teal-600 hover:text-teal-700 mt-2 focus:outline-none"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                  {profileErrors.photo && (
                    <p className="text-xs font-semibold text-rose-500 mt-1.5">{profileErrors.photo}</p>
                  )}

                  {/* Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BaseInput
                      label="Full Name"
                      type="text"
                      modelValue={profileForm.name}
                      onUpdateModelValue={(v) => setProfileForm((prev) => ({ ...prev, name: v }))}
                      error={profileErrors.name?.[0]}
                      required
                      prefix={Contact}
                    />

                    <BaseInput
                      label="Email Address"
                      type="email"
                      modelValue={profileForm.email}
                      onUpdateModelValue={(v) => setProfileForm((prev) => ({ ...prev, email: v }))}
                      error={profileErrors.email?.[0]}
                      required
                      prefix={Mail}
                    />

                    <div className="md:col-span-2">
                      <BaseInput
                        label="Phone Number"
                        type="tel"
                        modelValue={profileForm.phone}
                        onUpdateModelValue={(v) => setProfileForm((prev) => ({ ...prev, phone: v }))}
                        error={profileErrors.phone?.[0]}
                        placeholder="+91 9999999999"
                        prefix={Phone}
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="border-t border-slate-100 pt-5 flex justify-end">
                    <BaseButton
                      type="submit"
                      loading={profileSaving}
                      disabled={profileSaving}
                      leftIcon={profileSaving ? Loader2 : Save}
                    >
                      Save Profile
                    </BaseButton>
                  </div>
                </form>
              )}

              {/* PASSWORD PANEL */}
              {activeTab === 'password' && (
                <form onSubmit={handleSavePassword} className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Change Password</h3>
                    <p className="text-xs text-slate-500 mt-1">Strengthen your account safety by setting a new secure password.</p>
                  </div>

                  {passwordSuccess && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-fade-in">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                      <span>{passwordMessage}</span>
                    </div>
                  )}

                  {passwordMessage && !passwordSuccess && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 font-semibold flex items-center gap-2">
                      <ShieldAlert className="w-4.5 h-4.5 text-rose-600" />
                      <span>{passwordMessage}</span>
                    </div>
                  )}

                  {/* Fields */}
                  <div className="space-y-4">
                    <BaseInput
                      label="Current Password"
                      type="password"
                      modelValue={passwordForm.current_password}
                      onUpdateModelValue={(v) => setPasswordForm((prev) => ({ ...prev, current_password: v }))}
                      error={passwordErrors.current_password?.[0]}
                      required
                      toggleableType
                      prefix={KeyRound}
                    />

                    <BaseInput
                      label="New Password"
                      type="password"
                      modelValue={passwordForm.new_password}
                      onUpdateModelValue={(v) => setPasswordForm((prev) => ({ ...prev, new_password: v }))}
                      error={passwordErrors.new_password?.[0]}
                      hint="Password must be at least 8 characters and contain mixed case and symbols."
                      required
                      toggleableType
                      prefix={KeyRound}
                    />

                    <BaseInput
                      label="Confirm New Password"
                      type="password"
                      modelValue={passwordForm.new_password_confirmation}
                      onUpdateModelValue={(v) => setPasswordForm((prev) => ({ ...prev, new_password_confirmation: v }))}
                      error={passwordErrors.new_password_confirmation?.[0]}
                      required
                      toggleableType
                      prefix={KeyRound}
                    />
                  </div>

                  {/* Save Button */}
                  <div className="border-t border-slate-100 pt-5 flex justify-end">
                    <BaseButton
                      type="submit"
                      loading={passwordSaving}
                      disabled={passwordSaving}
                      leftIcon={passwordSaving ? Loader2 : Save}
                    >
                      Change Password
                    </BaseButton>
                  </div>
                </form>
              )}

            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  )
}
