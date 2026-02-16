import React from "react";

interface TenantContext {
  displayName: string;
  id?: string;
  orgName?: string;
}

export interface CollectionHeaderProps {
  tenant: TenantContext;
  isVendor: boolean;
  selectedTenantId?: string;
  onBack: () => void | Promise<void>;
  onCreateClick: () => void;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({
  tenant,
  isVendor,
  selectedTenantId,
  onBack,
  onCreateClick,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back
        </button>

        <div>
          <h1 className="text-xl font-semibold">
            {tenant.displayName}
          </h1>

          {tenant.orgName && (
            <p className="text-sm text-gray-500">
              {tenant.orgName}
            </p>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div>
        {!isVendor && selectedTenantId && (
          <button
            onClick={onCreateClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            + Create Collection
          </button>
        )}
      </div>
    </div>
  );
};