import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRMLoaderPlugin, VRMUtils, VRMHumanBoneName } from "@pixiv/three-vrm";

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
window.innerWidth/window.innerHeight,
0.1,
100
);

camera.position.set(0,1.35,2.2);

const controls=new OrbitControls(camera,renderer.domElement);
controls.target.set(0,1.25,0);
controls.enableDamping=true;

scene.add(new THREE.HemisphereLight(0xffffff,0x444444,2));

const sun=new THREE.DirectionalLight(0xffffff,3);
sun.position.set(1,3,2);
scene.add(sun);

const desk=new THREE.Mesh(

new THREE.BoxGeometry(3,0.08,1.2),

new THREE.MeshStandardMaterial({

color:0x202020

})

);

desk.position.set(0,.72,.15);

scene.add(desk);

let vrm;

const loader=new GLTFLoader();

loader.register(parser=>new VRMLoaderPlugin(parser));

loader.load("./assets/model.vrm",(gltf)=>{

vrm=gltf.userData.vrm;

VRMUtils.rotateVRM0(vrm);

scene.add(vrm.scene);

vrm.scene.rotation.y=Math.PI;

vrm.scene.position.y=-0.02;

document.getElementById("loading").style.display="none";

});

const keyboard=new THREE.Mesh(

new THREE.BoxGeometry(.9,.04,.3),

new THREE.MeshStandardMaterial({

color:0x111111,

metalness:.7,

roughness:.25

})

);

keyboard.position.set(0,.78,0);

scene.add(keyboard);

const mouse=new THREE.Mesh(

new THREE.BoxGeometry(.11,.04,.17),

new THREE.MeshStandardMaterial({

color:0x181818

})

);

mouse.position.set(.63,.78,.05);

scene.add(mouse);

const clock=new THREE.Clock();

function animate(){

requestAnimationFrame(animate);

controls.update();

const delta=clock.getDelta();

if(vrm){

vrm.update(delta);

}

renderer.render(scene,camera);

}

animate();

window.addEventListener("resize",()=>{

camera.aspect=window.innerWidth/window.innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(window.innerWidth,window.innerHeight);

});
