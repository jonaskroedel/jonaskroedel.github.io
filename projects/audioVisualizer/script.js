let scene, camera, renderer, sphere, originalVertices;
let audioContext, analyser, dataArray, audioSource;
let sensitivity = 10, complexity = 32;
let audioDuration, audioBuffer;
let isPlaying = false;
let startTime;
let noiseValues = [];

// Initialize the Three.js scene
function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('visualizer-container').appendChild(renderer.domElement);

    updateSphere(); // Create the initial sphere

    camera.position.z = 3; // Position the camera

    // Add mouse control
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    renderer.domElement.addEventListener('mousedown', (e) => {
        isDragging = true;
    });

    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaMove = {
                x: e.offsetX - previousMousePosition.x,
                y: e.offsetY - previousMousePosition.y
            };

            sphere.rotation.y += deltaMove.x * 0.01;
            sphere.rotation.x += deltaMove.y * 0.01;
        }

        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };
    });

    renderer.domElement.addEventListener('mouseup', (e) => {
        isDragging = false;
    });

    animate(); // Start the animation loop
}

// Initialize noise values for organic movement
function initNoise() {
    noiseValues = [];
    for (let i = 0; i < complexity * complexity; i++) {
        noiseValues.push(Math.random());
    }
}

// Create and update the sphere
function updateSphere() {
    if (sphere) scene.remove(sphere); // Remove existing sphere if any
    const geometry = new THREE.SphereGeometry(1, complexity, complexity);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    originalVertices = sphere.geometry.attributes.position.array.slice(); // Save original vertices
    initNoise(); // Initialize noise values
}

// Initialize audio context and analyser
function initAudio(arrayBuffer) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    
    audioContext.decodeAudioData(arrayBuffer, (buffer) => {
        audioBuffer = buffer;
        audioDuration = buffer.duration;
        updateAudioControls(); // Set up audio controls
        
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    }, (error) => {
        console.error("Error decoding audio data", error);
    });
}

// Play audio
function playAudio() {
    if (isPlaying) return;
    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);

    startTime = audioContext.currentTime;
    audioSource.start(0);
    isPlaying = true;
    document.getElementById('play-pause').textContent = '⏸'; // Change button to pause symbol
}

// Pause audio
function pauseAudio() {
    if (!isPlaying) return;
    audioContext.suspend();
    isPlaying = false;
    document.getElementById('play-pause').textContent = '▶'; // Change button to play symbol
}

// Animate the sphere based on audio data
function animate() {
    requestAnimationFrame(animate);

    if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        
        const positions = sphere.geometry.attributes.position;
        const time = Date.now() * 0.001; // For smooth animation

        for (let i = 0; i < positions.count; i++) {
            const index = i * 3;
            const noiseValue = noiseValues[i];
            
            // Calculate audio offsets
            const freqIndex1 = Math.floor(i / 4) % dataArray.length;
            const freqIndex2 = Math.floor(i / 2) % dataArray.length;
            const freqIndex3 = i % dataArray.length;
            
            const audioOffset1 = dataArray[freqIndex1] / 256.0;
            const audioOffset2 = dataArray[freqIndex2] / 256.0;
            const audioOffset3 = dataArray[freqIndex3] / 256.0;

            const combinedOffset = (audioOffset1 + audioOffset2 + audioOffset3) / 3 * noiseValue;
            
            const originalX = originalVertices[index];
            const originalY = originalVertices[index + 1];
            const originalZ = originalVertices[index + 2];

            // Calculate spherical coordinates
            const radius = Math.sqrt(originalX**2 + originalY**2 + originalZ**2);
            const theta = Math.atan2(originalY, originalX);
            const phi = Math.acos(originalZ / radius);

            // Create wave-like deformations
            const deformation = Math.sin(5 * theta + time) * Math.cos(3 * phi + time) * combinedOffset * sensitivity / 30;

            const newRadius = radius * (1 + deformation);

            // Apply deformations
            positions.array[index] = newRadius * Math.sin(phi) * Math.cos(theta);
            positions.array[index + 1] = newRadius * Math.sin(phi) * Math.sin(theta);
            positions.array[index + 2] = newRadius * Math.cos(phi);
        }

        positions.needsUpdate = true; // Notify Three.js of geometry update

        // Update progress bar
        const currentTime = audioContext.currentTime - startTime;
        document.getElementById('progress-bar').value = (currentTime / audioDuration) * 100;
        document.getElementById('current-time').textContent = formatTime(currentTime);
    }

    renderer.render(scene, camera);
}

// Update audio controls (play/pause, progress bar)
function updateAudioControls() {
    const playPauseBtn = document.getElementById('play-pause');
    const progressBar = document.getElementById('progress-bar');
    const durationSpan = document.getElementById('duration');

    durationSpan.textContent = formatTime(audioDuration); // Display total duration

    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    });

    progressBar.addEventListener('input', (e) => {
        const seekTime = (e.target.value / 100) * audioDuration;
        if (isPlaying) {
            pauseAudio();
            audioSource.stop();
        }
        playAudio();
        audioSource.start(0, seekTime); // Seek to specific time in the audio
        startTime = audioContext.currentTime - seekTime;
    });
}

// Format time in minutes:seconds
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

// Handle file upload and initialize audio and visualizer
document.getElementById('audio-upload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        
        document.getElementById('upload-container').style.display = 'none';
        document.getElementById('visualizer-container').style.display = 'block';
        document.getElementById('audio-controls').style.display = 'block';

        initThreeJS(); // Initialize Three.js scene
        initAudio(arrayBuffer); // Initialize audio
    };

    reader.readAsArrayBuffer(file); // Read audio file as ArrayBuffer
});

// Adjust sensitivity
document.getElementById('sensitivity').addEventListener('input', (e) => {
    sensitivity = parseInt(e.target.value);
});

// Adjust complexity and update sphere
document.getElementById('complexity').addEventListener('input', (e) => {
    complexity = parseInt(e.target.value);
    updateSphere();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
