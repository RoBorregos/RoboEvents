import { useRouter } from "next/router";
import Layout from "~/components/layout/Layout";
import { api } from "~/utils/api";

import { PageBody, PageTitle } from "~/components/general/PageElements";

import EventModify from "~/components/events/EventModify";

export default function AddEvent() {
  const router = useRouter();
  const { id } = router.query;
  const { data: eventData } = api.event.getEventNameAndDescription.useQuery({
    id: id as string,
  });

  return (
    <Layout title={eventData?.name} description={eventData?.description}>
      <PageBody>
        <PageTitle text="Event Details" />
        <EventModify eventId={(id as string) ?? "-1"} />
      </PageBody>
    </Layout>
  );
}
