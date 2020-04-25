import * as THREE from 'three'

export const WavyCircleEffect = () => {
    let scene, camera, renderer;
    let geometry, material, meshes;

    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let fov = 60;

    let cubeSize = 1;
    let cubeCount = 17;

    //let timeLastFrameInMS = 0;

    const init = () => {
        resetWindowDimensions();

        // Create the renderer
        if (window.WebGLRenderingContext)
            renderer = new THREE.WebGLRenderer({ alpha: true });
        else
            renderer = new THREE.CanvasRenderer();
        resetRenderer();

        let boop = document.body; //document.getElementById("background-animation");
        boop.appendChild(renderer.domElement);

        // Create the main camera
        camera = new THREE.PerspectiveCamera();
        camera.position.z = 10;
        resetMainCamera();

        // Setup the scene
        scene = new THREE.Scene();

        geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        material = new THREE.MeshBasicMaterial({ color: 0x121212, wireframe: false });

        meshes = new Array(cubeCount);
        for (let i = 0; i < meshes.length; i++) {
            let mesh = new THREE.Mesh(geometry, material);

            mesh.position.x = i * cubeSize - cubeSize * cubeCount / 2 + cubeSize / 2;

            meshes[i] = mesh;
            scene.add(mesh);
        }

        // Setup event listeners
        window.addEventListener('resize', onWindowResize, false);
    }

    const resetMainCamera = () => {
        camera.fov = fov;
        camera.aspect = viewportWidth / viewportHeight;
        camera.near = 1;
        camera.far = 1000;

        camera.updateProjectionMatrix();
    }

    const resetRenderer = () => {
        renderer.setSize(viewportWidth, viewportHeight);
    }

    const resetWindowDimensions = () => {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
    }

    const onWindowResize = () => {
        resetWindowDimensions();
        resetMainCamera();
        resetRenderer();
    }

    const animate = (timeInMS) => {
        requestAnimationFrame(animate);

        let t = timeInMS / 1000 * 0.05;
        //let dt = (timeInMS - timeLastFrameInMS) / 1000;
        //timeLastFrameInMS = timeInMS;

        for (let i = 0; i < meshes.length; i++) {
            let mesh = meshes[i];

            mesh.rotation.z = 0.25 * 2 * Math.PI * t;

            let scale = (Math.sin(3 * t + 2 * (i / cubeCount) * Math.PI) + 1) / 2 + 0.5;
            mesh.scale.set(scale, scale, scale);

            let displacement = Math.sin(6 * t + 2 * (i / cubeCount) * 2 * Math.PI);
            mesh.position.x = Math.sin(t + (i / cubeCount) * 2 * Math.PI) * 3 + displacement;
            mesh.position.y = Math.cos(t + (i / cubeCount) * 2 * Math.PI) * 4 + displacement;
        }
        renderer.render(scene, camera);
    }

    init();
    animate(-1);

};
