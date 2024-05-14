import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  data?: {
    available: boolean;
  };
  error?: {
    message: string;
  };
};

const caller = appRouter.event.createCaller({ session: null, prisma });

const isAvailable = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  const link = req.query.link as string;
  if (!link) {
    res.status(400).json({ error: { message: "No link provided" } });
  }

  try {
    const postResult = await caller.isShortNameAvailable({ shortLink: link});

    res.status(200).json({ data: { available: postResult } });
  } catch (cause) {
    if (cause instanceof TRPCError) {
      const httpStatusCode = getHTTPStatusCodeFromError(cause);

      res.status(httpStatusCode).json({ error: { message: cause.message } });
    }
    res.status(500).json({
      error: { message: `Error while searching shortlink ${link}` },
    });
  }
};

export default isAvailable;
