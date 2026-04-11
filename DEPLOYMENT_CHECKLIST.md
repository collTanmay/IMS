# ============================================
# VERCEL DEPLOYMENT PRE-FLIGHT CHECKLIST
# ============================================

## Local Setup ✓

- [ ] Node.js v18+ installed
- [ ] npm or yarn installed
- [ ] Git initialized and pushed to GitHub
- [ ] .env file created with DATABASE_URL
- [ ] npm install completed without errors

## Database Setup ✓

- [ ] PlanetScale or Railway account created
- [ ] Cloud MySQL database created
- [ ] DATABASE_URL connection string copied
- [ ] Schema synced: `npx prisma db push`
- [ ] Connection verified locally: `npm run dev`

## Project Configuration ✓

- [ ] package.json has correct build scripts
- [ ] prisma generate added to build step
- [ ] lib/prisma.ts has production singleton pattern
- [ ] All API routes tested locally
- [ ] No hardcoded localhost URLs
- [ ] .env.example created for documentation

## Build & Production Test ✓

- [ ] Local build works: `npm run build`
- [ ] Local start works: `npm run start`
- [ ] No TypeScript errors: `npm run build`
- [ ] API endpoints respond
- [ ] Database queries work in prod mode

## Vercel Setup ✓

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Environment variables added to Vercel:
  - [ ] DATABASE_URL
  - [ ] NODE_ENV (if needed)
  - [ ] NEXT_PUBLIC_API_URL (if needed)
- [ ] Build settings verified (auto-detected Next.js)
- [ ] Function timeout set to 60s (default)

## Deployment ✓

- [ ] Project deployed successfully
- [ ] Live URL accessible
- [ ] Function logs show no errors
- [ ] API endpoints respond in production
- [ ] Database queries work in production
- [ ] Authentication/security working

## Post-Deployment ✓

- [ ] Monitor logs for 24 hours
- [ ] Test all critical user flows
- [ ] Setup error tracking (Sentry, etc.)
- [ ] Configure monitoring/alerting
- [ ] Document production database access
- [ ] Setup backup strategy

---

## Quick Reference

### Database Connection Strings

**PlanetScale:**
```
mysql://[username]:[password]@[region].psdb.cloud/[database]?sslaccept=strict
```

**Railway:**
```
mysql://[username]:[password]@[host]:[port]/[database]
```

### Essential Commands

```bash
# Local development
npm run dev

# Test production build
npm run build
npm run start

# Sync database schema
npx prisma db push

# View database GUI
npx prisma studio

# Deploy to Vercel
vercel deploy
```

### Vercel Environment Variable Format

Add to Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL = mysql://[user]:[pass]@[host]/[db]?sslaccept=strict
NODE_ENV = production
```

---

✅ All set! Follow this checklist step-by-step for a smooth deployment.

💡 Pro tip: Start with PlanetScale on free tier - it's designed for Vercel!
