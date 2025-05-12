// // Sound components (GDD Section 5.0 - Sound Design)
// let audioListener;
// let jumpSound, collisionSound, ollieSound, backgroundMusic;
// let soundEnabled = true;

// // Initialize Audio system (GDD Section 5.0 - Sound Design)
// function initAudio() {
//     // Create audio listener attached to camera
//     audioListener = new THREE.AudioListener();
//     camera.add(audioListener);
    
//     // Create jump sound
//     jumpSound = new THREE.Audio(audioListener);
//     const jumpSoundLoader = new THREE.AudioLoader();
//     jumpSoundLoader.load('https://freesound.org/people/Seth_Makes_Sounds/sounds/571456/download/571456__seth-makes-sounds__jump-sound.mp3', function(buffer) {
//         jumpSound.setBuffer(buffer);
//         jumpSound.setVolume(0.5);
//     }, 
//     // onProgress callback
//     function(xhr) {
//         console.log('Jump sound: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
//     },
//     // onError callback
//     function(err) {
//         console.error('Error loading jump sound:', err);
//         // Fallback to local audio as backup
//         jumpSoundLoader.load('./sounds/jump.mp3', function(buffer) {
//             jumpSound.setBuffer(buffer);
//             jumpSound.setVolume(0.5);
//         });
//     });
    
//     // Create ollie sound
//     ollieSound = new THREE.Audio(audioListener);
//     const ollieSoundLoader = new THREE.AudioLoader();
//     ollieSoundLoader.load('https://freesound.org/people/SamKolber/sounds/210078/download/210078__samkolber__skateboard-ollie-far.wav', function(buffer) {
//         ollieSound.setBuffer(buffer);
//         ollieSound.setVolume(0.5);
//     });
    
//     // Create collision sound
//     collisionSound = new THREE.Audio(audioListener);
//     const collisionSoundLoader = new THREE.AudioLoader();
//     collisionSoundLoader.load('https://freesound.org/people/13GPanska_Lakota_Jan/sounds/378355/download/378355__13gpanska-lakota-jan__concrete-crack.wav', function(buffer) {
//         collisionSound.setBuffer(buffer);
//         collisionSound.setVolume(0.7);
//     });
    
//     // Create background music (looped)
//     backgroundMusic = new THREE.Audio(audioListener);
//     const musicLoader = new THREE.AudioLoader();
//     musicLoader.load('https://cdn.pixabay.com/download/audio/2022/01/18/audio_1e15795323.mp3', function(buffer) {
//         backgroundMusic.setBuffer(buffer);
//         backgroundMusic.setLoop(true);
//         backgroundMusic.setVolume(0.3);
//         // Start playing if game is already initialized
//         if (scene) {
//             backgroundMusic.play();
//         }
//     },
//     // onProgress callback
//     function(xhr) {
//         console.log('Background music: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
//     },
//     // onError callback
//     function(err) {
//         console.error('Error loading background music:', err);
//         // Fallback to local audio as backup
//         musicLoader.load('./sounds/background.mp3', function(buffer) {
//             backgroundMusic.setBuffer(buffer);
//             backgroundMusic.setLoop(true);
//             backgroundMusic.setVolume(0.3);
//             if (scene) {
//                 backgroundMusic.play();
//             }
//         });
//     });
// }

// // Toggle sound on/off (GDD Section 5.0)
// function toggleSound() {
//     soundEnabled = !soundEnabled;
    
//     if (soundEnabled) {
//         audioListener.setMasterVolume(1.0);
//         if (!gameOver && backgroundMusic && !backgroundMusic.isPlaying) {
//             backgroundMusic.play();
//         }
//         document.getElementById('event').textContent = "Sound enabled";
//     } else {
//         audioListener.setMasterVolume(0.0);
//         document.getElementById('event').textContent = "Sound disabled";
//     }
    
//     // Reset the display after 2 seconds
//     setTimeout(() => {
//         if (!gameOver) {
//             document.getElementById('event').textContent = aiEvents[currentAIEvent].name;
//         }
//     }, 2000);
// }

// Sound components (GDD Section 5.0 - Sound Design)
let audioListener;
let jumpSound, collisionSound, ollieSound, backgroundMusic;
let grindSound, coinSound, powerUpSound, ambientSound;
let soundEnabled = true;
let audioContextStarted = false;

