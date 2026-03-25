import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// -- The provided Spline Data --
const curvePath = [
  10.136184463414924, -1.374508746897471, 10.384881573913269,
  9.1152593889854714, -1.374508746897471, 8.5846792797570011,
  9.0669355709754882, -1.0665123466336568, 5.8937771631608156,
  10.151040177840205, -0.65913653144937956, 3.4340491740541346,
  10.806779203170416, 1.8859391007298545, 0.46855774212986023,
  10.761433540147586, 2.8724172201359197, -1.2811838605587311,
  9.6195923104445065, 2.8724172201359197, -3.2833099941904766,
  6.9763020889151646, 2.7659257976905427, -4.7591958908830172,
  6.0461277891353697, 1.0727045302089879, -6.6638740164090482,
  7.3472235778544794, -1.8228856326635698, -9.0685043046185623,
  7.226367212900791, -1.8228856326635698, -10.499536640855691,
  5.8354566696263914, -1.8228856326635698, -12.039219379199908,
  3.6532357452141353, -0.20463983570573391, -13.87695442281038,
  -0.30169589630131455, 1.5965000671484342, -14.879986418947327,
  -2.8925694230502157, 2.2971364614427481, -13.892095587598131,
  -4.537672295357936, 4.5863515759659208, -12.140831652074551,
  -6.1287913464117594, 5.9653814634119815, -8.9776527318875896,
  -6.0120301606452813, 4.4081161943855998, -6.712084358394045,
  -5.2138252159038974, 2.820894808418279, -4.4532820412085607,
  -2.3424712835109611, 2.2032065005086259, -3.0788773693500198,
  -0.0076956453915433265, 1.8931797788880202, -1.6577070662471063,
  -0.24767503988481437, 2.8845808465856684, 0.073915859214221724,
  -2.2174044353598896, 4.2415524507318576, 2.215992718290742,
  -3.4526531678364756, 3.0615192023340851, 4.7922404932096558,
  -3.7356278971556445, 1.4054080369354316, 7.8432021841434629,
  -3.4003734463804118, 1.1924069108769393, 9.2464090886227073,
  -1.8851803760476225, 1.5269331003449989, 10.306083896408374,
  0.01071077144031829, 2.1101821577522295, 10.490880699847727,
  0.42562058195647001, 2.2759939598834387, 11.613129436580291,
  0.096405262182225115, 0.032317784084054391, 16.223455375061565,
  2.3458797884520433, 0.38907275257695584, 19.91188266079584,
  5.7018400098488771, 1.73337964747396, 20.615481586999959,
  7.9720939736751824, 1.73337964747396, 19.303399329816457,
  9.8672362721095652, 0.090083018057025177, 16.893338541618121,
  11.225959519544134, -1.374508746897471, 14.279002555560753,
  11.288646925965876, -1.374508746897471, 11.926359497447137,
  10.136184463414924, -1.374508746897471, 10.384881573913269
];

const points = [];
const len = curvePath.length;
for (let p = 0; p < len; p += 3) {
  points.push(new THREE.Vector3(
    curvePath[p], 
    curvePath[p + 1], 
    curvePath[p + 2]
  ));
}
// This spline builds the endless tube
const spline = new THREE.CatmullRomCurve3(points);
spline.closed = true;

/**
 * Tunnel Component
 * Plays a scroll-linked immersive wormhole experience.
 */
