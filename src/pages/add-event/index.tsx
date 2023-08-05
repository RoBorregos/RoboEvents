import { useSession } from "next-auth/react";
import Layout from "~/components/layout/Layout";
import ValidImage from "~/components/general/ValidImage";

import {
  PageBody,
  PageSubtitle,
  PageTitle,
} from "~/components/general/PageElements";
import { compareRole } from "~/utils/role";

import OwnerCard from "~/components/user/OwnerCard";
import { CreateEvent } from "~/components/events/CreateEvent";

export default function Home() {
  const { data: session } = useSession();
  const isAllowed = compareRole("organizationMember", session?.user.role);

  return (
    <Layout>
      <PageBody>
        <PageTitle text="Create a new event" />
        {session ? (
          isAllowed ? (
            // <OwnerCard userid={session.user.id} />
            <CreateEvent />
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
            <p>Sign in to view Create a new event.</p>
          </div>
        )}
      </PageBody>
    </Layout>
  );
}
