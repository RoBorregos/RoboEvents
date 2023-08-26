// Functions to generate tags in the different types of cards.

import { twMerge } from "tailwind-merge";
import { Tag } from "@prisma/client";
import { api } from "~/utils/api";
import Link from "next/link";

export const GenerateTags = ({
  tags,
  maxTags,
}: {
  tags: Tag[] | undefined | null;
  maxTags?: number;
}) => {
  if (!tags || tags.length == 0) return <p>This event has no tags</p>;

  const tagsJsx: JSX.Element[] = [];

  let hasMaxTags = false;

  if (maxTags) {
    hasMaxTags = true;
  }

  tags.map((tag) => {
    if (hasMaxTags && !maxTags) return;
    if (maxTags) maxTags--;
    const color = tagColors[tag.tagColor] ?? "bg-gray-600";

    tagsJsx.push(
      <p className={twMerge("mb-2 mr-2 inline rounded-lg p-[3px]", color)}>
        {tag.name}
      </p>
    );
  });

  if (hasMaxTags && tagsJsx.length < tags.length) {
    tagsJsx.push(
      <p className="mb-2 mr-2 inline rounded-lg bg-gray-600 p-[3px]">
        {tags.length - tagsJsx.length} more...
      </p>
    );
  }

  return tagsJsx;
};

interface TagType {
  [key: string]: string;
}

export const tagColors: TagType = {
  blue: "bg-blue-600",
  red: "bg-red-600",
  green: "bg-green-600",
  yellow: "bg-yellow-600",
  purple: "bg-purple-600",
  pink: "bg-pink-600",
  indigo: "bg-indigo-600",
  gray: "bg-gray-600",
};

export const GenerateConfirmed = ({
  eventID,
}: {
  eventID: string | undefined | null;
}) => {
  const { data: confirmed, isLoading } =
    api.event.getEventConfirmedUsers.useQuery({ eventId: eventID });

  if (isLoading) return <p>Loading...</p>;
  if (!confirmed) return <p>No confirmed users.</p>;

  return (
    <GenerateGeneral
      emptyMsg="No confirmed users."
      items={confirmed}
      linkPath="/user/"
    />
  );
};

type IterableItem =
  | {
      id: string;
      name: string;
      info?: string;
    }
  | {
      id: string;
      name?: string;
      info: string;
    };

export const GenerateUserEvents = ({
  items,
}: {
  items: IterableItem[] | undefined | null;
}) => {
  return (
    <GenerateGeneral emptyMsg="No events." items={items} linkPath="/event/" />
  );
};

export const GenerateOwners = ({
  eventID,
}: {
  eventID: string | undefined | null;
}) => {
  const { data: owners, isLoading } = api.event.getEventOwners.useQuery({
    eventId: eventID,
  });

  if (isLoading) return <p>Loading...</p>;
  return (
    <GenerateGeneral emptyMsg="No owners." items={owners} linkPath="/user/" />
  );
};

export const GenerateGeneral = ({
  emptyMsg,
  items,
  linkPath,
  color,
}: {
  emptyMsg: string;
  items: IterableItem[] | undefined | null | false;
  linkPath: string;
  color?: string;
}) => {
  if (!items || items.length == 0) return <p>{emptyMsg}</p>;

  const colorClass = tagColors[color ?? "gray"] ?? "bg-gray-600";
  tagColors;
  const generatedJsx = items.map((item) => {
    return (
      <Link href={`${linkPath}${item.id}`} key={item.id}>
        <p
          className={twMerge(
            "mb-3 mr-2 inline rounded-lg bg-gray-600 p-[3px]",
            colorClass
          )}
        >
          {item.name ?? item.info}
        </p>
      </Link>
    );
  });

  if (generatedJsx.length == 0) return <p>{emptyMsg}</p>;

  return generatedJsx;
};
