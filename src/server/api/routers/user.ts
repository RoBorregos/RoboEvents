import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  communityProcedure,
  organizationProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { uploadProfilePicture, getTypeImageBase64, getProfilePictureUrl } from "~/server/supabase";
import {env} from "~/env.mjs";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  // Return user info, considering if the user is the owner of the profile or not
  getUserInfo: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      let user;
      if (input === ctx.session?.user?.id) {
        user = await ctx.prisma.user.findUnique({
          where: {
            id: input,
          },
        });
      } else {
        user = await ctx.prisma.user.findUnique({
          where: {
            id: input,
          },
          select: {
            id: true,
            username: true,
            name: true,
            role: true,
            image: true,
          },
        });
      }

      return { ...user, owner: input === ctx.session?.user?.id };
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
      if (!user) return true;
      return false;
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
          if (ctx.session.user.image){
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
        if (user.username){
          return {id: user.id, info: user.username};
        } else if (user.name){
          return {id: user.id, info: user.name};
        }
        return {id: user.id, info: "Unnamed"};
      });

      return leastData;
    }), 
});
