import React, { useState, useEffect, useRef } from "react"; 
import { 
  FaPaperPlane, FaTrash, FaFileExport, FaTimes, 
  FaMicrophone, FaMoon, FaSun, FaVolumeUp 
} from "react-icons/fa";
import axios from "axios";
import "./App.css";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = false;

const App = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm Ella. How can I assist you today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const chatRef = useRef(null);

  // ✅ Auto-scroll to the latest message
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Handle Speech-to-Text Input
  const startListening = () => {
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = (error) => {
      console.error("Speech recognition error:", error);
    };
  };

  // ✅ Send message to AI
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:5000/chat", {
        query: input,
        language
      });

      const botResponse = res.data.response || "⚠️ AI is currently unavailable. Please try again later.";
      const formattedResponse = formatMedicalResponse(botResponse);

      setMessages((prev) => [
        ...prev,
        { text: formattedResponse, sender: "bot" }
      ]);
    } catch (error) {
      console.error("❌ Error sending message:", error.message);
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Server is down. Please try again later.", sender: "bot" }
      ]);
    }
  };

  // ✅ Format medical response
  const formatMedicalResponse = (text) => {
    return `**Ella Suggests:**\n${text}`;
  };

  // ✅ Text-to-Speech (TTS)
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = language;
    window.speechSynthesis.speak(speech);
  };

  // ✅ Clear Chat
  const clearChat = () => {
    setMessages([{ text: "Hello! I'm Ella. How can I assist you today?", sender: "bot" }]);
  };

  // ✅ Export Chat as .txt file
  const exportChat = () => {
    const chatText = messages
      .map((msg) => `${msg.sender === "user" ? "You" : "Ella"}: ${msg.text}`)
      .join("\n");
    const blob = new Blob([chatText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "chat_history.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`app ${darkMode ? "dark-mode" : ""}`}>
      {/* ✅ Navbar */}
      <div className="navbar">
        <h1>🩺 Ella - Medical Chatbot</h1>
        <button 
          className="toggle-dark-mode" 
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      {/* ✅ Language Selector */}
      <select 
        className="language-select" 
        value={language} 
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="hi">हिन्दी</option>
      </select>

      {/* ✅ Chat Box */}
      <div className="chat-container">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            {msg.text}
            {msg.sender === "bot" && (
              <button 
                className="speak-btn" 
                onClick={() => speak(msg.text)}
              >
                <FaVolumeUp />
              </button>
            )}
          </div>
        ))}
        <div ref={chatRef} />
      </div>

      {/* ✅ Input Field */}
      <div className="input-container">
        <textarea
          placeholder="Describe your symptoms in detail..."
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button 
          className="send-btn" 
          onClick={sendMessage}
        >
          <FaPaperPlane />
        </button>
        <button 
          className="voice-btn" 
          onClick={startListening}
        >
          <FaMicrophone />
        </button>
      </div>

      {/* ✅ Options */}
      <div className="options">
        <button 
          className="clear-btn" 
          onClick={clearChat}
        >
          <FaTrash /> Clear Chat
        </button>
        <button 
          className="export-btn" 
          onClick={exportChat}
        >
          <FaFileExport /> Export Chat
        </button>
        <button 
          className="end-btn"
        >
          <FaTimes /> End Session
        </button>
      </div>
    </div>
  );
};

export default App;