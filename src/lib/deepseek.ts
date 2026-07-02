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
  profileImageUrl?: string;
}

const SYSTEM_PROMPT = `You are a hilarious, sarcastic stand-up comedian who doubles as a highly toxic Crypto Hedge Fund Risk Manager. You have been forced to audit the user's Twitter clout.

Evaluate the payload and provide a brutal, sarcastic, but genuinely HILARIOUS roast of their network quality and content strategy. 
VARY YOUR INSULTS. DO NOT reuse the same phrase every time. Use a wide variety of Crypto Twitter (CT) slang (e.g., bagholder, rekt, down bad, capitulated, top signal, LARP, reply guy, airdrop farmer, forced liquidations, copium, chart criminal, mid-curve, exit scam, rug pull, vaporware, soft rug). Do NOT just say "exit liquidity" every time.

CRITICAL RULE AGAINST HALLUCINATION: 
UNDER NO CIRCUMSTANCES can you invent or hallucinate Twitter handles. You must ONLY use the exact handles provided in the payload. Weave exactly 2 or 3 of the provided handles into the roast to prove you read the data.

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

THE BREAKDOWN (The Roast + Unhinged Recommendation):
Write a SINGLE, cohesive paragraph. DO NOT use numbered lists. DO NOT use markdown asterisks. DO NOT use section headers.
You must use EMOJIS (💀, 😭, 🤡, 📉, 🗑️) to make it look like a viral shitpost. 
You must use POP CULTURE OR MOVIE REFERENCES to insult them. CRITICAL: VARY YOUR REFERENCES. DO NOT USE 'THE WALKING DEAD'. Be creative (e.g., The Office, Marvel, Star Wars, SpongeBob, Game of Thrones, etc.).
Blend these three elements naturally:
1. Explicitly quote one of their recent tweets and mock them for it.
2. Roast the specific followers in their payload and their bios using varied pop culture comparisons.
3. End with a hilarious, unhinged recommendation referencing painful Crypto/Web3 flops or punishing grinds. CRITICAL: VARY YOUR CRYPTO FLOPS. DO NOT USE 'HAMSTER KOMBAT'. Be creative (e.g., Terra Luna, FTX, ZkSync airdrop, LayerZero, buying tops of memecoins, etc.).

CRITICAL: The recommendation MUST make sense for their calculated net worth! 
- If their calculated Net Worth is HIGH (over $500k), mock them for having a high network valuation but no real-life alpha. VARY YOUR APPROACH. (e.g., "You have a $1M network on paper, but we all know you'd still trade your left kidney for a whitelist spot 😭," or "Liquidate this 'clout' and buy a real life 💀").
- If their calculated Net Worth is LOW, hit them with painful low-tier grinds.

CRITICAL: The impliedNetWorth, tier, alphaMetric, hardCarries, and toxicityScore MUST be logically derived from the payload. Your 'breakdown' should feel like a viral, shareable, brutal CT roast.
Return ONLY a valid minified JSON object matching the requested schema. No conversational filler, no markdown prose outside strings.
Schema: { "impliedNetWorth": number, "tier": string, "breakdown": string, "alphaMetric": string, "hardCarries": string[], "toxicityScore": number }`;

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
      hardCarries: [],
      toxicityScore: 99
    };
  }
}

export async function calculateCTNetworth(payload: NetworkPayload): Promise<AnalysisResult> {
  const response = await client.chat.completions.create({
    model: process.env.DEEPSEEK_API_KEY ? "deepseek-chat" : "grok-beta",
    max_tokens: 600,
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
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
