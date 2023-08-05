import { createClient } from "@supabase/supabase-js";
import { env } from "~/env.mjs";

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
  console.log(path);
  console.log(blob);

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
