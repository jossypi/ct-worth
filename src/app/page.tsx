"use client";

import { useState, useEffect } from "react";
import { NetworkDashboard } from "@/components/NetworkDashboard";
import { Leaderboard } from "@/components/Leaderboard";
import { AnalysisResult } from "@/lib/deepseek";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [handle, setHandle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState(0);

  const placeholders = ["vitalikbuterin", "elonmusk", "cobie", "blknoiz06", "jossypi"];
  const loadingPhrases = [
    "Consulting the Chainlink Oracles...",
    "Bribing VCs for your follower data...",
    "Checking your timeline for rug pulls...",
    "Calculating your exit liquidity...",
    "Finding out who carries your clout..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let loadingInterval: NodeJS.Timeout;
    if (isLoading) {
      loadingInterval = setInterval(() => {
        setLoadingPhraseIdx((prev) => (prev + 1) % loadingPhrases.length);
      }, 1500);
    }
    return () => clearInterval(loadingInterval);
  }, [isLoading, loadingPhrases.length]);

  const handleAnalyze = async (e?: React.FormEvent, regenerate = false) => {
    if (e) e.preventDefault();
    if (!handle.trim()) {
      toast.error("Please enter an X handle.");
      return;
    }

    const cleanHandle = handle.replace("@", "").split("/").pop() || handle;

    setIsLoading(true);
    if (!regenerate) setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanHandle, regenerate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze profile.");
      }

      setAnalysis(data.data);
      toast.success("Analysis complete!");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden selection:bg-[#ff00ff]/30">
      {/* Premium Glassmorphic Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none translate-y-1/3"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
      
      <div className="container mx-auto px-4 py-20 max-w-4xl relative z-10 flex-grow flex flex-col justify-center">
        
        {/* Header */}
        <div className="text-center space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md mb-2 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <TrendingUp className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500 pb-2">
            CT-Worth Calculator
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
            If your followers were your net worth, what would you be worth in dollars? Find out exactly which followers are carrying your clout.
          </p>
        </div>

        {/* Search Input */}
        {!analysis && (
          <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 md:p-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <span className="text-zinc-500 font-bold text-xl">@</span>
                  </div>
                  <Input 
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder={placeholders[placeholderIdx]} 
                    className="pl-12 h-14 md:h-16 bg-transparent border-0 text-lg md:text-xl focus-visible:ring-0 text-white placeholder:text-zinc-600 font-medium rounded-full w-full"
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="h-14 md:h-16 px-8 bg-white text-black hover:bg-zinc-200 text-lg font-bold transition-all rounded-full flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {loadingPhrases[loadingPhraseIdx]}
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      Calculate
                    </>
                  )}
                </Button>
              </form>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
                Analysis based on public X data + AI interpretation. May vary based on API rate limits.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Result */}
        {analysis && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out mt-8 w-full">
            <NetworkDashboard 
              username={handle} 
              analysis={analysis} 
              onRegenerate={() => handleAnalyze(undefined, true)}
              isLoading={isLoading}
            />
            <div className="mt-12 text-center">
              <Button 
                onClick={() => setAnalysis(null)} 
                className="h-14 bg-white/10 text-white border border-white/20 hover:bg-white/20 font-bold uppercase tracking-widest text-sm transition-all rounded-full backdrop-blur-md px-10 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Roast Another Account
              </Button>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {!analysis && <div className="mt-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300"><Leaderboard /></div>}

        {/* CT Glossary FAQ */}
        {!analysis && (
          <div className="mt-24 pt-12 max-w-4xl mx-auto text-left animate-in fade-in duration-1000 delay-500">
            <div className="text-center mb-10">
              <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em]">The Metrics</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-md p-6 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors">
                <h4 className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  Liquidity Providers
                </h4>
                <p className="font-medium text-zinc-400 text-sm leading-relaxed">Your top-tier followers (VCs, Founders, Whales) who inject the most clout into your net worth.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-6 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors">
                <h4 className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  Alpha Metric
                </h4>
                <p className="font-medium text-zinc-400 text-sm leading-relaxed">A score representing how much &quot;smart money&quot; or insider influence exists within your network.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-6 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors">
                <h4 className="text-[#ccff00] font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#ccff00]"></div>
                  Toxicity Score
                </h4>
                <p className="font-medium text-zinc-400 text-sm leading-relaxed">Evaluates your recent tweets. Engagement bait and grift raise your risk score. High signal lowers it.</p>
              </div>
            </div>
          </div>
        )}

      </div>
      
      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl p-6 z-10 relative mt-12 flex justify-center md:justify-end items-center gap-6">
        <a href="https://linktr.ee/jossypi" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
          <span className="font-semibold text-zinc-400 uppercase tracking-widest text-xs group-hover:text-white transition-colors">
            Built by JossyPi
          </span>
          <img 
            src="https://github.com/jossypi.png" 
            alt="JossyPi" 
            className="w-8 h-8 rounded-full border border-white/20"
          />
        </a>
      </footer>
    </main>
  );
}
