// Get Data From Html
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const msg_box = document.getElementsByClassName("death_msg_popup");

// Screen Varibles
canvas.width = window.innerWidth
canvas.height = window.innerHeight
let height = canvas.height;
let width = canvas.width;
let rect = canvas.getBoundingClientRect();

// Different Running States
const game = "game";
const gameOver = "gameOver";
let runningState = game;

// Player Variables
let bullets = [];
let score = 0;
let health = 10;
let maxHealth = health;

// Enemy Variables
let enemies = [];

// Game Variables
const images = {};
let touched = false;
let game_speed = 1;
let loading_point = 0;
let dragging_speed = 0.8;
let imgP = "Assets/Pictures/";
let audioP = "Assets/Audios";

// Sounds
const shootSound = new Audio(audioP + "shoot.mp3");
const destroySound = new Audio(audioP + "destroy.mp3");

// Lable Bg Variables
let lable_bg_height = height * 0.08;

// Lable Default Variables
let lable_width = width * 0.25;
let lable_height = lable_bg_height * 0.8;
let lable_y = lable_bg_height / 2 - lable_height / 2;

// Score Lable Varibles
let score_lable_x = 10;

// Health Lable Varibles 
let health_lable_x = width - lable_width - 10;

// Update Variables Function
function updateVariables(){
    
    // Screen Variables
    width = canvas.width;
    height = canvas.height;
    rect = canvas.getBoundingClientRect();
}

// Collide Function
function checkCollide(rect1_x, rect1_y, rect1_w, rect1_h, rect2_x, rect2_y, rect2_w, rect2_h){
    
    return (
        (rect1_x + rect1_w >= rect2_x && rect1_x <= rect2_x + rect2_w) &&
        (rect1_y + rect1_h >= rect2_y && rect1_y <= rect2_y + rect2_h)
    );
}

// Button Class
class Button{
    
    // Constructor
    constructor(x, y, w, h, baseColor, hoverColor, textColor){
        
        // Public Arguments
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.baseColor = baseColor;
        this.hoverColor = hoverColor;
        this.textColor = textColor;
        
        // Public Variable
        this.pressed = false;
        
        // Color Variable
        this.color = this.baseColor
        
        // Text Variable
        this.textX = this.x + this.w / 2;
        this.textY = this.y + this.h / 2;
    }
    
    // Draw Method
    draw(text){
        
        // Draw Background
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        
        // Draw Text
        ctx.fillStyle = this.textColor;
        ctx.font = "20px arial";
        ctx.textAlign = "center";
        ctx.textBaseLine = "middle";
        ctx.fillText(
            text,
            this.textX,
            this.textY
        );
    }
    
    // Event Manager
    handleEvent(callback){
        
        // Touched
        canvas.addEventListener("pointerdown", (event) => {
            
            const rect = canvas.getBoundingClientRect();
            const mx = event.offsetX - rect.left;
            const my = event.offsetY - rect.top;
            
            if (
                mx > this.x &&
                mx < this.x + this.w &&
                my > this.y &&
                my < this.y + this.h
            ){
                
                this.pressed = true;
                this.color = this.hoverColor;
            }
        });
        
        // Release
        canvas.addEventListener("pointerup", (event) => {
            
            const rect = canvas.getBoundingClientRect();
            const mx = event.offsetX - rect.left;
            const my = event.offsetY - rect.top;
            
            if (
                mx > this.x &&
                mx < this.x + this.w &&
                my > this.y &&
                my < this.y + this.h
            ){
                // Check Pressed or not
                if (this.pressed === true){
                    
                    // Make Workable
                    callback();
                    this.pressed = false;
                    this.color = this.baseColor;
                }
                
                // Reset Press
                this.pressed = false;
                this.color = this.baseColor;
            }
            
            // Reset Press
            this.pressed = false;
            this.color = this.baseColor
        });
    }
}

// Player Class
class Player{
    
