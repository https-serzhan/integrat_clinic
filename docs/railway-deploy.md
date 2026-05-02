# Railway Deployment

This project is ready to deploy to Railway as one service.
The backend serves both the frontend pages and the API.

## Files That Matter

- `Dockerfile` builds and starts the app from the repository root
- `.dockerignore` keeps local-only files out of the build context
- `.env.example` is the variable template you can paste into Railway
- `package.json` at the repo root gives Railway a fallback Node entrypoint when it uses Railpack instead of Docker
- `src/scripts/shared/config.js` contains the frontend runtime config that ships with the repo

## Before You Start

You need:

- a GitHub repository with this project pushed to it
- a Railway account
- a Supabase project if you want persistent production data
- Telegram bot values if you want Telegram notifications

## Recommended Data Setup

This backend can store data in local JSON files, but Railway service storage is ephemeral by default.
Railway documents that persistent data should go into a Volume, otherwise data can be lost on redeploy.

Use one of these:

1. Recommended: Supabase
   - set `SUPABASE_SYNC_ENABLED=1`
   - fill `SUPABASE_URL`
   - fill `SUPABASE_SERVICE_ROLE_KEY`
   - run the SQL from `docs/supabase-schema.md`

2. Fallback: Railway Volume
   - attach a Volume to the service
   - mount it at `/data`
   - set `INTEGRAT_DATA_DIR=/data`

## Step By Step In Railway

### 1. Push the project to GitHub

Railway will deploy from your GitHub repo.

### 2. Create a new Railway project

In Railway:

1. Click `New Project`
2. Choose `Deploy from GitHub repo`
3. Select this repository

Because the repo now has a root `Dockerfile`, Railway can build it directly from the project root.
You do not need to set a custom root directory for this setup.
The repo also has a root `package.json`, so Railway can still start correctly if it chooses the Node builder instead of Docker.

### 3. Wait for the first build

Railway will build the Docker image and start:

```bash
node src/backend/academy/server.js
```

If the deploy fails, open the service logs first.

If you see an error about `/app/package.json`, Railway is using the Node builder without a valid root package file.
This repository now includes that root file, so redeploy after pulling the latest changes.

### 4. Add environment variables

Open the service, then:

1. Go to `Variables`
2. Open `RAW Editor`
3. Paste the contents of `.env.example`
4. Replace placeholder values with your real values
5. Deploy the staged changes

Minimum production values:

- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Useful optional values:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_THREAD_ID`
- `ALLOWED_CORS_ORIGINS`
- `INTEGRAT_DATA_DIR`

### 5. Generate your website URL

Railway does not give a public website URL automatically.
Railway docs say you need to generate one in the service settings.

Do this:

1. Open your service
2. Go to `Settings`
3. Find `Networking -> Public Networking`
4. Click `Generate Domain`

Railway will create a public domain like:

```text
your-app-name.up.railway.app
```

That is your website URL.

Your home page will be:

```text
https://your-app-name.up.railway.app/
```

The backend redirects `/` to:

```text
/src/pages/index.html
```

So the root URL is the one you should share.

### 6. Optional: add your own custom domain

If you already own a domain:

1. In the same `Public Networking` section click `+ Custom Domain`
2. Enter your domain
3. Railway will give you a `CNAME` record and a `TXT` record
4. Add both records at your DNS provider
5. Wait for verification

Until the `TXT` record is verified, Railway docs say the custom domain can return `404`.

### 7. Promote your admin user

After deployment:

1. Open the Academy page on your Railway URL
2. Register the admin account you want to use
3. Open Supabase SQL editor
4. Run:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

### 8. Smoke test the live site

Check:

1. `https://your-domain-or-railway-domain/`
2. `https://your-domain-or-railway-domain/src/pages/academy.html`
3. `https://your-domain-or-railway-domain/src/pages/admin.html`
4. `https://your-domain-or-railway-domain/health`

`/health` should return HTTP `200`.

## Where To Find The URL Later

You can always find the public URL in:

- Service `Settings -> Networking -> Public Networking`

Inside the running Railway service, Railway also provides the variable:

- `RAILWAY_PUBLIC_DOMAIN`

## When You Need A Redeploy

If your repo is connected to GitHub, a new push to the connected branch will trigger a new deployment.

## Common Mistakes

### The site opens but data disappears later

You are using local file storage without Supabase or without a Railway Volume.

### The deploy works but the site has no public URL

You did not click `Generate Domain`.

### Custom domain returns `404`

Your `TXT` verification record is missing or not verified yet.

### API calls fail in the browser

Check:

- the service is healthy
- the domain was generated for the same service
- `ALLOWED_CORS_ORIGINS` includes your custom domain if you restrict CORS

## Useful Links

- Railway public networking: `https://docs.railway.com/networking/public-networking`
- Railway domains: `https://docs.railway.com/networking/domains/working-with-domains`
- Railway variables: `https://docs.railway.com/variables`
- Railway volumes: `https://docs.railway.com/volumes`
