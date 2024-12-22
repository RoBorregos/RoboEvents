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

  getNextEvents: publicProcedure.query(async ({ ctx }) => {
    const visibleEvents = getRoleOrLower(ctx.session?.user.role);
    const now = new Date();
    const events = await ctx.prisma.dateStamp.findMany({
      where: {
        start: {
          gte: now,
        },
        event: {
          OR: [
            {
              visibility: {
                in: visibleEvents,
              },
            },
          ],
        },
      },
      select: {
        eventId: true,
      },
      orderBy: {
        start: "asc",
      },
      take: 5,
    });

    return events;
  }),
});
