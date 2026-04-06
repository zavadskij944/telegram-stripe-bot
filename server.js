const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const app = express();
app.use(express.json());

// ENV переменные
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHANNEL_WORK = "-1003739662020";
const CHANNEL_WORK_UKR = "-1003794594810";
const CHANNEL_STUDY = "-1003887230146";

const bot = new TelegramBot(TELEGRAM_TOKEN);


// запуск webhook Telegram
bot.setWebHook(`${process.env.RENDER_EXTERNAL_URL}/bot${TELEGRAM_TOKEN}`);

// обработка сообщений
app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});
// старт 

 bot.onText(/\/start(.*)/, (msg, match) => {
   const chatId = msg.chat.id;
const source = match[1];

if (source === "fb") {
    bot.sendMessage(chatId, "📲 Вы пришли с Facebook");
}

 const text = `👋 Добро пожаловать!

Рады приветствовать вас в нашем Telegram-боте 🇵🇱

Здесь вы найдёте актуальную и проверенную информацию для подачи на временное пребывание (ВНЖ) в Польше.

📢 Важно: изменения в подаче на карту побыта

В Польше планируется переход на полностью электронную систему подачи заявлений (MOS 2.0).

👉 В будущем подача будет происходить только онлайн.

❗ На данный момент:
— система ещё НЕ введена  
— точные даты запуска пока не объявлены  
— подача по текущим правилам продолжается  

📌 О запуске сообщат минимум за 14 дней.

👉 Мы сразу уведомим вас и покажем, как подаваться по новой системе.

🔄 Важно для вас:
После запуска электронной системы мы полностью обновим все материалы:
— новые инструкции  
— обновлённые образцы  
— пошаговая подача онлайн  

✅ Если у вас уже есть доступ — всё обновится автоматически, без доплат.

Мы собрали для вас только полезные материалы:
✔ актуальные требования с официальных источников  
✔ пошаговые инструкции  
✔ образцы заполнения внеска  

📁 работы  
📄 работы со статусом UKR (PESEL/UKR)  
🎓 учёбы  

⚠️ Обратите внимание:
Мы не предоставляем юридические услуги.
Информация основана на официальных источниках и личном опыте.
Мы не гарантируем результат и не несем ответственности за решение уженда.
Но с нами у вас будет больше шансов избежать ошибок ✅ 
  
👇 Выберите нужный вариант:`;

  bot.sendMessage(msg.chat.id, text, {
    reply_markup: {
     inline_keyboard: [
  [
    { text: "🏙 Познань", callback_data: "city_poznan" },
    { text: "🏙 Вроцлав", callback_data: "city_wroclaw" }
  ]
]
    }
  });

});
bot.on("channel_post", (msg) => {
  console.log("CHANNEL ID:", msg.chat.id);
});
 

// обработка кнопок
bot.on("callback_query", async (query) => {
  bot.answerCallbackQuery(query.id);

  const chatId = query.message.chat.id;
  let data = query.data;
  
  if (data === "wroclaw_work") data = "poznan_work";
if (data === "wroclaw_study") data = "poznan_study";

  // =====================
  // ВЫБОР ГОРОДА
  // =====================

  if (data === "city_poznan") {
    return bot.sendMessage(chatId, "📍 Познань\n👇 Выберите вариант:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "💼 Работа", callback_data: "poznan_work" },
            { text: "📄 PESEL UKR", callback_data: "poznan_work_ukr" }
          ],
          [
            { text: "🎓 Учёба", callback_data: "poznan_study" }
          ]
        ]
      }
    });
  }

  if (data === "city_wroclaw") {
    return bot.sendMessage(chatId, "📍 Вроцлав\n👇 Выберите вариант:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "💼 Работа", callback_data: "wroclaw_work" }
          ],
          [
            { text: "🎓 Учёба", callback_data: "wroclaw_study" }
          ]
        ]
      }
    });
  }

if (data === "wroclaw_work") data = "poznan_work";
if (data === "wroclaw_study") data = "poznan_study";

  // =====================
  // PRICE ID
  // =====================

  let priceId;
  let product;

  // ПОЗНАНЬ
  if (data === "poznan_work") {
    priceId = "price_1TFvpQ3SUQ4FdZ7StCgWGgQR";
    product = "poznan_work";
  } else if (data === "poznan_work_ukr") {
    priceId = "price_1TFvnI3SUQ4FdZ7SefJD7dwk";
    product = "poznan_work_ukr";
  } else if (data === "poznan_study") {
    priceId = "price_1TFetW3SUQ4FdZ7SvWS6IZhg";
    product = "poznan_study";
  }

  // ВРОЦЛАВ
  else if (data === "wroclaw_work") {
    priceId = "price_1TIwHS3SUQ4FdZ7Szo5OvMQ4";
    product = "wroclaw_work";
  } else if (data === "wroclaw_study") {
    priceId = "price_1TIwJw3SUQ4FdZ7SIWMVxQkC";
    product = "wroclaw_study";
  }

  if (!priceId) return;

  // =====================
  // STRIPE ОПЛАТА
  // =====================

  try {
    const session = await stripe.checkout.sessions.create({
  mode: 'payment',

  payment_method_types: ['card', 'blik'],

  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],

  success_url: 'https://t.me/YOUR_BOT',
  cancel_url: 'https://t.me/YOUR_BOT',

  metadata: {
    chatId: chatId,
    product: product,
  },
});

   await bot.sendMessage(chatId, `📄 Оплата доступа:

${session.url}

После оплаты вы получите доступ в закрытый Telegram-канал, где есть:
📌 Пошаговая инструкция по заполнению Wnioska  
📄 Готовые шаблоны документов  
📋 Чек-лист для подачи на карту побыту  
✅ Актуальные требования без лишней информации  

🔒 Оплата проходит через Stripe (BLIK / Apple Pay / карта)  
🛡️ Данные карты защищены и не передаются третьим лицам  

⚡ Доступ выдается автоматически в течение 1–2 минут  

📩 Поддержка: pobyt.help@outlook.com`);
  } catch (error) {
    console.error(error);
    await bot.sendMessage(chatId, "❌ Ошибка при создании оплаты");
  }
});

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const event = JSON.parse(req.body.toString());

if (event.type === 'checkout.session.completed') {
  const session = event.data.object;

  const chatId = session.metadata.chatId;
  const product = session.metadata.product;

  let channelId;

 // ===== ПОЗНАНЬ =====
if (product === 'poznan_work') {
  channelId = -1003739662020;
} else if (product === 'poznan_work_ukr') {
  channelId = -1003794594810;
} else if (product === 'poznan_study') {
  channelId = -1003887230146;

// ===== ВРОЦЛАВ =====
} else if (product === 'wroclaw_work') {
  channelId = -1003766614983;
} else if (product === 'wroclaw_study') {
  channelId = -1003611977453;
}
  try {
    const invite = await bot.createChatInviteLink(channelId, {
      member_limit: 1,
      expire_date: Math.floor(Date.now() / 1000) + 3600
    });

    await bot.sendMessage(
  chatId,
  `✅ Оплата прошла!\nВот доступ в канал:\n${invite.invite_link}`
);
    
  } catch (err) {
    console.error(err);
  }

  res.sendStatus(200);
}
});
app.listen(3000, () => {
  console.log("Server started");
});
