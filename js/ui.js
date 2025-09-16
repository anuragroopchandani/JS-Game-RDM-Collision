(function () {
  const $ = (sel) => document.querySelector(sel);

  let $start, $pause, $reset, $score, $state, $mode, $canvas;

  function bind() {
    // Buttons / HUD
    $start = $("#btnStart");
    $pause = $("#btnPause"); // present but hidden by CSS (ok)
    $reset = $("#btnReset");
    $score = $("#uiScore");
    $state = $("#uiState");
    $mode = $("#uiMode");
    $canvas = $("#gameCanvas");

    // Start toggles: Start → Pause → Resume
    $start?.addEventListener("click", () => {
      if (!window.GAME) return;
      if (GAME.state === "running") GAME.pause();
      else if (GAME.state === "paused") GAME.pause();
      else GAME.start();
      updateButtons(GAME.state);
    });

    // Optional dedicated Pause button (kept for compatibility)
    $pause?.addEventListener("click", () => {
      if (!window.GAME) return;
      GAME.pause();
      updateButtons(GAME.state);
    });

    // Reset
    $reset?.addEventListener("click", () => {
      if (!window.GAME) return;
      GAME.reset();
      updateButtons(GAME.state);
    });

    // Spacebar switches lane
    addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (window.GAME) GAME.switchLane();
      }
    });

    // Tap/click on canvas switches lane (mobile-friendly)
    $canvas?.addEventListener("pointerdown", () => {
      if (window.GAME) GAME.switchLane();
    });
  }

  function setStateLabel(text) {
    if ($state) $state.textContent = "State: " + text;
  }

  function setScoreLabel(score = 0, best = 0) {
    if ($score) $score.innerHTML = `Score: ${score} <em>(Best: ${best})</em>`;
  }

  function setModeLabel(mode) {
    if ($mode) $mode.textContent = `Mode: ${mode.name} (${mode.axis})`;
  }

  function updateButtons(state) {
    if ($start) {
      $start.textContent =
        state === "running" ? "Pause" : state === "paused" ? "Resume" : "Start";
    }
    if ($pause) {
      $pause.textContent = state === "paused" ? "Resume" : "Pause";
      $pause.disabled = false;
    }
  }

  window.UI = {
    bind,
    setStateLabel,
    setScoreLabel,
    setModeLabel,
    updateButtons,
  };
})();
