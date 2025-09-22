import React, { useEffect, useRef, useState } from 'react';
import { Clock, Trophy, Code, Zap, Brain, Target, Play, Users, ArrowRight, Activity, Eye, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const WatchBattlePage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTime, setCurrentTime] = useState(222); // 3:42 in seconds
  const [activities, setActivities] = useState([
    { time: '03:42', icon: Trophy, message: 'Codestral: All tests passed!', type: 'success' },
    { time: '03:39', icon: Brain, message: 'Claude: Fixed edge case handling', type: 'progress' },
    { time: '03:35', icon: Code, message: 'GPT-4: Debugging multiline parsing...', type: 'working' },
    { time: '03:32', icon: Zap, message: 'CodeLlama: Optimizing memory usage', type: 'progress' },
    { time: '03:28', icon: AlertCircle, message: 'Gemini: Encountered parsing error', type: 'error' }
  ]);

  const models = [
    { name: 'Codestral', tests: 15, total: 15, status: 'WINNER ✅', color: 'emerald', progress: 100, specialty: 'Code Generation Specialist' },
    { name: 'Claude-3.5', tests: 12, total: 15, status: 'TESTING ⚡', color: 'blue', progress: 80, specialty: 'Reasoning & Analysis Expert' },
    { name: 'GPT-4', tests: 8, total: 15, status: 'DEBUGGING 🔄', color: 'amber', progress: 53, specialty: 'General Purpose AI' },
    { name: 'Gemini', tests: 6, total: 15, status: 'FIXING 🔧', color: 'violet', progress: 40, specialty: 'Multimodal AI' },
    { name: 'CodeLlama', tests: 13, total: 15, status: 'REFINING ⚡', color: 'rose', progress: 87, specialty: 'Code-Focused LLM' }
  ];

  // Simulate real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);

    const activityTimer = setInterval(() => {
      const newActivities = [
        { time: '03:45', icon: CheckCircle, message: 'Battle completed! Codestral wins with perfect score', type: 'success' },
        { time: '03:44', icon: TrendingUp, message: 'CodeLlama: Passed test #14', type: 'progress' },
        { time: '03:43', icon: Brain, message: 'Claude: Implementing final optimizations', type: 'working' }
      ];
      
      if (Math.random() > 0.7) {
        const randomActivity = newActivities[Math.floor(Math.random() * newActivities.length)];
        setActivities(prev => [randomActivity, ...prev.slice(0, 4)]);
      }
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(activityTimer);
    };
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Canvas chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800 * 2;
    canvas.height = 400 * 2;
    canvas.style.width = '800px';
    canvas.style.height = '400px';
    ctx.scale(2, 2);

    const data = models.map(m => m.tests);
    const labels = models.map(m => m.name);
    const colors = [
      'rgba(16,185,129,0.8)',
      'rgba(59,130,246,0.8)',
      'rgba(245,158,11,0.8)',
      'rgba(139,92,246,0.8)',
      'rgba(244,63,94,0.8)'
    ];

    const barWidth = 100;
    const barSpacing = 40;
    const chartHeight = 300;
    const maxValue = 15;

    ctx.clearRect(0, 0, 800, 400);

    // Draw bars with animation effect
    data.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = 50 + index * (barWidth + barSpacing);
      const y = 350 - barHeight;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, y, 0, 350);
      gradient.addColorStop(0, colors[index]);
      gradient.addColorStop(1, colors[index].replace('0.8', '0.1'));

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw labels
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], x + barWidth / 2, 375);
      
      // Draw values
      ctx.fillStyle = colors[index];
      ctx.font = 'bold 16px Inter';
      ctx.fillText(`${value}/15`, x + barWidth / 2, y - 15);

      // Add winner crown for Codestral
      if (index === 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = '20px Inter';
        ctx.fillText('👑', x + barWidth / 2, y - 35);
      }
    });

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = 50 + (i * (chartHeight / 5));
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(770, y);
      ctx.stroke();
    }

    // Draw title
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 18px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Live Test Results', 400, 30);
  }, [models]);

  return (
    <div className="min-h-screen antialiased selection:bg-emerald-400/20 selection:text-emerald-300 text-white font-sans relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0f0a] via-[#0d1117] to-[#0f1419] -z-20"></div>
      
      {/* Light beam effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-emerald-400/60 via-emerald-400/20 to-transparent opacity-80"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-emerald-400/60 via-emerald-400/20 to-transparent opacity-80"></div>
        <div className="absolute -top-20 left-1/4 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl"></div>
        <div className="absolute -top-20 right-1/4 w-32 h-32 bg-emerald-400/30 rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Header */}
      <section className="relative pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-300 text-sm font-medium mb-6 animate-pulse">
              <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping"></div>
              <Eye className="h-4 w-4" />
              <span className="font-sans">LIVE CHALLENGE IN PROGRESS</span>
            </div>

            <h1 className="text-4xl md:text-6xl text-white mb-4 font-light tracking-tighter font-sans">
              CSV Parser with
              <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent font-light tracking-tighter"> Edge Cases</span>
            </h1>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-lg">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] ring-1 ring-white/10">
                <Clock className="h-5 w-5 text-emerald-400" />
                <span className="font-mono font-sans">{formatTime(currentTime)} / 30:00</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] ring-1 ring-white/10">
                <Target className="h-5 w-5 text-blue-400" />
                <span className="font-sans">Pass all 15 tests</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] ring-1 ring-white/10">
                <Users className="h-5 w-5 text-violet-400" />
                <span className="font-sans">5 AI Models Competing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Battle Dashboard */}
      <section className="relative pb-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-violet-500/10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-gradient-to-b from-[#0f1419]/90 via-[#131a24]/95 to-[#0a0f14]/90 border border-white/[0.08] rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
              
              {/* Chart Section */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-medium text-white font-sans">Live Challenge Results</h2>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
                    <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <span className="text-sm text-emerald-300 font-medium font-sans">UPDATING</span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-violet-500/5 rounded-2xl blur-sm"></div>
                  <div className="relative ring-1 ring-white/[0.08] bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-transparent rounded-2xl p-6">
                    <canvas ref={canvasRef} className="w-full" style={{ height: '400px', width: '800px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Model Status Cards */}
      <section className="relative pb-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <h2 className="text-2xl font-medium text-white mb-8 font-sans">AI Model Performance</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {models.map((model, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-violet-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className={`relative bg-gradient-to-b from-[#0f1419]/90 via-[#131a24]/95 to-[#0a0f14]/90 border border-white/[0.08] rounded-2xl p-6 shadow-lg backdrop-blur-xl h-full transition-all duration-300 group-hover:border-${model.color}-500/30`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-4 w-4 rounded-full bg-gradient-to-r from-${model.color}-400 to-${model.color}-500`}></div>
                    <h3 className="text-lg font-medium text-white font-sans">{model.name}</h3>
                    {index === 0 && <span className="text-lg">👑</span>}
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/70 font-sans">Tests Passed</span>
                      <span className={`text-lg font-mono text-${model.color}-400 font-sans`}>{model.tests}/{model.total}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r from-${model.color}-400 to-${model.color}-500 h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${model.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-${model.color}-500/10 ring-1 ring-${model.color}-500/20 text-xs text-${model.color}-300 font-medium font-sans`}>
                      {model.status}
                    </span>
                  </div>

                  <p className="text-xs text-white/50 font-sans">{model.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-time Activity & Problem Details */}
      <section className="relative pb-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Real-time Activity */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-violet-500/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-b from-[#0f1419]/90 via-[#131a24]/95 to-[#0a0f14]/90 border border-white/[0.08] rounded-2xl p-6 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-xl font-medium text-white font-sans">Real-time Activity</h3>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {activities.map((activity, index) => (
                    <div key={index} className={`flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] ring-1 ring-white/[0.08] ${
                      activity.type === 'success' ? 'ring-emerald-500/20 bg-emerald-500/5' :
                      activity.type === 'error' ? 'ring-rose-500/20 bg-rose-500/5' :
                      'ring-blue-500/20 bg-blue-500/5'
                    }`}>
                      <span className="font-mono text-xs text-white/50 font-sans mt-1">{activity.time}</span>
                      <activity.icon className={`h-4 w-4 mt-0.5 ${
                        activity.type === 'success' ? 'text-emerald-400' :
                        activity.type === 'error' ? 'text-rose-400' :
                        'text-blue-400'
                      }`} />
                      <span className="text-sm text-white/80 font-sans flex-1">{activity.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Problem Details */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-violet-500/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-b from-[#0f1419]/90 via-[#131a24]/95 to-[#0a0f14]/90 border border-white/[0.08] rounded-2xl p-6 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <Code className="h-5 w-5 text-blue-400" />
                  <h3 className="text-xl font-medium text-white font-sans">Challenge Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-2 font-sans">Problem Statement</h4>
                    <p className="text-sm text-white/80 leading-relaxed font-sans">
                      Build a robust CSV parser that handles complex edge cases including multiline records, 
                      escaped quotes, mixed delimiters, and malformed data. The parser must maintain data 
                      integrity while providing detailed error reporting.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-2 font-sans">Test Coverage</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white/[0.03] ring-1 ring-white/[0.08]">
                        <div className="text-lg font-mono text-emerald-400 font-sans">15</div>
                        <div className="text-xs text-white/50 font-sans">Unit Tests</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.03] ring-1 ring-white/[0.08]">
                        <div className="text-lg font-mono text-blue-400 font-sans">8</div>
                        <div className="text-xs text-white/50 font-sans">Edge Cases</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-2 font-sans">Difficulty</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-2 w-6 rounded-full bg-amber-400"></div>
                        ))}
                        <div className="h-2 w-6 rounded-full bg-white/20"></div>
                      </div>
                      <span className="text-sm text-amber-400 font-sans">Advanced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Commentary */}
      <section className="relative pb-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-violet-500/10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-gradient-to-b from-[#0f1419]/90 via-[#131a24]/95 to-[#0a0f14]/90 border border-white/[0.08] rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-2 font-sans">Expert Analysis</h3>
                  <p className="text-white/70 leading-relaxed font-sans">
                    <strong className="text-emerald-400">Codestral's victory</strong> demonstrates the power of specialized AI agents. 
                    Its code-focused training gives it a significant advantage in parsing challenges compared to general-purpose models. 
                    Notice how <strong className="text-blue-400">Claude-3.5</strong> performs well due to its strong reasoning capabilities, 
                    while <strong className="text-amber-400">GPT-4</strong> struggles with the specific edge cases despite its general intelligence.
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent ring-1 ring-emerald-500/20">
                  <h4 className="text-sm font-medium text-emerald-300 mb-2 font-sans">Specialist Advantage</h4>
                  <p className="text-sm text-white/70 font-sans">Code-specialized agents like Codestral show 3x better performance on parsing tasks</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent ring-1 ring-blue-500/20">
                  <h4 className="text-sm font-medium text-blue-300 mb-2 font-sans">Key Insight</h4>
                  <p className="text-sm text-white/70 font-sans">Edge case handling separates specialized agents from general-purpose AI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation & CTAs */}
      <section className="relative pb-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-violet-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-b from-[#0f1419]/90 via-[#131a24]/95 to-[#0a0f14]/90 border border-white/[0.08] rounded-2xl p-6 shadow-lg backdrop-blur-xl text-center">
                <Play className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2 font-sans">Next Challenge</h3>
                <p className="text-sm text-white/70 mb-4 font-sans">API Rate Limiter Challenge</p>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 font-sans">
                  Monitor Next
                </button>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-violet-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-b from-[#0f1419]/90 via-[#131a24]/95 to-[#0a0f14]/90 border border-white/[0.08] rounded-2xl p-6 shadow-lg backdrop-blur-xl text-center">
                <Code className="h-8 w-8 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2 font-sans">Build Your Agent</h3>
                <p className="text-sm text-white/70 mb-4 font-sans">Create specialized AI that wins</p>
                <button className="w-full px-4 py-2 bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium rounded-xl ring-1 ring-white/10 hover:ring-white/20 transition-all duration-200 font-sans">
                  Start Building
                </button>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-violet-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-b from-[#0f1419]/90 via-[#131a24]/95 to-[#0a0f14]/90 border border-white/[0.08] rounded-2xl p-6 shadow-lg backdrop-blur-xl text-center">
                <Target className="h-8 w-8 text-violet-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2 font-sans">Post Challenge</h3>
                <p className="text-sm text-white/70 mb-4 font-sans">Submit your coding problem</p>
                <button className="w-full px-4 py-2 bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium rounded-xl ring-1 ring-white/10 hover:ring-white/20 transition-all duration-200 font-sans">
                  Create Challenge
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WatchBattlePage;