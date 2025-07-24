import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/xkeysib-8a93b145384fad3a48ee3547f584dfe03c4f9af34e3bd39d31748a14aa10ee38-E5pPkugmGTlZIHXKfirebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAhOtOsyTA0m8H2_2WnO6XVNx-1hUw6eY0,",
    authDomain: "techvibez-reg.firebaseapp.com",
    projectId: "techvibez-reg",
    storageBucket: "techvibez-reg.appspot.com",
    messagingSenderId: "1077714581301",
    appId: "1:1077714581301:web:138f17be2893b686687e7c"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', function () {
    const registrationForm = document.getElementById('registrationForm');
    const paymentProofInput = document.getElementById('paymentProof');
    const preview = document.getElementById('preview');
    const submitBtn = document.getElementById('submitBtn');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));

    // Preview payment proof image
    paymentProofInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();

            reader.onload = function (e) {
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
    // Add this function to send email via Mailgun
   async function sendConfirmationEmail(email, teamLead, teamName) {
    const brevoApiKey = ''; // Replace with your actual key
    
    const emailData = {
        sender: {
            name: 'PKN TechVibe',
            email: 'sakthi34035@gmail.com'
        },
        to: [{
            email: email,
            name: teamLead
        }],
        subject: `Registration Confirmed for PKN TechVibe 2025 - Team ${teamName}`,
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">🎉 Registration Confirmed for PKN TechVibe 2025!</h2>
                
                <p>Dear ${teamLead},</p>
                
                <p>We're excited to confirm your team <strong>${teamName}</strong> has been successfully registered for <strong>PKN TechVibe 2025</strong>.</p>
                
                <div style="text-align: center; margin: 25px 0;">
                    <a href="https://tech-vibz.netlify.app" 
                       style="display: inline-block; background-color: #2c3e50; color: white; 
                              padding: 12px 24px; text-decoration: none; border-radius: 4px; 
                              font-weight: bold;">
                        View Events
                    </a>
                </div>
                
                <p style="font-weight: bold;">Event Date: 28/08/2025</p>
                
                <div style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
                    <p>Best regards,</p>
                    <p><strong>The PKN TechVibe Team</strong></p>
                </div>
            </div>
        `
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': brevoApiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });
        
        if (!response.ok) {
            throw new Error('Brevo API error: ' + await response.text());
        }
        
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
}

    // Update your form submission handler to include email sending
    registrationForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Uploading...';

        try {
            // Get form values (existing code)
            const collegeName = document.getElementById('collegeName').value;
            const department = document.getElementById('department').value;
            const teamLead = document.getElementById('teamLead').value;
            const teamLeadMobile = document.getElementById('teamLeadMobile').value;
            const teamName = document.getElementById('teamName').value;
            const totparticipant = document.getElementById('totparticipant').value;
            const email = document.getElementById('email').value;
            const paymentProofFile = paymentProofInput.files[0];

            // Validate required fields (existing code)
            if (!collegeName || !department || !teamLead || !teamLeadMobile || !teamName || !totparticipant || !email || !paymentProofFile) {
                throw new Error('Please fill all required fields');
            }

            // Upload to ImgBB (existing code)
            const imageUrl = await uploadToImgBB(paymentProofFile);

            // Save to Firebase Database (existing code)
            const participantsRef = ref(database, 'participants');
            const newParticipantRef = push(participantsRef);

            await set(newParticipantRef, {
                collegeName,
                department,
                teamLead,
                teamLeadMobile,
                teamName,
                totparticipant,
                email,
                paymentProofUrl: imageUrl,
                paid: false,
                timestamp: new Date().toISOString()
            });

          const emailSent = await sendConfirmationEmail(email, teamLead, teamName);
        
        if (!emailSent) {
            console.warn('Registration saved but email sending failed');
        }

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
