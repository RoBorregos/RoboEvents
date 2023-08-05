import { signOut, signIn, useSession } from "next-auth/react";
import ValidImage from "~/components/general/ValidImage";
import { useState } from "react";

// TODO:
// Make current page be highlighted in the navbar.

const NavBar = ({ routes }: { routes: { name: string; path: string }[] }) => {
  const { data: sessionData } = useSession();

  const [closed, setClosed] = useState(true); // State of mobile menu

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* <!-- Mobile menu button--> */}
            <button
              type="button"
              className="group/button inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setClosed(!closed)}
            >
              <span className="sr-only">Open main menu</span>

              {closed ? (
                //  Icon when menu is closed.
                //  Menu open: "hidden", Menu closed: "block"
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              ) : (
                //     Icon when menu is open.
                //     Menu open: "block", Menu closed: "hidden"
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <img
                className="h-8 w-auto"
                src="https://jwxqxlsoznvanzoqgpvb.supabase.co/storage/v1/object/public/profile-pictures/Logo_blanco.png"
                alt="Your Company"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {/* <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" --> */}
                {routes.map((route) => (
                  <a
                    href={route.path}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    key={route.name}
                  >
                    {route.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {sessionData ? (
              <div className="group/profile relative ml-3">
                <div>
                  <button
                    type="button"
                    className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    id="user-menu-button"
                  >
                    <span className="sr-only">Open user menu</span>
                    <ValidImage
                      src={sessionData.user.image}
                      alt=""
                      className="h-8 w-8 rounded-full"
                    />
                  </button>
                </div>

                {/* <!--
            Dropdown menu, show/hide based on menu state.
          --> */}
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right scale-0 rounded-md bg-white py-1 opacity-0 shadow-lg ring-1 ring-black ring-opacity-5 duration-200 focus:outline-none group-focus-within/profile:scale-100 group-focus-within/profile:opacity-100">
                  {/* <!-- Active: "bg-gray-100", Not Active: "" --> */}
                  <a
                    href="/user"
                    className="block px-4 py-2 text-sm text-gray-700"
                  >
                    Your Profile
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700"
                    onClick={() => void signOut()}
                  >
                    Sign out
                  </a>
                </div>
              </div>
            ) : (
              <button
                onClick={() => void signIn()}
                className="rounded-md bg-gray-700 px-3 py-2 text-sm font-medium text-gray-300 duration-100 hover:bg-slate-600 hover:text-white"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>

      {/* <!-- Mobile menu, show/hide based on menu state. --> */}
      {!closed && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {/* <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" --> */}
            {routes.map((route) => (
              <a
                href={route.path}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                key={route.name}
              >
                {route.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
