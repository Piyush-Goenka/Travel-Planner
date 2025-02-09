class AttendeeManager {
    constructor() {
        this.attendeeList = document.getElementById('attendee-list');
        this.addButton = document.getElementById('add-attendee');
        
        // Initialize toaster
        this.toaster = new ToasterManager();
        
        // Add event listeners
        if (this.addButton) {
            this.addButton.addEventListener('click', () => this.addAttendee());
        }
        
        // Load saved attendees
        this.loadAttendees();
    }

    loadAttendees() {
        const savedAttendees = localStorage.getItem('attendees');
        if (savedAttendees) {
            const attendees = JSON.parse(savedAttendees);
            attendees.forEach(attendee => {
                const li = this.createAttendeeElement(attendee);
                this.attendeeList.appendChild(li);
            });
        }
    }

    addAttendee() {
        const name = prompt('Enter attendee name:');
        if (name?.trim()) {
            const group = prompt('Enter group (family, friends, colleagues, other):', 'friends');
            const validGroups = ['family', 'friends', 'colleagues', 'other'];
            const validatedGroup = validGroups.includes(group?.toLowerCase()) ? group.toLowerCase() : 'other';
            
            const attendee = {
                id: Date.now().toString(),
                name: name.trim(),
                group: validatedGroup
            };
            
            const li = this.createAttendeeElement(attendee);
            this.attendeeList.appendChild(li);
            this.saveAttendees();
            this.toaster.success(`${name} added to attendees`);
        } else if (name !== null) { // Only show error if user didn't cancel
            this.toaster.error('Please enter a valid name');
        }
    }

    createAttendeeElement(attendee) {
        const li = document.createElement('li');
        li.className = 'attendee-item';
        li.dataset.id = attendee.id;
        li.dataset.group = attendee.group;

        li.innerHTML = `
            <div class="attendee-info">
                <span class="attendee-name">${this.escapeHtml(attendee.name)}</span>
                <span class="attendee-group">${this.escapeHtml(attendee.group)}</span>
            </div>
            <button class="delete-attendee" aria-label="Delete attendee">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add delete functionality
        const deleteBtn = li.querySelector('.delete-attendee');
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Are you sure you want to remove ${attendee.name}?`)) {
                li.remove();
                this.saveAttendees();
                this.toaster.success(`${attendee.name} removed from attendees`);
            }
        });

        return li;
    }

    saveAttendees() {
        const attendees = [];
        const elements = this.attendeeList.getElementsByTagName('li');
        
        for (const element of elements) {
            const nameSpan = element.querySelector('.attendee-name');
            attendees.push({
                id: element.dataset.id,
                name: nameSpan.textContent,
                group: element.dataset.group
            });
        }

        localStorage.setItem('attendees', JSON.stringify(attendees));
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize the AttendeeManager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AttendeeManager();
}); 