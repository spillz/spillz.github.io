(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class PRNG {
  _seed = 0;
  /**
   * Generate pseudo random number between in the interval [0,1)
   * @returns {number}
   */
  random() {
    return Math.random();
  }
  /**
   * Seed the random number generator with `seed`
   * @param {number} seed 
   */
  seed(seed) {
  }
  /**
   * Generate an interger in the interval [m1,m2) or [0,m1) if m2===0
   * @param {number} m1 should be an integer
   * @param {number} m2 should be an integer if present
   * @returns 
   */
  getRandomInt(m1, m2 = 0) {
    if (m2 != 0)
      return m1 + Math.floor(this.random() * (m2 - m1));
    else
      return Math.floor(this.random() * m1);
  }
  /**
   * 
   * @param {number} maxX 
   * @param {number} maxY 
   * @returns {[number, number]}
   */
  getRandomPos(maxX, maxY) {
    return [this.getRandomInt(maxX), this.getRandomInt(maxY)];
  }
  randomRange(min = 0, max = 1) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
  randomFloat(min = 0, max = 1) {
    return this.random() * (max - min) + min;
  }
  /**
   * Shuffles the array arr in place and returns a reference to it.
   * @template T
   * @param {Array<T>} arr 
   */
  shuffle(arr) {
    let temp, r;
    for (let i = 1; i < arr.length; i++) {
      r = this.randomRange(0, i);
      temp = arr[i];
      arr[i] = arr[r];
      arr[r] = temp;
    }
    return arr;
  }
  /**
   * Choose one element from a random position in the array.
   * @template T
   * @param {Array<T>} array
   */
  choose(array) {
    return array[Math.floor(this.random() * array.length)];
  }
  /**
   * Randomly choose n elements from an array without replacement
   * @template T
   * @param {Array<T>} arr 
   * @param {number} n 
   * @returns {Array<T>}
   */
  chooseN(arr, n) {
    let result = new Array(n), len = arr.length, taken = new Array(len);
    if (n > len)
      throw new RangeError("chooeN: more elements requested than available");
    while (n--) {
      let x = Math.floor(this.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }
}
function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    var t = a + b | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11;
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}
class PRNG_sfc32 extends PRNG {
  _seed = 1;
  d = 3735928559;
  xorSeed = Math.floor(Date.now()) ^ this.d;
  random = sfc32(2654435769, 608135816, 3084996962, this.xorSeed);
  seed(seed) {
    this._seed = seed;
    this.xorSeed = seed ^ this.d;
    this.random = sfc32(2654435769, 608135816, 3084996962, this.xorSeed);
  }
}
var defaultPRNG = new PRNG_sfc32();
function getRandomPos(max1, max2) {
  return defaultPRNG.getRandomPos(max1, max2);
}
function randomFloat(min = 0, max = 1) {
  return defaultPRNG.randomFloat(min, max);
}
function vec2(x, y) {
  return new Vec2([x, y]);
}
function v2(vecLike) {
  return new Vec2(vecLike);
}
class Vec2 extends Array {
  /**
   * Creates a 2D vector from an array type
   * @param {Array<number>} vec -- array like to construct vector from (uses first two numeric elements)
   */
  constructor(vec = [0, 0]) {
    super();
    this[0] = vec[0];
    this[1] = vec[1];
  }
  /**
   * 
   * @param {number[]} vec 
   * @returns 
   */
  equals(vec) {
    return this.length === vec.length && this[0] === vec[0] && this[1] === vec[1];
  }
  /**
   * 
   * @param {Array<number>} vec 
   * @returns {Vec2}
   */
  static random(vec) {
    return new Vec2(getRandomPos(vec[0], vec[1]));
  }
  /**
   * Adds a vector to this vector
   * @param {Array<number>} vec - vector to add
   * @returns {Vec2}
   */
  add(vec) {
    return new Vec2([this[0] + vec[0], this[1] + vec[1]]);
  }
  /**
   * Subtracts a vector from this vector
   * @param {Array<number>} vec - vector to subtract
   * @returns {Vec2}
   */
  sub(vec) {
    return new Vec2([this[0] - vec[0], this[1] - vec[1]]);
  }
  /**
   * Scales elements of this vector
   * @param {number} scalar - amount to scale this vector
   * @returns {Vec2}
   */
  scale(scalar) {
    return new Vec2([this[0] * scalar, this[1] * scalar]);
  }
  /**
   * Element-wise multiplication
   * @param {Array<number>} vec - array like to element-wise multiply with this vector
   * @returns {Vec2}
   */
  mul(vec) {
    return new Vec2([this[0] * vec[0], this[1] * vec[1]]);
  }
  /**
   * Element-wise division
   * @param {Array<number>} vec - array like to element-wise divided this vector by
   * @returns {Vec2}
   */
  div(vec) {
    return new Vec2([this[0] / vec[0], this[1] / vec[1]]);
  }
  /**
   * Dot-product
   * @param {*} vec - array-like to element-wise dot product with this vector
   * @returns {number}
   */
  dot(vec) {
    return this[0] * vec[0] + this[1] * vec[1];
  }
  /**
   * Euclidean distance a vector and this vector
   * @param {Array<number>} vec - array-like to calculate distance from
   * @returns 
   */
  dist(vec) {
    return Math.hypot(this[0] - vec[0], this[1] - vec[1]);
  }
  /**
   * Absolute value of elements
   * @returns  {Vec2}
   */
  abs() {
    return new Vec2([Math.abs(this[0]), Math.abs(this[1])]);
  }
  /**
   * Sum of the elements
   * @returns {number}
   */
  sum() {
    return this[0] + this[1];
  }
  /**
   * Expresses a vector as a proportional position within a rectangle
   * @param {Rect} rect 
   * @returns {Vec2}
   */
  relativeTo(rect) {
    return this.sub(rect.pos).div(rect.size);
  }
  /**
   * Scales a vector in proportional coordinates relative to the rect to absolute coordinates
   * @param {Rect} rect 
   * @returns {Vec2}
   */
  absoluteFrom(rect) {
    return this.mul(rect.size).add(rect.pos);
  }
  /**
   * Expresses a vector `pos` as a proportion of a length `sz`
   * @param {Vec2} pos 
   * @param {number} sz 
   * @returns {Vec2}
   */
  relativeToPS(pos, sz) {
    return this.sub(pos).scale(1 / sz);
  }
  /**
   * Scales a vector `pos` in proportional to the length `sz`
   * @param {Vec2} pos 
   * @param {number} sz 
   * @returns {Vec2}
   */
  absoluteFromPS(pos, sz) {
    return this.scale(sz).add(pos);
  }
  /**
   * First element of vector
   * @type {number}
   */
  set x(val) {
    this[0] = val;
  }
  /**
   * Second element of vector
   * @type {number}
   */
  set y(val) {
    this[1] = val;
  }
  get x() {
    return this[0];
  }
  get y() {
    return this[1];
  }
}
class Rect extends Array {
  /**
   * Creates a rectangle from an array type specify left, top, width, and heigh parameters.
   * Initialized to zero if rect is null or missing
   * @param {Array<number>|null} rect 
   * @returns 
   */
  constructor(rect = null) {
    super();
    if (rect === null) {
      this[0] = 0;
      this[1] = 0;
      this[2] = 0;
      this[3] = 0;
      return;
    }
    this[0] = rect[0];
    this[1] = rect[1];
    this[2] = rect[2];
    this[3] = rect[3];
  }
  /**
   * @type {number}
   */
  set x(val) {
    this[0] = val;
  }
  /**
   * @type {number}
   */
  set y(val) {
    this[1] = val;
  }
  /**
   * @type {number}
   */
  set w(val) {
    this[2] = val;
  }
  /**
   * @type {number}
   */
  set h(val) {
    this[3] = val;
  }
  /**
   * @type {[number, number]} [x, y] positional coordinates of the rectangle
   */
  set pos(vec) {
    this[0] = vec[0];
    this[1] = vec[1];
  }
  /**
   * @type {[number, number]} [widget, height] of the rectangle
   */
  set size(vec) {
    this[2] = vec[0];
    this[3] = vec[1];
  }
  get size() {
    return new Vec2([this[2], this[3]]);
  }
  get pos() {
    return new Vec2([this[0], this[1]]);
  }
  get x() {
    return this[0];
  }
  get y() {
    return this[1];
  }
  get w() {
    return this[2];
  }
  get h() {
    return this[3];
  }
  /**
   * Rightmost position of rectangle 
   * @type {number}
   * @readonly
   */
  get right() {
    return this[0] + this[2];
  }
  /**
   * Bottom-most position of rectangle 
   * @type {number}
   * @readonly
   */
  get bottom() {
    return this[1] + this[3];
  }
  /**
   * Center position of widget on the x-axis
   * @readonly
   */
  get center_x() {
    return this[0] + this[2] / 2;
  }
  /**
   * Center position of widget on the y-axis
   * @readonly
   */
  get center_y() {
    return this[1] + this[3] / 2;
  }
  /**
   * Vector repesenting of the center position of the widget
   * @type {Vec2}
   * @readonly
   */
  get center() {
    return new Vec2([this.center_x, this.center_y]);
  }
  /**
   * Grow rectangle a fix amount in each direction
   * @param {number} amount 
   * @returns 
   */
  grow(amount) {
    return new Rect([this[0] - amount, this[1] - amount, this[2] + 2 * amount, this[3] + 2 * amount]);
  }
  /**
   * Retrieve the center position of the Rect in whole numbers (rounding down)
   */
  get flooredCenter() {
    return new Vec2([Math.floor(this[0] + this[2] / 2), Math.floor(this[1] + this[3] / 2)]);
  }
  /**
   * Shift the rectangle in 2D space
   * @param {[number, number]} pos - array-like representing the amount to shift the rect by in XY space
   * @returns {Rect}
   */
  translate(pos) {
    return new Rect([this.x + pos[0], this.y + pos[1], this.w, this.h]);
  }
  /**
   * Creates a new rectangle with borders shrunk by the fixed amount value
   * @param {number} value 
   * @returns {Rect}
   */
  shrinkBorders(value) {
    return new Rect([this.x + value, this.y + value, this.w - value * 2, this.h - value * 2]);
  }
  /**
   * Creates a new rectangle with borders shrunk by the fixed amount value
   * @param {number} scale
   * @returns {Rect}
   */
  scaleBorders(scale) {
    return new Rect([this.x + this.w * (1 - scale) / 2, this.y + this.h * (1 - scale) / 2, this.w * scale, this.h * scale]);
  }
  /**
   * Returns a new rectangle that scales each element of rectangle by a fixed amount 
   * @param {number} scalar - amount to scale each element by 
   * @returns {Rect}
   */
  mult(scalar) {
    return new Rect([
      this[0] * scalar,
      this[1] * scalar,
      this[2] * scalar,
      this[3] * scalar
    ]);
  }
  /**
   * Returns a new rectangle that scales each element of rectangle by a fixed amount 
   * @param {[number,number]} vec - amount to scale X and Y dimensions
   * @returns {Rect}
   */
  multXY(vec) {
    return new Rect([
      this[0] * vec[0],
      this[1] * vec[1],
      this[2] * vec[0],
      this[3] * vec[1]
    ]);
  }
  /**
   * Returns a rectangle that scales the width and height of this rectangle, optionally repositioning to retain the position of the center
   * @param {number} scalar - amount to multiple the width and height by
   * @param {boolean} centered - if true, repositions to keep the center position unchanged
   * @returns {Rect}
   */
  scale(scalar, centered = true) {
    if (centered) {
      let news = [this[2] * scalar, this[3] * scalar];
      return new Rect([
        this[0] + 0.5 * (this[2] - news[0]),
        this[1] + 0.5 * (this[3] - news[1]),
        news[0],
        news[1]
      ]);
    } else {
      let news = [this[2] * scalar, this[3] * scalar];
      return new Rect([
        this[0],
        this[1],
        news[0],
        news[1]
      ]);
    }
  }
  /**
   * Returns true if the center of rect and this Rect have a Euclidean distance less than radius.
   * If radius is missing using the smallest value of the width or height of the two rectangles divided by two.
   * @param {Rect} rect 
   * @param {number|null} radius 
   * @returns {boolean}
   */
  collideRadius(rect, radius = null) {
    let d = [this.center_x - rect.center_x, this.center_y - rect.center_y];
    if (radius === null) {
      radius = Math.min(this.w, this.h, rect.w, rect.h) / 2;
    }
    return d[0] * d[0] + d[1] * d[1] < radius * radius;
  }
  /**
   * Return true if rect and this Rect overlap.
   * @param {*} rect 
   * @returns {boolean}
   */
  collide(rect) {
    if (this.x < rect.x + rect.w && this.x + this.w > rect.x && this.y < rect.y + rect.h && this.h + this.y > rect.y)
      return true;
    return false;
  }
  /**
   * Return true if this Rect fully encloses rect.
   * @param {Rect} rect 
   * @returns {boolean}
   */
  contains(rect) {
    return this.x <= rect.x && this.y <= rect.y && this.x + this.w >= rect.x + rect.w && this.y + this.h >= rect.y + rect.h;
  }
  /**
   * Return true if rect and this Rect overlap or touch.
   * @param {*} rect 
   * @returns {boolean}
   */
  contact(rect) {
    if (this.x <= rect.x + rect.w && this.x + this.w >= rect.x && this.y <= rect.y + rect.h && this.h + this.y >= rect.y)
      return true;
    return false;
  }
  /**
   * Returns true if the center of rect and this Rect have a Euclidean distance less than of equal to radius.
   * If radius is missing using the smallest value of the width or height of the two rectangles divided by two.
   * @param {Rect} rect 
   * @param {number|null} radius 
   * @returns {boolean}
   */
  contactRadius(rect, radius = null) {
    let d = [this.center_x - rect.center_x, this.center_y - rect.center_y];
    if (radius === null) {
      radius = Math.min(this.w, this.h, rect.w, rect.h);
    }
    return d[0] * d[0] + d[1] * d[1] <= radius * radius;
  }
}
class Grid2D extends Array {
  constructor(tileDim = [0, 0]) {
    super(tileDim[0] * tileDim[1]);
    this.tileDim = new Vec2(tileDim);
    this.hidden = false;
    this._cacheData = null;
  }
  /**
   * Return the tile index value of the tilemap at position `pos`
   * @param {VecLike} pos 
   * @returns 
   */
  get(pos) {
    return this[pos[0] + pos[1] * this.tileDim[0]];
  }
  /**
   * Set the index value of the tilemap at position `pos`
   * @param {VecLike} pos 
   * @param {number} val 
   */
  set(pos, val) {
    this[pos[0] + pos[1] * this.tileDim[0]] = val;
  }
  /**
   * Iterate a cells in the line between `pos1` and `pos2`
   * @param {VecLike} pos1 
   * @param {VecLike} pos2
   * @yields {[number, number]}
   */
  *iterBetween(pos1, pos2, tol = 0) {
    var x1, y1, x2, y2;
    [x1, y1] = pos1;
    [x2, y2] = pos2;
    if (Math.abs(y2 - y1) == 0 && Math.abs(x2 - x1) == 0) {
      return;
    }
    if (Math.abs(y2 - y1) > Math.abs(x2 - x1)) {
      var slope = (x2 - x1) / (y2 - y1);
      if (y1 > y2) {
        for (var y = y1; y >= y2; y--) {
          var xa = x1 + (y - y1) * slope;
          yield (
            /** @type {[number, number]}*/
            [xa, y]
          );
        }
      } else {
        for (var y = y1; y <= y2; y++) {
          var xa = x1 + (y - y1) * slope;
          yield (
            /** @type {[number, number]}*/
            [xa, y]
          );
        }
      }
    } else {
      var slope = (y2 - y1) / (x2 - x1);
      if (x1 > x2) {
        for (var x = x1; x >= x2; x--) {
          var ya = y1 + (x - x1) * slope;
          yield (
            /** @type {[number, number]}*/
            [x, ya]
          );
        }
      } else {
        for (var x = x1; x <= x2; x++) {
          var ya = y1 + (x - x1) * slope;
          yield (
            /** @type {[number, number]}*/
            [x, ya]
          );
        }
      }
    }
  }
  /**
   * Iterate a cells in the line between `pos1` and `pos2`
   * @param {VecLike} pos1 
   * @param {VecLike} pos2
   * @yields {[number, number]}
   */
  *iterInBetween(pos1, pos2) {
    var x1, y1, x2, y2;
    [x1, y1] = pos1;
    [x2, y2] = pos2;
    if (Math.abs(y2 - y1) == 0 && Math.abs(x2 - x1) == 0) {
      return;
    }
    if (Math.abs(y2 - y1) > Math.abs(x2 - x1)) {
      var slope = (x2 - x1) / (y2 - y1);
      if (y1 > y2) {
        for (var y = y1 - 1; y > y2; y--) {
          var x = Math.round(x1 + (y - y1) * slope);
          yield (
            /** @type {[number, number]}*/
            [x, y]
          );
        }
      } else {
        for (var y = y1 + 1; y < y2; y++) {
          var x = Math.round(x1 + (y - y1) * slope);
          yield (
            /** @type {[number, number]}*/
            [x, y]
          );
        }
      }
    } else {
      var slope = (y2 - y1) / (x2 - x1);
      if (x1 > x2) {
        for (var x = x1 - 1; x > x2; x--) {
          var y = Math.round(y1 + (x - x1) * slope);
          yield (
            /** @type {[number, number]}*/
            [x, y]
          );
        }
      } else {
        for (var x = x1 + 1; x < x2; x++) {
          var y = Math.round(y1 + (x - x1) * slope);
          yield (
            /** @type {[number, number]}*/
            [x, y]
          );
        }
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
    for (var pos of this.iterBetween(pos1, pos2)) {
      if (types.includes(this.get(pos))) {
        yield pos;
      }
    }
  }
  /**
   * Iterate over cells in the line between `pos1` and `pos2` that match a tile index values in `types`
   * @param {VecLike} pos1 
   * @param {VecLike} pos2 
   * @param {number[]} types 
   */
  *iterTypesInBetween(pos1, pos2, types) {
    for (var pos of this.iterInBetween(pos1, pos2)) {
      if (types.includes(this.get(pos))) {
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
    for (var pos of this.iterTypesBetween(pos1, pos2, types)) {
      return true;
    }
    return false;
  }
  /**
   * Returns true if the any of the index values in types are on the line between `pos1` and `pos2`
   * @param {VecLike} pos1 
   * @param {VecLike} pos2 
   * @param {number[]} types 
   */
  hasTypesInBetween(pos1, pos2, types) {
    for (var pos of this.iterTypesInBetween(pos1, pos2, types)) {
      return true;
    }
    return false;
  }
  /**
   * 
   * @param {RectLike|null} sub_rect 
   */
  *iterAll(sub_rect = null) {
    const [tw, th] = this.tileDim;
    if (sub_rect !== null) {
      for (var y = sub_rect[1]; y < Math.min(th, sub_rect[1] + sub_rect[3]); y++) {
        for (var x = sub_rect[0]; x < Math.min(tw, sub_rect[0] + sub_rect[2]); x++) {
          yield (
            /** @type {[number, number]}*/
            [x, y]
          );
        }
      }
    } else {
      for (var y = 0; y < th; y++) {
        for (var x = 0; x < tw; x++) {
          yield (
            /** @type {[number, number]}*/
            [x, y]
          );
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
    for (var pos of this.iterAll(sub_rect)) {
      if (types.includes(this.get(pos))) {
        yield pos;
      }
    }
  }
  /**
   * Iterate over the four orthogonally adjacent positions
   * @param {VecLike} pos 
   */
  *iterAdjacent(pos) {
    pos = new Vec2(pos);
    for (let dir of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const npos = pos.add(dir);
      if (npos[0] >= 0 && npos[0] < this.tileDim[0] && npos[1] >= 0 && npos[1] < this.tileDim[1]) yield npos;
    }
  }
  /**
   * Iterate over the four orthogonally adjacent positions
   * @param {VecLike} pos 
   * @param {number[]} types 
   */
  hasAdjacent(pos, types) {
    for (let npos of this.iterAdjacent(pos)) {
      if (types.includes(this.get(pos))) return true;
    }
    return false;
  }
  /**
   * Iterate over positions in the circular range of `radius`
   * @param {VecLike} pos 
   * @param {number} radius 
   */
  *iterInRange(pos, radius) {
    var x, y;
    [x, y] = pos;
    const [tw, th] = this.tileDim;
    if (radius == null) radius = 3;
    var rad = Math.ceil(radius);
    for (var yoff = -rad; yoff < rad + 1; yoff++) {
      for (var xoff = -rad; xoff < rad + 1; xoff++) {
        if (xoff * xoff + yoff * yoff <= radius * radius) {
          var x0 = x + xoff;
          var y0 = y + yoff;
          if (0 <= y0 && y0 < th && (0 <= x0 && x0 < tw)) {
            yield (
              /** @type {[number, number]}*/
              [x0, y0]
            );
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
  *iterTypesInRange(pos, types, radius, blocker_types = null) {
    for (var pos0 of this.iterInRange(pos, radius)) {
      if (blocker_types !== null && this.hasTypesBetween(pos, pos0, blocker_types)) continue;
      if (types.includes(this.get(pos0))) yield pos0;
    }
  }
  /**
   * 
   * @param {VecLike} pos 
   * @param {number[]} types 
   * @param {number} radius 
   * @param {number[]|null} blocker_types 
   */
  numInRange(pos, types, radius, blocker_types = null) {
    var num = 0;
    for (var pos0 of this.iterTypesInRange(pos, types, radius, blocker_types)) {
      num++;
    }
    return num;
  }
  /**
   * 
   * @param {Rect} rect 
   * @returns 
   */
  *iterRectBoundary(rect) {
    const [tw, th] = this.tileDim;
    let xl = Math.min(Math.max(rect.x, 0), tw);
    let xu = Math.min(Math.max(rect.x + rect.w, 0), tw);
    let yl = Math.min(Math.max(rect.y, 0), th);
    let yu = Math.min(Math.max(rect.y + rect.h, 0), th);
    for (let x0 = xl; x0 < xu; x0++) {
      yield (
        /** @type {[number, number]}*/
        [x0, yl]
      );
    }
    for (let x0 = xl; x0 < xu; x0++) {
      yield (
        /** @type {[number, number]}*/
        [x0, yu]
      );
    }
    for (let y0 = yl; y0 < yu; y0++) {
      yield (
        /** @type {[number, number]}*/
        [xl, y0]
      );
    }
    for (let y0 = yl; y0 < yu; y0++) {
      yield (
        /** @type {[number, number]}*/
        [xu, y0]
      );
    }
  }
  /**
   * 
   * @param {RectLike} rect 
   * @param {boolean} mustFit 
   * @returns 
   */
  *iterRect(rect, mustFit = true) {
    const [tw, th] = this.tileDim;
    if (!(rect instanceof Rect)) rect = new Rect(rect);
    if (mustFit && (rect.x < 0 || rect.y < 0 || rect.right > tw || rect.bottom > th)) {
      return;
    }
    let xl = Math.max(rect.x, 0);
    let xu = Math.min(rect.x + rect.w, tw);
    let yl = Math.max(rect.y, 0);
    let yu = Math.min(rect.y + rect.h, th);
    for (let y0 = yl; y0 < yu; y0++) {
      for (let x0 = xl; x0 < xu; x0++) {
        yield (
          /** @type {[number, number]}*/
          [x0, y0]
        );
      }
    }
  }
  /**
   * 
   * @param {RectLike} rect 
   * @param {number[]} targets 
   * @param {boolean} mustFit 
   */
  numInRect(rect, targets, mustFit = true) {
    let num = 0;
    for (var pos of this.iterRect(rect, mustFit)) {
      if (targets.includes(this.get(pos))) num++;
    }
    return num;
  }
}
const minFontSize = 8;
const scaleFactor = 48 * (1 / window.devicePixelRatio || 1);
function sizeText(ctx, text, size, fontName, centered, rect, color) {
  let scale = 1;
  if (size < minFontSize) {
    scale = 1 / scaleFactor;
    ctx.save();
    ctx.scale(scale, scale);
  }
  ctx.fillStyle = color;
  ctx.font = (size >= minFontSize ? size : Math.ceil(size / scale)) + "px " + fontName;
  rect.x;
  let w = scale * ctx.measureText(text).width;
  if (size < minFontSize) ctx.restore();
  return [w, 2 * size];
}
function getTextData(ctx, text, size, fontName, halign, valign, rect, color) {
  let scale = 1;
  if (size < minFontSize) {
    scale = 1 / scaleFactor;
    ctx.save();
    ctx.scale(scale, scale);
  }
  ctx.fillStyle = color;
  ctx.font = (size >= minFontSize ? size : Math.ceil(size / scale)) + "px " + fontName;
  let textX = rect.x;
  let metrics = ctx.measureText(text);
  let textY = rect.y;
  switch (halign) {
    case "left":
      break;
    case "center":
      textX += (rect.w - scale * metrics.width) / 2;
      break;
    case "right":
      textX += rect.w - scale * metrics.width;
      break;
  }
  switch (valign) {
    case "top":
      break;
    case "middle":
      textY += rect.h / 2;
      break;
    case "bottom":
      textY += rect.h;
      break;
  }
  let outText = [text, textX / scale, textY / scale];
  let textData = { outText: [outText], color, fontName, size, valign };
  if (size < minFontSize) ctx.restore();
  return textData;
}
function drawText(ctx, textData, color = null) {
  let scale = 1;
  let size = textData.size;
  if (color == null) color = textData.color;
  if (size < minFontSize) {
    scale = 1 / scaleFactor;
    ctx.save();
    ctx.scale(scale, scale);
  }
  switch (textData.valign) {
    case "top":
      ctx.textBaseline = "top";
      break;
    case "middle":
      ctx.textBaseline = "middle";
      break;
    case "bottom":
      ctx.textBaseline = "bottom";
      break;
  }
  ctx.fillStyle = color;
  ctx.font = (size >= minFontSize ? size : Math.ceil(size / scale)) + "px " + textData.fontName;
  let [t, x, y] = textData.outText[0];
  ctx.fillText(t, x, y);
  if (size < minFontSize) ctx.restore();
}
function sizeWrappedText(ctx, text, size, fontName, centered, rect, color, wordwrap = true) {
  let scale = 1;
  if (size < minFontSize) {
    scale = 1 / scaleFactor;
    ctx.save();
    ctx.scale(scale, scale);
  }
  ctx.font = (size >= minFontSize ? size : Math.ceil(size / scale)) + "px " + fontName;
  let h = 0;
  let paraText = "";
  let guess = Math.min(Math.max(1, Math.ceil(text.length * rect.w / ctx.measureText(text).width / scale)), text.length);
  while (text != "" || paraText != "") {
    if (paraText == "") {
      let n = text.indexOf("\n");
      if (n >= 0) {
        paraText = text.slice(0, n);
        text = text.slice(n + 1);
      } else {
        paraText = text;
        text = "";
      }
    }
    let nextLine = paraText.slice(0, guess);
    let w = scale * ctx.measureText(nextLine).width;
    if (w > rect.w && guess > 1) {
      while (w > rect.w && guess > 1) {
        guess--;
        nextLine = paraText.slice(0, guess);
        w = scale * ctx.measureText(nextLine).width;
      }
    }
    if (w < rect.w && guess < paraText.length) {
      while (w < rect.w && guess < paraText.length) {
        guess++;
        nextLine = paraText.slice(0, guess);
        w = scale * ctx.measureText(nextLine).width;
      }
      guess--;
    }
    if (wordwrap) {
      if (nextLine[-1] != "" && paraText[guess] != " " && paraText[guess] != "	") {
        let lastIndex = Math.max(nextLine.lastIndexOf(" "), nextLine.lastIndexOf("	"));
        if (lastIndex >= 0) {
          guess -= nextLine.length - lastIndex - 1;
        }
      }
    }
    guess = Math.max(1, guess);
    nextLine = paraText.slice(0, guess);
    paraText = paraText.slice(guess);
    if (wordwrap) {
      paraText = paraText.trimStart();
    }
    h += size;
  }
  h += size;
  if (size < minFontSize) ctx.restore();
  return [rect.w, h];
}
function getWrappedTextData(ctx, text, size, fontName, halign, valign, rect, color, wordwrap = true) {
  let scale = 1;
  if (size < minFontSize) {
    scale = 1 / scaleFactor;
    ctx.save();
    ctx.scale(scale, scale);
  }
  ctx.fillStyle = color;
  ctx.font = (size >= minFontSize ? size : Math.ceil(size / scale)) + "px " + fontName;
  let y = rect.y;
  let outText = [];
  let paraText = "";
  let guess = Math.min(Math.max(1, Math.ceil(text.length * (rect.w / ctx.measureText(text).width) / scale)), text.length);
  while (text != "" || paraText != "") {
    if (paraText == "") {
      let n = text.indexOf("\n");
      if (n >= 0) {
        paraText = text.slice(0, n);
        text = text.slice(n + 1);
      } else {
        paraText = text;
        text = "";
      }
    }
    let x = rect.x;
    let nextLine = paraText.slice(0, guess);
    let w = scale * ctx.measureText(nextLine).width;
    if (w > rect.w && guess > 1) {
      while (w > rect.w && guess > 1) {
        guess--;
        nextLine = paraText.slice(0, guess);
        w = scale * ctx.measureText(nextLine).width;
      }
    }
    if (w < rect.w && guess < paraText.length) {
      while (w < rect.w && guess < paraText.length) {
        guess++;
        nextLine = paraText.slice(0, guess);
        w = scale * ctx.measureText(nextLine).width;
      }
      guess--;
    }
    if (wordwrap && guess < paraText.length) {
      if (nextLine[-1] != "" && paraText[guess] != " " && paraText[guess] != "	") {
        let lastIndex = Math.max(nextLine.lastIndexOf(" "), nextLine.lastIndexOf("	"));
        if (lastIndex >= 0) {
          guess -= nextLine.length - lastIndex - 1;
        }
      }
    }
    guess = Math.max(1, guess);
    nextLine = paraText.slice(0, guess);
    paraText = paraText.slice(guess);
    if (wordwrap) {
      paraText = paraText.trimStart();
    }
    w = scale * ctx.measureText(nextLine).width;
    switch (halign) {
      case "left":
        break;
      case "center":
        x += (rect.w - w) / 2;
        break;
      case "right":
        x += rect.w - w;
        break;
    }
    outText.push([nextLine, x / scale, y / scale]);
    y += size;
  }
  let h = y - rect.y;
  let off = 0;
  switch (valign) {
    case "top":
      off = 0;
      break;
    case "middle":
      off = (rect.h - h) / 2 + size / 2;
      break;
    case "bottom":
      off = rect.h - h + size;
  }
  let textData = { size, fontName, outText, off: off / scale, color, valign };
  if (size < minFontSize) {
    ctx.restore();
  }
  return textData;
}
function drawWrappedText(ctx, textData, color = null) {
  let scale = 1;
  let size = textData.size;
  if (color === null) color = textData.color;
  if (size < minFontSize) {
    scale = 1 / scaleFactor;
    ctx.save();
    ctx.scale(scale, scale);
  }
  switch (textData.valign) {
    case "top":
      ctx.textBaseline = "top";
      break;
    case "middle":
      ctx.textBaseline = "middle";
      break;
    case "bottom":
      ctx.textBaseline = "bottom";
      break;
  }
  ctx.fillStyle = color;
  ctx.font = (size >= minFontSize ? size : Math.ceil(size / scale)) + "px " + textData.fontName;
  for (let tdat of textData.outText) {
    ctx.fillText(tdat[0], tdat[1], tdat[2] + (textData.off ?? 0));
  }
  if (size < minFontSize) {
    ctx.restore();
  }
}
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
function dist(pos1, pos2) {
  return new Vec2(pos1).dist(pos2);
}
function colorString(vec) {
  let r, g, b;
  [r, g, b] = new MathArray(vec).scale(255).map((x) => Math.floor(x));
  return "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
}
class MathArray extends Array {
  constructor(...arr) {
    if (arr.length == 1 && arr[0] instanceof Array) {
      super(...arr[0]);
    } else {
      super(...arr);
    }
  }
  static asRandomFloats(size, low = 0, high = 1) {
    let a = new MathArray(size);
    for (let i = 0; i < a.length; i++) a[i] = randomFloat(low, high);
    return a;
  }
  sum() {
    let s = 0;
    this.forEach((el) => s += el);
    return s;
  }
  mean() {
    return this.sum() / this.length;
  }
  max() {
    return Math.max.apply(null, this);
  }
  min() {
    return Math.min.apply(null, this);
  }
  vars() {
    let s = 0;
    this.forEach((el) => s += el * el);
    return (s - this.length * this.mean() ^ 2) / (this.length - 1);
  }
  var() {
    let s = 0;
    this.forEach((el) => s += el * el);
    return s / this.length - this.mean() ^ 2;
  }
  std() {
    return Math.sqrt(this.var());
  }
  /**
   * 
   * @param {number[]} arr2 
   * @returns 
   */
  add(arr2) {
    let a = new MathArray(this);
    if (arr2 instanceof Array) {
      for (let i = 0; i < this.length; i++) {
        a[i] += arr2[i];
      }
    } else {
      for (let i = 0; i < this.length; i++) {
        a[i] += arr2;
      }
    }
    return a;
  }
  /**
   * Element-wise multiplication
   * @param {number[]} arr2 
   * @returns 
   */
  mul(arr2) {
    let a = new MathArray(this);
    if (arr2 instanceof Array) {
      for (let i = 0; i < this.length; i++) {
        a[i] *= arr2[i];
      }
    } else {
      for (let i = 0; i < this.length; i++) {
        a[i] *= arr2;
      }
    }
    return a;
  }
  /**
   * 
   * @param {number} scalar 
   */
  scale(scalar) {
    const arr = Array();
    for (let val of this) {
      arr.push(val * scalar);
    }
    return arr;
  }
  /**
   * 
   * @param {number[]} arr2 
   * @returns 
   */
  dot(arr2) {
    return this.mul(arr2).sum();
  }
  abs() {
    return Math.abs.apply(null, this);
  }
  /**
   * 
   * @param {number} k 
   * @returns 
   */
  lag(k) {
    let a = new MathArray();
    for (let i = -k; i < this.length - k; i++) {
      if (i < 0 || i >= this.length) {
        a.push(NaN);
      } else {
        a.push(this[i]);
      }
    }
    return a;
  }
  filter(func) {
    return new MathArray(super.filter(func));
  }
  dropNaN() {
    return this.filter((el) => !Number.isNaN(el));
  }
}
class Touch {
  /**@type {number} */
  identifier = -1;
  /**@type {Vec2|[number,number]} */
  pos = [0, 0];
  /**@type {string} */
  state = "touch_up";
  // one of 'touch_up', 'touch_down', 'touch_move', 'touch_cancel'
  /**@type {'touch'|'mouse'|'keyboard'} */
  device = "touch";
  //source of touch: touch, mouse or keyboard
  /**@type {globalThis.Touch|MouseEvent|WheelEvent} */
  nativeObject = null;
  /**@type {MouseEvent|TouchEvent} */
  nativeEvent = null;
  constructor(props = {}) {
    for (let p in props) {
      this[p] = props[p];
    }
  }
  copy() {
    return new Touch({
      pos: [...this.pos],
      state: this.state,
      device: this.device,
      nativeObject: this.nativeObject,
      nativeEvent: this.nativeEvent,
      identifier: this.identifier
    });
  }
  /** @type {(widget:Widget)=>Touch} */
  asChildTouch(widget) {
    return new Touch({
      pos: [...widget.toChild(this.pos)],
      state: this.state,
      device: this.device,
      nativeObject: this.nativeObject,
      nativeEvent: this.nativeEvent,
      identifier: this.identifier
    });
  }
  /** @returns {Rect} */
  get rect() {
    return new Rect([...this.pos, 0, 0]);
  }
  /**@type {number} x-coordinate */
  set x(value) {
    this.pos[0] = value;
  }
  /**@type {number} y-coordinate */
  set y(value) {
    this.pos[1] = value;
  }
  get x() {
    return this.pos[0];
  }
  get y() {
    return this.pos[1];
  }
  /** 
   * Returns the widget that currently grabs all touch events or null if no widget is grabbed. 
   * @type {Widget|null} */
  get grabbed() {
    return App.get().inputHandler.grabbed;
  }
  /**
   * Tells the framework that `widget` will be the exclusive target of all touch operations until ungrab is called
   * @param {*} widget 
   * @returns 
   */
  grab(widget) {
    App.get().inputHandler.grab(widget);
  }
  /**Release the current widget target of all touches. Future touchs will bubble up through the widget tree. */
  ungrab() {
    App.get().inputHandler.ungrab();
  }
}
class InputHandler {
  /**@type {Widget|null} */
  grabbed = null;
  mouseTouchEmulation = true;
  mouseev = null;
  keyStates = {};
  /**
   * 
   * @param {App} app 
   */
  constructor(app) {
    this.app = app;
    this.canvas = app.canvas;
    let canvas = this.canvas;
    let that = this;
    document.addEventListener("keydown", function(ev) {
      that.process_key(ev, "key_down");
    }, true);
    document.addEventListener("keyup", function(ev) {
      that.process_key(ev, "key_up");
    }, true);
    canvas.addEventListener("mousedown", function(ev) {
      that.process_mouse(ev, "mouse_down");
    }, true);
    canvas.addEventListener("mousemove", function(ev) {
      that.process_mouse(ev, "mouse_move");
    }, true);
    canvas.addEventListener("mouseout", function(ev) {
      that.process_mouse(ev, "mouse_cancel");
    }, true);
    canvas.addEventListener("mouseup", function(ev) {
      that.process_mouse(ev, "mouse_up");
    }, true);
    canvas.addEventListener("touchstart", function(ev) {
      that.process_touch(ev, "touch_down");
    }, false);
    canvas.addEventListener("touchmove", function(ev) {
      that.process_touch(ev, "touch_move");
    }, false);
    canvas.addEventListener("touchcancel", function(ev) {
      that.process_touch(ev, "touch_cancel");
    }, false);
    canvas.addEventListener("touchend", function(ev) {
      that.process_touch(ev, "touch_up");
    }, false);
    canvas.addEventListener("wheel", function(ev) {
      that.process_wheel(ev, "wheel");
    }, true);
    window.history.replaceState(null, document.title, location.pathname + "#!/backbutton");
    window.history.pushState(null, document.title, location.pathname);
    window.addEventListener("popstate", function(ev) {
      that.process_back(ev, "back_button");
    }, false);
  }
  grab(widget) {
    this.grabbed = widget;
  }
  ungrab() {
    this.grabbed = null;
  }
  isKeyUp(key) {
    return key in this.keyStates && this.keyStates[key];
  }
  isKeyDown(key) {
    return key in this.keyStates && this.keyStates[key];
  }
  /**
   * 
   * @param {KeyboardEvent} ev 
   * @param {string} name 
   */
  process_key(ev, name) {
    this.app.requestFrameUpdate();
    const oldKeyState = this.keyStates[ev.key];
    if (name === "key_up") this.keyStates[ev.key] = false;
    else if (name === "key_down") this.keyStates[ev.key] = true;
    this.app.emit(name, { states: this.keyStates, oldState: oldKeyState, event: ev });
  }
  /**
   * 
   * @param {TouchEvent} ev 
   * @param {string} name 
   */
  process_touch(ev, name) {
    this.app.requestFrameUpdate();
    if (this.grabbed !== null) {
      for (let to of ev.changedTouches) {
        let pos = this.grabbed.appToChild([to.clientX, to.clientY]);
        let t = new Touch({ pos, state: name, nativeObject: to, nativeEvent: ev, identifier: to.identifier });
        this.grabbed.emit(name, t);
      }
    } else {
      for (let to of ev.changedTouches) {
        let t = new Touch({ pos: this.app.toChild([to.clientX, to.clientY]), state: name, nativeObject: to, nativeEvent: ev, identifier: to.identifier });
        this.app.childEmit(name, t, true);
      }
    }
    ev.preventDefault();
  }
  process_back(ev, name) {
    if (location.hash === "#!/backbutton") {
      history.replaceState(null, document.title, location.pathname);
      this.app.childEmit("back_button", ev);
    }
  }
  /**
   * 
   * @param {MouseEvent} ev 
   * @param {string} name 
   */
  process_mouse(ev, name) {
    this.app.requestFrameUpdate();
    this.mouseev = ev;
    ev.preventDefault();
    if (this.mouseTouchEmulation) {
      let mapping = { "mouse_up": "touch_up", "mouse_down": "touch_down", "mouse_move": "touch_move", "mouse_cancel": "touch_cancel" };
      if (ev.buttons !== 1 && name !== "mouse_up") return;
      if (this.grabbed !== null) {
        let pos0 = [ev.clientX, ev.clientY];
        let pos = this.grabbed.appToChild(pos0);
        let t = new Touch({ pos, state: mapping[name], nativeObject: ev, identifier: -1 });
        this.grabbed.emit(mapping[name], t);
      } else {
        let t = new Touch({ pos: this.app.toChild([ev.clientX, ev.clientY]), state: mapping[name], nativeObject: ev, identifier: -1 });
        this.app.childEmit(mapping[name], t, true);
      }
    } else {
      if (this.grabbed !== null) {
        this.grabbed.emit(name, ev);
      } else {
        this.app.childEmit(name, ev, true);
      }
    }
  }
  /**
   * 
   * @param {WheelEvent} ev 
   * @param {string} name 
   * @returns {boolean|undefined}
   */
  process_wheel(ev, name) {
    if (this.mouseev == null) return;
    this.app.requestFrameUpdate();
    if (this.grabbed != null) {
      let pos = this.grabbed.appToChild([this.mouseev.clientX, this.mouseev.clientY]);
      let t = new Touch({ pos, state: name, nativeObject: ev });
      return this.grabbed.emit(name, t);
    } else {
      let t = new Touch({ pos: this.app.toChild([this.mouseev.clientX, this.mouseev.clientY]), state: name, nativeObject: ev });
      this.app.childEmit(name, t, true);
    }
    ev.preventDefault();
  }
  vibrate(intensity1, intensity2, duration) {
    window.navigator.vibrate(duration);
  }
}
function evaluatedProperty(key, value, context, root) {
  if (typeof value === "string" || value instanceof String) {
    if (key.startsWith("on_")) {
      return new Function("resources", "parent", "root", `return function(event, object, value) {${value}}`).bind(context)(App.resources, context.parent, root);
    }
    if (value.trim().startsWith("(") && value.indexOf("=>") < value.indexOf("\n")) {
      const func = new Function("resources", "parent", "root", `return ${value}`).bind(context)(App.resources, context.parent, root);
      func["markupMethod"] = true;
      return func;
    }
    const objs = /* @__PURE__ */ new Set();
    let objCount = 0;
    if (value[0] !== "'" && value[0] !== '"') {
      for (let m of value.matchAll(/(?!\.)\b([a-z]\w*)\.([a-z_]\w*)\b/ig)) {
        const c = m[1];
        if (c !== "this" && c !== "parent" && c !== "root" && c !== "resources") objs.add(c);
        objCount++;
      }
    }
    if (objCount === 0) {
      return new Function("resources", `return ${value};`)(App.resources);
    }
    const objStr = [...objs].join(", ");
    const functionBody = `return function (${objStr}) { return ${value} }`;
    const dynamicFunc = new Function("resources", "parent", "root", functionBody)(App.resources, context.parent, root).bind(context);
    dynamicFunc["text"] = `(${objStr}) => ${value}`;
    return dynamicFunc;
  }
  return value;
}
function appendToArrayProperty(object, property, value) {
  if (property in object) object[property].push(value);
  else object[property] = [value];
}
function splitFirst(str, separator) {
  const index = str.indexOf(separator);
  if (index === -1) {
    return [str, ""];
  }
  const leftPart = str.substring(0, index);
  const rightPart = str.substring(index + 1);
  return [leftPart, rightPart];
}
function getCodeBlock(markup2, lineNum, indentLevel) {
  const startingIndentLevel = indentLevel;
  let line = markup2[lineNum];
  for (indentLevel = 0; line[indentLevel] === " " && indentLevel < line.length; indentLevel++) ;
  if (indentLevel <= startingIndentLevel) {
    throw Error(`Syntax error: invalid declaration on ${lineNum}
${markup2[lineNum - 1]}
Declared object is neither a known class nor a valid property declaration`);
  }
  let code = line;
  lineNum++;
  while (indentLevel > startingIndentLevel && lineNum < markup2.length) {
    line = markup2[lineNum];
    for (indentLevel = 0; line[indentLevel] === " " && indentLevel < line.length; indentLevel++) ;
    if (indentLevel > startingIndentLevel) {
      code += "\n" + line;
      lineNum++;
    }
  }
  return [code, lineNum, indentLevel];
}
function parseClassData(markup2, className, lineNum, indentLevel, currentObject) {
  const startingIndentLevel = indentLevel;
  let line = markup2[lineNum];
  for (indentLevel = 0; line[indentLevel] === " " && indentLevel < line.length; indentLevel++) ;
  if (indentLevel <= startingIndentLevel) return [lineNum, indentLevel];
  const requiredIndentLevel = indentLevel;
  while (true) {
    if (lineNum >= markup2.length) return [lineNum, indentLevel];
    line = markup2[lineNum];
    if (line.trim() === "" || line.trim().startsWith("#") || line.trim().startsWith("//")) {
      lineNum++;
      continue;
    }
    for (indentLevel = 0; line[indentLevel] === " " && indentLevel < line.length; indentLevel++) ;
    if (indentLevel > requiredIndentLevel) throw Error(`Syntax error on line ${lineNum + 1}
${line}`);
    if (indentLevel < requiredIndentLevel) return [lineNum, indentLevel];
    if (line.includes(":")) {
      line = line.trim();
      if (line.endsWith(":")) {
        const prop = line.slice(0, line.length - 1);
        if (prop in App.classes) {
          const childObject = { cls: prop };
          [lineNum, indentLevel] = parseClassData(markup2, className, lineNum + 1, indentLevel, childObject);
          appendToArrayProperty(currentObject, "children", childObject);
        } else {
          let codeBlock;
          [codeBlock, lineNum, indentLevel] = getCodeBlock(markup2, lineNum + 1, indentLevel);
          currentObject[prop] = codeBlock;
        }
      } else {
        const [key, valueStr] = splitFirst(line, ":").map((item) => item.trim());
        currentObject[key] = valueStr;
        lineNum++;
      }
    } else {
      throw Error(`Syntax error on line ${lineNum + 1}
${line}`);
    }
  }
}
function instanceClassData(widget, objectData, rootWidget) {
  const props = {};
  const clsName = widget.constructor.name;
  const clsData = App.rules.get(clsName);
  const merged = { ...clsData, ...objectData };
  for (let p in merged) {
    const val = merged[p];
    if ("children" === p && val instanceof Array) {
      const ch = [];
      for (let c of val) {
        if (c instanceof Object && "cls" in c) {
          const [cls, clsExtends] = App.classes[c["cls"]];
          const childWidget = new cls();
          instanceClassData(childWidget, c, rootWidget);
          ch.push(childWidget);
        } else {
          throw Error(`Unknown child class ${c} on clsName ${clsName}`);
        }
      }
      if (widget instanceof App) widget.baseWidget.children = ch;
      else widget.children = ch;
    } else if ("cls" !== p) {
      try {
        props[p] = evaluatedProperty(p, val, widget, rootWidget);
      } catch {
        props[p] = val;
      }
    }
  }
  widget.updateProperties(props, false);
}
function createNamedClass(className, baseClass) {
  return {
    [className]: class extends baseClass {
    }
  }[className];
}
function parse(markup2) {
  const lines = markup2.split("\n");
  const stack = [];
  let requiredIndentLevel = 0;
  let indentLevel = 0;
  let lineNum = 0;
  while (lineNum < lines.length) {
    let line = lines[lineNum];
    if (line.trim() === "" || line.trim().startsWith("#") || line.trim().startsWith("//")) {
      lineNum++;
      continue;
    }
    for (indentLevel = 0; indentLevel < line.length && line[indentLevel] === " "; ++indentLevel) ;
    if (indentLevel !== requiredIndentLevel) {
      throw Error(
        `Indentation error -- level ${indentLevel} used when ${requiredIndentLevel} expected on line # ${lineNum + 1}.
` + line
      );
    }
    line = line.trim();
    if (line.endsWith(":")) {
      const classType = line.replace(":", "");
      if (line.startsWith("<") && line.includes("@")) {
        const [customClass, baseClass] = classType.slice(1, -1).split("@");
        const cls = createNamedClass(customClass, App.classes[baseClass][0]);
        const clsData = {};
        [lineNum, indentLevel] = parseClassData(lines, customClass, lineNum + 1, indentLevel, clsData);
        App.classes[customClass] = [cls, baseClass];
        App.rules.add(customClass, clsData);
      } else if (line.startsWith("<")) {
        const ruledClasses = classType.slice(1, -1).split(",").map((s) => s.trim());
        for (let rc of ruledClasses) {
          const [cls, base] = App.classes[rc];
          const ruleset = App.rules.get(rc);
          [lineNum, indentLevel] = parseClassData(lines, cls, lineNum + 1, indentLevel, ruleset);
          App.rules.add(rc, ruleset);
        }
      } else {
        const widget = new App.classes[classType][0]();
        const clsData = {};
        [lineNum, indentLevel] = parseClassData(lines, classType, lineNum + 1, indentLevel, clsData);
        instanceClassData(widget, clsData, widget);
        stack.push(widget);
      }
    } else {
      throw Error(`Syntax error: Invalid declation on ${lineNum}
${line}`);
    }
  }
  return stack;
}
class Timer {
  /**
   * Construct a new timer object that will trigger when the elapsed time exceeds the timer value
   * @param {number} time time until the timer will trigger
   * @param {number} initElapsed initial elapsed time 
   * @param {null|((event:string, timer:Timer)=>void)} callback callback function called when timer is triggered
   */
  constructor(time, initElapsed = 0, callback = null) {
    this.elapsed = 0;
    this.timer = time;
    this.triggered = false;
    this.callback = callback;
    if (initElapsed > 0) {
      this.tick(initElapsed);
    }
  }
  /**
   * Return true if timer has finished, i.e., elapsed time exceeds timer.
   * @returns {boolean}
   */
  finished() {
    return this.elapsed >= this.timer;
  }
  /**
   * Called to update the timer, i.e., adds millis to the timer.
   * The App will call this during it's update loop for timers added with App.addTimer
   * @param {number} millis amount of time to increment the timer 
   * @returns {boolean} true if the timer was triggered this tick. 
   */
  tick(millis) {
    if (this.elapsed >= this.timer) {
      if (this.triggered) this.triggered = false;
      return false;
    }
    this.elapsed += millis;
    if (this.elapsed >= this.timer) {
      if (this.callback != null) this.callback("timer", this);
      this.triggered = true;
      return true;
    }
    return false;
  }
  /**
   * Reset the timer
   * @param {number} time - amount of time in ms to set the timer for (negative values leaves current time) 
   * @param {number} initElapsed - initial amount of elapsed time
   */
  reset(time = -1, initElapsed = 0) {
    this.triggered = false;
    if (time >= 0) this.timer = time;
    if (initElapsed > 0) {
      this.tick(initElapsed);
    }
  }
}
class Resource {
  /**
   * 
   * @param {App} app 
   * @param {number} millis 
   */
  update(app, millis) {
  }
}
class Rules {
  constructor() {
    this.rules = /* @__PURE__ */ new Map();
  }
  /**
   * Adds a rules object for a specified class
   * @param {string} widgetClass 
   * @param {Object} ruleProperties Object containing the default properties to be applied for this class
   * @param {Object} replace If true, removes all current properties (if they exist) and replaces them with `ruleProperties`. If false, merges with current properties.
   */
  add(widgetClass, ruleProperties, replace = true) {
    let curRuleset = this.rules.get(widgetClass);
    if (curRuleset && !replace) {
      for (let p in curRuleset) {
        curRuleset[p] = ruleProperties[p];
      }
    } else {
      this.rules.set(widgetClass, ruleProperties);
    }
  }
  /**
   * Retrieve the rules object for the specified class
   * @param {string} widgetClass 
   * @returns {Object}
   */
  get(widgetClass) {
    return this.rules.get(widgetClass) ?? {};
  }
  /**
   * Remove and return the rules object for the specified class
   * @param {string} widgetClass 
   */
  remove(widgetClass) {
    return this.rules.delete(widgetClass);
  }
}
class EventConnection {
  /**
   * 
   * @param {Widget|EventSink|null} listener 
   * @param {string} event 
   * @param {EventCallbackNullable} callback 
   */
  constructor(listener, event, callback) {
    this.listener = listener;
    this.event = event;
    this.callback = callback;
  }
}
class EventManager {
  constructor() {
    this.connections = /* @__PURE__ */ new Map();
  }
  /**
   * 
   * @param {Widget|EventSink|null} listener 
   * @param {Widget|EventSink} emitter 
   * @param {string} event 
   * @param {EventCallbackNullable} callback 
   */
  bind(listener, emitter, event, callback) {
    let conn = new EventConnection(listener, event, callback);
    let conns = this.connections.get(emitter);
    if (conns) conns.add(conn);
    else this.connections.set(emitter, /* @__PURE__ */ new Set([conn]));
  }
  /**
   * 
   * @param {Widget|EventSink} emitter 
   * @param {string} event 
   * @param {*} data 
   */
  emit(emitter, event, data) {
    const conns = this.connections.get(emitter);
    if (!conns) return false;
    for (let conn of conns) {
      if (conn.event === event && conn.callback(event, emitter, data)) return true;
    }
    return false;
  }
  /**
   * Remove all connections associated with this widget
   * @param {*} widget 
   */
  disconnect(widget) {
    this.connections.delete(widget);
    for (let emitter of this.connections.keys()) {
      const deleteList = [];
      const conns = this.connections.get(emitter);
      if (!conns) continue;
      for (let conn of conns) {
        if (conn.listener === widget) deleteList.push(conn);
      }
      deleteList.forEach((conn) => conns.delete(conn));
    }
  }
}
class WidgetAnimation {
  /**@type {Array<[AnimationProperties, number]>} The sequentially applied stack of animation effects (each effect can comprise multiple animations)*/
  stack = [];
  /**@type {Widget|null} */
  widget = null;
  /**@type {AnimationProperties} */
  props = {};
  /**@type {number} */
  elapsed = 0;
  /**
   * Add animation effect to the stack of effects (the stack is animated sequentially). Multiple properties can be
   * altered with each effect.
   * @param {AnimationProperties} props Widget properties affected and corresponding transformation of this effect 
   * @param {number} duration Duration of effect in milliseconds
   */
  add(props, duration = 1e3) {
    this.stack.push([props, duration]);
  }
  /**
   * Update the animation. Completed animations are poped off the stack.
   * @param {number} millis Time in millisecond that have elapsed since last update
   */
  update(app, millis) {
    if (this.widget === null) return;
    let targetProps = this.stack[0][0];
    let duration = this.stack[0][1];
    if (this.elapsed == 0) {
      this.initProps = {};
      for (let p in targetProps) {
        this.initProps[p] = this.widget[p];
      }
    }
    let skip = this.elapsed + millis - duration;
    this.elapsed = skip < 0 ? this.elapsed + millis : duration;
    let wgt = duration == 0 ? 1 : this.elapsed / duration;
    if (skip < 0) {
      for (let p in this.initProps) {
        let x = targetProps[p];
        if (typeof x === "number") {
          this.widget[p] = (1 - wgt) * this.initProps[p] + wgt * x;
        }
      }
    } else {
      for (let p in this.initProps) {
        let x = targetProps[p];
        if (typeof x === "number") {
          this.widget[p] = x;
        }
      }
      this.stack = this.stack.slice(1);
      this.elapsed = skip;
      if (this.stack.length == 0) this.cancel();
      else {
        this.initProps = {};
        for (let p in this.stack[0][0]) {
          this.initProps[p] = this.widget[p];
        }
      }
    }
  }
  /**
   * Start the animation (note that you must add effects, usually before 
   * calling start for the animation to do anything useful).
   * @param {Widget} widget The widget the animation is applied to.
   */
  start(widget) {
    this.widget = widget;
    widget._animation = this;
  }
  /**Cancels the animation by clearing the animation property of the attached
   * widget, which means it will no longer be updated.
   */
  cancel() {
    if (this.widget !== null) {
      this.widget._animation = null;
      this.widget.emit("animationComplete", this);
    }
  }
}
class Widget extends Rect {
  /**@type {string|null} Background color of the widget, transparent (i.e., no fill) if null*/
  bgColor = null;
  /**@type {string|null} Color of outline drawn around the widget, no outline if null*/
  outlineColor = null;
  /**@type {WidgetAnimation|null} The animation currently being applied to this widget (null if none being applied)*/
  _animation = null;
  /**@type {boolean} Flag to indicate whether the layout for this widget and its children needs to be udpated*/
  _layoutNotify = false;
  //By default, we don't notify about layout events because that's a lot of function calls across a big widget collection
  /**@type {WidgetSizeHints} Sizing hints for the widget*/
  hints = {};
  /**
   * Widget provides the base interface for all interactable objects in ESKV
   * Widget constructor can be passed properties to instantiate it
   * @param {WidgetProperties|null} properties Object containing property values to set
   * @returns 
   */
  constructor(properties = null) {
    super();
    this.parent = null;
    this._processTouches = false;
    this._deferredProps = null;
    this._children = [];
    this._needsLayout = true;
    if (properties != null) {
      this.updateProperties(properties);
    }
    return new Proxy(this, {
      set(target, name, value, receiver) {
        if (typeof name === "string") {
          if (["x", "y", "w", "h", "children", "rect"].includes(name) || name[0] == "_") return Reflect.set(target, name, value, receiver);
        }
        Reflect.set(target, name, value, receiver);
        if (typeof name === "string") {
          Reflect.apply(target["emit"], receiver, [name, value]);
        }
        return true;
      }
    });
  }
  /**@type {Rect|[number,number,number,number]} read/write access to the Rect containing the positional data of the widget*/
  set rect(rect) {
    this[0] = rect[0];
    this[1] = rect[1];
    this[2] = rect[2];
    this[3] = rect[3];
    this._needsLayout = true;
  }
  get rect() {
    return new Rect([this[0], this[1], this[2], this[3]]);
  }
  /**deferredProperties looks for properties that were defined as a callback that defines
   * a relationship linking this property to properties of this or another widget. It then 
   * binds that callback to all of those properties in the App widget tree. This function
   * is called by the framework and does not need to be called by user code.
   */
  deferredProperties(app) {
    let properties = this._deferredProps;
    this._deferredProps = null;
    for (let p in properties) {
      if (!p.startsWith("on_") && !p.startsWith("_") && typeof properties[p] == "function") {
        let func = properties[p];
        let args, rval;
        [args, rval] = (func["text"] ?? func.toString()).split("=>");
        args = args.replace("(", "").replace(")", "").split(",").map((a) => a.trim());
        let objs = args.map((a) => app.findById(a));
        let obmap = {};
        for (let a of args) {
          obmap[a] = app.findById(a);
        }
        const re = /(\w+)\.(\w+)/g;
        for (let pat of rval.matchAll(re)) {
          let pr, ob;
          [ob, pr] = pat.slice(1);
          if (ob === "this") this.bind(pr, (evt, obj, data) => {
            try {
              this[p] = func(...objs);
            } catch (error) {
              console.log("Dynamic binding error", this, p, error);
            }
          });
          else if (ob in obmap) {
            try {
              obmap[ob].bind(pr, (evt, obj, data) => {
                try {
                  this[p] = func(...objs);
                } catch (error) {
                  console.log("Dynamic binding error", this, p, error);
                }
              });
            } catch (error) {
              console.log(`Warning: ${ob} cannot be bound on`, this, "\nproperty", p, "\nerror", error);
            }
          }
        }
        try {
          this[p] = func(...objs);
        } catch (error) {
          console.log("Dynamic binding error", this, p, error);
        }
      }
    }
  }
  /**
   * Update the properties of the Widget
   * @param {WidgetProperties} properties Object containing properties to udpate
   */
  updateProperties(properties, applyRuleData = true) {
    if (applyRuleData) {
      instanceClassData(this, {}, this);
    }
    for (let p in properties) {
      if (!p.startsWith("on_") && !p.startsWith("_") && typeof properties[p] == "function" && !("markupMethod" in properties[p])) {
        this._deferredProps = properties;
      } else {
        this[p] = properties[p];
      }
    }
  }
  /**
   * Bind a callback to property changes of this Widget
   * @param {string} event name of property to bind to (the event)
   * @param {EventCallbackNullable} func callback function to trigger when property changes
   * @param {Widget|EventSink|null} listener
   */
  bind(event, func, listener = null) {
    App.get()._eventManager.bind(listener, this, event, func);
  }
  /** 
   * Called internally by the widget to emit property changes on_<event> handlers 
   * @param {string} event name of property to ubbind 
   * @param {any} data data value to send
   */
  emit(event, data) {
    if ("on_" + event in this) {
      if (this["on_" + event](event, this, data)) return true;
    }
    return App.get()._eventManager.emit(this, event, data);
  }
  /**
  * Iterates over the entire set of descendents from this widget.
  * Use sparingly in larger apps.
  * @param {boolean} recursive iterates recursively through children 
  * @param {boolean} inView excludes widgets that are hidden from view
  * @yields {Widget}
  */
  *iter(recursive = true, inView = true) {
    yield this;
    if (!recursive) return;
    for (let c of this._children) {
      yield* c.iter(...arguments);
    }
  }
  /**
   * Iterates recursively through the widget tree to find all parents of this Widget
   * @yields {Widget}
   */
  *iterParents() {
    if (this.parent === null) return;
    yield this.parent;
    if (this.parent != App.get()) yield* this.parent.iterParents();
  }
  /**
   * Find the first widget in the heirarchy whose id property matches the value id
   * @param {string} id the id to search for
   * @returns {Widget|null}
   */
  findById(id) {
    for (let w of this.iter(true, false)) {
      if ("id" in w && w.id == id) return w;
    }
    return null;
  }
  /**
   * Iterator to yield widgets in the widget tree below this widget that match a particular
   * property name and value. Use sparingly in larger Apps (probaby OK during
   * setup but bad if called every update).
   * @param {string} property Property name to find 
   * @param {string|number} value Value the property must have
   * @yields {Widget}
   */
  *iterByPropertyValue(property, value) {
    for (let w of this.iter(true, false)) {
      if (property in w && w[property] == value) yield w;
    }
  }
  /**
   * Retrieves the full transform for this widget's children
   * from relative to the App. 
   * @param {boolean} [includeSelf=false]
   * @param {Widget|null} widget 
   * @returns {DOMMatrix}
   */
  getTransformRecurse(includeSelf = false, widget = null) {
    let transform = this !== widget && this.parent !== null ? this.parent.getTransformRecurse(true, widget) : new DOMMatrix();
    if (!includeSelf) return transform;
    let newT = this.getTransform();
    if (newT) {
      return transform.multiply(newT);
    } else {
      return transform;
    }
  }
  /**
   * Returns the transform matrix for this widget
   * if it exists, otherwise null. By default this
   * tranform is used by the _draw and on_touch* 
   * methods. A user-defined widget that wants to
   * adapt the context may only need to override
   * getTransform to get their desired behavior.
   * @returns {DOMMatrix|null} 
   */
  getTransform() {
    return null;
  }
  /**
   * Returns a transformed point by applying 
   * the sequence of transforms from ancestor
   * widget `firstWidget`.
   * @param {Vec2} pt 
   * @param {boolean} [recurse=false] 
   * @param {boolean} [includeSelf=false] 
   * @param {boolean} [invert=false] 
   * @param {Widget|null} [firstWidget=null]
   * @returns {Vec2} 
   */
  applyTransform(pt, invert = false, recurse = false, includeSelf = false, firstWidget = null) {
    let tx = recurse ? this.getTransformRecurse(includeSelf, firstWidget) : this.getTransform();
    if (!tx) return pt;
    if (invert) tx = tx.inverse();
    let dp = tx.transformPoint(new DOMPoint(pt.x, pt.y));
    return new Vec2([dp.x, dp.y]);
  }
  /**
   * Converts position data from App space to widget space
   * (App space is in pixels, widget is in tiles). Primarily
   * used to convert touch/mouse coordinates in pixels
   * to widget space.
   * @param {Array<number>} pos 
   * @returns {Array<number>}
   */
  appToWidget(pos, recurse = true) {
    if (this.parent) {
      let pt = this.parent.getTransformRecurse().inverse().transformPoint(new DOMPoint(pos[0], pos[1]));
      return new Vec2([pt.x, pt.y]);
    }
    return pos;
  }
  /**
   * Converts position data from App space to the space
   * of this widget's children.
   * (App space is in pixels, child is in tiles). Primarily
   * used to convert touch/mouse coordinates in pixels
   * to widget space.
   * @param {Array<number>} pos 
   * @returns {Array<number>}
   */
  appToChild(pos, recurse = true) {
    let pt = this.getTransformRecurse().inverse().transformPoint(new DOMPoint(pos[0], pos[1]));
    return new Vec2([pt.x, pt.y]);
  }
  /**
   * Converts position data from parent space to child space
   * (Most widgets have the same coordinate system as the parent)
   * Primarily used to convert touch/mouse coordinates in pixels
   * to widget space.
   * @param {Array<number>} pos 
   * @returns {Array<number>}
   */
  toChild(pos) {
    let tx = this.getTransform();
    if (!tx) return pos;
    let pt = tx.inverse().transformPoint(new DOMPoint(pos[0], pos[1]));
    return new Vec2([pt.x, pt.y]);
  }
  /**
   * Adds a child widget to this widget
   * @param {Widget} child The child widget to add
   * @param {number} pos The position in the children list to add the widget at
   */
  addChild(child, pos = -1) {
    if (pos == -1) {
      this._children.push(child);
    } else {
      this._children = [...this._children.slice(0, pos), child, ...this._children.slice(pos)];
    }
    this.emit("child_added", child);
    child.parent = this;
    this._needsLayout = true;
  }
  /**
   * Remove a child widget from this widget
   * @param {Widget} child The child widget to add
   */
  removeChild(child, disconnect = true) {
    this._children = this.children.filter((c) => c != child);
    if (disconnect) App.get()._eventManager.disconnect(child);
    this.emit("child_removed", child);
    child.parent = null;
    this._needsLayout = true;
  }
  /**@type {Widget[]} Read/write access to the list of child widgets*/
  get children() {
    return this._children;
  }
  set children(children) {
    for (let c of this._children) {
      this.emit("child_removed", c);
      c.parent = null;
      this._needsLayout = true;
    }
    this._children = [];
    for (let c of children) {
      this.addChild(c);
    }
  }
  /** @type {number} Leftmost position of the widget on the x-axis*/
  set x(val) {
    this._needsLayout = true;
    this[0] = val;
  }
  /** @type {number} Center position of the widget on the x-axis*/
  set center_x(val) {
    this._needsLayout = true;
    this[0] = val - this[2] / 2;
  }
  /** @type {number} Rightmost position of the widget on the y-axis*/
  set right(val) {
    this._needsLayout = true;
    this[0] = val - this[2];
  }
  /** @type {number} Topmost position of the widget on the y-axis*/
  set y(val) {
    this._needsLayout = true;
    this[1] = val;
  }
  /** @type {number} Center position of the widget on the y-axis*/
  set center_y(val) {
    this._needsLayout = true;
    this[1] = val - this[3] / 2;
  }
  /** @type {number} Bottom-most position of the widget on the y-axis*/
  set bottom(val) {
    this._needsLayout = true;
    this[1] = val - this[3];
  }
  /** @type {number} Width of the widget*/
  set w(val) {
    this._needsLayout = true;
    this[2] = val;
  }
  /** @type {number} Height of the widget*/
  set h(val) {
    this._needsLayout = true;
    this[3] = val;
  }
  get x() {
    return this[0];
  }
  get center_x() {
    return this[0] + this[2] / 2;
  }
  get right() {
    return this[0] + this[2];
  }
  get y() {
    return this[1];
  }
  get center_y() {
    return this[1] + this[3] / 2;
  }
  get bottom() {
    return this[1] + this[3];
  }
  get w() {
    return this[2];
  }
  get h() {
    return this[3];
  }
  /**
   * Handler for wheel events activated on the widget. This method will be called recursively on the widget tree
   * and stop if any of the widget instances of on_wheel return false.
   * @param {string} event 
   * @param {Touch} wheel 
   * @returns {boolean} true if event was handled and should stop propagating, false otherwise
   */
  on_wheel(event, object, wheel) {
    for (let i = this._children.length - 1; i >= 0; i--) if (this._children[i].emit(event, wheel)) return true;
    return false;
  }
  /**
   * Handler for touch or mouse down events activated on the widget. This method will be called recursively on the widget tree
   * and stop if any of the widget instances of on_touch_down return false.
   * @param {string} event 
   * @param {Touch} touch
   * @returns {boolean} true if event was handled and should stop propagating, false otherwise
   */
  on_touch_down(event, object, touch) {
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      for (let i = this._children.length - 1; i >= 0; i--) if (this._children[i].emit(event, t)) return true;
    } else {
      for (let i = this._children.length - 1; i >= 0; i--) if (this._children[i].emit(event, touch)) return true;
    }
    return false;
  }
  /**
   * Handler for touch or mouse up events activated on the widget This method will be called recursively on the widget tree
   * and stop if any of the widget instances of on_touch_up return false. The touches are traversed through children
   * in reverse order to match the intuitiion that the topmost widget should be processed first.
   * @param {string} event 
   * @param {Touch} touch
   * @returns {boolean} true if event was handled and should stop propagating, false otherwise
   */
  on_touch_up(event, object, touch) {
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      for (let i = this._children.length - 1; i >= 0; i--) if (this._children[i].emit(event, t)) return true;
    } else {
      for (let i = this._children.length - 1; i >= 0; i--) if (this._children[i].emit(event, touch)) return true;
    }
    return false;
  }
  /**
   * Handler for touch or mouse move events activated on the widget This method will be called recursively on the widget tree
   * and stop if any of the widget instances of on_touch_move return false.
   * @param {string} event 
   * @param {Touch} touch
   * @returns {boolean} true if event was handled and should stop propagating, false otherwise
   */
  on_touch_move(event, object, touch) {
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      for (let i = this._children.length - 1; i >= 0; i--) if (this._children[i].emit(event, t)) return true;
    } else {
      for (let i = this._children.length - 1; i >= 0; i--) if (this._children[i].emit(event, touch)) return true;
    }
    return false;
  }
  /**
   * Handler for touch or mouse cancel events activated on the widget This method will be called recursively on the widget tree
   * and stop if any of the widget instances of on_touch_cancel return false.
   * @param {string} event 
   * @param {Touch} touch
   * @returns {boolean} true if event was handled and should stop propagating, false otherwise
   */
  on_touch_cancel(event, object, touch) {
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      for (let i = this._children.length - 1; i >= 0; i--) if (this._children[i].emit(event, t)) return true;
    } else {
      for (let i = this._children.length - 1; i >= 0; i--) if (this._children[i].emit(event, touch)) return true;
    }
    return false;
  }
  /**
   * Handler for back button (DO NOT USE, DOES NOT WORK) This method will be called recursively on the widget tree
   * and stop if any of the widget instances of on_wheel return false.
   * @param {string} event 
   * @param {*} history
   * @returns {boolean} true if event was handled and should stop propagating, false otherwise
   */
  on_back_button(event, object, history2) {
    return false;
  }
  /**
   * Returns sizing information for a widget positional property based on hint rules
   * @param {Widget} widget 
   * @param {string} target 
   * @param {string|number} rule 
   * @param {number|null} parentWidth 
   * @param {number|null} parentHeight 
   * @returns {number}
   */
  getMetric(widget, target, rule, parentWidth = null, parentHeight = null) {
    let app = App.get();
    if (rule === null) {
      return widget[target];
    }
    let value = 0;
    let base = "relative";
    parentWidth = parentWidth ?? this.w;
    parentHeight = parentHeight ?? this.h;
    while (true) {
      if (rule.constructor == String) {
        let r2 = rule.slice(-2);
        if (r2 == "ww") {
          value = +rule.slice(0, -2) * widget.w;
          break;
        }
        if (r2 == "wh") {
          value = +rule.slice(0, -2) * widget.h;
          break;
        }
        if (r2 == "aw") {
          value = +rule.slice(0, -2) * app.dimW;
          base = "absolute";
          break;
        }
        if (r2 == "ah") {
          value = +rule.slice(0, -2) * app.dimH;
          base = "absolute";
          break;
        }
        let r1 = rule.slice(-1);
        if (r1 == "w") {
          value = +rule.slice(0, -1) * parentWidth;
          break;
        }
        if (r1 == "h") {
          value = +rule.slice(0, -1) * parentHeight;
          break;
        }
        value = +rule;
        break;
      }
      if (target == "w" || target == "x" || target == "center_x" || target == "right") {
        value = +rule;
        break;
      }
      value = +rule;
      break;
    }
    if (base == "relative") {
      if (["x", "center_x", "right"].includes(target)) value += this.x;
      if (["y", "center_y", "bottom"].includes(target)) value += this.y;
    }
    return value;
  }
  /**
   * Set the sizing information for a positional property of `widget` for property referenced in `target` based 
   * on hint `rule`.
   * @param {Widget} widget 
   * @param {string} target 
   * @param {string|number|null} rule 
   * @param {number|null} parentWidth 
   * @param {number|null} parentHeight 
   */
  applyHintMetric(widget, target, rule, parentWidth = null, parentHeight = null) {
    let app = App.get();
    if (rule === null) {
      return;
    }
    let value = 0;
    let base = "relative";
    parentWidth = parentWidth ?? this.w;
    parentHeight = parentHeight ?? this.h;
    while (true) {
      if (rule.constructor == String) {
        let r2 = rule.slice(-2);
        if (r2 == "ww") {
          value = +rule.slice(0, -2) * widget.w;
          break;
        }
        if (r2 == "wh") {
          value = +rule.slice(0, -2) * widget.h;
          break;
        }
        if (r2 == "aw") {
          value = +rule.slice(0, -2) * app.dimW;
          base = "absolute";
          break;
        }
        if (r2 == "ah") {
          value = +rule.slice(0, -2) * app.dimH;
          base = "absolute";
          break;
        }
        let r1 = rule.slice(-1);
        if (r1 == "w") {
          value = +rule.slice(0, -1) * parentWidth;
          break;
        }
        if (r1 == "h") {
          value = +rule.slice(0, -1) * parentHeight;
          break;
        }
        value = +rule;
        break;
      }
      if (target == "w" || target == "x" || target == "center_x" || target == "right") {
        value = +rule * parentWidth;
        break;
      }
      value = +rule * parentHeight;
      break;
    }
    if (base == "relative") {
      if (["x", "center_x", "right"].includes(target)) value += this.x;
      if (["y", "center_y", "bottom"].includes(target)) value += this.y;
    }
    widget[target] = value;
  }
  /**
   * Given the geometry of this widget and the App, sets the geometry of child `c` using its `hints` property.
   * Optionally pass `w` and `h` dimensions to be used in place of those properties on the parent widget.
   * @param {Widget} c 
   * @param {number|null} w 
   * @param {number|null} h 
   */
  applyHints(c, w = null, h = null) {
    let hints = c.hints;
    w = w ?? this.w;
    h = h ?? this.h;
    if ("w" in hints && hints["w"] != null && hints["w"].constructor == String && hints["w"].slice(-2) == "wh") {
      if (hints["h"] !== void 0) this.applyHintMetric(c, "h", hints["h"], w, h);
      if (hints["w"] !== void 0) this.applyHintMetric(c, "w", hints["w"], w, h);
    } else {
      if (hints["w"] !== void 0) this.applyHintMetric(c, "w", hints["w"], w, h);
      if (hints["h"] !== void 0) this.applyHintMetric(c, "h", hints["h"], w, h);
    }
    for (let ht in hints) {
      if (ht != "w" && ht != "h") this.applyHintMetric(c, ht, hints[ht], w, h);
    }
  }
  /**
   * On each frame update, the framework will call layoutChildren on each widget 
   * if the `_needsLayout` flag is set and will recursively reposition all 
   * child widgets based on positioning data of this widget and the hints 
   * information of the child widgets.
   * It may occasionally be useful to call manually but avoid if possible.
   * User-defined layout widgets will define their own layoutChildren method. 
   */
  layoutChildren() {
    if (this._layoutNotify) this.emit("layout", null);
    this._needsLayout = false;
    for (let c of this.children) {
      this.applyHints(c);
      c.layoutChildren();
    }
  }
  /**
   * Called automatically by the framework during the update loop to draw the widget and its 
   * children. This calls the actual draw method of this widget. The purpose of _draw is to 
   * allow the drawing context to be udpated by some widgets between drawing of the current 
   * widget and it's children. User-defined widgets that need control over child context like 
   * this should override this method with user-defined behavior.
   * @param {App} app Application instance
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} ctx rendering context
   * @param {number} millis time elapsed in milliseconds since the last update
   */
  _draw(app, ctx, millis) {
    this.draw(app, ctx);
    let transform = this.getTransform();
    if (transform) {
      ctx.save();
      ctx.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
      for (let c of this._children)
        c._draw(app, ctx, millis);
      ctx.restore();
      return;
    }
    for (let c of this._children)
      c._draw(app, ctx, millis);
  }
  /**
   * Unlike _draw, this method handles the actual drawing of this widget 
   * (the children's _draw and this widget's draw method are called in this widget's _draw method).
   * @param {App} app The application instance
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} ctx The drawing context (relevant transforms will have been applied)
   */
  draw(app, ctx) {
    let r = this.rect;
    ctx.beginPath();
    ctx.rect(r[0], r[1], r[2], r[3]);
    if (this.bgColor != null) {
      ctx.fillStyle = this.bgColor;
      ctx.fill();
    }
    if (this.outlineColor != null) {
      let lw = ctx.lineWidth;
      ctx.lineWidth = 1 / app.tileSize;
      ctx.strokeStyle = this.outlineColor;
      ctx.stroke();
      ctx.lineWidth = lw;
    }
  }
  /**
   * Update is called recursively on the widget tree starting from the App's udpate method
   * which responds to the DOM window's requestAnimationFrame. Note that drawing should be
   * delegated to the draw method of each widget.
   * @param {App} app the application instance
   * @param {number} millis time elapsed since last update
   */
  update(app, millis) {
    if (this._deferredProps != null) {
      this.deferredProperties(app);
    }
    if (this._animation != null) {
      this._animation.update(app, millis);
      app.requestFrameUpdate();
    }
    if (this._needsLayout) {
      this.layoutChildren();
      app.requestFrameUpdate();
    }
    for (let c of this._children) c.update(app, millis);
  }
}
class App extends Widget {
  /**
   * Object representing the singleton App instance
   * @type {App|null}
   */
  static appInstance = null;
  /** @type {Rules} */
  static rules = new Rules();
  /** @type {Map<string, Resource>} */
  static resources = /* @__PURE__ */ new Map();
  /** @type {WidgetClassInfo} */
  static classes = {};
  /**
   * 
   * @param {string} name 
   * @param {Function} cls 
   * @param {string} baseClsName
   */
  static registerClass(name, cls, baseClsName) {
    App.classes[name] = [cls, baseClsName];
  }
  /**
   * 
   * @param {Object|null} props 
   * @returns 
   */
  constructor(props = null) {
    if (App.appInstance != null) return App.appInstance;
    super();
    App.appInstance = this;
    window.app = this;
    this._eventManager = new EventManager();
    this.id = "app";
    this.w = -1;
    this.h = -1;
    this._baseWidget = new Widget({ hints: { x: 0, y: 0, w: 1, h: 1 } });
    this._baseWidget.parent = this;
    this._modalWidgets = [];
    this._udpateActive = true;
    this.pixelSize = 1;
    this.integerTileSize = false;
    this.exactDimensions = false;
    this.prefDimW = 32;
    this.prefDimH = 16;
    this.dimW = this.prefDimW;
    this.dimH = this.prefDimH;
    this.tileSize = this.getTileScale() * this.pixelSize;
    this.canvasName = "canvas";
    this.canvas = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeAmount = 0;
    this.timer_tick = null;
    this.timers = [];
    this.continuousFrameUpdates = false;
    this._requestedFrameUpdate = false;
    if (props) this.updateProperties(props);
  }
  /**
   * @type {Widget}
   * @readonly
   */
  get baseWidget() {
    return this._baseWidget;
  }
  /**
   * Add a timer with a callback that will be triggered
   * @param {number} duration - time in milliseconds for time
   * @param {(event:string, timer:Timer)=>void} callback - callback to trigger when duration has elapsed 
   * @returns 
   */
  addTimer(duration, callback) {
    let t = new Timer(duration, 0, callback);
    this.timers.push(t);
    return t;
  }
  /**
   * Remove a timer from the list of timers
   * @param {Timer} timer 
   */
  removeTimer(timer) {
    this.timers = this.timers.filter((t) => t != timer);
  }
  /**
   * Adds a ModalView object to the App, which will overlays the main app UI and take control of user interaction.
   * @param {ModalView} modal - the instance of the ModalView object to add
   */
  addModal(modal) {
    this._modalWidgets.push(modal);
    this._needsLayout = true;
  }
  /**
   * Removes a ModalView object, returns control to the prior ModalView in the list or if empty, the main App.
   * @param {ModalView} modal 
   */
  removeModal(modal) {
    this._modalWidgets = this._modalWidgets.filter((m) => m != modal);
  }
  /**
   * Static method to retrieve the singleton app instance
   * @returns {App}
   */
  static get() {
    if (!App.appInstance) App.appInstance = new App();
    return App.appInstance;
  }
  /**
   * Start the application runnning
   */
  start() {
    let that = this;
    this.setupCanvas();
    this.inputHandler = new InputHandler(this);
    window.onresize = () => that.updateWindowSize();
    this.updateWindowSize();
    setTimeout(() => this._start(), 1);
  }
  /**
   * Internal function to actually start the main application loop once the main window has been loaded
   */
  _start() {
    this.update();
  }
  /**
   * Reursively propagate an event (such as a touch event through the active widget heirarchy) 
   * until true is returned or there are no more widgets to propagate.
   * @param {string} event name of the event to propagate
   * @param {object} data object data to propagate
   * @param {boolean} topModalOnly send only to the topmost modal widget (used for touch events)
   * @returns {boolean} true if at least one widget processed the event and returned true
   */
  childEmit(event, data, topModalOnly = false) {
    if (topModalOnly && this._modalWidgets.length > 0) {
      return this._modalWidgets[this._modalWidgets.length - 1].emit(event, data);
    } else {
      if (this._baseWidget.emit(event, data)) return true;
      for (let mw of this._modalWidgets) {
        if (mw.emit(event, data)) return true;
      }
      return false;
    }
  }
  /**
   * Iterates over the entire widget tree including modal widgets.
   * Use sparingly in larger apps.
   * @param {boolean} recursive iterates recursively through children 
   * @param {boolean} inView excludes widgets that are hidden
   * @yields {Widget}
   */
  *iter(recursive = true, inView = true) {
    yield this;
    yield* this._baseWidget.iter(...arguments);
    for (let mw of this._modalWidgets) {
      yield* mw.iter(...arguments);
    }
  }
  /**
   * Find the first widget in the heirarchy whose id property matches the value id
   * @param {string} id the id to search for
   * @returns {Widget|null}
   */
  findById(id) {
    for (let w of this.iter(true, false)) {
      if ("id" in w && w.id == id) return w;
    }
    return null;
  }
  /**
   * Iterator to yield widgets in the heirarchy that match a particular
   * property name and value. Use sparingly in larger Apps (probaby OK during
   * setup but bad if called every update).
   * @param {string} property Property name to find 
   * @param {string|number} value Value the property must have
   * @yields {Widget}
   */
  *iterByPropertyValue(property, value) {
    for (let w of this.iter(true, false)) {
      if (property in w && w[property] === value) yield w;
    }
  }
  /**
   * Update is called by the DOM window's requestAnimationFrame to update 
   * the state of the widgets in the heirarchy and then draw them.
   */
  update() {
    this._udpateActive = true;
    this._requestedFrameUpdate = false;
    let millis = 15;
    let n_timer_tick = Date.now();
    if (this.timer_tick != null) {
      millis = Math.min(n_timer_tick - this.timer_tick, 30);
    }
    if (this.timers.length > 0 || this._needsLayout) this.requestFrameUpdate();
    for (let t of this.timers) {
      t.tick(millis);
    }
    if (this._needsLayout) {
      this.layoutChildren();
    }
    for (let res of App.resources.values()) res.update(this, millis);
    this._baseWidget.update(this, millis);
    for (let mw of this._modalWidgets) mw.update(this, millis);
    if (this.ctx) this._draw(this, this.ctx, millis);
    if (this.continuousFrameUpdates) this.requestFrameUpdate();
    this.timer_tick = n_timer_tick;
    if (this._requestedFrameUpdate) {
      window.requestAnimationFrame(() => this.update());
    }
    this._udpateActive = false;
  }
  requestFrameUpdate() {
    if (!this._requestedFrameUpdate) {
      if (this._udpateActive) {
        this._requestedFrameUpdate = true;
      } else {
        window.requestAnimationFrame(() => this.update());
      }
    }
  }
  /**
   * Draw is called during the update loop after all child widgets were updated
   * rendering to screen all widgets in the App in the order they were added to
   * the heirarchy (model widgets are always drawn after widgets in the baseWidget
   * chain).
   * @param {App} app - application instanace 
   * @param {CanvasRenderingContext2D} ctx - drawing context
   * @param {number} millis - time elapsed since last udpate 
   */
  _draw(app, ctx, millis) {
    if (!this.canvas) {
      return;
    }
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.shakeX = 0;
    this.shakeY = 0;
    this.screenShake();
    ctx.save();
    let tx = this.getTransform();
    if (tx) ctx.transform(tx.a, tx.b, tx.c, tx.d, tx.e, tx.f);
    this._baseWidget._draw(app, ctx, millis);
    for (let mw of this._modalWidgets) mw._draw(app, ctx, millis);
    ctx.restore();
  }
  // /**
  //  * Returns the matrix that converts from tile units to pixels.
  //  * This functions maybe called as part of a recursive chain from a descendant widget 
  //  * to recover the pixel position of a given position in tile units.
  //  * @param {[number, number]} pos 
  //  * @returns {[number, number]}
  //  */
  getTransform(recurse = true) {
    return new DOMMatrix().translate(this.offsetX + this.shakeX, this.offsetY + this.shakeY).scale(this.tileSize, this.tileSize);
  }
  on_prefDimW(e, o, v) {
    this.updateWindowSize();
  }
  on_prefDimH(e, o, v) {
    this.updateWindowSize();
  }
  on_tileSize(e, o, v) {
    if (this.prefDimH < 0 && this.prefDimW < 0) this.updateWindowSize();
  }
  /**
   * Resize event handler (updates the canvas size, tileSize, dimW, and dimH properties)
   */
  updateWindowSize() {
    this.x = 0;
    this.y = 0;
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    if (this.prefDimH >= 0 && this.prefDimW >= 0) this.tileSize = this.getTileScale();
    this.fitDimensionsToTileSize(this.tileSize);
    this.setupCanvas();
    try {
      screen.orientation.unlock();
    } catch (error) {
    }
    this._needsLayout = true;
    this.requestFrameUpdate();
  }
  /**
   * Returns the tile size in logical units given the screen dimensions and the preferred tile dimensions
   * @returns {number}
   */
  getTileScale() {
    let sh = this.h;
    let sw = this.w;
    let scale = 1 / this.pixelSize;
    if (this.prefDimW < 0 && this.prefDimH < 0) {
      if (this.tileSize > 0) scale = this.tileSize / this.pixelSize;
    } else if (this.prefDimW < 0) {
      scale = sh / this.prefDimH / this.pixelSize;
    } else if (this.prefDimH < 0) {
      scale = sw / this.prefDimW / this.pixelSize;
    } else {
      scale = Math.min(sh / this.prefDimH / this.pixelSize, sw / this.prefDimW / this.pixelSize);
    }
    if (this.integerTileSize && scale > 1) scale = Math.floor(scale);
    return scale * this.pixelSize;
  }
  /**
   * Updates dimH and dimW to best fit the window given the tileSize fot the aspect ratio
   * If `exactDimensions` flag is true, then dimH and dimW will always be set to the preferred dimensions
   * potentiall leaving the canvas much smaller than the window size on one of the dimensions and
   * smaller on both dimensions if `integerTileSize` is also true.
   * @param {number} scale; 
   */
  fitDimensionsToTileSize(scale) {
    let sh = this.h;
    let sw = this.w;
    if (this.exactDimensions) {
      if (this.prefDimW < 0 && this.prefDimH < 0) {
        this.dimW = sw / this.tileSize;
        this.dimH = sh / this.tileSize;
      } else if (this.prefDimH < 0) {
        this.dimW = this.prefDimW;
        this.dimH = sh / this.tileSize;
      } else if (this.prefDimW < 0) {
        this.dimW = sw / this.tileSize;
        this.dimH = this.prefDimH;
      } else {
        this.dimH = this.prefDimH;
        this.dimW = this.prefDimW;
      }
      return;
    }
    this.dimH = Math.floor(sh / scale);
    this.dimW = Math.floor(sw / scale);
  }
  /**
   * Initialize the canvas named canvasName in the DOM. Called automatically during construction 
   * and in response to window resize events. Usually should not need to be called 
   * by application programs
   */
  setupCanvas() {
    this.canvas = document.querySelector(this.canvasName);
    if (!this.canvas) {
      return;
    }
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) {
      return;
    }
    this.ctx.imageSmoothingEnabled = false;
    this.offsetX = Math.floor((this.w - this.tileSize * this.dimW) / 2);
    this.offsetY = Math.floor((this.h - this.tileSize * this.dimH) / 2);
  }
  /**
   * Given the geometry of the App, sets the geometry of children using their hints property
   * @param {Widget} c 
   */
  applyHints(c) {
    super.applyHints(c, this.dimW, this.dimH);
  }
  /**
   * Can be called during the update loop to implement screen shake
   */
  screenShake() {
    if (this.shakeAmount) {
      this.shakeAmount--;
    }
    let shakeAngle = Math.random() * Math.PI * 2;
    this.shakeX = Math.round(Math.cos(shakeAngle) * this.shakeAmount);
    this.shakeY = Math.round(Math.sin(shakeAngle) * this.shakeAmount);
  }
  /**
   * layoutChildren will recursively reposition all widgets based on positioning
   * data of the parent using the hints information of the child
   * Called during the update loop on widgets whose _needsLayout flag is true
   * Ocassionally useful to call manually but avoid if possible.
   */
  layoutChildren() {
    if (this._layoutNotify) this.emit("layout", null);
    this._needsLayout = false;
    this.applyHints(this._baseWidget);
    this._baseWidget.layoutChildren();
    for (let mw of this._modalWidgets) {
      this.applyHints(mw);
      mw.layoutChildren();
    }
  }
}
class Label extends Widget {
  /**@type {number|string|null} size of the font in tile units */
  fontSize = null;
  /**
   * @type {string} If label is part of a size group, the fontSize (not the rect) 
   * will be set to the smallest that will fit text to the rect for all Labels
   * in the group. */
  sizeGroup = "";
  /**@type {boolean} If clip is true, the text will be clipped to the bounding rect */
  clip = false;
  /**
   * @type {boolean} If ignoreSizeForGroup is true and this Label is part of a group,
   * this Label's fontSize will not be used to set the fontSize for the group (useful
   * in combination with clip to handle text that can be very long). */
  ignoreSizeForGroup = false;
  /**@type {string} name of the font */
  fontName = '"Nimbus Mono PS", "Courier New", monospace';
  /**@type {string} text displayed in the label*/
  text = "";
  /**@type {boolean} true to wrap long lines of text */
  wrap = false;
  /**@type {boolean} wraps at words if true, at character if false */
  wrapAtWord = true;
  /** @type {'left'|'center'|'right'} horizontal alignment, one of 'left','right','center'*/
  align = "center";
  /** @type {'top'|'middle'|'bottom'} vertical alignment, one of 'top','middle','bottom'*/
  valign = "middle";
  /** @type {string} text color, any valid HTML5 color string*/
  color = "white";
  /**
   * Constructs a label with optional specified properties. 
   * @param {LabelProperties|null} properties 
   * */
  constructor(properties = null) {
    super();
    this._textData = null;
    if (properties !== null) {
      this.updateProperties(properties);
    }
  }
  on_align(e, object, v) {
    this._needsLayout = true;
  }
  on_valign(e, object, v) {
    this._needsLayout = true;
  }
  on_wrap(e, object, v) {
    this._needsLayout = true;
  }
  on_wrapAtWord(e, object, v) {
    this._needsLayout = true;
  }
  on_text(e, object, v) {
    this._needsLayout = true;
  }
  on_fontSize(e, object, v) {
    this._needsLayout = true;
  }
  on_fontName(e, object, v) {
    this._needsLayout = true;
  }
  /**@type {Widget['layoutChildren']} */
  layoutChildren() {
    let app = App.get();
    let ctx = app.ctx;
    if (!ctx) return;
    let fontSize = this.fontSize === null ? null : this.getMetric(this, "fontSize", this.fontSize);
    if ("h" in this.hints && this.hints["h"] == null) {
      if (fontSize !== null) {
        this[3] = this.wrap ? sizeWrappedText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color, this.wrapAtWord)[1] : sizeText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color)[1];
      }
    }
    if ("w" in this.hints && this.hints["w"] == null) {
      if (fontSize !== null) {
        this[2] = this.wrap ? sizeWrappedText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color, this.wrapAtWord)[0] : sizeText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color)[0];
      }
    }
    fontSize = fontSize === null ? this.h / 2 : fontSize;
    if (this.fontSize === null && this.rect.w !== void 0) {
      let i = 0;
      let w, h;
      while (i < 50) {
        if (this.wrap) {
          [w, h] = sizeWrappedText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color, this.wrapAtWord);
        } else {
          [w, h] = sizeText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color);
        }
        if ((this.h >= h || "h" in this.hints && this.hints["h"] == null || fontSize < 0.01) && (this.w >= w || "w" in this.hints && this.hints["w"] == null)) {
          if ("h" in this.hints && this.hints["h"] == null) this.h = h;
          if ("w" in this.hints && this.hints["w"] == null) this.w = w;
          break;
        }
        const err = Math.min(1.1, this.w / w, this.h / h);
        if (this.wrap) {
          fontSize *= err ** 0.5;
        } else {
          fontSize *= err ** 1.1;
        }
        i++;
      }
      if (fontSize === void 0) fontSize = 1e-3 * App.get().h;
    }
    if (this.sizeGroup !== "") {
      this._bestFontSize = fontSize;
      this._textData = null;
    } else {
      if (this.wrap) {
        this._textData = getWrappedTextData(ctx, this.text, fontSize, this.fontName, this.align, this.valign, this.rect, this.color, this.wrapAtWord);
      } else {
        this._textData = getTextData(ctx, this.text, fontSize, this.fontName, this.align, this.valign, this.rect, this.color);
      }
    }
    super.layoutChildren();
  }
  sizeToGroup(ctx) {
    if (this._bestFontSize === void 0) return;
    let fontSize = Infinity;
    for (let lbl of App.get().iterByPropertyValue("sizeGroup", this.sizeGroup)) {
      if (fontSize > lbl._bestFontSize && !lbl.ignoreSizeForGroup) fontSize = lbl._bestFontSize;
    }
    if (fontSize > 0) {
      for (let lbl of App.get().iterByPropertyValue("sizeGroup", this.sizeGroup)) {
        const fs = lbl.clip || !lbl.ignoreSizeForGroup ? fontSize : lbl._bestFontSize;
        if (lbl.wrap) {
          lbl._textData = getWrappedTextData(ctx, lbl.text, fs, lbl.fontName, lbl.align, lbl.valign, lbl.rect, lbl.color, lbl.wrapAtWord);
        } else {
          lbl._textData = getTextData(ctx, lbl.text, fs, lbl.fontName, lbl.align, lbl.valign, lbl.rect, lbl.color);
        }
      }
    }
  }
  /**@type {Widget['draw']} */
  draw(app, ctx) {
    super.draw(app, ctx);
    if (this.clip) {
      ctx.save();
      const r = this.rect;
      ctx.rect(r.x, r.y, r.w, r.h);
      ctx.clip();
    }
    if (!this._textData && this.sizeGroup !== "") this.sizeToGroup(ctx);
    if (this._textData) {
      if (this.wrap) {
        drawWrappedText(ctx, this._textData, this.color);
      } else {
        drawText(ctx, this._textData, this.color);
      }
    }
    if (this.clip) ctx.restore();
  }
}
class Button extends Label {
  /**@type {string} Color of button (derives from widget)*/
  bgColor = colorString([0.5, 0.5, 0.5]);
  /**@type {string} Color of button when pressed down*/
  selectColor = colorString([0.7, 0.7, 0.8]);
  /**@type {string} Background color of button when disabled*/
  disableColor1 = colorString([0.2, 0.2, 0.2]);
  /**@type {string} Text color of button when disabled*/
  disableColor2 = colorString([0.4, 0.4, 0.4]);
  /**@type {boolean} */
  disable = false;
  /**
   * Constructs a button with specified properties in `properties`
   * @param {ButtonProperties|null} properties 
   */
  constructor(properties = null) {
    super();
    if (properties !== null) {
      this.updateProperties(properties);
    }
  }
  /**@type {Widget['on_touch_down']} */
  on_touch_down(event, object, touch) {
    if (super.on_touch_down(event, object, touch)) return true;
    if (!this.disable && this.collide(touch.rect)) {
      touch.grab(this);
      this._touching = true;
      return true;
    }
    return false;
  }
  /**@type {Widget['on_touch_up']} */
  on_touch_up(event, object, touch) {
    if (super.on_touch_up(event, object, touch)) return true;
    if (touch.grabbed != this) return false;
    touch.ungrab();
    if (!this.disable && this.collide(touch.rect)) {
      this._touching = false;
      this.emit("press", null);
      return true;
    }
    return false;
  }
  /**@type {Widget['on_touch_move']} */
  on_touch_move(event, object, touch) {
    if (super.on_touch_move(event, object, touch)) return true;
    if (touch.grabbed == this && !this.disable) {
      this._touching = this.collide(touch.rect);
    }
    return false;
  }
  /**@type {Widget['draw']} */
  draw(app, ctx) {
    let saved = this.bgColor;
    let saved2 = this.color;
    if (this._touching) this.bgColor = this.selectColor;
    if (this.disable) {
      this.bgColor = this.disableColor1;
      this.color = this.disableColor2;
    }
    super.draw(app, ctx);
    this.bgColor = saved;
    this.color = saved2;
  }
}
class BasicButton extends Widget {
  /**@type {string} Color of button (derives from widget)*/
  color = colorString([0.8, 0.8, 0.8]);
  /**@type {string} Color of button (derives from widget)*/
  bgColor = colorString([0.5, 0.5, 0.5]);
  /**@type {string} Color of button when pressed down*/
  selectColor = colorString([0.7, 0.7, 0.8]);
  /**@type {string} Background color of button when disabled*/
  disableColor1 = colorString([0.2, 0.2, 0.2]);
  /**@type {string} Text color of button when disabled*/
  disableColor2 = colorString([0.4, 0.4, 0.4]);
  /**@type {boolean} */
  disable = false;
  /**
   * Constructs a button with specified properties in `properties`
   * @param {BasicButtonProperties|null} properties 
   */
  constructor(properties = null) {
    super();
    if (properties !== null) {
      this.updateProperties(properties);
    }
  }
  /**@type {Widget['on_touch_down']} */
  on_touch_down(event, object, touch) {
    if (super.on_touch_down(event, object, touch)) return true;
    if (!this.disable && this.collide(touch.rect)) {
      touch.grab(this);
      this._touching = true;
      return true;
    }
    return false;
  }
  /**@type {Widget['on_touch_up']} */
  on_touch_up(event, object, touch) {
    if (super.on_touch_up(event, object, touch)) return true;
    if (touch.grabbed != this) return false;
    touch.ungrab();
    if (!this.disable && this.collide(touch.rect)) {
      this._touching = false;
      this.emit("press", null);
      return true;
    }
    return false;
  }
  /**@type {Widget['on_touch_move']} */
  on_touch_move(event, object, touch) {
    if (super.on_touch_move(event, object, touch)) return true;
    if (touch.grabbed == this && !this.disable) {
      this._touching = this.collide(touch.rect);
    }
    return false;
  }
  /**@type {Widget['draw']} */
  draw(app, ctx) {
    let saved = this.bgColor;
    let saved2 = this.color;
    if (this._touching) this.bgColor = this.selectColor;
    if (this.disable) {
      this.bgColor = this.disableColor1;
      this.color = this.disableColor2;
    }
    super.draw(app, ctx);
    this.bgColor = saved;
    this.color = saved2;
  }
}
class ToggleButton extends Label {
  /**@type {string} Color of button (derives from widget)*/
  bgColor = colorString([0.5, 0.5, 0.5]);
  /**@type {string} Color of button when pressed down*/
  pressColor = colorString([0.7, 0.7, 0.7]);
  /**@type {string} Color of button when pressed down*/
  selectColor = colorString([0.7, 0.7, 0.8]);
  /**@type {string} Background color of button when disabled*/
  disableColor1 = colorString([0.2, 0.2, 0.2]);
  /**@type {string} Text color of button when disabled*/
  disableColor2 = colorString([0.4, 0.4, 0.4]);
  /**@type {boolean} */
  disable = false;
  /**@type {boolean} State of the ToggleButton, true if checked and false if unchecked */
  _press = false;
  /**@type {string|null} If not null, the ToggleButton becomes part of a group where only one option in the group can be active */
  group = null;
  /**@type {boolean} If group is true, activating this button deactivates others  */
  singleSelect = true;
  /**
   * Constructs a new Checkbox with specified propertes in `props` 
   * @param {ToggleButtonProperties|null} [props=null] 
   */
  constructor(props = null) {
    super();
    if (props !== null) {
      this.updateProperties(props);
    }
  }
  /**@type {boolean}*/
  get press() {
    return this._press;
  }
  set press(value) {
    this._press = value;
  }
  /**@type {Widget['on_touch_down']} */
  on_touch_down(event, object, touch) {
    if (super.on_touch_down(event, object, touch)) return true;
    if (!this.disable && this.collide(touch.rect)) {
      touch.grab(this);
      this._touching = true;
      return true;
    }
    return false;
  }
  /**@type {Widget['on_touch_up']} */
  on_touch_up(event, object, touch) {
    if (touch.grabbed !== this) return false;
    touch.ungrab();
    this._touching = false;
    if (this.collide(touch.rect)) {
      if (this.group === null || !this.singleSelect) {
        this.press = !this.press;
      } else {
        if (this.parent !== null) {
          for (let w of this.parent.iterByPropertyValue("group", this.group)) {
            if (w !== this) w._press = false;
          }
        }
        this.press = true;
      }
      return true;
    }
    return false;
  }
  /**@type {Widget['on_touch_move']} */
  on_touch_move(event, object, touch) {
    if (touch.grabbed === this) {
      this._touching = this.collide(touch.rect);
      return true;
    }
    return false;
  }
  /**@type {Widget['draw']} */
  draw(app, ctx) {
    let saved = this.bgColor;
    let saved2 = this.color;
    if (this.press) this.bgColor = this.pressColor;
    if (this._touching) this.bgColor = this.selectColor;
    if (this.disable) {
      this.bgColor = this.disableColor1;
      this.color = this.disableColor2;
    }
    super.draw(app, ctx);
    this.bgColor = saved;
    this.color = saved2;
  }
}
class CheckBox extends Widget {
  /**@type {string} Color of checkbox when pressed down*/
  selectColor = colorString([0.7, 0.7, 0.8]);
  /**@type {string} Color of checkbox check when checked*/
  color = colorString([0.6, 0.6, 0.6]);
  /**@type {string} Color of checkbox outline when pressed down*/
  bgColor = colorString([0.5, 0.5, 0.5]);
  /**@type {string} Color of checkbox outline when pressed down*/
  disableColor1 = colorString([0.2, 0.2, 0.2]);
  /**@type {string} Color of checkbox check when disabled*/
  disableColor2 = colorString([0.3, 0.3, 0.3]);
  /**@type {boolean} Checkbox is disabled if true and cannot be interacted with*/
  disable = false;
  /**@type {boolean} State of the checkbox, true if checked and false if unchecked */
  check = false;
  /**@type {string|null} If part of a group, the checkbox becomes a radio box where only one option in the group can be active */
  group = null;
  /**
   * Constructs a new Checkbox with specified propertes in `props` 
   * @param {CheckBoxProperties|null} [props=null] 
   */
  constructor(props = null) {
    super();
    if (props !== null) {
      this.updateProperties(props);
    }
  }
  /**@type {Widget['on_touch_down']} */
  on_touch_down(event, object, touch) {
    if (super.on_touch_down(event, object, touch)) return true;
    if (!this.disable && this.collide(touch.rect)) {
      touch.grab(this);
      this._touching = true;
      return true;
    }
    return false;
  }
  /**@type {Widget['on_touch_up']} */
  on_touch_up(event, object, touch) {
    if (super.on_touch_up(event, object, touch)) return true;
    if (this.parent === null || touch.grabbed != this) return false;
    touch.ungrab();
    if (!this.disable && this.collide(touch.rect)) {
      this._touching = false;
      if (this.group == null) {
        this.check = !this.check;
      } else {
        for (let w of this.parent.iterByPropertyValue("group", this.group)) {
          if (w != this) w.check = false;
        }
        this.check = true;
      }
      return true;
    }
    return false;
  }
  /**@type {Widget['on_touch_move']} */
  on_touch_move(event, object, touch) {
    if (super.on_touch_move(event, object, touch)) return true;
    if (touch.grabbed == this && !this.disable) {
      this._touching = this.collide(touch.rect);
      return true;
    }
    return false;
  }
  /**@type {Widget['draw']} */
  draw(app, ctx) {
    if (this.group != null) {
      let r2 = this.rect;
      r2.w = r2.h = 0.5 * Math.min(r2.w, r2.h);
      r2.x = this.x + (this.w - r2.w) / 2;
      r2.y = this.y + (this.h - r2.h) / 2;
      let ts2 = App.get().tileSize;
      let ctx2 = App.get().ctx;
      if (!ctx2) return;
      ctx2.strokeStyle = this.disable ? this.disableColor1 : this.bgColor;
      ctx2.lineWidth = 1 / ts2;
      ctx2.beginPath();
      ctx2.arc(r2.center_x, r2.center_y, r2.w / 2, 0, 2 * Math.PI);
      ctx2.stroke();
      if (this._touching || this.disable) {
        ctx2.fillStyle = this.disable ? this.disableColor1 : this.selectColor;
        ctx2.fill();
      }
      if (this.check) {
        ctx2.fillStyle = this.disable ? this.disableColor2 : this.color;
        ctx2.beginPath();
        ctx2.arc(r2.center_x, r2.center_y, r2.w / 3, 0, 2 * Math.PI);
        ctx2.fill();
      }
      return;
    }
    let r = this.rect;
    r.w = r.h = 0.5 * Math.min(r.w, r.h);
    r.x = this.x + (this.w - r.w) / 2;
    r.y = this.y + (this.h - r.h) / 2;
    let ts = app.tileSize;
    ctx.beginPath();
    ctx.strokeStyle = this.bgColor;
    if (this.disable) {
      ctx.strokeStyle = this.disableColor1;
    }
    ctx.lineWidth = 1 / ts;
    ctx.rect(r[0], r[1], r[2], r[3]);
    ctx.stroke();
    if (this._touching) {
      ctx.fillStyle = this.selectColor;
      ctx.fill();
    }
    if (this.check) {
      ctx.strokeStyle = this.color;
      if (this.disable) {
        ctx.strokeStyle = this.disableColor2;
      }
      ctx.beginPath();
      ctx.lineWidth = r.w / 5;
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.right, r.bottom);
      ctx.moveTo(r.right, r.y);
      ctx.lineTo(r.x, r.bottom);
      ctx.stroke();
    }
  }
}
class Slider extends Widget {
  /**@type {string} Color of the slider button when pressed down*/
  selectColor = colorString([0.7, 0.7, 0.8]);
  /**@type {string} Color of the slider button*/
  color = colorString([0.6, 0.6, 0.6]);
  /**@type {string} Color of the groove and slider button outline*/
  bgColor = colorString([0.4, 0.4, 0.4]);
  /**@type {string} Color of the groove and slider button outline when disabled*/
  disableColor1 = colorString([0.2, 0.2, 0.2]);
  /**@type {string} Color of the slider button when disabled*/
  disableColor2 = colorString([0.3, 0.3, 0.3]);
  /**@type {boolean} Slider is greyed out and cannot be interacted with if disabled is true */
  disable = false;
  /**@type {number} Min value of slider */
  min = 0;
  /**@type {number|null} Max value of slider, if null there is no upper limit */
  max = 1;
  /**@type {number} current max for slider with no upper limit */
  curMax = 1;
  /**
   * @type {number} for unbounded slider sets `curMax` equal to this multiple of 
   * the current value after each slider release */
  unboundedStopMultiple = 10;
  /**@type {boolean} if true, the slider operates on an exponential scale */
  exponentialSlider = false;
  /**@type {number|null} Step increment of slider, continuous if null */
  step = null;
  /**@type {'horizontal'|'vertical'} Orientation of the slider */
  orientation = "horizontal";
  /**@type {number} The position of the slider */
  value = 0;
  /**@type {number} Size of the slider button as a fraction of the length of slider */
  sliderSize = 0.2;
  /**
   * Constructs a slider with specified properties in `props`
   * @param {SliderProperties|null} props 
   */
  constructor(props = null) {
    super();
    if (props !== null) {
      this.updateProperties(props);
    }
  }
  /**@type {(touch:Touch)=>void} */
  setValue(touch) {
    let max = this.max ?? this.curMax;
    let value = 0;
    if (this.orientation == "horizontal") value = clamp((touch.rect.x - this.x - this.w * this.sliderSize / 2) / (this.w * (1 - this.sliderSize)), 0, 1);
    if (this.orientation == "vertical") value = clamp((touch.rect.y - this.y - this.h * this.sliderSize / 2) / (this.h * (1 - this.sliderSize)), 0, 1);
    if (this.max === null && this.curMax / this.unboundedStopMultiple > this.min) {
      value = value > 0.5 ? max / this.unboundedStopMultiple + (value - 0.5) / 0.5 * (max - max / this.unboundedStopMultiple) : this.min + value / 0.5 * (max / this.unboundedStopMultiple - this.min);
    } else {
      value = this.min + (max - this.min) * value;
    }
    if (this.step != null) value = Math.round(value / this.step) * this.step;
    this.value = value;
  }
  /**@type {Widget['on_touch_down']} */
  on_touch_down(event, object, touch) {
    if (super.on_touch_down(event, object, touch)) return true;
    if (!this.disable && this.collide(touch.rect)) {
      touch.grab(this);
      this._touch = true;
      this.setValue(touch);
      return true;
    }
    return false;
  }
  updateMax() {
    if (this.max === null) this.curMax = this.unboundedStopMultiple * this.value;
  }
  /**@type {Widget['on_touch_up']} */
  on_touch_up(event, object, touch) {
    if (touch.grabbed != this) return super.on_touch_up(event, object, touch);
    touch.ungrab();
    if (!this.disable && this.collide(touch.rect)) {
      this._touching = false;
      this.setValue(touch);
    }
    this.updateMax();
    return true;
  }
  /**@type {Widget['on_touch_move']} */
  on_touch_move(event, object, touch) {
    if (touch.grabbed !== this) return super.on_touch_move(event, object, touch);
    if (!this.disable) {
      this._touching = this.collide(touch.rect);
      this.setValue(touch);
    }
    return false;
  }
  /**@type {Widget['draw']} */
  draw(app, ctx) {
    let ts = app.tileSize;
    let r = this.rect;
    if (this.orientation == "horizontal") {
      r.w -= this.sliderSize * this.w;
      r.x += this.sliderSize / 2 * this.w;
      let rad = Math.min(this.sliderSize / 2 * this.w, this.h / 2) / 2;
      ctx.strokeStyle = this.disable ? this.disableColor1 : this.bgColor;
      ctx.beginPath();
      ctx.lineWidth = 4 / ts;
      ctx.moveTo(r.x, r.center_y);
      ctx.lineTo(r.right, r.center_y);
      ctx.stroke();
      let max = this.max ?? this.curMax;
      let vPos;
      if (this.max === null && this.curMax / this.unboundedStopMultiple > this.min) {
        vPos = this.value > max / this.unboundedStopMultiple ? (0.5 + 0.5 * (this.value - max / this.unboundedStopMultiple) / (max - max / this.unboundedStopMultiple)) * r.w : 0.5 * (this.value - this.min) / (max / this.unboundedStopMultiple - this.min) * r.w;
      } else {
        vPos = (this.value - this.min) / (max - this.min) * r.w;
      }
      ctx.strokeStyle = this.disable ? this.disableColor2 : this.bgColor;
      ctx.beginPath();
      ctx.arc(r.x + vPos, r.center_y, rad, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = this.color;
      if (this._touching || this.disable) {
        ctx.fillStyle = this.disable ? this.disableColor1 : this.selectColor;
      }
      ctx.fill();
    }
    if (this.orientation == "vertical") {
      r.h -= this.sliderSize * this.h;
      r.y += this.sliderSize / 2 * this.h;
      let rad = Math.min(this.sliderSize / 2 * this.h, this.w / 2) / 2;
      ctx.strokeStyle = this.disable ? this.disableColor1 : this.bgColor;
      ctx.beginPath();
      ctx.lineWidth = 4 / ts;
      ctx.moveTo(r.center_x, r.y);
      ctx.lineTo(r.center_x, r.bottom);
      ctx.stroke();
      let max = this.max ?? this.curMax;
      let vPos;
      if (this.max === null && this.curMax / this.unboundedStopMultiple > this.min) {
        vPos = this.value > max / this.unboundedStopMultiple ? (0.5 + 0.5 * (this.value - max / this.unboundedStopMultiple) / (max - max / this.unboundedStopMultiple)) * r.h : 0.5 * (this.value - this.min) / (max / this.unboundedStopMultiple - this.min) * r.h;
      } else {
        vPos = (this.value - this.min) / (max - this.min) * r.h;
      }
      ctx.strokeStyle = this.disable ? this.disableColor2 : this.bgColor;
      ctx.beginPath();
      ctx.arc(r.center_x, r.y + vPos, rad, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = this.color;
      if (this._touching || this.disable) {
        ctx.fillStyle = this.disable ? this.disableColor1 : this.selectColor;
      }
      ctx.fill();
    }
  }
}
class TextInput extends Label {
  /**@type {HTMLInputElement|HTMLTextAreaElement|null} */
  _activeDOMInput = null;
  /**@type {boolean} true when actively edited and has focus, false otherwise */
  focus = true;
  /**@type {boolean} Text input cannot be interact with when disable is true */
  disable = false;
  /**
   * Called before updating the text value after the focus on the DOM input object is cleared.
   * You can override `inputSanitizer` to change what is populated into the `Label`.
   * @type {undefined|((text:string, textInput:TextInput)=>string)} */
  _inputSanitizer = void 0;
  /**
   * 
   * @param {TextInputProperties|null} properties 
   */
  constructor(properties = {}) {
    super();
    this._textData = null;
    if (properties !== null) {
      this.updateProperties(properties);
    }
  }
  /**@type {Widget['on_touch_down']} */
  on_touch_down(event, object, touch) {
    if (super.on_touch_down(event, object, touch)) return true;
    if (!this.disable && this.collide(touch.rect)) {
      touch.grab(this);
      this._touching = true;
      return true;
    }
    this.clearDOM();
    return false;
  }
  /**@type {Widget['on_touch_up']} */
  on_touch_up(event, object, touch) {
    if (super.on_touch_up(event, object, touch)) return true;
    if (touch.grabbed != this) return false;
    if (!this.disable && this.collide(touch.rect)) {
      this._touching = false;
      this.addDOMInput();
      return true;
    }
    this.clearDOM();
    return false;
  }
  /**
   * Listener for layout events, which is used by the TextInput to clear Input element from the DOM
   * because changing the window state is assumed to make the input lose focus
   */
  on_layout(event, object, value) {
    this.clearDOM();
  }
  DOMInputRect() {
    let r = this.rect;
    let t = this.getTransformRecurse();
    let rt = new Rect();
    let dp1 = t.transformPoint(new DOMPoint(r.x, r.y));
    let dp2 = t.transformPoint(new DOMPoint(r.right, r.bottom));
    [rt.x, rt.y] = [dp1.x, dp1.y];
    [rt.w, rt.h] = [dp2.x, dp2.y];
    rt.w -= rt.x;
    rt.h -= rt.y;
    return rt;
  }
  addDOMInput() {
    if (!this._textData) return;
    App.get();
    let canvasdiv = document.getElementById("eskvapp");
    if (!canvasdiv) return;
    let type = this.wrap ? "textarea" : "input";
    let inp = document.createElement(type);
    if (!(inp instanceof HTMLInputElement) && !(inp instanceof HTMLTextAreaElement)) return;
    let fs;
    let rt = this.DOMInputRect();
    let color = this.color != null ? this.color : "white";
    let bgColor = this.bgColor != null ? this.bgColor : "black";
    inp.style.color = color;
    fs = this._textData.size / this.h * rt.h / this._textData.outText.length;
    if (type == "textarea") {
      this._textData.outText.length;
    }
    inp.value = this.text;
    fs = (Math.floor(fs * 100) / 100).toString() + "px";
    inp.style.fontSize = fs;
    inp.style.backgroundColor = bgColor;
    inp.style.top = (Math.floor(rt.y * 100) / 100).toString() + "px";
    inp.style.left = (Math.floor(rt.x * 100) / 100).toString() + "px";
    inp.style.width = (Math.floor(rt.w * 100) / 100).toString() + "px";
    inp.style.height = (Math.floor(rt.h * 100) / 100).toString() + "px";
    inp.style.fontFamily = this.fontName;
    this._activeDOMInput = inp;
    canvasdiv.appendChild(inp);
    inp.addEventListener("focusout", (event) => this.clearDOM());
    inp.focus();
    inp.select();
    this.focus = true;
  }
  clearDOM() {
    if (this._activeDOMInput != null) {
      this.text = this._inputSanitizer ? this._inputSanitizer(this._activeDOMInput.value, this) : this._activeDOMInput.value;
      let inp = this._activeDOMInput;
      this._activeDOMInput = null;
      inp.remove();
      this.focus = false;
      this._needsLayout = true;
      let iph = App.get().inputHandler;
      if (iph?.grabbed === this) iph.ungrab();
    }
  }
  /**@type {Widget['layoutChildren']} */
  layoutChildren() {
    super.layoutChildren();
    if (this._activeDOMInput != null) {
      let rt = this.DOMInputRect();
      let inp = this._activeDOMInput;
      inp.style.top = (Math.floor(rt.y * 100) / 100).toString() + "px";
      inp.style.left = (Math.floor(rt.x * 100) / 100).toString() + "px";
      inp.style.width = (Math.floor(rt.w * 100) / 100).toString() + "px";
      inp.style.height = (Math.floor(rt.h * 100) / 100).toString() + "px";
    }
  }
}
class ImageWidget extends Widget {
  /**@type {string|null} */
  bgColor = null;
  /**@type {string|null} */
  outlineColor = null;
  /**@type {string|null} filename or url of the image to display */
  src = null;
  /**@type {boolean} lock to the aspect ratio of the image if true, stretch/squeeze to fit if false */
  lockAspect = true;
  /**@type {boolean} scales the image to fit the available space*/
  scaleToFit = true;
  /**@type {boolean} apply antialiasing to scaled images if true (usually want this to be false to pixel art*/
  antiAlias = true;
  /**@type {number} angle in degrees to rotate the image*/
  angle = 0;
  /**@type {'center'|[number,number]} Position within the widget for the rotation point */
  anchor = "center";
  //anchor for rotation
  /**@type {boolean} flips the image on the along the y-axis before rotating*/
  mirror = false;
  /**
   * Constructs a new ImageWidget, optionally apply properties in `props`
   * @param {ImageWidgetProperties|null} props 
   */
  constructor(props = null) {
    super();
    this.image = new Image();
    if (props !== null) {
      this.updateProperties(props);
    }
    if (this.src) {
      this.image.src = this.src;
    }
  }
  on_src(event, object, data) {
    if (this.src) {
      this.image.src = this.src;
    } else {
      this.image.src = "";
    }
  }
  /**@type {Widget['layoutChildren']} */
  layoutChildren() {
    if (this._layoutNotify) this.emit("layout", null);
    let app = App.get();
    if ("w" in this.hints && this.hints["w"] == null) this[2] = this.image.width / app.tileSize;
    if ("h" in this.hints && this.hints["h"] == null) this[3] = this.image.height / app.tileSize;
    this._needsLayout = false;
    super.layoutChildren();
  }
  /**@type {Widget['draw']} */
  draw(app, ctx) {
    super.draw(app, ctx);
    if (!this.image.complete || this.image.naturalHeight == 0) return;
    let r = this.rect;
    if (!this.scaleToFit) {
      r.x += r.w / 2 - this.image.width / 2 / app.tileSize;
      r.y += r.h / 2 - this.image.height / 2 / app.tileSize;
      r.w = this.image.width / app.tileSize;
      r.h = this.image.height / app.tileSize;
    }
    if (this.lockAspect) {
      let srcAspect = this.image.height / this.image.width;
      let dstAspect = r.h / r.w;
      let rh = r.h, rw = r.w;
      if (srcAspect < dstAspect) rh = r.w * srcAspect;
      if (srcAspect > dstAspect) rw = r.h / srcAspect;
      r.x += r.w / 2 - rw / 2;
      r.y += r.h / 2 - rh / 2;
      r.w = rw;
      r.h = rh;
    }
    ctx.save();
    ctx.imageSmoothingEnabled = this.antiAlias;
    let anchor = this.anchor;
    if (anchor == "center") {
      anchor = [r.w / 2, r.h / 2];
    } else {
      anchor = [anchor[0] * r.w, anchor[1] * r.h];
    }
    if (this.mirror) ctx.scale(-1, 1);
    ctx.translate(
      r.x + anchor[0],
      r.y + anchor[1]
    );
    if (this.angle != 0) ctx.rotate(this.angle);
    ctx.translate(-anchor[0], -anchor[1]);
    ctx.drawImage(
      this.image,
      0,
      0,
      this.image.width,
      this.image.height,
      0,
      0,
      r.w,
      r.h
    );
    ctx.restore();
  }
}
class BoxLayout extends Widget {
  /**@type {string|number} Horizontal spacing between widgets in a horizontal orientation*/
  spacingX = 0;
  /**@type {string|number} Vertical spacing between widgets in a vertical orientation*/
  spacingY = 0;
  /**@type {string|number} Padding at left and right sides of BoxLayout*/
  paddingX = 0;
  /**@type {string|number} Padding at top and bottom sides of BoxLayout*/
  paddingY = 0;
  /**@type {'vertical'|'horizontal'} Direction that child widgets are arranged in the BoxLayout*/
  orientation = "vertical";
  /**@type {'forward'|'reverse'} Order that child widgets are arranged in the BoxLayout*/
  order = "forward";
  /**
   * Creates an instance of a BoxLayout with properties optionally specified in `properties`.
   * @param {BoxLayoutProperties|null} properties 
   */
  constructor(properties = null) {
    super();
    if (properties !== null) {
      this.updateProperties(properties);
    }
  }
  *iterChildren() {
    if (this.order === "forward") {
      for (let c of this._children) yield c;
    } else {
      for (let i = this._children.length - 1; i >= 0; i--) {
        yield this._children[i];
      }
    }
  }
  on_numX(event, object, data) {
    this._needsLayout = true;
  }
  on_numY(event, object, data) {
    this._needsLayout = true;
  }
  on_spacingX(event, object, data) {
    this._needsLayout = true;
  }
  on_spacingY(event, object, data) {
    this._needsLayout = true;
  }
  on_paddingX(event, object, data) {
    this._needsLayout = true;
  }
  on_paddingY(event, object, data) {
    this._needsLayout = true;
  }
  on_orientation(event, object, data) {
    this._needsLayout = true;
  }
  layoutChildren() {
    if (this._layoutNotify) this.emit("layout", null);
    this._needsLayout = false;
    let spacingX = this.getMetric(this, "spacingX", this.spacingX);
    let spacingY = this.getMetric(this, "spacingY", this.spacingY);
    let paddingX = this.getMetric(this, "paddingX", this.paddingX);
    let paddingY = this.getMetric(this, "paddingY", this.paddingY);
    if (this.orientation === "vertical") {
      let num = this.children.length;
      let h = this.h - spacingY * (num - 1) - 2 * paddingY;
      let w = this.w - 2 * paddingX;
      let fixedh = 0;
      for (let c of this.iterChildren()) {
        c.w = w;
        this.applyHints(c, w, h);
        if ("h" in c.hints) {
          if (c.hints["h"] === null) c.layoutChildren();
          fixedh += c.h;
          num--;
        }
      }
      let ch = (h - fixedh) / num;
      let cw = w;
      if (num === 0 && h > 0) paddingY = (h - fixedh) / 2;
      let y = this.y + paddingY;
      let x = this.x + paddingX;
      for (let c of this.iterChildren()) {
        c.y = y;
        if (!("x" in c.hints) && !("center_x" in c.hints) && !("right" in c.hints)) c.x = x;
        if (!("w" in c.hints)) c.w = cw;
        if (!("h" in c.hints)) c.h = ch;
        c.layoutChildren();
        y += spacingY + c.h;
      }
      if (num === 0 && "h" in this.hints && this.hints["h"] === null) {
        const oldH = this[3];
        this[3] = y + 2 * paddingY - this.y;
        if (Math.abs(oldH - this[3]) > 1e-6) {
          App.get()._needsLayout = true;
        }
      }
      return;
    }
    if (this.orientation === "horizontal") {
      let num = this.children.length;
      let h = this.h - 2 * paddingY;
      let w = this.w - spacingX * (num - 1) - 2 * paddingX;
      let fixedw = 0;
      for (let c of this.iterChildren()) {
        c.h = h;
        this.applyHints(c, w, h);
        if ("w" in c.hints) {
          if (c.hints["w"] === null) c.layoutChildren();
          fixedw += c.w;
          num--;
        }
      }
      let ch = h;
      let cw = (w - fixedw) / num;
      if (num === 0 && w > 0) paddingX = (w - fixedw) / 2;
      let y = this.y + paddingY;
      let x = this.x + paddingX;
      for (let c of this.iterChildren()) {
        c.x = x;
        if (!("y" in c.hints) && !("center_y" in c.hints) && !("bottom" in c.hints)) c.y = y;
        if (!("w" in c.hints)) c.w = cw;
        if (!("h" in c.hints)) c.h = ch;
        c.layoutChildren();
        x += spacingX + c.w;
      }
      if (num == 0 && "w" in this.hints && this.hints["w"] == null) {
        const oldW = this[2];
        this[2] = x + 2 * paddingX - this.x;
        if (Math.abs(oldW - this[2]) > 1e-6) {
          App.get()._needsLayout = true;
        }
      }
    }
  }
}
class Notebook extends Widget {
  activePage = 0;
  /**
   * Creates an instance of a Notebook with properties optionally specified in `properties`.
   * @param {NotebookProperties|null} properties 
   */
  constructor(properties = null) {
    super();
    if (properties !== null) {
      this.updateProperties(properties);
    }
  }
  /**@type {Widget['on_wheel']} */
  on_wheel(event, object, wheel) {
    const ch = this.children[this.activePage] ?? void 0;
    if (ch !== void 0) {
      if (ch.emit(event, wheel)) return true;
    }
    return false;
  }
  /**@type {Widget['on_touch_down']} */
  on_touch_down(event, object, touch) {
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, touch)) return true;
      }
    }
    return false;
  }
  /**@type {Widget['on_touch_up']} */
  on_touch_up(event, object, touch) {
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, touch)) return true;
      }
    }
    return false;
  }
  /**@type {Widget['on_touch_move']} */
  on_touch_move(event, object, touch) {
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, touch)) return true;
      }
    }
    return false;
  }
  /**@type {Widget['on_touch_cancel']} */
  on_touch_cancel(event, object, touch) {
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, touch)) return true;
      }
    }
    return false;
  }
  on_activePage(e, o, v) {
    this._needsLayout = true;
  }
  /**@type {Widget['_draw']} */
  _draw(app, ctx, millis) {
    this.draw(app, ctx);
    let transform = this.getTransform();
    if (transform) {
      ctx.save();
      ctx.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
      let w2 = this.children[this.activePage] ?? void 0;
      if (w2 !== void 0) w2._draw(app, ctx, millis);
      ctx.restore();
      return;
    }
    let w = this.children[this.activePage] ?? void 0;
    if (w !== void 0) w._draw(app, ctx, millis);
  }
}
class TabbedNotebook extends Notebook {
  /**@type {string|number} The height hint for the tabbed area of the TabbedNotebook */
  tabHeightHint = "1";
  /**@type {string} The named of the button group for the TabbedNotebook */
  tabGroupName = "tabbedNotebookGroup";
  /**
   * Creates an instance of a Notebook with properties optionally specified in `properties`.
   * @param {TabbedNotebookProperties|null} properties 
   */
  constructor(properties = null) {
    super();
    this.buttonBox = new BoxLayout({
      orientation: "horizontal",
      hints: { h: this.tabHeightHint, w: null }
    });
    this.buttonScroller = new ScrollView({
      id: "_scrollview",
      hints: { h: this.tabHeightHint, w: 1 },
      children: [
        this.buttonBox
      ]
    });
    this._children = [this.buttonScroller];
    this.buttonScroller.parent = this;
    if (properties !== null) {
      this.updateProperties(properties);
    }
    this.updateButtons();
  }
  on_tabHeightHint(e, o, v) {
    this.buttonBox.hints["h"] = this.tabHeightHint;
  }
  /**@type {EventCallbackNullable} */
  on_child_added(e, o, v) {
    this.updateButtons();
  }
  /**@type {EventCallbackNullable} */
  on_child_removed(e, o, v) {
    this.updateButtons();
  }
  /**@type {Widget['on_wheel']} */
  on_wheel(event, object, wheel) {
    const bb = this._children[0] ?? void 0;
    if (bb !== void 0) {
      if (bb.emit(event, wheel)) return true;
    }
    const ch = this.children[this.activePage] ?? void 0;
    if (ch !== void 0) {
      if (ch.emit(event, wheel)) return true;
    }
    return false;
  }
  /**@type {Widget['on_touch_down']} */
  on_touch_down(event, object, touch) {
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const bb = this._children[0] ?? void 0;
      if (bb !== void 0) {
        if (bb.emit(event, t)) return true;
      }
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const bb = this._children[0] ?? void 0;
      if (bb !== void 0) {
        if (bb.emit(event, touch)) return true;
      }
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, touch)) return true;
      }
    }
    return false;
  }
  /**@type {Widget['on_touch_up']} */
  on_touch_up(event, object, touch) {
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const bb = this._children[0] ?? void 0;
      if (bb !== void 0) {
        if (bb.emit(event, t)) return true;
      }
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const bb = this._children[0] ?? void 0;
      if (bb !== void 0) {
        if (bb.emit(event, touch)) return true;
      }
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, touch)) return true;
      }
    }
    return false;
  }
  /**@type {Widget['on_touch_move']} */
  on_touch_move(event, object, touch) {
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const bb = this._children[0] ?? void 0;
      if (bb !== void 0) {
        if (bb.emit(event, t)) return true;
      }
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const bb = this._children[0] ?? void 0;
      if (bb !== void 0) {
        if (bb.emit(event, touch)) return true;
      }
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, touch)) return true;
      }
    }
    return false;
  }
  /**@type {Widget['on_touch_cancel']} */
  on_touch_cancel(event, object, touch) {
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const bb = this._children[0] ?? void 0;
      if (bb !== void 0) {
        if (bb.emit(event, t)) return true;
      }
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const bb = this._children[0] ?? void 0;
      if (bb !== void 0) {
        if (bb.emit(event, touch)) return true;
      }
      const ch = this.children[this.activePage] ?? void 0;
      if (ch !== void 0) {
        if (ch.emit(event, touch)) return true;
      }
    }
    return false;
  }
  /**@type {Widget[]} Read/write access to the list of child widgets*/
  get children() {
    return this._children.slice(1);
  }
  set children(children) {
    for (let c of this._children.slice(1)) {
      this.emit("child_removed", c);
      c.parent = null;
      this._needsLayout = true;
      this.updateButtons();
    }
    this._children = this._children.slice(0, 1);
    for (let c of children) {
      this.addChild(c);
    }
  }
  updateButtons() {
    this.buttonBox.children = [];
    let i = 0;
    for (let page of this.children) {
      const tb = new ToggleButton({
        text: page["name"] ?? String(i + 1),
        group: this.tabGroupName,
        singleSelect: true,
        press: this.activePage === i,
        fontSize: "0.5",
        hints: { h: null, w: null }
      });
      tb.bind("press", (e, o, v) => {
        this.activePage = this.buttonBox.children.findIndex((w) => w === o);
      });
      this.buttonBox.addChild(tb);
      i++;
    }
  }
  layoutChildren() {
    if (this._layoutNotify) this.emit("layout", null);
    this._needsLayout = false;
    const bb = this._children[0];
    this.applyHints(bb);
    bb.x = this.x;
    bb.y = this.y;
    bb.layoutChildren();
    const h = this.h - bb.h;
    const w = this.w;
    for (let c of this.children) {
      c.y = this.y + bb.h;
      c.x = this.x;
      c.w = w;
      c.h = h;
      c.layoutChildren();
    }
  }
  /**@type {Widget['_draw']} */
  _draw(app, ctx, millis) {
    this.draw(app, ctx);
    let transform = this.getTransform();
    if (transform) {
      ctx.save();
      ctx.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
      let bb2 = this._children[0] ?? void 0;
      if (bb2 !== void 0) bb2._draw(app, ctx, millis);
      let w2 = this.children[this.activePage] ?? void 0;
      if (w2 !== void 0) w2._draw(app, ctx, millis);
      ctx.restore();
      return;
    }
    let bb = this._children[0] ?? void 0;
    if (bb !== void 0) bb._draw(app, ctx, millis);
    let w = this.children[this.activePage] ?? void 0;
    if (w !== void 0) w._draw(app, ctx, millis);
  }
}
class GridLayout extends Widget {
  /**@type {number} Number of widgets per row in a horizontal orientation*/
  numX = 1;
  /**@type {number} Number of widgets per column in a vertical orientation*/
  numY = 1;
  /**@type {string|number} Horizontal spacing between widgets in a horizontal orientation*/
  spacingX = 0;
  /**@type {string|number} Vertical spacing between widgets in a vertical orientation*/
  spacingY = 0;
  /**@type {string|number} Padding at left and right sides of BoxLayout*/
  paddingX = 0;
  /**@type {string|number} Padding at top and bottom sides of BoxLayout*/
  paddingY = 0;
  /**@type {'vertical'|'horizontal'} Direction that child widgets are arranged in the BoxLayout*/
  orientation = "horizontal";
  //TODO: Need to track column widths and row heights based on max height/width hints in each row/col
  /**
   * Constructs a new GridLayout with optional properties set by `properties`
   * @param {GridLayoutProperties|null} properties 
   */
  constructor(properties = null) {
    super();
    if (properties !== null) {
      this.updateProperties(properties);
    }
  }
  on_numX(event, object, string) {
    this._needsLayout = true;
  }
  on_numY(event, object, string) {
    this._needsLayout = true;
  }
  on_spacingX(event, object, string) {
    this._needsLayout = true;
  }
  on_spacingY(event, object, string) {
    this._needsLayout = true;
  }
  on_paddingX(event, object, string) {
    this._needsLayout = true;
  }
  on_paddingY(event, object, string) {
    this._needsLayout = true;
  }
  on_orientation(event, object, string) {
    this._needsLayout = true;
  }
  /**@type {Widget['layoutChildren']} */
  layoutChildren() {
    if (this._layoutNotify) this.emit("layout", null);
    this._needsLayout = false;
    let spacingX = this.getMetric(this, "spacingX", this.spacingX);
    let spacingY = this.getMetric(this, "spacingY", this.spacingY);
    let paddingX = this.getMetric(this, "paddingX", this.paddingX);
    let paddingY = this.getMetric(this, "paddingY", this.paddingY);
    if (this.orientation == "horizontal") {
      let numX = this.numX;
      let numY = Math.ceil(this.children.length / this.numX);
      let h = this.h - spacingY * (numY - 1) - 2 * paddingY;
      let w = this.w - spacingX * (numX - 1) - 2 * paddingX;
      let _colWidths = new Array(numX).fill(0);
      let _rowHeights = new Array(numY).fill(0);
      let r = 0, c = 0;
      let i = 0;
      for (let ch2 of this.children) {
        this.applyHints(ch2, w, h);
        if ("w" in ch2.hints) _colWidths[c] = Math.max(ch2.w, _colWidths[c]);
        if ("h" in ch2.hints) _rowHeights[r] = Math.max(ch2.h, _rowHeights[r]);
        if ((i + 1) % numX == 0) {
          r++;
          c = 0;
        } else {
          c++;
        }
        i++;
      }
      let fixedW = 0, fixedH = 0;
      let nfX = 0, nfY = 0;
      for (let cw2 of _colWidths) {
        fixedW += cw2;
        if (cw2 > 0) nfX++;
      }
      for (let rh of _rowHeights) {
        fixedH += rh;
        if (rh > 0) nfY++;
      }
      let ch = numY > nfY ? (h - fixedH) / (numY - nfY) : 0;
      let cw = numX > nfX ? (w - fixedW) / (numX - nfX) : 0;
      let y = this.y + paddingY;
      let x = this.x + paddingX;
      r = 0, c = 0;
      for (let i2 = 0; i2 < this.children.length; i2++) {
        let el = this.children[i2];
        let cw0 = _colWidths[c] == 0 ? cw : _colWidths[c];
        let ch0 = _rowHeights[r] == 0 ? ch : _rowHeights[r];
        if (!("w" in el.hints)) el.w = cw0;
        if (!("h" in el.hints)) el.h = ch0;
        el.x = x;
        el.y = y;
        el.layoutChildren();
        if ((i2 + 1) % numX == 0) {
          x = this.x + paddingX;
          y += spacingY + ch0;
          c = 0;
          r++;
        } else {
          x += spacingX + cw0;
          c++;
        }
      }
      return;
    } else {
      let numX = Math.ceil(this.children.length / this.numY);
      let numY = this.numY;
      let h = this.h - spacingY * (numY - 1) - 2 * paddingY;
      let w = this.w - spacingX * (numX - 1) - 2 * paddingX;
      let _colWidths = new Array(numX).fill(0);
      let _rowHeights = new Array(numY).fill(0);
      let r = 0, c = 0;
      let i = 0;
      for (let ch2 of this.children) {
        this.applyHints(ch2, w, h);
        if ("w" in ch2.hints) _colWidths[c] = Math.max(ch2.w, _colWidths[c]);
        if ("h" in ch2.hints) _rowHeights[r] = Math.max(ch2.h, _rowHeights[r]);
        if ((i + 1) % numY == 0) {
          c++;
          r = 0;
        } else {
          r++;
        }
        i++;
      }
      let fixedW = 0, fixedH = 0;
      let nfX = 0, nfY = 0;
      for (let cw2 of _colWidths) {
        fixedW += cw2;
        if (cw2 > 0) nfX++;
      }
      for (let rh of _rowHeights) {
        fixedH += rh;
        if (rh > 0) nfY++;
      }
      let ch = numY > nfY ? (h - fixedH) / (numY - nfY) : 0;
      let cw = numX > nfX ? (w - fixedW) / (numX - nfX) : 0;
      let y = this.y + paddingY;
      let x = this.x + paddingX;
      r = 0, c = 0;
      for (let i2 = 0; i2 < this.children.length; i2++) {
        let el = this.children[i2];
        let cw0 = _colWidths[c] == 0 ? cw : _colWidths[c];
        let ch0 = _rowHeights[r] == 0 ? ch : _rowHeights[r];
        if (!("w" in el.hints)) el.w = cw0;
        if (!("h" in el.hints)) el.h = ch0;
        el.x = x;
        el.y = y;
        el.layoutChildren();
        if ((i2 + 1) % numY == 0) {
          y = this.y + paddingY;
          x += spacingX + cw0;
          r = 0;
          c++;
        } else {
          y += spacingY + ch0;
          r++;
        }
      }
    }
  }
}
class ScrollView extends Widget {
  /**@type {number} current x-axis scrolling position measured from left of client area in client area units */
  _scrollX = 0;
  /**@type {number} current y-axis scrolling position measured from top of client area in client area units */
  _scrollY = 0;
  /**@type {number} desired x-axis scrolling position measured from left of client area in client area units */
  scrollX = 0;
  /**@type {number} desired y-axis scrolling position measured from top of client area in client area units */
  scrollY = 0;
  /**@type {boolean} true if horizontal scrolling allowed */
  scrollW = true;
  /**@type {boolean} true if vertical scrolling allowed */
  scrollH = true;
  /**@type {'left'|'center'|'right'} how to align content horizontally if horizontal scrolling disallowed */
  wAlign = "center";
  //left, center, right
  /**@type {'top'|'middle'|'bottom'} how to align content vertically if vertical scrolling disallowed */
  hAlign = "top";
  //top, middle, bottom
  /**@type {boolean} zooming allowed via user input if true (pinch to zoom) */
  uiZoom = true;
  /**@type {boolean} moving allowed via user input if true (touch and slide to move) */
  uiMove = true;
  /**@type {number} zoom ratio (1=no zoom, <1 zoomed out, >1 zoomed in) */
  zoom = 1;
  /**@type {Vec2|null} tracks velocity of kinetic scrolling action */
  vel = null;
  /**@type {number} vel is set to zero on an axis if the absolute velocity falls below this cutoff */
  velCutoff = 1e-5;
  /**@type {number} velocity of kinetic motion, `vel`, declines by this decay ratio every 30ms */
  velDecay = 0.95;
  /**@type {boolean} unbounded vertical scrolling*/
  unboundedH = false;
  /**@type {boolean} unbounded horizontal scrolling*/
  unboundedW = false;
  /**@type {Vec2|null} */
  _zoomCenter = null;
  /**
   * Construcsts a new ScrollView with optional properties in `properties` 
   * @param {null|ScrollViewProperties} [properties=null] 
   */
  constructor(properties = null) {
    super();
    if (properties !== null) {
      this.updateProperties(properties);
    }
    this._processTouches = true;
    this._oldTouch = null;
    this._lastDist = null;
  }
  /**@type {EventCallbackNullable} */
  on_child_added(event, object, child) {
    if (this.children.length == 1) {
      this.scrollX = 0;
      this.scrollY = 0;
      this._needsLayout = true;
      child.bind("rect", (event2, obj, data) => this._needsLayout = true);
      child.bind("w", (event2, obj, data) => this._needsLayout = true);
      child.bind("h", (event2, obj, data) => this._needsLayout = true);
    }
  }
  on_child_removed(event, object, child) {
    if (this.children.length == 0) {
      this.scrollX = 0;
      this.scrollY = 0;
      this._needsLayout = true;
    }
  }
  /**@type {Widget['layoutChildren']} */
  layoutChildren() {
    if (this._layoutNotify) this.emit("layout", null);
    this._needsLayout = false;
    this.children[0][0] = 0;
    this.children[0][1] = 0;
    if (!this.scrollW) this.children[0][2] = this.w;
    if (!this.scrollH) this.children[0][3] = this.h;
    for (let c of this.children) {
      c.layoutChildren();
    }
  }
  fitToClient() {
    this.zoom = Math.min(this.w / this.children[0].w, this.h / this.children[0].h);
    this.scrollX = 0.5 * this.scrollableW;
    this.scrollY = 0.5 * this.scrollableH;
  }
  on_uiZoom(event, object, value) {
    this._needsLayout = true;
  }
  on_hAlign(event, object, value) {
    this._needsLayout = true;
  }
  on_vAlign(event, object, value) {
    this._needsLayout = true;
  }
  *iter(recursive = true, inView = true) {
    yield this;
    if (!recursive) return;
    if (inView) {
      for (let c of this._children) {
        if (this.contains(c)) yield* c.iter(...arguments);
      }
    } else {
      for (let c of this._children) {
        yield* c.iter(...arguments);
      }
    }
  }
  on_scrollW(event, object, value) {
    this._needsLayout = true;
    this.scrollX = 0;
  }
  on_scrollH(event, object, value) {
    this._needsLayout = true;
    this.scrollY = 0;
  }
  /**@type {EventCallbackNullable} */
  on_scrollX(event, object, value) {
    if (this.children.length == 0) return;
    this._needsLayout = true;
    if (this.unboundedW) {
      this._scrollX = this.scrollX;
      return;
    }
    let align = 0;
    switch (this.wAlign) {
      case "center":
        align = 0.5 * this.scrollableW;
        break;
      case "right":
        align = 1 * this.scrollableW;
    }
    this._scrollX = this.scrollableW <= 0 || this.scrollableW >= this.children[0].w ? align : value;
    this._scrollX = clamp(value, 0, this.scrollableW);
  }
  on_scrollY(event, object, value) {
    if (this.children.length == 0) return;
    this._needsLayout = true;
    if (this.unboundedH) {
      this._scrollY = this.scrollY;
      return;
    }
    let align = 0;
    switch (this.hAlign) {
      case "middle":
        align = 0.5 * this.scrollableH;
        break;
      case "bottom":
        align = 1 * this.scrollableH;
    }
    this._scrollY = this.scrollableH <= 0 || this.scrollableH >= this.children[0].h ? align : value;
    this._scrollY = clamp(value, 0, this.scrollableH);
  }
  /**@type {Widget['update']} */
  update(app, millis) {
    super.update(app, millis);
    if (this.vel !== null) {
      this.scrollX += this.vel.x * millis;
      this.scrollY += this.vel.y * millis;
      this.vel = this.vel.scale(this.velDecay ** (millis / 30));
      let a = this.vel.abs();
      if (a.x <= this.velCutoff / this.zoom && a.y <= this.velCutoff / this.zoom) this.vel = null;
    }
  }
  /**@type {Widget['getTransform']} */
  getTransform() {
    const ts = App.get().tileSize;
    let transform = new DOMMatrix().translate(
      Math.floor((this.x - this._scrollX * this.zoom) * ts) / ts,
      Math.floor((this.y - this._scrollY * this.zoom) * ts) / ts
    ).scale(this.zoom, this.zoom);
    return transform;
  }
  /**@type {Widget['on_touch_down']} */
  on_touch_down(event, object, touch) {
    this.vel = null;
    let r = touch.rect;
    this._lastDist = null;
    if (this.collide(r)) {
      let millis = Date.now();
      let tl = touch.asChildTouch(this);
      this._oldTouch = [tl.x, tl.y, tl.identifier, millis, null];
      if (super.on_touch_down(event, object, touch)) return true;
      touch.grab(this);
      return true;
    }
    return false;
  }
  /**@type {Widget['on_touch_up']} */
  on_touch_up(event, object, touch) {
    if (touch.grabbed !== this) {
      return false;
    }
    if (this._oldTouch != null) {
      let ovel = this._oldTouch[4];
      let tl = new Vec2([this._oldTouch[0], this._oldTouch[1]]);
      let tln = touch.asChildTouch(this);
      let millis = Math.max(Date.now() - this._oldTouch[3], 1);
      let vx = this.scrollableW > 0 || this.unboundedW ? (tln.x - tl.x) / millis : 0;
      let vy = this.scrollableH > 0 || this.unboundedH ? (tln.y - tl.y) / millis : 0;
      this.vel = new Vec2([-vx, -vy]);
      if (ovel) this.vel = this.vel.add(ovel).scale(0.5);
    }
    this._oldTouch = null;
    this._lastDist = null;
    this._zoomCenter = null;
    touch.ungrab();
    return false;
  }
  /**@type {Widget['on_touch_move']} */
  on_touch_move(event, object, touch) {
    if (touch.grabbed !== this) {
      return false;
    }
    let r = touch.rect;
    if (this.collide(r)) {
      let tl = touch.asChildTouch(this);
      if (this.uiMove && touch.nativeEvent == null || touch.nativeEvent instanceof TouchEvent && touch.nativeEvent.touches.length == 1) {
        if (this._oldTouch != null && touch.identifier == this._oldTouch[2]) {
          if (this.scrollW) {
            this.scrollX = this.scrollableW == 0 ? 0 : this._scrollX + (this._oldTouch[0] - tl.x);
          }
          if (this.scrollH) {
            this.scrollY = this.scrollableH == 0 ? 0 : this._scrollY + (this._oldTouch[1] - tl.y);
          }
          let tln = touch.asChildTouch(this);
          let ot = this._oldTouch;
          let time = Date.now();
          let vel = new Vec2([0, 0]), ovel = new Vec2([0, 0]);
          if (ot != null) {
            let millis = Math.max(time - ot[3], 1);
            let vx = this.scrollableW > 0 || this.unboundedW ? (tln.x - tl.x) / millis : 0;
            let vy = this.scrollableH > 0 || this.unboundedH ? (tln.y - tl.y) / millis : 0;
            vel = new Vec2([vx, vy]);
            ovel = ot[4] !== null ? ot[4] : ovel;
          }
          let nvel = vel.abs().sum() === 0 ? vel : vel.add(ovel).scale(0.5);
          this._oldTouch = [tln.x, tln.y, touch.identifier, time, nvel];
        }
      }
      if (this.uiZoom && touch.nativeEvent && touch.nativeEvent instanceof TouchEvent && touch.nativeEvent.touches.length == 2) {
        let t0 = touch.nativeEvent.touches[0];
        let t1 = touch.nativeEvent.touches[1];
        let d = dist([t0.clientX, t0.clientY], [t1.clientX, t1.clientY]);
        if (this._lastDist != null) {
          let scrollPosCenterW = this._scrollX + this.w / this.zoom / 2;
          let scrollPosCenterH = this._scrollY + this.h / this.zoom / 2;
          let touchPixelPos0 = [t0.clientX, t0.clientY];
          let touchPixelPos1 = [t1.clientX, t1.clientY];
          let scrollableTouchPosBefore0 = this.appToChild(touchPixelPos0);
          let scrollableTouchPosBefore1 = this.appToChild(touchPixelPos1);
          let sTargetCenterPosBefore = [
            (scrollableTouchPosBefore0[0] + scrollableTouchPosBefore1[0]) / 2,
            (scrollableTouchPosBefore0[1] + scrollableTouchPosBefore1[1]) / 2
          ];
          if (this._zoomCenter === null) this._zoomCenter = new Vec2(sTargetCenterPosBefore);
          let zoom = this.zoom * d / this._lastDist;
          let minZoom = Math.min(
            this.unboundedW ? 0.01 : this.w / this.children[0].w,
            this.unboundedH ? 0.01 : this.h / this.children[0].h
          );
          this.zoom = Math.max(zoom, minZoom);
          let scrollableTouchPosAfter0 = this.appToChild(touchPixelPos0);
          let scrollableTouchPosAfter1 = this.appToChild(touchPixelPos1);
          let sTargetCenterPosAfter = [
            (scrollableTouchPosAfter0[0] + scrollableTouchPosAfter1[0]) / 2,
            (scrollableTouchPosAfter0[1] + scrollableTouchPosAfter1[1]) / 2
          ];
          this.scrollX = scrollPosCenterW + sTargetCenterPosBefore[0] - sTargetCenterPosAfter[0] - this.w / this.zoom / 2;
          this.scrollY = scrollPosCenterH + sTargetCenterPosBefore[1] - sTargetCenterPosAfter[1] - this.h / this.zoom / 2;
        }
        this._lastDist = d;
      }
    }
    return false;
  }
  /**@type {Widget['on_touch_cancel']} */
  on_touch_cancel(event, object, touch) {
    this._lastDist = null;
    if (touch.grabbed === this) {
      touch.ungrab();
      return true;
    }
    if (super.on_touch_cancel(event, object, touch)) return true;
    return false;
  }
  /**@type {Widget['on_wheel']} */
  on_wheel(event, object, touch) {
    let app = App.get();
    if (!app.inputHandler) return true;
    let sx = this._scrollX + this.w / this.zoom / 2;
    let sy = this._scrollY + this.h / this.zoom / 2;
    let wheel = touch.nativeObject;
    if (!this.collide(touch.rect) && (!this.unboundedW || !this.unboundedH)) return false;
    if (!(wheel instanceof WheelEvent)) return false;
    if (this.uiZoom && app.inputHandler.isKeyDown("Control")) {
      let loc = touch.asChildTouch(this);
      loc.pos[0];
      loc.pos[1];
      let zoom = this.zoom * Math.exp(-wheel.deltaY / app.h);
      let minZoom = Math.min(
        this.unboundedW ? 0.01 : this.w / this.children[0].w,
        this.unboundedH ? 0.01 : this.h / this.children[0].h
      );
      this.zoom = Math.max(zoom, minZoom);
      let moc = touch.asChildTouch(this);
      moc.pos[0];
      moc.pos[1];
      this.scrollX = this.scrollableW == 0 && !this.unboundedW ? 0 : sx - this.w / this.zoom / 2;
      this.scrollY = this.scrollableH == 0 && !this.unboundedH ? 0 : sy - this.h / this.zoom / 2;
      if (this.scrollX != this._scrollX) this.scrollX = this._scrollX;
      if (this.scrollY != this._scrollY) this.scrollY = this._scrollY;
      return true;
    } else if (this.uiMove && this.scrollW && app.inputHandler.isKeyDown("Shift")) {
      this.scrollX += this.scrollableW == 0 && !this.unboundedW ? 0 : this.w / this.zoom * (wheel.deltaY / app.w);
      if (this.scrollX != this._scrollX) this.scrollX = this._scrollX;
      return true;
    } else if (this.uiMove && this.scrollH) {
      this.scrollY += this.scrollableH == 0 && !this.unboundedH ? 0 : this.h / this.zoom * (wheel.deltaY / app.h);
      if (this.scrollY != this._scrollY) this.scrollY = this._scrollY;
      return true;
    }
    return false;
  }
  get scrollableW() {
    if (this.children.length == 0) return 0;
    return this.unboundedW ? this.children[0].w - this.w / this.zoom : Math.max(this.children[0].w - this.w / this.zoom, 0);
  }
  get scrollableH() {
    if (this.children.length == 0) return 0;
    return this.unboundedH ? this.children[0].h - this.h / this.zoom : Math.max(this.children[0].h - this.h / this.zoom, 0);
  }
  /**@type {Widget['_draw']} */
  _draw(app, ctx, millis) {
    this.draw(app, ctx);
    let r = this.rect;
    r[0] = Math.floor(r[0] * app.tileSize * app.pixelSize) / (app.tileSize * app.pixelSize);
    r[1] = Math.floor(r[1] * app.tileSize * app.pixelSize) / (app.tileSize * app.pixelSize);
    r[2] = Math.floor(r[2] * app.tileSize * app.pixelSize) / (app.tileSize * app.pixelSize);
    r[3] = Math.floor(r[3] * app.tileSize * app.pixelSize) / (app.tileSize * app.pixelSize);
    ctx.save();
    ctx.beginPath();
    ctx.rect(r[0], r[1], r[2], r[3]);
    ctx.clip();
    let newT = this.getTransform();
    if (newT) ctx.transform(newT.a, newT.b, newT.c, newT.d, newT.e, newT.f);
    this.children[0]._draw(app, ctx, millis);
    ctx.restore();
  }
}
class ModalView extends BoxLayout {
  /**@type {boolean} If true, clicking outside of the modal rect will close it*/
  closeOnTouchOutside = true;
  /**@type {string|null} background color of modal rect*/
  bgColor = "slate";
  /**@type {string|null} outline color of modal rect*/
  outlineColor = "gray";
  /**@type {boolean} If true, darken the entire canvas before drawing*/
  dim = true;
  /**@type {number} Amount of canvas dimming applied (0=none => 1=opaque black)*/
  dimScale = 0.8;
  /**
   * Construcsts a new ModalView with optional properties in `properties` 
   * @param {null|ModalViewProperties} [properties=null] 
   */
  constructor(properties = null) {
    super();
    if (properties !== null) {
      this.updateProperties(properties);
    }
  }
  get visible() {
    return App.get()._modalWidgets.indexOf(this) >= 0;
  }
  /**
   * Call to programmaticaly open the modal. This adds to the App's current stack of modal widgets. 
   * @returns {boolean} returns true if successfully opened, false if already open
   */
  popup() {
    if (this.parent == null) {
      let app = App.get();
      this.parent = app;
      app.addModal(this);
      return true;
    }
    return false;
  }
  /**
   * Call to close the modal view programmatically
   * @param {number} exitVal 
   * @returns {boolean} returns true if successfully closed, false if already closed
   */
  close(exitVal = 0) {
    if (this.parent != null) {
      this.emit("close", exitVal);
      let app = App.get();
      this.parent = null;
      app.removeModal(this);
      return true;
    }
    return false;
  }
  /**@type {Widget['on_touch_down']} */
  on_touch_down(event, object, touch) {
    if (this.closeOnTouchOutside && !this.collide(touch.rect)) {
      this.close();
      return true;
    }
    return super.on_touch_down(event, object, touch);
  }
  /**@type {Widget['draw']} */
  draw(app, ctx) {
    if (this.dim) {
      let r = App.get().baseWidget.rect;
      let ctx2 = App.get().ctx;
      if (!ctx2) return;
      ctx2.fillStyle = "rgba(0,0,0," + this.dimScale + ")";
      ctx2.rect(r[0], r[1], r[2], r[3]);
      ctx2.fill();
      super.draw(app, ctx2);
    }
  }
}
function unpackSpriteInfo(ind, len, sw) {
  const flipped = Math.floor(ind / len / 4) > 0;
  ind = ind % (len * 4);
  const angle = Math.floor(ind / len);
  ind = ind % len;
  const indY = Math.floor(ind / sw);
  const indX = ind % sw;
  return [flipped, angle, indY, indX];
}
class AutoTiler {
  /**
   * Constructs an autotiler
   * @param {string} id The name of the autotiler (optional)
   * @param {number[]} matchTiles The list of valid tile indexes that can be autotiled
   * @param {number[]} matchAdjTiles The list of valid adjacent tile indexes that can be autotiled
   * @param {Object<number, number>} autos The mapping from adjacency bits to autotiled indexes
   */
  constructor(id = "", matchTiles = [], matchAdjTiles = [], autos = {}) {
    this.id = id;
    this.matchTiles = new Set(matchTiles);
    this.matchAdjTiles = new Set(matchAdjTiles);
    this.autos = autos;
  }
  /**
   * Autotile at position `pos` using `testMap` to check for valid values and setting 
      * the replacement tile in `destMap`. `testMap` and `destMap` should be the same size.
   * @param {Vec2} pos 
   * @param {TileMap} testMap 
   * @param {TileMap} destMap 
   */
  autoTile(pos, testMap, destMap) {
    let auto = 0;
    let level = 1;
    const tile = testMap.get(pos);
    if (this.matchTiles.has(tile)) {
      for (let delta of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
        const aPos = pos.add(delta);
        const aTile = testMap.get(aPos);
        if (this.matchAdjTiles.has(aTile)) {
          auto += level;
        }
        level *= 2;
      }
      const ind = this.autos[auto] ?? void 0;
      if (ind) {
        destMap.set(pos, ind);
      }
    }
  }
  get length() {
    return this.matchTiles.size;
  }
}
class SpriteSheet extends Resource {
  /**@type {Map<number, SpriteAnimation>} */
  animations = /* @__PURE__ */ new Map();
  /**@type {Map<string, AutoTiler>} */
  autoTiles = /* @__PURE__ */ new Map();
  /**@type {Map<string, TileStamp>} */
  tileStamps = /* @__PURE__ */ new Map();
  /**@type {Map<string, number>} */
  aliases = /* @__PURE__ */ new Map();
  /**
   * 
   * @param {string} srcFile 
   * @param {number} spriteSize 
   */
  constructor(srcFile, spriteSize = 16) {
    super();
    this.spriteSize = spriteSize;
    this.sw = 0;
    this.sh = 0;
    this.len = 0;
    this.sheet = new Image();
    this.sheet.src = srcFile;
    this.sheet.onload = (ev) => {
      this.sw = Math.floor(this.sheet.width / this.spriteSize);
      this.sh = Math.floor(this.sheet.height / this.spriteSize);
      this.len = this.sw * this.sh;
      App.get().emit("sheetLoaded", this.sheet);
      App.get()._needsLayout = true;
    };
  }
  /**
   * Retrieves the alias for a given cell index value
   * @param {number|undefined} index 
   */
  getAlias(index) {
    for (let k of this.aliases.keys()) {
      if (this.aliases.get(k) === index) return k;
    }
  }
  /**@type {Resource['update']} */
  update(app, millis) {
    super.update(app, millis);
    for (let a of this.animations.values()) {
      a.update(app, millis);
    }
  }
  sheetToDataURL() {
    const canvas = document.createElement("canvas");
    canvas.width = this.sheet.width;
    canvas.height = this.sheet.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(this.sheet, 0, 0);
    const imageDataUrl = canvas.toDataURL("image/png");
    return imageDataUrl;
  }
  serialize() {
    const data = {};
    data["spriteSize"] = this.spriteSize;
    data["src"] = this.sheetToDataURL();
    const animations = {};
    for (let k of this.animations.keys()) animations[String(k)] = this.animations.get(k);
    data["animations"] = animations;
    const aliases = {};
    for (let k of this.aliases.keys()) aliases[k] = this.aliases.get(k);
    data["aliases"] = aliases;
    return data;
  }
  /**
   * 
   * @param {Object} data 
   */
  deserialize(data) {
    this.spriteSize = data["spriteSize"];
    this.sheet = new Image();
    this.sheet.onload = (ev) => {
      this.sw = Math.floor(this.sheet.width / this.spriteSize);
      this.sh = Math.floor(this.sheet.height / this.spriteSize);
      this.len = this.sw * this.sh;
      App.get().emit("sheetLoaded", this.sheet);
      App.get()._needsLayout = true;
    };
    this.sheet.src = data["src"];
    this.animations = /* @__PURE__ */ new Map();
    for (let k in data["animations"]) this.animations.set(parseInt(k), data["animations"][k]);
    this.aliases = /* @__PURE__ */ new Map();
    for (let k in data["aliases"]) this.aliases.set(k, data["aliases"][k]);
  }
  /**
   * Draw an indexed tilemap reference to a specified x,y position on the canvas
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} ctx
   * @param {number} ind  
   * @param {number} x 
   * @param {number} y 
   * @param {number} dx 
   * @param {number} dy 
   */
  drawIndexed(ctx, ind, x, y, extraAngle = 0, dx = 0, dy = 0) {
    if (ind < -1) {
      ind = this.animations.get(ind)?.tileValue ?? -1;
    }
    if (ind >= 0) {
      let [flipped, angle, indY, indX] = unpackSpriteInfo(ind, this.len, this.sw);
      angle = (angle + extraAngle) % 4;
      if (!flipped && angle === 0) {
        this.draw(ctx, [indX, indY], x + dx, y + dy);
      } else {
        this.drawRotated(ctx, [indX, indY], x + 0.5, y + 0.5, angle * 90, flipped, [0.5 - dx, 0.5 - dy]);
      }
    }
  }
  /**
   * 
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} ctx
   * @param {[number, number]} spriteLoc 
   * @param {number} x 
   * @param {number} y 
   * @param {boolean} flipX
   */
  draw(ctx, spriteLoc, x, y, flipX = false) {
    let flipped = flipX ? -1 : 1;
    if (flipX) {
      ctx.scale(-1, 1);
    }
    ctx.drawImage(
      this.sheet,
      spriteLoc[0] * this.spriteSize,
      spriteLoc[1] * this.spriteSize,
      this.spriteSize,
      this.spriteSize,
      flipped * x,
      y,
      flipped,
      1
    );
    if (flipX) {
      ctx.scale(-1, 1);
    }
  }
  /**
   * 
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} ctx
   * @param {[number, number]} spriteLoc 
   * @param {number} x 
   * @param {number} y 
   * @param {number} scale 
   * @param {boolean} flipX 
   */
  drawScaled(ctx, spriteLoc, x, y, scale, flipX = false) {
    let flipped = flipX ? -1 : 1;
    if (flipX) {
      ctx.scale(-1, 1);
    }
    ctx.drawImage(
      this.sheet,
      spriteLoc[0] * this.spriteSize,
      spriteLoc[1] * this.spriteSize,
      this.spriteSize,
      this.spriteSize,
      flipped * x,
      y,
      flipped * scale,
      scale
    );
    if (flipX) {
      ctx.scale(-1, 1);
    }
  }
  /**
   * 
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} ctx
   * @param {[number, number]} spriteLoc 
   * @param {number} x 
   * @param {number} y 
   * @param {number} angle 
   * @param {boolean} flipx 
   * @param {[number, number]|'center'} anchor 
   */
  drawRotated(ctx, spriteLoc, x, y, angle, flipx = false, anchor = "center") {
    ctx.save();
    if (anchor == "center") {
      anchor = [1 / 2, 1 / 2];
    } else {
      anchor = [anchor[0], anchor[1]];
    }
    ctx.translate(x, y);
    ctx.rotate(angle * Math.PI / 180);
    if (flipx) {
      ctx.scale(-1, 1);
    }
    ctx.translate(-anchor[0], -anchor[1]);
    ctx.drawImage(
      this.sheet,
      spriteLoc[0] * this.spriteSize,
      spriteLoc[1] * this.spriteSize,
      this.spriteSize,
      this.spriteSize,
      0,
      //-game.tileSize+anchor[0],
      0,
      //-game.tileSize+anchor[1],
      1,
      1
    );
    ctx.restore();
  }
  /**
   * 
   * @param {[number, number, number, number]} spriteLoc 
   * @param {number} x 
   * @param {number} y 
   * @param {number} angle 
   * @param {boolean} flipx 
   * @param {[number, number]|'center'} anchor 
   */
  drawRotatedMultitile(ctx, spriteLoc, x, y, angle, flipx = false, anchor = "center") {
    ctx.save();
    let tw = spriteLoc[2];
    let th = spriteLoc[3];
    if (anchor == "center") {
      anchor = [tw * 1 / 2, th * 1 / 2];
    } else {
      anchor = [anchor[0], anchor[1]];
    }
    ctx.translate(
      x + anchor[0],
      y + anchor[1]
    );
    ctx.rotate(angle * Math.PI / 180);
    if (flipx) {
      ctx.scale(-1, 1);
    }
    ctx.translate(-anchor[0], -anchor[1]);
    ctx.drawImage(
      this.sheet,
      spriteLoc[0] * this.spriteSize,
      spriteLoc[1] * this.spriteSize,
      this.spriteSize * tw,
      this.spriteSize * th,
      0,
      0,
      tw,
      th
    );
    ctx.restore();
  }
}
class LayeredAnimationFrame extends Array {
  /**
   * 
   * @param {number[]} frames 
   * @param {[number, number][]} offsets 
   */
  constructor(frames, offsets) {
    super();
    for (let i = 0; i < frames.length; ++i) {
      if (offsets[i]) {
        this.push(frames[i], offsets[i][0], offsets[i][1]);
      } else {
        this.push(frames[i], 0, 0);
      }
    }
  }
  /**
   * Yields [frame, x-offset, y-offset] tuples
   * @yields {[number, number, number]}
   */
  *iter() {
    for (let i = 0; i < this.length / 3; i++) {
      yield this.slice(i * 3, i * 3 + 3);
    }
  }
}
function laf(frames = [], offsets = []) {
  return new LayeredAnimationFrame(frames, offsets);
}
class SpriteWidget extends Widget {
  /** @type {SpriteSheet|null} */
  spriteSheet = null;
  /** @type {number[]|LayeredAnimationFrame[]} */
  frames = [];
  timePerFrame = 30;
  timeLeft = 0;
  activeFrame = 0;
  id = "";
  facing = 0;
  flipX = false;
  flipY = false;
  oneShot = false;
  constructor(props = {}) {
    super();
    if (props) this.updateProperties(props);
  }
  /**
   * 
   * @param {App} app 
   * @param {number} millis
   */
  update(app, millis) {
    super.update(app, millis);
    this.timeLeft -= millis;
    if (this.timeLeft <= 0) {
      if (this.oneShot && this.activeFrame === this.frames.length - 1) {
        this.timeLeft = Infinity;
        this.emit("animationComplete", this.activeFrame);
        return;
      }
      this.activeFrame++;
      if (this.activeFrame >= this.frames.length) {
        this.activeFrame = 0;
      }
      this.timeLeft += this.timePerFrame;
    }
    if (this.frames.length > 0 && this.timeLeft !== Infinity) {
      app.requestFrameUpdate();
    }
  }
  restart() {
    this.activeFrame = 0;
    this.timeLeft = this.timePerFrame;
  }
  on_frames(e, o, v) {
    this.restart();
  }
  get frame() {
    return this.frames[this.activeFrame] ?? -1;
  }
  /**
   * 
   * @param {App} app 
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} ctx 
   */
  draw(app, ctx) {
    if (this.spriteSheet === null || !this.spriteSheet.sheet.complete) return;
    const tx = Math.floor(this.x * app.tileSize) / app.tileSize;
    const ty = Math.floor(this.y * app.tileSize) / app.tileSize;
    ctx.translate(tx, ty);
    ctx.scale(this.w, this.h);
    if (this.frame instanceof LayeredAnimationFrame) {
      for (let [f, dx, dy] of this.frame.iter()) {
        this.spriteSheet.drawIndexed(ctx, f, 0, 0, this.facing, dx, dy);
      }
    } else {
      this.spriteSheet.drawIndexed(ctx, this.frame, 0, 0, this.facing);
    }
    ctx.scale(1 / this.w, 1 / this.h);
    ctx.translate(-tx, -ty);
  }
}
class TileMap extends Widget {
  constructor(props = {}) {
    super();
    this.defaultValue = -1;
    this._data = new Grid2D();
    this._vLayer = null;
    this._aLayer = null;
    this._cacheTileDim = new Vec2();
    this.tileDim = new Vec2();
    this.hints = { w: null, h: null };
    this.spriteSheet = null;
    this.clipRegion = null;
    this.alphaValue = 0.5;
    this.useCache = true;
    if (props) this.updateProperties(props);
  }
  /**
   * 
   * @returns {Object}
   */
  serialize() {
    const data = {};
    data["_data"] = this._data.slice();
    data["tileDim"] = this.tileDim.slice();
    data["spriteSheet"] = Array(...App.resources.keys()).find((k) => App.resources[k] === this.spriteSheet) ?? null;
    return data;
  }
  /**
   * 
   * @param {VecLike} pos 
   * @returns 
   */
  get(pos) {
    return this._data.get(pos);
  }
  /**
   * 
   * @param {VecLike} pos 
   * @param {number} value 
   */
  set(pos, value) {
    this._data.set(pos, value);
    this._data._cacheData = null;
  }
  get data() {
    return this._data;
  }
  /**
   * 
   * @param {Object} data 
   */
  deserialize(data) {
    this.tileDim = new Vec2(data["tileDim"] ?? [0, 0]);
    const _data = data["_data"];
    for (let i = 0; i < _data.length; i++) {
      this._data[i] = _data[i];
    }
    this.spriteSheet = App.resources[data["spriteSheet"]] ?? null;
    this._data._cacheData = null;
  }
  /**@type {import('./widgets.js').EventCallbackNullable} */
  on_tileDim(evt, obj, val) {
    this.resizeData();
    this.w = this.tileDim[0];
    this.h = this.tileDim[1];
    this._cacheTileDim = new Vec2(this.tileDim);
  }
  resizeData() {
    let cacheData = [];
    for (let y = 0; y < this._cacheTileDim[1]; y++) {
      for (let x = 0; x < this._cacheTileDim[0]; x++) {
        cacheData.push(this.get([x, y]));
      }
    }
    this._data.tileDim = new Vec2(this.tileDim);
    this._data.length = this.tileDim[0] * this.tileDim[1];
    this._data.fill(this.defaultValue);
    let i = 0;
    for (let y = 0; y < this._cacheTileDim[1]; y++) {
      for (let x = 0; x < this._cacheTileDim[0]; x++) {
        if (x < this.tileDim[0] && y < this.tileDim[1]) this.set([x, y], cacheData[i]);
        ++i;
      }
    }
    this._data._cacheData = null;
  }
  /**@type {Widget['draw']} */
  draw(app, ctx) {
    super.draw(app, ctx);
    if (this.spriteSheet === null || !this.spriteSheet.sheet.complete) return;
    if (!this.spriteSheet.sheet.complete || this.spriteSheet.sheet.naturalHeight == 0) return;
    let [x0, y0] = [0, 0];
    let [x1, y1] = this.tileDim;
    if (this.clipRegion) {
      [x0, y0] = this.clipRegion.pos;
      [x1, y1] = this.clipRegion.pos.add(this.clipRegion.size).add([1, 1]);
      x0 = Math.min(Math.max(x0, 0), this.tileDim[0]);
      x1 = Math.min(Math.max(x1, 0), this.tileDim[0]);
      y0 = Math.min(Math.max(y0, 0), this.tileDim[1]);
      y1 = Math.min(Math.max(y1, 0), this.tileDim[1]);
    }
    Math.floor(this.spriteSheet.sheet.width / this.spriteSheet.spriteSize);
    Math.floor(this.spriteSheet.sheet.height / this.spriteSheet.spriteSize);
    if (this.useCache) {
      if (this._data._cacheData === null) this.cacheCanvas();
      if (this._data._cacheData === null) return;
      const s = this.spriteSheet.spriteSize;
      ctx.drawImage(
        this._data._cacheData,
        s * x0,
        s * y0,
        s * (x1 - x0),
        s * (y1 - y0),
        this.x + x0,
        this.y + y0,
        x1 - x0,
        y1 - y0
      );
      if (this._aLayer === null && this._vLayer === null) {
        for (let x = x0; x < x1; x++) {
          for (let y = y0; y < y1; y++) {
            let p = x + y * this.tileDim[0];
            let ind = this._data[p];
            if (ind < -1) this.spriteSheet.drawIndexed(ctx, ind, x + this.x, y + this.y);
          }
        }
      } else if (this._aLayer && this._vLayer) {
        const aL = this._aLayer;
        const vL = this._vLayer;
        const origAlpha = ctx.globalAlpha;
        const dat = this._data;
        for (let x = x0; x < x1; x++) {
          for (let y = y0; y < y1; y++) {
            let p = x + y * this.tileDim[0];
            let ind = dat[p];
            if (ind < -1 && vL[p] > 0) {
              if (aL[p] === 0) {
                ctx.globalAlpha = this.alphaValue;
                this.spriteSheet.drawIndexed(ctx, ind, x + this.x, y + this.y);
                ctx.globalAlpha = origAlpha;
              } else {
                this.spriteSheet.drawIndexed(ctx, ind, x + this.x, y + this.y);
              }
            }
          }
        }
      }
    } else {
      if (this._aLayer === null && this._vLayer === null) {
        for (let x = x0; x < x1; x++) {
          for (let y = y0; y < y1; y++) {
            let p = x + y * this.tileDim[0];
            let ind = this._data[p];
            this.spriteSheet.drawIndexed(ctx, ind, x + this.x, y + this.y);
          }
        }
      } else if (this._aLayer && this._vLayer) {
        const aL = this._aLayer;
        const vL = this._vLayer;
        const origAlpha = ctx.globalAlpha;
        const dat = this._data;
        for (let x = x0; x < x1; x++) {
          for (let y = y0; y < y1; y++) {
            let p = x + y * this.tileDim[0];
            let ind = dat[p];
            if (ind !== -1 && vL[p] > 0) {
              if (aL[p] === 0) {
                ctx.globalAlpha = this.alphaValue;
                this.spriteSheet.drawIndexed(ctx, ind, x + this.x, y + this.y);
                ctx.globalAlpha = origAlpha;
              } else {
                this.spriteSheet.drawIndexed(ctx, ind, x + this.x, y + this.y);
              }
            }
          }
        }
      }
    }
  }
  clearCache() {
    this.data._cacheData = null;
  }
  cacheCanvas() {
    this._data._cacheData = null;
    if (!this.spriteSheet || !this.spriteSheet.sheet || this.tileDim[0] <= 0 || this.tileDim[1] <= 0) return;
    const _cacheData = new OffscreenCanvas(this.tileDim[0] * this.spriteSheet.spriteSize, this.tileDim[1] * this.spriteSheet.spriteSize);
    const cacheCtx = _cacheData.getContext("2d");
    if (!cacheCtx) return;
    cacheCtx.scale(this.spriteSheet.spriteSize, this.spriteSheet.spriteSize);
    let [x0, y0] = [0, 0];
    let [x1, y1] = this.tileDim;
    if (this._aLayer === null && this._vLayer === null) {
      for (let x = x0; x < x1; x++) {
        for (let y = y0; y < y1; y++) {
          let p = x + y * this.tileDim[0];
          let ind = this._data[p];
          if (ind >= 0) {
            this.spriteSheet.drawIndexed(cacheCtx, ind, x, y);
          }
        }
      }
    } else if (this._aLayer && this._vLayer) {
      const aL = this._aLayer;
      const vL = this._vLayer;
      const origAlpha = cacheCtx.globalAlpha;
      const dat = this._data;
      for (let x = x0; x < x1; x++) {
        for (let y = y0; y < y1; y++) {
          let p = x + y * this.tileDim[0];
          let ind = dat[p];
          if (ind >= 0 && vL[p] > 0) {
            if (aL[p] === 0) {
              cacheCtx.globalAlpha = this.alphaValue;
              this.spriteSheet.drawIndexed(cacheCtx, ind, x, y);
              cacheCtx.globalAlpha = origAlpha;
            } else {
              this.spriteSheet.drawIndexed(cacheCtx, ind, x, y);
            }
          }
        }
      }
    }
    this._data._cacheData = _cacheData;
  }
}
class LayeredTileMap extends TileMap {
  constructor(props = {}) {
    super();
    this._layerData = [this._data];
    this.numLayers = 1;
    this.activeLayer = 0;
    this.visibilityLayer = -1;
    this.alphaLayer = -1;
    if (props) this.updateProperties(props);
  }
  on_alphaLayer(e, o, v) {
    this._aLayer = this.alphaLayer >= 0 ? this._layerData[this.alphaLayer] : null;
  }
  on_visibilityLayer(e, o, v) {
    this._vLayer = this.visibilityLayer >= 0 ? this._layerData[this.visibilityLayer] : null;
  }
  serialize() {
    const data = {};
    const layerCopy = [];
    for (let l of this._layerData) {
      layerCopy.push(l.slice());
    }
    data["_layerData"] = layerCopy;
    data["activeLayer"] = this.activeLayer;
    data["numLayers"] = this.numLayers;
    data["tileDim"] = this.tileDim.slice();
    data["spriteSheet"] = Array(...App.resources.keys()).find((k) => App.resources[k] === this.spriteSheet) ?? null;
    return data;
  }
  /**
   * 
   * @param {Object} data 
   */
  deserialize(data) {
    this.numLayers = data["numLayers"];
    this.activeLayer = data["activeLayer"];
    this.tileDim = new Vec2(data["tileDim"] ?? [0, 0]);
    const n = data["_layerData"].length;
    this._layerData.length = n;
    for (let i = 0; i < n; i++) {
      const lout = this._layerData[i];
      const lin = data["_layerData"][i];
      for (let j = 0; j < lin.lenth; j++) {
        lout[j] = lin[j];
      }
    }
    this.spriteSheet = App.resources[data["spriteSheet"]] ?? null;
    this.clearCache();
  }
  /**@type {import('./widgets.js').EventCallbackNullable} */
  on_tileDim(evt, obj, val) {
    if (!("_layerData" in this)) return;
    for (let l of this._layerData) {
      this._data = l;
      this.resizeData();
    }
    if (this.activeLayer >= 0) this._data = this._layerData[this.activeLayer];
    this.w = this.tileDim[0];
    this.h = this.tileDim[1];
    this._cacheTileDim = new Vec2(this.tileDim);
  }
  /**@type {import('./widgets.js').EventCallbackNullable} */
  on_numLayers(evt, obj, val) {
    const oldLen = this._layerData.length;
    this._layerData.length = this.numLayers;
    for (let i = oldLen; i < this.numLayers; i++) {
      const layer = new Grid2D(this.tileDim).fill(this.defaultValue);
      this._layerData[i] = layer;
    }
    if (this.activeLayer >= this.numLayers) this.activeLayer = this.numLayers - 1;
  }
  /**@type {import('./widgets.js').EventCallbackNullable} */
  on_activeLayer(evt, obj, val) {
    this._data = this._layerData[this.activeLayer];
  }
  get layer() {
    return this._layerData;
  }
  /**
   * Returns the value at position `pos` of layer `layer`
   * @param {number} layer 
   * @param {VecLike} pos 
   */
  getFromLayer(layer, pos) {
    return this._layerData[layer][pos[0] + pos[1] * this.tileDim[0]];
  }
  /**
   * Sets value `val` at position `pos` of layer `layer`
   * @param {number} layer 
   * @param {VecLike} pos 
   * @param {number} val
   */
  setInLayer(layer, pos, val) {
    this._layerData[layer][pos[0] + pos[1] * this.tileDim[0]] = val;
    this._layerData[layer]._cacheData = null;
  }
  clearCache() {
    for (let l of this._layerData) l._cacheData = null;
  }
  /**@type {Widget['draw']} */
  draw(app, ctx) {
    for (let l of this._layerData) {
      if (!l.hidden) {
        this._data = l;
        super.draw(app, ctx);
      }
    }
    this._data = this._layerData[this.activeLayer];
  }
}
App.registerClass("Widget", Widget, "");
App.registerClass("App", App, "");
App.registerClass("Label", Label, "");
App.registerClass("Button", Button, "");
App.registerClass("ToggleButton", ToggleButton, "");
App.registerClass("BasicButton", BasicButton, "");
App.registerClass("TextInput", TextInput, "");
App.registerClass("CheckBox", CheckBox, "");
App.registerClass("Slider", Slider, "");
App.registerClass("ImageWidget", ImageWidget, "");
App.registerClass("BoxLayout", BoxLayout, "");
App.registerClass("GridLayout", GridLayout, "");
App.registerClass("ScrollView", ScrollView, "");
App.registerClass("ModalView", ModalView, "");
App.registerClass("Notebook", Notebook, "");
App.registerClass("TabbedNotebook", TabbedNotebook, "");
App.registerClass("SpriteWidget", SpriteWidget, "");
App.registerClass("TileMap", TileMap, "");
App.registerClass("LayeredTileMap", LayeredTileMap, "");
const Facing = {
  north: 0,
  east: 1,
  south: 2,
  west: 3
};
const FacingVec = {
  0: vec2(0, -1),
  1: vec2(1, 0),
  2: vec2(0, 1),
  3: vec2(-1, 0),
  4: vec2(0, 0)
};
const binaryFacing = {
  0: 1,
  1: 2,
  2: 4,
  3: 8,
  4: 0
};
function facingFromVec(vec) {
  if (vec[1] < 0) return 0;
  if (vec[0] > 0) return 1;
  if (vec[1] > 0) return 2;
  if (vec[0] < 0) return 3;
  return 4;
}
class Entity extends SpriteWidget {
  visible = true;
  constructor(props = {}) {
    super();
    if (props) this.updateProperties(props);
  }
  get traversible() {
    return 15;
  }
  get allowsSight() {
    return 15;
  }
  /**
   * 
   * @param {MissionMap} map 
   * @param {Character} character 
   */
  interact(map, character) {
    return false;
  }
}
class DoorWidget extends Entity {
  /**@type {DoorStates} */
  state = "open";
  /**@type {DoorAnimationStates} */
  animationState = "open";
  /**@type {LockState} */
  lockState = "unlocked";
  timePerFrame = 100;
  visible = false;
  oneShot = true;
  /**@type {{[id:string]: LayeredAnimationFrame[]|number[]}|null} */
  animationGroup = {
    "closed": [39],
    "open": [new LayeredAnimationFrame([3111], [[0.5, -0.5]])],
    //[3111],
    "closing": [
      //new LayeredAnimationFrame([3111],[[0.5,-0.5]]),
      new LayeredAnimationFrame([7], [[0, -0.25]])
    ],
    //[3111, 7],
    "opening": [
      //new LayeredAnimationFrame([3111],[[0.5,-0.5]]),
      new LayeredAnimationFrame([7], [[0, -0.25]])
    ],
    //[39, 7],
    "flattened": [new LayeredAnimationFrame([40, 8], [[0, -0.5], [0, -1.5]])],
    "destroyed": [new LayeredAnimationFrame([9, 41], [[0, -0.5], [0, -1.5]])],
    "falling": [10],
    "exploding": [41]
  };
  constructor(props = {}) {
    super();
    this.spriteSheet = App.resources["sprites"];
    if (props) this.updateProperties(props);
  }
  placeDoor(pos, facing) {
    this.pos = pos;
    this.facing = facing;
  }
  on_state(e, o, v) {
    switch (this.state) {
      case "closed":
        this.animationState = "closing";
        break;
      case "open":
        this.animationState = "opening";
        break;
      case "destroyed":
        this.animationState = "exploding";
        break;
      case "flattened":
        this.animationState = "falling";
        break;
    }
  }
  get traversible() {
    return this.state !== "closed" ? 15 : 0;
  }
  get allowsSight() {
    return this.state === "closed" ? 0 : this.facing === Facing.north ? 5 : this.facing === Facing.east ? 10 : this.facing === Facing.south ? 5 : 10;
  }
  /**@type {Entity['interact']} */
  interact(map, character) {
    if (character instanceof PlayerCharacter && this.lockState === "locked" && this.state === "closed") return false;
    if (this.state === "closed") {
      this.state = "open";
      map.metaTileMap.layer[MetaLayers.traversible].set(this.pos, this.traversible);
      const rot = (this.facing + 3) % 4;
      const rotr = (this.facing + 1) % 4;
      const back = (this.facing + 2) % 4;
      const bpos = this.pos.add(FacingVec[this.facing]);
      const bpos2 = bpos.add(FacingVec[rot]);
      const as = this.allowsSight;
      map.metaTileMap.layer[MetaLayers.allowsSight].set(this.pos, 15);
      if (map.metaTileMap.layer[MetaLayers.layout].get(bpos) === LayoutTiles.floor) map.metaTileMap.layer[MetaLayers.allowsSight].set(bpos, as | binaryFacing[rotr]);
      if (map.metaTileMap.layer[MetaLayers.layout].get(bpos2) === LayoutTiles.floor) map.metaTileMap.layer[MetaLayers.allowsSight].set(bpos2, as & ~binaryFacing[back] | binaryFacing[rot]);
      return true;
    }
    if (this.state === "open") {
      this.state = "closed";
      map.metaTileMap.layer[MetaLayers.allowsSight].set(this.pos, this.allowsSight);
      map.metaTileMap.layer[MetaLayers.traversible].set(this.pos, this.traversible);
      const rot = (this.facing + 3) % 4;
      const bpos = this.pos.add(FacingVec[this.facing]);
      const bpos2 = bpos.add(FacingVec[rot]);
      if (map.metaTileMap.layer[MetaLayers.layout].get(bpos) === LayoutTiles.floor) map.metaTileMap.layer[MetaLayers.allowsSight].set(bpos, 15);
      if (map.metaTileMap.layer[MetaLayers.layout].get(bpos2) === LayoutTiles.floor) map.metaTileMap.layer[MetaLayers.allowsSight].set(bpos2, 15);
      return true;
    }
    return false;
  }
  on_animationState(e, o, v) {
    if (this.animationGroup) {
      this.frames = this.animationGroup[this.animationState];
    }
  }
  on_animationComplete(e, o, v) {
    switch (this.animationState) {
      case "closing":
        this.animationState = "closed";
        break;
      case "opening":
        this.animationState = "open";
        break;
      case "exploding":
        this.animationState = "destroyed";
        break;
      case "falling":
        this.animationState = "flattened";
        break;
    }
  }
  draw(app, ctx) {
    if (this.visible) super.draw(app, ctx);
  }
}
const characterAnimations = {
  randy: {
    standing: [
      laf([326, 4388], [[0, 0], [0, -0.25]])
    ],
    walking: [
      laf([323, 4387], [[0, 0], [0, -0.25]]),
      laf([324, 4387], [[0, 0], [0, -0.25]]),
      laf([4420, 4388], [[0, 0], [0, -0.25]]),
      laf([4419, 4389], [[0, 0], [0, -0.25]]),
      laf([4420, 4389], [[0, 0], [0, -0.25]]),
      laf([324, 4388], [[0, 0], [0, -0.25]])
    ],
    dead: [
      laf([
        321,
        289
        /*, 321+32*/
      ], [[0, 1], [0, 0]])
    ]
  },
  maria: {
    standing: [
      laf([326 + 96, 4388 + 96], [[0, 0], [0, -0.25]])
    ],
    walking: [
      laf([323 + 96, 4387 + 96], [[0, 0], [0, -0.25]]),
      laf([324 + 96, 4387 + 96], [[0, 0], [0, -0.25]]),
      laf([4420 + 96, 4388 + 96], [[0, 0], [0, -0.25]]),
      laf([4419 + 96, 4389 + 96], [[0, 0], [0, -0.25]]),
      laf([4420 + 96, 4389 + 96], [[0, 0], [0, -0.25]]),
      laf([324 + 96, 4388 + 96], [[0, 0], [0, -0.25]])
    ],
    dead: [
      laf([
        321 + 96,
        289 + 96
        /*, 321+96+32*/
      ], [[0, 1], [0, 0]])
    ]
  },
  greenShirt: {
    standing: [
      laf([326 + 288, 4388 + 288], [[0, 0], [0, -0.25]])
    ],
    walking: [
      laf([323 + 288, 4387 + 288], [[0, 0], [0, -0.25]]),
      laf([324 + 288, 4387 + 288], [[0, 0], [0, -0.25]]),
      laf([4420 + 288, 4388 + 288], [[0, 0], [0, -0.25]]),
      laf([4419 + 288, 4389 + 288], [[0, 0], [0, -0.25]]),
      laf([4420 + 288, 4389 + 288], [[0, 0], [0, -0.25]]),
      laf([324 + 288, 4388 + 288], [[0, 0], [0, -0.25]])
    ],
    dead: [
      laf([321 + 288, 289 + 288, 321 + 288 + 32], [[0, 1], [0, 0]])
    ]
  },
  whiteShirt: {
    standing: [
      laf([518, 484], [[0, 0], [0, -0.25]])
    ],
    walking: [
      laf([515, 483], [[0, 0], [0, -0.25]]),
      laf([516, 483], [[0, 0], [0, -0.25]]),
      laf([4612, 484], [[0, 0], [0, -0.25]]),
      laf([4611, 4579], [[0, 0], [0, -0.25]]),
      laf([4612, 4579], [[0, 0], [0, -0.25]]),
      laf([516, 484], [[0, 0], [0, -0.25]])
    ],
    dead: [
      laf([513, 481, 513 + 32], [[0, 1], [0, 0]])
    ]
  }
};
function costedBFSPath(costGrid, origin, dest) {
  if (origin.equals(dest)) return [dest];
  let distances = new Grid2D(costGrid.tileDim).fill(Infinity);
  distances.set(origin, 0);
  let candidates = [origin];
  let deferredCandidates = [];
  let done = false;
  while (candidates.length > 0 && !done) {
    let newCandidates = [];
    for (let pos of candidates) {
      for (let npos of costGrid.iterAdjacent(pos)) {
        let cost = costGrid.get(npos);
        if (distances.get(pos) + cost < distances.get(npos)) {
          if (npos.equals(dest)) done = true;
          distances.set(npos, distances.get(pos) + cost);
          if (cost > 1 && !done) {
            deferredCandidates.push([npos, cost]);
          } else {
            newCandidates.push(npos);
          }
        }
      }
    }
    const newDeferred = [];
    for (let posCost of deferredCandidates) {
      if (posCost[1] > 1) {
        posCost[1]--;
        newDeferred.push(posCost);
      } else {
        newCandidates.push(posCost[0]);
      }
    }
    deferredCandidates = newDeferred;
    candidates = newCandidates;
  }
  const route = [];
  if (distances.get(dest) === Infinity) return route;
  let current = dest;
  while (!current.equals(origin)) {
    let lowest = Infinity;
    let nextCurrent = null;
    for (let candidate of distances.iterAdjacent(current)) {
      const dist2 = distances.get(candidate);
      if (dist2 < lowest) {
        lowest = dist2;
        nextCurrent = candidate;
      }
    }
    route.unshift(current);
    if (nextCurrent !== null) current = nextCurrent;
  }
  return route;
}
class Character extends Entity {
  /**@type {Set<ActionItem>} */
  actions = /* @__PURE__ */ new Set();
  /**@type {eskv.Widget|null}*/
  actionInventory = null;
  /**@type {Facing} */
  facing = Facing.north;
  constitution = 1;
  /**@type {CharacterStates} */
  priorState = "patrolling";
  /**@type {CharacterStates} */
  state = "patrolling";
  /**@type {CharacterStates} */
  resumeState = "patrolling";
  /**@type {AnimationStates} */
  animationState = "standing";
  /**@type {{[id:string]: LayeredAnimationFrame[]|number[]}|null} */
  animationGroup = null;
  /**Grid location of the character on the map */
  gpos = vec2(0, 0);
  /**@type {eskv.Vec2[]} Array of waypoints that character will move along in patrol mode*/
  patrolRoute = [];
  /** Index of the current target on the patrol route*/
  patrolTarget = -1;
  /** Number of actions remaining this turn */
  actionsThisTurn = 2;
  /** true if player can see this character */
  visibleToPlayer = false;
  /** @type {[ActionItem, import("./action.js").ActionResponseData][]} */
  history = [];
  suppressed = false;
  /**Cumulative # of actions where the character's movement has been impeded */
  movementBlockedCount = 0;
  /**@type {Set<eskv.Vec2>} */
  _coverPositions = /* @__PURE__ */ new Set();
  _visibleLayer = new Grid2D();
  activeCharacter = false;
  constructor(props = {}) {
    super();
    this.spriteSheet = App.resources["sprites"];
    this.frames = [452];
    this.w = 1;
    this.h = 1;
    if (props) this.updateProperties(props);
  }
  on_actionInventory(e, o, v) {
    if (this.actionInventory) {
      const children = [];
      for (let a of this.actions) {
        a.hints = { w: "3", h: "3" };
        this.actionInventory.addChild(a);
      }
      this.actionInventory.children = children;
    }
  }
  /**
   * 
   * @param {ActionItem} action 
   */
  addAction(action) {
    if (this.actions.has(action)) return false;
    this.actions.add(action);
    action.hints = { w: "3", h: "3" };
    if (this.actionInventory) this.actionInventory.addChild(action);
    return true;
  }
  /**
   * 
   * @param {ActionItem} action 
   */
  removeAction(action) {
    if (!this.actions.has(action)) return false;
    this.actions.delete(action);
    if (this.actionInventory) this.actionInventory.removeChild(action);
    return true;
  }
  on_animationState(e, o, v) {
    if (this.animationGroup) this.frames = this.animationGroup[this.animationState];
  }
  /**
   * Line of sight check from one character to another
   * respects both tile sight and cover properties
   * @param {Character} character 
   * @param {MissionMap} map 
   */
  canSee(character, map) {
    const sightMap = map.metaTileMap.layer[MetaLayers.allowsSight];
    const coverMap = map.metaTileMap.layer[MetaLayers.cover];
    const w = sightMap.tileDim[0];
    let cover = false;
    for (let pos of sightMap.iterInBetween(this.gpos, character.gpos)) {
      if (sightMap[pos[0] + pos[1] * w] === 0 || cover) return false;
      cover = coverMap[pos[0] + pos[1] * w] > 0 ? true : false;
    }
    return true;
  }
  /**
   * 
   * @param {MissionMap} map 
   */
  setupForLevelStart(map, rng) {
    this._coverPositions = /* @__PURE__ */ new Set();
    this._visibleLayer = new Grid2D([map.w, map.h]).fill(0);
    let i = 0;
    let a = vec2(1, 1);
    let b = vec2(1, 1);
    while (i < 1e3) {
      i++;
      a = v2(rng.getRandomPos(map.w, map.h));
      if (map.metaTileMap.layer[MetaLayers.layout].get(a) === LayoutTiles.floor) break;
    }
    i = 0;
    while (i < 1e3) {
      i++;
      b = v2(rng.getRandomPos(map.w, map.h));
      if (map.metaTileMap.layer[MetaLayers.layout].get(b) === LayoutTiles.floor && b.dist(a) > 15) break;
    }
    this.patrolRoute = [a, b];
    this.gpos = v2(b);
    [this.x, this.y] = this.gpos;
    this.animationGroup = this.id[0] === "d" ? characterAnimations.greenShirt : characterAnimations.whiteShirt;
    this.animationState = "standing";
  }
  /**
   * @param {MissionMap} mmap
   */
  rest(mmap2) {
    this.actionsThisTurn--;
    if (this.activeCharacter) {
      this.updateFoV(mmap2);
      this.updateCamera(mmap2);
    }
  }
  /**
   * 
   * @param {Facing} dir direction to move in
   * @param {MissionMap} mmap
   */
  move(dir, mmap2) {
    const npos = this.gpos.add(FacingVec[dir]);
    const tmap = mmap2.metaTileMap;
    const traverse = tmap.getFromLayer(MetaLayers.traversible, npos);
    this.facing = dir;
    if ((traverse & binaryFacing[dir]) === 0) {
      for (let e of mmap2.entities.children) {
        if (e instanceof Entity && e.pos.equals(npos)) {
          e.interact(mmap2, this);
          this.actionsThisTurn--;
          break;
        }
      }
      if (this instanceof PlayerCharacter) {
        if (mmap2.metaTileMap.layer[MetaLayers.layout].get(npos) === LayoutTiles.window) {
          mmap2.metaTileMap.layer[MetaLayers.layout].set(npos, LayoutTiles.brokenWindow);
          mmap2.updateTileInfo(npos);
        }
      }
    } else if (mmap2.characters.reduce((accum, e) => accum || e.gpos.equals(npos) && e.state !== "dead", false)) {
      this.movementBlockedCount++;
    } else {
      this.pos = v2(this.gpos);
      this.gpos = npos;
      const anim = new WidgetAnimation();
      anim.add({ x: this.gpos[0], y: this.gpos[1] }, 300);
      anim.start(this);
      if (this.animationGroup !== null) {
        this.animationState = "walking";
        this.timePerFrame = 60;
      }
      this.actionsThisTurn--;
      this.movementBlockedCount = Math.max(this.movementBlockedCount - 1, 0);
    }
    if (this.activeCharacter) {
      this.updateFoV(mmap2);
      this.updateCamera(mmap2);
    }
  }
  on_animationComplete(e, o, v) {
    if (this.animationState = "walking") {
      this.animationState = "standing";
    }
  }
  /**
   * @param {'piercing'|'shock'|'force'} damageType
   */
  takeDamage(damageType) {
    if (damageType === "piercing") {
      this.state = "dead";
      this.animationState = "dead";
    }
  }
  /**
   * 
   * @param {string} actionId 
   * @param {string} mode 
   * @param {Vec2} position 
   */
  useAction(actionId, position, mode) {
  }
  /**
   * Updates the field of view for the character
   * This is expensive so typically we will only run this
   * on the active player character. Non-player character
   * checks should use canSee instead on discrete points
   * @param {MissionMap} map 
   */
  updateFoV(map) {
    const mmap2 = map.metaTileMap;
    this._coverPositions.clear();
    this._visibleLayer.fill(0);
    mmap2.activeLayer = MetaLayers.allowsSight;
    const cpos = this.gpos;
    for (let pBounds of mmap2.data.iterRectBoundary(new Rect([...this.gpos, 20, 20]).translate([-10, -10]).translate(FacingVec[this.facing].scale(9)))) {
      const dest = v2(pBounds);
      let prevPos = v2(this.gpos);
      let coversNext = false;
      let dir = dest.sub(cpos).scale(1 / dest.dist(cpos));
      if (Math.abs(dir[0]) > Math.abs(dir[1])) dir[1] = 0;
      else if (Math.abs(dir[1]) > Math.abs(dir[0])) dir[0] = 0;
      for (let p of mmap2.data.iterBetween(cpos, dest)) {
        let p0 = v2([Math.round(p[0]), Math.round(p[1])]);
        let p1 = v2(p0);
        const addx = p[0] - p0[0];
        if (addx > 0) p1[0] += 1;
        else if (addx < 0) p1[0] -= 1;
        const addy = p[1] - p0[1];
        if (addy > 0) p1[1] += 1;
        else if (addy < 0) p1[1] -= 1;
        let sight0 = mmap2.get(prevPos);
        let sight1 = mmap2.get(p0);
        let canContinue = false;
        if (cpos.equals(p)) canContinue = true;
        else if (dir[1] < 0 && dir[0] === 0 && sight0 & 1 && sight1 & 4) canContinue = true;
        else if (dir[1] < 0 && dir[0] > 0 && (sight0 & 1 && sight1 & 8 && sight0 & 2 && sight1 & 4)) canContinue = true;
        else if (dir[0] > 0 && dir[1] === 0 && sight0 & 2 && sight1 & 8) canContinue = true;
        else if (dir[1] > 0 && dir[0] > 0 && (sight0 & 4 && sight1 & 1 && sight0 & 2 && sight1 & 8)) canContinue = true;
        else if (dir[1] > 0 && dir[0] === 0 && sight0 & 4 && sight1 & 1) canContinue = true;
        else if (dir[1] > 0 && dir[0] < 0 && (sight0 & 4 && sight1 & 1 && sight0 & 8 && sight1 & 2)) canContinue = true;
        else if (dir[0] < 0 && dir[1] === 0 && sight0 & 8 && sight1 & 2) canContinue = true;
        else if (dir[1] < 0 && dir[0] < 0 && (sight0 & 1 && sight1 & 4 && sight0 & 8 && sight1 & 2)) canContinue = true;
        if (canContinue && !coversNext) {
          this._visibleLayer[p0[0] + p0[1] * mmap2.w] = 1;
          if (this.activeCharacter) mmap2.setInLayer(MetaLayers.seen, p0, 1);
        } else {
          if (sight1 === 0) {
            this._visibleLayer[p0[0] + p0[1] * mmap2.w] = 1;
            if (this.activeCharacter) mmap2.setInLayer(MetaLayers.seen, p0, 1);
          }
          this._coverPositions.add(p0);
        }
        if (!canContinue) break;
        coversNext = false;
        if (dir[1] < 0 && sight0 & 16) coversNext = true;
        else if (dir[0] > 0 && sight0 & 32) coversNext = true;
        else if (dir[1] > 0 && sight0 & 64) coversNext = true;
        else if (dir[0] < 0 && sight0 & 128) coversNext = true;
        prevPos = v2(p0);
      }
    }
    for (let ent of map.entities.children) {
      if (ent instanceof Entity) {
        ent.visible = this._visibleLayer.get(ent.pos) > 0;
      }
    }
    map.tileMap.clearCache();
  }
  /**
   * 
   * @param {MissionMap} mmap 
   */
  updateCamera(mmap2) {
    const camera = (
      /**@type {eskv.ScrollView}*/
      App.get().findById("scroller")
    );
    if (camera) {
      const target = this.gpos.add(FacingVec[this.facing].scale(5));
      const dist2 = target.dist(this.gpos);
      let X = Math.min(Math.max(target[0] + 0.5 - camera.w / camera.zoom / 2, 0), mmap2.w);
      let Y = Math.min(Math.max(target[1] + 0.5 - camera.h / camera.zoom / 2, 0), mmap2.h);
      const ts = App.get().tileSize;
      X = Math.floor(X * ts) / ts;
      Y = Math.floor(Y * ts) / ts;
      const anim = new WidgetAnimation();
      anim.add({ scrollX: X, scrollY: Y }, 250 * dist2 / 2);
      anim.start(camera);
    }
  }
  /**
   * 
   * @param {ActionItem} actionItem
   * @param {MissionMap} mmap 
   * @param {import("./action.js").ActionResponseData} request
   * @returns {import("./action.js").ActionResponseData}
   */
  takeAction(actionItem, mmap2, request = {}) {
    if (this.actions.has(actionItem)) {
      const response = actionItem.request(this, mmap2, request);
      if (response.result === "complete") {
        this.history.push([actionItem, request]);
        this.actionsThisTurn--;
      }
      return response;
    }
    return { result: "notAvailable" };
  }
  /**
   * 
   * @param {MissionMap} mmap 
   * @returns 
   */
  takeTurn(mmap2) {
    mmap2.updateCharacterVisibility(true);
    while (this.actionsThisTurn > 0) {
      if (this.state === "patrolling") {
        if (this.patrolTarget < 0) this.patrolTarget = 0;
        if (this.patrolRoute.length === 0) break;
        if (this.gpos.equals(this.patrolRoute[this.patrolTarget])) this.patrolTarget = (this.patrolTarget + 1) % this.patrolRoute.length;
        const src = this.gpos;
        const dest = this.patrolRoute[this.patrolTarget];
        const moveCostGrid = new Grid2D([mmap2.w, mmap2.h]);
        mmap2.metaTileMap.layer[MetaLayers.layout].forEach((v, i) => {
          moveCostGrid[i] = v === LayoutTiles.wall || v === LayoutTiles.window || v === LayoutTiles.coveredWindow ? Infinity : 1;
        });
        for (let e of mmap2.characters) {
          if (e !== this) moveCostGrid.set(e.gpos, moveCostGrid.get(e.gpos) + (e.movementBlockedCount <= this.movementBlockedCount ? 4 + this.movementBlockedCount * 2 : 4));
        }
        const route = costedBFSPath(moveCostGrid, src, dest);
        if (route.length > 0) {
          this.move(facingFromVec(route[0].sub(this.gpos)), mmap2);
          this.history.push([new ActionItem(), {}]);
        }
        this.actionsThisTurn--;
        mmap2.updateCharacterVisibility(true);
      } else if (this.state === "dead") {
        this.actionsThisTurn--;
      }
    }
    this.actionsThisTurn = 2;
  }
  /**@type {eskv.sprites.SpriteWidget['draw']} */
  draw(app, ctx) {
    if (this.activeCharacter || this.visibleToPlayer) {
      super.draw(app, ctx);
    }
  }
}
class PlayerCharacter extends Character {
  constructor(props = {}) {
    super();
    this.spriteSheet = App.resources["sprites"];
    this.frames = [259];
    if (props) this.updateProperties(props);
  }
  /**
   * 
   * @param {MissionMap} map 
   */
  setupForLevelStart(map) {
    this._coverPositions = /* @__PURE__ */ new Set();
    this.animationGroup = characterAnimations[this.id];
    this.animationState = "standing";
    if (this.activeCharacter) {
      this._visibleLayer = map.metaTileMap._layerData[MetaLayers.visible];
      this._visibleLayer.fill(0);
    } else {
      this._visibleLayer = new Grid2D([map.w, map.h]).fill(0);
    }
  }
  /**
   * Line of sight check from one character to another
   * Uses the player's field of view, which respects both 
   * tile sight and cover properties
   * @param {Character} character 
   * @param {MissionMap} map 
   */
  canSee(character, map) {
    const vmap = this._visibleLayer;
    const [x, y] = character.gpos;
    return vmap[x + y * vmap.tileDim[0]] > 0;
  }
  /**
   * 
   * @param {string} key 
   */
  getActionForKey(key) {
    return [...this.actions].find((a) => {
      return a.keyControl === key;
    });
  }
}
class ActionItem extends BoxLayout {
  /** @type {'vertical'|'horizontal'} */
  orientation = "vertical";
  keyControl = "";
  constructor(props = {}) {
    super();
    this.hints = { h: "5" };
    this.sprite = new SpriteWidget({ spriteSheet: App.resources["sprites"] });
    this.label = new Label({ hints: { h: "1" } });
    this.children = [
      this.sprite,
      this.label
    ];
    if (props) this.updateProperties(props);
  }
  /**
   * To perform an action as the player, first it must be requested to provide
   * the UI with information that maybe needed (e.g., what the target of the action
   * will be)
   * @param {Character} actor 
   * @param {MissionMap} map 
   * @param {ActionResponseData} response 
   * @return {ActionResponseData} 
   */
  request(actor, map, response) {
    return { result: "notAvailable" };
  }
  get name() {
    return this.label.text;
  }
  set name(value) {
    this.label.text = value;
  }
}
class Rifle extends ActionItem {
  keyControl = "f";
  constructor() {
    super();
    this.label.text = "Rifle";
    this.sprite.frames = [736];
    this.ammo = 200;
    this.mode = "single";
  }
  /**@type {ActionItem['request']} */
  request(actor, map, response) {
    if (response.targetCharacter instanceof Character && response.targetCharacter !== actor) {
      if (this.fire(actor, map, response.targetCharacter)) {
        return { result: "complete", message: "Target hit" };
      }
      return { result: "complete", message: "Target missed" };
    }
    if (this.ammo > 0) {
      const charsInRange = [];
      for (let c of map.characters) {
        if (c !== actor && actor.canSee(c, map)) charsInRange.push(c);
      }
      if (charsInRange.length > 0) {
        return { message: "Select target", result: "infoNeeded", validTargetCharacters: charsInRange };
      } else {
        return { message: "No visible target", result: "notAvailable" };
      }
    } else {
      return { message: "Out of ammo", result: "notAvailable" };
    }
  }
  /**
   * 
   * @param {Character} actor 
   * @param {MissionMap} map
   * @param {Character} target 
   */
  fire(actor, map, target) {
    this.ammo -= this.mode === "single" ? 1 : 5;
    const char = target;
    const hit = this.mode === "single" ? true : map.rng.random() > 0.5;
    if (hit) {
      char.takeDamage("piercing");
      return true;
    }
    return false;
  }
}
const MetaLayers = {
  layout: 0,
  //Basic type of location
  seen: 1,
  //whether the characters have seen that part of the map
  visible: 2,
  //whether the characters can currently see that part of the map
  traversible: 3,
  //direction of traversibility
  allowsSight: 4,
  //direction of sight
  cover: 6
};
const LayoutTiles = {
  outside: 0,
  floor: 1,
  hallway: 2,
  wall: 4,
  doorway: 5,
  window: 6,
  coveredWindow: 7,
  brokenWindow: 8
};
const DecorationTiles = {
  tree: 163
};
const MansionTileIndexes = {
  0: 103,
  //outside
  1: 74
  //floor
};
const wallSet3 = {
  1: 1056 + 64,
  2: 32 + 64,
  4: 1056 + 64,
  8: 32 + 64,
  5: 1056 + 64,
  10: 32 + 64,
  3: 33 + 64,
  6: 1057 + 64,
  12: 2081 + 64,
  9: 3105 + 64,
  7: 1058 + 64,
  11: 34 + 64,
  13: 3106 + 64,
  14: 2082 + 64,
  15: 35 + 64
};
const MansionAutotiles = {
  wall: new AutoTiler(
    "mansionWalls",
    [LayoutTiles.wall],
    [LayoutTiles.wall, LayoutTiles.doorway, LayoutTiles.window],
    wallSet3
  ),
  doorway: new AutoTiler(
    "mansionDoorway",
    [LayoutTiles.doorway],
    [LayoutTiles.wall, LayoutTiles.doorway, LayoutTiles.window],
    {
      1: 74,
      //3111, 
      2: 74,
      //39,
      4: 74,
      //1063, 
      8: 74,
      //2087, 
      5: 74,
      //3111, 
      10: 74
      //39,
    }
  ),
  window: new AutoTiler(
    "mansionWindow",
    [LayoutTiles.window],
    [LayoutTiles.wall, LayoutTiles.doorway, LayoutTiles.window],
    {
      1: 3111 - 2,
      2: 39 - 2,
      4: 1063 - 2,
      8: 2087 - 2,
      5: 3111 - 2,
      10: 39 - 2
    }
  ),
  coveredWindow: new AutoTiler(
    "mansionCoveredWindow",
    [LayoutTiles.coveredWindow],
    [LayoutTiles.wall, LayoutTiles.doorway, LayoutTiles.window, LayoutTiles.coveredWindow],
    {
      1: 3111 - 2,
      2: 39 - 2,
      4: 1063 - 2,
      8: 2087 - 2,
      5: 3111 - 2,
      10: 39 - 2
    }
  ),
  brokenWindow: new AutoTiler(
    "mansionBrokenWindow",
    [LayoutTiles.brokenWindow],
    [LayoutTiles.wall, LayoutTiles.doorway, LayoutTiles.window, LayoutTiles.coveredWindow, LayoutTiles.brokenWindow],
    {
      1: 3111 - 1,
      2: 39 - 1,
      4: 1063 - 1,
      8: 2087 - 1,
      5: 3111 - 1,
      10: 39 - 1
    }
  )
};
function placeWalledRect(map, rect) {
  const w = rect.w;
  const h = rect.h;
  const p = rect.pos;
  for (let pos of map.data.iterBetween(p, p.add([w, 0]))) map.set(pos, LayoutTiles.wall);
  for (let pos of map.data.iterBetween(p, p.add([0, h]))) map.set(pos, LayoutTiles.wall);
  for (let pos of map.data.iterBetween(p.add([0, h]), p.add([w, h]))) map.set(pos, LayoutTiles.wall);
  for (let pos of map.data.iterBetween(p.add([w, 0]), p.add([w, h]))) map.set(pos, LayoutTiles.wall);
}
function placeValidOpening(map, pos, doors, windows) {
  const p0 = pos.add(FacingVec[0]);
  const p1 = pos.add(FacingVec[1]);
  const p2 = pos.add(FacingVec[2]);
  const p3 = pos.add(FacingVec[3]);
  const mp0 = map.get(p0);
  const mp1 = map.get(p1);
  const mp2 = map.get(p2);
  const mp3 = map.get(p3);
  if (mp0 === LayoutTiles.wall && mp2 === LayoutTiles.wall) {
    if (mp1 !== LayoutTiles.wall && mp3 == LayoutTiles.outside || mp3 !== LayoutTiles.wall && mp1 == LayoutTiles.outside) {
      map.set(pos, LayoutTiles.window);
      windows.push(pos);
      return true;
    } else if (mp1 !== LayoutTiles.wall && mp3 !== LayoutTiles.wall) {
      map.set(pos, LayoutTiles.doorway);
      doors.push([pos, 1]);
      return true;
    }
  }
  if (mp1 === LayoutTiles.wall && mp3 === LayoutTiles.wall) {
    if (mp0 !== LayoutTiles.wall && mp2 == LayoutTiles.outside || mp2 !== LayoutTiles.wall && mp0 == LayoutTiles.outside) {
      map.set(pos, LayoutTiles.window);
      windows.push(pos);
      return true;
    } else if (mp0 !== LayoutTiles.wall && mp2 !== LayoutTiles.wall) {
      map.set(pos, LayoutTiles.doorway);
      doors.push([pos, 0]);
      return true;
    }
  }
  return false;
}
function placeHallway(map, rect) {
  for (let p of map.data.iterRect([rect[0], rect[1], rect[2] + 1, rect[3] + 1])) {
    map.set(p, LayoutTiles.hallway);
  }
}
function placeRoom(map, rect) {
  for (let p of map.data.iterRect([rect[0] + 1, rect[1] + 1, rect[2] - 1, rect[3] - 1])) {
    map.set(p, LayoutTiles.floor);
  }
  placeWalledRect(map, rect);
}
function encloseHallways(map) {
  for (let p of map.data.iterAll()) {
    if (map.data.get(p) === LayoutTiles.hallway) {
      for (let pa of map.data.iterInRange(p, 1.5)) {
        const mpa = map.data.get(pa);
        if (mpa === LayoutTiles.floor || mpa === LayoutTiles.outside) {
          map.data.set(p, LayoutTiles.wall);
          break;
        }
      }
    }
  }
  for (let p of map.data.iterAll()) {
    if (map.data.get(p) === LayoutTiles.hallway) {
      map.data.set(p, LayoutTiles.floor);
    }
  }
}
function placeRoomOpenings(map, rect, doors, windows, rng) {
  if (!map.data.hasTypesBetween([rect[0], rect[1]], [rect[0] + rect[2], rect[1]], [LayoutTiles.doorway, LayoutTiles.floor])) {
    const doorPosX1 = rect[0] + 1 + rng.getRandomInt(rect[2] - 2);
    let x = doorPosX1;
    while (!placeValidOpening(map, new Vec2([x, rect[1]]), doors, windows)) {
      x++;
      if (x >= rect.right) x = rect[0] + 1;
      if (x === doorPosX1) break;
    }
  }
  if (!map.data.hasTypesBetween([rect[0], rect[1] + rect[3]], [rect[0] + rect[2], rect[1] + rect[3]], [LayoutTiles.doorway, LayoutTiles.floor])) {
    const doorPosX2 = rect[0] + 1 + rng.getRandomInt(rect[2] - 2);
    let x = doorPosX2;
    while (!placeValidOpening(map, new Vec2([x, rect[1] + rect[3]]), doors, windows)) {
      x++;
      if (x >= rect.right) x = rect[0] + 1;
      if (x === doorPosX2) break;
    }
  }
  if (!map.data.hasTypesBetween([rect[0], rect[1]], [rect[0], rect[1] + rect[3]], [LayoutTiles.doorway, LayoutTiles.floor])) {
    const doorPosY1 = rect[1] + 1 + rng.getRandomInt(rect[3] - 2);
    let y = doorPosY1;
    while (!placeValidOpening(map, new Vec2([rect[0], y]), doors, windows)) {
      y++;
      if (y >= rect.bottom) y = rect[1] + 1;
      if (y === doorPosY1) break;
    }
  }
  if (!map.data.hasTypesBetween([rect[0] + rect[2], rect[1]], [rect[0] + rect[2], rect[1] + rect[3]], [LayoutTiles.doorway, LayoutTiles.floor])) {
    let doorPosY2 = rect[1] + 1 + rng.getRandomInt(rect[3] - 2);
    let y = doorPosY2;
    while (!placeValidOpening(map, new Vec2([rect[0] + rect[2], doorPosY2]), doors, windows)) {
      y++;
      if (y >= rect.bottom) y = rect[1] + 1;
      if (y === doorPosY2) break;
    }
  }
}
function isBoundaryRoom(rect, extent) {
  return rect.x <= extent.x || rect.y <= extent.y || rect.right >= extent.right || rect.bottom >= extent.bottom;
}
function isAdjacent(room1, room2) {
  const touchHorizontal = room1.x < room2.right && room1.right > room2.x;
  const touchVertical = room1.y < room2.bottom && room1.bottom > room2.y;
  const adjacent = touchHorizontal && (room1.y === room2.bottom || room1.bottom === room2.y) || touchVertical && (room1.x === room2.right || room1.right === room2.x);
  return adjacent;
}
function isAdjacentBoundary(rect, boundaryRooms) {
  for (let bRect of boundaryRooms) {
    if (isAdjacent(rect, bRect)) return true;
  }
}
function bspMansion(rect, minSize, hallSize, rooms, rng, extent, bias = 0.5, hvBias = 0, hhBias = 0) {
  if (rect.w < minSize * 2 && rect.h < minSize * 2) {
    rooms.push(rect);
    return true;
  }
  const dir = rect.w < minSize + hallSize ? 0 : rect.h < minSize + hallSize ? 1 : rect.w > rect.h ? 1 : rect.h < rect.w ? 0 : rng.random() > bias ? 1 : 0;
  const atEdge = rect.x <= 0 || rect.y <= 0 || rect.right >= extent.w || rect.bottom >= extent.h;
  if (dir === 0) {
    if (!atEdge && rect.h >= 2 * minSize + hallSize && rect.w > minSize && rng.random() > hhBias) {
      const b2 = Math.floor((rect.h - 2 * minSize - hallSize) / 4);
      const split2 = Math.floor(rng.random() * (rect.h - 2 * minSize - hallSize - 2 * b2)) + minSize + b2;
      if (bspMansion(new Rect([rect.x, rect.y + split2, rect.w, hallSize]), minSize, hallSize, rooms, rng, extent, 0, hvBias, hhBias)) {
        bspMansion(new Rect([rect.x, rect.y, rect.w, split2]), minSize, hallSize, rooms, rng, extent, 0, hvBias, hhBias);
        bspMansion(new Rect([rect.x, rect.y + split2 + hallSize, rect.w, rect.h - split2 - hallSize]), minSize, hallSize, rooms, rng, extent, 0, hvBias, hhBias);
        return true;
      }
    }
    const b = Math.floor((rect.h - 2 * minSize) / 4);
    const split = Math.floor(rng.random() * (rect.h - 2 * minSize - 2 * b)) + minSize + b;
    bspMansion(new Rect([rect.x, rect.y, rect.w, split]), minSize, hallSize, rooms, rng, extent, 0, hvBias, hhBias);
    bspMansion(new Rect([rect.x, rect.y + split, rect.w, rect.h - split]), minSize, hallSize, rooms, rng, extent, 0, hvBias, hhBias);
  } else {
    if (!atEdge && rect.w >= 2 * minSize + hallSize && rect.h > minSize && rng.random() > hvBias) {
      const b2 = Math.floor((rect.w - 2 * minSize - hallSize) / 4);
      const split2 = Math.floor(rng.random() * (rect.w - 2 * minSize - hallSize - 2 * b2)) + minSize + b2;
      if (bspMansion(new Rect([rect.x + split2, rect.y, hallSize, rect.h]), minSize, hallSize, rooms, rng, extent, 1, hvBias, hhBias)) {
        bspMansion(new Rect([rect.x, rect.y, split2, rect.h]), minSize, hallSize, rooms, rng, extent, 1, hvBias, hhBias);
        bspMansion(new Rect([rect.x + split2 + hallSize, rect.y, rect.w - split2 - hallSize, rect.h]), minSize, hallSize, rooms, rng, extent, 1, hvBias, hhBias);
        return true;
      }
    }
    const b = Math.floor((rect.w - 2 * minSize) / 4);
    const split = Math.floor(rng.random() * (rect.w - 2 * minSize - 2 * b)) + minSize + b;
    bspMansion(new Rect([rect.x, rect.y, split, rect.h]), minSize, hallSize, rooms, rng, extent, 1, hvBias, hhBias);
    bspMansion(new Rect([rect.x + split, rect.y, rect.w - split, rect.h]), minSize, hallSize, rooms, rng, extent, 1, hvBias, hhBias);
  }
  return true;
}
function generateMansionMap(map, rng) {
  map.w = 80;
  map.h = 40;
  const [w, h] = [map.w, map.h];
  const tdim = new Vec2([map.w, map.h]);
  const tmap = map.tileMap;
  tmap.useCache = true;
  tmap.numLayers = 3;
  tmap.tileDim = tdim;
  tmap.activeLayer = 0;
  const mmap2 = map.metaTileMap;
  mmap2.defaultValue = 0;
  mmap2.numLayers = 8;
  mmap2.tileDim = tdim;
  mmap2.activeLayer = 0;
  for (const p of mmap2.data.iterAll()) {
    mmap2.set(p, LayoutTiles.outside);
  }
  const allRooms = [];
  const mapRect = new Rect([0, 0, w, h]);
  bspMansion(mapRect, 5, 3, allRooms, rng, mapRect);
  const boundaryRooms = allRooms.filter((r) => isBoundaryRoom(r, mapRect));
  const rooms = allRooms.filter((r) => !boundaryRooms.includes(r));
  const exteriorRooms = rooms.filter((r) => isAdjacentBoundary(r, boundaryRooms));
  let interiorRooms = rooms.filter((r) => !exteriorRooms.includes(r) && r.w > 3 && r.h > 3);
  interiorRooms.sort((a, b) => (b.w <= 3 || b.h <= 3 ? -100 : b.w * b.h) - (a.w <= 3 || a.h <= 3 ? -100 : a.w * a.h));
  const courtyards = [];
  while (interiorRooms.length > 0.04 * rooms.length) {
    rooms.splice(rooms.indexOf(interiorRooms[0]), 1);
    courtyards.push(interiorRooms.shift());
    interiorRooms = rooms.filter((r) => !isAdjacentBoundary(r, [...boundaryRooms, ...courtyards]) && r.w > 3 && r.h > 3);
    interiorRooms.sort((a, b) => (b.w <= 3 || b.h <= 3 ? -100 : b.w * b.h) - (a.w <= 3 || a.h <= 3 ? -100 : a.w * a.h));
  }
  for (let room of rooms) if (room.w <= 3 || room.h <= 3) placeHallway(mmap2, room);
  for (let room of rooms) if (room.w > 3 && room.h > 3) placeRoom(mmap2, room);
  encloseHallways(mmap2);
  const doorways = (
    /**@type {[Vec2, number][]}*/
    []
  );
  const windows = (
    /**@type {Vec2[]}*/
    []
  );
  for (let room of rooms) placeRoomOpenings(mmap2, room, doorways, windows, rng);
  for (let [doorPos, doorFacing] of doorways) {
    const door = new DoorWidget();
    door.pos = doorPos;
    door.w = 1;
    door.h = 1;
    door.facing = doorFacing;
    door.state = "closed";
    map.entities.addChild(door);
  }
  const trees = [];
  for (let pos of mmap2.data.iterAll()) {
    const index = mmap2.get(pos);
    if (index === LayoutTiles.outside) {
      if (rng.random() > 0.95) {
        trees.push(pos);
      }
    }
    if (index in MansionTileIndexes) {
      tmap.set(pos, MansionTileIndexes[index]);
    } else {
      const vpos = new Vec2(pos);
      MansionAutotiles.wall.autoTile(vpos, mmap2, tmap);
      MansionAutotiles.doorway.autoTile(vpos, mmap2, tmap);
      MansionAutotiles.window.autoTile(vpos, mmap2, tmap);
      MansionAutotiles.brokenWindow.autoTile(vpos, mmap2, tmap);
    }
    let traversible = index === LayoutTiles.wall || index === LayoutTiles.window ? 0 : 15;
    for (let e of map.entities.children) {
      if (e instanceof Entity && e.pos.equals(pos)) traversible &= e.traversible;
    }
    mmap2.setInLayer(MetaLayers.traversible, pos, traversible);
  }
  tmap.activeLayer = 1;
  const sightData = mmap2._layerData[MetaLayers.allowsSight];
  mmap2.activeLayer = MetaLayers.layout;
  for (let p of mmap2.data.iterAll()) {
    mmap2.setInLayer(MetaLayers.seen, p, mmap2.data.numInRange(p, [LayoutTiles.outside], 1.5) > 0 ? 1 : 0);
    const layout = mmap2.getFromLayer(MetaLayers.layout, p);
    const ind = p[0] + p[1] * w;
    sightData[ind] |= layout === LayoutTiles.wall ? 0 : 15;
    for (let e of map.entities.children) {
      if (e instanceof Entity && e.pos.equals(p)) sightData[ind] &= e.allowsSight;
    }
  }
  for (let p of trees) {
    tmap.set(p, DecorationTiles.tree);
    const ind = p[0] + p[1] * w;
    sightData[ind] |= 240;
  }
  tmap._vLayer = mmap2._layerData[MetaLayers.seen];
  tmap._aLayer = mmap2._layerData[MetaLayers.visible];
  tmap.clearCache();
}
class PositionSelector extends Widget {
  /**@type {Vec2[]} */
  _validCells = [];
  /**@type {Character[]} */
  _validCharacters = [];
  /**@type {number} */
  activeCell = -1;
  constructor(props = {}) {
    super();
    if (props) this.updateProperties(props);
  }
  set validCharacters(value) {
    this._validCharacters = value;
    this._validCells = this.validCharacters.map((v) => v.gpos);
    this.setupValidCells();
  }
  get validCharacters() {
    return this._validCharacters;
  }
  set validCells(value) {
    this._validCharacters = [];
    this._validCells = value;
    this.setupValidCells();
  }
  get validCells() {
    return this._validCells;
  }
  setupValidCells() {
    const children = [];
    let i = 0;
    for (let pos of this._validCells) {
      children.push(new SpriteWidget({
        spriteSheet: App.resources["sprites"],
        x: pos[0],
        y: pos[1],
        w: 1,
        h: 1,
        frames: [this.activeCell === i ? 6 : 5]
      }));
      i++;
    }
    this.children = children;
    this.activeCell = this._validCells.length > 0 ? 0 : -1;
  }
  on_activeCell(e, o, v) {
    let i = 0;
    for (let w of this.children) {
      if (w instanceof SpriteWidget) w.frames = [this.activeCell === i ? 6 : 5];
      i++;
    }
  }
  /**
   * 
   * @param {Vec2} direction 
   */
  moveActiveCell(direction) {
    const activePos = this.validCells[this.activeCell];
    let maxDist = 0;
    let minDist = Infinity;
    let minDistInd = -1;
    let maxDistInd = this.activeCell;
    let i = 0;
    for (let pos of this.validCells) {
      const delta = pos.sub(activePos);
      const dist2 = delta.mul(direction).sum() + vec2(1, 1).sub(direction.abs()).mul(delta).sum();
      if (dist2 > 0 && dist2 < minDist) {
        minDist = dist2;
        minDistInd = i;
      }
      if (dist2 < 0 && dist2 < maxDist) {
        maxDist = dist2;
        maxDistInd = i;
      }
      i++;
    }
    this.activeCell = minDistInd >= 0 ? minDistInd : maxDistInd;
  }
}
class MissionMap extends Widget {
  rng = new PRNG_sfc32();
  //.setPRNG('sfc32');
  clipRegion = new Rect();
  tileMap = new LayeredTileMap();
  metaTileMap = new LayeredTileMap();
  /**@type {Character[]} */
  enemies = [
    new Character({ id: "alfred" }),
    new Character({ id: "bennie" }),
    new Character({ id: "charlie" }),
    new Character({ id: "devon" })
  ];
  entities = new Widget({ hints: { h: 1, w: 1 } });
  /**@type {Character[]} */
  playerCharacters = [
    new PlayerCharacter({ id: "randy", x: 0, y: 0, activeCharacter: true }),
    new PlayerCharacter({ id: "maria", activeCharacter: false })
  ];
  characters = [...this.enemies, ...this.playerCharacters];
  /**@type {Character|null} */
  activeCharacter = this.playerCharacters[0];
  /**@type {SpriteSheet|null} */
  spriteSheet = null;
  constructor(props = null) {
    super();
    this.positionSelector = new PositionSelector();
    this.children = [this.tileMap, this.entities, this.positionSelector, ...this.enemies, ...this.playerCharacters];
    if (props) this.updateProperties(props);
  }
  setupLevel() {
    generateMansionMap(this, this.rng);
    this.playerCharacters[0].setupForLevelStart(this, this.rng);
    this.enemies.forEach((e) => e.setupForLevelStart(this, this.rng));
    this.playerCharacters[0].actionInventory = App.get().findById("firstPlayerInventory");
    this.playerCharacters[0].addAction(new Rifle());
  }
  on_spriteSheet() {
    this.tileMap.spriteSheet = this.spriteSheet;
  }
  on_parent(e, o, v) {
    const scroller = this.parent;
    if (!(scroller instanceof ScrollView)) return;
    scroller.bind("scrollX", (e2, o2, v3) => this.updateClipRegion(o2));
    scroller.bind("scrollY", (e2, o2, v3) => this.updateClipRegion(o2));
    scroller.bind("zoom", (e2, o2, v3) => this.updateClipRegion(o2));
    this.updateClipRegion(scroller);
  }
  /**
   * 
   * @param {Vec2} pos 
   */
  updateTileInfo(pos) {
    const layout = this.metaTileMap.layer[MetaLayers.layout].get(pos);
    const mmap2 = this.metaTileMap;
    mmap2.activeLayer = MetaLayers.layout;
    const tmap = this.tileMap;
    tmap.activeLayer = 0;
    if (layout in MansionTileIndexes) {
      tmap.set(pos, MansionTileIndexes[layout]);
      tmap.clearCache();
    } else {
      MansionAutotiles.wall.autoTile(pos, mmap2, tmap);
      MansionAutotiles.doorway.autoTile(pos, mmap2, tmap);
      MansionAutotiles.window.autoTile(pos, mmap2, tmap);
      MansionAutotiles.brokenWindow.autoTile(pos, mmap2, tmap);
    }
    let traversible = layout === LayoutTiles.wall || layout === LayoutTiles.window ? 0 : 15;
    for (let e of this.entities.children) {
      if (e instanceof Entity && e.pos.equals(pos)) traversible &= e.traversible;
    }
    this.metaTileMap.setInLayer(MetaLayers.traversible, pos, traversible);
    let sight = layout === LayoutTiles.wall ? 0 : 15;
    for (let e of this.entities.children) {
      if (e instanceof Entity && e.pos.equals(pos)) sight &= e.allowsSight;
    }
    this.metaTileMap.setInLayer(MetaLayers.allowsSight, pos, sight);
  }
  updateClipRegion(scroller) {
    this.tileMap.clipRegion = new Rect([
      Math.floor(scroller._scrollX),
      Math.floor(scroller._scrollY),
      Math.ceil(scroller.w / scroller.zoom),
      Math.ceil(scroller.h / scroller.zoom)
    ]);
  }
  /**
   * 
   * @param {boolean} refresh 
   */
  updateCharacterVisibility(refresh = false) {
    this.activeCharacter;
    for (let e of this.enemies) {
      if (refresh) e.visibleToPlayer = false;
      e.visibleToPlayer = e.visibleToPlayer || this.activeCharacter?._visibleLayer.get(e.gpos) === 1;
    }
  }
  /**
   * 
   * @param {string} message 
   * @param {'enemy'|'position'|'posAdjacent'} targetType 
   * @param {(map:MissionMap, target:Vec2)=>void} callback 
   */
  targetSelector(message, targetType, callback) {
  }
  /**
   * 
   * @param {string} message 
   * @param {'success'|'failure'|'info'} messageType 
   */
  prompt(message, messageType) {
  }
  /**
   * 
   * @param {Vec2} position 
   */
  getCharacterAt(position) {
    for (let c of this.characters) {
      if (c.gpos.equals(position)) return c;
    }
    return null;
  }
}
const spriteUrl = "" + new URL("spritesheet-BdhrULeS.png", import.meta.url).href;
const markup = `

Game:
    prefDimW: 20
    prefDimH: 21
    integerTileSize: true
    tileSize: 16
    Notebook:
        hints: {w:1, h:1}
        id: 'notebook'
        BoxLayout:
            id: 'game'
            orientation: 'vertical'
            hints: {center_x:0.5, center_y:0.5, w:1, h:1}
            BoxLayout:
                hints: {h:'1'}
                orientation: 'horizontal'
                FPS:
                    align:'left'
                Label:
                    id: 'messageLabel'
                    text: 'Welcome to the mansion'
                    align: 'left'
                Button: 
                    text: 'Help'
                    hints: {w: '3'}
                    on_press:
                        const help = window.app.findById('help');
                        help.helpVal = 0;
                        const nb = window.app.findById('notebook');
                        nb.activePage = 1;
                Button: 
                    text:  \`\${scroller.zoom*100}%\`
                    hints: {w: '3'}
                    id: 'zoomButton'
                    on_press:
                        const scroller = window.app.findById('scroller');
                        if(!scroller) return;
                        const zoom = Math.floor(scroller.zoom + 1);
                        scroller.zoom = zoom<4? zoom:0.5;
            BoxLayout:
                bgColor: 'rgb(35,35,45)'
                orientation: 'horizontal'
                BoxLayout:
                    orientation: 'vertical'
                    hints: {w:'4'}
                    id: 'firstPlayer'
                    Label:
                        text:\`Randy \${randy.gpos}\`
                        hints: {h:'1'}
                        sizeGroup: 'actionItems'
                        align: 'left'
                    SpriteWidget:
                        spriteSheet: resources['sprites']
                        frames: [354]
                        hints: {w:'3', h:'3'}
                    BoxLayout:
                        hints: {h:null}
                        id: 'firstPlayerInventory'
                    Widget:
                        id: 'padding2'
                BoxLayout:
                    hints: {w:'4', h:null}
                    padding: '2'
                    orientation: 'vertical'
                    id: 'secondPlayer'
                    Widget:
                        id: 'padding2'
                    BoxLayout:
                        hints: {h:null}
                        id: 'secondPlayerInventory'
                    Label:
                        text:\`Maria \${Maria.status}\`
                        wrap: true;
                        hints: {h:'1'}
                        sizeGroup: 'actionItems'
                        align: 'right'
                    SpriteWidget:
                        spriteSheet: resources['sprites']
                        frames: [450]
                        hints: {w:'3', h:'3'}
                ScrollView:
                    id: 'scroller'
                    uiZoom: false
                    hints: {h:'20'}
                    MissionMap:
                        id: 'MissionMap'
                        hints: {w:null, h:null}
                        spriteSheet: resources['sprites']
        BoxLayout:
            hints: {h:1, w:1}
            h:20
            w:20
            orientation:'vertical'
            bgColor: 'rgb(25,25,35)'
            id: 'help'
            paddingX: '1'
            paddingY: '1'
            helpVal: 0
            on_helpVal:
                this.parent._needsLayout=true;
                const helpHeader = window.app.findById('helpHeader');
                helpHeader.text = [
                    'Controls',
                    'Instructions',
                    'Backstory',
                    'Agent Randy',
                    'Agent Maria',
                    'Director Stevens',
                    'Conrad Couli',
                    'Flint Ironsights',
                    'Mitch Crawford',
                    'Roland Kennedy',
                    'Irvina Schlitz',                            
                ][this.helpVal];
                const helpText = window.app.findById('helpText');
                helpText.text = [
                    'Use W/A/S/D to move, space to pause, 1-4 to use items.',
                    'Navigate the level to complete the mission objectives.',
                    'Intro: In the 22nd century, mankind has moved to the stars and conquered space. However, the realm of time is still one that has eluded them. Until now. Deep in the Unified Space Government’s most classified labs, the beginnings of time looping technology are being created.'+ 
                    '\\n\\nHowever, such a powerful technology always attracts those who want to use it for evil. Thanks to an inside mole, a group of reckless idealists have managed to get their hands on this technology. This group wants to wield the tech on a global sale by selling it to the highest bidder in violation of arms control laws. They hope that this will be the final step needed to bring about the “final revolution” that will ultimately achieve a stable universal government and a world where history can finally, truly be rewritten.'+
                    '\\n\\nGiven the severity of the situation, the Unified Space Government has given two of their top agents a secret, limited, and local version of the time loop tech to provide an edge on missions so that they can stop the syndicate before it’s too late.',
                    'Player Character 1. A tanky close-combat specialist. He began his work as a soldier fighting on the frontlines of various conflicts. His combat skills, even during severe ammo shortages, were noticed by those around him and he rose through the ranks. His special training included close-quarters combat training and cybernetic augments that make him more resilient to damage.',
                    'Player Character 2. A stealthy ranged specialist. A former agent in the United Space Government’s Intelligence division, she specialized in monitoring and, on occasion, eliminating targets with a minimum of fuss. She trained in the use of firearms and being able to move quickly yet silently.',
                    'The no-nonsense director of the player characters’ unit, who provides important details before each mission.',
                    'The head of one of the galaxy’s leading space travel companies, along with several companies that have gone bankrupt thanks to his leadership. His wealthy eccentricity, combined with an unhealthy interest in government-based conspiracy theories, has led him to offer financial assistance to the criminal conspiracy.',
                    'One of the galaxy’s most notorious dealers in military-grade and black market weapons. Often sells weapons to both sides in wars and may have helped stared a few.',
                    'A defector from the galaxy’s main government. Formerly a high-ranking agent, they’re believed to be the main suspect in leaking the time loop technology.',
                    'A moderate-ranking politician on a highly urbanized planet. He reached his current position by appealing to jingoists and is rumored to be linked to a few notorious hate groups. ',
                    'A scientist with an incredible curiosity… and a severe lack of empathy and restraint. They have avoided the authorities as they performed immoral experiments in highly regulated fields. Getting to field test a technology as powerful as time looping would be the height of her career.',
                ][this.helpVal];
                const helpSprite = window.app.findById('helpSprite');
                helpSprite.frames = [
                    [0], [0], [0], [355], [451], [0], [832], [833],[0],[834],[835]
                ][this.helpVal];
            Label:
                id: 'helpHeader'
                hints: {h:'2'}
            SpriteWidget:
                id: 'helpSprite'
                spriteSheet: resources['sprites']
                hints: {w:'3', h:'3'}
            Label:
                id: 'helpText'
                fontSize: '0.5'
                wrap: true
                vAlign: 'top'
                hints: {h:null}
            BoxLayout:
                hints: {h:'1', w:'8'}
                orientation: 'horizontal'
                Button:
                    text: 'Next'
                    bgColor: 'rgb(15,15,25)'
                    on_press:
                        const help = window.app.findById('help');
                        help.helpVal = (help.helpVal+1)%9;
                Button:
                    text: 'Exit'
                    bgColor: 'rgb(15,15,25)'
                    on_press:
                        const nb = window.app.findById('notebook');
                        nb.activePage = 0;
                
`;
class FPS extends Label {
  _counter = 0;
  _frames = 0;
  _worst = 300;
  _tref = Date.now();
  _badFrameCount = 0;
  /**@type {eskv.Label['update']} */
  update(app, millis) {
    super.update(app, millis);
    const tref = Date.now();
    this._counter += tref - this._tref;
    this._frames += 1;
    const currentFPS = 1e3 / (tref - this._tref);
    console.log("FPS update", tref, tref - this._tref, currentFPS);
    this._tref = tref;
    this._badFrameCount += currentFPS < 50 ? 1 : 0;
    if (currentFPS < this._worst) this._worst = currentFPS;
    if (this._counter >= 1e3) {
      this.text = `FPS: ${Math.round(this._frames / this._counter * 1e3)} (worst: ${Math.round(this._worst)}, # >20ms: ${Math.round(this._badFrameCount)})`;
      this._counter = 0;
      this._frames = 0;
      this._worst = 300;
      this._badFrameCount = 0;
    }
  }
}
class Game extends App {
  /**@type {ActionItem|null} */
  activePlayerAction = null;
  /**@type {import("./action.js").ActionResponseData|null} */
  activePlayerActionData = null;
  constructor(props = {}) {
    super();
    Game.resources["sprites"] = new SpriteSheet(spriteUrl, 16);
    this.continuousFrameUpdates = true;
    window.focus();
    this.canvas?.focus();
    if (props) this.updateProperties(props);
  }
  static get() {
    return (
      /**@type {Game}*/
      App.get()
    );
  }
  on_key_down(e, o, v) {
    const ip = this.inputHandler;
    if (ip === void 0) return;
    const mmap2 = (
      /**@type {MissionMap}*/
      this.findById("MissionMap")
    );
    const char = (
      /**@type {PlayerCharacter}*/
      this.findById("randy")
    );
    const messageLabel = (
      /**@type {eskv.Label}*/
      this.findById("messageLabel")
    );
    if (!this.activePlayerAction) {
      const action = char.getActionForKey(v.event.key);
      if (action) {
        const response = char.takeAction(action, mmap2);
        if (response.result === "complete" || response.result === "notAvailable" || response.result === "invalid") {
          this.activePlayerAction = null;
          this.activePlayerActionData = null;
          messageLabel.text = response.message ?? "unknown action response";
        } else if (response.result === "infoNeeded") {
          this.activePlayerAction = action;
          this.activePlayerActionData = response;
          const ps = mmap2.positionSelector;
          messageLabel.text = response.message ?? "unknown action response";
          if (response.validTargetCharacters) ps.validCharacters = response.validTargetCharacters;
          if (response.validTargetPositions) ps.validCells = response.validTargetPositions;
        }
      } else if (ip.isKeyDown("w")) {
        char.move(Facing.north, mmap2);
      } else if (ip.isKeyDown("a")) {
        char.move(Facing.west, mmap2);
      } else if (ip.isKeyDown("s")) {
        char.move(Facing.south, mmap2);
      } else if (ip.isKeyDown("d")) {
        char.move(Facing.east, mmap2);
      } else if (ip.isKeyDown(" ")) {
        char.rest(mmap2);
      } else if (ip.isKeyDown("v")) {
        const scroller = Game.get().findById("scroller");
        if (scroller instanceof ScrollView && scroller.zoom) scroller.zoom = 0.5;
        for (let p of mmap2.metaTileMap.layer[MetaLayers.seen].iterAll()) {
          mmap2.metaTileMap.setInLayer(MetaLayers.seen, p, 1);
          mmap2.tileMap.clearCache();
        }
      } else {
        return;
      }
    } else {
      const action = this.activePlayerAction;
      const actionData = this.activePlayerActionData;
      const ps = mmap2.positionSelector;
      if (actionData?.validTargetCharacters) {
        if (ip.isKeyDown("w")) {
          ps.moveActiveCell(FacingVec[Facing.north]);
        } else if (ip.isKeyDown("a")) {
          ps.moveActiveCell(FacingVec[Facing.west]);
        } else if (ip.isKeyDown("s")) {
          ps.moveActiveCell(FacingVec[Facing.south]);
        } else if (ip.isKeyDown("d")) {
          ps.moveActiveCell(FacingVec[Facing.east]);
        } else if (ip.isKeyDown("e")) {
          actionData.targetCharacter = ps.validCharacters[ps.activeCell];
          const response = char.takeAction(action, mmap2, actionData);
          if (response.result === "complete") {
            ps.validCells = [];
            messageLabel.text = response.message ?? "unknown action response";
            this.activePlayerAction = null;
            this.activePlayerActionData = null;
          }
        } else if (ip.isKeyDown("Escape")) {
          ps.validCells = [];
          messageLabel.text = "canceled";
          this.activePlayerAction = null;
          this.activePlayerActionData = null;
        }
      }
    }
    mmap2.updateCharacterVisibility();
    if (char.actionsThisTurn === 0) {
      for (let e2 of mmap2.enemies) {
        e2.takeTurn(mmap2);
      }
      char.actionsThisTurn = 2;
      mmap2.updateCharacterVisibility(true);
    }
  }
}
Game.registerClass("Action", ActionItem, "Label");
Game.registerClass("FPS", FPS, "Label");
Game.registerClass("Game", Game, "App");
Game.registerClass("MissionMap", MissionMap, "Widget");
parse(markup);
const game = Game.get();
const mmap = (
  /**@type {MissionMap}*/
  game.findById("MissionMap")
);
mmap.setupLevel();
game.start();
