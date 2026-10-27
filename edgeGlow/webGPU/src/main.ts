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
    BABYLON.ShaderStore.ShadersStoreWGSL["innerVertexShader"] = `
        #include<sceneUboDeclaration>
        #include<meshUboDeclaration>

        uniform finalMatrix : mat3x3<f32>;

        attribute position : vec3<f32>;
        attribute normal : vec3<f32>;

        varying vNormal : vec3<f32>;
        varying vPosition : vec3<f32>;

        @vertex
        fn main(input : VertexInputs) -> FragmentInputs {
            let worldPosition = mesh.world * vec4<f32>(vertexInputs.position, 1.0);
            vertexOutputs.vPosition = worldPosition.xyz;
            vertexOutputs.vNormal = uniforms.finalMatrix * vertexInputs.normal;

            vertexOutputs.position = scene.viewProjection * mesh.world * vec4<f32>(vertexInputs.position, 1.0);
        }
    `;

    BABYLON.ShaderStore.ShadersStoreWGSL["innerFragmentShader"] = `
        uniform viewPosition : vec3<f32>;    

        varying vPosition : vec3<f32>;
        varying vNormal : vec3<f32>;

        struct MyUBO {
            lightposition : vec3<f32>,  
            lightColor : vec3<f32>,
            objectColor : vec3<f32>,
        };

        var<uniform> myUBO : MyUBO;

        @fragment
        fn main(input : FragmentInputs) -> FragmentOutputs {
            var ambientStrength = 0.1;
            var ambient = ambientStrength * myUBO.lightColor;
            
            var norm = normalize(fragmentInputs.vNormal);
            var lightDir = normalize(myUBO.lightposition - fragmentInputs.vPosition);
            var diff = max(dot(norm, lightDir), 0.0);
            var diffuseColor = diff * myUBO.lightColor;

            var specularStrength = 0.5;
            var viewDir = normalize(uniforms.viewPosition - fragmentInputs.vPosition);
            var reflectDir = reflect(-lightDir, norm);
            var spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
            var specularColor = spec * specularStrength * myUBO.lightColor;

            var color = (ambient + diffuseColor + specularColor) * myUBO.objectColor;
            fragmentOutputs.color = vec4<f32>(color, 1.0);

        }
    `;

    const myUBO = new BABYLON.UniformBuffer(engine);
    myUBO.addUniform("lightposition", 3);
    myUBO.addUniform("lightColor", 3);
    myUBO.addUniform("objectColor", 3);

    myUBO.updateVector3("lightposition", new BABYLON.Vector3(10.0, 7.0, 5.0));
    myUBO.updateVector3("lightColor", new BABYLON.Vector3(1.0, 1.0, 1.0));
    myUBO.updateVector3("objectColor", new BABYLON.Vector3(1.0, 1.0, 0.0));

    myUBO.update();

    const innerShaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
        vertex: "inner",
        fragment: "inner",
    }, {
        attributes: ["position", "normal"],
        uniformBuffers: ["Scene", "Mesh", "myUBO"],
        shaderLanguage: BABYLON.ShaderLanguage.WGSL,
    });
    innerShaderMaterial.backFaceCulling = false;

    const innerbox = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);

    const worldMatrix = innerbox.getWorldMatrix();
    innerShaderMaterial.setMatrix("finalMatrix", BABYLON.Matrix.Invert(worldMatrix).transpose().getRotationMatrix());
    innerShaderMaterial.setUniformBuffer("myUBO", myUBO);
    innerShaderMaterial.setVector3("viewPosition", camera.position);
    innerbox.material = innerShaderMaterial;

    BABYLON.ShaderStore.ShadersStoreWGSL["outerVertexShader"] = `
        #include<sceneUboDeclaration>
        #include<meshUboDeclaration>

        attribute position : vec3<f32>;

        @vertex
        fn main(input : VertexInputs) -> FragmentInputs {
            vertexOutputs.position = scene.viewProjection * mesh.world * vec4<f32>(vertexInputs.position, 1.0);
        }
    `;

    BABYLON.ShaderStore.ShadersStoreWGSL["outerFragmentShader"] = `
        @fragment
        fn main(input : FragmentInputs) -> FragmentOutputs {
            if (fragmentInputs.frontFacing) {
                discard;
            }
            else {
                fragmentOutputs.color = vec4<f32>(0.0, 0.0, 1.0, 1.0);
            }
        }
    `;

    const outerShaderMaterial = new BABYLON.ShaderMaterial("outerShader", scene, {
        vertex: "outer",
        fragment: "outer",
    }, {
        attributes: ["position"],
        uniformBuffers: ["Scene", "Mesh"],
        shaderLanguage: BABYLON.ShaderLanguage.WGSL,
    });
    outerShaderMaterial.backFaceCulling = false;

    const outerbox = BABYLON.MeshBuilder.CreateBox("outerbox", { size: 1.01 }, scene);
    outerbox.material = outerShaderMaterial;

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