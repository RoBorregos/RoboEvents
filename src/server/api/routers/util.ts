import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  communityProcedure,
  organizationProcedure,
} from "~/server/api/trpc";

export const utilRouter = createTRPCRouter({
  validImage: publicProcedure
    .input(z.string().url().nullable().nullish())
    .output(z.boolean())
    .query(async ({ input }) => {
      if (input) return await isImgUrl(input);
      return false;
    }),

  getTags: publicProcedure.query(async ({ ctx }) => {
    const tags = await ctx.prisma.tag.findMany({
      select: {
        name: true,
      },
    });
    return tags;
  }),
});

async function isImgUrl(url: string) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (res.headers == null) return false;
    const type = res.headers.get("Content-Type");
    if (type == null) return false;
    return type.startsWith("image");
  } catch (error) {
    return false;
  }
}
