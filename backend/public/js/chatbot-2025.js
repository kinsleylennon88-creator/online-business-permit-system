/**
 * Enhanced Chatbot 2025 - Janiuay BPLO
 * Modern conversational UI with AI-powered features
 */

(function() {
    'use strict';

    const Chatbot2025 = {
        // Configuration
        config: {
            botName: 'Janiuay Assistant',
            botAvatar: `<svg viewBox="0 0 100 100" width="40" height="40">
                <defs>
                    <linearGradient id="robotBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#3b82f6"/>
                        <stop offset="100%" stop-color="#1d4ed8"/>
                    </linearGradient>
                    <linearGradient id="metal" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#e5e7eb"/>
                        <stop offset="50%" stop-color="#9ca3af"/>
                        <stop offset="100%" stop-color="#6b7280"/>
                    </linearGradient>
                    <radialGradient id="ledGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#10b981"/>
                        <stop offset="100%" stop-color="#059669"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="url(#robotBlue)"/>
                <rect x="25" y="30" width="50" height="40" rx="12" fill="url(#metal)"/>
                <rect x="18" y="42" width="7" height="16" rx="3" fill="#6b7280"/>
                <rect x="75" y="42" width="7" height="16" rx="3" fill="#6b7280"/>
                <rect x="47" y="20" width="6" height="12" rx="1" fill="#6b7280"/>
                <circle cx="50" cy="17" r="5" fill="#10b981"/>
                <rect x="30" y="38" width="40" height="26" rx="8" fill="#1f2937"/>
                <circle cx="38" cy="48" r="5" fill="url(#ledGlow)"/>
                <circle cx="62" cy="48" r="5" fill="url(#ledGlow)"/>
                <circle cx="39.5" cy="46.5" r="1.5" fill="#fff" opacity="0.8"/>
                <circle cx="63.5" cy="46.5" r="1.5" fill="#fff" opacity="0.8"/>
                <path d="M40 58 Q50 62 60 58" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
                <rect x="42" y="70" width="16" height="6" rx="2" fill="#6b7280"/>
                <path d="M25 76 Q25 72 30 72 L70 72 Q75 72 75 76 L75 80 Q75 84 70 84 L30 84 Q25 84 25 80 Z" fill="#4b5563"/>
            </svg>`,
            userAvatar: '👤',
            primaryColor: '#3b82f6',
            accentColor: '#fbbf24',
            typingDelay: 1000,
            maxHistory: 50,
            suggestionsEnabled: true,
            voiceEnabled: true,
            fileUploadEnabled: true,
            analyticsEnabled: true
        },

        // State
        state: {
            isOpen: false,
            isTyping: false,
            conversationHistory: [],
            sessionId: null,
            userContext: {},
            lastActivity: Date.now(),
            unreadCount: 0
        },

        // Knowledge Base
        knowledgeBase: {
            greetings: [
                "Hello! Welcome to Janiuay Business Permit System. I'm here to help you with your permit applications.",
                "Hi there! How can I assist you with your business permit today?",
                "Welcome! I'm your digital assistant for all things related to business permits in Janiuay."
            ],
            
            permitTypes: {
                new: {
                    name: "New Business Permit",
                    requirements: ["Barangay Clearance", "DTI Registration", "Zoning Clearance", "Occupancy Permit"],
                    fee: "Starting at ₱500",
                    duration: "2-3 business days"
                },
                renewal: {
                    name: "Permit Renewal",
                    requirements: ["Previous Permit", "Updated Barangay Clearance", "Tax Clearance"],
                    fee: "Starting at ₱400",
                    duration: "1-2 business days"
                },
                change: {
                    name: "Business Changes",
                    requirements: ["Amendment Form", "Supporting Documents", "Payment"],
                    fee: "Starting at ₱300",
                    duration: "1-2 business days"
                }
            },

            faq: {
                "requirements": "For a new business permit, you'll need: Barangay Business Clearance, DTI/SEC/CDA Registration, Zoning Clearance, Occupancy Permit, and Community Tax Certificate (Cedula).",
                "fees": "Mayor's Permit starts at ₱500 for micro-businesses. Additional fees include Business Tax (varies by gross sales), Sanitary Permit (₱100), and Fire Safety Inspection (₱150).",
                "processing time": "New permits take 2-3 business days, renewals 1-2 business days, provided all requirements are complete.",
                "renewal": "Permits must be renewed annually. We recommend starting 30 days before expiration to avoid penalties. Late renewals have a 25% surcharge.",
                "track": "You can track your application status in real-time through your dashboard after logging in.",
                "online": "Yes! Our online system allows you to apply from anywhere. All documents can be submitted digitally.",
                "payment": "We accept online payments via credit/debit card, GCash, Maya, and bank transfer. You can also pay at the Municipal Hall.",
                "barangay": "We serve all 40+ barangays of Janiuay including Poblacion, Bucari, Aquino, San Pedro, Lopez Jaena, and more."
            },

            quickReplies: {
                default: [
                    { label: "📋 New Permit", action: "new_permit" },
                    { label: "🔄 Renew Permit", action: "renew_permit" },
                    { label: "💰 Check Fees", action: "check_fees" },
                    { label: "📄 Requirements", action: "requirements" },
                    { label: "🔍 Track Status", action: "track_status" },
                    { label: "💬 Talk to Human", action: "human_handoff" }
                ],
                new_permit: [
                    { label: "Sole Proprietorship", action: "business_sole" },
                    { label: "Partnership", action: "business_partnership" },
                    { label: "Corporation", action: "business_corporation" },
                    { label: "Cooperative", action: "business_cooperative" },
                    { label: "← Back", action: "back_to_main" }
                ],
                renew_permit: [
                    { label: "Early Renewal", action: "renew_early" },
                    { label: "Late Renewal", action: "renew_late" },
                    { label: "Lost Permit", action: "renew_lost" },
                    { label: "← Back", action: "back_to_main" }
                ],
                fees: [
                    { label: "Micro Business", action: "fees_micro" },
                    { label: "Small Business", action: "fees_small" },
                    { label: "Medium Business", action: "fees_medium" },
                    { label: "← Back", action: "back_to_main" }
                ]
            }
        },

        // DOM Elements
        elements: {},

        // Initialize
        init() {
            this.state.sessionId = this.generateSessionId();
            this.loadHistory();
            this.createUI();
            this.attachEvents();
            this.injectStyles();
            
            // Welcome message after 3 seconds
            setTimeout(() => {
                if (!this.state.isOpen && this.state.unreadCount === 0) {
                    this.showNotificationBadge();
                }
            }, 3000);

            console.log('🤖 Chatbot 2025 initialized');
        },

        generateSessionId() {
            return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        loadHistory() {
            const saved = localStorage.getItem('chatbot_history');
            if (saved) {
                try {
                    this.state.conversationHistory = JSON.parse(saved);
                    this.state.unreadCount = parseInt(localStorage.getItem('chatbot_unread') || '0');
                } catch (e) {
                    console.error('Failed to load chat history');
                }
            }
        },

        saveHistory() {
            localStorage.setItem('chatbot_history', JSON.stringify(
                this.state.conversationHistory.slice(-this.config.maxHistory)
            ));
            localStorage.setItem('chatbot_unread', this.state.unreadCount.toString());
        },

        createUI() {
            // Remove existing chatbot
            const existing = document.getElementById('chatbot-2025');
            if (existing) existing.remove();

            // Create container
            const container = document.createElement('div');
            container.id = 'chatbot-2025';
            container.innerHTML = `
                <!-- Toggle Button -->
                <button class="chatbot-toggle" id="chatbotToggle" aria-label="Open chat">
                    <span class="toggle-icon">${this.config.botAvatar}</span>
                    <span class="notification-badge" id="chatNotificationBadge" style="display: none;">1</span>
                </button>

                <!-- Chat Window -->
                <div class="chatbot-window" id="chatbotWindow">
                    <!-- Header -->
                    <div class="chatbot-header">
                        <div class="bot-info">
                            <div class="bot-avatar">${this.config.botAvatar}</div>
                            <div class="bot-details">
                                <h3>${this.config.botName}</h3>
                                <span class="status">
                                    <span class="status-dot"></span>
                                    Online
                                </span>
                            </div>
                        </div>
                        <div class="header-actions">
                            <button class="header-btn" id="chatHistoryBtn" title="History">📜</button>
                            <button class="header-btn" id="chatMinimizeBtn" title="Minimize">➖</button>
                            <button class="header-btn" id="chatCloseBtn" title="Close">✕</button>
                        </div>
                    </div>

                    <!-- Messages Container -->
                    <div class="chatbot-messages" id="chatbotMessages">
                        <div class="welcome-message">
                            <div class="message-avatar">${this.config.botAvatar}</div>
                            <div class="message-content">
                                <p>${this.getRandomGreeting()}</p>
                                <span class="message-time">${this.formatTime()}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Typing Indicator -->
                    <div class="typing-indicator" id="typingIndicator" style="display: none;">
                        <div class="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span class="typing-text">${this.config.botName} is typing...</span>
                    </div>

                    <!-- Quick Replies -->
                    <div class="quick-replies" id="quickReplies">
                        ${this.renderQuickReplies('default')}
                    </div>

                    <!-- Input Area -->
                    <div class="chatbot-input-area">
                        <div class="input-container">
                            <button class="input-btn attachment-btn" id="attachmentBtn" title="Attach file">
                                📎
                            </button>
                            <input type="file" id="fileInput" hidden accept=".pdf,.jpg,.png,.jpeg">
                            
                            <textarea 
                                class="chatbot-input" 
                                id="chatbotInput" 
                                placeholder="Type your message..."
                                rows="1"
                            ></textarea>
                            
                            <button class="input-btn voice-btn" id="voiceBtn" title="Voice input">
                                🎤
                            </button>
                            
                            <button class="send-btn" id="sendBtn" title="Send message">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                        
                        <!-- Voice Recording Indicator -->
                        <div class="voice-recording" id="voiceRecording" style="display: none;">
                            <div class="recording-wave">
                                <span></span><span></span><span></span><span></span><span></span>
                            </div>
                            <span class="recording-text">Recording...</span>
                            <button class="stop-recording" id="stopRecording">⏹</button>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="chatbot-footer">
                        <button class="footer-link" id="humanHandoff">💁 Talk to Human</button>
                        <button class="footer-link" id="giveFeedback">⭐ Give Feedback</button>
                        <span class="powered-by">Powered by AI</span>
                    </div>
                </div>

                <!-- History Modal -->
                <div class="history-modal" id="historyModal" style="display: none;">
                    <div class="history-content">
                        <div class="history-header">
                            <h3>📜 Conversation History</h3>
                            <button class="close-history" id="closeHistory">✕</button>
                        </div>
                        <div class="history-list" id="historyList"></div>
                        <button class="clear-history" id="clearHistory">Clear All History</button>
                    </div>
                </div>

                <!-- Feedback Modal -->
                <div class="feedback-modal" id="feedbackModal" style="display: none;">
                    <div class="feedback-content">
                        <h3>How was your experience?</h3>
                        <div class="rating-stars">
                            <button class="star" data-rating="1">⭐</button>
                            <button class="star" data-rating="2">⭐</button>
                            <button class="star" data-rating="3">⭐</button>
                            <button class="star" data-rating="4">⭐</button>
                            <button class="star" data-rating="5">⭐</button>
                        </div>
                        <textarea placeholder="Tell us more (optional)..."></textarea>
                        <div class="feedback-actions">
                            <button class="btn-cancel" id="cancelFeedback">Cancel</button>
                            <button class="btn-submit" id="submitFeedback">Submit</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(container);
            this.cacheElements();
        },

        cacheElements() {
            this.elements = {
                container: document.getElementById('chatbot-2025'),
                toggle: document.getElementById('chatbotToggle'),
                window: document.getElementById('chatbotWindow'),
                messages: document.getElementById('chatbotMessages'),
                input: document.getElementById('chatbotInput'),
                sendBtn: document.getElementById('sendBtn'),
                typingIndicator: document.getElementById('typingIndicator'),
                quickReplies: document.getElementById('quickReplies'),
                notificationBadge: document.getElementById('chatNotificationBadge'),
                fileInput: document.getElementById('fileInput'),
                voiceRecording: document.getElementById('voiceRecording'),
                historyModal: document.getElementById('historyModal'),
                historyList: document.getElementById('historyList'),
                feedbackModal: document.getElementById('feedbackModal')
            };
        },

        injectStyles() {
            const styles = `
                /* Chatbot 2025 Styles */
                #chatbot-2025 {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 10000;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                .chatbot-toggle {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, ${this.config.primaryColor}, #1e40af);
                    border: none;
                    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                }

                .chatbot-toggle:hover {
                    transform: scale(1.1) rotate(5deg);
                    box-shadow: 0 6px 30px rgba(59, 130, 246, 0.5);
                }

                .chatbot-toggle.active {
                    transform: scale(0.9);
                    background: #ef4444;
                }

                .notification-badge {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 22px;
                    height: 22px;
                    background: #ef4444;
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: pulse-badge 2s infinite;
                }

                @keyframes pulse-badge {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                .chatbot-window {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 380px;
                    height: 600px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(20px) scale(0.95);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .chatbot-window.open {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0) scale(1);
                }

                /* Header */
                .chatbot-header {
                    background: linear-gradient(135deg, ${this.config.primaryColor}, #1e40af);
                    color: white;
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .bot-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .bot-avatar {
                    width: 44px;
                    height: 44px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                .bot-details h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0;
                }

                .status {
                    font-size: 12px;
                    opacity: 0.9;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                    animation: pulse-dot 2s infinite;
                }

                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .header-actions {
                    display: flex;
                    gap: 8px;
                }

                .header-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .header-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                /* Messages */
                .chatbot-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .welcome-message {
                    display: flex;
                    gap: 12px;
                    animation: slideIn 0.5s ease;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .message {
                    display: flex;
                    gap: 12px;
                    max-width: 85%;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                .message.user {
                    flex-direction: row-reverse;
                    margin-left: auto;
                }

                .message-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    flex-shrink: 0;
                }

                .message.bot .message-avatar {
                    background: linear-gradient(135deg, ${this.config.primaryColor}, #1e40af);
                }

                .message.user .message-avatar {
                    background: #e5e7eb;
                }

                .message-content {
                    background: #f3f4f6;
                    padding: 12px 16px;
                    border-radius: 16px;
                    border-bottom-left-radius: 4px;
                    position: relative;
                }

                .message.user .message-content {
                    background: linear-gradient(135deg, ${this.config.primaryColor}, #1e40af);
                    color: white;
                    border-bottom-left-radius: 16px;
                    border-bottom-right-radius: 4px;
                }

                .message-content p {
                    margin: 0;
                    line-height: 1.5;
                    font-size: 14px;
                }

                .message-time {
                    font-size: 11px;
                    color: #9ca3af;
                    margin-top: 4px;
                    display: block;
                }

                .message.user .message-time {
                    color: rgba(255, 255, 255, 0.7);
                }

                /* Typing Indicator */
                .typing-indicator {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    background: #f9fafb;
                }

                .typing-dots {
                    display: flex;
                    gap: 4px;
                }

                .typing-dots span {
                    width: 8px;
                    height: 8px;
                    background: ${this.config.primaryColor};
                    border-radius: 50%;
                    animation: typing-bounce 1.4s infinite ease-in-out both;
                }

                .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
                .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

                @keyframes typing-bounce {
                    0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                }

                .typing-text {
                    font-size: 13px;
                    color: #6b7280;
                }

                /* Quick Replies */
                .quick-replies {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    padding: 12px 20px;
                    border-top: 1px solid #e5e7eb;
                    background: #fafafa;
                }

                .quick-reply {
                    padding: 8px 14px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 20px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .quick-reply:hover {
                    background: ${this.config.primaryColor};
                    color: white;
                    border-color: ${this.config.primaryColor};
                    transform: translateY(-1px);
                }

                /* Input Area */
                .chatbot-input-area {
                    padding: 12px 16px;
                    border-top: 1px solid #e5e7eb;
                    background: white;
                }

                .input-container {
                    display: flex;
                    align-items: flex-end;
                    gap: 8px;
                }

                .input-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #f3f4f6;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .input-btn:hover {
                    background: #e5e7eb;
                }

                .chatbot-input {
                    flex: 1;
                    padding: 10px 14px;
                    border: 1px solid #e5e7eb;
                    border-radius: 20px;
                    font-size: 14px;
                    resize: none;
                    min-height: 40px;
                    max-height: 100px;
                    font-family: inherit;
                }

                .chatbot-input:focus {
                    outline: none;
                    border-color: ${this.config.primaryColor};
                }

                .send-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: ${this.config.primaryColor};
                    border: none;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .send-btn:hover {
                    background: #1e40af;
                    transform: scale(1.05);
                }

                .send-btn svg {
                    width: 18px;
                    height: 18px;
                }

                /* Voice Recording */
                .voice-recording {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    background: #fef2f2;
                    border-radius: 12px;
                    margin-top: 8px;
                }

                .recording-wave {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                }

                .recording-wave span {
                    width: 4px;
                    height: 20px;
                    background: #ef4444;
                    border-radius: 2px;
                    animation: wave 1s infinite ease-in-out;
                }

                .recording-wave span:nth-child(1) { animation-delay: 0s; height: 10px; }
                .recording-wave span:nth-child(2) { animation-delay: 0.1s; height: 16px; }
                .recording-wave span:nth-child(3) { animation-delay: 0.2s; height: 20px; }
                .recording-wave span:nth-child(4) { animation-delay: 0.3s; height: 14px; }
                .recording-wave span:nth-child(5) { animation-delay: 0.4s; height: 8px; }

                @keyframes wave {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(0.5); }
                }

                .recording-text {
                    font-size: 13px;
                    color: #ef4444;
                    flex: 1;
                }

                .stop-recording {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #ef4444;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 14px;
                }

                /* Footer */
                .chatbot-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 16px;
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    font-size: 12px;
                }

                .footer-link {
                    background: none;
                    border: none;
                    color: ${this.config.primaryColor};
                    cursor: pointer;
                    font-size: 12px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: background 0.2s;
                }

                .footer-link:hover {
                    background: #dbeafe;
                }

                .powered-by {
                    color: #9ca3af;
                    font-size: 11px;
                }

                /* History Modal */
                .history-modal, .feedback-modal {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                }

                .history-content, .feedback-content {
                    background: white;
                    border-radius: 16px;
                    width: 90%;
                    max-height: 80%;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .history-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .history-header h3 {
                    margin: 0;
                    font-size: 16px;
                }

                .close-history {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 4px;
                }

                .history-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }

                .clear-history {
                    padding: 12px;
                    background: #fef2f2;
                    color: #ef4444;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                }

                /* Feedback Modal */
                .feedback-content {
                    padding: 24px;
                    text-align: center;
                }

                .rating-stars {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin: 16px 0;
                }

                .star {
                    font-size: 28px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    opacity: 0.3;
                    transition: all 0.2s;
                }

                .star:hover,
                .star.active {
                    opacity: 1;
                }

                .feedback-content textarea {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    resize: vertical;
                    min-height: 80px;
                    margin: 16px 0;
                    font-family: inherit;
                }

                .feedback-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }

                .btn-cancel, .btn-submit {
                    padding: 10px 24px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                }

                .btn-cancel {
                    background: #f3f4f6;
                    color: #4b5563;
                }

                .btn-submit {
                    background: ${this.config.primaryColor};
                    color: white;
                }

                /* Responsive */
                @media (max-width: 480px) {
                    .chatbot-window {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 100px);
                        position: fixed;
                        bottom: 80px;
                        right: 20px;
                        left: 20px;
                    }
                }

                /* Scrollbar */
                .chatbot-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .chatbot-messages::-webkit-scrollbar-track {
                    background: transparent;
                }

                .chatbot-messages::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 3px;
                }
            `;

            const styleSheet = document.createElement('style');
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        },

        attachEvents() {
            // Toggle chat
            this.elements.toggle.addEventListener('click', () => this.toggleChat());

            // Send message
            this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
            this.elements.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Auto-resize textarea
            this.elements.input.addEventListener('input', () => {
                this.elements.input.style.height = 'auto';
                this.elements.input.style.height = this.elements.input.scrollHeight + 'px';
            });

            // File upload
            document.getElementById('attachmentBtn')?.addEventListener('click', () => {
                this.elements.fileInput.click();
            });

            this.elements.fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files[0]);
            });

            // Voice input
            let isRecording = false;
            const voiceBtn = document.getElementById('voiceBtn');
            const stopRecording = document.getElementById('stopRecording');

            voiceBtn?.addEventListener('click', () => {
                if (!isRecording) {
                    this.startVoiceRecording();
                    isRecording = true;
                }
            });

            stopRecording?.addEventListener('click', () => {
                this.stopVoiceRecording();
                isRecording = false;
            });

            // Header buttons
            document.getElementById('chatCloseBtn')?.addEventListener('click', () => this.toggleChat());
            document.getElementById('chatMinimizeBtn')?.addEventListener('click', () => this.toggleChat());
            
            // History
            document.getElementById('chatHistoryBtn')?.addEventListener('click', () => this.showHistory());
            document.getElementById('closeHistory')?.addEventListener('click', () => this.hideHistory());
            document.getElementById('clearHistory')?.addEventListener('click', () => this.clearHistory());

            // Footer links
            document.getElementById('humanHandoff')?.addEventListener('click', () => this.requestHuman());
            document.getElementById('giveFeedback')?.addEventListener('click', () => this.showFeedback());
            document.getElementById('cancelFeedback')?.addEventListener('click', () => this.hideFeedback());
            document.getElementById('submitFeedback')?.addEventListener('click', () => this.submitFeedback());

            // Star ratings
            document.querySelectorAll('.star').forEach(star => {
                star.addEventListener('click', () => {
                    document.querySelectorAll('.star').forEach((s, i) => {
                        s.classList.toggle('active', i < star.dataset.rating);
                    });
                });
            });
        },

        toggleChat() {
            this.state.isOpen = !this.state.isOpen;
            this.elements.window.classList.toggle('open', this.state.isOpen);
            this.elements.toggle.classList.toggle('active', this.state.isOpen);
            
            if (this.state.isOpen) {
                this.state.unreadCount = 0;
                this.elements.notificationBadge.style.display = 'none';
                this.elements.input.focus();
                this.saveHistory();
            }
        },

        showNotificationBadge() {
            this.state.unreadCount = 1;
            this.elements.notificationBadge.style.display = 'flex';
            this.saveHistory();
        },

        // Message Handling
        sendMessage() {
            const text = this.elements.input.value.trim();
            if (!text || this.state.isTyping) return;

            // Add user message
            this.addMessage('user', text);
            this.elements.input.value = '';
            this.elements.input.style.height = 'auto';

            // Show typing indicator
            this.showTyping();

            // Generate response
            setTimeout(() => {
                this.hideTyping();
                const response = this.generateResponse(text);
                this.addMessage('bot', response.text, response.suggestions);
            }, this.config.typingDelay);
        },

        addMessage(sender, text, suggestions = null) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;
            messageDiv.innerHTML = `
                <div class="message-avatar">${sender === 'bot' ? this.config.botAvatar : this.config.userAvatar}</div>
                <div class="message-content">
                    <p>${this.escapeHtml(text)}</p>
                    <span class="message-time">${this.formatTime()}</span>
                </div>
            `;

            this.elements.messages.appendChild(messageDiv);
            this.scrollToBottom();

            // Save to history
            this.state.conversationHistory.push({
                sender,
                text,
                timestamp: Date.now()
            });
            this.saveHistory();

            // Update quick replies
            if (suggestions) {
                this.updateQuickReplies(suggestions);
            }
        },

        generateResponse(userMessage) {
            const msg = userMessage.toLowerCase();
            
            // Check FAQ
            for (const [key, answer] of Object.entries(this.knowledgeBase.faq)) {
                if (msg.includes(key)) {
                    return {
                        text: answer,
                        suggestions: 'default'
                    };
                }
            }

            // Greeting
            if (msg.match(/hello|hi|hey|good morning|good afternoon/)) {
                return {
                    text: this.getRandomGreeting(),
                    suggestions: 'default'
                };
            }

            // New permit
            if (msg.match(/new|apply|start|begin/)) {
                return {
                    text: `I can help you apply for a new business permit! Here's what you need to know:

📋 **Requirements:**
• Barangay Business Clearance
• DTI/SEC/CDA Registration
• Zoning/Locational Clearance
• Occupancy Permit (if applicable)
• Community Tax Certificate

⏱️ **Processing Time:** 2-3 business days
💰 **Fee:** Starting at ₱500

Would you like to start your application now?`,
                    suggestions: 'new_permit'
                };
            }

            // Renewal
            if (msg.match(/renew|extend|update/)) {
                return {
                    text: `For permit renewal, you'll need your previous permit, updated barangay clearance, and tax clearance. Processing takes 1-2 business days with fees starting at ₱400.

⚠️ Remember: Renew at least 30 days before expiration to avoid penalties!`,
                    suggestions: 'renew_permit'
                };
            }

            // Fees
            if (msg.match(/fee|cost|price|how much/)) {
                return {
                    text: `Our fee structure varies by business size:

🏪 **Micro Business:** ₱500 + taxes
🏢 **Small Business:** ₱750 + taxes
🏭 **Medium Business:** ₱1,000 + taxes

Additional fees may apply for sanitary permit, fire safety inspection, and environmental fees.`,
                    suggestions: 'fees'
                };
            }

            // Track status
            if (msg.match(/track|status|progress|where/)) {
                return {
                    text: `You can track your application status by logging into your dashboard. You'll see real-time updates on:

✅ Document verification
✅ Review process
✅ Inspection scheduling
✅ Approval status

Need help logging in?`,
                    suggestions: 'default'
                };
            }

            // Default response
            return {
                text: `I'm not sure I understood. Here are some things I can help you with:`,
                suggestions: 'default'
            };
        },

        // Quick Replies
        renderQuickReplies(type) {
            const replies = this.knowledgeBase.quickReplies[type] || this.knowledgeBase.quickReplies.default;
            return replies.map(reply => `
                <button class="quick-reply" data-action="${reply.action}">${reply.label}</button>
            `).join('');
        },

        updateQuickReplies(type) {
            this.elements.quickReplies.innerHTML = this.renderQuickReplies(type);
            
            // Attach click events
            this.elements.quickReplies.querySelectorAll('.quick-reply').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;
                    this.handleQuickReply(action);
                });
            });
        },

        handleQuickReply(action) {
            const responses = {
                new_permit: { text: "What type of business would you like to register?", suggestions: "new_permit" },
                renew_permit: { text: "What kind of renewal do you need?", suggestions: "renew_permit" },
                check_fees: { text: "What size is your business?", suggestions: "fees" },
                requirements: { text: this.knowledgeBase.faq.requirements, suggestions: "default" },
                track_status: { text: "Please provide your application number or login to your dashboard to track your application.", suggestions: "default" },
                human_handoff: { text: "Connecting you to a human agent... Please wait while I transfer your conversation. Estimated wait time: 2 minutes.", suggestions: "default" },
                business_sole: { text: "Sole Proprietorship is the simplest form. You'll need DTI registration and valid ID. Shall we proceed?", suggestions: "default" },
                business_partnership: { text: "Partnerships require SEC registration and partnership agreement. Ready to start?", suggestions: "default" },
                back_to_main: { text: "What else can I help you with?", suggestions: "default" }
            };

            const response = responses[action] || responses.back_to_main;
            
            this.addMessage('user', this.knowledgeBase.quickReplies[this.state.lastQuickReplyType || 'default']
                ?.find(r => r.action === action)?.label || action);
            
            this.showTyping();
            setTimeout(() => {
                this.hideTyping();
                this.addMessage('bot', response.text, response.suggestions);
            }, 800);
        },

        // Typing Indicator
        showTyping() {
            this.state.isTyping = true;
            this.elements.typingIndicator.style.display = 'flex';
            this.scrollToBottom();
        },

        hideTyping() {
            this.state.isTyping = false;
            this.elements.typingIndicator.style.display = 'none';
        },

        // File Upload
        handleFileUpload(file) {
            if (!file) return;
            
            if (file.size > 10 * 1024 * 1024) {
                alert('File is too large. Maximum size is 10MB.');
                return;
            }

            this.addMessage('user', `📎 Uploaded: ${file.name}`);
            
            this.showTyping();
            setTimeout(() => {
                this.hideTyping();
                this.addMessage('bot', `I've received your file "${file.name}". Our staff will review it within 24 hours. Is there anything else you need help with?`);
            }, 1000);
        },

        // Voice Recording (Simulated)
        startVoiceRecording() {
            document.getElementById('voiceRecording').style.display = 'flex';
        },

        stopVoiceRecording() {
            document.getElementById('voiceRecording').style.display = 'none';
            
            this.showTyping();
            setTimeout(() => {
                this.hideTyping();
                this.addMessage('bot', "I heard you say: \"Apply for new business permit\". Is that correct?");
            }, 1000);
        },

        // History
        showHistory() {
            const historyHtml = this.state.conversationHistory.map(msg => `
                <div class="history-item">
                    <strong>${msg.sender === 'bot' ? this.config.botName : 'You'}:</strong>
                    <p>${this.escapeHtml(msg.text)}</p>
                    <small>${this.formatDate(msg.timestamp)}</small>
                </div>
            `).join('') || '<p>No history yet</p>';
            
            this.elements.historyList.innerHTML = historyHtml;
            this.elements.historyModal.style.display = 'flex';
        },

        hideHistory() {
            this.elements.historyModal.style.display = 'none';
        },

        clearHistory() {
            this.state.conversationHistory = [];
            this.saveHistory();
            this.hideHistory();
        },

        hideFeedback() {
            this.elements.feedbackModal.style.display = 'none';
        },

        submitFeedback() {
            this.hideFeedback();
            this.addMessage('bot', "Thank you for your feedback! It helps us improve our service.");
        },

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        formatTime() {
            return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },

        formatDate(timestamp) {
            return new Date(timestamp).toLocaleString();
        },

        getRandomGreeting() {
            const greetings = this.knowledgeBase.greetings;
            return greetings[Math.floor(Math.random() * greetings.length)];
        },

        scrollToBottom() {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Chatbot2025.init());
    } else {
        Chatbot2025.init();
    }

    window.Chatbot2025 = Chatbot2025;
})();
