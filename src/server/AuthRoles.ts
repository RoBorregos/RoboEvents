import type { Prisma } from "./db";
import { z } from "zod";
type GithubOrganization = {
  login: string;
  id: number;
  node_id: string;
  url: string;
  repos_url: string;
  events_url: string;
  hooks_url: string;
  issues_url: string;
  members_url: string;
  public_members_url: string;
  avatar_url: string;
  description: string;
  [key: string]: any; // Index signature for additional properties
};

const expectedOrganizationSchema = z
  .object({
    login: z.string(),
    id: z.number(),
    node_id: z.string(),
    url: z.string(),
    repos_url: z.string(),
    events_url: z.string(),
    hooks_url: z.string(),
    issues_url: z.string(),
    members_url: z.string(),
    public_members_url: z.string(),
    avatar_url: z.string(),
    description: z.string(),
  })
  .catchall(z.unknown())
  .array();

type GithubOrganizationList = GithubOrganization[];

export const updateRole = async (
  email: string | null | undefined,
  prisma: Prisma
) => {
  if (email) {
    const isAdmin = await prisma.admin.findUnique({
      where: {
        email: email,
      },
    });

    if (isAdmin) return "admin";

    const isOrganizationMember = await prisma.organizationMember.findUnique({
      where: {
        email: email,
      },
    });

    if (isOrganizationMember) return "organizationMember";

    // Auth for github organization members
    const isRoborregos = await isRoborregosMember(email, prisma);

    if (isRoborregos) return "organizationMember";

    // Auth for community members (@tec with azure ad)
    const isCommunity = await isCommunityMember(email, prisma);

    if (isCommunity) return "communityMember";
  }

  return "authenticated";
};

const isRoborregosMember = async (email: string, prisma: Prisma) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    select: {
      organizations: true,
    },
  });

  if (typeof user?.organizations === "string") {
    const organizations = await getUserOrganizations(user.organizations);
    const roborregos = organizations.find((org) => org.login === "RoBorregos");
    if (roborregos) return true;
  }

  return false;
};

const getUserOrganizations = async (organizations_url: string) => {
  try {
    const response = await fetch(organizations_url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch organizations (${organizations_url}): ` +
          response.statusText
      );
    }

    const data = await response.json();

    return expectedOrganizationSchema.parse(data);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return [] as GithubOrganizationList;
  }
};

const isCommunityMember = async (email: string, prisma: Prisma) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      accounts: true,
    },
  });

  if (user?.accounts) {
    const community = user.accounts.find(
      (account) => account.provider === "azure-ad"
    );
    if (community) return true;
  }

  return false;
};
