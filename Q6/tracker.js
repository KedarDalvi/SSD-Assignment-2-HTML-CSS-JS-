
// Class to manage event tracking
class EventTracker {
    constructor() {
        this.events = [];
        this.pageViewLogged = false;
        this.init();
    }

    //Initialize all event listeners
    init() {
        this.logPageView();
        
        this.trackClicks();
        
        this.trackInputChanges();
        
        this.trackFormSubmissions();
        
        this.trackScrollEvents();
        
        this.trackHoverEvents();
        
        this.trackVisibilityChanges();
        
        this.trackPageUnload();
    }

    //Generate timestamp in readable format
    getTimestamp() {
        const now = new Date();
        return now.toISOString();
    }

    //Get detailed element information
    getElementInfo(element) {
        const tagName = element.tagName.toLowerCase();
        
        const id = element.id || 'no-id';
        const className = element.className || 'no-class';
        
        const text = element.textContent.trim().substring(0, 50) || 'no-text';
        
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
        
        const cssClasses = className ? className.split(' ').filter(c => c) : [];
        
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

    //Log an event to console and storage
    logEvent(eventType, element, additionalData = {}) {
        const event = {
            timestamp: this.getTimestamp(),
            type: eventType,
            elementInfo: element ? this.getElementInfo(element) : null,
            ...additionalData
        };
        
        this.events.push(event);
        
        this.printEvent(event);
    }

    //Print event to console with beautiful formatting
    printEvent(event) {
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea');
        console.log('%c🎯 EVENT CAPTURED', 'color: #667eea; font-weight: bold; font-size: 14px');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea');
        
        console.log('%c⏰ Timestamp:', 'color: #f59e0b; font-weight: bold', event.timestamp);
        
        console.log('%c📌 Event Type:', 'color: #10b981; font-weight: bold', event.type);
        
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
            
            console.log('%c🎨 CSS Properties:', 'color: #8b5cf6; font-weight: bold');
            console.log('   └─ Background:', event.elementInfo.cssProperties.backgroundColor);
            console.log('   └─ Color:', event.elementInfo.cssProperties.color);
            console.log('   └─ Font Size:', event.elementInfo.cssProperties.fontSize);
            console.log('   └─ Display:', event.elementInfo.cssProperties.display);
        }
        
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

    //Log page view event
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

    //Track all click events
    trackClicks() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            
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
        }, true); 
    }

    //rack input changes
    trackInputChanges() {
        document.addEventListener('change', (e) => {
            const target = e.target;
            if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
                this.logEvent('INPUT_CHANGE', target, {
                    newValue: target.value,
                    inputType: target.type
                });
            }
        }, true);
        
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

    //Track form submissions
    trackFormSubmissions() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            
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

    //Track scroll events (throttled)
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
            }, 500); 
        });
    }

    //Track hover events on important elements
    trackHoverEvents() {
        const hoverSelectors = 'button, a, [onclick], .btn, input[type="button"], input[type="submit"]';
        
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches(hoverSelectors)) {
                this.logEvent('HOVER', e.target);
            }
        }, true);
    }

    //Track visibility changes (tab switching)
    trackVisibilityChanges() {
        document.addEventListener('visibilitychange', () => {
            const visibility = document.hidden ? 'hidden' : 'visible';
            
            this.logEvent('VISIBILITY_CHANGE', null, {
                visibility,
                message: document.hidden ? 'User switched away from tab' : 'User returned to tab'
            });
        });
    }

    //Track page unload and show summary
    trackPageUnload() {
        window.addEventListener('beforeunload', () => {
            this.printSummary();
        });
    }

    //Print summary of all events
    printSummary() {
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444; font-size: 18px');
        console.log('%c📊 EVENT TRACKING SUMMARY', 'color: #ef4444; font-weight: bold; font-size: 20px');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444; font-size: 18px');
        
        console.log(`%c📈 Total Events Captured: ${this.events.length}`, 'color: #10b981; font-weight: bold; font-size: 16px');
        
        const eventCounts = {};
        this.events.forEach(event => {
            eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
        });
        
        console.log('%c📊 Events by Type:', 'color: #3b82f6; font-weight: bold; font-size: 14px');
        Object.keys(eventCounts).forEach(type => {
            console.log(`   └─ ${type}: ${eventCounts[type]}`);
        });
        
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444; font-size: 18px');
        
        console.log('%c💾 Full Event Log:', 'color: #8b5cf6; font-weight: bold');
        console.table(this.events.map(e => ({
            Timestamp: e.timestamp,
            Type: e.type,
            Element: e.elementInfo ? e.elementInfo.elementType : 'N/A',
            Text: e.elementInfo ? e.elementInfo.text : 'N/A'
        })));
    }

    //Get all events (for external use)
    getEvents() {
        return this.events;
    }

    //Export events as JSON
    exportEventsAsJSON() {
        return JSON.stringify(this.events, null, 2);
    }

    //Download events as JSON file
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

const eventTracker = new EventTracker();

window.eventTracker = eventTracker;

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