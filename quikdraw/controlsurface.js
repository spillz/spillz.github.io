//@ts-check
import * as eskv from "../eskv/lib/eskv.js";
import { QShape, QPoint } from "./shapes.js";
import { QDraw } from "./app.js";
import { 
ptTypeLine,
ptTypeBreak,
ptTypeQuadratic,
ptTypeBezier,
ptTypeControl,
ptTypeGradient,
ptTypeRect,
ptTypeRoundedRect,
ptTypeCircle,
ptTypeCircleArc,
ptTypeShapeMoverCenter,
ptTypeShapeSizerTopLeft,
ptTypeShapeSizerBottomRight,
ptTypeShapeRotatorTopRight,
ptTypeShapeRotatorBottomLeft,
} from "./shapes.js";

/** @typedef {import('./shapes.js').ptType} ptType */
/**@typedef {Array<QShape>} QSelection */



/**
 * The control surface sit atop of the `QDrawing` object and handles
 * the interace with the entire drawing or selected shapes with in. This eliminates
 * the need for state tracking of control nodes inside of individual widgets (saving
 * both memory and redundant code) and centralizes touch/mouse/keyboard inputs.
 * The QControlSurface will request the needed control points
 * from the `QDrawing` or selected `QShape`, and the displayed control points will be 
 * mode dependant (editing, moving etc.)
 */
