import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/useAuthStore";
import { AuthRequired } from "@/components/AuthRequired";
import { CollectionSearch } from "./components/CollectionSearch";
import { CollectionsGrid } from "./components/CollectionsGrid";
import { CollectionHeader } from "./components/CollectionsHeader";

import { useCollections } from "./hooks/useCollections";

const CollectionList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user) return <AuthRequired />;

  const { state, actions } = useCollections();

  return (
    <div className="space-y-12 p-6 lg:p-12">
      <CollectionHeader
        tenant={{
          displayName: state.tenantDisplayName || "—",
          orgName: state.organizationName,
        }}
        isVendor={false}
        onBack={() => navigate(-1)}
        onCreateClick={() => {}}
      />

      <CollectionSearch
        value={state.search}
        onChange={actions.setSearch}
      />

      <CollectionsGrid
        collections={state.filteredCollections}
        loading={state.loading}
        onAccessClick={() => {}}
        onCreateClick={() => {}}
        canCreate={true}
      />
    </div>
  );
};