import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";

const canvas = document.getElementById("scene");

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
controls.target.set(0, 1.3, 0);
controls.update();

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(1, 3, 2);
scene.add(directionalLight);

let currentVRM = null;

const loader = new GLTFLoader();

loader.register((parser) => {
    return new VRMLoaderPlugin(parser);
});

loader.load(
    "./assets/model.vrm",

    (gltf) => {

        const vrm = gltf.userData.vrm;

        currentVRM = vrm;

        VRMUtils.rotateVRM0(vrm);

        scene.add(vrm.scene);

        console.log("VRM Loaded!");

        document.getElementById("loading").style.display = "none";
    },

    (progress) => {

        if (progress.total > 0) {

            const percent = Math.round(progress.loaded / progress.total * 100);

            document.getElementById("loading").textContent =
                "Loading Avatar... " + percent + "%";
        }

    },

    (error) => {

        console.error(error);

        document.getElementById("loading").textContent =
            "Failed to load model.vrm";

    }

);

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (currentVRM) {

        currentVRM.update(delta);

    }

    renderer.render(scene, camera);

}

animate();

window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

});
