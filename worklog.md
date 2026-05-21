---
Task ID: 1
Agent: Main Agent
Task: Fix PreconditionFailed error and start the application

Work Log:
- Identified that PreconditionFailed error occurs when fetching quran-data.json on serverless/cloud platforms
- The 1.9MB quran-data.json was in public/ folder and was being fetched at runtime via fetch()
- When the serverless function is in pending state, it returns PreconditionFailed instead of the JSON data
- Created a dedicated quran-data-loader.ts with automatic retry logic (up to 10 retries with exponential backoff)
- Moved quran-data.json out of public/ folder to data/ folder to prevent Next.js dev server from crashing when serving the large file
- Created a mini-service (port 3002) to serve quran-data.json efficiently via Bun file server
- Updated the loader to fetch via Caddy gateway with XTransformPort=3002
- Removed the old resilient-fetch.ts (no longer imported)
- Removed the API route for quran-data (was also crashing the server)
- Updated global-error.tsx with better error handling for PreconditionFailed
- Updated layout.tsx with inline fetch retry script for serverless cold starts
- Both Next.js (port 3000) and Quran data service (port 3002) are running and working
- App loads correctly through Caddy gateway (port 81)
- All features preserved: course selection, surah display, question building, test generation, position change (once per question, -3 points), Quran page images, WhatsApp sharing

Stage Summary:
- Root cause: PreconditionFailed error from serverless platform when function is in pending state
- Fix: Robust retry logic in quran-data-loader.ts + separate Bun file server for large JSON data
- App is functional and accessible through the preview panel
