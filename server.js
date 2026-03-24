import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Chat API Route (Ported from Vercel api/chat.js)
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.modolo.ai/webhook/filmatix-chatbot';
  const webhookSecret = process.env.N8N_AUTH_SECRET || '';

  let botReply = '';
  let webhookSuccess = false;

  // 1. Try n8n Webhook
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (webhookSecret) {
      headers['x-api-key'] = webhookSecret;
    }

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, history }),
    });

    if (n8nResponse.ok) {
      const textData = await n8nResponse.text();
      try {
        const data = JSON.parse(textData);
        botReply = data.output || data.reply || data.message || data.response || data.text || (data.choices && data.choices[0]?.message?.content) || null;
        if (!botReply) botReply = typeof data === 'string' ? data : JSON.stringify(data);
      } catch (e) {
        botReply = textData;
      }
      botReply = String(botReply).replace(/<think>[\s\S]*?<\/think>\n?/g, '').trim();
      if (botReply) webhookSuccess = true;
    } else {
      console.warn(`[Proxy] Webhook returned status ${n8nResponse.status}`);
    }
  } catch (err) {
    console.warn('[Proxy] Webhook fetch failed:', err.message);
  }

  // 2. Fallback to Groq
  if (!webhookSuccess) {
    console.log('[Proxy] Falling back to Groq API...');
    const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    
    if (!groqKey) {
      return res.status(500).json({ error: 'Groq API Key not configured and Webhook failed.' });
    }
    
    try {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'qwen/qwen3-32b',
          messages: [
            { role: 'system', content: "You are the AI assistant for Filmatix, a high-end AI filmmaking and production studio. Keep your answers short, friendly, and concise. Only go into detailed explanations if explicitly asked. You are knowledgeable about Filmatix's anti-slop philosophy, AI-generated video and image services, and art-directed approach." },
            ...(history || []),
            { role: 'user', content: message }
          ],
          temperature: 0.7,
        }),
      });
      
      if (!groqResponse.ok) return res.status(502).json({ error: `Groq Fallback API Error: ${groqResponse.status}` });
      
      const groqData = await groqResponse.json();
      botReply = groqData.choices?.[0]?.message?.content || '';
      botReply = botReply.replace(/<think>[\s\S]*?<\/think>\n?/g, '').trim();
      
      if (!botReply) botReply = 'Sorry, I got an empty response from both Webhook and Fallback.';
    } catch (groqErr) {
      console.error('[Proxy] Groq API fallback failed:', groqErr);
      return res.status(500).json({ error: 'Both Webhook and Fallback failed.' });
    }
  }

  return res.status(200).json({ reply: botReply });
});

// Serve the compiled Vite React App frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Route all other requests back to React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Prod server is running on http://localhost:${PORT}`);
});
