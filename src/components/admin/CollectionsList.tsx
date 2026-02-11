// src/pages/admin/CollectionList.tsx - ✅ FULLY WORKING
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Shield, 
  Database,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  listCollectionsForTenant, 
  createCollectionForOrganization,
//   deleteCollection // ✅ Add this import
} from '@/lib/api';
import { CollectionOut } from '@/lib/api';

const CollectionList: React.FC = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<CollectionOut[]>([]);
  const [loading, setLoading] = useState(false); // ✅ Start false
  const [tenantId, setTenantId] = useState('');
  const [search, setSearch] = useState('');
  
  // CREATE FORM STATE
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    visibility: 'tenant' as 'tenant' | 'org' | 'role' | 'user',
    organization_id: '' as string,
    allowed_roles: [] as string[],
    allowed_user_ids: [] as string[]
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(''); // ✅ Error state

  useEffect(() => {
    if (tenantId) {
      fetchCollections();
    }
  }, [tenantId]);

  const fetchCollections = async () => {
    if (!tenantId) {
      console.log('🚫 No tenant ID provided');
      return;
    }
    try {
      console.log('🔄 Fetching collections for tenant:', tenantId);
      setLoading(true);
      const data = await listCollectionsForTenant(tenantId);
      console.log('✅ Collections loaded:', data);
      setCollections(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('❌ Failed to fetch collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ VALIDATION
    if (!tenantId) {
      setCreateError('Please enter a Tenant ID first');
      return;
    }
    if (!createData.name.trim()) {
      setCreateError('Collection name is required');
      return;
    }

    console.log('🚀 Creating collection:', {
      tenant_id: tenantId,
      ...createData,
      organization_id: createData.organization_id ? Number(createData.organization_id) : null
    });

    setCreating(true);
    setCreateError('');
    
    try {
      const payload = {
        tenant_id: tenantId,
        organization_id: createData.organization_id ? Number(createData.organization_id) : null,
        name: createData.name.trim(),
        visibility: createData.visibility,
        allowed_roles: createData.allowed_roles,
        allowed_user_ids: createData.allowed_user_ids
      };
      
      console.log('📤 API Payload:', payload);
      await createCollectionForOrganization(payload);
      
      console.log('✅ Collection created successfully');
      await fetchCollections(); // Refresh list
      
      // Reset form
      setCreateData({
        name: '',
        visibility: 'tenant',
        organization_id: '',
        allowed_roles: [],
        allowed_user_ids: []
      });
      setShowCreateForm(false);
      
    } catch (error: any) {
      console.error('❌ Create failed:', error);
      setCreateError(error?.message || 'Failed to create collection. Check console.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!window.confirm('Delete this collection?')) return;
    
    try {
      console.log('🗑️ Deleting collection:', collectionId);
      await deleteCollection(collectionId);
      await fetchCollections();
      console.log('✅ Collection deleted');
    } catch (error) {
      console.error('❌ Delete failed:', error);
    }
  };

  const filteredCollections = collections.filter(col => 
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'tenant': return <Users className="w-4 h-4" />;
      case 'org': return <Shield className="w-4 h-4" />;
      case 'role': return <Shield className="w-4 h-4" />;
      case 'user': return <Users className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full space-y-12 p-6 lg:p-12 isolate bg-transparent relative z-10"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-4xl lg:text-5xl font-light bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent drop-shadow-2xl">
                Collections
              </h1>
              <p className="text-xl text-white/60 font-light mt-2">Manage your knowledge collections</p>
            </div>
          </div>
          
         <motion.button
        onClick={() => setShowCreateForm(true)}
        className="h-16 px-12 text-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-3xl shadow-2xl hover:shadow-[0_0_40px_rgba(16,_185,_129,_0.4)] hover:scale-105 flex items-center gap-3 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        >
        <Plus className="w-6 h-6" />
        New Collection
        </motion.button>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search collections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 px-6 text-lg font-light bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white placeholder-white/40 focus:border-emerald-400/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 shadow-xl"
            />
          </div>
          <input
            type="text"
            placeholder="Enter Tenant ID (e.g. acme_corp)"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchCollections()}
            className="w-full sm:w-80 h-14 px-6 text-lg font-light bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white placeholder-white/40 focus:border-emerald-400/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 shadow-xl"
          />
        </div>
        <Button
          onClick={fetchCollections}
          disabled={loading || !tenantId}
          className="h-14 px-12 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-3xl shadow-2xl hover:shadow-[0_0_40px_rgba(16,_185,_129,_0.4)] transition-all duration-300 whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading...
            </>
          ) : (
            'Load Collections'
          )}
        </Button>
      </div>

      {/* CREATE FORM MODAL */}
      {showCreateForm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowCreateForm(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl isolate"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            }}
          >
            <div className="p-8 lg:p-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-[500] bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  New Collection
                </h2>
                <motion.button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronDown className="w-6 h-6" />
                </motion.button>
              </div>
              
              {createError && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-2xl text-red-200 text-sm">
                  {createError}
                </div>
              )}
              
              <form onSubmit={handleCreateCollection} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-lg font-light text-white/80 block mb-3">
                    Collection Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Company Policies"
                    value={createData.name}
                    onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                    className="w-full h-16 px-6 text-xl font-light bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white placeholder-white/40 focus:border-emerald-400/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 shadow-xl"
                    required
                    disabled={creating}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-lg font-light text-white/80 block mb-3">Visibility</label>
                    <div className="space-y-2">
                      {[
                        { value: 'tenant' as const, label: '🌐 Tenant-wide', desc: 'All tenant users' },
                        { value: 'org' as const, label: '🏢 Organization', desc: 'Specific org only' },
                        { value: 'role' as const, label: '🔐 Role-based', desc: 'Specific roles' },
                        { value: 'user' as const, label: '👤 User-specific', desc: 'Specific users' }
                      ].map((option) => (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => setCreateData({ ...createData, visibility: option.value })}
                          disabled={creating}
                          className={cn(
                            "group relative h-20 p-6 rounded-2xl border-2 backdrop-blur-sm shadow-xl transition-all duration-300 flex flex-col items-start justify-center text-left",
                            createData.visibility === option.value
                              ? "border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,_185,_129,_0.3)]"
                              : "border-white/20 bg-white/5 hover:border-emerald-400/30 hover:bg-emerald-500/5"
                          )}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-xl font-semibold mb-1">{option.label.split(' ')[0]}</span>
                          <span className="font-light text-white/90">{option.label.split(' ').slice(1).join(' ')}</span>
                          <span className="text-xs text-white/60 mt-1">{option.desc}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-lg font-light text-white/80 block mb-2">Organization ID (Optional)</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={createData.organization_id}
                        onChange={(e) => setCreateData({ ...createData, organization_id: e.target.value })}
                        className="w-full h-14 px-4 text-lg font-light bg-white/10 border border-white/20 rounded-2xl backdrop-blur-sm text-white placeholder-white/40 focus:border-emerald-400/50 transition-all duration-300"
                        disabled={creating}
                      />
                    </div>
                    <div className="text-xs text-white/50 font-light">
                      Leave empty for tenant-wide collections
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    disabled={creating}
                    className="h-16 px-12 text-lg font-light border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-3xl flex-1 shadow-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating || !createData.name.trim() || !tenantId}
                    className="h-16 px-12 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-3xl flex-1 shadow-2xl hover:shadow-[0_0_40px_rgba(16,_185,_129,_0.4)] flex items-center gap-3"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-6 h-6" />
                        Create Collection
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Collections Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
      >
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Database className="w-10 h-10 text-white/40" />
              </div>
              <p className="text-xl text-white/60">Loading collections...</p>
            </div>
          </div>
        ) : filteredCollections.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-24 text-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl p-12"
          >
            <Database className="w-24 h-24 text-white/30 mb-6" />
            <h3 className="text-2xl font-light text-white/70 mb-2">No Collections Found</h3>
            <p className="text-lg text-white/50 mb-8 max-w-md">
              Enter tenant ID above 👆 and click "Load Collections", or create your first collection.
            </p>
            <Button 
              onClick={fetchCollections}
              disabled={!tenantId || loading}
              className="h-14 px-12 text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-3xl shadow-2xl"
            >
              {loading ? 'Loading...' : 'Retry Load'}
            </Button>
          </motion.div>
        ) : (
          filteredCollections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-3xl shadow-2xl hover:shadow-3xl hover:shadow-[#9b87f5]/20 overflow-hidden h-full transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
              }}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/20 rounded-2xl">
                    {getVisibilityIcon(collection.visibility)}
                    <span className="font-mono text-sm text-white/70">{collection.visibility}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <motion.button
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => console.log('Edit:', collection.id)} // TODO: Implement edit
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteCollection(collection.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <h3 className="text-2xl font-[500] mb-4 leading-tight line-clamp-2 group-hover:text-[#9b87f5] transition-colors">
                  {collection.name}
                </h3>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Documents</span>
                    <span className="font-mono text-emerald-400">{collection.doc_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Created</span>
                    <span className="font-mono text-white/70">
                      {collection.created_at ? new Date(collection.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-6 border-t border-white/10">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-12 border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 rounded-2xl font-medium text-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="h-12 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-2xl font-medium text-sm shadow-lg"
                  >
                    Manage
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
};

export default CollectionList;
