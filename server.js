
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();

app.use(cors({
  origin: [
    'https://kushjotdhaliwal-cell.github.io'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '2mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const chatModel = process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash';

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'LEVEL AI' });
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({ error: 'Missing GEMINI_API_KEY' });
    }

    const messages = Array.isArray(req.body.messages)
      ? req.body.messages
      : [];

    const contents = messages.slice(-40).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '').slice(0, 12000) }]
    }));

    if (!contents.length) {
      return res.status(400).json({ error: 'No messages provided' });
    }

    const response = await ai.models.generateContent({
      model: chatModel,
      contents
    });

    res.json({ text: response.text || '' });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'AI request failed. Check Render logs.' });
  }
});

app.post('/api/image', (_req, res) => {
  res.status(501).json({
    error: 'Image generation is not configured yet.'
  });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`LEVEL AI backend listening on ${port}`);
});
