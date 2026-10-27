
// @VREdit.installPlugin
// class gizmosPlugin extends VREdit.Iplugin{
//     private utilLayer:BABYLON.UtilityLayerRenderer;
//     private posGizmo:BABYLON.PositionGizmo;
//     private rotGizmo:BABYLON.RotationGizmo;
//     private scaGizmo:BABYLON.ScaleGizmo;
//     private gizmo:BABYLON.Gizmo;
//     private mesh:VREdit.IEDEntity;
//     public id: string="gizmos";
//     public dependence=["test"]
//     public button=[{
//         img:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAAOlJREFUSEvNluERwiAMRmEEMpEOoUPqEHaiMAI9POFigfql3MX2Z4G+JH0BvDN+vDHPHQLGGB850BDCXRuwGphhKaVbBnnvn1qoCihhJTMtFAb2YEegEHAPpoVCQCkGM7+cc5fPu4WIrhpxzgPMZewZiGQ4Wvs2u1eO8s+IqBlHgMycRvY2H5SCzABHffoF7Ni4DISo0vwYbzaHCkTU19go58ry/g+YIzItaSmBqTRb6IylcFtIqFnj79mINP7e+vPspTJKpEfRgxjO0PQA7rWM9uCt87XbleklSmZqdk3UVmQ7H5ZmFlTWr9J/3h12uQ9QAAAAAElFTkSuQmCC',
//         enable:(entity:VREdit.IEDEntity)=>{
//             if(entity instanceof VREdit.IEDMesh){
//                 this.gizmo.attachedNode=null;
//                 this.gizmo=this.posGizmo;
//                 this.gizmo.attachedNode=entity.sceneObj;
//             }
//         },
//         disable:()=>{
//             console.log("disable 1")
//         },
//         mutex:VREdit.MutexMode.self,//VREdit.MutexMode.global
//         mode:VREdit.ClickMode.always,
//         active:true,
//     },{
//         img:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAAj1JREFUSEvtlb+LE1EQx7+zSyAogbx5BCF4/4D4o7JQxDtBLRROGw+vMJaKaRXU5s5KQVtFS3+AopWCFip4J6KFnSeChZUSkOS9FwhKIGRHXkhgWXaTDcghclu+nZnPm+93Zpewzg+tMw8bwL+u+L8paavVOh6G4S6l1JV4y51OZ1uv17uZlEFEVrXWy2nyTOzQGLNMRPPdbndftVr9HS/SbDbnwjB8kyi8IiI1rfX3qYFD2BKARWZ+lCzgnJsVkZXY+S8AC8z8Isv8zA5jt//MzDvSCqQAISIfgyA4rJRqT9WhtfYpgHkAd5j57DggET0BsF9EtgzjLjHztdxA51xZRJxPIKKaUup+FhBAXSm1YK09B2A0QGvMvDM3MDEMR8d5Ei/qnHslIgf9mYjMaK1/JKGpHsaBRHRaKXUvzxeg3W6fj6Lo+hC4V2v9IRfQGLOHiN774CAILpTL5Rt5gM65mojc9bH9fv9ApVKJT/CgRGqHxpitRDTYIyJ6rZQ6lAdorT0C4PnUQJ9grf0EYLQOdWa+5Zx77AdDKbWaMUSnRGQgPxGptNXI3ENr7UUAV4fJPwG8FZETRDSXBbTW3gZwBsAzZj6We0p9oF+NKIpeEtHueOIE4BqA7Vn+ZXo4Agw98TJuHp1lAa21JwE89Kow8+UszzMlNcbMEJH3Yy6enHb7RqOxqVgsvgPwlZkXxw3YOKD/S8wmkwuFQr1UKn1JLPySiHxj5geTpnni72lSgWnfbwCnVWxi/P8v6R+JofMdtQBr9QAAAABJRU5ErkJggg==',
//         enable:(entity:VREdit.IEDEntity)=>{
//             console.log("点击了一下")
//         },
//         disable(){
//             console.log("disable 2")
//         },
//         mode:VREdit.ClickMode.once
//     },{
//         img:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAAj1JREFUSEvtlb+LE1EQx7+zSyAogbx5BCF4/4D4o7JQxDtBLRROGw+vMJaKaRXU5s5KQVtFS3+AopWCFip4J6KFnSeChZUSkOS9FwhKIGRHXkhgWXaTDcghclu+nZnPm+93Zpewzg+tMw8bwL+u+L8paavVOh6G4S6l1JV4y51OZ1uv17uZlEFEVrXWy2nyTOzQGLNMRPPdbndftVr9HS/SbDbnwjB8kyi8IiI1rfX3qYFD2BKARWZ+lCzgnJsVkZXY+S8AC8z8Isv8zA5jt//MzDvSCqQAISIfgyA4rJRqT9WhtfYpgHkAd5j57DggET0BsF9EtgzjLjHztdxA51xZRJxPIKKaUup+FhBAXSm1YK09B2A0QGvMvDM3MDEMR8d5Ei/qnHslIgf9mYjMaK1/JKGpHsaBRHRaKXUvzxeg3W6fj6Lo+hC4V2v9IRfQGLOHiN774CAILpTL5Rt5gM65mojc9bH9fv9ApVKJT/CgRGqHxpitRDTYIyJ6rZQ6lAdorT0C4PnUQJ9grf0EYLQOdWa+5Zx77AdDKbWaMUSnRGQgPxGptNXI3ENr7UUAV4fJPwG8FZETRDSXBbTW3gZwBsAzZj6We0p9oF+NKIpeEtHueOIE4BqA7Vn+ZXo4Agw98TJuHp1lAa21JwE89Kow8+UszzMlNcbMEJH3Yy6enHb7RqOxqVgsvgPwlZkXxw3YOKD/S8wmkwuFQr1UKn1JLPySiHxj5geTpnni72lSgWnfbwCnVWxi/P8v6R+JofMdtQBr9QAAAABJRU5ErkJggg==',
//         enable:(entity:VREdit.IEDEntity)=>{
//             entity.set("position1",[100,0,0])
//         },
//         disable(){
//             console.log("disable 3")
//         },
//         mutex:VREdit.MutexMode.self,
//         mode:VREdit.ClickMode.always
//     }]
//     private empty:BABYLON.Mesh;
//     public init(entity:VREdit.IEDEntity){
//         this.empty=new BABYLON.Mesh("",VREdit.VeryEngine.scene);
//         this.utilLayer = new BABYLON.UtilityLayerRenderer(VREdit.VeryEngine.scene);
//         this.posGizmo = new BABYLON.PositionGizmo(this.utilLayer);
//         this.rotGizmo=new BABYLON.RotationGizmo(this.utilLayer);
//         this.scaGizmo=new BABYLON.ScaleGizmo(this.utilLayer);
//         this.gizmo=this.posGizmo;
//         let func=()=>{
//             this.mesh.set("position",[this.mesh.sceneObj.position.x,this.mesh.sceneObj.position.y,this.mesh.sceneObj.position.z]);
//         }
//         this.posGizmo.xGizmo.dragBehavior.onDragObservable.add(func);
//         this.posGizmo.yGizmo.dragBehavior.onDragObservable.add(func);
//         this.posGizmo.zGizmo.dragBehavior.onDragObservable.add(func);

