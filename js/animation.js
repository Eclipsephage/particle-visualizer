import * as THREE from 'three';
import { createNoise3D, createNoise4D } from 'simplex-noise';
import { CONFIG } from './config.js';
import { SHAPES } from './shapes.js';
import anime from 'animejs';
import {
    getParticlesGeometry,
    getCurrentPositions,
    getSourcePositions,
    getTargetPositions,
    getSwarmPositions,
    getParticleEffectStrengths,
    updateColors
} from './particles.js';

// Create noise functions
const noise3D = createNoise3D(() => Math.random());
const noise4D = createNoise4D(() => Math.random());

let currentShapeIndex = 0;
let isMorphing = false;
let morphTimeline = null;
const morphState = { progress: 0.0 };

const tempVec = new THREE.Vector3();
const sourceVec = new THREE.Vector3();
const targetVec = new THREE.Vector3();
const swarmVec = new THREE.Vector3();
const noiseOffset = new THREE.Vector3();
const flowVec = new THREE.Vector3();
const bezPos = new THREE.Vector3();
const swirlAxis = new THREE.Vector3();
const currentVec = new THREE.Vector3();

export function triggerMorph() {
    if (isMorphing) return;
    isMorphing = true;
    console.log("Morphing triggered...");
    document.getElementById('info').innerText = `Morphing...`;
    document.getElementById('info').style.textShadow = '0 0 8px rgba(255, 150, 50, 0.9)';

    const sourcePositions = getSourcePositions();
    const currentPositions = getCurrentPositions();
    const swarmPositions = getSwarmPositions();
    const targetPositions = getTargetPositions();

    sourcePositions.set(currentPositions);
    const nextShapeIndex = (currentShapeIndex + 1) % SHAPES.length;
    const nextTargetPositions = targetPositions[nextShapeIndex];
    const centerOffsetAmount = CONFIG.shapeSize * CONFIG.swarmDistanceFactor;

    for (let i = 0; i < CONFIG.particleCount; i++) {
        const i3 = i * 3;
        sourceVec.fromArray(sourcePositions, i3);
        targetVec.fromArray(nextTargetPositions, i3);
        swarmVec.lerpVectors(sourceVec, targetVec, 0.5);
        const offsetDir = tempVec.set(
            noise3D(i * 0.05, 10, 10),
            noise3D(20, i * 0.05, 20),
            noise3D(30, 30, i * 0.05)
        ).normalize();
        const distFactor = sourceVec.distanceTo(targetVec) * 0.1 + centerOffsetAmount;
        swarmVec.addScaledVector(offsetDir, distFactor * (0.5 + Math.random() * 0.8));
        swarmPositions[i3] = swarmVec.x;
        swarmPositions[i3 + 1] = swarmVec.y;
        swarmPositions[i3 + 2] = swarmVec.z;
    }

    currentShapeIndex = nextShapeIndex;
    morphState.progress = 0;

    if (morphTimeline) morphTimeline.pause();
    morphTimeline = anime({
        targets: morphState,
        progress: 1,
        duration: CONFIG.morphDuration,
        easing: 'cubicBezier(0.4, 0.0, 0.2, 1.0)',
        complete: () => {
            console.log("Morphing complete.");
            document.getElementById('info').innerText = `Shape: ${SHAPES[currentShapeIndex].name} (Click to morph)`;
            document.getElementById('info').style.textShadow = '0 0 5px rgba(0, 128, 255, 0.8)';
            currentPositions.set(targetPositions[currentShapeIndex]);
            getParticlesGeometry().attributes.position.needsUpdate = true;
            getParticleEffectStrengths().fill(0.0);
            getParticlesGeometry().attributes.aEffectStrength.needsUpdate = true;
            sourcePositions.set(targetPositions[currentShapeIndex]);
            updateColors();
            isMorphing = false;
        }
    });
}

