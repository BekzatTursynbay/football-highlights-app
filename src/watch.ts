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

const overlayTop = document.getElementById("blurOverlayTop")!;
const overlayBottom = document.getElementById("blurOverlayBottom")!;
const wrapper = document.getElementById("videoWrapper")!;
const tapCatcher = document.getElementById("tapCatcher")!;

// ===== STATE =====
let isPaused = false;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let lastTime = 0;
let interactionTimer: ReturnType<typeof setInterval> | null = null;

// ===== BLUR =====
function showBlur(): void {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  overlayTop.classList.add("visible");
  overlayBottom.classList.add("visible");
}

function scheduleHide(): void {
  if (isPaused) return;

  if (hideTimer) clearTimeout(hideTimer);

  hideTimer = setTimeout(() => {
    overlayTop.classList.remove("visible");
    overlayBottom.classList.remove("visible");
    hideTimer = null;
  }, 3000);
}

// ===== TAP (MAIN FIX) =====
let tapTimeout: ReturnType<typeof setTimeout> | null = null;

tapCatcher.addEventListener("touchstart", () => {
  showBlur();
  scheduleHide();

  tapCatcher.style.pointerEvents = "none";

  tapTimeout = setTimeout(() => {
    tapCatcher.style.pointerEvents = "auto";
  }, 300);
});

tapCatcher.addEventListener("click", () => {
  showBlur();
  scheduleHide();
});

// ===== DESKTOP =====
wrapper.addEventListener("mouseenter", showBlur);
wrapper.addEventListener("mouseleave", scheduleHide);

// ===== YOUTUBE =====
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
