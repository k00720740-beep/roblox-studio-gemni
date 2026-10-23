require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is missing!");
}

app.get('/', (req, res) => {
    res.send('Roblox AI Server is running successfully!');
});

app.post('/generate-script', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'الرجاء إدخال الوصف' });
        }

        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
            return res.status(500).json({ error: data.error.message || 'خطأ من بوابة الذكاء الاصطناعي' });
        }

        const generatedCode = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
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
