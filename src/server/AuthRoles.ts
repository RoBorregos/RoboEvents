import type { Prisma } from "./db";
import { z } from "zod";
type GithubOrganization = {
  login: string | null;
  id: number | null;
  node_id: string | null;
  url: string | null;
  repos_url: string | null;
  events_url: string | null;
  hooks_url: string | null;
  issues_url: string | null;
  members_url: string | null;
  public_members_url: string | null;
  avatar_url: string | null;
  description: string | null;
  [key: string]: any; // Index signature for additional properties
};

const expectedOrganizationSchema = z
  .object({
    login: z.string().nullable(),
    id: z.number().nullable(),
    node_id: z.string().nullable(),
    url: z.string().nullable(),
    repos_url: z.string().nullable(),
    events_url: z.string().nullable(),
    hooks_url: z.string().nullable(),
    issues_url: z.string().nullable(),
    members_url: z.string().nullable(),
    public_members_url: z.string().nullable(),
    avatar_url: z.string().nullable(),
    description: z.string().nullable(),
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

    // Auth for community members (@tec)
    const isCommunity = await isCommunityMember(email);

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

const isCommunityMember = async (email: string) => {
  return email.endsWith("@tec.mx");
};
