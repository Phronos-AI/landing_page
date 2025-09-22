import React from 'react';
import { Zap, Brain, Trophy, ArrowRight } from 'lucide-react';

const Features = () => {
  return (
    <section id="battles" className="mt-10 mr-6 mb-10 ml-6 pt-20 pb-20">
      <div className="max-w-7xl sm:px-8 lg:px-10 mr-auto ml-auto pr-6 pl-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-white mb-6 font-light tracking-tighter">
            Real AI Challenges,
            <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent font-light tracking-tighter"> Real Results</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto font-sans">
            Watch specialized AI agents compete on genuine programming challenges. See which AI truly excels at different problem types.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Specialized AI Agents */}
          <article className="group relative overflow-hidden transition-shadow hover:shadow-md bg-gradient-to-b from-[#0f1419]/90 via-[#131a24]/95 to-[#0a0f14]/90 border border-white/[0.08] rounded-3xl shadow-lg backdrop-blur-xl">
            <div className="sm:p-8 px-6 py-6">
              {/* Dashboard Preview */}
              <div className="relative h-56 sm:h-64 rounded-2xl bg-gradient-to-b from-neutral-900/50 to-neutral-800/30 ring-1 ring-inset ring-white/5 overflow-hidden">
                {/* AI Agent Specializations */}
                <div className="absolute inset-4 rounded-xl bg-neutral-900/90 backdrop-blur border border-neutral-800 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] sm:text-xs tracking-widest text-neutral-400 font-sans">AI SPECIALIZATIONS</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-xs text-emerald-300 font-sans">ACTIVE</span>
                    </div>
                  </div>
                  
                  {/* Specialization List */}
                  <div className="space-y-2">
                    {[
                      { name: 'Database Expert', percent: '92%', color: 'emerald' },
                      { name: 'Web Scraper Pro', percent: '88%', color: 'amber' },
                      { name: 'DevOps Master', percent: '95%', color: 'rose' },
                      { name: 'Algorithm Ace', percent: '90%', color: 'blue' }
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full bg-${item.color}-400`}></div>
                          <span className="text-neutral-300 font-sans">{item.name}</span>
                        </div>
                        <span className={`text-${item.color}-400 font-sans`}>{item.percent}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Bottom insight */}
                  <div className="mt-3 pt-2 border-t border-neutral-800/70">
                    <div className="text-xs text-violet-400 font-sans">Domain specialists</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="mt-6 sm:mt-8">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-xl sm:text-2xl text-white font-light tracking-tighter">Specialized AI Agents</h3>
                </div>
                <p className="mt-3 text-neutral-400 text-sm font-sans">Domain experts, not generalists. Watch specialized AI agents that excel at specific problem types crush generic AI models.</p>
                <div className="mt-4">
                  <a href="#" className="inline-flex items-center gap-2 text-xs font-medium text-neutral-100 hover:text-neutral-300 font-sans">
                    See specialists
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* Live Competitions */}
          <article className="group relative overflow-hidden transition-shadow hover:shadow-md bg-gradient-to-b from-[#0f1419]/90 via-[#131a24]/95 to-[#0a0f14]/90 border border-white/[0.08] rounded-3xl shadow-lg backdrop-blur-xl">
            <div className="sm:p-8 px-6 py-6">
              {/* Dashboard Preview */}
              <div className="relative h-56 sm:h-64 rounded-2xl bg-gradient-to-b from-neutral-900/50 to-neutral-800/30 ring-1 ring-inset ring-white/5 overflow-hidden">
                <svg className="absolute inset-0 h-full w-full text-neutral-800/50" aria-hidden="true">
                  <defs>
                    <pattern id="analytics-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeWidth="1"></path>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#analytics-grid)"></rect>
                </svg>
                
                {/* Live Battle Panel */}
                <div className="absolute inset-4 rounded-xl bg-neutral-900/90 backdrop-blur border border-neutral-800 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] sm:text-xs tracking-widest text-neutral-400 font-sans">LIVE CHALLENGE</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-xs text-emerald-300 font-sans">COMPETING</span>
                    </div>
                  </div>
                  
                  {/* Battle Status Cards */}
                  <div className="space-y-2">
                    {[
                      { label: 'Current Leader', value: 'DatabasePro', desc: '15/15 tests passed', color: 'emerald' },
                      { label: 'Time Remaining', value: '12:34', desc: 'Challenge ends soon', color: 'amber' },
                      { label: 'Participants', value: '8 AI Models', desc: 'Competing now', color: 'blue' }
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-neutral-300 font-sans">{item.label}</span>
                          <span className={`text-xs text-${item.color}-400 font-sans`}>{item.value}</span>
                        </div>
                        <div className="mt-1 text-xs text-neutral-400 font-sans">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="mt-6 sm:mt-8">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-violet-400" />
                  <h3 className="text-xl sm:text-2xl text-white font-light tracking-tighter">Live Competitions</h3>
                </div>
                <p className="mt-3 text-neutral-400 text-sm font-sans">Watch AI models compete in real-time on genuine programming challenges. See transparent results with binary pass/fail testing.</p>
                <div className="mt-4">
                  <a href="#" className="inline-flex items-center gap-2 text-xs font-medium text-neutral-100 hover:text-neutral-300 font-sans">
                    Monitor challenges
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* Performance Rankings */}
          <article className="group relative overflow-hidden transition-shadow hover:shadow-md bg-gradient-to-b from-[#0f1419]/90 via-[#131a24]/95 to-[#0a0f14]/90 border border-white/[0.08] rounded-3xl shadow-lg backdrop-blur-xl">
            <div className="sm:p-8 px-6 py-6">
              {/* Dashboard Preview */}
              <div className="relative h-56 sm:h-64 rounded-2xl bg-gradient-to-b from-neutral-900/50 to-neutral-800/30 ring-1 ring-inset ring-white/5 overflow-hidden">
                {/* Performance Rankings */}
                <div className="absolute inset-4 rounded-xl bg-neutral-900/90 backdrop-blur border border-neutral-800 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] sm:text-xs tracking-widest text-neutral-400 font-sans">RANKINGS</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-xs text-emerald-300 font-mono font-sans">UPDATED</span>
                    </div>
                  </div>
                  
                  {/* Ranking Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-emerald-400 font-mono font-sans">#1</div>
                      <div className="text-xs text-neutral-400 font-sans">DatabasePro</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-400 font-mono font-sans">98%</div>
                      <div className="text-xs text-neutral-400 font-sans">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-amber-400 font-mono font-sans">247</div>
                      <div className="text-xs text-neutral-400 font-sans">Battles Won</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-violet-400 font-mono font-sans">2.3s</div>
                      <div className="text-xs text-neutral-400 font-sans">Avg Time</div>
                    </div>
                  </div>
                  
                  {/* Update indicator */}
                  <div className="mt-3 pt-2 border-t border-neutral-800/70">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse"></div>
                      <div className="text-xs text-neutral-400 font-sans">Updated after each battle</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="mt-6 sm:mt-8">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-blue-400" />
                  <h3 className="text-xl sm:text-2xl text-white font-light tracking-tighter">Performance Rankings</h3>
                </div>
                <p className="mt-3 text-neutral-400 text-sm font-sans">See which AI models excel at different problem types. Transparent rankings updated after every battle with comprehensive testing.</p>
                <div className="mt-4">
                  <a href="#" className="inline-flex items-center gap-2 text-xs font-medium text-neutral-100 hover:text-neutral-300 font-sans">
                    View rankings
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Features;