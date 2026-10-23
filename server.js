require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

app.get('/', (req, res) => {
    res.send('Roblox AI Server is running successfully!');
});

app.post('/generate-script', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ code: "-- الرجاء إدخال الوصف" });
        }

        if (!apiKey) {
            return res.status(500).json({ code: "-- خطأ: مفتاح API غير موجود" });
        }

        // استخدام الـ v1 المستقر والسريع جداً لتفادي الـ Timeout في روبلوكس
        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                system_instruction: {
                    parts: [{ text: "You are an expert Roblox Luau script writer. Generate ONLY raw executable Luau code without markdown codeblocks like ```luau or ```, and do not add explanatory text." }]
                }
            })
        });

        const data = await apiResponse.json();

        if (data.error) {
            console.error('Gemini API Error:', data.error);
            return res.status(500).json({ code: "-- خطأ من جوجل: " + (data.error.message || "Unknown error") });
        }

        const generatedCode = data.candidates?.[0]?.content?.parts?.[0]?.text || "-- لم يتم توليد أي كود";
        res.json({ code: generatedCode });
    } catch (error) {
        console.error('Error generating code:', error);
        res.status(500).json({ code: "-- خطأ في السيرفر: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
