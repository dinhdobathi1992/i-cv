# ⚠️ SECURITY WARNING - API Key Exposure

## What Happened?
Your OpenAI API key was exposed in the Git repository. GitHub's secret scanning detected it and blocked the push.

## What You Need to Do:

### 1. **IMMEDIATELY Revoke the Exposed API Key**
1. Go to https://platform.openai.com/api-keys
2. Find the key starting with `sk-proj-nSPFfi...`
3. Click **"Revoke"** or **"Delete"**
4. Create a new API key

### 2. **Remove the Key from Git History**
The key is still in your Git history. You need to remove it:

```bash
# Install BFG Repo Cleaner (easier than git filter-branch)
brew install bfg  # On macOS

# Or use git filter-branch (built-in but slower)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch assets/js/chat-assistant.js" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to remote (WARNING: This rewrites history)
git push origin --force --all
```

### 3. **Use a Backend Proxy (REQUIRED for Production)**

Since GitHub Pages only hosts static files, you **CANNOT** safely use API keys. You need a backend service.

## Solutions:

### **Option A: Use Vercel/Netlify Functions (Recommended)**

1. **Create a serverless function** to proxy OpenAI requests
2. **Deploy to Vercel/Netlify** (free tier available)
3. **Call your function** from the frontend

Example structure:
```
api/
  chat.js  (serverless function with API key)
```

### **Option B: Use Backend Service**

Deploy a simple Node.js/Python backend:
- **Heroku** (free tier)
- **Railway** (free tier)
- **AWS Lambda** (free tier)
- **Google Cloud Functions** (free tier)

### **Option C: Disable Chat Feature**

If you can't set up a backend, disable the chat:
1. Remove chat button from HTML
2. Remove chat scripts
3. Deploy without AI features

## Why This Matters:

- ✅ **API Key = Credit Card**: Anyone can use your key and rack up charges
- ✅ **GitHub History**: Once in Git, it's there forever unless removed
- ✅ **Bots Scan GitHub**: Automated bots search for exposed keys
- ✅ **Your Bill**: You'll be charged for all usage, even if stolen

## Quick Fix for Now:

1. **Revoke the old key** (MOST IMPORTANT)
2. **Remove from code** (done)
3. **Don't commit new key** 
4. **Set up backend proxy** (for production)

## Alternative: Local Testing Only

If you only want to test locally:
1. Create `assets/js/chat-config.js` (gitignored)
2. Add your key there
3. Import it in chat-assistant.js
4. Deploy without this file

## Need Help?

Read the complete guide:
- OpenAI Security: https://platform.openai.com/docs/guides/safety-best-practices
- GitHub Secret Scanning: https://docs.github.com/code-security/secret-scanning

