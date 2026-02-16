import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/useAuthStore";
import { AuthRequired } from "@/components/AuthRequired";
import { TenantSelector } from "@/components/TenantSelector";
import { CollectionSearch } from "./components/CollectionSearch";
import { CollectionsGrid } from "./components/CollectionsGrid";
import { CreateCollectionModal } from "./components/CreateCollectionModal";
import { AccessControlModal } from "./components/AccessControlModal";
import { CollectionHeader } from "./components/CollectionsHeader";

import { useCollections } from "./hooks/useCollections";

const CollectionList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const isVendor = user?.role === "vendor";

  // Pass tenantId from user to the hook
  const { state, actions } = useCollections({ tenantId: user?.tenant_id });

  if (!user) return <AuthRequired />;

  return (
    <div className="space-y-12 p-6 lg:p-12">
      {/* Header */}
      <CollectionHeader
        tenant={{
          displayName: state.tenantDisplayName || "Tenant Name",
          orgName: state.selectedOrg?.name,
          id: state.selectedTenantId,
        }}
        isVendor={isVendor}
        selectedTenantId={state.selectedTenantId}
        onBack={() => navigate(-1)}
        onCreateClick={actions.openCreateModal}
      />

      {/* Tenant selector for vendors */}
      {isVendor && (
        <TenantSelector
          companies={state.companies}
          value={state.selectedTenantId}
          loading={state.companiesLoading}
          onChange={actions.setSelectedTenantId}
        />
      )}

      {/* Search */}
      <CollectionSearch value={state.search} onChange={actions.setSearch} />

      {/* Collections grid */}
      <CollectionsGrid
        collections={state.filteredCollections}
        loading={state.loading}
        onAccessClick={actions.openAccessModal}
        onCreateClick={actions.openCreateModal}
        canCreate={!isVendor && !!state.selectedTenantId}
      />

      {/* Modals */}
      <CreateCollectionModal {...state.createModal} {...actions.createActions} />
      <AccessControlModal {...state.accessModal} {...actions.accessActions} />
    </div>
  );
};

export default CollectionList;