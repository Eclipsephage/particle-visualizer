export const CONFIG = {
    particleCount: 15000,
    shapeSize: 14,
    swarmDistanceFactor: 1.5,
    swirlFactor: 4.0,
    noiseFrequency: 0.1,
    noiseTimeScale: 0.04,
    noiseMaxStrength: 2.8,
    colorScheme: 'fire',
    morphDuration: 4000,
    particleSizeRange: [0.08, 0.25],
    starCount: 18000,
    bloomStrength: 1.3,
    bloomRadius: 0.5,
    bloomThreshold: 0.05,
    idleFlowStrength: 0.25,
    idleFlowSpeed: 0.08,
    idleRotationSpeed: 0.02,
    morphSizeFactor: 0.5,
    morphBrightnessFactor: 0.6
};

export const COLOR_SCHEMES = {
    fire: { startHue: 0, endHue: 45, saturation: 0.95, lightness: 0.6 },
    neon: { startHue: 300, endHue: 180, saturation: 1.0, lightness: 0.65 },
    nature: { startHue: 90, endHue: 160, saturation: 0.85, lightness: 0.55 },
    rainbow: { startHue: 0, endHue: 360, saturation: 0.9, lightness: 0.6 },
    ocean: { startHue: 180, endHue: 220, saturation: 0.9, lightness: 0.5 },
    sunset: { startHue: 15, endHue: 300, saturation: 0.95, lightness: 0.55 },
    arctic: { startHue: 200, endHue: 220, saturation: 0.3, lightness: 0.85 },
    volcanic: { startHue: 0, endHue: 30, saturation: 0.95, lightness: 0.45 },
    forest: { startHue: 100, endHue: 140, saturation: 0.8, lightness: 0.4 },
    grey: { startHue: 0, endHue: 0, saturation: 0, lightness: 0.3 }
}; 