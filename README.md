# Courseify

Type what you want to learn and an AI builds a step-by-step course for you.
Sign in is Google only. Prompts that aren't about learning something are rejected.

## Run it

You need the backend (`../backend`) and this app running together.

```bash
# backend
cd ../backend
cp .env.example .env      # fill in the keys, see below
npx prisma migrate dev    # first time only
npm run dev               # http://localhost:8000

# frontend
npm install
npm run dev               # http://localhost:5173
```

Backend `.env` needs `DATABASE_URL`, `JWT_ACCESS_SECRET`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET` and `OPENAI_API_KEY`. In the Google console, add
`http://localhost:5173/api/auth/google/callback` as an authorized redirect URI.

The dev server proxies `/api` to the backend, so open the app on `localhost:5173`.

## How it fits together

- `src/pages/Login.jsx`: landing page. The prompt box saves your text and sends you to Google.
- `src/context/AuthContext.jsx` + `src/lib/api.js`: session handling. A short-lived access token
  lives in memory; an httpOnly refresh cookie renews it automatically.
- `src/pages/home.jsx`: sends the prompt to `POST /api/courses/preview` and shows the roadmap.
