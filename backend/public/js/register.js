// Register page specific JavaScript

// Check if already logged in
if (typeof auth !== 'undefined' && auth.isAuthenticated()) {
    window.location.href = '/dashboard.html';
}

// Register form handler
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Clear previous errors
    if (typeof validation !== 'undefined') {
        validation.clearAllErrors('registerForm');
    }
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const street = document.getElementById('street').value.trim();
    const barangay = document.getElementById('barangay').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validation
    let hasError = false;
    
    if (!firstName) {
        showError('firstName', 'First name is required');
        hasError = true;
    }
    
    if (!lastName) {
        showError('lastName', 'Last name is required');
        hasError = true;
    }
    
    if (!email || !email.includes('@')) {
        showError('email', 'Please enter a valid email address');
        hasError = true;
    }
    
    if (!phone || !phone.match(/^09\d{9}$/)) {
        showError('phone', 'Please enter a valid Philippine mobile number (09XXXXXXXXX)');
        hasError = true;
    }
    
    if (!barangay) {
        showError('barangay', 'Please select your barangay');
        hasError = true;
    }
    
    if (password.length < 6) {
        showError('password', 'Password must be at least 6 characters');
        hasError = true;
    }
    
    if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        hasError = true;
    }
    
    if (!agreeTerms) {
        showToast('Please agree to the Terms of Service and Privacy Policy', 'error');
        hasError = true;
    }
    
    if (hasError) return;
    
    // Show loading
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;
    
    try {
        const userData = {
            firstName,
            lastName,
            email,
            phone,
            password,
            address: {
                street,
                barangay,
                municipality: 'Janiuay',
                province: 'Iloilo'
            }
        };
        
        console.log('Sending registration data:', userData);
        
        // Make API call directly
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success) {
            // Store token and user
            const token = result.data?.token;
            const user = result.data?.user;
            
            if (token && user) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                console.log('Stored in localStorage');
                
                showToast('Registration successful! Redirecting...', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1500);
            } else {
                showToast('Registration error: Invalid server response', 'error');
            }
        } else {
            showToast(result.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
    }
});

// Phone number validation
document.getElementById('phone').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '').slice(0, 11);
});

// Helper functions
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.classList.add('error');
    
    // Remove existing error
    const existingError = document.getElementById(`${fieldId}-error`);
    if (existingError) existingError.remove();
    
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
}

function showToast(message, type) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
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
        margin-bottom: 0.5rem;
    `;
    toast.innerHTML = `<p style="margin: 0; color: #374151;">${message}</p>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}
