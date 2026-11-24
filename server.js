
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

const ai = apiKey
  ? new GoogleGenAI({ apiKey })
  : null;

const chatModel =
  process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash';

// HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'LEVEL AI',
    aiConfigured: Boolean(ai),
    model: chatModel
  });
});

// CHAT
app.post('/api/chat', async (req, res) => {
  console.log('New chat request received');

  try {
    if (!ai) {
      console.error('GEMINI_API_KEY is missing');

      return res.status(503).json({
        error: 'Gemini API key is missing'
      });
    }

    const messages = Array.isArray(req.body.messages)
      ? req.body.messages
      : [];

    if (messages.length === 0) {
      return res.status(400).json({
        error: 'No messages provided'
      });
    }

    const contents = messages.slice(-40).map(message => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{
        text: String(message.content || '').slice(0, 12000)
      }]
    }));

    console.log('Sending request to Gemini...');
    console.log('Model:', chatModel);

    const response = await ai.models.generateContent({
      model: chatModel,
      contents
    });

    const answer = response.text || '';

    console.log('Gemini responded successfully');

    return res.json({
      text: answer
    });

  } catch (error) {
    console.error('========== GEMINI ERROR ==========');
    console.error('Message:', error.message);
    console.error('Status:', error.status || error.statusCode || 'Unknown');
    console.error('==================================');

    return res.status(500).json({
      error: 'Gemini request failed',
      details: String(error.message || 'Unknown error').slice(0, 1000)
    });
  }
});

// IMAGE GENERATION
app.post('/api/image', (req, res) => {
  res.status(501).json({
    error: 'Image generation is not configured yet'
  });
});

// START SERVER
const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
  console.log(`LEVEL AI backend listening on ${PORT}`);
  console.log(`Gemini configured: ${Boolean(ai)}`);
  console.log(`Gemini model: ${chatModel}`);
});
