'use client';

import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiSkipForward, FiAlertTriangle, FiSend, FiMaximize } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

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

        {/* Action Panel (Desktop Right Side) */}
        <div className="w-full lg:w-80 flex flex-col gap-4 flex-shrink-0">
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="font-bold text-lg border-b border-white/10 pb-4">Actions</h3>
            
            <button 
              onClick={handleReport}
              disabled={status !== 'chatting'}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-yellow-500/20 hover:text-yellow-400 border border-transparent hover:border-yellow-500/30 transition-all disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:border-transparent disabled:hover:text-white"
            >
              <span className="font-medium">Report User</span>
              <FiAlertTriangle />
            </button>
            
            <button 
              onClick={handleBlock}
              disabled={status !== 'chatting'}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:border-transparent disabled:hover:text-white"
            >
              <span className="font-medium">Block User</span>
              <FiAlertTriangle />
            </button>
          </div>

          <div className="glass-card p-6 flex-1 flex flex-col justify-between hidden lg:flex">
             <div>
                <h3 className="font-bold text-lg mb-4 text-brand-red">Safety Guidelines</h3>
                <ul className="text-sm text-white/60 space-y-3 list-disc pl-4">
                  <li>Do not share personal information.</li>
                  <li>Be respectful to others.</li>
                  <li>Report any inappropriate behavior immediately.</li>
                  <li>Nudity or illegal content will result in a ban.</li>
                </ul>
             </div>
             
             <div className="text-center mt-6">
                <span className="text-xs text-white/30">Connection encrypted via WebRTC</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
