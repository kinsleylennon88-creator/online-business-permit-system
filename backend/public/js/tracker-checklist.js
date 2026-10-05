// Application Tracker Widget
const applicationTracker = {
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.loadTrackingData();
    },
    
    async loadTrackingData() {
        try {
            const response = await api.getPermits();
            if (response.success && response.data) {
                this.render(response.data);
            }
        } catch (error) {
            console.error('Failed to load tracking data:', error);
        }
    },
    
    render(permits) {
        if (!permits || permits.length === 0) {
            this.container.innerHTML = `
                <div class="tracker-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <p>No active applications</p>
                    <a href="/permit-application.html" class="btn btn-primary btn-sm">Apply Now</a>
                </div>
            `;
            return;
        }
        
        // Get most recent permit
        const latestPermit = permits[0];
        const statusSteps = this.getStatusSteps(latestPermit.status);
        
        this.container.innerHTML = `
            <div class="tracker-widget">
                <div class="tracker-header">
                    <h3>Application Status</h3>
                    <span class="tracker-id">#${latestPermit._id?.substr(-6) || 'N/A'}</span>
                </div>
                
                <div class="business-name">${latestPermit.businessInfo?.businessName || 'Business Permit'}</div>
                
                <div class="progress-tracker">
                    ${statusSteps.map((step, index) => `
                        <div class="step ${step.status}">
                            <div class="step-icon">
                                ${step.status === 'completed' ? `
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="16" height="16">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                ` : step.status === 'active' ? `
                                    <span class="step-number">${index + 1}</span>
                                ` : `
                                    <span class="step-number">${index + 1}</span>
                                `}
                            </div>
                            <div class="step-label">${step.label}</div>
                            ${step.date ? `<div class="step-date">${format.date(step.date)}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <div class="tracker-estimate">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>Estimated completion: ${this.calculateEstimate(latestPermit)}</span>
                </div>
                
                <div class="tracker-actions">
                    <a href="/permit-status.html?id=${latestPermit._id}" class="btn btn-outline btn-sm">View Details</a>
                    ${latestPermit.status === 'submitted' ? `
                        <button class="btn btn-ghost btn-sm cancel-app-btn" data-permit-id="${latestPermit._id}">
                            Cancel
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Attach event listeners for cancel buttons
        this.container.querySelectorAll('.cancel-app-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const permitId = e.target.dataset.permitId;
                if (permitId) this.cancelApplication(permitId);
            });
        });
    },
    
    getStatusSteps(currentStatus) {
        const steps = [
            { label: 'Submitted', status: 'pending', date: null },
            { label: 'Under Review', status: 'pending', date: null },
            { label: 'Approved', status: 'pending', date: null },
            { label: 'Issued', status: 'pending', date: null }
        ];
        
        const statusOrder = ['draft', 'submitted', 'under_review', 'approved', 'issued', 'rejected'];
        const currentIndex = statusOrder.indexOf(currentStatus);
        
        steps.forEach((step, index) => {
            if (index < currentIndex - 1) {
                step.status = 'completed';
            } else if (index === currentIndex - 1 || 
                      (currentStatus === 'under_review' && index === 1) ||
                      (currentStatus === 'submitted' && index === 0)) {
                step.status = 'active';
            }
        });
        
        if (currentStatus === 'rejected') {
            steps[2] = { label: 'Rejected', status: 'rejected', date: new Date() };
        }
        
        return steps;
    },
    
    calculateEstimate(permit) {
        const statusEstimates = {
            'submitted': '2-3 business days',
            'under_review': '1-2 business days',
            'approved': 'Processing permit issuance',
            'issued': 'Complete'
        };
        
        return statusEstimates[permit.status] || 'Processing';
    },
    
    async cancelApplication(permitId) {
        if (!confirm('Are you sure you want to cancel this application?')) return;
        
        try {
            const response = await api.deletePermit(permitId);
            if (response.success) {
                ui.toast.success('Application cancelled successfully');
                this.loadTrackingData();
            }
        } catch (error) {
            ui.toast.error('Failed to cancel application');
        }
    }
};

