// Create and initialize the cursor follower element
const cursorFollower = document.createElement('div');
cursorFollower.classList.add('cursor-follower');
document.body.appendChild(cursorFollower);

// Initial position
let currentX = 0;
let currentY = 0;
let targetX = 0;
let targetY = 0;

// Smoothing factor (0 = no smoothing, 1 = maximum smoothing)
const smoothing = 0.15;

// Update cursor follower position
function updatePosition() {
    // Calculate new position using LERP
    currentX += (targetX - currentX) * smoothing;
    currentY += (targetY - currentY) * smoothing;

    // Apply transform with hardware acceleration
    cursorFollower.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

    // Continue animation loop
    requestAnimationFrame(updatePosition);
}

// Track mouse movement
document.addEventListener('mousemove', (e) => {
    // Update target position (subtract half element size to center)
    targetX = e.clientX - 50;
    targetY = e.clientY - 50;
});

// Start animation loop
updatePosition();

// Add styles to head
const style = document.createElement('style');
style.textContent = `
.cursor-follower {
    position: fixed;
    width: 100px;
    height: 100px;
    pointer-events: none;
    z-index: 9999;
    background: rgba(17, 34, 64, 0.3);
    backdrop-filter: blur(8px);
    border: 2px solid transparent;
    border-radius: 50%;
    background-clip: padding-box;
    box-shadow: 0 4px 15px rgba(100, 255, 218, 0.3);
    animation: pulse 2s infinite;
    will-change: transform;
}

@keyframes pulse {
    0% { transform: scale(1) translate3d(${currentX}px, ${currentY}px, 0); }
    50% { transform: scale(1.1) translate3d(${currentX}px, ${currentY}px, 0); }
    100% { transform: scale(1) translate3d(${currentX}px, ${currentY}px, 0); }
}
`;
document.head.appendChild(style);