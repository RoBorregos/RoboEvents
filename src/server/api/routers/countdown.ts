import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getRoleOrLower } from "~/utils/role";

export const countdownRouter = createTRPCRouter({
  getEventsByIds: publicProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      })
    )
    .query(async ({ input, ctx }) => {
      const visibleEvents = getRoleOrLower(ctx.session?.user.role);

      const events = await ctx.prisma.event.findMany({
        where: {
          AND: [
            {
              OR: [
                {
                  visibility: {
                    in: visibleEvents,
                  },
                },
                {
                  linkVisibility: {
                    in: visibleEvents,
                  },
                },
              ],
            },
            {
              id: {
                in: input.ids,
              },
            },
          ],
        },
        include: {
          dates: true,
          confirmed: true,
          tags: true,
        },
      });

      return events;
    }),
});
