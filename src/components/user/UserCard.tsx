import { api } from "~/utils/api";
import type { AppRouter } from "~/server/api/root";
import type { inferRouterOutputs } from "@trpc/server";
import { PageSubtitle } from "~/components/general/PageElements";
import ValidImage from "../general/ValidImage";
import {env} from "~/env.mjs";

type RouterOutput = inferRouterOutputs<AppRouter>;

type UserGetOutput = RouterOutput["user"]["getUserInfo"];

const UserCard = ({ userid }: { userid: string }) => {
  const { data: user, isLoading } = api.user.getUserInfo.useQuery(userid);
  return (
    <div className="flex flex-wrap rounded-md bg-highlight p-2 text-tertiary">
      {isLoading ? loadingContent() : obtainedUser(user)}
    </div>
  );
};

const loadingContent = () => {
  return <PageSubtitle text="Loading user..." />;
};

const obtainedUser = (user: UserGetOutput | undefined) => {
  if (!user) return <p>Could not find user</p>;
  return userFound(user);
};

const userFound = (user: UserGetOutput) => {
  const content = user?.owner == true ? ownerCard(user) : generalCard();

  return content;
};

const ownerCard = (user: UserGetOutput) => {
  let name;
  if (user.name) {
    name = user.name;
  } else if (user.username) {
    name = user.username;
  } else {
    name = "-";
  }
  return (
    <div className="basis-full md:basis-4/12">
      <div className="m-2 flex flex-col justify-center rounded-lg bg-themebg p-2">
        <PageSubtitle className="text-center text-white" text={name} />
        <ValidImage className="rounded-full" src={user.image ?? env.NEXT_PUBLIC_DEFAULT_IMAGE} />
      </div>
    </div>
  );
};

const generalCard = () => {
  return <p>General</p>;
};

export default UserCard;
