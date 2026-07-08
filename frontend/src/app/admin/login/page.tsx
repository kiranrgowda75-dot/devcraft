'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { Lock, User, Loader2, KeyRound } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/admin/login', { username, password });
      
      // Store token and username in cookies (expires in 1 day)
      Cookies.set('token', res.data.token, { expires: 1 });
      Cookies.set('username', res.data.username, { expires: 1 });
      
      // Redirect to dashboard
      window.location.href = '/admin/dashboard';
      
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setError('Invalid username or password.');
      } else if (err.response?.status === 429) {
        setError('Too many attempts. Please wait a minute before trying again.');
      } else {
        setError('Connection failed. Please check if backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Decorative Blur Blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10 relative flex flex-col items-center justify-center min-h-[400px]">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
            <Loader2 className="animate-spin text-cyan-500 mb-4" size={32} />
            <p className="text-slate-400 text-xs font-mono tracking-widest uppercase">Connecting to Portal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Glow effect card wrap */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10 relative">
          
          {/* Card Border Highlight Accent */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>

          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 mb-4 animate-pulse">
              <KeyRound size={22} className="stroke-[2.2]" />
            </div>
            <h1 className="font-display font-extrabold text-2xl tracking-tight text-white">
              Nexus Portal
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1.5 tracking-wide">
              AUTHORIZED ADMINISTRATOR LOGIN
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 text-red-400 text-xs rounded-xl text-center font-medium animate-fade-in">
                {error}
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Username
              </label>
              <div className="relative group">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                  placeholder="e.g. admin"
                  required
                  suppressHydrationWarning={true}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative group">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                  placeholder="••••••••"
                  required
                  suppressHydrationWarning={true}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/30 disabled:opacity-75 disabled:cursor-not-allowed"
              suppressHydrationWarning={true}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Access Admin Dashboard'
              )}
            </button>
          </form>

          {/* Public Return Link */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <Link 
              href="/" 
              className="text-xs font-semibold text-slate-500 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5"
            >
              ← Return to public marketplace
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}
