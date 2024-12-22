import Layout from "~/components/layout/Layout";
import Image from "next/image";

import { PageSubtitle, PageTitle } from "~/components/general/PageElements";
import { api, type RouterOutputs } from "~/utils/api";

import teamPic from "../../../public/images/team.jpg";
import robologo from "../../../public/images/white-logo.png";

import { useRef } from "react";

import { CountdownTimer } from "~/components/general/CountdownTimer";

export default function Countdown() {
  // Get the default options for select components, using query params.

  const ids = ["clld2iist0000lp1c61e2zmpo-1693167491895"];

  // Get the filtered events
  const { data: events, isLoading } = api.countdown.getEventsByIds.useQuery(
    {
      ids: ids,
    },
    {
      refetchOnMount: false,
      enabled: Boolean(ids) && ids.length > 0,
    }
  );

  // first refetch
  const currentEventIndex = useRef(0);

  if (!events) {
    currentEventIndex.current = 0;
  } else if (currentEventIndex.current >= events?.length) {
    currentEventIndex.current = 0;
  } else if (currentEventIndex.current < 0) {
    currentEventIndex.current = events?.length - 1;
  }

  const currentEvent = events?.[currentEventIndex.current];

  return (
    <Layout>
      <main className="bg-black">
        <section className="relative flex min-h-[100vw] flex-col overflow-hidden lg:min-h-screen">
          <div className="z-10 mt-[45vw] text-center lg:mt-32">
            {/* <h1 className="font-jersey_25 text-roboblue text-[13vw] leading-none lg:text-[12vw]">
              CANDIDATES
            </h1>
            <p className="font-anton mt-[-2vw] text-[6vw] text-white lg:text-[3vw]">
              By RoBorregos
            </p> */}
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <Image
              src={robologo}
              alt=""
              className="w-[40vw] object-cover opacity-20 lg:w-[40vw]"
            />
          </div>
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black to-transparent" />
          <Image
            src={teamPic}
            alt=""
            layout="fill"
            objectFit="cover"
            className="opacity-20"
            // the black fade is covering the image
          />
        </section>
        <div className="absolute inset-20 z-30">
          {isLoading ? (
            <PageTitle text="Loading..." />
          ) : currentEvent ? (
            <DisplayEvent event={currentEvent} />
          ) : (
            <PageSubtitle text="No events found" />
          )}
        </div>
      </main>
    </Layout>
  );
}

const DisplayEvent = ({
  event,
}: {
  event: RouterOutputs["countdown"]["getEventsByIds"][0];
}) => {
  const targetDate = new Date(event.dates[0]?.start ?? new Date());

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-[6vw] text-white lg:text-[7vw]">{event.name}</h1>
      <p className="mb-36 text-[2vw] text-white lg:text-[3vw]">
        {event.description}
      </p>
      <CountdownTimer targetDate={targetDate} />
    </div>
  );
};
