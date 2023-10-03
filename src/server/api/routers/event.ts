import type { Prisma } from "~/server/db";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  organizationProcedure,
} from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";
import {
  compareRole,
  getHighestRole,
  getRoleOrLower,
  onlyUpperRole,
  roleOrLower,
} from "~/utils/role";
import { EventModel } from "~/zod/types";
import { generateDates } from "~/utils/dates";
import { getImageLink } from "~/server/supabase";

// Input for an event of a single day:
// start time (js date) & end time (js date).

// Input for an event of multiple days:
// start time (js date) & end time (js date) & RRule.

export const eventRouter = createTRPCRouter({
  getConciseEventInfo: publicProcedure
    .input(z.object({ id: z.string().nullish() }))
    .query(async ({ input, ctx }) => {
      if (!input.id) return null;

      const event = await ctx.prisma.event.findUnique({
        where: {
          id: input.id,
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
        },
      });

      if (!event) return null;

      // Only check if user can see the event. Modification permission is checked in the mutation
      if (
        canSeeEvent({
          visibility: event.visibility,
          ownersId: event.owners.map((owner) => owner.id),
          userId: ctx.session?.user?.id,
          userRole: ctx.session?.user?.role,
        })
      )
        return event;

      return null;
    }),

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
        canSeeEvent({
          visibility: event.visibility,
          linkVisibility: event.linkVisibility,
          ownersId: event.owners.map((owner) => owner.id),
          userId: ctx.session?.user?.id,
          userRole: ctx.session?.user?.role,
        })
      ) {
        return event;
      } else {
        return `Not allowed, needed role: ${event.visibility}.`;
      }
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
      });
      return startDate;
    }),

  getVisibleEventIds: publicProcedure.query(async ({ ctx }) => {
    const visibleEvents =
      roleOrLower[ctx.session?.user?.role ?? "unauthenticated"];
    const events = await ctx.prisma.event.findMany({
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
      },
      select: {
        id: true,
      },
    });
    return events;
  }),
  getEventConfirmedUsers: publicProcedure
    .input(z.object({ eventId: z.string().nullish() }))
    .query(async ({ input, ctx }) => {
      if (!input.eventId) return false;

      const confirmedUsers = await ctx.prisma.event.findUnique({
        where: {
          id: input.eventId,
        },
        select: {
          confirmed: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
      });

      // Share the least amount of data possible with the front-end.
      const confirmedUsersInfo = confirmedUsers?.confirmed.map((user) => {
        if (user.username) {
          return { id: user.id, info: user.username };
        } else if (user.name) {
          return { id: user.id, info: user.name };
        } else {
          return { id: user.id, info: user.id };
        }
      });

      if (!confirmedUsersInfo || confirmedUsersInfo.length == 0) return false;

      return confirmedUsersInfo;
    }),

  getEventOwners: publicProcedure
    .input(z.object({ eventId: z.string().nullish() }))
    .query(async ({ input, ctx }) => {
      if (!input.eventId) return false;

      const eventOwners = await ctx.prisma.event.findUnique({
        where: {
          id: input.eventId,
        },
        select: {
          owners: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
      });

      if (!eventOwners) return false;

      return eventOwners.owners.map((owner) => {
        if (owner.username) {
          return { id: owner.id, info: owner.username };
        } else if (owner.name) {
          return { id: owner.id, info: owner.name };
        } else {
          return { id: owner.id, info: owner.id };
        }
      });
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

  getStartAndEnd: publicProcedure
    .input(
      z.object({ eventId: z.string().nullish(), date: z.string().nullish() })
    )
    .query(async ({ ctx, input }) => {
      if (!input.eventId) return false;
      const start = await ctx.prisma.dateStamp.findFirst({
        where: {
          eventId: input.eventId,
          start: {
            gte: new Date(input.date ?? 0),
          },
        },
        orderBy: {
          start: "asc",
        },
      });

      return start;
    }),
  deleteEvent: organizationProcedure
    .input(z.object({ id: z.string().nullish() }))
    .mutation(async ({ input, ctx }) => {
      if (!input.id || !ctx.session?.user?.role || !ctx.session.user.id)
        return "No id or user role.";

      const canEditEvent = await canEditOrCreateEvent({
        eventId: input.id,
        prisma: ctx.prisma,
        userId: ctx.session.user.id,
        userRole: ctx.session.user.role,
      });

      if (!canEditEvent) return "You are not authorized to delete this event.";

      await ctx.prisma.event.delete({
        where: {
          id: input.id,
        },
      });

      return "Event deleted.";
    }),
  modifyOrCreateEvent: protectedProcedure
    .input(EventModel)
    .mutation(async ({ input, ctx }) => {
      const canContinue = await canEditOrCreateEvent({
        eventId: input.id,
        prisma: ctx.prisma,
        userId: ctx.session.user.id,
        userRole: ctx.session?.user?.role ?? "",
        logError: true,
      });
      if (!canContinue) return false;

      if (!input.id)
        input.id = `${ctx.session.user.id}-${Date.now().toString()}`;

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
        newOwners.push({ id: ctx.session.user.id });
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
              linkVisibility: input.linkVisibility,
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
              linkVisibility: input.linkVisibility,
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
        console.log("Error: ", err);
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
  logError,
}: {
  eventId: string | undefined | null;
  prisma: Prisma;
  userId: string;
  userRole: string;
  logError?: boolean;
}) => {
  try {
    await validateModifyEventPermissions({
      eventId: eventId,
      prisma: prisma,
      userId: userId,
      userRole: userRole,
    });
  } catch (error) {
    if (logError) {
      console.log("Error: ");
      console.log(error);
    }
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
      const highestRole = getHighestRole(users, "organizationMember");
      if (!onlyUpperRole({ upperThan: highestRole, userRole: userRole })) {
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

const canSeeEvent = ({
  visibility,
  linkVisibility,
  ownersId,
  userId,
  userRole,
}: {
  visibility: string;
  linkVisibility?: string;
  ownersId: string[];
  userId: string | undefined | null;
  userRole: string | undefined | null;
}) => {
  if (
    compareRole({
      requiredRole: visibility,
      userRole: userRole ?? "unauthenticated",
    })
  )
    return true;

  if (
    linkVisibility &&
    compareRole({
      requiredRole: linkVisibility,
      userRole: userRole ?? "unauthenticated",
    })
  )
    return true;

  if (ownersId.includes(userId ?? "-1")) return true;

  return false;
};
