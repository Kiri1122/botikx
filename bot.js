const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const channel = "@IMBASQUAD812";
const miniAppUrl = "https://splendid-narwhal-222293.netlify.app";

const bot = new TelegramBot(token, { polling: true });

async function isSubscribed(userId) {
  try {
    const member = await bot.getChatMember(channel, userId);
    return ["member", "administrator", "creator"].includes(member.status);
  } catch {
    return false;
  }
}

bot.onText(/\/start/, async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

  const subscribed = await isSubscribed(userId);

  if (subscribed) {
    bot.sendMessage(chatId, "✅ Подписка подтверждена", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "PLAY SKATE",
              web_app: { url: miniAppUrl }
            }
          ]
        ]
      }
    });
  } else {
    bot.sendMessage(chatId, "Подпишись на канал:", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Подписаться",
              url: "https://t.me/IMBASQUAD812"
            }
          ],
          [
            {
              text: "Проверить подписку",
              callback_data: "check"
            }
          ]
        ]
      }
    });
  }
});

bot.on("callback_query", async (query) => {
  const userId = query.from.id;
  const chatId = query.message.chat.id;

  const subscribed = await isSubscribed(userId);

  if (subscribed) {
    bot.sendMessage(chatId, "✅ Подписка подтверждена", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "PLAY SKATE",
              web_app: { url: miniAppUrl }
            }
          ]
        ]
      }
    });
  } else {
    bot.sendMessage(chatId, "❌ Ты ещё не подписан");
  }
});
