'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { FiSend, FiSkipForward, FiAlertTriangle, FiXOctagon } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: 'me' | 'partner';
  text: string;
  timestamp: Date;
}

export default function ChatWindow() {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'connecting' | 'waiting' | 'chatting'>('connecting');
  const [partnerTyping, setPartnerTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit('join_queue', { type: 'text' });
    setStatus('waiting');

    socket.on('matched', () => {
      setStatus('chatting');
      setMessages([]);
      toast.success('Found a match! Say hi.');
    });

    socket.on('receive_message', (text: string) => {
      setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'partner', text, timestamp: new Date() }]);
      setPartnerTyping(false);
    });

    socket.on('partner_typing', () => {
      setPartnerTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 2000);
    });

    socket.on('partner_disconnected', () => {
      setStatus('waiting');
      toast.error('Partner disconnected. Finding a new match...');
      setMessages(prev => [...prev, { 
        id: 'sys', 
        sender: 'sys' as any, 
        text: 'Partner has left the chat.', 
        timestamp: new Date() 
      }]);
      socket.emit('join_queue', { type: 'text' });
    });

    return () => {
      socket.off('matched');
      socket.off('receive_message');
      socket.off('partner_typing');
      socket.off('partner_disconnected');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, isConnected]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || status !== 'chatting' || !socket) return;

    socket.emit('send_message', input.trim());
    setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'me', text: input.trim(), timestamp: new Date() }]);
    setInput('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (socket && status === 'chatting') {
      socket.emit('typing');
    }
  };

  const handleSkip = () => {
    if (!socket) return;
    socket.emit('skip');
    setStatus('waiting');
    setMessages([]);
    toast('Looking for a new match...', { icon: '🔍' });
  };

  const handleReport = () => {
    if (!socket || status !== 'chatting') return;
    socket.emit('report');
    toast.success('User reported. Skipping...');
    handleSkip();
  };

  const handleBlock = () => {
    if (!socket || status !== 'chatting') return;
    socket.emit('block');
    toast.success('User blocked. Skipping...');
    handleSkip();
  };

  return (
    <div className="flex flex-col h-screen bg-dark-900 pt-[88px]">
      <Navbar />
      
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col relative">
        {/* Chat Header */}
        <div className="glass-card p-4 flex justify-between items-center mb-4 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${status === 'chatting' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-pulse'}`}></div>
            <span className="font-medium">
              {status === 'connecting' ? 'Connecting to server...' : 
               status === 'waiting' ? 'Finding a match...' : 'Chatting with stranger'}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button onClick={handleReport} disabled={status !== 'chatting'} className="btn-ghost p-2 text-yellow-500 hover:bg-yellow-500/10" title="Report">
              <FiAlertTriangle />
            </button>
            <button onClick={handleBlock} disabled={status !== 'chatting'} className="btn-ghost p-2 text-red-500 hover:bg-red-500/10" title="Block">
              <FiXOctagon />
            </button>
            <button onClick={handleSkip} className="btn-ghost p-2 text-white hover:bg-white/10 flex items-center gap-2" title="Skip">
              <FiSkipForward /> <span className="hidden sm:inline">Skip</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 glass-card overflow-y-auto p-4 mb-4 flex flex-col gap-4 relative">
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm z-20 rounded-2xl">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Connecting to servers...</p>
              </div>
            </div>
          )}
          
          {status === 'waiting' && isConnected && (
            <div className="absolute inset-0 flex items-center justify-center text-white/50 z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-brand-red/20 flex items-center justify-center animate-pulse-glow">
                  <span className="text-2xl">🔍</span>
                </div>
                <p>Searching the globe for your match...</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : msg.sender === 'sys' ? 'justify-center' : 'justify-start'}`}>
              {msg.sender === 'sys' ? (
                <div className="text-xs text-white/40 my-2">{msg.text}</div>
              ) : (
                <div className={`max-w-[75%] p-3 ${msg.sender === 'me' ? 'message-bubble-me text-white' : 'message-bubble-other text-white/90'}`}>
                  <p className="break-words">{msg.text}</p>
                  <span className="text-[10px] opacity-60 mt-1 block text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          ))}
          
          {partnerTyping && (
            <div className="flex justify-start">
              <div className="message-bubble-other p-4 flex gap-1 items-center h-10">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="glass-card p-2 flex gap-2 items-center chat-input-area">
          <input
            type="text"
            value={input}
            onChange={handleTyping}
            placeholder={status === 'chatting' ? "Type a message..." : "Waiting for match..."}
            disabled={status !== 'chatting'}
            className="input-field border-none flex-1"
            maxLength={1000}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || status !== 'chatting'}
            className="w-12 h-12 flex-shrink-0 bg-brand-red hover:bg-brand-red-light disabled:opacity-50 disabled:hover:bg-brand-red rounded-xl flex items-center justify-center text-white transition-colors"
          >
            <FiSend size={20} className={input.trim() && status === 'chatting' ? 'ml-1' : ''} />
          </button>
        </form>
      </div>
    </div>
  );
}
