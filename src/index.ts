import "dotenv/config";
import "./server";
import { LEAGUES } from "./config/leagues";
import { fetchChannelVideos, fetchPlaylistVideos } from "./services/youtube";
import { getNightTimeWindow } from "./utils/timeWindow";
import { Highlight } from "./types/highlight";
import { cleanTitle } from "./utils/titleCleaner";
import { isValidHighlight } from "./utils/filters";
import { fetchVideoDetails } from "./services/youtube";
import { isPlayableInIframe } from "./utils/playability";
import { sendTelegramMessage } from "./utils/telegram";

console.log("CRON STARTED", new Date().toISOString());

function normalizeVideo(
  league: string,
  video: any,
  sourceType: "playlist" | "channel",
  skipSeconds: number,
): Highlight | null {
  const snippet = video.snippet;
  let title = snippet.title;

  // EPL filter: only Обзор videos
  if ((league === "EPL" || league === "LaLiga") && !isValidHighlight(title)) {
    return null;
  }

  title = cleanTitle(league, title);

  return {
    league: league as any,
    videoId:
      sourceType === "playlist" ? snippet.resourceId.videoId : video.id.videoId,
    title,
    publishedAt: new Date(snippet.publishedAt),
    sourceType,
    skipSeconds,
  };
}

function filterByTimeWindow(highlight: Highlight, start: Date, end: Date) {
  return highlight.publishedAt >= start && highlight.publishedAt <= end;
}

async function run() {
  const { nightStart, nightEnd } = getNightTimeWindow({ testMode: false });

  let highlights: Highlight[] = [];

  for (const league of LEAGUES) {
    let videos: any[] = [];

    if (league.sourceType === "playlist") {
      videos = await fetchPlaylistVideos(league.id);
    } else {
      videos = await fetchChannelVideos(league.id);
    }

    const normalized = videos
      .map((v) =>
        normalizeVideo(league.league, v, league.sourceType, league.skipSeconds),
      )
      .filter((h): h is Highlight => h !== null);

    highlights = highlights.concat(normalized);
  }

  // Filter by time window FIRST
  const timeFiltered = highlights.filter((h) =>
    filterByTimeWindow(h, nightStart, nightEnd),
  );

  console.log("After time filter:", timeFiltered.length);

  // Fetch details ONLY for yesterday's highlights
  const videoIds = timeFiltered.map((h) => h.videoId);
  const details = await fetchVideoDetails(videoIds);

  // Video details(status, region restriction)
  const detailsMap = new Map<string, any>();
  details.forEach((v: any) => {
    detailsMap.set(v.id, v);
  });

  // Region restriction filter
  const playable = timeFiltered.filter((h) => {
    const detail = detailsMap.get(h.videoId);
    return detail && isPlayableInIframe(detail, "KZ");
  });

  // console.log("Playable highlights:", playable);

  const BASE_URL = process.env.BASE_URL;
  const links = playable.map(
    (h) =>
      `• <a href="${BASE_URL}/watch.html?videoId=${h.videoId}&skip=${h.skipSeconds}">${h.title}</a>`,
  );

  // Log clickable links in terminal
  if (playable.length) {
    console.log("\nHighlight links:");
    playable.forEach((h) => {
      const url = `${BASE_URL}/watch.html?videoId=${h.videoId}&skip=${h.skipSeconds}`;
      console.log(url);
    });
  } else {
    console.log("No highlights found for yesterday night.");
  }

  const message = links.length
    ? `⚽️ Football Highlights:\n\n${links.join("\n")}`
    : "No highlights found for yesterday night.";

  // Send to Telegram
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
  await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, message);

  console.log(nightStart, nightEnd);
}

run().catch(console.error);
