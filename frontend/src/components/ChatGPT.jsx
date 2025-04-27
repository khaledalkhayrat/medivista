import React, { useState, useRef } from 'react';
import axios from 'axios';

const ChatGPT = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await axios.post('https://medivista-1.onrender.com/api/ai/ask', {   // 🔥 Changed URL here
        message: newMessages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')
      });

      const reply = res?.data?.reply || "⚠️ No response from AI.";
      console.log("🧠 AI Reply:", reply);

      if (reply) {
        setMessages([...newMessages, { role: 'assistant', content: reply }]);
      }
    } catch (err) {
      console.error('❌ Chat error:', err);
      setMessages([...newMessages, { role: 'assistant', content: "❌ Error contacting the AI. Please try again." }]);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('https://medivista-1.onrender.com/api/ai/upload', formData); // 🔥 Changed URL here
      const reply = res?.data?.reply || "⚠️ No response from AI.";
      setMessages([...messages, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Upload error:', error);
      setMessages([...messages, { role: 'assistant', content: "❌ Error analyzing file." }]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const renderResponse = (msg, index) => {
    if (
      msg.role === 'assistant' &&
      typeof msg.content === 'string' &&
      /\*\*Diagnosis:\*\*/.test(msg.content)
    ) {
      const blocks = msg.content.split(/---+/).map((b, i) => (
        <div key={i} className="mb-4 p-3 bg-gray-100 rounded shadow whitespace-pre-wrap">
          {b.trim()}
        </div>
      ));
      return <div key={index}>{blocks}</div>;
    }
    return (
      <div key={index} className="mb-2 whitespace-pre-wrap">
        <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content || "⚠️ Empty response"}
      </div>
    );
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="border p-4 rounded bg-white h-[400px] overflow-y-auto">
        {messages.map(renderResponse)}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded p-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Upload File
        </button>
        <button
          onClick={() => cameraInputRef.current.click()}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Camera
        </button>
        <input
          type="file"
          accept="image/*,.pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatGPT;


