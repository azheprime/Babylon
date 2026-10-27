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

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0), scene);
    // camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));

    // write your code here
    BABYLON.ShaderStore.ShadersStoreWGSL["textureVertexShader"] = `
        #include<sceneUboDeclaration>
        #include<meshUboDeclaration>

        attribute position : vec3<f32>;
        attribute uv : vec2<f32>;

        varying vUV : vec2<f32>;
    
        @vertex
        fn main(input : VertexInputs) -> FragmentInputs {
            vertexOutputs.position = scene.viewProjection * mesh.world * vec4<f32>(vertexInputs.position, 1.0);
            vertexOutputs.vUV = vertexInputs.uv;
        }
    `;

    BABYLON.ShaderStore.ShadersStoreWGSL["textureFragmentShader"] = `
        
        varying vUV : vec2<f32>;

        var diffuse : texture_2d<f32>;
        var mySampler : sampler; 

        @fragment
        fn main(input : FragmentInputs) -> FragmentOutputs {
            fragmentOutputs.color = textureSample(diffuse, mySampler, fragmentInputs.vUV);
        }
    `;

    const mainTexture = new BABYLON.Texture("./textures/container2.png", scene);
    
    const shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
        vertex: "texture",
        fragment: "texture",
    }, {
        attributes: ["position", "normal", "uv"],
        uniformBuffers: ["Scene", "Mesh"],
        shaderLanguage: BABYLON.ShaderLanguage.WGSL,
    });

    shaderMaterial.setTexture("diffuse", mainTexture);

    const sampler = new BABYLON.TextureSampler();

    sampler.setParameters();
    sampler.samplingMode = BABYLON.Texture.NEAREST_SAMPLINGMODE;
    shaderMaterial.setTextureSampler("mySampler", sampler);

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