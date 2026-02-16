import { useEffect, useState, useCallback } from "react";
import { fetchOrganizations, listCompanies, OrganizationOut } from "@/lib/api";
import { Company } from "../types";

export function useTenantData(isVendor: boolean, userTenantId?: string | null) {
    const [selectedTenantId, setSelectedTenantId] = useState('')
    const [companies, setCompanies] = useState<Company[]>([])
    const [organizations, setOrganizations] = useState<OrganizationOut[]>([])
    const [selectedOrgId, setSelectedOrgId] = useState('')

    const [companiesLoading, setCompniesLoading] = useState(false)
    const [orgsLoading, setOrgsLoading] = useState(false)

    // Auto select tenant
    useEffect(() => {
        if (isVendor && userTenantId) {
            setSelectedTenantId(userTenantId)

        }
    }, [isVendor, userTenantId])

    const loadCompanies = useCallback(async () => {
        if (!isVendor) return

        setCompniesLoading(true)
        try{
            const res = await listCompanies()
            const payload = Array.isArray(res) ? res : res?.data || []
            setCompanies(payload)
        } finally {
            setCompniesLoading(false)
        }

    }, [isVendor])

    const loadOrganizations = useCallback(async (tenantId: string) => {
        if(!tenantId) return
        setOrgsLoading(true)
        try{
            const res = await fetchOrganizations(tenantId)
            const payload = Array.isArray(res) ? res : (res as any)?.data || []
            setOrganizations(payload)
        } finally {
            setOrgsLoading(false)
        }

    }, [])

    useEffect(() => {
        loadCompanies()
    }, [loadCompanies])

    
    useEffect(() => {
        if (selectedTenantId) {
            loadOrganizations(selectedTenantId)
        } else {
            setOrganizations([])
        }
    }, [selectedTenantId, loadOrganizations])

    return {
        selectedTenantId,
        setSelectedTenantId,
        companies,
        organizations,
        selectedOrgId,
        setSelectedOrgId,
        companiesLoading,
        orgsLoading,
    }
}
 