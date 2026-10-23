require('dotenv').config();
const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

app.get('/', (req, res) => {
    res.send('Roblox AI Server is running successfully!');
});

app.post('/generate-script', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.json({ code: "-- خطأ: الرجاء إدخال الوصف" });
        }

        if (!apiKey) {
            return res.json({ code: "-- خطأ: مفتاح API غير موجود في إعدادات Render" });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert Roblox Luau script writer. Generate ONLY raw executable Luau code without markdown codeblocks like ```luau or ```, and do not add explanatory text."
            }
        });

        const generatedCode = response.text || "-- لم يتم توليد أي كود";
        res.json({ code: generatedCode });
    } catch (error) {
        console.error('Error generating code:', error);
        res.json({ code: "-- خطأ في السيرفر: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
