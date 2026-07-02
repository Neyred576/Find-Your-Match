'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FiPlay, FiFilm } from 'react-icons/fi';

interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  createdAt: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const res = await fetch(`${backendUrl}/api/videos`);
        if (res.ok) {
          const data = await res.json();
          setVideos(data);
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 mt-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Watch <span className="text-brand-red">Highlights</span>
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Check out the latest video moments, tutorials, and showcases from our community.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-24 glass-card">
            <FiFilm className="mx-auto text-5xl text-white/20 mb-4" />
            <h3 className="text-xl font-bold mb-2">No videos yet</h3>
            <p className="text-white/40">Check back later for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map(video => (
              <div key={video._id} className="glass-card overflow-hidden group flex flex-col">
                <div className="aspect-video bg-black relative">
                  <video 
                    src={process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${video.url}` : `http://localhost:5000${video.url}`} 
                    controls
                    className="w-full h-full object-contain"
                    poster="" // Optional poster could be added here
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2">{video.title}</h3>
                  {video.description && (
                    <p className="text-white/60 text-sm mb-4 flex-1">
                      {video.description}
                    </p>
                  )}
                  <div className="text-xs text-brand-red/80 font-semibold mt-auto pt-4 border-t border-white/5">
                    Added {new Date(video.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
