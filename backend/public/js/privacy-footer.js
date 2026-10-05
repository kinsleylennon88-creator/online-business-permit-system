// Privacy Footer Component
const privacyFooter = {
    init() {
        this.createFooter();
        this.createPrivacyNotice();
    },
    
    createFooter() {
        const footer = document.createElement('footer');
        footer.className = 'privacy-footer';
        footer.setAttribute('role', 'contentinfo');
        footer.innerHTML = `
            <div class="container">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="ssl-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            SSL Secure
                        </div>
                        <span style="color: rgba(255,255,255,0.6);">|</span>
                        <span>© ${new Date().getFullYear()} Municipality of Janiuay</span>
                    </div>
                    <div style="display: flex; gap: 24px; flex-wrap: wrap;">
                        <a href="/privacy-policy.html">Privacy Policy</a>
                        <a href="/terms-of-service.html">Terms of Service</a>
                        <a href="/data-protection.html">Data Protection</a>
                        <a href="/contact.html">Contact Us</a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(footer);
    },
    
    createPrivacyNotice() {
        const main = document.querySelector('main') || document.querySelector('.dashboard');
        if (!main) return;
        
        const notice = document.createElement('div');
        notice.className = 'privacy-notice';
        notice.setAttribute('role', 'region');
        notice.setAttribute('aria-label', 'Data privacy notice');
        notice.innerHTML = `
            <div class="privacy-notice-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                Data Privacy Notice
            </div>
            <p class="privacy-notice-text">
                The Municipality of Janiuay is committed to protecting your personal information in compliance with the 
                <strong>Data Privacy Act of 2012 (RA 10173)</strong>. All information collected is used solely for business 
                permit processing and will not be shared with third parties without your consent.
            </p>
        `;
        
        main.insertBefore(notice, main.firstChild);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    privacyFooter.init();
});
