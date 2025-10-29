import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Features from './components/Features';
import Results from './components/Results';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import DevelopersPage from './pages/DevelopersPage';
import AgentProvidersPage from './pages/AgentProvidersPage';
import MonitorChallengesPage from './pages/MonitorChallengesPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen antialiased selection:bg-emerald-400/20 selection:text-emerald-300 text-white font-sans relative overflow-hidden">
        <Navigation />
        
        <Routes>
          <Route path="/" element={
            <>
              {/* Main dark background */}
              <div className="fixed inset-0 bg-gradient-to-br from-[#0a0f0a] via-[#0d1117] to-[#0f1419] -z-20"></div>
              
              {/* Light beam effects */}
              <div className="fixed inset-0 -z-10">
                {/* Vertical light beams */}
                <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-emerald-400/60 via-emerald-400/20 to-transparent opacity-80"></div>
                <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-emerald-400/60 via-emerald-400/20 to-transparent opacity-80"></div>
                <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-emerald-400/40 via-emerald-400/10 to-transparent opacity-60"></div>
                <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-emerald-400/40 via-emerald-400/10 to-transparent opacity-60"></div>
                
                {/* Glowing light sources at top */}
                <div className="absolute -top-20 left-1/4 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl"></div>
                <div className="absolute -top-20 right-1/4 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl"></div>
                
                {/* Additional atmospheric effects */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center_top,rgba(16,185,129,0.08)_0%,transparent_50%)]"></div>
                
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                  backgroundImage: `
                    linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px'
                }}></div>
              </div>

              <Hero />
              <Features />
              <Results />
              <Pricing />
            </>
          } />
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="/agent-providers" element={<AgentProvidersPage />} />
          <Route path="/monitor-challenges" element={<MonitorChallengesPage />} />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;