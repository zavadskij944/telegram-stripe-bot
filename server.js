const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const Stripe = require("stripe");

const app = express();
app.use(express.json());

// ENV переменные
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const STRIPE_SECRET = process.env.STRIPE_SECRET;

const bot = new TelegramBot(TELEGRAM_TOKEN);
const stripe = Stripe(STRIPE_SECRET);

// запуск webhook Telegram
bot.setWebHook(`${process.env.RENDER_EXTERNAL_URL}/bot${TELEGRAM_TOKEN}`);

// обработка сообщений
app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// старт
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Выбери продукт:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Работа", callback_data: "work" }],
        [{ text: "Работа (UKR/PSL)", callback_data: "work_ukr" }],
        [{ text: "Учёба", callback_data: "study" }]
      ]
    }
  });
});

// обработка кнопок
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const product = query.data;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: "price_1TFvpQ3SUQ4FdZ7StCgWGgQR",
        quantity: 1
      }
    ],
    mode: "payment",
    success_url: "https://t.me/MY_LEGAZBOT",
    cancel_url: "https://t.me/MY_LEGAZBOT",
    metadata: {
      telegram_id: chatId,
      product: product
    }
  });

  bot.sendMessage(chatId, `Оплати тут: ${session.url}`);
});

app.listen(3000, () => console.log("Server started"));
