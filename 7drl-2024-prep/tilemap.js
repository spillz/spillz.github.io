//@ts-check

import * as eskv from '../eskv/lib/eskv.js';
import { SpriteSheet } from '../eskv/lib/modules/sprites.js';

/**@typedef {eskv.Vec2|[number, number]} VecLike */
/**@typedef {eskv.Rect|[number, number, number, number]} RectLike */

export class TileMap extends eskv.Widget {
    tileW = 1;
    tileH = 1;
    /** @type {SpriteSheet|null} */
    spriteSheet = null;
    spriteSrc = '';
    spriteSize = 16;
    _data = [0];
    /**
     * 
     * @param {Object|null} properties
     */
	constructor(properties={}) {
        super(properties)
        if(properties!==null) {
            this.updateProperties(properties);
        }
	}
    /**
     * 
     * @param {string} evt 
     * @param {eskv.Widget} obj 
     * @param {string} val 
     */
    on_spriteSrc(evt, obj, val) {
        if(this.spriteSrc!=='') this.spriteSheet = new SpriteSheet(this.spriteSrc, this.spriteSize);
    }
    on_spriteSize(evt, obj, val) {
        if(this.spriteSheet) this.spriteSheet.spriteSize = this.spriteSize;
    }
    on_tileW(evt, obj, val) {
        this._data = new Array(this.tileW*this.tileH).fill(0);
    }
    on_tileH(evt, obj, val) {
        this._data = new Array(this.tileW*this.tileH).fill(0);
    }
    /**
     * Return the index value of the tilemap at position `pos`
     * @param {VecLike} pos 
     * @returns 
     */
	get(pos) {
        return this._data[pos[0]+pos[1]*this.tileW];
	}
    /**
     * Set the index value of the tilemap at position `pos`
     * @param {VecLike} pos 
     * @param {number} val 
     */
	set(pos, val) {
		this._data[pos[0]+pos[1]*this.tileW] = val;
	}
    /**
     * Iterate a cells in the line between `pos1` and `pos2`
     * @param {VecLike} pos1 
     * @param {VecLike} pos2
     * @yields {[number, number]}
     */
	*iterBetween(pos1, pos2){
		var x1,y1,x2,y2;
		[x1,y1] = pos1;
		[x2,y2] = pos2;
		if(Math.abs(y2 - y1) == 0 && Math.abs(x2 - x1) == 0) {
			return ;
		}
		if(Math.abs(y2 - y1) > Math.abs(x2 - x1)) {
			var slope = (x2 - x1) / (y2 - y1);
			if(y1 > y2) {
				[y1,y2] = [y2, y1];
				[x1,x2] = [x2, x1];
			}
			for(var y = y1 + 1; y < y2; y++) {
				var x = Math.round((x1 + (y - y1) * slope));
				yield /** @type {[number, number]}*/([x, y]);
			}
		}
		else {
			var slope = (y2 - y1) / (x2 - x1);
			if(x1 > x2) {
				[y1,y2] = [y2, y1];
				[x1,x2] = [x2, x1];
			}
			for(var x = x1 + 1; x < x2; x++) {
				var y = Math.round((y1 + (x - x1) * slope));
				yield /** @type {[number, number]}*/([x, y]);
			}
		}
	}
    /**
     * Iterate over cells in the line between `pos1` and `pos2` that match a tile index values in `types`
     * @param {VecLike} pos1 
     * @param {VecLike} pos2 
     * @param {number[]} types 
     */
	*iterTypesBetween(pos1, pos2, types) {
		for(var pos of this.iterBetween(pos1, pos2)) {
			if(types.includes(this.get(pos))) {
				yield pos;
			}
		}
	}
    /**
     * Returns true if the any of the index values in types are on the line between `pos1` and `pos2`
     * @param {VecLike} pos1 
     * @param {VecLike} pos2 
     * @param {number[]} types 
     */
	hasTypesBetween(pos1, pos2, types) {
		for(var pos of this.iterTypesBetween(pos1, pos2, types)) {
			return true;
		}
		return false;
	}
    /**
     * 
     * @param {RectLike|null} sub_rect 
     */
	*iterAll(sub_rect=null) {
		if(sub_rect !== null) {
			for(var y = sub_rect [1]; y < Math.min(this.tileH, sub_rect [1] + sub_rect [3]); y++) {
				for(var x = sub_rect [0]; x < Math.min(this.tileW, sub_rect [0] + sub_rect [2]); x++) {
                    yield /** @type {[number, number]}*/([x, y]);
				}
			}
		}
		else {
			for(var y = 0; y < this.tileH; y++) {
				for(var x = 0; x < this.tileW; x++) {
                    yield /** @type {[number, number]}*/([x, y]);
				}
			}
		}
	}
    /**
     * 
     * @param {number[]} types 
     * @param {RectLike} sub_rect 
     */
	*iterTypes(types, sub_rect) {
		for(var pos of this.iterAll(sub_rect)) {
			if(types.includes(this.get(pos))) {
				yield pos;
			}
		}
	}
    /**
     * Iterate over positions in the circular range of `radius`
     * @param {VecLike} pos 
     * @param {number} radius 
     */
	*iterInRange(pos, radius) {
		var x, y;
		[x, y] = pos;
		if(radius == null) radius = 3;
		var rad = Math.ceil(radius);
		for(var yoff = -(rad); yoff < rad + 1; yoff++) {
			for(var xoff = -(rad); xoff < rad + 1; xoff++) {
				if(xoff * xoff + yoff * yoff <= radius * radius) {
					var x0 = x + xoff;
					var y0 = y + yoff;
					if((0 <= y0 && y0 < this.tileH) && (0 <= x0 && x0 < this.tileW)) {
                        yield /** @type {[number, number]}*/([x, y]);
					}
				}
			}
		}
	}
    /**
     * 
     * @param {VecLike} pos 
     * @param {number[]} types 
     * @param {number} radius 
     * @param {number[]|null} blocker_types 
     */
	*iterTypesInRange(pos, types, radius, blocker_types=null) {
		for(var pos0 of this.iterInRange(pos, radius)){
			if(blocker_types !== null && this.hasTypesBetween(pos, pos0, blocker_types)) continue;
			if(types.includes(this.get(pos0))) yield pos0;
		}
	}
    /**
     * 
     * @param {VecLike} pos 
     * @param {number[]} types 
     * @param {number} radius 
     * @param {number[]|null} blocker_types 
     */
	numInRange(pos, types, radius, blocker_types=null) {
		var num = 0;
		for(var pos0 of this.iterTypesInRange(pos, types, radius, blocker_types)) {
			num++;
		}
		return num;
	}
    /**
     * 
     * @param {RectLike} rect 
     * @param {boolean} mustFit 
     * @returns 
     */
	*iterRect(rect, mustFit=true) {
        if(!(rect instanceof eskv.Rect)) rect = new eskv.Rect(rect);
		if(mustFit && (rect.x < 0 || rect.y < 0 || rect.right > this.tileW || rect.bottom > this.tileH)) {
			return ;
		}
		var xl = Math.max(rect.x, 0);
		var xu = Math.min(rect.x + rect.w, this.tileW);
		var yl = Math.max(rect.y, 0);
		var yu = Math.min(rect.y + rect.h, this.tileH);
		for(var y0 = yl; y0 < yu; y0++) {
			for(var x0 = xl; x0 < xu; x0++) {
                yield /** @type {[number, number]}*/([x0, y0]);
			}
		}
	}
    /**
     * 
     * @param {RectLike} rect 
     * @param {number[]} targets 
     * @param {boolean} mustFit 
     */
	numInRect(rect, targets, mustFit=true) {
		let num = 0;
		for(var pos of this.iterRect(rect, mustFit)) {
			if(targets.includes(this.get(pos))) num++;
		}
		return num;
	}
    /**@type {eskv.Widget['draw']} */
    draw(app, ctx) {
        if(this.spriteSheet===null) return;
        if (!this.spriteSheet.sheet.complete || this.spriteSheet.sheet.naturalHeight == 0) return;
		const sw = Math.floor(this.spriteSheet.sheet.width/this.spriteSheet.spriteSize);
		const sh = Math.floor(this.spriteSheet.sheet.height/this.spriteSheet.spriteSize);
		const len = sw*sh;
        for(let x=0;x<this.tileW;x++) {
            for(let y=0;y<this.tileH;y++) {
                let ind = this.get([x,y]);
				if(ind>=0) {
					const flipped = Math.floor(ind/len/4)>0;
					ind = ind%(len*4);
					const angle = Math.floor(ind/len);
					ind = ind%len;
					const indY = Math.floor(ind/sw);
					const indX = ind%sw;
					if(!flipped && angle===0) {
						this.spriteSheet.draw([indX,indY], x+this.x, y+this.y);
					} else {
						this.spriteSheet.drawRotated([indX,indY], x+this.x+0.5, y+this.y+0.5, angle*90, flipped, "center");
					}	
				}
            }
        }
    }
}

