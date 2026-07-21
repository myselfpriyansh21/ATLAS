# ATLAS Backend — Setup

Node/Express backend handling document storage, RAG (retrieval-augmented
generation) over your uploaded documents, and Firebase auth verification.
All application data — documents, embeddings, chunks — lives in Postgres,
not Firebase. Firebase is used only to verify who's making the request.

## 1. Install dependencies

```bash
cd backend
npm install
```

## 2. Set up Supabase (Postgres + pgvector)

1. Go to https://supabase.com → **New project**
2. Pick a name, generate a database password (save it somewhere), pick a region → **Create**
3. Once it's ready: **Project Settings (gear icon) → Data API / Database → Connection string**
4. Copy the **Transaction pooler** connection string (port 6543) — it looks like:
```
   postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-xx-xxxx-1.pooler.supabase.com:6543/postgres
```
5. Replace `[YOUR-PASSWORD]` with the database password you set in step 2

## 3. Run the database setup script

1. In your Supabase project, open **SQL Editor → New query**
2. Copy the entire contents of `sql/setup.sql` from this backend folder
3. Paste it in and click **Run**
4. You should see "Success. No rows returned" — this created the
   `documents` and `document_chunks` tables plus the pgvector extension

## 4. Get a Gemini API key

1. Go to https://aistudio.google.com/apikey
2. Click **Create API key** (free tier is enough for a hackathon demo)
3. Copy the key

## 5. Configure environment variables

```bash
cp .env.example .env
```

Fill in:
```
DATABASE_URL=<your Supabase connection string from step 2>
GEMINI_API_KEY=<your key from step 4>
REQUIRE_AUTH=false
```

Leave `REQUIRE_AUTH=false` for now — this lets you get everything working
end-to-end before dealing with Firebase service account setup. **Come
back and enable this before your final demo** (see step 7).

## 6. Run it

```bash
npm run dev
```

You should see:
```
ATLAS backend running on http://localhost:4000
REQUIRE_AUTH=false
```

Check `http://localhost:4000/health` in your browser — you should see:
```json
{
  "status": "ok",
  "database": { "connected": true },
  "geminiConfigured": true,
  "requireAuth": false
}
```

If `database.connected` is `false`, double-check your `DATABASE_URL` —
the error message will tell you exactly what went wrong (wrong password,
wrong host, etc).

## 7. (Before your final demo) Enable real auth verification

1. Firebase Console → your ATLAS project → **Project Settings (gear) → Service accounts**
2. Click **Generate new private key** → confirm → a JSON file downloads
3. Rename it to `firebase-service-account.json` and place it directly in
   this `backend/` folder (same level as `package.json`)
4. **Important:** this file contains real credentials — never commit it
   to git or share it publicly. It's already covered by `.gitignore` if
   you're using one.
5. In `.env`, set `REQUIRE_AUTH=true`
6. Restart the server (`npm run dev`)

Now every request to `/documents` and `/rag` requires a valid Firebase
ID token, which the frontend already sends automatically once you're
signed in.

## How it all connects

```
Frontend (Knowledge Center page)
  → sends Firebase ID token + file/question
  → Backend verifies token (if REQUIRE_AUTH=true)
  → Backend extracts text, chunks it, embeds each chunk via Gemini
  → Stores in Postgres (Supabase) with pgvector
  → On a question: embeds the question, finds closest chunks by
    cosine similarity, asks Gemini to answer using only those chunks
  → Returns answer + which documents it came from
```

## Troubleshooting

- **"DATABASE_URL not configured"** — you haven't filled in `.env`, or
  didn't restart the server after editing it
- **"connect ECONNREFUSED" or similar** — check your Supabase connection
  string is exactly right, including the password
- **Gemini errors mentioning 403 or API key** — double check your API
  key is correct and has no extra spaces
- **"relation documents does not exist"** — you haven't run
  `sql/setup.sql` in the Supabase SQL Editor yet