<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Additional CT-Worth Agent Rules
- See `CLAUDE.md` for specific domain knowledge regarding the scraper, meme engines, and LLM prompting.
- Always verify changes locally before pushing. Do not overwrite the Base64 image proxy in `scraper.ts`.
- The product relies heavily on `html-to-image`. Remember that `html-to-image` cannot process cross-origin images or complex CSS blend modes correctly across all browsers.
