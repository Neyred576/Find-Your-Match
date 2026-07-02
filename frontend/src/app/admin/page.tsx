'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiLock, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('admin_token', data.token);
        toast.success('Login successful');
        router.push('/admin/dashboard');
      } else {
        toast.error(data.message || 'Invalid password');
      }
    } catch (err) {
      toast.error('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="relative w-16 h-16 overflow-hidden rounded-2xl border border-white/10">
            <div className="absolute inset-0 bg-brand-red flex items-center justify-center text-white font-bold text-3xl">
              ❤
            </div>
            <Image 
              src="/logo.jpg" 
              alt="Logo" 
              fill 
              className="object-cover z-10"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>
        </div>
        
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Admin Access</h2>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-brand w-full flex justify-center items-center gap-2 mt-2"
            >
              {loading ? 'Authenticating...' : (
                <>
                  <span>Enter Dashboard</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>
          
          <p className="text-white/40 text-xs text-center mt-6">
            Welcome to the Find Your Match admin control panel.
          </p>
        </div>
      </div>
    </div>
  );
}
