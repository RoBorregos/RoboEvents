import { api } from "~/utils/api";
import { PageSubtitle } from "~/components/general/PageElements";
import { CreateEventStyle, CreateEventForm } from "./CreateEventForm";
import { useState } from "react";
import { AiFillEdit, AiOutlineEdit } from "react-icons/ai";
import { Event } from "@prisma/client";
import { RouterOutputs } from "~/utils/api";

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
    <div className="flex flex-wrap rounded-md bg-highlight p-2 text-tertiary">
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
          <div className="flex flex-row">
            <AiFillEdit
              onClick={() => setUpdateEvent(!updateEvent)}
              className="mt-3"
              size={40}
            />
            <p>Modificar evento</p>
          </div>
          <CreateEventForm styles={formStyle} defaultValues={event} />
        </>
      );
    } else {
      return (
        <>
          <div className="flex flex-row">
            <AiOutlineEdit
              onClick={() => setUpdateEvent(!updateEvent)}
              className="mt-3"
              size={40}
            />
            <p>Modificar evento</p>
          </div>
          <PageSubtitle className="text-white" text={event.name} />
          <div className="mw-full mt-2 rounded-lg bg-themebg p-2">
            <p>Event Location: {event.location}</p>
            <p>Event visibility: {event.visibility}</p>
            <p>Owners: {event.owners.map((owner) => owner.username)}</p>
            <p>Description: {event.description}</p>
            <p>location: {event.location}</p>
            <p>visibility: {event.visibility}</p>
            <p>tags: {event.tags.map((tag) => tag.name)}</p>
            <p>Confirmed: {event.confirmed.map((user) => user.username)}</p>
          </div>
        </>
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

// <>
// <div className="">
//   <PageSubtitle
//     className="text-center text-white"
//     text={event.name}
//   />
// </div>
// <div className="basis-full md:basis-4/12">
//   <div className="m-2 flex flex-col justify-center rounded-lg bg-themebg p-2">
//     {user.name && (
//       <PageSubtitle
//         className="text-center text-white"
//         text={user.name}
//       />
//     )}
//     <ValidImage className="rounded-full" src={picUrl} />
//   </div>
// </div>
// <div className="relative basis-full md:basis-8/12">
//   <div className="m-2">
//     <p className="break-all">Email: {user.email}</p>
//     <p className="break-all">Username: {user.username}</p>
//     <p className="break-all">Role: {user.role}</p>
//     <p className="break-all">Description: {user.description}</p>
//     {updateProfile ? (
//       <AiOutlineEdit
//         onClick={() => setUpdateProfile(!updateProfile)}
//         className="mt-3"
//         size={40}
//       />
//     ) : (
//       <AiFillEdit
//         onClick={() => setUpdateProfile(!updateProfile)}
//         className="mt-3"
//         size={40}
//       />
//     )}
//     {updateProfile && (
//       <UpdateUserForm
//         styles={formStyle}
//         defaultValues={{
//           username: user.username ?? "",
//           profilePicture: user.image,
//           profileDescription: user.description ?? "",
//         }}
//         changeImg={setPicUrl}
//       />
//     )}
//   </div>
// </div>
// </>
