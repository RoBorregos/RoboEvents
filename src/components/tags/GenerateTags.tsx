import { twMerge } from "tailwind-merge";
import { Tag } from "@prisma/client";

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
