import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { createCollectionForOrganization } from '@/lib/api'
import { OrganizationOut } from '@/lib/api'

interface Props {
  open: boolean
  onClose: () => void
  tenantId: string
  organizations: OrganizationOut[]
  onCreated: () => void
}

export const CreateCollectionModal: React.FC<Props> = ({
  open,
  onClose,
  tenantId,
  organizations,
  onCreated,
}) => {
  const [name, setName] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tenantId || !organizationId || !name.trim()) {
      setError('All fields required')
      return
    }

    try {
      setCreating(true)
      await createCollectionForOrganization({
        tenant_id: tenantId,
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
          {error && <p className="text-red-400">{error}</p>}

          <select
            value={organizationId}
            onChange={e => setOrganizationId(e.target.value)}
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
          />

          <div className="flex gap-3">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}