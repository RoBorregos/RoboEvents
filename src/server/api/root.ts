import { authorizationRouter } from "./routers/authorization";
import { createTRPCRouter } from "~/server/api/trpc";
import { utilRouter } from "./routers/util";
import { userRouter } from "./routers/user";
import { eventRouter } from "./routers/event";
import { dateRouter } from "./routers/dateStamp";
import { filterRouter } from "./routers/filter";
import { countdownRouter } from "./routers/countdown";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */

export const appRouter = createTRPCRouter({
  authorization: authorizationRouter,
  util: utilRouter,
  user: userRouter,
  event: eventRouter,
  dateStamp: dateRouter,
  filter: filterRouter,
  countdown: countdownRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
