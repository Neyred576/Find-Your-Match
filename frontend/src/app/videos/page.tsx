'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FiFilm, FiX, FiGlobe, FiPlay } from 'react-icons/fi';

interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  isExternal?: boolean;
  createdAt: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

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

  const getVideoSrc = (video: Video) => {
    if (video.isExternal || video.url.startsWith('http')) {
      return video.url;
    }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}${video.url}`;
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 mt-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Watch <span className="text-brand-red">Highlights</span>
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Check out the latest videos, movies, and content curated for you.
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
              <div
                key={video._id}
                className="glass-card overflow-hidden group flex flex-col cursor-pointer"
                onClick={() => setActiveVideo(video)}
              >
                <div className="aspect-video bg-dark-800 relative flex items-center justify-center overflow-hidden">
                  {/* Thumbnail placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-red/10 to-dark-900/80 flex items-center justify-center">
                    {video.isExternal || video.url.startsWith('http') ? (
                      <FiGlobe className="text-5xl text-white/20 group-hover:text-brand-red group-hover:scale-110 transition-all duration-300" />
                    ) : (
                      <FiFilm className="text-5xl text-white/20 group-hover:text-brand-red group-hover:scale-110 transition-all duration-300" />
                    )}
                  </div>
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40">
                    <div className="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center shadow-brand">
                      <FiPlay className="text-2xl text-white ml-1" />
                    </div>
                  </div>
                  {/* Badge */}
                  {(video.isExternal || video.url.startsWith('http')) && (
                    <div className="absolute top-3 left-3 bg-brand-red/90 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <FiGlobe size={10} /> Embedded
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold mb-1 group-hover:text-brand-red transition-colors">{video.title}</h3>
                  {video.description && (
                    <p className="text-white/50 text-sm mb-3 flex-1 line-clamp-2">{video.description}</p>
                  )}
                  <div className="text-xs text-brand-red/70 font-semibold mt-auto pt-3 border-t border-white/5">
                    Added {new Date(video.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Fullscreen Modal Player */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setActiveVideo(null); }}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <div>
              <h2 className="font-bold text-lg text-white">{activeVideo.title}</h2>
              {activeVideo.description && (
                <p className="text-white/50 text-sm">{activeVideo.description}</p>
              )}
            </div>
            <button
              onClick={() => setActiveVideo(null)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-brand-red flex items-center justify-center transition-colors flex-shrink-0 ml-4"
              title="Close"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="flex-1 w-full overflow-hidden">
            {activeVideo.isExternal || activeVideo.url.startsWith('http') ? (
              <iframe
                src={getVideoSrc(activeVideo)}
                className="w-full h-full border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                title={activeVideo.title}
              />
            ) : (
              <video
                src={getVideoSrc(activeVideo)}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

