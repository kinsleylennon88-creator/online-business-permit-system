// Main JavaScript - Initializes all modules when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication state
    if (typeof auth !== 'undefined') {
        auth.init();
    }
    
    // Initialize UI components
    if (typeof ui !== 'undefined') {
        ui.init();
    }
    
    // Initialize chatbot if present on page
    const chatbotWidget = document.getElementById('chatbotWidget');
    if (chatbotWidget && typeof chatbot !== 'undefined') {
        chatbot.init();
    }
    
    console.log('🚀 Janiuay BPLO System initialized');
});
