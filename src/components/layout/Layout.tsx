import Head from "next/head";
import NavBar from "./NavBar";

const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
  title = "Event Manager",
  description = "Event Manager",
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) => {
  const routes = [
    { name: "Home", path: "/" },
    { name: "Find", path: "/find" },
    { name: "Add event", path: "/add-event", visibility: "organizationMember" },
    {
      name: "About",
      path: "https://github.com/Oscar-gg/EventManager#readme",
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
