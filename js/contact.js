document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');

    // Initialize EmailJS with your public key
    emailjs.init("D6cEQ87kBTOLh9RyY"); // Replace with your actual EmailJS public key

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // Show loading state
        submitText.textContent = 'Sending...';
        submitSpinner.classList.remove('hidden');

        // Prepare template parameters
        const templateParams = {
            from_name: name,
            from_email: email,
            message: message
        };

        // Send email using EmailJS
        emailjs.send('service_521jd11', 'template_p0tqyq2', templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                
                // Reset form and show success message
                form.reset();
                submitText.textContent = 'Send Message';
                submitSpinner.classList.add('hidden');

                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'text-green-400 text-center mt-4 animate-fade-in';
                successMsg.textContent = 'Message sent successfully!';
                form.appendChild(successMsg);

                // Remove success message after 5 seconds
                setTimeout(() => successMsg.remove(), 5000);
            }, function(error) {
                console.log('FAILED...', error);
                
                // Reset button state
                submitText.textContent = 'Send Message';
                submitSpinner.classList.add('hidden');

                // Show error message
                const errorMsg = document.createElement('div');
                errorMsg.className = 'text-red-400 text-center mt-4 animate-fade-in';
                errorMsg.textContent = error.text || 'Failed to send message. Please try again.';
                form.appendChild(errorMsg);

                // Remove error message after 5 seconds
                setTimeout(() => errorMsg.remove(), 5000);
            });

    });

    // Add floating label animations
    document.querySelectorAll('.float-label-input input, .float-label-input textarea').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });

        // Initialize state for pre-filled inputs
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
});
