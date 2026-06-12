/*
   Witch Hat Atelier Portfolio Engine
   Author: Antigravity AI
   Powers the interactive magic canvas, audio synthesis, and custom navigation
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let soundEnabled = false;
    let currentMode = 'parchment'; // 'parchment' or 'celestial'
    
    // --- DOM Elements ---
    const body = document.body;
    const canvas = document.getElementById('magic-canvas');
    const ctx = canvas.getContext('2d');
    const modeToggle = document.getElementById('mode-toggle');
    const celestialOverlay = document.getElementById('celestial-overlay');
    const magicCursor = document.getElementById('magic-cursor');
    const magicCursorFollower = document.getElementById('magic-cursor-follower');
    
    // Navigation & Pages
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.atelier-section');
    

    
    // Interactive Elements for Custom Cursor Hover
    const hoverables = document.querySelectorAll('a, button, input, textarea, .spell-card, .skill-sphere, .chronicle-card');

    // --- Web Audio API Synth ---
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Synthesize Paper Rustling Sound
    function playPaperSound() {
        if (!soundEnabled) return;
        initAudio();
        
        const bufferSize = audioCtx.sampleRate * 0.12; // Short noise burst
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        // Filter noise to sound like paper rustle
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 3;
        
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        noise.start();
    }

    // Synthesize Magic Casting Spell Sound
    function playCastSound() {
        if (!soundEnabled) return;
        initAudio();
        
        const now = audioCtx.currentTime;
        
        // Oscillator 1: Rising Whistle (Sweep)
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(220, now);
        osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.45);
        
        gain1.gain.setValueAtTime(0.05, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        
        // Oscillator 2: Shimmering high chimes
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(880, now);
        osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.3);
        
        gain2.gain.setValueAtTime(0.02, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        
        // Soft metallic chime at the end
        const chime = audioCtx.createOscillator();
        const chimeGain = audioCtx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(1500, now + 0.1);
        
        chimeGain.gain.setValueAtTime(0, now);
        chimeGain.gain.linearRampToValueAtTime(0.04, now + 0.12);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        
        chime.connect(chimeGain);
        chimeGain.connect(audioCtx.destination);
        
        osc1.start(now);
        osc2.start(now);
        chime.start(now + 0.1);
        
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
        chime.stop(now + 0.85);
    }

    // Synthesize Gentle Wind Sound
    function playWindSound() {
        if (!soundEnabled) return;
        initAudio();
        
        const now = audioCtx.currentTime;
        
        // White noise node
        const bufferSize = audioCtx.sampleRate * 0.8; 
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.7);
        filter.Q.value = 1.5;
        
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        noise.start();
        noise.stop(now + 0.8);
    }

    // Synthesize Bell Chime Click
    function playClickSound() {
        if (!soundEnabled) return;
        initAudio();
        
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);
        
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(now + 0.25);
    }



    // --- Custom Cursor Logic ---
    let mouseX = -100;
    let mouseY = -100;
    let followerX = -100;
    let followerY = -100;
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        magicCursor.style.left = mouseX + 'px';
        magicCursor.style.top = mouseY + 'px';
        magicCursor.style.opacity = 1;
    });

    // Animate cursor follower (inertia physics)
    function animateCursorFollower() {
        const dx = mouseX - followerX;
        const dy = mouseY - followerY;
        
        followerX += dx * 0.12;
        followerY += dy * 0.12;
        
        magicCursorFollower.style.left = followerX + 'px';
        magicCursorFollower.style.top = followerY + 'px';
        magicCursorFollower.style.opacity = 1;
        
        requestAnimationFrame(animateCursorFollower);
    }
    animateCursorFollower();

    // Hover states for elements
    hoverables.forEach(item => {
        item.addEventListener('mouseenter', () => {
            body.classList.add('hovering');
        });
        item.addEventListener('mouseleave', () => {
            body.classList.remove('hovering');
        });
    });

    // --- Canvas Magic Engine (Physics Particles) ---
    let particles = [];
    let magicCircles = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class MagicParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * -1.5 - 0.5; // Upward drift
            this.opacity = 1;
            this.color = color;
            this.decay = Math.random() * 0.015 + 0.005;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity -= this.decay;
            if (this.size > 0.1) this.size -= 0.01;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class MagicCircle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.radius = 1;
            this.maxRadius = Math.random() * 40 + 25;
            this.opacity = 1.0;
            this.color = color;
            this.speed = 1.5;
            this.rotation = Math.random() * Math.PI;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        }

        update() {
            if (this.radius < this.maxRadius) {
                this.radius += this.speed;
            } else {
                this.opacity -= 0.02;
            }
            this.rotation += this.rotationSpeed;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;

            // Translate & Rotate to make it spin
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            // Draw Magic Outer Ring
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Inner Hexagram / Triangle Rune representation
            if (this.radius > 10) {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 2);
                ctx.stroke();

                // Draw central glyph lines
                ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                    const angle = (i * 2 * Math.PI) / 3;
                    const endX = Math.cos(angle) * this.radius * 0.7;
                    const endY = Math.sin(angle) * this.radius * 0.7;
                    if (i === 0) ctx.moveTo(endX, endY);
                    else ctx.lineTo(endX, endY);
                }
                ctx.closePath();
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    // Track mouse speed to spawn particles
    let lastX = 0;
    let lastY = 0;

    window.addEventListener('mousemove', (e) => {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // Change stardust color depending on light/dark mode
        const stardustColor = currentMode === 'parchment' 
            ? 'rgba(179, 136, 32, 0.8)'   // Gold Leaf
            : 'rgba(0, 242, 254, 0.8)';  // Cyan Starlight

        if (distance > 2) {
            // Add mouse trail particles
            for (let i = 0; i < Math.min(distance / 4, 3); i++) {
                const px = lastX + (dx * (i / Math.min(distance / 4, 3)));
                const py = lastY + (dy * (i / Math.min(distance / 4, 3)));
                particles.push(new MagicParticle(px, py, stardustColor));
            }
        }
        
        // Occasional magic circle stamp when moving fast
        if (distance > 45 && Math.random() < 0.1) {
            magicCircles.push(new MagicCircle(e.clientX, e.clientY, stardustColor));
            if (Math.random() < 0.3) playClickSound();
        }

        lastX = e.clientX;
        lastY = e.clientY;
    });

    // Clicking generates a spell flash circle
    window.addEventListener('click', (e) => {
        // Exclude elements to avoid double clicks triggering multiple visual items
        if (e.target.closest('a') || e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) {
            return;
        }

        const spellColor = currentMode === 'parchment' ? '#b38820' : '#00f2fe';
        magicCircles.push(new MagicCircle(e.clientX, e.clientY, spellColor));
        
        // Spawn ring explosion particles
        for (let i = 0; i < 15; i++) {
            const p = new MagicParticle(e.clientX, e.clientY, spellColor);
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            p.speedX = Math.cos(angle) * speed;
            p.speedY = Math.sin(angle) * speed;
            p.decay = 0.02;
            particles.push(p);
        }

        playCastSound();
    });

    // Particle Animation Loop
    function animateMagic() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update & Draw Magic Circles
        for (let i = magicCircles.length - 1; i >= 0; i--) {
            magicCircles[i].update();
            magicCircles[i].draw();
            if (magicCircles[i].opacity <= 0) {
                magicCircles.splice(i, 1);
            }
        }

        // Update & Draw Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].opacity <= 0) {
                particles.splice(i, 1);
            }
        }

        requestAnimationFrame(animateMagic);
    }
    animateMagic();

    // --- Mode Toggle Logic (Light / Celestial Dark) ---
    modeToggle.addEventListener('click', () => {
        playWindSound();

        // 1. Activate circular clip-path transition overlay
        celestialOverlay.classList.add('active');

        setTimeout(() => {
            // 2. Flip theme classes on body after overlay covers viewport
            if (currentMode === 'parchment') {
                body.classList.remove('parchment-mode');
                body.classList.add('celestial-mode');
                currentMode = 'celestial';
                modeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
                modeToggle.title = "Toggle Parchment Mode";
            } else {
                body.classList.remove('celestial-mode');
                body.classList.add('parchment-mode');
                currentMode = 'parchment';
                modeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
                modeToggle.title = "Toggle Celestial Mode";
            }

            // 3. Fade out the transitioning overlay
            setTimeout(() => {
                celestialOverlay.classList.remove('active');
            }, 100);

        }, 600); // Syncs with the transition duration of clip-path in CSS
    });

    // --- Sound Effects Hook to Hover Action Elements ---
    document.querySelectorAll('[data-sound]').forEach(el => {
        const soundType = el.getAttribute('data-sound');
        
        el.addEventListener('mouseenter', () => {
            if (soundType === 'paper') playPaperSound();
            if (soundType === 'wind') playWindSound();
            if (soundType === 'cast') playCastSound();
            if (soundType === 'click') playClickSound();
        });
    });

    // --- Scroll Spy & Smooth Scroll Navigation ---
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = `#${entry.target.id}`;
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === targetId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (!targetSection) return;

            // Play navigation sound
            playPaperSound();

            // Smooth scroll to target section
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Generate ambient magic circle centered in the viewport
            const spellColor = currentMode === 'parchment' ? '#b38820' : '#00f2fe';
            magicCircles.push(new MagicCircle(window.innerWidth / 2, window.innerHeight / 2, spellColor));
        });
    });


});
