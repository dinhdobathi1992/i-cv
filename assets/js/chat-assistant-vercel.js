/**
 * ChatGPT Assistant Integration - Vercel Version
 * Uses Vercel serverless functions to securely call OpenAI API
 */

class ChatAssistant {
    constructor(config) {
        this.apiEndpoint = config.apiEndpoint || '/api/chat';
        this.assistantId = config.assistantId || '';
        this.threadId = null;
        this.isOpen = false;
        this.messages = [];
        
        this.init();
    }

    init() {
        this.createChatUI();
        this.attachEventListeners();
        this.loadFromLocalStorage();
    }

    createChatUI() {
        const chatHTML = `
            <!-- Chat FAB Button -->
            <button class="chat-fab-button" id="chatFabButton">
                <i class="bi bi-chat-dots-fill"></i>
            </button>

            <!-- Chat Slide Container -->
            <div class="chat-slide-container" id="chatSlideContainer">
                <!-- Chat Header -->
                <div class="chat-slide-header">
                    <div class="chat-header-info">
                        <div class="chat-avatar">
                            <i class="bi bi-person-circle"></i>
                        </div>
                        <div class="chat-header-text">
                            <h3>Thi's Assistant</h3>
                            <p>Active now</p>
                        </div>
                    </div>
                    <button class="chat-close-btn" id="chatCloseBtn">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>

                <!-- Chat Messages -->
                <div class="chat-slide-messages" id="chatMessages">
                    <div class="chat-welcome">
                        <div class="chat-welcome-icon">
                            <i class="bi bi-chat-heart-fill"></i>
                        </div>
                        <h4>Hi! I'm Thi's AI Assistant</h4>
                        <p>I can help you learn more about Thi's professional background, skills, and experience. Feel free to ask me anything!</p>
                        <div class="chat-suggestions">
                            <div class="chat-suggestion-chip" data-question="Tell me about Thi's experience">
                                💼 Experience
                            </div>
                            <div class="chat-suggestion-chip" data-question="What are Thi's key skills?">
                                🛠️ Skills
                            </div>
                            <div class="chat-suggestion-chip" data-question="What certifications does Thi have?">
                                🎓 Certifications
                            </div>
                            <div class="chat-suggestion-chip" data-question="Tell me about Thi's AWS experience">
                                ☁️ AWS Projects
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chat Input -->
                <div class="chat-slide-input">
                    <div class="chat-input-wrapper">
                        <textarea 
                            class="chat-input-field" 
                            id="chatInputField" 
                            placeholder="Ask me anything about Thi..."
                            rows="1"
                        ></textarea>
                        <button class="chat-send-btn" id="chatSendBtn">
                            <i class="bi bi-send-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    attachEventListeners() {
        const fabButton = document.getElementById('chatFabButton');
        const closeBtn = document.getElementById('chatCloseBtn');
        const sendBtn = document.getElementById('chatSendBtn');
        const inputField = document.getElementById('chatInputField');
        const suggestions = document.querySelectorAll('.chat-suggestion-chip');

        fabButton.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        inputField.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
        });

        suggestions.forEach(chip => {
            chip.addEventListener('click', () => {
                const question = chip.getAttribute('data-question');
                inputField.value = question;
                this.sendMessage();
            });
        });
    }

    toggleChat() {
        const container = document.getElementById('chatSlideContainer');
        const fabButton = document.getElementById('chatFabButton');
        
        this.isOpen = !this.isOpen;
        container.classList.toggle('active');
        fabButton.classList.toggle('active');

        if (this.isOpen && !this.threadId) {
            this.createThread();
        }
    }

    async createThread() {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'createThread'
                })
            });

            const data = await response.json();
            this.threadId = data.id;
            this.saveToLocalStorage();
            console.log('Thread created:', this.threadId);
        } catch (error) {
            console.error('Error creating thread:', error);
            this.showError('Failed to initialize chat. Please try again.');
        }
    }

    async sendMessage() {
        const inputField = document.getElementById('chatInputField');
        const message = inputField.value.trim();

        if (!message) return;

        inputField.value = '';
        inputField.style.height = 'auto';

        this.addMessageToUI('user', message);
        this.showTypingIndicator();

        try {
            if (!this.threadId) {
                await this.createThread();
            }

            // Add message to thread
            await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'addMessage',
                    threadId: this.threadId,
                    message: message
                })
            });

            // Run assistant
            const runResponse = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'runAssistant',
                    threadId: this.threadId,
                    assistantId: this.assistantId
                })
            });

            const run = await runResponse.json();

            // Poll for completion
            const assistantResponse = await this.pollRunStatus(run.id);

            this.hideTypingIndicator();
            await this.addMessageWithStreamingEffect('assistant', assistantResponse);
            this.saveToLocalStorage();

        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.showError('Sorry, I encountered an error. Please try again.');
        }
    }

    async pollRunStatus(runId, maxAttempts = 60) {
        for (let i = 0; i < maxAttempts; i++) {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'checkRunStatus',
                    threadId: this.threadId,
                    runId: runId
                })
            });

            const run = await response.json();

            if (run.status === 'completed') {
                // Get messages
                const messagesResponse = await fetch(this.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'getMessages',
                        threadId: this.threadId
                    })
                });

                const messages = await messagesResponse.json();
                
                if (messages.data && messages.data[0]) {
                    const assistantMessage = messages.data[0];
                    if (assistantMessage.content && assistantMessage.content[0]) {
                        return assistantMessage.content[0].text.value;
                    }
                }

                return 'I apologize, but I could not generate a response. Please try again.';
            } else if (run.status === 'failed' || run.status === 'cancelled' || run.status === 'expired') {
                throw new Error(`Run ${run.status}`);
            }

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        throw new Error('Run timeout');
    }

    addMessageToUI(role, content) {
        const messagesContainer = document.getElementById('chatMessages');
        const welcomeMessage = messagesContainer.querySelector('.chat-welcome');
        
        if (welcomeMessage && this.messages.length === 0) {
            welcomeMessage.remove();
        }

        const messageWrapper = document.createElement('div');
        messageWrapper.className = `chat-message-wrapper ${role}`;

        const messageBubble = document.createElement('div');
        messageBubble.className = 'chat-message-bubble';

        const messageText = document.createElement('div');
        messageText.className = 'chat-message-text';
        messageText.textContent = content;

        const messageTime = document.createElement('span');
        messageTime.className = 'chat-message-time';
        messageTime.textContent = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageBubble.appendChild(messageText);
        messageBubble.appendChild(messageTime);
        messageWrapper.appendChild(messageBubble);
        messagesContainer.appendChild(messageWrapper);

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        this.messages.push({ role, content, timestamp: Date.now() });
    }

    async addMessageWithStreamingEffect(role, content) {
        const messagesContainer = document.getElementById('chatMessages');
        const welcomeMessage = messagesContainer.querySelector('.chat-welcome');
        
        if (welcomeMessage && this.messages.length === 0) {
            welcomeMessage.remove();
        }

        const messageWrapper = document.createElement('div');
        messageWrapper.className = `chat-message-wrapper ${role}`;

        const messageBubble = document.createElement('div');
        messageBubble.className = 'chat-message-bubble';

        const messageText = document.createElement('div');
        messageText.className = 'chat-message-text';
        messageText.textContent = '';

        const messageTime = document.createElement('span');
        messageTime.className = 'chat-message-time';
        messageTime.textContent = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageBubble.appendChild(messageText);
        messageBubble.appendChild(messageTime);
        messageWrapper.appendChild(messageBubble);
        messagesContainer.appendChild(messageWrapper);

        const words = content.split(' ');
        let currentText = '';
        
        for (let i = 0; i < words.length; i++) {
            currentText += (i > 0 ? ' ' : '') + words[i];
            messageText.textContent = currentText;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, 30));
        }

        this.messages.push({ role, content, timestamp: Date.now() });
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message-wrapper assistant';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showError(message) {
        const messagesContainer = document.getElementById('chatMessages');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'chat-error fade-in';
        errorDiv.textContent = message;
        messagesContainer.appendChild(errorDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    saveToLocalStorage() {
        const data = {
            threadId: this.threadId,
            messages: this.messages,
            timestamp: Date.now()
        };
        localStorage.setItem('chatAssistantData', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('chatAssistantData');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                const hoursSinceLastChat = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
                
                if (hoursSinceLastChat < 24) {
                    this.threadId = parsed.threadId;
                    this.messages = parsed.messages || [];
                    this.messages.forEach(msg => {
                        this.addMessageToUI(msg.role, msg.content);
                    });
                } else {
                    localStorage.removeItem('chatAssistantData');
                }
            } catch (error) {
                console.error('Error loading chat history:', error);
            }
        }
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chatConfig = {
        apiEndpoint: '/api/chat',
        assistantId: 'asst_REAi8hkVfcsG4pAHmFQO1Tgb'
    };

    window.chatAssistant = new ChatAssistant(chatConfig);
    console.log('Chat Assistant initialized with Vercel!');
});

