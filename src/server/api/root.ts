import { exampleRouter } from "~/server/api/routers/example";
import { authorizationRouter } from "./routers/authorization";
import { createTRPCRouter } from "~/server/api/trpc";
import { utilRouter } from "./routers/util";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  authorization: authorizationRouter,
  util: utilRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
