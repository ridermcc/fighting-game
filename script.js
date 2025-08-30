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

        // Ground collision
        if (this.y + this.height > canvas.height - 200) {
            this.y = canvas.height - 200 - this.height;
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

        // Arms - with punch animation
        if (this.attacking && this.attackType === 'punch') {
            // Animated punch - extends and retracts
            const punchExtension = Math.sin(this.attackFrame * 0.5) * 15 + 15;
            ctx.moveTo(this.x + this.width/2 - 15, this.y + 30);
            if (this.facing === 'right') {
                ctx.lineTo(this.x + this.width/2 + punchExtension, this.y + 30);
            } else {
                ctx.lineTo(this.x + this.width/2 - punchExtension, this.y + 30);
            }
            // Other arm stays back
            ctx.moveTo(this.x + this.width/2, this.y + 30);
            if (this.facing === 'right') {
                ctx.lineTo(this.x + this.width/2 - 10, this.y + 35);
            } else {
                ctx.lineTo(this.x + this.width/2 + 10, this.y + 35);
            }
        } else {
            // Normal arm position
            ctx.moveTo(this.x + this.width/2 - 15, this.y + 30);
            ctx.lineTo(this.x + this.width/2 + 15, this.y + 30);
        }

        // Legs - with kick animation
        if (this.attacking && this.attackType === 'kick') {
            // Animated kick
            const kickExtension = Math.sin(this.attackFrame * 0.4) * 20 + 10;
            ctx.moveTo(this.x + this.width/2, this.y + 50);
            if (this.facing === 'right') {
                ctx.lineTo(this.x + this.width/2 + kickExtension, this.y + 65);
                // Other leg stays normal
                ctx.moveTo(this.x + this.width/2, this.y + 50);
                ctx.lineTo(this.x + this.width/2 - 10, this.y + 70);
            } else {
                ctx.lineTo(this.x + this.width/2 - kickExtension, this.y + 65);
                // Other leg stays normal
                ctx.moveTo(this.x + this.width/2, this.y + 50);
                ctx.lineTo(this.x + this.width/2 + 10, this.y + 70);
            }
        } else {
            // Normal leg position
            ctx.moveTo(this.x + this.width/2, this.y + 50);
            ctx.lineTo(this.x + this.width/2 - 10, this.y + 70);
            ctx.moveTo(this.x + this.width/2, this.y + 50);
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
                const punchExtension = Math.sin(this.attackFrame * 0.5) * 15 + 15;
                if (this.facing === 'right') {
                    ctx.arc(this.x + this.width/2 + punchExtension, this.y + 30, effectSize, 0, Math.PI * 2);
                } else {
                    ctx.arc(this.x + this.width/2 - punchExtension, this.y + 30, effectSize, 0, Math.PI * 2);
                }
            } else if (this.attackType === 'kick') {
                const kickExtension = Math.sin(this.attackFrame * 0.4) * 20 + 10;
                if (this.facing === 'right') {
                    ctx.arc(this.x + this.width/2 + kickExtension, this.y + 65, effectSize, 0, Math.PI * 2);
                } else {
                    ctx.arc(this.x + this.width/2 - kickExtension, this.y + 65, effectSize, 0, Math.PI * 2);
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
