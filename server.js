const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const app = express();
app.use(express.json());

// ENV переменные
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;


const bot = new TelegramBot(TELEGRAM_TOKEN);


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
        [{ text: "Работа (UKR/PESEL)", callback_data: "work_ukr" }],
        [{ text: "Учёба", callback_data: "study" }]
      ]
    }
  });
});

// обработка кнопок
bot.on("callback_query", async (query) => {
  bot.answerCallbackQuery(query.id);

  const chatId = query.message.chat.id;
  const product = query.data;

  let priceId;

  if (product === "work") {
    priceId = "price_1TFvpQ3SUQ4FdZ7StCgWGgQR";
  } else if (product === "work_ukr") {
    priceId = "price_1TFvnI3SUQ4FdZ7SefJD7dwk";
  } else if (product === "study") {
    priceId = "price_1TFetW3SUQ4FdZ7SvWS6IZhg";
  }

try {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: 'https://t.me/MY_LEGAZBOT',
    cancel_url: 'https://t.me/MY_LEGAZBOT'
  });

  await bot.sendMessage(chatId, `Оплати тут: ${session.url}`);

} catch (error) {
  console.error(error);
  await bot.sendMessage(chatId, 'Ошибка при создании оплаты');
}
