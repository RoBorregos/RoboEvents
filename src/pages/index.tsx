import { useSession } from "next-auth/react";
import Layout from "~/components/layout/Layout";

import {
  PageBody,
} from "~/components/general/PageElements";
import { compareRole } from "~/utils/role";

export default function Home() {
  const { data: session } = useSession();

  return (
    <Layout>
      <PageBody>
        <h1 className="text-5xl font-extrabold tracking-tight text-black sm:text-[5rem]">
         Event Manager
        </h1>
      </PageBody>
    </Layout>
  );
}
