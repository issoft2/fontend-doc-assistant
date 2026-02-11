import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  fetchOrganizations, 
  createOrganizationForTenant,
  listCompanies 
} from '@/lib/api';

interface Organization {
  id: string;
  name: string;
}

interface Company {
  tenant_id: string;
  display_name?: string;
}

interface User {
  role?: string | null;
  tenant_id?: string | null;
  [key: string]: any;
}

const OrganizationsList: React.FC = () => {
  const authStore = useAuthStore() as { user: User | null };
  const user = authStore.user;
  const isVendor = user?.role === 'vendor';
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgMessage, setOrgMessage] = useState('');
  const [orgError, setOrgError] = useState('');

  useEffect(() => {
    if (!isVendor && user?.tenant_id) {
      setSelectedTenantId(user.tenant_id);
    }
  }, [isVendor, user?.tenant_id]);

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

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const loadOrganizations = useCallback(async (tenantId: string) => {
    if (!tenantId) return;
    setLoading(true);
    setOrgError('');
    try {
      const res: any = await fetchOrganizations(tenantId);
      const payload = Array.isArray(res) ? res : res?.data || res || [];
      setOrganizations(Array.isArray(payload) ? payload : []);
    } catch (e: any) {
      setOrgError(e?.response?.data?.detail || 'Failed to load organizations.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateOrganization = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId || !orgName.trim()) return;

    setOrgMessage('');
    setOrgError('');
    setOrgLoading(true);

    try {
      const res: any = await createOrganizationForTenant(selectedTenantId, {
        name: orgName.trim(),
      });
      const newOrg = Array.isArray(res) ? res[0] : res?.data || res;
      setOrganizations(prev => [...prev, newOrg]);
      setOrgName('');
      setOrgMessage('✅ Organization created successfully.');
    } catch (e: any) {
      setOrgError(e?.response?.data?.detail || 'Failed to create organization.');
    } finally {
      setOrgLoading(false);
    }
  }, [selectedTenantId, orgName]);

  const canManageOrgs = () => {
    if (isVendor) return true;
    return user?.tenant_id === selectedTenantId;
  };

  const tenantDisplayName = companies.find(c => c.tenant_id === selectedTenantId)?.display_name || selectedTenantId;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto py-12 space-y-12"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-10 text-center"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#9b87f5]/20 to-purple-600/20 border border-[#9b87f5]/30 mb-8 backdrop-blur-sm shadow-lg">
          <span className="w-2.5 h-2.5 bg-gradient-to-r from-[#9b87f5] to-purple-500 rounded-full shadow-md animate-pulse" />
          <h1 className="text-4xl font-light bg-gradient-to-r from-white via-[#9b87f5] to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
            Organizations
          </h1>
        </div>
        <p className="text-xl text-white/60 font-light max-w-3xl mx-auto leading-relaxed">
          {isVendor 
            ? 'Manage organizations across all your tenants with precision control'
            : `Managing organizations for: <span className="text-[#9b87f5] font-light">${tenantDisplayName}</span>`
          }
        </p>
      </motion.div>

      {/* Create Form */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-[#0a0613]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative group"
        style={{
          background: 'linear-gradient(145deg, rgba(10, 6, 19, 0.95) 0%, rgba(21, 13, 39, 0.95) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Animated border glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5]/20 via-transparent to-purple-600/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition-all duration-500" />
        
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full shadow-sm animate-pulse" />
            <h2 className="text-2xl font-light text-white drop-shadow-lg">Create Organization</h2>
          </div>

          <form onSubmit={handleCreateOrganization} className="grid gap-8 md:grid-cols-3 items-end">
            {/* Tenant Selection - Vendor Only */}
            {isVendor && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <label className="flex items-center gap-2 text-sm font-light text-white/80 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-sm" />
                  Tenant <span className="text-[#9b87f5]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                    disabled={companiesLoading || companies.length === 0}
                    className="w-full h-16 px-6 py-4 text-lg font-light bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm text-white placeholder-white/40 focus:border-[#9b87f5]/50 focus:ring-4 focus:ring-[#9b87f5]/20 focus:bg-white/10 shadow-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(155,_135,_245,_0.2)] appearance-none cursor-pointer"
                  >
                    <option value="">Choose tenant...</option>
                    {companies.map((company) => (
                      <option key={company.tenant_id} value={company.tenant_id}>
                        {company.display_name || company.tenant_id}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/40">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Organization Name */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 space-y-4"
            >
              <label className="flex items-center gap-2 text-sm font-light text-white/80 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-indigo-400/80 rounded-full shadow-sm" />
                Organization Name <span className="text-[#9b87f5]">*</span>
              </label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Helium Group, Lagos Clinic, Finance Dept..."
                className="w-full h-16 px-6 py-4 text-lg font-light bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm text-white placeholder-white/40 focus:border-[#9b87f5]/50 focus:ring-4 focus:ring-[#9b87f5]/20 focus:bg-white/10 shadow-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(155,_135,_245,_0.2)]"
                required
                disabled={!selectedTenantId || orgLoading}
              />
            </motion.div>

            {/* Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                type="button"
                onClick={() => {
                  setOrgName(''); 
                  setOrgMessage(''); 
                  setOrgError('');
                }}
                disabled={orgLoading}
                className="flex-1 h-16 px-8 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-sm text-white/70 font-light shadow-xl hover:shadow-[0_0_20px_rgba(255,_255,_255,_0.1)] hover:border-white/30 hover:text-white transition-all duration-300 hover:bg-white/10"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Reset Form
              </motion.button>
              <motion.button
                type="submit"
                disabled={orgLoading || !selectedTenantId || !orgName.trim()}
                className="flex-1 h-16 px-10 bg-gradient-to-r from-[#9b87f5] to-purple-600 text-white font-light shadow-2xl hover:shadow-[0_0_40px_rgba(155,_135,_245,_0.6)] hover:from-[#9b87f5]/90 hover:to-purple-600/90 transition-all duration-300 rounded-3xl border-2 border-[#9b87f5]/50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {orgLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-4 animate-spin" />
                    <span className="font-light">Creating...</span>
                  </>
                ) : (
                  <>
                    <span className="font-light">Create Organization</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Messages */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 space-y-4"
          >
            {orgMessage && (
              <motion.div 
                className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-400/40 backdrop-blur-sm shadow-xl text-emerald-100 font-light text-lg shadow-emerald-500/25 flex items-center gap-4"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
              >
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                {orgMessage}
              </motion.div>
            )}
            {orgError && (
              <motion.div 
                className="p-6 rounded-3xl bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-400/40 backdrop-blur-sm shadow-xl text-red-100 font-light text-lg shadow-red-500/25 flex items-center gap-4"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
              >
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                {orgError}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Refresh Button */}
      {selectedTenantId && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={() => loadOrganizations(selectedTenantId)}
            disabled={loading || orgLoading}
            className="w-full h-20 px-8 rounded-3xl bg-gradient-to-r from-[#9b87f5]/20 to-purple-600/20 border border-[#9b87f5]/30 backdrop-blur-sm text-white font-light shadow-xl hover:shadow-[0_0_30px_rgba(155,_135,_245,_0.4)] hover:border-[#9b87f5]/50 hover:bg-[#9b87f5]/30 transition-all duration-300 flex items-center justify-center gap-4 text-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="font-light">Loading organizations...</span>
              </>
            ) : (
              <>
                <span className="w-3 h-3 bg-gradient-to-r from-[#9b87f5] to-purple-500 rounded-full shadow-md animate-ping" />
                <span className="font-light">🔄 Refresh Organizations List</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Organizations List */}
      {organizations.length > 0 && selectedTenantId && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/3 border border-white/5 shadow-2xl rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          }}
        >
          <div className="backdrop-blur-sm bg-white/5 border-b border-white/10 px-10 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full shadow-sm animate-pulse" />
                <div>
                  <h3 className="text-3xl font-light text-white drop-shadow-lg">Organization Directory</h3>
                  <p className="text-lg text-white/60 font-light mt-1">
                    Tenant: <span className="text-[#9b87f5]">{tenantDisplayName}</span> • {organizations.length} organizations
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/5 p-2">
            {organizations.map((org, index) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group hover:bg-white/5 transition-all duration-500 p-10 hover:shadow-[0_0_25px_rgba(155,_135,_245,_0.15)]"
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-2xl font-light text-white drop-shadow-lg group-hover:text-[#9b87f5] transition-colors truncate">
                        {org.name}
                      </h4>
                      <p className="text-lg text-white/60 font-light flex items-center gap-2 mt-1">
                        <span className="font-mono text-sm text-[#9b87f5] bg-white/10 px-3 py-1 rounded-2xl backdrop-blur-sm">
                          {org.id}
                        </span>
                      </p>
                    </div>
                  </div>
                  {canManageOrgs() && (
                    <motion.button
                      className="opacity-0 group-hover:opacity-100 px-6 py-3 h-auto bg-gradient-to-r from-slate-600/20 to-slate-700/20 border border-slate-400/30 backdrop-blur-sm text-white/70 font-light rounded-2xl shadow-lg hover:shadow-[0_0_20px_rgba(155,_135,_245,_0.2)] hover:border-[#9b87f5]/30 hover:text-white transition-all duration-300 whitespace-nowrap"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Manage
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty States */}
      {!selectedTenantId && isVendor && !companiesLoading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-20 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          }}
        >
          <div className="w-28 h-28 bg-gradient-to-r from-[#9b87f5]/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-12 border border-[#9b87f5]/30 shadow-2xl animate-pulse">
            <span className="text-5xl">🏢</span>
          </div>
          <h2 className="text-4xl font-light mb-6 text-white bg-gradient-to-r from-white to-[#9b87f5] bg-clip-text text-transparent drop-shadow-2xl">
            No Tenant Selected
          </h2>
          <p className="text-xl text-white/50 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
            Select a tenant from the dropdown above to create and manage organizations
          </p>
        </motion.div>
      )}

      {selectedTenantId && organizations.length === 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-20 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          }}
        >
          <div className="w-28 h-28 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-3xl flex items-center justify-center mx-auto mb-12 border border-emerald-400/30 shadow-2xl animate-bounce">
            <span className="text-5xl">✨</span>
          </div>
          <h2 className="text-4xl font-light mb-6 text-white bg-gradient-to-r from-white to-[#9b87f5] bg-clip-text text-transparent drop-shadow-2xl">
            No Organizations Yet
          </h2>
          <p className="text-xl text-white/50 font-light max-w-2xl mx-auto leading-relaxed">
            Create your first organization for <strong className="text-[#9b87f5]">{tenantDisplayName}</strong> using the form above
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OrganizationsList;
