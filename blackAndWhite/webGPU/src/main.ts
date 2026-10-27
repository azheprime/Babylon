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
    const sphere= BABYLON.MeshBuilder.CreateSphere("sphere", {}, scene);
    const mat1 = new BABYLON.StandardMaterial("mat1", scene);
    mat1.diffuseColor = new BABYLON.Color3(1.0, 0.6, 0.6);
    sphere.material = mat1;

    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 3, height: 3 }, scene);
    const mat2 = new BABYLON.StandardMaterial("mat2", scene);
    mat2.diffuseColor = new BABYLON.Color3(0.6, 0.6, 1.0);
    ground.material = mat2;
    ground.position.y = -0.5;

    BABYLON.ShaderStore.ShadersStoreWGSL["bwFragmentShader"] = `
        varying vUV : vec2<f32>;
        
        var mySampler : sampler;
        var myTexture : texture_2d<f32>;

        @fragment
        fn main(input: FragmentInputs) -> FragmentOutputs {
            let colors = textureSample(myTexture, mySampler, fragmentInputs.vUV);
            let gray = dot(colors.rgb, vec3<f32>(0.299, 0.587, 0.114));
            let bw = select(0.0, 1.0, gray > 0.6);
            fragmentOutputs.color = vec4<f32>(bw, bw, bw, 1.0);
        }
    `;


    const shader = new BABYLON.PostProcess("Shader", "bw", null, ["myTexture"], 1.0, camera, undefined, engine, true,
        undefined, undefined, undefined, undefined, undefined, undefined, BABYLON.ShaderLanguage.WGSL
    );

    shader.onApplyObservable.add((effect) => {
        const texture = shader.inputTexture.texture;
        console.log("Texture sampling mode:", texture.samplingMode);
        effect._bindTexture("myTexture", shader.inputTexture.texture);

        const sampler = new BABYLON.TextureSampler();
        sampler.samplingMode = BABYLON.Constants.TEXTURE_NEAREST_NEAREST;
        console.log("Sampler sampling mode:", sampler.samplingMode);

        const setTextureSampler = engine.setTextureSampler;
        if (setTextureSampler) {
            setTextureSampler.call(engine, "mySampler", sampler);
        } 
    });

    


    camera.attachPostProcess(shader);

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