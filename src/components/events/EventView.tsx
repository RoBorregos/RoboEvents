import { api } from "~/utils/api";
import { PageSubtitle } from "~/components/general/PageElements";
import { useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import type { RouterOutputs } from "~/utils/api";
import ValidImage from "../general/ValidImage";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { AiOutlineExpandAlt, AiFillDelete } from "react-icons/ai";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { GenerateTags } from "~/components/general/Generate";
import type { DateStamp } from "@prisma/client";
import { OptionsContainer, OptionsInnerContainer } from "../general/Containers";
import { BottomCardRow } from "./BottomCardRow";
import { CardDetailsRow } from "./CardDetailsRow";

const EventView = ({
  dateStamp,
  className,
}: {
  dateStamp: DateStamp;
  className?: string;
}) => {
  const { data: event, isLoading } = api.event.getConciseEventInfo.useQuery({
    id: dateStamp.eventId,
  });

  return (
    <div
      className={twMerge(
        "flex h-fit w-full flex-wrap rounded-md bg-highlight p-2 text-tertiary",
        className
      )}
    >
      <PageContent
        eventID={dateStamp.eventId}
        event={event}
        isLoading={isLoading}
        start={dateStamp.start}
        end={dateStamp.end}
      />
    </div>
  );
};

export default EventView;

const PageContent = ({
  eventID,
  event,
  isLoading,
  start,
  end,
}: {
  eventID: string | null | undefined;
  event: RouterOutputs["event"]["getConciseEventInfo"] | undefined | null;
  isLoading: boolean;
  start: Date;
  end: Date;
}) => {
  const context = api.useContext();
  const { data: canEdit } = api.event.canEdit.useQuery({ id: eventID });

  const [displayDetails, setDisplayDetails] = useState(false);
  if (isLoading) {
    return (
      <PageSubtitle className="text-center text-white" text="Loading..." />
    );
  } else if (event) {
    return (
      <div className="w-full">
        {displayDetails && (
          <CardDetailsRow
            canEdit={canEdit}
            eventID={eventID}
            showVisit={true}
          />
        )}

        <div className="mt-2 flex flex-col rounded-lg bg-themebg p-2">
          <div className="flex flex-row">
            {displayDetails ? (
              <MdExpandLess
                size={35}
                className="mr-5"
                onClick={() => setDisplayDetails(false)}
              />
            ) : (
              <MdExpandMore
                size={35}
                className="mr-5"
                onClick={() => setDisplayDetails(true)}
              />
            )}
            <div className="flex w-full flex-col flex-wrap sm:flex-row">
              <PageSubtitle
                className="mb-0 text-left text-white"
                text={acotateText({ text: event.name, threshold: 40 })}
              />

              <div className="mt-2 flex flex-col text-left sm:ml-auto sm:mt-0 sm:text-right">
                <p>
                  <b>{start.toLocaleDateString()}</b>
                </p>
                <p>
                  <b>{getTimeString({ start, end })}</b>
                </p>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col items-center rounded-lg bg-themebg p-2 xsm:flex-row">
            <ValidImage
              className="m-3 h-40 w-40 rounded-lg"
              src={event.image}
            />

            <div className="flex flex-col justify-between overflow-y-auto xsm:h-40">
              <div>
                <p className="mb-3">
                  <b>Description:</b>{" "}
                  {acotateText({ text: event.description, threshold: 120 })}
                </p>
                <p className="mb-3">
                  <b>Location:</b>{" "}
                  {acotateText({ text: event.location, threshold: 30 })}
                </p>
              </div>

              <div>
                <p>
                  <b>Tags:</b>
                </p>
                <div className="mt-1 flex flex-row flex-wrap">
                  <GenerateTags maxTags={2} tags={event.tags} />
                </div>
              </div>
            </div>
          </div>
          <BottomCardRow eventID={eventID} />
        </div>
      </div>
    );
  } else {
    return (
      <PageSubtitle
        className="text-center text-white"
        text="Event not found."
      />
    );
  }
};

export const getTimeString = ({
  start,
  end,
}: {
  start: Date | undefined | null;
  end: Date | undefined | null;
}) => {
  const startString = start ? start.toLocaleString() : "???";
  const endString = end ? end.toLocaleString() : "???";

  const startHour = startString.split(", ")[1];
  const endHour = endString.split(", ")[1];

  let startT;
  let endT;

  if (startHour) {
    startT = startHour?.slice(0, -6);
  }
  if (endHour) {
    endT = endHour?.slice(0, -6);
  }

  // Add pm or am at the end if both are the same
  let addFinal = "";
  if (startHour?.endsWith("AM") && endHour?.endsWith("AM")) {
    addFinal = " AM";
  } else if (startHour?.endsWith("PM") && endHour?.endsWith("PM")) {
    addFinal = " PM";
  } else {
    startT = (startT ?? "") + " " + (startHour?.slice(-2) ?? "");
    endT = (endT ?? "") + " " + (endHour?.slice(-2) ?? "");
  }

  return `${startT ?? "???"} - ${endT ?? "???"} ${addFinal}`;
};

const acotateText = ({
  text,
  threshold,
}: {
  text: string;
  threshold: number;
}) => {
  if (text.length > threshold) {
    return text.slice(0, threshold) + "...";
  }

  return text;
};