    // Constructor
    constructor(){
        
        // Variables
        this.h = height * 0.15;
        this.w = this.h;
        this.y = height - this.h - 20;
        
        // Body Image Variable
        this.bodyY = this.y;
        this.bodyH = this.h;
        this.bodyW = this.w * 0.2;
        this.bodyX = width / 2 - this.bodyW / 2;
        
        // Guns Variables
        this.GAG = this.w * 0.0; // Guns Adjustment Gap
        this.guns_W = this.w * 0.15;
        this.guns_H = this.h * 0.8;
        this.guns_Y = this.bodyY + this.bodyH * 0.2;
        this.gunsL_X = this.bodyX - this.guns_W + this.GAG;
        this.gunsR_X = this.bodyX + this.bodyW - this.GAG;
        
        // Wings Variables
        this.WAG = this.w * 0; // Wings Adjustment Gap
        this.wing_W = this.w * 0.25;
        this.wing_H = this.h * 0.3;
        this.wing_Y = this.bodyY + this.bodyH * 0.5;
        this.wingL_X = this.bodyX - this.guns_W - this.wing_W + this.WAG;
        this.wingR_X = this.bodyX + this.guns_W + this.bodyW - this.WAG;
        
        // Bullet Image Variables
        this.bullet_w = this.w * 0.15;
        this.bullet_h = this.h * 0.5;
        this.bullet_speed = 6;
        this.fireDelay = 40;
        this.fireStopwatch = 0;
        
        // Health Bar Variable
        this.healthBarWidth = this.w * 0.9;
        this.healthBarHeight = this.h * 0.1;
        this.healthBarX = this.bodyX + this.bodyW / 2 - this.healthBarWidth / 2;
        this.healthBarY = this.bodyY + this.h + 1;
    }
    
    // Draw Method
    draw(ctx){
        
        // Draw Bullet Image
        bullets.forEach((bullet) => {
            
            ctx.drawImage(
                images[imgP + "Normal_Rocket.png"],
                bullet.x,
                bullet.y,
                bullet.w,
                bullet.h
            );
        });
        
        // Draw Left Wing
        ctx.drawImage(
            images[imgP + "Plane_Wing_L.png"],
            this.wingL_X,
            this.wing_Y,
            this.wing_W,
            this.wing_H
        ); 
        
        // Draw Right Wing
        ctx.drawImage(
            images[imgP + "Plane_Wing_R.png"],
            this.wingR_X,
            this.wing_Y,
            this.wing_W,
            this.wing_H
        );
        
        // Draw Left Gun
        ctx.drawImage(
            images[imgP + "Plane_Gun_L.png"],
            this.gunsL_X,
            this.guns_Y,
            this.guns_W,
            this.guns_H
        );
        
        // Draw Right Gun
        ctx.drawImage(
            images[imgP + "Plane_Gun_R.png"],
            this.gunsR_X,
            this.guns_Y,
            this.guns_W,
            this.guns_H
        );
        
        // Draw Player Body
        ctx.drawImage(
            images[imgP + "Plane_Body.png"],
            this.bodyX,
            this.bodyY,
            this.bodyW,
            this.bodyH
        );
        
        // Draw Border
        ctx.strokeStyle = "white";
        ctx.strokeRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight);
        
