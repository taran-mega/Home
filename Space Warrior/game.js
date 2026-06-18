// Get Data From Html
canvas = document.getElementById("game");
ctx = canvas.getContext("2d");

// Screen Variable
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let width = canvas.width;
let height = canvas.height;

// Games Variable
let images = {};
let level = 1;
let score = 0;
let manualAim = true;
let gameOver = false;

// User Built 'Collide' Function
function checkCollide(rect1_x, rect1_y, rect1_w, rect1_h, rect2_x, rect2_y, rect2_w, rect2_h){
    
    return (
        (rect1_x + rect1_w >= rect2_x && rect1_x <= rect2_x + rect2_w) &&
        (rect1_y + rect1_h >= rect2_y && rect1_y <= rect2_y + rect2_h)
    );
}

// User Built 'Random' Function
const random = {

    // For Choose between a range
    randint(parameter1, parameter2) {
        
        // Check For Min or Max
        if (parameter1 > parameter2){
            max = parameter1;
            min = parameter2;
        };
        if (parameter1 < parameter2){
            min = parameter1;
            max = parameter2;
        };
        if (parameter1 == parameter2){
            min = parameter1;
            max = parameter2;
        };
        
        // Return Value
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // For Choice between Certain Things
    choice(array) {
    
        // Return Value
        return array[Math.floor(Math.random() * array.length)];
    }
};

// Variable
let imgP = "Assets/Pictures/";

// Game Lists
let bullets = [];
let enemies = [];

// Game Variabels
let shooting = false;

// Default Variables for Both Joysticks
let joyBaseRadius = canvas.height * 0.08;
let joyKnobRadius = joyBaseRadius * 0.7;
let joyBaseY = canvas.height * 0.8 - (joyBaseRadius * 1);
let joyKnobY = joyBaseY;

// Left Joystick Variables
let leftJoyBaseX = canvas.width * 0.15 + (joyBaseRadius * 1);
let leftJoyKnobX = leftJoyBaseX;
let leftJoyKnobY = joyKnobY;
let leftMoveTouchId = null;
let leftJoyActive = false;

// Right Joystick Variables
let rightJoyBaseX = canvas.width * 0.85 - (joyBaseRadius * 1);
let rightJoyKnobX = rightJoyBaseX;
let rightJoyKnobY = joyKnobY;
let rightMoveTouchId = null;
let rightJoyActive = false;

// Player Class
class Player{
    
    // Constructor
    constructor(){
        
        // Public Arguments
        this.health = 20;
        this.maxHealth = this.health;
        this.lockedEnemy = null;
        this.locked = false;
        
        // Position
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.radius = height * 0.1;
        this.dirX = 0;
        this.dirY = 0;
        this.angle = 0;
        
        // Movement
        this.velX = 0;
        this.velY = 0;
        this.acceleration = 1;
        this.friction = 0.98;
        this.maxSpeed = 5;
        
        // Bullet Variable
        this.shootTimer = 5;
        this.shootDelay = 5;
        
        // Health Bar Variable
        this.healthBarX = width * 0.02;
        this.healthBarY = height * 0.02;
        this.healthBarW = width * 0.4;
        this.healthBarH = 30;
    }
    
    // Draw
    draw(){
        
        // Save Context
        ctx.save();
        
        // Trnaslate Context
        ctx.translate(this.x,
                      this.y);
        
        // Rotate Player
        ctx.rotate(this.angle + Math.PI / 2);
        
        // Draw Player
        ctx.drawImage(images[imgP + "Player.png"],
                      -this.radius / 2, 
                      -this.radius / 2, 
                      this.radius, 
                      this.radius);
        
        // Restore Context
        ctx.restore();
        
        // For Each Bullet
        bullets.forEach((bullet, bulletIndex) => {
            
            // Save Context
            ctx.save();
            
            // Translate Context
            ctx.translate(bullet.x,
                          bullet.y);
            
            // Rotate Bullet
            ctx.rotate(bullet.angle + Math.PI / 2);
            
            // Draw Bullet
            ctx.drawImage(images[imgP + "Bullet_1.png"],
                          -bullet.w / 2, 
                          -bullet.h / 2, 
                          bullet.w, 
                          bullet.h);
        
            // Restore Context
            ctx.restore();
        });
        
        // Draw Health Bar Background
        ctx.fillStyle = "red";
        ctx.fillRect(this.healthBarX,
                     this.healthBarY,
                     this.healthBarW,
                     this.healthBarH);
        
        // Check for Health
        if (this.health >= 0 && this.health <= this.maxHealth){
            
            // Draw Health Bar
            ctx.fillStyle = "green";
            ctx.fillRect(this.healthBarX,
                         this.healthBarY,
                         this.healthBarW * (this.health / this.maxHealth),
                         this.healthBarH);
        }
        
        // Write Health in Text
        ctx.fillStyle = "white";
        ctx.font = "30px arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(Math.max(0, this.health),
                     this.healthBarX + this.healthBarW / 2,
                     this.healthBarY + this.healthBarH / 2);
    }
    
    // Update
    update(){
        
        if (leftJoyActive){
        
            // Apply Acceleration
            this.velX += this.dirX * this.acceleration;
            this.velY += this.dirY * this.acceleration;
        }
        
        // Apply Friction
        this.velX *= this.friction;
        this.velY *= this.friction;
            
        // Check Speed
        let speed = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
        
        // Limit Speed
        if (speed > this.maxSpeed){
                
            this.velX = (this.velX / speed) * this.maxSpeed;
            this.velY = (this.velY / speed) * this.maxSpeed;
        }
            
        // Apply Velocity
        this.x += this.velX;
        this.y += this.velY;
        
        // Limit Player Movement
        this.x = Math.max(this.radius / 2, Math.min(this.x, width - this.radius / 2));
        this.y = Math.max(this.radius / 2, Math.min(this.y, height - this.radius / 2));
        
        // For Each Bullet
        bullets.forEach((bullet, bulletIndex) => {
            
            // Move Bullet
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;
            
            // Check for Bullet Position
            if (bullet.x < 0 ||
                bullet.x > width ||
                bullet.y < 0 ||
                bullet.y > height)
                {
                    
                // Autoremove Bullets
                bullets.splice(bulletIndex, 1);
            }
        });
        
        // Update Max Health
        if (this.health > this.maxHealth){this.maxHealth = this.health;}
        
        if (this.locked && this.lockedEnemy) {

            let dx = this.lockedEnemy.x - this.x;
            let dy = this.lockedEnemy.y - this.y;

            this.angle = Math.atan2(dy, dx);
         }
         
         // Check Health
         if (this.health === 0){
         
             gameOver = true;
             document.getElementById("game").style.display = "none";
             document.getElementById("gameoverscreen").style.display = "flex";
             document.getElementById("finalscore").innerHTML = "Score: " + score;
         }
    }
    
    // Shooting Bullet
    shoot(){
        
        // Increase Timer
        this.shootTimer += 1;
        
        // Cooldown
        if (this.shootTimer >= this.shootDelay){
            
            // Shoot
            bullets.push({
            
                x: this.x + Math.cos(this.angle) * this.radius,
                y: this.y + Math.sin(this.angle) * this.radius,
                dirX: 0,
                dirY: 0,
                w: this.radius * 0.3,
                h: this.radius * 0.5,
                angle: this.angle,
                speed: 10
            });
            
            // Reset Time
            this.shootTimer = 0;
        }
    }
    
    // Auto Aim Lock
    findTarget() {

        // Variables
        let bestEnemy = null;
        let bestAngleDiff = Infinity;

        enemies.forEach(enemy => {

            let dx = enemy.x - this.x;
            let dy = enemy.y - this.y;

            let targetAngle = Math.atan2(dy, dx);
    
            let angleDiff = Math.abs(
                Math.atan2(
                    Math.sin(targetAngle - this.angle),
                    Math.cos(targetAngle - this.angle)
                )
            );

           let lockRange = Math.PI / 4;

            if (angleDiff < lockRange && angleDiff < bestAngleDiff) {

                bestEnemy = enemy;
                bestAngleDiff = angleDiff;
            }
        });
    }

    if (bestEnemy) {
        this.lockedEnemy = bestEnemy;
        this.locked = true;
        manualAim = false;
    }
}

