import Head from "next/head";
import NavBar from "./NavBar";
import React from "react";

const Layout = ({
  children,
  title = "RoboEvents",
  description = "RoboEvents",
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) => {
  const routes = [
    { name: "Home", path: "/" },
    { name: "Find", path: "/find" },
    {
      name: "Create event",
      path: "/add-event",
      visibility: "organizationMember",
    },
    {
      name: "Countdown",
      path: "/countdown",
    },
    {
      name: "About",
      path: "https://github.com/RoBorregos/RoboEvents#readme",
      target: "_blank" as const,
    },
  ];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar routes={routes} />
      <main>{children}</main>
    </>
  );
};

export default Layout;
