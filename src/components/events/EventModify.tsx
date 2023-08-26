import { api } from "~/utils/api";
import { PageSubtitle } from "~/components/general/PageElements";
import { type CreateEventStyle, CreateEventForm } from "./CreateEventForm";
import { useState } from "react";
import { AiFillEdit, AiOutlineEdit } from "react-icons/ai";
import type { RouterOutputs } from "~/utils/api";
import ValidImage from "../general/ValidImage";
import { twMerge } from "tailwind-merge";
import { useSearchParams } from "next/navigation";
import { GenerateTags } from "../general/Generate";
import { GenerateOwners } from "~/components/general/Generate";
import { getTimeString } from "./EventView";
import { GenerateConfirmed } from "~/components/general/Generate";

const formStyle: CreateEventStyle = {
  label: "text-white mr-2 align-middle flex items-center h-10",
  field: "bg-white mr-2 text-secondary p-1 rounded-lg",
  errorMsg: "text-red-500 bg-tertiary p-2 rounded-lg font-bold",
  button: "bg-white text-secondary p-2 rounded-lg",
  container: "bg-themebg mw-full mt-2 p-2 rounded-lg",
};

const EventModify = ({
  eventId,
  className,
}: {
  eventId: string | undefined | null;
  className?: string;
}) => {
  const { data: event, isLoading } = api.event.getModifyEventInfo.useQuery({
    id: eventId,
  });

  const searchParams = useSearchParams();
  const edit = searchParams.get("edit");

  return (
    <div
      className={twMerge(
        "flex w-fit flex-wrap rounded-md bg-highlight p-2 text-tertiary",
        className
      )}
    >
      <PageContent
        eventID={eventId}
        event={event}
        isLoading={isLoading}
        editInitial={edit == "true"}
      />
    </div>
  );
};

export default EventModify;

const PageContent = ({
  eventID,
  event,
  isLoading,
  editInitial,
}: {
  eventID: string | null | undefined;
  event: RouterOutputs["event"]["getModifyEventInfo"] | undefined | null;
  isLoading: boolean;
  editInitial?: boolean;
}) => {
  const [updateEvent, setUpdateEvent] = useState(editInitial ?? false);
  const { data: canEdit } = api.event.canEdit.useQuery({ id: eventID });

  const { data: startDate } = api.event.getEventStart.useQuery({
    id: eventID ?? "",
  });

  if (isLoading) {
    return (
      <PageSubtitle className="text-center text-white" text="Loading..." />
    );
  } else if (!eventID) {
    // Create event
    return <CreateEventForm styles={formStyle} />;
  } else if (event) {
    // Modify event
    if (updateEvent) {
      return (
        <>
          {canEdit && (
            <div
              onClick={() => setUpdateEvent(!updateEvent)}
              className="flex w-fit flex-row items-center rounded-lg bg-red-500 p-1 pr-4"
            >
              <AiFillEdit className="mt-3" size={40} />
              <h3>
                <b>Modify event</b>
              </h3>
            </div>
          )}

          <CreateEventForm styles={formStyle} defaultValues={event} />
        </>
      );
    } else {
      const tagText = event.confirmed
        .map((user) => (user.username ?? user.name ?? user.id) + ", ")
        .slice(0, -2);
      return (
        <div>
          {canEdit && (
            <div
              onClick={() => setUpdateEvent(!updateEvent)}
              className="flex w-fit flex-row items-center rounded-lg bg-red-600 p-1 pr-4"
            >
              <AiOutlineEdit className="mt-3" size={40} />
              <h3>
                <b>Modify event</b>
              </h3>
            </div>
          )}

          <div className="mt-2 flex flex-col rounded-lg bg-themebg p-2">
            <div className="flex flex-col">
              <PageSubtitle
                className="mb-0 text-center text-3xl text-white"
                text={event.name}
              />
              <div className="mt-2 flex flex-col text-center sm:mt-0">
                <p>
                  <b>{startDate?.start.toLocaleDateString()}</b>
                </p>
                <p>
                  {getTimeString({
                    start: startDate?.start,
                    end: startDate?.end,
                  })}
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col items-center rounded-lg bg-themebg p-2 md:flex-row">
              <ValidImage
                className="m-3 h-80 w-80 rounded-lg"
                src={event.image}
              />

              <div className="flex flex-col justify-between overflow-y-auto sm:h-80 sm:w-80">
                <p>
                  <b>Description:</b> {event.description}
                </p>
                <p>
                  <b>Location:</b> {event.location}
                </p>
                <p>
                  <b>Tags:</b>
                  <div className="mt-1 flex flex-row flex-wrap">
                    <GenerateTags tags={event.tags} />
                  </div>
                </p>
                <p>
                  <b>Owners:</b>
                  <div className="mt-1 flex flex-row flex-wrap">
                    <GenerateOwners eventID={event.id} />
                  </div>
                </p>
                <p className="mt-2">
                  <b>Visibility:</b>{" "}
                  <div className="mb-2 mt-1 flex flex-row flex-wrap">
                    <span className="rounded-lg bg-blue-600 p-1">
                      {event.visibility}
                    </span>
                  </div>
                </p>
                <p>
                  <b>Confirmed:</b> {tagText}
                  <div className="mt-1 flex flex-row flex-wrap">
                    <GenerateConfirmed eventID={event.id} />
                  </div>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  } else {
    return (
      <PageSubtitle
        className="text-center text-white"
        text="Event not found."
      />
    );
  }
};
