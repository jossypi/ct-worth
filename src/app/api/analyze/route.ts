import { NextResponse } from 'next/server';
import { calculateCTNetworth } from '@/lib/deepseek';
import { scrapeTwitterProfile } from '@/lib/scraper';
import { checkRateLimit } from '@/lib/rate-limit';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    
    // 1. Check Rate Limit
    const isAllowed = await checkRateLimit(ip);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again tomorrow." },
        { status: 429 }
      );
    }

    const { username, regenerate } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    // 2. Fetch Data from X
    const networkPayload = await scrapeTwitterProfile(username);

    // 3. Process with DeepSeek / Grok
    const analysis = await calculateCTNetworth(networkPayload, regenerate === true);

    // 4. Attach profile image from scraper to final result
    analysis.profileImageUrl = networkPayload.profileImageUrl;

    // 5. Save to Supabase Leaderboard
    try {
      const totalFollowers = networkPayload.followers_sample.reduce((sum, f) => sum + f.followers, 0);
      const cloutRatio = totalFollowers > 0 ? analysis.impliedNetWorth / totalFollowers : 0;

      await supabase.from('ct-worth').upsert({
        username: username,
        implied_net_worth: analysis.impliedNetWorth,
        tier: analysis.tier,
        toxicity_score: analysis.toxicityScore,
        clout_ratio: cloutRatio
      }, { onConflict: 'username' });
    } catch (dbError) {
      console.error("[Supabase Error] Failed to save to leaderboard:", dbError);
    }

    return NextResponse.json({ success: true, data: analysis });
    
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json(
      { error: (error as Error).message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
