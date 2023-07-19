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
  let routes = [
    { name: "Home", path: "/" },
    { name: "Add event", path: "/about" },
    { name: "About", path: "/about" },
  ];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar
        routes={routes}
      />
      <main>
        {children}
      </main>
    </>
  );
};

export default Layout;
