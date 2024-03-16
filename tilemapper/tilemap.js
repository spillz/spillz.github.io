//@ts-check

import * as eskv from '../eskv/lib/eskv.js';
import { LayeredTileMap, SpriteSheet, TileMap, SpriteAnimation, SpriteWidget } from '../eskv/lib/modules/sprites.js';

/**@typedef {eskv.Vec2|[number, number]} VecLike */
/**@typedef {eskv.Rect|[number, number, number, number]} RectLike */

export class SpriteSheetSelector extends eskv.sprites.TileMap {
	activeCellIndex = 0;
	/**@type {eskv.Vec2|null} */
	activeCell = new eskv.Vec2([0,0]);
	transformedCellIndex = 0;
	_opos = new eskv.Vec2([0,0]);
	angle = 0;
	flipped = false;
	sheetDisplay = false;
	/**
	 * 
	 * @param {Object|null} props 
	 */
	constructor(props={}) {
		super();
		if(props) this.updateProperties(props);
	}
	on_angle(e,o,v) {
		this.calcTransformedCellIndex();
	}
	on_flipped(e,o,v) {
		this.calcTransformedCellIndex();
	}
	on_activeCell(e,o,v) {
		this.activeCellIndex = this.activeCell!==null?
			this.activeCell[1]*this.tileDim[0] + this.activeCell[0]:
			-1;
	}
	on_activeCellIndex(e,o,v) {
		this.calcTransformedCellIndex();
	}
	calcTransformedCellIndex() {
		if(this.spriteSheet===null || this.activeCell===null) return -1;
		this.transformedCellIndex = eskv.sprites.packSpriteInfo2D(/**@type {eskv.Vec2}*/(this.activeCell), this.flipped, this.angle, this.spriteSheet.len, this.spriteSheet.sw)
	}
	on_spriteSheet(e, o, v) {
		if(this.spriteSheet===null) return;
		this.tileDim = new eskv.Vec2([this.spriteSheet.sw, this.spriteSheet.sh]);
		eskv.App.get().bind('sheetLoaded', (e,o,v)=>this.on_sheetLoaded());
	}
	on_sheetLoaded(e, o, v) {
		if(this.spriteSheet===null) return;
		this.tileDim = new eskv.Vec2([this.spriteSheet.sw, this.spriteSheet.sh]);
		if(this.sheetDisplay) this.initMap();
	}
	initMap() {
		let i=0;
		for(let pos of this.data.iterAll()) {
			this.set(pos, i);
			i++;
		}
	}
    /**@type {eskv.Widget['draw']} */
	draw(app, ctx) {
        if(this.spriteSheet===null || this.spriteSheet.spriteSize<=0) return;
        if (!this.spriteSheet.sheet.complete || this.spriteSheet.sheet.naturalHeight == 0) return;
        const [tw, th] = this.tileDim;
		super.draw(app, ctx);

		if(this.activeCell!==null) {
			const lw = ctx.lineWidth;
			const style = ctx.strokeStyle;
			ctx.lineWidth = 1.0/this.spriteSheet.spriteSize;
			ctx.strokeStyle = 'yellow';
			ctx.beginPath();
			ctx.rect(this.activeCell.x+this.x, this.activeCell.y+this.y, 1, 1);
			ctx.stroke();
			ctx.lineWidth = lw;
			ctx.strokeStyle = style;	
		}
	}
	/**@type {eskv.Widget['on_touch_down']} */
	on_touch_down(evt, obj, touch) {
		if(this.collide(touch.rect)) {
			touch.grab(this);
			this._opos = touch.pos;
			return true;
		}
		return false;
	}
	/**@type {eskv.Widget['on_touch_move']} */
	on_touch_move(evt, obj, touch) {
		if(touch.grabbed===this && touch.pos.dist(this._opos)>=0.1) {
			touch.grab(this.parent);
			return true;
		}
		return false;
	}
	/**@type {eskv.Widget['on_touch_up']} */
	on_touch_up(evt, obj, touch) {
		if(touch.grabbed===this) {
			this.activeCell = new eskv.Vec2([Math.floor(touch.pos[0]-this.x), Math.floor(touch.pos[1]-this.y)]);
			touch.ungrab();
			return true;
		}
		return false;
	}
}

