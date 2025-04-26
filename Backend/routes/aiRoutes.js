
import express from 'express';
import multer from '../multer.js';
import fs from 'fs';
import path from 'path';
import { handleAIRequest } from '../controllers/aiController.js';
import { dualGPTProcess } from '../services/openaiService.js';

const router = express.Router();

router.post('/ask', handleAIRequest);

router.post('/upload', multer.single('file'), async (req, res) => {
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
      content = `This is a base64-encoded medical image (such as X-ray, MRI, CT, or lab scan). Analyze the image and provide a structured clinical summary:

${base64}`;
    } else {
      const base64 = fs.readFileSync(file.path, { encoding: 'base64' });
      content = `This is a base64-encoded medical file. If it contains readable information, analyze clinically:

${base64}`;
    }

    const reply = await dualGPTProcess(content);

    res.json({ reply });
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ error: '🩺 ⚠️ Error getting AI response.' });
  }
});

export default router;
