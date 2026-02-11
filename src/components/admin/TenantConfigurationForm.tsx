import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { configureTenantPayload } from '@/lib/api';

interface User {
  role?: string | null;
  tenant_id?: string;
  [key: string]: any;
}

interface TenantConfigFormProps {
  className?: string;
}

const TenantConfigForm: React.FC<TenantConfigFormProps> = ({ className = '' }) => {
  const { user } = useAuthStore() as { user: User | null };
  const isVendor = user?.role === 'vendor';

  // Form state
  const [tenantId, setTenantId] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantPlan, setTenantPlan] = useState<'free_trial' | 'starter' | 'pro' | 'enterprise'>('free_trial');
  const [tenantSubscriptionStatus, setTenantSubscriptionStatus] = useState<'trialing' | 'active' | 'expired' | 'cancelled'>('trialing');
  const [configureLoading, setConfigureLoading] = useState(false);
  const [configureMessage, setConfigureMessage] = useState('');
  const [configureError, setConfigureError] = useState('');

  // Reset form on vendor change
  useEffect(() => {
    if (!isVendor) {
      setTenantId('');
      setTenantName('');
      setTenantPlan('free_trial');
      setTenantSubscriptionStatus('trialing');
      setConfigureMessage('');
      setConfigureError('');
    }
  }, [isVendor]);

  const handleConfigure = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isVendor) return;

    setConfigureMessage('');
    setConfigureError('');
    setConfigureLoading(true);

    try {
      await configureTenantPayload({
        tenant_id: tenantId.trim(),
        plan: tenantPlan,
        subscription_status: tenantSubscriptionStatus,
      });
      
      setConfigureMessage(`Tenant "${tenantId}" configured successfully.`);
      
      // Reset form
      setTenantId('');
      setTenantName('');
      setTenantPlan('free_trial');
      setTenantSubscriptionStatus('trialing');
    } catch (error: any) {
      setConfigureError(error?.response?.data?.detail || 'Failed to configure tenant');
    } finally {
      setConfigureLoading(false);
    }
  };

  if (!isVendor) {
    return (
      <Card className={cn("border rounded-xl shadow-sm p-4 md:p-5", className)}>
        <CardContent className="pt-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Company configuration
          </h2>
          <p className="text-xs text-slate-500">
            Company creation is managed by the vendor. You can upload documents into
            existing collections for your company if your role allows it.
          </p>
          {user?.tenant_id && (
            <p className="text-xs text-slate-600 mt-2">
              Your company / tenant:{' '}
              <span className="font-semibold">{user.tenant_id}</span>
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border rounded-xl shadow-sm p-4 md:p-5 space-y-4", className)}>
      <CardHeader className="pb-4 space-y-1">
        <CardTitle className="text-sm font-semibold text-slate-900">
          Configure company / tenant
        </CardTitle>
        <p className="text-xs text-slate-500">
          Only vendor can provision or configure a company/tenant.
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <form onSubmit={handleConfigure} className="grid gap-3 md:grid-cols-4 items-end">
          {/* Tenant ID */}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-xs font-medium text-slate-700">
              Company / Tenant ID <span className="text-red-500">*</span>
            </label>
            <Input
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              type="text"
              placeholder="e.g. acme_corp"
              required
            />
            <p className="text-[11px] text-slate-400">
              Stable identifier used in API calls and routing.
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-xs font-medium text-slate-700">
              Company name (display)
            </label>
            <Input
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              type="text"
              placeholder="e.g. Acme Corporation"
            />
            <p className="text-[11px] text-slate-400">
              Optional friendly name shown in the UI.
            </p>
          </div>

          {/* Plan - NATIVE SELECT */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Plan</label>
            <select
              value={tenantPlan}
              onChange={(e) => setTenantPlan(e.target.value as typeof tenantPlan)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="free_trial">Free trial</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {/* Subscription Status - NATIVE SELECT */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Subscription status
            </label>
            <select
              value={tenantSubscriptionStatus}
              onChange={(e) => setTenantSubscriptionStatus(e.target.value as typeof tenantSubscriptionStatus)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="trialing">Trialing</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Trial Info */}
          <div className="space-y-1 md:col-span-2">
            <p className="text-[11px] text-slate-500">
              For <span className="font-semibold">free_trial</span> tenants with status{' '}
              <span className="font-semibold">trialing</span>, the backend computes and stores
              the trial end date.
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end md:col-span-4 gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setTenantId('');
                setTenantName('');
                setTenantPlan('free_trial');
                setTenantSubscriptionStatus('trialing');
              }}
              className="px-6"
            >
              Reset
            </Button>
            <Button 
              type="submit" 
              disabled={configureLoading || !tenantId.trim()}
              className="px-8"
            >
              {configureLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                'Create / update tenant'
              )}
            </Button>
          </div>
        </form>

        {/* Messages */}
        {configureMessage && (
          <p className="text-xs text-emerald-600 mt-3 px-1">{configureMessage}</p>
        )}
        {configureError && (
          <p className="text-xs text-red-600 mt-3 px-1">{configureError}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TenantConfigForm;
