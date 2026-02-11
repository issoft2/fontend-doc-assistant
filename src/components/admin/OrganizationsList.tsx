import React, { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../../useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { 
//   Select, 
//   SelectContent, 
//   SelectItem, 
//   SelectTrigger, 
//   SelectValue 
// } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Auto-select tenant for non-vendors
  useEffect(() => {
    if (!isVendor && user?.tenant_id) {
      setSelectedTenantId(user.tenant_id);
    }
  }, [isVendor, user?.tenant_id]);

  // Load companies for vendor tenant selection
  const loadCompanies = useCallback(async () => {
    if (!isVendor) return;
    setCompaniesLoading(true);
    try {
      const res = await listCompanies();
      const payload = Array.isArray(res) ? res : res?.data;
      setCompanies(payload || []);
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
      const res = await fetchOrganizations(tenantId);
      const payload = Array.isArray(res) ? res : res?.data;
      setOrganizations(payload || []);
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
      const res = await createOrganizationForTenant(selectedTenantId, {
        name: orgName.trim(),
      });
      const newOrg = Array.isArray(res) ? res[0] : res?.data;
      
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
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organizations</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isVendor 
              ? 'Manage organizations across all tenants'
              : `Managing organizations for: ${tenantDisplayName}`
            }
          </p>
        </div>
        {isVendor && companies.length > 0 && (
          <div className="text-sm text-slate-500">
            Active tenant: <span className="font-semibold text-slate-900">{tenantDisplayName}</span>
          </div>
        )}
      </header>

      {/* Create Form */}
     <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Create New Organization
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleCreateOrganization} className="grid gap-6 md:grid-cols-3 items-end">
            {/* ✅ NATIVE SELECT - ZERO ERRORS */}
            {isVendor && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Tenant <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full h-11 px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  disabled={companiesLoading || companies.length === 0}
                >
                  <option value="">Select tenant</option>
                  {companies.map((company) => (
                    <option key={company.tenant_id} value={company.tenant_id}>
                      {company.display_name || company.tenant_id}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Organization Name */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Helium Group, Lagos Clinic, Finance Dept"
                className="h-11 text-sm"
                required
                disabled={!selectedTenantId || orgLoading}
              />
            </div>

            {/* Rest of form SAME */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => {
                setOrgName(''); setOrgMessage(''); setOrgError('');
              }} className="h-11 px-6" disabled={orgLoading}>
                Reset Form
              </Button>
              <Button
                type="submit"
                disabled={orgLoading || !selectedTenantId || !orgName.trim()}
                className="h-11 px-8"
              >
                {orgLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Organization'
                )}
              </Button>
            </div>
          </form>

          {/* Messages */}
          {(orgMessage || orgError) && (
            <div className={cn(
              "mt-4 p-3 rounded-lg text-sm border",
              orgMessage ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
            )}>
              {orgMessage || orgError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Load Organizations */}
      {selectedTenantId && (
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <Button
              onClick={() => loadOrganizations(selectedTenantId)}
              disabled={loading || orgLoading}
              variant="outline"
              className="w-full h-12 justify-center text-sm font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading organizations...
                </>
              ) : (
                <>
                  <span className="w-4 h-4 bg-indigo-500 rounded-full mr-2" />
                  🔄 Refresh Organizations List
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Organizations List */}
      {organizations.length > 0 && selectedTenantId && (
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Organizations ({organizations.length})
            </CardTitle>
            <p className="text-sm text-slate-500">
              Tenant: <span className="font-medium">{tenantDisplayName}</span>
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="divide-y divide-slate-100 rounded-lg">
              {organizations.map((org, index) => (
                <div 
                  key={org.id} 
                  className="px-6 py-4 hover:bg-slate-50/50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-sm" />
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{org.name}</p>
                        <p className="text-xs text-slate-500">ID: {org.id}</p>
                      </div>
                    </div>
                    {canManageOrgs() && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs border-slate-200 group-hover:border-slate-300 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Manage
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty States */}
      {!selectedTenantId && isVendor && !companiesLoading && (
        <Card className="border-2 border-dashed border-slate-200 text-center">
          <CardContent className="pt-12 pb-8">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏢</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Tenant Selected</h3>
            <p className="text-sm text-slate-500 mb-6">
              Select a tenant from the dropdown above to create and manage organizations
            </p>
          </CardContent>
        </Card>
      )}

      {selectedTenantId && organizations.length === 0 && !loading && (
        <Card className="border-2 border-dashed border-slate-200 text-center">
          <CardContent className="pt-12 pb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Organizations Yet</h3>
            <p className="text-sm text-slate-500 mb-6">
              Create your first organization for <strong>{tenantDisplayName}</strong> using the form above
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganizationsList;
