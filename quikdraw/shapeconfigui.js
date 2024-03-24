//@ts-check
import * as eskv from "../eskv/lib/eskv.js";
import { QRectangle, QShape, QText, QCircle, QGeometric, QImage, QGroup } from "./shapes.js";
import { QDraw } from "./app.js";
import { addShape, exportShapeToPNG} from "./commands.js";
import { QDrawing } from "./drawing.js";
import { QControlSurface } from "./controlsurface.js";

function numberSanitizer(text, textInput) {
    let value = parseFloat(text)
    if(isNaN(value)) return String(textInput.default??'');
    value = textInput.min ? Math.max(value, textInput.min):value;
    value = textInput.max ? Math.min(value, textInput.max):value;
    value = textInput.step? Math.floor(value/textInput.step)*textInput.step: value;
    return value;
}


export class PropUISliderNumber extends eskv.BoxLayout {
    constructor(props = {}) {
        super({orientation: 'horizontal'});
        this.label = new eskv.Label({align:'left', sizeGroup:'Config'});
        this.slider = new eskv.Slider({orientation: 'horizontal', hints:{w:0.5, h:'0.04ah'}, 
            on_value:(e,o,v)=>{
                this.sliderValue.text = `${parseFloat(v.toFixed(2)).toString()}`;    
                this.emit('value',v);
            }
        });
        this.sliderValue = new eskv.TextInput({hints:{w:0.1, h:'0.04ah'}, 
            _inputSanitizer:numberSanitizer, sizeGroup:'Config',
            on_text: (e,o,v)=> {
                this._needsLayout = true;
                const val = parseFloat(v);
                if(val!==this.slider.value) this.slider.value = val;
            }
        });
        this.children = [this.label, this.slider, this.sliderValue];
        this.updateProperties(props);
    }
    get min() {
        return this.slider.min;
    }
    get max() {
        return this.slider.max;
    }
    get step() {
        return this.slider.step;
    }
    get value() {
        return this.slider.value;
    }
    get text() {
        return this.label.text;
    }
    set min(value) {
        this.slider.min = value;
    }
    set max(value) {
        this.slider.max = value;        
    }
    set value(value) {
        this.slider.value = value;
        this.sliderValue.text = `${value}`;
        // this.slider.updateMax();
    }
    set step(value) {
        this.slider.step = value;
    }
    set text(value) {
        this.label.text = value;
    }
    /**
     * @param {eskv.Widget} shape 
     * @param {string} prop 
     */
    bindShape(shape, prop) {
        let sn = this;
        this.slider.bind('value', (e,o,v)=>{
            if(shape[prop]!==v) {
                shape[prop]=v;
                // sn.slider.updateMax();
                sn.sliderValue.text = `${parseFloat(v.toFixed(2)).toString()}`;    
            }
        }, this);
        this.sliderValue.bind('text', (e,o,v)=>{
            if(v!==this.text) {
                let val=parseFloat(v);
                if(Number.isNaN(val) || val<sn.min || sn.max!==null && val>sn.max) {
                    sn.sliderValue.text = `${sn.slider.value}`;
                    return;
                }
                if(sn.slider.value!==val) sn.slider.value = val;    
            }
        }, this);
        this.value = shape[prop];
        shape.bind(prop, (e,o,v)=>{this.value=shape[prop]});
    }
}

export class PropUISliderAlpha extends PropUISliderNumber {
    /**
     * Prop will be 'fillColor' or 'lineColor'
     * @param {eskv.Widget} shape 
     * @param {string} prop 
     */
    bindShape(shape, prop) {
        let sn = this;
        this.slider.bind('value', (e,o,v)=>{
            if(shape[prop]) {
                const c = eskv.color.Color.fromString(shape[prop]).toStringWithAlpha(v);
                if(shape[prop] !== c) shape[prop] = c;
                sn.sliderValue.text = `${parseFloat(v.toFixed(2)).toString()}`;    
            }
        });
        this.sliderValue.bind('text', (e,o,v)=>{
            if(v!==this.text) {
                let val=parseFloat(v);
                if(Number.isNaN(val)) {
                    sn.sliderValue.text = `${sn.slider.value}`;
                    return;
                }
                if(sn.slider.value!==val) sn.slider.value = val;    
            }
        }, this);
        sn.value = eskv.color.Color.fromString(shape[prop]).a;
        shape.bind(prop, (e,o,v)=>{this.value=eskv.color.Color.fromString(shape[prop]).a});
    }
}

