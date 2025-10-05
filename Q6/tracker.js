/**
 * Universal Event Tracker
 * Captures all click events and page views with detailed logging
 * Works with any HTML page including Q1-Q5 implementations
 */

// Class to manage event tracking
class EventTracker {
    constructor() {
        // Initialize event storage array
        this.events = [];
        // Track if page view has been logged
        this.pageViewLogged = false;
        // Initialize the tracker
        this.init();
    }

    /**
     * Initialize all event listeners
     */
    init() {
        // Log page view when page loads
        this.logPageView();
        
        // Track all click events on the document
        this.trackClicks();
        
        // Track all input changes
        this.trackInputChanges();
        
        // Track form submissions
        this.trackFormSubmissions();
        
        // Track scroll events
        this.trackScrollEvents();
        
        // Track hover events on important elements
        this.trackHoverEvents();
        
        // Track visibility changes (tab switching)
        this.trackVisibilityChanges();
        
        // Log summary on page unload
        this.trackPageUnload();
    }

    /**
     * Generate timestamp in readable format
     */
    getTimestamp() {
        const now = new Date();
        return now.toISOString();
    }

    /**
     * Get detailed element information
     */
    getElementInfo(element) {
        // Get element type
        const tagName = element.tagName.toLowerCase();
        
        // Get element identifiers
        const id = element.id || 'no-id';
        const className = element.className || 'no-class';
        
        // Get element text content (truncated)
        const text = element.textContent.trim().substring(0, 50) || 'no-text';
        
        // Determine element type/role
        let elementType = tagName;
        
        if (element.type) {
            elementType = `${tagName}[type="${element.type}"]`;
        } else if (tagName === 'a') {
            elementType = 'link';
        } else if (tagName === 'button') {
            elementType = 'button';
        } else if (tagName === 'img') {
            elementType = 'image';
        } else if (tagName === 'select') {
            elementType = 'dropdown';
        } else if (tagName === 'input') {
            elementType = 'input-field';
        } else if (tagName === 'textarea') {
            elementType = 'text-area';
        } else if (className.includes('btn')) {
            elementType = 'button';
        } else if (className.includes('card')) {
            elementType = 'card';
        } else if (className.includes('tab')) {
            elementType = 'tab';
        }
        
        // Get CSS classes applied
        const cssClasses = className ? className.split(' ').filter(c => c) : [];
        
        // Get computed styles for important properties
        const computedStyle = window.getComputedStyle(element);
        const cssProperties = {
            backgroundColor: computedStyle.backgroundColor,
            color: computedStyle.color,
            fontSize: computedStyle.fontSize,
            display: computedStyle.display
        };
        
        return {
            tagName,
            id,
            className,
            text,
            elementType,
            cssClasses,
            cssProperties,
            href: element.href || null,
            src: element.src || null,
            value: element.value || null
        };
    }

    /**
     * Log an event to console and storage
     */
    logEvent(eventType, element, additionalData = {}) {
        // Create event object
        const event = {
            timestamp: this.getTimestamp(),
            type: eventType,
            elementInfo: element ? this.getElementInfo(element) : null,
            ...additionalData
        };
        
        // Store event
        this.events.push(event);
        
        // Log to console with formatting
        this.printEvent(event);
    }

