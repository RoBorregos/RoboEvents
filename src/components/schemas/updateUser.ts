import * as Yup from "yup";
import { env } from "~/env.mjs";
import { isImgUrl } from "~/utils/image";

export const updateUserSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "User must have more than 3 letters.")
    .required("Required")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers and underscores."
    )
    .test(
      "is-username-available",
      "Username is already taken.",
      async (value) => {
        const isAvailable = await isUserAvailable(value);
        if (isAvailable) return true;
        return false;
      }
    ),
  profilePicture: Yup.string().test(
    "is-img",
    "Image is not valid.",
    async (value) => {
      if (!value) return false;
      if (value === "data:image") return true;
      const validUrl = await isImgUrl(value);
      return validUrl;
    }
  ),
  profileDescription: Yup.string().nullable().max(100, "Max 100 characters.")
});



async function isUserAvailable(username: string) {
  const url = `${env.NEXT_PUBLIC_PROJECT_URL}/api/user/available?username=${username}`;
  try {
    const res = await fetch(url, { method: "GET" });
    const data = await res.json();
    return data?.data?.available;
  } catch (error) {
    return false;
  }
}
