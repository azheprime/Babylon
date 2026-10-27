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

    const shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, "./Shaders/edgeGlow", {
        attributes: ["position", "normal"],
        uniforms: ["world", "view", "projection", "lightPosition", "lightColor", "viewPosition", "objectColor"]
    });
    shaderMaterial.setColor3("lightColor", new BABYLON.Color3(1.0, 1.0, 1.0));
    shaderMaterial.setColor3("objectColor", new BABYLON.Color3(1.0, 1.0, 0.0));
    shaderMaterial.setVector3("lightPosition", new BABYLON.Vector3(10.0, 7.0, 5.0));
    shaderMaterial.setVector3("viewPosition", camera.position);
    shaderMaterial.backFaceCulling = false;

    const outerMaterial = new BABYLON.ShaderMaterial("outerMaterial", scene, "./Shaders/outer", {
        attributes: ["position"],
        uniforms: ["world", "view", "projection"],
    });
    outerMaterial.backFaceCulling = false;

    const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
    box.material = shaderMaterial;

    const outerbox = BABYLON.MeshBuilder.CreateBox("outerbox", { size: 1.01 }, scene);
    outerbox.material = outerMaterial;

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