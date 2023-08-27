import Layout from "~/components/layout/Layout";
import { PageBody, PageSubtitle } from "~/components/general/PageElements";
import Select, { type ActionMeta } from "react-select";
import makeAnimated from "react-select/animated";
import { api } from "~/utils/api";
import {
  getOwnerOptions,
  getTagOptions,
  getVisibilityOptions,
} from "~/components/events/CreateEventForm";
import {
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  useRef,
  useState,
  useId,
} from "react";
import { useSession } from "next-auth/react";
import EventView from "~/components/events/EventView";
import {
  EventListContainer,
  EventContainer,
} from "~/components/general/Containers";

const animatedComponents = makeAnimated();

type IterableState = {
  owners: string[] | null;
  tags: string[] | null;
  confirmed: string[] | null;
};

interface Option {
  readonly label: string;
  readonly value: string;
}

type SingleElementState = {
  visibility: string | null;
  startDate: string | null;
  endDate: string | null;
  text: string | null;
};

const handleIterableFilter = (
  setter: Dispatch<SetStateAction<IterableState>>,
  e: readonly Option[],
  name?: string
) => {
  if (!name) {
    console.log("Name of multiselect is null.");
    return;
  }
  setter((prev) => ({
    ...prev,
    [name]: e.map((values) => values.value) ?? null,
  }));
};

const handleSingleValueFilter = (
  setter: Dispatch<SetStateAction<SingleElementState>>,
  e: Option | null,
  name?: string
) => {
  if (!name) {
    console.log("Name of single select is null.");
    return;
  }
  setter((prev) => ({
    ...prev,
    [name]: e?.value ?? null,
  }));
};

const handleSingleValue = (
  setter: Dispatch<SetStateAction<SingleElementState>>,
  e: ChangeEvent<HTMLInputElement>,
  isDate: boolean
) => {
  if (!e.target.id) {
    console.log("ID of date input is null.");
    return;
  }
  if (isDate) {
    const inputDate = e?.target?.valueAsDate;

    // Date recieved as UTC from input. Convert to local time.
    inputDate?.setMinutes(new Date().getTimezoneOffset(), 0, 0);
    setter((prev) => ({
      ...prev,
      [e.target.id]: inputDate ? inputDate.toUTCString() : null,
    }));
  } else {
    setter((prev) => ({
      ...prev,
      [e.target.id]: e?.target.value ?? null,
    }));
  }
};

