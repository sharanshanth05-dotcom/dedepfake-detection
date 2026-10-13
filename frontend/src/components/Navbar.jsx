import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Activity, Cpu, Layers, History, BookOpen, Terminal } from 'lucide-react';
import apiClient from '../api/client';

export default function Navbar() {
  const location = useLocation();
  const [apiOnline, setApiOnline] = useState(false);
  const [hardwareInfo, setHardwareInfo] = useState('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await apiClient.get('/health');
        if (res.data?.status === 'healthy') {
          setApiOnline(true);
          setHardwareInfo(res.data?.hardware?.device || 'CPU Engine');
        } else {
          setApiOnline(false);
        }
      } catch (e) {
        setApiOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 25000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: 'Workspace', path: '/workspace', icon: Layers },
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Audit History', path: '/history', icon: History },
    { name: 'Methodology', path: '/methodology', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#070a13]/85 backdrop-blur-md border-b border-cyan-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <ShieldAlert className="w-5 h-5 text-cyan-400 group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-wider text-white">
              TRUTH<span className="text-cyan-400">LENS</span>
            </span>
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-mono-code font-semibold tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-800 rounded">
              AI 2026
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* System Status Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-mono-code">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${apiOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className={apiOnline ? 'text-emerald-400' : 'text-rose-400'}>
              {apiOnline ? 'CORE ONLINE' : 'CONNECTING'}
            </span>
            {apiOnline && hardwareInfo && (
              <span className="text-slate-500 hidden sm:inline">| {hardwareInfo.includes('NVIDIA') ? 'GPU' : 'CPU'}</span>
            )}
          </div>

          <Link
            to="/workspace"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-slate-950" />
            Analyze Media
          </Link>
        </div>
      </div>
    </header>
  );
}
