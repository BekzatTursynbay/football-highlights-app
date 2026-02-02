import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  throw new Error("YOUTUBE_API_KEY is missing in environment variables");
}

const YT_BASE = "https://www.googleapis.com/youtube/v3";

export async function fetchPlaylistVideos(playlistId: string) {
  const response = await axios.get(`${YT_BASE}/playlistItems`, {
    params: {
      part: "snippet",
      maxResults: 50,
      playlistId,
      key: YOUTUBE_API_KEY,
    },
  });

  return response.data.items;
}

export async function fetchChannelVideos(channelId: string) {
  const response = await axios.get(`${YT_BASE}/search`, {
    params: {
      part: "snippet",
      channelId,
      maxResults: 25,
      order: "date",
      type: "video",
      key: YOUTUBE_API_KEY,
    },
  });

  return response.data.items;
}

export async function fetchVideoDetails(videoIds: string[]) {
  if (videoIds.length === 0) return [];

  const response = await axios.get(`${YT_BASE}/videos`, {
    params: {
      part: "status,contentDetails",
      id: videoIds.join(","),
      key: YOUTUBE_API_KEY,
    },
  });

  return response.data.items;
}
