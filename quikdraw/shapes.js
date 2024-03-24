//@ts-check
import * as eskv from "../eskv/lib/eskv.js";
import { QDraw } from "./app.js";
import { QDrawing } from "./drawing.js";

let Vec2 = eskv.Vec2;
let Rect = eskv.Rect;
let Color = eskv.color.Color

const nodeOffset = 4; //offset from the end of the widget position array (widget base class is Array)
const pointVecSize = 3; //x,y,type
export const ptTypeLine = 0;
export const ptTypeBreak = 1;
export const ptTypeQuadratic = 2;
export const ptTypeBezier = 3;
export const ptTypeControl = 4;
export const ptTypeGradient = 5;
export const ptTypeRect = 1;
export const ptTypeRoundedRect = 2;
export const ptTypeCircle = 2;
export const ptTypeCircleArc = 1;
export const ptTypeRubberBand = 1;
export const ptTypeShapeMoverCenter = 10;
export const ptTypeShapeSizerTopLeft = 11;
export const ptTypeShapeSizerBottomRight = 12;
export const ptTypeShapeRotatorTopRight = 13;
export const ptTypeShapeRotatorBottomLeft = 14;

/**
 * @typedef {ptTypeLine|ptTypeBreak|ptTypeQuadratic|ptTypeBezier
* |ptTypeControl|ptTypeGradient|ptTypeCircle|ptTypeCircleArc|ptTypeRect|ptTypeRoundedRect
* |ptTypeShapeMoverCenter|ptTypeShapeSizerTopLeft|ptTypeShapeSizerBottomRight
* |ptTypeShapeRotatorTopRight|ptTypeShapeRotatorBottomLeft} ptType
* */

