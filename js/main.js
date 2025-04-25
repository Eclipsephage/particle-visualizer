import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { createNoise3D, createNoise4D } from 'simplex-noise';
import { CONFIG } from './config.js';
import { setupParticleSystem, setNoiseFunctions, updateColors } from './particles.js';
import { triggerMorph, updateMorphAnimation, updateIdleAnimation, getIsMorphing, getCurrentShapeIndex, setShapeIndex } from './animation.js';
import { SHAPES } from './shapes.js';

// Add morphToShape function
window.morphToShape = function(targetIndex) {
    const currentIndex = getCurrentShapeIndex();
    if (currentIndex === targetIndex) return; // Already showing this shape
    if (getIsMorphing()) return;
    
    // Set the current shape index and trigger morph
    if (setShapeIndex(targetIndex)) {
        triggerMorph(targetIndex);
    }
};

let scene, camera, renderer, controls, clock;
let composer, bloomPass;
let isInitialized = false;

function init() {
    let progress = 0;
    const progressBar = document.getElementById('progress');
    const loadingScreen = document.getElementById('loading');

    function updateProgress(increment) {
        progress += increment;
        progressBar.style.width = `${Math.min(100, progress)}%`;
        if (progress >= 100) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => { loadingScreen.style.display = 'none'; }, 600);
            }, 200);
        }
    }

    clock = new THREE.Clock();
    const noise3D = createNoise3D(() => Math.random());
    const noise4D = createNoise4D(() => Math.random());
    setNoiseFunctions(noise3D, noise4D);
    updateProgress(5);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000308, 0.03);
    updateProgress(5);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 28);
    camera.lookAt(scene.position);
    updateProgress(5);

    const canvas = document.getElementById('webglCanvas');
    renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true, 
        alpha: true, 
        powerPreference: 'high-performance' 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    updateProgress(10);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 80;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    updateProgress(5);

    setupLights();
    updateProgress(10);

    setupPostProcessing();
    updateProgress(10);

    createStarfield();
    updateProgress(15);

    setupParticleSystem(scene);
    updateProgress(25);

    // Set initial info text with shape and color
    document.getElementById('info').innerText = `Shape: ${SHAPES[getCurrentShapeIndex()].name} | Color: ${CONFIG.colorScheme}`;

    setupEventListeners();
    updateProgress(15);

    isInitialized = true;
    animate();
    console.log("Initialization complete.");
}

function setupLights() {
    scene.add(new THREE.AmbientLight(0x404060));
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(15, 20, 10);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0x88aaff, 0.9);
    dirLight2.position.set(-15, -10, -15);
    scene.add(dirLight2);
}

function setupPostProcessing() {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        CONFIG.bloomStrength,
        CONFIG.bloomRadius,
        CONFIG.bloomThreshold
    );
    composer.addPass(bloomPass);
}

function createStarfield() {
    const starVertices = [];
    const starSizes = [];
    const starColors = [];
    const starGeometry = new THREE.BufferGeometry();

    for (let i = 0; i < CONFIG.starCount; i++) {
        const tempVec = new THREE.Vector3(
            THREE.MathUtils.randFloatSpread(400),
            THREE.MathUtils.randFloatSpread(400),
            THREE.MathUtils.randFloatSpread(400)
        );
        if (tempVec.length() < 100) tempVec.setLength(100 + Math.random() * 300);
        starVertices.push(tempVec.x, tempVec.y, tempVec.z);
        starSizes.push(Math.random() * 0.15 + 0.05);
        
        const color = new THREE.Color();
        if (Math.random() < 0.1) {
            color.setHSL(Math.random(), 0.7, 0.65);
        } else {
            color.setHSL(0.6, Math.random() * 0.1, 0.8 + Math.random() * 0.2);
        }
        starColors.push(color.r, color.g, color.b);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));

    const starMaterial = new THREE.ShaderMaterial({
        uniforms: { pointTexture: { value: createStarTexture() } },
        vertexShader: `
            attribute float size;
            varying vec3 vColor;
            varying float vSize;
            void main() {
                vColor = color;
                vSize = size;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (400.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D pointTexture;
            varying vec3 vColor;
            varying float vSize;
            void main() {
                float alpha = texture2D(pointTexture, gl_PointCoord).a;
                if (alpha < 0.1) discard;
                gl_FragColor = vec4(vColor, alpha * 0.9);
            }
        `,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        vertexColors: true
    });

    scene.add(new THREE.Points(starGeometry, starMaterial));
}

function createStarTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
}

function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', (e) => {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
            e.target.classList.add('active');
            CONFIG.colorScheme = e.target.dataset.scheme;
            updateColors();
            document.getElementById('info').innerText = `Shape: ${SHAPES[getCurrentShapeIndex()].name} | Color: ${CONFIG.colorScheme}`;
        });
    });
    document.querySelector(`.color-option[data-scheme="${CONFIG.colorScheme}"]`).classList.add('active');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (!isInitialized) return;

    const elapsedTime = clock.getElapsedTime();
    const deltaTime = clock.getDelta();
    controls.update();

    if (getIsMorphing()) {
        updateMorphAnimation(elapsedTime, deltaTime);
    } else {
        updateIdleAnimation(elapsedTime, deltaTime);
    }

    composer.render(deltaTime);
}

// Initialize the application
init(); 