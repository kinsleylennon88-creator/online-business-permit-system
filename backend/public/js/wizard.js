// Wizard/Step-by-Step Form Manager
const wizard = {
    currentStep: 0,
    totalSteps: 0,
    formData: {},
    isSubmitting: false,
    
    init(containerId, steps) {
        this.container = document.getElementById(containerId);
        this.steps = steps;
        this.totalSteps = steps.length;
        this.isSubmitting = false;
        this.render();
        this.showStep(0);
    },
    
    render() {
        this.container.innerHTML = `
            <div class="wizard-container">
                <div class="wizard-header">
                    <div class="wizard-steps">
                        ${this.steps.map((step, index) => `
                            <div class="wizard-step ${index === 0 ? 'active' : ''}" data-step="${index}">
                                <div class="wizard-step-number">${index + 1}</div>
                                <div class="wizard-step-label">${step.title}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="wizard-content">
                    ${this.steps.map((step, index) => `
                        <div class="wizard-step-content ${index === 0 ? 'active' : ''}" data-step="${index}">
                            ${step.content}
                        </div>
                    `).join('')}
                </div>
                <div class="wizard-footer">
                    <span class="wizard-progress">Step 1 of ${this.totalSteps}</span>
                    <div class="wizard-buttons">
                        <button type="button" class="btn btn-outline wizard-prev-btn" id="wizardPrev" style="display: none;">Back</button>
                        <button type="button" class="btn btn-primary wizard-next-btn" id="wizardNext">Continue</button>
                    </div>
                </div>
            </div>
        `;
        this.attachEventListeners();
    },
    
    attachEventListeners() {
        // Attach event listeners (only once per render)
        const prevBtn = document.getElementById('wizardPrev');
        const nextBtn = document.getElementById('wizardNext');
        
        if (prevBtn && !prevBtn.dataset.listenerAttached) {
            prevBtn.dataset.listenerAttached = 'true';
            prevBtn.addEventListener('click', () => this.prev());
        }
        if (nextBtn && !nextBtn.dataset.listenerAttached) {
            nextBtn.dataset.listenerAttached = 'true';
            nextBtn.addEventListener('click', () => this.next());
        }
    },
    
    showStep(index) {
        if (index < 0 || index >= this.totalSteps) return;
        
        // Hide all step contents first
        document.querySelectorAll('.wizard-step-content').forEach((el) => {
            el.classList.remove('active');
            el.style.display = 'none';
        });
        
        // Show current step content
        const currentContent = document.querySelector(`.wizard-step-content[data-step="${index}"]`);
        if (currentContent) {
            currentContent.style.display = 'block';
            // Small delay to allow display:block to apply before adding active class for animation
            setTimeout(() => {
                currentContent.classList.add('active');
            }, 10);
        }
        
        // Update step indicators
        document.querySelectorAll('.wizard-step').forEach((el, i) => {
            el.classList.remove('active', 'completed');
            if (i < index) el.classList.add('completed');
            if (i === index) el.classList.add('active');
        });
        
        // Update progress text
        const progressEl = document.querySelector('.wizard-progress');
        if (progressEl) {
            progressEl.textContent = `Step ${index + 1} of ${this.totalSteps}`;
        }
        
        // Update buttons
        const prevBtn = document.getElementById('wizardPrev');
        const nextBtn = document.getElementById('wizardNext');
        
        if (prevBtn) {
            prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
        }
        if (nextBtn) {
            nextBtn.textContent = index === this.totalSteps - 1 ? 'Submit' : 'Continue';
        }
        
        this.currentStep = index;
        
        // Save progress
        this.saveProgress();
        
        // Scroll to top of wizard content
        const wizardContent = document.querySelector('.wizard-content');
        if (wizardContent) {
            wizardContent.scrollTop = 0;
        }
    },
    
    next() {
        console.log('next() called, isSubmitting:', this.isSubmitting, 'currentStep:', this.currentStep);
        if (this.isSubmitting) {
            console.log('Blocked: already submitting');
            return; // Prevent multiple submissions
        }
        
        if (this.validateStep(this.currentStep)) {
            if (this.currentStep < this.totalSteps - 1) {
                this.showStep(this.currentStep + 1);
            } else {
                console.log('Calling submit...');
                this.isSubmitting = true;
                this.submit();
            }
        } else {
            console.log('Validation failed for step', this.currentStep);
        }
    },
    
    prev() {
        if (this.currentStep > 0) {
            // Reset submitting flag when going back
            this.isSubmitting = false;
            this.showStep(this.currentStep - 1);
        }
    },
    
    validateStep(index) {
        const stepContent = document.querySelector(`.wizard-step-content[data-step="${index}"]`);
        const requiredFields = stepContent.querySelectorAll('[required]');
        let valid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                valid = false;
                field.classList.add('error');
                
                // Show error message
                const errorDiv = field.parentElement.querySelector('.form-error');
                if (!errorDiv) {
                    const error = document.createElement('div');
                    error.className = 'form-error';
                    error.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        This field is required
                    `;
                    field.parentElement.appendChild(error);
                }
            } else {
                field.classList.remove('error');
                const error = field.parentElement.querySelector('.form-error');
                if (error) error.remove();
            }
        });
        
        return valid;
    },
    
    collectData() {
        const data = {};
        document.querySelectorAll('.wizard-step-content input, .wizard-step-content select, .wizard-step-content textarea').forEach(field => {
            if (field.type === 'checkbox') {
                data[field.name || field.id] = field.checked;
            } else if (field.type === 'radio') {
                if (field.checked) {
                    data[field.name] = field.value;
                }
            } else {
                data[field.name || field.id] = field.value;
            }
        });
        return data;
    },
    
    submit() {
        this.formData = this.collectData();
        
        // Clear saved progress
        localStorage.removeItem('wizard_progress');
        
        // Show success
        this.showComplete();
        
        // Reset submitting flag
        this.isSubmitting = false;
        
        // Return data for further processing
        return this.formData;
    },
    
    showComplete() {
        document.querySelector('.wizard-content').innerHTML = `
            <div class="wizard-complete">
                <div class="wizard-complete-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="40" height="40">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <h2 class="wizard-complete-title">Application Submitted!</h2>
                <p class="wizard-complete-text">Your business permit application has been submitted successfully. You will receive a confirmation email shortly.</p>
                <a href="/dashboard.html" class="btn btn-primary btn-lg">Go to Dashboard</a>
            </div>
        `;
        document.querySelector('.wizard-footer').style.display = 'none';
        document.querySelector('.wizard-header').style.display = 'none';
    },
    
    saveProgress() {
        const data = this.collectData();
        localStorage.setItem('wizard_progress', JSON.stringify({
            step: this.currentStep,
            data: data,
            timestamp: Date.now()
        }));
    },
    
    restoreProgress() {
        const saved = localStorage.getItem('wizard_progress');
        if (saved) {
            const progress = JSON.parse(saved);
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
            
            if (Date.now() - progress.timestamp < maxAge) {
                // Restore form data
                Object.keys(progress.data).forEach(key => {
                    const field = document.querySelector(`[name="${key}"], #${key}`);
                    if (field) {
                        if (field.type === 'checkbox') {
                            field.checked = progress.data[key];
                        } else {
                            field.value = progress.data[key];
                        }
                    }
                });
                
                // Ask user if they want to resume
                if (confirm('Would you like to continue from where you left off?')) {
                    this.showStep(progress.step);
                }
            }
        }
    }
};

