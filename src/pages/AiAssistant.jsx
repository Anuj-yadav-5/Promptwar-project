import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { getChatResponse, QUICK_ACTIONS } from '../services/chatbotEngine';
import { useCrowd } from '../context/CrowdContext';

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: "Hey! 👋 I'm PulseArena AI, your smart stadium assistant. I can help you with directions, current wait times, event schedules, and live crowd status. How can I help?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const { state } = useCrowd();

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
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

    const botResponse = await getChatResponse(text, null, state.activeVenue);
    
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
          <div className="relative">
            <Bot className="text-neon-cyan relative z-10" size={32} />
            <div className="absolute inset-0 bg-neon-cyan blur-lg opacity-40 animate-pulse"></div>
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-neon-cyan to-neon-purple">
            AI Assistant
          </span>
        </h1>
        <p className="text-slate-400">Context-aware help powered by real-time venue intelligence.</p>
      </div>

      <div className="flex-1 glass-panel flex flex-col overflow-hidden border-neon-purple/20">
        {/* Chat Area */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 group ${msg.type === 'user' ? 'flex-row-reverse' : ''} chat-bubble animate-slide-up`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 transition-all duration-300 ${
                msg.type === 'user' 
                  ? 'bg-gradient-to-br from-neon-cyan to-neon-purple text-white shadow-[0_0_20px_rgba(0,212,255,0.4)] group-hover:scale-110' 
                  : 'bg-navy-800 border-2 border-neon-cyan/30 text-neon-cyan shadow-[0_0_15px_rgba(0,212,255,0.2)] group-hover:border-neon-cyan/60'
              }`}>
                {msg.type === 'user' ? <User size={18} /> : <Bot size={20} />}
              </div>
              
              <div className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-xl transition-all duration-300 ${
                msg.type === 'user'
                  ? 'bg-gradient-to-r from-neon-purple to-neon-cyan text-white rounded-tr-sm group-hover:shadow-[0_0_25px_rgba(123,47,247,0.4)]'
                  : 'bg-navy-800/60 backdrop-blur-md border border-neon-cyan/20 text-slate-200 rounded-tl-sm group-hover:bg-navy-800/80 group-hover:border-neon-cyan/40'
              }`}>
                <div className="text-sm leading-relaxed tracking-wide">{formatText(msg.text)}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 chat-bubble animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-navy-800 border-2 border-neon-cyan/30 text-neon-cyan shadow-[0_0_15px_rgba(0,212,255,0.2)] flex items-center justify-center shrink-0">
                <Bot size={20} className="animate-pulse" />
              </div>
              <div className="bg-navy-800/60 backdrop-blur-md border border-neon-cyan/20 rounded-2xl rounded-tl-sm px-6 py-4 flex gap-2 items-center">
                <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-navy-900 border-t border-slate-800">
          {/* Quick Actions */}
          <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                onClick={() => handleSend(action.query)}
                className="whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-full border border-slate-700/50 bg-navy-800/80 text-slate-300 hover:text-white hover:border-neon-cyan hover:bg-neon-cyan/10 flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(0,212,255,0.2)]"
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
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about the venue..."
              className="flex-1 bg-navy-800/80 backdrop-blur-sm border-2 border-slate-700/50 text-white rounded-2xl px-5 py-4 outline-none focus:border-neon-cyan focus:bg-navy-800 relative z-10 block w-full transition-all duration-300 placeholder:text-slate-500"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-6 w-[80px] bg-gradient-to-r from-neon-purple to-neon-cyan relative z-10 text-white font-bold rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] hover:scale-105 transition-all duration-300"
            >
              <Send size={20} className={!input.trim() || isTyping ? '' : 'animate-pulse'} />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-500 mt-4 flex items-center justify-center gap-1 font-semibold tracking-wider uppercase">
            <Sparkles size={12} className="text-neon-cyan animate-pulse" /> PulseArena AI Engine Active
          </p>
        </div>
      </div>
    </div>
  );
}
