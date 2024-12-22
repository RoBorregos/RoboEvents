import Layout from "~/components/layout/Layout";
import Image from "next/image";

import { PageSubtitle, PageTitle } from "~/components/general/PageElements";
import { api, type RouterOutputs } from "~/utils/api";

import teamPic from "../../../public/images/team.jpg";
import robologo from "../../../public/images/white-logo.png";

import { useRef } from "react";

import { CountdownTimer } from "~/components/general/CountdownTimer";
import { Carousel } from "~/components/general/Carousel";

export default function Countdown() {
  // Get the default options for select components, using query params.

  const ids = [
    "clld2iist0000lp1c61e2zmpo-1693167491895",
    "cllv6t5ly0006mv087um4ho5l-1734889134333",
  ];

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

  const eventsView = events
    ? events.map((event) => <DisplayEvent key={event.id} event={event} />)
    : [];

  return (
    <Layout>
      <main className="relative bg-black">
        <section className="flex min-h-[100vw] flex-col overflow-hidden lg:min-h-screen">
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
        <div className="absolute left-1/2 top-1/2 z-30 w-full -translate-x-1/2">
          {isLoading ? (
            <PageTitle text="Loading..." />
          ) : eventsView?.length ?? 0 > 0 ? (
            <Carousel events={eventsView} />
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
      <h1 className="line-clamp-1 text-[6vw] text-white lg:text-[6vw]">
        {event.name}
      </h1>
      <p className="mb-36 line-clamp-2 text-[2vw] text-white lg:text-[3vw]">
        {event.description}
      </p>
      <CountdownTimer targetDate={targetDate} />
    </div>
  );
};
