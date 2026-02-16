import { CollectionOut, OrganizationOut } from "@/lib/api";
import { AssignableRole } from "@/lib/assignableRoles";

export interface User {
    id: string
    email: string
    role?: string | null
    tenant_id?: string | null
    organization_ids?: string | null

}

export interface Company {
    tenant_id: string
    display_name?: string
}

export interface AccessState {
    selectedUserIds: string[]
    selectedRoles: AssignableRole[]
}

export interface Collection {
    id: string;
    name: string;
    createdAt?: string;
    docCount?: number;
}