/**
 * A combined label, slider, editable textinput and button where the slider has a `default` value. 
 * Pressing the button resets the slider value to its default.
 */
export class PropUISliderNumberWithDefault extends eskv.BoxLayout {
    constructor(props = {}) {
        super({orientation: 'horizontal'});
        this.label = new eskv.Label({align:'left', sizeGroup:'Config'});
        this.button = new eskv.Button({text:'X', hints:{w:0.1, h:'0.04ah'}, sizeGroup:'Config'});
        this.slider = new eskv.Slider({orientation: 'horizontal', hints:{w:0.5, h:'0.04ah'}, on_value:(e,o,v)=>{
            this.sliderValue.text = `${parseFloat(v.toFixed(2)).toString()}`;    
            this.emit('value',v);
        }});
        this.sliderValue = new eskv.TextInput({hints:{w:0.1, h:'0.04ah'}, sizeGroup:'Config',
            on_text: (e,o,v)=> {
                const val = parseFloat(v);
                if(val!==this.slider.value) this.slider.value = val;
            }
        });
        this.default = 1.0;
        this.children = [this.label, this.button, this.slider, this.sliderValue];
        this.updateProperties(props);
    }
    /** @type {number} */
    get min() {
        return this.slider.min;
    }
    /** @type {number|null} */
    get max() {
        return this.slider.max;
    }
    get step() {
        return this.slider.step;
    }
    /** @type {number} */
    get value() {
        return this.slider.value;
    }
    get text() {
        return this.label.text;
    }
    set min(value) {
        this.slider.min = value;
    }
    set max(value) {
        this.slider.max = value;        
    }
    set step(value) {
        this.slider.step = value;        
    }
    set value(value) {
        this.slider.value = value;
        this.sliderValue.text = `${value}`;
    }
    set text(value) {
        this.label.text = value;
    }
    on_default(e, o, v) {
        this.value = v;
        this.slider.updateMax();
    }
    /**
     * @param {eskv.Widget} shape 
     * @param {string} prop 
     */
    bindShape(shape, prop) {
        let sn = this;
        this.slider.bind('value', (e,o,v)=>{
            if(shape[prop]!==v) {
                shape[prop]=v;
            }
            const textVal = `${parseFloat(v.toFixed(2)).toString()}`;
            if(sn.sliderValue.text!==textVal) sn.sliderValue.text = textVal;
        }, this);
        this.sliderValue.bind('text', (e,o,v)=>{
            let val=parseFloat(v);
            if(Number.isNaN(val)) {
                sn.sliderValue.text = `${sn.slider.value}`;
                return;
            }
            if(sn.slider.value!==val) sn.slider.value = val;
            if(val>sn.slider.curMax) sn.slider.updateMax();
        }, this);
        this.button.bind('press', (e,o,v)=>{
            if(sn.slider.value!==this.default) {
                sn.slider.value = this.default;
                sn.slider.updateMax();
            }
        });
        sn.value = shape[prop]??this.default;
        shape.bind(prop, (e,o,v)=>{if(this.value!==shape[prop]) this.value=shape[prop]});
    }
}

export class PropUIString extends eskv.BoxLayout {
    constructor(props = {}) {
        super({orientation: 'horizontal'});
        this.label = new eskv.Label({align:'left', sizeGroup:'Config'});
        this.textInput = new eskv.TextInput({hints:{w:0.7, h:'0.04ah'}, sizeGroup:'Config', on_text:(e,o,v)=>this.emit('value',v)});
        this.children = [this.label, this.textInput];
        this.updateProperties(props);
    }
    get value() {
        return this.textInput.text;
    }
    get text() {
        return this.label.text;
    }
    set value(value) {
        this.textInput.text = value;
    }
    set text(value) {
        this.label.text = value;
    }
    /**
     * @param {eskv.Widget} shape 
     * @param {string} prop 
     */
    bindShape(shape, prop) {
        this.textInput.bind('text', (e,o,v)=>{
            const t = /**@type {eskv.TextInput}*/(o).text
            if(shape[prop]!==t) shape[prop] = t;
        });
        this.value = shape[prop];
        shape.bind(prop, (e,o,v)=>{this.value=shape[prop]});
    }
}

