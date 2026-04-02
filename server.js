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

 bot.onText(/\/start/, (msg) => {

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

📁 работы  
📄 работы со статусом UKR (PESEL/UKR)  
🎓 учёбы  

👇 Выберите нужный вариант:

Мы собрали для вас только полезные материалы:
✔ актуальные требования с официальных источников  
✔ пошаговые инструкции  
✔ образцы заполнения внеска  

⚠️ Обратите внимание:
Мы не предоставляем юридические услуги.
Информация основана на официальных источниках и личном опыте.
Мы не гарантируем результат и не несем ответственности за решение уженда.
Но с нами у вас будет больше шансов избежать ошибок ✅
`;

  bot.sendMessage(msg.chat.id, text, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "💼 Работа", callback_data: "work" },
          { text: "📄 UKR/PSL", callback_data: "work_ukr" }
        ],
        [
          { text: "🎓 Учёба", callback_data: "study" }
        ]
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
  cancel_url: 'https://t.me/MY_LEGAZBOT',

  metadata: {
    chatId: chatId,
    product: product
  }
});

 await bot.sendMessage(chatId, `
📁 Оплата доступа:

${session.url}

После оплаты вы получите автоматический доступ в закрытый Telegram-канал, где будет:

📌 Пошаговая видео-инструкция по заполнению Wnioska  
📄 Готовый образец заполнения заявления  
📑 Полный чек-лист документов для подачи на временное жительство (карта побыта)  
✅ Актуальные требования и разбор без лишней информации  

🔐 Доступ выдается автоматически сразу после оплаты.

Нажимая на ссылку, вы переходите к оплате, после которой бот отправит вам доступ в канал.
`);
} catch (error) {
  console.error(error);
  await bot.sendMessage(chatId, 'Ошибка при создании оплаты');
}
});

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const event = JSON.parse(req.body.toString());

if (event.type === 'checkout.session.completed') {
  const session = event.data.object;

  const chatId = session.metadata.chatId;
  const product = session.metadata.product;

  let channelId;

  if (product === 'work') {
    channelId = CHANNEL_WORK;
  } else if (product === 'work_ukr') {
    channelId = CHANNEL_WORK_UKR;
  } else if (product === 'study') {
    channelId = CHANNEL_STUDY;
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
