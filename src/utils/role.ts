// interface Roles {
//   role:
//     | "admin"
//     | "organizationMember"
//     | "communityMember"
//     | "authenticated"
//     | "unauthenticated";
// }

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
// A role is allowed if it is in the same or higher level than the required role
export const compareRole = ({
  requiredRole,
  userRole,
}: {
  requiredRole: string;
  userRole: string | undefined;
}) => {
  if (requiredRole === "unauthenticated") return 1;

  if (!userRole) return 0;
  const t = roleOrUpper[requiredRole];

  if (t && t.includes(userRole)) return 1;

  return 0;
};

export const onlyUpperRole = ({
  upperThan,
  userRole,
}: {
  upperThan: string;
  userRole: string | undefined;
}) => {
  if (!userRole) return 0;
  const t = upperRole[upperThan];

  if (t && t.includes(userRole)) return 1;

  return 0;
};

type UserRole = {
  role: string | null;
};

export const getHighestRole = (roles: UserRole[], startRole?: string) => {
  let highestRole = startRole ?? "unauthenticated";

  for (const role of roles) {
    if (!role.role) continue;
    if (onlyUpperRole({ upperThan: highestRole, userRole: role.role })) {
      highestRole = role.role;
    }
  }

  return highestRole;
};

export const getRoleOrLower = (role: string | undefined | null) => {
  if (!role) return unauthenticatedOrLower;

  const roles = roleOrLower[role];

  if (!roles) return unauthenticatedOrLower;

  return roles;
};
