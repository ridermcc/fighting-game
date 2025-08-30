// Game variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const player1HealthBar = document.getElementById('player1-health');
const player2HealthBar = document.getElementById('player2-health');
const gameOverScreen = document.getElementById('game-over');
const winnerText = document.getElementById('winner-text');
const restartBtn = document.getElementById('restart-btn');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game state
let gameRunning = true;
let keys = {};

// Player class
class Player {
    constructor(x, y, color, controls) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 60;
        this.color = color;
        this.health = 100;
        this.speed = 5;
        this.jumpPower = 15;
        this.velocityY = 0;
        this.onGround = true;
        this.facing = controls.left === 'ArrowLeft' ? 'left' : 'right';
        this.controls = controls;
        this.attacking = false;
        this.attackType = '';
        this.attackCooldown = 0;
        this.attackFrame = 0;
        this.hitCooldown = 0;
    }

    update() {
        // Handle movement
        if (keys[this.controls.left]) {
            this.x -= this.speed;
            this.facing = 'left';
        }
        if (keys[this.controls.right]) {
            this.x += this.speed;
            this.facing = 'right';
        }
        if (keys[this.controls.up] && this.onGround) {
            this.velocityY = -this.jumpPower;
            this.onGround = false;
        }

        // Apply gravity
        this.velocityY += 0.8;
        this.y += this.velocityY;

        // Ground collision - align feet to ground level
        if (this.y + this.height > canvas.height - 200) {
            this.y = canvas.height - 200 - this.height + 10; // +10 to align feet to ground
            this.velocityY = 0;
            this.onGround = true;
        }

        // Boundary checks
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;

        // Handle attacks
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
            if (this.attacking) {
                this.attackFrame++;
            }
        } else {
            this.attacking = false;
            this.attackFrame = 0;
        }

        if (this.hitCooldown > 0) {
            this.hitCooldown--;
        }

        // Attack actions
        if (keys[this.controls.punch] && this.attackCooldown === 0) {
            this.attack('punch');
        }
        if (keys[this.controls.kick] && this.attackCooldown === 0) {
            this.attack('kick');
        }
    }

    attack(type) {
        this.attacking = true;
        this.attackType = type;
        this.attackCooldown = 30; // Cooldown frames
        this.attackFrame = 0;
    }

    takeHit(damage) {
        if (this.hitCooldown === 0) {
            this.health -= damage;
            this.hitCooldown = 30;
            if (this.health < 0) this.health = 0;
        }
    }

    draw() {
        // Draw stick figure
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Head
        ctx.arc(this.x + this.width/2, this.y + 10, 10, 0, Math.PI * 2);

        // Body
        ctx.moveTo(this.x + this.width/2, this.y + 20);
        ctx.lineTo(this.x + this.width/2, this.y + 50);

        // Arms - with realistic punch animation
        if (this.attacking && this.attackType === 'punch') {
            // Realistic punch animation with shoulder movement
            const punchProgress = this.attackFrame / 30; // 0 to 1
            const punchExtension = Math.sin(punchProgress * Math.PI) * 25; // Smooth arc
            const shoulderShift = Math.sin(punchProgress * Math.PI) * 5; // Body rotation effect
            
            if (this.facing === 'right') {
                // Punching arm (right)
                const shoulderX = this.x + this.width/2 + shoulderShift;
                const shoulderY = this.y + 30;
                const elbowX = shoulderX + 12 + punchExtension * 0.6;
                const elbowY = shoulderY + 5;
                const fistX = shoulderX + 20 + punchExtension;
                const fistY = shoulderY;
                
                // Upper arm
                ctx.moveTo(shoulderX, shoulderY);
                ctx.lineTo(elbowX, elbowY);
                // Forearm
                ctx.moveTo(elbowX, elbowY);
                ctx.lineTo(fistX, fistY);
                
                // Non-punching arm (left) - defensive position
                ctx.moveTo(this.x + this.width/2 - shoulderShift, this.y + 30);
                ctx.lineTo(this.x + this.width/2 - 12, this.y + 25);
                ctx.moveTo(this.x + this.width/2 - 12, this.y + 25);
                ctx.lineTo(this.x + this.width/2 - 8, this.y + 35);
            } else {
                // Punching arm (left)
                const shoulderX = this.x + this.width/2 - shoulderShift;
                const shoulderY = this.y + 30;
                const elbowX = shoulderX - 12 - punchExtension * 0.6;
                const elbowY = shoulderY + 5;
                const fistX = shoulderX - 20 - punchExtension;
                const fistY = shoulderY;
                
                // Upper arm
                ctx.moveTo(shoulderX, shoulderY);
                ctx.lineTo(elbowX, elbowY);
                // Forearm
                ctx.moveTo(elbowX, elbowY);
                ctx.lineTo(fistX, fistY);
                
                // Non-punching arm (right) - defensive position
                ctx.moveTo(this.x + this.width/2 + shoulderShift, this.y + 30);
                ctx.lineTo(this.x + this.width/2 + 12, this.y + 25);
                ctx.moveTo(this.x + this.width/2 + 12, this.y + 25);
                ctx.lineTo(this.x + this.width/2 + 8, this.y + 35);
            }
        } else {
            // Normal arm position - relaxed at sides
            ctx.moveTo(this.x + this.width/2, this.y + 30);
            ctx.lineTo(this.x + this.width/2 - 12, this.y + 40);
            ctx.moveTo(this.x + this.width/2 - 12, this.y + 40);
            ctx.lineTo(this.x + this.width/2 - 8, this.y + 50);
            
            ctx.moveTo(this.x + this.width/2, this.y + 30);
            ctx.lineTo(this.x + this.width/2 + 12, this.y + 40);
            ctx.moveTo(this.x + this.width/2 + 12, this.y + 40);
            ctx.lineTo(this.x + this.width/2 + 8, this.y + 50);
        }

        // Legs - with realistic kick animation
        if (this.attacking && this.attackType === 'kick') {
            // Realistic kick animation with knee lift and extension
            const kickProgress = this.attackFrame / 30; // 0 to 1
            const kneeHeight = Math.sin(kickProgress * Math.PI) * 20; // Knee lift
            const kickExtension = Math.sin(kickProgress * Math.PI * 2) * 15; // Foot extension
            
            if (this.facing === 'right') {
                // Kicking leg (right)
                const hipX = this.x + this.width/2;
                const hipY = this.y + 50;
                const kneeX = hipX + 8 + kickExtension * 0.3;
                const kneeY = hipY + 15 - kneeHeight;
                const footX = hipX + 15 + kickExtension;
                const footY = hipY + 10 - kneeHeight * 0.5;
                
                // Thigh
                ctx.moveTo(hipX, hipY);
                ctx.lineTo(kneeX, kneeY);
                // Shin
                ctx.moveTo(kneeX, kneeY);
                ctx.lineTo(footX, footY);
                
                // Supporting leg (left) - slightly bent for balance
                ctx.moveTo(this.x + this.width/2, this.y + 50);
                ctx.lineTo(this.x + this.width/2 - 8, this.y + 65);
                ctx.moveTo(this.x + this.width/2 - 8, this.y + 65);
                ctx.lineTo(this.x + this.width/2 - 5, this.y + 70);
            } else {
                // Kicking leg (left)
                const hipX = this.x + this.width/2;
                const hipY = this.y + 50;
                const kneeX = hipX - 8 - kickExtension * 0.3;
                const kneeY = hipY + 15 - kneeHeight;
                const footX = hipX - 15 - kickExtension;
                const footY = hipY + 10 - kneeHeight * 0.5;
                
                // Thigh
                ctx.moveTo(hipX, hipY);
                ctx.lineTo(kneeX, kneeY);
                // Shin
                ctx.moveTo(kneeX, kneeY);
                ctx.lineTo(footX, footY);
                
                // Supporting leg (right) - slightly bent for balance
                ctx.moveTo(this.x + this.width/2, this.y + 50);
                ctx.lineTo(this.x + this.width/2 + 8, this.y + 65);
                ctx.moveTo(this.x + this.width/2 + 8, this.y + 65);
                ctx.lineTo(this.x + this.width/2 + 5, this.y + 70);
            }
        } else {
            // Normal leg position - standing straight
            ctx.moveTo(this.x + this.width/2, this.y + 50);
            ctx.lineTo(this.x + this.width/2 - 8, this.y + 65);
            ctx.moveTo(this.x + this.width/2 - 8, this.y + 65);
            ctx.lineTo(this.x + this.width/2 - 10, this.y + 70);
            
            ctx.moveTo(this.x + this.width/2, this.y + 50);
            ctx.lineTo(this.x + this.width/2 + 8, this.y + 65);
            ctx.moveTo(this.x + this.width/2 + 8, this.y + 65);
            ctx.lineTo(this.x + this.width/2 + 10, this.y + 70);
        }

        ctx.stroke();

        // Draw attack effect with animation
        if (this.attacking) {
            ctx.strokeStyle = '#ff0';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            const effectSize = Math.sin(this.attackFrame * 0.3) * 5 + 8;
            
            if (this.attackType === 'punch') {
                const punchProgress = this.attackFrame / 30;
                const punchExtension = Math.sin(punchProgress * Math.PI) * 25;
                if (this.facing === 'right') {
                    ctx.arc(this.x + this.width/2 + 20 + punchExtension, this.y + 30, effectSize, 0, Math.PI * 2);
                } else {
                    ctx.arc(this.x + this.width/2 - 20 - punchExtension, this.y + 30, effectSize, 0, Math.PI * 2);
                }
            } else if (this.attackType === 'kick') {
                const kickProgress = this.attackFrame / 30;
                const kickExtension = Math.sin(kickProgress * Math.PI * 2) * 15;
                const kneeHeight = Math.sin(kickProgress * Math.PI) * 20;
                if (this.facing === 'right') {
                    ctx.arc(this.x + this.width/2 + 15 + kickExtension, this.y + 60 - kneeHeight * 0.5, effectSize, 0, Math.PI * 2);
                } else {
                    ctx.arc(this.x + this.width/2 - 15 - kickExtension, this.y + 60 - kneeHeight * 0.5, effectSize, 0, Math.PI * 2);
                }
            }
            ctx.stroke();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
        }

        // Draw hit effect
        if (this.hitCooldown > 0 && this.hitCooldown % 6 < 3) {
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + 30, 15, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

// Create players
const player1 = new Player(
    100, 
    canvas.height - 260, 
    '#fff', 
    {
        left: 'a',
        right: 'd',
        up: 'w',
        punch: 'f',
        kick: 'g'
    }
);

const player2 = new Player(
    canvas.width - 130, 
    canvas.height - 260, 
    '#fff', 
    {
        left: 'ArrowLeft',
        right: 'ArrowRight',
        up: 'ArrowUp',
        punch: '/',
        kick: '.'
    }
);

// Check collisions
function checkCollisions() {
    // Attack range
    const attackRange = 40;

    // Player 1 attacking Player 2
    if (player1.attacking) {
        const distance = Math.sqrt(
            Math.pow((player1.x + player1.width/2) - (player2.x + player2.width/2), 2) +
            Math.pow((player1.y + 30) - (player2.y + 30), 2)
        );

        if (distance < attackRange) {
            const damage = player1.attackType === 'punch' ? 5 : 8;
            player2.takeHit(damage);
        }
    }

    // Player 2 attacking Player 1
    if (player2.attacking) {
        const distance = Math.sqrt(
            Math.pow((player2.x + player2.width/2) - (player1.x + player1.width/2), 2) +
            Math.pow((player2.y + 30) - (player1.y + 30), 2)
        );

        if (distance < attackRange) {
            const damage = player2.attackType === 'punch' ? 5 : 8;
            player1.takeHit(damage);
        }
    }
}

// Update health bars
function updateHealthBars() {
    player1HealthBar.style.width = `${player1.health * 2}px`;
    player2HealthBar.style.width = `${player2.health * 2}px`;
}

// Check game over
function checkGameOver() {
    if (player1.health <= 0 || player2.health <= 0) {
        gameRunning = false;
        gameOverScreen.style.display = 'block';
        
        if (player1.health <= 0 && player2.health <= 0) {
            winnerText.textContent = 'Draw!';
        } else if (player1.health <= 0) {
            winnerText.textContent = 'Player 2 Wins!';
        } else {
            winnerText.textContent = 'Player 1 Wins!';
        }
    }
}

// Draw ground
function drawGround() {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 200);
    ctx.lineTo(canvas.width, canvas.height - 200);
    ctx.stroke();
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameRunning) {
        // Update players
        player1.update();
        player2.update();

        // Check collisions
        checkCollisions();

        // Update health bars
        updateHealthBars();

        // Check game over
        checkGameOver();
    }

    // Draw ground
    drawGround();

    // Draw players
    player1.draw();
    player2.draw();

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Event listeners
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

restartBtn.addEventListener('click', () => {
    // Reset game state
    player1.health = 100;
    player2.health = 100;
    player1.x = 100;
    player1.y = canvas.height - 260;
    player2.x = canvas.width - 130;
    player2.y = canvas.height - 260;
    player1.velocityY = 0;
    player2.velocityY = 0;
    player1.onGround = true;
    player2.onGround = true;
    gameRunning = true;
    gameOverScreen.style.display = 'none';
    updateHealthBars();
});

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Start game
updateHealthBars();
gameLoop();
