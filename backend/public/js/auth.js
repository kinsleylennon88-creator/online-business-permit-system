// Authentication Module
const auth = {
    // Session timeout in milliseconds (24 hours)
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
    
    // Check if user is logged in
    isAuthenticated() {
        const token = localStorage.getItem('token');
        const sessionStart = localStorage.getItem('sessionStart');
        
        if (!token) return false;
        
        // Check if session has expired
        if (sessionStart) {
            const elapsed = Date.now() - parseInt(sessionStart);
            if (elapsed > this.SESSION_TIMEOUT) {
                this.logout();
                return false;
            }
        }
        
        return true;
    },
    
    // Get current user
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    // Get user role
    getRole() {
        const user = this.getUser();
        return user ? user.role : null;
    },
    
    // Check if user is admin
    isAdmin() {
        const role = this.getRole();
        return role === 'admin' || role === 'superadmin';
    },
    
    // Login
    async login(email, password) {
        try {
            const response = await api.login({ email, password });
            
            if (response.success) {
                const token = response.data?.token || response.token;
                const user = response.data?.user || response.user;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('sessionStart', Date.now().toString());
                this.startSessionTimer();
                return { success: true, user };
            } else {
                return { success: false, error: response.message || 'Login failed' };
            }
        } catch (error) {
            return { success: false, error: error.message || 'Login failed. Please check your credentials.' };
        }
    },
    
    // Register
    async register(userData) {
        try {
            const response = await api.register(userData);
            
            if (response.success) {
                const token = response.data?.token || response.token;
                const user = response.data?.user || response.user;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('sessionStart', Date.now().toString());
                this.startSessionTimer();
                return { success: true, user };
            } else {
                return { success: false, error: response.message || 'Registration failed' };
            }
        } catch (error) {
            return { success: false, error: error.message || 'Registration failed. Please try again.' };
        }
    },
    
    // Logout
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('sessionStart');
        clearInterval(this.sessionInterval);
        window.location.href = '/login.html';
    },
    
    // Start session expiration timer
    startSessionTimer() {
        clearInterval(this.sessionInterval);
        this.sessionInterval = setInterval(() => {
            if (!this.isAuthenticated()) {
                this.logout();
            }
        }, 60000); // Check every minute
    },
    
    // Update stored user data
    updateUser(userData) {
        const user = this.getUser();
        if (user) {
            const updatedUser = { ...user, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    },
    
    // Redirect if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },
    
    // Redirect if not admin
    requireAdmin() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        if (!this.isAdmin()) {
            window.location.href = '/dashboard.html';
            return false;
        }
        return true;
    },
    
    // Init auth state on page load
    init() {
        // Check session on init
        if (!this.isAuthenticated()) {
            const currentPage = window.location.pathname;
            const protectedPages = ['/dashboard.html', '/permit-application.html', '/profile.html'];
            if (protectedPages.some(page => currentPage.includes(page))) {
                window.location.href = '/login.html';
                return;
            }
        } else {
            this.startSessionTimer();
        }
        
        // Update UI based on auth state
        this.updateUI();
        
        // Setup logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    },
    
    // Update navigation UI based on auth state
    updateUI() {
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');
        const userMenu = document.getElementById('userMenu');
        
        if (this.isAuthenticated()) {
            // Hide login/register, show user menu
            if (loginLink) loginLink.parentElement.classList.add('hidden');
            if (registerLink) registerLink.parentElement.classList.add('hidden');
            if (userMenu) userMenu.classList.remove('hidden');
        } else {
            // Show login/register, hide user menu
            if (loginLink) loginLink.parentElement.classList.remove('hidden');
            if (registerLink) registerLink.parentElement.classList.remove('hidden');
            if (userMenu) userMenu.classList.add('hidden');
        }
    },
};

// Form validation helpers
if (typeof validation === 'undefined') {
    var validation = {
        // Validate email
        isEmail(value) {
            const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            return emailRegex.test(value);
        },
        
        // Validate Philippine mobile number
        isPhilippineMobile(value) {
            const mobileRegex = /^09\d{9}$/;
            return mobileRegex.test(value);
        },
        
        // Validate required field
        isRequired(value) {
            return value !== null && value !== undefined && value.toString().trim() !== '';
        },
        
        // Validate minimum length
        minLength(value, min) {
            return value.length >= min;
        },
        
        // Validate password strength
        isStrongPassword(password) {
            const minLength = password.length >= 8;
            const hasUpper = /[A-Z]/.test(password);
            const hasLower = /[a-z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            
            const errors = [];
            if (!minLength) errors.push('at least 8 characters');
            if (!hasUpper) errors.push('one uppercase letter');
            if (!hasLower) errors.push('one lowercase letter');
            if (!hasNumber) errors.push('one number');
            if (!hasSpecial) errors.push('one special character');
            
            return {
                valid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
                errors: errors
            };
        },
        
        // Validate password match
        passwordMatch(password, confirmPassword) {
            return password === confirmPassword;
        },
        
        // Show field error
        showError(fieldId, message) {
            const field = document.getElementById(fieldId);
            if (!field) return;
            
            // Remove existing error
            this.clearError(fieldId);
            
            // Add error styling
            field.classList.add('error');
            
            // Create error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.id = `${fieldId}-error`;
            errorDiv.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                ${message}
            `;
            
            field.parentElement.appendChild(errorDiv);
        },
        
        // Clear field error
        clearError(fieldId) {
            const field = document.getElementById(fieldId);
            if (!field) return;
            
            field.classList.remove('error');
            
            const errorDiv = document.getElementById(`${fieldId}-error`);
            if (errorDiv) {
                errorDiv.remove();
            }
        },
        
        // Clear all errors in a form
        clearAllErrors(formId) {
            const form = document.getElementById(formId);
            if (!form) return;
            
            const errors = form.querySelectorAll('.form-error');
            errors.forEach(error => error.remove());
            
            const fields = form.querySelectorAll('.error');
            fields.forEach(field => field.classList.remove('error'));
        },
    };
}
