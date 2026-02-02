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

function onPlayerStateChange(event: YT.OnStateChangeEvent) {
  const blur = document.getElementById("pause-blur");
  if (!blur) return;

  if (event.data === YT.PlayerState.PAUSED) {
    blur.classList.add("active");
  }

  if (event.data === YT.PlayerState.PLAYING) {
    blur.classList.remove("active");
  }
}

// FULLSCREEN BUTTON
const wrapper = document.querySelector(".video-wrapper") as HTMLElement;
const fsBtn = document.getElementById("fs-btn") as HTMLButtonElement;

if (wrapper && fsBtn) {
  fsBtn.addEventListener("click", () => {
    wrapper.classList.toggle("fullscreen");
  });
}
