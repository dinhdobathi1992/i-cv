/**
 * Gemini AI Assistant Integration
 * Simple request/response chat with CV knowledge base
 */

class ChatAssistant {
    constructor(config) {
        this.apiEndpoint = config.apiEndpoint || '/api/chat';
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
            <button class="chat-fab-button" id="chatFabButton">
                <i class="bi bi-chat-dots-fill"></i>
            </button>
            <div class="chat-slide-container" id="chatSlideContainer">
                <div class="chat-slide-header">
                    <div class="chat-header-info">
                        <div class="chat-avatar">
                            <i class="bi bi-person-circle"></i>
                        </div>
                        <div class="chat-header-text">
                            <h3>Thi's Assistant</h3>
                            <p>Powered by Gemini</p>
                        </div>
                    </div>
                    <button class="chat-close-btn" id="chatCloseBtn">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
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
                            <div class="chat-suggestion-chip" data-question="Tell me about Thi's AI and automation work">
                                🤖 AI Projects
                            </div>
                        </div>
                    </div>
                </div>
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
                inputField.value = chip.getAttribute('data-question');
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
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    history: this.messages.slice(-10)
                })
            });

            const data = await response.json();

            this.hideTypingIndicator();

            if (data.error) {
                this.showError(data.error);
                return;
            }

            await this.addMessageWithStreamingEffect('assistant', data.reply);
            this.saveToLocalStorage();

        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.showError('Sorry, I encountered an error. Please try again.');
        }
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
        messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
        messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
        if (typingIndicator) typingIndicator.remove();
    }

    showError(message) {
        const messagesContainer = document.getElementById('chatMessages');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'chat-error fade-in';
        errorDiv.textContent = message;
        messagesContainer.appendChild(errorDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        setTimeout(() => errorDiv.remove(), 5000);
    }

    saveToLocalStorage() {
        localStorage.setItem('chatAssistantData', JSON.stringify({
            messages: this.messages,
            timestamp: Date.now()
        }));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('chatAssistantData');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                if ((Date.now() - parsed.timestamp) / (1000 * 60 * 60) < 24) {
                    this.messages = parsed.messages || [];
                    this.messages.forEach(msg => this.addMessageToUI(msg.role, msg.content));
                } else {
                    localStorage.removeItem('chatAssistantData');
                }
            } catch (error) {
                console.error('Error loading chat history:', error);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.chatAssistant = new ChatAssistant({
        apiEndpoint: '/api/chat'
    });
});
