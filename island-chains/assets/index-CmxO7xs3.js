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
function mulberry32(a2) {
  return function() {
    var t = a2 += 1831565813;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function xoshiro128ss(a2, b, c, d) {
  return function() {
    var t = b << 9, r = b * 5;
    r = (r << 7 | r >>> 25) * 9;
    c ^= a2;
    d ^= b;
    b ^= c;
    a2 ^= d;
    c ^= t;
    d = d << 11 | d >>> 21;
    return (r >>> 0) / 4294967296;
  };
}
function jsf32(a2, b, c, d) {
  return function() {
    a2 |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    var t = a2 - (b << 27 | b >>> 5) | 0;
    a2 = b ^ (c << 17 | c >>> 15);
    b = c + d | 0;
    c = d + t | 0;
    d = a2 + t | 0;
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
    const sm = splitmix64(this.xorSeed);
    this.random = sfc32(sm(), sm(), sm(), sm());
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
    const sm = splitmix64(this.xorSeed);
    this.random = xoshiro128ss(sm(), sm(), sm(), sm());
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
    const sm = splitmix64(this.xorSeed);
    this.random = jsf32(sm(), sm(), sm(), sm());
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
function sizeText(ctx, text, size, fontName, centered, rect, color) {
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
  return [w, 2 * size];
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
function sizeWrappedText(ctx, text, size, fontName, centered, rect, color, wordwrap = true) {
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
    h += size;
    guess = Math.min(guess, Math.max(1, paraText.length));
  }
  h += size;
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
  const s = baseSize * (atom.style?.s || 1);
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
function sizeRichText(ctx, text, size, fontName, rect, color, wordwrap = true) {
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
  totalH += lines.length ? 0 : size;
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
class WidgetAnimation {
  constructor() {
    /**@type {Array<[AnimationProperties, number]>} The sequentially applied stack of animation effects (each effect can comprise multiple animations)*/
    __publicField(this, "stack", []);
    /**@type {Widget|null} */
    __publicField(this, "widget", null);
    /**@type {AnimationProperties} */
    __publicField(this, "props", {});
    /**@type {AnimationProperties} */
    __publicField(this, "initProps", {});
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
   * @param {App} app The application instance
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
const _EventSink = class _EventSink {
  /**
   * EventSink constructor for internal use only. Use EventSink.a(id, props) to create an instance
   */
  constructor() {
    if (!_EventSink._ALLOW_CONSTRUCT) {
      throw new Error(`[ESKV] Do not use 'new ${typeof this}()'. Use '${typeof this}.a(...)' instead.`);
    }
    _EventSink._ALLOW_CONSTRUCT = false;
    this._events = {};
    this.parent = null;
    return new Proxy(this, {
      set(target, name, value, receiver) {
        if (name[0] == "_") return Reflect.set(target, name, value, receiver);
        Reflect.set(target, name, value, receiver);
        if (typeof name === "string") {
          Reflect.apply(target["emit"], receiver, [name, value]);
        }
        return true;
      }
    });
  }
  /**
   * Acquires a new instance of an EventSink (use in place of constructor)
   * @template {new () => any} C
   * @param {string|(Partial<InstanceType<C>>&{id?:string})} arg1
   * @param {(Partial<InstanceType<C>>&{id?:string})} arg2
   * @returns {InstanceType<C>}
   **/
  /**@type {WidgetFactory['a']} */
  static a(arg1, arg2) {
    _EventSink._ALLOW_CONSTRUCT = true;
    const obj = new this();
    _EventSink._ALLOW_CONSTRUCT = false;
    let id = null, props = {};
    if (typeof arg1 === "string") {
      id = arg1;
      props = arg2 ?? {};
    } else {
      props = arg1 ?? {};
    }
    if (id) obj["id"] = id;
    obj.updateProperties?.(props);
    return (
      /**@type {ReturnType<WidgetFactory['a']>}*/
      obj
    );
  }
  /**deferredProperties binds properties to that are defined as a callback that links them to
   * other properties in this object or any other object in the App widget tree. This function
   * is called by the framework and does not need to be called by user code.
   * @param {App} app 
   */
  deferredProperties(app) {
    let properties = this._deferredProps;
    this._deferredProps = null;
    for (let p in properties) {
      if (!p.startsWith("on_") && !p.startsWith("_") && typeof properties[p] == "function") {
        let func = (
          /** @type {Function} */
          properties[p].bind(this)
        );
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
              /* @__PURE__ */ console.log("Dynamic binding error", this, p, error);
            }
          });
          else if (ob in obmap) this.listen(`${ob}.${pr}`, (evt, obj, data) => {
            try {
              this[p] = func(...objs);
            } catch (error) {
              /* @__PURE__ */ console.log("Dynamic binding error", this, p, error);
            }
          });
        }
        try {
          this[p] = func(...objs);
        } catch (error) {
          /* @__PURE__ */ console.log("Dynamic binding error", this, p, error);
        }
      }
    }
  }
  /**
   * Update the properties of the EventSink
   * @param {Object} properties Object containing properties to udpate
   * TODO: We could add logic for markup parsing
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
   * Bind a callback to property changes of this EventSink
   * @param {string} event name of property to bind to (the event)
   * @param {EventCallbackNullable} func callback function to trigger when property changes
   */
  listen(event, func) {
    App.get()._eventManager.listen(this, event, func);
  }
  /** 
   * Called internally by the widget to emit property changes on_<event> handlers 
   * @param {string} event name of property to ubbind 
   * @param {any} data data value to send
   * @param {Widget} listener
   */
  emit(event, data, listener) {
    if ("on_" + event in this) {
      if (this["on_" + event](event, this, data)) return true;
    }
    return App.get()._eventManager.emit(this, event, data);
  }
  /**
   * Iterates recursively through the widget tree and returns all Widgets and EventSink objects
   * @param {boolean} recursive 
   * @param {boolean} inView 
   * @yields {EventSink}
   */
  *iter(recursive = true, inView = true) {
    yield this;
  }
  /**
   * Iterates recursively through the widget tree to find all parents of this EventSink
   * @yields {Widget}
   */
  *iterParents() {
    if (this.parent === null) return;
    yield this.parent;
    if (this.parent != App.get()) yield* this.parent.iterParents();
  }
  /**
   * Find the first widget or event sink in widget tree whose id matches the requested id
   * @param {string} id 
   * @returns {EventSink|null}
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
   * @param {string} property 
   * @param {string|number} value 
   */
  *iterByPropertyValue(property, value) {
    for (let w of this.iter(true, false)) {
      if (property in w && w[property] == value) yield w;
    }
  }
  /**
   * Called by the App during requestAnimationFrame callback to let
   * the widget update its state.
   */
  update(app, millis) {
    if (this._deferredProps !== null) this.deferredProperties(app);
  }
};
__publicField(_EventSink, "_ALLOW_CONSTRUCT", false);
let EventSink = _EventSink;
function a(klass, arg1, arg2) {
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
  obj.updateProperties?.(props);
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
    obj.updateProperties?.(props);
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
              /* @__PURE__ */ console.log("Dynamic binding error", this, p, error);
            }
          });
          else if (ob in obmap) {
            try {
              this.listen(`${ob}.${pr}`, (evt, obj, data) => {
                try {
                  this[p] = func(...objs);
                } catch (error) {
                  /* @__PURE__ */ console.log("Dynamic binding error", this, p, error);
                }
              });
            } catch (error) {
              /* @__PURE__ */ console.log(`Warning: ${ob} cannot be bound on`, this, "\nproperty", p, "\nerror", error);
            }
          }
        }
        try {
          this[p] = func(...objs);
        } catch (error) {
          /* @__PURE__ */ console.log("Dynamic binding error", this, p, error);
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
        this[3] = this.richText ? sizeRichText(ctx, this.text, fontSize, this.fontName, this.rect, this.color, this.wrap)[1] : this.wrap ? sizeWrappedText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color, this.wrapAtWord)[1] : sizeText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color)[1];
      }
    }
    if ("w" in this.hints && this.hints["w"] == null) {
      if (fontSize !== null) {
        this[2] = this.richText ? sizeRichText(ctx, this.text, fontSize, this.fontName, this.rect, this.color, this.wrap)[0] : this.wrap ? sizeWrappedText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color, this.wrapAtWord)[0] : sizeText(ctx, this.text, fontSize, this.fontName, this.align == "center", this.rect, this.color)[0];
      }
    }
    fontSize = fontSize === null ? this.h / 2 : fontSize;
    if (this.fontSize === null && this.rect.w !== void 0) {
      let i = 0;
      let w, h;
      while (i < 50) {
        if (this.richText) {
          [w, h] = sizeRichText(ctx, this.text, fontSize, this.fontName, this.rect, this.color, this.wrap);
        } else if (this.wrap) {
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
    const lines = Math.max(1, this._textData?.outText?.length || 1);
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
    if (this.spriteSheet === null || !this.spriteSheet.sheet?.complete) return;
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
const urlTerrainPlain = "data:image/png;base64,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";
const urlTerrainForest = "" + new URL("terrain_forest-b1wfcO2N.png", import.meta.url).href;
const urlTerrainMountain = "" + new URL("terrain_mountain-BHSXZlOG.png", import.meta.url).href;
const urlTerrainWater = "" + new URL("terrain_water-CwCS32Q_.png", import.meta.url).href;
const urlTerrainPlainLandscape = "data:image/png;base64,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";
const urlTerrainForestLandscape = "" + new URL("terrain_forest_landscape-D3Gu9jdZ.png", import.meta.url).href;
const urlTerrainMountainLandscape = "" + new URL("terrain_mountain_landscape-BV1FewSh.png", import.meta.url).href;
const urlTerrainWaterLandscape = "" + new URL("terrain_water_landscape-BVknkFyj.png", import.meta.url).href;
const urlTerrainWaterEdgeN = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAk6QAAJOkBUCTn+AAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAWJSURBVHic7dtNbFRlFMbx57x3WkBSIhIQhARWBBa6cGEktXUUWLnhQ8fEuIAYnILAog4UFnY6mAiF8h2tAwv3EI0LF0aNzgwQDAQT0SAsTIiJiBg0Sg1IO+9xQTszLW35mnun9Dy/VZn7cd7O/XN7M01FVUF2uVovgGqLARjHAIxjAMYxAOMYgHEMwLhYLYe3nXijQX39yoF/q1cBABGR0mvQ8tfSv927214DAMGt4ypfc778te/f7qTynOVzSf++g2eW1yIysP32YyrnOsjw6+tfd+n7AIqT/ax96Xi6b/h3KHw1DUCL9WmFvl16of+tUgz/4VTpvZTydhm0hw7dDC1fi9K+WnlUxQdhlSkNe/7+HaRyfVL5pVSs4raTQmXw96UArgWXiwD2okakVp8EpnLJBeLkLIC6mixg7Pint7c4f9/iw7/XYnjNngGckwPgxQeAKXX1wfZaDa/JHWBTfu1yiH4S+eCxS53Is51N3aeiHhz5HSCTWz1RRfdEPXeMk6LqQal4eIxK5AH0uPo2AeZFPXesE+CZVD65KvK5Uf4I2JpbO6/P6TkAkyIb+nC5EtzU+TuWZP+OamCkd4A+p7vBiz+aGb4O6SgHRnYHSOVblorgi0iGPdz6HIKnOpvf/ymKYZHcAZJnknUiuj+KWeNAzIs/ENWwSAJo+BcbAVkYxaxxQXVJqtCyIopRof8I2Jx7a6a64gUAU+7j8L8AFFQkr4qci+FX6fVbVGQdgAnVXenYosDFBv/fwnT8oxthzgn9dwHqip24+4v/pygKXpBz3ucnx2efTSPth+zTmvp6/X6J9W0D8DoifJAV4MsifEegsUClmADkZQAzQ5o175pM2AxgWxjnL80J8w6wKd+yCIITGPo7m7KrAPJQzcMFua6m7h8Ud7+g1kLyyQCyHcBL1VjvSBT4Bl7bu+LZ45WvZ5BxPbnLzQiQgOpKADOqPPp6EOiCHY3ZX6p83pLQAsgg43oKv50G8HTFuD8AX4C4XFF9fm/zoR/v5YKPJFVoaRZgB4BFD3quIY7BS/uueHfuTjsmjiaCuY9Pex7wCcCtAHT6gw5X4JTr09d2vpj9+UHPNZLQAkgVWt4U4F2I5EV93gWa62w8fK4aF3zEmceSy0TxXhUeOE/C+/Zd8UNf3c/BiaOJYO70R19A4BJQrAAw7R5PcUNU0hevXN195JUjxftZw90KLYC2Exue6Gw8eCmUk4/i1v/Ex1YByACYfW9Hy2nx2r4z/uHn1VpPJpeJXQsuL4b6hECWA5g66gqAb73X1V3x7PlqrWHUeeP1L4NaT7ZOit28vkFFt+AObzqA78RJeudz3Z+FuabkmWRdQ48uAVxCBMsAPFqx+YYA70xunrVnmAff0IzbAAZsPb5uaq8Wt4jKRgATB21UfK9OO7qasp9Gva7MuUR9z9WpSwG8CrhZzsn6zsYPLkS9jnEfwIC23Jo53gUdAFap4jwcOnY3ZT8O85nkYWAmgAFtuTVzHonPuRTlbXYsMxcADca/CzCOARjHAIxjAMYxAOMYgHEMwDgGYBwDMI4BGMcAjGMAxjEA4xiAcQzAOAZgHAMwjgEYxwCMYwDGMQDjGIBxDMA4BmAcAzCOARjHAIxjAMYxAOMYgHEMwDgGYBwDMI4BGMcAjGMAxjEA4xiAcQzAOAZgHAMwjgEYxwCMYwDGMQDjGIBxDMA4BmAcAzCOARjHAIxjAMYxAOMYgHEMwDgGYBwDMI4BGMcAjGMAxjEA4xiAcQzAOAZgHAMwjgEYxwCMYwDGMQDjGIBxDMA4BmAcAzCOARjHAIxjAMYxAOMYgHEMwDgGYBwDMI4BGMcAjGMAxjEA4xiAcQzAOAZgHAMwjgEYxwCMYwDGMQDjGIBxDMA4BmAcAzDuf7SlllCaB2EXAAAAAElFTkSuQmCC";
const urlTerrainWaterEdgeNe = "data:image/png;base64,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";
const urlTerrainWaterEdgeSe = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAk4wAAJOMBC1AsFAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAa+SURBVHic7d1LbFRVHMfx3/9My4CtAoVQMAYMBk3YqBCDBPqwlLBwpYkYE0OCBqclpkA70yqE1BJ5SFsgYF9gbNCokW5YiFUSSV/SBQsSTVgQSUQNDyVVqDQ4Zc7fBRZLO9PO3Humt73n/9l15p5/D5kvd+48AsTMEPZSXm9AeEsCsJwEYDkJwHISgOUkAMtJAJaTACwnAVhOArCcBGA5CcByEoDlJADLSQCWkwAsJwFYTgKwnARgOQnAchKA5SQAy0kAlpMALCcBWE4CsJwEYDkJwHISgOUkAMtJAJaTACwnAVhOArCcBGA5CcByEoDlJADLSQCWkwAsJwFYTgKwnARgOQnAchKA5SQAnyIQJXOcBOBD5T2bF1d0h0LJHCsB+FBA81pi7A53hOaOd6wE4EfMxQByFKm94x0qAfhMDWoUCEUAwMRvRnpCK8Y6XgLwmf6e688CyPnvR4KmhhrUJHycJQCfUTq2dsRNy293Xkl4QSgB+A4Vj7yFiRJeEEoAPlLeWz6DgVVx7ppNivbFWyMB+IiKDqwGMD3B3W9UdGx+ftSa9G5JTCjFo07/w5BSetQFoQTgI8Sjn/9HWNbfebXkwTXyP4f6QrgjNJcU/Q5gvM8A/syk6FN78j7+A5AzgG+QUkUY/8EHgNlRzrx/QSgB+AWN+fz/4KGgjUMXhBKATzBj5BtAYyGldGMNapRcA/hA5ZnQE5xBP6W6jsBvyxnABzhDJX36f2AdaIsE4As6ldP/fUw4IAFMcffe2KEXUl1HwI+/XOs7JgFMcQMdV5fh/49/k8agrSdeORGTAKY4TXg51TXEOFmb33QGADLMb0lMhKqOTY9pFTgMwkspLo0ixuGhHySAKWZ92/rAwvlzykgFdgHITnU9Ex+qLWq5NPSzBDCFRHpCKxbl5jSD+Rkn6wm4/s+04O7ht0kAU8C2jo2zMgLT94ApBBfv3jKw4/CKw7eG3yYBTHLhzpLXMlXwIDPnuhx1Pjt/QevIGyWASaqyq2QJEzUSodjEm/UMbK1GtR55uwQwyZS1lwWnPRStIsJ2MAeNDCVqq8tr6op3lwQwiUS6SouCWdwE4EmDY+9kxFCZ6E4JYBKInC2dh0GuB+F189O5fm9h88+J7pUAPEQgqugKbSJgHwizzf8GvjKgM+J+HXyIBOChis5QMRFa0jWfge0NhQ1/j3WMfBbgIQWelb7pdK4+/+gn4+9BeEYrzEzbcOYtjPG/7iUBeIg0PZKWuYQvaguae5M5VgLwEKXnDDAQ40BVsgdLAF7idARAtfX5Db8me7QE4CFtPoDfsrP0/lQWSAAeIjIdAFdVL28ZSGWFBOAtkwH01ua3fJ7qIgnAW6ZeBTCz3uJkoQTgLVNngE/rCo6ec7JQAvCWiQBuq0Dmu04XSwDeMhAA7f1g1ZErTldLAB4pay8LAnD3hQ/iy9n6Tr2bERKAR4IzB13/7SeNSHVh6x03MyQAj8Siyu0rgO79BS1tbvchAXhEZbCbM4DWIEcv+0btw8QQkTrSrgJorc9vOm9iHxKAR4i4wOHS/sHB2A5T+5CvhE0wAlG4K7QfQHjcg+OtZ3r/0Jpj143tR/6NoIlT1l4WnJYVPU7Aq44GEC5lz+lbWr30RNTUnuQMMEG2dWycFcyafhKA01M/GBw2+eADcgaYEO98H1oYi1E7gKUuxpypzW9eY2pPQ+QMkGYVPSVPK42vATzqYkwMpLaZ2tNw8iogjcKdJWuVRjdAbh58EHCsNq/xB1P7Gk4CSJPKrpINRDgF4GGXo25qzTtN7CkeCSANIl2lOxg4DiDT9TDGrrrClhvudxWfXAMYtL5tfeDx3JxGAG8ZGnnxVjYfMTQrLgnAkMjpDVmLcnO+ZOBFUzNJUUXL8uZBU/Pi/g55Gehe5GzpPNzFVwA/Z3Ds6dr85nUG58UlZwCXKrtKlhDwDQOLDY69y4S0vOwbSS4CXYh0lqxkoNfwgw+Am+vymi+YnRmfBOBQuLt0HQjfAZhjeHRfLDNWbXhmQhKAQ8Q6D8AM83Px3oGVH/WZnpuIBOAQgf5Kw9gLWbygKQ1zE5IAHNLExgNgovLqwuq7pueORQJwSGncNDzyVF1e07eGZ45LAnBIm30KGNRKlxuclzQJwDFtLABi/rB+9dGLpualQgJwiAPGngJuDHJ0l6FZKZMAHFIqYOQMwISdBwtb0/GKIinyVrBD2dH5ff3q6lZiZgIxK2JizZqJFZi1IiYmHvqn2oiJWWkmpnvHMzMRYpev9X3m5Z9DPgyynDwFWE4CsJwEYDkJwHISgOUkAMtJAJb7F7cIxao9ZUM0AAAAAElFTkSuQmCC";
const urlTerrainWaterEdgeS = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAk6QAAJOkBUCTn+AAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAU7SURBVHic7dpNbFRVGMbx5z13RA1gQIKCkLCVhRtdkdp2FFy5QdAxMcbgAtsgYFKKlIWdDibSgUENRNuBBbiF+LFwYQLRmQGCgWiiEiwLk8ZERUw1ShNqy5zXBYUO0vLVueeWPu9v1c6997yn7T/TaeeKqsLwcklvwCTLAiBnAZCzAMhZAOQsAHIWADkLgJwFQM4CIGcBkLMAyFkA5CwAchYAOQuAnAVAzgIgZwGQswDIWQDkLAByFgA5C4CcBUDOAiBnAZCzAMhZAOQsAHIWADkLgJwFQM4CIGcBkLMAyFkA5CwAchYAOQuAnAVAzgIgZwGQswDIWQDkLAByFgA5C4CcBUDOAiBnAZCzAMhZAOQsAHIWADkLgJwFQM4CIGcBkLMAyFkA5CwAchYAOQuAnAVAzgIgZwGQswDIWQDkLAByFgA5C4CcBUDOAiBnAZCzAMhZAOQsAHIWADkLgJwFQM4CIGcBkLMAyFkA5CwAchYAOQuAnAVAzgIgZwGQswDIWQDkLAByFgA5C4CcBUCOLoAtpbWLc8jRfd0TEVVNeg9BbCmtXexd1AVgjSr64NC1q7H4sYLkGzCBaR/A1mPr5o5otUNUNgK475qDiu/UaVehsfhZ6H3lzmRmDA7MfQbAi4Bb6Jyszzd8eDb0PqZtAG0n2u5PDV/coKIdAObe5PRvxUl2x5M9n8e5p5ZvWu6ZPagrAJcRwUoAc2oODwnw1symhe9mkfVx7qNWbAFsOb7hkXzDnl9jWfwGMocy0ZKHH1wDIAdg0e1dLafEa+eOdO8X9dpPrpRLXYjOLYf6jECew01iFOBr7/XVQrrYV6893HBeXAG0V1pfE+BtiJRFfdlFWso37DsT5+/c9qMtK0XxDiBLJ7nUCXjfuTO998idXJw5lImWzJ/zFCKXgWIVgHm3ucSQqGT7zw/sOvjCweqd7OFWxRZADjk3WPntFIDHa8b9AfgKxJWq6svvNe09XY8g2iutTQJ0A1g22bX+5yi8dO5M95RuduLlZ555zYDPAG4VoPMnO1yBk+6SvrTj6eJPk11rIrG+Bthcbl0GwXEAMsEpAwDKUC3DRaVCY88PtxNEW6XlsQiyHcCz9djvRBT4Cl47C+nisdrHc8i5wdK5JkTIQHU1gIfqPPpiFOmj3Q3Fn+u87lWxvwjcXGn9CMArt3j6n6KoeEHJeV+emV70/XgviNq/XL9EUpe2AXgZAf+XIcDhKnxXpKlIpZoB5HkAC+Kap4psobl3W1zrAwECeLP0+gJ11bMAHriDy/8CUFGRsipKLoVfZMR3qMg6APfWd6dTiwL9s/2/S7Pp/UNxzgnyZ2B7pWWTQAqxD5pGFFhdaOr9JO45QZ4+L8zEbkB/DDFrWhA5EuKHDwQKoPhEcURV3ggxaxq45NRtDDUs2AuoQnPvYQBBqr6bieqefNMHwZ4tg74rlvKyCcDFkDPvMufdCHIhBwYNYHu6px/QfMiZdxVFR/eK4t8hRwZ/X3yWH84r0B967lSnwMlCc/FA6LnBA8im9w+JSlvouVOcRiIbkrg3IZE7Y3Y293wqwOEkZk9JggP5xp6TSYxO7NYo73UjgJGk5k8h/4wMV7cmNTyxAArpYp9Adic1f6pQka73l+/7Pan5qaQGA4BEwzn4GaevfK5eBQBE5Oq7hwod+1hGj3t33WMAILh8Xe1jzo997EePO6ldc2wtGT332pljexG5cvz6a2rnOsj4+xvd99WvA6jOqi7YM/53J4xpe0uYuTV2ezQ5C4CcBUDOAiBnAZCzAMhZAOT+A0T1f5Fw5q+pAAAAAElFTkSuQmCC";
const urlTerrainWaterEdgeSw = "data:image/png;base64,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";
const urlTerrainWaterEdgeNw = "data:image/png;base64,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";
const urlTileCastle = "data:image/png;base64,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";
const urlTileVillage = "data:image/png;base64,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";
const urlTileAbbey = "data:image/png;base64,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";
const urlTileFarm = "data:image/png;base64,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";
const urlTileMine = "" + new URL("tile_mine-Dj_c2A0m.png", import.meta.url).href;
const urlTileStronghold = "" + new URL("tile_stronghold-uQdux0XU.png", import.meta.url).href;
const urlTileTradeship = "data:image/png;base64,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";
const urlTileRubble = "data:image/png;base64,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";
const urlTileEnemyTent = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAACXBIWXMAACTWAAAk1gH91ni8AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAADyRJREFUeJztnXtsW9d9x7+/87iXL71FyRIpW7G7JI0du0mcSLblpGxsy5KbGF2RZMW2AusfS/8oimH/7PFPEAwBhg17NEObvYCtKNA29rYsj7Vw0tZGmjhZ7SBPLyicbXHi1I/IkiVK5CV57zn7g6Qm06RESiTvNXU/gGCZPPfeI350zv2dc3/niLTW8GldmNsV8GksvuAWxxfc4viCWxxfcIvjC25xfMEtji+4xfEFtzi+4BbHF9zi+IJbHF9wi+MLbnF8wS2OcLsCrQIRjQO4D0BOa/2Y2/Up4rfgOnCUiAeBCQB/BOAP3K7PUvwWvEr+jWizA+xD4esW4K233K5UGXzBVfJDokEB7NF5oZMA4kvfJ4/2hr7gCjxD1OcA9xWE7ufATctlrxFAzapbLfiCCxwlimhglAH7ClLvRA3SfMEe4yhRUAN7AIxR/t/7CJCrzTH1BbvMUSIO4HMa2Ef5FjpGQKBe5/fvwS5QEunuB9DZwGbmt+BGs0ToGIAvAIgBwBUhsMAYNmaz15S3ifChYeBDKXFeSkwLgU85hyJC1LbR4zgYyOWwMZvF5mwWgZJFAheFgEOEWC7nd9GN4AdE/RK4txAUHQAwXK7cd7u6wLTG701NQQF4PxDAyVAIvzRN2HStF601iAjnC9LfDuR7cQ5gcyaDXakUtlsWhNZ4sa0NZ00Tj1+86AuuB88RtVnASDHSFcCdeoUPNskYPpYSbY6D45EIXg6HMcN5xfJE5U/nADhrmjhrmggrhT0LC7gsBJKM4bxhgLJZ/x5cKy8QhVLA7oLQMQAjBIhaIt0sETSAOc7xbHt7Xeq1wBhebGtb/H8mfw2/Ba/ECSLxKbBjSaS7lwBzLcvjehwHUdvGp6IxP2pAawxns34XXY7Hidg24LMqPw4t3kc76v1J7bAs/CQSKfvegG1DKoVPDANOyXsEYDAfQOETKVHuF+1Wy4LU2h8mFVk6dLkN+IICehp9zUq/MF+bnsZ2ywIAXBICfxWNwircgwnAN6amsKUQeX8kJb4VjV73S1C0um5b8FGiDQTsLUS6BwFsbPQ1SzljmmVfH8zl8DSA1wGEbRsqkwEKUbPK5fC9XA4zAG4D8FuOA6k1nJIgrBiJk9brR/D3iMJB4OsaeBTAr7m5xHyGc/xKSoSVwgK7thd9srcX6elpXMjlwBhDO/5/aiunNc4yBttxoDnHX3Z3L7buIsVznpPSs1E0NXKFf7H1AhgrzPvWNIFfD7JEeCMYxAzn10S+9WBnOo2tloUtmQz+Wan3XgG2Achores2BbpWGtpFP6T1RQBHC1+uCDe0xq5UCicqBFlrIaQU7kinAazje/BS3BTe6ZSGR2unY8k5fcFlaKbwgVzuute6HAcPzM2hXSl8YBg4mEwiRwQH+fHta6EQglpDao0X2tpwQcprjh+89py+4JUoFV6ca0YdhEdt+7pA64tzc7iz0MVuzmQAAFJrFDWOpFKLw6CwUvjr3t7FYzmAjUsE++PgVfAVrS+hTsIZgLtL7sVLZ7cYgHcDAVzhHF2OgyTnGFtYWHz/cslM2FbLQlippS95sgU3NIpuNLUKzxLh2z09OGcYi691Ow7CSiFLhE+FAAcArWETodu2EdIaVuG9Ir22jW9OTaF9ieDvAB+cAD4Dj0XRN7TgUqoRniXC8+3tOBkOXzcrtRIE4I50Gl+enS1tvXgK+O/jwBb4gpvHcsKnOcdr4TDeCQQwJURF2YT8A4vbLAu7UqmywRoAPAX8z3FgM3zB7lFJuE2EBcaQA+AUHi8KrSGQD65kFZ/RU8D/Hgdugi/YO9QzSv9b4NzPgE3wBXuXtQj/O+Cjn+YfpPiCbxRqEf73wMc/AYbgC3aXRCIhLCP0XSL9gNL42uvHfvQv1R67nPB/AM6/lF+v5At2i52JB3ultJ/R0HuQF6Oh8cR/jo0+ph97TK10fCmFqdXPA7jvW8DeV4Ct8AW7w+79h27XpH/MDRkNBILGfHIO0f4BXLl8IaeAn9lO7pHTL700u9rzE9GfIr822FOCPTl/Wm9G9h88pJh+PRAO9/XF4gYvpM2aoRD6YkOSc5GQZLx598TELS5Xte60tGAiotH9E38Ixp6LdHQEu/s3SEbX/shCGuiPDRlGKBAXik7t2n9wn0vVbQgtK3jH+Hh4ZHzyGWL0J719G1hnd2+FlHaAMYbohkEZ7uiIaMaO7Tow6altGNZCSwoenZyMhzR/jTN2sC8WF8FwuKrjOrt7qTvax0D6idEDE99PJBKeuZeulpYTPLp/YowcvC0D5q398SFTGuUzKisRirShLzbEBRe/npbBn9+TOLShQVVtCi0leHR88neJ0YlQpK0zOhCTjFVeg7Qc0jDRF4ub0jS2c0O9c8++ibvrXNWm0RKCE4mEGDkw+TcAvtPZG+Vd0T5WaRFZtTAh0D8YN4KR9m7G8OrI/smv1qe2zeWGFzyyb1+PJYPHOcOj0YFBHm6rzwIzAAARuqN9vCvaJ4nhn0b2TzxJjz9+Q31mN1RlSxndN7GdMeMdYch7+mObpBkINuQ64bZ29PYPMMbo6yMnXz92R+JLnQ25UANwXfCe+ye37Bgfry7MXcLIgYmHiNMvAuFQf19syOCysellgVAI/fGNUgh5b8DMvLl7fPzWhl6wTrgqeOzw4TZtsFMh8H+s9pjFyQuiH7Z1dhk9/QN8rffbahFSoj8+ZJiBUFyBvzEyPv7Fplx4Dbgq2E5l/1g5TpeGyq5cGkgkEpHRAxPPFicv2ru6m57JSMTQu2FAtHd2Bgn8Wa9PiriWNrvn/kObSNLvG4aJjJVZMf9tz/2TW5QM/YhxPty7YUDIJZmRbtDe1UPSMGn68qUndo1P3iGEPG/b5fO13MS1Fqwl/qy7qxuDsbgCKXu5sveMH7rX4ThtBAPD/fEhw225RYLhCKKxIU6cf2n77r1fNQLem/hypQXvGj80Aq0e2jm6m94/855DmlVswSMHDu1kUCekYUAIQbNXptZ8/WzGArTG9KWLaz4XAJiGaUCp3ttHduONl4/X5Zz1whXBjNGT8U1bnGh/v/ivM+9qDb1MF63uIsaUlAbXqsZn8kRld82hQtYNsdo7MCICsTLn5JyUUpBSemqFQ9MF7xqffISI7rpz5878IgKlAVDFLpo04oZh5rr7N6xu3rEMyZlpZLMZBMMRBEKhupxTKYVUcg5e66abeg+enJw0GWN/cevWbSwcyS/G1kop0rpy0yTEuRC1PTGoktnpK2U3VlkNrNAbGGbAUy24qYIjkYitNWbS6dRil6yVI02Wq7wRC7HNXIiGfGi5bAbWwnzdzseIrW/BR44ccaBzj374wQf8ciHA0VoRw3INGEN8mZ3p1srs9DTqlZfGpYAMmOtXMACcPHbsJIie/sXJV7MagNIapJZbB6b7ecnC63pi57JIzSfrci5pGjAaNB++WlwZB2ulv311ZsaYn5sFlAZBlW1CiUQiorUOcd7YWLBerVhwA4FQaH23YADQwMPdPb2ZtvYOKKWgWflxcMYw4gDAReO6aABQjo352atrPg8THGZgHd+DAWD37oeDnNHv3LJ1qwnkt+9luvw42NYsBkA3ugUDQPLqDFSt4+wSOBcQ0ljfglV47jcYF+bw8GakUwtYmJ8HgLLjYNIU45xnmlIvpZCcnVnTObgQYIxh7PDh+m7ItQaaLphz8c3P3HyzsKw0XnzheRi5JG7B5X8vW5hUnImadg+unjIzXAtXZ+HYq99uqdjTOCknvkLRptFUwSMHD+5wlPO5gXicXvyP57Ni4Qp2qHMI69RCufKkKSZEA0PoEpRWSF6dXvXxTHCASAF2rI7VWhNNFcwUfSMYCjonf/5yzrLSr2xXH4EvN4nFaJiLBm30XIGF5BycCts0rAQB4IxlFaP1J3js8OE2Ivab6VSa5zLZn95s/erLy01wAAABmxodQZeitcbszOpbMRcCTNH666JtK/vbSqsgMfav2amLDw7jqrXSMZow2IwIupT0fBLZbFVJJtfBhZCKqfXXgjmTpxhnfz7UHn7k9OnTK/aBiURCKKU7eKN66GUmNjSA5PSVVZ2WC8EZ2PDqKlV/mtY8Xv3xc6cAnKq2fFKIQQEw4UILBoB0agEZK41aU3E5lwDRpgZVq2ZcT5utBNciBgDMJcEAMFdoxcnZq5i+fKmqYwoxw0DjalUbnhVMnGLEeLZc9kSzyFgWrNQCpJRIz89DqZXHyFxIaMfp3Pbww55IHPPuZqQKcW7y+m/yXAP73j+D8Jl3ETRMOMk5mG+/CUMrMNsGd2xw24FwbPCcjbPbbsdbu8bykx1E1HFlYQDAOTfrD3hZMNMxLpo8RirhsxcvwLCXTfhchBfKFYd1WtgxeECwd7to0JAQwtVuzq4hKY8Xdn8nIjDOstojY2HPtmDS2OzGGHgpuTKZJDlpAIyQNQxoIuQME5oIyY6OxTKcCSfrkbGwZwWDdKxhY+AqeXrnCIxwBG19ffj4k/Po3TiMapLumRSccjlPCPZkF01EpDSibo2BiyQDAaRDIVhSwmEMpTv0VEJwYRB00/8AWDk8Kfiuzz/QA0Ayl1swkE+HXUy4r/KezIUEEd3UwGpVjScFczMbAxqfqlMNRFRIzgdYlWPyQr39LroiDuJE5Kx2E5V6whhBFeatq12HzLmA0rqXmrVweRk8KZgYizHGvbEWkxig1OLKhWootGC5d2Kid6WyjcaTgqFVrJG50LXAiEFpBaoywALy92AAsGz3H/x7VDDiQnBPzOUSy9+Da1mJyBgDEdlEtuuTHZ4UTJzfxIVobN2qvD0WW3Ctzzw45zbyab+u4k3BwEbBvdFFE2OAVlUPkYpwLkHwu+iyaK02MA8MkYB8F62UrinIAgAuuAnooQZVq2o8J3jngw+GtEa4GKi4DbHagywA4FKSFyY73J8qKkFYVgzgcBwb2Uxjct4d2142J+uastncYvlsZsU8wUW0zj8RW20d64V7gqNhhZnUGwBAYIuJ74rIYqDUlYsX6rO3QmU0qvibSFOXLix+b6VSNV2AiF2uuVZ1xpN/lGPH+Hi4XcqGDpNmAXSsWGptzIRCC+8dObK6/Ns64UnBPvXDc0GWT33xBbc4vuAWxxfc4viCWxxfcIvjC25xfMEtji+4xfEFtzi+4BbHF9zi+IJbHF9wi+MLbnF8wS3O/wHbV+lGPAJOHQAAAABJRU5ErkJggg==";
const urlTileEnemyStronghold = "" + new URL("enemy_stronghold-BIExWOdt.png", import.meta.url).href;
const urlTileEnemyCastle = "" + new URL("enemy_castle-A0j23WzM.png", import.meta.url).href;
const urlTileEnemyLongboat = "" + new URL("enemy_longboat-hwwJ7-Lx.png", import.meta.url).href;
const urlTileEnemyDragon = "" + new URL("enemy_dragon-AI-10fC-.png", import.meta.url).href;
const urlResourceFood = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAACXBIWXMAACTWAAAk1gH91ni8AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAABR5JREFUeJztnF+IFWUUwH9rSyBYYqyVPYT9oyQxqCD6B9X2EBS0Z4MeKs1CeguEHqzHStqUoIjeInpwESLwFCThS1FRYBtKZpbigkolBdZGZpvuWg9zl5Ztxrl7vd+c7x7PDy5cZu7OOezvnm++b+bM7RsaGiLwywLrBIK0hGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDnhGDn9Fsn0Iuo6mLgHuBW4FrgOmApMA3sAV4RkQ/tMvyPvvidrPZQ1fOBtcCjwG2cuThOA2tFZEsDqZ2REFyDqi4AHgJGgKvm8aeTwO0isitJYm0SgitQ1T4KsS8AKzo8zB7gRhGZ7lpi8yQmWSWo6r3AGPAuncsFWAU81ZWkOiQqeBaqeifwEnBHFw/7O7AN+Az4VETGu3jsWkIwoKo3ARuB+xoI9wXwJjAqIlOpg53TglV1BfAiMAz0NRz+K+B+EfklZZCeWwer6mXAlcClwDLgYmCAYj6xpORPTgJ/tt6fAiZar5XAY8B5iVOu4mbgNeCRlEGyrmBVXQjcBQwCN7ReSy1z6jJTwBIROZ4qQJYVrKqXA89RfLsvNE4nJf0Ua+uvUwbIBlVdBGwAngEWGqfTFL+lPHg2glV1FfAecIV1Lg3yiYgcSRkgiwsdqjoMfM65I3ea4sv8cOpA5hWsqo8Db9P8MqUpJoAdwHfAAeAQsFdE/mgiuKlgVR0E3sKn3GngZWCjiExaJWEmWFUHgK3YrUNTs15E3rBOwvIcvIniIoVHXs1BLhgJVtXlwBqL2A2wm2KplwVWFfwkGUzwEjAJrBaRU9aJzGAl+EGjuKkZEZFvrZOYTeOCW1erVjYdtwHGgc3WSczFooKvN4qbmmctl0NVWPyjLzGI2QTfWCdQhoXgAYOYTZD0pkGnhODuMWGdQBkWghcZxEzNCRE5aZ1EGRaCkzeaGfCrdQJVWAj+u2b/JL33JchyeAYbwXVD2RjFOlmBf9Kn0xWynGCBjeC6teIREdkvIsMUnYfvYyv6NPARsBp4veIzIXgWdX3Ah2feiMguERmieARkC8U91qbYBzwPXCMigyIyClTdpM/2HGxxwf/nmv3/61ESkb3AGlXdDKyn6LZM0ZQ3DrwDbK24plw1N8j2HNwTgmdoiV6nqhuAdcATFA9gd8oURS/YdmC7iOxr4/NlZDtEWwg+WrO/tstQRI5RNAxsUtVbKJ5QeABY3kb8n4CPgQ+AHSIyHzlVp4io4BlE5LiqHqV47KSMwxXbq463E9gJPK2qVwN3U1T1MmAxhdAfKa4VfykiP3SaO1HBbXOAcsHHzuYxDhE5CBzsOKt6qio420mW1W277yu2J20C7wI9V8FWgvdXbJ/X8GxACG6TKsG5V3DVEB2C5+BtiM52Fm0l+DBwomR77oLLuiX/yrFVZwYTwa2fFdpdsiv3c3DZEJ3t8Ay2zW9jJdtyr+CeE2zZfD4CjM7ZVncZ05ptwEWt9/3ABdTf3zYl69/oCM4ej/3JwSxCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHNCsHP+BSH4FZEuasr1AAAAAElFTkSuQmCC";
const urlResourceOre = "data:image/png;base64,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";
const urlResourceTimber = "data:image/png;base64,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";
const urlResourceBlessing = "data:image/png;base64,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";
const urlResourceSoldier = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAACXBIWXMAACToAAAk6AGCYwUcAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAABVVJREFUeJztnVuIVWUUx39jFt0jqJCwCwQ+BIUUPVQEXey5WYFFE10IFJUe8sVegkCIHoIKK8XJ6UZFBbmgiNBq6iGCKJuCqMhy0IluOIKlaY0z9vDtAwdt0pk5+1vfXnv9YF6Gc8767/07a5+z9/n29/X19/cT+GWedYCgXkKwc0Kwc0Kwc0Kwc0Kwc0Kwc0Kwc0Kwc0Kwc0Kwc0Kwc0Kwc0Kwc0Kwc0Kwc0Kwc0Kwc0Kwc0Kwc0Kwc0Kwc1onWFUXq+oi6xy56GvDuGhVPQO4A7gbuLb69zZgEHhZRP6yylY3rgWr6pXAcmAAOH2ah+0FXgc2iMiXubLlwp1gVT0LuB1YCSye4dM7Xf2qiOzrdTYL3Aju6tY7gdPm+HJ/AK8BgyKyba7ZLGm0YFU9G1gK3A9cVlOZb4CXgGdFZE9NNWqjcYJVdR5wDXBX9XdKptIHgbdJXf1+pppzpjGCVXUBcA+wDLjEOM53wAvAkIjsNs7yvxQtuOrWG0mfrf3AibaJjuJv4C3SF7MPROSwcZ6jKFKwqp5POvyuAC62TXPcbAeGgOdF5HfrMB2KEayqJwA3kLpVgPm2iWbNP8BW0hezzSIyaRnGXLCqLiSd2qwCLjQN03t+Al4B1ovILosAJoJV9STgFlK33gT0ZQ+RlylgmPRZrSJyKFfh7D82qOpjpHf2G8AS/MuFtJ+XkLZ5VFXX5CycmweAcw3qlsJC0pErCxaCTb90FILfQzQhGDLugxBsg+sOzrZxBeO6gw8a1CyNA7kKWQh2OzxmBmTbBxaC9xvULI1s+yA62AbXgqODnQv+06BmabgW3LhxTTWQbRSIheBxg5qlke1NHoJtyLYP4hBtg2vB0cFxiHaP6w7+1aBmSRwGso26tBC8i7SRbeU3Ecn2g0t2wSJygIzngQWSdXSl1R3+JkNICyEEO2dnzmIhOD9jOYuF4Py0ooN3GNUtgdGcxawEf2tU15pJ4PucBa0E/0i6t7Zt7KhOE7NhIri6+Wq7RW1jsh+5LGe6czcn1XEwkrugpeDPDWtbkX2bQ3Bess+5ZSl4hDTdQVsYE5Ffchc1E1xNAPqZVX0DPrQoaj2dsMlGG9FKwcPG9XPSSsEf045BeF+JSNZr0B1MBYvIBGn+R+9stips3cFguPEZabXgd4GfrUPUyIiIfG1V3FxwdZh+zjpHjayzLG4uuGIQmLAOUQPjpPUgzChCsIiMARutc9TAI7l/HjySIgRXPIyvU6ZRYL11iGIEV+shPGido0dMAStExHxQQzGCAURkE/CidY4esFZEtlqHgMIEVywjTZPfVDYBa61DdChOcHXadBvwpnWWWfAksLyktRuKEwxQfXYtBR6lGTeqTQArRWR1SXKhgCn9j4Wq3kxa/2CBdZZp2AkMiMgn1kH+iyI7uBsReQ+4gjRbeklMkk6DLi9VLjSgg7tR1euBZ4BLjaN8AawSkU+NcxyT4ju4GxH5iNTNDwEWq4PuJq3ldFUT5ELDOrgbVT2HtCjlauDMmsuNA08DT4jI3ppr9ZTGCu6gqucBa0jrBZ/a45ffAzwOrBORRk7B2HjBHaqFoe8ldfRFc3y5H0gdO9T0haLdCO6gqvOBW0mH7+tm8NRJYAvwFLCltPPZ2eJOcDequggYAO4DLpjmYZ3l5zaKSNZ7d3PgWnCHauHLq0lXxwZIZw/vkC6gDIvIlGG8WmmF4G5U9WTgUM71Ay1pneC20agLHcHMCcHOCcHOCcHOCcHOCcHOCcHOCcHOCcHOCcHOCcHOCcHOCcHOCcHOCcHOCcHOCcHOCcHOCcHOCcHOCcHOCcHOCcHO+Rfg1EdigUrn0AAAAABJRU5ErkJggg==";
const urlResourceMoney = "data:image/png;base64,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";
const urlResourceWorker = "data:image/png;base64,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";
const urlResourceInfluence = "data:image/png;base64,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";
setPRNG("mulberry32");
setSeed(Date.now());
const gameImages = {
  "p": urlTerrainPlain,
  "f": urlTerrainForest,
  "m": urlTerrainMountain,
  "w": urlTerrainWater,
  "pl": urlTerrainPlainLandscape,
  "fl": urlTerrainForestLandscape,
  "ml": urlTerrainMountainLandscape,
  "wl": urlTerrainWaterLandscape,
  "1": urlTerrainWaterEdgeN,
  "2": urlTerrainWaterEdgeNe,
  "3": urlTerrainWaterEdgeSe,
  "4": urlTerrainWaterEdgeS,
  "5": urlTerrainWaterEdgeSw,
  "6": urlTerrainWaterEdgeNw,
  "C": urlTileCastle,
  "V": urlTileVillage,
  "A": urlTileAbbey,
  "F": urlTileFarm,
  "M": urlTileMine,
  "S": urlTileStronghold,
  "T": urlTileTradeship,
  // 'K': urlTileMarket,
  "X": urlTileRubble,
  "ET": urlTileEnemyTent,
  "ES": urlTileEnemyStronghold,
  "EC": urlTileEnemyCastle,
  "ED": urlTileEnemyDragon,
  "EL": urlTileEnemyLongboat,
  "rw": urlResourceWorker,
  "rf": urlResourceFood,
  "rt": urlResourceTimber,
  "ro": urlResourceOre,
  "rb": urlResourceBlessing,
  "rs": urlResourceSoldier,
  "rm": urlResourceMoney,
  "ri": urlResourceInfluence
};
const terrainNames = {
  p: "plain",
  f: "forest",
  m: "mountain",
  w: "water"
};
const tileNames = {
  C: "castle",
  V: "village",
  A: "abbey",
  F: "farm",
  M: "mine",
  S: "stronghold",
  // K: 'market',
  T: "tradeship",
  X: "rubble",
  ET: "enemy tent",
  ES: "enemy stronghold",
  EC: "enemy castle",
  ED: "enemy dragon",
  EL: "enemy longboat"
};
const tileDescriptions = {
  C: "A castle produces influence once supplied with workers, food, and blessings. Every structure adjacent to a castle has a production link to all of the other adjacent structures. Once placed, castles connect their production links to the links of any other castles in range 3. In this prototype, each castle producing influence scores you 1 point at the end of each round.",
  V: "A village produces workers once provided with food.",
  A: "An abbey produces blessings once supplied with food and workers. Blessings make other structures more effective producers.",
  F: "A farm produces food once supplied with workers.",
  M: "A mine produces ore once supplied with workers.",
  S: "A stronghold produces military strength once supplied with workers and ore. At the end of each round, units from activated strongholds will attack enemies that they can reach.",
  T: "A tradeship produces money once supplied with workers. Tradeships extend the accessible terrain of your empire to all terrain accessible from water in range 3 of the tradeship. Once placed, tradeships allow production links between all structures within reach of the Tradeship.",
  X: "Rubble is the remains of a structure or enemy that you can build over.",
  ET: "An enemy tent is a temporary installation that expands enemy reach but does not attack.",
  ES: "An enemy stronghold expands the enemies reach and will attack adjacent structures at the end of each round.",
  EC: "The enemy castle.",
  EL: "The enemy longboat allows enemy units to travel over water.",
  ED: "An enemy dragon lives in mountains and will attack structures in range 2 at the end of each round."
};
const tilePriority = {
  "ET": 11,
  "ED": 10,
  "ES": 9,
  "EC": 8,
  "R": 7,
  "C": 6,
  "T": 5,
  "A": 4,
  "S": 3,
  "M": 2,
  "V": 1,
  "F": 0
};
class ProductionChain extends Map {
  /**
   * 
   * @param {ProductionChainLike} obj 
   */
  static from(obj) {
    const prod = new ProductionChain();
    if (obj instanceof ProductionChain) {
      for (let r of obj.keys()) {
        const tiles = obj.get(r);
        if (tiles !== void 0) prod.set(r, [...tiles]);
      }
    } else {
      for (let r in obj) {
        prod.set(
          /**@type {ResourceType}*/
          r,
          [...obj[r]]
        );
      }
    }
    return prod;
  }
  /**
   * 
   * @param {ResourceType} resource 
   * @param {Tile} connection 
   * @returns 
   */
  hasConnection(resource, connection) {
    return this.get(resource)?.includes(connection) ?? false;
  }
  /**
   * 
   * @param {ResourceType} resource 
   * @param {Tile} connection 
   */
  addConnection(resource, connection) {
    const arr = this.get(resource);
    if (arr !== void 0) {
      if (!arr.includes(connection)) {
        arr.push(connection);
        return true;
      }
    } else {
      this.set(resource, [connection]);
      return true;
    }
    return false;
  }
  /**
   * 
   * @param {ResourceType} resource 
   * @param {Tile} connection 
   */
  removeConnection(resource, connection) {
    if (this.has(resource)) {
      const arr = this.get(resource) ?? [];
      if (arr.length > 1) {
        const index = arr.indexOf(connection);
        if (index >= 0) {
          arr.splice(index, 1);
          return true;
        }
      } else {
        this.delete(resource);
        return true;
      }
    }
    return false;
  }
  /**
   * 
   * @param {ProductionQuantity} quantity 
   */
  meets(quantity) {
    for (let r of quantity.keys()) {
      const q = quantity.get(r);
      if (q !== void 0 && q !== 0 && (this.get(r) ?? []).length < q) return false;
    }
    return true;
  }
}
class ProductionQuantity extends Map {
  /**
   * 
   * @param {ProductionQuantityLike} obj 
   */
  static from(obj) {
    const prod = new ProductionQuantity();
    if (obj instanceof ProductionQuantity) {
      for (let r of obj.keys()) {
        const q = obj.get(r);
        if (q !== void 0) prod.set(r, q);
      }
    } else {
      for (let r in obj) {
        prod.set(
          /**@type {ResourceType}*/
          r,
          obj[r]
        );
      }
    }
    return prod;
  }
  /**
   * 
   * @param {ProductionQuantityLike} prodLike 
   */
  add(prodLike) {
    let prod0 = ProductionQuantity.from(this);
    let prod1 = ProductionQuantity.from(prodLike);
    for (let r of prod1.keys()) {
      prod0.set(r, (prod0.get(r) ?? 0) + (prod1.get(r) ?? 0));
    }
    return prod0;
  }
  /**
   * 
   * @param {ProductionQuantityLike} prodLike 
   */
  subtract(prodLike) {
    let prod0 = ProductionQuantity.from(this);
    let prod1 = ProductionQuantity.from(prodLike);
    for (let r of prod1.keys()) {
      prod0.set(r, (prod0.get(r) ?? 0) - (prod1.get(r) ?? 0));
    }
    return prod0;
  }
  /**
   * 
   * @param {ResourceType} resource 
   * @param {number} amount 
   */
  addResource(resource, amount) {
    const current = this.get(resource);
    if (current !== void 0) {
      this.set(resource, current + amount);
    } else {
      this.set(resource, amount);
    }
  }
}
class Level {
  constructor() {
    this.levelSeed = null;
    this.tileSet = "CCVVVVVVVVVPPKKMAAAAAFFFFFSS";
    this.map = ``;
    this.boardSize = 0;
    this.start = [4, 4];
    this.startTile = "C";
  }
}
class EmptyLevel extends Level {
  constructor() {
    super();
    this.id = 1;
    this.map = `
            ppppp
            pppppp
            ppppppp
            pppppppp
            ppppppppp
            pppppppp
            ppppppp
            pppppp
            ppppp
        `;
    this.boardSize = 9;
    this.start = [4, 4];
    this.startTile = "C";
    this.tileSet = "CCVVVVVVVVVPPKKMAAAAAFFFFFSS";
  }
}
class TMap extends Map {
  /**
   * 
   * @param {string} stringMap 
   * @param {number} [size=9] 
   */
  constructor(stringMap, size = 9) {
    super();
    this.mapSize = size;
    let r = 0;
    for (let row of stringMap.trim().split("\n")) {
      let c = 0;
      for (let t of row.trim()) {
        this.set(r * size + c, t);
        c++;
      }
      r++;
    }
  }
  /**
   * 
   * @param {[number, number]} hexPos 
   */
  at(hexPos) {
    try {
      return this.get(hexPos[1] * this.mapSize + hexPos[0]);
    } catch {
      return void 0;
    }
  }
  /**
   * 
   * @param {[number, number]} hexPos 
   * @param {string|undefined} value 
   */
  put(hexPos, value) {
    this.set(hexPos[1] * this.mapSize + hexPos[0], value);
  }
  get hexCount() {
    return 3 * this.mapSize * (this.mapSize - 1) + 1;
  }
  toString() {
    let str = "";
    const w = Math.floor(this.mapSize / 2);
    for (let r = 0; r < this.mapSize; r++) {
      const width = this.mapSize - Math.abs(w - r);
      for (let c = 0; c < width; c++) {
        str += this.get(r * this.mapSize + c);
      }
      str += "\n";
    }
    return str;
  }
  *iter() {
    const w = Math.floor(this.mapSize / 2);
    for (let r = 0; r < this.mapSize; r++) {
      const width = this.mapSize - Math.abs(w - r);
      for (let c = 0; c < width; c++) {
        yield this.get(r * this.mapSize + c);
      }
    }
  }
  /**
   * 
   * @param {[number, number]} hexPos 
   * @returns {Generator<[number, number]>}
   */
  *neighborPositions(hexPos) {
    const xOffsetLeft = hexPos[1] <= Math.floor(this.mapSize / 2) ? 1 : 0;
    const xOffsetRight = hexPos[1] >= Math.floor(this.mapSize / 2) ? 1 : 0;
    const offsets = [
      [-1, 0],
      [1, 0],
      [-xOffsetLeft, -1],
      [1 - xOffsetLeft, -1],
      [-xOffsetRight, 1],
      [1 - xOffsetRight, 1]
    ];
    for (let offset of offsets) {
      const x = hexPos[0] + offset[0];
      const y = hexPos[1] + offset[1];
      if (this.has(y * this.mapSize + x)) yield [x, y];
    }
  }
  /**
   * 
   * @param {[number, number]} hexPos 
   * @returns {Generator<string|undefined>}
   */
  *neighborIter(hexPos) {
    const xOffsetLeft = hexPos[1] <= Math.floor(this.mapSize / 2) ? 1 : 0;
    const xOffsetRight = hexPos[1] >= Math.floor(this.mapSize / 2) ? 1 : 0;
    const offsets = [
      [-1, 0],
      [1, 0],
      [-xOffsetLeft, -1],
      [1 - xOffsetLeft, -1],
      [-xOffsetRight, 1],
      [1 - xOffsetRight, 1]
    ];
    for (let offset of offsets) {
      const x = hexPos[0] + offset[0];
      const y = hexPos[1] + offset[1];
      const t = this.at([x, y]);
      if (t) yield t;
    }
  }
  getNeighborCount(hexPos) {
    let value = 0;
    for (let t of this.neighborIter(hexPos)) {
      if (t !== void 0) {
        value += 1;
      }
    }
    return value;
  }
  hasEdge(hexPos) {
    return this.getNeighborCount(hexPos) < 6;
  }
  /**
   * 
   * @returns {[number,number]}
   */
  getRandomPos() {
    let y = getRandomInt(this.mapSize);
    let w = Math.floor(this.mapSize / 2);
    let width = this.mapSize - Math.abs(w - y);
    let x = getRandomInt(width);
    return [x, y];
  }
}
class RandomLevel extends Level {
  /**
   * 
   * @param {number} size 
   */
  constructor(size) {
    super();
    this.start = [4, 4];
    this.startTile = "C";
    this.boardSize = size;
    this.tileSet = "CCVVVVVVVVVPPKKMAAAAAFFFFFSS";
    let mapString = "";
    const w = Math.floor(size / 2);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size - Math.abs(w - r); c++) {
        mapString += "x";
      }
      mapString += "\n";
    }
    let tmap = new TMap(mapString, size);
    this.makeMap(tmap);
    this.id = 1;
    this.map = tmap.toString();
  }
  /**
   * 
   * @param {TMap} tmap 
   */
  makeMap(tmap) {
    const startPos = tmap.getRandomPos();
    const basePlacementSet = ["p", "p", "p", "f", "f", "m", "m", "w"];
    function recursePlacement(position) {
      const adjacencies = [...tmap.neighborIter(position)];
      const countWater = adjacencies.reduce((prev, cur) => cur === "w" ? prev + 1 : prev, 0);
      const extras = adjacencies.filter((val) => val !== "w");
      const atEdge = tmap.hasEdge(position);
      let placements = [...basePlacementSet, ...extras, ...extras];
      if (countWater === 1 && !atEdge) placements = ["w"];
      const terrain = choose(placements);
      tmap.put(position, terrain);
      for (let hp of shuffle([...tmap.neighborPositions(position)])) {
        if (tmap.at(hp) === "x") recursePlacement(hp);
      }
    }
    recursePlacement(startPos);
    const startTerrain = tmap.at(startPos);
    const basicTiles = ["C", "V", "A", "F", "S"];
    this.startTile = startTerrain === "w" ? "T" : startTerrain === "m" ? "M" : choose(basicTiles);
    let tileSet = "CCVVVVVVVVAAAAFFFFS";
    const mountainCount = [...tmap.iter()].reduce((prev, cur) => cur === "m" ? prev + 1 : prev, 0);
    const waterCount = [...tmap.iter()].reduce((prev, cur) => cur === "w" ? prev + 1 : prev, 0);
    if (mountainCount > 0 && this.startTile != "M") tileSet += "M";
    else tileSet += choose(basicTiles);
    if (mountainCount > 2) tileSet += "M";
    else tileSet += choose(basicTiles);
    if (mountainCount > 5) tileSet += "M";
    else tileSet += choose(basicTiles);
    if (waterCount > 0 && this.startTile !== "T") tileSet += "M";
    else tileSet += choose(basicTiles);
    if (waterCount > 2) tileSet += "T";
    else tileSet += choose(basicTiles);
    if (waterCount > 5) tileSet += "T";
    else tileSet += choose(basicTiles);
    this.tileSet = tileSet;
    this.start = [startPos[1], startPos[0]];
  }
}
var levels = [new RandomLevel(11)];
class Tile extends ImageWidget {
  constructor() {
    super();
    /**@type {TileType} */
    __publicField(this, "code", "F");
    __publicField(this, "value", 0);
    __publicField(this, "selected", false);
    /**@type {[number, number]} */
    __publicField(this, "hexPos", [-1, -1]);
    __publicField(this, "tileColor", "blue");
    __publicField(this, "textColor", "white");
    __publicField(this, "prodBonus", 0);
    __publicField(this, "showResourceStatus", true);
    __publicField(this, "score", 0);
    __publicField(this, "damaged", false);
    /**@type {Object<TerrainType, number|null>} */
    __publicField(this, "terrainPlacement", {});
    __publicField(this, "productionFilled", ProductionChain.from({}));
    __publicField(this, "needsFilled", ProductionChain.from({}));
    this.wLabel = null;
    this.iconBox = BoxLayout.a({ orientation: "horizontal", hints: { w: 1, h: 0.4, x: 0, y: 0 } });
    this.addChild(this.iconBox);
  }
  get productionCapacity() {
    return ProductionQuantity.from({});
  }
  get needs() {
    return ProductionQuantity.from({});
  }
  /**
   * 
   * @param {TerrainHex} terr 
   * @param {[number, number]|null} centerPos 
   * @param {Player} player 
   * @param {Board} board;
   */
  place(terr, centerPos, player, board) {
    this.hexPos = [terr.hexPos[0], terr.hexPos[1]];
    this.prodBonus = this.terrainPlacement[terr.code] ?? 0;
    if (centerPos !== null) {
      let a2 = new WidgetAnimation();
      this.w = 0.01;
      this.h = 0.01;
      this.center_x = centerPos[0];
      this.center_y = centerPos[1];
      a2.add({
        w: board.hexHeight,
        h: board.hexHeight,
        center_x: centerPos[0],
        center_y: centerPos[1]
      }, 100);
      a2.start(this);
    }
  }
  /**
   * 
   * @param {string} event 
   * @param {ImageWidget} object 
   * @param {boolean} value 
   * @returns 
   */
  on_selected(event, object, value) {
    let parent = this.parent;
    this.bgColor = value ? "rgba(192,188,100, 1)" : null;
    if (!(parent instanceof GameScreen)) return;
    if (value) {
      let a2 = new WidgetAnimation();
      a2.add({ x: parent.selectPos[0], y: parent.selectPos[1] }, 100);
      a2.start(this);
    }
  }
  /**@type {ImageWidget['_draw']} */
  _draw(app, ctx, millis) {
    if (this.showResourceStatus) {
      super._draw(app, ctx, millis);
    } else {
      this.draw(app, ctx);
    }
  }
  updateResourceStatusIcons() {
    this.iconBox.children = [];
    let iconsToAdd = [];
    let needsFilled = true;
    for (let n of this.needs.keys()) {
      const minAmt = this.needs.get(n);
      if (minAmt !== void 0 && minAmt > 0 && this.needsFilled.get(n)?.length !== minAmt) {
        const icon = ImageWidget.a({});
        icon.src = gameImages[n];
        icon.hints = { h: 0.5, w: "1wh" };
        icon.bgColor = "rgba(90,0,0,0.6)";
        icon.outlineColor = "rgb(90,0,0)";
        iconsToAdd.push(icon);
        needsFilled = false;
      }
    }
    if (needsFilled) {
      for (let n of this.productionCapacity.keys()) {
        const color = this.productionFilled.get(n) !== this.productionCapacity.get(n) ? "rgba(0,80,0,0.6)" : "rgba(0,0,60,0.6)";
        const outline = this.productionFilled.get(n) !== this.productionCapacity.get(n) ? "rgb(0,80,0)" : "rgb(0,0,60)";
        const connectedTiles = this.productionFilled.get(n);
        if (connectedTiles === void 0 || connectedTiles.length !== this.productionCapacity.get(n)) {
          const icon = ImageWidget.a({
            src: gameImages[n],
            hints: { h: 0.5, w: "1wh" },
            bgColor: color,
            outlineColor: outline
          });
          iconsToAdd.push(icon);
        }
      }
    }
    const size = iconsToAdd.length;
    for (let i of iconsToAdd) {
      i.hints["h"] = size === 1 ? 0.7 : 0.7 / (size - 1);
    }
    this.iconBox.children = iconsToAdd;
  }
  /**
   * 
   * @param {Board} board 
   */
  *iterNetwork(board) {
    for (let t of board.neighborIter(this.hexPos)) yield t;
  }
}
class Rubble extends Tile {
  constructor(props = {}) {
    super();
    /**@type {TileType} */
    __publicField(this, "code", "X");
    __publicField(this, "name", "Rubble");
    __publicField(this, "terrainPlacement", { "p": 0, "f": 0, "m": 0, "w": null });
    __publicField(this, "tileColor", "gray");
    __publicField(this, "textColor", "white");
    this.src = gameImages["X"];
    this.updateProperties(props);
  }
}
class Castle extends Tile {
  constructor(props = {}) {
    super();
    /**@type {TileType} */
    __publicField(this, "code", "C");
    __publicField(this, "name", "Castle");
    __publicField(this, "terrainPlacement", { "p": 0, "f": 0, "m": 0, "w": null });
    __publicField(this, "tileColor", "purple");
    __publicField(this, "textColor", "white");
    __publicField(
      this,
      "network",
      /**@type {Set<TerrainHex>}*/
      /* @__PURE__ */ new Set()
    );
    this.src = gameImages["C"];
    this.updateProperties(props);
  }
  get productionCapacity() {
    return ProductionQuantity.from({ "ri": 1 + this.prodBonus });
  }
  get needs() {
    return ProductionQuantity.from({ "rw": 1, "rf": 1, "rb": 1 });
  }
  /** @type {Tile['place']} */
  place(terr, centerPos, player, board) {
    super.place(terr, centerPos, player, board);
    this.network = /* @__PURE__ */ new Set();
    this.updateNetwork(terr, board, 3, this.network, /* @__PURE__ */ new Set());
  }
  /**
   * 
   * @param {Board} board 
   * @param {TerrainHex} terr 
   * @param {number} range 
   * @param {Set<TerrainHex>} network 
   * @param {Set<TerrainHex>} visited 
   */
  updateNetwork(terr, board, range, network = /* @__PURE__ */ new Set(), visited = /* @__PURE__ */ new Set()) {
    const newNodes = [];
    for (let t of board.neighborIter(terr.hexPos)) {
      if (!(t instanceof Water) && !visited.has(t)) {
        if (t.tile instanceof Castle) {
          network.add(t);
        }
        visited.add(t);
        newNodes.push(t);
      }
    }
    if (range > 1) {
      for (let t of newNodes) {
        this.updateNetwork(t, board, range - 1, network, visited);
      }
    }
  }
}
class Village extends Tile {
  constructor(props = {}) {
    super();
    /**@type {TileType} */
    __publicField(this, "code", "V");
    __publicField(this, "name", "Village");
    __publicField(this, "terrainPlacement", { "p": 1, "f": 1, "m": 0, "w": null });
    __publicField(this, "tileColor", "yellow");
    __publicField(this, "textColor", "white");
    this.src = gameImages["V"];
    this.updateProperties(props);
  }
  get productionCapacity() {
    const blessed = this.needsFilled.get("rb") ? 2 : 1;
    return ProductionQuantity.from({ "rw": 2 * blessed + this.prodBonus });
  }
  get needs() {
    return ProductionQuantity.from({ "rf": 1, "rb": 0 });
  }
}
class Stronghold extends Tile {
  constructor(props = {}) {
    super();
    /**@type {TileType}*/
    __publicField(this, "code", "S");
    __publicField(this, "name", "Stronghold");
    __publicField(this, "terrainPlacement", { "p": 1, "f": 0, "m": 1, "w": null });
    __publicField(this, "tileColor", "red");
    __publicField(this, "textColor", "white");
    this.src = gameImages["S"];
    this.updateProperties(props);
  }
  get productionCapacity() {
    return ProductionQuantity.from({ "rs": 1 + this.prodBonus });
  }
  get needs() {
    return ProductionQuantity.from({ "ro": 1, "rw": 1 });
  }
}
class Mine extends Tile {
  constructor(props = {}) {
    super();
    /**@type {TileType}*/
    __publicField(this, "code", "M");
    __publicField(this, "name", "Mine");
    __publicField(this, "terrainPlacement", { "p": 1, "f": 0, "m": 2, "w": null });
    __publicField(this, "tileColor", "grey");
    __publicField(this, "textColor", "white");
    this.src = gameImages["M"];
    this.updateProperties(props);
  }
  get productionCapacity() {
    return ProductionQuantity.from({ "ro": 1 + this.prodBonus });
  }
  get needs() {
    return ProductionQuantity.from({ "rw": 1 });
  }
}
class Tradeship extends Tile {
  constructor(props = {}) {
    super();
    /**@type {TileType}*/
    __publicField(this, "code", "T");
    __publicField(this, "name", "Tradeship");
    __publicField(this, "terrainPlacement", { "p": null, "f": null, "m": null, "w": 0 });
    __publicField(this, "tileColor", colorString([0.4, 0.2, 0.2, 1]));
    __publicField(this, "textColor", "white");
    __publicField(
      this,
      "network",
      /**@type {Set<TerrainHex>} */
      /* @__PURE__ */ new Set()
    );
    this.src = gameImages["T"];
    this.updateProperties(props);
  }
  get productionCapacity() {
    return ProductionQuantity.from({ "rm": 1 + this.prodBonus });
  }
  get needs() {
    return ProductionQuantity.from({ "rw": 1 });
  }
  /** @type {Tile['place']} */
  place(terr, centerPos, player, board) {
    super.place(terr, centerPos, player, board);
    this.network = /* @__PURE__ */ new Set([terr]);
    this.updateNetwork(terr, board, 3, this.network);
  }
  /**
   * 
   * @param {Board} board 
   * @param {TerrainHex} terr
   * @param {number} range 
   * @param {Set<TerrainHex>} ports 
   */
  updateNetwork(terr, board, range, ports) {
    const newPorts = [];
    for (let t of board.neighborIter(terr.hexPos)) {
      if (!ports.has(t)) {
        ports.add(t);
        newPorts.push(t);
      }
    }
    if (range > 1) {
      for (let t of newPorts) {
        if (t instanceof Water) {
          this.updateNetwork(t, board, range - 1, ports);
        }
      }
    }
  }
}
class Abbey extends Tile {
  constructor(props = {}) {
    super();
    /**@type {TileType}*/
    __publicField(this, "code", "A");
    __publicField(this, "name", "Abbey");
    __publicField(this, "terrainPlacement", { "p": 0, "f": 1, "m": 2, "w": null });
    __publicField(this, "tileColor", colorString([0.7, 0.4, 0.4, 1]));
    __publicField(this, "textColor", "white");
    this.src = gameImages["A"];
    this.updateProperties(props);
  }
  get productionCapacity() {
    return ProductionQuantity.from({ "rb": 3 + this.prodBonus });
  }
  get needs() {
    return ProductionQuantity.from({ "rw": 1, "rf": 1 });
  }
}
class Farm extends Tile {
  constructor(props = {}) {
    super();
    __publicField(
      this,
      "code",
      /**@type {TileType}*/
      "F"
    );
    __publicField(this, "name", "Farm");
    __publicField(this, "terrainPlacement", { "p": 1, "f": 0, "m": null, "w": null });
    __publicField(this, "tileColor", colorString([0.2, 0.5, 0.2, 1]));
    __publicField(this, "textColor", "white");
    this.src = gameImages["F"];
    this.updateProperties(props);
  }
  get productionCapacity() {
    const blessed = this.needsFilled.get("rb") ? 2 : 1;
    if (this.parent instanceof Forest) {
      return ProductionQuantity.from({ "rf": 1 * blessed + this.prodBonus, "rt": 1 * blessed });
    } else {
      return ProductionQuantity.from({ "rf": 1 * blessed + this.prodBonus });
    }
  }
  get needs() {
    return ProductionQuantity.from({ "rw": 1, "rb": 0 });
  }
}
class EnemyStronghold extends Tile {
  constructor(props = {}) {
    super();
    /**@type {TileType}*/
    __publicField(this, "code", "ES");
    __publicField(this, "name", "Enemy Stronghold");
    __publicField(this, "terrainPlacement", { "p": 1, "f": 1, "m": 1, "w": null });
    __publicField(this, "tileColor", colorString([0.7, 0.2, 0.2, 1]));
    __publicField(this, "textColor", "red");
    __publicField(this, "health", 2);
    this.src = urlTileEnemyStronghold;
    this.updateProperties(props);
  }
  get needs() {
    return ProductionQuantity.from({ "rs": this.health });
  }
  /**@type {Tile['draw']} */
  draw(app, ctx) {
    super.draw(app, ctx);
  }
}
class EnemyCastle extends Tile {
  constructor(props = {}) {
    super();
    /**@type {TileType}*/
    __publicField(this, "code", "EC");
    __publicField(this, "name", "Enemy Castle");
    __publicField(this, "terrainPlacement", { "p": 1, "f": 1, "m": 1, "w": null });
    __publicField(this, "tileColor", colorString([0.7, 0.2, 0.2, 1]));
    __publicField(this, "textColor", "red");
    __publicField(this, "health", 5);
    this.src = urlTileEnemyCastle;
    this.updateProperties(props);
  }
  get needs() {
    return ProductionQuantity.from({ "rs": this.health });
  }
  /**@type {Tile['draw']} */
  draw(app, ctx) {
    super.draw(app, ctx);
  }
}
class EnemyLongboat extends Tile {
  constructor(props = {}) {
    super();
    /**@type {TileType}*/
    __publicField(this, "code", "EL");
    __publicField(this, "name", "Enemy Castle");
    __publicField(this, "terrainPlacement", { "p": null, "f": null, "m": null, "w": 1 });
    __publicField(this, "tileColor", colorString([0.7, 0.2, 0.2, 1]));
    __publicField(this, "textColor", "red");
    __publicField(this, "health", 1);
    __publicField(
      this,
      "network",
      /**@type {Set<TerrainHex>}*/
      /* @__PURE__ */ new Set()
    );
    this.src = urlTileEnemyLongboat;
    this.updateProperties(props);
  }
  get needs() {
    return ProductionQuantity.from({ "rs": this.health });
  }
  /**@type {Tile['draw']} */
  draw(app, ctx) {
    super.draw(app, ctx);
  }
  /**
   * 
   * @param {Board} board 
   * @param {TerrainHex} terr
   * @param {number} range 
   * @param {Set<TerrainHex>} ports 
   */
  updateNetwork(terr, board, range, ports) {
    const newPorts = [];
    for (let t of board.neighborIter(terr.hexPos)) {
      if (!ports.has(t)) {
        ports.add(t);
        newPorts.push(t);
      }
    }
    if (range > 1) {
      for (let t of newPorts) {
        if (t instanceof Water) {
          this.updateNetwork(t, board, range - 1, ports);
        }
      }
    }
  }
  /** @type {Tile['place']} */
  place(terr, centerPos, player, board) {
    super.place(terr, centerPos, player, board);
    this.network = /* @__PURE__ */ new Set([terr]);
    this.updateNetwork(terr, board, 3, this.network);
  }
  /**
   * 
   * @param {Board} board 
   */
  *iterNetwork(board) {
    for (let t of this.network) yield t;
  }
}
class EnemyTent extends Tile {
  constructor(props = {}) {
    super();
    /**@type {TileType} */
    __publicField(this, "code", "ET");
    __publicField(this, "name", "Enemy Tent");
    __publicField(this, "terrainPlacement", { "p": 1, "f": 1, "m": 1, "w": null });
    __publicField(this, "tileColor", colorString([0.7, 0.2, 0.2, 1]));
    __publicField(this, "textColor", "red");
    __publicField(
      this,
      "network",
      /**@type {Set<TerrainHex>}*/
      /* @__PURE__ */ new Set()
    );
    __publicField(this, "health", 1);
    this.src = urlTileEnemyTent;
    this.updateProperties(props);
  }
  get needs() {
    return ProductionQuantity.from({ "rs": this.health });
  }
  /**@type {Tile['draw']} */
  draw(app, ctx) {
    super.draw(app, ctx);
  }
  /**
   * 
   * @param {Board} board 
   * @param {TerrainHex} terr
   * @param {number} range 
   * @param {Set<TerrainHex>} sites 
   */
  updateNetwork(terr, board, range, sites) {
    const newSites = [];
    for (let t of board.neighborIter(terr.hexPos)) {
      if (!sites.has(t)) {
        sites.add(t);
        newSites.push(t);
      }
    }
    if (range > 1) {
      for (let t of newSites) {
        if (!(t instanceof Water)) {
          this.updateNetwork(t, board, range - 1, sites);
        }
      }
    }
  }
  /** @type {Tile['place']} */
  place(terr, centerPos, player, board) {
    super.place(terr, centerPos, player, board);
    this.network = /* @__PURE__ */ new Set([terr]);
    this.updateNetwork(terr, board, 2, this.network);
  }
  /**
   * 
   * @param {Board} board 
   */
  *iterNetwork(board) {
    for (let t of this.network) yield t;
  }
}
class EnemyDragon extends Tile {
  constructor(props = {}) {
    super();
    /**@type {TileType}*/
    __publicField(this, "code", "ED");
    __publicField(this, "name", "Enemy Dragon");
    __publicField(this, "terrainPlacement", { "p": null, "f": null, "m": 2, "w": null });
    __publicField(this, "tileColor", colorString([0.7, 0.2, 0.2, 1]));
    __publicField(this, "textColor", "red");
    __publicField(this, "health", 3);
    this.src = urlTileEnemyDragon;
    this.updateProperties(props);
  }
  get needs() {
    return ProductionQuantity.from({ "rs": 1 });
  }
  /**@type {Tile['draw']} */
  draw(app, ctx) {
    super.draw(app, ctx);
  }
}
class TargetTile extends Label {
  constructor(props) {
    super();
    __publicField(this, "score", 0);
    __publicField(this, "code", "*");
    /**@type {[number,number]} */
    __publicField(this, "hexPos", [0, 0]);
    this.updateProperties(props);
    const score = this.score;
    this.text = score == 0 ? "--" : score > 0 ? "+" + score : "" + score;
    this.color = "rgba(20,20,20,0.8)";
    this.color = this.score > 0 ? "rgba(60,40,0,0.85)" : this.score === 0 ? "rgba(20,20,20,0.85)" : "rgba(72,32,29,0.85)";
  }
  draw(app, ctx) {
    ctx.beginPath();
    ctx.arc(this.center_x, this.center_y, this.w / 3, 0, 2 * Math.PI);
    ctx.fillStyle = this.score >= 0 ? "rgba(255,240,0,0.5)" : (
      // this.score === 0 ? 'rgba(100,100,100,0.5)' :
      "rgba(168,72,65,0.75)"
    );
    ctx.strokeStyle = "rgba(80,80,80,0.5)";
    ctx.lineWidth = this.w / 10;
    ctx.stroke();
    ctx.fill();
    super.draw(app, ctx);
  }
}
const playerTileClasses = {
  "C": Castle,
  "V": Village,
  "S": Stronghold,
  "M": Mine,
  "T": Tradeship,
  "A": Abbey,
  "F": Farm,
  "R": Rubble
};
class TerrainHex extends ImageWidget {
  constructor(props = null) {
    super();
    __publicField(this, "code", "");
    __publicField(this, "hexWidth", 0);
    __publicField(this, "hexHeight", 0);
    __publicField(this, "hexLen", 0);
    __publicField(this, "hexPosX", 0);
    __publicField(this, "hexPosY", 0);
    __publicField(this, "texture", {});
    /**@type {Tile|null} */
    __publicField(this, "tile", null);
    /**@type {"vertical"|"horizontal"} */
    __publicField(this, "orientation", "vertical");
    if (props !== null) {
      this.updateProperties(props);
    }
    this.tile = null;
    this.allowStretch = true;
  }
  on_orientation(object, event, value) {
    if (this.orientation === "vertical") {
      this.src = gameImages[this.code];
    } else {
      this.src = gameImages[this.code + "l"];
    }
  }
  on_code(object, event, value) {
    if (this.orientation === "vertical") {
      this.src = gameImages[this.code];
    } else {
      this.src = gameImages[this.code + "l"];
    }
  }
  /**@type {[number, number]} */
  get hexPos() {
    return [this.hexPosX, this.hexPosY];
  }
  set hexPos(pos) {
    [this.hexPosX, this.hexPosY] = pos;
  }
  on_tile(e, o, v) {
    if (this.tile) {
      this.children = [this.tile];
    } else {
      this.children = [];
    }
  }
  on_touch_down(event, object, touch) {
    if (this.collideRadius(touch.rect, this.w * 0.43)) {
      let gameScreen = this.parent?.parent;
      if (gameScreen instanceof GameScreen) {
        gameScreen.onTouchDownTerrain(this, touch);
        return true;
      }
    }
    return false;
  }
}
class Plain extends TerrainHex {
  constructor(props) {
    super(props);
    this.code = "p";
  }
}
class Forest extends TerrainHex {
  constructor(props) {
    super(props);
    this.code = "f";
  }
}
class Mountain extends TerrainHex {
  constructor(props) {
    super(props);
    this.code = "m";
  }
}
class Water extends TerrainHex {
  constructor(props) {
    super(props);
    this.code = "w";
  }
}
const terrainClasses = {
  "p": Plain,
  "f": Forest,
  "m": Mountain,
  "w": Water
};
class TerrainMap extends Array {
  /**
   * 
   * @param {Level|null} level 
   * @param {number} size 
   * @param {"vertical"|"horizontal"} orientation
   */
  constructor(level, size, orientation) {
    super();
    for (let i2 = 0; i2 < size; ++i2) {
      this.push([]);
    }
    this.size = size;
    let i = 0;
    let terrainmap;
    if (level === null) {
      terrainmap = new EmptyLevel().map.replace(/\n/g, "").replace(/ /g, "");
    } else {
      terrainmap = level.map.replace(/\n/g, "").replace(/ /g, "");
    }
    for (let x = 0; x < this.size; x++) {
      let yHeight = this.size - Math.abs((this.size - 1) / 2 - x);
      for (let y = 0; y < yHeight; y++) {
        let ht = terrainClasses[terrainmap[i]].a({ hexPos: [x, y] });
        ht.orientation = orientation;
        this[x].push(ht);
        i++;
      }
    }
  }
  /**
   * @yields {TerrainHex}
   */
  *iter() {
    for (let a2 of this) {
      for (let hex of a2) {
        yield hex;
      }
    }
  }
  /**
   * 
   * @param {number} x 
   * @param {number} y 
   */
  atPos(x, y) {
    try {
      return this[x][y];
    } catch (error) {
      return void 0;
    }
  }
  /**
   * @param {number} x 
   * @param {number} y
   * @param {TerrainHex} terrain
   */
  set(x, y, terrain) {
    this[x][y] = terrain;
  }
}
const _NetworkFlowEdge = class _NetworkFlowEdge extends Widget {
  constructor() {
    super(...arguments);
    /**@type {Board|null} */
    __publicField(this, "board", null);
    // pass your board instance in props
    /** @type {[number,number]} */
    __publicField(this, "fromHex", [0, 0]);
    /** @type {[number,number]} */
    __publicField(this, "toHex", [0, 0]);
    /** @type {ResourceType} */
    __publicField(this, "resource", "rf");
    __publicField(this, "primary", false);
    // thicker/highlighted if it touches the hovered tile
    __publicField(this, "phase", 0);
    // dash offset animation
    __publicField(this, "speed", 1);
    // px/sec for dash flow (kept gentle to avoid strobe)
    __publicField(this, "_phaseInit", false);
  }
  /** Unique key for phase memory */
  _edgeKey() {
    const [fx, fy] = this.fromHex, [tx, ty] = this.toHex;
    return `${fx},${fy}->${tx},${ty}:${this.resource}`;
  }
  /** Pixel center for a hex using your board API */
  centerOf(hexPos) {
    if (!this.board || typeof this.board.pixelPos !== "function") return { x: 0, y: 0 };
    const [x, y] = this.board.pixelPos(hexPos);
    return { x, y };
  }
  /** Gentle bow so overlapping edges are readable */
  ctrlPoint(a2, b) {
    const mx = (a2.x + b.x) / 2, my = (a2.y + b.y) / 2;
    const dx = b.x - a2.x, dy = b.y - a2.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const bow = Math.min((this.board?.hexSide ?? 16) * 0.4, len * 0.12);
    return { x: mx + nx * bow, y: my + ny * bow };
  }
  /** Optional half-pixel snap to reduce shimmer on thin strokes
   * @param {number} v 
   * @returns 
   */
  _snap(v) {
    return Math.round(v) + 0.5;
  }
  /**@type {Widget['update']} */
  update(app, millis) {
    if (!this._phaseInit) {
      const key = this._edgeKey();
      if (_NetworkFlowEdge._phaseMem.has(key)) {
        this.phase = _NetworkFlowEdge._phaseMem.get(key) ?? 0;
      }
      this._phaseInit = true;
    }
    const a2 = this.centerOf(this.fromHex);
    const b = this.centerOf(this.toHex);
    const len = Math.hypot(b.x - a2.x, b.y - a2.y) || 1;
    const dt = millis / 1e3;
    const v = this.speed / len;
    this.phase = (this.phase + v * dt) % 1;
    _NetworkFlowEdge._phaseMem.set(this._edgeKey(), this.phase);
    app.requestFrameUpdate();
    for (const c of this.children) c.update(app, millis);
  }
  /**@type {Widget['draw']} */
  draw(app, ctx) {
    if (!this.board) return;
    const a2 = this.centerOf(this.fromHex);
    const b = this.centerOf(this.toHex);
    const c = this.ctrlPoint(a2, b);
    const ax = a2.x, ay = a2.y;
    const bx = b.x, by = b.y;
    const cx = c.x, cy = c.y;
    const src = gameImages[this.resource];
    if (!src) return;
    let img = _NetworkFlowEdge._iconCache.get(src);
    if (!img) {
      img = new Image();
      img.src = src;
      _NetworkFlowEdge._iconCache.set(src, img);
    }
    if (!img.complete) {
      app.requestFrameUpdate();
      return;
    }
    const side = this.board.hexSide ?? 1;
    const size = side * (this.primary ? 0.3 : 0.25);
    const startFrac = 0.12;
    const endFrac = 0.88;
    const span = endFrac - startFrac;
    let pulses = Math.max(1, Math.round(span * (Math.hypot(bx - ax, by - ay) / (side * 1.4))));
    if (this.primary && pulses < 2) pulses = 2;
    const bezierPoint = (t) => {
      const u = 1 - t;
      const uu = u * u;
      const tt = t * t;
      const px = uu * ax + 2 * u * t * cx + tt * bx;
      const py = uu * ay + 2 * u * t * cy + tt * by;
      return { px, py };
    };
    ctx.save();
    ctx.setLineDash([]);
    for (let i = 0; i < pulses; i++) {
      const tBase = (this.phase + i / pulses) % 1;
      const t = startFrac + tBase * span;
      const { px, py } = bezierPoint(t);
      const localT = tBase;
      const fadeEdge = Math.sin(Math.PI * localT);
      if (this.primary && fadeEdge > 0.1) {
        ctx.globalAlpha = 0.35 * fadeEdge;
        ctx.beginPath();
        ctx.arc(px, py, size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = _NetworkFlowEdge.resColor[this.resource] ?? "rgba(255,255,255,0.5)";
        ctx.fill();
      }
      ctx.globalAlpha = (this.primary ? 0.95 : 0.8) * (0.3 + 0.7 * fadeEdge);
      ctx.drawImage(img, px - size / 2, py - size / 2, size, size);
    }
    ctx.restore();
  }
};
// internal: has phase been restored from memory?
/** @type {Map<string, HTMLImageElement>} */
__publicField(_NetworkFlowEdge, "_iconCache", /* @__PURE__ */ new Map());
// Stable phase memory so edges don't "flash" when the overlay is rebuilt
/** @type {Map<string, number>} */
__publicField(_NetworkFlowEdge, "_phaseMem", /* @__PURE__ */ new Map());
// Resource colors for your short codes
__publicField(_NetworkFlowEdge, "resColor", {
  rw: "rgba(210,165, 70,0.95)",
  // workers
  rf: "rgba(100,185,100,0.95)",
  // food
  rt: "rgba(167,115, 58,0.95)",
  // timber (adjust if unused)
  ro: "rgba(140,140,140,0.95)",
  // ore
  rb: "rgba(140,120,210,0.95)",
  // blessing
  rs: "rgba(210, 60, 60,0.95)",
  // soldiers
  rm: "rgba(200,160,100,0.95)",
  // money (adjust if unused)
  ri: "rgba( 60,140,210,0.95)"
  // influence
});
let NetworkFlowEdge = _NetworkFlowEdge;
class NetworkTileOverlay extends Widget {
  constructor() {
    super();
    __publicField(this, "hexPos", [0, 0]);
    __publicField(this, "primary", false);
    __publicField(this, "input", "");
    __publicField(this, "output", "");
    this.updateIO();
  }
  updateIO() {
    this.outlineColor = this.primary ? "rgba(208, 212, 0,1)" : "rgba(208, 212, 240,1)";
    this.bgColor = this.primary ? "rgba(208, 212, 0, 0.5)" : null;
    const inputColor = "rgba(192,100,100,0.9)";
    const outputColor = this.primary ? "rgba(100,185,100,0.9)" : "rgba(100,100,192,0.9)";
    if (this.input !== "" && this.output !== "") {
      this.children = [
        ImageWidget.a({ src: gameImages[this.input], hints: { w: 0.5, h: 0.75, x: 0, y: 0 }, bgColor: inputColor }),
        ImageWidget.a({ src: gameImages[this.output], hints: { w: 0.5, h: 0.75, right: 1, bottom: 1 }, bgColor: outputColor })
      ];
    } else if (this.input !== "") {
      this.children = [
        ImageWidget.a({ src: gameImages[this.input], hints: { w: 0.5, h: 0.75, x: 0, y: 0 }, bgColor: inputColor })
      ];
    } else if (this.output !== "") {
      this.children = [
        ImageWidget.a({ src: gameImages[this.output], hints: { w: 0.5, h: 0.75, right: 1, bottom: 1 }, bgColor: outputColor })
      ];
    } else {
      this.children = [];
    }
  }
}
class TileInfoPane extends Widget {
  constructor() {
    super();
    this.board = null;
    this.tile = null;
    this.tileImage = ImageWidget.a({ hints: { x: 0, y: "0.0", h: "1.0", w: "1.0" } }), //Tile & name
    this.terrainLabel = Label.a({ align: "left", hints: { x: 0, y: "1.0", h: "0.75", w: 1 } }), //Terrain
    this.terrainBox = BoxLayout.a({ orientation: "horizontal", hints: { x: 0, y: "1.75", w: 1, h: "1.5" } }), this.resourceInLabel = Label.a({ align: "left", text: "Inputs", hints: { x: 0, y: "3.25", w: 1, h: "0.75" } }), this.resourceInBox = BoxLayout.a({ orientation: "horizontal", hints: { x: 0, y: "4.0", w: 1, h: "1.5" } }), this.resourceOutLabel = Label.a({ align: "left", text: "Outputs", hints: { x: 0, y: "5.5", w: 1, h: "0.75" } }), this.resourceOutBox = BoxLayout.a({ orientation: "horizontal", hints: { x: 0, y: "6.25", w: 1, h: "1.5" } }), this.tileDescription = Label.a({ align: "left", fontSize: "0.325", wrap: true, hints: { x: 0, y: "7.75", h: null, w: "10" } }), this.children = [
      // this.tileLabel,
      this.tileImage,
      this.terrainLabel,
      this.terrainBox,
      this.resourceInLabel,
      this.resourceInBox,
      this.resourceOutLabel,
      this.resourceOutBox,
      this.tileDescription
    ];
    this.updateProperties({});
  }
  /**
   * 
   * @param {string} event 
   * @param {TileInfoPane} object 
   * @param {Tile|null} value 
   */
  on_tile(event, object, value) {
    if (this.tile === null) {
      this.children = [];
      return;
    }
    this.children = [
      // this.tileLabel,
      this.tileImage,
      this.terrainLabel,
      this.terrainBox,
      this.resourceInLabel,
      this.resourceInBox,
      this.resourceOutLabel,
      this.resourceOutBox,
      this.tileDescription
    ];
    this.tileImage.src = gameImages[this.tile.code];
    this.tileDescription.text = tileDescriptions[this.tile.code];
    const terrain = this.board?.terrainMap.atPos(...this.tile.hexPos);
    if (terrain !== void 0) {
      this.terrainLabel.text = terrainNames[terrain.code];
      const tbox = BoxLayout.a({
        orientation: "vertical",
        children: [
          ImageWidget.a({ src: gameImages[terrain.code] }),
          Label.a({ text: `${this.tile.terrainPlacement[terrain.code]}`, hints: { h: 0.5 } })
        ]
      });
      this.terrainBox.children = [tbox];
      this.terrainBox.hints.w = `${this.terrainBox.children.length}`;
      const needs = this.tile.needs;
      const needsFilled = this.tile.needsFilled;
      const riBoxChildren = [...needs.keys()].map((resourceType) => BoxLayout.a({
        orientation: "vertical",
        children: [
          ImageWidget.a({ src: gameImages[resourceType] }),
          Label.a({ text: `${needsFilled.get(resourceType)?.length ?? 0}/${needs.get(resourceType)}`, hints: { h: 0.5 } })
        ]
      }));
      this.resourceInBox.children = riBoxChildren;
      this.resourceInBox.hints.w = `${this.resourceInBox.children.length}`;
      const prodCapacity = this.tile.productionCapacity;
      const prodRequested = this.tile.productionFilled;
      const roBoxChildren = [...prodCapacity.keys()].map((resourceType) => BoxLayout.a({
        orientation: "vertical",
        children: [
          ImageWidget.a({ src: gameImages[resourceType] }),
          Label.a({ text: `${prodRequested.get(resourceType)?.length ?? 0}/${prodCapacity.get(resourceType)}`, hints: { h: 0.5 } })
        ]
      }));
      this.resourceOutBox.children = roBoxChildren;
      this.resourceOutBox.hints.w = `${this.resourceOutBox.children.length}`;
    } else {
      this.terrainLabel.text = "Terrain placement and output bonus";
      const tp = this.tile.terrainPlacement;
      const tboxChildren = Object.keys(tp).filter((terrainType) => tp[terrainType] !== null).map((terrainType) => BoxLayout.a({
        orientation: "vertical",
        children: [
          ImageWidget.a({ src: gameImages[terrainType] }),
          Label.a({ text: `${tp[terrainType]}`, hints: { h: 0.5 } })
        ]
      }));
      this.terrainBox.children = tboxChildren;
      this.terrainBox.hints.w = `${this.terrainBox.children.length}`;
      const needs = this.tile.needs;
      const riBoxChildren = [...needs.keys()].map((resourceType) => BoxLayout.a({
        orientation: "vertical",
        children: [
          ImageWidget.a({ src: gameImages[resourceType] }),
          Label.a({ text: `${needs.get(resourceType)}`, hints: { h: 0.5 } })
        ]
      }));
      this.resourceInBox.children = riBoxChildren;
      this.resourceInBox.hints.w = `${this.resourceInBox.children.length}`;
      const prodCapacity = this.tile.productionCapacity;
      const roBoxChildren = [...prodCapacity.keys()].map((resourceType) => BoxLayout.a({
        orientation: "vertical",
        children: [
          ImageWidget.a({ src: gameImages[resourceType] }),
          Label.a({ text: `${prodCapacity.get(resourceType)}`, hints: { h: 0.5 } })
        ]
      }));
      this.resourceOutBox.children = roBoxChildren;
      this.resourceOutBox.hints.w = `${this.resourceOutBox.children.length}`;
    }
    if (this.parent) this.parent._needsLayout = true;
  }
  /**
   * 
   * @param {App} app 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} millis
   */
  _draw(app, ctx, millis) {
    if (this.tile !== null) super._draw(app, ctx, millis);
  }
}
class Board extends Widget {
  constructor(props = {}) {
    super();
    /**@type {number} Height and max width of the board in number of hexes  */
    __publicField(this, "boardSize", 1);
    /**@type {number} */
    __publicField(this, "boardWidth", 1);
    /**@type {number} */
    __publicField(this, "boardHeight", 1);
    /**@type {number} */
    __publicField(this, "hexWidth", 1);
    /**@type {number} */
    __publicField(this, "hexSide", 1);
    /**@type {number} */
    __publicField(this, "hexHeight", 1);
    /**@type {"horizontal"|"vertical"} */
    __publicField(this, "orientation", "horizontal");
    if (props) this.updateProperties(props);
    this._terrainMap = new TerrainMap(null, this.boardSize, this.orientation);
    for (let thex of this._terrainMap.iter()) {
      this.addChild(thex);
    }
  }
  /**@type {TerrainMap} */
  set terrainMap(value) {
    for (let thex of this._terrainMap.iter()) {
      this.removeChild(thex);
    }
    this._terrainMap = value;
    for (let thex of this._terrainMap.iter()) {
      this.addChild(thex);
    }
  }
  get terrainMap() {
    return this._terrainMap;
  }
  /**
   * 
   * @param {Level} level 
   */
  makeTerrain(level) {
    this.boardSize = level.boardSize;
    this.terrainMap = new TerrainMap(level, this.boardSize, this.orientation);
  }
  on_orientation(event, object, value) {
    if (this.terrainMap) {
      for (let t of this.terrainMap.iter()) {
        t.orientation = value;
      }
    }
  }
  /**
   * 
   * @param {[number, number]} hexPos 
   * @returns {[number, number]}
   */
  pixelPos(hexPos) {
    if (this.orientation === "vertical") {
      return [
        this.center_x + this.hexSide * 1.5 * (hexPos[0] - Math.floor(this.boardSize / 2)),
        this.center_y + this.hexHeight * (hexPos[1] - Math.floor(this.boardSize / 2) + Math.abs(hexPos[0] - Math.floor(this.boardSize / 2)) / 2)
      ];
    } else {
      return [
        this.center_x + this.hexHeight * (hexPos[1] - Math.floor(this.boardSize / 2) + Math.abs(hexPos[0] - Math.floor(this.boardSize / 2)) / 2),
        this.center_y + this.hexSide * 1.5 * (hexPos[0] - Math.floor(this.boardSize / 2))
      ];
    }
  }
  hexPos(pixelPos) {
    if (this.orientation === "vertical") {
      const hpos = Math.round((pixelPos[0] - this.center_x) / (this.hexSide * 1.5) + Math.floor(this.boardSize / 2));
      const vpos = Math.round((pixelPos[1] - this.center_y) / this.hexHeight + Math.floor(this.boardSize / 2) - Math.abs(hpos - Math.floor(this.boardSize / 2)) / 2);
      if (0 <= hpos && hpos < this.boardSize && 0 <= vpos && vpos < this.boardSize) {
        return [hpos, vpos];
      } else {
        return null;
      }
    } else {
      const vpos = Math.round((pixelPos[1] - this.center_y) / (this.hexSide * 1.5) + Math.floor(this.boardSize / 2));
      const hpos = Math.round((pixelPos[0] - this.center_x) / this.hexHeight + Math.floor(this.boardSize / 2) - Math.abs(vpos - Math.floor(this.boardSize / 2)) / 2);
      if (0 <= hpos && hpos < this.boardSize && 0 <= vpos && vpos < this.boardSize) {
        return [hpos, vpos];
      } else {
        return null;
      }
    }
  }
  get hexCount() {
    return 3 * this.boardSize * (this.boardSize - 1) + 1;
  }
  /**
   * Returns all terrain positions that are conneced to this tile
   * @param {TerrainHex} terr 
   * @param {Player} player 
   * @param {Set<TerrainHex>} visited 
   * @param {Set<TerrainHex>} castles 
   * @yields {TerrainHex}
   */
  *connectedIter(terr, player, visited, castles) {
    yield terr;
    visited.add(terr);
    if (terr.tile !== null && terr.tile instanceof Castle) {
      castles.add(terr);
    }
    for (let t of this.connectedAdjacentPriority(terr)) {
      if (visited.has(t)) continue;
      yield t;
      visited.add(t);
    }
    for (let t of this.connectedAdjacentPriority(terr)) {
      if (t.tile && player.placedTiles.includes(t.tile)) {
        if (t.tile instanceof Castle) {
          castles.add(t);
          for (let tc of this.connectedAdjacentPriority(t)) {
            if (visited.has(tc)) continue;
            yield tc;
            visited.add(tc);
          }
        }
      }
    }
    for (let ship of player.placedTiles) {
      if (ship instanceof Tradeship) {
        if (!ship.network.has(terr)) continue;
        for (let tp of ship.network) {
          if (visited.has(tp)) continue;
          yield tp;
          visited.add(tp);
        }
      }
    }
    for (let tc of castles) {
      if (tc.tile !== null && tc.tile instanceof Castle) {
        for (let tn of tc.tile.network) {
          if (!visited.has(tn)) yield tn;
          visited.add(tn);
          for (let tnAdj of this.connectedAdjacentPriority(tn)) {
            if (visited.has(tnAdj)) continue;
            yield tnAdj;
            visited.add(tnAdj);
          }
        }
      }
    }
  }
  /**
   * 
   * @param {TerrainHex} terr 
   * @returns 
   */
  connectedAdjacentPriority(terr) {
    let neighbors = [...this.neighborIter(terr.hexPos)];
    neighbors.sort((a2, b) => {
      if (a2.tile === null && b.tile === null) return 0;
      if (a2.tile === null) return 100;
      if (b.tile === null) return -100;
      return tilePriority[a2.tile.code] - tilePriority[b.tile.code];
    });
    return neighbors;
  }
  /**
   * 
   * @param {[number, number]} hexPos 
   * @yields {TerrainHex}
   */
  *neighborIter(hexPos) {
    const yOffsetLeft = hexPos[0] <= Math.floor(this.boardSize / 2) ? 1 : 0;
    const yOffsetRight = hexPos[0] >= Math.floor(this.boardSize / 2) ? 1 : 0;
    const offsets = [
      [0, -1],
      [0, 1],
      [-1, -yOffsetLeft],
      [-1, 1 - yOffsetLeft],
      [1, -yOffsetRight],
      [1, 1 - yOffsetRight]
    ];
    for (let offset of offsets) {
      const x = hexPos[0] + offset[0];
      const y = hexPos[1] + offset[1];
      const t = this._terrainMap.atPos(x, y);
      if (t) yield t;
    }
  }
  /**
   * 
   * @param {[number, number]} hexPos 
   * @param {number} range
   * @param {Set<TerrainHex>} visited 
   * @yields {TerrainHex}
   */
  *neighborIterInRange(hexPos, range, visited = /* @__PURE__ */ new Set()) {
    const terr = this.terrainMap.atPos(hexPos[0], hexPos[1]);
    if (!terr) return;
    visited.add(terr);
    for (let t of this.neighborIter(hexPos)) {
      if (visited.has(t)) continue;
      yield t;
      if (range > 1) {
        yield* this.neighborIterInRange(t.hexPos, range - 1, visited);
      }
    }
  }
  getNeighborCount(hexPos) {
    let value = 0;
    for (let t of this.neighborIter(hexPos)) {
      if (t.tile !== null) {
        value += 1;
      }
    }
    return value;
  }
  layoutChildren() {
    this.hexSide = Math.min(
      this.w / (1.5 * this.boardSize + 1),
      0.95 * this.h / (this.boardSize * Math.sqrt(3))
    );
    this.hexWidth = this.hexSide * 2;
    this.hexHeight = this.hexSide * Math.sqrt(3);
    this.boardHeight = this.hexHeight * this.boardSize;
    this.boardWidth = this.hexSide * (1.5 * this.boardSize + 1);
    for (let x = 0; x < this.boardSize; x++) {
      let yHeight = this.boardSize - Math.abs(Math.floor((this.boardSize - 1) / 2) - x);
      for (let y = 0; y < yHeight; y++) {
        let center = this.pixelPos([x, y]);
        let thex = this._terrainMap.atPos(x, y);
        if (thex) {
          thex.w = this.hexWidth;
          thex.h = this.hexWidth;
          thex.center_x = center[0];
          thex.center_y = center[1];
          thex.layoutChildren();
        }
      }
    }
  }
}
class ActionBar extends BoxLayout {
  constructor(props = {}) {
    super();
    /**@type {Tile|null} */
    __publicField(this, "selectedTile", null);
    __publicField(this, "active", true);
    this.updateProperties(props);
  }
  on_child_removed(e, o, c) {
    if (c instanceof Tile) {
      c.selected = false;
      if (this.selectedTile === c) {
        this.selectedTile = null;
      }
    }
  }
  /**
   * 
   * @param {string} e 
   * @param {ActionBar} o 
   * @param {Widget} c 
   */
  on_child_added(e, o, c) {
    if (c instanceof Tile) {
      c.listen("touch_down", (e2, o2, v) => {
        if (this.active && /**@type {Widget}*/
        o2.collide(v.rect)) {
          for (let c2 of this.children) c2.selected = false;
          if (this.selectedTile === o2) {
            this.selectedTile = null;
            o2.selected = false;
          } else {
            this.selectedTile = /**@type {Tile}*/
            o2;
            o2.selected = true;
          }
          return true;
        }
        return false;
      });
    }
  }
  on_selectedTile(e, o, v) {
    for (let c of this.children) c.selected = false;
    if (this.selectedTile !== null) {
      this.selectedTile.selected = true;
    }
  }
  on_active(e, o, v) {
    if (!this.active) {
      for (let c of this.children) {
        if (c instanceof Tile) {
          c.selected = false;
        }
      }
      this.selectedTile = null;
    }
  }
}
const gameDescription = `Island Chains – Prototype Overview
==================================================================

Island Chains is a turn-based hex-grid city-builder about managing production chains. The core twist: the game has no resource stockpiles. Instead you activate buildings by connecting them with buildings that provide their inputs. Buildings are active in turns where their required inputs are supplied through the network of connected structures. When active, their outputs will immediately flow to other buildings within range that need them.

You play through 10 rounds, placing up to five buildings per round to expand your island economy and defend against enemies.

Core Loop: Place Buildings → Form Chains → Trigger Production
==================================================================

Each building has:

- Inputs (resources it needs to activate)
- Outputs (resources it produces this turn if activated)
- Terrain bonuses (extra output when built on certain terrain)

For example:

- Village → Workers (needs: Food)
- Farm → Food (needs: Workers, production bonus: plains or forest)
- Mine → Ore (needs: Workers, production bonus: mountains)

If you place a Farm next to a Village, they will power each other:
Workers → Farm → Food → Village → more Workers.

Because resources don’t accumulate, activation depends entirely on whether inputs can be satisfied in that turn based on the current network.

Resource Flow & Routing
==================================================================

By default, resources only flow between adjacent tiles, creating small local networks. You expand and combine these by placing buildings strategically.

Two special buildings break adjacency rules and form larger shared networks:

Castles — Large-Scale Routing Hubs

- All buildings adjacent to a Castle can share resources with one another.
- All Castles within range 3 link their adjacency groups into one larger network.
- A supplied Castle produces Influence, which is your score in the prototype.

Castles act as the backbone of long-distance production chains.

Tradeships — Water Network Routers

- Only placed on water, but create a supply network spanning all water tiles within range 3.
- Any structures touching those tiles can share resources via the Tradeship.
- Tradeships serve as flexible “floating supply lines” for connecting distant regions.

Boosts & Modifiers
==================================================================

Blessings (Abbeys): Abbeys produce Blessings when supplied with Workers and Food. Many buildings get bonus output if Blessings are present, but they can still function without them.

Terrain Bonuses: Some buildings gain extra output when built on favorable terrain. A “+X” indicator appears when placing a tile to show this.

Playing a Round
==================================================================

1. Pick a building from your available pieces.

2. Click a highlighted hex to place it (placement bonuses are highlighted).

3. The game then:

  - Updates the connectivity network (adjacency, castles, tradeships)

  - Determines which buildings receive the inputs they need

  - Activates every building whose inputs can be supplied this turn

  - Routes resulting outputs to any connected buildings that require them

Repeat until you have played 5 tiles

You can inspect your network at any time. Click any placed building during a round to view:

  - Its inputs and outputs

  - Which requirements are met / unmet

  - How it is connected through adjacency, castle, and tradeship networks

Military & Enemies
==================================================================

Between rounds, enemy structures appear and expand outward.
Your Strongholds, when supplied with Workers and Ore, generate Military Strength that automatically attacks nearby enemies.

Unchecked enemies will destroy your buildings, leaving behind Rubble that can later be built over.

End of Game
==================================================================

After 10 rounds, the game ends.
In this prototype, scoring is straightforward: Each activated Castle produces Influence points at the end of the round.

Building strong production networks and well-placed Castles is the key to high scores.
`;
class GameScreen extends Widget {
  constructor() {
    super();
    this.activePlayer = 0;
    this.players = [];
    this.level = null;
    this.gameOver = false;
    this.tileStack = [];
    this.hoverTile = null;
    this.roundPlacements = [];
    this.bgColor = "rgba(25, 102, 153, 1.0)";
    this.selectPos = [0, 0];
    this.board = Board.a({ hints: { right: 1, y: 0, w: "1h", h: 1 } });
    this.addChild(this.board);
    this.tileInfoPane = TileInfoPane.a({ board: this.board, hints: { x: "0.14wh", y: "1.0", w: "0.5h", h: 1 } });
    this.addChild(this.tileInfoPane);
    this.placementLayer = Widget.a({ hints: { x: 0, y: 0, w: 1, h: 1 } });
    this.addChild(this.placementLayer);
    this.scoreboard = BoxLayout.a({ hints: { right: 0.99, y: 0.01, w: 1, h: 0.05 } });
    this.addChild(this.scoreboard);
    this.statusLabel = Label.a({ text: "", color: "white", align: "left", hints: { x: 0.01, y: 0.01, w: 1, h: "1.0" } });
    this.addChild(this.statusLabel);
    this.actionBar = ActionBar.a({ hints: { x: 0, y: "1.0", w: "0.14wh", h: 0.84 }, bgColor: "gray", outlineColor: "white" });
    this.addChild(this.actionBar);
    this.actionBar.listen("selectedTile", (e, o, v) => this.selectTile(e, o, v, null));
    this.nextButton = Button.a({
      text: "End round",
      hints: { right: 0.99, bottom: 0.99, w: 0.1, h: 0.05 },
      on_press: (e, o, v) => this.finishTurn()
    });
    this.undoButton = Button.a({
      text: "Undo",
      hints: { right: 0.88, bottom: 0.99, w: 0.1, h: 0.05 },
      on_press: (e, o, v) => this.undoLastTile()
    });
    this.instrButton = Button.a({
      text: "Instructions",
      hints: { x: 0.01, bottom: 0.99, w: null, h: 0.05 },
      on_press: (e, o, v) => {
        ModalView.a({ hints: { x: 0.2, y: 0.2, w: 0.6, h: 0.6 }, bgColor: "rgba(75, 152, 203, 0.8)" }).c(ScrollView.a({ scrollW: false, hints: { x: 0, y: 0, w: 1, h: 1 } }).c(
          Label.a({
            text: gameDescription,
            richText: false,
            wrap: true,
            align: "left",
            hints: { h: null },
            fontSize: "0.5"
          })
        )).popup();
      }
    });
    this.addChild(this.undoButton);
    this.addChild(this.nextButton);
    this.addChild(this.instrButton);
  }
  /**
   * 
   * @param {'horizontal'|'vertical'} orienation 
   */
  setLayoutForOrientation(orienation) {
    if (orienation === "horizontal") {
      this.board.hints = { right: 1, y: 0, w: "1h", h: 1 };
      this.board.orientation = "horizontal";
      this.tileInfoPane.hints = { x: "0.14wh", y: "1.0", w: "0.5h", h: 1 };
      this.placementLayer.hints = { x: 0, y: 0, w: 1, h: 1 };
      this.scoreboard.hints = { right: 0.99, y: 0.01, w: 1, h: "1.0" };
      this.statusLabel.hints = { x: 0.01, y: 0.01, w: 1, h: "1.0" };
      this.actionBar.hints = { x: 0, y: "1.0", w: "0.14wh", h: 0.84 };
      this.actionBar.orientation = "vertical";
      this.nextButton.hints = { right: 0.99, bottom: 0.99, w: 0.1, h: "1.0" };
      this.undoButton.hints = { right: 0.88, bottom: 0.99, w: 0.1, h: "1.0" };
      this.instrButton.hints = { x: 0.01, bottom: 0.99, w: 0.15, h: "1.0" };
    } else if (orienation === "vertical") {
      this.board.hints = { center_x: 0.5, y: "2.0", w: 1, h: "1w" };
      this.board.orientation = "vertical";
      this.tileInfoPane.hints = { x: 0, y: "1w", w: 1, h: 1 };
      this.placementLayer.hints = { x: 0, y: 0, w: 1, h: 1 };
      this.scoreboard.hints = { right: 0.99, y: 0, w: 1, h: "1.0" };
      this.statusLabel.hints = { x: 0.01, y: "1.0", w: 1, h: "1.0" };
      this.actionBar.hints = { x: 0, bottom: 1, w: 1, h: "2.0" };
      this.actionBar.orientation = "horizontal";
      this.nextButton.hints = { right: 0.99, y: "1.0", w: 0.1, h: "1.0" };
      this.undoButton.hints = { right: 0.99, y: "2.2", w: 0.1, h: "1.0" };
      this.instrButton.hints = { right: 0.99, y: "3.4", w: 0.15, h: "1.0" };
    }
  }
  finishTurn() {
    if (this.activePlayer === 0) {
      const sm = this.players[this.activePlayer].scoreMarker;
      if (sm.turn > 1) {
        sm.turn--;
        if (sm.turn == 1) {
          this.nextButton.text = "End game";
        }
      } else if (sm.turn === 1) {
        sm.turn = 0;
        this.nextButton.disable = true;
        this.gameOver = true;
      }
    }
    this.tilesPlacedThisTurn = 0;
    this.nextPlayer();
  }
  /**
   * @param {TerrainHex|null} terrain 
   */
  updateScores(terrain = null) {
    if (terrain !== null) {
      this.updateResourceProduction();
    }
  }
  /**
   * 
   * @param {Player} player 
   * @param {TerrainHex} terr
   * @returns 
   */
  removeTileFromTerrain(player, terr) {
    const tile = terr.tile;
    terr.tile = null;
    for (let p of this.players) {
      p.placedTiles = p.placedTiles.filter((t0) => t0 !== tile);
    }
  }
  /**
   * 
   * @param {Player} player 
   * @param {TerrainHex} thex 
   * @param {Tile} tile 
   * @param {boolean} removeExisting
   * @param {boolean} serverCheck 
   * @returns 
   */
  placeTile(player, thex, tile, removeExisting = false, advanceTurn = true, serverCheck = true) {
    const hexPos = thex.hexPos;
    const t = this.board.terrainMap.atPos(...hexPos);
    if (t === void 0) return false;
    if (t.tile !== null) {
      if (!removeExisting) return false;
      this.removeTileFromTerrain(player, thex);
    }
    if (tile.terrainPlacement[t.code] === null) return false;
    const center = advanceTurn ? [thex.center_x, thex.center_y] : null;
    tile.place(thex, center, player, this.board);
    player.placedTiles.push(tile);
    player.scoreMarker.tilesPlacedThisTurn++;
    thex.tile = tile;
    this.updateScores(thex);
    for (let t2 of player.placedTiles) {
      const terr = this.board.terrainMap.atPos(t2.hexPos[0], t2.hexPos[1]);
      if (terr === void 0) continue;
      if (t2 instanceof Castle) {
        t2.network = /* @__PURE__ */ new Set([terr]);
        t2.updateNetwork(terr, this.board, 3, t2.network);
      }
    }
    this.tileInfoPane.tile = tile;
    this.actionBar.selectedTile = null;
    this.roundPlacements.push([tile, thex]);
    this.undoButton.disable = false;
    if (advanceTurn) {
      this.clearPlacementTargets();
    }
    if (player.scoreMarker.tilesPlacedThisTurn >= 5) {
      this.actionBar.active = false;
      this.statusLabel.text = "End round";
    }
    return true;
  }
  /**
   * 
   * @param {TerrainHex} terrain 
   * @param {Touch} touch 
   * @returns 
   */
  onTouchDownTerrain(terrain, touch) {
    if (this.gameOver) return true;
    const player = this.players[this.activePlayer];
    if (!player.localControl) return true;
    if (terrain.tile) {
      const verb = !(terrain.tile instanceof Rubble) && terrain.tile.needsFilled.meets(terrain.tile.needs) ? "Active" : "Inactive";
      if (!(terrain.tile instanceof Rubble && this.actionBar.selectedTile !== null)) {
        this.actionBar.selectedTile = null;
        this.displayTileNetworkInfo(player, terrain);
        this.tileInfoPane.tile = terrain.tile;
        this.statusLabel.text = `${verb} ${tileNames[terrain.tile.code]}`;
        return true;
      }
      this.tileInfoPane.tile = terrain.tile;
    }
    if (this.actionBar.selectedTile === null) {
      this.displayTileNetworkInfo(player, terrain);
      this.tileInfoPane.tile = null;
      this.statusLabel.text = "Select a building";
      return true;
    }
    const tile = this.actionBar.selectedTile;
    const tileToPlace = playerTileClasses[tile.code].a({});
    if (!this.canReach(player, terrain)) return true;
    this.actionBar.selectedTile = null;
    return this.placeTile(player, terrain, tileToPlace, terrain.tile instanceof Rubble);
  }
  /**
   * Returns the set of the tiles that can be reached by the player
   * @param {Player} player Player who will place
   */
  reachableTiles(player) {
    const reachable = /* @__PURE__ */ new Set();
    for (let t of player.placedTiles) {
      const terr = this.board.terrainMap.atPos(t.hexPos[0], t.hexPos[1]);
      if (terr === void 0) continue;
      reachable.add(terr);
      for (let terrAdj of this.board.neighborIter(terr.hexPos)) {
        reachable.add(terrAdj);
      }
      if (t instanceof Tradeship) {
        for (let port of t.network) {
          reachable.add(port);
        }
      }
    }
    return reachable;
  }
  /**
   * Returns true if the player can reach the destination terrain location
   * @param {Player} player Player who will place
   * @param {TerrainHex} terrain Location to place in
   * @returns 
   */
  canReach(player, terrain) {
    return this.reachableTiles(player).has(terrain);
  }
  /**@type {import('../eskv/lib/modules/widgets.js').EventCallbackNullable} */
  selectTile(e, o, v) {
    if (v === null) {
      this.clearPlacementTargets();
      this.tileInfoPane.tile = null;
      this.statusLabel.text = "Select a building";
      return;
    }
    const player = this.players[this.activePlayer];
    this.displayTileNetworkInfo(player, null);
    if (player.scoreMarker.tilesPlacedThisTurn < 5) {
      if (v) {
        this.statusLabel.text = "Place " + v.name;
        this.setPlacementTargets(v.code);
        this.tileInfoPane.tile = v;
      }
    } else {
      if (this.actionBar.active) this.actionBar.active = false;
      this.clearPlacementTargets();
      this.tileInfoPane.tile = null;
      this.statusLabel.text = "End round";
    }
  }
  updateResourceProduction() {
    const player = this.players[0];
    const enemy = this.players[1];
    if (!player || !enemy) return;
    const placedTiles = [...player.placedTiles, ...enemy.placedTiles];
    placedTiles.sort((a2, b) => tilePriority[a2.code] - tilePriority[b.code]);
    const reversePlacedTiles = [...placedTiles];
    reversePlacedTiles.reverse();
    for (let tile of placedTiles) {
      tile.needsFilled.clear();
      tile.productionFilled.clear();
    }
    let changes = true;
    const deactivatedUsers = /* @__PURE__ */ new Map();
    for (let t of placedTiles) {
      deactivatedUsers.set(t, /* @__PURE__ */ new Set());
    }
    let loops = 0;
    /* @__PURE__ */ console.log("==============Starting resource production allocation==============");
    while (changes && loops < 10) {
      ++loops;
      /* @__PURE__ */ console.log("--------------Loop", loops, "-----------------------------------------------");
      changes = false;
      for (let tile of placedTiles) {
        let terr0 = this.board._terrainMap.atPos(tile.hexPos[0], tile.hexPos[1]);
        if (terr0 === void 0) continue;
        for (let terr of this.board.connectedIter(terr0, player, /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set())) {
          const adjTile = terr.tile;
          if (adjTile === null) continue;
          const conn = (
            /**@type {Set<Tile>}*/
            deactivatedUsers.get(tile)
          );
          if (conn.has(adjTile) && !tile.needsFilled.meets(tile.needs)) continue;
          for (let need of adjTile.needs.keys()) {
            const neededAmt = adjTile.needs.get(need);
            const neededAmtFilled = adjTile.needsFilled.get(need) ?? [];
            if (neededAmt === void 0) continue;
            if (neededAmt === 0 && neededAmtFilled.length >= 1 || neededAmt > 0 && neededAmtFilled.length >= neededAmt) continue;
            if (!tile.productionCapacity.has(need)) continue;
            const providedAmt = tile.productionCapacity.get(need);
            if (providedAmt === void 0) continue;
            if ((tile.productionFilled.get(need) ?? []).length >= providedAmt) continue;
            tile.productionFilled.addConnection(need, adjTile);
            adjTile.needsFilled.addConnection(need, tile);
            changes = true;
            /* @__PURE__ */ console.log("connected", tile, ...tile.hexPos, "->", adjTile, ...adjTile.hexPos, need);
          }
        }
      }
      if (changes) continue;
      for (let tile of reversePlacedTiles) {
        for (let need of tile.needsFilled.keys()) {
          const suppliers = tile.needsFilled.get(need) ?? [];
          suppliers.filter((sTile) => sTile.needsFilled.meets(sTile.needs));
          const inactiveSuppliers = suppliers.filter((sTile) => !sTile.needsFilled.meets(sTile.needs));
          if (inactiveSuppliers.length > 0) {
            for (let t of inactiveSuppliers) {
              tile.needsFilled.removeConnection(need, t);
            }
            for (let is of inactiveSuppliers) {
              is.productionFilled.removeConnection(need, tile);
              deactivatedUsers.get(is)?.add(tile);
              /* @__PURE__ */ console.log("deactivated", is, ...is.hexPos, "->", need, tile, ...tile.hexPos);
            }
            changes = true;
          }
        }
        if (changes) {
          if (!tile.needsFilled.meets(tile.needs)) {
            for (let n of tile.needsFilled.keys()) {
              const nfts = tile.needsFilled.get(n);
              if (nfts === void 0) continue;
              for (let nft of nfts) {
                if (nft.productionFilled.removeConnection(n, tile)) {
                  /* @__PURE__ */ console.log("unlinked", nft, ...nft.hexPos, "->", tile, ...tile.hexPos, n);
                }
              }
            }
            for (let n of tile.productionFilled.keys()) {
              const users = tile.productionFilled.get(n);
              if (users !== void 0) {
                for (let p of users) {
                  if (p.needsFilled.removeConnection(n, tile)) {
                    /* @__PURE__ */ console.log("unlinked", tile, ...tile.hexPos, "->", p, ...p.hexPos, n);
                  }
                }
              }
            }
            if (tile.productionFilled.size > 0) {
              tile.productionFilled.clear();
            }
            changes = true;
          }
          break;
        }
      }
    }
    if (loops >= 1e3) {
      /* @__PURE__ */ console.log("Exceeded loop limit during resource produciton allocation");
    }
    for (let tile of placedTiles) {
      tile.updateResourceStatusIcons();
    }
  }
  on_touch_down(e, o, touch) {
    if (!super.on_touch_down(e, o, touch)) {
      if (this.collide(touch.rect)) {
        this.displayTileNetworkInfo(this.players[this.activePlayer], null);
        this.statusLabel.text = "Select a building";
        this.tileInfoPane.tile = null;
        if (this.actionBar.selectedTile !== null) {
          this.actionBar.selectedTile = null;
        }
      }
      return true;
    }
    return false;
  }
  /**
   * 
   * @param {Player} player 
   * @param {TerrainHex|null} terrain 
   */
  displayTileNetworkInfo(player, terrain) {
    if (terrain === null || terrain.tile === null) {
      for (let t of player.placedTiles) t.showResourceStatus = true;
      this.placementLayer.children = [];
      return;
    }
    for (let t of player.placedTiles) t.showResourceStatus = false;
    const edges = [];
    const nodes = [];
    const srcTerr = terrain;
    const srcTile = terrain.tile;
    if (srcTile) {
      for (const [res, arr] of srcTile.needsFilled) {
        for (const prodTile of arr ?? []) {
          edges.push(NetworkFlowEdge.a({
            hints: { x: 0, y: 0, w: "1w", h: "1h" },
            // cover the overlay layer
            board: this.board,
            fromHex: prodTile.hexPos,
            toHex: srcTerr.hexPos,
            resource: res,
            primary: true
          }));
        }
      }
      for (const [res, arr] of srcTile.productionFilled) {
        for (const consTile of arr ?? []) {
          edges.push(NetworkFlowEdge.a({
            hints: { x: 0, y: 0, w: "1w", h: "1h" },
            board: this.board,
            fromHex: srcTerr.hexPos,
            toHex: consTile.hexPos,
            resource: res,
            primary: true
          }));
        }
      }
    }
    for (let terr of this.board.connectedIter(terrain, player, /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set())) {
      let output = "", input = "";
      const nto = NetworkTileOverlay.a({
        w: this.board.hexSide,
        h: this.board.hexSide,
        hexPos: terr.hexPos,
        input,
        output,
        primary: terr === terrain
      });
      nto.updateIO();
      nodes.push(nto);
    }
    this.placementLayer.children = [...nodes, ...edges];
  }
  /**
   * 
   * @param {Player} player 
   * @param {TerrainHex|null} terrain 
   */
  displayTileNetworkInfo2(player, terrain) {
    if (terrain === null) {
      for (let t of player.placedTiles) {
        t.showResourceStatus = true;
      }
      this.placementLayer.children = [];
      return;
    }
    const tile = terrain.tile;
    if (tile === null) {
      for (let t of player.placedTiles) {
        t.showResourceStatus = true;
      }
      this.placementLayer.children = [];
      return;
    }
    for (let t of player.placedTiles) {
      t.showResourceStatus = false;
    }
    const info = [];
    for (let terr of this.board.connectedIter(terrain, player, /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set())) {
      let output = "";
      let input = "";
      if (terr.tile !== null) {
        if (terr !== terrain) {
          for (let n of tile.needsFilled.keys()) {
            if (tile.needsFilled.get(n)?.includes(terr.tile)) {
              input = n;
              break;
            }
          }
          for (let n of tile.productionFilled.keys()) {
            if (tile.productionFilled.get(n)?.includes(terr.tile)) {
              output = n;
              break;
            }
          }
        } else {
          for (let n of tile.needsFilled.keys()) {
            if ((tile.needsFilled.get(n) ?? []).length < (tile.needs.get(n) ?? 0)) {
              input = n;
              break;
            }
          }
          for (let n of tile.productionFilled.keys()) {
            if ((tile.productionFilled.get(n) ?? []).length < (tile.productionCapacity.get(n) ?? 0)) {
              output = n;
              break;
            }
          }
        }
      }
      const nto = NetworkTileOverlay.a({ w: this.board.hexSide, h: this.board.hexSide, hexPos: terr.hexPos, input, output, primary: terr === terrain });
      nto.updateIO();
      info.push(nto);
    }
    this.placementLayer.children = info;
  }
  /**
   * @param {TileType} tileType */
  setPlacementTargets(tileType) {
    const tile = playerTileClasses[tileType].a({});
    this.clearPlacementTargets();
    let player = this.players[this.activePlayer];
    if (!this.board.terrainMap) return;
    let targets = [];
    for (let thex of this.reachableTiles(player)) {
      if (thex.tile !== null && !(thex.tile instanceof Rubble)) continue;
      if (tile.terrainPlacement[thex.code] === null) continue;
      let value = tile.terrainPlacement[thex.code];
      let tt = TargetTile.a({
        w: this.board.hexSide * 2,
        h: this.board.hexSide * 2,
        score: value,
        hexPos: [thex.hexPos[0], thex.hexPos[1]]
      });
      let xy = this.board.pixelPos(thex.hexPos);
      tt.center_x = xy[0];
      tt.center_y = xy[1];
      targets.push(tt);
    }
    this.placementLayer.children = targets;
  }
  clearPlacementTargets() {
    this.placementLayer.children = [];
  }
  removePlayers() {
    this.activePlayer = 0;
    for (let p of this.players) {
      p.delete();
    }
    this.players = [];
  }
  clearLevel() {
    this.board.makeTerrain(levels[0]);
  }
  /**
   * @param {Level|null} level 
   */
  setupLevel(level = null) {
    if (level !== null) {
      this.level = level;
    }
    if (this.level === null) return;
    this.board.makeTerrain(this.level);
    if (!this.board.terrainMap) return;
    let p = this.players[0];
    let ep = this.players[1];
    if (!p || !ep) return;
    this.tileStack = [...this.level.tileSet].map((t) => playerTileClasses[t].a({}));
    this.tileStack.sort(() => Math.random() - 0.5);
    let startTile = playerTileClasses[this.level.startTile].a();
    let start = new Vec2(this.level.start);
    let startTerr = this.board.terrainMap.atPos(start[0], start[1]);
    if (startTerr === void 0) return;
    this.placeTile(p, startTerr, startTile, false, false);
    let furthest = 0;
    let enemyCandidates = [];
    for (let terr of this.board.terrainMap.iter()) {
      if (terr instanceof Water) continue;
      const dist2 = new Vec2(terr.hexPos).sub(new Vec2(startTerr.hexPos)).abs().sum();
      if (dist2 === furthest) {
        enemyCandidates.push(terr);
      } else if (dist2 > furthest) {
        enemyCandidates = [terr];
        furthest = dist2;
      }
    }
    if (enemyCandidates.length > 0) {
      const enemyStartTerr = choose(enemyCandidates);
      let enemyStartTile = EnemyCastle.a({});
      this.placeTile(ep, enemyStartTerr, enemyStartTile, true, false, false);
    }
    this.actionBar.addChild(Farm.a({}));
    this.actionBar.addChild(Village.a({}));
    this.actionBar.addChild(Mine.a({}));
    this.actionBar.addChild(Abbey.a({}));
    this.actionBar.addChild(Tradeship.a({}));
    this.actionBar.addChild(Stronghold.a({}));
    this.actionBar.addChild(Castle.a({}));
  }
  /**
   * 
   * @param {PlayerSpec[]} playerSpec 
   * @param {Level|null} level 
   */
  setupGame(playerSpec, level = null) {
    this.gameOver = false;
    this.statusLabel.text = "";
    this.statusLabel.color = "white";
    this.removePlayers();
    this.clearLevel();
    for (let p of playerSpec) {
      if (p.type === 0) {
        this.players.push(Player.a({ name: p.name, color: p.color, screen: this, showScore: true }));
      }
      if (p.type === 1) {
        this.players.push(EnemyPlayer.a({ name: p.name, color: p.color, screen: this, showScore: false }));
      }
    }
    this.setupLevel(level);
    this.players[0].scoreMarker.turn = 10;
    this.players[1].scoreMarker.turn = 10;
  }
  startGame() {
    this.startPlayerTurn();
  }
  nextPlayer() {
    if (this.activePlayer === 0) {
      this.players[this.activePlayer].endTurn(this);
      const player = this.players[0];
      const enemyPlayer = this.players[1];
      for (let t of player.placedTiles) {
        const terrain = this.board.terrainMap.atPos(t.hexPos[0], t.hexPos[1]);
        if (!terrain) continue;
        if (t instanceof Stronghold && t.needsFilled.meets(t.needs)) {
          for (let eterr of this.board.connectedIter(terrain, player, /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set())) {
            const etile = eterr.tile;
            if (etile) {
              if (etile instanceof EnemyDragon || etile instanceof EnemyStronghold || etile instanceof EnemyTent || etile instanceof EnemyCastle || etile instanceof EnemyLongboat) {
                etile.health--;
                if (etile.health <= 0) {
                  const rubble = Rubble.a({});
                  this.placeTile(enemyPlayer, eterr, rubble, true, false);
                  player.scoreMarker.score += 1;
                }
              }
            }
          }
        }
        if (t instanceof Castle && t.needsFilled.meets(t.needs)) {
          player.scoreMarker.score += 1;
        }
      }
    }
    this.activePlayer += 1;
    if (this.activePlayer >= this.players.length) {
      this.activePlayer = 0;
    }
    const p = this.players[this.activePlayer];
    p.scoreMarker.tilesPlacedThisTurn = 0;
    this.startPlayerTurn();
  }
  startPlayerTurn() {
    const p = this.players[this.activePlayer];
    this.updateResourceProduction();
    this.roundPlacements = [];
    this.undoButton.disable = true;
    if (p.localControl) {
      this.actionBar.active = true;
      if (p.scoreMarker.tilesPlacedThisTurn < 5) {
        this.statusLabel.text = "Select a building";
        this.statusLabel.color = p.color;
      } else {
        this.statusLabel.text = "End round";
        this.statusLabel.color = p.color;
      }
    } else {
      this.statusLabel.text = "";
      this.statusLabel.color = p.color;
    }
    p.startTurn(this);
  }
  showGameOver() {
    let scores = this.players.map((p) => p.scoreMarker.score);
    let hiScore = Math.max(...scores);
    let winners = this.players.filter((player, idx) => scores[idx] === hiScore);
    this.gameOver = true;
    if (this.players.length === 1) {
      let rating = "You bankrupted the kingdom!";
      if (hiScore > 40) rating = "Time to find another job";
      if (hiScore > 60) rating = "The people are happy";
      if (hiScore > 80) rating = "The people are joyous!";
      if (hiScore > 90) rating = "Welcome to the history books";
      if (hiScore > 100) rating = "Hail to the king!";
      this.statusLabel.color = winners[0].color;
      this.statusLabel.text = `Game over - ${rating}`;
    } else if (winners.length === 1) {
      this.statusLabel.color = winners[0].color;
      this.statusLabel.text = `Game over - ${winners[0].name} wins`;
    } else {
      this.statusLabel.color = "white";
      this.statusLabel.text = "Game over - draw";
    }
  }
  undoLastTile() {
    const last = this.roundPlacements.pop();
    if (last !== void 0) {
      const [tile, terr] = last;
      this.removeTileFromTerrain(this.players[0], terr);
      this.updateResourceProduction();
      const p = this.players[this.activePlayer];
      p.scoreMarker.tilesPlacedThisTurn--;
    }
    this.actionBar.selectedTile = null;
    this.clearPlacementTargets();
    this.tileInfoPane.tile = null;
    this.statusLabel.text = "Select a building";
    this.actionBar.active = true;
    if (this.roundPlacements.length === 0) {
      this.undoButton.disable = true;
    }
  }
  drawNewTile() {
    this.board.hexSide;
    if (this.tileStack.length === 0) {
      return;
    }
    let t = this.tileStack.pop();
    if (!t) return;
    this.actionBar.addChild(t);
  }
  layoutChildren() {
    if (this.w < this.h) {
      this.setLayoutForOrientation("vertical");
    } else {
      this.setLayoutForOrientation("horizontal");
    }
    this.applyHints(this.board);
    this.board.layoutChildren();
    let hexSide = this.board.hexSide;
    this.selectPos = [
      3 * (hexSide * 2 + 0.01 * this.w),
      this.h - hexSide * 2 - 0.01 * this.w
    ];
    for (let p of this.players) {
      p.boardResize(this.board, hexSide);
    }
    for (
      let tt of
      /**@type {TargetTile[]}*/
      this.placementLayer.children
    ) {
      if ("hexPos" in tt) {
        let hp = this.board.pixelPos(tt.hexPos);
        tt.w = hexSide, tt.h = hexSide, tt.center_x = hp[0];
        tt.center_y = hp[1];
      }
    }
    this.applyHints(this.tileInfoPane);
    this.tileInfoPane.layoutChildren();
    this.applyHints(this.scoreboard);
    this.scoreboard.layoutChildren();
    this.applyHints(this.actionBar);
    this.actionBar.layoutChildren();
    this.applyHints(this.statusLabel);
    this.statusLabel.layoutChildren();
    this.applyHints(this.nextButton);
    this.nextButton.layoutChildren();
    this.applyHints(this.undoButton);
    this.undoButton.layoutChildren();
    this.applyHints(this.instrButton);
    this.instrButton.layoutChildren();
    this.applyHints(this.placementLayer);
    this.placementLayer.layoutChildren();
    this._needsLayout = false;
  }
}
class PlayerSpec {
  constructor(name, color, type) {
    this.name = name;
    this.color = color;
    this.type = type;
  }
}
class PlayerScore extends Label {
  constructor() {
    super(...arguments);
    __publicField(this, "ident", "");
    __publicField(this, "color", "white");
    __publicField(this, "score", 0);
    __publicField(this, "turn", 10);
    __publicField(this, "tilesPlacedThisTurn", 0);
    __publicField(this, "activeTurn", false);
    /**@type {"left"|"center"|"right"}*/
    __publicField(this, "align", "right");
  }
  on_score(event, object, data) {
    this.updateStatus();
  }
  on_turn(event, object, data) {
    this.updateStatus();
  }
  on_tilesPlacedThisTurn(event, object, data) {
    this.updateStatus();
  }
  updateStatus() {
    if (this.turn > 1) {
      this.text = `Buildings to place: ${5 - this.tilesPlacedThisTurn} -- Round: ${11 - this.turn}/10 -- Score: ${this.score}`;
    } else if (this.turn === 1) {
      this.text = `Buildings to place: ${5 - this.tilesPlacedThisTurn} -- Last round -- Score: ${this.score}`;
    } else {
      this.text = `Game over -- Score: ${this.score}`;
    }
  }
}
class Player extends EventSink {
  constructor() {
    super();
    __publicField(this, "name", "");
    __publicField(this, "color", "white");
    /**@type {GameScreen|null} */
    __publicField(this, "screen", null);
    __publicField(this, "showScore", true);
    this.localControl = true;
    this.placedTiles = [];
    this.scoreMarker = PlayerScore.a({ ident: this.name.substring(0, 2), color: this.color });
  }
  on_showScore(event, object, value) {
    if (this.showScore) {
      this.screen?.scoreboard.addChild(this.scoreMarker);
    } else {
      this.screen?.scoreboard.removeChild(this.scoreMarker);
    }
  }
  delete() {
    this.reset();
    if (this.showScore) ;
    this.placedTiles = [];
  }
  reset() {
    this.scoreMarker.activeTurn = false;
    this.scoreMarker.score = 0;
    this.placedTiles = [];
  }
  /**
   * 
   * @param {GameScreen} screen 
   */
  startTurn(screen2) {
    this.scoreMarker.activeTurn = true;
    this.scoreMarker.tilesPlacedThisTurn = 0;
  }
  /**
   * 
   * @param {GameScreen} screen 
   */
  endTurn(screen2) {
    this.scoreMarker.activeTurn = false;
  }
  /**
   * 
   * @param {Board} board 
   * @param {number} hexSide 
   */
  boardResize(board, hexSide) {
    for (let pt of this.placedTiles) {
      if (pt._animation) continue;
      pt.w = hexSide * 2;
      pt.h = hexSide * 2;
      [pt.center_x, pt.center_y] = board.pixelPos(pt.hexPos);
    }
  }
}
class EnemyPlayer extends Player {
  constructor() {
    super(...arguments);
    __publicField(this, "maxTiles", 13);
    __publicField(this, "localControl", false);
  }
  /**
   * 
   * @param {GameScreen} screen 
   */
  startTurn(screen2) {
    const board = screen2.board;
    const otherPlayer = screen2.players[0];
    for (let t of this.placedTiles) {
      if (t instanceof EnemyStronghold) {
        for (let terr of board.neighborIter(t.hexPos)) {
          if (terr.tile instanceof Tile && !(terr.tile instanceof Rubble) && !this.placedTiles.includes(terr.tile)) {
            screen2.placeTile(otherPlayer, terr, Rubble.a({}), true, false);
            break;
          }
        }
      } else if (t instanceof EnemyDragon) {
        for (let terr of board.neighborIter(t.hexPos)) {
          if (terr.tile instanceof Tile && !(terr.tile instanceof Rubble) && !this.placedTiles.includes(terr.tile)) {
            screen2.placeTile(otherPlayer, terr, Rubble.a({}), true, false);
            break;
          }
        }
      }
    }
    function nearestTiles(p, op) {
      let nearest = Infinity;
      let nearTiles = (
        /**@type {[Tile, Tile][]}*/
        []
      );
      for (let t of p.placedTiles) {
        for (let o of op.placedTiles) {
          const dist2 = new Vec2(t.hexPos).sub(o.hexPos).abs().sum();
          if (dist2 < nearest) {
            nearTiles = [[t, o]];
            nearest = dist2;
          } else if (dist2 === nearest) {
            nearTiles.push([t, o]);
          }
        }
      }
      return { nearest, nearTiles };
    }
    function nearestEmptyTerrain(board2, tile, op, excludeWater = false) {
      let nearest = Infinity;
      let nearTerrain = (
        /**@type {Set<TerrainHex>}*/
        /* @__PURE__ */ new Set()
      );
      for (let terr of tile.iterNetwork(board2)) {
        if (excludeWater && terr instanceof Water) continue;
        if (terr.tile !== null) continue;
        for (const ot of op.placedTiles) {
          const dist2 = new Vec2(terr.hexPos).sub(ot.hexPos).abs().sum();
          if (dist2 < nearest) {
            nearTerrain.clear();
            nearTerrain.add(terr);
            nearest = dist2;
          } else if (dist2 === nearest) {
            nearTerrain.add(terr);
          }
        }
      }
      return { nearest, nearTerrain };
    }
    if (this.placedTiles.filter((t) => !(t instanceof Rubble)).length < this.maxTiles) {
      const ntData = nearestTiles(this, otherPlayer);
      const nearTiles = ntData.nearTiles;
      const [t, ot] = choose(nearTiles);
      if (t instanceof EnemyCastle) {
        const nltData = nearestEmptyTerrain(board, t, otherPlayer);
        const newTerr = choose([...nltData.nearTerrain]);
        if (newTerr instanceof Water) {
          screen2.placeTile(this, newTerr, EnemyLongboat.a({}), true, false, false);
        } else if (newTerr) {
          screen2.placeTile(this, newTerr, EnemyTent.a({}), true, false, false);
        }
      } else if (t instanceof EnemyStronghold) {
        const nltData = nearestEmptyTerrain(board, t, otherPlayer);
        const newTerr = choose([...nltData.nearTerrain]);
        if (newTerr instanceof Water) {
          screen2.placeTile(this, newTerr, EnemyLongboat.a({}), true, false, false);
        } else if (newTerr) {
          screen2.placeTile(this, newTerr, EnemyTent.a({}), true, false, false);
        }
      } else if (t instanceof EnemyLongboat) {
        const nltData = nearestEmptyTerrain(board, t, otherPlayer);
        const newTerr = choose([...nltData.nearTerrain]);
        if (newTerr instanceof Water) {
          screen2.placeTile(this, newTerr, EnemyLongboat.a({}), true, false, false);
        } else if (newTerr) {
          screen2.placeTile(this, newTerr, EnemyStronghold.a({}), true, false, false);
        }
      } else if (t instanceof EnemyTent) {
        const nltData = nearestEmptyTerrain(board, t, otherPlayer);
        const newTerr = choose([...nltData.nearTerrain]);
        if (newTerr instanceof Water) {
          screen2.placeTile(this, newTerr, EnemyLongboat.a({}), true, false, false);
        } else if (newTerr) {
          screen2.placeTile(this, newTerr, EnemyStronghold.a({}), true, false, false);
        }
      }
    }
    screen2.finishTurn();
  }
}
const playerColorLookup = {
  0: [0.6, 0, 0, 1],
  1: [0, 0.6, 0, 1]
};
class GameMenu extends BoxLayout {
  constructor() {
    super();
    __publicField(this, "playerCount", 0);
    /**@type {Player[]} */
    __publicField(this, "players", []);
    __publicField(this, "wGame", GameScreen.a({}));
    __publicField(this, "level", levels[0]);
    /**@type {PlayerSpec[]} */
    __publicField(this, "playerSpec", []);
    this.addChild(this.wGame);
    this.startSpGame(this.level);
  }
  restartGame() {
    let game = this.wGame;
    game.setupGame(this.playerSpec, levels[0]);
    game.startGame();
    this.current = "game";
  }
  startGame() {
    let ps = new PlayerSpec("Player", playerColorLookup[0], 0);
    let es = new PlayerSpec("Enemy", playerColorLookup[1], 1);
    this.playerSpec = [ps, es];
    this.wGame.setupGame(this.playerSpec, levels[0]);
    this.wGame.startGame();
    this.current = "game";
  }
  /**
   * 
   * @param {Level} level 
   */
  startSpGame(level) {
    this.playerSpec = [
      new PlayerSpec("Player", "white", 0),
      new PlayerSpec("Enemy", "red", 1)
    ];
    this.wGame.setupGame(this.playerSpec, levels[0]);
    this.wGame.startGame();
    this.current = "game";
  }
}
class PuzzleKingdomApp extends App {
  constructor() {
    super();
    this.prefDimH = 20;
    this.prefDimW = 20;
    this._baseWidget.children = [
      GameMenu.a({ hints: { x: 0, y: 0, w: 1, h: 1 } })
    ];
  }
}
var pk = new PuzzleKingdomApp();
pk.start();
