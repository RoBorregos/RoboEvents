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
import {
  compareRole,
  getHighestRole,
  getRoleOrLower,
  onlyUpperRole,
  roleOrLower,
} from "~/utils/role";
import { EventModel } from "~/zod/types";
import { getDays, generateDates } from "~/utils/dates";
import { getImageLink } from "~/server/supabase";

// Input for an event of a single day:
// start time (js date) & end time (js date).

// Input for an event of multiple days:
// start time (js date) & end time (js date) & RRule.

export const eventRouter = createTRPCRouter({
  getModifyEventInfo: publicProcedure
    .input(z.object({ id: z.string().nullish() }))
    .query(async ({ input, ctx }) => {
      if (!input.id) return null;

      const event = await ctx.prisma.event.findUnique({
        where: {
          id: input.id,
        },
        include: {
          owners: {
            select: {
              username: true,
              name: true,
              id: true,
            },
          },
          tags: true,
          confirmed: true,
        },
      });
    
      if (!event) return null;

      // Only check if user can see the event. Modification permission is checked in the mutation
      if (
        compareRole({
          requiredRole: event.visibility,
          userRole: ctx.session?.user?.role,
        })
      )
        return event;

      return null;
    }),
  getEventStart: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const startDate = await ctx.prisma.dateStamp.findFirst({
        where: {
          eventId: input.id,
        },
        orderBy: {
          start: "asc",
        },
        select: {
          start: true,
          end: true,
        },
      });
      return startDate;
    }),

  getVisibleEventIds: publicProcedure.query(async ({ ctx }) => {
    const visibleEvents =
      roleOrLower[ctx.session?.user?.role ?? "unauthenticated"];
    const events = await ctx.prisma.event.findMany({
      where: {
        visibility: {
          in: visibleEvents,
        },
      },
      select: {
        id: true,
      },
    });
    return events;
  }),

  getEventById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const visibleEvents = getRoleOrLower(ctx.session?.user?.role);
      const event = await ctx.prisma.event.findFirst({
        where: {
          id: input.id,
          visibility: {
            in: visibleEvents,
          },
        },
      });

      return event;
    }),

  canEdit: publicProcedure
    .input(z.object({ id: z.string().nullish() }))
    .query(async ({ input, ctx }) => {
      if (!input.id || !ctx.session?.user?.role || !ctx.session.user.id)
        return false;

      const canEditEvent = await canEditOrCreateEvent({
        eventId: input.id,
        prisma: ctx.prisma,
        userId: ctx.session.user.id,
        userRole: ctx.session.user.role,
      });
      return canEditEvent;
    }),

  modifyOrCreateEvent: protectedProcedure
    .input(EventModel)
    .mutation(async ({ input, ctx }) => {
      try {
        await validateModifyEventPermissions({
          eventId: input.id,
          prisma: ctx.prisma,
          userId: ctx.session.user.id,
          userRole: ctx.session?.user?.role ?? "",
        });
      } catch (error) {
        console.log("Error: ", error);
        return false;
      }
      const canContinue = await canEditOrCreateEvent({
        eventId: input.id,
        prisma: ctx.prisma,
        userId: ctx.session.user.id,
        userRole: ctx.session?.user?.role ?? "",
      });
      if (!canContinue) return false;

      if (!input.id)
        input.id = `${ctx.session.user.id}-${Date.now().toString()}`;

      console.log("Event time server:")
      console.log(input.startTime.toISOString())
      // Create the event.

      // Obtain needed data

      const dates = generateDates(input.startTime, input.endTime, input.rrule);
      // Get Image link if it's a base64 string.
      input.image = await getImageLink(input.id, input.image, "event-pictures");

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

      // DB operations

      // Use transaction to ensure that all operations succeed or fail together.
      try {
        await ctx.prisma.$transaction(async (prisma) => {
          for (const tag of input.tags) {
            await prisma.tag.upsert({
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

          await prisma.dateStamp.deleteMany({
            where: {
              eventId: input.id as string,
            },
          });

          await prisma.event.upsert({
            where: {
              id: input.id as string,
            },
            update: {
              name: input.name,
              owners: {
                set: newOwners,
              },
              description: input.description,
              image: input.image as string,
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
              id: input.id as string,
              name: input.name,
              owners: {
                connect: newOwners,
              },
              description: input.description,
              image: input.image as string,
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
        });
      } catch (err) {
        console.log("Error: ");
        console.log(err);
        return false;
      }

      return true;
    }),
});

const canEditOrCreateEvent = async ({
  eventId,
  prisma,
  userId,
  userRole,
}: {
  eventId: string | undefined | null;
  prisma: Prisma;
  userId: string;
  userRole: string;
}) => {
  try {
    await validateModifyEventPermissions({
      eventId: eventId,
      prisma: prisma,
      userId: userId,
      userRole: userRole,
    });
  } catch (error) {
    console.log("Error: ", error);
    return false;
  }
  return true;
};

const validateModifyEventPermissions = async ({
  eventId,
  prisma,
  userId,
  userRole,
}: {
  eventId: string | undefined | null;
  prisma: Prisma;
  userId: string;
  userRole: string;
}) => {
  if (eventId) {
    const eventOwners = await prisma.event.findUnique({
      where: {
        id: eventId,
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
        message: `Event with id ${eventId} not found.`,
      });
    }

    if (!eventOwners.owners.find((owner) => owner.id === userId)) {
      const users = await prisma.user.findMany({
        where: {
          id: {
            in: eventOwners.owners.map((owner) => owner.id),
          },
        },
        select: {
          role: true,
        },
      });
      const highestRole = getHighestRole(users);

      if (!onlyUpperRole(highestRole, userRole)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `You are not authorized to modify this event.`,
        });
      }
    }
  } else {
    if (
      !compareRole({ requiredRole: "organizationMember", userRole: userRole })
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `You are not authorized to create an event.`,
      });
    }
  }
};
