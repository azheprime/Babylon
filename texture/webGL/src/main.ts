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

    // BABYLON.ShaderStore.ShadersStore["textureVertexShader"] = "\r\n" +
    // "precision highp float;\r\n" +

    // "attribute vec3 position;\r\n" +
    // "attribute vec2 uv;\r\n" +

    // "uniform mat4 worldViewProjection;\r\n" +
    // "varying vec2 vUV;\r\n" +

    // "void main(void) {\r\n" +
    // "    gl_Position = worldViewProjection * vec4(position, 1.0);\r\n" +
    // "    vUV = uv;\r\n" +
    // "}\r\n";

    // BABYLON.ShaderStore.ShadersStore["textureFragmentShader"] = "\r\n" +
    // "precision highp float;\r\n" +

    // "uniform sampler2D textureSampler;\r\n" +

    // "varying vec2 vUV;\r\n" +

    // "void main(void) {\r\n" +
    // "    vec4 color = texture2D(textureSampler, vUV);\r\n" +
    // "    gl_FragColor = color;\r\n" +
    // "}\r\n";

    // const shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
    //     vertex: "texture",
    //     fragment: "texture"
    // }, {
    //     attributes: ["position", "uv"],
    //     uniforms: ["worldViewProjection", "textureSampler"]
    // });

    const shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, "./Shaders/texture", {
        attributes: ["position", "uv"],
        uniforms: ["worldViewProjection", "textureSampler"]
    });
    shaderMaterial.setTexture("textureSampler", new BABYLON.Texture("./textures/container2.png", scene));
    shaderMaterial.backFaceCulling = false;

    const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
    box.material = shaderMaterial;
    
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