        // Draw Health Bar Background
        ctx.fillStyle = "black";
        ctx.fillRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight);
        
        // Draw Health Bar
        if (health >= 0 && health <= maxHealth){
            
            ctx.fillStyle = "green";
            ctx.fillRect(this.healthBarX, this.healthBarY, this.healthBarWidth * health * (1 / maxHealth), this.healthBarHeight);
        }
    }
    
    // Update Player Method
    update(event){
        
        // Prevent Screen from Scrolling
        event.preventDefault();
        
        // Take Target X Position
        this.bodyX = event.clientX - this.bodyW / 2;
    }
    
    // Update Bullet Method
    updateBullet(){
        
        // For Each Bullet
        bullets.forEach((bullet, bulletIndex) => {
        
            // Move Bullet
            bullet.y -= bullet.speed * game_speed;
            
            // Auto Destroy
            if (bullet.y < lable_bg_height){
                
                bullets.splice(bulletIndex, 1)
            }
        });
    }
    
    // Move Player Position
    move(){
        
        // Preventing Player from going outside the Window
        if (this.bodyX - this.wing_W - this.guns_W <= 0){
            this.bodyX = this.wing_W + this.guns_W;
        }if (this.bodyX + this.bodyW + this.wing_W + this.guns_W >= width){
            this.bodyX = width - this.bodyW - this.wing_W - this.guns_W;
        }
        
        // Preventing Health Bar from going Outside
        if (this.healthBarX <= 0){
            this.healthBarX = 0;
        }if (this.healthBarX >= width - this.healthBarWidth){
            this.healthBarX = width - this.healthBarWidth;
        }
        
        // Update Health Bar
        this.healthBarX = this.bodyX + this.bodyW / 2 - this.healthBarWidth / 2;
        
        // Update Wings
        this.wingL_X = this.bodyX - this.guns_W - this.wing_W + this.WAG;
        this.wingR_X = this.bodyX + this.guns_W + this.bodyW - this.WAG;
        
        // Update Guns
        this.gunsL_X = this.bodyX - this.guns_W + this.GAG;
        this.gunsR_X = this.bodyX + this.bodyW - this.GAG;
    }
    
    // Update Method
    shoot(){
        
        // Start Stopwatch
        this.fireStopwatch += 1;
        
        // Apply Condition
        if (this.fireStopwatch >= this.fireDelay / game_speed){
            
            bullets.push({
                
                x: this.bodyX + this.bodyW / 2 - this.bullet_w / 2,
                y: this.bodyY - this.bullet_h / 2,
                w: this.bullet_w,
                h: this.bullet_h,
                speed: this.bullet_speed,
            });
            
            // Reset Stopwatch
            this.fireStopwatch = 0;
        }
    }
}

// Enemy Class
class Enemy{
    
    // Constructor
    constructor(){
        
        // Size and Position
        this.h = height * 0.11;
        this.w = this.h;
        this.y = - this.h - 10;
         
        // Variables
        this.maxEnemy = 2;
        this.spawnTime = 50;
        this.stopwatch = 0;
        this.speed = 5;
        
        // Body Image Variable
        this.bodyY = this.y;
        this.bodyH = this.h;
        this.bodyW = this.w * 0.2;
        
        // Guns Variables
        this.GAG = this.w * 0.0; // Guns Adjustment Gap
        this.guns_W = this.w * 0.1;
        this.guns_H = this.h * 0.8;
        this.guns_Y = this.bodyY + this.bodyH * 0.0;
        this.gunsL_X = this.bodyX - this.guns_W + this.GAG;
        this.gunsR_X = this.bodyX + this.bodyW - this.GAG;
        
        // Wings Variables
        this.WAG = this.w * 0; // Wings Adjustment Gap
        this.wing_W = this.w * 0.25;
        this.wing_H = this.h * 0.3;
        this.wing_Y = this.bodyY - this.wing_H + this.bodyH * 0.5;
        this.wingL_X = this.bodyX - this.guns_W - this.wing_W + this.WAG;
        this.wingR_X = this.bodyX + this.guns_W + this.bodyW - this.WAG;
    }
    
    // Draw Method
    draw(ctx){
        
        // Enemy Loop
        enemies.forEach((enemy) => {
            
            // Body
            ctx.drawImage(
                
                images[imgP + "Enemy_Plane_Body.png"],
                enemy.bodyX,
                enemy.bodyY,
                enemy.bodyW,
                enemy.bodyH
            );
            
            // Left Wing
            ctx.drawImage(
                
                images[imgP + "Enemy_Plane_Wing_L.png"],
                enemy.wingL_X,
                enemy.wing_Y,
                enemy.wing_W,
                enemy.wing_H
            );
            
            // Right Wing
            ctx.drawImage(
                
                images[imgP + "Enemy_Plane_Wing_R.png"],
                enemy.wingR_X,
                enemy.wing_Y,
                enemy.wing_W,
                enemy.wing_H
            );
            
            // Left Gun
            ctx.drawImage(
                
                images[imgP + "Enemy_Plane_Gun_L.png"],
                enemy.gunL_X,
                enemy.gun_Y,
                enemy.gun_W,
                enemy.gun_H
            );
            
            // Right Gun
            ctx.drawImage(
                
                images[imgP + "Enemy_Plane_Gun_R.png"],
                enemy.gunR_X,
                enemy.gun_Y,
                enemy.gun_W,
                enemy.gun_H
            );
        });
    }
    
