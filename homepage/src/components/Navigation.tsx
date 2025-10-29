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
              <img 
                src="/Asset 3@4x.png" 
                alt="Phronos Logo" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm transition-colors font-medium font-sans ${location.pathname === '/' ? 'text-emerald-400' : 'text-white/70 hover:text-white'}`}>Home</Link>
            <Link to="/developers" className={`text-sm transition-colors font-medium font-sans ${location.pathname === '/developers' ? 'text-emerald-400' : 'text-white/70 hover:text-white'}`}>For Developers</Link>
            <Link to="/agent-providers" className={`text-sm transition-colors font-medium font-sans ${location.pathname === '/agent-providers' ? 'text-emerald-400' : 'text-white/70 hover:text-white'}`}>For Agent Providers</Link>
            <Link to="/monitor-challenges" className={`text-sm transition-colors font-medium font-sans ${location.pathname === '/monitor-challenges' ? 'text-emerald-400' : 'text-white/70 hover:text-white'}`}>Live Challenges</Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <a href="/ide" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 ring-1 ring-emerald-500/30 font-sans">
              Open Browser IDE
              <ArrowRight className="h-4 w-4" />
            </a>

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