export class PropUINumber extends eskv.BoxLayout {
    constructor(props = {}) {
        super({orientation: 'horizontal'});
        this.label = new eskv.Label({align:'left', sizeGroup:'Config'});
        this.textInput = new eskv.TextInput({hints:{w:0.7, h:'0.04ah'}, _inputSanitizer: numberSanitizer, sizeGroup:'Config', on_value:(e,o,v)=>this.emit('value',this.value)});
        this.children = [this.label, this.textInput];
        this.updateProperties(props);
    }
    get value() {
        return parseFloat(this.textInput.text);
    }
    get text() {
        return this.label.text;
    }
    set value(value) {
        this.textInput.text = String(value);
    }
    set text(value) {
        this.label.text = value;
    }
    /**
     * @param {eskv.Widget} shape 
     * @param {string} prop 
     */
    bindShape(shape, prop) {
        this.textInput.bind('text', (e,o,v)=>{
            const t = /**@type {eskv.TextInput}*/(o).text
            if(shape[prop]!==t) shape[prop] = parseFloat(t);
        });
        this.value = shape[prop];
        shape.bind(prop, (e,o,v)=>{this.value=shape[prop]});
    }
}


export class PropUIBool extends eskv.BoxLayout {
    constructor(props = {}) {
        super({orientation: 'horizontal'});
        this.label = new eskv.Label({
            align:'left',
            sizeGroup:'Config'
        });
        this.checkbox = new eskv.CheckBox({on_check:(e,o,v)=>this.emit('value',this.value)});
        this.children = [this.label, this.checkbox]
        this.updateProperties(props);
    }
    get value() {
        return this.checkbox.check;
    }
    set value(value) {
        this.checkbox.check = value;
    }
    get text() {
        return this.label.text;
    }
    set text(value) {
        this.label.text = value;
    }
    /**
     * @param {eskv.Widget} shape 
     * @param {string} prop 
     */
    bindShape(shape, prop) {
        this.checkbox.bind('check', (e,o,v)=>{
            const c = /**@type {eskv.CheckBox}*/(o).check;
            if(shape[prop]!==c) shape[prop] = c
        });
        this.value = shape[prop];
        shape.bind(prop, (e,o,v)=>{this.value=shape[prop]});
    }
}

export class Dash extends eskv.Widget {
    /**@type {number[]|null} */
    lineDash = null;
    lineWidth = 0.1;
    /**@type {eskv.Widget['draw']} */
    draw(app, ctx) {
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = this.lineWidth;
        const oldDash = ctx.getLineDash();
        if(this.lineDash) ctx.setLineDash(this.lineDash);
        ctx.moveTo(this.x, this.center_y);
        ctx.lineTo(this.right, this.center_y);
        ctx.stroke();
        ctx.setLineDash(oldDash);
    }
}

function parseSpaceSeparatedNumbers(inputString) {
    const numberStrings = inputString.split(' ');
    const numbers = numberStrings.map((numStr) => {
      const num = parseFloat(numStr);
      return isNaN(num)? null:num;
    });
    return numbers.filter((num) => num !== null);
  }

export class PropUIStrokeDash extends eskv.BoxLayout {
    constructor(props = {}) {
        super({orientation: 'horizontal'});
        this.label = new eskv.Label({align:'left', sizeGroup:'Config'});
        this.textInput = new eskv.TextInput({
            color: 'white',
            sizeGroup:'Config',
            on_text: (e,o,v) => {
                let val = parseSpaceSeparatedNumbers(v);
                const setVal = val.length===0? null : val;
                if(setVal!==o.parent.value) o.parent.value = setVal;
            },
        });
        this.textInput._inputSanitizer = (text, textInput) => {
            let val = parseSpaceSeparatedNumbers(text);
            if(val.length===0) return '-';
            return text;
        }
        this.dash = new Dash({hints:{w:0.5, h:'0.04ah'}, 
            on_lineDash: (e,o,v)=>{
                if(o.lineDash===null) {
                    this.textInput.text = '-';
                    return;
                }
                const text = o.lineDash.join(' ')
                if(this.textInput.text !== text) this.textInput.text = text;
                this.emit('value', this.value);
            }
        });
        this.children = [this.label, this.textInput, this.dash];
        this.updateProperties(props);
    }
    get text() {
        return this.label.text;
    }
    set text(value) {
        this.label.text = value;
    }
    get value() {
        return this.dash.lineDash;
    }
    set value(value) {
        this.dash.lineDash = value;
    }
    /**
     * Prop will be 'fillColor' or 'lineColor'
     * @param {eskv.Widget} shape 
     * @param {string} prop 
     */
    bindShape(shape, prop) {
        this.dash.bind('lineDash', (e,o,v)=>{
            const d = /**@type {Dash}*/(o).lineDash;
            if(shape[prop]!==d) shape[prop] = d;
        });
    }
}

