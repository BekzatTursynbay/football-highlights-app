export type League =
  | "EPL"
  | "LaLiga"
  | "SuperLig"
  | "ChampionsLeague"
  | "Bundesliga"
  | "SerieA"
  | "EuropaLeague";

export interface Highlight {
  league: League;
  videoId: string;
  title: string;
  publishedAt: Date;
  skipSeconds: number;
}
