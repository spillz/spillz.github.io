//@ts-check
import * as eskv from "../eskv/lib/eskv.js";

import { QDrawing, QShapeStack } from './drawing.js';
import { QControlSurface } from "./controlsurface.js";
import { QConfigArea } from "./shapeconfigui.js"; 
import { QPalette } from "./palette.js";
import { QCommandBar } from "./commands.js";
import { QDataStore } from "./storage.js";


export class QDraw extends eskv.App { 
    constructor() {
        super();
        this.store = new QDataStore('QuikDraw');
        this.store.open();
        eskv.App.rules.add("Label", {hints:{h:'0.04ah'}});
        eskv.App.rules.add("Button", {hints:{h:'0.04ah'}});
        eskv.App.rules.add("ToggleButton", {hints:{h:'0.04ah'}});
        eskv.App.rules.add("TextInput", {hints:{h:'0.04ah'}});
        eskv.App.rules.add("Slider", {orientation: 'horizontal', hints:{h:'0.04ah'}});

        // this.prefDimH = -1;
        // this.prefDimW = -1;
        // this.tileSize = 64;

        this.drawing = new QDrawing({
            hints: {x:0.0, y:0.0, w:1.0, h:1.0},
        });
        this.controlSurface = new QControlSurface({
            hints: {x:0.0, y:0.0, w:1.0, h:1.0},
        })
        this.commands = new QCommandBar({ //Drawing commands
            hints:{x:0,y:0,w:0.2,h:0.2},
            bgColor: 'rgb(45,45,45)',
        });
        this.shapeConfig = new QConfigArea({ //Active shape config
            hints:{x:0,y:0.2,w:0.2,h:0.4},
            bgColor: 'rgb(45,45,45)',
        });
        this.shapeStack = new QShapeStack({ //Shape stack (a layer stack)
            hints:{x:0,y:0.6,w:0.2,h:0.4},
            scrollW: false,
            bgColor: 'rgb(45,45,45)',
        });
        this.palette = new QPalette({ //Color palette
            hints:{x:0.8,y:0.0,w:0.2,h:1.0},
            bgColor: 'rgb(45,45,45)',
        });    
        this.drawingScrollView = new eskv.ScrollView({
            id: 'drawingScrollView',
            bgColor: 'rgb(45,45,45)',
            hints:{x:0.2, y:0.0, w:0.6, h:1.0},
            unboundedW: true,
            unboundedH: true,
            children: [
                new eskv.Widget({
                    x:0,
                    y:0,
                    w:40,
                    h:30,
                    bgColor:'black',
                    children: [
                        this.drawing,
                        this.controlSurface,        
                    ]
                })
            ]
        }),
        this.baseWidget.children = [
            this.drawingScrollView,
            this.commands,
            this.shapeConfig,
            this.shapeStack,
            this.palette,
        ]
        this.drawing.bind('child_added', (event,object,data)=>this.shapeStack.onShapeAdded(event,object,data));
        this.drawing.bind('child_removed', (event,object,data)=>this.shapeStack.onShapeRemoved(event,object,data));    
        this.controlSurface.bind('selection', (event,object,data)=>this.shapeStack.csSelection(event,object,data));
        this.controlSurface.bind('selection', (event,object,data)=>this.shapeConfig.csSelection(event,object,data));
    }
    fitDrawingToView() {
        const sv = /**@type {eskv.ScrollView}*/(this.baseWidget.children[0]);
        sv.fitToClient();
    }
    static get() {
        return /**@type {QDraw}*/(eskv.App.get());
    }
};
let app = new QDraw();
app.start();

