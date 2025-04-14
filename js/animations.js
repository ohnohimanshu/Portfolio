// LERP (Linear Interpolation) function
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// Smooth scroll animation
class SmoothScroll {
    constructor() {
        this.targetY = window.scrollY;
        this.currentY = window.scrollY;
        this.scrollEase = 0.075; // Adjust for smoother/faster scrolling
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            this.targetY = window.scrollY;
        });

        this.animate();
    }

    animate() {
        this.currentY = lerp(this.currentY, this.targetY, this.scrollEase);
        document.documentElement.style.setProperty('--scroll-y', `${this.currentY}px`);
        requestAnimationFrame(() => this.animate());
    }
}

// Parallax effect for background elements
class ParallaxEffect {
    constructor() {
        this.bgElements = document.querySelectorAll('.bg-element');
        this.init();
    }

    init() {
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.animate();
    }

    handleMouseMove(e) {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        this.bgElements.forEach((element, index) => {
            const depth = 0.05 * (index + 1);
            const targetX = (clientX - centerX) * depth;
            const targetY = (clientY - centerY) * depth;
            
            element.dataset.targetX = targetX;
            element.dataset.targetY = targetY;
        });
    }

    animate() {
        this.bgElements.forEach(element => {
            const currentX = parseFloat(element.dataset.currentX || 0);
            const currentY = parseFloat(element.dataset.currentY || 0);
            const targetX = parseFloat(element.dataset.targetX || 0);
            const targetY = parseFloat(element.dataset.targetY || 0);

            const newX = lerp(currentX, targetX, 0.05);
            const newY = lerp(currentY, targetY, 0.05);

            element.dataset.currentX = newX;
            element.dataset.currentY = newY;

            element.style.transform = `translate(${newX}px, ${newY}px)`;
        });

        requestAnimationFrame(() => this.animate());
    }
}



// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SmoothScroll();
    new ParallaxEffect();
    // Add this function to your animations.js file
    function FloatingAnimation() {
        const bgElements = document.querySelectorAll('.bg-element');
        
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            bgElements.forEach((element, index) => {
                // Different movement factor for each element
                const moveFactor = 0.02 - (index * 0.005);
                
                // Calculate new position
                const moveX = (mouseX - window.innerWidth / 2) * moveFactor;
                const moveY = (mouseY - window.innerHeight / 2) * moveFactor;
                
                // Apply transform with some delay based on index
                element.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
    }
    
    // Make sure this is called when the document is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Your existing code...
        
        // Initialize the floating animation
        FloatingAnimation();
    });
});