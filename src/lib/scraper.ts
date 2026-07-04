import { NetworkPayload } from "./deepseek";

export async function scrapeTwitterProfile(username: string): Promise<NetworkPayload> {
  console.log(`[Scraper] Fetching live data for ${username} via RapidAPI (twitter-api45)...`);
  
  const rapidApiKey = process.env.RAPIDAPI_KEY || "40975d52b3msh5df4f55326578ddp17c53bjsn0245c7694287";
  const RAPIDAPI_HOST = "twitter-api45.p.rapidapi.com"; 

  try {
    // 1. Fetch user profile
    const userRes = await fetch(`https://${RAPIDAPI_HOST}/screenname.php?screenname=${username}`, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });
    
    let profileImageUrl = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
    let targetFollowersCount = 0;
    let targetBio = "";

    if (userRes.ok) {
      const userData = await userRes.json();
      profileImageUrl = userData?.avatar || userData?.profile_image_url_https || profileImageUrl;
      targetFollowersCount = userData?.sub_count || userData?.followers_count || userData?.legacy?.followers_count || 0;
      targetBio = userData?.desc || userData?.description || userData?.legacy?.description || "";
    } else {
      console.error("[Scraper] Failed to fetch user profile", await userRes.text());
    }

    // 2. Fetch followers (Deep Scrape - 4 pages to find the whales)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allFollowers: any[] = [];
    let currentCursor = "";
    const pagesToFetch = 4;

    for (let i = 0; i < pagesToFetch; i++) {
      const cursorParam = currentCursor ? `&cursor=${encodeURIComponent(currentCursor)}` : "";
      const url = `https://${RAPIDAPI_HOST}/followers.php?screenname=${username}&blue_verified=1${cursorParam}`;
      
      const followersRes = await fetch(url, {
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': RAPIDAPI_HOST
        }
      });

      if (!followersRes.ok) {
        if (followersRes.status === 429) {
          throw new Error("RapidAPI Quota Exceeded. Please upgrade your API plan or try again later.");
        }
        if (i === 0) throw new Error(`Failed to fetch followers from RapidAPI. Status: ${followersRes.status}`);
        break; // If we fail on subsequent pages, just use what we have
      }

      const followersData = await followersRes.json();
      
      // twitter-api45 specific parsing
      const batch = followersData.followers || [];
      allFollowers = allFollowers.concat(batch);

      // check if there's a next cursor
      const nextCursor = followersData.cursor || followersData.next_cursor_str;
      if (!nextCursor || nextCursor === currentCursor) {
        break; // No more pages
      }
      currentCursor = nextCursor;
    }
    
    // 3. Map, Sort by Influence, and Extract Top 50
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedFollowers = allFollowers.map((f: any) => {
      const user = f.user_results?.result || f; // Handle nested structures
      const legacy = user.legacy || user; // Handle V2 legacy wrapper
      return {
        handle: legacy?.screen_name || user?.username || legacy?.username || "unknown",
        followers: Number(legacy?.followers_count || legacy?.public_metrics?.followers_count || user?.followers_count || user?.followers || 0),
        bio: legacy?.description || legacy?.bio || user?.desc || user?.description || ""
      };
    });

    // Sort descending by followers count
    mappedFollowers.sort((a, b) => b.followers - a.followers);

    // Take the top 50 absolute whales we found in our deep scrape
    const sample = mappedFollowers.slice(0, 50);

    // 4. Fetch User Timeline (Content Quality Analysis)
    let recentTweets: string[] = [];
    try {
      const timelineRes = await fetch(`https://${RAPIDAPI_HOST}/timeline.php?screenname=${username}`, {
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': RAPIDAPI_HOST
        }
      });
      if (timelineRes.ok) {
        const timelineData = await timelineRes.json();
        const tweetsArray = timelineData.timeline || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recentTweets = tweetsArray.slice(0, 10).map((t: any) => t.text).filter(Boolean);
      }
    } catch (e) {
      console.warn("[Scraper] Failed to fetch timeline, continuing without it.", e);
    }

    if (sample.length === 0) {
      throw new Error("Failed to pull live network data. The account may be private, or the RapidAPI quota has been exceeded.");
    }

    return {
      target: username,
      profileImageUrl: profileImageUrl,
      targetFollowersCount: targetFollowersCount,
      targetBio: targetBio,
      followers_sample: sample,
      recent_tweets: recentTweets
    };
  } catch (error: any) {
    console.error("[Scraper Error]", error);
    throw new Error(error.message || "Failed to pull live RapidAPI data. Please check your RapidAPI Endpoint.");
  }
}
