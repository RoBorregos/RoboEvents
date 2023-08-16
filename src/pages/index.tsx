import { useSession } from "next-auth/react";
import Layout from "~/components/layout/Layout";

import {
  PageBody,
  PageSubtitle,
  PageTitle,
} from "~/components/general/PageElements";
import { compareRole } from "~/utils/role";
import EventModify from "~/components/events/EventModify";

export default function Home() {
  const { data: session } = useSession();
  const isAllowed = compareRole({
    requiredRole: "organizationMember",
    userRole: session?.user.role,
  });

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
