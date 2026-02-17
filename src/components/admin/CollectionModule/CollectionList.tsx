import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/useAuthStore";
import { AuthRequired } from "@/components/AuthRequired";
import { CollectionSearch } from "./components/CollectionSearch";
import { CollectionsGrid } from "./components/CollectionsGrid";
import { CollectionHeader } from "./components/CollectionsHeader";
import { CreateCollectionModal } from "./components/CreateCollectionModal";
import { TenantSelector } from "@/components/TenantSelector";
import { AccessControlModal } from "./components/AccessControlModal";


import { useCollections } from "./hooks/useCollections";


const CollectionList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();


  const isVendor =  user?.role == "vendor";


// Hook to fetch collections
  const { state, actions } = useCollections({tenantId: user?.tenant_id});

  // State to track model visibility
  const [createOpen, setCreateOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [currentCollection, setCurrentCollection] = useState<any>(null);

    if (!user) return <AuthRequired />;


  return (
    <div className="space-y-12 p-6 lg:p-12">

      {/*  Header */}
      <CollectionHeader
        tenant={{
          displayName: state.tenantDisplayName || "—",
          orgName: state.organizationName,
        }}
        isVendor={isVendor}
        selectedTenantId={state.selectedTenantId}
        onBack={() => navigate(-1)}
        onCreateClick={() => setCreateOpen(true)}
      />

      {/*  Tenant selector for vendors */}
      {isVendor && (
        <TenantSelector
          companies={state.companies}
          value={state.selectedTenantId}
          companiesLoading={state.companiesLoading}
          onChange={actions.setSelectedTenantId}
        />
      )}


        {/*  Search */}
      <CollectionSearch
        value={state.search}
        onChange={actions.setSearch}
      />


        {/* Collection grid */}
      <CollectionsGrid
        collections={state.filteredCollections}
        loading={state.loading}
        onAccessClick={(c) => {
          setCurrentCollection(c)
          setAccessOpen(true);
        }}
        onCreateClick={() => setCreateOpen(true)}
        canCreate={true}
      />

      {/* Create Collection Modal */}
      <CreateCollectionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        organizations={state.organizations}
        onCreated={actions.refresh}
        />

        {/* Access Control Modal */}
        <AccessControlModal
           open={accessOpen}
           collection={currentCollection}
           onClose={() => setAccessOpen(false)}
           onSaved={actions.refresh}

           />
        
    </div>
  );
};

export default CollectionList