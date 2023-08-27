# Event Manager

Web page aimed towards helping RoBorregos to manage their events and communicate them efficiently with the community.

<ins>Status</ins>: Development

## Features

- Register and modify events (name, description, start & end dates, visibility, tags, owners, location, and more).

- Add events to your calendar (Outlook, Google Calendar, etc.).

- Filter events by:
  - Start and end dates
  - Tags
  - Visibility
  - Owners
  - Custom text
  - Confirmed assistance

## Role based auth

There are 4 roles in the app:

- admin: All permissions (create, read, update, delete), except for editing other user profiles.
- organizationMember:
  - Create, read, update events. Profile editing.
  - Can only update events if they are part of the owners.
  - Can't see events with admin visibility.
  - Role acquired by OAuth with github: user must be member of "RoBorregos" organization and have it as public. (RoBorregos > people > toggle organization visibility)
- communityMember:
  - See events with community visibility or lower.
  - Profile editing.
  - Confirm event assistance.
  - Role acquired by OAuth using Azure AD. Account must be part of Tec de Monterrey (@tec).
- authenticated:
  - Can only see events with authenticated visibility or lower.
  - Profile editing.
  - Role acquired by OAuth using Azure AD or github that doesn't meet the requirements for the other roles.
- unauthenticated:
  - Can only see events with public visibility.

## Technologies used

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Services in use

- [Vercel:](https://vercel.com) deployment
- [Supabase:](https://supabase.io) image storage
- [CockroachDB:](https://cockroachlabs.com) database storage
- [AzureAd:](https://azure.microsoft.com/en-us/services/active-directory/) OAuth provider
- [GitHub:](https://github.com) OAuth provider

## Other Libraries 

- [add-to-calendar-button-react:](https://add-to-calendar-button.com/) Add events to calendar.
- [formik:](https://formik.org/) Form validation.
- [react-select:](https://react-select.com/home) Select component.
