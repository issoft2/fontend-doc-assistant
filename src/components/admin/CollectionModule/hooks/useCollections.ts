import { useEffect, useState, useCallback, useMemo } from "react";
import { listCollectionsForOrg, CollectionOut } from "@/lib/api";

interface State {
  collections: CollectionOut[];
  filteredCollections: CollectionOut[];
  search: string;
  tenantDisplayName?: string;
  organizationName?: string;
  loading: boolean;

}

interface Actions {
  setSearch: (v: string) => void;
  refresh: () => void;
}

export function useCollections() {
  const [collections, setCollections] = useState<CollectionOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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
    tenantDisplayName: collections[0]?.tenant_name,
    organizationName: collections[0]?.organization_name,
    loading,
  };

  const actions: Actions = {
    setSearch,
    refresh: fetchCollections,
  };

  return { state, actions };
}