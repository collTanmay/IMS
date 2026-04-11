# 🔧 DEPLOYMENT TROUBLESHOOTING GUIDE

## ERRORS DURING BUILD

### ❌ "PRISMA_QUERY_ENGINE_BINARY not found"
```
When: During vercel deployment
Cause: prisma generate not running before build

Fix:
1. Open package.json
2. Ensure build script is:
   "build": "prisma generate && next build"
3. Commit and push
4. Click "Redeploy" in Vercel
```

### ❌ "next.config.js is required"
```
When: Build step
Cause: Missing Next.js config

Fix:
1. Create next.config.js in root:
   module.exports = {}
2. git add next.config.js
3. git commit -m "Add next config"
4. git push
```

### ❌ "Module not found: @/lib/prisma"
```
When: API routes during build
Cause: tsconfig.json alias issue

Fix:
Verify tsconfig.json has:
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## ERRORS AFTER DEPLOYMENT

### ❌ "DATABASE_URL is not defined"
```
When: API endpoint called
Error: undefined value for DATABASE_URL
Cause: Environment variable not set in Vercel

Fix:
1. Go Vercel Dashboard → [Your Project]
2. Settings → Environment Variables
3. Click "Add New"
4. Name: DATABASE_URL
5. Value: mysql://[user]:[pass]@[host]/[db]?sslaccept=strict
6. Check "Production"
7. Click "Save"
8. Go to Deployments
9. Find latest deployment
10. Click "•••" menu → "Redeploy"
11. Wait for redeployment
```

### ❌ "getaddrinfo ENOTFOUND [host].psdb.cloud"
```
When: API tries to connect to database
Cause: DATABASE_URL host unreachable

Fix:
1. Copy DATABASE_URL from PlanetScale directly
2. Add ?sslaccept=strict to the end
3. Don't include protocol in host
4. Example: mysql://user:pass@[region].psdb.cloud/invenflow?sslaccept=strict
```

### ❌ "SSL connection not supported"
```
When: PlanetScale connection error
Cause: Missing ssl parameters in URL

Fix:
DATABASE_URL must end with: ?sslaccept=strict

Don't use "ssl=true" - PlanetScale requires sslaccept=strict
```

### ❌ "Too many connections"
```
When: Sending multiple requests
Cause: Database connection pool exhausted

Fix:
Add connection pooling to DATABASE_URL:
...?sslaccept=strict&connection_limit=5&waitForConnections=true
```

### ❌ "502 Bad Gateway"
```
When: Accessing API endpoint
Cause: Function timeout or database latency

Fix Option 1: Increase Vercel timeout
1. Go to vercel.json
2. Add: "functions": { "api/**": { "maxDuration": 60 } }

Fix Option 2: Optimize database
1. Check PlanetScale dashboard
2. Look for slow queries
3. Add indexes to frequently queried columns

Fix Option 3: Connection pooling
...?sslaccept=strict&waitForConnections=true
```

---

## DATABASE CONNECTION ISSUES

### ❌ "Error: Cannot find module '@prisma/client'"
```
When: npm run dev locally
Cause: Prisma client not generated

Fix:
npx prisma generate
npm run dev
```

### ❌ "Tables not found" error
```
When: API returns "table does not exist"
Cause: Schema not synced to database

Fix:
1. Locally: npx prisma db push
2. Confirm database sync
3. Verify in: npx prisma studio
4. Then redeploy to Vercel
```

### ❌ "Cannot find Database"
```
When: Trying to connect to localhost
Cause: Using old .env with localhost

Fix:
1. Open .env file
2. Replace with cloud database URL
3. npm run dev (test locally)
4. Commit and push to GitHub
```

---

## PRISMA SCHEMA ISSUES

### ❌ "Validation error in datasource"
```
When: npm run dev
Cause: Invalid DATABASE_URL format

Fix:
DATABASE_URL should be:
mysql://[username]:[password]@[hostname]/[database]

NOT:
- mysql://username:password@localhost:3306/database
  (if using cloud - use full host from PlanetScale)
```

### ❌ "Relation not found on model"
```
When: Prisma schema invalid
Cause: Missing relation definition

Fix:
1. Check schema.prisma for typos in relation names
2. Ensure both sides of relation are defined
3. Run: npx prisma validate
4. Fix errors shown
```

---

## FILE & SECRETS ISSUES

### ❌ ".env committed to GitHub"
```
When: You see private data on GitHub
Cause: .env was committed before .gitignore update

Fix IMMEDIATELY:
1. Remove from Git history:
   git rm --cached .env
   git commit -m "Remove .env from tracking"

2. Invalidate exposed credentials:
   - Reset PlanetScale password
   - Create new database password
   - Update Vercel env vars

3. Force push:
   git push origin --force-with-lease
   (Only on private repos!)
```

### ❌ "Cannot read .env file"
```
When: npm run dev fails
Cause: .env doesn't exist in project root

