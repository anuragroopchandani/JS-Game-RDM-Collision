(function () {
  const { init, GameLoop } = kontra;

  // ===== Init Kontra Canvas
  const { canvas, context } = init("gameCanvas");

  // ===== DPR sizing for crisp rendering
  function applyDPR() {
    const dpr =
      CONFIG.RECORD?.dprCanvas ?? true ? window.devicePixelRatio || 1 : 1;
    const { W, H } = CONFIG.LOGICAL;
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  // ===== Orientation + mode (media query → recompute lanes/starts)
  function computeMode() {
    const portrait = matchMedia("(orientation: portrait)").matches;
    const W = CONFIG.LOGICAL.W,
      H = CONFIG.LOGICAL.H;

    CONFIG.MODE = portrait
      ? {
          name: "portrait",
          axis: "vertical",
          lanes: [W * 0.25, W * 0.75], // centers of left/right halves
          playerStart: { x: W * 0.25, y: H * 0.88 },
          obstacleStart: { x: W * 0.25, y: -30 },
        }
      : {
          name: "landscape",
          axis: "horizontal",
          lanes: [H * 0.25, H * 0.75], // centers of top/bottom halves (was 0.40/0.60)
          playerStart: { x: W * 0.12, y: H * 0.25 }, // start in the upper lane center
          obstacleStart: { x: W + 30, y: H * 0.25 },
        };

    UI.setModeLabel(CONFIG.MODE);
    return CONFIG.MODE;
  }

  // ===== Stage measurement: LOGICAL matches #gameStage inner box
  function measureStageAndResize({ reflowEntitiesIfIdle = false } = {}) {
    const stage = document.getElementById("gameStage");
    const s = getComputedStyle(stage);
    const innerW = Math.max(
      120,
      stage.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)
    );
    const innerH = Math.max(
      120,
      stage.clientHeight -
        parseFloat(s.paddingTop) -
        parseFloat(s.paddingBottom)
    );

    CONFIG.LOGICAL.W = Math.round(innerW);
    CONFIG.LOGICAL.H = Math.round(innerH);

    computeMode();
    applyDPR();

    // Reflow only when idle/paused (avoid popping during play)
    if (reflowEntitiesIfIdle && window.GAME && GAME.state !== "running") {
      player = Entities.createPlayer(CONFIG.MODE);
      spawner.reset(CONFIG.MODE);
      UI.setStateLabel(GAME.state);
      UI.setScoreLabel(GAME.score, GAME.best);
    }
  }

  // ===== Optional Vanta background
  // ===== Vanta background (switchable)
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let vanta = null;
  let currentBG = "fog"; // default

  const VANTA_MAP = {
    fog: () => window.VANTA?.FOG,
    birds: () => window.VANTA?.BIRDS,
    cells: () => window.VANTA?.CELLS,
    waves: () => window.VANTA?.WAVES,
  };

  const BASE_OPTS = {
    el: "#bg",
    highlightColor: 0xff33cc,
    midtoneColor: 0x000000,
    lowlightColor: 0x000000,
    baseColor: 0x000000,
  };

  function createBG(type = currentBG) {
    if (!CONFIG.FEATURES?.BG || reduceMotion.matches || vanta) return;
    const ctor = VANTA_MAP[type]?.();
    if (!ctor) return;

    const opts = { ...BASE_OPTS };
    if (type === "fog")
      Object.assign(opts, { blurFactor: 0.65, speed: 3, zoom: 1.25 });
    if (type === "birds")
      Object.assign(opts, {
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        backgroundColor: 0x8142a,
        color2: 0x41ff,
        colorMode: "variance",
        wingSpan: 19.0,
        speedLimit: 2.0,
        separation: 15.0,
        alignment: 40.0,
        cohesion: 27.0,
        quantity: 3.0,
      });
    if (type === "cells") Object.assign(opts, {
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      color1: 0x1a6464,
      color2: 0x6f7f,
      size: 0.9,
      speed: 1.4,
    });
    if (type === "waves")
      Object.assign(opts, {
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x660844,
        shininess: 38.0,
        waveHeight: 18.0,
        waveSpeed: 1.35,
        zoom: 0.76,
      });

    vanta = ctor(opts);
  }

  function destroyBG() {
    try {
      vanta?.destroy?.();
    } catch {}
    vanta = null;
  }

  
  window.setBG = function (type) {
    if (type === currentBG) return;
    currentBG = type;
    destroyBG();
    createBG(type);

    // toggle active button
    const picker = document.getElementById("bgPicker");
    if (picker) {
      const btns = picker.querySelectorAll("button[data-bg]");
      btns.forEach((b) => {
        const active = b.dataset.bg === type;
        b.classList.toggle("is-active", active);
        b.classList.toggle("btn--neon", active);
      });
    }
  };


  // init once
  createBG("fog");

  // handle reduced-motion toggles at OS level
  reduceMotion.addEventListener?.("change", () => {
    destroyBG();
    if (!reduceMotion.matches) createBG(currentBG);
  });
  addEventListener("beforeunload", destroyBG);

  // wire buttons (no change to your existing UI code)
  addEventListener("DOMContentLoaded", () => {
    const picker = document.getElementById("bgPicker");
    if (picker) {
      picker.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-bg]");
        if (!btn) return;
        window.setBG(btn.dataset.bg);
      });
    }
  });

  // ===== Dashed glowing divider (lanes themselves remain transparent)
  function drawDivider(ctx) {
    const { W, H } = CONFIG.LOGICAL;
    const vertical = CONFIG.MODE?.axis === "vertical";
    const dash = CONFIG.RENDER?.dividerDash || [12, 10];
    const lw = CONFIG.RENDER?.dividerWidth || 4;
    const glow = CONFIG.RENDER?.dividerGlow || 14;
    const color = CONFIG.COLORS?.divider || "rgba(220,235,255,0.5)";

    ctx.save();
    ctx.lineWidth = lw;
    ctx.strokeStyle = color;
    ctx.setLineDash(dash);
    ctx.shadowColor = color;
    ctx.shadowBlur = glow;

    if (vertical) {
      const x = Math.round(W * 0.5) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    } else {
      const y = Math.round(H * 0.5) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ===== Initial measure BEFORE creating entities
  measureStageAndResize({ reflowEntitiesIfIdle: false });

  // ===== Entities / spawner
  let player = Entities.createPlayer(CONFIG.MODE);
  let spawner = SPAWN.createSpawner(CONFIG.MODE, () => {
    GAME.score++;
    UI.setScoreLabel(GAME.score, GAME.best);
  });

  // ===== GAME state machine
  window.GAME = {
    state: "idle",
    score: 0,
    best: +(localStorage.getItem("bestScore") || 0),

    start() {
      if (this.state === "running") return;
      if (this.state === "over" || this.state === "idle") this.score = 0;
      player = Entities.createPlayer(CONFIG.MODE);
      spawner.reset(CONFIG.MODE);
      this.state = "running";
      UI.setStateLabel(this.state);
      UI.setScoreLabel(this.score, this.best);
      UI.updateButtons(this.state);
      AUDIO.init?.();
    },

    pause() {
      if (this.state === "running") {
        this.state = "paused";
        AUDIO.playPause?.();
      } else if (this.state === "paused") {
        this.state = "running";
        AUDIO.playPause?.();
      }
      UI.setStateLabel(this.state);
      UI.updateButtons(this.state);
    },

    reset(keepMode = false) {
      this.state = "idle";
      this.score = 0;
      if (!keepMode) computeMode();
      player = Entities.createPlayer(CONFIG.MODE);
      spawner.reset(CONFIG.MODE);
      UI.setStateLabel(this.state);
      UI.setScoreLabel(this.score, this.best);
      UI.updateButtons(this.state);
      measureStageAndResize({ reflowEntitiesIfIdle: true });
    },

    switchLane() {
      if (this.state === "running") player.switchLane(CONFIG.MODE);
    },

    gameOver() {
      if (this.state === "over") return;
      this.state = "over";
      AUDIO.playOver?.();
      if (this.score > this.best) {
        this.best = this.score;
        localStorage.setItem("bestScore", String(this.best));
      }
      UI.setStateLabel(this.state);
      UI.setScoreLabel(this.score, this.best);
      UI.updateButtons(this.state);
    },
  };

  // ===== Resize / orientation observers
  const ro = new ResizeObserver(() =>
    measureStageAndResize({ reflowEntitiesIfIdle: true })
  );
  ro.observe(document.getElementById("gameStage"));
  addEventListener("orientationchange", () => {
    if (window.GAME) GAME.reset(true);
  });

  // ===== Kontra game loop
  const loop = GameLoop({
    update(dt) {
      if (GAME.state !== "running") return;
      player.update(dt, CONFIG.MODE);
      spawner.update(dt, CONFIG.MODE, player, GAME.score);

      const obs = spawner.getActive();
      for (let i = 0; i < obs.length; i++) {
        if (obs[i].active && COLLIDE.playerWithObstacle(player, obs[i])) {
          GAME.gameOver();
          break;
        }
      }
    },
    render() {
      const { W, H } = CONFIG.LOGICAL;

      // Clear & translucent canvas background
      context.clearRect(0, 0, W, H);
      context.fillStyle = CONFIG.COLORS?.bg || "rgba(12,18,33,0.2)";
      context.fillRect(0, 0, W, H);

      drawDivider(context);
      spawner.render(context);
      player.render(context);
    },
  });

  // ===== UI + start
  UI.bind();
  UI.setStateLabel(GAME.state);
  UI.setScoreLabel(GAME.score, GAME.best);
  UI.setModeLabel(CONFIG.MODE);
  UI.updateButtons(GAME.state);
  loop.start();
})();
