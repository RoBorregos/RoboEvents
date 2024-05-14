import Layout from "~/components/layout/Layout";
import { PageBody } from "~/components/general/PageElements";
import BarViewEvents from "~/components/containers/BarViewEvents";

export default function Home() {
  return (
    <Layout>
      <PageBody>
        <BarViewEvents />
      </PageBody>
    </Layout>
  );
}
