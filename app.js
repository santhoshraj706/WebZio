// Mobile Navigation
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    // Toggle icon between bars and times
    const icon = mobileMenuBtn.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// Intersection Observer for fade-in animations
const fadeElements = document.querySelectorAll('.fade-in');

const appearOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, appearOptions);

fadeElements.forEach(element => {
    appearOnScroll.observe(element);
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // adjust for fixed header
                behavior: 'smooth'
            });
        }
    });
});

// Form Submission Logic
const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitOrderBtn');
        const successMsg = document.getElementById('formSuccessMessage');
        const errorMsg = document.getElementById('formErrorMessage');
        
        // UI Loading State
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
        successMsg.style.display = 'none';
        errorMsg.style.display = 'none';
        
        // Gather data
        const formData = new FormData(orderForm);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            let result;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                result = await response.json();
            } else {
                result = { message: await response.text() };
            }
            
            if (response.ok) {
                // Success
                orderForm.reset();
                successMsg.style.display = 'block';
            } else {
                // Error from server
                console.error('API Error:', result);
                errorMsg.style.display = 'block';
                // If it's a Vercel/Node crash, show a snippet of the error
                const errorDisplay = typeof result.message === 'string' && result.message.length > 100 
                    ? 'Server Error (Check Vercel Logs)' 
                    : (result.message || 'Failed to submit order.');
                errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorDisplay}`;
            }
        } catch (error) {
            // Network error (fetch itself failed)
            console.error('Fetch error:', error);
            errorMsg.style.display = 'block';
            errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> Connection error: ${error.message}`;
        } finally {
            // Restore UI
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit Order <i class="fas fa-paper-plane"></i>';
        }
    });
}

// --- Extreme UI Enhancements ---

// 1. 3D Tilt Effect for Cards
function init3DTilt() {
    const tiltCards = document.querySelectorAll('.service-card, .glass-card, .team-member');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 25;
            const rotateY = (centerX - x) / 25;
            
            card.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(2000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
        });
    });
}


// 2. Magnetic Buttons
const magButtons = document.querySelectorAll('.btn');

magButtons.forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = `translate(0, 0)`;
    });
});

// 3. Staggered Reveal for Grid Items
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const staggeredObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const children = entry.target.children;
            Array.from(children).forEach((child, index) => {
                setTimeout(() => {
                    child.classList.add('reveal-visible');
                }, index * 100);
            });
            staggeredObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.services-grid, .team-grid').forEach(grid => {
    staggeredObserver.observe(grid);
});

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    init3DTilt();
    // Reveal animations and magnetic buttons are initialized within their respective observers/listeners
});




