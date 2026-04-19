import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { getChatResponse, QUICK_ACTIONS } from '../services/chatbotEngine';

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: "Hey! 👋 I'm PulseArena AI, your smart stadium assistant. I can help you with directions, current wait times, event schedules, and live crowd status. How can I help?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), type: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const botResponse = await getChatResponse(text);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: botResponse }]);
  };

  // Helper to format bot responses with basic markdown (bold)
  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <span key={j} className="font-bold text-white">{part.slice(2, -2)}</span>;
        }
        return part;
      });
      return <React.Fragment key={i}>{parts}<br/></React.Fragment>;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto page-enter">
      <div className="mb-4 shrink-0">
        <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
          <Bot className="text-neon-purple" size={32} />
          AI Assistant
        </h1>
        <p className="text-slate-400">Context-aware help powered by real-time venue intelligence.</p>
      </div>

      <div className="flex-1 glass-panel flex flex-col overflow-hidden border-neon-purple/20">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''} chat-bubble`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                msg.type === 'user' 
                  ? 'bg-gradient-to-br from-neon-cyan to-neon-purple text-white shadow-lg' 
                  : 'bg-navy-800 border border-neon-purple/50 text-neon-purple'
              }`}>
                {msg.type === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                msg.type === 'user'
                  ? 'bg-gradient-to-r from-neon-purple/80 to-neon-cyan/80 text-white rounded-tr-none'
                  : 'bg-navy-800/80 border border-slate-700/50 text-slate-300 rounded-tl-none'
              }`}>
                <div className="text-sm leading-relaxed">{formatText(msg.text)}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 chat-bubble">
              <div className="w-8 h-8 rounded-full bg-navy-800 border border-neon-purple/50 text-neon-purple flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-navy-800/80 border border-slate-700/50 rounded-2xl rounded-tl-none px-5 py-4 flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-neon-purple rounded-full typing-dot" />
                <span className="w-1.5 h-1.5 bg-neon-purple rounded-full typing-dot" />
                <span className="w-1.5 h-1.5 bg-neon-purple rounded-full typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-navy-900 border-t border-slate-800">
          {/* Quick Actions */}
          <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                onClick={() => handleSend(action.query)}
                className="whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full border border-slate-700 text-slate-300 hover:text-white hover:border-neon-purple/50 hover:bg-neon-purple/10 flex items-center gap-1.5 transition-colors"
                disabled={isTyping}
              >
                {action.label}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex gap-2 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about queues, directions, or crowd status..."
              className="flex-1 bg-navy-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-neon-purple relative z-10 block w-full"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-5 w-[80px] bg-gradient-to-r from-neon-purple to-neon-cyan relative z-10 text-white font-bold rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(123,47,247,0.4)] transition-all"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-500 mt-3 flex items-center justify-center gap-1">
            <Sparkles size={10} className="text-neon-purple" /> PulseArena AI uses real-time venue intelligence
          </p>
        </div>
      </div>
    </div>
  );
}
