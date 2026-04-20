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
const overlay = document.getElementById("blurOverlay");
const wrapper = document.getElementById("videoWrapper");

// State
let isPaused = false;
let hideTimer = null;

function showBlur() {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    overlay.classList.add("visible");
}

// Delay hiding to outlast YouTube's 3-second UI fade (use 3.5s to be safe).
function scheduleHide() {
    if (isPaused) return; // keep blur while paused
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
        overlay.classList.remove("visible");
        hideTimer = null;
    }, 3500);
}

// Desktop hover
wrapper.addEventListener("mouseenter", showBlur);
wrapper.addEventListener("mouseleave", scheduleHide);

// Mobile touch
wrapper.addEventListener("touchstart", showBlur, { passive: true });
wrapper.addEventListener("touchend", scheduleHide, { passive: true });
wrapper.addEventListener("touchcancel", scheduleHide, { passive: true });

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
    console.log("PLAYER READY");
    event.target.playVideo();
}
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        isPaused = true;
        showBlur(); // ensure blur is visible while paused
    } else if (event.data === YT.PlayerState.PLAYING) {
        isPaused = false;
        // Hide only if mouse is not currently over the wrapper
        if (!wrapper.matches(":hover")) {
            scheduleHide();
        }
    }
}
