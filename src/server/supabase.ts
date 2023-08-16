import { createClient } from "@supabase/supabase-js";
import { env } from "~/env.mjs";
import { TRPCError } from "@trpc/server";

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadProfilePicture = async ({
  file, // base64
  profileId,
  type,
}: {
  file: string;
  profileId: string;
  type: string;
}) => {
  const path = `public/${profileId}.${type}`;
  const base64 = await fetch(file);
  const blob = await base64.blob();

  return await supabase.storage.from("profile-pictures").upload(path, blob, {
    upsert: true,
  });
};

export const getProfilePictureUrl = (path: string) => {
  return getImageUrl("public/profile-pictures", path);
};

const getImageUrl = (base: string, path: string) => {
  return `${env.SUPABASE_URL}/storage/v1/object/${base}/${path}`;
};

//dataurl: base64
export const getTypeImageBase64 = (dataurl: string) => {
  const pattern = /data:image\/([a-zA-Z]+);base64/;

  const res = dataurl.match(pattern);
  if (!res || !res[1]) {
    return "";
  }
  return res[1];
};

export const uploadToBucket = async ({
  bucket,
  file,
  id,
  type,
}: {
  bucket: string;
  file: string;
  id: string;
  type: string;
}) => {
  if (bucket == "event-pictures") {
    return await uploadEventPicture({ file, eventId: id, type });
  } else if (bucket == "profile-pictures") {
    return await uploadProfilePicture({ file, profileId: id, type });
  }
  console.log("Invalid bucket: ", bucket, " in uploadToBucket");
  throw new Error("Invalid bucket");
};

export const uploadEventPicture = async ({
  file, // base64
  eventId,
  type,
}: {
  file: string;
  eventId: string;
  type: string;
}) => {
  const path = `public/${eventId}.${type}`;
  const base64 = await fetch(file);
  const blob = await base64.blob();

  return await supabase.storage.from("event-pictures").upload(path, blob, {
    upsert: true,
  });
};

export const getEventPictureUrl = (path: string) => {
  return getImageUrl("public/event-pictures", path);
};

const getPictureUrl = (path: string, bucket: string) => {
  if (bucket == "event-pictures") {
    return getEventPictureUrl(path);
  } else {
    return getProfilePictureUrl(path);
  }
};

// Upload the image to supabase if input isn't a url. Return the url of the image.
export const getImageLink = async (
  id: string,
  inputImage: string | undefined | null,
  bucket: string
) => {
  if (!inputImage) {
    return env.NEXT_PUBLIC_DEFAULT_IMAGE;
  }

  if (inputImage.startsWith("data:image")) {
    const result = await uploadToBucket({
      bucket: bucket,
      file: inputImage,
      type: getTypeImageBase64(inputImage),
      id: id,
    });

    if (result.error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: result.error.message,
      });
    } else {
      return getPictureUrl(result.data.path, bucket);
    }
  } else {
    return inputImage;
  }
};
