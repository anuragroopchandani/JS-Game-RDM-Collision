# Third-Party Notices

This project bundles third-party libraries and assets. Each entry below includes its license and a canonical link. Where possible, a local copy of the license is stored under `vendor/<name>/<version>/`.

> **Project license:** see [`LICENSE`](./LICENSE).

---

## Libraries

| Library        | Version  | License                          | Project / License Link                          |
| -------------- | -------- | -------------------------------- | ------------------------------------------------|
| **Three.js**   | r134     | MIT                              | https://github.com/mrdoob/three.js              |
| **Vanta.js**   | 0.5.24   | MIT                              | https://github.com/tengbao/vanta                |
| **SAT.js**     | 0.9.0    | MIT                              | https://github.com/jriecken/sat-js              |
| **GSAP**       | 3.12.5   | GreenSock “No-Charge” License    | https://gsap.com/standard-license               |
| **Howler.js**  | 2.24     | MIT                              | https://github.com/goldfire/howler.js           |
| **Kontra.js**  | 9.0.0    | MIT                              | https://github.com/straker/kontra               |

The versions above reflect the scripts loaded in `index.html`. :contentReference[oaicite:0]{index=0}

### Local license copies (if vendored)

- `vendor/three/r134/LICENSE`  
- `vendor/vanta/0.5.24/LICENSE`  
- `vendor/sat/0.9.0/LICENSE` *(may be `LICENSE.txt` as supplied)*  
- `vendor/gsap/3.12.5/LICENSE-GreenSock.txt` *(points to the official license URL)*  
- `vendor/howler/2.24/LICENSE.md`  
- `vendor/kontra/9.0.0/LICENSE`  

> **GSAP note:** Keep the header comment in `gsap.min.js` intact. Attribution isn’t required, but the license terms must remain accessible. :contentReference[oaicite:1]{index=1}

---

## Audio Assets

These sound effects are used under the **Mixkit Sound Effects – Free License** (free for commercial & personal use; attribution not required). Filenames/paths in this project:

| File path (project)                                               | Mixkit Title                           | License                                |
| ----------------------------------------------------------------- | -------------------------------------- | -------------------------------------- |
| `assets/audio/mixkit-player-jumping-in-a-video-game-2043.*`       | Player jumping in a video game         | Mixkit Sound Effects – Free License    |
| `assets/audio/mixkit-arcade-retro-game-over-213.*`                | Arcade retro game over                 | Mixkit Sound Effects – Free License    |
| `assets/audio/mixkit-gaming-lock-2848.*`                          | Gaming lock                            | Mixkit Sound Effects – Free License    |

The above file names/paths are referenced in `CONFIG.AUDIO` and by `audio.js`. :contentReference[oaicite:2]{index=2} :contentReference[oaicite:3]{index=3}

> Tip: keep `assets/audio/sources.txt` with exact Mixkit item links and download dates for classroom transparency. :contentReference[oaicite:4]{index=4}

---

## Art Assets

Graphics are from **Kenney.nl – Space Shooter Redux** under **CC0 1.0 Universal (Public Domain)**. No attribution is required; credit is provided here for student reference.

| Asset Pack           | License  | Project / License Link                          |
| -------------------- | -------- | ----------------------------------------------- |
| Space Shooter Redux  | CC0 1.0  | https://kenney.nl/assets/space-shooter-redux    |

> In this project we use `assets/images/playerShip1_green.png` (player) and `assets/images/ufoRed.png` (obstacle). You may use, modify, and distribute these assets freely in commercial and non-commercial projects. :contentReference[oaicite:5]{index=5}

---

## How we vendor third-party files (for contributors)

- Files live under `vendor/<name>/<version>/…` and are referenced directly from `index.html`.  
- When upgrading a library, update both the file path and this notices file to keep versions consistent. :contentReference[oaicite:6]{index=6}

