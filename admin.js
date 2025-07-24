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

document.addEventListener('DOMContentLoaded', function() {
    const participantsContainer = document.getElementById('participants-container');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const paymentProofModal = new bootstrap.Modal(document.getElementById('paymentProofModal'));
    
    let allParticipants = [];
    
    // Load participants from Firebase
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
    
    // Render participant card
    function renderParticipantCard(participant) {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        card.innerHTML = `
            <div class="card participant-card h-100 ${participant.paid ? 'border-success' : 'border-danger'}">
                <div class="card-body">
                    <h5 class="card-title">${participant.teamName}</h5>
                    <p class="card-text">
                        <strong>College:</strong> ${participant.collegeName}<br>
                        <strong>Department:</strong> ${participant.department}<br>
                        <strong>Team Lead:</strong> ${participant.teamLead}<br>
                        <strong>Mobile:</strong> ${participant.teamLeadMobile}
                    </p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-${participant.paid ? 'success' : 'danger'}">
                            ${participant.paid ? 'Paid' : 'Unpaid'}
                        </span>
                        <div>
                            <button class="btn btn-sm btn-outline-secondary view-proof-btn" data-id="${participant.id}">
                                <i class="fas fa-image"></i> View Proof
                            </button>
                            <button class="btn btn-sm btn-${participant.paid ? 'secondary' : 'success'} toggle-payment-btn" data-id="${participant.id}">
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
        const searchTerm = searchInput.value.toLowerCase();
        filterParticipants(searchTerm);
    });
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.toLowerCase();
            filterParticipants(searchTerm);
        }
    });
    
    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
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
                document.getElementById('paymentProofImage').src = participant.paymentProofUrl;
                paymentProofModal.show();
            } else {
                alert('No payment proof available for this participant.');
            }
        }
    });
});