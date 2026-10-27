var st = Object.defineProperty,
    it = Object.defineProperties;
var rt = Object.getOwnPropertyDescriptors;
var B = Object.getOwnPropertySymbols;
var at = Object.prototype.hasOwnProperty,
    ot = Object.prototype.propertyIsEnumerable;
var D = (g, d, b) => d in g ? st(g, d, { enumerable: !0, configurable: !0, writable: !0, value: b }) : g[d] = b,
    I = (g, d) => {
        for (var b in d || (d = {})) at.call(d, b) && D(g, b, d[b]);
        if (B)
            for (var b of B(d)) ot.call(d, b) && D(g, b, d[b]);
        return g
    },
    L = (g, d) => it(g, rt(d));
var s = (g, d, b) => (D(g, typeof d != "symbol" ? d + "" : d, b), b);
(function(g, d) { typeof exports == "object" && typeof module != "undefined" ? d(exports) : typeof define == "function" && define.amd ? define(["exports"], d) : (g = typeof globalThis != "undefined" ? globalThis : g || self, d(g.gifParser = {})) })(this, function(g) {
    "use strict";
    class d {
        constructor(t, e) {
            s(this, "index", 0);
            s(this, "dataView");
            this.arrayBuffer = t, this.littleEndian = e, this.dataView = new DataView(t), this.littleEndian = e || !1
        }
        check(t) { return this.index + t <= this.dataView.byteLength } seek(t) { this.index += t } peekByte(t = 0) { return this.check(1 + t), this.dataView.getUint8(this.index + t) } slice(t, e) { return new Uint8Array(this.dataView.buffer, t, e) } readUint8() { this.check(1); const t = this.dataView.getUint8(this.index); return this.seek(1), t } readUint8Array(t) { const e = []; for (let i = 0; i < t; i++) e.push(this.readUint8()); return e } readUint16() { this.check(2); const t = this.dataView.getUint16(this.index, this.littleEndian); return this.seek(2), t } readUint32() { this.check(4); const t = this.dataView.getUint32(this.index, this.littleEndian); return this.seek(4), t } readInt32() { this.check(4); const t = this.dataView.getInt32(this.index, this.littleEndian); return this.seek(4), t } readString(t) { let e = ""; for (let i = 0; i < t; i++) e += String.fromCharCode(this.readUint8()); return e } readEscapedString(t) {
            let e = "";
            for (let i = 0; i < t; i++) {
                const r = this.readUint8();
                r >= 32 && r <= 126 ? e += String.fromCharCode(r) : e += `\\x${r.toString(16).padStart(2,"0")}`
            }
            return e
        }
        readNullTerminatedString() {
            let t = "",
                e = this.readUint8();
            for (; e !== 0;) t += String.fromCharCode(e), e = this.readUint8();
            return t
        }
        hasMore(t) { return this.check(1), this.index <= this.dataView.byteLength - (t || 1) } setOffset(t) { this.index = t } getOffset() { return this.index } readInt8() { const t = this.dataView.getInt8(this.index); return this.seek(1), t }
    }

    function b(o) { return o.reduce((t, e) => t * 2 + e, 0) }

    function T(o) { let t = []; for (let e = 7; e >= 0; e--) t.push(!!(o & 1 << e)); return t.map(e => Number(e)) }

    function A(o) { return fetch(o).then(t => t.arrayBuffer()) }

    function m(o, t, e) { try { return o.slice(t, e) } catch { return new Uint8Array(0) } }

    function O(o) { const t = parseInt(`${o}`).toString(16); return (t.length === 2 ? t : `0${t}`).toUpperCase() } class v {
        constructor(t) {
            s(this, "type", "Header");
            s(this, "offset", 0);
            s(this, "length", 0);
            s(this, "bytes", new Uint8Array(0));
            s(this, "signature", "");
            s(this, "version", "");
            this.stream = t, this.stream = t
        }
        parse() { if (this.offset = this.stream.getOffset(), this.signature = this.stream.readString(3), this.version = this.stream.readString(3), this.length = this.stream.getOffset() - this.offset, /*console.log("this.signature", this.signature),*/ this.signature !== "GIF") throw new Error("Not a GIF file.") }
        export () { return { type: this.type, offset: this.offset, length: this.length, bytes: m(this.stream, this.offset, this.length), data: { signature: this.signature, version: this.version } } }
    }
    class R {
        constructor(t) {
            s(this, "type", "LogicalScreenDescriptor");
            s(this, "offset", 0);
            s(this, "length", 0);
            s(this, "bytes", new Uint8Array(0));
            s(this, "width", 0);
            s(this, "height", 0);
            s(this, "packedFields", []);
            s(this, "globalColorTableFlag", 0);
            s(this, "colorResolution", 0);
            s(this, "sortFlag", 0);
            s(this, "globalColorTableSize", 0);
            s(this, "backgroundColorIndex", 0);
            s(this, "pixelAspectRatio", 0);
            this.stream = t, this.stream = t
        }
        parse() { this.offset = this.stream.getOffset(), this.width = this.stream.readUint16(), this.height = this.stream.readUint16(), this.packedFields = T(this.stream.readUint8()), this.handlerPackedField(this.packedFields), this.backgroundColorIndex = this.stream.readUint8(), this.pixelAspectRatio = this.stream.readInt8(), this.length = this.stream.getOffset() - this.offset } hasGlobalColorTable() { return !!this.globalColorTableFlag } getGlobalColorTableSize() { return this.globalColorTableSize }
        export () { return { type: this.type, offset: this.offset, length: this.length, bytes: m(this.stream, this.offset, this.length), data: { width: this.width, height: this.height, packedFields: this.packedFields, globalColorTableFlag: this.globalColorTableFlag, colorResolution: this.colorResolution, sortFlag: this.sortFlag, globalColorTableSize: this.globalColorTableSize, backgroundColorIndex: this.backgroundColorIndex, pixelAspectRatio: this.pixelAspectRatio } } } handlerPackedField(t) {
            const e = [...t];
            this.globalColorTableFlag = e.shift() || 0, this.colorResolution = b(e.splice(0, 3)) + 1, this.sortFlag = e.shift() || 0, this.globalColorTableSize = b(e.splice(0, 3))
        }
    }
    class z {
        constructor(t, e) {
            s(this, "type", "");
            s(this, "offset", 0);
            s(this, "length", 0);
            s(this, "bytes", new Uint8Array(0));
            s(this, "colors", []);
            this.stream = t, this.stream = t, this.type = e
        }
        parse({ size: t = 0 }) {
            const e = 1 << t + 1;
            this.offset = this.stream.getOffset();
            for (let i = 0; i < e; i++) this.colors.push(this.stream.readUint8Array(3));
            this.length = this.stream.getOffset() - this.offset
        }
        export () { return { type: this.type, offset: this.offset, length: this.length, bytes: m(this.stream, this.offset, this.length), data: this.colors } }
    }
    class G extends z { constructor(t) { super(t, "GlobalColorTable") } } class k {
        constructor(t) {
            s(this, "stream");
            this.stream = t
        }
        parse(t) {}
        export () {} readSubBlocks() {
            const t = this.stream.getOffset();
            let e = this.stream.readInt8(),
                i = 1;
            const r = [];
            for (; e > 0;) r.push({ offset: t + i, length: e }), i += e + 1, this.stream.seek(e), e = this.stream.readUint8();
            return { blocks: r, blocksLength: i }
        }
    }
    class M extends k {
        constructor(t) {
            super(t);
            s(this, "type", "GraphicsControlExtension");
            s(this, "offset", 0);
            s(this, "length", 0);
            s(this, "bytes", new Uint8Array(0));
            s(this, "introducer", "");
            s(this, "label", "");
            s(this, "blockSize", 0);
            s(this, "packedFields", []);
            s(this, "reserved", []);
            s(this, "disposalMethod", 0);
            s(this, "userInputFlag", 0);
            s(this, "transparentColorFlag", 0);
            s(this, "delayTime", 0);
            s(this, "transparentColorIndex", 0);
            s(this, "blockTerminator", "");
            this.stream = t
        }
        parse({ introducer: t = 0, label: e = 0 }) {
            this.offset = this.stream.getOffset() - 2, this.introducer = String.fromCharCode(t), this.label = O(e), this.blockSize = this.stream.readUint8(), this.packedFields = T(this.stream.readUint8());
            const i = [...this.packedFields];
            this.reserved = i.splice(0, 3), this.disposalMethod = b(i.splice(0, 3)), this.userInputFlag = i.shift() || 0, this.transparentColorFlag = i.shift() || 0, this.delayTime = this.stream.readUint16(), this.transparentColorIndex = this.stream.readUint8(), this.blockTerminator = this.stream.readString(1), this.length = this.stream.getOffset() - this.offset
        }
        export () { return { type: this.type, offset: this.offset, length: this.length, bytes: m(this.stream, this.offset, this.length), data: { introducer: this.introducer, label: this.label, blockSize: this.blockSize, packedFields: this.packedFields, reserved: this.reserved, disposalMethod: this.disposalMethod, userInputFlag: this.userInputFlag, transparentColorFlag: this.transparentColorFlag, delayTime: this.delayTime, transparentColorIndex: this.transparentColorIndex, blockTerminator: this.blockTerminator } } }
    }
    class P extends k {
        constructor(t) {
            super(t);
            s(this, "type", "CommentExtension");
            s(this, "offset", 0);
            s(this, "length", 0);
            s(this, "bytes", new Uint8Array(0));
            s(this, "comment", {});
            this.stream = t
        }
        parse({ introducer: t, label: e }) { this.offset = this.stream.getOffset(), this.comment = this.readSubBlocks(), this.length = this.stream.getOffset() - this.offset }
        export () { return { type: this.type, offset: this.offset, length: this.length, bytes: m(this.stream, this.offset, this.length), data: this.comment } }
    }
    class V extends k {
        constructor(t) {
            super(t);
            s(this, "type", "PlainTextExtension");
            s(this, "blockSize", 0);
            s(this, "left", 0);
            s(this, "top", 0);
            s(this, "width", 0);
            s(this, "height", 0);
            s(this, "cellWidth", 0);
            s(this, "cellHeight", 0);
            s(this, "foregroundColorIndex", 0);
            s(this, "backgroundColorIndex", 0);
            s(this, "data", {});
            this.stream = t
        }
        parse({ introducer: t, label: e }) { this.offset = this.stream.getOffset(), this.blockSize = this.stream.readUint8(), this.left = this.stream.readUint16(), this.top = this.stream.readUint16(), this.width = this.stream.readUint16(), this.height = this.stream.readUint16(), this.cellWidth = this.stream.readUint8(), this.cellHeight = this.stream.readUint8(), this.foregroundColorIndex = this.stream.readUint8(), this.backgroundColorIndex = this.stream.readUint8(), this.data = this.readSubBlocks(), this.length = this.stream.getOffset() - this.offset }
        export () { return { type: this.type, offset: this.offset, length: this.length, bytes: m(this.stream, this.offset, this.length), data: this.data } }
    }
    class N extends k {
        constructor(t) {
            super(t);
            s(this, "type", "NetscapeExtension");
            s(this, "offset", 0);
            s(this, "length", 0);
            s(this, "bytes", new Uint8Array(0));
            s(this, "blockSize", 0);
            s(this, "subblock", 0);
            s(this, "loop", 0);
            s(this, "terminator", 0);
            s(this, "decode", "");
            this.stream = t
        }
        parse({ introducer: t, label: e }) { this.offset = this.stream.getOffset(), this.blockSize = this.stream.readUint8(), this.subblock = this.stream.readUint8(), this.loop = this.stream.readUint16(), this.terminator = this.stream.readInt8(), this.decode = `Loop: ${this.loop>0?this.loop:"forever"}`, this.length = this.stream.getOffset() - this.offset }
        export () { return { type: this.type, offset: this.offset, length: this.length, bytes: m(this.stream, this.offset, this.length), data: { blockSize: this.blockSize, subblock: this.subblock, loop: this.loop, terminator: this.terminator, decode: this.decode } } }
    }
    const x = class {
        constructor(t) {
            s(this, "buffer", null);
            t instanceof ArrayBuffer ? this.buffer = t : t instanceof Uint8Array ? this.buffer = t.buffer : (typeof t == "string" || t instanceof String) && this.fromDataUri(t)
        }
        static dataUriToBuffer(t) {
            let e = atob(t.split(",")[1]),
                i = e.length,
                r = new ArrayBuffer(i),
                a = new Uint8Array(r);
            for (let f = 0; f < i; f++) a[f] = e.charCodeAt(f);
            return r
        }
        static find(t) {
            let e;
            t instanceof ArrayBuffer ? e = t : t instanceof Uint8Array ? this.buffer = t.buffer : (typeof t == "string" || t instanceof String) && (e = x.dataUriToBuffer(t));
            let i = new DataView(e);
            if (!e) return;
            const r = "<x:xmpmeta",
                a = r.length,
                f = e.byteLength - a,
                c = "x:xmpmeta>",
                p = c.length,
                h = e.byteLength - p;
            let n = 2,
                l = n + a,
                u = !1;
            for (; n < f;)
                if (x.stringFromBuffer(i, n, a) == r) { u = !0; break } else n++;
            if (!u) return console.warn("XMP not found"), null;
            for (; l < h && x.stringFromBuffer(i, l, p) != c;) l++;
            return l += p, x.stringFromBuffer(i, n, l - n)
        }
        static stringFromBuffer(t, e, i) { let r = ""; for (let a = e; a < e + i; a++) r += String.fromCharCode(t.getUint8(a)); return r } static execFind(t, e) {
            let i = [],
                r = !0;
            for (; r;) {
                let a = e.exec(t);
                a ? i.push(a) : r = !1
            }
            return i
        }
        static toTree(t) {
            let e = [];
            if (!t || !t.length) return e;
            const i = t.shift(),
                r = t.findIndex(a => `</${i.tag}>` === a.raw);
            return t.splice(r, 1), e.push(L(I({}, i), { children: x.toTree(t) })), e
        }
        static parse(t) {
            if (!t) return null;
            const e = new RegExp("<[^>]+>", "gi"),
                r = x.execFind(t, e).map((a, f) => {
                    const c = new RegExp("<(.*?)\\s", "g"),
                        p = new RegExp('\\s(.*?)="(.*?)"', "g"),
                        h = a[0],
                        n = c.exec(h),
                        l = x.execFind(h, p);
                    let u = {};
                    return l.forEach(w => {
                        const [, S, E] = w;
                        u[S] = E
                    }), { raw: h, tag: n ? n[1] : null, attrs: u }
                });
            return x.toTree(r)
        }
        fromDataUri(t) { this.buffer = x.dataUriToBuffer(t) } find() { return x.find(this.buffer) || "" } parse() { let t = this.find(); return x.parse(t) }
    };
    let U = x;
    s(U, "buffer", null);
    class $ extends k {
        constructor(t) {
            super(t);
            s(this, "type", "XMPDataExtension");
            s(this, "offset", 0);
            s(this, "length", 0);
            s(this, "bytes", new Uint8Array(0));
            s(this, "blockSize", 0);
            s(this, "xmpData", []);
            this.stream = t
        }
        parse({ introducer: t, label: e }) {
            this.offset = this.stream.getOffset();
            const { blocks: i } = this.readSubBlocks();
            i.forEach(f => { this.blockSize += f.length });
            const r = this.stream.slice(this.offset, this.blockSize);
            let a = new U(r);
            this.xmpData = a.parse(), this.length = this.stream.getOffset() - this.offset
        }
        export () { return { type: this.type, offset: this.offset, length: this.length, bytes: m(this.stream, this.offset, this.length), data: { blockSize: this.blockSize, xmpData: this.xmpData } } }
    }
    class H extends k {
        constructor(t) {
            super(t);
            s(this, "type", "UnknownApplicationExtension");
            s(this, "offset", 0);
            s(this, "length", 0);
            s(this, "bytes", new Uint8Array(0));
            s(this, "appData", {});
            this.stream = t
        }
        parse({ introducer: t, label: e }) { console.log("introducer, label", t, e), this.offset = this.stream.getOffset(), this.appData = this.readSubBlocks(), this.length = this.stream.getOffset() - this.offset }
        export () { return { type: this.type, offset: this.offset, length: this.length, bytes: m(this.stream, this.offset, this.length), data: this.appData } }
    }
    class W extends k {
        constructor(t) {
            super(t);
            s(this, "type", "ApplicationExtension");
            s(this, "offset", 0);
            s(this, "length", 0);
            s(this, "bytes", new Uint8Array(0));
            s(this, "introducer", "");
            s(this, "label", "");
            s(this, "blockSize", 0);
            s(this, "identifier", "");
            s(this, "authenticationCode", "");
            s(this, "appData");
            s(this, "netscapeExtension");
            s(this, "xmpdataExtension");
            s(this, "unknownApplicationExtension");
            this.stream = t, this.netscapeExtension = new N(t), this.xmpdataExtension = new $(t), this.unknownApplicationExtension = new H(t), this.appData = {}
        }
        parse({ introducer: t = 0, label: e = 0 }) { this.introducer = String.fromCharCode(t), this.label = O(e), this.offset = this.stream.getOffset() - 2, this.blockSize = this.stream.readInt8(), this.identifier = this.stream.readString(8), this.authenticationCode = this.stream.readString(3), this.identifier === "NETSCAPE" ? (this.netscapeExtension.parse({ introducer: t, label: e }), this.appData = this.netscapeExtension.export()) : this.identifier === "XMP Data" ? (this.xmpdataExtension.parse({ introducer: t, label: e }), this.appData = this.xmpdataExtension.export()) : (this.unknownApplicationExtension.parse({ introducer: t, label: e }), this.appData = this.unknownApplicationExtension.export()), this.length = this.stream.getOffset() - this.offset }
        export () { return { type: this.type, offset: this.offset, length: this.length, bytes: m(this.stream, this.offset, this.length), data: { introducer: this.introducer, label: this.label, blockSize: this.blockSize, identifier: this.identifier, authenticationCode: this.authenticationCode, appData: this.appData } } }
    }
    class j extends k {
        constructor(t) {
            super(t);
            s(this, "type", "UnknownExtension");
            s(this, "data", {});
            this.stream = t
        }
        parse({ introducer: t, label: e }) { this.offset = this.stream.getOffset(), this.data = this.readSubBlocks(), this.length = this.stream.getOffset() - this.offset }
        export () { return { type: this.type, offset: this.offset, length: this.length, bytes: m(this.stream, this.offset, this.length), data: this.data } }
    }
    class X {
        constructor(t) {
            s(this, "extensionBlock", {});
            s(this, "graphicsControlExtension");
            s(this, "plainTextExtension");
            s(this, "commentExtension");
            s(this, "applicationExtension");
            s(this, "unknownExtension");
            this.stream = t, this.stream = t, this.graphicsControlExtension = new M(t), this.commentExtension = new P(t), this.plainTextExtension = new V(t), this.applicationExtension = new W(t), this.unknownExtension = new j(t)
        }
        parse({ introducer: t }) {
            const e = this.stream.readUint8();
            switch (e) {
                case 249:
                    this.graphicsControlExtension.parse({ introducer: t, label: e }), this.extensionBlock = this.graphicsControlExtension.export();
                    break;
                case 254:
                    this.commentExtension.parse({ introducer: t, label: e }), this.extensionBlock = this.commentExtension.export();
                    break;
                case 1:
                    this.plainTextExtension.parse({ introducer: t, label: e }), this.extensionBlock = this.plainTextExtension.export();
                    break;
                case 255:
                    this.applicationExtension.parse({ introducer: t, label: e }), this.extensionBlock = this.applicationExtension.export();
                    break;
                default:
                    this.unknownExtension.parse({ introducer: t, label: e }), this.extensionBlock = this.unknownExtension.export();
                    break
            }
        }
        export () { return this.extensionBlock }
    }
    class q extends z { constructor(t) { super(t, "LocalColorTable") } } class J {
        constructor(t) {
            s(this, "type", "ImageDescriptor");
            s(this, "offset", 0);
            s(this, "length", 0);
            s(this, "bytes", new Uint8Array(0));
            s(this, "introducer", "");
            s(this, "left", 0);
            s(this, "top", 0);
            s(this, "width", 0);
            s(this, "height", 0);
            s(this, "packedFields", []);
            s(this, "localColorTableFlag", 0);
            s(this, "interlaceFlag", 0);
            s(this, "sortFlag", 0);
            s(this, "reserved", []);
            s(this, "localColorTableSize", 0);
            this.stream = t, this.stream = t
        }
        hasLocalColorTable() { return !!this.localColorTableFlag } getLocalColorTableSize() { return this.localColorTableSize } parse({ introducer: t = 0 }) {
            this.introducer = String.fromCharCode(t), this.offset = this.stream.getOffset() - 1, this.left = this.stream.readUint16(), this.top = this.stream.readUint16(), this.width = this.stream.readUint16(), this.height = this.stream.readUint16(), this.packedFields = T(this.stream.readUint8());
            const e = [...this.packedFields];
            this.localColorTableFlag = e.shift() || 0, this.interlaceFlag = e.shift() || 0, this.sortFlag = e.shift() || 0, this.reserved = e.splice(0, 2), this.localColorTableSize = b(e.splice(0, 3)), this.length = this.stream.getOffset() - this.offset
        }
        export () { return { type: this.type, offset: this.offset, length: this.length, bytes: m(this.stream, this.offset, this.length), data: { introducer: this.introducer, left: this.left, top: this.top, width: this.width, height: this.height, packedFields: this.packedFields, localColorTableFlag: this.localColorTableFlag, interlaceFlag: this.interlaceFlag, sortFlag: this.sortFlag, reserved: this.reserved, localColorTableSize: this.localColorTableSize } } }
    }
    class K {
        constructor(t) {
            s(this, "bytes");
            s(this, "byteOffset");
            s(this, "bitOffset");
            s(this, "totalByteOffset");
            this.bytes = t || new Int8Array, this.byteOffset = 0, this.bitOffset = 0, this.totalByteOffset = 0
        }
        readBits(t) {
            let e = 0,
                i = 0;
            for (; i < t;) {
                if (this.byteOffset >= this.bytes.length) throw new Error(`Not enough bytes to read ${t} bits (read ${i} bits)`);
                const r = Math.min(8 - this.bitOffset, t - i),
                    a = 255 >> 8 - r << this.bitOffset;
                e += (this.bytes[this.byteOffset] & a) >> this.bitOffset << i, i += r, this.bitOffset += r, this.bitOffset === 8 && (this.byteOffset += 1, this.totalByteOffset += 1, this.bitOffset = 0)
            }
            return e
        }
        hasBits(t = 1) { if (t > 12) throw new Error(`Exceeds max bit size: ${t} (max: 12)`); if (this.byteOffset >= this.bytes.length) return !1; const e = 8 - this.bitOffset; if (t <= e) return !0; const i = this.bytes.length - this.byteOffset - 1; return !(i < 1 || t > e + 8 * i) } setBytes(t, e = 0, i = 0) { this.bytes = t, this.byteOffset = e, this.bitOffset = i } pushBytes(t) {
            if (this.hasBits()) {
                const e = this.bytes.length - this.byteOffset,
                    i = new Uint8Array(e + t.length);
                i.set(this.bytes.slice(this.byteOffset)), i.set(t, e), this.bytes = i, this.byteOffset = 0
            } else this.bytes = t, this.byteOffset = 0, this.bitOffset = 0
        }
        getState() { return { bitOffset: this.bitOffset, byteOffset: this.totalByteOffset } }
    }
    class Q {
        constructor(t) {
            s(this, "type", "ImageContent");
            s(this, "offset", 0);
            s(this, "length", 0);
            s(this, "bytes", new Uint8Array(0));
            s(this, "children", {});
            this.stream = t, this.stream = t
        }
        parse() {
            this.offset = this.stream.getOffset();
            const t = this.readImageContent();
            this.children = this.lzwDecode(t), this.length = this.stream.getOffset() - this.offset
        }
        lzwDecode(t) {
            const { blocks: e, lzwMinimumCodeSize: i } = t, r = [], a = [];
            let f = [],
                c = [];
            const p = new K,
                h = 2 << i - 1,
                n = h + 1;
            let l = n,
                u = i + 1,
                w = (2 << u - 1) - 1,
                S = !1;
            for (const { offset: E, length: tt } of e)
                for (p.pushBytes(this.stream.slice(E, tt)); p.hasBits(u);) {
                    const et = p.getState(),
                        C = p.readBits(u);
                    if (C === n) { f.push(C); break } else if (C === h) {
                        a.push({ stream: [], table: [], start: et }), f = a[a.length - 1].stream, c = a[a.length - 1].table;
                        for (let y = 0; y <= n; y++) c[y] = y < h ? [y] : [];
                        l = n, u = i + 1, w = (2 << u - 1) - 1, S = !1
                    } else if (!S) r.push(...c[C]), S = !0;
                    else {
                        let y = 0;
                        const F = f[f.length - 1];
                        C <= l ? (r.push(...c[C]), y = c[C][0]) : (y = c[F][0], r.push(...c[F], y)), l < 4095 && (l += 1, c[l] = [...c[F], y], l === w && l < 4095 && (u += 1, w = (2 << u - 1) - 1))
                    }
                    f.push(C)
                }
            return Object.assign({}, t, { indexStream: r, clearCode: h, eoiCode: n, codeUnits: a, blockCount: e.length, codeUnitCount: a.length })
        }
        export () { return { type: this.type, offset: this.offset, length: this.length, bytes: m(this.stream, this.offset, this.length), data: this.children } } readImageContent() {
            const t = this.stream.getOffset(),
                e = this.stream.readUint8();
            let { blocks: i } = this.readSubBlocks();
            const r = this.stream.getOffset() - t;
            return { offset: t, length: r, type: "image", lzwMinimumCodeSize: e, blocks: i }
        }
        readSubBlocks() {
            const t = this.stream.getOffset();
            let e = this.stream.readUint8(),
                i = 1;
            const r = [];
            for (; e > 0;) r.push({ offset: t + i, length: e }), i += e + 1, this.stream.seek(e), e = this.stream.readUint8();
            return i += 1, { blocks: r, blocksLength: i }
        }
    }
    class Y {
        constructor(t) {
            s(this, "localColorTable");
            s(this, "imageDescriptor");
            s(this, "imageContent");
            this.stream = t, this.stream = t, this.localColorTable = new q(t), this.imageDescriptor = new J(t), this.imageContent = new Q(t)
        }
        parse({ introducer: t }) {
            if (this.imageDescriptor.parse({ introducer: t }), this.imageDescriptor.hasLocalColorTable()) {
                const e = this.imageDescriptor.getLocalColorTableSize();
                this.localColorTable.parse({ size: e })
            }
            this.imageContent.parse()
        }
        createFrame(t, e, i, r) {
            const a = document.createElement("canvas");
            a.width = i, a.height = r;
            const c = a.getContext("2d").createImageData(i, r),
                p = c.data;
            for (let h = 0, n = 0; h < e.length; h += 1, n += 4) p[n + 0] = t[e[h]][0], p[n + 1] = t[e[h]][1], p[n + 2] = t[e[h]][2], p[n + 3] = e[h] !== 88 ? 255 : 0;
            return c
        }
        exportFrameData(t) { const { width: e, height: i, left: r, top: a, localColorTableFlag: f } = this.imageDescriptor.export().data, { indexStream: c } = this.imageContent.export().data; let p = this.imageDescriptor.hasLocalColorTable() ? this.localColorTable.export() : t || {}; return { type: "Frame", data: { width: e, height: i, left: r, top: a, localColorTableFlag: f, imageData: this.createFrame(p.data, c, e, i) } } }
        export () {
            const t = this.imageDescriptor.export(),
                e = this.imageContent.export();
            if (!this.imageDescriptor.hasLocalColorTable()) return [t, e];
            const i = this.localColorTable.export();
            return [t, i, e]
        }
    }
    class Z {
        constructor(t) {
            s(this, "type", "Block");
            s(this, "offset", 0);
            s(this, "length", 0);
            s(this, "blocks", []);
            s(this, "extension");
            s(this, "imageData");
            this.stream = t, this.stream = t, this.extension = new X(this.stream), this.imageData = new Y(this.stream)
        }
        parse(t) {
            for (this.offset = this.stream.getOffset(); this.stream.hasMore();) {
                const e = this.stream.readUint8();
                switch (String.fromCharCode(e)) {
                    case "!":
                        this.extension.parse({ introducer: e }), this.blocks.push(this.extension.export());
                        break;
                    case ",":
                        this.imageData.parse({ introducer: e }), this.blocks.push(...this.imageData.export());
                        break;
                    case ";":
                        //console.log("end block");
                        break;
                    default:
                        throw new Error("Unknown block: 0x" + e.toString(16))
                }
            }
            this.length = this.stream.getOffset() - this.offset
        }
        export () { return this.blocks }
    }
    class _ {
        constructor(t) {
            s(this, "parsed");
            s(this, "blockList");
            s(this, "dataList");
            s(this, "stream");
            s(this, "header");
            s(this, "logicalScreenDescriptor");
            s(this, "globalColorTable");
            s(this, "block");
            s(this, "isExport", !1);
            /*console.log("GifParser init"),*/ this.parsed = !1, this.blockList = [], this.dataList = [], this.stream = new d(t, !0), this.header = new v(this.stream), this.logicalScreenDescriptor = new R(this.stream), this.globalColorTable = new G(this.stream), this.block = new Z(this.stream), this.parse()
        }
        parse() {
            if (!this.parsed) {
                if (this.header.parse(), this.logicalScreenDescriptor.parse(), this.logicalScreenDescriptor.hasGlobalColorTable()) {
                    const t = this.logicalScreenDescriptor.getGlobalColorTableSize();
                    this.globalColorTable.parse({ size: t })
                }
                this.block.parse(this.logicalScreenDescriptor.hasGlobalColorTable() ? this.globalColorTable.export() : void 0), this.parsed = !0
            }
        }
        getSize() { const { data: t } = this.logicalScreenDescriptor.export(); return [t.width, t.height] }
        export () { this.isExport || (this.blockList.push(this.header.export()), this.blockList.push(this.logicalScreenDescriptor.export()), this.logicalScreenDescriptor.hasGlobalColorTable() && this.blockList.push(this.globalColorTable.export()), this.blockList.push(...this.block.export()), this.dataHandler(), this.isExport = !0) } exportWarn() { return console.warn.call(this, "parser.export()"), [] } getBlockList() { return this.blockList } getDataList() { return this.isExport ? this.dataList : this.exportWarn() } createImageData({ colorTable: t, indexStream: e, width: i, height: r, transparency: a }) {
            const f = document.createElement("canvas");
            f.width = i, f.height = r;
            const p = f.getContext("2d").createImageData(i, r),
                h = p.data;
            for (let n = 0, l = 0; n < e.length; n += 1, l += 4) e[n] !== a ? (h[l + 0] = t[e[n]][0], h[l + 1] = t[e[n]][1], h[l + 2] = t[e[n]][2], h[l + 3] = 255) : (h[l + 0] = 0, h[l + 1] = 0, h[l + 2] = 0, h[l + 3] = 0);
            return p
        }
        dataHandler() {
            let t = {};
            const e = this.blockList.find(i => i.type === "GlobalColorTable");
            let index =0;
            this.blockList.forEach(i => {
                if (i.type === "GraphicsControlExtension") t[i.type] = i.data, this.dataList.push(i);
                else if (i.type === "ImageDescriptor") t[i.type] = i.data, this.dataList.push(i);
                //DO_20211116:gif
                else if (i.type === "LocalColorTable") t[i.type] = i.data, this.dataList.push(i);
                else if (i.type === "ImageContent") {
                    //DO_20211116:gif
                	if(t.ImageDescriptor.localColorTableSize){
                		//console.log(index);
	                	//console.log(t.LocalColorTable);
	                	//console.log(t.ImageDescriptor.localColorTableSize);
	                	var tmpSize = t.ImageDescriptor.localColorTableSize ;
	                	tmpSize = 1 << (tmpSize + 1);
	                	//console.log(tmpSize);
	                	var tmpData = t.LocalColorTable.slice(index*tmpSize,index*tmpSize+tmpSize);
				        index++;
				        //console.log(tmpData);
                	}
                	

                    t[i.type] = i.data, this.dataList.push(i);
                    //DO_20211116:gif
                    const { delayTime: r, disposalMethod: a, transparentColorFlag: f, transparentColorIndex: c } = t.GraphicsControlExtension,{ localColorTableFlag: p, left: h, top: n, width: l, height: u } = t.ImageDescriptor, { indexStream: w } = t.ImageContent, S = f ? c : null,E = p ? (tmpData) : e == null ? void 0 : e.data;
                    //console.log(t.ImageDescriptor);
                    //console.log(p);
                    //console.log(tmpData);
                    //console.log(E);
                    t.Frame = { delayTime: r, disposalMethod: a, transparency: S, colorTable: E, indexStream: w, left: h, top: n, width: l, height: u },Object.assign(t.Frame, { imageData: this.createImageData(t.Frame) }), this.dataList.push({ type: "Frame", data: t.Frame })
                } else this.dataList.push(i)
            })
        }
        getFrames() { return this.isExport ? this.dataList.filter(t => t.type === "Frame").map(t => { const { delayTime: e, disposalMethod: d,transparency: i, left: r, top: a, width: f, height: c, imageData: p } = t.data; return { delayTime: e,disposalMethod: d, transparency: i, left: r, top: a, width: f, height: c, imageData: p } }) : this.exportWarn() } getBlockItem(t) { const e = this.blockList.find(i => i.type === t); return e && e.data }
    }
    g.Parser = _, g.loadGif = A, Object.defineProperty(g, "__esModule", { value: !0 }), g[Symbol.toStringTag] = "Module"
});