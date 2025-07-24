import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Admin credentials
const ADMIN_CREDENTIALS = {
    email: "PKNtechvibz@gmail.com",
    password: "PKNadmin1219"
};

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const participantsContainer = document.getElementById('participants-container');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const paymentProofModal = new bootstrap.Modal(document.getElementById('paymentProofModal'));
    const paymentProofImage = document.getElementById('paymentProofImage');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    
    let allParticipants = [];
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Check authentication status
    function checkAuth() {
        const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
        if (!isAuthenticated) {
            loginModal.show();
        }
        return isAuthenticated;
    }
    
    // Show/hide UI based on auth status
    function updateUIBasedOnAuth() {
        const isAuthenticated = checkAuth();
        if (isAuthenticated) {
            loadParticipants();
        }
    }
    
    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            // Successful login
            sessionStorage.setItem('adminAuthenticated', 'true');
            loginError.classList.add('d-none');
            loginModal.hide();
            loadParticipants();
        } else {
            // Failed login
            loginError.textContent = "Invalid email or password";
            loginError.classList.remove('d-none');
        }
    });
    
    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('adminAuthenticated');
            window.location.reload();
        });
    }
    
    // Load participants from Firebase
    function loadParticipants() {
        if (!checkAuth()) return;
        
        const participantsRef = ref(database, 'participants');
        onValue(participantsRef, (snapshot) => {
            allParticipants = [];
            participantsContainer.innerHTML = '';
            
            snapshot.forEach((childSnapshot) => {
                const participant = childSnapshot.val();
                participant.id = childSnapshot.key;
                allParticipants.push(participant);
                
                renderParticipantCard(participant);
            });
        });
    }
    
    // Render participant card with improved mobile touch targets
    function renderParticipantCard(participant) {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        card.innerHTML = `
            <div class="card participant-card h-100 ${participant.paid ? 'border-success' : 'border-danger'}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${participant.teamName}</h5>
                    <p class="card-text flex-grow-1">
                        <strong>College:</strong> ${participant.collegeName}<br>
                        <strong>Department:</strong> ${participant.department}<br>
                        <strong>Team Lead:</strong> ${participant.teamLead}<br>
                        <strong>Total Participants:</strong> ${participant.totparticipant}<br>
                        <strong>Gmail:</strong> ${participant.email}<br>
                        <strong>Mobile:</strong> ${participant.teamLeadMobile}
                    </p>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <span class="badge bg-${participant.paid ? 'success' : 'danger'}">
                            ${participant.paid ? 'Paid' : 'Unpaid'}
                        </span>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-secondary view-proof-btn flex-shrink-0" data-id="${participant.id}" style="width: 110px;">
                                <i class="fas fa-image"></i> View Proof
                            </button>
                            <button class="btn btn-sm btn-${participant.paid ? 'secondary' : 'success'} toggle-payment-btn flex-shrink-0" data-id="${participant.id}" style="width: 110px;">
                                ${participant.paid ? 'Mark Unpaid' : 'Mark Paid'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        participantsContainer.appendChild(card);
    }
    
    // Search functionality
    searchBtn.addEventListener('click', function() {
        if (!checkAuth()) return;
        const searchTerm = searchInput.value.toLowerCase();
        filterParticipants(searchTerm);
    });
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            if (!checkAuth()) return;
            const searchTerm = searchInput.value.toLowerCase();
            filterParticipants(searchTerm);
        }
    });
    
    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!checkAuth()) return;
            const filter = this.getAttribute('data-filter');
            filterParticipants('', filter);
        });
    });
    
    function filterParticipants(searchTerm = '', filter = 'all') {
        participantsContainer.innerHTML = '';
        
        const filtered = allParticipants.filter(participant => {
            const matchesSearch = 
                participant.collegeName.toLowerCase().includes(searchTerm) ||
                participant.teamName.toLowerCase().includes(searchTerm) ||
                participant.teamLead.toLowerCase().includes(searchTerm);
            
            const matchesFilter = 
                filter === 'all' || 
                (filter === 'paid' && participant.paid) || 
                (filter === 'unpaid' && !participant.paid);
            
            return matchesSearch && matchesFilter;
        });
        
        filtered.forEach(participant => renderParticipantCard(participant));
    }
    
    // Toggle payment status
    participantsContainer.addEventListener('click', function(e) {
        if (!checkAuth()) return;
        
        if (e.target.classList.contains('toggle-payment-btn') || e.target.closest('.toggle-payment-btn')) {
            const btn = e.target.classList.contains('toggle-payment-btn') ? e.target : e.target.closest('.toggle-payment-btn');
            const participantId = btn.getAttribute('data-id');
            const participant = allParticipants.find(p => p.id === participantId);
            
            if (participant) {
                const updates = {};
                updates[`/participants/${participantId}/paid`] = !participant.paid;
                
                update(ref(database), updates)
                    .then(() => console.log('Payment status updated'))
                    .catch(error => console.error('Error updating payment status:', error));
            }
        }
        
        if (e.target.classList.contains('view-proof-btn') || e.target.closest('.view-proof-btn')) {
            const btn = e.target.classList.contains('view-proof-btn') ? e.target : e.target.closest('.view-proof-btn');
            const participantId = btn.getAttribute('data-id');
            const participant = allParticipants.find(p => p.id === participantId);
            
            if (participant && participant.paymentProofUrl) {
                loadingSpinner.style.display = 'block';
                paymentProofImage.style.display = 'none';
                
                paymentProofImage.onload = function() {
                    loadingSpinner.style.display = 'none';
                    paymentProofImage.style.display = 'block';
                };
                
                paymentProofImage.src = participant.paymentProofUrl;
                paymentProofModal.show();
                
                // Add touch event listeners for swipe gestures
                const modalBody = document.querySelector('.modal-body');
                modalBody.addEventListener('touchstart', handleTouchStart, false);
                modalBody.addEventListener('touchend', handleTouchEnd, false);
                
            } else {
                alert('No payment proof available for this participant.');
            }
        }
    });
    
    // Swipe gesture handlers
    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
    }
    
    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }
    
    function handleSwipeGesture() {
        const threshold = 100; // Minimum swipe distance
        
        if (touchEndX < touchStartX - threshold) {
            // Swipe left - could be used for next image in a gallery
        }
        
        if (touchEndX > touchStartX + threshold) {
            // Swipe right - could be used for previous image in a gallery
        }
    }
    
    // Initialize the UI based on auth status
    updateUIBasedOnAuth();
});
