import { Button } from "@/components/ui/button";
import { CollectionOut } from "@/lib/api";
import { motion } from "framer-motion";
import { Database, Eye, User, Shield, Users } from "lucide-react";
import React from "react";

interface Props {
  collection: CollectionOut;
  index: number;
  onAccessClick: (collection: CollectionOut) => void;
}

const getVisibilityIcon = (visibility: string) => {
  switch (visibility) {
    case "tenant":
      return <Users className="w-4 h-4" />;
    case "org":
    case "role":
      return <Shield className="w-4 h-4" />;
    case "user":
      return <User className="w-4 h-4" />;
    default:
      return <Database className="w-4 h-4" />;
  }
};

export const CollectionCard: React.FC<Props> = ({ collection, index, onAccessClick }) => {
  return (
    <motion.div
      key={collection.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-lg hover:shadow-[0_0_40px_rgba(155,_135,_245,_0.2)] transition-all duration-500"
    >
      {/* Glow border on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5]/20 via-transparent to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-6 relative z-10 flex flex-col h-full">
        {/* Visibility */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-slate-800/60 border border-white/20 rounded-xl w-max">
          {getVisibilityIcon(collection.visibility)}
          <span className="text-xs text-white/70 capitalize">{collection.visibility}</span>
        </div>

        {/* Collection Name */}
        <h3 className="text-2xl font-medium mb-2 line-clamp-2">{collection.name}</h3>

        {/* Tenant / Organization */}
        <p className="text-sm text-white/60 mb-4">
          {collection.tenant_name} / {collection.organization_name}
        </p>

        {/* Allowed Roles badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {collection.allowed_roles.length > 0 ? (
            collection.allowed_roles.map(role => (
              <span
                key={role}
                className="px-2 py-1 text-xs text-white/80 bg-white/10 rounded-full"
              >
                {role}
              </span>
            ))
          ) : (
            <span className="px-2 py-1 text-xs text-white/50 bg-white/5 rounded-full">
              No roles
            </span>
          )}
        </div>

        {/* Doc count & Created date */}
        <div className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Documents</span>
            <span className="font-mono text-emerald-400">{collection.doc_count ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Created</span>
            <span className="font-mono text-white/70">
              {collection.created_at ? new Date(collection.created_at).toLocaleDateString() : "-"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-auto">
          <Button variant="outline" className="flex-1" onClick={() => onAccessClick(collection)}>
            <User className="w-4 h-4 mr-2" /> Access
          </Button>
        </div>
      </div>
    </motion.div>
  );
};