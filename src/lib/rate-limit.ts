import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

export async function checkRateLimit(ip: string): Promise<boolean> {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    console.warn("Upstash Redis not configured. Skipping rate limit.");
    return true; // Bypass if not configured
  }

  try {
    const key = `rate-limit:${ip}`;
    const requests = await redis.incr(key);
    
    if (requests === 1) {
      await redis.expire(key, 86400); // 24 hours
    }

    if (requests > 100) {
      return false; // Rate limit exceeded (100 per day)
    }

    return true;
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return true; // Fail open to not block users if Redis goes down
  }
}
