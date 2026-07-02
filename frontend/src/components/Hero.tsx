'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiVideo, FiShield, FiZap, FiGlobe } from 'react-icons/fi';

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-hero-gradient opacity-60 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-red/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-glow pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-red-dark/30 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
      <div className="noise-overlay pointer-events-none"></div>

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <div 
          key={i} 
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: Math.random() * 0.5 + 0.1
          }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-brand-red/30 mb-8"
        >
          <span className="status-online"></span>
          <span className="text-sm font-medium text-white/90">Over 10,000+ users online right now</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tight mb-6 leading-tight"
        >
          Meet New People <br/>
          <span className="gradient-text">Instantly.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl text-lg md:text-xl text-white/60 mb-12"
        >
          Chat with strangers around the world using text or video. 
          No registration required. Just one click to find your match.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
        >
          <Link href="/chat" className="btn-outline w-full sm:w-auto flex items-center justify-center gap-3 text-lg py-5 group">
            <FiMessageSquare className="text-xl group-hover:scale-110 transition-transform" />
            <span>Start Text Chat</span>
          </Link>
          
          <Link href="/video" className="btn-brand w-full sm:w-auto flex items-center justify-center gap-3 text-lg py-5 group">
            <FiVideo className="text-xl group-hover:scale-110 transition-transform" />
            <span>Start Video Chat</span>
            <div className="absolute inset-0 rounded-2xl bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>
        </motion.div>

        {/* Features Highlights */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl"
        >
          <div className="flex flex-col items-center text-center p-6 glass-card-hover">
            <div className="w-12 h-12 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red mb-4">
              <FiZap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Instant Matching</h3>
            <p className="text-white/50 text-sm">Connect with someone new in milliseconds.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 glass-card-hover">
            <div className="w-12 h-12 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red mb-4">
              <FiGlobe size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Global Community</h3>
            <p className="text-white/50 text-sm">Meet diverse people from all over the world.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 glass-card-hover">
            <div className="w-12 h-12 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red mb-4">
              <FiShield size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Safe & Secure</h3>
            <p className="text-white/50 text-sm">Peer-to-peer video with built-in moderation.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