// Enemy Class
class Enemy{
    
    // Constructor
    constructor(){
        
        // Variables
        this.radius = height * 0.08;
        this.dirX = 0;
        this.dirY = 0;
        this.maxSpeed = 4;
        this.health = 4;
        this.maxHealth = this.health;
        this.maxEnemies = 2;
        this.bullets = [];
        this.dist = 0;
        
        // Spawn Variables
        this.spawnTimer = 0;
        this.spawnDelay = 50;
        
        // Bullet Variables
        this.shootTimer = 8;
        this.shootDelay = 35;
    }
    
    // Draw
    draw(){
        
        // For Individual Enemy
        enemies.forEach((enemy, enemyIndex) => {
            
            // Save Context
            ctx.save();
            
            // Translate Context
            ctx.translate(enemy.x,
                          enemy.y);
            
            // Rotate Enemies
            ctx.rotate(enemy.angle + Math.PI / 2);
            
            // Draw Enemy
            ctx.drawImage(enemy.img,
                          -this.radius / 2,
                          -this.radius / 2,
                          this.radius,
                          this.radius);
            
            // Draw Health Bar Background
            ctx.fillStyle = "red";
            ctx.fillRect(-this.radius / 2,
                         this.radius / 2,
                         this.radius,
                         this.radius * 0.15);
            
            // Fill Health Bar
            ctx.fillStyle = "green";
            ctx.fillRect(-this.radius / 2,
                         this.radius / 2,
                         this.radius * (enemy.health / this.maxHealth),
                         this.radius * 0.15);
        
        // Restore Context
        ctx.restore();
        
            // For Each Bullet
            enemy.bullets.forEach((bullet, bulletIndex) => {
                
                // Save Context
                ctx.save();
                
                // Translate Context
                ctx.translate(bullet.x,
                              bullet.y);
                
                // Rotate Bullet
                ctx.rotate(bullet.angle + Math.PI / 2);
                
                // Draw Bullet
                ctx.drawImage(images[imgP + "Bullet_1.png"],
                              -bullet.w / 2,
                              -bullet.h / 2,
                              bullet.w,
                              bullet.h);
                
                // Restore Context
                ctx.restore();
            });
        });
    }
    
