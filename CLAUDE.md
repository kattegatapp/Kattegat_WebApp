# Kattegat.app — WebApp

## What this is

The Next.js web client for **Kattegat** — a premium Dubai/UAE entertainment and
hospitality talent marketplace. This web app currently owns the public launch waitlist
and the specialized admin entry point.

The mobile app is the design source of truth:

`../Kattegat_Mobile`

The backend is the data and business-rules source of truth:

`../Kattegat_Backend`

Before changing visual design here, inspect the mobile app's theme files and mirror the
same brand system:

- `../Kattegat_Mobile/src/theme/colors.ts`
- `../Kattegat_Mobile/src/theme/glass.ts`
- `../Kattegat_Mobile/src/theme/spacing.ts`
- `../Kattegat_Mobile/src/theme/typography.ts`
- `../Kattegat_Mobile/src/components/ui/GlassCard.tsx`
- `../Kattegat_Mobile/src/components/ui/AmbientGlow.tsx`

This web app should feel like the same product as the mobile app: premium, direct,
clean, glassmorphic, and built around the locked Kattegat brand palette.

Before wiring real product data, auth, waitlist persistence, admin tools, billing, or
business rules, inspect the backend docs and matching module:

- `../Kattegat_Backend/CLAUDE.md`
- `../Kattegat_Backend/src/modules`
- `../Kattegat_Backend/src/types`
- `../Kattegat_Backend/supabase/migrations`

## Critical local rule

Read `AGENTS.md` first. This project uses Next.js `16.2.10`, and the local instruction
says this is **not** the Next.js you know. Before writing Next.js code, read the relevant
guide in:

`node_modules/next/dist/docs/`

Heed deprecations and current App Router conventions from those local docs.

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js App Router | Next `16.2.10` |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS 4 | Tokens live in `src/app/globals.css` |
| UI | shadcn/ui | Installed via CLI; components live in `src/components/ui` |
| Forms | react-hook-form + zod | Validation schemas in `src/lib/validations` |
| Server state | TanStack Query | Provider in `src/lib/providers.tsx` |
| Charts/tables | Recharts + TanStack Table | Used in admin preview |
| Icons | lucide-react | Prefer Lucide icons for controls |
| Brand assets | `public/brand` | Shared visual identity from mobile |
| Backend | Express REST API | Companion project: `../Kattegat_Backend` |

## Package manager and commands

Use npm in this repo.

```bash
npm run dev
npm run build
npm run lint
npx shadcn@latest add <component>
```

## Project structure

```txt
Kattegat_WebApp/
├── src/
│   ├── app/
│   │   ├── page.tsx                         # public launch waitlist
│   │   ├── layout.tsx                       # root metadata, font, providers
│   │   ├── globals.css                      # Tailwind 4 theme + global brand CSS
│   │   └── kattegat-admin/login/page.tsx    # admin login entry
│   ├── components/
│   │   ├── admin/                           # admin login/dashboard preview modules
│   │   ├── ui/                              # local design-system primitives
│   │   └── waitlist/                        # public waitlist modules
│   └── lib/
│       ├── providers.tsx                    # QueryClientProvider
│       ├── utils.ts                         # cn()
│       └── validations/                     # zod schemas
├── public/brand/                            # Kattegat app icon/logo/launch imagery
├── AGENTS.md
├── CLAUDE.md
└── package.json
```

## Routes

- `/` — public launch waitlist and brand story.
- `/kattegat-admin/login` — isolated admin portal login URL.

Current behavior is intentionally scaffolded:

- Waitlist submissions are stored in browser `localStorage`.
- Admin login simulates a mutation and displays wiring-ready copy.
- There is no real backend integration in the web app yet.

## Backend integration

The web app should integrate with `../Kattegat_Backend` when moving beyond scaffolded
local behavior. Treat that backend as the source of truth for schemas, permissions,
business rules, billing, roles, and lifecycle states.

Backend stack:

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Node.js 20 | Backend uses yarn, not npm |
| Framework | Express | REST API, no GraphQL |
| Database | PostgreSQL on Supabase | RLS is enforced |
| Auth | Supabase Auth | JWT-based |
| DB access | `@supabase/supabase-js` | No ORM |
| Cache | Upstash Redis | Search/profile/session caching |
| Media | Cloudinary | Profile, portfolio, invoice media |
| Realtime | Supabase Realtime | Chat, presence, notifications |
| Payments | Stripe | Web-first seller billing |

