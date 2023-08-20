import { Prisma } from "~/server/db";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  communityProcedure,
  organizationProcedure,
} from "~/server/api/trpc";
import { getRoleOrLower } from "~/utils/role";

export const dateRouter = createTRPCRouter({
  // Returns date objects with start and e
  getEventsByTime: publicProcedure
    .input(
      z.object({
        date: z.string(),
        previous: z.boolean().nullish(),
        unique: z.boolean(),
        monthly: z.boolean(),
      })
    )
    .query(async ({ input, ctx }) => {
      const date = new Date(input.date);

      if (isNaN(date.getTime())) return false;

      let start;
      let end;
      if (input.monthly) {
        end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      } else {
        end = new Date(date.getFullYear() + 1, 0, 1);
      }

      if (input.previous) {
        if (input.monthly) {
          start = new Date(date.getFullYear(), date.getMonth(), 1);
        } else {
          start = new Date(date.getFullYear(), 0, 1);
        }
      } else {
        if (input.monthly) {
          const startMonth = new Date(date.getFullYear(), date.getMonth());
          const today = new Date();
          today.setDate(today.getDate() - 1);
          if (today > startMonth) {
            start = today;
          } else {
            start = startMonth;
          }
        } else {
          const startYear = new Date(date.getFullYear(), 0, 1);
          const today = new Date();
          today.setDate(today.getDate() - 1);
          start = (startYear > today) ? startYear : today;
        }
      }

      const visibleTags = getRoleOrLower(ctx.session?.user.role);

      const events = await ctx.prisma.dateStamp.findMany({
        where: {
          start: {
            gte: start,
            lt: end,
          },
          event: {
            visibility: {
              in: visibleTags,
            },
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
