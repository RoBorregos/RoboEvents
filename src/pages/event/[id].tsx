import { useRouter } from "next/router";
import Layout from "~/components/layout/Layout";

import {
  PageBody,
  PageTitle,
} from "~/components/general/PageElements";

import EventModify from "~/components/events/EventModify";

export default function AddEvent() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout>
      <PageBody>
        <PageTitle text="Event Details" />
        <EventModify eventId={(id as string) ?? "-1"} />
      </PageBody>
    </Layout>
  );
}
