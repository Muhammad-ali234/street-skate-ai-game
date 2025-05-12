// Game components (GDD Section 1.1)
let scene, camera, renderer, player, street, rail;
let obstacles = [];
let animationId;
let ambientSkaters = [];
let ramp1, ramp2;
let ollieTextMesh;

// Enhanced model loading and textures
let playerModel;
let skateboardModel;
let buildingModels = [];
let treeModels = [];
let textureLoader;
let skyboxTexture;

// Player state (GDD Section 2.1)
let playerState = {
    velocity: { x: 0, y: 0, z: 0 },
    speed: 0.1,
    jumpPower: 0.1,
    gravity: 0.005,
    onGround: true,
    grinding: false
};

// Game state (GDD Section 2.3)
let score = 0;
let gameOver = false;
let obstacleSpawnRate = 3000; // Milliseconds between obstacle spawns
let lastObstacleTime = 0;

// AI-controlled game events (GDD Section 2.4)
const aiEvents = [
    { name: "Rush Hour", obstacleFrequency: 2000 },
    { name: "Construction Zone", obstacleFrequency: 2500 },
    { name: "Sunday Morning", obstacleFrequency: 4000 },
    { name: "Street Festival", obstacleFrequency: 1800 }
];
let currentAIEvent = 0;

// Keyboard input (GDD Section 2.1)
let keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    shift: false,
    e: false
};

// Setup key event listeners
document.addEventListener('keydown', (e) => {
    // Prevent default behavior for game control keys
    if (['w', 'a', 's', 'd', ' ', 'e', 'r', 'm', 'shift'].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
    
    if (gameOver && e.key.toLowerCase() === 'r') {
        resetGame();
        return;
    }
    
    if (e.key.toLowerCase() === 'm') {
        toggleSound();
        return;
    }
    
    if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = true;
    }
    
    // Handle space key separately
    if (e.key === ' ') {
        keys.space = true;
    }
});

document.addEventListener('keyup', (e) => {
    // Prevent default behavior for game control keys
    if (['w', 'a', 's', 'd', ' ', 'e', 'r', 'm', 'shift'].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
    
    if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = false;
    }
    
    // Handle space key separately
    if (e.key === ' ') {
        keys.space = false;
    }
});

// Reset keys when window loses focus
window.addEventListener('blur', () => {
    // Reset all keys
    Object.keys(keys).forEach(key => {
        keys[key] = false;
    });
});

// Setup function (GDD Section 1.2)
function init() {
    // Create scene (GDD Section 4.1)
    scene = new THREE.Scene();
    
    // Create skybox for beautiful background
    createSkybox();
    
    // Create camera (GDD Section 4.2)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Create renderer with enhanced settings (GDD Section 4.3)
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    
    // Initialize texture loader
    textureLoader = new THREE.TextureLoader();
    
    // Initialize audio system (GDD Section 5.0 - Sound Design)
    initAudio();
    
    // Create enhanced city environment
    createEnvironment();
    
    // Load realistic models
    loadModels();
    
    // Create the ground with better texture
    createStreet();
    
    // Create skate park elements
    createSkateParkElements();
    
    // Create temporary player until model loads
    createTemporaryPlayer();
    
    // Position camera in third-person view (GDD Section 4.2)
    camera.position.set(0, 5, 10);
    camera.lookAt(new THREE.Vector3(0, 1, 0));
    
    // Enhanced lighting (GDD Section 4.5)
    setupLighting();
    
    // Add event listeners (GDD Section 2.1)
    setupControls();
    
    // Add window resize handler (GDD Section 3.3)
    window.addEventListener('resize', onWindowResize);
    
    // Initialize UI (GDD Section 2.2)
    updateScoreDisplay();
    
    // Start background music (GDD Section 5.0)
    if (backgroundMusic) {
        backgroundMusic.play();
    }
    
    // Add particle systems for visual effects
    setupParticleSystems();
    
    // Add interactive elements
    addInteractiveElements();
}

function loadTextureWithFallback(primaryUrl, fallbackUrl, callback) {
    const textureLoader = new THREE.TextureLoader();
    
    // Try to load primary texture
    textureLoader.load(
        primaryUrl,
        // Success
        function(texture) {
            if (callback) callback(texture);
        },
        // Progress
        undefined,
        // Error - try fallback
        function(err) {
            console.warn('Failed to load texture:', primaryUrl, err);
            console.log('Trying fallback texture...');
            
            // Try fallback
            textureLoader.load(
                fallbackUrl,
                // Success with fallback
                function(texture) {
                    if (callback) callback(texture);
                },
                undefined,
                // Complete failure
                function(err) {
                    console.error('Failed to load fallback texture:', fallbackUrl, err);
                    // Use a solid color as last resort
                    const canvas = document.createElement('canvas');
                    canvas.width = 128;
                    canvas.height = 128;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#888888';
                    ctx.fillRect(0, 0, 128, 128);
                    
                    const fallbackTexture = new THREE.CanvasTexture(canvas);
                    if (callback) callback(fallbackTexture);
                }
            );
        }
    );
}

// Create skybox with fallback
function createSkybox() {
    try {
        // Create a simple gradient skybox as the primary option
        // Fallback to a simple color if canvas isn't supported
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 2;
        
        const context = canvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, 0, 2);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(1, '#E0F6FF'); // Light blue
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 2, 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        scene.background = texture;
    } catch(e) {
        console.error('Failed to create skybox:', e);
        // Set a simple color as fallback
        scene.background = new THREE.Color(0x87CEEB);
    }
}

// Create enhanced city environment with buildings and trees
function createEnvironment() {
    // Add distant cityscape
    const cityGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cityMaterials = [
        new THREE.MeshStandardMaterial({ 
            color: 0x8B4513 // Brick color
        }),
        new THREE.MeshStandardMaterial({ 
            color: 0x808080 // Gray color
        }),
        new THREE.MeshStandardMaterial({ 
            color: 0x966F33 // Wood color
        })
    ];
    
    // Create buildings in the background
    for (let i = 0; i < 30; i++) {
        const height = 5 + Math.random() * 20;
        const width = 3 + Math.random() * 5;
        const depth = 3 + Math.random() * 5;
        
        const building = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            cityMaterials[Math.floor(Math.random() * cityMaterials.length)]
        );
        
        // Position buildings in the background
        const side = Math.random() > 0.5 ? 1 : -1;
        building.position.set(
            (side * (30 + Math.random() * 50)),
            height / 2,
            -30 - Math.random() * 50
        );
        
        building.castShadow = true;
        building.receiveShadow = true;
        scene.add(building);
        buildingModels.push(building);
    }
    
    // Create trees and vegetation
    const treeTexture = textureLoader.load('https://threejs.org/examples/textures/sprite0.png');
    
    for (let i = 0; i < 50; i++) {
        // Simple tree made of trunk and leaves
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        
        const leavesGeometry = new THREE.SphereGeometry(1, 16, 16);
        const leavesMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x00AA00,
            roughness: 0.8
        });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 1.5;
        
        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);
        
        // Position trees on the sides
        const side = Math.random() > 0.5 ? 1 : -1;
        tree.position.set(
            side * (20 + Math.random() * 30),
            0,
            -20 + Math.random() * 40
        );
        
        tree.scale.set(1 + Math.random() * 0.5, 1 + Math.random() * 1, 1 + Math.random() * 0.5);
        tree.castShadow = true;
        scene.add(tree);
        treeModels.push(tree);
    }
}

