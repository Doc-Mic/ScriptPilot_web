# ScriptPilot Web

Website version of ScriptPilot, an AI-powered YouTube creator assistant that
uses the same Firebase project and backend as the Android app.

## Current State

Implemented:

- Next.js App Router with TypeScript
- Tailwind CSS v4 styling with ScriptPilot dark theme
- Firebase Web SDK initialization from environment variables
- Firebase Authentication with email/password and Google sign-in
- Protected dashboard routes
- Firestore user document subscription for plan, usage, and profile data
- Authenticated Firebase Functions API client for:
  - `findTrends`
  - `generateIdeas`
  - `createScript`
  - `createShort`
  - `seoAssistant`
- Dashboard workflow pages:
  - `/dashboard`
  - `/dashboard/trends`
  - `/dashboard/ideas`
  - `/dashboard/script-studio`
  - `/dashboard/shorts`
  - `/dashboard/seo-assistant`
  - `/dashboard/projects`
  - `/dashboard/premium-plans`
  - `/dashboard/settings`
  - `/dashboard/settings/preferences`
  - `/dashboard/settings/support-legal`
  - `/dashboard/settings/about`
- Workflow handoffs:
  - Trends to Ideas
  - Ideas to Script Studio
  - Script Studio to SEO Assistant
- Copy, save, feedback, and share actions on generated outputs where available
- Web quota display is feature-flagged off for launch while web billing is not live

Not live yet:

- Web payments and subscription checkout
- Premium plan upgrades from the website
- Push notifications / FCM
- Backend storage for premium-plan waitlist emails

## Firebase

Firebase project ID:

```text
scriptpilot-d0e9a
```

Required local environment variables are listed in `.env.local.example`.
Create `.env.local` locally and do not commit it.

```text
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_SITE_URL=
```

The app sends Firebase ID tokens to the existing HTTPS Functions using an
`Authorization: Bearer <token>` header and identifies web calls with
`X-ScriptPilot-Client: web`.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Validation

Run lint:

```bash
npm run lint
```

Run a production build:

```bash
npm run build
```
