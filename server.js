
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();

app.use(cors({
  origin: ['https://kushjotdhaliwal-cell.github.io'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '2mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const chatModel =
  process.env.GEMINI_CHAT_MODEL || 'gemini-3.8-flash';

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'LEVEL AI',
    aiConfigured: Boolean(ai),
    model: chatModel
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is missing'
      });
    }

    const messages = Array.isArray(req.body.messages)
      ? req.body.messages
      : [];

    if (!messages.length) {
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

    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        console.log(`Gemini attempt ${attempt}/4`);

        const response = await ai.models.generateContent({
          model: chatModel,
          contents
        });

        return res.json({
          text: response.text || ''
        });

      } catch (error) {
        const status = Number(
          error.status || error.statusCode || 0
        );

        console.error('Gemini error:', status, error.message);

        const retryable = [429, 500, 502, 503, 504].includes(status);

        if (!retryable || attempt === 4) {
          if (status === 503 || status === 429) {
            return res.status(status).json({
              error: 'Google AI is very busy. Please try again in a minute.'
            });
          }

          return res.status(500).json({
            error: 'Gemini error: ' +
              String(error.message || 'Unknown error').slice(0, 500)
          });
        }

        await sleep(1500 * Math.pow(2, attempt - 1));
      }
    }

  } catch (error) {
    console.error('Server error:', error);

    return res.status(500).json({
      error: 'LEVEL AI backend error'
    });
  }
});

app.post('/api/image', (req, res) => {
  res.status(501).json({
    error: 'Image generation is not configured yet'
  });
});

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
  console.log(`LEVEL AI backend listening on ${PORT}`);
  console.log(`Gemini configured: ${Boolean(ai)}`);
  console.log(`Gemini model: ${chatModel}`);
});

