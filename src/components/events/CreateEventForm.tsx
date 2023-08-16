import { Formik, Field, Form, ErrorMessage } from "formik";
import { eventSchema } from "../schemas/eventSchema";
import { useState, type ChangeEvent } from "react";
import { api } from "~/utils/api";
import { env } from "~/env.mjs";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import ValidImage from "../general/ValidImage";
import { twMerge } from "tailwind-merge";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useSession } from "next-auth/react";
import { PageSubtitle } from "../general/PageElements";
import { roleOrLower } from "~/utils/role";
import type { RouterOutputs } from "~/utils/api";
import makeAnimated from "react-select/animated";

export interface CreateEventStyle {
  label: string | undefined;
  field: string | undefined;
  errorMsg: string | undefined;
  button: string | undefined;
  container: string | undefined;
}

const animatedComponents = makeAnimated();

export const CreateEventForm = ({
  styles,
  defaultValues,
}: {
  styles: CreateEventStyle;
  defaultValues?: RouterOutputs["event"]["getModifyEventInfo"];
}) => {
  const { data: sessionData, status } = useSession();
  const { data: userID } = api.user.getAllUserId.useQuery();
  const { data: tags } = api.util.getTags.useQuery();
  const { data: startDate, status: dateStatus } =
    api.event.getEventStart.useQuery({
      id: defaultValues?.id ?? "",
    });

  const mutation = api.event.modifyOrCreateEvent.useMutation({
    onSuccess: () => {
      alert(
        "Event " +
          (defaultValues?.id ? "updated" : "created") +
          " successfully!"
      );
    },
    onError: (error) => {
      alert(error);
    },
  });

  const [oneDate, setOneDate] = useState(true);
  const [picUrl, setPicUrl] = useState(defaultValues?.image || "");

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
  const defaultVisibility = defaultValues?.visibility
    ? { value: defaultValues.visibility, label: defaultValues.visibility }
    : null;
  const defaultOwners = defaultValues?.owners.map((owner) => ({
    value: owner.id,
    label: owner.username,
  }));
  const defaultTags = defaultValues?.tags.map((tag) => ({
    value: tag.name,
    label: tag.name,
  }));

  return (
    <div className={styles.container}>
      <Formik
        initialValues={{
          eventName: defaultValues?.name ?? "",
          eventDescription: defaultValues?.description ?? "",
          eventPicture: defaultValues?.image ?? env.NEXT_PUBLIC_DEFAULT_IMAGE,
          eventLocation: defaultValues?.location ?? "",
          visibility: defaultValues?.visibility
            ? defaultValues.visibility
            : sessionData.user.role ?? "",
          owners: defaultValues?.owners.map((owner) => owner.id) ?? [],
          tags: defaultValues?.tags.map((tag) => tag.name) ?? [],
          startTime: defaultStartTime,
          endTime: defaultEndTime,
          date: defaultDate,
        }}
        validationSchema={eventSchema}
        onSubmit={(values) => {
          mutation.mutate({
            id: defaultValues?.id,
            name: values.eventName,
            ownersId: values.owners,
            description: values.eventDescription,
            image: values.eventPicture,
            location: values.eventLocation,
            visibility: values.visibility,
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
                    {oneDate ? (
                      <ImCheckboxChecked
                        className="align-middle"
                        size={32}
                        onClick={() => setOneDate(!oneDate)}
                      />
                    ) : (
                      <ImCheckboxUnchecked
                        size={32}
                        onClick={() => setOneDate(!oneDate)}
                      />
                    )}
                    <p className="ml-2 pt-1"> One day </p>
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
                        await setFieldValue("eventPicture", reader.result, true);
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
                Update
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const getVisibilityOptions = (role: string | undefined | null) => {
  if (!role) role = "unauthenticated";

  const visibleRoles = roleOrLower[role];

  return visibleRoles?.map((role) => ({ value: role, label: role }));
};

const getOwnerOptions = (
  usersIDs: RouterOutputs["user"]["getAllUserId"] | undefined | null
) => {
  if (!usersIDs) return [{ value: "", label: "Loading..." }];

  return usersIDs.map((user) => ({
    value: user.id,
    label: user.info,
  }));
};

const getTagOptions = (
  tags: RouterOutputs["util"]["getTags"] | null | undefined
) => {
  return tags?.map((tag) => ({ value: tag.name, label: tag.name }));
};

const computeDate = (dateWithoutHour: string, time: string) => {
  const [hour, minute] = time.split(":");

  const date = new Date(dateWithoutHour);

  date.setHours(parseInt(hour ?? "0"), parseInt(minute ?? "0"), 0);
  return date;
};

const getDefaultTime = ({
  startDate,
}: {
  startDate: RouterOutputs["event"]["getEventStart"] | undefined | null;
}) => {
  if (!startDate) {
    const today = new Date();
    const maxDay = new Date(
      today.getFullYear() + 2,
      today.getMonth(),
      today.getDate()
    );
    const minDay = new Date(
      today.getFullYear() - 2,
      today.getMonth(),
      today.getDate()
    );
    const defaultDate = today.toISOString().split("T")[0] as string;
    const defaultMax = maxDay.toISOString().split("T")[0];
    const defaultMin = minDay.toISOString().split("T")[0];

    const hours = String(today.getHours()).padStart(2, "0");
    const minutes = String(today.getMinutes()).padStart(2, "0");
    const defaultStartTime = `${hours}:${minutes}`;

    return {
      defaultDate,
      defaultMax,
      defaultMin,
      defaultStartTime,
      defaultEndTime: defaultStartTime,
    };
  } else {
    const date = new Date(startDate.start);

    const maxDay = new Date(
      date.getFullYear() + 2,
      date.getMonth(),
      date.getDate()
    );
    const minDay = new Date(
      date.getFullYear() - 2,
      date.getMonth(),
      date.getDate()
    );

    const defaultDate = date.toISOString().split("T")[0] as string;
    const defaultMax = maxDay.toISOString().split("T")[0];
    const defaultMin = minDay.toISOString().split("T")[0];

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const defaultStartTime = `${hours}:${minutes}`;

    const dateEnd = new Date(startDate.end);
    const hoursEnd = String(dateEnd.getHours()).padStart(2, "0");
    const minutesEnd = String(dateEnd.getMinutes()).padStart(2, "0");
    const defaultEndTime = `${hoursEnd}:${minutesEnd}`;
    return {
      defaultDate,
      defaultMax,
      defaultMin,
      defaultStartTime,
      defaultEndTime,
    };
  }
};
