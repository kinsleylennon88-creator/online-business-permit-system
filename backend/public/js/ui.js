// UI Utilities Module
const ui = {
    // Toast Notifications
    toast: {
        container: null,
        
        init() {
            this.container = document.getElementById('toastContainer');
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'toastContainer';
                this.container.className = 'toast-container';
                document.body.appendChild(this.container);
            }
        },
        
        show(message, type = 'info', title = '') {
            this.init();
            
            const icons = {
                success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
                error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
                warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
                info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
            };
            
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `
                <div class="toast-icon">${icons[type]}</div>
                <div class="toast-content">
                    ${title ? `<div class="toast-title">${title}</div>` : ''}
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close" onclick="this.parentElement.remove()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            
            this.container.appendChild(toast);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                toast.classList.add('hiding');
                setTimeout(() => toast.remove(), 300);
            }, 5000);
        },
        
        success(message, title) {
            this.show(message, 'success', title);
        },
        
        error(message, title) {
            this.show(message, 'error', title);
        },
        
        warning(message, title) {
            this.show(message, 'warning', title);
        },
        
        info(message, title) {
            this.show(message, 'info', title);
        },
    },
    
    // Loading Spinner
    loading: {
        overlay: null,
        
        show() {
            if (!this.overlay) {
                this.overlay = document.createElement('div');
                this.overlay.className = 'loading-overlay';
                this.overlay.innerHTML = '<div class="spinner"></div>';
            }
            document.body.appendChild(this.overlay);
            document.body.style.overflow = 'hidden';
        },
        
        hide() {
            if (this.overlay && this.overlay.parentElement) {
                this.overlay.remove();
            }
            document.body.style.overflow = '';
        },
    },
    
    // Modal
    modal: {
        open(content, options = {}) {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h3>${options.title || ''}</h3>
                        <button class="modal-close" onclick="ui.modal.close(this)">&times;</button>
                    </div>
                    <div class="modal-body">${content}</div>
                    ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
                </div>
            `;
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.close(modal.querySelector('.modal-close'));
            });
            
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';
            
            return modal;
        },
        
        close(button) {
            const modal = button.closest('.modal-overlay');
            if (modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        },
    },
    
    // Mobile Navigation
    initMobileNav() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                
                // Animate hamburger
                const spans = navToggle.querySelectorAll('span');
                if (navMenu.classList.contains('active')) {
                    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
                } else {
                    spans[0].style.transform = '';
                    spans[1].style.opacity = '';
                    spans[2].style.transform = '';
                }
            });
            
            // Close menu on link click
            navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    const spans = navToggle.querySelectorAll('span');
                    spans[0].style.transform = '';
                    spans[1].style.opacity = '';
                    spans[2].style.transform = '';
                });
            });
        }
    },
    
    // Smooth scroll for anchor links
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    });
                }
            });
        });
    },
    
    // Initialize all UI components
    init() {
        this.initMobileNav();
        this.initSmoothScroll();
        this.toast.init();
    },
};

// Format utilities
if (typeof format === 'undefined') {
    var format = {
        // Format date
        date(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        },
        
        // Format date and time
        datetime(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        },
        
        // Format currency (PHP)
        currency(amount) {
            if (amount === null || amount === undefined) return '₱0.00';
            return '₱' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        },
        
        // Format number
        number(num) {
            return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
    };
}

// Format phone number
format.phone = function(num) {
    if (!num) return '';
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('09')) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return num;
};

// Table helpers
if (typeof table === 'undefined') {
    var table = {
        // Render table with data
        render(containerId, data, columns, actions = null) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            if (!data || data.length === 0) {
                container.innerHTML = '<div class="text-center py-4 text-gray-500">No data available</div>';
                return;
            }
            
            let html = '<table class="data-table"><thead><tr>';
            columns.forEach(col => {
                html += `<th>${col.header}</th>`;
            });
            if (actions) html += '<th>Actions</th>';
            html += '</tr></thead><tbody>';
            
            data.forEach((row, index) => {
                html += '<tr>';
                columns.forEach(col => {
                    const value = col.format ? col.format(row[col.key], row) : row[col.key];
                    html += `<td>${value || '-'}</td>`;
                });
                if (actions) {
                    html += `<td><div class="action-btns">${actions(row, index)}</div></td>`;
                }
                html += '</tr>';
            });
            
            html += '</tbody></table>';
            container.innerHTML = html;
        },
    };
}

// File upload helpers
const fileUpload = {
    // Format file size
    formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // Validate file
    validate(file, options = {}) {
        const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options;
        
        if (file.size > maxSize) {
            return { valid: false, error: `File size exceeds ${this.formatSize(maxSize)}` };
        }
        
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            return { valid: false, error: 'File type not allowed' };
        }
        
        return { valid: true };
    },
    
    // Create file preview
    preview(file, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <div class="file-item-info">
                <div class="file-item-name">${file.name}</div>
                <div class="file-item-size">${this.formatSize(file.size)}</div>
            </div>
            <button type="button" class="file-item-remove" onclick="this.parentElement.remove()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        container.appendChild(div);
    },
};
