import { useEffect, useState, useCallback, useMemo } from "react";
import { listCollectionsForOrg, CollectionOut, fetchOrganizations, OrganizationOut } from "@/lib/api";
import { useAuthStore } from "@/useAuthStore";


interface State {
  collections: CollectionOut[];
  filteredCollections: CollectionOut[];
  organizations: OrganizationOut[];
  organizationsLoading: boolean;
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
  const { user } = useAuthStore();


  const [collections, setCollections] = useState<CollectionOut[]>([]);
  const [organizations, setorganizations] = useState<OrganizationOut[]>([]);
  const [organizationsLoading, setOrganizationsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>(tenantId || user?.tenant_id);
  

  // Fetch Collections
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

  // Fecth Organization
  const loadOrganizations = useCallback(async () => {
    if (!selectedTenantId) return;

    try {
      setOrganizationsLoading(true);

      const data = await fetchOrganizations(selectedTenantId);
      setorganizations(data);

    }catch(err) {
      console.error("Failed to fetch organizatinos", err);
      setorganizations([]);
    } finally {
      setOrganizationsLoading(false);
    }
  }, [selectedTenantId]);

  // load collection on mount
  useEffect(() => { 
    fetchCollections()
 }, [fetchCollections]);

 // Load organization when tenant changes
 useEffect(() => {
   loadOrganizations();
 }, [loadOrganizations]);


 // filtering
  const filteredCollections = useMemo(() => {
    if(!search) return collections;

    return collections.filter((c) =>
    c.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );

  }, [collections, search]);


  const state: State = {
    collections,
    filteredCollections,
    organizations,
    organizationsLoading,
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