class BaseConfig extends eskv.BoxLayout {
    constructor(props = {}) {
        super({orientation:'vertical', spacingY:'0.005ah'});
        this.id = new PropUIString({text:'Name'});
        this.fillColor = new PropUIString({text: 'Fill RGB'});
        this.strokeColor = new PropUIString({text: 'Stroke RGB'});
        this.lineWidth = new PropUISliderNumber({text:'St. width', min:0.01, max:null});
        this.lineDash = new PropUIStrokeDash({text:'St. dash'});
        this.close = new PropUIBool({text:'St. closed'});
        this.strokeAlpha = new PropUISliderAlpha({text:'St. alpha'});
        this.fillAlpha = new PropUISliderAlpha({text:'Fl. alpha'});
        this.txScaleX = new PropUISliderNumberWithDefault({text:'Tx. X', min:0.01, max:null, default:1.0});
        this.txScaleY = new PropUISliderNumberWithDefault({text:'Tx. Y', min:0.01, max:null, default:1.0});
        this.txAngle = new PropUISliderNumberWithDefault({text:'Tx. Angle', min:-2*Math.PI, max:2*Math.PI, value:0, default:0});
        let mode = QDraw.get().controlSurface.mode==='Edit'? 'Done':'Edit';
        this.hbox = new eskv.BoxLayout({ orientation:'horizontal',
            children: [
                new eskv.Button({text: mode, sizeGroup:'Config',
                    on_press: (e,o,v)=> {
                        if(o.text==='Edit') {
                            QDraw.get().controlSurface.mode = 'Edit';
                            o.text = 'Done';
                        }
                        else if(o.text==='Done') {
                            QDraw.get().controlSurface.mode = 'Move';
                            o.text = 'Edit';
                        }
                    }, 
                }),
                new eskv.Button({text:'Delete', sizeGroup:'Config',
                    on_press: (e,o,v)=> {
                        let ch = QDraw.get().shapeConfig.shape;
                        if(ch!==null) {
                            QDraw.get().drawing.removeChild(ch);
                        }
                    }, 
                }),
            ],
        });
        this.children = [
            new eskv.Label({text: 'Configure shape', align:'left', fontSize:'0.015ah', hints:{h:'0.02ah'}}),
            this.hbox,
            this.id,
            this.strokeColor,
            this.strokeAlpha,
            this.fillColor,
            this.fillAlpha,
            this.lineWidth,
            this.lineDash,
            this.close,
            this.txScaleX,
            this.txScaleY,
            this.txAngle,
        ];
    }
    /**
     * 
     * @param {eskv.Widget} sh 
     */
    bindShape(sh) {
        if(!(sh instanceof QShape)) return;
        this.id.value = sh.id;
        this.lineWidth.value = sh.lineWidth;
        this.lineDash.value = sh.lineDash;
        this.close.value = sh.close;
        this.strokeAlpha.value = typeof sh.lineColor==='string' ? eskv.color.Color.fromString(sh.lineColor).a : 1;
        this.fillAlpha.value = typeof sh.fillColor==='string' ? eskv.color.Color.fromString(sh.fillColor).a : 1;
        this.txScaleX.value = sh.txScaleX;
        this.txScaleY.value = sh.txScaleY;
        this.txAngle.value = sh.txAngle;
        this.id.bindShape(sh,'id');
        this.lineWidth.bindShape(sh, 'lineWidth');
        this.lineDash.bindShape(sh, 'lineDash');
        this.close.bindShape(sh, 'close');
        this.strokeColor.bindShape(sh, 'lineColor');
        this.fillColor.bindShape(sh, 'fillColor');
        this.strokeAlpha.bindShape(sh, 'lineColor');
        this.fillAlpha.bindShape(sh, 'fillColor');
        this.txScaleX.bindShape(sh, 'txScaleX');
        this.txScaleY.bindShape(sh, 'txScaleY');
        this.txAngle.bindShape(sh, 'txAngle');
        sh.bind('txScaleX', (e,o,v)=> {
            if(this.txScaleX.value !== v) {
                this.txScaleX.value = v;
                // this.txScaleX.slider.updateMax();
                QDraw.get().controlSurface.updatePoints()
            }
        }, this);
        sh.bind('txScaleY', (e,o,v)=> {
            if(this.txScaleY.value !== v) {
                this.txScaleY.value = v;
                // this.txScaleY.slider.updateMax();
                QDraw.get().controlSurface.updatePoints()
            }
        }, this);
        sh.bind('txAngle', (e,o,v)=> {
            if(this.txAngle.value !== v) {
                this.txAngle.value = v;
                QDraw.get().controlSurface.updatePoints()
            }
        }, this);
    }
}

