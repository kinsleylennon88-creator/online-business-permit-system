// Live Chat Client with Socket.io
const liveChatClient = {
    socket: null,
    isConnected: false,
    isAuthenticated: false,
    currentUser: null,
    typingTimeout: null,
    
    init() {
        // Load Socket.io client library dynamically
        this.loadSocketIO().then(() => {
            this.connect();
            this.renderChatWidget();
        });
    },
    
    loadSocketIO() {
        return new Promise((resolve) => {
            if (window.io) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    },
    
    connect() {
        this.socket = io(window.location.origin, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5
        });
        
        this.socket.on('connect', () => {
            console.log('🔌 Connected to live chat');
            this.isConnected = true;
            this.authenticate();
        });
        
        this.socket.on('disconnect', () => {
            console.log('👋 Disconnected from live chat');
            this.isConnected = false;
            this.updateConnectionStatus('disconnected');
        });
        
        this.socket.on('authenticated', (data) => {
            this.isAuthenticated = true;
            this.currentUser = data;
            this.updateConnectionStatus('connected');
        });
        
        this.socket.on('new-message', (data) => this.handleNewMessage(data));
        this.socket.on('chat-history', (history) => this.loadHistory(history));
        this.socket.on('user-typing', (data) => this.handleTyping(data));
        this.socket.on('agent-assigned', (data) => this.handleAgentAssigned(data));
        this.socket.on('user-online', (data) => this.handleUserOnline(data));
        this.socket.on('user-offline', (data) => this.handleUserOffline(data));
        
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.showError(error.message);
        });
    },
    
    authenticate() {
        const user = auth.getUser();
        const token = localStorage.getItem('token');
        
        if (user && token) {
            this.socket.emit('authenticate', {
                token: token,
                userId: user.id,
                isAdmin: user.role === 'admin' || user.role === 'superadmin'
            });
        }
    },
    
    renderChatWidget() {
        const widget = document.createElement('div');
        widget.id = 'liveChatWidget';
        widget.className = 'live-chat-widget';
        widget.innerHTML = `
            <div class="live-chat-header" onclick="liveChatClient.toggle()">
                <div class="live-chat-status">
                    <span class="status-indicator" id="chatStatus"></span>
                    <span class="live-chat-title">Live Support</span>
                </div>
                <div class="live-chat-actions">
                    <button class="chat-action-btn" onclick="event.stopPropagation(); liveChatClient.requestAgent()" title="Request Agent">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </button>
                    <button class="chat-action-btn" onclick="event.stopPropagation(); liveChatClient.toggle()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" id="chatToggleIcon">
                            <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="live-chat-body" id="chatBody">
                <div class="live-chat-messages" id="chatMessages"></div>
                <div class="live-chat-typing" id="typingIndicator" style="display: none;">
                    <span>Someone is typing</span>
                    <span class="typing-dots"><span></span><span></span><span></span></span>
                </div>
                <div class="live-chat-input">
                    <input type="text" id="chatInput" placeholder="Type a message..." 
                        onkeypress="liveChatClient.handleKeyPress(event)"
                        oninput="liveChatClient.handleInput()">
                    <button class="chat-send-btn" onclick="liveChatClient.sendMessage()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(widget);
    },
    
    toggle() {
        const widget = document.getElementById('liveChatWidget');
        widget.classList.toggle('open');
        
        const icon = document.getElementById('chatToggleIcon');
        if (widget.classList.contains('open')) {
            icon.innerHTML = '<polyline points="6 15 12 9 18 15"></polyline>';
            this.scrollToBottom();
        } else {
            icon.innerHTML = '<polyline points="18 15 12 9 6 15"></polyline>';
        }
    },
    
    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message || !this.isConnected) return;
        
        this.socket.emit('send-message', {
            message: message,
            type: 'text'
        });
        
        input.value = '';
        this.stopTyping();
    },
    
    handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.sendMessage();
        }
    },
    
    handleInput() {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        this.socket.emit('typing-start');
        
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 3000);
    },
    
    stopTyping() {
        this.socket.emit('typing-stop');
    },
    
    handleNewMessage(data) {
        this.addMessage(data);
        this.scrollToBottom();
        
        // Show notification if chat is closed
        const widget = document.getElementById('liveChatWidget');
        if (!widget.classList.contains('open')) {
            widget.classList.add('has-new-message');
        }
    },
    
    addMessage(data) {
        const container = document.getElementById('chatMessages');
        const isMe = data.sender.id === this.currentUser?.userId;
        const isAdmin = data.sender.isAdmin;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isMe ? 'me' : ''} ${isAdmin ? 'admin' : ''}`;
        messageDiv.innerHTML = `
            <div class="chat-message-avatar">
                ${isAdmin ? '👨‍💼' : isMe ? '👤' : '👥'}
            </div>
            <div class="chat-message-content">
                <div class="chat-message-header">
                    <span class="chat-sender">${data.sender.name} ${isAdmin ? '(Agent)' : ''}</span>
                    <span class="chat-time">${this.formatTime(data.timestamp)}</span>
                </div>
                <div class="chat-message-text">${this.escapeHtml(data.message)}</div>
            </div>
        `;
        
        container.appendChild(messageDiv);
    },
    
    loadHistory(history) {
        const container = document.getElementById('chatMessages');
        container.innerHTML = '';
        
        history.forEach(msg => {
            this.addMessage({
                sender: {
                    id: msg.sender._id,
                    name: `${msg.sender.firstName} ${msg.sender.lastName}`,
                    isAdmin: msg.sender.role === 'admin'
                },
                message: msg.message,
                timestamp: msg.createdAt
            });
        });
        
        this.scrollToBottom();
    },
    
    handleTyping(data) {
        const indicator = document.getElementById('typingIndicator');
        if (data.isTyping) {
            indicator.querySelector('span').textContent = `${data.name} is typing...`;
            indicator.style.display = 'flex';
        } else {
            indicator.style.display = 'none';
        }
    },
    
    handleAgentAssigned(data) {
        this.addSystemMessage(data.message);
    },
    
    handleUserOnline(data) {
        this.addSystemMessage(`${data.name} is now online`);
    },
    
    handleUserOffline(data) {
        this.addSystemMessage(`${data.name} went offline`);
    },
    
    addSystemMessage(text) {
        const container = document.getElementById('chatMessages');
        const div = document.createElement('div');
        div.className = 'chat-system-message';
        div.textContent = text;
        container.appendChild(div);
    },
    
    requestAgent() {
        if (!this.isConnected) {
            this.showError('Not connected to chat server');
            return;
        }
        
        this.socket.emit('request-agent');
        this.addSystemMessage('Requesting a live agent...');
    },
    
    updateConnectionStatus(status) {
        const indicator = document.getElementById('chatStatus');
        indicator.className = `status-indicator ${status}`;
    },
    
    scrollToBottom() {
        const container = document.getElementById('chatMessages');
        container.scrollTop = container.scrollHeight;
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    showError(message) {
        // Use existing toast or create simple alert
        if (typeof ui !== 'undefined' && ui.toast) {
            ui.toast.error(message);
        } else {
            alert(message);
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if user is authenticated
    if (typeof auth !== 'undefined' && auth.isAuthenticated()) {
        liveChatClient.init();
    }
});
