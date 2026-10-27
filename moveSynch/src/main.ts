import * as BABYLON from "@babylonjs/core";

// 使用全局BABYLON对象，不需要import语句
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element 
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

// Add your code here matching the playground format
const createScene = () => {
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -10), scene);
    // camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));

    // write your code here

    let box1 = BABYLON.MeshBuilder.CreateBox("box1", {});
    box1.position = new BABYLON.Vector3(5, 0, 0);

    let box2 = BABYLON.MeshBuilder.CreateBox("box2", {});
    box2.position = new BABYLON.Vector3(-5, 0, 0);

    const material1 = new BABYLON.StandardMaterial("material1", scene);
    material1.diffuseColor = BABYLON.Color3.Red(); 
    box1.material = material1;

    const material2 = new BABYLON.StandardMaterial("material2", scene);
    material2.diffuseColor = BABYLON.Color3.Green(); 
    box2.material = material2;

    let speed = 0.1;
    let flag = false;
    let distance = 5;

    scene.onKeyboardObservable.add((KeyboardInfo) => {
        if (KeyboardInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            if (BABYLON.Vector3.Distance(box1.position, box2.position) < distance) {
                flag = true;
            }
            switch (KeyboardInfo.event.key) {
                case "ArrowRight":
                    box1.position.x += speed;
                    if (flag){
                        box2.position.x += speed;
                    }
                    break;
                case "ArrowLeft":
                    box1.position.x -= speed;
                    if (flag){
                        box2.position.x -= speed;
                    }
                    break;
                case "ArrowUp":
                    box1.position.y += speed;
                    if (flag){
                        box2.position.y += speed;
                    }
                    break;
                case "ArrowDown":
                    box1.position.y -= speed;
                    if (flag){
                        box2.position.y -= speed;
                    }
                    break;
                case "Escape":
                    box1.position = new BABYLON.Vector3(5, 0, 0);
                    box2.position = new BABYLON.Vector3(-5, 0, 0);
                    flag = false;
                    break;
            }
        }
    })
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