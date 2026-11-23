# LEVEL AI backend

This backend keeps the API key on the server, not in the Android app.

## Run locally
1. Install Node.js 20 or newer.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env` and add your Gemini API key.
4. Run `npm start`.
5. Check `http://localhost:3000/health`.

## Deploy
Deploy this folder to a Node.js host that supports environment variables. Set:
- `GEMINI_API_KEY`
- optionally `GEMINI_CHAT_MODEL`

Then put the deployed HTTPS URL in `API_BASE` inside `app/app.js`.

## Image generation
The `/api/image` route currently returns HTTP 501. It is a safe placeholder, not a working image generator. Add a currently supported image model/provider, check its price and terms, and test it before enabling it. Do not assume image generation is free.
