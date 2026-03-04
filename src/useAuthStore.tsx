// stores/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  setAuthToken,
  removeAuthToken,
  login as apiLogin,
  me as apiMe,
  apiLogout,
  apiHeartbeat,
} from './lib/api';

export interface MeResponse {
  id: number;
  email: string;
  permissions: string[];
  role: string;
  tenant_id: string;
  // ... other fields
}

interface AuthState {
  accessToken: string | null;
  user: MeResponse | null;
}

interface AuthActions {
  login:         (payload: { email: string; password: string }) => Promise<any>;
  loginToTenant: (payload: { email: string; tenant_id: string }) => Promise<any>;
  logout:        () => Promise<void>;
  startHeartbeat: () => void;
}

type Store = AuthState & AuthActions;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getUserPermissions(user: MeResponse | null): string[] {
  return user?.permissions || [];
}

function hasAnyPermission(user: MeResponse | null, required: string[]): boolean {
  const current = getUserPermissions(user);
  return required.some((p) => current.includes(p));
}

function routeAfterLogin(user: MeResponse | null): void {
  const isAdminish = hasAnyPermission(user, [
    'USER:CREATE',
    'ORG:ADMIN',
    'ORG:CREATE:SUB',
    'COLLECTION:CREATE',
    'DOC:UPLOAD',
  ]);

  if (typeof window !== 'undefined') {
    window.location.href = isAdminish ? '/admin/companies' : '/chat';
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAuthStore = create<Store>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,

      // ── Heartbeat ───────────────────────────────────────────────────────────
      startHeartbeat: () => {
        apiHeartbeat().catch(() => {
          // ignore heartbeat errors in FE
        });
      },

      // ── Step 1 login (credentials) ──────────────────────────────────────────
      login: async ({ email, password }) => {
        const { data } = await apiLogin({ email, password });

        if (data.requires_tenant_selection) {
          // Phase 1: multi-tenant user must pick a company — no token yet
          return data;
        }

        const token: string | undefined = data.access_token;
        if (!token) throw new Error('No token returned from login');

        setAuthToken(token);
        set({ accessToken: token });

        const { data: user } = await apiMe();
        set({ user });
        localStorage.setItem('user', JSON.stringify(user));

        get().startHeartbeat();
        routeAfterLogin(user);

        return data;
      },

      // ── Step 2 login (tenant selection) ────────────────────────────────────
      loginToTenant: async ({ email, tenant_id }) => {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/auth/login/tenant`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, tenant_id }),
          }
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw { response: { data: err } };
        }

        const data = await response.json();
        const token: string | undefined = data.access_token;
        if (!token) throw new Error('No token returned from tenant login');

        setAuthToken(token);
        set({ accessToken: token });

        const { data: user } = await apiMe();
        set({ user });
        localStorage.setItem('user', JSON.stringify(user));

        get().startHeartbeat();
        routeAfterLogin(user);

        return data;
      },

      // ── Logout ──────────────────────────────────────────────────────────────
      logout: async () => {
        try {
          await apiLogout();
        } catch {
          // ignore logout errors
        }

        set({ accessToken: null, user: null });
        removeAuthToken();
        localStorage.removeItem('user');

        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
    }
  )
);