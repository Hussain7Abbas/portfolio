# Step 9 — User App: All CRUD Pages

## Goal

Implement all management pages in the user app: profile editing, projects, certificates, events,
GitHub configuration, contact message inbox, SEO settings, and template/account settings.

## Steps

### 9.1 — Authenticated layout

**apps/app/src/app/(authenticated)/layout.tsx:**

Layout with:
- Sidebar on the left (from `@devport/ui` `AppSidebar`)
- Main content area on the right
- Topbar with user name, avatar, notification badge (unread message count), and logout button

Sidebar navigation items:
```
Profile       /profile
Projects      /projects
Certificates  /certificates
Events        /events
GitHub        /github
Messages      /messages
SEO           /seo
Settings      /settings
```

### 9.2 — API helper

**apps/app/src/lib/api.ts:**

Create a typed API helper that wraps fetch with:
- Base URL from `NEXT_PUBLIC_API_URL`
- Credentials: "include" (for cookies)
- Content-Type: application/json
- Generic error handling

```ts
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string): Promise<T> { ... }
  async post<T>(path: string, body: unknown): Promise<T> { ... }
  async put<T>(path: string, body: unknown): Promise<T> { ... }
  async delete(path: string): Promise<void> { ... }
}

export const api = new ApiClient(process.env.NEXT_PUBLIC_API_URL!);
```

### 9.3 — Profile page

**apps/app/src/app/(authenticated)/profile/page.tsx:**

Form to edit:
- Display Name (input)
- Title (input, e.g., "Full Stack Developer")
- Bio (textarea)
- Profile Photo (file upload, shows current photo)
- Resume URL (input, or file upload)
- Social Links section:
  - GitHub URL
  - LinkedIn URL
  - Twitter URL
  - Website URL
  - Public Email

"Save Changes" button → `PUT /api/profile`

At the top, show a link to the live portfolio:
`portfolio.iscoded.com/<username>/<activeTemplate>`

### 9.4 — Projects page

**apps/app/src/app/(authenticated)/projects/page.tsx:**

- List of user's projects as cards
- Each card shows: image thumbnail, name, tags, demo link
- "Add Project" button → opens dialog/modal
- Edit button on each card → opens dialog pre-filled
- Delete button → confirm dialog → `DELETE /api/projects/:id`
- Drag-to-reorder (optional, can use order field) or manual up/down arrows

**Project form fields:**
- Name (required)
- Description (textarea)
- Image (file upload)
- Tags (multi-input, comma-separated or tag chips)
- Demo URL
- Source URL

### 9.5 — Certificates page

**apps/app/src/app/(authenticated)/certificates/page.tsx:**

Same pattern as Projects:
- List as cards with image, name, description
- Add/Edit/Delete via dialog
- Reorder support

**Certificate form fields:**
- Name (required)
- Description (textarea)
- Image (file upload)
- URL (link to certificate)

### 9.6 — Events page

**apps/app/src/app/(authenticated)/events/page.tsx:**

Same CRUD pattern:
- List with image, name, description
- Add/Edit/Delete via dialog

**Event form fields:**
- Name (required)
- Description (textarea)
- Image (file upload)
- URL (link to event)

### 9.7 — GitHub page

**apps/app/src/app/(authenticated)/github/page.tsx:**

Two sections:

**Section 1: Connect GitHub**
- Input for GitHub username
- "Fetch Repos" button → calls `GET /api/github/repos/:username`

**Section 2: Select Repos** (shown after fetching)
- List of repos with checkboxes
- Shows: repo name, description, stars, language
- User checks which repos to showcase
- "Save Selection" button → `PUT /api/github/config`

### 9.8 — Messages page (inbox)

**apps/app/src/app/(authenticated)/messages/page.tsx:**

Contact message inbox:
- List of messages sorted by date (newest first)
- Each row: sender name, subject, date, read/unread indicator
- Click to expand → shows full message, sender email
- "Mark as Read" button → `PUT /api/messages/:id/read`
- "Delete" button → `DELETE /api/messages/:id`
- Unread count shown in sidebar badge
- Optional: filter by read/unread

### 9.9 — SEO page

**apps/app/src/app/(authenticated)/seo/page.tsx:**

Form to edit portfolio SEO metadata:
- Title (input, with preview of how it appears in search)
- Description (textarea, with character count, max 160)
- Keywords (input, comma-separated)
- OG Image (file upload, with dimension recommendation: 1200x630)

"Save" button → `PUT /api/seo`

### 9.10 — Settings page

**apps/app/src/app/(authenticated)/settings/page.tsx:**

Two sections:

**Section 1: Template Selection**
- Grid of available templates (just VS Code for now)
- Current template highlighted
- Click to switch → `PUT /api/profile` with new `activeTemplate`

**Section 2: Account**
- Change password (if email/password account)
- Delete account (with confirmation dialog) → calls auth + deletes all user data

## File Structure

```
apps/app/src/app/(authenticated)/
├── layout.tsx
├── onboarding/...
├── profile/
│   └── page.tsx
├── projects/
│   ├── page.tsx
│   └── project-form.tsx         # Reusable form component for add/edit
├── certificates/
│   ├── page.tsx
│   └── certificate-form.tsx
├── events/
│   ├── page.tsx
│   └── event-form.tsx
├── github/
│   └── page.tsx
├── messages/
│   └── page.tsx
├── seo/
│   └── page.tsx
└── settings/
    └── page.tsx
```

## Key Notes

- All pages fetch data client-side using the API helper with credentials.
- Forms use controlled React state. Consider `react-hook-form` + `zod` for validation if
  complexity warrants it.
- File uploads go through the presigned URL flow (Step 10). The upload component returns the
  S3 URL which is stored in the form state and sent to the API.
- The authenticated layout fetches the user session once and passes it via React context so
  child pages don't re-fetch.
- Toast notifications (`react-hot-toast` or shadcn toast) for success/error feedback on all
  mutations.

## Verification

- All 8 CRUD pages render and function
- Can create, read, update, delete for projects, certificates, events
- Can edit profile and see changes reflected
- Can connect GitHub and select repos
- Messages inbox shows messages sent via portfolio contact form
- SEO settings save correctly
- Template can be changed in settings
- All forms validate required fields
- TypeScript compiles without errors

## Next Step

Proceed to [Step 10 — S3 File Upload](./10-s3-upload.md).
