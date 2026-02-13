// src/pages/admin/CollectionList.tsx - ✅ PERFECT & PRODUCTION READY
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Building2 } from 'lucide-react';
import { 
  Plus, Eye, Users, Shield, Database, ArrowLeft, ChevronDown 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  fetchOrganizations, 
  listCollectionsForTenant, 
  createCollectionForOrganization,
  listCompanies 
} from '@/lib/api';
import { CollectionOut, OrganizationOut } from '@/lib/api';
import { useAuthStore } from '@/useAuthStore';

interface User {
  role?: string | null;
  tenant_id?: string | null;
  organization_id?: string| null;
  [key: string]: any;
}

interface Company {
  tenant_id: string;
  display_name?: string;
}

const CollectionList: React.FC = () => {
  const navigate = useNavigate();
  const authStore = useAuthStore() as { user: User | null };
  const user = authStore.user;
  const isVendor = user?.role === 'vendor';
  
  // ✅ SAME TENANT LOGIC AS OrganizationsList
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);
  
  // Organization & Collections
  const [organizations, setOrganizations] = useState<OrganizationOut[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [collections, setCollections] = useState<CollectionOut[]>([]);
  const [search, setSearch] = useState('');
  
  // Loading states
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  
  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    visibility: 'tenant' as 'tenant' | 'org' | 'role' | 'user',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // ✅ Auto-select tenant for non-vendors (SAME AS OrganizationsList)
  useEffect(() => {
    if (!isVendor && user?.tenant_id) {
      setSelectedTenantId(user.tenant_id);
    }
  }, [isVendor, user?.tenant_id]);

  // Load companies for vendor (SAME AS OrganizationsList)
  const loadCompanies = useCallback(async () => {
    if (!isVendor) return;
    setCompaniesLoading(true);
    try {
      const res: any = await listCompanies();
      const payload = Array.isArray(res) ? res : res?.data || [];
      setCompanies(Array.isArray(payload) ? payload : []);
      if (payload.length > 0 && !selectedTenantId) {
        setSelectedTenantId(payload[0].tenant_id);
      }
    } catch (e: any) {
      console.error('Failed to load companies:', e);
    } finally {
      setCompaniesLoading(false);
    }
  }, [isVendor, selectedTenantId]);

  // Load organizations for tenant (SAME AS OrganizationsList)
  const loadOrganizations = useCallback(async (tenantId: string) => {
    if (!tenantId) return;
    setOrgsLoading(true);
    try {
      const res: any = await fetchOrganizations(tenantId);
      const payload = Array.isArray(res) ? res : res?.data || res || [];
      setOrganizations(Array.isArray(payload) ? payload : []);
    } catch (e: any) {
      console.error('Failed to load orgs:', e);
      setOrganizations([]);
    } finally {
      setOrgsLoading(false);
    }
  }, []);

  // Load collections for tenant
  const fetchCollections = useCallback(async (tenantId: string) => {
    if (!tenantId) return;
    setCollectionsLoading(true);
    try {
      const res: any = await listCollectionsForTenant(tenantId);
      const payload = Array.isArray(res) ? res : res?.data || res || [];
      setCollections(Array.isArray(payload) ? payload : []);
    } catch (e: any) {
      console.error('Failed to load collections:', e);
      setCollections([]);
    } finally {
      setCollectionsLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    if (selectedTenantId) {
      loadOrganizations(selectedTenantId);
      fetchCollections(selectedTenantId);
    } else {
      setOrganizations([]);
      setCollections([]);
    }
  }, [selectedTenantId]);


const handleCreateCollection = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!selectedTenantId) {
    setCreateError('Please select a tenant first');
    return;
  }
  
  if (!createData.name.trim()) {
    setCreateError('Collection name required');
    return;
  }

  setCreating(true);
  setCreateError('');
  setCreateSuccess('');

  try {
    const payload = {
      tenant_id: selectedTenantId,
      // ✅ FIXED: Convert string → number | null (matches API type)
      organization_id: selectedOrgId ? parseInt(selectedOrgId, 10) : null,
      name: createData.name.trim(),
      visibility: createData.visibility,
      allowed_roles: [] as string[],  // ✅ Type assertion for empty arrays
      allowed_user_ids: [] as string[],
    };

    console.log('📤 Creating collection:', payload);
    await createCollectionForOrganization(payload);
    
    setCreateSuccess('✅ Collection created successfully!');
    setCreateData({ name: '', visibility: 'tenant' });
    setSelectedOrgId('');
    await fetchCollections(selectedTenantId);
    
  } catch (error: any) {
    console.error('❌ Create failed:', error);
    const errorMsg = Array.isArray(error.response?.data)
      ? error.response.data.map((e: any) => e.msg).join(', ')
      : error.response?.data?.detail || 'Failed to create collection';
    setCreateError(errorMsg);
  } finally {
    setCreating(false);
  }
};


  const filteredCollections = collections.filter(col => 
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  const tenantDisplayName = companies.find(c => c.tenant_id === selectedTenantId)?.display_name || selectedTenantId;
  const selectedOrg = organizations.find(org => org.id === selectedOrgId);

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'tenant': return <Users className="w-4 h-4" />;
      case 'org': return <Shield className="w-4 h-4" />;
      case 'role': return <Shield className="w-4 h-4" />;
      case 'user': return <Users className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <motion.div className="w-full h-full flex items-center justify-center p-12">
        <div className="text-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl p-12 max-w-md">
          <Database className="w-20 h-20 text-white/30 mx-auto mb-6" />
          <h2 className="text-2xl font-light text-white/70 mb-2">Please Login</h2>
          <Button onClick={() => navigate('/login')} className="h-14 px-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl">
            Go to Login
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="w-full h-full space-y-12 p-6 lg:p-12 isolate bg-transparent relative z-10">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-3 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-4xl lg:text-5xl font-light bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                Collections
              </h1>
              {selectedTenantId && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-xl flex items-center gap-2">
                    <span className="text-sm font-mono text-emerald-300">{tenantDisplayName}</span>
                  </div>
                  {selectedOrg && (
                    <div className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-xl">
                      <Building2 className="w-4 h-4" />
                      <span className="text-xs font-mono text-blue-300">{selectedOrg.name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Vendor Tenant Selector */}
          {isVendor && (
            <div className="relative max-w-md">
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                disabled={companiesLoading}
                className="w-full h-14 px-6 pr-12 text-lg font-light 
                          bg-gradient-to-r from-slate-800/90 to-slate-900/90 
                          border border-white/20 rounded-3xl backdrop-blur-xl 
                          text-white placeholder-white/40 
                          focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/20 
                          shadow-2xl hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
                          appearance-none cursor-pointer transition-all duration-300
                          disabled:opacity-50"
              >
                <option value="">Select Tenant</option>
                {companies.map(company => (
                  <option key={company.tenant_id} value={company.tenant_id}>
                    {company.display_name || company.tenant_id}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-white/50 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          <motion.button
            onClick={() => setShowCreateForm(true)}
            disabled={!selectedTenantId}
            className="h-16 px-12 text-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-3xl shadow-2xl hover:shadow-emerald-500/40 flex items-center gap-3 ml-auto disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-6 h-6" />
            New Collection
          </motion.button>
        </div>
      </motion.div>

      {/* Controls */}
      {selectedTenantId && (
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Organization
              </label>
              <div className="relative">
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  disabled={orgsLoading}
                  className="w-full h-14 px-6 pr-12 text-lg font-light 
                            bg-gradient-to-r from-slate-800/90 to-slate-900/90 
                            border border-white/20 rounded-3xl backdrop-blur-xl 
                            text-white placeholder-white/40 
                            focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/20 
                            shadow-2xl hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
                            appearance-none cursor-pointer transition-all duration-300
                            disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">🌐 Tenant-wide</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      🏢 {org.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-5 h-5 text-white/50 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search collections..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 px-6 text-lg font-light bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-white/20 rounded-3xl backdrop-blur-xl text-white placeholder-white/40 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/20 shadow-2xl hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
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
            className="w-full max-w-lg backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)' }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-[500] bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                New Collection
              </h2>
              <motion.button
                onClick={() => setShowCreateForm(false)}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                whileHover={{ scale: 1.1 }}
              >
                <ChevronDown className="w-6 h-6" />
              </motion.button>
            </div>

            {createError && (
              <motion.div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-2xl">
                <p className="text-red-200 font-medium">{createError}</p>
              </motion.div>
            )}
            
            {createSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-200 font-medium">{createSuccess}</span>
              </motion.div>
            )}

            <form onSubmit={handleCreateCollection} className="space-y-6">
              <div className="space-y-2">
                <label className="text-lg font-light text-white/80 block mb-3">
                  Collection Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Company Policies, HR Manual..."
                  value={createData.name}
                  onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                  className="w-full h-16 px-6 text-xl font-light bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-white/20 rounded-3xl backdrop-blur-xl text-white placeholder-white/40 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/20 shadow-2xl transition-all"
                  required
                  disabled={creating}
                />
              </div>

              <div className="space-y-3">
                <label className="text-lg font-light text-white/80 block mb-4">Visibility</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'tenant', label: '🌐 Tenant-wide', desc: 'All tenant users' },
                    { value: 'org', label: '🏢 Organization', desc: selectedOrg ? `${selectedOrg.name} users` : 'Org users' },
                    { value: 'role', label: '🔐 Role-based', desc: 'Specific roles' },
                    { value: 'user', label: '👤 User-specific', desc: 'Selected users' }
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => setCreateData({ ...createData, visibility: option.value as any })}
                      disabled={creating}
                      className={cn(
                        "h-24 p-6 rounded-2xl border-2 backdrop-blur-sm shadow-xl flex flex-col items-start justify-center text-left transition-all",
                        createData.visibility === option.value
                          ? "border-emerald-400/50 bg-emerald-500/10 shadow-emerald-500/30"
                          : "border-white/20 bg-gradient-to-r from-slate-800/80 to-slate-900/80 hover:border-emerald-400/30 hover:bg-emerald-500/10"
                      )}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-xl font-semibold mb-1">{option.label.split(' ')[0]}</span>
                      <span className="font-light text-white/90 text-sm">{option.label.split(' ').slice(1).join(' ')}</span>
                      <span className="text-xs text-white/60 mt-1">{option.desc}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                  className="h-16 px-12 text-lg border-white/20 bg-gradient-to-r from-slate-800/80 to-slate-900/80 hover:bg-white/10 rounded-3xl flex-1 shadow-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating || !createData.name.trim() || !selectedTenantId}
                  className="h-16 px-12 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-3xl flex-1 shadow-2xl flex items-center gap-3"
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
          </motion.div>
        </motion.div>
      )}

      {/* Collections Grid */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {collectionsLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
            >
              <Database className="w-10 h-10 text-white/40" />
            </motion.div>
            <p className="text-xl text-white/60">Loading collections...</p>
          </div>
        ) : filteredCollections.length === 0 ? (
          <motion.div className="col-span-full flex flex-col items-center justify-center py-24 text-center backdrop-blur-sm bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-white/10 rounded-3xl p-12">
            <Database className="w-24 h-24 text-white/30 mb-6 animate-pulse" />
            <h3 className="text-2xl font-light text-white/70 mb-2">No Collections Yet</h3>
            <p className="text-lg text-white/50 mb-8 max-w-md">
              {selectedTenantId 
                ? `Create your first collection for ${tenantDisplayName}`
                : 'Select a tenant above to get started'
              }
            </p>
            {selectedTenantId && (
              <motion.button
                onClick={() => setShowCreateForm(true)}
                className="h-14 px-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-3xl shadow-2xl flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <Plus className="w-6 h-6" />
                Create First Collection
              </motion.button>
            )}
          </motion.div>
        ) : (
          filteredCollections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/2 hover:from-white/10 hover:to-white/5 border border-white/10 hover:border-white/20 rounded-3xl shadow-2xl hover:shadow-3xl overflow-hidden h-full transition-all duration-500 hover:-translate-y-2"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-white/20 rounded-2xl">
                    {getVisibilityIcon(collection.visibility)}
                    <span className="font-mono text-sm text-white/70 capitalize">{collection.visibility}</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-[500] mb-4 leading-tight line-clamp-2 group-hover:text-emerald-400 transition-colors">
                  {collection.name}
                </h3>
                
                <div className="space-y-3 mb-8 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Documents</span>
                    <span className="font-mono text-emerald-400">{collection.doc_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Created</span>
                    <span className="font-mono text-white/70">
                      {collection.created_at ? new Date(collection.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-6 border-t border-white/10">
                  <Button variant="outline" size="sm" className="flex-1 h-12 border-white/20 bg-gradient-to-r from-slate-800/80 to-slate-900/80 hover:bg-white/10 rounded-2xl font-medium text-sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" className="h-12 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-2xl font-medium text-sm shadow-lg">
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
