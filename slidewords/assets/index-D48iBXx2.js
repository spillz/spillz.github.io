var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
  constructor() {
    __publicField(this, "_seed", 0);
  }
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
  constructor() {
    super(...arguments);
    __publicField(this, "_seed", 1);
    __publicField(this, "d", 3735928559);
    __publicField(this, "xorSeed", Math.floor(Date.now()) ^ this.d);
    __publicField(this, "random", sfc32(2654435769, 608135816, 3084996962, this.xorSeed));
  }
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
function shuffle(arr) {
  return defaultPRNG.shuffle(arr);
}
function setSeed(seed) {
  return defaultPRNG.seed(seed);
}
function getSeed() {
  return defaultPRNG._seed;
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
  var _a;
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
    ctx.fillText(tdat[0], tdat[1], tdat[2] + ((_a = textData.off) != null ? _a : 0));
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
  constructor(props = {}) {
    /**@type {number} */
    __publicField(this, "identifier", -1);
    /**@type {Vec2|[number,number]} */
    __publicField(this, "pos", [0, 0]);
    /**@type {string} */
    __publicField(this, "state", "touch_up");
    // one of 'touch_up', 'touch_down', 'touch_move', 'touch_cancel'
    /**@type {'touch'|'mouse'|'keyboard'} */
    __publicField(this, "device", "touch");
    //source of touch: touch, mouse or keyboard
    /**@type {globalThis.Touch|MouseEvent|WheelEvent} */
    __publicField(this, "nativeObject", null);
    /**@type {MouseEvent|TouchEvent} */
    __publicField(this, "nativeEvent", null);
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
  /**
   * 
   * @param {App} app 
   */
  constructor(app) {
    /**@type {Widget|null} */
    __publicField(this, "grabbed", null);
    __publicField(this, "mouseTouchEmulation", true);
    __publicField(this, "mouseev", null);
    __publicField(this, "keyStates", {});
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
    var _a;
    return (_a = this.rules.get(widgetClass)) != null ? _a : {};
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
  constructor() {
    /**@type {Array<[AnimationProperties, number]>} The sequentially applied stack of animation effects (each effect can comprise multiple animations)*/
    __publicField(this, "stack", []);
    /**@type {Widget|null} */
    __publicField(this, "widget", null);
    /**@type {AnimationProperties} */
    __publicField(this, "props", {});
    /**@type {number} */
    __publicField(this, "elapsed", 0);
  }
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
  /**
   * Widget provides the base interface for all interactable objects in ESKV
   * Widget constructor can be passed properties to instantiate it
   * @param {WidgetProperties|null} properties Object containing property values to set
   * @returns 
   */
  constructor(properties = null) {
    super();
    /**@type {string|null} Background color of the widget, transparent (i.e., no fill) if null*/
    __publicField(this, "bgColor", null);
    /**@type {string|null} Color of outline drawn around the widget, no outline if null*/
    __publicField(this, "outlineColor", null);
    /**@type {WidgetAnimation|null} The animation currently being applied to this widget (null if none being applied)*/
    __publicField(this, "_animation", null);
    /**@type {boolean} Flag to indicate whether the layout for this widget and its children needs to be udpated*/
    __publicField(this, "_layoutNotify", false);
    //By default, we don't notify about layout events because that's a lot of function calls across a big widget collection
    /**@type {WidgetSizeHints} Sizing hints for the widget*/
    __publicField(this, "hints", {});
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
    var _a;
    let properties = this._deferredProps;
    this._deferredProps = null;
    for (let p in properties) {
      if (!p.startsWith("on_") && !p.startsWith("_") && typeof properties[p] == "function") {
        let func = properties[p];
        let args, rval;
        [args, rval] = ((_a = func["text"]) != null ? _a : func.toString()).split("=>");
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
    parentWidth = parentWidth != null ? parentWidth : this.w;
    parentHeight = parentHeight != null ? parentHeight : this.h;
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
    parentWidth = parentWidth != null ? parentWidth : this.w;
    parentHeight = parentHeight != null ? parentHeight : this.h;
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
    w = w != null ? w : this.w;
    h = h != null ? h : this.h;
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
const _App = class _App extends Widget {
  /**
   * 
   * @param {string} name 
   * @param {Function} cls 
   * @param {string} baseClsName
   */
  static registerClass(name, cls, baseClsName) {
    _App.classes[name] = [cls, baseClsName];
  }
  /**
   * 
   * @param {Object|null} props 
   * @returns 
   */
  constructor(props = null) {
    if (_App.appInstance != null) return _App.appInstance;
    super();
    _App.appInstance = this;
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
    if (!_App.appInstance) _App.appInstance = new _App();
    return _App.appInstance;
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
    this.update();
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
    for (let res of _App.resources.values()) res.update(this, millis);
    this._baseWidget.update(this, millis);
    for (let mw of this._modalWidgets) mw.update(this, millis);
    if (this.ctx) this._draw(this, this.ctx, millis);
    if (this.continuousFrameUpdates) this.requestFrameUpdate();
    this.timer_tick = n_timer_tick;
    if (this._requestedFrameUpdate) window.requestAnimationFrame(() => this.update());
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
};
/**
 * Object representing the singleton App instance
 * @type {App|null}
 */
__publicField(_App, "appInstance", null);
/** @type {Rules} */
__publicField(_App, "rules", new Rules());
/** @type {Map<string, Resource>} */
__publicField(_App, "resources", /* @__PURE__ */ new Map());
/** @type {WidgetClassInfo} */
__publicField(_App, "classes", {});
let App = _App;
class Label extends Widget {
  /**
   * Constructs a label with optional specified properties. 
   * @param {LabelProperties|null} properties 
   * */
  constructor(properties = null) {
    super();
    /**@type {number|string|null} size of the font in tile units */
    __publicField(this, "fontSize", null);
    /**
     * @type {string} If label is part of a size group, the fontSize (not the rect) 
     * will be set to the smallest that will fit text to the rect for all Labels
     * in the group. */
    __publicField(this, "sizeGroup", "");
    /**@type {boolean} If clip is true, the text will be clipped to the bounding rect */
    __publicField(this, "clip", false);
    /**
     * @type {boolean} If ignoreSizeForGroup is true and this Label is part of a group,
     * this Label's fontSize will not be used to set the fontSize for the group (useful
     * in combination with clip to handle text that can be very long). */
    __publicField(this, "ignoreSizeForGroup", false);
    /**@type {string} name of the font */
    __publicField(this, "fontName", '"Nimbus Mono PS", "Courier New", monospace');
    /**@type {string} text displayed in the label*/
    __publicField(this, "text", "");
    /**@type {boolean} true to wrap long lines of text */
    __publicField(this, "wrap", false);
    /**@type {boolean} wraps at words if true, at character if false */
    __publicField(this, "wrapAtWord", true);
    /** @type {'left'|'center'|'right'} horizontal alignment, one of 'left','right','center'*/
    __publicField(this, "align", "center");
    /** @type {'top'|'middle'|'bottom'} vertical alignment, one of 'top','middle','bottom'*/
    __publicField(this, "valign", "middle");
    /** @type {string} text color, any valid HTML5 color string*/
    __publicField(this, "color", "white");
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
  /**
   * Constructs a button with specified properties in `properties`
   * @param {ButtonProperties|null} properties 
   */
  constructor(properties = null) {
    super();
    /**@type {string} Color of button (derives from widget)*/
    __publicField(this, "bgColor", colorString([0.5, 0.5, 0.5]));
    /**@type {string} Color of button when pressed down*/
    __publicField(this, "selectColor", colorString([0.7, 0.7, 0.8]));
    /**@type {string} Background color of button when disabled*/
    __publicField(this, "disableColor1", colorString([0.2, 0.2, 0.2]));
    /**@type {string} Text color of button when disabled*/
    __publicField(this, "disableColor2", colorString([0.4, 0.4, 0.4]));
    /**@type {boolean} */
    __publicField(this, "disable", false);
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
  /**
   * Constructs a button with specified properties in `properties`
   * @param {BasicButtonProperties|null} properties 
   */
  constructor(properties = null) {
    super();
    /**@type {string} Color of button (derives from widget)*/
    __publicField(this, "color", colorString([0.8, 0.8, 0.8]));
    /**@type {string} Color of button (derives from widget)*/
    __publicField(this, "bgColor", colorString([0.5, 0.5, 0.5]));
    /**@type {string} Color of button when pressed down*/
    __publicField(this, "selectColor", colorString([0.7, 0.7, 0.8]));
    /**@type {string} Background color of button when disabled*/
    __publicField(this, "disableColor1", colorString([0.2, 0.2, 0.2]));
    /**@type {string} Text color of button when disabled*/
    __publicField(this, "disableColor2", colorString([0.4, 0.4, 0.4]));
    /**@type {boolean} */
    __publicField(this, "disable", false);
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
  /**
   * Constructs a new Checkbox with specified propertes in `props` 
   * @param {ToggleButtonProperties|null} [props=null] 
   */
  constructor(props = null) {
    super();
    /**@type {string} Color of button (derives from widget)*/
    __publicField(this, "bgColor", colorString([0.5, 0.5, 0.5]));
    /**@type {string} Color of button when pressed down*/
    __publicField(this, "pressColor", colorString([0.7, 0.7, 0.7]));
    /**@type {string} Color of button when pressed down*/
    __publicField(this, "selectColor", colorString([0.7, 0.7, 0.8]));
    /**@type {string} Background color of button when disabled*/
    __publicField(this, "disableColor1", colorString([0.2, 0.2, 0.2]));
    /**@type {string} Text color of button when disabled*/
    __publicField(this, "disableColor2", colorString([0.4, 0.4, 0.4]));
    /**@type {boolean} */
    __publicField(this, "disable", false);
    /**@type {boolean} State of the ToggleButton, true if checked and false if unchecked */
    __publicField(this, "_press", false);
    /**@type {string|null} If not null, the ToggleButton becomes part of a group where only one option in the group can be active */
    __publicField(this, "group", null);
    /**@type {boolean} If group is true, activating this button deactivates others  */
    __publicField(this, "singleSelect", true);
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
  /**
   * Constructs a new Checkbox with specified propertes in `props` 
   * @param {CheckBoxProperties|null} [props=null] 
   */
  constructor(props = null) {
    super();
    /**@type {string} Color of checkbox when pressed down*/
    __publicField(this, "selectColor", colorString([0.7, 0.7, 0.8]));
    /**@type {string} Color of checkbox check when checked*/
    __publicField(this, "color", colorString([0.6, 0.6, 0.6]));
    /**@type {string} Color of checkbox outline when pressed down*/
    __publicField(this, "bgColor", colorString([0.5, 0.5, 0.5]));
    /**@type {string} Color of checkbox outline when pressed down*/
    __publicField(this, "disableColor1", colorString([0.2, 0.2, 0.2]));
    /**@type {string} Color of checkbox check when disabled*/
    __publicField(this, "disableColor2", colorString([0.3, 0.3, 0.3]));
    /**@type {boolean} Checkbox is disabled if true and cannot be interacted with*/
    __publicField(this, "disable", false);
    /**@type {boolean} State of the checkbox, true if checked and false if unchecked */
    __publicField(this, "check", false);
    /**@type {string|null} If part of a group, the checkbox becomes a radio box where only one option in the group can be active */
    __publicField(this, "group", null);
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
  /**
   * Constructs a slider with specified properties in `props`
   * @param {SliderProperties|null} props 
   */
  constructor(props = null) {
    super();
    /**@type {string} Color of the slider button when pressed down*/
    __publicField(this, "selectColor", colorString([0.7, 0.7, 0.8]));
    /**@type {string} Color of the slider button*/
    __publicField(this, "color", colorString([0.6, 0.6, 0.6]));
    /**@type {string} Color of the groove and slider button outline*/
    __publicField(this, "bgColor", colorString([0.4, 0.4, 0.4]));
    /**@type {string} Color of the groove and slider button outline when disabled*/
    __publicField(this, "disableColor1", colorString([0.2, 0.2, 0.2]));
    /**@type {string} Color of the slider button when disabled*/
    __publicField(this, "disableColor2", colorString([0.3, 0.3, 0.3]));
    /**@type {boolean} Slider is greyed out and cannot be interacted with if disabled is true */
    __publicField(this, "disable", false);
    /**@type {number} Min value of slider */
    __publicField(this, "min", 0);
    /**@type {number|null} Max value of slider, if null there is no upper limit */
    __publicField(this, "max", 1);
    /**@type {number} current max for slider with no upper limit */
    __publicField(this, "curMax", 1);
    /**
     * @type {number} for unbounded slider sets `curMax` equal to this multiple of 
     * the current value after each slider release */
    __publicField(this, "unboundedStopMultiple", 10);
    /**@type {boolean} if true, the slider operates on an exponential scale */
    __publicField(this, "exponentialSlider", false);
    /**@type {number|null} Step increment of slider, continuous if null */
    __publicField(this, "step", null);
    /**@type {'horizontal'|'vertical'} Orientation of the slider */
    __publicField(this, "orientation", "horizontal");
    /**@type {number} The position of the slider */
    __publicField(this, "value", 0);
    /**@type {number} Size of the slider button as a fraction of the length of slider */
    __publicField(this, "sliderSize", 0.2);
    if (props !== null) {
      this.updateProperties(props);
    }
  }
  /**@type {(touch:Touch)=>void} */
  setValue(touch) {
    var _a;
    let max = (_a = this.max) != null ? _a : this.curMax;
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
    var _a, _b;
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
      let max = (_a = this.max) != null ? _a : this.curMax;
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
      let max = (_b = this.max) != null ? _b : this.curMax;
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
  /**
   * 
   * @param {TextInputProperties|null} properties 
   */
  constructor(properties = {}) {
    super();
    /**@type {HTMLInputElement|HTMLTextAreaElement|null} */
    __publicField(this, "_activeDOMInput", null);
    /**@type {boolean} true when actively edited and has focus, false otherwise */
    __publicField(this, "focus", true);
    /**@type {boolean} Text input cannot be interact with when disable is true */
    __publicField(this, "disable", false);
    /**
     * Called before updating the text value after the focus on the DOM input object is cleared.
     * You can override `inputSanitizer` to change what is populated into the `Label`.
     * @type {undefined|((text:string, textInput:TextInput)=>string)} */
    __publicField(this, "_inputSanitizer");
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
      if ((iph == null ? void 0 : iph.grabbed) === this) iph.ungrab();
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
  /**
   * Constructs a new ImageWidget, optionally apply properties in `props`
   * @param {ImageWidgetProperties|null} props 
   */
  constructor(props = null) {
    super();
    /**@type {string|null} */
    __publicField(this, "bgColor", null);
    /**@type {string|null} */
    __publicField(this, "outlineColor", null);
    /**@type {string|null} filename or url of the image to display */
    __publicField(this, "src", null);
    /**@type {boolean} lock to the aspect ratio of the image if true, stretch/squeeze to fit if false */
    __publicField(this, "lockAspect", true);
    /**@type {boolean} scales the image to fit the available space*/
    __publicField(this, "scaleToFit", true);
    /**@type {boolean} apply antialiasing to scaled images if true (usually want this to be false to pixel art*/
    __publicField(this, "antiAlias", true);
    /**@type {number} angle in degrees to rotate the image*/
    __publicField(this, "angle", 0);
    /**@type {'center'|[number,number]} Position within the widget for the rotation point */
    __publicField(this, "anchor", "center");
    //anchor for rotation
    /**@type {boolean} flips the image on the along the y-axis before rotating*/
    __publicField(this, "mirror", false);
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
  /**
   * Creates an instance of a BoxLayout with properties optionally specified in `properties`.
   * @param {BoxLayoutProperties|null} properties 
   */
  constructor(properties = null) {
    super();
    /**@type {string|number} Horizontal spacing between widgets in a horizontal orientation*/
    __publicField(this, "spacingX", 0);
    /**@type {string|number} Vertical spacing between widgets in a vertical orientation*/
    __publicField(this, "spacingY", 0);
    /**@type {string|number} Padding at left and right sides of BoxLayout*/
    __publicField(this, "paddingX", 0);
    /**@type {string|number} Padding at top and bottom sides of BoxLayout*/
    __publicField(this, "paddingY", 0);
    /**@type {'vertical'|'horizontal'} Direction that child widgets are arranged in the BoxLayout*/
    __publicField(this, "orientation", "vertical");
    /**@type {'forward'|'reverse'} Order that child widgets are arranged in the BoxLayout*/
    __publicField(this, "order", "forward");
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
  /**@type {Widget['layoutChildren']} */
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
        this[3] = y + paddingY - this.y;
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
        this[2] = x + paddingX - this.x;
      }
    }
  }
}
class Notebook extends Widget {
  /**
   * Creates an instance of a Notebook with properties optionally specified in `properties`.
   * @param {NotebookProperties|null} properties 
   */
  constructor(properties = null) {
    super();
    __publicField(this, "activePage", 0);
    if (properties !== null) {
      this.updateProperties(properties);
    }
  }
  /**@type {Widget['on_wheel']} */
  on_wheel(event, object, wheel) {
    var _a;
    const ch = (_a = this.children[this.activePage]) != null ? _a : void 0;
    if (ch !== void 0) {
      if (ch.emit(event, wheel)) return true;
    }
    return false;
  }
  /**@type {Widget['on_touch_down']} */
  on_touch_down(event, object, touch) {
    var _a, _b;
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const ch = (_a = this.children[this.activePage]) != null ? _a : void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const ch = (_b = this.children[this.activePage]) != null ? _b : void 0;
      if (ch !== void 0) {
        if (ch.emit(event, touch)) return true;
      }
    }
    return false;
  }
  /**@type {Widget['on_touch_up']} */
  on_touch_up(event, object, touch) {
    var _a, _b;
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const ch = (_a = this.children[this.activePage]) != null ? _a : void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const ch = (_b = this.children[this.activePage]) != null ? _b : void 0;
      if (ch !== void 0) {
        if (ch.emit(event, touch)) return true;
      }
    }
    return false;
  }
  /**@type {Widget['on_touch_move']} */
  on_touch_move(event, object, touch) {
    var _a, _b;
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const ch = (_a = this.children[this.activePage]) != null ? _a : void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const ch = (_b = this.children[this.activePage]) != null ? _b : void 0;
      if (ch !== void 0) {
        if (ch.emit(event, touch)) return true;
      }
    }
    return false;
  }
  /**@type {Widget['on_touch_cancel']} */
  on_touch_cancel(event, object, touch) {
    var _a, _b;
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const ch = (_a = this.children[this.activePage]) != null ? _a : void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const ch = (_b = this.children[this.activePage]) != null ? _b : void 0;
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
    var _a, _b;
    this.draw(app, ctx);
    let transform = this.getTransform();
    if (transform) {
      ctx.save();
      ctx.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
      let w2 = (_a = this.children[this.activePage]) != null ? _a : void 0;
      if (w2 !== void 0) w2._draw(app, ctx, millis);
      ctx.restore();
      return;
    }
    let w = (_b = this.children[this.activePage]) != null ? _b : void 0;
    if (w !== void 0) w._draw(app, ctx, millis);
  }
}
class TabbedNotebook extends Notebook {
  /**
   * Creates an instance of a Notebook with properties optionally specified in `properties`.
   * @param {TabbedNotebookProperties|null} properties 
   */
  constructor(properties = null) {
    super();
    /**@type {string|number} The height hint for the tabbed area of the TabbedNotebook */
    __publicField(this, "tabHeightHint", "1");
    /**@type {string} The named of the button group for the TabbedNotebook */
    __publicField(this, "tabGroupName", "tabbedNotebookGroup");
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
    var _a, _b;
    const bb = (_a = this._children[0]) != null ? _a : void 0;
    if (bb !== void 0) {
      if (bb.emit(event, wheel)) return true;
    }
    const ch = (_b = this.children[this.activePage]) != null ? _b : void 0;
    if (ch !== void 0) {
      if (ch.emit(event, wheel)) return true;
    }
    return false;
  }
  /**@type {Widget['on_touch_down']} */
  on_touch_down(event, object, touch) {
    var _a, _b, _c, _d;
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const bb = (_a = this._children[0]) != null ? _a : void 0;
      if (bb !== void 0) {
        if (bb.emit(event, t)) return true;
      }
      const ch = (_b = this.children[this.activePage]) != null ? _b : void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const bb = (_c = this._children[0]) != null ? _c : void 0;
      if (bb !== void 0) {
        if (bb.emit(event, touch)) return true;
      }
      const ch = (_d = this.children[this.activePage]) != null ? _d : void 0;
      if (ch !== void 0) {
        if (ch.emit(event, touch)) return true;
      }
    }
    return false;
  }
  /**@type {Widget['on_touch_up']} */
  on_touch_up(event, object, touch) {
    var _a, _b, _c, _d;
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const bb = (_a = this._children[0]) != null ? _a : void 0;
      if (bb !== void 0) {
        if (bb.emit(event, t)) return true;
      }
      const ch = (_b = this.children[this.activePage]) != null ? _b : void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const bb = (_c = this._children[0]) != null ? _c : void 0;
      if (bb !== void 0) {
        if (bb.emit(event, touch)) return true;
      }
      const ch = (_d = this.children[this.activePage]) != null ? _d : void 0;
      if (ch !== void 0) {
        if (ch.emit(event, touch)) return true;
      }
    }
    return false;
  }
  /**@type {Widget['on_touch_move']} */
  on_touch_move(event, object, touch) {
    var _a, _b, _c, _d;
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const bb = (_a = this._children[0]) != null ? _a : void 0;
      if (bb !== void 0) {
        if (bb.emit(event, t)) return true;
      }
      const ch = (_b = this.children[this.activePage]) != null ? _b : void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const bb = (_c = this._children[0]) != null ? _c : void 0;
      if (bb !== void 0) {
        if (bb.emit(event, touch)) return true;
      }
      const ch = (_d = this.children[this.activePage]) != null ? _d : void 0;
      if (ch !== void 0) {
        if (ch.emit(event, touch)) return true;
      }
    }
    return false;
  }
  /**@type {Widget['on_touch_cancel']} */
  on_touch_cancel(event, object, touch) {
    var _a, _b, _c, _d;
    let newT = this.getTransform();
    if (newT) {
      let t = touch.copy();
      let dp = newT.inverse().transformPoint(new DOMPoint(t.pos[0], t.pos[1]));
      t.pos = [dp.x, dp.y];
      const bb = (_a = this._children[0]) != null ? _a : void 0;
      if (bb !== void 0) {
        if (bb.emit(event, t)) return true;
      }
      const ch = (_b = this.children[this.activePage]) != null ? _b : void 0;
      if (ch !== void 0) {
        if (ch.emit(event, t)) return true;
      }
    } else {
      const bb = (_c = this._children[0]) != null ? _c : void 0;
      if (bb !== void 0) {
        if (bb.emit(event, touch)) return true;
      }
      const ch = (_d = this.children[this.activePage]) != null ? _d : void 0;
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
    var _a;
    this.buttonBox.children = [];
    let i = 0;
    for (let page of this.children) {
      const tb = new ToggleButton({
        text: (_a = page["name"]) != null ? _a : String(i + 1),
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
    var _a, _b, _c, _d;
    this.draw(app, ctx);
    let transform = this.getTransform();
    if (transform) {
      ctx.save();
      ctx.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
      let bb2 = (_a = this._children[0]) != null ? _a : void 0;
      if (bb2 !== void 0) bb2._draw(app, ctx, millis);
      let w2 = (_b = this.children[this.activePage]) != null ? _b : void 0;
      if (w2 !== void 0) w2._draw(app, ctx, millis);
      ctx.restore();
      return;
    }
    let bb = (_c = this._children[0]) != null ? _c : void 0;
    if (bb !== void 0) bb._draw(app, ctx, millis);
    let w = (_d = this.children[this.activePage]) != null ? _d : void 0;
    if (w !== void 0) w._draw(app, ctx, millis);
  }
}
class GridLayout extends Widget {
  //TODO: Need to track column widths and row heights based on max height/width hints in each row/col
  /**
   * Constructs a new GridLayout with optional properties set by `properties`
   * @param {GridLayoutProperties|null} properties 
   */
  constructor(properties = null) {
    super();
    /**@type {number} Number of widgets per row in a horizontal orientation*/
    __publicField(this, "numX", 1);
    /**@type {number} Number of widgets per column in a vertical orientation*/
    __publicField(this, "numY", 1);
    /**@type {string|number} Horizontal spacing between widgets in a horizontal orientation*/
    __publicField(this, "spacingX", 0);
    /**@type {string|number} Vertical spacing between widgets in a vertical orientation*/
    __publicField(this, "spacingY", 0);
    /**@type {string|number} Padding at left and right sides of BoxLayout*/
    __publicField(this, "paddingX", 0);
    /**@type {string|number} Padding at top and bottom sides of BoxLayout*/
    __publicField(this, "paddingY", 0);
    /**@type {'vertical'|'horizontal'} Direction that child widgets are arranged in the BoxLayout*/
    __publicField(this, "orientation", "horizontal");
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
  /**
   * Construcsts a new ScrollView with optional properties in `properties` 
   * @param {null|ScrollViewProperties} [properties=null] 
   */
  constructor(properties = null) {
    super();
    /**@type {number} current x-axis scrolling position measured from left of client area in client area units */
    __publicField(this, "_scrollX", 0);
    /**@type {number} current y-axis scrolling position measured from top of client area in client area units */
    __publicField(this, "_scrollY", 0);
    /**@type {number} desired x-axis scrolling position measured from left of client area in client area units */
    __publicField(this, "scrollX", 0);
    /**@type {number} desired y-axis scrolling position measured from top of client area in client area units */
    __publicField(this, "scrollY", 0);
    /**@type {boolean} true if horizontal scrolling allowed */
    __publicField(this, "scrollW", true);
    /**@type {boolean} true if vertical scrolling allowed */
    __publicField(this, "scrollH", true);
    /**@type {'left'|'center'|'right'} how to align content horizontally if horizontal scrolling disallowed */
    __publicField(this, "wAlign", "center");
    //left, center, right
    /**@type {'top'|'middle'|'bottom'} how to align content vertically if vertical scrolling disallowed */
    __publicField(this, "hAlign", "top");
    //top, middle, bottom
    /**@type {boolean} zooming allowed via user input if true (pinch to zoom) */
    __publicField(this, "uiZoom", true);
    /**@type {boolean} moving allowed via user input if true (touch and slide to move) */
    __publicField(this, "uiMove", true);
    /**@type {number} zoom ratio (1=no zoom, <1 zoomed out, >1 zoomed in) */
    __publicField(this, "zoom", 1);
    /**@type {Vec2|null} tracks velocity of kinetic scrolling action */
    __publicField(this, "vel", null);
    /**@type {number} vel is set to zero on an axis if the absolute velocity falls below this cutoff */
    __publicField(this, "velCutoff", 1e-5);
    /**@type {number} velocity of kinetic motion, `vel`, declines by this decay ratio every 30ms */
    __publicField(this, "velDecay", 0.95);
    /**@type {boolean} unbounded vertical scrolling*/
    __publicField(this, "unboundedH", false);
    /**@type {boolean} unbounded horizontal scrolling*/
    __publicField(this, "unboundedW", false);
    /**@type {Vec2|null} */
    __publicField(this, "_zoomCenter", null);
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
  /**
   * Construcsts a new ModalView with optional properties in `properties` 
   * @param {null|ModalViewProperties} [properties=null] 
   */
  constructor(properties = null) {
    super();
    /**@type {boolean} If true, clicking outside of the modal rect will close it*/
    __publicField(this, "closeOnTouchOutside", true);
    /**@type {string|null} background color of modal rect*/
    __publicField(this, "bgColor", "slate");
    /**@type {string|null} outline color of modal rect*/
    __publicField(this, "outlineColor", "gray");
    /**@type {boolean} If true, darken the entire canvas before drawing*/
    __publicField(this, "dim", true);
    /**@type {number} Amount of canvas dimming applied (0=none => 1=opaque black)*/
    __publicField(this, "dimScale", 0.8);
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
class SpriteWidget extends Widget {
  constructor(props = {}) {
    super();
    /** @type {SpriteSheet|null} */
    __publicField(this, "spriteSheet", null);
    /** @type {number[]|LayeredAnimationFrame[]} */
    __publicField(this, "frames", []);
    __publicField(this, "timePerFrame", 30);
    __publicField(this, "timeLeft", 0);
    __publicField(this, "activeFrame", 0);
    __publicField(this, "id", "");
    __publicField(this, "facing", 0);
    __publicField(this, "flipX", false);
    __publicField(this, "flipY", false);
    __publicField(this, "oneShot", false);
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
    var _a;
    return (_a = this.frames[this.activeFrame]) != null ? _a : -1;
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
    var _a;
    const data = {};
    data["_data"] = this._data.slice();
    data["tileDim"] = this.tileDim.slice();
    data["spriteSheet"] = (_a = Array(...App.resources.keys()).find((k) => App.resources[k] === this.spriteSheet)) != null ? _a : null;
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
    var _a, _b;
    this.tileDim = new Vec2((_a = data["tileDim"]) != null ? _a : [0, 0]);
    const _data = data["_data"];
    for (let i = 0; i < _data.length; i++) {
      this._data[i] = _data[i];
    }
    this.spriteSheet = (_b = App.resources[data["spriteSheet"]]) != null ? _b : null;
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
    var _a;
    const data = {};
    const layerCopy = [];
    for (let l of this._layerData) {
      layerCopy.push(l.slice());
    }
    data["_layerData"] = layerCopy;
    data["activeLayer"] = this.activeLayer;
    data["numLayers"] = this.numLayers;
    data["tileDim"] = this.tileDim.slice();
    data["spriteSheet"] = (_a = Array(...App.resources.keys()).find((k) => App.resources[k] === this.spriteSheet)) != null ? _a : null;
    return data;
  }
  /**
   * 
   * @param {Object} data 
   */
  deserialize(data) {
    var _a, _b;
    this.numLayers = data["numLayers"];
    this.activeLayer = data["activeLayer"];
    this.tileDim = new Vec2((_a = data["tileDim"]) != null ? _a : [0, 0]);
    const n = data["_layerData"].length;
    this._layerData.length = n;
    for (let i = 0; i < n; i++) {
      const lout = this._layerData[i];
      const lin = data["_layerData"][i];
      for (let j = 0; j < lin.lenth; j++) {
        lout[j] = lin[j];
      }
    }
    this.spriteSheet = (_b = App.resources[data["spriteSheet"]]) != null ? _b : null;
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
const default_theme = {
  "background": [0.7, 0.7, 0.9, 1],
  "tile": [0.5, 0.5, 0.75, 1],
  "tile_selected": [0, 0, 0.5, 1],
  "tile_letter_text": [0.9, 0.9, 0.9, 1],
  "word_score_background": [0, 0, 0.5, 1],
  //(0, 0, 0.8, 1],
  "word_score_text": [0.9, 0.9, 0.9, 1],
  //(0.9, 0.9, 0.9, 1],
  "score_text": [0.9, 0.9, 0.9, 1],
  "active_score_text": [0.5, 0.5, 0.75, 1],
  "checker": [0.8, 0.8, 0.9, 1],
  "move_candidates": [0.2, 0.3, 0.7, 1],
  "menu_button_background": [0.5, 0.8, 0.7, 1],
  "menu_button_touched": [0.7, 0.8, 0.9, 1]
};
const beach_theme = {
  "background": [20, 140, 156, 1],
  "tile": [255, 241, 156, 1],
  "tile_selected": [232, 180, 120, 1],
  "tile_letter_text": [86, 148, 155, 1],
  "word_score_background": [252, 200, 130, 1],
  "word_score_text": [86, 148, 155, 1],
  "score_text": [221, 238, 242, 1],
  "active_score_text": [254, 241, 156, 1],
  "checker": [0, 202, 199, 1],
  "move_candidates": [252, 200, 130, 1],
  "menu_button_background": [252, 136, 61, 1],
  "menu_button_touched": [252, 157, 84, 1]
};
const themes = {
  "default": default_theme,
  "beach": beach_theme
};
var background, checker, moveCandidates;
function loadTheme(themeName) {
  const theme = themes[themeName];
  if (themeName === "default") {
    const c = (col) => [Math.floor(255 * col[0]), Math.floor(255 * col[1]), Math.floor(255 * col[2]), col[3]];
    for (let k in theme) {
      theme[k] = c(theme[k]);
    }
  }
  for (let t in theme) {
    let [r, g, b, a] = theme[t];
    theme[t] = `rgba(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)},${a})`;
  }
  theme["id"] = themeName;
  background = theme["background"];
  theme["tile"];
  theme["tile_selected"];
  theme["tile_letter_text"];
  theme["word_score_background"];
  theme["word_score_text"];
  theme["score_text"];
  theme["active_score_text"];
  checker = theme["checker"];
  moveCandidates = theme["move_candidates"];
  theme["menu_button_background"];
  return theme;
}
const boardDim = 10;
const tiles = [
  ["A", 0, 7],
  ["B", 2, 3],
  ["C", 2, 3],
  ["D", 1, 5],
  ["E", 0, 10],
  ["F", 2, 3],
  ["G", 2, 4],
  ["H", 3, 2],
  ["I", 0, 7],
  ["J", 4, 1],
  ["K", 3, 2],
  ["L", 0, 4],
  ["M", 2, 3],
  ["N", 1, 4],
  ["O", 0, 7],
  ["P", 2, 3],
  ["Q", 4, 1],
  ["R", 1, 5],
  ["S", 1, 5],
  ["T", 1, 5],
  ["U", 1, 4],
  ["V", 4, 1],
  ["W", 3, 3],
  ["X", 4, 1],
  ["Y", 3, 2],
  ["Z", 4, 1]
];
function unweightedChoice(count, choices, seed) {
  const originalSeed = getSeed();
  setSeed(seed);
  const outputArray = [...choices.values()];
  shuffle(outputArray);
  const output = new Set(outputArray.slice(0, count));
  setSeed(originalSeed);
  return output;
}
class Player {
  constructor(board, pid) {
    __publicField(this, "playerId", 1);
    __publicField(this, "numPlayers", 2);
    __publicField(this, "name", "HUMAN");
    __publicField(this, "type", 1);
    this.playerId = pid;
    this.board = board;
  }
  startTurn() {
  }
  localTouch() {
    return !this.board.gameOver;
  }
  abort() {
    return true;
  }
  reset() {
  }
}
class AITile {
  /**
   * 
   * @param {Tile} tile 
   */
  constructor(tile) {
    this.letter = tile.letter;
    this.value = tile.value;
  }
}
class AIPlayer extends Player {
  /**
   * 
   * @param {Board} board 
   * @param {number} pid 
   */
  constructor(board, pid) {
    super(board, pid);
    this.type = 1;
    this.vocab = 0;
    this.randomVocab = false;
    this.randomVocabSeed = 0;
    this.maxWordLen = boardDim;
    this.maxChecks = 5e5;
    this.name = "";
    this._abort = false;
    this._dead = false;
    this.counter = 0;
    this.sel = [];
    this.words = /* @__PURE__ */ new Set();
    this.setupWords();
    this.initState = this.boardState();
  }
  reset() {
    this._dead = false;
  }
  boardState() {
    let state = {};
    for (let xy in this.board.tiles) {
      state[xy] = new AITile(this.board.tiles[xy]);
    }
    return state;
  }
  /**
   * 
   * @param {AIBoard} state 
   * @returns 
   */
  emptyCells(state) {
    let emptyCells = [];
    for (let x = 0; x < boardDim; x++) {
      for (let y = 0; y < boardDim; y++) {
        let pos = `${x},${y}`;
        if (!(pos in state)) {
          emptyCells.push([x, y]);
        }
      }
    }
    return emptyCells;
  }
  /**
   * 
   * @param {AIBoard} state 
   * @param {[number, number]} pos 
   * @returns 
   */
  slideables(state, pos) {
    let slideables = [];
    let directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    directions.forEach((dz) => {
      let q = 1;
      let x = pos[0] + q * dz[0], y = pos[1] + q * dz[1];
      while (x >= 0 && x < boardDim && y >= 0 && y < boardDim) {
        if (`${x},${y}` in state) {
          if (state[`${x},${y}`] !== 1) {
            slideables.push([x, y]);
          }
          break;
        }
        q++;
        x = pos[0] + q * dz[0], y = pos[1] + q * dz[1];
      }
    });
    return slideables;
  }
  /**
   * 
   * @param {AIBoard} state 
   * @param {[number, number]} pos 
   * @returns 
   */
  neighbors(state, pos) {
    let neighbors = [];
    let directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    directions.forEach((diff) => {
      let npos = [pos[0] + diff[0], pos[1] + diff[1]];
      if (`${npos[0]},${npos[1]}` in state) {
        neighbors.push(npos);
      }
    });
    return neighbors;
  }
  /**
   * 
   * @param {AIBoard} state 
   * @param {[number, number][]} sel 
   * @returns 
   */
  arrangeSel(state, sel) {
    return sel.map((s) => `${s[0]},${s[1]}` in state ? (
      /**@type {[[number,number],[number,number]]}*/
      [s, s]
    ) : (
      /**@type {[[number,number]|null,[number,number]]}*/
      [null, s]
    ));
  }
  /**
   * 
   * @param {AIBoard} state 
   * @param {[number, number][]} sel 
   * @returns 
   */
  getWordsInRange(state, sel) {
    const arrSel = this.arrangeSel(state, sel);
    const empty = arrSel.map((item, index) => item[0] === null ? index : -1).filter((index) => index !== -1);
    if (empty.length === 0) {
      return [];
    }
    let stateCopy = { ...state };
    arrSel.forEach((s) => {
      if (s[0] !== null) {
        if (`${s[0][0]},${s[0][1]}` in stateCopy) {
          stateCopy[`${s[0]},${s[1]}`] = 1;
        }
      }
    });
    let candidates = [];
    const getWordsRecurs = (state2, k) => {
      const dst = arrSel[empty[k]][1];
      state2[`${dst[0]},${dst[1]}`] = 1;
      this.slideables(state2, dst).forEach((ss) => {
        if (this._abort) {
          return [];
        }
        if (this.counter > this.maxChecks) {
          return;
        }
        const sst = `${ss[0]},${ss[1]}`;
        const tmp = state2[sst];
        delete state2[sst];
        sel[empty[k]][0] = ss;
        if (k < empty.length - 1) {
          getWordsRecurs(state2, k + 1);
        } else {
          this.counter++;
          const word = arrSel.map((s) => this.initState[`${s[1][0]},${s[1][1]}`].letter).join("");
          if (this.words.has(word) || this.words.has([...word].reverse().join(""))) {
            const score = arrSel.reduce((acc, s) => acc + this.initState[`${s[1][0]},${s[1][1]}`].value, 0) * word.length;
            const nsel = arrSel.map((s) => [s[0], s[1]]);
            candidates.push([word, score, nsel]);
          }
        }
        state2[sst] = tmp;
      });
      delete state2[`${dst[0]},${dst[1]}`];
    };
    getWordsRecurs(stateCopy, 0);
    return candidates;
  }
  /**
   * 
   * @param {[number, number]} d
   * @param {number} position
   * @returns {[number, number][]}
   */
  coordList(d, position) {
    if (d[0] === 1 && d[1] === 0) {
      return Array.from({ length: boardDim }, (_, index) => [index, position]);
    }
    if (d[0] === 0 && d[1] === 1) {
      return Array.from({ length: boardDim }, (_, index) => [position, index]);
    }
    if (d[0] === 1 && d[1] === 1) {
      if (position >= 0) {
        return Array.from({ length: boardDim - position }, (_, index) => [index + position, index]);
      } else {
        return Array.from({ length: boardDim + position }, (_, index) => [index, index - position]);
      }
    }
    if (d[0] === 1 && d[1] === -1) {
      if (position >= 0) {
        return Array.from({ length: boardDim - position }, (_, index) => [index + position, boardDim - 1 - index]);
      } else {
        return Array.from({ length: boardDim + position }, (_, index) => [index, boardDim - 1 - index + position]);
      }
    }
    return [];
  }
  /**
   * 
   * @param {AIBoard} state 
   * @param {[number, number]} d 
   * @param {number} position 
   * @returns 
   */
  wordsOnLine(state, d, position) {
    let candidates = [];
    let coords = this.coordList(d, position);
    for (let start_point = 0; start_point < coords.length; start_point++) {
      for (let end_point = start_point + 1; end_point < Math.min(coords.length, start_point + this.maxWordLen); end_point++) {
        console.log("AI step", this.counter);
        if (this._abort) {
          return [];
        }
        if (this.counter > this.maxChecks) {
          return candidates;
        }
        let wordsInRange = this.getWordsInRange(state, coords.slice(start_point, end_point + 1));
        candidates = candidates.concat(wordsInRange);
      }
    }
    return candidates;
  }
  setupWords() {
    if (this.vocab <= 0) {
      this.vocab = words.size;
      this.words = words;
    } else if (this.randomVocab) {
      this.words = unweightedChoice(this.vocab, words, this.randomVocabSeed);
    } else {
      this.words = new Set([...words.values()].slice(-this.vocab));
    }
  }
  findMove() {
    this.counter = 0;
    let state = { ...this.initState };
    let candidates = [];
    let empty = this.emptyCells(state);
    let lines = /* @__PURE__ */ new Set();
    empty.forEach((e) => {
      lines.add([1, 0, e[1]]);
      lines.add([0, 1, e[0]]);
      lines.add([1, 1, e[1] - e[0]]);
      lines.add([1, -1, e[0] - e[1]]);
    });
    lines.forEach((l) => {
      candidates = candidates.concat(this.wordsOnLine(state, [l[0], l[1]], l[2]));
      if (this.counter > this.maxChecks) {
        return;
      }
      if (this._abort) {
        this._abort = false;
        return;
      }
    });
    if (candidates.length > 0) {
      let maxScore = Math.max(...candidates.map((c) => c[1]));
      let bestCandidates = candidates.filter((c) => c[1] === maxScore);
      console.log("number of candidates", bestCandidates.length);
      setTimeout(() => this.foundWord(this.chooseRandom(bestCandidates)), 1);
      return;
    }
    setTimeout(() => this.noWordFound(), 1);
  }
  /**
   * @template T
   * @param {T[]} array 
   * @returns 
   */
  chooseRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  startTurn() {
    this.initState = this.boardState();
    this.findMove();
  }
  /**
   * 
   * @param {[string, number, [[number, number],[number,number]][]]} choice 
   */
  foundWord(choice) {
    const [word, score, sel] = choice;
    this.sel = sel;
    this.doNext();
  }
  noWordFound() {
    this.sel = [];
    this.doNext();
  }
  doNext() {
    if (this._dead) {
      return;
    }
    try {
      const src = this.sel[0][0];
      const dest = this.sel[0][1];
      this.sel.shift();
      this.board.select(this.board.tiles[this.board._conv_pos(new Vec2(src))], new Vec2(dest));
      setTimeout(() => this.doNext(), 500);
    } catch (error) {
      setTimeout(() => this.endTurn(), 2e3);
    }
  }
  endTurn() {
    if (this._dead) {
      return;
    }
    this.board.endTurn();
  }
  localTouch() {
    return false;
  }
}
class Antrax extends AIPlayer {
  constructor() {
    super(...arguments);
    __publicField(this, "name", "AI ANTRAX");
    __publicField(this, "type", 2);
    __publicField(this, "vocab", 5e3);
    //number of words in vocabulary (0 for all)
    __publicField(this, "randomVocab", false);
    //True to randomly determine the vocab (weighted by frequency)
    __publicField(this, "randomVocabSeed", 0);
    //The seed to use to draw the vocab
    __publicField(this, "maxWordLen", 5);
    //maximum length of words to check for 
    __publicField(this, "maxChecks", 1e5);
  }
  //maximum number of word checks allowed before turn ends
}
class Blaine extends AIPlayer {
  constructor() {
    super(...arguments);
    __publicField(this, "name", "AI BLAINE");
    __publicField(this, "type", 3);
    __publicField(this, "vocab", 7e3);
    //number of words in vocabulary (0 for all)
    __publicField(this, "randomVocab", false);
    //True to randomly determine the vocab (weighted by frequency)
    __publicField(this, "randomVocabSeed", 0);
    //The seed to use to draw the vocab
    __publicField(this, "maxWordLen", 7);
    //maximum length of words to check for 
    __publicField(this, "maxChecks", 2e5);
  }
  //maximum number of word checks allowed before turn ends
}
class Cyclops extends AIPlayer {
  constructor() {
    super(...arguments);
    __publicField(this, "name", "AI CYCLOPS");
    __publicField(this, "type", 4);
    __publicField(this, "vocab", 15e3);
    //number of words in vocabulary (0 for all)
    __publicField(this, "randomVocab", false);
    //True to randomly determine the vocab (weighted by frequency)
    __publicField(this, "randomVocabSeed", 0);
    //The seed to use to draw the vocab
    __publicField(this, "maxWordLen", 7);
    //maximum length of words to check for 
    __publicField(this, "maxChecks", 2e5);
  }
  //maximum number of word checks allowed before turn ends
}
class Doctor extends AIPlayer {
  constructor() {
    super(...arguments);
    __publicField(this, "name", "AI DOCTOR");
    __publicField(this, "type", 5);
    __publicField(this, "vocab", 15e3);
    //number of words in vocabulary (0 for all)
    __publicField(this, "randomVocab", false);
    //True to randomly determine the vocab (weighted by frequency)
    __publicField(this, "randomVocabSeed", 0);
    //The seed to use to draw the vocab
    __publicField(this, "maxWordLen", boardDim);
    //maximum length of words to check for 
    __publicField(this, "maxChecks", 2e5);
  }
  //maximum number of word checks allowed before turn ends
}
class Earth extends AIPlayer {
  constructor() {
    super(...arguments);
    __publicField(this, "name", "AI EARTH");
    __publicField(this, "type", 6);
    __publicField(this, "vocab", 2e4);
    //number of words in vocabulary (0 for all)
    __publicField(this, "randomVocab", false);
    //True to randomly determine the vocab (weighted by frequency)
    __publicField(this, "randomVocabSeed", 0);
    //The seed to use to draw the vocab
    __publicField(this, "maxWordLen", boardDim);
    //maximum length of words to check for 
    __publicField(this, "maxChecks", 2e5);
  }
  //maximum number of word checks allowed before turn ends
}
class Fess extends AIPlayer {
  constructor() {
    super(...arguments);
    __publicField(this, "name", "AI FESS");
    __publicField(this, "type", 7);
    __publicField(this, "vocab", 25e3);
    //number of words in vocabulary (0 for all)
    __publicField(this, "randomVocab", false);
    //True to randomly determine the vocab (weighted by frequency)
    __publicField(this, "randomVocabSeed", 0);
    //The seed to use to draw the vocab
    __publicField(this, "maxWordLen", boardDim);
    //maximum length of words to check for 
    __publicField(this, "maxChecks", 3e5);
  }
  //maximum number of word checks allowed before turn ends
}
class Golem extends AIPlayer {
  constructor() {
    super(...arguments);
    __publicField(this, "name", "AI GOLEM XIV");
    __publicField(this, "type", 8);
    __publicField(this, "vocab", 5e4);
    //number of words in vocabulary (0 for all)
    __publicField(this, "randomVocab", false);
    //True to randomly determine the vocab (weighted by frequency)
    __publicField(this, "randomVocabSeed", 0);
    //The seed to use to draw the vocab
    __publicField(this, "maxWordLen", boardDim);
    //maximum length of words to check for 
    __publicField(this, "maxChecks", 5e5);
  }
  //maximum number of word checks allowed before turn ends
}
class Harlie extends AIPlayer {
  constructor() {
    super(...arguments);
    __publicField(this, "name", "AI HARLIE");
    __publicField(this, "type", 9);
    __publicField(this, "vocab", 0);
    //number of words in vocabulary (0 for all)
    __publicField(this, "randomVocab", false);
    //True to randomly determine the vocab (weighted by frequency)
    __publicField(this, "randomVocabSeed", 0);
    //The seed to use to draw the vocab
    __publicField(this, "maxWordLen", boardDim);
    //maximum length of words to check for 
    __publicField(this, "maxChecks", 5e5);
  }
  //maximum number of word checks allowed before turn ends
}
const playerTypes = {
  1: Player,
  2: Antrax,
  3: Blaine,
  4: Cyclops,
  5: Doctor,
  6: Earth,
  7: Fess,
  8: Golem,
  9: Harlie
};
const playerNames = {
  1: "HUMAN",
  2: "AI ANTRAX",
  3: "AI BLAINE",
  4: "AI CYCLOPS",
  5: "AI DOCTOR",
  6: "AI EARTH",
  7: "AI FESS",
  8: "AI GOLEM",
  9: "AI HARLIE"
};
const urlWords = "/slidewords/assets/TWL06-lMEBC9W-.txt";
const markup = "<TextButton@Button>:\n    color: 'rgb(1, 1, 1)'\n    bgColor: 'rgb(0xbb, 0xad, 0xa0)'\n    fontSize: 0.5\n    bold: true\n\n<HeadingLabel@Label>:\n    bgColor: resources['colors']['checker']\n    fontSize: 0.6\n\n<BodyLabel@Label>:\n    fontSize: 0.5\n\n\n<ScoreBar>:\n    id: 'scorebar'\n    bgColor: resources['colors']['background']\n    hints: {w: null, h: null}\n    score: 0\n    hiScore: 0\n    score_2: 0\n    players: 1\n    activePlayer: 1\n    gameId: ''\n    orientation: 'horizontal'\n    BoxLayout:\n        orientation: 'vertical'\n        Label:\n            hints: {w: 1, h: 0.33}\n            text: scorebar.players === 1 ? 'SCORE' : 'PLAYER 1'\n            color: scorebar.activePlayer == 2 || scorebar.players == 1? resources['colors']['score_text'] : resources['colors']['active_score_text']\n            align: 'left'\n            valign: 'bottom'\n            fontSize:0.25\n        Label:\n            hints: {w: 1, h: 0.67}\n            text: scorebar.score.toString()\n            color: scorebar.activePlayer === 2 || scorebar.players == 1? resources['colors']['score_text'] : resources['colors']['active_score_text']\n            align: 'left'\n            valign: 'top'\n            fontSize:0.5\n    BoxLayout:\n        orientation: 'vertical'\n        Label:\n            text: scorebar.players === 2 ? 'MULTIPLAYER': scorebar.gameId!=='default' ? 'DAILY CHALLENGE' : 'RANDOM GAME'\n            color: resources['colors']['score_text']\n            valign: 'top'\n            fontSize: 0.6\n    BoxLayout:\n        orientation: 'vertical'\n        Label:\n            hints: {w: 1, h: 0.33}\n            text: scorebar.players === 1 ? 'BEST' : 'PLAYER 2'\n            color: scorebar.activePlayer == 1 || scorebar.players == 1 ? resources['colors']['score_text'] : resources['colors']['active_score_text']\n            align: 'right'\n            valign: 'bottom'\n            fontSize:0.25\n        Label:\n            hints: {w: 1, h: 0.67}\n            text: scorebar.players === 1 ? scorebar.hiScore.toString() : scorebar.score_2.toString()\n            color: scorebar.activePlayer == 1 || scorebar.players == 1 ? resources['colors']['score_text'] : resources['colors']['active_score_text']\n            align: 'right'\n            valign: 'top'\n            fontSize:0.5\n\n<WordBar>:\n    id: 'wordbar'\n    hints: {w: null, h: null}\n    orientation: 'vertical'\n    word: ''\n    wordScore: 0\n    canPass: true\n    bgColor: wordbar.word!=='' || wordbar.canPass ? resources['colors']['word_score_background'] : resources['colors']['background']\n    Label:\n        id: 'wordLabel'\n        text: wordbar.word!=='' ? wordbar.word+' for '+wordbar.wordScore.toString() : wordbar.canPass ? 'PASS' : ''\n        color: resources['colors']['word_score_text']\n\n<MessageBar@BoxLayout>:\n    id: 'messagebar'\n    orientation: 'vertical'\n    message: ''\n    Label:\n        text: messagebar.message\n        color: resources.colors['score_text']\n\n\n<MenuItem@Button>:\n    bgColor: resources['colors']['menu_button_background']\n    selectColor: resources['colors']['menu_button_touched']\n    hints: {h:'1'}\n\n\n<InstructionsBox@BoxLayout>:\n    bgColor: resources['colors']['checker']\n\n\n\n<Instructions>:\n    id: 'instructions'\n    hints: {x:0.1, y:0.1, h:0.8, w:0.8}\n    orientation: 'vertical'\n    paddingX: '0.01'\n    paddingY: '0.01'\n    spacingX: '0.01'\n    bgColor: resources['colors']['background']\n    HeadingLabel:\n        hints: {w: 1, h: 0.1}\n        text: 'How to Play'\n    ScrollView:\n        id: 'scroller'\n        hints: {w: 1, h: 0.8}\n        scrollW: false\n        BodyLabel:\n            color: 'white'\n            hints: {x:0, y:0, w:1, h:null}\n            text: 'Objective: Clear the board by arranging letters to form words, scoring points based on word length and letter rarity.\\n\\nTo form words, select letter tiles in place or drag them in a straight line into neighboring free tile spaces. A word is valid if it is composed of connected letter tiles in a straight line (either vertically, horizontally or diagonally in either direction), is in the dictionary, and at least one tile was moved to form it. Score a valid word by pressing the word cue at bottom of the screen. Each word scores points equal to the sum of the tile values multiplied by the number of letters in the word. Cancel a selection by tapping any of the selected tiles.'\n            align: 'left'\n            valign: 'top'\n            wrap: true\n\n\n<ScoreDetail1p@BoxLayout>:\n    id: 'scoredetails1p'\n    hints: {x: 0.1, y: 0.1, w: 0.8, h: 0.8}\n    orientation: 'vertical'\n    paddingX: '0.01'\n    paddingY: '0.01'\n    spacingY: '0.01'\n    spacingX: '0.01'\n    detail: ''\n    title: 'In Progress'\n    bgColor: resources['colors']['background']\n    HeadingLabel:\n        hints: {w: 1, h: '1'}\n        text: scoredetails1p.title\n        valign: 'middle'\n        align: 'center'\n    ScrollView:\n        padding: 0.1\n        scrollW: false\n        BodyLabel:\n            text: scoredetails1p.detail\n            align: 'left'\n            valign: 'top'\n            wrap: true\n            hints: {x:0, y:0, h:null,  w:1}\n            fontSize: 0.5\n\n\n<ScoreDetail2p@BoxLayout>:\n    id: 'scoredetail2p'\n    hints: {x: 0.1, y: 0.1, w: 0.8, h: 0.8}\n    orientation: 'vertical'\n    paddingX: '0.01'\n    paddingY: '0.01'\n    spacingY: '0.01'\n    spacingX: '0.01'\n    detail1: ''\n    detail2: ''\n    title: 'In Progress'\n    bgColor: resources['colors']['background']\n    HeadingLabel:\n        hints: {w: 1, h: '1'}\n        text: scoredetail2p.title\n        valign: 'middle'\n        align: 'center'\n    BoxLayout:\n        orientation: 'horizontal'\n        paddingX: 0.05;\n        ScrollView:\n            hints: {w: 0.475, h: 1}\n            scrollW: false\n            BodyLabel:\n                hints: {x:0, y:0, h:null,  w:1}\n                text: scoredetail2p.detail1\n                fontSize: 0.5\n                align: 'left'\n                valign: 'top'\n                wrap: true\n        ScrollView:\n            hints: {w: 0.475, h: 1}\n            scrollW: false\n            BodyLabel:\n                hints: {x:0, y:0, h:null,  w:1}\n                text: scoredetail2p.detail2\n                align: 'right'\n                valign: 'top'\n                wrap: true\n                fontSize: 0.5\n\n\n<Menu>:\n    id: 'mainMenu'\n    orientation: 'vertical'\n    hints: {center_x:0.5, center_y:0.5, h:null, w:0.8}\n    selection: '';\n    bgColor: resources['colors']['background']\n    paddingX: '0.01'\n    paddingY: '0.01'\n    spacingY: '0.01'\n    spacingX: '0.01'\n    MenuItem:\n        text: 'Restart Game'\n        on_press: \n            this.parent.selection = 'restartGame'\n    MenuItem:\n        text: 'Random Game'\n        on_press: \n            this.parent.selection = 'randomGame'\n    MenuItem:\n        text: 'Daily Challenge'\n        on_press: \n            this.parent.selection = 'dailyGame'\n    MenuItem:\n        text: 'Multiplayer'\n        on_press: \n            this.parent.selection = 'multiplayerMenu'\n    MenuItem:\n        text: 'Instructions'\n        on_press: \n            this.parent.selection = 'instructions'\n    MenuItem:\n        text: 'Leaderboards'\n        on_press: \n            this.parent.selection = 'leaderboardMenu'\n#    MenuItem:\n#        text: 'Achievements'\n#        on_press: \n#            this.parent.selection = 'achievements'\n#    MenuItem:\n#        text: 'Theme'\n#        on_press: \n#            this.parent.selection = 'theme'\n#    MenuItem:\n#        text: 'Quit'\n#        on_press: \n#            this.parent.selection = 'quit'\n\n\n<MultiplayerMenu>:\n    hints: {center_x:0.5, center_y:0.5, h:null, w:0.8}\n    id: 'multiplayerMenu'\n    orientation: 'vertical'\n    player1: 1\n    player2: 1\n    players: ['','Human', 'AI']\n    selection: ''\n    paddingX: '0.01'\n    paddingY: '0.01'\n    spacingY: '0.01'\n    spacingX: '0.01'\n    bgColor: resources['colors']['background']\n    MenuItem:\n        text: 'Start Game'\n        on_press:\n            this.parent.selection = 'multiplayerGame'\n    MenuItem:\n        text: multiplayerMenu.players[multiplayerMenu.player1]\n        on_press:\n            this.parent.selection = 'player1'\n    MenuItem:\n        text: multiplayerMenu.players[multiplayerMenu.player2]\n        on_press:\n            this.parent.selection = 'player2'\n\n\n<LeaderboardMenu>:\n    hints: {center_x:0.5, center_y:0.5, h:null, w:0.8}\n    orientation: 'vertical'\n    selection: ''\n    bgColor: resources['colors']['background']\n    paddingX: '0.01'\n    paddingY: '0.01'\n    spacingY: '0.01'\n    spacingX: '0.01'\n    MenuItem:\n        text: 'High Score'\n        on_press:\n            this.parent.selection = 'highScore'\n    MenuItem:\n        text: 'Daily Game High Score'\n        on_press:\n            this.parent.selection = 'dailyHighScore'\n    MenuItem:\n        text: 'Number of 1,000+ Games'\n        on_press:\n            this.parent.selection = 'number1000'\n";
async function loadWords(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const words2 = new Set(text.split("\n"));
    return words2;
  } catch (err) {
    console.error(`Error loading file: ${url}`, err);
    throw err;
  }
  return new Set("");
}
class Tile extends Widget {
  /**
   * 
   * @param {Board} board 
   * @param {number} x 
   * @param {number} y 
   * @param {string} letter 
   * @param {number} value 
   */
  constructor(board, x, y, letter, value) {
    super();
    this.hints = { w: null, h: null };
    this.children = [
      new Label({
        text: letter,
        color: (app) => app.colors["tile_letter_text"],
        fontSize: "0.8wh",
        hints: { x: 0, y: 0, w: 1, h: 1 }
      }),
      new Label({
        text: "" + value,
        color: (app) => app.colors["tile_letter_text"],
        fontSize: "0.8wh",
        hints: { x: 0.67, y: 0.67, w: 0.33, h: 0.33 }
      })
    ];
    this.bgColor = App.resources["colors"]["tile"];
    SlideWordsApp.get().bind("colors", (e, o, v) => {
      this.updateBgColor();
    });
    this.letter = letter;
    this.value = value;
    this.gposX = x;
    this.gposY = y;
    this.oposX = this.gposX;
    this.oposY = this.gposY;
    this.cposX = this.gposX;
    this.cposY = this.gposY;
    this.posOffset = new Vec2([0, 0]);
    [this.x, this.y] = this.gpos;
    this.board = board;
    this.selected = false;
  }
  draw(app, ctx) {
    super.draw(app, ctx);
  }
  on_letter(event, object, value) {
    this.children[0].text = value;
  }
  on_value(event, object, value) {
    this.children[1].text = "" + value;
  }
  updateBgColor() {
    let colors = App.resources["colors"];
    this.bgColor = this.selected ? colors["tile_selected"] : colors["tile"];
  }
  on_selected(event, object, value) {
    this.updateBgColor();
  }
  on_gpos(event, object, value) {
    if (this.cpos[0] === -1 && this.cpos[1] === -1) {
      this.opos = new Vec2(this.gpos);
      this.cpos = new Vec2(this.gpos);
    }
    const a = new WidgetAnimation();
    const p = this.board.gpos2pos(this.gpos);
    a.add({ x: p[0], y: p[1] }, 250);
    a.start(this);
  }
  /**@type {eskv.Widget['on_touch_down']} */
  on_touch_down(e, o, touch) {
    if (!this.board.activePlayer.localTouch()) {
      return false;
    }
    if (this.board.blockGposUpdates) {
      return false;
    }
    if (this.gpos.equals([-1, -1])) {
      return false;
    }
    if (this.collide(touch.rect)) {
      if (this.selected) {
        this.board.resetSelected();
        touch.ungrab();
      } else {
        this.board.candidates = this.board.getMoveCandidates(this);
        if (this.board.candidates.length > 0) {
          touch.grab(this);
          this.posOffset = new Vec2([touch.pos.x - this.pos.x, touch.pos.y - this.pos.y]);
        }
      }
      return true;
    }
    return false;
  }
  /**@type {eskv.Widget['on_touch_move']} */
  on_touch_move(e, o, touch) {
    if (!this.board.activePlayer.localTouch()) {
      return false;
    }
    if (touch.grabbed === this) {
      this.x = touch.pos.x - this.posOffset.x;
      this.y = touch.pos.y - this.posOffset.y;
      return true;
    }
    return false;
  }
  /**@type {eskv.Widget['on_touch_up']} */
  on_touch_up(e, o, touch) {
    if (!this.board.activePlayer.localTouch()) {
      return false;
    }
    if (touch.grabbed === this) {
      let gpos = this.board.pos2gpos(touch.pos);
      if (this.board.candidates.find((gp) => gp.equals(gpos))) {
        this.board.selectInPos(this, gpos);
      } else {
        this.gpos = this.opos;
      }
      this.pos = this.board.gpos2pos(this.gpos);
      this.board.candidates = [];
      touch.ungrab();
      return true;
    }
    return false;
  }
  // Getter and setter for gpos, opos, and cpos to trigger events
  get gpos() {
    return new Vec2([this.gposX, this.gposY]);
  }
  set gpos(value) {
    [this.gposX, this.gposY] = value;
    this.emit("gpos", value);
  }
  get opos() {
    return new Vec2([this.oposX, this.oposY]);
  }
  set opos(value) {
    [this.oposX, this.oposY] = value;
  }
  get cpos() {
    return new Vec2([this.cposX, this.cposY]);
  }
  set cpos(value) {
    [this.cposX, this.cposY] = value;
  }
}
class Board extends Widget {
  /**
   * 
   * @param {Set<string>} words 
   */
  constructor(words2) {
    super();
    __publicField(this, "gameOver", false);
    this.firstStart = true;
    this.updateProperties({});
    this.hints = { x: 0, y: 0, w: 1, h: 1 };
    this.words = words2;
    this.scorebar = new ScoreBar();
    this.wordbar = new WordBar();
    this.messagebar = new MessageBar();
    this.scorebar.bind("gameId", (e, o, v) => this.messagebar.gameChanged(o, v));
    this.scorebar.bind("players", (e, o, v) => this.messagebar.activePlayerChanged(o, v));
    this.scorebar.bind("score", (e, o, v) => this.updatePassBar());
    this.scorebar.bind("score_2", (e, o, v) => this.updatePassBar());
    this.scorebar.bind("activePlayer", (e, o, v) => this.messagebar.activePlayerChanged(o, v));
    this.scorebar.bind("touch_down", (e, o, v) => this.onTouchScore(o, v));
    this.wordbar.bind("touch_down", (e, o, v) => this.confirmWord(o, v));
    this.bind("gameOver", (e, o, v) => this.messagebar.gameOver(o, v));
    this.menu = new Menu();
    this.menu.bind("selection", (e, o, v) => this.menuChoice(o, v));
    this.menuButton = new Button({
      text: "MENU",
      bgColor: App.resources["colors"]["menu_button_background"],
      selectColor: App.resources["colors"]["menu_button_touched"],
      align: "center"
    });
    this.menuButton.bind("press", (e, o, v) => this.showMenu());
    this.multiplayerMenu = new MultiplayerMenu();
    this.multiplayerMenu.bind("selection", (e, o, v) => this.menuChoice(o, v));
    this.leaderboardMenu = new LeaderboardMenu();
    this.leaderboardMenu.bind("selection", (e, o, v) => this.menuChoice(o, v));
    this.tiles = /* @__PURE__ */ new Map();
    this.selection = [];
    this.candidates = [];
    this.addChild(this.scorebar);
    this.addChild(this.wordbar);
    this.addChild(this.messagebar);
    this.addChild(this.menuButton);
    this.block_gpos_updates = false;
    this.instructions = new Instructions();
    this.players = { 1: new Player(self, 1) };
    this.scoreDetail1p = new ScoreDetail1p();
    this.scoreDetail2p = new ScoreDetail2p();
    this.activePlayer = this.players[1];
    this.gameOver = false;
    this.consecutivePasses = 0;
    this.tileSpaceSize = 1;
    this.offX = 0;
    this.offY = 0;
    this.boardSize = boardDim;
    this.tileSpaceSize = 1;
    this.tileSize = 1;
    this.consecutivePasses = 0;
    let tile_set = [];
    for (let t of tiles) {
      for (let _ = 0; _ < t[2]; ++_) {
        tile_set.push([t[0], t[1] + 1]);
      }
    }
    this.initial_tile_positions = [];
    this.originalGps = this.initial_tile_positions.slice();
    const mid = Math.floor(boardDim / 2);
    for (let x = 0; x < boardDim; x++) {
      for (let y = 0; y < boardDim; y++) {
        if (x >= mid - 1 && x <= mid && y >= mid - 1 && y <= mid) continue;
        this.initial_tile_positions.push([x, y]);
      }
    }
    this.tileWidgets = [];
    for (let i = 0; i < this.initial_tile_positions.length; i++) {
      this.initial_tile_positions[i];
      let [l, v] = tile_set[i];
      let t = new Tile(this, -1, -1, l, v);
      this.addChild(t);
      this.tileWidgets.push(t);
    }
    this.first_start = true;
    this.ai = new AIPlayer(this, 2);
  }
  overlayShowing() {
    return this.children.includes(this.menu) || this.children.includes(this.multiplayerMenu) || this.children.includes(this.leaderboardMenu) || this.children.includes(this.instructions) || this.children.includes(this.scoreDetail1p) || this.children.includes(this.scoreDetail2p);
  }
  showLeaderboardMenu() {
    this.leaderboardMenu.selection = "";
    this.addChild(this.leaderboardMenu);
  }
  hide_leaderboard_menu() {
    if (this.children.includes(this.leaderboardMenu)) {
      this.removeChild(this.leaderboardMenu);
    }
  }
  showMenu() {
    this.menu.selection = "";
    this.menu.popup();
  }
  hideMenu() {
    this.menu.close();
    this.hide_leaderboard_menu();
  }
  menuChoice(menu, selection) {
    if (selection == "restartGame") {
      this.hideMenu();
      this.restartGame();
    } else if (selection == "randomGame") {
      this.hideMenu();
      this.newGame();
    } else if (selection == "dailyGame") {
      this.hideMenu();
      this.newDailyGame();
    } else if (selection == "multiplayerMenu") {
      this.hideMenu();
      this.multiplayerMenu.popup();
    } else if (selection == "instructions") {
      this.hideMenu();
      this.instructions.popup();
    } else if (selection == "leaderboardMenu") {
      this.hideMenu();
      this.leaderboardMenu.popup();
    } else if (selection == "achievements") {
      this.hideMenu();
    } else if (selection == "theme") {
      App.get().setNextTheme();
      this.hideMenu();
      this.showMenu();
    } else if (selection == "quit") {
      this.hideMenu();
    } else if (selection == "multiplayerGame") {
      this.multiplayerMenu.close();
      this.newMultiplayerGame();
    } else if (selection == "player1") {
      if (this.multiplayerMenu.player1 < Object.keys(playerTypes).length) {
        this.multiplayerMenu.player1 += 1;
      } else {
        this.multiplayerMenu.player1 = 1;
      }
    } else if (selection == "player2") {
      if (this.multiplayerMenu.player2 < Object.keys(playerTypes).length) {
        this.multiplayerMenu.player2 += 1;
      } else {
        this.multiplayerMenu.player2 = 1;
      }
    }
  }
  /**
   * 
   * @param {eskv.Vec2} pos 
   * @returns {eskv.Vec2}
   */
  pos2gpos(pos) {
    return new Vec2([Math.floor((pos[0] - this.offX) / this.tileSpaceSize), Math.floor((pos[1] - this.offY) / this.tileSpaceSize)]);
  }
  newGame() {
    this.activePlayer.abort();
    this.originalGps = this.initial_tile_positions.slice();
    setSeed(Date.now());
    shuffle(this.originalGps);
    this.players = {
      1: new Player(this, 1)
    };
    this.activePlayer = this.players[1];
    this.scorebar.setGameId();
    this.reset();
  }
  newDailyGame() {
    this.activePlayer.abort();
    const date = new Date(Date.now());
    setSeed(date.getUTCFullYear() * 1e3 + date.getUTCMonth() * 100 + date.getUTCDate());
    this.originalGps = this.initial_tile_positions.slice();
    shuffle(this.originalGps);
    const gameId = `d${date.getUTCFullYear()}${date.getUTCMonth()}${date.getUTCDate()}`;
    this.players = {
      1: new Player(this, 1)
    };
    this.activePlayer = this.players[1];
    this.scorebar.setGameId(gameId);
    this.reset();
  }
  newMultiplayerGame() {
    this.activePlayer.abort();
    this.originalGps = this.initial_tile_positions.slice();
    setSeed(Date.now());
    shuffle(this.originalGps);
    this.players = {
      1: new playerTypes[this.multiplayerMenu.player1](this, 1),
      2: new playerTypes[this.multiplayerMenu.player2](this, 2)
    };
    this.activePlayer = this.players[1];
    this.scorebar.setGameId("", true);
    this.reset();
  }
  restartGame() {
    this.activePlayer.abort();
    this.activePlayer = this.players[1];
    this.scorebar.activePlayer = 1;
    for (let p in this.players) {
      this.players[p].reset();
    }
    this.reset();
  }
  reset() {
    this.gameOver = false;
    this.consecutivePasses = 0;
    this.scorebar.score = 0;
    this.scorebar.score_2 = 0;
    this.wordbar.word = "";
    this.wordbar.wordScore = 0;
    this.selection = [];
    this.scoreDetail1p.reset(this.players);
    this.scoreDetail2p.reset(this.players);
    setTimeout(() => {
      this.resetTick(0);
    }, 1);
  }
  resetTick(i) {
    App.get().requestFrameUpdate();
    if (i === 0) {
      this.block_gpos_updates = true;
      this.tiles.clear();
    }
    const anim_count = 5;
    const anim_ind = Math.min(this.tileWidgets.length, i + anim_count);
    let j = i;
    while (j < anim_ind) {
      const t = this.tileWidgets[j];
      const gp = new Vec2(this.originalGps[j]);
      t.opos = gp;
      t.cpos = gp;
      t.gpos = gp;
      t.selected = false;
      this.setAtGpos(t.gpos, t);
      j += 1;
    }
    if (j < this.tileWidgets.length) {
      setTimeout(() => this.resetTick(j), 10);
    } else {
      this.block_gpos_updates = false;
      setTimeout(() => this.activePlayer.startTurn(), 10);
    }
  }
  /**
   * 
   * @param {eskv.Vec2} gpos 
   * @returns 
   */
  gpos2pos(gpos) {
    if (gpos[0] === -1 && gpos[1] === -1) {
      return new Vec2([this.size[0] / 2, this.size[1] * 1.2]);
    } else {
      return new Vec2([this.offX + this.tileSpaceSize * gpos[0], this.offY + this.tileSpaceSize * gpos[1]]);
    }
  }
  /**
   * Converts the vec2 position to an index into the map of `tiles`
   * @param {eskv.Vec2} gpos 
   * @returns 
   */
  _conv_pos(gpos) {
    return Math.floor(gpos[0]) * boardDim + Math.floor(gpos[1]);
  }
  /**
   * Recover the vec2 position from the `tiles` key value
   * @param {number} key 
   * @returns 
   */
  _unconv_pos(key) {
    return new Vec2([Math.floor(key / boardDim), key % boardDim]);
  }
  /**
   * 
   * @param {eskv.Vec2} gpos 
   * @param {Tile} value 
   */
  setAtGpos(gpos, value) {
    this.tiles.set(this._conv_pos(gpos), value);
  }
  /**
   * 
   * @param {eskv.Vec2} gpos 
   */
  getAtGpos(gpos) {
    return this.tiles.get(this._conv_pos(gpos));
  }
  /**
   * 
   * @param {eskv.Vec2} gpos 
   */
  deleteAtGpos(gpos) {
    this.tiles.delete(this._conv_pos(gpos));
  }
  /**
   * 
   * @param {eskv.Vec2} gpos 
   */
  has_at_gpos(gpos) {
    return this.tiles.has(this._conv_pos(gpos));
  }
  /**@type {eskv.Widget['layoutChildren']} */
  layoutChildren() {
    const boardDim$1 = boardDim;
    this.tileSpaceSize = 1;
    this.tileSize = this.tileSpaceSize * 0.99;
    this.boardSize = boardDim$1 * this.tileSpaceSize;
    this.offX = (this.size[0] - this.boardSize) / 2;
    this.offY = 2;
    this.menuButton.size = new Vec2([2, 1]);
    this.menuButton.pos = new Vec2([0, this.size[1] - 1]);
    this.messagebar.size = new Vec2([this.size[0], 1]);
    this.messagebar.pos = new Vec2([0, this.size[1] - 1]);
    this.wordbar.size = new Vec2([this.size[0] * 3 / 4, 0.8]);
    this.wordbar.pos = new Vec2([this.size[0] / 8, this.size[1] - 1.9 - (this.size[1] - this.boardSize - 4) / 2]);
    this.scorebar.size = new Vec2([this.size[0], 2]);
    this.scorebar.pos = new Vec2([0, 0]);
    this.tileWidgets.forEach((tile) => {
      tile.pos = this.gpos2pos(tile.gpos);
      tile.size = new Vec2([this.tileSize, this.tileSize]);
    });
    super.layoutChildren();
    if (this.firstStart) {
      this.firstStart = false;
      try {
        if (!this.loadState()) {
          this.newGame();
        }
      } catch (error) {
        this.newGame();
      }
      window.onbeforeunload = () => SlideWordsApp.get().onStop();
    }
  }
  /**@type {eskv.Widget['draw']} */
  draw(app, ctx) {
    ctx.clearRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = background;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = checker;
    for (let x = 0; x < boardDim; x++) {
      for (let y = 0; y < boardDim; y++) {
        if ((x + y) % 2 === 0) {
          ctx.fillRect(
            this.offX + x * this.tileSpaceSize,
            this.offY + y * this.tileSpaceSize,
            this.tileSpaceSize,
            this.tileSpaceSize
          );
        }
      }
    }
    const candidates = this.candidates;
    if (candidates !== null) {
      ctx.fillStyle = moveCandidates;
      candidates.forEach((c) => {
        let [x, y] = c;
        ctx.fillRect(
          this.offX + x * this.tileSpaceSize + this.tileSpaceSize / 4,
          this.offY + y * this.tileSpaceSize + this.tileSpaceSize / 4,
          this.tileSize / 2,
          this.tileSize / 2
        );
      });
    }
  }
  /**
   * 
   * @param {Tile} tile 
   * @param {eskv.Vec2} gpos 
   * @returns 
   */
  selectInPos(tile, gpos) {
    this.deleteAtGpos(tile.gpos);
    tile.gpos = gpos;
    this.setAtGpos(gpos, tile);
    this.selection.push(tile.gpos);
    tile.selected = true;
    this.updateWordBar();
    return true;
  }
  updateWordBar() {
    this.updatePassBar();
    const res = this.isSelectionAWord();
    this.wordbar.word = res.word;
    this.wordbar.wordScore = res.value;
  }
  updatePassBar() {
    this.wordbar.canPass = !this.gameOver && this.activePlayer.localTouch() && this.scorebar.players !== 1;
  }
  resetSelected() {
    this.block_gpos_updates = true;
    const sel = [];
    for (var i = 0; i < this.selection.length; i++) {
      var gp = this.selection[i];
      sel.push(this.getAtGpos(gp));
      this.deleteAtGpos(gp);
    }
    for (let t of sel) {
      if (t instanceof Tile && t.selected) {
        t.gpos = t.opos;
        t.selected = false;
        this.setAtGpos(t.gpos, t);
      }
    }
    this.block_gpos_updates = false;
    this.wordbar.word = "";
    this.wordbar.wordScore = 0;
    this.selection = [];
    this.candidates = [];
    this.updatePassBar();
  }
  getMoveCandidates(tile) {
    const candidates = [new Vec2(tile.gpos)];
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1]
    ];
    directions.forEach((direction) => {
      let gp = new Vec2([tile.gpos[0] + direction[0], tile.gpos[1] + direction[1]]);
      while (gp[0] >= 0 && gp[0] < boardDim && gp[1] >= 0 && gp[1] < boardDim) {
        if (!this.tiles.has(this._conv_pos(gp))) {
          candidates.push(new Vec2(gp));
        } else {
          break;
        }
        gp = new Vec2([gp[0] + direction[0], gp[1] + direction[1]]);
      }
    });
    const selCandidates = this.getSelectionLineCandidates();
    if (selCandidates !== null) {
      const icandidates = candidates.filter((c) => selCandidates.some((sc) => sc[0] === c[0] && sc[1] === c[1]));
      return icandidates;
    } else {
      return candidates;
    }
  }
  getSelectionLineCandidates() {
    const candidates = [];
    if (this.selection.length === 0) {
      return null;
    }
    if (this.selection.length === 1) {
      const s = this.selection[0];
      const directions = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1]
      ];
      directions.forEach((direction) => {
        let gp = [s[0] + direction[0], s[1] + direction[1]];
        while (gp[0] >= 0 && gp[0] < boardDim && gp[1] >= 0 && gp[1] < boardDim) {
          candidates.push(gp.slice());
          gp = [gp[0] + direction[0], gp[1] + direction[1]];
        }
      });
      return candidates;
    }
    if (this.selection.length >= 2) {
      const start = this.selection[0];
      const end = this.selection[this.selection.length - 1];
      const dx = Math.sign(end[0] - start[0]);
      const dy = Math.sign(end[1] - start[1]);
      const directionPairs = [[dx, dy], [-dx, -dy]];
      directionPairs.forEach(([dx2, dy2]) => {
        let gp = start.slice();
        while (gp[0] >= 0 && gp[0] < boardDim && gp[1] >= 0 && gp[1] < boardDim) {
          candidates.push(gp.slice());
          gp = [gp[0] + dx2, gp[1] + dy2];
        }
      });
      return candidates;
    }
    return null;
  }
  isSelectionAWord() {
    let hasMove = false;
    let sumValue = 0;
    let candidate = "";
    const sel = this.selection.sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);
    const start = sel[0];
    const end = sel[sel.length - 1];
    const dx = Math.sign(end[0] - start[0]);
    const dy = Math.sign(end[1] - start[1]);
    for (let i = 0; i < sel.length; i++) {
      const s = sel[i];
      if (s[0] !== start[0] + i * dx || s[1] !== start[1] + i * dy) {
        return { word: "", value: 0 };
      }
      const t = this.getAtGpos(s);
      if (t) {
        candidate += t.letter;
        sumValue += t.value;
        hasMove = hasMove || (t.gpos[0] !== t.opos[0] || t.gpos[1] !== t.opos[1]);
      }
    }
    if (!hasMove) {
      return { word: "", value: 0 };
    }
    if (this.words.has(candidate)) {
      return { word: candidate, value: sumValue * candidate.length };
    }
    const reversedCandidate = candidate.split("").reverse().join("");
    if (this.words.has(reversedCandidate)) {
      return { word: reversedCandidate, value: sumValue * candidate.length };
    }
    return { word: "", value: 0 };
  }
  confirmWord(widget, touch) {
    if (!this.activePlayer.localTouch()) {
      return false;
    }
    if (!widget.collide(touch.rect)) {
      return false;
    }
    if (this.wordbar.wordScore === 0 && !this.wordbar.canPass) {
      return false;
    }
    this.endTurn();
    return true;
  }
  endTurn() {
    const passTurn = this.selection.length === 0;
    const word = this.wordbar.word;
    const score = this.wordbar.wordScore;
    if (passTurn && this.wordbar.canPass) {
      this.consecutivePasses++;
    } else {
      this.consecutivePasses = 0;
    }
    if (this.scorebar.activePlayer === 1) {
      this.scorebar.score += this.wordbar.wordScore;
    } else {
      this.scorebar.score_2 += this.wordbar.wordScore;
    }
    this.wordbar.word = "";
    this.wordbar.wordScore = 0;
    this.selection.forEach((s) => {
      const t = this.getAtGpos(s);
      this.deleteAtGpos(s);
      if (t) {
        t.selected = false;
        t.gpos = new Vec2([-1, -1]);
      }
    });
    this.selection = [];
    if (this.scorebar.players === 2) {
      this.scoreDetail2p.add(this.players, this.scorebar.activePlayer, word, score);
    } else {
      this.scoreDetail1p.add(this.players, word, score);
    }
    if (this.consecutivePasses === this.scorebar.players) {
      this.gameOver = true;
      this.updatePassBar();
      this.scoreDetail1p.title = "Game Over";
      this.scoreDetail2p.title = "Game Over";
      this.showScoreSummary();
    } else {
      if (this.scorebar.players === 2) {
        this.scorebar.activePlayer = 3 - this.scorebar.activePlayer;
        this.activePlayer = this.players[this.scorebar.activePlayer];
      }
      this.updatePassBar();
      this.activePlayer.startTurn();
    }
  }
  onTouchScore(scoreBar, touch) {
    if (this.scorebar.collide(touch.rect)) {
      this.showScoreSummary();
      return true;
    }
    return false;
  }
  showScoreSummary() {
    if (this.overlayShowing()) {
      return;
    }
    if (Object.keys(this.players).length === 2) {
      this.scoreDetail2p.popup();
    } else {
      this.scoreDetail1p.popup();
    }
  }
  loadState() {
    const gameDataString = localStorage.getItem("SlideWordsApp/GameState");
    if (!gameDataString) {
      return false;
    }
    const game = JSON.parse(gameDataString);
    const gridData = game.gridData;
    if (gridData.length !== this.tileWidgets.length) {
      console.info("Bad game data");
      localStorage.removeItem("SlideWordsApp/GameState");
      return false;
    }
    console.info("Loading game data");
    try {
      this.scorebar.players = game.players;
    } catch (error) {
      this.scorebar.players = 1;
    }
    if (this.scorebar.players === 1) {
      this.selection = game["selection"];
      this.wordbar.wordScore = game["wordScore"];
      this.wordbar.word = game["word"];
      this.scorebar.setGameId(game["highScoreId"]);
      this.scorebar.score = game["score"];
      this.scorebar.activePlayer = 1;
      this.players = { 1: new Player(this, 1) };
      this.scoreDetail1p.setScoreData(game["scoreData"]);
    } else {
      this.selection = [];
      this.wordbar.wordScore = 0;
      this.wordbar.word = "";
      this.scorebar.score = game["score"];
      this.scorebar.score_2 = game["score_2"];
      this.scorebar.activePlayer = game["activePlayer"];
      const [p1type, p2type] = game["ptypes"];
      this.players = {
        1: new playerTypes[p1type](self, 1),
        2: new playerTypes[p2type](self, 2)
      };
      this.scoreDetail2p.setScoreData(game["scoreData1"], game["scoreData2"]);
    }
    this.blockGposUpdates = true;
    this.originalGps = game["originalGps"];
    this.tiles.clear();
    this.children = this.children.filter((widget) => !(widget instanceof Tile));
    this.tileWidgets = [];
    for (const t of gridData) {
      const tile = new Tile(this, 0, 0, t.letter, t.value);
      this.addChild(tile);
      tile.gpos = new Vec2(t.gpos);
      tile.opos = new Vec2(t.opos);
      tile.cpos = new Vec2(t.cpos);
      tile.selected = t.selected;
      this.tileWidgets.push(tile);
      if (tile.gpos[0] !== -1 && tile.gpos[1] !== -1) {
        this.setAtGpos(t.gpos, tile);
      }
    }
    this.blockGposUpdates = false;
    this._needsLayout = true;
    this.activePlayer = this.players[this.scorebar.activePlayer];
    if (this.scorebar.players === 2) {
      this.activePlayer.startTurn();
    }
    return true;
  }
  saveState() {
    if (this.gameOver) {
      localStorage.removeItem("SlideWordsApp/GameState");
      return;
    }
    const gridData = this.tileWidgets.map((t) => {
      return {
        letter: t.letter,
        value: t.value,
        selected: t.selected,
        gpos: Array.from(t.gpos),
        cpos: Array.from(t.cpos),
        opos: Array.from(t.opos)
      };
    });
    const version = 1;
    let data = {
      version,
      // Assuming __version__ is defined somewhere globally or in this context
      gridData,
      originalGps: this.originalGps,
      selection: this.selection,
      word: this.wordbar.word,
      wordScore: this.wordbar.wordScore,
      players: this.scorebar.players,
      score: this.scorebar.score
    };
    if (this.scorebar.players === 1) {
      data.highScoreId = this.scorebar.gameId;
      data.scoreData = this.scoreDetail1p.scoreData;
    } else {
      data.activePlayer = this.scorebar.activePlayer;
      data.score_2 = this.scorebar.score_2;
      data.scoreData1 = this.scoreDetail2p.scoreData1;
      data.scoreData2 = this.scoreDetail2p.scoreData2;
      data.ptypes = [this.players[1].type, this.players[2].type];
    }
    localStorage.setItem("SlideWordsApp/GameState", JSON.stringify(data));
    console.log("Saved game data");
  }
}
class Instructions extends ModalView {
  constructor(props = {}) {
    super();
    this.mScrollView = null;
    this.updateProperties(props);
  }
}
App.registerClass("Instructions", Instructions, "ModalView");
class ScoreDetail1p extends ModalView {
  constructor() {
    super();
    this.updateProperties({});
    this.reset();
  }
  reset(players) {
    this.scoreData = [];
    this.title = "Start of the Game";
    this.detail = "SCORE: 0";
  }
  setScoreData(players, scoreData) {
    this.scoreData = scoreData;
    this.updateText(players);
  }
  add(players, word, score) {
    if (word === "" && score === 0) {
      word = "<PASS>";
    }
    this.scoreData.push([word, score]);
    this.updateText(players);
  }
  updateText(players) {
    if (this.scoreData) {
      this.title = `Turn ${this.scoreData.length + 1}`;
      const total = this.scoreData.reduce((acc, item) => acc + item[1], 0);
      let detail = `SCORE: ${total}

`;
      detail += this.scoreData.map((item, index) => `${item[1]} ${item[0]}`).join("\n");
      this.detail = detail;
    }
  }
}
App.registerClass("ScoreDetail1p", ScoreDetail1p, "ModalView");
class ScoreDetail2p extends ModalView {
  constructor() {
    super();
    this.updateProperties({});
    this.reset({});
  }
  reset(players) {
    this.scoreData1 = [];
    this.scoreData2 = [];
    this.title = "Start of the Game";
    const pname1 = 1 in players ? players[1].name !== "HUMAN" ? players[1].name : "PLAYER 1" : "UNKNOWN";
    this.detail1 = `${pname1}: 0`;
    const pname2 = 2 in players ? players[2].name !== "HUMAN" ? players[2].name : "PLAYER 2" : "UNKNOWN";
    this.detail2 = `${pname2}: 0`;
  }
  setScoreData(players, scoreData1, scoreData2) {
    this.scoreData1 = scoreData1;
    this.scoreData2 = scoreData2;
    this.updateText(players);
  }
  add(players, player, word, score) {
    if (word === "" && score === 0) {
      word = "<PASS>";
    }
    if (player === 1) {
      this.scoreData1.push([word, score]);
    } else if (player === 2) {
      this.scoreData2.push([word, score]);
    }
    this.updateText(players);
  }
  updateText(players) {
    if (!this.scoreData2) return;
    this.title = `Turn ${this.scoreData2.length + 1}`;
    const total1 = this.scoreData1.reduce((acc, item) => acc + item[1], 0);
    const pname1 = players[1] ? players[1].name !== "HUMAN" ? players[1].name : "PLAYER 1" : "UNKNOWN";
    let detail1 = `${pname1}: ${total1}

`;
    detail1 += this.scoreData1.map((item) => `${item[1]} ${item[0]}`).join("\n");
    this.detail1 = detail1;
    const total2 = this.scoreData2.reduce((acc, item) => acc + item[1], 0);
    const pname2 = players[2] ? players[2].name !== "HUMAN" ? players[2].name : "PLAYER 2" : "UNKNOWN";
    let detail2 = `${pname2}: ${total2}

`;
    detail2 += this.scoreData2.map((item) => `${item[0]} ${item[1]}`).join("\n");
    this.detail2 = detail2;
  }
}
App.registerClass("ScoreDetail2p", ScoreDetail2p, "ModalView");
class Menu extends ModalView {
  constructor(props = {}) {
    super();
    this.selection = "";
    this.updateProperties(props);
  }
}
App.registerClass("Menu", Menu, "ModalView");
class MultiplayerMenu extends ModalView {
  constructor() {
    super();
    this.selection = "";
    this.player1 = 0;
    this.player2 = 0;
    this.updateProperties({});
    this.players = playerNames;
  }
}
App.registerClass("MultiplayerMenu", MultiplayerMenu, "ModalView");
class LeaderboardMenu extends ModalView {
  constructor() {
    super();
    this.selection = "";
    this.players = ["", "Player 1", "Player 2"];
    this.updateProperties({});
  }
}
App.registerClass("LeaderboardMenu", LeaderboardMenu, "ModalView");
class ScoreBar extends BoxLayout {
  constructor(props = {}) {
    super();
    this.score = 0;
    this.score_2 = 0;
    this.hiScore = 0;
    this.gameId = "";
    this.players = 0;
    this.activePlayer = 0;
    this.store = this.getStore();
    this.bind("score", (e, o, v) => this.scoreChanged());
    this.setGameId();
    this.updateProperties(props);
  }
  getStore() {
    const scores = localStorage.getItem("SlideWordsApp/scores");
    return scores ? JSON.parse(scores) : {};
  }
  setStore(key, value) {
    const scores = this.getStore();
    scores[key] = value;
    localStorage.setItem("SlideWordsApp/scores", JSON.stringify(scores));
  }
  setGameId(gameId = "default", multiplayer = false) {
    this.players = (multiplayer ? 1 : 0) + 1;
    this.activePlayer = 1;
    this.gameId = gameId;
    if (this.players === 1) {
      const data = this.store[this.gameId];
      this.hiScore = data ? data.highScore : 0;
    }
  }
  scoreChanged() {
    if (this.players === 2) return;
    if (this.gameId !== "default") {
      const date = /* @__PURE__ */ new Date();
      const gameDate = `d${date.getUTCFullYear()}${date.getUTCMonth()}${date.getUTCDate()}`;
      if (this.gameId !== gameDate) {
        this.setGameId();
      } else {
        let hiScore = 0;
        if ("default" in this.store) {
          hiScore = this.store["default"].highScore || 0;
        }
        if (this.score > hiScore) {
          this.setStore("default", { highScore: this.score });
        }
      }
    }
    if (this.score > this.hiScore) {
      this.hiScore = this.score;
      this.setStore(this.gameId, { highScore: this.score });
    }
  }
}
App.registerClass("ScoreBar", ScoreBar, "BoxLayout");
class WordBar extends BoxLayout {
  constructor(props = {}) {
    super();
    __publicField(this, "word", "");
    __publicField(this, "wordScore", 0);
    __publicField(this, "canPass", false);
    if (props) this.updateProperties(props);
    this.wWordLabel = this.findById("wordLabel");
  }
}
App.registerClass("WordBar", WordBar, "BoxLayout");
class MessageBar extends BoxLayout {
  constructor(props = {}) {
    super();
    this.message = "";
    this.updateProperties(props);
  }
  activePlayerChanged(scoreBar, activePlayer) {
    if (scoreBar.players === 2) {
      this.message = `PLAYER ${scoreBar.activePlayer}'S TURN`;
    }
  }
  gameOver(board, gameOver) {
    if (gameOver) {
      if (board.scorebar.players === 2) {
        if (board.scorebar.score_2 === board.scorebar.score) {
          this.message = "DRAW!";
        } else {
          const winner = board.scorebar.score_2 > board.scorebar.score ? 2 : 1;
          if (board.players[winner].type === 1) {
            this.message = `PLAYER ${winner} WINS!`;
          } else {
            this.message = `${board.players[winner].name} WINS!`;
          }
        }
      } else {
        this.message = "GAME OVER";
      }
    } else {
      this.message = "";
    }
  }
  gameChanged(scoreBar, gameId) {
    if (scoreBar.players === 2) return;
    this.gameId = gameId;
    if (gameId !== "default") {
      const now = /* @__PURE__ */ new Date();
      const nextDate = new Date(now);
      nextDate.setUTCHours(24, 0, 0, 0);
      const delta = (nextDate.valueOf() - now.valueOf()) / 1e3;
      if (delta > 0) {
        const hours = Math.floor(delta / 3600);
        const minutes = Math.floor(delta % 3600 / 60);
        const seconds = delta % 60;
        if (hours > 0) {
          this.message = `${hours} HOUR${hours > 1 ? "S" : ""} LEFT`;
          setTimeout(() => this.onDailyChallengeTimer(gameId), hours * 36e5);
        } else if (minutes > 0) {
          this.message = `${minutes} MINUTE${minutes > 1 ? "S" : ""} LEFT`;
          setTimeout(() => this.onDailyChallengeTimer(gameId), minutes * 6e4);
        } else {
          this.message = `${seconds} SECOND${seconds > 1 ? "S" : ""} LEFT`;
          setTimeout(() => this.onDailyChallengeTimer(gameId), seconds * 1e3);
        }
      } else {
        this.message = "THE DAILY CHALLENGE HAS EXPIRED";
      }
    } else {
      this.message = "";
    }
  }
  onDailyChallengeTimer(gameId) {
    if (gameId === this.gameId) {
      this.gameChanged(null, gameId);
    }
  }
}
App.registerClass("MessageBar", MessageBar, "BoxLayout");
class SlideWordsApp extends App {
  constructor(props = {}) {
    var _a;
    super();
    __publicField(this, "prefDimH", 14);
    __publicField(this, "prefDimW", 10);
    parse(markup);
    this.updateProperties(props);
    this.config = /* @__PURE__ */ new Map();
    this.colors = {};
    this.words = words;
    try {
      this.colors = loadTheme((_a = this.config.get("theme")) != null ? _a : "default");
    } catch (error) {
      this.colors = loadTheme("default");
    }
    App.resources["colors"] = this.colors;
    this.gb = new Board(words);
    this.baseWidget.addChild(this.gb);
  }
  static get() {
    if (!App.appInstance) App.appInstance = new SlideWordsApp();
    return App.appInstance;
  }
  setNextTheme() {
    var _a;
    const themes$1 = Object.keys(themes);
    const currentTheme = (_a = this.config.get("theme")) != null ? _a : "theme";
    const ind = themes$1.indexOf(currentTheme);
    const newTheme = themes$1[(ind + 1) % themes$1.length];
    localStorage.setItem("SlideWords/theme", newTheme);
    this.colors = loadTheme(newTheme);
    App.resources["colors"] = this.colors;
  }
  buildConfig(config) {
    config.setDefaults("theme", { "theme": "beach" });
  }
  on_key_down(event, object, keyInfo) {
    if ("Escape" in keyInfo.states && keyInfo.states["Escape"]) {
      if (!this.gb) return;
      if (this.gb.scoreDetail1p.visible) {
        this.gb.scoreDetail1p.close();
      } else if (this.gb.scoreDetail2p.visible) {
        this.gb.scoreDetail2p.close();
      } else if (this.gb.instructions.visible) {
        this.gb.instructions.close();
      } else if (this.gb.multiplayerMenu.visible) {
        this.gb.multiplayerMenu.close();
      } else if (this.gb.leaderboardMenu.visible) {
        this.gb.leaderboardMenu.close();
      } else if (!this.gb.menu.visible) {
        this.gb.showMenu();
      } else {
        this.gb.hideMenu();
      }
      return true;
    }
    return false;
  }
  onStop() {
    if (!this.gb) return;
    this.gb.saveState();
    if (this.gb.activePlayer) {
      this.gb.activePlayer.abort();
    }
  }
}
var words;
loadWords(urlWords).then((result) => {
  words = result;
  SlideWordsApp.get().start();
});
