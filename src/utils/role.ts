import { on } from "events";
import { EventModel } from "~/zod/types";

interface Roles {
  role: "admin" | "organizationMember" | "communityMember" | "authenticated";
}

const adminOrUpper = ["admin"];
const organizationMemberOrUpper = [...adminOrUpper, "organizationMember"];
const communityMemberOrUpper = [
  ...organizationMemberOrUpper,
  "communityMember",
];
const authenticatedOrUpper = [...communityMemberOrUpper, "authenticated"];
const unauthenticatedOrUpper = [...authenticatedOrUpper, "unauthenticated"];

interface RoleType {
  [key: string]: string[];
}

const roleOrUpper: RoleType = {
  admin: adminOrUpper,
  organizationMember: organizationMemberOrUpper,
  communityMember: communityMemberOrUpper,
  authenticated: authenticatedOrUpper,
  unauthenticated: unauthenticatedOrUpper,
};

const upperRole: RoleType = {
  admin: adminOrUpper,
  organizationMember: adminOrUpper,
  communityMember: organizationMemberOrUpper,
  authenticated: communityMemberOrUpper,
  unauthenticated: authenticatedOrUpper,
};

const unauthenticatedOrLower = ["unauthenticated"];
const authenticatedOrLower = [...unauthenticatedOrLower, "authenticated"];
const communityMemberOrLower = [...authenticatedOrLower, "communityMember"];
const organizationMemberOrLower = [
  ...communityMemberOrLower,
  "organizationMember",
];
const adminOrLower = [...organizationMemberOrLower, "admin"];

export const roleOrLower: RoleType = {
  admin: adminOrLower,
  organizationMember: organizationMemberOrLower,
  communityMember: communityMemberOrLower,
  authenticated: authenticatedOrLower,
  unauthenticated: unauthenticatedOrLower,
};

// 1: allowed
// 0: not allowed
export const compareRole = (
  requiredRole: string,
  userRole: string | undefined
) => {
  if (!userRole) return 0;
  const t = roleOrUpper[requiredRole];

  if (t && t.includes(userRole)) return 1;

  return 0;
};

export const onlyUpperRole = (
  requiredRole: string,
  userRole: string | undefined
) => {
  if (!userRole) return 0;
  const t = upperRole[requiredRole];

  if (t && t.includes(userRole)) return 1;

  return 0;
};

type UserRole = {
  role: string | null;
};

export const getHighestRole = (roles: UserRole[]) => {
  let highestRole = "unauthenticated";

  for (const role of roles) {
    if (!role.role) continue;
    if (onlyUpperRole(role.role, highestRole)) {
      highestRole = role.role;
    }
  }

  return highestRole;
};
