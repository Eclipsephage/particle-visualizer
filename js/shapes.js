import * as THREE from 'three';
import { CONFIG } from './config.js';

const tempVec = new THREE.Vector3();

export function generateSphere(count, size) {
    const points = new Float32Array(count * 3);
    const phi = Math.PI * (Math.sqrt(5) - 1);
    for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        points[i * 3] = x * size;
        points[i * 3 + 1] = y * size;
        points[i * 3 + 2] = z * size;
    }
    return points;
}

export function generateCube(count, size) {
    const points = new Float32Array(count * 3);
    const halfSize = size / 2;
    for (let i = 0; i < count; i++) {
        const face = Math.floor(Math.random() * 6);
        const u = Math.random() * size - halfSize;
        const v = Math.random() * size - halfSize;
        switch (face) {
            case 0: points.set([halfSize, u, v], i * 3); break;
            case 1: points.set([-halfSize, u, v], i * 3); break;
            case 2: points.set([u, halfSize, v], i * 3); break;
            case 3: points.set([u, -halfSize, v], i * 3); break;
            case 4: points.set([u, v, halfSize], i * 3); break;
            case 5: points.set([u, v, -halfSize], i * 3); break;
        }
    }
    return points;
}

export function generatePyramid(count, size) {
    const points = new Float32Array(count * 3);
    const halfBase = size / 2;
    const height = size * 1.2;
    const apex = new THREE.Vector3(0, height / 2, 0);
    const baseVertices = [
        new THREE.Vector3(-halfBase, -height / 2, -halfBase),
        new THREE.Vector3(halfBase, -height / 2, -halfBase),
        new THREE.Vector3(halfBase, -height / 2, halfBase),
        new THREE.Vector3(-halfBase, -height / 2, halfBase)
    ];
    const baseArea = size * size;
    const sideFaceHeight = Math.sqrt(Math.pow(height, 2) + Math.pow(halfBase, 2));
    const sideFaceArea = 0.5 * size * sideFaceHeight;
    const totalArea = baseArea + 4 * sideFaceArea;
    const baseWeight = baseArea / totalArea;
    const sideWeight = sideFaceArea / totalArea;

    for (let i = 0; i < count; i++) {
        const r = Math.random();
        let p = new THREE.Vector3();
        let u, v;
        if (r < baseWeight) {
            u = Math.random();
            v = Math.random();
            p.lerpVectors(baseVertices[0], baseVertices[1], u);
            const p2 = new THREE.Vector3().lerpVectors(baseVertices[3], baseVertices[2], u);
            p.lerp(p2, v);
        } else {
            const faceIndex = Math.floor((r - baseWeight) / sideWeight);
            const v1 = baseVertices[faceIndex];
            const v2 = baseVertices[(faceIndex + 1) % 4];
            u = Math.random();
            v = Math.random();
            if (u + v > 1) {
                u = 1 - u;
                v = 1 - v;
            }
            p.addVectors(v1, tempVec.subVectors(v2, v1).multiplyScalar(u));
            p.add(tempVec.subVectors(apex, v1).multiplyScalar(v));
        }
        points.set([p.x, p.y, p.z], i * 3);
    }
    return points;
}

export function generateTorus(count, size) {
    const points = new Float32Array(count * 3);
    const R = size * 0.7;
    const r = size * 0.3;
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        const x = (R + r * Math.cos(phi)) * Math.cos(theta);
        const y = r * Math.sin(phi);
        const z = (R + r * Math.cos(phi)) * Math.sin(theta);
        points[i * 3] = x;
        points[i * 3 + 1] = y;
        points[i * 3 + 2] = z;
    }
    return points;
}

export function generateGalaxy(count, size) {
    const points = new Float32Array(count * 3);
    const arms = 4;
    const armWidth = 0.6;
    const bulgeFactor = 0.3;
    for (let i = 0; i < count; i++) {
        const t = Math.pow(Math.random(), 1.5);
        const radius = t * size;
        const armIndex = Math.floor(Math.random() * arms);
        const armOffset = (armIndex / arms) * Math.PI * 2;
        const rotationAmount = radius / size * 6;
        const angle = armOffset + rotationAmount;
        const spread = (Math.random() - 0.5) * armWidth * (1 - radius / size);
        const theta = angle + spread;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        const y = (Math.random() - 0.5) * size * 0.1 * (1 - radius / size * bulgeFactor);
        points[i * 3] = x;
        points[i * 3 + 1] = y;
        points[i * 3 + 2] = z;
    }
    return points;
}

export function generateWave(count, size) {
    const points = new Float32Array(count * 3);
    const waveScale = size * 0.4;
    const frequency = 3;
    for (let i = 0; i < count; i++) {
        const u = Math.random() * 2 - 1;
        const v = Math.random() * 2 - 1;
        const x = u * size;
        const z = v * size;
        const dist = Math.sqrt(u * u + v * v);
        const angle = Math.atan2(v, u);
        const y = Math.sin(dist * Math.PI * frequency) * Math.cos(angle * 2) * waveScale * (1 - dist);
        points[i * 3] = x;
        points[i * 3 + 1] = y;
        points[i * 3 + 2] = z;
    }
    return points;
}

export const SHAPES = [
    { name: 'Sphere', generator: generateSphere },
    { name: 'Cube', generator: generateCube },
    { name: 'Pyramid', generator: generatePyramid },
    { name: 'Torus', generator: generateTorus },
    { name: 'Galaxy', generator: generateGalaxy },
    { name: 'Wave', generator: generateWave }
]; 