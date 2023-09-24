//@ts-check

import * as eskv from "../eskv/lib/eskv.js";

let Vec2 = eskv.Vec2;
let Rect = eskv.Rect;
let Color = eskv.color.Color


/**
 * Modes:
 * Editing -- add new points, edit existing ones
 * Moving -- move and scale entire shape
 */

/**
 * Drawing elements
 * HTML Canvas -- contains the app
    * Canvas -- where drawing occurs all shapes render here
        * Shapes -- a vector based drawing element (a subset of the Canvas toolkit) with 
          positional data and other attributes
            * Control points -- children of shape temporary interactive points to edit the 
            positional data of shapes whose position changes change the position of a point
            in the shape via some sort of event binding.
    * Panels -- holds the controls
      * ShapeConfig -- controls non-positional attributes of the active shape (edit vs move mode control)
      * Palette -- controls
      * Command -- add new shapes (click creates shape) and other global controls (zoom, rotate etc)
      * Stack -- Selectable list of all shapes in the drawing

Modes: draw (add new nodes), edit (change or edit existing nodes), move (entire shape)
*/

class QControlPoint extends eskv.Widget {
    hints = {};
    /**@type {'line'|'break'|'quadratic'|'bezier'|'control'} */
    type = 'line';
    /**@type {boolean} */
    movable = true;
    /**@type {boolean} */
    _moving = false;
    _changedFocus = false;
    /**@type {string} */
    color = 'rgba(255,255,255,0.5)';
    /**@type {string} */
    colorC = 'rgba(255,255,100,0.5)';
    /**@tpye {string} */
    colorA = 'rgba(255,255,255,0.9)';
    /**@type {QGeometricNode?} */
    node;
    /**@type {number} */
    index = 0;
    /**
     * @param {Object|null} props 
     */
    constructor(props=null) {
        super();
        if(props) {
            this.updateProperties(props)
        }
    }
    /**@type {(event:string, object:eskv.Widget, touch:eskv.input.Touch)=>boolean} */
    on_touch_down(event, object, touch) {
        if(this.movable && this.collideRadius(touch.rect, this.w/2)) {
            touch.grab(this);
            if(this.parent instanceof QGeometric) {
                let ind = this.parent.nodes.findIndex((n)=>n===this.node);
                if(ind !== this.parent.focalInd) {
                    this.parent.focalInd = ind;
                    this._changedFocus = true;
                } else {
                    this._changedFocus = false;
                }
            } 
            return true
        }
        return false;
    }
    /**@type {(event:string, object:eskv.Widget, touch:eskv.input.Touch)=>boolean} */
    on_touch_move(event, object, touch) {
        if(!this.parent) return false;
        if(touch.grabbed===this) {
            if(this.movable) {
                this._moving = true;
                if(this.parent.collide(touch.rect)) {
                    this.center_x = touch.rect.center_x;
                    this.center_y = touch.rect.center_y;
                    let pt = this.node?.points[this.index];
                    if(pt) {
                        pt.x = this.center_x;
                        pt.y = this.center_y;        
                    }
                } else {
                    if(this.node && this.index===0) this.node.destroy();
                    touch.ungrab();
                }
            }
            return true;
        }
        return false;
    }
    /**@type {(event:string, object:eskv.Widget, touch:eskv.input.Touch)=>boolean} */
    on_touch_up(event, object, touch) {
        if(touch.grabbed===this) {
            touch.ungrab();
            if(!this._moving && this.index===0 && !this._changedFocus &&
                this.parent instanceof QGeometric && this.parent.focalInd>=0 &&
                this.parent.nodes[this.parent.focalInd]===this.node) {
                this.node.nextType();
            }
            this._moving = false;
            this._changedFocus = false;
            return true;
        }
        return false;
    }
    draw() {
        let ctx = eskv.App.get().ctx;
        if(!ctx) return;
        if(!this.node) return;
        let hasFocus = this.parent instanceof QGeometric && this.parent.focalInd>=0 && this.parent.nodes[this.parent.focalInd]===this.node;
        if(!hasFocus && this.index>0) return;
        ctx.beginPath();
        ctx.fillStyle = (hasFocus && this.index===0)? this.colorA : this.color;
        if(this.type==='line') {
            ctx.moveTo(this.x, this.bottom);
            ctx.lineTo(this.right, this.bottom);
            ctx.lineTo(this.center_x, this.y);
            ctx.lineTo(this.x, this.bottom);
        } else if (this.type==='break') {
            ctx.rect(this.x, this.y, this.w, this.h);
        } else if (this.type==='quadratic') {
            ctx.arc(this.center_x, this.center_y, this.w/2, this.h/2, 2*Math.PI);
        } else if (this.type==='bezier') {
            ctx.strokeStyle = this.colorC;
            ctx.arc(this.center_x, this.center_y, this.w/2, this.h/2, 2*Math.PI);
            ctx.stroke();
        } else if (this.type==='control') {
            ctx.fillStyle = this.colorC;
            ctx.arc(this.center_x, this.center_y, this.w/2, this.h/2, 2*Math.PI);
        }
        ctx.fill();    
    }
}

