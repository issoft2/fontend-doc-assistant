// schema.ts
import { z } from 'zod';

export const tenantSchema = z.object({
  tenantId: z
    .string()
    .min(3, 'Tenant ID must be at least 3 characters')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers and underscores'),

  tenantName: z.string().optional(),

  tenantPlan: z.enum([
    'free_trial',
    'starter',
    'pro',
    'enterprise',
  ]),

  tenantSubscriptionStatus: z.enum([
    'trialing',
    'active',
    'expired',
    'cancelled',
  ]),
});

export type TenantFormData = z.infer<typeof tenantSchema>;
