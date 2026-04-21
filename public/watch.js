"use strict";

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

const videoId = getQueryParam("videoId");
const skipSeconds = Number(getQueryParam("skip")) || 0;

if (!videoId) {
  document.body.innerHTML = "<h1 style='color:white'>No video</h1>";
  throw new Error("Missing videoId");
}

let player;

const overlayTop = document.getElementById("blurOverlayTop");
const overlayBottom = document.getElementById("blurOverlayBottom");
const wrapper = document.getElementById("videoWrapper");

const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const volumeRange = document.getElementById("volumeRange");

// ===== STATE =====
let isPaused = false;
let hideTimer = null;
let lastTime = 0;
let interactionTimer = null;

// ===== BLUR =====
function showBlur() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  overlayTop.classList.add("visible");
  overlayBottom.classList.add("visible");
}

function scheduleHide() {
  if (isPaused) return;

  if (hideTimer) clearTimeout(hideTimer);

  hideTimer = setTimeout(() => {
    overlayTop.classList.remove("visible");
    overlayBottom.classList.remove("visible");
    hideTimer = null;
  }, 3000);
}

// ===== YOUTUBE =====
window.onYouTubeIframeAPIReady = () => {
  player = new YT.Player("player", {
    videoId,
    playerVars: {
      start: skipSeconds,
      autoplay: 1,
      mute: 1,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
};

function onPlayerReady(event) {
  event.target.playVideo();

  playBtn.addEventListener("click", () => {
    player.playVideo();
    showBlur();
    scheduleHide();
  });

  pauseBtn.addEventListener("click", () => {
    player.pauseVideo();
    showBlur();
  });

  volumeRange.addEventListener("input", (e) => {
    player.setVolume(e.target.value);
  });

  // Tap anywhere to toggle play (mobile friendly)
  wrapper.addEventListener("click", () => {
    const state = player.getPlayerState();

    if (state === YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }

    showBlur();
    scheduleHide();
  });

  interactionTimer = setInterval(() => {
    if (!player || !player.getCurrentTime) return;

    const currentTime = player.getCurrentTime();

    if (Math.abs(currentTime - lastTime) > 2) {
      showBlur();
      scheduleHide();
    }

    lastTime = currentTime;
  }, 500);
}

// ===== STATE =====
function onPlayerStateChange(event) {
  if (
    event.data === YT.PlayerState.PAUSED ||
    event.data === YT.PlayerState.ENDED
  ) {
    isPaused = true;
    showBlur();
  } else if (event.data === YT.PlayerState.PLAYING) {
    isPaused = false;
    showBlur();
    scheduleHide();
  }
}