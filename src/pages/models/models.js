// model configs for each group
const modelGroups = {
    chibi: [
        { path: '/models/chibigirl1.glb', position: [-5, 0, 0], scale: 2, rotation: [0, 4, 0] },
        { path: '/models/chibigirl2.glb', position: [0, 0, 1], scale: 2, rotation: [0, 3.5, 0] },
        { path: '/models/chibigirl3.glb', position: [5, 0, -0.5], scale: 2, rotation: [0, 4, 0] }
    ],
    character: [
        { path: '/models/ElfModel.glb', position: [-2.5, 0, 0], scale: 2 },
        { path: '/models/fullsizegirl1.glb', position: [2.5, 0, 0], scale: 2.5 }
    ],
    fps: [
        { path: '/models/FPSHand1.glb', position: [-5, 0, 0.5], scale: 4 },
        { path: '/models/fbxshotgun.glb', position: [0, 0, 0], scale: 6 },
        { path: '/models/makarov.glb', position: [5, 0, -0.5], scale: 3 }
    ],
    props: [
        { path: '/models/3dprop1.glb', position: [3, 0, 0], scale: 2 },
        { path: '/models/3dprop2.glb', position: [-3, 0, 0.5], scale: 2 }
    ]
};


// lighting configs for each group
const lightingConfigs = {
    chibi: {
        ambient: { color: 0xffffff, intensity: 0.7 },
        main: { color: 0xffffff, intensity: 1.2 },
        accent1: { color: 0xffb6c1, intensity: 1, position: [-5, 4, 5] },
        accent2: { color: 0xadd8e6, intensity: 1, position: [5, 4, -5] },
        background: 0x2d1b2e
    },
    character: {
        ambient: { color: 0xffffff, intensity: 0.6 },
        main: { color: 0xffffff, intensity: 1.4 },
        accent1: { color: 0x8a2be2, intensity: 1.2, position: [-6, 5, 4] },
        accent2: { color: 0x4169e1, intensity: 1, position: [6, 3, -4] },
        background: 0x1a0f2e
    },
    fps: {
        ambient: { color: 0xffffff, intensity: 0.5 },
        main: { color: 0xffffff, intensity: 1.5 },
        accent1: { color: 0xdc143c, intensity: 1.2, position: [-5, 3, 5] },
        accent2: { color: 0xff4500, intensity: 0.9, position: [5, 5, -5] },
        background: 0x2e1515
    },
    props: {
        ambient: { color: 0xffffff, intensity: 0.7 },
        main: { color: 0xffffff, intensity: 1.2 },
        accent1: { color: 0x2e8b57, intensity: 1, position: [-5, 4, 5] },
        accent2: { color: 0x40e0d0, intensity: 0.9, position: [5, 4, -5] },
        background: 0x1a2d1f
    }
};


