import * as Yup from "yup";
import { isImgUrl } from "~/utils/image";

export const eventSchema = Yup.object().shape({
  eventName: Yup.string().required("Required").min(3, "Name too short."),
  date: Yup.date().required("Required"),
  startTime: Yup.string()
    .required("Required")
    .min(5, "Invalid date.")
    .max(5, "Invalid date."),
  visibility: Yup.string()
    .required("Required")
    .oneOf(
      ["admin", "organizationMember", "communityMember", "authenticated", "unauthenticated"],
      "Invalid visibility."
    ),
  endTime: Yup.string()
    .required("Required")
    .min(5, "Invalid date.")
    .max(5, "Invalid date.")
    .test(
      "valid-hour",
      "End time must be greater than start time.",
      (value, context) => {
        const sd = new Date(context.parent.date);
        sd.setHours(
          parseInt(context.parent.startTime.split(":")[0] ?? "99"),
          parseInt(context.parent.startTime.split(":")[1] ?? "99"),
          0
        );
        const ed = new Date(context.parent.date);
        ed.setHours(
          parseInt(value.split(":")[0] ?? ""),
          parseInt(value.split(":")[1] ?? ""),
          0
        );
        return ed > sd;
      }
    ),

  eventPicture: Yup.string()
    .nullable()
    .test("is-img", "Image is not valid.", async (value) => {
      if (!value) return false;
      if (value === "data:image") return true;
      const validUrl = await isImgUrl(value);
      return validUrl;
    }),
  profileDescription: Yup.string().nullable().max(100, "Max 100 characters."),
});
