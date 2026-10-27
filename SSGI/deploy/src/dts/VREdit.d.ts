declare module VREdit {
    export class VeryEngine {
        public static canvas: HTMLCanvasElement;
        public static engine: BABYLON.Engine;
        public static scene: BABYLON.Scene;
        public static viewCamera: ViewportCamera;
        public static projectId: string;
        public static EditMode: boolean;
        public static pickAsset(id: string, ctrlKey?: boolean): void;
        public static maxLights: number;
        public static commonJson: DMap;
        public static pickEntity(id: string, ctrlKey?: boolean): void;
        public static pickEntities(ids: string[], multiple?: boolean): void;
        public static pickAssets(ids: string[], multiple?: boolean): void;
        public static addEntityData(
            json: { resource_id: string; type: string; [pro: string]: any },
            parent?: string | IEDEntity|IEDGUI,
            autoPick?: boolean
        ): Promise<IEDEntity>;
        public static addAssetData(
            json: {
                id: string;
                type: string;
                name: string;
                [pro: string]: any;
            },
            folderId?: string
        ): IEDAsset;
        public static pickedEntities: IEDEntity[];
        public static pickedAssets: IEDAsset[];
        public static get pickedEntity(): IEDEntity;
        public static get pickedAsset(): IEDAsset;
        public static get pickMode(): "not-allow" | "normal" | "force-multiple";
        public static set pickMode(
            val: "not-allow" | "normal" | "force-multiple"
        );
        public static resetPanel(type?: string[]): void;
        public static systemTags: { [name: string]: string[] };
        public static addTag(id: string, name: string): void;
        public static removeTag(id: string, name: string[]): void;
        public static useTag(
            name: string,
            id: string,
            prop: string,
            func: (isAdd: boolean, id: string) => void
        ): void;
        public static getInnerAsset(id: string, path: string): IEDAsset;
        public static getAsset<T extends IEDAsset>(id: string): Extend<T>;
        public static getEntity<T extends IEDEntity>(id: string): Extend<T>;
        public static gloablEvent: VREdit.VREvent<"loadComplete">;
        public static entityRootId: string;
    }
    export abstract class Iplugin {
        id: string;
        button?: IButton | IButton[] | IDropDown | IDropDown[];
        assetContextmenu?: IContextmenu | IContextmenu[];
        entityContextmenu?: IContextmenu | IContextmenu[];
        dependence?: string[];
        init?(
            currentEntity?: Extend<IEDEntity>,
            pickEntityIds?: Extend<IEDEntity>[]
        ): void;
        onEntityPick?(
            currentEntity?: Extend<IEDEntity>,
            pickEntityIds?: Extend<IEDEntity>[]
        ): void;
        onBeforeViewUpdate?(
            currentEntity?: Extend<IEDEntity>,
            pickEntityIds?: Extend<IEDEntity>[]
        ): void;
        onAfterViewUpdate?(
            currentEntity?: Extend<IEDEntity>,
            pickEntityIds?: Extend<IEDEntity>[]
        ): void;
        onBeforePoseMatrixUpdate?(currentEntity?: BABYLON.TransformNode): void;
        onAfterPoseMatrixUpdate?(currentEntity?: BABYLON.TransformNode): void;
        abstract uninstall(): void;
        protected isActive(index?: number): boolean;
        protected getInnerAsset(path: string): IEDAsset;
        public createTable(name?: string, id?: string): IEDTable;
        public createWindowFromTable?(table: IEDTable): void;
    }
    class VREvent<T extends string> {
        public addEventListener(
            type: T,
            listener: (...params: any[]) => void
        ): void;
        public triggerEvent(type: T, ...params: any[]): void;
        public deleteEvent(type: T): void;
        public getEventGroup(group: T): void;
        public deleteEventGroup(group: T): void;
        public triggerEventGroup(
            type: T,
            exclude: string[],
            ...params: any[]
        ): void;
        public clearEvent(): void;
    }
    export interface IButton {
        img: string;
        tips?: string;
        enable?: (entity?: IEDEntity, pickEntityIds?: IEDEntity[]) => void;
        disable?: (entity?: IEDEntity, pickEntityIds?: IEDEntity[]) => void;
        active?: boolean;
        mutex?: MutexMode.self | MutexMode.global;
        mode?: ClickMode;
        isActive?: boolean;
        allow?: (tag: boolean) => void;
        click?: () => void;
        children?: SubButton[];
    }
    export interface SubButton {
        img?: string;
        tips: string;
        enable: (entity?: IEDEntity, pickEntityIds?: IEDEntity[]) => void;
        disable?: (entity?: IEDEntity, pickEntityIds?: IEDEntity[]) => void;
        active?: boolean;
        mutex?: MutexMode;
        mode?: ClickMode.once | ClickMode.normal;
        isActive?: boolean;
        click?: () => void;
    }
    export interface IDropDown {
        img: string;
        tips: string;
        onchange: (
            val: number,
            entity?: IEDEntity,
            pickEntityIds?: IEDEntity[]
        ) => void;
        default?: number;
        children: { img?: string; tips: string }[];
    }
    export interface IContextmenu {
        text: string;
        onclick(ied?: IED | IED[]);
        include?: string[];
        exclude?: string[];
        includeMulti?: string[];
        excludeMulti?: string[];
        path?: string[];
    }
    export enum ClickMode {
        once = 0,
        normal = 1,
        always = 2,
    }
    export enum MutexMode {
        self = 0,
        global = 1,
        dropdown = 2,
    }

    class ShareBox {
        public assetMap: DMap;
        public sceneMap: DMap;
        id2Asset: { [key: string]: Extend<IEDAsset> };
        id2Entity: { [key: string]: Extend<IEDEntity> };
        filterAssetType: (type: string) => Promise<IEDAsset>;
        filterEntityType: (type: string | string[]) => Promise<IEDEntity>;
        [propName: string]: any;
    }
    export abstract class IED {
        public get id(): string;
        public get type(): string;
        public name: string;
        public get subtype(): string;
        public veryVar: { attr: string; valName: string }[];
        protected _data: DMap;
        public clearData(undo?: boolean): void;
        public addIEDLoadEvent(id: string, func: (ied: IED) => void): void;
        public removeIEDLoadEvent(id: string, func?: (ied: IED) => void): void;
        public onload(): void;
        public watch(
            attr: string,
            func: (value: any, old?: any, extra?: any) => void,
            group?: string
        ): void;
        public unwatch(group: string): void;
        public set(key: string, value: any, local?: boolean): void;
        public get(key: string): any;
        protected dispose?(): void;
        public destroy(undo?: boolean): void;
        public copyData(): any;
    }

    export enum DataType {
        Vector2 = 0,
        Vector3 = 1,
        Vector4 = 2,
        Number = 3,
        String = 4,
        Name = 5,
        Textarea = 6,
        Bool = 7,
        Button = 8,
        Slide = 9,
        DropDown = 10,
        TextureBox = 11,
        MaterialBox = 12,
        Color4 = 13,
        Color3 = 14,
        Video = 15,
        Tag = 16,
    }

    export type AllDataType =
        | DataType.Vector2
        | DataType.Vector3
        | DataType.Vector4
        | DataType.Number
        | DataType.String
        | DataType.Name
        | DataType.Textarea
        | DataType.Bool
        | DataType.Button
        | DataType.Slide
        | DataType.DropDown
        | DataType.TextureBox
        | DataType.MaterialBox
        | DataType.Color4
        | DataType.Color3
        | DataType.Video
        | DataType.Tag;

    export type Number2DataType = {
        0: number[];
        1: number[];
        2: number[];
        3: number;
        4: string;
        5: string;
        6: string;
        7: boolean;
        8: never;
        9: number;
        10: any;
        11: string;
        12: string;
        13: number[];
        14: number[];
        15: string;
        16: string[];
    };
    export abstract class IEDAsset extends IED {
        constructor(data: DMap);
        protected abstract init(): void;
        public get id(): string;
        public onceOnlyLoad(): Promise<void>;
        public get children(): string[];
        public get parent(): string;
        public get path(): string[];
        public get data(): DMap;
        public get dataId(): string;
        public get fileHash(): string;
        public get fileSuffix(): string;
        public abstract readonly assetObj: any;
        //会覆盖
        protected abstract Load(param?: any): Promise<any>;
        protected upload(file: File, folderId?: string): Promise<any>;
        public createUploadData(file: any, folderId?: string): Promise<void>;
        public export(vrData: any, file: IED[]): void;
        public abstract get suffix(): string[];
        protected convertSceneData?(): Promise<any[]>;
        public loadToScene(): Promise<IEDEntity[]>;
    }

    export class IEDFolder extends IEDAsset {
        public get ID(): string;
        public assetObj: string;
        protected init(): void;
        protected Load(param?: any): Promise<any>;
        public get suffix(): string[];
    }

    export const ATTRIB: (name?: string) => {
        (target: any, propertyKey: string): void;
    };

    export class IEDTable extends IEDAsset {
        public get ID(): string;
        public assetObj: string;
        protected init(): void;
        protected Load(param?: any): Promise<any>;
        public get suffix(): string[];
        public get table(): string[][];
        public updateTable(): void;
    }

    export class IEDTexture extends IEDAsset {
        public get ID(): string;
        public assetObj: string;
        protected init(): void;
        protected Load(param?: any): Promise<any>;
        public get suffix(): string[];
        public get BaseTexture(): BABYLON.BaseTexture;
        public bindTexture(
            ied: IED,
            target: object,
            property: string,
            mode?: "BABYLON" | "html" | "string"
        ): void;
    }
    export class IEDMaterial extends IEDAsset {
        public get ID(): string;
        public assetObj: BABYLON.Material;
        protected init(): void;
        protected Load(param?: any): Promise<any>;
        public get suffix(): string[];
    }
    export function addAssetClass(target): void;
    export function addAssetExtend(target): void;
    export abstract class IEDEntity extends IED {
        public get id(): string;
        public get childIds(): string[];
        public get children(): Omit<Array<IEDEntity>, "push" | "splice"> & {
            push: (...val: (string | IEDEntity)[]) => void;
            splice: (
                index: number,
                deleteCount: number,
                ...val: (string | IEDEntity)[]
            ) => void;
        };
        public get parent(): IEDEntity;
        public set parent(val: IEDEntity | string);
        public enabled: boolean;
        public get tags(): string[] | null;
        constructor(data: DMap);
        public get isTransformNode(): boolean;
        public abstract readonly sceneObj: any;
        //会覆盖
        protected abstract Load(): Promise<void>;
        public static rootId: string;
        protected abstract setChild(
            child: IEDEntity,
            config: { origin: string }
        ): void;
        public abstract filterParentType(parent: IEDEntity): void;
        public export(vrData: any, file: IED[], parent?: string): void;
        public import?(map: { name: string; id: string }, json: object): void;
        public recordSceneObj(sceneObj: any, extra?: any, autopick?: boolean);
        public clone(withChild: boolean, params?: any): Promise<IEDEntity>;
        public get originAsset(): string;
    }
    export function addEntityClass(target): void;
    export function addEntityExtend(target): void;

    export abstract class IEDTransform extends IEDEntity {
        public sceneObj: BABYLON.TransformNode;
        protected setChild(child: IEDEntity, config: { origin: string }): void;
        public filterParentType(parent: IEDEntity): boolean;
    }
    export class IEDMesh extends IEDEntity {
        public get ID(): string;
        public sceneObj: BABYLON.AbstractMesh;
        protected Load(): Promise<void>;
        protected setChild(child: IEDEntity, config: { origin: string }): void;
        public filterParentType(parent: IEDEntity): void;
        public positions: number[];
        public normals: number[];
        public indices: number[];
        public uvs: number[];
        public uvs2: number[];
        public uvs3: number[];
        public uvs4: number[];
        public uvs5: number[];
        public uvs6: number[];
        public scale: number[] | BABYLON.Vector3;
        public checkCollisions: boolean;
        public isPickable: boolean;
        public visibility: number;
        public material: string;
        public receiveShadows: boolean;
    }

    export class IED3DGUI extends IEDEntity {
        public get ID(): string;
        public sceneObj: BABYLON.GUI.Control;
        protected Load(): Promise<void>;
        protected setChild(child: IEDEntity, config: { origin: string }): void;
        public filterParentType(parent: IEDEntity): void;
        public dragHander(stop?: boolean): void;
    }
    export type GUI = IEDGUI | IED3DGUI;
    export class IEDGUI extends IEDEntity {
        static lastCanvas:  IEDGUI;
        public get ID(): string;
        public sceneObj: HTMLElement;
        protected Load(): Promise<void>;
        protected setChild(child: IEDEntity, config: { origin: string }): void;
        public filterParentType(parent: IEDEntity): void;
        public dragHander(stop?: boolean): void;
    
    }
    export class IEDCamera {
        public sceneObj: VeryCamera;
        public cameraGizmo: BABYLON.CameraGizmo;
    }
    export interface ID {
        client: number;
        clock: number;
    }
    export class Item {
        public parent: AbstractType;
        private parentID: ID;
        public left: Item;
        public right: Item;
        public origin: ID;
        public rightOrigin: ID;
        public parentSub: string;
        public id: ID;
        public length: number;
        public content: AbstractContent;
        public info: number;
        public group: string;
    }
    export abstract class AbstractContent {
        abstract getLength(): number;

        abstract getContent(): any[];

        abstract isCountable(): boolean;

        abstract splice(offset: number): AbstractContent;

        abstract mergeWith(right: any): boolean;

        abstract integrate(item: Item): void;

        abstract delete(): void;
        abstract copy(): AbstractContent;
        abstract value(is_array?: boolean): any;
        abstract get refID(): number;
        abstract reset(value): void;
    }
    export class AbstractType {
        public _item: Item;
        public _map: Map<string, Item>;
        public _start: Item;
        public _length;
        public jsonParse(): any;
    }
    export class DMap extends AbstractType {
        constructor(any: any);
        public get(key: string): any;
        public set(
            key: string,
            value: any,
            isChild?: boolean,
            config?: any
        ): void;
        public delete(key: string): void;
        public watch(
            key: string,
            act: (value?: any, old?: any, extra?: any) => void,
            group?: string
        ): void;
        public watchObject(
            type: "update" | "delete",
            act: (key: string, value?: any) => void
        ): void;
    }
    export class DArray extends AbstractType {
        public get value(): any[];
        public push(val: any): void;
    }

    export class Tools {
        public static uuid(): string;

        public static assetID(): string;
        public static createdTime(): string;
    }
    export class VeryCamera extends BABYLON.TransformNode {
        public get mode(): number;
        public set mode(val: number);

        public get fov(): number;
        public set fov(val: number);

        public get inertia(): number;
        public set inertia(val: number);
        public get orthoSize(): number;
        public set orthoSize(val: number);

        public get clearColor(): BABYLON.Color4 | null;
        public set clearColor(val: BABYLON.Color4);

        public get minZ(): number;
        public set minZ(val: number);

        public get maxZ(): number;
        public set maxZ(val: number);

        public get checkCollisions(): boolean;
        public set checkCollisions(val: boolean);

        public get applyGravity(): boolean;
        public set applyGravity(val: boolean);
        public get ellipsoid(): BABYLON.Vector3;
        public set ellipsoid(val: BABYLON.Vector3);
        public get speed(): number;
        public set speed(val: number);
        public get angularSensibility(): number;
        public set angularSensibility(val: number);

        public camera: BABYLON.TargetCamera;
        public renderCamera(render: boolean): void;
        public resize(): void;
        public enable(enabled: boolean, scene: BABYLON.Scene): void;
        public dispose(
            doNotRecurse?: boolean,
            disposeMaterialAndTextures?: boolean
        ): void;
    }
    export class ViewportCamera {
        public x: number;
        public y: number;
        public cameraDistance: number;
        public veryCamera: VeryCamera;
        public get Camera(): BABYLON.TargetCamera;
        public customView(
            a: BABYLON.TransformNode,
            b: number,
            c?: BABYLON.Vector3
        ): void;
    }
    export function installPlugin(veryPlugin: Function): void;
    export function addShare(target: any, key: string): void;
    export const shareBox: ShareBox;

    interface AlertData {
        type: "warn" | "success" | "error";
        text: string;
        closeable?: boolean;
    }
    export class Message {
        static showAlert(a: AlertData): void;
        static removeAlert(): void;
    }
    
    interface result {
        onchange?:
            | ((val: any, param2?: any, isDelete?: Boolean) => void)
            | undefined;
        value?: any;
        element?: HTMLElement | undefined;
        parse?:Function,
        toJson?:Function
    }

    export abstract class Window {
        constructor(
            title: string,
            config?: {
                drag?: boolean;
                position?:
                    | { left: number; top: number }
                    | MouseEvent
                    | "bottom-right"
                    | "bottom-left"
                    | "top-left"
                    | "top-right";
                closeMode?: "destroy" | "none" | "hide" | "confirm" | IButton;
                size?: number;
                width?: number;
                height?: string;
                maxHeight?: string;
                contentHeight?: string;
                mask?: boolean;
            }
        );
        protected GUI?(): void;
        public content: HTMLElement;
        public popUp: HTMLElement;
        protected dealPos(
            pos?:
                | { left: number; top: number }
                | MouseEvent
                | BABYLON.IPointerEvent
        ): void;
        protected width: number;
        protected titleDes: string;
        protected pluginTitle(title: string, parent: HTMLElement): void;
        protected dealPre(label: string, parent?: HTMLElement): HTMLDivElement;
        protected justPre(label: string, parent?: HTMLElement): HTMLDivElement;
        protected Message(
            content: string,
            width: number | "auto",
            height: number | "auto"
        ): HTMLDivElement;
        protected createGridDiv(
            columns: number,
            rows: number,
            columnGap: number,
            rowGap: number
        ): HTMLDivElement;
        protected createFlexDiv(config: any): any;
        protected Button(
            name: string,
            config?: any,
            parent?: HTMLElement,
            extra?: { label: string }
        ): HTMLDivElement;
        protected NumberField(
            label: string,
            value: number | string,
            parent?: HTMLElement
        ): result;
        protected string(
            label: string,
            value: string,
            parent?: HTMLElement,
            extra?: {
                placeholder: string;
            }
        ): result;
        protected Textarea(
            label: string,
            value: string,
            parent?: HTMLElement,
            extra?: {
                placeholder: string;
            }
        ): result;
        protected vector3(
            label: string,
            value: number[],
            parent?: HTMLElement,
            extra?: {
                vectorName: string[];
            }
        ): result;
        protected vector4(
            label: string,
            value: number[],
            parent?: HTMLElement,
            extra?: {
                vectorName: string[];
            }
        ): result;
        protected vector2(
            label: string,
            value: number[],
            parent?: HTMLElement,
            extra?: {
                vectorName: string[];
            }
        ): result;
        protected Toggle(
            label: string,
            value: boolean,
            parent?: HTMLElement,
            extra?: {
                openText?: string;
                closeText?: string;
            }
        ): result;
        protected Tag(
            label: string,
            value: string[],
            parent?: HTMLElement
        ): result;
        protected line(
            name?: string,
            value?: any,
            parent?: HTMLElement,
            extra?: {
                width?: number;
            }
        ): HTMLDivElement;
        protected Color(
            label: string,
            value: number[],
            parent?: HTMLElement
        ): result;
        protected DropDown(
            label: string,
            value: number,
            parent: HTMLElement,
            choice: string[]
        ): result;
        protected Slide(
            label: string,
            value: number,
            parent?: HTMLElement,
            extra?: {
                min?: number | (() => number);
                max?: number | (() => number);
                slideUnit?: number;
            }
        ): result;
        protected newChoice(
            label: string,
            value: {
                mediaId: string;
                mediaName: string;
                isChecked?: boolean;
            },
            parent: HTMLElement,
            extra: {
                mediaType: MediaType;
                isEntity?: boolean;
                isEditableName?: boolean;
                isCheckedType?: boolean;
                limited?: number;
                asset?: IEDAsset | IEDEntity;
            },
            needDelete?: Function
        ): result;
        protected newFoldChoice(
            label: string,
            value: {
                mediaId: string;
                mediaName: string;
                isChecked?: boolean;
                show?: boolean;
                icon?: string;
            },
            parent: HTMLElement,
            extra: {
                mediaType?: MediaType;
                isEntity?: boolean;
                isEditableName?: boolean;
                isCheckedType?: boolean;
                limited?: number;
                asset?: IEDAsset | IEDEntity;
            },
            needDelete?: Function
        ): result;
        protected expand(
            name: string,
            value: any,
            parent?: HTMLElement,
            extra?: {},
            needDelete?: boolean
        ): HTMLDivElement;
        protected pureDiv(
            name: string,
            value: any,
            parent?: HTMLElement,
            extra?: {},
            needDelete?: boolean
        ): HTMLDivElement;
        protected json2Content(json: any, parent?: HTMLElement): result;
        public createResult(value: any, setFunc: (path: any, val?: any) => void, element?: HTMLElement): result
        public show(): void;
        public hide(): void;
        public destroy(): void;
        protected closeActList: (() => void)[];
        protected confirmActList: (() => void)[];
        public addEventListener(
            type: "close" | "confirm",
            func: () => void
        ): void;
    }

    export class MessageBox extends Window {
        constructor(title: string, content: string);
        public createPromise(): Promise<void>;
    }

    export class SmallMessage extends Window {
        constructor(message: string);
        public createPromise(): Promise<void>;
        public updatePos(
            position:
                | { left: number; top: number }
                | MouseEvent
                | BABYLON.IPointerEvent
        ): void;
    }
}

declare module "*.html" {
    const _: string;
    export default _;
}

declare module "*.png" {
    const _: string;
    export default _;
}

declare module "*.babylon" {
    const _: string;
    export default _;
}

declare type IEDAttrib<T extends VREdit.AllDataType> = {
    onchange?: T extends VREdit.DataType.Tag
        ? (index: number, val: string, config: { deleted: boolean }) => void
        : (val: VREdit.Number2DataType[T], isFirst?: boolean) => void;
    default?: VREdit.Number2DataType[T];
    type: T;
    extra?: any;
    filter?: () => boolean;
    title?: string;
    readonly?: boolean;
    name: string;
    des?: string;
};

declare type Extend<T extends VREdit.IED> = T extends VREdit.IEDAsset
    ? T & T["assetObj"]
    : T extends VREdit.IEDEntity
    ? T & T["sceneObj"]
    : T;
type SingleMediaType =
    | "texture"
    | "video"
    | "model"
    | "audio"
    | "mesh"
    | "krpano"
    | "table";
type MediaType = SingleMediaType | SingleMediaType[];
