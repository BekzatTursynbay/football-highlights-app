export type League = "EPL" | "LaLiga" | "SuperLig" | "ChampionsLeague";

export type SourceType = "playlist" | "channel";

export interface Highlight {
  league: League;
  videoId: string;
  title: string;
  publishedAt: Date;
  sourceType: SourceType;
  skipSeconds: number;
}
