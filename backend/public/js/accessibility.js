// Accessibility Manager - ARIA labels, focus management, screen reader support
const accessibilityManager = {
    init() {
        this.addSkipToContent();
        this.enhanceFormLabels();
        this.addARIALandmarks();
        this.setupFocusManagement();
        this.setupCollapsibleSections();
        this.announcePageLoad();
    },
    
    // Add skip to content link for keyboard users
    addSkipToContent() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-to-content';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add id to main content area
        const main = document.querySelector('main') || document.querySelector('.dashboard');
        if (main) {
            main.id = 'main-content';
            main.setAttribute('tabindex', '-1');
        }
    },
    
    // Enhance all forms with proper ARIA labels
    enhanceFormLabels() {
        // Add aria-required to required fields
        document.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
            field.setAttribute('aria-required', 'true');
            
            // Associate label with input
            const id = field.id || this.generateId(field);
            field.id = id;
            
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) {
                label.setAttribute('id', `${id}-label`);
                field.setAttribute('aria-labelledby', `${id}-label`);
            }
            
            // Add aria-describedby for hints
            const hint = field.parentElement.querySelector('.form-hint');
            if (hint) {
                hint.id = `${id}-hint`;
                field.setAttribute('aria-describedby', `${id}-hint`);
            }
        });
        
        // Add error message handling
        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('invalid', (e) => {
                field.setAttribute('aria-invalid', 'true');
                this.announceToScreenReader(`Error: ${field.validationMessage}`);
            });
            
            field.addEventListener('input', () => {
                if (field.checkValidity()) {
                    field.setAttribute('aria-invalid', 'false');
                }
            });
        });
    },
    
    // Add ARIA landmarks to page structure
    addARIALandmarks() {
        const header = document.querySelector('header');
        if (header) header.setAttribute('role', 'banner');
        
        const nav = document.querySelector('nav');
        if (nav) {
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', 'Main navigation');
        }
        
        const main = document.querySelector('main') || document.querySelector('.dashboard');
        if (main) main.setAttribute('role', 'main');
        
        const footer = document.querySelector('footer');
        if (footer) footer.setAttribute('role', 'contentinfo');
        
        // Add roles to search
        const search = document.querySelector('input[type="search"]');
        if (search) {
            search.setAttribute('role', 'searchbox');
            search.setAttribute('aria-label', 'Search');
        }
    },
    
    // Setup focus management
    setupFocusManagement() {
        // Trap focus in modals
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('keydown', (e) => this.trapFocus(e, modal));
        });
        
        // Restore focus after modal closes
        let lastFocusedElement;
        document.querySelectorAll('[data-toggle="modal"]').forEach(trigger => {
            trigger.addEventListener('click', () => {
                lastFocusedElement = document.activeElement;
            });
        });
        
        document.querySelectorAll('.modal-close').forEach(close => {
            close.addEventListener('click', () => {
                if (lastFocusedElement) {
                    lastFocusedElement.focus();
                }
            });
        });
    },
    
    // Trap focus within modal
    trapFocus(e, modal) {
        if (e.key !== 'Tab') return;
        
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
        }
    },
    
    // Setup collapsible sections
    setupCollapsibleSections() {
        document.querySelectorAll('.collapsible').forEach(section => {
            const header = section.querySelector('.collapsible-header');
            const content = section.querySelector('.collapsible-content');
            
            if (header && content) {
                header.setAttribute('aria-expanded', 'false');
                header.setAttribute('aria-controls', content.id || this.generateId(content));
                content.id = header.getAttribute('aria-controls');
                
                header.addEventListener('click', () => {
                    const isOpen = section.classList.toggle('open');
                    header.setAttribute('aria-expanded', isOpen);
                    
                    if (isOpen) {
                        this.announceToScreenReader('Section expanded');
                    } else {
                        this.announceToScreenReader('Section collapsed');
                    }
                });
            }
        });
    },
    
    // Announce messages to screen readers
    announceToScreenReader(message, priority = 'polite') {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', priority);
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            announcement.remove();
        }, 1000);
    },
    
    // Announce page load
    announcePageLoad() {
        const pageTitle = document.title;
        this.announceToScreenReader(`Loaded ${pageTitle}`);
    },
    
    // Generate unique IDs
    generateId(element) {
        return `aria-${element.tagName.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // Validate form and announce errors
    validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;
        
        const invalidFields = form.querySelectorAll(':invalid');
        if (invalidFields.length > 0) {
            const firstError = invalidFields[0];
            const fieldName = firstError.getAttribute('aria-label') || 
                             firstError.placeholder || 
                             'Required field';
            
            this.announceToScreenReader(
                `Form has ${invalidFields.length} errors. First error: ${fieldName}`,
                'assertive'
            );
            
            firstError.focus();
            return false;
        }
        
        return true;
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    accessibilityManager.init();
});
