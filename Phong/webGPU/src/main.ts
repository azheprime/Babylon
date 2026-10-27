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
    BABYLON.ShaderStore.ShadersStoreWGSL["phongVertexShader"] = `
        #include<sceneUboDeclaration>
        #include<meshUboDeclaration>

        uniform finalMatrix : mat3x3<f32>;

        attribute position : vec3<f32>;
        attribute normal : vec3<f32>;
        attribute uv : vec2<f32>;

        varying vPosition : vec3<f32>;
        varying vNormal : vec3<f32>;
        varying vUV : vec2<f32>;

        @vertex
        fn main(input : VertexInputs) -> FragmentInputs {
            let worldPosition = mesh.world * vec4<f32>(vertexInputs.position, 1.0);
            vertexOutputs.vPosition = worldPosition.xyz;
            vertexOutputs.vNormal = uniforms.finalMatrix * vertexInputs.normal;
            vertexOutputs.vUV = vertexInputs.uv;

            vertexOutputs.position = scene.viewProjection * mesh.world * vec4<f32>(vertexInputs.position, 1.0);
        }
    `;

    BABYLON.ShaderStore.ShadersStoreWGSL["phongFragmentShader"] = `
        uniform viewPosition : vec3<f32>;    

        varying vPosition : vec3<f32>;
        varying vNormal : vec3<f32>;
        varying vUV : vec2<f32>;

        var diffuse : texture_2d<f32>;
        var specular : texture_2d<f32>;
        var mySampler : sampler;

        struct MyUBO {
            lightposition : vec3<f32>,
            ambient : vec3<f32>,
            diffuse : vec3<f32>,   
            specular : vec3<f32>,
            shininess : f32,
        };

        var<uniform> myUBO : MyUBO;

        @fragment
        fn main(input : FragmentInputs) -> FragmentOutputs {
            var ambient = myUBO.ambient * textureSample(diffuse, mySampler, fragmentInputs.vUV).rgb;   
            
            var norm = normalize(fragmentInputs.vNormal);
            var lightDir = normalize(myUBO.lightposition - fragmentInputs.vPosition);
            var diff = max(dot(norm, lightDir), 0.0);
            var diffuseColor =  myUBO.diffuse * diff *textureSample(diffuse, mySampler, fragmentInputs.vUV).rgb;

            var viewDir = normalize(uniforms.viewPosition - fragmentInputs.vPosition);
            var reflectDir = reflect(-lightDir, norm);
            var spec = pow(max(dot(viewDir, reflectDir), 0.0), myUBO.shininess);
            var specularColor = spec * myUBO.specular * textureSample(specular, mySampler, fragmentInputs.vUV).rgb;

            var color = ambient + diffuseColor + specularColor;
            fragmentOutputs.color = vec4<f32>(color, 1.0);

            // fragmentOutputs.color = vec4<f32>(uniforms.viewPosition, 1.0);
        }
    `;

    const myUBO = new BABYLON.UniformBuffer(engine);
    myUBO.addUniform("lightposition", 3); 
    myUBO.addUniform("ambient", 3);
    myUBO.addUniform("diffuse", 3);
    myUBO.addUniform("specular", 3);
    myUBO.addUniform("shininess", 1);

    myUBO.updateVector3("lightposition", new BABYLON.Vector3(10.0, 10.0, 15.0));
    myUBO.updateVector3("ambient", new BABYLON.Vector3(0.2, 0.2, 0.2));
    myUBO.updateVector3("diffuse", new BABYLON.Vector3(0.5, 0.5, 0.5));
    myUBO.updateVector3("specular", new BABYLON.Vector3(1.0, 1.0, 1.0));
    myUBO.updateFloat("shininess", 32.0); 

    myUBO.update();

    const dTexture = new BABYLON.Texture("./textures/container2.png", scene);
    const sTexture = new BABYLON.Texture("./textures/container2_specular.png", scene);

    const shaderMaterial = new BABYLON.ShaderMaterial("shaderMaterial", scene, {
        vertex: "phong",
        fragment: "phong",
    }, {
        attributes: ["position", "normal", "uv"],
        uniformBuffers: ["Scene", "Mesh", "myUBO"],
        shaderLanguage: BABYLON.ShaderLanguage.WGSL,
    });

    const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);

    const worldMatrix = box.getWorldMatrix();
    shaderMaterial.setMatrix("finalMatrix", BABYLON.Matrix.Invert(worldMatrix).transpose().getRotationMatrix());
    shaderMaterial.setFloat("shininess", 32.0); 
    shaderMaterial.setUniformBuffer("myUBO", myUBO);
    shaderMaterial.setTexture("diffuse", dTexture);
    shaderMaterial.setTexture("specular", sTexture);
    shaderMaterial.setVector3("viewPosition", camera.position);

    const sampler = new BABYLON.TextureSampler();
    sampler.setParameters();
    sampler.samplingMode = BABYLON.Constants.TEXTURE_NEAREST_SAMPLINGMODE;


    shaderMaterial.setTextureSampler("mySampler", sampler);

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