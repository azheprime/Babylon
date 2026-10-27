import * as BABYLON from "@babylonjs/core";

// 使用全局BABYLON对象，不需要import语句
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element 
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

// Add your code here matching the playground format
const createScene = () => {
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));

    const sphere = BABYLON.MeshBuilder.CreateSphere("box", {}, scene);
    const mat1 = new BABYLON.StandardMaterial("mat1", scene);
    mat1.diffuseColor = new BABYLON.Color3(1.0, 0.6, 0.6);
    sphere.material = mat1;

    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 3, height: 3 }, scene);
    const mat2 = new BABYLON.StandardMaterial("mat2", scene);
    mat2.diffuseColor = new BABYLON.Color3(0.6, 0.6, 1.0);
    ground.material = mat2;
    ground.position.y = -0.5;


    BABYLON.Effect.ShadersStore["bwFragmentShader"] = `
        precision highp float;

        varying vec2 vUV;
        uniform sampler2D textureSampler;
        uniform float threshold;

        void main(void) {
            vec4 color = texture2D(textureSampler, vUV);
            float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
            float bw = step(threshold, gray);
            gl_FragColor = vec4(vec3(bw), 1.0);
        }
    `;


    let thresholdValue = 0.6;

    const postProcess = new BABYLON.PostProcess(
        "bwPostProcess",
        "bw",
        ["threshold"], 
        null,
        1.0,
        camera
    );

    postProcess.onApply = (effect) => {
        effect.setFloat("threshold", thresholdValue);
    };


    return scene;
}

const scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});