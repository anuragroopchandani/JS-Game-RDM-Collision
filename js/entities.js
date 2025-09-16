(function () {
  const { LOGICAL, SPEED } = CONFIG;

  // Sprite loader (images are CC0 from Kenney)
  const SPRITES = {
    player: new Image(),
    ufo: new Image(),
    ready: false,
  };
  SPRITES.player.src = "assets/images/playerShip1_green.png";
  SPRITES.ufo.src = "assets/images/ufoRed.png";
  let loaded = 0;
  function onLoad() {
    if (++loaded >= 2) SPRITES.ready = true;
  }
  SPRITES.player.addEventListener("load", onLoad);
  SPRITES.ufo.addEventListener("load", onLoad);

  // Player (spaceship)
  function createPlayer(mode) {
    const p = {
      renderSize: 56, // draw width (logical px)
      laneIndex: 0,
      x: mode.playerStart.x,
      y: mode.playerStart.y,
      targetX: mode.playerStart.x,
      targetY: mode.playerStart.y,

      // circle radius used by collision.js (circle vs box)
      get radius() {
        return this.renderSize * 0.36;
      },

      switchLane(mode) {
        this.laneIndex ^= 1;
        if (mode.axis === "vertical") {
          this.targetX = mode.lanes[this.laneIndex];
          gsap.to(this, {
            duration: SPEED.playerTween,
            x: this.targetX,
            overwrite: true,
          });
        } else {
          this.targetY = mode.lanes[this.laneIndex];
          gsap.to(this, {
            duration: SPEED.playerTween,
            y: this.targetY,
            overwrite: true,
          });
        }
        AUDIO.playSwitch?.();
      },

      update(dt) {
        /* no-op */
      },

      render(ctx) {
        const img = SPRITES.player;
        const w = this.renderSize;
        const ratio =
          img.naturalWidth && img.naturalHeight
            ? img.naturalHeight / img.naturalWidth
            : 1;
        const h = w * ratio;

        // Rotate in portrait (from config)
        const deg = CONFIG.RENDER?.playerPortraitRotationDeg ?? -90;
        const angle =
          CONFIG.MODE?.name === "portrait" ? (deg * Math.PI) / 180 : 0;

        ctx.save();
        ctx.translate(this.x, this.y);
        if (angle) ctx.rotate(angle);

        if (img && img.complete) {
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        } else {
          // tiny placeholder circle while image loads
          ctx.fillStyle = CONFIG.COLORS?.player || "#66ff66";
          ctx.beginPath();
          ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      },
    };
    return p;
  }

  // Obstacle (red UFO)
  function createObstacle() {
    return {
      active: false,
      laneIndex: 0,
      size: 56, // draw size + AABB side (used by collision)
      x: 0,
      y: 0,
      lastX: 0,
      lastY: 0,
      speed: SPEED.obstacleBase,
      scoredSinceSpawn: false,

      activate(mode, speed) {
        this.active = true;
        this.scoredSinceSpawn = false;
        this.laneIndex = Math.random() < 0.5 ? 0 : 1;

        if (mode.axis === "vertical") {
          this.x = mode.lanes[this.laneIndex];
          this.y = -this.size;
        } else {
          this.y = mode.lanes[this.laneIndex];
          this.x = CONFIG.LOGICAL.W + this.size;
        }

        this.lastX = this.x;
        this.lastY = this.y;
        this.speed = speed;
      },

      deactivate() {
        this.active = false;
      },

      update(dt, mode) {
        if (!this.active) return false;
        this.lastX = this.x;
        this.lastY = this.y;

        const v = this.speed * dt;
        if (mode.axis === "vertical") {
          this.y += v;
          if (this.y - this.size / 2 > LOGICAL.H) {
            this.deactivate();
            return true;
          }
        } else {
          this.x -= v;
          if (this.x + this.size / 2 < 0) {
            this.deactivate();
            return true;
          }
        }
        return false;
      },

      render(ctx) {
        if (!this.active) return;
        const img = SPRITES.ufo;
        const w = this.size,
          h = this.size;
        const dx = this.x - w / 2,
          dy = this.y - h / 2;

        if (img && img.complete) ctx.drawImage(img, dx, dy, w, h);
        else {
          ctx.fillStyle = "#ff3c5a";
          ctx.fillRect(dx, dy, w, h);
        } // placeholder square
      },
    };
  }

  // Expose only what’s used by the game
  window.Entities = { createPlayer, createObstacle };
})();
