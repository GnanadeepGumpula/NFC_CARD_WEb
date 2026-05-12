# NFC Card Web - Debugging & Deployment Guide

## 🔴 CRITICAL ISSUE FOUND

**Problem**: Your app is showing 404 errors and data isn't loading because `SUPABASE_SERVICE_ROLE_KEY` environment variable is missing.

All server-side operations (loading cards, saving edits, authentication) use the `supabaseRestCall()` function which requires:
- ✅ `SUPABASE_URL` - You have this
- ❌ `SUPABASE_SERVICE_ROLE_KEY` - **MISSING** (this is the blocker!)

---

## ✅ Fixes Applied

I've made the following changes to your project:

### 1. **Enhanced Error Messages** ([src/lib/cards.server.ts](src/lib/cards.server.ts))
- Added detailed console logging to identify missing environment variables
- Better error messages will now show which env var is missing
- Request errors are now logged with full context

### 2. **Updated .env Files**
- [.env](.env) - Added placeholder for SUPABASE_SERVICE_ROLE_KEY
- [.env.example](.env.example) - Marked critical variables with warnings

### 3. **Improved Vercel Configuration** ([vercel.json](vercel.json))
- Added buildCommand and outputDirectory
- Configured proper cache headers for API routes
- SPA rewrite rule is now correctly placed

---

## 🔧 NEXT STEPS - YOU MUST DO THIS

### Step 1: Get Your Service Role Key
1. Go to your Supabase Dashboard
2. Navigate to **Project Settings** → **API**
3. Under "Project API keys", copy the **Service Role** key (marked as `service_role`)
4. ⚠️ **KEEP THIS SECRET** - Never commit it to GitHub!

### Step 2: Update Local Environment
1. Open [.env](.env) file in your project
2. Find this line:
   ```
   SUPABASE_SERVICE_ROLE_KEY=""
   ```
3. Paste your service role key:
   ```
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."  # Your actual key
   ```

### Step 3: Test Locally
```bash
npm run build
npm run preview
```
Then visit http://localhost:4173 and try:
- Loading the admin page
- Creating/editing a card
- Check browser DevTools Network tab for any 404s

### Step 4: Deploy to Vercel
1. **Do NOT add SUPABASE_SERVICE_ROLE_KEY to git**
2. Go to your Vercel project dashboard
3. Navigate to **Settings** → **Environment Variables**
4. Add these environment variables:
   ```
   SUPABASE_URL = https://omignhumugcpxqpfzfnp.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...  # Your service role key
   ADMIN_EMAIL = ceo@signatureday.com
   ADMIN_PASSWORD = Funny@26
   JWT_SECRET = your_secure_secret_here
   ```
5. Make sure to use the same URL you have in .env
6. Redeploy: `vercel --prod`

---

## 🐛 Debugging Tips

### If you still get 404 errors after adding the key:

1. **Check Server Logs**
   - On Vercel: Go to **Deployments** → Click your deployment → **Functions** tab
   - Look for errors starting with `[Supabase]`

2. **Check Network Tab**
   - Open DevTools → Network tab
   - Look at failed requests to `/rpc/` endpoints
   - Check the Response tab to see error messages

3. **Local Testing**
   ```bash
   npm run dev
   ```
   Watch the terminal for `[Supabase]` error logs

### If editing cards still fails:

1. Verify all URLs in your admin form are valid (test with curl)
2. Check that your Supabase database has the `cards` table with correct columns
3. Make sure the SERVICE_ROLE_KEY has INSERT/UPDATE/DELETE permissions

---

## 📋 Common Issues & Solutions

| Issue | Cause | Fix |
|-------|-------|-----|
| 404 on all pages | SPA rewrite not working | Check Vercel deployment settings |
| Data not loading | Missing SUPABASE_SERVICE_ROLE_KEY | Add key to environment variables |
| Edit not saving | Same as above | Add key to environment variables |
| Slow page loads | Cold starts on Vercel functions | Normal for serverless, improves after first call |
| CORS errors | API origin mismatch | Check SUPABASE_URL matches dashboard |

---

## 📚 Files Modified

- [src/lib/cards.server.ts](src/lib/cards.server.ts) - Better error logging
- [.env](.env) - Added SUPABASE_SERVICE_ROLE_KEY placeholder
- [.env.example](.env.example) - Updated with warnings
- [vercel.json](vercel.json) - Improved configuration

---

## ⚙️ Environment Variables Required

For **Local Development**:
```
SUPABASE_URL=https://omignhumugcpxqpfzfnp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
JWT_SECRET=your_secure_secret
ADMIN_EMAIL=ceo@signatureday.com
ADMIN_PASSWORD=Funny@26
```

For **Production (Vercel)**:
Same as above, set via Vercel dashboard Environment Variables

---

## 🚀 Quick Deploy Checklist

- [ ] Get SUPABASE_SERVICE_ROLE_KEY from Supabase dashboard
- [ ] Update .env locally with the key
- [ ] Test locally: `npm run build && npm run preview`
- [ ] Set env vars in Vercel project settings
- [ ] Deploy: `vercel --prod` or push to git (if connected)
- [ ] Test on Vercel domain
- [ ] Verify data loads and edits save

---

## 📞 Need Help?

If you're still seeing errors:
1. Check the server logs (Vercel Functions tab)
2. Look for `[Supabase]` error messages
3. Verify the service role key was copied correctly (no extra spaces)
4. Make sure the key is set in BOTH local .env AND Vercel environment variables

