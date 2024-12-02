import { Configuration, OpenAIApi } from 'openai';

// Initialize OpenAI configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, context } = req.body;

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an AI assistant for a personal website. Use the following context to answer questions about the website owner: ${context}`
                },
                {
                    role: "user",
                    content: message
                }
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        return res.status(200).json({ response: completion.data.choices[0].message.content });
    } catch (error) {
        console.error('Error in chat API:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}