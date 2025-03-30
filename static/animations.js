/**
 * Enhanced Animations and Interactivity for Reverse Marketplace
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all animations and interactive features
    initAnimations();
    initHoverEffects();
    initScrollAnimations();
    initFormInteractions();
    initNotificationsSystem();
    initEnhancedButtons();
    initPageTransitions();
    initInteractiveCards();
    initParticleBackground();
    initTextGlowEffects();

    // Show a welcome notification
    setTimeout(() => {
        showNotification('Welcome to Reverse Marketplace!', 'info', 5000);
    }, 1000);

    // Testimonial flip card functionality
    const flipTriggers = document.querySelectorAll('.flip-trigger');
    
    if (flipTriggers.length > 0) {
        flipTriggers.forEach(trigger => {
            trigger.addEventListener('click', function() {
                const card = this.closest('.flip-card');
                card.classList.toggle('flipped');
            });
        });
    }
    
    // Initialize tilt effect for cards with tilt-effect class
    const tiltCards = document.querySelectorAll('.tilt-effect');
    if (tiltCards.length > 0) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const cardRect = card.getBoundingClientRect();
                const cardCenterX = cardRect.left + cardRect.width / 2;
                const cardCenterY = cardRect.top + cardRect.height / 2;
                const mouseX = e.clientX - cardCenterX;
                const mouseY = e.clientY - cardCenterY;
                
                // Tilt the card based on mouse position
                const tiltX = -(mouseY / cardRect.height * 10);
                const tiltY = (mouseX / cardRect.width * 10);
                
                card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
            });
            
            card.addEventListener('mouseleave', function() {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
                card.style.transition = 'transform 0.5s ease';
            });
        });
    }
});

/**
 * Initialize basic animations for page elements
 */
function initAnimations() {
    // Fade in all elements with fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;
    });

    // Slide up animations with delay based on index
    const slideElements = document.querySelectorAll('.animate-slide-up');
    slideElements.forEach((el, index) => {
        if (!el.hasAttribute('style') || !el.getAttribute('style').includes('animation-delay')) {
            el.style.animationDelay = `${index * 0.1}s`;
        }
        el.classList.add('animated');
    });

    // Button animations
    document.querySelectorAll('.btn').forEach(btn => {
        if (!btn.classList.contains('no-animation')) {
            btn.classList.add('btn-animated');
        }
    });

    // Card animations
    document.querySelectorAll('.card').forEach(card => {
        if (!card.classList.contains('no-animation')) {
            card.classList.add('card-animated');
        }
    });
}

/**
 * Add hover effects to various elements
 */
