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

    const emitter1 = BABYLON.MeshBuilder.CreateBox("emitter1", { width: 2, height: 2, depth: 0.1 }, scene);
    emitter1.position = new BABYLON.Vector3(0.0, 1.2, 0.0);
    emitter1.rotation.x = Math.PI / 2;

    const emitMat1 = new BABYLON.PBRMaterial("emitMat1", scene);
    emitMat1.emissiveColor = new BABYLON.Color3(0.0, 4.0, 0.0);
    emitter1.material = emitMat1;

    const emitter2 = BABYLON.MeshBuilder.CreateBox("emitter1", { width: 2, height: 2, depth: 0.1 }, scene);
    emitter2.position = new BABYLON.Vector3(0.0, -0.2, 0.0);
    emitter2.rotation.x = Math.PI / 2;

    const emitMat2 = new BABYLON.PBRMaterial("emitMat2", scene);
    emitMat2.emissiveColor = new BABYLON.Color3(4.0, 0.0, 0.0);
    emitter2.material = emitMat2;

    scene.enableGeometryBufferRenderer();
    let gbuffer = scene.geometryBufferRenderer;
    gbuffer.enablePosition = true;

    let colorRTT = new BABYLON.RenderTargetTexture("colorRTT", { width: engine.getRenderWidth(), height: engine.getRenderHeight() }, scene);
    colorRTT.renderList = [sphere, emitter2, emitter1];
    colorRTT.refreshRate = 1;
    scene.customRenderTargets.push(colorRTT);

    const bilateralComputeShader = BABYLON.ShaderStore.ShadersStoreWGSL["bilateralFilterFragmentShader"] = `
        struct bilateralUniform {
           screenSize : vec2<f32>,
           blur : f32,
           strength : f32,
           quality : f32
        }

        @group(0) @binding(0) var depthTexture : texture_2d<f32>;
        @group(0) @binding(1) var ssgiTexture : texture_2d<f32>;
        @group(0) @binding(2) var colorTexture : texture_2d<f32>;

        @group(0) @binding(3) var<uniform> uniforms : bilateralUniform;

        @group(0) @binding(4) var resultTexture : texture_storage_2d<rgba8unorm, write>;

        fn linearize_depth(d : f32, zNear : f32, zFar : f32) -> f32 {
            let z_n = 2.0 * d - 1.0;
            return (2.0 * zNear * zFar) / (zFar + zNear - z_n * (zFar - zNear));
        }

        @compute @workgroup_size(1, 1, 1)
        fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            let pix = vec2<i32>(i32(global_id.x), i32(global_id.y));
            let dims = vec2<i32>(textureDimensions(ssgiTexture, 0));
            if (pix.x < 0 || pix.y < 0 || pix.x >= dims.x || pix.y >= dims.y) { return; }
            let centerDepth = textureLoad(depthTexture, pix, 0).r;

            if (centerDepth == 1.0){
                textureStore(resultTexture, pix, vec4<f32>(0.0, 0.0, 0.0, 0.0));
                return;
            }
            let pi = 3.14159;

            let size = uniforms.blur;

            let radius = vec2<f32>(size);

            var texel = textureLoad(ssgiTexture, pix, 0).rgb;

            var count = 0.0;

            let initialDepth = linearize_depth(textureLoad(depthTexture, pix, 0).r, 0.1, 1000.0);
            let directions = 16.0;

            for (var d = 0.0; d < pi * 2.0; d += (pi * 2.0) / directions) {
                for (var i = 1.0 / uniforms.quality; i <= 1.0; i += 1.0 / uniforms.quality) {
                    let samplePix = vec2<f32>(pix) + vec2<f32>(cos(d), sin(d)) * radius * i;
                    let p = vec2<i32>(round(samplePix));

                    let texelColor = textureLoad(ssgiTexture, p, 0).rgb;

                    if (abs(linearize_depth(textureLoad(depthTexture, p, 0).r, 0.1, 1000.0) - initialDepth) < 6.0){
                        texel += texelColor;
                        count += 1.0;
                    }
                }
            }

            texel /= count;
            let originalColor = textureLoad(colorTexture, pix, 0).rgb;

            if (pix.x == 0) {
                textureStore(resultTexture, pix, vec4<f32>(1.0, 1.0, 1.0, 1.0));
            }
            else {
                textureStore(resultTexture, pix, vec4<f32>(originalColor + uniforms.strength * texel.rgb, 1.0));
            }
        }
    `;

    const ssgiComputeShader = BABYLON.ShaderStore.ShadersStoreWGSL["ssgiComputeShader"] = `
        struct ssgiUniform {
            screenSize : vec2<f32>,
            view : mat4x4<f32>,
            projection : mat4x4<f32>,
            frameCount : f32
        }

        @group(0) @binding(0) var depthTexture : texture_2d<f32>;
        @group(0) @binding(1) var positionTexture : texture_2d<f32>;
        @group(0) @binding(2) var normalTexture : texture_2d<f32>;
        @group(0) @binding(3) var colorTexture : texture_2d<f32>;
        
        @group(0) @binding(4) var<uniform> uniforms : ssgiUniform;

        @group(0) @binding(5) var ssgiTexture : texture_storage_2d<rgba8unorm, write>;

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

        fn aignNoise(uvPos : vec2<f32>, frame : f32) -> f32 {
            let magic = vec3<f32>(0.06711056, 0.00583715, 52.9829189);
            return fract(magic.z * fract(dot(vec3<f32>(uvPos, frame), magic)));
        }

        fn RayMarch(rayOrigin : vec3<f32>, rayDir : vec3<f32>, stepSize : f32, maxSteps : i32, projection : mat4x4<f32>, depthSample : texture_2d<f32>, maxDist : f32) -> vec4<f32> {
            var rayMask = 0.0;
            var sampleUV = vec3<f32>(0.0);
            var isactive = 1.0;

            let dimsI = textureDimensions(depthSample, 0);
            let dims = vec2<f32>(dimsI);

            for (var i : i32 = 0; i < maxSteps; i++){
                let samplePos = rayOrigin + rayDir * f32(i) * stepSize;
                var clipPos : vec4<f32> = projection * vec4<f32>(samplePos, 1.0);
                clipPos /= clipPos.w;
                sampleUV = clipPos.xyz * 0.5 + 0.5;

                let p = clamp(sampleUV.xy * dims, vec2<f32>(0.0), dims - vec2<f32>(1.0));
                let ip = vec2<i32>(p);
                let sampleDepth = textureLoad(depthSample, ip, 0).r;
                let inBounds = step(0.0, sampleUV.x) * step(0.0, sampleUV.y) * (1.0 - step(1.0, sampleUV.x)) * (1.0 - step(1.0, sampleUV.y));
                isactive *= inBounds;
                
                let depthTest = step(sampleDepth, sampleUV.z); 
                rayMask = max(rayMask, depthTest);
            }
            return vec4<f32>(sampleUV.xy * isactive, rayMask * isactive, 0.0);
        }

        @compute @workgroup_size(1, 1, 1)
        fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            var seed = 0.0;

            let pix = vec2<i32>(i32(global_id.x), i32(global_id.y));
    
            let depth = textureLoad(depthTexture, pix, 0).r;
            if (depth == 1.0){
                textureStore(ssgiTexture, pix, vec4<f32>(0.0, 0.0, 0.0, 0.0));
                return;
            }

            let normal = textureLoad(normalTexture, pix, 0).xyz * 2.0 - 1.0;
            let position = textureLoad(positionTexture, pix, 0).rgb;

            let posUV = vec2<f32>(f32(global_id.x), f32(global_id.y));
            let noise = aignNoise(posUV, uniforms.frameCount);

            let rand1 = rand(vec2<f32>(f32(pix.x), f32(pix.y)), seed);
            seed += 1;
            let rand2 = rand(vec2<f32>(f32(pix.x), f32(pix.y)), seed);

            let dir = GetCosHemisphereSample(normal, noise, noise);

            let viewPosition = uniforms.view * vec4<f32>(position, 1.0);

            let result = RayMarch(viewPosition.xyz, dir, 0.05, 15, uniforms.projection, depthTexture, 1.0);
            let sampleUV = vec2<i32>(result.xy * uniforms.screenSize);
            let rayMask = result.z;
            let sampleColor = textureLoad(colorTexture, sampleUV, 0).rgb;
            let originalColor = textureLoad(colorTexture, pix, 0).rgb;

            var finalColor : vec3<f32>;
            if (rayMask == 1.0) {
                finalColor = sampleColor * 0.7 + originalColor * 0.3;
            }
            else {
                finalColor = originalColor;
            }
            textureStore(ssgiTexture, pix, vec4<f32>(finalColor, 1.0));
        }
    `;

    const ssgiCS = new BABYLON.ComputeShader("ssgiCS", engine, { computeSource: ssgiComputeShader },
        {
            bindingsMapping:
            {
                "depthTexture": { group: 0, binding: 0 },
                "positionTexture": { group: 0, binding: 1 },
                "normalTexture": { group: 0, binding: 2 },
                "colorTexture": { group: 0, binding: 3 },
                "uniforms": { group: 0, binding: 4 },
                "ssgiTexture": { group: 0, binding: 5 }
            }
    });

    const blitCS = new BABYLON.ComputeShader("blitCS", engine, { computeSource: bilateralComputeShader },
        {
            bindingsMapping:
            {
                "depthTexture": { group: 0, binding: 0 },
                "ssgiTexture": { group: 0, binding: 1 },
                "colorTexture": {group : 0, binding : 2},
                "uniforms": { group: 0, binding: 3 },
                "resultTexture": { group: 0, binding: 4 }
            }
    });


    let ssgiTexture = BABYLON.RawTexture.CreateRGBAStorageTexture(null, engine.getRenderWidth(), engine.getRenderHeight(), scene, false, false);
    let reultTexture = BABYLON.RawTexture.CreateRGBAStorageTexture(null, engine.getRenderWidth(), engine.getRenderHeight(), scene, false, false);
    const ssgiubo = new BABYLON.UniformBuffer(engine);
    const blitubo = new BABYLON.UniformBuffer(engine);


    ssgiubo.addUniform("screenSize", 2);
    ssgiubo.addUniform("view", 16);
    ssgiubo.addUniform("projection", 16);
    ssgiubo.addUniform("frameCount", 1);

    ssgiCS.setTexture("depthTexture", gbuffer.getGBuffer().textures[3], false);
    ssgiCS.setTexture("positionTexture", gbuffer.getGBuffer().textures[2], false);
    ssgiCS.setTexture("normalTexture", gbuffer.getGBuffer().textures[1], false);
    ssgiCS.setTexture("colorTexture", colorRTT, false);
    ssgiCS.setStorageTexture("ssgiTexture", ssgiTexture);

    ssgiubo.updateFloat2("screenSize", engine.getRenderWidth(), engine.getRenderHeight());
    ssgiubo.updateMatrix("view", camera.getViewMatrix());
    ssgiubo.updateMatrix("projection", camera.getProjectionMatrix());
    ssgiubo.updateFloat("frameCount", engine.getDeltaTime() / 1000.0);
    ssgiubo.update();
    ssgiCS.setUniformBuffer("uniforms", ssgiubo);


    blitubo.addUniform("screenSize", 2);
    blitubo.addUniform("blur", 1);
    blitubo.addUniform("strength", 1);
    blitubo.addUniform("quality", 1); 

    blitCS.setTexture("depthTexture", gbuffer.getGBuffer().textures[3], false);
    blitCS.setTexture("ssgiTexture", ssgiTexture, false);
    blitCS.setTexture("colorTexture", colorRTT, false);
    blitCS.setStorageTexture("resultTexture", reultTexture);

    blitubo.updateFloat2("screenSize", engine.getRenderWidth(), engine.getRenderHeight());
    blitubo.updateFloat("blur", 12.0);
    blitubo.updateFloat("strength", 0.7);
    blitubo.updateFloat("quality", 6.0);
    blitubo.update();
    blitCS.setUniformBuffer("uniforms", blitubo);

    scene.onBeforeRenderObservable.add(() => {
        ssgiubo.updateFloat2("screenSize", engine.getRenderWidth(), engine.getRenderHeight());
        ssgiubo.updateMatrix("view", camera.getViewMatrix());
        ssgiubo.updateMatrix("projection", camera.getProjectionMatrix());
        ssgiubo.updateFloat("frameCount", engine.getDeltaTime() / 1000.0);
        ssgiubo.update();

        blitubo.updateFloat2("screenSize", engine.getRenderWidth(), engine.getRenderHeight());
        blitubo.updateFloat("blur", 12.0);
        blitubo.updateFloat("strength", 0.7);
        blitubo.updateFloat("quality", 6.0);
        blitubo.update();
        blitCS.setUniformBuffer("uniforms", blitubo);

        ssgiCS.dispatch(engine.getRenderWidth(), engine.getRenderHeight(), 1);
        blitCS.dispatch(engine.getRenderWidth(), engine.getRenderHeight(), 1);
    });

    engine.onResizeObservable.add(() => {
        ssgiTexture.dispose();
        ssgiTexture = BABYLON.RawTexture.CreateRGBAStorageTexture(null, engine.getRenderWidth(), engine.getRenderHeight(), scene, false, false);

        reultTexture.dispose();
        reultTexture = BABYLON.RawTexture.CreateRGBAStorageTexture(null, engine.getRenderWidth(), engine.getRenderHeight(), scene, false, false);

        scene.customRenderTargets.splice(scene.customRenderTargets.indexOf(colorRTT), 1);
        colorRTT.dispose();
        colorRTT = new BABYLON.RenderTargetTexture("colorRTT", { width: engine.getRenderWidth(), height: engine.getRenderHeight() }, scene);
        colorRTT.renderList = [sphere, emitter2, emitter1];
        colorRTT.refreshRate = 1;
        scene.customRenderTargets.push(colorRTT);

        ssgiCS.setTexture("depthTexture", gbuffer.getGBuffer().textures[3], false);
        ssgiCS.setTexture("positionTexture", gbuffer.getGBuffer().textures[2], false);
        ssgiCS.setTexture("normalTexture", gbuffer.getGBuffer().textures[1], false);
        ssgiCS.setTexture("colorTexture", colorRTT, false);
        ssgiCS.setStorageTexture("ssgiTexture", ssgiTexture);

        ssgiubo.updateFloat2("screenSize", engine.getRenderWidth(), engine.getRenderHeight());
        ssgiubo.updateMatrix("view", camera.getViewMatrix());
        ssgiubo.updateMatrix("projection", camera.getProjectionMatrix());
        ssgiubo.updateFloat("frameCount", engine.getDeltaTime() / 1000.0);
        ssgiubo.update();
        ssgiCS.setUniformBuffer("uniforms", ssgiubo);

        blitCS.setTexture("depthTexture", gbuffer.getGBuffer().textures[3], false);

        blitCS.setTexture("ssgiTexture", ssgiTexture, false);
        blitCS.setTexture("colorTexture", colorRTT, false);
        blitCS.setStorageTexture("resultTexture", reultTexture);
    
        blitubo.updateFloat2("screenSize", engine.getRenderWidth(), engine.getRenderHeight());
        blitubo.updateFloat("blur", 12.0);
        blitubo.updateFloat("strength", 0.7);
        blitubo.updateFloat("quality", 6.0);
        blitubo.update();
        blitCS.setUniformBuffer("uniforms", blitubo);
    });




    BABYLON.ShaderStore.ShadersStoreWGSL["blitSSGIVertexShader"] = `
        attribute position : vec3<f32>;
        varying vUV : vec2<f32>;
        @vertex
        fn main(input : VertexInputs) -> FragmentInputs {
        vertexOutputs.position = vec4<f32>(vertexInputs.position, 1.0);
        vertexOutputs.vUV = vertexInputs.position.xy * 0.5 + 0.5;
        }
    `;


    BABYLON.ShaderStore.ShadersStoreWGSL["blitSSGIFragmentShader"] = `
        varying vUV : vec2<f32>;
        var ssgiTex : texture_2d<f32>;
        var ssgiTexSampler : sampler;

        @fragment
        fn main(input : FragmentInputs) -> FragmentOutputs {
        let col = textureSample(ssgiTex, ssgiTexSampler, fragmentInputs.vUV).rgb;
        fragmentOutputs.color = vec4<f32>(col, 1.0);
        }
    `;

    const showSSGI = new BABYLON.PostProcess("showSSGI", "blitSSGI", null, ["ssgiTex"], 1.0, camera, undefined, engine, true,
        undefined, undefined, undefined, undefined, undefined, undefined, BABYLON.ShaderLanguage.WGSL);

    showSSGI.onApply = (effect) => {
        effect.setTexture("ssgiTex", reultTexture);
    };

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