//         let func2=()=>{
//             this.mesh.set("rotation",[this.mesh.sceneObj.rotation.x,this.mesh.sceneObj.rotation.y,this.mesh.sceneObj.rotation.z]);
//         }
//         this.rotGizmo.xGizmo.dragBehavior.onDragObservable.add(func2);
//         this.rotGizmo.yGizmo.dragBehavior.onDragObservable.add(func2);
//         this.rotGizmo.zGizmo.dragBehavior.onDragObservable.add(func2);

//         let func3=()=>{
//             this.mesh.set("scale",[this.mesh.sceneObj.scaling.x,this.mesh.sceneObj.scaling.y,this.mesh.sceneObj.scaling.z]);
//         }
//         this.scaGizmo.xGizmo.dragBehavior.onDragObservable.add(func3);
//         this.scaGizmo.yGizmo.dragBehavior.onDragObservable.add(func3);
//         this.scaGizmo.zGizmo.dragBehavior.onDragObservable.add(func3);
//         if(entity){
//             if(entity instanceof VREdit.IEDMesh){
//                 this.mesh=entity;
//                 this.gizmo.attachedNode=entity.sceneObj
//             }
//         }
//     }

//     public onEntityPick(entity:VREdit.IEDEntity){
//         if(entity){
//             if(entity instanceof VREdit.IEDMesh){
//                 this.mesh=entity;
//                 this.gizmo.attachedNode=entity.sceneObj
//             }
//         }else{
//             this.gizmo.attachedNode=undefined;
//         }
//     }


