import fs from 'fs';
import path from 'path';
import { calculateCTNetworth, NetworkPayload } from '../src/lib/deepseek';

async function runEvals() {
  console.log("=== Starting CT-Worth Evaluation Suite ===");
  const dataPath = path.join(process.cwd(), 'evals', 'dataset.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const dataset: NetworkPayload[] = JSON.parse(rawData);

  let totalScore = 0;
  let totalTests = dataset.length;

  for (let i = 0; i < totalTests; i++) {
    const payload = dataset[i];
    console.log(`\nEvaluating Profile: ${payload.target}...`);
    
    try {
      const result = await calculateCTNetworth(payload);
      
      let pass = true;
      const errors: string[] = [];

      // Constraint 1: Word length limits
      if (result.tier.split(' ').length > 4) {
        pass = false;
        errors.push(`Tier string is too long: "${result.tier}"`);
      }
      
      if (result.alphaMetric.split(' ').length > 4) {
        pass = false;
        errors.push(`AlphaMetric string is too long: "${result.alphaMetric}"`);
      }

      // Constraint 2: New length limits for UI aesthetics
      const roastWords = result.breakdown.split(' ').length;
      if (roastWords > 65) { // Giving it a tiny bit of leniency over 50
        pass = false;
        errors.push(`Roast breakdown is too long! Limit is 50 words, got ${roastWords}`);
      }

      if (!result.growthTip) {
        pass = false;
        errors.push("Missing growthTip field in JSON");
      } else {
        const tipWords = result.growthTip.split(' ').length;
        if (tipWords > 25) { // Leniency over 15
          pass = false;
          errors.push(`Growth Tip is too long! Limit is 15 words, got ${tipWords}`);
        }
      }

      // Constraint 3: Hallucination Check
      // Extract all handles from the breakdown (e.g. @username)
      const handlesInBreakdown = result.breakdown.match(/@\w+/g) || [];
      const allowedHandles = payload.followers_sample.map(f => `@${f.handle}`);
      
      // Also allow any handles that the user themselves tweeted
      payload.recent_tweets?.forEach(tweet => {
        const tweetHandles = tweet.match(/@\w+/g) || [];
        allowedHandles.push(...tweetHandles);
      });
      
      for (const h of handlesInBreakdown) {
        // Allow the target handle itself, and the follower handles
        if (h.toLowerCase() !== `@${payload.target.toLowerCase()}` && !allowedHandles.some(ah => ah.toLowerCase() === h.toLowerCase())) {
          pass = false;
          errors.push(`Hallucination Detected: AI invented handle ${h}`);
        }
      }

      if (pass) {
        console.log(`✅ ${payload.target} passed all constraints.`);
        totalScore++;
      } else {
        console.log(`❌ ${payload.target} failed constraints:`, errors);
      }

      console.log(`\nGenerated Breakdown:\n${result.breakdown}`);
      console.log(`\nGrowth Tip:\n${result.growthTip}\n`);

    } catch (e) {
      console.error(`❌ Failed to run inference on ${payload.target}`, e);
    }
  }

  console.log(`\n=== Final Score: ${totalScore}/${totalTests} Passed ===\n`);
}

runEvals();
