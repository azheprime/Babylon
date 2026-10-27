declare module VREdit{
    interface ShareBox {
        log():void;
        ddd:{[key:string]:string};
    }
}

declare module BABYLON {
    interface Vector3 {
        asArraytoFixed():number[]
    }
    interface PointerInfoBase{
        stopPropagation():void;
        isStop:boolean;
    }
}