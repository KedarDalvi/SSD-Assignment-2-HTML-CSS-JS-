import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';

// ==================== GAME CONFIG ====================
const CONFIG = {
    BALL_RADIUS: 0.18,
    PIN_HEIGHT: 0.38,
    PIN_SPACING: 0.3048,
    PIN_ROW_SPACING: 0.3048 * Math.sqrt(3) / 2,
    PIN_BASE_Z: 8,
    BALL_SPAWN_Z: -1,
    FOUL_LINE_Z: 0,
    PHYSICS_STEP: 1/120,
    BALL_MIN_SPEED: 5,
    BALL_MAX_SPEED: 20,
    LANE_SPACING: 2.2,
    TOTAL_LANES: 5
};

// ==================== GAME STATE ====================
let scene, camera, renderer, world;
let ball, pins = [];
let selectedLane = 3;
let controlMode = 'mouse';
let gameState = 'LANE_SELECT';
let currentFrame = 0;
let currentRoll = 0;
let frames = Array(10).fill(null).map(() => ({ rolls: [] }));
let aimAngle = 0;
let powerLevel = 0.5;
let isCharging = false;
let powerDirection = 1;
let ballThrown = false;
let waitingForSettle = false;
let pinsStandingAtStart = 0;

// ==================== INITIALIZATION ====================
function init() {
    initScene();
    initPhysics();
    initUI();
    animate();
}

function initScene() {
    const container = document.getElementById('canvas-container');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 3.8, -8);
    camera.lookAt(0, 1, CONFIG.PIN_BASE_Z);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);
    
    // Add point lights for atmosphere
    for (let i = 0; i < 3; i++) {
        const light = new THREE.PointLight(0xffffcc, 1.5, 20);
        light.position.set(-8 + (i * 8), 4, -3 + (i * 6));
        scene.add(light);
    }
    
    createEnvironment();
}

function createEnvironment() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    
    // Create all 5 lanes
    for (let i = 1; i <= CONFIG.TOTAL_LANES; i++) {
        const laneX = (i - 3) * CONFIG.LANE_SPACING;
        createLane(laneX, i);
    }
    
    // Walls
    createWalls();
}

function createLane(laneX, laneNumber) {
    const laneWidth = 1.8;
    const laneLength = 18;
    
    // Lane surface
    const laneGeometry = new THREE.PlaneGeometry(laneWidth, laneLength);
    const laneColors = [0xef4444, 0x10b981, 0x3b82f6, 0xf59e0b, 0x8b5cf6];
    const laneColor = laneColors[laneNumber - 1];
    const laneMaterial = new THREE.MeshLambertMaterial({ color: laneColor, transparent: true, opacity: 0.3 });
    const lane = new THREE.Mesh(laneGeometry, laneMaterial);
    lane.rotation.x = -Math.PI / 2;
    lane.position.set(laneX, 0.01, 2);
    scene.add(lane);
    
    // Foul line
    const foulLineGeometry = new THREE.PlaneGeometry(laneWidth, 0.08);
    const foulLineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const foulLine = new THREE.Mesh(foulLineGeometry, foulLineMaterial);
    foulLine.rotation.x = -Math.PI / 2;
    foulLine.position.set(laneX, 0.02, CONFIG.FOUL_LINE_Z);
    scene.add(foulLine);
    
    // Starting marker
    const markerGeometry = new THREE.RingGeometry(CONFIG.BALL_RADIUS + 0.02, CONFIG.BALL_RADIUS + 0.06, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.rotation.x = -Math.PI / 2;
    marker.position.set(laneX, 0.02, CONFIG.BALL_SPAWN_Z);
    scene.add(marker);
    
    // Gutters
    const gutterGeometry = new THREE.BoxGeometry(0.2, 0.1, laneLength);
    const gutterMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
    
    const leftGutter = new THREE.Mesh(gutterGeometry, gutterMaterial);
    leftGutter.position.set(laneX - laneWidth/2 - 0.1, 0.05, 2);
    scene.add(leftGutter);
    
    const rightGutter = new THREE.Mesh(gutterGeometry, gutterMaterial);
    rightGutter.position.set(laneX + laneWidth/2 + 0.1, 0.05, 2);
    scene.add(rightGutter);
}

function createWalls() {
    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(25, 10);
    const backWallMaterial = new THREE.MeshLambertMaterial({ color: 0x2d1810 });
    const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
    backWall.position.set(0, 5, 15);
    scene.add(backWall);
    
    // Side walls
    const sideWallGeometry = new THREE.PlaneGeometry(30, 10);
    const sideWallMaterial = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
    
    const leftWall = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-12, 5, 0);
    scene.add(leftWall);
    
    const rightWall = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(12, 5, 0);
    scene.add(rightWall);
}

