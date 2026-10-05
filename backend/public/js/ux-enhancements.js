// Keyboard Shortcuts Manager
const keyboardShortcuts = {
    shortcuts: {},
    
    init() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Default shortcuts
        this.register({
            '?': () => this.showHelp(),
            'Escape': () => this.handleEscape(),
            'Ctrl+/': () => this.showHelp(),
            'Ctrl+k': () => this.focusSearch(),
            'Ctrl+d': () => this.goToDashboard(),
            'Ctrl+p': () => this.goToPermits(),
            'Ctrl+n': () => this.newApplication(),
            'Ctrl+m': () => themeManager.toggle(),
        });
    },
    
    register(shortcuts) {
        Object.assign(this.shortcuts, shortcuts);
    },
    
    handleKeydown(e) {
        // Don't trigger shortcuts in input fields (unless it's Escape or Ctrl+ shortcuts)
        const tag = e.target.tagName;
        const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
        
        // Build key combo
        let combo = '';
        if (e.ctrlKey) combo += 'Ctrl+';
        if (e.altKey) combo += 'Alt+';
        if (e.shiftKey) combo += 'Shift+';
        combo += e.key;
        
        // Check for shortcut
        if (this.shortcuts[combo]) {
            // Allow Ctrl+ shortcuts in inputs
            if (isInput && !e.ctrlKey && e.key !== 'Escape') return;
            
            e.preventDefault();
            this.shortcuts[combo]();
        }
    },
    
    showHelp() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">Keyboard Shortcuts</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div style="padding: 1.5rem;">
                    <div style="display: grid; gap: 0.75rem;">
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--gray-100);">
                            <span>Ctrl + K</span>
                            <span style="color: var(--gray-500);">Focus search</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--gray-100);">
                            <span>Ctrl + D</span>
                            <span style="color: var(--gray-500);">Go to Dashboard</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--gray-100);">
                            <span>Ctrl + P</span>
                            <span style="color: var(--gray-500);">Go to Permits</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--gray-100);">
                            <span>Ctrl + N</span>
                            <span style="color: var(--gray-500);">New Application</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--gray-100);">
                            <span>Ctrl + M</span>
                            <span style="color: var(--gray-500);">Toggle Dark Mode</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--gray-100);">
                            <span>?</span>
                            <span style="color: var(--gray-500);">Show this help</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span>Escape</span>
                            <span style="color: var(--gray-500);">Close modals/chat</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    handleEscape() {
        // Close chatbot if open
        const chatbot = document.getElementById('chatbotWidget');
        if (chatbot?.classList.contains('open')) {
            chatbot.classList.remove('open');
            return;
        }
        
        // Close modals
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
            return;
        }
        
        // Close dropdowns
        const dropdowns = document.querySelectorAll('.notification-dropdown.open, .fab-menu.open');
        dropdowns.forEach(d => d.classList.remove('open'));
    },
    
    focusSearch() {
        const search = document.getElementById('globalSearch');
        if (search) search.focus();
    },
    
    goToDashboard() {
        window.location.href = '/dashboard.html';
    },
    
    goToPermits() {
        window.location.href = '/permit-application.html';
    },
    
    newApplication() {
        window.location.href = '/permit-application.html';
    }
};

