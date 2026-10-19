# Archive imagery

Images are grouped by resource: `characters/`, `planets/`, `films/`, `starships/` and `vehicles/`. Decorative artwork lives separately in `galaxy/`.

`resources.json` maps related-resource SWAPI IDs to named local files and records the exact source page, source image URL and title. The related imagery was retrieved from the official [Star Wars Databank](https://www.starwars.com/databank/) and [film pages](https://www.starwars.com/films) on 19 October 2026. SWAPI supplies relationships and facts, not these images. Additional reference artwork comes from the specialist [StarWars.jp wiki](https://www.starwars.jp/wiki/); the Raddaugh Gnasp Fluttercraft uses a [Star Wars Combine community render](https://www.swcombine.com/rules/?Speeders&ID=72). These secondary sources have visible credits on their cards and exact file/page provenance in the catalogue. Character portrait sources remain in their own catalogue and README.

Film posters are downloaded at 400px wide, and other resource images at 640px wide. The application imports local assets through Vite, which fingerprints filenames; images are lazy-loaded with reserved dimensions and no runtime requests to the source host. Decorative images use empty alt text beside their visible record name. Missing or failed artwork uses the matching Material category icon without hiding the data.

Artwork covers **all 39 vehicles, all 36 starships and all six films** in the verified SWAPI collections, plus 42 reference images and 18 labelled artist’s impressions covering all 60 planet records.

Reference artwork is preferred; unrelated planets or ships are never substituted. To add an image, verify the resource's actual SWAPI ID and identity, place a named file in its category, and add its provenance to `resources.json`. SWAPI IDs are not array positions.

Star Wars imagery is © Lucasfilm and its respective rights holders. Attribution documents provenance; it does not grant a licence. This fan project claims no ownership or open licence to the artwork. Production use would require appropriate rights clearance or replacement assets.

## Artist’s impressions

The 18 planets without matching reference artwork use speculative illustrations generated with built-in image_gen, visibly labelled **AI-generated artist’s impression** on collection and profile cards. Prompts use SWAPI terrain and climate descriptions where available; unknown facts and the unnamed planet remain unknown in the interface. These are interpretations, not canonical reference artwork.

The [illustration manifest](planets/illustrations.json) is separate from reference sources; reference images take precedence. The [complete prompts](planets/illustration-prompts.json) record the inputs. Optimised 640px JPEGs live in `planets/`; generation never runs in the application and needs no API key.
