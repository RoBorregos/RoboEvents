import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { getRoleOrLower } from "~/utils/role";

export const filterRouter = createTRPCRouter({
  getFilteredEvents: publicProcedure
    .input(
      z.object({
        startDate: z.string().nullable(),
        endDate: z.string().nullable(),
        owners: z.array(z.string()).nullable(),
        tags: z.array(z.string()).nullable(),
        visibility: z.string().nullable(),
        text: z.string().nullable(),
        confirmed: z.array(z.string()).nullable(),
      })
    )
    .query(async ({ input, ctx }) => {
        console.log("Fetched filter events");
      console.log(input);
      const visibleEvents = getRoleOrLower(ctx.session?.user?.role);
      const filteredEvents = await ctx.prisma.event.findMany({
        where: {
          OR: [
            {
              visibility: {
                in: visibleEvents,
              },
            },
            {
              owners: {
                some: {
                  id: ctx.session?.user?.id,
                },
              },
            },
          ],
          visibility: {
            startsWith: input.visibility ?? "",
          },
          dates: {
            some: {
              start: {
                gte: input.startDate ? new Date(input.startDate) : new Date(0),
              },
              end: {
                lte: input.endDate
                  ? new Date(input.endDate)
                  : new Date(8640000000000),
              },
            },
          },
          AND: [
            {
              OR: [
                {
                  location: {
                    contains: input.text ?? "",
                  },
                },
                {
                  name: {
                    contains: input.text ?? "",
                  },
                },
                {
                  description: {
                    contains: input.text ?? "",
                  },
                },
              ],
            },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          location: true,
          visibility: true,
          tags: true,
          owners: {
            select: {
              id: true,
            },
          },
          confirmed: {
            select: {
              id: true,
            },
          },
        },
      });

      // Check owners, confirmed, and tags
      const secondFilter = filteredEvents.filter((event) => {
        const eventOwners = new Set(event.owners.map((owner) => owner.id));
        let hasOwner = true;

        input?.owners?.map((owner) => {
          if (!eventOwners.has(owner)) {
            hasOwner = false;
          }
        });

        if (!hasOwner) return false;

        const eventConfirmed = new Set(
          event.confirmed.map((confirmed) => confirmed.id)
        );
        let hasConfirmed = true;

        input?.confirmed?.map((confirmed) => {
          if (!eventConfirmed.has(confirmed)) {
            hasConfirmed = false;
          }
        });

        if (!hasConfirmed) return false;

        const eventTags = new Set(event.tags.map((tag) => tag.name));
        let hasTags = true;

        input?.tags?.map((tag) => {
          if (!eventTags.has(tag)) {
            hasTags = false;
          }
        });

        return hasTags;
      });

      const res = secondFilter.map((event) => event.id);
      console.log(res);
      return res;
    }),
});
