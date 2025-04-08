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
function mulberry32(a) {
  return function() {
    var t = a += 1831565813;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function xoshiro128ss(a, b, c, d) {
  return function() {
    var t = b << 9, r = b * 5;
    r = (r << 7 | r >>> 25) * 9;
    c ^= a;
    d ^= b;
    b ^= c;
    a ^= d;
    c ^= t;
    d = d << 11 | d >>> 21;
    return (r >>> 0) / 4294967296;
  };
}
function jsf32(a, b, c, d) {
  return function() {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    var t = a - (b << 27 | b >>> 5) | 0;
    a = b ^ (c << 17 | c >>> 15);
    b = c + d | 0;
    c = d + t | 0;
    d = a + t | 0;
    return (d >>> 0) / 4294967296;
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
class PRNG_mulberry32 extends PRNG {
  constructor() {
    super(...arguments);
    __publicField(this, "_seed", 1);
    __publicField(this, "d", 3735928559);
    __publicField(this, "xorSeed", Math.floor(Date.now()) ^ this.d);
    __publicField(this, "random", mulberry32(this.xorSeed));
  }
  seed(seed) {
    this._seed = seed;
    this.xorSeed = seed ^ this.d;
    this.random = mulberry32(this.xorSeed);
  }
}
class PRNG_xoshiro128ss extends PRNG {
  constructor() {
    super(...arguments);
    __publicField(this, "_seed", 1);
    __publicField(this, "d", 3735928559);
    __publicField(this, "xorSeed", Math.floor(Date.now()) ^ this.d);
    __publicField(this, "random", xoshiro128ss(2654435769, 608135816, 3084996962, this.xorSeed));
  }
  seed(seed) {
    this._seed = seed;
    this.xorSeed = seed ^ this.d;
    this.random = xoshiro128ss(2654435769, 608135816, 3084996962, this.xorSeed);
  }
}
class PRNG_jsf32 extends PRNG {
  constructor() {
    super(...arguments);
    __publicField(this, "_seed", 1);
    __publicField(this, "d", 3735928559);
    __publicField(this, "xorSeed", Math.floor(Date.now()) ^ this.d);
    __publicField(this, "random", jsf32(2654435769, 608135816, 3084996962, this.xorSeed));
  }
  seed(seed) {
    this._seed = seed;
    this.xorSeed = seed ^ this.d;
    this.random = jsf32(2654435769, 608135816, 3084996962, this.xorSeed);
  }
}
var defaultPRNG = new PRNG_sfc32();
function setPRNG(name) {
  switch (name) {
    case "Math.random":
      defaultPRNG = new PRNG();
      return;
    case "sfc32":
      defaultPRNG = new PRNG_sfc32();
      return;
    case "mulberry32":
      defaultPRNG = new PRNG_mulberry32();
      return;
    case "xoshiro128ss":
      defaultPRNG = new PRNG_xoshiro128ss();
      return;
    case "jsf32":
      defaultPRNG = new PRNG_jsf32();
      return;
    default:
      throw Error(`Unknown PRNG ${name}`);
  }
}
function getRandomInt(m1, m2 = 0) {
  return defaultPRNG.getRandomInt(m1, m2);
}
function getRandomPos(max1, max2) {
  return defaultPRNG.getRandomPos(max1, max2);
}
function randomFloat(min = 0, max = 1) {
  return defaultPRNG.randomFloat(min, max);
}
function shuffle(arr) {
  return defaultPRNG.shuffle(arr);
}
function choose(array) {
  return defaultPRNG.choose(array);
}
function setSeed(seed) {
  return defaultPRNG.seed(seed);
}
function stringToSeed(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & 4294967295;
  }
  return hash >>> 0;
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
      const origFill = ctx.fillStyle;
      ctx.fillStyle = this.bgColor;
      ctx.fill();
      ctx.fillStyle = origFill;
    }
    if (this.outlineColor != null) {
      let lw = ctx.lineWidth;
      ctx.lineWidth = 1 / app.tileSize;
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
    var _a;
    return (_a = this.frames[this.activeFrame]) != null ? _a : -1;
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
class Color extends Array {
  /**
   * Constructs a new RGBA value from red, green, blue and alpha values.
   * @param {number} r red value (0-255)
   * @param {number} g green value (0-255)
   * @param {number} b blue value (0-255)
   * @param {number} a alpha value (0-1) 
   */
  constructor(r = 0, g = 0, b = 0, a = 1) {
    super(4);
    this[0] = r;
    this[1] = g;
    this[2] = b;
    this[3] = a;
  }
  /**
   * Creates a new Color object from a string
   * @param {string} colorName 
   * @returns {Color}
   */
  static fromString(colorName) {
    var _a, _b, _c;
    if (colorName === null) {
      return new Color(0, 0, 0, 0);
    }
    if (colorName.startsWith("#")) {
      const match = colorName.match(/^#([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])?$/);
      if (!match) throw Error(`Unkwown color string ${colorName}`);
      const r2 = (_a = parseInt(match[1], 16)) != null ? _a : 0;
      const g2 = (_b = parseInt(match[2], 16)) != null ? _b : 0;
      const b2 = (_c = parseInt(match[3], 16)) != null ? _c : 0;
      const a = 0;
      return new Color(r2, g2, b2, a);
    }
    if (colorName.startsWith("rgba(")) {
      const match = colorName.match(/^rgba\((\d{1,3}%?),\s*(\d{1,3}%?),\s*(\d{1,3}%?),\s*([\d.]+)\)$/);
      if (!match) throw Error(`Unkwown color string ${colorName}`);
      const r2 = match[1].endsWith("%") ? Math.round(parseInt(match[1]) * 255 / 100) : parseInt(match[1]);
      const g2 = match[2].endsWith("%") ? Math.round(parseInt(match[2]) * 255 / 100) : parseInt(match[2]);
      const b2 = match[3].endsWith("%") ? Math.round(parseInt(match[3]) * 255 / 100) : parseInt(match[3]);
      const a = parseFloat(match[4]);
      return new Color(r2, g2, b2, a);
    }
    if (colorName.startsWith("rgb(")) {
      const match = colorName.match(/^rgb\((\d{1,3}%?),\s*(\d{1,3}%?),\s*(\d{1,3}%?)\)$/);
      if (!match) throw Error(`Unkwown color string ${colorName}`);
      const r2 = match[1].endsWith("%") ? Math.round(parseInt(match[1]) * 255 / 100) : parseInt(match[1]);
      const g2 = match[2].endsWith("%") ? Math.round(parseInt(match[2]) * 255 / 100) : parseInt(match[2]);
      const b2 = match[3].endsWith("%") ? Math.round(parseInt(match[3]) * 255 / 100) : parseInt(match[3]);
      return new Color(r2, g2, b2, 1);
    }
    let [r, g, b] = colorLookup[colorName]["rgb"];
    return new Color(r, g, b, 1);
  }
  /**
   * Return a CSS string representation for given RGBA values
   * @param {number} r red, 0 - 255
   * @param {number} g green, 0 - 255
   * @param {number} b blue, 0 - 255
   * @param {number} a alpha, 0 - 1
   * @returns {string} CSS string represenation of the color
   */
  static stringFromValues(r, g, b, a = 1) {
    return `rgba(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)},${a})`;
  }
  /**
   * Return a CSS string representation of RGBA color for given HSV values
   * @param {number} h hue, 0-360
   * @param {number} s green, 0-100
   * @param {number} v blue, 0-100
   * @param {number} a alpha, 0 - 1
   * @returns {string} CSS string represenation of the color
   */
  static stringFromHSV(h, s, v, a = 1) {
    return Color.fromHSV(h, s, v, a).toString();
  }
  /**
   * Returns a CSS string representation of this object
   * @returns {string} CSS string representation of this object
   */
  toString() {
    return `rgba(${this[0]},${this[1]},${this[2]},${this[3]})`;
  }
  /**
   * 
   * @returns {[number, number, number]}
   */
  rgb() {
    return this.slice(0, 3);
  }
  /**
   * Mix this color with another in proportions specified by wgt
   * @param {Color} color Color to mix with
   * @param {number} wgt proportion the added color
   * @returns {Color}
   */
  mix(color, wgt) {
    return new Color(
      this[0] * (1 - wgt) + color[0] * wgt,
      this[1] * (1 - wgt) + color[1] * wgt,
      this[2] * (1 - wgt) + color[2] * wgt,
      this[3] * (1 - wgt) + color[3] * wgt
    );
  }
  /**
   * Scale the value of the color by a fixed proportion
   * @param {number} value proportion to scale RGB values by, 0-1 typically
   * @returns {Color}
   */
  scale(value) {
    return new Color(
      this[0] * value,
      this[1] * value,
      this[2] * value,
      this[3]
    );
  }
  toStringWithAlpha(alpha = 1) {
    return `rgba(${this[0]},${this[1]},${this[2]},${alpha})`;
  }
  /**
   * Return Color from Hue, Staturation, Value trio
   * @param {number} h hue (color) from 0 to 360
   * @param {number} s saturation (intensity) from 0 to 100
   * @param {number} v value (brightness) from 0 to 100
   * @param {number} a alpha value
   */
  static fromHSV(h, s, v, a = 1) {
    h /= 360;
    s /= 100;
    v /= 100;
    let r = 0, g = 0, b = 0;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0:
        r = v, g = t, b = p;
        break;
      case 1:
        r = q, g = v, b = p;
        break;
      case 2:
        r = p, g = v, b = t;
        break;
      case 3:
        r = p, g = q, b = v;
        break;
      case 4:
        r = t, g = p, b = v;
        break;
      case 5:
        r = v, g = p, b = q;
        break;
    }
    return new Color(Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255), a);
  }
  /**
   * Returns HSV + Alpha channel in an array
   * Value ranges: H - 0 to 360, S - 0 to 100, V - 0 to 100, A - 0 to 1
   * @returns {[number, number, number, number]}
   */
  toHSVA() {
    let [r, g, b, a] = this;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, v = max;
    let d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max !== min) {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(v * 100), a];
  }
  /**@type {number} red value, 0-255 */
  get r() {
    return this[0];
  }
  /**@type {number} green value, 0-255 */
  get g() {
    return this[1];
  }
  /**@type {number} blue value, 0-255 */
  get b() {
    return this[2];
  }
  /**@type {number} alpha value, 0-1 */
  get a() {
    return this[3];
  }
  set r(val) {
    this[0] = val;
  }
  set g(val) {
    this[1] = val;
  }
  set b(val) {
    this[2] = val;
  }
  set a(val) {
    this[3] = val;
  }
}
var colorLookup = {
  "air_force_blue_raf": {
    "name": "Air Force Blue (Raf)",
    "rgb": [93, 138, 168]
  },
  "air_force_blue_usaf": {
    "name": "Air Force Blue (Usaf)",
    "rgb": [0, 48, 143]
  },
  "air_superiority_blue": {
    "name": "Air Superiority Blue",
    "rgb": [114, 160, 193]
  },
  "alabama_crimson": {
    "name": "Alabama Crimson",
    "rgb": [163, 38, 56]
  },
  "alice_blue": {
    "name": "Alice Blue",
    "rgb": [240, 248, 255]
  },
  "alizarin_crimson": {
    "name": "Alizarin Crimson",
    "rgb": [227, 38, 54]
  },
  "alloy_orange": {
    "name": "Alloy Orange",
    "rgb": [196, 98, 16]
  },
  "almond": {
    "name": "Almond",
    "rgb": [239, 222, 205]
  },
  "amaranth": {
    "name": "Amaranth",
    "rgb": [229, 43, 80]
  },
  "amber": {
    "name": "Amber",
    "rgb": [255, 191, 0]
  },
  "amber_sae_ece": {
    "name": "Amber (Sae/Ece)",
    "rgb": [255, 126, 0]
  },
  "american_rose": {
    "name": "American Rose",
    "rgb": [255, 3, 62]
  },
  "amethyst": {
    "name": "Amethyst",
    "rgb": [153, 102, 204]
  },
  "android_green": {
    "name": "Android Green",
    "rgb": [164, 198, 57]
  },
  "anti_flash_white": {
    "name": "Anti-Flash White",
    "rgb": [242, 243, 244]
  },
  "antique_brass": {
    "name": "Antique Brass",
    "rgb": [205, 149, 117]
  },
  "antique_fuchsia": {
    "name": "Antique Fuchsia",
    "rgb": [145, 92, 131]
  },
  "antique_ruby": {
    "name": "Antique Ruby",
    "rgb": [132, 27, 45]
  },
  "antique_white": {
    "name": "Antique White",
    "rgb": [250, 235, 215]
  },
  "ao_english": {
    "name": "Ao (English)",
    "rgb": [0, 128, 0]
  },
  "apple_green": {
    "name": "Apple Green",
    "rgb": [141, 182, 0]
  },
  "apricot": {
    "name": "Apricot",
    "rgb": [251, 206, 177]
  },
  "aqua": {
    "name": "Aqua",
    "rgb": [0, 255, 255]
  },
  "aquamarine": {
    "name": "Aquamarine",
    "rgb": [127, 255, 212]
  },
  "army_green": {
    "name": "Army Green",
    "rgb": [75, 83, 32]
  },
  "arsenic": {
    "name": "Arsenic",
    "rgb": [59, 68, 75]
  },
  "arylide_yellow": {
    "name": "Arylide Yellow",
    "rgb": [233, 214, 107]
  },
  "ash_grey": {
    "name": "Ash Grey",
    "rgb": [178, 190, 181]
  },
  "asparagus": {
    "name": "Asparagus",
    "rgb": [135, 169, 107]
  },
  "atomic_tangerine": {
    "name": "Atomic Tangerine",
    "rgb": [255, 153, 102]
  },
  "auburn": {
    "name": "Auburn",
    "rgb": [165, 42, 42]
  },
  "aureolin": {
    "name": "Aureolin",
    "rgb": [253, 238, 0]
  },
  "aurometalsaurus": {
    "name": "Aurometalsaurus",
    "rgb": [110, 127, 128]
  },
  "avocado": {
    "name": "Avocado",
    "rgb": [86, 130, 3]
  },
  "azure": {
    "name": "Azure",
    "rgb": [0, 127, 255]
  },
  "azure_mist_web": {
    "name": "Azure Mist/Web",
    "rgb": [240, 255, 255]
  },
  "baby_blue": {
    "name": "Baby Blue",
    "rgb": [137, 207, 240]
  },
  "baby_blue_eyes": {
    "name": "Baby Blue Eyes",
    "rgb": [161, 202, 241]
  },
  "baby_pink": {
    "name": "Baby Pink",
    "rgb": [244, 194, 194]
  },
  "ball_blue": {
    "name": "Ball Blue",
    "rgb": [33, 171, 205]
  },
  "banana_mania": {
    "name": "Banana Mania",
    "rgb": [250, 231, 181]
  },
  "banana_yellow": {
    "name": "Banana Yellow",
    "rgb": [255, 225, 53]
  },
  "barn_red": {
    "name": "Barn Red",
    "rgb": [124, 10, 2]
  },
  "battleship_grey": {
    "name": "Battleship Grey",
    "rgb": [132, 132, 130]
  },
  "bazaar": {
    "name": "Bazaar",
    "rgb": [152, 119, 123]
  },
  "beau_blue": {
    "name": "Beau Blue",
    "rgb": [188, 212, 230]
  },
  "beaver": {
    "name": "Beaver",
    "rgb": [159, 129, 112]
  },
  "beige": {
    "name": "Beige",
    "rgb": [245, 245, 220]
  },
  "big_dip_o_ruby": {
    "name": "Big Dip O’Ruby",
    "rgb": [156, 37, 66]
  },
  "bisque": {
    "name": "Bisque",
    "rgb": [255, 228, 196]
  },
  "bistre": {
    "name": "Bistre",
    "rgb": [61, 43, 31]
  },
  "bittersweet": {
    "name": "Bittersweet",
    "rgb": [254, 111, 94]
  },
  "bittersweet_shimmer": {
    "name": "Bittersweet Shimmer",
    "rgb": [191, 79, 81]
  },
  "black": {
    "name": "Black",
    "rgb": [0, 0, 0]
  },
  "black_bean": {
    "name": "Black Bean",
    "rgb": [61, 12, 2]
  },
  "black_leather_jacket": {
    "name": "Black Leather Jacket",
    "rgb": [37, 53, 41]
  },
  "black_olive": {
    "name": "Black Olive",
    "rgb": [59, 60, 54]
  },
  "blanched_almond": {
    "name": "Blanched Almond",
    "rgb": [255, 235, 205]
  },
  "blast_off_bronze": {
    "name": "Blast-Off Bronze",
    "rgb": [165, 113, 100]
  },
  "bleu_de_france": {
    "name": "Bleu De France",
    "rgb": [49, 140, 231]
  },
  "blizzard_blue": {
    "name": "Blizzard Blue",
    "rgb": [172, 229, 238]
  },
  "blond": {
    "name": "Blond",
    "rgb": [250, 240, 190]
  },
  "blue": {
    "name": "Blue",
    "rgb": [0, 0, 255]
  },
  "blue_bell": {
    "name": "Blue Bell",
    "rgb": [162, 162, 208]
  },
  "blue_crayola": {
    "name": "Blue (Crayola)",
    "rgb": [31, 117, 254]
  },
  "blue_gray": {
    "name": "Blue Gray",
    "rgb": [102, 153, 204]
  },
  "blue_green": {
    "name": "Blue-Green",
    "rgb": [13, 152, 186]
  },
  "blue_munsell": {
    "name": "Blue (Munsell)",
    "rgb": [0, 147, 175]
  },
  "blue_ncs": {
    "name": "Blue (Ncs)",
    "rgb": [0, 135, 189]
  },
  "blue_pigment": {
    "name": "Blue (Pigment)",
    "rgb": [51, 51, 153]
  },
  "blue_ryb": {
    "name": "Blue (Ryb)",
    "rgb": [2, 71, 254]
  },
  "blue_sapphire": {
    "name": "Blue Sapphire",
    "rgb": [18, 97, 128]
  },
  "blue_violet": {
    "name": "Blue-Violet",
    "rgb": [138, 43, 226]
  },
  "blush": {
    "name": "Blush",
    "rgb": [222, 93, 131]
  },
  "bole": {
    "name": "Bole",
    "rgb": [121, 68, 59]
  },
  "bondi_blue": {
    "name": "Bondi Blue",
    "rgb": [0, 149, 182]
  },
  "bone": {
    "name": "Bone",
    "rgb": [227, 218, 201]
  },
  "boston_university_red": {
    "name": "Boston University Red",
    "rgb": [204, 0, 0]
  },
  "bottle_green": {
    "name": "Bottle Green",
    "rgb": [0, 106, 78]
  },
  "boysenberry": {
    "name": "Boysenberry",
    "rgb": [135, 50, 96]
  },
  "brandeis_blue": {
    "name": "Brandeis Blue",
    "rgb": [0, 112, 255]
  },
  "brass": {
    "name": "Brass",
    "rgb": [181, 166, 66]
  },
  "brick_red": {
    "name": "Brick Red",
    "rgb": [203, 65, 84]
  },
  "bright_cerulean": {
    "name": "Bright Cerulean",
    "rgb": [29, 172, 214]
  },
  "bright_green": {
    "name": "Bright Green",
    "rgb": [102, 255, 0]
  },
  "bright_lavender": {
    "name": "Bright Lavender",
    "rgb": [191, 148, 228]
  },
  "bright_maroon": {
    "name": "Bright Maroon",
    "rgb": [195, 33, 72]
  },
  "bright_pink": {
    "name": "Bright Pink",
    "rgb": [255, 0, 127]
  },
  "bright_turquoise": {
    "name": "Bright Turquoise",
    "rgb": [8, 232, 222]
  },
  "bright_ube": {
    "name": "Bright Ube",
    "rgb": [209, 159, 232]
  },
  "brilliant_lavender": {
    "name": "Brilliant Lavender",
    "rgb": [244, 187, 255]
  },
  "brilliant_rose": {
    "name": "Brilliant Rose",
    "rgb": [255, 85, 163]
  },
  "brink_pink": {
    "name": "Brink Pink",
    "rgb": [251, 96, 127]
  },
  "british_racing_green": {
    "name": "British Racing Green",
    "rgb": [0, 66, 37]
  },
  "bronze": {
    "name": "Bronze",
    "rgb": [205, 127, 50]
  },
  "brown_traditional": {
    "name": "Brown (Traditional)",
    "rgb": [150, 75, 0]
  },
  "brown_web": {
    "name": "Brown (Web)",
    "rgb": [165, 42, 42]
  },
  "bubble_gum": {
    "name": "Bubble Gum",
    "rgb": [255, 193, 204]
  },
  "bubbles": {
    "name": "Bubbles",
    "rgb": [231, 254, 255]
  },
  "buff": {
    "name": "Buff",
    "rgb": [240, 220, 130]
  },
  "bulgarian_rose": {
    "name": "Bulgarian Rose",
    "rgb": [72, 6, 7]
  },
  "burgundy": {
    "name": "Burgundy",
    "rgb": [128, 0, 32]
  },
  "burlywood": {
    "name": "Burlywood",
    "rgb": [222, 184, 135]
  },
  "burnt_orange": {
    "name": "Burnt Orange",
    "rgb": [204, 85, 0]
  },
  "burnt_sienna": {
    "name": "Burnt Sienna",
    "rgb": [233, 116, 81]
  },
  "burnt_umber": {
    "name": "Burnt Umber",
    "rgb": [138, 51, 36]
  },
  "byzantine": {
    "name": "Byzantine",
    "rgb": [189, 51, 164]
  },
  "byzantium": {
    "name": "Byzantium",
    "rgb": [112, 41, 99]
  },
  "cadet": {
    "name": "Cadet",
    "rgb": [83, 104, 114]
  },
  "cadet_blue": {
    "name": "Cadet Blue",
    "rgb": [95, 158, 160]
  },
  "cadet_grey": {
    "name": "Cadet Grey",
    "rgb": [145, 163, 176]
  },
  "cadmium_green": {
    "name": "Cadmium Green",
    "rgb": [0, 107, 60]
  },
  "cadmium_orange": {
    "name": "Cadmium Orange",
    "rgb": [237, 135, 45]
  },
  "cadmium_red": {
    "name": "Cadmium Red",
    "rgb": [227, 0, 34]
  },
  "cadmium_yellow": {
    "name": "Cadmium Yellow",
    "rgb": [255, 246, 0]
  },
  "caf_au_lait": {
    "name": "Café Au Lait",
    "rgb": [166, 123, 91]
  },
  "caf_noir": {
    "name": "Café Noir",
    "rgb": [75, 54, 33]
  },
  "cal_poly_green": {
    "name": "Cal Poly Green",
    "rgb": [30, 77, 43]
  },
  "cambridge_blue": {
    "name": "Cambridge Blue",
    "rgb": [163, 193, 173]
  },
  "camel": {
    "name": "Camel",
    "rgb": [193, 154, 107]
  },
  "cameo_pink": {
    "name": "Cameo Pink",
    "rgb": [239, 187, 204]
  },
  "camouflage_green": {
    "name": "Camouflage Green",
    "rgb": [120, 134, 107]
  },
  "canary_yellow": {
    "name": "Canary Yellow",
    "rgb": [255, 239, 0]
  },
  "candy_apple_red": {
    "name": "Candy Apple Red",
    "rgb": [255, 8, 0]
  },
  "candy_pink": {
    "name": "Candy Pink",
    "rgb": [228, 113, 122]
  },
  "capri": {
    "name": "Capri",
    "rgb": [0, 191, 255]
  },
  "caput_mortuum": {
    "name": "Caput Mortuum",
    "rgb": [89, 39, 32]
  },
  "cardinal": {
    "name": "Cardinal",
    "rgb": [196, 30, 58]
  },
  "caribbean_green": {
    "name": "Caribbean Green",
    "rgb": [0, 204, 153]
  },
  "carmine": {
    "name": "Carmine",
    "rgb": [150, 0, 24]
  },
  "carmine_m_p": {
    "name": "Carmine (M&P)",
    "rgb": [215, 0, 64]
  },
  "carmine_pink": {
    "name": "Carmine Pink",
    "rgb": [235, 76, 66]
  },
  "carmine_red": {
    "name": "Carmine Red",
    "rgb": [255, 0, 56]
  },
  "carnation_pink": {
    "name": "Carnation Pink",
    "rgb": [255, 166, 201]
  },
  "carnelian": {
    "name": "Carnelian",
    "rgb": [179, 27, 27]
  },
  "carolina_blue": {
    "name": "Carolina Blue",
    "rgb": [153, 186, 221]
  },
  "carrot_orange": {
    "name": "Carrot Orange",
    "rgb": [237, 145, 33]
  },
  "catalina_blue": {
    "name": "Catalina Blue",
    "rgb": [6, 42, 120]
  },
  "ceil": {
    "name": "Ceil",
    "rgb": [146, 161, 207]
  },
  "celadon": {
    "name": "Celadon",
    "rgb": [172, 225, 175]
  },
  "celadon_blue": {
    "name": "Celadon Blue",
    "rgb": [0, 123, 167]
  },
  "celadon_green": {
    "name": "Celadon Green",
    "rgb": [47, 132, 124]
  },
  "celeste_colour": {
    "name": "Celeste (Colour)",
    "rgb": [178, 255, 255]
  },
  "celestial_blue": {
    "name": "Celestial Blue",
    "rgb": [73, 151, 208]
  },
  "cerise": {
    "name": "Cerise",
    "rgb": [222, 49, 99]
  },
  "cerise_pink": {
    "name": "Cerise Pink",
    "rgb": [236, 59, 131]
  },
  "cerulean": {
    "name": "Cerulean",
    "rgb": [0, 123, 167]
  },
  "cerulean_blue": {
    "name": "Cerulean Blue",
    "rgb": [42, 82, 190]
  },
  "cerulean_frost": {
    "name": "Cerulean Frost",
    "rgb": [109, 155, 195]
  },
  "cg_blue": {
    "name": "Cg Blue",
    "rgb": [0, 122, 165]
  },
  "cg_red": {
    "name": "Cg Red",
    "rgb": [224, 60, 49]
  },
  "chamoisee": {
    "name": "Chamoisee",
    "rgb": [160, 120, 90]
  },
  "champagne": {
    "name": "Champagne",
    "rgb": [250, 214, 165]
  },
  "charcoal": {
    "name": "Charcoal",
    "rgb": [54, 69, 79]
  },
  "charm_pink": {
    "name": "Charm Pink",
    "rgb": [230, 143, 172]
  },
  "chartreuse_traditional": {
    "name": "Chartreuse (Traditional)",
    "rgb": [223, 255, 0]
  },
  "chartreuse_web": {
    "name": "Chartreuse (Web)",
    "rgb": [127, 255, 0]
  },
  "cherry": {
    "name": "Cherry",
    "rgb": [222, 49, 99]
  },
  "cherry_blossom_pink": {
    "name": "Cherry Blossom Pink",
    "rgb": [255, 183, 197]
  },
  "chestnut": {
    "name": "Chestnut",
    "rgb": [205, 92, 92]
  },
  "china_pink": {
    "name": "China Pink",
    "rgb": [222, 111, 161]
  },
  "china_rose": {
    "name": "China Rose",
    "rgb": [168, 81, 110]
  },
  "chinese_red": {
    "name": "Chinese Red",
    "rgb": [170, 56, 30]
  },
  "chocolate_traditional": {
    "name": "Chocolate (Traditional)",
    "rgb": [123, 63, 0]
  },
  "chocolate_web": {
    "name": "Chocolate (Web)",
    "rgb": [210, 105, 30]
  },
  "chrome_yellow": {
    "name": "Chrome Yellow",
    "rgb": [255, 167, 0]
  },
  "cinereous": {
    "name": "Cinereous",
    "rgb": [152, 129, 123]
  },
  "cinnabar": {
    "name": "Cinnabar",
    "rgb": [227, 66, 52]
  },
  "cinnamon": {
    "name": "Cinnamon",
    "rgb": [210, 105, 30]
  },
  "citrine": {
    "name": "Citrine",
    "rgb": [228, 208, 10]
  },
  "classic_rose": {
    "name": "Classic Rose",
    "rgb": [251, 204, 231]
  },
  "cobalt": {
    "name": "Cobalt",
    "rgb": [0, 71, 171]
  },
  "cocoa_brown": {
    "name": "Cocoa Brown",
    "rgb": [210, 105, 30]
  },
  "coffee": {
    "name": "Coffee",
    "rgb": [111, 78, 55]
  },
  "columbia_blue": {
    "name": "Columbia Blue",
    "rgb": [155, 221, 255]
  },
  "congo_pink": {
    "name": "Congo Pink",
    "rgb": [248, 131, 121]
  },
  "cool_black": {
    "name": "Cool Black",
    "rgb": [0, 46, 99]
  },
  "cool_grey": {
    "name": "Cool Grey",
    "rgb": [140, 146, 172]
  },
  "copper": {
    "name": "Copper",
    "rgb": [184, 115, 51]
  },
  "copper_crayola": {
    "name": "Copper (Crayola)",
    "rgb": [218, 138, 103]
  },
  "copper_penny": {
    "name": "Copper Penny",
    "rgb": [173, 111, 105]
  },
  "copper_red": {
    "name": "Copper Red",
    "rgb": [203, 109, 81]
  },
  "copper_rose": {
    "name": "Copper Rose",
    "rgb": [153, 102, 102]
  },
  "coquelicot": {
    "name": "Coquelicot",
    "rgb": [255, 56, 0]
  },
  "coral": {
    "name": "Coral",
    "rgb": [255, 127, 80]
  },
  "coral_pink": {
    "name": "Coral Pink",
    "rgb": [248, 131, 121]
  },
  "coral_red": {
    "name": "Coral Red",
    "rgb": [255, 64, 64]
  },
  "cordovan": {
    "name": "Cordovan",
    "rgb": [137, 63, 69]
  },
  "corn": {
    "name": "Corn",
    "rgb": [251, 236, 93]
  },
  "cornell_red": {
    "name": "Cornell Red",
    "rgb": [179, 27, 27]
  },
  "cornflower_blue": {
    "name": "Cornflower Blue",
    "rgb": [100, 149, 237]
  },
  "cornsilk": {
    "name": "Cornsilk",
    "rgb": [255, 248, 220]
  },
  "cosmic_latte": {
    "name": "Cosmic Latte",
    "rgb": [255, 248, 231]
  },
  "cotton_candy": {
    "name": "Cotton Candy",
    "rgb": [255, 188, 217]
  },
  "cream": {
    "name": "Cream",
    "rgb": [255, 253, 208]
  },
  "crimson": {
    "name": "Crimson",
    "rgb": [220, 20, 60]
  },
  "crimson_glory": {
    "name": "Crimson Glory",
    "rgb": [190, 0, 50]
  },
  "cyan": {
    "name": "Cyan",
    "rgb": [0, 255, 255]
  },
  "cyan_process": {
    "name": "Cyan (Process)",
    "rgb": [0, 183, 235]
  },
  "daffodil": {
    "name": "Daffodil",
    "rgb": [255, 255, 49]
  },
  "dandelion": {
    "name": "Dandelion",
    "rgb": [240, 225, 48]
  },
  "dark_blue": {
    "name": "Dark Blue",
    "rgb": [0, 0, 139]
  },
  "dark_brown": {
    "name": "Dark Brown",
    "rgb": [101, 67, 33]
  },
  "dark_byzantium": {
    "name": "Dark Byzantium",
    "rgb": [93, 57, 84]
  },
  "dark_candy_apple_red": {
    "name": "Dark Candy Apple Red",
    "rgb": [164, 0, 0]
  },
  "dark_cerulean": {
    "name": "Dark Cerulean",
    "rgb": [8, 69, 126]
  },
  "dark_chestnut": {
    "name": "Dark Chestnut",
    "rgb": [152, 105, 96]
  },
  "dark_coral": {
    "name": "Dark Coral",
    "rgb": [205, 91, 69]
  },
  "dark_cyan": {
    "name": "Dark Cyan",
    "rgb": [0, 139, 139]
  },
  "dark_electric_blue": {
    "name": "Dark Electric Blue",
    "rgb": [83, 104, 120]
  },
  "dark_goldenrod": {
    "name": "Dark Goldenrod",
    "rgb": [184, 134, 11]
  },
  "dark_gray": {
    "name": "Dark Gray",
    "rgb": [169, 169, 169]
  },
  "dark_green": {
    "name": "Dark Green",
    "rgb": [1, 50, 32]
  },
  "dark_imperial_blue": {
    "name": "Dark Imperial Blue",
    "rgb": [0, 65, 106]
  },
  "dark_jungle_green": {
    "name": "Dark Jungle Green",
    "rgb": [26, 36, 33]
  },
  "dark_khaki": {
    "name": "Dark Khaki",
    "rgb": [189, 183, 107]
  },
  "dark_lava": {
    "name": "Dark Lava",
    "rgb": [72, 60, 50]
  },
  "dark_lavender": {
    "name": "Dark Lavender",
    "rgb": [115, 79, 150]
  },
  "dark_magenta": {
    "name": "Dark Magenta",
    "rgb": [139, 0, 139]
  },
  "dark_midnight_blue": {
    "name": "Dark Midnight Blue",
    "rgb": [0, 51, 102]
  },
  "dark_olive_green": {
    "name": "Dark Olive Green",
    "rgb": [85, 107, 47]
  },
  "dark_orange": {
    "name": "Dark Orange",
    "rgb": [255, 140, 0]
  },
  "dark_orchid": {
    "name": "Dark Orchid",
    "rgb": [153, 50, 204]
  },
  "dark_pastel_blue": {
    "name": "Dark Pastel Blue",
    "rgb": [119, 158, 203]
  },
  "dark_pastel_green": {
    "name": "Dark Pastel Green",
    "rgb": [3, 192, 60]
  },
  "dark_pastel_purple": {
    "name": "Dark Pastel Purple",
    "rgb": [150, 111, 214]
  },
  "dark_pastel_red": {
    "name": "Dark Pastel Red",
    "rgb": [194, 59, 34]
  },
  "dark_pink": {
    "name": "Dark Pink",
    "rgb": [231, 84, 128]
  },
  "dark_powder_blue": {
    "name": "Dark Powder Blue",
    "rgb": [0, 51, 153]
  },
  "dark_raspberry": {
    "name": "Dark Raspberry",
    "rgb": [135, 38, 87]
  },
  "dark_red": {
    "name": "Dark Red",
    "rgb": [139, 0, 0]
  },
  "dark_salmon": {
    "name": "Dark Salmon",
    "rgb": [233, 150, 122]
  },
  "dark_scarlet": {
    "name": "Dark Scarlet",
    "rgb": [86, 3, 25]
  },
  "dark_sea_green": {
    "name": "Dark Sea Green",
    "rgb": [143, 188, 143]
  },
  "dark_sienna": {
    "name": "Dark Sienna",
    "rgb": [60, 20, 20]
  },
  "dark_slate_blue": {
    "name": "Dark Slate Blue",
    "rgb": [72, 61, 139]
  },
  "dark_slate_gray": {
    "name": "Dark Slate Gray",
    "rgb": [47, 79, 79]
  },
  "dark_spring_green": {
    "name": "Dark Spring Green",
    "rgb": [23, 114, 69]
  },
  "dark_tan": {
    "name": "Dark Tan",
    "rgb": [145, 129, 81]
  },
  "dark_tangerine": {
    "name": "Dark Tangerine",
    "rgb": [255, 168, 18]
  },
  "dark_taupe": {
    "name": "Dark Taupe",
    "rgb": [72, 60, 50]
  },
  "dark_terra_cotta": {
    "name": "Dark Terra Cotta",
    "rgb": [204, 78, 92]
  },
  "dark_turquoise": {
    "name": "Dark Turquoise",
    "rgb": [0, 206, 209]
  },
  "dark_violet": {
    "name": "Dark Violet",
    "rgb": [148, 0, 211]
  },
  "dark_yellow": {
    "name": "Dark Yellow",
    "rgb": [155, 135, 12]
  },
  "dartmouth_green": {
    "name": "Dartmouth Green",
    "rgb": [0, 112, 60]
  },
  "davy_s_grey": {
    "name": "Davy'S Grey",
    "rgb": [85, 85, 85]
  },
  "debian_red": {
    "name": "Debian Red",
    "rgb": [215, 10, 83]
  },
  "deep_carmine": {
    "name": "Deep Carmine",
    "rgb": [169, 32, 62]
  },
  "deep_carmine_pink": {
    "name": "Deep Carmine Pink",
    "rgb": [239, 48, 56]
  },
  "deep_carrot_orange": {
    "name": "Deep Carrot Orange",
    "rgb": [233, 105, 44]
  },
  "deep_cerise": {
    "name": "Deep Cerise",
    "rgb": [218, 50, 135]
  },
  "deep_champagne": {
    "name": "Deep Champagne",
    "rgb": [250, 214, 165]
  },
  "deep_chestnut": {
    "name": "Deep Chestnut",
    "rgb": [185, 78, 72]
  },
  "deep_coffee": {
    "name": "Deep Coffee",
    "rgb": [112, 66, 65]
  },
  "deep_fuchsia": {
    "name": "Deep Fuchsia",
    "rgb": [193, 84, 193]
  },
  "deep_jungle_green": {
    "name": "Deep Jungle Green",
    "rgb": [0, 75, 73]
  },
  "deep_lilac": {
    "name": "Deep Lilac",
    "rgb": [153, 85, 187]
  },
  "deep_magenta": {
    "name": "Deep Magenta",
    "rgb": [204, 0, 204]
  },
  "deep_peach": {
    "name": "Deep Peach",
    "rgb": [255, 203, 164]
  },
  "deep_pink": {
    "name": "Deep Pink",
    "rgb": [255, 20, 147]
  },
  "deep_ruby": {
    "name": "Deep Ruby",
    "rgb": [132, 63, 91]
  },
  "deep_saffron": {
    "name": "Deep Saffron",
    "rgb": [255, 153, 51]
  },
  "deep_sky_blue": {
    "name": "Deep Sky Blue",
    "rgb": [0, 191, 255]
  },
  "deep_tuscan_red": {
    "name": "Deep Tuscan Red",
    "rgb": [102, 66, 77]
  },
  "denim": {
    "name": "Denim",
    "rgb": [21, 96, 189]
  },
  "desert": {
    "name": "Desert",
    "rgb": [193, 154, 107]
  },
  "desert_sand": {
    "name": "Desert Sand",
    "rgb": [237, 201, 175]
  },
  "dim_gray": {
    "name": "Dim Gray",
    "rgb": [105, 105, 105]
  },
  "dodger_blue": {
    "name": "Dodger Blue",
    "rgb": [30, 144, 255]
  },
  "dogwood_rose": {
    "name": "Dogwood Rose",
    "rgb": [215, 24, 104]
  },
  "dollar_bill": {
    "name": "Dollar Bill",
    "rgb": [133, 187, 101]
  },
  "drab": {
    "name": "Drab",
    "rgb": [150, 113, 23]
  },
  "duke_blue": {
    "name": "Duke Blue",
    "rgb": [0, 0, 156]
  },
  "earth_yellow": {
    "name": "Earth Yellow",
    "rgb": [225, 169, 95]
  },
  "ebony": {
    "name": "Ebony",
    "rgb": [85, 93, 80]
  },
  "ecru": {
    "name": "Ecru",
    "rgb": [194, 178, 128]
  },
  "eggplant": {
    "name": "Eggplant",
    "rgb": [97, 64, 81]
  },
  "eggshell": {
    "name": "Eggshell",
    "rgb": [240, 234, 214]
  },
  "egyptian_blue": {
    "name": "Egyptian Blue",
    "rgb": [16, 52, 166]
  },
  "electric_blue": {
    "name": "Electric Blue",
    "rgb": [125, 249, 255]
  },
  "electric_crimson": {
    "name": "Electric Crimson",
    "rgb": [255, 0, 63]
  },
  "electric_cyan": {
    "name": "Electric Cyan",
    "rgb": [0, 255, 255]
  },
  "electric_green": {
    "name": "Electric Green",
    "rgb": [0, 255, 0]
  },
  "electric_indigo": {
    "name": "Electric Indigo",
    "rgb": [111, 0, 255]
  },
  "electric_lavender": {
    "name": "Electric Lavender",
    "rgb": [244, 187, 255]
  },
  "electric_lime": {
    "name": "Electric Lime",
    "rgb": [204, 255, 0]
  },
  "electric_purple": {
    "name": "Electric Purple",
    "rgb": [191, 0, 255]
  },
  "electric_ultramarine": {
    "name": "Electric Ultramarine",
    "rgb": [63, 0, 255]
  },
  "electric_violet": {
    "name": "Electric Violet",
    "rgb": [143, 0, 255]
  },
  "electric_yellow": {
    "name": "Electric Yellow",
    "rgb": [255, 255, 0]
  },
  "emerald": {
    "name": "Emerald",
    "rgb": [80, 200, 120]
  },
  "english_lavender": {
    "name": "English Lavender",
    "rgb": [180, 131, 149]
  },
  "eton_blue": {
    "name": "Eton Blue",
    "rgb": [150, 200, 162]
  },
  "fallow": {
    "name": "Fallow",
    "rgb": [193, 154, 107]
  },
  "falu_red": {
    "name": "Falu Red",
    "rgb": [128, 24, 24]
  },
  "fandango": {
    "name": "Fandango",
    "rgb": [181, 51, 137]
  },
  "fashion_fuchsia": {
    "name": "Fashion Fuchsia",
    "rgb": [244, 0, 161]
  },
  "fawn": {
    "name": "Fawn",
    "rgb": [229, 170, 112]
  },
  "feldgrau": {
    "name": "Feldgrau",
    "rgb": [77, 93, 83]
  },
  "fern_green": {
    "name": "Fern Green",
    "rgb": [79, 121, 66]
  },
  "ferrari_red": {
    "name": "Ferrari Red",
    "rgb": [255, 40, 0]
  },
  "field_drab": {
    "name": "Field Drab",
    "rgb": [108, 84, 30]
  },
  "fire_engine_red": {
    "name": "Fire Engine Red",
    "rgb": [206, 32, 41]
  },
  "firebrick": {
    "name": "Firebrick",
    "rgb": [178, 34, 34]
  },
  "flame": {
    "name": "Flame",
    "rgb": [226, 88, 34]
  },
  "flamingo_pink": {
    "name": "Flamingo Pink",
    "rgb": [252, 142, 172]
  },
  "flavescent": {
    "name": "Flavescent",
    "rgb": [247, 233, 142]
  },
  "flax": {
    "name": "Flax",
    "rgb": [238, 220, 130]
  },
  "floral_white": {
    "name": "Floral White",
    "rgb": [255, 250, 240]
  },
  "fluorescent_orange": {
    "name": "Fluorescent Orange",
    "rgb": [255, 191, 0]
  },
  "fluorescent_pink": {
    "name": "Fluorescent Pink",
    "rgb": [255, 20, 147]
  },
  "fluorescent_yellow": {
    "name": "Fluorescent Yellow",
    "rgb": [204, 255, 0]
  },
  "folly": {
    "name": "Folly",
    "rgb": [255, 0, 79]
  },
  "forest_green_traditional": {
    "name": "Forest Green (Traditional)",
    "rgb": [1, 68, 33]
  },
  "forest_green_web": {
    "name": "Forest Green (Web)",
    "rgb": [34, 139, 34]
  },
  "french_beige": {
    "name": "French Beige",
    "rgb": [166, 123, 91]
  },
  "french_blue": {
    "name": "French Blue",
    "rgb": [0, 114, 187]
  },
  "french_lilac": {
    "name": "French Lilac",
    "rgb": [134, 96, 142]
  },
  "french_lime": {
    "name": "French Lime",
    "rgb": [204, 255, 0]
  },
  "french_raspberry": {
    "name": "French Raspberry",
    "rgb": [199, 44, 72]
  },
  "french_rose": {
    "name": "French Rose",
    "rgb": [246, 74, 138]
  },
  "fuchsia": {
    "name": "Fuchsia",
    "rgb": [255, 0, 255]
  },
  "fuchsia_crayola": {
    "name": "Fuchsia (Crayola)",
    "rgb": [193, 84, 193]
  },
  "fuchsia_pink": {
    "name": "Fuchsia Pink",
    "rgb": [255, 119, 255]
  },
  "fuchsia_rose": {
    "name": "Fuchsia Rose",
    "rgb": [199, 67, 117]
  },
  "fulvous": {
    "name": "Fulvous",
    "rgb": [228, 132, 0]
  },
  "fuzzy_wuzzy": {
    "name": "Fuzzy Wuzzy",
    "rgb": [204, 102, 102]
  },
  "gainsboro": {
    "name": "Gainsboro",
    "rgb": [220, 220, 220]
  },
  "gamboge": {
    "name": "Gamboge",
    "rgb": [228, 155, 15]
  },
  "ghost_white": {
    "name": "Ghost White",
    "rgb": [248, 248, 255]
  },
  "ginger": {
    "name": "Ginger",
    "rgb": [176, 101, 0]
  },
  "glaucous": {
    "name": "Glaucous",
    "rgb": [96, 130, 182]
  },
  "glitter": {
    "name": "Glitter",
    "rgb": [230, 232, 250]
  },
  "gold_metallic": {
    "name": "Gold (Metallic)",
    "rgb": [212, 175, 55]
  },
  "gold_web_golden": {
    "name": "Gold (Web) (Golden)",
    "rgb": [255, 215, 0]
  },
  "golden_brown": {
    "name": "Golden Brown",
    "rgb": [153, 101, 21]
  },
  "golden_poppy": {
    "name": "Golden Poppy",
    "rgb": [252, 194, 0]
  },
  "golden_yellow": {
    "name": "Golden Yellow",
    "rgb": [255, 223, 0]
  },
  "goldenrod": {
    "name": "Goldenrod",
    "rgb": [218, 165, 32]
  },
  "granny_smith_apple": {
    "name": "Granny Smith Apple",
    "rgb": [168, 228, 160]
  },
  "gray": {
    "name": "Gray",
    "rgb": [128, 128, 128]
  },
  "gray_asparagus": {
    "name": "Gray-Asparagus",
    "rgb": [70, 89, 69]
  },
  "gray_html_css_gray": {
    "name": "Gray (Html/Css Gray)",
    "rgb": [128, 128, 128]
  },
  "gray_x11_gray": {
    "name": "Gray (X11 Gray)",
    "rgb": [190, 190, 190]
  },
  "green_color_wheel_x11_green": {
    "name": "Green (Color Wheel) (X11 Green)",
    "rgb": [0, 255, 0]
  },
  "green_crayola": {
    "name": "Green (Crayola)",
    "rgb": [28, 172, 120]
  },
  "green_html_css_green": {
    "name": "Green (Html/Css Green)",
    "rgb": [0, 128, 0]
  },
  "green_munsell": {
    "name": "Green (Munsell)",
    "rgb": [0, 168, 119]
  },
  "green_ncs": {
    "name": "Green (Ncs)",
    "rgb": [0, 159, 107]
  },
  "green_pigment": {
    "name": "Green (Pigment)",
    "rgb": [0, 165, 80]
  },
  "green_ryb": {
    "name": "Green (Ryb)",
    "rgb": [102, 176, 50]
  },
  "green_yellow": {
    "name": "Green-Yellow",
    "rgb": [173, 255, 47]
  },
  "grullo": {
    "name": "Grullo",
    "rgb": [169, 154, 134]
  },
  "guppie_green": {
    "name": "Guppie Green",
    "rgb": [0, 255, 127]
  },
  "halay_be": {
    "name": "Halayà úBe",
    "rgb": [102, 56, 84]
  },
  "han_blue": {
    "name": "Han Blue",
    "rgb": [68, 108, 207]
  },
  "han_purple": {
    "name": "Han Purple",
    "rgb": [82, 24, 250]
  },
  "hansa_yellow": {
    "name": "Hansa Yellow",
    "rgb": [233, 214, 107]
  },
  "harlequin": {
    "name": "Harlequin",
    "rgb": [63, 255, 0]
  },
  "harvard_crimson": {
    "name": "Harvard Crimson",
    "rgb": [201, 0, 22]
  },
  "harvest_gold": {
    "name": "Harvest Gold",
    "rgb": [218, 145, 0]
  },
  "heart_gold": {
    "name": "Heart Gold",
    "rgb": [128, 128, 0]
  },
  "heliotrope": {
    "name": "Heliotrope",
    "rgb": [223, 115, 255]
  },
  "hollywood_cerise": {
    "name": "Hollywood Cerise",
    "rgb": [244, 0, 161]
  },
  "honeydew": {
    "name": "Honeydew",
    "rgb": [240, 255, 240]
  },
  "honolulu_blue": {
    "name": "Honolulu Blue",
    "rgb": [0, 127, 191]
  },
  "hooker_s_green": {
    "name": "Hooker'S Green",
    "rgb": [73, 121, 107]
  },
  "hot_magenta": {
    "name": "Hot Magenta",
    "rgb": [255, 29, 206]
  },
  "hot_pink": {
    "name": "Hot Pink",
    "rgb": [255, 105, 180]
  },
  "hunter_green": {
    "name": "Hunter Green",
    "rgb": [53, 94, 59]
  },
  "iceberg": {
    "name": "Iceberg",
    "rgb": [113, 166, 210]
  },
  "icterine": {
    "name": "Icterine",
    "rgb": [252, 247, 94]
  },
  "imperial_blue": {
    "name": "Imperial Blue",
    "rgb": [0, 35, 149]
  },
  "inchworm": {
    "name": "Inchworm",
    "rgb": [178, 236, 93]
  },
  "india_green": {
    "name": "India Green",
    "rgb": [19, 136, 8]
  },
  "indian_red": {
    "name": "Indian Red",
    "rgb": [205, 92, 92]
  },
  "indian_yellow": {
    "name": "Indian Yellow",
    "rgb": [227, 168, 87]
  },
  "indigo": {
    "name": "Indigo",
    "rgb": [111, 0, 255]
  },
  "indigo_dye": {
    "name": "Indigo (Dye)",
    "rgb": [0, 65, 106]
  },
  "indigo_web": {
    "name": "Indigo (Web)",
    "rgb": [75, 0, 130]
  },
  "international_klein_blue": {
    "name": "International Klein Blue",
    "rgb": [0, 47, 167]
  },
  "international_orange_aerospace": {
    "name": "International Orange (Aerospace)",
    "rgb": [255, 79, 0]
  },
  "international_orange_engineering": {
    "name": "International Orange (Engineering)",
    "rgb": [186, 22, 12]
  },
  "international_orange_golden_gate_bridge": {
    "name": "International Orange (Golden Gate Bridge)",
    "rgb": [192, 54, 44]
  },
  "iris": {
    "name": "Iris",
    "rgb": [90, 79, 207]
  },
  "isabelline": {
    "name": "Isabelline",
    "rgb": [244, 240, 236]
  },
  "islamic_green": {
    "name": "Islamic Green",
    "rgb": [0, 144, 0]
  },
  "ivory": {
    "name": "Ivory",
    "rgb": [255, 255, 240]
  },
  "jade": {
    "name": "Jade",
    "rgb": [0, 168, 107]
  },
  "jasmine": {
    "name": "Jasmine",
    "rgb": [248, 222, 126]
  },
  "jasper": {
    "name": "Jasper",
    "rgb": [215, 59, 62]
  },
  "jazzberry_jam": {
    "name": "Jazzberry Jam",
    "rgb": [165, 11, 94]
  },
  "jet": {
    "name": "Jet",
    "rgb": [52, 52, 52]
  },
  "jonquil": {
    "name": "Jonquil",
    "rgb": [250, 218, 94]
  },
  "june_bud": {
    "name": "June Bud",
    "rgb": [189, 218, 87]
  },
  "jungle_green": {
    "name": "Jungle Green",
    "rgb": [41, 171, 135]
  },
  "kelly_green": {
    "name": "Kelly Green",
    "rgb": [76, 187, 23]
  },
  "kenyan_copper": {
    "name": "Kenyan Copper",
    "rgb": [124, 28, 5]
  },
  "khaki_html_css_khaki": {
    "name": "Khaki (Html/Css) (Khaki)",
    "rgb": [195, 176, 145]
  },
  "khaki_x11_light_khaki": {
    "name": "Khaki (X11) (Light Khaki)",
    "rgb": [240, 230, 140]
  },
  "ku_crimson": {
    "name": "Ku Crimson",
    "rgb": [232, 0, 13]
  },
  "la_salle_green": {
    "name": "La Salle Green",
    "rgb": [8, 120, 48]
  },
  "languid_lavender": {
    "name": "Languid Lavender",
    "rgb": [214, 202, 221]
  },
  "lapis_lazuli": {
    "name": "Lapis Lazuli",
    "rgb": [38, 97, 156]
  },
  "laser_lemon": {
    "name": "Laser Lemon",
    "rgb": [254, 254, 34]
  },
  "laurel_green": {
    "name": "Laurel Green",
    "rgb": [169, 186, 157]
  },
  "lava": {
    "name": "Lava",
    "rgb": [207, 16, 32]
  },
  "lavender_blue": {
    "name": "Lavender Blue",
    "rgb": [204, 204, 255]
  },
  "lavender_blush": {
    "name": "Lavender Blush",
    "rgb": [255, 240, 245]
  },
  "lavender_floral": {
    "name": "Lavender (Floral)",
    "rgb": [181, 126, 220]
  },
  "lavender_gray": {
    "name": "Lavender Gray",
    "rgb": [196, 195, 208]
  },
  "lavender_indigo": {
    "name": "Lavender Indigo",
    "rgb": [148, 87, 235]
  },
  "lavender_magenta": {
    "name": "Lavender Magenta",
    "rgb": [238, 130, 238]
  },
  "lavender_mist": {
    "name": "Lavender Mist",
    "rgb": [230, 230, 250]
  },
  "lavender_pink": {
    "name": "Lavender Pink",
    "rgb": [251, 174, 210]
  },
  "lavender_purple": {
    "name": "Lavender Purple",
    "rgb": [150, 123, 182]
  },
  "lavender_rose": {
    "name": "Lavender Rose",
    "rgb": [251, 160, 227]
  },
  "lavender_web": {
    "name": "Lavender (Web)",
    "rgb": [230, 230, 250]
  },
  "lawn_green": {
    "name": "Lawn Green",
    "rgb": [124, 252, 0]
  },
  "lemon": {
    "name": "Lemon",
    "rgb": [255, 247, 0]
  },
  "lemon_chiffon": {
    "name": "Lemon Chiffon",
    "rgb": [255, 250, 205]
  },
  "lemon_lime": {
    "name": "Lemon Lime",
    "rgb": [227, 255, 0]
  },
  "licorice": {
    "name": "Licorice",
    "rgb": [26, 17, 16]
  },
  "light_apricot": {
    "name": "Light Apricot",
    "rgb": [253, 213, 177]
  },
  "light_blue": {
    "name": "Light Blue",
    "rgb": [173, 216, 230]
  },
  "light_brown": {
    "name": "Light Brown",
    "rgb": [181, 101, 29]
  },
  "light_carmine_pink": {
    "name": "Light Carmine Pink",
    "rgb": [230, 103, 113]
  },
  "light_coral": {
    "name": "Light Coral",
    "rgb": [240, 128, 128]
  },
  "light_cornflower_blue": {
    "name": "Light Cornflower Blue",
    "rgb": [147, 204, 234]
  },
  "light_crimson": {
    "name": "Light Crimson",
    "rgb": [245, 105, 145]
  },
  "light_cyan": {
    "name": "Light Cyan",
    "rgb": [224, 255, 255]
  },
  "light_fuchsia_pink": {
    "name": "Light Fuchsia Pink",
    "rgb": [249, 132, 239]
  },
  "light_goldenrod_yellow": {
    "name": "Light Goldenrod Yellow",
    "rgb": [250, 250, 210]
  },
  "light_gray": {
    "name": "Light Gray",
    "rgb": [211, 211, 211]
  },
  "light_green": {
    "name": "Light Green",
    "rgb": [144, 238, 144]
  },
  "light_khaki": {
    "name": "Light Khaki",
    "rgb": [240, 230, 140]
  },
  "light_pastel_purple": {
    "name": "Light Pastel Purple",
    "rgb": [177, 156, 217]
  },
  "light_pink": {
    "name": "Light Pink",
    "rgb": [255, 182, 193]
  },
  "light_red_ochre": {
    "name": "Light Red Ochre",
    "rgb": [233, 116, 81]
  },
  "light_salmon": {
    "name": "Light Salmon",
    "rgb": [255, 160, 122]
  },
  "light_salmon_pink": {
    "name": "Light Salmon Pink",
    "rgb": [255, 153, 153]
  },
  "light_sea_green": {
    "name": "Light Sea Green",
    "rgb": [32, 178, 170]
  },
  "light_sky_blue": {
    "name": "Light Sky Blue",
    "rgb": [135, 206, 250]
  },
  "light_slate_gray": {
    "name": "Light Slate Gray",
    "rgb": [119, 136, 153]
  },
  "light_taupe": {
    "name": "Light Taupe",
    "rgb": [179, 139, 109]
  },
  "light_thulian_pink": {
    "name": "Light Thulian Pink",
    "rgb": [230, 143, 172]
  },
  "light_yellow": {
    "name": "Light Yellow",
    "rgb": [255, 255, 224]
  },
  "lilac": {
    "name": "Lilac",
    "rgb": [200, 162, 200]
  },
  "lime_color_wheel": {
    "name": "Lime (Color Wheel)",
    "rgb": [191, 255, 0]
  },
  "lime_green": {
    "name": "Lime Green",
    "rgb": [50, 205, 50]
  },
  "lime_web_x11_green": {
    "name": "Lime (Web) (X11 Green)",
    "rgb": [0, 255, 0]
  },
  "limerick": {
    "name": "Limerick",
    "rgb": [157, 194, 9]
  },
  "lincoln_green": {
    "name": "Lincoln Green",
    "rgb": [25, 89, 5]
  },
  "linen": {
    "name": "Linen",
    "rgb": [250, 240, 230]
  },
  "lion": {
    "name": "Lion",
    "rgb": [193, 154, 107]
  },
  "little_boy_blue": {
    "name": "Little Boy Blue",
    "rgb": [108, 160, 220]
  },
  "liver": {
    "name": "Liver",
    "rgb": [83, 75, 79]
  },
  "lust": {
    "name": "Lust",
    "rgb": [230, 32, 32]
  },
  "magenta": {
    "name": "Magenta",
    "rgb": [255, 0, 255]
  },
  "magenta_dye": {
    "name": "Magenta (Dye)",
    "rgb": [202, 31, 123]
  },
  "magenta_process": {
    "name": "Magenta (Process)",
    "rgb": [255, 0, 144]
  },
  "magic_mint": {
    "name": "Magic Mint",
    "rgb": [170, 240, 209]
  },
  "magnolia": {
    "name": "Magnolia",
    "rgb": [248, 244, 255]
  },
  "mahogany": {
    "name": "Mahogany",
    "rgb": [192, 64, 0]
  },
  "maize": {
    "name": "Maize",
    "rgb": [251, 236, 93]
  },
  "majorelle_blue": {
    "name": "Majorelle Blue",
    "rgb": [96, 80, 220]
  },
  "malachite": {
    "name": "Malachite",
    "rgb": [11, 218, 81]
  },
  "manatee": {
    "name": "Manatee",
    "rgb": [151, 154, 170]
  },
  "mango_tango": {
    "name": "Mango Tango",
    "rgb": [255, 130, 67]
  },
  "mantis": {
    "name": "Mantis",
    "rgb": [116, 195, 101]
  },
  "mardi_gras": {
    "name": "Mardi Gras",
    "rgb": [136, 0, 133]
  },
  "maroon_crayola": {
    "name": "Maroon (Crayola)",
    "rgb": [195, 33, 72]
  },
  "maroon_html_css": {
    "name": "Maroon (Html/Css)",
    "rgb": [128, 0, 0]
  },
  "maroon_x11": {
    "name": "Maroon (X11)",
    "rgb": [176, 48, 96]
  },
  "mauve": {
    "name": "Mauve",
    "rgb": [224, 176, 255]
  },
  "mauve_taupe": {
    "name": "Mauve Taupe",
    "rgb": [145, 95, 109]
  },
  "mauvelous": {
    "name": "Mauvelous",
    "rgb": [239, 152, 170]
  },
  "maya_blue": {
    "name": "Maya Blue",
    "rgb": [115, 194, 251]
  },
  "meat_brown": {
    "name": "Meat Brown",
    "rgb": [229, 183, 59]
  },
  "medium_aquamarine": {
    "name": "Medium Aquamarine",
    "rgb": [102, 221, 170]
  },
  "medium_blue": {
    "name": "Medium Blue",
    "rgb": [0, 0, 205]
  },
  "medium_candy_apple_red": {
    "name": "Medium Candy Apple Red",
    "rgb": [226, 6, 44]
  },
  "medium_carmine": {
    "name": "Medium Carmine",
    "rgb": [175, 64, 53]
  },
  "medium_champagne": {
    "name": "Medium Champagne",
    "rgb": [243, 229, 171]
  },
  "medium_electric_blue": {
    "name": "Medium Electric Blue",
    "rgb": [3, 80, 150]
  },
  "medium_jungle_green": {
    "name": "Medium Jungle Green",
    "rgb": [28, 53, 45]
  },
  "medium_lavender_magenta": {
    "name": "Medium Lavender Magenta",
    "rgb": [221, 160, 221]
  },
  "medium_orchid": {
    "name": "Medium Orchid",
    "rgb": [186, 85, 211]
  },
  "medium_persian_blue": {
    "name": "Medium Persian Blue",
    "rgb": [0, 103, 165]
  },
  "medium_purple": {
    "name": "Medium Purple",
    "rgb": [147, 112, 219]
  },
  "medium_red_violet": {
    "name": "Medium Red-Violet",
    "rgb": [187, 51, 133]
  },
  "medium_ruby": {
    "name": "Medium Ruby",
    "rgb": [170, 64, 105]
  },
  "medium_sea_green": {
    "name": "Medium Sea Green",
    "rgb": [60, 179, 113]
  },
  "medium_slate_blue": {
    "name": "Medium Slate Blue",
    "rgb": [123, 104, 238]
  },
  "medium_spring_bud": {
    "name": "Medium Spring Bud",
    "rgb": [201, 220, 135]
  },
  "medium_spring_green": {
    "name": "Medium Spring Green",
    "rgb": [0, 250, 154]
  },
  "medium_taupe": {
    "name": "Medium Taupe",
    "rgb": [103, 76, 71]
  },
  "medium_turquoise": {
    "name": "Medium Turquoise",
    "rgb": [72, 209, 204]
  },
  "medium_tuscan_red": {
    "name": "Medium Tuscan Red",
    "rgb": [121, 68, 59]
  },
  "medium_vermilion": {
    "name": "Medium Vermilion",
    "rgb": [217, 96, 59]
  },
  "medium_violet_red": {
    "name": "Medium Violet-Red",
    "rgb": [199, 21, 133]
  },
  "mellow_apricot": {
    "name": "Mellow Apricot",
    "rgb": [248, 184, 120]
  },
  "mellow_yellow": {
    "name": "Mellow Yellow",
    "rgb": [248, 222, 126]
  },
  "melon": {
    "name": "Melon",
    "rgb": [253, 188, 180]
  },
  "midnight_blue": {
    "name": "Midnight Blue",
    "rgb": [25, 25, 112]
  },
  "midnight_green_eagle_green": {
    "name": "Midnight Green (Eagle Green)",
    "rgb": [0, 73, 83]
  },
  "mikado_yellow": {
    "name": "Mikado Yellow",
    "rgb": [255, 196, 12]
  },
  "mint": {
    "name": "Mint",
    "rgb": [62, 180, 137]
  },
  "mint_cream": {
    "name": "Mint Cream",
    "rgb": [245, 255, 250]
  },
  "mint_green": {
    "name": "Mint Green",
    "rgb": [152, 255, 152]
  },
  "misty_rose": {
    "name": "Misty Rose",
    "rgb": [255, 228, 225]
  },
  "moccasin": {
    "name": "Moccasin",
    "rgb": [250, 235, 215]
  },
  "mode_beige": {
    "name": "Mode Beige",
    "rgb": [150, 113, 23]
  },
  "moonstone_blue": {
    "name": "Moonstone Blue",
    "rgb": [115, 169, 194]
  },
  "mordant_red_19": {
    "name": "Mordant Red 19",
    "rgb": [174, 12, 0]
  },
  "moss_green": {
    "name": "Moss Green",
    "rgb": [173, 223, 173]
  },
  "mountain_meadow": {
    "name": "Mountain Meadow",
    "rgb": [48, 186, 143]
  },
  "mountbatten_pink": {
    "name": "Mountbatten Pink",
    "rgb": [153, 122, 141]
  },
  "msu_green": {
    "name": "Msu Green",
    "rgb": [24, 69, 59]
  },
  "mulberry": {
    "name": "Mulberry",
    "rgb": [197, 75, 140]
  },
  "mustard": {
    "name": "Mustard",
    "rgb": [255, 219, 88]
  },
  "myrtle": {
    "name": "Myrtle",
    "rgb": [33, 66, 30]
  },
  "nadeshiko_pink": {
    "name": "Nadeshiko Pink",
    "rgb": [246, 173, 198]
  },
  "napier_green": {
    "name": "Napier Green",
    "rgb": [42, 128, 0]
  },
  "naples_yellow": {
    "name": "Naples Yellow",
    "rgb": [250, 218, 94]
  },
  "navajo_white": {
    "name": "Navajo White",
    "rgb": [255, 222, 173]
  },
  "navy_blue": {
    "name": "Navy Blue",
    "rgb": [0, 0, 128]
  },
  "neon_carrot": {
    "name": "Neon Carrot",
    "rgb": [255, 163, 67]
  },
  "neon_fuchsia": {
    "name": "Neon Fuchsia",
    "rgb": [254, 65, 100]
  },
  "neon_green": {
    "name": "Neon Green",
    "rgb": [57, 255, 20]
  },
  "new_york_pink": {
    "name": "New York Pink",
    "rgb": [215, 131, 127]
  },
  "non_photo_blue": {
    "name": "Non-Photo Blue",
    "rgb": [164, 221, 237]
  },
  "north_texas_green": {
    "name": "North Texas Green",
    "rgb": [5, 144, 51]
  },
  "ocean_boat_blue": {
    "name": "Ocean Boat Blue",
    "rgb": [0, 119, 190]
  },
  "ochre": {
    "name": "Ochre",
    "rgb": [204, 119, 34]
  },
  "office_green": {
    "name": "Office Green",
    "rgb": [0, 128, 0]
  },
  "old_gold": {
    "name": "Old Gold",
    "rgb": [207, 181, 59]
  },
  "old_lace": {
    "name": "Old Lace",
    "rgb": [253, 245, 230]
  },
  "old_lavender": {
    "name": "Old Lavender",
    "rgb": [121, 104, 120]
  },
  "old_mauve": {
    "name": "Old Mauve",
    "rgb": [103, 49, 71]
  },
  "old_rose": {
    "name": "Old Rose",
    "rgb": [192, 128, 129]
  },
  "olive": {
    "name": "Olive",
    "rgb": [128, 128, 0]
  },
  "olive_drab_7": {
    "name": "Olive Drab #7",
    "rgb": [60, 52, 31]
  },
  "olive_drab_web_olive_drab_3": {
    "name": "Olive Drab (Web) (Olive Drab #3)",
    "rgb": [107, 142, 35]
  },
  "olivine": {
    "name": "Olivine",
    "rgb": [154, 185, 115]
  },
  "onyx": {
    "name": "Onyx",
    "rgb": [53, 56, 57]
  },
  "opera_mauve": {
    "name": "Opera Mauve",
    "rgb": [183, 132, 167]
  },
  "orange_color_wheel": {
    "name": "Orange (Color Wheel)",
    "rgb": [255, 127, 0]
  },
  "orange_peel": {
    "name": "Orange Peel",
    "rgb": [255, 159, 0]
  },
  "orange_red": {
    "name": "Orange-Red",
    "rgb": [255, 69, 0]
  },
  "orange_ryb": {
    "name": "Orange (Ryb)",
    "rgb": [251, 153, 2]
  },
  "orange_web_color": {
    "name": "Orange (Web Color)",
    "rgb": [255, 165, 0]
  },
  "orchid": {
    "name": "Orchid",
    "rgb": [218, 112, 214]
  },
  "otter_brown": {
    "name": "Otter Brown",
    "rgb": [101, 67, 33]
  },
  "ou_crimson_red": {
    "name": "Ou Crimson Red",
    "rgb": [153, 0, 0]
  },
  "outer_space": {
    "name": "Outer Space",
    "rgb": [65, 74, 76]
  },
  "outrageous_orange": {
    "name": "Outrageous Orange",
    "rgb": [255, 110, 74]
  },
  "oxford_blue": {
    "name": "Oxford Blue",
    "rgb": [0, 33, 71]
  },
  "pakistan_green": {
    "name": "Pakistan Green",
    "rgb": [0, 102, 0]
  },
  "palatinate_blue": {
    "name": "Palatinate Blue",
    "rgb": [39, 59, 226]
  },
  "palatinate_purple": {
    "name": "Palatinate Purple",
    "rgb": [104, 40, 96]
  },
  "pale_aqua": {
    "name": "Pale Aqua",
    "rgb": [188, 212, 230]
  },
  "pale_blue": {
    "name": "Pale Blue",
    "rgb": [175, 238, 238]
  },
  "pale_brown": {
    "name": "Pale Brown",
    "rgb": [152, 118, 84]
  },
  "pale_carmine": {
    "name": "Pale Carmine",
    "rgb": [175, 64, 53]
  },
  "pale_cerulean": {
    "name": "Pale Cerulean",
    "rgb": [155, 196, 226]
  },
  "pale_chestnut": {
    "name": "Pale Chestnut",
    "rgb": [221, 173, 175]
  },
  "pale_copper": {
    "name": "Pale Copper",
    "rgb": [218, 138, 103]
  },
  "pale_cornflower_blue": {
    "name": "Pale Cornflower Blue",
    "rgb": [171, 205, 239]
  },
  "pale_gold": {
    "name": "Pale Gold",
    "rgb": [230, 190, 138]
  },
  "pale_goldenrod": {
    "name": "Pale Goldenrod",
    "rgb": [238, 232, 170]
  },
  "pale_green": {
    "name": "Pale Green",
    "rgb": [152, 251, 152]
  },
  "pale_lavender": {
    "name": "Pale Lavender",
    "rgb": [220, 208, 255]
  },
  "pale_magenta": {
    "name": "Pale Magenta",
    "rgb": [249, 132, 229]
  },
  "pale_pink": {
    "name": "Pale Pink",
    "rgb": [250, 218, 221]
  },
  "pale_plum": {
    "name": "Pale Plum",
    "rgb": [221, 160, 221]
  },
  "pale_red_violet": {
    "name": "Pale Red-Violet",
    "rgb": [219, 112, 147]
  },
  "pale_robin_egg_blue": {
    "name": "Pale Robin Egg Blue",
    "rgb": [150, 222, 209]
  },
  "pale_silver": {
    "name": "Pale Silver",
    "rgb": [201, 192, 187]
  },
  "pale_spring_bud": {
    "name": "Pale Spring Bud",
    "rgb": [236, 235, 189]
  },
  "pale_taupe": {
    "name": "Pale Taupe",
    "rgb": [188, 152, 126]
  },
  "pale_violet_red": {
    "name": "Pale Violet-Red",
    "rgb": [219, 112, 147]
  },
  "pansy_purple": {
    "name": "Pansy Purple",
    "rgb": [120, 24, 74]
  },
  "papaya_whip": {
    "name": "Papaya Whip",
    "rgb": [255, 239, 213]
  },
  "paris_green": {
    "name": "Paris Green",
    "rgb": [80, 200, 120]
  },
  "pastel_blue": {
    "name": "Pastel Blue",
    "rgb": [174, 198, 207]
  },
  "pastel_brown": {
    "name": "Pastel Brown",
    "rgb": [131, 105, 83]
  },
  "pastel_gray": {
    "name": "Pastel Gray",
    "rgb": [207, 207, 196]
  },
  "pastel_green": {
    "name": "Pastel Green",
    "rgb": [119, 221, 119]
  },
  "pastel_magenta": {
    "name": "Pastel Magenta",
    "rgb": [244, 154, 194]
  },
  "pastel_orange": {
    "name": "Pastel Orange",
    "rgb": [255, 179, 71]
  },
  "pastel_pink": {
    "name": "Pastel Pink",
    "rgb": [222, 165, 164]
  },
  "pastel_purple": {
    "name": "Pastel Purple",
    "rgb": [179, 158, 181]
  },
  "pastel_red": {
    "name": "Pastel Red",
    "rgb": [255, 105, 97]
  },
  "pastel_violet": {
    "name": "Pastel Violet",
    "rgb": [203, 153, 201]
  },
  "pastel_yellow": {
    "name": "Pastel Yellow",
    "rgb": [253, 253, 150]
  },
  "patriarch": {
    "name": "Patriarch",
    "rgb": [128, 0, 128]
  },
  "payne_s_grey": {
    "name": "Payne'S Grey",
    "rgb": [83, 104, 120]
  },
  "peach": {
    "name": "Peach",
    "rgb": [255, 229, 180]
  },
  "peach_crayola": {
    "name": "Peach (Crayola)",
    "rgb": [255, 203, 164]
  },
  "peach_orange": {
    "name": "Peach-Orange",
    "rgb": [255, 204, 153]
  },
  "peach_puff": {
    "name": "Peach Puff",
    "rgb": [255, 218, 185]
  },
  "peach_yellow": {
    "name": "Peach-Yellow",
    "rgb": [250, 223, 173]
  },
  "pear": {
    "name": "Pear",
    "rgb": [209, 226, 49]
  },
  "pearl": {
    "name": "Pearl",
    "rgb": [234, 224, 200]
  },
  "pearl_aqua": {
    "name": "Pearl Aqua",
    "rgb": [136, 216, 192]
  },
  "pearly_purple": {
    "name": "Pearly Purple",
    "rgb": [183, 104, 162]
  },
  "peridot": {
    "name": "Peridot",
    "rgb": [230, 226, 0]
  },
  "periwinkle": {
    "name": "Periwinkle",
    "rgb": [204, 204, 255]
  },
  "persian_blue": {
    "name": "Persian Blue",
    "rgb": [28, 57, 187]
  },
  "persian_green": {
    "name": "Persian Green",
    "rgb": [0, 166, 147]
  },
  "persian_indigo": {
    "name": "Persian Indigo",
    "rgb": [50, 18, 122]
  },
  "persian_orange": {
    "name": "Persian Orange",
    "rgb": [217, 144, 88]
  },
  "persian_pink": {
    "name": "Persian Pink",
    "rgb": [247, 127, 190]
  },
  "persian_plum": {
    "name": "Persian Plum",
    "rgb": [112, 28, 28]
  },
  "persian_red": {
    "name": "Persian Red",
    "rgb": [204, 51, 51]
  },
  "persian_rose": {
    "name": "Persian Rose",
    "rgb": [254, 40, 162]
  },
  "persimmon": {
    "name": "Persimmon",
    "rgb": [236, 88, 0]
  },
  "peru": {
    "name": "Peru",
    "rgb": [205, 133, 63]
  },
  "phlox": {
    "name": "Phlox",
    "rgb": [223, 0, 255]
  },
  "phthalo_blue": {
    "name": "Phthalo Blue",
    "rgb": [0, 15, 137]
  },
  "phthalo_green": {
    "name": "Phthalo Green",
    "rgb": [18, 53, 36]
  },
  "piggy_pink": {
    "name": "Piggy Pink",
    "rgb": [253, 221, 230]
  },
  "pine_green": {
    "name": "Pine Green",
    "rgb": [1, 121, 111]
  },
  "pink": {
    "name": "Pink",
    "rgb": [255, 192, 203]
  },
  "pink_lace": {
    "name": "Pink Lace",
    "rgb": [255, 221, 244]
  },
  "pink_orange": {
    "name": "Pink-Orange",
    "rgb": [255, 153, 102]
  },
  "pink_pearl": {
    "name": "Pink Pearl",
    "rgb": [231, 172, 207]
  },
  "pink_sherbet": {
    "name": "Pink Sherbet",
    "rgb": [247, 143, 167]
  },
  "pistachio": {
    "name": "Pistachio",
    "rgb": [147, 197, 114]
  },
  "platinum": {
    "name": "Platinum",
    "rgb": [229, 228, 226]
  },
  "plum_traditional": {
    "name": "Plum (Traditional)",
    "rgb": [142, 69, 133]
  },
  "plum_web": {
    "name": "Plum (Web)",
    "rgb": [221, 160, 221]
  },
  "portland_orange": {
    "name": "Portland Orange",
    "rgb": [255, 90, 54]
  },
  "powder_blue_web": {
    "name": "Powder Blue (Web)",
    "rgb": [176, 224, 230]
  },
  "princeton_orange": {
    "name": "Princeton Orange",
    "rgb": [255, 143, 0]
  },
  "prune": {
    "name": "Prune",
    "rgb": [112, 28, 28]
  },
  "prussian_blue": {
    "name": "Prussian Blue",
    "rgb": [0, 49, 83]
  },
  "psychedelic_purple": {
    "name": "Psychedelic Purple",
    "rgb": [223, 0, 255]
  },
  "puce": {
    "name": "Puce",
    "rgb": [204, 136, 153]
  },
  "pumpkin": {
    "name": "Pumpkin",
    "rgb": [255, 117, 24]
  },
  "purple_heart": {
    "name": "Purple Heart",
    "rgb": [105, 53, 156]
  },
  "purple_html_css": {
    "name": "Purple (Html/Css)",
    "rgb": [128, 0, 128]
  },
  "purple_mountain_majesty": {
    "name": "Purple Mountain Majesty",
    "rgb": [150, 120, 182]
  },
  "purple_munsell": {
    "name": "Purple (Munsell)",
    "rgb": [159, 0, 197]
  },
  "purple_pizzazz": {
    "name": "Purple Pizzazz",
    "rgb": [254, 78, 218]
  },
  "purple_taupe": {
    "name": "Purple Taupe",
    "rgb": [80, 64, 77]
  },
  "purple_x11": {
    "name": "Purple (X11)",
    "rgb": [160, 32, 240]
  },
  "quartz": {
    "name": "Quartz",
    "rgb": [81, 72, 79]
  },
  "rackley": {
    "name": "Rackley",
    "rgb": [93, 138, 168]
  },
  "radical_red": {
    "name": "Radical Red",
    "rgb": [255, 53, 94]
  },
  "rajah": {
    "name": "Rajah",
    "rgb": [251, 171, 96]
  },
  "raspberry": {
    "name": "Raspberry",
    "rgb": [227, 11, 93]
  },
  "raspberry_glace": {
    "name": "Raspberry Glace",
    "rgb": [145, 95, 109]
  },
  "raspberry_pink": {
    "name": "Raspberry Pink",
    "rgb": [226, 80, 152]
  },
  "raspberry_rose": {
    "name": "Raspberry Rose",
    "rgb": [179, 68, 108]
  },
  "raw_umber": {
    "name": "Raw Umber",
    "rgb": [130, 102, 68]
  },
  "razzle_dazzle_rose": {
    "name": "Razzle Dazzle Rose",
    "rgb": [255, 51, 204]
  },
  "razzmatazz": {
    "name": "Razzmatazz",
    "rgb": [227, 37, 107]
  },
  "red": {
    "name": "Red",
    "rgb": [255, 0, 0]
  },
  "red_brown": {
    "name": "Red-Brown",
    "rgb": [165, 42, 42]
  },
  "red_devil": {
    "name": "Red Devil",
    "rgb": [134, 1, 17]
  },
  "red_munsell": {
    "name": "Red (Munsell)",
    "rgb": [242, 0, 60]
  },
  "red_ncs": {
    "name": "Red (Ncs)",
    "rgb": [196, 2, 51]
  },
  "red_orange": {
    "name": "Red-Orange",
    "rgb": [255, 83, 73]
  },
  "red_pigment": {
    "name": "Red (Pigment)",
    "rgb": [237, 28, 36]
  },
  "red_ryb": {
    "name": "Red (Ryb)",
    "rgb": [254, 39, 18]
  },
  "red_violet": {
    "name": "Red-Violet",
    "rgb": [199, 21, 133]
  },
  "redwood": {
    "name": "Redwood",
    "rgb": [171, 78, 82]
  },
  "regalia": {
    "name": "Regalia",
    "rgb": [82, 45, 128]
  },
  "resolution_blue": {
    "name": "Resolution Blue",
    "rgb": [0, 35, 135]
  },
  "rich_black": {
    "name": "Rich Black",
    "rgb": [0, 64, 64]
  },
  "rich_brilliant_lavender": {
    "name": "Rich Brilliant Lavender",
    "rgb": [241, 167, 254]
  },
  "rich_carmine": {
    "name": "Rich Carmine",
    "rgb": [215, 0, 64]
  },
  "rich_electric_blue": {
    "name": "Rich Electric Blue",
    "rgb": [8, 146, 208]
  },
  "rich_lavender": {
    "name": "Rich Lavender",
    "rgb": [167, 107, 207]
  },
  "rich_lilac": {
    "name": "Rich Lilac",
    "rgb": [182, 102, 210]
  },
  "rich_maroon": {
    "name": "Rich Maroon",
    "rgb": [176, 48, 96]
  },
  "rifle_green": {
    "name": "Rifle Green",
    "rgb": [65, 72, 51]
  },
  "robin_egg_blue": {
    "name": "Robin Egg Blue",
    "rgb": [0, 204, 204]
  },
  "rose": {
    "name": "Rose",
    "rgb": [255, 0, 127]
  },
  "rose_bonbon": {
    "name": "Rose Bonbon",
    "rgb": [249, 66, 158]
  },
  "rose_ebony": {
    "name": "Rose Ebony",
    "rgb": [103, 72, 70]
  },
  "rose_gold": {
    "name": "Rose Gold",
    "rgb": [183, 110, 121]
  },
  "rose_madder": {
    "name": "Rose Madder",
    "rgb": [227, 38, 54]
  },
  "rose_pink": {
    "name": "Rose Pink",
    "rgb": [255, 102, 204]
  },
  "rose_quartz": {
    "name": "Rose Quartz",
    "rgb": [170, 152, 169]
  },
  "rose_taupe": {
    "name": "Rose Taupe",
    "rgb": [144, 93, 93]
  },
  "rose_vale": {
    "name": "Rose Vale",
    "rgb": [171, 78, 82]
  },
  "rosewood": {
    "name": "Rosewood",
    "rgb": [101, 0, 11]
  },
  "rosso_corsa": {
    "name": "Rosso Corsa",
    "rgb": [212, 0, 0]
  },
  "rosy_brown": {
    "name": "Rosy Brown",
    "rgb": [188, 143, 143]
  },
  "royal_azure": {
    "name": "Royal Azure",
    "rgb": [0, 56, 168]
  },
  "royal_blue_traditional": {
    "name": "Royal Blue (Traditional)",
    "rgb": [0, 35, 102]
  },
  "royal_blue_web": {
    "name": "Royal Blue (Web)",
    "rgb": [65, 105, 225]
  },
  "royal_fuchsia": {
    "name": "Royal Fuchsia",
    "rgb": [202, 44, 146]
  },
  "royal_purple": {
    "name": "Royal Purple",
    "rgb": [120, 81, 169]
  },
  "royal_yellow": {
    "name": "Royal Yellow",
    "rgb": [250, 218, 94]
  },
  "rubine_red": {
    "name": "Rubine Red",
    "rgb": [209, 0, 86]
  },
  "ruby": {
    "name": "Ruby",
    "rgb": [224, 17, 95]
  },
  "ruby_red": {
    "name": "Ruby Red",
    "rgb": [155, 17, 30]
  },
  "ruddy": {
    "name": "Ruddy",
    "rgb": [255, 0, 40]
  },
  "ruddy_brown": {
    "name": "Ruddy Brown",
    "rgb": [187, 101, 40]
  },
  "ruddy_pink": {
    "name": "Ruddy Pink",
    "rgb": [225, 142, 150]
  },
  "rufous": {
    "name": "Rufous",
    "rgb": [168, 28, 7]
  },
  "russet": {
    "name": "Russet",
    "rgb": [128, 70, 27]
  },
  "rust": {
    "name": "Rust",
    "rgb": [183, 65, 14]
  },
  "rusty_red": {
    "name": "Rusty Red",
    "rgb": [218, 44, 67]
  },
  "sacramento_state_green": {
    "name": "Sacramento State Green",
    "rgb": [0, 86, 63]
  },
  "saddle_brown": {
    "name": "Saddle Brown",
    "rgb": [139, 69, 19]
  },
  "safety_orange_blaze_orange": {
    "name": "Safety Orange (Blaze Orange)",
    "rgb": [255, 103, 0]
  },
  "saffron": {
    "name": "Saffron",
    "rgb": [244, 196, 48]
  },
  "salmon": {
    "name": "Salmon",
    "rgb": [255, 140, 105]
  },
  "salmon_pink": {
    "name": "Salmon Pink",
    "rgb": [255, 145, 164]
  },
  "sand": {
    "name": "Sand",
    "rgb": [194, 178, 128]
  },
  "sand_dune": {
    "name": "Sand Dune",
    "rgb": [150, 113, 23]
  },
  "sandstorm": {
    "name": "Sandstorm",
    "rgb": [236, 213, 64]
  },
  "sandy_brown": {
    "name": "Sandy Brown",
    "rgb": [244, 164, 96]
  },
  "sandy_taupe": {
    "name": "Sandy Taupe",
    "rgb": [150, 113, 23]
  },
  "sangria": {
    "name": "Sangria",
    "rgb": [146, 0, 10]
  },
  "sap_green": {
    "name": "Sap Green",
    "rgb": [80, 125, 42]
  },
  "sapphire": {
    "name": "Sapphire",
    "rgb": [15, 82, 186]
  },
  "sapphire_blue": {
    "name": "Sapphire Blue",
    "rgb": [0, 103, 165]
  },
  "satin_sheen_gold": {
    "name": "Satin Sheen Gold",
    "rgb": [203, 161, 53]
  },
  "scarlet": {
    "name": "Scarlet",
    "rgb": [255, 36, 0]
  },
  "scarlet_crayola": {
    "name": "Scarlet (Crayola)",
    "rgb": [253, 14, 53]
  },
  "school_bus_yellow": {
    "name": "School Bus Yellow",
    "rgb": [255, 216, 0]
  },
  "screamin_green": {
    "name": "Screamin' Green",
    "rgb": [118, 255, 122]
  },
  "sea_blue": {
    "name": "Sea Blue",
    "rgb": [0, 105, 148]
  },
  "sea_green": {
    "name": "Sea Green",
    "rgb": [46, 139, 87]
  },
  "seal_brown": {
    "name": "Seal Brown",
    "rgb": [50, 20, 20]
  },
  "seashell": {
    "name": "Seashell",
    "rgb": [255, 245, 238]
  },
  "selective_yellow": {
    "name": "Selective Yellow",
    "rgb": [255, 186, 0]
  },
  "sepia": {
    "name": "Sepia",
    "rgb": [112, 66, 20]
  },
  "shadow": {
    "name": "Shadow",
    "rgb": [138, 121, 93]
  },
  "shamrock_green": {
    "name": "Shamrock Green",
    "rgb": [0, 158, 96]
  },
  "shocking_pink": {
    "name": "Shocking Pink",
    "rgb": [252, 15, 192]
  },
  "shocking_pink_crayola": {
    "name": "Shocking Pink (Crayola)",
    "rgb": [255, 111, 255]
  },
  "sienna": {
    "name": "Sienna",
    "rgb": [136, 45, 23]
  },
  "silver": {
    "name": "Silver",
    "rgb": [192, 192, 192]
  },
  "sinopia": {
    "name": "Sinopia",
    "rgb": [203, 65, 11]
  },
  "skobeloff": {
    "name": "Skobeloff",
    "rgb": [0, 116, 116]
  },
  "sky_blue": {
    "name": "Sky Blue",
    "rgb": [135, 206, 235]
  },
  "sky_magenta": {
    "name": "Sky Magenta",
    "rgb": [207, 113, 175]
  },
  "slate_blue": {
    "name": "Slate Blue",
    "rgb": [106, 90, 205]
  },
  "slate_gray": {
    "name": "Slate Gray",
    "rgb": [112, 128, 144]
  },
  "smalt_dark_powder_blue": {
    "name": "Smalt (Dark Powder Blue)",
    "rgb": [0, 51, 153]
  },
  "smokey_topaz": {
    "name": "Smokey Topaz",
    "rgb": [147, 61, 65]
  },
  "smoky_black": {
    "name": "Smoky Black",
    "rgb": [16, 12, 8]
  },
  "snow": {
    "name": "Snow",
    "rgb": [255, 250, 250]
  },
  "spiro_disco_ball": {
    "name": "Spiro Disco Ball",
    "rgb": [15, 192, 252]
  },
  "spring_bud": {
    "name": "Spring Bud",
    "rgb": [167, 252, 0]
  },
  "spring_green": {
    "name": "Spring Green",
    "rgb": [0, 255, 127]
  },
  "st_patrick_s_blue": {
    "name": "St. Patrick'S Blue",
    "rgb": [35, 41, 122]
  },
  "steel_blue": {
    "name": "Steel Blue",
    "rgb": [70, 130, 180]
  },
  "stil_de_grain_yellow": {
    "name": "Stil De Grain Yellow",
    "rgb": [250, 218, 94]
  },
  "stizza": {
    "name": "Stizza",
    "rgb": [153, 0, 0]
  },
  "stormcloud": {
    "name": "Stormcloud",
    "rgb": [79, 102, 106]
  },
  "straw": {
    "name": "Straw",
    "rgb": [228, 217, 111]
  },
  "sunglow": {
    "name": "Sunglow",
    "rgb": [255, 204, 51]
  },
  "sunset": {
    "name": "Sunset",
    "rgb": [250, 214, 165]
  },
  "tan": {
    "name": "Tan",
    "rgb": [210, 180, 140]
  },
  "tangelo": {
    "name": "Tangelo",
    "rgb": [249, 77, 0]
  },
  "tangerine": {
    "name": "Tangerine",
    "rgb": [242, 133, 0]
  },
  "tangerine_yellow": {
    "name": "Tangerine Yellow",
    "rgb": [255, 204, 0]
  },
  "tango_pink": {
    "name": "Tango Pink",
    "rgb": [228, 113, 122]
  },
  "taupe": {
    "name": "Taupe",
    "rgb": [72, 60, 50]
  },
  "taupe_gray": {
    "name": "Taupe Gray",
    "rgb": [139, 133, 137]
  },
  "tea_green": {
    "name": "Tea Green",
    "rgb": [208, 240, 192]
  },
  "tea_rose_orange": {
    "name": "Tea Rose (Orange)",
    "rgb": [248, 131, 121]
  },
  "tea_rose_rose": {
    "name": "Tea Rose (Rose)",
    "rgb": [244, 194, 194]
  },
  "teal": {
    "name": "Teal",
    "rgb": [0, 128, 128]
  },
  "teal_blue": {
    "name": "Teal Blue",
    "rgb": [54, 117, 136]
  },
  "teal_green": {
    "name": "Teal Green",
    "rgb": [0, 130, 127]
  },
  "telemagenta": {
    "name": "Telemagenta",
    "rgb": [207, 52, 118]
  },
  "tenn_tawny": {
    "name": "Tenné (Tawny)",
    "rgb": [205, 87, 0]
  },
  "terra_cotta": {
    "name": "Terra Cotta",
    "rgb": [226, 114, 91]
  },
  "thistle": {
    "name": "Thistle",
    "rgb": [216, 191, 216]
  },
  "thulian_pink": {
    "name": "Thulian Pink",
    "rgb": [222, 111, 161]
  },
  "tickle_me_pink": {
    "name": "Tickle Me Pink",
    "rgb": [252, 137, 172]
  },
  "tiffany_blue": {
    "name": "Tiffany Blue",
    "rgb": [10, 186, 181]
  },
  "tiger_s_eye": {
    "name": "Tiger'S Eye",
    "rgb": [224, 141, 60]
  },
  "timberwolf": {
    "name": "Timberwolf",
    "rgb": [219, 215, 210]
  },
  "titanium_yellow": {
    "name": "Titanium Yellow",
    "rgb": [238, 230, 0]
  },
  "tomato": {
    "name": "Tomato",
    "rgb": [255, 99, 71]
  },
  "toolbox": {
    "name": "Toolbox",
    "rgb": [116, 108, 192]
  },
  "topaz": {
    "name": "Topaz",
    "rgb": [255, 200, 124]
  },
  "tractor_red": {
    "name": "Tractor Red",
    "rgb": [253, 14, 53]
  },
  "trolley_grey": {
    "name": "Trolley Grey",
    "rgb": [128, 128, 128]
  },
  "tropical_rain_forest": {
    "name": "Tropical Rain Forest",
    "rgb": [0, 117, 94]
  },
  "true_blue": {
    "name": "True Blue",
    "rgb": [0, 115, 207]
  },
  "tufts_blue": {
    "name": "Tufts Blue",
    "rgb": [65, 125, 193]
  },
  "tumbleweed": {
    "name": "Tumbleweed",
    "rgb": [222, 170, 136]
  },
  "turkish_rose": {
    "name": "Turkish Rose",
    "rgb": [181, 114, 129]
  },
  "turquoise": {
    "name": "Turquoise",
    "rgb": [48, 213, 200]
  },
  "turquoise_blue": {
    "name": "Turquoise Blue",
    "rgb": [0, 255, 239]
  },
  "turquoise_green": {
    "name": "Turquoise Green",
    "rgb": [160, 214, 180]
  },
  "tuscan_red": {
    "name": "Tuscan Red",
    "rgb": [124, 72, 72]
  },
  "twilight_lavender": {
    "name": "Twilight Lavender",
    "rgb": [138, 73, 107]
  },
  "tyrian_purple": {
    "name": "Tyrian Purple",
    "rgb": [102, 2, 60]
  },
  "ua_blue": {
    "name": "Ua Blue",
    "rgb": [0, 51, 170]
  },
  "ua_red": {
    "name": "Ua Red",
    "rgb": [217, 0, 76]
  },
  "ube": {
    "name": "Ube",
    "rgb": [136, 120, 195]
  },
  "ucla_blue": {
    "name": "Ucla Blue",
    "rgb": [83, 104, 149]
  },
  "ucla_gold": {
    "name": "Ucla Gold",
    "rgb": [255, 179, 0]
  },
  "ufo_green": {
    "name": "Ufo Green",
    "rgb": [60, 208, 112]
  },
  "ultra_pink": {
    "name": "Ultra Pink",
    "rgb": [255, 111, 255]
  },
  "ultramarine": {
    "name": "Ultramarine",
    "rgb": [18, 10, 143]
  },
  "ultramarine_blue": {
    "name": "Ultramarine Blue",
    "rgb": [65, 102, 245]
  },
  "umber": {
    "name": "Umber",
    "rgb": [99, 81, 71]
  },
  "unbleached_silk": {
    "name": "Unbleached Silk",
    "rgb": [255, 221, 202]
  },
  "united_nations_blue": {
    "name": "United Nations Blue",
    "rgb": [91, 146, 229]
  },
  "university_of_california_gold": {
    "name": "University Of California Gold",
    "rgb": [183, 135, 39]
  },
  "unmellow_yellow": {
    "name": "Unmellow Yellow",
    "rgb": [255, 255, 102]
  },
  "up_forest_green": {
    "name": "Up Forest Green",
    "rgb": [1, 68, 33]
  },
  "up_maroon": {
    "name": "Up Maroon",
    "rgb": [123, 17, 19]
  },
  "upsdell_red": {
    "name": "Upsdell Red",
    "rgb": [174, 32, 41]
  },
  "urobilin": {
    "name": "Urobilin",
    "rgb": [225, 173, 33]
  },
  "usafa_blue": {
    "name": "Usafa Blue",
    "rgb": [0, 79, 152]
  },
  "usc_cardinal": {
    "name": "Usc Cardinal",
    "rgb": [153, 0, 0]
  },
  "usc_gold": {
    "name": "Usc Gold",
    "rgb": [255, 204, 0]
  },
  "utah_crimson": {
    "name": "Utah Crimson",
    "rgb": [211, 0, 63]
  },
  "vanilla": {
    "name": "Vanilla",
    "rgb": [243, 229, 171]
  },
  "vegas_gold": {
    "name": "Vegas Gold",
    "rgb": [197, 179, 88]
  },
  "venetian_red": {
    "name": "Venetian Red",
    "rgb": [200, 8, 21]
  },
  "verdigris": {
    "name": "Verdigris",
    "rgb": [67, 179, 174]
  },
  "vermilion_cinnabar": {
    "name": "Vermilion (Cinnabar)",
    "rgb": [227, 66, 52]
  },
  "vermilion_plochere": {
    "name": "Vermilion (Plochere)",
    "rgb": [217, 96, 59]
  },
  "veronica": {
    "name": "Veronica",
    "rgb": [160, 32, 240]
  },
  "violet": {
    "name": "Violet",
    "rgb": [143, 0, 255]
  },
  "violet_blue": {
    "name": "Violet-Blue",
    "rgb": [50, 74, 178]
  },
  "violet_color_wheel": {
    "name": "Violet (Color Wheel)",
    "rgb": [127, 0, 255]
  },
  "violet_ryb": {
    "name": "Violet (Ryb)",
    "rgb": [134, 1, 175]
  },
  "violet_web": {
    "name": "Violet (Web)",
    "rgb": [238, 130, 238]
  },
  "viridian": {
    "name": "Viridian",
    "rgb": [64, 130, 109]
  },
  "vivid_auburn": {
    "name": "Vivid Auburn",
    "rgb": [146, 39, 36]
  },
  "vivid_burgundy": {
    "name": "Vivid Burgundy",
    "rgb": [159, 29, 53]
  },
  "vivid_cerise": {
    "name": "Vivid Cerise",
    "rgb": [218, 29, 129]
  },
  "vivid_tangerine": {
    "name": "Vivid Tangerine",
    "rgb": [255, 160, 137]
  },
  "vivid_violet": {
    "name": "Vivid Violet",
    "rgb": [159, 0, 255]
  },
  "warm_black": {
    "name": "Warm Black",
    "rgb": [0, 66, 66]
  },
  "waterspout": {
    "name": "Waterspout",
    "rgb": [164, 244, 249]
  },
  "wenge": {
    "name": "Wenge",
    "rgb": [100, 84, 82]
  },
  "wheat": {
    "name": "Wheat",
    "rgb": [245, 222, 179]
  },
  "white": {
    "name": "White",
    "rgb": [255, 255, 255]
  },
  "white_smoke": {
    "name": "White Smoke",
    "rgb": [245, 245, 245]
  },
  "wild_blue_yonder": {
    "name": "Wild Blue Yonder",
    "rgb": [162, 173, 208]
  },
  "wild_strawberry": {
    "name": "Wild Strawberry",
    "rgb": [255, 67, 164]
  },
  "wild_watermelon": {
    "name": "Wild Watermelon",
    "rgb": [252, 108, 133]
  },
  "wine": {
    "name": "Wine",
    "rgb": [114, 47, 55]
  },
  "wine_dregs": {
    "name": "Wine Dregs",
    "rgb": [103, 49, 71]
  },
  "wisteria": {
    "name": "Wisteria",
    "rgb": [201, 160, 220]
  },
  "wood_brown": {
    "name": "Wood Brown",
    "rgb": [193, 154, 107]
  },
  "xanadu": {
    "name": "Xanadu",
    "rgb": [115, 134, 120]
  },
  "yale_blue": {
    "name": "Yale Blue",
    "rgb": [15, 77, 146]
  },
  "yellow": {
    "name": "Yellow",
    "rgb": [255, 255, 0]
  },
  "yellow_green": {
    "name": "Yellow-Green",
    "rgb": [154, 205, 50]
  },
  "yellow_munsell": {
    "name": "Yellow (Munsell)",
    "rgb": [239, 204, 0]
  },
  "yellow_ncs": {
    "name": "Yellow (Ncs)",
    "rgb": [255, 211, 0]
  },
  "yellow_orange": {
    "name": "Yellow Orange",
    "rgb": [255, 174, 66]
  },
  "yellow_process": {
    "name": "Yellow (Process)",
    "rgb": [255, 239, 0]
  },
  "yellow_ryb": {
    "name": "Yellow (Ryb)",
    "rgb": [254, 254, 51]
  },
  "zaffre": {
    "name": "Zaffre",
    "rgb": [0, 20, 168]
  },
  "zinnwaldite_brown": {
    "name": "Zinnwaldite Brown",
    "rgb": [44, 22, 8]
  }
};
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
const purpleTheme = {
  "background": [179, 179, 242, 1],
  // softer light lavender background
  "tile": [179, 179, 216, 1],
  // cool light purple for tiles
  "tileSelected": [204, 204, 230, 1],
  // soft grayish purple for inactive
  "tileInactive": [102, 102, 179, 1],
  // richer purple for selected (more pop)
  "tileLetterText": [255, 255, 255, 1],
  // bright white text for contrast
  "wordScoreBackground": [102, 102, 179, 1],
  // blue-purple to match selected tiles
  "wordScoreText": [255, 255, 255, 1],
  // white for clarity on score text
  "scoreText": [230, 230, 230, 1],
  // soft white-gray
  "checker": [230, 230, 255, 1],
  // light violet checkerboard
  "moveCandidates": [128, 153, 255, 1],
  // soft blue highlight for candidates
  "menuButtonBackground": [153, 204, 229, 1],
  // pale teal-ish blue for buttons
  "menuButtonForeground": [255, 255, 255, 1],
  // white foreground text
  "menuButtonForegroundDisabled": [179, 179, 179, 1]
  // subtle gray when disabled
};
const beachTheme = {
  "background": [26, 156, 178, 1],
  // richer turquoise sea
  "tile": [255, 248, 200, 1],
  // soft warm sand (brighter than original)
  "tileSelected": [255, 198, 120, 1],
  // sunny orange-coral (sunset vibes)
  "tileInactive": [140, 200, 160, 1],
  // sun-bleached green (like palm fronds fading in the sun)
  "tileLetterText": [40, 100, 110, 1],
  // deeper seafoam text for better contrast
  "wordScoreBackground": [255, 223, 148, 1],
  // sun-baked peach
  "wordScoreText": [32, 92, 105, 1],
  // ocean accent text
  "scoreText": [255, 255, 255, 1],
  // crisp white score
  "checker": [0, 190, 180, 1],
  // sea foam pattern in the surf
  "moveCandidates": [255, 190, 110, 1],
  // beachy orange highlight
  "menuButtonBackground": [240, 110, 50, 1],
  // bold tropical orange
  "menuButtonForeground": [255, 255, 255, 1],
  "menuButtonForegroundDisabled": [160, 160, 160, 1]
};
const midnightTheme = {
  "background": [18, 24, 47, 1],
  // deep midnight blue
  "tile": [92, 64, 153, 1],
  // soft muted navy
  "tileSelected": [135, 94, 153, 1],
  // royal purple
  "tileInactive": [70, 70, 90, 1],
  // desaturated dark grey-blue
  "tileLetterText": [200, 200, 255, 1],
  // light periwinkle
  "wordScoreBackground": [64, 41, 115, 1],
  // deeper purple highlight
  "wordScoreText": [220, 210, 250, 1],
  // soft lavender text
  "scoreText": [190, 220, 255, 1],
  // sky blue for contrast
  "checker": [30, 42, 90, 1],
  // barely visible grid contrast
  "moveCandidates": [130, 80, 200, 1],
  // strong purple-pink highlight
  "menuButtonBackground": [88, 70, 130, 1],
  // dusky purple
  "menuButtonForeground": [255, 255, 255, 1],
  // white text
  "menuButtonForegroundDisabled": [120, 120, 150, 1]
  // soft muted grey-blue
};
const wordlePlayfulTheme = {
  "background": [250, 248, 239, 1],
  // warm paper-like off-white
  "tile": [130, 130, 130, 1],
  // gray (wrong letter)
  "tileSelected": [240, 194, 60, 1],
  // golden yellow (right letter, wrong place)
  "tileInactive": [106, 170, 100, 1],
  // green (correct letter and place)
  "tileLetterText": [255, 255, 255, 1],
  // white for strong contrast
  "wordScoreBackground": [234, 219, 178, 1],
  // soft beige backdrop
  "wordScoreText": [80, 80, 80, 1],
  // dark gray, not fully black
  "scoreText": [60, 60, 60, 1],
  // darker gray for scoreboard text
  "checker": [220, 210, 180, 1],
  // light parchment-style grid
  "moveCandidates": [255, 204, 0, 1],
  // punchy yellow highlight
  "menuButtonBackground": [102, 153, 204, 1],
  // playful blue
  "menuButtonForeground": [250, 248, 239, 1],
  // white
  "menuButtonForegroundDisabled": [160, 160, 160, 1]
  // dimmed gray
};
const minecraftTheme = {
  "background": [89, 125, 39, 1],
  // grassy green, like the top of a dirt block
  "tile": [112, 112, 112, 1],
  // stone gray (wrong letter)
  "tileSelected": [181, 140, 71, 1],
  // warm dirt brown (right letter, wrong place)
  "tileInactive": [63, 106, 45, 1],
  // deeper green (correct letter & position)
  "tileLetterText": [255, 255, 255, 1],
  // bright white text
  "wordScoreBackground": [148, 120, 80, 1],
  // soft brown for score area
  "wordScoreText": [255, 255, 255, 1],
  // white again for legibility
  "scoreText": [235, 235, 235, 1],
  // light gray for contrast on darker bg
  "checker": [78, 97, 36, 1],
  // mossy checkerboard tone
  "moveCandidates": [255, 216, 61, 1],
  // bright gold (like a torch glow)
  "menuButtonBackground": [60, 68, 94, 1],
  // deep slate blue (like stone UI panels)
  "menuButtonForeground": [255, 255, 255, 1],
  // white
  "menuButtonForegroundDisabled": [160, 160, 160, 1]
  // soft gray
};
const starWarsForceTheme = {
  "background": [0, 0, 0, 1],
  // deep space black
  "tile": [64, 64, 64, 1],
  // neutral gray (wrong letter)
  "tileSelected": [200, 50, 50, 1],
  // Sith red (right letter, wrong position)
  "tileInactive": [50, 120, 255, 1],
  // Jedi blue (correct letter & position)
  "tileLetterText": [255, 255, 255, 1],
  // bright white for all tiles
  "wordScoreBackground": [30, 30, 30, 1],
  // dark control panel gray
  "wordScoreText": [200, 200, 255, 1],
  // soft blue highlight
  "scoreText": [220, 220, 220, 1],
  // light gray
  "checker": [15, 15, 15, 1],
  // subtle starfield contrast
  "moveCandidates": [200, 50, 50, 1],
  // Sith red for target highlight
  "menuButtonBackground": [20, 20, 20, 1],
  // sleek black UI panel
  "menuButtonForeground": [50, 120, 255, 1],
  // Jedi blue text
  "menuButtonForegroundDisabled": [120, 120, 120, 1]
  // gray when inactive
};
const themes = {
  "purple": purpleTheme,
  "beach": beachTheme,
  "midnight": midnightTheme,
  "wordlePlayful": wordlePlayfulTheme,
  "minecraft": minecraftTheme,
  "starWars": starWarsForceTheme
};
function loadTheme(themeName) {
  const themeBase = themes[themeName];
  let theme = {};
  for (let c in themeBase) {
    theme[c] = themeBase[c];
  }
  theme["bronze"] = [205, 127, 50, 1];
  theme["silver"] = [208, 208, 208, 1];
  theme["gold"] = [255, 215, 0, 1];
  theme["bronzeOff"] = [128, 128, 128, 0.1];
  theme["silverOff"] = [128, 128, 128, 0.1];
  theme["goldOff"] = [128, 128, 128, 0.1];
  for (let t in theme) {
    let [r, g, b, a] = theme[t];
    theme[t] = `rgba(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)},${a})`;
  }
  theme["id"] = themeName;
  return theme;
}
const urlWords = "" + new URL("TWL06-BX4RmYm2.txt", import.meta.url).href;
const urlSoundCancelSelection = "" + new URL("cancel_selection-DZ1gYDyu.mp3", import.meta.url).href;
const urlSoundLevelCompleted = "" + new URL("level_completed-BwaWAI54.mp3", import.meta.url).href;
const urlSoundLevelFailed = "" + new URL("level_failed-DG77Ixvh.mp3", import.meta.url).href;
const urlSoundMenu = "" + new URL("menu-Wio-ugm1.mp3", import.meta.url).href;
const urlSoundSelect = "" + new URL("select-CMgqBDdo.mp3", import.meta.url).href;
const urlSoundWordCompleted = "" + new URL("word_completed-Bu2Q1kXb.mp3", import.meta.url).href;
const sounds = {
  CANCEL_SELECTION: new Audio(urlSoundCancelSelection),
  LEVEL_COMPLETED: new Audio(urlSoundLevelCompleted),
  LEVEL_FAILED: new Audio(urlSoundLevelFailed),
  MENU: new Audio(urlSoundMenu),
  SELECT: new Audio(urlSoundSelect),
  WORD_COMPLETED: new Audio(urlSoundWordCompleted)
};
const boardSize = 5;
function getUTCDateString(date = /* @__PURE__ */ new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}
async function loadWords(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const words = new Set(text.replace(/\r/g, "").split("\n"));
    return words;
  } catch (err) {
    console.error("Error loading file:", err);
  }
}
class LetterTile extends Widget {
  /**
   * 
   * @param {Board} board 
   * @param {number} x 
   * @param {number} y 
   * @param {string} letter 
   * @param {number} value 
   * @param {number} row 
   * @param {boolean} active 
   */
  constructor(board, x, y, letter, value, row, col, active = true) {
    super();
    this.children = [
      new Label({
        text: letter,
        color: (app) => app.colors["tileLetterText"],
        fontSize: "0.8wh",
        hints: { x: 0, y: 0, w: 1, h: 1 }
      })
    ];
    this.bgColor = SevenWordsApp.get().colors["tile"];
    SevenWordsApp.get().bind("colors", (e, o, v) => {
      this.updateBgColor();
    });
    this.letter = letter;
    this.gposX = x;
    this.gposY = y;
    this.oposX = this.gposX;
    this.oposY = this.gposY;
    this.cposX = this.gposX;
    this.cposY = this.gposY;
    [this.x, this.y] = this.gpos;
    this.board = board;
    this.row = row;
    this.col = col;
    this.selected = false;
    this.active = active;
    this.correctRow = false;
  }
  draw(app, ctx) {
    if (this.active) {
      const oldColor = ctx.fillStyle;
      ctx.fillStyle = Color.fromString(this.bgColor).mix(new Color(255, 255, 255), 0.5);
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.fillStyle = Color.fromString(this.bgColor).mix(new Color(0, 0, 0), 0.5);
      ctx.fillRect(this.x + 0.05 * this.w, this.y + 0.05 * this.h, this.w * 0.95, this.h * 0.95);
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(this.x + 0.05 * this.w, this.y + 0.05 * this.h, this.w * 0.9, this.h * 0.9);
      ctx.fillStyle = oldColor;
    } else {
      super.draw(app, ctx);
    }
  }
  on_letter(event, object, value) {
    this.children[0].text = value;
  }
  updateBgColor() {
    let colors = SevenWordsApp.get().colors;
    this.bgColor = this.active && this.correctRow ? colors["tileSelected"] : this.active ? colors["tile"] : colors["tileInactive"];
  }
  on_correctRow(event, object, value) {
    this.updateBgColor();
  }
  on_active(event, object, value) {
    this.updateBgColor();
  }
  on_selected(event, object, value) {
    this.updateBgColor();
  }
  on_gpos(event, object, value) {
    if (this.cpos[0] === -1 && this.cpos[1] === -1) {
      this.opos = [...this.gpos];
      this.cpos = [...this.gpos];
    }
    const a = new WidgetAnimation();
    a.add({ x: this.gpos[0], y: this.gpos[1] }, 250);
    a.start(this);
  }
  /**@type {eskv.Widget['on_touch_down']} */
  on_touch_down(event, object, touch) {
    if (this.board.blockGposUpdates) {
      return false;
    }
    if (!this.active) {
      return false;
    }
    if (this.collide(touch.rect)) {
      this.board._children = [...this.board._children.filter((c) => c !== this), this];
      touch.grab(this);
      return true;
    }
    return false;
  }
  /**@type {eskv.Widget['on_touch_move']} */
  on_touch_move(event, object, touch) {
    if (touch.grabbed !== this) return false;
    if (this.board.blockGposUpdates) {
      return false;
    }
    this.center_x = touch.x;
    this.center_y = touch.y;
    return true;
  }
  /**@type {eskv.Widget['on_touch_up']} */
  on_touch_up(event, object, touch) {
    if (touch.grabbed !== this) return false;
    touch.ungrab();
    if (this.board.blockGposUpdates) {
      return false;
    }
    let y = 0;
    for (const row of this.board.pyramid) {
      for (const t of row) {
        if (t === this) continue;
        if (t.collide(touch.rect) && t.active) {
          this.board.pyramid[t.row][t.col] = this;
          this.board.pyramid[this.row][this.col] = t;
          this.board.updatePyramidRowTiles(this.row);
          this.board.updatePyramidRowTiles(y);
          this.board.updateTileStates();
          if (t.active && this.active) {
            this.board.scorebar.score += 1;
          }
          this.board.checkCompletion(this.row);
          this.board.checkCompletion(t.row);
          this.board.checkGameOver();
          return true;
        }
      }
      y++;
    }
    this.gpos = this.opos.slice();
    this.cpos = this.opos.slice();
    return true;
  }
  // Getter and setter for gpos, opos, and cpos to trigger events
  get gpos() {
    return [this.gposX, this.gposY];
  }
  set gpos(value) {
    [this.gposX, this.gposY] = value;
    this.emit("gpos", value);
  }
  get opos() {
    return [this.oposX, this.oposY];
  }
  set opos(value) {
    [this.oposX, this.oposY] = value;
  }
  get cpos() {
    return [this.cposX, this.cposY];
  }
  set cpos(value) {
    [this.cposX, this.cposY] = value;
  }
}
class Star extends Widget {
  constructor(props = {}) {
    super();
    __publicField(this, "bgColor", "rgba(128,128,128,1.0)");
    __publicField(this, "altColor", "rgba(52,192,52,1.0)");
    __publicField(this, "numberColor", "rgba(252,252,0,1.0)");
    __publicField(this, "textColor", "rgba(255,255,255,1)");
    __publicField(this, "target", 999);
    __publicField(this, "active", false);
    this.updateProperties(props);
    const label = new Label({
      fontSize: "0.3wh",
      hints: { x: 0, y: 0, w: 1, h: 1 }
    });
    this.children = [label];
    this.bind("textColor", (event, star, data) => {
      label.color = /**@type {Star}*/
      star.textColor;
    });
    this.bind("target", (event, star, data) => {
      label.text = "" + /**@type {Star}*/
      star.target;
    });
  }
  /**@type {eskv.Widget['draw']} */
  draw(app, ctx) {
    const radiusOuter = this.center_y / 2;
    const radiusInner = this.center_y / 4;
    const spikes = 7;
    const step = Math.PI / spikes;
    ctx.fillStyle = this.active ? this.altColor : this.bgColor;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const angle = i * step;
      const radius = i % 2 === 0 ? radiusOuter : radiusInner;
      const x = this.center_x + Math.cos(angle) * radius;
      const y = this.center_y + Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
  }
  // /**@type {eskv.Widget['draw']} */
  // draw(app, ctx) {
  //     ctx.fillStyle = this.active? this.altColor:this.bgColor;
  //     // Triangle:
  //     //     points: [self.x, (self.y+self.center_y)/2, self.right, (self.y+self.center_y)/2, self.center_x, self.top]
  //     ctx.beginPath()
  //     ctx.moveTo(this.x, (this.y+this.center_y)/2);
  //     ctx.lineTo(this.right, (this.y+this.center_y)/2);
  //     ctx.lineTo(this.center_x, this.bottom);
  //     ctx.closePath();
  //     ctx.fill();
  //     // Triangle:
  //     //     points: [self.x, (self.top+self.center_y)/2, self.right, (self.top+self.center_y)/2, self.center_x, self.y]
  //     ctx.beginPath()
  //     ctx.moveTo(this.x, (this.bottom+this.center_y)/2);
  //     ctx.lineTo(this.right, (this.bottom+this.center_y)/2);
  //     ctx.lineTo(this.center_x, this.y);
  //     ctx.closePath();
  //     ctx.fill();
  // }
}
const instructionsText = 'Objective: Unscramble the 5 mystery words and keep as many stars as you can.\n\nPyramid: The pyramid is a 5x7 grid of letters. Each row has a mystery word of length 3 to 7 letters that you must find by exchanging the positions of letters.\n\nExchange: Drag a raised letter to another raise letter in any row to exchange their positions.\n\nCorrect placement: If a letter is correctly positioned for a word in its row it will no longer be raised and will become locked in place. At the start of the game, one letter in each row will be correctly positioned and locked in place.\n\nIncorrect placement: If neither of the letters you exchanged is correctly positioned, you will lose a star. Try to make educated guesses from the correctly placed letters!\n\nHints: Any letters appearing in a row where they can be placed correctly will be highlighted.\n\nEnd game: Once you have all letters locked in place you have completed the game! Your stars are your score. You can play a new "daily game" every day or play a random game any time you feel like it.\n\n';
class Instructions extends ModalView {
  constructor() {
    super();
    __publicField(this, "hints", { w: 0.8, h: 0.8, center_x: 0.5, center_y: 0.5 });
    this.bgColor = "rgba(0,0,0,0.5)";
    this.children = [
      new Label({
        hints: { h: null },
        text: "How to play",
        fontSize: "0.05ah"
      }),
      new ScrollView({
        scrollW: false,
        uiZoom: false,
        children: [
          new Label({
            hints: { h: null },
            text: instructionsText,
            wrap: true,
            wrapAtWord: true,
            fontSize: "0.04ah",
            align: "left",
            valign: "middle"
          })
        ]
      })
    ];
  }
}
class MenuButton extends BasicButton {
  constructor(props = {}) {
    props["color"] = (app) => app.colors["menuButtonBackground"];
    props["selectColor"] = "white";
    props["bgColor"] = null;
    super(props);
  }
  /**@type {eskv.BasicButton['draw']} */
  draw(app, ctx) {
    super.draw(app, ctx);
    ctx.beginPath();
    ctx.fillStyle = this._touching ? this.selectColor : this.color;
    ctx.rect(this.x + this.h / 8, this.y + this.h * 2 / 16, 3 * this.w / 4, this.h / 8);
    ctx.rect(this.x + this.h / 8, this.y + this.h * 7 / 16, 3 * this.w / 4, this.h / 8);
    ctx.rect(this.x + this.h / 8, this.y + this.h * 12 / 16, 3 * this.w / 4, this.h / 8);
    ctx.fill();
  }
}
class MenuOption extends Label {
  constructor(props = {}) {
    super();
    __publicField(this, "active", true);
    __publicField(this, "value", -1);
    props["bgColor"] = (app) => app.colors["menuButtonBackground"];
    props["color"] = (app) => this.active ? app.colors["menuButtonForeground"] : app.colors["menuButtonForegroundDisabled"];
    this.updateProperties(props);
  }
  on_active(e, o, v) {
    const app = SevenWordsApp.get();
    this.color = this.active ? app.colors["menuButtonForeground"] : app.colors["menuButtonForegroundDisabled"];
  }
}
class Menu extends ModalView {
  constructor() {
    super({ hints: { w: "0.8h", h: 0.5, center_y: 0.5, center_x: 0.5 } });
    this.orientation = "vertical";
    this.selection = -1;
    this.paddingY = "0.02ah";
    this.spacingY = "0.02ah";
    this.bgColor = null;
    this.outlineColor = null;
    this.children = [
      // new MenuOption({text: 'Restart Game', value:1}),
      new MenuOption({ text: "Daily Game", value: 2 }),
      new MenuOption({ text: "Random Game", value: 3 }),
      new MenuOption({ text: "Instructions", value: 4 }),
      new MenuOption({ text: "Theme", value: 7 })
    ];
  }
  on_touch_down(event, object, touch) {
    super.on_touch_down(event, object, touch);
    if (this.collide(touch.rect)) {
      return true;
    }
    return false;
  }
  on_touch_up(event, object, touch) {
    super.on_touch_up(event, object, touch);
    if (this.collide(touch.rect)) {
      for (let c of this.children) {
        if (c instanceof MenuOption && c.collide(touch.rect) && c.active) {
          this.selection = c.value;
          sounds.MENU.play();
          return true;
        }
      }
      return true;
    }
    return false;
  }
}
class ScoreBar extends BoxLayout {
  constructor(kwargs = {}) {
    super(kwargs);
    __publicField(this, "score", 0);
    __publicField(this, "hiScore", 0);
    __publicField(this, "gameId", "");
    __publicField(this, "id", "scorebar");
    /**@type {'horizontal'|'vertical'}*/
    __publicField(this, "orientation", "horizontal");
    __publicField(this, "target", [50, 150, 300]);
    this.score = 0;
    this.hiScore = 0;
    this.gameId = getUTCDateString();
    this.played = 0;
    this.children = [
      new BoxLayout({
        orientation: "vertical",
        children: [
          new Label({
            hints: { h: 0.33 },
            text: "INCORRECT",
            color: (app) => app.colors["scoreText"],
            align: "left",
            valign: "bottom"
          }),
          new Label({
            hints: { h: 0.67 },
            text: (scorebar) => "" + scorebar.score,
            color: (app) => app.colors["scoreText"],
            align: "left",
            valign: "top"
          })
        ]
      }),
      new BoxLayout({
        orientation: "vertical",
        children: [
          new Label({
            hints: { h: 0.33 },
            text: (scorebar) => {
              return scorebar.gameId !== "" ? `GAME ${scorebar.gameId}` : "RANDOM GAME";
            },
            color: (app) => app.colors["scoreText"],
            halign: "center",
            valign: "middle"
          }),
          new BoxLayout({
            hints: { h: 0.67 },
            spacing: "0.02ah",
            padding: "0.02ah",
            orientation: "horizontal",
            children: [
              new Star({
                active: (scorebar) => scorebar.score < 5,
                target: 1,
                bgColor: (app) => app.colors["bronzeOff"],
                altColor: (app) => app.colors["bronze"],
                hints: { h: "1h", w: "1wh" }
              }),
              new Star({
                active: (scorebar) => scorebar.score < 4,
                target: 2,
                bgColor: (app) => app.colors["bronzeOff"],
                altColor: (app) => app.colors["bronze"],
                hints: { h: "1h", w: "1wh" }
              }),
              new Star({
                active: (scorebar) => scorebar.score < 3,
                target: 3,
                bgColor: (app) => app.colors["bronzeOff"],
                altColor: (app) => app.colors["bronze"],
                hints: { h: "1h", w: "1wh" }
              }),
              new Star({
                active: (scorebar) => scorebar.score < 2,
                target: 4,
                bgColor: (app) => app.colors["silverOff"],
                altColor: (app) => app.colors["silver"],
                hints: { h: "1h", w: "1wh" }
              }),
              new Star({
                active: (scorebar) => scorebar.score < 1,
                target: 5,
                bgColor: (app) => app.colors["goldOff"],
                altColor: (app) => app.colors["gold"],
                hints: { h: "1h", w: "1wh" }
              })
            ]
          })
        ]
      }),
      new BoxLayout({
        orientation: "horizontal",
        children: [
          new Widget({}),
          new MenuButton({
            id: "menubutton",
            hints: { h: "0.75h", w: "1wh" },
            bgColor: (app) => app.colors["menuButtonBackground"],
            on_press: (e, o, v) => SevenWordsApp.get().showMenu()
          })
        ]
      })
    ];
    try {
      this.store = localStorage.getItem("7Words/scores.json");
    } catch (error) {
      this.store = null;
    }
    this.bind("gameId", (e, o, v) => this.setGameId());
    this.bind("played", (e, o, v) => this.setPlayed());
  }
  getStatus() {
    var _a;
    try {
      const status = localStorage.getItem("7Words/status");
      if (status) {
        const data = JSON.parse(status);
        this.gameId = (_a = data.gameId) != null ? _a : "";
      } else {
        this.gameId = getUTCDateString();
      }
    } catch (error) {
      this.gameId = getUTCDateString();
    }
  }
  setPlayed() {
    try {
      localStorage.setItem("7Words/games/" + this.gameId, JSON.stringify({ score: this.score }));
    } catch (error) {
    }
    console.info(`Played game ${this.gameId} ${this.played} times`);
  }
  setGameId() {
    var _a, _b;
    console.info(`Setting game ${this.gameId}`);
    if (this.gameId !== "") {
      try {
        localStorage.setItem("7Words/status", JSON.stringify({ gameId: this.gameId }));
      } catch (error) {
      }
    }
    try {
      const store = localStorage.getItem("7Words/games/" + String(this.gameId));
      if (store) {
        const data = JSON.parse(store);
        this.hiScore = (_a = data.highScore) != null ? _a : 0;
        this.played = (_b = data.played) != null ? _b : 0;
      } else {
        throw new Error();
      }
    } catch (error) {
      this.hiScore = 0;
      this.played = 0;
    }
    console.info(`High score ${this.hiScore}`);
    this.score = 0;
  }
  gameOver() {
    console.info(`Setting game score ${this.score} for completed game ${this.gameId}`);
    if (this.score > this.hiScore) {
      this.hiScore = this.score;
      try {
        localStorage.setItem("7Words/games/" + String(this.gameId), JSON.stringify({ score: this.score }));
      } catch (error) {
      }
    }
  }
}
class StatusBar extends Button {
  constructor(kwargs = {}) {
    super();
    /**@type {eskv.BoxLayout['orientation']} */
    __publicField(this, "orientation", "vertical");
    __publicField(this, "id", "statusbar");
    __publicField(this, "word", "");
    __publicField(this, "wordScore", 0);
    this.updateProperties(kwargs);
    this.updateProperties({
      color: (app) => app.colors["wordScoreText"],
      bgColor: (app, statusbar) => statusbar.word !== "" ? app.colors["wordScoreBackground"] : app.colors["background"],
      text: (statusbar) => statusbar.wordScore > 0 ? `${statusbar.word} for ${statusbar.wordScore}` : statusbar.wordScore < 0 ? `${statusbar.word}` : ""
    });
  }
}
class MessageBar extends BoxLayout {
  constructor(kwargs = {}) {
    super(kwargs);
    __publicField(this, "id", "messagebar");
    __publicField(this, "message", "");
    __publicField(this, "gameId", -1);
    /**@type {eskv.BoxLayout['orientation']} */
    __publicField(this, "orientation", "vertical");
    this.children = [
      new Label({
        text: (messagebar) => messagebar.message,
        color: (app) => app.colors["scoreText"]
      })
    ];
  }
  gameChanged(scorebar, gameId) {
    this.gameId = gameId;
  }
}
class Board extends Widget {
  constructor() {
    super({ bgColor: (app) => app.colors["background"] });
    __publicField(this, "hints", { x: 0, y: 0, w: 1, h: 1 });
    this.scorebar = new ScoreBar();
    this.statusbar = new StatusBar();
    this.messagebar = new MessageBar();
    this.tileSpaceSize = 1;
    this.tileSize = 1;
    this.pyramidSize = 1;
    this.offX = 0;
    this.offY = 0;
    this.statusbar.bind("press", (e, o, v) => this.statusPressed());
    this.addChild(this.scorebar);
    this.addChild(this.statusbar);
    this.addChild(this.messagebar);
    this.blockGposUpdates = false;
    this.scorebar.getStatus();
    this.pyramid = [];
    this.opyramid = [];
    this.targetWords = [];
    this.gameOver = false;
    this.setupBoard();
  }
  setupBoard() {
    this.children = this.children.filter((c) => !(c instanceof LetterTile));
    const words = SevenWordsApp.get().words;
    setSeed(stringToSeed(this.scorebar.gameId !== "" ? this.scorebar.gameId : String("RANDOM GAME " + Date.now())));
    this.targetWords = [];
    for (let r = 0; r < boardSize; r++) {
      const wordLength = 3 + r;
      const filteredWords = Array.from(words).filter((word) => wordLength === word.length);
      if (wordLength === 3) {
        console.log("FILTERED WORDS", filteredWords);
      }
      this.targetWords.push(choose(filteredWords));
    }
    const fixedPositions = this.targetWords.map((row) => getRandomInt(0, row.length));
    const freeLetters = this.targetWords.flatMap((word, rowIndex) => [...word.slice(0, fixedPositions[rowIndex]), ...word.slice(fixedPositions[rowIndex] + 1)]);
    const scrambledLetters = shuffle(Array.from(freeLetters));
    for (let k = 0; k < 999; k++) {
      let done = true;
      for (let i = 0; i < scrambledLetters.length; i++) {
        if (scrambledLetters[i] === freeLetters[i]) {
          const j = i === scrambledLetters.length - 1 ? 0 : i + 1;
          [scrambledLetters[j], scrambledLetters[i]] = [scrambledLetters[i], scrambledLetters[j]];
          done = false;
        }
      }
      if (done) break;
    }
    let index = 0;
    this.pyramid = [];
    for (let r = 0; r < boardSize; r++) {
      const word = this.targetWords[r];
      this.pyramid.push([]);
      for (let c = 0; c < word.length; c++) {
        let [x, y] = this.ppos2pos([c, r]);
        const tile = c === fixedPositions[r] ? new LetterTile(this, x, y, word[c], 1, r, c, true) : new LetterTile(this, x, y, scrambledLetters[index], 1, r, c, true);
        if (c !== fixedPositions[r]) index++;
        this.pyramid[r].push(tile);
        this.addChild(tile);
      }
    }
    this.opyramid = this.pyramid.map((p) => p.slice());
    this.updateTileStates();
    this.firstStart = true;
  }
  dailyGame() {
    this.scorebar.gameId = getUTCDateString();
    this.reset(true);
  }
  randomGame() {
    this.scorebar.gameId = "";
    this.reset(true);
  }
  restartGame() {
    this.reset();
  }
  reset(redraw = false) {
    this.scorebar.score = 0;
    this.statusbar.word = "";
    this.statusbar.wordScore = 0;
    if (redraw) {
      this.setupBoard();
    } else {
      this.pyramid = this.opyramid.map((p) => p.slice());
      for (const row of this.pyramid) {
        for (const t of row) {
          t.cpos = [-1, -1];
          t.gpos = [-1, -1];
        }
      }
    }
    this._needsLayout = true;
    this.gameOver = false;
    this.updateTileStates();
    setTimeout(() => this.resetTick(-1), 10);
  }
  resetTick(i) {
    let arr;
    if (i === -1) {
      this.blockGposUpdates = true;
      arr = [];
    } else {
      arr = this.pyramid[i];
    }
    for (const t of arr) {
      t.gpos = t.cpos.slice();
      t.opos = t.cpos.slice();
    }
    i += 1;
    if (i < boardSize) {
      setTimeout(() => this.resetTick(i), 100);
    } else {
      this.blockGposUpdates = false;
    }
  }
  /**
   * 
   * @param {number} row 
   */
  checkCompletion(row) {
    if (this.gameOver) return;
    const word = this.targetWords[row];
    const letters = this.pyramid[row].map((t) => t.letter).join("");
    const isCompletedWord = word === letters;
    if (isCompletedWord) {
      this.checkGameOver();
      if (!this.gameOver) {
        sounds.WORD_COMPLETED.play();
      }
    }
  }
  updateTileStates() {
    this.pyramid.forEach((row, y) => {
      const word = this.targetWords[y];
      row.forEach((t, x) => {
        t.active = this.targetWords[y][x] !== t.letter;
        t.correctRow = word.split("").filter((w, i) => w === t.letter && row[i].letter !== t.letter).length > 0;
      });
    });
  }
  /**
   * 
   * @param {number} row 
   */
  updatePyramidRowTiles(row) {
    const r = this.pyramid[row];
    r.forEach((t, col) => {
      t.row = row;
      t.col = col;
      const pos = this.ppos2pos([col, row]);
      t.cpos = t.opos = t.gpos = pos;
    });
  }
  pos2gpos(pos) {
    return [
      Math.floor((pos[0] - this.offX) / this.tileSpaceSize),
      Math.floor((pos[1] - this.offY) / this.tileSpaceSize)
    ];
  }
  convPos(gpos) {
    return [Math.floor(gpos[0]), Math.floor(gpos[1])];
  }
  ppos2pos(ppos) {
    if (ppos[0] === -1 && ppos[1] === -1) {
      return [this.size[0] / 2, this.size[1]];
    } else {
      return [
        this.center_x + this.tileSpaceSize * (ppos[0] - 0.5 * this.pyramid[ppos[1]].length),
        this.size[1] - (0.25 * this.size[1] + this.tileSpaceSize * (boardSize - 1 - ppos[1]))
      ];
    }
  }
  /**@type {eskv.Widget['layoutChildren']} */
  layoutChildren() {
    this.tileSpaceSize = Math.min(this.size[0], 0.7 * this.size[1]) / boardSize;
    this.tileSize = this.tileSpaceSize - 0.01 * this.size[1];
    this.pyramidSize = boardSize * this.tileSpaceSize;
    this.offX = 0;
    this.offY = 0;
    [this.statusbar.w, this.statusbar.h] = [this.size[0] * 3 / 4, 0.06 * this.size[1]];
    [this.statusbar.x, this.statusbar.y] = [this.size[0] / 8, this.size[1] - (0.04 * this.size[1] + (this.offY + 0.04 * this.size[1] + 0.06 * this.size[1]) / 2)];
    [this.messagebar.w, this.messagebar.h] = [this.size[0], 0.04 * this.size[1]];
    [this.messagebar.x, this.messagebar.y] = [0, this.size[1]];
    [this.scorebar.w, this.scorebar.h] = [this.size[0], 0.15 * this.size[1]];
    [this.scorebar.x, this.scorebar.y] = [0, 0];
    console.log("Laying out pyramid");
    this.pyramid.forEach((row, r) => {
      console.log("row", r);
      row.forEach((tile, c) => {
        const pos = this.ppos2pos([c, r]);
        console.log(tile.letter, c, r, pos[0], pos[1]);
        tile.opos = tile.gpos = tile.cpos = pos;
        [tile.w, tile.h] = new Vec2([this.tileSize, this.tileSize]);
      });
    });
    if (this.firstStart) {
      this.firstStart = false;
    }
    super.layoutChildren();
  }
  statusPressed(e, o, v) {
    if (this.statusbar.wordScore === -1) {
      this.dailyGame();
    } else if (this.statusbar.wordScore === -2) {
      this.reset(true);
    }
  }
  checkGameOver() {
    for (let row of this.pyramid) {
      for (let t of row) {
        if (t.active) {
          return false;
        }
      }
    }
    this.gameOver = true;
    this.statusbar.word = "NEW GAME";
    this.statusbar.wordScore = -1;
    setTimeout(() => sounds.LEVEL_COMPLETED.play(), 1e3);
    return true;
  }
}
class SevenWordsApp extends App {
  constructor(words) {
    var _a;
    super();
    this.id = "app";
    const themeName = (_a = localStorage.getItem("7Words/theme")) != null ? _a : "midnight";
    this.colors = loadTheme(themeName);
    this.words = words;
    this.instructions = new Instructions();
    this.menu = new Menu();
    this.menu.bind("selection", (e, o, v) => this.menuChoice(this.menu, v));
    this.board = new Board();
    this.board.scorebar.bind("gameId", (e, o, v) => {
      this.board.messagebar.gameId = v;
    });
    this.baseWidget.children = [
      this.board
    ];
  }
  showMenu() {
    this.menu.selection = -1;
    this.menu.popup();
  }
  hideMenu() {
    this.menu.close();
  }
  menuChoice(menu, selection) {
    switch (selection) {
      case 1:
        this.hideMenu();
        this.board.restartGame();
        break;
      case 2:
        this.hideMenu();
        this.board.dailyGame();
        break;
      case 3:
        this.hideMenu();
        this.board.randomGame();
        break;
      case 4:
        this.hideMenu();
        this.instructions.popup();
        break;
      case 5:
        this.hideMenu();
        break;
      case 6:
        this.hideMenu();
        break;
      case 7:
        this.setNextTheme();
        this.hideMenu();
        this.showMenu();
        break;
    }
  }
  on_key_down(event, object, keyInfo) {
    if ("Escape" in keyInfo.states && keyInfo.states["Escape"]) {
      if (this.instructions.parent !== null) this.instructions.close();
      if (this.menu.parent === null) this.showMenu();
      else this.hideMenu();
    }
  }
  setNextTheme() {
    const themes$1 = Object.keys(themes);
    const ind = (themes$1.indexOf(this.colors["id"]) + 1) % themes$1.length;
    if (ind >= 0) {
      this.colors = loadTheme(themes$1[ind]);
      localStorage.setItem("7Words/theme", themes$1[ind]);
    }
  }
  /**
   * 
   * @returns {SevenWordsApp}
   */
  static get() {
    return (
      /**@type {SevenWordsApp}*/
      super.get()
    );
  }
}
setPRNG("sfc32");
loadWords(urlWords).then((words) => {
  var app = new SevenWordsApp(words);
  app.start();
});