export class QControlSurface extends eskv.Widget {
    /**@type {QSelection} if shape is null then the drawing is the active object*/
    selection = [];
    focalNode = -1;
    /**@type {'Edit'|'Move'|'Band'} */
    mode = 'Edit';
    /** @type {eskv.Vec2} */
    _oldPos = new eskv.Vec2([0,0]);
    /** @type {QShape|null} */
    _touchingSelection = null;
    controlPointScale = 1.0;
    _selectionModified = false;
    getControlPointScale() {
        if(this.parent && this.parent.parent && this.parent.parent instanceof eskv.ScrollView)
            return 1.0/this.parent?.parent.zoom;
        return 1.0;
    }
    updatePoints(keepControl=null) {
        if(this.selection.length===0) {
            this.children = [];
            return;
        } 
        let cps = this.getControlPointScale();
        if(this.selection.length===1 && this.mode==='Edit') {
            let ch = [];
            let shape = this.selection[0];
            shape.updatedNodes();
            let i = 0;
            for(let n of shape.iterNodes()) {
                let tx = shape.getTransform();
                let pt = tx? tx.transformPoint(new DOMPoint(n[0].x, n[0].y)):new DOMPoint(n[0].x, n[0].y);
                ch.push(new QControlPoint({
                    w:cps, h:cps, x:pt.x-0.5*cps, y:pt.y-0.5*cps,
                    nodeNum:i,
                    index:0,
                    type:n[0].type,
                }));
                i++;                
            }
            if(this.focalNode>=0) {
                let j = 1;
                for(let pt of shape.getExtraControlPoints(this.focalNode)) {
                    let tx = shape.getTransform();
                    let pt0 = tx? tx.transformPoint(new DOMPoint(pt.x, pt.y)):new DOMPoint(pt.x, pt.y);
                    ch.push(new QControlPoint({
                        w:cps, h:cps, x:pt0.x-0.5*cps, y:pt0.y-0.5*cps,
                        nodeNum:this.focalNode,
                        index:j,
                        type:pt.type,
                    }));
                    j++;
                }
            }
            this.children = ch;
            return;
        }
        const ch = [];
        let snum=0;
        for(let s of this.selection) {
            let tx = s.getTransform();
            let xy = new DOMPoint(s.x, s.y);
            // let xmid = new DOMPoint(s.x, s.center_y);
            let xbot = new DOMPoint(s.x, s.bottom);
            // let midy = new DOMPoint(s.center_x, s.y);
            let midmid = new DOMPoint(s.center_x, s.center_y);
            // let midbot = new DOMPoint(s.center_x, s.bottom);
            let rgty = new DOMPoint(s.right, s.y);
            // let rgtmid = new DOMPoint(s.right, s.center_y);
            let rgtbot = new DOMPoint(s.right, s.bottom);
            if(tx) {
                xy = tx.transformPoint(xy);
                // xmid = tx.transformPoint(xmid);
                xbot = tx.transformPoint(xbot);
                // midy = tx.transformPoint(midy);
                midmid = tx.transformPoint(midmid);
                // midbot = tx.transformPoint(midbot);
                rgty = tx.transformPoint(rgty);
                // rgtmid = tx.transformPoint(rgtmid);
                rgtbot = tx.transformPoint(rgtbot);
            }
            if(this.children.length>=5*(snum+1) && 
                /**@type {QControlPoint}*/(this.children[0+5*snum]).type===ptTypeShapeMoverCenter) {
                for(let i=0;i<5;i++) ch.push(this.children[5*snum+i]);
                ch[0+5*snum].updateProperties({w:cps, h:cps, x:midmid.x-0.5*cps, y:midmid.y-0.5*cps});
                ch[1+5*snum].updateProperties({w:cps, h:cps, x:xy.x-0.5*cps, y:xy.y-0.5*cps});
                ch[2+5*snum].updateProperties({w:cps, h:cps, x:rgtbot.x-0.5*cps, y:rgtbot.y-0.5*cps});
                ch[3+5*snum].updateProperties({w:cps, h:cps, x:rgty.x-0.5*cps, y:rgty.y-0.5*cps});
                ch[4+5*snum].updateProperties({w:cps, h:cps, x:xbot.x-0.5*cps, y:xbot.y-0.5*cps});
            } else {
                ch.push(new QControlPoint({
                    w:cps, h:cps, x:midmid.x-0.5*cps, y:midmid.y-0.5*cps,
                    nodeNum:-1,
                    index:-1,
                    type:ptTypeShapeMoverCenter,
                }));
                ch.push(new QControlPoint({
                    w:cps, h:cps, x:xy.x-0.5*cps, y:xy.y-0.5*cps,
                    nodeNum:-1,
                    index:-1,
                    type:ptTypeShapeSizerTopLeft,
                }));
                ch.push(new QControlPoint({
                    w:cps, h:cps, x:rgtbot.x-0.5*cps, y:rgtbot.y-0.5*cps,
                    nodeNum:-1,
                    index:-1,
                    type:ptTypeShapeSizerBottomRight,
                }));
                ch.push(new QControlPoint({
                    w:cps, h:cps, x:rgty.x-0.5*cps, y:rgty.y-0.5*cps,
                    nodeNum:-1,
                    index:-1,
                    type:ptTypeShapeRotatorTopRight,
                }));
                ch.push(new QControlPoint({
                    w:cps, h:cps, x:xbot.x-0.5*cps, y:xbot.y-0.5*cps,
                    nodeNum:-1,
                    index:-1,
                    type:ptTypeShapeRotatorBottomLeft,
                }));
            }
            snum++;
        }
        this.children = ch;
    }
    on_mode(event, object, value) {
        this.focalNode = -1;
        this.updatePoints();
    }
    on_selection(event, object, value) {
        this.focalNode = -1;
        if(this.selection.length===0) {
            this.children = [];
        } else {
            this.updatePoints();
        }
        this.mode = this.selection.length===1? this.mode: 'Move';
    }
    /**@type {eskv.Widget['on_touch_down']} */
    on_touch_down(event, object, touch) {
        this._touchingSelection = null;
        this._selectionModified = false;
        if(super.on_touch_down(event, object, touch)) return true;
        if(touch.nativeEvent instanceof TouchEvent && touch.nativeEvent.touches.length>1) {
            touch.grab(QDraw.get().drawingScrollView);
            return true;
        }
        if(this.selection.length===1) { //If an active shape in Edit mode, touches add points
            let shape = this.selection[0];
            if(this.mode==='Edit' && shape.nodeLength/shape.maxNodes<1) {
                let p = new QPoint(touch.rect.center_x, touch.rect.center_y, shape.nodeDefault);
                let parr = [p,new QPoint(p.x, p.y, ptTypeControl), new QPoint(p.x, p.y, ptTypeControl)]
                if(this.focalNode>=0) {
                    shape.insertNode(this.focalNode+1, parr);
                    this.focalNode++;
                } else {
                    shape.appendNode(parr);
                    this.focalNode = shape.nodeLength-1;
                }
                shape.setupControlPoints(this.focalNode);
                shape.updatedNodes();
                this.updatePoints();
                //TODO: for a circle or rectangle we should add two points and grab the second
                let c = /**@type {QControlPoint} */(this.children[this.focalNode]);
                touch.grab(c);
                c._changedFocus = true;
                this._touchingSelection = shape;
                return true;
            }
        }
        if(this.mode === 'Band') {
            this._oldPos = touch.rect.pos;
            this.focalNode = Math.max(this.children.length-1, 1);
            this.updatePoints();
            let c = /**@type {QControlPoint} */(this.children[this.focalNode]);
            touch.grab(c);
            c._changedFocus = true;
            return true;
        }
        if(this.mode==='Move') {
            for(let s of this.selection) {
                if(s.collide(touch.rect)) {
                    touch.grab(this); //TODO: remove shape if the modifier is activated
                    this._oldPos = touch.rect.pos;
                    this._touchingSelection = s;
                    return true;
                }                
            }
            let drawing = QDraw.get().drawing;
            for(let i=drawing.children.length-1; i>=0; i--) {
                const shape = /**@type {QShape}*/(drawing.children[i]);
                if(shape.collide(touch.rect)) {
                    this.selection = [...this.selection, /**@type {QShape}*/(shape)];
                    touch.grab(this)
                    this._oldPos = touch.rect.pos;
                    this._touchingSelection = shape;
                    this._selectionModified = true;
                    return true;
                }
            }
            if(this.selection.length>0) { //Will clear the selection once released unless the touch moves
                touch.grab(this);
                return true;
            }
        }
        return false;
    }
    /**@type {eskv.Widget['on_touch_move']} */
    on_touch_move(event, object, touch) {
        if(this.selection.length>=1 && this._touchingSelection) {
            if(touch.grabbed===this && this.mode==='Move') {
                let delta = touch.rect.pos.sub(this._oldPos);
                for(let c of this.children) {
                    c.pos = c.pos.add(delta);
                }
                for (let shape of this.selection) {
                    for(let n of shape.iterNodes()) {
                        for(let p of n) {
                            [p.x, p.y] = p.pos.add(delta);
                        }
                    }
                    shape.updatedNodes();
                }
                this._oldPos = touch.rect.pos;
                this._selectionModified = true;
                return true;    
            }
        }
        if(touch.grabbed===this && !this._touchingSelection) {
            touch.grab(QDraw.get().drawingScrollView);
            return true;
        }
        return false;
    }
    /**@type {eskv.Widget['on_touch_up']} */
    on_touch_up(event, object, touch) {
        if(touch.grabbed===this) {
            touch.ungrab();
            if(this.selection.length>0 && !this._touchingSelection) {
                this.selection = [];
                this.updatePoints();
            }
            else if(this.mode==='Move' && this.selection.length>0 
                    && this._touchingSelection && !this._selectionModified) {
                const ind = this.selection.findIndex((s)=>s===this._touchingSelection);
                this.selection = [...this.selection.slice(0,ind),...this.selection.slice(ind+1)];
            }
            return true;
        }
        return false;
    }
    /**@type {eskv.Widget['layoutChildren']} */
    layoutChildren() {
//        this.updatePoints();
        let cps = this.getControlPointScale();
        for(let c of this.children) {
            c[0] = c.center_x-cps/2;
            c[1] = c.center_y-cps/2;
            c[2] = cps;
            c[3] = cps;
        }
        super.layoutChildren();
    }
}

