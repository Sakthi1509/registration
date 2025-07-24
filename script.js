// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAhOtOsyTA0m8H2_2WnO6XVNx-1hUw6eY0",
    authDomain: "techvibez-reg.firebaseapp.com",
    projectId: "techvibez-reg",
    storageBucket: "techvibez-reg.appspot.com",
    messagingSenderId: "1077714581301",
    appId: "1:1077714581301:web:138f17be2893b686687e7c"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Events Data
const events = [
    {
        title: "Mobile Photography",
        description: "Capture the best moments with your mobile camera",
        fullDescription: "Showcase your photography skills using just your mobile phone. Participants will be given themes to capture photos on the spot.",
        rules: "1. Only mobile phones allowed\n2. No external lenses\n3. No photo editing allowed\n4. Max 3 submissions per participant"
    },
    {
        title: "Treasure Hunt",
        description: "Explore the area and find the hidden mystery things",
        fullDescription: "Teams will follow clues to find hidden treasures across the campus. The first team to find all items wins.",
        rules: "1. Only 2 members per team\n2. No running\n3. No destroying property\n4. Time limit: 1 hour"
    },
    {
        title: "Poster Making/Logo Making",
        description: "Design creative posters or logos on given themes",
        fullDescription: "Participants will be given a theme to create either a poster or logo. Art supplies will be provided.",
        rules: "1. Individual participation\n2. Time limit: 2 hours\n3. No digital tools\n4. Original work only"
    },
    {
        title: "Debugging",
        description: "Find and fix bugs in given code snippets",
        fullDescription: "Participants will be given code with bugs to identify and fix within a time limit.",
        rules: "1. Individual participation\n2. Time limit: 1 hour\n3. No internet access\n4. Max 3 submissions"
    },
    {
        title: "Short Film Making",
        description: "Create a short film on a given theme",
        fullDescription: "Teams will create a short film (3-5 minutes) on a theme announced at the event.",
        rules: "1. Team size: 3-5 members\n2. Time limit: 4 hours\n3. Equipment must be your own\n4. No offensive content"
    },
    {
        title: "Quiz",
        description: "Test your general knowledge",
        fullDescription: "Teams will answer questions on various topics including technology, sports, entertainment, and more.",
        rules: "1. Team size: 2 members\n2. No phones or external help\n3. 3 rounds of questions\n4. Final round for top 3 teams"
    },
    {
        title: "Solo Stage Dance",
        description: "Showcase your dance talent individually",
        fullDescription: "Participants will perform a solo dance on stage. Any dance form is welcome.",
        rules: "1. Time limit: 3-5 minutes\n2. Music must be provided in advance\n3. No offensive content\n4. Costumes allowed"
    },
    {
        title: "Group Dance (Flash and Fresh)",
        description: "Team dance performance with coordination",
        fullDescription: "Teams will perform a coordinated dance routine. Creativity and synchronization will be judged.",
        rules: "1. Team size: 5-10 members\n2. Time limit: 5-7 minutes\n3. Music must be provided in advance\n4. Costumes encouraged"
    },
    {
        title: "Fashion Parade",
        description: "Showcase your style on the ramp",
        fullDescription: "Participants will walk the ramp showcasing their style. Themes may be announced on the spot.",
        rules: "1. Individual participation\n2. Time limit: 2 minutes\n3. No offensive outfits\n4. Judged on confidence and style"
    },
    {
        title: "Solo Singing Competition",
        description: "Showcase your vocal talent",
        fullDescription: "Participants will perform a song of their choice (or from given options).",
        rules: "1. Time limit: 3-5 minutes\n2. Karaoke tracks allowed\n3. No offensive lyrics\n4. Original compositions welcome"
    }
];

// Load Events
document.addEventListener('DOMContentLoaded', function() {
    const eventsContainer = document.getElementById('events-container');
    
    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'col-md-4 mb-4';
        eventCard.innerHTML = `
            <div class="card event-card h-100">
                <div class="card-body">
                    <h5 class="card-title">${event.title}</h5>
                    <p class="card-text">${event.description}</p>
                    <button class="btn btn-primary show-more-btn" data-title="${event.title}" data-description="${event.fullDescription}" data-rules="${event.rules}">Show More</button>
                </div>
            </div>
        `;
        eventsContainer.appendChild(eventCard);
    });
    
    // Event Modal Setup
    const eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
    const showMoreBtns = document.querySelectorAll('.show-more-btn');
    
    showMoreBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const title = this.getAttribute('data-title');
            const description = this.getAttribute('data-description');
            const rules = this.getAttribute('data-rules');
            
            document.getElementById('eventModalTitle').textContent = title;
            document.getElementById('eventModalBody').innerHTML = `
                <h6>Description:</h6>
                <p>${description.replace(/\n/g, '<br>')}</p>
                <h6 class="mt-3">Rules:</h6>
                <p>${rules.replace(/\n/g, '<br>')}</p>
            `;
            
            eventModal.show();
        });
    });
});