// Function to ensure audio context is started after user interaction
function startAudioContext() {
    if (!audioContextStarted && audioListener && audioListener.context.state === 'suspended') {
        audioListener.context.resume().then(() => {
            console.log('AudioContext started after user interaction');
            audioContextStarted = true;
        });
    }
}

// Add event listeners to start audio context on user interaction
document.addEventListener('click', startAudioContext);
document.addEventListener('keydown', startAudioContext);

// Create a simple beep sound using oscillator
function createBeepSound(audioContext, frequency = 440, duration = 0.2) {
    // Create buffer for the sound
    const sampleRate = audioContext.sampleRate;
    const bufferSize = duration * sampleRate;
    const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fill the buffer with a simple sine wave
    for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        // Sine wave with exponential decay
        data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-3 * t);
    }
    
    return buffer;
}

// Initialize Audio system (GDD Section 5.0 - Sound Design)
function initAudio() {
    // Initialize audio components
    audioListener = new THREE.AudioListener();
    camera.add(audioListener);

    // Initialize sound effects
    jumpSound = new THREE.Audio(audioListener);
    ollieSound = new THREE.Audio(audioListener);
    collisionSound = new THREE.Audio(audioListener);
    grindSound = new THREE.Audio(audioListener);
    coinSound = new THREE.Audio(audioListener);
    powerUpSound = new THREE.Audio(audioListener);
    ambientSound = new THREE.Audio(audioListener);
    backgroundMusic = new THREE.Audio(audioListener);
    
    // Create sounds using Web Audio API oscillators
    if (audioListener.context) {
        // Different pitches for different sounds
        jumpSound.setBuffer(createBeepSound(audioListener.context, 660, 0.1));
        ollieSound.setBuffer(createBeepSound(audioListener.context, 550, 0.15));
        collisionSound.setBuffer(createBeepSound(audioListener.context, 220, 0.3));
        grindSound.setBuffer(createBeepSound(audioListener.context, 330, 0.2));
        coinSound.setBuffer(createBeepSound(audioListener.context, 880, 0.1));
        powerUpSound.setBuffer(createBeepSound(audioListener.context, 1100, 0.2));
        
        // Create ambient sound (lower frequency)
        ambientSound.setBuffer(createBeepSound(audioListener.context, 110, 0.5));
        ambientSound.setLoop(true);
        ambientSound.setVolume(0.1);
        
        // Create background music (a simple repeating pattern)
        const musicBuffer = audioListener.context.createBuffer(1, audioListener.context.sampleRate * 2, audioListener.context.sampleRate);
        const musicData = musicBuffer.getChannelData(0);
        
        // Create a simple looping melody
        for (let i = 0; i < musicBuffer.length; i++) {
            const t = i / audioListener.context.sampleRate;
            // Mix multiple frequencies for a more complex sound
            musicData[i] = 
                0.2 * Math.sin(2 * Math.PI * 220 * t) + 
                0.1 * Math.sin(2 * Math.PI * 330 * t) +
                0.05 * Math.sin(2 * Math.PI * 440 * t);
            
            // Apply envelope
            musicData[i] *= Math.min(1, 10 * (t % 0.5)) * Math.min(1, 10 * (0.5 - (t % 0.5)));
        }
        
        backgroundMusic.setBuffer(musicBuffer);
        backgroundMusic.setLoop(true);
        backgroundMusic.setVolume(0.3);
    }
    
    // Update UI for sound status
    document.getElementById('soundStatus').textContent = soundEnabled ? 'Sound: ON' : 'Sound: OFF';
}

// Toggle sound on/off
function toggleSound() {
    soundEnabled = !soundEnabled;
    
    if (soundEnabled) {
        if (audioListener) audioListener.setMasterVolume(1.0);
        if (backgroundMusic && !backgroundMusic.isPlaying && !gameOver) {
            backgroundMusic.play();
        }
        document.getElementById('soundStatus').textContent = 'Sound: ON';
    } else {
        if (audioListener) audioListener.setMasterVolume(0.0);
        document.getElementById('soundStatus').textContent = 'Sound: OFF';
    }
}