class GroupConfig extends eskv.BoxLayout {
    constructor(props = {}) {
        super({orientation:'vertical', spacingY:'0.005ah'});
        this.id = new PropUIString({text:'ID'});
        this.txScaleX = new PropUISliderNumberWithDefault({text:'Tx. X', min:0.01, max:null, default:1.0});
        this.txScaleY = new PropUISliderNumberWithDefault({text:'Tx. Y', min:0.01, max:null, default:1.0});
        this.txAngle = new PropUISliderNumberWithDefault({text:'Tx. Angle', min:-2*Math.PI, max:2*Math.PI, value:0, default:0});
        this.ungroup = new eskv.Button({text:'Ungroup', sizeGroup:'Config',
            on_press: (e,o,v)=> {
                let gr = QDraw.get().shapeConfig.shape;
                if(gr===null) return;
                QDraw.get().drawing.removeChild(gr);
                for(let ch of gr.children) {
                    QDraw.get().drawing.addChild(ch);
                }
                QDraw.get().controlSurface.selection = new Set(/**@type QShape[]*/(gr.children));
            }, 
        });
        this.delete = new eskv.Button({text:'Delete',  sizeGroup:'Config',
            on_press: (e,o,v)=> {
                let ch = QDraw.get().shapeConfig.shape;
                if(ch!==null) QDraw.get().drawing.removeChild(ch);
            }, 
        });
        this.children = [
            new eskv.Label({text: 'Configure group', align:'left', fontSize:'0.015ah', hints:{h:'0.02ah'}}),
            this.id,
            this.txScaleX,
            this.txScaleY,
            this.txAngle,
            this.ungroup,
            this.delete,
        ];
    }
    /**
     * 
     * @param {eskv.Widget} sh 
     */
    bindShape(sh) {
        this.id.bindShape(sh,'id');
        this.txScaleX.bindShape(sh, 'txScaleX');
        this.txScaleY.bindShape(sh, 'txScaleY');
        this.txAngle.bindShape(sh, 'txAngle');
        sh.bind('txScaleX', (e,o,v)=> {
            if(this.txScaleX.value !== v) {
                this.txScaleX.value = v;
                // this.txScaleX.slider.updateMax();
                QDraw.get().controlSurface.updatePoints()
            }
        })
        sh.bind('txScaleY', (e,o,v)=> {
            if(this.txScaleY.value !== v) {
                this.txScaleY.value = v;
                // this.txScaleY.slider.updateMax();
                QDraw.get().controlSurface.updatePoints()
            }
        })
        sh.bind('txAngle', (e,o,v)=> {
            if(this.txAngle.value !== v) {
                this.txAngle.value = v;
                QDraw.get().controlSurface.updatePoints()
            }
        })
    }
}

class TextConfig extends BaseConfig {
    constructor(props = {}) {
        super({orientation:'vertical'});
        this.text = new PropUIString({text:'Content'});
        this.addChild(this.text);
    }
    /**
     * 
     * @param {QText} sh 
     */
    bindShape(sh) {
        super.bindShape(sh);
        const ch = /**@type {eskv.TextInput}*/(sh.children[0]);
        this.text.bindShape(ch, 'text');
        sh.children[0].bind('text', (e,o,v)=> {if(this.text.value !== v) this.text.value = v;})
    }

}