export class SpriteSheetSelector extends TileMap {
	activeCellIndex = 0;
	/**@type {eskv.Vec2|null} */
	activeCell = new eskv.Vec2([0,0]);
	_opos = new eskv.Vec2([0,0]);
	angle = 0;
	flipped = false;
    /**@type {eskv.Widget['draw']} */
	draw(app, ctx) {
        if(this.spriteSheet===null) return;
        if (!this.spriteSheet.sheet.complete || this.spriteSheet.sheet.naturalHeight == 0) return;
		const sw = Math.floor(this.spriteSheet.sheet.width/this.spriteSheet.spriteSize);
        for(let x=0;x<this.tileW;x++) {
            for(let y=0;y<this.tileH;y++) {
                const ind = this.get([x,y]);
				const indY = Math.floor(ind/sw);
				const indX = ind%sw;
				if(ind>=0) {
					if(!this.flipped && this.angle===0) {
						this.spriteSheet.draw([indX,indY], x+this.x, y+this.y);
					} else {
						this.spriteSheet.drawRotated([indX,indY], x+this.x+0.5, y+this.y+0.5, this.angle*90, this.flipped, "center");
					}
				}
            }
        }
		// super.draw(app, ctx);
		if(this.activeCell) {
			const lw = ctx.lineWidth;
			const style = ctx.strokeStyle;
			ctx.lineWidth = 1.0/16;
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
			this.activeCellIndex = this.activeCell[1]*this.tileW + this.activeCell[0];
			touch.ungrab();
			return true;
		}
		return false;
	}
}

