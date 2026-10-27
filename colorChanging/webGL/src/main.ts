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

    
    // BABYLON.ShaderStore.ShadersStore["colorChangingVertexShader"] = "\r\n" +
    //     "precision highp float;\r\n" +

    //     "attribute vec3 position;\r\n" +

    //     "uniform mat4 worldViewProjection;\r\n" +

    //     "void main() {\r\n" +
    //     "    gl_Position = worldViewProjection * vec4(position, 1.0);\r\n" +

    //     "}\r\n";

    // BABYLON.ShaderStore.ShadersStore["colorChangingFragmentShader"] = "\r\n" +
    //     "precision highp float;\r\n" +

    //     "uniform float time;\r\n" +

    //     "void main() {\r\n" +
    //     "    gl_FragColor = vec4(abs(sin(time)), abs(sin(time + 2.0)), abs(sin(time + 4.0)), 1.0);\r\n" +
    //     "}\r\n";

    // const shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
    //     vertex: "colorChanging",
    //     fragment: "colorChanging"
    //     }, 
    //     {
    //         attributes: ["position"],
    //         uniforms: ["worldViewProjection", "time"]
    //     });

    const shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, "./Shaders/colorChanging", {
        attributes: ["position"],
        uniforms: ["worldViewProjection", "time"],
    });

    const box = BABYLON.MeshBuilder.CreateBox("box", {}, scene);
    scene.registerBeforeRender(function () {
        shaderMaterial.setFloat("time", performance.now() / 1000.0);
    });

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