// Initialize Locomotive Scroll
const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    multiplier: 1,
    lerp: 0.1
});

// GSAP ScrollTrigger setup
gsap.registerPlugin(ScrollTrigger);

// Sync ScrollTrigger with Locomotive Scroll
ScrollTrigger.scrollerProxy('[data-scroll-container]', {
    scrollTop(value) {
        return arguments.length ? scroll.scrollTo(value) : scroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: document.querySelector('[data-scroll-container]').style.transform ? 'transform' : 'fixed'
});

// Handle smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            scroll.scrollTo(target, {
                offset: -100, // Adjust offset to account for fixed header
                duration: 1000,
                easing: [0.25, 0.00, 0.35, 1.00]
            });
        }
    });
});

// Hero section animations
function initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    tl.to('#hero-intro', { opacity: 1, y: -20, duration: 0.8 })
      .to('#hero-name', { opacity: 1, y: -20, duration: 0.8 }, '-=0.6')
      .to('#hero-title', { opacity: 1, y: -20, duration: 0.8 }, '-=0.6')
      .to('#hero-desc', { opacity: 1, y: -20, duration: 0.8 }, '-=0.6')
      .to('#hero-buttons', { opacity: 1, y: -20, duration: 0.8 }, '-=0.6')
      .to('#hero-image', { opacity: 1, scale: 1, duration: 1 }, '-=0.8');
}

// Project card animations
function initProjectAnimations() {
    gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                scroller: '[data-scroll-container]',
                start: 'top bottom-=100',
                end: 'top center',
                toggleActions: 'play none none reverse',
                markers: false // Set to true for debugging
            },
            y: 60,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
            delay: i * 0.2
        });
    });
}

// Skill badge animations
function initSkillAnimations() {
    gsap.utils.toArray('.skill-badge').forEach((badge, i) => {
        gsap.from(badge, {
            scrollTrigger: {
                trigger: badge,
                scroller: '[data-scroll-container]',
                start: 'top bottom-=50',
                toggleActions: 'play none none reverse'
            },
            scale: 0.8,
            opacity: 0,
            duration: 0.5,
            ease: 'back.out(1.7)',
            delay: i * 0.1
        });
    });
}

// Navbar scroll effect
function initNavbarEffect() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            navbar.classList.remove('py-2');
            navbar.classList.add('py-4');
        }
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.classList.add('py-2');
            navbar.classList.remove('py-4');
        }
        lastScroll = currentScroll;
    });
}

// Progress bar animation
function initProgressBar() {
    const progressBar = document.getElementById('progressBar');
    
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Initialize all animations and handle window resize
function init() {
    window.addEventListener('load', () => {
        initHeroAnimations();
        initProjectAnimations();
        initSkillAnimations();
        initNavbarEffect();
        initProgressBar();
        initMobileMenu();
        
        // Refresh ScrollTrigger
        ScrollTrigger.refresh();
    });

    window.addEventListener('resize', () => {
        // Update scroll and triggers after a short delay
        setTimeout(() => {
            scroll.update();
            ScrollTrigger.refresh();
        }, 100);
    });
}

// Update ScrollTrigger on Locomotive Scroll update
scroll.on('scroll', ScrollTrigger.update);

// After Locomotive Scroll updates, tell ScrollTrigger to update too
ScrollTrigger.addEventListener('refresh', () => scroll.update());

// Start animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    // Refresh ScrollTrigger after a small delay to ensure proper initialization
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 1000);
});