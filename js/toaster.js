class ToasterManager {
    constructor() {
        this.container = document.getElementById('toaster-container');
    }

    show(message, type = 'info', duration = 3000) {
        const toaster = document.createElement('div');
        toaster.className = `toaster ${type}`;
        
        let icon;
        switch(type) {
            case 'success':
                icon = 'check-circle';
                break;
            case 'error':
                icon = 'exclamation-circle';
                break;
            default:
                icon = 'info-circle';
        }

        toaster.innerHTML = `
            <i class="fas fa-${icon} toaster-icon"></i>
            <div class="toaster-content">${message}</div>
            <i class="fas fa-times toaster-close"></i>
        `;

        this.container.appendChild(toaster);

        // Add click handler to close button
        const closeBtn = toaster.querySelector('.toaster-close');
        closeBtn.addEventListener('click', () => this.remove(toaster));

        // Auto remove after duration
        setTimeout(() => this.remove(toaster), duration);
    }

    remove(toaster) {
        if (!toaster.classList.contains('removing')) {
            toaster.classList.add('removing');
            toaster.addEventListener('animationend', () => {
                toaster.remove();
            });
        }
    }

    success(message, duration) {
        this.show(message, 'success', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }
}

const toaster = new ToasterManager(); 