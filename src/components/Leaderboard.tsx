"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Flame, Gem, Trophy } from "lucide-react";

interface LeaderboardEntry {
  username: string;
  implied_net_worth: number;
  tier: string;
  toxicity_score?: number;
  clout_ratio?: number;
}

type SortMode = 'net_worth' | 'toxicity' | 'ratio';

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('net_worth');

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      try {
        let orderCol = 'implied_net_worth';
        if (sortMode === 'toxicity') orderCol = 'toxicity_score';
        if (sortMode === 'ratio') orderCol = 'clout_ratio';

        const { data, error } = await supabase
          .from('ct-worth')
          .select('*')
          .order(orderCol, { ascending: false })
          .limit(10);
        
        if (error) throw error;
        if (data) setEntries(data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, [sortMode]);

  if (isLoading && entries.length === 0) return null;
  if (entries.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto text-left">
      <div className="text-center mb-10">
        <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em]">Live Rankings</h3>
      </div>
      
      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button 
          onClick={() => setSortMode('net_worth')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${sortMode === 'net_worth' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10'}`}
        >
          <Trophy className="w-3 h-3" /> Top Clout
        </button>
        <button 
          onClick={() => setSortMode('toxicity')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${sortMode === 'toxicity' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10'}`}
        >
          <Flame className="w-3 h-3" /> Most Toxic
        </button>
        <button 
          onClick={() => setSortMode('ratio')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${sortMode === 'ratio' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10'}`}
        >
          <Gem className="w-3 h-3" /> Hidden Gems
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-black/50 text-zinc-500 font-bold uppercase tracking-widest text-xs">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6">Handle</div>
          <div className="col-span-5 text-right">
            {sortMode === 'net_worth' && 'Net Worth'}
            {sortMode === 'toxicity' && 'Toxicity'}
            {sortMode === 'ratio' && 'Net Worth'}
          </div>
        </div>
        <div className="flex flex-col text-white">
          {entries.map((entry, idx) => (
            <div key={entry.username} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 last:border-b-0 items-center hover:bg-white/5 transition-colors group">
              <div className="col-span-1 text-center font-bold text-zinc-600 group-hover:text-zinc-400 transition-colors">{idx + 1}</div>
              <div className="col-span-6 font-bold truncate">@{entry.username}</div>
              <div className="col-span-5 text-right font-black">
                {sortMode === 'toxicity' ? (
                   <span className="text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">{entry.toxicity_score || 0} / 100</span>
                ) : (
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">${entry.implied_net_worth.toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
