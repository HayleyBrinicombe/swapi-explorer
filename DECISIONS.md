# Engineering decisions

My priority was a complete, polished character-exploration journey with clear application boundaries and a straightforward developer setup. I chose a small full-stack architecture that makes validation, data flow and failure handling easy to explain and test.

## My priorities and the decisions they informed

| My priority | Decision and reasoning | Cost I accepted |
| --- | --- | --- |
| Make the assessment easy to try and review | One repository, one local startup command, and a same-origin hosting configuration for the frontend and API | A small platform-specific deployment adapter |
| Demonstrate backend engineering clearly | Separate HTTP handling, character transformation and upstream access, with shared validated contracts | More boundaries than a frontend-only explorer needs |
| Build on my component-library experience | Typed, composable UI primitives, central design tokens and separate character features | Some indirection when navigating components |
| Give the product a memorable identity | Character imagery, a cinematic opening and purposeful interaction states | More asset weight and motion to manage accessibly |
| Keep the scope explainable and maintainable | Local state and search, a small cache, and no database | A design intended for this small read-only dataset |
| Make changes safe to review and deliver | Boundary-focused tests, browser journeys and GitHub Actions | Test maintenance and Chromium-only browser coverage |

These choices reflect the product direction and engineering priorities I set for the assessment. AI supported implementation and investigation, as acknowledged in the README. The sections below explain the alternatives and limitations I would discuss in a technical review; they do not imply that every choice is appropriate for a larger production system.

## 1. React and Fastify with one root package

I selected React, TypeScript and Vite for the frontend, and Node.js, TypeScript and Fastify for the API. This supports a responsive interface while making the frontend/backend responsibilities explicit. One npm package provides a simple `npm install` and `npm run dev` workflow; separate workspaces would add configuration without a useful boundary at this scale.

Calling SWAPI directly from React would also satisfy basic browsing. I chose a backend to own the application contract, validate external data, cache responses and translate upstream failures into predictable errors. The trade-off is another process and network hop. Deployment requirements would determine whether this split remains appropriate in production.

## 2. Separate HTTP, application logic and upstream access

The backend follows **routes → character service → SWAPI client**:

- **Routes** validate request parameters and handle HTTP responses.
- **The character service** transforms source records into the application's character model and selects individual records.
- **The SWAPI client** handles external requests, source validation, timeouts and caching.

I chose functions with explicit dependencies rather than classes, a dependency-injection framework or a generic repository layer. This keeps tests independent of live SWAPI and makes each module's responsibility clear. It creates more files than a single request handler, but gives changes a predictable home. Persistence or distinct business domains could justify additional boundaries later.

## 3. Validate data at runtime and own the API contract

TypeScript provides compile-time checking; it cannot establish whether received JSON is valid. Zod validates SWAPI responses and defines shared, inferred API types. The frontend also validates successful responses before placing them in React state. Fastify's built-in JSON Schema support validates path parameters at the HTTP boundary.

The service maps SWAPI's snake-case fields and relationship URLs into a smaller camel-case response with explicit IDs and connection counts. That keeps upstream details out of components and preserves meaningful source values such as `unknown`.

The cost is maintaining source and application schemas, plus two validation syntaxes with different responsibilities. For a larger public API, generated OpenAPI clients and a versioning policy would become useful.

## 4. Fetch a small collection, search locally and avoid a database

I based the data strategy on the actual API response. SWAPI returned a plain array of 82 characters; the tested search and pagination parameters returned the same collection. Filtering that small dataset in the browser gives immediate search results without extra requests.

Character IDs come from validated resource URLs rather than array positions. Both API endpoints use the same collection, so detail requests do not need a separate upstream-fetching strategy.

I chose not to introduce a database: there are no writes, accounts or user-owned records to persist. Fetching the entire collection would become unsuitable at greater scale. Saved records, stronger availability requirements or larger searchable datasets could justify persistence and server-side search/pagination.

## 5. Bound upstream work and return predictable failures

The SWAPI client applies a **five-second timeout**, caches successful validated records for **five minutes**, and shares in-flight requests. This limits repeated upstream calls while keeping the implementation small. Failed requests are not cached, so a later retry can recover.

The API uses a consistent error envelope and distinguishes invalid requests (400), missing records (404), upstream failures or malformed data (502), timeouts (504) and unexpected failures (500). Diagnostic details stay in server logs. The interface provides an explicit retry action.

