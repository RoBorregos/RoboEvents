import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { getRoleOrLower } from "~/utils/role";

export const dateRouter = createTRPCRouter({
  // Returns datestamps objects with start and end date and event ids.
  getEventsByTime: publicProcedure
    .input(
      z.object({
        start: z.string(),
        end: z.string(),
        unique: z.boolean(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Perform date operations using client input, to avoid errors if the server is located in a different timezone.
      // Date constructor uses server's timezone unless the whole date instance is passed.
      const start = new Date(input.start);
      const end = new Date(input.end);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

      const visibleEvents = getRoleOrLower(ctx.session?.user.role);

      const events = await ctx.prisma.dateStamp.findMany({
        where: {
          start: {
            gte: start,
            lt: end,
          },
          event: {
            OR: [
              {
                visibility: {
                  in: visibleEvents,
                },
              },
              {
                owners: {
                  some: {
                    id: ctx.session?.user.id ?? "-1",
                  },
                },
              },
            ],
          },
        },
        select: {
          eventId: true,
          start: true,
          end: true,
          id: true,
        },
        orderBy: {
          start: "asc",
        },
      });

      if (input.unique) {
        const uniqueIds = new Set();
        const uniqueEvents: typeof events = [];
        events.map((date) => {
          if (!uniqueIds.has(date.eventId)) {
            uniqueIds.add(date.eventId);
            uniqueEvents.push(date);
          }
        });

        return uniqueEvents;
      }

      return events;
    }),
});