/**@typedef {'line'|'break'|'bezier'|'quadratic'} QNodeType */

/**A geometric shape is an array of nodes that describe how the 
 * parts of the shape join together
 */
class QGeometricNode {
    /**
     * 
     * @param {QGeometric} shape Shape this node belongs to
     * @param {eskv.Vec2} point the point location of this node 
     * @param {boolean} active type of node to add
     * @param {QNodeType} type type of node to add
     */
    constructor(shape, point, active=true, type='line') {
        /** @type {QGeometric?} */
        this.shape = shape;
        /** @type {eskv.Vec2[]} */
        this.points = [point, new Vec2(point), new Vec2(point)];
        /** @type {QControlPoint[]} */
        this.controls = [];
        /** @type {QNodeType} */
        this._type = type;
        /** @type  {boolean} */
        this._active = active;

        this.active = this._active;
        this.type = this._type;
    }
    /**
     * Remove excess controls 
     */
    _removeControls() {
        while(this.controls.length>0) {
            let c = this.controls.pop();
            if(c && c.parent) c.parent.removeChild(c);
        }
    }
    /**
     * Add controls 
     * @param {number} n number of controls needed
     */
    _addControls(n) {
        let i = 0;
        while(this.controls.length<n) {
            let type = i===0?this.type:'control';
            let c = new QControlPoint({
                    type: type, 
                    node: this, index: i,
                    w: 0.5, h:0.5,
                    center_x: this.points[i].x, center_y: this.points[i].y,
                });
            this.controls.push(c);
            if(this.shape) this.shape.addChild(c);
            i++;
        }
    }
    destroy() {
        if(this.shape) {
            this._removeControls();
            this.shape.nodes = this.shape.nodes.filter((c)=>c!==this);
            this.shape.focalInd = this.shape.nodes.length-1;
        }
    }
    nextType() {
        /**@type {Object.<QNodeType,QNodeType>} */
        let next={'line':'break', 'break':'quadratic', 'quadratic':'bezier', 'bezier':'line'};
        this.type = next[this.type];
    }
    get active() {return this._active}
    set active(value) {
        this._active = value;
        if(value) this.type = this.type;
        else this._removeControls();
    }
    get type() {return this._type};
    set type(value) {
        this._type = value;
        if(!this.active) return;
        let map={'line':1, 'break':1, 'quadratic':2, 'bezier':3};
        this._removeControls()
        this._addControls(map[value])
    };
    /**
     * Drawing the node
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        let p0 = this.points[0]
        switch(this.type) {
            case 'line':
                ctx.lineTo(p0.x, p0.y);
                break;
            case 'break':
                ctx.moveTo(p0.x, p0.y);
                break;
            case 'quadratic':
                ctx.quadraticCurveTo(this.points[1].x, this.points[1].y, p0.x, p0.y);
                break;
            case 'bezier':
                ctx.bezierCurveTo(this.points[1].x, this.points[1].y, this.points[2].x, this.points[2].y, p0.x, p0.y);
                break;            
        }
    }
}

class QShape extends eskv.Widget {
    id = 'Shape';
    focus = false;
    /** @type {string|null} */
    lineColor = 'yellow';
    /** @type {string|null} */
    fillColor = 'gray';
    /** @type {number} */
    lineWidth = 0.1;
    /** @type {'Edit'|'Move'} */
    mode = 'Edit';
}