export class DrawingConfig extends eskv.BoxLayout{
    constructor() {
        // TODO: scaleShapesToFit, grids/guides?
        super({orientation:'vertical'});//, spacingY:'0.005ah'
        this.id = new PropUIString({text:'Name'});
        this.id.textInput.ignoreSizeForGroup = true;
        this.id.textInput.clip = true;
        this.fillColor = new PropUIString({text: 'Fill RGB'});
        this.strokeColor = new PropUIString({text: 'Stroke RGB'});
        this.lineWidth = new PropUISliderNumber({text:'St. width', min:0.01, max:null});
        this.lineDash = new PropUIStrokeDash({text:'St. dash'});
        this.strokeAlpha = new PropUISliderAlpha({text:'St. alpha'});
        this.fillAlpha = new PropUISliderAlpha({text:'Fl. alpha'});
        this.tileWidth = new PropUIString({text: 'Width (tiles)'});
        this.tileWidth.textInput.hints.w = 0.15;
        this.tileHeight = new PropUIString({text: 'Height (tiles)'});
        this.tileHeight.textInput.hints.w = 0.15;
        this.pixelsPerTile = new PropUIString({text: 'Tile size (px)'})
        this.pixelsPerTile.textInput.hints.w = 0.15;
        this.hbox = new eskv.BoxLayout({ orientation:'horizontal',
            children: [
                new eskv.Button({text: 'Resize to shapes', sizeGroup:'Config',
                    on_press: (e,o,v)=> {
                        const drawing = QDraw.get().drawing;
                        if(drawing.children.length>0) {
                            const ext = drawing.getExtents();
                            drawing.translateNodes(-ext[0],-ext[1]);
                            let drawingView = QDraw.get().drawingScrollView.children[0];
                            drawingView.w = ext[2];
                            drawingView.h = ext[3];
                        }
                    }, 
                }),
            ],
        });
        this.children = [
            new eskv.Label({text: 'Configure drawing', align:'left', fontSize:'0.015ah', hints:{h:'0.02ah'}}),
            this.hbox,
            this.id,
            this.strokeColor,
            this.strokeAlpha,
            this.fillColor,
            this.fillAlpha,
            this.lineWidth,
            this.lineDash,
            this.tileWidth,
            this.tileHeight,
            this.pixelsPerTile,
        ];
    }
    /**
     * 
     * @param {QShape} sh 
     */
    bindShape(sh) {
        this.id.bindShape(sh,'id');
        this.lineWidth.bindShape(sh, 'lineWidth');
        this.lineDash.bindShape(sh, 'lineDash');
        this.strokeColor.bindShape(sh, 'lineColor');
        this.fillColor.bindShape(sh, 'fillColor');
        this.strokeAlpha.bindShape(sh, 'lineColor');
        this.fillAlpha.bindShape(sh, 'fillColor');
        const drawingWidget = QDraw.get().drawingScrollView.children[0];
        this.tileWidth.bindShape(drawingWidget, 'w');
        this.tileHeight.bindShape(drawingWidget, 'h');
        this.pixelsPerTile.bindShape(sh, 'pixelsPerTile');
    }
}

