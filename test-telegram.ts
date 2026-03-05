import { config } from 'dotenv';
import path from 'path';

// Load .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

async function testTelegram() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  console.log('Testing Telegram with:');
  console.log('Token:', token ? '✅ Found' : '❌ NOT FOUND');
  console.log('Chat ID:', chatId ? '✅ Found' : '❌ NOT FOUND');

  if (!token || !chatId) {
    console.error('Missing environment variables in .env.local');
    process.exit(1);
  }

  const appUrl = 'https://personal-banker-niko.vercel.app/investments';
  const message =
    `🚨 <b>Urgent: Investment Expiring Tomorrow!</b>\n\n` +
    `Hi Nikolaj,\n\n` +
    `2 investments are expiring in 1 day:\n\n` +
    `• <b>Energbank</b> 💰 MDL 50,000 | 📈 7.2% 📅 Expires: 6 March 2026\n\n` +
    `• <b>Microinvest</b> 💰 MDL 25,000 | 📈 5.8% 📅 Expires: 6 March 2026\n\n` +
    `🔗 Check your <a href="${appUrl}">dashboard</a>`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('✅ Success! Check your Telegram.');
    } else {
      console.error('❌ Failed:', data);
    }
  } catch (error) {
    console.error('❌ Error sending message:', error);
  }
}

testTelegram();