class QGeometric extends QShape {
    focalInd = -1;
    hints = {x:0, y:0, w:1, h:1};
    pointRadius = 0.25;
    /** @type {QGeometricNode[]} Points that can be traced out by the user */
    nodes = [];
    /** @type {number} */
    touchedPt = -1;
    /** @type {boolean} */
    modifyPt = false;
    /** @type {Set<number>} */
    breaks = new Set();
    /** @type {boolean} */
    close = true;
    /** @type {eskv.Vec2} */
    _oldPos = new Vec2([0,0]);
    constructor(props) {
        super();
        if(props!==null) {
            this.updateProperties(props);
        }
        this.id = 'Geometric'
    }
    clear() {
        this.touchedPt = -1;
        this.nodes = [];
        this.breaks = new Set();    
    }
    on_focus(event, object, value) {
        for(let n of this.nodes) {
            n.active = this.focus;
        }
        this.focalInd = this.focus?this.nodes.length-1:-1;
    }
    /**@type {(event:string, object:eskv.Widget, touch:eskv.input.Touch)=>boolean} */
    on_touch_down(event, object, touch) {
        if(!this.focus) return false;
        if(super.on_touch_down(event, object, touch)) return true;
        if(this.mode==='Edit' && this.collide(touch.rect)) {
            let n = new QGeometricNode(this, touch.rect.center, true, 'line');
            if(this.focalInd>=0) this.nodes = [...this.nodes.slice(0,this.focalInd+1),n,...this.nodes.slice(this.focalInd+1)];
            else this.nodes.push(n);
            this.focalInd++;
            n.controls[0]._moving = true;
            n.controls[0]._changedFocus = true;
            touch.grab(n.controls[0]);
            return true;
        }
        if(this.mode==='Move' && this.collide(touch.rect)) {
            touch.grab(this);
            this._oldPos = touch.rect.pos;
            return true;
        }
        return false;
    }
    /**@type {(event:string, object:eskv.Widget, touch:eskv.input.Touch)=>boolean} */
    on_touch_move(event, object, touch) {
        if(touch.grabbed===this) {
            if(this.mode==='Move') {
                let delta = touch.rect.pos.sub(this._oldPos);
                for(let n of this.nodes) {
                    for(let i=0;i<n.points.length;i++) {
                        n.points[i] = n.points[i].add(delta);
                    }
                }
                for(let c of this.children) {
                    c.pos = c.pos.add(delta);
                }
                this._oldPos = touch.rect.pos;
            }
            return true;
        }
        return false;
    }
    /**@type {(event:string, object:eskv.Widget, touch:eskv.input.Touch)=>boolean} */
    on_touch_up(event, object, touch) {
        if(touch.grabbed===this) {
            touch.ungrab();
            return true;
        }
        return false;
    }

    
    draw() {
        let ctx = eskv.App.get().ctx;
        if(!ctx) return;
        //Draw the lines connecting points
        ctx.lineWidth = this.lineWidth;    
        if(this.lineColor) ctx.strokeStyle = this.lineColor;
        if(this.fillColor) ctx.fillStyle = this.fillColor;
        if(this.nodes.length>0 && (this.lineColor!==null||this.fillColor!==null)) {
            ctx.beginPath();
            if(this.nodes.length>0) {
                let p = this.nodes[0].points[0];
                ctx.moveTo(p.x, p.y);
            } 
            for(let n of this.nodes.slice(1)) {
                n.draw(ctx);
            }
            if(this.close && this.nodes.length>0) {
                this.nodes[0].draw(ctx);
                ctx.closePath();
            }
            if(this.lineColor) ctx.stroke();
            if(this.fillColor) ctx.fill();
        }
    }
}

