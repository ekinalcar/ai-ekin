# AI Ekin (Personal Prompt Site)

Single-page personal website that responds in Ekin's voice using the OpenAI API.

## Setup

1. Create `.env` from `.env.example` and add your OpenAI key.
2. Update the profile data in `data/ekinProfile.ts`.
3. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

## Deploy

Deploy to Vercel and set `OPENAI_API_KEY` as an environment variable.