//     public extends={
//         mesh:{
//             position1:(self:VREdit.IED,val:number[])=>{
//                 if(self.get("CSYS")=='自定义坐标1'){
//                     this.gizmo.attachedNode=this.empty;
//                     this.empty.position=new BABYLON.Vector3(val[0],val[1],val[2]);
//                 }
//             },position2:(self:VREdit.IED,val:number[])=>{
//                 if(self.get("CSYS")=='自定义坐标2'){
//                     this.gizmo.attachedNode=this.empty;
//                     this.empty.position=new BABYLON.Vector3(val[0],val[1],val[2]);
//                 }
//             },position3:(self:VREdit.IED,val:number[])=>{
//                 if(self.get("CSYS")=='自定义坐标3'){
//                     this.gizmo.attachedNode=this.empty;
//                     this.empty.position=new BABYLON.Vector3(val[0],val[1],val[2]);
//                 }
//             },CSYS:{
//                 default(){
//                     return '世界坐标';
//                 },onchange:(self:VREdit.IED,val:string)=>{
//                     if(val=='世界坐标')
//                         this.gizmo.attachedMesh=this.mesh.sceneObj;
//                     else{
//                         this.gizmo.attachedNode=this.empty;
//                         let tmp;
//                         if(val=='自定义坐标1'){
//                             tmp=self.get("position1")
//                         }else if(val=='自定义坐标2')
//                             tmp=self.get("position2");
//                         else if(val=='自定义坐标3')
//                             tmp=self.get("position3")
//                         if(!tmp){
//                             tmp=[0,0,0]
//                         }
//                         this.empty.position=new BABYLON.Vector3(tmp[0],tmp[1],tmp[2]);
//                     }
//                 },init:(self:VREdit.IED)=>{
                    
//                 },uninstall:()=>{

//                 }
//             }
//         }
//     }

//     public resetAttrPanel:VREdit.IAttrPanel={
//         type:"mesh",
//         attrPanel:[{
//             title:'物体属性',
//             attributes:[{
//                 name:'坐标系',
//                 attr:'CSYS',
//                 type:VREdit.DataType.DropDown,
//                 extra:['世界坐标','自定义坐标1','自定义坐标2','自定义坐标3']
//             },{
//                 name:'世界坐标',
//                 attr:'position',
//                 type:VREdit.DataType.Vector3,
//                 filter(){
//                     if(this.get('CSYS')==='世界坐标'){
//                         return true;
//                     }
//                     return false;
//                 }
//             },{
//                 name:'自定义坐标1',
//                 attr:'position1',
//                 type:VREdit.DataType.Vector3,
//                 filter(){
//                     if(this.get('CSYS')==='自定义坐标1'){
//                         return true;
//                     }
//                     return false;
//                 }
//             },{
//                 name:'自定义坐标2',
//                 attr:'position2',
//                 type:VREdit.DataType.Vector3,
//                 filter(){
//                     if(this.get('CSYS')==='自定义坐标2'){
//                         return true;
//                     }
//                     return false;
//                 }
//             },{
//                 name:'自定义坐标3',
//                 attr:'position3',
//                 type:VREdit.DataType.Vector3,
//                 filter(){
//                     if(this.get('CSYS')==='自定义坐标3'){
//                         return true;
//                     }
//                     return false;
//                 }
//             }]
//         }]
//     }

//     public uninstall(){
//         this.posGizmo.dispose();
//         this.rotGizmo.dispose();
//         this.scaGizmo.dispose();
//         this.utilLayer.dispose();
//         this.posGizmo=null;
//         this.rotGizmo=null;
//         this.scaGizmo=null;
//         this.gizmo=null;
//         this.utilLayer=null;
//         this.mesh=null;
//     }

// }
