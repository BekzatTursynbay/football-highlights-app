import axios from "axios";

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Telegram API error:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      });
    }
    throw err;
  }
}
