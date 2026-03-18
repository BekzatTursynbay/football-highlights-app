import { League } from "../types/highlight";

export interface LeagueConfig {
  league: League;
  playlistId: string;
  skipSeconds: number;
}

export const LEAGUES: LeagueConfig[] = [
  {
    league: "EPL",
    playlistId: "PLoyLwQOxE_3VyOEC4hjYCeH_xask8Ax-r",
    skipSeconds: 0,
  },
  {
    league: "SuperLig",
    playlistId: "PLREq_OnJpFaRT2WY8UTDz-Bbty-BQIMmj",
    skipSeconds: 7,
  },
  {
    league: "LaLiga",
    playlistId: "PLqwe009vcafAgzfc4Zkcdr7w4HHefNugF",
    skipSeconds: 0,
  },
  {
    league: "ChampionsLeague",
    playlistId: "PLywDagwpnS3I86qfv0Luuj4PeFX3JRTQt",
    skipSeconds: 0,
  },
  {
    league: "EuropaLeague",
    playlistId: "PLywDagwpnS3JM0idPWdoOp5n4WVtlsHKM",
    skipSeconds: 0,
  },
  {
    league: "SerieA",
    playlistId: "PLqwe009vcafDW5cq2yzwciJHtBNDbonum",
    skipSeconds: 0,
  },
  {
    league: "Bundesliga",
    playlistId: "PLqwe009vcafD9qJ_DQS5D2qWC7ET_-yCI",
    skipSeconds: 0,
  },
];
