INSTRUCTIONS:
1. Place these files in your MediVista backend.
2. Add this to your main server file (server.js):

   import aiRoutes from './routes/aiRoutes.js';
   app.use('/api', aiRoutes);

3. Replace the placeholder in .env with your actual OpenAI API key.
4. Now your platform uses GPT-4o for AI responses!

Contact support if you need frontend buttons or live test integration.