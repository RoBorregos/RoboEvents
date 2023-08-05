import { useSession } from "next-auth/react";
import Layout from "~/components/layout/Layout";
import ValidImage from "~/components/general/ValidImage";

import {
  PageBody,
  PageSubtitle,
  PageTitle,
} from "~/components/general/PageElements";

import OwnerCard from "~/components/user/OwnerCard";
export default function Home() {
  const { data: session } = useSession();
    
  return (
    <Layout>
      <PageBody>
        <PageTitle text="Your profile" />
        {session ? (
            <OwnerCard userid={session.user.id} />
        ) : (
          <div>
            <p>Not signed in</p>
            <p>Sign in to view your profile information.</p>
          </div>
        )}
      </PageBody>
    </Layout>
  );
}
