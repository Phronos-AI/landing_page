import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, ArrowRight } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="relative z-50 animate-[fadeIn_0.8s_ease-out_0s_both]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between py-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-xl font-semibold tracking-tight text-white font-sans">
                Phronos
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm transition-colors font-medium font-sans ${location.pathname === '/' ? 'text-emerald-400' : 'text-white/70 hover:text-white'}`}>Home</Link>
            <Link to="/developers" className={`text-sm transition-colors font-medium font-sans ${location.pathname === '/developers' ? 'text-emerald-400' : 'text-white/70 hover:text-white'}`}>For Developers</Link>
            <Link to="/creators" className={`text-sm transition-colors font-medium font-sans ${location.pathname === '/creators' ? 'text-emerald-400' : 'text-white/70 hover:text-white'}`}>For Creators</Link>
            <Link to="/monitor-challenges" className={`text-sm transition-colors font-medium font-sans ${location.pathname === '/monitor-challenges' ? 'text-emerald-400' : 'text-white/70 hover:text-white'}`}>Live Challenges</Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/developers" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 ring-1 ring-emerald-500/30 font-sans">
              Join as Developer
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Mobile menu button */}
            <button className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-xl bg-white/[0.06] hover:bg-white/[0.12] transition-all duration-200 ring-1 ring-white/10">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;