function initHoverEffects() {
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mousedown', function(e) {
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            ripple.style.top = `${y}px`;
            ripple.style.left = `${x}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add hover effects to cards
    document.querySelectorAll('.card:not(.user-type-card)').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('card-hover');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('card-hover');
        });
    });
    
    // Add hover effect to form inputs
    document.querySelectorAll('input, textarea, select').forEach(input => {
        const formGroup = input.closest('.mb-4, .form-group');
        if (formGroup) {
            input.addEventListener('focus', () => {
                formGroup.classList.add('input-focus');
            });
            
            input.addEventListener('blur', () => {
                formGroup.classList.remove('input-focus');
            });
        }
    });
}

/**
 * Setup scroll-triggered animations
 */
function initScrollAnimations() {
    // Setup Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe elements with animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
    
    // Add parallax effect to hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY;
            heroSection.style.backgroundPositionY = `${scrollPos * 0.5}px`;
            
            // Fade out hero content on scroll
            const heroContent = heroSection.querySelector('.container');
            if (heroContent) {
                const opacity = 1 - (scrollPos / 500);
                heroContent.style.opacity = opacity > 0 ? opacity : 0;
                heroContent.style.transform = `translateY(${scrollPos * 0.2}px)`;
            }
        });
    }
}

/**
 * Add animations and interactivity to forms
 */
function initFormInteractions() {
    // Form submission animations
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            // Only add animation if form doesn't have novalidate attribute
            if (!this.hasAttribute('novalidate')) {
                const submitButton = this.querySelector('button[type="submit"]');
                if (submitButton && !submitButton.classList.contains('loading')) {
                    // Don't add loading state twice
                    submitButton.classList.add('loading');
                    submitButton.setAttribute('data-original-text', submitButton.innerHTML);
                    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Loading...';
                }
            }
        });
    });
    
    // Add typing animation to textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
    
    // Add animated labels that move up when input is focused or has content
    document.querySelectorAll('.form-floating').forEach(floatingLabel => {
        const input = floatingLabel.querySelector('input, textarea, select');
        
        // Set initial state
        if (input.value) {
            floatingLabel.classList.add('has-value');
        }
        
        input.addEventListener('focus', () => {
            floatingLabel.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            floatingLabel.classList.remove('focused');
            if (input.value) {
                floatingLabel.classList.add('has-value');
            } else {
                floatingLabel.classList.remove('has-value');
            }
        });
        
        input.addEventListener('input', () => {
            if (input.value) {
                floatingLabel.classList.add('has-value');
            } else {
                floatingLabel.classList.remove('has-value');
            }
        });
    });
}

/**
 * Enhanced notification system
 */
function initNotificationsSystem() {
    // Create notifications container if it doesn't exist
    if (!document.getElementById('notifications-container')) {
        const container = document.createElement('div');
        container.id = 'notifications-container';
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds before auto-closing
 */
function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notifications-container');
    if (!container) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="notification-content">${message}</div>
        <button type="button" class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Setup close button
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Auto close after duration
    if (duration) {
        setTimeout(() => {
            closeNotification(notification);
        }, duration);
    }
    
    return notification;
}

/**
 * Close a notification with animation
 * @param {HTMLElement} notification - The notification element to close
 */
function closeNotification(notification) {
    notification.classList.remove('show');
    notification.classList.add('hiding');
    
    // Remove after animation completes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

/**
 * Add enhanced button effects
 */
function initEnhancedButtons() {
    // Floating action button
    const createFab = () => {
        if (document.querySelector('.floating-action-btn')) return;
        
        // Only add FAB on certain pages like dashboard
        if (window.location.pathname.includes('dashboard') || window.location.pathname === '/') {
            const fab = document.createElement('button');
            fab.className = 'floating-action-btn';
            fab.innerHTML = '<i class="fas fa-plus"></i>';
            
            fab.addEventListener('click', function() {
                // Show action menu
                const hasMenu = this.classList.contains('active');
                
                if (!hasMenu) {
                    this.classList.add('active');
                    createFabMenu(fab);
                } else {
                    this.classList.remove('active');
                    const menu = document.querySelector('.fab-menu');
                    if (menu) menu.remove();
                }
            });
            
            document.body.appendChild(fab);
        }
    };
    
    // Create FAB menu
    const createFabMenu = (fab) => {
        const menu = document.createElement('div');
        menu.className = 'fab-menu';
        
        const actions = [];
        
        // Determine which actions to show
        if (window.location.pathname.includes('dashboard')) {
            actions.push({
                icon: 'fa-plus-circle',
                text: 'New Request',
                url: '/post-request'
            });
            actions.push({
                icon: 'fa-bell',
                text: 'Notifications',
                action: () => showNotification('Notification feature coming soon!', 'info')
            });
        } else {
            actions.push({
                icon: 'fa-user-plus',
                text: 'Register',
                url: '/register'
            });
            actions.push({
                icon: 'fa-sign-in-alt',
                text: 'Login',
                url: '/login'
            });
        }
        
        // Create menu items
        actions.forEach((action, index) => {
            const item = document.createElement('a');
            item.className = 'fab-item';
            item.innerHTML = `
                <span class="fab-item-icon"><i class="fas ${action.icon}"></i></span>
                <span class="fab-item-text">${action.text}</span>
            `;
            
            item.style.transitionDelay = `${index * 0.05}s`;
            
            if (action.url) {
                item.href = action.url;
            } else if (action.action) {
                item.addEventListener('click', action.action);
            }
            
            menu.appendChild(item);
        });
        
        document.body.appendChild(menu);
        
        // Animate menu items in
        setTimeout(() => {
            document.querySelectorAll('.fab-item').forEach(item => {
                item.classList.add('show');
            });
        }, 50);
    };
    
    createFab();
}

/**
 * Add page transition effects
 */
function initPageTransitions() {
    // Add transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);
    
    // Add transition effect to all internal links
    document.querySelectorAll('a').forEach(link => {
        // Only apply to internal links that aren't # links
        if (link.hostname === window.location.hostname && 
            !link.href.includes('#') &&
            !link.classList.contains('no-transition')) {
            
            link.addEventListener('click', function(e) {
                const target = this.href;
                if (target) {
                    e.preventDefault();
                    
                    // Animate overlay
                    overlay.classList.add('show');
                    
                    // Navigate after animation
                    setTimeout(() => {
                        window.location.href = target;
                    }, 300);
                }
            });
        }
    });
    
    // On page load, hide overlay
    window.addEventListener('load', () => {
        overlay.classList.add('hide');
        setTimeout(() => {
            overlay.classList.remove('show', 'hide');
        }, 300);
    });
}

/**
 * Add interactive features to cards
 */
function initInteractiveCards() {
    // Add hover tilt effect to cards
    document.querySelectorAll('.card.tilt-effect').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const angleX = (y - centerY) / 20;
            const angleY = (centerX - x) / 20;
            
            this.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });
    
    // Add interactive highlight on card elements
    document.querySelectorAll('.card .interactive-highlight').forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.classList.add('highlight-active');
        });
        
        element.addEventListener('mouseleave', function() {
            this.classList.remove('highlight-active');
        });
    });
    
    // Add card flipping functionality
    document.querySelectorAll('.card.flip-card').forEach(card => {
        const flipButton = card.querySelector('.flip-trigger');
        
        if (flipButton) {
            flipButton.addEventListener('click', function(e) {
                e.preventDefault();
                card.classList.toggle('flipped');
            });
        }
    });
}

/**
 * Add particle background to hero section for enhanced visual appeal
 */
function initParticleBackground() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    // Create particle container
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles-container';
    heroSection.appendChild(particleContainer);
    
    // Create particles
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        createParticle(particleContainer);
    }
}

/**
 * Create a single animated particle
 * @param {HTMLElement} container - The container to add the particle to
 */
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random position, size and animation duration
    const size = Math.floor(Math.random() * 10) + 5;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.opacity = Math.random() * 0.5 + 0.3;
    
    container.appendChild(particle);
}

/**
 * Add glow effects to important text elements
 */
function initTextGlowEffects() {
    // Add glow effect to headings
    document.querySelectorAll('h1, h2, .card-title').forEach(heading => {
        if (!heading.closest('.hero-section') && !heading.classList.contains('no-glow')) {
            heading.classList.add('text-glow-on-hover');
        }
    });
    
    // Add spotlight effect to hero heading
    const heroHeading = document.querySelector('.hero-section h1');
    if (heroHeading) {
        heroHeading.classList.add('spotlight-effect');
        
        document.addEventListener('mousemove', function(e) {
            const spotlight = document.querySelector('.hero-section');
            if (!spotlight) return;
            
            const rect = spotlight.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            heroHeading.style.setProperty('--spotlight-x', `${x}px`);
            heroHeading.style.setProperty('--spotlight-y', `${y}px`);
        });
    }
}

// Add the CSS for animations to the page
const style = document.createElement('style');
style.textContent = `
    /* Base animation classes */
    .btn-animated {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        overflow: hidden;
        position: relative;
    }
    
    .btn-animated:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .btn-animated:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .card-animated {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .card-hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
    
    /* Ripple effect */
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        width: 100px;
        height: 100px;
        margin-top: -50px;
        margin-left: -50px;
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 0.5;
        }
        100% {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    /* Fade in animation */
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    /* Slide up animation */
    .animate-slide-up {
        opacity: 0;
        transform: translateY(20px);
    }
    
    .animate-slide-up.animated {
        animation: slideUp 0.5s ease forwards;
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Scroll animations */
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-on-scroll.in-view {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Form focus effect */
    .input-focus {
        animation: focusPulse 0.3s ease;
    }
    
    @keyframes focusPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.01); }
        100% { transform: scale(1); }
    }
    
    /* Form loading animation */
    .loading {
        position: relative;
        pointer-events: none;
    }
    
    /* Floating labels animation */
    .form-floating {
        position: relative;
    }
    
    .form-floating label {
        position: absolute;
        top: 0;
        left: 0;
        padding: 1rem;
        transition: all 0.3s ease;
        transform-origin: 0 0;
        pointer-events: none;
    }
    
    .form-floating.focused label,
    .form-floating.has-value label {
        transform: translateY(-50%) scale(0.85);
        background-color: white;
        padding: 0 0.5rem;
        top: 0;
    }
    
    /* Notifications */
    .notifications-container {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 300px;
        z-index: 9999;
    }
    
    .notification {
        margin-bottom: 10px;
        padding: 12px;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: start;
        background-color: white;
        transform: translateX(110%);
        transition: transform 0.3s ease;
        position: relative;
        border-left: 4px solid #ccc;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.hiding {
        transform: translateX(110%);
    }
    
    .notification-icon {
        margin-right: 12px;
        font-size: 1.2em;
    }
    
    .notification-content {
        flex-grow: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        font-size: 0.9em;
        opacity: 0.5;
        transition: opacity 0.3s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    .notification-success {
        border-left-color: #28a745;
    }
    
    .notification-error {
        border-left-color: #dc3545;
    }
    
    .notification-warning {
        border-left-color: #ffc107;
    }
    
    .notification-info {
        border-left-color: #17a2b8;
    }
    
    .notification-success .notification-icon {
        color: #28a745;
    }
    
    .notification-error .notification-icon {
        color: #dc3545;
    }
    
    .notification-warning .notification-icon {
        color: #ffc107;
    }
    
    .notification-info .notification-icon {
        color: #17a2b8;
    }
    
    /* Floating Action Button */
    .floating-action-btn {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background-color: var(--primary);
        color: white;
        border: none;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        z-index: 1000;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        cursor: pointer;
    }
    
    .floating-action-btn:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    }
    
    .floating-action-btn.active {
        transform: rotate(45deg);
    }
    
    .floating-action-btn.active:hover {
        transform: rotate(45deg);
    }
    
    .fab-menu {
        position: fixed;
        bottom: 90px;
        right: 30px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        z-index: 999;
    }
    
    .fab-item {
        display: flex;
        align-items: center;
        background-color: white;
        border-radius: 30px;
        padding: 8px 16px;
        margin-bottom: 10px;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
        text-decoration: none;
        color: var(--dark);
        transition: transform 0.3s ease, opacity 0.3s ease;
        opacity: 0;
        transform: translateX(20px);
    }
    
    .fab-item.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .fab-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
    }
    
    .fab-item-icon {
        margin-right: 8px;
        color: var(--primary);
    }
    
    /* Page transition */
    .page-transition-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--primary);
        z-index: 9999;
        pointer-events: none;
        opacity: 0;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
    }
    
    .page-transition-overlay.show {
        opacity: 1;
        transform: scaleX(1);
    }
    
    .page-transition-overlay.hide {
        opacity: 0;
        transform: scaleX(1);
        transform-origin: right;
    }
    
    /* Card interactive styles */
    .card.tilt-effect {
        transform-style: preserve-3d;
        transition: transform 0.3s ease;
    }
    
    .interactive-highlight {
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .interactive-highlight.highlight-active {
        background-color: rgba(0, 123, 255, 0.1);
        transform: scale(1.02);
    }
    
    .flip-card {
        perspective: 1000px;
        height: 300px;
    }
    
    .flip-card .card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        transition: transform 0.8s;
        transform-style: preserve-3d;
    }
    
    .flip-card.flipped .card-inner {
        transform: rotateY(180deg);
    }
    
    .flip-card .card-front,
    .flip-card .card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
    }
    
    .flip-card .card-back {
        transform: rotateY(180deg);
    }
