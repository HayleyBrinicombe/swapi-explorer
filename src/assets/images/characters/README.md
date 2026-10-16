# Character portraits

`catalogue.json` explicitly matches SWAPI character IDs to named local portrait files and records the source URL for each file. Only records in our verified SWAPI collection are included. `portraits.ts` resolves them into Vite-managed asset URLs; components do not construct external URLs.

Source: [Star Wars Gallery](https://github.com/vieraboschkova/swapi-gallery/tree/main/docs/static/assets/img/people). Retrieved 16 October 2026. These are existing Star Wars promotional/character images, not generated assets, and are not part of SWAPI's JSON response. Star Wars imagery belongs to its respective rights holders; this project does not claim ownership or an open licence to the artwork. Publication or commercial use requires appropriate rights review.

Portraits are decorative alongside the visible character name, lazy-loaded in cards, and replaced by initials if unavailable. Hero images load eagerly. Vite gives assets content-hashed filenames in production. Original image resolution is approximately 400 × 550; no full-resolution background downloads or external image requests are needed at runtime.
