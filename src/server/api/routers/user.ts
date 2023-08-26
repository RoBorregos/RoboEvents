import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import {
  uploadProfilePicture,
  getTypeImageBase64,
  getProfilePictureUrl,
} from "~/server/supabase";
import { env } from "~/env.mjs";
import { z } from "zod";
import { roleOrLower } from "~/utils/role";

export const userRouter = createTRPCRouter({
  // Return user info, considering if the user is the owner of the profile or not
  getUserInfo: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      let user;
      if (input.id === ctx.session?.user?.id) {
        user = await ctx.prisma.user.findUnique({
          where: {
            id: input.id,
          },
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
            image: true,
            description: true,
            eventsOwned: {
              select: {
                id: true,
                name: true,
              },
            },
            eventsConfirmed: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
        return { ...user, owner: true };
      } else {
        const visibleEvents =
          roleOrLower[ctx.session?.user?.role ?? "unauthenticated"];

        user = await ctx.prisma.user.findUnique({
          where: {
            id: input.id,
          },
          select: {
            id: true,
            username: true,
            name: true,
            role: true,
            image: true,
            description: true,
            eventsOwned: {
              where: {
                visibility: {
                  in: visibleEvents,
                },
              },
            },
            eventsConfirmed: {
              where: {
                visibility: {
                  in: visibleEvents,
                },
              },
            },
          },
        });
      }

      return { ...user, owner: false };
    }),
  fullInfo: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      if (input === ctx.session?.user?.id) {
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: input,
          },
        });
        return user;
      }
      return null;
    }),
  isAvailable: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          username: input,
        },
      });
      if (!user || user.id === ctx.session?.user.id) return true;
      return false;
    }),

  isConfirmed: publicProcedure
    .input(
      z.object({ eventId: z.string().nullish(), userId: z.string().nullish() })
    )
    .query(async ({ input, ctx }) => {
      if (!input.eventId || !input.userId) return false;

      const found = await ctx.prisma.event.findFirst({
        where: {
          id: input.eventId,
          confirmed: {
            some: {
              id: input.userId,
            },
          },
        },
        select: {
          confirmed: true,
        },
      });
      if (found) return true;
      return false;
    }),
  // Return true if a change was made
  setConfirmed: protectedProcedure
    .input(
      z.object({
        eventId: z.string().nullish(),
        userId: z.string().nullish(),
        confirmed: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.eventId || !input.userId) return false;

      if (input.confirmed) {
        await ctx.prisma.event.update({
          where: {
            id: input.eventId,
          },
          data: {
            confirmed: {
              connect: { id: input.userId },
            },
          },
        });
      } else {
        await ctx.prisma.event.update({
          where: {
            id: input.eventId,
          },
          data: {
            confirmed: {
              disconnect: { id: input.userId },
            },
          },
        });
      }

      return true;
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        username: z.string(),
        description: z.string(),
        profilePicture: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.profilePicture.startsWith("data:image")) {
        const result = await uploadProfilePicture({
          file: input.profilePicture,
          profileId: ctx.session.user.id,
          type: getTypeImageBase64(input.profilePicture),
        });

        if (result.error) {
          if (ctx.session.user.image) {
            input.profilePicture = ctx.session.user.image;
          } else {
            input.profilePicture = env.NEXT_PUBLIC_DEFAULT_IMAGE;
          }

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.error.message,
          });
        } else {
          input.profilePicture = getProfilePictureUrl(result.data.path);
        }
      }

      const user = await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          username: input.username,
          description: input.description,
          image: input.profilePicture,
        },
      });
      return user;
    }),

  getAllUserId: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
      },
    });

    const leastData = users.map((user) => {
      if (user.username) {
        return { id: user.id, info: user.username };
      } else if (user.name) {
        return { id: user.id, info: user.name };
      }
      return { id: user.id, info: "Unnamed" };
    });

    return leastData;
  }),
});
