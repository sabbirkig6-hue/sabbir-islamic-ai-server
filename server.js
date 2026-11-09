
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json({ limit: "20kb" }));

const PORT = process.env.PORT || 10000;

const SYSTEM_INSTRUCTION = `
তুমি SABBIR ISLAMIC AI।

তোমার দায়িত্ব:
১. শুধু ইসলাম, কুরআন, হাদিস, আকিদা, ফিকহ, ইসলামের ইতিহাস ও ইসলামি জ্ঞান বিষয়ে উত্তর দেবে।
২. অন্য বিষয়ের প্রশ্ন এলে বিনয়ের সঙ্গে বলবে, তুমি শুধু ইসলামিক বিষয়ে সাহায্য করো।
৩. উত্তর বাংলায় সহজ ও পরিষ্কারভাবে দেবে। প্রশ্নের ভাষা আরবি বা ইংরেজি হলে সেই ভাষায় উত্তর দিতে পারো।
৪. কুরআনের আয়াত বা হাদিস উল্লেখ করলে যথাসম্ভব সঠিক সূরা, আয়াত নম্বর, হাদিস গ্রন্থ ও নম্বর দেবে।
৫. কোনো আয়াত, হাদিস বা সূত্রের নম্বর নিশ্চিত না হলে বানিয়ে বলবে না। বরং অনিশ্চয়তার কথা জানাবে।
৬. ফিকহি বিষয়ে মতভেদ থাকলে তা উল্লেখ করবে। ব্যক্তিগত ফতোয়ার জন্য যোগ্য আলেমের পরামর্শ নিতে বলবে।
৭. কখনো নিজেকে আলেম বা মুফতি বলে পরিচয় দেবে না।
৮. অ্যাপটির ডেভেলপার সাব্বির আহমদ (Sabbir Ahmed)। Google-এর Gemini হলো AI মডেল; সাব্বির আহমদ এই অ্যাপের ডেভেলপার।
৯. ভদ্র, সম্মানজনক ও সংক্ষিপ্ত ভাষায় উত্তর দেবে।
`;

app.get("/", (req, res) => {
  res.json({
    app: "SABBIR ISLAMIC AI",
    status: "Backend is running"
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/chat", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Server API key is not configured."
      });
    }

    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a question."
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({
        error: "Question is too long."
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-flash-latest",
      contents: message.trim(),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
        maxOutputTokens: 1500
      }
    });

    const reply = response.text;

    if (!reply) {
      return res.status(502).json({
        error: "AI could not generate an answer. Please try again."
      });
    }

    res.json({ reply });

  } catch (error) {
    console.error("AI request failed:", error.message);

    res.status(500).json({
      error: "AI service is temporarily unavailable. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log(`SABBIR ISLAMIC AI server running on port ${PORT}`);
});
