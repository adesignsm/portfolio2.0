import * as THREE from "../scripts/three.module.js";
import Water from "../scripts/Water.js";
import Sky from "../scripts/Sky.js";
import OrbitControls from "../scripts/OrbitControls.js";

console.log(THREEx.DomEvents);

var cameraWork_flag = false;
var cameraContact_flag = false;

var workPanel, workPanel_arr = [];

class SceneManager {
    constructor(canvas) {

        const scene = buildScene();
        const renderer = buildRenderer(canvas);
        const camera = buildCamera();
        const ddh = buildDeca();
        const water = buildWater();
        const sky = buildSky();
        const sun = buildSun();
        const controls = setOrbitControls();
        const domEvents = buildDomEvents();

        function buildScene() {

            const scene = new THREE.Scene();
            // scene.background = new THREE.Color(0x333333);

            return scene;
        }

        function buildRenderer(canvas) {

            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            canvas.appendChild(renderer.domElement);

            return renderer;
        }

        function buildCamera() {

            const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
            camera.position.set(30, 30, 170);

            return camera;
        }

        // Objects
        function buildSky() {

            const sky = new Sky();
            sky.scale.setScalar(10000);
            scene.add(sky);
            
            return sky;
        }

        function buildSun() {

            const pmremGenerator = new THREE.PMREMGenerator(renderer);

            const sun = new THREE.Vector3();

            const theta = Math.PI * (0.49 - 0.5);
            const phi = 2 * Math.PI * (0.205 - 0.5);

            sun.x = Math.cos(phi);
            sun.y = 1;
            sun.z = 10;

            sky.material.uniforms['sunPosition'].value.copy(sun);
            scene.environment = pmremGenerator.fromScene(sky).texture;

            const light = new THREE.PointLight("0xffffff", 10);
            scene.add(light);

            return sun;
        }

        function buildWater() {
            const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
            const water = new Water(
                waterGeometry,
                {
                    textureWidth: 1000,
                    textureHeight: 1000,
                    waterNormals: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg', function (texture) {
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    }),
                    alpha: 1.0,
                    sunDirection: new THREE.Vector3(),
                    sunColor: 0xffffff,
                    waterColor: 0x040404,
                    distortionScale: 10,
                    fog: scene.fog !== undefined
                }
            );
            water.rotation.x = -Math.PI / 2;
            scene.add(water);

            const waterUniforms = water.material.uniforms;
            return water;
        }

        function buildDeca() {
            const geometry = new THREE.DodecahedronBufferGeometry(20, 0);
            const material = new THREE.MeshStandardMaterial({ wireframe: true, roughness: 0, metalness: 0.5 });

            const ddh = new THREE.Mesh(geometry, material);
            scene.add(ddh);

            return ddh;
        }

        function buildWorkPanel() {

            const workGeo = new THREE.PlaneGeometry(170, 100, 100);
            const workMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.8, side: THREE.DoubleSide });

            workPanel = new THREE.Mesh(workGeo, workMaterial);
            workPanel.position.set(-30, -100, 200);

            if (workPanel_arr.length >= 1) {

                console.log("limit");

            } else {

                scene.add(workPanel);
                workPanel_arr.push(workPanel);
            }

            cameraWork_flag = true;
            cameraContact_flag = false;

            controls.enabled = true;

            return workPanel;
        }

        function buildContactForm() {

            cameraContact_flag = true;
            cameraWork_flag = false;

            controls.enabled = false;
        }

        function setOrbitControls() {
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.maxPolarAngle = Math.PI * 0.495;
            controls.target.set(0, 10, 0);
            controls.minDistance = 40.0;
            controls.maxDistance = 200.0;
            controls.update();

            controls.enabled = false;

            return controls;
        }

        function buildDomEvents() {
        }

        document.getElementById("portfolio-button").onmousedown = function () {

            buildWorkPanel();
        };

        document.getElementById("connect-button").onmousedown = function () {

            buildContactForm();
        };

        this.update = function () {
            // Animates water
            water.material.uniforms['time'].value += 1.0 / 60.0;

            const time = performance.now() * 0.001;

            //ddh limiter
            if (ddh.position.y >= 40) {

                var current_pos = ddh.position.y;
                ddh.position.y = current_pos;

            } else {

                ddh.position.y += 0.2;
            }

            //WORK camera limiter
            if (cameraWork_flag == true && cameraContact_flag == false) {

                if (camera.position.z >= 500) {

                    var current_pos = camera.position.z;
                    camera.position.z = current_pos;

                    controls.target.set(0, 10, 650);
                    controls.update();

                    camera.rotation.set(-0.11710874456686426, 0.17349974499856707, 0.02030669081097108);
                    camera.updateProjectionMatrix();

                } else {

                    camera.position.z += 3;
                    camera.updateProjectionMatrix();
                }

                if (workPanel.position.y >= 45) {

                    var current_pos = workPanel.position.y;
                    workPanel.position.y = current_pos;

                } else {

                    workPanel.position.y += 0.3;
                }
            }

            //CONTACT camera limiter
            if (cameraContact_flag == true && cameraWork_flag == false) {

                if (camera.position.z <= -202) {

                    var current_pos = camera.position.z;
                    camera.position.z = current_pos;
                    camera.updateProjectionMatrix();

                } else {

                    camera.position.z -= 3;
                    camera.updateProjectionMatrix();
                }
            }

            ddh.rotation.x = time * 0.3;
            ddh.rotation.z = time * 0.3;

            renderer.render(scene, camera);
        };

        window.addEventListener("resize", function () {

            var w = window.innerWidth;
            var h = window.innerHeight;

            renderer.setSize(w, h);

            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        });
    }
}

const canvas = document.getElementById("canvas");
const sceneManager = new SceneManager(canvas);

function animate() {

    requestAnimationFrame(animate);
    sceneManager.update();
}

animate();