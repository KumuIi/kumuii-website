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

// scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7f7f5);
scene.fog = new THREE.Fog(0xf7f7f5, 10, 110);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, CONFIG.camZ);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-container').appendChild(renderer.domElement);

// lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

const galleryGroup = new THREE.Group();
scene.add(galleryGroup);

const textureLoader = new THREE.TextureLoader();
const planeGeo = new THREE.PlaneGeometry(CONFIG.pWidth, CONFIG.pHeight);

// art images
const images = [
    '/images/imagesPage/demonGirl.png',
    '/images/imagesPage/OC.png',
    '/images/imagesPage/randomgirlSketch.png',
    '/images/imagesPage/red ribbon girl.png',
    '/images/imagesPage/sketch.png'
];
const paintingGroups = [];

// create paintings
for (let i = 0; i < CONFIG.slideCount; i++) {
    const group = new THREE.Group();
    group.position.set(i * CONFIG.spacingX, 0, 0);

    const texture = textureLoader.load(images[i], (loadedTexture) => {
        const imgWidth = loadedTexture.image.width;
        const imgHeight = loadedTexture.image.height;
        const imgAspect = imgWidth / imgHeight;

        const frameAspect = CONFIG.pWidth / CONFIG.pHeight;

        // fit image to frame
        if (imgAspect > frameAspect) {
            loadedTexture.repeat.x = 1;
            loadedTexture.repeat.y = imgAspect / frameAspect;
        } else {
            loadedTexture.repeat.x = frameAspect / imgAspect;
            loadedTexture.repeat.y = 1;
        }

        loadedTexture.offset.x = (1 - loadedTexture.repeat.x) / 2;
        loadedTexture.offset.y = (1 - loadedTexture.repeat.y) / 2;
    });

    const mat = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xf7f7f5
    });
    const mesh = new THREE.Mesh(planeGeo, mat);

    // frame outline
    const edges = new THREE.EdgesGeometry(planeGeo);
    const outline = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x222222 }));

    // shadow
    const shadowGeo = new THREE.PlaneGeometry(CONFIG.pWidth, CONFIG.pHeight);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.set(0.8, -0.8, -0.5);

    // gallery lines
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

// scroll
let currentScroll = 0;
let targetScroll = 0;
let snapTimer = null;
let mouse = { x: 0, y: 0 };

function snapToNearest() {
    const index = Math.round(targetScroll / CONFIG.spacingX);
    targetScroll = index * CONFIG.spacingX;
}

window.addEventListener('wheel', (e) => {
    targetScroll += e.deltaY * 0.1;
    if (snapTimer) clearTimeout(snapTimer);
    snapTimer = setTimeout(snapToNearest, CONFIG.snapDelay);
});

// touch
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

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// update UI
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

// animation
function animate() {
    requestAnimationFrame(animate);

    currentScroll += (targetScroll - currentScroll) * CONFIG.lerpSpeed;

    const xMove = currentScroll * Math.cos(CONFIG.wallAngleY);
    const zMove = currentScroll * Math.sin(CONFIG.wallAngleY);
    camera.position.x = xMove;
    camera.position.z = CONFIG.camZ - zMove;

    // infinite loop
    paintingGroups.forEach((group, i) => {
        const originalX = i * CONFIG.spacingX;
        const distFromCam = currentScroll - originalX;
        const shift = Math.round(distFromCam / totalGalleryWidth) * totalGalleryWidth;
        group.position.x = originalX + shift;
    });

    // camera sway
    camera.rotation.x = mouse.y * 0.05;
    camera.rotation.y = -mouse.x * 0.05;

    updateUI(currentScroll);
    renderer.render(scene, camera);
}

// resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
