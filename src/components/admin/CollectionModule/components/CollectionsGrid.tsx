import { CollectionOut, listUsersForTenant } from "@/lib/api";
import { Database, Plus } from "lucide-react";
import React, { useState } from "react";
import { CollectionCard } from "./CollectionsCard";
import { motion } from "framer-motion";
import { UserOut } from "./AccessControlModal";

interface Props {
  collections: CollectionOut[];
  users: UserOut[];
  loading?: boolean;
  onAccessClick: (collection: CollectionOut) => void;
  onCreateClick: () => void;
  canCreate?: boolean;
}

export const CollectionsGrid: React.FC<Props> = ({
  collections,
  users,
  loading = false,
  onAccessClick,
  onCreateClick,
  canCreate = false,
}) => {
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  const userMap = React.useMemo(() => {
    const map = new Map<string, UserOut>();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Database className="w-10 h-10 animate-pulse text-white/40" />
      </div>
    );
  }

  if (!collections.length) {
    return (
      <div className="text-center py-24">
        <h3 className="text-xl text-white/60 mb-4">No Collections Yet</h3>

        {canCreate && (
          <button className="btn-primary inline-flex items-center" onClick={onCreateClick}>
            <Plus className="w-5 h-5 mr-2" />
            Create First Collection
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {collections.map((collection, index) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          index={index}
          userMap={userMap}
          onAccessClick={(col) => {
            setActiveCollectionId(col.id);
            onAccessClick(col);
          }}
         
        />
      ))}
    </motion.div>
  );
};