export function updateMorphAnimation(elapsedTime, deltaTime) {
    if (!isMorphing) return;

    const t = morphState.progress;
    const positions = getCurrentPositions();
    const effectStrengths = getParticleEffectStrengths();
    const sourcePositions = getSourcePositions();
    const swarmPositions = getSwarmPositions();
    const targets = getTargetPositions()[currentShapeIndex];

    const effectStrength = Math.sin(t * Math.PI);
    const currentSwirl = effectStrength * CONFIG.swirlFactor * deltaTime * 50;
    const currentNoise = effectStrength * CONFIG.noiseMaxStrength;

    for (let i = 0; i < CONFIG.particleCount; i++) {
        const i3 = i * 3;
        sourceVec.fromArray(sourcePositions, i3);
        swarmVec.fromArray(swarmPositions, i3);
        targetVec.fromArray(targets, i3);

        const t_inv = 1.0 - t;
        const t_inv_sq = t_inv * t_inv;
        const t_sq = t * t;
        bezPos.copy(sourceVec).multiplyScalar(t_inv_sq);
        bezPos.addScaledVector(swarmVec, 2.0 * t_inv * t);
        bezPos.addScaledVector(targetVec, t_sq);

        if (currentSwirl > 0.01) {
            tempVec.subVectors(bezPos, sourceVec);
            swirlAxis.set(
                noise3D(i * 0.02, elapsedTime * 0.1, 0),
                noise3D(0, i * 0.02, elapsedTime * 0.1 + 5),
                noise3D(elapsedTime * 0.1 + 10, 0, i * 0.02)
            ).normalize();
            tempVec.applyAxisAngle(swirlAxis, currentSwirl * (0.5 + Math.random() * 0.5));
            bezPos.copy(sourceVec).add(tempVec);
        }

        if (currentNoise > 0.01) {
            const noiseTime = elapsedTime * CONFIG.noiseTimeScale;
            noiseOffset.set(
                noise4D(bezPos.x * CONFIG.noiseFrequency, bezPos.y * CONFIG.noiseFrequency, bezPos.z * CONFIG.noiseFrequency, noiseTime),
                noise4D(bezPos.x * CONFIG.noiseFrequency + 100, bezPos.y * CONFIG.noiseFrequency + 100, bezPos.z * CONFIG.noiseFrequency + 100, noiseTime),
                noise4D(bezPos.x * CONFIG.noiseFrequency + 200, bezPos.y * CONFIG.noiseFrequency + 200, bezPos.z * CONFIG.noiseFrequency + 200, noiseTime)
            );
            bezPos.addScaledVector(noiseOffset, currentNoise);
        }

        positions[i3] = bezPos.x;
        positions[i3 + 1] = bezPos.y;
        positions[i3 + 2] = bezPos.z;

        effectStrengths[i] = effectStrength;
    }

    getParticlesGeometry().attributes.position.needsUpdate = true;
    getParticlesGeometry().attributes.aEffectStrength.needsUpdate = true;
}

export function updateIdleAnimation(elapsedTime, deltaTime) {
    const positions = getCurrentPositions();
    const effectStrengths = getParticleEffectStrengths();
    const sourcePositions = getSourcePositions();

    const breathScale = 1.0 + Math.sin(elapsedTime * 0.5) * 0.015;
    const timeScaled = elapsedTime * CONFIG.idleFlowSpeed;
    const freq = 0.1;

    let needsEffectStrengthReset = false;

    for (let i = 0; i < CONFIG.particleCount; i++) {
        const i3 = i * 3;
        sourceVec.fromArray(sourcePositions, i3);
        tempVec.copy(sourceVec).multiplyScalar(breathScale);
        flowVec.set(
            noise4D(tempVec.x * freq, tempVec.y * freq, tempVec.z * freq, timeScaled),
            noise4D(tempVec.x * freq + 10, tempVec.y * freq + 10, tempVec.z * freq + 10, timeScaled),
            noise4D(tempVec.x * freq + 20, tempVec.y * freq + 20, tempVec.z * freq + 20, timeScaled)
        );
        tempVec.addScaledVector(flowVec, CONFIG.idleFlowStrength);
        currentVec.fromArray(positions, i3);
        currentVec.lerp(tempVec, 0.05);
        positions[i3] = currentVec.x;
        positions[i3 + 1] = currentVec.y;
        positions[i3 + 2] = currentVec.z;

        if (effectStrengths[i] !== 0.0) {
            effectStrengths[i] = 0.0;
            needsEffectStrengthReset = true;
        }
    }

    getParticlesGeometry().attributes.position.needsUpdate = true;
    if (needsEffectStrengthReset) {
        getParticlesGeometry().attributes.aEffectStrength.needsUpdate = true;
    }
}

export function getIsMorphing() {
    return isMorphing;
}

export function getCurrentShapeIndex() {
    return currentShapeIndex;
} 