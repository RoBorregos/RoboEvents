import { z } from "zod";

// TODO: check for autogenerators given schema. E.g zod-prisma

export const EventModel = z.object({
  id: z.string().nullish(),
  name: z.string(),
  ownersId: z.array(z.string()),
  description: z.string(),
  image: z.string().nullish(),
  location: z.string(),
  visibility: z.string(),
  linkVisibility: z.string(),
  tags: z.array(z.string()),
  startTime: z.date(),
  endTime: z.date(),
  rrule: z.string().nullish(),
});