function initPhysics() {
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    
    // Materials
    const ballMaterial = new CANNON.Material('ball');
    const pinMaterial = new CANNON.Material('pin');
    const groundMaterial = new CANNON.Material('ground');
    
    // Contact materials
    world.addContactMaterial(new CANNON.ContactMaterial(ballMaterial, pinMaterial, {
        friction: 0.1,
        restitution: 0.4
    }));
    
    world.addContactMaterial(new CANNON.ContactMaterial(ballMaterial, groundMaterial, {
        friction: 0.02,
        restitution: 0.3
    }));
    
    world.addContactMaterial(new CANNON.ContactMaterial(pinMaterial, groundMaterial, {
        friction: 0.8,
        restitution: 0.1
    }));
    
    // Ground
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(groundBody);
}

// ==================== GAME OBJECTS ====================
function createBall() {
    if (ball) {
        scene.remove(ball.mesh);
        world.removeBody(ball.body);
    }
    
    const laneX = (selectedLane - 3) * CONFIG.LANE_SPACING;
    
    // Physics
    const shape = new CANNON.Sphere(CONFIG.BALL_RADIUS);
    const body = new CANNON.Body({ mass: 5, material: new CANNON.Material('ball') });
    body.addShape(shape);
    body.position.set(laneX, CONFIG.BALL_RADIUS + 0.02, CONFIG.BALL_SPAWN_Z);
    world.addBody(body);
    
    // Visual
    const geometry = new THREE.SphereGeometry(CONFIG.BALL_RADIUS, 32, 32);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xff0000,
        metalness: 0.3,
        roughness: 0.5
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    ball = { body, mesh, thrown: false };
    ballThrown = false;
}

function createPins() {
    // Clear existing pins
    pins.forEach(pin => {
        scene.remove(pin.mesh);
        world.removeBody(pin.body);
    });
    pins = [];
    
    const laneX = (selectedLane - 3) * CONFIG.LANE_SPACING;
    const laneColors = [0xef4444, 0x10b981, 0x3b82f6, 0xf59e0b, 0x8b5cf6];
    const pinColor = laneColors[selectedLane - 1];
    
    // Create pins in triangle formation (1-2-3-4)
    for (let row = 0; row < 4; row++) {
        const pinsInRow = row + 1;
        for (let col = 0; col < pinsInRow; col++) {
            const x = laneX + (col - (pinsInRow - 1) / 2) * CONFIG.PIN_SPACING;
            const z = CONFIG.PIN_BASE_Z + row * CONFIG.PIN_ROW_SPACING;
            
            // Physics
            const shape = new CANNON.Cylinder(0.03, 0.06, CONFIG.PIN_HEIGHT, 8);
            const body = new CANNON.Body({ mass: 0.5, material: new CANNON.Material('pin') });
            body.addShape(shape);
            body.position.set(x, CONFIG.PIN_HEIGHT / 2, z);
            world.addBody(body);
            
            // Visual
            const geometry = new THREE.CylinderGeometry(0.03, 0.06, CONFIG.PIN_HEIGHT, 16);
            const material = new THREE.MeshStandardMaterial({ 
                color: pinColor,
                metalness: 0.2,
                roughness: 0.6
            });
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            
            pins.push({ body, mesh });
        }
    }
    
    pinsStandingAtStart = pins.length;
}

