const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const channelUsername = "@IMBASQUAD812";
const miniAppUrl = "https://splendid-narwhal-222293.netlify.app";

const bot = new TelegramBot(token, { polling: true });

async function isSubscribed(userId) {
  try {
    const member = await bot.getChatMember(channelUsername, userId);
    return ["member", "administrator", "creator"].includes(member.status);
  } catch (error) {
    console.error("Ошибка проверки подписки:", error.message);
    return false;
  }
}

async function sendAccessMessage(chatId, userId) {
  const subscribed = await isSubscribed(userId);

  if (subscribed) {
    await bot.sendMessage(chatId, "✅ Подписка подтверждена. Открывай мини-апп:", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Открыть мини-апп",
              web_app: { url: miniAppUrl }
            }
          ]
        ]
      }
    });
  } else {
    await bot.sendMessage(
      chatId,
      "🔒 Чтобы пользоваться ботом, подпишись на канал IMBASQUAD:",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📢 Подписаться на канал",
                url: "https://t.me/IMBASQUAD812"
              }
            ],
            [
              {
                text: "🔄 Проверить подписку",
                callback_data: "check_sub"
              }
            ]
          ]
        }
      }
    );
  }
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  await sendAccessMessage(chatId, userId);
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  if (query.data === "check_sub") {
    await bot.answerCallbackQuery(query.id, {
      text: "Проверяю подписку..."
    });

    await sendAccessMessage(chatId, userId);
  }
});


console.log("Бот запущен...");

