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

// Track time to detect interaction
let lastTime = 0;
let interactionTimer: ReturnType<typeof setInterval> | null = null;

// --- Blur control ---
function showBlur(): void {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  overlay.classList.add("visible");
}

function scheduleHide(): void {
  if (isPaused) return;
  if (hideTimer) clearTimeout(hideTimer);

  hideTimer = setTimeout(() => {
    overlay.classList.remove("visible");
    hideTimer = null;
  }, 3500);
}

// --- Desktop hover (still useful) ---
wrapper.addEventListener("mouseenter", showBlur);
wrapper.addEventListener("mouseleave", scheduleHide);

// --- Detect tap inside iframe on mobile ---
window.addEventListener("blur", () => {
  if (document.activeElement?.tagName === "IFRAME") {
    console.log("clicked");
    showBlur();
    scheduleHide();
    // Refocus window so the next tap triggers blur again
    setTimeout(() => (document.activeElement as HTMLElement)?.blur(), 0);
  }
});

// --- YouTube API ---
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
      playsinline: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
};

function onPlayerReady(event: YT.PlayerEvent) {
  event.target.playVideo();

  // Start polling for interaction
  interactionTimer = setInterval(() => {
    if (!player || !player.getCurrentTime) return;

    const currentTime = player.getCurrentTime();

    // Detect seek/jump interaction (not normal playback advancement)
    if (Math.abs(currentTime - lastTime) > 2) {
      showBlur();
      scheduleHide();
    }

    lastTime = currentTime;
  }, 500); // check twice per second
}

// --- Player state ---
function onPlayerStateChange(event: YT.OnStateChangeEvent): void {
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