    // Spawn Enemies Method
    spawn(){
        
        // Start Stopwatch
        this.stopwatch += 1;
        
        // Apply Condition
        if (this.stopwatch >= this.spawnTime / game_speed){
            
            // Random X
            this.x = Math.random() * (width - this.guns_W - this.wing_W);
           
            // Keep X inside screen
            if (this.x - this.guns_W - this.wing_W <= 0){
                this.x = this.guns_W + this.wing_W
            }
            if (this.x + this.bodyW + this.guns_W + this.wing_W >= width){
                this.x = width - this.guns_W - this.wing_W
            }
            
            // Max Enemy Codition
            if (enemies.length < this.maxEnemy){
                
                // Make Enemy
                enemies.push({
                    
                    // Abilities
                    speed: this.speed,
                    
                    // Body 
                    bodyX: this.x,
                    bodyY: this.bodyY,
                    bodyW: this.bodyW,
                    bodyH: this.bodyH,
                    
                    // Wings
                    wing_W: this.wing_W,
                    wing_H: this.wing_H,
                    wing_Y: this.wing_Y,
                    wingL_X: this.x - this.wing_W - this.guns_W,
                    wingR_X: this.x + this.guns_W + this.bodyW,
                    
                    // Guns
                    gun_W: this.guns_W,
                    gun_H: this.guns_H,
                    gun_Y: this.guns_Y,
                    gunL_X: this.x - this.guns_W,
                    gunR_X: this.x + this.bodyW
                    
                });
            }
            
            // Reset Stopwatch
            this.stopwatch = 0;
        }
    }
    
    // Update Enemies Method
    update(){
        
        // Enemies Loop
        enemies.forEach((enemy, enemyIndex) => {
            
            // Move Enemies
            enemy.bodyY += enemy.speed * game_speed;
            enemy.gun_Y += enemy.speed * game_speed;
            enemy.wing_Y += enemy.speed * game_speed;
            
            // Auto Destroy
            if (enemy.bodyY > height - enemy.bodyH / 3){
                
                enemies.splice(enemyIndex, 1);
                health -= 1;
            }
        });
    }
}

// Make Objects
let player = new Player();
let enemy = new Enemy();

// Buttons Variables
let btnH = height * 0.08;
let btnW = btnH * 3;
let btnX = width / 2 - btnW / 2;
let btnY = height / 2 - btnH / 2;

// Make Buttons
let retryBtn = new Button(btnX, btnY, btnW, btnH, "#ffffff", "#c8c8c8", "#000000");
let playPauseBtn = new Button(width / 2 - lable_width / 2, lable_y, lable_width, lable_height, "#ffffff", "#c8c8c8", "#000000");

// Check Pointer Whether Down
canvas.addEventListener("pointerdown", () => {
    
    touched = true;
})

// Check Pointer Whether Up
canvas.addEventListener("pointerup", () => {
    
    touched = false;
})

// Add Event Listners
canvas.addEventListener("pointermove", (event) => {
    
    // Apply Condition
    if (touched && game_speed != 0){
        
        player.update(event);
    }
});

// Add Play Pause Effect
playPauseBtn.handleEvent(() => {
            
    if (game_speed != 0){
        tempGameSpeed = game_speed;
        game_speed = 0;
        document.getElementById("buttons").style.display = "flex";
    }else if(game_speed === 0){
        game_speed = tempGameSpeed;
        document.getElementById("buttons").style.display = "none";
    }
});

// Add Functionality to Retry Button
retryBtn.handleEvent(() => {
    
    if (runningState === gameOver){
        resetGame();
    }
});

