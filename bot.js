const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const token = process.env.BOT_TOKEN;
const channel = "@IMBASQUAD812";
const miniAppUrl = "https://white-pine-e3c6.shnikovkirill1990.workers.dev/";

const bot = new TelegramBot(token, { polling: true });

async function isSubscribed(userId) {
  try {
    const member = await bot.getChatMember(channel, userId);
    return ["member", "administrator", "creator"].includes(member.status);
  } catch {
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
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  if (query.data === "check") {
    await bot.answerCallbackQuery(query.id, { text: "Проверяю подписку..." });

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
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Бот запущен");
});