    // Spawn Enemies
    spawn(){
        
        // Update Spawn Timer
        this.spawnTimer += 1;
        
        // Check Spawn Timer
        if (this.spawnTimer >= this.spawnDelay){
            
            // Check Number of Enemies
            if (enemies.length < this.maxEnemies){
                
                // Randomly Take Spawing Side
                let side = random.choice(["left", "right"]);
                
                // Check for Positions
                if (side === "top"){
                    
                    // Set Position
                    this.x = random.randint(-this.radius - 1, width + this.radius + 1);
                    this.y = -this.radius - 1;
                }
                if (side === "bottom"){
                    
                    // Set Position
                    this.x = random.randint(-this.radius - 1, width + this.radius + 1);
                    this.y = height + this.radius + 1;
                }
                if (side === "left"){
                    
                    // Set Position
                    this.x = -this.radius - 1;
                    this.y = random.randint(-this.radius - 1, height + this.radius + 1);
                }
                if (side === "right"){
                    
                    // Set Position
                    this.x = width + this.radius + 1;
                    this.y = random.randint(-this.radius - 1, height + this.radius + 1);
                }
                
                // Take Random Image
                let enemyImg = random.choice([images[imgP + "Enemy_1.png"],
                                      images[imgP + "Enemy_2.png"],
                                      images[imgP + "Enemy_3.png"]]);
            
                // Make Enemy
                enemies.push({
                    
                    x: this.x,
                    y: this.y,
                    img: enemyImg,
                    radius: this.radius,
                    dirX: 0,
                    dirY: 0,
                    angle: 0,
                    health: this.health,
                    shootTimer: this.shootTimer,
                    shootDelay: this.shootDelay,
                    bullets: [],
                    dist: this.dist
                });
            }
            
            // Reset Spawn Timer
            this.spawnTimer = 0;
        }
    }
    
