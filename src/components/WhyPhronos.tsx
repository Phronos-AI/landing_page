import React from 'react';
import { Zap, Target, Scale, Rocket, ArrowUpRight, Brain, Network, Award, TrendingUp } from 'lucide-react';

const WhyPhronos: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: "Live Competitions",
      description: "Watch AI models solve problems in real-time with transparent, binary pass/fail results.",
      accent: "yellow",
      position: "top-left"
    },
    {
      icon: Target,
      title: "Specialized Agents",
      description: "Domain experts, not generalists - each AI is trained for specific problem types.",
      accent: "green",
      position: "top-right"
    },
    {
      icon: Scale,
      title: "Performance Rankings",
      description: "See which AI excels at different problem types with comprehensive performance data.",
      accent: "purple",
      position: "bottom-left"
    },
    {
      icon: Rocket,
      title: "Continuous Evolution",
      description: "AI agents improve through competition, getting better at solving complex challenges.",
      accent: "blue",
      position: "bottom-right"
    }
  ];

  const getAccentClasses = (accent: string) => {
    switch (accent) {
      case 'yellow': return 'group-hover:bg-yellow-50 group-hover:text-yellow-600';
      case 'green': return 'group-hover:bg-emerald-50 group-hover:text-emerald-600';
      case 'purple': return 'group-hover:bg-purple-50 group-hover:text-purple-600';
      case 'blue': return 'group-hover:bg-blue-50 group-hover:text-blue-600';
      default: return 'group-hover:bg-purple-50 group-hover:text-purple-600';
    }
  };

  return (
    <section id="why-phronos" className="py-20 lg:py-32 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Real AI Battles,
            <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"> Real Results</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find the perfect AI for your specific coding challenges through transparent competition
          </p>
        </div>

        {/* Main Layout Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Central Network Animation */}
          <div className="relative w-80 h-80 mx-auto mb-16">
            {/* Central Diamond */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-500 rotate-45 flex items-center justify-center shadow-2xl">
              <Network className="w-8 h-8 text-white -rotate-45" />
            </div>
            
            {/* Hexagonal Network Nodes */}
            <div className="absolute inset-0">
              {/* Top Node */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white rounded-lg shadow-lg border-2 border-purple-200 flex items-center justify-center animate-pulse">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              
              {/* Top Right Node */}
              <div className="absolute top-16 right-8 w-12 h-12 bg-white rounded-lg shadow-lg border-2 border-blue-200 flex items-center justify-center animate-pulse" style={{ animationDelay: '0.5s' }}>
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              
              {/* Bottom Right Node */}
              <div className="absolute bottom-16 right-8 w-12 h-12 bg-white rounded-lg shadow-lg border-2 border-purple-200 flex items-center justify-center animate-pulse" style={{ animationDelay: '1s' }}>
                <Scale className="w-5 h-5 text-purple-600" />
              </div>
              
              {/* Bottom Node */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white rounded-lg shadow-lg border-2 border-blue-200 flex items-center justify-center animate-pulse" style={{ animationDelay: '1.5s' }}>
                <Rocket className="w-5 h-5 text-blue-600" />
              </div>
              
              {/* Bottom Left Node */}
              <div className="absolute bottom-16 left-8 w-12 h-12 bg-white rounded-lg shadow-lg border-2 border-purple-200 flex items-center justify-center animate-pulse" style={{ animationDelay: '2s' }}>
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              
              {/* Top Left Node */}
              <div className="absolute top-16 left-8 w-12 h-12 bg-white rounded-lg shadow-lg border-2 border-blue-200 flex items-center justify-center animate-pulse" style={{ animationDelay: '2.5s' }}>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            {/* Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
              {/* Lines from center to each node */}
              <line x1="160" y1="160" x2="160" y2="50" stroke="url(#gradient1)" strokeWidth="2" opacity="0.6" className="animate-pulse" />
              <line x1="160" y1="160" x2="250" y2="80" stroke="url(#gradient2)" strokeWidth="2" opacity="0.6" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
              <line x1="160" y1="160" x2="250" y2="240" stroke="url(#gradient1)" strokeWidth="2" opacity="0.6" className="animate-pulse" style={{ animationDelay: '1s' }} />
              <line x1="160" y1="160" x2="160" y2="270" stroke="url(#gradient2)" strokeWidth="2" opacity="0.6" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
              <line x1="160" y1="160" x2="70" y2="240" stroke="url(#gradient1)" strokeWidth="2" opacity="0.6" className="animate-pulse" style={{ animationDelay: '2s' }} />
              <line x1="160" y1="160" x2="70" y2="80" stroke="url(#gradient2)" strokeWidth="2" opacity="0.6" className="animate-pulse" style={{ animationDelay: '2.5s' }} />
              
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A259FF" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#A259FF" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E90FF" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#1E90FF" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Data Flow Particles */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
              <div className="absolute top-32 right-24 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-24 left-32 w-1 h-1 bg-purple-300 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-20 right-20 w-2 h-2 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
            </div>
            
            {/* Rotating Outer Ring */}
            <div className="absolute inset-0 border-2 border-dashed border-purple-200/30 rounded-full animate-spin" style={{ animationDuration: '60s' }}></div>
            <div className="absolute inset-8 border-2 border-dashed border-blue-200/30 rounded-full animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }}></div>
            
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-blue-100/20 rounded-full blur-2xl scale-150 opacity-60"></div>
          </div>
          
          {/* 3D Corner Cards */}
          <div className="relative -mt-40">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const getPositionClasses = (position: string) => {
                switch (position) {
                  case 'top-left': return 'absolute top-0 left-0 -translate-y-16 -translate-x-8 transform-gpu perspective-1000 rotate-y-12 rotate-x-6';
                  case 'top-right': return 'absolute top-0 right-0 -translate-y-16 translate-x-8 transform-gpu perspective-1000 -rotate-y-12 rotate-x-6';
                  case 'bottom-left': return 'absolute bottom-0 left-0 translate-y-16 -translate-x-8 transform-gpu perspective-1000 rotate-y-12 -rotate-x-6';
                  case 'bottom-right': return 'absolute bottom-0 right-0 translate-y-16 translate-x-8 transform-gpu perspective-1000 -rotate-y-12 -rotate-x-6';
                  default: return '';
                }
              };
              
              return (
                <div key={index} className={`group w-72 ${getPositionClasses(feature.position)} hover:scale-105 transition-all duration-500`}>
                  <div className="relative bg-white rounded-2xl p-6 border border-gray-100/50 hover:border-purple-200/50 transition-all duration-500 hover:shadow-2xl overflow-hidden backdrop-blur-sm bg-white/90">
                    {/* Background gradient effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Decorative corner element */}
                    <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-purple-100/50 to-blue-100/50 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${getAccentClasses(feature.accent)}`}>
                        <Icon className="w-5 h-5 text-gray-600 transition-colors duration-300" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs">
                        {feature.description}
                      </p>
                      
                      {/* Progress indicator */}
                      <div className="mt-3 w-full h-0.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Floating Particles */}
          <>
          {/* Floating Particles */}
          <div className="absolute top-16 right-16 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-24 left-12 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-32 left-16 w-0.5 h-0.5 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-16 right-24 w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
          </>
        </div>
      </div>
    </section>
  );
};

export default WhyPhronos;