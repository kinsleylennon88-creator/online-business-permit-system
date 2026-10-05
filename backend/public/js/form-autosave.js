// Form Auto-Save Module
const formAutoSave = {
    // Save form data to localStorage
    save(formId, data) {
        const key = `form_autosave_${formId}`;
        const saveData = {
            data: data,
            timestamp: Date.now(),
            userId: auth.getUser()?.id || 'anonymous'
        };
        localStorage.setItem(key, JSON.stringify(saveData));
    },
    
    // Load saved form data
    load(formId) {
        const key = `form_autosave_${formId}`;
        const saved = localStorage.getItem(key);
        if (!saved) return null;
        
        try {
            const saveData = JSON.parse(saved);
            const userId = auth.getUser()?.id;
            
            // Only load if same user or within 7 days
            const maxAge = 7 * 24 * 60 * 60 * 1000;
            const isRecent = (Date.now() - saveData.timestamp) < maxAge;
            const isSameUser = !userId || saveData.userId === userId || saveData.userId === 'anonymous';
            
            if (isRecent && isSameUser) {
                return saveData.data;
            }
        } catch (e) {
            console.error('Error loading autosave:', e);
        }
        return null;
    },
    
    // Clear saved form data
    clear(formId) {
        const key = `form_autosave_${formId}`;
        localStorage.removeItem(key);
    },
    
    // Setup auto-save for a form
    setup(formId, options = {}) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        const { interval = 30000, exclude = ['password', 'confirmPassword'] } = options;
        
        // Load saved data on init
        const saved = this.load(formId);
        if (saved) {
            this.restoreFormData(form, saved, exclude);
            this.showRestoreNotification(formId);
        }
        
        // Auto-save on input change
        let saveTimeout;
        form.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                const data = this.getFormData(form, exclude);
                this.save(formId, data);
            }, 1000);
        });
        
        // Periodic save
        setInterval(() => {
            const data = this.getFormData(form, exclude);
            this.save(formId, data);
        }, interval);
        
        // Clear on successful submit
        form.addEventListener('submit', () => {
            this.clear(formId);
        });
    },
    
    // Get form data as object
    getFormData(form, exclude = []) {
        const data = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (exclude.includes(input.id) || input.type === 'password') return;
            
            if (input.type === 'checkbox') {
                data[input.id] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) {
                    data[input.name] = input.value;
                }
            } else {
                data[input.id] = input.value;
            }
        });
        
        return data;
    },
    
    // Restore form data
    restoreFormData(form, data, exclude = []) {
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`#${key}`);
            if (!input || exclude.includes(key)) return;
            
            if (input.type === 'checkbox') {
                input.checked = data[key];
            } else if (input.type === 'radio') {
                const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                if (radio) radio.checked = true;
            } else {
                input.value = data[key];
            }
        });
    },
    
    // Show restore notification
    showRestoreNotification(formId) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1e40af;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            z-index: 2000;
            display: flex;
            align-items: center;
            gap: 1rem;
        `;
        toast.innerHTML = `
            <span>📝 Previous form data restored</span>
            <button onclick="formAutoSave.clear('${formId}'); this.parentElement.remove();" 
                style="background: transparent; border: 1px solid white; color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem; cursor: pointer;">
                Clear
            </button>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 10000);
    }
};
