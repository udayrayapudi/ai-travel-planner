'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, User, Sparkles, Loader2, Trash2,
  Compass, Mountain, Palmtree, Map
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTION_CHIPS = [
  { label: 'Best places in March', icon: Compass },
  { label: 'Budget trip under ₹15k', icon: Map },
  { label: 'Beach vs Mountains', icon: Mountain },
  { label: 'Hidden gems in India', icon: Palmtree },
];

// Render **bold** markdown as <strong>
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, li) => {
    const boldRegex = /\*\*(.+?)\*\*/g;
    const parts = line.split(boldRegex);
    const rendered = parts.map((part, pi) =>
      pi % 2 === 1 ? (
        <strong key={pi} className="text-foreground font-semibold">{part}</strong>
      ) : (
        <span key={pi}>{part}</span>
      )
    );

    // Bullet points
    if (line.trimStart().startsWith('•') || line.trimStart().startsWith('-')) {
      return (
        <div key={li} className="flex gap-2 ml-1">
          <span className="text-indigo-400 shrink-0">•</span>
          <span>{rendered}</span>
        </div>
      );
    }

    return (
      <span key={li}>
        {rendered}
        {li < lines.length - 1 && <br />}
      </span>
    );
  });
}

export default function AIHelpPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages([...newMessages, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I ran into an issue. Please try again!',
        timestamp: new Date(),
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-background/80 backdrop-blur-xl px-6 py-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">AI Trip Help</h1>
              <p className="text-xs text-muted-foreground">Ask me anything about travel</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-5">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Where do you want to go?</h2>
              <p className="text-muted-foreground text-sm max-w-md mb-8">
                I can help you pick the perfect destination, compare places, get budget estimates, and plan your dream trip.
              </p>

              {/* Suggestion chips */}
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => sendMessage(chip.label)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-sub-foreground hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:text-foreground transition-all"
                  >
                    <chip.icon className="w-4 h-4 text-indigo-400" />
                    {chip.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Message list */
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-500 text-white rounded-br-md'
                        : 'bg-card border border-border text-sub-foreground rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-start"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border bg-background/80 backdrop-blur-xl px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-input border border-border rounded-2xl px-4 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about destinations, budget, best time to visit..."
              rows={1}
              className="flex-1 bg-transparent text-foreground text-sm placeholder:text-muted-foreground focus:outline-none resize-none max-h-[120px]"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-muted disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-[11px] text-faint-foreground text-center mt-2">
            Powered by WanderWise · Responses may not always be accurate
          </p>
        </div>
      </div>
    </div>
  );
}