class ControlSurfaceConfig extends eskv.BoxLayout {
    constructor() {
        // TODO: scaleShapesToFit, grids/guides?
        super({orientation:'vertical'});//, spacingY:'0.005ah'
        this.visible = new PropUIBool({text:'Visible'});
        this.lineWidth = new PropUISliderNumber({text:'Line width', min:0.01, max:null});
        this.lineDash = new PropUIStrokeDash({text:'Line dash'});
        this.strokeAlpha = new PropUISliderAlpha({text:'Line alpha'});
        this.dimToDrawing = new PropUIBool({text:'Infinite'});
        this.offsetX = new PropUINumber({text: 'Offset X (tiles)'}); 
        this.offsetX.textInput.hints.w = 0.15;
        this.offsetY = new PropUINumber({text: 'Offset Y (tiles)'}); 
        this.offsetY.textInput.hints.w = 0.15;
        this.cellWidth = new PropUINumber({text: 'Cell width (tiles)'});
        this.cellWidth.textInput.hints.w = 0.15;
        this.cellHeight = new PropUINumber({text: 'Cell height (tiles)'});
        this.cellHeight.textInput.hints.w = 0.15;
        this.children = [
            new eskv.Label({text: 'Grid', align:'left', fontSize:'0.015ah', hints:{h:'0.02ah'}}),
            this.visible,
            this.lineWidth,
            this.lineDash,
            this.strokeAlpha,
            this.offsetX, 
            this.offsetY,
            this.cellWidth,
            this.cellHeight,
        ];
    }
    /**
     * 
     * @param {eskv.Widget} sh 
     */
    bindShape(sh) {
        if(!(sh instanceof QControlSurface)) return;
        this.visible.value = sh.gridVisible;
        this.lineWidth.value = sh.gridLineWidth;
        this.lineDash.value = sh.gridLineDash;
        this.cellWidth.value = sh.gridCellWidth;
        this.cellHeight.value = sh.gridCellHeight;
        this.offsetX.value = sh.gridOffsetX;
        this.offsetY.value = sh.gridOffsetY;
        this.strokeAlpha.value = eskv.color.Color.fromString(sh.gridLineColor).a;

        this.visible.bindShape(sh, 'gridVisible');
        this.lineWidth.bindShape(sh, 'gridLineWidth');
        this.lineDash.bindShape(sh, 'gridLineDash');
        this.strokeAlpha.bindShape(sh, 'gridLineColor');
        this.cellWidth.bindShape(sh, 'gridCellWidth');
        this.cellHeight.bindShape(sh, 'gridCellHeight');
        this.offsetX.bindShape(sh, 'gridOffsetX');
        this.offsetY.bindShape(sh, 'gridOffsetY');
    }
}

export class QConfigArea extends eskv.BoxLayout {
    /** @type {eskv.Widget|null} */
    shape = null;
    id = 'ShapeConfig';
    constructor(properties) {
        super();
        if (properties) this.updateProperties(properties)
        this.shape = null;
    }
    /** @type {import("../eskv/lib/modules/widgets.js").EventCallback} */
    csSelection(event, object, data) {
        if(data.size===1) {
            this.shape = [...data][0];
        } else {
            this.shape = null;
        }
        return false;
    }
    /** @type {import("../eskv/lib/modules/widgets.js").EventCallback} */
    on_shape(event, object, data) {
        let uiShape;
        if (data) {
            if(data instanceof QDrawing) uiShape = new DrawingConfig();
            else if(data instanceof QRectangle) uiShape = new BaseConfig();
            else if(data instanceof QCircle) uiShape = new BaseConfig();
            else if(data instanceof QText) uiShape = new TextConfig();
            else if(data instanceof QGeometric) uiShape = new BaseConfig();
            else if(data instanceof QGroup) uiShape = new GroupConfig();
            else if(data instanceof QImage) uiShape = new BaseConfig();
            else if(data instanceof QControlSurface) uiShape = new ControlSurfaceConfig();
            if (uiShape) {
                uiShape.bindShape(data);
                this.children = [uiShape];
                this._needsLayout = true;
            }
        }
        if(!uiShape) {
            const cs = QDraw.get().controlSurface;
            if(cs.selection.size===0) {
                this.children = [];
            } else { /**cs.selecttion.size>1 */
                this.children = [new eskv.BoxLayout({
                    hints: {x:0, y:0, w:1, h:1},
                    orientation: 'vertical',
                    children: [
                        new eskv.Label({
                            hints: {x:0, y:0, w:1, h:'0.04ah'},
                            text: `${cs.selection.size} shapes selected`,
                            sizeGroup:'Config',
                        }),
                        new eskv.Button({
                            text: 'Group',
                            sizeGroup:'Config',
                            on_press: (e,o,v) => {
                                const dr = QDraw.get().drawing;
                                const cs = QDraw.get().controlSurface
                                const sel = new Set(...cs.selection);
                                const drwShapes = /**@type {QShape[]}*/(dr.children)
                                const grpCh = drwShapes.filter(sh=>sel.has(sh));
                                const drwCh = drwShapes.filter(sh=>!sel.has(sh));
                                dr.children = drwCh;
                                const grp = addShape(QGroup, false);
                                grp.children = grpCh;
                                grp.updateExtents();
                                cs.updatePoints();
                            }
                        })
                    ]
                })];    

            }
        }
        return false;
    }
}
