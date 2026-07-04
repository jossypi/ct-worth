# CT-Worth Agent Instructions

Welcome to the CT-Worth codebase. If you are an AI assistant helping to build or maintain this project, adhere to the following rules:

1. **Architecture & API:** 
   - `src/lib/scraper.ts`: Handles all external scraper logic. **Critical:** It intentionally downloads Twitter profile pictures and converts them to Base64 in the backend to prevent frontend Canvas taint errors during export. Do NOT revert this proxy behavior.
   - `src/lib/deepseek.ts`: Contains the AI orchestration (regardless of which LLM provider is configured in the environment). We intentionally use a *deflated economy* model (`Base: 1500 + Follower*0.2 + Whales*1.5`) so average users get grouped in the $10k-$100k brackets for maximum roast potential. Do not alter the math to make people richer.
   - `src/components/NetworkDashboard.tsx`: Handles all export logic and Meme Mode.

2. **Memes & Assets:**
   - Valid memes are stored in `public/memes/` (`gigachad.png`, `pepe.png`, `wojak.png`). Do not try to add arbitrary missing memes, or `html-to-image` will crash on 404s.

3. **Styling & UI:**
   - We use `Plus Jakarta Sans`. Do not revert to `Geist`.
   - All text and spacing are hyper-optimized to ensure the `html-to-image` export node (`exportRef`) generates identical results to the DOM. Avoid using CSS filters (like `mix-blend-mode`) on images inside the export node, as they crash standard canvas engines.

See `AGENTS.md` for framework-specific boundaries.
