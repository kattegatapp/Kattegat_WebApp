# `src/` map — where to put new code

## Quick guide

| I want to… | Go here |
|---|---|
| Add / change a **page URL** | `app/` (keep pages thin) |
| Build **admin UI** | `features/admin/` |
| Build **waitlist UI** | `features/waitlist/` |
| Build **legal pages UI** | `features/legal/` |
| Add a **shadcn** primitive | Look up at [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components), then `npx shadcn@latest add <component>` → `components/ui/` |
| Call the **backend / BFF** | `lib/api/` |
| Change **admin auth / secret URL** | `lib/admin/` + `proxy.ts` |
| Add **zod** schemas | `lib/validations/` |

## Folders

```txt
src/
├── app/                     # Next.js routes only — wire features here
│   ├── api/admin/           # Admin BFF (cookie → backend)
│   ├── api/waitlist/        # Waitlist BFF
│   └── kattegat-admin/      # Internal admin routes (public URL is secret; see lib/admin)
├── features/                # Product UI by domain
│   ├── admin/
│   │   ├── auth/            # Login form + login-page preview
│   │   ├── shell/           # Sidebar + header (shadcn Sidebar pattern)
│   │   │                    # Ref: https://ui.shadcn.com/docs/components/sidebar
│   │   ├── overview/        # Dashboard home
│   │   ├── pricing/         # Plan features editor
│   │   ├── settings/        # Brand / metadata / links / features / operations
│   │   ├── navigation.ts    # Sidebar + breadcrumb config
│   │   └── index.ts         # Public exports for route pages
│   ├── waitlist/
│   └── legal/
├── components/
│   ├── ui/                  # shadcn only — do not put product UI here
│   └── motion/              # Shared motion primitives
├── lib/
│   ├── admin/               # Portal path, cookie, session helpers
│   ├── api/
│   │   ├── admin/           # login, settings, pricing clients
│   │   ├── client.ts        # Typed { success, data } fetch
│   │   ├── settings.ts      # Public app settings
│   │   └── waitlist.ts
│   ├── validations/
│   ├── providers.tsx
│   └── utils.ts
├── hooks/
└── proxy.ts                 # Secret admin URL rewrite + auth gates
```

## Rules of thumb

1. **Routes stay thin** — `app/**/page.tsx` should mostly import from `features/*`.
2. **Features own UI** — forms, panels, and domain components live under `features/<domain>/`.
3. **API clients live in `lib/api`** — components should not `fetch` the backend directly.
4. **shadcn stays in `components/ui`** — style with Tailwind/brand tokens, don’t fork for product screens.
5. **Need a UI control?** Check https://ui.shadcn.com/docs/components first, then install with the CLI.
