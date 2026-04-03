# Step 8 — User App: Onboarding Wizard

## Goal

Implement a multi-step onboarding wizard that new users go through after their first sign-up.
After completion, the user has a username, profile, and optionally their first project.

## Steps

### 8.1 — Onboarding flow design

The wizard has 4 steps:

```
Step 1: Choose Username
  └── Input: username (validated for uniqueness via API)
  └── Shows preview: portfolio.iscoded.com/<username>/vscode

Step 2: Basic Info
  └── Display Name
  └── Title (e.g. "Full Stack Developer")
  └── Bio (textarea)
  └── Profile Photo (file upload to S3)

Step 3: Add First Project (optional, skippable)
  └── Project Name
  └── Description
  └── Tags
  └── Demo URL
  └── Screenshot (file upload)

Step 4: Choose Template
  └── Grid of available templates (only "VS Code" for now)
  └── Click to select
  └── Shows a static preview thumbnail
```

### 8.2 — Onboarding page

**apps/app/src/app/(authenticated)/onboarding/page.tsx:**

- Server component that checks if user already has a profile.
  - If yes → redirect to `/profile`.
  - If no → render the onboarding client component.

### 8.3 — Onboarding client component

**apps/app/src/app/(authenticated)/onboarding/onboarding-wizard.tsx:**

Client component (`"use client"`) with:
- State: `currentStep` (1–4)
- State: form data accumulator across steps
- Progress bar at top showing Step X of 4
- "Back" / "Next" / "Skip" buttons
- On final step "Complete" button → POST to backend:
  1. `POST /api/profile` — create profile with username, displayName, title, bio, photoUrl, activeTemplate
  2. `POST /api/projects` — create first project (if filled)
- On success → redirect to `/profile`

### 8.4 — Username validation

Step 1 needs real-time username checking:
- Debounce input (300ms)
- Call `POST /api/profile/username/check` with `{ username }`
- Show green check or red X with message
- Validate: lowercase, alphanumeric + hyphens, 3–30 chars, no reserved words

Reserved usernames to block:
```
admin, dashboard, api, auth, settings, onboarding, about, contact,
help, support, blog, docs, terms, privacy, sitemap, robots
```

### 8.5 — Step components

Create individual step components for cleanliness:

```
apps/app/src/app/(authenticated)/onboarding/
├── page.tsx
├── onboarding-wizard.tsx       # Main wizard container
├── steps/
│   ├── username-step.tsx       # Step 1
│   ├── basic-info-step.tsx     # Step 2
│   ├── first-project-step.tsx  # Step 3
│   └── template-step.tsx       # Step 4
```

### 8.6 — Template selection data

For now, hardcode the single template option:

```ts
const TEMPLATES = [
  {
    slug: "vscode",
    name: "VS Code",
    description: "A Visual Studio Code inspired portfolio theme with file explorer navigation and multiple color themes.",
    thumbnail: "/templates/vscode-preview.png",
  },
];
```

Later, this can be fetched from the database or a config file as templates are contributed.

### 8.7 — API calls needed

The onboarding wizard calls:
1. `POST /api/profile/username/check` — { username } → { available: boolean }
2. `POST /api/upload/presigned-url` — { filename, contentType } → { url, key }
3. `POST /api/profile` — full profile creation
4. `POST /api/projects` — first project (optional)

## Key Notes

- The onboarding is only shown once — when the user has no `Profile` record.
- After completion, visiting `/onboarding` redirects to `/profile`.
- The root page `/` checks for profile existence and routes accordingly.
- File uploads during onboarding use the same S3 flow as the rest of the app.
- Template selection at this stage just sets `Profile.activeTemplate` — it can be changed
  later from Settings.

## Verification

- New user signs up → redirected to onboarding
- Can pick a unique username with real-time validation
- Can fill in profile info and upload a photo
- Can optionally add a first project
- Can select a template
- After completion, profile exists in DB and user lands on `/profile`
- Returning to `/onboarding` redirects to `/profile`

## Next Step

Proceed to [Step 09 — User App: CRUD Pages](./09-app-crud.md).
