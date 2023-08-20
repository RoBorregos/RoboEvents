import Layout from "~/components/layout/Layout";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import BarViewEvents from "~/components/containers/BarViewEvents";
import { PageBody } from "~/components/general/PageElements";

export default function Home() {
  return (
    <Layout>
      <PageBody>
        <BarViewEvents />
      </PageBody>
    </Layout>
  );
}

// function AuthShowcase() {
//   const { data: sessionData } = useSession();

//   const { data: secretMessage } = api.authorization.getSecretMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined }
//   );
//   const { data: secretMessageC } =
//     api.authorization.getCommunityMessage.useQuery(
//       undefined, // no input
//       { enabled: sessionData?.user !== undefined }
//     );
//   const { data: secretMessageO } =
//     api.authorization.getOrganizationMessage.useQuery(
//       undefined, // no input
//       { enabled: sessionData?.user !== undefined }
//     );
//   const { data: secretMessageA } = api.authorization.getAdminMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined }
//   );
//   console.log(secretMessage);

//   return (
//     <div className="flex flex-col items-center justify-center gap-4">
//       <p className="text-center text-2xl text-black">
//         {secretMessage && <span> - {secretMessage}</span>}
//         {secretMessageC && <span> - {secretMessageC}</span>}
//         {secretMessageO && <span> - {secretMessageO}</span>}
//         {secretMessageA && <span> - {secretMessageA}</span>}
//       </p>
//     </div>
//   );
// }
