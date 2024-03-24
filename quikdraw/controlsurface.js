//@ts-check
import * as eskv from "../eskv/lib/eskv.js";
import { QShape, QPoint } from "./shapes.js";
import { QDraw } from "./app.js";
import { 
    ptTypeRubberBand,
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
/**@typedef {Set<QShape>} QSelection */


class SnapBoundaries {
    left = -Infinity;
    right = Infinity;
    top = -Infinity;
    bot = Infinity;
    sensitivity = 0.25;
    /**@type {'Reset'|'Clamped'|'Free'} */
    state = 'Reset';
    /**@type {number|null} */
    clampX = null;
    /**@type {number|null} */
    clampY = null;
    /**
     * 
     * @param {eskv.Vec2} pt 
     * @param {QControlSurface} cs 
     * @param {QShape[]} shapes 
     * @param {QShape|null} exclude
     */
    calculate(pt, cs, shapes, exclude) {
        let leftMost=0 , rightMost=cs.w, topMost=0, botMost=cs.h;
        for(let sh of shapes) {
            if(sh===exclude) continue;
            for(let n of sh.iterNodes(0)) { 
                //TODO: Instead of nodes, it is probably more pragmataic to use just the bounding rect
                //TODO: Except that rotated bounding rects will be tricky to bound (angled boundaries)
                const nn = sh.applyTransform(n[0].pos);
                leftMost = nn.x>leftMost && nn.x<=pt.x? nn.x:leftMost;
                rightMost = nn.x<rightMost && nn.x>=pt.x? nn.x:rightMost;
                topMost = nn.y>topMost && nn.y<=pt.y? nn.y:topMost;
                botMost = nn.y<botMost && nn.y>=pt.y? nn.y:botMost;
            }
        }
        if(cs.gridVisible) {
            const gridLeft = Math.floor((pt.x-cs.gridOffsetX)/cs.gridCellWidth)*cs.gridCellWidth;
            const gridRight = Math.ceil((pt.x-cs.gridOffsetX)/cs.gridCellWidth)*cs.gridCellWidth;
            const gridTop = Math.floor((pt.y-cs.gridOffsetY)/cs.gridCellHeight)*cs.gridCellHeight;
            const gridBot = Math.ceil((pt.y-cs.gridOffsetY)/cs.gridCellHeight)*cs.gridCellHeight;
            leftMost = Math.max(gridLeft, leftMost);
            rightMost = Math.min(gridRight, rightMost);
            topMost = Math.max(gridTop, topMost);
            botMost = Math.min(gridBot, botMost);
        }
        this.left = leftMost;
        this.right = rightMost;
        this.top = topMost;
        this.bot = botMost;
        this.state = 'Free';
    }
    /**
     * 
     * @param {eskv.Vec2} pt 
     * @param {number} threshold 
     */
    clamp(pt, threshold) {
        const sens = this.sensitivity*threshold;
        const newPt = new eskv.Vec2(pt);
        this.state = 'Free';
        this.clampX = null;
        this.clampY = null;
        if(this.left>=newPt.x) {
            if(this.left>newPt.x+sens) {
                this.state = 'Reset';
                return pt;
            } else {
                newPt[0] = this.left;
                this.state = 'Clamped';
                this.clampX = this.left;
            }
        }
        if(this.right<=newPt.x) {
            if(this.right<newPt.x-sens) {
                this.state = 'Reset';
                return pt;
            } else {
                newPt[0] = this.right;
                this.state = 'Clamped';
                this.clampX = this.right;
            }
        }
        if(this.top>=newPt.y) {
            if(this.top>newPt.y+sens) {
                this.state = 'Reset';
                return pt;
            } else {
                newPt[1] = this.top;
                this.state = 'Clamped';
                this.clampY = this.top;
            }
        }
        if(this.bot<=newPt.y) {
            if(this.bot<newPt.y-sens) {
                this.state = 'Reset';
                return pt;
            } else {
                newPt[1] = this.bot;
                this.state = 'Clamped'
                this.clampY = this.bot;
            }
        }
        return newPt;
    }
}

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
    /**@type {QSelection} collection of currently selected objects*/
    selection = new Set();
    /**@type {QSelection} collection of objects bounded by the band*/
    boxSelection = new Set();
    focalNode = -1;
    /**@type {'Edit'|'Move'|'Box'} */
    mode = 'Edit';
    /** @type {eskv.Vec2} */
    _oldPos = new eskv.Vec2([0,0]);
    /** @type {QShape|null} */
    _touchingSelection = null;
    controlPointScale = 1.0;
    _selectionModified = false;
    gridVisible = false;
    gridLineWidth = 0.05;
    gridLineDash = [0.1,0.2];
    gridLineColor = 'rgba(82,82,82,0.4)';
    gridCellWidth = 1;
    gridCellHeight = 1;
    gridOffsetX = 0;
    gridOffsetY = 0;
    gridSizeToDrawing = true;
    snapBoundaries = new SnapBoundaries();

    /**
     * 
     * @param {eskv.App} app 
     * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} ctx 
     */
    drawGrid(app, ctx) {
        let cs = this;
        if(!this.gridVisible) return;
        const oldDash = ctx.getLineDash();
        ctx.setLineDash(this.gridLineDash); 
        const oldLineWidth = ctx.lineWidth;
        ctx.lineWidth = this.gridLineWidth*cs.getControlPointScale();
        ctx.strokeStyle = this.gridLineColor;
        ctx.beginPath();
        const w = this.gridSizeToDrawing? Math.floor(cs.w/this.gridCellWidth):0;
        const top = this.gridSizeToDrawing? 0:this.gridOffsetY;
        const bot = this.gridSizeToDrawing? cs.h:this.gridOffsetY;
        for(let i=0;i<=w;i++) {
            const x = this.gridOffsetX+i*this.gridCellWidth;
            ctx.moveTo(x, top);
            ctx.lineTo(x, bot);
        }
        const h = this.gridSizeToDrawing? Math.floor(cs.h/this.gridCellHeight):0;
        const left = this.gridSizeToDrawing? 0:this.gridOffsetX;
        const right = this.gridSizeToDrawing? cs.w:this.gridOffsetX;
        for(let i=0;i<=h;i++) {
            const y = this.gridOffsetY+i*this.gridCellHeight;
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
        }
        ctx.stroke();
        ctx.setLineDash(oldDash);
        ctx.lineWidth = oldLineWidth;
    }
    getControlPointScale() {
        if(this.parent && this.parent.parent && this.parent.parent instanceof eskv.ScrollView)
            return 1.0/this.parent?.parent.zoom;
        return 1.0;
    }
    updatePoints(keepControl=null) {
        if(this.mode==='Box') return;
        if(this.selection.size===0) {
            this.children = [];
            return;
        } 
        let cps = this.getControlPointScale();
        if(this.selection.size===1 && this.mode==='Edit') {
            let ch = [];
            let shape = [...this.selection][0];
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
        if(this.selection.size>1) {
            this.children = [];
            return;
        }
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
        if(this.mode==='Box') this.children = [];
        this.updatePoints();
        this.updateBoxSelection();
    }
    on_selection(event, object, value) {
        this.focalNode = -1;
        if(this.selection.size===0) {
            this.children = [];
        } else {
            this.updatePoints();
        }
        this.mode = this.selection.size===1? this.mode: 'Move';
    }
    /**@type {eskv.Widget['on_touch_down']} */
    on_touch_down(event, object, touch) {
        this._touchingSelection = null;
        this._selectionModified = false;
        if(super.on_touch_down(event, object, touch)) return true;
        this.snapBoundaries.state = 'Reset';
        if(touch.nativeEvent && touch.nativeEvent instanceof TouchEvent && touch.nativeEvent.touches.length>1) {
            // this.snapBoundaries.state = 'Reset';
            touch.grab(QDraw.get().drawingScrollView);
            return true;
        }
        //TODO: This should be an async call on large drawings
        if(this.selection.size===1) { //If an active shape in Edit mode, touches add points
            let shape = [...this.selection][0];
            if(this.mode==='Edit' && shape.nodeLength/shape.maxNodes<1) {
                // this.snapBoundaries.state = 'Reset';
                // this.snapBoundaries.calculate(touch.rect.pos, this, /**@type {QShape[]}*/(QDraw.get().drawing.children), shape);
                let p = new QPoint(touch.rect.center_x, touch.rect.center_y, shape.nodeDefault);
                let parr = [p,new QPoint(p.x, p.y, ptTypeControl), new QPoint(p.x, p.y, ptTypeControl)];
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
        if(this.mode === 'Box') {
            this._oldPos = touch.rect.pos;
            // this.focalNode = Math.max(this.children.length-1, 1);
            // this.updatePoints();
            if(this.children.length===0) {
                const ch = [];
                let cps = this.getControlPointScale();
                let pt = touch.rect.center;
                ch.push(new QControlPoint({
                    w:cps, h:cps, x:pt.x-0.5*cps, y:pt.y-0.5*cps,
                    nodeNum:0,
                    index:0,
                    type:ptTypeRubberBand,
                }));
                ch.push(new QControlPoint({
                    w:cps, h:cps, x:pt.x-0.5*cps, y:pt.y-0.5*cps,
                    nodeNum:1,
                    index:0,
                    type:ptTypeRubberBand,
                }));
                this.children = ch;
                this.focalNode = 1;
                let c = /**@type {QControlPoint} */(this.children[this.focalNode]);
                touch.grab(c);
                c._changedFocus = true;
                return true;
            }
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
                    touch.grab(this);
                    this._oldPos = touch.rect.pos;
                    this._touchingSelection = shape;
                    return true;
                }
            }    
            if(this.selection.size>0) { //Will clear the selection once released unless the touch moves
                touch.grab(this);
                return true;
            }
        }
        return false;
    }
    /**@type {eskv.Widget['on_touch_move']} */
    on_touch_move(event, object, touch) {
        if(touch.grabbed===this) {
            const tcenter = this.snapBoundaries.clamp(touch.rect.center, this.getControlPointScale());
            if(this.snapBoundaries.state==='Reset') this.snapBoundaries.calculate(touch.rect.center, this, /**@type {QShape[]}*/(QDraw.get().drawing.children), null);
            if(this.mode!=='Box' && this.selection.size>=1 && this._touchingSelection) {
                if(this.mode==='Move') {
                    let delta = tcenter.sub(this._oldPos);
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
                    this._oldPos = tcenter;
                    this._selectionModified = true;
                    return true;    
                }
            }
            if(!this._touchingSelection) {
                this.snapBoundaries.state = 'Reset';
                touch.grab(QDraw.get().drawingScrollView);
                return true;
            }
    
        }
        return false;
    }
    /**@type {eskv.Widget['on_touch_up']} */
    on_touch_up(event, object, touch) {
        if(touch.grabbed===this) {
            this.snapBoundaries.state = 'Reset';
            touch.ungrab();
            if(this.mode==='Box') return true;
            if(this.selection.size>0 && !this._touchingSelection) {
                this.selection = new Set();
                this.updatePoints();
            }
            else if(this.mode==='Move') {
                if(!this._selectionModified) {
                    if(this._touchingSelection && !this.selection.has(this._touchingSelection)) {
                        this.selection.add(this._touchingSelection);
                        this.selection = this.selection;
                        return true;
                    }
                    if(this.selection.size>0 && this._touchingSelection) {
                        this.selection.delete(this._touchingSelection);
                        this.selection = this.selection;
                    }
                }
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
    /**@type {eskv.Widget['draw']} */
    draw(app, ctx) {
        this.drawGrid(app, ctx);
        if(this.snapBoundaries.state!=='Reset') {
            const oldLineWidth = ctx.lineWidth;               
            ctx.lineWidth = 0.1*this.getControlPointScale();
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(192,192,192,0.5)';
            let sb = this.snapBoundaries;
            ctx.rect(sb.left, sb.top, sb.right-sb.left, sb.bot-sb.top);
            ctx.stroke();
            if(sb.state === 'Clamped') {
                ctx.strokeStyle = 'rgba(192,0,0,0.75)';
                if(sb.clampX) {
                    ctx.beginPath();
                    ctx.moveTo(sb.clampX,sb.top-1);
                    ctx.lineTo(sb.clampX,sb.bot+1);
                    ctx.stroke()    
                }
                if(sb.clampY) {
                    ctx.beginPath();
                    ctx.moveTo(sb.left-1, sb.clampY);
                    ctx.lineTo(sb.right+1, sb.clampY);
                    ctx.stroke()    
                }
            }
            ctx.lineWidth = oldLineWidth;
        }
        if(this.mode==='Box' || this.mode=='Move') {
            const oldDash = ctx.getLineDash();
            ctx.setLineDash([0.2,0.1]); 
            const oldLineWidth = ctx.lineWidth;               
            ctx.lineWidth = 0.1*this.getControlPointScale();
            if(this.selection.size>0) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(128,128,128,0.5)';
                for(let sh of this.selection) {
                    const mat = sh.getTransform();
                    if(mat) {
                        const tx = ctx.getTransform();
                        ctx.transform(mat.a, mat.b, mat.c, mat.d, mat.e, mat.f);
                        ctx.rect(sh.x, sh.y, sh.w, sh.h);
                        ctx.setTransform(tx);    
                    } else {
                        ctx.rect(sh.x, sh.y, sh.w, sh.h);
                    }
                }
                ctx.stroke();
            }
            if(this.mode==='Box') {
                if(this.boxSelection.size>0) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(128,128,0,0.5)';
                    for(let sh of this.boxSelection) {
                        const mat = sh.getTransform();
                        if(mat) {
                            const tx = ctx.getTransform();
                            ctx.transform(mat.a, mat.b, mat.c, mat.d, mat.e, mat.f);
                            ctx.rect(sh.x, sh.y, sh.w, sh.h);
                            ctx.setTransform(tx);    
                        } else {
                            ctx.rect(sh.x, sh.y, sh.w, sh.h);
                        }
                    }
                    ctx.stroke();
                }
                if(this.children.length===2) {
                    ctx.beginPath();
                    const pt1 = /**@type {QControlPoint}*/this.children[0];
                    const pt2 = /**@type {QControlPoint}*/this.children[1];
                    ctx.strokeStyle = 'rgba(128,128,128,0.5)';
                    ctx.rect(pt1.center_x, pt1.center_y, pt2.center_x-pt1.center_x, pt2.center_y-pt1.center_y);
                    ctx.stroke();
                }
            }
            ctx.setLineDash(oldDash);
            ctx.lineWidth = oldLineWidth;
        }
    }
    updateBoxSelection() {
        if(this.mode==='Box' && this.children.length===2) {
            const pt1 = /**@type {QControlPoint}*/this.children[0];
            const pt2 = /**@type {QControlPoint}*/this.children[1];
            const rect = new eskv.Rect([pt1.x, pt1.y, pt2.x-pt1.x, pt2.y-pt1.y]);
            const ch = /**@type {QShape[]}*/(QDraw.get().drawing.children);
            this.boxSelection = new Set(ch.filter(sh=>rect.collide(sh)));
        } else {
            this.boxSelection = new Set();
        }
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
        if(cs.mode==='Box') {
            if(this.movable && this.collide(touch.rect)) {
                touch.grab(this);
                if(this.nodeNum !== cs.focalNode) {
                    cs.focalNode = this.nodeNum;
                }
                this._changedFocus = false;
                return true
            }
        } else if(cs.selection.size===1) {
            let shape = [...cs.selection][0];
            cs.snapBoundaries.calculate(touch.rect.pos, cs, /**@type {QShape[]}*/(QDraw.get().drawing.children), shape);
            if(this.movable && this.collide(touch.rect)) {
                touch.grab(this);
                if(this.nodeNum !== cs.focalNode) {
                    cs.focalNode = this.nodeNum;
                }
                this._changedFocus = false;
                return true
            }    
        }
        return false;
    }
    /**@type {eskv.Widget['on_touch_move']} */
    on_touch_move(event, object, touch) {
        let cs = QDraw.get().controlSurface;
        if(cs.mode==='Box') {
            this.center_x = touch.rect.x;
            this.center_y = touch.rect.y;
            QDraw.get().controlSurface.updateBoxSelection();
            return true;
        }
        if(cs.selection.size===1) {
            let shape = [...cs.selection][0];
            if(touch.grabbed===this && this.movable) {
                this._moving = true;
                let tcenter = cs.snapBoundaries.clamp(touch.rect.center, cs.getControlPointScale());
                tcenter = shape.applyTransform(tcenter, true, false);
                if(cs.snapBoundaries.state==='Reset') cs.snapBoundaries.calculate(touch.rect.center, cs, /**@type {QShape[]}*/(QDraw.get().drawing.children), shape);
                if(this.type==ptTypeShapeMoverCenter) {
                    for(let n of shape.iterNodes()) {
                        for(let pt of n) {
                            pt.x += tcenter.x-shape.center_x;
                            pt.y += tcenter.y-shape.center_y;
                        }
                    }
                    shape.updatedNodes();
                    cs.updatePoints();
                } else if(this.type===ptTypeShapeSizerBottomRight || this.type===ptTypeShapeSizerTopLeft) {
                    shape.txScaleX *= Math.abs(shape.center_x-tcenter.x)/Math.abs(shape.center_x-shape.x);
                    shape.txScaleY *= Math.abs(shape.center_y-tcenter.y)/Math.abs(shape.center_y-shape.y);
                    shape.updatedNodes();
                    cs.updatePoints();
                } else if(this.type===ptTypeShapeRotatorBottomLeft) {
                    let oAngle = Math.atan2(shape.bottom-shape.center_y, shape.x-shape.center_x);
                    let cAngle = Math.atan2(tcenter.y-shape.center_y, tcenter.x-shape.center_x);
                    shape.txAngle += cAngle-oAngle;
                    shape.updatedNodes();
                    cs.updatePoints();
                } else if(this.type===ptTypeShapeRotatorTopRight) {
                    let oAngle = Math.atan2(shape.y-shape.center_y, shape.right-shape.center_x);
                    let cAngle = Math.atan2(tcenter.y-shape.center_y, tcenter.x-shape.center_x);
                    shape.txAngle += cAngle-oAngle;
                    shape.updatedNodes();
                    cs.updatePoints();
                } else if(cs.mode==='Edit' && this.nodeNum>=0) {
                    let sv = /**@type {eskv.ScrollView}*/(cs.parent?.parent);
                    const r = touch.rect;
                    [r.x, r.y] = shape.applyTransform(tcenter, false, true, false, sv);
                    if(!sv.collide(r) && this.index===0) {
                        shape.deleteNode(this.nodeNum);
                        cs.focalNode = -1;
                        shape.updatedNodes();
                        cs.updatePoints();    
                        touch.ungrab();
                    } else {
                        this.center_x = tcenter.x;
                        this.center_y = tcenter.y;
                        if(this.index===0) { //By convention shifting the 0-index point of each node shifts all points
                            const pts = shape.getNode(this.nodeNum);
                            const oldPos = pts[0].pos;
                            [pts[0].x, pts[0].y] = shape.applyTransform(tcenter, true);
                            const delta = pts[0].pos.sub(oldPos);
                            for(let pt of pts.slice(1)) {
                                [pt.x, pt.y] = pt.pos.add(delta);
                            }
                        } else {
                            let pt = shape.getNodePoint(this.nodeNum, this.index);
                            [pt.x, pt.y] = shape.applyTransform(tcenter, true);    
                        }
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
            cs.snapBoundaries.state = 'Reset';
            if(cs.mode!=='Box' && cs.selection.size===1) {
                let shape = [...cs.selection][0];
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