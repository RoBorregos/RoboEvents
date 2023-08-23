import { twMerge } from "tailwind-merge";
import { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import Link from "next/link";

export const GenerateOwners = ({
  eventID,
}: {
  eventID: string | undefined | null;
}) => {
  const { data: owners, isLoading } = api.event.getEventOwners.useQuery(
    { eventId: eventID },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  if (!owners || isLoading) return <p>Loading...</p>;

  return owners.map((owner) => {
    return (
      <Link href={``} key={owner.id}>
        <p className="mb-2 mr-2 inline rounded-lg bg-gray-600 p-[3px]">
          {owner.info}
        </p>
      </Link>
    );
  });
};
