# ============================================
# DEPLOYMENT GUIDE - Vercel + Cloud MySQL
# ============================================

## STEP 1: Choose Your Cloud Database Provider

### Option A: PlanetScale (RECOMMENDED ⭐)
✅ Pros:
- MySQL-compatible, works perfectly with Prisma
- Free tier for small projects
- Built-in connection pooling
- Auto-scaling
- GitHub integration

📝 Setup Steps:
1. Go to https://planetscale.com
2. Sign up with GitHub account
3. Create new database (e.g., "invenflow")
4. Go to "Passwords" tab → Create password
5. Copy the connection string (looks like: mysql://xxxxx:xxxxx@xxxxx.psdb.cloud/invenflow)
6. Update .env locally and in Vercel

### Option B: Railway
✅ Pros:
- Simple dashboard
- Good free tier
- Easy to manage

📝 Setup Steps:
1. Go to https://railway.app
2. Create new project
3. Add MySQL service
4. Copy connection string from Variables tab
5. Update DATABASE_URL

### Option C: AWS RDS (for production)
✅ Pros:
- Enterprise-grade
- Auto-backups
- More control

---

## STEP 2: Update Local Database Connection

1. Get your cloud database URL from PlanetScale or Railway
2. Update .env file with the connection string:
   DATABASE_URL="your_cloud_database_url_here"

3. Test locally:
   npm run dev
   
4. Run migrations locally:
   npx prisma migrate dev --name init
   
   This will:
   ✓ Create database schema
   ✓ Generate Prisma client
   ✓ Create migration files

---

## STEP 3: Push Schema to Cloud Database

```bash
# Push Prisma schema to cloud database
npx prisma db push

# Or run migrations if you prefer versioned migrations
npx prisma migrate deploy

# Verify connection and schema
npx prisma studio
```

---

## STEP 4: Prepare for Vercel Deployment

### A. Create .env.production.local (for local testing of prod build)
```
DATABASE_URL="your_cloud_database_url"
NODE_ENV="production"
```

### B. Test production build locally
```bash
npm run build
npm run start
```

This should complete without errors.

---

## STEP 5: Deploy to Vercel

### Option 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel deploy
```

### Option 2: GitHub Integration (Easiest)

1. Push code to GitHub
2. Go to https://vercel.com
3. Sign in with GitHub
4. Click "New Project"
5. Select your repository
6. Click "Import"
7. Go to Settings → Environment Variables
8. Add DATABASE_URL with your cloud database URL
9. Click Deploy

---

## STEP 6: Add Environment Variables to Vercel

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable:

| Variable | Value | Environments |
|----------|-------|--------------|
| DATABASE_URL | your_cloud_db_url | Production, Preview, Development |
| NODE_ENV | production | Production only |
| NEXT_PUBLIC_API_URL | https://your-domain.vercel.app | Production |

3. Click "Save"
4. Redeploy the project

---

## STEP 7: Verify Deployment

✅ Check these:

1. Open your live URL: https://your-project.vercel.app
2. Test API endpoint: https://your-project.vercel.app/api/products/all
3. Check Vercel logs:
   - Click project
   - Go to "Deployments"
   - Click latest deployment
   - View "Function Logs"

---

## STEP 8: Use Prisma Studio on Production

```bash
# Connect to production database
DATABASE_URL="your_production_url" npx prisma studio

# This opens http://localhost:5555 with your production data
# Only in development for debugging!
```

---

## TROUBLESHOOTING

### Error: "Connection failed"
❌ Issue: DATABASE_URL not set in Vercel env vars
✅ Fix: Go to Vercel Settings → Environment Variables → Add DATABASE_URL

### Error: "PRISMA_QUERY_ENGINE_BINARY not found"
❌ Issue: prisma generate not running before build
✅ Fix: Ensure package.json has:
   "build": "prisma generate && next build"

### Error: "Operation \`prismaClient.product.findMany()\` returned null"
❌ Issue: Database empty or schema mismatch
✅ Fix: Run npx prisma db push to sync schema

### Error: "SSL connection error"
❌ Issue: PlanetScale SSL certificate
✅ Fix: Add ?sslaccept=strict to DATABASE_URL end
   Example: ...invenflow?sslaccept=strict

### 502 Bad Gateway
❌ Issue: API timeout or database connection pool exhausted
✅ Fix: Increase connection pool in DATABASE_URL:
   ...invenflow?sslaccept=strict&waitForConnections=true

---

## FINAL CHECKLIST

Before going live:

- [ ] Database created on PlanetScale/Railway
- [ ] DATABASE_URL works in .env locally
- [ ] npm run dev works without database errors
- [ ] npm run build completes successfully
- [ ] npm run start works on localhost:3000
- [ ] DATABASE_URL added to Vercel env vars
- [ ] Project deployed to Vercel
- [ ] Live URL responds successfully
- [ ] API endpoints return data
- [ ] Database operations work in production

---

## PRODUCTION BEST PRACTICES

✅ Enable Query Logging for debugging:
```env
DEBUG="prisma:*"
```

✅ Monitor connection pool:
```env
DATABASE_URL="...?connection_limit=5"
```

✅ Setup error tracking:
Consider adding Sentry for production error monitoring

✅ Regular backups:
- PlanetScale: Automated daily
- Railway: Export data regularly
- AWS RDS: Automated snapshots

✅ Keep dependencies updated:
```bash
npm update
npx prisma migrate deploy  # after any Prisma updates
```

---

## NEXT STEPS

After successful deployment:

1. Monitor Vercel logs for errors
2. Test each API endpoint in production
3. Setup GitHub actions for automated migrations
4. Configure database backups
5. Setup error tracking (Sentry, etc.)
6. Monitor database performance in PlanetScale/Railway dashboard

Happy deploying! 🚀
