import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Layout from "~/components/layout/Layout";
import NavBar from "~/components/layout/NavBar";
import { api } from "~/utils/api";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC d" });

  return (
    <Layout>
      <p>Texto</p>
    </Layout>
  );
}
