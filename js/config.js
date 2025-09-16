window.CONFIG = {
  VERSION: "1.1.0",

  // LOGICAL canvas size is overridden to match #gameStage at runtime (core.js)
  LOGICAL: { W: 300, H: 500 },

  COLORS: {
    // Translucent canvas fill so Vanta/glass UI shows through
    bg: "rgba(12, 18, 33, 0.2)",
    // Dashed center-line color
    divider: "rgba(220,235,255,0.55)",
    // Fallback player tint (only used by tiny placeholder while image loads)
    player: "limegreen",
  },

  RENDER: {
    // Center divider style
    dividerWidth: 4,
    dividerDash: [12, 10],
    dividerGlow: 16,

    // Rotate the ship anti-clockwise in portrait so it faces “up the lane”
    playerPortraitRotationDeg: -90,
  },

  SPEED: {
    obstacleBase: 140, // base UFO px/sec (scaled by board span in spawn.js)
    playerTween: 0.15, // lane-switch tween duration (seconds)
  },

  DIFFICULTY: {
    maxOnScreen: 3,
    spawnIntervalStart: 0.9,
    spawnIntervalMin: 0.35,
    spawnIntervalPerScore: 0.012,
    speedPerScore: 6,
  },

  FEATURES: {
    BG: true, // enable Vanta background
    AUDIO: true, // enable Howler SFX
    PANE: false,
  },

  // Baseline; recomputed on resize/orientation in core.js::computeMode()
  MODE: {
    name: "portrait",
    axis: "vertical",
    lanes: [75, 225],
    playerStart: { x: 75, y: 440 },
    obstacleStart: { x: 75, y: -30 },
  },

  OVERRIDE: { orientation: "auto" },

  AUDIO: {
    switch: "assets/audio/mixkit-player-jumping-in-a-video-game-2043.wav",
    pause: "assets/audio/mixkit-gaming-lock-2848.wav",
    over: "assets/audio/mixkit-arcade-retro-game-over-213.wav",
    volume: 0.55,
    muted: false,
  },

  RECORD: {
    enabled: false,
    preset: null, // 'portrait' | 'landscape' | null
    dprCanvas: true, // crisp rendering on high-DPI screens
    disableBG: true,
  },
};
