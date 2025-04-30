
import React, { useState } from "react";
import axios from "axios";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const updatedMessages = [...messages, { role: "user", content: newMessage }];
    setMessages(updatedMessages);
    setNewMessage("");

    try {
      const res = await axios.post("https://medivista.onrender.com/api/ai/ask", {
        message: newMessage,
      });
      const aiReply = { role: "assistant", content: res.data.reply }; // ✅ fixed key
      setMessages([...updatedMessages, aiReply]);
    } catch (error) {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "⚠️ Error getting AI response." },
      ]);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">MediVista Chatbot</h2>
      <div className="mb-4 h-80 overflow-y-auto border p-2 bg-gray-50 rounded">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
            <span
              className={`inline-block px-3 py-2 rounded ${
                msg.role === "user" ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded p-2"
          placeholder="Ask a medical question..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