// Create procedural texture using canvas
function createCanvasTexture(width, height, drawFunction) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    
    // Call the provided drawing function
    drawFunction(context, width, height);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// Create street with better textures
function createStreet() {
    // Create street with texture
    const streetGeometry = new THREE.PlaneGeometry(100, 20);
    const streetMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080, // Default gray color
        roughness: 0.8,
        metalness: 0.2
    });
    
    // Create procedural asphalt texture
    const streetTexture = createCanvasTexture(256, 256, (ctx, width, height) => {
        // Base dark gray
        ctx.fillStyle = '#555555';
        ctx.fillRect(0, 0, width, height);
        
        // Add noise for asphalt texture
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 1 + 0.5;
            const color = Math.random() > 0.5 ? '#444444' : '#666666';
            
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    streetTexture.repeat.set(10, 2);
    streetMaterial.map = streetTexture;
    streetMaterial.needsUpdate = true;
    
    // Create sidewalks
    const sidewalkGeometry = new THREE.PlaneGeometry(100, 5);
    const sidewalkMaterial = new THREE.MeshStandardMaterial({
        color: 0xCCCCCC, // Default light gray color
        roughness: 0.7,
        metalness: 0.1
    });
    
    // Create procedural concrete texture
    const sidewalkTexture = createCanvasTexture(256, 256, (ctx, width, height) => {
        // Base light gray
        ctx.fillStyle = '#CCCCCC';
        ctx.fillRect(0, 0, width, height);
        
        // Add grid pattern for sidewalk tiles
        ctx.strokeStyle = '#AAAAAA';
        ctx.lineWidth = 2;
        
        for (let x = 0; x <= width; x += width/4) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= height; y += height/4) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Add some noise
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 1 + 0.2;
            const color = Math.random() > 0.5 ? '#BBBBBB' : '#DDDDDD';
            
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    sidewalkTexture.repeat.set(20, 1);
    sidewalkMaterial.map = sidewalkTexture;
    sidewalkMaterial.needsUpdate = true;
    
    // Create street/ground
    const street = new THREE.Mesh(streetGeometry, streetMaterial);
    street.rotation.x = -Math.PI / 2;
    street.receiveShadow = true;
    scene.add(street);
    
    // Create sidewalks
    const leftSidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    leftSidewalk.rotation.x = -Math.PI / 2;
    leftSidewalk.position.set(0, 0.1, -12.5);
    leftSidewalk.receiveShadow = true;
    scene.add(leftSidewalk);
    
    const rightSidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    rightSidewalk.rotation.x = -Math.PI / 2;
    rightSidewalk.position.set(0, 0.1, 12.5);
    rightSidewalk.receiveShadow = true;
    scene.add(rightSidewalk);
    
    // Add road markings
    const lineGeometry = new THREE.PlaneGeometry(80, 0.3);
    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.y = 0.01;
    scene.add(centerLine);
    
    // Add street decorations
    addStreetDecorations();
}

// Add street decorations
function addStreetDecorations() {
    // Add trash cans
    const trashCanGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 16);
    const trashCanMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    
    for (let i = 0; i < 10; i++) {
        const trashCan = new THREE.Mesh(trashCanGeometry, trashCanMaterial);
        trashCan.position.set(
            -40 + i * 10,
            0.5,
            -9 + Math.random() * 2
        );
        trashCan.castShadow = true;
        trashCan.receiveShadow = true;
        scene.add(trashCan);
    }
    
    // Add benches
    const benchSeatGeometry = new THREE.BoxGeometry(2, 0.1, 0.7);
    const benchLegGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.7);
    const benchMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8 
    });
    
    for (let i = 0; i < 5; i++) {
        const benchGroup = new THREE.Group();
        
        const benchSeat = new THREE.Mesh(benchSeatGeometry, benchMaterial);
        benchSeat.position.y = 0.5;
        
        const benchLeg1 = new THREE.Mesh(benchLegGeometry, benchMaterial);
        benchLeg1.position.set(-0.8, 0.25, 0);
        
        const benchLeg2 = new THREE.Mesh(benchLegGeometry, benchMaterial);
        benchLeg2.position.set(0.8, 0.25, 0);
        
        benchGroup.add(benchSeat);
        benchGroup.add(benchLeg1);
        benchGroup.add(benchLeg2);
        
        benchGroup.position.set(
            -30 + i * 15,
            0,
            -9.5
        );
        
        benchGroup.castShadow = true;
        benchGroup.receiveShadow = true;
        scene.add(benchGroup);
    }
}

// Create enhanced skate park elements
function createSkateParkElements() {
    // Create concrete texture for skate park elements
    const concreteMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.7,
        metalness: 0.2
    });
    
    // Create procedural concrete texture for skate elements
    const concreteTexture = createCanvasTexture(256, 256, (ctx, width, height) => {
        // Base concrete color
        ctx.fillStyle = '#888888';
        ctx.fillRect(0, 0, width, height);
        
        // Add speckled pattern for concrete
        ctx.fillStyle = '#777777';
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 1.5 + 0.5;
            
            ctx.fillRect(x, y, size, size);
        }
        
        // Add some cracks
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 20; i++) {
            const x1 = Math.random() * width;
            const y1 = Math.random() * height;
            const length = Math.random() * 30 + 10;
            const angle = Math.random() * Math.PI * 2;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(
                x1 + Math.cos(angle) * length, 
                y1 + Math.sin(angle) * length
            );
            ctx.stroke();
        }
    });
    
    concreteTexture.repeat.set(2, 2);
    concreteMaterial.map = concreteTexture;
    concreteMaterial.needsUpdate = true;
    
    // Create halfpipe
    const halfpipeCurve = new THREE.Shape();
    halfpipeCurve.moveTo(-5, 0);
    halfpipeCurve.quadraticCurveTo(0, 4, 5, 0);
    
    const extrudeSettings = {
        steps: 30,
        depth: 5,
        bevelEnabled: false
    };
    
    const halfpipeGeometry = new THREE.ExtrudeGeometry(halfpipeCurve, extrudeSettings);
    const halfpipe = new THREE.Mesh(halfpipeGeometry, concreteMaterial);
    halfpipe.position.set(-20, 0, 0);
    halfpipe.rotation.x = -Math.PI / 2;
    halfpipe.rotation.z = Math.PI;
    halfpipe.castShadow = true;
    halfpipe.receiveShadow = true;
    scene.add(halfpipe);
    
    // Create skate ramps
    const rampGeometry = new THREE.BoxGeometry(10, 2, 5);
    ramp1 = new THREE.Mesh(rampGeometry, concreteMaterial);
    ramp1.position.set(-15, 1, -5);
    ramp1.rotation.z = Math.PI / 12;
    ramp1.castShadow = true;
    ramp1.receiveShadow = true;
    scene.add(ramp1);
    
    ramp2 = new THREE.Mesh(rampGeometry, concreteMaterial);
    ramp2.position.set(15, 1, 5);
    ramp2.rotation.z = -Math.PI / 12;
    ramp2.castShadow = true;
    ramp2.receiveShadow = true;
    scene.add(ramp2);
    
    // Create funbox
    const funboxGeometry = new THREE.BoxGeometry(8, 1, 5);
    const funbox = new THREE.Mesh(funboxGeometry, concreteMaterial);
    funbox.position.set(5, 0.5, -5);
    funbox.castShadow = true;
    funbox.receiveShadow = true;
    scene.add(funbox);
    
    // Create grind rails
    const railGeometry = new THREE.CylinderGeometry(0.1, 0.1, 10, 16);
    const railMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xCCCCCC,
        metalness: 0.7,
        roughness: 0.3
    });
    rail = new THREE.Mesh(railGeometry, railMaterial);
    rail.rotation.z = Math.PI / 2;
    rail.position.set(0, 1, 0);
    rail.castShadow = true;
    scene.add(rail);
    
    // Create additional rails
    const rail2 = new THREE.Mesh(railGeometry, railMaterial);
    rail2.rotation.z = Math.PI / 2;
    rail2.position.set(-10, 1, 5);
    rail2.castShadow = true;
    scene.add(rail2);
}

