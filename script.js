/* global deleteEvent */
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000';

    // Animate hero section on load
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            heroContent.style.transition = 'all 1s ease';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 100);
    }

    // Handle navigation interactions
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Handle notification and profile buttons
    const actionButtons = document.querySelectorAll('.nav-actions button');
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 100);
        });
    });

    // Form handling
    const eventForm = document.getElementById('eventForm');
    const message = document.getElementById('message');
    const scheduleList = document.getElementById('scheduleList');

    if (!eventForm || !message || !scheduleList) {
        console.error('Required DOM elements not found');
        return;
    }

    // Load schedule for current date on page load
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.value = today;
        loadSchedule(today);
    }

    // Handle date change
    dateInput?.addEventListener('change', function() {
        loadSchedule(this.value);
    });

    // Handle form submission
    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(eventForm);
            const eventData = {
                name: formData.get('title'),
                date: formData.get('date'),
                time: `${formData.get('startTime')} - ${formData.get('endTime')}`,
                venue: formData.get('venue')
            };

            // Send data to backend
            const response = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Event scheduled successfully!', 'success');
                eventForm.reset();
                if (dateInput) {
                    dateInput.value = eventData.date;
                }
                loadSchedule(eventData.date);
            } else if (response.status === 409) {
                // Handle overlap case
                const alternativesHtml = data.alternatives.map(alt => 
                    `<button class="alternative-slot" data-start="${alt.start}" data-end="${alt.end}">
                        ${alt.start} - ${alt.end}
                    </button>`
                ).join('');

                const messageHtml = `
                    <div class="overlap-message">
                        <p>This time slot overlaps with an existing event in the same venue.</p>
                        <p>Available alternatives:</p>
                        <div class="alternative-slots">
                            ${alternativesHtml}
                        </div>
                    </div>
                `;

                showMessage(messageHtml, 'warning');

                // Add click handlers for alternative slots
                document.querySelectorAll('.alternative-slot').forEach(button => {
                    button.addEventListener('click', () => {
                        const startTimeInput = document.getElementById('startTime');
                        const endTimeInput = document.getElementById('endTime');
                        if (startTimeInput && endTimeInput) {
                            startTimeInput.value = button.dataset.start;
                            endTimeInput.value = button.dataset.end;
                        }
                        showMessage('Time updated! Please try scheduling again.', 'info');
                    });
                });
            } else {
                showMessage(data.message || 'Failed to schedule event', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error connecting to server. Make sure the backend is running.', 'error');
        }
    });

    // Helper function to format date
    function formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    async function loadSchedule(date) {
        try {
            const response = await fetch(`${API_URL}/events`);
            const schedule = await response.json();

            if (!response.ok) {
                throw new Error(schedule.message || 'Failed to load schedule');
            }

            if (!scheduleList) return;
            scheduleList.innerHTML = '';

            if (Array.isArray(schedule)) {
                // Filter events for the selected date
                const dateEvents = schedule.filter(event => event.date === date);

                if (dateEvents.length === 0) {
                    scheduleList.innerHTML = `
                        <div class="date-header">
                            <h2>${formatDate(date)}</h2>
                        </div>
                        <p class="no-events">No events scheduled for this date</p>`;
                    return;
                }

                // Add date header
                const dateHeader = document.createElement('div');
                dateHeader.className = 'date-header';
                dateHeader.innerHTML = `<h2>${formatDate(date)}</h2>`;
                scheduleList.appendChild(dateHeader);

                // Group events by venue
                const eventsByVenue = {};
                dateEvents.forEach(event => {
                    if (!eventsByVenue[event.venue]) {
                        eventsByVenue[event.venue] = [];
                    }
                    eventsByVenue[event.venue].push(event);
                });

                // Display events grouped by venue
                Object.entries(eventsByVenue).forEach(([venue, venueEvents]) => {
                    const venueSection = document.createElement('div');
                    venueSection.className = 'venue-section';
                    venueSection.innerHTML = `<h3 class="venue-title">${venue}</h3>`;

                    venueEvents.forEach(event => {
                        const eventElement = document.createElement('div');
                        eventElement.className = 'scheduled-event';
                        eventElement.innerHTML = `
                            <div class="event-header">
                                <h4>${event.name}</h4>
                                <span class="event-time">${event.time}</span>
                            </div>
                            <button onclick="deleteEvent(${event.id})" class="delete-btn">Delete</button>
                        `;
                        venueSection.appendChild(eventElement);
                    });

                    scheduleList.appendChild(venueSection);
                });
            }
        } catch (error) {
            console.error('Error loading schedule:', error);
            if (scheduleList) {
                scheduleList.innerHTML = 
                    '<p class="error">Failed to load schedule. Make sure the backend is running.</p>';
            }
        }
    }

    function showMessage(text, type) {
        if (!message) return;
        message.innerHTML = text;
        message.className = `message ${type}`;
        message.style.opacity = '0';
        message.style.transform = 'translateY(-10px)';
        
        requestAnimationFrame(() => {
            message.style.transition = 'all 0.3s ease';
            message.style.opacity = '1';
            message.style.transform = 'translateY(0)';
        });

        if (type !== 'warning') {
            setTimeout(() => {
                message.style.opacity = '0';
            }, 3000);
        }
    }

    // Make deleteEvent function available globally
    window.deleteEvent = async function(id) {
        try {
            const response = await fetch(`${API_URL}/events/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showMessage('Event deleted successfully!', 'success');
                const currentDate = dateInput ? dateInput.value : today;
                loadSchedule(currentDate);
            } else {
                showMessage('Failed to delete event', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error connecting to server', 'error');
        }
    };
});
