import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function dualGPTProcess(prompt) {
  try {
    const isImagePrompt = prompt.includes("base64-encoded medical image") || prompt.length > 50000;
    const isBase64 = prompt.length > 10000 || /^([A-Za-z0-9+/=]{500,})$/.test(prompt.trim());

    let summarized = prompt;

    if (!isImagePrompt && (isBase64 || prompt.includes("Hemoglobin"))) {
      console.log("🧠 Sending to GPT-3.5 for summarization...");
      const summaryResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a medical assistant. You are receiving a base64-encoded image or long lab report text. Extract and summarize all visible clinical values or medical information. If the input is too vague, generate a general fallback clinical summary. Do not respond with refusal.'
          },
          { role: 'user', content: prompt }
        ]
      });
      summarized = summaryResponse?.choices?.[0]?.message?.content || prompt;
    }

    const isClinical = /symptom|diagnos|treatment|cbc|x[- ]?ray|mri|ultrasound|scan|infection|tumor|lab/i.test(summarized);

    const finalPrompt = isClinical
      ? `You are MediVista — an advanced AI doctor for hospitals and clinics. Always respond as a real medical doctor would. Do not say “I’m not a doctor.” Instead, analyze like a professional and follow this format:

---
**Diagnosis:**
[Clinical impression]

---
**💊 Recommended Treatment:**
[Explain treatment approach]

---
**💉 Prescribed Medicines (with dosage, times/day, duration):**
[List each medicine]

---
**📝 Additional Recommendations:**
[Follow-up, lifestyle, referrals, etc.]

Based on:
${summarized}`
      : summarized;

    console.log("🧠 Sending to GPT-4o for final answer...");

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: isClinical
            ? 'You are MediVista, an AI doctor. Always respond as a licensed medical professional using structured format. Never say you are not a doctor.'
            : 'You are a helpful assistant.'
        },
        { role: 'user', content: finalPrompt }
      ],
      temperature: 0.4
    });

    const reply = response?.choices?.[0]?.message?.content;
    return reply || "⚠️ AI did not return a valid response.";

  } catch (error) {
    console.error('❌ dualGPTProcess Error:', error.message);
    return '⚠️ AI Error: Could not generate response.';
  }
}

