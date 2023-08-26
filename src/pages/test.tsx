import Layout from "~/components/layout/Layout";
import BarViewEvents from "~/components/containers/BarViewEvents";
import { PageBody } from "~/components/general/PageElements";

export default function Home() {
  return (
    <Layout>
      <PageBody>
        <BarViewEvents />
      </PageBody>
    </Layout>
  );
}