    // Update Enemies
    update(){
        
        // For Each Enemy
        enemies.forEach((enemy, enemyIndex) => {
            
            // Check Distant
            let dx = player.x - enemy.x;
            let dy = player.y - enemy.y;
            enemy.dist = Math.sqrt(dx * dx + dy * dy);
            
            // Rotate Enemies
            enemy.angle = Math.atan2(dy, dx);
            
            // Check Enemies Direction X and Y
            enemy.dirX = dx;
            enemy.dirY = dy;
            
            // Check Speed
            let speed = Math.sqrt(enemy.dirX * enemy.dirX + enemy.dirY * enemy.dirY);
            
            // Limit Speed
            if (speed > this.maxSpeed){
                enemy.dirX = (enemy.dirX / speed) * this.maxSpeed;
                enemy.dirY = (enemy.dirY / speed) * this.maxSpeed;
            }
            
            // Check Distance
            if (enemy.dist > width * 0.2){
            
                // Move Enemies
                enemy.x += enemy.dirX;
                enemy.y += enemy.dirY;
                
                // Move Health Bar
                enemy.healthBarX = enemy.x;
                enemy.healthBarY = enemy.y;
            }
            
            // For Each Bullet
            for (let bulletIndex = 0; bulletIndex < enemy.bullets.length; bulletIndex++){
                
                // Let Bullet
                let bullet = enemy.bullets[bulletIndex];
                
                // Move Bullet
                bullet.x += Math.cos(bullet.angle) * bullet.speed;
                bullet.y += Math.sin(bullet.angle) * bullet.speed;
                
                // Check for Bullet Position
                if (bullet.x < 0 ||
                    bullet.x > width ||
                    bullet.y < 0 ||
                    bullet.y > height)
                    {
                        
                    // Autoremove Bullets
                    enemy.bullets.splice(bulletIndex, 1);
                }
            }
        });
    }
    
    // Shoot
    shoot(){
    
        // For Each Enemy
        enemies.forEach((enemy, enemyIndex) => {
        
            // Increase Shoot Time
            enemy.shootTimer += 1;
        
            // Check For Shoot Delay
            if (enemy.shootTimer > enemy.shootDelay){
                
                // Check Distance
                if (enemy.dist < width * 0.4){
                
                    // Make Bullets
                    enemy.bullets.push({
                
                        x: enemy.x + Math.cos(enemy.angle) * enemy.radius,
                        y: enemy.y + Math.sin(enemy.angle) * enemy.radius,
                        w: enemy.radius * 0.25,
                        h: enemy.radius * 0.45,
                        dirX: 0,
                        dirY: 0,
                        angle: enemy.angle,
                        speed: 6
                    });
            
                    // Reset Shoot Time
                    enemy.shootTimer = 0;
                }
            }
        });
    }
    