// Check Enemy Collde Function
function checkEnemyCollide(rect_x, rect_y, rect_w, rect_h){
    
    // For Each Enemy
    for (let index = 0; index < enemies.length; index++){
        
        let enemy = enemies[index];
        
        if (
            // Body Collide System
            checkCollide(enemy.bodyX, enemy.bodyY, enemy.bodyW, enemy.bodyH, rect_x, rect_y, rect_w, rect_h) ||
            
            // Left Gun Collide System
            checkCollide(enemy.gunL_X, enemy.gun_Y, enemy.gun_W, enemy.gun_H, rect_x, rect_y, rect_w, rect_h) ||
            
            // Right Gun Collide System
            checkCollide(enemy.gunR_X, enemy.gun_Y, enemy.gun_W, enemy.gun_H, rect_x, rect_y, rect_w, rect_h) ||
            
            // Left Wing Collide System
            checkCollide(enemy.wingL_X, enemy.wing_Y, enemy.wing_W, enemy.wing_H, rect_x, rect_y, rect_w, rect_h) ||
            
            // Right Wing Collide System
            checkCollide(enemy.wingR_X, enemy.wing_Y, enemy.wing_W, enemy.wing_H, rect_x, rect_y, rect_w, rect_h)
        ){
            return index;
        }
    }
    return -1;
}

// Check Player & Enemy Collide
function checkPlayerEnemyCollide(){

    let collideIndex;

    collideIndex = checkEnemyCollide(
        player.bodyX,
        player.bodyY,
        player.bodyW,
        player.bodyH
    );

    if (collideIndex != -1) return collideIndex;

    collideIndex = checkEnemyCollide(
        player.gunsL_X,
        player.guns_Y,
        player.guns_W,
        player.guns_H
    );

    if (collideIndex != -1) return collideIndex;

    collideIndex = checkEnemyCollide(
        player.gunsR_X,
        player.guns_Y,
        player.guns_W,
        player.guns_H
    );

    if (collideIndex != -1) return collideIndex;

    collideIndex = checkEnemyCollide(
        player.wingL_X,
        player.wing_Y,
        player.wing_W,
        player.wing_H
    );

    if (collideIndex != -1) return collideIndex;

    collideIndex = checkEnemyCollide(
        player.wingR_X,
        player.wing_Y,
        player.wing_W,
        player.wing_H
    );

    if (collideIndex != -1) return collideIndex;

    return -1;
}

// Bullet Enemy Collide function
function checkBulletEnemyCollide(){
    
    for(let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex--){
    
        let bullet = bullets[bulletIndex];
        
        let enemyIndex = checkEnemyCollide(bullet.x, bullet.y, bullet.w, bullet.h);
            
        if(enemyIndex != -1){
        
            score += 1;
            bullets.splice(bulletIndex, 1);
            enemies.splice(enemyIndex, 1);
        }
    }
}

// Master Collide Function
function masterCollide(){
    
    let playerCollideIndex = checkPlayerEnemyCollide();
        
    if (playerCollideIndex != -1){
            
        health -= 1;
        enemies.splice(playerCollideIndex, 1);
    }
    
    checkBulletEnemyCollide();
}

// Check Death Funcion
function checkDeath(){
    
    // If health Empty
    if (health <= 0){
        
        // Background Rect Variable
        const bgRectWidth = width * 0.8;
        const bgRectHeight = height * 0.4;
        const bgRectX = width / 2 - bgRectWidth / 2;
        const bgRectY = height / 2 - bgRectHeight /2;
        
        // Draw Backgroung Rect Border
        ctx.fillStyle = "white";
        ctx.fillRect(bgRectX, bgRectY, bgRectWidth, bgRectHeight);
        
        // Draw Background Rect
        ctx.fillStyle = "#4077ff";
        ctx.fillRect(bgRectX, bgRectY, bgRectWidth, bgRectHeight);
    }
}

// Reset Game Function
function resetGame(){
    
    health = 10;
    score = 0;
    game_speed = 1;
    player.fireDelay = 40;
    runningState = game;
    enemies = [];
    bullets = [];
}

// Game Over Screen
function gameOverScreen(){
    
    // Heading
    ctx.fillStyle = "white";
    ctx.font = "40px mtf";
    ctx.textAlign = "center"
    ctx.textBaseLine = "middle";
    ctx.fillText("Game Over",
                 width / 2,
                 height * 0.2);
    
    // Draw Score
    ctx.fillStyle = "white";
    ctx.font = "30px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseLine = "middle";
    ctx.fillText(
        "Score: " + score,
        width / 2,
        btnY - btnH
    );
    
    // Draw Buttons
    retryBtn.draw("Retry");    
}

