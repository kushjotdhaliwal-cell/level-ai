import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json({limit:'2mb'}));
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({apiKey}) : null;
const chatModel = process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash';

app.get('/health',(_req,res)=>res.json({ok:true,service:'LEVEL AI'}));
app.post('/api/chat',async(req,res)=>{
  try {
    if(!ai) return res.status(503).json({error:'Backend is missing GEMINI_API_KEY'});
    const messages=Array.isArray(req.body.messages)?req.body.messages:[];
    const contents=messages.slice(-40).map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:String(m.content||'').slice(0,12000)}]}));
    if(!contents.length) return res.status(400).json({error:'No messages provided'});
    const response=await ai.models.generateContent({model:chatModel,contents});
    res.json({text:response.text||''});
  } catch(err) {
    console.error('chat error',err);
    res.status(500).json({error:'Chat request failed. Check the backend logs and API configuration.'});
  }
});
app.post('/api/image',async(_req,res)=>{
  // Image generation is intentionally not activated by default.
  // Configure and test a supported image model/provider here before enabling it.
  res.status(501).json({error:'Image generation provider is not configured yet.'});
});
const port=Number(process.env.PORT||3000);
app.listen(port,()=>console.log(`LEVEL AI backend listening on ${port}`));
