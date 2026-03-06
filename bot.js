const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const token = process.env.BOT_TOKEN;
const channel = "@IMBASQUAD812";
const miniAppUrl = "https://splendid-narwhal-222293.netlify.app";

const bot = new TelegramBot(token, { polling: true });

async function isSubscribed(userId) {
  try {
    const member = await bot.getChatMember(channel, userId);
    return ["member", "administrator", "creator"].includes(member.status);
  } catch (error) {
    return false;
  }
}

app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.get("/check-subscription", async (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ subscribed: false, error: "user_id is required" });
  }

  const subscribed = await isSubscribed(userId);
  return res.json({ subscribed });
});

bot.onText(/\/start/, async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

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
    await bot.sendMessage(chatId, "🔒 Чтобы пользоваться ботом, подпишись на канал IMBASQUAD:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📢 Подписаться на канал", url: "https://t.me/IMBASQUAD812" }],
          [{ text: "🔄 Проверить подписку", callback_data: "check_sub" }]
        ]
      }
    });
  }
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  if (query.data === "check_sub") {
    await bot.answerCallbackQuery(query.id, { text: "Проверяю подписку..." });

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
      await bot.sendMessage(chatId, "❌ Подписка пока не найдена. Подпишись и попробуй снова.");
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Бот запущен");
});
