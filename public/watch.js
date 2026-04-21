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

const overlay = document.getElementById("blurOverlayTop");
const overlayBottom = document.getElementById("blurOverlayBottom");
const wrapper = document.getElementById("videoWrapper");

let isPaused = false;
let hideTimer = null;

let lastTime = 0;
let interactionTimer = null;

// --- Blur control ---
function showBlur() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  overlay.classList.add("visible");
  overlayBottom.classList.add("visible");
}

function scheduleHide() {
  if (isPaused) return;

  if (hideTimer) clearTimeout(hideTimer);

  hideTimer = setTimeout(() => {
    overlay.classList.remove("visible");
    overlayBottom.classList.remove("visible");
    hideTimer = null;
  }, 3500);
}

// Desktop hover
wrapper.addEventListener("mouseenter", showBlur);
wrapper.addEventListener("mouseleave", scheduleHide);

// iOS / mobile iframe blur detection
window.addEventListener("blur", () => {
  if (document.activeElement && document.activeElement.tagName === "IFRAME") {
    console.log("clicked");
    showBlur();
    scheduleHide();

    setTimeout(() => {
      if (document.activeElement) document.activeElement.blur();
    }, 0);
  }
});

// --- YouTube API ---
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

    if (Math.abs(currentTime - lastTime) > 2) {
      showBlur();
      scheduleHide();
    }

    lastTime = currentTime;
  }, 500);
}

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