// ==================== GAME LOGIC ====================
function startGame() {
    gameState = 'READY';
    currentFrame = 0;
    currentRoll = 0;
    frames = Array(10).fill(null).map(() => ({ rolls: [] }));
    
    updateCameraForLane();
    createPins();
    createBall();
    updateUI();
    showNotification('Game Started! Bowl to begin.');
}

function throwBall() {
    if (gameState !== 'READY' || ball.thrown) return;

    const power = CONFIG.BALL_MIN_SPEED + (powerLevel * (CONFIG.BALL_MAX_SPEED - CONFIG.BALL_MIN_SPEED));
    // Always convert aimAngle to radians
    let angleRad;
    if (controlMode === 'mouse') {
        // Mouse mode: aimAngle is in range [-0.6, 0.6] (radians)
        angleRad = aimAngle;
    } else {
        // UI mode: aimAngle is in degrees
        angleRad = aimAngle * Math.PI / 180;
    }

    // Calculate direction: Z is forward, X is left/right
    const vx = -Math.sin(angleRad) * power;
    const vz = Math.cos(angleRad) * power;

    ball.body.velocity.set(vx, 0, vz);
    ball.body.angularVelocity.set(0, 0, -power * 2);
    ball.thrown = true;
    ballThrown = true;

    gameState = 'ROLLING';
    waitingForSettle = true;
    updateMessage('Ball rolling...');
}

function checkSettlement() {
    if (!waitingForSettle || !ball) return;
    
    const ballVel = ball.body.velocity.length();
    let maxPinVel = 0;
    
    pins.forEach(pin => {
        maxPinVel = Math.max(maxPinVel, pin.body.velocity.length());
    });
    
    const ballStopped = ballVel < 1.0;
    const pinsStopped = maxPinVel < 0.5;
    const ballPastPins = ball.body.position.z > CONFIG.PIN_BASE_Z + 2;
    
    if ((ballStopped && pinsStopped) || ballPastPins) {
        finishRoll();
    }
}

function finishRoll() {
    if (gameState !== 'ROLLING') return;
    
    gameState = 'SETTLING';
    
    const pinsNowStanding = countStandingPins();
    const pinsKnocked = pinsStandingAtStart - pinsNowStanding;
    
    // Record score
    frames[currentFrame].rolls.push(pinsKnocked);
    
    // Check for strike/spare
    const rollCount = frames[currentFrame].rolls.length;
    if (rollCount === 1 && pinsKnocked === 10) {
        showNotification('STRIKE!', 'strike');
    } else if (rollCount === 2 && frames[currentFrame].rolls[0] + pinsKnocked === 10) {
        showNotification('SPARE!', 'spare');
    } else if (pinsKnocked === 0) {
        showNotification('Gutter Ball!', 'gutter');
    }
    
    setupNextRoll();
}

function setupNextRoll() {
    const currentFrameData = frames[currentFrame];
    const rollCount = currentFrameData.rolls.length;
    const isTenthFrame = currentFrame === 9;
    
    if (!isTenthFrame) {
        if (rollCount === 1 && currentFrameData.rolls[0] === 10) {
            // Strike - next frame
            currentFrame++;
            currentRoll = 0;
            createPins();
        } else if (rollCount === 1) {
            // Second roll
            currentRoll = 1;
            removeKnockedPins();
        } else {
            // Frame complete
            currentFrame++;
            currentRoll = 0;
            createPins();
        }
    } else {
        // 10th frame logic
        if (rollCount === 1) {
            if (currentFrameData.rolls[0] === 10) {
                currentRoll = 1;
                createPins();
            } else {
                currentRoll = 1;
                removeKnockedPins();
            }
        } else if (rollCount === 2) {
            const total = currentFrameData.rolls[0] + currentFrameData.rolls[1];
            if (currentFrameData.rolls[0] === 10 || total === 10) {
                currentRoll = 2;
                createPins();
            } else {
                endGame();
                return;
            }
        } else {
            endGame();
            return;
        }
    }
    
    if (currentFrame >= 10) {
        endGame();
        return;
    }
    
    createBall();
    gameState = 'READY';
    waitingForSettle = false;
    updateUI();
}

