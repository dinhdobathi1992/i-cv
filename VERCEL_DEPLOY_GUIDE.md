# 🚀 Vercel Deployment Guide

## Quick Start - Deploy Your CV with Secure Chat

### Step 1: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Go to** https://vercel.com
2. **Sign up/Login** with your GitHub account
3. **Click "Add New Project"**
4. **Import your Git repository** `i-cv`
5. **Configure Project:**
   - Framework Preset: `Other`
   - Root Directory: `./`
   - Build Command: (leave empty)
   - Output Directory: `./`
6. **Add Environment Variables** (IMPORTANT!):
   - Click "Environment Variables"
   - Add these:
     ```
     OPENAI_API_KEY = sk-your-new-api-key-here
     ASSISTANT_ID = asst_REAi8hkVfcsG4pAHmFQO1Tgb
     ```
7. **Click "Deploy"**

#### Option B: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - What's your project's name? i-cv
# - In which directory is your code? ./
# - Want to modify settings? N

# Add environment variables
vercel env add OPENAI_API_KEY
# Paste your NEW OpenAI API key

vercel env add ASSISTANT_ID
# Paste: asst_REAi8hkVfcsG4pAHmFQO1Tgb

# Deploy to production
vercel --prod
```

### Step 3: Get Your NEW OpenAI API Key

⚠️ **IMPORTANT**: Create a NEW key (the old one is compromised)

1. Go to https://platform.openai.com/api-keys
2. **FIRST**: Revoke/Delete the old key (starting with `sk-proj-nSPFfi...`)
3. **Click "Create new secret key"**
4. Name it: "CV Website - Vercel"
5. **Copy the new key** (starts with `sk-...`)
6. **Save it securely** - you'll need it for Vercel

### Step 4: Test Your Deployment

1. Open your Vercel URL (e.g., `https://i-cv.vercel.app`)
2. Click the **chat button** (bottom right)
3. Ask a question: "Tell me about Thi's experience"
4. It should work! 🎉

## 🔧 Project Structure

```
i-cv/
├── api/
│   └── chat.js              # Vercel serverless function (secure!)
├── assets/
│   ├── css/
│   │   └── chat-slide.css
│   └── js/
│       ├── chat-assistant-vercel.js  # Frontend (no API key!)
│       └── chat-assistant.js         # Old version (not used)
├── index.html
├── vercel.json              # Vercel configuration
├── .env.example             # Example environment variables
└── .gitignore              # Prevents committing secrets
```

## 🔐 Security Features

✅ **API Key on Server**: Your OpenAI key is stored securely in Vercel
✅ **No Keys in Code**: Frontend code has NO secrets
✅ **CORS Enabled**: Only your domain can call the API
✅ **Rate Limiting**: Vercel provides built-in DDoS protection
✅ **Git Ignored**: .env files won't be committed

## 🎨 Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain (e.g., `dinhdobathi.com`)
4. Follow the DNS configuration instructions
5. SSL certificate is automatic!

## 🔄 Continuous Deployment

Every time you push to your GitHub repo, Vercel automatically:
1. Builds your site
2. Deploys the new version
3. Keeps your environment variables secure
4. Provides instant rollback if needed

## 📊 Monitoring

### View Logs
```bash
vercel logs
```

### Monitor Usage
- OpenAI Dashboard: https://platform.openai.com/usage
- Vercel Analytics: https://vercel.com/dashboard

## 🆘 Troubleshooting

### Chat not working?

1. **Check Environment Variables**:
   ```bash
   vercel env ls
   ```
   Make sure `OPENAI_API_KEY` and `ASSISTANT_ID` are set

2. **Check Function Logs**:
   ```bash
   vercel logs --follow
   ```

3. **Test the API directly**:
   ```bash
   curl -X POST https://your-site.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"action":"createThread"}'
   ```

### "Internal Server Error"?

- Make sure you added the environment variables
- Check that your API key is valid
- Look at the function logs: `vercel logs`

### "API key not configured"?

- You forgot to add `OPENAI_API_KEY` to Vercel
- Go to Project Settings → Environment Variables
- Add the key and redeploy

## 💰 Cost Considerations

### Vercel (FREE)
- ✅ 100GB bandwidth/month
- ✅ Unlimited serverless function executions
- ✅ Free SSL certificates
- ✅ More than enough for a CV site

### OpenAI
- 💵 Pay per use (GPT-4)
- ~$0.03 per conversation
- Set spending limits: https://platform.openai.com/account/limits

## 🚀 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Add environment variables
3. ✅ Test the chat
4. ✅ Update your GitHub repo
5. 🎉 Share your CV!

## 📝 Update Your Code

Every time you make changes:

```bash
git add .
git commit -m "Update CV"
git push origin main
```

Vercel automatically deploys! No need to run `vercel` command again.

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- OpenAI API Keys: https://platform.openai.com/api-keys
- Your Assistant: https://platform.openai.com/assistants

---

Need help? Check the Vercel logs or OpenAI status page!

