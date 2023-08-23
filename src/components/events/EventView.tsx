import { api } from "~/utils/api";
import { PageSubtitle } from "~/components/general/PageElements";
import { type CreateEventStyle, CreateEventForm } from "./CreateEventForm";
import { useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import type { RouterOutputs } from "~/utils/api";
import ValidImage from "../general/ValidImage";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { AiOutlineExpandAlt } from "react-icons/ai";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { GenerateTags } from "~/components/tags/GenerateTags";

const EventView = ({
  eventId,
  className,
}: {
  eventId: string | undefined | null;
  className?: string;
}) => {
  const { data: event, isLoading } = api.event.getConciseEventInfo.useQuery({
    id: eventId,
  });

  return (
    <div
      className={twMerge(
        "flex h-fit w-full flex-wrap rounded-md bg-highlight p-2 text-tertiary",
        className
      )}
    >
      <PageContent eventID={eventId} event={event} isLoading={isLoading} />
    </div>
  );
};

export default EventView;

const PageContent = ({
  eventID,
  event,
  isLoading,
}: {
  eventID: string | null | undefined;
  event: RouterOutputs["event"]["getConciseEventInfo"] | undefined | null;
  isLoading: boolean;
}) => {
  const { data: canEdit } = api.event.canEdit.useQuery(
    { id: eventID },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );
  const [displayDetails, setDisplayDetails] = useState(false);
  if (isLoading) {
    return (
      <PageSubtitle className="text-center text-white" text="Loading..." />
    );
  } else if (event) {
    return (
      <div className="w-full">
        {displayDetails && (
          <div className="flex flex-row">
            {canEdit && (
              <Link
                href={{
                  pathname: `/event/${eventID ?? "-1"}`,
                  query: { edit: "true" },
                }}
              >
                <div className="mr-2 flex w-fit flex-row items-center rounded-lg bg-red-600 p-1 pr-4">
                  <AiOutlineEdit className="mt-3" size={40} />
                  <h3>
                    <b>Modify event</b>
                  </h3>
                </div>
              </Link>
            )}
            <Link href={`/event/${eventID ?? "-1"}`}>
              <div className="flex w-fit flex-row items-center rounded-lg bg-green-800 p-1 pr-4">
                <AiOutlineExpandAlt className="my-2" size={35} />
                <h3>
                  <b>View Details</b>
                </h3>
              </div>
            </Link>
          </div>
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

            <PageSubtitle
              className="mb-0 text-center text-white"
              text={acotateText({ text: event.name, threshold: 40 })}
            />
          </div>
          <div className="flex w-full flex-col items-center rounded-lg bg-themebg p-2 xsm:flex-row">
            <ValidImage
              className="m-3 h-40 w-40 rounded-lg"
              src={event.image}
            />

            <div className="flex max-h-40 flex-col justify-between overflow-y-auto xsm:h-40">
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
                <div className="flex flex-row flex-wrap">
                  <GenerateTags maxTags={2} tags={event.tags} />
                </div>
              </div>
            </div>
          </div>
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
