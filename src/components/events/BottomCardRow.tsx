import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import { type RouterOutputs, api } from "~/utils/api";

import { AddToCalendarButton } from "add-to-calendar-button-react";
import { getDefaultTime } from "~/utils/dates";
import type { DateStamp } from "@prisma/client";
import { compareRole } from "~/utils/role";
import { FaShareNodes } from "react-icons/fa6";

import { env } from "~/env.mjs";

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

  const eventlocal = typeof event !== "string" ? event : null;

  const shareData = {
    title: eventlocal?.name ?? "Unnamed event",
    text: eventlocal?.description ?? "No description.",
    url: env.NEXT_PUBLIC_PROJECT_URL + "/event/" + (eventlocal?.id ?? ""),
  };

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
  const [canShare, setCanShare] = useState(false);

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

  useEffect(() => {
    setCanShare(navigator.canShare(shareData));
  }, [shareData]);

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
      {canShare && (
        <FaShareNodes
          size={40}
          className="my-auto"
          onClick={async () => {
            await navigator.share(shareData);
          }}
        ></FaShareNodes>
      )}
    </div>
  );
};
