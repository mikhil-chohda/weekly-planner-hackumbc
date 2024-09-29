const monthYearDisplay = document.getElementById('month-year');
let currentDate = new Date();
let currentWeekStart = new Date(currentDate);
currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);

// Event storage object to keep track of events
const events = {};

// Function to update the calendar
function updateCalendar() {
    const options = { month: 'long', year: 'numeric' };
    monthYearDisplay.textContent = `${currentWeekStart.toLocaleDateString('en-US', options)} - ${new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', options)}`;

    const calendarGrid = document.querySelector('.calendar-grid');
    calendarGrid.innerHTML = `
        <div class="header">Time</div>
        <div class="header">Sunday</div>
        <div class="header">Monday</div>
        <div class="header">Tuesday</div>
        <div class="header">Wednesday</div>
        <div class="header">Thursday</div>
        <div class="header">Friday</div>
        <div class="header">Saturday</div>
    `;

    // Loop through each hour
    for (let hour = 0; hour < 24; hour++) {
        const timeCell = document.createElement('div');
        timeCell.classList.add('time');
        timeCell.textContent = `${hour.toString().padStart(2, '0')}:00`;
        calendarGrid.appendChild(timeCell);

        // Loop through each day (0 = Sunday to 6 = Saturday)
        for (let day = 0; day < 7; day++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            const cellDate = new Date(currentWeekStart);
            cellDate.setDate(currentWeekStart.getDate() + day);
            cellDate.setHours(hour);
            cell.dataset.date = cellDate.toISOString();

            // Check if there's an event for this cell
            const eventKey = `${cellDate.toDateString()}-${hour}`;
            if (events[eventKey]) {
                const event = events[eventKey];
                const eventElement = document.createElement('div');
                eventElement.classList.add('event');
                eventElement.style.height = `${(event.duration / 60) * 50}px`; // Assuming each hour cell is 50px tall
                eventElement.innerHTML = `
                    <strong>${event.title}</strong><br>
                    ${event.time} (${event.duration} mins)
                `;
                cell.appendChild(eventElement);
            }

            cell.addEventListener('click', () => openEventModal(cellDate));
            calendarGrid.appendChild(cell);
        }
    }
}

// Function to open the event modal
function openEventModal(date) {
    const modal = document.getElementById('event-modal');
    modal.style.display = 'block';

    document.getElementById('event-date').value = date.toISOString().split('T')[0];
    document.getElementById('event-time').value = `${date.getHours().toString().padStart(2, '0')}:00`;
    document.getElementById('event-day').value = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
}

// Function to save the event
function saveEvent() {
    const title = document.getElementById('event-title').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const duration = parseInt(document.getElementById('event-duration').value);

    const eventDate = new Date(`${date}T${time}`);
    const eventKey = `${eventDate.toDateString()}-${eventDate.getHours()}`;

    events[eventKey] = {
        title: title,
        date: date,
        time: time,
        duration: duration
    };

    updateCalendar();
    closeEventModal();
}

// Function to close the event modal
function closeEventModal() {
    const modal = document.getElementById('event-modal');
    modal.style.display = 'none';
}

// Voice command functionality
function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.onstart = () => {
        console.log("Voice recognition started. Speak now.");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("You said: " + transcript);
        processVoiceCommand(transcript);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error: " + event.error);
    };

    recognition.onend = () => {
        console.log("Voice recognition ended.");
    };

    recognition.start();
}

// Function to process the voice command
function processVoiceCommand(command) {
    const regex = /add event (.+) on (.+) at (.+) for (\d+) minutes/i;
    const match = command.match(regex);

    if (match) {
        const title = match[1];
        const day = match[2];
        const time = match[3];
        const duration = parseInt(match[4]);

        // Parse the day and find the corresponding date
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayIndex = daysOfWeek.indexOf(day);
        if (dayIndex === -1) {
            alert("Invalid day specified.");
            return;
        }

        const eventDate = new Date(currentWeekStart);
        eventDate.setDate(currentWeekStart.getDate() + dayIndex);
        eventDate.setHours(parseInt(time.split(':')[0]), parseInt(time.split(':')[1]));

        // Save the event
        const eventKey = `${eventDate.toDateString()}-${eventDate.getHours()}`;
        events[eventKey] = {
            title: title,
            date: eventDate.toDateString(),
            time: time,
            duration: duration
        };

        updateCalendar();
        alert(`Event "${title}" added on ${day} at ${time} for ${duration} minutes.`);
    } else {
        alert("Sorry, I didn't understand that command. Please use the format: 'add event <title> on <day> at <time> for <duration> minutes.'");
    }
}

// Event listeners
document.getElementById('prev-week').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    updateCalendar();
});

document.getElementById('next-week').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    updateCalendar();
});

document.getElementById('save-event').addEventListener('click', saveEvent);
document.getElementById('close-modal').addEventListener('click', closeEventModal);
document.getElementById('add-event-btn').addEventListener('click', startVoiceRecognition); // Start voice recognition on button click

// Initialize the calendar on page load
updateCalendar();
