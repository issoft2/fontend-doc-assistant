import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { listUsersForTenant, updateCollectionAccess } from '@/lib/api'
import { CollectionOut } from '@/lib/api'
import { ALL_ASSIGNABLE_ROLES, AssignableRole } from '@/lib/assignableRoles'


export interface UserOut {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  tenant_id: string;
  organization_id?: string | null;
  role?: string | null;
  phone?: string;
  is_active: boolean;
  created_at: string;
  is_online?: boolean;
  last_login_at?: string | null;
  last_seen_at?: string | null;
  roles?: string[];
  permissions?: string[];
}

interface Props {
  open: boolean
  collection: CollectionOut | null
  onClose: () => void
  onSaved: () => void
}

export const AccessControlModal: React.FC<Props> = ({
  open,
  collection,
  onClose,
  onSaved,
}) => {
  const [roles, setRoles] = useState<AssignableRole[]>([])
  const [users, setUsers] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<UserOut[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Initialize state when modal opens
  useEffect(() => {
    if (!collection) return
    setRoles(
      (collection.allowed_roles ?? []).filter(
        (r): r is AssignableRole => ALL_ASSIGNABLE_ROLES.includes(r as AssignableRole)
      )
    )
    setUsers(collection.allowed_user_ids ?? [])
    const loadUsers = async () => {
      try{
        setLoadingUsers(true)
        const res = await listUsersForTenant() // handling the tenant param in the backend
        const payload = Array.isArray(res) ? res : res?.data || []
        setAvailableUsers(payload);
      } catch (err) {
        console.error("Failed to load Tenant user", err);
        setAvailableUsers([]);
      } finally {
        setLoadingUsers(false)
      }
       
    }
    loadUsers()
  }, [collection])

  if (!open || !collection) return null

  const handleSave = async () => {
    if (!roles.length && !users.length) return

    try {
      setSaving(true)
      await updateCollectionAccess(collection.id, {
        allowed_roles: roles,
        allowed_user_ids: users,
      })
      onSaved()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl p-8 md:p-10 overflow-y-auto max-h-[90vh]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-2xl font-semibold mb-6">{collection.name} — Access Control</h2>

        {/* Roles Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/80 mb-2">
            Roles
          </label>
          <select
            multiple
            value={roles}
            onChange={e =>
              setRoles(
                Array.from(e.target.selectedOptions).map(
                  o => o.value as AssignableRole
                )
              )
            }
            className="w-full p-3 bg-slate-800/50 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 overflow-y-auto"
          >
            {ALL_ASSIGNABLE_ROLES.map(role => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {availableUsers.map(user => {
            const selected = users.includes(user.id)
            return (
              <div
                key={user.id}
                onClick={() => {
                  if (selected) {
                    setUsers(users.filter(u => u !== user.id))
                  } else {
                    setUsers([...users, user.id])
                  }
                }}
                className={`p-3 rounded-xl border cursor-pointer transition
                  ${selected
                    ? "bg-blue-500/20 border-blue-400"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
              >
                <div className="text-sm font-medium">{user.email}</div>
                <div className="text-xs text-white/50">{user.role}</div>
              </div>
            )
          })}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}