// Load realistic models using Three.js loaders
function loadModels() {
    // Load skateboard model
    loadSkateboardModel();
    
    // Load skater models for ambient characters
    loadAmbientSkaters();
}

// Load and setup skateboard model for player
function loadSkateboardModel() {
    const tempPlayerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const tempPlayerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    player = new THREE.Mesh(tempPlayerGeometry, tempPlayerMaterial);
    player.position.set(0, 1, 0);
    player.castShadow = true;
    scene.add(player);
    
    // Simulating model loading
    setTimeout(() => {
        // Create a more detailed player/skateboard model
        createDetailedPlayerModel();
    }, 1000);
}

// Create a more detailed player model
function createDetailedPlayerModel() {
    // Remove temporary player
    scene.remove(player);
    
    // Create skateboard group
    const skateboardGroup = new THREE.Group();
    
    // Create skateboard deck
    const deckGeometry = new THREE.BoxGeometry(1.8, 0.1, 0.6);
    const deckMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.7
    });
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    skateboardGroup.add(deck);
    
    // Create wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.5,
        roughness: 0.7
    });
    
    const wheelPositions = [
        {x: -0.7, y: -0.15, z: 0.25},
        {x: 0.7, y: -0.15, z: 0.25},
        {x: -0.7, y: -0.15, z: -0.25},
        {x: 0.7, y: -0.15, z: -0.25}
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(pos.x, pos.y, pos.z);
        wheel.rotation.z = Math.PI / 2;
        skateboardGroup.add(wheel);
    });
    
    // Create trucks
    const truckGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.6);
    const truckMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.8,
        roughness: 0.2
    });
    
    const frontTruck = new THREE.Mesh(truckGeometry, truckMaterial);
    frontTruck.position.set(0.7, -0.1, 0);
    skateboardGroup.add(frontTruck);
    
    const backTruck = new THREE.Mesh(truckGeometry, truckMaterial);
    backTruck.position.set(-0.7, -0.1, 0);
    skateboardGroup.add(backTruck);
    
    // Create skater character
    const skaterGroup = new THREE.Group();
    
    // Body
    const torsoGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x0000FF, // Blue shirt
        roughness: 0.8
    });
    const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
    torso.position.y = 0.4;
    skaterGroup.add(torso);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700, // Skin tone
        roughness: 0.5
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1;
    skaterGroup.add(head);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 16);
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333, // Dark pants
        roughness: 0.8
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.15, -0.2, 0);
    skaterGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.15, -0.2, 0);
    skaterGroup.add(rightLeg);
    
    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);
    
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.4, 0.3, 0);
    leftArm.rotation.z = Math.PI / 4;
    skaterGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.4, 0.3, 0);
    rightArm.rotation.z = -Math.PI / 4;
    skaterGroup.add(rightArm);
    
    // Combine skater and skateboard
    const playerGroup = new THREE.Group();
    skaterGroup.position.y = 0.15;
    playerGroup.add(skateboardGroup);
    playerGroup.add(skaterGroup);
    
    // Position the player
    playerGroup.position.set(0, 1, 0);
    playerGroup.castShadow = true;
    
    // Set player to our new group
    player = playerGroup;
    scene.add(player);
}

// Create temporary player until model loads
function createTemporaryPlayer() {
    const tempPlayerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const tempPlayerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    player = new THREE.Mesh(tempPlayerGeometry, tempPlayerMaterial);
    player.position.set(0, 1, 0);
    player.castShadow = true;
    scene.add(player);
}

// Load ambient skater models
function loadAmbientSkaters() {
    const skaterPositions = [
        { x: -20, y: 1, z: -5 },
        { x: 20, y: 1, z: 5 },
        { x: -10, y: 1, z: 8 },
        { x: 10, y: 1, z: -8 }
    ];
    
    skaterPositions.forEach(pos => {
        // Create skater group
        const ambientSkaterGroup = new THREE.Group();
        
        // Create simplified ambient skater
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: Math.random() * 0xFFFFFF, // Random color shirts
            roughness: 0.8
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        ambientSkaterGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700, // Skin tone
            roughness: 0.5
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.6;
        ambientSkaterGroup.add(head);
        
        // Create simplified skateboard
        const skateboardGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.5);
        const skateboardMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.7 
        });
        const skateboard = new THREE.Mesh(skateboardGeometry, skateboardMaterial);
        skateboard.position.y = -0.55;
        ambientSkaterGroup.add(skateboard);
        
        // Position the skater
        ambientSkaterGroup.position.set(pos.x, pos.y, pos.z);
        ambientSkaterGroup.castShadow = true;
        ambientSkaterGroup.receiveShadow = true;
        
        // Add to scene and ambient skaters array
        scene.add(ambientSkaterGroup);
        ambientSkaters.push(ambientSkaterGroup);
    });
}

