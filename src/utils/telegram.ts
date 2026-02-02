import axios from "axios";

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await axios.post(url, {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}
