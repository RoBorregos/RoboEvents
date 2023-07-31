import { userAgent } from "next/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  communityProcedure,
  organizationProcedure,
} from "~/server/api/trpc";

export const authorizationRouter = createTRPCRouter({

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "Authenticated procedure: you can now see this secret message!";
  }),

  getCommunityMessage: communityProcedure.query(() => {
    return "Community procedure: you can now see this secret message!";
  }),

  getOrganizationMessage: organizationProcedure.query(() => {
    return "Organization procedure: you can now see this secret message!";
  }),

  getAdminMessage: adminProcedure.query(() => {
    return "Admin procedure: you can now see this secret message!";
  }),

});
