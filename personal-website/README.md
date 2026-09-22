# Thomas Newman — portfolio

A Next.js App Router portfolio for computer engineering work across hardware and software.

## Run locally

```sh
npm ci
npm run dev
```

Open http://localhost:3000. If a system npm launcher is broken, the installed Next.js CLI can also be started directly:

```sh
node node_modules/next/dist/bin/next dev
```

```sh
npm run lint
npx tsc --noEmit
npm run build
```

## Pages and project content

- `/` is a viewport-sized landing page; its navigation and footer remain visible without scrolling.
- `/work` is the only project index, with discipline filters and technology search.
- `/work/[slug]` contains each technical overview, conceptual system diagram, verified links, and previous/next navigation.
- `/blog`, `/blog/[slug]`, `/about`, and `/contact` retain their existing roles.

Edit `lib/projects.ts` to add or update a project. The Work cards, filters, detail pages, static routes, and next/previous links all derive from that array. Each project needs a unique slug and number. Optional `sourceUrl` and `liveUrl` fields render links only when provided. Projects without a public link offer a contact link with a project-specific email subject.

The first four project descriptions come from the original portfolio. Arduino Radar and SpriteForge use the public repository descriptions and README at https://github.com/thomasnwmn/radar and https://github.com/thomasnwmn/spriteforge. WUWA source and demo URLs come from https://github.com/thomasnwmn/wuwabuilds. The diagrams are original conceptual illustrations, not product screenshots or measured performance results.

Writing uses the existing `NOTION_TOKEN` and `NOTION_DATABASE_ID` environment variables and the Title, Slug, Date, Summary, and Published database properties. With no database configured, visitors see a writing empty state. Credentials are never displayed in the interface.

## Motion

`app/template.tsx` keys React ViewTransition by the full pathname, including nested project and writing routes. This installed Next.js version supports ViewTransition without experimental configuration. Native Next links preserve prefetching, history, normal scrolling, modified clicks, and external links.

Main pages use short fades with a small vertical offset. Project links carry transition types for directional detail navigation, and matching project diagrams share a transition identity. The header remains outside named transition participants so rapid clicks keep working. Loading, error, and missing-page states remain navigable.

Work filters use Next.js native History integration, preserving the current search/category and scroll position when returning with browser Back. Browsers without View Transition support still navigate normally. Reduced-motion CSS removes route animations; the landing particle canvas is not mounted when reduced motion is enabled. Pointer listeners clean up when leaving the landing page.

The visual direction retains the dark palette, fine rules, large typography, and restrained technical labels inspired by https://jamiemckaye.com/about/.

## Verification

Verified during implementation:

- Production build, TypeScript, ESLint, and whitespace checks pass.
- All 20 directed transitions between Home, Work, Writing, About, and Contact.
- Hardware and software filtering, technology search, empty results, and clearing filters.
- Browser Back restores the Work query and scroll; all six detail routes render.
- Project contact links populate the email subject without sending anything.
- Landing footer fits the viewport at 1280×720, 390×844, and 375×667.
- Mobile project detail layout has no horizontal overflow.
- Unknown project/writing URLs show the missing-page UI with noindex; `/projects` is removed.

No published Notion articles were available in this checkout, so a populated article page could not be verified against live content. Reduced-motion behavior is implemented in CSS and the canvas subscription; OS preference switching was not automated.

The WUWA demo URL is supplied by its public repository. Browser permission to inspect the external demo was declined, so its current live availability was not verified.
