function getQueryParam(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

const videoId = getQueryParam("videoId");
const skipSeconds = Number(getQueryParam("skip")) || 0;

if (!videoId) {
  document.body.innerHTML = "<h1 style='color:white'>No video</h1>";
  throw new Error("Missing videoId");
}

let player: YT.Player;

const overlay = document.getElementById("blurOverlay")!;
const wrapper = document.getElementById("videoWrapper")!;

// State
let isPaused = false;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function showBlur(): void {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  overlay.classList.add("visible");
}

// Delay hiding to outlast YouTube's 3-second UI fade (3.5s to be safe).
function scheduleHide(): void {
  if (isPaused) return; // keep blur while paused
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    overlay.classList.remove("visible");
    hideTimer = null;
  }, 3000);
}

// Desktop hover
wrapper.addEventListener("mouseenter", showBlur);
wrapper.addEventListener("mouseleave", scheduleHide);

// Mobile touch
wrapper.addEventListener("touchstart", showBlur, { passive: true });
wrapper.addEventListener("touchend", scheduleHide, { passive: true });
wrapper.addEventListener("touchcancel", scheduleHide, { passive: true });

(window as any).onYouTubeIframeAPIReady = () => {
  player = new YT.Player("player", {
    videoId,
    playerVars: {
      start: skipSeconds,
      autoplay: 1,
      mute: 1,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1, // 👈 important esp. on mobile
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
};

function onPlayerReady(event: YT.PlayerEvent) {
  console.log("PLAYER READY");
  event.target.playVideo();
}

function onPlayerStateChange(event: YT.OnStateChangeEvent): void {
  if (
    event.data === YT.PlayerState.PAUSED ||
    event.data === YT.PlayerState.ENDED
  ) {
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