class QDrawing extends eskv.Widget {
    id = 'Drawing';
    constructor(properties) {
        super();
        if(properties) this.updateProperties(properties)
    }
}

class QShapeStack extends eskv.BoxLayout {
    // numX = 3;
    paddingX = 0.5;
    constructor(properties) {
        super();
        if(properties) this.updateProperties(properties);
    }
    /**@type {import("../eskv/lib/modules/widgets.js").EventCallback} */
    onShapeAdded(event, object, data) {
        if(!(data instanceof QShape)) return false;
        for(let c of this.children) if(c instanceof eskv.ToggleButton) c.press = false;
        this.addChild(new eskv.ToggleButton({
            text:data.id,
            hints:{h:'0.05ah'}, 
            shape:data,
            group:'stackShape',
            press: true,
            on_press: (event,object,data) => {
                let app = /**@type {QDraw}*/(QDraw.get());
                if(data && object.group) {
                    for(let w of object.parent.iterByPropertyValue('group',object.group)) {
                        if(w.id!==object.id && w.press) w.press=false;    
                    }
                    let sc = app.shapeConfig;
                    if(sc.shape) sc.shape.focus = false;
                    let w = app.drawing.findById(object.shape.id);
                    if(w instanceof QShape) {
                        sc.shape = w;
                        w.focus = true;
                    }
                }
            }
        }));
        let sc = /**@type {QDraw} */(QDraw.get()).shapeConfig;
        if(sc.shape) sc.shape.focus = false;
        sc.shape = data;
        data.focus = true;
        return false;
    }
    /**@type {import("../eskv/lib/modules/widgets.js").EventCallback} */
    onShapeRemoved(event, object, data) {
        if(!(data instanceof QShape)) return false;
        let sh = this.children.find((w)=>{if('shape' in w) return w.shape===data})
        let sc = /**@type {QDraw} */(QDraw.get()).shapeConfig;
        if(sc.shape===data) {
            sc.shape.focus = false;
            sc.shape = null; 
        }
        if(sh) this.removeChild(sh);
        return false;
    }
}

