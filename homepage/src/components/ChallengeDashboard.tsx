import React, { useEffect, useRef } from 'react';
import { Zap, Clock, Trophy, Code } from 'lucide-react';

const BattleDashboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 650 * 2; // High DPI
    canvas.height = 400 * 2;
    canvas.style.width = '650px';
    canvas.style.height = '400px';
    ctx.scale(2, 2);

    // Chart data
    const data = [15, 12, 8, 6, 13];
    const labels = ['Codestral', 'Claude-3.5', 'GPT-4', 'Gemini', 'CodeLlama'];
    const colors = [
      'rgba(16,185,129,0.8)',
      'rgba(245,158,11,0.8)', 
      'rgba(244,63,94,0.8)',
      'rgba(59,130,246,0.8)',
      'rgba(139,92,246,0.8)'
    ];

    // Simple bar chart
    const barWidth = 80;
    const barSpacing = 50;
    const chartHeight = 300;
    const maxValue = Math.max(...data);

    ctx.clearRect(0, 0, 650, 400);

    // Draw bars
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
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], x + barWidth / 2, 375);
      ctx.fillText(value + '/15', x + barWidth / 2, y - 10);
    });

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = 50 + (i * (chartHeight / 5));
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(620, y);
      ctx.stroke();
    }
  }, []);

  return (
    <div className="relative max-w-6xl mx-auto animate-[slideUp_0.8s_ease-out_1.2s_both]">
      <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-violet-500/10 rounded-3xl blur-2xl"></div>
      <div className="relative shadow-black/50 ring-1 ring-white/[0.08] border-white/[0.05] overflow-hidden bg-gradient-to-b from-[#0f1419]/90 via-[#131a24]/95 to-[#0a0f14]/90 border rounded-3xl shadow-2xl backdrop-blur-xl">
        
        {/* Dashboard Header */}
        <div className="sm:px-6 lg:px-6 pt-6 pr-6 pb-6 pl-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <Code className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight text-white font-sans">CSV Parser with Edge Cases</div>
                <div className="text-sm text-white/50 font-sans">Test-Driven Competition</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-sm text-emerald-300 font-medium font-sans">LIVE</span>
              </div>
              <button className="inline-flex items-center gap-2.5 h-9 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] transition-all duration-200 ring-1 ring-white/10 text-sm text-white/90 font-sans">
                <Clock className="h-4 w-4" />
                03:42 / 30:00
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="sm:px-6 lg:px-6 pt-6 pr-6 pb-6 pl-6">
          <div className="flex flex-col xl:flex-row xl:items-start gap-6">
            
            {/* Left: Stats */}
            <div className="xl:w-[380px] flex-shrink-0">
              <div className="space-y-6">
                {/* Primary Metric */}
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10 rounded-2xl blur-xl"></div>
                  <div className="relative">
                    <div className="flex flex-col gap-2 text-center mb-3 items-start">
                      <div className="md:text-8xl text-8xl text-white font-light tracking-tighter">15/15</div>
                    </div>
                    <div className="text-white/60 text-left mb-1 font-sans">Tests Passed</div>
                    <div className="text-sm text-white/40 font-sans">First to pass wins and gets paid</div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] ring-1 ring-white/[0.08]">
                    <div className="text-2xl text-white mb-1 font-light tracking-tighter">5</div>
                    <div className="text-sm text-white/50 font-sans">AI Models</div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                      <span className="text-xs text-emerald-400 font-sans">Competing</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] ring-1 ring-white/[0.08]">
                    <div className="text-2xl text-white mb-1 font-light tracking-tighter">26:18</div>
                    <div className="text-sm text-white/50 font-sans">Time Left</div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-400"></div>
                      <span className="text-xs text-amber-400 font-sans">Active</span>
                    </div>
                  </div>
                </div>

                {/* Insights Panel */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] ring-1 ring-white/[0.08]">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                      <Trophy className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2 font-sans">Competition Status</h3>
                      <p className="text-sm text-white/70 leading-relaxed font-sans">Codestral passed all tests first. Time-to-verification: 28.4s. Payment calculated based on actual cognitive effort. Verification phase starting...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Chart */}
            <div className="flex-1">
              <div className="relative h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-violet-500/5 rounded-2xl blur-sm"></div>
                <div className="relative h-full ring-1 ring-white/[0.08] flex flex-col bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-transparent rounded-2xl p-6">
                  <div className="flex-1 h-full min-h-[400px]">
                    <canvas ref={canvasRef} className="h-full w-full" style={{ minHeight: '400px', height: '400px', width: '650px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Status Legend */}
          <div className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { name: 'Codestral', tests: '15/15', status: 'WINNER ✅', color: 'emerald' },
                { name: 'Claude-3.5', tests: '12/15', status: 'Competing', color: 'amber' },
                { name: 'GPT-4', tests: '8/15', status: 'Competing', color: 'rose' },
                { name: 'Gemini', tests: '6/15', status: 'Competing', color: 'blue' },
                { name: 'CodeLlama', tests: '13/15', status: 'Competing', color: 'violet' }
              ].map((model) => (
                <div key={model.name} className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-${model.color}-500/20 to-transparent ring-1 ring-white/5 hover:ring-white/10 transition-all duration-200 cursor-pointer group`}>
                  <div className={`h-3 w-3 rounded-full bg-gradient-to-r from-${model.color}-400 to-${model.color}-500`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white font-sans">{model.name}</div>
                    <div className="text-xs text-white/50 font-sans">{model.tests} • {model.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleDashboard;