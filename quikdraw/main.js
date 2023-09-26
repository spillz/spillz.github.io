//@ts-check

import * as eskv from "../eskv/lib/eskv.js";

let Vec2 = eskv.Vec2;
let Rect = eskv.Rect;
let Color = eskv.color.Color

const nodeOffset = 4; //offset from the end of the widget position array (widget base class is Array)
const pointVecSize = 3; //x,y,type
const ptTypeLine = 0;
const ptTypeBreak = 1;
const ptTypeQuadratic = 2;
const ptTypeBezier = 3;
const ptTypeControl = 4;
const ptTypeGradient = 5;
const ptTypeRect = 1;
const ptTypeRoundedRect = 2;
const ptTypeCircle = 2;
const ptTypeCircleArc = 1;

/**
 * @typedef {ptTypeLine|ptTypeBreak|ptTypeQuadratic|ptTypeBezier
 * |ptTypeControl|ptTypeGradient|ptTypeCircle|ptTypeCircleArc|ptTypeRect|ptTypeRoundedRect} ptType
 * */


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

/**
 * The control surface sit atop of the `QDrawing` object and handles
 * the interace with the entire drawing or selected shapes with in. This eliminates
 * the need for state tracking of control nodes inside of individual widgets (saving
 * both memory and redundant code) and centralizes touch/mouse/keyboard inputs.
 * The QControlSurface will request the needed control points
 * from the `QDrawing` or selected `QShape`, and the displayed control points will be 
 * mode dependant (editing, moving etc.)
 */
