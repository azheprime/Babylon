import * as BABYLON from "@babylonjs/core";

// 使用全局BABYLON对象，不需要import语句
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element 
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

// Add your code here matching the playground format
const createScene = () => {
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    // const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));

    const lightDirection = new BABYLON.Vector3(-1, -1, -1).normalize();
    const lightColor = new BABYLON.Color3(1, 1, 1);

    // write your code here

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {}, scene);
    sphere.position.y = 0.5;
    const sphereMat = new BABYLON.PBRMaterial("sphereMat", scene);
    sphereMat.albedoColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    sphereMat.roughness = 1.0;
    sphere.material = sphereMat;

    
    const emitter1 = BABYLON.MeshBuilder.CreatePlane("emitter1", { size: 2 }, scene);
    emitter1.position = new BABYLON.Vector3(0.0, 1.2, 0.0); 
    emitter1.rotation.x = Math.PI / 2;

    const emitMat1 = new BABYLON.PBRMaterial("emitMat1", scene);
    emitMat1.emissiveColor = new BABYLON.Color3(0.0, 4.0, 0.0);   
    emitter1.material = emitMat1;

    const emitter2 = BABYLON.MeshBuilder.CreatePlane("emitter1", { size: 2 }, scene);
    emitter2.position = new BABYLON.Vector3(0.0, -0.2, 0.0); 
    emitter2.rotation.x = Math.PI / 2;

    const emitMat2 = new BABYLON.PBRMaterial("emitMat2", scene);
    emitMat2.emissiveColor = new BABYLON.Color3(4.0, 0.0, 0.0);   
    emitter2.material = emitMat2;
 
    
    // 启用 GBuffer
    scene.enableGeometryBufferRenderer(); // 必须先启用！
    const gbuffer = scene.geometryBufferRenderer!;
    gbuffer.enablePosition = true;
    gbuffer.enableReflectivity = true;
    
    // 后处理：加载自定义 Shader
    BABYLON.Effect.ShadersStore["viewPosVisFragmentShader"] = `
    precision highp float;
    varying vec2 vUV;
    uniform sampler2D positionSampler;
    uniform mat4 view;
    uniform mat4 projection;

    void main() {
      float depth = texture2D(positionSampler, vUV).r; // 将纹理坐标转换为[-1, 1]范围
      gl_FragColor = vec4 (depth, depth, depth, 1.0); // 输出深度值

    }
  `;

  BABYLON.Effect.ShadersStore["viewPosVisVertexShader"] = `
    precision highp float;
    attribute vec2 position;
    varying vec2 vUV;
    void main() {
      vUV = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0., 1.);
    }
  `;

  const postProcess = new BABYLON.PostProcess(
    "viewPosVis",
    "viewPosVis",
    [],
    ["positionSampler", "view", "projection"],
    1.0,
    camera,
    BABYLON.Texture.BILINEAR_SAMPLINGMODE,
    engine,
    false
  );

  postProcess.onApply = (effect) => {
    const textures = gbuffer.getGBuffer().textures;
    effect.setTexture("positionSampler", textures[0]); // position纹理一般是index=2
    effect.setMatrix("view", camera.getViewMatrix());
    effect.setMatrix("projection", camera.getProjectionMatrix());
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