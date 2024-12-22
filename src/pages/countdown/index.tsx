import Layout from "~/components/layout/Layout";
import {
  PageBody,
  PageSubtitle,
  PageTitle,
} from "~/components/general/PageElements";
import { api, type RouterOutputs } from "~/utils/api";

import { useRef, useState, useEffect } from "react";

import { cn } from "~/utils/style";

import { calculateTimeLeft } from "~/utils/dates";
import Carousel from "~/components/general/Carousel";

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
      <PageBody>
        <Carousel />
        {isLoading ? (
          <PageTitle text="Loading..." />
        ) : currentEvent ? (
          <DisplayEvent event={currentEvent} />
        ) : (
          <PageSubtitle text="No events found" />
        )}
      </PageBody>
    </Layout>
  );
}

const DisplayEvent = ({
  event,
}: {
  event: RouterOutputs["countdown"]["getEventsByIds"][0];
}) => {
  const targetDate = new Date(event.dates[0]?.start ?? new Date());
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearTimeout(timer);
  });

  return (
    <div
      className={cn(
        "font-archivo flex flex-row items-center justify-center gap-x-20 text-5xl text-white"
      )}
    >
      {timeLeft.days > 0 && <CountdownLabel time={timeLeft.days} unit="Days" />}
      {(timeLeft.hours > 0 || timeLeft.days > 0) && (
        <CountdownLabel time={timeLeft.hours} unit="Hours" />
      )}
      {(timeLeft.hours > 0 || timeLeft.days > 0 || timeLeft.minutes > 0) && (
        <CountdownLabel time={timeLeft.minutes} unit="Minutes" />
      )}
      {(timeLeft.hours > 0 ||
        timeLeft.days > 0 ||
        timeLeft.minutes > 0 ||
        timeLeft.seconds > 0) && (
        <CountdownLabel time={timeLeft.seconds} unit="Seconds" />
      )}
    </div>
  );
};

const CountdownLabel = ({ time, unit }: { time: number; unit: string }) => {
  return (
    <div className="flex flex-col gap-y-5 text-center">
      <p
        className="font-digital text-9xl text-slate-400"
        suppressHydrationWarning
      >
        {time}
      </p>{" "}
      <p>{unit}</p>
    </div>
  );
};
