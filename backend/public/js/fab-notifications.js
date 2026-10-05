// Floating Action Button Manager
const fabManager = {
    items: [],
    
    init(items = []) {
        this.items = items;
        this.createFab();
    },
    
    createFab() {
        const container = document.createElement('div');
        container.className = 'fab-container';
        container.id = 'fabContainer';
        
        // Create menu items
        const menu = document.createElement('div');
        menu.className = 'fab-menu';
        menu.id = 'fabMenu';
        
        this.items.forEach((item, index) => {
            const fabItem = document.createElement('div');
            fabItem.className = 'fab-item';
            fabItem.innerHTML = `
                <span class="fab-item-label">${item.label}</span>
                <button class="fab-item-btn" data-action="${index}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        ${item.icon}
                    </svg>
                </button>
            `;
            
            // Add event listener programmatically
            const btn = fabItem.querySelector('.fab-item-btn');
            btn.addEventListener('click', () => {
                if (item.actionFn) {
                    item.actionFn();
                } else if (item.action) {
                    window.location.href = item.action;
                }
            });
            
            menu.appendChild(fabItem);
        });
        
        // Create main button
        const mainBtn = document.createElement('button');
        mainBtn.className = 'fab-main';
        mainBtn.id = 'fabMain';
        mainBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        `;
        
        mainBtn.addEventListener('click', () => {
            mainBtn.classList.toggle('active');
            menu.classList.toggle('open');
        });
        
        container.appendChild(menu);
        container.appendChild(mainBtn);
        document.body.appendChild(container);
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                mainBtn.classList.remove('active');
                menu.classList.remove('open');
            }
        });
    }
};

// Notification Manager
const notificationManager = {
    notifications: [],
    unreadCount: 0,
    
    init() {
        // Don't initialize on auth pages
        const path = window.location.pathname;
        if (path.includes('login') || path.includes('register') || path.includes('forgot-password')) {
            return;
        }
        
        this.loadNotifications();
        this.createBell();
        this.startPolling();
    },
    
    createBell() {
        const nav = document.querySelector('.nav-menu') || document.querySelector('header');
        if (!nav) return;
        
        const bellContainer = document.createElement('li');
        bellContainer.className = 'notification-container';
        bellContainer.style.position = 'relative';
        bellContainer.innerHTML = `
            <button class="notification-bell" id="notificationBell">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
            </button>
            <div class="notification-dropdown" id="notificationDropdown">
                <div class="notification-header">
                    <h3>Notifications</h3>
                    <button id="markAllReadBtn" style="background: none; border: none; color: var(--primary); font-size: 0.875rem; cursor: pointer;">
                        Mark all read
                    </button>
                </div>
                <div class="notification-list" id="notificationList">
                    <!-- Notifications rendered here -->
                </div>
                <div class="notification-footer">
                    <a href="/notifications.html">View all notifications</a>
                </div>
            </div>
        `;
        
        // Add event listeners programmatically
        const bellBtn = bellContainer.querySelector('#notificationBell');
        bellBtn.addEventListener('click', () => this.toggleDropdown());
        
        const markAllBtn = bellContainer.querySelector('#markAllReadBtn');
        markAllBtn.addEventListener('click', () => this.markAllRead());
        
        // Insert at end of nav menu for better placement
        nav.appendChild(bellContainer);
        this.renderNotifications();
    },
    
    toggleDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        dropdown.classList.toggle('open');
    },
    
    addNotification(notification) {
        this.notifications.unshift({
            id: Date.now(),
            read: false,
            time: new Date(),
            ...notification
        });
        this.updateUnreadCount();
        this.renderNotifications();
        this.saveNotifications();
    },
    
    markAsRead(id) {
        const notif = this.notifications.find(n => n.id === id);
        if (notif) {
            notif.read = true;
            this.updateUnreadCount();
            this.renderNotifications();
            this.saveNotifications();
        }
    },
    
    markAllRead() {
        this.notifications.forEach(n => n.read = true);
        this.updateUnreadCount();
        this.renderNotifications();
        this.saveNotifications();
    },
    
    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
        }
    },
    
    renderNotifications() {
        const list = document.getElementById('notificationList');
        if (!list) return;
        
        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="notification-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <p>No notifications yet</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = this.notifications.slice(0, 5).map(n => {
            const item = document.createElement('div');
            item.className = `notification-item ${n.read ? '' : 'unread'}`;
            item.innerHTML = `
                <div class="notification-icon ${n.type || 'info'}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        ${n.icon || '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'}
                    </svg>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${n.title}</div>
                    <div class="notification-message">${n.message}</div>
                    <div class="notification-time">${this.formatTime(n.time)}</div>
                </div>
            `;
            item.addEventListener('click', () => this.markAsRead(n.id));
            return item.outerHTML;
        }).join('');
    },
    
    formatTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    },
    
    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications.slice(0, 20)));
    },
    
    loadNotifications() {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            this.notifications = JSON.parse(saved);
        }
    },
    
    startPolling() {
        // Poll for new notifications every 30 seconds
        setInterval(() => {
            this.checkForUpdates();
        }, 30000);
    },
    
    async checkForUpdates() {
        // Check for permit status updates
        if (auth.isAuthenticated()) {
            try {
                const response = await api.getPermits();
                if (response.success && response.data) {
                    const permits = response.data;
                    permits.forEach(permit => {
                        if (permit.statusChanged) {
                            this.addNotification({
                                type: 'success',
                                title: 'Permit Status Updated',
                                message: `Your permit for ${permit.businessName} is now ${permit.status}`,
                                icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
                            });
                        }
                    });
                }
            } catch (e) {
                // Silent fail
            }
        }
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Don't initialize on auth pages
    const path = window.location.pathname;
    const isAuthPage = path.includes('login') || path.includes('register') || path.includes('forgot-password');
    
    if (!isAuthPage) {
        // Initialize FAB with default actions
        fabManager.init([
            {
                label: 'Apply for Permit',
                icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
                action: '/permit-application.html'
            },
            {
                label: 'Chat with AI',
                icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
                actionFn: () => { if (typeof chatbot !== 'undefined') chatbot.open(); }
            },
            {
                label: 'View Dashboard',
                icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
                action: '/dashboard.html'
            }
        ]);
    }
    
    // Initialize notifications (will check for auth pages internally)
    notificationManager.init();
});
