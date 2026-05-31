import express from 'express';
import cors from 'cors';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder']
}));
app.use(express.json());

// API: Get transcript by video ID
app.get('/api/transcript/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // Fetch transcript using youtube-transcript package
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
    
    // Map data to a cleaner format
    const formattedTranscript = transcript.map((item, index) => ({
      id: index + 1,
      text: item.text.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      start: item.offset / 1000, // Convert ms to seconds
      end: (item.offset + item.duration) / 1000
    }));

    res.json({
      success: true,
      data: formattedTranscript
    });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transcript. The video might not have English subtitles.',
      error: error.message
    });
  }
});

// API: Gemini Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, systemInstruction } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is not configured.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction 
    });

    const chatSession = model.startChat({ history: history || [] });
    const result = await chatSession.sendMessage(message);
    const aiResponseText = result.response.text();

    res.json({
      success: true,
      text: aiResponseText
    });
  } catch (error) {
    console.error('Error with Gemini AI:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate response.',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 EchoEnglish API is running on http://localhost:${PORT}`);
});