export default function Wormhole() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // By maintaining scroll offset, we can animate linearly with mouse
  const progressRef = useRef(0);

  useEffect(() => {
    const mount = canvasRef.current;
    if (!mount) return;

    let w = mount.clientWidth;
    let h = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.3);

    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Vite uses THREE.SRGBColorSpace over string mappings usually
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // Provide OrbitControls but they might fight with the programmatic camera animations!
    // Often in scroll experiences, we disable interactive camera rotations, but leaving 
    // it allows the user to look around as they fly.
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;
    controls.enableZoom = false; // keep the script in complete control of position!
    controls.enablePan = false;

    // Post-processing
    const renderScene = new RenderPass(scene, camera);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
    bloomPass.threshold = 0.002;
    bloomPass.strength = 3.5;
    bloomPass.radius = 0;
    composer.addPass(bloomPass);

    // Create the main tunnel tube from the spline
    const tubeGeo = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);
    const edges = new THREE.EdgesGeometry(tubeGeo, 0.2);
    // Deep neon wireframe
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00d4ff });
    const tubeLines = new THREE.LineSegments(edges, lineMat);
    scene.add(tubeLines);

    // Decorate the tunnel with floating geometry
    const numBoxes = 55;
    const size = 0.075;
    const boxGeo = new THREE.BoxGeometry(size, size, size);

    for (let i = 0; i < numBoxes; i += 1) {
      const p = (i / numBoxes + Math.random() * 0.1) % 1;
      const pos = tubeGeo.parameters.path.getPointAt(p);
      
      pos.x += Math.random() - 0.4;
      pos.z += Math.random() - 0.4;

      const rote = new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      const boxEdges = new THREE.EdgesGeometry(boxGeo, 0.2);
      // Generate a dynamic gradient of colors 
      const color = new THREE.Color().setHSL(0.7 - p, 1, 0.5);
      const boxLineMat = new THREE.LineBasicMaterial({ color });
      
      const boxLines = new THREE.LineSegments(boxEdges, boxLineMat);
      boxLines.position.copy(pos);
      boxLines.rotation.set(rote.x, rote.y, rote.z);
      scene.add(boxLines);
    }

    // Interactive Scroll Sync
    const handleScroll = () => {
      // Calculate Scroll bounds explicitly based on the 400vh container
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // rect.top drops as users scroll down. 
      // When top exactly aligns with viewport, progress is 0.
      // When bottom exactly aligns with viewport, progress is 1. (Length = rect.height - window.innerHeight)
      const maxScroll = rect.height - window.innerHeight;
      
      let p = -rect.top / maxScroll;
      // Clamp the math
      p = Math.max(0, Math.min(1, p));
      
      progressRef.current = p;
    };
    
    window.addEventListener('scroll', handleScroll);

    // Resize tracking
    function handleWindowResize() {
      if(!mount) return;
      w = mount.clientWidth;
      h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    }
    window.addEventListener('resize', handleWindowResize, false);

    const clock = new THREE.Clock();
    let requestID;

    // We keep track of the smoothed progress variable for buttery motion regardless of scroll wheel chunks
    let currentAnimP = 0;

    function animate() {
      requestID = requestAnimationFrame(animate);

      // We seamlessly interpolate the exact requested scroll ratio into the camera engine
      const targetP = progressRef.current;
      currentAnimP += (targetP - currentAnimP) * 0.05; // 0.05 is the spring damping amount

      // Add a tiny bit of auto-forward momentum (so the user always inches slightly if they stop)
      const autoP = clock.getElapsedTime() * 0.01;
      
      // Combine base scroll progress with slow auto-rotation
      let finalP = currentAnimP + autoP;
      // Guarantee wrap around safely via Modulo
      finalP = finalP % 1;

      // Ensure LookAt receives a point slightly ahead on the endless curve
      const lookAtP = (finalP + 0.03) % 1;

      const pos = tubeGeo.parameters.path.getPointAt(finalP);
      const lookAt = tubeGeo.parameters.path.getPointAt(lookAtP);
      
      // We manually set camera position, Orbit Controls only deals with look angles
      camera.position.copy(pos);
      // We tell the camera where to look!
      camera.lookAt(lookAt);

      controls.update();
      composer.render(scene, camera);
    }
    
    animate();

    return () => {
      cancelAnimationFrame(requestID);
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('scroll', handleScroll);
      if (mount) {
        mount.removeChild(renderer.domElement);
      }
      
      // Cleanup GPU Memory
      tubeGeo.dispose();
      lineMat.dispose();
      boxGeo.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    // The Wrapper acts as a scroll trap. 400vh creates a long runway for the browser scrollbar 
    // to map down to 0->1 interpolation values through the entire physical Wormhole!
    <section 
        id="wormhole-experience" 
        ref={containerRef} 
        style={{ height: '400vh' }} 
        className="relative bg-black"
    >
      <div 
        ref={canvasRef} 
        className="sticky top-0 w-full h-screen overflow-hidden" 
        // We drop zIndex below immediate components like Navbar so interactions work, but above the background
        style={{ zIndex: 10 }}
      >
        <div className="absolute inset-x-0 bottom-12 flex justify-center z-50 pointer-events-none">
          <p className="text-white backdrop-blur-sm bg-black/30 px-6 py-2 rounded-full border border-white/10 animate-pulse text-sm">
            Scroll to Travel
          </p>
        </div>
      </div>
    </section>
  );
}
