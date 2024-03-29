//@ts-check
import * as eskv from "../eskv/lib/eskv.js";
import { QGroup, QShape }from './shapes.js';
import { QDraw } from "./app.js";


export class QGradient {
    /**@type {[number, string][]} array of tuples containing color offset (range 0 - 1) and CSS string color*/
    stops = []
    setGradientFill(ctx, x0, y0, x1, y1) {
        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
        for(let s of this.stops) {
            gradient.addColorStop(...s);
        }
        // Set the fill style and draw a rectangle
        ctx.fillStyle = gradient;        
    }
    serialize() {
        let data = {};
        data['stops'] = [...this.stops];
        return data;
    }
    deserialize(data) {
        this.stops = [];
        for(let s of data['stops']) {
            if(s.length===2 && typeof s[0]==='number' && typeof s[1]==='string') this.stops.push([s[0],s[1]]);
        }
    }
}

export class QShapeStack extends eskv.BoxLayout {
    constructor(properties) {
        //TODO: There's a problem here that the QShapeStack selection will sometimes get out of sync 
        //with the QControlSurface selection if a selected item is removed
        super();
        this.stack = new eskv.BoxLayout({orientation: 'vertical', hints:{x:0,y:0,w:1,h:null}, paddingX:'1.0', order:'reverse'});
        this.controls = new eskv.BoxLayout({orientation: 'horizontal', hints: {h:'0.04ah'}, children: [
            new eskv.Button({ text: 'Top', sizeGroup:'Config',
                on_press: (e,o,v)=> {
                    let drawing = QDraw.get().drawing;
                    let sel = new Set([...QDraw.get().controlSurface.selection]);
                    for(let s of sel) {
                        const ind = drawing.children.findIndex(ds=>ds===s);
                        if(ind<drawing.children.length-1) {
                            drawing.removeChild(s, false);
                            drawing.addChild(s, drawing.children.length);
                        }
                    }
                    QDraw.get().controlSurface.selection = sel;
                }
            }),
            new eskv.Button({ text: 'Up', sizeGroup:'Config',
                on_press: (e,o,v)=> {
                    let drawing = QDraw.get().drawing;
                    let sel = [...QDraw.get().controlSurface.selection];
                    for(let s of sel) {
                        const ind = drawing.children.findIndex(ds=>ds===s);
                        if(ind<drawing.children.length-1) {
                            drawing.removeChild(s, false);
                            drawing.addChild(s, ind+1);    
                        }
                    }
                    QDraw.get().controlSurface.selection = new Set(sel);
                }
            }),
            new eskv.Button({ text: 'Down', sizeGroup:'Config',
                on_press: (e,o,v)=> {
                    let drawing = QDraw.get().drawing;
                    let sel = [...QDraw.get().controlSurface.selection];
                    for(let s of sel) {
                        const ind = drawing.children.findIndex(ds=>ds===s);
                        if(ind>0) {
                            drawing.removeChild(s, false);
                            drawing.addChild(s, ind-1);    
                        }
                    }
                    QDraw.get().controlSurface.selection = new Set(sel);
                }
            }),
            new eskv.Button({ text: 'Bot.', sizeGroup:'Config',
                on_press: (e,o,v)=> {
                    let drawing = QDraw.get().drawing;
                    let sel = [...QDraw.get().controlSurface.selection];
                    for(let s of sel) {
                        const ind = drawing.children.findIndex(ds=>ds===s);
                        if(ind>0) {
                            drawing.removeChild(s, false);
                            drawing.addChild(s, 0);    
                        }
                    }
                    QDraw.get().controlSurface.selection = new Set(sel);
                }
            }),
        ]});
        this.scroll = new eskv.ScrollView({orientation:'vertical', hints:{x:0,y:0,w:1}, scrollW: false,
            children:[this.stack],
        });
        this.children = [
            this.scroll,
            this.controls,
        ];
        if(properties) this.updateProperties(properties);
    }
    /**@type {import("../eskv/lib/modules/widgets.js").EventCallbackNullable} */
    csSelection(event, object, sel) {
        //@ts-ignore
        this.stack.children.forEach((c)=>c._press = sel.has(c.shape));
    }
    /**@type {import("../eskv/lib/modules/widgets.js").EventCallbackNullable} */
    onShapeAdded(event, object, data) {
        if(!(data instanceof QShape)) return false;
        for(let c of this.stack.children) if(c instanceof eskv.ToggleButton) c._press = false;
        let ch = new eskv.ToggleButton({
            text:data.id,
            hints:{h:'0.04ah'}, 
            shape:data,
            group:'stackShape',
            sizeGroup: 'Config',
            press: true,
            singleSelect: false,
            on_press: (event,object,data) => {
                let app = QDraw.get();
                let sc = app.shapeConfig;
                let sel = app.controlSurface.selection;
                let w = app.drawing.findById(object.shape.id);
                if(w instanceof QShape) {
                    if(sel.has(w) && !object.press) {
                        sel.delete(w);
                        app.controlSurface.selection = sel;
                    } else if (object.press){
                        sel.add(w);
                        app.controlSurface.selection = sel;
                    }
                    sc.shape = sel.size===1 ? [...sel][0] : null;
                }
            }
        })
        data.bind('id', (e,o,v)=> {ch.text=v});
        let index = QDraw.get().drawing.children.findIndex((sh)=>sh===data);
        if(index>=0) {
            this.stack.addChild(ch, index);
            let sc = /**@type {QDraw} */(QDraw.get()).shapeConfig;
            sc.shape = data;    
        }
        return false;
    }
    /**@type {import("../eskv/lib/modules/widgets.js").EventCallback} */
    onShapeRemoved(event, object, data) {
        if(!(data instanceof QShape)) return false;
        let sh = this.stack.children.find((w)=>{if('shape' in w) return w.shape===data})
        let sc = QDraw.get().shapeConfig;
        if(sc.shape===data) {
            sc.shape = null; 
        }
        const cs = QDraw.get().controlSurface;
        cs.selection.delete(data);
        cs.selection = cs.selection;
        if(sh) this.stack.removeChild(sh);
        return false;
    }
}

