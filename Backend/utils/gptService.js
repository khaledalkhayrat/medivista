import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const askMedicalAI = async (message) => {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI medical assistant. Provide professional, accurate medical guidance.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('GPT-4 API error:', error.response?.data || error.message);
    throw new Error('Failed to get AI response');
  }
};
