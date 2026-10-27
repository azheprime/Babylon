import * as BABYLON from "@babylonjs/core";

// 使用全局BABYLON对象，不需要import语句
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element 
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

// Add your code here matching the playground format
const createScene = () => {
    const scene = new BABYLON.Scene(engine);

    // const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0));
    // // camera.attachControl(canvas, true);
    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -10), scene);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);


    let box = BABYLON.MeshBuilder.CreateBox("box", {});
    box.position = new BABYLON.Vector3(0, -1, 0);
        
    let sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {});
    sphere.position = new BABYLON.Vector3(0, 0.25, 0);

    let ellipsoid = BABYLON.MeshBuilder.CreateSphere("ellipsoid", {diameterY : 2});
    ellipsoid.position = new BABYLON.Vector3(0, 2, 0);

    
    const material1 = new BABYLON.StandardMaterial("material1", scene);
    material1.diffuseColor = BABYLON.Color3.Gray();
    const material2 = new BABYLON.StandardMaterial("material2", scene);        
    material2.diffuseColor = BABYLON.Color3.Red();

    box.material = material1;
    ellipsoid.material = material1;
    sphere.material = material1;

    let box_flag = 1;
    let sphere_flag = 1;
    let ellipsoid_flag = 1;

    scene.onPointerObservable.add((PointerInfo) =>{
        switch(PointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                let pickresult = scene.pick(scene.pointerX, scene.pointerY);
                if (pickresult?.hit && pickresult.pickedMesh === box) {
                    box_flag = 1 - box_flag;
                    box.material = box_flag ? material1 : material2;   
                }
                else if (pickresult?.hit && pickresult.pickedMesh === sphere) {
                    sphere_flag = 1 - sphere_flag;
                    sphere.material = sphere_flag ? material1 : material2;   
                }
                else if (pickresult?.hit && pickresult.pickedMesh === ellipsoid) {
                    ellipsoid_flag = 1 - ellipsoid_flag;
                    ellipsoid.material = ellipsoid_flag ? material1 : material2;   
                }
        }
    });

    scene.onKeyboardObservable.add((KeyboardInfo) => {
        if (KeyboardInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            if (KeyboardInfo.event.key === "Escape") {
                box.material = material1;
                sphere.material = material1;
                ellipsoid.material = material1;
                box_flag = 1;
                sphere_flag = 1;
                ellipsoid_flag = 1;
            }
        }
    });

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