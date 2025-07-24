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

document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');
    const paymentProofInput = document.getElementById('paymentProof');
    const preview = document.getElementById('preview');
    const submitBtn = document.getElementById('submitBtn');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    
    // Preview payment proof image
    paymentProofInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
            
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Function to upload image to ImgBB
    async function uploadToImgBB(imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=c1eaf7608ad3fddb65bfc2f3ac5ffa71`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error('ImgBB upload failed: ' + (data.error?.message || 'Unknown error'));
            }
            
            return data.data.url; // Returns the image URL
        } catch (error) {
            console.error('ImgBB Error:', error);
            throw error;
        }
    }

    // Form submission handler
    registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Uploading...';

        try {
            // Get form values
            const collegeName = document.getElementById('collegeName').value;
            const department = document.getElementById('department').value;
            const teamLead = document.getElementById('teamLead').value;
            const teamLeadMobile = document.getElementById('teamLeadMobile').value;
            const teamName = document.getElementById('teamName').value;
            const paymentProofFile = paymentProofInput.files[0];

            // Validate required fields
            if (!collegeName || !department || !teamLead || !teamLeadMobile || !teamName || !paymentProofFile) {
                throw new Error('Please fill all required fields');
            }

            // Upload to ImgBB
            const imageUrl = await uploadToImgBB(paymentProofFile);

            // Save to Firebase Database
            const participantsRef = ref(database, 'participants');
            const newParticipantRef = push(participantsRef);
            
            await set(newParticipantRef, {
                collegeName,
                department,
                teamLead,
                teamLeadMobile,
                teamName,
                paymentProofUrl: imageUrl,
                paid: false,
                timestamp: new Date().toISOString()
            });

            // Show success message
            successModal.show();
            
            // Reset form
            registrationForm.reset();
            preview.style.display = 'none';

        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + (error.message || 'Failed to submit registration. Please try again.'));
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Registration';
        }
    });
});