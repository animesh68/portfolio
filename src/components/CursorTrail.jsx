import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

/**
 * Premium Fluid Cursor Trail using Three.js and Post-Processing.
 * 
 * - Generates a CatmullRomCurve3 based on trailing mouse coordinates.
 * - Constructs a dynamic TRIANGLE_STRIP BufferGeometry for variable thickness.
 * - Employs a Custom ShaderMaterial for organic neon color gradients and soft edges.
 * - Uses UnrealBloomPass to add a stunning glowing aura.
 * - Uses 'mix-blend-mode: screen' on the canvas to perfectly overlay DOM content transparently.
 */

// Custom Shader for the Ribbon
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1; // Head Color
  uniform vec3 uColor2; // Mid Color
  uniform vec3 uColor3; // Tail Color

  varying vec2 vUv;

  void main() {
    // Distance along the trail: vUv.x (0.0 is the head, 1.0 is the tail)
    // Cross section: vUv.y (0.0 to 1.0 edge to edge)

    // Dynamic color gradient moving along the line
    float colorMix = vUv.x + sin(uTime * 3.0 - vUv.x * 10.0) * 0.1;
    colorMix = clamp(colorMix, 0.0, 1.0);

    vec3 baseColor;
    if(colorMix < 0.5) {
      baseColor = mix(uColor1, uColor2, colorMix * 2.0);
    } else {
      baseColor = mix(uColor2, uColor3, (colorMix - 0.5) * 2.0);
    }

    // Soft Edge Glow (fade out at the lateral edges of the ribbon)
    // sin(vUv.y * PI) creates a nice bell curve reaching 1.0 at the center
    float edgeProfile = sin(vUv.y * 3.14159265);
    edgeProfile = pow(edgeProfile, 1.5); // sharpen the core

    // Tail Falloff (trail gets transparent at the end)
    float tailProfile = smoothstep(1.0, 0.0, vUv.x);

    float alpha = edgeProfile * tailProfile;

    // Additive output
    gl_FragColor = vec4(baseColor * alpha, alpha);
  }
