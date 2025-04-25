import * as THREE from 'three';
import { CONFIG, COLOR_SCHEMES } from './config.js';
import { SHAPES } from './shapes.js';

let particlesGeometry, particlesMaterial, particleSystem;
let currentPositions, sourcePositions, targetPositions, swarmPositions;
let particleSizes, particleOpacities, particleEffectStrengths;
let noise3D, noise4D;

const tempVec = new THREE.Vector3();
const sourceVec = new THREE.Vector3();
const targetVec = new THREE.Vector3();
const swarmVec = new THREE.Vector3();
const noiseOffset = new THREE.Vector3();
const flowVec = new THREE.Vector3();
const bezPos = new THREE.Vector3();
const swirlAxis = new THREE.Vector3();
const currentVec = new THREE.Vector3();

export function setupParticleSystem(scene) {
    targetPositions = SHAPES.map(shape => shape.generator(CONFIG.particleCount, CONFIG.shapeSize));
    particlesGeometry = new THREE.BufferGeometry();

    currentPositions = new Float32Array(targetPositions[0]);
    sourcePositions = new Float32Array(targetPositions[0]);
    swarmPositions = new Float32Array(CONFIG.particleCount * 3);
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

    particleSizes = new Float32Array(CONFIG.particleCount);
    particleOpacities = new Float32Array(CONFIG.particleCount);
    particleEffectStrengths = new Float32Array(CONFIG.particleCount);
    for (let i = 0; i < CONFIG.particleCount; i++) {
        particleSizes[i] = THREE.MathUtils.randFloat(CONFIG.particleSizeRange[0], CONFIG.particleSizeRange[1]);
        particleOpacities[i] = 1.0;
        particleEffectStrengths[i] = 0.0;
    }
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    particlesGeometry.setAttribute('opacity', new THREE.BufferAttribute(particleOpacities, 1));
    particlesGeometry.setAttribute('aEffectStrength', new THREE.BufferAttribute(particleEffectStrengths, 1));

    const colors = new Float32Array(CONFIG.particleCount * 3);
    updateColorArray(colors, currentPositions);
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    particlesMaterial = new THREE.ShaderMaterial({
        uniforms: {
            pointTexture: { value: createStarTexture() }
        },
        vertexShader: `
            attribute float size;
            attribute float opacity;
            attribute float aEffectStrength;
            varying vec3 vColor;
            varying float vOpacity;
            varying float vEffectStrength;

            void main() {
                vColor = color;
                vOpacity = opacity;
                vEffectStrength = aEffectStrength;

                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

                float sizeScale = 1.0 - vEffectStrength * ${CONFIG.morphSizeFactor.toFixed(2)};
                gl_PointSize = size * sizeScale * (400.0 / -mvPosition.z);

                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D pointTexture;
            varying vec3 vColor;
            varying float vOpacity;
            varying float vEffectStrength;

            void main() {
                float alpha = texture2D(pointTexture, gl_PointCoord).a;
                if (alpha < 0.05) discard;

                vec3 finalColor = vColor * (1.0 + vEffectStrength * ${CONFIG.morphBrightnessFactor.toFixed(2)});

                gl_FragColor = vec4(finalColor, alpha * vOpacity);
            }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: true,
        depthWrite: false,
        transparent: true,
        vertexColors: true
    });

    particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);
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

export function updateColorArray(colors, positionsArray) {
    const colorScheme = COLOR_SCHEMES[CONFIG.colorScheme];
    const center = new THREE.Vector3(0, 0, 0);
    const maxRadius = CONFIG.shapeSize * 1.1;
    for (let i = 0; i < CONFIG.particleCount; i++) {
        const i3 = i * 3;
        tempVec.fromArray(positionsArray, i3);
        const dist = tempVec.distanceTo(center);
        let hue;
        if (CONFIG.colorScheme === 'rainbow') {
            const normX = (tempVec.x / maxRadius + 1) / 2;
            const normY = (tempVec.y / maxRadius + 1) / 2;
            const normZ = (tempVec.z / maxRadius + 1) / 2;
            hue = (normX * 120 + normY * 120 + normZ * 120) % 360;
        } else {
            hue = THREE.MathUtils.mapLinear(dist, 0, maxRadius, colorScheme.startHue, colorScheme.endHue);
        }
        const noiseValue = (noise3D(tempVec.x * 0.2, tempVec.y * 0.2, tempVec.z * 0.2) + 1) * 0.5;
        const saturation = THREE.MathUtils.clamp(colorScheme.saturation * (0.9 + noiseValue * 0.2), 0, 1);
        const lightness = THREE.MathUtils.clamp(colorScheme.lightness * (0.85 + noiseValue * 0.3), 0.1, 0.9);
        const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);
        color.toArray(colors, i3);
    }
}

export function updateColors() {
    const colors = particlesGeometry.attributes.color.array;
    updateColorArray(colors, particlesGeometry.attributes.position.array);
    particlesGeometry.attributes.color.needsUpdate = true;
}

export function getParticleSystem() {
    return particleSystem;
}

export function getParticlesGeometry() {
    return particlesGeometry;
}

export function getCurrentPositions() {
    return currentPositions;
}

export function getSourcePositions() {
    return sourcePositions;
}

export function getTargetPositions() {
    return targetPositions;
}

export function getSwarmPositions() {
    return swarmPositions;
}

export function getParticleEffectStrengths() {
    return particleEffectStrengths;
}

export function setNoiseFunctions(noise3DFunc, noise4DFunc) {
    noise3D = noise3DFunc;
    noise4D = noise4DFunc;
} 