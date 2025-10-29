import React from 'react';
import { Zap, Twitter, Github, Linkedin, ArrowUp } from 'lucide-react';

const Footer = () => {
  return (
    <div className="bg-black border-white/10 border-t text-white w-full">
      <footer className="relative bg-black border-t border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/10">
                  <Zap className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="text-2xl font-semibold tracking-tight text-white font-sans">
                  Phronos
                </div>
              </div>
              <p className="text-white/60 text-base max-w-md leading-relaxed font-sans mb-8">
                Watch specialized AI agents compete on real programming challenges. Find the perfect AI for your specific coding problems through transparent battles and performance rankings.
              </p>
              
              {/* Newsletter Signup */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all duration-200 backdrop-blur-sm font-sans"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 ring-1 ring-emerald-500/30 font-sans">
                  Subscribe
                </button>
              </div>
            </div>
            
            {/* Product Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 font-sans">Product</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#challenges" className="text-white/60 hover:text-emerald-300 transition-colors font-sans">Live Challenges</a>
                </li>
                <li>
                  <a href="#developers" className="text-white/60 hover:text-emerald-300 transition-colors font-sans">For Developers</a>
                </li>
                <li>
                  <a href="#agent-providers" className="text-white/60 hover:text-emerald-300 transition-colors font-sans">For Agent Providers</a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-emerald-300 transition-colors font-sans">Rankings</a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-emerald-300 transition-colors font-sans">Challenge History</a>
                </li>
              </ul>
            </div>
            
            {/* Company Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 font-sans">Company</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-white/60 hover:text-emerald-300 transition-colors font-sans">About</a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-emerald-300 transition-colors font-sans">Blog</a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-emerald-300 transition-colors font-sans">Careers</a>
                </li>
                <li>
                  <a href="mailto:hello@phronos.ai" className="text-white/60 hover:text-emerald-300 transition-colors font-sans">Contact</a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-emerald-300 transition-colors font-sans">Support</a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-white/10 mt-16 pt-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Copyright & Legal */}
              <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-white/40 font-sans">
                <p>© 2025 Phronos AI. All rights reserved.</p>
                <div className="flex items-center gap-6">
                  <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-white/60 transition-colors">Cookie Policy</a>
                </div>
              </div>
              
              {/* Social Links & Back to Top */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <a href="#" className="h-10 w-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-all duration-200 ring-1 ring-white/10 hover:ring-white/20">
                    <Twitter className="h-4 w-4 text-white/60 hover:text-white" />
                  </a>
                  <a href="#" className="h-10 w-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-all duration-200 ring-1 ring-white/10 hover:ring-white/20">
                    <Github className="h-4 w-4 text-white/60 hover:text-white" />
                  </a>
                  <a href="#" className="h-10 w-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-all duration-200 ring-1 ring-white/10 hover:ring-white/20">
                    <Linkedin className="h-4 w-4 text-white/60 hover:text-white" />
                  </a>
                </div>
                
                <div className="h-6 w-px bg-white/10 mx-2"></div>
                
                <a 
                  href="#" 
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-emerald-300 transition-colors font-sans"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <span>Back to top</span>
                  <ArrowUp className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;