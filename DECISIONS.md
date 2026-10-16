# Engineering decisions

Scope: character browsing, name search and shareable full-page detail. During pairing, the candidate requested richer imagery, iOS-influenced controls, reusable primitives, animation and CI. Those refinements supersede the initial typography-only visual proposal. Additional resource browsers remain deferred.

## Stack and application boundary

**Problem:** deliver an understandable full-stack assessment with a simple startup.
**Choice:** React/TypeScript/Vite, Fastify/TypeScript and one root npm package. `src/` is frontend, `server/` is backend, `shared/` owns API contracts.
**Alternative/cost:** a frontend-only app could satisfy browsing and avoid the extra process/hop. The backend earns its place through validation, a controlled contract, caching and failure translation. Workspaces and a full-stack framework would add configuration or conventions without solving a current problem.
**Production:** deployment needs would determine whether to preserve this split.

## Backend boundaries

**Problem:** isolate HTTP, application decisions and upstream communication.
**Choice:** routes validate input and return responses; service functions transform/select characters; a fixed-origin client handles fetch, source validation, cache and timeouts. Dependencies are passed as functions for tests.
**Cost:** more modules than a single handler. No generic repositories, base classes or DI container.
**Production:** add layers only when distinct domains or persistence requirements appear.

## Runtime contracts

**Problem:** TypeScript cannot validate external JSON.
**Choice:** Zod validates upstream fields and derives shared response types; the frontend validates our API responses. Fastify's built-in JSON Schema validates path parameters.
**Cost:** two validation syntaxes serving different boundaries. Some repeated transformation fields are intentional: source and product contracts differ.
**Production:** a public API could justify generated OpenAPI clients and versioning.

## Collection, search and persistence

**Problem:** the verified SWAPI collection is an array of 82 records; tested search/page parameters returned identical data.
**Choice:** fetch/cache the collection, filter names in the browser, select details in the service. Extract IDs from validated URLs; preserve unknown source values. Successful source records are cached for five minutes with concurrent fetch sharing. No database because there are no writes or user-owned records.
**Cost:** full-collection fetching, per-process cache and upstream dependence after expiry. No stale-on-error behaviour or automatic retries.
**Production:** requirements for saved data, search scale or availability could justify persistence/shared caching and server-side pagination.

## HTTP errors and security

**Problem:** distinguish invalid input, missing data and upstream failures without leaking internals.
**Choice:** safe error envelopes, 400/404/502/504/500 statuses, five-second upstream timeout and server-side diagnostics. Fixed upstream URLs prevent arbitrary proxying; React escapes source strings. Same-origin requests avoid development CORS configuration.
**Cost:** a timeout requires explicit user retry. Logs need operational handling in production.
**Production:** measured rate limits, appropriate security headers, monitoring and deployment-specific networking.

## Frontend responsibilities

**Problem:** keep fetching, request lifecycle and rendering understandable.
**Choice:** `services/archiveApi.ts` owns HTTP parsing/validation; `useResource` owns cancellation/retry and request state; feature components compose the UI. Query-parameter navigation supports links and browser history. React local state retains search during in-app navigation.
**Cost:** small custom lifecycle code and manual navigation/focus management. Search is not reload-persistent, and returning resets revealed-card count. A full-page detail avoids modal focus-trapping complexity.
**Production:** a router/query library becomes worthwhile as routes, relationships and mutations grow.

## Component system and folders

**Problem:** reflect the candidate's component-library experience while keeping the assessment navigable.
**Choice:** requested `src/components/ui/<Primitive>/` and `src/components/features/characters/` hierarchy, plus dedicated `hooks`, `services`, `styles` and `assets`. All character photos live together under `src/assets/images/characters/`; a catalogue records ID, file and provenance. Tests are co-located, browser tests live in `e2e/`.
**Composition:** typed Button/ButtonLink preserve native action/navigation behaviour; Card supplies a surface rather than deciding semantics; Container owns width; Typography separates visual style from heading level; HStack/VStack use spacing tokens; Badge and Skeleton serve real repeated patterns.
**Cost:** indirection and extra files. Primitive options are deliberately small, and features keep their own content and image composition. No universal polymorphic API or empty type folders.
**Production:** expand primitives when actual reuse/accessibility requirements appear; a larger cross-product library could justify Storybook and versioning.

## Visual tokens, fonts and icons

**Problem:** the candidate found the original dark grid too clunky and requested a more exciting, iOS-like experience.
**Choice:** central palette/spacing/type/radius/shadow/motion tokens, local Outfit for readable UI, Barlow Condensed for the poster-inspired display title, and Google Material SVGs through React Icons. Visual review drove the final Google font/icon choices and removal of decorative icon clutter. Icons now support functional controls rather than filling every surface.
**Cost:** asset bytes and token maintenance. Breakpoints use documented literal CSS media values because custom properties cannot drive media conditions. One-off composition dimensions/gradients remain feature-local.
**Production:** subset fonts and optimise image delivery against measured performance targets.

## Imagery and motion

**Problem:** SWAPI has no portrait fields; the first screen needed more Star Wars atmosphere.
**Choice:** named local portraits mapped by ID, a documented decorative AI-generated backdrop, lazy card images and graceful fallback initials. CSS provides an eight-second starfield/title/lightsaber opening on every fresh page load, staggered card entrances, hover/focus previews, portrait zoom and skeleton shimmer; reduced-motion preferences disable these effects.
**Cost:** repository asset size, separate image provenance and third-party artwork rights considerations. This is visual enrichment, not a second data API. No motion framework or video download is needed. The opening is skippable by button or Escape, traps focus while the page is inert, and restores focus to main. In-app profile navigation does not replay it; refresh and new page loads do. Decorative blades across portrait faces were removed following candidate feedback.
**Production:** use a rights-cleared asset pipeline and responsive image formats, measure loading performance, and evaluate the cost of an opening on repeat visits against measured user feedback; this every-entry behaviour is an explicit candidate preference.

## Tests and delivery

**Problem:** verify important boundaries and make the result reproducible for reviewers.
**Choice:** Vitest for backend/contracts/components/request races, Playwright for browser interactions and four viewport widths, and axe checks on browse/detail. Mock API data makes tests repeatable; live smoke checks stay separate. A GitHub Actions workflow runs install, tests, build and Chromium checks and preserves failures.
**Cost:** browser installation and test maintenance. Automated accessibility checks do not replace assistive-technology review. The hosted workflow cannot be claimed passed until run on GitHub.
**Test-first evidence:** the refreshed-opening test failed because the sequence did not replay; the preview test failed because no preview existed. Both requirements were then implemented. The animation check was run and failed with `animationName: none` before the entrance animation was implemented. Earlier work followed mixed implementation/testing order; do not describe the entire project as strict TDD.
**Production:** broader browsers, observability, visual baselines and load testing should follow release risks, not test-count targets.
