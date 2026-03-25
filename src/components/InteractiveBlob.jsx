import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * InteractiveBlob Component
 * 
 * Tech Stack: React + Vanilla Three.js (for explicit control of the render loop and shaders)
 * 
 * Features:
 * - High subdivision IcosahedronGeometry to allow detailed vertex manipulation.
 * - Custom GLSL ShaderMaterial utilizing Simplex 3D noise for organic, pulsating vertex distortion.
 * - Raycaster integration: the blob reacts dynamically when hovered by deforming towards the mouse constraint.
 * - Custom lighting in the fragment shader with Iridescent (Fresnel) edge glowing effects.
 * - Responsive to window sizing.
 * - Clean standard requestAnimationFrame loop and modular uniform controls.
 */

// --- GLSL SHADERS ---

// Simplex 3D Noise function for organic motion and distortion.
const vertexShader = `
  // Uniforms passed from Javascript
  uniform float uTime;
  uniform vec3 uMouseHit;
  uniform float uHoverState;
  
  // Varyings to pass varying data to the fragment shader
  varying vec2 vUv;
  varying float vNoise;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  // Ashima's Simplex 3D Noise implementation
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) { 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vUv = uv;
    vNormal = normal;

    // Organic Breathing Effect using noise
    // The scale of the position coordinates passed into snoise determines the frequency of the waves
    float noiseValue = snoise(position * 1.5 + uTime * 0.4);
    
    // The base transformation: pushing vertices outwards along the normal vector smoothly
    vec3 newPosition = position + normal * (noiseValue * 0.3);

    // Interactive Hover Distortion Effect
    // Transform vertex position to world space to compare with mouse hit point
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    
    // Calculate distance from this vertex to the raycast hit point on the mesh
    float distToMouse = distance(worldPosition.xyz, uMouseHit);
    
    // Smoothstep creates a soft radius of influence around the hit point
    float influence = smoothstep(1.5, 0.0, distToMouse) * uHoverState;
    
    // Deform the mesh outwards where the mouse is hovering
    newPosition += normal * (influence * 0.6);

    // Pass the calculated noise + hover influence to the fragment shader for dynamic color mapping
    vNoise = noiseValue + (influence * 0.5);

    // Calculate transformed position
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uColorA; // Deep Base Color
  uniform vec3 uColorB; // Vibrant Accent Color
  
  varying vec2 vUv;
  varying float vNoise;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    // Determine the fragment's base color depending on the noise passed from the vertex shader.
    // This makes the peaks and valleys of the geometry differently colored.
    float colorMix = smoothstep(-1.0, 1.0, vNoise);
    vec3 baseColor = mix(uColorA, uColorB, colorMix);
    
    // ----------------------------------------------------
    // Lighting Math
    // ----------------------------------------------------
    
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // 1. Point light simulation
    // Placing a light high and slightly in front
    vec3 lightDir = normalize(vec3(5.0, 5.0, 5.0));
    float diffuse = max(dot(normal, lightDir), 0.0);
    
    // 2. Ambient light base
    vec3 ambient = baseColor * 0.3;

    // 3. Fresnel Effect (Iridescence / Edge Glow)
    // Computes the angle between view direction and normal surface
    // Closer to 0 means the surface is grazing the view angle (producing a highlight)
    float fresnelTerm = dot(viewDir, normal);
    fresnelTerm = clamp(1.0 - fresnelTerm, 0.0, 1.0);
    fresnelTerm = pow(fresnelTerm, 3.0); // Sharpen the edge curve
    
    // We add a bright cyan tint glowing on the silhouette of the sphere
    vec3 fresnelColor = vec3(0.1, 0.9, 0.8);

    // Final color composition
    vec3 finalColor = ambient + (baseColor * diffuse * 0.8) + (fresnelColor * fresnelTerm * 1.2);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;


export default function InteractiveBlob() {
  const mountRef = useRef(null);

  useEffect(() => {
    // ----------------------------------------------------
    // 1. Scene Setup
    // ----------------------------------------------------
    const mount = mountRef.current;
    
    const scene = new THREE.Scene();
    scene.background = null; // transparent background

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // ----------------------------------------------------
    // 2. Geometry & Shader Material Setup
    // ----------------------------------------------------
    // Icosahedron with detail = 64 results in very high-poly sphere perfect for smooth vertex deformation
    const geometry = new THREE.IcosahedronGeometry(2, 64);
    
    // Uniforms dictionary passed to shaders
    const uniforms = {
      uTime: { value: 0.0 },
      uMouseHit: { value: new THREE.Vector3(0, 0, 0) },
      uHoverState: { value: 0.0 }, // 0 = none, 1 = fully hovered
      uColorA: { value: new THREE.Color('#310b8e') }, // Deep purple
      uColorB: { value: new THREE.Color('#ff007f') }, // Neon pink
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      wireframe: false,
    });

    const blobMesh = new THREE.Mesh(geometry, material);
    scene.add(blobMesh);

    // Optional: add a subtle trailing aura / glow backplate (a slightly larger transparent sphere)
    const auraGeometry = new THREE.IcosahedronGeometry(2.3, 32);
    const auraMaterial = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      transparent: true,
      opacity: 0.05,
      wireframe: true,
      blending: THREE.AdditiveBlending
    });
    const auraMesh = new THREE.Mesh(auraGeometry, auraMaterial);
    scene.add(auraMesh);

    // ----------------------------------------------------
    // 3. Controls & Interactivity 
    // ----------------------------------------------------
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // Limit Orbit to cleanly center UI:
    controls.enablePan = false;
    controls.enableZoom = false; // Disable zoom to prevent scroll hijacking
    controls.minDistance = 4;
    controls.maxDistance = 12;
    
    // Allow vertical scrolling on mobile touch devices
    renderer.domElement.style.touchAction = 'pan-y';

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isHovering = false;

    // We track target mouse coordinates and hit vectors to smoothly LERP values
    const targetHitPosition = new THREE.Vector3();

    const onPointerMove = (event) => {
      // Normalize mouse coordinates for Raycaster
      const rect = mount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(blobMesh);

      if (intersects.length > 0) {
        isHovering = true;
        // Continuously update the target hit position towards where the ray strikes the geometry surface
        targetHitPosition.copy(intersects[0].point);
      } else {
        isHovering = false;
      }
    };

    const onWindowResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('pointermove', onPointerMove);

    // ----------------------------------------------------
    // 4. Request Animation Frame Loop
    // ----------------------------------------------------
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      
      // Update Uniforms
      material.uniforms.uTime.value = elapsedTime;

      // Smoothly interpolate the hit position towards the actual mouse intersection
      material.uniforms.uMouseHit.value.lerp(targetHitPosition, 0.1);

      // Smoothly interpolate the hover interaction float (0 to 1) 
      const targetHover = isHovering ? 1.0 : 0.0;
      material.uniforms.uHoverState.value += (targetHover - material.uniforms.uHoverState.value) * 0.1;

      // Slightly rotate the mesh for constant dynamic feel
      blobMesh.rotation.y = elapsedTime * 0.1;
      blobMesh.rotation.x = elapsedTime * 0.05;
      
      // Slowly rotate the aura opposite direction
      auraMesh.rotation.y = -elapsedTime * 0.05;
      auraMesh.rotation.z = elapsedTime * 0.02;

      controls.update(); // required if damping enabled
      renderer.render(scene, camera);
    };

    animate();

    // ----------------------------------------------------
    // Cleanup
    // ----------------------------------------------------
    return () => {
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('pointermove', onPointerMove);
      if (mount) {
        mount.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      auraGeometry.dispose();
      auraMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ width: '100%', height: '100%', position: 'relative' }} 
      className="interactive-blob-container"
    />
  );
}