    /**
     * Print event to console with beautiful formatting
     */
    printEvent(event) {
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea');
        console.log('%c🎯 EVENT CAPTURED', 'color: #667eea; font-weight: bold; font-size: 14px');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea');
        
        // Timestamp
        console.log('%c⏰ Timestamp:', 'color: #f59e0b; font-weight: bold', event.timestamp);
        
        // Event type
        console.log('%c📌 Event Type:', 'color: #10b981; font-weight: bold', event.type);
        
        // Element information
        if (event.elementInfo) {
            console.log('%c🎨 Element Details:', 'color: #3b82f6; font-weight: bold');
            console.log('   └─ Tag:', event.elementInfo.tagName);
            console.log('   └─ Type:', event.elementInfo.elementType);
            console.log('   └─ ID:', event.elementInfo.id);
            console.log('   └─ Classes:', event.elementInfo.cssClasses.join(', ') || 'none');
            console.log('   └─ Text:', event.elementInfo.text);
            
            if (event.elementInfo.href) {
                console.log('   └─ Href:', event.elementInfo.href);
            }
            if (event.elementInfo.src) {
                console.log('   └─ Src:', event.elementInfo.src);
            }
            if (event.elementInfo.value) {
                console.log('   └─ Value:', event.elementInfo.value);
            }
            
            // CSS Properties
            console.log('%c🎨 CSS Properties:', 'color: #8b5cf6; font-weight: bold');
            console.log('   └─ Background:', event.elementInfo.cssProperties.backgroundColor);
            console.log('   └─ Color:', event.elementInfo.cssProperties.color);
            console.log('   └─ Font Size:', event.elementInfo.cssProperties.fontSize);
            console.log('   └─ Display:', event.elementInfo.cssProperties.display);
        }
        
        // Additional data
        if (Object.keys(event).length > 3) {
            console.log('%c📊 Additional Data:', 'color: #ec4899; font-weight: bold');
            Object.keys(event).forEach(key => {
                if (key !== 'timestamp' && key !== 'type' && key !== 'elementInfo') {
                    console.log(`   └─ ${key}:`, event[key]);
                }
            });
        }
        
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'color: #667eea');
    }

    /**
     * Log page view event
     */
    logPageView() {
        if (!this.pageViewLogged) {
            this.pageViewLogged = true;
            
            const pageInfo = {
                url: window.location.href,
                pathname: window.location.pathname,
                title: document.title,
                referrer: document.referrer || 'direct',
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                userAgent: navigator.userAgent,
                language: navigator.language
            };
            
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981; font-size: 16px');
            console.log('%c👁️  PAGE VIEW EVENT', 'color: #10b981; font-weight: bold; font-size: 18px');
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981; font-size: 16px');
            console.log('%c⏰ Timestamp:', 'color: #f59e0b; font-weight: bold', this.getTimestamp());
            console.log('%c📄 Page Info:', 'color: #3b82f6; font-weight: bold');
            console.log('   └─ URL:', pageInfo.url);
            console.log('   └─ Title:', pageInfo.title);
            console.log('   └─ Referrer:', pageInfo.referrer);
            console.log('%c📱 Viewport:', 'color: #8b5cf6; font-weight: bold');
            console.log(`   └─ Screen: ${pageInfo.screenWidth}x${pageInfo.screenHeight}`);
            console.log(`   └─ Window: ${pageInfo.windowWidth}x${pageInfo.windowHeight}`);
            console.log('%c🌐 Browser:', 'color: #ec4899; font-weight: bold');
            console.log('   └─ User Agent:', pageInfo.userAgent);
            console.log('   └─ Language:', pageInfo.language);
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'color: #10b981; font-size: 16px');
            
            this.events.push({
                timestamp: this.getTimestamp(),
                type: 'PAGE_VIEW',
                ...pageInfo
            });
        }
    }

    /**
     * Track all click events
     */
    trackClicks() {
        // Capture all click events at document level
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Get click position
            const clickPosition = {
                x: e.clientX,
                y: e.clientY,
                pageX: e.pageX,
                pageY: e.pageY
            };
            
            this.logEvent('CLICK', target, {
                clickPosition,
                button: e.button === 0 ? 'left' : e.button === 1 ? 'middle' : 'right'
            });
        }, true); // Use capture phase to catch all events
    }

    /**
     * Track input changes
     */
    trackInputChanges() {
        // Track input, select, textarea changes
        document.addEventListener('change', (e) => {
            const target = e.target;
            if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
                this.logEvent('INPUT_CHANGE', target, {
                    newValue: target.value,
                    inputType: target.type
                });
            }
        }, true);
        
        // Track file uploads
        document.addEventListener('change', (e) => {
            const target = e.target;
            if (target.type === 'file' && target.files.length > 0) {
                const fileInfo = Array.from(target.files).map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type
                }));
                
                this.logEvent('FILE_UPLOAD', target, {
                    files: fileInfo
                });
            }
        }, true);
    }

    /**
     * Track form submissions
     */
    trackFormSubmissions() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            
            // Get form data
            const formData = new FormData(form);
            const formFields = {};
            for (let [key, value] of formData.entries()) {
                formFields[key] = value;
            }
            
            this.logEvent('FORM_SUBMIT', form, {
                formFields,
                action: form.action,
                method: form.method
            });
        }, true);
    }

    /**
     * Track scroll events (throttled)
     */
    trackScrollEvents() {
        let scrollTimeout;
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
                lastScrollTop = scrollTop;
                
                const scrollPercentage = (scrollTop / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                
                this.logEvent('SCROLL', null, {
                    scrollTop,
                    scrollDirection,
                    scrollPercentage: Math.round(scrollPercentage) + '%'
                });
            }, 500); // Throttle to 500ms
        });
    }

    /**
     * Track hover events on important elements
     */
    trackHoverEvents() {
        // Track hover on buttons, links, and interactive elements
        const hoverSelectors = 'button, a, [onclick], .btn, input[type="button"], input[type="submit"]';
        
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches(hoverSelectors)) {
                this.logEvent('HOVER', e.target);
            }
        }, true);
    }

    /**
     * Track visibility changes (tab switching)
     */
    trackVisibilityChanges() {
        document.addEventListener('visibilitychange', () => {
            const visibility = document.hidden ? 'hidden' : 'visible';
            
            this.logEvent('VISIBILITY_CHANGE', null, {
                visibility,
                message: document.hidden ? 'User switched away from tab' : 'User returned to tab'
            });
        });
    }

    /**
     * Track page unload and show summary
     */
    trackPageUnload() {
        window.addEventListener('beforeunload', () => {
            this.printSummary();
        });
    }

    /**
     * Print summary of all events
     */
    printSummary() {
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444; font-size: 18px');
        console.log('%c📊 EVENT TRACKING SUMMARY', 'color: #ef4444; font-weight: bold; font-size: 20px');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444; font-size: 18px');
        
        console.log(`%c📈 Total Events Captured: ${this.events.length}`, 'color: #10b981; font-weight: bold; font-size: 16px');
        
        // Count events by type
        const eventCounts = {};
        this.events.forEach(event => {
            eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
        });
        
        console.log('%c📊 Events by Type:', 'color: #3b82f6; font-weight: bold; font-size: 14px');
        Object.keys(eventCounts).forEach(type => {
            console.log(`   └─ ${type}: ${eventCounts[type]}`);
        });
        
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444; font-size: 18px');
        
        // Export all events as JSON
        console.log('%c💾 Full Event Log:', 'color: #8b5cf6; font-weight: bold');
        console.table(this.events.map(e => ({
            Timestamp: e.timestamp,
            Type: e.type,
            Element: e.elementInfo ? e.elementInfo.elementType : 'N/A',
            Text: e.elementInfo ? e.elementInfo.text : 'N/A'
        })));
    }

    /**
     * Get all events (for external use)
     */
    getEvents() {
        return this.events;
    }

    /**
     * Export events as JSON
     */
    exportEventsAsJSON() {
        return JSON.stringify(this.events, null, 2);
    }

    /**
     * Download events as JSON file
     */
    downloadEvents() {
        const json = this.exportEventsAsJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `events_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('%c✅ Events downloaded as JSON file!', 'color: #10b981; font-weight: bold; font-size: 14px');
    }
}

// Initialize the event tracker immediately
const eventTracker = new EventTracker();

// Make it globally accessible for manual operations
window.eventTracker = eventTracker;

// Add helper functions to console
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-size: 16px');
console.log('%c🚀 EVENT TRACKER INITIALIZED', 'color: #667eea; font-weight: bold; font-size: 18px');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea; font-size: 16px');
console.log('%cAvailable Commands:', 'color: #10b981; font-weight: bold; font-size: 14px');
console.log('%c  • eventTracker.getEvents()', 'color: #3b82f6', '- Get all captured events');
console.log('%c  • eventTracker.printSummary()', 'color: #3b82f6', '- Show event summary');
console.log('%c  • eventTracker.downloadEvents()', 'color: #3b82f6', '- Download events as JSON');
console.log('%c  • eventTracker.exportEventsAsJSON()', 'color: #3b82f6', '- Get JSON string of events');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'color: #667eea; font-size: 16px');
console.log('%c👉 All events will be automatically logged below...', 'color: #f59e0b; font-style: italic; font-size: 14px');
console.log(' ');