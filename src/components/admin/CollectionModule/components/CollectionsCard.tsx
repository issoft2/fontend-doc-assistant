import { Button } from "@/components/ui/button";
import { CollectionOut } from "@/lib/api";
import { motion } from 'framer-motion';
import { Database, Eye, Shield, User, Users } from "lucide-react";
import React from "react";

interface Props {
    collection: CollectionOut
    index: number
    onAccessClick: (collection: CollectionOut) => void
}

const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'tenant': return <Users className="w-4 h-4" />;
      case 'org': return <Shield className="w-4 h-4" />;
      case 'role': return <Shield className="w-4 h-4" />;
      case 'user': return <Users className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

export const CollectionCard: React.FC<Props> = ({
    collection,
    index,
    onAccessClick,
}) => {
    return (
        <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05}}
            className="group backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-3xl shadow-2xl overflow-hidden h-full transition-all duration-500 hover:-translate-y-2"
        >

            <div className="p-8">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/80 border border-white/20 rounded-2xl mb-6">
                    {getVisibilityIcon(collection.visibility)}
                    <span className="font-mono text-sm text-white/70 capitalize">
                      {collection.visibility}
                    </span>
                </div>

                <h3 className="text-2xl font-medium mb-4 line-clamp-2">
                    {collection.name}
                </h3>

                <div className="space-y-3 mb-8 text-sm">
                    <div className="flex justify-between">
                        <span className="text-white/60" >Document</span>
                        <span className="font-mono text-emirald-400">
                            {collection.doc_count ?? 0}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/60">Created</span>
                        <span className="font-mono text-white/70">
                            {collection.created_at
                              ? new Date(collection.created_at).toLocaleDateString()
                              : '-'}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="flex-1" >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                    </button>
                    <button className="flex-1"  onClick={() => onAccessClick(collection)}>
                        <User className="w-4 h-4 mr-2" />
                        Access
                    </button>
                </div>
            </div>

        </motion.div>
    )
}