document.addEventListener('DOMContentLoaded', () => {
    // animate titles
    anime({
        targets: '.space-title',
        opacity: [0, 0.6],
        scale: [0.8, 1],
        duration: 1500,
        delay: anime.stagger(200),
        easing: 'easeOutElastic(1, .6)'
    });


    const canvases = document.querySelectorAll('.space-canvas');


    canvases.forEach((canvas) => {
        const groupType = canvas.getAttribute('data-group');
        const models = modelGroups[groupType];
        const lighting = lightingConfigs[groupType];


        if (!models || !lighting) return;

        // scene setup
        const scene = new THREE.Scene();
        scene.background = null;


        // camera setup
        const camera = new THREE.PerspectiveCamera(
            55,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 2, 8);


        // renderer setup
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.4;
        canvas.appendChild(renderer.domElement);

        // lighting
        const ambientLight = new THREE.AmbientLight(lighting.ambient.color, lighting.ambient.intensity);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(lighting.main.color, lighting.main.intensity);
        mainLight.position.set(6, 12, 6);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        scene.add(mainLight);
        const accentLight1 = new THREE.PointLight(
            lighting.accent1.color,
            lighting.accent1.intensity,
            30
        );
        accentLight1.position.set(...lighting.accent1.position);
        scene.add(accentLight1);

        const accentLight2 = new THREE.PointLight(
            lighting.accent2.color,
            lighting.accent2.intensity,
            30
        );
        accentLight2.position.set(...lighting.accent2.position);
        scene.add(accentLight2);
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
        rimLight.position.set(-6, 5, -6);
        scene.add(rimLight);

        // store models for rotation
        const modelObjects = [];
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let selectedModel = null;
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // load models
        const loader = new THREE.GLTFLoader();
        let loadedCount = 0;

        models.forEach((modelData, index) => {
            loader.load(
                modelData.path,
                (gltf) => {
                    const model = gltf.scene;

                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3());
                    const center = box.getCenter(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const baseTargetSize = groupType === 'fps' ? 1.2 : 1.8;
                    const scale = (baseTargetSize / maxDim) * modelData.scale;
                    model.scale.set(scale, scale, scale);

                    model.position.x = modelData.position[0] - center.x * scale;
                    model.position.y = -box.min.y * scale;
                    model.position.z = modelData.position[2] - center.z * scale;

                    // apply per-model rotation from config
                    if (modelData.rotation) {
                        const [rx, ry, rz] = modelData.rotation;
                        model.rotation.set(rx, ry, rz);
                    }
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;

                            if (child.material) {
                                child.material.needsUpdate = true;
                                if (child.material.metalness !== undefined) {
                                    child.material.metalness = Math.min(child.material.metalness * 1.3, 1);
                                }
                            }
                        }
                    });
                    model.userData.basePosition = {
                        x: modelData.position[0],
                        y: -box.min.y * scale,
                        z: modelData.position[2]
                    };

                    scene.add(model);
                    modelObjects.push(model);

                    // animate entrance
                    const startY = model.position.y;
                    model.position.y -= 2;
                    if (!modelData.rotation) {
                        model.rotation.y = Math.random() * Math.PI * 2;
                    }

                    anime({
                        targets: model.position,
                        y: startY,
                        duration: 1200,
                        delay: index * 200 + 300,
                        easing: 'easeOutBounce'
                    });
                    if (!modelData.rotation) {
                        anime({
                            targets: model.rotation,
                            y: 0,
                            duration: 1000,
                            delay: index * 200 + 300,
                            easing: 'easeOutQuad'
                        });
                    }

                    loadedCount++;

                    if (loadedCount === models.length) {
                        console.log(`✓ ${groupType} group loaded (${loadedCount} models)`);
                    }
                },
                undefined,
                (error) => {
                    console.error(`✗ Error loading model in ${groupType}:`, error);
                }
            );
        });

        // mouse events for rotation
        renderer.domElement.addEventListener('mousedown', (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                for (let model of modelObjects) {
                    let current = intersects[0].object;
                    while (current) {
                        if (current === model) {
                            selectedModel = model;
                            isDragging = true;
                            previousMousePosition = { x: event.clientX, y: event.clientY };
                            canvas.classList.add('interacting');
                            break;
                        }
                        current = current.parent;
                    }
                    if (isDragging) break;
                }
            }
        });

        renderer.domElement.addEventListener('mousemove', (event) => {
            if (isDragging && selectedModel) {
                const deltaX = event.clientX - previousMousePosition.x;
                const deltaY = event.clientY - previousMousePosition.y;

                selectedModel.rotation.y += deltaX * 0.01;
                selectedModel.rotation.x += deltaY * 0.01;

                previousMousePosition = { x: event.clientX, y: event.clientY };
            }
        });

        renderer.domElement.addEventListener('mouseup', () => {
            isDragging = false;
            selectedModel = null;
            setTimeout(() => {
                canvas.classList.remove('interacting');
            }, 2000);
        });

        // touch events
        renderer.domElement.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                const rect = renderer.domElement.getBoundingClientRect();
                mouse.x = ((event.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.touches[0].clientY - rect.top) / rect.height) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(scene.children, true);

                if (intersects.length > 0) {
                    for (let model of modelObjects) {
                        let current = intersects[0].object;
                        while (current) {
                            if (current === model) {
                                selectedModel = model;
                                isDragging = true;
                                previousMousePosition = {
                                    x: event.touches[0].clientX,
                                    y: event.touches[0].clientY
                                };
                                canvas.classList.add('interacting');
                                break;
                            }
                            current = current.parent;
                        }
                        if (isDragging) break;
                    }
                }
            }
        });

        renderer.domElement.addEventListener('touchmove', (event) => {
            if (isDragging && selectedModel && event.touches.length === 1) {
                const deltaX = event.touches[0].clientX - previousMousePosition.x;
                const deltaY = event.touches[0].clientY - previousMousePosition.y;

                selectedModel.rotation.y += deltaX * 0.01;
                selectedModel.rotation.x += deltaY * 0.01;

                previousMousePosition = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
            }
        });

        renderer.domElement.addEventListener('touchend', () => {
            isDragging = false;
            selectedModel = null;
            setTimeout(() => {
                canvas.classList.remove('interacting');
            }, 2000);
        });

        // animation loop
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();

        // handle resize
        const resizeObserver = new ResizeObserver(() => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });
        resizeObserver.observe(canvas);

        // cleanup
        window.addEventListener('beforeunload', () => {
            resizeObserver.disconnect();
            renderer.dispose();
        });
    });

    // smooth scroll nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                anime({
                    targets: 'html, body',
                    scrollTop: targetSection.offsetTop,
                    duration: 1200,
                    easing: 'easeInOutQuart'
                });
            }
        });
    });
});
