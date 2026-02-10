// ========================
// ELEGANT 3D ART GALLERY
// ========================

const CONFIG = {
    slideCount: 5,
    spacingX: 45,

    pWidth: 14,
    pHeight: 18,

    camZ: 30,
    wallAngleY: -0.25,

    snapDelay: 200,
    lerpSpeed: 0.06
};

const totalGalleryWidth = CONFIG.slideCount * CONFIG.spacingX;

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7f7f5);
scene.fog = new THREE.Fog(0xf7f7f5, 10, 110);

// Camera Setup
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, CONFIG.camZ);

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// Gallery Group
const galleryGroup = new THREE.Group();
scene.add(galleryGroup);

// Texture Loader
const textureLoader = new THREE.TextureLoader();
const planeGeo = new THREE.PlaneGeometry(CONFIG.pWidth, CONFIG.pHeight);

// Your Art Images
const images = [
    '../../../public/images/imagesPage/demonGirl.png',
    '../../../public/images/imagesPage/OC.png',
    '../../../public/images/imagesPage/randomgirlSketch.png',
    '../../../public/images/imagesPage/red ribbon girl.png',
    '../../../public/images/imagesPage/sketch.png'
];

const paintingGroups = [];

// Create Gallery Paintings
for (let i = 0; i < CONFIG.slideCount; i++) {
    const group = new THREE.Group();
    group.position.set(i * CONFIG.spacingX, 0, 0);

    // Load texture and create material with proper aspect ratio handling
    const texture = textureLoader.load(images[i], (loadedTexture) => {
        // Get original image dimensions
        const imgWidth = loadedTexture.image.width;
        const imgHeight = loadedTexture.image.height;
        const imgAspect = imgWidth / imgHeight;

        // Frame aspect ratio
        const frameAspect = CONFIG.pWidth / CONFIG.pHeight;

        // Adjust texture to fit entire image without cropping (contain mode)
        if (imgAspect > frameAspect) {
            // Image is wider than frame - fit to width, letterbox top/bottom
            loadedTexture.repeat.x = 1;
            loadedTexture.repeat.y = imgAspect / frameAspect;
        } else {
            // Image is taller than frame - fit to height, pillarbox left/right
            loadedTexture.repeat.x = frameAspect / imgAspect;
            loadedTexture.repeat.y = 1;
        }

        // Center the texture
        loadedTexture.offset.x = (1 - loadedTexture.repeat.x) / 2;
        loadedTexture.offset.y = (1 - loadedTexture.repeat.y) / 2;
    });

    const mat = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xf7f7f5  // Add background color to match gallery background
    });
    const mesh = new THREE.Mesh(planeGeo, mat);

    // Frame/Outline
    const edges = new THREE.EdgesGeometry(planeGeo);
    const outline = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x222222 }));

    // Shadow
    const shadowGeo = new THREE.PlaneGeometry(CONFIG.pWidth, CONFIG.pHeight);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.set(0.8, -0.8, -0.5);

    // Gallery Lines
    const lineZ = -1;
    const lineLen = CONFIG.spacingX;
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-lineLen / 2, 14, lineZ), new THREE.Vector3(lineLen / 2, 14, lineZ),
        new THREE.Vector3(-lineLen / 2, -14, lineZ), new THREE.Vector3(lineLen / 2, -14, lineZ)
    ]);
    const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0xdddddd }));

    group.add(shadow);
    group.add(mesh);
    group.add(outline);
    group.add(lines);

    galleryGroup.add(group);
    paintingGroups.push(group);
}

galleryGroup.rotation.y = CONFIG.wallAngleY;
galleryGroup.position.x = 8;

// Scroll Variables
let currentScroll = 0;
let targetScroll = 0;
let snapTimer = null;
let mouse = { x: 0, y: 0 };

function snapToNearest() {
    const index = Math.round(targetScroll / CONFIG.spacingX);
    targetScroll = index * CONFIG.spacingX;
}

// Mouse Wheel
window.addEventListener('wheel', (e) => {
    targetScroll += e.deltaY * 0.1;
    if (snapTimer) clearTimeout(snapTimer);
    snapTimer = setTimeout(snapToNearest, CONFIG.snapDelay);
});

// Touch Support
let touchStart = 0;
window.addEventListener('touchstart', e => {
    touchStart = e.touches[0].clientX;
    if (snapTimer) clearTimeout(snapTimer);
});

window.addEventListener('touchmove', e => {
    const diff = touchStart - e.touches[0].clientX;
    targetScroll += diff * 0.6;
    touchStart = e.touches[0].clientX;
    if (snapTimer) clearTimeout(snapTimer);
});

window.addEventListener('touchend', () => {
    snapToNearest();
});

// Mouse Movement
window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Update UI Based on Scroll
function updateUI(scrollX) {
    const rawIndex = Math.round(scrollX / CONFIG.spacingX);
    const safeIndex = ((rawIndex % CONFIG.slideCount) + CONFIG.slideCount) % CONFIG.slideCount;

    for (let i = 0; i < CONFIG.slideCount; i++) {
        const el = document.getElementById(`slide-${i}`);
        if (el) {
            if (i === safeIndex) el.classList.add('active');
            else el.classList.remove('active');
        }
    }
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    currentScroll += (targetScroll - currentScroll) * CONFIG.lerpSpeed;

    const xMove = currentScroll * Math.cos(CONFIG.wallAngleY);
    const zMove = currentScroll * Math.sin(CONFIG.wallAngleY);
    camera.position.x = xMove;
    camera.position.z = CONFIG.camZ - zMove;

    // Infinite Loop Effect
    paintingGroups.forEach((group, i) => {
        const originalX = i * CONFIG.spacingX;
        const distFromCam = currentScroll - originalX;
        const shift = Math.round(distFromCam / totalGalleryWidth) * totalGalleryWidth;
        group.position.x = originalX + shift;
    });

    // Subtle Camera Sway
    camera.rotation.x = mouse.y * 0.05;
    camera.rotation.y = -mouse.x * 0.05;

    updateUI(currentScroll);
    renderer.render(scene, camera);
}

// Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start Animation
animate();

// Console Art
console.log('%c🎨 KUMUII ART GALLERY', 'color: #0d0d0d; font-size: 20px; font-family: "Playfair Display", serif;');
console.log('%cInfinite 3D Gallery Experience', 'color: #444; font-size: 14px; font-family: "Lato", sans-serif;');
