//@ts-check
import * as eskv from "../eskv/lib/eskv.js";
import { QDraw } from "./app.js";
import { QShape, QGeometric, QCircle, QRectangle, QText } from "./shapes.js";

/**
 * Adds a shape to the drawing
 * @param {typeof QShape} shapeType 
 * @param {boolean} editMode 
 * @returns {QShape}
 */
export function addShape(shapeType, editMode=true) {
    let geo = new shapeType();
    let app = QDraw.get();
    geo.id = geo.id+app.drawing.shapeNum;
    app.drawing.shapeNum++;
    app.controlSurface.mode = editMode ? 'Edit' : 'Move';
    app.drawing.addChild(geo);
    app.controlSurface.selection = [geo];
    return geo;
}

/**Every state-affecting action in QuikDraw can be represented
 * by a QCommand. 
 */
export class QCommand {
    /**@type {QCommand[]} */
    static undoStack = [];
    /**@type {QCommand[]} */
    static redoStack = [];
    target = '';
    operation = '';
    data = {};
}

function drawingSave(e, o, v) {
    let drawing = QDraw.get().drawing;
    let drawingKey = 'QDraw/'+drawing.id;
    if(drawing.children.length>0) localStorage.setItem(drawingKey, JSON.stringify(drawing.serialize()));
}

function drawingPicker(e, o, v) {
    let loader = new eskv.ModalView({
        orientation: 'vertical',
        hints: {x:0.3,y:0.3,w:0.4,h:0.4},
    });
    let scroll = new eskv.ScrollView({scrollW:false, hints:{x:0,y:0,w:1}});
    let box = new eskv.BoxLayout({scrollW:false, hints:{x:0,y:0,w:1,h:null}, paddingX:'1.0'});
    loader.children = [scroll];
    scroll.children = [box];

    /**@type {null|string}*/
    let selectedId = null;
    for(let k = 0; k<localStorage.length; k++) {
        let id = localStorage.key(k);
        if(!id || !id.startsWith('QDraw/')) continue;
        id = id.slice(6);
        box.addChild(            
            new eskv.ToggleButton({
            id: id,
            text: id,
            group: 'drawings',
            on_press: (e,o,v)=>{selectedId=o.text},
        }))
    }
    loader.addChild(new eskv.BoxLayout({
            orientation: 'horizontal', hints:{h:'0.04ah'},
            children: [
                new eskv.Button({ text: 'Load',
                    on_press: (e, o, v) => {
                        if (!selectedId) return;
                        let id = selectedId;
                        let key = 'QDraw/'+id;
                        const data = localStorage.getItem(key);
                        if(!data) return;
                        let drawing = QDraw.get().drawing;
                        drawing.id = id;
                        drawing.deserialize(JSON.parse(data));    
                        QDraw.get().controlSurface.selection = [];
                        QDraw.get().fitDrawingToView();
                        loader.close();
                    }        
                }),
                new eskv.Button({ text: 'Delete',
                    on_press: (e, o, v) => {
                        if (!selectedId) return;
                        let id = selectedId;
                        let key = 'QDraw/'+id;
                        localStorage.removeItem(key);
                        const widget = box.findById(id);
                        if(widget) box.removeChild(widget);
                    }        
                }),
            ]
        })
    );
    loader.popup();
}

/**
 * @param {QShape} shape 
 * @param {number} scale */
export function exportShapeToPNG(shape, scale) {
    const offscreen = new OffscreenCanvas(shape.w*scale, shape.h*scale);

    const ctx = offscreen.getContext("2d");
    if(!ctx) return;
    ctx.scale(scale, scale);
    ctx.translate(-shape.x, -shape.y);
    shape._draw(QDraw.get(), ctx, 0);

    const dataURL = offscreen.convertToBlob().then(blob => {
        const url = URL.createObjectURL(blob);
    
        // To prompt the user to download the image
        const a = document.createElement('a');
        a.href = url;
        a.download = shape.id+'.png';
        a.click();
    
        URL.revokeObjectURL(url);
        document.removeChild(a);
    });    
}

