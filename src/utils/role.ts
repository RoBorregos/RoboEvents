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

// 1: allowed
// 0: not allowed
export const compareRole = (
  requiredRole: string,
  userRole: string | undefined
) => {
  if (!userRole) return 0;
  if (requiredRole === "admin" && adminOrUpper.includes(userRole)) {
    return 1;
  } else if (
    requiredRole === "organizationMember" &&
    organizationMemberOrUpper.includes(userRole)
  ) {
    return 1;
  } else if (
    requiredRole === "communityMember" &&
    communityMemberOrUpper.includes(userRole)
  ) {
    return 1;
  } else if (
    requiredRole === "authenticated" &&
    authenticatedOrUpper.includes(userRole)
  ) {
    return 1;
  }

  return 0;
};
