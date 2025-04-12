// Navbar scroll behavior
let navbar = null;
let lastScrollTop = 0;

document.addEventListener('DOMContentLoaded', () => {
    navbar = document.getElementById('navbar');
    if (!navbar) return; // Exit if navbar element not found

    window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add shadow and adjust background opacity based on scroll position
    if (scrollTop > 10) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        navbar.style.backgroundColor = 'rgba(10, 25, 47, 0.95)';
        navbar.style.backdropFilter = 'blur(12px)';
    } else {
        navbar.style.boxShadow = 'none';
        navbar.style.backgroundColor = 'rgba(10, 25, 47, 0.8)';
        navbar.style.backdropFilter = 'blur(8px)';
    }
    
    // Hide/show navbar based on scroll direction
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down & past navbar
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
    });
});
