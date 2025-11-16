# Chat Assistant Setup Guide

## Overview
This guide will help you set up the ChatGPT Assistant integration for your CV website. The chat appears as a modern slide-out interface (like Messenger) where visitors can ask questions about your professional background.

## Prerequisites

1. **OpenAI Account** - You need an OpenAI account with API access
2. **OpenAI API Key** - Required for authentication
3. **Assistant ID** - Your custom-trained assistant ID

## Step 1: Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (it starts with `sk-...`)
4. Save it securely - you won't be able to see it again!

## Step 2: Create Your Assistant

1. Go to https://platform.openai.com/assistants
2. Click "Create Assistant"
3. Configure your assistant:
   - **Name**: "Thi's CV Assistant" (or any name you prefer)
   - **Instructions**: Add detailed instructions like:
     ```
     You are a helpful assistant representing Thi, a Senior DevOps Engineer.
     Your role is to answer questions about Thi's professional background,
     skills, experience, certifications, and career achievements.
     
     Key Information:
     - 9 years of experience in IT & DevOps
     - Expertise in Kubernetes, AWS, Terraform, CI/CD
     - Certifications: AWS Solutions Architect, CKA, CKS, Terraform Associate
     - Current role: Senior DevOps Engineer at GFT Group
     - Managed 40+ Kubernetes clusters
     - Achieved 30% cost reduction through optimization
     
     Be professional, friendly, and informative. Answer questions based on
     the knowledge files and CV information provided.
     ```
   - **Model**: Choose `gpt-4o` or `gpt-4-turbo` for best results
   - **Tools**: Enable "Code Interpreter" and "File Search" if needed
   
4. **Upload Knowledge Files** (Optional but recommended):
   - Upload your CV PDF
   - Upload any additional documents about your work
   - The assistant will use these to answer questions accurately

5. Click "Save"
6. Copy your **Assistant ID** (it starts with `asst_...`)

## Step 3: Configure the Chat

1. Open `assets/js/chat-assistant.js`
2. Find this section near the bottom:

```javascript
const chatConfig = {
    apiKey: 'YOUR_OPENAI_API_KEY',          // Replace with your OpenAI API key
    assistantId: 'YOUR_ASSISTANT_ID'         // Replace with your Assistant ID
};
```

3. Replace with your actual credentials:

```javascript
const chatConfig = {
    apiKey: 'sk-proj-abc123...',              // Your actual API key
    assistantId: 'asst-xyz789...'             // Your actual Assistant ID
};
```

4. Save the file

## Step 4: Test the Chat

1. Open your website (`index-new.html`)
2. Look for the **blue floating chat button** in the bottom-right corner
3. Click it to open the chat interface
4. Try asking questions like:
   - "Tell me about Thi's experience"
   - "What are Thi's key skills?"
   - "What certifications does Thi have?"
   - "Tell me about Thi's AWS experience"

## Features

### 🎨 Modern Design
- Messenger-style slide-out interface
- Smooth animations and transitions
- Mobile-responsive design
- Dark theme matching your CV

### 💬 Smart Conversations
- Powered by ChatGPT Assistant API
- Context-aware responses
- Maintains conversation history
- Typing indicators

### 💾 Session Management
- Saves conversation history (24 hours)
- Persists across page reloads
- Auto-clears old conversations

### 🎯 Quick Suggestions
- Pre-defined question chips
- One-click common questions
- Helps visitors get started

## Customization

### Change Chat Colors

Edit `assets/css/chat-slide.css`:

```css
:root {
    --chat-primary: #5b67f1;        /* Main chat color */
    --chat-secondary: #6c7dff;      /* Secondary color */
    --chat-bg: #1a1d29;             /* Background */
    --chat-user-bubble: #5b67f1;    /* User message color */
    --chat-ai-bubble: #3a3f51;      /* AI message color */
}
```

### Change Assistant Name

Edit the HTML in `assets/js/chat-assistant.js`:

```javascript
<h3>Thi's Assistant</h3>  // Change this to your preferred name
```

### Customize Suggestions

Edit the suggestion chips in `assets/js/chat-assistant.js`:

```javascript
<div class="chat-suggestion-chip" data-question="Your question here">
    🎯 Button Text
</div>
```

## Pricing Information

OpenAI charges for:
- **Assistant API calls** - Based on tokens used
- **GPT-4** models are more expensive than GPT-3.5
- **File storage** for uploaded documents

**Estimated costs**: 
- ~$0.03 per conversation (GPT-4)
- ~$0.01 per conversation (GPT-3.5-turbo)

Monitor your usage at: https://platform.openai.com/usage

## Security Best Practices

⚠️ **IMPORTANT SECURITY NOTES**:

1. **Never commit API keys to Git**:
   ```bash
   # Add to .gitignore
   echo "assets/js/chat-assistant.js" >> .gitignore
   ```

2. **Use environment variables** (for production):
   - Store keys server-side
   - Use a backend API to proxy requests
   - Never expose keys in client-side code

3. **Set API usage limits**:
   - Go to https://platform.openai.com/account/limits
   - Set monthly spending limits
   - Enable email alerts

4. **For production deployment**:
   - Consider using a backend service
   - Implement rate limiting
   - Add authentication for chat access

## Troubleshooting

### Chat button doesn't appear
- Check browser console for errors
- Ensure `chat-assistant.js` is loaded
- Verify CSS file is linked correctly

### "API Key not configured" error
- Check that you've replaced `YOUR_OPENAI_API_KEY`
- Ensure there are no extra spaces or quotes
- Verify the key starts with `sk-`

### "Failed to initialize chat" error
- Verify your API key is valid
- Check your OpenAI account has credits
- Ensure API key has correct permissions

### Assistant not responding correctly
- Review your assistant instructions
- Upload your CV as a knowledge file
- Try regenerating responses in the playground
- Check the assistant is using the correct model

### CORS errors
- This won't work on `file://` protocol
- Use a local server (like `python -m http.server`)
- Or deploy to a web host

## Alternative: Backend Proxy (Recommended for Production)

For production use, create a backend API:

```javascript
// Instead of calling OpenAI directly, call your backend
async sendMessage(message) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    return await response.json();
}
```

This keeps your API key secure on the server.

## Support

If you need help:
1. Check OpenAI documentation: https://platform.openai.com/docs
2. Review assistant playground: https://platform.openai.com/playground
3. Check API status: https://status.openai.com

## Next Steps

1. ✅ Get your API key
2. ✅ Create your assistant
3. ✅ Configure `chat-assistant.js`
4. ✅ Test the chat
5. ✅ Customize colors and text
6. ✅ Upload knowledge files to your assistant
7. ✅ Deploy to your website

Enjoy your new AI-powered CV chat! 🚀

