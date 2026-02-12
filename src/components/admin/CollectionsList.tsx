// src/pages/admin/CollectionList.tsx - ✅ SAME PATTERN AS OrganizationsList
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Building2 } from 'lucide-react';
import { Plus, Eye, Users, Shield, Database, ArrowLeft, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  fetchOrganizations, 
  listCollectionsForTenant, 
  createCollectionForOrganization
} from '@/lib/api';
import { CollectionOut, OrganizationOut, listCompanies } from '@/lib/api';
import { useAuthStore } from '@/useAuthStore'; // ✅ SAME AS OrganizationsList

interface User {
  role?: string | null;
  tenant_id?: string | null;
  organization_id?: number | null;
  [key: string]: any;
}

const CollectionList: React.FC = () => {
  const navigate = useNavigate();
  const authStore = useAuthStore() as { user: User | null };
  const user = authStore.user;
  const isVendor = user?.role === 'vendor'; // ✅ SAME LOGIC
  
  // ✅ SAME TENANT LOGIC AS OrganizationsList
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [companies, setCompanies] = useState<any[]>([]);

  // Auto-select tenant for non-vendors (SAME AS OrganizationsList)
  useEffect(() => {
    if (!isVendor && user?.tenant_id) {
      setSelectedTenantId(user.tenant_id.toString());
    }
  }, [isVendor, user?.tenant_id]);

  // Organization selection
  const [organizations, setOrganizations] = useState<OrganizationOut[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [orgsLoading, setOrgsLoading] = useState(false);
  
  const [collections, setCollections] = useState<CollectionOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // CREATE FORM
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    visibility: 'tenant' as 'tenant' | 'org' | 'role' | 'user',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Load companies for vendor tenant selection (SAME AS OrganizationsList)
  const loadCompanies = useCallback(async () => {
    if (!isVendor) return;
    try {
      const res: any = await listCompanies();
      const payload = Array.isArray(res) ? res : res?.data || [];
      setCompanies(Array.isArray(payload) ? payload : []);
      if (payload.length > 0 && !selectedTenantId) {
        setSelectedTenantId(payload[0].tenant_id);
      }
    } catch (e: any) {
      console.error('Failed to load companies:', e);
    }
  }, [isVendor, selectedTenantId]);

  // Load tenant's organizations (SAME AS OrganizationsList)
  const loadOrganizations = useCallback(async (tenantId: string) => {
    if (!tenantId) return;
    try {
      setOrgsLoading(true);
      const res: any = await fetchOrganizations(tenantId);
      const payload = Array.isArray(res) ? res : res?.data || res || [];
      setOrganizations(Array.isArray(payload) ? payload : []);
    } catch (e: any) {
      console.error('Failed to load orgs:', e);
    } finally {
      setOrgsLoading(false);
    }
  }, []);

  // Load collections (SAME SAFE HANDLING)
  const fetchCollections = useCallback(async (tenantId: string) => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const res: any = await listCollectionsForTenant(tenantId);
      const payload = Array.isArray(res) ? res : res?.data || res || [];
      setCollections(Array.isArray(payload) ? payload : []);
    } catch (e: any) {
      console.error('Failed to load collections:', e);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data when tenant changes
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
    if (!selectedTenantId || !createData.name.trim()) return;

    setCreating(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      const payload = {
        tenant_id: selectedTenantId,
        organization_id: selectedOrgId ? parseInt(selectedOrgId) : null,
        name: createData.name.trim(),
        visibility: createData.visibility,
        allowed_roles: [],
        allowed_user_ids: [],
      };

      await createCollectionForOrganization(payload);
      setCreateSuccess('✅ Collection created successfully!');
      setCreateData({ name: '', visibility: 'tenant' });
      await fetchCollections(selectedTenantId);
    } catch (e: any) {
      setCreateError(e?.response?.data?.detail || 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const filteredCollections = collections.filter(col => 
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  const tenantDisplayName = companies.find(c => c.tenant_id === selectedTenantId)?.display_name || selectedTenantId;
  const selectedOrg = organizations.find(org => org.id === selectedOrgId);

  if (!user) {
    return <div>Please login</div>;
  }

  return (
    <motion.div className="w-full h-full space-y-12 p-6 lg:p-12">
      {/* Header with Tenant Selector (Vendors Only) */}
      <motion.div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <motion.button onClick={() => navigate(-1)} className="p-3 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-4xl lg:text-5xl font-light bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                Collections
              </h1>
              {isVendor && selectedTenantId && (
                <div className="flex items-center gap-2 mt-2 text-sm text-white/70">
                  Tenant: <span className="font-mono text-emerald-300">{tenantDisplayName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Vendor Tenant Selector */}
          {isVendor && (
            <div className="relative">
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="h-14 px-6 text-lg bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white"
              >
                <option value="">Select Tenant</option>
                {companies.map(company => (
                  <option key={company.tenant_id} value={company.tenant_id}>
                    {company.display_name || company.tenant_id}
                  </option>
                ))}
              </select>
            </div>
          )}

          <motion.button
            onClick={() => setShowCreateForm(true)}
            className="h-16 px-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-3xl shadow-2xl ml-auto flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <Plus className="w-6 h-6" />
            New Collection
          </motion.button>
        </div>
      </motion.div>

      {/* Organization Selector + Search */}
      {selectedTenantId && (
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-white/80 mb-3">
              Organization (Optional)
            </label>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              disabled={orgsLoading}
              className="w-full h-14 px-4 pr-10 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white"
            >
              <option value="">🌐 Tenant-wide</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>🏢 {org.name}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Search collections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-md h-14 px-6 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white"
          />
        </div>
      )}

      {/* Collections Grid */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-24">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mr-4" />
            <span>Loading collections...</span>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="col-span-full text-center py-24">
            <Database className="w-24 h-24 text-white/30 mx-auto mb-6" />
            <h3 className="text-2xl text-white/70 mb-2">No Collections</h3>
            <p className="text-white/50 mb-8">Select a tenant above to get started</p>
          </div>
        ) : (
          filteredCollections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:shadow-3xl transition-all"
            >
              <h3 className="text-2xl font-light mb-4">{collection.name}</h3>
              <div className="text-sm text-white/60 mb-6">
                Documents: {collection.doc_count || 0} • 
                Visibility: {collection.visibility}
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">View</Button>
                <Button>Manage</Button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Create Modal - Simplified for brevity */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-light text-white">New Collection</h2>
              <button onClick={() => setShowCreateForm(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCollection} className="space-y-6">
              <input
                placeholder="Collection Name"
                value={createData.name}
                onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                className="w-full h-16 px-6 bg-white/10 border border-white/20 rounded-3xl text-white"
                required
              />
              <Button 
                type="submit" 
                disabled={creating || !selectedTenantId}
                className="w-full h-16 bg-gradient-to-r from-emerald-500 to-teal-600"
              >
                {creating ? 'Creating...' : 'Create Collection'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CollectionList;