// Update Method Apply
function update(){
    
    // Methods of Objects
    if (health > 0){
        
        // Player Methods
        player.updateBullet();
        player.move();
        player.shoot();
        
        // Enemy Methods
        enemy.spawn();
        enemy.update();
    
        // Standalone Function
        masterCollide();
        //checkDeath();
        
        // Variables
        updateVariables();
        
        // Speed Increasement
        if (game_speed < 1.5 && game_speed != 0){
        
            game_speed += 0.0001;
            player.fireDelay -= 0.0003;
        }
    }
}

// Draw Methods Apply
function draw(ctx){
    
    // Draw Objects
    if (health > 0){
        
        enemy.draw(ctx);
        player.draw(ctx);
        
        // Upper Lable Background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, lable_bg_height);
        
        // Draw Score Lable Background
        ctx.fillStyle = "white";
        ctx.fillRect(score_lable_x, lable_y, lable_width, lable_height);
        
        // Draw Text
        ctx.fillStyle = "black";
        ctx.font = "20px arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            "Score: " + score,
            score_lable_x + lable_width / 2,
            lable_y + lable_height / 2
        );
        
        // Draw Health Lable Background
        ctx.fillStyle = "white";
        ctx.fillRect(health_lable_x, lable_y, lable_width, lable_height);
        
        // Draw Health Lable Text
        ctx.fillStyle = "black";
        ctx.font = "20px arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            "Health: " + health,
            health_lable_x + lable_width / 2,
            lable_y + lable_height / 2
        );
        
        // Play Pause Btn Variable
        if (game_speed == 0){
            playPauseBtnTxt = "Play";
        }else{
            playPauseBtnTxt = "Pause";
        }
        
        // Draw Buttons
        playPauseBtn.draw(playPauseBtnTxt);
    }
    
    if (health <= 0){
        runningState = gameOver;
    }
}

// Start Function
function gameloop() {
    
    // Remove Old Rect
    ctx.clearRect(0, 0, width, height);
    
    // Check for Game
    if (runningState === game){
    
        // Call Functions
        update();
        draw(ctx);
    }
    
    // Check for Game Over
    if (runningState === gameOver){
        
        // Show Game Over Screen
        gameOverScreen()
    }
    
    // Make Frames
    requestAnimationFrame(gameloop);
}

// Update Loading UI function
function updateLoadingUI(progress){
    
    const bar = document.getElementById("progress");
    bar.style.width = (progress * 100) + "%";
}

// Loading Concept
function loading(callback){
    
    // Variables
    let loaded = 0;
    
    // Images to Load
    const imagesToLoad = [
    
        // Player Images
        imgP + "Plane_Body.png",
        imgP + "Plane_Wing_L.png",
        imgP + "Plane_Wing_R.png",
        imgP + "Plane_Gun_L.png",
        imgP + "Plane_Gun_R.png",
        
        // Enemy Images
        imgP + "Enemy_Plane_Body.png",
        imgP + "Enemy_Plane_Wing_L.png",
        imgP + "Enemy_Plane_Wing_R.png",
        imgP + "Enemy_Plane_Gun_L.png",
        imgP + "Enemy_Plane_Gun_R.png",
        
        // Bullets Images
        imgP + "Normal_Rocket.png"
    ];
    
    // For Each Image
    imagesToLoad.forEach(image => {
        
        // Make Images Object
        const img = new Image();
        
        // On Image Load
        img.onload = () => {
            
            // Update Loaded Value
            loaded++
            
            // Update Loading Screen Progress
            updateLoadingUI(loaded / imagesToLoad.length)
            
            // Check For Loaded Files
            if (loaded === imagesToLoad.length){
                
                // Callback
                document.getElementById("loadingScreen").style.display = "none";
                document.getElementById("game").style.display = "block";
                callback();
            }
        };
        
        // Keep Loaded Image
        img.src = image;
        images[image] = img;
    });
}

// Start Game
loading(() => {
    gameloop();
});
