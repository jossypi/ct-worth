# CT-Worth (Proof of Clout)

A viral Next.js web application that analyzes a user's Crypto Twitter profile, scrapes their "whales" (high-value followers), and uses DeepSeek AI to generate a ruthless, deflated net-worth valuation and a savage roast.

## Features
- **Follower Scraping:** Integrates with RapidAPI to pull a user's profile and top followers.
- **DeepSeek V3 Persona:** Uses a custom deflated economy model and a cynical AI persona to generate accurate "Crypto Twitter" tier rankings, toxic roasts, and implied net worth.
- **Viral Receipts:** Generates a highly stylized 16:9 holographic receipt.
- **Meme Mode:** Users can toggle interactive, randomly seeded memes (Gigachad, Pepe, Wojak) behind their receipt.
- **100% Client-Side Export:** Uses `html-to-image` combined with a backend Base64 image proxy to bypass strict Twitter CDN CORS policies for flawless downloads.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Lucide Icons
- **Typography:** Plus Jakarta Sans
- **AI/LLM:** Your Choice
- **Data:** Your Prefered Choice
- **Analytics:** Your Choice

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Set up your `.env.local` file:
   ```env
   SCRAPER_API_KEY=your_scraper_api_key
   LLM_API_KEY=your_llm_api_key
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
