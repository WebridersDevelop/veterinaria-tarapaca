// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const overlay = document.querySelector('.mobile-overlay');
    let isMenuOpen = false;

    function openMenu() {
        navMenu.classList.remove('hidden');
        // Forzar reflow para que la transición funcione
        void navMenu.offsetWidth;
        navMenu.classList.remove('-translate-x-full');
        navMenu.classList.add('translate-x-0');
        overlay.classList.remove('hidden');
        overlay.classList.add('opacity-100');
        document.body.style.overflow = 'hidden';
        // Hamburger animación
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        isMenuOpen = true;
    }

    function closeMenu() {
        navMenu.classList.remove('translate-x-0');
        navMenu.classList.add('-translate-x-full');
        setTimeout(() => {
            navMenu.classList.add('hidden');
        }, 300);
        overlay.classList.add('hidden');
        overlay.classList.remove('opacity-100');
        document.body.style.overflow = '';
        // Reset hamburger
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
        isMenuOpen = false;
    }

    hamburger.addEventListener('click', function() {
        if (!isMenuOpen) {
            openMenu();
        } else {
            closeMenu();
        }
    });

    overlay.addEventListener('click', closeMenu);

    // Cerrar menú al hacer click en un enlace
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 768) {
                closeMenu();
            }
        });
    });
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form Submission Handler
document.querySelector('.contact-form form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const phone = this.querySelector('input[type="tel"]').value;
    const message = this.querySelector('textarea').value;

    // Basic validation
    if (!name || !email || !message) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
    }

    // Simulate form submission
    alert('¡Gracias por tu mensaje! Te contactaremos pronto.');
    this.reset();
});

// CTA Button Handler
document.querySelector('.cta-button').addEventListener('click', function() {
    // Scroll to contact section
    document.querySelector('#contacto').scrollIntoView({
        behavior: 'smooth'
    });
});

// Enhanced Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('nav');
    if (window.scrollY > 50) {
        navbar.classList.add('shadow-2xl', 'bg-white');
        navbar.classList.remove('bg-white/95');
    } else {
        navbar.classList.add('bg-white/95');
        navbar.classList.remove('shadow-2xl', 'bg-white');
    }
});

// Enhanced scroll animations with Tailwind
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    // Add initial hidden state and observe various elements
    const elementsToAnimate = [
        ...document.querySelectorAll('.group'), // Service cards
        ...document.querySelectorAll('h2'), // Section titles
        ...document.querySelectorAll('.bg-white\\/80'), // Contact cards
        document.querySelector('.bg-gradient-to-br.from-white') // Team profile
    ].filter(Boolean);

    elementsToAnimate.forEach(element => {
        element.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700');
        observer.observe(element);
    });
});