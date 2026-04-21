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
const tapCatcher = document.getElementById("tapCatcher");

// ===== STATE =====
let isPaused = false;
let hideTimer = null;
let lastTime = 0;
let interactionTimer = null;

// ===== BLUR CONTROL =====
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

// ===== TAP HANDLING (FIX FOR iOS) =====
let tapTimeout = null;

tapCatcher.addEventListener("touchstart", () => {
  showBlur();
  scheduleHide();

  // allow click to pass through
  tapCatcher.style.pointerEvents = "none";

  tapTimeout = setTimeout(() => {
    tapCatcher.style.pointerEvents = "auto";
  }, 300);
});

// Also support desktop click
tapCatcher.addEventListener("click", () => {
  showBlur();
  scheduleHide();
});

// ===== DESKTOP HOVER =====
wrapper.addEventListener("mouseenter", showBlur);
wrapper.addEventListener("mouseleave", scheduleHide);

// ===== YOUTUBE API =====
window.onYouTubeIframeAPIReady = () => {
  player = new YT.Player("player", {
    videoId,
    playerVars: {
      start: skipSeconds,
      autoplay: 1,
      mute: 1,
      controls: 1,
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

  interactionTimer = setInterval(() => {
    if (!player || !player.getCurrentTime) return;

    const currentTime = player.getCurrentTime();

    // detect seek/jump
    if (Math.abs(currentTime - lastTime) > 2) {
      showBlur();
      scheduleHide();
    }

    lastTime = currentTime;
  }, 500);
}

// ===== PLAYER STATE =====
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