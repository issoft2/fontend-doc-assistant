import React from "react";

interface TenantSelectorProps {
    companies: {tenant_id: string, display_name: string}[];
    value?: string;
    companiesLoading?: boolean;
    onChange: (tenant_id: string) => void;
}

export const TenantSelector: React.FC<TenantSelectorProps> = ({
    companies,
    value,
    companiesLoading = false,
    onChange,
}) => {
    return (
        <div className="w-64">
            <select
             className="w-full px-3 border rounded-m text-sm focus:outline focus:ring-blue-500"
             value={value ?? ""}
             onChange={(e) => onChange(e.target.value)}
             disabled={companiesLoading}
             >
              <option value="" disabled>
                {companiesLoading ? "Loading..." : "Select Company"}
              </option>  

              {companies.map((company) => (
                <option key={company.tenant_id} value={company.tenant_id}>
                    {company.display_name}
                </option>
              ))}
             </select>
        </div>
    );
};