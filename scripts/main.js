import * as THREE from "../scripts/three.module.js";
import Water from "../scripts/Water.js";
import Sky from "../scripts/Sky.js";
import OrbitControls from "../scripts/OrbitControls.js";

console.log(THREEx.DomEvents);

var cameraWork_flag = false, cameraContact_flag = false;
var contact_flag = false, work_flag = false;

var workPanel, workPanel_arr = [], geo_arr = [];

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

        //builds the work panel TV
        function buildWorkPanel() {

            cameraWork_flag = true;
            cameraContact_flag = false;

            controls.enabled = true;

            //webgl rendering
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

            //aniamtions JQUERY
            $("#written-content").fadeOut();
            $("#intro-text").fadeOut();
            $("#set1-buttons").fadeOut();
            $("#set2-buttons").delay(1000).fadeIn();

            //remove contact section
            $("#contact-section").fadeOut();

            setTimeout(function() {

                $("#intro-text").text("My projects and skillset");
                $("#intro-text").fadeIn();
                
            }, 700);

            return workPanel;
        }

        //tech stack geomesh's
        function buildTECHSTACKgeo() {

            const stackImage_arrSPHERE = ["css3.png", "firebase.png", "html5.png", "jquery.jpg", "react.png", "scss.png", "threeJS.png", "js.jpg"];
            
            const sphereGeo = new THREE.SphereGeometry(10, 10, 10);
            const boxGeo = new THREE.BoxGeometry(15, 15, 15);

            for (var i = 0; i < stackImage_arrSPHERE.length; i++) {

                var sphereMat = new THREE.MeshBasicMaterial({
                    map: new THREE.TextureLoader().load(`./stack_media/${stackImage_arrSPHERE[i]}`),
                    transparent: true,
                    side: THREE.DoubleSide
                });

                var stackSphere = new THREE.Mesh(boxGeo, sphereMat);
                scene.add(stackSphere);
                geo_arr.push(stackSphere);

                geo_arr[i].position.x = Math.floor(Math.random() * (-70 - 60 + 1) + 60);
                geo_arr[i].position.z = Math.floor(Math.random() * (400 - 200 + 1) + 200);
            }

            for (var x = 0; x < geo_arr.length; x++) {

                return geo_arr[x];
            }
        }

        function buildContactForm() {

            cameraContact_flag = true;
            cameraWork_flag = false;

            controls.enabled = false;

            if (contact_flag == true && work_flag !== true) {

                $("#written-content").fadeOut();
                // $("#controls-center").css({"bottom": "20vw"});
                $("#intro-text").fadeOut();

                setTimeout(function() {

                    $("#intro-text").text("Bring an idea, and I'll bring it to life.");
                    $("#intro-text").fadeIn();

                    $("#connect-button").text("RESUME/URLS");
                    //link resume button to pdf of resume
                    
                }, 700);

                $("#contact-section").fadeIn();
                $("#contact-section").delay(500).animate({opacity: "1"}, 500);
                $("#input-container").delay(700).animate({opacity: "1", marginTop: "65vw"}, 500);

                $("#connect-button").delay(200).fadeOut();
                $("#connect-button").delay(4000).fadeIn()
            
            } else {

                return false;
            }
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

            contact_flag = false;
            work_flag = true;

            buildWorkPanel();
            buildTECHSTACKgeo();
        };

        document.getElementById("connect-button").onmousedown = function () {

            work_flag = false;
            contact_flag = true;
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

                if (workPanel.position.y >= 40) {

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

            //TECH STACK animations
            for (var i = 0; i < geo_arr.length; i++) {

                geo_arr[i].position.y = Math.sin(time) * -2;

                geo_arr[i].rotation.x = Math.cos(time) * 0.3;
                geo_arr[i].rotation.z = time * 0.3;
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