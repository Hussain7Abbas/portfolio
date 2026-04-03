# Step 6 — Shared UI Package

## Goal

Create `@devport/ui` — a shared component library following the shadcn/ui pattern. These
components are used by `apps/app`, `apps/dashboard`, and `apps/website`. The `apps/portfolio`
templates have their own components but may import shared primitives.

## Steps

### 6.1 — Install dependencies

```bash
cd packages/ui
bun add react react-dom
bun add class-variance-authority clsx tailwind-merge
bun add @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu
bun add @radix-ui/react-label @radix-ui/react-separator @radix-ui/react-tabs
bun add @radix-ui/react-toast @radix-ui/react-avatar @radix-ui/react-select
bun add lucide-react
bun add -d @types/react @types/react-dom @devport/tsconfig @devport/tailwind-config
```

### 6.2 — Utility function

**packages/ui/src/lib/utils.ts:**
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 6.3 — Core components to create

Build these using the shadcn/ui pattern (Radix primitives + CVA + Tailwind). Each component goes
in `packages/ui/src/components/`.

| Component | File | Used By |
|-----------|------|---------|
| Button | `button.tsx` | All apps |
| Input | `input.tsx` | All apps |
| Textarea | `textarea.tsx` | app, portfolio |
| Label | `label.tsx` | All apps |
| Card | `card.tsx` | All apps |
| Dialog | `dialog.tsx` | app, dashboard |
| Select | `select.tsx` | app |
| Separator | `separator.tsx` | All apps |
| Avatar | `avatar.tsx` | app, dashboard |
| Badge | `badge.tsx` | app, portfolio |
| Tabs | `tabs.tsx` | app |
| Toast / Toaster | `toast.tsx`, `toaster.tsx` | app, dashboard |
| Dropdown Menu | `dropdown-menu.tsx` | app, dashboard |
| Sidebar | `sidebar.tsx` | app, dashboard |
| Form | `form.tsx` | app (with react-hook-form) |
| FileUpload | `file-upload.tsx` | app (S3 upload wrapper) |

### 6.4 — Export barrel

**packages/ui/src/index.ts:**
```ts
export { Button, buttonVariants } from "./components/button";
export { Input } from "./components/input";
export { Textarea } from "./components/textarea";
export { Label } from "./components/label";
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/card";
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./components/dialog";
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/select";
export { Separator } from "./components/separator";
export { Avatar, AvatarImage, AvatarFallback } from "./components/avatar";
export { Badge, badgeVariants } from "./components/badge";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/tabs";
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./components/dropdown-menu";
export { cn } from "./lib/utils";
```

### 6.5 — Shared layout components

Beyond primitives, create higher-level layout components:

**packages/ui/src/components/app-sidebar.tsx** — The sidebar navigation used by `apps/app`:
- Logo at top
- Navigation links (Profile, Projects, Certificates, Events, GitHub, Messages, SEO, Settings)
- User avatar + logout at bottom

**packages/ui/src/components/dashboard-sidebar.tsx** — The sidebar for `apps/dashboard`:
- Logo at top
- Navigation links (Overview, Users, Templates)
- Admin avatar + logout at bottom

**packages/ui/src/components/file-upload.tsx** — File upload component:
- Drag-and-drop zone
- Progress indicator
- Calls presigned URL endpoint, uploads directly to S3
- Returns the final S3 URL to the parent

### 6.6 — Package configuration

**packages/ui/package.json** (updated):
```json
{
  "name": "@devport/ui",
  "private": true,
  "exports": {
    ".": "./src/index.ts",
    "./globals.css": "./src/globals.css"
  },
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19"
  }
}
```

**packages/ui/src/globals.css** — Base CSS with HSL variables:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

## Key Notes

- All components use `cn()` for className merging with Tailwind.
- Components are "headless" style — they provide structure and base styling but can be
  overridden via className props.
- The `file-upload.tsx` component is critical — it handles the S3 presigned URL flow and is
  used across profile photo, project images, and certificate images.
- The portfolio app's templates do NOT import from `@devport/ui` for their own styled
  components (they have their own), but they MAY import utilities like `cn()`.

## Verification

- `import { Button } from "@devport/ui"` works in any Next.js app
- Components render correctly with Tailwind classes
- TypeScript compiles without errors

## Next Step

Proceed to [Step 07 — User App: Auth Pages](./07-app-auth.md).
