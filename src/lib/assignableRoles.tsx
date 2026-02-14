// src/lib/constants.ts
export const ALL_ASSIGNABLE_ROLES = [
  'employee',
  'sub_hr',
  'sub_finance',
  'sub_operations',
  'sub_md',
  'sub_admin',
  'group_hr',
  'group_finance',
  'group_operation',
  'group_production',
  'group_marketing',
  'group_legal',
  'group_exe',
  'group_admin',
  'group_gmd',
] as const;

export type AssignableRole = typeof ALL_ASSIGNABLE_ROLES[number];