export class QDrawing extends QGroup {
    id = 'Drawing';
    shapeNum = 1;
    fillColor = 'black';
    pixelsPerTile = 64;
    /**@type {{[id:string]:Image}} */
    imageStore = {};
    /**@type {{[id:string]:QGradient}} */
    gradientStore = {};
    lineDash = [0.1];
    lineWidth = 0.1;
    outlineColor = 'blue';
    paletteId = '';
    constructor(properties) {
        super();
        if(properties) this.updateProperties(properties)
        let id = 'Drawing '+new Date().toLocaleString();
        while(localStorage.getItem(id)) {
            id += '~';
        }
        this.id = id;
    }
    on_pixelsPerTile(e,o,v) {
        const app = QDraw.get()
        if(app.prefDimH<0 && app.prefDimW<0) app.tileSize = this.pixelsPerTile;
    }
    updateExtents(recalcAll=false) {
        //By default the drawing does not respond to size changes of its children
        return;
    }
    reset(id) {
        this.id = id;
        this.children = [];
        this.imageStore = {};
        this.gradientStore = {};
    }
    /** @type {eskv.Widget['draw']} */
    draw(app, ctx) {
        ctx.beginPath();
        ctx.save();
        if(this.fillColor) ctx.fillStyle = this.fillColor;
        if(this.lineColor && app.ctx===ctx) ctx.strokeStyle = this.lineColor;
        if(this.lineWidth && app.ctx===ctx) ctx.lineWidth = this.lineWidth; //TODO: Size width and dash to window not zoom level
        if(this.lineDash && app.ctx===ctx) ctx.setLineDash(this.lineDash);
        ctx.rect(this.x, this.y, this.w, this.h);
        if(this.fillColor) ctx.fill();
        if(this.lineColor && app.ctx===ctx) ctx.stroke();
        ctx.restore();

    }
    serialize() {
        let data = super.serialize();
        data['width'] = this.w;
        data['height'] = this.h;
        data['pixelsPerTile'] = this.pixelsPerTile;
        data['shapeNum'] = this.shapeNum;
        data['paletteId'] = this.paletteId;
        const cs = QDraw.get().controlSurface;
        data['gridVisible'] = cs.gridVisible;
        data['gridLineWidth'] = cs.gridLineWidth;
        data['gridLineDash'] = cs.gridLineDash;
        data['gridLineColor'] = cs.gridLineColor;
        data['gridCellWidth'] = cs.gridCellWidth;
        data['gridCellHeight'] = cs.gridCellHeight;
        data['gridOffsetX'] = cs.gridOffsetX;
        data['gridOffsetY'] = cs.gridOffsetY;

        // //TODO: Also dump data for images, gradients, canvas properties and anything else
        // data['children'] = ch;
        data['gradients'] = {}
        for(let gs in this.gradientStore) {
            data['gradients'][gs] = this.gradientStore[gs].serialize();
        }
        return data;
    }
    deserialize(data) {
        super.deserialize(data);
        const drawView = QDraw.get().drawingScrollView.children[0];
        drawView.w = data['width']??40;
        drawView.h = data['height']??30;
        this.pixelsPerTile = data['pixelsPerTile']??64;
        this.shapeNum = data['shapeNum']??1;
        this.paletteId = data['paletteId']??'';

        const cs = QDraw.get().controlSurface;
        cs.gridVisible = data['gridVisible']??false;
        cs.gridLineWidth = data['gridLineWidth']??0.05;
        cs.gridLineDash = data['gridLineDash']??[0.1,0.2];
        cs.gridLineColor = data['gridLineColor']??'rgba(82,82,82,0.4)';
        cs.gridCellWidth = data['gridCellWidth']??1;
        cs.gridCellHeight = data['gridCellHeight']??1;
        cs.gridOffsetX = data['gridOffsetX']??0;
        cs.gridOffsetY = data['gridOffsetY']??0;

        if('gradients' in data) {
            for(let gs in data['gradients']) {
                let gr = new QGradient();
                gr.deserialize(data['gradients'][gs]);
                this.gradientStore[gs] = gr;
            }    
        }
        QDraw.get().palette.customPalette.onDrawing(this.paletteId);
    }
}