function endGame() {
    gameState = 'COMPLETE';
    const finalScore = calculateTotalScore();
    showNotification(`Game Complete! Final Score: ${finalScore}`, 'strike');
    updateUI();
}

function removeKnockedPins() {
    pins = pins.filter(pin => {
        if (isPinDown(pin)) {
            scene.remove(pin.mesh);
            world.removeBody(pin.body);
            return false;
        }
        return true;
    });
    pinsStandingAtStart = pins.length;
}

function isPinDown(pin) {
    const pos = pin.body.position;
    const quat = pin.body.quaternion;
    
    const upVector = new THREE.Vector3(0, 1, 0);
    upVector.applyQuaternion(new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w));
    const tiltAngle = Math.acos(upVector.y) * (180 / Math.PI);
    
    return tiltAngle > 15 || pos.y < 0.1;
}

function countStandingPins() {
    return pins.filter(pin => !isPinDown(pin)).length;
}

function calculateTotalScore() {
    let total = 0;
    frames.forEach(frame => {
        frame.rolls.forEach(roll => total += roll);
    });
    return total;
}

function resetGame() {
    currentFrame = 0;
    currentRoll = 0;
    frames = Array(10).fill(null).map(() => ({ rolls: [] }));
    gameState = 'READY';
    createPins();
    createBall();
    updateUI();
    showNotification('Game Reset!');
}

function updateCameraForLane() {
    const laneX = (selectedLane - 3) * CONFIG.LANE_SPACING;
    camera.position.set(laneX, 3.8, -8);
    camera.lookAt(laneX, 1, CONFIG.PIN_BASE_Z);
}

// ==================== UI FUNCTIONS ====================
function initUI() {
    // Lane selection
    document.querySelectorAll('.lane-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lane-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedLane = parseInt(btn.dataset.lane);
        });
    });
    
    document.getElementById('startGameBtn').addEventListener('click', () => {
        document.getElementById('laneModal').classList.add('hidden');
        startGame();
    });
    
    // Control mode
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            controlMode = btn.dataset.mode;
            updateControlMode();
        });
    });
    
    // UI Controls
    document.getElementById('aimLeft').addEventListener('click', () => {
        aimAngle = Math.max(-60, aimAngle - 5);
        updateAimDisplay();
    });
    
    document.getElementById('aimRight').addEventListener('click', () => {
        aimAngle = Math.min(60, aimAngle + 5);
        updateAimDisplay();
    });
    
    document.getElementById('aimSlider').addEventListener('input', (e) => {
        aimAngle = parseFloat(e.target.value);
        updateAimDisplay();
    });
    
    document.getElementById('powerSlider').addEventListener('input', (e) => {
        powerLevel = parseFloat(e.target.value) / 100;
        document.getElementById('powerDisplay').textContent = `${e.target.value}%`;
    });
    
    document.getElementById('throwBtn').addEventListener('click', throwBall);
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('switchLaneBtn').addEventListener('click', () => {
        if (currentRoll === 0 && gameState === 'READY') {
            document.getElementById('laneModal').classList.remove('hidden');
        }
    });
    
    // Mouse controls
    window.addEventListener('mousemove', (e) => {
        if (controlMode === 'mouse' && gameState === 'READY') {
            const t = e.clientX / window.innerWidth;
            aimAngle = (t - 0.5) * 1.2;
        }
    });
    
    window.addEventListener('mousedown', () => {
        if (controlMode === 'mouse' && gameState === 'READY' && !ballThrown) {
            isCharging = true;
            document.getElementById('powerBarContainer').style.display = 'block';
        }
    });
    
    window.addEventListener('mouseup', () => {
        if (controlMode === 'mouse' && isCharging) {
            isCharging = false;
            document.getElementById('powerBarContainer').style.display = 'none';
            throwBall();
        }
    });
    
    // Window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function updateControlMode() {
    if (controlMode === 'mouse') {
        document.getElementById('aimSection').style.display = 'none';
        document.getElementById('powerSection').style.display = 'none';
        document.getElementById('mouseInstructions').style.display = 'block';
    } else {
        document.getElementById('aimSection').style.display = 'block';
        document.getElementById('powerSection').style.display = 'block';
        document.getElementById('mouseInstructions').style.display = 'none';
    }
}

