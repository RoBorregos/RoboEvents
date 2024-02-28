import type { FC } from "react";
import { twMerge } from "tailwind-merge";

// Container to display lists of events.
export const EventListContainer: FC<React.JSX.IntrinsicElements["div"]> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        "grid grid-cols-1 md:grid-cols-2 justify-around md:justify-normal",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Container for an EventView
export const EventContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mb-2 flex w-full justify-around">
      {children}
    </div>
  );
};

// Outer container for Options about event cards (e.g. view, edit, delete)
export const OptionsContainer: FC<React.JSX.IntrinsicElements["div"]> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div {...props} className={twMerge("w-full sm:w-1/2 lg:w-1/3", className)}>
      {children}
    </div>
  );
};

// Inner container for Options about event cards (e.g. view, edit, delete)
export const OptionsInnerContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => {
  return (
    <div
      className={twMerge(
        "mr-2 mt-2 flex flex-row items-center rounded-lg bg-blue-600 p-1 pr-4",
        className
      )}
    >
      {children}
    </div>
  );
};
