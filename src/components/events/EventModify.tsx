import { api } from "~/utils/api";
import { PageSubtitle } from "~/components/general/PageElements";
import { type CreateEventStyle, CreateEventForm } from "./CreateEventForm";
import { useState } from "react";
import { AiFillEdit, AiOutlineEdit } from "react-icons/ai";
import type { RouterOutputs } from "~/utils/api";
import ValidImage from "../general/ValidImage";
import { twMerge } from "tailwind-merge";

const formStyle: CreateEventStyle = {
  label: "text-white mr-2 align-middle flex items-center h-10",
  field: "bg-white mr-2 text-secondary p-1 rounded-lg",
  errorMsg: "text-red-500 bg-tertiary p-2 rounded-lg font-bold",
  button: "bg-white text-secondary p-2 rounded-lg",
  container: "bg-themebg mw-full mt-2 p-2 rounded-lg",
};

const EventModify = ({ eventId, className }: { eventId: string | undefined | null, className?: string }) => {
  const { data: event, isLoading } = api.event.getModifyEventInfo.useQuery({
    id: eventId,
  });
  console.log(event);

  return (
    <div className={twMerge("flex w-fit flex-wrap rounded-md bg-highlight p-2 text-tertiary", className)}>
      <PageContent eventID={eventId} event={event} isLoading={isLoading} />
    </div>
  );
};

export default EventModify;

const PageContent = ({
  eventID,
  event,
  isLoading,
}: {
  eventID: string | null | undefined;
  event: RouterOutputs["event"]["getModifyEventInfo"] | undefined | null;
  isLoading: boolean;
}) => {
  const [updateEvent, setUpdateEvent] = useState(eventID ? false : true);
  const { data: canEdit } = api.event.canEdit.useQuery(
    { id: eventID },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

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
                className="mb-0 text-center text-white"
                text={event.name}
              />
            </div>
            <div className="flex w-full flex-col-reverse items-center rounded-lg bg-themebg p-2 md:flex-row">
              <ValidImage
                className="m-3 h-40 w-40 rounded-lg"
                src={event.image}
              />

              <div>
                <p>
                  <b>Event Location:</b> {event.location}
                </p>
                <p>
                  <b>Owners:</b> {event.owners.map((owner) => owner.username)}
                </p>
                <p>
                  <b>Description:</b> {event.description}
                </p>
                <p>
                  <b>location:</b> {event.location}
                </p>
                <p>
                  <b>visibility:</b> {event.visibility}
                </p>
                <p>
                  <b>tags:</b> {event.tags.map((tag) => tag.name)}
                </p>
                <p>
                  <b>Confirmed:</b> {tagText}
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
