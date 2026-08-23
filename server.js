const TelegramBot = require("node-telegram-bot-api");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const CHANNEL_FREE = "https://t.me/+6XR0EeD-7JgzOTE6";

const bot = new TelegramBot(TELEGRAM_TOKEN, {
  polling: true
});

// СТАРТ
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`👋 Добро пожаловать!

Помогаем с подачей на карту побыта во Вроцлаве 🇵🇱

Выберите город:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📍 Poznań", callback_data: "city_poznan" }]
        ]
      }
    }
  );
});

// ОБРАБОТКА КНОПОК
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  bot.answerCallbackQuery(query.id);

  // выбор города
  if if (data === "city_poznan") {
    return bot.sendMessage(chatId,
`📍 Wrocław

Выберите основание:`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "💼 Работа", callback_data: "poznan_work" }],

          ]
        }
      }
    );
  }

  // переход в канал
if (data === "wroclaw_work" || data === "wroclaw_study") {
  return bot.sendMessage(chatId,
`📌 Вы получите:

— список документов  
— реальные примеры  
— частые ошибки  
— часть видео  

👉 Перейдите в канал:
${CHANNEL_FREE}`
  );
}
});