export class TileMapPainter extends LayeredTileMap {
	brush = 1;
	/**@type {VecLike|null} */
	oldActiveCell = null; 
	/**@type {VecLike|null} */
	activeCell = null;
	angle = 0;
	flipped = false;
	outlineColor = 'rgba(128,128,128,0.5)'
	constructor(props = {}) {
		super();
		if(props) this.updateProperties(props);
		eskv.App.get().bind('sheetLoaded', (e,o,v)=>this.clearCache());
	}
	get tileW() {
		return this.tileDim[0];
	}
	set tileW(value) {
		this.tileDim = new eskv.Vec2([value, this.tileDim[1]]);
	}
	get tileH() {
		return this.tileDim[1];
	}
	set tileH(value) {
		this.tileDim = new eskv.Vec2([this.tileDim[0], value]);
	}
	get transformedCellIndex() {
		if(this.spriteSheet===null || this.activeCell===null) return -1;
		return eskv.sprites.packSpriteInfo2D(/**@type {eskv.Vec2}*/(this.activeCell), this.flipped, this.angle, this.spriteSheet.len, this.spriteSheet.sw)
	}
    /**@type {eskv.Widget['draw']} */
	draw(app, ctx) {
		if(this.spriteSheet===null) return;
		super.draw(app, ctx);
		if(this.activeCell) {
			const lw = ctx.lineWidth;
			const style = ctx.strokeStyle;
			ctx.lineWidth = 1.0/this.spriteSheet.spriteSize;
			ctx.strokeStyle = 'yellow';
			ctx.beginPath();
			if(this.oldActiveCell) {
				const x = Math.min(this.activeCell[0],this.oldActiveCell[0]);
				const y = Math.min(this.activeCell[1],this.oldActiveCell[1]);
				const w = Math.abs(this.activeCell[0]-this.oldActiveCell[0]); 
				const h = Math.abs(this.activeCell[1]-this.oldActiveCell[1]);
				ctx.rect(x+this.x, y+this.y, w+1, h+1);				
			} else {
				ctx.rect(this.activeCell[0]+this.x, this.activeCell[1]+this.y, 1, 1);				
			}
			ctx.stroke();
			ctx.lineWidth = lw;
			ctx.strokeStyle = style;	
		}
	}
	/**@type {eskv.Widget['on_touch_down']} */
	on_touch_down(evt, obj, touch) {
		if(this.collide(touch.rect)) {
			this.activeCell = new eskv.Vec2([Math.floor(touch.pos[0]-this.x), Math.floor(touch.pos[1]-this.y)]);
			this.oldActiveCell = this.activeCell;
			touch.grab(this);
			return true;
		}
		this.oldActiveCell = null;
		return false;
	}
	/**@type {eskv.Widget['on_touch_move']} */
	on_touch_move(evt, obj, touch) {
		if(touch.grabbed===this) {
			this.activeCell = new eskv.Vec2([Math.floor(touch.pos[0]-this.x), Math.floor(touch.pos[1]-this.y)]);
			return true;
		}
		this.oldActiveCell = null;
		return false;
	}
	/**@type {eskv.Widget['on_touch_up']} */
	on_touch_up(evt, obj, touch) {
		if(touch.grabbed===this) {
			if(this.activeCell && this.spriteSheet) {
				const sw = Math.floor(this.spriteSheet.sheet.width/this.spriteSheet.spriteSize);
				const sh = Math.floor(this.spriteSheet.sheet.height/this.spriteSheet.spriteSize);
				const len = sw*sh;		
				const brush = eskv.sprites.packSpriteInfo(this.brush, this.flipped, this.angle, len);
				const pos = this.activeCell;
				if(this.oldActiveCell) {
					const x = Math.min(this.activeCell[0],this.oldActiveCell[0]);
					const y = Math.min(this.activeCell[1],this.oldActiveCell[1]);
					const w = Math.abs(this.activeCell[0]-this.oldActiveCell[0]); 
					const h = Math.abs(this.activeCell[1]-this.oldActiveCell[1]);
					const rect = new eskv.Rect([x,y,w+1,h+1]);
					for(let pos of this.data.iterRect(rect)) {
						this.set(pos, brush);
					}
				} else {
					this.set(pos, brush);
				}	
			}
			this.oldActiveCell = this.activeCell;
			touch.ungrab();
			return true;
		}
		return false;
	}
}

