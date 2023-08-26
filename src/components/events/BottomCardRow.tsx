import { useSession } from "next-auth/react";
import { useState } from "react";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import { api } from "~/utils/api";

export const BottomCardRow = ({
  eventID,
}: {
  eventID: string | undefined | null;
}) => {
  const { data: sessionData } = useSession();
  const context = api.useContext();
  const { isLoading: loadingConfirmed } = api.user.isConfirmed.useQuery(
    {
      eventId: eventID,
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

  return (
    <div className="flex flex-row flex-wrap">
      {sessionData && !loadingConfirmed && (
        <div className="flex flex-row flex-wrap items-center">
          {isConfirmed ? (
            <ImCheckboxChecked
              size={32}
              onClick={() => {
                mutationUser.mutate({
                  eventId: eventID,
                  userId: sessionData?.user?.id,
                  confirmed: false,
                });
              }}
            />
          ) : (
            <ImCheckboxUnchecked
              size={32}
              onClick={() => {
                mutationUser.mutate({
                  eventId: eventID,
                  userId: sessionData?.user?.id,
                  confirmed: true,
                });
              }}
            />
          )}

          <div className="mx-2 font-bold">
            {isConfirmed ? (
              <p>Assistance Confirmed</p>
            ) : (
              <p>Confirm Assistance</p>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-row flex-wrap">Add to calendar</div>
    </div>
  );
};
