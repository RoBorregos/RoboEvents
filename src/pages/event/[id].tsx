import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Layout from "~/components/layout/Layout";

import {
  PageBody,
  PageSubtitle,
  PageTitle,
} from "~/components/general/PageElements";

import EventModify from "~/components/events/EventModify";

export default function AddEvent() {
  const { data: session } = useSession();

  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout>
      <PageBody>
        <PageTitle text="Event Details" />
        {session ? (
          <EventModify eventId={id as string ?? "-1"} />
        ) : (
          <div>
            <p>Not signed in</p>
            <p>Sign in to modify a new event.</p>
          </div>
        )}
      </PageBody>
    </Layout>
  );
}
