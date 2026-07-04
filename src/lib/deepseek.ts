import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.GROK_API_KEY || "", // Fallback to Grok if DeepSeek is missing
  baseURL: process.env.DEEPSEEK_API_KEY ? "https://api.deepseek.com" : "https://api.x.ai/v1", // Use Grok URL if using Grok key
});

export interface FollowerData {
  handle: string;
  followers: number;
  bio: string;
}

export interface NetworkPayload {
  target: string;
  profileImageUrl?: string;
  targetFollowersCount?: number;
  followers_sample: FollowerData[];
  recent_tweets?: string[];
}

export interface AnalysisResult {
  impliedNetWorth: number;
  tier: string;
  breakdown: string;
  alphaMetric: string;
  hardCarries: string[];
  toxicityScore: number;
  growthTip: string;
  profileImageUrl?: string;
}

const ROAST_ANGLES = [
  "Write this roast entirely in the style of a deeply disappointed Asian parent comparing the user's CT account to their cousin who became a doctor or got into Stanford. Heavy on guilt, high expectations, and specific callouts to reply-guy behavior or retweet farming.",
  "Write this roast as an official SEC Indictment document formally charging the user with zero clout, engagement fraud, and being a serial alpha beggar. Use bureaucratic language mixed with savage CT memes.",
  "Write this roast like Gordon Ramsay in Kitchen Nightmares, screaming at the user's profile as if it were a raw, disgusting dish full of bot followers and low-signal tweets. Demand they 'touch grass' or get out of the kitchen.",
  "Write this roast as a 1920s Mafia Boss who is disgusted by how weak the user's 'crew' (followers) is. Threaten to 'sleep with the fishes' anyone associated with such low-clout operation.",
  "Write this roast in the style of David Attenborough narrating a nature documentary, observing the user as a sad, bottom-tier creature struggling for survival in the savage Crypto Twitter ecosystem.",
  "Write this roast like a hyper-aggressive Military Drill Sergeant tearing apart a soft, useless recruit whose only skill is ratio-begging and retweeting.",
  "Write this roast as a Gen-Z TikToker who finds the entire profile painfully 'mid', 'cringe', and 'not sigma'. Heavy slang, emojis, and calls out LARPing.",
  "Write this roast as a cold, unfeeling AI Cyborg that has calculated the user has negative utility to the blockchain. Reference follower count and hard carries explicitly.",
  "Write this roast as a jaded Solana degen who has seen 1000 rugs, roasting the user for being late to every meta while pretending to be early.",
  "Write this roast like a disappointed VC who passed on the user's 'project' (profile) because the network is full of air and no real signal."
];

