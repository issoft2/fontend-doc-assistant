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
      setError('All fields required')
      return
    }

    if (!user) {
      setError('Authentication required!')
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
    } catch {
      setError('Failed to create collection')
    } finally {
      setCreating(false)
    }
  }

  return (
    <motion.div className="modal-overlay">
      <motion.div className="modal-content">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500">{error}</p>}

          <select
            value={organizationId}
            onChange={e => setOrganizationId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
          >
            <option value="">Select Organization</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>

          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Collection name"
            className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
          />

          <div className="flex gap-3">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || !name.trim() || !organizationId}
            >
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}