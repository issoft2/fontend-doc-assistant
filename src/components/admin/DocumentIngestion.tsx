// src/pages/admin/DocumentIngestion.tsx - COMPLETE INGESTION
import React, { useState, useEffect, useRef, useCallback, use } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Cloud,
  ChevronDown,
  CheckCircle,
  X,
  Folder 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  configureTenantPayload,
  uploadDocument,
  getGoogleDriveAuthUrl,
  getGoogleDriveStatus,
  listDriveFiles,
  ingestDriveFile,
  disconnectGoogleDriveApi,
  listCollectionsForOrg,
} from '@/lib/api';
import { useAuthStore } from '@/useAuthStore';

interface DriveFileOut {
  id: string;
  name: string;
  mime_type: string;
  is_folder: boolean;
  size?: number | null;
  modified_time?: string | null;
  already_ingested: boolean;
  is_supported: boolean;
}

type IngestStatus = 'idle' | 'running' | 'success' | 'error';

const DocumentIngestion: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auth/Permissions
  const {user} = useAuthStore();

  const currentUser = user ?? null;
  const currentTenantId = currentUser?.tenant_id ?? null;
  const permissions = currentUser?.permissions ?? [];


  const hasPermission = (p: string) => permissions.includes(p);


  const isVendor = currentUser?.role === 'vendor';

  const canUpload = hasPermission('DOC:UPLOAD');

  // Tenant Config (Vendor only)
  const [tenantId, setTenantId] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantPlan, setTenantPlan] = useState<'free_trial' | 'starter' | 'pro' | 'enterprise'>('free_trial');
  const [tenantSubscriptionStatus, setTenantSubscriptionStatus] = useState<'trialing' | 'active' | 'expired' | 'cancelled'>('trialing');
  const [configureLoading, setConfigureLoading] = useState(false);
  const [configureMessage, setConfigureMessage] = useState('');
  const [configureError, setConfigureError] = useState('');

  // Collections + Upload
  const [collections, setCollections] = useState<{id: string; name: string}[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState('');
  const [activeCollectionName, setActiveCollectionName] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Google Drive
  const [googleDriveStatus, setGoogleDriveStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [googleDriveEmail, setGoogleDriveEmail] = useState('');
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState('');
  const [driveIngestMessage, setDriveIngestMessage] = useState('');
  const [driveFiles, setDriveFiles] = useState<DriveFileOut[]>([]);
  const [selectedDriveFileIds, setSelectedDriveFileIds] = useState(new Set<string>());
  const [ingestStatusById, setIngestStatusById] = useState<Record<string, IngestStatus>>({});
  const [ingesting, setIngesting] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Load collections
  const loadCollectionsForOrg = useCallback(async () => {
    setCollectionsLoading(true);
    setCollectionsError('');
    try {
      const res = await listCollectionsForOrg();
      const data = Array.isArray(res) ? res : res?.data;
      setCollections((data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
      })));
    } catch (e: any) {
      console.error('Failed to load collections for org', e);
      setCollectionsError(e?.response?.data?.detail || 'Failed to load collections.');
      setCollections([]);
    } finally {
      setCollectionsLoading(false);
    }
  }, []);

  // Vendor: configure tenant
  const onConfigure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVendor) return;

    setConfigureMessage('');
    setConfigureError('');
    setConfigureLoading(true);
    
    try {
      await configureTenantPayload({
        tenant_id: tenantId,
        plan: tenantPlan,
        subscription_status: tenantSubscriptionStatus,
      });
      setConfigureMessage(`Tenant "${tenantId}" configured.`);
      setTenantId('');
      setTenantName('');
      setTenantPlan('free_trial');
      setTenantSubscriptionStatus('trialing');
    } catch (e: any) {
      setConfigureError(e?.response?.data?.detail || 'Failed to configure tenant');
    } finally {
      setConfigureLoading(false);
    }
  };

  // File upload handlers
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] || null;
    setFile(picked || null);
  };

  const onDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  // Upload document
  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadMessage('');
    setUploadError('');

    if (!canUpload) {
      setUploadError('Your role is not allowed to upload documents.');
      return;
    }
    if (!currentTenantId) {
      setUploadError('No tenant is associated with your account.');
      return;
    }
    if (!activeCollectionName) {
      setUploadError('Collection name is required.');
      return;
    }
    if (!file) {
      setUploadError('Please choose a file to upload.');
      return;
    }

    setUploadLoading(true);
    try {
      await uploadDocument({
        collectionName: activeCollectionName,
        title: docTitle,
        file: file,
        doc_id: '',
        tenant_id: currentTenantId,
      });
      setUploadMessage('Document uploaded and indexed successfully.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFile(null);
      setDocTitle('');
    } catch (e: any) {
      setUploadError(e?.response?.data?.detail || 'Failed to upload document.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Google Drive functions
  const connectGoogleDrive = async () => {
    try {
      const { data } = await getGoogleDriveAuthUrl();
      window.location.href = data.auth_url;
    } catch (e) {
      console.error('Failed to start Google Drive auth', e);
    }
  };

  const loadGoogleDriveStatus = async () => {
    try {
      const { data } = await getGoogleDriveStatus();
      setGoogleDriveStatus(data.connected ? 'connected' : 'disconnected');
      setGoogleDriveEmail(data.account_email || '');
    } catch (e) {
      console.error('Failed to load Google Drive status', e);
      setGoogleDriveStatus('disconnected');
      setGoogleDriveEmail('');
    }
  };

  const disconnectGoogleDrive = async () => {
    try {
      await disconnectGoogleDriveApi();
    } finally {
      await loadGoogleDriveStatus();
    }
  };

  const loadDriveFiles = async (folderId: string | null = null) => {
    setCurrentFolderId(folderId);
    setDriveLoading(true);
    setDriveError('');
    setDriveIngestMessage('');
    setSelectedDriveFileIds(new Set());
    
    try {
      const resp = await listDriveFiles(folderId ? { folder_id: folderId } : {});
      const files: DriveFileOut[] = resp.data || [];
      setDriveFiles(files);
      
      // Auto-select eligible files
      const eligible = files.filter(f => !f.is_folder && !f.already_ingested && f.is_supported);
      const initialSelection = new Set(eligible.map(f => f.id));
      setSelectedDriveFileIds(initialSelection);
    } catch (e) {
      console.error('Failed to load Drive files', e);
      setDriveError('Failed to load Google Drive files.');
      setDriveFiles([]);
    } finally {
      setDriveLoading(false);
    }
  };

  const toggleDriveFileSelection = (fileId: string) => {
    const next = new Set(selectedDriveFileIds);
    if (next.has(fileId)) next.delete(fileId);
    else next.add(fileId);
    setSelectedDriveFileIds(next);
  };

  const ingestSelectedDriveFiles = async () => {
    if (!canUpload || !currentTenantId || !activeCollectionName || selectedDriveFileIds.size === 0) {
      setDriveError('Cannot ingest: missing permissions, tenant, collection, or files.');
      return;
    }

    setIngesting(true);
    const ids = Array.from(selectedDriveFileIds);
    const statusMap: Record<string, IngestStatus> = {};
    ids.forEach(id => statusMap[id] = 'running');
    setIngestStatusById(statusMap);

    let successCount = 0;
    let errorCount = 0;

    for (const id of ids) {
      const fileObj = driveFiles.find(f => f.id === id);
      if (!fileObj) continue;

      try {
        await ingestDriveFile({
          fileId: fileObj.id,
          collectionName: activeCollectionName,
          title: fileObj.name,
          tenant_id: currentTenantId,
        });
        setIngestStatusById(prev => ({ ...prev, [id]: 'success' }));
        successCount++;
      } catch (e) {
        setIngestStatusById(prev => ({ ...prev, [id]: 'error' }));
        errorCount++;
      }
    }

    setDriveIngestMessage(`Ingested ${successCount} file(s) from Google Drive.${errorCount ? ' Some files failed.' : ''}`);
    await loadDriveFiles(currentFolderId);
    setSelectedDriveFileIds(new Set());
    setIngesting(false);
  };

  useEffect(() => {
    // Mock auth - replace with your auth context
    loadGoogleDriveStatus();
    loadCollectionsForOrg();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full space-y-12 p-6 lg:p-12 isolate bg-transparent relative z-10 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)' }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate(-1)}
            className="p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-4xl lg:text-5xl font-light bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              D Ingestion
            </h1>
            <p className="text-xl text-white/60 mt-2">Upload files and connect Google Drive</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 space-y-8 lg:space-y-0">
        {/* Vendor Tenant Config */}
        {isVendor && (
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12 overflow-hidden"
            style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)' }}
          >
            <h2 className="text-2xl font-[500] mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Tenant Configuration
            </h2>
            <form onSubmit={onConfigure} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-lg font-light text-white/80">Tenant ID <span className="text-emerald-400">*</span></label>
                  <input
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    className="w-full h-14 px-6 text-lg font-light bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white placeholder-white/40 focus:border-emerald-400/50 shadow-xl"
                    placeholder="acme_corp"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-lg font-light text-white/80">Display Name</label>
                  <input
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="w-full h-14 px-6 text-lg font-light bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white placeholder-white/40 focus:border-emerald-400/50 shadow-xl"
                    placeholder="Acme Corporation"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-lg font-light text-white/80">Plan</label>
                  <select
                    value={tenantPlan}
                    onChange={(e) => setTenantPlan(e.target.value as any)}
                    className="w-full h-14 px-6 text-lg font-light bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white focus:border-emerald-400/50 shadow-xl"
                  >
                    <option value="free_trial">Free Trial</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-lg font-light text-white/80">Subscription Status</label>
                  <select
                    value={tenantSubscriptionStatus}
                    onChange={(e) => setTenantSubscriptionStatus(e.target.value as any)}
                    className="w-full h-14 px-6 text-lg font-light bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white focus:border-emerald-400/50 shadow-xl"
                  >
                    <option value="trialing">Trialing</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <Button
                type="submit"
                disabled={configureLoading}
                className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-3xl shadow-2xl"
              >
                {configureLoading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Upload className="w-6 h-6 mr-2" />}
                {configureLoading ? 'Saving...' : 'Create/Update Tenant'}
              </Button>
            </form>
            {configureMessage && <p className="mt-4 text-emerald-400 text-lg">{configureMessage}</p>}
            {configureError && <p className="mt-4 text-red-400 text-lg">{configureError}</p>}
          </motion.section>
        )}

        {/* Document Upload */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12 overflow-hidden lg:col-span-2"
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)' }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-[500] mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Upload Documents
            </h2>
            <p className="text-lg text-white/60">
              {currentTenantId && activeCollectionName 
                ? `Target: ${currentTenantId} / ${activeCollectionName}`
                : !canUpload 
                ? 'Your role cannot upload documents'
                : 'Select collection first'
              }
            </p>
          </div>

          <form onSubmit={onUpload} className="space-y-6">
            <div className="space-y-2">
              <label className="text-lg font-light text-white/80 block">Collection <span className="text-emerald-400">*</span></label>
              <select
                value={activeCollectionName}
                onChange={(e) => setActiveCollectionName(e.target.value)}
                disabled={!collections.length || !canUpload}
                className="w-full h-14 px-6 text-lg font-light bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white focus:border-emerald-400/50 shadow-xl"
                required
              >
                <option value="">Select collection</option>
                {collections.map(col => (
                  <option key={col.id} value={col.name}>{col.name}</option>
                ))}
              </select>
              {collectionsError && <p className="text-red-400 text-sm">{collectionsError}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-lg font-light text-white/80 block">Document Title (optional)</label>
              <input
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                disabled={!canUpload}
                className="w-full h-14 px-6 text-lg font-light bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white placeholder-white/40 focus:border-emerald-400/50 shadow-xl"
                placeholder="Remote Work Policy"
              />
            </div>

            {/* Drag & Drop */}
            <div className="space-y-2">
              <label className="text-lg font-light text-white/80 block">File Upload</label>
              <div
                className={cn(
                  "relative h-40 rounded-3xl border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-sm shadow-2xl transition-all duration-300 flex flex-col items-center justify-center text-center p-8 cursor-pointer hover:border-emerald-400/50 hover:bg-emerald-500/5 group",
                  dragOver && "border-emerald-400/60 bg-emerald-500/10 shadow-emerald-500/25 !shadow-2xl scale-[1.02]",
                  !canUpload && "opacity-50 cursor-not-allowed"
                )}
                onClick={canUpload ? onDropzoneClick : undefined}
                onDragEnter={canUpload ? onDragEnter : undefined}
                onDragOver={canUpload ? onDragOver : undefined}
                onDragLeave={canUpload ? onDragLeave : undefined}
                onDrop={canUpload ? onDrop : undefined}
              >
                <FileText className="w-12 h-12 text-white/40 group-hover:text-emerald-400 mb-4" />
                <p className="text-lg font-medium text-white mb-1">Drag & drop or click to upload</p>
                <p className="text-sm text-white/60">PDF, Word, TXT, MD, Excel (.xlsx, .xlsm)</p>
                {file && (
                  <p className="mt-4 px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl text-sm font-mono text-emerald-200 truncate max-w-full">
                    {file.name}
                  </p>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md,.xlsx,.xlsm"
                onChange={onFileChange}
                className="hidden"
              />
            </div>

            <Button
              type="submit"
              disabled={uploadLoading || !currentTenantId || !activeCollectionName || !canUpload || !file}
              className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-3xl shadow-2xl"
            >
              {uploadLoading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Upload className="w-6 h-6 mr-2" />}
              {uploadLoading ? 'Uploading...' : 'Upload & Index'}
            </Button>
          </form>

          {uploadMessage && <p className="mt-6 text-emerald-400 text-lg text-center">{uploadMessage}</p>}
          {uploadError && <p className="mt-6 text-red-400 text-lg text-center">{uploadError}</p>}
        </motion.section>
      </div>

      {/* Google Drive Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)' }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-[500] flex items-center gap-3 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              <Cloud className="w-8 h-8" />
              Google Drive Integration
            </h2>
            <p className="text-lg text-white/60 mt-2">Import documents directly from your Drive</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={connectGoogleDrive}
              className="h-12 px-8 border-white/20 bg-white/10 hover:bg-white/20 rounded-2xl"
            >
              {googleDriveStatus === 'connected' ? 'Reconnect' : 'Connect Drive'}
            </Button>
            {googleDriveStatus === 'connected' && (
              <Button
                variant="destructive"
                onClick={disconnectGoogleDrive}
                className="h-12 px-8 bg-red-500/20 hover:bg-red-500/30 border-red-400/30 rounded-2xl"
              >
                Disconnect
              </Button>
            )}
          </div>
        </div>

        {googleDriveStatus === 'connected' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-lg">
              <div className={cn("px-4 py-2 rounded-2xl font-mono text-sm", 
                googleDriveStatus === 'connected' ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-200' : 'bg-gray-500/20 border border-gray-500/30 text-gray-200'
              )}>
                {googleDriveStatus === 'connected' ? `Connected as ${googleDriveEmail}` : 'Disconnected'}
              </div>
              <span className="text-white/60">Collection: <span className="font-semibold text-emerald-400">{activeCollectionName || 'None selected'}</span></span>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => loadDriveFiles()}
                disabled={driveLoading}
                className="h-14 px-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-3xl shadow-xl"
              >
                {driveLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Cloud className="w-5 h-5 mr-2" />}
                {driveLoading ? 'Loading...' : 'Load Drive Files'}
              </Button>
              <Button
                onClick={() => ingestSelectedDriveFiles()}
                disabled={ingesting || selectedDriveFileIds.size === 0 || !canUpload || !activeCollectionName}
                className="h-14 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-3xl shadow-xl"
              >
                {ingesting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
                {ingesting ? 'Ingesting...' : `Ingest ${selectedDriveFileIds.size} Files`}
              </Button>
            </div>

            {driveFiles.length > 0 && (
              <div className="max-h-96 overflow-auto border border-white/10 rounded-2xl p-4 bg-white/3 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4 p-4 bg-white/5 rounded-xl">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={driveFiles.filter(f => !f.is_folder && !f.already_ingested && f.is_supported).length > 0 && 
                              Array.from(selectedDriveFileIds).filter(id => driveFiles.some(f => f.id === id && !f.is_folder && !f.already_ingested && f.is_supported)).length === 
                              driveFiles.filter(f => !f.is_folder && !f.already_ingested && f.is_supported).length}
                      onChange={() => {/* toggle all logic */}}
                      className="w-5 h-5 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-400/50"
                    />
                    <span className="text-sm font-medium text-white">Select all eligible files ({driveFiles.filter(f => !f.is_folder && !f.already_ingested && f.is_supported).length})</span>
                  </label>
                </div>
                <div className="space-y-2">
                  {driveFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border flex-shrink-0",
                          file.is_folder 
                            ? "bg-amber-500/20 text-amber-300 border-amber-400/40" 
                            : "bg-slate-500/20 text-slate-200 border-slate-500/40"
                        )}>
                          {file.is_folder ? 'FOLDER' : 'DOC'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={cn("font-medium truncate", file.is_folder ? "text-amber-300" : "text-white")}>
                            {file.name}
                          </div>
                          <div className="text-xs text-white/50 truncate">{file.mime_type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {ingestStatusById[file.id] && (
                          <span className={cn("text-xs px-2 py-1 rounded-full font-mono",
                            ingestStatusById[file.id] === 'running' && 'bg-blue-500/20 text-blue-300 border border-blue-400/30 animate-pulse',
                            ingestStatusById[file.id] === 'success' && 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
                            ingestStatusById[file.id] === 'error' && 'bg-red-500/20 text-red-300 border border-red-400/30'
                          )}>
                            {ingestStatusById[file.id]?.toUpperCase()}
                          </span>
                        )}
                        {!file.is_folder && (
                          <input
                            type="checkbox"
                            checked={selectedDriveFileIds.has(file.id)}
                            onChange={() => toggleDriveFileSelection(file.id)}
                            disabled={file.already_ingested || !file.is_supported || ingestStatusById[file.id] === 'running' || !canUpload}
                            className="w-5 h-5 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-400/50 disabled:opacity-50"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {driveError && <p className="mt-4 text-red-400 text-lg text-center">{driveError}</p>}
            {driveIngestMessage && <p className="mt-4 text-emerald-400 text-lg text-center">{driveIngestMessage}</p>}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
};

export default DocumentIngestion;
