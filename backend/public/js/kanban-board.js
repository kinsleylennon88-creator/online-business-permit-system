// Admin Kanban Board for Permit Management
const kanbanBoard = {
    columns: [
        { id: 'submitted', title: 'Submitted', color: '#f59e0b' },
        { id: 'under_review', title: 'Under Review', color: '#3b82f6' },
        { id: 'approved', title: 'Approved', color: '#10b981' },
        { id: 'rejected', title: 'Rejected', color: '#ef4444' },
        { id: 'issued', title: 'Issued', color: '#8b5cf6' }
    ],
    
    permits: [],
    draggedItem: null,
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.renderBoard();
        this.loadPermits();
        this.setupDragAndDrop();
    },
    
    renderBoard() {
        this.container.innerHTML = `
            <div class="kanban-board">
                <div class="kanban-header">
                    <h2>Permit Management Board</h2>
                    <div class="kanban-actions">
                        <button class="btn btn-outline btn-sm" onclick="kanbanBoard.refresh()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                            </svg>
                            Refresh
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="kanbanBoard.bulkAction()">
                            Bulk Actions
                        </button>
                    </div>
                </div>
                <div class="kanban-columns">
                    ${this.columns.map(col => `
                        <div class="kanban-column" data-status="${col.id}">
                            <div class="kanban-column-header" style="border-top-color: ${col.color}">
                                <span class="kanban-column-title">${col.title}</span>
                                <span class="kanban-column-count" id="count-${col.id}">0</span>
                            </div>
                            <div class="kanban-column-content" id="column-${col.id}">
                                <!-- Cards will be rendered here -->
                            </div>
                            <div class="kanban-column-footer">
                                <button class="btn btn-ghost btn-sm" onclick="kanbanBoard.addCard('${col.id}')">
                                    + Add Permit
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    async loadPermits() {
        try {
            const response = await api.getAllPermits({ limit: 100 });
            if (response.success && response.data) {
                this.permits = response.data.permits || [];
                this.renderCards();
            }
        } catch (error) {
            console.error('Failed to load permits:', error);
        }
    },
    
    renderCards() {
        // Clear all columns
        this.columns.forEach(col => {
            const column = document.getElementById(`column-${col.id}`);
            if (column) column.innerHTML = '';
        });
        
        // Render permits in columns
        this.permits.forEach(permit => {
            const card = this.createCard(permit);
            const column = document.getElementById(`column-${permit.status}`);
            if (column) column.appendChild(card);
        });
        
        // Update counts
        this.columns.forEach(col => {
            const count = this.permits.filter(p => p.status === col.id).length;
            const countEl = document.getElementById(`count-${col.id}`);
            if (countEl) countEl.textContent = count;
        });
    },
    
    createCard(permit) {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.draggable = true;
        card.dataset.permitId = permit._id;
        
        const daysSince = Math.floor((Date.now() - new Date(permit.createdAt)) / (1000 * 60 * 60 * 24));
        const urgencyClass = daysSince > 5 ? 'kanban-card-urgent' : '';
        
        card.innerHTML = `
            <div class="kanban-card-header">
                <span class="kanban-card-id">#${permit._id?.substr(-6)}</span>
                <input type="checkbox" class="kanban-card-select" data-id="${permit._id}">
            </div>
            <div class="kanban-card-title ${urgencyClass}">${permit.businessInfo?.businessName || 'Untitled'}</div>
            <div class="kanban-card-meta">
                <span class="kanban-card-barangay">${permit.businessInfo?.businessAddress?.barangay || 'N/A'}</span>
                <span class="kanban-card-days ${urgencyClass}">${daysSince}d</span>
            </div>
            <div class="kanban-card-footer">
                <div class="kanban-card-applicant">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    ${permit.applicant?.firstName || 'User'}
                </div>
                <div class="kanban-card-actions">
                    <button class="kanban-card-action" onclick="kanbanBoard.viewDetails('${permit._id}')" title="View">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="kanban-card-action" onclick="kanbanBoard.editPermit('${permit._id}')" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        // Drag events
        card.addEventListener('dragstart', (e) => this.handleDragStart(e, permit));
        card.addEventListener('dragend', (e) => this.handleDragEnd(e));
        
        return card;
    },
    
    setupDragAndDrop() {
        const columns = this.container.querySelectorAll('.kanban-column-content');
        
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => this.handleDragOver(e));
            column.addEventListener('drop', (e) => this.handleDrop(e));
            column.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            column.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
    },
    
    handleDragStart(e, permit) {
        this.draggedItem = permit;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    },
    
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.container.querySelectorAll('.kanban-column-content').forEach(col => {
            col.classList.remove('drag-over');
        });
    },
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },
    
    handleDragEnter(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    },
    
    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    },
    
    async handleDrop(e) {
        e.preventDefault();
        const column = e.currentTarget;
        column.classList.remove('drag-over');
        
        const newStatus = column.dataset.status;
        if (!this.draggedItem || this.draggedItem.status === newStatus) return;
        
        // Update permit status
        try {
            const response = await api.updatePermitStatus(this.draggedItem._id, { status: newStatus });
            if (response.success) {
                this.draggedItem.status = newStatus;
                this.renderCards();
                ui.toast.success(`Permit moved to ${newStatus.replace('_', ' ')}`);
            }
        } catch (error) {
            ui.toast.error('Failed to update status');
        }
    },
    
    // Bulk actions
    bulkAction() {
        const selected = Array.from(document.querySelectorAll('.kanban-card-select:checked'))
            .map(cb => cb.dataset.id);
        
        if (selected.length === 0) {
            ui.toast.warning('No permits selected');
            return;
        }
        
        const action = prompt(`Bulk action on ${selected.length} permits:\n1. Approve\n2. Reject\n3. Delete\n\nEnter number:`);
        
        if (action === '1') {
            this.bulkUpdateStatus(selected, 'approved');
        } else if (action === '2') {
            this.bulkUpdateStatus(selected, 'rejected');
        } else if (action === '3') {
            if (confirm(`Delete ${selected.length} permits? This cannot be undone.`)) {
                this.bulkDelete(selected);
            }
        }
    },
    
    async bulkUpdateStatus(ids, status) {
        try {
            await Promise.all(ids.map(id => api.updatePermitStatus(id, { status })));
            ui.toast.success(`${ids.length} permits updated`);
            this.loadPermits();
        } catch (error) {
            ui.toast.error('Some updates failed');
        }
    },
    
    async bulkDelete(ids) {
        try {
            await Promise.all(ids.map(id => api.deletePermit(id)));
            ui.toast.success(`${ids.length} permits deleted`);
            this.loadPermits();
        } catch (error) {
            ui.toast.error('Some deletions failed');
        }
    },
    
    viewDetails(permitId) {
        window.location.href = `/admin-permit-details.html?id=${permitId}`;
    },
    
    editPermit(permitId) {
        window.location.href = `/admin-permit-edit.html?id=${permitId}`;
    },
    
    refresh() {
        this.loadPermits();
    },
    
    addCard(status) {
        window.location.href = `/admin-create-permit.html?status=${status}`;
    }
};
