import type { Variants } from 'framer-motion';

// ── Domain types ─────────────────────────────────────────────────────────────
export interface TenantOption {
  tenant_id: number;
  name?: string | null;
  role?: string | null;
}

export interface LoginResponse {
  requires_tenant_selection?: boolean;
  tenants?: TenantOption[];
}

// ── Shared animation variants ────────────────────────────────────────────────
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit:   { opacity: 0, x: -60, transition: { duration: 0.3, ease: 'easeIn' } },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit:   { opacity: 0, x: 60, transition: { duration: 0.3, ease: 'easeIn' } },
};