import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { createCollectionForOrganization } from '@/lib/api'
import { OrganizationOut } from '@/lib/api'
import { useAuthStore } from '@/useAuthStore'

interface Props {
  open: boolean
  onClose: () => void
  organizations: OrganizationOut[]
  onCreated: () => void
}

export const CreateCollectionModal: React.FC<Props> = ({
  open,
  onClose,
  organizations,
  onCreated,
}) => {
  const { user } = useAuthStore()
  const [name, setName] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!organizationId || !name.trim()) {
      setError('All fields are required')
      return
    }

    if (!user) {
      setError('Authentication required')
      return
    }

    try {
      setCreating(true)

      await createCollectionForOrganization({
        tenant_id: user.tenant_id,
        organization_id: organizationId,
        name,
        visibility: 'tenant',
        allowed_roles: [],
        allowed_user_ids: [],
      })

      onCreated()
      onClose()
      setName('')
      setOrganizationId('')
      setError(null)
    } catch {
      setError('Failed to create collection')
    } finally {
      setCreating(false)
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
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto
                   bg-gradient-to-br from-white/5 to-white/10
                   backdrop-blur-xl border border-white/10
                   rounded-3xl shadow-2xl p-8"
      >
        <h2 className="text-2xl font-semibold mb-6">
          Create New Collection
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {error && (
            <div className="bg-red-500/10 border border-red-400/30 text-red-300 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Organization */}
          <div>
            <label className="block text-sm text-white/70 mb-2">
              Organization
            </label>
            <select
              value={organizationId}
              onChange={e => setOrganizationId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 text-white
                         rounded-xl border border-white/20
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Organization</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {/* Collection Name */}
          <div>
            <label className="block text-sm text-white/70 mb-2">
              Collection Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter collection name"
              className="w-full px-4 py-3 bg-slate-800/50 text-white
                         rounded-xl border border-white/20
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={creating || !name.trim() || !organizationId}
            >
              {creating ? 'Creating...' : 'Create Collection'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}