// Setup enhanced lighting
function setupLighting() {
    // Remove previous lights
    scene.children.forEach(child => {
        if (child instanceof THREE.AmbientLight || 
            child instanceof THREE.DirectionalLight ||
            child instanceof THREE.HemisphereLight ||
            child instanceof THREE.PointLight) {
            scene.remove(child);
        }
    });
    
    // Add hemisphere light (sky and ground colors)
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x404040, 0.6);
    scene.add(hemisphereLight);
    
    // Add sun-like directional light with shadows
    const sunLight = new THREE.DirectionalLight(0xffffcc, 0.8);
    sunLight.position.set(50, 50, 50);
    sunLight.castShadow = true;
    
    // Improve shadow quality
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);
    
    // Add point lights for street lamps
    for (let i = 0; i < 5; i++) {
        const lampLight = new THREE.PointLight(0xffaa00, 1, 20, 2);
        lampLight.position.set(-40 + i * 20, 5, -8);
        lampLight.castShadow = true;
        lampLight.shadow.mapSize.width = 512;
        lampLight.shadow.mapSize.height = 512;
        scene.add(lampLight);

                // Add lamp post model
                const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
                const postMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
                const post = new THREE.Mesh(postGeometry, postMaterial);
                post.position.set(-40 + i * 20, 2.5, -8);
                post.castShadow = true;
                scene.add(post);
                
                const lampGeometry = new THREE.SphereGeometry(0.3, 16, 16);
                const lampMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0xffaa00,
                    emissive: 0xffaa00,
                    emissiveIntensity: 0.5
                });
                const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
                lamp.position.set(-40 + i * 20, 5, -8);
                scene.add(lamp);
            }
            
            // Add ambient light for base illumination
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
            scene.add(ambientLight);
        }
        
        // Setup particle systems for visual effects
        let jumpParticles, grindParticles, ollieParticles;
        function setupParticleSystems() {
            // Jump particles
            const jumpParticleCount = 20;
            const jumpParticleGeometry = new THREE.BufferGeometry();
            const jumpParticlePositions = new Float32Array(jumpParticleCount * 3);
            
            for (let i = 0; i < jumpParticleCount; i++) {
                jumpParticlePositions[i * 3] = 0;
                jumpParticlePositions[i * 3 + 1] = 0; 
                jumpParticlePositions[i * 3 + 2] = 0;
            }
            
            jumpParticleGeometry.setAttribute('position', new THREE.BufferAttribute(jumpParticlePositions, 3));
            
            const jumpParticleMaterial = new THREE.PointsMaterial({
                color: 0xFFFFFF,
                size: 0.1,
                transparent: true,
                opacity: 0.8
            });
            
            jumpParticles = new THREE.Points(jumpParticleGeometry, jumpParticleMaterial);
            jumpParticles.visible = false;
            scene.add(jumpParticles);
            
            // Grind particles (sparks)
            const grindParticleCount = 30;
            const grindParticleGeometry = new THREE.BufferGeometry();
            const grindParticlePositions = new Float32Array(grindParticleCount * 3);
            
            for (let i = 0; i < grindParticleCount; i++) {
                grindParticlePositions[i * 3] = 0;
                grindParticlePositions[i * 3 + 1] = 0; 
                grindParticlePositions[i * 3 + 2] = 0;
            }
            
            grindParticleGeometry.setAttribute('position', new THREE.BufferAttribute(grindParticlePositions, 3));
            
            const grindParticleMaterial = new THREE.PointsMaterial({
                color: 0xFFAA00,
                size: 0.05,
                transparent: true,
                opacity: 0.8
            });
            
            grindParticles = new THREE.Points(grindParticleGeometry, grindParticleMaterial);
            grindParticles.visible = false;
            scene.add(grindParticles);
            
            // Ollie particles
            const ollieParticleCount = 40;
            const ollieParticleGeometry = new THREE.BufferGeometry();
            const ollieParticlePositions = new Float32Array(ollieParticleCount * 3);
            
            for (let i = 0; i < ollieParticleCount; i++) {
                ollieParticlePositions[i * 3] = 0;
                ollieParticlePositions[i * 3 + 1] = 0; 
                ollieParticlePositions[i * 3 + 2] = 0;
            }
            
            ollieParticleGeometry.setAttribute('position', new THREE.BufferAttribute(ollieParticlePositions, 3));
            
            const ollieParticleMaterial = new THREE.PointsMaterial({
                color: 0x00AAFF,
                size: 0.08,
                transparent: true,
                opacity: 0.7
            });
            
            ollieParticles = new THREE.Points(ollieParticleGeometry, ollieParticleMaterial);
            ollieParticles.visible = false;
            scene.add(ollieParticles);
        }
        
        // Add interactive elements to the scene
        function addInteractiveElements() {
            // Add interactive collectibles (coins)
            createCollectibles();
            
            // Add interactive power-ups
            createPowerUps();
            
            // Add interactive NPCs
            createInteractiveNPCs();
        }
        
        // Create collectible coins
        let coins = [];
        function createCollectibles() {
            // Create coin geometry and material
            const coinGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
            const coinMaterial = new THREE.MeshStandardMaterial({
                color: 0xFFD700,
                metalness: 1.0,
                roughness: 0.3,
                emissive: 0xAA8800,
                emissiveIntensity: 0.3
            });
            
            // Create coins throughout the level
            for (let i = 0; i < 30; i++) {
                const coin = new THREE.Mesh(coinGeometry, coinMaterial);
                
                // Position coins randomly along the path
                coin.position.set(
                    -40 + Math.random() * 80,
                    1 + Math.random() * 2,
                    Math.random() * 16 - 8
                );
                
                coin.rotation.x = Math.PI / 2; // Make coins face up
                coin.userData = {
                    isCollectible: true,
                    value: 50,
                    rotationSpeed: 0.02 + Math.random() * 0.02
                };
                
                scene.add(coin);
                coins.push(coin);
            }
        }
        
        // Create power-ups
        let powerUps = [];
        function createPowerUps() {
            // Define different power-up types
            const powerUpTypes = [
                { type: 'speed', color: 0x00FF00, value: 1.5, duration: 5000 },
                { type: 'jump', color: 0xFF00FF, value: 2, duration: 5000 },
                { type: 'invincibility', color: 0xFFFF00, value: 1, duration: 3000 }
            ];
            
            // Create power-up geometry and materials
            const powerUpGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
            
            // Create power-ups throughout the level
            for (let i = 0; i < 5; i++) {
                const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                const powerUpMaterial = new THREE.MeshStandardMaterial({
                    color: powerUpType.color,
                    metalness: 0.7,
                    roughness: 0.2,
                    emissive: powerUpType.color,
                    emissiveIntensity: 0.5,
                    transparent: true,
                    opacity: 0.8
                });
                
                const powerUp = new THREE.Mesh(powerUpGeometry, powerUpMaterial);
                
                // Position power-ups randomly along the path
                powerUp.position.set(
                    -30 + Math.random() * 60,
                    1.5 + Math.random(),
                    Math.random() * 14 - 7
                );
                
                powerUp.userData = {
                    isPowerUp: true,
                    type: powerUpType.type,
                    value: powerUpType.value,
                    duration: powerUpType.duration,
                    rotationSpeed: 0.03
                };
                
                scene.add(powerUp);
                powerUps.push(powerUp);
            }
        }
        
        // Create interactive NPCs
        let interactiveNPCs = [];
        function createInteractiveNPCs() {
            // Create a skating instructor NPC that gives tips
            const instructorGroup = new THREE.Group();
            
            // Body
            const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 16);
            const bodyMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xFF0000, // Red shirt
                roughness: 0.8
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            instructorGroup.add(body);
            
            // Head
            const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
            const headMaterial = new THREE.MeshStandardMaterial({
                color: 0xFFD700, // Skin tone
                roughness: 0.5
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 0.7;
            instructorGroup.add(head);
            
            // Hat
            const hatGeometry = new THREE.ConeGeometry(0.35, 0.3, 32);
            const hatMaterial = new THREE.MeshStandardMaterial({
                color: 0x0000FF, // Blue hat
                roughness: 0.9
            });
            const hat = new THREE.Mesh(hatGeometry, hatMaterial);
            hat.position.y = 1;
            instructorGroup.add(hat);
            
            // Position the instructor
            instructorGroup.position.set(-10, 1, -7);
            instructorGroup.userData = {
                isNPC: true,
                type: 'instructor',
                name: 'Skate Pro',
                messages: [
                    "Press E to do an ollie!",
                    "Hold Shift while near a rail to grind!",
                    "Space to jump, WASD to move!",
                    "Watch out for obstacles and collect coins!",
                    "Find power-ups to enhance your abilities!"
                ]
            };
            
            scene.add(instructorGroup);
            interactiveNPCs.push(instructorGroup);
            
            // Create a rival skater NPC that challenges the player
            const rivalGroup = new THREE.Group();
            
            // Body
            const rivalBodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16);
            const rivalBodyMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x000000, // Black shirt
                roughness: 0.8
            });
            const rivalBody = new THREE.Mesh(rivalBodyGeometry, rivalBodyMaterial);
            rivalGroup.add(rivalBody);
            
            // Head
            const rivalHeadGeometry = new THREE.SphereGeometry(0.28, 32, 32);
            const rivalHeadMaterial = new THREE.MeshStandardMaterial({
                color: 0xFFD700, // Skin tone
                roughness: 0.5
            });
            const rivalHead = new THREE.Mesh(rivalHeadGeometry, rivalHeadMaterial);
            rivalHead.position.y = 0.65;
            rivalGroup.add(rivalHead);
            
            // Create skateboard
            const boardGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.5);
            const boardMaterial = new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                roughness: 0.7
            });
            const board = new THREE.Mesh(boardGeometry, boardMaterial);
            board.position.y = -0.6;
            rivalGroup.add(board);
            
            // Position the rival
            rivalGroup.position.set(10, 1, 7);
            rivalGroup.userData = {
                isNPC: true,
                type: 'rival',
                name: 'Street King',
                messages: [
                    "Think you're good enough to beat me?",
                    "Show me what you got, rookie!",
                    "Get a score over 1000 to challenge me!",
                    "You'll never be the Street King!",
                    "Nice moves, but still not as good as mine!"
                ]
            };
            
            scene.add(rivalGroup);
            interactiveNPCs.push(rivalGroup);
        }
        
        // Setup control bindings (GDD Section 2.1)
        function setupControls() {
            // Control instructions added to UI
            document.getElementById('controls').innerHTML = `
                <h3>Controls:</h3>
                <p>WASD - Move</p>
                <p>SPACE - Jump</p>
                <p>E - Ollie</p>
                <p>SHIFT - Grind (when near rail)</p>
                <p>M - Toggle Sound</p>
                <p>R - Restart (after game over)</p>
            `;
        }
        
        // Window resize handler (GDD Section 3.3)
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        
        // Create a basic obstacle (GDD Section 3.1)
        function createObstacle() {
            // Create different types of obstacles
            const obstacleTypes = [
                { 
                    type: 'trafficCone',
                    geometry: new THREE.ConeGeometry(0.5, 1, 32),
                    material: new THREE.MeshStandardMaterial({ 
                        color: 0xFF5500,
                        roughness: 0.8
                    }),
                    scale: { x: 1, y: 1, z: 1 },
                    height: 0.5
                },
                { 
                    type: 'trashCan',
                    geometry: new THREE.CylinderGeometry(0.5, 0.4, 1.2, 16),
                    material: new THREE.MeshStandardMaterial({ 
                        color: 0x444444,
                        roughness: 0.7
                    }),
                    scale: { x: 1, y: 1, z: 1 },
                    height: 0.6
                },
                { 
                    type: 'hydrant',
                    geometry: new THREE.CylinderGeometry(0.3, 0.4, 0.8, 16),
                    material: new THREE.MeshStandardMaterial({ 
                        color: 0xFF0000,
                        roughness: 0.6
                    }),
                    scale: { x: 1, y: 1, z: 1 },
                    height: 0.4
                },
                {
                    type: 'constructionBarrier',
                    geometry: new THREE.BoxGeometry(1.5, 0.8, 0.2),
                    material: new THREE.MeshStandardMaterial({ 
                        color: 0xFFA500,
                        roughness: 0.8
                    }),
                    scale: { x: 1, y: 1, z: 1 },
                    height: 0.4
                }
            ];
            
            // Choose random obstacle type
            const selectedObstacle = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            
            // Create mesh
            const obstacle = new THREE.Mesh(selectedObstacle.geometry, selectedObstacle.material);
            
            // Set random position on the street
            obstacle.position.set(
                player.position.x + (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 5), // x
                selectedObstacle.height, // y
                Math.random() * 16 - 8 // z
            );
            
            obstacle.castShadow = true;
            obstacle.receiveShadow = true;
            
            // Add special properties for different obstacle types
            switch(selectedObstacle.type) {
                case 'trafficCone':
                    // Add reflective strips
                    const stripGeometry = new THREE.TorusGeometry(0.52, 0.05, 8, 16);
                    const stripMaterial = new THREE.MeshStandardMaterial({ 
                        color: 0xFFFFFF,
                        emissive: 0xFFFFFF,
                        emissiveIntensity: 0.2
                    });
                    const strip1 = new THREE.Mesh(stripGeometry, stripMaterial);
                    strip1.position.y = 0.2;
                    strip1.rotation.x = Math.PI / 2;
                    obstacle.add(strip1);
                    
                    const strip2 = new THREE.Mesh(stripGeometry, stripMaterial);
                    strip2.position.y = 0.4;
                    strip2.scale.set(0.7, 0.7, 0.7);
                    strip2.rotation.x = Math.PI / 2;
                    obstacle.add(strip2);
                    break;
                    
                case 'trashCan':
                    // Add lid
                    const lidGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 16);
                    const lidMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
                    const lid = new THREE.Mesh(lidGeometry, lidMaterial);
                    lid.position.y = 0.65;
                    obstacle.add(lid);
                    break;
                    
                case 'hydrant':
                    // Add caps
                    const capGeometry = new THREE.SphereGeometry(0.15, 16, 16);
                    const capMaterial = new THREE.MeshStandardMaterial({ 
                        color: 0xCCCCCC,
                        metalness: 0.8,
                        roughness: 0.2
                    });
                    
                    const leftCap = new THREE.Mesh(capGeometry, capMaterial);
                    leftCap.position.set(-0.35, 0.2, 0);
                    obstacle.add(leftCap);
                    
                    const rightCap = new THREE.Mesh(capGeometry, capMaterial);
                    rightCap.position.set(0.35, 0.2, 0);
                    obstacle.add(rightCap);
                    
                    // Add top
                    const topGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 16);
                    const top = new THREE.Mesh(topGeometry, capMaterial);
                    top.position.y = 0.5;
                    obstacle.add(top);
                    break;
                    
                case 'constructionBarrier':
                    // Add stripes
                    const barrierStripeGeometry = new THREE.PlaneGeometry(0.2, 0.8);
                    const blackStripeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
                    
                    // Add alternating orange/black stripes
                    for (let i = 0; i < 5; i++) {
                        if (i % 2 === 1) {
                            const stripe = new THREE.Mesh(barrierStripeGeometry, blackStripeMaterial);
                            stripe.position.set(-0.6 + i * 0.3, 0, 0.11);
                            obstacle.add(stripe);
                        }
                    }
                    
                    // Add legs
                    const legGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.1);
                    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
                    
                    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
                    leftLeg.position.set(-0.5, -0.7, 0);
                    obstacle.add(leftLeg);
                    
                    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
                    rightLeg.position.set(0.5, -0.7, 0);
                    obstacle.add(rightLeg);
                    
                    // Adjust position for barrier
                    obstacle.position.y = 0.8;
                    break;
            }
            
            // Add to scene and obstacles array
            scene.add(obstacle);
            obstacles.push(obstacle);
            
            // Spawn a new obstacle after a delay
            setTimeout(() => {
                if (!gameOver) {
                    lastObstacleTime = Date.now();
                }
            }, obstacleSpawnRate);
        }
        
        // Periodically update obstacles (GDD Section 3.1)
        function updateObstacles() {
            // Create new obstacles based on spawn rate
            if (Date.now() - lastObstacleTime > aiEvents[currentAIEvent].obstacleFrequency) {
                createObstacle();
            }
        
            // Move existing obstacles
            obstacles.forEach((obstacle, index) => {
                // Move obstacles toward player if they go too far
                if (obstacle.position.x < player.position.x - 50) {
                    obstacle.position.x = player.position.x + 50 + Math.random() * 10;
                    obstacle.position.z = Math.random() * 16 - 8;
                }
                
                // Remove obstacles that are behind player
                if (obstacle.position.x < player.position.x - 60) {
                    scene.remove(obstacle);
                    obstacles.splice(index, 1);
                }
            });
        }
        
        // Animate ambient skaters
        function animateAmbientSkaters() {
            ambientSkaters.forEach((skater, index) => {
                // Make skaters do simple tricks and movements
                skater.rotation.y += 0.01;
                
                // Simple bobbing motion
                skater.position.y = 1 + Math.sin(Date.now() * 0.001 + index) * 0.1;
                
                // Occasionally do a jump
                if (Math.random() < 0.002) {
                    // Jump animation
                    const jumpHeight = 1 + Math.random();
                    const jumpDuration = 1000;
                    const startTime = Date.now();
                    
                    const jumpInterval = setInterval(() => {
                        const elapsed = Date.now() - startTime;
                        const progress = elapsed / jumpDuration;
                        
                        if (progress >= 1) {
                            skater.position.y = 1;
                            clearInterval(jumpInterval);
                        } else {
                            // Parabolic jump curve
                            skater.position.y = 1 + jumpHeight * Math.sin(progress * Math.PI);
                            
                            // Add rotation for trick
                            skater.rotation.z = progress * Math.PI * 2;
                        }
                    }, 16);
                }
            });
        }
        
        // Update camera to follow player (GDD Section 4.2)
        function updateCamera() {
            // Smooth follow camera
            const cameraTargetPosition = new THREE.Vector3(
                player.position.x - 5,
                player.position.y + 5,
                player.position.z
            );
            
            // Interpolate camera position for smoothness
            camera.position.lerp(cameraTargetPosition, 0.05);
            
            // Look at player
            camera.lookAt(player.position);
        }
        
        // Check if player is near a rail for grinding (GDD Section 2.1)
        function isNearRail() {
            return (
                Math.abs(player.position.x - rail.position.x) < 0.5 &&
                Math.abs(player.position.z - rail.position.z) < 0.7
            );
        }
        
        // Collision detection function (GDD Section 3.2)
        function checkCollision() {
            // Check for obstacle collisions
            obstacles.forEach(obstacle => {
                if (getDistance(player.position, obstacle.position) < 1) {
                    handleCollision();
                }
            });
        }
        
        // Handle collision with obstacle (GDD Section 3.2)
        function handleCollision() {
            // Apply knockback to player
            playerState.velocity.y = 0.5;
            playerState.velocity.x = -0.1;
            playerState.onGround = false;
            
            // Decrease score
            score -= 100;
            score = Math.max(0, score); // Prevent negative score
            updateScoreDisplay();
            
            // Visual feedback - player flashes red
            if (player.material) {
                const originalColor = player.material.color.clone();
                player.material.color.set(0xff0000);
                
                // Reset color after a short delay
                setTimeout(() => {
                    if (player.material) {
                        player.material.color.copy(originalColor);
                    }
                }, 300);
            }
            
            // Play collision sound (GDD Section 5.0)
            if (soundEnabled && collisionSound && !collisionSound.isPlaying) {
                collisionSound.play();
            }
            
            // Check if game over (low score or too many collisions)
            if (score <= 0) {
                gameOver = true;
                showGameOver("You wiped out! Your final score: 0");
            }
        }
        
        // Calculate distance between two Vector3 points
        function getDistance(point1, point2) {
            return Math.sqrt(
                Math.pow(point1.x - point2.x, 2) +
                Math.pow(point1.y - point2.y, 2) +
                Math.pow(point1.z - point2.z, 2)
            );
        }
        
        // Update score display (GDD Section 2.2)
        function updateScoreDisplay() {
            document.getElementById('score').textContent = `Score: ${score}`;
        }
        
        // Show 'Ollie!' text above player
        function showOllieText() {
            if (ollieTextMesh) {
                scene.remove(ollieTextMesh);
            }
            
            const loader = new THREE.FontLoader();
            loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
                const textGeometry = new THREE.TextGeometry('Ollie!', {
                    font: font,
                    size: 0.5,
                    height: 0.1
                });
                
                const textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                ollieTextMesh = new THREE.Mesh(textGeometry, textMaterial);
                
                // Position text above player
                ollieTextMesh.position.copy(player.position);
                ollieTextMesh.position.y += 2;
                ollieTextMesh.lookAt(camera.position);
                
                scene.add(ollieTextMesh);
                
                // Remove text after a short time
                setTimeout(() => {
                    scene.remove(ollieTextMesh);
                }, 1000);
            });
        }
        
        // Show game over screen (GDD Section 2.3)
        function showGameOver(message) {
            document.getElementById('gameOver').style.display = 'flex';
            document.getElementById('gameOverText').textContent = message;
            document.getElementById('finalScore').textContent = `Final Score: ${score}`;
            
            // Stop animation loop
            cancelAnimationFrame(animationId);
        }
        
        // Reset game (GDD Section 2.3)
        function resetGame() {
            // Reset player position and state
            player.position.set(0, 1, 0);
            playerState = {
                velocity: { x: 0, y: 0, z: 0 },
                speed: 0.1,
                jumpPower: 1.5,
                gravity: 0.005,
                onGround: true,
                grinding: false
            };
            
            // Reset game state
            score = 0;
            updateScoreDisplay();
            gameOver = false;
            lastObstacleTime = 0;
            
            // Remove all obstacles
            obstacles.forEach(obstacle => {
                scene.remove(obstacle);
            });
            obstacles = [];
            
            // Reset power-ups
            powerUps.forEach(powerUp => {
                scene.remove(powerUp);
            });
            powerUps = [];
            
            // Reset coins
            coins.forEach(coin => {
                scene.remove(coin);
            });
            coins = [];
            
            // Create new interactive elements
            addInteractiveElements();
            
            // Hide game over screen
            document.getElementById('gameOver').style.display = 'none';
            
            // Reset camera
            camera.position.set(0, 5, 10);
            
            // Choose random AI event
            currentAIEvent = Math.floor(Math.random() * aiEvents.length);
            document.getElementById('event').textContent = aiEvents[currentAIEvent].name;
            
            // Restart animation loop
            animate();
            
            // Play background music
            if (backgroundMusic && soundEnabled) {
                backgroundMusic.play();
            }
        }
        
        // Toggle sound (GDD Section 5.0)
        function toggleSound() {
            soundEnabled = !soundEnabled;
            
            if (soundEnabled) {
                if (backgroundMusic) {
                    backgroundMusic.play();
                }
                if (ambientSound) {
                    ambientSound.play();
                }
                document.getElementById('soundStatus').textContent = 'Sound: ON';
            } else {
                if (backgroundMusic) {
                    backgroundMusic.pause();
                }
                if (ambientSound) {
                    ambientSound.pause();
                }
                document.getElementById('soundStatus').textContent = 'Sound: OFF';
            }
        }
        
        // Modified performOllie to include particle effects
        function performOllie() {
            // Rotate player
            player.rotation.y += Math.PI;
            
            // Add points
            score += 20;
            updateScoreDisplay();
            
            // Show 'Ollie!' above player
            showOllieText();
            
            // Create ollie particle effect
            const positions = ollieParticles.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] = player.position.x + (Math.random() - 0.5) * 0.5;
                positions[i + 1] = player.position.y + (Math.random() - 0.5) * 0.5;
                positions[i + 2] = player.position.z + (Math.random() - 0.5) * 0.5;
            }
            
            ollieParticles.geometry.attributes.position.needsUpdate = true;
            ollieParticles.visible = true;
            
            // Play ollie sound (GDD Section 5.0)
            if (soundEnabled && ollieSound && ollieSound.isPlaying === false) {
                ollieSound.play();
            }
        }
        
        // Update particle effects
        function updateParticleEffects() {
            // Update jump particles
            if (jumpParticles.visible) {
                const positions = jumpParticles.geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    // Apply gravity and random movement to particles
                    positions[i] += (Math.random() - 0.5) * 0.1; // x
                    positions[i + 1] -= 0.05; // y (gravity)
                    positions[i + 2] += (Math.random() - 0.5) * 0.1; // z
                    
                    // If particle goes below ground, reset it
                    if (positions[i + 1] < 0) {
                        jumpParticles.visible = false;
                    }
                }
                
                jumpParticles.geometry.attributes.position.needsUpdate = true;
            }
            
            // Update grind particles
            if (grindParticles.visible && playerState.grinding) {
                const positions = grindParticles.geometry.attributes.position.array;
                
                for (let i = 0; i < positions.length; i += 3) {
                    // Create spark effect around grinding point
                    positions[i] = player.position.x + (Math.random() - 0.5) * 0.2;
                    positions[i + 1] = player.position.y - 0.1 + Math.random() * 0.1;
                    positions[i + 2] = player.position.z + (Math.random() - 0.5) * 0.2;
                }
                
                grindParticles.geometry.attributes.position.needsUpdate = true;
            } else {
                grindParticles.visible = false;
            }
            
            // Update ollie particles
            if (ollieParticles.visible) {
                const positions = ollieParticles.geometry.attributes.position.array;
                
                for (let i = 0; i < positions.length; i += 3) {
                    // Apply outward expansion effect
                    const dx = positions[i] - player.position.x;
                    const dy = positions[i + 1] - player.position.y;
                    const dz = positions[i + 2] - player.position.z;
                    
                    positions[i] += dx * 0.05;
                    positions[i + 1] += dy * 0.05 - 0.01; // Slight gravity
                    positions[i + 2] += dz * 0.05;
                    
                    // If particles have expanded enough, hide them
                    if (Math.abs(dx) > 2 || Math.abs(dy) > 2 || Math.abs(dz) > 2) {
                        ollieParticles.visible = false;
                    }
                }
                
                ollieParticles.geometry.attributes.position.needsUpdate = true;
            }
        }
        
        // Update collectibles and power-ups
        function updateInteractiveElements() {
            // Rotate coins
            coins.forEach((coin, index) => {
                coin.rotation.y += coin.userData.rotationSpeed;
                
                // Check for collision with player
                if (getDistance(player.position, coin.position) < 1) {
                    // Collect the coin
                    scene.remove(coin);
                    coins.splice(index, 1);
                    
                    // Add score
                    score += coin.userData.value;
                    updateScoreDisplay();
                    
                    // Play coin sound
                    if (soundEnabled && coinSound && !coinSound.isPlaying) {
                        coinSound.play();
                    }
                }
            });
            
            // Rotate and bob power-ups
            powerUps.forEach((powerUp, index) => {
                powerUp.rotation.y += powerUp.userData.rotationSpeed;
                powerUp.rotation.x += powerUp.userData.rotationSpeed / 2;
                powerUp.position.y = 1.5 + Math.sin(Date.now() * 0.002) * 0.3;
                
                // Check for collision with player
                if (getDistance(player.position, powerUp.position) < 1) {
                    // Apply power-up effect
                    applyPowerUp(powerUp.userData);
                    
                    // Remove power-up
                    scene.remove(powerUp);
                    powerUps.splice(index, 1);
                }
            });
            
            // Animate NPCs
            interactiveNPCs.forEach(npc => {
                // Make NPCs bob up and down slightly
                npc.position.y = 1 + Math.sin(Date.now() * 0.001 + npc.position.x) * 0.1;
                
                // Make NPCs rotate slightly
                npc.rotation.y += 0.01;
                
                // Check for proximity to player to trigger dialogue
                if (getDistance(player.position, npc.position) < 3) {
                    // Show random message from NPC
                    const messages = npc.userData.messages;
                    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                    
                    document.getElementById('event').textContent = `${npc.userData.name}: ${randomMsg}`;
                    
                    // Reset message after 3 seconds
                    setTimeout(() => {
                        if (!gameOver) {
                            document.getElementById('event').textContent = aiEvents[currentAIEvent].name;
                        }
                    }, 3000);
                }
            });
        }
        
        // Apply power-up effects
        let activePowerUps = [];
        function applyPowerUp(powerUpData) {
            // Store power-up data with expiration time
            const expirationTime = Date.now() + powerUpData.duration;
            activePowerUps.push({
                type: powerUpData.type,
                value: powerUpData.value,
                expirationTime: expirationTime
            });
            
            // Update UI
            document.getElementById('event').textContent = `Power-up: ${powerUpData.type} activated!`;
            
            // Apply immediate effect based on type
            switch(powerUpData.type) {
                case 'speed':
                    playerState.speed *= powerUpData.value;
                    break;
                case 'jump':
                    playerState.jumpPower *= powerUpData.value;
                    break;
                case 'invincibility':
                    // Visual effect for invincibility
                    if (player.material) {
                        player.material.color.set(0xFFFF00);
                        player.material.emissive = new THREE.Color(0xFFFF00);
                        player.material.emissiveIntensity = 0.5;
                    }
                    break;
            }
            
            // Play power-up sound
            if (soundEnabled && powerUpSound && !powerUpSound.isPlaying) {
                powerUpSound.play();
            }
            
            // Set timeout to revert effect
            setTimeout(() => {
                // Remove from active power-ups
                activePowerUps = activePowerUps.filter(pu => pu.expirationTime > Date.now());
                
                // Revert effects if no similar power-ups are active
                if (!activePowerUps.some(pu => pu.type === powerUpData.type)) {
                    switch(powerUpData.type) {
                        case 'speed':
                            playerState.speed = 0.1; // Reset to default
                            break;
                        case 'jump':
                            playerState.jumpPower = 1.5; // Reset to default
                            break;
                        case 'invincibility':
                            // Reset visual effect
                            if (player.material) {
                                player.material.color.set(0x00ff00);
                                player.material.emissive = new THREE.Color(0x000000);
                                player.material.emissiveIntensity = 0;
                            }
                            break;
                    }
                    
                    // Update UI
                    document.getElementById('event').textContent = `Power-up: ${powerUpData.type} expired`;
                    
                    // Reset UI after 2 seconds
                    setTimeout(() => {
                        if (!gameOver) {
                            document.getElementById('event').textContent = aiEvents[currentAIEvent].name;
                        }
                    }, 2000);
                }
            }, powerUpData.duration);
        }
        
        // Update player movement with added particle effects and power-ups
        function updatePlayerMovement() {
            // Check for active power-ups and remove expired ones
            activePowerUps = activePowerUps.filter(pu => pu.expirationTime > Date.now());
            
            // GDD Section 2.1: Ollie mechanic
            if (keys.e && !playerState.grinding && playerState.onGround) {
                performOllie();
                keys.e = false; // Prevent holding E for repeated ollies
            }
        
            // GDD Section 2.1: Grinding mechanics
            if (!playerState.grinding) {
                // WASD movement
                if (keys.w) player.position.z -= playerState.speed;
                if (keys.s) player.position.z += playerState.speed;
                if (keys.a) player.position.x -= playerState.speed;
                if (keys.d) player.position.x += playerState.speed;
            }
        
            // Check for grind activation
            if (!playerState.grinding && keys.shift && isNearRail()) {
                playerState.grinding = true;
                // Lock y to rail height
                player.position.y = rail.position.y + 0.25; // Slightly above rail
                playerState.velocity.y = 0;
                
                // Activate grind particles
                const positions = grindParticles.geometry.attributes.position.array;
                
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] = player.position.x + (Math.random() - 0.5) * 0.2;
                    positions[i + 1] = player.position.y - 0.1 + Math.random() * 0.1;
                    positions[i + 2] = player.position.z + (Math.random() - 0.5) * 0.2;
                }
                
                grindParticles.geometry.attributes.position.needsUpdate = true;
                grindParticles.visible = true;
                
                // Play grinding sound
                if (soundEnabled && grindSound && !grindSound.isPlaying) {
                    grindSound.play();
                }
                
                // Add points for grinding
                score += 5;
                updateScoreDisplay();
            }
        
            // Grinding movement
            if (playerState.grinding) {
                // Only allow movement along z axis of rail
                if (keys.w) player.position.z -= playerState.speed * 1.5;
                if (keys.s) player.position.z += playerState.speed * 1.5;
                // Lock x and y to rail
                player.position.x = rail.position.x;
                player.position.y = rail.position.y + 0.25;
                // Exit grind if not holding shift or moved off rail
                if (!keys.shift || !isNearRail()) {
                    playerState.grinding = false;
                    
                    // Stop grinding sound
                    if (grindSound && grindSound.isPlaying) {
                        grindSound.stop();
                    }
                }
            } else {
                // Jump physics with particle effects (GDD Section 5.3)
                if (keys.space && playerState.onGround) {
                    playerState.velocity.y = playerState.jumpPower;
                    playerState.onGround = false;
                    
                    // Create jump particle effect
                    const positions = jumpParticles.geometry.attributes.position.array;
                    
                    for (let i = 0; i < positions.length; i += 3) {
                        positions[i] = player.position.x + (Math.random() - 0.5) * 0.5;
                        positions[i + 1] = player.position.y - 0.5;
                        positions[i + 2] = player.position.z + (Math.random() - 0.5) * 0.5;
                    }
                    
                    jumpParticles.geometry.attributes.position.needsUpdate = true;
                    jumpParticles.visible = true;
                    
                    // Play jump sound
                    if (soundEnabled && jumpSound && !jumpSound.isPlaying) {
                        jumpSound.play();
                    }
                }
                
                // Apply gravity
                playerState.velocity.y -= playerState.gravity;
                
                // Update position based on velocity
                player.position.y += playerState.velocity.y;
                
                // Ground collision check
                if (player.position.y <= 1) {
                    player.position.y = 1;
                    playerState.velocity.y = 0;
                    playerState.onGround = true;
                }
            }
            
            // Avoid collision with invincibility power-up
            const hasInvincibility = activePowerUps.some(pu => pu.type === 'invincibility');
            
            // Check for obstacle collisions only if not invincible
            if (!hasInvincibility) {
                checkCollision();
            }
            
            // Keep player within street bounds
            if (player.position.x < -45) player.position.x = -45;
            if (player.position.x > 45) player.position.x = 45;
            if (player.position.z < -9) player.position.z = -9;
            if (player.position.z > 9) player.position.z = 9;
        }
        
        // Animate environment elements
        function animateEnvironment() {
            // Make trees sway gently
            treeModels.forEach((tree, index) => {
                tree.rotation.z = Math.sin(Date.now() * 0.001 + index) * 0.05;
            });
            
            // Day/night cycle (subtle color changes)
            const time = Date.now() * 0.0001;
            const skyColor = new THREE.Color(
                0.5 + 0.3 * Math.sin(time),
                0.5 + 0.3 * Math.sin(time),
                0.8 + 0.2 * Math.sin(time)
            );
            
            // Gradually change sky color
            if (scene.background && scene.background.isColor) {
                scene.background.lerp(skyColor, 0.01);
            }
        }
        
        // Enhanced game animation loop (GDD Section 6.1)
        function animate() {
            animationId = requestAnimationFrame(animate);
            
            if (!gameOver) {
                // Update player movement and physics
                updatePlayerMovement();
                
                // Update obstacles
                updateObstacles();
                
                // Update particle effects
                updateParticleEffects();
                
                // Update interactive elements (coins, power-ups, NPCs)
                updateInteractiveElements();
                
                // Update camera to follow player
                updateCamera();
                
                // Animate ambient skaters
                animateAmbientSkaters();
                
                // Animate environment elements (trees swaying, etc.)
                animateEnvironment();
            }
            
            // Render the scene
            renderer.render(scene, camera);
        }
        
        // Note: Game initialization is handled by the start button in index.html
        // Do not initialize the game here to prevent double initialization