### API shape

Successful responses use:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "total": 42
  }
}
```

Errors use:

```json
{
  "success": false,
  "error": {
    "message": "Quote not found",
    "code": "QUOTE_NOT_FOUND"
  }
}
```

When adding web API calls, create a small typed client layer that understands this
envelope instead of scattering raw `fetch` calls through components.

### Backend module map

The backend is organized by modules:

- `auth` — registration, login, refresh, logout.
- `users` — profile, role management, dual-identity upgrade.
- `catalog` — category/subcategory taxonomy and dynamic listing field schemas.
- `sellers` — seller profiles, portfolio, services.
- `buyers` — buyer profile, search, discovery.
- `requirements` — reverse marketplace requirements.
- `quotes`, `invoices`, `bookings`, `clients` — seller tools and CRM.
- `chat` — inquiry inbox and realtime messaging.
- `reviews` — ratings and reviews.
- `payments` — Stripe/web billing.
- `referrals`, `founding-members`, `vetted`, `recommend` — growth and managed service flows.
- `admin` — internal operations tools.
- `analytics`, `notifications`, `push-tokens` — operational and lifecycle systems.

Web routes should map to these modules rather than inventing new client-only models.

### Domain rules to preserve

- One account can hold buyer and seller identities; UI identity switching is not a
  security boundary.
- Seller tiers are `free`, `pro`, and `white_glove`.
- Starter/free sellers do not get direct client chat; inquiries route through Kattegat
  Vetted/agent flows.
- White Glove is a managed service; users do not self-configure everything.
- Money is stored as integer fils, never floating AED values.
- Backend validation and RLS are authoritative; client gating is UX only.
- Soft-delete financial records; never assume destructive deletion is allowed.

### Web-specific backend expectations

- Replace `localStorage` waitlist storage with a real backend endpoint when available.
- Admin login should connect to backend admin/auth flows and must respect backend roles:
  `agent` and `admin`.
- Billing and seller plan management belong on web, not in the mobile app. The mobile app
  deliberately has no pricing, upgrade, or checkout UI.
- Use shared backend concepts and response types where possible so the mobile app, web app,
  and backend stay aligned.

## Design system

### UI library

Use **shadcn/ui** as the primary design library. This is a strict project rule, not a
preference. Kattegat's theme, glassmorphism, spacing, and brand assets should be applied
on top of shadcn components rather than replacing them with custom-built primitives.

- Install UI primitives with `npx shadcn@latest add <component>`.
- Keep generated shadcn components in `src/components/ui`.
- Import UI primitives from `@/components/ui/...`.
- Do not hand-build custom primitives when shadcn has the component.
- Do not copy component source from the docs manually; use the CLI so `components.json`,
  dependencies, and file conventions stay aligned.
- Compose product-specific surfaces from shadcn components plus Kattegat theme classes.
- If a component needs a brand treatment, style the shadcn component with Tailwind classes
  or CSS variables rather than replacing it with a custom implementation.
- Custom components belong in product folders such as `src/components/waitlist` or
  `src/components/admin`, and should compose shadcn primitives internally.
- Existing shadcn setup is stored in `components.json`.

The app currently has shadcn-generated `button`, `badge`, `card`, `input`, and `label`
components installed.

### Assets

Web brand assets should mirror the mobile app. The mobile source assets live in:

`../Kattegat_Mobile/assets/images`

Web copies live in:

- `public/brand/app-icon.png`
- `public/brand/launch-visual.jpg`
- `public/brand/logo-cover.png`
- `public/brand/logo/*`
- `public/brand/badges/*`
- `public/favicon.png`

Use these files instead of the default Next/Vercel starter assets. For static files in
`public`, reference paths from the site root, for example `/brand/logo/logo-main.svg`.

### Brand palette

Use the same locked palette as the mobile app:

| Token | Hex | Use |
|---|---:|---|
| Forest | `#003912` | Primary brand anchor, deep backgrounds, text on light surfaces |
| Mantis | `#6FDB42` | Primary CTAs, active states, high-value accent |
| Emerald | `#48DC81` | Secondary accent, success, soft gradients |
| Astronaut Blue | `#1C4759` | Info, secondary accent, supporting depth |

Neutral colors should stay close to the mobile palette:

- Near-white background: `#F7F9F8`
- Muted surface: `#EEF2F0`
- Border: `#E1E7E3`
- Muted text: `#4F6058`

Do not introduce new brand hues casually. If a new color is needed, first ask whether it
belongs in the Kattegat design system.

### Typography

Plus Jakarta Sans is the locked brand typeface. The web app currently loads it in
`src/app/layout.tsx` via `next/font/google`.

Keep type confident but compact:

- Hero/display: extra bold, tight line-height.
- Section headings: bold/extra bold.
- Body: medium/regular, readable line-height.
- Labels and badges: small, uppercase only when it helps scanning.

Do not use negative letter spacing except where the existing page already does for large
display text. Keep compact UI text at normal tracking.

### Spacing and radius

Mirror the mobile scale:

- Spacing is based on a 4px rhythm.
- Radius tokens: `8`, `12`, `16`, `20`, `28`, and full pills.
- Cards and controls should usually be `8px` to `20px`; reserve larger radii for hero
  glass panels and large launch surfaces.

### Glassmorphism

Glassmorphism is the locked elevated-surface direction. On web, mirror the mobile
`GlassCard` feel using:

- Translucent white surface: `rgb(255 255 255 / 0.10)` to `0.60`, depending on backdrop.
- Translucent white border: around `rgb(255 255 255 / 0.22)` to `0.80`.
- Backdrop blur: roughly `20px` to `24px`.
- Soft forest shadow, not harsh black shadow.
- Brand-color ambient fields behind glass, using Mantis, Emerald, and Astronaut Blue.

The existing `.glass-panel` in `src/app/globals.css` is the web equivalent of the mobile
glass token. Reuse it before inventing another glass style.

Use glass for:

- Hero/waitlist panels.
- Floating admin panels.
- Premium preview surfaces.
- Modal or bottom-sheet equivalents.

Prefer simpler solid cards for dense tables, repeated list rows, and operational UI where
too much blur hurts scanning.

## UI rules

- Keep the web app visually consistent with the mobile app, not generic SaaS templates.
- Use shadcn/ui components from `src/components/ui`; install missing ones with the CLI.
- Treat shadcn as the default answer for buttons, inputs, cards, badges, labels, dialogs,
  dropdowns, tabs, tables, forms, sheets, popovers, toasts, and similar interface pieces.
- Use `cn()` from `src/lib/utils.ts` for class composition.
- Use Lucide icons in buttons and tool controls when an icon exists.
- Avoid nested cards and decorative card-heavy layouts.
- Make the actual product/action visible first; do not replace usable screens with
  marketing-only sections.
- Admin UI should be quieter and denser than the public launch page, but still on-brand.
- Mobile responsiveness matters: no overlapping text, no controls that resize or jump
  when state changes.

## Code conventions

- TypeScript strict; avoid `any`.
- Use named exports for reusable components.
- Keep route files thin and move reusable UI into `src/components`.
- Keep validation in `src/lib/validations`.
- Do not call backend APIs directly from deeply nested components once backend wiring is
  added; create a small feature/client layer first.
- Model API responses around the backend's `{ success, data, meta }` and
  `{ success, error }` envelopes.
- For currency, convert/display at the edge; keep calculations in integer fils.
- Keep edits scoped. Do not refactor unrelated files while changing a page.

## Current product intent

Kattegat removes middlemen from Dubai's event and hospitality bookings:

- Sellers keep their money.
- Buyers book talent directly.
- The platform earns through subscriptions/managed services, not commission on each deal.
- First web milestone is waitlist capture and early access positioning.
- Admin foundation will become launch control: waitlist, verification, White Glove leads,
  moderation, and operational metrics.

## Verification

Before handing off meaningful code changes:

```bash
npm run lint
npm run build
```

If a web change depends on backend contracts, also run the relevant backend checks from
`../Kattegat_Backend`:

```bash
yarn type-check
yarn lint
```

For visual changes, run the app locally and inspect both:

- `/`
- `/kattegat-admin/login`

Check mobile and desktop widths. The glass panels should read as premium frosted surfaces,
not flat translucent boxes, and the palette should still feel like the mobile app.
