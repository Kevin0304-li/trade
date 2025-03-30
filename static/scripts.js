// Main JavaScript for Reverse Marketplace

document.addEventListener('DOMContentLoaded', function() {
    // Init all components
    initTooltips();
    initPasswordToggle();
    initPasswordStrengthMeter();
    initCharCounter();
    initUserTypeSelection();
    initFilterRequests();
    initAnimations();
    initNotifications();
});

// Initialize Bootstrap tooltips
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Toggle password visibility
function initPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.password-toggle');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = document.querySelector(this.getAttribute('data-target'));
            
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });
}

// Password strength meter
function initPasswordStrengthMeter() {
    const passwordInput = document.querySelector('#password');
    const strengthMeter = document.querySelector('#password-strength');
    
    if (passwordInput && strengthMeter) {
        passwordInput.addEventListener('input', function() {
            const val = passwordInput.value;
            const result = calculatePasswordStrength(val);
            
            // Update strength meter
            strengthMeter.style.width = result.score * 25 + '%';
            
            // Update color based on strength
            if (result.score < 2) {
                strengthMeter.className = 'password-strength-meter bg-danger';
            } else if (result.score < 3) {
                strengthMeter.className = 'password-strength-meter bg-warning';
            } else {
                strengthMeter.className = 'password-strength-meter bg-success';
            }
            
            // Update feedback text
            const feedbackElement = document.querySelector('#password-feedback');
            if (feedbackElement) {
                feedbackElement.textContent = result.message;
            }
        });
    }
}

// Calculate password strength
function calculatePasswordStrength(password) {
    // Simple password strength calculator
    let score = 0;
    let message = '';
    
    if (!password) {
        message = 'No password provided';
    } else {
        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        // Character type checks
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        // Set message based on score
        if (score <= 2) {
            message = 'Weak';
        } else if (score <= 4) {
            message = 'Moderate';
        } else {
            message = 'Strong';
        }
    }
    
    return {
        score: Math.min(4, score),
        message: message
    };
}

// Character counter for textareas
function initCharCounter() {
    const textareas = document.querySelectorAll('textarea[data-char-counter]');
    
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength') || 500;
        const counterId = textarea.getAttribute('data-char-counter');
        const counter = document.getElementById(counterId);
        
        if (counter) {
            // Initial count
            updateCharCount(textarea, counter, maxLength);
            
            // Update on input
            textarea.addEventListener('input', function() {
                updateCharCount(textarea, counter, maxLength);
            });
        }
    });
}

// Update character count
function updateCharCount(textarea, counter, maxLength) {
    const remaining = maxLength - textarea.value.length;
    counter.textContent = remaining;
    
    // Change color when getting low
    if (remaining < 20) {
        counter.classList.add('text-danger');
    } else {
        counter.classList.remove('text-danger');
    }
}

// Enhanced user type selection
function initUserTypeSelection() {
    const userTypeCards = document.querySelectorAll('.user-type-card');
    
    userTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            // Find the radio input inside this card
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                
                // Remove active class from all cards
                userTypeCards.forEach(c => c.classList.remove('border-primary'));
                
                // Add active class to clicked card
                this.classList.add('border-primary');
                
                // Trigger change event
                const event = new Event('change');
                radio.dispatchEvent(event);
            }
        });
    });
}

// Filter requests on dashboard
function initFilterRequests() {
    const filterInput = document.querySelector('#filter-requests');
    const sortSelect = document.querySelector('#sort-requests');
    
    if (filterInput) {
        filterInput.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            const requestCards = document.querySelectorAll('.request-card');
            
            requestCards.forEach(card => {
                const title = card.querySelector('.card-title').textContent.toLowerCase();
                const desc = card.querySelector('.card-text').textContent.toLowerCase();
                
                if (title.includes(value) || desc.includes(value)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const value = this.value;
            const requestsContainer = document.querySelector('#requests-container');
            const requestCards = Array.from(document.querySelectorAll('.request-card'));
            
            // Sort the cards
            requestCards.sort((a, b) => {
                if (value === 'date-newest') {
                    return new Date(b.dataset.date) - new Date(a.dataset.date);
                } else if (value === 'date-oldest') {
                    return new Date(a.dataset.date) - new Date(b.dataset.date);
                } else if (value === 'budget-highest') {
                    return parseFloat(b.dataset.budget) - parseFloat(a.dataset.budget);
                } else if (value === 'budget-lowest') {
                    return parseFloat(a.dataset.budget) - parseFloat(b.dataset.budget);
                }
                return 0;
            });
            
            // Re-append in new order
            requestCards.forEach(card => {
                requestsContainer.appendChild(card);
            });
        });
    }
}

// Animate elements on scroll
function initAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    // Check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }
    
    // Check elements on scroll
    function checkAnimations() {
        animatedElements.forEach(element => {
            if (isInViewport(element)) {
                element.classList.add('animated');
            }
        });
    }
    
    // Initial check
    checkAnimations();
    
    // Check on scroll
    window.addEventListener('scroll', checkAnimations);
}

// Interactive notification system
function initNotifications() {
    // Mock function to simulate new notifications
    function showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        
        if (!container) {
            const newContainer = document.createElement('div');
            newContainer.id = 'notification-container';
            newContainer.className = 'notification-container';
            document.body.appendChild(newContainer);
        }
        
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification notification-${type}`;
        notificationElement.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            </div>
            <div class="notification-content">${message}</div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to container
        const container2 = document.getElementById('notification-container');
        container2.appendChild(notificationElement);
        
        // Animate in
        setTimeout(() => {
            notificationElement.classList.add('show');
        }, 10);
        
        // Auto remove after delay
        setTimeout(() => {
            notificationElement.classList.remove('show');
            setTimeout(() => {
                notificationElement.remove();
            }, 300);
        }, 5000);
        
        // Close button
        const closeButton = notificationElement.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notificationElement.classList.remove('show');
            setTimeout(() => {
                notificationElement.remove();
            }, 300);
        });
    }
    
    // Make available globally
    window.showNotification = showNotification;
    
    // Example usage on form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                // Show loading state
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                submitButton.disabled = true;
                
                // Simulate delay (remove this in production)
                setTimeout(() => {
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                }, 1500);
            }
        });
    });
    
    // Show welcome notification on homepage
    if (document.querySelector('.hero-section')) {
        setTimeout(() => {
            showNotification('Welcome to Reverse Marketplace! Post your first request or browse available offers.', 'info');
        }, 1000);
    }
}

// Apply budget suggestions based on request type
function suggestBudget() {
    const titleInput = document.getElementById('title');
    const budgetInput = document.getElementById('budget');
    const suggestionElement = document.getElementById('budget-suggestion');
    
    if (titleInput && budgetInput && suggestionElement) {
        titleInput.addEventListener('input', function() {
            const title = this.value.toLowerCase();
            let suggestion = '';
            
            // Suggest budget based on keywords
            if (title.includes('logo') || title.includes('design')) {
                suggestion = 'Suggested budget for design work: $30-100';
            } else if (title.includes('website') || title.includes('web')) {
                suggestion = 'Suggested budget for websites: $100-500';
            } else if (title.includes('writing') || title.includes('article')) {
                suggestion = 'Suggested budget for writing: $20-50';
            } else if (title.includes('tutoring') || title.includes('teaching')) {
                suggestion = 'Suggested budget for tutoring: $15-30/hour';
            }
            
            suggestionElement.textContent = suggestion;
        });
    }
} 