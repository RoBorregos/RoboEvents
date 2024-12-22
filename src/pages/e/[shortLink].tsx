import { useRouter } from "next/router";
import Layout from "~/components/layout/Layout";
import { api } from "~/utils/api";

import { PageBody, PageTitle } from "~/components/general/PageElements";

import path from "path";

export default function AddEvent() {
  const router = useRouter();
  const { shortLink } = router.query;

  const shortLinkString = shortLink as string;

  const { data: eventData, isFetched } = api.event.getEventByShortName.useQuery(
    {
      shortLink: shortLinkString,
    },
    { enabled: Boolean(shortLink) }
  );

  if (eventData) {
    const redirectPath = path.join("/event", eventData);
    router.push(redirectPath);
  }

  return (
    <Layout>
      <PageBody>
        {eventData == null && isFetched ? (
          <PageTitle text="Event not found :0" />
        ) : (
          <PageTitle text="Loading event..." />
        )}
      </PageBody>
    </Layout>
  );
}
