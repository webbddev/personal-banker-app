'use server';

import { checkUser } from '@/lib/checkUser';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

/**
 * Gets the current user's Telegram linking status.
 */
export async function getTelegramStatus() {
  const user = await checkUser();
  if (!user) return { linked: false, error: 'Not authenticated' };

  return {
    linked: !!user.telegramChatId,
    chatId: user.telegramChatId ?? null,
  };
}

/**
 * Generates a unique connection code for the user so they can link
 * their Telegram account by sending `/start <code>` to the bot.
 * Returns a deep link URL the user can click.
 */
export async function generateTelegramConnectionCode() {
  const user = await checkUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Generate a short, URL-safe code
  const code = `connect_${randomBytes(12).toString('hex')}`;

  await prisma.user.update({
    where: { id: user.id },
    data: { telegramConnectionCode: code },
  });

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim();

  if (!botUsername) {
    console.error('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is not set.');
    return {
      success: false,
      error: 'Telegram bot username is not configured on the server.',
    };
  }

  const deepLink = `https://t.me/${botUsername}?start=${code}`;

  return { success: true, deepLink, code };
}

/**
 * Removes the Telegram link from the current user's account.
 */
export async function unlinkTelegramAccount() {
  const user = await checkUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      telegramChatId: null,
      telegramConnectionCode: null,
    },
  });

  return { success: true };
}
