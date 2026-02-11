// stores/useAuthStore.ts
'use client'; // Add this for Next.js
// apiHeartbeat
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { setAuthToken, removeAuthToken, login as apiLogin, me as apiMe, apiLogout } from './lib/api';

export interface MeResponse {
  id: number;
  email: string;
  permissions: string[];
  // ... other fields
}

interface AuthState {
  accessToken: string | null;
  user: MeResponse | null;
}

interface AuthActions {
  login: (payload: { email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
}

type Store = AuthState & AuthActions;

export const useAuthStore = create<Store>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      
      login: async ({ email, password }) => {
        const { data } = await apiLogin({ email, password });
        const token = data.access_token;
        
        if (token) {
          setAuthToken(token);
          set({ accessToken: token });
          
          const { data: user } = await apiMe();
          set({ user });
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        return data;
      },
      
      logout: async () => {
        try {
          await apiLogout();
        } catch {}
        
        set({ accessToken: null, user: null });
        removeAuthToken();
        
        // ✅ Fix 1: Wrap in window check + proper syntax
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage), // ✅ Fix 2: Add storage
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
    }
  )
);