    // Attack
    attack(){
        
        // For Each Enemy
        for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++){
            
            // Let Enemy
            let enemy = enemies[enemyIndex]
        
            // For Each Bullet
            for (let bulletIndex = 0; bulletIndex < enemy.bullets.length; bulletIndex++){
            
                // Let Bullet
                let bullet = enemy.bullets[bulletIndex];
            
                // Check Collision
                if (checkCollide(bullet.x,
                                 bullet.y,
                                 bullet.w,
                                 bullet.h,
                                 player.x,
                                 player.y,
                                 player.radius,
                                 player.radius))
                                 {
                    
                    // Make Impact
                    player.health -= 1;
                    enemy.bullets.splice(bulletIndex, 1);
                }
            }
        }
    }
    
    // Make Enemy Death
    death(){
        
        // For Each Enemy
        for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++){
            
            // Let Enemy
            let enemy = enemies[enemyIndex];
            
            // For Each Bullet
            for (let bulletIndex = 0; bulletIndex < bullets.length; bulletIndex++){
                
                // Let Bullet
                let bullet = bullets[bulletIndex];
                
                // Check Collide
                if (checkCollide(bullet.x,
                                bullet.y,
                                bullet.w,
                                bullet.h,
                                enemy.x,
                                enemy.y,
                                enemy.radius,
                                enemy.radius)){
                    
                    // Reduce Enemy Health
                    enemy.health -= 1;
                    
                    // Remove Bullet
                    bullets.splice(bulletIndex, 1);
                
                    // Check Enemy Health
                    if (enemy.health <= 0){
                        
                        // Remove Enemy
                        enemies.splice(enemyIndex, 1);
                        score += 1;
                        
                        // Check Enemy
                        if (player.lockedEnemy === enemy) {
                            
                            // Release Enemy
                            player.lockedEnemy = null;
                            player.locked = false;
                            manualAim = true;
                        }
                    }
                }
            }
        }
    }
}

// Make Objects
player = new Player();
enemy = new Enemy();

// Touch Start
canvas.addEventListener("touchstart", (event) => {
    
    for (let touch of event.touches){
        
        if (touch.clientX < canvas.width / 2){
            
            leftMoveTouchId = touch.identifier;
            leftJoyActive = true;
        } 
        if (touch.clientX > canvas.width / 2){
            
            rightMoveTouchId = touch.identifier;
            rightJoyActive = true;
            
            shooting = true;
        }
    }
});

// Move
canvas.addEventListener("touchmove", (event) => {
    
    for (let touch of event.touches){
            
        if (leftJoyActive){
            
            if (touch.identifier === leftMoveTouchId){
            
                let dx = touch.clientX - leftJoyBaseX;
                let dy = touch.clientY - joyBaseY;
            
                let dist = Math.sqrt(dx * dx + dy * dy);
            
                let maxDist = joyBaseRadius;
            
                if (dist > maxDist){
                
                    dx = (dx / dist) * maxDist;
                    dy = (dy / dist) * maxDist;
                }
            
                leftJoyKnobX = leftJoyBaseX + dx;
                leftJoyKnobY = joyBaseY + dy;
            
                player.dirX = dx / maxDist;
                player.dirY = dy / maxDist;
            }
        }
                
        if (rightJoyActive){
            
            if (touch.identifier === rightMoveTouchId){
                
                let dx = touch.clientX - rightJoyBaseX;
                let dy = touch.clientY - joyBaseY;
                
                let dist = Math.sqrt(dx * dx + dy * dy);
            
                let maxDist = joyBaseRadius;
            
                if (dist > maxDist){
                
                    dx = (dx / dist) * maxDist;
                    dy = (dy / dist) * maxDist;
                }
                
                rightJoyKnobX = rightJoyBaseX + dx;
                rightJoyKnobY = joyBaseY + dy;
                
                if (manualAim){player.angle = Math.atan2(dy, dx);}
                let newAngle = Math.atan2(dy, dx);
                
                if (player.locked) {

                    let diff = Math.abs(
                        Math.atan2(
                            Math.sin(newAngle - player.angle),
                            Math.cos(newAngle - player.angle)
                        )
                    );

                    if (diff > Math.PI / 6) { // 15 degrees

                        player.locked = false;
                        player.lockedEnemy = null;
                        player.angle = newAngle;
                        manualAim = true;
                    }
                }
            }
        }
    }
});

