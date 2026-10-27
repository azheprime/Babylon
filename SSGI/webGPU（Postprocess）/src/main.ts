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

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {}, scene);
    sphere.position.y = 0.5;
    const sphereMat = new BABYLON.PBRMaterial("sphereMat", scene);
    sphereMat.albedoColor = new BABYLON.Color3(0.94, 0.92, 0.92);
    sphereMat.roughness = 1.0;
    sphere.material = sphereMat;

    const emitter1 = BABYLON.MeshBuilder.CreateBox("emitter1", { width : 2, height : 2, depth : 0.1 }, scene);
    emitter1.position = new BABYLON.Vector3(0.0, 1.2, 0.0); 
    emitter1.rotation.x = Math.PI / 2;

    const emitMat1 = new BABYLON.PBRMaterial("emitMat1", scene);
    emitMat1.emissiveColor = new BABYLON.Color3(0.0, 4.0, 0.0);   
    emitter1.material = emitMat1;

    const emitter2 = BABYLON.MeshBuilder.CreateBox("emitter1", { width : 2, height : 2, depth : 0.1 }, scene);
    emitter2.position = new BABYLON.Vector3(0.0, -0.2, 0.0); 
    emitter2.rotation.x = Math.PI / 2;

    const emitMat2 = new BABYLON.PBRMaterial("emitMat2", scene);
    emitMat2.emissiveColor = new BABYLON.Color3(4.0, 0.0, 0.0);   
    emitter2.material = emitMat2;

    scene.enableGeometryBufferRenderer();
    const gbuffer = scene.geometryBufferRenderer;
    gbuffer.enablePosition = true;

    const colorRTT = new BABYLON.RenderTargetTexture("colorRTT", { width: engine.getRenderWidth(), height: engine.getRenderHeight() }, scene);
    colorRTT.renderList = [sphere, emitter2, emitter1]; 
    colorRTT.refreshRate = 1; 
    scene.customRenderTargets.push(colorRTT);


    BABYLON.ShaderStore.ShadersStoreWGSL["bilateralFilterFragmentShader"] = `
        uniform screenSize : vec2<f32>;
        uniform blur: f32;
        uniform strength : f32;
        uniform quality : f32;

        var textureSampler : texture_2d<f32>;
        var normalSampler : texture_2d<f32>;
        var depthSampler : texture_2d<f32>;
        var colorSampler : texture_2d<f32>;
        var mySampler : sampler;
        var depthSamplerSampler : sampler;

        varying vUV : vec2<f32>;

        fn linearize_depth(d : f32, zNear : f32, zFar : f32) -> f32 {
            let z_n = 2.0 * d - 1.0;
            return 2.0 * zNear * zFar / (zFar + zNear - z_n * (zFar - zNear));
        }

        @fragment
        fn main(input : FragmentInputs) -> FragmentOutputs {
            let pi = 3.14159;

            let size = uniforms.blur;

            let radius = vec2<f32>(size) / uniforms.screenSize;

            var texel = textureSample(textureSampler, mySampler, fragmentInputs.vUV).rgb;

            var count = 0.0;

            let initialDepth = linearize_depth(textureSample(depthSampler, depthSamplerSampler, fragmentInputs.vUV).r, 0.1, 1000.0);

            let directions = 16.0;

            for (var d = 0.0; d < pi * 2.0; d += (pi * 2.0) / directions) {
                for (var i = 1.0 / uniforms.quality; i <= 1.0; i+= 1.0/uniforms.quality) {
                    let sampleUV = fragmentInputs.vUV + vec2<f32>(cos(d), sin(d)) * radius * i;

                    let texelColor = textureSample(textureSampler, mySampler, sampleUV).rgb;

                    if (abs(linearize_depth(textureSample(depthSampler, depthSamplerSampler, sampleUV).r, 0.1, 1000.0) - initialDepth) < 6.0) {
                        texel += texelColor;
                        count += 1.0;
                    }
                }
            }

            texel /= count;

            let originalColor = textureSample(colorSampler, mySampler, fragmentInputs.vUV).rgb;

            if (abs(fragmentInputs.vUV.x - 0.0) <= 1.0 / uniforms.screenSize.x) {
                fragmentOutputs.color = vec4<f32>(1.0);
            }
            else if (fragmentInputs.vUV.x < 0.0) {
                fragmentOutputs.color = vec4<f32>(originalColor, 1.0);
            }
            else {
                fragmentOutputs.color = vec4(originalColor + uniforms.strength * texel.rgb, 1.0);
            }
        }
    `;

    BABYLON.ShaderStore.ShadersStoreWGSL["bilateralFilterVertexShader"] = `
        attribute position : vec3<f32>;

        varying vUV : vec2<f32>;

        @vertex
        fn main(input : VertexInputs) -> FragmentInputs {
            vertexOutputs.vUV = vertexInputs.position * 0.5 + 0.5;
            vertexOutputs.position = vec4<f32>(vertexInputs.position, 1.0); 
        }
    `;



    BABYLON.ShaderStore.ShadersStoreWGSL["ssgiFragmentShader"] = `
        uniform screenSize : vec2<f32>;
        uniform view : mat4x4<f32>;
        uniform projection : mat4x4<f32>;
        uniform frameCount : f32;

        varying vUV : vec2<f32>;

        var mySampler : sampler;
        var colorSampler : texture_2d<f32>;
        var positionSampler : texture_2d<f32>;
        var normalSampler : texture_2d<f32>;
        var depthSampler : texture_2d<f32>;
        var depthSamplerSampler : sampler;

        fn random(co : vec2<f32>) -> f32 {
            let a = 12.9898;
            let b = 78.233;
            let c = 43758.5453;
            let dt = dot(co.xy, vec2<f32>(a,b));
            let sn = dt - 3.14 * floor(dt / 3.14);
            return fract(sin(sn) * c);
        }

        fn rand(uv : vec2<f32>, seed : f32) -> f32 {
            let result = random(uv + seed / 10.0);
            return result;
        }

        fn GetCosHemisphereSample(normal : vec3<f32>, rand1 : f32, rand2 : f32) -> vec3<f32> {
            let r = sqrt(rand1);
            let phi = 2.0 * 3.141592653589793 * rand2;
            let dir = vec3<f32>(r * cos(phi), r * sin(phi), sqrt(1.0 - rand1));
            if (dot(dir, normal) > 0.0) {
                return dir;
            }
            else if (dot(dir, normal) < 0.0) {
                return -dir;
            }
            else {
                return normal;
            }
        }

        fn aignNoise(uvPos : vec2<f32>, frame : f32) -> f32 {
            let magic = vec3<f32>(0.06711056, 0.00583715, 52.9829189);
            return fract(magic.z * fract(dot(vec3<f32>(uvPos, frame), magic)));
        }

        fn RayMarch(uv : vec2<f32>, rayOrigin : vec3<f32>, rayDir : vec3<f32>, stepSize : f32, maxSteps : i32, projection : mat4x4<f32>, depthSample : texture_2d<f32>, sampler : sampler, maxDist : f32) -> vec4<f32> {
            var rayMask = 0.0;
            var sampleUV = vec3<f32>(0.0);
            var isactive = 1.0;
            for (var i : i32 = 0; i < maxSteps; i++){
                let samplePos = rayOrigin + rayDir * f32(i) * stepSize;
                var clipPos : vec4<f32> = projection * vec4<f32>(samplePos, 1.0);
                clipPos /= clipPos.w;
                sampleUV = clipPos.xyz * 0.5 + 0.5;
                let sampleDepth = textureSample(depthSample, sampler, sampleUV.xy).r;
                let inBounds = step(0.0, sampleUV.x) * step(0.0, sampleUV.y) * (1.0 - step(1.0, sampleUV.x)) * (1.0 - step(1.0, sampleUV.y));
                isactive *= inBounds;
                
                let depthTest = step(sampleDepth, sampleUV.z); 
                rayMask = max(rayMask, depthTest);
            }
            return vec4<f32>(sampleUV.xy * isactive, rayMask * isactive, 0.0);
        }

        @fragment
        fn main(input : FragmentInputs) -> FragmentOutputs {
            var seed = 0.0;
            let depth = textureSample(depthSampler, depthSamplerSampler, fragmentInputs.vUV).r;

            if (depth == 1.0) {
                discard;
            }
    
            let normal = textureSample(normalSampler, mySampler, fragmentInputs.vUV).xyz * 2.0 - 1.0;
            let position = textureSample(positionSampler, mySampler, fragmentInputs.vUV).rgb;

            let posUV = fragmentInputs.vUV * uniforms.screenSize;
            // let noise = aignNoise(posUV, uniforms.frameCount);

            let rand1 = rand(fragmentInputs.vUV, seed);
            seed += 1;
            let rand2 = rand(fragmentInputs.vUV, seed);
            seed += 1;

            let dir = GetCosHemisphereSample(normal, rand1, rand2);

            let viewPosition = uniforms.view * vec4<f32>(position, 1.0);

            let result = RayMarch(fragmentInputs.vUV, viewPosition.xyz, dir, 0.05, 15, uniforms.projection, depthSampler, depthSamplerSampler, 1.0);
            let sampleUV = result.xy;
            let rayMask = result.z;
            let sampleColor = textureSample(colorSampler, mySampler, sampleUV).rgb;
            let originalColor = textureSample(colorSampler, mySampler, fragmentInputs.vUV).rgb;

            var finalColor : vec3<f32>;
            if (rayMask == 1.0) {
                finalColor = sampleColor * 0.7 + originalColor * 0.3;
            }
            else {
                finalColor = originalColor;
            }
            fragmentOutputs.color = vec4<f32>(finalColor, 1.0);
        }
    `;

    BABYLON.ShaderStore.ShadersStoreWGSL["ssgiVertexShader"] = `
        attribute position : vec3<f32>;

        varying vUV : vec2<f32>;

        @vertex
        fn main(input : VertexInputs) -> FragmentInputs {
            vertexOutputs.vUV = vertexInputs.position * 0.5 + 0.5;
            vertexOutputs.position = vec4<f32>(vertexInputs.position, 1.0); 
        }
    `;

    const ssgiShader = new BABYLON.PostProcess("ssgiShader", "ssgi", null, ["colorSampler", "positionSampler", "normalSampler", "depthSampler", "screenSize", "view", "projection", "frameCount"], 1.0, camera, undefined, engine, true,
        undefined, undefined, undefined, undefined, undefined, undefined, BABYLON.ShaderLanguage.WGSL
    );

    engine.onResizeObservable.add(() => {
        engine.resize();
      
        const W = engine.getRenderWidth();
        const H = engine.getRenderHeight();
      
        colorRTT.resize({ width: W, height: H });
        ssgiRTT.resize({ width: W, height: H });
      
        // 如果还有 temporal/其他 RTT，也一并 resize
    });
      

    ssgiShader.onApplyObservable.add((effect) => {
        const depthTexture = gbuffer.getGBuffer().textures[3];
        const positionTexture = gbuffer.getGBuffer().textures[2];
        const normalTexture = gbuffer.getGBuffer().textures[1];


        effect.setTexture("colorSampler", colorRTT);
        effect.setTexture("positionSampler", positionTexture);
        effect.setTexture("normalSampler", normalTexture);
        effect.setTexture("depthSampler", depthTexture);
        effect.setFloat2("screenSize", engine.getRenderWidth(), engine.getRenderHeight());
        effect.setMatrix("view", camera.getViewMatrix());
        effect.setMatrix("projection", camera.getProjectionMatrix());
        effect.setFloat("frameCount", engine.getDeltaTime() / 1000.0);

        const sampler = new BABYLON.TextureSampler();
        sampler.samplingMode = BABYLON.Constants.TEXTURE_NEAREST_NEAREST;
        
        const setTextureSampler = engine.setTextureSampler;
        if (setTextureSampler) {
            setTextureSampler.call(engine, "mySampler", sampler);
        }

    });

    const bilateralFilter = new BABYLON.PostProcess("bilateralFilter", "bilateralFilter", null, ["blur", "strength", "quality", "textureSampler", "depthSampler", "normalSampler", "screenSize", "colorSampler"], 1.0, camera, undefined, engine, true, 
    undefined, undefined, undefined, undefined, undefined, undefined, BABYLON.ShaderLanguage.WGSL);

    bilateralFilter.onApplyObservable.add((effect) => {
        effect.setFloat2("screenSize", engine.getRenderWidth(), engine.getRenderHeight());
        effect.setFloat("quality", 6.0);
        effect.setFloat("blur", 12.0);
        effect.setFloat("strength", 0.7);
        effect.setTexture("normalSampler", gbuffer.getGBuffer().textures[1]);
        effect.setTexture("depthSampler", gbuffer.getGBuffer().textures[3]);
        effect.setTexture("colorSampler", colorRTT);

        const sampler = new BABYLON.TextureSampler();
        sampler.samplingMode = BABYLON.Constants.TEXTURE_NEAREST_NEAREST;
        
        const setTextureSampler = engine.setTextureSampler;
        if (setTextureSampler) {
            setTextureSampler.call(engine, "mySampler", sampler);
        }
    });

    const ssgiRTT = new BABYLON.RenderTargetTexture("ssgiRTT", {
        width: engine.getRenderWidth(),
        height: engine.getRenderHeight()
    }, scene);

    ssgiRTT.addPostProcess(ssgiShader);
    ssgiRTT.addPostProcess(bilateralFilter);

    camera.customRenderTargets.push(ssgiRTT);

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