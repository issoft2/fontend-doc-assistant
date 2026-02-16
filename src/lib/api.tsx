'use client';

import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../useAuthStore'; // Your auth store

// ---- Axios instance ----
export const api: AxiosInstance = axios.create({
  baseURL:  '/api',
  timeout: 30000, // 30s timeout
});

console.log('Axios baseURL:', api.defaults.baseURL);

// ---- Types ----
export interface MeResponse {
  id: number;
  email: string;
  role: string;
  tenant_id: string;
  organization_id: string;
  roles: string[];
  permissions: string[];
  first_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null;
  phone?: string | null;
  is_active?: boolean;
  created_at?: string;
  is_online?: boolean;
  last_login_at?: string | null;
  last_seen_at?: string | null;
  [key: string]: unknown;
}

export interface ConfigureCompanyPayload {
  tenant_id: string;
  plan: 'free_trial' | 'starter' | 'pro' | 'enterprise';
  subscription_status: 'trialing' | 'active' | 'expired' | 'cancelled';
}

export interface UploadDocumentPayload {
  collectionName: string;
  title?: string;
  file: File;
  doc_id?: string;
  tenant_id: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  tenant_id?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  phone?: string;
  role?: string;
  organization_id: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface QueryPoliciesPayload {
  question: string;
  topK?: number;
  conversationId?: string | null;
}

export interface ListDriveFilesParams {
  folder_id?: string;
}

export interface IngestDriveFilePayload {
  fileId: string;
  collectionName: string;
  title: string;
  tenant_id: string;
}

export interface OrganizationOut {
  id: string;
  tenant_id: string;
  name: string;
}

export interface CollectionOut {
  id: string;
  tenant_id: string;
  name: string;
  organization_id: string;
  doc_count: number;
  visibility: 'tenant' | 'org' | 'role' | 'user';
  allowed_roles: string[];
  allowed_user_ids: string[];
  created_at: string; 
  updated_at: string;
  tenant_name: string;
  organization_name: string;
}

export interface CreateOrganizationPayload {
  name: string;
}


// ---- USER MANAGEMENT (uses existing SignupPayload) ----
export function createUserForTenant(tenant_id: string, payload: Omit<SignupPayload, 'tenant_id'>) {
  return api.post('/auth/signup/', { tenant_id, ...payload });
}

export function listUsersForTenant() {
  return api.get('/company/users')
}


// ---- Auth token helper ----
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  } else {
    delete api.defaults.headers.common.Authorization;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }
}

// Restore token on startup (client-side only)
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('access_token');
  if (saved) {
    api.defaults.headers.common.Authorization = `Bearer ${saved}`;
  }
}

