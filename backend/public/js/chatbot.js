// Chatbot Module
const chatbot = {
    sessionId: null,
    messages: [],
    isOpen: false,
    initialized: false,
    
    // Initialize chatbot
    init() {
        console.log('🤖 Chatbot init called');
        
        if (this.initialized) {
            console.log('Chatbot already initialized, skipping');
            return;
        }
        
        // DOM elements
        this.toggle = document.getElementById('chatbotToggle');
        this.close = document.getElementById('chatbotClose');
        this.container = document.getElementById('chatbotContainer');
        this.messagesContainer = document.getElementById('chatbotMessages');
        this.input = document.getElementById('chatbotInput');
        this.sendBtn = document.getElementById('chatbotSend');
        
        console.log('Chatbot elements:', {
            toggle: !!this.toggle,
            close: !!this.close,
            container: !!this.container,
            messagesContainer: !!this.messagesContainer,
            input: !!this.input,
            sendBtn: !!this.sendBtn
        });
        
        if (!this.container) {
            console.error('Chatbot container not found!');
            return;
        }
        
        this.initialized = true;
        this.sessionId = this.generateSessionId();
        this.messages = [];
        
        // Clear any existing content
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = '';
        }
        
        // Event listeners
        if (this.toggle) {
            this.toggle.addEventListener('click', () => {
                console.log('Chatbot toggle clicked');
                this.open();
            });
        }
        
        if (this.close) {
            this.close.addEventListener('click', () => {
                console.log('Chatbot close clicked');
                this.hide();
            });
        }
        
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => {
                console.log('Chatbot send clicked');
                this.sendMessage();
            });
        }
        
        if (this.input) {
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('Chatbot input Enter pressed');
                    this.sendMessage();
                }
            });
        }
        
        console.log('✅ Chatbot initialized successfully');
        
        // Welcome message - only add once
        setTimeout(() => {
            if (this.messagesContainer && this.messagesContainer.children.length === 0) {
                this.addBotMessage('Hello! I\'m your Janiuay BPLO Assistant. How can I help you with your business permit today?');
                this.showSuggestions([
                    'What documents do I need?',
                    'How do I apply?',
                    'What are the fees?',
                    'How long does it take?',
                ]);
            }
        }, 100);
    },
    
    // Generate unique session ID
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Open chatbot
    open() {
        console.log('Chatbot opening...');
        if (this.container) {
            this.container.classList.remove('hidden');
            this.container.classList.add('active');
            this.isOpen = true;
            this.input?.focus();
            console.log('Chatbot opened successfully');
        } else {
            console.error('Chatbot container not found when opening');
        }
    },
    
    // Hide chatbot
    hide() {
        console.log('Chatbot hiding...');
        if (this.container) {
            this.container.classList.remove('active');
            this.container.classList.add('hidden');
            this.isOpen = false;
            console.log('Chatbot hidden successfully');
        }
    },
    
    // Toggle chatbot
    toggle() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.open();
        }
    },
    
    // Add user message to UI
    addUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'message user-message';
        div.innerHTML = `<p>${this.escapeHtml(text)}</p>`;
        this.messagesContainer.appendChild(div);
        this.scrollToBottom();
        
        this.messages.push({ role: 'user', content: text });
    },
    
    // Add bot message to UI
    addBotMessage(text) {
        const div = document.createElement('div');
        div.className = 'message bot-message';
        div.innerHTML = `<p>${text}</p>`;
        this.messagesContainer.appendChild(div);
        this.scrollToBottom();
        
        this.messages.push({ role: 'bot', content: text });
    },
    
    // Add loading indicator
    addLoading() {
        const div = document.createElement('div');
        div.className = 'message bot-message loading';
        div.id = 'chatbotLoading';
        div.innerHTML = '<p>Typing...</p>';
        this.messagesContainer.appendChild(div);
        this.scrollToBottom();
    },
    
    // Remove loading indicator
    removeLoading() {
        const loading = document.getElementById('chatbotLoading');
        if (loading) loading.remove();
    },
    
    // Show quick suggestion buttons
    showSuggestions(suggestions) {
        const div = document.createElement('div');
        div.className = 'message bot-message suggestions';
        div.innerHTML = suggestions.map(s => 
            `<button class="suggestion-btn" onclick="chatbot.sendSuggestion('${this.escapeHtml(s)}')">${this.escapeHtml(s)}</button>`
        ).join('');
        this.messagesContainer.appendChild(div);
        this.scrollToBottom();
    },
    
    // Send suggested message
    sendSuggestion(text) {
        // Remove suggestions
        const suggestions = this.messagesContainer.querySelector('.suggestions');
        if (suggestions) suggestions.remove();
        
        this.addUserMessage(text);
        this.processMessage(text);
    },
    
    // Send message from input
    sendMessage() {
        const text = this.input?.value.trim();
        if (!text) return;
        
        this.addUserMessage(text);
        this.input.value = '';
        this.processMessage(text);
    },
    
    // Process and send message to API
    async processMessage(text) {
        this.addLoading();
        
        try {
            const response = await api.sendMessage(text, this.sessionId);
            this.removeLoading();
            
            // Handle nested data property
            const message = response.data?.response || response.message || response.response;
            const suggestions = response.data?.suggestions || response.suggestions;
            
            if (message) {
                this.addBotMessage(message);
                
                // Show follow-up suggestions based on context
                if (suggestions) {
                    this.showSuggestions(suggestions);
                }
            } else {
                throw new Error('No response from chatbot');
            }
        } catch (error) {
            this.removeLoading();
            console.error('Chatbot error:', error);
            
            // Fallback to local knowledge base if API fails
            const fallbackResponse = this.getLocalResponse(text);
            this.addBotMessage(fallbackResponse);
        }
    },
    
    // Local knowledge base fallback
    getLocalResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        // Document requirements
        if (lowerQuery.includes('document') || lowerQuery.includes('requirement') || lowerQuery.includes('need')) {
            return `For a NEW Business Permit, you need to prepare the following documents:

1. **Zoning and Locational Clearance** - From MPDC Office (2nd floor Mun. Hall)
2. **Occupancy Permit** - From Building Official (2nd floor Mun. Hall)
3. **Barangay Business Clearance** - From your local Barangay
4. **Community Tax Certificate (Cedula)** - From Treasurer's Office
5. **Police Clearance** - From PNP or Secretary Certificate
6. **Business Name Registration** - From DTI/SEC/CDA
7. **Municipal Sanitary Permit** - From Municipal Health Unit

All documents need 1 photocopy each. You can upload these in the online application form.`;
        }
        
        // How to apply
        if (lowerQuery.includes('apply') || lowerQuery.includes('how') || lowerQuery.includes('process') || lowerQuery.includes('step')) {
            return `To apply for a business permit online:

1. **Register/Login** - Create an account or login at the top right
2. **Start Application** - Click "Apply for Permit" in your dashboard
3. **Fill Business Info** - Enter your business details
4. **Upload Documents** - Upload all required documents (1 photocopy each)
5. **Review & Submit** - Check your application and submit
6. **Payment** - Pay the assessment fee (GCash/PayMaya options available)
7. **Wait for Approval** - We'll process your application within 2-3 days

You'll receive email updates on your application status!`;
        }
        
        // Fees
        if (lowerQuery.includes('fee') || lowerQuery.includes('cost') || lowerQuery.includes('price') || lowerQuery.includes('how much') || lowerQuery.includes('payment')) {
            return `Business permit fees vary depending on:
- Business type and classification
- Gross sales/receipts
- Floor area
- Number of employees

Typical fees include:
- Mayor's Permit Fee
- Business Tax
- Garbage Fee
- Signage Fee
- Sanitary Permit Fee
- Fire Safety Inspection Fee
- Environmental Clearance Fee

After you submit your application, our BPLO will assess the exact fees and send you a payment notice. You can pay via GCash, PayMaya, or at the Municipal Treasurer's Office.`;
        }
        
        // Processing time
        if (lowerQuery.includes('time') || lowerQuery.includes('long') || lowerQuery.includes('day') || lowerQuery.includes('when') || lowerQuery.includes('fast')) {
            return `Our target processing time is **2-3 business days** for complete applications with all required documents.

The timeline depends on:
- Completeness of your documents
- Business type and complexity
- Verification requirements
- Payment confirmation

You can track your application status in real-time through your dashboard. We'll also send email notifications for each status update!

For urgent applications, you may contact us at 0981-156-8676.`;
        }
        
        // Contact
        if (lowerQuery.includes('contact') || lowerQuery.includes('phone') || lowerQuery.includes('email') || lowerQuery.includes('call') || lowerQuery.includes('reach')) {
            return `You can reach the Janiuay BPLO Office through:

📞 **Phone:** 0981-156-8676 (click to call)
📧 **Email:** bplo.janiuay@gmail.com
📍 **Address:** Municipal Hall, Janiuay, Iloilo 5034
🕐 **Office Hours:** Monday-Friday, 8AM-5PM

For online support, you can also use this chat anytime or email us. We typically respond within 24 hours during business days.`;
        }
        
        // Barangay info
        if (lowerQuery.includes('barangay') || lowerQuery.includes('location')) {
            return `Janiuay has 40+ barangays under its jurisdiction, including:

- Poblacion (town center)
- Aganan, Balabago, Barasalon
- Bongol, Bucari, Calinog
- Carpenter, Crispin, Daja
- Dongon, Guinobatan, Latawan
- Lubot, Moroboro, Pitogo
- Quipot, San Julian, San Pedro
- Santo Tomas, Sara, Tambal
- Tibiao, Yabon, Zarragoza
- And many more...

No matter which barangay you're in, you can use our online system to apply for your business permit!`;
        }
        
        // Default response
        return `Thank you for your question! I'm here to help with your business permit needs.

I can assist you with:
- Document requirements
- Application process
- Fee information
- Processing times
- Office contact details

For specific questions about your application, please:
1. Check your dashboard for real-time status
2. Email us at bplo.janiuay@gmail.com
3. Call 0981-156-8676

Is there anything specific about the business permit process I can help you with?`;
    },
    
    // Scroll to bottom of messages
    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    },
    
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
};
