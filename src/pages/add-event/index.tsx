import { useSession } from "next-auth/react";
import Layout from "~/components/layout/Layout";
import ValidImage from "~/components/general/ValidImage";

import {
  PageBody,
  PageSubtitle,
  PageTitle,
} from "~/components/general/PageElements";
import { compareRole } from "~/utils/role";

import {
  CreateEventForm,
  CreateEventStyle,
} from "~/components/events/CreateEventForm";
import EventModify from "~/components/events/EventModify";

const formStyle: CreateEventStyle = {
  label: "text-white mr-2 align-middle flex items-center ",
  field: "bg-white mr-2 text-secondary p-1 rounded-lg",
  errorMsg: "text-red-500 bg-tertiary p-2 rounded-lg font-bold",
  button: "bg-white text-secondary p-2 rounded-lg",
  container: "bg-themebg w-full mt-2 mb-2 p-2 rounded-lg",
};

export default function Home() {
  const { data: session } = useSession();
  const isAllowed = compareRole("organizationMember", session?.user.role);

  return (
    <Layout>
      <PageBody>
        <PageTitle text="Create a new event" />
        {session ? (
          isAllowed ? (
            <EventModify eventId=""/>
          ) : (
            <div>
              <p>No Access.</p>
              <p>You must be an organization member to create an event.</p>
              <p>Your role: {session?.user.role}</p>
            </div>
          )
        ) : (
          <div>
            <p>Not signed in</p>
            <p>Sign in to Create a new event.</p>
          </div>
        )}
      </PageBody>
    </Layout>
  );
}
