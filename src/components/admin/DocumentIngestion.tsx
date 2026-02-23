import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Upload, FileText, Cloud, ChevronLeft, Check, X, FolderOpen, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  uploadDocument,
  getGoogleDriveAuthUrl,
  getGoogleDriveStatus,
  listDriveFiles,
  ingestDriveFile,
  disconnectGoogleDriveApi,
  listCollectionsForOrg,
} from '@/lib/api';
import { useAuthStore } from '@/useAuthStore';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MIME_LABEL: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-excel': 'XLS',
  'text/plain': 'TXT',
  'text/markdown': 'MD',
  'application/vnd.google-apps.document': 'GDOC',
  'application/vnd.google-apps.spreadsheet': 'GSHEET',
  'application/vnd.google-apps.presentation': 'GSLIDE',
  'application/vnd.google-apps.folder': 'FOLDER',
};

function mimeLabel(mime: string): string {
  return MIME_LABEL[mime] ?? mime.split('/').pop()?.toUpperCase() ?? 'FILE';
}

function formatBytes(bytes?: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const DocumentIngestion: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth
  const { user } = useAuthStore();
  const currentUser = user ?? null;
  const currentTenantId = currentUser?.tenant_id ?? null;
  const permissions = currentUser?.permissions ?? [];
  const hasPermission = (p: string) => permissions.includes(p);
  const canUpload = hasPermission('DOC:UPLOAD');

  // Collections
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState('');
  const [activeCollectionName, setActiveCollectionName] = useState('');

  // Upload
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
  const [folderStack, setFolderStack] = useState<{ id: string; name: string }[]>([]);
  const currentFolderId = folderStack.length > 0 ? folderStack[folderStack.length - 1].id : null;

  // ── Derived Drive state ──────────────────────────────────────────────────────
  const eligibleFiles = driveFiles.filter(f => !f.is_folder && !f.already_ingested && f.is_supported);
  const allSelected = eligibleFiles.length > 0 && eligibleFiles.every(f => selectedDriveFileIds.has(f.id));
  const someSelected = eligibleFiles.some(f => selectedDriveFileIds.has(f.id));
  const isIndeterminate = someSelected && !allSelected;

  // ── Collections ──────────────────────────────────────────────────────────────
  const loadCollectionsForOrg = useCallback(async () => {
    setCollectionsLoading(true);
    setCollectionsError('');
    try {
      const res = await listCollectionsForOrg();
      const data = Array.isArray(res) ? res : res?.data;
      setCollections((data || []).map((c: any) => ({ id: c.id, name: c.name })));
    } catch (e: any) {
      setCollectionsError(e?.response?.data?.detail || 'Failed to load collections.');
      setCollections([]);
    } finally {
      setCollectionsLoading(false);
    }
  }, []);

  // ── Google Drive status ──────────────────────────────────────────────────────
  const loadGoogleDriveStatus = useCallback(async () => {
    try {
      const { data } = await getGoogleDriveStatus();
      setGoogleDriveStatus(data.connected ? 'connected' : 'disconnected');
      setGoogleDriveEmail(data.account_email || '');
    } catch {
      setGoogleDriveStatus('disconnected');
      setGoogleDriveEmail('');
    }
  }, []);

  // ── On mount: load status + handle ?googleDriveConnected=1 redirect ──────────
  useEffect(() => {
    loadGoogleDriveStatus();
    loadCollectionsForOrg();

    // FIX: Handle redirect back from Google OAuth.
    // FRONTEND_AFTER_CONNECT_URL redirects here with ?googleDriveConnected=1
    // We immediately re-check status so the UI reflects the new connection
    // without requiring a manual page refresh.
    if (searchParams.get('googleDriveConnected') === '1') {
      loadGoogleDriveStatus();
    }
  }, []);

  // ── File upload handlers ─────────────────────────────────────────────────────
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
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

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadMessage('');
    setUploadError('');
    if (!canUpload) return setUploadError('Your role is not allowed to upload documents.');
    if (!currentTenantId) return setUploadError('No tenant is associated with your account.');
    if (!activeCollectionName) return setUploadError('Collection name is required.');
    if (!file) return setUploadError('Please choose a file to upload.');

    setUploadLoading(true);
    try {
      await uploadDocument({
        collectionName: activeCollectionName,
        title: docTitle,
        file,
        doc_id: '',
        tenant_id: currentTenantId,
      });
      setUploadMessage('Document uploaded and indexed successfully.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFile(null);
      setDocTitle('');
    } catch (e: any) {
      setUploadError(
        e.response?.status === 403
          ? 'You do not have permission to ingest data.'
          : e?.response?.data?.detail || 'Failed to upload document.'
      );
    } finally {
      setUploadLoading(false);
    }
  };

  // ── Google Drive actions ─────────────────────────────────────────────────────
  const connectGoogleDrive = async () => {
    try {
      const { data } = await getGoogleDriveAuthUrl();
      window.location.href = data.auth_url;
    } catch {
      setDriveError('Failed to start Google Drive authentication.');
    }
  };

  const disconnectGoogleDrive = async () => {
    try {
      await disconnectGoogleDriveApi();
    } finally {
      await loadGoogleDriveStatus();
      setDriveFiles([]);
      setSelectedDriveFileIds(new Set());
      setFolderStack([]);
    }
  };

  // ── Drive file navigation ────────────────────────────────────────────────────
  const loadDriveFiles = async (folderId: string | null = null) => {
    setDriveLoading(true);
    setDriveError('');
    setDriveIngestMessage('');
    setSelectedDriveFileIds(new Set());
    try {
      const resp = await listDriveFiles(folderId ? { folder_id: folderId } : {});
      const files: DriveFileOut[] = resp.data || [];
      setDriveFiles(files);
      // Auto-select all eligible files
      const eligible = files.filter(f => !f.is_folder && !f.already_ingested && f.is_supported);
      setSelectedDriveFileIds(new Set(eligible.map(f => f.id)));
    } catch {
      setDriveError('Failed to load Google Drive files.');
      setDriveFiles([]);
    } finally {
      setDriveLoading(false);
    }
  };

  const navigateIntoFolder = (folder: DriveFileOut) => {
    setFolderStack(prev => [...prev, { id: folder.id, name: folder.name }]);
    loadDriveFiles(folder.id);
  };

  const navigateBack = () => {
    const newStack = folderStack.slice(0, -1);
    setFolderStack(newStack);
    const parentId = newStack.length > 0 ? newStack[newStack.length - 1].id : null;
    loadDriveFiles(parentId);
  };

  // ── Checkbox logic ───────────────────────────────────────────────────────────
  const toggleDriveFileSelection = (fileId: string) => {
    setSelectedDriveFileIds(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  // FIX: Was previously empty () => {/* toggle all logic */}
  // Now correctly selects/deselects all eligible files
  const toggleSelectAll = () => {
    if (allSelected) {
      // Deselect all eligible
      setSelectedDriveFileIds(prev => {
        const next = new Set(prev);
        eligibleFiles.forEach(f => next.delete(f.id));
        return next;
      });
    } else {
      // Select all eligible
      setSelectedDriveFileIds(prev => {
        const next = new Set(prev);
        eligibleFiles.forEach(f => next.add(f.id));
        return next;
      });
    }
  };

  // FIX: Attach indeterminate imperatively since React doesn't support it as a prop
  const selectAllRef = useCallback((el: HTMLInputElement | null) => {
    if (el) el.indeterminate = isIndeterminate;
  }, [isIndeterminate]);

  // ── Ingest ───────────────────────────────────────────────────────────────────
  const ingestSelectedDriveFiles = async () => {
    if (!canUpload || !currentTenantId || !activeCollectionName || selectedDriveFileIds.size === 0) {
      setDriveError('Cannot ingest: missing permissions, tenant, collection, or no files selected.');
      return;
    }

    setIngesting(true);
    const ids = Array.from(selectedDriveFileIds);
    setIngestStatusById(Object.fromEntries(ids.map(id => [id, 'running' as IngestStatus])));

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
      } catch {
        setIngestStatusById(prev => ({ ...prev, [id]: 'error' }));
        errorCount++;
      }
    }

    setDriveIngestMessage(
      `Ingested ${successCount} file(s) successfully.${errorCount ? ` ${errorCount} file(s) failed.` : ''}`
    );
    await loadDriveFiles(currentFolderId);
    setSelectedDriveFileIds(new Set());
    setIngesting(false);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full space-y-8 p-6 lg:p-12 isolate bg-transparent relative z-10 max-w-7xl mx-auto"
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-10"
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
              Data Ingestion
            </h1>
            <p className="text-xl text-white/60 mt-2">Upload files and connect Google Drive</p>
          </div>
        </div>
      </motion.div>

      {/* ── Upload Section ── */}
      <motion.section
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)' }}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-medium mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Upload Documents
          </h2>
          <p className="text-lg text-white/60">
            {!canUpload
              ? 'Your role cannot upload documents'
              : activeCollectionName
              ? `Target collection: ${activeCollectionName}`
              : 'Select a collection to begin'}
          </p>
        </div>

        <form onSubmit={onUpload} className="space-y-6">
          {/* Collection selector */}
          <div className="space-y-2">
            <label className="text-lg font-light text-white/80 block">
              Collection <span className="text-emerald-400">*</span>
            </label>
            {collectionsLoading ? (
              <div className="flex items-center gap-3 h-14 px-6 bg-white/5 border border-white/10 rounded-3xl text-white/40">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading collections...
              </div>
            ) : (
              <select
                value={activeCollectionName}
                onChange={e => setActiveCollectionName(e.target.value)}
                disabled={!collections.length || !canUpload}
                className="w-full h-14 px-6 pr-12 text-lg font-light bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-white/20 rounded-3xl text-white focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-400/20 shadow-2xl appearance-none transition-all"
                required
              >
                <option value="">Select collection</option>
                {collections.map(col => (
                  <option key={col.id} value={col.name}>{col.name}</option>
                ))}
              </select>
            )}
            {collectionsError && (
              <p className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" /> {collectionsError}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-lg font-light text-white/80 block">Document Title (optional)</label>
            <input
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              disabled={!canUpload}
              className="w-full h-14 px-6 text-lg font-light bg-white/10 border border-white/20 rounded-3xl text-white placeholder-white/40 focus:border-emerald-400/50 shadow-xl"
              placeholder="Remote Work Policy"
            />
          </div>

          {/* Drag & Drop */}
          <div className="space-y-2">
            <label className="text-lg font-light text-white/80 block">File Upload</label>
            <div
              className={cn(
                'relative h-40 rounded-3xl border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-sm shadow-2xl transition-all duration-300 flex flex-col items-center justify-center text-center p-8 cursor-pointer hover:border-emerald-400/50 hover:bg-emerald-500/5 group',
                dragOver && 'border-emerald-400/60 bg-emerald-500/10 scale-[1.02]',
                !canUpload && 'opacity-50 cursor-not-allowed'
              )}
              onClick={canUpload ? () => fileInputRef.current?.click() : undefined}
              onDragEnter={canUpload ? onDragEnter : undefined}
              onDragOver={canUpload ? onDragOver : undefined}
              onDragLeave={canUpload ? onDragLeave : undefined}
              onDrop={canUpload ? onDrop : undefined}
            >
              <FileText className="w-12 h-12 text-white/40 group-hover:text-emerald-400 mb-4 transition-colors" />
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

        <AnimatePresence>
          {uploadMessage && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mt-6 flex items-center justify-center gap-2 text-emerald-400 text-lg">
              <Check className="w-5 h-5" /> {uploadMessage}
            </motion.p>
          )}
          {uploadError && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mt-6 flex items-center justify-center gap-2 text-red-400 text-lg">
              <X className="w-5 h-5" /> {uploadError}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.section>

      {/* ── Google Drive Section ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)' }}
      >
        {/* Drive header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-medium flex items-center gap-3 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              <Cloud className="w-8 h-8 text-blue-400" />
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
                className="h-12 px-8 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-2xl"
              >
                Disconnect
              </Button>
            )}
          </div>
        </div>

        {/* Connected state */}
        {googleDriveStatus === 'connected' && (
          <div className="space-y-6">
            {/* Status badge + collection info */}
            <div className="flex flex-wrap items-center gap-4 text-lg">
              <div className="px-4 py-2 rounded-2xl font-mono text-sm bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
                Connected as {googleDriveEmail}
              </div>
              <span className="text-white/60">
                Collection:{' '}
                <span className={cn('font-semibold', activeCollectionName ? 'text-emerald-400' : 'text-amber-400')}>
                  {activeCollectionName || 'None selected — pick one above'}
                </span>
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => loadDriveFiles()}
                disabled={driveLoading}
                className="h-14 px-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-3xl shadow-xl"
              >
                {driveLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Cloud className="w-5 h-5 mr-2" />}
                {driveLoading ? 'Loading...' : 'Load Drive Files'}
              </Button>

              {driveFiles.length > 0 && (
                <Button
                  onClick={ingestSelectedDriveFiles}
                  disabled={ingesting || selectedDriveFileIds.size === 0 || !canUpload || !activeCollectionName}
                  className="h-14 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-3xl shadow-xl disabled:opacity-50"
                >
                  {ingesting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
                  {ingesting ? 'Ingesting...' : `Ingest ${selectedDriveFileIds.size} File${selectedDriveFileIds.size !== 1 ? 's' : ''}`}
                </Button>
              )}
            </div>

            {/* File list */}
            {driveFiles.length > 0 && (
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/3 backdrop-blur-sm">

                {/* Breadcrumb + Select All bar */}
                <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/10 flex-wrap gap-3">

                  {/* Breadcrumb navigation */}
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    {folderStack.length > 0 && (
                      <button
                        onClick={navigateBack}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back
                      </button>
                    )}
                    <span>My Drive</span>
                    {folderStack.map((folder, i) => (
                      <React.Fragment key={folder.id}>
                        <span className="text-white/30">/</span>
                        <span className={i === folderStack.length - 1 ? 'text-white' : 'text-white/60'}>
                          {folder.name}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Select All */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      ref={selectAllRef}
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      disabled={eligibleFiles.length === 0}
                      className="w-5 h-5 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-400/50 disabled:opacity-40"
                    />
                    <span className="text-sm font-medium text-white">
                      Select all eligible ({eligibleFiles.length})
                    </span>
                    <span className="text-xs text-white/40">{selectedDriveFileIds.size} selected</span>
                  </label>
                </div>

                {/* File rows */}
                <div className="max-h-96 overflow-auto divide-y divide-white/5">
                  {driveFiles.map(driveFile => {
                    const status = ingestStatusById[driveFile.id];
                    const isEligible = !driveFile.is_folder && !driveFile.already_ingested && driveFile.is_supported;
                    const isChecked = selectedDriveFileIds.has(driveFile.id);
                    const isRunning = status === 'running';

                    return (
                      <div
                        key={driveFile.id}
                        className={cn(
                          'flex items-center justify-between px-4 py-3 transition-colors group',
                          driveFile.is_folder
                            ? 'hover:bg-amber-500/5 cursor-pointer'
                            : isEligible && canUpload && !isRunning
                            ? 'hover:bg-white/5 cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'
                        )}
                        onClick={() => {
                          if (driveFile.is_folder) {
                            navigateIntoFolder(driveFile);
                          } else if (isEligible && canUpload && !isRunning) {
                            toggleDriveFileSelection(driveFile.id);
                          }
                        }}
                      >
                        {/* Icon + name */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={cn(
                            'w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold border flex-shrink-0',
                            driveFile.is_folder
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                              : 'bg-slate-500/20 text-slate-200 border-slate-500/40'
                          )}>
                            {driveFile.is_folder
                              ? <FolderOpen className="w-4 h-4" />
                              : mimeLabel(driveFile.mime_type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={cn('font-medium truncate text-sm', driveFile.is_folder ? 'text-amber-300' : 'text-white')}>
                              {driveFile.name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
                              <span>{driveFile.mime_type.split('/').pop()}</span>
                              {driveFile.size && <span>{formatBytes(driveFile.size)}</span>}
                              {driveFile.already_ingested && (
                                <span className="text-emerald-400/70">• already ingested</span>
                              )}
                              {!driveFile.is_supported && !driveFile.is_folder && (
                                <span className="text-red-400/70">• unsupported format</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status badge + checkbox */}
                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                          {/* FIX: navigate into folders indicator */}
                          {driveFile.is_folder && (
                            <span className="text-xs text-white/30 group-hover:text-white/60 transition-colors">
                              Open →
                            </span>
                          )}

                          {/* Ingest status badge */}
                          {status && (
                            <span className={cn(
                              'text-xs px-2 py-1 rounded-full font-mono border',
                              status === 'running' && 'bg-blue-500/20 text-blue-300 border-blue-400/30 animate-pulse',
                              status === 'success' && 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
                              status === 'error' && 'bg-red-500/20 text-red-300 border-red-400/30'
                            )}>
                              {status === 'running' ? '⟳ RUNNING' : status === 'success' ? '✓ DONE' : '✗ FAILED'}
                            </span>
                          )}

                          {/* Checkbox — only for non-folder files */}
                          {!driveFile.is_folder && (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                // FIX: stopPropagation prevents row click from double-firing
                                e.stopPropagation();
                                toggleDriveFileSelection(driveFile.id);
                              }}
                              disabled={!isEligible || isRunning || !canUpload}
                              className="w-5 h-5 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-400/50 disabled:opacity-30"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Drive messages */}
            <AnimatePresence>
              {driveError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-red-400 text-lg">
                  <X className="w-5 h-5" /> {driveError}
                </motion.p>
              )}
              {driveIngestMessage && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-emerald-400 text-lg">
                  <Check className="w-5 h-5" /> {driveIngestMessage}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Disconnected state placeholder */}
        {googleDriveStatus === 'disconnected' && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-white/40 space-y-4">
            <Cloud className="w-16 h-16 opacity-30" />
            <p className="text-lg">Connect your Google Drive to import documents directly.</p>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
};

export default DocumentIngestion;