`;

export default function CursorTrail() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // Orthographic Camera is ideal for exactly matching screen pixel coordinates!
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Crucial for UnrealBloomPass over the DOM:
    // We clear to solid black, and the canvas CSS uses mix-blend-mode: screen.
    renderer.setClearColor(0x000000, 1);
    mount.appendChild(renderer.domElement);

    // 2. Post-Processing Setup
    const composer = new EffectComposer(renderer);
    
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // UnrealBloomPass(resolution, strength, radius, threshold)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 2.0, 0.8, 0.1);
    composer.addPass(bloomPass);

    // 3. Trail Geometry Setup
    const HISTORY_SIZE = 40; // How many past mouse frames to store
    const SPLINE_SAMPLES = 120; // How smoothed the final geometry should be

    const pointHistory = [];
    for (let i = 0; i < HISTORY_SIZE; i++) {
        // Start out of screen initially
        pointHistory.push(new THREE.Vector3(-9999, -9999, 0));
    }

    // A TRIANGLE_STRIP requires 2 vertices per curve step
    const vertexCount = SPLINE_SAMPLES * 2;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);

    // Initialize UVs (they never change, only positions do)
    for (let i = 0; i < SPLINE_SAMPLES; i++) {
        const uvX = i / (SPLINE_SAMPLES - 1); // 0 at head, 1 at tail

        // Left vertex
        uvs[(i * 2 + 0) * 2 + 0] = uvX;
        uvs[(i * 2 + 0) * 2 + 1] = 0;

        // Right vertex
        uvs[(i * 2 + 1) * 2 + 0] = uvX;
        uvs[(i * 2 + 1) * 2 + 1] = 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    // Modern Three.js drops support for TriangleStripDrawMode on standard Meshes,
    // so we construct a proper indexed Triangle Buffer:
    const indices = [];
    for (let i = 0; i < SPLINE_SAMPLES - 1; i++) {
        const v = i * 2;
        // Triangle 1
        indices.push(v, v + 1, v + 2);
        // Triangle 2
        indices.push(v + 1, v + 3, v + 2);
    }
    geometry.setIndex(indices);

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uColor1: { value: new THREE.Color('#00ffff') }, // Cyan head
            uColor2: { value: new THREE.Color('#8a2be2') }, // Purple mid
            uColor3: { value: new THREE.Color('#ff007f') }, // Neon pink tail
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 4. Mouse Tracking
    const currentMouse = new THREE.Vector3(-9999, -9999, 0);

    const onPointerMove = (e) => {
        // Map native pixels to Orthographic Camera coordinates mapping center to 0,0
        currentMouse.x = e.clientX - width / 2;
        currentMouse.y = -(e.clientY - height / 2);
    };
    window.addEventListener('pointermove', onPointerMove);

    const onResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        
        camera.left = -width / 2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = -height / 2;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        composer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 5. Animation Loop
    const clock = new THREE.Clock();
    let requestID;

    const animate = () => {
        requestID = requestAnimationFrame(animate);
        const uTime = clock.getElapsedTime();
        material.uniforms.uTime.value = uTime;

        // Fluid & Elastic point trailing
        // - Head chases the mouse actively
        pointHistory[0].lerp(currentMouse, 0.4);
        
        // - Rest of the body chases the point ahead of it
        for (let i = 1; i < HISTORY_SIZE; i++) {
            // Further back points are slightly "heavier" or follow with a different spring factor. 
            // 0.35 creates a lovely whip/elastic delay effect.
            pointHistory[i].lerp(pointHistory[i - 1], 0.35);
        }

        // We need a CatmullRomCurve3 to smooth out jagged angles naturally
        const curve = new THREE.CatmullRomCurve3(pointHistory);
        const smoothPoints = curve.getPoints(SPLINE_SAMPLES - 1);

        // Build the Triangle Strip geometry for this frame
        for (let i = 0; i < SPLINE_SAMPLES; i++) {
            const point = smoothPoints[i];

            // Direction tangent to figure out extrusion sideways
            let tangent;
            if (i < SPLINE_SAMPLES - 1) {
                tangent = new THREE.Vector3().subVectors(smoothPoints[i + 1], point);
            } else {
                tangent = new THREE.Vector3().subVectors(point, smoothPoints[i - 1]);
            }
            
            if (tangent.lengthSq() > 0.0001) {
                tangent.normalize();
            } else {
                tangent.set(1, 0, 0); // Fallback to avoid NaN
            }

            // Normal is 2D perpendicular to the tangent
            const normal = new THREE.Vector3(-tangent.y, tangent.x, 0);

            // Dynamically calculate thickness (tapers out at the tail)
            const progress = i / (SPLINE_SAMPLES - 1); // 0 at head, 1 at tail
            // Slight wave distortion combined with taper-down 
            const baseThickness = 12.0 * (1.0 - progress); 
            const wave = Math.sin(progress * 10.0 - uTime * 5.0) * 2.0;
            const thickness = Math.max(0.1, baseThickness + wave);

            // Left Vertex
            positions[(i * 2 + 0) * 3 + 0] = point.x - normal.x * thickness;
            positions[(i * 2 + 0) * 3 + 1] = point.y - normal.y * thickness;
            positions[(i * 2 + 0) * 3 + 2] = point.z;

            // Right Vertex
            positions[(i * 2 + 1) * 3 + 0] = point.x + normal.x * thickness;
            positions[(i * 2 + 1) * 3 + 1] = point.y + normal.y * thickness;
            positions[(i * 2 + 1) * 3 + 2] = point.z;
        }

        // Notify Three.js that vertices have drastically changed
        geometry.attributes.position.needsUpdate = true;

        // Render via EffectComposer for the UnrealBloom
        composer.render();
    };

    animate();

    return () => {
        cancelAnimationFrame(requestID);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', onResize);
        
        if (mount) mount.removeChild(renderer.domElement);
        
        geometry.dispose();
        material.dispose();
        composer.dispose();
        renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      // Important CSS to ensure the Trail acts as a pure visual overlay
      // 'mixBlendMode: screen' removes the black renderer background seamlessly!
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999, // Floating above everything
        pointerEvents: 'none', // Do not block UI clicks!
        mixBlendMode: 'screen'
      }} 
    />
  );
}