// ---- Auth request interceptor ----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Global response interceptor ----
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token if refresh logic exists
        // await refreshToken();
        setAuthToken(null);
        
        // Redirect to login (client-side only)
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 403) {
      setAuthToken(null);
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ---- Utility Functions ----
export function removeAuthToken() {
  delete api.defaults.headers.common.Authorization;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
}

// ---- Auth APIs ----
export function me() {
  return api.get<MeResponse>('/auth/me');
}

export function login({ email, password }: LoginPayload) {
  const data = new URLSearchParams();
  data.append('username', email);
  data.append('password', password);
  return api.post('/auth/login', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}

export function apiLogout() {
  return api.post('/auth/logout');
}

export function apiHeartbeat() {
  return api.post('/auth/users/heartbeat');
}

export function signup(payload: SignupPayload) {
  return api.post('/auth/signup', {
    ...payload,
    ...(payload.tenant_id != null ? { tenant_id: payload.tenant_id } : {}),
  });
}


export function firstLoginVerify(payload: { token: string }) {
  return api.post('/auth/first-login/verify', payload);
}

export function firstLoginSetPassword(payload: { token: string; new_password: string }) {
  return api.post('/auth/first-login/set-password', payload);
}

// ---- Chat / Conversations ----
export function queryPolicies({
  question,
  topK = 5,
  conversationId,
}: QueryPoliciesPayload) {
  return api.post('/query', {
    question,
    top_k: topK,
    conversation_id: conversationId,
  });
}

export function listConversations() {
  return api.get('/conversations');
}

export function getConversation(conversationId: string) {
  return api.get(`/conversations/${conversationId}`);
}

export function deleteConversation(conversationId: string) {
  return api.delete(`/conversations/${conversationId}`);
}

// ---- Companies / Collections ----
export function configureTenantPayload(payload: ConfigureCompanyPayload) {
  return api.post('/companies/configure', payload);
}

export function listCompanies() {
  return api.get('/companies');
}

export async function fetchOrganizations(tenant_id: string): Promise<OrganizationOut[]> {
  const { data } = await api.get<OrganizationOut[]>('/organizations', {
    params: { tenant_id },
  });
  return data;
}

export async function listCollectionsForTenant(tenant_id: string): Promise<CollectionOut[]> {
  const { data } = await api.get<CollectionOut[]>('collections', {
    params: { tenant_id },
  });
  return data;
}

export function listCollectionsForOrg() {
  return api.get('/collections/by-org');
}

export function createCollection({ name }: { name: string }) {
  return api.post('/collections', { name });
}

export function createOrganization(payload: CreateOrganizationPayload) {
  return api.post<OrganizationOut>('/organizations', payload);
}

export function createOrganizationForTenant(tenant_id: string, payload: CreateOrganizationPayload) {
  return api.post<OrganizationOut>('/organizations', {
    tenant_id,
    ...payload,
  });
}

export function createCollectionForOrganization(payload: {
  tenant_id: string;
  organization_id: string | null;
  name: string;
  visibility: 'tenant' | 'org' | 'role' | 'user';
  allowed_roles: string[];
  allowed_user_ids: string[];
}) {
  return api.post('/collections/create', payload);
}

export async function getCollectionAccess(collectionId: string | number) {
  const res = await api.get(`/collections/${collectionId}/access`);
  return res;
}

export async function updateCollectionAccess(
  collectionId: string | number,
  payload: {
    allowed_user_ids: string[];
    allowed_roles: string[];
  }
) {
  const res = await api.put(`/collections/${collectionId}/access`, payload);
  return res;
}

// ---- Company Users ----
export function listCompanyUsers() {
  return api.get('/company/users');
}

export function getCompanyUser(userId: string) {
  return api.get(`/company/users/${userId}`);
}

export function updateCompanyUser(userId: string, payload: Record<string, unknown>) {
  return api.put(`/company/users/${userId}`, payload);
}

export function toggleCompanyUserActive(userId: string) {
  return api.post(`/company/users/${userId}/toggle-active`);
}

export function listOrgTenantUsers() {
  return api.get('/organizations/users');
}

// ---- Documents ----
export function uploadDocument({
  collectionName,
  title,
  file,
  doc_id,
  tenant_id,
}: UploadDocumentPayload) {
  const formData = new FormData();
  formData.append('collection_name', collectionName);
  formData.append('tenant_id', tenant_id);
  if (title) formData.append('title', title);
  if (doc_id) formData.append('doc_id', doc_id);
  formData.append('file', file);

  return api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// ---- Google Drive ----
export function getGoogleDriveAuthUrl() {
  return api.get('/google-drive/auth-url');
}

export function getGoogleDriveStatus() {
  return api.get('/google-drive/status');
}

export function listDriveFiles(params?: ListDriveFilesParams) {
  return api.get('/google-drive/files', { params: params || {} });
}

export function ingestDriveFile(payload: IngestDriveFilePayload) {
  return api.post('/google-drive/ingest', payload);
}

export function disconnectGoogleDriveApi() {
  return api.post('/google-drive/disconnect');
}

// ---- Misc ----
export function sendContact(payload: Record<string, unknown>) {
  return api.post('/contact', payload);
}

// ---- Custom React Hook for API calls ----
export function useApi() {
  const { logout } = useAuthStore();

  const execute = async <T = any>(
    config: AxiosRequestConfig,
    options?: { skipAuthRedirect?: boolean }
  ): Promise<T> => {
    try {
      const response = await api.request<T>(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401 && !options?.skipAuthRedirect) {
          logout();
        }
      }
      throw error;
    }
  };

  return { execute };
}
