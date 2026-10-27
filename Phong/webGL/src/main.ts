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

    // BABYLON.ShaderStore.ShadersStore["PhongVertexShader"] = "\r\n" + 
    // "precision highp float;\r\n" +

    // "attribute vec3 position;\r\n" +
    // "attribute vec3 normal;\r\n" +
    // "attribute vec2 uv;\r\n" +

    // "uniform mat4 world;\r\n" +
    // "uniform mat4 view;\r\n" +
    // "uniform mat4 projection;\r\n" +

    // "varying vec3 vPosition;\r\n" +
    // "varying vec3 vNormal;\r\n" +
    // "varying vec2 vUV;\r\n" +

    // "void main(void) {\r\n" +
    // "    vPosition = vec3(world * vec4(position, 1.0));\r\n" +
    // "    vNormal = mat3(transpose(inverse(world))) * normal;\r\n" +
    // "    vUV = uv;\r\n" +

    // "    gl_Position = projection * view * vec4(vPosition, 1.0);\r\n" +
    // "}\r\n";

    // BABYLON.ShaderStore.ShadersStore["PhongFragmentShader"] = "\r\n" +
    // "precision highp float;\r\n" +

    // "struct Material {\r\n" +
    // "    sampler2D diffuse;\r\n" +
    // "    sampler2D specular;\r\n" +
    // "    float shininess;\r\n" +
    // "};\r\n" +

    // "struct Light {\r\n" +
    // "    vec3 position;\r\n" +

    // "    vec3 ambient;\r\n" +
    // "    vec3 diffuse;\r\n" +
    // "    vec3 specular;\r\n" +
    // "};\r\n" +

    // "varying vec3 vPosition;\r\n" +
    // "varying vec3 vNormal;\r\n" +
    // "varying vec2 vUV;\r\n" +

    // "uniform Material material;\r\n" +
    // "uniform Light light;\r\n" +
    // "uniform vec3 viewPosition;\r\n" +

    // "void main(void) {\r\n" +
    // "    vec3 ambient = light.ambient * texture2D(material.diffuse, vUV).rgb;\r\n" +

    // "    vec3 norm = normalize(vNormal);\r\n" +
    // "    vec3 lightDir = normalize(light.position - vPosition);\r\n" +
    // "    float diff = max(dot(norm, lightDir), 0.0);\r\n" +
    // "    vec3 diffuse = light.diffuse * diff * texture2D(material.diffuse, vUV).rgb;\r\n" +

    // "    vec3 viewDir = normalize(viewPosition - vPosition);\r\n" +
    // "    vec3 reflectDir = reflect(-lightDir, norm);\r\n" +
    // "    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);\r\n" +   
    // "    vec3 specular = light.specular * spec * texture2D(material.specular, vUV).rgb;\r\n" +

    // "    vec3 color = ambient + diffuse + specular;\r\n" +
    // "    gl_FragColor = vec4(color, 1.0);\r\n" +
    // "}\r\n";


    // const shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
    //     vertex: "Phong",
    //     fragment: "Phong"
    // }, {
    //     attributes: ["position", "normal", "uv"],
    //     uniforms: ["world", "view", "projection", "material", "light", "viewPosition"]
    // });

    const shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, "./Shaders/Phong", {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "view", "projection", "material", "light", "viewPosition"]
    });

    shaderMaterial.setVector3("light.position", new BABYLON.Vector3(10, 10, 15));
    shaderMaterial.setVector3("viewPosition", camera.position);

    shaderMaterial.setVector3("light.ambient", new BABYLON.Vector3(0.2, 0.2, 0.2));
    shaderMaterial.setVector3("light.diffuse", new BABYLON.Vector3(0.5, 0.5, 0.5));
    shaderMaterial.setVector3("light.specular", new BABYLON.Vector3(1.0, 1.0, 1.0));

    shaderMaterial.setFloat("material.shininess", 32.0);

    shaderMaterial.setTexture("material.diffuse", new BABYLON.Texture("./textures/container2.png", scene));
    shaderMaterial.setTexture("material.specular", new BABYLON.Texture("./textures/container2_specular.png", scene));
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