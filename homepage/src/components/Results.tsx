import React from 'react';
import { Star, Plus, Trophy, Code, Zap } from 'lucide-react';

const Results = () => {
  return (
    <section className="sm:p-8 border-white/[0.08] bg-gradient-to-b from-[#0f1419]/90 via-[#131a24]/95 to-[#0a0f14]/90 border rounded-3xl mx-6 lg:mx-60 pt-6 pr-6 pb-6 pl-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-2 text-sm text-emerald-300">
        <Star className="h-4 w-4" />
        <span className="font-medium font-sans">Verified Engineering</span>
      </div>
      <div className="mt-2">
        <h2 className="text-[44px] sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.9] text-white font-light tracking-tighter">
          Expand Throughput.
        </h2>
        <p className="mt-1 text-sm sm:text-base text-white/70 font-light font-sans">
          Ship more features without lowering quality or increasing review time
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metrics card */}
        <article className="sm:p-6 flex flex-col min-h-[420px] bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-white/[0.08] rounded-2xl pt-5 pr-5 pb-5 pl-5 backdrop-blur-lg justify-between ring-1 ring-white/5">
          <div className="space-y-5">
            <div className="flex items-end gap-2">
              <span className="text-5xl sm:text-6xl text-white font-light tracking-tighter">10x</span>
              <span className="text-white/60 text-base font-normal font-sans">%</span>
            </div>
            <p className="text-sm text-white/80 font-sans">
              Human review is the bottleneck.{' '}
              <span className="font-medium text-white font-sans">Verification replaces review.</span> Engineers focus on architecture while AI handles implementation.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-emerald-300 font-sans">Test-Driven Development</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
                <Trophy className="h-3 w-3 text-emerald-400" />
              </div>
              <div className="h-7 w-7 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 -ml-2 rounded-full flex items-center justify-center">
                <Code className="h-3 w-3 text-blue-400" />
              </div>
              <div className="h-7 w-7 bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30 -ml-2 rounded-full flex items-center justify-center">
                <Zap className="h-3 w-3 text-violet-400" />
              </div>
              <span className="inline-flex items-center justify-center -ml-1 h-7 px-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-medium font-sans">
                500+
              </span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium tracking-tight leading-tight text-white font-sans">Jordan Kim</p>
            <p className="text-xs text-white/60 font-sans">Algorithm Engineer</p>
          </div>
          {/* ✅ Wrapped button and paragraph together */}
          <div>
            <button className="mt-6 h-11 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-emerald-500/25 font-sans">
              Monitor Challenges
            </button>
            <p className="text-2xl sm:text-3xl text-right leading-snug text-white font-light tracking-tighter">
              We shifted from code generation to code verification. Phronos lets us trust AI output without manual review.
            </p>
          </div>
        </article>

        {/* Testimonial columns */}
        <div className="grid grid-rows-[auto_1fr] gap-4">
          <article className="flex bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-white/[0.08] rounded-2xl pt-4 pr-4 pb-4 pl-4 backdrop-blur-lg items-center justify-between ring-1 ring-white/5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gray-400 rounded-lg bg-cover border border-white/20 ring-1 ring-white/10"></div>
              <div>
                <p className="text-sm font-medium tracking-tight leading-tight text-white font-sans">Alex Rivera</p>
                <p className="text-xs text-white/60 font-sans">Senior Developer</p>
              </div>
            </div>
            <Plus className="h-4 w-4 text-white/40" />
          </article>

          <article className="sm:p-6 flex flex-col min-h-[420px] bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-white/[0.08] rounded-2xl pt-5 pr-5 pb-5 pl-5 backdrop-blur-lg justify-between ring-1 ring-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-emerald-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <Plus className="h-4 w-4 text-white/40" />
            </div>
            <p className="text-2xl sm:text-3xl text-right leading-snug text-white font-light tracking-tighter">
              Test-driven competition means every solution is production-ready. No more checking AI hallucinations.
            </p>
          </article>
        </div>

        <div className="grid grid-rows-[1fr_auto] gap-4">
          <article className="flex flex-col min-h-[420px] bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-white/[0.08] rounded-2xl pt-6 pr-6 pb-6 pl-6 backdrop-blur-lg justify-between ring-1 ring-white/5">
            <p className="text-2xl sm:text-3xl text-center leading-snug text-white font-light tracking-tighter">
              Value based on time-to-verification means we pay for cognitive effort, not tokens generated.
            </p>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-1 text-emerald-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <Plus className="h-4 w-4 text-white/40" />
            </div>
          </article>

          <article className="flex gap-3 bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-white/[0.08] rounded-2xl pt-4 pr-4 pb-4 pl-4 backdrop-blur-lg items-center ring-1 ring-white/5">
            <div className="h-9 w-9 bg-gray-400 rounded-lg bg-cover border border-white/20 ring-1 ring-white/10"></div>
            <div>
              <p className="text-sm font-medium tracking-tight leading-tight text-white font-sans">Marcus Johnson</p>
              <p className="text-xs text-white/60 font-sans">VP of Marketing</p>
            </div>
          </article>
        </div>

        <div className="grid grid-rows-[auto_1fr] gap-4">
          <article className="flex bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-white/[0.08] rounded-2xl pt-4 pr-4 pb-4 pl-4 backdrop-blur-lg items-center justify-between ring-1 ring-white/5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gray-400 rounded-lg bg-cover border border-white/20 ring-1 ring-white/10"></div>
              <div>
                <p className="text-sm font-medium tracking-tight leading-tight text-white font-sans">Sam Chen</p>
                <p className="text-xs text-white/60 font-sans">DevOps Engineer</p>
              </div>
            </div>
            <Plus className="h-4 w-4 text-white/40" />
          </article>

          <article className="sm:p-6 flex flex-col min-h-[420px] bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-white/[0.08] rounded-2xl pt-5 pr-5 pb-5 pl-5 backdrop-blur-lg justify-between ring-1 ring-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-emerald-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <Plus className="h-4 w-4 text-white/40" />
            </div>
            <p className="text-2xl sm:text-3xl text-right leading-snug text-white font-light tracking-tighter">
              Verified code integrates directly. WebAssembly sandboxing ensures safety. No trust required.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Results;
