import { api } from "~/utils/api";
import { PageSubtitle } from "~/components/general/PageElements";
import { CreateEventStyle, CreateEventForm } from "./CreateEventForm";
import { useState } from "react";
import { AiFillEdit, AiOutlineEdit } from "react-icons/ai";
import { RouterOutputs } from "~/utils/api";
import ValidImage from "../general/ValidImage";

const formStyle: CreateEventStyle = {
  label: "text-white mr-2 align-middle flex items-center h-10",
  field: "bg-white mr-2 text-secondary p-1 rounded-lg",
  errorMsg: "text-red-500 bg-tertiary p-2 rounded-lg font-bold",
  button: "bg-white text-secondary p-2 rounded-lg",
  container: "bg-themebg mw-full mt-2 p-2 rounded-lg",
};

const EventModify = ({ eventId }: { eventId: string | undefined | null }) => {
  const { data: event, isLoading } = api.event.getModifyEventInfo.useQuery({
    id: eventId,
  });

  return (
    <div className="flex w-fit flex-wrap rounded-md bg-highlight p-2 text-tertiary">
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
          <div className="flex flex-row items-center">
            <AiFillEdit
              onClick={() => setUpdateEvent(!updateEvent)}
              className="mt-3"
              size={40}
            />
            <h3>
              <b>Modify event</b>
            </h3>
          </div>
          <CreateEventForm styles={formStyle} defaultValues={event} />
        </>
      );
    } else {
      const tagText = event.confirmed.map((user) => user.username + ", ").slice(0, -2);
      return (
        <div>
          <div className="flex flex-row items-center">
            <AiOutlineEdit
              onClick={() => setUpdateEvent(!updateEvent)}
              className="mt-3"
              size={40}
            />
            <h3>
              <b>Modify event</b>
            </h3>
          </div>

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
