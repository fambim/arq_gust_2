import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 15);

const ambient = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient);

const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(14, 5, 13);
light.castShadow = true;
scene.add(light);

// const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
// light2.position.set(4, 3, -2);
// light2.castShadow = true;
// scene.add(light2);

// const dirLightHelper = new THREE.DirectionalLightHelper(light);
// scene.add(dirLightHelper);
// const dirLightHelper2 = new THREE.DirectionalLightHelper(light2);
// scene.add(dirLightHelper2);

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.DoubleSide })
);
plane.rotation.x = -Math.PI / 2;
plane.position.set(0.5, 0, -1.5);
plane.receiveShadow = true;
scene.add(plane);

const loader = new GLTFLoader();
loader.load(
  "arq gus.glb",
  function (gltf) {
    const object = gltf.scene;
    object.scale.set(0.4, 0.4, 0.4);
    object.position.set(0, -6.4, 0);
    object.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        // child.receiveShadow = true;
      }
    });
    scene.add(object);

    // ❌ Ocultar el loader al terminar
    const loaderDiv = document.getElementById("loader");
    if (loaderDiv) loaderDiv.style.display = "none";
  },
  function (xhr) {
    const loadingText = document.getElementById("loading-text");
    if (loadingText && xhr.lengthComputable) {
      loadingText.textContent = "Cargando modelo ...";
    }
  },
  function (error) {
    console.error("Error al cargar el GLB:", error);
    const loadingText = document.getElementById("loading-text");
    if (loadingText) {
      loadingText.textContent = "Error al cargar el modelo.";
    }
  }
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(0, 0, 0)

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
