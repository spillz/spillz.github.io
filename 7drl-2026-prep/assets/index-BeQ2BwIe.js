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
function splitmix64(seed) {
  let state = BigInt(seed) & 0xFFFFFFFFFFFFFFFFn;
  return function next() {
    state = state + 0x9E3779B97F4A7C15n & 0xFFFFFFFFFFFFFFFFn;
    let z = state;
    z = (z ^ z >> 30n) * 0xBF58476D1CE4E5B9n & 0xFFFFFFFFFFFFFFFFn;
    z = (z ^ z >> 27n) * 0x94D049BB133111EBn & 0xFFFFFFFFFFFFFFFFn;
    z = z ^ z >> 31n;
    return z;
  };
}
class PRNG {
  constructor() {
    __publicField(this, "_seed", 0);
  }
  /**
   * Generate pseudo random number in the interval [0,1)
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
    throw new Error("Seeding is not available in the default PRNG class. You can set another with `eskv.rand.setPRNG`.");
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
function sfc32(a2, b, c, d) {
  return function() {
    a2 >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    var t = a2 + b | 0;
    a2 = b ^ b >>> 9;
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
    const sm = splitmix64(this.xorSeed);
    this.random = sfc32(sm(), sm(), sm(), sm());
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
   * Returns a new Vec2 with values floored to nearest integer below
   * @returns 
   */
  floor() {
    return new Vec2([Math.floor(this[0]), Math.floor(this[1])]);
  }
  /**
   * Returns a new Vec2 with values shift to nearest integer above
   * @returns 
   */
  ceil() {
    return new Vec2([Math.ceil(this[0]), Math.ceil(this[1])]);
  }
  /**
   * Returns a scaled copy of this vector
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
   * @param {Array<number>} vec - array like to element-wise divide this vector by
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
   * Expresses a vector `pos` as a proportion of a length `sz`. Functions as shift and transform
   * @param {Vec2} pos 
   * @param {number} sz 
   * @returns {Vec2}
   */
  relativeToPS(pos, sz) {
    return this.sub(pos).scale(1 / sz);
  }
  /**
   * Scales a vector `pos` in proportional to the length `sz`. Functions as transform and shift
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
  /**
   * 
   * @param {VecLike} tileDim 
   * @param {Grid2D|number[]|undefined} initialData 
   */
  constructor(tileDim = [0, 0], initialData = void 0) {
    if (initialData === void 0) {
      super(tileDim[0] * tileDim[1]);
    } else {
      super(...initialData);
    }
    this.tileDim = new Vec2(tileDim);
    this.hidden = false;
    this._cacheData = null;
  }
  clone() {
    return new Grid2D(this.tileDim, this);
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
   * Iterate integer grid cells on the line from `pos1` to `pos2` (inclusive).
   * Uses Bresenham so yielded coordinates are valid tile indices.
   * @param {VecLike} pos1
   * @param {VecLike} pos2
   * @yields {[number, number]}
   */
  *iterLineCells(pos1, pos2) {
    let x0 = Math.round(pos1[0]);
    let y0 = Math.round(pos1[1]);
    const x1 = Math.round(pos2[0]);
    const y1 = Math.round(pos2[1]);
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      if (x0 >= 0 && x0 < this.tileDim[0] && y0 >= 0 && y0 < this.tileDim[1]) {
        yield (
          /** @type {[number, number]} */
          [x0, y0]
        );
      }
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
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
   * @param {boolean} [diagonal=false]  
   */
  *iterAdjacent(pos, diagonal = false) {
    pos = new Vec2(pos);
    const dirs = diagonal ? [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]] : [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (let dir of dirs) {
      const npos = pos.add(dir);
      if (npos[0] >= 0 && npos[0] < this.tileDim[0] && npos[1] >= 0 && npos[1] < this.tileDim[1]) yield npos;
    }
  }
  /**
   * Iterate over the four orthogonally adjacent positions
   * @param {VecLike} pos 
   * @param {number[]} types 
   * @param {boolean} diagonal
   */
  hasAdjacent(pos, types, diagonal = false) {
    for (let npos of this.iterAdjacent(pos, diagonal)) {
      if (types.includes(this.get(npos))) return true;
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
const minFontSize$1 = 8;
const scaleFactor$1 = 48 * (1 / window.devicePixelRatio || 1);
function sizeText(ctx, text, size, fontName, centered, rect, color, paddingRatio = 1) {
  let scale = 1;
  if (size < minFontSize$1) {
    scale = 1 / scaleFactor$1;
    ctx.save();
    ctx.scale(scale, scale);
  }
  ctx.fillStyle = color;
  ctx.font = (size >= minFontSize$1 ? size : Math.ceil(size / scale)) + "px " + fontName;
  rect.x;
  let w = scale * ctx.measureText(text).width;
  if (size < minFontSize$1) ctx.restore();
  return [w, (1 + paddingRatio) * size];
}
function getTextData(ctx, text, size, fontName, halign, valign, rect, color) {
  let scale = 1;
  if (size < minFontSize$1) {
    scale = 1 / scaleFactor$1;
    ctx.save();
    ctx.scale(scale, scale);
  }
  ctx.fillStyle = color;
  ctx.font = (size >= minFontSize$1 ? size : Math.ceil(size / scale)) + "px " + fontName;
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
  if (size < minFontSize$1) ctx.restore();
  return textData;
}
function drawText(ctx, textData, color = null) {
  let scale = 1;
  let size = textData.size;
  if (color == null) color = textData.color;
  if (size < minFontSize$1) {
    scale = 1 / scaleFactor$1;
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
  ctx.font = (size >= minFontSize$1 ? size : Math.ceil(size / scale)) + "px " + textData.fontName;
  let [t, x, y] = textData.outText[0];
  ctx.fillText(t, x, y);
  if (size < minFontSize$1) ctx.restore();
}
function sizeWrappedText(ctx, text, size, fontName, centered, rect, color, wordwrap = true, paddingRatio = 1) {
  if (!text) return [rect.w, size];
  let scale = 1;
  if (size < minFontSize$1) {
    scale = 1 / scaleFactor$1;
    ctx.save();
    ctx.scale(scale, scale);
  }
  ctx.font = (size >= minFontSize$1 ? size : Math.ceil(size / scale)) + "px " + fontName;
  let h = 0;
  let paraText = "";
  let guess = Math.min(
    Math.max(1, Math.ceil(text.length * (rect.w / (ctx.measureText(text).width || 1)) / scale)),
    text.length
  );
  while (text !== "" || paraText !== "") {
    if (paraText === "") {
      const n = text.indexOf("\n");
      if (n >= 0) {
        paraText = text.slice(0, n);
        text = text.slice(n + 1);
      } else {
        paraText = text;
        text = "";
      }
    }
    guess = Math.max(1, Math.min(guess, paraText.length));
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
      if (w > rect.w) guess--;
    }
    if (wordwrap && guess > 0) {
      const lastChar = nextLine.at ? nextLine.at(-1) ?? "" : nextLine[nextLine.length - 1] ?? "";
      const nextChar = guess < paraText.length ? paraText[guess] : " ";
      const isSpace = (c) => c === " " || c === "	";
      if (!isSpace(lastChar) && !isSpace(nextChar)) {
        const lastSpace = Math.max(nextLine.lastIndexOf(" "), nextLine.lastIndexOf("	"));
        if (lastSpace >= 0) {
          guess -= nextLine.length - lastSpace - 1;
        }
      }
    }
    guess = Math.max(1, guess);
    nextLine = paraText.slice(0, guess);
    paraText = paraText.slice(guess);
    if (wordwrap) paraText = paraText.trimStart();
    h += size * paddingRatio;
    guess = Math.min(guess, Math.max(1, paraText.length));
  }
  h += size * (1 + paddingRatio);
  if (size < minFontSize$1) ctx.restore();
  return [rect.w, h];
}
function getWrappedTextData(ctx, text, size, fontName, halign, valign, rect, color, wordwrap = true) {
  let scale = 1;
  if (size < minFontSize$1) {
    scale = 1 / scaleFactor$1;
    ctx.save();
    ctx.scale(scale, scale);
  }
  ctx.fillStyle = color;
  ctx.font = (size >= minFontSize$1 ? size : Math.ceil(size / scale)) + "px " + fontName;
  let y = rect.y;
  const outText = [];
  let paraText = "";
  const totalW = ctx.measureText(text).width || 1;
  let guess = Math.min(
    Math.max(1, Math.ceil(text.length * (rect.w / totalW / scale))),
    Math.max(1, text.length)
  );
  while (text !== "" || paraText !== "") {
    if (paraText === "") {
      const n = text.indexOf("\n");
      if (n >= 0) {
        paraText = text.slice(0, n);
        text = text.slice(n + 1);
      } else {
        paraText = text;
        text = "";
      }
    }
    guess = Math.max(1, Math.min(guess, paraText.length));
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
      if (w > rect.w) guess--;
    }
    if (wordwrap && guess < paraText.length && guess > 0) {
      const lastChar = nextLine.at ? nextLine.at(-1) ?? "" : nextLine[nextLine.length - 1] ?? "";
      const nextChar = guess < paraText.length ? paraText[guess] : " ";
      const isSpace = (c) => c === " " || c === "	";
      if (!isSpace(lastChar) && !isSpace(nextChar)) {
        const lastSpace = Math.max(nextLine.lastIndexOf(" "), nextLine.lastIndexOf("	"));
        if (lastSpace >= 0) {
          guess -= nextLine.length - lastSpace - 1;
        }
      }
    }
    guess = Math.max(1, Math.min(guess, paraText.length));
    nextLine = paraText.slice(0, guess);
    paraText = paraText.slice(guess);
    if (wordwrap) paraText = paraText.trimStart();
    w = scale * ctx.measureText(nextLine).width;
    let x = rect.x;
    switch (halign) {
      case "center":
        x += (rect.w - w) / 2;
        break;
      case "right":
        x += rect.w - w;
        break;
    }
    outText.push([nextLine, x / scale, y / scale]);
    y += size;
    guess = Math.min(guess, Math.max(1, paraText.length));
  }
  const h = y - rect.y;
  let off = 0;
  switch (valign) {
    case "middle":
      off = (rect.h - h) / 2 + size / 2;
      break;
    case "bottom":
      off = rect.h - h + size;
      break;
    case "top":
    default:
      off = 0;
      break;
  }
  const textData = {
    size,
    fontName,
    outText,
    off: off / scale,
    color,
    valign
  };
  if (size < minFontSize$1) ctx.restore();
  return textData;
}
function drawWrappedText(ctx, textData, color = null) {
  let scale = 1;
  let size = textData.size;
  if (color === null) color = textData.color;
  if (size < minFontSize$1) {
    scale = 1 / scaleFactor$1;
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
  ctx.font = (size >= minFontSize$1 ? size : Math.ceil(size / scale)) + "px " + textData.fontName;
  for (let tdat of textData.outText) {
    ctx.fillText(tdat[0], tdat[1], tdat[2] + (textData.off ?? 0));
  }
  if (size < minFontSize$1) {
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
    let a2 = new MathArray(size);
    for (let i = 0; i < a2.length; i++) a2[i] = randomFloat(low, high);
    return a2;
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
    let a2 = new MathArray(this);
    if (arr2 instanceof Array) {
      for (let i = 0; i < this.length; i++) {
        a2[i] += arr2[i];
      }
    } else {
      for (let i = 0; i < this.length; i++) {
        a2[i] += arr2;
      }
    }
    return a2;
  }
  /**
   * Element-wise multiplication
   * @param {number[]} arr2 
   * @returns 
   */
  mul(arr2) {
    let a2 = new MathArray(this);
    if (arr2 instanceof Array) {
      for (let i = 0; i < this.length; i++) {
        a2[i] *= arr2[i];
      }
    } else {
      for (let i = 0; i < this.length; i++) {
        a2[i] *= arr2;
      }
    }
    return a2;
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
    let a2 = new MathArray();
    for (let i = -k; i < this.length - k; i++) {
      if (i < 0 || i >= this.length) {
        a2.push(NaN);
      } else {
        a2.push(this[i]);
      }
    }
    return a2;
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
          const childWidget = cls.a();
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
  widget.updateProperties(props);
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
    } else {
      this.elapsed = 0;
    }
  }
}
const minFontSize = 8;
const scaleFactor = 48 * (1 / window.devicePixelRatio || 1);
function tokenizeRich(text) {
  const tokens = [];
  const re = /\[(?:\s*(fg|bg|s|a)\s*=\s*([^\]\s]+)\s*)+\]|\[\/\]|\[\[|\]\]/g;
  let i = 0, m;
  while (m = re.exec(text)) {
    const j = m.index;
    if (j > i) tokens.push({ type: "text", text: text.slice(i, j) });
    const tag = m[0];
    if (tag === "[[") tokens.push({ type: "text", text: "[" });
    else if (tag === "]]") tokens.push({ type: "text", text: "]" });
    else if (tag === "[/]") tokens.push({ type: "tagClose" });
    else {
      const attrs = {};
      const inner = tag.slice(1, -1);
      for (const kv of inner.trim().split(/\s+/)) {
        const mm = /^(fg|bg|s|a)\s*=\s*(.+)$/.exec(kv);
        if (mm) attrs[
          /** @type {'fg'|'bg'|'s'|'a'} */
          mm[1]
        ] = mm[2];
      }
      tokens.push({ type: "tagOpen", attrs });
    }
    i = re.lastIndex;
  }
  if (i < text.length) tokens.push({ type: "text", text: text.slice(i) });
  return (
    /** @type {Token[]} */
    tokens
  );
}
function buildRuns(tokens) {
  const stack = [{ fg: null, bg: null, s: 1, a: 1 }];
  const runs = [];
  for (const t of tokens) {
    if (t.type === "text") {
      if (t.text) runs.push({ text: t.text, style: { ...stack[stack.length - 1] } });
      continue;
    }
    if (t.type === "tagOpen") {
      const top = { ...stack[stack.length - 1] };
      if (t.attrs.fg) top.fg = t.attrs.fg;
      if (t.attrs.bg) top.bg = t.attrs.bg;
      if (t.attrs.s) {
        const mult = parseFloat(t.attrs.s);
        if (isFinite(mult) && mult > 0) top.s *= mult;
      }
      if (t.attrs.a) {
        const alpha = parseFloat(t.attrs.a);
        if (isFinite(alpha)) top.a *= Math.max(0, Math.min(1, alpha));
      }
      stack.push(top);
      continue;
    }
    if (stack.length > 1) stack.pop();
  }
  return runs;
}
function atomizeRuns(runs) {
  const atoms = [];
  for (const r of runs) {
    const parts = r.text.split(/(\n|\s+)/);
    for (const p of parts) {
      if (p === "") continue;
      atoms.push({ text: p, style: r.style });
    }
  }
  return atoms;
}
function measureAtom(ctx, atom, baseSize, fontName) {
  var _a;
  const s = baseSize * (((_a = atom.style) == null ? void 0 : _a.s) || 1);
  const fontPx = Math.max(1, Math.round(s));
  const oldFont = ctx.font;
  ctx.font = `${fontPx}px ${fontName}`;
  const w = ctx.measureText(atom.text).width;
  ctx.font = oldFont;
  return { width: w, sizePx: fontPx };
}
function wrapRich(ctx, atoms, baseSize, fontName, maxWidth) {
  const lines = [];
  let line = [];
  let lineWidth = 0;
  const flush = () => {
    const merged = [];
    for (const seg of line) {
      const last = merged[merged.length - 1];
      if (last && last.fg === seg.fg && last.bg === seg.bg && last.a === seg.a && last.sizePx === seg.sizePx) {
        last.text += seg.text;
        last.width += seg.width;
      } else {
        merged.push({ ...seg });
      }
    }
    lines.push(merged);
    line.length = 0;
    lineWidth = 0;
  };
  for (const atom of atoms) {
    if (atom.text === "\n") {
      flush();
      continue;
    }
    const { width, sizePx } = measureAtom(ctx, atom, baseSize, fontName);
    const isSpace = /^\s+$/.test(atom.text);
    if (lineWidth + width > maxWidth && line.length > 0) {
      flush();
      if (!isSpace) {
        line.push({
          text: atom.text,
          width,
          sizePx,
          fg: atom.style.fg ?? null,
          bg: atom.style.bg ?? null,
          a: atom.style.a ?? 1
        });
        lineWidth += width;
      }
    } else {
      line.push({
        text: atom.text,
        width,
        sizePx,
        fg: atom.style.fg ?? null,
        bg: atom.style.bg ?? null,
        a: atom.style.a ?? 1
      });
      lineWidth += width;
    }
  }
  flush();
  return lines;
}
function setFont(ctx, px, fontName) {
  const prev = ctx.font;
  ctx.font = `${px}px ${fontName}`;
  return prev;
}
function sizeRichText(ctx, text, size, fontName, rect, color, wordwrap = true, paddingRatio = 1) {
  let scale = 1;
  if (size < minFontSize) {
    scale = 1 / scaleFactor;
    ctx.save();
    ctx.scale(scale, scale);
  }
  setFont(ctx, size >= minFontSize ? size : Math.ceil(size / scale), fontName);
  const runs = buildRuns(tokenizeRich(text));
  const atoms = wordwrap ? atomizeRuns(runs) : runs.map((r) => ({ ...r }));
  const lines = wordwrap ? wrapRich(ctx, atoms, size / scale, fontName, rect.w / scale) : [wrapRich(ctx, atoms, size / scale, fontName, 1e9)[0] || []];
  let totalH = 0;
  for (const segs of lines) {
    let lineH = 0;
    for (const seg of segs) {
      lineH = Math.max(lineH, seg.sizePx);
    }
    totalH += lineH || size;
  }
  totalH += lines.length ? size * paddingRatio : size * (1 + paddingRatio);
  if (size < minFontSize) ctx.restore();
  return [rect.w, totalH * scale];
}
function getRichText(ctx, text, size, fontName, halign, valign, rect, color, wordwrap = true) {
  let scale = 1;
  if (size < minFontSize) {
    scale = 1 / scaleFactor;
    ctx.save();
    ctx.scale(scale, scale);
  }
  const basePx = size >= minFontSize ? size : Math.ceil(size / scale);
  setFont(ctx, basePx, fontName);
  const runs = buildRuns(tokenizeRich(text));
  const atoms = wordwrap ? atomizeRuns(runs) : runs.map((r) => ({ ...r }));
  const lines = wordwrap ? wrapRich(ctx, atoms, basePx, fontName, rect.w / scale) : [wrapRich(ctx, atoms, basePx, fontName, 1e9)[0] || []];
  const laid = [];
  let y = rect.y / scale;
  let maxLineHeights = [];
  for (const segs of lines) {
    let lineW = 0, lineH = 0;
    for (const seg of segs) {
      lineW += seg.width;
      lineH = Math.max(lineH, seg.sizePx);
    }
    let x = rect.x / scale;
    if (halign === "center") x += (rect.w / scale - lineW) / 2;
    else if (halign === "right") x += rect.w / scale - lineW;
    laid.push({ x, y, segs, lineH });
    maxLineHeights.push(lineH || basePx);
    y += lineH || basePx;
  }
  const textH = maxLineHeights.reduce((a2, b) => a2 + b, 0);
  let off = 0;
  switch (valign) {
    case "middle":
      off = (rect.h / scale - textH) / 2;
      break;
    case "bottom":
      off = rect.h / scale - textH;
      break;
  }
  const richData = {
    fontName,
    lines: laid.map((L) => ({ x: L.x, y: L.y, lineH: L.lineH, segments: L.segs })),
    off,
    valign,
    baseColor: color,
    baseSizePx: basePx,
    size
  };
  if (size < minFontSize) ctx.restore();
  return richData;
}
function drawRichText(ctx, richData, overrideColor = null) {
  let scale = 1;
  const size = richData.size;
  if (size < minFontSize) {
    scale = 1 / scaleFactor;
    ctx.save();
    ctx.scale(scale, scale);
  }
  ctx.textBaseline = "top";
  for (const L of richData.lines) {
    let x = L.x;
    const yTop = L.y + (richData.off ?? 0);
    for (const seg of L.segments) {
      if (!seg.text) continue;
      const prevFont = ctx.font;
      ctx.font = `${seg.sizePx}px ${richData.fontName}`;
      const pad = Math.round(seg.sizePx * 0.15);
      if (seg.bg) {
        const prevFill2 = ctx.fillStyle;
        ctx.fillStyle = seg.bg;
        const prevAlpha2 = ctx.globalAlpha;
        ctx.globalAlpha *= seg.a ?? 1;
        ctx.fillRect(x - pad, yTop - pad, seg.width + pad * 2, L.lineH + pad * 2);
        ctx.globalAlpha = prevAlpha2;
        ctx.fillStyle = prevFill2;
      }
      const fg = overrideColor ?? seg.fg ?? richData.baseColor;
      const prevFill = ctx.fillStyle;
      const prevAlpha = ctx.globalAlpha;
      ctx.fillStyle = fg;
      ctx.globalAlpha = prevAlpha * (seg.a ?? 1);
      ctx.fillText(seg.text, x, yTop);
      ctx.globalAlpha = prevAlpha;
      ctx.fillStyle = prevFill;
      x += seg.width;
      ctx.font = prevFont;
    }
  }
  if (size < minFontSize) ctx.restore();
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
   * @param {Widget|EventSink} listener 
   * @param {string} emitterEvent the object ID and event to listen for "objectId.eventName" or "eventName" to listen on this object
   * @param {EventCallbackNullable} callback 
   */
  listen(listener, emitterEvent, callback) {
    const [first, second] = emitterEvent.split(".", 2);
    emitterEvent = second ?? first;
    const emitterId = second === void 0 ? listener["id"] ?? listener : first;
    let conn = new EventConnection(listener, emitterEvent, callback);
    let conns = this.connections.get(emitterId);
    if (conns) conns.add(conn);
    else this.connections.set(emitterId, /* @__PURE__ */ new Set([conn]));
  }
  /**
   * 
   * @param {Widget|EventSink} emitter 
   * @param {string} event 
   * @param {*} data 
   */
  emit(emitter, event, data) {
    const conns = this.connections.get(emitter["id"] ?? emitter);
    if (!conns) return false;
    for (let conn of conns) {
      if (conn.event === event && conn.callback(event, emitter, data, conn.listener)) return true;
    }
    return false;
  }
  /**
   * Remove all connections associated with this widget
   * @param {*} widget 
   */
  disconnect(widget) {
    this.connections.delete(widget["id"] ?? widget);
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
function a(klass, arg1, arg2) {
  var _a;
  Widget._ALLOW_CONSTRUCT = true;
  const obj = new klass();
  Widget._ALLOW_CONSTRUCT = false;
  let id = null, props = {};
  if (typeof arg1 === "string") {
    id = arg1;
    props = arg2 ?? {};
  } else {
    props = arg1 ?? {};
  }
  if (id) obj["id"] = id;
  if (obj instanceof Widget) {
    instanceClassData(obj, {}, obj);
  }
  (_a = obj.updateProperties) == null ? void 0 : _a.call(obj, props);
  return obj;
}
const _Widget = class _Widget extends Rect {
  /**
   * Widget provides the base interface for all interactable objects in ESKV
   * Do not call `new Widget()`. Instead call `Widget.a([id], [props])` to instantiate it.
   */
  constructor() {
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
    if (!_Widget._ALLOW_CONSTRUCT) {
      throw new Error(`[ESKV] Do not use 'new ${typeof this}()'. Use '${typeof this}.a(...)' instead.`);
    }
    _Widget._ALLOW_CONSTRUCT = false;
    this.parent = null;
    this._processTouches = false;
    this._deferredProps = null;
    this._children = [];
    this._needsLayout = true;
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
  /**
   * @type {WidgetFactory['a']} 
   **/
  static a(arg1, arg2 = void 0) {
    var _a;
    _Widget._ALLOW_CONSTRUCT = true;
    const obj = (
      /**@type {ReturnType<WidgetFactory['a']>}*/
      new this()
    );
    _Widget._ALLOW_CONSTRUCT = false;
    let id = null, props = {};
    if (typeof arg1 === "string") {
      id = arg1;
      props = arg2 ?? {};
    } else {
      props = arg1 ?? {};
    }
    if (id) obj["id"] = id;
    if (obj instanceof _Widget) {
      instanceClassData(obj, {}, obj);
    }
    (_a = obj.updateProperties) == null ? void 0 : _a.call(obj, props);
    return obj;
  }
  /**
   * Sets the widget's ID and returns itself.
   * This ID is used for cross-widget communication and registration in App.objects.
   *
   * @param {string} id - The unique ID to assign to this widget.
   * @returns {this}
   */
  i(id) {
    this["id"] = id;
    return this;
  }
  /**
   * 
   * @param {Partial<this>&{id?:string}} props 
   * @returns {this}
   */
  p(props) {
    this.updateProperties(props);
    return this;
  }
  /**
   * Sets the sizing/layout hints for this widget.
   * Hints control alignment, stretch, min/max sizing, etc.
   *
   * @param {WidgetSizeHints} hints - The hints to apply.
   * @param {'merge'|'replace'} [mode='replace'] - Whether to merge with existing hints or replace them.
   */
  sh(hints, mode = "replace") {
    if (mode === "merge") {
      this.hints = Object.assign({}, this.hints ?? {}, hints);
    } else {
      this.hints = hints;
    }
    return this;
  }
  /**
   * Subscribes to a property change on another object and responds with a callback.
   * This widget will react when the bound object's property changes, like an event listener.
   *
   * The callback receives the event name, the source object, the new value, and this widget itself.
   * The dependency source must be defined in `deferredProps` using a string like "someOtherId.prop".
   *
   * Example:
   *   .d("enabled", "controller.running")
   *    .b("enabled", (event, controller, value, self) => self.bgColor = value ? "green" : "red")
   *
   * @template {Widget} T
   * @param {string} property - The name of the property to listen for on the source object.
   * @param {(event: string, object: Widget, value: any, self: T) => any} callback - Function to invoke when the source property changes.
   */
  b(property, callback) {
    if (!this._deferredProps) this._deferredProps = {};
    this._deferredProps[property] = callback;
    return (
      /** @type {this} */
      this
    );
  }
  /**
   * Adds one or more child widgets to this widget.
   * Accepts a single widget or an array of widgets.
   *
   * @param {Widget|Widget[]} child - The widget(s) to add as children.
   */
  c(child) {
    if (child instanceof _Widget) {
      this.addChild(child);
    } else {
      for (const ch of child) this.addChild(ch);
    }
    return this;
  }
  /**
   * Declares a computed property whose value depends on other widgets.
   * The arguments to `computeFn` are widgets, resolved by matching the parameter names
   * to IDs in `App.objects`. The return value is assigned to the given property.
   *
   * Example:
   *   .d("visible", (scoreLabel, gameState) => scoreLabel.value > 0 && gameState.active)
   *
   * @param {string} property - Property on this widget to assign.
   * @param {(...args: Widget[]) => any} computeFn - Function that takes widgets (by ID) and returns computed value.
   */
  d(property, computeFn) {
    if (!this._deferredProps) this._deferredProps = {};
    this._deferredProps[property] = computeFn;
    return this;
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
   * @param {App} app
   */
  deferredProperties(app) {
    let properties = this._deferredProps;
    this._deferredProps = null;
    for (let p in properties) {
      if (!p.startsWith("on_") && !p.startsWith("_") && typeof properties[p] == "function") {
        let func = properties[p];
        let args, rval;
        [args, rval] = (func["text"] ?? func.toString()).split("=>");
        args = args.replace("(", "").replace(")", "").split(",").map((a2) => a2.trim());
        let objs = args.map((a2) => app.findById(a2));
        let obmap = {};
        for (let a2 of args) {
          obmap[a2] = app.findById(a2);
        }
        const re = /(\w+)\.(\w+)|(\w+)\[['"](\w+)['"]\]/g;
        for (let pat of rval.matchAll(re)) {
          let pr, ob;
          [ob, pr] = pat.slice(1);
          if (ob === "this") this.listen(pr, (evt, obj, data) => {
            try {
              this[p] = func(...objs);
            } catch (error) {
              console.log("Dynamic binding error", this, p, error);
            }
          });
          else if (ob in obmap) {
            try {
              this.listen(`${ob}.${pr}`, (evt, obj, data) => {
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
  updateProperties(properties) {
    for (let p in properties) {
      if (!p.startsWith("on_") && !p.startsWith("_") && typeof properties[p] == "function" && !("markupMethod" in properties[p])) {
        this._deferredProps = properties;
      } else {
        this[p] = properties[p];
      }
    }
  }
  /**
   * Bind a callback to property changes of this or another Widget
   * @param {string} emitterEvent name of property or objectId.property to bind to (the event)
   * @param {EventCallbackNullable} func callback function to trigger when property changes
   */
  listen(emitterEvent, func) {
    App.get()._eventManager.listen(this, emitterEvent, func);
    return this;
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
    return this;
  }
  /**
   * @template {new () => any} C
   * @param {C} klass 
   * @param {string|(Partial<InstanceType<C>>&{id?:string})} props_or_id 
   * @param {(Partial<InstanceType<C>>&{id?:string})} props 
   */
  addNew(klass, props_or_id, props) {
    this.addChild(a(klass, props_or_id, props));
    return this;
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
   * @param {Widget} object
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
   * @param {Widget} object
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
   * @param {Widget} object
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
   * @param {Widget} object
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
  * @param {Widget} object
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
   * @param {Widget} object
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
      const origFill = ctx.fillStyle;
      ctx.fillStyle = this.bgColor;
      ctx.fill();
      ctx.fillStyle = origFill;
    }
    if (this.outlineColor != null) {
      let lw = ctx.lineWidth;
      ctx.lineWidth = this.getMetric(this, "lineWidth", this.hints.lineWidth ?? `${1 / app.tileSize}`);
      const origStroke = ctx.strokeStyle;
      ctx.strokeStyle = this.outlineColor;
      ctx.stroke();
      ctx.lineWidth = lw;
      ctx.strokeStyle = origStroke;
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
};
/**@property {string} [id] Optional widget ID */
/**@type {boolean} */
__publicField(_Widget, "_ALLOW_CONSTRUCT", false);
let Widget = _Widget;
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
  constructor() {
    if (_App.appInstance != null) return _App.appInstance;
    Widget._ALLOW_CONSTRUCT = true;
    super();
    Widget._ALLOW_CONSTRUCT = false;
    _App.appInstance = this;
    window.app = this;
    this._eventManager = new EventManager();
    this.id = "app";
    this.canvas = null;
    this.canvasName = "canvas";
    this.canvas = null;
    this.canvasName = "canvas";
    this.w = -1;
    this.h = -1;
    this._baseWidget = a(Widget, { hints: { x: 0, y: 0, w: 1, h: 1 } });
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
    this.tileSize = this.getTileScale() * this.pixelSize;
    this.offsetX = 0;
    this.offsetY = 0;
    this.shakeX = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeAmount = 0;
    this.timer_tick = null;
    this.timers = [];
    this.continuousFrameUpdates = false;
    this._requestedFrameUpdate = false;
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
    setTimeout(() => this._start(), 1);
    setTimeout(() => this._start(), 1);
  }
  /**
   * Internal function to actually start the main application loop once the main window has been loaded
   */
  _start() {
    this.update();
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
    this._requestedFrameUpdate = false;
    this._udpateActive = true;
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
    this._udpateActive = false;
    if (this._requestedFrameUpdate) {
      this._requestedFrameUpdate = false;
      this.requestFrameUpdate();
    }
  }
  requestFrameUpdate() {
    if (!this._requestedFrameUpdate) {
      if (this._udpateActive) {
        this._requestedFrameUpdate = true;
      } else {
        this._udpateActive = true;
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
  /**@type {EventCallbackNullable} */
  on_prefDimW(e, o, v) {
    this.updateWindowSize();
  }
  /**@type {EventCallbackNullable} */
  on_prefDimH(e, o, v) {
    this.updateWindowSize();
  }
  /**@type {EventCallbackNullable} */
  on_tileSize(e, o, v) {
    if (this.prefDimH < 0 && this.prefDimW < 0) this.updateWindowSize();
  }
  computeDeviceScale() {
    const dpr = window.devicePixelRatio || 1;
    const screenMin = Math.min(window.innerWidth, window.innerHeight);
    const physicalWidth = screenMin * dpr;
    const scale = 1080 / physicalWidth;
    return Math.max(1, Math.min(scale, 3));
  }
  /**
   * Resize event handler (updates the canvas size, tileSize, dimW, and dimH properties)
   */
  updateWindowSize() {
    this.x = 0;
    this.y = 0;
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.pixelSize = this.computeDeviceScale();
    if (this.prefDimH >= 0 || this.prefDimW >= 0) this.tileSize = this.getTileScale();
    this.fitDimensionsToTileSize(this.tileSize);
    if (this.canvas !== null) {
      this.setupCanvas();
    }
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
    const canvas = document.getElementById(this.canvasName);
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw "No canvas element named " + this.canvasName;
    }
    this.canvas = canvas;
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
   * */
  constructor() {
    super();
    /**@type {number|string|null} size of the font in tile units, adapts to fit to the rect if null */
    __publicField(this, "fontSize", null);
    /**@type {number} if fontSize is null set the size to this fraction of the widget height (centered in the widget)*/
    __publicField(this, "fontHeightPadding", 1);
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
    /**@type {boolean} true to wrap long lines of text */
    __publicField(this, "richText", false);
    /**@type {boolean} wraps at words if true, at character if false */
    __publicField(this, "wrapAtWord", true);
    /** @type {'left'|'center'|'right'} horizontal alignment, one of 'left','right','center'*/
    __publicField(this, "align", "center");
    /** @type {'top'|'middle'|'bottom'} vertical alignment, one of 'top','middle','bottom'*/
    __publicField(this, "valign", "middle");
    /** @type {string} text color, any valid HTML5 color string*/
    __publicField(this, "color", "white");
    this._textData = null;
  }
  /**@type {EventCallbackNullable} */
  on_align(e, object, v) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_valign(e, object, v) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_wrap(e, object, v) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_richText(e, object, v) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_wrapAtWord(e, object, v) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_text(e, object, v) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_fontSize(e, object, v) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
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
        this[3] = this.richText ? sizeRichText(ctx, this.text, fontSize, this.fontName, this.rect, this.color, this.wrap, this.fontHeightPadding)[1] : this.wrap ? sizeWrappedText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color, this.wrapAtWord, this.fontHeightPadding)[1] : sizeText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color, this.fontHeightPadding)[1];
      }
    }
    if ("w" in this.hints && this.hints["w"] == null) {
      if (fontSize !== null) {
        this[2] = this.richText ? sizeRichText(ctx, this.text, fontSize, this.fontName, this.rect, this.color, this.wrap, this.fontHeightPadding)[0] : this.wrap ? sizeWrappedText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color, this.wrapAtWord, this.fontHeightPadding)[0] : sizeText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color, this.fontHeightPadding)[0];
      }
    }
    fontSize = fontSize === null ? this.h / (1 + this.fontHeightPadding) : fontSize;
    if (this.fontSize === null && this.rect.w !== void 0) {
      let i = 0;
      let w, h;
      while (i < 50) {
        if (this.richText) {
          [w, h] = sizeRichText(ctx, this.text, fontSize, this.fontName, this.rect, this.color, this.wrap, this.fontHeightPadding);
        } else if (this.wrap) {
          [w, h] = sizeWrappedText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color, this.wrapAtWord, this.fontHeightPadding);
        } else {
          [w, h] = sizeText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color, this.fontHeightPadding);
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
      if (this.richText) {
        this._textData = getRichText(ctx, this.text, fontSize, this.fontName, this.align, this.valign, this.rect, this.color, this.wrap);
      } else if (this.wrap) {
        this._textData = getWrappedTextData(ctx, this.text, fontSize, this.fontName, this.align, this.valign, this.rect, this.color, this.wrapAtWord);
      } else {
        this._textData = getTextData(ctx, this.text, fontSize, this.fontName, this.align, this.valign, this.rect, this.color);
      }
    }
    super.layoutChildren();
  }
  /**
   * 
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} ctx 
   * @returns 
   */
  sizeToGroup(ctx) {
    if (this._bestFontSize === void 0) return;
    let fontSize = Infinity;
    for (let lbl of App.get().iterByPropertyValue("sizeGroup", this.sizeGroup)) {
      if (fontSize > lbl._bestFontSize && !lbl.ignoreSizeForGroup) fontSize = lbl._bestFontSize;
    }
    if (fontSize > 0) {
      for (let lbl of App.get().iterByPropertyValue("sizeGroup", this.sizeGroup)) {
        const fs = lbl.clip || !lbl.ignoreSizeForGroup ? fontSize : lbl._bestFontSize;
        if (lbl.richText) {
          lbl._textData = getRichText(ctx, lbl.text, fs, lbl.fontName, lbl.align, lbl.valign, lbl.rect, lbl.color, lbl.wrap);
        } else if (lbl.wrap) {
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
      if (this.richText) {
        drawRichText(ctx, this._textData, this.color);
      } else if (this.wrap) {
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
   */
  constructor() {
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
   */
  constructor() {
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
   */
  constructor() {
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
   * Constructs a new Checkbox. 
   */
  constructor() {
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
   * Constructs a slider
   */
  constructor() {
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
  /**
   * 
   */
  constructor() {
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
  /** Vertically align textarea content inside the overlay rect using padding-top. */
  _syncTextareaVAlign(inp, rt, lhPx) {
    var _a, _b;
    const lines = Math.max(1, ((_b = (_a = this._textData) == null ? void 0 : _a.outText) == null ? void 0 : _b.length) || 1);
    const blockH = lines * lhPx;
    let padTop = 0;
    if (this.valign === "middle") padTop = Math.max(0, (rt.h - blockH) / 2);
    else if (this.valign === "bottom") padTop = Math.max(0, rt.h - blockH);
    inp.style.paddingTop = `${Math.floor(padTop)}px`;
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
    const app = App.get();
    const canvasdiv = document.getElementById("eskvapp");
    if (!canvasdiv) return;
    const type = this.wrap ? "textarea" : "input";
    const inp = document.createElement(type);
    if (!(inp instanceof HTMLInputElement) && !(inp instanceof HTMLTextAreaElement)) return;
    const rt = this.DOMInputRect();
    const color = this.color ?? "white";
    const bgColor = this.bgColor ?? "black";
    const fsPx = Math.max(1, this._textData.size * app.tileSize);
    const lhPx = Math.round(fsPx * 1.25);
    inp.value = this.text;
    inp.style.position = "absolute";
    inp.style.top = `${Math.floor(rt.y * 100) / 100}px`;
    inp.style.left = `${Math.floor(rt.x * 100) / 100}px`;
    inp.style.width = `${Math.floor(rt.w * 100) / 100}px`;
    inp.style.height = `${Math.floor(rt.h * 100) / 100}px`;
    inp.style.fontSize = `${fsPx}px`;
    inp.style.lineHeight = `${lhPx}px`;
    inp.style.fontFamily = this.fontName;
    inp.style.color = color;
    inp.style.background = bgColor;
    inp.style.textAlign = this.align;
    inp.style.border = "none";
    inp.style.outline = "none";
    inp.style.padding = "0";
    inp.style.margin = "0";
    inp.style.boxSizing = "border-box";
    inp.style.caretColor = color;
    if (type === "textarea") {
      inp.setAttribute("wrap", "soft");
      inp.style.whiteSpace = "pre-wrap";
      inp.style.overflowWrap = this.wrapAtWord ? "break-word" : "anywhere";
      inp.style.wordBreak = this.wrapAtWord ? "normal" : "break-all";
      inp.style.resize = "none";
      inp.style.overflowY = "auto";
      this._syncTextareaVAlign(inp, rt, lhPx);
      inp.addEventListener("input", () => this._syncTextareaVAlign(inp, this.DOMInputRect(), lhPx));
    } else {
      inp.style.whiteSpace = "nowrap";
      inp.style.overflow = "hidden";
    }
    this._activeDOMInput = inp;
    canvasdiv.appendChild(inp);
    inp.addEventListener("focusout", () => this.clearDOM());
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
      if (this._activeDOMInput instanceof HTMLTextAreaElement && this.wrap) {
        const fsPx = parseFloat(this._activeDOMInput.style.fontSize) || 16;
        const lhPx = parseFloat(this._activeDOMInput.style.lineHeight) || Math.round(fsPx * 1.25);
        this._syncTextareaVAlign(this._activeDOMInput, rt, lhPx);
      }
    }
  }
}
class ImageWidget extends Widget {
  /**
   * Constructs a new ImageWidget, optionally apply properties in `props`
   */
  constructor() {
    super();
    /**@type {HTMLImageElement} */
    __publicField(this, "image", new Image());
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
   * Creates an instance of a BoxLayout. Use BoxLayout.a(id?, props?) to create an instance in your app.
   */
  constructor() {
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
  /**@type {EventCallbackNullable} */
  on_numX(event, object, data) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_numY(event, object, data) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_spacingX(event, object, data) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_spacingY(event, object, data) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_paddingX(event, object, data) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_paddingY(event, object, data) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
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
      if ((num === 0 && h > 0 || ch < 0) && this.hints["h"] !== null) paddingY = (h - fixedh) / 2;
      let y = this.y + paddingY;
      let x = this.x + paddingX;
      for (let c of this.iterChildren()) {
        c.y = y;
        if (!("w" in c.hints)) c.w = cw;
        if (!("h" in c.hints)) c.h = ch;
        if (!("x" in c.hints) && !("center_x" in c.hints) && !("right" in c.hints)) {
          c.x = x;
          if (w !== c.w) {
            c.x += (w - c.w) / 2;
          }
        }
        c.layoutChildren();
        y += spacingY + c.h;
      }
      if (num === 0 && this.hints["h"] === null) {
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
      if ((num === 0 && w > 0 || cw < 0) && this.hints["w"] !== null) paddingX = (w - fixedw) / 2;
      let y = this.y + paddingY;
      let x = this.x + paddingX;
      for (let c of this.iterChildren()) {
        c.x = x;
        if (!("w" in c.hints)) c.w = cw;
        if (!("h" in c.hints)) c.h = ch;
        if (!("y" in c.hints) && !("center_y" in c.hints) && !("bottom" in c.hints)) {
          c.y = y;
          if (h !== c.h) {
            c.y += (h - c.h) / 2;
          }
        }
        c.layoutChildren();
        x += spacingX + c.w;
      }
      if (num === 0 && this.hints["w"] === null) {
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
  /**
   * Creates an instance of a Notebook. Use Notebook.a to create an instance
   */
  constructor() {
    super();
    __publicField(this, "activePage", 0);
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
  /**
   * Creates an instance of a Notebook with properties optionally specified in `properties`.
   */
  constructor() {
    super();
    /**@type {string|number} The height hint for the tabbed area of the TabbedNotebook */
    __publicField(this, "tabHeightHint", "1");
    /**@type {string} The named of the button group for the TabbedNotebook */
    __publicField(this, "tabGroupName", "tabbedNotebookGroup");
    this.buttonBox = a(BoxLayout, {
      orientation: "horizontal",
      hints: { h: this.tabHeightHint, w: null }
    });
    this.buttonScroller = a(ScrollView, {
      id: "_scrollview",
      hints: { h: this.tabHeightHint, w: 1 },
      children: [
        this.buttonBox
      ]
    });
    this._children = [this.buttonScroller];
    this.buttonScroller.parent = this;
    this.updateButtons();
  }
  /**@type {EventCallbackNullable} */
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
      const tb = a(ToggleButton, {
        text: page["name"] ?? String(i + 1),
        group: this.tabGroupName,
        singleSelect: true,
        press: this.activePage === i,
        fontSize: "0.5",
        hints: { h: null, w: null }
      });
      tb.listen("press", (e, o, v) => {
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
  //TODO: Need to track column widths and row heights based on max height/width hints in each row/col
  /**
   * Constructs a new GridLayout. Create a new instance using GridLayout.a(id?, props?)
   */
  constructor() {
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
  }
  /**@type {EventCallbackNullable} */
  on_numX(event, object, string) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_numY(event, object, string) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_spacingX(event, object, string) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_spacingY(event, object, string) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_paddingX(event, object, string) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_paddingY(event, object, string) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
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
   * Constructs a new ScrollView.
   */
  constructor() {
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
    this._processTouches = true;
    this._oldTouch = null;
    this._lastDist = null;
  }
  /**@type {EventCallbackNullable} */
  /**
   * 
   * @param {string} event 
   * @param {ScrollView} object 
   * @param {Widget} child 
   */
  on_child_added(event, object, child) {
    if (this.children.length == 1) {
      this.scrollX = 0;
      this.scrollY = 0;
      this._needsLayout = true;
      child.listen("rect", (event2, obj, data) => this._needsLayout = true);
      child.listen("w", (event2, obj, data) => this._needsLayout = true);
      child.listen("h", (event2, obj, data) => this._needsLayout = true);
    }
  }
  /**@type {EventCallbackNullable} */
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
  /**@type {EventCallbackNullable} */
  on_uiZoom(event, object, value) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
  on_hAlign(event, object, value) {
    this._needsLayout = true;
  }
  /**@type {EventCallbackNullable} */
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
  /**@type {EventCallbackNullable} */
  on_scrollW(event, object, value) {
    this._needsLayout = true;
    this.scrollX = 0;
  }
  /**@type {EventCallbackNullable} */
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
      let a2 = this.vel.abs();
      if (a2.x <= this.velCutoff / this.zoom && a2.y <= this.velCutoff / this.zoom) this.vel = null;
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
   * Constructs a new ModalView.
   */
  constructor() {
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
   */
  *iter() {
    for (let i = 0; i < this.length / 3; i++) {
      yield [this[i * 3], this[i * 3 + 1], this[i * 3 + 2]];
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
    return this.frames[this.activeFrame] ?? -1;
  }
  /**
  * 
  * @param {App} app 
  * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} ctx 
  */
  draw(app, ctx) {
    var _a;
    if (this.spriteSheet === null || !((_a = this.spriteSheet.sheet) == null ? void 0 : _a.complete)) return;
    const tx = Math.floor(this.x * this.spriteSheet.spriteSize) / this.spriteSheet.spriteSize;
    const ty = Math.floor(this.y * this.spriteSheet.spriteSize) / this.spriteSheet.spriteSize;
    ctx.translate(tx, ty);
    ctx.scale(this.w, this.h);
    if (this.frame instanceof LayeredAnimationFrame) {
      for (let [f, dx, dy] of this.frame.iter()) {
        this.spriteSheet.drawIndexed(ctx, f, 0, 0, this.facing, this.flipX, dx, dy);
      }
    } else {
      this.spriteSheet.drawIndexed(ctx, this.frame, 0, 0, this.facing, this.flipX);
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
class WebGLTileRenderer {
  /**
   * 
   * @param {HTMLCanvasElement|OffscreenCanvas} canvas 
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = /**@type {WebGLRenderingContext|null}*/
    canvas.getContext("webgl", { alpha: true });
    if (this.gl === null) throw Error(`WebGL context could not be retrieved from ${canvas}`);
    const shaderData = this.initShaders();
    this.shaderProgram = shaderData.program;
    this.aPosition = shaderData.aPosition;
    this.aTexCoord = shaderData.aTexCoord;
    this.aColor = shaderData.aColor;
    const gl = this.gl;
    this.vertexBuffer = gl.createBuffer();
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    this.numQuads = 1e3;
    this.indexBuffer = gl.createBuffer();
    this.vertexData = new Float32Array(this.numQuads * 6 * (2 + 2 + 4));
    this.indexData = new Uint16Array(this.numQuads * 6);
    for (let i = 0, j = 0; i < this.indexData.length; i += 6, j += 4) {
      this.indexData.set([j, j + 1, j + 2, j + 2, j + 3, j], i);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexData, gl.STATIC_DRAW);
    this.textures = /* @__PURE__ */ new Map();
    this.vertexCount = 0;
    this.activeTexture = null;
  }
  initShaders() {
    const gl = this.gl;
    const vertSrc = `
            attribute vec2 aPosition;
            attribute vec2 aTexCoord;
            attribute vec4 aColor;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uModelMatrix;
            varying vec2 vTexCoord;
            varying vec4 vColor;
            void main() {
                gl_Position = uProjectionMatrix * uModelMatrix * vec4(aPosition, 0.0, 1.0);
                vTexCoord = aTexCoord;
                vColor = aColor;
            }
        `;
    const fragSrc = `
            precision mediump float;
            varying vec2 vTexCoord;
            varying vec4 vColor;
            uniform sampler2D uTexture;
            void main() {
                gl_FragColor = texture2D(uTexture, vTexCoord) * vColor;
            }
        `;
    const program = this.compileShaderProgram(vertSrc, fragSrc);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    const aTexCoord = gl.getAttribLocation(program, "aTexCoord");
    const aColor = gl.getAttribLocation(program, "aColor");
    if (aPosition === void 0) throw Error("Could not bind aPosition");
    if (aTexCoord === void 0) throw Error("Could not bind aTexCoord");
    if (aColor === void 0) throw Error("Could not bind aColor");
    return { program, aPosition, aTexCoord, aColor };
  }
  /**
   * Compiles the vertex and fragement shader source into a webGL program
   * @param {string} vertSrc vertex shader source
   * @param {string} fragSrc fragmenet shader source
   * @returns 
   */
  compileShaderProgram(vertSrc, fragSrc) {
    const gl = this.gl;
    const vertShader = this.compileShader(gl.VERTEX_SHADER, vertSrc);
    const fragShader = this.compileShader(gl.FRAGMENT_SHADER, fragSrc);
    if (vertShader === null) throw Error(`Error in vertShader ${vertShader}`);
    if (fragShader === null) throw Error(`Error in fragShader ${fragShader}`);
    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Shader link error:", gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);
    return program;
  }
  /**
   * Handles the compilation of a single shader part (VERTEX or FRAGMENT)
   * @param {number} type Should be one of gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
   * @param {string} src Source code of the shader
   * @returns 
   */
  compileShader(type, src) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (shader === null) throw Error(`Invalid shader type ${type}`);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw Error(`Shader compile error: ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
  }
  /**
   * Registers the texture with assigned `name` to a specified `image`
   * @param {string} name 
   * @param {HTMLImageElement|OffscreenCanvas} image 
   * @param {number|[number, number]} [tileDim=1] 
   * @param {WebGLRenderingContextBase['NEAREST']|WebGLRenderingContextBase['LINEAR']|null} [interp=null]
   */
  registerTexture(name, image, tileDim = 1, interp = null, padding = 0) {
    const gl = this.gl;
    const texture = gl.createTexture();
    const [tw, th] = tileDim instanceof Array ? tileDim : [tileDim, tileDim];
    if (interp === null) interp = gl.NEAREST;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    const isPowerOfTwo = (value) => (value & value - 1) === 0;
    const pot = isPowerOfTwo(image.width) && isPowerOfTwo(image.height);
    if (pot) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, interp);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, interp);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.textures.set(name, { texture, width: image.width / (tw + padding), height: image.height / (th + padding), fracW: tw / (tw + padding), fracH: th / (th + padding) });
  }
  /**
   * Start rendering configured for a particular tileScale (fix in each direction)
   * @param {number} tileScale 
   */
  start(tileScale) {
    const gl = this.gl;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    const uProjectionMatrixLoc = gl.getUniformLocation(this.shaderProgram, "uProjectionMatrix");
    const projectionMatrix = new Float32Array([
      2 / this.canvas.width * tileScale,
      0,
      0,
      0,
      0,
      -2 / this.canvas.height * tileScale,
      0,
      0,
      // Flip Y so (0,0) is top-left
      0,
      0,
      1,
      0,
      -1,
      1,
      0,
      1
    ]);
    gl.uniformMatrix4fv(uProjectionMatrixLoc, false, projectionMatrix);
    this.setRotation(0, 0, 0);
  }
  /**
   * 
   * @param {number} angle to rotate counter clockwise in radians
   * @param {number} cx x position of the center 
   * @param {number} cy y position of the center  
   * @returns 
   */
  getRotationMatrix(angle, cx, cy) {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    return new Float32Array([
      cosA,
      sinA,
      0,
      0,
      -sinA,
      cosA,
      0,
      0,
      0,
      0,
      1,
      0,
      cx,
      cy,
      0,
      1
    ]);
  }
  /**
   * 
   * @param {number} angle to rotate counter clockwise in radians
   * @param {number} cx x position of the center 
   * @param {number} cy y position of the center  
   * @returns 
   */
  setRotation(angle, cx, cy) {
    const gl = this.gl;
    const uModelMatrixLoc = gl.getUniformLocation(this.shaderProgram, "uModelMatrix");
    const rotationMatrix = this.getRotationMatrix(angle, cx, cy);
    gl.uniformMatrix4fv(uModelMatrixLoc, false, rotationMatrix);
  }
  /**
   * Draws the texture segment into the `glCanvas`
   * @param {string} name Name of texture to draw
   * @param {number} sx source x position (left) in `tileScale` units specified in `start`
   * @param {number} sy source y position (top) in `tileScale` units specified in `start`
   * @param {number} sw source width in `tileScale` units specified in `start`
   * @param {number} sh source height in `tileScale` units specified in `start`
   * @param {number} dx destination x position (left) in the `tileDim[0]` units registered for the texture
   * @param {number} dy destination y position (top) in the `tileDim[1]` units registered for the texture
   * @param {number} dw destination width in the `tileDim[0]` units registered for the texture
   * @param {number} dh destination height in the `tileDim[1]` units registered for the texture
   * @param {[number, number, number, number]} tint the rgba values (between 0 and 1) to tint the region with
   * @returns 
   */
  drawTexture(name, sx, sy, sw, sh, dx, dy, dw, dh, tint) {
    if (!this.textures.has(name)) return;
    const { texture, width, height, fracW, fracH } = this.textures.get(name);
    if (this.activeTexture !== texture) {
      if (this.activeTexture !== null) this.flush();
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.activeTexture = texture;
    }
    const x1 = dx;
    const y1 = dy;
    const x2 = dx + dw;
    const y2 = dy + dh;
    const u1 = sx / width;
    const v1 = sy / height;
    const u2 = (sx + sw * fracW) / width;
    const v2 = (sy + sh * fracH) / height;
    const color = tint ?? [1, 1, 1, 1];
    const baseIndex = this.vertexCount * 8;
    const arr = this.vertexData;
    arr.set([x1, y1, u1, v1, ...color], baseIndex);
    arr.set([x2, y1, u2, v1, ...color], baseIndex + 8);
    arr.set([x2, y2, u2, v2, ...color], baseIndex + 16);
    arr.set([x1, y2, u1, v2, ...color], baseIndex + 24);
    this.vertexCount += 4;
    if (this.vertexCount >= this.numQuads * 4) this.flush();
  }
  /**
   * Draws the texture segment into the `glCanvas` with a tint per vertex
   * @param {string} name Name of texture to draw
   * @param {number} sx source x position (left) in `tileScale` units specified in `start`
   * @param {number} sy source y position (top) in `tileScale` units specified in `start`
   * @param {number} sw source width in `tileScale` units specified in `start`
   * @param {number} sh source height in `tileScale` units specified in `start`
   * @param {number} dx destination x position (left) in the `tileDim[0]` units registered for the texture
   * @param {number} dy destination y position (top) in the `tileDim[1]` units registered for the texture
   * @param {number} dw destination width in the `tileDim[0]` units registered for the texture
   * @param {number} dh destination height in the `tileDim[1]` units registered for the texture
   * @param {[number, number, number, number][]} tints the rgba values (between 0 and 1) to tint each vertex from top-left clockwise
   * @returns 
   */
  drawTextureTintedPerVertex(name, sx, sy, sw, sh, dx, dy, dw, dh, tints) {
    if (!this.textures.has(name)) return;
    const { texture, width, height, fracW, fracH } = this.textures.get(name);
    if (this.activeTexture !== texture) {
      if (this.activeTexture !== null) this.flush();
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.activeTexture = texture;
    }
    const x1 = dx;
    const y1 = dy;
    const x2 = dx + dw;
    const y2 = dy + dh;
    const u1 = sx / width;
    const v1 = sy / height;
    const u2 = (sx + sw * fracW) / width;
    const v2 = (sy + sh * fracH) / height;
    const color = tints;
    const baseIndex = this.vertexCount * 8;
    const arr = this.vertexData;
    arr.set([x1, y1, u1, v1, ...color[0]], baseIndex);
    arr.set([x2, y1, u2, v1, ...color[1]], baseIndex + 8);
    arr.set([x2, y2, u2, v2, ...color[2]], baseIndex + 16);
    arr.set([x1, y2, u1, v2, ...color[3]], baseIndex + 24);
    this.vertexCount += 4;
    if (this.vertexCount >= this.numQuads * 4) this.flush();
  }
  /**
   * Called internally or by the user to render out the current set of vertices
   */
  flush() {
    if (this.vertexCount === 0) return;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexData.subarray(0, this.vertexCount * 8));
    gl.vertexAttribPointer(this.aPosition, 2, gl.FLOAT, false, 8 * 4, 0);
    gl.enableVertexAttribArray(this.aPosition);
    gl.vertexAttribPointer(this.aTexCoord, 2, gl.FLOAT, false, 8 * 4, 2 * 4);
    gl.enableVertexAttribArray(this.aTexCoord);
    gl.vertexAttribPointer(this.aColor, 4, gl.FLOAT, false, 8 * 4, 4 * 4);
    gl.enableVertexAttribArray(this.aColor);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.vertexCount * 6 / 4, gl.UNSIGNED_SHORT, 0);
    this.vertexCount = 0;
  }
  /**
   * Clears out the client region of the glCanvas to the specified rgba values
   * @param {number} r 
   * @param {number} g 
   * @param {number} b 
   * @param {number} a 
   */
  clear(r = 0, g = 0, b = 0, a2 = 0) {
    const gl = this.gl;
    gl.clearColor(r, g, b, a2);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.vertexCount = 0;
  }
}
class WebGLTileWidget extends Widget {
  constructor() {
    super();
    this.drawBatch = [];
    const bgCanvas = document.createElement("canvas");
    this.webglRenderer = new WebGLTileRenderer(bgCanvas);
    this.txTileDim = 1;
    this._txImage = null;
  }
  /** @param {HTMLImageElement|string} srcObj */
  _setTextureSource(srcObj) {
    if (srcObj instanceof HTMLImageElement) {
      if (!srcObj.complete) {
        srcObj.onload = () => {
          this.webglRenderer.registerTexture("texture", srcObj, this.txTileDim);
          App.get().requestFrameUpdate();
        };
      } else {
        this.webglRenderer.registerTexture("texture", srcObj, this.txTileDim);
        App.get().requestFrameUpdate();
      }
      this._txImage = srcObj;
      return;
    }
    const src = srcObj ?? "";
    if (typeof src === "string" && src !== "") {
      const img = new Image();
      img.onload = () => {
        this.webglRenderer.registerTexture("texture", img, this.txTileDim);
        App.get().requestFrameUpdate();
      };
      this._txImage = img;
    }
  }
  /**@type {import('./widgets.js').EventCallbackNullable} */
  on_drawBatch(e, o, v) {
    App.get().requestFrameUpdate();
  }
  /**@param {string|HTMLImageElement} val*/
  set src(val) {
    this._setTextureSource(val);
  }
  /**@returns {string|HTMLImageElement} */
  get src() {
    if (this._txImage instanceof HTMLImageElement) {
      return this._txImage.src;
    }
    return "";
  }
  /**
   * Adds a tile to the batch of tiles to be drawn by the renderer during the `draw` call.
   * @param {number} sx source x position (left)
   * @param {number} sy source y position (top)
   * @param {number} sw source width
   * @param {number} sh source height
   * @param {number} dx destination x position (left)
   * @param {number} dy destination y position (top)
   * @param {number} dw destination width
   * @param {number} dh destination height
   * @param {[number, number, number, number]} tint rgba values (all between 0 and 1) to write
   * @param {number|undefined} angle angle in radians
   */
  addTile(sx, sy, sw, sh, dx, dy, dw, dh, tint, angle = void 0) {
    if (angle !== void 0) {
      this.drawBatch.push({ sx, sy, sw, sh, dx, dy, dw, dh, tint, angle });
    } else {
      this.drawBatch.push({ sx, sy, sw, sh, dx, dy, dw, dh, tint });
    }
    App.get().requestFrameUpdate();
  }
  /**@type {Widget['draw']} */
  draw(app, ctx) {
    console.log("draw");
    const glRend = this.webglRenderer;
    glRend.canvas.width = this.w * this.txTileDim;
    glRend.canvas.height = this.h * this.txTileDim;
    glRend.start(this.txTileDim);
    glRend.clear(0, 0, 0, 0);
    for (let { sx, sy, sw, sh, dx, dy, dw, dh, tint, angle } of this.drawBatch) {
      if (angle !== void 0) {
        glRend.flush();
        glRend.setRotation(angle, dx + dw / 2, dy + dh / 2);
        glRend.drawTexture("texture", sx, sy, sw, sh, dx, dy, dw, dh, tint);
        glRend.flush();
        glRend.setRotation(0, 0, 0);
      } else {
        glRend.drawTexture("texture", sx, sy, sw, sh, dx, dy, dw, dh, tint);
      }
    }
    glRend.flush();
    ctx.drawImage(glRend.canvas, 0, 0, glRend.canvas.width, glRend.canvas.height, this.x, this.y, this.w, this.h);
  }
}
const T = {
  FLOOR: 0,
  ROCK: 1,
  WALL: 2,
  TORCH: 3,
  SMELTER: 4,
  FORGE: 5,
  TRAP_BENCH: 6,
  JEWELER: 7,
  DOOR: 8,
  MASON: 9,
  WOOD_HOPPER: 10,
  COAL_HOPPER: 11
};
const ORE = {
  NONE: 0,
  GRANITE: 1,
  IRON: 2,
  COPPER: 3,
  GOLD: 4,
  COAL: 5,
  RUBY: 6,
  EMERALD: 7,
  DIAMOND: 8
};
function isWorkshopTile(tile) {
  return tile === T.SMELTER || tile === T.FORGE || tile === T.TRAP_BENCH || tile === T.JEWELER || tile === T.MASON;
}
function isDoorOrWallTile(tile) {
  return tile === T.DOOR || tile === T.WALL;
}
function isWorkshopOrTorchTile(tile) {
  return isWorkshopTile(tile) || tile === T.TORCH;
}
function isStealableDepotTile(tile) {
  return tile === T.WOOD_HOPPER || tile === T.COAL_HOPPER || isWorkshopTile(tile);
}
class World {
  constructor(size) {
    /** @type {XY} */
    __publicField(this, "size");
    /** @type {Grid2D} */
    __publicField(this, "tiles");
    /** @type {Grid2D} */
    __publicField(this, "explored");
    /** @type {Grid2D} */
    __publicField(this, "visible");
    /** @type {Grid2D} */
    __publicField(this, "ore");
    /** @type {Grid2D} */
    __publicField(this, "light");
    this.size = size;
    this.tiles = new Grid2D(size).fill(T.ROCK);
    this.explored = new Grid2D(size).fill(0);
    this.visible = new Grid2D(size).fill(0);
    this.ore = new Grid2D(size).fill(ORE.NONE);
    this.light = new Grid2D(size).fill(0);
  }
  index(xy) {
    return xy[0] + xy[1] * this.size[0];
  }
  posFromIndex(index) {
    return (
      /** @type {XY} */
      [index % this.size[0], Math.floor(index / this.size[0])]
    );
  }
  inBounds(xy) {
    return xy[0] >= 0 && xy[1] >= 0 && xy[0] < this.size[0] && xy[1] < this.size[1];
  }
  isWalkable(xy) {
    if (!this.inBounds(xy)) return false;
    const t = this.tiles.get(xy);
    return t === T.FLOOR || t === T.TORCH || t === T.SMELTER || t === T.FORGE || t === T.TRAP_BENCH || t === T.JEWELER || t === T.DOOR || t === T.MASON || t === T.WOOD_HOPPER || t === T.COAL_HOPPER;
  }
  isOpaque(xy) {
    if (!this.inBounds(xy)) return true;
    const t = this.tiles.get(xy);
    return t === T.ROCK || t === T.WALL || t === T.DOOR;
  }
}
function samePos(a2, b) {
  return a2[0] === b[0] && a2[1] === b[1];
}
function isAdjacent4(a2, b) {
  const dx = Math.abs(a2[0] - b[0]);
  const dy = Math.abs(a2[1] - b[1]);
  return dx + dy === 1;
}
function manhattan(a2, b) {
  return Math.abs(a2[0] - b[0]) + Math.abs(a2[1] - b[1]);
}
function isMapEdge(size, pos) {
  return pos[0] === 0 || pos[1] === 0 || pos[0] === size[0] - 1 || pos[1] === size[1] - 1;
}
function* neighbors4(xy) {
  yield (
    /** @type {XY} */
    [xy[0] + 1, xy[1]]
  );
  yield (
    /** @type {XY} */
    [xy[0] - 1, xy[1]]
  );
  yield (
    /** @type {XY} */
    [xy[0], xy[1] + 1]
  );
  yield (
    /** @type {XY} */
    [xy[0], xy[1] - 1]
  );
}
function buildOccupiedSet(sim, excludeId = null) {
  const occupied = /* @__PURE__ */ new Set();
  for (const e of sim.entities.values()) {
    if (excludeId !== null && e.id === excludeId) continue;
    occupied.add(sim.world.index(e.pos));
  }
  return occupied;
}
function bfsFirstStep(sim, start, options) {
  const W = sim.world.size[0];
  const H = sim.world.size[1];
  const total = W * H;
  const visited = new Array(total).fill(false);
  const prev = new Array(total).fill(-1);
  const queue = [];
  const startIdx = start[0] + start[1] * W;
  if (!options.canEnter(start)) return null;
  queue.push(start);
  visited[startIdx] = true;
  for (let qi = 0; qi < queue.length; qi++) {
    const pos = queue[qi];
    const posIdx = pos[0] + pos[1] * W;
    if (options.isGoal(pos)) {
      const step = reconstructFirstStep(prev, startIdx, posIdx, W);
      return { found: [pos[0], pos[1]], step };
    }
    for (const nb0 of sim.world.tiles.iterAdjacent(pos)) {
      const nb = (
        /** @type {XY} */
        [nb0[0], nb0[1]]
      );
      if (!options.canEnter(nb)) continue;
      const nIdx = nb[0] + nb[1] * W;
      if (visited[nIdx]) continue;
      visited[nIdx] = true;
      prev[nIdx] = posIdx;
      queue.push(nb);
    }
  }
  return null;
}
function buildDwarfCostGrid(sim, dwarfId, occupiedPathCost) {
  const W = sim.world.size[0];
  const H = sim.world.size[1];
  const total = W * H;
  const costs = new Array(total).fill(Infinity);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (sim.world.isWalkable([x, y])) costs[x + y * W] = 1;
    }
  }
  for (const e of sim.entities.values()) {
    if (e.id === dwarfId) continue;
    const idx = e.pos[0] + e.pos[1] * W;
    if (e.kind === "chief") {
      costs[idx] = Infinity;
    } else if (e.kind === "dwarf" || e.kind === "enemy") {
      costs[idx] = Math.max(costs[idx], occupiedPathCost);
    }
  }
  return costs;
}
function costedBFSPath(costGrid, W, H, origin, dest) {
  if (samePos(origin, dest)) return [];
  const total = W * H;
  const distances = new Array(total).fill(Infinity);
  const oIdx = origin[0] + origin[1] * W;
  const dIdx = dest[0] + dest[1] * W;
  distances[oIdx] = 0;
  let candidates = [origin];
  let deferred = [];
  let done = false;
  while (candidates.length > 0 && !done) {
    const newCandidates = [];
    for (const pos of candidates) {
      const pIdx = pos[0] + pos[1] * W;
      for (const n0 of neighbors4(pos)) {
        const nx = n0[0];
        const ny = n0[1];
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const nIdx = nx + ny * W;
        const cost = costGrid[nIdx];
        if (cost === Infinity) continue;
        if (distances[pIdx] + cost < distances[nIdx]) {
          if (nIdx === dIdx) done = true;
          distances[nIdx] = distances[pIdx] + cost;
          if (cost > 1 && !done) deferred.push([n0, cost]);
          else newCandidates.push(n0);
        }
      }
    }
    const newDeferred = [];
    for (const posCost of deferred) {
      if (posCost[1] > 1) {
        posCost[1]--;
        newDeferred.push(posCost);
      } else {
        newCandidates.push(posCost[0]);
      }
    }
    deferred = newDeferred;
    candidates = newCandidates;
  }
  if (distances[dIdx] === Infinity) return [];
  const route = [];
  let current = [dest[0], dest[1]];
  while (!samePos(current, origin)) {
    let lowest = Infinity;
    let nextCurrent = null;
    for (const candidate of neighbors4(current)) {
      const nx = candidate[0];
      const ny = candidate[1];
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const dist2 = distances[nx + ny * W];
      if (dist2 < lowest) {
        lowest = dist2;
        nextCurrent = candidate;
      }
    }
    route.unshift(current);
    if (nextCurrent) current = nextCurrent;
    else break;
  }
  return route;
}
function reconstructFirstStep(prev, startIdx, destIdx, W) {
  if (destIdx === startIdx) return null;
  let current = destIdx;
  let prevIdx = prev[current];
  while (prevIdx !== -1 && prevIdx !== startIdx) {
    current = prevIdx;
    prevIdx = prev[current];
  }
  if (prevIdx === -1) return null;
  return (
    /** @type {XY} */
    [current % W, Math.floor(current / W)]
  );
}
const CARRY_CAPACITY = 4;
const MIN_WORKSHOP_FLOOR_TILES = 8;
const DOOR_HP = 9;
const WORKSHOP_HP = 10;
const WALL_HP = 8;
const DEFAULT_MINE_RADIUS = 8;
function oreValue(oreId) {
  if (oreId === ORE.DIAMOND) return 6;
  if (oreId === ORE.EMERALD) return 5;
  if (oreId === ORE.RUBY) return 5;
  if (oreId === ORE.GOLD) return 4;
  if (oreId === ORE.IRON) return 3;
  if (oreId === ORE.COPPER) return 2;
  if (oreId === ORE.COAL) return 2;
  if (oreId === ORE.GRANITE) return 1;
  return 0;
}
const RESOURCE_GROUPS = [
  { id: "granite", label: "Granite", raw: ["raw_granite"], processed: ["polished_granite"] },
  { id: "iron", label: "Iron", raw: ["raw_iron"], processed: ["refined_iron"] },
  { id: "copper", label: "Copper", raw: ["raw_copper"], processed: ["refined_copper"] },
  { id: "gold", label: "Gold", raw: ["raw_gold"], processed: ["refined_gold"] },
  { id: "gems", label: "Gems", raw: ["raw_ruby", "raw_emerald", "raw_diamond", "raw_gem"], processed: ["jewelery"] },
  { id: "wood", label: "Wood", raw: ["wood"], processed: [] },
  { id: "coal", label: "Coal", raw: ["coal"], processed: [] }
];
const DEFAULT_CONFIG = (
  /** @type {GameSimConfig} */
  {
    dayLength: 600,
    workshopJobTicks: 10,
    workshopQueueCap: 3,
    enemySpawnEvery: 50,
    viewRadius: 10,
    lightRadius: 10,
    lightFalloffPow: 2,
    lightIntensity: 1,
    ambientLight: 0.25,
    memoryTint: 0.5,
    guardChaseRadius: 20,
    startingResources: {
      raw_granite: 0,
      raw_iron: 0,
      raw_copper: 0,
      raw_gold: 0,
      raw_ruby: 0,
      raw_emerald: 0,
      raw_diamond: 0,
      raw_gem: 0,
      polished_granite: 0,
      refined_iron: 0,
      refined_copper: 0,
      refined_gold: 0,
      food: 8,
      wood: 6,
      coal: 6,
      jewelery: 0
    }
  }
);
const BUILD_COSTS = (
  /** @type {Record<BuildKind, Record<string, number>>} */
  {
    wall: { raw_granite: 2 },
    door: { raw_granite: 1, wood: 1 },
    torch: { wood: 1, coal: 1 },
    smelter: { raw_granite: 3, wood: 1 },
    forge: { raw_granite: 3, wood: 1 },
    trap_bench: { raw_granite: 3, wood: 1 },
    jeweler: { raw_granite: 3, wood: 1 },
    mason: { raw_granite: 3, wood: 1 }
  }
);
const BUILD_TO_TILE = (
  /** @type {Record<BuildKind, number>} */
  {
    wall: T.WALL,
    door: T.DOOR,
    torch: T.TORCH,
    smelter: T.SMELTER,
    forge: T.FORGE,
    trap_bench: T.TRAP_BENCH,
    jeweler: T.JEWELER,
    mason: T.MASON
  }
);
const WORKSHOP_BUILDS = /* @__PURE__ */ new Set(["smelter", "forge", "trap_bench", "jeweler", "mason"]);
const REMOVABLE_TILES = /* @__PURE__ */ new Set([T.WALL, T.TORCH, T.SMELTER, T.FORGE, T.TRAP_BENCH, T.JEWELER, T.DOOR, T.MASON]);
const ITEM_SPECS = (
  /** @type {Record<string, ItemSpec>} */
  {
    pickaxe: { id: "pickaxe", label: "Pickaxe", slot: "tool" },
    adorned_pickaxe: { id: "adorned_pickaxe", label: "Adorned Pickaxe", slot: "tool" },
    hammer: { id: "hammer", label: "Hammer", slot: "tool" },
    adorned_hammer: { id: "adorned_hammer", label: "Adorned Hammer", slot: "tool" },
    sword: { id: "sword", label: "Sword", slot: "weapon" },
    adorned_sword: { id: "adorned_sword", label: "Adorned Sword", slot: "weapon" },
    battle_axe: { id: "battle_axe", label: "Battle Axe", slot: "weapon" },
    adorned_battle_axe: { id: "adorned_battle_axe", label: "Adorned Battle Axe", slot: "weapon" },
    battle_hammer: { id: "battle_hammer", label: "Battle Hammer", slot: "weapon" },
    adorned_battle_hammer: { id: "adorned_battle_hammer", label: "Adorned Battle Hammer", slot: "weapon" },
    helmet: { id: "helmet", label: "Helmet", slot: "head" },
    adorned_helmet: { id: "adorned_helmet", label: "Adorned Helmet", slot: "head" },
    chainmail: { id: "chainmail", label: "Chainmail", slot: "armor" },
    adorned_chainmail: { id: "adorned_chainmail", label: "Adorned Chainmail", slot: "armor" },
    platemail: { id: "platemail", label: "Platemail", slot: "armor" },
    adorned_platemail: { id: "adorned_platemail", label: "Adorned Platemail", slot: "armor" },
    shield: { id: "shield", label: "Shield", slot: "offhand" },
    adorned_shield: { id: "adorned_shield", label: "Adorned Shield", slot: "offhand" }
  }
);
const ROLE_KIT_BASE_ITEMS = (
  /** @type {Record<import('./types.js').DwarfOrderKind, string[]>} */
  {
    idle: ["helmet"],
    guard: ["sword", "shield", "helmet", "chainmail"],
    mine: ["pickaxe", "helmet", "chainmail"],
    haul: ["hammer", "helmet"],
    build: ["hammer", "helmet"],
    operate: ["hammer", "helmet"]
  }
);
const ROLE_EQUIP_PREFERENCES = (
  /** @type {Record<import('./types.js').DwarfOrderKind, Partial<Record<import('./types.js').ItemSlot, string[]>>>} */
  {
    idle: { head: ["adorned_helmet", "helmet"] },
    guard: {
      weapon: ["adorned_sword", "sword", "adorned_battle_axe", "battle_axe", "adorned_battle_hammer", "battle_hammer"],
      offhand: ["adorned_shield", "shield"],
      head: ["adorned_helmet", "helmet"],
      armor: ["adorned_platemail", "platemail", "adorned_chainmail", "chainmail"]
    },
    mine: {
      tool: ["adorned_pickaxe", "pickaxe"],
      head: ["adorned_helmet", "helmet"],
      armor: ["adorned_chainmail", "chainmail", "adorned_platemail", "platemail"]
    },
    haul: {
      tool: ["adorned_hammer", "hammer"],
      head: ["adorned_helmet", "helmet"]
    },
    build: {
      tool: ["adorned_hammer", "hammer"],
      head: ["adorned_helmet", "helmet"]
    },
    operate: {
      tool: ["adorned_hammer", "hammer"],
      head: ["adorned_helmet", "helmet"]
    }
  }
);
const BASE_ITEM_VARIANTS = (
  /** @type {Record<string, string[]>} */
  {
    pickaxe: ["pickaxe", "adorned_pickaxe"],
    hammer: ["hammer", "adorned_hammer"],
    sword: ["sword", "adorned_sword"],
    battle_axe: ["battle_axe", "adorned_battle_axe"],
    battle_hammer: ["battle_hammer", "adorned_battle_hammer"],
    helmet: ["helmet", "adorned_helmet"],
    chainmail: ["chainmail", "adorned_chainmail"],
    platemail: ["platemail", "adorned_platemail"],
    shield: ["shield", "adorned_shield"]
  }
);
const RECRUIT_ARCHETYPES = (
  /** @type {import('./types.js').RecruitOption[]} */
  [
    { id: "miner", label: "Tunnel Scout", summary: "Fast miner, light kit", hp: 9, loadout: ["pickaxe", "helmet"], role: "mine" },
    { id: "guard", label: "Shield Guard", summary: "Tough frontliner", hp: 12, loadout: ["sword", "shield"], role: "guard" },
    { id: "builder", label: "Stonewright", summary: "Builder with armor", hp: 10, loadout: ["hammer", "chainmail"], role: "build" },
    { id: "hauler", label: "Pack Hauler", summary: "Utility runner", hp: 11, loadout: ["hammer", "helmet"], role: "haul" },
    { id: "operator", label: "Forge Hand", summary: "Workshop specialist", hp: 10, loadout: ["hammer", "shield"], role: "operate" }
  ]
);
const WORKSHOP_RECIPES = (
  /** @type {Record<WorkshopKind, WorkshopRecipe[]>} */
  {
    smelter: [
      { id: "smelt_iron", inputs: { raw_iron: 2 }, outputs: { refined_iron: 1 }, outputTiming: "immediate" },
      { id: "smelt_copper", inputs: { raw_copper: 2 }, outputs: { refined_copper: 1 }, outputTiming: "immediate" },
      { id: "smelt_gold", inputs: { raw_gold: 2 }, outputs: { refined_gold: 1 }, outputTiming: "immediate" }
    ],
    mason: [
      { id: "cut_granite", inputs: { raw_granite: 2 }, outputs: { polished_granite: 1 }, outputTiming: "immediate" }
    ],
    jeweler: [
      { id: "cut_ruby", inputs: { raw_ruby: 1 }, outputs: { jewelery: 1 }, outputTiming: "endOfDay" },
      { id: "cut_emerald", inputs: { raw_emerald: 1 }, outputs: { jewelery: 1 }, outputTiming: "endOfDay" },
      { id: "cut_diamond", inputs: { raw_diamond: 1 }, outputs: { jewelery: 2 }, outputTiming: "endOfDay" }
    ],
    forge: [
      { id: "forge_pickaxe", inputs: { refined_iron: 2, wood: 1 }, outputs: { pickaxe: 1 }, outputTiming: "endOfDay" },
      { id: "forge_adorned_pickaxe", inputs: { refined_iron: 2, wood: 1, jewelery: 1 }, outputs: { adorned_pickaxe: 1 }, outputTiming: "endOfDay" },
      { id: "forge_hammer", inputs: { refined_iron: 2, wood: 1 }, outputs: { hammer: 1 }, outputTiming: "endOfDay" },
      { id: "forge_adorned_hammer", inputs: { refined_iron: 2, wood: 1, jewelery: 1 }, outputs: { adorned_hammer: 1 }, outputTiming: "endOfDay" },
      { id: "forge_sword", inputs: { refined_iron: 3, wood: 1 }, outputs: { sword: 1 }, outputTiming: "endOfDay" },
      { id: "forge_adorned_sword", inputs: { refined_iron: 3, wood: 1, jewelery: 1 }, outputs: { adorned_sword: 1 }, outputTiming: "endOfDay" },
      { id: "forge_battle_axe", inputs: { refined_iron: 4, wood: 1 }, outputs: { battle_axe: 1 }, outputTiming: "endOfDay" },
      { id: "forge_adorned_battle_axe", inputs: { refined_iron: 4, wood: 1, jewelery: 1 }, outputs: { adorned_battle_axe: 1 }, outputTiming: "endOfDay" },
      { id: "forge_battle_hammer", inputs: { refined_iron: 4, wood: 1 }, outputs: { battle_hammer: 1 }, outputTiming: "endOfDay" },
      { id: "forge_adorned_battle_hammer", inputs: { refined_iron: 4, wood: 1, jewelery: 1 }, outputs: { adorned_battle_hammer: 1 }, outputTiming: "endOfDay" },
      { id: "forge_helmet", inputs: { refined_iron: 2 }, outputs: { helmet: 1 }, outputTiming: "endOfDay" },
      { id: "forge_adorned_helmet", inputs: { refined_iron: 2, jewelery: 1 }, outputs: { adorned_helmet: 1 }, outputTiming: "endOfDay" },
      { id: "forge_chainmail", inputs: { refined_iron: 4 }, outputs: { chainmail: 1 }, outputTiming: "endOfDay" },
      { id: "forge_adorned_chainmail", inputs: { refined_iron: 4, jewelery: 1 }, outputs: { adorned_chainmail: 1 }, outputTiming: "endOfDay" },
      { id: "forge_platemail", inputs: { refined_iron: 6 }, outputs: { platemail: 1 }, outputTiming: "endOfDay" },
      { id: "forge_adorned_platemail", inputs: { refined_iron: 6, jewelery: 1 }, outputs: { adorned_platemail: 1 }, outputTiming: "endOfDay" },
      { id: "forge_shield", inputs: { refined_iron: 2, wood: 1 }, outputs: { shield: 1 }, outputTiming: "endOfDay" },
      { id: "forge_adorned_shield", inputs: { refined_iron: 2, wood: 1, jewelery: 1 }, outputs: { adorned_shield: 1 }, outputTiming: "endOfDay" }
    ],
    trap_bench: []
  }
);
const WORKSHOP_RULES = (
  /** @type {Record<WorkshopKind, WorkshopRule[]>} */
  {
    smelter: [
      { if: { resource: "raw_iron", min: 2 }, recipeId: "smelt_iron" },
      { if: { resource: "raw_copper", min: 2 }, recipeId: "smelt_copper" },
      { if: { resource: "raw_gold", min: 2 }, recipeId: "smelt_gold" }
    ],
    mason: [
      { if: { resource: "raw_granite", min: 2 }, recipeId: "cut_granite" }
    ],
    jeweler: [
      { if: { resource: "raw_ruby", min: 1 }, recipeId: "cut_ruby" },
      { if: { resource: "raw_emerald", min: 1 }, recipeId: "cut_emerald" },
      { if: { resource: "raw_diamond", min: 1 }, recipeId: "cut_diamond" }
    ],
    forge: [],
    trap_bench: []
  }
);
const RAW_TO_PROCESSED = {
  raw_granite: "polished_granite",
  raw_iron: "refined_iron",
  raw_copper: "refined_copper",
  raw_gold: "refined_gold"
};
const TILE_TO_WORKSHOP = {
  [T.SMELTER]: "smelter",
  [T.FORGE]: "forge",
  [T.TRAP_BENCH]: "trap_bench",
  [T.JEWELER]: "jeweler",
  [T.MASON]: "mason"
};
function sumResources(map, keys) {
  let total = 0;
  for (const k of keys) total += map[k] ?? 0;
  return total;
}
function baseItemId(itemId) {
  if (typeof itemId === "string" && itemId.startsWith("adorned_")) {
    return itemId.slice("adorned_".length);
  }
  return itemId;
}
function workshopAcceptsResource(kind, resourceKind) {
  var _a;
  const recipes = WORKSHOP_RECIPES[kind] ?? [];
  for (const recipe of recipes) {
    if (((_a = recipe.inputs) == null ? void 0 : _a[resourceKind]) && recipe.inputs[resourceKind] > 0) return true;
  }
  return false;
}
function createEnemy(id, pos, type = "rat") {
  const spec = getEnemyType(type);
  return {
    id,
    kind: "enemy",
    type: spec.id,
    archetype: spec.archetype,
    pos: [pos[0], pos[1]],
    hp: spec.hp,
    state: spec.state ?? "idle",
    goal: spec.goal ? { ...spec.goal } : null
  };
}
const ENEMY_TYPES = {
  rat: { id: "rat", name: "Tunnel Rat", archetype: "annoyance", hp: 4, state: "seek", goal: { kind: "harass" } },
  kobold: { id: "kobold", name: "Kobold Sneak", archetype: "annoyance", hp: 6, state: "seek", goal: { kind: "steal" } },
  goblin: { id: "goblin", name: "Goblin Skirmisher", archetype: "swarm", hp: 8, state: "seek", goal: { kind: "breach" } },
  sapper: { id: "sapper", name: "Sapper Demolitionist", archetype: "swarm", hp: 10, state: "siege", goal: { kind: "breach" } },
  ogre: { id: "ogre", name: "Ogre Breaker", archetype: "bigbad", hp: 18, state: "siege", goal: { kind: "destroy" } }
};
const WAVE_TEMPLATES = [
  { id: "steal_scaling", minDay: 0, weight: 6, goal: "steal", spawnEvery: 3, members: [{ type: "kobold", min: 1, max: 1 }] },
  { id: "goblin_breach", minDay: 1, weight: 3, goal: "breach", spawnEvery: 2, members: [{ type: "goblin", min: 4, max: 8 }, { type: "sapper", min: 1, max: 2 }] },
  { id: "sapper_team", minDay: 1, weight: 2, goal: "breach", spawnEvery: 2, members: [{ type: "sapper", min: 2, max: 3 }, { type: "goblin", min: 2, max: 4 }] },
  { id: "ogre_breaker", minDay: 2, weight: 1, goal: "destroy", spawnEvery: 3, members: [{ type: "ogre", min: 1, max: 1 }, { type: "goblin", min: 3, max: 6 }, { type: "sapper", min: 1, max: 1 }] },
  { id: "assassin_push", minDay: 2, weight: 2, goal: "kill", spawnEvery: 2, members: [{ type: "kobold", min: 3, max: 5 }, { type: "goblin", min: 2, max: 4 }] }
];
function pickWaveTemplate(day) {
  const candidates = WAVE_TEMPLATES.filter((t) => day >= t.minDay && (t.maxDay === void 0 || day <= t.maxDay));
  if (candidates.length === 0) return null;
  let total = 0;
  for (const c of candidates) total += c.weight;
  let r = Math.random() * total;
  for (const c of candidates) {
    r -= c.weight;
    if (r <= 0) return c;
  }
  return candidates[0];
}
function buildWaveMembers(template, day) {
  var _a;
  const out = [];
  if (template.id === "steal_scaling") {
    const count = Math.max(1, day + 1);
    const type = day <= 0 ? "rat" : "kobold";
    for (let i = 0; i < count; i++) out.push(type);
    shuffle(out);
    return out;
  }
  for (const spec of template.members) {
    const count = spec.min + Math.floor(Math.random() * (spec.max - spec.min + 1));
    for (let i = 0; i < count; i++) out.push(spec.type);
  }
  if (out.length < 4) {
    const fillType = ((_a = template.members[0]) == null ? void 0 : _a.type) ?? "rat";
    while (out.length < 4) out.push(fillType);
  }
  if (out.length > 20) out.length = 20;
  shuffle(out);
  return out;
}
function getEnemyType(type) {
  return ENEMY_TYPES[type] ?? ENEMY_TYPES.rat;
}
function nextEnemyAction(enemy, sim) {
  var _a;
  const goalKind = ((_a = enemy.goal) == null ? void 0 : _a.kind) ?? defaultGoalForEnemy(enemy);
  const carryingLoot = !!(enemy.carry && enemy.carry.amount > 0);
  if (enemy.type === "rat" && carryingLoot) {
    const escapeStep = bfsToMapEdge(sim, enemy);
    if (!escapeStep) return null;
    if (!escapeStep.step) return { type: "escape", id: enemy.id };
    return {
      type: "move",
      id: enemy.id,
      dir: [escapeStep.step[0] - enemy.pos[0], escapeStep.step[1] - enemy.pos[1]]
    };
  }
  const adjacentVictim = findAdjacentVictim(sim, enemy);
  if (adjacentVictim && (goalKind === "kill" || enemy.archetype !== "annoyance")) {
    return { type: "attack", id: enemy.id, target: adjacentVictim.pos };
  }
  if (enemy.type === "sapper" && (goalKind === "breach" || goalKind === "destroy" || goalKind === "kill")) {
    const sapperBreach = pickSapperBreachToward(sim, enemy, findChiefPos(sim));
    if (sapperBreach) return { type: "breach", id: enemy.id, target: sapperBreach };
  }
  if (goalKind === "steal") {
    const stealStep = bfsToAdjacentTarget(sim, enemy, isStealableDepotTile);
    if (!stealStep) return null;
    if (!stealStep.step) {
      return { type: "steal", id: enemy.id, target: stealStep.target };
    }
    return {
      type: "move",
      id: enemy.id,
      dir: [stealStep.step[0] - enemy.pos[0], stealStep.step[1] - enemy.pos[1]]
    };
  }
  if (goalKind === "kill") {
    const step = bfsTowardEnemyGoal(sim, enemy, findChiefPos(sim));
    if (!step) {
      const targetStep = bfsToAdjacentTarget(sim, enemy, isDoorOrWallTile) ?? bfsToAdjacentTarget(sim, enemy, isWorkshopOrTorchTile);
      if (targetStep) {
        if (!targetStep.step) {
          return { type: "breach", id: enemy.id, target: targetStep.target };
        }
        return {
          type: "move",
          id: enemy.id,
          dir: [targetStep.step[0] - enemy.pos[0], targetStep.step[1] - enemy.pos[1]]
        };
      }
      return null;
    }
    if (step.step) {
      return { type: "move", id: enemy.id, dir: [step.step[0] - enemy.pos[0], step.step[1] - enemy.pos[1]] };
    }
    return null;
  }
  if (goalKind === "breach" || goalKind === "destroy") {
    const targetStep = bfsToAdjacentTarget(sim, enemy, isDoorOrWallTile) ?? bfsToAdjacentTarget(sim, enemy, isWorkshopOrTorchTile);
    if (targetStep) {
      if (!targetStep.step) {
        return { type: "breach", id: enemy.id, target: targetStep.target };
      }
      return {
        type: "move",
        id: enemy.id,
        dir: [targetStep.step[0] - enemy.pos[0], targetStep.step[1] - enemy.pos[1]]
      };
    }
    if (enemy.type === "sapper") {
      const sapperBreach = pickSapperBreachToward(sim, enemy, findChiefPos(sim));
      if (sapperBreach) return { type: "breach", id: enemy.id, target: sapperBreach };
    }
  }
  if (adjacentVictim) {
    return { type: "attack", id: enemy.id, target: adjacentVictim.pos };
  }
  return null;
}
function defaultGoalForEnemy(enemy) {
  if (enemy.type === "rat") return "steal";
  if (enemy.type === "kobold") return "steal";
  if (enemy.type === "goblin") return "breach";
  if (enemy.type === "sapper") return "breach";
  if (enemy.type === "ogre") return "destroy";
  return "harass";
}
function findChiefPos(sim) {
  const chief = sim.chief;
  if (!chief) return null;
  return [chief.pos[0], chief.pos[1]];
}
function bfsTowardEnemyGoal(sim, enemy, target) {
  if (!target) return null;
  return bfsToAdjacentPos(sim, enemy, target);
}
function bfsToMapEdge(sim, enemy) {
  const occupied = buildOccupiedSet(sim, enemy.id);
  const result = bfsFirstStep(sim, enemy.pos, {
    canEnter: (pos) => isWalkableForEnemy(sim, enemy, pos, occupied),
    isGoal: (pos) => isMapEdge(sim.world.size, pos)
  });
  if (!result) return null;
  return { target: [result.found[0], result.found[1]], step: result.step };
}
function bfsToAdjacentPos(sim, enemy, target) {
  const occupied = buildOccupiedSet(sim, enemy.id);
  const result = bfsFirstStep(sim, enemy.pos, {
    canEnter: (pos) => isWalkableForEnemy(sim, enemy, pos, occupied),
    isGoal: (pos) => isAdjacent4(pos, target) || samePos(pos, target)
  });
  if (!result) return null;
  return { target: [target[0], target[1]], step: result.step };
}
function bfsToAdjacentTarget(sim, enemy, isTargetTile) {
  const occupied = buildOccupiedSet(sim, enemy.id);
  const result = bfsFirstStep(sim, enemy.pos, {
    canEnter: (pos) => isWalkableForEnemy(sim, enemy, pos, occupied),
    isGoal: (pos) => !!findTargetAtOrAdjacent(sim, pos, isTargetTile)
  });
  if (!result) return null;
  const target = findTargetAtOrAdjacent(sim, result.found, isTargetTile);
  if (!target) return null;
  return { target, step: result.step };
}
function isWalkableForEnemy(sim, enemy, pos, occupiedKeys = null) {
  if (!sim.world.inBounds(pos)) return false;
  const tile = sim.world.tiles.get(pos);
  if (!sim.world.isWalkable(pos)) return false;
  if (tile === T.DOOR && enemy.type !== "rat") return false;
  if (isWorkshopTile(tile) && enemy.type !== "rat") {
    return false;
  }
  if (occupiedKeys && occupiedKeys.has(sim.world.index(pos))) return false;
  return true;
}
function findTargetAtOrAdjacent(sim, pos, isTargetTile) {
  if (isTargetTile(sim.world.tiles.get(pos))) return [pos[0], pos[1]];
  for (const nb0 of sim.world.tiles.iterAdjacent(pos)) {
    const nb = (
      /** @type {XY} */
      [nb0[0], nb0[1]]
    );
    const t = sim.world.tiles.get(nb);
    if (isTargetTile(t)) return [nb[0], nb[1]];
  }
  return null;
}
function pickSapperBreachToward(sim, enemy, target) {
  if (!target) return null;
  const dx = Math.sign(target[0] - enemy.pos[0]);
  const dy = Math.sign(target[1] - enemy.pos[1]);
  const candidates = [];
  if (dx !== 0) candidates.push([enemy.pos[0] + dx, enemy.pos[1]]);
  if (dy !== 0) candidates.push([enemy.pos[0], enemy.pos[1] + dy]);
  for (const pos of candidates) {
    if (!sim.world.inBounds(pos)) continue;
    const tile = sim.world.tiles.get(pos);
    if (tile === T.ROCK || isDoorOrWallTile(tile) || isWorkshopOrTorchTile(tile)) return pos;
  }
  return null;
}
function findAdjacentVictim(sim, enemy) {
  for (const e of sim.entities.values()) {
    if (e.kind === "enemy") continue;
    if (isAdjacent4(enemy.pos, e.pos)) return e;
  }
  return null;
}
function _healAllEntities(sim) {
  for (const e of sim.entities.values()) {
    const maxHp = _getMaxHp(sim, e);
    if (maxHp <= 0) continue;
    e.hp = maxHp;
  }
}
function _regenDwarves(sim, amount) {
  for (const e of sim.entities.values()) {
    if (e.kind !== "chief" && e.kind !== "dwarf") continue;
    const maxHp = _getMaxHp(sim, e);
    if (maxHp <= 0) continue;
    e.hp = Math.min(maxHp, e.hp + amount);
  }
}
function _returnToHold(sim) {
  for (const e of sim.entities.values()) {
    if (e.kind === "enemy") continue;
    if (_isInHold(sim, e.pos)) continue;
    const spot = _findHoldReturnSpot(sim, e);
    if (spot) e.pos = spot;
  }
}
function _findHoldReturnSpot(sim, entity) {
  const hold = sim.hold;
  if (!hold) return null;
  const candidates = [];
  for (let y = hold.holdT; y <= hold.holdB; y++) {
    for (let x = hold.holdL; x <= hold.holdR; x++) {
      const pos = (
        /** @type {XY} */
        [x, y]
      );
      if (!sim.world.isWalkable(pos)) continue;
      if (_isOccupied(sim, pos)) continue;
      candidates.push(pos);
    }
  }
  if (candidates.length === 0) return null;
  let best = candidates[0];
  let bestDist = Math.abs(best[0] - entity.pos[0]) + Math.abs(best[1] - entity.pos[1]);
  for (const pos of candidates.slice(1)) {
    const d = Math.abs(pos[0] - entity.pos[0]) + Math.abs(pos[1] - entity.pos[1]);
    if (d < bestDist) {
      bestDist = d;
      best = pos;
    }
  }
  return [best[0], best[1]];
}
function _getMaxHp(sim, e) {
  if (e.kind === "chief") return 12;
  if (e.kind === "dwarf") return (
    /** @type {number|undefined} */
    e.maxHp ?? 10
  );
  if (e.kind === "enemy") {
    const spec = getEnemyType(e.type ?? "rat");
    return spec.hp ?? e.hp;
  }
  return 0;
}
function _spawnDwarfFromOption(sim, option = null) {
  const spawn = _findSpawnNear(sim, sim.hold ? [sim.hold.cx, sim.hold.cy] : sim.chief.pos);
  if (!spawn) return false;
  const dwarf = createDwarf(_nextEntityId(sim), spawn);
  if (option) {
    dwarf.hp = option.hp;
    dwarf.maxHp = option.hp;
    for (const itemId of option.loadout) {
      _equipDwarfItem(sim, dwarf, itemId);
    }
    const holdTarget = sim.hold ? [sim.hold.cx, sim.hold.cy] : [sim.chief.pos[0], sim.chief.pos[1]];
    if (option.role === "guard") {
      setDwarfOrder(dwarf, { kind: "guard", target: (
        /** @type {XY} */
        [holdTarget[0], holdTarget[1]]
      ) });
    } else if (option.role === "mine") {
      setDwarfOrder(dwarf, { kind: "mine", target: (
        /** @type {XY} */
        [holdTarget[0], holdTarget[1]]
      ), radius: 10 });
    } else {
      setDwarfOrder(dwarf, { kind: option.role });
    }
  }
  _equipTorch(sim, dwarf);
  sim.entities.set(dwarf.id, dwarf);
  return true;
}
function _equipDwarfItem(sim, dwarf, itemId) {
  const spec = ITEM_SPECS[itemId];
  if (!spec) return;
  if (!dwarf.equipment) {
    dwarf.equipment = { weapon: null, armor: null, head: null, offhand: null, tool: null };
  }
  const slot = spec.slot;
  if (!dwarf.equipment[slot]) dwarf.equipment[slot] = itemId;
}
function _equipTorch(sim, entity) {
  if (entity.kind !== "chief" && entity.kind !== "dwarf") return;
  entity.lightRadius = sim.config.lightRadius;
  entity.lightIntensity = sim.config.lightIntensity;
}
function _findSpawnNear(sim, origin) {
  const maxR = Math.max(sim.world.size[0], sim.world.size[1]);
  for (let r = 0; r <= maxR; r++) {
    for (let dy = -r; dy <= r; dy++) {
      const dx = r - Math.abs(dy);
      const candidates = [
        [origin[0] + dx, origin[1] + dy],
        [origin[0] - dx, origin[1] + dy]
      ];
      for (const c of candidates) {
        const pos = (
          /** @type {XY} */
          [c[0], c[1]]
        );
        if (!sim.world.inBounds(pos)) continue;
        if (!sim.world.isWalkable(pos)) continue;
        if (_isOccupied(sim, pos)) continue;
        return pos;
      }
    }
  }
  return null;
}
function _isInHold(sim, pos) {
  const hold = sim.hold;
  if (!hold) return false;
  return pos[0] >= hold.holdL && pos[0] <= hold.holdR && pos[1] >= hold.holdT && pos[1] <= hold.holdB;
}
function _isAtMapEdge(sim, pos) {
  return pos[0] === 0 || pos[1] === 0 || pos[0] === sim.world.size[0] - 1 || pos[1] === sim.world.size[1] - 1;
}
function _isOccupied(sim, pos) {
  for (const e of sim.entities.values()) {
    if (e.pos[0] === pos[0] && e.pos[1] === pos[1]) return true;
  }
  return false;
}
function _canSwapWithBlocker(sim, mover, blocker) {
  if (blocker.kind === "chief") return false;
  if (mover.kind === "dwarf" && blocker.kind === "dwarf") return true;
  if (mover.kind === "chief" && blocker.kind === "dwarf") return true;
  return false;
}
function _nextEntityId(sim) {
  let maxId = 0;
  for (const e of sim.entities.values()) {
    if (e.id > maxId) maxId = e.id;
  }
  return maxId + 1;
}
function _getEntityAt(sim, pos) {
  for (const e of sim.entities.values()) {
    if (e.pos[0] === pos[0] && e.pos[1] === pos[1]) return e;
  }
  return null;
}
function _isAdjacent(sim, a2, b) {
  return isAdjacent4(a2, b);
}
function _getAttackDamage(sim, entity) {
  if (entity.kind === "chief") return 3;
  if (entity.kind === "dwarf") return 2;
  if (entity.kind === "enemy") {
    const type = (
      /** @type {import('../enemies.js').EnemyState} */
      entity.type
    );
    if (type === "ogre") return 5;
    if (type === "goblin") return 3;
    if (type === "sapper") return 3;
    if (type === "kobold") return 2;
    if (type === "rat") return 1;
  }
  return 1;
}
function _snapshotDayStartRoles(sim) {
  var _a;
  const snap = {};
  for (const e of sim.entities.values()) {
    if (e.kind !== "dwarf") continue;
    const dwarf = (
      /** @type {import('../dwarves.js').DwarfState} */
      e
    );
    snap[dwarf.id] = ((_a = dwarf.order) == null ? void 0 : _a.kind) ?? "idle";
  }
  sim.dayStartRoles = snap;
}
const entities = {
  _healAllEntities,
  _regenDwarves,
  _returnToHold,
  _findHoldReturnSpot,
  _getMaxHp,
  _spawnDwarfFromOption,
  _equipDwarfItem,
  _equipTorch,
  _findSpawnNear,
  _isInHold,
  _isAtMapEdge,
  _isOccupied,
  _canSwapWithBlocker,
  _nextEntityId,
  _getEntityAt,
  _isAdjacent,
  _getAttackDamage,
  _snapshotDayStartRoles
};
function _registerWorkshop(sim, kind, pos) {
  const key = sim.world.index(pos);
  if (sim.workshops.has(key)) return;
  sim.workshops.set(key, { kind, pos: [pos[0], pos[1]], operatorId: null, queue: [], inProgress: null });
}
function _unregisterWorkshop(sim, pos) {
  const key = sim.world.index(pos);
  sim.workshops.delete(key);
}
function _assignWorkshopOperator(sim, pos, dwarfId) {
  const key = sim.world.index(pos);
  const ws = sim.workshops.get(key);
  if (!ws) return;
  ws.operatorId = dwarfId;
}
function _clearWorkshopOperator(sim, pos, dwarfId) {
  const key = sim.world.index(pos);
  const ws = sim.workshops.get(key);
  if (!ws) return;
  if (ws.operatorId === dwarfId) ws.operatorId = null;
}
function _processWorkshops(sim) {
  for (const ws of sim.workshops.values()) {
    if (!ws.operatorId) continue;
    const operator = sim.entities.get(ws.operatorId);
    if (!operator || operator.pos[0] !== ws.pos[0] || operator.pos[1] !== ws.pos[1]) continue;
    if (!ws.inProgress) {
      if (ws.queue.length === 0) _tryEnqueueWorkshopJob(sim, ws);
      if (ws.queue.length > 0) ws.inProgress = ws.queue.shift() ?? null;
    }
    if (!ws.inProgress) continue;
    ws.inProgress.remaining -= 1;
    if (ws.inProgress.remaining > 0) continue;
    const recipe = _getRecipe(sim, ws.kind, ws.inProgress.recipeId);
    if (recipe) {
      if (recipe.outputTiming === "immediate") {
        resources._addResources(sim, recipe.outputs);
      } else {
        resources._addDayOutputs(sim, recipe.outputs);
      }
    }
    ws.inProgress = null;
  }
}
function _tryEnqueueWorkshopJob(sim, ws) {
  if (ws.queue.length >= sim.config.workshopQueueCap) return;
  const recipeId = ws.kind === "forge" ? _pickForgeRecipeId(sim) : _pickRecipeIdFromRules(sim, ws);
  if (!recipeId) return;
  const recipe = _getRecipe(sim, ws.kind, recipeId);
  if (!recipe) return;
  if (!resources._hasResources(sim, recipe.inputs)) return;
  resources._spendResources(sim, recipe.inputs);
  ws.queue.push({ recipeId: recipe.id, remaining: recipe.ticks ?? sim.config.workshopJobTicks });
}
function _pickRecipeIdFromRules(sim, ws) {
  var _a;
  let rules = WORKSHOP_RULES[ws.kind] ?? [];
  const operator = ws.operatorId ? sim.entities.get(ws.operatorId) : null;
  if (operator && operator.kind === "dwarf") {
    const dwarf = (
      /** @type {import('../dwarves.js').DwarfState} */
      operator
    );
    const override = (_a = dwarf.workshopRules) == null ? void 0 : _a[ws.kind];
    if (override && override.length > 0) rules = override;
  }
  return _pickRecipeFromRules(sim, rules);
}
function _pickRecipeFromRules(sim, rules) {
  for (const rule of rules) {
    if (!rule.if) return rule.recipeId;
    const have = sim.resources[rule.if.resource] ?? 0;
    if (have >= rule.if.min) return rule.recipeId;
  }
  return null;
}
function _pickForgeRecipeId(sim) {
  const recipes = WORKSHOP_RECIPES.forge ?? [];
  const roleShortages = _computeRoleKitShortages(sim);
  const balanceTargets = _computeBalancedItemTargets(sim);
  let bestId = null;
  let bestScore = -Infinity;
  for (const recipe of recipes) {
    if (!resources._hasResources(sim, recipe.inputs)) continue;
    const outKind = Object.keys(recipe.outputs ?? {})[0] ?? null;
    if (!outKind || !ITEM_SPECS[outKind]) continue;
    const base = baseItemId(outKind);
    const roleDeficit = roleShortages[base] ?? 0;
    const balanceDeficit = Math.max(0, (balanceTargets[base] ?? 0) - _countOwnedByBaseItem(sim, base));
    let score = roleDeficit * 100 + balanceDeficit * 10;
    if (score <= 0) continue;
    if (outKind !== base) score += 0.5;
    if (score > bestScore) {
      bestScore = score;
      bestId = recipe.id;
    }
  }
  if (bestId) return bestId;
  return null;
}
function _computeRoleKitShortages(sim) {
  const targets = {};
  for (const role of Object.values(sim.dayStartRoles)) {
    const baseItems = ROLE_KIT_BASE_ITEMS[role] ?? ROLE_KIT_BASE_ITEMS.idle;
    for (const base of baseItems) {
      targets[base] = (targets[base] ?? 0) + 1;
    }
  }
  const shortages = {};
  for (const [base, want] of Object.entries(targets)) {
    const have = _countOwnedByBaseItem(sim, base);
    if (want > have) shortages[base] = want - have;
  }
  return shortages;
}
function _computeBalancedItemTargets(sim) {
  const roleCounts = { idle: 0, guard: 0, mine: 0, haul: 0, build: 0, operate: 0 };
  for (const role of Object.values(sim.dayStartRoles)) {
    roleCounts[role] = (roleCounts[role] ?? 0) + 1;
  }
  const dwarves = Object.values(roleCounts).reduce((a2, b) => a2 + b, 0);
  const guards = roleCounts.guard ?? 0;
  const miners = roleCounts.mine ?? 0;
  const workers = (roleCounts.build ?? 0) + (roleCounts.operate ?? 0) + (roleCounts.haul ?? 0);
  return {
    pickaxe: Math.max(1, miners + 1),
    hammer: Math.max(1, workers + 1),
    sword: Math.max(1, guards + 1),
    shield: Math.max(1, guards + 1),
    helmet: Math.max(2, dwarves),
    chainmail: Math.max(1, guards + miners),
    platemail: Math.max(1, Math.ceil(guards / 2)),
    battle_axe: Math.max(1, Math.floor((guards + 1) / 2)),
    battle_hammer: Math.max(1, Math.floor((guards + 1) / 2))
  };
}
function _countOwnedByBaseItem(sim, baseItem) {
  const variants = BASE_ITEM_VARIANTS[baseItem] ?? [baseItem];
  const variantSet = new Set(variants);
  let total = 0;
  for (const kind of Object.keys(sim.itemStockpile)) {
    if (!variantSet.has(kind)) continue;
    total += sim.itemStockpile[kind] ?? 0;
  }
  for (const e of sim.entities.values()) {
    if (e.kind !== "dwarf") continue;
    const eq = (
      /** @type {import('../dwarves.js').DwarfState} */
      e.equipment
    );
    if (!eq) continue;
    for (const itemId of Object.values(eq)) {
      if (!itemId) continue;
      if (variantSet.has(itemId)) total += 1;
    }
  }
  return total;
}
function _getRecipe(sim, kind, recipeId) {
  return (WORKSHOP_RECIPES[kind] ?? []).find((r) => r.id === recipeId) ?? null;
}
function _isWorkshopManned(sim, ws) {
  if (!ws.operatorId) return false;
  const op = sim.entities.get(ws.operatorId);
  if (!op) return false;
  return op.pos[0] === ws.pos[0] && op.pos[1] === ws.pos[1];
}
function getItemUsageTallies(sim) {
  var _a;
  const byId = {};
  for (const [id, amount] of Object.entries(sim.itemStockpile)) {
    if (!ITEM_SPECS[id]) continue;
    if (!byId[id]) byId[id] = { used: 0, unused: 0 };
    byId[id].unused += amount ?? 0;
  }
  for (const e of sim.entities.values()) {
    if (e.kind !== "dwarf") continue;
    const dwarf = (
      /** @type {import('../dwarves.js').DwarfState} */
      e
    );
    const eq = dwarf.equipment ?? {};
    for (const itemId of Object.values(eq)) {
      if (!itemId) continue;
      if (!ITEM_SPECS[itemId]) continue;
      if (!byId[itemId]) byId[itemId] = { used: 0, unused: 0 };
      byId[itemId].used += 1;
    }
  }
  const rows = [];
  for (const [id, entry] of Object.entries(byId)) {
    const label = ((_a = ITEM_SPECS[id]) == null ? void 0 : _a.label) ?? id;
    rows.push({ id, label, used: entry.used, unused: entry.unused, total: entry.used + entry.unused });
  }
  rows.sort((a2, b) => a2.label.localeCompare(b.label));
  return rows;
}
function unequipOneItem(sim, itemId) {
  for (const e of sim.entities.values()) {
    if (e.kind !== "dwarf") continue;
    const dwarf = (
      /** @type {import('../dwarves.js').DwarfState} */
      e
    );
    if (!dwarf.equipment) continue;
    for (const slot of ["weapon", "armor", "head", "offhand", "tool"]) {
      const key = (
        /** @type {import('./types.js').ItemSlot} */
        slot
      );
      if (dwarf.equipment[key] !== itemId) continue;
      dwarf.equipment[key] = null;
      return true;
    }
  }
  return false;
}
function autoAssignEquipmentFromDayStartRoles(sim) {
  let assigned = 0;
  for (const e of sim.entities.values()) {
    if (e.kind !== "dwarf") continue;
    const dwarf = (
      /** @type {import('../dwarves.js').DwarfState} */
      e
    );
    const role = sim.dayStartRoles[String(dwarf.id)] ?? "idle";
    const prefs = ROLE_EQUIP_PREFERENCES[role] ?? {};
    if (!dwarf.equipment) {
      dwarf.equipment = { weapon: null, armor: null, head: null, offhand: null, tool: null };
    }
    for (const [slot, items] of Object.entries(prefs)) {
      const key = (
        /** @type {import('./types.js').ItemSlot} */
        slot
      );
      if (!items || items.length === 0) continue;
      if (dwarf.equipment[key]) continue;
      const picked = resources._takeFirstStockedItem(sim, items);
      if (!picked) continue;
      dwarf.equipment[key] = picked;
      assigned += 1;
    }
  }
  return assigned;
}
const workshops = {
  _registerWorkshop,
  _unregisterWorkshop,
  _assignWorkshopOperator,
  _clearWorkshopOperator,
  _processWorkshops,
  _tryEnqueueWorkshopJob,
  _pickRecipeIdFromRules,
  _pickRecipeFromRules,
  _pickForgeRecipeId,
  _computeRoleKitShortages,
  _computeBalancedItemTargets,
  _countOwnedByBaseItem,
  _getRecipe,
  _isWorkshopManned,
  getItemUsageTallies,
  unequipOneItem,
  autoAssignEquipmentFromDayStartRoles
};
function _registerStructure(sim, pos, build) {
  const key = sim.world.index(pos);
  if (build === "door") {
    sim.structures.set(key, { kind: "door", hp: DOOR_HP });
    return;
  }
  if (WORKSHOP_BUILDS.has(build)) {
    sim.structures.set(key, { kind: "workshop", hp: WORKSHOP_HP });
  }
}
function _unregisterStructure(sim, pos) {
  sim.structures.delete(sim.world.index(pos));
}
function tryDamageStructure(sim, attacker, target) {
  if (attacker.kind !== "enemy") return { ok: false, reason: null };
  if (!entities._isAdjacent(sim, attacker.pos, target)) return { ok: false, reason: null };
  const tile = sim.world.tiles.get(target);
  const targetKey = sim.world.index(target);
  let structure = sim.structures.get(targetKey);
  if (!structure) {
    const seeded = _defaultStructureForTile(sim, tile);
    if (!seeded) return { ok: false, reason: null };
    structure = seeded;
    sim.structures.set(targetKey, structure);
  }
  if (attacker.type === "rat") return { ok: false, reason: null };
  const dmg = _getStructureDamage(sim, attacker);
  if (dmg <= 0) return { ok: false, reason: null };
  structure.hp = Math.max(0, structure.hp - dmg);
  sim.structures.set(targetKey, structure);
  if (structure.hp <= 0) {
    _setTileToFloorAndCleanup(sim, target);
    return { ok: true, reason: null, message: "Destroyed structure" };
  }
  return { ok: true, reason: null, message: "Damaged structure" };
}
function _getStructureDamage(sim, enemy) {
  if (enemy.type === "kobold") return 2;
  if (enemy.type === "goblin") return 3;
  if (enemy.type === "ogre") return 4;
  if (enemy.type === "sapper") return 6;
  return 0;
}
function _defaultStructureForTile(sim, tile) {
  if (tile === T.DOOR) return { kind: "door", hp: DOOR_HP };
  if (tile === T.WALL) return { kind: "wall", hp: WALL_HP };
  if (isWorkshopTile(tile)) {
    return { kind: "workshop", hp: WORKSHOP_HP };
  }
  return null;
}
function _setTileToFloorAndCleanup(sim, pos) {
  sim.world.tiles.set(pos, T.FLOOR);
  _unregisterStructure(sim, pos);
  workshops._unregisterWorkshop(sim, pos);
}
function tryBreach(sim, attackerId, target) {
  const attacker = sim.entities.get(attackerId);
  if (!attacker || attacker.kind !== "enemy") return { ok: false, reason: null };
  if (!entities._isAdjacent(sim, attacker.pos, target)) return { ok: false, reason: null };
  const tile = sim.world.tiles.get(target);
  if (tile === T.ROCK && attacker.type === "sapper") {
    sim.world.tiles.set(target, T.FLOOR);
    return { ok: true, reason: null, message: "Sapper blasted rock" };
  }
  return tryDamageStructure(sim, attacker, target);
}
function _hasWorkshopSpace(sim, target) {
  let open = 0;
  for (let y = target[1] - 1; y <= target[1] + 1; y++) {
    for (let x = target[0] - 1; x <= target[0] + 1; x++) {
      const pos = (
        /** @type {XY} */
        [x, y]
      );
      if (!sim.world.inBounds(pos)) continue;
      const t = sim.world.tiles.get(pos);
      if (t === T.FLOOR || t === T.TORCH) open++;
    }
  }
  return open >= MIN_WORKSHOP_FLOOR_TILES;
}
function _isWorkshopBufferTile(sim, pos) {
  for (const ws of sim.workshops.values()) {
    const dx = Math.abs(ws.pos[0] - pos[0]);
    const dy = Math.abs(ws.pos[1] - pos[1]);
    if (dx <= 1 && dy <= 1) return true;
  }
  return false;
}
function _canDepositAt(sim, pos, resourceKind) {
  if (resourceKind === "coal" && _isAdjacentToTileType(sim, pos, T.COAL_HOPPER)) return true;
  if (resourceKind === "wood" && _isAdjacentToTileType(sim, pos, T.WOOD_HOPPER)) return true;
  return _isAdjacentToWorkshopAccepting(sim, pos, resourceKind);
}
function _isAdjacentToTileType(sim, pos, tileType) {
  if (sim.world.tiles.get(pos) === tileType) return true;
  for (const nb of neighbors4(pos)) {
    if (!sim.world.inBounds(nb)) continue;
    if (sim.world.tiles.get(nb) === tileType) return true;
  }
  return false;
}
function _isAdjacentToWorkshopAccepting(sim, pos, resourceKind) {
  const candidates = [pos, ...neighbors4(pos)];
  for (const p of candidates) {
    if (!sim.world.inBounds(p)) continue;
    const tile = sim.world.tiles.get(p);
    const wk = TILE_TO_WORKSHOP[tile];
    if (!wk) continue;
    if (workshopAcceptsResource(
      /** @type {WorkshopKind} */
      wk,
      resourceKind
    )) return true;
  }
  return false;
}
function _pickStealableResourceFromWorkshop(sim, kind) {
  const recipes = WORKSHOP_RECIPES[kind] ?? [];
  for (const recipe of recipes) {
    const inputs = recipe.inputs ?? {};
    for (const [resKind, amount] of Object.entries(inputs)) {
      if (amount <= 0) continue;
      if ((sim.resources[resKind] ?? 0) > 0) return resKind;
    }
  }
  return null;
}
const structures = {
  _registerStructure,
  _unregisterStructure,
  tryDamageStructure,
  _getStructureDamage,
  _defaultStructureForTile,
  _setTileToFloorAndCleanup,
  tryBreach,
  _hasWorkshopSpace,
  _isWorkshopBufferTile,
  _canDepositAt,
  _isAdjacentToTileType,
  _isAdjacentToWorkshopAccepting,
  _pickStealableResourceFromWorkshop
};
function _addResources(sim, delta) {
  for (const [kind, amount] of Object.entries(delta)) {
    sim.resources[kind] = (sim.resources[kind] ?? 0) + amount;
  }
}
function _addDayOutputs(sim, delta) {
  for (const [kind, amount] of Object.entries(delta)) {
    sim.dayOutputs[kind] = (sim.dayOutputs[kind] ?? 0) + amount;
  }
}
function deliverDayOutputs(sim) {
  for (const [kind, amount] of Object.entries(sim.dayOutputs)) {
    if (amount <= 0) continue;
    sim.finalOutputs[kind] = (sim.finalOutputs[kind] ?? 0) + amount;
    if (ITEM_SPECS[kind]) {
      sim.itemStockpile[kind] = (sim.itemStockpile[kind] ?? 0) + amount;
    } else {
      sim.resources[kind] = (sim.resources[kind] ?? 0) + amount;
    }
  }
  sim.dayOutputs = {};
}
function consumeFeastFood(sim, amount) {
  const need = Math.max(0, amount);
  if (need <= 0) return { used: 0, deficit: 0 };
  const have = sim.resources.food ?? 0;
  const used = Math.min(have, need);
  sim.resources.food = Math.max(0, have - need);
  return { used, deficit: need - used };
}
function applyBuy(sim, offer) {
  if (offer.type === "item") {
    sim.itemStockpile[offer.kind] = (sim.itemStockpile[offer.kind] ?? 0) + offer.amount;
  } else {
    _addResources(sim, { [offer.kind]: offer.amount });
  }
}
function sellResource(sim, kind) {
  const have = sim.resources[kind] ?? 0;
  if (have <= 0) return false;
  sim.resources[kind] = have - 1;
  return true;
}
function _takeFirstStockedItem(sim, priority) {
  for (const itemId of priority) {
    const have = sim.itemStockpile[itemId] ?? 0;
    if (have <= 0) continue;
    sim.itemStockpile[itemId] = have - 1;
    if (sim.itemStockpile[itemId] <= 0) delete sim.itemStockpile[itemId];
    return itemId;
  }
  return null;
}
function _hasResources(sim, costs) {
  for (const [kind, amount] of Object.entries(costs)) {
    if (_getAvailableResource(sim, kind) < amount) return false;
  }
  return true;
}
function _spendResources(sim, costs) {
  for (const [kind, amount] of Object.entries(costs)) {
    let remaining = amount;
    const haveRaw = sim.resources[kind] ?? 0;
    const useRaw = Math.min(haveRaw, remaining);
    if (useRaw > 0) {
      sim.resources[kind] = haveRaw - useRaw;
      remaining -= useRaw;
    }
    if (remaining > 0) {
      const eq = RAW_TO_PROCESSED[kind];
      if (eq) {
        const haveEq = sim.resources[eq] ?? 0;
        const useEq = Math.min(haveEq, remaining);
        if (useEq > 0) {
          sim.resources[eq] = haveEq - useEq;
          remaining -= useEq;
        }
      }
    }
  }
}
function _getAvailableResource(sim, kind) {
  const have = sim.resources[kind] ?? 0;
  const eq = RAW_TO_PROCESSED[kind];
  if (!eq) return have;
  return have + (sim.resources[eq] ?? 0);
}
function getCarryCapacity(sim) {
  return CARRY_CAPACITY;
}
function canCarryResource(sim, entity, resourceKind) {
  const carry = (
    /** @type {{ kind: string, amount: number }|null|undefined} */
    entity.carry
  );
  if (!resourceKind) return true;
  if (!carry || carry.amount <= 0) return true;
  if (carry.kind !== resourceKind) return false;
  return carry.amount < CARRY_CAPACITY;
}
function canDepositAt(sim, pos, resourceKind) {
  return structures._canDepositAt(sim, pos, resourceKind);
}
function getFloorItemAt(sim, pos) {
  return _getFloorItem(sim, pos);
}
function _getFloorItem(sim, pos) {
  return sim.floorItems.get(sim.world.index(pos)) ?? null;
}
function _setFloorItem(sim, pos, item) {
  const key = sim.world.index(pos);
  if (!item || item.amount <= 0) {
    sim.floorItems.delete(key);
    return;
  }
  sim.floorItems.set(key, { kind: item.kind, amount: item.amount });
}
function _addFloorItem(sim, pos, kind, amount) {
  if (amount <= 0) return false;
  const key = sim.world.index(pos);
  const current = sim.floorItems.get(key);
  if (!current) {
    sim.floorItems.set(key, { kind, amount });
    return true;
  }
  if (current.kind !== kind) return false;
  current.amount += amount;
  sim.floorItems.set(key, current);
  return true;
}
function _canDropAt(sim, pos, resourceKind) {
  if (!sim.world.inBounds(pos)) return false;
  const existing = _getFloorItem(sim, pos);
  return !existing || existing.kind === resourceKind;
}
function tryDrop(sim, id) {
  const e = sim.entities.get(id);
  if (!e || e.kind === "enemy") return { ok: false, reason: null };
  const carry = (
    /** @type {{ kind: string, amount: number }|null|undefined} */
    e.carry
  );
  if (!carry || carry.amount <= 0) return { ok: false, reason: "Nothing to drop" };
  const dropped = { kind: carry.kind, amount: carry.amount };
  if (!_dropCarryAt(sim, e, e.pos)) return { ok: false, reason: "Cannot drop here" };
  return { ok: true, reason: null, dropped };
}
function _addCarry(sim, entity, resourceKind, amount) {
  if (!resourceKind || amount <= 0) return;
  const carry = (
    /** @type {{ kind: string, amount: number }|null|undefined} */
    entity.carry
  );
  if (!carry || carry.amount <= 0) {
    entity.carry = { kind: resourceKind, amount };
    return;
  }
  if (carry.kind !== resourceKind) return;
  carry.amount = Math.min(CARRY_CAPACITY, carry.amount + amount);
  entity.carry = carry;
}
function _dropCarryAt(sim, entity, pos) {
  const carry = (
    /** @type {{ kind: string, amount: number }|null|undefined} */
    entity.carry
  );
  if (!carry || carry.amount <= 0) return false;
  if (!_canDropAt(sim, pos, carry.kind)) return false;
  if (!_addFloorItem(sim, pos, carry.kind, carry.amount)) return false;
  entity.carry = null;
  return true;
}
function _tryPickupEntity(sim, entity, preferredKind = null) {
  if (entity.kind === "enemy") return false;
  const item = _getFloorItem(sim, entity.pos);
  if (!item) return false;
  if (preferredKind && item.kind !== preferredKind) return false;
  if (entity.kind === "dwarf" && !_isResourceUseful(sim, item.kind)) return false;
  if (!canCarryResource(sim, entity, item.kind)) return false;
  const carry = (
    /** @type {{ kind: string, amount: number }|null|undefined} */
    entity.carry
  );
  const curAmount = (carry == null ? void 0 : carry.amount) ?? 0;
  const space = CARRY_CAPACITY - curAmount;
  if (space <= 0) return false;
  const take = Math.min(space, item.amount);
  _addCarry(sim, entity, item.kind, take);
  item.amount -= take;
  _setFloorItem(sim, entity.pos, item.amount > 0 ? item : null);
  return true;
}
function _resourceKeyForOre(sim, oreId) {
  if (oreId === ORE.GRANITE) return "raw_granite";
  if (oreId === ORE.IRON) return "raw_iron";
  if (oreId === ORE.COPPER) return "raw_copper";
  if (oreId === ORE.GOLD) return "raw_gold";
  if (oreId === ORE.COAL) return "coal";
  if (oreId === ORE.RUBY) return "raw_ruby";
  if (oreId === ORE.EMERALD) return "raw_emerald";
  if (oreId === ORE.DIAMOND) return "raw_diamond";
  return null;
}
function _isResourceUseful(sim, resourceKind) {
  if (!resourceKind) return true;
  if (resourceKind === "coal" || resourceKind === "raw_granite") return true;
  for (const ws of sim.workshops.values()) {
    if (workshopAcceptsResource(ws.kind, resourceKind)) return true;
  }
  return false;
}
function findNearestDropoffGoal(sim, resourceKind, fromPos) {
  const targets = _getDropoffGoals(sim, resourceKind);
  if (targets.length === 0) return null;
  let best = targets[0];
  let bestDist = manhattan(best, fromPos);
  for (const t of targets.slice(1)) {
    const d = manhattan(t, fromPos);
    if (d < bestDist) {
      bestDist = d;
      best = t;
    }
  }
  return (
    /** @type {XY} */
    [best[0], best[1]]
  );
}
function _getDropoffPositions(sim, resourceKind) {
  if (resourceKind === "coal") return _findTilesOfType(sim, T.COAL_HOPPER);
  if (resourceKind === "wood") return _findTilesOfType(sim, T.WOOD_HOPPER);
  const targets = [];
  for (const ws of sim.workshops.values()) {
    if (!workshopAcceptsResource(ws.kind, resourceKind)) continue;
    targets.push(ws.pos);
  }
  return targets;
}
function _getDropoffGoals(sim, resourceKind) {
  const drops = _getDropoffPositions(sim, resourceKind);
  const goals = [];
  const seen = /* @__PURE__ */ new Set();
  for (const d of drops) {
    const candidates = [d, ...neighbors4(d)];
    for (const pos of candidates) {
      if (!sim.world.inBounds(pos)) continue;
      if (!sim.world.isWalkable(pos)) continue;
      const key = sim.world.index(pos);
      if (seen.has(key)) continue;
      seen.add(key);
      goals.push([pos[0], pos[1]]);
    }
  }
  return goals;
}
function _findTilesOfType(sim, tileType) {
  const out = [];
  for (const xy of sim.world.tiles.iterAll()) {
    if (sim.world.tiles.get(xy) === tileType) out.push([xy[0], xy[1]]);
  }
  return out;
}
function _autoDepositCarriers(sim) {
  for (const e of sim.entities.values()) {
    _tryDepositEntity(sim, e);
  }
}
function _tryDepositEntity(sim, entity) {
  const carry = (
    /** @type {{ kind: string, amount: number }|null|undefined} */
    entity.carry
  );
  if (!carry || carry.amount <= 0) return false;
  if (!structures._canDepositAt(sim, entity.pos, carry.kind)) return false;
  _addResources(sim, { [carry.kind]: carry.amount });
  entity.carry = null;
  return true;
}
function findBestMineTarget(sim, origin, radius, requiredResourceKind = null) {
  const maxR = Math.max(0, radius ?? DEFAULT_MINE_RADIUS);
  const W = sim.world.size[0];
  const H = sim.world.size[1];
  let best = null;
  let bestValue = -1;
  let bestDist = Infinity;
  const minX = Math.max(0, origin[0] - maxR);
  const maxX = Math.min(W - 1, origin[0] + maxR);
  const minY = Math.max(0, origin[1] - maxR);
  const maxY = Math.min(H - 1, origin[1] + maxR);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dist2 = manhattan(
        /** @type {XY} */
        [x, y],
        origin
      );
      if (dist2 > maxR) continue;
      const pos = (
        /** @type {XY} */
        [x, y]
      );
      if (sim.world.tiles.get(pos) !== T.ROCK) continue;
      if (!_rockIsMineable(sim, pos)) continue;
      const oreId = sim.world.ore.get(pos);
      const resKey = _resourceKeyForOre(sim, oreId);
      if (requiredResourceKind) {
        if (resKey !== requiredResourceKind) continue;
      } else if (resKey && !_isResourceUseful(sim, resKey)) {
        continue;
      }
      const value = oreValue(oreId);
      if (value > bestValue || value === bestValue && dist2 < bestDist) {
        bestValue = value;
        bestDist = dist2;
        best = /**@type {XY} */
        [x, y];
      }
    }
  }
  return best;
}
function findNearestFloorItem(sim, origin, radius, requiredResourceKind = null) {
  const maxR = Math.max(0, radius ?? DEFAULT_MINE_RADIUS);
  let best = null;
  let bestDist = Infinity;
  for (const [key, item] of sim.floorItems.entries()) {
    const pos = sim.world.posFromIndex(key);
    const dist2 = manhattan(pos, origin);
    if (dist2 > maxR) continue;
    if (requiredResourceKind) {
      if (item.kind !== requiredResourceKind) continue;
    } else if (!_isResourceUseful(sim, item.kind)) {
      continue;
    }
    if (!sim.world.inBounds(pos) || !sim.world.isWalkable(pos)) continue;
    if (dist2 < bestDist) {
      bestDist = dist2;
      best = /** @type {XY} */
      [pos[0], pos[1]];
    }
  }
  return best;
}
function _rockIsMineable(sim, pos) {
  for (const nb of neighbors4(pos)) {
    if (!sim.world.inBounds(nb)) continue;
    if (sim.world.isWalkable(nb)) return true;
  }
  return false;
}
function getResourceTallies(sim, map) {
  const rows = [];
  const used = /* @__PURE__ */ new Set();
  for (const group of RESOURCE_GROUPS) {
    const raw = sumResources(map, group.raw);
    const processed = sumResources(map, group.processed);
    for (const k of group.raw) used.add(k);
    for (const k of group.processed) used.add(k);
    if (raw !== 0 || processed !== 0) {
      rows.push({ label: group.label, raw, processed });
    }
  }
  for (const [key, value] of Object.entries(map)) {
    if (used.has(key)) continue;
    if (!value) continue;
    rows.push({ label: key, raw: value, processed: 0 });
  }
  return rows;
}
function getItemTallies(sim) {
  const rows = [];
  for (const [itemId, count] of Object.entries(sim.itemStockpile)) {
    if (!count) continue;
    const spec = ITEM_SPECS[itemId];
    rows.push({ label: (spec == null ? void 0 : spec.label) ?? itemId, count });
  }
  rows.sort((a2, b) => a2.label.localeCompare(b.label));
  return rows;
}
function trySteal(sim, id, target) {
  const e = sim.entities.get(id);
  if (!e || e.kind !== "enemy") return { ok: false, reason: null };
  if (!entities._isAdjacent(sim, e.pos, target) && !(e.pos[0] === target[0] && e.pos[1] === target[1])) {
    return { ok: false, reason: null };
  }
  if (e.type !== "rat") return { ok: false, reason: null };
  const carry = (
    /** @type {{ kind: string, amount: number }|null|undefined} */
    e.carry
  );
  if (carry && carry.amount > 0) return { ok: false, reason: null };
  const tile = sim.world.tiles.get(target);
  if (tile === T.WOOD_HOPPER) {
    return _stealResourceToCarrier(sim, e, "wood", "Rat stole wood");
  }
  if (tile === T.COAL_HOPPER) {
    return _stealResourceToCarrier(sim, e, "coal", "Rat stole coal");
  }
  const wk = TILE_TO_WORKSHOP[tile];
  if (wk) {
    const ws = sim.workshops.get(sim.world.index(target));
    if (!ws) return { ok: false, reason: null };
    if (workshops._isWorkshopManned(sim, ws)) return { ok: false, reason: null };
    const resKind = structures._pickStealableResourceFromWorkshop(
      sim,
      /** @type {WorkshopKind} */
      wk
    );
    if (!resKind) return { ok: false, reason: null };
    return _stealResourceToCarrier(sim, e, resKind, `Rat stole ${resKind}`);
  }
  return { ok: false, reason: null };
}
function tryEscape(sim, id) {
  const e = sim.entities.get(id);
  if (!e || e.kind !== "enemy") return { ok: false, reason: null };
  if (!entities._isAtMapEdge(sim, e.pos)) return { ok: false, reason: null };
  sim.entities.delete(id);
  return { ok: true, reason: null, message: `Enemy#${id} escaped` };
}
function _stealResourceToCarrier(sim, enemy, kind, message) {
  const have = sim.resources[kind] ?? 0;
  if (have <= 0) return { ok: false, reason: null };
  sim.resources[kind] = have - 1;
  enemy.carry = { kind, amount: 1 };
  return { ok: true, reason: null, message };
}
const resources = {
  _addResources,
  _addDayOutputs,
  deliverDayOutputs,
  consumeFeastFood,
  applyBuy,
  sellResource,
  _takeFirstStockedItem,
  _hasResources,
  _spendResources,
  _getAvailableResource,
  getCarryCapacity,
  canCarryResource,
  canDepositAt,
  getFloorItemAt,
  _getFloorItem,
  _setFloorItem,
  _addFloorItem,
  _canDropAt,
  tryDrop,
  _addCarry,
  _dropCarryAt,
  _tryPickupEntity,
  _resourceKeyForOre,
  _isResourceUseful,
  findNearestDropoffGoal,
  _getDropoffPositions,
  _getDropoffGoals,
  _findTilesOfType,
  _autoDepositCarriers,
  _tryDepositEntity,
  findBestMineTarget,
  findNearestFloorItem,
  _rockIsMineable,
  getResourceTallies,
  getItemTallies,
  trySteal,
  tryEscape,
  _stealResourceToCarrier
};
function* iterFovBoundary(origin, radius, W, H) {
  const minX = Math.max(0, origin[0] - radius);
  const maxX = Math.min(W - 1, origin[0] + radius);
  const minY = Math.max(0, origin[1] - radius);
  const maxY = Math.min(H - 1, origin[1] + radius);
  for (let x = minX; x <= maxX; x++) {
    yield (
      /** @type {XY} */
      [x, minY]
    );
    yield (
      /** @type {XY} */
      [x, maxY]
    );
  }
  for (let y = minY + 1; y <= maxY - 1; y++) {
    yield (
      /** @type {XY} */
      [minX, y]
    );
    yield (
      /** @type {XY} */
      [maxX, y]
    );
  }
}
function hasLineOfSight(sim, from, to) {
  if (!sim.world.inBounds(from) || !sim.world.inBounds(to)) return false;
  for (const p0 of sim.world.tiles.iterLineCells(from, to)) {
    const p = (
      /** @type {XY} */
      [p0[0], p0[1]]
    );
    if (p[0] === from[0] && p[1] === from[1]) continue;
    if (sim.world.isOpaque(p)) return false;
  }
  return true;
}
function _updateVisibilityFrom(sim, origin, radius) {
  const visible = sim.world.visible;
  const explored = sim.world.explored;
  const W = sim.world.size[0];
  const H = sim.world.size[1];
  visible.fill(0);
  if (!sim.world.inBounds(origin) || radius <= 0) return;
  const r2 = radius * radius;
  for (const dest of iterFovBoundary(origin, radius, W, H)) {
    for (const p0 of sim.world.tiles.iterLineCells(origin, dest)) {
      const p = (
        /** @type {XY} */
        [p0[0], p0[1]]
      );
      const dx = p[0] - origin[0];
      const dy = p[1] - origin[1];
      if (dx * dx + dy * dy > r2) break;
      visible.set(p, 1);
      explored.set(p, 1);
      if ((p[0] !== origin[0] || p[1] !== origin[1]) && sim.world.isOpaque(p)) break;
    }
  }
}
function _updateLighting(sim) {
  const light = sim.world.light;
  const W = sim.world.size[0];
  const H = sim.world.size[1];
  light.fill(0);
  const sources = [];
  for (const xy of sim.world.tiles.iterAll()) {
    if (sim.world.tiles.get(xy) === T.TORCH) {
      sources.push({ pos: [xy[0], xy[1]], radius: sim.config.lightRadius, intensity: sim.config.lightIntensity });
    }
  }
  for (const e of sim.entities.values()) {
    const radius = (
      /** @type {number|undefined} */
      e.lightRadius
    );
    if (!radius || radius <= 0) continue;
    const intensity = (
      /** @type {number|undefined} */
      e.lightIntensity ?? sim.config.lightIntensity
    );
    sources.push({ pos: [e.pos[0], e.pos[1]], radius, intensity });
  }
  for (const src of sources) {
    _accumulateLightFrom(sim, src.pos, src.radius, src.intensity, W, H);
  }
}
function _accumulateLightFrom(sim, origin, radius, intensity, W, H) {
  if (radius <= 0 || intensity <= 0) return;
  const r2 = radius * radius;
  for (const dest of iterFovBoundary(origin, radius, W, H)) {
    for (const p0 of sim.world.tiles.iterLineCells(origin, dest)) {
      const p = (
        /** @type {XY} */
        [p0[0], p0[1]]
      );
      const dx = p[0] - origin[0];
      const dy = p[1] - origin[1];
      const d2 = dx * dx + dy * dy;
      if (d2 > r2) break;
      const d = Math.sqrt(d2);
      const falloff = Math.max(0, 1 - d / radius);
      const amount = intensity * Math.pow(falloff, sim.config.lightFalloffPow);
      if (amount > 0) {
        const prev = sim.world.light.get(p);
        sim.world.light.set(p, Math.min(1, prev + amount));
      }
      if ((p[0] !== origin[0] || p[1] !== origin[1]) && sim.world.isOpaque(p)) break;
    }
  }
}
function updateVisibilityAndLighting(sim) {
  _updateVisibilityFrom(sim, sim.chief.pos, sim.config.viewRadius);
  _updateLighting(sim);
}
const visibility = {
  hasLineOfSight,
  updateVisibilityAndLighting,
  _updateVisibilityFrom,
  _updateLighting,
  _accumulateLightFrom
};
const OCCUPIED_PATH_COST = 3;
function createChief(id, pos) {
  return { id, kind: "chief", pos: [pos[0], pos[1]], hp: 12, carry: null };
}
function createDwarf(id, pos) {
  return {
    id,
    kind: "dwarf",
    pos: [pos[0], pos[1]],
    hp: 10,
    order: { kind: "idle" },
    carry: null,
    equipment: { weapon: null, armor: null, head: null, offhand: null, tool: null }
  };
}
function setDwarfOrder(dwarf, order) {
  dwarf.order = order;
}
function nextDwarfAction(dwarf, sim) {
  var _a;
  const order = dwarf.order;
  if (!order) return null;
  const target = order.target ?? null;
  const adjacentEnemy = findAdjacentEnemy(sim, dwarf.pos);
  if (adjacentEnemy) {
    return { type: "attack", id: dwarf.id, target: adjacentEnemy.pos };
  }
  if (dwarf.carry && dwarf.carry.amount > 0 && !resources._isResourceUseful(sim, dwarf.carry.kind)) {
    return { type: "drop", id: dwarf.id };
  }
  if (dwarf.carry && dwarf.carry.amount >= resources.getCarryCapacity(sim)) {
    const haul = haulTowardDropoff(sim, dwarf);
    if (haul) return haul;
    return { type: "drop", id: dwarf.id };
  }
  if (order.kind === "idle") return null;
  if (order.kind === "guard") {
    const anchor = target ?? dwarf.pos;
    const visibleEnemy = findGuardVisibleEnemy(sim, dwarf.pos, anchor, sim.config.guardChaseRadius);
    if (visibleEnemy) {
      if (isAdjacent(dwarf.pos, visibleEnemy.pos)) {
        return { type: "attack", id: dwarf.id, target: visibleEnemy.pos };
      }
      const goals = adjacentWalkable(sim, dwarf, visibleEnemy.pos);
      const step2 = nextStepToward(sim, dwarf, goals);
      return step2 ? { type: "move", id: dwarf.id, dir: [step2[0] - dwarf.pos[0], step2[1] - dwarf.pos[1]] } : null;
    }
    if (samePos(dwarf.pos, anchor)) return null;
    const step = nextStepToward(sim, dwarf, [anchor]);
    return step ? { type: "move", id: dwarf.id, dir: [step[0] - dwarf.pos[0], step[1] - dwarf.pos[1]] } : null;
  }
  if (order.kind === "mine") {
    if (!target) return null;
    const requiredKind = ((_a = dwarf.carry) == null ? void 0 : _a.kind) ?? null;
    const floorTarget = resources.findNearestFloorItem(sim, target, order.radius, requiredKind);
    if (floorTarget && !samePos(dwarf.pos, floorTarget)) {
      const step2 = nextStepToward(sim, dwarf, [floorTarget]);
      if (step2) return { type: "move", id: dwarf.id, dir: [step2[0] - dwarf.pos[0], step2[1] - dwarf.pos[1]] };
    }
    const mineTarget = resources.findBestMineTarget(sim, target, order.radius, requiredKind);
    if (!mineTarget) {
      if (dwarf.carry && dwarf.carry.amount > 0) {
        const haul = haulTowardDropoff(sim, dwarf);
        if (haul) return haul;
      }
      setDwarfOrder(dwarf, { kind: "idle" });
      return null;
    }
    if (isAdjacent(dwarf.pos, mineTarget)) {
      return { type: "mine", id: dwarf.id, target: mineTarget };
    }
    const goals = adjacentWalkable(sim, dwarf, mineTarget);
    const step = nextStepToward(sim, dwarf, goals);
    return step ? { type: "move", id: dwarf.id, dir: [step[0] - dwarf.pos[0], step[1] - dwarf.pos[1]] } : null;
  }
  if (order.kind === "build") {
    if (!target) return null;
    if (isAdjacent(dwarf.pos, target)) {
      const build = order.build ?? "wall";
      return { type: "build", id: dwarf.id, target, build };
    }
    const goals = adjacentWalkable(sim, dwarf, target);
    const step = nextStepToward(sim, dwarf, goals);
    return step ? { type: "move", id: dwarf.id, dir: [step[0] - dwarf.pos[0], step[1] - dwarf.pos[1]] } : null;
  }
  if (order.kind === "operate") {
    if (!target) return null;
    if (samePos(dwarf.pos, target)) return null;
    const step = nextStepToward(sim, dwarf, [target]);
    return step ? { type: "move", id: dwarf.id, dir: [step[0] - dwarf.pos[0], step[1] - dwarf.pos[1]] } : null;
  }
  return null;
}
const isAdjacent = isAdjacent4;
function findGuardVisibleEnemy(sim, dwarfPos, anchor, radius) {
  let best = null;
  let bestDist = Infinity;
  const r2 = radius * radius;
  for (const e of sim.entities.values()) {
    if (e.kind !== "enemy") continue;
    const dx = e.pos[0] - anchor[0];
    const dy = e.pos[1] - anchor[1];
    if (dx * dx + dy * dy > r2) continue;
    if (!visibility.hasLineOfSight(sim, dwarfPos, e.pos)) continue;
    const d = manhattan(e.pos, dwarfPos);
    if (d < bestDist) {
      best = e;
      bestDist = d;
    }
  }
  return best;
}
function findAdjacentEnemy(sim, pos) {
  for (const e of sim.entities.values()) {
    if (e.kind !== "enemy") continue;
    if (isAdjacent(pos, e.pos)) return (
      /** @type {import('./enemies.js').EnemyState} */
      e
    );
  }
  return null;
}
function adjacentWalkable(sim, dwarf, target) {
  const goals = [];
  for (const p0 of sim.world.tiles.iterAdjacent(target)) {
    const p = [p0[0], p0[1]];
    if (!sim.world.inBounds(p)) continue;
    if (!sim.world.isWalkable(p) && !samePos(p, dwarf.pos)) continue;
    goals.push(p);
  }
  return goals;
}
function nextStepToward(sim, dwarf, goals) {
  if (goals.length === 0) return null;
  const W = sim.world.size[0];
  const H = sim.world.size[1];
  const costGrid = buildCostGrid(sim, dwarf);
  let bestPath = null;
  for (const goal of goals) {
    const path = costedBFSPath(costGrid, W, H, dwarf.pos, goal);
    if (path.length === 0) continue;
    if (!bestPath || path.length < bestPath.length) bestPath = path;
  }
  if (!bestPath || bestPath.length === 0) return null;
  return bestPath[0];
}
function haulTowardDropoff(sim, dwarf) {
  if (!dwarf.carry || dwarf.carry.amount <= 0) return null;
  if (resources.canDepositAt(sim, dwarf.pos, dwarf.carry.kind)) return null;
  const drop = resources.findNearestDropoffGoal(sim, dwarf.carry.kind, dwarf.pos);
  if (!drop) return { type: "drop", id: dwarf.id };
  const step = nextStepToward(sim, dwarf, [drop]);
  return step ? { type: "move", id: dwarf.id, dir: [step[0] - dwarf.pos[0], step[1] - dwarf.pos[1]] } : null;
}
function buildCostGrid(sim, dwarf) {
  return buildDwarfCostGrid(sim, dwarf.id, OCCUPIED_PATH_COST);
}
function generateMap(W, H, cfg) {
  const world = {
    size: [W, H],
    tiles: new Grid2D([W, H]).fill(T.ROCK),
    explored: new Grid2D([W, H]).fill(0),
    ore: new Grid2D([W, H]).fill(ORE.NONE),
    light: new Grid2D([W, H]).fill(0)
  };
  const cx = Math.floor(W / 2);
  const cy = Math.floor(H / 2);
  const setTile = (x, y, tile) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    world.tiles.set([x, y], tile);
  };
  const setExplored = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    world.explored.set([x, y], 1);
  };
  const carveRect = (x, y, wid, hei, tile = T.FLOOR) => {
    for (let yy = y; yy < y + hei; yy++) {
      for (let xx = x; xx < x + wid; xx++) setTile(xx, yy, tile);
    }
  };
  const wallLine = (x1, y1, x2, y2, gaps = []) => {
    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);
    const len = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let i = 0; i <= len; i++) {
      const x = x1 + dx * i;
      const y = y1 + dy * i;
      if (gaps.some(([gx, gy]) => gx === x && gy === y)) continue;
      setTile(x, y, T.WALL);
    }
  };
  const holdW = 14;
  const holdH = 12;
  const holdL = cx - Math.floor(holdW / 2);
  const holdT = cy - Math.floor(holdH / 2);
  const holdR = holdL + holdW - 1;
  const holdB = holdT + holdH - 1;
  const inHold = (x, y) => x >= holdL && x <= holdR && y >= holdT && y <= holdB;
  const carveBranch = (startX, startY, outward, left, right, steps, reveal) => {
    let x = startX;
    let y = startY;
    for (let i = 0; i < steps; i++) {
      const r = Math.random();
      const dir = r < 0.6 ? outward : r < 0.8 ? left : right;
      const nx = x + dir[0];
      const ny = y + dir[1];
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) break;
      if (inHold(nx, ny)) break;
      setTile(nx, ny, T.FLOOR);
      setExplored(nx, ny);
      if (Math.random() < 0.2) {
        const side = Math.random() < 0.5 ? left : right;
        const len = 2 + Math.floor(Math.random() * 4);
        let sx = nx;
        let sy = ny;
        for (let j = 0; j < len; j++) {
          const bx = sx + side[0];
          const by = sy + side[1];
          if (bx < 0 || by < 0 || bx >= W || by >= H) break;
          if (inHold(bx, by)) break;
          setTile(bx, by, T.FLOOR);
          setExplored(bx, by);
          sx = bx;
          sy = by;
        }
      }
      x = nx;
      y = ny;
    }
  };
  carveRect(holdL, holdT, holdW, holdH, T.FLOOR);
  const gateN = (
    /**@type {XY}*/
    [cx, holdT]
  );
  const gateS = (
    /**@type {XY}*/
    [cx, holdB]
  );
  const gateW = (
    /**@type {XY}*/
    [holdL, cy]
  );
  const gateE = (
    /**@type {XY}*/
    [holdR, cy]
  );
  wallLine(holdL, holdT, holdR, holdT, [gateN]);
  wallLine(holdL, holdB, holdR, holdB, [gateS]);
  wallLine(holdL, holdT, holdL, holdB, [gateW]);
  wallLine(holdR, holdT, holdR, holdB, [gateE]);
  setTile(gateN[0], gateN[1], T.DOOR);
  setTile(gateS[0], gateS[1], T.DOOR);
  setTile(gateW[0], gateW[1], T.DOOR);
  setTile(gateE[0], gateE[1], T.DOOR);
  wallLine(cx - 3, holdT + 1, cx - 3, holdB - 1, [
    [cx - 3, cy - 2],
    [cx - 3, cy],
    [cx - 3, cy + 2],
    [cx - 3, holdT + 2],
    [cx - 3, holdB - 2]
  ]);
  wallLine(cx + 3, holdT + 1, cx + 3, holdB - 1, [
    [cx + 3, cy - 2],
    [cx + 3, cy],
    [cx + 3, cy + 2],
    [cx + 3, holdT + 2],
    [cx + 3, holdB - 2]
  ]);
  wallLine(holdL + 1, cy - 2, holdR - 1, cy - 2, [
    [cx, cy - 2],
    [cx - 3, cy - 2],
    [cx + 3, cy - 2],
    [holdL + 2, cy - 2],
    [holdR - 2, cy - 2]
  ]);
  wallLine(holdL + 1, cy + 2, holdR - 1, cy + 2, [
    [cx, cy + 2],
    [cx - 3, cy + 2],
    [cx + 3, cy + 2],
    [holdL + 2, cy + 2],
    [holdR - 2, cy + 2]
  ]);
  const torches = (
    /**@type {XY[]}*/
    [
      [cx - 5, cy + 4],
      [cx + 5, cy + 4],
      [cx, cy]
    ]
  );
  const woodHopper = (
    /**@type {XY}*/
    [cx - 1, cy + 3]
  );
  const coalHopper = (
    /**@type {XY}*/
    [cx + 1, cy + 3]
  );
  setTile(cx - 5, cy - 4, T.MASON);
  setTile(cx + 5, cy - 4, T.SMELTER);
  setTile(torches[0][0], torches[0][1], T.TORCH);
  setTile(torches[1][0], torches[1][1], T.TORCH);
  setTile(torches[2][0], torches[2][1], T.TORCH);
  setTile(woodHopper[0], woodHopper[1], T.WOOD_HOPPER);
  setTile(coalHopper[0], coalHopper[1], T.COAL_HOPPER);
  for (let i = 1; i <= 6; i++) {
    setTile(cx, holdT - i, T.FLOOR);
    setTile(cx, holdB + i, T.FLOOR);
    setTile(holdL - i, cy, T.FLOOR);
    setTile(holdR + i, cy, T.FLOOR);
    setExplored(cx, holdT - i);
    setExplored(cx, holdB + i);
    setExplored(holdL - i, cy);
    setExplored(holdR + i, cy);
  }
  const gates = [
    { x: cx, y: holdT - 1, outward: [0, -1], left: [-1, 0], right: [1, 0] },
    { x: cx, y: holdB + 1, outward: [0, 1], left: [1, 0], right: [-1, 0] },
    { x: holdL - 1, y: cy, outward: [-1, 0], left: [0, 1], right: [0, -1] },
    { x: holdR + 1, y: cy, outward: [1, 0], left: [0, -1], right: [0, 1] }
  ];
  for (const g of gates) {
    const branches = 2 + Math.floor(Math.random() * 2);
    for (let b = 0; b < branches; b++) {
      const offset = 2 + Math.floor(Math.random() * 3);
      const sx = g.x + g.outward[0] * offset;
      const sy = g.y + g.outward[1] * offset;
      if (sx < 0 || sy < 0 || sx >= W || sy >= H) continue;
      carveBranch(sx, sy, g.outward, g.left, g.right, 6 + Math.floor(Math.random() * 8));
    }
  }
  carveRect(12, 6, 8, 6, T.FLOOR);
  carveRect(W - 20, 6, 8, 6, T.FLOOR);
  carveRect(12, H - 12, 10, 5, T.FLOOR);
  carveRect(W - 22, H - 12, 10, 5, T.FLOOR);
  for (let y = holdT; y <= holdB; y++) {
    for (let x = holdL; x <= holdR; x++) setExplored(x, y);
  }
  applyOreDistribution(
    world,
    { level: cfg.level, theme: cfg.theme, ringBands: cfg.ringBands, biomes: cfg.biomes, veins: cfg.veins, pockets: cfg.pockets, risk: cfg.risk },
    { hold: { holdL, holdT, holdR, holdB, cx, cy }, gates: { gateN, gateS, gateW, gateE }, torches }
  );
  return {
    world,
    hold: { holdL, holdT, holdR, holdB, cx, cy },
    gates: { gateN, gateS, gateW, gateE }
  };
}
function applyOreDistribution(world, cfg, layout) {
  const level = cfg.level;
  const theme = cfg.theme ?? pickTheme(level);
  const ringBands = cfg.ringBands ?? defaultRingBands(level);
  const veins = cfg.veins ?? defaultVeins(level);
  const pockets = cfg.pockets ?? defaultPockets(level);
  const biomes = cfg.biomes ?? defaultBiomes(world.size[0], world.size[1], level);
  const risk = cfg.risk ?? { gateBias: 10, torchPenalty: 6 };
  fillOreByRings(world, layout.hold, layout, ringBands, theme, risk);
  applyBiomeOverrides(world, layout, biomes, theme, risk);
  applyVeins(world, layout, veins, theme, risk);
  applyPockets(world, layout, pockets, theme, risk);
}
function pickTheme(level) {
  const themes = ["ironworks", "gem_vein", "deep_gold", "copper_rush", "coal_heavy"];
  return themes[level % themes.length];
}
function defaultRingBands(level) {
  const mid = 15 + level * 2;
  const deep = 25 + level * 2;
  return [
    { radius: mid, weights: { [ORE.GRANITE]: 70, [ORE.COAL]: 20, [ORE.COPPER]: 10 } },
    { radius: deep, weights: { [ORE.GRANITE]: 40, [ORE.COAL]: 15, [ORE.COPPER]: 20, [ORE.IRON]: 20, [ORE.GOLD]: 5 } },
    { radius: 9999, weights: { [ORE.GRANITE]: 20, [ORE.COAL]: 10, [ORE.COPPER]: 15, [ORE.IRON]: 25, [ORE.GOLD]: 15, [ORE.RUBY]: 5, [ORE.EMERALD]: 5, [ORE.DIAMOND]: 5 } }
  ];
}
function defaultVeins(level) {
  return {
    count: 8 + level * 2,
    minLen: 6,
    maxLen: 18,
    weights: { [ORE.GOLD]: 75, [ORE.COAL]: 10, [ORE.IRON]: 8, [ORE.COPPER]: 5, [ORE.GOLD]: 2 }
  };
}
function defaultPockets(level) {
  return {
    count: 1 + Math.floor(level / 3),
    minSize: 2,
    maxSize: 4,
    weights: { [ORE.RUBY]: 40, [ORE.EMERALD]: 40, [ORE.DIAMOND]: 20 }
  };
}
function defaultBiomes(W, H, level) {
  const centers = [
    [Math.floor(W * 0.25), Math.floor(H * 0.3)],
    [Math.floor(W * 0.75), Math.floor(H * 0.35)],
    [Math.floor(W * 0.3), Math.floor(H * 0.7)],
    [Math.floor(W * 0.7), Math.floor(H * 0.75)]
  ];
  const biomes = [];
  const kinds = [ORE.IRON, ORE.COPPER, ORE.COAL, ORE.GOLD];
  for (let i = 0; i < 3; i++) {
    const center = centers[i % centers.length];
    const kind = kinds[(i + level) % kinds.length];
    biomes.push({ center, radius: 6 + level % 4, weights: { [kind]: 10, [ORE.GRANITE]: 90 } });
  }
  return biomes;
}
function fillOreByRings(world, hold, layout, ringBands, theme, risk) {
  const W = world.size[0];
  const H = world.size[1];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (world.tiles.get([x, y]) !== T.ROCK) continue;
      const dx = x - hold.cx;
      const dy = y - hold.cy;
      const dist2 = Math.sqrt(dx * dx + dy * dy);
      const band = ringBands.find((b) => dist2 <= b.radius) ?? ringBands[ringBands.length - 1];
      let weights = applyThemeWeights(band.weights, theme);
      weights = applyRiskWeights(weights, [x, y], layout, risk);
      const ore = weightedPick(weights);
      world.ore.set([x, y], ore ?? ORE.NONE);
    }
  }
}
function applyBiomeOverrides(world, layout, biomes, theme, risk) {
  for (const biome of biomes) {
    const { center, radius } = biome;
    for (let y = center[1] - radius; y <= center[1] + radius; y++) {
      for (let x = center[0] - radius; x <= center[0] + radius; x++) {
        if (x < 0 || y < 0 || x >= world.size[0] || y >= world.size[1]) continue;
        if (world.tiles.get([x, y]) !== T.ROCK) continue;
        const dx = x - center[0];
        const dy = y - center[1];
        if (dx * dx + dy * dy > radius * radius) continue;
        let weights = applyThemeWeights(biome.weights, theme);
        weights = applyRiskWeights(weights, [x, y], layout, risk);
        const ore = weightedPick(weights);
        if (ore !== null) world.ore.set([x, y], ore);
      }
    }
  }
}
function applyVeins(world, layout, veins, theme, risk) {
  const W = world.size[0];
  const H = world.size[1];
  for (let i = 0; i < veins.count; i++) {
    const start = [Math.floor(Math.random() * W), Math.floor(Math.random() * H)];
    if (world.tiles.get(start) !== T.ROCK) continue;
    let weights = applyThemeWeights(veins.weights, theme);
    weights = applyRiskWeights(weights, start, layout, risk);
    const ore = weightedPick(weights);
    if (ore === null) continue;
    const len = veins.minLen + Math.floor(Math.random() * (veins.maxLen - veins.minLen + 1));
    let x = start[0];
    let y = start[1];
    let dir = pickDir();
    for (let j = 0; j < len; j++) {
      if (x < 0 || y < 0 || x >= W || y >= H) break;
      if (world.tiles.get([x, y]) === T.ROCK) world.ore.set([x, y], ore);
      if (Math.random() < 0.2) dir = pickDir();
      x += dir[0];
      y += dir[1];
    }
  }
}
function applyPockets(world, layout, pockets, theme, risk) {
  const W = world.size[0];
  const H = world.size[1];
  for (let i = 0; i < pockets.count; i++) {
    const size = pockets.minSize + Math.floor(Math.random() * (pockets.maxSize - pockets.minSize + 1));
    const cx = Math.floor(Math.random() * W);
    const cy = Math.floor(Math.random() * H);
    let weights = applyThemeWeights(pockets.weights, theme);
    weights = applyRiskWeights(weights, [cx, cy], layout, risk);
    const ore = weightedPick(weights);
    if (ore === null) continue;
    for (let y = cy - size; y <= cy + size; y++) {
      for (let x = cx - size; x <= cx + size; x++) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        if (world.tiles.get([x, y]) !== T.ROCK) continue;
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy > size * size) continue;
        world.ore.set([x, y], ore);
      }
    }
  }
}
function weightedPick(weights) {
  let total = 0;
  for (const v of Object.values(weights)) total += v;
  if (total <= 0) return null;
  let r = Math.random() * total;
  for (const [k, v] of Object.entries(weights)) {
    r -= v;
    if (r <= 0) return Number(k);
  }
  return Number(Object.keys(weights)[0]);
}
function pickDir() {
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  return dirs[Math.floor(Math.random() * dirs.length)];
}
function applyThemeWeights(weights, theme) {
  const out = { ...weights };
  if (theme === "ironworks") out[ORE.IRON] = (out[ORE.IRON] ?? 0) * 1.4;
  if (theme === "gem_vein") {
    out[ORE.RUBY] = (out[ORE.RUBY] ?? 0) * 1.4;
    out[ORE.EMERALD] = (out[ORE.EMERALD] ?? 0) * 1.4;
    out[ORE.DIAMOND] = (out[ORE.DIAMOND] ?? 0) * 1.2;
  }
  if (theme === "deep_gold") out[ORE.GOLD] = (out[ORE.GOLD] ?? 0) * 1.5;
  if (theme === "copper_rush") out[ORE.COPPER] = (out[ORE.COPPER] ?? 0) * 1.5;
  if (theme === "coal_heavy") out[ORE.COAL] = (out[ORE.COAL] ?? 0) * 1.5;
  return out;
}
function applyRiskWeights(weights, pos, layout, risk) {
  const out = { ...weights };
  const gateDist = nearestGateDist(pos, layout.gates);
  const torchDist = nearestTorchDist(pos, layout.torches);
  const gateScale = 1 + Math.max(0, gateDist - 1) / Math.max(1, risk.gateBias);
  const torchScale = torchDist <= risk.torchPenalty ? torchDist / Math.max(1, risk.torchPenalty) : 1;
  const rare = [ORE.GOLD, ORE.RUBY, ORE.EMERALD, ORE.DIAMOND];
  for (const ore of rare) {
    if (out[ore] !== void 0) out[ore] *= gateScale * torchScale;
  }
  return out;
}
function nearestGateDist(pos, gates) {
  let best = Infinity;
  for (const g of Object.values(gates)) {
    const d = Math.abs(pos[0] - g[0]) + Math.abs(pos[1] - g[1]);
    if (d < best) best = d;
  }
  return best;
}
function nearestTorchDist(pos, torches) {
  let best = Infinity;
  for (const t of torches) {
    const d = Math.abs(pos[0] - t[0]) + Math.abs(pos[1] - t[1]);
    if (d < best) best = d;
  }
  return best;
}
class GameSim {
  constructor(size, config = {}) {
    /** @type {World} */
    __publicField(this, "world");
    /** @type {Map<EntityId, EntityState>} */
    __publicField(this, "entities", /* @__PURE__ */ new Map());
    /** @type {{ holdL: number, holdT: number, holdR: number, holdB: number, cx: number, cy: number }|null} */
    __publicField(this, "hold", null);
    /** @type {EntityId} */
    __publicField(this, "chiefId", 1);
    /** @type {GameMode} */
    __publicField(this, "mode", "explore");
    /** @type {BuildKind} */
    __publicField(this, "buildSelection", "wall");
    /** @type {number} */
    __publicField(this, "tick", 0);
    /** @type {boolean} */
    __publicField(this, "gameOver", false);
    /** @type {GameSimConfig} */
    __publicField(this, "config");
    /** @type {Record<string, number>} */
    __publicField(this, "resources", {});
    /** @type {Record<string, number>} */
    __publicField(this, "dayOutputs", {});
    /** @type {Record<string, number>} */
    __publicField(this, "finalOutputs", {});
    /** @type {Record<string, number>} */
    __publicField(this, "itemStockpile", {});
    /** @type {Record<string, DwarfOrderKind>} */
    __publicField(this, "dayStartRoles", {});
    /** @type {Map<number, WorkshopState>} */
    __publicField(this, "workshops", /* @__PURE__ */ new Map());
    /** @type {Map<number, FloorItem>} */
    __publicField(this, "floorItems", /* @__PURE__ */ new Map());
    /** @type {Map<number, StructureState>} */
    __publicField(this, "structures", /* @__PURE__ */ new Map());
    /** @type {string[]} */
    __publicField(this, "pendingLog", []);
    /** @type {EnemyWaveState|null} */
    __publicField(this, "activeWave", null);
    /** @type {boolean} */
    __publicField(this, "_dayEndPending", false);
    /** @type {boolean} */
    __publicField(this, "endOfDayReady", false);
    /** @type {number} */
    __publicField(this, "_waveCounter", 0);
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      startingResources: { ...DEFAULT_CONFIG.startingResources, ...config.startingResources ?? {} }
    };
    this.world = new World(size);
    this.resources = { ...this.config.startingResources };
    this._genTestMap();
    this._spawnEntities();
    entities._snapshotDayStartRoles(this);
    visibility.updateVisibilityAndLighting(this);
  }
  /** @returns {import('../dwarves.js').ChiefState} */
  get chief() {
    const c = this.entities.get(this.chiefId);
    if (!c || c.kind !== "chief") throw new Error("Missing chief");
    return c;
  }
  _genTestMap() {
    const W = this.world.size[0];
    const H = this.world.size[1];
    const generated = generateMap(W, H, { level: 1 });
    this.world.tiles = generated.world.tiles;
    this.world.explored = generated.world.explored;
    this.world.ore = generated.world.ore;
    this.world.light = generated.world.light;
    this.workshops = /* @__PURE__ */ new Map();
    this.floorItems = /* @__PURE__ */ new Map();
    this.structures = /* @__PURE__ */ new Map();
    this.hold = generated.hold ?? null;
    const masonPos = [generated.hold.cx - 5, generated.hold.cy - 4];
    const smelterPos = [generated.hold.cx + 5, generated.hold.cy - 4];
    workshops._registerWorkshop(this, "mason", masonPos);
    workshops._registerWorkshop(this, "smelter", smelterPos);
    structures._registerStructure(this, masonPos, "mason");
    structures._registerStructure(this, smelterPos, "smelter");
  }
  _spawnEntities() {
    const cx = Math.floor(this.world.size[0] / 2);
    const cy = Math.floor(this.world.size[1] / 2);
    const chief = createChief(1, [cx, cy]);
    const dwarf1 = createDwarf(2, [cx + 1, cy]);
    const dwarf2 = createDwarf(3, [cx - 1, cy]);
    entities._equipTorch(this, chief);
    entities._equipTorch(this, dwarf1);
    entities._equipTorch(this, dwarf2);
    this.entities.set(chief.id, chief);
    this.entities.set(dwarf1.id, dwarf1);
    this.entities.set(dwarf2.id, dwarf2);
  }
}
function _updateEnemyWaves(sim) {
  if (sim.activeWave) {
    const wave = sim.activeWave;
    if (wave.spawnIndex < wave.members.length && sim.tick >= wave.nextSpawnTick) {
      _spawnWaveMember(sim, wave);
    }
    if (wave.spawnIndex >= wave.members.length) {
      sim.activeWave = null;
    }
  }
  if (!sim.activeWave && !sim._dayEndPending && sim.config.enemySpawnEvery > 0 && sim.tick % sim.config.enemySpawnEvery === 0) {
    _maybeStartWave(sim);
  }
}
function _isSpawnActive(sim) {
  return !!(sim.activeWave && sim.activeWave.spawnIndex < sim.activeWave.members.length);
}
function _maybeStartWave(sim) {
  const day = Math.floor(sim.tick / sim.config.dayLength);
  const template = pickWaveTemplate(day);
  if (!template) return;
  const members = buildWaveMembers(template, day);
  if (members.length === 0) return;
  const dayEndTick = (day + 1) * sim.config.dayLength;
  const duration = (members.length - 1) * template.spawnEvery;
  if (sim.tick + duration >= dayEndTick) return;
  const entry = _pickEnemyEntryBoundary(sim);
  if (!entry) return;
  _excavateEdgePathTo(sim, entry);
  sim.activeWave = {
    id: sim._waveCounter++,
    templateId: template.id,
    goal: template.goal,
    spawnEvery: template.spawnEvery,
    nextSpawnTick: sim.tick,
    spawnIndex: 0,
    members,
    entry
  };
  _spawnWaveMember(sim, sim.activeWave);
}
function _spawnWaveMember(sim, wave) {
  if (wave.spawnIndex >= wave.members.length) return;
  const type = wave.members[wave.spawnIndex];
  const spawn = _pickBoundarySpawnNear(sim, wave.entry);
  if (!spawn) {
    wave.spawnIndex += 1;
    wave.nextSpawnTick = sim.tick + wave.spawnEvery;
    return;
  }
  const enemy = createEnemy(entities._nextEntityId(sim), spawn, type);
  enemy.goal = { kind: wave.goal };
  sim.entities.set(enemy.id, enemy);
  wave.spawnIndex += 1;
  wave.nextSpawnTick = sim.tick + wave.spawnEvery;
}
function _pickEnemyEntryBoundary(sim) {
  const candidates = _getExcavatedBoundaryCandidates(sim);
  if (candidates.length === 0) return null;
  const hidden = candidates.filter((pos) => sim.world.visible.get(pos) === 0);
  const pool = hidden.length > 0 ? hidden : candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}
function _pickBoundarySpawnNear(sim, entry) {
  const candidates = _getExcavatedBoundaryCandidates(sim);
  if (candidates.length === 0) return null;
  const near = candidates.filter((pos) => manhattan(pos, entry) <= 4);
  const pool = near.length > 0 ? near : candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}
function _getExcavatedBoundaryCandidates(sim) {
  const region = _collectExcavatedRegionDistances(sim);
  const out = [];
  let maxDist = -1;
  const boundaries = [];
  for (const [key, dist2] of region.entries()) {
    const pos = sim.world.posFromIndex(key);
    if (entities._isInHold(sim, pos)) continue;
    if (entities._isOccupied(sim, pos)) continue;
    if (sim.world.tiles.get(pos) !== T.FLOOR) continue;
    let isBoundary = false;
    for (const nb of neighbors4(pos)) {
      if (!sim.world.inBounds(nb)) {
        isBoundary = true;
        break;
      }
      if (sim.world.tiles.get(nb) === T.ROCK) {
        isBoundary = true;
        break;
      }
    }
    if (isBoundary) {
      boundaries.push({ pos, dist: dist2 });
      if (dist2 > maxDist) maxDist = dist2;
    }
  }
  const threshold = Math.max(0, maxDist - 2);
  for (const b of boundaries) {
    if (b.dist >= threshold) out.push(b.pos);
  }
  return out;
}
function _collectExcavatedRegionDistances(sim) {
  const W = sim.world.size[0];
  const H = sim.world.size[1];
  const total = W * H;
  const visited = new Array(total).fill(false);
  const out = /* @__PURE__ */ new Map();
  const start = sim.hold ? (
    /**@type {XY}*/
    [sim.hold.cx, sim.hold.cy]
  ) : sim.chief.pos;
  if (!sim.world.inBounds(start) || !sim.world.isWalkable(start)) return out;
  const queue = [{ pos: (
    /** @type {XY} */
    [start[0], start[1]]
  ), dist: 0 }];
  visited[start[0] + start[1] * W] = true;
  while (queue.length > 0) {
    const cur = queue.shift();
    if (!cur) break;
    const pos = cur.pos;
    out.set(sim.world.index(pos), cur.dist);
    for (const nb of neighbors4(pos)) {
      if (!sim.world.inBounds(nb)) continue;
      const idx = nb[0] + nb[1] * W;
      if (visited[idx]) continue;
      if (!sim.world.isWalkable(nb)) continue;
      visited[idx] = true;
      queue.push({ pos: nb, dist: cur.dist + 1 });
    }
  }
  return out;
}
function _excavateEdgePathTo(sim, target) {
  const start = _pickEdgeStart(sim, target);
  if (!start) return;
  const W = sim.world.size[0];
  const H = sim.world.size[1];
  const maxSteps = W * H;
  let cur = (
    /**@type {XY}*/
    [start[0], start[1]]
  );
  const visited = /* @__PURE__ */ new Set();
  for (let i = 0; i < maxSteps; i++) {
    visited.add(`${cur[0]},${cur[1]}`);
    if (sim.world.tiles.get(cur) === T.ROCK) sim.world.tiles.set(cur, T.FLOOR);
    if (cur[0] === target[0] && cur[1] === target[1]) break;
    const dx = Math.sign(target[0] - cur[0]);
    const dy = Math.sign(target[1] - cur[1]);
    const preferred = [];
    if (dx !== 0) preferred.push([cur[0] + dx, cur[1]]);
    if (dy !== 0) preferred.push([cur[0], cur[1] + dy]);
    const options = [];
    if (Math.random() < 0.7 && preferred.length > 0) {
      options.push(...preferred);
    } else {
      options.push(
        [cur[0] + 1, cur[1]],
        [cur[0] - 1, cur[1]],
        [cur[0], cur[1] + 1],
        [cur[0], cur[1] - 1]
      );
    }
    let moved = false;
    for (const next of options) {
      if (next[0] < 0 || next[1] < 0 || next[0] >= W || next[1] >= H) continue;
      if (entities._isInHold(sim, next)) continue;
      const key = `${next[0]},${next[1]}`;
      if (visited.has(key)) continue;
      cur = [next[0], next[1]];
      moved = true;
      break;
    }
    if (!moved) break;
  }
}
function _pickEdgeStart(sim, target) {
  const W = sim.world.size[0];
  const H = sim.world.size[1];
  for (let i = 0; i < 12; i++) {
    const edge = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;
    if (edge === 0) {
      x = Math.floor(Math.random() * W);
      y = 0;
    } else if (edge === 1) {
      x = Math.floor(Math.random() * W);
      y = H - 1;
    } else if (edge === 2) {
      x = 0;
      y = Math.floor(Math.random() * H);
    } else {
      x = W - 1;
      y = Math.floor(Math.random() * H);
    }
    const pos = (
      /** @type {XY} */
      [x, y]
    );
    if (entities._isInHold(sim, pos)) continue;
    return pos;
  }
  return target;
}
const waves = {
  _updateEnemyWaves,
  _isSpawnActive,
  _maybeStartWave,
  _spawnWaveMember,
  _pickEnemyEntryBoundary,
  _pickBoundarySpawnNear,
  _getExcavatedBoundaryCandidates,
  _collectExcavatedRegionDistances,
  _excavateEdgePathTo,
  _pickEdgeStart
};
function _drainPendingLog(sim, out) {
  if (sim.pendingLog.length === 0) return;
  out.log.push(...sim.pendingLog);
  sim.pendingLog.length = 0;
}
function _pushLog(sim, line) {
  if (!line) return;
  sim.pendingLog.push(line);
}
const logging = {
  _drainPendingLog,
  _pushLog
};
function applyAction(sim, action, opts = {}) {
  const out = { changedTiles: [], changedEntities: [], log: [] };
  if (opts.advanceTick !== false) _advanceTick(sim);
  if (action.type === "move") {
    const moved = tryMove(sim, action.id, action.dir[0], action.dir[1]);
    if (moved) {
      const e = sim.entities.get(action.id);
      out.changedEntities.push(action.id);
      if (e) out.log.push(`Moved ${e.kind}#${e.id}`);
    }
  } else if (action.type === "mine") {
    const res = tryMine(sim, action.id, action.target);
    if (res.ok) {
      sim.entities.get(action.id);
      out.changedTiles.push(action.target);
      const mined = res.resourceKind ?? "rock";
      out.log.push(`Mined ${mined}`);
      if ("dropped" in res && res.dropped) {
        out.log.push(`Dropped ${res.dropped.kind} x${res.dropped.amount}`);
      }
    } else if (res.reason) {
      out.log.push(res.reason);
    }
  } else if (action.type === "build") {
    const actor = sim.entities.get(action.id);
    if (actor && actor.kind === "enemy") {
      const damaged = structures.tryDamageStructure(sim, actor, action.target);
      if (damaged.ok && damaged.message) {
        out.changedTiles.push(action.target);
        out.log.push(damaged.message);
      } else if (damaged.reason) {
        out.log.push(damaged.reason);
      }
    } else {
      const changed = tryBuild(sim, action.target, action.build);
      if (changed) {
        const e = sim.entities.get(action.id);
        out.changedTiles.push(action.target);
        if (e) out.log.push(`Built ${action.build} by ${e.kind}#${e.id} at ${action.target[0]},${action.target[1]}`);
        if (e && e.kind === "dwarf") {
          setDwarfOrder(e, { kind: "idle" });
          out.changedEntities.push(e.id);
        }
      }
    }
  } else if (action.type === "attack") {
    const res = tryAttack(sim, action.id, action.target);
    if (res.changedEntities.length > 0) {
      out.changedEntities.push(...res.changedEntities);
      out.log.push(...res.log);
    }
  } else if (action.type === "breach") {
    const res = structures.tryBreach(sim, action.id, action.target);
    if (res.ok) {
      out.changedTiles.push(action.target);
      if (res.message) out.log.push(res.message);
    } else if (res.reason) {
      out.log.push(res.reason);
    }
  } else if (action.type === "drop") {
    const res = resources.tryDrop(sim, action.id);
    if (res.ok) {
      const e = sim.entities.get(action.id);
      if ("dropped" in res && res.dropped) {
        out.log.push(`Dropped ${res.dropped.kind} x${res.dropped.amount}`);
      }
      if (e) out.changedTiles.push([e.pos[0], e.pos[1]]);
    } else if (res.reason) {
      out.log.push(res.reason);
    }
  } else if (action.type === "steal") {
    const res = resources.trySteal(sim, action.id, action.target);
    if (res.ok) {
      if (res.message) out.log.push(res.message);
    } else if (res.reason) {
      out.log.push(res.reason);
    }
  } else if (action.type === "escape") {
    const res = resources.tryEscape(sim, action.id);
    if (res.ok) {
      out.changedEntities.push(action.id);
      if (res.message) out.log.push(res.message);
    } else if (res.reason) {
      out.log.push(res.reason);
    }
  }
  visibility.updateVisibilityAndLighting(sim);
  logging._drainPendingLog(sim, out);
  return out;
}
function tryMove(sim, id, dx, dy) {
  var _a;
  const e = sim.entities.get(id);
  if (!e) return false;
  const from = (
    /** @type {XY} */
    [e.pos[0], e.pos[1]]
  );
  const np = (
    /** @type {XY} */
    [e.pos[0] + dx, e.pos[1] + dy]
  );
  if (!sim.world.isWalkable(np)) return false;
  const blocker = entities._getEntityAt(sim, np);
  if (blocker && blocker.id !== e.id) {
    if (!entities._canSwapWithBlocker(sim, e, blocker)) return false;
    blocker.pos = /** @type {XY} */
    [from[0], from[1]];
  }
  const preferredKind = ((_a = e.carry) == null ? void 0 : _a.kind) ?? null;
  e.pos = np;
  resources._tryDepositEntity(sim, e);
  resources._tryPickupEntity(sim, e, preferredKind);
  return true;
}
function tryMine(sim, minerId, target) {
  const check = _checkMine(sim, minerId, target);
  if (!check.ok) return check;
  const miner = sim.entities.get(minerId);
  if (!miner || miner.kind === "enemy") return { ok: false, reason: null };
  let dropped = null;
  if (check.autoDrop === "deposit") {
    resources._tryDepositEntity(sim, miner);
  } else if (check.autoDrop === "drop") {
    const carry = (
      /** @type {{ kind: string, amount: number }|null|undefined} */
      miner.carry
    );
    if (carry && carry.amount > 0) dropped = { kind: carry.kind, amount: carry.amount };
    if (!resources._dropCarryAt(sim, miner, miner.pos)) {
      return { ok: false, reason: "Cannot drop here", dropped };
    }
  }
  if (check.resourceKind) {
    resources._addCarry(sim, miner, check.resourceKind, 1);
  }
  sim.world.tiles.set(target, T.FLOOR);
  return { ok: true, reason: null, resourceKind: check.resourceKind ?? null, dropped };
}
function _checkMine(sim, minerId, target) {
  const w = sim.world;
  if (!w.inBounds(target)) return { ok: false, reason: null };
  if (w.tiles.get(target) !== T.ROCK) return { ok: false, reason: null };
  let ok = false;
  for (const nb of neighbors4(target)) {
    if (w.inBounds(nb) && w.isWalkable(nb)) {
      ok = true;
      break;
    }
  }
  if (!ok) return { ok: false, reason: null };
  const oreType = w.ore.get(target);
  const resourceKind = resources._resourceKeyForOre(sim, oreType);
  if (!resourceKind) return { ok: true, reason: null, resourceKind: null };
  const miner = sim.entities.get(minerId);
  if (!miner || miner.kind === "enemy") return { ok: false, reason: null };
  if (!resources.canCarryResource(sim, miner, resourceKind)) {
    const carry = (
      /** @type {{ kind: string, amount: number }|null|undefined} */
      miner.carry
    );
    if (!carry || carry.amount <= 0) {
      return { ok: false, reason: "Cannot carry more", resourceKind };
    }
    if (carry.kind !== resourceKind) {
      if (miner.kind === "chief") {
        if (structures._canDepositAt(sim, miner.pos, carry.kind)) {
          return { ok: true, reason: null, resourceKind, autoDrop: "deposit" };
        }
        if (resources._canDropAt(sim, miner.pos, carry.kind)) {
          return { ok: true, reason: null, resourceKind, autoDrop: "drop" };
        }
      }
      return { ok: false, reason: `Hands full of ${carry.kind}`, resourceKind };
    }
    return { ok: false, reason: "Cannot carry more", resourceKind };
  }
  return { ok: true, reason: null, resourceKind };
}
function checkMine(sim, minerId, target) {
  const res = _checkMine(sim, minerId, target);
  return { ok: res.ok, reason: res.reason };
}
function tryBuild(sim, target, build) {
  const w = sim.world;
  if (!w.inBounds(target)) return false;
  const cur = w.tiles.get(target);
  if (cur === T.FLOOR) {
    if (build === "wall" || build === "door") {
      if (structures._isWorkshopBufferTile(sim, target)) return false;
    }
    if (WORKSHOP_BUILDS.has(build)) {
      if (!structures._hasWorkshopSpace(sim, target)) return false;
    }
    const cost = BUILD_COSTS[build];
    if (!cost || !resources._hasResources(sim, cost)) return false;
    resources._spendResources(sim, cost);
    const tile = BUILD_TO_TILE[build];
    if (tile === void 0) return false;
    w.tiles.set(target, tile);
    structures._registerStructure(sim, target, build);
    if (WORKSHOP_BUILDS.has(build)) {
      const kind = (
        /** @type {WorkshopKind} */
        build
      );
      workshops._registerWorkshop(sim, kind, target);
    }
    return true;
  }
  if (REMOVABLE_TILES.has(cur)) {
    w.tiles.set(target, T.FLOOR);
    workshops._unregisterWorkshop(sim, target);
    structures._unregisterStructure(sim, target);
    return true;
  }
  return false;
}
function setDwarfOrderAction(sim, dwarfId, order) {
  var _a;
  const e = sim.entities.get(dwarfId);
  if (!e || e.kind !== "dwarf") return false;
  const dwarf = (
    /** @type {import('../dwarves.js').DwarfState} */
    e
  );
  if (((_a = dwarf.order) == null ? void 0 : _a.kind) === "operate" && dwarf.order.target) {
    workshops._clearWorkshopOperator(sim, dwarf.order.target, dwarf.id);
  }
  setDwarfOrder(
    /** @type {import('../dwarves.js').DwarfState} */
    e,
    order
  );
  if (order.kind === "operate" && order.target) {
    workshops._assignWorkshopOperator(sim, order.target, dwarf.id);
  }
  return true;
}
function getAutomationActions(sim) {
  const actions2 = [];
  for (const e of sim.entities.values()) {
    if (e.kind === "dwarf") {
      const act = nextDwarfAction(
        /** @type {import('../dwarves.js').DwarfState} */
        e,
        sim
      );
      if (act) actions2.push(act);
    } else if (e.kind === "enemy") {
      const act = nextEnemyAction(
        /** @type {import('../enemies.js').EnemyState} */
        e,
        sim
      );
      if (act) actions2.push(act);
    }
  }
  return actions2;
}
function applyAutomation(sim, opts = {}) {
  if (opts.advanceTick !== false) _advanceTick(sim);
  const actions2 = getAutomationActions(sim);
  const plannedPositions = /* @__PURE__ */ new Map();
  for (const act of actions2) {
    const ent = sim.entities.get(act.id);
    if (!ent) continue;
    plannedPositions.set(act.id, [ent.pos[0], ent.pos[1]]);
  }
  const merged = { changedTiles: [], changedEntities: [], log: [] };
  if (actions2.length === 0) {
    logging._drainPendingLog(sim, merged);
    return merged.log.length ? merged : null;
  }
  for (const act of actions2) {
    const planned = plannedPositions.get(act.id);
    const actor = sim.entities.get(act.id);
    if (!planned || !actor) continue;
    if (actor.pos[0] !== planned[0] || actor.pos[1] !== planned[1]) continue;
    const res = applyAction(sim, act, { advanceTick: false });
    merged.changedTiles.push(...res.changedTiles);
    merged.changedEntities.push(...res.changedEntities);
    merged.log.push(...res.log);
  }
  logging._drainPendingLog(sim, merged);
  return merged;
}
function _advanceTick(sim) {
  sim.tick++;
  resources._autoDepositCarriers(sim);
  workshops._processWorkshops(sim);
  waves._updateEnemyWaves(sim);
  if (sim.tick % 100 === 0) entities._regenDwarves(sim, 1);
  if (sim.tick % sim.config.dayLength === 0) {
    if (waves._isSpawnActive(sim)) {
      sim._dayEndPending = true;
    } else {
      sim.endOfDayReady = true;
    }
  } else if (sim._dayEndPending && !waves._isSpawnActive(sim)) {
    sim._dayEndPending = false;
    sim.endOfDayReady = true;
  }
}
function tryAttack(sim, attackerId, targetPos) {
  const out = { changedTiles: [], changedEntities: [], log: [] };
  const attacker = sim.entities.get(attackerId);
  if (!attacker) return out;
  const target = entities._getEntityAt(sim, targetPos);
  if (!target || target.id === attackerId) return out;
  if (!entities._isAdjacent(sim, attacker.pos, target.pos)) return out;
  const dmg = entities._getAttackDamage(sim, attacker);
  target.hp -= dmg;
  out.changedEntities.push(attacker.id, target.id);
  out.log.push(`Attack ${attacker.kind}#${attacker.id} -> ${target.kind}#${target.id} for ${dmg}`);
  if (target.hp <= 0) {
    if (target.kind === "chief") {
      target.hp = 0;
      sim.gameOver = true;
      out.log.push(`Chief falls. Game over.`);
    } else {
      if (target.kind === "enemy") {
        const carry = (
          /** @type {{ kind: string, amount: number }|null|undefined} */
          target.carry
        );
        if (carry && carry.amount > 0) {
          resources._addFloorItem(sim, target.pos, carry.kind, carry.amount);
          out.changedTiles.push([target.pos[0], target.pos[1]]);
        }
      }
      sim.entities.delete(target.id);
      out.log.push(`${target.kind}#${target.id} dies`);
    }
  }
  return out;
}
const actions = {
  applyAction,
  tryMove,
  tryMine,
  _checkMine,
  checkMine,
  tryBuild,
  setDwarfOrder: setDwarfOrderAction,
  getAutomationActions,
  applyAutomation,
  _advanceTick,
  tryAttack
};
const SELL_VALUE = (
  /** @type {Record<string, number>} */
  {
    food: 1,
    wood: 2,
    coal: 2,
    raw_granite: 1,
    polished_granite: 2,
    raw_iron: 2,
    raw_copper: 2,
    raw_gold: 3,
    refined_iron: 5,
    refined_copper: 5,
    refined_gold: 7,
    raw_ruby: 4,
    raw_emerald: 4,
    raw_diamond: 6,
    jewelery: 8,
    pickaxe: 10,
    adorned_pickaxe: 14,
    hammer: 10,
    adorned_hammer: 14,
    sword: 12,
    adorned_sword: 16,
    battle_axe: 14,
    adorned_battle_axe: 18,
    battle_hammer: 14,
    adorned_battle_hammer: 18,
    helmet: 10,
    adorned_helmet: 14,
    chainmail: 14,
    adorned_chainmail: 18,
    platemail: 20,
    adorned_platemail: 24,
    shield: 10,
    adorned_shield: 14
  }
);
const OFFER_CATALOG = [
  { type: "resource", kind: "food", label: "Food Rations", minAmount: 3, maxAmount: 8, baseUnitPrice: 4, baseWeight: 1.2, need: "lowFood" },
  { type: "resource", kind: "wood", label: "Seasoned Timber", minAmount: 2, maxAmount: 6, baseUnitPrice: 6, baseWeight: 1, need: "lowWood" },
  { type: "resource", kind: "coal", label: "Surface Coal", minAmount: 2, maxAmount: 5, baseUnitPrice: 7, baseWeight: 0.9, need: "lowCoal" },
  { type: "resource", kind: "refined_iron", label: "Refined Iron", minAmount: 1, maxAmount: 3, baseUnitPrice: 15, baseWeight: 0.8, need: "lowMetal" },
  { type: "resource", kind: "refined_copper", label: "Refined Copper", minAmount: 1, maxAmount: 3, baseUnitPrice: 14, baseWeight: 0.7, need: "lowMetal" },
  { type: "resource", kind: "refined_gold", label: "Refined Gold", minAmount: 1, maxAmount: 2, baseUnitPrice: 22, baseWeight: 0.4, need: null },
  { type: "resource", kind: "jewelery", label: "Cut Jewels", minAmount: 1, maxAmount: 2, baseUnitPrice: 18, baseWeight: 0.6, need: "lowGear" },
  { type: "item", kind: "pickaxe", label: "Pickaxe", minAmount: 1, maxAmount: 1, baseUnitPrice: 30, baseWeight: 0.7, need: "lowGear" },
  { type: "item", kind: "hammer", label: "Hammer", minAmount: 1, maxAmount: 1, baseUnitPrice: 30, baseWeight: 0.7, need: "lowGear" },
  { type: "item", kind: "sword", label: "Sword", minAmount: 1, maxAmount: 1, baseUnitPrice: 38, baseWeight: 0.65, need: "lowGear" },
  { type: "item", kind: "shield", label: "Shield", minAmount: 1, maxAmount: 1, baseUnitPrice: 30, baseWeight: 0.65, need: "lowGear" },
  { type: "item", kind: "helmet", label: "Helmet", minAmount: 1, maxAmount: 1, baseUnitPrice: 28, baseWeight: 0.65, need: "lowGear" },
  { type: "item", kind: "chainmail", label: "Chainmail", minAmount: 1, maxAmount: 1, baseUnitPrice: 45, baseWeight: 0.5, need: "lowGear" }
];
function getSellValue(kind) {
  return SELL_VALUE[kind] ?? 0;
}
function buildDailyOffers(day, needs, count = 6) {
  const guaranteed = OFFER_CATALOG.filter((e) => e.kind === "food" || e.kind === "wood");
  const pool = OFFER_CATALOG.filter((e) => e.kind !== "food" && e.kind !== "wood");
  const extraCount = Math.max(0, count - guaranteed.length);
  const picks = [...guaranteed, ...weightedUniqueSample(pool, extraCount, (entry) => {
    let weight = entry.baseWeight;
    if (entry.need && needs[entry.need]) weight *= 2.4;
    return Math.max(0.05, weight);
  })];
  return picks.map((entry, idx) => {
    const amount = randomInt(entry.minAmount, entry.maxAmount);
    const dayMult = 1 + (day - 1) * 0.03;
    const variance = 0.9 + Math.random() * 0.25;
    const price = Math.max(1, Math.round(entry.baseUnitPrice * amount * dayMult * variance));
    return {
      id: `offer_${day}_${idx}_${entry.kind}`,
      type: (
        /** @type {EndOfDayOfferType} */
        entry.type
      ),
      kind: entry.kind,
      label: entry.label,
      amount,
      price
    };
  });
}
function weightedUniqueSample(items, count, weightOf) {
  const pool = items.slice();
  const out = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const total = pool.reduce((acc, it) => acc + Math.max(0, weightOf(it)), 0);
    if (total <= 0) break;
    let roll = Math.random() * total;
    let pickedIndex = 0;
    for (let j = 0; j < pool.length; j++) {
      roll -= Math.max(0, weightOf(pool[j]));
      if (roll <= 0) {
        pickedIndex = j;
        break;
      }
    }
    out.push(pool[pickedIndex]);
    pool.splice(pickedIndex, 1);
  }
  return out;
}
function randomInt(min, max) {
  if (max <= min) return min;
  return min + Math.floor(Math.random() * (max - min + 1));
}
function shortResourceName(kind) {
  const map = {
    raw_granite: "granite",
    raw_iron: "iron",
    raw_copper: "copper",
    raw_gold: "gold",
    raw_ruby: "ruby",
    raw_emerald: "emerald",
    raw_diamond: "diamond",
    polished_granite: "stone",
    refined_iron: "steel",
    refined_copper: "copper+",
    refined_gold: "gold+",
    jewelery: "jewels"
  };
  return map[kind] ?? kind;
}
function itemShortName(itemId) {
  const map = {
    sword: "sword",
    adorned_sword: "+1 sword",
    battle_axe: "baxe",
    adorned_battle_axe: "+1 baxe",
    battle_hammer: "bhammer",
    adorned_battle_hammer: "+1 bhammer",
    shield: "shield",
    adorned_shield: "+1 shield",
    helmet: "helm",
    adorned_helmet: "+1 helm",
    chainmail: "chain",
    adorned_chainmail: "+1 chain",
    platemail: "plate",
    adorned_platemail: "+1 plate",
    pickaxe: "pick",
    adorned_pickaxe: "+1 pick",
    hammer: "hammer",
    adorned_hammer: "+1 hammer"
  };
  return map[itemId] ?? itemId;
}
function createEndOfDayState(tradeSilver = 50) {
  return {
    active: false,
    day: 1,
    phase: "recruit",
    tradeSilver,
    maxRecruits: 1,
    recruited: 0,
    offers: [],
    feastFoodCost: 0,
    recruitOptions: []
  };
}
function startEndOfDay(sim, state) {
  if (state.active) return null;
  const day = Math.floor(sim.tick / sim.config.dayLength);
  resources.deliverDayOutputs(sim);
  const foodNeed = getDailyFeastFoodNeed(sim);
  const needs = computeSurfaceNeeds(sim, foodNeed);
  state.active = true;
  state.day = day;
  state.phase = "recruit";
  state.maxRecruits = getMaxRecruitsForDay();
  state.recruited = 0;
  state.feastFoodCost = foodNeed;
  state.recruitOptions = buildRecruitOptions(day, 3);
  state.offers = buildDailyOffers(day, needs, 6);
  sim.endOfDayReady = false;
  logging._pushLog(sim, `Day ${day} ended. Recruit, then trade.`);
  const out = { changedTiles: [], changedEntities: [], log: [] };
  logging._drainPendingLog(sim, out);
  return out;
}
function recruit(sim, state, index) {
  const out = { changedTiles: [], changedEntities: [], log: [] };
  if (!state.active || state.phase !== "recruit") return out;
  if (state.recruited >= state.maxRecruits) {
    out.log.push("No recruit slots left");
    return out;
  }
  if (state.recruitOptions.length === 0) {
    state.recruitOptions = buildRecruitOptions(state.day, 3);
  }
  const pick = state.recruitOptions[index];
  if (!pick) {
    out.log.push("No recruit selected");
    return out;
  }
  const spawned = entities._spawnDwarfFromOption(sim, pick);
  if (!spawned) {
    out.log.push("No room to recruit a new dwarf");
    return out;
  }
  state.recruitOptions.splice(index, 1);
  state.recruited += 1;
  state.phase = "trade";
  out.log.push(`Recruited ${pick.label} (free)`);
  out.log.push("Trade phase started");
  return out;
}
function toTrade(sim, state) {
  const out = { changedTiles: [], changedEntities: [], log: [] };
  if (!state.active) return out;
  state.phase = "trade";
  out.log.push("Trade phase started");
  return out;
}
function buy(sim, state, index) {
  const out = { changedTiles: [], changedEntities: [], log: [] };
  if (!state.active || state.phase !== "trade") return out;
  const offer = state.offers[index];
  if (!offer) {
    out.log.push("No offer selected");
    return out;
  }
  if (state.tradeSilver < offer.price) {
    out.log.push("Not enough silver");
    return out;
  }
  state.tradeSilver -= offer.price;
  resources.applyBuy(sim, offer);
  state.offers.splice(index, 1);
  out.log.push(`Bought ${offer.label} x${offer.amount} for ${offer.price} silver`);
  return out;
}
function sell(sim, state, index) {
  const out = { changedTiles: [], changedEntities: [], log: [] };
  if (!state.active || state.phase !== "trade") return out;
  const rows = getSellOptions(sim);
  const row = rows[index];
  if (!row) {
    out.log.push("Nothing selected to sell");
    return out;
  }
  if (row.type === "item") {
    if (row.unused > 0) {
      sim.itemStockpile[row.kind] = Math.max(0, (sim.itemStockpile[row.kind] ?? 0) - 1);
    } else if (!workshops.unequipOneItem(sim, row.kind)) {
      out.log.push(`No ${row.label} available`);
      return out;
    }
  } else {
    if (!resources.sellResource(sim, row.kind)) {
      out.log.push(`No ${row.label} available`);
      return out;
    }
  }
  state.tradeSilver += row.value;
  out.log.push(`Sold ${row.label} for ${row.value} silver`);
  return out;
}
function finishEndOfDay(sim, state) {
  const out = { changedTiles: [], changedEntities: [], log: [] };
  if (!state.active) return out;
  const feast = resources.consumeFeastFood(sim, state.feastFoodCost);
  entities._returnToHold(sim);
  const assigned = workshops.autoAssignEquipmentFromDayStartRoles(sim);
  entities._healAllEntities(sim);
  entities._snapshotDayStartRoles(sim);
  if (assigned > 0) {
    logging._pushLog(sim, `Forge outfitted ${assigned} gear slot${assigned === 1 ? "" : "s"}.`);
  }
  if (feast.deficit > 0) {
    logging._pushLog(sim, `Feast short by ${feast.deficit} food. Morale suffers.`);
  } else if (feast.used > 0) {
    logging._pushLog(sim, `Feast consumed ${feast.used} food.`);
  }
  if (state.day >= 4 && !sim.gameOver) {
    sim.gameOver = true;
    logging._pushLog(sim, "Day 4 complete. The hold is secure.");
  }
  state.active = false;
  state.phase = "recruit";
  state.offers = [];
  state.recruitOptions = [];
  state.recruited = 0;
  state.maxRecruits = 1;
  state.feastFoodCost = 0;
  logging._drainPendingLog(sim, out);
  out.log.push("A new day begins");
  return out;
}
function getSellOptions(sim, state) {
  const rows = [];
  for (const [kind, amount] of Object.entries(sim.resources)) {
    if ((amount ?? 0) <= 0) continue;
    const value = getSellValue(kind);
    if (value <= 0) continue;
    rows.push({
      id: `sell_res_${kind}`,
      type: "resource",
      kind,
      label: shortResourceName(kind),
      available: amount,
      used: 0,
      unused: amount,
      value
    });
  }
  const usage = workshops.getItemUsageTallies(sim);
  for (const item of usage) {
    if (item.total <= 0) continue;
    const value = getSellValue(item.id);
    if (value <= 0) continue;
    rows.push({
      id: `sell_item_${item.id}`,
      type: "item",
      kind: item.id,
      label: item.label,
      available: item.total,
      used: item.used,
      unused: item.unused,
      value
    });
  }
  rows.sort((a2, b) => a2.label.localeCompare(b.label));
  return rows;
}
function getDailyFeastFoodNeed(sim) {
  let dwarves = 0;
  for (const e of sim.entities.values()) {
    if (e.kind === "dwarf") dwarves += 1;
  }
  return 2 + dwarves;
}
function computeSurfaceNeeds(sim, foodNeed) {
  const food = sim.resources.food ?? 0;
  const wood = sim.resources.wood ?? 0;
  const coal = sim.resources.coal ?? 0;
  const iron = sim.resources.refined_iron ?? 0;
  const toolCount = sumResources(sim.itemStockpile, ["pickaxe", "adorned_pickaxe", "hammer", "adorned_hammer"]);
  return {
    lowFood: food < foodNeed + 2,
    lowWood: wood < 4,
    lowCoal: coal < 4,
    lowMetal: iron < 3,
    lowGear: toolCount < 2
  };
}
function getMaxRecruitsForDay(day) {
  return 1;
}
function buildRecruitOptions(day, count) {
  const pool = RECRUIT_ARCHETYPES.slice();
  const picks = [];
  const total = Math.min(count, pool.length);
  for (let i = 0; i < total; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const base = pool.splice(idx, 1)[0];
    picks.push({
      id: `${base.id}_${day}_${i}`,
      label: base.label,
      summary: base.summary,
      hp: base.hp,
      loadout: [...base.loadout],
      role: base.role
    });
  }
  return picks;
}
const Facing = Object.freeze({
  north: 0,
  east: 1,
  south: 2,
  west: 3,
  none: 4
});
const FacingVec = Object.freeze([
  [0, -1],
  // north
  [1, 0],
  // east
  [0, 1],
  // south
  [-1, 0],
  // west
  [0, 0]
  // none
]);
function createInfoPaneWidget() {
  return Label.a({
    id: "info",
    text: "Fortress conditions\n",
    fontName: "serif",
    align: "left",
    hints: { x: 0, y: "2", w: "15", h: "36" },
    wrap: true,
    fontSize: "0.75",
    valign: "top",
    outlineColor: "yellow"
  });
}
function buildInfoPaneText(sim, ui) {
  if (ui.endOfDay.active) {
    return buildEndOfDayOnlyText(sim, ui);
  }
  const chief = sim.chief;
  const dwarves = [...sim.entities.values()].filter((e) => e.kind === "dwarf");
  const enemies = [...sim.entities.values()].filter((e) => e.kind === "enemy");
  const lines = [];
  lines.push("Dwarves");
  lines.push(formatChiefLine(chief));
  if (dwarves.length === 0) lines.push("(none)");
  for (const d of dwarves) lines.push(formatDwarfLine(d));
  lines.push("");
  lines.push("Enemies");
  if (enemies.length === 0) lines.push("(none)");
  for (const e of enemies) lines.push(formatEnemyLine(e));
  lines.push("");
  lines.push("Resources");
  lines.push(...formatResourceTallies(sim, sim.resources));
  lines.push("");
  lines.push("Items (unassigned)");
  lines.push(...formatItemTallies(resources.getItemTallies(sim)));
  lines.push("");
  lines.push("Items (used vs unused)");
  lines.push(...formatUsageTallies(workshops.getItemUsageTallies(sim)));
  lines.push("");
  lines.push("Day Outputs");
  lines.push(...formatResourceTallies(sim, sim.dayOutputs));
  lines.push("");
  lines.push("Final Outputs");
  lines.push(...formatResourceTallies(sim, sim.finalOutputs));
  return lines.join("\n");
}
function buildEndOfDayOnlyText(sim, ui) {
  const lines = [];
  lines.push(...formatEndOfDayPanel(sim, ui));
  lines.push("");
  lines.push("Stock Snapshot");
  const keyRows = formatEndOfDayStockRows(sim);
  lines.push(...keyRows.length ? keyRows : ["(empty)"]);
  lines.push("");
  lines.push("Item Usage");
  lines.push(...formatUsageTallies(workshops.getItemUsageTallies(sim)));
  return lines.join("\n");
}
function formatEndOfDayPanel(sim, ui) {
  const eod = ui.endOfDay;
  const lines = [];
  lines.push(`End Of Day ${eod.day}`);
  lines.push(`Trade Silver: ${eod.tradeSilver}`);
  lines.push(`Feast Food Need: ${eod.feastFoodCost} (have ${sim.resources.food ?? 0})`);
  lines.push(`Phase: ${eod.phase}`);
  if (eod.phase === "recruit") {
    lines.push(`Recruits: ${eod.recruited}/${eod.maxRecruits}`);
    lines.push("Keys: Up/Down select | Enter recruit (free) | T skip | F finish | L look");
    lines.push("");
    lines.push("Candidates");
    if (!eod.recruitOptions || eod.recruitOptions.length === 0) {
      lines.push("  (none)");
    } else {
      for (let i = 0; i < eod.recruitOptions.length; i++) {
        const opt = eod.recruitOptions[i];
        const marker = ui.endDayIndex === i ? ">" : " ";
        lines.push(`${marker} ${opt.label} hp:${opt.hp} ${opt.summary}`);
      }
    }
    return lines;
  }
  lines.push("Keys: Up/Down select (buy+sell wraps) | Enter act | F finish | L look");
  lines.push("");
  lines.push("Buy Offers");
  if (eod.offers.length === 0) {
    lines.push("  (none)");
  } else {
    for (let i = 0; i < eod.offers.length; i++) {
      const o = eod.offers[i];
      const marker = ui.endDayIndex === i ? ">" : " ";
      lines.push(`${marker} ${o.label} x${o.amount} (${o.price}s)`);
    }
  }
  const sellRows = getSellOptions(sim);
  lines.push("");
  lines.push("Sell Stock");
  if (sellRows.length === 0) {
    lines.push("  (nothing sellable)");
  } else {
    for (let i = 0; i < sellRows.length; i++) {
      const s = sellRows[i];
      const marker = ui.endDayIndex === eod.offers.length + i ? ">" : " ";
      if (s.type === "item") {
        lines.push(`${marker} ${s.label} ${s.used}/${s.unused} used/free (+${s.value}s)`);
      } else {
        lines.push(`${marker} ${s.label} x${s.available} (+${s.value}s)`);
      }
    }
  }
  return lines;
}
function formatEndOfDayStockRows(sim) {
  const picks = [
    ["food", "Food"],
    ["wood", "Wood"],
    ["coal", "Coal"],
    ["refined_iron", "Refined Iron"],
    ["jewelery", "Jewelry"]
  ];
  const lines = [];
  for (const [id, label] of picks) {
    const amount = sim.resources[id] ?? 0;
    lines.push(`${label}: ${amount}`);
  }
  return lines;
}
function formatChiefLine(chief) {
  const carry = chief.carry && chief.carry.amount > 0 ? ` ${shortResourceName(chief.carry.kind)}x${chief.carry.amount}` : "";
  return `Chief#${chief.id} hp:${chief.hp}${carry}`;
}
function formatDwarfLine(dwarf) {
  var _a, _b, _c, _d;
  const order = ((_a = dwarf.order) == null ? void 0 : _a.kind) ?? "idle";
  const build = ((_b = dwarf.order) == null ? void 0 : _b.kind) === "build" ? ((_c = dwarf.order) == null ? void 0 : _c.build) ?? "wall" : null;
  const target = ((_d = dwarf.order) == null ? void 0 : _d.target) ? ` @${dwarf.order.target[0]},${dwarf.order.target[1]}` : "";
  const orderLabel = build ? `${order}(${build})` : order;
  const carry = dwarf.carry && dwarf.carry.amount > 0 ? ` ${shortResourceName(dwarf.carry.kind)}x${dwarf.carry.amount}` : "";
  const gear = formatEquipmentCompact(dwarf);
  return `Dwarf#${dwarf.id} hp:${dwarf.hp} ${orderLabel}${target}${carry}${gear}`;
}
function formatEnemyLine(enemy) {
  var _a;
  const goal = ((_a = enemy.goal) == null ? void 0 : _a.kind) ? ` goal:${enemy.goal.kind}` : "";
  return `Enemy#${enemy.id} ${enemy.type ?? "enemy"} hp:${enemy.hp} state:${enemy.state}${goal}`;
}
function formatResourceTallies(sim, map) {
  const rows = resources.getResourceTallies(sim, map);
  if (rows.length === 0) return ["(none)"];
  return rows.map((r) => `${r.label}: raw ${r.raw} | proc ${r.processed}`);
}
function formatItemTallies(rows) {
  if (!rows || rows.length === 0) return ["(none)"];
  return rows.map((r) => `${r.label}: ${r.count}`);
}
function formatUsageTallies(rows) {
  if (!rows || rows.length === 0) return ["(none)"];
  return rows.map((r) => `${r.label}: used ${r.used} | free ${r.unused} | total ${r.total}`);
}
function formatEquipmentCompact(dwarf) {
  const eq = dwarf.equipment ?? null;
  if (!eq) return "";
  const parts = [];
  if (eq.weapon) parts.push(itemShortName(eq.weapon));
  if (eq.offhand) parts.push(itemShortName(eq.offhand));
  if (eq.head) parts.push(itemShortName(eq.head));
  if (eq.armor) parts.push(itemShortName(eq.armor));
  if (eq.tool) parts.push(itemShortName(eq.tool));
  if (parts.length === 0) return "";
  return ` gear:${parts.join("/")}`;
}
const urlTileset = "" + new URL("colored_tilemap_256x256-VkWZzaQH.png", import.meta.url).href;
const TILE_DIM_PX = 8;
const EDGE_SIDE_N = 1;
const EDGE_SIDE_E = 2;
const EDGE_SIDE_S = 4;
const EDGE_SIDE_W = 8;
const EDGES = {
  light: (
    /** @type {EdgeSpec} */
    { tile: [0, 19], sides: 11 }
  ),
  // N/E/W
  lightOre: (
    /** @type {EdgeSpec} */
    { tile: [0, 21], sides: 11 }
  ),
  // N/E/W
  dark: (
    /** @type {EdgeSpec} */
    { tile: [0, 20], sides: 15 }
  )
  // N/E/S/W
};
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}
function canvasToImage(canvas) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to create image from generated variant sheet"));
    img.src = canvas.toDataURL("image/png");
  });
}
function drawEdgeOverlay(ctx, source, tileDim, edge, dir, dx, dy, srcEdgeDir = "n") {
  const sx = edge[0] * tileDim;
  const sy = edge[1] * tileDim;
  if (dir === srcEdgeDir) {
    ctx.drawImage(source, sx, sy, tileDim, tileDim, dx, dy, tileDim, tileDim);
    return;
  }
  const angleFor = (d) => {
    if (d === "n") return 0;
    if (d === "e") return Math.PI / 2;
    if (d === "s") return Math.PI;
    return -Math.PI / 2;
  };
  ctx.save();
  ctx.translate(dx + tileDim / 2, dy + tileDim / 2);
  ctx.rotate(angleFor(dir) - angleFor(srcEdgeDir));
  ctx.drawImage(source, sx, sy, tileDim, tileDim, -8 / 2, -8 / 2, tileDim, tileDim);
  ctx.restore();
}
function enabledEdgeDirs(edge) {
  const dirs = [];
  if (edge.sides & EDGE_SIDE_N) dirs.push("n");
  if (edge.sides & EDGE_SIDE_E) dirs.push("e");
  if (edge.sides & EDGE_SIDE_S) dirs.push("s");
  if (edge.sides & EDGE_SIDE_W) dirs.push("w");
  return dirs;
}
async function buildEdgeVariantSheet(baseSheet, tileDim, edges) {
  const out = document.createElement("canvas");
  out.width = baseSheet.width;
  out.height = baseSheet.height;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Could not create 2D context for variant sheet");
  ctx.clearRect(0, 0, out.width, out.height);
  ctx.drawImage(baseSheet, 0, 0);
  const edgeRows = Object.values(edges);
  if (!edgeRows.length) return canvasToImage(out);
  for (const edge of edgeRows) {
    const dstStartX = edge.tile[0];
    const dy = edge.tile[1] * tileDim;
    const dirs = enabledEdgeDirs(edge);
    if (!dirs.length) continue;
    const maxVariant = (1 << dirs.length) - 1;
    const srcEdgeDir = edge.srcEdgeDir ?? "n";
    for (let variant = 1; variant <= maxVariant; variant += 1) {
      const dx = (dstStartX + variant) * tileDim;
      ctx.clearRect(dx, dy, tileDim, tileDim);
      for (let i = 0; i < dirs.length; i += 1) {
        if (variant & 1 << i) drawEdgeOverlay(ctx, baseSheet, tileDim, edge.tile, dirs[i], dx, dy, srcEdgeDir);
      }
    }
  }
  return canvasToImage(out);
}
function resolveSolidFace(icon, neighborMask) {
  if (!icon) return null;
  const faces = icon.faces ?? [];
  if (faces.length === 0) return null;
  if (faces.length === 16) return faces[neighborMask] ?? faces[0] ?? null;
  if (faces.length === 2) return neighborMask & EDGE_SIDE_S ? faces[1] ?? faces[0] ?? null : faces[0] ?? null;
  return faces[0] ?? null;
}
function resolveEdgeVariant(edge, variantIndex) {
  if (!edge || variantIndex <= 0) return null;
  return (
    /** @type {XY} */
    [edge.tile[0] + variantIndex, edge.tile[1]]
  );
}
const tileIcon = {
  [T.FLOOR]: { faces: [[1, 1]], edge: EDGES.dark },
  [T.ROCK]: { faces: [[4, 4]] },
  [T.WALL]: { faces: [[3, 4]] },
  [T.TORCH]: { faces: [[9, 9]] },
  [T.SMELTER]: { faces: [[12, 5]], edge: EDGES.dark },
  [T.FORGE]: { faces: [[12, 5]], edge: EDGES.dark },
  [T.TRAP_BENCH]: { faces: [[12, 5]], edge: EDGES.dark },
  [T.JEWELER]: { faces: [[12, 5]], edge: EDGES.dark },
  [T.DOOR]: { faces: [[4, 2]] },
  [T.MASON]: { faces: [[12, 5]], edge: EDGES.dark },
  [T.WOOD_HOPPER]: { faces: [[22, 6]], edge: EDGES.dark },
  [T.COAL_HOPPER]: { faces: [[22, 7]], edge: EDGES.dark }
};
const oreIcon = {
  [ORE.GRANITE]: { faces: [[0, 17], [0, 18]], edge: EDGES.lightOre },
  [ORE.IRON]: { faces: [[1, 17], [1, 18]], edge: EDGES.lightOre },
  [ORE.COPPER]: { faces: [[2, 17], [2, 18]], edge: EDGES.lightOre },
  [ORE.GOLD]: { faces: [[3, 17], [3, 18]], edge: EDGES.lightOre },
  [ORE.COAL]: { faces: [[4, 17], [4, 18]], edge: EDGES.lightOre },
  [ORE.EMERALD]: { faces: [[5, 17], [5, 18]], edge: EDGES.lightOre },
  [ORE.RUBY]: { faces: [[6, 17], [6, 18]], edge: EDGES.lightOre },
  [ORE.DIAMOND]: { faces: [[7, 17], [7, 18]], edge: EDGES.lightOre }
};
const floorItemIcon = {
  raw_granite: [0, 16],
  raw_iron: [1, 16],
  raw_copper: [2, 16],
  raw_gold: [3, 16],
  coal: [4, 16],
  raw_ruby: [5, 16],
  raw_emerald: [6, 16],
  raw_diamond: [7, 16],
  raw_gem: [6, 16]
};
const targetIcon = (
  /** @type {XY} */
  [0, 11]
);
const orderTargetIcon = (
  /** @type {XY} */
  [1, 11]
);
const HOPPER_CAPACITY = 72;
const HOPPER_STEP = 12;
const HOPPER_LEVELS = Math.floor(HOPPER_CAPACITY / HOPPER_STEP);
const entIcon = {
  rat: [13, 0],
  kobold: [8, 0],
  goblin: [9, 0],
  sapper: [10, 0],
  ogre: [11, 0],
  dwarf: [14, 0],
  chief: [15, 0]
};
class DwarfGameApp extends App {
  /**
   * @param {HTMLImageElement} tileSource
   */
  constructor(tileSource) {
    super();
    __publicField(this, "prefDimW", 64);
    __publicField(this, "prefDimH", 40);
    /** @type {GameSim} */
    __publicField(this, "sim");
    /** @type {WebGLTileWidget} */
    __publicField(this, "webgl");
    /** @type {Label} */
    __publicField(this, "info");
    /** @type {Label} */
    __publicField(this, "header");
    /** @type {Label} */
    __publicField(this, "hotkeys");
    /** @type {Label} */
    __publicField(this, "status");
    /** @type {string[]} */
    __publicField(this, "logLines", []);
    /** @type {import('./facing.js').FacingId} */
    __publicField(this, "lastFacing", Facing.south);
    /** @type {number|null} */
    __publicField(this, "selectedDwarfId", null);
    /** @type {'none'|'order_who'|'order_what'|'order_where'|'build_what'|'build_where'|'look'} */
    __publicField(this, "commandMode", "none");
    /** @type {number|null} */
    __publicField(this, "pendingOrderDwarfId", null);
    /** @type {'guard'|'mine'|'build'|'operate'|null} */
    __publicField(this, "pendingOrderKind", null);
    /** @type {boolean} */
    __publicField(this, "pendingBuildForOrder", false);
    /** @type {'mine'|'build'|null} */
    __publicField(this, "lastContextAction", null);
    /** @type {XY|null} */
    __publicField(this, "cursorPos", null);
    /** @type {boolean} */
    __publicField(this, "debugIgnoreVisibility", false);
    /** @type {boolean} */
    __publicField(this, "debugIgnoreExplored", false);
    /** @type {number} */
    __publicField(this, "endDayIndex", 0);
    /** @type {import('./ui/end_of_day.js').EndOfDayState} */
    __publicField(this, "endOfDay", createEndOfDayState());
    this.sim = new GameSim([54, 36]);
    this.selectedDwarfId = this._firstDwarfId();
    this.webgl = WebGLTileWidget.a({
      id: "terrain",
      txTileDim: TILE_DIM_PX,
      src: tileSource,
      hints: { right: 1, y: "2", w: "54", h: "36" }
    });
    this.info = createInfoPaneWidget();
    this.header = Label.a({
      id: "header",
      text: "Dwarves PoC",
      fontName: "serif",
      align: "left",
      hints: { x: 0, y: 0, w: 1, h: "2" },
      fontSize: "1"
    });
    this.hotkeys = Label.a({
      id: "hotkeys",
      text: "",
      fontName: "serif",
      align: "right",
      hints: { x: 0, y: 0, w: 1, h: "2" },
      fontSize: "1"
    });
    this.status = Label.a({
      id: "status",
      text: "",
      fontName: "serif",
      align: "left",
      hints: { x: 0, y: "38", w: 1, h: "2" },
      fontSize: "1"
    });
    this.baseWidget.children = [this.header, this.hotkeys, this.status, this.info, this.webgl];
    this.syncFromSim(
      /*result*/
      null
    );
    this.updateProperties({});
  }
  /** @param {SimResult|null} result */
  syncFromSim(result) {
    var _a, _b, _c, _d, _e, _f;
    const c = this.sim.chief;
    const dwarf = this._getSelectedDwarf();
    const dwarfLabel = dwarf ? ` | Dwarf#${dwarf.id} ${((_a = dwarf.order) == null ? void 0 : _a.kind) ?? "idle"}` : "";
    const dayLen = this.sim.config.dayLength;
    const baseDay = Math.floor(this.sim.tick / dayLen) + 1;
    const baseDayTick = this.sim.tick % dayLen;
    const dayEndPending = this.sim._dayEndPending === true;
    const day = dayEndPending ? Math.max(1, baseDay - 1) : baseDay;
    const dayTick = dayEndPending ? baseDayTick + dayLen : baseDayTick;
    const gameOverLabel = this.sim.gameOver ? " | GAME OVER" : "";
    const debugFlags = [
      this.debugIgnoreVisibility ? "VIS:ALL" : null,
      this.debugIgnoreExplored ? "EXP:ALL" : null
    ].filter(Boolean);
    if (this.sim.endOfDayReady && !this.endOfDay.active) {
      const eodStart = startEndOfDay(this.sim, this.endOfDay);
      this.endDayIndex = 0;
      if (eodStart) {
        if (result) result.log.push(...eodStart.log);
        else result = eodStart;
      }
    }
    const debugLabel = debugFlags.length ? ` | ${debugFlags.join(" ")}` : "";
    this.header.text = `Day ${day} (${dayTick}/${dayLen}) | Chief (${c.pos[0]},${c.pos[1]})${dwarfLabel}${gameOverLabel}${debugLabel}`;
    this.hotkeys.text = this._buildHotkeyPrompt();
    if (this.endOfDay.active) this._clampEndDaySelection();
    this.info.text = buildInfoPaneText(this.sim, { endDayIndex: this.endDayIndex, endOfDay: this.endOfDay });
    if ((_b = result == null ? void 0 : result.log) == null ? void 0 : _b.length) {
      for (const line of result.log) this._pushLogLine(line);
      this.logLines = this.logLines.slice(-3);
    }
    const logText = this.logLines.join(" | ");
    if (this.commandMode === "look") {
      const lookPos = this.cursorPos ?? this.sim.chief.pos;
      const lookText = `Look: ${this._describeAt(lookPos)}`;
      this.status.text = lookText;
    } else if (this.commandMode === "order_who") {
      this.status.text = this._buildOrderWhoFooter();
    } else {
      this.status.text = logText;
    }
    this.webgl.drawBatch = [];
    const ignoreExplored = this.debugIgnoreExplored;
    const ignoreVisibility = this.debugIgnoreVisibility;
    const explored = this.sim.world.explored;
    const visible = this.sim.world.visible;
    const light = this.sim.world.light;
    const ambient = this.sim.config.ambientLight ?? 0;
    const memoryTint = this.sim.config.memoryTint ?? 0.5;
    const isExplored = (xy) => ignoreExplored || explored.get(xy) === 1;
    const isVisible = (xy) => ignoreVisibility || visible.get(xy) === 1;
    const tileLight = (xy) => {
      if (ignoreVisibility) return 1;
      return Math.min(1, Math.max(0, light.get(xy) + ambient));
    };
    for (let xy of this.sim.world.tiles.iterAll()) {
      if (!isExplored(xy)) continue;
      const lit = isVisible(xy);
      const brightness = lit ? tileLight(xy) : memoryTint;
      const tint = (
        /**@type {[number, number, number, number]} */
        [brightness, brightness, brightness, 1]
      );
      const t = this.sim.world.tiles.get(xy);
      const hopper = this._hopperIcon(t);
      const solidSpec = tileIcon[t];
      const sameMask = this._neighborMaskForTile(xy);
      const oppMask = this._oppositeClassMask(xy);
      const solidMask = ((_c = solidSpec == null ? void 0 : solidSpec.faces) == null ? void 0 : _c.length) === 2 ? oppMask : sameMask;
      const fallbackMask = ((_e = (_d = tileIcon[T.ROCK]) == null ? void 0 : _d.faces) == null ? void 0 : _e.length) === 2 ? oppMask : sameMask;
      const ti = hopper ?? resolveSolidFace(solidSpec, solidMask) ?? resolveSolidFace(tileIcon[T.ROCK], fallbackMask);
      if (!ti) continue;
      this.webgl.addTile(ti[0], ti[1], 1, 1, xy[0], xy[1], 1, 1, tint);
      if (!hopper) {
        const edgeIndex = this._edgeVariantIndex(xy, solidSpec == null ? void 0 : solidSpec.edge);
        const ei = resolveEdgeVariant(solidSpec == null ? void 0 : solidSpec.edge, edgeIndex);
        if (ei) this.webgl.addTile(ei[0], ei[1], 1, 1, xy[0], xy[1], 1, 1, tint);
      }
      if (t === T.ROCK) {
        const oreId = this.sim.world.ore.get(xy);
        const oreSpec = oreIcon[oreId];
        const oreMask = ((_f = oreSpec == null ? void 0 : oreSpec.faces) == null ? void 0 : _f.length) === 2 ? oppMask : sameMask;
        const oi = resolveSolidFace(oreSpec, oreMask);
        if (oi) this.webgl.addTile(oi[0], oi[1], 1, 1, xy[0], xy[1], 1, 1, tint);
        const oe = resolveEdgeVariant(oreSpec == null ? void 0 : oreSpec.edge, this._edgeVariantIndex(xy, oreSpec == null ? void 0 : oreSpec.edge));
        if (oe) this.webgl.addTile(oe[0], oe[1], 1, 1, xy[0], xy[1], 1, 1, tint);
      }
    }
    for (const [key, item] of this.sim.floorItems.entries()) {
      const pos = this.sim.world.posFromIndex(key);
      if (!isExplored(pos)) continue;
      if (!isVisible(pos)) continue;
      const icon = floorItemIcon[item.kind];
      if (!icon) continue;
      const lit = tileLight(pos);
      this.webgl.addTile(icon[0], icon[1], 1, 1, pos[0], pos[1], 1, 1, [lit, lit, lit, 1]);
    }
    for (const e of this.sim.entities.values()) {
      if (!isExplored(e.pos)) continue;
      if (e.kind !== "dwarf" && !isVisible(e.pos)) continue;
      const ti = e.kind === "enemy" ? entIcon[e.type] : entIcon[e.kind];
      if (!ti) continue;
      const lit = isVisible(e.pos) ? tileLight(e.pos) : memoryTint;
      this.webgl.addTile(ti[0], ti[1], 1, 1, e.pos[0], e.pos[1], 1, 1, [lit, lit, lit, 1]);
    }
    const target = this._getCommandTarget();
    if (target && this.sim.world.inBounds(target) && isExplored(target)) {
      this.webgl.addTile(targetIcon[0], targetIcon[1], 1, 1, target[0], target[1], 1, 1, [1, 1, 1, 1]);
    }
    const orderTarget = this._getSelectedOrderTarget();
    if (orderTarget && this.sim.world.inBounds(orderTarget) && isExplored(orderTarget)) {
      this.webgl.addTile(orderTargetIcon[0], orderTargetIcon[1], 1, 1, orderTarget[0], orderTarget[1], 1, 1, [1, 1, 1, 1]);
    }
  }
  _buildInfoText() {
    const chief = this.sim.chief;
    const dwarves = [...this.sim.entities.values()].filter((e) => e.kind === "dwarf");
    const enemies = [...this.sim.entities.values()].filter((e) => e.kind === "enemy");
    const lines = [];
    lines.push("Dwarves");
    lines.push(this._formatChiefLine(chief));
    if (dwarves.length === 0) lines.push("(none)");
    for (const d of dwarves) lines.push(this._formatDwarfLine(d));
    lines.push("");
    lines.push("Enemies");
    if (enemies.length === 0) lines.push("(none)");
    for (const e of enemies) lines.push(this._formatEnemyLine(e));
    lines.push("");
    lines.push("Resources");
    lines.push(...this._formatResourceTallies(this.sim.resources));
    lines.push("");
    lines.push("Items (unassigned)");
    lines.push(...this._formatItemTallies(resources.getItemTallies(this.sim)));
    lines.push("");
    lines.push("Day Outputs");
    lines.push(...this._formatResourceTallies(this.sim.dayOutputs));
    lines.push("");
    lines.push("Final Outputs");
    lines.push(...this._formatResourceTallies(this.sim.finalOutputs));
    return lines.join("\n");
  }
  /**
   * Build N/E/S/W neighbor mask of tiles with the same walkability class as `xy`.
   * Bit layout: N=1, E=2, S=4, W=8.
   * @param {XY} xy
   * @returns {number}
   */
  _neighborMaskForTile(xy) {
    const w = this.sim.world;
    let mask = 0;
    const centerWalkable = w.isWalkable(xy);
    const n = (
      /** @type {XY} */
      [xy[0], xy[1] - 1]
    );
    const e = (
      /** @type {XY} */
      [xy[0] + 1, xy[1]]
    );
    const s = (
      /** @type {XY} */
      [xy[0], xy[1] + 1]
    );
    const wv = (
      /** @type {XY} */
      [xy[0] - 1, xy[1]]
    );
    if (w.inBounds(n) && w.isWalkable(n) === centerWalkable) mask |= EDGE_SIDE_N;
    if (w.inBounds(e) && w.isWalkable(e) === centerWalkable) mask |= EDGE_SIDE_E;
    if (w.inBounds(s) && w.isWalkable(s) === centerWalkable) mask |= EDGE_SIDE_S;
    if (w.inBounds(wv) && w.isWalkable(wv) === centerWalkable) mask |= EDGE_SIDE_W;
    return mask;
  }
  /**
   * Build N/E/S/W neighbor mask of tiles with opposite walkability class to `xy`.
   * Bit layout: N=1, E=2, S=4, W=8.
   * @param {XY} xy
   * @returns {number}
   */
  _oppositeClassMask(xy) {
    const w = this.sim.world;
    let mask = 0;
    const centerWalkable = w.isWalkable(xy);
    const n = (
      /** @type {XY} */
      [xy[0], xy[1] - 1]
    );
    const e = (
      /** @type {XY} */
      [xy[0] + 1, xy[1]]
    );
    const s = (
      /** @type {XY} */
      [xy[0], xy[1] + 1]
    );
    const wv = (
      /** @type {XY} */
      [xy[0] - 1, xy[1]]
    );
    if (w.inBounds(n) && w.isWalkable(n) !== centerWalkable) mask |= EDGE_SIDE_N;
    if (w.inBounds(e) && w.isWalkable(e) !== centerWalkable) mask |= EDGE_SIDE_E;
    if (w.inBounds(s) && w.isWalkable(s) !== centerWalkable) mask |= EDGE_SIDE_S;
    if (w.inBounds(wv) && w.isWalkable(wv) !== centerWalkable) mask |= EDGE_SIDE_W;
    return mask;
  }
  /**
   * Build dynamic edge variant index from opposite-walkability adjacencies around `xy`.
   * Index bits follow enabled side order from `enabledEdgeDirs(edge)` (N,E,S,W filtered by `edge.sides`).
   * @param {XY} xy
   * @param {EdgeSpec|undefined} edge
   * @returns {number}
   */
  _edgeVariantIndex(xy, edge) {
    if (!edge) return 0;
    const w = this.sim.world;
    let index = 0;
    const centerWalkable = w.isWalkable(xy);
    const n = (
      /** @type {XY} */
      [xy[0], xy[1] - 1]
    );
    const e = (
      /** @type {XY} */
      [xy[0] + 1, xy[1]]
    );
    const s = (
      /** @type {XY} */
      [xy[0], xy[1] + 1]
    );
    const wv = (
      /** @type {XY} */
      [xy[0] - 1, xy[1]]
    );
    const dirs = enabledEdgeDirs(edge);
    for (let i = 0; i < dirs.length; i += 1) {
      const d = dirs[i];
      const adj = d === "n" ? n : d === "e" ? e : d === "s" ? s : wv;
      if (w.inBounds(adj) && w.isWalkable(adj) !== centerWalkable) index |= 1 << i;
    }
    return index;
  }
  /**
   * @param {number} tile
   * @returns {XY|null}
   */
  _hopperIcon(tile) {
    const isWood = tile === T.WOOD_HOPPER;
    const isCoal = tile === T.COAL_HOPPER;
    if (!isWood && !isCoal) return null;
    const key = isWood ? "wood" : "coal";
    const amount = this.sim.resources[key] ?? 0;
    const clamped = Math.max(0, Math.min(HOPPER_CAPACITY, amount));
    const level = clamped <= 0 ? 0 : Math.min(HOPPER_LEVELS, Math.ceil(clamped / HOPPER_STEP));
    const x = 22 - level;
    const y = isWood ? 6 : 7;
    return (
      /** @type {XY} */
      [x, y]
    );
  }
  /**
   * 
   * @param {import('./dwarves.js').ChiefState} chief 
   * @returns 
   */
  _formatChiefLine(chief) {
    const carry = chief.carry && chief.carry.amount > 0 ? ` ${shortResourceName(chief.carry.kind)}x${chief.carry.amount}` : "";
    return `Chief#${chief.id} hp:${chief.hp}${carry}`;
  }
  /**
   * 
   * @param {import('./dwarves.js').DwarfState} dwarf 
   * @returns 
   */
  _formatDwarfLine(dwarf) {
    var _a, _b, _c, _d;
    const order = ((_a = dwarf.order) == null ? void 0 : _a.kind) ?? "idle";
    const build = ((_b = dwarf.order) == null ? void 0 : _b.kind) === "build" ? ((_c = dwarf.order) == null ? void 0 : _c.build) ?? "wall" : null;
    const target = ((_d = dwarf.order) == null ? void 0 : _d.target) ? ` @${dwarf.order.target[0]},${dwarf.order.target[1]}` : "";
    const orderLabel = build ? `${order}(${build})` : order;
    const carry = dwarf.carry && dwarf.carry.amount > 0 ? ` ${shortResourceName(dwarf.carry.kind)}x${dwarf.carry.amount}` : "";
    const gear = this._formatEquipmentCompact(dwarf);
    return `Dwarf#${dwarf.id} hp:${dwarf.hp} ${orderLabel}${target}${carry}${gear}`;
  }
  /**
   * 
   * @param {import('./enemies.js').EnemyState} enemy 
   * @returns 
   */
  _formatEnemyLine(enemy) {
    var _a;
    const goal = ((_a = enemy.goal) == null ? void 0 : _a.kind) ? ` goal:${enemy.goal.kind}` : "";
    return `Enemy#${enemy.id} ${enemy.type ?? "enemy"} hp:${enemy.hp} state:${enemy.state}${goal}`;
  }
  /**
   * 
   * @param {Record<string, number>} map 
   * @returns 
   */
  _formatResourceTallies(map) {
    const rows = resources.getResourceTallies(this.sim, map);
    if (rows.length === 0) return ["(none)"];
    return rows.map((r) => `${r.label}: raw ${r.raw} | proc ${r.processed}`);
  }
  /**
   * @param {{ label: string, count: number }[]} rows
   * @returns {string[]}
   */
  _formatItemTallies(rows) {
    if (!rows || rows.length === 0) return ["(none)"];
    return rows.map((r) => `${r.label}: ${r.count}`);
  }
  /**
   * @param {import('./dwarves.js').DwarfState} dwarf
   * @returns {string}
   */
  _formatEquipmentCompact(dwarf) {
    const eq = dwarf.equipment ?? null;
    if (!eq) return "";
    const parts = [];
    if (eq.weapon) parts.push(itemShortName(eq.weapon));
    if (eq.offhand) parts.push(itemShortName(eq.offhand));
    if (eq.head) parts.push(itemShortName(eq.head));
    if (eq.armor) parts.push(itemShortName(eq.armor));
    if (eq.tool) parts.push(itemShortName(eq.tool));
    if (parts.length === 0) return "";
    return ` gear:${parts.join("/")}`;
  }
  _buildOrderWhoFooter() {
    var _a, _b;
    const dwarf = this._getSelectedDwarf();
    if (!dwarf) return "Order: no dwarf selected";
    const target = ((_a = dwarf.order) == null ? void 0 : _a.target) ? ` @${dwarf.order.target[0]},${dwarf.order.target[1]}` : "";
    const carry = dwarf.carry && dwarf.carry.amount > 0 ? ` | carry ${shortResourceName(dwarf.carry.kind)}x${dwarf.carry.amount}` : "";
    const gear = this._formatEquipmentCompact(dwarf);
    return `Order: Dwarf#${dwarf.id} ${((_b = dwarf.order) == null ? void 0 : _b.kind) ?? "idle"}${target}${carry}${gear}`;
  }
  /**
   * @param {string} line
   */
  _pushLogLine(line) {
    const trimmed = (line ?? "").toString().trim();
    if (!trimmed) return;
    if (trimmed.startsWith("Moved ")) {
      const lastIdx = this.logLines.length - 1;
      if (lastIdx >= 0) {
        const last = this.logLines[lastIdx];
        const match = /^(.*) x(\d+)$/.exec(last);
        const base = match ? match[1] : last;
        const count = match ? Number(match[2]) : 1;
        if (base === trimmed) {
          const nextCount = count + 1;
          this.logLines[lastIdx] = `${trimmed} x${nextCount}`;
          return;
        }
      }
    }
    this.logLines.push(trimmed);
  }
  /**
   * @param {XY} pos
   * @returns {string}
   */
  _describeAt(pos) {
    var _a;
    if (!this.sim.world.inBounds(pos)) return "Out of bounds";
    if (this.sim.world.explored.get(pos) !== 1) return "Unexplored";
    const entity = this._getEntityAtPos(pos);
    if (entity) {
      if (entity.kind === "chief") {
        return `Chief (hp ${entity.hp})`;
      }
      if (entity.kind === "dwarf") {
        const order = ((_a = entity.order) == null ? void 0 : _a.kind) ?? "idle";
        return `Dwarf#${entity.id} (${order}) hp ${entity.hp}`;
      }
      return `Enemy ${entity.type} (hp ${entity.hp})`;
    }
    const item = resources.getFloorItemAt(this.sim, pos);
    if (item) {
      return `Dropped ${shortResourceName(item.kind)} x${item.amount}`;
    }
    const tile = this.sim.world.tiles.get(pos);
    if (tile === T.ROCK) {
      const oreId = this.sim.world.ore.get(pos);
      const oreName = this._oreName(oreId);
      return oreName ? `Rock with ${oreName} vein (mine for ${oreName})` : "Solid rock (mine to open)";
    }
    if (tile === T.FLOOR) return "Floor (walkable)";
    if (tile === T.WALL) return "Wall (blocks movement)";
    if (tile === T.DOOR) return "Door (blocks movement, can be broken)";
    if (tile === T.TORCH) return "Torch (light source)";
    if (tile === T.SMELTER) return "Smelter (refines iron/copper/gold)";
    if (tile === T.FORGE) return "Forge (future gear crafting)";
    if (tile === T.TRAP_BENCH) return "Trap bench (build traps)";
    if (tile === T.JEWELER) return "Jeweler (cuts gems)";
    if (tile === T.MASON) return "Mason (cuts granite)";
    if (tile === T.WOOD_HOPPER) return "Wood hopper (drop wood here)";
    if (tile === T.COAL_HOPPER) return "Coal hopper (drop coal here)";
    return "Unknown";
  }
  /**
   * @param {number} oreId
   * @returns {string|null}
   */
  _oreName(oreId) {
    if (oreId === ORE.GRANITE) return "granite";
    if (oreId === ORE.IRON) return "iron";
    if (oreId === ORE.COPPER) return "copper";
    if (oreId === ORE.GOLD) return "gold";
    if (oreId === ORE.COAL) return "coal";
    if (oreId === ORE.RUBY) return "ruby";
    if (oreId === ORE.EMERALD) return "emerald";
    if (oreId === ORE.DIAMOND) return "diamond";
    return null;
  }
  _buildHotkeyPrompt() {
    if (this.endOfDay.active) {
      if (this.commandMode === "look") return "Look: move cursor (WASD/arrows) | Esc/L exit";
      if (this.endOfDay.phase === "recruit") return "End Day Recruit: Up/Down select | Enter recruit (free) | T skip | F finish";
      return "End Day Trade: Up/Down select (buy+sell list, wraps) | Enter act | F finish | L look";
    }
    if (this.commandMode === "order_who") return "Order: pick dwarf (W/S or Up/Down, Enter)";
    if (this.commandMode === "order_what") return "Order: 1=guard 2=mine 3=build 4=operate";
    if (this.commandMode === "order_where") return "Order: move target (WASD/arrows), Enter to confirm";
    if (this.commandMode === "build_what") return "Build: 1=wall 2=torch 3=smelter 4=door 5=forge 6=trap 7=jeweler 8=mason";
    if (this.commandMode === "build_where") return "Build: pick target (WASD/arrows), Enter to confirm";
    if (this.commandMode === "look") return "Look: move cursor (WASD/arrows) | Esc/L exit";
    return "W/A/S/D or Arrows move (bump mine/attack) | O Order | B Build | L Look | X Drop | Space rest";
  }
  /**
   * @returns {XY|null}
   */
  _getCommandTarget() {
    if (this.commandMode === "none" || this.commandMode === "build_what") return null;
    return this.cursorPos ? [this.cursorPos[0], this.cursorPos[1]] : null;
  }
  /**
   * @returns {XY|null}
   */
  _getSelectedOrderTarget() {
    var _a;
    if (this.commandMode !== "order_who") return null;
    const dwarf = this._getSelectedDwarf();
    if (!dwarf || !((_a = dwarf.order) == null ? void 0 : _a.target)) return null;
    return [dwarf.order.target[0], dwarf.order.target[1]];
  }
  /**
   * @param {XY} pos
   */
  _setCursor(pos) {
    this.cursorPos = [pos[0], pos[1]];
  }
  _setCursorFromFacing() {
    const dv = FacingVec[this.lastFacing] ?? [0, 0];
    this._setCursor([this.sim.chief.pos[0] + dv[0], this.sim.chief.pos[1] + dv[1]]);
  }
  /**
   * @param {XY} dir
   * @returns {boolean}
   */
  _moveCursorAnywhere(dir) {
    if (!this.cursorPos) return false;
    const next = (
      /** @type {XY} */
      [this.cursorPos[0] + dir[0], this.cursorPos[1] + dir[1]]
    );
    if (!this.sim.world.inBounds(next)) return false;
    if (!this.debugIgnoreExplored && this.sim.world.explored.get(next) !== 1) return false;
    this._setCursor(next);
    return true;
  }
  /**
   * @param {XY} dir
   * @returns {boolean}
   */
  _setCursorAdjacentToChief(dir) {
    const target = (
      /** @type {XY} */
      [this.sim.chief.pos[0] + dir[0], this.sim.chief.pos[1] + dir[1]]
    );
    if (!this.sim.world.inBounds(target)) return false;
    this._setCursor(target);
    return true;
  }
  /**
   * @param {import('eskv/lib/eskv.js').input.InputHandler} ip
   * @returns {XY|null}
   */
  _directionFromArrows(ip) {
    if (ip.isKeyDown("ArrowUp") || ip.isKeyDown("w")) return [0, -1];
    if (ip.isKeyDown("ArrowDown") || ip.isKeyDown("s")) return [0, 1];
    if (ip.isKeyDown("ArrowLeft") || ip.isKeyDown("a")) return [-1, 0];
    if (ip.isKeyDown("ArrowRight") || ip.isKeyDown("d")) return [1, 0];
    return null;
  }
  /**
   * @param {XY} dir
   */
  _updateFacingFromDir(dir) {
    if (dir[0] === 0 && dir[1] === -1) this.lastFacing = Facing.north;
    else if (dir[0] === 0 && dir[1] === 1) this.lastFacing = Facing.south;
    else if (dir[0] === -1 && dir[1] === 0) this.lastFacing = Facing.west;
    else if (dir[0] === 1 && dir[1] === 0) this.lastFacing = Facing.east;
  }
  /**
   * @param {XY} pos
   * @returns {import('./sim/game.js').EntityState|null}
   */
  _getEntityAtPos(pos) {
    for (const e of this.sim.entities.values()) {
      if (e.pos[0] === pos[0] && e.pos[1] === pos[1]) return e;
    }
    return null;
  }
  /**
   * @param {import('eskv/lib/eskv.js').input.InputHandler} ip
   * @returns {{ handled: boolean, act?: GameAction|null, orderResult?: SimResult|null, advanceTurn?: boolean }}
   */
  _handleCommandInput(ip) {
    if (this.commandMode === "none") return { handled: false };
    if (ip.isKeyDown("Escape")) {
      this.commandMode = "none";
      this.pendingOrderDwarfId = null;
      this.pendingOrderKind = null;
      this.pendingBuildForOrder = false;
      this.cursorPos = null;
      return { handled: true };
    }
    let act = null;
    let orderResult = null;
    let advanceTurn = false;
    if (this.commandMode === "order_who") {
      if (ip.isKeyDown("w") || ip.isKeyDown("ArrowUp")) {
        this.selectedDwarfId = this._prevDwarfId();
        this.pendingOrderDwarfId = this.selectedDwarfId;
        const dwarf = this._getSelectedDwarf();
        if (dwarf) this._setCursor(dwarf.pos);
      } else if (ip.isKeyDown("s") || ip.isKeyDown("ArrowDown")) {
        this.selectedDwarfId = this._nextDwarfId();
        this.pendingOrderDwarfId = this.selectedDwarfId;
        const dwarf = this._getSelectedDwarf();
        if (dwarf) this._setCursor(dwarf.pos);
      } else if (ip.isKeyDown("Enter") || ip.isKeyDown("o")) {
        this.pendingOrderDwarfId = this.selectedDwarfId;
        if (this.pendingOrderDwarfId === null) {
          this.commandMode = "none";
        } else {
          const dwarf = this._getSelectedDwarf();
          if (dwarf) this._setCursor(dwarf.pos);
          this.commandMode = "order_what";
        }
      }
      return { handled: true, act, orderResult, advanceTurn };
    }
    if (this.commandMode === "order_what") {
      if (ip.isKeyDown("1")) this.pendingOrderKind = "guard";
      else if (ip.isKeyDown("2")) this.pendingOrderKind = "mine";
      else if (ip.isKeyDown("3")) this.pendingOrderKind = "build";
      else if (ip.isKeyDown("4")) this.pendingOrderKind = "operate";
      if (this.pendingOrderKind) {
        const dwarf = this._getSelectedDwarf();
        if (dwarf) this._setCursor(dwarf.pos);
        if (this.pendingOrderKind === "build") {
          this.pendingBuildForOrder = true;
          this.commandMode = "build_what";
        } else {
          this.commandMode = "order_where";
        }
      }
      return { handled: true, act, orderResult, advanceTurn };
    }
    if (this.commandMode === "order_where") {
      const dwarf = this.pendingOrderDwarfId !== null ? this.sim.entities.get(this.pendingOrderDwarfId) : null;
      if (!dwarf || dwarf.kind !== "dwarf" || !this.pendingOrderKind) {
        this.commandMode = "none";
        return { handled: true, act, orderResult, advanceTurn };
      }
      if (!this.cursorPos) this._setCursor(dwarf.pos);
      const dir = this._directionFromArrows(ip);
      if (dir) this._moveCursorAnywhere(dir);
      if (!ip.isKeyDown("Enter") && !ip.isKeyDown("o")) {
        return { handled: true, act, orderResult, advanceTurn };
      }
      const target = this.cursorPos ?? dwarf.pos;
      if (this.pendingOrderKind === "mine") {
        actions.setDwarfOrder(this.sim, dwarf.id, { kind: "mine", target });
        orderResult = { changedTiles: [], changedEntities: [], log: [`Order dwarf#${dwarf.id} mine ${target[0]},${target[1]}`] };
        advanceTurn = true;
        this.commandMode = "none";
        this.pendingOrderKind = null;
        this.pendingOrderDwarfId = null;
        this.pendingBuildForOrder = false;
        this.cursorPos = null;
      } else if (this.pendingOrderKind === "build") {
        actions.setDwarfOrder(this.sim, dwarf.id, { kind: "build", target, build: this.sim.buildSelection });
        orderResult = { changedTiles: [], changedEntities: [], log: [`Order dwarf#${dwarf.id} build ${this.sim.buildSelection} ${target[0]},${target[1]}`] };
        advanceTurn = true;
        this.commandMode = "none";
        this.pendingOrderKind = null;
        this.pendingOrderDwarfId = null;
        this.pendingBuildForOrder = false;
        this.cursorPos = null;
      } else if (this.pendingOrderKind === "operate") {
        const tile = this.sim.world.tiles.get(target);
        if (tile === T.SMELTER || tile === T.FORGE || tile === T.TRAP_BENCH || tile === T.JEWELER || tile === T.MASON) {
          actions.setDwarfOrder(this.sim, dwarf.id, { kind: "operate", target });
          orderResult = { changedTiles: [], changedEntities: [], log: [`Order dwarf#${dwarf.id} operate ${target[0]},${target[1]}`] };
          advanceTurn = true;
          this.commandMode = "none";
          this.pendingOrderKind = null;
          this.pendingOrderDwarfId = null;
          this.pendingBuildForOrder = false;
          this.cursorPos = null;
        } else {
          orderResult = { changedTiles: [], changedEntities: [], log: ["Order target is not a workshop"] };
        }
      } else if (this.pendingOrderKind === "guard") {
        const guardTarget = this.sim.world.isWalkable(target) ? target : (
          /**@type {XY}*/
          [dwarf.pos[0], dwarf.pos[1]]
        );
        actions.setDwarfOrder(this.sim, dwarf.id, { kind: "guard", target: guardTarget });
        orderResult = { changedTiles: [], changedEntities: [], log: [`Order dwarf#${dwarf.id} guard ${guardTarget[0]},${guardTarget[1]}`] };
        advanceTurn = true;
        this.commandMode = "none";
        this.pendingOrderKind = null;
        this.pendingOrderDwarfId = null;
        this.pendingBuildForOrder = false;
        this.cursorPos = null;
      }
      return { handled: true, act, orderResult, advanceTurn };
    }
    if (this.commandMode === "look") {
      if (ip.isKeyDown("Escape") || ip.isKeyDown("l")) {
        this.commandMode = "none";
        this.cursorPos = null;
        return { handled: true };
      }
      if (!this.cursorPos) this._setCursor(this.sim.chief.pos);
      const dir = this._directionFromArrows(ip);
      if (dir) this._moveCursorAnywhere(dir);
      return { handled: true, act, orderResult, advanceTurn };
    }
    if (this.commandMode === "build_what") {
      if (ip.isKeyDown("1")) this.sim.buildSelection = "wall";
      else if (ip.isKeyDown("2")) this.sim.buildSelection = "torch";
      else if (ip.isKeyDown("3")) this.sim.buildSelection = "smelter";
      else if (ip.isKeyDown("4")) this.sim.buildSelection = "door";
      else if (ip.isKeyDown("5")) this.sim.buildSelection = "forge";
      else if (ip.isKeyDown("6")) this.sim.buildSelection = "trap_bench";
      else if (ip.isKeyDown("7")) this.sim.buildSelection = "jeweler";
      else if (ip.isKeyDown("8")) this.sim.buildSelection = "mason";
      else return { handled: true, act, orderResult, advanceTurn };
      if (this.pendingBuildForOrder) {
        this.pendingBuildForOrder = false;
        const dwarf = this._getSelectedDwarf();
        if (dwarf) this._setCursor(dwarf.pos);
        this.commandMode = "order_where";
      } else {
        this.lastContextAction = "build";
        this.commandMode = "build_where";
        this._setCursorFromFacing();
      }
      return { handled: true, act, orderResult, advanceTurn };
    }
    if (this.commandMode === "build_where") {
      if (!this.cursorPos) this._setCursorFromFacing();
      const dir = this._directionFromArrows(ip);
      if (dir) this._setCursorAdjacentToChief(dir);
      if (!ip.isKeyDown("Enter")) {
        return { handled: true, act, orderResult, advanceTurn };
      }
      const target = this.cursorPos ?? this.sim.chief.pos;
      if (!this.sim.world.inBounds(target)) {
        orderResult = { changedTiles: [], changedEntities: [], log: ["Build target out of bounds"] };
        return { handled: true, act, orderResult, advanceTurn };
      }
      act = { type: "build", id: this.sim.chiefId, target, build: this.sim.buildSelection };
      this.lastContextAction = "build";
      advanceTurn = true;
      this.commandMode = "none";
      this.cursorPos = null;
      return { handled: true, act, orderResult, advanceTurn };
    }
    return { handled: true, act, orderResult, advanceTurn };
  }
  _getEndDayListLength() {
    var _a;
    if (this.endOfDay.phase === "recruit") return ((_a = this.endOfDay.recruitOptions) == null ? void 0 : _a.length) ?? 0;
    if (this.endOfDay.phase !== "trade") return 0;
    return this.endOfDay.offers.length + getSellOptions(this.sim, this.endOfDay).length;
  }
  _clampEndDaySelection() {
    const len = this._getEndDayListLength();
    if (len <= 0) {
      this.endDayIndex = 0;
      return;
    }
    this.endDayIndex = Math.max(0, Math.min(len - 1, this.endDayIndex));
  }
  /**
   * @param {number} delta
   */
  _wrapEndDaySelection(delta) {
    const len = this._getEndDayListLength();
    if (len <= 0) {
      this.endDayIndex = 0;
      return;
    }
    const next = (this.endDayIndex + delta) % len;
    this.endDayIndex = next < 0 ? next + len : next;
  }
  /**
   * @param {import('eskv/lib/eskv.js').input.InputHandler} ip
   * @param {{ event?: KeyboardEvent }|undefined} payload
   * @returns {SimResult|null}
   */
  _handleEndOfDayInput(ip, payload) {
    if (!this.endOfDay.active) return null;
    const ev = (payload == null ? void 0 : payload.event) ?? null;
    const key = ((ev == null ? void 0 : ev.key) ?? "").toLowerCase();
    const isRepeat = !!(ev == null ? void 0 : ev.repeat);
    const hasEventKey = key.length > 0;
    const isKey = (name) => key === name.toLowerCase();
    const down = (name) => hasEventKey ? isKey(name) : ip.isKeyDown(name);
    const allowedByRepeat = hasEventKey ? !isRepeat : true;
    const isArrowUp = down("ArrowUp") || down("w");
    const isArrowDown = down("ArrowDown") || down("s");
    const isEnter = down("Enter");
    if (this.commandMode === "look") {
      const command = this._handleCommandInput(ip);
      return command.orderResult ?? { changedTiles: [], changedEntities: [], log: [] };
    }
    let out = null;
    if (this.endOfDay.phase === "recruit") {
      if (isArrowUp) {
        this._wrapEndDaySelection(-1);
        return { changedTiles: [], changedEntities: [], log: [] };
      }
      if (isArrowDown) {
        this._wrapEndDaySelection(1);
        return { changedTiles: [], changedEntities: [], log: [] };
      }
      if (allowedByRepeat && isEnter) {
        this._clampEndDaySelection();
        out = recruit(this.sim, this.endOfDay, this.endDayIndex);
        this._clampEndDaySelection();
      } else if (allowedByRepeat && down("t")) {
        out = toTrade(this.sim, this.endOfDay);
        this.endDayIndex = 0;
      } else if (allowedByRepeat && down("l")) {
        this.commandMode = "look";
        this._setCursor(this.sim.chief.pos);
      } else if (allowedByRepeat && down("f")) {
        out = finishEndOfDay(this.sim, this.endOfDay);
        this.endDayIndex = 0;
      }
      return out;
    }
    if (isArrowUp) {
      this._wrapEndDaySelection(-1);
      return { changedTiles: [], changedEntities: [], log: [] };
    }
    if (isArrowDown) {
      this._wrapEndDaySelection(1);
      return { changedTiles: [], changedEntities: [], log: [] };
    }
    if (allowedByRepeat && down("l")) {
      this.commandMode = "look";
      this._setCursor(this.sim.chief.pos);
      return { changedTiles: [], changedEntities: [], log: [] };
    }
    if (allowedByRepeat && down("f")) {
      const res = finishEndOfDay(this.sim, this.endOfDay);
      this.endDayIndex = 0;
      return res;
    }
    if (allowedByRepeat && isEnter) {
      this._clampEndDaySelection();
      const buyCount = this.endOfDay.offers.length;
      if (this.endDayIndex < buyCount) {
        out = buy(this.sim, this.endOfDay, this.endDayIndex);
      } else {
        out = sell(this.sim, this.endOfDay, this.endDayIndex - buyCount);
      }
      this._clampEndDaySelection();
      return out;
    }
    return { changedTiles: [], changedEntities: [], log: [] };
  }
  /**
   * Convert a key event into a turn action, apply to sim, then sync UI.
   * ESKV dispatches handlers as on_event(eventName, emitter, data).
   * @param {string} _eventName
   * @param {unknown} _emitter
   * @param {{ states?: Record<string, boolean>, oldState?: boolean, event?: KeyboardEvent }|undefined} data
   */
  on_key_down(_eventName, _emitter, data) {
    const ip = this.inputHandler;
    if (!ip) return;
    if (ip.isKeyDown("Alt") && ip.isKeyDown("v")) {
      this.debugIgnoreVisibility = !this.debugIgnoreVisibility;
      this.syncFromSim(null);
      DwarfGameApp.get().requestFrameUpdate();
      return;
    }
    if (ip.isKeyDown("Alt") && ip.isKeyDown("c")) {
      this.debugIgnoreExplored = !this.debugIgnoreExplored;
      this.syncFromSim(null);
      DwarfGameApp.get().requestFrameUpdate();
      return;
    }
    if (this.endOfDay.active) {
      const eodResult = this._handleEndOfDayInput(ip, data);
      this.syncFromSim(eodResult);
      DwarfGameApp.get().requestFrameUpdate();
      return;
    }
    if (this.sim.gameOver && this.commandMode !== "look") {
      if (this.commandMode !== "none") {
        this.commandMode = "none";
        this.cursorPos = null;
        this.syncFromSim(null);
        DwarfGameApp.get().requestFrameUpdate();
        return;
      }
      if (ip.isKeyDown("l")) {
        this.commandMode = "look";
        this._setCursor(this.sim.chief.pos);
        this.syncFromSim(null);
        DwarfGameApp.get().requestFrameUpdate();
      }
      return;
    }
    let act = null;
    let orderResult = null;
    let advanceTurn = false;
    const command = this._handleCommandInput(ip);
    if (command.handled) {
      act = command.act ?? null;
      orderResult = command.orderResult ?? null;
      advanceTurn = command.advanceTurn ?? false;
    } else {
      let commandStarted = false;
      if (ip.isKeyDown("o")) {
        this.commandMode = "order_who";
        this.pendingOrderDwarfId = this.selectedDwarfId;
        this.pendingOrderKind = null;
        this.pendingBuildForOrder = false;
        const dwarf = this._getSelectedDwarf();
        if (dwarf) this._setCursor(dwarf.pos);
        commandStarted = true;
      } else if (ip.isKeyDown("b")) {
        this.commandMode = "build_what";
        this.pendingBuildForOrder = false;
        this._setCursorFromFacing();
        commandStarted = true;
      } else if (ip.isKeyDown("l")) {
        this.commandMode = "look";
        this._setCursor(this.sim.chief.pos);
        commandStarted = true;
      }
      if (!commandStarted) {
        if (ip.isKeyDown("x")) {
          const carry = this.sim.chief.carry;
          if (!carry || carry.amount <= 0) {
            orderResult = { changedTiles: [], changedEntities: [], log: ["Nothing to drop"] };
          } else {
            const item = resources.getFloorItemAt(this.sim, this.sim.chief.pos);
            if (item && item.kind !== carry.kind) {
              orderResult = { changedTiles: [], changedEntities: [], log: ["Cannot drop here"] };
            } else {
              act = { type: "drop", id: this.sim.chiefId };
              advanceTurn = true;
            }
          }
        } else {
          const moveDir = this._directionFromArrows(ip);
          if (moveDir) {
            this._updateFacingFromDir(moveDir);
            const target = (
              /**@type {XY}*/
              [this.sim.chief.pos[0] + moveDir[0], this.sim.chief.pos[1] + moveDir[1]]
            );
            const occupant = this._getEntityAtPos(target);
            if (occupant && occupant.kind === "enemy") {
              act = { type: "attack", id: this.sim.chiefId, target };
              advanceTurn = true;
            } else if (this.sim.world.inBounds(target) && this.sim.world.tiles.get(target) === T.ROCK) {
              const check = actions.checkMine(this.sim, this.sim.chiefId, target);
              if (!check.ok) {
                if (check.reason) {
                  orderResult = { changedTiles: [], changedEntities: [], log: [check.reason] };
                }
                act = null;
                advanceTurn = false;
              } else {
                act = { type: "mine", id: this.sim.chiefId, target };
                this.lastContextAction = "mine";
                advanceTurn = true;
              }
            } else {
              act = { type: "move", id: this.sim.chiefId, dir: moveDir };
              advanceTurn = true;
            }
          }
        }
        if (!act && ip.isKeyDown(" ")) {
          advanceTurn = true;
        } else if (!act && ip.isKeyDown("Enter")) {
          const dv = FacingVec[this.lastFacing] ?? [0, 0];
          const target = (
            /**@type {XY}*/
            [this.sim.chief.pos[0] + dv[0], this.sim.chief.pos[1] + dv[1]]
          );
          act = { type: "build", id: this.sim.chiefId, target, build: this.sim.buildSelection };
          advanceTurn = true;
        }
        if (ip.isKeyDown("Tab") || ip.isKeyDown("c")) {
          this.selectedDwarfId = this._nextDwarfId();
        }
      }
    }
    const result = act ? actions.applyAction(this.sim, act) : null;
    const autoResult = advanceTurn ? actions.applyAutomation(this.sim, { advanceTick: !act }) : null;
    const merged = this._mergeResults(this._mergeResults(result, orderResult), autoResult);
    this.syncFromSim(merged);
    DwarfGameApp.get().requestFrameUpdate();
  }
  _firstDwarfId() {
    const dwarves = [...this.sim.entities.values()].filter((e) => e.kind === "dwarf");
    if (dwarves.length === 0) return null;
    dwarves.sort((a2, b) => a2.id - b.id);
    return dwarves[0].id;
  }
  _nextDwarfId() {
    const dwarves = [...this.sim.entities.values()].filter((e) => e.kind === "dwarf");
    if (dwarves.length === 0) return null;
    dwarves.sort((a2, b) => a2.id - b.id);
    const cur = this.selectedDwarfId;
    if (cur === null) return dwarves[0].id;
    const idx = dwarves.findIndex((d) => d.id === cur);
    const next = dwarves[(idx + 1) % dwarves.length];
    return next ? next.id : dwarves[0].id;
  }
  _prevDwarfId() {
    const dwarves = [...this.sim.entities.values()].filter((e) => e.kind === "dwarf");
    if (dwarves.length === 0) return null;
    dwarves.sort((a2, b) => a2.id - b.id);
    const cur = this.selectedDwarfId;
    if (cur === null) return dwarves[0].id;
    const idx = dwarves.findIndex((d) => d.id === cur);
    const prev = dwarves[(idx - 1 + dwarves.length) % dwarves.length];
    return prev ? prev.id : dwarves[0].id;
  }
  _getSelectedDwarf() {
    if (this.selectedDwarfId === null) return null;
    const e = this.sim.entities.get(this.selectedDwarfId);
    if (!e || e.kind !== "dwarf") return null;
    return e;
  }
  /**
   * @param {SimResult|null} a
   * @param {SimResult|null} b
   */
  _mergeResults(a2, b) {
    if (!a2) return b;
    if (!b) return a2;
    return {
      changedTiles: [...a2.changedTiles, ...b.changedTiles],
      changedEntities: [...a2.changedEntities, ...b.changedEntities],
      log: [...a2.log, ...b.log]
    };
  }
}
async function boot() {
  const baseTileset = await loadImage(urlTileset);
  const runtimeTileset = await buildEdgeVariantSheet(baseTileset, TILE_DIM_PX, EDGES);
  const app = new DwarfGameApp(runtimeTileset);
  app.start();
}
boot();