export class PainterUI extends eskv.BoxLayout {
	/**@type {SpriteSheet|null} */
	spriteSheet = null;
	constructor(props={}) {
		super({orientation:'vertical'});
		this.painter = new TileMapPainter({tileDim:[20,20], hints:{w:null, h:null}, w:20,h:20, outlineColor:'white'});
		this.scrollView = new eskv.ScrollView({children: [this.painter], uiZoom:false});
		this.overview = new eskv.BoxLayout({
			hints: {h:'1'},
			orientation: 'horizontal',
			children: [
				new eskv.Label({text: 'Tilemap size: ', hints:{w:null}}),
				new eskv.TextInput({text: '20', id:'tileW', hints:{w:null},  on_focus:(e,o,v)=>{
					if(!v) this.painter.tileW=parseInt(o.text);
				}}),
				new eskv.Label({text: ' X ', hints:{w:null}}),
				new eskv.TextInput({text: '20', id:'tileH', hints:{w:null}, on_focus:(e,o,v)=>{
					if(!v) this.painter.tileH=parseInt(o.text);
				}}),
				new eskv.Button({text:'Add layer', on_press:(e,o,v)=>{
					this.addLayer();
				}}),
				new eskv.Button({text:'Remove layer', on_press:(e,o,v)=>{
					this.removeLayer();
				}}),
				new eskv.Button({text:`Zoom: 1x`, on_press:(e,o,v)=>{
					const zoom = Math.floor(this.scrollView.zoom + 1);
					this.scrollView.zoom = zoom<=4? zoom:0.5;
					o.text = `Zoom: ${this.scrollView.zoom}`
				}}),
			]
		});
		this.showCheck = new eskv.CheckBox({check:true, hints:{w:'1h'},
		on_check:(e,o,v)=>{
			this.painter.layer[this.painter.activeLayer].hidden = !v;
		}}),
		this.buttonBox = new eskv.BoxLayout({
			hints: {h:'1'},
			orientation: 'horizontal',
			children: [
				new eskv.Label({text:'Shown', hints:{w:null}}),
				this.showCheck,
				new eskv.ToggleButton({text:`Layer1`, hints:{w:null}, press:true, group: 'painterButtonGroup', 
				on_press:(e,o,v)=>{
					this.painter.activeLayer=0;
					this.showCheck.check = !this.painter.layer[this.painter.activeLayer].hidden;
				}}),
			],
		});
		this.children = [
			this.overview,
			this.buttonBox,
			this.scrollView,
		];
		if(props) this.updateProperties(props);
	}
	/**@type {import('../eskv/lib/modules/widgets.js').EventCallbackNullable} */
	on_spriteSheet(e, o, v) {
		this.painter.spriteSheet = this.spriteSheet;
	}
	addLayer() {
		this.painter.numLayers+=1;
		const i = this.buttonBox.children.length-2;
		const b = new eskv.ToggleButton({text:`Layer${i+1}`, hints:{w:null}, group: 'painterButtonGroup'})
		b.bind('press', (e,o,v)=>{
			this.painter.activeLayer=i;
			this.showCheck.check = !this.painter.layer[this.painter.activeLayer].hidden;
		});
		this.buttonBox.addChild(b);
	}
	removeLayer() {
		if(this.painter.activeLayer>=0) {
			const i = this.painter.activeLayer;
			const children = this.buttonBox.children.slice()
			children.splice(i+2,1);
			this.buttonBox.children = children;
			this.painter._layerData.splice(i,1);
			this.painter.numLayers--;
			const b = /**@type {eskv.ToggleButton}*/(this.buttonBox.children[2+this.painter.activeLayer]);
			b.press = true	
		}
	}
}

