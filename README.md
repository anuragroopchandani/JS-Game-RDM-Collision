# RDM Collision

A tiny JavaScript lane-switcher game for web and mobile. Dodge UFOs by switching between two lanes. Built for a beginner-friendly workshop (fun first, code second).

## Quick Start
1. Clone or download this repo.
2. Open `index.html` in a modern browser — or run a static server with `npx serve .`.
3. Click **Start** and play.

## Controls
- **Space** or **Tap/Click canvas** → switch lane  
- **Start** → start / pause / resume  
- **Reset** → restart the run

## What’s Inside
- `core.js` — canvas/DPR setup, orientation modes, main loop (update/render)
- `entities.js` — player ship & UFO sprites + basic hit geometry
- `spawn.js` — obstacle spawn timing (portrait & landscape)
- `collision.js` — collision helpers
- `ui.js` — HUD bindings (Start/Reset, score)
- `style.css` — UI skin; Vanta background behind the stage
- `THIRD_PARTY_NOTICES.md` — libraries, versions, licenses, and asset credits

## License
This project is released under the MIT License. See **[LICENSE](./LICENSE)**.
