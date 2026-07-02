'use client';

import { useState, useEffect, useRef } from 'react';
import { FiUpload, FiTrash2, FiPlay, FiFilm, FiLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  isExternal?: boolean;
  createdAt: string;
}

export default function VideoManager() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [externalUrl, setExternalUrl] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVideos = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/videos`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadMode === 'file') {
      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        toast.error('Please select a video file');
        return;
      }
    } else {
      if (!externalUrl.trim()) {
        toast.error('Please enter a valid link');
        return;
      }
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    
    if (uploadMode === 'file') {
      const file = fileInputRef.current?.files?.[0];
      if (file) formData.append('video', file);
    } else {
      formData.append('externalUrl', externalUrl.trim());
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/videos`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast.success(uploadMode === 'file' ? 'Video uploaded successfully!' : 'Link embedded successfully!');
        setTitle('');
        setDescription('');
        setExternalUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchVideos();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/videos/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Video deleted');
        fetchVideos();
      } else {
        toast.error('Failed to delete video');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiUpload className="text-brand-red" /> Upload New Video
        </h3>
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${uploadMode === 'file' ? 'border-brand-red bg-brand-red/10 text-brand-red' : 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white'}`}
          >
            <FiUpload /> Upload MP4
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('link')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${uploadMode === 'link' ? 'border-brand-red bg-brand-red/10 text-brand-red' : 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white'}`}
          >
            <FiLink /> Embed Link
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-red"
              placeholder="e.g. Highlight Reel 1"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Description (Optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-red h-24 resize-none"
              placeholder="A brief description..."
            />
          </div>
          
          {uploadMode === 'file' ? (
            <div>
              <label className="block text-sm text-white/60 mb-1">Video File</label>
              <input 
                type="file" 
                accept="video/*"
                ref={fileInputRef}
                className="block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-red/10 file:text-brand-red hover:file:bg-brand-red/20 transition-all"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm text-white/60 mb-1">Embed URL (Website, YouTube, Movies, etc)</label>
              <input 
                type="url" 
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-red"
                placeholder="https://..."
                required
              />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button 
              type="submit" 
              disabled={uploading}
              className="btn-primary flex-1 md:flex-none px-8 flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <><FiUpload /> Publish to Website</>
              )}
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => {
                setTitle('');
                setDescription('');
                setExternalUrl('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="flex-1 md:flex-none px-8 py-3 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 flex justify-center items-center gap-2 disabled:opacity-50 transition-colors"
            >
              <FiTrash2 /> Cancel / Delete Selection
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiFilm className="text-brand-red" /> Published Videos & Links
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <FiFilm className="mx-auto text-4xl text-white/20 mb-3" />
            <p className="text-white/40">No videos uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map(video => (
              <div key={video._id} className="bg-dark-900 border border-white/5 rounded-xl overflow-hidden group">
                <div className="aspect-video bg-black relative flex items-center justify-center">
                  {video.isExternal || (video.url && video.url.startsWith('http')) ? (
                    <>
                      <FiLink className="text-3xl text-white/30 group-hover:text-brand-red group-hover:scale-110 transition-all" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <span className="absolute top-2 left-3 bg-brand-red/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Embedded Link</span>
                      <span className="absolute bottom-2 left-3 right-3 text-xs font-bold text-white/80 line-clamp-1">
                        {video.title}
                      </span>
                    </>
                  ) : (
                    <>
                      <FiPlay className="text-3xl text-white/30 group-hover:text-brand-red group-hover:scale-110 transition-all" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <span className="absolute bottom-2 left-3 text-xs font-bold text-white/80 line-clamp-1 max-w-[80%]">
                        {video.title}
                      </span>
                    </>
                  )}
                </div>
                <div className="p-4 flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-white/40">{new Date(video.createdAt).toLocaleDateString()}</div>
                    {(video.isExternal || (video.url && video.url.startsWith('http'))) && (
                      <div className="text-xs text-brand-red/70 truncate max-w-[180px] mt-1" title={video.url}>{video.url}</div>
                    )}
                  </div>
                  <button 
                    onClick={() => setDeleteConfirmId(video._id)}
                    className="flex-shrink-0 p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold mb-2 text-white">Delete Video?</h3>
            <p className="text-white/60 mb-6 text-sm">
              Are you sure you want to delete this video? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
