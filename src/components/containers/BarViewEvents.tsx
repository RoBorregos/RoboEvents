import { api } from "~/utils/api";
import { PageSubtitle } from "~/components/general/PageElements";
import type { RouterOutputs } from "~/utils/api";
import ValidImage from "../general/ValidImage";
import { useState, useEffect } from "react";
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import EventModify from "../events/EventModify";
import { DateStamp } from "@prisma/client";

const BarViewEvents = () => {
  const [time, setTime] = useState(new Date());
  const [useDate, setUseDate] = useState(false);
  const [previousEvents, setPreviousEvents] = useState(false);
  const [yearlyEvents, setYearlyEvents] = useState(false);
  const [hideRepeatedEvents, setHideRepeatedEvents] = useState(false);

  const { data: eventIds, isLoading } = api.dateStamp.getEventsByTime.useQuery(
    {
      date: time.toString(),
      previous: previousEvents,
      unique: hideRepeatedEvents,
      monthly: !yearlyEvents,
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  console.log(eventIds);
  // console.log("date: ", time.toString());
  // console.log("previous: ", previousEvents);
  // console.log("unique: ", hideRepeatedEvents);
  // console.log("monthly: ", !yearlyEvents);

  // Avoid different hours in server and component
  useEffect(() => {
    setTime(new Date());
    setUseDate(true);
  }, [useDate]);

  const handleArrowClick = (back: boolean) => {
    const change = back ? -1 : 1;
    const newTime = new Date(time);

    if (yearlyEvents) {
      newTime.setFullYear(newTime.getFullYear() + change);
    } else {
      newTime.setMonth(newTime.getMonth() + change);
    }
    setTime(newTime);
  };

  const title = capitalizeString(
    time.toLocaleDateString("es-mx", {
      year: "numeric",
      month: yearlyEvents ? undefined : "long",
    })
  );

  return (
    <div>
      <div className="m-2 flex flex-row items-center justify-center">
        <GrFormPreviousLink
          onClick={() => void handleArrowClick(true)}
          className="align-bottom"
          size={42}
        />
        <h2 className="mx-4 text-center text-4xl font-semibold">
          {useDate && title}
        </h2>
        <GrFormNextLink
          onClick={() => void handleArrowClick(false)}
          size={42}
        />
      </div>
      <div className="flex w-full flex-row flex-wrap rounded-md bg-highlight p-2 text-white">
        <div className="m-2 flex flex-row items-center">
          {previousEvents ? (
            <ImCheckboxChecked
              className="mr-2"
              onClick={() => setPreviousEvents(false)}
            />
          ) : (
            <ImCheckboxUnchecked
              className="mr-2"
              onClick={() => setPreviousEvents(true)}
            />
          )}
          <h3>Previous events</h3>
        </div>

        <div className="m-2 flex flex-row items-center">
          {yearlyEvents ? (
            <ImCheckboxChecked
              className="mr-2"
              onClick={() => setYearlyEvents(false)}
            />
          ) : (
            <ImCheckboxUnchecked
              className="mr-2"
              onClick={() => setYearlyEvents(true)}
            />
          )}
          <h3>Show by Year</h3>
        </div>
        <div className="m-2 flex flex-row items-center">
          {hideRepeatedEvents ? (
            <ImCheckboxChecked
              className="mr-2"
              onClick={() => setHideRepeatedEvents(false)}
            />
          ) : (
            <ImCheckboxUnchecked
              className="mr-2"
              onClick={() => setHideRepeatedEvents(true)}
            />
          )}
          <h3>Hide Repeated Events</h3>
        </div>
      </div>
      <div className="mt-4">
        <PageContent
          timeStamps={eventIds}
          yearlyEvents={yearlyEvents}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default BarViewEvents;

const PageContent = ({
  timeStamps,
  yearlyEvents,
  isLoading,
}: {
  timeStamps: RouterOutputs["dateStamp"]["getEventsByTime"] | undefined | null;
  yearlyEvents: boolean;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <PageSubtitle className="text-center text-black" text="Loading..." />
    );
  } else if (!timeStamps || timeStamps.length == 0) {
    return (
      <PageSubtitle
        className="mt-3 text-center text-3xl text-black"
        text="No visible events for this time period."
      />
    );
  } else {
    if (yearlyEvents) {
      const events = eventsPerMonth({ timeStamps });

      if (!events) return <PageSubtitle text="No events available." />;
      const dateIterate = new Date();

      const eventsJsx: JSX.Element[] = [];

      for (let i = 0; i < events.length; i++) {
        dateIterate.setMonth(i);

        const title = capitalizeString(
          dateIterate.toLocaleDateString("es-mx", {
            month: "long",
          })
        );

        let addJSX = false;
        const tempJSX = (
          <div className="flex w-full flex-col">
            <div className="w-full rounded-lg bg-themebg p-2 text-center text-2xl font-semibold text-white">
              <h4>{title}</h4>
            </div>
            <div className="my-2 flex flex-row flex-wrap">
              {events[i]?.length ?? 0 > 0 ? (
                events[i]?.map((stamp) => {
                  addJSX = true;
                  return (
                    <EventModify
                      className="mx-2"
                      eventId={stamp.eventId}
                      key={stamp.id}
                    />
                  );
                })
              ) : (
                <PageSubtitle text="No events in this month." />
              )}
            </div>
          </div>
        );

        if (addJSX)
          eventsJsx.push(<div className="flex w-full flex-row">{tempJSX}</div>);
      }

      return (
        <div className="flex flex-col">
          {eventsJsx.length > 0 ? (
            eventsJsx
          ) : (
            <PageSubtitle text="No events this year" />
          )}
        </div>
      );
    } else {
      return (
        <div className="flex flex-row flex-wrap ">
          {timeStamps.map((stamp) => (
            <EventModify className="mx-2" eventId={stamp.eventId} key={stamp.id} />
          ))}
        </div>
      );
    }
  }
};

const eventsPerMonth = ({
  timeStamps,
}: {
  timeStamps: RouterOutputs["dateStamp"]["getEventsByTime"] | undefined | null;
}) => {
  // index -> month
  if (!timeStamps) return false;

  const eventsPerMonth: DateStamp[][] = [];

  for (let i = 0; i < 12; i++) {
    eventsPerMonth.push([]);
  }

  timeStamps.map((stamp) => {
    const monthNumber = stamp.start.getMonth();
    eventsPerMonth[monthNumber]?.push(stamp);
  });

  return eventsPerMonth;
};

const capitalizeString = (word: string | undefined | null) => {
  if (!word) return "";

  if (word.length > 0) {
    return (word[0]?.toUpperCase() ?? "") + word.slice(1) ?? "";
  }

  return "";
};