// Document Checklist Component
const documentChecklist = {
    requiredDocuments: [
        { id: 'zoning', name: 'Zoning & Locational Clearance', description: 'From MPDC (2nd floor Municipal Hall)', required: true },
        { id: 'occupancy', name: 'Occupancy Permit', description: 'From Building Official (2nd floor Municipal Hall)', required: true },
        { id: 'barangay', name: 'Barangay Business Clearance', description: 'From your local Barangay Hall', required: true },
        { id: 'cedula', name: 'Community Tax Certificate', description: 'From Treasurer\'s Office', required: true },
        { id: 'police', name: 'Police Clearance', description: 'Or Secretary\'s Certificate', required: true },
        { id: 'dti', name: 'Business Name Registration', description: 'DTI/SEC/CDA registration', required: true },
        { id: 'sanitary', name: 'Municipal Sanitary Permit', description: 'From Municipal Health Unit', required: true }
    ],
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.render();
        this.loadSavedProgress();
    },
    
    render() {
        this.container.innerHTML = `
            <div class="checklist-widget">
                <div class="checklist-header">
                    <h3>Required Documents</h3>
                    <span class="checklist-progress" id="checklistProgress">0/7</span>
                </div>
                
                <div class="progress-bar" style="margin-bottom: 16px;">
                    <div class="progress-fill" id="checklistBar" style="width: 0%;"></div>
                </div>
                
                <div class="checklist-items">
                    ${this.requiredDocuments.map(doc => `
                        <label class="checklist-item" for="doc-${doc.id}">
                            <input type="checkbox" id="doc-${doc.id}" data-doc="${doc.id}" class="doc-checkbox">
                            <div class="checklist-content">
                                <div class="checklist-name">${doc.name}</div>
                                <div class="checklist-desc">${doc.description}</div>
                            </div>
                            ${doc.required ? '<span class="required-badge">Required</span>' : ''}
                        </label>
                    `).join('')}
                </div>
                
                <div class="checklist-footer">
                    <button class="btn btn-outline btn-sm" id="checklistReset">Reset</button>
                    <button class="btn btn-primary btn-sm" id="checklistSave">Save Progress</button>
                </div>
            </div>
        `;
        
        // Attach event listeners
        this.container.querySelectorAll('.doc-checkbox').forEach(cb => {
            cb.addEventListener('change', () => this.updateProgress());
        });
        
        const resetBtn = this.container.querySelector('#checklistReset');
        const saveBtn = this.container.querySelector('#checklistSave');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.save());
        }
    },
    
    updateProgress() {
        const checked = document.querySelectorAll('.checklist-item input:checked').length;
        const total = this.requiredDocuments.length;
        const percentage = (checked / total) * 100;
        
        document.getElementById('checklistProgress').textContent = `${checked}/${total}`;
        document.getElementById('checklistBar').style.width = `${percentage}%`;
        
        // Announce to screen reader
        accessibilityManager.announceToScreenReader(`${checked} of ${total} documents prepared`);
    },
    
    save() {
        const checked = Array.from(document.querySelectorAll('.checklist-item input:checked'))
            .map(cb => cb.dataset.doc);
        
        localStorage.setItem('documentChecklist', JSON.stringify(checked));
        ui.toast.success('Progress saved!');
    },
    
    loadSavedProgress() {
        const saved = localStorage.getItem('documentChecklist');
        if (saved) {
            const checked = JSON.parse(saved);
            checked.forEach(docId => {
                const checkbox = document.getElementById(`doc-${docId}`);
                if (checkbox) checkbox.checked = true;
            });
            this.updateProgress();
        }
    },
    
    reset() {
        document.querySelectorAll('.checklist-item input').forEach(cb => cb.checked = false);
        this.updateProgress();
        localStorage.removeItem('documentChecklist');
    }
};
