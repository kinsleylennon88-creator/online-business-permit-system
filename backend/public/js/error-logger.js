// Error Logging Service
const errorLogger = {
    // Log levels
    LEVELS: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        CRITICAL: 4
    },
    
    // Current log level
    currentLevel: 1, // INFO by default
    
    // Maximum logs to keep in storage
    MAX_LOGS: 100,
    
    // Log storage key
    STORAGE_KEY: 'app_error_logs',
    
    // Initialize error logging
    init() {
        // Override console methods to capture errors
        this.overrideConsole();
        
        // Listen for unhandled errors
        window.addEventListener('error', (event) => {
            this.log('ERROR', 'Unhandled error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.stack
            });
        });
        
        // Listen for unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.log('ERROR', 'Unhandled promise rejection', {
                reason: event.reason?.message || event.reason,
                stack: event.reason?.stack
            });
        });
    },
    
    // Override console methods
    overrideConsole() {
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.error = (...args) => {
            this.log('ERROR', args.join(' '));
            originalError.apply(console, args);
        };
        
        console.warn = (...args) => {
            this.log('WARN', args.join(' '));
            originalWarn.apply(console, args);
        };
    },
    
    // Log an error
    log(level, message, details = {}) {
        const levelValue = this.LEVELS[level] || 1;
        if (levelValue < this.currentLevel) return;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            details: details,
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: auth?.getUser()?.id || 'anonymous'
        };
        
        // Store in localStorage
        this.storeLog(logEntry);
        
        // Send to server if critical
        if (level === 'CRITICAL' || level === 'ERROR') {
            this.sendToServer(logEntry);
        }
    },
    
    // Store log in localStorage
    storeLog(logEntry) {
        try {
            let logs = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
            logs.push(logEntry);
            
            // Keep only recent logs
            if (logs.length > this.MAX_LOGS) {
                logs = logs.slice(-this.MAX_LOGS);
            }
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
        } catch (e) {
            // If storage fails, just continue
        }
    },
    
    // Send critical errors to server
    async sendToServer(logEntry) {
        try {
            await fetch('/api/logs/error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logEntry)
            });
        } catch (e) {
            // Silently fail - don't cause more errors
        }
    },
    
    // Get all logs
    getLogs() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    },
    
    // Clear logs
    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
    },
    
    // Helper methods
    debug(message, details) { this.log('DEBUG', message, details); },
    info(message, details) { this.log('INFO', message, details); },
    warn(message, details) { this.log('WARN', message, details); },
    error(message, details) { this.log('ERROR', message, details); },
    critical(message, details) { this.log('CRITICAL', message, details); }
};

// Initialize on load
if (typeof window !== 'undefined') {
    errorLogger.init();
}
