import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
const input = {
    keys: {},
    mouse: {
        x: 0,
        y: 0,
        left: false,
        right: false
    }
};
let vrm = null;
window.addEventListener("keydown", (e) => input.keys[e.code] = true);
window.addEventListener("keyup", (e) => input.keys[e.code] = false);

window.addEventListener("mousedown", (e) => {
    if (e.button === 0) input.mouse.left = true;
    if (e.button === 2) input.mouse.right = true;
});

window.addEventListener("mouseup", (e) => {
    if (e.button === 0) input.mouse.left = false;
    if (e.button === 2) input.mouse.right = false;
});

window.addEventListener("mousemove", (e) => {
    input.mouse.x = e.clientX;
    input.mouse.y = e.clientY;
});

window.addEventListener("contextmenu", (e) => e.preventDefault());

const canvas = document.getElementById("scene");
const loading = document.getElementById("loading");

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 1.4, 2.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.3, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));

const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(2, 5, 3);
scene.add(sun);

const desk = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.08, 1.2),
    new THREE.MeshStandardMaterial({
        color: 0x2b2b2b
    })
);

desk.position.set(0, 0.72, 0.15);
scene.add(desk);

const keyboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.04, 0.32),
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        emissive: 0x000000
    })
);

keyboard.position.set(0, 0.78, 0);

scene.add(keyboard);

const mouse = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.04, 0.18),
    new THREE.MeshStandardMaterial({
        color: 0x181818,
        emissive: 0x000000
    })
);

mouse.position.set(0.67, 0.78, 0.04);

scene.add(mouse);


const loader = new GLTFLoader();

loader.register((parser) => new VRMLoaderPlugin(parser));

loader.load(
    "./assets/model.vrm",
    (gltf) => {
        vrm = gltf.userData.vrm;

        VRMUtils.rotateVRM0(vrm);

        vrm.scene.rotation.y = Math.PI;

        scene.add(vrm.scene);

        loading.style.display = "none";
    },
    (progress) => {
        if (progress.total) {
            loading.innerText =
                "Loading " +
                Math.floor(progress.loaded / progress.total * 100) +
                "%";
        }
    },
    (err) => {
        console.error(err);
        loading.innerText = "Failed to load avatar";
    }
);

// ===== Animation Loop =====

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (vrm) {

        vrm.update(delta);

        // Head follows mouse
        const head = vrm.humanoid.getNormalizedBoneNode("head");

        if (head) {

            const x = (input.mouse.x / window.innerWidth) * 2 - 1;
            const y = (input.mouse.y / window.innerHeight) * 2 - 1;

            head.rotation.y = THREE.MathUtils.lerp(
                head.rotation.y,
                -x * 0.5,
                0.12
            );

            head.rotation.x = THREE.MathUtils.lerp(
                head.rotation.x,
                y * 0.35,
                0.12
            );
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();
window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

});
