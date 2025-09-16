// spawn.js — Portrait: strict equal Y-gaps + random lane. Landscape: original pacing.
(function () {
  const { DIFFICULTY, SPEED } = CONFIG;

  // ---------- original helpers (kept for landscape) ----------
  function baseSpeedForMode(mode) {
    if (mode.axis === "horizontal") {
      return SPEED.obstacleBase * 0.85 * (CONFIG.LOGICAL.W / 300);
    } else {
      return SPEED.obstacleBase * (CONFIG.LOGICAL.H / 500);
    }
  }
  function speedForScore(score, mode) {
    return baseSpeedForMode(mode) + DIFFICULTY.speedPerScore * score;
  }
  function intervalForScore(score) {
    const raw =
      DIFFICULTY.spawnIntervalStart - DIFFICULTY.spawnIntervalPerScore * score;
    return Math.max(DIFFICULTY.spawnIntervalMin, raw);
  }

  // ---------- PORTRAIT "metronome" settings ----------
  const OB_SIZE = 56; // matches Entities.createObstacle().size
  const GAP_FRAC_VERTICAL = 0.34; // fraction of screen height for visual gap (tweak 0.24–0.34)
  const GAP_MIN_PX = 144; // hard floor so phones aren’t too tight
  function desiredGapPxPortrait(player) {
    const h = CONFIG.LOGICAL.H;
    const playerW = (player?.radius || 20) * 2;
    const safety = playerW * 0.9 + OB_SIZE * 0.75 + 12;
    return Math.max(GAP_MIN_PX, h * GAP_FRAC_VERTICAL, safety);
  }

  function createSpawner(mode, onScore) {
    const active = [];
    const pool = [];

    // shared
    let timer = 0;

    // portrait-only beat scheduler
    let nextDue = 0; // seconds to next spawn
    let gapPx = 160; // recalculated on reset/spawn
    let beatSpeed = 1; // speed used to compute nextDue

    function spawnOne(score, mode, laneIndex) {
      const ob = pool.pop() || Entities.createObstacle();
      ob.activate(mode, speedForScore(score, mode));
      ob.laneIndex = laneIndex;
      if (mode.axis === "vertical") ob.x = mode.lanes[laneIndex];
      else ob.y = mode.lanes[laneIndex];
      active.push(ob);
      return ob;
    }

    function tryScore(obstacle, player, mode) {
      if (obstacle.scoredSinceSpawn) return;
      if (mode.axis === "vertical") {
        if (obstacle.lastY < player.y && obstacle.y >= player.y) {
          obstacle.scoredSinceSpawn = true;
          onScore?.();
        }
      } else {
        if (obstacle.lastX > player.x && obstacle.x <= player.x) {
          obstacle.scoredSinceSpawn = true;
          onScore?.();
        }
      }
    }

    return {
      reset(newMode) {
        while (active.length) pool.push(active.pop());
        mode = newMode || mode;
        timer = 0;
        nextDue = 0;
      },

      update(dt, newMode, player, score) {
        if (newMode && newMode !== mode) {
          mode = newMode;
          nextDue = 0;
        }

        timer += dt;

        if (mode.axis === "vertical") {
          // ---- PORTRAIT: strict equal Y-gaps, random lane, no blocking ----
          if (nextDue === 0) {
            gapPx = desiredGapPxPortrait(player);
            beatSpeed = speedForScore(score, mode);
            nextDue = gapPx / Math.max(1, beatSpeed);
          }

          if (timer >= nextDue) {
            timer -= nextDue; // keep phase accurate
            const lane = Math.random() < 0.5 ? 0 : 1; // random lane every time (repeats allowed)
            const ob = spawnOne(score, mode, lane);

            // recompute beat from this obstacle's actual speed to keep pixel gap constant
            beatSpeed = ob.speed;
            nextDue = gapPx / Math.max(1, beatSpeed);

            const capacity = Math.ceil(CONFIG.LOGICAL.H / gapPx) + 1;
            // remove oldest if we ever exceed capacity (rare on steady framerates)
            if (active.length > capacity) {
              const oldest = active.shift();
              oldest.deactivate?.();
              pool.push(oldest);
            }
          }
        } else {
          const needInterval = intervalForScore(score);
          if (timer >= needInterval && active.length < DIFFICULTY.maxOnScreen) {
            timer = 0;
            const lane = Math.random() < 0.5 ? 0 : 1;
            spawnOne(score, mode, lane);
          }
        }

        // move/score/cleanup
        for (let i = active.length - 1; i >= 0; i--) {
          const ob = active[i];
          const wentOff = ob.update(dt, mode);
          tryScore(ob, player, mode);
          if (wentOff) {
            active.splice(i, 1);
            pool.push(ob);
          }
        }
      },

      render(ctx) {
        for (let i = 0; i < active.length; i++) active[i].render(ctx);
      },
      getActive() {
        return active;
      },

      // optional helpers
      spawnNow(score = 0) {
        spawnOne(score, mode, Math.random() < 0.5 ? 0 : 1);
      },
      clear() {
        while (active.length) pool.push(active.pop());
      },
    };
  }

  window.SPAWN = { createSpawner };
})();
