//@ts-check
import * as eskv from "../eskv/lib/eskv.js";
import { QDraw } from "./app.js";
import { QControlSurface } from "./controlsurface.js";
import { QDrawing } from "./drawing.js";
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
    app.controlSurface.selection = new Set([geo]);
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
    if(QDraw.get().controlSurface.gridVisible) {
        QDraw.get().controlSurface.drawGrid(QDraw.get(), ctx);
    }

    const dataURL = offscreen.convertToBlob().then(blob => {
        const url = URL.createObjectURL(blob);
    
        // To prompt the user to download the image
        const a = document.createElement('a');
        a.href = url;
        a.download = shape.id+'.png';
        a.click();
    
        URL.revokeObjectURL(url);
    });    
}

function drawingExport(e,o,v) {
    let exporter = new eskv.ModalView({
        orientation: 'vertical',
        hints: {x:0.3,y:0.3,w:0.4,h:0.4},
    });
    let box = new eskv.BoxLayout({hints:{x:0,y:0,w:1,h:null}, paddingX:'1.0'});
    exporter.children = [box];

    box.addChild(new eskv.Label({
        text: 'Select an export format'
    }));
    box.addChild(new eskv.Button({
        text: 'to PNG',
        on_press: (e,o,v)=>{
            const drawing = QDraw.get().drawing
            exportShapeToPNG(drawing, drawing.pixelsPerTile);
            exporter.close();
        },
    }));
    box.addChild(new eskv.Button({
        text: 'to JSON',
        on_press: (e,o,v)=>{
            const drawing = QDraw.get().drawing;
            const json = JSON.stringify(drawing.serialize(), null, 2);
            const blob = new Blob([json], {type: 'text/plain'});
            const url = URL.createObjectURL(blob);

            // To prompt the user to download the image
            const a = document.createElement('a');
            a.href = url;
            a.download = drawing.id+'-qdraw.json';
            a.click();
        
            URL.revokeObjectURL(url);
            exporter.close();
        },
    }));
    exporter.popup();
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
    let box = new eskv.BoxLayout({hints:{x:0,y:0,w:1,h:null}, paddingX:'1.0'});
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
                        QDraw.get().controlSurface.selection = new Set();
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

class CommandButton extends eskv.Button {
    sizeGroup = 'CommandButton';
}

export class QCommandBar extends eskv.BoxLayout {
    constructor(props = {}) {
        super({orientation:'vertical'});
        this.updateProperties(props);
        this.children = [
            new eskv.Label({text: 'Insert', align:'left', fontSize:'0.015ah', hints:{h:'0.02ah'}}),
            new eskv.BoxLayout({orientation: 'horizontal', hints: {h:'0.04ah'},
                children: [
                    new CommandButton({
                        text:'Poly',
                        on_press: (event, object, data) => addShape(QGeometric),
                    }),
                    new CommandButton({
                        text:'Rect',
                        on_press: (event, object, data) => addShape(QRectangle),
                    }),
                    new CommandButton({
                        text:'Circle',
                        on_press: (event, object, data) => addShape(QCircle),
                    }),
                    new CommandButton({
                        text:'Text',
                        on_press: (event, object, data) => addShape(QText),
                    }),
                    new CommandButton({
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
                    new CommandButton({text:'All', 
                        on_press: (e,o,v)=> {
                            const ch = /**@type {QShape[]} */(QDraw.get().drawing.children);
                            QDraw.get().controlSurface.selection = new Set(ch);
                        },
                    }),
                    new CommandButton({text:'Box', id:'Box', 
                        on_press: (e,o,v)=> {
                            if(o.text==='Box') {
                                QDraw.get().controlSurface.mode = 'Box';
                                o.text = 'Done';
                            } else {
                                const boxSel = QDraw.get().controlSurface.boxSelection;
                                const sel = QDraw.get().controlSurface.selection;
                                QDraw.get().controlSurface.selection = new Set([...sel, ...boxSel]);
                                QDraw.get().controlSurface.mode = 'Move';
                            }
                        },
                    }),
                    new CommandButton({text:'None', 
                        on_press: (e,o,v)=> {
                            QDraw.get().controlSurface.selection = new Set();
                        },
                    }),
                    new CommandButton({text:'Dup', 
                        on_press: (e,o,v)=> {
                            let drawing = QDraw.get().drawing;
                            let sel = QDraw.get().controlSurface.selection;
                            if(sel.size===0) return;
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
                            QDraw.get().controlSurface.selection = new Set(dup);
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
                    new CommandButton({text:'Config', 
                        on_press: (e,o,v)=> {
                            QDraw.get().controlSurface.selection = new Set();
                            QDraw.get().shapeConfig.shape = QDraw.get().drawing;
                        },
                    }),
                    new CommandButton({text:'Grid', 
                        on_press: (e,o,v)=> {
                            QDraw.get().controlSurface.selection = new Set();
                            QDraw.get().shapeConfig.shape = QDraw.get().controlSurface;
                        },
                    }),
                    new CommandButton({text:'Export', 
                        on_press: drawingExport,
                    }),
                    new CommandButton({text:'Load', 
                        on_press: drawingPicker,
                    }),
                    new CommandButton({text:'Save', 
                        on_press: drawingSave,
                    }),
                    new CommandButton({text:'Fit', 
                        on_press: (e,o,v)=> {
                            QDraw.get().fitDrawingToView();
                        },
                    }),
                ]
            }),

        ];
        const band = /**@type {CommandButton}*/(this.findById('Box'));
        QDraw.get().controlSurface.bind('mode', (e,o,v)=> {
            if(/**@type {QControlSurface}*/(o).mode!=='Box') {
                band.text = 'Box';
            }
        })
    }
}