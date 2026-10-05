// Main Initialization and Utilities

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth state
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
});

// Format utilities (for pages that don't include ui.js)
if (typeof format === 'undefined') {
    var format = {
        date(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        },
        
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
        
        currency(amount) {
            if (amount === null || amount === undefined) return '₱0.00';
            return '₱' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        },
        
        number(num) {
            return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
    };
}

// Table rendering (for pages that don't include ui.js)
if (typeof table === 'undefined') {
    var table = {
        render(containerId, data, columns, actions = null) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            if (!data || data.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #6b7280;">No data available</div>';
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

// Validation helpers (for pages that don't include auth.js)
if (typeof validation === 'undefined') {
    var validation = {
        isEmail(value) {
            const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            return emailRegex.test(value);
        },
        
        isPhilippineMobile(value) {
            const mobileRegex = /^09\d{9}$/;
            return mobileRegex.test(value);
        },
        
        isRequired(value) {
            return value !== null && value !== undefined && value.toString().trim() !== '';
        },
        
        minLength(value, min) {
            return value.length >= min;
        },
        
        passwordMatch(password, confirmPassword) {
            return password === confirmPassword;
        },
    };
}

// Simple toast for pages without full ui.js
if (typeof simpleToast === 'undefined') {
    var simpleToast = {
        show(message, type = 'info') {
            let container = document.getElementById('toastContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'toastContainer';
                container.style.cssText = `
                    position: fixed;
                    top: 5rem;
                    right: 1rem;
                    z-index: 2000;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                `;
                document.body.appendChild(container);
            }
            
            const colors = {
                success: '#10b981',
                error: '#dc2626',
                warning: '#f59e0b',
                info: '#1e40af',
            };
            
            const toast = document.createElement('div');
            toast.style.cssText = `
                padding: 1rem 1.25rem;
                background: white;
                border-radius: 0.375rem;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                min-width: 300px;
                max-width: 400px;
                border-left: 4px solid ${colors[type]};
                animation: slideIn 0.3s ease-out;
            `;
            toast.innerHTML = `<p style="margin: 0; color: #374151;">${message}</p>`;
            
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(() => toast.remove(), 300);
            }, 5000);
        },
        
        success(message) { this.show(message, 'success'); },
        error(message) { this.show(message, 'error'); },
        warning(message) { this.show(message, 'warning'); },
        info(message) { this.show(message, 'info'); },
    };
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
