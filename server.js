
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20kb" }));

app.get("/", (req, res) => {
    res.json({ status: "Studio AI Builder online" });
});

app.post("/generate", rateLimit({
    windowMs: 60000,
    limit: 10
}), async (req, res) => {
    try {
        if (!process.env.APP_ACCESS_TOKEN ||
            req.headers["x-app-token"] !== process.env.APP_ACCESS_TOKEN) {
            return res.status(401).json({
                error: "Acesso não autorizado."
            });
        }

        const prompt = req.body.prompt;

        if (!prompt || typeof prompt !== "string" ||
            prompt.length > 3000) {
            return res.status(400).json({
                error: "Pedido inválido."
            });
        }

        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const response = await client.responses.create({
            model: "gpt-5.5",
            instructions: "Você é especialista em Roblox Studio e Luau. Gere scripts completos e explique onde colocar cada script no Explorer.",
            input: prompt
        });

        res.json({ result: response.output_text });

    } catch (error) {
        res.status(500).json({
            error: "Erro ao gerar código."
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0");
