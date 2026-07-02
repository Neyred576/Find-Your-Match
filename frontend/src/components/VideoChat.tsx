'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiSkipForward, FiAlertTriangle, FiSend, FiMaximize } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: 'me' | 'partner' | 'sys';
  text: string;
  timestamp: Date;
}

export default function VideoChat() {
  const { socket, isConnected } = useSocket();
  const { 
    localVideoRef, 
    remoteVideoRef, 
    isMicOn, 
    isCamOn, 
    toggleMic, 
    toggleCam, 
    status, 
    skipMatch,
    remoteStream
  } = useWebRTC(socket, isConnected);

  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReceiveMessage = (text: string) => {
      setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'partner', text, timestamp: new Date() }]);
      setPartnerTyping(false);
    };

    const handlePartnerTyping = () => {
      setPartnerTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 2000);
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('partner_typing', handlePartnerTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('partner_typing', handlePartnerTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, isConnected]);

  // Clear messages when not chatting
  useEffect(() => {
    if (status !== 'chatting') {
      setMessages([]);
    }
  }, [status]);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        toast.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleReport = () => {
    if (socket && status === 'chatting') {
      socket.emit('report');
      toast.success('User reported. Skipping...');
      skipMatch();
    }
  };

  const handleBlock = () => {
    if (socket && status === 'chatting') {
      socket.emit('block');
      toast.success('User blocked. Skipping...');
      skipMatch();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-dark-900 pt-[88px]">
      <Navbar />
      
      <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 flex flex-col lg:flex-row gap-4 h-full pb-6">
        
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col gap-4 relative">
          
          {/* Status Bar */}
          <div className="glass-card p-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${status === 'chatting' ? 'bg-green-400 animate-pulse' : status === 'error' ? 'bg-red-500' : 'bg-yellow-400 animate-pulse'}`}></div>
              <span className="font-medium">
                {status === 'requesting' ? 'Requesting camera access...' : 
                 status === 'waiting' ? 'Finding a video match...' : 
                 status === 'chatting' ? 'Live Video Chat' : 'Error accessing media'}
              </span>
            </div>
            
            <button onClick={toggleFullscreen} className="btn-ghost p-2 flex items-center justify-center text-white/70 hover:text-white" title="Toggle Fullscreen">
              <FiMaximize size={20} />
            </button>
          </div>

          {/* Videos Container */}
          <div className="flex-1 relative video-container rounded-2xl overflow-hidden min-h-[300px]">
            {/* Remote Video (Full Size) */}
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className={`w-full h-full object-cover transition-opacity duration-500 ${status === 'chatting' && remoteStream ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Waiting State Overlay */}
            {status === 'waiting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-800/80 backdrop-blur-sm z-10">
                <div className="w-20 h-20 rounded-full bg-brand-red/20 flex items-center justify-center animate-pulse-glow mb-6">
                  <FiVideo size={32} className="text-brand-red" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Looking for a match...</h3>
                <p className="text-white/50">Ensure you are in a well-lit area.</p>
              </div>
            )}

            {/* Local Video (Picture in Picture) */}
            <div className="absolute bottom-4 right-4 w-32 md:w-48 aspect-video bg-black rounded-xl overflow-hidden border-2 border-white/20 shadow-glass-sm z-20 transition-all hover:scale-105 cursor-pointer">
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover transform scale-x-[-1] ${!isCamOn && 'hidden'}`}
              />
              {!isCamOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-700">
                  <FiVideoOff className="text-white/50" size={24} />
                </div>
              )}
            </div>
            
            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-dark-900/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 z-20">
              <button 
                onClick={toggleMic}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/80 hover:bg-red-500 text-white'}`}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isMicOn ? <FiMic size={20} /> : <FiMicOff size={20} />}
              </button>
              
              <button 
                onClick={toggleCam}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCamOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/80 hover:bg-red-500 text-white'}`}
                title={isCamOn ? "Turn off Camera" : "Turn on Camera"}
              >
                {isCamOn ? <FiVideo size={20} /> : <FiVideoOff size={20} />}
              </button>

              <div className="w-px h-8 bg-white/20 mx-2"></div>

              <button 
                onClick={skipMatch}
                className="btn-brand px-6 py-3 rounded-full flex items-center gap-2 font-bold"
              >
                <FiSkipForward /> Next
              </button>
            </div>
          </div>
        </div>

        {/* Action & Chat Panel (Desktop Right Side, Mobile Bottom) */}
        <div className="w-full lg:w-80 flex flex-col gap-4 flex-shrink-0 lg:h-full lg:max-h-[calc(100vh-140px)]">
          <div className="glass-card p-4 flex flex-col gap-3">
             <div className="flex gap-2">
                <button 
                  onClick={handleReport}
                  disabled={status !== 'chatting'}
                  className="flex-1 flex items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-yellow-500/20 hover:text-yellow-400 border border-transparent hover:border-yellow-500/30 transition-all disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:border-transparent disabled:hover:text-white"
                  title="Report User"
                >
                  <FiAlertTriangle />
                </button>
                <button 
                  onClick={handleBlock}
                  disabled={status !== 'chatting'}
                  className="flex-1 flex items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:border-transparent disabled:hover:text-white"
                  title="Block User"
                >
                  <FiAlertTriangle />
                </button>
             </div>
          </div>

          {/* Chat Interface */}
          <div className="glass-card flex-1 flex flex-col min-h-[350px] lg:min-h-0 overflow-hidden">
            <div className="p-3 border-b border-white/10 font-bold text-sm bg-dark-800/50">
              Live Chat
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 relative">
              {status !== 'chatting' && (
                <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm z-10 bg-dark-900/50">
                  Match to start chatting
                </div>
              )}
              
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : msg.sender === 'sys' ? 'justify-center' : 'justify-start'}`}>
                  {msg.sender === 'sys' ? (
                    <div className="text-xs text-white/40 my-1">{msg.text}</div>
                  ) : (
                    <div className={`max-w-[85%] p-2.5 rounded-xl text-sm ${msg.sender === 'me' ? 'bg-brand-red text-white rounded-br-none shadow-brand-sm' : 'bg-white/10 text-white/90 rounded-bl-none shadow-glass-sm'}`}>
                      <p className="break-words leading-relaxed">{msg.text}</p>
                    </div>
                  )}
                </div>
              ))}
              
              {partnerTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-xl rounded-bl-none p-3 flex gap-1 items-center h-8 shadow-glass-sm">
                    <div className="typing-dot bg-white/60"></div>
                    <div className="typing-dot bg-white/60"></div>
                    <div className="typing-dot bg-white/60"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-2 border-t border-white/10 flex gap-2 items-center bg-dark-800/50">
              <input
                type="text"
                value={input}
                onChange={handleTyping}
                placeholder={status === 'chatting' ? "Type a message..." : "Waiting..."}
                disabled={status !== 'chatting'}
                className="input-field border-none flex-1 py-2.5 px-3 text-sm bg-dark-900/50 focus:bg-dark-900"
                maxLength={500}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || status !== 'chatting'}
                className="w-10 h-10 flex-shrink-0 bg-brand-red hover:bg-brand-red-light disabled:opacity-50 disabled:hover:bg-brand-red rounded-lg flex items-center justify-center text-white transition-colors"
              >
                <FiSend size={16} className={input.trim() && status === 'chatting' ? 'ml-1' : ''} />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
