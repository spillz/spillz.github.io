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
    return new Vec2([Math.floor(this[0]), Math.floor(this[1])]);
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
  constructor(app2) {
    /**@type {Widget|null} */
    __publicField(this, "grabbed", null);
    __publicField(this, "mouseTouchEmulation", true);
    __publicField(this, "mouseev", null);
    __publicField(this, "keyStates", {});
    this.app = app2;
    this.canvas = app2.canvas;
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
  deferredProperties(app2) {
    let properties = this._deferredProps;
    this._deferredProps = null;
    for (let p in properties) {
      if (!p.startsWith("on_") && !p.startsWith("_") && typeof properties[p] == "function") {
        let func = properties[p];
        let args, rval;
        [args, rval] = (func["text"] ?? func.toString()).split("=>");
        args = args.replace("(", "").replace(")", "").split(",").map((a2) => a2.trim());
        let objs = args.map((a2) => app2.findById(a2));
        let obmap = {};
        for (let a2 of args) {
          obmap[a2] = app2.findById(a2);
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
    let app2 = App.get();
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
          value = +rule.slice(0, -2) * app2.dimW;
          base = "absolute";
          break;
        }
        if (r2 == "ah") {
          value = +rule.slice(0, -2) * app2.dimH;
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
    let app2 = App.get();
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
          value = +rule.slice(0, -2) * app2.dimW;
          base = "absolute";
          break;
        }
        if (r2 == "ah") {
          value = +rule.slice(0, -2) * app2.dimH;
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
  _draw(app2, ctx, millis) {
    this.draw(app2, ctx);
    let transform = this.getTransform();
    if (transform) {
      ctx.save();
      ctx.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
      for (let c of this._children)
        c._draw(app2, ctx, millis);
      ctx.restore();
      return;
    }
    for (let c of this._children)
      c._draw(app2, ctx, millis);
  }
  /**
   * Unlike _draw, this method handles the actual drawing of this widget 
   * (the children's _draw and this widget's draw method are called in this widget's _draw method).
   * @param {App} app The application instance
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} ctx The drawing context (relevant transforms will have been applied)
   */
  draw(app2, ctx) {
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
      ctx.lineWidth = this.getMetric(this, "lineWidth", this.hints.lineWidth ?? `${1 / app2.tileSize}`);
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
  update(app2, millis) {
    if (this._deferredProps != null) {
      this.deferredProperties(app2);
    }
    if (this._animation != null) {
      this._animation.update(app2, millis);
      app2.requestFrameUpdate();
    }
    if (this._needsLayout) {
      this.layoutChildren();
      app2.requestFrameUpdate();
    }
    for (let c of this._children) c.update(app2, millis);
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
  _draw(app2, ctx, millis) {
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
    this._baseWidget._draw(app2, ctx, millis);
    for (let mw of this._modalWidgets) mw._draw(app2, ctx, millis);
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
    let app2 = App.get();
    let ctx = app2.ctx;
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
  draw(app2, ctx) {
    super.draw(app2, ctx);
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
  draw(app2, ctx) {
    let saved = this.bgColor;
    let saved2 = this.color;
    if (this._touching) this.bgColor = this.selectColor;
    if (this.disable) {
      this.bgColor = this.disableColor1;
      this.color = this.disableColor2;
    }
    super.draw(app2, ctx);
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
  draw(app2, ctx) {
    let saved = this.bgColor;
    let saved2 = this.color;
    if (this._touching) this.bgColor = this.selectColor;
    if (this.disable) {
      this.bgColor = this.disableColor1;
      this.color = this.disableColor2;
    }
    super.draw(app2, ctx);
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
  draw(app2, ctx) {
    let saved = this.bgColor;
    let saved2 = this.color;
    if (this.press) this.bgColor = this.pressColor;
    if (this._touching) this.bgColor = this.selectColor;
    if (this.disable) {
      this.bgColor = this.disableColor1;
      this.color = this.disableColor2;
    }
    super.draw(app2, ctx);
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
  draw(app2, ctx) {
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
    let ts = app2.tileSize;
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
  draw(app2, ctx) {
    let ts = app2.tileSize;
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
    const app2 = App.get();
    const canvasdiv = document.getElementById("eskvapp");
    if (!canvasdiv) return;
    const type = this.wrap ? "textarea" : "input";
    const inp = document.createElement(type);
    if (!(inp instanceof HTMLInputElement) && !(inp instanceof HTMLTextAreaElement)) return;
    const rt = this.DOMInputRect();
    const color = this.color ?? "white";
    const bgColor = this.bgColor ?? "black";
    const fsPx = Math.max(1, this._textData.size * app2.tileSize);
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
    let app2 = App.get();
    if ("w" in this.hints && this.hints["w"] == null) this[2] = this.image.width / app2.tileSize;
    if ("h" in this.hints && this.hints["h"] == null) this[3] = this.image.height / app2.tileSize;
    this._needsLayout = false;
    super.layoutChildren();
  }
  /**@type {Widget['draw']} */
  draw(app2, ctx) {
    super.draw(app2, ctx);
    if (!this.image.complete || this.image.naturalHeight == 0) return;
    let r = this.rect;
    if (!this.scaleToFit) {
      r.x += r.w / 2 - this.image.width / 2 / app2.tileSize;
      r.y += r.h / 2 - this.image.height / 2 / app2.tileSize;
      r.w = this.image.width / app2.tileSize;
      r.h = this.image.height / app2.tileSize;
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
  _draw(app2, ctx, millis) {
    this.draw(app2, ctx);
    let transform = this.getTransform();
    if (transform) {
      ctx.save();
      ctx.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
      let w2 = this.children[this.activePage] ?? void 0;
      if (w2 !== void 0) w2._draw(app2, ctx, millis);
      ctx.restore();
      return;
    }
    let w = this.children[this.activePage] ?? void 0;
    if (w !== void 0) w._draw(app2, ctx, millis);
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
  _draw(app2, ctx, millis) {
    this.draw(app2, ctx);
    let transform = this.getTransform();
    if (transform) {
      ctx.save();
      ctx.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
      let bb2 = this._children[0] ?? void 0;
      if (bb2 !== void 0) bb2._draw(app2, ctx, millis);
      let w2 = this.children[this.activePage] ?? void 0;
      if (w2 !== void 0) w2._draw(app2, ctx, millis);
      ctx.restore();
      return;
    }
    let bb = this._children[0] ?? void 0;
    if (bb !== void 0) bb._draw(app2, ctx, millis);
    let w = this.children[this.activePage] ?? void 0;
    if (w !== void 0) w._draw(app2, ctx, millis);
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
  update(app2, millis) {
    super.update(app2, millis);
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
    let app2 = App.get();
    if (!app2.inputHandler) return true;
    let sx = this._scrollX + this.w / this.zoom / 2;
    let sy = this._scrollY + this.h / this.zoom / 2;
    let wheel = touch.nativeObject;
    if (!this.collide(touch.rect) && (!this.unboundedW || !this.unboundedH)) return false;
    if (!(wheel instanceof WheelEvent)) return false;
    if (this.uiZoom && app2.inputHandler.isKeyDown("Control")) {
      let loc = touch.asChildTouch(this);
      loc.pos[0];
      loc.pos[1];
      let zoom = this.zoom * Math.exp(-wheel.deltaY / app2.h);
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
    } else if (this.uiMove && this.scrollW && app2.inputHandler.isKeyDown("Shift")) {
      this.scrollX += this.scrollableW == 0 && !this.unboundedW ? 0 : this.w / this.zoom * (wheel.deltaY / app2.w);
      if (this.scrollX != this._scrollX) this.scrollX = this._scrollX;
      return true;
    } else if (this.uiMove && this.scrollH) {
      this.scrollY += this.scrollableH == 0 && !this.unboundedH ? 0 : this.h / this.zoom * (wheel.deltaY / app2.h);
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
  _draw(app2, ctx, millis) {
    this.draw(app2, ctx);
    let r = this.rect;
    r[0] = Math.floor(r[0] * app2.tileSize * app2.pixelSize) / (app2.tileSize * app2.pixelSize);
    r[1] = Math.floor(r[1] * app2.tileSize * app2.pixelSize) / (app2.tileSize * app2.pixelSize);
    r[2] = Math.floor(r[2] * app2.tileSize * app2.pixelSize) / (app2.tileSize * app2.pixelSize);
    r[3] = Math.floor(r[3] * app2.tileSize * app2.pixelSize) / (app2.tileSize * app2.pixelSize);
    ctx.save();
    ctx.beginPath();
    ctx.rect(r[0], r[1], r[2], r[3]);
    ctx.clip();
    let newT = this.getTransform();
    if (newT) ctx.transform(newT.a, newT.b, newT.c, newT.d, newT.e, newT.f);
    this.children[0]._draw(app2, ctx, millis);
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
      let app2 = App.get();
      this.parent = app2;
      app2.addModal(this);
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
      let app2 = App.get();
      this.parent = null;
      app2.removeModal(this);
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
  draw(app2, ctx) {
    if (this.dim) {
      let r = App.get().baseWidget.rect;
      let ctx2 = App.get().ctx;
      if (!ctx2) return;
      ctx2.fillStyle = "rgba(0,0,0," + this.dimScale + ")";
      ctx2.rect(r[0], r[1], r[2], r[3]);
      ctx2.fill();
      super.draw(app2, ctx2);
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
  update(app2, millis) {
    super.update(app2, millis);
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
      app2.requestFrameUpdate();
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
  draw(app2, ctx) {
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
  draw(app2, ctx) {
    super.draw(app2, ctx);
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
  draw(app2, ctx) {
    for (let l of this._layerData) {
      if (!l.hidden) {
        this._data = l;
        super.draw(app2, ctx);
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
  constructor(props = {}) {
    super();
    this.drawBatch = [];
    const bgCanvas = document.createElement("canvas");
    this.webglRenderer = new WebGLTileRenderer(bgCanvas);
    this.txTileDim = props["tileDim"] ?? 1;
    this.txImage = new Image();
    this.txImage.src = props["src"] ?? "";
    this.txImage.onload = () => {
      this.webglRenderer.registerTexture("texture", this.txImage, this.txTileDim);
      App.get().requestFrameUpdate();
    };
    this.updateProperties(props);
  }
  on_drawBatch(e, o, v) {
    App.get().requestFrameUpdate();
  }
  set src(val) {
    this.txImage.src = val;
  }
  get src() {
    return this.txImage.src;
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
  draw(app2, ctx) {
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
function createChief(id, pos) {
  return { id, kind: "chief", pos: [pos[0], pos[1]], hp: 12, carry: null };
}
function createDwarf(id, pos) {
  return { id, kind: "dwarf", pos: [pos[0], pos[1]], hp: 10, order: { kind: "idle" }, carry: null };
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
  if (dwarf.carry && dwarf.carry.amount > 0 && !sim.isResourceUseful(dwarf.carry.kind)) {
    return { type: "drop", id: dwarf.id };
  }
  if (dwarf.carry && dwarf.carry.amount >= sim.getCarryCapacity()) {
    const haul = haulTowardDropoff(sim, dwarf);
    if (haul) return haul;
    return { type: "drop", id: dwarf.id };
  }
  if (order.kind === "idle") return null;
  if (order.kind === "guard") {
    if (!target) return null;
    if (samePos(dwarf.pos, target)) return null;
    const step = nextStepToward(sim, dwarf, [target]);
    return step ? { type: "move", id: dwarf.id, dir: [step[0] - dwarf.pos[0], step[1] - dwarf.pos[1]] } : null;
  }
  if (order.kind === "mine") {
    if (!target) return null;
    const requiredKind = ((_a = dwarf.carry) == null ? void 0 : _a.kind) ?? null;
    const floorTarget = sim.findNearestFloorItem(target, order.radius, requiredKind);
    if (floorTarget && !samePos(dwarf.pos, floorTarget)) {
      const step2 = nextStepToward(sim, dwarf, [floorTarget]);
      if (step2) return { type: "move", id: dwarf.id, dir: [step2[0] - dwarf.pos[0], step2[1] - dwarf.pos[1]] };
    }
    const mineTarget = sim.findBestMineTarget(target, order.radius, requiredKind);
    if (!mineTarget) {
      if (dwarf.carry && dwarf.carry.amount > 0) {
        const haul = haulTowardDropoff(sim, dwarf);
        if (haul) return haul;
      }
      return null;
    }
    if (isAdjacent$1(dwarf.pos, mineTarget)) {
      return { type: "mine", id: dwarf.id, target: mineTarget };
    }
    const goals = adjacentWalkable(sim, dwarf, mineTarget);
    const step = nextStepToward(sim, dwarf, goals);
    return step ? { type: "move", id: dwarf.id, dir: [step[0] - dwarf.pos[0], step[1] - dwarf.pos[1]] } : null;
  }
  if (order.kind === "build") {
    if (!target) return null;
    if (isAdjacent$1(dwarf.pos, target)) {
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
function samePos(a2, b) {
  return a2[0] === b[0] && a2[1] === b[1];
}
function isAdjacent$1(a2, b) {
  const dx = Math.abs(a2[0] - b[0]);
  const dy = Math.abs(a2[1] - b[1]);
  return dx + dy === 1;
}
function findAdjacentEnemy(sim, pos) {
  for (const e of sim.entities.values()) {
    if (e.kind !== "enemy") continue;
    if (isAdjacent$1(pos, e.pos)) return (
      /** @type {import('./enemies.js').EnemyState} */
      e
    );
  }
  return null;
}
function adjacentWalkable(sim, dwarf, target) {
  const goals = [];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const d of dirs) {
    const p = [target[0] + d[0], target[1] + d[1]];
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
  if (sim.canDepositAt(dwarf.pos, dwarf.carry.kind)) return null;
  const drop = sim.findNearestDropoffGoal(dwarf.carry.kind, dwarf.pos);
  if (!drop) return { type: "drop", id: dwarf.id };
  const step = nextStepToward(sim, dwarf, [drop]);
  return step ? { type: "move", id: dwarf.id, dir: [step[0] - dwarf.pos[0], step[1] - dwarf.pos[1]] } : null;
}
function buildCostGrid(sim, dwarf) {
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
    if (e.id === dwarf.id) continue;
    costs[e.pos[0] + e.pos[1] * W] = Infinity;
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
      const px = pos[0];
      const py = pos[1];
      const pIdx = px + py * W;
      const neighbors = [
        [px + 1, py],
        [px - 1, py],
        [px, py + 1],
        [px, py - 1]
      ];
      for (const npos of neighbors) {
        const nx = npos[0];
        const ny = npos[1];
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const nIdx = nx + ny * W;
        const cost = costGrid[nIdx];
        if (cost === Infinity) continue;
        if (distances[pIdx] + cost < distances[nIdx]) {
          if (nIdx === dIdx) done = true;
          distances[nIdx] = distances[pIdx] + cost;
          if (cost > 1 && !done) deferred.push([npos, cost]);
          else newCandidates.push(npos);
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
    const cx = current[0];
    const cy = current[1];
    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];
    for (const candidate of neighbors) {
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
  ogre: { id: "ogre", name: "Ogre Breaker", archetype: "bigbad", hp: 18, state: "siege", goal: { kind: "destroy" } }
};
function getEnemyType(type) {
  return ENEMY_TYPES[type] ?? ENEMY_TYPES.rat;
}
function nextEnemyAction(enemy, sim) {
  if (enemy.archetype !== "annoyance") return null;
  const adjacentVictim = findAdjacentVictim(sim, enemy);
  if (adjacentVictim) {
    return { type: "attack", id: enemy.id, target: adjacentVictim.pos };
  }
  const targetStep = bfsToAdjacentTarget(sim, enemy, isDoorTile) ?? bfsToAdjacentTarget(sim, enemy, isWorkshopOrTorchTile);
  if (!targetStep) return null;
  if (!targetStep.step) {
    return { type: "build", id: enemy.id, target: targetStep.target, build: "wall" };
  }
  return {
    type: "move",
    id: enemy.id,
    dir: [targetStep.step[0] - enemy.pos[0], targetStep.step[1] - enemy.pos[1]]
  };
}
function bfsToAdjacentTarget(sim, enemy, isTargetTile) {
  const W = sim.world.size[0];
  const H = sim.world.size[1];
  const total = W * H;
  const visited = new Array(total).fill(false);
  const prev = new Array(total).fill(-1);
  const queue = [];
  const start = enemy.pos;
  const startIdx = start[0] + start[1] * W;
  if (!isWalkableForEnemy(sim, enemy, start)) return null;
  queue.push(start);
  visited[startIdx] = true;
  for (let qi = 0; qi < queue.length; qi++) {
    const pos = queue[qi];
    const posIdx = pos[0] + pos[1] * W;
    const target = findTargetAtOrAdjacent(sim, pos, isTargetTile);
    if (target) {
      const step = reconstructFirstStep(prev, startIdx, posIdx, W);
      return { target, step };
    }
    for (const nb of neighbors4$1(pos)) {
      if (!sim.world.inBounds(nb)) continue;
      if (!isWalkableForEnemy(sim, enemy, nb)) continue;
      const nIdx = nb[0] + nb[1] * W;
      if (visited[nIdx]) continue;
      visited[nIdx] = true;
      prev[nIdx] = posIdx;
      queue.push(nb);
    }
  }
  return null;
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
function isWalkableForEnemy(sim, enemy, pos) {
  if (!sim.world.inBounds(pos)) return false;
  if (!sim.world.isWalkable(pos)) return false;
  for (const e of sim.entities.values()) {
    if (e.id !== enemy.id && e.pos[0] === pos[0] && e.pos[1] === pos[1]) return false;
  }
  return true;
}
function findTargetAtOrAdjacent(sim, pos, isTargetTile) {
  if (isTargetTile(sim.world.tiles.get(pos))) return [pos[0], pos[1]];
  for (const nb of neighbors4$1(pos)) {
    if (!sim.world.inBounds(nb)) continue;
    const t = sim.world.tiles.get(nb);
    if (isTargetTile(t)) return [nb[0], nb[1]];
  }
  return null;
}
function isDoorTile(tileId) {
  return tileId === T.DOOR;
}
function isWorkshopOrTorchTile(tileId) {
  return tileId === T.SMELTER || tileId === T.FORGE || tileId === T.TRAP_BENCH || tileId === T.JEWELER || tileId === T.TORCH;
}
function findAdjacentVictim(sim, enemy) {
  for (const e of sim.entities.values()) {
    if (e.kind === "enemy") continue;
    if (isAdjacent(enemy.pos, e.pos)) return e;
  }
  return null;
}
function isAdjacent(a2, b) {
  const dx = Math.abs(a2[0] - b[0]);
  const dy = Math.abs(a2[1] - b[1]);
  return dx + dy === 1;
}
function* neighbors4$1(xy) {
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
function generateMap(W, H, cfg) {
  const world = {
    size: [W, H],
    tiles: new Grid2D([W, H]).fill(T.ROCK),
    explored: new Grid2D([W, H]).fill(0),
    ore: new Grid2D([W, H]).fill(ORE.NONE)
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
  setTile(cx + 5, cy - 4, T.FORGE);
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
  console.log("BIOMES", biomes);
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
        console.log("theme weights", { ...weights });
        weights = applyRiskWeights(weights, [x, y], layout, risk);
        console.log("theme+risk weights", { ...weights });
        const ore = weightedPick(weights);
        console.log("ores", ore);
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
const CARRY_CAPACITY = 4;
const MIN_WORKSHOP_FLOOR_TILES = 8;
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
class World {
  constructor(size) {
    /** @type {XY} */
    __publicField(this, "size");
    /** @type {Grid2D} */
    __publicField(this, "tiles");
    /** @type {Grid2D} */
    __publicField(this, "explored");
    /** @type {Grid2D} */
    __publicField(this, "ore");
    this.size = size;
    this.tiles = new Grid2D(size).fill(T.ROCK);
    this.explored = new Grid2D(size).fill(0);
    this.ore = new Grid2D(size).fill(ORE.NONE);
  }
  inBounds(xy) {
    return xy[0] >= 0 && xy[1] >= 0 && xy[0] < this.size[0] && xy[1] < this.size[1];
  }
  isWalkable(xy) {
    if (!this.inBounds(xy)) return false;
    const t = this.tiles.get(xy);
    return t === T.FLOOR || t === T.TORCH || t === T.SMELTER || t === T.FORGE || t === T.TRAP_BENCH || t === T.JEWELER || t === T.DOOR || t === T.MASON || t === T.WOOD_HOPPER || t === T.COAL_HOPPER;
  }
}
const DEFAULT_CONFIG = (
  /** @type {GameSimConfig} */
  {
    dayLength: 600,
    workshopJobTicks: 10,
    workshopQueueCap: 3,
    enemySpawnEvery: 50,
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
    forge: [],
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
    /** @type {Map<string, WorkshopState>} */
    __publicField(this, "workshops", /* @__PURE__ */ new Map());
    /** @type {Map<string, FloorItem>} */
    __publicField(this, "floorItems", /* @__PURE__ */ new Map());
    var _a;
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      startingResources: { ...DEFAULT_CONFIG.startingResources, ...config.startingResources ?? {} }
    };
    this.world = new World(size);
    this.resources = { ...this.config.startingResources };
    this._genTestMap();
    this._spawnEntities();
    this._revealAround(((_a = this.entities.get(this.chiefId)) == null ? void 0 : _a.pos) ?? [0, 0], 4);
  }
  /** @returns {import('./dwarves.js').ChiefState} */
  get chief() {
    const c = this.entities.get(this.chiefId);
    if (!c || c.kind !== "chief") throw new Error("Missing chief");
    return c;
  }
  /**
   * @param {XY} pos
   * @param {number} r
   */
  _revealAround(pos, r) {
    for (let xy of this.world.tiles.iterInRange(pos, r)) {
      this.world.explored.set(xy, 1);
    }
  }
  _spawnEntities() {
    const cx = Math.floor(this.world.size[0] / 2);
    const cy = Math.floor(this.world.size[1] / 2);
    const chief = createChief(1, [cx, cy]);
    const dwarf = createDwarf(2, [cx + 1, cy]);
    this.entities.set(chief.id, chief);
    this.entities.set(dwarf.id, dwarf);
  }
  _genTestMap() {
    const W = this.world.size[0];
    const H = this.world.size[1];
    const generated = generateMap(W, H, { level: 1 });
    this.world.tiles = generated.world.tiles;
    this.world.explored = generated.world.explored;
    this.world.ore = generated.world.ore;
    this.floorItems = /* @__PURE__ */ new Map();
    this.hold = generated.hold ?? null;
    this._registerWorkshop("mason", [generated.hold.cx - 5, generated.hold.cy - 4]);
    this._registerWorkshop("forge", [generated.hold.cx + 5, generated.hold.cy - 4]);
  }
  /**
   * @param {GameAction} action
   * @param {{advanceTick?: boolean}} opts
   */
  applyAction(action, opts = {}) {
    const out = { changedTiles: [], changedEntities: [], log: [] };
    if (opts.advanceTick !== false) this._advanceTick();
    if (action.type === "move") {
      const moved = this.tryMove(action.id, action.dir[0], action.dir[1]);
      if (moved) {
        const e = this.entities.get(action.id);
        out.changedEntities.push(action.id);
        if (action.id === this.chiefId) this._revealAround(this.chief.pos, 4);
        if (e) out.log.push(`Moved ${e.kind}#${e.id}`);
      }
    } else if (action.type === "mine") {
      const res = this.tryMine(action.id, action.target);
      if (res.ok) {
        const e = this.entities.get(action.id);
        out.changedTiles.push(action.target);
        if (e) out.log.push(`Mined by ${e.kind}#${e.id} at ${action.target[0]},${action.target[1]}`);
      } else if (res.reason) {
        out.log.push(res.reason);
      }
    } else if (action.type === "build") {
      const changed = this.tryBuild(action.target, action.build);
      if (changed) {
        const e = this.entities.get(action.id);
        out.changedTiles.push(action.target);
        if (e) out.log.push(`Built ${action.build} by ${e.kind}#${e.id} at ${action.target[0]},${action.target[1]}`);
        if (e && e.kind === "dwarf") {
          setDwarfOrder(e, { kind: "idle" });
          out.changedEntities.push(e.id);
        }
      }
    } else if (action.type === "attack") {
      const res = this.tryAttack(action.id, action.target);
      if (res.changedEntities.length > 0) {
        out.changedEntities.push(...res.changedEntities);
        out.log.push(...res.log);
      }
    } else if (action.type === "drop") {
      const res = this.tryDrop(action.id);
      if (res.ok) {
        const e = this.entities.get(action.id);
        if (e) out.log.push(`Dropped by ${e.kind}#${e.id}`);
        if (e) out.changedTiles.push([e.pos[0], e.pos[1]]);
      } else if (res.reason) {
        out.log.push(res.reason);
      }
    }
    return out;
  }
  /** @param {EntityId} id @param {number} dx @param {number} dy */
  tryMove(id, dx, dy) {
    var _a;
    const e = this.entities.get(id);
    if (!e) return false;
    const np = (
      /** @type {XY} */
      [e.pos[0] + dx, e.pos[1] + dy]
    );
    if (!this.world.isWalkable(np)) return false;
    for (const other of this.entities.values()) {
      if (other.id !== e.id && other.pos[0] === np[0] && other.pos[1] === np[1]) return false;
    }
    const preferredKind = ((_a = e.carry) == null ? void 0 : _a.kind) ?? null;
    e.pos = np;
    this._tryDepositEntity(e);
    this._tryPickupEntity(e, preferredKind);
    return true;
  }
  /** Mining converts ROCK -> FLOOR if adjacent to a walkable tile */
  /** @param {EntityId} minerId @param {XY} target */
  tryMine(minerId, target) {
    const check = this._checkMine(minerId, target);
    if (!check.ok) return check;
    const miner = this.entities.get(minerId);
    if (!miner || miner.kind === "enemy") return { ok: false, reason: null };
    if (check.autoDrop === "deposit") {
      this._tryDepositEntity(miner);
    } else if (check.autoDrop === "drop") {
      if (!this._dropCarryAt(miner, miner.pos)) {
        return { ok: false, reason: "Cannot drop here" };
      }
    }
    if (check.resourceKind) {
      this._addCarry(miner, check.resourceKind, 1);
    }
    this.world.tiles.set(target, T.FLOOR);
    return { ok: true, reason: null };
  }
  /**
   * @param {EntityId} minerId
   * @param {XY} target
   * @returns {{ ok: boolean, reason: string|null, resourceKind?: string|null, autoDrop?: 'deposit'|'drop'|null }}
   */
  _checkMine(minerId, target) {
    const w = this.world;
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
    const resourceKind = this._resourceKeyForOre(oreType);
    if (!resourceKind) return { ok: true, reason: null, resourceKind: null };
    const miner = this.entities.get(minerId);
    if (!miner || miner.kind === "enemy") return { ok: false, reason: null };
    if (!this.canCarryResource(miner, resourceKind)) {
      const carry = (
        /** @type {{ kind: string, amount: number }|null|undefined} */
        miner.carry
      );
      if (!carry || carry.amount <= 0) {
        return { ok: false, reason: "Cannot carry more", resourceKind };
      }
      if (carry.kind !== resourceKind) {
        if (miner.kind === "chief") {
          if (this._canDepositAt(miner.pos, carry.kind)) {
            return { ok: true, reason: null, resourceKind, autoDrop: "deposit" };
          }
          if (this._canDropAt(miner.pos, carry.kind)) {
            return { ok: true, reason: null, resourceKind, autoDrop: "drop" };
          }
        }
        return { ok: false, reason: `Hands full of ${carry.kind}`, resourceKind };
      }
      return { ok: false, reason: "Cannot carry more", resourceKind };
    }
    return { ok: true, reason: null, resourceKind };
  }
  /**
   * @param {EntityId} minerId
   * @param {XY} target
   * @returns {{ ok: boolean, reason: string|null }}
   */
  checkMine(minerId, target) {
    const res = this._checkMine(minerId, target);
    return { ok: res.ok, reason: res.reason };
  }
  /** Build places WALL/TORCH/WORKSHOP-TYPES/DOOR on FLOOR tiles. */
  /** @param {XY} target @param {BuildKind} build */
  tryBuild(target, build) {
    const w = this.world;
    if (!w.inBounds(target)) return false;
    const cur = w.tiles.get(target);
    if (cur === T.FLOOR) {
      if (build === "wall" || build === "door") {
        if (this._isWorkshopBufferTile(target)) return false;
      }
      if (this._isWorkshopBuild(build)) {
        if (!this._hasWorkshopSpace(target)) return false;
      }
      const cost = BUILD_COSTS[build];
      if (!cost || !this._hasResources(cost)) return false;
      this._spendResources(cost);
      if (build === "wall") w.tiles.set(target, T.WALL);
      else if (build === "torch") w.tiles.set(target, T.TORCH);
      else if (build === "smelter") w.tiles.set(target, T.SMELTER);
      else if (build === "forge") w.tiles.set(target, T.FORGE);
      else if (build === "trap_bench") w.tiles.set(target, T.TRAP_BENCH);
      else if (build === "jeweler") w.tiles.set(target, T.JEWELER);
      else if (build === "door") w.tiles.set(target, T.DOOR);
      else if (build === "mason") w.tiles.set(target, T.MASON);
      else return false;
      if (build === "smelter" || build === "forge" || build === "trap_bench" || build === "jeweler" || build === "mason") {
        const kind = (
          /** @type {WorkshopKind} */
          build
        );
        this._registerWorkshop(kind, target);
      }
      return true;
    }
    if (cur === T.WALL || cur === T.TORCH || cur === T.SMELTER || cur === T.FORGE || cur === T.TRAP_BENCH || cur === T.JEWELER || cur === T.DOOR || cur === T.MASON) {
      w.tiles.set(target, T.FLOOR);
      this._unregisterWorkshop(target);
      return true;
    }
    return false;
  }
  /**
   * @param {EntityId} dwarfId
   * @param {import('./dwarves.js').DwarfOrder} order
   * @returns {boolean}
   */
  setDwarfOrder(dwarfId, order) {
    var _a;
    const e = this.entities.get(dwarfId);
    if (!e || e.kind !== "dwarf") return false;
    const dwarf = (
      /** @type {import('./dwarves.js').DwarfState} */
      e
    );
    if (((_a = dwarf.order) == null ? void 0 : _a.kind) === "operate" && dwarf.order.target) {
      this._clearWorkshopOperator(dwarf.order.target, dwarf.id);
    }
    setDwarfOrder(
      /** @type {import('./dwarves.js').DwarfState} */
      e,
      order
    );
    if (order.kind === "operate" && order.target) {
      this._assignWorkshopOperator(order.target, dwarf.id);
    }
    return true;
  }
  /**
   * Placeholder for unit automation. Returns actions to execute.
   * @returns {GameAction[]}
   */
  getAutomationActions() {
    const actions = [];
    for (const e of this.entities.values()) {
      if (e.kind === "dwarf") {
        const act = nextDwarfAction(
          /** @type {import('./dwarves.js').DwarfState} */
          e,
          this
        );
        if (act) actions.push(act);
      } else if (e.kind === "enemy") {
        const act = nextEnemyAction(
          /** @type {import('./enemies.js').EnemyState} */
          e,
          this
        );
        if (act) actions.push(act);
      }
    }
    return actions;
  }
  _registerWorkshop(kind, pos) {
    const key = `${pos[0]},${pos[1]}`;
    if (this.workshops.has(key)) return;
    this.workshops.set(key, { kind, pos: [pos[0], pos[1]], operatorId: null, queue: [], inProgress: null });
  }
  _unregisterWorkshop(pos) {
    const key = `${pos[0]},${pos[1]}`;
    this.workshops.delete(key);
  }
  _assignWorkshopOperator(pos, dwarfId) {
    const key = `${pos[0]},${pos[1]}`;
    const ws = this.workshops.get(key);
    if (!ws) return;
    ws.operatorId = dwarfId;
  }
  _clearWorkshopOperator(pos, dwarfId) {
    const key = `${pos[0]},${pos[1]}`;
    const ws = this.workshops.get(key);
    if (!ws) return;
    if (ws.operatorId === dwarfId) ws.operatorId = null;
  }
  /**
   * Applies automation actions as a batch.
   * @param {{advanceTick?: boolean}} opts
   * @returns {SimResult|null}
   */
  applyAutomation(opts = {}) {
    const actions = this.getAutomationActions();
    if (actions.length === 0) return null;
    const merged = { changedTiles: [], changedEntities: [], log: [] };
    if (opts.advanceTick !== false) this._advanceTick();
    for (const act of actions) {
      const res = this.applyAction(act, { advanceTick: false });
      merged.changedTiles.push(...res.changedTiles);
      merged.changedEntities.push(...res.changedEntities);
      merged.log.push(...res.log);
    }
    return merged;
  }
  _advanceTick() {
    this.tick++;
    this._autoDepositCarriers();
    this._processWorkshops();
    if (this.config.enemySpawnEvery > 0 && this.tick % this.config.enemySpawnEvery === 0) {
      this._spawnEnemy();
    }
    if (this.tick % this.config.dayLength === 0) this._finalizeDay();
  }
  _finalizeDay() {
    for (const [kind, amount] of Object.entries(this.dayOutputs)) {
      if (amount <= 0) continue;
      this.finalOutputs[kind] = (this.finalOutputs[kind] ?? 0) + amount;
    }
    this.dayOutputs = {};
  }
  _processWorkshops() {
    for (const ws of this.workshops.values()) {
      if (!ws.operatorId) continue;
      const operator = this.entities.get(ws.operatorId);
      if (!operator || operator.pos[0] !== ws.pos[0] || operator.pos[1] !== ws.pos[1]) continue;
      if (!ws.inProgress) {
        if (ws.queue.length === 0) this._tryEnqueueWorkshopJob(ws);
        if (ws.queue.length > 0) ws.inProgress = ws.queue.shift() ?? null;
      }
      if (!ws.inProgress) continue;
      ws.inProgress.remaining -= 1;
      if (ws.inProgress.remaining > 0) continue;
      const recipe = this._getRecipe(ws.kind, ws.inProgress.recipeId);
      if (recipe) {
        if (recipe.outputTiming === "immediate") {
          this._addResources(recipe.outputs);
        } else {
          this._addDayOutputs(recipe.outputs);
        }
      }
      ws.inProgress = null;
    }
  }
  _tryEnqueueWorkshopJob(ws) {
    var _a;
    if (ws.queue.length >= this.config.workshopQueueCap) return;
    let rules = WORKSHOP_RULES[ws.kind] ?? [];
    const operator = ws.operatorId ? this.entities.get(ws.operatorId) : null;
    if (operator && operator.kind === "dwarf") {
      const dwarf = (
        /** @type {import('./dwarves.js').DwarfState} */
        operator
      );
      const override = (_a = dwarf.workshopRules) == null ? void 0 : _a[ws.kind];
      if (override && override.length > 0) rules = override;
    }
    const recipeId = this._pickRecipeFromRules(rules);
    if (!recipeId) return;
    const recipe = this._getRecipe(ws.kind, recipeId);
    if (!recipe) return;
    if (!this._hasResources(recipe.inputs)) return;
    this._spendResources(recipe.inputs);
    ws.queue.push({ recipeId: recipe.id, remaining: recipe.ticks ?? this.config.workshopJobTicks });
  }
  _pickRecipeFromRules(rules) {
    for (const rule of rules) {
      if (!rule.if) return rule.recipeId;
      const have = this.resources[rule.if.resource] ?? 0;
      if (have >= rule.if.min) return rule.recipeId;
    }
    return null;
  }
  _getRecipe(kind, recipeId) {
    return (WORKSHOP_RECIPES[kind] ?? []).find((r) => r.id === recipeId) ?? null;
  }
  _addResources(delta) {
    for (const [kind, amount] of Object.entries(delta)) {
      this.resources[kind] = (this.resources[kind] ?? 0) + amount;
    }
  }
  _addDayOutputs(delta) {
    for (const [kind, amount] of Object.entries(delta)) {
      this.dayOutputs[kind] = (this.dayOutputs[kind] ?? 0) + amount;
    }
  }
  _hasResources(costs) {
    for (const [kind, amount] of Object.entries(costs)) {
      if (this._getAvailableResource(kind) < amount) return false;
    }
    return true;
  }
  _spendResources(costs) {
    for (const [kind, amount] of Object.entries(costs)) {
      let remaining = amount;
      const haveRaw = this.resources[kind] ?? 0;
      const useRaw = Math.min(haveRaw, remaining);
      if (useRaw > 0) {
        this.resources[kind] = haveRaw - useRaw;
        remaining -= useRaw;
      }
      if (remaining > 0) {
        const eq = RAW_TO_PROCESSED[kind];
        if (eq) {
          const haveEq = this.resources[eq] ?? 0;
          const useEq = Math.min(haveEq, remaining);
          if (useEq > 0) {
            this.resources[eq] = haveEq - useEq;
            remaining -= useEq;
          }
        }
      }
    }
  }
  /**
   * @param {string} kind
   * @returns {number}
   */
  _getAvailableResource(kind) {
    const have = this.resources[kind] ?? 0;
    const eq = RAW_TO_PROCESSED[kind];
    if (!eq) return have;
    return have + (this.resources[eq] ?? 0);
  }
  getCarryCapacity() {
    return CARRY_CAPACITY;
  }
  /**
   * @param {EntityState} entity
   * @param {string} resourceKind
   */
  canCarryResource(entity, resourceKind) {
    const carry = (
      /** @type {{ kind: string, amount: number }|null|undefined} */
      entity.carry
    );
    if (!resourceKind) return true;
    if (!carry || carry.amount <= 0) return true;
    if (carry.kind !== resourceKind) return false;
    return carry.amount < CARRY_CAPACITY;
  }
  /**
   * @param {XY} pos
   * @param {string} resourceKind
   * @returns {boolean}
   */
  canDepositAt(pos, resourceKind) {
    return this._canDepositAt(pos, resourceKind);
  }
  /**
   * @param {string} resourceKind
   * @returns {boolean}
   */
  isResourceUseful(resourceKind) {
    return this._isResourceUseful(resourceKind);
  }
  /**
   * @param {XY} pos
   * @returns {FloorItem|null}
   */
  getFloorItemAt(pos) {
    return this._getFloorItem(pos);
  }
  /**
   * @param {XY} pos
   * @returns {string}
   */
  _posKey(pos) {
    return `${pos[0]},${pos[1]}`;
  }
  /**
   * @param {XY} pos
   * @returns {FloorItem|null}
   */
  _getFloorItem(pos) {
    return this.floorItems.get(this._posKey(pos)) ?? null;
  }
  /**
   * @param {XY} pos
   * @param {FloorItem|null} item
   */
  _setFloorItem(pos, item) {
    const key = this._posKey(pos);
    if (!item || item.amount <= 0) {
      this.floorItems.delete(key);
      return;
    }
    this.floorItems.set(key, { kind: item.kind, amount: item.amount });
  }
  /**
   * @param {XY} pos
   * @param {string} kind
   * @param {number} amount
   * @returns {boolean}
   */
  _addFloorItem(pos, kind, amount) {
    if (amount <= 0) return false;
    const key = this._posKey(pos);
    const current = this.floorItems.get(key);
    if (!current) {
      this.floorItems.set(key, { kind, amount });
      return true;
    }
    if (current.kind !== kind) return false;
    current.amount += amount;
    this.floorItems.set(key, current);
    return true;
  }
  /**
   * @param {XY} pos
   * @param {string} resourceKind
   * @returns {boolean}
   */
  _canDropAt(pos, resourceKind) {
    if (!this.world.inBounds(pos)) return false;
    const existing = this._getFloorItem(pos);
    return !existing || existing.kind === resourceKind;
  }
  /**
   * @param {EntityId} id
   * @returns {{ ok: boolean, reason: string|null }}
   */
  tryDrop(id) {
    const e = this.entities.get(id);
    if (!e || e.kind === "enemy") return { ok: false, reason: null };
    const carry = (
      /** @type {{ kind: string, amount: number }|null|undefined} */
      e.carry
    );
    if (!carry || carry.amount <= 0) return { ok: false, reason: "Nothing to drop" };
    if (!this._dropCarryAt(e, e.pos)) return { ok: false, reason: "Cannot drop here" };
    return { ok: true, reason: null };
  }
  /**
   * @param {EntityState} entity
   * @param {string} resourceKind
   * @param {number} amount
   */
  _addCarry(entity, resourceKind, amount) {
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
  /**
   * @param {EntityState} entity
   * @param {XY} pos
   * @returns {boolean}
   */
  _dropCarryAt(entity, pos) {
    const carry = (
      /** @type {{ kind: string, amount: number }|null|undefined} */
      entity.carry
    );
    if (!carry || carry.amount <= 0) return false;
    if (!this._canDropAt(pos, carry.kind)) return false;
    if (!this._addFloorItem(pos, carry.kind, carry.amount)) return false;
    entity.carry = null;
    return true;
  }
  /**
   * @param {EntityState} entity
   * @param {string|null} preferredKind
   * @returns {boolean}
   */
  _tryPickupEntity(entity, preferredKind = null) {
    if (entity.kind === "enemy") return false;
    const item = this._getFloorItem(entity.pos);
    if (!item) return false;
    if (preferredKind && item.kind !== preferredKind) return false;
    if (entity.kind === "dwarf" && !this._isResourceUseful(item.kind)) return false;
    if (!this.canCarryResource(entity, item.kind)) return false;
    const carry = (
      /** @type {{ kind: string, amount: number }|null|undefined} */
      entity.carry
    );
    const curAmount = (carry == null ? void 0 : carry.amount) ?? 0;
    const space = CARRY_CAPACITY - curAmount;
    if (space <= 0) return false;
    const take = Math.min(space, item.amount);
    this._addCarry(entity, item.kind, take);
    item.amount -= take;
    this._setFloorItem(entity.pos, item.amount > 0 ? item : null);
    return true;
  }
  /**
   * @param {number} oreId
   * @returns {string|null}
   */
  _resourceKeyForOre(oreId) {
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
  /**
   * @param {string|null} resourceKind
   * @returns {boolean}
   */
  _isResourceUseful(resourceKind) {
    if (!resourceKind) return true;
    if (resourceKind === "coal" || resourceKind === "raw_granite") return true;
    for (const ws of this.workshops.values()) {
      if (workshopAcceptsResource(ws.kind, resourceKind)) return true;
    }
    return false;
  }
  /**
   * @param {string} resourceKind
   * @param {XY} fromPos
   * @returns {XY|null}
   */
  findNearestDropoffGoal(resourceKind, fromPos) {
    const targets = this._getDropoffGoals(resourceKind);
    if (targets.length === 0) return null;
    let best = targets[0];
    let bestDist = Math.abs(best[0] - fromPos[0]) + Math.abs(best[1] - fromPos[1]);
    for (const t of targets.slice(1)) {
      const d = Math.abs(t[0] - fromPos[0]) + Math.abs(t[1] - fromPos[1]);
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
  /**
   * @param {string} resourceKind
   * @returns {XY[]}
   */
  _getDropoffPositions(resourceKind) {
    if (resourceKind === "coal") return this._findTilesOfType(T.COAL_HOPPER);
    if (resourceKind === "wood") return this._findTilesOfType(T.WOOD_HOPPER);
    const targets = [];
    for (const ws of this.workshops.values()) {
      if (!workshopAcceptsResource(ws.kind, resourceKind)) continue;
      targets.push(ws.pos);
    }
    return targets;
  }
  /**
   * @param {string} resourceKind
   * @returns {XY[]}
   */
  _getDropoffGoals(resourceKind) {
    const drops = this._getDropoffPositions(resourceKind);
    const goals = [];
    const seen = /* @__PURE__ */ new Set();
    for (const d of drops) {
      const candidates = [d, ...neighbors4(d)];
      for (const pos of candidates) {
        if (!this.world.inBounds(pos)) continue;
        if (!this.world.isWalkable(pos)) continue;
        const key = `${pos[0]},${pos[1]}`;
        if (seen.has(key)) continue;
        seen.add(key);
        goals.push([pos[0], pos[1]]);
      }
    }
    return goals;
  }
  /**
   * @param {number} tileType
   * @returns {XY[]}
   */
  _findTilesOfType(tileType) {
    const out = [];
    for (const xy of this.world.tiles.iterAll()) {
      if (this.world.tiles.get(xy) === tileType) out.push([xy[0], xy[1]]);
    }
    return out;
  }
  _autoDepositCarriers() {
    for (const e of this.entities.values()) {
      this._tryDepositEntity(e);
    }
  }
  /**
   * @param {EntityState} entity
   * @returns {boolean}
   */
  _tryDepositEntity(entity) {
    const carry = (
      /** @type {{ kind: string, amount: number }|null|undefined} */
      entity.carry
    );
    if (!carry || carry.amount <= 0) return false;
    if (!this._canDepositAt(entity.pos, carry.kind)) return false;
    this._addResources({ [carry.kind]: carry.amount });
    entity.carry = null;
    return true;
  }
  /**
   * @param {BuildKind} build
   * @returns {boolean}
   */
  _isWorkshopBuild(build) {
    return build === "smelter" || build === "forge" || build === "trap_bench" || build === "jeweler" || build === "mason";
  }
  /**
   * @param {XY} target
   * @returns {boolean}
   */
  _hasWorkshopSpace(target) {
    let open = 0;
    for (let y = target[1] - 1; y <= target[1] + 1; y++) {
      for (let x = target[0] - 1; x <= target[0] + 1; x++) {
        const pos = (
          /** @type {XY} */
          [x, y]
        );
        if (!this.world.inBounds(pos)) continue;
        const t = this.world.tiles.get(pos);
        if (t === T.FLOOR || t === T.TORCH) open++;
      }
    }
    return open >= MIN_WORKSHOP_FLOOR_TILES;
  }
  /**
   * @param {XY} pos
   * @returns {boolean}
   */
  _isWorkshopBufferTile(pos) {
    for (const ws of this.workshops.values()) {
      const dx = Math.abs(ws.pos[0] - pos[0]);
      const dy = Math.abs(ws.pos[1] - pos[1]);
      if (dx <= 1 && dy <= 1) return true;
    }
    return false;
  }
  /**
   * @param {XY} pos
   * @param {string} resourceKind
   * @returns {boolean}
   */
  _canDepositAt(pos, resourceKind) {
    if (resourceKind === "coal" && this._isAdjacentToTileType(pos, T.COAL_HOPPER)) return true;
    if (resourceKind === "wood" && this._isAdjacentToTileType(pos, T.WOOD_HOPPER)) return true;
    return this._isAdjacentToWorkshopAccepting(pos, resourceKind);
  }
  /**
   * @param {XY} pos
   * @param {number} tileType
   * @returns {boolean}
   */
  _isAdjacentToTileType(pos, tileType) {
    if (this.world.tiles.get(pos) === tileType) return true;
    for (const nb of neighbors4(pos)) {
      if (!this.world.inBounds(nb)) continue;
      if (this.world.tiles.get(nb) === tileType) return true;
    }
    return false;
  }
  /**
   * @param {XY} pos
   * @param {string} resourceKind
   * @returns {boolean}
   */
  _isAdjacentToWorkshopAccepting(pos, resourceKind) {
    const candidates = [pos, ...neighbors4(pos)];
    for (const p of candidates) {
      if (!this.world.inBounds(p)) continue;
      const tile = this.world.tiles.get(p);
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
  /**
   * Picks the most valuable ore within range of the requested origin.
   * @param {XY} origin
   * @param {number|null|undefined} radius
   * @param {string|null|undefined} requiredResourceKind
   * @returns {XY|null}
   */
  findBestMineTarget(origin, radius, requiredResourceKind = null) {
    const maxR = Math.max(0, radius ?? DEFAULT_MINE_RADIUS);
    const W = this.world.size[0];
    const H = this.world.size[1];
    let best = null;
    let bestValue = -1;
    let bestDist = Infinity;
    const minX = Math.max(0, origin[0] - maxR);
    const maxX = Math.min(W - 1, origin[0] + maxR);
    const minY = Math.max(0, origin[1] - maxR);
    const maxY = Math.min(H - 1, origin[1] + maxR);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dist2 = Math.abs(x - origin[0]) + Math.abs(y - origin[1]);
        if (dist2 > maxR) continue;
        const pos = (
          /** @type {XY} */
          [x, y]
        );
        if (this.world.tiles.get(pos) !== T.ROCK) continue;
        if (!this._rockIsMineable(pos)) continue;
        const oreId = this.world.ore.get(pos);
        const resKey = this._resourceKeyForOre(oreId);
        if (requiredResourceKind) {
          if (resKey !== requiredResourceKind) continue;
        } else if (resKey && !this._isResourceUseful(resKey)) {
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
  /**
   * @param {XY} origin
   * @param {number|null|undefined} radius
   * @param {string|null|undefined} requiredResourceKind
   * @returns {XY|null}
   */
  findNearestFloorItem(origin, radius, requiredResourceKind = null) {
    const maxR = Math.max(0, radius ?? DEFAULT_MINE_RADIUS);
    let best = null;
    let bestDist = Infinity;
    for (const [key, item] of this.floorItems.entries()) {
      const [xs, ys] = key.split(",");
      const x = Number(xs);
      const y = Number(ys);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const dist2 = Math.abs(x - origin[0]) + Math.abs(y - origin[1]);
      if (dist2 > maxR) continue;
      if (requiredResourceKind) {
        if (item.kind !== requiredResourceKind) continue;
      } else if (!this._isResourceUseful(item.kind)) {
        continue;
      }
      const pos = (
        /** @type {XY} */
        [x, y]
      );
      if (!this.world.inBounds(pos) || !this.world.isWalkable(pos)) continue;
      if (dist2 < bestDist) {
        bestDist = dist2;
        best = /** @type {XY} */
        [x, y];
      }
    }
    return best;
  }
  /**
   * @param {XY} pos
   * @returns {boolean}
   */
  _rockIsMineable(pos) {
    for (const nb of neighbors4(pos)) {
      if (!this.world.inBounds(nb)) continue;
      if (this.world.isWalkable(nb)) return true;
    }
    return false;
  }
  /**
   * @param {Record<string, number>} map
   * @returns {{ label: string, raw: number, processed: number }[]}
   */
  getResourceTallies(map) {
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
  /**
   * @param {EntityId} attackerId
   * @param {XY} targetPos
   * @returns {SimResult}
   */
  tryAttack(attackerId, targetPos) {
    const out = { changedTiles: [], changedEntities: [], log: [] };
    const attacker = this.entities.get(attackerId);
    if (!attacker) return out;
    const target = this._getEntityAt(targetPos);
    if (!target || target.id === attackerId) return out;
    if (!this._isAdjacent(attacker.pos, target.pos)) return out;
    const dmg = this._getAttackDamage(attacker);
    target.hp -= dmg;
    out.changedEntities.push(attacker.id, target.id);
    out.log.push(`Attack ${attacker.kind}#${attacker.id} -> ${target.kind}#${target.id} for ${dmg}`);
    if (target.hp <= 0) {
      if (target.kind === "chief") {
        target.hp = 0;
        this.gameOver = true;
        out.log.push(`Chief falls. Game over.`);
      } else {
        this.entities.delete(target.id);
        out.log.push(`${target.kind}#${target.id} dies`);
      }
    }
    return out;
  }
  _spawnEnemy() {
    const spawn = this._pickEnemySpawn();
    if (!spawn) return;
    const type = Math.random() < 0.6 ? "rat" : "kobold";
    const enemy = createEnemy(this._nextEntityId(), spawn, type);
    this.entities.set(enemy.id, enemy);
  }
  /**
   * @returns {XY|null}
   */
  _pickEnemySpawn() {
    const W = this.world.size[0];
    const H = this.world.size[1];
    const candidates = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const pos = (
          /** @type {XY} */
          [x, y]
        );
        if (this.world.tiles.get(pos) !== T.FLOOR) continue;
        if (this._isInHold(pos)) continue;
        if (this._isOccupied(pos)) continue;
        candidates.push(pos);
      }
    }
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  /**
   * @param {XY} pos
   */
  _isInHold(pos) {
    const hold = this.hold;
    if (!hold) return false;
    return pos[0] >= hold.holdL && pos[0] <= hold.holdR && pos[1] >= hold.holdT && pos[1] <= hold.holdB;
  }
  /**
   * @param {XY} pos
   */
  _isOccupied(pos) {
    for (const e of this.entities.values()) {
      if (e.pos[0] === pos[0] && e.pos[1] === pos[1]) return true;
    }
    return false;
  }
  _nextEntityId() {
    let maxId = 0;
    for (const e of this.entities.values()) {
      if (e.id > maxId) maxId = e.id;
    }
    return maxId + 1;
  }
  /**
   * @param {XY} pos
   * @returns {EntityState|null}
   */
  _getEntityAt(pos) {
    for (const e of this.entities.values()) {
      if (e.pos[0] === pos[0] && e.pos[1] === pos[1]) return e;
    }
    return null;
  }
  /**
   * @param {XY} a
   * @param {XY} b
   */
  _isAdjacent(a2, b) {
    const dx = Math.abs(a2[0] - b[0]);
    const dy = Math.abs(a2[1] - b[1]);
    return dx + dy === 1;
  }
  /**
   * @param {EntityState} entity
   */
  _getAttackDamage(entity) {
    if (entity.kind === "chief") return 3;
    if (entity.kind === "dwarf") return 2;
    if (entity.kind === "enemy") {
      const type = (
        /** @type {import('./enemies.js').EnemyState} */
        entity.type
      );
      if (type === "ogre") return 5;
      if (type === "goblin") return 3;
      if (type === "kobold") return 2;
      if (type === "rat") return 1;
    }
    return 1;
  }
}
function sumResources(map, keys) {
  let total = 0;
  for (const k of keys) total += map[k] ?? 0;
  return total;
}
function workshopAcceptsResource(kind, resourceKind) {
  var _a;
  const recipes = WORKSHOP_RECIPES[kind] ?? [];
  for (const recipe of recipes) {
    if (((_a = recipe.inputs) == null ? void 0 : _a[resourceKind]) && recipe.inputs[resourceKind] > 0) return true;
  }
  return false;
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
const urlTileset = "" + new URL("colored_tilemap_256x256-DkqKV0VA.png", import.meta.url).href;
const tileIcon = {
  [T.FLOOR]: [1, 1],
  [T.ROCK]: [4, 4],
  [T.WALL]: [3, 4],
  [T.TORCH]: [9, 9],
  [T.SMELTER]: [12, 5],
  [T.FORGE]: [12, 5],
  [T.TRAP_BENCH]: [12, 5],
  [T.JEWELER]: [12, 5],
  [T.DOOR]: [4, 2],
  [T.MASON]: [12, 5],
  [T.WOOD_HOPPER]: [10, 6],
  [T.COAL_HOPPER]: [11, 6]
};
const oreIcon = {
  [ORE.GRANITE]: [4, 4],
  [ORE.IRON]: [8, 4],
  [ORE.COPPER]: [6, 4],
  [ORE.GOLD]: [5, 4],
  [ORE.COAL]: [10, 4],
  [ORE.RUBY]: [7, 5],
  [ORE.EMERALD]: [7, 4],
  [ORE.DIAMOND]: [9, 4]
};
const floorItemIcon = {
  raw_granite: oreIcon[ORE.GRANITE],
  raw_iron: oreIcon[ORE.IRON],
  raw_copper: oreIcon[ORE.COPPER],
  raw_gold: oreIcon[ORE.GOLD],
  coal: oreIcon[ORE.COAL],
  raw_ruby: oreIcon[ORE.RUBY],
  raw_emerald: oreIcon[ORE.EMERALD],
  raw_diamond: oreIcon[ORE.DIAMOND],
  raw_gem: oreIcon[ORE.RUBY]
};
const targetIcon = (
  /** @type {XY} */
  [0, 11]
);
const orderTargetIcon = (
  /** @type {XY} */
  [1, 11]
);
const entIcon = {
  rat: [13, 0],
  kobold: [8, 0],
  goblin: [9, 0],
  ogre: [11, 0],
  dwarf: [14, 0],
  chief: [15, 0]
};
class DwarfGameApp extends App {
  constructor() {
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
    /** @type {'none'|'order_who'|'order_what'|'order_where'|'build_what'|'build_where'} */
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
    this.sim = new GameSim([54, 36]);
    this.selectedDwarfId = this._firstDwarfId();
    this.webgl = WebGLTileWidget.a({
      id: "terrain",
      src: urlTileset,
      txTileDim: 8,
      hints: { right: 1, y: "2", w: "54", h: "36" }
    });
    this.info = Label.a({
      id: "info",
      text: "Fortress conditions\n",
      fontName: "serif",
      align: "left",
      hints: { x: 0, y: "2", w: "10", h: "36" },
      wrap: true,
      fontSize: "1"
    });
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
    var _a, _b;
    const c = this.sim.chief;
    const dwarf = this._getSelectedDwarf();
    const dwarfLabel = dwarf ? ` | Dwarf#${dwarf.id} ${((_a = dwarf.order) == null ? void 0 : _a.kind) ?? "idle"}` : "";
    const dayLen = this.sim.config.dayLength;
    const day = Math.floor(this.sim.tick / dayLen) + 1;
    const dayTick = this.sim.tick % dayLen;
    const gameOverLabel = this.sim.gameOver ? " | GAME OVER" : "";
    this.header.text = `Day ${day} (${dayTick}/${dayLen}) | Chief (${c.pos[0]},${c.pos[1]})${dwarfLabel}${gameOverLabel}`;
    this.hotkeys.text = this._buildHotkeyPrompt();
    this.info.text = this._buildInfoText();
    if ((_b = result == null ? void 0 : result.log) == null ? void 0 : _b.length) {
      this.logLines.push(...result.log);
      this.logLines = this.logLines.slice(-3);
    }
    this.status.text = this.logLines.join(" | ");
    this.webgl.drawBatch = [];
    console.log("tiles", this.sim.world.tiles);
    for (let xy of this.sim.world.tiles.iterAll()) {
      if (this.sim.world.explored.get(xy) !== 1) continue;
      const t = this.sim.world.tiles.get(xy);
      const ti = tileIcon[t] ?? tileIcon[T.ROCK];
      this.webgl.addTile(ti[0], ti[1], 1, 1, xy[0], xy[1], 1, 1, [1, 1, 1, 1]);
      if (t === T.ROCK) {
        const oreId = this.sim.world.ore.get(xy);
        const oi = oreIcon[oreId];
        if (oi) this.webgl.addTile(oi[0], oi[1], 1, 1, xy[0], xy[1], 1, 1, [1, 1, 1, 1]);
      }
    }
    for (const [key, item] of this.sim.floorItems.entries()) {
      const [xs, ys] = key.split(",");
      const x = Number(xs);
      const y = Number(ys);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const pos = (
        /** @type {XY} */
        [x, y]
      );
      if (this.sim.world.explored.get(pos) !== 1) continue;
      const icon = floorItemIcon[item.kind];
      if (!icon) continue;
      this.webgl.addTile(icon[0], icon[1], 1, 1, pos[0], pos[1], 1, 1, [1, 1, 1, 1]);
    }
    for (const e of this.sim.entities.values()) {
      if (this.sim.world.explored.get(e.pos) !== 1) continue;
      const ti = e.kind === "enemy" ? entIcon[e.type] : entIcon[e.kind];
      if (!ti) continue;
      console.log(e, e.pos, ti);
      this.webgl.addTile(ti[0], ti[1], 1, 1, e.pos[0], e.pos[1], 1, 1, [1, 1, 1, 1]);
    }
    const target = this._getCommandTarget();
    if (target && this.sim.world.inBounds(target) && this.sim.world.explored.get(target) === 1) {
      this.webgl.addTile(targetIcon[0], targetIcon[1], 1, 1, target[0], target[1], 1, 1, [1, 1, 1, 1]);
    }
    const orderTarget = this._getSelectedOrderTarget();
    if (orderTarget && this.sim.world.inBounds(orderTarget) && this.sim.world.explored.get(orderTarget) === 1) {
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
    lines.push("Day Outputs");
    lines.push(...this._formatResourceTallies(this.sim.dayOutputs));
    lines.push("");
    lines.push("Final Outputs");
    lines.push(...this._formatResourceTallies(this.sim.finalOutputs));
    return lines.join("\n");
  }
  /**
   * 
   * @param {import('./dwarves.js').ChiefState} chief 
   * @returns 
   */
  _formatChiefLine(chief) {
    const carry = chief.carry && chief.carry.amount > 0 ? ` ${this._shortResourceName(chief.carry.kind)}x${chief.carry.amount}` : "";
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
    const carry = dwarf.carry && dwarf.carry.amount > 0 ? ` ${this._shortResourceName(dwarf.carry.kind)}x${dwarf.carry.amount}` : "";
    return `Dwarf#${dwarf.id} hp:${dwarf.hp} ${orderLabel}${target}${carry}`;
  }
  /**
   * @param {string} kind
   */
  _shortResourceName(kind) {
    const map = {
      raw_granite: "granite",
      raw_iron: "iron",
      raw_copper: "copper",
      raw_gold: "gold",
      raw_ruby: "ruby",
      raw_emerald: "emerald",
      raw_diamond: "diamond",
      polished_granite: "stone",
      refined_iron: "iron+",
      refined_copper: "copper+",
      refined_gold: "gold+",
      jewelery: "jewels"
    };
    return map[kind] ?? kind;
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
   * @param {} map 
   * @returns 
   */
  _formatResourceTallies(map) {
    const rows = this.sim.getResourceTallies(map);
    if (rows.length === 0) return ["(none)"];
    return rows.map((r) => `${r.label}: raw ${r.raw} | proc ${r.processed}`);
  }
  _buildHotkeyPrompt() {
    if (this.commandMode === "order_who") return "Order: pick dwarf (W/S or Up/Down, Enter)";
    if (this.commandMode === "order_what") return "Order: 1=guard 2=mine 3=build 4=operate";
    if (this.commandMode === "order_where") return "Order: move target (WASD/arrows), Enter to confirm";
    if (this.commandMode === "build_what") return "Build: 1=wall 2=torch 3=smelter 4=door 5=forge 6=trap 7=jeweler 8=mason";
    if (this.commandMode === "build_where") return "Build: pick target (WASD/arrows), Enter to confirm";
    return "W/A/S/D or Arrows move (bump mine/attack) | O Order | B Build | X Drop | Space/Enter repeat build";
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
    if (this.sim.world.explored.get(next) !== 1) return false;
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
   * @returns {import('./sim.js').EntityState|null}
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
        this.sim.setDwarfOrder(dwarf.id, { kind: "mine", target });
        orderResult = { changedTiles: [], changedEntities: [], log: [`Order dwarf#${dwarf.id} mine ${target[0]},${target[1]}`] };
        advanceTurn = true;
        this.commandMode = "none";
        this.pendingOrderKind = null;
        this.pendingOrderDwarfId = null;
        this.pendingBuildForOrder = false;
        this.cursorPos = null;
      } else if (this.pendingOrderKind === "build") {
        this.sim.setDwarfOrder(dwarf.id, { kind: "build", target, build: this.sim.buildSelection });
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
          this.sim.setDwarfOrder(dwarf.id, { kind: "operate", target });
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
        this.sim.setDwarfOrder(dwarf.id, { kind: "guard", target: guardTarget });
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
  /**
   * Convert a key event into a *turn action*, apply to sim, then sync UI.
   * ESKV InputHandler emits `key_down` with {states,...} (your module) :contentReference[oaicite:2]{index=2}.
   */
  on_key_down() {
    const ip = this.inputHandler;
    if (!ip) return;
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
      }
      if (!commandStarted) {
        if (ip.isKeyDown("x")) {
          const carry = this.sim.chief.carry;
          if (!carry || carry.amount <= 0) {
            orderResult = { changedTiles: [], changedEntities: [], log: ["Nothing to drop"] };
          } else {
            const item = this.sim.getFloorItemAt(this.sim.chief.pos);
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
              const check = this.sim.checkMine(this.sim.chiefId, target);
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
        if (!act && (ip.isKeyDown(" ") || ip.isKeyDown("Enter"))) {
          const dv = FacingVec[this.lastFacing] ?? [0, 0];
          const target = (
            /**@type {XY}*/
            [this.sim.chief.pos[0] + dv[0], this.sim.chief.pos[1] + dv[1]]
          );
          if (this.lastContextAction === "build") {
            act = { type: "build", id: this.sim.chiefId, target, build: this.sim.buildSelection };
          }
          if (act) advanceTurn = true;
        }
        if (ip.isKeyDown("Tab") || ip.isKeyDown("c")) {
          this.selectedDwarfId = this._nextDwarfId();
        }
      }
    }
    const result = act ? this.sim.applyAction(act) : null;
    const autoResult = advanceTurn ? this.sim.applyAutomation({ advanceTick: !act }) : null;
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
const app = new DwarfGameApp();
app.start();
