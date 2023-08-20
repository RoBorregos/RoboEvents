import { api } from "~/utils/api";
import { PageSubtitle } from "~/components/general/PageElements";
import { type CreateEventStyle, CreateEventForm } from "./CreateEventForm";
import { useState } from "react";
import { AiFillEdit, AiOutlineEdit } from "react-icons/ai";
import type { RouterOutputs } from "~/utils/api";
import ValidImage from "../general/ValidImage";

const DisplayEvent = ({ eventId }: { eventId: string }) => {
  const { data: event, isLoading } = api.event.getEventById.useQuery({
    id: eventId,
  });

  return (
    <div className="flex w-fit flex-col rounded-md bg-highlight p-2 text-tertiary">
      <PageContent event={event} isLoading={isLoading} />
    </div>
  );
};

export default DisplayEvent;

const PageContent = ({
  event,
  isLoading,
}: {
  event: RouterOutputs["event"]["getEventById"] | undefined | null;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <PageSubtitle className="text-center text-white" text="Loading..." />
    );
  } else if (event) {
    <div>
      <PageSubtitle className="text-center text-white" text={event?.name} />
      <div className="flex w-full flex-col">
        <ValidImage src={event?.image} />
      </div>
      <div className="flex w-full flex-col">
        <ValidImage src={event?.image} />
      </div>
    </div>;
  } else {
    return (
      <PageSubtitle
        className="text-center text-white"
        text="Event not found."
      />
    );
  }
};