export class QCommandBar extends eskv.BoxLayout {
    constructor(props = {}) {
        super({orientation:'vertical'});
        this.updateProperties(props);
        this.children = [
            new eskv.Label({text: 'Insert', align:'left', fontSize:'0.015ah', hints:{h:'0.02ah'}}),
            new eskv.BoxLayout({orientation: 'horizontal', hints: {h:'0.04ah'},
                children: [
                    new eskv.Button({
                        text:'Poly',
                        on_press: (event, object, data) => addShape(QGeometric),
                    }),
                    new eskv.Button({
                        text:'Rect',
                        on_press: (event, object, data) => addShape(QRectangle),
                    }),
                    new eskv.Button({
                        text:'Circle',
                        on_press: (event, object, data) => addShape(QCircle),
                    }),
                    new eskv.Button({
                        text:'Text',
                        on_press: (event, object, data) => addShape(QText),
                    }),
                    new eskv.Button({
                        text:'Image', 
                        disable: true,
                        on_press: (e,o,v)=> {},
                    }),
                ]
            }),
            // new eskv.Widget(), //space
            new eskv.Label({text:'Select', align:'left', fontSize:'0.015ah', hints:{h:'0.02ah'}}),
            new eskv.BoxLayout({orientation: 'horizontal', hints: {h:'0.04ah'},
                children: [
                    new eskv.Button({text:'All', 
                        on_press: (e,o,v)=> {
                            QDraw.get().controlSurface.selection = QDraw.get().drawing.children.map(c=>/**@type {QShape}*/(c));
                        },
                    }),
                    new eskv.Button({text:'R. Band', 
                        on_press: (e,o,v)=> {
                            QDraw.get().controlSurface.mode = 'Band';
                        },
                    }),
                    new eskv.Button({text:'None', 
                        on_press: (e,o,v)=> {
                            QDraw.get().controlSurface.selection = [];
                        },
                    }),
                    new eskv.Button({text:'Dup.', 
                        on_press: (e,o,v)=> {
                            let drawing = QDraw.get().drawing;
                            let sel = QDraw.get().controlSurface.selection;
                            if(sel.length===0) return;
                            const dup = []; 
                            for(let s of sel) {
                                const ser = s.serialize();
                                const sh = QShape.create(ser.class);
                                sh.id = sh.id+drawing.shapeNum;
                                drawing.shapeNum++;
                                sh.deserialize(ser, false);
                                dup.push(sh);
                            }
                            drawing.children = [...drawing._children, ...dup];
                            QDraw.get().controlSurface.selection = dup;
                        },
                    }),
                    new eskv.ToggleButton({text:'Multi', group: 'selectModeToggle', press: true, disable:true,
                        on_press: (e,o,v)=> {},
                    }),
                ]
            }),
            // new eskv.Widget(), //spacer
            new eskv.Label({text:'Drawing', align:'left', fontSize:'0.015ah', hints:{h:'0.02ah'}}),
            new eskv.BoxLayout({orientation: 'horizontal', hints: {h:'0.04ah'},
                children: [
                    new eskv.Button({text:'Config', 
                        on_press: (e,o,v)=> {
                            QDraw.get().shapeConfig.shape = QDraw.get().drawing;
                        },
                    }),
                    new eskv.Button({text:'Export', 
                        on_press: (e, o, v)=> {
                            const drawing = QDraw.get().drawing
                            exportShapeToPNG(drawing, drawing.pixelsPerTile);
                            return;
                        }
                    }),
                    new eskv.Button({text:'Load', 
                        on_press: drawingPicker 
                    }),
                    new eskv.Button({text:'Save', 
                        on_press: drawingSave,
                    }),
                    new eskv.Button({text:'Fit', 
                        on_press: (e,o,v)=> {
                            QDraw.get().fitDrawingToView();
                        },
                    }),
                ]
            }),

        ];
    }
}