Fix:
1. Create .env file in project root
2. Add: DATABASE_URL="..."
3. Save file
4. npm run dev again
```

---

## VERCEL SPECIFIC ISSUES

### ❌ "Build log shows "next build" issues but no DATABASE_URL"
```
When: Vercel build fails
Cause: API routes need DATABASE_URL at build time

Fix:
1. Go to Vercel env vars
2. Make sure DATABASE_URL is in:
   - Production ✓
   - Preview ✓
   
If not checked, Vercel won't pass it during build
```

### ❌ "Different build outputs each time"
```
When: Inconsistent deployments
Cause: Non-deterministic build

Fix:
1. Delete .next folder: rm -rf .next
2. npm run build
3. Check for files that change between builds
4. Ensure no process.env.RANDOM or timestamps in code
```

### ❌ "My code works locally but not on Vercel"
```
When: Production errors, local works
Cause: Environment differences

Fix:
1. Test local production build:
   npm run build
   npm run start

2. Check Vercel function logs:
   Deployments → [Latest] → Function Logs

3. Compare .env locally vs Vercel env vars

4. Look for:
   - Node.js version differences
   - Environment-specific code paths
   - Missing dependencies
```

---

## API ROUTE SPECIFIC

### ❌ "404 when calling API endpoint"
```
When: https://domain.com/api/products/all returns 404
Cause: Route file doesn't exist or wrong path

Fix:
1. Check file exists: app/api/products/all/route.ts
2. File must be named "route.ts" (not "index.ts")
3. Verify path matches URL structure
4. Check for typos in folder names
```

### ❌ "API endpoint times out"
```
When: Request hangs for 60+ seconds
Cause: Database query too slow

Fix:
1. Check query in Prisma:
   - Add indexes to frequently filtered columns
   - Limit result set with .take()
   - Use pagination

2. Increase Vercel timeout in vercel.json:
   "functions": {
     "api/**": { "maxDuration": 300 }  // 5 minutes
   }
```

### ❌ "POST request works locally but 405 on Vercel"
```
When: POST endpoint returns 405 Method Not Allowed
Cause: Route handler not exported

Fix:
Ensure export at end of route file:
export async function POST(request) { ... }

// Even if you don't use the parameter, it must be exported
```

---

## DATABASE BACKUP & DATA ISSUES

### ❌ "Accidentally deleted production data"
```
When: Data disappeared from database
Cause: Manual DELETE or bad migration

Fix:
1. Go to PlanetScale dashboard
2. Click database name
3. Go to "Backups"
4. Click "Restore" on suitable backup
5. Verify data is back
6. Check all endpoints work
```

### ❌ "Need to export all data"
```
When: Need database backup or migration
Method:
1. Vercel Production:
   DATABASE_URL="[prod url]" npx prisma db pull

2. Export to file:
   mysqldump -u user -p database > backup.sql
   (Get credentials from PlanetScale passwords)
```

---

## PERFORMANCE ISSUES

### ❌ "Requests are slow"
```
When: API endpoints take 3+ seconds
Cause: Database too far or slow queries

Fix Option 1: Query optimization
- Add indexes to WHERE clauses
- Reduce data selected with select{}
- Paginate large result sets

Fix Option 2: Database region
- PlanetScale: Choose region closest to users
- Change in database settings

Fix Option 3: Caching
- Add revalidate in API route
- Use CDN caching headers
```

### ❌ "Cold start latency"
```
When: First request to API is slow
Cause: Vercel function starting up + PlanetScale cold start

Normal behavior - expected 5-10 seconds first request
Subsequent requests should be fast (< 200ms)

If persistes, increase function timeout or add warming pings
```

---

## COMMON FIX WORKFLOW

When something breaks in production:

```
1. Check Vercel Logs
   Deployments → [Latest] → Function Logs
   
2. Check DATABASE_URL set
   Settings → Environment Variables
   
3. Test API locally with production DB
   DATABASE_URL="[prod]" npm run dev
   
4. Check PlanetScale dashboard
   Look for connection errors or blocked queries
   
5. If data issue
   PlanetScale → Backups → Restore previous
   
6. Redeploy if needed
   Deployments → Redeploy on latest
   
7. Monitor for 30 minutes
   Watch function logs for errors
```

---

## 📞 WHEN ALL ELSE FAILS

### Get Help

1. **Vercel Logs** (Best source of truth)
   - Deployments → [Your Deployment] → Function Logs
   - Copy exact error message

2. **Check Package Versions**
   ```bash
   npm list @prisma/client
   npm list next
   ```

3. **Try Fresh Deploy**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   git push origin main  # Triggers Vercel redeploy
   ```

4. **Verify All Steps**
   - [ ] DATABASE_URL set in Vercel
   - [ ] .env in .gitignore
   - [ ] package.json build script correct
   - [ ] No sensitive data in code
   - [ ] All files committed to git
   - [ ] No .next folder in git

5. **Nuclear Reset Option**
   ```bash
   # Only if all else fails
   git reset --hard HEAD
   git clean -fd
   npm install
   npm run build
   git push --force-with-lease
   # Then redeploy on Vercel
   ```

---

Remember: The Vercel function logs are your best friend! 🔍
