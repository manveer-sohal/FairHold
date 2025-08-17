// lib/role.ts
export function roleFromAddress(address: string): "VENDOR" | "CUSTOMER" {
  // naive: route by path; or fetch user; or let them choose
  return "CUSTOMER";
}
