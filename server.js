require('dotenv').config();
const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is missing!");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

app.get('/', (req, res) => {
    res.send('Roblox AI Server is running successfully!');
});

app.post('/generate-script', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'الرجاء إدخال الوصف' });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert Roblox Luau script writer. Generate ONLY raw executable Luau code. Do not use markdown codeblocks like ```luau or ```, and do not add explanatory text.",
            }
        });

        const generatedCode = response.text || "";
        res.json({ code: generatedCode });
    } catch (error) {
        console.error('Error generating code:', error);
        res.status(500).json({ error: error.message || 'حدث خطأ في السيرفر' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
