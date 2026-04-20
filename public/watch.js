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
            playsinline: 1, // 👈 important esp. on mobile
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
function onPlayerStateChange(_event) {}