class QShapeConfigArea extends eskv.BoxLayout {
    /** @type {QShape|null} */
    shape = null;
    id = 'ShapeConfig';
    /** @type {'Edit'|'Move'} */
    mode = 'Edit';
    constructor(properties) {
        super();
        if(properties) this.updateProperties(properties)
        this.children = [
            new eskv.BoxLayout({
                orientation: 'horizontal',
                children: [
                    new eskv.Label({
                        text: (ShapeConfig)=>(ShapeConfig.shape?ShapeConfig.shape.id:'Select or add a shape'),
                    })
                ] 
            }),
            new eskv.BoxLayout({
                orientation: 'horizontal',
                children: [
                    new eskv.Label({
                        text:'Fill alpha',
                        fontSize: '0.02ah',
                    }),
                    new eskv.Slider({
                        id: 'scFillAlpha',
                        orientation:'horizontal',
                        on_value: (e,o,v)=>{
                            let sc = /**@type {QDraw}*/(QDraw.get()).shapeConfig;
                            if(sc.shape && sc.shape.fillColor) {
                                sc.shape.fillColor = eskv.color.Color.fromString(sc.shape.fillColor).toStringWithAlpha(v);
                            }
                        }
                    }),
                ]
            }),
            new eskv.BoxLayout({
                orientation: 'horizontal',
                children: [
                    new eskv.Label({
                        text:'Stroke alpha',
                        fontSize: '0.02ah',
                    }),
                    new eskv.Slider({
                        id: 'scStrokeAlpha',
                        orientation:'horizontal',
                        on_value: (e,o,v)=>{
                            let sc = /**@type {QDraw}*/(QDraw.get()).shapeConfig;
                            if(sc.shape && sc.shape.lineColor) sc.shape.lineColor = eskv.color.Color.fromString(sc.shape.lineColor).toStringWithAlpha(v);
                        }
                    })
                ]
            }),
            new eskv.BoxLayout({
                orientation: 'horizontal',
                children: [
                    new eskv.Label({
                        text:'Stroke thickness',
                        fontSize: '0.02ah',
                    }),
                    new eskv.Slider({
                        id: 'scStrokeWidth',
                        orientation:'horizontal',
                        min: 0.01,
                        max: 1.0,
                        on_value: (e,o,v)=>{
                            let sc = /**@type {QDraw}*/(QDraw.get()).shapeConfig;
                            if(sc.shape) sc.shape.lineWidth = v;
                        }
                    })
                ]
            }),
            new eskv.BoxLayout({
                orientation: 'horizontal',
                children: [
                    new eskv.Label({
                        text:'Closed',
                        fontSize: '0.02ah',
                    }),
                    new eskv.CheckBox({
                        id: 'scClosed',
                        orientation:'horizontal',
                        min: 0.01,
                        max: 1.0,
                        on_check: (e,o,v)=>{
                            let sc = /**@type {QDraw}*/(QDraw.get()).shapeConfig;
                            if(sc.shape && 'close' in sc.shape) sc.shape.close = v;
                        }
                    })
                ]
            }),
            new eskv.BoxLayout({
                orientation: 'horizontal',
                children: [
                    new eskv.ToggleButton({
                        id: 'scEdit',
                        text: 'Edit',
                        group: 'scGroupMode',
                        fontSize: '0.02ah',
                        disable: (ShapeConfig)=>{
                            return ShapeConfig.shape===null
                        },
                        on_press: (event, object, data)=> {
                            if(!this.shape) return;
                            if(data) {
                                this.shape.mode = 'Edit';
                            }
                        }
                    }),
                    new eskv.ToggleButton({
                        id: 'scMove',
                        text: 'Move',
                        group: 'scGroupMode',
                        fontSize: '0.02ah',
                        disable: (ShapeConfig)=>{
                            return ShapeConfig.shape===null
                        },
                        on_press: (event, object, data)=> {
                            if(!this.shape) return;
                            if(data) {
                                this.shape.mode = 'Move';
                            }
                        }
                    }),
                ]
            }),
            new eskv.BoxLayout({
                orientation: 'horizontal',
                children: [
                    new eskv.Button({
                        id: 'scStackUp',
                        text: 'Up',
                        fontSize: '0.02ah',
                        disable: (ShapeConfig)=>{
                            return ShapeConfig.shape===null
                        },
                        on_press: (event, object, data)=> {
                            if(!this.shape) return;
                            let drawing = /**@type {QDraw}*/(QDraw.get()).drawing;
                            let stack = /**@type {QDraw}*/(QDraw.get()).shapeStack;
                            let ch = drawing._children; //TODO: Bit of a hack
                            let chs = stack._children;
                            let position = ch.findIndex((c)=>c===this.shape);
                            if(ch.length>0 && position>0) {
                                [ch[position-1],ch[position]] = [ch[position],ch[position-1]];
                                [chs[position-1],chs[position]] = [chs[position],chs[position-1]];
                                stack._needsLayout = true;
                            }
                        }
                    }),
                    new eskv.Button({
                        id: 'scStackDown',
                        text: 'Down',
                        fontSize: '0.02ah',
                        disable: (ShapeConfig)=>{
                            return ShapeConfig.shape===null
                        },
                        on_press: (event, object, data)=> {
                            if(!this.shape) return;
                            let drawing = /**@type {QDraw}*/(QDraw.get()).drawing;
                            let stack = /**@type {QDraw}*/(QDraw.get()).shapeStack;
                            let ch = drawing._children; //TODO: Bit of a hack
                            let chs = stack._children;
                            let position = ch.findIndex((c)=>c===this.shape);
                            if(ch.length>0 && position<ch.length-1) {
                                [ch[position+1],ch[position]] = [ch[position],ch[position+1]];
                                [chs[position+1],chs[position]] = [chs[position],chs[position+1]];
                            } 
                        }
                    }),
                    new eskv.Button({
                        id: 'scTrash',
                        text: 'Trash',
                        fontSize: '0.02ah',
                        disable: (ShapeConfig)=>{
                            return ShapeConfig.shape===null
                        },
                        on_press: (event, object, data)=> {
                            if(!this.shape) return;
                            let drawing = eskv.App.get().findById('Drawing');
                            if(drawing instanceof QDrawing) drawing.removeChild(this.shape);
                        }
                    }),
                ]
            }),
        ]
    }
    /** @type {import("../eskv/lib/modules/widgets.js").EventCallback} */
    on_shape(event, object, data) {
        if(data!==null) {
            if(data.fillColor) this.findById('scFillAlpha').value = eskv.color.Color.fromString(data.fillColor).a;
            if(data.lineColor) this.findById('scStrokeAlpha').value = eskv.color.Color.fromString(data.lineColor).a;
            this.findById('scStrokeWidth').value = data.lineWidth;
            this.findById('scEdit').press = data.mode==='Edit';
            this.findById('scMove').press = data.mode==='Move';
            if('close' in data) this.findById('scClosed').check = data.close;    
        }
        return false;
    }
}