export class AnimatorUI extends eskv.BoxLayout {
	/**@type {SpriteSheet|null} */
	spriteSheet = null;
	brush = 5;
	angle = 0;
	flipped = false;
	constructor(props={}) {
		super({orientation:'vertical'});
		this.animationsBox = new eskv.BoxLayout();
		this.toolbar = new eskv.BoxLayout({
			hints: {h:'1'},
			orientation: 'horizontal',
			children: [
				new eskv.Button({text: 'New', on_press:(e,o,v)=>{
					if(this.spriteSheet===null) return;
					let a=-2;
					while(true) {
						if(!this.spriteSheet.animations.has(a)) break;
						--a;
					}
					const anim = new SpriteAnimation();
					anim.frames = [this.brush];
					this.spriteSheet.animations.set(a, anim);
					this.animationsBox.addChild(this.addAnimationControls(a, anim));
				}}),
			],
		});
		this.children = [
			this.toolbar,
			new eskv.ScrollView({
				children: [this.animationsBox]
			})
		];
		if(props) this.updateProperties(props);
	}
	/**@type {import('../eskv/lib/modules/widgets.js').EventCallbackNullable} */
	on_spriteSheet(e, o, v) {
		this.updateAnimations();
	}
	updateAnimations() {
		if(this.spriteSheet===null) return;
		const anims = [];
		for(const a of this.spriteSheet.animations.keys()) {
			const anim = /**@type {SpriteAnimation}*/(this.spriteSheet.animations.get(a));
			const hbox = this.addAnimationControls(a, anim);
			anims.push(hbox);
		}
		this.animationsBox.children = anims;
	}
	/**
	 * 
	 * @param {number} a
	 * @param {SpriteAnimation} anim 
	 */
	addAnimationControls(a, anim) {
		const sw = new SpriteWidget({spriteSheet:this.spriteSheet, hints:{w:null, h:null}, w:1, h:1});
		const ts = new SpriteSheetSelector({spriteSheet: this.spriteSheet, hints:{w:null, h:null},
			on_activeCell:(e,o,v)=>{
				if(!this.spriteSheet) return;
				const brush = eskv.sprites.packSpriteInfo(this.brush>=0?this.brush:-1,this.flipped, this.angle, this.spriteSheet.len);
				/**@type {SpriteSheetSelector}*/(o).set(v, brush);
				anim.frames[v[0]] = brush;
				sw.frames[v[0]] = brush;
				this._needsLayout = true;			
			}
		});
		ts.tileDim = new eskv.Vec2([anim.frames.length,1]);
		const frames = anim.frames.slice();
		if(frames.length===0) frames.push(this.brush);
		anim.frames = frames;
		ts._data.length=0;
		for(let f of frames) ts._data.push(f);
		sw.frames= [...frames];
		sw.timePerFrame = anim.timePerFrame;
		const hbox = new eskv.BoxLayout({orientation:'horizontal', hints:{h:'1'}, key:a, children:[
			sw,
			ts,
			new eskv.Button({text:' - ', hints:{w:null}, on_press:(e,o,v)=>{
				if(ts.tileDim[0]>1) {
					ts.tileDim = new eskv.Vec2([ts.tileDim[0]-1,1]);
					if(!this.spriteSheet) return;
					const brush = eskv.sprites.packSpriteInfo(this.brush>=0?this.brush:-1,this.flipped, this.angle, this.spriteSheet.len);
					const pos = ts.activeCell!==null?ts.activeCell[0]:-1;
					anim.frames.splice(pos,1);
					sw.frames.splice(pos,1);
					ts._data.length=0;
					for(let f of sw.frames) ts._data.push(f);
					this._needsLayout = true;
					this.emit('animationEdited', a);	
				}
			}}),
			new eskv.Button({text:' + ', hints:{w:null}, on_press:(e,o,v)=>{
				ts.tileDim = new eskv.Vec2([ts.tileDim[0]+1,1]);
				if(!this.spriteSheet) return;
				const b = eskv.sprites.packSpriteInfo(this.brush>=0?this.brush:-1,this.flipped, this.angle, this.spriteSheet.len);
				anim.frames.push(b);
				sw.frames.push(b);
				ts.set([ts.tileDim[0]-1, 0], this.brush);
				this._needsLayout = true;
				this.emit('animationEdited', a);
			}}),
			new eskv.Label({text:' ms: ', hints:{w:null}}),
			new eskv.TextInput({text:String(anim.timePerFrame), hints:{w:null}, on_focus:(e,o,v)=>{
				if(!v) {
					const tpf = parseInt(o.text);
					anim.timePerFrame = tpf;
					sw.timePerFrame = tpf;
					this._needsLayout = true;
					this.emit('animationEdited', a);
				}
			}}),
			new eskv.Button({text:' X ', hints:{w:null}, on_press:(e,o,v)=>this.deleteAnimation(a)}),
		]});
		this.emit('animationAdded', a);
		return hbox;
	}
	/**
	 * 
	 * @param {number} a
	 */
	deleteAnimation(a) {
		if(this.spriteSheet===null) return;
		const children = this.animationsBox.children.slice();
		//@ts-ignore
		const ind = children.findIndex((w)=>(w.key)===a);
		if(ind>=0) {
			children.splice(ind,1);
			this.animationsBox.children = children;
			this.spriteSheet.animations.delete(a);
			this.emit('animationDeleted', a);
			this._needsLayout = true;
		}
	}
}

