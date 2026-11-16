'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  MapPin,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { MAHARASHTRA_DISTRICTS } from '../../data/maharashtra';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';

interface HeroProps {
  onSearch: (params: { search?: string; district?: string }) => void;
  onOpenAuth: (mode?: 'login' | 'register_candidate' | 'register_employer') => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onOpenAuth }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [stats, setStats] = useState(() => db.getLiveStats());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initial sync from client-side service
    setStats(db.getLiveStats());

    // Asynchronously fetch latest verified numbers from database
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data?.success && data?.stats) {
          setStats(data.stats);
        }
      })
      .catch(() => {
        // Fallback already loaded
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      search: searchTerm,
      district: selectedDistrict !== 'All' ? selectedDistrict : undefined
    });
  };

  const trendingTags = [
    { label: 'React / Node.js', search: 'React' },
    { label: 'CNC Machinist', search: 'CNC' },
    { label: 'Tally Accountant', search: 'Accountant' },
    { label: 'Field Loan Officer', search: 'Loan Officer' },
    { label: 'Warehouse / Logistics', search: 'Logistics' },
    { label: 'Pune IT Park', district: 'Pune' },
    { label: 'Kolhapur MIDC', district: 'Kolhapur' },
    { label: 'Chhatrapati Sambhajinagar', district: 'Chhatrapati Sambhajinagar' }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#071330] via-[#0b2566] to-[#041235] text-white pt-8 sm:pt-12 pb-14 sm:pb-16 border-b border-blue-900/60">
      
      {/* Dynamic Background Lighting & Concentric Tech Arcs with Smooth Orbit Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow Spheres with Gentle Breathing Animation */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] sm:w-[950px] h-[450px] bg-blue-500/20 blur-[130px] rounded-full animate-pulse-glow" />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-cyan-500/15 blur-[120px] rounded-full animate-pulse-glow" />
        <div className="absolute bottom-10 -right-36 w-[450px] h-[450px] bg-indigo-600/20 blur-[140px] rounded-full animate-pulse-glow" />

        {/* Ambient Radar / Concentric Orbit Rings with Slow Hypnotic Rotation */}
        <div className="absolute top-1/2 left-1/2 w-[650px] h-[650px] rounded-full border border-blue-400/10 border-dashed animate-spin-orbit" />
        <div className="absolute top-1/2 left-1/2 w-[950px] h-[950px] rounded-full border border-cyan-400/10 animate-spin-orbit-reverse" />
        <div className="absolute top-1/2 left-1/2 w-[1250px] h-[1250px] rounded-full border border-blue-300/5" />

        {/* Subtle Geometric Tech Dot Matrix */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO TITLE & CALLOUTS (Staggered Entrance Animation) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-5xl mx-auto mb-8 sm:mb-10 px-2"
        >
          <h1 className="font-sans-modern text-3xl sm:text-5xl lg:text-6xl font-extrabold sm:font-black tracking-tight leading-[1.05] sm:leading-[1.04] text-white">
            <span className="block whitespace-normal sm:whitespace-nowrap">
              Find{' '}
              <span className="text-cyan-300 font-extrabold italic px-1 inline-block drop-shadow-[0_0_20px_rgba(34,211,238,0.45)]">
                stress-free
              </span>{' '}
              careers with
            </span>
            <span className="block -mt-0.5 sm:-mt-1 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200 whitespace-normal sm:whitespace-nowrap">
              Maharashtra’s top employers.
            </span>
          </h1>
          
          <p className="mt-5 text-sm sm:text-base lg:text-lg text-blue-100/90 leading-relaxed max-w-2xl mx-auto font-normal font-sans-modern">
            Connecting verified job seekers with {mounted && stats.companiesCount > 0 ? `${stats.companiesCount}+ trusted companies` : 'top employers'} across all{' '}
            <span className="font-semibold text-cyan-300">36 Districts</span> of Maharashtra — from Pune & Mumbai IT hubs to regional MIDC manufacturing zones.
          </p>

          {/* Quick CTA Action Pills with Linear-style Light Sweep */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSearch({ search: '', district: undefined })}
              className="relative overflow-hidden px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(37,99,235,0.45)] flex items-center gap-2 cursor-pointer transition-all font-sans-modern group"
            >
              {/* Shimmer light sweep beam */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-shimmer-sweep pointer-events-none" />
              
              <Briefcase className="w-4 h-4" />
              <span>{mounted && stats.liveJobsCount > 0 ? `Explore ${stats.liveJobsCount}+ Live Jobs` : 'Explore Live Jobs'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenAuth('register_employer')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-2 hover:border-cyan-400/50 cursor-pointer font-sans-modern"
            >
              <Building2 className="w-4 h-4 text-cyan-300" />
              <span>Post a Vacancy (Free)</span>
            </motion.button>
          </div>
        </motion.div>

        {/* FLOATING GLASSMORPHIC SEARCH COMMAND CARD (Smooth Slide Up + Top Light Beam) */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] mb-5 sm:mb-6 overflow-hidden"
        >
          {/* Subtle Top Glowing Light Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative flex items-center">
              <Search className="w-5 h-5 text-blue-200 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Job title, skill, or company (e.g. React, CNC, Accountant)"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 md:bg-white/10 text-sm text-white placeholder:text-blue-200/60 border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
              />
            </div>

            {/* District Dropdown */}
            <div className="md:w-72 relative flex items-center">
              <MapPin className="w-5 h-5 text-blue-200 absolute left-4 pointer-events-none" />
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="w-full pl-12 pr-9 py-3.5 bg-slate-900/80 md:bg-slate-900/70 text-sm text-white border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-400 appearance-none transition-all cursor-pointer"
              >
                <option value="All" className="bg-slate-900 text-white">
                  All 36 Districts (सर्व जिल्हे)
                </option>
                {MAHARASHTRA_DISTRICTS.map(d => (
                  <option key={d.id} value={d.name} className="bg-slate-900 text-white">
                    {d.name} ({d.marathiName})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 pointer-events-none text-blue-300 text-xs">▼</div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="relative overflow-hidden py-3.5 px-8 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search Jobs</span>
            </motion.button>
          </form>

          {/* Trending Searches */}
          <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-blue-200/70 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-300" />
              Trending:
            </span>
            {trendingTags.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (tag.search) setSearchTerm(tag.search);
                  if (tag.district) setSelectedDistrict(tag.district);
                  onSearch({
                    search: tag.search || searchTerm,
                    district: tag.district || (selectedDistrict !== 'All' ? selectedDistrict : undefined)
                  });
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-blue-100 hover:text-white border border-white/10 hover:border-cyan-400/40 text-[11px] font-medium transition-all cursor-pointer"
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Subtle Trust Guarantee Bar */}
          <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[11px] text-blue-200/80 font-sans-modern">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
              Free Job Discovery & Applications
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              Zero Fake or Spam Vacancies
            </span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-300" />
              Direct MIDC & Corporate Recruiters
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