class QCommand extends eskv.GridLayout {
    shapeNum = 1;
    constructor(properties) {
        super();
        if(properties) this.updateProperties(properties)
        this.children = [
            new eskv.Label({
                text:'Add'
            }),
            new eskv.Button({
                text:'Shape',
                on_press: (event, object, data) => {
                    let geo = new QGeometric({
                        editing: true,
                        hints: {x:0, y:0, w:1, h:1},
                    });
                    geo.id = geo.id+this.shapeNum;
                    this.shapeNum++;
                    let drawing = eskv.App.get().findById('Drawing');
                    drawing?.addChild(geo);        
                }
            }),
            new eskv.Button({
                text:'Rect',
                disable: true,
            }),
            new eskv.Button({
                text:'Arc',
                disable: true,
            }),
            new eskv.Button({
                text:'Circle',
                disable: true,
            }),
            new eskv.Label({
                text:'Mode'
            }),
            new eskv.Button({
                text:'Select',
                group: 'mode',
                disable: true,
            }),
            new eskv.Button({
                text:'Edit',
                group: 'mode',
                disable: true,
            }),
            new eskv.Widget(),
            new eskv.Widget(),
            new eskv.Label({
                text:'File'
            }),
            new eskv.Button({
                text:'New',
                disable: true,
            }),
            new eskv.Button({
                text:'Load',
                disable: true,
            }),
            new eskv.Button({
                text:'Save',
                disable: true,
            }),
            new eskv.Button({
                text:'Export',
                disable: true,
            }),
        ]
    }
}

