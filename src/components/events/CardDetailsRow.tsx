import Link from "next/link";
import { OptionsContainer, OptionsInnerContainer } from "../general/Containers";
import {
  AiFillDelete,
  AiOutlineEdit,
  AiOutlineExpandAlt,
} from "react-icons/ai";
import { api } from "~/utils/api";

export const CardDetailsRow = ({
  canEdit,
  eventID,
  showVisit,
  isModifying,
  setUpdateEvent,
}: {
  canEdit: boolean | undefined | null;
  eventID: string | undefined | null;
  showVisit?: boolean;
  isModifying?: boolean;
  setUpdateEvent?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const context = api.useContext();
  const mutationEvent = api.event.deleteEvent.useMutation({
    onSuccess: (msg) => {
      alert(msg);
      void context.event.invalidate();
    },
  });
  return (
    <div className="flex flex-row flex-wrap items-center">
      {canEdit &&
        (isModifying ? (
          <OptionsContainer
            onClick={() => {
              if (!setUpdateEvent) {
                alert("Error: setUpdateEvent is undefined");
              } else {
                setUpdateEvent((prev) => !prev);
              }
            }}
          >
            <OptionsInnerContainer className="bg-blue-600">
              <AiOutlineEdit className="m-1" size={40} />
              <h3>
                <b>Modify event</b>
              </h3>
            </OptionsInnerContainer>
          </OptionsContainer>
        ) : (
          <OptionsContainer>
            <Link
              href={{
                pathname: `/event/${eventID ?? "-1"}`,
                query: { edit: "true" },
              }}
            >
              <OptionsInnerContainer className="bg-blue-600">
                <AiOutlineEdit className="m-1" size={40} />
                <h3>
                  <b>Modify event</b>
                </h3>
              </OptionsInnerContainer>
            </Link>
          </OptionsContainer>
        ))}

      {showVisit && (
        <OptionsContainer>
          <Link href={`/event/${eventID ?? "-1"}`}>
            <OptionsInnerContainer className="bg-green-800">
              <AiOutlineExpandAlt className="m-1" size={35} />
              <h3 className="inline-block">
                <b>View Details</b>
              </h3>
            </OptionsInnerContainer>
          </Link>
        </OptionsContainer>
      )}
      {canEdit && (
        <OptionsContainer
          onClick={() => {
            const confirmDeleteEvent = confirm(
              "Are you sure you want to delete this event? This action can't be undone."
            );

            if (confirmDeleteEvent) {
              mutationEvent.mutate({ id: eventID });
            }
          }}
        >
          <OptionsInnerContainer className="bg-red-600">
            <AiFillDelete className="m-1" size={35} />
            <h3 className="inline-block">
              <b>Delete event</b>
            </h3>
          </OptionsInnerContainer>
        </OptionsContainer>
      )}
    </div>
  );
};