`;

document.head.appendChild(style);

// Add additional CSS for new animations
const additionalStyle = document.createElement('style');
additionalStyle.textContent = `
    /* Particle animation */
    .particles-container {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 1;
        overflow: hidden;
        pointer-events: none;
    }
    
    .particle {
        position: absolute;
        background-color: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        animation: floatParticle linear infinite;
    }
    
    @keyframes floatParticle {
        0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.3;
        }
        25% {
            transform: translateY(-20vh) translateX(10vw) rotate(90deg);
            opacity: 0.6;
        }
        50% {
            transform: translateY(-40vh) translateX(20vw) rotate(180deg);
            opacity: 0.9;
        }
        75% {
            transform: translateY(-60vh) translateX(10vw) rotate(270deg);
            opacity: 0.6;
        }
        100% {
            transform: translateY(-80vh) translateX(0) rotate(360deg);
            opacity: 0.3;
        }
    }
    
    /* Text glow effect */
    .text-glow-on-hover {
        transition: text-shadow 0.3s ease, color 0.3s ease;
    }
    
    .text-glow-on-hover:hover {
        text-shadow: 0 0 8px rgba(var(--bs-primary-rgb), 0.5);
        color: var(--bs-primary);
    }
    
    /* Spotlight effect for hero heading */
    .spotlight-effect {
        --spotlight-x: 50%;
        --spotlight-y: 0%;
        position: relative;
        background-image: radial-gradient(
            circle at var(--spotlight-x) var(--spotlight-y),
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.6) 10%,
            rgba(255, 255, 255, 0) 40%
        );
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
        z-index: 5;
    }
    
    /* Enhanced button hover effects */
    .btn {
        transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    
    .btn:hover {
        transform: translateY(-3px) scale(1.03);
    }
    
    .btn:active {
        transform: translateY(1px) scale(0.98);
    }
    
    /* Enhanced card animations */
    .card {
        transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    
    .card:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 30px rgba(0, 0, 0, 0.1) !important;
    }
    
    /* Animate-on-load class for initial animations */
    .animate-on-load {
        animation: fadeInUp 1s ease forwards;
    }
    
    /* High visibility badge animation */
    .badge {
        position: relative;
        overflow: hidden;
    }
    
    .badge:after {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
        );
        transform: rotate(30deg);
        animation: shineEffect 3s infinite;
    }
    
    @keyframes shineEffect {
        0% { transform: translateX(-100%) rotate(30deg); }
        100% { transform: translateX(100%) rotate(30deg); }
    }
`;

document.head.appendChild(additionalStyle); 