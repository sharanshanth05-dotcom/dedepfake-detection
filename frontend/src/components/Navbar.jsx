import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  Layers,
  History,
  BookOpen,
  Zap,
  Lock,
} from 'lucide-react';
import apiClient from '../api/client';
import PillNav from './PillNav';
import GlassSurface from './GlassSurface';

// Client-side Router link adapter so PillNav navigates without full page reload
const RouterLink = ({ href, to, children, ...rest }) => (
  <Link to={to || href || '/'} {...rest}>
    {children}
  </Link>
);

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
      } catch {
        setApiOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Workspace', href: '/workspace', icon: <Layers className="w-3.5 h-3.5" /> },
    { label: 'Dashboard', href: '/dashboard', icon: <Activity className="w-3.5 h-3.5" /> },
    { label: 'Audit Ledger', href: '/history', icon: <History className="w-3.5 h-3.5" /> },
    { label: 'Methodology', href: '/methodology', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#fbfbfb]/90 backdrop-blur-xl border-b border-[#e8e8e8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        
        {/* Brand & Clearance Indicator */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative p-1.5 rounded-[6px] bg-[#ececef] border border-[#e8e8e8] group-hover:border-[#6e78d5] transition-all">
            <ShieldAlert className="w-4 h-4 text-[#6e78d5]" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#6e78d5] animate-ping opacity-75" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-semibold text-base tracking-tight text-[#1b1b1b]">
                TRUTH<span className="text-[#6e78d5]">LENS</span>
              </span>
              <span className="text-[10px] font-mono-code font-medium tracking-wide px-1.5 py-0.2 rounded-[4px] bg-[#d9dcea]/60 text-[#1b1b1b] border border-[#d9dcea]">
                PRO
              </span>
            </div>
            <span className="text-[9px] font-mono-code text-[#71737a] tracking-wider flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-[#6e78d5]" />
              MEDIA FORENSICS
            </span>
          </div>
        </Link>

        {/* Central PillNav with Spring Physics in Linear Palette */}
        <div className="flex-1 flex justify-center max-w-xl">
          <PillNav
            items={navItems}
            activeHref={location.pathname}
            linkComponent={RouterLink}
            theme="light"
            layout="joined"
            size="sm"
            surface="glass"
            itemStyle="pill"
            hoverEffect="glide"
            indicator="pill"
            highlightColor="#6e78d5"
            highlightTextColor="#ffffff"
            bounce={0.25}
            stretch={0.4}
          />
        </div>

        {/* System Telemetry & Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Health Status Pill */}
          <GlassSurface
            width="auto"
            height="auto"
            borderRadius={6}
            backgroundOpacity={0.06}
            blur={8}
            brightness={60}
            className="hidden sm:inline-flex border border-[#e8e8e8] shadow-xs"
            contentClassName="px-2.5 py-1 gap-2 text-xs font-mono-code"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  apiOnline ? 'bg-[#02755c]' : 'bg-[#92681b]'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  apiOnline ? 'bg-[#02755c]' : 'bg-[#92681b]'
                }`}
              />
            </span>
            <span className={apiOnline ? 'text-[#1b1b1b] font-medium' : 'text-[#92681b]'}>
              {apiOnline ? 'SYSTEM ACTIVE' : 'CONNECTING'}
            </span>
            {apiOnline && (
              <span className="text-[#71737a] text-[10px]">
                | {hardwareInfo.includes('NVIDIA') ? 'GPU ACCEL' : 'NEURAL CORE'}
              </span>
            )}
          </GlassSurface>

          {/* Launch Workspace CTA */}
          <Link
            to="/workspace"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] text-xs font-medium bg-[#6e78d5] hover:bg-[#5d67c8] text-white shadow-2xs transition-all transform active:scale-98 font-sans"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Audit Media</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
