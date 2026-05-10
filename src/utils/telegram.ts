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
      const status = err.response?.status;
      const data = err.response?.data as
        | { description?: string; error_code?: number }
        | undefined;
      const description = data?.description;

      console.error("Telegram API error:", {
        status,
        statusText: err.response?.statusText,
        data,
        message: err.message,
      });

      if (status) {
        throw new Error(
          `Telegram API ${status}${description ? `: ${description}` : ""}`,
        );
      }
    }
    throw err;
  }
}
