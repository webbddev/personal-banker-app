import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';

/**
 * Telegram Bot Webhook
 *
 * Telegram sends a POST request here whenever someone messages the bot.
 * We handle the `/start connect_<code>` deep link to bind a Telegram
 * chat ID to a user account.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Telegram sends updates with a "message" object
    const message = body?.message;
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const text = message.text?.trim() ?? '';
    const firstName = message.from?.first_name ?? 'there';

    // Handle /start with a connection code
    if (text.startsWith('/start connect_')) {
      const code = text.replace('/start ', '').trim();

      // Look up the user by their connection code
      const user = await prisma.user.findUnique({
        where: { telegramConnectionCode: code },
      });

      if (!user) {
        await sendTelegramMessage(
          chatId,
          '❌ Invalid or expired connection code. Please generate a new link from the app settings.',
        );
        return NextResponse.json({ ok: true });
      }

      // Link the Telegram chat ID and clear the connection code
      await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramChatId: chatId,
          telegramConnectionCode: null, // One-time use
        },
      });

      await sendTelegramMessage(
        chatId,
        `✅ Successfully linked to <b>${user.name || user.email}</b>!\n\nYou will now receive investment reminders here. 🎉`,
      );

      return NextResponse.json({ ok: true });
    }

    // Handle plain /start (no code)
    if (text === '/start') {
      await sendTelegramMessage(
        chatId,
        `👋 Hi ${firstName}!\n\nTo link your account, go to <b>Settings → Telegram</b> in the Personal Banker app and click "Link Telegram Account".`,
      );
      return NextResponse.json({ ok: true });
    }

    // Default response for any other message
    await sendTelegramMessage(
      chatId,
      `Hi ${firstName}! I only send automated investment reminders. Visit the Personal Banker app to manage your account. 📊`,
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    // Always return 200 so Telegram doesn't retry
    return NextResponse.json({ ok: true });
  }
}

/**
 * Telegram sends a GET request when verifying the webhook URL.
 */
export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook is active' });
}
