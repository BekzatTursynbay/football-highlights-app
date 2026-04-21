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

const overlay = document.getElementById("blurOverlayTop")!;
const overlayBottom = document.getElementById(
  "blurOverlayBottom",
) as HTMLElement | null;
const wrapper = document.getElementById("videoWrapper")!;

let isPaused = false;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

let lastTime = 0;
let interactionTimer: ReturnType<typeof setInterval> | null = null;

// --- device check ---
function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

// --- Blur control ---
function showBlur(): void {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  overlay.classList.add("visible");

  if (isAndroid() && overlayBottom) {
    overlayBottom.classList.add("visible");
  }
}

function scheduleHide(): void {
  if (isPaused) return;

  if (hideTimer) clearTimeout(hideTimer);

  hideTimer = setTimeout(() => {
    overlay.classList.remove("visible");

    if (isAndroid() && overlayBottom) {
      overlayBottom.classList.remove("visible");
    }

    hideTimer = null;
  }, 3500);
}

// Desktop hover
wrapper.addEventListener("mouseenter", showBlur);
wrapper.addEventListener("mouseleave", scheduleHide);

// iOS iframe blur detection
window.addEventListener("blur", () => {
  if (document.activeElement?.tagName === "IFRAME") {
    console.log("clicked");
    showBlur();
    scheduleHide();

    setTimeout(() => {
      (document.activeElement as HTMLElement)?.blur();
    }, 0);
  }
});

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
    if (!player?.getCurrentTime) return;

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
