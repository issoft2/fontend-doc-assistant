import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../useAuthStore';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { listCompanies } from '@/lib/api';

interface Company {
  tenant_id: string;
  display_name?: string;
  plan?: string;
  subscription_status?: string;
  trial_ends_at?: string;
  created_at: string;
}

// ✅ FIXED: Extended User interface
interface User {
  role?: string | null;
  tenant_id?: string | null;
  [key: string]: any;
}

interface TenantListProps {
  className?: string;
}

const TenantsList: React.FC<TenantListProps> = ({ className = '' }) => {
  // ✅ FIXED: Type assertion for useAuthStore
  const authStore = useAuthStore() as { user: User | null };
  const user = authStore.user;
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastLoadedAt, setLastLoadedAt] = useState('');

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listCompanies();
      const payload = Array.isArray(res) ? res : res?.data;
      setCompanies(payload || []);
      setLastLoadedAt(new Date().toLocaleTimeString());
    } catch (e: any) {
      console.error('loadCompanies error:', e);
      setError(e?.response?.data?.detail || 'Failed to load tenants.');
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDate = (value: string) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };

  const planBadgeClass = (plan?: string) => {
    switch (plan) {
      case 'free_trial': return 'bg-amber-100 text-amber-800';
      case 'starter': return 'bg-sky-100 text-sky-800';
      case 'pro': return 'bg-indigo-100 text-indigo-800';
      case 'enterprise': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const statusBadgeClass = (status?: string) => {
    switch (status) {
      case 'trialing': return 'bg-amber-100 text-amber-800';
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'expired': return 'bg-rose-100 text-rose-800';
      case 'cancelled': return 'bg-slate-200 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // ✅ FIXED: Safe RBAC with type guards
  const isVendor = user?.role === 'vendor';
  const userTenantId = user?.tenant_id || '';
  
  // RBAC: Vendor sees ALL tenants, others see only their own
  const visibleCompanies = companies.filter(company => {
    if (isVendor) return true;
    return company.tenant_id === userTenantId;
  });

  if (loading) {
    return (
      <div className={cn("bg-white border rounded-xl shadow-sm p-6", className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm text-slate-500">Loading tenants...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 max-w-6xl mx-auto py-6", className)}>
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Tenants</h1>
          <p className="text-sm text-slate-500">
            {isVendor 
              ? 'All registered tenants (Vendor view)'
              : userTenantId ? `Your tenant: ${userTenantId}` : 'No tenant assigned'
            }
          </p>
        </div>
        <Button onClick={loadCompanies} disabled={loading} variant="default">
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </header>

      {/* Tenants Table */}
      <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">Tenants</span>
            <span className="text-[11px] text-slate-500">
              {visibleCompanies.length} total
            </span>
          </div>
          {lastLoadedAt && (
            <div className="text-[11px] text-slate-400">
              Last updated: {lastLoadedAt}
            </div>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 text-xs text-red-600 border-t border-slate-200">
            {error}
          </div>
        )}

        {!visibleCompanies.length && !loading && !error && (
          <div className="px-4 py-6 text-sm text-slate-500 text-center">
            {isVendor
              ? 'No tenants found yet. Create tenants on the Configuration page.'
              : 'No tenants accessible to your account.'
            }
          </div>
        )}

        {visibleCompanies.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Company / Tenant
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Plan & Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {visibleCompanies.map((company) => (
                  <tr key={company.tenant_id} className="hover:bg-slate-50">
                    {/* Company Info */}
                    <td className="px-4 py-3 max-w-md">
                      <div className="font-medium text-slate-900">
                        {company.display_name || company.tenant_id}
                      </div>
                      <div className="text-xs text-slate-500">
                        ID: {company.tenant_id}
                      </div>
                    </td>

                    {/* Plan & Status */}
                    <td className="px-4 py-3 text-xs space-y-1">
                      <div className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                        planBadgeClass(company.plan)
                      )}>
                        {company.plan || '—'}
                      </div>
                      <div className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                        statusBadgeClass(company.subscription_status)
                      )}>
                        {company.subscription_status || 'unknown'}
                      </div>
                      {company.trial_ends_at && (
                        <div className="text-[11px] text-slate-500">
                          Trial ends: {formatDate(company.trial_ends_at)}
                        </div>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="px-4 py-3 text-xs">
                      <div>{formatDate(company.created_at)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default TenantsList;
