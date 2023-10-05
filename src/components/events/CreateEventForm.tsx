import { Formik, Field, Form, ErrorMessage } from "formik";
import { eventSchema } from "../schemas/eventSchema";
import { useState, type ChangeEvent } from "react";
import { api } from "~/utils/api";
import { env } from "~/env.mjs";
import ValidImage from "../general/ValidImage";
import { twMerge } from "tailwind-merge";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { PageSubtitle } from "../general/PageElements";
import { roleOrLower } from "~/utils/role";
import type { RouterOutputs } from "~/utils/api";
import makeAnimated from "react-select/animated";
import { getDefaultTime } from "~/utils/dates";

export interface CreateEventStyle {
  label: string | undefined;
  field: string | undefined;
  errorMsg: string | undefined;
  button: string | undefined;
  container: string | undefined;
}

// TODO: Implement events with multiple dates (rrule construction + validation + testing date generator)

const animatedComponents = makeAnimated();

export const CreateEventForm = ({
  styles,
  defaultValues,
}: {
  styles: CreateEventStyle;
  defaultValues?: RouterOutputs["event"]["getModifyEventInfo"];
}) => {
  const context = api.useContext();
  const { data: sessionData, status } = useSession();
  const { data: userID } = api.user.getAllUserId.useQuery();
  const { data: tags } = api.util.getTags.useQuery();
  const router = useRouter();

  const localDefaultValues = (typeof defaultValues !== "string") ? defaultValues : null;

  const { data: startDate, status: dateStatus } =
    api.event.getEventStart.useQuery({
      id: localDefaultValues?.id ?? "",
    });

  const mutation = api.event.modifyOrCreateEvent.useMutation({
    onSuccess: (succeeded) => {
      if (!succeeded) {
        alert("Event creation or update failed.");
        return;
      }
      alert(
        "Event " +
          (localDefaultValues?.id ? "updated" : "created") +
          " successfully!"
      );

      void context.event.getEventStart.invalidate({ id: localDefaultValues?.id });
      void context.dateStamp.getEventsByTime.invalidate();
      router.push("/");
    },
    onError: (error) => {
      alert(error);
    },
  });

  const [oneDate, setOneDate] = useState(true);
  const [picUrl, setPicUrl] = useState(localDefaultValues?.image || "");

  const {
    defaultDate,
    defaultMax,
    defaultMin,
    defaultStartTime,
    defaultEndTime,
  } = getDefaultTime({ startDate });

  if (status == "loading" || dateStatus == "loading") {
    return (
      <div className={styles.container}>
        <PageSubtitle text="Loading..." />
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className={styles.container}>
        <PageSubtitle text="You must be logged in to create an event." />
      </div>
    );
  }

  // Get select options
  const visibilityOptions = getVisibilityOptions(sessionData.user.role);
  const ownerOptions = getOwnerOptions(userID);
  const tagOptions = getTagOptions(tags);

  // Get default values for selects
  const defaultVisibility = localDefaultValues?.visibility
    ? { value: localDefaultValues.visibility, label: localDefaultValues.visibility }
    : null;
  const defaultLinkVisibility = localDefaultValues?.linkVisibility
    ? {
        value: localDefaultValues.linkVisibility,
        label: localDefaultValues.linkVisibility,
      }
    : null;
  const defaultOwners = localDefaultValues?.owners.map((owner) => ({
    value: owner.id,
    label: owner.username ?? owner.name ?? owner.id,
  }));
  const defaultTags = localDefaultValues?.tags.map((tag) => ({
    value: tag.name,
    label: tag.name,
  }));

  return (
    <div className={styles.container}>
      <Formik
        initialValues={{
          eventName: localDefaultValues?.name ?? "",
          eventDescription: localDefaultValues?.description ?? "",
          eventPicture: localDefaultValues?.image ?? env.NEXT_PUBLIC_DEFAULT_IMAGE,
          eventLocation: localDefaultValues?.location ?? "",
          visibility: localDefaultValues?.visibility
            ? localDefaultValues.visibility
            : sessionData.user.role ?? "",
          linkVisibility: localDefaultValues?.linkVisibility
            ? localDefaultValues.linkVisibility
            : sessionData.user.role ?? "",
          owners: localDefaultValues?.owners.map((owner) => owner.id) ?? [],
          tags: localDefaultValues?.tags.map((tag) => tag.name) ?? [],
          startTime: defaultStartTime,
          endTime: defaultEndTime,
          date: defaultDate,
        }}
        validationSchema={eventSchema}
        onSubmit={(values) => {
          const eventPictureLink =
            !values.eventPicture || values.eventPicture === ""
              ? env.NEXT_PUBLIC_DEFAULT_IMAGE
              : values.eventPicture;

          mutation.mutate({
            id: localDefaultValues?.id,
            name: values.eventName,
            ownersId: values.owners,
            description: values.eventDescription,
            image: eventPictureLink,
            location: values.eventLocation,
            visibility: values.visibility,
            linkVisibility: values.linkVisibility,
            tags: values.tags,
            startTime: computeDate(values.date, values.startTime),
            endTime: computeDate(values.date, values.endTime),
          });
        }}
        validateOnChange={false}
      >
        {({ getFieldProps, setFieldValue }) => (
          <Form>
            <div className="flex flex-row flex-wrap">
              <div className="my-2">
                <div className="flex flex-row flex-wrap align-middle">
                  <label className={styles.label} htmlFor="eventName">
                    Event Name:
                  </label>
                  <Field
                    className={styles.field}
                    id="eventName"
                    name="eventName"
                  />
                </div>
                <div className="my-4">
                  <ErrorMessage
                    component="a"
                    className={styles.errorMsg}
                    name="eventName"
                  />
                </div>
              </div>
              <div className="my-2">
                <div className="flex flex-row flex-wrap align-middle">
                  <label className={styles.label} htmlFor="eventLocation">
                    Event Location:
                  </label>
                  <Field
                    className={styles.field}
                    id="eventLocation"
                    name="eventLocation"
                  />
                </div>
                <div className="my-4">
                  <ErrorMessage
                    component="a"
                    className={styles.errorMsg}
                    name="eventLocation"
                  />
                </div>
              </div>
              <div className="my-2">
                <div className="mr-2 flex flex-row flex-wrap align-middle">
                  <label className={styles.label} htmlFor="visibility">
                    Event Visibility:
                  </label>
                  <Select
                    className="text-black"
                    onChange={async (e) => {
                      await setFieldValue(
                        "visibility",
                        e?.value ?? sessionData.user.role
                      );
                    }}
                    options={visibilityOptions}
                    defaultValue={defaultVisibility}
                  />
                </div>
                <div className="my-4">
                  <ErrorMessage
                    component="a"
                    className={styles.errorMsg}
                    name="visibility"
                  />
                </div>
              </div>
              <div className="my-2">
                <div className="mr-2 flex flex-row flex-wrap align-middle">
                  <label className={styles.label} htmlFor="linkVisibility">
                    Link Visibility:
                  </label>
                  <Select
                    className="text-black"
                    onChange={async (e) => {
                      await setFieldValue(
                        "linkVisibility",
                        e?.value ?? sessionData.user.role
                      );
                    }}
                    options={visibilityOptions}
                    defaultValue={defaultLinkVisibility}
                  />
                </div>
                <div className="my-4">
                  <ErrorMessage
                    component="a"
                    className={styles.errorMsg}
                    name="linkVisibility"
                  />
                </div>
              </div>
              <div className="my-2">
                <div className="flex flex-row flex-wrap align-middle">
                  <label className={styles.label} htmlFor="owners">
                    Owners:
                  </label>
                  <Select
                    components={animatedComponents}
                    isMulti
                    options={ownerOptions}
                    defaultValue={defaultOwners}
                    className="basic-multi-select mr-2 text-black"
                    classNamePrefix="select"
                    onChange={async (e) => {
                      await setFieldValue(
                        "owners",
                        e.map((values) => values.value) ?? []
                      );
                    }}
                  />
                </div>
                <div className="my-4">
                  <ErrorMessage
                    component="a"
                    className={styles.errorMsg}
                    name="owners"
                  />
                </div>
              </div>
              <div className="my-2">
                <div className="flex flex-row flex-wrap align-middle">
                  <label className={styles.label} htmlFor="tags">
                    Tags:
                  </label>
                  <CreatableSelect
                    components={animatedComponents}
                    isMulti
                    className="mr-2 text-black"
                    options={tagOptions}
                    defaultValue={defaultTags}
                    onChange={async (e) => {
                      await setFieldValue(
                        "tags",
                        // @ts-ignore
                        e.map((values) => values.value) ?? []
                      );
                    }}
                  />
                </div>
                <div className="my-4">
                  <ErrorMessage
                    component="a"
                    className={styles.errorMsg}
                    name="tags"
                  />
                </div>
              </div>
              <div className="my-2">
                <div className="flex flex-row flex-wrap align-top">
                  <label className={styles.label} htmlFor="eventDescription">
                    Event Description:
                  </label>
                  <Field
                    className={twMerge("h-12", styles.field)}
                    component="textarea"
                    rows="4"
                    id="eventDescription"
                    name="eventDescription"
                  />
                </div>

                <div className="my-4">
                  <ErrorMessage
                    component="a"
                    className={styles.errorMsg}
                    name="eventDescription"
                  />
                </div>
              </div>
              <hr className="w-full" />
              <div className="my-2">
                <div className="flex flex-col flex-wrap align-top">
                  <div className="my-2 flex flex-row flex-wrap align-middle">
                    <label
                      className="my-2 mr-8 flex align-middle text-lg font-bold"
                      htmlFor="eventDescription"
                    >
                      Event Date
                    </label>
                    {/* {oneDate ? (
                      <ImCheckboxChecked
                        className="align-middle"
                        size={32}
                        onClick={() => setOneDate(true)}
                      />
                    ) : (
                      <ImCheckboxUnchecked
                        size={32}
                        onClick={() => setOneDate(true)}
                      />
                    )}
                    <p className="ml-2 pt-1"> One day </p> */}
                  </div>
                  {oneDate ? (
                    <div className="flex flex-row flex-wrap items-center">
                      <div className="mx-4 my-2 flex flex-col">
                        <label className={styles.label} htmlFor="date">
                          Date:
                        </label>
                        <input
                          className={twMerge("mb-2", styles.field)}
                          type="date"
                          id="start"
                          min={defaultMin}
                          max={defaultMax}
                          {...getFieldProps("date")}
                        />
                        <ErrorMessage
                          component="a"
                          className={styles.errorMsg}
                          name="date"
                        />
                      </div>

                      <div className="mx-4 my-2 flex flex-col">
                        <label className={styles.label} htmlFor="startTime">
                          Start time:
                        </label>
                        <input
                          type="time"
                          className={twMerge("mb-2", styles.field)}
                          {...getFieldProps("startTime")}
                        />
                        <ErrorMessage
                          component="a"
                          className={styles.errorMsg}
                          name="startTime"
                        />
                      </div>

                      <div className="mx-4 my-2 flex flex-col">
                        <label className={styles.label} htmlFor="endTime">
                          End time:
                        </label>
                        <input
                          type="time"
                          className={twMerge("mb-2", styles.field)}
                          {...getFieldProps("endTime")}
                        />
                        <ErrorMessage
                          component="a"
                          className={styles.errorMsg}
                          name="endTime"
                        />
                      </div>
                    </div>
                  ) : (
                    // <Field
                    //   className={styles.field}
                    //   component="input"
                    //   rows="4"
                    //   id="eventDescription"
                    //   name="eventDescription"
                    // />
                    <input
                      type="date"
                      id="start"
                      name="trip-start"
                      value="2018-07-22"
                      min="2018-01-01"
                      max="2018-12-31"
                    />
                  )}
                  {/* <Field
                    className={styles.field}
                    component="textarea"
                    rows="4"
                    id="eventDescription"
                    name="eventDescription"
                  /> */}
                </div>

                <div className="my-4">
                  <ErrorMessage
                    component="a"
                    className={styles.errorMsg}
                    name="eventDescription"
                  />
                </div>
              </div>
              <hr className="w-full" />

              <div className="my-2">
                <div className="flex flex-row flex-wrap items-center">
                  <ValidImage
                    src={picUrl}
                    className="m-3 h-48 w-48 rounded-lg"
                  />

                  <label
                    className={twMerge("h-10", styles.label)}
                    htmlFor="eventPicture"
                  >
                    Event picture (url or file):
                  </label>
                  <Field
                    className={twMerge("h-10", styles.field)}
                    id="linkfield"
                    name="linkfield"
                    onBlur={async (e: ChangeEvent<HTMLInputElement>) => {
                      await setFieldValue("eventPicture", e.target.value, true);
                      setPicUrl(e.target.value);
                    }}
                  />
                  <Field
                    className={twMerge("hidden", styles.field)}
                    id="eventPicture"
                    name="eventPicture"
                  />
                  <input
                    className="m-2"
                    type="file"
                    name="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (!e.target.files) return;
                      const file = e.target.files[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onloadend = async () => {
                        await setFieldValue(
                          "eventPicture",
                          reader.result,
                          true
                        );
                        setPicUrl(reader.result as string);
                      };
                    }}
                  />
                </div>
                <div className="my-4">
                  <ErrorMessage
                    component="a"
                    className={styles.errorMsg}
                    name="eventPicture"
                  />
                </div>
              </div>
            </div>

            <div className="mt-2">
              <button type="submit" className={styles.button}>
                {localDefaultValues?.id ? "Update" : "Create"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export const getVisibilityOptions = (role: string | undefined | null) => {
  if (!role) role = "unauthenticated";

  const visibleRoles = roleOrLower[role];

  return visibleRoles?.map((role) => ({ value: role, label: role }));
};

export const getOwnerOptions = (
  usersIDs: RouterOutputs["user"]["getAllUserId"] | undefined | null
) => {
  if (!usersIDs) return [{ value: "", label: "Loading..." }];

  return usersIDs.map((user) => ({
    value: user.id,
    label: user.info,
  }));
};

export const getTagOptions = (
  tags: RouterOutputs["util"]["getTags"] | null | undefined
) => {
  return tags?.map((tag) => ({ value: tag.name, label: tag.name }));
};

export const computeDate = (dateWithoutHour: string, time: string) => {
  const [year, month, day] = dateWithoutHour.split("-");
  const [hour, minute] = time.split(":");

  let date;
  try {
    if (year && month && day) {
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      date.setHours(parseInt(hour ?? "0"), parseInt(minute ?? "0"), 0);
      return date;
    } else throw new Error("Invalid date");
  } catch (error) {
    alert(error);
    return new Date();
  }
};