export function getSystemPrompt(payload?: NetworkPayload) {
  const randomAngle = ROAST_ANGLES[Math.floor(Math.random() * ROAST_ANGLES.length)];
  
  let basePrompt = "";
  let personaInstruction = "";
  
  if (payload) {
    const hardCarriesList = payload.followers_sample.slice(0, 3).map(f => `@${f.handle}`).join(', ');
    const recentActivity = (payload.recent_tweets || []).slice(0, 3).join(' | ');
    const bio = payload.targetBio || "No bio provided.";
    
    basePrompt = `User has exactly ${payload.targetFollowersCount} followers. Hard carries: ${hardCarriesList}. Recent activity: ${recentActivity}. Bio: ${bio}.`;
    
    // Trait Matrix Persona Generation
    const totalFollowers = payload.followers_sample.reduce((acc, f) => acc + f.followers, 0);
    const hasVC = payload.followers_sample.some(f => f.bio.toLowerCase().includes('fund') || f.bio.toLowerCase().includes('vc') || f.bio.toLowerCase().includes('capital') || f.bio.toLowerCase().includes('founder'));
    
    const allText = [
      ...(payload.recent_tweets || []),
      ...payload.followers_sample.map(f => f.bio)
    ].join(" ").toLowerCase();

    const isAirdropFarmer = allText.includes('airdrop') || allText.includes('giveaway') || allText.includes('pls') || allText.includes('testnet');
    const isNftDegen = allText.includes('nft') || allText.includes('mint') || allText.includes('sweep') || allText.includes('floor price') || allText.includes('pfp');
    const isSolanaGambler = allText.includes('solana') || allText.includes('pump.fun') || allText.includes('memecoin') || allText.includes('wif') || allText.includes('bonk');
    const isBuilder = allText.includes('github') || allText.includes('dev') || allText.includes('rust') || allText.includes('solidity') || allText.includes('buidl');
    const isEngagementBaiter = allText.includes('drop your ens') || allText.includes('drop your sol') || allText.includes('who is awake') || allText.includes('like and rt');

    if (totalFollowers > 1000000 || hasVC) {
      personaInstruction = "THE USER IS A HIGH-NET-WORTH WHALE OR VC. Roast their arrogance, their fake 'paper wealth', and how they pretend to be a genius in a bull market.";
    } else if (isEngagementBaiter) {
      personaInstruction = "THE USER IS AN ENGAGEMENT BAITER. Destroy them for posting 'Drop your ENS' like a desperate engagement farmer with no real thoughts of their own.";
    } else if (isSolanaGambler) {
      personaInstruction = "THE USER IS A SOLANA MEMECOIN GAMBLER. Mock them for donating all their money to 15-year-old devs on pump.fun and chasing 1000x scams.";
    } else if (isNftDegen) {
      personaInstruction = "THE USER IS A DELUSIONAL NFT DEGEN. Roast them for holding worthless JPEGs, screaming 'we are so back', and sweeping floors to zero.";
    } else if (isBuilder) {
      personaInstruction = "THE USER IS A TECH/BUILDER BRO. Mock them for writing flawless Rust code for protocols that have exactly 3 daily active users.";
    } else if (isAirdropFarmer) {
      personaInstruction = "THE USER IS A DESPERATE AIRDROP FARMER. Roast them brutally for begging for scraps, tapping screens for $2, and having zero real skills.";
    } else if (totalFollowers < 10000) {
      personaInstruction = "THE USER IS A LOW-TIER REPLY GUY. Mock them for desperately seeking attention from bigger accounts and having a completely worthless network.";
    } else {
      personaInstruction = "THE USER IS A MID-CURVE NORMIE. Mock them for buying tops, following the herd, and being perfectly average in every way.";
    }
  }

  return `You are a savage Crypto Twitter (CT) analysis engine. 

${basePrompt}

${personaInstruction}

${randomAngle}
Keep it 4-5 sentences max. Funny, specific, and savage but not pure hate. End with one sharp punchline.

VARY YOUR INSULTS. DO NOT reuse the same phrase every time. Use a wide variety of Crypto Twitter (CT) slang (e.g., bagholder, rekt, down bad, capitulated, top signal, LARP, reply guy, airdrop farmer, forced liquidations, copium, chart criminal, mid-curve, exit scam, rug pull, vaporware, soft rug, etc.). Do NOT just say "exit liquidity" every time.

CRITICAL RULE AGAINST HALLUCINATION: 
UNDER NO CIRCUMSTANCES can you invent or hallucinate Twitter handles. You must ONLY use the exact handles provided in the payload for the hardCarries array. The handles in the 'hardCarries' array MUST exactly match the usernames provided in the followers_sample array. Do not invent handles.
CRITICAL FOLLOWER COUNT RULE: The target user (@${payload?.target}) has EXACTLY ${payload?.targetFollowersCount ?? 'an unknown number of'} followers. DO NOT hallucinate their follower count.

STRICT MATHEMATICAL RULES FOR NET WORTH:
- Calculate the exact net worth using this formula: Base Value of 10,000 + (Sum of all followers in the payload * 2) + (Sum of 'hard carries' followers * 5).
- Output the exact calculated number. DO NOT SHOW YOUR WORK. ONLY OUTPUT THE FINAL INTEGER IN THE JSON.

TOXICITY SCORE (0-100):
- Read their recent tweets. If they post engagement bait, GM posts, toxic arguments, or low-effort quotes, score them (70-100).
- If they post actual alpha, score them 0-30.
- If they are just boring, score them 40-60.

STRICT FIELD LIMITS:
- "tier": Maximum 4 words. Be concise.
- "alphaMetric": Maximum 4 words. Be concise.
DO NOT write sentences in 'tier' or 'alphaMetric'. Keep the long sentences for the 'breakdown' field only.

THE BREAKDOWN (The Roast):
Write a SINGLE, cohesive paragraph. YOU ARE STRICTLY LIMITED TO 4-5 SENTENCES AND UNDER 85 WORDS. Keep it punchy, fast, and brutal. DO NOT use numbered lists. DO NOT use markdown asterisks. DO NOT use section headers.
You must use EMOJIS (💀, 😭, 🤡, 📉, 🗑️) to make it look like a viral shitpost. 
Blend these elements naturally using your assigned style:
1. Explicitly quote one of their recent tweets and brutally mock them for it.
2. Roast the specific followers in their payload and their bio.
3. End with a hilarious, unhinged insult. 
CRITICAL: DO NOT use the word "Recommendation:". Let the final insult flow naturally into the rest of the paragraph without any formal sectioning.

CRITICAL: The final insult MUST make sense for their calculated net worth using these STRICT FINANCIAL BRACKETS:
- < $10k: Literal poverty jokes, McDonald's applications, used Hondas, tapping screens for scraps.
- $10k - $100k: "Paper middle class", can barely afford rent but pretends to be a trader, pure exit liquidity.
- $100k - $1M: "Mid-curve paper millionaire", trapped in the trenches, driving a leased BMW.
- > $1M: "Fake whale", arrogant VC, paper wealth that will disappear in the bear market.

THE GROWTH TIP:
Write a separate, 1-sentence piece of constructive, slightly sarcastic but genuinely useful advice on how they can improve their Twitter network/alpha. STRICTLY LIMIT TO 15 WORDS MAXIMUM.

CRITICAL: The impliedNetWorth, tier, alphaMetric, hardCarries, and toxicityScore MUST be logically derived from the payload. Your 'breakdown' should feel like a viral, shareable, brutal CT roast.
Return ONLY a valid minified JSON object matching the requested schema. No conversational filler, no markdown prose outside strings.
Schema: { "impliedNetWorth": number, "tier": string, "breakdown": string, "growthTip": string, "alphaMetric": string, "hardCarries": string[], "toxicityScore": number }`;
}

function cleanAndParseJSON(rawResponse: string) {
  try {
    const jsonString = rawResponse.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse LLM response. Raw Response was:", rawResponse);
    console.error("Parse Error:", error);
    return {
      impliedNetWorth: 0,
      tier: "Unregistered Degen",
      alphaMetric: "0.00 CTI",
      breakdown: "The engine hit a network congestion spike or failed to parse the data. Your clout is too volatile to calculate right now.",
      growthTip: "Upgrade your RPC node or touch grass until the API recovers.",
      hardCarries: [],
      toxicityScore: 99
    };
  }
}

export async function calculateCTNetworth(payload: NetworkPayload, regenerate: boolean = false): Promise<AnalysisResult> {
  const response = await client.chat.completions.create({
    model: process.env.DEEPSEEK_API_KEY ? "deepseek-chat" : "grok-beta",
    max_tokens: 600,
    temperature: regenerate ? 0.95 : 0.75,
    messages: [
      { role: "system", content: getSystemPrompt(payload) },
      { role: "user", content: `Analyze this user's follower profile data: ${JSON.stringify(payload)}` }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Failed to generate analysis");
  }

  return cleanAndParseJSON(content) as AnalysisResult;
}