function updateAimDisplay() {
    const aimDisplay = document.getElementById('aimDisplay');
    if (aimAngle < -10) {
        aimDisplay.textContent = `Left ${Math.abs(Math.round(aimAngle))}°`;
    } else if (aimAngle > 10) {
        aimDisplay.textContent = `Right ${Math.round(aimAngle)}°`;
    } else {
        aimDisplay.textContent = 'Center';
    }
    document.getElementById('aimSlider').value = aimAngle;
}

function updateUI() {
    document.getElementById('frameDisplay').textContent = currentFrame + 1;
    document.getElementById('rollDisplay').textContent = currentRoll + 1;
    document.getElementById('scoreDisplay').textContent = calculateTotalScore();
    document.getElementById('laneDisplay').textContent = selectedLane;
    
    updateScoreboard();
    
    // Update switch lane button
    const switchBtn = document.getElementById('switchLaneBtn');
    switchBtn.disabled = !(currentRoll === 0 && gameState === 'READY');
}

function updateScoreboard() {
    frames.forEach((frame, index) => {
        const frameElement = document.querySelector(`[data-frame="${index + 1}"]`);
        if (!frameElement) return;
        
        const rollsElement = frameElement.querySelector('.frame-rolls');
        const scoreElement = frameElement.querySelector('.frame-score');
        
        // Update rolls
        let rollsText = '';
        if (frame.rolls.length === 0) {
            rollsText = index === 9 ? '- - -' : '- -';
        } else {
            if (index < 9) {
                if (frame.rolls[0] === 10) {
                    rollsText = 'X';
                } else if (frame.rolls.length === 2 && frame.rolls[0] + frame.rolls[1] === 10) {
                    rollsText = `${frame.rolls[0]} /`;
                } else {
                    rollsText = frame.rolls.map(r => r || '-').join(' ');
                }
            } else {
                rollsText = frame.rolls.map((r, i) => {
                    if (r === 10) return 'X';
                    if (i > 0 && frame.rolls[i-1] + r === 10) return '/';
                    return r || '-';
                }).join(' ');
            }
        }
        rollsElement.textContent = rollsText;
        
        // Update score
        const frameScore = frame.rolls.reduce((sum, roll) => sum + roll, 0);
        scoreElement.textContent = frameScore;
        
        // Highlight active frame
        if (index === currentFrame) {
            frameElement.classList.add('active');
        } else {
            frameElement.classList.remove('active');
        }
    });
}

function updateMessage(msg) {
    document.getElementById('messageBox').textContent = msg;
}

function showNotification(message, type = '') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ==================== ANIMATION LOOP ====================
function animate() {
    requestAnimationFrame(animate);
    
    if (gameState !== 'LANE_SELECT') {
        world.step(CONFIG.PHYSICS_STEP);
        
        // Update ball
        if (ball && ball.mesh && ball.body) {
            ball.mesh.position.copy(ball.body.position);
            ball.mesh.quaternion.copy(ball.body.quaternion);
        }
        
        // Update pins
        pins.forEach(pin => {
            pin.mesh.position.copy(pin.body.position);
            pin.mesh.quaternion.copy(pin.body.quaternion);
        });
        
        // Power charging
        if (isCharging && controlMode === 'mouse') {
            powerLevel += powerDirection * 0.02;
            if (powerLevel >= 1) {
                powerLevel = 1;
                powerDirection = -1;
            } else if (powerLevel <= 0) {
                powerLevel = 0;
                powerDirection = 1;
            }
            document.getElementById('powerFill').style.width = (powerLevel * 100) + '%';
            document.getElementById('powerPercent').textContent = Math.round(powerLevel * 100) + '%';
        }
        
        checkSettlement();
        
        renderer.render(scene, camera);
    }
}

// ==================== START ====================
init();