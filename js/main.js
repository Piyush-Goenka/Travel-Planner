// Add to the top of each JS file
const DEBUG = true;

function log(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

// Use throughout the code
log('Event form initialized');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Save event details to local storage
    const eventForm = document.getElementById('event-form');
    
    function validateForm() {
        let isValid = true;
        const name = document.getElementById('event-name');
        const date = document.getElementById('event-date');
        const description = document.getElementById('event-description');

        // Clear previous errors
        clearErrors();

        // Validate name
        if (!name.value.trim()) {
            showError(name, 'Event name is required');
            isValid = false;
        }

        // Validate date
        if (!date.value) {
            showError(date, 'Event date is required');
            isValid = false;
        } else {
            const selectedDate = new Date(date.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                showError(date, 'Event date cannot be in the past');
                isValid = false;
            }
        }

        // Validate description
        if (!description.value.trim()) {
            showError(description, 'Event description is required');
            isValid = false;
        } else if (description.value.length < 10) {
            showError(description, 'Description must be at least 10 characters');
            isValid = false;
        }

        return isValid;
    }

    function showError(element, message) {
        const formGroup = element.closest('.form-group');
        formGroup.classList.add('error');
        
        // Create error message element if it doesn't exist
        let errorMessage = formGroup.querySelector('.error-message');
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            formGroup.appendChild(errorMessage);
        }
        errorMessage.textContent = message;
    }

    function clearErrors() {
        const errorGroups = eventForm.querySelectorAll('.form-group.error');
        errorGroups.forEach(group => {
            group.classList.remove('error');
            const errorMessage = group.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    }

    function showToast(message, type = 'success') {
        const toasterContainer = document.getElementById('toaster-container');
        
        const toast = document.createElement('div');
        toast.className = `toaster ${type}`;
        
        // Add icon based on type
        const icon = document.createElement('i');
        icon.className = `fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`;
        toast.appendChild(icon);
        
        const text = document.createElement('span');
        text.textContent = message;
        toast.appendChild(text);
        
        toasterContainer.appendChild(toast);

        // Remove the toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                toasterContainer.removeChild(toast);
            }, 300);
        }, 3000);
    }

    function saveEventDetails() {
        const eventData = {
            name: document.getElementById('event-name').value,
            date: document.getElementById('event-date').value,
            description: document.getElementById('event-description').value
        };
        localStorage.setItem('eventDetails', JSON.stringify(eventData));
        showToast('Event details saved successfully!');
    }

    // Load saved event details
    function loadEventDetails() {
        const savedEvent = localStorage.getItem('eventDetails');
        if (savedEvent) {
            const eventData = JSON.parse(savedEvent);
            document.getElementById('event-name').value = eventData.name;
            document.getElementById('event-date').value = eventData.date;
            document.getElementById('event-description').value = eventData.description;
        }
    }

    // Add submit button to form
    if (!eventForm.querySelector('button[type="submit"]')) {
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Save Event Details';
        eventForm.appendChild(submitButton);
    }

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm()) {
            saveEventDetails();
        }
    });
    
    eventForm.addEventListener('input', clearErrors);
    window.addEventListener('load', loadEventDetails);
}); 