// File Upload Manager with Progress
const fileUploadManager = {
    uploads: [],
    
    init(inputId, containerId, options = {}) {
        const input = document.getElementById(inputId);
        const container = document.getElementById(containerId);
        
        if (!input || !container) return;
        
        this.container = container;
        this.options = {
            maxFiles: 5,
            maxSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: [],
            ...options
        };
        
        input.addEventListener('change', (e) => this.handleFiles(e.target.files));
        
        // Drag and drop
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('drag-over');
        });
        
        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });
    },
    
    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                this.uploadFile(file);
            }
        });
    },
    
    validateFile(file) {
        if (file.size > this.options.maxSize) {
            ui.toast.error(`File ${file.name} is too large. Max size: ${this.formatSize(this.options.maxSize)}`);
            return false;
        }
        
        if (this.options.allowedTypes.length > 0 && !this.options.allowedTypes.includes(file.type)) {
            ui.toast.error(`File type not allowed: ${file.name}`);
            return false;
        }
        
        return true;
    },
    
    uploadFile(file) {
        const uploadId = Date.now() + Math.random();
        const upload = {
            id: uploadId,
            file: file,
            progress: 0,
            status: 'uploading'
        };
        
        this.uploads.push(upload);
        this.renderFileItem(upload);
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                upload.status = 'complete';
            }
            upload.progress = progress;
            this.updateProgress(uploadId, progress);
        }, 300);
    },
    
    renderFileItem(upload) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.id = `file-${upload.id}`;
        div.innerHTML = `
            <div class="file-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
            </div>
            <div class="file-info">
                <div class="file-name">${upload.file.name}</div>
                <div class="file-meta">${this.formatSize(upload.file.size)}</div>
                <div class="file-progress">
                    <div class="file-progress-bar">
                        <div class="file-progress-fill" id="progress-${upload.id}" style="width: 0%"></div>
                    </div>
                    <div class="file-progress-text" id="progress-text-${upload.id}">0%</div>
                </div>
            </div>
            <div class="file-actions">
                <button class="file-action-btn" data-remove-file="${upload.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
        
        this.container.querySelector('.file-list')?.appendChild(div) || this.container.appendChild(div);
    },
    
    updateProgress(uploadId, progress) {
        const fill = document.getElementById(`progress-${uploadId}`);
        const text = document.getElementById(`progress-text-${uploadId}`);
        if (fill) fill.style.width = `${progress}%`;
        if (text) text.textContent = `${Math.round(progress)}%`;
    },
    
    removeFile(uploadId) {
        const element = document.getElementById(`file-${uploadId}`);
        if (element) element.remove();
        this.uploads = this.uploads.filter(u => u.id !== uploadId);
    },
    
    formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};
