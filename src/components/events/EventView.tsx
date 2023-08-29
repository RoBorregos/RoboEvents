import { api } from "~/utils/api";
import { PageSubtitle } from "~/components/general/PageElements";
import { useState } from "react";
import type { RouterOutputs } from "~/utils/api";
import ValidImage from "../general/ValidImage";
import { twMerge } from "tailwind-merge";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { GenerateTags } from "~/components/general/Generate";
import type { DateStamp } from "@prisma/client";
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
      <PageContent dateStamp={dateStamp} event={event} isLoading={isLoading} />
    </div>
  );
};

export default EventView;

const PageContent = ({
  dateStamp,
  event,
  isLoading,
}: {
  dateStamp: DateStamp;
  event: RouterOutputs["event"]["getConciseEventInfo"] | undefined | null;
  isLoading: boolean;
}) => {
  const { data: canEdit } = api.event.canEdit.useQuery({
    id: dateStamp.eventId,
  });

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
            eventID={dateStamp.eventId}
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
                  <b>{dateStamp.start.toLocaleDateString()}</b>
                </p>
                <p>
                  <b>
                    {getTimeString({
                      start: dateStamp.start,
                      end: dateStamp.end,
                    })}
                  </b>
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
          <BottomCardRow event={event} date={dateStamp} />
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

  let startT = "???";
  let endT = "???";

  if (start){
    startT = start.getHours().toString().padStart(2, "0") + ":" + start.getMinutes().toString().padStart(2, "0");
  }

  if (end){
    endT = end.getHours().toString().padStart(2, "0") + ":" + end.getMinutes().toString().padStart(2, "0");
  }

  if (start && end && (start.getHours() > end.getHours() || (start.getHours() == end.getHours() && start.getMinutes() > end.getMinutes()))){
    return `${startT} - ${endT} (next day)`;
  }

  return `${startT} - ${endT}`;
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
