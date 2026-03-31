import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  const event = req.body;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const telegramId = session.metadata.telegram_id;

    const BOT_TOKEN = "ВСТАВЬ_СЮДА_ТОКЕН_БОТА";

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: telegramId,
        text: "✅ Оплата прошла! Напиши сюда 'ДОСТУП', чтобы получить канал",
      }),
    });
  }

  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Server works!");
});

app.listen(10000, () => console.log("Server started"));
