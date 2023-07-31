import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Layout from "~/components/layout/Layout";
import NavBar from "~/components/layout/NavBar";
import { api } from "~/utils/api";

export default function Home() {
  const { data: session } = useSession();

  console.log("Test:");
  console.log(session?.user.organizations);
  
  return (
    <Layout>
      {session ? (
        <div>
          <p>
            Signed in as {session?.user.email}. Info: {session.user.image}.{" "}
            {session.expires}. {session.user.name}. {session.user.organizations}
          </p>
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      ) : (
        <div>
          <p>Not signed in</p>
          <button onClick={() => signIn()}>Sign in</button>
        </div>
      )}
      <p>Test de AuthShowcase:</p>
      <AuthShowcase />
    </Layout>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.authorization.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );
  const { data: secretMessageC } = api.authorization.getCommunityMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );
  const { data: secretMessageO } = api.authorization.getOrganizationMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );
  const { data: secretMessageA } = api.authorization.getAdminMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );
  console.log(secretMessage);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-black">
        {secretMessage && <span> - {secretMessage}</span>}
        {secretMessageC && <span> - {secretMessageC}</span>}
        {secretMessageO && <span> - {secretMessageO}</span>}
        {secretMessageA && <span> - {secretMessageA}</span>}
      </p>    
    </div>
  );
}