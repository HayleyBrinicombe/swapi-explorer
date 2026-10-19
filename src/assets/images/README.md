# Archive imagery

Images are grouped by resource: `characters/`, `planets/`, `films/`, `starships/` and `vehicles/`. Decorative artwork lives separately in `galaxy/`.

`resources.json` maps related-resource SWAPI IDs to named local files and records the exact source page, source image URL and title. The related imagery was retrieved from the official [Star Wars Databank](https://www.starwars.com/databank/) and [film pages](https://www.starwars.com/films) on 19 October 2026. SWAPI supplies relationships and facts, not these images. Character portrait sources remain in their own catalogue and README.

Film posters are downloaded at 400px wide, and other resource images at 640px wide. The application imports local assets through Vite, which fingerprints filenames; images are lazy-loaded with reserved dimensions and no runtime requests to the source host. Decorative images use empty alt text beside their visible record name. Missing or failed artwork uses the matching Material category icon without hiding the data.

Coverage is deliberately partial: no substitute planet or ship is used when matching artwork is unavailable. To add an image, verify the resource's actual SWAPI ID and identity, place a named file in its category, and add its provenance to `resources.json`. SWAPI IDs are not array positions.

Star Wars imagery is © Lucasfilm and its respective rights holders. Attribution documents provenance; it does not grant a licence. This fan project claims no ownership or open licence to the artwork. Production use would require appropriate rights clearance or replacement assets.
