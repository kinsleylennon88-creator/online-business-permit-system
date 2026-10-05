/**
 * Advanced Features for Janiuay BPLO
 * Real-time notifications, document upload, progress tracking
 */

const BPLOFeatures = {
    // ===== REAL-TIME NOTIFICATION SYSTEM =====
    notifications: {
        container: null,
        notifications: [],
        
        init() {
            // Don't initialize on auth pages or admin pages
            const path = window.location.pathname;
            if (path.includes('login') || path.includes('register') || path.includes('forgot-password') || path.includes('admin')) {
                return;
            }
            
            // Don't initialize if user is not logged in
            if (typeof auth !== 'undefined' && !auth.isAuthenticated()) {
                return;
            }
            
            this.createContainer();
            this.loadNotifications();
            this.startRealtimeUpdates();
        },
        
        createContainer() {
            this.container = document.createElement('div');
            this.container.className = 'notification-center';
            this.container.innerHTML = `
                <div class="notification-bell" id="notificationBell">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span class="notification-badge" id="notificationBadge">0</span>
                </div>
                <div class="notification-dropdown" id="notificationDropdown">
                    <div class="notification-header">
                        <h3>Notifications</h3>
                        <button class="mark-all-read" id="markAllRead">Mark all read</button>
                    </div>
                    <div class="notification-list" id="notificationList"></div>
                    <div class="notification-footer">
                        <a href="/notifications.html">View all notifications</a>
                    </div>
                </div>
            `;
            document.body.appendChild(this.container);
            this.attachEvents();
        },
        
        attachEvents() {
            const bell = document.getElementById('notificationBell');
            const dropdown = document.getElementById('notificationDropdown');
            const markAllRead = document.getElementById('markAllRead');
            
            bell?.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
            
            document.addEventListener('click', (e) => {
                if (!this.container.contains(e.target)) {
                    dropdown?.classList.remove('show');
                }
            });
            
            markAllRead?.addEventListener('click', () => this.markAllAsRead());
        },
        
        async loadNotifications() {
            // Simulated API call
            const mockNotifications = [
                { id: 1, title: 'Permit Approved', message: 'Your business permit #2024-001 has been approved!', type: 'success', time: '2 min ago', read: false },
                { id: 2, title: 'Document Required', message: 'Please upload your updated barangay clearance.', type: 'warning', time: '1 hour ago', read: false },
                { id: 3, title: 'Payment Received', message: 'Your payment of ₱1,250 has been confirmed.', type: 'info', time: '3 hours ago', read: true },
            ];
            
            this.notifications = mockNotifications;
            this.renderNotifications();
            this.updateBadge();
        },
        
        renderNotifications() {
            const list = document.getElementById('notificationList');
            if (!list) return;
            
            list.innerHTML = this.notifications.map(notif => `
                <div class="notification-item ${notif.read ? 'read' : 'unread'}" data-id="${notif.id}">
                    <div class="notification-icon ${notif.type}">
                        ${this.getIcon(notif.type)}
                    </div>
                    <div class="notification-content">
                        <h4>${notif.title}</h4>
                        <p>${notif.message}</p>
                        <span class="notification-time">${notif.time}</span>
                    </div>
                    ${!notif.read ? '<span class="unread-dot"></span>' : ''}
                </div>
            `).join('');
            
            // Attach click events
            list.querySelectorAll('.notification-item').forEach(item => {
                item.addEventListener('click', () => this.markAsRead(item.dataset.id));
            });
        },
        
        getIcon(type) {
            const icons = {
                success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
                warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
                info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
                error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
            };
            return icons[type] || icons.info;
        },
        
        markAsRead(id) {
            const notif = this.notifications.find(n => n.id == id);
            if (notif) {
                notif.read = true;
                this.renderNotifications();
                this.updateBadge();
            }
        },
        
        markAllAsRead() {
            this.notifications.forEach(n => n.read = true);
            this.renderNotifications();
            this.updateBadge();
        },
        
        updateBadge() {
            const badge = document.getElementById('notificationBadge');
            const unread = this.notifications.filter(n => !n.read).length;
            if (badge) {
                badge.textContent = unread;
                badge.style.display = unread > 0 ? 'block' : 'none';
            }
        },
        
        startRealtimeUpdates() {
            // Simulate real-time updates every 30 seconds
            setInterval(() => {
                if (Math.random() > 0.7) {
                    this.addNotification({
                        id: Date.now(),
                        title: 'Status Update',
                        message: 'Your application status has changed.',
                        type: 'info',
                        time: 'Just now',
                        read: false
                    });
                }
            }, 30000);
        },
        
        addNotification(notif) {
            this.notifications.unshift(notif);
            if (this.notifications.length > 20) this.notifications.pop();
            this.renderNotifications();
            this.updateBadge();
            this.showToast(notif);
        },
        
        showToast(notif) {
            // Create toast notification
            const toast = document.createElement('div');
            toast.className = `toast-notification ${notif.type}`;
            toast.innerHTML = `
                <div class="toast-icon">${this.getIcon(notif.type)}</div>
                <div class="toast-content">
                    <h4>${notif.title}</h4>
                    <p>${notif.message}</p>
                </div>
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => toast.classList.add('show'), 100);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 5000);
        }
    },

    // ===== DOCUMENT UPLOAD WITH PREVIEW =====
    documentUpload: {
        uploads: [],
        
        init(formId) {
            const form = document.getElementById(formId);
            if (!form) return;
            
            const dropzones = form.querySelectorAll('.upload-dropzone');
            dropzones.forEach(zone => this.setupDropzone(zone));
        },
        
        setupDropzone(zone) {
            const input = zone.querySelector('input[type="file"]');
            const preview = zone.querySelector('.upload-preview');
            
            // Drag and drop events
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('dragover');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('dragover');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('dragover');
                const files = e.dataTransfer.files;
                this.handleFiles(files, zone, preview);
            });
            
            input?.addEventListener('change', (e) => {
                this.handleFiles(e.target.files, zone, preview);
            });
        },
        
        handleFiles(files, zone, preview) {
            Array.from(files).forEach(file => {
                if (this.validateFile(file)) {
                    this.previewFile(file, preview);
                    this.uploads.push(file);
                }
            });
        },
        
        validateFile(file) {
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            const maxSize = 10 * 1024 * 1024; // 10MB
            
            if (!allowedTypes.includes(file.type)) {
                alert('Please upload PDF, JPG, or PNG files only.');
                return false;
            }
            
            if (file.size > maxSize) {
                alert('File size must be less than 10MB.');
                return false;
            }
            
            return true;
        },
        
        previewFile(file, container) {
            const reader = new FileReader();
            const item = document.createElement('div');
            item.className = 'upload-item';
            
            reader.onload = (e) => {
                if (file.type.startsWith('image/')) {
                    item.innerHTML = `
                        <img src="${e.target.result}" alt="${file.name}">
                        <div class="upload-info">
                            <span class="filename">${file.name}</span>
                            <span class="filesize">${this.formatSize(file.size)}</span>
                        </div>
                        <button class="remove-file" onclick="this.parentElement.remove()">×</button>
                    `;
                } else {
                    item.innerHTML = `
                        <div class="file-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </div>
                        <div class="upload-info">
                            <span class="filename">${file.name}</span>
                            <span class="filesize">${this.formatSize(file.size)}</span>
                        </div>
                        <button class="remove-file" onclick="this.parentElement.remove()">×</button>
                    `;
                }
            };
            
            reader.readAsDataURL(file);
            container.appendChild(item);
        },
        
        formatSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    },

    // ===== PROGRESS TRACKING =====
    progressTracker: {
        init(containerId, steps) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            this.render(container, steps);
        },
        
        render(container, steps) {
            container.innerHTML = `
                <div class="progress-tracker">
                    <div class="progress-line">
                        <div class="progress-fill" style="width: ${this.calculateProgress(steps)}%"></div>
                    </div>
                    <div class="progress-steps">
                        ${steps.map((step, index) => `
                            <div class="progress-step ${step.status}" data-step="${index + 1}">
                                <div class="step-circle">
                                    ${step.status === 'completed' ? '✓' : index + 1}
                                </div>
                                <div class="step-label">${step.label}</div>
                                <div class="step-date">${step.date || ''}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },
        
        calculateProgress(steps) {
            const completed = steps.filter(s => s.status === 'completed').length;
            return (completed / steps.length) * 100;
        },
        
        updateStep(containerId, stepIndex, status, date) {
            const container = document.getElementById(containerId);
            const step = container?.querySelector(`[data-step="${stepIndex + 1}"]`);
            if (step) {
                step.className = `progress-step ${status}`;
                if (date) step.querySelector('.step-date').textContent = date;
            }
        }
    },

    // ===== PERMIT WIZARD =====
    permitWizard: {
        currentStep: 1,
        totalSteps: 5,
        formData: {},
        
        init(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            this.container = container;
            this.render();
            this.attachEvents();
        },
        
        render() {
            this.container.innerHTML = `
                <div class="permit-wizard">
                    <div class="wizard-header">
                        <h2>Business Permit Application</h2>
                        <div class="wizard-progress">
                            <span>Step ${this.currentStep} of ${this.totalSteps}</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="wizard-steps">
                        ${this.getStepContent(this.currentStep)}
                    </div>
                    
                    <div class="wizard-footer">
                        <button class="btn-prev" ${this.currentStep === 1 ? 'disabled' : ''}>Previous</button>
                        <button class="btn-next">${this.currentStep === this.totalSteps ? 'Submit' : 'Next'}</button>
                    </div>
                </div>
            `;
        },
        
        getStepContent(step) {
            const steps = {
                1: `
                    <div class="wizard-step active">
                        <h3>Business Information</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Business Name *</label>
                                <input type="text" name="businessName" required placeholder="Enter business name">
                            </div>
                            <div class="form-group">
                                <label>Business Type *</label>
                                <select name="businessType" required>
                                    <option value="">Select type</option>
                                    <option value="sole">Sole Proprietorship</option>
                                    <option value="partnership">Partnership</option>
                                    <option value="corporation">Corporation</option>
                                    <option value="cooperative">Cooperative</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Business Address *</label>
                                <textarea name="businessAddress" required placeholder="Complete address"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Barangay *</label>
                                <select name="barangay" required>
                                    <option value="">Select barangay</option>
                                    <option value="poblacion">Poblacion</option>
                                    <option value="bucari">Bucari</option>
                                    <option value="aquino">Aquino</option>
                                    <option value="san_pedro">San Pedro</option>
                                    <option value="lopez_jaena">Lopez Jaena</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `,
                2: `
                    <div class="wizard-step active">
                        <h3>Owner Information</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>First Name *</label>
                                <input type="text" name="firstName" required>
                            </div>
                            <div class="form-group">
                                <label>Last Name *</label>
                                <input type="text" name="lastName" required>
                            </div>
                            <div class="form-group">
                                <label>Contact Number *</label>
                                <input type="tel" name="contactNumber" required placeholder="09XX XXX XXXX">
                            </div>
                            <div class="form-group">
                                <label>Email Address *</label>
                                <input type="email" name="email" required>
                            </div>
                        </div>
                    </div>
                `,
                3: `
                    <div class="wizard-step active">
                        <h3>Business Details</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Business Nature *</label>
                                <select name="businessNature" required>
                                    <option value="">Select nature</option>
                                    <option value="retail">Retail/Trading</option>
                                    <option value="food">Food Service</option>
                                    <option value="services">Services</option>
                                    <option value="manufacturing">Manufacturing</option>
                                    <option value="agriculture">Agriculture</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Capital Investment (₱) *</label>
                                <input type="number" name="capital" required placeholder="e.g. 50000">
                            </div>
                            <div class="form-group">
                                <label>Gross Sales (Annual) *</label>
                                <input type="number" name="grossSales" required placeholder="e.g. 500000">
                            </div>
                            <div class="form-group">
                                <label>Number of Employees</label>
                                <input type="number" name="employees" min="0" placeholder="e.g. 5">
                            </div>
                        </div>
                    </div>
                `,
                4: `
                    <div class="wizard-step active">
                        <h3>Required Documents</h3>
                        <div class="upload-section">
                            <div class="upload-dropzone" data-doc="barangay-clearance">
                                <input type="file" id="barangayClearance" accept=".pdf,.jpg,.png" hidden>
                                <label for="barangayClearance">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    <span>Barangay Business Clearance</span>
                                    <small>PDF, JPG, PNG (Max 10MB)</small>
                                </label>
                                <div class="upload-preview"></div>
                            </div>
                            
                            <div class="upload-dropzone" data-doc="dti-registration">
                                <input type="file" id="dtiRegistration" accept=".pdf,.jpg,.png" hidden>
                                <label for="dtiRegistration">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                    </svg>
                                    <span>DTI/SEC/CDA Registration</span>
                                    <small>PDF, JPG, PNG (Max 10MB)</small>
                                </label>
                                <div class="upload-preview"></div>
                            </div>
                            
                            <div class="upload-dropzone" data-doc="zoning-clearance">
                                <input type="file" id="zoningClearance" accept=".pdf,.jpg,.png" hidden>
                                <label for="zoningClearance">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                    <span>Zoning/Locational Clearance</span>
                                    <small>PDF, JPG, PNG (Max 10MB)</small>
                                </label>
                                <div class="upload-preview"></div>
                            </div>
                        </div>
                    </div>
                `,
                5: `
                    <div class="wizard-step active">
                        <h3>Review & Submit</h3>
                        <div class="review-section">
                            <div class="review-card">
                                <h4>Business Information</h4>
                                <div class="review-data" id="review-business"></div>
                            </div>
                            <div class="review-card">
                                <h4>Owner Information</h4>
                                <div class="review-data" id="review-owner"></div>
                            </div>
                            <div class="review-card">
                                <h4>Payment Summary</h4>
                                <div class="payment-breakdown">
                                    <div class="payment-item">
                                        <span>Mayor's Permit Fee</span>
                                        <span>₱500.00</span>
                                    </div>
                                    <div class="payment-item">
                                        <span>Business Tax</span>
                                        <span>₱750.00</span>
                                    </div>
                                    <div class="payment-item">
                                        <span>Sanitary Permit</span>
                                        <span>₱100.00</span>
                                    </div>
                                    <div class="payment-item total">
                                        <span>Total</span>
                                        <span>₱1,350.00</span>
                                    </div>
                                </div>
                            </div>
                            <div class="terms-checkbox">
                                <input type="checkbox" id="agreeTerms" required>
                                <label for="agreeTerms">I confirm that all information provided is accurate and complete.</label>
                            </div>
                        </div>
                    </div>
                `
            };
            return steps[step] || '';
        },
        
        attachEvents() {
            this.container.addEventListener('click', (e) => {
                if (e.target.matches('.btn-next')) {
                    this.nextStep();
                } else if (e.target.matches('.btn-prev')) {
                    this.prevStep();
                }
            });
            
            this.container.addEventListener('change', (e) => {
                if (e.target.matches('input, select, textarea')) {
                    this.formData[e.target.name] = e.target.value;
                }
            });
        },
        
        nextStep() {
            if (this.validateStep()) {
                if (this.currentStep < this.totalSteps) {
                    this.currentStep++;
                    this.render();
                    BPLOFeatures.documentUpload.init(this.container.querySelector('.wizard-steps').id);
                } else {
                    this.submit();
                }
            }
        },
        
        prevStep() {
            if (this.currentStep > 1) {
                this.currentStep--;
                this.render();
            }
        },
        
        validateStep() {
            const currentStepEl = this.container.querySelector('.wizard-step.active');
            const required = currentStepEl.querySelectorAll('[required]');
            let valid = true;
            
            required.forEach(field => {
                if (!field.value) {
                    valid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            // Show specific validation errors
            let errorMsg = response.message || 'Registration failed';
            if (response.errors && response.errors.length > 0) {
                errorMsg = response.errors.map(e => e.msg).join(', ');
            }
            ui.toast.error(errorMsg);
            console.error('Registration errors:', response.errors);
            
            return valid;
        },
        
        submit() {
            console.log('Submitting:', this.formData);
            alert('Application submitted successfully! Your reference number is BP-' + Date.now());
        }
    },

    // ===== SEARCH AND FILTER =====
    searchFilter: {
        init(containerId, items) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            this.container = container;
            this.items = items;
            this.render();
            this.attachEvents();
        },
        
        render() {
            this.container.innerHTML = `
                <div class="search-filter">
                    <div class="search-bar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                        </svg>
                        <input type="text" placeholder="Search..." id="searchInput">
                    </div>
                    <div class="filter-chips">
                        <button class="chip active" data-filter="all">All</button>
                        <button class="chip" data-filter="pending">Pending</button>
                        <button class="chip" data-filter="approved">Approved</button>
                        <button class="chip" data-filter="rejected">Rejected</button>
                    </div>
                    <div class="sort-dropdown">
                        <select id="sortSelect">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="name">Name A-Z</option>
                        </select>
                    </div>
                </div>
            `;
        },
        
        attachEvents() {
            const searchInput = this.container.querySelector('#searchInput');
            const chips = this.container.querySelectorAll('.chip');
            const sortSelect = this.container.querySelector('#sortSelect');
            
            searchInput?.addEventListener('input', (e) => this.filter(e.target.value));
            
            chips.forEach(chip => {
                chip.addEventListener('click', () => {
                    chips.forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    this.filterByStatus(chip.dataset.filter);
                });
            });
            
            sortSelect?.addEventListener('change', (e) => this.sort(e.target.value));
        },
        
        filter(query) {
            const filtered = this.items.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.status.toLowerCase().includes(query.toLowerCase())
            );
            this.renderResults(filtered);
        },
        
        filterByStatus(status) {
            const filtered = status === 'all' 
                ? this.items 
                : this.items.filter(item => item.status === status);
            this.renderResults(filtered);
        },
        
        sort(criteria) {
            const sorted = [...this.items].sort((a, b) => {
                if (criteria === 'newest') return b.date - a.date;
                if (criteria === 'oldest') return a.date - b.date;
                if (criteria === 'name') return a.name.localeCompare(b.name);
            });
            this.renderResults(sorted);
        },
        
        renderResults(items) {
            // Dispatch custom event for parent component
            const event = new CustomEvent('filterChange', { detail: items });
            this.container.dispatchEvent(event);
        }
    },

    // ===== ANALYTICS DASHBOARD =====
    analytics: {
        init(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            this.container = container;
            this.render();
            this.renderCharts();
        },
        
        render() {
            this.container.innerHTML = `
                <div class="analytics-dashboard">
                    <div class="stats-row">
                        <div class="stat-card-2025">
                            <div class="stat-icon">📊</div>
                            <div class="stat-info">
                                <span class="stat-value counter" data-target="1250">0</span>
                                <span class="stat-label">Total Applications</span>
                                <span class="stat-change positive">+12% this month</span>
                            </div>
                        </div>
                        <div class="stat-card-2025">
                            <div class="stat-icon">✅</div>
                            <div class="stat-info">
                                <span class="stat-value counter" data-target="892">0</span>
                                <span class="stat-label">Approved</span>
                                <span class="stat-change positive">+8% this month</span>
                            </div>
                        </div>
                        <div class="stat-card-2025">
                            <div class="stat-icon">⏳</div>
                            <div class="stat-info">
                                <span class="stat-value counter" data-target="156">0</span>
                                <span class="stat-label">Pending</span>
                                <span class="stat-change neutral">-3% this month</span>
                            </div>
                        </div>
                        <div class="stat-card-2025">
                            <div class="stat-icon">💰</div>
                            <div class="stat-info">
                                <span class="stat-value">₱<span class="counter" data-target="2850000">0</span></span>
                                <span class="stat-label">Revenue Collected</span>
                                <span class="stat-change positive">+15% this month</span>
                            </div>
                        </div>
                    </div>
                    <div class="charts-row">
                        <div class="chart-card">
                            <h3>Applications by Month</h3>
                            <canvas id="applicationsChart"></canvas>
                        </div>
                        <div class="chart-card">
                            <h3>Status Distribution</h3>
                            <canvas id="statusChart"></canvas>
                        </div>
                    </div>
                </div>
            `;
        },
        
        renderCharts() {
            // Initialize counter animations
            const counters = this.container.querySelectorAll('.counter');
            counters.forEach(counter => {
                const target = parseInt(counter.dataset.target);
                let current = 0;
                const step = target / 50;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        counter.textContent = target.toLocaleString();
                        clearInterval(timer);
                    } else {
                        counter.textContent = Math.floor(current).toLocaleString();
                    }
                }, 30);
            });
        }
    },

    // ===== INITIALIZE ALL FEATURES =====
    init() {
        this.notifications.init();
        
        // Initialize features based on page
        if (document.getElementById('permitWizard')) {
            this.permitWizard.init('permitWizard');
        }
        
        if (document.getElementById('documentUpload')) {
            this.documentUpload.init('documentUpload');
        }
        
        if (document.getElementById('progressTracker')) {
            this.progressTracker.init('progressTracker', [
                { label: 'Submitted', status: 'completed', date: 'Jan 15' },
                { label: 'Under Review', status: 'completed', date: 'Jan 16' },
                { label: 'Inspection', status: 'current', date: 'Pending' },
                { label: 'Approved', status: 'pending', date: '' },
            ]);
        }
        
        if (document.getElementById('analyticsDashboard')) {
            this.analytics.init('analyticsDashboard');
        }
        
        console.log('BPLO Advanced Features initialized 🚀');
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => BPLOFeatures.init());

// Export for global access
window.BPLOFeatures = BPLOFeatures;
