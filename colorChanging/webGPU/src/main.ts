import * as BABYLON from "@babylonjs/core";

// 使用全局BABYLON对象，不需要import语句
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element 
// const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
let engine: BABYLON.WebGPUEngine;

const createEngine = async () => {
    engine = new BABYLON.WebGPUEngine(canvas);
    await engine.initAsync();
    return engine;
}

// Add your code here matching the playground format
const createScene = () => {
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));

    // write your code here
    BABYLON.ShaderStore.ShadersStoreWGSL["colorVertexShader"] = `
        #include<sceneUboDeclaration>
        #include<meshUboDeclaration>

        attribute position : vec3<f32>;
        
        @vertex
        fn main(input : VertexInputs) -> FragmentInputs {
            vertexOutputs.position = scene.viewProjection * mesh.world * vec4<f32>(vertexInputs.position, 1.0);
        }
    `;

    BABYLON.ShaderStore.ShadersStoreWGSL["colorFragmentShader"] = `
        uniform time : f32;

        @fragment
        fn main(input : FragmentInputs) -> FragmentOutputs {
            fragmentOutputs.color = vec4<f32>(sin(uniforms.time), sin(uniforms.time)+0.2, 0.5 * sin(uniforms.time)+0.4, 1.0);
        }
    `;

    const shaderMaterial = new BABYLON.ShaderMaterial("shaderMaterial", scene, {
        vertex: "color",
        fragment: "color"
    }, {
        attributes: ["position"],
        uniformBuffers: ["Scene", "Mesh"],
        shaderLanguage: BABYLON.ShaderLanguage.WGSL
    });

    scene.registerBeforeRender(() => {
        shaderMaterial.setFloat("time", performance.now() / 1000);
    });

    const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
    box.material = shaderMaterial;


    return scene;
}

engine = await createEngine(); 
const scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});