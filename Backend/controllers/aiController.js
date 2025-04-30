import { dualGPTProcess } from '../services/openaiService.js';
import fs from 'fs';
import path from 'path';

// 🧠 Handles normal text messages from the doctor (typed questions)
export const handleAIRequest = async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).json({ error: 'Message is required.' });

    console.log("📨 Incoming Chat Prompt:", userMessage);
    const aiReply = await dualGPTProcess(userMessage);
    console.log("🤖 GPT Reply:", aiReply);

    res.json({ reply: aiReply });  // Must be 'reply' for frontend compatibility
  } catch (err) {
    console.error('❌ handleAIRequest error:', err);
    res.status(500).json({ error: 'AI request failed.' });
  }
};

// 📂 Handles image or file uploads from the doctor (X-rays, lab reports)
export const handleFileUpload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded.' });

    console.log("📂 File received:", file.originalname);

    const ext = path.extname(file.originalname).toLowerCase();
    const isPDF = ext === '.pdf';
    const isImage = ['.jpg', '.jpeg', '.png'].includes(ext);
    let content = '';

    if (isPDF) {
      content = "This is a lab report uploaded as a PDF. Due to safety limitations, the AI cannot parse raw PDF text. Please upload a screenshot or image for clinical analysis.";
    } else {
      const base64 = fs.readFileSync(file.path, { encoding: 'base64' });
      content = isImage
        ? `This is a base64-encoded medical image (X-ray, MRI, CT, ultrasound, or lab scan). Analyze and give a structured clinical diagnosis:\n\n${base64}`
        : `This is a base64-encoded medical document. If readable, extract and analyze clinical findings:\n\n${base64}`;
    }

    const aiReply = await dualGPTProcess(content);
    res.json({ reply: aiReply });

  } catch (err) {
    console.error('❌ File Upload Error:', err);
    res.status(500).json({ error: '🩺 ⚠️ Error getting AI response.' });
  }
};


