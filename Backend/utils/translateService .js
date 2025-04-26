import axios from 'axios';

export const translateText = async (text, targetLang) => {
  try {
    const response = await axios.post('https://libretranslate.de/translate', {
      q: text,
      source: 'auto',
      target: targetLang,
      format: 'text',
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    return response.data.translatedText;
  } catch (error) {
    console.error('LibreTranslate API error:', error.response?.data || error.message);
    throw new Error('Failed to translate text');
  }
};
