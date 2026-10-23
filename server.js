require('dotenv').config();
const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());

// التحقق من وجود مفتاح الـ API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("تحذير: مفتاح GEMINI_API_KEY غير موجود في متغيرات البيئة!");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// مساحة اختبار للتأكد أن السيرفر يعمل
app.get('/', (req, res) => {
    res.send('Roblox AI Server is running successfully!');
});

app.post('/generate-script', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'الرجاء إدخال الوصف' });
        }

        const systemInstruction = "You are an expert Roblox Luau developer. Return ONLY valid executable Luau code without markdown blocks or markdown formatting if possible, or clean Luau code.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        const generatedCode = response.text;
        res.json({ code: generatedCode });
    } catch (error) {
        console.error('Error generating code:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