export class TilestampUI extends eskv.BoxLayout {
	/**@type {SpriteSheet|null} */
	spriteSheet = null;
	stampID = '';
	constructor(props={}) {
		super({orientation:'vertical'});
		this.painter = new TileMapPainter({tileDim:[20,20], hints:{w:null, h:null}, w:20,h:20});
		this.overview = new eskv.BoxLayout({
			hints: {h:'1'},
			orientation: 'horizontal',
			children: [
				new eskv.Label({text: 'Stamp size: ', hints:{w:null}}),
				new eskv.TextInput({text: '20', id:'tileW', hints:{w:null},  on_focus:(e,o,v)=>{this.painter.tileW=parseInt(o.text)}}),
				new eskv.Label({text: ' X ', hints:{w:null}}),
				new eskv.TextInput({text: '20', id:'tileH', hints:{w:null}, on_focus:(e,o,v)=>{this.painter.tileH=parseInt(o.text)}}),
				new eskv.Label({text: ' ID: ', hints:{w:null}}),
				new eskv.TextInput({text: '', id:'stampID', hints:{w:null}, on_focus:(e,o,v)=>{this.stampID=v}}),
				new eskv.Button({text: 'Save', hints:{w:null}}),
			]
		});
		this.children = [
			this.overview,
			new eskv.ScrollView({
				children: [this.painter]
			})
		];
		if(props) this.updateProperties(props);
	}
	/**
	 * Retrieves the Tilestamp specified in `stampID` from the `spriteSheet`
	 */
	loadStamp() {
		const stamp = this.spriteSheet?.tileStamps.get(this.stampID);
		if(stamp && stamp.shape) {
			this.painter.tileDim = new eskv.Vec2(stamp?.shape);
			stamp.place(new eskv.Vec2([0,0]), this.painter);
		}
	}
	/**
	 * Stores the Tilestamp specified in `stampID` from the `spriteSheet`
	 */
	saveStamp() {
		const stamp = this.spriteSheet?.tileStamps.get(this.stampID);
		if(stamp && stamp.shape) {
			stamp.set(new eskv.Rect([0, 1, this.painter.tileDim[0], this.painter.tileDim[1]]), this.painter)
		}
		
	}
	/**@type {import('../eskv/lib/modules/widgets.js').EventCallbackNullable} */
	on_spriteSheet(e, o, v) {
		this.painter.spriteSheet = this.spriteSheet;
	}
	/**@type {import('../eskv/lib/modules/widgets.js').EventCallbackNullable} */
	on_stampID(e, o, v) {
		this.loadStamp();
	}
}

export class AutoTilerUI extends eskv.BoxLayout {
	/**@type {SpriteSheet|null} */
	spriteSheet = null;
	autoTilerID = '';
	numFrames = 16;
	constructor(props={}) {
		super({orientation:'vertical'});
		this.painter = new TileMapPainter({tileDim:[this.numFrames,1], hints:{w:null, h:null}, w:20,h:1});
		this.overview = new eskv.BoxLayout({
			hints: {h:'1'},
			orientation: 'horizontal',
			children: [
				new eskv.Label({text: 'ID: ', hints:{w:null}}),
				new eskv.TextInput({text: '', id:'autoTilerID', hints:{w:null}, on_focus:(e,o,v)=>{this.autoTilerID=o.text}}),
			],
		});
		this.showCheck = new eskv.CheckBox({check:true, hints:{w:'1h'},
		on_check:(e,o,v)=>{
			this.painter.layer[this.painter.activeLayer].hidden = !v;
		}}),
		this.children = [
			this.overview,
			new eskv.ScrollView({
				children: [this.painter]
			})
		];
		if(props) this.updateProperties(props);
	}
	/**@type {import('../eskv/lib/modules/widgets.js').EventCallbackNullable} */
	on_spriteSheet(e, o, v) {
		this.painter.spriteSheet = this.spriteSheet;
	}
}
