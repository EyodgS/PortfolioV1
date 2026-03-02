# PortfolioV1

ED-OPS — Network & Infrastructure Engineer portfolio by Elio Dages.

## Pages

| File | Description |
|------|-------------|
| `index.html` | Home — hero, boot sequence, profile summary |
| `terminal.html` | Interactive terminal |
| `lab.html` | Homelab network topology |
| `expertise.html` | Technical expertise domains & tools |
| `projects.html` | Infrastructure projects |
| `ops.html` | NOC dashboard (simulated telemetry) |

## Language support (EN / FR)

A lightweight i18n module is located at `assets/js/i18n.js`.  
All visible UI strings are stored in the `TRANSLATIONS` object near the top of that file under `en` and `fr` keys.

**To add or update a translation:**
1. Open `assets/js/i18n.js`
2. Find the relevant key in both `en` and `fr` sections and update the string
3. To add a new language, add a new top-level key (e.g. `de`) with all translations

**To add a new translatable element:**
1. Add `data-i18n="your.key"` to the HTML element
2. Add the key + value in both `en` and `fr` sections of `TRANSLATIONS`

User language preference is persisted in `localStorage` under the key `edops-lang`.

## GitHub Pages

All HTML files are in the root directory (flat structure). Asset paths use relative paths (`./assets/…`), so the site works correctly on both local development and GitHub Pages project sites (e.g. `https://username.github.io/PortfolioV1/`).