/**
 * Points are interactable widgets that live on the `QControlSurface`
 * and allow the user to modify the positional state of the drawing 
 * and its shapes.
 */
export class QControlPoint extends eskv.Widget {
    hints = {};
    /**@type {ptType} */
    type = ptTypeLine;
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
    /**@type {number} */
    nodeNum;
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
    /**@type {eskv.Widget['on_touch_down']} */
    on_touch_down(event, object, touch) {
        let cs = QDraw.get().controlSurface;
        if(cs.selection.length===1) {
            let shape = cs.selection[0];
            if(this.movable && this.collide(touch.rect)) {
                touch.grab(this);
                if(this.nodeNum !== cs.focalNode) {
                    cs.focalNode = this.nodeNum;
                    this._changedFocus = true;
                } else {
                    this._changedFocus = false;
                }
                return true
            }    
        }
        return false;
    }
    /**@type {eskv.Widget['on_touch_move']} */
    on_touch_move(event, object, touch) {
        let cs = QDraw.get().controlSurface;
        if(cs.selection.length===1) {
            let shape = cs.selection[0];
            if(touch.grabbed===this && this.movable) {
                this._moving = true;
                if(this.type==ptTypeShapeMoverCenter) {
                    for(let n of shape.iterNodes()) {
                        for(let pt of n) {
                            pt.x += touch.rect.center_x-shape.center_x;
                            pt.y += touch.rect.center_y-shape.center_y;
                        }
                    }
                    shape.updatedNodes();
                    cs.updatePoints();
                } else if(this.type===ptTypeShapeSizerBottomRight || this.type===ptTypeShapeSizerTopLeft) {
                    shape.txScaleX = 1/Math.abs(shape.center_x-shape.x)*Math.abs(shape.center_x-touch.rect.x);
                    shape.txScaleY = 1/Math.abs(shape.center_y-shape.y)*Math.abs(shape.center_y-touch.rect.y);
                    shape.updatedNodes();
                    cs.updatePoints();
                } else if(this.type===ptTypeShapeRotatorBottomLeft) {
                    let oAngle = Math.atan2(shape.bottom-shape.center_y, shape.x-shape.center_x);
                    let cAngle = Math.atan2(touch.rect.y-shape.center_y, touch.rect.x-shape.center_x);
                    shape.txAngle = cAngle-oAngle;
                    shape.updatedNodes();
                    cs.updatePoints();
                } else if(this.type===ptTypeShapeRotatorTopRight) {
                    let oAngle = Math.atan2(shape.y-shape.center_y, shape.right-shape.center_x);
                    let cAngle = Math.atan2(touch.rect.y-shape.center_y, touch.rect.x-shape.center_x);
                    shape.txAngle = cAngle-oAngle;
                    shape.updatedNodes();
                    cs.updatePoints();
                } else if(cs.mode==='Edit' && this.nodeNum>=0) {
                    let sv = /**@type {eskv.ScrollView}*/(cs.parent?.parent);
                    let r = touch.rect; 
                    [r.x, r.y] = shape.applyTransform(r.pos, false, true, false, sv);
                    if(!sv.collide(r) && this.index===0) {
                        shape.deleteNode(this.nodeNum);
                        cs.focalNode = -1;
                        shape.updatedNodes();
                        cs.updatePoints();    
                        touch.ungrab();
                    } else {
                        let r = touch.rect;
                        this.center_x = r.x;
                        this.center_y = r.y;
                        let pt = shape.getNodePoint(this.nodeNum, this.index);
                        [pt.x, pt.y] = shape.applyTransform(r.pos, true);
                        shape.updatedNodes();
                    }
                }
                return true;
            }
        }
        return false;
    }
    /**@type {eskv.Widget['on_touch_up']} */
    on_touch_up(event, object, touch) {
        if(touch.grabbed===this) {
            touch.ungrab();
            let cs = QDraw.get().controlSurface;
            if(cs.selection.length===1) {
                let shape = cs.selection[0];
                if(!this._moving && this.index===0 && !this._changedFocus &&
                    shape && cs.focalNode>=0 &&
                    cs.focalNode===this.nodeNum) {
                    shape.nextType(this.nodeNum);
                    shape.setupControlPoints(cs.focalNode);
                }
                this._moving = false;
                this._changedFocus = false;
                cs.updatePoints();
                return true;
            }
        }
        return false;
    }
    /**@type {eskv.Widget['draw']} */
    draw(app, ctx) {
        let cs = QDraw.get().controlSurface;
        let hasFocus =  cs.focalNode>=0 && cs.focalNode===this.nodeNum;
        let type = this.type;
        ctx.beginPath();
        ctx.fillStyle = (hasFocus && this.index===0)? this.colorA : this.color;
        ctx.lineWidth = this.w/10;
        if(type===ptTypeLine) {
            ctx.moveTo(this.x, this.bottom);
            ctx.lineTo(this.right, this.bottom);
            ctx.lineTo(this.center_x, this.y);
            ctx.closePath();
        } else if (type===ptTypeBreak) {
            ctx.rect(this.x, this.y, this.w, this.h);
        } else if (type===ptTypeQuadratic) {
            ctx.arc(this.center_x, this.center_y, this.w/2, 0, 2*Math.PI);
            ctx.closePath();
        } else if (type===ptTypeBezier) {
            ctx.strokeStyle = this.colorC;
            ctx.arc(this.center_x, this.center_y, this.w/2, 0, 2*Math.PI);
            ctx.closePath();
            ctx.stroke();
        } else if (type===ptTypeControl) {
            ctx.fillStyle = this.colorC;
            ctx.arc(this.center_x, this.center_y, this.w/2, 0, 2*Math.PI);
            ctx.closePath();
            ctx.stroke();
        } else if (type===ptTypeShapeMoverCenter) {
            ctx.strokeStyle = this.colorC;
            ctx.moveTo(this.center_x, this.y);
            ctx.lineTo(this.center_x, this.bottom);
            ctx.moveTo(this.x, this.center_y);
            ctx.lineTo(this.right, this.center_y);
            ctx.stroke();
            return;
        } else if (type===ptTypeShapeMoverCenter) {
            ctx.strokeStyle = this.colorC;
            ctx.moveTo(this.center_x, this.y);
            ctx.lineTo(this.center_x, this.bottom);
            ctx.moveTo(this.x, this.center_y);
            ctx.lineTo(this.right, this.center_y);
            ctx.stroke();
            return;
        } else if (type===ptTypeShapeSizerTopLeft) {
            ctx.strokeStyle = this.colorC;
            ctx.moveTo(this.center_x, this.center_y);
            ctx.lineTo(this.center_x, this.bottom);
            ctx.moveTo(this.center_x, this.center_y);
            ctx.lineTo(this.right, this.center_y);
            ctx.stroke();
            return;
        } else if (type===ptTypeShapeSizerBottomRight) {
            ctx.strokeStyle = this.colorC;
            ctx.moveTo(this.center_x, this.center_y);
            ctx.lineTo(this.center_x, this.y);
            ctx.moveTo(this.center_x, this.center_y);
            ctx.lineTo(this.x, this.center_y);
            ctx.stroke();
            return;
        } else if (type===ptTypeShapeRotatorTopRight) {
            ctx.strokeStyle = this.colorC;
            ctx.arc(this.x, this.bottom, this.w/2, 1.5*Math.PI, 2*Math.PI);
            ctx.stroke();
            return;
        } else if (type===ptTypeShapeRotatorBottomLeft) {
            ctx.strokeStyle = this.colorC;
            ctx.arc(this.right, this.y, this.w/2, 0.5*Math.PI, Math.PI);
            ctx.stroke();
            return;
        }
        ctx.fill();    
    }
}