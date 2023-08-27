import { useSession } from "next-auth/react";
import Layout from "~/components/layout/Layout";

import { PageBody, PageTitle } from "~/components/general/PageElements";

import UserCard from "~/components/user/UserCard";
import { useRouter } from "next/router";
import type { Session } from "next-auth";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const userId = router.query?.userId
    ? router.query?.userId[0] ?? ""
    : session?.user.id ?? "";

  return (
    <Layout>
      <PageBody>
        <PageContent session={session} id={userId} />
      </PageBody>
    </Layout>
  );
}

const PageContent = ({
  session,
  id,
}: {
  session: Session | undefined | null;
  id: string;
}) => {
  if (!session && id === "") {
    return (
      <div>
        <p>Not signed in</p>
        <p>Sign in to view your profile information.</p>
      </div>
    );
  } else {
    let title = "See Profile";
    if (session?.user.id === id) {
      title = "Your Profile";
    }
    return (
      <>
        <PageTitle text={title} />
        <UserCard userid={id} />
      </>
    );
  }
};
