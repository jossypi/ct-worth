"use client";

import { useRef, useMemo, useState } from "react";
import * as htmlToImage from "html-to-image";
import { AnalysisResult } from "@/lib/deepseek";
import { Button } from "@/components/ui/button";
import { Download, Share2, TrendingUp, Dices, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { jossyPiBase64 } from "@/lib/jossypiBase64";

interface NetworkDashboardProps {
  username: string;
  analysis: AnalysisResult;
  onRegenerate?: () => void;
  isLoading?: boolean;
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

export function NetworkDashboard({ username, analysis, onRegenerate, isLoading }: NetworkDashboardProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const colors = useMemo(() => generateColorsFromHandle(username), [username]);
  const [showRoast, setShowRoast] = useState(true);
  const [showGrowthTip, setShowGrowthTip] = useState(true);
  const [showToxicity, setShowToxicity] = useState(true);
  const [showHardCarries, setShowHardCarries] = useState(true);
  const [showMeme, setShowMeme] = useState(false);

  const isRightColumnEmpty = !showRoast && !showGrowthTip && !showToxicity;

  const memeImage = analysis.impliedNetWorth > 500000 ? '/memes/gigachad.png' 
                  : analysis.impliedNetWorth < 10000 ? '/memes/brainlet.png'
                  : (analysis.toxicityScore > 70 && analysis.impliedNetWorth < 100000) ? '/memes/bogdanoff.png'
                  : (analysis.toxicityScore > 50 || analysis.impliedNetWorth < 50000) ? '/memes/wojak.png' 
                  : analysis.impliedNetWorth > 100000 ? '/memes/stonks.png'
                  : '/memes/pepe.png';

  const handleDownloadImage = async () => {
    const targetRef = exportRef.current || printRef.current;
    if (!targetRef) return;
    try {
      const dataUrl = await htmlToImage.toPng(targetRef, {
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

  const handleShareOnX = async () => {
    const targetRef = exportRef.current || printRef.current;
    if (!targetRef) return;
    
    const toastId = toast.loading("Preparing your receipt for X...");
    
    try {
      const shareText = `My CT Influence Net Worth is $${analysis.impliedNetWorth.toLocaleString()} via @JossyPi's CT-Worth Calculator!\n\nTier: ${analysis.tier}\nAlpha Metric: ${analysis.alphaMetric}\n\nCheck your clout score here:`;
      const url = "https://ct-worth.vercel.app";

      const dataUrl = await htmlToImage.toPng(targetRef, {
        backgroundColor: "#000000",
        pixelRatio: 2,
      });

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // Try Web Share API for Mobile (Allows direct image sharing to X App)
      if (isMobile && navigator.share) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `${username}_ct_worth.png`, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          toast.dismiss(toastId);
          await navigator.share({
            title: 'My CT Worth',
            text: `${shareText}\n${url}`,
            files: [file]
          });
          return;
        }
      }

      // Fallback for Desktop: Download image and open X intent window
      const link = document.createElement("a");
      link.download = `${username}_ct_worth.png`;
      link.href = dataUrl;
      link.click();
      
      toast.dismiss(toastId);
      toast.success("Receipt saved! Please attach it to your post.");
      
      setTimeout(() => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, "_blank");
      }, 500);
      
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error("Failed to share.");
    }
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
          
          {/* Meme Mode Overlay */}
          {showMeme && (
            <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none mix-blend-screen opacity-20">
              <img src={memeImage} alt="Meme Overlay" className="w-[120%] h-auto object-cover blur-[2px] grayscale contrast-150" />
            </div>
          )}
          
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
              <p className="text-zinc-400 font-semibold uppercase text-xs tracking-widest inline-block mt-1">Valuation based on recent tweets & follower quality</p>
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
              {showToxicity && (
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
              )}
            </div>

            {showRoast && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">The Roast</p>
                <p className="text-zinc-300 font-medium text-base md:text-lg leading-relaxed bg-white/5 p-6 border border-white/10 rounded-2xl">
                  &quot;{analysis.breakdown}&quot;
                </p>
              </div>
            )}

            {analysis.growthTip && showGrowthTip && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-green-500/70 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Growth Tip
                </p>
                <p className="text-green-100/90 font-medium text-sm md:text-base leading-relaxed bg-green-500/10 p-5 border border-green-500/20 rounded-2xl">
                  {analysis.growthTip}
                </p>
              </div>
            )}

            {showHardCarries && analysis.hardCarries && analysis.hardCarries.length > 0 && (
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
            <p className="hidden sm:block">For entertainment; AI-generated analysis.</p>
            <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
      {/* Customization Panel */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 mt-2 mb-2">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-shrink-0">
            <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">Personalize<br className="hidden md:block" />Receipt</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 w-full md:w-auto">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" className="sr-only" checked={showRoast} onChange={(e) => setShowRoast(e.target.checked)} />
                <div className={`w-10 h-6 rounded-full transition-colors ${showRoast ? 'bg-indigo-500' : 'bg-zinc-700'}`}></div>
                <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${showRoast ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">The Roast</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" className="sr-only" checked={showGrowthTip} onChange={(e) => setShowGrowthTip(e.target.checked)} />
                <div className={`w-10 h-6 rounded-full transition-colors ${showGrowthTip ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
                <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${showGrowthTip ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Growth Tip</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" className="sr-only" checked={showToxicity} onChange={(e) => setShowToxicity(e.target.checked)} />
                <div className={`w-10 h-6 rounded-full transition-colors ${showToxicity ? 'bg-red-500' : 'bg-zinc-700'}`}></div>
                <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${showToxicity ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Toxicity</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" className="sr-only" checked={showHardCarries} onChange={(e) => setShowHardCarries(e.target.checked)} />
                <div className={`w-10 h-6 rounded-full transition-colors ${showHardCarries ? 'bg-cyan-500' : 'bg-zinc-700'}`}></div>
                <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${showHardCarries ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Hard Carries</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" className="sr-only" checked={showMeme} onChange={(e) => setShowMeme(e.target.checked)} />
                <div className={`w-10 h-6 rounded-full transition-colors ${showMeme ? 'bg-[#ff00ff]' : 'bg-zinc-700'}`}></div>
                <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${showMeme ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-sm font-black text-[#ff00ff] group-hover:text-white transition-colors">Meme Mode</span>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        {onRegenerate && (
          <Button onClick={onRegenerate} disabled={isLoading} className="w-full h-14 bg-zinc-800/50 text-zinc-300 border border-white/10 hover:bg-zinc-800 hover:text-white font-bold uppercase tracking-widest text-sm transition-all rounded-full backdrop-blur-md">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Dices className="w-4 h-4 mr-2" />}
            {isLoading ? "Rolling..." : "Regen Roast"}
          </Button>
        )}
        <Button onClick={handleDownloadImage} className="w-full h-14 bg-white/10 text-white border border-white/20 hover:bg-white/20 font-bold uppercase tracking-widest text-sm transition-all rounded-full backdrop-blur-md hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          <Download className="w-4 h-4 mr-2" />
          Save Receipt
        </Button>
        <Button onClick={handleShareOnX} className="w-full h-14 text-black border border-white/20 font-bold uppercase tracking-widest text-sm transition-all rounded-full hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]" style={{ background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`, boxShadow: `0 0 20px ${colors.primary}40` }}>
          <Share2 className="w-4 h-4 mr-2" />
          Post to X
        </Button>
      </div>

      {/* Hidden Landscape Export Node */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={exportRef} className="w-[1000px] min-h-[562px] h-fit p-6 bg-transparent">
          <div className="w-full h-full bg-zinc-950/80 backdrop-blur-2xl border border-white/10 relative overflow-hidden rounded-3xl flex flex-col" style={{ boxShadow: `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px -10px ${colors.secondary}40` }}>
            
            <div className="absolute top-0 right-0 w-96 h-96 blur-3xl pointer-events-none rounded-full -mr-20 -mt-20 opacity-20" style={{ background: `radial-gradient(circle, ${colors.primary}, ${colors.secondary}, transparent)` }}></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 blur-3xl pointer-events-none rounded-full -ml-20 -mb-20 opacity-10" style={{ background: `radial-gradient(circle, ${colors.tertiary}, ${colors.primary}, transparent)` }}></div>
            
            {showMeme && (
              <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none mix-blend-screen opacity-20">
                <img src={memeImage} alt="Meme Overlay" className="w-[120%] h-auto object-cover blur-[2px] grayscale contrast-150" />
              </div>
            )}
            
            {/* Header */}
            <div className="border-b border-white/10 p-6 flex flex-row items-center gap-4 bg-white/5 relative z-10">
              {analysis.profileImageUrl && (
                <img src={analysis.profileImageUrl} alt={`${username} pfp`} crossOrigin="anonymous" className="w-16 h-16 rounded-full border-2 border-white/20" style={{ boxShadow: `0 0 20px ${colors.primary}40` }} />
              )}
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">@{username}&apos;s Proof of Clout</h3>
                <p className="text-zinc-400 font-semibold uppercase text-xs tracking-widest inline-block mt-1">Valuation based on recent tweets & follower quality</p>
              </div>
            </div>
            
            {/* Body */}
            <div className={`flex-1 flex p-8 gap-8 relative z-10 ${isRightColumnEmpty ? 'flex-col items-center justify-center text-center' : 'flex-row'}`}>
              {/* Left Column */}
              <div className={`${isRightColumnEmpty ? 'w-full max-w-2xl items-center' : 'w-2/5'} flex flex-col justify-center gap-6`}>
                <div className={`space-y-2 ${isRightColumnEmpty ? 'flex flex-col items-center' : ''}`}>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Implied Net Worth</p>
                  <h2 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text drop-shadow-sm" style={{ backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.secondary}, ${colors.tertiary})` }}>
                    ${analysis.impliedNetWorth.toLocaleString()}
                  </h2>
                </div>
                
                <div className={`flex ${isRightColumnEmpty ? 'flex-row w-full gap-8' : 'flex-col gap-4'}`}>
                  <div className="p-4 bg-zinc-950/60 backdrop-blur-md border border-white/10 rounded-2xl flex-1 text-left">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Tier</p>
                    <p className="font-semibold text-lg leading-tight text-white">{analysis.tier}</p>
                  </div>
                  <div className="p-4 bg-zinc-950/60 backdrop-blur-md border border-white/10 rounded-2xl flex-1 text-left">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Alpha Metric</p>
                    <p className="font-semibold text-lg leading-tight text-white">{analysis.alphaMetric}</p>
                  </div>
                </div>

                {showHardCarries && analysis.hardCarries && analysis.hardCarries.length > 0 && (
                  <div className={`space-y-2 ${isRightColumnEmpty ? 'flex flex-col items-center mt-2' : ''}`}>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hard Carries</p>
                    <div className={`flex flex-wrap gap-2 ${isRightColumnEmpty ? 'justify-center' : ''}`}>
                      {analysis.hardCarries.map((carry, idx) => {
                        const cleanHandle = carry.replace("@", "");
                        return (
                          <span key={idx} className="border border-white/20 bg-zinc-950/60 backdrop-blur-md px-3 py-1 font-semibold text-xs text-white rounded-full">@{cleanHandle}</span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column */}
              {!isRightColumnEmpty && (
                <div className="w-3/5 flex flex-col justify-center gap-4">
                  {showRoast && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">The Roast</p>
                    <p className="text-zinc-300 font-medium text-sm leading-relaxed bg-zinc-950/60 backdrop-blur-md p-4 border border-white/10 rounded-2xl">
                      &quot;{analysis.breakdown}&quot;
                    </p>
                  </div>
                )}
                
                <div className="flex gap-4">
                  {analysis.growthTip && showGrowthTip && (
                    <div className="space-y-2 flex-1">
                      <p className="text-[10px] font-bold text-green-500/70 uppercase tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Growth Tip</p>
                      <p className="text-green-100/90 font-medium text-xs leading-relaxed bg-green-950/60 backdrop-blur-md p-4 border border-green-500/20 rounded-2xl h-full">
                        {analysis.growthTip}
                      </p>
                    </div>
                  )}
                  {showToxicity && (
                    <div className="space-y-2 flex-1">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: analysis.toxicityScore > 60 ? '#ef4444' : analysis.toxicityScore > 30 ? '#eab308' : '#22c55e'}}></span> Toxicity</p>
                      <div className="p-4 bg-zinc-950/60 backdrop-blur-md border border-white/10 rounded-2xl relative overflow-hidden h-full flex flex-col justify-center">
                        <div className="flex items-end gap-2">
                          <p className="font-semibold text-2xl leading-tight text-white">{analysis.toxicityScore}</p>
                          <p className="text-xs text-zinc-500 font-medium pb-1">/100</p>
                        </div>
                        <div className="w-full bg-zinc-800 h-1 mt-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: analysis.toxicityScore + '%', backgroundColor: analysis.toxicityScore > 60 ? '#ef4444' : analysis.toxicityScore > 30 ? '#eab308' : '#22c55e' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest bg-white/5 relative z-10 mt-auto">
              <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              <p className="flex items-center gap-2 text-zinc-400 lowercase tracking-normal text-[11px] font-medium"><TrendingUp className="w-3 h-3 text-cyan-400" /> ct-worth.vercel.app</p>
              <div className="flex items-center gap-2">
                Built by @JossyPi
                <img src={jossyPiBase64} alt="JossyPi" className="w-5 h-5 rounded-full border border-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
