class ScheduleManager {
    constructor() {
        this.timeline = document.getElementById('timeline');
        if (!this.timeline) {
            console.error('Timeline element not found');
        }
        
        this.syncButton = document.getElementById('sync-calendar');
        this.scheduleList = document.getElementById('schedule-list');
        this.addButton = document.getElementById('add-schedule-item');
        
        // Initialize event listeners
        this.syncButton?.addEventListener('click', () => this.syncWithGoogleCalendar());
        this.addButton?.addEventListener('click', () => this.addScheduleItem());
        
        // Load schedule immediately
        this.loadSchedule();
        
        // Initialize modals
        this.initializeModals();
    }

    initializeModals() {
        // Add Schedule Modal
        this.scheduleModal = document.getElementById('schedule-modal');
        this.scheduleForm = document.getElementById('schedule-form');
        
        // Edit Schedule Modal
        this.editModal = document.getElementById('edit-schedule-modal');
        this.editForm = document.getElementById('edit-schedule-form');

        // Close buttons
        document.querySelectorAll('.close-modal, .cancel-btn').forEach(button => {
            button.addEventListener('click', () => {
                this.scheduleModal.classList.remove('show');
                this.editModal.classList.remove('show');
            });
        });

        // Form submissions
        this.scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddScheduleItem();
        });

        this.editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditScheduleItem();
        });
    }

    loadSchedule() {
        const items = JSON.parse(localStorage.getItem('scheduleItems') || '[]');
        items.forEach(item => {
            const li = this.createScheduleElement(item);
            this.scheduleList.appendChild(li);
        });
        this.initializeDragAndDrop();
    }

    createDefaultSchedule() {
        const eventDate = document.getElementById('event-date').value;
        // If no date is set, use today's date
        const date = eventDate || new Date().toISOString().split('T')[0];

        const defaultSchedule = `
            <div class="timeline-item" draggable="true">
                <time>${date} 2:00 PM</time>
                <div class="timeline-content">
                    <div class="timeline-text">Setup and Decoration</div>
                    <button class="edit-item" onclick="scheduleManager.editItem(this)">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-item" onclick="scheduleManager.deleteItem(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="timeline-item" draggable="true">
                <time>${date} 3:00 PM</time>
                <div class="timeline-content">
                    <div class="timeline-text">Guest Arrival</div>
                    <button class="edit-item" onclick="scheduleManager.editItem(this)">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-item" onclick="scheduleManager.deleteItem(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="timeline-item" draggable="true">
                <time>${date} 6:00 PM</time>
                <div class="timeline-content">
                    <div class="timeline-text">Event Conclusion</div>
                    <button class="edit-item" onclick="scheduleManager.editItem(this)">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-item" onclick="scheduleManager.deleteItem(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        this.timeline.innerHTML = defaultSchedule;
        this.saveSchedule();
    }

    addScheduleItem() {
        const time = prompt('Enter time (e.g., 2:00 PM):');
        if (time) {
            const activity = prompt('Enter activity:');
            if (activity) {
                const scheduleItem = {
                    time,
                    activity,
                    id: Date.now()  // Unique ID for the item
                };
                
                const li = this.createScheduleElement(scheduleItem);
                this.scheduleList.appendChild(li);
                this.saveSchedule();
                showToast('Schedule item added successfully!');
            }
        }
    }

    createScheduleElement(item) {
        const li = document.createElement('li');
        li.className = 'schedule-item';
        li.dataset.id = item.id;
        
        li.innerHTML = `
            <span class="time">${item.time}</span>
            <span class="activity">${item.activity}</span>
            <button class="button danger" onclick="scheduleManager.deleteScheduleItem(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        return li;
    }

    deleteScheduleItem(id) {
        const item = document.querySelector(`.schedule-item[data-id="${id}"]`);
        if (item && confirm('Are you sure you want to delete this schedule item?')) {
            item.remove();
            this.saveSchedule();
            showToast('Schedule item deleted successfully!');
        }
    }

    handleAddScheduleItem() {
        const time = document.getElementById('schedule-time').value;
        const description = document.getElementById('schedule-description').value;
        const eventDate = document.getElementById('event-date').value;

        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.draggable = true;
        item.innerHTML = `
            <time>${eventDate} ${this.formatTime(time)}</time>
            <div class="timeline-content">
                <div class="timeline-text">${description}</div>
                <button class="edit-item" onclick="scheduleManager.editItem(this)">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-item" onclick="scheduleManager.deleteItem(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        this.timeline.appendChild(item);
        this.initializeDragAndDrop();
        this.saveSchedule();
        
        // Reset form and close modal
        this.scheduleForm.reset();
        this.scheduleModal.classList.remove('show');
    }

    editItem(button) {
        const item = button.closest('.timeline-item');
        const timeElement = item.querySelector('time');
        const textElement = item.querySelector('.timeline-text');

        // Set current values in edit form
        const currentTime = timeElement.textContent.split(' ').slice(-2).join(' ');
        document.getElementById('edit-schedule-time').value = this.parseTime(currentTime);
        document.getElementById('edit-schedule-description').value = textElement.textContent;

        // Store reference to current item
        this.currentEditItem = item;

        // Show edit modal
        this.editModal.classList.add('show');
    }

    handleEditScheduleItem() {
        const newTime = document.getElementById('edit-schedule-time').value;
        const newDescription = document.getElementById('edit-schedule-description').value;
        const eventDate = document.getElementById('event-date').value;

        const timeElement = this.currentEditItem.querySelector('time');
        const textElement = this.currentEditItem.querySelector('.timeline-text');

        timeElement.textContent = `${eventDate} ${this.formatTime(newTime)}`;
        textElement.textContent = newDescription;

        this.saveSchedule();
        this.editModal.classList.remove('show');
    }

    formatTime(time) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    }

    parseTime(timeStr) {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        
        if (period === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    deleteItem(button) {
        if (confirm('Are you sure you want to delete this item?')) {
            const item = button.closest('.timeline-item');
            item.remove();
            this.saveSchedule();
        }
    }

    initializeDragAndDrop() {
        const items = this.timeline.querySelectorAll('.timeline-item');
        items.forEach(item => {
            item.addEventListener('dragstart', this.handleDragStart.bind(this));
            item.addEventListener('dragover', this.handleDragOver.bind(this));
            item.addEventListener('drop', this.handleDrop.bind(this));
        });
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.innerHTML);
        e.target.classList.add('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
        const draggingItem = this.timeline.querySelector('.dragging');
        const siblings = [...this.timeline.querySelectorAll('.timeline-item:not(.dragging)')];
        
        const nextSibling = siblings.find(sibling => {
            const box = sibling.getBoundingClientRect();
            const offset = e.clientY - box.top - box.height / 2;
            return offset < 0;
        });
        
        if (nextSibling) {
            this.timeline.insertBefore(draggingItem, nextSibling);
        } else {
            this.timeline.appendChild(draggingItem);
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const draggingItem = this.timeline.querySelector('.dragging');
        draggingItem?.classList.remove('dragging');
        this.saveSchedule();
    }

    saveSchedule() {
        const items = Array.from(this.scheduleList.children).map(li => ({
            id: li.dataset.id,
            time: li.querySelector('.time').textContent,
            activity: li.querySelector('.activity').textContent
        }));
        
        localStorage.setItem('scheduleItems', JSON.stringify(items));
    }

    async syncWithGoogleCalendar() {
        try {
            // Initialize the tokenClient
            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: config.GOOGLE_CALENDAR_CLIENT_ID,
                scope: config.GOOGLE_API_SCOPE,
                prompt: 'consent',
                callback: async (tokenResponse) => {
                    if (tokenResponse.error !== undefined) {
                        throw new Error(tokenResponse.error);
                    }

                    const accessToken = tokenResponse.access_token;
                    await this.createCalendarEvent(accessToken);
                }
            });

            // Request user authorization
            if (gapi.client?.getToken() === null) {
                // Prompt the user to select a Google Account and ask for consent to share their data
                tokenClient.requestAccessToken({ prompt: 'consent' });
            } else {
                // Skip display of account chooser and consent dialog
                tokenClient.requestAccessToken({ prompt: '' });
            }
        } catch (error) {
            console.error('Authorization error:', error);
            alert('Failed to authorize with Google Calendar. Please try again.');
        }
    }

    async createCalendarEvent(accessToken) {
        try {
            const eventData = this.getEventData();
            if (!eventData) {
                toaster.error('Please fill in event details first');
                return;
            }

            // Get schedule items - check if timeline exists
            let scheduleItems = [];
            if (this.timeline) {
                scheduleItems = Array.from(this.timeline.querySelectorAll('.timeline-item')).map(item => ({
                    time: item.querySelector('time').textContent,
                    description: item.querySelector('.timeline-text').textContent
                }));
            } else {
                // Fallback to scheduleList if timeline doesn't exist
                scheduleItems = Array.from(this.scheduleList?.children || []).map(item => ({
                    time: item.querySelector('.time').textContent,
                    description: item.querySelector('.activity').textContent
                }));
            }

            // Create description with schedule
            const scheduleDescription = scheduleItems.map(item => 
                `${item.time}: ${item.description}`
            ).join('\n');

            const event = {
                'summary': eventData.name,
                'description': `${eventData.description}\n\nSchedule:\n${scheduleDescription}`,
                'start': {
                    'dateTime': `${eventData.date}T14:00:00`,
                    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                'end': {
                    'dateTime': `${eventData.date}T18:00:00`,
                    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                'location': this.getSelectedVenue()?.name || ''
            };

            const response = await fetch(
                'https://www.googleapis.com/calendar/v3/calendars/primary/events',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(event)
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to create calendar event');
            }

            const result = await response.json();
            console.log('Calendar event created:', result);
            toaster.success('Event successfully added to Google Calendar!');
        } catch (error) {
            console.error('Calendar API error:', error);
            toaster.error(`Failed to create calendar event: ${error.message}`);
        }
    }

    getEventData() {
        const savedEvent = localStorage.getItem('eventDetails');
        return savedEvent ? JSON.parse(savedEvent) : null;
    }

    getSelectedVenue() {
        const savedVenue = localStorage.getItem('selectedVenue');
        return savedVenue ? JSON.parse(savedVenue) : null;
    }
}

// Initialize the schedule manager immediately
const scheduleManager = new ScheduleManager(); 