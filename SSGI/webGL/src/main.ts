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
    gbuffer.enableReflectivity = true;

    const colorRTT = new BABYLON.RenderTargetTexture("colorRTT", { width: engine.getRenderWidth(), height: engine.getRenderHeight() }, scene);
    colorRTT.renderList = [sphere, emitter2, emitter1]; 
    colorRTT.refreshRate = 1; 
    scene.customRenderTargets.push(colorRTT);


    // 添加过滤着色器
    BABYLON.Effect.ShadersStore["FilterFragmentShader"] = `
        precision highp float;
        varying vec2 vUV;

        uniform sampler2D textureSampler;        // get from ssgiPostProcess
        uniform sampler2D normalSampler;
        uniform sampler2D depthSampler;
        uniform sampler2D colorSampler;
        uniform vec2 screenSize;
        uniform float blur;
        uniform float strength;
        uniform float quality;

        highp float linearize_depth(highp float d, highp float zNear, highp float zFar)
        {
            highp float z_n = 2.0 * d - 1.0; // 深度 0..1 → NDC z [-1,1]
            return 2.0 * zNear * zFar / (zFar + zNear - z_n * (zFar - zNear));
        }
        
        void main(){
            const float pi = 3.14159;

            float size = blur;

            vec2 radius = vec2(size) / screenSize;

            vec3 texel = texture2D(textureSampler, vUV).rgb;

            float count = 0.0;

            float initialDepth = linearize_depth(texture2D(depthSampler, vUV).r, 0.1, 1000.0);

            float directions = 16.0;

            for (float d = 0.0; d < pi * 2.0; d += (pi * 2.0) / directions) {
                for (float i = 1.0 / quality; i <= 1.0; i += 1.0/quality) {
                    vec2 sampleUV = vUV + vec2(cos(d), sin(d)) * radius * i;

                    if (abs(linearize_depth(texture2D(depthSampler, sampleUV).x, 0.1, 1000.0) - initialDepth) < 6.0) {
                        texel += texture2D(textureSampler, sampleUV).rgb;
                        count += 1.0;
                    }
                }
            }

            texel /= count;

            if (abs(vUV.x - 0.0) <= 1.0 / screenSize.x) {
                gl_FragColor = vec4(1.0);
            }
            else if (vUV.x < 0.0) {
                gl_FragColor = vec4(texture2D(colorSampler, vUV).rgb, 1.0);
            }
            else {
                gl_FragColor = vec4(texture2D(colorSampler, vUV).rgb + strength * texel.rgb, 1.0);
            }
            // gl_FragColor = vec4(2.0 * texel.rgb, 1.0);
        }
    `;
    
    BABYLON.Effect.ShadersStore["FilterVertexShader"] = `
        precision highp float;
        attribute vec2 position;
        attribute vec2 uv;

        uniform mat4 world; 
        uniform mat4 view; 
        uniform mat4 projection; 

        varying vec2 vUV;
        void main() {
            // vUV = position * 0.5 + 0.5;
            vUV = uv;
            gl_Position =  projection * view * vec4(position, 0., 1.);
        }
    `;

    BABYLON.Effect.ShadersStore["ssgiFragmentShader"] = `
        precision highp float;
        varying vec2 vUV;

        uniform sampler2D positionSampler;
        uniform sampler2D normalSampler;
        uniform sampler2D depthSampler;
        uniform sampler2D colorSampler;

        uniform vec2 screenSize;
        uniform mat4 view; 
        uniform mat4 projection;
        uniform float frameCount;

        highp float random(vec2 co)
        {
            highp float a = 12.9898;
            highp float b = 78.233;
            highp float c = 43758.5453;
            highp float dt= dot(co.xy ,vec2(a,b));
            highp float sn= mod(dt,3.14);
            return fract(sin(sn) * c);
        }
        float seed = 0.0;
        float rand()
        {
            float result = random(vUV + seed / 10.0);
            seed += 1.0;
            return result;
        }

        vec3 GetCosHemisphereSample(vec3 normal, float rand1, float rand2) {
            float r = sqrt(rand1);
            float phi = 6.2831853 * rand2;
            vec3 dir = vec3(r * cos(phi), r * sin(phi), sqrt(1.0 - rand1));
            if (dot(dir, normal) > 0.0) {
                return dir;
            }
            else if (dot(dir, normal) < 0.0){
                return -dir;
            }
            else return normal;
        }

        float aignNoise(vec2 uvPos, float frame) {
            vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
            return fract(magic.z * fract(dot(vec3(uvPos, frame), magic)));
        }

        vec4 RayMarch(vec2 uv, vec3 rayOrigin, vec3 rayDir, int maxSteps, float stepSize, sampler2D depthSampler, float maxDist, mat4 projection) {
            float rayMask = 0.0;
            vec3 sampleUV = vec3(0.0);
           for (int i = 0; i < maxSteps; i++) {
                vec3 samplePos = rayOrigin + rayDir * float(i) * stepSize;
                vec4 clipPos = projection * vec4(samplePos, 1.0);
                clipPos /= clipPos.w;          
                sampleUV = clipPos.xyz * 0.5 + 0.5;
                if (sampleUV.x < 0.0 || sampleUV.x > 1.0 || sampleUV.y < 0.0 || sampleUV.y > 1.0)
                    break;
                float sampleDepth = texture2D(depthSampler, sampleUV.xy).r;
                
                if (sampleUV.z < sampleDepth) {        
                    rayMask = 1.0; // Hit the surface
                    
                }
                
                if (stepSize * float(i) > maxDist) {
                    break; // Stop if we exceed the maximum distance
                }
            }
            return vec4(sampleUV.xy, rayMask, 0.0);
        }

        void main() {
            float depth = texture2D(depthSampler, vUV).r;  
            if (depth == 1.0){
                discard;
            }         
            vec3 normal = texture2D(normalSampler, vUV).xyz * 2.0 - 1.0; 
            vec3 position = texture2D(positionSampler, vUV).rgb ;

            vec2 posUV = vUV * screenSize;
            float noise = aignNoise(posUV, frameCount);

            float rand1 = rand();
            float rand2 = rand();

            vec3 dir = GetCosHemisphereSample(normal, rand1, rand2);
            // vec3 dir = GetCosHemisphereSample(normal, noise, noise);

            vec4 viewPosition = view * vec4(position, 1.0);

            vec4 result = RayMarch(vUV, viewPosition.xyz, dir, 15, 0.05, depthSampler, 1.0, projection);
            vec2 sampleUV = result.xy;
            float rayMask = result.z;
            vec3 sampleColor = texture2D(colorSampler, sampleUV).rgb;
            vec3 originalColor = texture2D(colorSampler, vUV).rgb;
            
            vec3 finalColor;
            if (rayMask == 1.0) {
                finalColor = sampleColor ;
            }
            else {
                finalColor = originalColor; // No hit, return original color
            }
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;
    
    BABYLON.Effect.ShadersStore["ssgiVertexShader"] = `
        precision highp float;
        attribute vec2 position;
        attribute vec2 uv;

        uniform mat4 world; 
        uniform mat4 view; 
        uniform mat4 projection; 

        varying vec2 vUV;
        void main() {
            // vUV = position * 0.5 + 0.5;
            vUV = uv;
            gl_Position =  projection * view * vec4(position, 0., 1.);
        }
    `;

    // 创建SSGI后处理
    const ssgipostProcess = new BABYLON.PostProcess("SSGI", "ssgi",
        [],
        ["normalSampler", "depthSampler", "colorSampler", "screenSize", "projection", "positionSampler", "view"],
        1.0, camera);

    ssgipostProcess.onApply = (effect) => {
        effect.setFloat2("screenSize", engine.getRenderWidth(), engine.getRenderHeight());
        effect.setMatrix("projection", camera.getProjectionMatrix());
        effect.setTexture("normalSampler", gbuffer.getGBuffer().textures[1]);
        effect.setTexture("depthSampler", gbuffer.getGBuffer().textures[4]);
        effect.setTexture("positionSampler", gbuffer.getGBuffer().textures[2]);
        effect.setFloat("frameCount", engine.getDeltaTime() / 1000.0);
        effect.setTexture("colorSampler", colorRTT);
        effect.setMatrix("view", camera.getViewMatrix());
    };

    // 创建过滤后处理
    const Filter = new BABYLON.PostProcess("Filter", "Filter",
        ["blur", "strength", "quality"],
        ["textureSampler", "depthSampler", "normalSampler", "screenSize", "colorSampler"],
        1.0, camera);
    
    Filter.onApply = (effect) => {
        effect.setFloat2("screenSize", engine.getRenderWidth(), engine.getRenderHeight());
        effect.setTexture("depthSampler", gbuffer.getGBuffer().textures[4]);
        effect.setTexture("normalSampler", gbuffer.getGBuffer().textures[1]);
        effect.setTexture("colorSampler", colorRTT);
        effect.setFloat("blur", 12.0);
        effect.setFloat("strength", 0.7);
        effect.setFloat("quality", 6.0);
    };

    // 创建渲染管线
    const ssgiRTT = new BABYLON.RenderTargetTexture("ssgiRTT", {
        width: engine.getRenderWidth(),
        height: engine.getRenderHeight()
    }, scene);

    // 先应用SSGI后处理
    ssgiRTT.addPostProcess(ssgipostProcess);
    // 然后应用双边过滤
    ssgiRTT.addPostProcess(Filter);

    // 将渲染目标应用到相机
    camera.customRenderTargets.push(ssgiRTT);

    return scene;
};

const scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();

});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});