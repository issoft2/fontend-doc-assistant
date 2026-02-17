import { useEffect, useState, useCallback, useMemo } from "react";
import { listCollectionsForOrg, CollectionOut } from "@/lib/api";

interface State {
  collections: CollectionOut[];
  filteredCollections: CollectionOut[];
  search: string;
  selectedTenantId?: string
  tenantDisplayName?: string;
  organizationName?: string;
  selectedOrg?: {name?: string};
  companies: { tenant_id: string, display_name: string}[];
  companiesLoading: boolean;
  loading: boolean;
  createModal?: any;
  accessModal?: any;

}

interface Actions {
  setSearch: (v: string) => void;
  refresh: () => void;
  setSelectedTenantId: (id: string) => void;
  openCreateModal: () => void;
  openAccessModal: (c: CollectionOut) => void;
  createActions?: any;
  accessActions?: any;
}

export function useCollections({tenantId} : { tenantId?: string}) {
  const [collections, setCollections] = useState<CollectionOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>(tenantId);

  const fetchCollections = useCallback(async () => {
    setLoading(true);

    try {
      const res = await listCollectionsForOrg();
      const payload = Array.isArray(res) ? res : res?.data || [];
      setCollections(payload);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchCollections()
 }, [fetchCollections]);

  const filteredCollections = useMemo(() => {
    if(!search) return collections;

    return collections.filter((c) =>
    c.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );

  }, [collections, search]);


  const state: State = {
    collections,
    filteredCollections,
    search,
    selectedTenantId: selectedTenantId,
    tenantDisplayName: collections[0]?.tenant_name ?? "Tenant Name",
    organizationName: collections[0]?.organization_name ?? "Org Name",
    selectedOrg: {name: collections[0]?.organization_name ?? "Org Name"},
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