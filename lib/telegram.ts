/**
 * Utility for sending Telegram notifications via Bot API.
 * Requires TELEGRAM_BOT_TOKEN environment variable.
 * Each user's chat ID is stored in the database.
 */

/**
 * Send a Telegram message to a specific chat.
 * @param chatId  The Telegram chat ID for the recipient.
 * @param message The message body (HTML-formatted).
 */
export async function sendTelegramMessage(
  chatId: string,
  message: string,
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();

  if (!token) {
    console.warn(
      'Telegram notifications skipped: Bot token not configured.',
    );
    return false;
  }

  if (!chatId) {
    console.warn(
      'Telegram notifications skipped: No chat ID provided for user.',
    );
    return false;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API Error:', errorData);
      return false;
    }

    console.log('✅ Telegram notification sent successfully.');
    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}
