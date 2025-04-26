
import React, { useState, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const MedicalAssistantLayout = () => {
  const [chats, setChats] = useState([{ id: uuidv4(), messages: [] }]);
  const [currentChatId, setCurrentChatId] = useState(chats[0].id);
  const [input, setInput] = useState("");
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const currentChat = chats.find(chat => chat.id === currentChatId);

  const updateChatMessages = (chatId, messages) => {
    setChats(prev =>
      prev.map(chat => chat.id === chatId ? { ...chat, messages } : chat)
    );
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...currentChat.messages, userMsg];
    updateChatMessages(currentChatId, newMessages);
    setInput("");

    try {
      const res = await axios.post("/api/ai/ask", {
        message: newMessages.map(m => (m.role === "user" ? "User: " : "AI: ") + m.content).join("\n")
      });
      const reply = res?.data?.reply || "⚠️ No response from AI.";
      updateChatMessages(currentChatId, [...newMessages, { role: "ai", content: reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      updateChatMessages(currentChatId, [...newMessages, { role: "ai", content: "❌ Error contacting the AI." }]);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("/api/ai/upload", formData);
      const reply = res?.data?.reply || "⚠️ No response from AI.";
      updateChatMessages(currentChatId, [...currentChat.messages, { role: "ai", content: reply }]);
    } catch (err) {
      console.error("Upload error:", err);
      updateChatMessages(currentChatId, [...currentChat.messages, { role: "ai", content: "❌ Error analyzing file." }]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const renderResponse = (msg, idx) => {
    if (msg.role === "ai" && msg.content.includes("**Diagnosis:**")) {
      return msg.content.split(/---+/).map((section, i) => (
        <div key={i} className="bg-white p-4 border rounded-xl shadow text-gray-800 whitespace-pre-wrap text-[15px] mb-4">
          {section.trim()}
        </div>
      ));
    }
    return (
      <div key={idx} className={`p-3 rounded-xl ${msg.role === "user" ? "bg-blue-100" : "bg-gray-100"} shadow mb-2`}>
        <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.content}
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-white shadow p-4 border-r overflow-y-auto">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-purple-700">Chats</h2>
          <button
            className="bg-purple-600 text-white px-2 py-1 rounded text-sm"
            onClick={() => {
              const newId = uuidv4();
              setChats([{ id: newId, messages: [] }, ...chats]);
              setCurrentChatId(newId);
            }}
          >
            + New
          </button>
        </div>
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`cursor-pointer p-2 rounded ${chat.id === currentChatId ? "bg-purple-100 font-bold" : "hover:bg-gray-100"}`}
            onClick={() => setCurrentChatId(chat.id)}
          >
            Chat {chat.id.slice(0, 4)}
          </div>
        ))}
      </div>

      <div className="flex-1 p-6 bg-gray-50">
        <h1 className="text-2xl font-bold text-purple-800 text-center mb-2">Welcome to MediVista</h1>
        <p className="text-center text-gray-600 mb-4">Ask about symptoms, treatment, or upload a medical file.</p>

        <div className="bg-gray-100 border rounded-lg p-5 h-[420px] overflow-y-auto">
          {currentChat?.messages.map((msg, idx) => renderResponse(msg, idx))}
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded p-2"
          />
          <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
          <button onClick={() => fileInputRef.current.click()} className="bg-green-600 text-white px-4 py-2 rounded">Upload File</button>
          <button onClick={() => cameraInputRef.current.click()} className="bg-purple-600 text-white px-4 py-2 rounded">Camera</button>
          <input type="file" accept="image/*,.pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default MedicalAssistantLayout;
