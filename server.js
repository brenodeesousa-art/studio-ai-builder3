
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
        const prompt = req.body.prompt;

        if (!prompt || typeof prompt !== "string") {
            return res.status(400).json({
                error: "Digite um pedido válido."
            });
        }

        if (prompt.length > 3000) {
            return res.status(400).json({
                error: "Pedido muito grande."
            });
        }

        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const response = await client.responses.create({
            model: "gpt-5.5",
            instructions: "Você é especialista em Roblox Studio e Luau. Gere scripts completos, explique onde colocar cada script e como organizar o Explorer. Nunca diga que alterou o projeto.",
            input: prompt
        });

        res.json({
            result: response.output_text
        });

    } catch (error) {
        res.status(500).json({
            error: "Erro ao gerar código."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0");