// Breadcrumb Manager
const breadcrumb = {
    init() {
        const paths = this.parsePath();
        if (paths.length > 1) {
            this.render(paths);
        }
    },
    
    parsePath() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(s => s && s !== 'public');
        
        const breadcrumbs = [];
        let currentPath = '';
        
        // Home
        breadcrumbs.push({ name: 'Home', path: '/' });
        
        segments.forEach(segment => {
            currentPath += '/' + segment;
            breadcrumbs.push({
                name: this.formatName(segment),
                path: currentPath
            });
        });
        
        return breadcrumbs;
    },
    
    formatName(segment) {
        const names = {
            'dashboard.html': 'Dashboard',
            'permit-application.html': 'Apply for Permit',
            'admin-dashboard.html': 'Admin Dashboard',
            'admin-permits.html': 'Manage Permits',
            'admin-users.html': 'Manage Users',
            'profile.html': 'Profile',
            'login.html': 'Login',
            'register.html': 'Register',
            'about.html': 'About',
            'contact.html': 'Contact'
        };
        
        return names[segment] || segment
            .replace('.html', '')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    },
    
    render(paths) {
        const main = document.querySelector('main') || document.querySelector('.dashboard');
        if (!main) return;
        
        const breadcrumb = document.createElement('nav');
        breadcrumb.className = 'breadcrumb';
        breadcrumb.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 0;
            font-size: 0.875rem;
            color: var(--gray-500);
        `;
        
        breadcrumb.innerHTML = paths.map((path, index) => {
            const isLast = index === paths.length - 1;
            return isLast 
                ? `<span style="color: var(--gray-700); font-weight: 500;">${path.name}</span>`
                : `<a href="${path.path}" style="color: var(--primary); text-decoration: none;">${path.name}</a>
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="color: var(--gray-400);">
                       <polyline points="9 18 15 12 9 6"></polyline>
                   </svg>`;
        }).join('');
        
        main.insertBefore(breadcrumb, main.firstChild);
    }
};

// Global Search
const globalSearch = {
    init() {
        this.createSearchBar();
        this.searchData = [
            { name: 'Dashboard', path: '/dashboard.html', keywords: 'dashboard home permits' },
            { name: 'Apply for Permit', path: '/permit-application.html', keywords: 'apply new permit business application' },
            { name: 'My Profile', path: '/profile.html', keywords: 'profile account settings' },
            { name: 'About Us', path: '/about.html', keywords: 'about information janiuay bplo' },
            { name: 'Contact', path: '/contact.html', keywords: 'contact help support' },
            { name: 'Admin Dashboard', path: '/admin-dashboard.html', keywords: 'admin dashboard analytics' },
        ];
    },
    
    createSearchBar() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'global-search-container';
        searchContainer.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            max-width: 600px;
            z-index: 900;
            display: none;
        `;
        
        searchContainer.innerHTML = `
            <div style="background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); overflow: hidden;">
                <div style="display: flex; align-items: center; padding: 16px; border-bottom: 1px solid var(--gray-100);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" style="color: var(--gray-400); margin-right: 12px;">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="globalSearch" placeholder="Search anything... (Press Enter to search)" 
                        style="flex: 1; border: none; outline: none; font-size: 1rem; background: transparent;">
                    <kbd style="background: var(--gray-100); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; color: var(--gray-500);">ESC</kbd>
                </div>
                <div id="searchResults" style="max-height: 400px; overflow-y: auto;"></div>
            </div>
        `;
        
        document.body.appendChild(searchContainer);
        
        // Handle search input
        const input = document.getElementById('globalSearch');
        input.addEventListener('input', (e) => this.handleSearch(e.target.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
        
        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                this.close();
            }
        });
    },
    
    open() {
        const container = document.querySelector('.global-search-container');
        if (container) {
            container.style.display = 'block';
            document.getElementById('globalSearch').focus();
        }
    },
    
    close() {
        const container = document.querySelector('.global-search-container');
        if (container) {
            container.style.display = 'none';
        }
    },
    
    handleSearch(query) {
        if (!query) {
            document.getElementById('searchResults').innerHTML = '';
            return;
        }
        
        const results = this.searchData.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.keywords.toLowerCase().includes(query.toLowerCase())
        );
        
        const container = document.getElementById('searchResults');
        if (results.length === 0) {
            container.innerHTML = `
                <div style="padding: 24px; text-align: center; color: var(--gray-500);">
                    No results found for "${query}"
                </div>
            `;
        } else {
            container.innerHTML = results.map(result => `
                <a href="${result.path}" style="display: flex; align-items: center; padding: 16px; text-decoration: none; color: inherit; border-bottom: 1px solid var(--gray-100); transition: background 0.2s;" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background='white'">
                    <div style="flex: 1;">
                        <div style="font-weight: 500; color: var(--gray-800);">${result.name}</div>
                        <div style="font-size: 0.875rem; color: var(--gray-500);">${result.path}</div>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="color: var(--gray-400);">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </a>
            `).join('');
        }
    }
};

// Initialize all
document.addEventListener('DOMContentLoaded', () => {
    keyboardShortcuts.init();
    breadcrumb.init();
    globalSearch.init();
});
