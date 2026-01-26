import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// ...rest of your code



export function initScene() {
  // Scene setup
  const scene = new THREE.Scene()
  
  // Camera
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(0, 1, 5)
  
  // Renderer
  const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: true 
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  
  // Add to container
  const container = document.getElementById('three-container')
  container.appendChild(renderer.domElement)
  
  // Orbit controls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom = false
  controls.autoRotate = true
  controls.autoRotateSpeed = 1
  
  // Lighting - Purple theme
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xc77dff, 1.5)
  directionalLight.position.set(5, 5, 5)
  directionalLight.castShadow = true
  scene.add(directionalLight)
  
  const pointLight1 = new THREE.PointLight(0xe0aaff, 1, 50)
  pointLight1.position.set(-5, 3, -5)
  scene.add(pointLight1)
  
  const pointLight2 = new THREE.PointLight(0xff6ec7, 1, 50)
  pointLight2.position.set(5, 3, 5)
  scene.add(pointLight2)
  
  // Load GLB Model
  const loader = new GLTFLoader()
  let model = null
  
  loader.load(
  '/models/your-model.glb',
  (gltf) => {
    model = gltf.scene
    
    // Center the model
    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    model.position.sub(center)
    
    // ADJUST THESE VALUES to fit your model:
    model.scale.set(0.03, 0.03, 0.03) // Make bigger/smaller
    model.position.y = -2 // Move up/down
    model.rotation.y = Math.PI / 0.1 // Initial rotation angle
    
    // Enable shadows
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    
    scene.add(model)
    console.log('✅ GLB Model loaded successfully!')
  },

    (progress) => {
      const percent = (progress.loaded / progress.total) * 100
      console.log(`Loading GLB: ${percent.toFixed(0)}%`)
    },
    (error) => {
      console.error('❌ Error loading GLB:', error)
    }
  )
  
  // Animation loop
  function animate() {
  requestAnimationFrame(animate)
  
  // Rotate model - SLOWER
  if (model) {
    model.rotation.y += 0.001 // Changed from 0.005 to 0.001 (5x slower)
  }
  
  controls.update()
  renderer.render(scene, camera)
}

  
  animate()
  
  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })
  
  // Clean up
  return () => {
    renderer.dispose()
    controls.dispose()
  }
}