export default function Find() {
  // Get all data for filter options
  const { data: sessionData } = useSession();
  const { data: userID } = api.user.getAllUserId.useQuery();
  const { data: tags } = api.util.getTags.useQuery();

  // Get the available options for select components
  const ownerOptions = getOwnerOptions(userID);
  const tagOptions = getTagOptions(tags);
  const visibilityOptions = getVisibilityOptions(sessionData?.user?.role);

  // Get the default options for select components, using query params.

  // Set the state for the filters
  const [iterableFilters, setIterableFilters] = useState<IterableState>({
    owners: [],
    tags: [],
    confirmed: [],
  });
  const [singleValueFilters, setSingleValueFilters] =
    useState<SingleElementState>({
      visibility: null,
      startDate: null,
      endDate: null,
      text: null,
    });

  // Get the filtered events
  const { refetch } = api.filter.getFilteredEvents.useQuery(
    {
      ...singleValueFilters,
      ...iterableFilters,
    },
    {
      onSuccess: (data) => {
        setEventsIds(data);
      },
      refetchOnMount: false,
      enabled: false,
    }
  );

  // Use state for the ids to avoid undefined when re-rendering by a change in the filters.
  const [eventsIds, setEventsIds] = useState<string[] | undefined>([]);

  // Refetch on first render
  const firstRender = useRef(true);

  if (firstRender.current) {
    refetch();
    firstRender.current = false;
  }

  return (
    <Layout>
      <PageBody>
        <h1 className="text-5xl font-extrabold tracking-tight text-black sm:text-[5rem]">
          Find Events
        </h1>
        <div className="flex flex-row flex-wrap rounded-lg bg-highlight p-2">
          <div className="m-2 flex flex-col rounded-lg bg-themebg p-2">
            <h3 className="font-semibold text-white ">Owners</h3>
            <Select
              instanceId={useId()}
              components={animatedComponents}
              isMulti
              options={ownerOptions}
              className="basic-multi-select mr-2 text-black"
              classNamePrefix="select"
              defaultValue={[] as Option[]}
              name="owners"
              onChange={(
                option: readonly Option[],
                actionMeta: ActionMeta<Option>
              ) =>
                handleIterableFilter(
                  setIterableFilters,
                  option,
                  actionMeta.name
                )
              }
            />
          </div>
          <div className="m-2 flex flex-col rounded-lg bg-themebg p-2">
            <h3 className="font-semibold text-white ">Confirmed</h3>
            <Select
              instanceId={useId()}
              components={animatedComponents}
              isMulti
              options={ownerOptions}
              className="basic-multi-select mr-2 text-black"
              classNamePrefix="select"
              defaultValue={[] as Option[]}
              name="confirmed"
              onChange={(
                option: readonly Option[],
                actionMeta: ActionMeta<Option>
              ) =>
                handleIterableFilter(
                  setIterableFilters,
                  option,
                  actionMeta.name
                )
              }
            />
          </div>
          <div className="m-2 flex flex-col rounded-lg bg-themebg p-2">
            <h3 className="font-semibold text-white ">Tags</h3>
            <Select
              instanceId={useId()}
              components={animatedComponents}
              isMulti
              options={tagOptions}
              className="basic-multi-select mr-2 text-black"
              classNamePrefix="select"
              defaultValue={[] as Option[]}
              name="tags"
              onChange={(
                option: readonly Option[],
                actionMeta: ActionMeta<Option>
              ) =>
                handleIterableFilter(
                  setIterableFilters,
                  option,
                  actionMeta.name
                )
              }
            />
          </div>
          <div className="m-2 flex flex-col rounded-lg bg-themebg p-2">
            <h3 className="font-semibold text-white ">Visibility</h3>
            <Select
              instanceId={useId()}
              components={animatedComponents}
              options={visibilityOptions}
              isClearable
              isMulti={false}
              className="basic-multi-select mr-2 text-black"
              classNamePrefix="select"
              name="visibility"
              onChange={(
                option: Option | null,
                actionMeta: ActionMeta<Option>
              ) => {
                handleSingleValueFilter(
                  setSingleValueFilters,
                  option,
                  actionMeta.name
                );
              }}
            />
          </div>
          <div className="m-2 flex flex-col rounded-lg bg-themebg p-2">
            <h3 className="font-semibold text-white ">After</h3>
            <input
              type="date"
              id="startDate"
              className="rounded-md p-1"
              onChange={(e) => {
                handleSingleValue(setSingleValueFilters, e, true);
              }}
            />
          </div>
          <div className="m-2 flex flex-col rounded-lg bg-themebg p-2">
            <h3 className="font-semibold text-white ">Before</h3>
            <input
              type="date"
              id="endDate"
              className="rounded-md p-1"
              onChange={(e) => {
                handleSingleValue(setSingleValueFilters, e, true);
              }}
            />
          </div>
          <div className="m-2 flex flex-col rounded-lg bg-themebg p-2">
            <h3 className="font-semibold text-white ">Text</h3>
            <input
              type="text"
              id="text"
              className="rounded-md p-1"
              onChange={(e) => {
                handleSingleValue(setSingleValueFilters, e, false);
              }}
            />
          </div>
          <div className="m-2 mb-auto mt-auto flex h-fit flex-col items-center justify-center rounded-lg bg-themebg p-2">
            <button
              className="rounded-xl bg-green-500 p-1 text-themebg"
              onClick={async () => {
                await refetch();
              }}
            >
              Search
            </button>
          </div>
        </div>
        <DisplayEvents eventIds={eventsIds} />
      </PageBody>
    </Layout>
  );
}

const DisplayEvents = ({ eventIds }: { eventIds: string[] | undefined }) => {
  return (
    <EventListContainer className="my-2">
      {eventIds?.length ?? 0 > 0 ? (
        eventIds?.map((id) => {
          return (
            <EventContainer key={id}>
              <EventViewWrapper id={id} />
            </EventContainer>
          );
        })
      ) : (
        <PageSubtitle text="No events found." />
      )}
    </EventListContainer>
  );
};

// Wrapper to generate event given the id.
const EventViewWrapper = ({ id }: { id: string }) => {
  const { data: dateStamp } = api.event.getStartAndEnd.useQuery({
    eventId: id,
  });

  if (!dateStamp) return <></>;
  return <EventView className="mx-2 " dateStamp={dateStamp} />;
};
