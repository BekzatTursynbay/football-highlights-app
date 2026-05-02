import "dotenv/config";
import "./server";
import cron from "node-cron";
import { LEAGUES } from "./config/leagues";
import { fetchPlaylistVideos, fetchVideoDetails } from "./services/youtube";
import { getNightTimeWindow } from "./utils/timeWindow";
import { Highlight } from "./types/highlight";
import { cleanTitle } from "./utils/titleCleaner";
import { isValidHighlight } from "./utils/filters";
import { isPlayableInIframe } from "./utils/playability";
import { sendTelegramMessage } from "./utils/telegram";

console.log("CRON STARTED", new Date().toISOString());

function normalizeVideo(
  league: string,
  video: any,
  skipSeconds: number,
): Highlight | null {
  const snippet = video.snippet;
  let title = snippet.title;

  // Only filter by 'Обзор' for EPL, LaLiga, Bundesliga, SerieA
  const leaguesWithObzor = ["EPL", "LaLiga", "Bundesliga", "SerieA"];
  if (leaguesWithObzor.includes(league) && !isValidHighlight(title)) {
    return null;
  }

  title = cleanTitle(league, title);

  return {
    league: league as any,
    videoId: snippet.resourceId.videoId,
    title,
    publishedAt: new Date(snippet.publishedAt),
    skipSeconds,
  };
}

function filterByTimeWindow(highlight: Highlight, start: Date, end: Date) {
  return highlight.publishedAt >= start && highlight.publishedAt <= end;
}

export async function runHighlights() {
  const { nightStart, nightEnd } = getNightTimeWindow({ testMode: false });

  let highlights: Highlight[] = [];

  for (const league of LEAGUES) {
    const videos = await fetchPlaylistVideos(league.playlistId);

    const normalized = (videos as any[])
      .map((v: any) => normalizeVideo(league.league, v, league.skipSeconds))
      .filter((h: Highlight | null): h is Highlight => h !== null);

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

  const BASE_URL = process.env.BASE_URL;

  const LEAGUE_LABELS: Record<string, string> = {
    EPL: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 АПЛ",
    LaLiga: "🇪🇸 Ла Лига",
    SuperLig: "🇹🇷 Турецкая Суперлига",
    ChampionsLeague: "🏆 Лига Чемпионов",
    EuropaLeague: "🟠 Лига Европы",
    SerieA: "🇮🇹 Серия А",
    Bundesliga: "🇩🇪 Бундеслига",
  };

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

  let message: string;
  if (playable.length === 0) {
    message = "Обзоры матчей за прошлую ночь не найдены.";
  } else {
    const grouped = new Map<string, string[]>();
    for (const h of playable) {
      const label = LEAGUE_LABELS[h.league] ?? h.league;
      if (!grouped.has(label)) grouped.set(label, []);
      grouped
        .get(label)!
        .push(
          `  • <a href="${BASE_URL}/watch.html?videoId=${h.videoId}&skip=${h.skipSeconds}">${h.title}</a>`,
        );
    }

    const sections = [...grouped.entries()].map(
      ([label, items]) => `${label}\n${items.join("\n")}`,
    );

    message = `⚽️ <b>Обзоры матчей</b>\n\n${sections.join("\n\n")}`;
  }

  // Send to Telegram
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
  await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, message);

  console.log(nightStart, nightEnd);
}

// Schedule the highlight sending at 14:20 KZ = 09:20 UTC
// cron.schedule("12 04 * * *", () => {
//   run().catch(console.error);
// });
// cron.schedule(
//   "0 9 * * *",
//   () => {
//     run().catch(console.error);
//   },
//   {
//     timezone: "Asia/Aqtobe",
//   },
// );
// Triggered externally via GitHub Actions → POST /run
