# FaveVerse

A cozy anime-inspired character and world roleplay app with character profiles, custom avatars, editable worlds, and an optional server-side OpenAI chat connection.

## Run the front end

The app is static HTML/CSS/JavaScript with a Vercel serverless API for AI. Open `index.html` to explore the interface, but live chat needs the API server. To run the full app locally:

1. Install Node.js.
2. In this project folder run `npm install`.
3. Run `npx vercel login` and `npm run dev`.
4. Add `OPENAI_API_KEY` to the Vercel project's environment variables (or configure it for local development with `vercel env pull .env.local`).

Never paste your API key into `app.js`, commit it to GitHub, or share it publicly. The key belongs only in the server/deployment environment. OpenAI API usage may incur charges.

## Deploy

Import this GitHub repository into Vercel. In the Vercel project settings, add `OPENAI_API_KEY` as an environment variable and redeploy. Optionally set `OPENAI_MODEL` (defaults to `gpt-4o-mini`). The chat UI checks `/api/health` and displays whether the server has a key configured.

## Features

- Anime-inspired character chat UI
- Server-side OpenAI Responses API integration; no API key in browser code
- Character profile view and edit/delete screens
- Add or edit worlds
- Add custom avatars by HTTPS image URL or upload (images limited to 500 KB)
- Browser-local character details and chat history
- Responsive layout

## Privacy and limitations

There are no accounts or cloud sync yet. Characters, avatars and conversation history are saved in the current browser's local storage. The server sends recent chat history and the character profile to OpenAI to generate a reply. API provider usage charges may apply. Treat chats as non-private and avoid sharing sensitive personal information.