The cache is process-local and does not serve stale data after expiry when refreshing fails. Those are deliberate limitations: shared caching, bounded automatic retries or a stale-on-error policy would require clearer availability and freshness requirements. Fixed upstream URLs also prevent the API becoming an arbitrary URL proxy. Production hosting would need appropriate rate limits, security headers and monitoring.

## 6. Keep frontend state and fetching responsibilities small

The frontend HTTP service handles requests, response parsing and validation. `useResource` handles loading, cancellation, errors and retry. Character components handle presentation and interactions. Cancelled or superseded requests cannot replace the active resource with an older result.

I chose local React state instead of a global store. A query parameter provides shareable detail URLs and browser-history support without adding a routing framework. Search is retained during in-app navigation; it is not persisted across reloads, and returning to the collection resets the revealed-card count.

A dedicated detail view makes mobile layout and navigation straightforward. The cost is manual URL and focus management. More routes, related-resource fetching or mutations would make a router and server-state library more valuable.

## 7. Use a purposeful component system

I wanted the frontend to reflect my experience translating a design system into reusable React Native components at ThinkMoney. I applied those principles through a small set of typed primitives and feature-specific compositions.

`Button` and `ButtonLink` preserve native action/navigation semantics. `Card` provides a visual surface; `Container` controls content width; `Typography` separates heading level from appearance. Stacks, badges and skeletons address repeated layout and presentation needs. Character-specific behaviour stays under `src/components/features/characters/`.

Tokens centralise colour, spacing, typography, radii, shadows and motion. Hooks, HTTP services, styles and assets have separate locations. Character images share one folder and an explicit ID/source catalogue.

This adds some indirection, but gives reviewers a consistent structure and makes visual changes easier to apply. I avoided a universal component framework, atom/molecule directory tiers and speculative abstractions. A reusable library shared across products could justify separate packaging, Storybook and broader component contracts.

## 8. Make visual polish support a usable product

I chose a character-led Star Wars identity, locally hosted Google Fonts and one Google Material icon family. Local portrait assets avoid runtime dependence on an image host; cards lazy-load images and fall back to initials. Image provenance and the decorative AI-generated artwork are documented separately from API data.

CSS provides the cinematic opening, card entrances and hover/focus previews without a motion framework or runtime video download. The opening can be skipped by button or Escape, manages focus while the rest of the page is inert, and respects reduced-motion preferences. It plays on fresh page loads; in-app character navigation does not replay it.

The trade-offs are asset size and an opening that repeat visitors may prefer to skip. Production work would include image/font optimisation, a rights-cleared asset pipeline and usability/performance measurement. Essential information remains available through the character profile rather than depending on hover or animation.

## 9. Verify boundaries and automate delivery

I chose Vitest for API, transformation, component and request-lifecycle checks, and Playwright for the actual browser journey. Deterministic fixtures cover failures as well as successful responses. Browser checks include keyboard navigation, four viewport widths, opening behaviour, image fallbacks and hover/focus interactions. Automated accessibility scans supplement manual review.

The GitHub Actions workflow runs installation, tests, type-checking/build and Chromium checks on pushes and pull requests. Browser failures retain traces and screenshots. A fresh-checkout installation/build and live API smoke check verify the reviewer setup independently of mocked tests.

The test strategy targets meaningful regressions rather than a coverage percentage. Some interaction changes were developed test-first; the project uses a mix of implementation and testing sequences. Other browser engines, assistive-technology testing, visual baselines and load testing remain areas for future work.

## 10. Host the complete application behind one public URL

A source-code repository and a recording let reviewers inspect the work, but a hosted application lets them try it immediately. I chose a Vercel deployment configuration that keeps the existing React and Fastify architecture: static frontend assets are served from the build output, while a small HTTP entry point forwards API requests into the same Fastify app.

This avoids a separate backend hostname, CORS configuration, a framework migration or a second implementation of the character API. The local development and standalone production commands continue to work. Tests exercise real HTTP requests through the hosted entry point, including validation, missing records and cache sharing.

The trade-off is a platform-specific entry point and function lifecycle: each warm instance has its own cache, and a cold start resets it. There are no background jobs or persistent connections in this application, so that limitation is appropriate. A long-running Node host would be an alternative if future requirements needed persistent processes.

The production URL is linked from the README and repository homepage. Anonymous browser checks verified browsing, search, detail navigation, refresh, mobile width and image loading against the deployed application. Live API checks verified successful, invalid-ID and missing-record responses. The initial deployment uses the Vercel CLI; connecting GitHub for automatic deployments remains a separate setup step. Passing GitHub Actions checks alone does not publish a new deployment.