class QControlSurface extends eskv.Widget {
    /**@type {QShape|null} if shape is null then the drawing is the active object*/
    shape = null;
    focalNode = -1;
    /**@type {'Edit'|'Move'} */
    mode = 'Edit';
    /** @type {eskv.Vec2} */
    _oldPos = new eskv.Vec2([0,0]);
    updatePoints(showControl=true) {
        if(!this.shape) {
            this.children = [];
            return;
        } 
        this.shape.updatedNodes();
        let ch = [];
        let i = 0;
        for(let n of this.shape.iterNodes()) {
            ch.push(new QControlPoint({
                w:1, h:1, x:n[0].x-0.5, y:n[0].y-0.5,
                nodeNum:i,
                index:0,
                type:n[0].type,
            }));
            i++;                
        }
        if(this.focalNode>=0 && showControl && this.mode==='Edit') {
            let j = 1;
            for(let pt of this.shape.getExtraControlPoints(this.focalNode)) {
                ch.push(new QControlPoint({
                    w:1,h:1,x:pt.x-0.5,y:pt.y-0.5,
                    nodeNum:this.focalNode,
                    index:j,
                    type:pt.type,
                }));
                j++;
            }
        }
        this.children = ch;
    }
    on_mode(event, object, value) {
        this.focalNode = -1;
        this.updatePoints();
    }
    on_shape(event, object, value) {
        this.focalNode = -1;
        if(this.shape===null) {
            this.children = [];
        } else {
            const ch = [];
            let i = 0;
            this.updatePoints();
        }
    }
    /**@type {(event:string, object:eskv.Widget, touch:eskv.input.Touch)=>boolean} */
    on_touch_down(event, object, touch) {
        if(!this.shape) return false;
        if(super.on_touch_down(event, object, touch)) return true;
        if(this.mode==='Edit' && this.collide(touch.rect) && this.shape.nodeLength/this.shape.maxNodes<1) {
            let p = new QPoint(touch.rect.center_x, touch.rect.center_y, this.shape.nodeDefault);
            let parr = [p,new QPoint(p.x, p.y, ptTypeControl), new QPoint(p.x,p.y,ptTypeControl)]
            if(this.focalNode>=0) {
                this.shape.insertNode(this.focalNode+1, parr);
                this.focalNode++;
            } else {
                this.shape.appendNode(parr);
                this.focalNode = this.shape.nodeLength-1;
            }
            this.updatePoints();
            let c = /**@type {QControlPoint} */(this.children[this.focalNode]);
            touch.grab(c);
            c._changedFocus = true;
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
        if(touch.grabbed===this && this.shape) {
            if(this.mode==='Move') {
                let delta = touch.rect.pos.sub(this._oldPos);
                for(let n of this.shape.iterNodes()) {
                    for(let p of n) {
                        [p.x, p.y] = p.pos.add(delta);
                    }
                }
                for(let c of this.children) {
                    c.pos = c.pos.add(delta);
                }
                this._oldPos = touch.rect.pos;
                this.shape.updatedNodes();
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
}

/**
 * Points are interactable widgets that live on the `QControlSurface`
 * and allow the user to modify the positional state of the drawing 
 * and its shapes.
 */
class QControlPoint extends eskv.Widget {
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
    /**@type {(event:string, object:eskv.Widget, touch:eskv.input.Touch)=>boolean} */
    on_touch_down(event, object, touch) {
        if(this.movable && this.collideRadius(touch.rect, this.w/2)) {
            touch.grab(this);
            if(this.parent instanceof QControlSurface && this.parent.shape) {
                if(this.nodeNum !== this.parent.focalNode) {
                    this.parent.focalNode = this.nodeNum;
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
        if(!(this.parent instanceof QControlSurface)) return false;
        if(touch.grabbed===this) {
            if(this.movable && this.parent.shape) {
                this._moving = true;
                if(this.parent.collide(touch.rect)) {
                    this.center_x = touch.rect.center_x;
                    this.center_y = touch.rect.center_y;
                    let pt = this.parent.shape.getNodePoint(this.nodeNum, this.index);
                    if(pt) {
                        pt.x = this.center_x;
                        pt.y = this.center_y;        
                    }
                    this.parent.shape.updatedNodes();
                } else {
                    if(this.nodeNum>=0 && this.index===0) {
                        this.parent.shape.deleteNode(this.nodeNum);
                        this.parent.focalNode = -1;
                        this.parent.updatePoints();
                    }
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
            let cs = QDraw.get().controlSurface;
            touch.ungrab();
            if(!this._moving && this.index===0 && !this._changedFocus &&
                cs.shape && cs.focalNode>=0 &&
                cs.focalNode===this.nodeNum) {
                cs.shape.nextType(this.nodeNum);
            }
            this._moving = false;
            this._changedFocus = false;
            cs.updatePoints();
            return true;
        }
        return false;
    }
    draw() {
        let ctx = QDraw.get().ctx;
        if(!ctx) return;
        let cs = QDraw.get().controlSurface;
        let hasFocus =  cs.focalNode>=0 && cs.focalNode===this.nodeNum;
        let type = this.type;
        ctx.beginPath();
        ctx.fillStyle = (hasFocus && this.index===0)? this.colorA : this.color;
        if(type===ptTypeLine) {
            ctx.moveTo(this.x, this.bottom);
            ctx.lineTo(this.right, this.bottom);
            ctx.lineTo(this.center_x, this.y);
            ctx.closePath();
        } else if (type===ptTypeBreak) {
            ctx.rect(this.x, this.y, this.w, this.h);
        } else if (type===ptTypeQuadratic) {
            ctx.arc(this.center_x, this.center_y, this.w/2, this.h/2, 2*Math.PI);
            ctx.closePath();
        } else if (type===ptTypeBezier) {
            ctx.strokeStyle = this.colorC;
            ctx.arc(this.center_x, this.center_y, this.w/2, this.h/2, 2*Math.PI);
            ctx.closePath();
            ctx.stroke();
        } else if (type===ptTypeControl) {
            ctx.fillStyle = this.colorC;
            ctx.arc(this.center_x, this.center_y, this.w/2, this.h/2, 2*Math.PI);
            ctx.closePath();
        }
        ctx.fill();    
    }
}

class QPoint extends Array {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} type 
     */
    constructor(x, y, type) {
        super();
        this[0] = x;
        this[1] = y;
        this[2] = type;
    }
    /**@type {eskv.Vec2} */
    get pos() {
        return new eskv.Vec2([this.x, this.y])
    }
    /**@type {number} */
    get x() {
        return this[0];
    }
    /**@type {number} */
    get y() {
        return this[1];
    }
    /**@type {number} */
    get type() {
        return this[2];
    }
    set x(val) {
        this[0] = val;
    }
    set y(val) {
        this[1] = val;
    }
    set type(val) {
        this[2] = val;
    }
}


class QPointRef {
    /**
     * 
     * @param {QShape} shape 
     * @param {number} offset 
     */
    constructor(shape, offset) {
        this.shape = shape;
        this.offset = offset;
    }
    /**@type {eskv.Vec2} */
    get pos() {
        return new eskv.Vec2([this.x, this.y])
    }
    /**@type {number} */
    get x() {
        return this.shape[this.offset];
    }
    /**@type {number} */
    get y() {
        return this.shape[this.offset+1];
    }
    /**@type {number} */
    get type() {
        return this.shape[this.offset+2];
    }
    set x(val) {
        this.shape[this.offset] = val;
    }
    set y(val) {
        this.shape[this.offset+1] = val;
    }
    set type(val) {
        this.shape[this.offset+2] = val;
    }
}

/**
 * `QShape` is the base class for all drawing shapes in QuikDraw. QShape inherits 
 * `Widget` and `Array`, and the positional data (x,y,w,h) for the `Widget`, represening the bounded rect of the 
 * shape is stored in the first 4 elements of the array. A QShape then packs nodes as vector data 
 * into element 4 onwards of the Array data. A node itself is a subsequence of 
 * multiple `QPoint` where each point has (x, y, type) numeric attributes. The first point in each node
 * is interpreted as the main point of the node and the remaining points are child control points (e.g.,
 * the control points of a Bezier curve). All of the node data is packed 
 * into the flat 1D array in this way in an attempt to extract the best performance out of the JIT 
 * compiler in modern browsers. The `QShape` class provides helper methods to be able to add, read, 
 * and write data to individual nodes and points. Additionally is has fill color, stroke colors, and 
 * stroke width properties that implementing shapes should apply in their overridden `draw` method. 
 */
class QShape extends eskv.Widget {
    /** QuikDraw assigned identified of the shape */
    id = 'Shape';
    /** @type {string|null} Stroke color of the shape*/
    lineColor = 'yellow';
    /** @type {string|null} Fill color of the shape*/
    fillColor = 'gray';
    /** @type {number} Line width of the shape*/
    lineWidth = 0.1;
    /** @type {number} Number of points per node*/
    _ptsPerNode = 1;
    /** @type {boolean} Closes the path if true (connecting breaks)*/
    close = true;
    /** @type {ptType} Default node type added when user clicks*/
    nodeDefault = ptTypeLine;
    /** @type {number} Maximum number of nodes allowed, -1 if unlimited */
    maxNodes = -1;
    get nodeLength() {
        return (this.length-nodeOffset)/(pointVecSize*this._ptsPerNode);
    }
    /** Notification that node information may have been updated */
    updatedNodes() {
    }
        /**
     * Returns the points in the node that are relevant to the type of the node's 
     * type (defined in the `type` of the first `QPoint` of the node). Shapes should
     * override the default behavior.
     * @param {number} nodeNum 
     * @returns {QPointRef[]}
     */
    getExtraControlPoints(nodeNum) {
        return [];
    }
    /**
     * Rolls to the next valid type for the Node (as contained in the first `QPoint` of the node)
     * @param {number} nodeNum 
     */
    nextType(nodeNum) {
    }
    /**
     * Iterator that yields an array of `QPointRef`s for each node in the QShape's node sequence. 
     * @param {number} startNode node to start from
     * @yields {QPointRef[]} 
     */
    *iterNodes(startNode=0) {
        for(let i=startNode;i<this.nodeLength;i++) {
            yield this.getNode(i);
        }
    }
    /**
     * Remove all nodes from the `QShape`.
     */
    clearNodes() {
        this.length = nodeOffset;
    }
    /**
     * Returns a reference to a specified point in a specified node. 
     * @param {number} nodeNum 
     * @param {number} ptNum 
     * @returns {QPointRef}
     */
    getNodePoint(nodeNum, ptNum=0) {
        let offset = nodeOffset+nodeNum*this._ptsPerNode*pointVecSize + ptNum*pointVecSize;
        return new QPointRef(this, offset)
    }
    /**
     * Returns an array of references to the points in a specified node.
     * @param {number} nodeNum 
     * @returns {QPointRef[]}
     */
    getNode(nodeNum) {
        let offset = nodeOffset+nodeNum*this._ptsPerNode*pointVecSize;
        let result = [];
        for(let i=0;i<this._ptsPerNode;++i) result.push(new QPointRef(this,offset+i*pointVecSize));
        return result;
    }
    /**
     * Overwrites the points in a specified node. This will throw an error if the array of points is too show.
     * @param {number} nodeNum 
     * @param {QPoint[]|QPointRef[]} points 
     * @returns 
     */
    setNode(nodeNum, points) {
        let offset = nodeOffset+nodeNum*this._ptsPerNode*pointVecSize;
        for(let p of points) {
            this[offset] = p.x;
            this[offset+1] = p.y;
            this[offset+2] = p.type;
            offset+=pointVecSize;
        }
    }
    /**
     * Delete a node from the shape
     * @param {number} nodeNum position to remove node at
     */
    deleteNode(nodeNum) {
        let offset = nodeOffset+nodeNum*this._ptsPerNode*pointVecSize;
        let delta = this._ptsPerNode*pointVecSize;
        for(let i=offset;i<this.length-delta;++i) {
            this[i] = this[i+delta];
        }
        this.length -= delta;
    }
    /**
     * Appends a node to the shape. Note this will error if `points` is too short 
     * for the expected number of points per node.
     * @param {QPoint[]|QPointRef[]} points array of points defining the node
     * @returns 
     */
    appendNode(points) {
        const delta = this._ptsPerNode*pointVecSize;
        let offset = nodeOffset+this.nodeLength*delta;
        this.length += delta;
        for(let i=0;i<this._ptsPerNode;++i) {
            const p = points[i];
            this[offset] = p.x;
            this[offset+1] = p.y;
            this[offset+2] = p.type;
            offset+=pointVecSize;
        }
    }
    /**
     * Inserts a node into the shape at position `nodeNum`. Note this will error if `points` is too short 
     * for the expected number of points per node.
     * @param {number} nodeNum 
     * @param {QPoint[]|QPointRef[]} points 
     * @returns 
     */
    insertNode(nodeNum, points) {
        const delta = this._ptsPerNode*pointVecSize;
        let offset = nodeOffset+nodeNum*delta;
        this.length += delta;
        for(let i = this.length-1-delta; i>=offset; i--) {
            this[i+delta] = this[i];
        }
        for(let i=0;i<this._ptsPerNode;++i) {
            const p = points[i];
            this[offset] = p.x;
            this[offset+1] = p.y;
            this[offset+2] = p.type;
            offset+=pointVecSize;
        }
    }
}

class QText extends QShape {
    _ptsPerNode = 1;
    id = 'Text';
    /**@type {ptType} */
    nodeDefault = ptTypeRect;
    maxNodes = 2;
    constructor(props={}) {
        super();
        this.updateProperties(props)
        this.addChild(new eskv.TextInput({text:'Text', hints:{}}));
    }
    on_lineColor(event, object, value) {
        const c = /**@type {eskv.TextInput}*/(this._children[0]);
        c.color = this.lineColor??'white';
    }
    on_fillColor(event, object, value) {
        const c = /**@type {eskv.TextInput}*/(this._children[0]);
        c.bgColor = this.fillColor;
    }
    updatedNodes() {
        let child = this._children[0];
        if(this.nodeLength>0) [child.x, child.y] = this.getNodePoint(0,0).pos;
        if(this.nodeLength>1) [child.w, child.h] = this.getNodePoint(1,0).pos.sub(this.getNodePoint(0,0).pos);
    }
}


class QRectangle extends QShape {
    hints = {x:0, y:0, w:1, h:1};
    _ptsPerNode = 2;
    id = 'Rectangle';
    /**@type {ptType} */
    nodeDefault = ptTypeRect;
    maxNodes = 2;
    /**
     * Returns the points in the node that are relevant to the type of the node's 
     * type (defined in the `type` of the first `QPoint` of the node). Shapes should
     * override the default behavior.
     * @param {number} nodeNum 
     * @returns {QPointRef[]}
     */
    getExtraControlPoints(nodeNum) {
        if(nodeNum>0) return [];
        let n = this.getNode(nodeNum);
        switch(n[0].type) {
            case ptTypeRoundedRect:
                return n.slice(1);
        }
        return []
    }
    /**
     * Rolls to the next valid type for the Node (as contained in the first `QPoint` of the node)
     * @param {number} nodeNum 
     */
    nextType(nodeNum) {
        if(nodeNum==0) {
            const pt = this.getNodePoint(nodeNum, 0);
            if(pt.type===ptTypeRect) pt.type=ptTypeRoundedRect;
            else if(pt.type===ptTypeRoundedRect) pt.type=ptTypeRect;
        }
    }
    draw() {
        let ctx=QDraw.get().ctx;
        if(!ctx) return;
        if(this.nodeLength<2) return;
        if(!this.fillColor && !this.lineColor) return;
        if(this.getNodePoint(0,0).type===ptTypeRoundedRect) {
            const radius = this.getNodePoint(0,1).pos.dist(this.getNodePoint(0,0).pos);
            const [x,y] = this.getNodePoint(0,0).pos;
            const [width, height] = this.getNodePoint(1,0).pos.sub(this.getNodePoint(0,0).pos);
            ctx.beginPath();
            if(this.fillColor) ctx.fillStyle = this.fillColor;
            if(this.lineColor) ctx.strokeStyle = this.lineColor;
            ctx.lineWidth = this.lineWidth;
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.arc(x + width - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI);
            ctx.lineTo(x + width, y + height - radius);
            ctx.arc(x + width - radius, y + height - radius, radius, 0, 0.5 * Math.PI);
            ctx.lineTo(x + radius, y + height);
            ctx.arc(x + radius, y + height - radius, radius, 0.5 * Math.PI, Math.PI);
            ctx.lineTo(x, y + radius);
            ctx.arc(x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI);
            if(this.close) ctx.closePath();
            ctx.fill()
            ctx.stroke();
        } else {
            const [x,y] = this.getNodePoint(0,0).pos;
            const [width, height] = this.getNodePoint(1,0).pos.sub(this.getNodePoint(0,0).pos);
            ctx.beginPath();
            if(this.fillColor) ctx.fillStyle = this.fillColor;
            if(this.lineColor) ctx.strokeStyle = this.lineColor;
            ctx.lineWidth = this.lineWidth;
            ctx.rect(x, y, width, height);
            if(this.close) ctx.closePath();
            ctx.fill()
            ctx.stroke();

        }
    }
}

class QCircle extends QShape {
    hints = {x:0, y:0, w:1, h:1};
    _ptsPerNode = 2;
    id = 'Circle';
    /**@type {ptType}*/
    nodeDefault = ptTypeCircle;
    maxNodes = 2;
    /**
     * Returns the points in the node that are relevant to the type of the node's 
     * type (defined in the `type` of the first `QPoint` of the node). Shapes should
     * override the default behavior.
     * @param {number} nodeNum 
     * @returns {QPointRef[]}
     */
    getExtraControlPoints(nodeNum) {
        if(nodeNum==0) return [];
        let n = this.getNode(nodeNum);
        switch(n[0].type) {
            case ptTypeCircleArc:
                return n.slice(1);
        }
        return []
    }
    /**
     * Rolls to the next valid type for the Node (as contained in the first `QPoint` of the node)
     * @param {number} nodeNum 
     */
    nextType(nodeNum) {
        if(nodeNum===1) {
            const pt = this.getNodePoint(nodeNum, 0);
            if(pt.type===ptTypeCircle) pt.type=ptTypeCircleArc;
            else if(pt.type===ptTypeCircleArc) pt.type=ptTypeCircle;
        }
    }
    draw() {
        let ctx=QDraw.get().ctx;
        if(!ctx) return;
        if(this.nodeLength<2) return;
        if(!this.fillColor && !this.lineColor) return;
        if(this.getNodePoint(1,0).type===ptTypeCircleArc) {
            ctx.beginPath();
            const [x,y] = this.getNodePoint(0,0).pos;
            const radius = this.getNodePoint(1,0).pos.dist(this.getNodePoint(0,0).pos);
            const [dxs,dys] = this.getNodePoint(1,0).pos.sub(this.getNodePoint(0,0).pos);
            const [dxe,dye] = this.getNodePoint(1,1).pos.sub(this.getNodePoint(0,0).pos);
            const arcStart = Math.atan2(dys, dxs);
            const arcEnd = Math.atan2(dye, dxe);
            if(this.fillColor) ctx.fillStyle = this.fillColor;
            if(this.lineColor) ctx.strokeStyle = this.lineColor;
            ctx.lineWidth = this.lineWidth;
            ctx.arc(x, y, radius, arcStart, arcEnd);
            if(this.close) ctx.closePath();
            ctx.fill()
            ctx.stroke();
        } else {
            ctx.beginPath();
            const [x,y] = this.getNodePoint(0,0).pos;
            const radius = this.getNodePoint(1,0).pos.dist(this.getNodePoint(0,0).pos);
            if(this.fillColor) ctx.fillStyle = this.fillColor;
            if(this.lineColor) ctx.strokeStyle = this.lineColor;
            ctx.lineWidth = this.lineWidth;
            ctx.arc(x, y, radius, 0, 2*Math.PI);
            if(this.close) ctx.closePath();
            ctx.fill()
            ctx.stroke();

        }
    }
}



class QGeometric extends QShape {
    hints = {x:0, y:0, w:1, h:1};
    /**If true, closes the path (joining starting and ending node) */
    close = true;
    /** @type {eskv.Vec2} */
    _oldPos = new Vec2([0,0]);
    _ptsPerNode = 3;
    id = 'Geometric'
    constructor(props) {
        super();
        if(props!==null) {
            this.updateProperties(props);
        }
    }
    /**
     * Returns the points in the node that are relevant to the type of the node's 
     * type (defined in the `type` of the first `QPoint` of the node). Shapes should
     * override the default behavior.
     * @param {number} nodeNum 
     * @returns {QPointRef[]}
     */
    getExtraControlPoints(nodeNum) {
        let n = this.getNode(nodeNum);
        switch(n[0].type) {
            case ptTypeQuadratic:
                return n.slice(1,2);
            case ptTypeBezier:
                return n.slice(1);
        }
        return [];
    }
    /**
     * Rolls to the next valid type for the Node (as contained in the first `QPoint` of the node)
     * @param {number} nodeNum 
     */
    nextType(nodeNum) {
        const pt = this.getNodePoint(nodeNum, 0);
        if(pt.type===ptTypeLine) pt.type=ptTypeBreak;
        else if(pt.type===ptTypeBreak) pt.type=ptTypeQuadratic;
        else if(pt.type===ptTypeQuadratic) pt.type=ptTypeBezier;
        else if(pt.type===ptTypeBezier) pt.type=ptTypeLine;
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {QPointRef[]} points 
     */
    drawNode(ctx, points) {
        let p0 = points[0]
        switch(p0.type) {
            case ptTypeLine:
                ctx.lineTo(p0.x, p0.y);
                break;
            case ptTypeBreak:
                ctx.moveTo(p0.x, p0.y);
                break;
            case ptTypeQuadratic:
                ctx.quadraticCurveTo(points[1].x, points[1].y, p0.x, p0.y);
                break;
            case ptTypeBezier:
                ctx.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, p0.x, p0.y);
                break;
        }
    }
    draw() {
        let ctx = QDraw.get().ctx;
        if(!ctx) return;
        //Draw the lines connecting points
        ctx.lineWidth = this.lineWidth;    
        if(this.lineColor) ctx.strokeStyle = this.lineColor;
        if(this.fillColor) ctx.fillStyle = this.fillColor;
        if(this.nodeLength>0 && (this.lineColor!==null||this.fillColor!==null)) {
            ctx.beginPath();
            if(this.nodeLength>0) {
                let p = this.getNodePoint(0,0);
                ctx.moveTo(p.x, p.y);
            } 
            for(let n of this.iterNodes(1)) {
                this.drawNode(ctx, n);
            }
            if(this.close && this.nodeLength>0) {
                this.drawNode(ctx, this.getNode(0));
                ctx.closePath();
            }
            if(this.fillColor) ctx.fill();
            if(this.lineColor) ctx.stroke();
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
                let app = QDraw.get();
                if(data && object.group) {
                    for(let w of object.parent.iterByPropertyValue('group',object.group)) {
                        if(w.id!==object.id && w.press) w.press=false;    
                    }
                    let sc = app.shapeConfig;
                    let w = app.drawing.findById(object.shape.id);
                    if(w instanceof QShape) {
                        sc.shape = w;
                        app.controlSurface.shape = w;
                    }
                }
            }
        }));
        let sc = /**@type {QDraw} */(QDraw.get()).shapeConfig;
        sc.shape = data;
        return false;
    }
    /**@type {import("../eskv/lib/modules/widgets.js").EventCallback} */
    onShapeRemoved(event, object, data) {
        if(!(data instanceof QShape)) return false;
        let sh = this.children.find((w)=>{if('shape' in w) return w.shape===data})
        let sc = QDraw.get().shapeConfig;
        if(sc.shape===data) {
            sc.shape = null; 
            QDraw.get().controlSurface.shape = null;
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
                            if(data) QDraw.get().controlSurface.mode = 'Edit';
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
                            if(data) QDraw.get().controlSurface.mode = 'Move';
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
                            let drawing = QDraw.get().findById('Drawing');
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
            if(data.fillColor) /**@type {eskv.Slider}*/(this.findById('scFillAlpha')).value = eskv.color.Color.fromString(data.fillColor).a;
            if(data.lineColor) /**@type {eskv.Slider}*/(this.findById('scStrokeAlpha')).value = eskv.color.Color.fromString(data.lineColor).a;
            /**@type {eskv.Slider}*/(this.findById('scStrokeWidth')).value = data.lineWidth;
            /**@type {eskv.ToggleButton}*/(this.findById('scEdit')).press = QDraw.get().controlSurface.mode==='Edit';
            /**@type {eskv.ToggleButton}*/(this.findById('scMove')).press = QDraw.get().controlSurface.mode==='Move';
            if('close' in data) /**@type {eskv.CheckBox}*/(this.findById('scClosed')).check = data.close;    
        }
        return false;
    }
}

function addShape(shapeType) {
    let geo = new shapeType({
        hints: {x:0, y:0, w:1, h:1},
    });
    let app = QDraw.get();
    geo.id = geo.id+app.commands.shapeNum;
    app.commands.shapeNum++;
    app.controlSurface.mode = 'Edit';
    app.drawing.addChild(geo);
    app.controlSurface.shape = geo;

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
                        let shape = /**@type {QDraw}*/(QDraw.get()).shapeConfig.shape;
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
                let shape = QDraw.get().shapeConfig.shape;
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
                let shape = QDraw.get().shapeConfig.shape;
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
                let shape = QDraw.get().shapeConfig.shape;
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
                let shape = QDraw.get().shapeConfig.shape;
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
        hints: {x:0.0, y:0.0, w:1.0, h:1.0},
//        hints: {x:0.2, y:0.0, w:0.8, h:0.8},
    });
    controlSurface = new QControlSurface({
        hints: {x:0.0, y:0.0, w:1.0, h:1.0},
//        hints: {x:0.2, y:0.0, w:0.8, h:0.8},
    })
    shapeConfig = new QShapeConfigArea({ //Active shape config
            hints:{x:0,y:0,w:0.2,h:0.4},
            bgColor: 'rgb(45,45,45)',
    });
    shapeStack = new QShapeStack({ //Shape stack (a layer stack)
            // hints:{x:0,y:0.4,w:0.2,h:0.6},
            hints:{x:0,y:0,w:1,h:null},
            bgColor: 'rgb(45,45,45)',
    });
    palette = new QPalette({ //Color palette
            hints:{x:0.2,y:0.8,w:0.4,h:0.2},
    });
    commands = new QCommand({ //Commands
            numX: 5,
            hints:{x:0.6,y:0.8,w:0.4,h:0.2},        
            bgColor: 'rgb(45,45,45)',
    });
    constructor() {
        super();
        this.baseWidget.children = [
            new eskv.ScrollView({
                bgColor: 'rgb(45,45,45)',
                hints:{x:0.2, y:0.0, w:0.8, h:0.8},
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
/*
        this.baseWidget.children = [
            this.drawing,
            this.controlSurface,
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
 */

        this.drawing.bind('child_added', (event,object,data)=>this.shapeStack.onShapeAdded(event,object,data));
        this.drawing.bind('child_removed', (event,object,data)=>this.shapeStack.onShapeRemoved(event,object,data));    
    }
    static get() {
        return /**@type  {QDraw}*/(eskv.App.get());
    }
};
let app = new QDraw();
app.start();