class QPalette extends eskv.GridLayout {
    /**@type {'vertical'|'horizontal'} */
    orientation = "vertical";
    /**@type {"fill"|"stroke"} */
    affects = "fill";
    /**
     * 
     * @param {import("../eskv/lib/modules/widgets.js").GridLayoutProperties|null} properties 
     */
    constructor(properties=null) {
        super();
        const palette = [];
        let K = 16;
        let N = 4;
        this.numY = N;
        this.numX = N;
        for (let h = 0; h < 1; h += 1/K) { // Covering all hues from 0 to 1 (360 degrees)
            for (let n = 1; n < N+1; n++) {
                let s = (n % Math.sqrt(N+1)) / Math.sqrt(N+1);
                let v = (N+1-n)/(N+1); //- Math.floor(n / Math.sqrt(N+1)) / Math.sqrt(N+1);
                let color = eskv.color.Color.fromHSV(h*360, s*100, v*100);
                let bgColor = color.toString();
                let sColor = color.scale(0.8).toString();
                this.addChild(new eskv.Button({text:'', bgColor:bgColor, selectColor:sColor, outlineColor:'black',
                    on_press: (event, object, value) => {
                        let shape = /**@type {QDraw}*/(eskv.App.get()).shapeConfig.shape;
                        if(!shape) return;
                        if(this.affects==="fill") {
                            shape.fillColor = bgColor;
                        } else if (this.affects==="stroke") {
                            shape.lineColor = bgColor;
                        }
                    }
                }));
            }
        }
        this.addChild(new eskv.Button({ //Clear out color
            text: 'X',
            on_press: (event, object, value)=>{
                let shape = /**@type {QDraw}*/(eskv.App.get()).shapeConfig.shape;
                if(!shape) return;
                if(this.affects==="fill") {
                    shape.fillColor = null;
                } else if (this.affects==="stroke") {
                    shape.lineColor = null;
                }
            }
        }))
        this.addChild(new eskv.Button({ //Toggle mode between fill and stroke 
            text: 'F',
            on_press: (event,object,value)=>{
                let shape = /**@type {QDraw}*/(eskv.App.get()).shapeConfig.shape;
                if(shape) {
                    object.text = object.text==="F"? "S":"F";
                    this.affects = object.text==="F"? "fill": "stroke";    
                }
            }
        }))
        this.addChild(new eskv.Button({ //Black
            text: '',
            bgColor: 'black',
            on_press: (event, object, value)=>{
                let shape = /**@type {QDraw}*/(eskv.App.get()).shapeConfig.shape;
                if(shape) {
                    if(this.affects==="fill") {
                        shape.fillColor = 'rgba(0,0,0,1)';
                    } else if (this.affects==="stroke") {
                        shape.lineColor = 'rgba(0,0,0,1)';
                    }    
                }
            }
        }));
        this.addChild(new eskv.Button({ //White
            text: '',
            bgColor: 'white',
            on_press: (event, object, value)=>{
                let shape = /**@type {QDraw}*/(eskv.App.get()).shapeConfig.shape;
                if(!shape) return;
                if(this.affects==="fill") {
                    shape.fillColor = 'rgba(255,255,255,1)';
                } else if (this.affects==="stroke") {
                    shape.lineColor = 'rgba(255,255,255,1)';
                }
            }
        }));
        if(properties) this.updateProperties(properties)
    }
}

class QDraw extends eskv.App { 
    drawing = new QDrawing({
        hints: {x:0.2, y:0.0, w:0.8, h:0.8},
        });
    shapeConfig = new QShapeConfigArea({ //Active shape config
            hints:{x:0,y:0,w:0.2,h:0.4},
            bgColor: 'blue',
        });
    shapeStack = new QShapeStack({ //Shape stack (a layer stack)
            // hints:{x:0,y:0.4,w:0.2,h:0.6},
            hints:{x:0,y:0,w:1,h:null},
            bgColor: 'gray',
        });
    palette = new QPalette({ //Color palette
            hints:{x:0.2,y:0.8,w:0.4,h:0.2},
        });
    commands = new QCommand({ //Commands
            numX: 5,
            hints:{x:0.6,y:0.8,w:0.4,h:0.2},        
            bgColor: 'blue',
        });
    constructor() {
        super();
        this.baseWidget.children = [
            this.drawing,
            this.shapeConfig,
            new eskv.ScrollView({
                hints:{x:0,y:0.4,w:0.2,h:0.6},
                scrollW: false,
                children: [
                    this.shapeStack,
                ]
            }),
            this.palette,
            this.commands,
        ]
        this.drawing.bind('child_added', (event,object,data)=>this.shapeStack.onShapeAdded(event,object,data));
        this.drawing.bind('child_removed', (event,object,data)=>this.shapeStack.onShapeRemoved(event,object,data));    
    }
};
let app = new QDraw();
app.start();