export class TileMapPainter extends TileMap {
	brush = 1;
	/**@type {eskv.Vec2|null} */
	oldActiveCell = null; 
	/**@type {eskv.Vec2|null} */
	activeCell = null;
	angle = 0;
	flipped = false;
    /**@type {eskv.Widget['draw']} */
	draw(app, ctx) {
		super.draw(app, ctx);
		if(this.activeCell) {
			const lw = ctx.lineWidth;
			const style = ctx.strokeStyle;
			ctx.lineWidth = 1.0/16;
			ctx.strokeStyle = 'yellow';
			ctx.beginPath();
			if(this.oldActiveCell) {
				const x = Math.min(this.activeCell[0],this.oldActiveCell[0]);
				const y = Math.min(this.activeCell[1],this.oldActiveCell[1]);
				const w = Math.abs(this.activeCell[0]-this.oldActiveCell[0]); 
				const h = Math.abs(this.activeCell[1]-this.oldActiveCell[1]);
				ctx.rect(x+this.x, y+this.y, w+1, h+1);				
			} else {
				ctx.rect(this.activeCell.x+this.x, this.activeCell.y+this.y, 1, 1);				
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
				const brush = this.brush + len*this.angle + (this.flipped?4*len:0);
				const pos = this.activeCell;
				if(this.oldActiveCell) {
					const x = Math.min(this.activeCell[0],this.oldActiveCell[0]);
					const y = Math.min(this.activeCell[1],this.oldActiveCell[1]);
					const w = Math.abs(this.activeCell[0]-this.oldActiveCell[0]); 
					const h = Math.abs(this.activeCell[1]-this.oldActiveCell[1]);
					const rect = new eskv.Rect([x,y,w+1,h+1]);
					for(let pos of this.iterRect(rect)) {
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