import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { updateCollectionAccess } from '@/lib/api'
import { CollectionOut } from '@/lib/api'
import { ALL_ASSIGNABLE_ROLES, AssignableRole } from '@/lib/assignableRoles'

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
    // Filter collection.allowed_roles to only include valid AssignableRoles
    const initialRoles: AssignableRole[] = (collection?.allowed_roles ?? []).filter(
        (role): role is AssignableRole => ALL_ASSIGNABLE_ROLES.includes(role as AssignableRole)
    );
  const [roles, setRoles] = useState<AssignableRole[]>(initialRoles)


  const [users, setUsers] = useState<string[]>(
    collection?.allowed_user_ids ?? []
  )
  const [saving, setSaving] = useState(false)

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
    <motion.div className="modal-overlay">
      <motion.div className="modal-content space-y-4">
        <h2 className="text-lg font-semibold">
          Access — {collection.name}
        </h2>

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
        >
          {ALL_ASSIGNABLE_ROLES.map(role => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}