export class QPoint extends Array {
    /**
     * Construct a new QPoint from x, y and type values.
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


export class QPointRef {
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
    set pos(val) {
        this.x = val.x;
        this.y = val.y;
    }
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
 * `QShape` is the base class for all drawing shapes in QuikDraw. QShape extends
 * `Widget` and `Array`. The the positional data (x,y,w,h) for the `Widget`, represening the bounding rect of the 
 * shape is stored in the first 4 elements of the array. A QShape then packs nodes as vector data 
 * into element 4 onwards of the Array data. A node itself is a subsequence of 
 * multiple `QPoint` where each point has (x, y, type) numeric attributes. The first point in each node
 * is interpreted as the main point of the node and the remaining points are child control points (e.g.,
 * the control points of a Bezier curve). All of the node data is packed 
 * into the flat 1D array in this way in an attempt to extract the best performance out of the JIT 
 * compiler in modern browsers. The `QShape` class provides helper methods to be able to add, read, 
 * and write data to individual nodes and points. Additionally it has fill color, stroke colors, and 
 * stroke width properties parameters that implementing shapes should apply in their overridden `draw` 
 * method. Each shape has rotate and scale transform parameters that are applied to the rendering context
 * before drawing the shape (a departure from ESKV where transforms apply to child widgets).
 */
export class QShape extends eskv.Widget {
    /** QuikDraw assigned identity of the shape */
    id = 'Shape';
    /** @type {null|string|CanvasGradient|CanvasPattern} Stroke color of the shape*/
    lineColor = 'yellow';
    /** @type {null|string|CanvasGradient|CanvasPattern} Fill color of the shape*/
    fillColor = 'gray';
    /** @type {number} Line width of the shape*/
    lineWidth = 0.1;
    /** @type {null|number[]} Array describing a line dash pattern, or null for none */
    lineDash = null;
    /** @type {number} Number of points per node*/
    _ptsPerNode = 1;
    /** @type {boolean} Closes the path if true (connecting breaks)*/
    close = true;
    /** @type {number} Maximum number of nodes allowed, -1 if unlimited */
    maxNodes = -1;
    /** @type {number} x-axis Scaling transform applied to the shape (1 = unscaled)*/
    txScaleX = 1;
    /** @type {number} y-axis Scaling transform applied to the shape (1 = unscaled) */
    txScaleY = 1;
    /** @type {number} Rotation transform applied to the shape (radians, 0 = unrotated) */
    txAngle = 0;
    get nodeLength() {
        return (this.length-nodeOffset)/(pointVecSize*this._ptsPerNode);
    }
    get nodeDefault() {
        return ptTypeRect;
    }
    /**
     * Creates a default instance of a specified shape
     * @param {string} className 
     */
    static create(className) {
        if(className==='QText') {
            return new QText();
        }
        if(className==='QImage') {
            return new QImage();
        }
        if(className==='QRectangle') {
            return new QRectangle();
        }
        if(className==='QGeometric') {
            return new QGeometric();
        }
        if(className==='QGroup') {
            return new QGroup();
        }
        if(className==='QCircle') {
            return new QCircle();
        }
        throw Error(`Unkown shape ${className}`);
    }
    /**
     * Called by the control surface to allow the shape to set its control points when a new node is added
     * @param {number} nodeNum 
     */
    setupControlPoints(nodeNum) {
    }
    getTransform() {
        if(this.txAngle!==0 && (this.txScaleX!==1 || this.txScaleY!==1)) {
            return new DOMMatrix().translate(this.center_x, this.center_y).rotate(this.txAngle*180/Math.PI)
            .scale(this.txScaleX, this.txScaleY).translate(-this.center_x, -this.center_y);
        } else if (this.txAngle!==0) {
            return new DOMMatrix().translate(this.center_x, this.center_y).rotate(this.txAngle*180/Math.PI)
            .translate(-this.center_x, -this.center_y);
        } else if (this.txScaleX!==1 || this.txScaleY!==1) {
            return new DOMMatrix().translate(this.center_x, this.center_y)
            .scale(this.txScaleX, this.txScaleY).translate(-this.center_x, -this.center_y);
        }
        return null;
    }
    getExtents() {
        if(this.nodeLength===0) return [0,0,0,0];
        let np = this.getNodePoint(0,0);
        let minX = np.x;
        let minY = np.y;
        let maxX = np.x;
        let maxY = np.y;
        for(let p of this.iterPoints(1)) {
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }
        return [minX, minY, maxX-minX, maxY-minY];
    }
    /**Updates the bounding rectangle based to the minimum needed to contain all points */
    updateExtents() {
        [this[0], this[1], this[2], this[3]] = this.getExtents();
        this._needsLayout = true;
    }
    /** Notification that node information may have been updated */
    updatedNodes() {
        this.updateExtents();
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
     * Iterator that yields an array of `QPointRef`s for each node in the QShape's node sequence. 
     * @param {number} startPoint point to start from
     * @yields {QPointRef[]} 
     */
    *iterPoints(startPoint=0) {
        let startNode = Math.floor(startPoint/this._ptsPerNode);
        startPoint = startPoint%this._ptsPerNode;
        for(let j=startPoint;j<this._ptsPerNode;j++) {
            yield this.getNodePoint(startNode,j);
        }
        for(let i=startNode+1;i<this.nodeLength;i++) {
            for(let j=0;j<this._ptsPerNode;j++) {
                yield this.getNodePoint(i,j);
            }
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
    /** @type {eskv.Widget['_draw']} */
    _draw(app, ctx, millis) {
        let tx = this.getTransform();
        if(tx) {
            ctx.save();
            ctx.transform(tx.a, tx.b, tx.c, tx.d, tx.e, tx.f);
            this.draw(app, ctx);
            for(let c of this.children) c._draw(app, ctx, millis);
            ctx.restore();    
            return;
        }
        this.draw(app, ctx);
        for(let c of this.children) c._draw(app, ctx, millis);
    }
    /**
     * Shift all node points by fixed x and y amounts. 
     * @param {number} dx 
     * @param {number} dy 
     */
    translateNodes(dx, dy) {
        //TODO: We need to make a call about whether subordinate points are deltas to the main node
        for(let n = 0; n<this.nodeLength; n++) {
            for(let p = 0; p<this._ptsPerNode; p++) {
                let pt = this.getNodePoint(n, p)
                pt.x += dx;
                pt.y += dy;
            }
        }
    }
    serialize() {
        let data = {
            class: this.constructor.name,
            id: this.id,
            lineColor: this.lineColor,
            fillColor: this.fillColor,
            lineWidth: this.lineWidth,
            close: this.close,
            txScaleX: this.txScaleX,
            txScaleY: this.txScaleY,
            txAngle: this.txAngle,
            arrayData: this.slice(),
        };
        return data;
    }
    deserialize(data, changeId=true) {
        if(changeId) this.id = data['id'];
        this.lineColor = data['lineColor'],
        this.fillColor = data['fillColor'],
        this.lineWidth = data['lineWidth'],
        this.close = data['close'],
        this.txScaleX = data['txScaleX'],
        this.txScaleY = data['txScaleY'],
        this.txAngle = data['txAngle'],
        this.length = 0;
        let arr = data['arrayData']
        for(let i=0;i<arr.length; i++) {
            this[i] = arr[i];
        }
    }
    layoutChildren() {
        this.updateExtents();
        super.layoutChildren();
    }
    copy() {

    }
    copyToClipboard() {

    }
    pasteFromClipboard() {

    }
}

/**
 * A QGroup is a `QShape` that contains a series of `QShape` objects that
 * are added as `children`.
 */
export class QGroup extends QShape {
    id = 'Group'
    maxNodes = 0;
    constructor(props={}) {
        super();
        this.updateProperties(props);
    }
    *iterNodes(startNode=0) {
        for(const c of this.children) {
            for(const n of /**@type {QShape}*/(c).iterNodes(0)) yield n;
        }
    }
    /**@type {QShape['translateNodes']} */
    translateNodes(dx, dy) {
        for(let c of /**@type {QShape[]}*/(this.children)) {
            c.translateNodes(dx, dy);
        }
        this.updateExtents();
    }
    updatedNodes() {
        for(let c of /**@type {QShape[]}*/(this.children)) {
            c.updatedNodes();
        }
        super.updatedNodes();
    }
    getExtents() {
        if(this.children.length==0) return [0,0,0,0];
        let c = /**@type {QShape}*/(this.children[0]);
        let [xmin, ymin, xmax, ymax] = c.getExtents();
        ymax+=ymin;
        xmax+=xmin;
        for(let i=1; i<this.children.length; i++) {
            let c = /**@type {QShape}*/(this.children[i]);
            let [x,y,w,h] = c.getExtents();
            [xmin, xmax, ymin, ymax] = [Math.min(xmin,x), Math.max(xmax, x+w), 
                Math.min(ymin, y), Math.max(ymax, y+h)];
        }
        return [xmin, ymin, xmax-xmin, ymax-ymin];
    }
    updateExtents(recalcAll = true) {
        if(!recalcAll) {
            [this[0],this[1],this[2],this[3]] = this.getExtents();
        }
        if(this.children.length==0) {
            this[0] = 0;
            this[1] = 0;
            this[2] = 0;
            this[3] = 0;
            return;
        }
        let c = /**@type {QShape}*/(this.children[0]);
        c.updateExtents();
        let [xmin, xmax, ymin, ymax] = [c.x, c.right, c.y, c.bottom];
        for(let i=1; i<this.children.length; i++) {
            let c = /**@type {QShape}*/(this.children[i]);
            c.updateExtents();
            [xmin, xmax, ymin, ymax] = [Math.min(xmin,c.x), Math.max(xmax, c.right), 
                Math.min(ymin, c.y), Math.max(ymax, c.bottom)];
        }
        this[0] = xmin;
        this[1] = ymin;
        this[2] = xmax - xmin;
        this[3] = ymax - ymin;
        this._needsLayout = true;
    }
    serialize() {
        let data = super.serialize();
        let ch = [];
        for(let c of this.children) {
            if (!(c instanceof QShape)) continue;
            let cdat = c.serialize();
            ch.push(cdat);
        }
        data['children'] = ch;
        return data;
    }
    deserialize(data, changeId=true) {
        super.deserialize(data, changeId)
        let ch = [];
        for(let cdata of data['children']) {
            let c = QShape.create(cdata['class']);
            c.deserialize(cdata, changeId)
            ch.push(c);
        }
        this.children = ch;
    }
}

export class QImage extends QShape {
    _ptsPerNode = 1;
    id = 'Image';
    /**@type {ptType} */
    maxNodes = 2;
    constructor(props={}) {
        super();
        this.updateProperties(props)
        this.addChild(new eskv.ImageWidget({src:'Text', hints:{}}));
    }
    on_lineColor(event, object, value) {
        const c = /**@type {eskv.TextInput}*/(this._children[0]);
        if (!(this.lineColor instanceof CanvasGradient) && !(this.lineColor instanceof CanvasPattern)) {
            c.color = this.lineColor!==null? this.lineColor:'white';
        }
    }
    on_fillColor(event, object, value) {
        const c = /**@type {eskv.TextInput}*/(this._children[0]);
        if (!(this.fillColor instanceof CanvasGradient) && !(this.fillColor instanceof CanvasPattern)) {
            c.bgColor = this.fillColor;
        }
    }
    updatedNodes() {
        super.updatedNodes();
        let child = this._children[0];
        if(this.nodeLength>0) [child.x, child.y] = this.getNodePoint(0,0).pos;
        if(this.nodeLength>1) [child.w, child.h] = this.getNodePoint(1,0).pos.sub(this.getNodePoint(0,0).pos);
    }
    serialize() {
        let data = super.serialize();
        data['src'] = /**@type {eskv.ImageWidget}*/(this.children[0]).src;
        return data;
    }
    deserialize(data, changeId=true) {
        super.deserialize(data, changeId);
        let c = /**@type {eskv.ImageWidget}*/(this.children[0]);
        c.src = data['src'];
        this.updatedNodes();
    }
}

/**
 * Defines and draws a text label. Implemented as a TextInput to make it easy to set the label
 */
export class QText extends QShape {
    _ptsPerNode = 1;
    id = 'Text';
    maxNodes = 2;
    constructor(props={}) {
        super();
        this.updateProperties(props);
        this.addChild(new eskv.TextInput({text:'Text', hints:{}, fontSize:null}));
    }
    on_lineColor(event, object, value) {
        const c = /**@type {eskv.TextInput}*/(this._children[0]);
        c.color = typeof this.lineColor==='string'? this.lineColor : 'black';
    }
    on_fillColor(event, object, value) {
        const c = /**@type {eskv.TextInput}*/(this._children[0]);
        c.bgColor = typeof this.fillColor==='string'? this.fillColor: null;
    }
    updatedNodes() {
        super.updatedNodes();
        let child = this._children[0];
        if(this.nodeLength>0) [child.x, child.y] = this.getNodePoint(0,0).pos;
        if(this.nodeLength>1) [child.w, child.h] = this.getNodePoint(1,0).pos.sub(this.getNodePoint(0,0).pos);
    }
    serialize() {
        let data = super.serialize();
        data['text'] = /**@type {eskv.Label}*/(this.children[0]).text;
        return data;
    }
    deserialize(data, changeId=true) {
        super.deserialize(data, changeId);
        let c = /**@type {eskv.Label}*/(this.children[0]);
        c.text = data['text'];
        this.updatedNodes();
    }
}


/**
 * Defines and draws a rectangle with optional rounded corners
 */
export class QRectangle extends QShape {
    _ptsPerNode = 2;
    id = 'Rectangle';
    maxNodes = 2;
    /**
     * Returns the points in the node that are displayed when this node 
     * is activated (defined in the `type` of the first `QPoint` of the node). Shapes should
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
    /** @type {QShape['draw']} */
    draw(app, ctx) {
        if(this.nodeLength<2) return;
        if(!this.fillColor && !this.lineColor) return;
        if(this.getNodePoint(0,0).type===ptTypeRoundedRect) {
            let oldDash;
            const radius = this.getNodePoint(0,1).pos.dist(this.getNodePoint(0,0).pos);
            const [x,y] = this.getNodePoint(0,0).pos;
            const [width, height] = this.getNodePoint(1,0).pos.sub(this.getNodePoint(0,0).pos);
            ctx.beginPath();
            if(this.fillColor) ctx.fillStyle = this.fillColor;
            if(this.lineColor) ctx.strokeStyle = this.lineColor;
            if(this.lineDash) {
                oldDash = ctx.getLineDash();
                ctx.setLineDash(this.lineDash);
            }
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
            if(this.fillColor) ctx.fill()
            if(this.lineColor) ctx.stroke();
            if(oldDash) ctx.setLineDash(oldDash);
        } else { //Regular rectangle
            let oldDash;
            const [x,y] = this.getNodePoint(0,0).pos;
            const [width, height] = this.getNodePoint(1,0).pos.sub(this.getNodePoint(0,0).pos);
            ctx.beginPath();
            if(this.fillColor) ctx.fillStyle = this.fillColor;
            if(this.lineColor) ctx.strokeStyle = this.lineColor;
            if(this.lineDash) {
                oldDash = ctx.getLineDash();
                ctx.setLineDash(this.lineDash);
            }
            ctx.lineWidth = this.lineWidth;
            ctx.rect(x, y, width, height);
            if(this.close) ctx.closePath();
            if(this.fillColor) ctx.fill()
            if(this.lineColor) ctx.stroke();
            if(oldDash) ctx.setLineDash(oldDash);
        }
    }
}

/**
 * Defines and draws circles, arcs, and (TODO) pie slices
 */
export class QCircle extends QShape {
    _ptsPerNode = 2;
    id = 'Circle';
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
    get nodeDefault() {
        return ptTypeCircle;
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
    /**Updates the bounding rectangle based to the minimum needed to contain all points */
    getExtents() {
        if(this.nodeLength===0) {
            return [0,0,0,0];
        } else if(this.nodeLength===1) {
            let np = this.getNodePoint(0,0);
            return [np.x, np.y, 0, 0];
        } else if(this.nodeLength===2) {
            let np0 = this.getNodePoint(0,0);
            let np1 = this.getNodePoint(1,0);
            let d = np0.pos.dist(np1.pos);
            return [np0.x-d, np0.y-d, 2*d, 2*d];
        }
        return [0,0,0,0];
    }
    /** @type {QShape['draw']} */
    draw(app, ctx) {
        if(this.nodeLength<2) return;
        if(!this.fillColor && !this.lineColor) return;
        if(this.getNodePoint(1,0).type===ptTypeCircleArc) {
            let oldDash;
            ctx.beginPath();
            const [x,y] = this.getNodePoint(0,0).pos;
            const radius = this.getNodePoint(1,0).pos.dist(this.getNodePoint(0,0).pos);
            const [dxs,dys] = this.getNodePoint(1,0).pos.sub(this.getNodePoint(0,0).pos);
            const [dxe,dye] = this.getNodePoint(1,1).pos.sub(this.getNodePoint(0,0).pos);
            const arcStart = Math.atan2(dys, dxs);
            const arcEnd = Math.atan2(dye, dxe);
            if(this.fillColor) ctx.fillStyle = this.fillColor;
            if(this.lineColor) ctx.strokeStyle = this.lineColor;
            if(this.lineDash) {
                oldDash = ctx.getLineDash();
                ctx.setLineDash(this.lineDash);
            } 
            ctx.lineWidth = this.lineWidth;
            ctx.arc(x, y, radius, arcStart, arcEnd);
            if(this.close) ctx.closePath();
            if(this.fillColor) ctx.fill()
            if(this.lineColor) ctx.stroke();
            if(oldDash) ctx.setLineDash(oldDash);
        } else { //Circle
            let oldDash;
            ctx.beginPath();
            const [x,y] = this.getNodePoint(0,0).pos;
            const radius = this.getNodePoint(1,0).pos.dist(this.getNodePoint(0,0).pos);
            if(this.fillColor) ctx.fillStyle = this.fillColor;
            if(this.lineColor) ctx.strokeStyle = this.lineColor;
            if(this.lineDash) {
                oldDash = ctx.getLineDash();
                ctx.setLineDash(this.lineDash);
            } 
            ctx.lineWidth = this.lineWidth;
            ctx.arc(x, y, radius, 0, 2*Math.PI);
            if(this.close) ctx.closePath();
            if(this.fillColor) ctx.fill()
            if(this.lineColor) ctx.stroke();
            if(oldDash) ctx.setLineDash(oldDash);
        }
    }
}

export class QGeometric extends QShape {
    /**If true, closes the path (joining starting and ending node) */
    close = true;
    /** @type {eskv.Vec2} */
    _oldPos = new Vec2([0,0]);
    _ptsPerNode = 3;
    id = 'Geometric';
    constructor(props) {
        super();
        if(props!==null) {
            this.updateProperties(props);
        }
    }
    get nodeDefault() {
        if(this.nodeLength===0) return ptTypeLine;
        return this.getNodePoint(this.nodeLength-1,0).type;
    }
    /**
     * Returns the points in the node that are relevant to the node's 
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
    setupControlPoints(nodeNum) {
        const node = this.getNode(nodeNum);
        let pt = node[0];
        if(pt.type===ptTypeQuadratic) {
            const nn1 = nodeNum>0? nodeNum-1:this.nodeLength-1;
            const nn2 = nn1>0? nn1-1:this.nodeLength-1;
            const pt1 = this.getNodePoint(nn1, 0);
            const pta = this.getNodePoint(nn2, 0);
            const ptb = this.getNodePoint(nn1, 1);
            const ptc = this.getNodePoint(nn1, 2);
            const pt2 = pt1.type === ptTypeBezier? ptc :
                        pt1.type === ptTypeQuadratic? ptb :
                        pta;
            const d2 = pt2.pos.sub(pt1.pos);
            const dist2 = pt2.pos.dist(pt1.pos);
            const dist1 = pt.pos.dist(pt1.pos);
            const alpha = dist2>0 ? 0.5*dist1/dist2 : 0;
            const cp1 = this.getNodePoint(nodeNum,1);
            const cp2 = this.getNodePoint(nodeNum,2);
            cp1.pos = pt1.pos.sub(d2.scale(alpha)) ;
            cp2.pos = cp1.pos; 

        } else if(pt.type===ptTypeBezier) {
            const nn1 = nodeNum>0? nodeNum-1:this.nodeLength-1;
            const nn2 = nn1>0? nn1-1:this.nodeLength-1;
            const pt1 = this.getNodePoint(nn1, 0);
            const pta = this.getNodePoint(nn2, 0);
            const ptb = this.getNodePoint(nn1, 1);
            const ptc = this.getNodePoint(nn1, 2);
            const pt2 = pt1.type === ptTypeBezier? ptc :
                        pt1.type === ptTypeQuadratic? ptb :
                        pta;
            const d2 = pt2.pos.sub(pt1.pos);
            const dist2 = pt2.pos.dist(pt1.pos);
            const dist1 = pt.pos.dist(pt1.pos);
            const alpha1= dist2>0? dist1/dist2/3 : 0;
            const alpha2 = dist2>0? dist1/dist2*2/3: 0;
            const cp1 = this.getNodePoint(nodeNum,1);
            const cp2 = this.getNodePoint(nodeNum,2);
            cp1.pos = pt1.pos.sub(d2.scale(alpha1)) ;
            cp2.pos = pt1.pos.sub(d2.scale(alpha2)) ;
        } else {
            node[1].pos = pt.pos;
            node[2].pos = pt.pos;    
        }
    }
    /**
     * Rolls to the next valid type for the Node (as contained in the first `QPoint` of the node)
     * @param {number} nodeNum 
     */
    nextType(nodeNum) {
        const pt = this.getNodePoint(nodeNum, 0);
        if(pt.type===ptTypeLine) pt.type=ptTypeBreak;
        else if(pt.type===ptTypeBreak) {
            pt.type=ptTypeQuadratic;
        }
        else if(pt.type===ptTypeQuadratic) {
            pt.type=ptTypeBezier;
        }
        else if(pt.type===ptTypeBezier) {
            pt.type=ptTypeLine;
        }
    }
    /**
     * 
     * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} ctx 
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
    /** @type {QShape['draw']} */
    draw(app, ctx) {
        //Draw the lines connecting points
        let oldDash;
        ctx.lineWidth = this.lineWidth;
        if(this.lineColor) ctx.strokeStyle = this.lineColor;
        if(this.fillColor) ctx.fillStyle = this.fillColor;
        if(this.lineDash) {
            oldDash = ctx.getLineDash();
            ctx.setLineDash(this.lineDash);
        } 
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
        if(oldDash) ctx.setLineDash(oldDash);
    }
}
