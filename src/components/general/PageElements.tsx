import { twMerge } from "tailwind-merge";

export const PageBody: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="m-4">{children}</div>;
};

export const PageTitle = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  return (
    <h1 className={twMerge("mb-4 text-4xl font-semibold", className)}>
      {text}
    </h1>
  );
};

export const PageSubtitle = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  return (
    <h2 className={twMerge("mb-4 text-2xl font-semibold", className)}>
      {text}
    </h2>
  );
};
