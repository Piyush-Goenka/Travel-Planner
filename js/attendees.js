class AttendeeManager {
    constructor() {
        this.attendeeList = document.getElementById('attendee-list');
        this.addButton = document.getElementById('add-attendee');
        this.groupFilter = document.getElementById('group-filter');
        
        // Modal elements
        this.modalOverlay = document.getElementById('modal-overlay');
        this.closeModalBtn = document.querySelector('.close-modal');
        this.cancelBtn = document.getElementById('cancel-attendee');
        this.saveBtn = document.getElementById('save-attendee');
        this.nameInput = document.getElementById('attendee-name');
        this.groupSelect = document.getElementById('attendee-group');

        // Debug log
        console.log('Modal elements:', {
            overlay: this.modalOverlay,
            closeBtn: this.closeModalBtn,
            cancelBtn: this.cancelBtn,
            saveBtn: this.saveBtn,
            nameInput: this.nameInput,
            groupSelect: this.groupSelect
        });

        this.setupEventListeners();
        this.loadAttendees();
    }

    setupEventListeners() {
        this.addButton.addEventListener('click', () => this.addAttendee());
        this.closeModalBtn.addEventListener('click', () => this.hideModal());
        this.cancelBtn.addEventListener('click', () => this.hideModal());
        this.saveBtn.addEventListener('click', () => this.handleAddAttendee());
        this.groupFilter.addEventListener('change', () => this.filterAttendees());
        
        // Close modal when clicking outside
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.hideModal();
            }
        });

        // Handle Enter key in name input
        this.nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddAttendee();
            }
        });
    }

    showModal() {
        const modal = document.getElementById('modal-overlay');
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = document.getElementById('cancel-attendee');
        const saveBtn = document.getElementById('save-attendee');
        const nameInput = document.getElementById('attendee-name');

        // Clear previous input
        nameInput.value = '';

        // Show modal
        modal.style.display = 'flex';

        // Handle close button
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };

        // Handle cancel button
        cancelBtn.onclick = () => {
            modal.style.display = 'none';
        };

        // Handle save button
        saveBtn.onclick = () => {
            const name = nameInput.value.trim();
            const group = document.getElementById('attendee-group').value;
            
            if (name) {
                const attendee = {
                    id: Date.now().toString(),
                    name,
                    group
                };
                
                const li = this.createAttendeeElement(attendee);
                this.attendeeList.appendChild(li);
                this.saveAttendees();
                toaster.success(`${name} added to attendees`);
                modal.style.display = 'none';
            } else {
                toaster.error('Please enter an attendee name');
            }
        };

        // Close modal if clicking outside
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };

        // Focus on name input
        nameInput.focus();
    }

    hideModal() {
        this.modalOverlay.classList.remove('active');
        this.nameInput.value = '';
    }

    handleAddAttendee() {
        const name = this.nameInput.value.trim();
        const group = this.groupSelect.value;

        if (name) {
            const attendee = { name, group };
            const li = this.createAttendeeElement(attendee);
            this.attendeeList.appendChild(li);
            this.saveAttendees();
            this.hideModal();
            showToast(`${name} added to attendees`);
        } else {
            showToast('Please enter an attendee name', 'error');
        }
    }

    createAttendeeElement(attendee) {
        const li = document.createElement('li');
        li.dataset.id = attendee.id;
        li.dataset.group = attendee.group;
        li.className = 'attendee-item';
        li.innerHTML = `
            <span class="attendee-name">${attendee.name}</span>
            <span class="attendee-group">(${attendee.group})</span>
            <button class="remove-attendee" onclick="attendeeManager.removeAttendee(${attendee.id})">Remove</button>
        `;
        return li;
    }

    removeAttendee(id) {
        const element = this.attendeeList.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.remove();
            this.saveAttendees();
        }
    }

    filterAttendees() {
        const group = this.groupFilter.value;
        const attendees = this.attendeeList.getElementsByTagName('li');
        
        for (const attendee of attendees) {
            if (group === 'all' || attendee.dataset.group === group) {
                attendee.style.display = '';
            } else {
                attendee.style.display = 'none';
            }
        }
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

    loadAttendees() {
        const saved = localStorage.getItem('attendees');
        if (saved) {
            const attendees = JSON.parse(saved);
            attendees.forEach(attendee => {
                const li = this.createAttendeeElement(attendee);
                this.attendeeList.appendChild(li);
            });
        }
    }

    addAttendee() {
        // Show the modal instead of using prompt
        this.showModal();
    }
}

const attendeeManager = new AttendeeManager(); 