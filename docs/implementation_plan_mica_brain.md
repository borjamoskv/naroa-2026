# Implementation Plan: Real MICA Brain (Gemini 2.5)

**Goal:** Transform MICA from a scripted mock into a generative AI intelligence using Google's Gemini 2.5 Flash via Vercel AI SDK.

## User Review Required

> [!IMPORTANT]
> **API Key Required:** You will need to add `GOOGLE_GENERATIVE_AI_API_KEY` to your Vercel project environment variables (or `.env` locally) for this to work. I will provide a `.env.example`.

## Proposed Changes

### 1. Infrastructure (Dependencies)

- **Install:** `ai`, `@ai-sdk/google`, `dotenv`.
- **Alternative (Free Tier):** `npm install @ai-sdk/openai` (for Groq compatibility).
- **Config:** Ensure `vercel.json` supports directory-based API functions.

### 2. Server-Side: Vercel Function (`api/chat.js`)

- **Action:** Create a new Serverless Function.
- **Logic:**
  - Receive `messages` and `context` from client.
  - Load `data/alma.md` (System Prompt).
  - **Provider Switch:** Check `process.env.AI_PROVIDER`.
    - If `groq`: Use `createOpenAI` with `baseURL: 'https://api.groq.com/openai/v1'` and model `llama3-8b-8192`.
    - If `google` (default): Use `google('gemini-1.5-flash')`.
  - streamText logic using Vercel AI SDK.
- **File:** `[NEW] api/chat.js`

### 3. Client-Side: MICA Orchestrator (`js/core/mica-orchestrator.js`)

- **Action:** Update configuration and API handling.
- **Changes:**
  - Set `apiEndpoint: '/api/chat'`.
  - Set `useLocalFallback: false`.
  - Update `callAPI` to handle the response (Text Stream or JSON). *Note: For v1, we will use JSON response to ensure compatibility with existing typing effect, moving to stream later.*

### 4. System Prompt Injection

- **Source:** `data/alma.md`.
- **Implementation:** Read server-side to prevent exposing full prompt logic to client, or pass as context if dynamic. Decision: **Read on Server** for security and performance.

## Verification Plan

### Automated Tests

- None (Visual/Interactive feature).

### Manual Verification

1. **Local Test:** Run `vercel dev` (if available) or mock the API response to check UI handling.
   - *Constraint:* Without `vercel` CLI installed globally, running serverless functions locally with `vite` alone is tricky. I might need to mock the fetch in dev mode or guide the user to deploy to test.
   - *Workaround:* I will add a "Debug Mode" in `mica-orchestrator.js` that simulates a fetch delay and returns a dummy "AI" response if the API fails (404/500), to ensure UI resilience.
2. **Deployment Verification:**
   - User deploys to Vercel.
   - Chat with MICA: "Hola, ¿quién eres?" -> Should reply using `alma.md` persona (not the hardcoded array).
   - Check latency: Gemini 2.5 Flash should be sub-second.

## Fallback Strategy

If `/api/chat` returns 404/500 (e.g., missing API key), MICA will check `res.ok` and revert to `this.personality.responses.error` or logic from `mica-brain.js` (local mock).

### 5. MICA Reliability Enhancement

- **File:** `js/core/mica-orchestrator.js`
- **Feature:** Debug Mode & Robust Fallback
- **Changes:**
  - Add `debugMode` flag to `config`.
  - Implement `mockAIResponse()` function (simulates network delay + returns persona-aligned mock text).
  - Wrap `fetch` in a retry/fallback block.
  - If `fetch` fails or `debugMode` is true, use `mockAIResponse()`.
  - Log detailed errors to console only in debug mode.
