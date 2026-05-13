# Work Log

## Previous Session
- Fixed next/font/local error in layout.tsx
- Rewrote QuranPagesViewer to show images directly via URL instead of waiting for blob URLs
- Fixed getPageUrl() to return direct URL as fallback instead of null
- Removed blocking waits when navigating between questions
- Added "Previous" button next to "Next" button in test view
- Pages work offline with Service Worker caching

---
Task ID: 1
Agent: Main Agent
Task: Fix bug where test view shows pages from multiple questions (4 pages instead of 2)

Work Log:
- Analyzed the QuranPagesViewer component and its usage in renderTest()
- Found that QuranPagesViewer had no `key` prop in the parent component (page.tsx)
- Without a key, React reuses the component instance when navigating between questions, causing stale state
- The `useMemo` dependency used `question` object reference which could cause issues
- Added `key` prop to QuranPagesViewer in renderTest() to force remounting on question change
- Improved useMemo dependency in QuranPagesViewer to include questionKey string for robust change detection
- Added questionKey to useEffect dependency for page preloading
- Verified fix with browser testing: each question shows correct 1-2 pages, no duplication

Stage Summary:
- Root cause: Missing `key` prop on QuranPagesViewer caused React to reuse component instance across questions, leading to stale pages from previous questions persisting alongside new question pages
- Fix: Added `key={test-q-${currentQ.surah}-${currentQ.from}-${currentQ.to}-${currentQ.page}}` to QuranPagesViewer in renderTest()
- Also improved useMemo dependency from [question, surahCache] to [question, surahCache, questionKey] for extra robustness
- Verified: Q1 shows page 542 (1 page), Q2 shows pages 543-544 (2 pages), Q3 shows page 604 (1 page) - all correct with no duplication
- Navigation (next/previous) works correctly, pages update properly
