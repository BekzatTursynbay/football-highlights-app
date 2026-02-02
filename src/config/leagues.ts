import { League } from "../types/highlight";

export interface LeagueConfig {
  league: League;
  sourceType: "playlist" | "channel";
  id: string;
  skipSeconds: number;
}

export const LEAGUES: LeagueConfig[] = [
  {
    league: "EPL",
    sourceType: "channel",
    id: "UCBFe_1BsDBtUhf1vkp0z5Bg",
    skipSeconds: 7,
  },
  {
    league: "SuperLig",
    sourceType: "playlist",
    id: "PLREq_OnJpFaRT2WY8UTDz-Bbty-BQIMmj",
    skipSeconds: 7,
  },
  {
    league: "LaLiga",
    sourceType: "playlist",
    // id: "PLKj1QUtwqLN9abWyEey7ZJOhBQcos029x",
    id: "PLqwe009vcafAgzfc4Zkcdr7w4HHefNugF",
    skipSeconds: 8,
  },
  {
    league: "ChampionsLeague",
    sourceType: "playlist",
    id: "PLywDagwpnS3I86qfv0Luuj4PeFX3JRTQt",
    skipSeconds: 0,
  },
];
