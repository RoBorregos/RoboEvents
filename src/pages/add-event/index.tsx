import { useSession } from "next-auth/react";
import Layout from "~/components/layout/Layout";

import {
  PageBody,
  PageSubtitle,
  PageTitle,
} from "~/components/general/PageElements";
import { compareRole } from "~/utils/role";

import EventModify from "~/components/events/EventModify";

export default function AddEvent() {
  const { data: session } = useSession();
  const isAllowed = compareRole({
    requiredRole: "organizationMember",
    userRole: session?.user.role,
  });

  return (
    <Layout>
      <PageBody>
        <PageTitle text="Create a new event" />
        {session ? (
          isAllowed ? (
            <EventModify eventId="" />
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
            <p>Sign in to create a new event.</p>
          </div>
        )}
      </PageBody>
    </Layout>
  );
}
