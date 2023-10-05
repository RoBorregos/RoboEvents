import { useSession } from "next-auth/react";
import { useState } from "react";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import { type RouterOutputs, api } from "~/utils/api";

import { AddToCalendarButton } from "add-to-calendar-button-react";
import { getDefaultTime } from "~/utils/dates";
import type { DateStamp } from "@prisma/client";
import { compareRole } from "~/utils/role";

export const BottomCardRow = ({
  event,
  date,
}: {
  event:
    | RouterOutputs["event"]["getModifyEventInfo"]
    | RouterOutputs["event"]["getConciseEventInfo"]
    | undefined
    | null;
  date: DateStamp | undefined | null;
}) => {
  const { data: sessionData } = useSession();
  const context = api.useContext();

  const eventlocal = (typeof event !== "string") ? event : null;
  const { isLoading: loadingConfirmed } = api.user.isConfirmed.useQuery(
    {
      eventId: eventlocal?.id,
      userId: sessionData?.user?.id,
    },
    {
      onSuccess: (newValue) => {
        setIsConfirmed(newValue);
      },
    }
  );

  const [isConfirmed, setIsConfirmed] = useState(false);

  const mutationUser = api.user.setConfirmed.useMutation({
    onSuccess: (changed) => {
      if (changed) {
        void context.user.isConfirmed.invalidate();
      } else {
        alert("Event or user not found.");
      }
    },
  });

  const { defaultDate, defaultStartTime, defaultEndTime } = getDefaultTime({
    startDate: date,
  });

  const hasConfirmRole = compareRole({
    requiredRole: "communityMember",
    userRole: sessionData?.user?.role,
  });

  return (
    <div className="m-2 flex flex-row flex-wrap justify-center sm:m-0">
      {sessionData && !loadingConfirmed && hasConfirmRole && (
        <div className="mb-2 flex flex-row flex-wrap items-center justify-center sm:mr-auto">
          {isConfirmed ? (
            <ImCheckboxChecked
              size={25}
              onClick={() => {
                mutationUser.mutate({
                  eventId: eventlocal?.id,
                  userId: sessionData?.user?.id,
                  confirmed: false,
                });
              }}
            />
          ) : (
            <ImCheckboxUnchecked
              size={25}
              onClick={() => {
                mutationUser.mutate({
                  eventId: eventlocal?.id,
                  userId: sessionData?.user?.id,
                  confirmed: true,
                });
              }}
            />
          )}

          <div className="mx-2 font-bold">
            {isConfirmed ? <p>Confirmed</p> : <p>Confirm Assistance</p>}
          </div>
        </div>
      )}

      <AddToCalendarButton
        name={eventlocal?.name ?? "Unnamed event"}
        description={eventlocal?.description}
        options={["Outlook.com", "Apple", "Google", "Yahoo", "iCal"]}
        location={eventlocal?.location ?? "No location."}
        startDate={defaultDate}
        startTime={defaultStartTime}
        endTime={defaultEndTime}
        timeZone={"currentBrowser"}
        inline={true}
      ></AddToCalendarButton>
    </div>
  );
};
