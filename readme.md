# Particle Visualizer

A mesmerizing 3D particle visualization tool that creates beautiful morphing shapes with dynamic color schemes and smooth animations.

## Features

- **Interactive 3D Visualization**: View and interact with particle systems in real-time
- **Shape Morphing**: Smooth transitions between different geometric shapes
- **Dynamic Color Schemes**: Choose from multiple color presets (Fire, Neon, Nature, Rainbow)
- **Real-time Controls**: Interactive camera controls and shape morphing
- **Performance Optimized**: Efficient particle rendering and animation system
- **Responsive Design**: Adapts to different screen sizes and devices

## Getting Started

### Prerequisites
- Python 3.x (for local server)
- Modern web browser with WebGL support (Chrome recommended)

### Running the Visualization

1. **Start the Local Server**:
   ```bash
   # Navigate to the project directory
   cd particleVisualizer

   # Start the Python HTTP server
   python -m http.server 8000
   ```

2. **View the Visualization**:
   - Open your web browser
   - Navigate to: `http://localhost:8000`
   - The visualization will start automatically after loading

3. **Controls**:
   - Left-click anywhere to trigger shape morphing
   - Right-click and drag to rotate the camera view
   - Scroll to zoom in/out
   - Use the "Change Shape" button at the bottom to manually trigger morphing
   - Click the color options to change the color scheme

## File Structure

```
particleVisualizer/
├── index.html              # Main entry point
├── readme.md               # Project documentation
├── js/
│   ├── main.js             # Application initialization and coordination
│   ├── animation.js        # Morphing and movement animations
│   ├── particles.js        # Particle system management
│   ├── shapes.js           # Shape generation functions
│   └── config.js           # Configuration constants
└── css/
    ├── main.css            # Base styles
    ├── ui.css              # Control interface styles
    └── loading.css         # Loading screen styles
```

## Module Overview

### Core Modules
- **main.js**: Initializes the application, sets up Three.js scene, and coordinates all modules
- **animation.js**: Handles particle morphing and movement animations
- **particles.js**: Manages particle system creation, updates, and rendering
- **shapes.js**: Contains functions for generating different geometric shapes
- **config.js**: Centralized configuration for all adjustable parameters

### Style Modules
- **main.css**: Base styles for the application
- **ui.css**: Styles for the control interface and color picker
- **loading.css**: Styles for the loading screen and progress bar

## Technical Details

- Built with Three.js for 3D rendering
- Uses WebGL for hardware-accelerated graphics
- Implements custom shaders for particle effects
- Utilizes simplex-noise for procedural generation
- Employs anime.js for smooth animations

## Dependencies

- Three.js (v0.163.0)
- Anime.js (v3.2.2)
- Simplex-noise (v4.0.1)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance Notes

- Optimized for modern browsers with WebGL support
- Particle count and effects can be adjusted in `config.js`
- Performance may vary based on device capabilities

## Development

To modify or extend the project:

1. Adjust parameters in `config.js` for different effects
2. Add new shapes in `shapes.js`
3. Modify animation behavior in `animation.js`
4. Update particle system in `particles.js`
5. Customize styles in the CSS files

## Troubleshooting

If the visualization doesn't start:
1. Ensure you're using a modern browser with WebGL support
2. Check the browser console (F12) for any error messages
3. Try a hard refresh (Ctrl + Shift + R or Ctrl + F5)
4. Verify that all files are being served correctly (check server logs)

## License

This project is open source and available under the MIT License.
