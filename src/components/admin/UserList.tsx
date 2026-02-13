import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Loader2, CheckCircle, Users, Shield, Mail, User, Building2, 
  ChevronDown, ArrowLeft, Plus, Edit, Eye, Trash2, Lock 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  fetchOrganizations, 
  listCompanies,
  listUsersForTenant,
  signup 
} from '@/lib/api';
import { SignupPayload, MeResponse, OrganizationOut } from '@/lib/api';
import { useAuthStore } from '@/useAuthStore';

const allAssignableRoles = [
  'employee',
  'sub_hr',
  'sub_finance',
  'sub_operations',
  'sub_md',
  'sub_admin',
  'group_hr',
  'group_finance',
  'group_operation',
  'group_production',
  'group_marketing',
  'group_legal',
  'group_exe',
  'group_admin',
  'group_gmd',
] as const;

type AssignableRole = typeof allAssignableRoles[number];

interface Company {
  tenant_id: string;
  display_name?: string;
}

type CreateUserFormData = Omit<SignupPayload, 'tenant_id'>;

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const authStore = useAuthStore() as { user: MeResponse | null };
  const user = authStore.user;
  const isVendor = user?.role === 'vendor';
  
  // Main state
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationOut[]>([]);
  const [users, setUsers] = useState<MeResponse[]>([]);
  const [search, setSearch] = useState('');
  
  // Loading states
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Form state - ✅ COMPLETE with ALL SignupPayload fields
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createData, setCreateData] = useState<CreateUserFormData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone: '',
    role: '',
    organization_id: 0,
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const filteredUsers = useMemo(() => 
    users.filter(u => 
      `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    ),
    [users, search]
  );

  const tenantDisplayName = useMemo(() => 
    companies.find(c => c.tenant_id === selectedTenantId)?.display_name || selectedTenantId,
    [companies, selectedTenantId]
  );

  // ✅ FIXED: Type-safe validation - string vs number comparison
  const isFormValid = useMemo(() => {
    const trimmedEmail = createData.email.trim();
    const trimmedFirstName = createData.first_name?.trim();
    const trimmedPassword = createData.password.trim();
    
    return !!(
      trimmedEmail && 
      trimmedFirstName && 
      trimmedPassword && 
      trimmedPassword.length >= 8 &&
      createData.organization_id > 0 &&
      organizations.some(org => org.id.toString() === createData.organization_id.toString())
    );
  }, [createData, organizations]);

  // Auto-select tenant
  useEffect(() => {
    if (!isVendor && user?.tenant_id) {
      setSelectedTenantId(user.tenant_id.toString());
    }
  }, [isVendor, user?.tenant_id]);

  // ✅ FIXED: Safe org_id conversion
  useEffect(() => {
    if (organizations.length > 0) {
      const firstOrgId = Number(organizations[0].id);
      if (!isNaN(firstOrgId)) {
        setCreateData(prev => ({ ...prev, organization_id: firstOrgId }));
      }
    }
  }, [organizations]);

  // ✅ FIXED: Type-safe API handlers - no more 'any' or 'res?.data'
  const loadCompanies = useCallback(async () => {
    if (!isVendor) return;
    setCompaniesLoading(true);
    try {
      const res = await listCompanies();
      // ✅ Safe array extraction
      const payload = Array.isArray(res) ? res : [];
      setCompanies(payload);
      if (payload.length > 0 && !selectedTenantId) {
        setSelectedTenantId(payload[0].tenant_id);
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setCompaniesLoading(false);
    }
  }, [isVendor, selectedTenantId]);

  const loadOrganizations = useCallback(async (tenantId: string) => {
    if (!tenantId) return;
    setOrgsLoading(true);
    try {
      const res = await fetchOrganizations(tenantId);
      const payload = Array.isArray(res) ? res : [];
      setOrganizations(payload);
    } catch (error) {
      console.error('Failed to load organizations:', error);
      setOrganizations([]);
    } finally {
      setOrgsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (tenantId: string) => {
    if (!tenantId) return;
    setUsersLoading(true);
    try {
      const res = await listUsersForTenant(tenantId);
      const payload = Array.isArray(res) ? res : [];
      setUsers(payload);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    if (selectedTenantId) {
      loadOrganizations(selectedTenantId);
      fetchUsers(selectedTenantId);
    } else {
      setOrganizations([]);
      setUsers([]);
    }
  }, [selectedTenantId, loadOrganizations, fetchUsers]);

  // ✅ PERFECTLY typed signup call
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTenantId) {
      setCreateError('Please select a tenant first');
      return;
    }

    const trimmedEmail = createData.email.trim();
    const trimmedFirstName = createData.first_name?.trim();
    const trimmedPassword = createData.password.trim();
    
    if (!trimmedEmail || !trimmedFirstName) {
      setCreateError('Email and first name are required');
      return;
    }

    if (trimmedPassword.length < 8) {
      setCreateError('Password must be at least 8 characters');
      return;
    }

    const orgId = Number(createData.organization_id);
    if (isNaN(orgId) || orgId <= 0) {
      setCreateError('Please select a valid organization');
      return;
    }

    setCreating(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      const payload: SignupPayload = {
        email: trimmedEmail,
        password: trimmedPassword,
        first_name: trimmedFirstName,
        last_name: createData.last_name?.trim() || undefined,
        date_of_birth: createData.date_of_birth?.trim() || undefined,
        phone: createData.phone?.trim() || undefined,
        role: createData.role!,
        organization_id: orgId,
        tenant_id: Number(selectedTenantId),
      };

      await signup(payload);
      
      setCreateSuccess('✅ User created successfully!');
      
      setCreateData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        phone: '',
        role: '',
        organization_id: 0,
      });
      
      setTimeout(() => setCreateSuccess(''), 3000);
      await fetchUsers(selectedTenantId);
      
    } catch (error: any) {
      console.error('Create user failed:', error);
      const errorMsg = Array.isArray(error.response?.data)
        ? error.response.data.map((e: any) => e.msg).join(', ')
        : error.response?.data?.detail || 'Failed to create user';
      setCreateError(errorMsg);
    } finally {
      setCreating(false);
    }
  };

const getRoleIcon = (role?: string | null): React.ReactNode => {
  if (!role) return <User className="w-4 h-4" />;
  
  const roleLower = role.toLowerCase();
  
  // Admin-like roles
  if (roleLower.includes('admin') || roleLower.includes('gmd')) {
    return <Shield className="w-4 h-4" />;
  }
  
  // Group-level roles (executive/management)
  if (roleLower.startsWith('group_')) {
    return <Building2 className="w-4 h-4" />;
  }
  
  // Default user icon
  return <User className="w-4 h-4" />;
};

  if (!user) {
    return (
      <motion.div className="w-full h-full flex items-center justify-center p-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl p-12 max-w-md shadow-2xl"
        >
          <Users className="w-20 h-20 text-white/30 mx-auto mb-6" />
          <h2 className="text-2xl font-light text-white/70 mb-2">Please Login</h2>
          <Button onClick={() => navigate('/login')} className="h-14 px-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-2xl">
            Go to Login
          </Button>
        </motion.div>
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
              <h1 className="text-4xl lg:text-5xl font-light bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Users
              </h1>
              {selectedTenantId && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-xl flex items-center gap-2">
                    <span className="text-sm font-mono text-indigo-300">{tenantDisplayName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {isVendor && (
            <div className="relative max-w-md">
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                disabled={companiesLoading}
                className="w-full h-14 px-6 pr-12 text-lg font-light bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-white/20 rounded-3xl backdrop-blur-xl text-white placeholder-white/40 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-400/20 shadow-2xl hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] appearance-none cursor-pointer transition-all duration-300 disabled:opacity-50"
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
            disabled={!selectedTenantId || orgsLoading}
            className="h-16 px-12 text-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-3xl shadow-2xl hover:shadow-indigo-500/40 flex items-center gap-3 ml-auto disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-6 h-6" />
            New User
          </motion.button>
        </div>
      </motion.div>

      {/* Controls */}
      {selectedTenantId && (
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 px-6 text-lg font-light bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-white/20 rounded-3xl backdrop-blur-xl text-white placeholder-white/40 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-400/20 shadow-2xl hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300"
              />
          </div>
        </div>
      )}

      {/* Create User Modal */}
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
              <h2 className="text-3xl font-[500] bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                New User
              </h2>
              <motion.button
                onClick={() => setShowCreateForm(false)}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                whileHover={{ scale: 1.1 }}
                disabled={creating}
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

            <form onSubmit={handleCreateUser} className="space-y-6">
               <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="" className="block text-lg font-light text-white/80  mb-3 flex items-center gap-2" >
                      <Shield className="w-4 h-4" />
                      Organization
                    </label>
                  <select
                      value={createData.organization_id.toString()}
                      onChange={(e) => setCreateData(prev => ({ ...prev, organization_id: Number(e.target.value) || 0 }))}
                      disabled={orgsLoading || organizations.length === 0}
                      className="w-full h-14 px-6 pr-12 text-lg font-light bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-white/20 rounded-3xl backdrop-blur-xl text-white placeholder-white/40 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-400/20 shadow-2xl hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] appearance-none cursor-pointer transition-all duration-300 disabled:opacity-50"
                    >
                      <option value="0">Select Organization</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>
                          🏢 {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-light text-white/80 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    value={createData.first_name || ''}
                    onChange={(e) => setCreateData({ ...createData, first_name: e.target.value })}
                    className="w-full h-14 px-6 text-lg font-light bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-white/20 rounded-3xl backdrop-blur-xl text-white placeholder-white/40 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-400/20 shadow-2xl transition-all"
                    required
                    disabled={creating}
                  />
                </div>
                <div>
                  <label className="block text-lg font-light text-white/80 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={createData.last_name || ''}
                    onChange={(e) => setCreateData({ ...createData, last_name: e.target.value })}
                    className="w-full h-14 px-6 text-lg font-light bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-white/20 rounded-3xl backdrop-blur-xl text-white placeholder-white/40 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-400/20 shadow-2xl transition-all"
                    disabled={creating}
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-light text-white/80 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="john.doe@company.com"
                  value={createData.email}
                  onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                  className="w-full h-16 px-6 text-xl font-light bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-white/20 rounded-3xl backdrop-blur-xl text-white placeholder-white/40 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-400/20 shadow-2xl transition-all"
                  required
                  disabled={creating}
                />
              </div>

              <div>
                <label className="block text-lg font-light text-white/80 mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={createData.password}
                  onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                  className="w-full h-16 px-6 text-xl font-light bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-white/20 rounded-3xl backdrop-blur-xl text-white placeholder-white/40 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-400/20 shadow-2xl transition-all"
                  required
                  minLength={8}
                  disabled={creating}
                  autoComplete="new-password"
                />
                <p className="text-xs text-white/50 mt-2">User will be prompted to change this on first login</p>
              </div>

             <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-light text-white/80 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Role
                </label>
                <select
                  value={createData.role}
                  onChange={(e) => setCreateData({ ...createData, role: e.target.value as AssignableRole })}
                  disabled={creating}
                  className="w-full h-14 px-6 pr-12 text-lg font-light bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-white/20 rounded-3xl backdrop-blur-xl text-white placeholder-white/40 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-400/20 shadow-2xl appearance-none transition-all"
                >
                  <option value="">Select Role</option>
                  {allAssignableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
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
                  disabled={creating || !isFormValid}
                  className="h-16 px-12 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-3xl flex-1 shadow-2xl flex items-center gap-3 disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-6 h-6" />
                      Create User
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Users Grid */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {usersLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
            >
              <Users className="w-10 h-10 text-white/40" />
            </motion.div>
            <p className="text-xl text-white/60">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <motion.div className="col-span-full flex flex-col items-center justify-center py-24 text-center backdrop-blur-sm bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-white/10 rounded-3xl p-12">
            <Users className="w-24 h-24 text-white/30 mb-6 animate-pulse" />
            <h3 className="text-2xl font-light text-white/70 mb-2">No Users Yet</h3>
            <p className="text-lg text-white/50 mb-8 max-w-md">
              {selectedTenantId 
                ? `Create your first user for ${tenantDisplayName}`
                : 'Select a tenant above to get started'
              }
            </p>
            {selectedTenantId && organizations.length > 0 && (
              <motion.button
                onClick={() => setShowCreateForm(true)}
                className="h-14 px-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-3xl shadow-2xl flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <Plus className="w-6 h-6" />
                Create First User
              </motion.button>
            )}
          </motion.div>
        ) : (
          filteredUsers.map((userItem, index) => (
            <motion.div
              key={userItem.id.toString()}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/2 hover:from-white/10 hover:to-white/5 border border-white/10 hover:border-white/20 rounded-3xl shadow-2xl hover:shadow-3xl overflow-hidden h-full transition-all duration-500 hover:-translate-y-2"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-white/20 rounded-2xl">
                    {getRoleIcon(userItem.role)}
                    <span className="font-mono text-sm text-white/70 capitalize">{userItem.role}</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-[500] mb-1 leading-tight line-clamp-2 text-white">
                      {userItem.first_name} {userItem.last_name}
                    </h3>
                    <p className="text-indigo-300 font-mono text-sm truncate">{userItem.email}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-mono ${
                      userItem.is_active 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-400/30'
                    }`}>
                      {userItem.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Joined</span>
                    <span className="font-mono text-white/70 text-sm">
                      {userItem.created_at ? new Date(userItem.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-6 border-t border-white/10">
                  <Button variant="outline" size="sm" className="flex-1 h-12 border-white/20 bg-gradient-to-r from-slate-800/80 to-slate-900/80 hover:bg-white/10 rounded-2xl font-medium text-sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" className="h-12 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-2xl font-medium text-sm shadow-lg">
                    <Edit className="w-4 h-4" />
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

export default UserList;
