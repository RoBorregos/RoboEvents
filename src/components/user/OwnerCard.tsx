import { api } from "~/utils/api";
import { PageSubtitle } from "~/components/general/PageElements";
import ValidImage from "../general/ValidImage";
import { type UpdateUserStyle, UpdateUserForm } from "./UpdateUserForm";
import { useState } from "react";
import { AiFillEdit, AiOutlineEdit } from "react-icons/ai";

// TODO: improve styling, reize images in client side and validate in server.

const formStyle: UpdateUserStyle = {
  label: "text-white mr-2 align-middle flex items-center ",
  field: "bg-white mr-2 text-secondary p-1 rounded-lg",
  errorMsg: "text-red-500 bg-tertiary p-2 rounded-lg font-bold",
  button: "bg-white text-secondary p-2 rounded-lg",
  container: "bg-themebg mw-full mt-2 p-2 rounded-lg",
};

const OwnerCard = ({ userid }: { userid: string }) => {
  const { data: user, isLoading } = api.user.fullInfo.useQuery(userid, {
    onSuccess: (user) => {
      setPicUrl(user?.image ?? "");
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const [picUrl, setPicUrl] = useState(user?.image ?? "");

  const [updateProfile, setUpdateProfile] = useState(false);

  return (
    <div className="flex flex-wrap rounded-md bg-highlight p-2 text-tertiary">
      {user && !isLoading ? (
        <>
          <div className="basis-full md:basis-4/12">
            <div className="m-2 flex flex-col justify-center rounded-lg bg-themebg p-2">
              {user.name && (
                <PageSubtitle
                  className="text-center text-white"
                  text={user.name}
                />
              )}
              <ValidImage className="rounded-full" src={picUrl} />
            </div>
          </div>
          <div className="relative basis-full md:basis-8/12">
            <div className="m-2">
              <p className="break-all">Email: {user.email}</p>
              <p className="break-all">Username: {user.username}</p>
              <p className="break-all">Role: {user.role}</p>
              <p className="break-all">Description: {user.description}</p>
              {updateProfile ? (
                <AiOutlineEdit
                  onClick={() => setUpdateProfile(!updateProfile)}
                  className="mt-3"
                  size={40}
                />
              ) : (
                <AiFillEdit
                  onClick={() => setUpdateProfile(!updateProfile)}
                  className="mt-3"
                  size={40}
                />
              )}
              {updateProfile && (
                <UpdateUserForm
                  styles={formStyle}
                  defaultValues={{
                    username: user.username ?? "",
                    profilePicture: user.image ?? "",
                    profileDescription: user.description ?? "",
                  }}
                  changeImg={setPicUrl}
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <PageSubtitle
          className="text-center text-white"
          text={isLoading ? "Loading..." : "User not found."}
        />
      )}
    </div>
  );
};

export default OwnerCard;