// Touch End
canvas.addEventListener("touchend", (event) => {
    
    for (let touch of event.changedTouches){
    
        if (touch.identifier === leftMoveTouchId){
    
            leftJoyActive = false;
            leftMoveTouchId = null;
    
            leftJoyKnobX = leftJoyBaseX;
            leftJoyKnobY = joyKnobY;
    
            player.dirX = 0;
            player.dirY = 0;
        
        }
        if (touch.identifier === rightMoveTouchId){
        
            rightJoyActive = false;
            rightMoveTouchId = null;
        
            rightJoyKnobX = rightJoyBaseX;
            rightJoyKnobY = joyKnobY;
        
            shooting = false;
        }
    }
});

function drawJoystick(){
    
    // Left Base
    ctx.beginPath();
    ctx.arc(leftJoyBaseX, joyBaseY, joyBaseRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fill();
    
    // Left Knob
    ctx.beginPath();
    ctx.arc(leftJoyKnobX, leftJoyKnobY, joyKnobRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    
    // Right Base
    ctx.beginPath();
    ctx.arc(rightJoyBaseX, joyBaseY, joyBaseRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fill();
    
    // Right Knob
    ctx.beginPath()
    ctx.arc(rightJoyKnobX, rightJoyKnobY, joyKnobRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
}

// Draw Map
function drawGround(){

    // Draw
    ctx.drawImage(images[imgP + "Background.png"],
                  0,
                  0,
                  width,
                  height);
}

// Update HTML
function updateHTML(){
    
    document.getElementById("score").innerHTML = "Score: " + score;
}

// Draw Function
function draw(){
    
    // Ground
    drawGround();
    
    // Player
    player.draw();
    drawJoystick();
    
    // Enemy
    enemy.draw();
}

// Update Function
function update(){
    
    // Player
    player.update();
    if (shooting){player.shoot();}
    player.findTarget();
    
    // Enemy
    enemy.spawn();
    enemy.update();
    enemy.death();
    enemy.attack();
    enemy.shoot();
    
    // Others
    updateHTML();
}

// Game Loop
function gameloop(){

    if (gameOver){
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    update();
    draw();
    
    // Animation Frame
    requestAnimationFrame(gameloop);
}

// Update Loading UI
function updateLoadingUI(progress){
    
    bar = document.getElementById("progress");
    bar.style.width = (progress * 100) + "%";
}

// Loading
function loading(callback){
    
    // Variables
    let loaded = 0;
    
    // Images to Load
    let imagesToLoad = [
        
        // Player
        imgP + "Player.png",
        
        // Enemy
        imgP + "Enemy_1.png",
        imgP + "Enemy_2.png",
        imgP + "Enemy_3.png",
        
        // Bullets
        imgP + "Bullet_1.png",
        
        // Background
        imgP + "Background.png"
    ];
    
    // For Each Image
    imagesToLoad.forEach(imageToLoad => {
        
        // Let Image
        let img = new Image();
        
        // If Image Load
        img.onload = () => {
            
            // Update UI
            updateLoadingUI(loaded / imagesToLoad.length);
            loaded++;
            
            // Check Condition
            if (loaded == imagesToLoad.length){
                
                // Start Game
                document.getElementById("loadingscreen").style.display = "none";
                document.getElementById("game").style.display = "block";
                callback();
            }
        }
        
        // Save Image
        img.src = imageToLoad;
        images[imageToLoad] = img
    });
}

// Start Game
loading(() => {
    gameloop();
});

// Reset Game
function resetGame(){
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.angle = 0;
    score = 0;
    player.health = 20;
    enemies = [];
    bullets = [];
    enemy.bullets = [];
    document.getElementById("gameoverscreen").style.display = "none";
    document.getElementById("game").style.display = "block";
    gameOver = false;
}