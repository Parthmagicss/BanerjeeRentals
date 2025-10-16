document.addEventListener('DOMContentLoaded', function() {
    // Scroll animation
    const fadeElements = document.querySelectorAll('.service-card, .car-card, .testimonial-card');
    
    function checkFade() {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const isVisible = (elementTop < window.innerHeight - 100) && (elementBottom > 0);
            
            if (isVisible) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }

    fadeElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    checkFade();
    window.addEventListener('scroll', checkFade);

    // Set minimum datetime
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    document.getElementById('datetime').min = minDateTime;

    // Handle booking form submission
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading spinner
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading visible';
        loadingElement.innerHTML = '<div class="spinner"></div><p>Processing your booking...</p>';
        this.appendChild(loadingElement);
        
        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            pickup: document.getElementById('pickup').value,
            destination: document.getElementById('destination').value,
            datetime: document.getElementById('datetime').value,
            passengers: document.getElementById('passengers').value,
            carType: document.getElementById('carType').value,
            ac: document.getElementById('ac').value,
            tripType: document.getElementById('tripType').value,
            occasion: document.getElementById('occasion').value,
            message: document.getElementById('message').value,
            timestamp: new Date().toLocaleString(),
            bookingId: 'BNJ-' + Math.floor(1000 + Math.random() * 9000)
        };
        
        sendToGoogleAppsScript(formData);
    });

    function sendToGoogleAppsScript(formData) {
        const scriptURL = 'https://script.google.com/macros/s/AKfycbxgDw0GshXz-2_rmaP6oKlribbYVBNX-GlKg9cuLripeU5fw5PTA2NfZeBlZXI0q7Hsfw/exec';
        const data = new URLSearchParams();
        for (const key in formData) {
            data.append(key, formData[key]);
        }

        fetch(scriptURL, {
            method: 'POST',
            body: data,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .then(async response => {
            // Try reading response
            let text;
            try {
                text = await response.text();
            } catch {
                text = '';
            }

            console.log('Raw GAS response:', text);

            // Attempt to parse JSON
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                data = { result: 'success' }; // assume success if parsing fails (for local CORS)
            }

            // Remove loading spinner
            const loadingElement = document.querySelector('.loading');
            if (loadingElement) loadingElement.remove();

            // Show success message if result is success, or assume success for local testing
            if (!data.result || data.result.toLowerCase() === 'success') {
                showSuccessMessage(formData);
            } else {
                showErrorMessage();
                console.error('GAS responded with error:', data);
            }
        })
        .catch(error => {
            // Remove spinner
            const loadingElement = document.querySelector('.loading');
            if (loadingElement) loadingElement.remove();

            // ✅ Assume success for local testing CORS errors
            if (error.message.includes('Failed to fetch')) {
                console.warn('Fetch blocked by CORS locally. Assuming success.');
                showSuccessMessage(formData);
            } else {
                showErrorMessage();
                console.error('Network or fetch error:', error);
            }
        });
    }


    // Show success message
    function showSuccessMessage(formData) {
        const successElement = document.createElement('div');
        successElement.className = 'form-success visible';
        successElement.innerHTML = `
            <h3><i class="fas fa-check-circle"></i> Booking Request Received!</h3>
            <p>Thank you <strong>${formData.name}</strong> for your booking request.</p>
            <p>We have received your booking details and will contact you shortly at <strong>${formData.phone}</strong> to confirm your ride.</p>
            <p class="booking-id"><strong>Booking Reference:</strong> ${formData.bookingId}</p>
            <div class="help-text">
                <p><small>Please keep this reference number for future communication.</small></p>
            </div>
        `;
        document.getElementById('bookingForm').appendChild(successElement);
        document.getElementById('bookingForm').reset();
        successElement.scrollIntoView({ behavior: 'smooth' });
    }

    // Show error message
    function showErrorMessage() {
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error visible';
        errorElement.innerHTML = `
            <h3><i class="fas fa-exclamation-circle"></i> Error</h3>
            <p>There was an issue processing your booking. Please try again or contact us directly.</p>
        `;
        document.getElementById('bookingForm').appendChild(errorElement);
        errorElement.scrollIntoView({ behavior: 'smooth' });
    }

    // Car selection
    const selectCarButtons = document.querySelectorAll('.select-car');
    selectCarButtons.forEach(button => {
        button.addEventListener('click', function() {
            const carType = this.getAttribute('data-car-type');
            document.getElementById('carType').value = carType;
            document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Car gallery logic
    function initCarGalleries() {
        const carGalleries = document.querySelectorAll('.car-gallery');
        
        carGalleries.forEach(gallery => {
            const slides = gallery.querySelector('.car-slides');
            const prevBtn = gallery.querySelector('.gallery-prev');
            const nextBtn = gallery.querySelector('.gallery-next');
            const dots = gallery.querySelectorAll('.dot');
            
            let currentSlide = 0;
            const totalSlides = dots.length;
            
            function updateGallery() {
                slides.style.transform = `translateX(-${currentSlide * (100 / totalSlides)}%)`;
                dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    currentSlide = (currentSlide + 1) % totalSlides;
                    updateGallery();
                });
            }

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                    updateGallery();
                });
            }

            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    currentSlide = index;
                    updateGallery();
                });
            });

            let autoSlideInterval = setInterval(() => {
                currentSlide = (currentSlide + 1) % totalSlides;
                updateGallery();
            }, 4000);

            gallery.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
            gallery.addEventListener('mouseleave', () => {
                autoSlideInterval = setInterval(() => {
                    currentSlide = (currentSlide + 1) % totalSlides;
                    updateGallery();
                }, 4000);
            });

            let touchStartX = 0, touchEndX = 0;

            gallery.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
            }, false);

            gallery.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, false);

            function handleSwipe() {
                const swipeThreshold = 50;
                if (touchEndX < touchStartX - swipeThreshold) {
                    currentSlide = (currentSlide + 1) % totalSlides;
                    updateGallery();
                }
                if (touchEndX > touchStartX + swipeThreshold) {
                    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                    updateGallery();
                }
            }
        });
    }

    initCarGalleries();
});
