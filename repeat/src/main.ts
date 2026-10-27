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

    const box1 = BABYLON.MeshBuilder.CreateBox("box1", { size: 1 }, scene);
    box1.position = new BABYLON.Vector3(3, 0, 0);

    const box2 = BABYLON.MeshBuilder.CreateBox("box2", { size: 1 }, scene);
    box2.position =  new BABYLON.Vector3(-3, 0, 0);

    const material1 = new BABYLON.StandardMaterial("material1", scene);
    material1.diffuseColor = BABYLON.Color3.Red(); 
    box1.material = material1;

    const material2 = new BABYLON.StandardMaterial("material2", scene);
    material2.diffuseColor = BABYLON.Color3.Green(); 
    box2.material = material2;

    let speed = 0.03;

    let translate1 : BABYLON.Vector3[] = [];
    let length = 60;
    let flag = false;
    let keysPressed : { [key: string]: boolean } = {};
    
    scene.onKeyboardObservable.add((KeyboardInfo) => {
        const key = KeyboardInfo.event.key;
        if (KeyboardInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            keysPressed[key] = true;
            if (key === "Escape") {
                translate1 = [];
                box1.position = new BABYLON.Vector3(3, 0, 0);
                box2.position = new BABYLON.Vector3(-3, 0, 0);
                flag = false;
            }
        }
        else if (KeyboardInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
            keysPressed[key] = false;
        }
    });

    scene.onBeforeRenderObservable.add(() => {
        if (keysPressed["ArrowRight"]) {
            box1.position.x += speed;
            translate1.push(new BABYLON.Vector3(speed, 0, 0));
        }
        else if (keysPressed["ArrowLeft"]) {
            box1.position.x -= speed;
            translate1.push(new BABYLON.Vector3(-speed, 0, 0));
        }
        else if (keysPressed["ArrowUp"]) {
            box1.position.y += speed;
            translate1.push(new BABYLON.Vector3(0, speed, 0));
        }
        else if (keysPressed["ArrowDown"]) {
            box1.position.y -= speed;
            translate1.push(new BABYLON.Vector3(0, -speed, 0)); 
        }
        else {
            if (translate1.length < length) {
                translate1.push(new BABYLON.Vector3(0, 0, 0));
            }
        }

        if (translate1.length > length) {
            flag = true;
        }
        if (flag){
            let translate2 = translate1.shift();
            if (translate2) {
                box2.position.addInPlace(translate2);
            }
        }
        if (translate1.length === 0) {
            flag = false;
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