import { useEffect, useState, useCallback, useMemo } from "react";
import { listCollectionsForOrg, CollectionOut } from "@/lib/api";

interface State {
  collections: CollectionOut[];
  filteredCollections: CollectionOut[];
  search: string;
  selectedTenantId?: string;
  tenantDisplayName?: string;
  selectedOrg?: { name?: string };
  companies: { tenant_id: string; display_name: string }[];
  companiesLoading: boolean;
  loading: boolean;
  createModal?: any;
  accessModal?: any;
}

interface Actions {
  setSearch: (v: string) => void;
  setSelectedTenantId: (id: string) => void;
  refresh: () => void;
  openCreateModal: () => void;
  openAccessModal: (c: CollectionOut) => void;
  createActions?: any;
  accessActions?: any;
}

export function useCollections({ tenantId }: { tenantId?: string }) {
  const [collections, setCollections] = useState<CollectionOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState(tenantId);

  const fetchCollections = useCallback(async () => {
    if (!selectedTenantId) return;
    setLoading(true);
    try {
      const res = await listCollectionsForOrg();
      setCollections(Array.isArray(res) ? res : res?.data || []);
    } finally {
      setLoading(false);
    }
  }, [selectedTenantId]);

  useEffect(() => { fetchCollections() }, [fetchCollections]);

  const filteredCollections = useMemo(
    () => collections.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [collections, search]
  );

  const state: State = {
    collections,
    filteredCollections,
    search,
    selectedTenantId,
    tenantDisplayName: "Tenant Name",
    selectedOrg: { name: "Org Name" },
    companies: [],
    companiesLoading: false,
    loading,
    createModal: {},
    accessModal: {},
  };

  const actions: Actions = {
    setSearch,
    setSelectedTenantId,
    refresh: fetchCollections,
    openCreateModal: () => console.log("open create modal"),
    openAccessModal: (c: CollectionOut) => console.log("open access modal", c),
    createActions: {},
    accessActions: {},
  };

  return { state, actions };
}