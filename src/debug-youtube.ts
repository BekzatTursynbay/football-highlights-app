import "dotenv/config";
import { fetchPlaylistVideos } from "./services/youtube";
import { LEAGUES } from "./config/leagues";
import { getNightTimeWindow } from "./utils/timeWindow";

const toKZ = (d: Date) =>
  new Date(d.getTime() + 5 * 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 16) + " KZ";

(async () => {
  const manualMode = process.argv.includes("--manual");
  const { nightStart, nightEnd } = getNightTimeWindow({ manualMode });
  console.log(`Mode: ${manualMode ? "MANUAL" : "scheduled"}`);
  console.log(`Window: ${toKZ(nightStart)} -> ${toKZ(nightEnd)}`);
  console.log(`Now:    ${toKZ(new Date())}\n`);

  for (const league of LEAGUES) {
    const videos = await fetchPlaylistVideos(league.playlistId);
    const recent = (videos as any[])
      .map((v) => ({
        title: v.snippet.title,
        publishedAt: new Date(v.snippet.publishedAt),
      }))
      .filter((v) => Date.now() - v.publishedAt.getTime() < 3 * 24 * 60 * 60 * 1000)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    if (recent.length) {
      console.log(`=== ${league.league} ===`);
      for (const v of recent) {
        const inWindow = v.publishedAt >= nightStart && v.publishedAt <= nightEnd;
        console.log(`${inWindow ? "[IN ] " : "[OUT] "} ${toKZ(v.publishedAt)}  ${v.title}`);
      }
      console.log("");
    }
  }
})();
