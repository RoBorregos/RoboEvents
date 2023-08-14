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

import { TRPCError } from "@trpc/server";
import { env } from "~/env.mjs";
import { compareRole, getHighestRole, onlyUpperRole } from "~/utils/role";
import { EventModel } from "~/zod/types";
import { getDays, generateDates } from "~/utils/dates";

// Input for an event of a single day:
// start time (js date) & end time (js date).

// Input for an event of multiple days:
// start time (js date) & end time (js date) & RRule.

export const eventRouter = createTRPCRouter({
  getModifyEventInfo: publicProcedure
    .input(z.object({ id: z.string().nullish() }))
    .query(async ({ input, ctx }) => {
      if (!input.id || !ctx.session?.user?.role) return null;

      const event = await ctx.prisma.event.findUnique({
        where: {
          id: input.id,
        },
        include: {
          owners: true,
          tags: true,
          confirmed: true,
        },
      });

      if (!event) return null;

      // Only check if user can see the event. Modification permission is checked in the mutation
      if (compareRole(ctx.session?.user?.role, event.visibility)) return event;

      return null;
    }),
  modifyOrCreateEvent: protectedProcedure
    .input(EventModel)
    .mutation(async ({ input, ctx }) => {
      if (input.id) {
        const eventOwners = await ctx.prisma.event.findUnique({
          where: {
            id: input.id,
          },
          select: {
            owners: {
              select: {
                id: true,
              },
            },
          },
        });

        if (!eventOwners) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Event with id ${input.id} not found.`,
          });
        }

        if (
          !eventOwners.owners.find(
            (owner) => owner.id === ctx.session?.user?.id
          )
        ) {
          const users = await ctx.prisma.user.findMany({
            where: {
              id: {
                in: input.ownersId,
              },
            },
            select: {
              role: true,
            },
          });
          const highestRole = getHighestRole(users);

          if (!onlyUpperRole(highestRole, ctx.session?.user?.role)) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: `You are not authorized to modify this event.`,
            });
          }
        }
      } else {
        if (!compareRole("communityMember", ctx.session.user.role)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: `You are not authorized to create an event.`,
          });
        }
      }

      // Create the event.

      const newOwners = input.ownersId.map((ownerId) => {
        return { id: ownerId };
      });

      let isCreatorPresent = false;

      newOwners.map((owner) => {
        if (owner.id === ctx.session?.user?.id) {
          isCreatorPresent = true;
        }
      });

      if (!isCreatorPresent) {
        newOwners.push({ id: ctx.session?.user?.id });
      }

      const newTags = input.tags.map((tag) => {
        return { name: tag };
      });

      // Create specified tags if they don't exits.
      for (const tag of input.tags) {
        const upsert = await ctx.prisma.tag.upsert({
          where: {
            name: tag,
          },
          update: {},
          create: {
            name: tag,
            tagColor: "blue",
          },
        });
      }

      deleteDates(input.id ?? "-1", ctx.prisma);
      const dates = generateDates(input.startTime, input.endTime, input.rrule);

      const event = await ctx.prisma.event.upsert({
        where: {
          id: input.id ?? "-1",
        },
        update: {
          name: input.name,
          owners: {
            set: newOwners,
          },
          description: input.description,
          image: input.image ?? env.NEXT_PUBLIC_DEFAULT_IMAGE,
          location: input.location,
          visibility: input.visibility,
          tags: {
            set: newTags,
          },
          dates: {
            create: dates,
          },
          rrule: input.rrule,
        },
        create: {
          name: input.name,
          owners: {
            connect: newOwners,
          },
          description: input.description,
          image: input.image ?? env.NEXT_PUBLIC_DEFAULT_IMAGE,
          location: input.location,
          visibility: input.visibility,
          tags: {
            connect: newTags,
          },
          dates: {
            create: dates,
          },
          rrule: input.rrule,
        },
      });

      return true;
    }),
});

// Delete dates when an event is modified.
const deleteDates = async (eventId: string, prisma: Prisma) => {
  await prisma.date.deleteMany({
    where: {
      eventId: eventId,
    },
  });
};
