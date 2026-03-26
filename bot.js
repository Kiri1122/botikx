const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const token = process.env.BOT_TOKEN;
const channel = "@IMBASQUAD812";
const miniAppUrl = "https://white-pine-e3c6.shnikovkirill1990.workers.dev/";
const PORT = process.env.PORT || 3000;

if (!token) {
  console.error("BOT_TOKEN не найден в переменных окружения");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", (err) => {
  console.error("Polling error:", err?.response?.body || err?.message || err);
});

bot.on("error", (err) => {
  console.error("Bot error:", err?.response?.body || err?.message || err);
});

async function isSubscribed(userId) {
  try {
    const numericUserId = Number(userId);

    if (!numericUserId) {
      console.error("Некорректный userId:", userId);
      return false;
    }

    console.log("Checking subscription for user:", numericUserId);

    const member = await bot.getChatMember(channel, numericUserId);

    console.log("Telegram member status for", numericUserId, "=", member.status);

    return ["member", "administrator", "creator"].includes(member.status);
  } catch (err) {
    console.error(
      "isSubscribed error for user",
      userId,
      ":",
      err?.response?.body || err?.message || err
    );
    return false;
  }
}

app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.get("/check-subscription", async (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({
      subscribed: false,
      error: "user_id is required"
    });
  }

  console.log("Incoming /check-subscription for user:", userId);

  try {
    const subscribed = await isSubscribed(userId);

    return res.json({
      subscribed
    });
  } catch (err) {
    console.error(
      "/check-subscription route error:",
      err?.response?.body || err?.message || err
    );

    return res.status(500).json({
      subscribed: false,
      error: "subscription check failed"
    });
  }
});

bot.onText(/\/start/, async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

  try {
    const subscribed = await isSubscribed(userId);

    if (subscribed) {
      await bot.sendMessage(chatId, "✅ Подписка подтверждена", {
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
      await bot.sendMessage(chatId, "Подпишись на канал:", {
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
  } catch (err) {
    console.error("/start error:", err?.response?.body || err?.message || err);

    await bot.sendMessage(chatId, "⚠️ Ошибка. Попробуй ещё раз.");
  }
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  if (query.data === "check") {
    try {
      await bot.answerCallbackQuery(query.id, {
        text: "Проверяю подписку..."
      });

      const subscribed = await isSubscribed(userId);

      if (subscribed) {
        await bot.sendMessage(chatId, "✅ Подписка подтверждена", {
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
        await bot.sendMessage(chatId, "❌ Ты ещё не подписан");
      }
    } catch (err) {
      console.error("callback_query error:", err?.response?.body || err?.message || err);

      await bot.sendMessage(chatId, "⚠️ Ошибка проверки подписки. Попробуй ещё раз.");
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Бот запущен");
});
