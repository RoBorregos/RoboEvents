import Layout from "~/components/layout/Layout";
import { PageBody } from "~/components/general/PageElements";
import BarViewEvents from "~/components/containers/BarViewEvents";

export default function Home() {

  return (
    <Layout>
      <PageBody>
        <h1 className="text-5xl font-extrabold tracking-tight text-black sm:text-[5rem]">
          Event Manager
        </h1>

        <BarViewEvents/>
      </PageBody>
    </Layout>
  );
}