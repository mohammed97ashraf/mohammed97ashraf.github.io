// Three.js 3D Background - Maximalist Hyperspace

document.addEventListener('DOMContentLoaded', () => {
    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020205, 0.0015); // Slightly denser fog

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 1;

    // Mobile Optimization Check
    const isMobile = window.innerWidth < 768;

    const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('bg-canvas'),
        alpha: true,
        antialias: !isMobile // Disable antialias on mobile for perf
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Cap pixel ratio on mobile to prevent overheating
    renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio);

    // 2. Dense Star Tunnel
    const starGeometry = new THREE.BufferGeometry();
    // Reduce count significantly on mobile
    const starCount = isMobile ? 1500 : 6000; // TRIPLED count

    const starPos = new Float32Array(starCount * 3);
    const starVelo = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 600;
        const y = (Math.random() - 0.5) * 600;
        const z = (Math.random() - 0.5) * 1000;

        starPos[i * 3] = x;
        starPos[i * 3 + 1] = y;
        starPos[i * 3 + 2] = z;

        starVelo[i] = 0.5 + Math.random() * 2; // Faster stars
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPos, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: isMobile ? 0.3 : 0.2, // Smaller but more numerous
        transparent: true,
        opacity: 0.9
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 3. Geometric Debris Field (InstancedMesh for performance)
    const debrisCount = isMobile ? 60 : 300;
    const debrisGeometry = new THREE.TetrahedronGeometry(1, 0);
    const debrisMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    // We treat debris as individual meshes for easier movement logic without shader magic
    // For 300 items, standard Mesh is fine.
    const debrisGroup = new THREE.Group();
    const allDebris = [];

    for (let i = 0; i < debrisCount; i++) {
        const mesh = new THREE.Mesh(debrisGeometry, debrisMaterial);

        const x = (Math.random() - 0.5) * 300;
        const y = (Math.random() - 0.5) * 300;
        const z = (Math.random() - 0.5) * 1000;

        mesh.position.set(x, y, z);
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

        const scale = Math.random() * 2 + 0.5;
        mesh.scale.set(scale, scale, scale);

        debrisGroup.add(mesh);
        allDebris.push({
            mesh,
            speed: 0.2 + Math.random() * 0.5,
            rotSpeed: { x: Math.random() * 0.02, y: Math.random() * 0.02 }
        });
    }
    scene.add(debrisGroup);


    // 4. Complex Planet System
    const planetGroup = new THREE.Group();
    planetGroup.position.set(100, 0, -250); // Position in background

    // A. Wireframe Shell
    const pGeo = new THREE.IcosahedronGeometry(120, 2);
    const pMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        wireframe: true,
        transparent: true,
        opacity: 0.08
    });
    const planetShell = new THREE.Mesh(pGeo, pMat);
    planetGroup.add(planetShell);

    // B. Inner Core
    const cGeo = new THREE.IcosahedronGeometry(80, 1);
    const cMat = new THREE.MeshBasicMaterial({
        color: 0xbd00ff,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const core = new THREE.Mesh(cGeo, cMat);
    planetGroup.add(core);

    // C. Orbital Ring
    const rGeo = new THREE.TorusGeometry(160, 2, 16, 100);
    const rMat = new THREE.MeshBasicMaterial({
        color: 0xff9d00,
        transparent: true,
        opacity: 0.2
    });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.rotation.x = Math.PI / 2;
    ring.rotation.y = -0.2;
    planetGroup.add(ring);

    scene.add(planetGroup);

    // 5. Animation Loop
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
    });

    // Ship Scroll Tracker
    const ship = document.getElementById('ship-tracker');
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    window.addEventListener('scroll', () => {
        if (ship) {
            const scrolled = window.scrollY;
            const percentage = scrolled / maxScroll;
            const topPos = 10 + (percentage * 80);
            ship.style.top = `${topPos}vh`;

            // Rotate planet based on scroll
            planetGroup.rotation.y = percentage * Math.PI;
        }
    });

    function animate() {
        requestAnimationFrame(animate);

        // --- 1. Star Animation ---
        const posAttribute = starField.geometry.attributes.position;
        for (let i = 0; i < starCount; i++) {
            let z = posAttribute.array[i * 3 + 2];
            z += starVelo[i] * 4; // High speed

            // Camera turn
            posAttribute.array[i * 3] += -mouseX * 5;
            posAttribute.array[i * 3 + 1] += mouseY * 5;

            // Reset
            if (z > 100) {
                z = -900;
                posAttribute.array[i * 3] = (Math.random() - 0.5) * 600;
                posAttribute.array[i * 3 + 1] = (Math.random() - 0.5) * 600;
            }
            posAttribute.array[i * 3 + 2] = z;
        }
        posAttribute.needsUpdate = true;
        starField.rotation.z += 0.0005;

        // --- 2. Debris Animation ---
        allDebris.forEach(d => {
            d.mesh.position.z += d.speed * 4;
            d.mesh.rotation.x += d.rotSpeed.x;
            d.mesh.rotation.y += d.rotSpeed.y;

            d.mesh.position.x += -mouseX * 8;
            d.mesh.position.y += mouseY * 8;

            if (d.mesh.position.z > 100) {
                d.mesh.position.z = -900;
                d.mesh.position.x = (Math.random() - 0.5) * 300;
                d.mesh.position.y = (Math.random() - 0.5) * 300;
            }
        });

        // --- 3. Planet Animation ---
        planetShell.rotation.y += 0.001;
        core.rotation.y -= 0.002;
        ring.rotation.z += 0.001;

        // Gentle float
        planetGroup.position.y = Math.sin(Date.now() * 0.0005) * 5;

        renderer.render(scene, camera);
    }

    animate();

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Observer
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
