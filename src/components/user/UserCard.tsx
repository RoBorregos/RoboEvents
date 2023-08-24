import { api } from "~/utils/api";
import { PageSubtitle } from "~/components/general/PageElements";
import ValidImage from "../general/ValidImage";
import { type UpdateUserStyle, UpdateUserForm } from "./UpdateUserForm";
import { useState } from "react";
import { AiFillEdit, AiOutlineEdit } from "react-icons/ai";
import type { RouterOutputs } from "~/utils/api";
import { GenerateUserEvents } from "../general/Generate";

// TODO: improve styling, reize images in client side and validate in server.

const formStyle: UpdateUserStyle = {
  label: "text-white mr-2 align-middle flex items-center ",
  field: "bg-white mr-2 text-secondary p-1 rounded-lg",
  errorMsg: "text-red-500 bg-tertiary p-2 rounded-lg font-bold",
  button: "bg-white text-secondary p-2 rounded-lg",
  container: "bg-themebg mw-full mt-2 p-2 rounded-lg",
};

const UserCard = ({ userid }: { userid: string }) => {
  const { data: user, isLoading } = api.user.getUserInfo.useQuery(
    { id: userid },
    {
      onSuccess: (user) => {
        setPicUrl(user?.image ?? "");
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const [picUrl, setPicUrl] = useState(user?.image ?? "");

  return (
    <div className="flex flex-wrap rounded-md bg-highlight p-2 text-tertiary">
      <PageContent
        isLoading={isLoading}
        picUrl={picUrl}
        setPicUrl={setPicUrl}
        user={user}
      />
    </div>
  );
};

export default UserCard;

const PageContent = ({
  isLoading,
  user,
  picUrl,
  setPicUrl,
}: {
  isLoading: boolean;
  user: RouterOutputs["user"]["getUserInfo"] | undefined | null;
  picUrl: string;
  setPicUrl: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [updateProfile, setUpdateProfile] = useState(false);

  if (isLoading) {
    return (
      <PageSubtitle className="text-center text-white" text={"Loading..."} />
    );
  } else if (!user) {
    <PageSubtitle
      className="text-center text-white"
      text={"User not found."}
    />;
  } else if (user.owner) {
    // User info + option to edit.
    return (
      <>
        <div className="basis-full md:basis-4/12">
          <div className="m-2 flex flex-col justify-center rounded-lg bg-themebg p-2">
            <PageSubtitle
              className="text-center text-white"
              text={user.name ?? ""}
            />
            <ValidImage className="aspect-square rounded-full" src={picUrl} />
          </div>
        </div>
        <div className="basis full md:basis-8/12">
          <div className="m-2">
            {updateProfile ? (
              <div className="flex flex-col justify-between">
                <AiOutlineEdit
                  onClick={() => setUpdateProfile(!updateProfile)}
                  size={40}
                />
                <UpdateUserForm
                  styles={formStyle}
                  defaultValues={{
                    username: user.username ?? "",
                    profilePicture: user.image ?? "",
                    profileDescription: user.description ?? "",
                  }}
                  changeImg={setPicUrl}
                />
              </div>
            ) : (
              <div className="flex flex-col justify-between space-y-2">
                <AiFillEdit
                  onClick={() => setUpdateProfile(!updateProfile)}
                  size={40}
                />
                <p className="break-all">
                  <b>Username:</b> {user.username}
                </p>
                <p className="break-all">
                  {" "}
                  <b>Role:</b> {user.role}
                </p>
                <p className="break-all">
                  <b>Description:</b> {user.description}
                </p>

                <h4 className="mt-7 text-xl font-bold">
                  Complete profile information
                </h4>

                <p className="break-all">
                  <b>Name:</b> {user.name}
                </p>
                <p className="break-all">
                  <b>Email:</b> {user.email}
                </p>
                <p className="break-all">
                  <b>id:</b> {user.id}
                </p>
                <p className="break-all">
                  <b>Events owned:</b>{" "}
                </p>
                <div className="mt-1 flex flex-row flex-wrap">
                  <GenerateUserEvents items={user.eventsOwned} />
                </div>
                <p className="break-all">
                  <b>Events confirmed:</b>{" "}
                </p>
                <div className="mt-1 flex flex-row flex-wrap">
                  <GenerateUserEvents items={user.eventsConfirmed} />
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  } else {
    // User info, seen from another user.

    return (
      <>
        <div className="basis-full md:basis-4/12">
          <div className="m-2 flex flex-col justify-center rounded-lg bg-themebg p-2">
            <PageSubtitle
              className="text-center text-white"
              text={user.name ?? ""}
            />
            <ValidImage className="aspect-square rounded-full" src={picUrl} />
          </div>
        </div>
        <div className="basis full md:basis-8/12">
          <div className="m-2">
            <div className="flex flex-col justify-between space-y-2">
              <p className="break-all">
                <b>Username:</b> {user.username ?? "No username."}
              </p>
              <p className="break-all">
                {" "}
                <b>Role:</b> {user.role}
              </p>
              <p className="break-all">
                <b>Description:</b> {user.description ?? "No description."}
              </p>
              <p className="break-all">
                <b>Events owned:</b>{" "}
              </p>
              <div className="mt-1 flex flex-row flex-wrap">
                <GenerateUserEvents items={user.eventsOwned} />
              </div>
              <p className="break-all">
                <b>Events confirmed:</b>{" "}
              </p>
              <div className="mt-1 flex flex-row flex-wrap">
                <GenerateUserEvents items={user.eventsConfirmed} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
};
