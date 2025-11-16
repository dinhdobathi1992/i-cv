/**
 * Vercel Serverless Function
 * Proxies OpenAI Assistant API requests securely
 * 
 * API Key is stored in Vercel Environment Variables
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, threadId, message, assistantId, runId } = req.body;

        // Get API key from environment variables
        const apiKey = process.env.OPENAI_API_KEY;
        const defaultAssistantId = process.env.ASSISTANT_ID;

        if (!apiKey) {
            return res.status(500).json({ 
                error: 'Server configuration error: API key not configured' 
            });
        }

        const baseUrl = 'https://api.openai.com/v1';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
        };

        // Handle different actions
        switch (action) {
            case 'createThread': {
                const response = await fetch(`${baseUrl}/threads`, {
                    method: 'POST',
                    headers
                });
                const data = await response.json();
                return res.status(200).json(data);
            }

            case 'addMessage': {
                if (!threadId || !message) {
                    return res.status(400).json({ error: 'threadId and message are required' });
                }
                const response = await fetch(`${baseUrl}/threads/${threadId}/messages`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        role: 'user',
                        content: message
                    })
                });
                const data = await response.json();
                return res.status(200).json(data);
            }

            case 'runAssistant': {
                if (!threadId) {
                    return res.status(400).json({ error: 'threadId is required' });
                }
                const response = await fetch(`${baseUrl}/threads/${threadId}/runs`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        assistant_id: assistantId || defaultAssistantId
                    })
                });
                const data = await response.json();
                return res.status(200).json(data);
            }

            case 'checkRunStatus': {
                if (!threadId || !runId) {
                    return res.status(400).json({ error: 'threadId and runId are required' });
                }
                const response = await fetch(`${baseUrl}/threads/${threadId}/runs/${runId}`, {
                    method: 'GET',
                    headers
                });
                const data = await response.json();
                return res.status(200).json(data);
            }

            case 'getMessages': {
                if (!threadId) {
                    return res.status(400).json({ error: 'threadId is required' });
                }
                const response = await fetch(`${baseUrl}/threads/${threadId}/messages?order=desc&limit=1`, {
                    method: 'GET',
                    headers
                });
                const data = await response.json();
                return res.status(200).json(data);
            }

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
