(function () {
  const sounds = {};
  let ready = false;

  function ensure() {
    if (ready || !CONFIG.FEATURES.AUDIO || typeof Howl === "undefined") return;

    const vol = CONFIG.AUDIO.volume ?? 0.5;
    const srcSwitch = CONFIG.AUDIO.switch;
    const srcPause = CONFIG.AUDIO.pause;
    const srcOver = CONFIG.AUDIO.over;

    if (srcSwitch) sounds.switch = new Howl({ src: [srcSwitch], volume: vol });
    if (srcPause)
      sounds.pause = new Howl({
        src: [srcPause],
        volume: Math.max(0, Math.min(1, vol * 0.7)),
      });
    if (srcOver)
      sounds.over = new Howl({
        src: [srcOver],
        volume: Math.max(0, Math.min(1, vol * 1.1)),
      });

    try {
      Howler.mute(!!CONFIG.AUDIO.muted);
    } catch {}
    ready = true;
  }

  window.AUDIO = {
    unlocked: false,

    init() {
      ensure();
    },

    unlock() {
      // Required on mobile: resume AudioContext after first gesture
      try {
        Howler?.ctx?.resume?.();
        this.unlocked = true;
      } catch {}
    },

    setMuted(m) {
      CONFIG.AUDIO.muted = !!m;
      try {
        Howler.mute(!!m);
      } catch {}
    },

    setVolume(v) {
      const clamped = Math.max(0, Math.min(1, Number(v) || 0));
      CONFIG.AUDIO.volume = clamped;
      // Update existing Howls too
      if (sounds.switch) sounds.switch.volume(clamped);
      if (sounds.pause)
        sounds.pause.volume(Math.max(0, Math.min(1, clamped * 0.7)));
      if (sounds.over)
        sounds.over.volume(Math.max(0, Math.min(1, clamped * 1.1)));
    },

    playSwitch() {
      ensure();
      if (!CONFIG.AUDIO.muted) sounds.switch?.play?.();
    },
    playPause() {
      ensure();
      if (!CONFIG.AUDIO.muted) sounds.pause?.play?.();
    },
    playOver() {
      ensure();
      if (!CONFIG.AUDIO.muted) sounds.over?.play?.();
    },
  };

  // Mobile unlock on first tap/click
  addEventListener("pointerdown", () => AUDIO.unlock(), { once: true });
})();
