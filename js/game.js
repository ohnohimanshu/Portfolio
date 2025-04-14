document.addEventListener('DOMContentLoaded', function() {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    let sequence = [];
    let playerSequence = [];
    let score = 0;
    let timeLeft = 60;
    let gameTimer;
    let isPlaying = false;

    const gameBoard = document.getElementById('gameBoard');
    const playerSequenceDiv = document.getElementById('playerSequence');
    const startButton = document.getElementById('startGame');
    const checkButton = document.getElementById('checkSequence');
    const scoreDisplay = document.getElementById('gameScore');
    const timeDisplay = document.getElementById('gameTime');

    function createColorButton(color) {
        const button = document.createElement('button');
        button.className = 'w-16 h-16 rounded-full transition-transform hover:scale-110 hover:glow-effect';
        button.style.backgroundColor = color;
        button.addEventListener('click', () => selectColor(color));
        return button;
    }

    function initializeGame() {
        gameBoard.innerHTML = '';
        colors.forEach(color => {
            gameBoard.appendChild(createColorButton(color));
        });
    }

    function startGame() {
        sequence = [];
        playerSequence = [];
        score = 0;
        timeLeft = 60;
        isPlaying = true;
        
        // Generate new sequence
        for(let i = 0; i < 4; i++) {
            sequence.push(colors[Math.floor(Math.random() * colors.length)]);
        }
        
        // Flash sequence to player
        flashSequence();
        
        // Start timer
        gameTimer = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = `Time: ${timeLeft}s`;
            
            if(timeLeft <= 0) {
                endGame();
            }
        }, 1000);
        
        startButton.disabled = true;
        checkButton.disabled = false;
        scoreDisplay.textContent = `Score: ${score}`;
    }

    function flashSequence() {
        let i = 0;
        const flash = setInterval(() => {
            if(i >= sequence.length) {
                clearInterval(flash);
                return;
            }
            
            const tempButton = createColorButton(sequence[i]);
            tempButton.classList.add('animate-pulse');
            playerSequenceDiv.appendChild(tempButton);
            
            setTimeout(() => {
                tempButton.remove();
            }, 500);
            
            i++;
        }, 1000);
    }

    function selectColor(color) {
        if(!isPlaying) return;
        
        playerSequence.push(color);
        
        const button = createColorButton(color);
        playerSequenceDiv.appendChild(button);
        
        if(playerSequence.length >= 4) {
            checkButton.disabled = false;
        }
    }

    function checkSequence() {
        let correct = true;
        
        for(let i = 0; i < sequence.length; i++) {
            if(sequence[i] !== playerSequence[i]) {
                correct = false;
                break;
            }
        }
        
        if(correct) {
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
            playerSequence = [];
            playerSequenceDiv.innerHTML = '';
            sequence = [];
            
            // Generate new sequence
            for(let i = 0; i < 4; i++) {
                sequence.push(colors[Math.floor(Math.random() * colors.length)]);
            }
            
            flashSequence();
        } else {
            endGame();
        }
    }

    function endGame() {
        isPlaying = false;
        clearInterval(gameTimer);
        alert(`Game Over! Final Score: ${score}`);
        
        startButton.disabled = false;
        checkButton.disabled = true;
        playerSequence = [];
        playerSequenceDiv.innerHTML = '';
    }

    startButton.addEventListener('click', startGame);
    checkButton.addEventListener('click', checkSequence);
    
    initializeGame();
});