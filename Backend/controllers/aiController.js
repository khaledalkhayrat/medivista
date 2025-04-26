
import { dualGPTProcess } from '../services/openaiService.js';
import fs from 'fs';
import path from 'path';

export const handleAIRequest = async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).json({ error: 'Message is required.' });

    console.log("📨 Incoming Chat Prompt:", userMessage);
    const aiReply = await dualGPTProcess(userMessage);
    console.log("🤖 GPT Reply:", aiReply);

    res.json({ reply: aiReply });
  } catch (err) {
    console.error('❌ handleAIRequest error:', err);
    res.status(500).json({ error: 'AI request failed.' });
  }
};

export const handleFileUpload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded.' });

    console.log("📂 File received:", file.originalname);

    const isPDF = path.extname(file.originalname).toLowerCase() === '.pdf';
    const isImage = ['.jpg', '.jpeg', '.png'].includes(path.extname(file.originalname).toLowerCase());
    let content = '';

    if (isPDF) {
      content = "This is a lab report uploaded as a PDF. Due to safety restrictions, we cannot extract raw text. Please provide a screenshot or image scan if detailed analysis is needed.";
    } else if (isImage) {
      const base64 = fs.readFileSync(file.path, { encoding: 'base64' });
      content = `This is a base64-encoded medical image (such as X-ray, MRI, CT, or lab scan). Analyze the image and provide a structured clinical summary:\n\n${base64}`;
    } else {
      const base64 = fs.readFileSync(file.path, { encoding: 'base64' });
      content = `This is a base64-encoded medical file. If it contains readable information, analyze clinically:\n\n${base64}`;
    }

    const aiReply = await dualGPTProcess(content);

    res.json({ reply: aiReply });
  } catch (err) {
    console.error('❌ File Upload Error:', err);
    res.status(500).json({ error: '🩺 ⚠️ Error getting AI response.' });
  }
};
