import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Viewer class for interacting with 3D scene
 * @author Jovin Lim
 * @property {THREE.Scene} scene
 * @property {THREE.PerspectiveCamera} camera
 * @property {THREE.WebGLRenderer} renderer
 * @property {OrbitControls} controls 
 */
class Viewer {
    constructor(container) {
        // Set up the scene
        this.scene = new THREE.Scene();
        const backgroundColor = new THREE.Color("#d1e9ff");
        // backgroundColor.setHex("#d1e9ff", THREE.SRGBColorSpace);
        this.scene.background = backgroundColor;
        this.showHelpers = false;
        this.showDefaultCube = true;

        this.createCamera()
        // Set up the renderer
        this.createRenderer()
        container.appendChild(this.renderer.domElement);
        this.createOrbitControls()
        this.createLights()

        // Debug cube
        if (this.showDefaultCube){
            this.addDefaultCube()
        }

        // Handle window resizing
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        // Start the animation loop
        this.animate();
    }

    createCamera(){
        const fieldOfView = 75;
        const aspectRatio = window.innerWidth / window.innerHeight;
        const nearPlane = 0.1;
        const farPlane = 1000;
        this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
        this.camera.position.set(0, 0, 5); // Adjust as needed
    }

    createRenderer(){
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Default shadow mapping
    }

    createOrbitControls(){
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // For smoother camera movements
        this.controls.dampingFactor = 0.1;
        this.controls.maxDistance = 100;
        this.controls.minDistance = 0.1;
    }

    createLights(){
        // Create a group for lights and add it to the scene
        this.lightGroup = new THREE.Group();
        this.lightGroup.name = "Lights"; // Naming the group for clarity, though this is not an official layer

        const ambientLight = new THREE.AmbientLight({color:0x404040, intensity:1}); // Soft white light
        this.lightGroup.add(ambientLight); 
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        // directionalLight.target = new THREE.Vector3(0,0,0);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 512; // Default
        directionalLight.shadow.mapSize.height = 512; // Default
        directionalLight.shadow.camera.near = 0.5; // Default
        directionalLight.shadow.camera.far = 500; // Default
        this.lightGroup.add(directionalLight);

        this.scene.add(this.lightGroup);

        if (this.showHelpers){
            const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
            this.scene.add( helper );
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this)); // Bind the method to keep "this" reference
        this.controls.update(); // Only required if controls.enableDamping = true
        this.renderer.render(this.scene, this.camera);
    }

    addObject(object) {
        this.scene.add(object);
    }

    addDefaultCube() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green color
        const cube = new THREE.Mesh(geometry, material);
        cube.receiveShadow = true;
        cube.castShadow = true;
        this.scene.add(cube);
        return cube;
    }

}

export default Viewer