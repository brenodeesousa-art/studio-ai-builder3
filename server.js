
import express from "express";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";

const app = express();

app.use(express.json({ limit: "20kb" }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10
});

app.use("/chat", limiter);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("Studio AI Builder online!");
});

app.post("/chat", async (req, res) => {
  try {
    const token = req.headers["x-app-access-token"];

    if (!process.env.APP_ACCESS_TOKEN ||
        token !== process.env.APP_ACCESS_TOKEN) {
      return res.status(401).json({
        error: "Acesso não autorizado."
      });
    }

    const message = req.body?.message;

    if (typeof message !== "string" ||
        message.trim().length === 0 ||
        message.length > 4000) {
      return res.status(400).json({
        error: "Mensagem inválida."
      });
    }

    const response = await openai.responses.create({
      model: "gpt-6-luna",
      instructions:
        "Você é a Studio AI Builder, uma IA especialista em Roblox Studio e Luau. " +
        "Ajude a criar sistemas, corrigir erros e explicar onde colocar scripts. " +
        "Quando pedirem código, forneça o código completo, pronto para copiar. " +
        "Nunca diga que instalou ou executou scripts no projeto.",
      input: message
    });

    res.json({
      reply: response.output_text
    });

  } catch (error) {
    res.status(500).json({
      error: "Não consegui responder agora. Tente novamente."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0");
