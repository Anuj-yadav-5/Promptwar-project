import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, X, MessageSquare } from 'lucide-react';
import { getChatResponse, QUICK_ACTIONS } from '../services/chatbotEngine';
import { useAuth } from '../context/AuthContext';

function TypewriterText({ text, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  
  // Use a ref to keep track of the latest onComplete without triggering re-renders
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      }
      if (index >= text.length) {
        clearInterval(timer);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, 15); // Adjust typing speed here
    return () => clearInterval(timer);
  }, [text]);

  // Format text similarly to before
  const formatText = (content) => {
    return content.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <span key={j} className="font-bold text-white">{part.slice(2, -2)}</span>;
        }
        return part;
      });
      return <React.Fragment key={i}>{parts}<br/></React.Fragment>;
    });
  };

  return <div className="text-xs leading-relaxed">{formatText(displayedText)}</div>;
}

export default function AiChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [botIsTypingOut, setBotIsTypingOut] = useState(false);
  const messagesEndRef = useRef(null);

  // Set initial message when user changes
  useEffect(() => {
    const greeting = user 
      ? `Hey ${user.name.split(' ')[0]}! 👋 I'm PulseArena AI. I can help you with stadium directions, live crowd status, and wait times. How can I assist you today?` 
      : "Hey there! 👋 I'm PulseArena AI. Sign in to get personalized assistance, or ask me about stadium directions and crowd status!";
    
    setMessages([
      { id: 1, type: 'bot', text: greeting, isNew: false }
    ]);
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen, botIsTypingOut]);

  const handleSend = async (text) => {
    if (!text.trim() || botIsTypingOut) return;

    const userMsg = { id: Date.now(), type: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const botResponse = await getChatResponse(text, user?.name);
    
    setIsTyping(false);
    setBotIsTypingOut(true);
    setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: botResponse, isNew: true }]);
  };

  const handleTypewriterComplete = (id) => {
    setBotIsTypingOut(false);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isNew: false } : m));
  };

  // Simple static formatter for old messages
  const formatTextStatic = (text) => {
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
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] max-h-[80vh] mb-4 glass-panel flex flex-col overflow-hidden border border-neon-purple/30 shadow-2xl animate-fade-in rounded-2xl bg-navy-900/90 backdrop-blur-xl">
          {/* Header */}
          <div className="bg-navy-800/80 p-4 border-b border-slate-700/50 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan p-0.5">
                  <div className="w-full h-full bg-navy-900 rounded-full flex items-center justify-center">
                    <Bot className="text-neon-cyan" size={20} />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-neon-cyan border-2 border-navy-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">PulseArena AI</h3>
                <p className="text-[10px] text-neon-cyan flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse"></span> Active & Ready
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors p-2 rounded-full"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gradient-to-b from-navy-900/50 to-transparent">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.type === 'user' 
                    ? 'bg-gradient-to-br from-neon-cyan to-neon-purple text-white shadow-lg border border-white/10' 
                    : 'bg-navy-800 border border-neon-purple/30 text-neon-cyan shadow-[0_0_15px_rgba(123,47,247,0.2)]'
                }`}>
                  {msg.type === 'user' ? (
                    user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="User" /> : <User size={14} />
                  ) : <Bot size={14} />}
                </div>
                
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-r from-neon-purple/90 to-neon-cyan/90 text-white rounded-tr-sm'
                    : 'bg-navy-800/80 border border-slate-700/50 text-slate-300 rounded-tl-sm'
                }`}>
                  {msg.type === 'bot' && msg.isNew ? (
                    <TypewriterText text={msg.text} onComplete={() => handleTypewriterComplete(msg.id)} />
                  ) : (
                    <div className="text-xs leading-relaxed">{formatTextStatic(msg.text)}</div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-navy-800 border border-neon-purple/30 text-neon-cyan flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(123,47,247,0.2)]">
                  <Bot size={14} />
                </div>
                <div className="bg-navy-800/80 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-neon-cyan/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-neon-purple/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-neon-pink/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-navy-800/80 border-t border-slate-700/50 shrink-0 backdrop-blur-md">
            <div className="flex overflow-x-auto gap-2 mb-3 scrollbar-hide pb-2 px-1">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action.query)}
                  className="whitespace-nowrap px-3 py-1.5 text-[11px] rounded-full border border-slate-600/60 bg-navy-900/50 text-slate-300 hover:text-white hover:border-neon-cyan hover:bg-neon-cyan/10 hover:shadow-[0_0_10px_rgba(0,212,255,0.2)] flex items-center gap-1.5 transition-all"
                  disabled={isTyping || botIsTypingOut}
                >
                  {action.label}
                </button>
              ))}
            </div>

            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="flex gap-2 items-center"
            >
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-navy-900/80 border border-slate-600 text-white text-sm rounded-xl pl-4 pr-10 py-3 outline-none focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,212,255,0.15)] transition-all"
                  disabled={isTyping}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-neon-cyan transition-colors"
                >
                  <Sparkles size={16} />
                </button>
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isTyping || botIsTypingOut}
                className="w-11 h-11 bg-gradient-to-br from-neon-purple to-neon-cyan text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:scale-105 transition-all shrink-0"
              >
                <Send size={18} className="ml-1" />
              </button>
            </form>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <Sparkles size={10} className="text-neon-purple" />
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Always learning with VenueFlow AI</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan text-white shadow-[0_0_25px_rgba(123,47,247,0.5)] flex items-center justify-center hover:scale-110 hover:shadow-[0_0_35px_rgba(0,212,255,0.6)] transition-all duration-300 relative group overflow-hidden border-2 border-navy-900 z-50"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X size={28} className="relative z-10" /> : <MessageSquare size={28} className="relative z-10" />}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-neon-pink border-2 border-navy-900 rounded-full animate-ping"></span>
        )}
        {!isOpen && (
           <span className="absolute top-0 right-0 w-4 h-4 bg-neon-pink border-2 border-navy-900 rounded-full"></span>
        )}
      </button>
    </div>
  );
}
