import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

function getYoutubeApiKey(): string {
  if (!YOUTUBE_API_KEY) {
    throw new Error("Missing required environment variable: YOUTUBE_API_KEY");
  }
  return YOUTUBE_API_KEY;
}

const YT_BASE = "https://www.googleapis.com/youtube/v3";

export async function fetchPlaylistVideos(playlistId: string) {
  const apiKey = getYoutubeApiKey();

  const response = await axios.get(`${YT_BASE}/playlistItems`, {
    params: {
      part: "snippet",
      maxResults: 50,
      playlistId: playlistId,
      key: apiKey,
    },
  });

  return response.data.items;
}

export async function fetchVideoDetails(videoIds: string[]) {
  if (videoIds.length === 0) return [];

  const apiKey = getYoutubeApiKey();

  const response = await axios.get(`${YT_BASE}/videos`, {
    params: {
      part: "status,contentDetails",
      id: videoIds.join(","),
      key: apiKey,
    },
  });

  return response.data.items;
}
