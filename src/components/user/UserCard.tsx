import { api } from "~/utils/api";
import type { AppRouter } from "~/server/api/root";
import type { inferRouterOutputs } from "@trpc/server";
import { PageSubtitle } from "~/components/general/PageElements";
import ValidImage from "../general/ValidImage";
import { Formik } from "formik";

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
  const content = user?.owner == true ? ownerCard(user) : generalCard(user);

  return content;
};

const ownerCard = (user: UserGetOutput) => {
  //                 <div className="m-2 flex flex-col justify-center rounded-lg bg-themebg p-2">
  //                   {session.user.name && (
  //                     <PageSubtitle
  //                       className="text-center text-white"
  //                       text={session.user.name}
  //                     />
  //                   )}

  //                   <ValidImage
  //                     className="rounded-full"
  //                     src={session?.user.image}
  //                   />
  //                   {/* <input
  //                     className="m-2"
  //                     type="file"
  //                     name="file"
  //                     accept="image/*"
  //                     onChange={async (e: ChangeEvent<HTMLInputElement>) => {
  //                       if (!e.target.files) return;
  //                       const file = e.target.files[0];
  //                       if (!file) return;

  //                       const reader = new FileReader();
  //                       reader.readAsDataURL(file);
  //                       reader.onloadend = async () => {
  //                         setFieldValue("picUrl", reader.result);
  //                       };
  //                     }}
  //                   /> */}
  //                 </div>
  //               </div>
  //               <div className="basis-full md:basis-8/12">
  //                 <p className="break-all">
  //                   Signed in as {session?.user.email}. Info: {session.user.image}
  //                   . {session.expires}. {session.user.name}.{" "}
  //                   {session.user.organizations}
  //                 </p>
  //               </div>
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
        <ValidImage className="rounded-full" src={user.image} />
      </div>
    </div>
  );
};

const generalCard = (user: any) => {
  return <p>General</p>;
};

// {/* <div className="flex flex-wrap rounded-md bg-highlight p-2 text-tertiary">
//               <div className="basis-full md:basis-4/12">
//                 <UserCard userid="clkrfxjk40000lpwso61b8mfc" />
//                 <div className="m-2 flex flex-col justify-center rounded-lg bg-themebg p-2">
//                   {session.user.name && (
//                     <PageSubtitle
//                       className="text-center text-white"
//                       text={session.user.name}
//                     />
//                   )}

//                   <ValidImage
//                     className="rounded-full"
//                     src={session?.user.image}
//                   />
//                   {/* <input
//                     className="m-2"
//                     type="file"
//                     name="file"
//                     accept="image/*"
//                     onChange={async (e: ChangeEvent<HTMLInputElement>) => {
//                       if (!e.target.files) return;
//                       const file = e.target.files[0];
//                       if (!file) return;

//                       const reader = new FileReader();
//                       reader.readAsDataURL(file);
//                       reader.onloadend = async () => {
//                         setFieldValue("picUrl", reader.result);
//                       };
//                     }}
//                   /> */}
//                 </div>
//               </div>
//               <div className="basis-full md:basis-8/12">
//                 <p className="break-all">
//                   Signed in as {session?.user.email}. Info: {session.user.image}
//                   . {session.expires}. {session.user.name}.{" "}
//                   {session.user.organizations}
//                 </p>
//               </div>
//             </div> */}

export default UserCard;
