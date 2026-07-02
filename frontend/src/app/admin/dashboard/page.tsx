'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import VideoManager from '@/components/VideoManager';
import { FiUsers, FiMessageSquare, FiVideo, FiActivity, FiLogOut, FiAlertTriangle, FiFilm, FiGrid } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Stats {
  totalUsers: number;
  textChatters: number;
  videoChatters: number;
  waitingUsers: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, textChatters: 0, videoChatters: 0, waitingUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos'>('overview');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const s = io(`${backendUrl}/admin`, {
      auth: { token },
      transports: ['websocket'],
    });

    s.on('connect', () => {
      setLoading(false);
      setSocket(s);
      toast.success('Connected to live dashboard');
    });

    s.on('connect_error', (err) => {
      toast.error('Authentication failed. Please login again.');
      localStorage.removeItem('admin_token');
      router.push('/admin');
    });

    s.on('stats_update', (data: Stats) => {
      setStats(data);
    });

    return () => {
      s.disconnect();
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    if (socket) socket.disconnect();
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Topbar */}
      <div className="bg-dark-800 border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-brand-red flex items-center justify-center text-white font-bold">A</div>
          <h1 className="font-bold text-xl">Admin Console</h1>
          <div className="ml-4 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/50 flex items-center gap-2 text-xs text-green-400 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live
          </div>
        </div>
        
        <button onClick={handleLogout} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <FiLogOut /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex space-x-2 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'overview' ? 'bg-brand-red text-white font-bold' : 'text-white/60 hover:bg-white/5'
            }`}
          >
            <FiGrid /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'videos' ? 'bg-brand-red text-white font-bold' : 'text-white/60 hover:bg-white/5'
            }`}
          >
            <FiFilm /> Video Management
          </button>
        </div>
        
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Real-Time Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="admin-stat-card group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <FiUsers size={24} />
                  </div>
                  <span className="text-2xl font-display font-bold">{stats.totalUsers}</span>
                </div>
                <p className="text-white/50 text-sm">Total Online Users</p>
              </div>
              
              <div className="admin-stat-card group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-brand-red/10 text-brand-red group-hover:bg-brand-red group-hover:text-white transition-colors">
                    <FiMessageSquare size={24} />
                  </div>
                  <span className="text-2xl font-display font-bold">{stats.textChatters}</span>
                </div>
                <p className="text-white/50 text-sm">In Text Chat</p>
              </div>
              
              <div className="admin-stat-card group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <FiVideo size={24} />
                  </div>
                  <span className="text-2xl font-display font-bold">{stats.videoChatters}</span>
                </div>
                <p className="text-white/50 text-sm">In Video Chat</p>
              </div>
              
              <div className="admin-stat-card group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                    <FiActivity size={24} />
                  </div>
                  <span className="text-2xl font-display font-bold">{stats.waitingUsers}</span>
                </div>
                <p className="text-white/50 text-sm">Waiting in Queue</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FiActivity className="text-brand-red" /> Live Activity Feed
                </h3>
                <div className="h-64 flex items-center justify-center border border-white/5 rounded-xl bg-dark-800">
                  <p className="text-white/30 text-sm">Activity feed will appear here...</p>
                </div>
              </div>
              
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-yellow-500">
                  <FiAlertTriangle /> Recent Reports
                </h3>
                <div className="h-64 flex items-center justify-center border border-white/5 rounded-xl bg-dark-800">
                  <p className="text-white/30 text-sm">No new reports.</p>
                </div>
              </div>
            </div>
            
            {/* Privacy Note */}
            <div className="mt-8 p-4 bg-brand-red/10 border border-brand-red/30 rounded-xl flex gap-3 text-sm">
              <FiAlertTriangle className="text-brand-red shrink-0 mt-0.5" />
              <p className="text-white/70">
                <strong>Privacy Guarantee:</strong> This dashboard only monitors metadata and connection statistics. 
                WebRTC media streams are peer-to-peer; the server and administrators have absolutely no access to user cameras or microphones.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="animate-fade-in">
            <VideoManager />
          </div>
        )}
      </div>
    </div>
  );
}
