"use client";

import { useRef, useMemo } from "react";
import * as htmlToImage from "html-to-image";
import { AnalysisResult } from "@/lib/deepseek";
import { Button } from "@/components/ui/button";
import { Download, Share2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface NetworkDashboardProps {
  username: string;
  analysis: AnalysisResult;
}

// Generates stable neon colors based on the username string hash
function generateColorsFromHandle(handle: string) {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = handle.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 120) % 360; 
  const hue3 = (hue1 + 240) % 360;
  return {
    primary: `hsl(${hue1}, 100%, 55%)`,
    secondary: `hsl(${hue2}, 100%, 55%)`,
    tertiary: `hsl(${hue3}, 100%, 55%)`,
  };
}

export function NetworkDashboard({ username, analysis }: NetworkDashboardProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const colors = useMemo(() => generateColorsFromHandle(username), [username]);

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(printRef.current, {
        backgroundColor: "#000000",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${username}_ct_worth.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Receipt downloaded! Share it on X.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate image.");
    }
  };

  const handleShareOnX = () => {
    const shareText = `My CT Influence Net Worth is $${analysis.impliedNetWorth.toLocaleString()} via @JossyPi's CT-Worth Calculator!\n\nTier: ${analysis.tier}\nAlpha Metric: ${analysis.alphaMetric}\n\nCheck your clout score here:`;
    const url = "https://ct-worth.vercel.app";
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, "_blank");
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto mt-8">
      {/* The Receipt Card to be exported as image */}
      <div ref={printRef} className="w-full p-4 md:p-6 bg-transparent">
        <div className="bg-zinc-950/80 backdrop-blur-2xl border border-white/10 p-0 relative overflow-hidden rounded-3xl" style={{ boxShadow: `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px -10px ${colors.secondary}40` }}>
          {/* Holographic accent layer */}
          <div 
            className="absolute top-0 right-0 w-96 h-96 blur-3xl pointer-events-none rounded-full -mr-20 -mt-20 opacity-20"
            style={{ background: `radial-gradient(circle, ${colors.primary}, ${colors.secondary}, transparent)` }}
          ></div>
          <div 
            className="absolute bottom-0 left-0 w-96 h-96 blur-3xl pointer-events-none rounded-full -ml-20 -mb-20 opacity-10"
            style={{ background: `radial-gradient(circle, ${colors.tertiary}, ${colors.primary}, transparent)` }}
          ></div>
          
          <div className="border-b border-white/10 p-6 flex flex-row items-center gap-4 bg-white/5 relative z-10">
            {analysis.profileImageUrl && (
              <img 
                src={analysis.profileImageUrl} 
                alt={`${username} pfp`} 
                crossOrigin="anonymous"
                className="w-16 h-16 rounded-full border-2 border-white/20"
                style={{ boxShadow: `0 0 20px ${colors.primary}40` }}
              />
            )}
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">@{username}&apos;s Proof of Clout</h3>
              <p className="text-zinc-400 font-semibold uppercase text-xs tracking-widest inline-block mt-1">CT Networth Receipt</p>
            </div>
          </div>
          
          <div className="p-6 md:p-8 space-y-8 relative z-10">
            
            <div className="space-y-2">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Implied Net Worth</p>
              <h2 
                className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text drop-shadow-sm"
                style={{ backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.secondary}, ${colors.tertiary})` }}
              >
                ${analysis.impliedNetWorth.toLocaleString()}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Tier</p>
                <p className="font-semibold text-lg leading-tight text-white">{analysis.tier}</p>
              </div>
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Alpha Metric</p>
                <p className="font-semibold text-lg leading-tight text-white">{analysis.alphaMetric}</p>
              </div>
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: analysis.toxicityScore > 60 ? '#ef4444' : analysis.toxicityScore > 30 ? '#eab308' : '#22c55e'}}></span> Toxicity</p>
                <div className="flex items-end gap-2">
                  <p className="font-semibold text-2xl leading-tight text-white">{analysis.toxicityScore}</p>
                  <p className="text-xs text-zinc-500 font-medium pb-1">/100</p>
                </div>
                <div className="w-full bg-zinc-800 h-1 mt-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: analysis.toxicityScore + '%', backgroundColor: analysis.toxicityScore > 60 ? '#ef4444' : analysis.toxicityScore > 30 ? '#eab308' : '#22c55e' }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Risk Assessment</p>
              <p className="text-zinc-300 font-medium text-base md:text-lg leading-relaxed bg-white/5 p-6 border border-white/10 rounded-2xl">
                &quot;{analysis.breakdown}&quot;
              </p>
            </div>

            {analysis.hardCarries && analysis.hardCarries.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Hard Carries</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.hardCarries.map((carry, idx) => {
                    const cleanHandle = carry.replace("@", "");
                    return (
                      <a 
                        key={idx} 
                        href={`https://x.com/${cleanHandle}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="border border-white/20 bg-white/10 px-4 py-2 font-semibold text-sm text-white rounded-full hover:bg-white/20 transition-all hover:scale-105"
                      >
                        @{cleanHandle}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
            
          </div>
          <div className="p-5 border-t border-white/10 flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest bg-white/5 relative z-10">
            <p className="flex items-center gap-2"><TrendingUp className="w-3 h-3 text-cyan-400" /> CT-Worth Engine</p>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Button onClick={handleDownloadImage} className="flex-1 h-14 bg-white/10 text-white border border-white/20 hover:bg-white/20 font-bold uppercase tracking-widest text-sm transition-all rounded-full backdrop-blur-md hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          <Download className="w-4 h-4 mr-2" />
          Save Receipt
        </Button>
        <Button onClick={handleShareOnX} className="flex-1 h-14 text-black border border-white/20 font-bold uppercase tracking-widest text-sm transition-all rounded-full hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]" style={{ background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`, boxShadow: `0 0 20px ${colors.primary}40` }}>
          <Share2 className="w-4 h-4 mr-2" />
          Post to X
        </Button>
      </div>
    </div>
  );
}
