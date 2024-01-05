var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations2) => {
    for (const mutation of mutations2) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
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
function makeMap(str, expectsLowerCase) {
  const map = /* @__PURE__ */ Object.create(null);
  const list = str.split(",");
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
}
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const onRE = /^on[^a-z]/;
const isOn = (key) => onRE.test(key);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
const isArray = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isDate = (val) => toTypeString(val) === "[object Date]";
const isRegExp = (val) => toTypeString(val) === "[object RegExp]";
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject$1 = (val) => val !== null && typeof val === "object";
const isPromise$1 = (val) => {
  return (isObject$1(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
const camelizeRE = /-(\w)/g;
const camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
});
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction(
  (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
);
const capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
const toHandlerKey = cacheStringFunction((str) => {
  const s = str ? `on${capitalize(str)}` : ``;
  return s;
});
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg);
  }
};
const def = (obj, key, value) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value
  });
};
const looseToNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
const toNumber = (val) => {
  const n = isString(val) ? Number(val) : NaN;
  return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
function normalizeStyle$1(value) {
  if (isArray(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle$1(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value) || isObject$1(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject$1(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
function looseCompareArrays(a, b) {
  if (a.length !== b.length)
    return false;
  let equal = true;
  for (let i = 0; equal && i < a.length; i++) {
    equal = looseEqual(a[i], b[i]);
  }
  return equal;
}
function looseEqual(a, b) {
  if (a === b)
    return true;
  let aValidType = isDate(a);
  let bValidType = isDate(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a.getTime() === b.getTime() : false;
  }
  aValidType = isSymbol(a);
  bValidType = isSymbol(b);
  if (aValidType || bValidType) {
    return a === b;
  }
  aValidType = isArray(a);
  bValidType = isArray(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareArrays(a, b) : false;
  }
  aValidType = isObject$1(a);
  bValidType = isObject$1(b);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false;
    }
    const aKeysCount = Object.keys(a).length;
    const bKeysCount = Object.keys(b).length;
    if (aKeysCount !== bKeysCount) {
      return false;
    }
    for (const key in a) {
      const aHasKey = a.hasOwnProperty(key);
      const bHasKey = b.hasOwnProperty(key);
      if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) {
        return false;
      }
    }
  }
  return String(a) === String(b);
}
function looseIndexOf(arr, val) {
  return arr.findIndex((item) => looseEqual(item, val));
}
const toDisplayString = (val) => {
  return isString(val) ? val : val == null ? "" : isArray(val) || isObject$1(val) && (val.toString === objectToString || !isFunction(val.toString)) ? JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val) => {
  if (val && val.__v_isRef) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val2]) => {
        entries[`${key} =>`] = val2;
        return entries;
      }, {})
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()]
    };
  } else if (isObject$1(val) && !isArray(val) && !isPlainObject(val)) {
    return String(val);
  }
  return val;
};
let activeEffectScope;
class EffectScope {
  constructor(detached = false) {
    this.detached = detached;
    this._active = true;
    this.effects = [];
    this.cleanups = [];
    this.parent = activeEffectScope;
    if (!detached && activeEffectScope) {
      this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
        this
      ) - 1;
    }
  }
  get active() {
    return this._active;
  }
  run(fn) {
    if (this._active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    }
  }
  on() {
    activeEffectScope = this;
  }
  off() {
    activeEffectScope = this.parent;
  }
  stop(fromParent) {
    if (this._active) {
      let i, l;
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].stop();
      }
      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]();
      }
      if (this.scopes) {
        for (i = 0, l = this.scopes.length; i < l; i++) {
          this.scopes[i].stop(true);
        }
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
      this._active = false;
    }
  }
}
function effectScope(detached) {
  return new EffectScope(detached);
}
function recordEffectScope(effect, scope = activeEffectScope) {
  if (scope && scope.active) {
    scope.effects.push(effect);
  }
}
function getCurrentScope() {
  return activeEffectScope;
}
const createDep = (effects) => {
  const dep = new Set(effects);
  dep.w = 0;
  dep.n = 0;
  return dep;
};
const wasTracked = (dep) => (dep.w & trackOpBit) > 0;
const newTracked = (dep) => (dep.n & trackOpBit) > 0;
const initDepMarkers = ({ deps }) => {
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].w |= trackOpBit;
    }
  }
};
const finalizeDepMarkers = (effect) => {
  const { deps } = effect;
  if (deps.length) {
    let ptr = 0;
    for (let i = 0; i < deps.length; i++) {
      const dep = deps[i];
      if (wasTracked(dep) && !newTracked(dep)) {
        dep.delete(effect);
      } else {
        deps[ptr++] = dep;
      }
      dep.w &= ~trackOpBit;
      dep.n &= ~trackOpBit;
    }
    deps.length = ptr;
  }
};
const targetMap = /* @__PURE__ */ new WeakMap();
let effectTrackDepth = 0;
let trackOpBit = 1;
const maxMarkerBits = 30;
let activeEffect;
const ITERATE_KEY = Symbol("");
const MAP_KEY_ITERATE_KEY = Symbol("");
class ReactiveEffect {
  constructor(fn, scheduler = null, scope) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
    this.parent = void 0;
    recordEffectScope(this, scope);
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    let parent = activeEffect;
    let lastShouldTrack = shouldTrack;
    while (parent) {
      if (parent === this) {
        return;
      }
      parent = parent.parent;
    }
    try {
      this.parent = activeEffect;
      activeEffect = this;
      shouldTrack = true;
      trackOpBit = 1 << ++effectTrackDepth;
      if (effectTrackDepth <= maxMarkerBits) {
        initDepMarkers(this);
      } else {
        cleanupEffect(this);
      }
      return this.fn();
    } finally {
      if (effectTrackDepth <= maxMarkerBits) {
        finalizeDepMarkers(this);
      }
      trackOpBit = 1 << --effectTrackDepth;
      activeEffect = this.parent;
      shouldTrack = lastShouldTrack;
      this.parent = void 0;
      if (this.deferStop) {
        this.stop();
      }
    }
  }
  stop() {
    if (activeEffect === this) {
      this.deferStop = true;
    } else if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}
function cleanupEffect(effect2) {
  const { deps } = effect2;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect2);
    }
    deps.length = 0;
  }
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function track(target, type, key) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = createDep());
    }
    trackEffects(dep);
  }
}
function trackEffects(dep, debuggerEventExtraInfo) {
  let shouldTrack2 = false;
  if (effectTrackDepth <= maxMarkerBits) {
    if (!newTracked(dep)) {
      dep.n |= trackOpBit;
      shouldTrack2 = !wasTracked(dep);
    }
  } else {
    shouldTrack2 = !dep.has(activeEffect);
  }
  if (shouldTrack2) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps = [];
  if (type === "clear") {
    deps = [...depsMap.values()];
  } else if (key === "length" && isArray(target)) {
    const newLength = Number(newValue);
    depsMap.forEach((dep, key2) => {
      if (key2 === "length" || !isSymbol(key2) && key2 >= newLength) {
        deps.push(dep);
      }
    });
  } else {
    if (key !== void 0) {
      deps.push(depsMap.get(key));
    }
    switch (type) {
      case "add":
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          deps.push(depsMap.get("length"));
        }
        break;
      case "delete":
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case "set":
        if (isMap(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }
  if (deps.length === 1) {
    if (deps[0]) {
      {
        triggerEffects(deps[0]);
      }
    }
  } else {
    const effects = [];
    for (const dep of deps) {
      if (dep) {
        effects.push(...dep);
      }
    }
    {
      triggerEffects(createDep(effects));
    }
  }
}
function triggerEffects(dep, debuggerEventExtraInfo) {
  const effects = isArray(dep) ? dep : [...dep];
  for (const effect2 of effects) {
    if (effect2.computed) {
      triggerEffect(effect2);
    }
  }
  for (const effect2 of effects) {
    if (!effect2.computed) {
      triggerEffect(effect2);
    }
  }
}
function triggerEffect(effect2, debuggerEventExtraInfo) {
  if (effect2 !== activeEffect || effect2.allowRecurse) {
    if (effect2.scheduler) {
      effect2.scheduler();
    } else {
      effect2.run();
    }
  }
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
const arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
function createArrayInstrumentations() {
  const instrumentations = {};
  ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    instrumentations[key] = function(...args) {
      const arr = toRaw(this);
      for (let i = 0, l = this.length; i < l; i++) {
        track(arr, "get", i + "");
      }
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        return arr[key](...args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    instrumentations[key] = function(...args) {
      pauseTracking();
      const res = toRaw(this)[key].apply(this, args);
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}
function hasOwnProperty(key) {
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
  constructor(_isReadonly = false, _shallow = false) {
    this._isReadonly = _isReadonly;
    this._shallow = _shallow;
  }
  get(target, key, receiver) {
    const isReadonly2 = this._isReadonly, shallow = this._shallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return shallow;
    } else if (key === "__v_raw" && receiver === (isReadonly2 ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target)) {
      return target;
    }
    const targetIsArray = isArray(target);
    if (!isReadonly2) {
      if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty;
      }
    }
    const res = Reflect.get(target, key, receiver);
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (shallow) {
      return res;
    }
    if (isRef(res)) {
      return targetIsArray && isIntegerKey(key) ? res : res.value;
    }
    if (isObject$1(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  }
}
class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(shallow = false) {
    super(false, shallow);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
      return false;
    }
    if (!this._shallow) {
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value;
        return true;
      }
    }
    const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(shallow = false) {
    super(true, shallow);
  }
  set(target, key) {
    return true;
  }
  deleteProperty(target, key) {
    return true;
  }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(
  true
);
const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function get(target, key, isReadonly2 = false, isShallow2 = false) {
  target = target["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (hasChanged(key, rawKey)) {
      track(rawTarget, "get", key);
    }
    track(rawTarget, "get", rawKey);
  }
  const { has: has2 } = getProto(rawTarget);
  const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
  if (has2.call(rawTarget, key)) {
    return wrap(target.get(key));
  } else if (has2.call(rawTarget, rawKey)) {
    return wrap(target.get(rawKey));
  } else if (target !== rawTarget) {
    target.get(key);
  }
}
function has(key, isReadonly2 = false) {
  const target = this["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (hasChanged(key, rawKey)) {
      track(rawTarget, "has", key);
    }
    track(rawTarget, "has", rawKey);
  }
  return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly2 = false) {
  target = target["__v_raw"];
  !isReadonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
  return Reflect.get(target, "size", target);
}
function add(value) {
  value = toRaw(value);
  const target = toRaw(this);
  const proto = getProto(target);
  const hadKey = proto.has.call(target, value);
  if (!hadKey) {
    target.add(value);
    trigger(target, "add", value, value);
  }
  return this;
}
function set(key, value) {
  value = toRaw(value);
  const target = toRaw(this);
  const { has: has2, get: get22 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  const oldValue = get22.call(target, key);
  target.set(key, value);
  if (!hadKey) {
    trigger(target, "add", key, value);
  } else if (hasChanged(value, oldValue)) {
    trigger(target, "set", key, value);
  }
  return this;
}
function deleteEntry(key) {
  const target = toRaw(this);
  const { has: has2, get: get22 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  get22 ? get22.call(target, key) : void 0;
  const result = target.delete(key);
  if (hadKey) {
    trigger(target, "delete", key, void 0);
  }
  return result;
}
function clear() {
  const target = toRaw(this);
  const hadItems = target.size !== 0;
  const result = target.clear();
  if (hadItems) {
    trigger(target, "clear", void 0, void 0);
  }
  return result;
}
function createForEach(isReadonly2, isShallow2) {
  return function forEach(callback, thisArg) {
    const observed = this;
    const target = observed["__v_raw"];
    const rawTarget = toRaw(target);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
    return target.forEach((value, key) => {
      return callback.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return {
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      },
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    return type === "delete" ? false : this;
  };
}
function createInstrumentations() {
  const mutableInstrumentations2 = {
    get(key) {
      return get(this, key);
    },
    get size() {
      return size(this);
    },
    has,
    add,
    set,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  const shallowInstrumentations2 = {
    get(key) {
      return get(this, key, false, true);
    },
    get size() {
      return size(this);
    },
    has,
    add,
    set,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  const readonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, false)
  };
  const shallowReadonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, true)
  };
  const iteratorMethods = ["keys", "values", "entries", Symbol.iterator];
  iteratorMethods.forEach((method) => {
    mutableInstrumentations2[method] = createIterableMethod(
      method,
      false,
      false
    );
    readonlyInstrumentations2[method] = createIterableMethod(
      method,
      true,
      false
    );
    shallowInstrumentations2[method] = createIterableMethod(
      method,
      false,
      true
    );
    shallowReadonlyInstrumentations2[method] = createIterableMethod(
      method,
      true,
      true
    );
  });
  return [
    mutableInstrumentations2,
    readonlyInstrumentations2,
    shallowInstrumentations2,
    shallowReadonlyInstrumentations2
  ];
}
const [
  mutableInstrumentations,
  readonlyInstrumentations,
  shallowInstrumentations,
  shallowReadonlyInstrumentations
] = /* @__PURE__ */ createInstrumentations();
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = shallow ? isReadonly2 ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly2 ? readonlyInstrumentations : mutableInstrumentations;
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive(target) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
function shallowReactive(target) {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  );
}
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject$1(target)) {
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
  def(value, "__v_skip", true);
  return value;
}
const toReactive = (value) => isObject$1(value) ? reactive(value) : value;
const toReadonly = (value) => isObject$1(value) ? readonly(value) : value;
function trackRefValue(ref2) {
  if (shouldTrack && activeEffect) {
    ref2 = toRaw(ref2);
    {
      trackEffects(ref2.dep || (ref2.dep = createDep()));
    }
  }
}
function triggerRefValue(ref2, newVal) {
  ref2 = toRaw(ref2);
  const dep = ref2.dep;
  if (dep) {
    {
      triggerEffects(dep);
    }
  }
}
function isRef(r) {
  return !!(r && r.__v_isRef === true);
}
function ref(value) {
  return createRef(value, false);
}
function createRef(rawValue, shallow) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
class RefImpl {
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow;
    this.dep = void 0;
    this.__v_isRef = true;
    this._rawValue = __v_isShallow ? value : toRaw(value);
    this._value = __v_isShallow ? value : toReactive(value);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newVal) {
    const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
    newVal = useDirectValue ? newVal : toRaw(newVal);
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = useDirectValue ? newVal : toReactive(newVal);
      triggerRefValue(this);
    }
  }
}
function unref(ref2) {
  return isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
class ComputedRefImpl {
  constructor(getter, _setter, isReadonly2, isSSR) {
    this._setter = _setter;
    this.dep = void 0;
    this.__v_isRef = true;
    this["__v_isReadonly"] = false;
    this._dirty = true;
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerRefValue(this);
      }
    });
    this.effect.computed = this;
    this.effect.active = this._cacheable = !isSSR;
    this["__v_isReadonly"] = isReadonly2;
  }
  get value() {
    const self2 = toRaw(this);
    trackRefValue(self2);
    if (self2._dirty || !self2._cacheable) {
      self2._dirty = false;
      self2._value = self2.effect.run();
    }
    return self2._value;
  }
  set value(newValue) {
    this._setter(newValue);
  }
}
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  const onlyGetter = isFunction(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = NOOP;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
  return cRef;
}
function warn(msg, ...args) {
  return;
}
function callWithErrorHandling(fn, instance, type, args) {
  let res;
  try {
    res = args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
  return res;
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise$1(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  const values = [];
  for (let i = 0; i < fn.length; i++) {
    values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
  }
  return values;
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = type;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    const appErrorHandler = instance.appContext.config.errorHandler;
    if (appErrorHandler) {
      callWithErrorHandling(
        appErrorHandler,
        null,
        10,
        [err, exposedInstance, errorInfo]
      );
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev);
}
function logError(err, type, contextVNode, throwInDev = true) {
  {
    console.error(err);
  }
}
let isFlushing = false;
let isFlushPending = false;
const queue = [];
let flushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
function nextTick(fn) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
}
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJob = queue[middle];
    const middleJobId = getId(middleJob);
    if (middleJobId < id || middleJobId === id && middleJob.pre) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return start;
}
function queueJob(job) {
  if (!queue.length || !queue.includes(
    job,
    isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex
  )) {
    if (job.id == null) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(job.id), 0, job);
    }
    queueFlush();
  }
}
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true;
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function invalidateJob(job) {
  const i = queue.indexOf(job);
  if (i > flushIndex) {
    queue.splice(i, 1);
  }
}
function queuePostFlushCb(cb) {
  if (!isArray(cb)) {
    if (!activePostFlushCbs || !activePostFlushCbs.includes(
      cb,
      cb.allowRecurse ? postFlushIndex + 1 : postFlushIndex
    )) {
      pendingPostFlushCbs.push(cb);
    }
  } else {
    pendingPostFlushCbs.push(...cb);
  }
  queueFlush();
}
function flushPreFlushCbs(seen2, i = isFlushing ? flushIndex + 1 : 0) {
  for (; i < queue.length; i++) {
    const cb = queue[i];
    if (cb && cb.pre) {
      queue.splice(i, 1);
      i--;
      cb();
    }
  }
}
function flushPostFlushCbs(seen2) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)];
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    activePostFlushCbs = deduped;
    activePostFlushCbs.sort((a, b) => getId(a) - getId(b));
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      activePostFlushCbs[postFlushIndex]();
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
const getId = (job) => job.id == null ? Infinity : job.id;
const comparator = (a, b) => {
  const diff = getId(a) - getId(b);
  if (diff === 0) {
    if (a.pre && !b.pre)
      return -1;
    if (b.pre && !a.pre)
      return 1;
  }
  return diff;
};
function flushJobs(seen2) {
  isFlushPending = false;
  isFlushing = true;
  queue.sort(comparator);
  const check = NOOP;
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && job.active !== false) {
        if (false)
          ;
        callWithErrorHandling(job, null, 14);
      }
    }
  } finally {
    flushIndex = 0;
    queue.length = 0;
    flushPostFlushCbs();
    isFlushing = false;
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs();
    }
  }
}
function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted)
    return;
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modelArg = isModelListener2 && event.slice(7);
  if (modelArg && modelArg in props) {
    const modifiersKey = `${modelArg === "modelValue" ? "model" : modelArg}Modifiers`;
    const { number, trim } = props[modifiersKey] || EMPTY_OBJ;
    if (trim) {
      args = rawArgs.map((a) => isString(a) ? a.trim() : a);
    }
    if (number) {
      args = rawArgs.map(looseToNumber);
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(
      handler,
      instance,
      6,
      args
    );
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(
      onceHandler,
      instance,
      6,
      args
    );
  }
}
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$1(comp)) {
      cache.set(comp, null);
    }
    return null;
  }
  if (isArray(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend(normalized, raw);
  }
  if (isObject$1(comp)) {
    cache.set(comp, normalized);
  }
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2).replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function pushScopeId(id) {
  currentScopeId = id;
}
function popScopeId() {
  currentScopeId = null;
}
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx)
    return fn;
  if (fn._n) {
    return fn;
  }
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance(ctx);
    let res;
    try {
      res = fn(...args);
    } finally {
      setCurrentRenderingInstance(prevInstance);
      if (renderFnWithContext._d) {
        setBlockTracking(1);
      }
    }
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
function markAttrsAccessed() {
}
function renderComponentRoot(instance) {
  const {
    type: Component,
    vnode,
    proxy,
    withProxy,
    props,
    propsOptions: [propsOptions],
    slots,
    attrs,
    emit: emit2,
    render,
    renderCache,
    data,
    setupState,
    ctx,
    inheritAttrs
  } = instance;
  let result;
  let fallthroughAttrs;
  const prev = setCurrentRenderingInstance(instance);
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      result = normalizeVNode(
        render.call(
          proxyToUse,
          proxyToUse,
          renderCache,
          props,
          setupState,
          data,
          ctx
        )
      );
      fallthroughAttrs = attrs;
    } else {
      const render2 = Component;
      if (false)
        ;
      result = normalizeVNode(
        render2.length > 1 ? render2(
          props,
          false ? {
            get attrs() {
              markAttrsAccessed();
              return attrs;
            },
            slots,
            emit: emit2
          } : { attrs, slots, emit: emit2 }
        ) : render2(
          props,
          null
        )
      );
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result = createVNode(Comment);
  }
  let root = result;
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root;
    if (keys.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys.some(isModelListener)) {
          fallthroughAttrs = filterModelListeners(
            fallthroughAttrs,
            propsOptions
          );
        }
        root = cloneVNode(root, fallthroughAttrs);
      }
    }
  }
  if (vnode.dirs) {
    root = cloneVNode(root);
    root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    root.transition = vnode.transition;
  }
  {
    result = root;
  }
  setCurrentRenderingInstance(prev);
  return result;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
const filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i = 0; i < dynamicProps.length; i++) {
        const key = dynamicProps[i];
        if (nextProps[key] !== prevProps[key] && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) {
        return true;
      }
    }
    if (prevProps === nextProps) {
      return false;
    }
    if (!prevProps) {
      return !!nextProps;
    }
    if (!nextProps) {
      return true;
    }
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (nextProps[key] !== prevProps[key] && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
function updateHOCHostEl({ vnode, parent }, el) {
  while (parent && parent.subTree === vnode) {
    (vnode = parent.vnode).el = el;
    parent = parent.parent;
  }
}
const isSuspense = (type) => type.__isSuspense;
function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}
const INITIAL_WATCHER_VALUE = {};
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = EMPTY_OBJ) {
  var _a2;
  const instance = getCurrentScope() === ((_a2 = currentInstance) == null ? void 0 : _a2.scope) ? currentInstance : null;
  let getter;
  let forceTrigger = false;
  let isMultiSource = false;
  if (isRef(source)) {
    getter = () => source.value;
    forceTrigger = isShallow(source);
  } else if (isReactive(source)) {
    getter = () => source;
    deep = true;
  } else if (isArray(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
    getter = () => source.map((s) => {
      if (isRef(s)) {
        return s.value;
      } else if (isReactive(s)) {
        return traverse(s);
      } else if (isFunction(s)) {
        return callWithErrorHandling(s, instance, 2);
      } else
        ;
    });
  } else if (isFunction(source)) {
    if (cb) {
      getter = () => callWithErrorHandling(source, instance, 2);
    } else {
      getter = () => {
        if (instance && instance.isUnmounted) {
          return;
        }
        if (cleanup) {
          cleanup();
        }
        return callWithAsyncErrorHandling(
          source,
          instance,
          3,
          [onCleanup]
        );
      };
    }
  } else {
    getter = NOOP;
  }
  if (cb && deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter());
  }
  let cleanup;
  let onCleanup = (fn) => {
    cleanup = effect.onStop = () => {
      callWithErrorHandling(fn, instance, 4);
    };
  };
  let ssrCleanup;
  if (isInSSRComponentSetup) {
    onCleanup = NOOP;
    if (!cb) {
      getter();
    } else if (immediate) {
      callWithAsyncErrorHandling(cb, instance, 3, [
        getter(),
        isMultiSource ? [] : void 0,
        onCleanup
      ]);
    }
    if (flush === "sync") {
      const ctx = useSSRContext();
      ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
    } else {
      return NOOP;
    }
  }
  let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
  const job = () => {
    if (!effect.active) {
      return;
    }
    if (cb) {
      const newValue = effect.run();
      if (deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue)) || false) {
        if (cleanup) {
          cleanup();
        }
        callWithAsyncErrorHandling(cb, instance, 3, [
          newValue,
          oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
          onCleanup
        ]);
        oldValue = newValue;
      }
    } else {
      effect.run();
    }
  };
  job.allowRecurse = !!cb;
  let scheduler;
  if (flush === "sync") {
    scheduler = job;
  } else if (flush === "post") {
    scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
  } else {
    job.pre = true;
    if (instance)
      job.id = instance.uid;
    scheduler = () => queueJob(job);
  }
  const effect = new ReactiveEffect(getter, scheduler);
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect.run();
    }
  } else if (flush === "post") {
    queuePostRenderEffect(
      effect.run.bind(effect),
      instance && instance.suspense
    );
  } else {
    effect.run();
  }
  const unwatch = () => {
    effect.stop();
    if (instance && instance.scope) {
      remove(instance.scope.effects, effect);
    }
  };
  if (ssrCleanup)
    ssrCleanup.push(unwatch);
  return unwatch;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const cur = currentInstance;
  setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  if (cur) {
    setCurrentInstance(cur);
  } else {
    unsetCurrentInstance();
  }
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]];
    }
    return cur;
  };
}
function traverse(value, seen2) {
  if (!isObject$1(value) || value["__v_skip"]) {
    return value;
  }
  seen2 = seen2 || /* @__PURE__ */ new Set();
  if (seen2.has(value)) {
    return value;
  }
  seen2.add(value);
  if (isRef(value)) {
    traverse(value.value, seen2);
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen2);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v) => {
      traverse(v, seen2);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], seen2);
    }
  }
  return value;
}
function withDirectives(vnode, directives) {
  const internalInstance = currentRenderingInstance;
  if (internalInstance === null) {
    return vnode;
  }
  const instance = getExposeProxy(internalInstance) || internalInstance.proxy;
  const bindings = vnode.dirs || (vnode.dirs = []);
  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
    if (dir) {
      if (isFunction(dir)) {
        dir = {
          mounted: dir,
          updated: dir
        };
      }
      if (dir.deep) {
        traverse(value);
      }
      bindings.push({
        dir,
        instance,
        value,
        oldValue: void 0,
        arg,
        modifiers
      });
    }
  }
  return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value;
    }
    let hook = binding.dir[name];
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}
const leaveCbKey = Symbol("_leaveCb");
const enterCbKey$1 = Symbol("_enterCb");
function useTransitionState() {
  const state = {
    isMounted: false,
    isLeaving: false,
    isUnmounting: false,
    leavingVNodes: /* @__PURE__ */ new Map()
  };
  onMounted(() => {
    state.isMounted = true;
  });
  onBeforeUnmount(() => {
    state.isUnmounting = true;
  });
  return state;
}
const TransitionHookValidator = [Function, Array];
const BaseTransitionPropsValidators = {
  mode: String,
  appear: Boolean,
  persisted: Boolean,
  onBeforeEnter: TransitionHookValidator,
  onEnter: TransitionHookValidator,
  onAfterEnter: TransitionHookValidator,
  onEnterCancelled: TransitionHookValidator,
  onBeforeLeave: TransitionHookValidator,
  onLeave: TransitionHookValidator,
  onAfterLeave: TransitionHookValidator,
  onLeaveCancelled: TransitionHookValidator,
  onBeforeAppear: TransitionHookValidator,
  onAppear: TransitionHookValidator,
  onAfterAppear: TransitionHookValidator,
  onAppearCancelled: TransitionHookValidator
};
function getLeavingNodesForType(state, vnode) {
  const { leavingVNodes } = state;
  let leavingVNodesCache = leavingVNodes.get(vnode.type);
  if (!leavingVNodesCache) {
    leavingVNodesCache = /* @__PURE__ */ Object.create(null);
    leavingVNodes.set(vnode.type, leavingVNodesCache);
  }
  return leavingVNodesCache;
}
function resolveTransitionHooks(vnode, props, state, instance) {
  const {
    appear,
    mode,
    persisted = false,
    onBeforeEnter,
    onEnter,
    onAfterEnter,
    onEnterCancelled,
    onBeforeLeave,
    onLeave,
    onAfterLeave,
    onLeaveCancelled,
    onBeforeAppear,
    onAppear,
    onAfterAppear,
    onAppearCancelled
  } = props;
  const key = String(vnode.key);
  const leavingVNodesCache = getLeavingNodesForType(state, vnode);
  const callHook2 = (hook, args) => {
    hook && callWithAsyncErrorHandling(
      hook,
      instance,
      9,
      args
    );
  };
  const callAsyncHook = (hook, args) => {
    const done = args[1];
    callHook2(hook, args);
    if (isArray(hook)) {
      if (hook.every((hook2) => hook2.length <= 1))
        done();
    } else if (hook.length <= 1) {
      done();
    }
  };
  const hooks = {
    mode,
    persisted,
    beforeEnter(el) {
      let hook = onBeforeEnter;
      if (!state.isMounted) {
        if (appear) {
          hook = onBeforeAppear || onBeforeEnter;
        } else {
          return;
        }
      }
      if (el[leaveCbKey]) {
        el[leaveCbKey](
          true
        );
      }
      const leavingVNode = leavingVNodesCache[key];
      if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el[leaveCbKey]) {
        leavingVNode.el[leaveCbKey]();
      }
      callHook2(hook, [el]);
    },
    enter(el) {
      let hook = onEnter;
      let afterHook = onAfterEnter;
      let cancelHook = onEnterCancelled;
      if (!state.isMounted) {
        if (appear) {
          hook = onAppear || onEnter;
          afterHook = onAfterAppear || onAfterEnter;
          cancelHook = onAppearCancelled || onEnterCancelled;
        } else {
          return;
        }
      }
      let called = false;
      const done = el[enterCbKey$1] = (cancelled) => {
        if (called)
          return;
        called = true;
        if (cancelled) {
          callHook2(cancelHook, [el]);
        } else {
          callHook2(afterHook, [el]);
        }
        if (hooks.delayedLeave) {
          hooks.delayedLeave();
        }
        el[enterCbKey$1] = void 0;
      };
      if (hook) {
        callAsyncHook(hook, [el, done]);
      } else {
        done();
      }
    },
    leave(el, remove2) {
      const key2 = String(vnode.key);
      if (el[enterCbKey$1]) {
        el[enterCbKey$1](
          true
        );
      }
      if (state.isUnmounting) {
        return remove2();
      }
      callHook2(onBeforeLeave, [el]);
      let called = false;
      const done = el[leaveCbKey] = (cancelled) => {
        if (called)
          return;
        called = true;
        remove2();
        if (cancelled) {
          callHook2(onLeaveCancelled, [el]);
        } else {
          callHook2(onAfterLeave, [el]);
        }
        el[leaveCbKey] = void 0;
        if (leavingVNodesCache[key2] === vnode) {
          delete leavingVNodesCache[key2];
        }
      };
      leavingVNodesCache[key2] = vnode;
      if (onLeave) {
        callAsyncHook(onLeave, [el, done]);
      } else {
        done();
      }
    },
    clone(vnode2) {
      return resolveTransitionHooks(vnode2, props, state, instance);
    }
  };
  return hooks;
}
function setTransitionHooks(vnode, hooks) {
  if (vnode.shapeFlag & 6 && vnode.component) {
    setTransitionHooks(vnode.component.subTree, hooks);
  } else if (vnode.shapeFlag & 128) {
    vnode.ssContent.transition = hooks.clone(vnode.ssContent);
    vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
  } else {
    vnode.transition = hooks;
  }
}
function getTransitionRawChildren(children, keepComment = false, parentKey) {
  let ret = [];
  let keyedFragmentCount = 0;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i);
    if (child.type === Fragment) {
      if (child.patchFlag & 128)
        keyedFragmentCount++;
      ret = ret.concat(
        getTransitionRawChildren(child.children, keepComment, key)
      );
    } else if (keepComment || child.type !== Comment) {
      ret.push(key != null ? cloneVNode(child, { key }) : child);
    }
  }
  if (keyedFragmentCount > 1) {
    for (let i = 0; i < ret.length; i++) {
      ret[i].patchFlag = -2;
    }
  }
  return ret;
}
/*! #__NO_SIDE_EFFECTS__ */
function defineComponent(options, extraOptions) {
  return isFunction(options) ? /* @__PURE__ */ (() => extend({ name: options.name }, extraOptions, { setup: options }))() : options;
}
const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
/*! #__NO_SIDE_EFFECTS__ */
function defineAsyncComponent(source) {
  if (isFunction(source)) {
    source = { loader: source };
  }
  const {
    loader,
    loadingComponent,
    errorComponent,
    delay = 200,
    timeout,
    suspensible = true,
    onError: userOnError
  } = source;
  let pendingRequest = null;
  let resolvedComp;
  let retries = 0;
  const retry = () => {
    retries++;
    pendingRequest = null;
    return load();
  };
  const load = () => {
    let thisRequest;
    return pendingRequest || (thisRequest = pendingRequest = loader().catch((err) => {
      err = err instanceof Error ? err : new Error(String(err));
      if (userOnError) {
        return new Promise((resolve, reject) => {
          const userRetry = () => resolve(retry());
          const userFail = () => reject(err);
          userOnError(err, userRetry, userFail, retries + 1);
        });
      } else {
        throw err;
      }
    }).then((comp) => {
      if (thisRequest !== pendingRequest && pendingRequest) {
        return pendingRequest;
      }
      if (comp && (comp.__esModule || comp[Symbol.toStringTag] === "Module")) {
        comp = comp.default;
      }
      resolvedComp = comp;
      return comp;
    }));
  };
  return defineComponent({
    name: "AsyncComponentWrapper",
    __asyncLoader: load,
    get __asyncResolved() {
      return resolvedComp;
    },
    setup() {
      const instance = currentInstance;
      if (resolvedComp) {
        return () => createInnerComp(resolvedComp, instance);
      }
      const onError = (err) => {
        pendingRequest = null;
        handleError(
          err,
          instance,
          13,
          !errorComponent
        );
      };
      if (suspensible && instance.suspense || isInSSRComponentSetup) {
        return load().then((comp) => {
          return () => createInnerComp(comp, instance);
        }).catch((err) => {
          onError(err);
          return () => errorComponent ? createVNode(errorComponent, {
            error: err
          }) : null;
        });
      }
      const loaded = ref(false);
      const error2 = ref();
      const delayed = ref(!!delay);
      if (delay) {
        setTimeout(() => {
          delayed.value = false;
        }, delay);
      }
      if (timeout != null) {
        setTimeout(() => {
          if (!loaded.value && !error2.value) {
            const err = new Error(
              `Async component timed out after ${timeout}ms.`
            );
            onError(err);
            error2.value = err;
          }
        }, timeout);
      }
      load().then(() => {
        loaded.value = true;
        if (instance.parent && isKeepAlive(instance.parent.vnode)) {
          queueJob(instance.parent.update);
        }
      }).catch((err) => {
        onError(err);
        error2.value = err;
      });
      return () => {
        if (loaded.value && resolvedComp) {
          return createInnerComp(resolvedComp, instance);
        } else if (error2.value && errorComponent) {
          return createVNode(errorComponent, {
            error: error2.value
          });
        } else if (loadingComponent && !delayed.value) {
          return createVNode(loadingComponent);
        }
      };
    }
  });
}
function createInnerComp(comp, parent) {
  const { ref: ref2, props, children, ce } = parent.vnode;
  const vnode = createVNode(comp, props, children);
  vnode.ref = ref2;
  vnode.ce = ce;
  delete parent.vnode.ce;
  return vnode;
}
const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
const KeepAliveImpl = {
  name: `KeepAlive`,
  __isKeepAlive: true,
  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array],
    max: [String, Number]
  },
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const sharedContext = instance.ctx;
    if (!sharedContext.renderer) {
      return () => {
        const children = slots.default && slots.default();
        return children && children.length === 1 ? children[0] : children;
      };
    }
    const cache = /* @__PURE__ */ new Map();
    const keys = /* @__PURE__ */ new Set();
    let current = null;
    const parentSuspense = instance.suspense;
    const {
      renderer: {
        p: patch,
        m: move,
        um: _unmount,
        o: { createElement }
      }
    } = sharedContext;
    const storageContainer = createElement("div");
    sharedContext.activate = (vnode, container, anchor, isSVG, optimized) => {
      const instance2 = vnode.component;
      move(vnode, container, anchor, 0, parentSuspense);
      patch(
        instance2.vnode,
        vnode,
        container,
        anchor,
        instance2,
        parentSuspense,
        isSVG,
        vnode.slotScopeIds,
        optimized
      );
      queuePostRenderEffect(() => {
        instance2.isDeactivated = false;
        if (instance2.a) {
          invokeArrayFns(instance2.a);
        }
        const vnodeHook = vnode.props && vnode.props.onVnodeMounted;
        if (vnodeHook) {
          invokeVNodeHook(vnodeHook, instance2.parent, vnode);
        }
      }, parentSuspense);
    };
    sharedContext.deactivate = (vnode) => {
      const instance2 = vnode.component;
      move(vnode, storageContainer, null, 1, parentSuspense);
      queuePostRenderEffect(() => {
        if (instance2.da) {
          invokeArrayFns(instance2.da);
        }
        const vnodeHook = vnode.props && vnode.props.onVnodeUnmounted;
        if (vnodeHook) {
          invokeVNodeHook(vnodeHook, instance2.parent, vnode);
        }
        instance2.isDeactivated = true;
      }, parentSuspense);
    };
    function unmount(vnode) {
      resetShapeFlag(vnode);
      _unmount(vnode, instance, parentSuspense, true);
    }
    function pruneCache(filter) {
      cache.forEach((vnode, key) => {
        const name = getComponentName(vnode.type);
        if (name && (!filter || !filter(name))) {
          pruneCacheEntry(key);
        }
      });
    }
    function pruneCacheEntry(key) {
      const cached = cache.get(key);
      if (!current || !isSameVNodeType(cached, current)) {
        unmount(cached);
      } else if (current) {
        resetShapeFlag(current);
      }
      cache.delete(key);
      keys.delete(key);
    }
    watch(
      () => [props.include, props.exclude],
      ([include, exclude]) => {
        include && pruneCache((name) => matches(include, name));
        exclude && pruneCache((name) => !matches(exclude, name));
      },
      { flush: "post", deep: true }
    );
    let pendingCacheKey = null;
    const cacheSubtree = () => {
      if (pendingCacheKey != null) {
        cache.set(pendingCacheKey, getInnerChild(instance.subTree));
      }
    };
    onMounted(cacheSubtree);
    onUpdated(cacheSubtree);
    onBeforeUnmount(() => {
      cache.forEach((cached) => {
        const { subTree, suspense } = instance;
        const vnode = getInnerChild(subTree);
        if (cached.type === vnode.type && cached.key === vnode.key) {
          resetShapeFlag(vnode);
          const da = vnode.component.da;
          da && queuePostRenderEffect(da, suspense);
          return;
        }
        unmount(cached);
      });
    });
    return () => {
      pendingCacheKey = null;
      if (!slots.default) {
        return null;
      }
      const children = slots.default();
      const rawVNode = children[0];
      if (children.length > 1) {
        current = null;
        return children;
      } else if (!isVNode(rawVNode) || !(rawVNode.shapeFlag & 4) && !(rawVNode.shapeFlag & 128)) {
        current = null;
        return rawVNode;
      }
      let vnode = getInnerChild(rawVNode);
      const comp = vnode.type;
      const name = getComponentName(
        isAsyncWrapper(vnode) ? vnode.type.__asyncResolved || {} : comp
      );
      const { include, exclude, max } = props;
      if (include && (!name || !matches(include, name)) || exclude && name && matches(exclude, name)) {
        current = vnode;
        return rawVNode;
      }
      const key = vnode.key == null ? comp : vnode.key;
      const cachedVNode = cache.get(key);
      if (vnode.el) {
        vnode = cloneVNode(vnode);
        if (rawVNode.shapeFlag & 128) {
          rawVNode.ssContent = vnode;
        }
      }
      pendingCacheKey = key;
      if (cachedVNode) {
        vnode.el = cachedVNode.el;
        vnode.component = cachedVNode.component;
        if (vnode.transition) {
          setTransitionHooks(vnode, vnode.transition);
        }
        vnode.shapeFlag |= 512;
        keys.delete(key);
        keys.add(key);
      } else {
        keys.add(key);
        if (max && keys.size > parseInt(max, 10)) {
          pruneCacheEntry(keys.values().next().value);
        }
      }
      vnode.shapeFlag |= 256;
      current = vnode;
      return isSuspense(rawVNode.type) ? rawVNode : vnode;
    };
  }
};
const KeepAlive = KeepAliveImpl;
function matches(pattern, name) {
  if (isArray(pattern)) {
    return pattern.some((p2) => matches(p2, name));
  } else if (isString(pattern)) {
    return pattern.split(",").includes(name);
  } else if (isRegExp(pattern)) {
    return pattern.test(name);
  }
  return false;
}
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(
    type,
    hook,
    keepAliveRoot,
    true
  );
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
function resetShapeFlag(vnode) {
  vnode.shapeFlag &= ~256;
  vnode.shapeFlag &= ~512;
}
function getInnerChild(vnode) {
  return vnode.shapeFlag & 128 ? vnode.ssContent : vnode;
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      if (target.isUnmounted) {
        return;
      }
      pauseTracking();
      setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      unsetCurrentInstance();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => (!isInSSRComponentSetup || lifecycle === "sp") && injectHook(lifecycle, (...args) => hook(...args), target);
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook("bu");
const onUpdated = createHook("u");
const onBeforeUnmount = createHook("bum");
const onUnmounted = createHook("um");
const onServerPrefetch = createHook("sp");
const onRenderTriggered = createHook(
  "rtg"
);
const onRenderTracked = createHook(
  "rtc"
);
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
const NULL_DYNAMIC_COMPONENT = Symbol.for("v-ndc");
function renderList(source, renderItem, cache, index) {
  let ret;
  const cached = cache && cache[index];
  if (isArray(source) || isString(source)) {
    ret = new Array(source.length);
    for (let i = 0, l = source.length; i < l; i++) {
      ret[i] = renderItem(source[i], i, void 0, cached && cached[i]);
    }
  } else if (typeof source === "number") {
    ret = new Array(source);
    for (let i = 0; i < source; i++) {
      ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
    }
  } else if (isObject$1(source)) {
    if (source[Symbol.iterator]) {
      ret = Array.from(
        source,
        (item, i) => renderItem(item, i, void 0, cached && cached[i])
      );
    } else {
      const keys = Object.keys(source);
      ret = new Array(keys.length);
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        ret[i] = renderItem(source[key], key, i, cached && cached[i]);
      }
    }
  } else {
    ret = [];
  }
  if (cache) {
    cache[index] = ret;
  }
  return ret;
}
function renderSlot(slots, name, props = {}, fallback, noSlotted) {
  if (currentRenderingInstance.isCE || currentRenderingInstance.parent && isAsyncWrapper(currentRenderingInstance.parent) && currentRenderingInstance.parent.isCE) {
    if (name !== "default")
      props.name = name;
    return createVNode("slot", props, fallback && fallback());
  }
  let slot = slots[name];
  if (slot && slot._c) {
    slot._d = false;
  }
  openBlock();
  const validSlotContent = slot && ensureValidVNode(slot(props));
  const rendered = createBlock(
    Fragment,
    {
      key: props.key || validSlotContent && validSlotContent.key || `_${name}`
    },
    validSlotContent || (fallback ? fallback() : []),
    validSlotContent && slots._ === 1 ? 64 : -2
  );
  if (!noSlotted && rendered.scopeId) {
    rendered.slotScopeIds = [rendered.scopeId + "-s"];
  }
  if (slot && slot._c) {
    slot._d = true;
  }
  return rendered;
}
function ensureValidVNode(vnodes) {
  return vnodes.some((child) => {
    if (!isVNode(child))
      return true;
    if (child.type === Comment)
      return false;
    if (child.type === Fragment && !ensureValidVNode(child.children))
      return false;
    return true;
  }) ? vnodes : null;
}
const getPublicInstance = (i) => {
  if (!i)
    return null;
  if (isStatefulComponent(i))
    return getExposeProxy(i) || i.proxy;
  return getPublicInstance(i.parent);
};
const publicPropertiesMap = /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
  $: (i) => i,
  $el: (i) => i.vnode.el,
  $data: (i) => i.data,
  $props: (i) => i.props,
  $attrs: (i) => i.attrs,
  $slots: (i) => i.slots,
  $refs: (i) => i.refs,
  $parent: (i) => getPublicInstance(i.parent),
  $root: (i) => getPublicInstance(i.root),
  $emit: (i) => i.emit,
  $options: (i) => resolveMergedOptions(i),
  $forceUpdate: (i) => i.f || (i.f = () => queueJob(i.update)),
  $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
  $watch: (i) => instanceWatch.bind(i)
});
const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    let normalizedProps;
    if (key[0] !== "$") {
      const n = accessCache[key];
      if (n !== void 0) {
        switch (n) {
          case 1:
            return setupState[key];
          case 2:
            return data[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if ((normalizedProps = instance.propsOptions[0]) && hasOwn(normalizedProps, key)) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance, "get", key);
      }
      return publicGetter(instance);
    } else if ((cssModule = type.__cssModules) && (cssModule = cssModule[key])) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)) {
      {
        return globalProperties[key];
      }
    } else
      ;
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      return false;
    } else {
      {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({
    _: { data, setupState, accessCache, ctx, appContext, propsOptions }
  }, key) {
    let normalizedProps;
    return !!accessCache[key] || data !== EMPTY_OBJ && hasOwn(data, key) || hasSetupBinding(setupState, key) || (normalizedProps = propsOptions[0]) && hasOwn(normalizedProps, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
function normalizePropsOrEmits(props) {
  return isArray(props) ? props.reduce(
    (normalized, p2) => (normalized[p2] = null, normalized),
    {}
  ) : props;
}
let shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook$1(options.beforeCreate, instance, "bc");
  }
  const {
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    expose,
    inheritAttrs,
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction(methodHandler)) {
        {
          ctx[key] = methodHandler.bind(publicThis);
        }
      }
    }
  }
  if (dataOptions) {
    const data = dataOptions.call(publicThis, publicThis);
    if (!isObject$1(data))
      ;
    else {
      instance.data = reactive(data);
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get3 = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      const set2 = !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : NOOP;
      const c = computed({
        get: get3,
        set: set2
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c.value,
        set: (v) => c.value = v
      });
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook$1(created, instance, "c");
  }
  function registerLifecycleHook(register2, hook) {
    if (isArray(hook)) {
      hook.forEach((_hook) => register2(_hook.bind(publicThis)));
    } else if (hook) {
      register2(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render && instance.render === NOOP) {
    instance.render = render;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components)
    instance.components = components;
  if (directives)
    instance.directives = directives;
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
  if (isArray(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject$1(opt)) {
      if ("default" in opt) {
        injected = inject(
          opt.from || key,
          opt.default,
          true
        );
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (isRef(injected)) {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => injected.value,
        set: (v) => injected.value = v
      });
    } else {
      ctx[key] = injected;
    }
  }
}
function callHook$1(hook, instance, type) {
  callWithAsyncErrorHandling(
    isArray(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy),
    instance,
    type
  );
}
function createWatcher(raw, ctx, publicThis, key) {
  const getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString(raw)) {
    const handler = ctx[raw];
    if (isFunction(handler)) {
      watch(getter, handler);
    }
  } else if (isFunction(raw)) {
    watch(getter, raw.bind(publicThis));
  } else if (isObject$1(raw)) {
    if (isArray(raw)) {
      raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
    } else {
      const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction(handler)) {
        watch(getter, handler, raw);
      }
    }
  } else
    ;
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const {
    mixins: globalMixins,
    optionsCache: cache,
    config: { optionMergeStrategies }
  } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach(
        (m) => mergeOptions(resolved, m, optionMergeStrategies, true)
      );
    }
    mergeOptions(resolved, base, optionMergeStrategies);
  }
  if (isObject$1(base)) {
    cache.set(base, resolved);
  }
  return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach(
      (m) => mergeOptions(to, m, strats, true)
    );
  }
  for (const key in from) {
    if (asMixin && key === "expose")
      ;
    else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  watch: mergeWatchOptions,
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return function mergedDataFn() {
    return extend(
      isFunction(to) ? to.call(this, this) : to,
      isFunction(from) ? from.call(this, this) : from
    );
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i];
    }
    return res;
  }
  return raw;
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
  if (to) {
    if (isArray(to) && isArray(from)) {
      return [.../* @__PURE__ */ new Set([...to, ...from])];
    }
    return extend(
      /* @__PURE__ */ Object.create(null),
      normalizePropsOrEmits(to),
      normalizePropsOrEmits(from != null ? from : {})
    );
  } else {
    return from;
  }
}
function mergeWatchOptions(to, from) {
  if (!to)
    return from;
  if (!from)
    return to;
  const merged = extend(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray(to[key], from[key]);
  }
  return merged;
}
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid$1 = 0;
function createAppAPI(render, hydrate) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) {
      rootComponent = extend({}, rootComponent);
    }
    if (rootProps != null && !isObject$1(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new WeakSet();
    let isMounted = false;
    const app = context.app = {
      _uid: uid$1++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config;
      },
      set config(v) {
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin))
          ;
        else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app, ...options);
        } else if (isFunction(plugin)) {
          installedPlugins.add(plugin);
          plugin(app, ...options);
        } else
          ;
        return app;
      },
      mixin(mixin) {
        {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin);
          }
        }
        return app;
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app;
      },
      mount(rootContainer, isHydrate, isSVG) {
        if (!isMounted) {
          const vnode = createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (isHydrate && hydrate) {
            hydrate(vnode, rootContainer);
          } else {
            render(vnode, rootContainer, isSVG);
          }
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app__ = app;
          return getExposeProxy(vnode.component) || vnode.component.proxy;
        }
      },
      unmount() {
        if (isMounted) {
          render(null, app._container);
          delete app._container.__vue_app__;
        }
      },
      provide(key, value) {
        context.provides[key] = value;
        return app;
      },
      runWithContext(fn) {
        currentApp = app;
        try {
          return fn();
        } finally {
          currentApp = null;
        }
      }
    };
    return app;
  };
}
let currentApp = null;
function provide(key, value) {
  if (!currentInstance)
    ;
  else {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = currentInstance || currentRenderingInstance;
  if (instance || currentApp) {
    const provides = instance ? instance.parent == null ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : currentApp._context.provides;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    } else
      ;
  }
}
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = {};
  def(attrs, InternalObjectKey, 1);
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  if (isStateful) {
    instance.props = isSSR ? props : shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const {
    props,
    attrs,
    vnode: { patchFlag }
  } = instance;
  const rawCurrentProps = toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if ((optimized || patchFlag > 0) && !(patchFlag & 16)) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(
              options,
              rawCurrentProps,
              camelizedKey,
              value,
              instance,
              false
            );
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || !hasOwn(rawProps, key) && ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && (rawPrevProps[key] !== void 0 || rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(
              options,
              rawCurrentProps,
              key,
              void 0,
              instance,
              true
            );
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance, "set", "$attrs");
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue(
        options,
        rawCurrentProps,
        key,
        castValues[key],
        instance,
        !hasOwn(castValues, key)
      );
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(
            null,
            props
          );
          unsetCurrentInstance();
        }
      } else {
        value = defaultValue;
      }
    }
    if (opt[0]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[1] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend(normalized, props);
      if (keys)
        needCastKeys.push(...keys);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$1(comp)) {
      cache.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray(raw)) {
    for (let i = 0; i < raw.length; i++) {
      const normalizedKey = camelize(raw[i]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
        if (prop) {
          const booleanIndex = getTypeIndex(Boolean, prop.type);
          const stringIndex = getTypeIndex(String, prop.type);
          prop[0] = booleanIndex > -1;
          prop[1] = stringIndex < 0 || booleanIndex < stringIndex;
          if (booleanIndex > -1 || hasOwn(prop, "default")) {
            needCastKeys.push(normalizedKey);
          }
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject$1(comp)) {
    cache.set(comp, res);
  }
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$") {
    return true;
  }
  return false;
}
function getType(ctor) {
  const match = ctor && ctor.toString().match(/^\s*(function|class) (\w+)/);
  return match ? match[2] : ctor === null ? "null" : "";
}
function isSameType(a, b) {
  return getType(a) === getType(b);
}
function getTypeIndex(type, expectedTypes) {
  if (isArray(expectedTypes)) {
    return expectedTypes.findIndex((t) => isSameType(t, type));
  } else if (isFunction(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1;
  }
  return -1;
}
const isInternalKey = (key) => key[0] === "_" || key === "$stable";
const normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
const normalizeSlot = (key, rawSlot, ctx) => {
  if (rawSlot._n) {
    return rawSlot;
  }
  const normalized = withCtx((...args) => {
    if (false)
      ;
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key))
      continue;
    const value = rawSlots[key];
    if (isFunction(value)) {
      slots[key] = normalizeSlot(key, value, ctx);
    } else if (value != null) {
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
const normalizeVNodeSlots = (instance, children) => {
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
const initSlots = (instance, children) => {
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      instance.slots = toRaw(children);
      def(children, "_", type);
    } else {
      normalizeObjectSlots(
        children,
        instance.slots = {}
      );
    }
  } else {
    instance.slots = {};
    if (children) {
      normalizeVNodeSlots(instance, children);
    }
  }
  def(instance.slots, InternalObjectKey, 1);
};
const updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      if (optimized && type === 1) {
        needDeletionCheck = false;
      } else {
        extend(slots, children);
        if (!optimized && type === 1) {
          delete slots._;
        }
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && deletionComparisonTarget[key] == null) {
        delete slots[key];
      }
    }
  }
};
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray(rawRef)) {
    rawRef.forEach(
      (r, i) => setRef(
        r,
        oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef),
        parentSuspense,
        vnode,
        isUnmount
      )
    );
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getExposeProxy(vnode.component) || vnode.component.proxy : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref2 } = rawRef;
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  if (oldRef != null && oldRef !== ref2) {
    if (isString(oldRef)) {
      refs[oldRef] = null;
      if (hasOwn(setupState, oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (isRef(oldRef)) {
      oldRef.value = null;
    }
  }
  if (isFunction(ref2)) {
    callWithErrorHandling(ref2, owner, 12, [value, refs]);
  } else {
    const _isString = isString(ref2);
    const _isRef = isRef(ref2);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? hasOwn(setupState, ref2) ? setupState[ref2] : refs[ref2] : ref2.value;
          if (isUnmount) {
            isArray(existing) && remove(existing, refValue);
          } else {
            if (!isArray(existing)) {
              if (_isString) {
                refs[ref2] = [refValue];
                if (hasOwn(setupState, ref2)) {
                  setupState[ref2] = refs[ref2];
                }
              } else {
                ref2.value = [refValue];
                if (rawRef.k)
                  refs[rawRef.k] = ref2.value;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref2] = value;
          if (hasOwn(setupState, ref2)) {
            setupState[ref2] = value;
          }
        } else if (_isRef) {
          ref2.value = value;
          if (rawRef.k)
            refs[rawRef.k] = value;
        } else
          ;
      };
      if (value) {
        doSet.id = -1;
        queuePostRenderEffect(doSet, parentSuspense);
      } else {
        doSet();
      }
    }
  }
}
const queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
  const target = getGlobalThis();
  target.__VUE__ = true;
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP,
    insertStaticContent: hostInsertStaticContent
  } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    const { type, ref: ref2, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, isSVG);
        }
        break;
      case Fragment:
        processFragment(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized
        );
        break;
      default:
        if (shapeFlag & 1) {
          processElement(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 6) {
          processComponent(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 64) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized,
            internals
          );
        } else if (shapeFlag & 128) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized,
            internals
          );
        } else
          ;
    }
    if (ref2 != null && parentComponent) {
      setRef(ref2, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateText(n2.children),
        container,
        anchor
      );
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateComment(n2.children || ""),
        container,
        anchor
      );
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, isSVG) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(
      n2.children,
      container,
      anchor,
      isSVG,
      n2.el,
      n2.anchor
    );
  };
  const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next;
    }
    hostInsert(anchor, container, nextSibling);
  };
  const removeStaticNode = ({ el, anchor }) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostRemove(el);
      el = next;
    }
    hostRemove(anchor);
  };
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    isSVG = isSVG || n2.type === "svg";
    if (n1 == null) {
      mountElement(
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized
      );
    } else {
      patchElement(
        n1,
        n2,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized
      );
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { type, props, shapeFlag, transition, dirs } = vnode;
    el = vnode.el = hostCreateElement(
      vnode.type,
      isSVG,
      props && props.is,
      props
    );
    if (shapeFlag & 8) {
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & 16) {
      mountChildren(
        vnode.children,
        el,
        null,
        parentComponent,
        parentSuspense,
        isSVG && type !== "foreignObject",
        slotScopeIds,
        optimized
      );
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "created");
    }
    setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    if (props) {
      for (const key in props) {
        if (key !== "value" && !isReservedProp(key)) {
          hostPatchProp(
            el,
            key,
            null,
            props[key],
            isSVG,
            vnode.children,
            parentComponent,
            parentSuspense,
            unmountChildren
          );
        }
      }
      if ("value" in props) {
        hostPatchProp(el, "value", null, props.value);
      }
      if (vnodeHook = props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = needTransition(parentSuspense, transition);
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        needCallTransitionHooks && transition.enter(el);
        dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
      }, parentSuspense);
    }
  };
  const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) {
      hostSetScopeId(el, scopeId);
    }
    if (slotScopeIds) {
      for (let i = 0; i < slotScopeIds.length; i++) {
        hostSetScopeId(el, slotScopeIds[i]);
      }
    }
    if (parentComponent) {
      let subTree = parentComponent.subTree;
      if (vnode === subTree) {
        const parentVNode = parentComponent.vnode;
        setScopeId(
          el,
          parentVNode,
          parentVNode.scopeId,
          parentVNode.slotScopeIds,
          parentComponent.parent
        );
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, start = 0) => {
    for (let i = start; i < children.length; i++) {
      const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
      patch(
        null,
        child,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized
      );
    }
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    const areChildrenSVG = isSVG && n2.type !== "foreignObject";
    if (dynamicChildren) {
      patchBlockChildren(
        n1.dynamicChildren,
        dynamicChildren,
        el,
        parentComponent,
        parentSuspense,
        areChildrenSVG,
        slotScopeIds
      );
    } else if (!optimized) {
      patchChildren(
        n1,
        n2,
        el,
        null,
        parentComponent,
        parentSuspense,
        areChildrenSVG,
        slotScopeIds,
        false
      );
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(
          el,
          n2,
          oldProps,
          newProps,
          parentComponent,
          parentSuspense,
          isSVG
        );
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, isSVG);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, isSVG);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next = newProps[key];
            if (next !== prev || key === "value") {
              hostPatchProp(
                el,
                key,
                prev,
                next,
                isSVG,
                n1.children,
                parentComponent,
                parentSuspense,
                unmountChildren
              );
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(
        el,
        n2,
        oldProps,
        newProps,
        parentComponent,
        parentSuspense,
        isSVG
      );
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, isSVG, slotScopeIds) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      const container = oldVNode.el && (oldVNode.type === Fragment || !isSameVNodeType(oldVNode, newVNode) || oldVNode.shapeFlag & (6 | 64)) ? hostParentNode(oldVNode.el) : fallbackContainer;
      patch(
        oldVNode,
        newVNode,
        container,
        null,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        true
      );
    }
  };
  const patchProps = (el, vnode, oldProps, newProps, parentComponent, parentSuspense, isSVG) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(
              el,
              key,
              oldProps[key],
              null,
              isSVG,
              vnode.children,
              parentComponent,
              parentSuspense,
              unmountChildren
            );
          }
        }
      }
      for (const key in newProps) {
        if (isReservedProp(key))
          continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(
            el,
            key,
            prev,
            next,
            isSVG,
            vnode.children,
            parentComponent,
            parentSuspense,
            unmountChildren
          );
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value);
      }
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(
        n2.children,
        container,
        fragmentEndAnchor,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized
      );
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && n1.dynamicChildren) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          container,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds
        );
        if (n2.key != null || parentComponent && n2 === parentComponent.subTree) {
          traverseStaticChildren(
            n1,
            n2,
            true
          );
        }
      } else {
        patchChildren(
          n1,
          n2,
          container,
          fragmentEndAnchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized
        );
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(
          n2,
          container,
          anchor,
          isSVG,
          optimized
        );
      } else {
        mountComponent(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          optimized
        );
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
    const instance = initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent,
      parentSuspense
    );
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      setupComponent(instance);
    }
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect);
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
      }
      return;
    }
    setupRenderEffect(
      instance,
      initialVNode,
      container,
      anchor,
      parentSuspense,
      isSVG,
      optimized
    );
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        updateComponentPreRender(instance, n2, optimized);
        return;
      } else {
        instance.next = n2;
        invalidateJob(instance.update);
        instance.update();
      }
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  };
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m, parent } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);
        if (el && hydrateNode) {
          const hydrateSubTree = () => {
            instance.subTree = renderComponentRoot(instance);
            hydrateNode(
              el,
              instance.subTree,
              instance,
              parentSuspense,
              null
            );
          };
          if (isAsyncWrapperVNode) {
            initialVNode.type.__asyncLoader().then(
              () => !instance.isUnmounted && hydrateSubTree()
            );
          } else {
            hydrateSubTree();
          }
        } else {
          const subTree = instance.subTree = renderComponentRoot(instance);
          patch(
            null,
            subTree,
            container,
            anchor,
            instance,
            parentSuspense,
            isSVG
          );
          initialVNode.el = subTree.el;
        }
        if (m) {
          queuePostRenderEffect(m, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode),
            parentSuspense
          );
        }
        if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        initialVNode = container = anchor = null;
      } else {
        let { next, bu, u, parent, vnode } = instance;
        let originNext = next;
        let vnodeHook;
        toggleRecurse(instance, false);
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next, optimized);
        } else {
          next = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent, next, vnode);
        }
        toggleRecurse(instance, true);
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(
          prevTree,
          nextTree,
          hostParentNode(prevTree.el),
          getNextHostNode(prevTree),
          instance,
          parentSuspense,
          isSVG
        );
        next.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u) {
          queuePostRenderEffect(u, parentSuspense);
        }
        if (vnodeHook = next.props && next.props.onVnodeUpdated) {
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, next, vnode),
            parentSuspense
          );
        }
      }
    };
    const effect = instance.effect = new ReactiveEffect(
      componentUpdateFn,
      () => queueJob(update3),
      instance.scope
    );
    const update3 = instance.update = () => effect.run();
    update3.id = instance.uid;
    toggleRecurse(instance, true);
    update3();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs();
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized
        );
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized
        );
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          );
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          );
        }
      }
    }
  };
  const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      patch(
        c1[i],
        nextChild,
        container,
        null,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized
      );
    }
    if (oldLength > newLength) {
      unmountChildren(
        c1,
        parentComponent,
        parentSuspense,
        true,
        false,
        commonLength
      );
    } else {
      mountChildren(
        c2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized,
        commonLength
      );
    }
  };
  const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(
            null,
            c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]),
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          );
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true);
        i++;
      }
    } else {
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++)
        newIndexToOldIndexMap[i] = 0;
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(
            prevChild,
            c2[newIndex],
            container,
            null,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          );
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(
            null,
            nextChild,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          );
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, 2);
          } else {
            j--;
          }
        }
      }
    }
  };
  const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type.move(vnode, container, anchor, internals);
      return;
    }
    if (type === Fragment) {
      hostInsert(el, container, anchor);
      for (let i = 0; i < children.length; i++) {
        move(children[i], container, anchor, moveType);
      }
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition2) {
      if (moveType === 0) {
        transition.beforeEnter(el);
        hostInsert(el, container, anchor);
        queuePostRenderEffect(() => transition.enter(el), parentSuspense);
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove22 = () => hostInsert(el, container, anchor);
        const performLeave = () => {
          leave(el, () => {
            remove22();
            afterLeave && afterLeave();
          });
        };
        if (delayLeave) {
          delayLeave(el, remove22, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const {
      type,
      props,
      ref: ref2,
      children,
      dynamicChildren,
      shapeFlag,
      patchFlag,
      dirs
    } = vnode;
    if (ref2 != null) {
      setRef(ref2, null, parentSuspense, vnode, true);
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(
          vnode,
          parentComponent,
          parentSuspense,
          optimized,
          internals,
          doRemove
        );
      } else if (dynamicChildren && (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(
          dynamicChildren,
          parentComponent,
          parentSuspense,
          false,
          true
        );
      } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove2(vnode);
      }
    }
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
      }, parentSuspense);
    }
  };
  const remove2 = (vnode) => {
    const { type, el, anchor, transition } = vnode;
    if (type === Fragment) {
      {
        removeFragment(el, anchor);
      }
      return;
    }
    if (type === Static) {
      removeStaticNode(vnode);
      return;
    }
    const performRemove = () => {
      hostRemove(el);
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
    };
    if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const performLeave = () => leave(el, performRemove);
      if (delayLeave) {
        delayLeave(vnode.el, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  };
  const removeFragment = (cur, end) => {
    let next;
    while (cur !== end) {
      next = hostNextSibling(cur);
      hostRemove(cur);
      cur = next;
    }
    hostRemove(end);
  };
  const unmountComponent = (instance, parentSuspense, doRemove) => {
    const { bum, scope, update: update3, subTree, um } = instance;
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (update3) {
      update3.active = false;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
    if (parentSuspense && parentSuspense.pendingBranch && !parentSuspense.isUnmounted && instance.asyncDep && !instance.asyncResolved && instance.suspenseId === parentSuspense.pendingId) {
      parentSuspense.deps--;
      if (parentSuspense.deps === 0) {
        parentSuspense.resolve();
      }
    }
  };
  const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
    for (let i = start; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    return hostNextSibling(vnode.anchor || vnode.el);
  };
  const render = (vnode, container, isSVG) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
      }
    } else {
      patch(container._vnode || null, vnode, container, null, null, null, isSVG);
    }
    flushPreFlushCbs();
    flushPostFlushCbs();
    container._vnode = vnode;
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove2,
    mt: mountComponent,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate;
  let hydrateNode;
  if (createHydrationFns) {
    [hydrate, hydrateNode] = createHydrationFns(
      internals
    );
  }
  return {
    render,
    hydrate,
    createApp: createAppAPI(render, hydrate)
  };
}
function toggleRecurse({ effect, update: update3 }, allowed) {
  effect.allowRecurse = update3.allowRecurse = allowed;
}
function needTransition(parentSuspense, transition) {
  return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray(ch1) && isArray(ch2)) {
    for (let i = 0; i < ch1.length; i++) {
      const c1 = ch1[i];
      let c2 = ch2[i];
      if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
        if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
          c2 = ch2[i] = cloneIfMounted(ch2[i]);
          c2.el = c1.el;
        }
        if (!shallow)
          traverseStaticChildren(c1, c2);
      }
      if (c2.type === Text) {
        c2.el = c1.el;
      }
    }
  }
}
function getSequence(arr) {
  const p2 = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p2[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = u + v >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p2[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p2[v];
  }
  return result;
}
const isTeleport = (type) => type.__isTeleport;
const isTeleportDisabled = (props) => props && (props.disabled || props.disabled === "");
const isTargetSVG = (target) => typeof SVGElement !== "undefined" && target instanceof SVGElement;
const resolveTarget = (props, select) => {
  const targetSelector = props && props.to;
  if (isString(targetSelector)) {
    if (!select) {
      return null;
    } else {
      const target = select(targetSelector);
      return target;
    }
  } else {
    return targetSelector;
  }
};
const TeleportImpl = {
  __isTeleport: true,
  process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals) {
    const {
      mc: mountChildren,
      pc: patchChildren,
      pbc: patchBlockChildren,
      o: { insert, querySelector, createText, createComment }
    } = internals;
    const disabled = isTeleportDisabled(n2.props);
    let { shapeFlag, children, dynamicChildren } = n2;
    if (n1 == null) {
      const placeholder = n2.el = createText("");
      const mainAnchor = n2.anchor = createText("");
      insert(placeholder, container, anchor);
      insert(mainAnchor, container, anchor);
      const target = n2.target = resolveTarget(n2.props, querySelector);
      const targetAnchor = n2.targetAnchor = createText("");
      if (target) {
        insert(targetAnchor, target);
        isSVG = isSVG || isTargetSVG(target);
      }
      const mount = (container2, anchor2) => {
        if (shapeFlag & 16) {
          mountChildren(
            children,
            container2,
            anchor2,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          );
        }
      };
      if (disabled) {
        mount(container, mainAnchor);
      } else if (target) {
        mount(target, targetAnchor);
      }
    } else {
      n2.el = n1.el;
      const mainAnchor = n2.anchor = n1.anchor;
      const target = n2.target = n1.target;
      const targetAnchor = n2.targetAnchor = n1.targetAnchor;
      const wasDisabled = isTeleportDisabled(n1.props);
      const currentContainer = wasDisabled ? container : target;
      const currentAnchor = wasDisabled ? mainAnchor : targetAnchor;
      isSVG = isSVG || isTargetSVG(target);
      if (dynamicChildren) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          currentContainer,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds
        );
        traverseStaticChildren(n1, n2, true);
      } else if (!optimized) {
        patchChildren(
          n1,
          n2,
          currentContainer,
          currentAnchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          false
        );
      }
      if (disabled) {
        if (!wasDisabled) {
          moveTeleport(
            n2,
            container,
            mainAnchor,
            internals,
            1
          );
        } else {
          if (n2.props && n1.props && n2.props.to !== n1.props.to) {
            n2.props.to = n1.props.to;
          }
        }
      } else {
        if ((n2.props && n2.props.to) !== (n1.props && n1.props.to)) {
          const nextTarget = n2.target = resolveTarget(
            n2.props,
            querySelector
          );
          if (nextTarget) {
            moveTeleport(
              n2,
              nextTarget,
              null,
              internals,
              0
            );
          }
        } else if (wasDisabled) {
          moveTeleport(
            n2,
            target,
            targetAnchor,
            internals,
            1
          );
        }
      }
    }
    updateCssVars(n2);
  },
  remove(vnode, parentComponent, parentSuspense, optimized, { um: unmount, o: { remove: hostRemove } }, doRemove) {
    const { shapeFlag, children, anchor, targetAnchor, target, props } = vnode;
    if (target) {
      hostRemove(targetAnchor);
    }
    doRemove && hostRemove(anchor);
    if (shapeFlag & 16) {
      const shouldRemove = doRemove || !isTeleportDisabled(props);
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        unmount(
          child,
          parentComponent,
          parentSuspense,
          shouldRemove,
          !!child.dynamicChildren
        );
      }
    }
  },
  move: moveTeleport,
  hydrate: hydrateTeleport
};
function moveTeleport(vnode, container, parentAnchor, { o: { insert }, m: move }, moveType = 2) {
  if (moveType === 0) {
    insert(vnode.targetAnchor, container, parentAnchor);
  }
  const { el, anchor, shapeFlag, children, props } = vnode;
  const isReorder = moveType === 2;
  if (isReorder) {
    insert(el, container, parentAnchor);
  }
  if (!isReorder || isTeleportDisabled(props)) {
    if (shapeFlag & 16) {
      for (let i = 0; i < children.length; i++) {
        move(
          children[i],
          container,
          parentAnchor,
          2
        );
      }
    }
  }
  if (isReorder) {
    insert(anchor, container, parentAnchor);
  }
}
function hydrateTeleport(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, {
  o: { nextSibling, parentNode, querySelector }
}, hydrateChildren) {
  const target = vnode.target = resolveTarget(
    vnode.props,
    querySelector
  );
  if (target) {
    const targetNode = target._lpa || target.firstChild;
    if (vnode.shapeFlag & 16) {
      if (isTeleportDisabled(vnode.props)) {
        vnode.anchor = hydrateChildren(
          nextSibling(node),
          vnode,
          parentNode(node),
          parentComponent,
          parentSuspense,
          slotScopeIds,
          optimized
        );
        vnode.targetAnchor = targetNode;
      } else {
        vnode.anchor = nextSibling(node);
        let targetAnchor = targetNode;
        while (targetAnchor) {
          targetAnchor = nextSibling(targetAnchor);
          if (targetAnchor && targetAnchor.nodeType === 8 && targetAnchor.data === "teleport anchor") {
            vnode.targetAnchor = targetAnchor;
            target._lpa = vnode.targetAnchor && nextSibling(vnode.targetAnchor);
            break;
          }
        }
        hydrateChildren(
          targetNode,
          vnode,
          target,
          parentComponent,
          parentSuspense,
          slotScopeIds,
          optimized
        );
      }
    }
    updateCssVars(vnode);
  }
  return vnode.anchor && nextSibling(vnode.anchor);
}
const Teleport = TeleportImpl;
function updateCssVars(vnode) {
  const ctx = vnode.ctx;
  if (ctx && ctx.ut) {
    let node = vnode.children[0].el;
    while (node && node !== vnode.targetAnchor) {
      if (node.nodeType === 1)
        node.setAttribute("data-v-owner", ctx.uid);
      node = node.nextSibling;
    }
    ctx.ut();
  }
}
const Fragment = Symbol.for("v-fgt");
const Text = Symbol.for("v-txt");
const Comment = Symbol.for("v-cmt");
const Static = Symbol.for("v-stc");
const blockStack = [];
let currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value) {
  isBlockTreeEnabled += value;
}
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
  return setupBlock(
    createBaseVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      shapeFlag,
      true
    )
  );
}
function createBlock(type, props, children, patchFlag, dynamicProps) {
  return setupBlock(
    createVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      true
    )
  );
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
const InternalObjectKey = `__vInternal`;
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({
  ref: ref2,
  ref_key,
  ref_for
}) => {
  if (typeof ref2 === "number") {
    ref2 = "" + ref2;
  }
  return ref2 != null ? isString(ref2) || isRef(ref2) || isFunction(ref2) ? { i: currentRenderingInstance, r: ref2, k: ref_key, f: !!ref_for } : ref2 : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) {
      type.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString(children) ? 8 : 16;
  }
  if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock && (vnode.patchFlag > 0 || shapeFlag & 6) && vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
const createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment;
  }
  if (isVNode(type)) {
    const cloned = cloneVNode(
      type,
      props,
      true
    );
    if (children) {
      normalizeChildren(cloned, children);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
      if (cloned.shapeFlag & 6) {
        currentBlock[currentBlock.indexOf(type)] = cloned;
      } else {
        currentBlock.push(cloned);
      }
    }
    cloned.patchFlag |= -2;
    return cloned;
  }
  if (isClassComponent(type)) {
    type = type.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style } = props;
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass);
    }
    if (isObject$1(style)) {
      if (isProxy(style) && !isArray(style)) {
        style = extend({}, style);
      }
      props.style = normalizeStyle$1(style);
    }
  }
  const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject$1(type) ? 4 : isFunction(type) ? 2 : 0;
  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true
  );
}
function guardReactiveProps(props) {
  if (!props)
    return null;
  return isProxy(props) || InternalObjectKey in props ? extend({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false) {
  const { props, ref: ref2, patchFlag, children } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? mergeRef && ref2 ? isArray(ref2) ? ref2.concat(normalizeRef(extraProps)) : [ref2, normalizeRef(extraProps)] : normalizeRef(extraProps) : ref2,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children,
    target: vnode.target,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition: vnode.transition,
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
    ce: vnode.ce
  };
  return cloned;
}
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text, null, text, flag);
}
function createStaticVNode(content2, numberOfNodes) {
  const vnode = createVNode(Static, null, content2);
  vnode.staticCount = numberOfNodes;
  return vnode;
}
function createCommentVNode(text = "", asBlock = false) {
  return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray(child)) {
    return createVNode(
      Fragment,
      null,
      child.slice()
    );
  } else if (typeof child === "object") {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}
function cloneIfMounted(child) {
  return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray(children)) {
    type = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type = 32;
      const slotFlag = children._;
      if (!slotFlag && !(InternalObjectKey in children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction(children)) {
    children = { default: children, _ctx: currentRenderingInstance };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else {
      type = 8;
    }
  }
  vnode.children = children;
  vnode.shapeFlag |= type;
}
function mergeProps(...args) {
  const ret = {};
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i];
    for (const key in toMerge) {
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle$1([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}
const emptyAppContext = createAppContext();
let uid = 0;
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    next: null,
    subTree: null,
    effect: null,
    update: null,
    scope: new EffectScope(
      true
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    accessCache: null,
    renderCache: [],
    components: null,
    directives: null,
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    emit: null,
    emitted: null,
    propsDefaults: EMPTY_OBJ,
    inheritAttrs: type.inheritAttrs,
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    attrsProxy: null,
    slotsProxy: null,
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  {
    instance.ctx = { _: instance };
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
let internalSetCurrentInstance;
let globalCurrentInstanceSetters;
let settersKey = "__VUE_INSTANCE_SETTERS__";
{
  if (!(globalCurrentInstanceSetters = getGlobalThis()[settersKey])) {
    globalCurrentInstanceSetters = getGlobalThis()[settersKey] = [];
  }
  globalCurrentInstanceSetters.push((i) => currentInstance = i);
  internalSetCurrentInstance = (instance) => {
    if (globalCurrentInstanceSetters.length > 1) {
      globalCurrentInstanceSetters.forEach((s) => s(instance));
    } else {
      globalCurrentInstanceSetters[0](instance);
    }
  };
}
const setCurrentInstance = (instance) => {
  internalSetCurrentInstance(instance);
  instance.scope.on();
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  internalSetCurrentInstance(null);
};
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false) {
  isInSSRComponentSetup = isSSR;
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isInSSRComponentSetup = false;
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = markRaw(new Proxy(instance.ctx, PublicInstanceProxyHandlers));
  const { setup } = Component;
  if (setup) {
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    setCurrentInstance(instance);
    pauseTracking();
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      0,
      [instance.props, setupContext]
    );
    resetTracking();
    unsetCurrentInstance();
    if (isPromise$1(setupResult)) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          handleSetupResult(instance, resolvedResult, isSSR);
        }).catch((e) => {
          handleError(e, instance, 0);
        });
      } else {
        instance.asyncDep = setupResult;
      }
    } else {
      handleSetupResult(instance, setupResult, isSSR);
    }
  } else {
    finishComponentSetup(instance, isSSR);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject$1(setupResult)) {
    instance.setupState = proxyRefs(setupResult);
  } else
    ;
  finishComponentSetup(instance, isSSR);
}
let compile;
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    if (!isSSR && compile && !Component.render) {
      const template = Component.template || resolveMergedOptions(instance).template;
      if (template) {
        const { isCustomElement, compilerOptions } = instance.appContext.config;
        const { delimiters, compilerOptions: componentCompilerOptions } = Component;
        const finalCompilerOptions = extend(
          extend(
            {
              isCustomElement,
              delimiters
            },
            compilerOptions
          ),
          componentCompilerOptions
        );
        Component.render = compile(template, finalCompilerOptions);
      }
    }
    instance.render = Component.render || NOOP;
  }
  {
    setCurrentInstance(instance);
    pauseTracking();
    try {
      applyOptions(instance);
    } finally {
      resetTracking();
      unsetCurrentInstance();
    }
  }
}
function getAttrsProxy(instance) {
  return instance.attrsProxy || (instance.attrsProxy = new Proxy(
    instance.attrs,
    {
      get(target, key) {
        track(instance, "get", "$attrs");
        return target[key];
      }
    }
  ));
}
function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };
  {
    return {
      get attrs() {
        return getAttrsProxy(instance);
      },
      slots: instance.slots,
      emit: instance.emit,
      expose
    };
  }
}
function getExposeProxy(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  }
}
function getComponentName(Component, includeInferred = true) {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function isClassComponent(value) {
  return isFunction(value) && "__vccOpts" in value;
}
const computed = (getterOrOptions, debugOptions) => {
  return computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
};
function h(type, propsOrChildren, children) {
  const l = arguments.length;
  if (l === 2) {
    if (isObject$1(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      }
      return createVNode(type, propsOrChildren);
    } else {
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (l > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    } else if (l === 3 && isVNode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}
const ssrContextKey = Symbol.for("v-scx");
const useSSRContext = () => {
  {
    const ctx = inject(ssrContextKey);
    return ctx;
  }
};
const version = "3.3.7";
const svgNS = "http://www.w3.org/2000/svg";
const doc = typeof document !== "undefined" ? document : null;
const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createElement: (tag, isSVG, is, props) => {
    const el = isSVG ? doc.createElementNS(svgNS, tag) : doc.createElement(tag, is ? { is } : void 0);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  insertStaticContent(content2, parent, anchor, isSVG, start, end) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start && (start === end || start.nextSibling)) {
      while (true) {
        parent.insertBefore(start.cloneNode(true), anchor);
        if (start === end || !(start = start.nextSibling))
          break;
      }
    } else {
      templateContainer.innerHTML = isSVG ? `<svg>${content2}</svg>` : content2;
      const template = templateContainer.content;
      if (isSVG) {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      parent.insertBefore(template, anchor);
    }
    return [
      before ? before.nextSibling : parent.firstChild,
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};
const TRANSITION = "transition";
const ANIMATION = "animation";
const vtcKey = Symbol("_vtc");
const DOMTransitionPropsValidators = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: true
  },
  duration: [String, Number, Object],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String
};
const TransitionPropsValidators = /* @__PURE__ */ extend(
  {},
  BaseTransitionPropsValidators,
  DOMTransitionPropsValidators
);
const callHook = (hook, args = []) => {
  if (isArray(hook)) {
    hook.forEach((h2) => h2(...args));
  } else if (hook) {
    hook(...args);
  }
};
const hasExplicitCallback = (hook) => {
  return hook ? isArray(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
};
function resolveTransitionProps(rawProps) {
  const baseProps2 = {};
  for (const key in rawProps) {
    if (!(key in DOMTransitionPropsValidators)) {
      baseProps2[key] = rawProps[key];
    }
  }
  if (rawProps.css === false) {
    return baseProps2;
  }
  const {
    name = "v",
    type,
    duration,
    enterFromClass = `${name}-enter-from`,
    enterActiveClass = `${name}-enter-active`,
    enterToClass = `${name}-enter-to`,
    appearFromClass = enterFromClass,
    appearActiveClass = enterActiveClass,
    appearToClass = enterToClass,
    leaveFromClass = `${name}-leave-from`,
    leaveActiveClass = `${name}-leave-active`,
    leaveToClass = `${name}-leave-to`
  } = rawProps;
  const durations = normalizeDuration(duration);
  const enterDuration = durations && durations[0];
  const leaveDuration = durations && durations[1];
  const {
    onBeforeEnter,
    onEnter,
    onEnterCancelled,
    onLeave,
    onLeaveCancelled,
    onBeforeAppear = onBeforeEnter,
    onAppear = onEnter,
    onAppearCancelled = onEnterCancelled
  } = baseProps2;
  const finishEnter = (el, isAppear, done) => {
    removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
    removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
    done && done();
  };
  const finishLeave = (el, done) => {
    el._isLeaving = false;
    removeTransitionClass(el, leaveFromClass);
    removeTransitionClass(el, leaveToClass);
    removeTransitionClass(el, leaveActiveClass);
    done && done();
  };
  const makeEnterHook = (isAppear) => {
    return (el, done) => {
      const hook = isAppear ? onAppear : onEnter;
      const resolve = () => finishEnter(el, isAppear, done);
      callHook(hook, [el, resolve]);
      nextFrame(() => {
        removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
        addTransitionClass(el, isAppear ? appearToClass : enterToClass);
        if (!hasExplicitCallback(hook)) {
          whenTransitionEnds(el, type, enterDuration, resolve);
        }
      });
    };
  };
  return extend(baseProps2, {
    onBeforeEnter(el) {
      callHook(onBeforeEnter, [el]);
      addTransitionClass(el, enterFromClass);
      addTransitionClass(el, enterActiveClass);
    },
    onBeforeAppear(el) {
      callHook(onBeforeAppear, [el]);
      addTransitionClass(el, appearFromClass);
      addTransitionClass(el, appearActiveClass);
    },
    onEnter: makeEnterHook(false),
    onAppear: makeEnterHook(true),
    onLeave(el, done) {
      el._isLeaving = true;
      const resolve = () => finishLeave(el, done);
      addTransitionClass(el, leaveFromClass);
      forceReflow();
      addTransitionClass(el, leaveActiveClass);
      nextFrame(() => {
        if (!el._isLeaving) {
          return;
        }
        removeTransitionClass(el, leaveFromClass);
        addTransitionClass(el, leaveToClass);
        if (!hasExplicitCallback(onLeave)) {
          whenTransitionEnds(el, type, leaveDuration, resolve);
        }
      });
      callHook(onLeave, [el, resolve]);
    },
    onEnterCancelled(el) {
      finishEnter(el, false);
      callHook(onEnterCancelled, [el]);
    },
    onAppearCancelled(el) {
      finishEnter(el, true);
      callHook(onAppearCancelled, [el]);
    },
    onLeaveCancelled(el) {
      finishLeave(el);
      callHook(onLeaveCancelled, [el]);
    }
  });
}
function normalizeDuration(duration) {
  if (duration == null) {
    return null;
  } else if (isObject$1(duration)) {
    return [NumberOf(duration.enter), NumberOf(duration.leave)];
  } else {
    const n = NumberOf(duration);
    return [n, n];
  }
}
function NumberOf(val) {
  const res = toNumber(val);
  return res;
}
function addTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.add(c));
  (el[vtcKey] || (el[vtcKey] = /* @__PURE__ */ new Set())).add(cls);
}
function removeTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
  const _vtc = el[vtcKey];
  if (_vtc) {
    _vtc.delete(cls);
    if (!_vtc.size) {
      el[vtcKey] = void 0;
    }
  }
}
function nextFrame(cb) {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
}
let endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve) {
  const id = el._endId = ++endId;
  const resolveIfNotStale = () => {
    if (id === el._endId) {
      resolve();
    }
  };
  if (explicitTimeout) {
    return setTimeout(resolveIfNotStale, explicitTimeout);
  }
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
  if (!type) {
    return resolve();
  }
  const endEvent = type + "end";
  let ended = 0;
  const end = () => {
    el.removeEventListener(endEvent, onEnd);
    resolveIfNotStale();
  };
  const onEnd = (e) => {
    if (e.target === el && ++ended >= propCount) {
      end();
    }
  };
  setTimeout(() => {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(endEvent, onEnd);
}
function getTransitionInfo(el, expectedType) {
  const styles = window.getComputedStyle(el);
  const getStyleProperties = (key) => (styles[key] || "").split(", ");
  const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
  const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
  const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
  const animationTimeout = getTimeout(animationDelays, animationDurations);
  let type = null;
  let timeout = 0;
  let propCount = 0;
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
    propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
  }
  const hasTransform = type === TRANSITION && /\b(transform|all)(,|$)/.test(
    getStyleProperties(`${TRANSITION}Property`).toString()
  );
  return {
    type,
    timeout,
    propCount,
    hasTransform
  };
}
function getTimeout(delays, durations) {
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }
  return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
}
function toMs(s) {
  if (s === "auto")
    return 0;
  return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
}
function forceReflow() {
  return document.body.offsetHeight;
}
function patchClass(el, value, isSVG) {
  const transitionClasses = el[vtcKey];
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}
const vShowOldKey = Symbol("_vod");
function patchStyle(el, prev, next) {
  const style = el.style;
  const isCssString = isString(next);
  if (next && !isCssString) {
    if (prev && !isString(prev)) {
      for (const key in prev) {
        if (next[key] == null) {
          setStyle(style, key, "");
        }
      }
    }
    for (const key in next) {
      setStyle(style, key, next[key]);
    }
  } else {
    const currentDisplay = style.display;
    if (isCssString) {
      if (prev !== next) {
        style.cssText = next;
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
    if (vShowOldKey in el) {
      style.display = currentDisplay;
    }
  }
}
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
  if (isArray(val)) {
    val.forEach((v) => setStyle(style, name, v));
  } else {
    if (val == null)
      val = "";
    if (name.startsWith("--")) {
      style.setProperty(name, val);
    } else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) {
        style.setProperty(
          hyphenate(prefixed),
          val.replace(importantRE, ""),
          "important"
        );
      } else {
        style[prefixed] = val;
      }
    }
  }
}
const prefixes = ["Webkit", "Moz", "ms"];
const prefixCache = {};
function autoPrefix(style, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style) {
    return prefixCache[rawName] = name;
  }
  name = capitalize(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    const isBoolean = isSpecialBooleanAttr(key);
    if (value == null || isBoolean && !includeBooleanAttr(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, isBoolean ? "" : value);
    }
  }
}
function patchDOMProp(el, key, value, prevChildren, parentComponent, parentSuspense, unmountChildren) {
  if (key === "innerHTML" || key === "textContent") {
    if (prevChildren) {
      unmountChildren(prevChildren, parentComponent, parentSuspense);
    }
    el[key] = value == null ? "" : value;
    return;
  }
  const tag = el.tagName;
  if (key === "value" && tag !== "PROGRESS" && !tag.includes("-")) {
    el._value = value;
    const oldValue = tag === "OPTION" ? el.getAttribute("value") : el.value;
    const newValue = value == null ? "" : value;
    if (oldValue !== newValue) {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
  }
  needRemove && el.removeAttribute(key);
}
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
const veiKey = Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el[veiKey] || (el[veiKey] = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(nextValue, instance);
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  if (optionsModifierRE.test(name)) {
    options = {};
    let m;
    while (m = name.match(optionsModifierRE)) {
      name = name.slice(0, name.length - m[0].length);
      options[m[0].toLowerCase()] = true;
    }
  }
  const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
  return [event, options];
}
let cachedNow = 0;
const p = /* @__PURE__ */ Promise.resolve();
const getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
  const invoker = (e) => {
    if (!e._vts) {
      e._vts = Date.now();
    } else if (e._vts <= invoker.attached) {
      return;
    }
    callWithAsyncErrorHandling(
      patchStopImmediatePropagation(e, invoker.value),
      instance,
      5,
      [e]
    );
  };
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}
function patchStopImmediatePropagation(e, value) {
  if (isArray(value)) {
    const originalStop = e.stopImmediatePropagation;
    e.stopImmediatePropagation = () => {
      originalStop.call(e);
      e._stopped = true;
    };
    return value.map((fn) => (e2) => !e2._stopped && fn && fn(e2));
  } else {
    return value;
  }
}
const nativeOnRE = /^on[a-z]/;
const patchProp = (el, key, prevValue, nextValue, isSVG = false, prevChildren, parentComponent, parentSuspense, unmountChildren) => {
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(
      el,
      key,
      nextValue,
      prevChildren,
      parentComponent,
      parentSuspense,
      unmountChildren
    );
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && nativeOnRE.test(key) && isFunction(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (nativeOnRE.test(key) && isString(value)) {
    return false;
  }
  return key in el;
}
const positionMap = /* @__PURE__ */ new WeakMap();
const newPositionMap = /* @__PURE__ */ new WeakMap();
const moveCbKey = Symbol("_moveCb");
const enterCbKey = Symbol("_enterCb");
const TransitionGroupImpl = {
  name: "TransitionGroup",
  props: /* @__PURE__ */ extend({}, TransitionPropsValidators, {
    tag: String,
    moveClass: String
  }),
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    let prevChildren;
    let children;
    onUpdated(() => {
      if (!prevChildren.length) {
        return;
      }
      const moveClass = props.moveClass || `${props.name || "v"}-move`;
      if (!hasCSSTransform(
        prevChildren[0].el,
        instance.vnode.el,
        moveClass
      )) {
        return;
      }
      prevChildren.forEach(callPendingCbs);
      prevChildren.forEach(recordPosition);
      const movedChildren = prevChildren.filter(applyTranslation);
      forceReflow();
      movedChildren.forEach((c) => {
        const el = c.el;
        const style = el.style;
        addTransitionClass(el, moveClass);
        style.transform = style.webkitTransform = style.transitionDuration = "";
        const cb = el[moveCbKey] = (e) => {
          if (e && e.target !== el) {
            return;
          }
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener("transitionend", cb);
            el[moveCbKey] = null;
            removeTransitionClass(el, moveClass);
          }
        };
        el.addEventListener("transitionend", cb);
      });
    });
    return () => {
      const rawProps = toRaw(props);
      const cssTransitionProps = resolveTransitionProps(rawProps);
      let tag = rawProps.tag || Fragment;
      prevChildren = children;
      children = slots.default ? getTransitionRawChildren(slots.default()) : [];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.key != null) {
          setTransitionHooks(
            child,
            resolveTransitionHooks(child, cssTransitionProps, state, instance)
          );
        }
      }
      if (prevChildren) {
        for (let i = 0; i < prevChildren.length; i++) {
          const child = prevChildren[i];
          setTransitionHooks(
            child,
            resolveTransitionHooks(child, cssTransitionProps, state, instance)
          );
          positionMap.set(child, child.el.getBoundingClientRect());
        }
      }
      return createVNode(tag, null, children);
    };
  }
};
const removeMode = (props) => delete props.mode;
/* @__PURE__ */ removeMode(TransitionGroupImpl.props);
const TransitionGroup = TransitionGroupImpl;
function callPendingCbs(c) {
  const el = c.el;
  if (el[moveCbKey]) {
    el[moveCbKey]();
  }
  if (el[enterCbKey]) {
    el[enterCbKey]();
  }
}
function recordPosition(c) {
  newPositionMap.set(c, c.el.getBoundingClientRect());
}
function applyTranslation(c) {
  const oldPos = positionMap.get(c);
  const newPos = newPositionMap.get(c);
  const dx = oldPos.left - newPos.left;
  const dy = oldPos.top - newPos.top;
  if (dx || dy) {
    const s = c.el.style;
    s.transform = s.webkitTransform = `translate(${dx}px,${dy}px)`;
    s.transitionDuration = "0s";
    return c;
  }
}
function hasCSSTransform(el, root, moveClass) {
  const clone = el.cloneNode();
  const _vtc = el[vtcKey];
  if (_vtc) {
    _vtc.forEach((cls) => {
      cls.split(/\s+/).forEach((c) => c && clone.classList.remove(c));
    });
  }
  moveClass.split(/\s+/).forEach((c) => c && clone.classList.add(c));
  clone.style.display = "none";
  const container = root.nodeType === 1 ? root : root.parentNode;
  container.appendChild(clone);
  const { hasTransform } = getTransitionInfo(clone);
  container.removeChild(clone);
  return hasTransform;
}
const getModelAssigner = (vnode) => {
  const fn = vnode.props["onUpdate:modelValue"] || false;
  return isArray(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
  e.target.composing = true;
}
function onCompositionEnd(e) {
  const target = e.target;
  if (target.composing) {
    target.composing = false;
    target.dispatchEvent(new Event("input"));
  }
}
const assignKey = Symbol("_assign");
const vModelText = {
  created(el, { modifiers: { lazy, trim, number } }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    const castToNumber = number || vnode.props && vnode.props.type === "number";
    addEventListener(el, lazy ? "change" : "input", (e) => {
      if (e.target.composing)
        return;
      let domValue = el.value;
      if (trim) {
        domValue = domValue.trim();
      }
      if (castToNumber) {
        domValue = looseToNumber(domValue);
      }
      el[assignKey](domValue);
    });
    if (trim) {
      addEventListener(el, "change", () => {
        el.value = el.value.trim();
      });
    }
    if (!lazy) {
      addEventListener(el, "compositionstart", onCompositionStart);
      addEventListener(el, "compositionend", onCompositionEnd);
      addEventListener(el, "change", onCompositionEnd);
    }
  },
  mounted(el, { value }) {
    el.value = value == null ? "" : value;
  },
  beforeUpdate(el, { value, modifiers: { lazy, trim, number } }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    if (el.composing)
      return;
    if (document.activeElement === el && el.type !== "range") {
      if (lazy) {
        return;
      }
      if (trim && el.value.trim() === value) {
        return;
      }
      if ((number || el.type === "number") && looseToNumber(el.value) === value) {
        return;
      }
    }
    const newValue = value == null ? "" : value;
    if (el.value !== newValue) {
      el.value = newValue;
    }
  }
};
const vModelCheckbox = {
  deep: true,
  created(el, _, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    addEventListener(el, "change", () => {
      const modelValue = el._modelValue;
      const elementValue = getValue(el);
      const checked = el.checked;
      const assign = el[assignKey];
      if (isArray(modelValue)) {
        const index = looseIndexOf(modelValue, elementValue);
        const found = index !== -1;
        if (checked && !found) {
          assign(modelValue.concat(elementValue));
        } else if (!checked && found) {
          const filtered = [...modelValue];
          filtered.splice(index, 1);
          assign(filtered);
        }
      } else if (isSet(modelValue)) {
        const cloned = new Set(modelValue);
        if (checked) {
          cloned.add(elementValue);
        } else {
          cloned.delete(elementValue);
        }
        assign(cloned);
      } else {
        assign(getCheckboxValue(el, checked));
      }
    });
  },
  mounted: setChecked,
  beforeUpdate(el, binding, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    setChecked(el, binding, vnode);
  }
};
function setChecked(el, { value, oldValue }, vnode) {
  el._modelValue = value;
  if (isArray(value)) {
    el.checked = looseIndexOf(value, vnode.props.value) > -1;
  } else if (isSet(value)) {
    el.checked = value.has(vnode.props.value);
  } else if (value !== oldValue) {
    el.checked = looseEqual(value, getCheckboxValue(el, true));
  }
}
const vModelSelect = {
  deep: true,
  created(el, { value, modifiers: { number } }, vnode) {
    const isSetModel = isSet(value);
    addEventListener(el, "change", () => {
      const selectedVal = Array.prototype.filter.call(el.options, (o) => o.selected).map(
        (o) => number ? looseToNumber(getValue(o)) : getValue(o)
      );
      el[assignKey](
        el.multiple ? isSetModel ? new Set(selectedVal) : selectedVal : selectedVal[0]
      );
    });
    el[assignKey] = getModelAssigner(vnode);
  },
  mounted(el, { value }) {
    setSelected(el, value);
  },
  beforeUpdate(el, _binding, vnode) {
    el[assignKey] = getModelAssigner(vnode);
  },
  updated(el, { value }) {
    setSelected(el, value);
  }
};
function setSelected(el, value) {
  const isMultiple = el.multiple;
  if (isMultiple && !isArray(value) && !isSet(value)) {
    return;
  }
  for (let i = 0, l = el.options.length; i < l; i++) {
    const option = el.options[i];
    const optionValue = getValue(option);
    if (isMultiple) {
      if (isArray(value)) {
        option.selected = looseIndexOf(value, optionValue) > -1;
      } else {
        option.selected = value.has(optionValue);
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i)
          el.selectedIndex = i;
        return;
      }
    }
  }
  if (!isMultiple && el.selectedIndex !== -1) {
    el.selectedIndex = -1;
  }
}
function getValue(el) {
  return "_value" in el ? el._value : el.value;
}
function getCheckboxValue(el, checked) {
  const key = checked ? "_trueValue" : "_falseValue";
  return key in el ? el[key] : checked;
}
const systemModifiers = ["ctrl", "shift", "alt", "meta"];
const modifierGuards = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, modifiers) => systemModifiers.some((m) => e[`${m}Key`] && !modifiers.includes(m))
};
const withModifiers = (fn, modifiers) => {
  return (event, ...args) => {
    for (let i = 0; i < modifiers.length; i++) {
      const guard = modifierGuards[modifiers[i]];
      if (guard && guard(event, modifiers))
        return;
    }
    return fn(event, ...args);
  };
};
const keyNames = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
};
const withKeys = (fn, modifiers) => {
  return (event) => {
    if (!("key" in event)) {
      return;
    }
    const eventKey = hyphenate(event.key);
    if (modifiers.some((k) => k === eventKey || keyNames[k] === eventKey)) {
      return fn(event);
    }
  };
};
const rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
let renderer;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
const createApp = (...args) => {
  const app = ensureRenderer().createApp(...args);
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container)
      return;
    const component = app._component;
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    container.innerHTML = "";
    const proxy = mount(container, false, container instanceof SVGElement);
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app;
};
function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    return res;
  }
  return container;
}
const scriptRel = "modulepreload";
const assetsURL = function(dep, importerUrl) {
  return new URL(dep, importerUrl).href;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  if (!deps || deps.length === 0) {
    return baseModule();
  }
  const links = document.getElementsByTagName("link");
  return Promise.all(deps.map((dep) => {
    dep = assetsURL(dep, importerUrl);
    if (dep in seen)
      return;
    seen[dep] = true;
    const isCss = dep.endsWith(".css");
    const cssSelector = isCss ? '[rel="stylesheet"]' : "";
    const isBaseRelative = !!importerUrl;
    if (isBaseRelative) {
      for (let i = links.length - 1; i >= 0; i--) {
        const link2 = links[i];
        if (link2.href === dep && (!isCss || link2.rel === "stylesheet")) {
          return;
        }
      }
    } else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
      return;
    }
    const link = document.createElement("link");
    link.rel = isCss ? "stylesheet" : scriptRel;
    if (!isCss) {
      link.as = "script";
      link.crossOrigin = "";
    }
    link.href = dep;
    document.head.appendChild(link);
    if (isCss) {
      return new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));
      });
    }
  })).then(() => baseModule());
};
function mitt(n) {
  return { all: n = n || /* @__PURE__ */ new Map(), on: function(t, e) {
    var i = n.get(t);
    i ? i.push(e) : n.set(t, [e]);
  }, off: function(t, e) {
    var i = n.get(t);
    i && (e ? i.splice(i.indexOf(e) >>> 0, 1) : n.set(t, []));
  }, emit: function(t, e) {
    var i = n.get(t);
    i && i.slice().map(function(n2) {
      n2(e);
    }), (i = n.get("*")) && i.slice().map(function(n2) {
      n2(t, e);
    });
  } };
}
var __defProp$P = Object.defineProperty;
var __defNormalProp$P = (obj, key, value) => key in obj ? __defProp$P(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$p = (obj, key, value) => {
  __defNormalProp$P(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const eventBus = mitt();
const eventBus$1 = {
  fire(event) {
    eventBus.emit(event.kind, event);
  },
  subscribe(eventType, handler) {
    eventBus.on(eventType.kind, handler);
  },
  unsubscribe(eventType, handler) {
    eventBus.off(eventType.kind, handler);
  }
};
class AssetFailureEvent {
  constructor(path) {
    this.path = path;
    __publicField$p(this, "kind", "AssetFailureEvent");
  }
}
__publicField$p(AssetFailureEvent, "kind", "AssetFailureEvent");
class FailureEvent {
  constructor(message) {
    this.message = message;
    __publicField$p(this, "kind", "FailureEvent");
  }
}
__publicField$p(FailureEvent, "kind", "FailureEvent");
class CustomAssetFailureEvent {
  constructor(error2) {
    this.error = error2;
    __publicField$p(this, "kind", "CustomAssetFailureEvent");
  }
}
__publicField$p(CustomAssetFailureEvent, "kind", "CustomAssetFailureEvent");
class InvalidateRenderEvent {
  constructor() {
    __publicField$p(this, "kind", "InvalidateRenderEvent");
  }
}
__publicField$p(InvalidateRenderEvent, "kind", "InvalidateRenderEvent");
const _RenderUpdatedEvent = class {
  constructor() {
    __publicField$p(this, "kind", _RenderUpdatedEvent.kind);
  }
};
let RenderUpdatedEvent = _RenderUpdatedEvent;
__publicField$p(RenderUpdatedEvent, "kind", "RenderUpdatedEvent");
const _StateLoadingEvent = class {
  constructor() {
    __publicField$p(this, "kind", _StateLoadingEvent.kind);
  }
};
let StateLoadingEvent = _StateLoadingEvent;
__publicField$p(StateLoadingEvent, "kind", "StateLoadingEvent");
class ShowMessageEvent {
  constructor(message) {
    this.message = message;
    __publicField$p(this, "kind", "ShowMessageEvent");
  }
}
__publicField$p(ShowMessageEvent, "kind", "ShowMessageEvent");
class ResolvableErrorEvent {
  constructor(message, actions2) {
    this.message = message;
    this.actions = actions2;
    __publicField$p(this, "kind", "ResolvableErrorEvent");
  }
}
__publicField$p(ResolvableErrorEvent, "kind", "ResolvableErrorEvent");
class ColorPickedEvent {
  constructor(color2) {
    this.color = color2;
    __publicField$p(this, "kind", "ColorPickedEvent");
  }
}
__publicField$p(ColorPickedEvent, "kind", "ColorPickedEvent");
class VueErrorEvent {
  constructor(error2, info) {
    this.error = error2;
    this.info = info;
    __publicField$p(this, "kind", "VueErrorEvent");
  }
}
__publicField$p(VueErrorEvent, "kind", "VueErrorEvent");
var __defProp$O = Object.defineProperty;
var __defProps$p = Object.defineProperties;
var __getOwnPropDescs$p = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$v = Object.getOwnPropertySymbols;
var __hasOwnProp$v = Object.prototype.hasOwnProperty;
var __propIsEnum$v = Object.prototype.propertyIsEnumerable;
var __defNormalProp$O = (obj, key, value) => key in obj ? __defProp$O(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$v = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$v.call(b, prop))
      __defNormalProp$O(a, prop, b[prop]);
  if (__getOwnPropSymbols$v)
    for (var prop of __getOwnPropSymbols$v(b)) {
      if (__propIsEnum$v.call(b, prop))
        __defNormalProp$O(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$p = (a, b) => __defProps$p(a, __getOwnPropDescs$p(b));
var __publicField$o = (obj, key, value) => {
  __defNormalProp$O(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$L = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const repoUrl = "https://edave64.github.io/Doki-Doki-Dialog-Generator-Packs/";
const _Repo = class {
  constructor(onlineRepo, localRepo, $store) {
    this.$store = $store;
    __publicField$o(this, "onlineRepo");
    __publicField$o(this, "localRepo");
    __publicField$o(this, "tempRepo", reactive({
      authors: {},
      packs: []
    }));
    __publicField$o(this, "combinedList");
    __publicField$o(this, "authors");
    window.repo = this;
    if (!onlineRepo) {
      onlineRepo = { authors: {}, packs: [] };
      eventBus$1.fire(new ShowMessageEvent("Couldn't load remote repository."));
    }
    if (!localRepo) {
      localRepo = { authors: {}, packs: [] };
      if (envX.supports.localRepo) {
        eventBus$1.fire(new ShowMessageEvent("Couldn't load local repository."));
      }
    }
    this.onlineRepo = ref(onlineRepo);
    this.localRepo = ref(localRepo);
    this.combinedList = computed(() => {
      var _a2, _b;
      const onlineRepo2 = this.onlineRepo.value;
      const onlinePacks = (_a2 = onlineRepo2 == null ? void 0 : onlineRepo2.packs) != null ? _a2 : [];
      const onlineRepoLookup = new Map(
        onlinePacks.map((pack) => [pack.id, pack])
      );
      const localRepo2 = this.localRepo.value;
      const localPacks = (_b = localRepo2 == null ? void 0 : localRepo2.packs) != null ? _b : [];
      const localRepoLookup = new Map(
        localPacks.map((pack) => [pack.id, pack])
      );
      const tempRepo = this.tempRepo;
      const tempPacks = tempRepo.packs;
      const tempRepoLookup = new Map(tempPacks.map((pack) => [pack.id, pack]));
      const autoloads = new Set(envX.state.autoAdd);
      const loadedPackOrder = this.$store.state.content.contentPacks.map((pack) => pack.packId).filter((packId) => packId != null);
      const loadedPacksSet = new Set(loadedPackOrder);
      const addedPacks = /* @__PURE__ */ new Set();
      return [
        ...loadedPackOrder,
        ...localPacks.map((pack) => pack.id),
        ...onlinePacks.map((pack) => pack.id),
        ...tempPacks.map((pack) => pack.id)
      ].filter((packId) => {
        if (packId.startsWith("dddg.buildin.") || packId.startsWith("dddg.uploads.") || packId.startsWith("dddg.desktop.") || packId === "concept_femc.shido_draws.edave64" || packId === "mc.storm_blaze.edave64")
          return false;
        if (addedPacks.has(packId))
          return false;
        addedPacks.add(packId);
        return true;
      }).map((packId) => {
        var _a22, _b2, _c;
        return __spreadProps$p(__spreadValues$v(__spreadValues$v(__spreadValues$v({}, (_a22 = onlineRepoLookup.get(packId)) != null ? _a22 : {
          characters: [],
          kind: [],
          authors: []
        }), (_b2 = localRepoLookup.get(packId)) != null ? _b2 : {}), (_c = tempRepoLookup.get(packId)) != null ? _c : {}), {
          autoloading: autoloads.has(packId),
          installed: localRepoLookup.has(packId),
          online: onlineRepoLookup.has(packId) || tempRepoLookup.has(packId),
          loaded: loadedPacksSet.has(packId)
        });
      });
    });
    this.authors = computed(() => {
      var _a2, _b;
      const onlineRepo2 = this.onlineRepo.value;
      const onlineAuthors = (_a2 = onlineRepo2 == null ? void 0 : onlineRepo2.authors) != null ? _a2 : {};
      const localRepo2 = this.localRepo.value;
      const localAuthors = (_b = localRepo2 == null ? void 0 : localRepo2.authors) != null ? _b : {};
      return __spreadValues$v(__spreadValues$v({}, onlineAuthors), localAuthors);
    });
    Object.freeze(this);
  }
  static getInstance() {
    if (!_Repo.instance)
      _Repo.instance = this.createInstance();
    return _Repo.instance;
  }
  static createInstance() {
    return __async$L(this, null, function* () {
      const onlineRepoLoading = _Repo.loadRepo(repoUrl);
      const localRepoLoading = envX.supports.localRepo ? yield _Repo.loadRepo(envX.localRepositoryUrl) : null;
      const [onlineRepoLoaded, localRepoLoaded, $store] = yield Promise.all([
        onlineRepoLoading,
        localRepoLoading,
        _Repo.$store
      ]);
      return new _Repo(onlineRepoLoaded, localRepoLoaded, $store);
    });
  }
  static loadRepo(repo) {
    return __async$L(this, null, function* () {
      try {
        const [packs, authors] = yield Promise.all([
          _Repo.fetchJSON(repo + "repo.json"),
          _Repo.fetchJSON(repo + "people.json")
        ]);
        return { packs, authors };
      } catch (e) {
        return null;
      }
    });
  }
  static fetchJSON(path) {
    return __async$L(this, null, function* () {
      const req = yield fetch(path);
      if (!req.ok)
        throw new Error("Could not load json");
      return yield req.json();
    });
  }
  reloadLocalRepo() {
    return __async$L(this, null, function* () {
      this.localRepo.value = envX.supports.localRepo ? yield _Repo.loadRepo(envX.localRepositoryUrl) : null;
    });
  }
  getPacks() {
    return this.combinedList.value;
  }
  hasPack(id, onlineOnly = false) {
    var _a2;
    if (onlineOnly) {
      return !!((_a2 = this.onlineRepo.value) == null ? void 0 : _a2.packs.find((pack) => pack.id === id));
    }
    return !!this.getPacks().find((pack) => pack.id === id);
  }
  getPack(id) {
    var _a2;
    return (_a2 = this.getPacks().find((pack) => pack.id === id)) != null ? _a2 : null;
  }
  getAuthor(id) {
    return this.authors.value[id] || null;
  }
  getAuthors() {
    return this.authors.value;
  }
  loadTempPack(url) {
    return __async$L(this, null, function* () {
      const req = fetch(url);
      let res;
      try {
        res = yield req;
      } catch (e) {
        throw new Error(`Failed to load '${url}'`);
      }
      let body;
      try {
        body = yield res.json();
      } catch (e) {
        throw new Error(
          `The contents of '${url}' is not a valid JSON: ${e.message}`
        );
      }
      if (!body.pack) {
        throw new Error(`The json file '${url}' does not contain any packages`);
      }
      if (body.authors) {
        for (const key in body.authors) {
          if (this.tempRepo.authors[key]) {
            this.tempRepo.authors[key] = body.authors[key];
          }
        }
      }
      const pack = body.pack;
      pack.repoUrl = url;
      if (!this.tempRepo.packs.find((x) => x.id === pack.id)) {
        this.tempRepo.packs.push(pack);
      }
      return pack.id;
    });
  }
};
let Repo = _Repo;
__publicField$o(Repo, "instance");
__publicField$o(Repo, "setStore");
__publicField$o(Repo, "$store", new Promise(
  (resolve, _reject) => {
    _Repo.setStore = resolve;
  }
));
var __async$K = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const transaction = transactionLayer();
function transactionLayer() {
  const transactionQueue = [];
  let transactionRunning = false;
  return function transaction2(callback) {
    return new Promise((resolve, _reject) => {
      const exec = () => __async$K(this, null, function* () {
        try {
          if (callback.length > 0) {
            yield callback(transactionLayer());
          } else {
            yield callback();
          }
        } catch (e) {
          console.log("Error during transaction!: ", e);
        } finally {
          transactionRunning = false;
        }
        if (transactionQueue.length > 0) {
          transactionQueue.shift()();
        }
        resolve();
      });
      if (transactionRunning) {
        transactionQueue.push(exec);
      } else {
        exec();
      }
    });
  };
}
var __defProp$N = Object.defineProperty;
var __getOwnPropSymbols$u = Object.getOwnPropertySymbols;
var __hasOwnProp$u = Object.prototype.hasOwnProperty;
var __propIsEnum$u = Object.prototype.propertyIsEnumerable;
var __defNormalProp$N = (obj, key, value) => key in obj ? __defProp$N(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$u = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$u.call(b, prop))
      __defNormalProp$N(a, prop, b[prop]);
  if (__getOwnPropSymbols$u)
    for (var prop of __getOwnPropSymbols$u(b)) {
      if (__propIsEnum$u.call(b, prop))
        __defNormalProp$N(a, prop, b[prop]);
    }
  return a;
};
var __publicField$n = (obj, key, value) => {
  __defNormalProp$N(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$J = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const ua = navigator.userAgent;
const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
const webkit = !!ua.match(/WebKit/i);
const mobileSafari = iOS && webkit && !ua.match(/CriOS/i);
class Browser {
  constructor() {
    __publicField$n(this, "state", reactive({
      looseTextParsing: true,
      autoAdd: [],
      downloadLocation: "Default download folder"
    }));
    __publicField$n(this, "supports");
    __publicField$n(this, "_gameMode", null);
    __publicField$n(this, "$store", null);
    __publicField$n(this, "isSavingEnabled", ref(false));
    __publicField$n(this, "localRepositoryUrl", "");
    __publicField$n(this, "loading");
    __publicField$n(this, "creatingDB");
    __publicField$n(this, "loadingContentPacksAllowed");
    __publicField$n(this, "loadContentPacks");
    const self2 = this;
    const canSave = IndexedDBHandler.canSave();
    window.addEventListener("beforeunload", function(e) {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? All your progress will be lost!";
    });
    this.loadingContentPacksAllowed = new Promise((resolve, _reject) => {
      this.loadContentPacks = () => resolve();
    });
    this.supports = reactive({
      optionalSaving: canSave,
      get autoLoading() {
        return canSave && self2.isSavingEnabled.value;
      },
      backgroundInstall: false,
      localRepo: false,
      lq: true,
      setDownloadFolder: false,
      openableFolders: /* @__PURE__ */ new Set([]),
      assetCaching: !mobileSafari,
      allowWebP: true,
      limitedCanvasSpace: mobileSafari
    });
    if (canSave) {
      this.loading = (() => __async$J(this, null, function* () {
        this.savingEnabled = yield IndexedDBHandler.doesDbExists();
      }))();
    } else {
      this.loading = Promise.resolve();
    }
    this.loading.then(() => __async$J(this, null, function* () {
      var _a2;
      yield this.loadingContentPacksAllowed;
      if (this.creatingDB)
        yield this.creatingDB;
      if (this.savingEnabled) {
        const autoload = (_a2 = yield IndexedDBHandler.loadAutoload()) != null ? _a2 : [];
        this.state.autoAdd = autoload;
        const repo = yield Repo.getInstance();
        const packUrls = yield Promise.all(
          autoload.map((compoundId) => __async$J(this, null, function* () {
            var _a22;
            const [id, url] = compoundId.split(";", 2);
            if (url != null && !repo.hasPack(id)) {
              yield repo.loadTempPack(url);
            }
            const pack = repo.getPack(id);
            return (_a22 = pack.dddg2Path) != null ? _a22 : pack.dddg1Path;
          }))
        );
        yield transaction(() => __async$J(this, null, function* () {
          yield this.$store.dispatch("content/loadContentPacks", packUrls);
        }));
      }
    }));
  }
  get gameMode() {
    return this._gameMode;
  }
  get savingEnabled() {
    return this.isSavingEnabled.value;
  }
  set savingEnabled(value) {
    if (value) {
      localStorage.setItem("saving", "true");
      this.creatingDB = IndexedDBHandler.createDB();
      this.creatingDB.then(() => {
        this.creatingDB = void 0;
        this.isSavingEnabled.value = true;
      }).catch(() => {
      });
    } else {
      localStorage.clear();
      this.isSavingEnabled.value = false;
      this.creatingDB = IndexedDBHandler.clearDB().then(() => {
        this.creatingDB = void 0;
      }).catch(() => {
      });
    }
  }
  storeSaveFile(saveBlob, defaultName) {
    const a = document.createElement("a");
    const url = URL.createObjectURL(saveBlob);
    a.setAttribute("download", defaultName);
    a.setAttribute("href", url);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return Promise.resolve();
  }
  loadGameMode() {
    return __async$J(this, null, function* () {
      const searchParams = new URLSearchParams(location.search);
      const getMode = searchParams.get("mode");
      if (getMode === "ddlc" || getMode === "ddlc_plus") {
        this._gameMode = getMode;
        return;
      }
      yield this.loading;
      yield this.creatingDB;
      let stored = "";
      if (this.isSavingEnabled.value) {
        stored = yield IndexedDBHandler.loadGameMode();
      }
      let value = "ddlc";
      if (stored === "ddlc" || stored === "ddlc_plus") {
        value = stored;
      }
      this._gameMode = value;
    });
  }
  setGameMode(mode) {
    return __async$J(this, null, function* () {
      if (this.isSavingEnabled.value) {
        yield IndexedDBHandler.saveGameMode(mode);
      }
      const baseLoc = `${location.protocol}//${location.host}${location.pathname}`;
      location.href = `${baseLoc}?mode=${mode}`;
    });
  }
  updateDownloadFolder() {
    throw new Error("Method not implemented.");
  }
  openFolder(_folder) {
    throw new Error("Method not implemented.");
  }
  connectToStore(store2) {
    this.$store = store2;
  }
  saveToFile(downloadCanvas, filename, format = "image/png", quality = 1) {
    return __async$J(this, null, function* () {
      const a = document.createElement("a");
      a.setAttribute("download", filename);
      const url = yield this.createObjectURL(downloadCanvas, format, quality);
      a.setAttribute("href", url);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return url;
    });
  }
  localRepoInstall(_url, _repo, _authors) {
    throw new Error("This environment does not support a local repository");
  }
  localRepoUninstall(_id) {
    throw new Error("This environment does not support a local repository");
  }
  autoLoadAdd(id) {
    return __async$J(this, null, function* () {
      yield this.loading;
      yield this.creatingDB;
      yield IndexedDBHandler.saveAutoload([...this.state.autoAdd, id]);
      this.state.autoAdd.push(id);
    });
  }
  autoLoadRemove(id) {
    return __async$J(this, null, function* () {
      yield this.loading;
      yield this.creatingDB;
      const packId = this.normalizePackId(id);
      yield IndexedDBHandler.saveAutoload(
        this.state.autoAdd.filter((x) => this.normalizePackId(x) != packId)
      );
      const idx = this.state.autoAdd.indexOf(id);
      this.state.autoAdd.splice(idx, 1);
    });
  }
  normalizePackId(id) {
    const parts = id.split(";");
    if (parts.length === 1) {
      return parts[0];
    }
    return parts[parts.length - 1];
  }
  loadSettings() {
    return __async$J(this, null, function* () {
      yield this.loading;
      yield this.creatingDB;
      const base = {
        darkMode: void 0,
        lq: true,
        nsfw: false,
        defaultCharacterTalkingZoom: true,
        looseTextParsing: true
      };
      if (!this.isSavingEnabled.value)
        return base;
      return __spreadValues$u(__spreadValues$u({}, base), yield IndexedDBHandler.loadSettings());
    });
  }
  saveSettings(settings) {
    return __async$J(this, null, function* () {
      yield this.loading;
      yield this.creatingDB;
      if (!this.isSavingEnabled.value)
        return;
      yield IndexedDBHandler.saveSettings(settings);
    });
  }
  isInitialized() {
    return __async$J(this, null, function* () {
      yield this.loading;
      yield this.creatingDB;
    });
  }
  prompt(message, defaultValue) {
    return new Promise((resolve, _reject) => {
      resolve(prompt(message, defaultValue));
    });
  }
  onPanelChange(_handler) {
    return;
  }
  createObjectURL(canvas, format, quality) {
    return new Promise((resolve, reject) => {
      const canCreateObjectUrl = window.URL != null && window.URL.createObjectURL != null;
      if (!canCreateObjectUrl)
        return resolve(canvas.toDataURL(format, quality));
      if (canvas.toBlob != null) {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject();
              return;
            }
            resolve(URL.createObjectURL(blob));
          },
          format,
          quality
        );
      } else {
        const url = canvas.toDataURL(format, quality);
        const blob = this.dataURItoBlob(url, format);
        resolve(URL.createObjectURL(blob));
      }
    });
  }
  dataURItoBlob(dataURI, type) {
    const binStr = atob(dataURI.split(",")[1]);
    const len = binStr.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }
    return new Blob([arr], { type });
  }
}
const IndexedDBHandler = {
  indexedDB: (() => {
    var _a2, _b, _c;
    try {
      return (_c = (_b = (_a2 = window.indexedDB) != null ? _a2 : window.mozIndexedDB) != null ? _b : window.webkitIndexedDB) != null ? _c : window.msIndexedDB;
    } catch (e) {
      return null;
    }
  })(),
  transaction: (() => {
    try {
      return window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    } catch (e) {
      return null;
    }
  })(),
  db: null,
  canSave() {
    return !!(IndexedDBHandler.indexedDB && window.localStorage != null);
  },
  doesDbExists() {
    const saving = localStorage.getItem("saving");
    if (saving === "true") {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },
  createDB() {
    if (IndexedDBHandler.db)
      return IndexedDBHandler.db;
    return IndexedDBHandler.db = new Promise((resolve, reject) => {
      const req = IndexedDBHandler.indexedDB.open("dddg", 3);
      req.onerror = (event) => {
        reject(event);
      };
      req.onupgradeneeded = (event) => {
        var _a2;
        const db = event.target.result;
        const oldVer = (_a2 = event.oldVersion) != null ? _a2 : event.version;
        if (oldVer < 1) {
          db.createObjectStore("settings");
        }
        if (oldVer === 1) {
          db.deleteObjectStore("settings");
          db.createObjectStore("settings");
        }
      };
      req.onsuccess = (_event) => {
        resolve(req.result);
      };
    });
  },
  clearDB() {
    return new Promise((resolve, reject) => {
      if (!IndexedDBHandler.db) {
        resolve();
        return;
      }
      const req = IndexedDBHandler.indexedDB.deleteDatabase("dddg");
      IndexedDBHandler.db = null;
      req.onerror = (event) => {
        reject(event);
      };
      req.onsuccess = (_event) => {
        resolve();
      };
    });
  },
  loadAutoload() {
    return this.objectStorePromise("readonly", (store2) => __async$J(this, null, function* () {
      return yield this.reqPromise(store2.get("autoload"));
    }));
  },
  saveAutoload(autoloads) {
    return this.objectStorePromise("readwrite", (store2) => __async$J(this, null, function* () {
      yield this.reqPromise(store2.put([...autoloads], "autoload"));
    }));
  },
  loadGameMode() {
    return this.objectStorePromise("readonly", (store2) => __async$J(this, null, function* () {
      return yield this.reqPromise(store2.get("gameMode"));
    }));
  },
  saveGameMode(mode) {
    return this.objectStorePromise("readwrite", (store2) => __async$J(this, null, function* () {
      yield this.reqPromise(store2.put(mode, "gameMode"));
    }));
  },
  saveSettings(settings) {
    return this.objectStorePromise("readwrite", (store2) => __async$J(this, null, function* () {
      yield this.reqPromise(store2.put(__spreadValues$u({}, settings), "settings"));
    }));
  },
  loadSettings() {
    return this.objectStorePromise("readonly", (store2) => __async$J(this, null, function* () {
      return yield this.reqPromise(store2.get("settings"));
    }));
  },
  objectStorePromise(mode, callback) {
    if (!this.db)
      return Promise.reject(new Error("No database"));
    return new Promise((resolve, reject) => __async$J(this, null, function* () {
      const transact = (yield this.db).transaction(["settings"], mode);
      const store2 = transact.objectStore("settings");
      try {
        resolve(yield callback(store2));
      } catch (e) {
        reject(e);
      }
    }));
  },
  reqPromise(req) {
    return new Promise((resolve, reject) => {
      req.onerror = (error2) => {
        reject(error2);
      };
      req.onsuccess = (_event) => {
        resolve(req.result);
      };
    });
  }
};
class OldEdge extends Browser {
  saveToFile(downloadCanvas, filename, format = "image/png", quality = 1) {
    let url = downloadCanvas.toDataURL(format, quality);
    const blob = this.dataURItoBlob(url, format);
    if (window.URL != null && window.URL.createObjectURL != null) {
      url = URL.createObjectURL(blob);
    }
    window.navigator.msSaveBlob(blob, filename);
    return Promise.resolve(url);
  }
}
var __defProp$M = Object.defineProperty;
var __defNormalProp$M = (obj, key, value) => key in obj ? __defProp$M(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$m = (obj, key, value) => {
  __defNormalProp$M(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$I = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const installedBackgroundsPack = {
  packId: "dddg.buildin.installedBackgrounds",
  dependencies: [],
  packCredits: [],
  characters: [],
  fonts: [],
  sprites: [],
  poemStyles: [],
  poemBackgrounds: [],
  backgrounds: [],
  colors: []
};
class Electron {
  constructor() {
    __publicField$m(this, "state", reactive({
      looseTextParsing: true,
      autoAdd: [],
      downloadLocation: ""
    }));
    __publicField$m(this, "localRepositoryUrl", "/repo/");
    __publicField$m(this, "_gameMode", null);
    __publicField$m(this, "electron", window);
    __publicField$m(this, "$store", null);
    __publicField$m(this, "bgInvalidation", null);
    __publicField$m(this, "pendingContentPacks", []);
    __publicField$m(this, "pendingContentPacksReplace", []);
    __publicField$m(this, "loadingContentPacksAllowed");
    __publicField$m(this, "loadContentPacks");
    __publicField$m(this, "supports", {
      autoLoading: true,
      backgroundInstall: true,
      localRepo: true,
      lq: false,
      optionalSaving: false,
      setDownloadFolder: true,
      openableFolders: /* @__PURE__ */ new Set(["downloads", "backgrounds", "sprites"]),
      assetCaching: true,
      allowWebP: true,
      limitedCanvasSpace: false
    });
    __publicField$m(this, "savingEnabled", true);
    this.loadingContentPacksAllowed = new Promise((resolve, _reject) => {
      this.loadContentPacks = () => resolve();
    });
    this.electron.ipcRenderer.on(
      "add-persistent-content-pack",
      (filePath) => __async$I(this, null, function* () {
        yield this.loadingContentPacksAllowed;
        if (!this.$store) {
          this.pendingContentPacks.push(filePath);
          return;
        }
        yield transaction(() => __async$I(this, null, function* () {
          yield this.$store.dispatch("content/loadContentPacks", filePath);
        }));
      })
    );
    this.electron.ipcRenderer.on(
      "add-persistent-background",
      (filepath) => __async$I(this, null, function* () {
        const name = "persistentBg-" + filepath;
        const parts = filepath.split("/");
        yield registerAssetWithURL(name, filepath);
        installedBackgroundsPack.backgrounds.push({
          id: name,
          variants: [[name]],
          label: parts[parts.length - 1],
          scaling: "none"
        });
        this.invalidateInstalledBGs();
      })
    );
    this.electron.ipcRenderer.on("push-message", (message) => {
      eventBus$1.fire(new ShowMessageEvent(message));
    });
    this.electron.ipcRenderer.on(
      "config.downloadFolderUpdate",
      (location2) => {
        this.state.downloadLocation = location2;
      }
    );
    this.electron.ipcRenderer.onConversation(
      "load-packs",
      (packIds) => __async$I(this, null, function* () {
        const repo = yield Repo.getInstance();
        const packUrls = yield Promise.all(
          packIds.map((compoundId) => __async$I(this, null, function* () {
            const [id, url] = compoundId.split(";", 2);
            if (url != null && !repo.hasPack(id)) {
              yield repo.loadTempPack(url);
            }
            const pack = repo.getPack(id);
            return pack.dddg2Path || pack.dddg1Path;
          }))
        );
        if (!this.$store) {
          packUrls.forEach((url) => this.pendingContentPacks.push(url));
          return;
        }
        yield transaction(() => __async$I(this, null, function* () {
          yield this.$store.dispatch("content/loadContentPacks", packUrls);
        }));
      })
    );
    this.electron.ipcRenderer.onConversation(
      "auto-load.changed",
      (packIds) => {
        this.state.autoAdd = packIds;
      }
    );
    this.electron.ipcRenderer.onConversation("reload-repo", () => __async$I(this, null, function* () {
      yield (yield Repo.getInstance()).reloadLocalRepo();
    }));
    this.electron.ipcRenderer.onConversation(
      "replace-pack",
      (contentPack) => __async$I(this, null, function* () {
        const action = {
          processed: false,
          contentPack
        };
        if (!this.$store) {
          this.pendingContentPacksReplace.push(action);
        } else {
          yield transaction(() => __async$I(this, null, function* () {
            yield this.$store.dispatch("content/replaceContentPack", action);
          }));
        }
      })
    );
    this.electron.ipcRenderer.onConversation(
      "resolvable-error",
      (message, actions2) => {
        return new Promise((resolve, _reject) => {
          eventBus$1.fire(
            new ResolvableErrorEvent(
              message,
              actions2.map((action) => ({
                exec: () => resolve(action),
                name: action
              }))
            )
          );
        });
      }
    );
    let updateNotified = false;
    this.electron.ipcRenderer.on(
      "update.progress",
      (progress) => {
        if (progress === "done") {
          updateNotified = false;
          eventBus$1.fire(
            new ShowMessageEvent(
              "An update is ready and will be installed once DDDG closes."
            )
          );
        } else if (!updateNotified) {
          updateNotified = true;
          eventBus$1.fire(
            new ShowMessageEvent(
              "An update is ready and will be installed once DDDG closes."
            )
          );
        }
      }
    );
    this.electron.ipcRenderer.send("init-dddg");
  }
  get gameMode() {
    return this._gameMode;
  }
  storeSaveFile(saveBlob, defaultName) {
    const a = document.createElement("a");
    const url = URL.createObjectURL(saveBlob);
    a.setAttribute("download", defaultName);
    a.setAttribute("href", url);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return Promise.resolve();
  }
  updateDownloadFolder() {
    this.electron.ipcRenderer.send("config.newDownloadFolder");
  }
  openFolder(folder) {
    this.electron.ipcRenderer.send("open-folder", folder);
  }
  onPanelChange(_handler) {
  }
  saveSettings(settings) {
    return __async$I(this, null, function* () {
      var _a2;
      yield this.electron.ipcRenderer.sendConvo(
        "config.set",
        "nsfw",
        settings.nsfw
      );
      yield this.electron.ipcRenderer.sendConvo(
        "config.set",
        "darkMode",
        (_a2 = settings.darkMode) != null ? _a2 : void 0
      );
      yield this.electron.ipcRenderer.sendConvo(
        "config.set",
        "defaultCharacterTalkingZoom",
        settings.defaultCharacterTalkingZoom
      );
    });
  }
  loadGameMode() {
    return __async$I(this, null, function* () {
      this._gameMode = (yield this.electron.ipcRenderer.sendConvo("config.get", "gameMode")) || "ddlc";
    });
  }
  setGameMode(mode) {
    return __async$I(this, null, function* () {
      yield this.electron.ipcRenderer.sendConvo("config.set", "gameMode", mode);
      this.electron.ipcRenderer.send("reload");
    });
  }
  loadSettings() {
    return __async$I(this, null, function* () {
      var _a2, _b, _c;
      return {
        lq: false,
        nsfw: (_a2 = yield this.electron.ipcRenderer.sendConvo("config.get", "nsfw")) != null ? _a2 : false,
        darkMode: (_b = yield this.electron.ipcRenderer.sendConvo("config.get", "darkMode")) != null ? _b : void 0,
        defaultCharacterTalkingZoom: (_c = yield this.electron.ipcRenderer.sendConvo(
          "config.get",
          "defaultCharacterTalkingZoom"
        )) != null ? _c : void 0
      };
    });
  }
  localRepoInstall(url, repo, authors) {
    return __async$I(this, null, function* () {
      yield this.electron.ipcRenderer.sendConvo(
        "repo.install",
        url,
        repo,
        authors
      );
    });
  }
  localRepoUninstall(id) {
    return __async$I(this, null, function* () {
      yield this.electron.ipcRenderer.sendConvo("repo.uninstall", id);
    });
  }
  autoLoadAdd(id) {
    return __async$I(this, null, function* () {
      yield this.electron.ipcRenderer.sendConvo("auto-load.add", id);
    });
  }
  autoLoadRemove(id) {
    return __async$I(this, null, function* () {
      yield this.electron.ipcRenderer.sendConvo("auto-load.remove", id);
    });
  }
  saveToFile(downloadCanvas, filename, format = "image/png", quality = 1) {
    return new Promise((resolve, reject) => {
      downloadCanvas.toBlob(
        (blob) => __async$I(this, null, function* () {
          if (!blob) {
            reject();
            return;
          }
          const buffer = yield blob.arrayBuffer();
          yield this.electron.ipcRenderer.sendConvo(
            "save-file",
            filename,
            new Uint8Array(buffer)
          );
          resolve(URL.createObjectURL(blob));
        }),
        format,
        quality
      );
    });
  }
  prompt(message, defaultValue) {
    return __async$I(this, null, function* () {
      return yield this.electron.ipcRenderer.sendConvo(
        "show-prompt",
        message,
        defaultValue
      );
    });
  }
  connectToStore(store2) {
    this.$store = store2;
    this.invalidateInstalledBGs();
    transaction(() => __async$I(this, null, function* () {
      if (this.pendingContentPacks.length > 0) {
        yield this.$store.dispatch(
          "content/loadContentPacks",
          this.pendingContentPacks
        );
      }
      if (this.pendingContentPacksReplace.length > 0) {
        for (const action of this.pendingContentPacksReplace) {
          yield this.$store.dispatch("content/replaceContentPack", action);
        }
      }
    }));
  }
  invalidateInstalledBGs() {
    if (!this.$store)
      return;
    if (this.bgInvalidation !== null)
      return;
    this.bgInvalidation = requestAnimationFrame(() => {
      this.updateInstalledBGs();
    });
  }
  updateInstalledBGs() {
    if (this.bgInvalidation != null) {
      cancelAnimationFrame(this.bgInvalidation);
      this.bgInvalidation = null;
    }
    if (!this.$store)
      return;
    transaction(() => __async$I(this, null, function* () {
      yield this.$store.dispatch("content/replaceContentPack", {
        contentPack: installedBackgroundsPack
      });
    }));
  }
}
function chooseEnv() {
  if (window.isElectron) {
    return new Electron();
  }
  if ("msSaveOrOpenBlob" in window.navigator) {
    return new OldEdge();
  }
  return new Browser();
}
const envX = chooseEnv();
window.toast = envX;
const MissingImage = "" + new URL("missing_image.480f7f62.svg", import.meta.url).href;
var __defProp$L = Object.defineProperty;
var __getOwnPropSymbols$t = Object.getOwnPropertySymbols;
var __hasOwnProp$t = Object.prototype.hasOwnProperty;
var __propIsEnum$t = Object.prototype.propertyIsEnumerable;
var __defNormalProp$L = (obj, key, value) => key in obj ? __defProp$L(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$t = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$t.call(b, prop))
      __defNormalProp$L(a, prop, b[prop]);
  if (__getOwnPropSymbols$t)
    for (var prop of __getOwnPropSymbols$t(b)) {
      if (__propIsEnum$t.call(b, prop))
        __defNormalProp$L(a, prop, b[prop]);
    }
  return a;
};
var __publicField$l = (obj, key, value) => {
  __defNormalProp$L(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class ImageAsset {
  constructor(html) {
    this.html = html;
    __publicField$l(this, "width");
    __publicField$l(this, "height");
    this.width = html.width;
    this.height = html.height;
  }
  paintOnto(fsCtx, opts = {}) {
    const { w, h: h2 } = __spreadValues$t({
      w: this.width,
      h: this.height
    }, opts);
    const { x, y } = __spreadValues$t({
      x: -w / 2,
      y: -h2 / 2
    }, opts);
    fsCtx.drawImage(this.html, x, y, w, h2);
  }
}
var __defProp$K = Object.defineProperty;
var __defNormalProp$K = (obj, key, value) => key in obj ? __defProp$K(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$k = (obj, key, value) => {
  __defNormalProp$K(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
let missing_image = null;
setTimeout(
  () => getAssetByUrl(MissingImage).then((x) => {
    if (x instanceof ImageAsset)
      missing_image = x;
  }),
  0
);
class ErrorAsset {
  constructor() {
    __publicField$k(this, "width", 300);
    __publicField$k(this, "height", 300);
  }
  paintOnto(fsCtx, opts = {}) {
    if (missing_image) {
      missing_image.paintOnto(fsCtx, opts);
    }
  }
}
var __defProp$J = Object.defineProperty;
var __defNormalProp$J = (obj, key, value) => key in obj ? __defProp$J(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$j = (obj, key, value) => {
  __defNormalProp$J(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$H = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
let webpSupportPromise;
function isWebPSupported() {
  if (webpSupportPromise)
    return webpSupportPromise;
  if (!envX.supports.allowWebP) {
    return Promise.resolve(false);
  }
  const losslessCode = "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA=";
  const transparentCode = "data:image/webp;base64,UklGRogAAABXRUJQVlA4THwAAAAv/8SzAA/wGbPPmH3GbP7jAQSSNu9f+rzDwYj+G23bpt3Gx3xD8353j73f5b87+e9OALmT/+7kvzv5704CuJP/7uS/O/nvTgK4k//u5L87+e9OAriT/+7kvzv5704CuJP/7uS/O/nvTgK4k//u5L87+e9O/rsTwe7kvzsL";
  return webpSupportPromise = (() => __async$H(this, null, function* () {
    const ret = yield Promise.all([
      canLoadImg(losslessCode, 1, 2),
      canLoadImg(transparentCode, 720, 1280)
    ]);
    return ret[0] && ret[1];
  }))();
}
function canLoadImg(url, height, width) {
  return new Promise((resolve, _reject) => {
    const img = document.createElement("img");
    img.addEventListener("load", () => {
      resolve(img.width === width && img.height === height);
    });
    img.addEventListener("error", () => {
      resolve(false);
    });
    img.src = url;
  });
}
let heifSupportPromise;
function isHeifSupported() {
  if (heifSupportPromise)
    return heifSupportPromise;
  return heifSupportPromise = (() => __async$H(this, null, function* () {
    const losslessCode = "data:image/heic;base64,AAAAGGZ0eXBoZWljAAAAAG1pZjFoZWljAAAAsW1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAHBpY3QAXABjAGMAcwBsAGEAAAAADnBpdG0AAAAAAAEAAAAQaWxvYwAAAABEQAAAAAAAI2lpbmYAAAAAAAEAAAAVaW5mZQIAAAAAAQAAaHZjMQAAAABDaXBycAAAACdpcGNvAAAAH2h2Y0NmzGx1ci0AAAAAAABv9HP+//v9bjr3AAAAABRpcG1hAAAAAAAAAAEAAQGBAAAACG1kYXQ=";
    return yield canLoadImg(losslessCode, 1, 2);
  }))();
}
class AssetCache {
  constructor() {
    __publicField$j(this, "cache", /* @__PURE__ */ new Map());
  }
  get(url) {
    const lookup = this.cache.get(url);
    if (lookup)
      return lookup;
    const promise = imagePromise(url);
    this.cache.set(url, promise);
    return promise;
  }
  remove(url) {
    this.cache.delete(url);
  }
}
class TmpAssetCache {
  constructor() {
    __publicField$j(this, "cache", /* @__PURE__ */ new Map());
  }
  get(url) {
    var _a2;
    const lookup = (_a2 = this.cache.get(url)) == null ? void 0 : _a2.deref();
    if (lookup)
      return lookup;
    const promise = requestAssetByUrl(url);
    this.cache.set(url, new WeakRef(promise));
    return promise;
  }
  remove(url) {
    this.cache.delete(url);
  }
}
let assetCache = null;
function getAssetCache() {
  if (assetCache)
    return assetCache;
  return window.assetCache = assetCache = envX.supports.assetCaching || typeof WeakRef === "undefined" ? new AssetCache() : new TmpAssetCache();
}
const customUrl = {};
function getAAsset(asset, hq = true) {
  return getAssetByUrl(envX.supports.lq && !hq ? asset.lq : asset.hq);
}
function getAAssetUrl(asset, hq = true) {
  const url = envX.supports.lq && !hq ? asset.lq : asset.hq;
  if (customUrl[url])
    return customUrl[url];
  return url;
}
function getAssetByUrl(url) {
  if (customUrl[url])
    url = customUrl[url];
  return getAssetCache().get(url);
}
const baseUrl = "./";
function getBuildInAsset(asset, hq = true) {
  return __async$H(this, null, function* () {
    const url = `${baseUrl}assets/${asset}${hq ? "" : ".lq"}${(yield isWebPSupported()) ? ".webp" : ".png"}`.replace(/\/+/, "/");
    return yield getAssetCache().get(url);
  });
}
function getBuildInAssetUrl(asset, hq = true) {
  return __async$H(this, null, function* () {
    return `${baseUrl}assets/${asset}${envX.supports.lq && !hq ? ".lq" : ""}${(yield isWebPSupported()) ? ".webp" : ".png"}`.replace(/\/+/, "/");
  });
}
function registerAssetWithURL(asset, url) {
  customUrl[asset] = url;
}
function requestAssetByUrl(url) {
  return __async$H(this, null, function* () {
    const isCustom = !!customUrl[url];
    if (isCustom)
      url = customUrl[url];
    return yield (() => __async$H(this, null, function* () {
      try {
        return yield imagePromise(url);
      } catch (e) {
        if (url.endsWith(".webp") && !isCustom) {
          try {
            return yield imagePromise(url.replace(/\.webp$/, ".png"));
          } catch (e2) {
            eventBus$1.fire(new AssetFailureEvent(url));
            getAssetCache().remove(url);
            return new ErrorAsset();
          }
        } else {
          eventBus$1.fire(new AssetFailureEvent(url));
          getAssetCache().remove(url);
          return new ErrorAsset();
        }
      }
    }))();
  });
}
function imagePromise(url, noCache = false) {
  return new Promise((resolve, _reject) => {
    const img = new Image();
    img.addEventListener("load", () => {
      resolve(new ImageAsset(img));
      if (noCache || !envX.supports.assetCaching) {
        document.body.removeChild(img);
      }
    });
    img.addEventListener("error", (_e) => {
      resolve(new ErrorAsset());
      if (noCache || !envX.supports.assetCaching) {
        document.body.removeChild(img);
      }
    });
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.style.display = "none";
    document.body.appendChild(img);
  });
}
const NsfwPacks = {
  "dddg.buildin.backgrounds.nsfw": `${baseUrl}packs/buildin.base.backgrounds.nsfw.json`,
  "dddg.buildin.sayori.nsfw": `${baseUrl}packs/buildin.base.sayori.nsfw.json`,
  "dddg.buildin.base.natsuki.nsfw": `${baseUrl}packs/buildin.base.natsuki.nsfw.json`,
  "dddg.buildin.yuri.nsfw": `${baseUrl}packs/buildin.base.yuri.nsfw.json`
};
const NsfwNames = new Set(Object.keys(NsfwPacks));
const NsfwPaths = Object.values(NsfwPacks);
var __defProp$I = Object.defineProperty;
var __defProps$o = Object.defineProperties;
var __getOwnPropDescs$o = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$s = Object.getOwnPropertySymbols;
var __hasOwnProp$s = Object.prototype.hasOwnProperty;
var __propIsEnum$s = Object.prototype.propertyIsEnumerable;
var __defNormalProp$I = (obj, key, value) => key in obj ? __defProp$I(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$s = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$s.call(b, prop))
      __defNormalProp$I(a, prop, b[prop]);
  if (__getOwnPropSymbols$s)
    for (var prop of __getOwnPropSymbols$s(b)) {
      if (__propIsEnum$s.call(b, prop))
        __defNormalProp$I(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$o = (a, b) => __defProps$o(a, __getOwnPropDescs$o(b));
function mergeContentPacks(x, y) {
  return {
    backgrounds: mergeBackgrounds(x.backgrounds, y.backgrounds),
    characters: mergeCharacters(x.characters, y.characters),
    dependencies: mergeArrayUnique(x.dependencies, y.dependencies),
    fonts: mergeIdArrays(
      x.fonts,
      y.fonts,
      (obj) => obj.id,
      (xObj, yObj) => __spreadProps$o(__spreadValues$s({}, xObj), {
        files: mergeArrayUnique(xObj.files, yObj.files)
      })
    ),
    poemStyles: mergeIdArrays(
      x.poemStyles,
      y.poemStyles,
      (obj) => obj.label,
      () => {
        throw new Error();
      }
    ),
    poemBackgrounds: [...x.poemBackgrounds, ...y.poemBackgrounds],
    sprites: mergeIdArrays(
      x.sprites,
      y.sprites,
      (obj) => obj.id,
      (xObj, yObj) => {
        var _a2;
        return {
          id: xObj.id,
          label: xObj.label,
          variants: [...xObj.variants, ...yObj.variants],
          defaultScale: xObj.defaultScale,
          hd: xObj.hd,
          sdVersion: (_a2 = xObj.sdVersion) != null ? _a2 : yObj.sdVersion
        };
      }
    ),
    colors: mergeIdArrays(
      x.colors,
      y.colors,
      (obj) => obj.color,
      (xObj) => xObj
    )
  };
}
function mergeBackgrounds(x, y) {
  return mergeIdArrays(x, y, (obj) => obj.id, mergeBackground);
}
function mergeBackground(x, y) {
  var _a2;
  return {
    id: x.id,
    label: x.label,
    variants: [...x.variants, ...y.variants],
    scaling: x.scaling,
    sdVersion: (_a2 = x.sdVersion) != null ? _a2 : y.sdVersion
  };
}
function mergeCharacters(x, y) {
  return mergeIdArrays(x, y, (obj) => obj.id, mergeCharacter);
}
function mergeCharacter(x, y) {
  return {
    chibi: x.chibi,
    id: x.id,
    label: x.label,
    heads: mergeHeadCollections(x.heads, y.heads),
    defaultScale: x.defaultScale,
    hd: x.hd,
    size: x.size,
    sdVersion: x.sdVersion,
    styleGroups: mergeIdArrays(
      x.styleGroups,
      y.styleGroups,
      (obj) => obj.id,
      (xStyleGroup, yStyleGroup) => {
        return {
          id: xStyleGroup.id,
          styleComponents: mergeIdArrays(
            xStyleGroup.styleComponents,
            yStyleGroup.styleComponents,
            (obj) => obj.id,
            (xClasses, yClasses) => {
              return {
                id: xClasses.id,
                label: xClasses.label,
                variants: mergeStyleClasses(
                  xClasses.variants,
                  yClasses.variants
                )
              };
            }
          ),
          styles: mergeIdArrays(
            xStyleGroup.styles,
            yStyleGroup.styles,
            (obj) => JSON.stringify(obj.components),
            (xStyle, yStyle) => ({
              components: xStyle.components,
              poses: mergeIdArrays(
                xStyle.poses,
                yStyle.poses,
                (obj) => obj.id,
                mergePose
              )
            })
          )
        };
      }
    )
  };
}
function mergeStyleClasses(x, y) {
  const ret = __spreadValues$s({}, x);
  for (const classKey in y) {
    if (!Object.prototype.hasOwnProperty.call(y, classKey))
      continue;
    if (Object.prototype.hasOwnProperty.call(ret, classKey))
      continue;
    ret[classKey] = y[classKey];
  }
  return ret;
}
function mergePose(x, y) {
  const positions2 = __spreadValues$s({}, x.positions);
  for (const key in y.positions) {
    if (positions2[key]) {
      positions2[key] = [...positions2[key], ...y.positions[key]];
    } else {
      positions2[key] = y.positions[key];
    }
  }
  return {
    id: x.id,
    compatibleHeads: mergeArrayUnique(x.compatibleHeads, y.compatibleHeads),
    previewOffset: x.previewOffset,
    previewSize: x.previewSize,
    scale: x.scale,
    size: x.size,
    renderCommands: x.renderCommands,
    positions: positions2
  };
}
function mergeHeadCollections(x, y) {
  const ret = __spreadValues$s({}, x);
  for (const headGroupKey in y) {
    if (!Object.prototype.hasOwnProperty.call(y, headGroupKey))
      continue;
    const headGroup = y[headGroupKey];
    if (ret[headGroupKey]) {
      const oldHeadGroup = ret[headGroupKey];
      ret[headGroupKey] = {
        previewOffset: oldHeadGroup.previewOffset,
        previewSize: oldHeadGroup.previewSize,
        variants: [...oldHeadGroup.variants, ...headGroup.variants]
      };
    } else {
      ret[headGroupKey] = headGroup;
    }
  }
  return ret;
}
function mergeArrayUnique(x, y) {
  const ret = [...x];
  for (const yObj of y) {
    if (!ret.includes(yObj)) {
      ret.push(yObj);
    }
  }
  return ret;
}
function mergeIdArrays(x, y, getId2, merge2) {
  const ret = [...x];
  const definedIds = new Map(
    x.map((xObj, idx) => [getId2(xObj), idx])
  );
  for (const yObj of y) {
    const yId = getId2(yObj);
    if (definedIds.has(yId)) {
      const existingIdx = definedIds.get(yId);
      const existing = ret[existingIdx];
      ret.splice(existingIdx, 1, merge2(existing, yObj));
    } else {
      definedIds.set(yId, ret.length);
      ret.push(yObj);
    }
  }
  return ret;
}
function getDevtoolsGlobalHook() {
  return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
}
function getTarget() {
  return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
}
const isProxyAvailable = typeof Proxy === "function";
const HOOK_SETUP = "devtools-plugin:setup";
const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
let supported;
let perf;
function isPerformanceSupported() {
  var _a2;
  if (supported !== void 0) {
    return supported;
  }
  if (typeof window !== "undefined" && window.performance) {
    supported = true;
    perf = window.performance;
  } else if (typeof global !== "undefined" && ((_a2 = global.perf_hooks) === null || _a2 === void 0 ? void 0 : _a2.performance)) {
    supported = true;
    perf = global.perf_hooks.performance;
  } else {
    supported = false;
  }
  return supported;
}
function now() {
  return isPerformanceSupported() ? perf.now() : Date.now();
}
class ApiProxy {
  constructor(plugin, hook) {
    this.target = null;
    this.targetQueue = [];
    this.onQueue = [];
    this.plugin = plugin;
    this.hook = hook;
    const defaultSettings = {};
    if (plugin.settings) {
      for (const id in plugin.settings) {
        const item = plugin.settings[id];
        defaultSettings[id] = item.defaultValue;
      }
    }
    const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
    let currentSettings = Object.assign({}, defaultSettings);
    try {
      const raw = localStorage.getItem(localSettingsSaveId);
      const data = JSON.parse(raw);
      Object.assign(currentSettings, data);
    } catch (e) {
    }
    this.fallbacks = {
      getSettings() {
        return currentSettings;
      },
      setSettings(value) {
        try {
          localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
        } catch (e) {
        }
        currentSettings = value;
      },
      now() {
        return now();
      }
    };
    if (hook) {
      hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
        if (pluginId === this.plugin.id) {
          this.fallbacks.setSettings(value);
        }
      });
    }
    this.proxiedOn = new Proxy({}, {
      get: (_target, prop) => {
        if (this.target) {
          return this.target.on[prop];
        } else {
          return (...args) => {
            this.onQueue.push({
              method: prop,
              args
            });
          };
        }
      }
    });
    this.proxiedTarget = new Proxy({}, {
      get: (_target, prop) => {
        if (this.target) {
          return this.target[prop];
        } else if (prop === "on") {
          return this.proxiedOn;
        } else if (Object.keys(this.fallbacks).includes(prop)) {
          return (...args) => {
            this.targetQueue.push({
              method: prop,
              args,
              resolve: () => {
              }
            });
            return this.fallbacks[prop](...args);
          };
        } else {
          return (...args) => {
            return new Promise((resolve) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve
              });
            });
          };
        }
      }
    });
  }
  setRealTarget(target) {
    return __async(this, null, function* () {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(yield this.target[item.method](...item.args));
      }
    });
  }
}
function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
  const descriptor = pluginDescriptor;
  const target = getTarget();
  const hook = getDevtoolsGlobalHook();
  const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
  if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
    hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
  } else {
    const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
    const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
    list.push({
      pluginDescriptor: descriptor,
      setupFn,
      proxy
    });
    if (proxy)
      setupFn(proxy.proxiedTarget);
  }
}
/*!
 * vuex v4.1.0
 * (c) 2022 Evan You
 * @license MIT
 */
var storeKey = "store";
function useStore$1(key) {
  if (key === void 0)
    key = null;
  return inject(key !== null ? key : storeKey);
}
function forEachValue(obj, fn) {
  Object.keys(obj).forEach(function(key) {
    return fn(obj[key], key);
  });
}
function isObject(obj) {
  return obj !== null && typeof obj === "object";
}
function isPromise(val) {
  return val && typeof val.then === "function";
}
function partial(fn, arg) {
  return function() {
    return fn(arg);
  };
}
function genericSubscribe(fn, subs, options) {
  if (subs.indexOf(fn) < 0) {
    options && options.prepend ? subs.unshift(fn) : subs.push(fn);
  }
  return function() {
    var i = subs.indexOf(fn);
    if (i > -1) {
      subs.splice(i, 1);
    }
  };
}
function resetStore(store2, hot) {
  store2._actions = /* @__PURE__ */ Object.create(null);
  store2._mutations = /* @__PURE__ */ Object.create(null);
  store2._wrappedGetters = /* @__PURE__ */ Object.create(null);
  store2._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
  var state = store2.state;
  installModule(store2, state, [], store2._modules.root, true);
  resetStoreState(store2, state, hot);
}
function resetStoreState(store2, state, hot) {
  var oldState = store2._state;
  var oldScope = store2._scope;
  store2.getters = {};
  store2._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
  var wrappedGetters = store2._wrappedGetters;
  var computedObj = {};
  var computedCache = {};
  var scope = effectScope(true);
  scope.run(function() {
    forEachValue(wrappedGetters, function(fn, key) {
      computedObj[key] = partial(fn, store2);
      computedCache[key] = computed(function() {
        return computedObj[key]();
      });
      Object.defineProperty(store2.getters, key, {
        get: function() {
          return computedCache[key].value;
        },
        enumerable: true
      });
    });
  });
  store2._state = reactive({
    data: state
  });
  store2._scope = scope;
  if (store2.strict) {
    enableStrictMode(store2);
  }
  if (oldState) {
    if (hot) {
      store2._withCommit(function() {
        oldState.data = null;
      });
    }
  }
  if (oldScope) {
    oldScope.stop();
  }
}
function installModule(store2, rootState, path, module, hot) {
  var isRoot = !path.length;
  var namespace = store2._modules.getNamespace(path);
  if (module.namespaced) {
    if (store2._modulesNamespaceMap[namespace] && false) {
      console.error("[vuex] duplicate namespace " + namespace + " for the namespaced module " + path.join("/"));
    }
    store2._modulesNamespaceMap[namespace] = module;
  }
  if (!isRoot && !hot) {
    var parentState = getNestedState(rootState, path.slice(0, -1));
    var moduleName = path[path.length - 1];
    store2._withCommit(function() {
      parentState[moduleName] = module.state;
    });
  }
  var local = module.context = makeLocalContext(store2, namespace, path);
  module.forEachMutation(function(mutation, key) {
    var namespacedType = namespace + key;
    registerMutation(store2, namespacedType, mutation, local);
  });
  module.forEachAction(function(action, key) {
    var type = action.root ? key : namespace + key;
    var handler = action.handler || action;
    registerAction(store2, type, handler, local);
  });
  module.forEachGetter(function(getter, key) {
    var namespacedType = namespace + key;
    registerGetter(store2, namespacedType, getter, local);
  });
  module.forEachChild(function(child, key) {
    installModule(store2, rootState, path.concat(key), child, hot);
  });
}
function makeLocalContext(store2, namespace, path) {
  var noNamespace = namespace === "";
  var local = {
    dispatch: noNamespace ? store2.dispatch : function(_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;
      if (!options || !options.root) {
        type = namespace + type;
      }
      return store2.dispatch(type, payload);
    },
    commit: noNamespace ? store2.commit : function(_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;
      if (!options || !options.root) {
        type = namespace + type;
      }
      store2.commit(type, payload, options);
    }
  };
  Object.defineProperties(local, {
    getters: {
      get: noNamespace ? function() {
        return store2.getters;
      } : function() {
        return makeLocalGetters(store2, namespace);
      }
    },
    state: {
      get: function() {
        return getNestedState(store2.state, path);
      }
    }
  });
  return local;
}
function makeLocalGetters(store2, namespace) {
  if (!store2._makeLocalGettersCache[namespace]) {
    var gettersProxy = {};
    var splitPos = namespace.length;
    Object.keys(store2.getters).forEach(function(type) {
      if (type.slice(0, splitPos) !== namespace) {
        return;
      }
      var localType = type.slice(splitPos);
      Object.defineProperty(gettersProxy, localType, {
        get: function() {
          return store2.getters[type];
        },
        enumerable: true
      });
    });
    store2._makeLocalGettersCache[namespace] = gettersProxy;
  }
  return store2._makeLocalGettersCache[namespace];
}
function registerMutation(store2, type, handler, local) {
  var entry = store2._mutations[type] || (store2._mutations[type] = []);
  entry.push(function wrappedMutationHandler(payload) {
    handler.call(store2, local.state, payload);
  });
}
function registerAction(store2, type, handler, local) {
  var entry = store2._actions[type] || (store2._actions[type] = []);
  entry.push(function wrappedActionHandler(payload) {
    var res = handler.call(store2, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store2.getters,
      rootState: store2.state
    }, payload);
    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
    if (store2._devtoolHook) {
      return res.catch(function(err) {
        store2._devtoolHook.emit("vuex:error", err);
        throw err;
      });
    } else {
      return res;
    }
  });
}
function registerGetter(store2, type, rawGetter, local) {
  if (store2._wrappedGetters[type]) {
    return;
  }
  store2._wrappedGetters[type] = function wrappedGetter(store3) {
    return rawGetter(
      local.state,
      local.getters,
      store3.state,
      store3.getters
    );
  };
}
function enableStrictMode(store2) {
  watch(function() {
    return store2._state.data;
  }, function() {
  }, { deep: true, flush: "sync" });
}
function getNestedState(state, path) {
  return path.reduce(function(state2, key) {
    return state2[key];
  }, state);
}
function unifyObjectStyle(type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }
  return { type, payload, options };
}
var LABEL_VUEX_BINDINGS = "vuex bindings";
var MUTATIONS_LAYER_ID = "vuex:mutations";
var ACTIONS_LAYER_ID = "vuex:actions";
var INSPECTOR_ID = "vuex";
var actionId = 0;
function addDevtools(app, store2) {
  setupDevtoolsPlugin(
    {
      id: "org.vuejs.vuex",
      app,
      label: "Vuex",
      homepage: "https://next.vuex.vuejs.org/",
      logo: "https://vuejs.org/images/icons/favicon-96x96.png",
      packageName: "vuex",
      componentStateTypes: [LABEL_VUEX_BINDINGS]
    },
    function(api) {
      api.addTimelineLayer({
        id: MUTATIONS_LAYER_ID,
        label: "Vuex Mutations",
        color: COLOR_LIME_500
      });
      api.addTimelineLayer({
        id: ACTIONS_LAYER_ID,
        label: "Vuex Actions",
        color: COLOR_LIME_500
      });
      api.addInspector({
        id: INSPECTOR_ID,
        label: "Vuex",
        icon: "storage",
        treeFilterPlaceholder: "Filter stores..."
      });
      api.on.getInspectorTree(function(payload) {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          if (payload.filter) {
            var nodes = [];
            flattenStoreForInspectorTree(nodes, store2._modules.root, payload.filter, "");
            payload.rootNodes = nodes;
          } else {
            payload.rootNodes = [
              formatStoreForInspectorTree(store2._modules.root, "")
            ];
          }
        }
      });
      api.on.getInspectorState(function(payload) {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          var modulePath = payload.nodeId;
          makeLocalGetters(store2, modulePath);
          payload.state = formatStoreForInspectorState(
            getStoreModule(store2._modules, modulePath),
            modulePath === "root" ? store2.getters : store2._makeLocalGettersCache,
            modulePath
          );
        }
      });
      api.on.editInspectorState(function(payload) {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          var modulePath = payload.nodeId;
          var path = payload.path;
          if (modulePath !== "root") {
            path = modulePath.split("/").filter(Boolean).concat(path);
          }
          store2._withCommit(function() {
            payload.set(store2._state.data, path, payload.state.value);
          });
        }
      });
      store2.subscribe(function(mutation, state) {
        var data = {};
        if (mutation.payload) {
          data.payload = mutation.payload;
        }
        data.state = state;
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: Date.now(),
            title: mutation.type,
            data
          }
        });
      });
      store2.subscribeAction({
        before: function(action, state) {
          var data = {};
          if (action.payload) {
            data.payload = action.payload;
          }
          action._id = actionId++;
          action._time = Date.now();
          data.state = state;
          api.addTimelineEvent({
            layerId: ACTIONS_LAYER_ID,
            event: {
              time: action._time,
              title: action.type,
              groupId: action._id,
              subtitle: "start",
              data
            }
          });
        },
        after: function(action, state) {
          var data = {};
          var duration = Date.now() - action._time;
          data.duration = {
            _custom: {
              type: "duration",
              display: duration + "ms",
              tooltip: "Action duration",
              value: duration
            }
          };
          if (action.payload) {
            data.payload = action.payload;
          }
          data.state = state;
          api.addTimelineEvent({
            layerId: ACTIONS_LAYER_ID,
            event: {
              time: Date.now(),
              title: action.type,
              groupId: action._id,
              subtitle: "end",
              data
            }
          });
        }
      });
    }
  );
}
var COLOR_LIME_500 = 8702998;
var COLOR_DARK = 6710886;
var COLOR_WHITE = 16777215;
var TAG_NAMESPACED = {
  label: "namespaced",
  textColor: COLOR_WHITE,
  backgroundColor: COLOR_DARK
};
function extractNameFromPath(path) {
  return path && path !== "root" ? path.split("/").slice(-2, -1)[0] : "Root";
}
function formatStoreForInspectorTree(module, path) {
  return {
    id: path || "root",
    label: extractNameFromPath(path),
    tags: module.namespaced ? [TAG_NAMESPACED] : [],
    children: Object.keys(module._children).map(
      function(moduleName) {
        return formatStoreForInspectorTree(
          module._children[moduleName],
          path + moduleName + "/"
        );
      }
    )
  };
}
function flattenStoreForInspectorTree(result, module, filter, path) {
  if (path.includes(filter)) {
    result.push({
      id: path || "root",
      label: path.endsWith("/") ? path.slice(0, path.length - 1) : path || "Root",
      tags: module.namespaced ? [TAG_NAMESPACED] : []
    });
  }
  Object.keys(module._children).forEach(function(moduleName) {
    flattenStoreForInspectorTree(result, module._children[moduleName], filter, path + moduleName + "/");
  });
}
function formatStoreForInspectorState(module, getters, path) {
  getters = path === "root" ? getters : getters[path];
  var gettersKeys = Object.keys(getters);
  var storeState = {
    state: Object.keys(module.state).map(function(key) {
      return {
        key,
        editable: true,
        value: module.state[key]
      };
    })
  };
  if (gettersKeys.length) {
    var tree = transformPathsToObjectTree(getters);
    storeState.getters = Object.keys(tree).map(function(key) {
      return {
        key: key.endsWith("/") ? extractNameFromPath(key) : key,
        editable: false,
        value: canThrow(function() {
          return tree[key];
        })
      };
    });
  }
  return storeState;
}
function transformPathsToObjectTree(getters) {
  var result = {};
  Object.keys(getters).forEach(function(key) {
    var path = key.split("/");
    if (path.length > 1) {
      var target = result;
      var leafKey = path.pop();
      path.forEach(function(p2) {
        if (!target[p2]) {
          target[p2] = {
            _custom: {
              value: {},
              display: p2,
              tooltip: "Module",
              abstract: true
            }
          };
        }
        target = target[p2]._custom.value;
      });
      target[leafKey] = canThrow(function() {
        return getters[key];
      });
    } else {
      result[key] = canThrow(function() {
        return getters[key];
      });
    }
  });
  return result;
}
function getStoreModule(moduleMap, path) {
  var names = path.split("/").filter(function(n) {
    return n;
  });
  return names.reduce(
    function(module, moduleName, i) {
      var child = module[moduleName];
      if (!child) {
        throw new Error('Missing module "' + moduleName + '" for path "' + path + '".');
      }
      return i === names.length - 1 ? child : child._children;
    },
    path === "root" ? moduleMap : moduleMap.root._children
  );
}
function canThrow(cb) {
  try {
    return cb();
  } catch (e) {
    return e;
  }
}
var Module = function Module2(rawModule, runtime) {
  this.runtime = runtime;
  this._children = /* @__PURE__ */ Object.create(null);
  this._rawModule = rawModule;
  var rawState = rawModule.state;
  this.state = (typeof rawState === "function" ? rawState() : rawState) || {};
};
var prototypeAccessors$1 = { namespaced: { configurable: true } };
prototypeAccessors$1.namespaced.get = function() {
  return !!this._rawModule.namespaced;
};
Module.prototype.addChild = function addChild(key, module) {
  this._children[key] = module;
};
Module.prototype.removeChild = function removeChild(key) {
  delete this._children[key];
};
Module.prototype.getChild = function getChild(key) {
  return this._children[key];
};
Module.prototype.hasChild = function hasChild(key) {
  return key in this._children;
};
Module.prototype.update = function update(rawModule) {
  this._rawModule.namespaced = rawModule.namespaced;
  if (rawModule.actions) {
    this._rawModule.actions = rawModule.actions;
  }
  if (rawModule.mutations) {
    this._rawModule.mutations = rawModule.mutations;
  }
  if (rawModule.getters) {
    this._rawModule.getters = rawModule.getters;
  }
};
Module.prototype.forEachChild = function forEachChild(fn) {
  forEachValue(this._children, fn);
};
Module.prototype.forEachGetter = function forEachGetter(fn) {
  if (this._rawModule.getters) {
    forEachValue(this._rawModule.getters, fn);
  }
};
Module.prototype.forEachAction = function forEachAction(fn) {
  if (this._rawModule.actions) {
    forEachValue(this._rawModule.actions, fn);
  }
};
Module.prototype.forEachMutation = function forEachMutation(fn) {
  if (this._rawModule.mutations) {
    forEachValue(this._rawModule.mutations, fn);
  }
};
Object.defineProperties(Module.prototype, prototypeAccessors$1);
var ModuleCollection = function ModuleCollection2(rawRootModule) {
  this.register([], rawRootModule, false);
};
ModuleCollection.prototype.get = function get2(path) {
  return path.reduce(function(module, key) {
    return module.getChild(key);
  }, this.root);
};
ModuleCollection.prototype.getNamespace = function getNamespace(path) {
  var module = this.root;
  return path.reduce(function(namespace, key) {
    module = module.getChild(key);
    return namespace + (module.namespaced ? key + "/" : "");
  }, "");
};
ModuleCollection.prototype.update = function update$1(rawRootModule) {
  update2([], this.root, rawRootModule);
};
ModuleCollection.prototype.register = function register(path, rawModule, runtime) {
  var this$1$1 = this;
  if (runtime === void 0)
    runtime = true;
  var newModule = new Module(rawModule, runtime);
  if (path.length === 0) {
    this.root = newModule;
  } else {
    var parent = this.get(path.slice(0, -1));
    parent.addChild(path[path.length - 1], newModule);
  }
  if (rawModule.modules) {
    forEachValue(rawModule.modules, function(rawChildModule, key) {
      this$1$1.register(path.concat(key), rawChildModule, runtime);
    });
  }
};
ModuleCollection.prototype.unregister = function unregister(path) {
  var parent = this.get(path.slice(0, -1));
  var key = path[path.length - 1];
  var child = parent.getChild(key);
  if (!child) {
    return;
  }
  if (!child.runtime) {
    return;
  }
  parent.removeChild(key);
};
ModuleCollection.prototype.isRegistered = function isRegistered(path) {
  var parent = this.get(path.slice(0, -1));
  var key = path[path.length - 1];
  if (parent) {
    return parent.hasChild(key);
  }
  return false;
};
function update2(path, targetModule, newModule) {
  targetModule.update(newModule);
  if (newModule.modules) {
    for (var key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        return;
      }
      update2(
        path.concat(key),
        targetModule.getChild(key),
        newModule.modules[key]
      );
    }
  }
}
function createStore(options) {
  return new Store(options);
}
var Store = function Store2(options) {
  var this$1$1 = this;
  if (options === void 0)
    options = {};
  var plugins = options.plugins;
  if (plugins === void 0)
    plugins = [];
  var strict = options.strict;
  if (strict === void 0)
    strict = false;
  var devtools = options.devtools;
  this._committing = false;
  this._actions = /* @__PURE__ */ Object.create(null);
  this._actionSubscribers = [];
  this._mutations = /* @__PURE__ */ Object.create(null);
  this._wrappedGetters = /* @__PURE__ */ Object.create(null);
  this._modules = new ModuleCollection(options);
  this._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
  this._subscribers = [];
  this._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
  this._scope = null;
  this._devtools = devtools;
  var store2 = this;
  var ref2 = this;
  var dispatch2 = ref2.dispatch;
  var commit2 = ref2.commit;
  this.dispatch = function boundDispatch(type, payload) {
    return dispatch2.call(store2, type, payload);
  };
  this.commit = function boundCommit(type, payload, options2) {
    return commit2.call(store2, type, payload, options2);
  };
  this.strict = strict;
  var state = this._modules.root.state;
  installModule(this, state, [], this._modules.root);
  resetStoreState(this, state);
  plugins.forEach(function(plugin) {
    return plugin(this$1$1);
  });
};
var prototypeAccessors = { state: { configurable: true } };
Store.prototype.install = function install(app, injectKey) {
  app.provide(injectKey || storeKey, this);
  app.config.globalProperties.$store = this;
  var useDevtools = this._devtools !== void 0 ? this._devtools : false;
  if (useDevtools) {
    addDevtools(app, this);
  }
};
prototypeAccessors.state.get = function() {
  return this._state.data;
};
prototypeAccessors.state.set = function(v) {
};
Store.prototype.commit = function commit(_type, _payload, _options) {
  var this$1$1 = this;
  var ref2 = unifyObjectStyle(_type, _payload, _options);
  var type = ref2.type;
  var payload = ref2.payload;
  var mutation = { type, payload };
  var entry = this._mutations[type];
  if (!entry) {
    return;
  }
  this._withCommit(function() {
    entry.forEach(function commitIterator(handler) {
      handler(payload);
    });
  });
  this._subscribers.slice().forEach(function(sub) {
    return sub(mutation, this$1$1.state);
  });
};
Store.prototype.dispatch = function dispatch(_type, _payload) {
  var this$1$1 = this;
  var ref2 = unifyObjectStyle(_type, _payload);
  var type = ref2.type;
  var payload = ref2.payload;
  var action = { type, payload };
  var entry = this._actions[type];
  if (!entry) {
    return;
  }
  try {
    this._actionSubscribers.slice().filter(function(sub) {
      return sub.before;
    }).forEach(function(sub) {
      return sub.before(action, this$1$1.state);
    });
  } catch (e) {
  }
  var result = entry.length > 1 ? Promise.all(entry.map(function(handler) {
    return handler(payload);
  })) : entry[0](payload);
  return new Promise(function(resolve, reject) {
    result.then(function(res) {
      try {
        this$1$1._actionSubscribers.filter(function(sub) {
          return sub.after;
        }).forEach(function(sub) {
          return sub.after(action, this$1$1.state);
        });
      } catch (e) {
      }
      resolve(res);
    }, function(error2) {
      try {
        this$1$1._actionSubscribers.filter(function(sub) {
          return sub.error;
        }).forEach(function(sub) {
          return sub.error(action, this$1$1.state, error2);
        });
      } catch (e) {
      }
      reject(error2);
    });
  });
};
Store.prototype.subscribe = function subscribe(fn, options) {
  return genericSubscribe(fn, this._subscribers, options);
};
Store.prototype.subscribeAction = function subscribeAction(fn, options) {
  var subs = typeof fn === "function" ? { before: fn } : fn;
  return genericSubscribe(subs, this._actionSubscribers, options);
};
Store.prototype.watch = function watch$1(getter, cb, options) {
  var this$1$1 = this;
  return watch(function() {
    return getter(this$1$1.state, this$1$1.getters);
  }, cb, Object.assign({}, options));
};
Store.prototype.replaceState = function replaceState(state) {
  var this$1$1 = this;
  this._withCommit(function() {
    this$1$1._state.data = state;
  });
};
Store.prototype.registerModule = function registerModule(path, rawModule, options) {
  if (options === void 0)
    options = {};
  if (typeof path === "string") {
    path = [path];
  }
  this._modules.register(path, rawModule);
  installModule(this, this.state, path, this._modules.get(path), options.preserveState);
  resetStoreState(this, this.state);
};
Store.prototype.unregisterModule = function unregisterModule(path) {
  var this$1$1 = this;
  if (typeof path === "string") {
    path = [path];
  }
  this._modules.unregister(path);
  this._withCommit(function() {
    var parentState = getNestedState(this$1$1.state, path.slice(0, -1));
    delete parentState[path[path.length - 1]];
  });
  resetStore(this);
};
Store.prototype.hasModule = function hasModule(path) {
  if (typeof path === "string") {
    path = [path];
  }
  return this._modules.isRegistered(path);
};
Store.prototype.hotUpdate = function hotUpdate(newOptions) {
  this._modules.update(newOptions);
  resetStore(this, true);
};
Store.prototype._withCommit = function _withCommit(fn) {
  var committing = this._committing;
  this._committing = true;
  fn();
  this._committing = committing;
};
Object.defineProperties(Store.prototype, prototypeAccessors);
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var convertV1 = {};
var parser$1 = {};
var util = {};
var __assign$1 = commonjsGlobal && commonjsGlobal.__assign || function() {
  __assign$1 = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p2 in s)
        if (Object.prototype.hasOwnProperty.call(s, p2))
          t[p2] = s[p2];
    }
    return t;
  };
  return __assign$1.apply(this, arguments);
};
var __values$1 = commonjsGlobal && commonjsGlobal.__values || function(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m)
    return m.call(o);
  if (o && typeof o.length === "number")
    return {
      next: function() {
        if (o && i >= o.length)
          o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read$1 = commonjsGlobal && commonjsGlobal.__read || function(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m)
    return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
      ar.push(r.value);
  } catch (error2) {
    e = { error: error2 };
  } finally {
    try {
      if (r && !r.done && (m = i["return"]))
        m.call(i);
    } finally {
      if (e)
        throw e.error;
    }
  }
  return ar;
};
var __spread$1 = commonjsGlobal && commonjsGlobal.__spread || function() {
  for (var ar = [], i = 0; i < arguments.length; i++)
    ar = ar.concat(__read$1(arguments[i]));
  return ar;
};
Object.defineProperty(util, "__esModule", { value: true });
util.mapObject = assetWalker_1 = util.assetWalker = normalizePath_1 = util.normalizePath = void 0;
var maxReplacementTrips = 10;
function normalizePath(str, replacements, fileTypes, lq) {
  var e_1, _a2;
  var oldStr = "";
  var i = 0;
  var replacementMap = new Map(Array.from(replacements.entries()).map(function(r) {
    return [new RegExp("{" + r[0] + "}", "g"), r[1]];
  }));
  while (oldStr !== str) {
    oldStr = str;
    if (++i > maxReplacementTrips)
      throw new Error("Maximum replacement recursion exceeded!");
    try {
      for (var _b = (e_1 = void 0, __values$1(replacementMap.entries())), _c = _b.next(); !_c.done; _c = _b.next()) {
        var replacement = _c.value;
        str = str.replace(replacement[0], replacement[1]);
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (_c && !_c.done && (_a2 = _b.return))
          _a2.call(_b);
      } finally {
        if (e_1)
          throw e_1.error;
      }
    }
    str = str.replace(/{format(:.*?:.*?)+}/gi, function(text) {
      text = text.slice(8, -1);
      var extensions = text.split(":");
      for (var i_1 = 0; i_1 < extensions.length; i_1 += 2) {
        if (fileTypes.has(extensions[i_1])) {
          return extensions[i_1 + 1];
        }
      }
      return "";
    });
    str = str.replace(/{lq:(.*?):(.*?)}/gi, function(text) {
      return text.slice(4, -1).split(":")[lq ? 0 : 1];
    });
  }
  return str;
}
var normalizePath_1 = util.normalizePath = normalizePath;
function assetWalker(standartContentPack, callback) {
  return {
    packId: standartContentPack.packId,
    packCredits: standartContentPack.packCredits,
    dependencies: standartContentPack.dependencies,
    characters: standartContentPack.characters.map(function(x) {
      return walkCharacter(x, callback);
    }),
    backgrounds: standartContentPack.backgrounds.map(function(x) {
      return walkBackground(x, callback);
    }),
    fonts: standartContentPack.fonts.map(function(x) {
      return walkFont(x, callback);
    }),
    poemStyles: __spread$1(standartContentPack.poemStyles),
    poemBackgrounds: standartContentPack.poemBackgrounds.map(function(x) {
      return walkPoemBackgrounds(x, callback);
    }),
    sprites: standartContentPack.sprites.map(function(x) {
      return walkSprite(x, callback);
    }),
    colors: standartContentPack.colors
  };
}
var assetWalker_1 = util.assetWalker = assetWalker;
function walkCharacter(character, callback) {
  return {
    id: character.id,
    label: character.label,
    chibi: character.chibi ? callback(character.chibi, "image") : void 0,
    heads: walkHeads(character.heads, callback),
    styleGroups: character.styleGroups.map(function(x) {
      return walkStyleGroup(x, callback);
    }),
    defaultScale: character.defaultScale,
    hd: character.hd,
    size: character.size,
    sdVersion: character.sdVersion
  };
}
function walkStyleGroup(styleGroup, callback) {
  return {
    id: styleGroup.id,
    styleComponents: styleGroup.styleComponents.map(function(x) {
      return walkStyleComponents(x, callback);
    }),
    styles: styleGroup.styles.map(function(style) {
      return walkStyle(style, callback);
    })
  };
}
function walkStyle(style, callback) {
  return {
    components: style.components,
    poses: style.poses.map(function(pose) {
      return walkPose(pose, callback);
    })
  };
}
function walkStyleComponents(component, callback) {
  return __assign$1(__assign$1({}, component), { variants: walkStyleClasses(component.variants, callback) });
}
function walkStyleClasses(style, callback) {
  var ret = {};
  for (var styleKey in style) {
    if (!style.hasOwnProperty(styleKey))
      continue;
    ret[styleKey] = callback(style[styleKey], "image");
  }
  return ret;
}
function walkPose(pose, callback) {
  var e_2, _a2;
  var newParts = {};
  try {
    for (var _b = __values$1(Object.keys(pose.positions)), _c = _b.next(); !_c.done; _c = _b.next()) {
      var partKey = _c.value;
      var partValue = pose.positions[partKey];
      newParts[partKey] = partValue.map(function(partPosition) {
        return partPosition.map(function(x) {
          return callback(x, "image");
        });
      });
    }
  } catch (e_2_1) {
    e_2 = { error: e_2_1 };
  } finally {
    try {
      if (_c && !_c.done && (_a2 = _b.return))
        _a2.call(_b);
    } finally {
      if (e_2)
        throw e_2.error;
    }
  }
  return {
    compatibleHeads: pose.compatibleHeads,
    id: pose.id,
    previewOffset: pose.previewOffset,
    previewSize: pose.previewSize,
    renderCommands: pose.renderCommands.map(function(x) {
      if (x.type === "image") {
        return {
          type: "image",
          offset: x.offset,
          images: x.images.map(function(y) {
            return callback(y, "image");
          })
        };
      } else {
        return x;
      }
    }),
    size: pose.size,
    scale: pose.scale,
    positions: newParts
  };
}
function walkHeads(heads, callback) {
  var newHeads = {};
  for (var headKeys in heads) {
    if (!heads.hasOwnProperty(headKeys))
      continue;
    newHeads[headKeys] = walkHeadCollection(heads[headKeys], callback);
  }
  return newHeads;
}
function walkHeadCollection(heads, callback) {
  return {
    previewOffset: heads.previewOffset,
    previewSize: heads.previewSize,
    variants: heads.variants.map(function(variant) {
      return variant.map(function(x) {
        return callback(x, "image");
      });
    })
  };
}
function walkBackground(background, callback) {
  return {
    id: background.id,
    label: background.label,
    variants: background.variants.map(function(variant) {
      return variant.map(function(x) {
        return callback(x, "image");
      });
    }),
    scaling: background.scaling,
    sdVersion: background.sdVersion
  };
}
function walkFont(font, callback) {
  return {
    id: font.id,
    label: font.label,
    files: font.files.map(function(x) {
      return callback(x, "font");
    })
  };
}
function walkPoemBackgrounds(poemStyle, callback) {
  return {
    id: poemStyle.id,
    fontColor: poemStyle.fontColor,
    label: poemStyle.label,
    images: poemStyle.images.map(function(x) {
      return callback(x, "image");
    }),
    sdVersion: poemStyle.sdVersion
  };
}
function walkSprite(sprite, callback) {
  return {
    id: sprite.id,
    label: sprite.label,
    variants: sprite.variants.map(function(variant) {
      return variant.map(function(x) {
        return callback(x, "image");
      });
    }),
    defaultScale: sprite.defaultScale,
    hd: sprite.hd,
    sdVersion: sprite.sdVersion
  };
}
function mapObject(obj, callback) {
  var ret = {};
  for (var key in obj) {
    if (!obj.hasOwnProperty(key))
      continue;
    ret[key] = callback(obj[key], key);
  }
  return ret;
}
util.mapObject = mapObject;
var __assign = commonjsGlobal && commonjsGlobal.__assign || function() {
  __assign = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p2 in s)
        if (Object.prototype.hasOwnProperty.call(s, p2))
          t[p2] = s[p2];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
Object.defineProperty(parser$1, "__esModule", { value: true });
parser$1.expandId = parser$1.normalizeStyleComponent = parser$1.normalizeColor = parser$1.normalizeBackground = parser$1.normalizeFont = parser$1.normalizePoemBackground = parser$1.normalizePoemStyles = parser$1.normalizeSprite = parser$1.mapNormalize = normalizeContentPack_1 = parser$1.normalizeContentPack = void 0;
var util_1 = util;
function normalizeContentPack(contentPack, paths) {
  var ctx = {
    paths,
    packId: contentPack.packId
  };
  var packFolder = joinNormalize$1("", contentPack.folder || "/", ctx);
  return {
    packId: contentPack.packId,
    packCredits: contentPack.packCredits,
    dependencies: contentPack.dependencies || [],
    characters: mapNormalize(normalizeCharacter$1, contentPack.characters, packFolder, ctx),
    backgrounds: mapNormalize(normalizeBackground, contentPack.backgrounds, packFolder, ctx),
    fonts: mapNormalize(normalizeFont, contentPack.fonts, packFolder, ctx),
    poemStyles: mapNormalize(normalizePoemStyles, contentPack.poemStyles, packFolder, ctx),
    poemBackgrounds: mapNormalize(normalizePoemBackground, contentPack.poemBackgrounds, packFolder, ctx),
    sprites: mapNormalize(normalizeSprite, contentPack.sprites, packFolder, ctx),
    colors: mapNormalize(normalizeColor, contentPack.colors, packFolder, ctx)
  };
}
var normalizeContentPack_1 = parser$1.normalizeContentPack = normalizeContentPack;
function mapNormalize(callback, collection, folder, ctx) {
  if (!collection)
    return [];
  return collection.map(function(element) {
    return callback(element, folder, ctx);
  });
}
parser$1.mapNormalize = mapNormalize;
function normalizeSprite(sprite, baseFolder, ctx) {
  var _a2;
  var spriteFolder = joinNormalize$1(baseFolder, sprite.folder, ctx);
  return {
    id: expandId(ctx.packId, sprite.id),
    label: sprite.label || sprite.variants[0][0],
    variants: sprite.variants.map(function(variant) {
      return normalizFileCollection(variant, spriteFolder, ctx);
    }),
    defaultScale: sprite.defaultScale || [1, 1],
    sdVersion: sprite.sdVersion,
    hd: (_a2 = sprite.hd) !== null && _a2 !== void 0 ? _a2 : null
  };
}
parser$1.normalizeSprite = normalizeSprite;
function normalizePoemStyles(poem) {
  return {
    label: poem.label,
    defaultFont: poem.defaultFont || "Aller",
    fontSize: poem.fontSize !== void 0 ? poem.fontSize : 30,
    letterSpacing: poem.letterSpacing !== void 0 ? poem.letterSpacing : 1,
    lineSpacing: poem.lineSpacing !== void 0 ? poem.lineSpacing : 1.2
  };
}
parser$1.normalizePoemStyles = normalizePoemStyles;
function normalizePoemBackground(poem, baseFolder, ctx) {
  var fontsFolder = joinNormalize$1(baseFolder, poem.folder, ctx);
  return {
    id: poem.id,
    label: poem.label,
    images: normalizFileCollection(poem.images, fontsFolder, ctx),
    fontColor: poem.fontColor || "black",
    sdVersion: poem.sdVersion
  };
}
parser$1.normalizePoemBackground = normalizePoemBackground;
function normalizeFont(font, baseFolder, ctx) {
  var fontsFolder = joinNormalize$1(baseFolder, font.folder, ctx);
  return {
    id: expandId(ctx.packId, font.id ? font.id : font.label ? font.label : font.files[0]),
    label: font.label ? font.label : font.id ? font.id : font.files[0],
    files: normalizFileCollection(font.files, fontsFolder, ctx)
  };
}
parser$1.normalizeFont = normalizeFont;
function normalizeBackground(background, baseFolder, ctx) {
  var _a2;
  var backgroundFolder = joinNormalize$1(baseFolder, background.folder, ctx);
  return {
    id: expandId(ctx.packId, background.id),
    label: background.label ? background.label : background.variants[0][0],
    variants: background.variants.map(function(collection) {
      return normalizFileCollection(collection, backgroundFolder, ctx);
    }),
    scaling: ["none", "strech", "cover"].includes((_a2 = background.scaling) === null || _a2 === void 0 ? void 0 : _a2.toLowerCase()) ? background.scaling.toLowerCase() : "cover",
    sdVersion: background.sdVersion
  };
}
parser$1.normalizeBackground = normalizeBackground;
function normalizeColor(color2) {
  return {
    label: color2.label || color2.color,
    color: color2.color
  };
}
parser$1.normalizeColor = normalizeColor;
function normalizFileCollection(collection, baseFolder, ctx) {
  return collection.map(function(sprite) {
    return joinNormalize$1(baseFolder, sprite, ctx);
  });
}
function normalizeCharacter$1(character, baseFolder, ctx) {
  var _a2, _b, _c;
  var charFolder = joinNormalize$1(baseFolder, character.folder, ctx);
  return {
    id: expandId(ctx.packId, character.id),
    label: character.label,
    chibi: character.chibi ? joinNormalize$1(charFolder, character.chibi, ctx) : void 0,
    heads: normalizeHeads$1(character.heads, charFolder, ctx),
    defaultScale: (_a2 = character.defaultScale) !== null && _a2 !== void 0 ? _a2 : [0.8, 0.8],
    size: (_b = character.size) !== null && _b !== void 0 ? _b : [960, 960],
    hd: (_c = character.hd) !== null && _c !== void 0 ? _c : false,
    sdVersion: character.sdVersion,
    styleGroups: mapNormalize(normalizeStyleGroup, character.styleGroups, charFolder, ctx)
  };
}
function normalizeStyleGroup(json, baseFolder, ctx) {
  var groupFolder = joinNormalize$1(baseFolder, json.folder, ctx);
  return {
    id: expandId(ctx.packId, json.id),
    styleComponents: mapNormalize(normalizeStyleComponent, json.styleComponents, groupFolder, ctx),
    styles: json.styles.map(function(x) {
      return normalizeStyle(x, groupFolder, ctx);
    })
  };
}
function normalizeStyle(json, baseFolder, ctx) {
  var styleFolder = joinNormalize$1(baseFolder, json.folder, ctx);
  var components = {};
  if (json.components) {
    for (var componentId in json.components) {
      if (!json.components.hasOwnProperty(componentId))
        continue;
      components[expandId(ctx.packId, componentId)] = json.components[componentId];
    }
  }
  return {
    components,
    poses: json.poses.map(function(pose) {
      return normalizePose(pose, styleFolder, ctx);
    })
  };
}
function normalizeStyleComponent(styleComponent, baseFolder, ctx) {
  return {
    id: expandId(ctx.packId, styleComponent.id),
    label: styleComponent.label,
    variants: normalizeParts$1(styleComponent.variants, baseFolder, ctx)
  };
}
parser$1.normalizeStyleComponent = normalizeStyleComponent;
function normalizeParts$1(styleClasses, baseFolder, ctx) {
  if (!styleClasses)
    return {};
  var ret = {};
  for (var styleKey in styleClasses) {
    if (!styleClasses.hasOwnProperty(styleKey))
      continue;
    ret[styleKey] = joinNormalize$1(baseFolder, styleClasses[styleKey], ctx);
  }
  return ret;
}
function normalizeHeads$1(heads, baseFolder, ctx) {
  var ret = {};
  if (!heads)
    return ret;
  for (var headGroupKey in heads) {
    if (!heads.hasOwnProperty(headGroupKey))
      continue;
    var headGroup = heads[headGroupKey];
    var newHeadGroup = void 0;
    if (headGroup instanceof Array) {
      newHeadGroup = {
        variants: normalizeVariants(headGroup, baseFolder, ctx),
        previewOffset: [290, 70],
        previewSize: [380, 380]
      };
    } else {
      var subFolder = joinNormalize$1(baseFolder, headGroup.folder, ctx);
      newHeadGroup = {
        variants: normalizeVariants(headGroup.variants, subFolder, ctx),
        previewOffset: headGroup.previewOffset || [290, 70],
        previewSize: headGroup.previewSize || [380, 380]
      };
    }
    ret[expandId(ctx.packId, headGroupKey)] = newHeadGroup;
  }
  return ret;
}
function normalizePose(pose, baseFolder, ctx) {
  var _a2, _b;
  var poseFolder = joinNormalize$1(baseFolder, pose.folder, ctx);
  return {
    compatibleHeads: ((_a2 = pose.compatibleHeads) === null || _a2 === void 0 ? void 0 : _a2.map(function(head2) {
      return expandId(ctx.packId, head2);
    })) || [],
    id: expandId(ctx.packId, pose.id),
    previewOffset: pose.previewOffset || [0, 0],
    previewSize: pose.previewSize || [960, 960],
    size: pose.size || [960, 960],
    scale: pose.scale || 0.8,
    positions: util_1.mapObject(pose.positions || {}, function(posePart) {
      return normalizeVariants(posePart, poseFolder, ctx);
    }),
    renderCommands: ((_b = pose.renderCommands) === null || _b === void 0 ? void 0 : _b.map(function(command) {
      return normalizePoseCommand(command, baseFolder, ctx);
    })) || [
      { type: "head", offset: [0, 0] },
      { type: "pose-part", part: "Left", offset: [0, 0] },
      { type: "pose-part", part: "Right", offset: [0, 0] },
      { type: "pose-part", part: "Variant", offset: [0, 0] }
    ]
  };
}
function normalizePoseCommand(poseCommand, folder, ctx) {
  if (poseCommand.type === "image") {
    var commandFolder = joinNormalize$1(folder, poseCommand.folder, ctx);
    return {
      type: "image",
      composite: poseCommand.composite,
      offset: poseCommand.offset || [0, 0],
      images: normalizeCollection(poseCommand.images, commandFolder, ctx)
    };
  } else {
    return __assign(__assign({}, poseCommand), { offset: poseCommand.offset || [0, 0] });
  }
}
function normalizeVariants(variants, folder, ctx) {
  return variants.map(function(collection) {
    return normalizeCollection(collection, folder, ctx);
  });
}
function normalizeCollection(collection, folder, ctx) {
  return collection.map(function(img) {
    return joinNormalize$1(folder, img, ctx);
  });
}
function isWebUrl$1(path) {
  return path.startsWith("blob:") || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("://");
}
function joinNormalize$1(base, sub, ctx) {
  if (!sub)
    return base;
  for (var path in ctx.paths) {
    if (sub.startsWith(path)) {
      return ctx.paths[path] + sub.slice(path.length);
    }
  }
  if (isWebUrl$1(sub))
    return sub;
  return base + sub;
}
function expandId(packId, objectId) {
  if (objectId.indexOf(":") !== -1)
    return objectId;
  return packId + ":" + objectId;
}
parser$1.expandId = expandId;
var __values = commonjsGlobal && commonjsGlobal.__values || function(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m)
    return m.call(o);
  if (o && typeof o.length === "number")
    return {
      next: function() {
        if (o && i >= o.length)
          o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = commonjsGlobal && commonjsGlobal.__read || function(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m)
    return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
      ar.push(r.value);
  } catch (error2) {
    e = { error: error2 };
  } finally {
    try {
      if (r && !r.done && (m = i["return"]))
        m.call(i);
    } finally {
      if (e)
        throw e.error;
    }
  }
  return ar;
};
var __spread = commonjsGlobal && commonjsGlobal.__spread || function() {
  for (var ar = [], i = 0; i < arguments.length; i++)
    ar = ar.concat(__read(arguments[i]));
  return ar;
};
Object.defineProperty(convertV1, "__esModule", { value: true });
convertV1.expandOrTranslateId = convert_1 = convertV1.convert = void 0;
var parser_1 = parser$1;
function convert(characterV1, paths, nsfw) {
  if (!characterV1.packId)
    throw new Error("");
  return {
    packId: characterV1.packId,
    packCredits: characterV1.packCredits ? [characterV1.packCredits] : [],
    dependencies: autoDependency(characterV1.id),
    backgrounds: [],
    fonts: [],
    poemStyles: [],
    poemBackgrounds: [],
    sprites: [],
    characters: [convertCharacter(characterV1, paths, nsfw)],
    colors: []
  };
}
var convert_1 = convertV1.convert = convert;
var translationTables = {
  "ddlc.monika": assocChar("dddg.buildin.base.monika", "ddlc.monika", {
    heads: ["straight", "sideways"],
    poses: ["normal", "leaned", "old", "glitch"],
    styleGroups: ["uniform", "old", "glitch"]
  }),
  "ddlc.natsuki": assocChar("dddg.buildin.base.natsuki", "ddlc.natsuki", {
    heads: ["straight", "straight_nsfw", "sideways", "turnedAway"],
    poses: ["normal", "crossed_arms", "vomit", "glitch"],
    styleGroups: ["uniform", "casual", "old"],
    extraPoseAssoc: [
      ["normal_causal", "normal"],
      ["crossed_arms_casual", "crossed_arms"]
    ],
    extraHeadAssoc: [["straight_nsfw", "straight"]]
  }),
  "ddlc.sayori": assocChar("dddg.buildin.sayori", "ddlc.sayori", {
    heads: ["straight", "sideways"],
    poses: ["normal", "sideways", "old", "glitch", "dead"],
    styleGroups: ["uniform", "casual", "old", "glitch", "hanging"],
    extraPoseAssoc: [["normal_casual", "normal"]]
  }),
  "ddlc.yuri": assocChar("dddg.buildin.yuri", "ddlc.yuri", {
    heads: ["straight", "sideways"],
    poses: ["normal", "sideways", "stabbing", "glitching", "dragon"],
    styleGroups: ["uniform", "casual", "glitch"],
    extraPoseAssoc: [
      ["normal_causal", "normal"],
      ["hairplay_casual", "hairplay"]
    ]
  }),
  "ddlc.fan.mc1": assocChar("dddg.buildin.mc_classic", "ddlc.fan.mc1", {
    heads: ["straight"],
    poses: ["normal"],
    styleGroups: [],
    extraStyleGroupAssoc: [["uniform-yellow", "uniform"]]
  }),
  "ddlc.fan.mc2": assocChar("dddg.buildin.mc", "ddlc.fan.mc2", {
    heads: ["straight", "straight_red"],
    poses: ["normal", "crossed_arms", "casual", "glitching", "dragon"],
    styleGroups: ["uniform", "casual"],
    extraPoseAssoc: [
      ["crossed_arms_casual", "crossed_arms"],
      ["crossed_arms_red", "crossed_arms"],
      ["normal_red", "normal"],
      ["casual_red", "casual"],
      ["casual_crossed_arms_red", "crossed_arms"]
    ],
    defaultStyleComponents: [
      {
        id: "eyes",
        label: "Eyes",
        variants: {
          yellow: "/parts/mc/yellow-eyes{ext}",
          red: "/parts/mc/red-eyes{ext}"
        }
      }
    ]
  }),
  "ddlc.fan.mc_chad": assocChar("dddg.buildin.mc_chad", "ddlc.fan.mc_chad", {
    heads: ["straight", "straight_closed", "straight_red"],
    poses: ["normal", "youknowihadto"],
    styleGroups: ["uniform", "casual"],
    extraPoseAssoc: [
      ["normal_casual", "normal"],
      ["youknowihadto_casual", "youknowihadto"],
      ["normal_red", "normal"],
      ["youknowihadto_red", "youknowihadto"],
      ["normal_casual_red", "normal"],
      ["youknowihadto_casual_red", "youknowihadto"]
    ],
    defaultStyleComponents: [
      {
        label: "Eyes",
        id: "eyes",
        variants: {
          yellow: "/parts/chad/yellow-eyes{ext}",
          red: "/parts/chad/red-eyes{ext}"
        }
      }
    ]
  }),
  "ddlc.fan.femc": assocChar("dddg.buildin.femc", "ddlc.fan.femc", {
    heads: [
      "straight",
      "straight_lh",
      "straight_closed",
      "straight_hetero",
      "straight_hetero_lh"
    ],
    poses: ["normal", "crossed_arms"],
    styleGroups: ["uniform", "casual", "uniform_strict"],
    extraPoseAssoc: [
      ["casual_normal", "normal"],
      ["casual_crossed_arms", "crossed_arms"],
      ["uniform_normal", "normal"],
      ["uniform_crossed_arms", "crossed_arms"],
      ["normal_long_hair", "normal"],
      ["crossed_arms_long_hair", "crossed_arms"],
      ["casual_normal_long_hair", "normal"],
      ["casual_crossed_arms_long_hair", "crossed_arms"],
      ["uniform_normal_long_hair", "normal"],
      ["uniform_crossed_arms_long_hair", "crossed_arms"],
      ["normal_hetero", "normal"],
      ["crossed_arms_hetero", "crossed_arms"],
      ["casual_normal_hetero", "normal"],
      ["casual_crossed_arms_hetero", "crossed_arms"],
      ["uniform_normal_hetero", "normal"],
      ["uniform_crossed_arms_hetero", "crossed_arms"],
      ["normal_long_hair_hetero", "normal"],
      ["crossed_arms_long_hair_hetero", "crossed_arms"],
      ["casual_normal_long_hair_hetero", "normal"],
      ["casual_crossed_arms_long_hair_hetero", "crossed_arms"],
      ["uniform_normal_long_hair_hetero", "normal"],
      ["uniform_crossed_arms_long_hair_hetero", "crossed_arms"]
    ],
    defaultStyleComponents: [
      {
        label: "Eyes",
        id: "eyes",
        variants: {
          yellow: "/parts/femc/yellow-eyes{ext}",
          hetero: "/parts/femc/hetero-eyes{ext}"
        }
      },
      {
        label: "Hairs",
        id: "hairs",
        variants: {
          sh: "/parts/femc/short-hair{ext}",
          lh: "/parts/femc/long-hair{ext}"
        }
      }
    ]
  }),
  "ddlc.fan.amy1": assocChar("dddg.buildin.amy1", "ddlc.fan.amy1", {
    heads: ["straight"],
    poses: ["normal", "crossed_arms"],
    styleGroups: ["uniform"]
  }),
  "ddlc.fan.amy2": assocChar("dddg.buildin.amy2", "ddlc.fan.amy2", {
    heads: ["straight", "straight_closed", "straight_red"],
    poses: [
      "normal",
      "folded_hands_up",
      "folded_hands_down",
      "hands_on_glasses"
    ],
    styleGroups: ["uniform", "casual"],
    extraPoseAssoc: [
      ["normal-casual", "normal"],
      ["folded_hands_up-casual", "folded_hands_up"],
      ["folded_hands_down-casual", "folded_hands_down"],
      ["hands_on_glasses-casual", "hands_on_glasses"]
    ]
  })
};
function autoDependency(v1CharId) {
  return [];
}
function convertCharacter(characterV1, paths, nsfw) {
  var ctx = {
    characterId: characterV1.id,
    packId: characterV1.packId,
    paths
  };
  return {
    id: expandOrTranslateId("character", characterV1.id, ctx),
    chibi: characterV1.chibi,
    label: characterV1.name,
    heads: convertHeads(characterV1.heads, ctx, nsfw),
    styleGroups: extractStyleGroups(characterV1, ctx, nsfw),
    defaultScale: [0.8, 0.8],
    size: [960, 960],
    hd: false
  };
}
function extractStyleGroups(characterV1, ctx, nsfw) {
  var e_1, _a2;
  var translation = translationTables[ctx.characterId];
  var baseStyleIds = [];
  var baseStyles = /* @__PURE__ */ new Map();
  var styleComponents = convertStyleComponents(characterV1, ctx);
  var useComponents = styleComponents.length === 0 ? translation && translation.defaultStyleComponents ? normalizeStyleComponets(translation.defaultStyleComponents, ctx) : [] : styleComponents;
  var styleNames = characterV1.poses.map(function(pose) {
    return pose.style;
  }).filter(function(value, index, ary) {
    return ary.indexOf(value) === index;
  });
  var styleDefinitions = new Map(characterV1.styles.map(function(style) {
    return [style.name, style];
  }));
  var _loop_1 = function(styleName2) {
    var e_2, _a3, e_3, _b;
    var style = styleDefinitions.get(styleName2);
    if (style && style.nsfw && !nsfw)
      return "continue";
    var reducedName = styleName2;
    var components = {};
    try {
      for (var useComponents_1 = (e_2 = void 0, __values(useComponents)), useComponents_1_1 = useComponents_1.next(); !useComponents_1_1.done; useComponents_1_1 = useComponents_1.next()) {
        var component = useComponents_1_1.value;
        try {
          for (var _c = (e_3 = void 0, __values(Object.keys(component.variants))), _d = _c.next(); !_d.done; _d = _c.next()) {
            var varKey = _d.value;
            var exp = new RegExp("-" + varKey + "\\b");
            if (reducedName.match(exp)) {
              components[component.id] = varKey;
              reducedName = reducedName.replace(exp, "");
              break;
            }
          }
        } catch (e_3_1) {
          e_3 = { error: e_3_1 };
        } finally {
          try {
            if (_d && !_d.done && (_b = _c.return))
              _b.call(_c);
          } finally {
            if (e_3)
              throw e_3.error;
          }
        }
      }
    } catch (e_2_1) {
      e_2 = { error: e_2_1 };
    } finally {
      try {
        if (useComponents_1_1 && !useComponents_1_1.done && (_a3 = useComponents_1.return))
          _a3.call(useComponents_1);
      } finally {
        if (e_2)
          throw e_2.error;
      }
    }
    reducedName = expandOrTranslateId("styleGroups", reducedName, ctx);
    var styleGroup = baseStyles.get(reducedName);
    if (!styleGroup) {
      styleGroup = {
        id: reducedName,
        styleComponents: useComponents,
        styles: []
      };
      baseStyles.set(reducedName, styleGroup);
      baseStyleIds.push(reducedName);
    }
    styleGroup.styles.push({
      components,
      poses: convertPoses(characterV1.poses.filter(function(pose) {
        return pose.style === styleName2;
      }), ctx, nsfw)
    });
  };
  try {
    for (var styleNames_1 = __values(styleNames), styleNames_1_1 = styleNames_1.next(); !styleNames_1_1.done; styleNames_1_1 = styleNames_1.next()) {
      var styleName = styleNames_1_1.value;
      _loop_1(styleName);
    }
  } catch (e_1_1) {
    e_1 = { error: e_1_1 };
  } finally {
    try {
      if (styleNames_1_1 && !styleNames_1_1.done && (_a2 = styleNames_1.return))
        _a2.call(styleNames_1);
    } finally {
      if (e_1)
        throw e_1.error;
    }
  }
  return baseStyleIds.map(function(id) {
    return baseStyles.get(id);
  });
}
function normalizeStyleComponets(styleComponents, ctx) {
  return parser_1.mapNormalize(parser_1.normalizeStyleComponent, styleComponents, "", {
    packId: ctx.packId,
    paths: ctx.paths
  });
}
function getRenderCommands(headInForeground, headAnchor) {
  if (headInForeground) {
    return [
      { type: "pose-part", offset: [0, 0], part: "Static" },
      { type: "pose-part", offset: [0, 0], part: "Variant" },
      { type: "pose-part", offset: [0, 0], part: "Left" },
      { type: "pose-part", offset: [0, 0], part: "Right" },
      { type: "head", offset: headAnchor }
    ];
  } else {
    return [
      { type: "head", offset: headAnchor },
      { type: "pose-part", offset: [0, 0], part: "Static" },
      { type: "pose-part", offset: [0, 0], part: "Variant" },
      { type: "pose-part", offset: [0, 0], part: "Left" },
      { type: "pose-part", offset: [0, 0], part: "Right" }
    ];
  }
}
function convertPoses(posesV1, ctx, nsfw) {
  return posesV1.map(function(poseV1) {
    return {
      compatibleHeads: poseV1.compatibleHeads.map(function(x) {
        return expandOrTranslateId("heads", x.toString(), ctx);
      }),
      id: expandOrTranslateId("poses", poseV1.name, ctx),
      renderCommands: getRenderCommands(poseV1.headInForeground, poseV1.headAnchor),
      previewOffset: poseV1.offset,
      previewSize: poseV1.size,
      size: [960, 960],
      scale: 0.8,
      positions: {
        Static: "static" in poseV1 ? [[poseV1.static]] : [],
        Left: "left" in poseV1 ? convertNsfwAbles(poseV1.left, nsfw) : [],
        Right: "right" in poseV1 ? convertNsfwAbles(poseV1.right, nsfw) : [],
        Variant: "variant" in poseV1 ? convertNsfwAbles(poseV1.variant, nsfw) : []
      }
    };
  });
}
function convertNsfwAbles(nsfwAbles, nsfw) {
  return nsfwAbles.filter(function(img) {
    return !img.nsfw || nsfw;
  }).map(function(img) {
    return [img.img];
  });
}
function convertHeads(headCollectionsV1, ctx, nsfw) {
  var e_4, _a2;
  var headCollectionsV2 = {};
  try {
    for (var _b = __values(Object.keys(headCollectionsV1)), _c = _b.next(); !_c.done; _c = _b.next()) {
      var key = _c.value;
      var headCollectionV1 = headCollectionsV1[key];
      if (headCollectionV1.nsfw && !nsfw)
        continue;
      headCollectionsV2[expandOrTranslateId("heads", key, ctx)] = {
        previewOffset: headCollectionV1.offset,
        previewSize: headCollectionV1.size,
        variants: headCollectionV1.all.filter(function(image) {
          return !image.nsfw || nsfw;
        }).map(function(img) {
          return [img.img];
        })
      };
    }
  } catch (e_4_1) {
    e_4 = { error: e_4_1 };
  } finally {
    try {
      if (_c && !_c.done && (_a2 = _b.return))
        _a2.call(_b);
    } finally {
      if (e_4)
        throw e_4.error;
    }
  }
  return headCollectionsV2;
}
function convertStyleComponents(characterV1, ctx) {
  var ret = [];
  var retVariants = [];
  if (Object.keys(characterV1.eyes).length > 0) {
    Object.keys(characterV1.eyes).forEach(function(eyeKey) {
      return retVariants.push(eyeKey);
    });
    ret.push({
      label: "Eyes",
      id: expandOrTranslateId("eyes", "eyes", ctx),
      variants: characterV1.eyes
    });
  }
  if (Object.keys(characterV1.hairs).length > 0) {
    Object.keys(characterV1.hairs).forEach(function(hairKey) {
      return retVariants.push(hairKey);
    });
    ret.push({
      label: "Hairs",
      id: expandOrTranslateId("hairs", "hairs", ctx),
      variants: characterV1.hairs
    });
  }
  return ret;
}
function associate(targetPack, ids) {
  return new Map(ids.map(function(id) {
    return [id, targetPack + ":" + id];
  }));
}
function assocChar(targetPack, character, input) {
  if (!input.extraHeadAssoc)
    input.extraHeadAssoc = [];
  else {
    input.extraHeadAssoc = input.extraHeadAssoc.map(function(extra) {
      return [
        extra[0],
        targetPack + ":" + extra[1]
      ];
    });
  }
  if (!input.extraPoseAssoc)
    input.extraPoseAssoc = [];
  else {
    input.extraPoseAssoc = input.extraPoseAssoc.map(function(extra) {
      return [
        extra[0],
        targetPack + ":" + extra[1]
      ];
    });
  }
  if (!input.extraStyleGroupAssoc)
    input.extraStyleGroupAssoc = [];
  else {
    input.extraStyleGroupAssoc = input.extraStyleGroupAssoc.map(function(extra) {
      return [
        extra[0],
        targetPack + ":" + extra[1]
      ];
    });
  }
  return {
    character: targetPack + ":" + character,
    eyes: targetPack + ":eyes",
    hairs: targetPack + ":hair",
    defaultStyleComponents: input.defaultStyleComponents || [],
    heads: new Map(__spread(associate(targetPack, input.heads), input.extraHeadAssoc)),
    poses: new Map(__spread(associate(targetPack, input.poses), input.extraPoseAssoc)),
    styleGroups: new Map(__spread(associate(targetPack, input.styleGroups), input.extraStyleGroupAssoc))
  };
}
function expandOrTranslateId(type, objectId, ctx) {
  var translation = translationTables[ctx.characterId];
  if (translation) {
    if (type === "character" || type === "hairs" || type === "eyes")
      return translation[type];
    var lookup = translation[type].get(objectId);
    if (lookup)
      return lookup;
  }
  return parser_1.expandId(ctx.packId, objectId);
}
convertV1.expandOrTranslateId = expandOrTranslateId;
var parser = {};
Object.defineProperty(parser, "__esModule", { value: true });
var normalizeCharacter_1 = parser.normalizeCharacter = void 0;
function normalizeCharacter(character, paths) {
  var charFolder = joinNormalize("", character.folder || "/", paths);
  var chibi = void 0;
  if (character.chibi) {
    chibi = joinNormalize(charFolder, character.chibi, paths);
  }
  if (chibi === void 0 && character.internalId) {
    chibi = (paths["/"] || "") + "chibis/" + character.internalId;
  }
  return {
    id: character.id,
    packId: character.packId,
    packCredits: character.packCredits,
    name: character.name,
    nsfw: !!character.nsfw,
    chibi,
    eyes: normalizeParts(character.eyes, charFolder, paths),
    hairs: normalizeParts(character.hairs, charFolder, paths),
    styles: normalizeStyles(character.styles),
    heads: normalizeHeads(character.heads, charFolder, paths),
    poses: normalizePoses(character.poses, charFolder, paths)
  };
}
normalizeCharacter_1 = parser.normalizeCharacter = normalizeCharacter;
function normalizeParts(styleClasses, baseFolder, paths) {
  if (!styleClasses)
    return {};
  var ret = {};
  for (var styleKey in styleClasses) {
    if (!styleClasses.hasOwnProperty(styleKey))
      continue;
    ret[styleKey] = joinNormalize(baseFolder, styleClasses[styleKey], paths);
  }
  return ret;
}
function normalizeHeads(heads, baseFolder, paths) {
  var ret = {};
  if (!heads)
    return ret;
  for (var headGroupKey in heads) {
    if (!heads.hasOwnProperty(headGroupKey))
      continue;
    var headGroup = heads[headGroupKey];
    var newHeadGroup = void 0;
    if (headGroup instanceof Array) {
      newHeadGroup = {
        all: normalizeNsfwAbleCollection(headGroup, baseFolder, paths),
        nsfw: false,
        offset: [290, 70],
        size: [380, 380]
      };
    } else {
      var subFolder = joinNormalize(baseFolder, headGroup.folder, paths);
      newHeadGroup = {
        all: normalizeNsfwAbleCollection(headGroup.all, subFolder, paths),
        nsfw: !!headGroup.nsfw,
        offset: headGroup.offset || [290, 70],
        size: headGroup.size || [380, 380]
      };
    }
    ret[headGroupKey] = newHeadGroup;
  }
  return ret;
}
function normalizePoses(poses, baseFolder, paths) {
  if (!poses)
    return [];
  return poses.map(function(pose) {
    var poseFolder = joinNormalize(baseFolder, pose.folder, paths);
    var ret = {
      compatibleHeads: pose.compatibleHeads || [],
      headAnchor: pose.headAnchor || [0, 0],
      headInForeground: !!pose.headInForeground,
      name: pose.name,
      nsfw: !!pose.nsfw,
      style: pose.style,
      offset: [0, 0],
      size: [960, 960]
    };
    if ("static" in pose) {
      ret.static = joinNormalize(poseFolder, pose.static, paths);
    } else if ("variant" in pose) {
      ret.variant = normalizeNsfwAbleCollection(pose.variant, poseFolder, paths);
    } else if ("left" in pose) {
      ret.left = normalizeNsfwAbleCollection(pose.left, poseFolder, paths);
      ret.right = normalizeNsfwAbleCollection(pose.right, poseFolder, paths);
    } else {
      throw new Error("Invalid pose");
    }
    return ret;
  });
}
function normalizeNsfwAbleCollection(collection, poseFolder, paths) {
  return collection.map(function(variant) {
    if (typeof variant === "string") {
      return {
        img: joinNormalize(poseFolder, variant, paths),
        nsfw: false
      };
    } else {
      return {
        img: joinNormalize(poseFolder, variant.img, paths),
        nsfw: variant.nsfw || false
      };
    }
  });
}
function normalizeStyles(styles) {
  if (!styles)
    return [];
  return styles.map(function(style) {
    return {
      name: style.name,
      label: style.label,
      nsfw: style.nsfw || false
    };
  });
}
function isWebUrl(path) {
  return path.startsWith("blob:") || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("://");
}
function joinNormalize(base, sub, paths) {
  if (!sub)
    return base;
  for (var path in paths) {
    if (sub.startsWith(path)) {
      return paths[path] + sub.slice(path.length);
    }
  }
  if (isWebUrl(sub))
    return sub;
  return base + sub;
}
var __async$G = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function baseDir(url) {
  return url.split("/").slice(0, -1).join("/") + "/";
}
const baseTypes = /* @__PURE__ */ new Set(["png", "gif", "bmp", "svg"]);
function getDefaultContentState() {
  return {
    contentPacks: [],
    current: {
      dependencies: [],
      backgrounds: [],
      characters: [],
      fonts: [],
      poemStyles: [],
      poemBackgrounds: [],
      sprites: [],
      colors: []
    }
  };
}
const content = {
  namespaced: true,
  state: getDefaultContentState(),
  mutations: {
    setContentPacks(state, packs) {
      state.contentPacks = packs;
    },
    setCurrentContent(state, content2) {
      state.current = content2;
    }
  },
  actions: {
    removeContentPacks({ commit: commit2, state, dispatch: dispatch2 }, packIds) {
      const oldState = JSON.parse(
        JSON.stringify(state.current)
      );
      const newContentPacks = sortByDependencies(
        state.contentPacks.filter((pack) => !packIds.has(pack.packId))
      );
      commit2("setContentPacks", newContentPacks);
      commit2(
        "setCurrentContent",
        newContentPacks.reduce(
          (acc, value) => mergeContentPacks(acc, value)
        )
      );
      dispatch2("panels/fixContentPackRemoval", oldState, { root: true });
    },
    replaceContentPack(_0, _1) {
      return __async$G(this, arguments, function* ({ commit: commit2, state }, action) {
        debugger;
        const convertedPack = action.processed ? action.contentPack : yield convertContentPack(action.contentPack);
        let packs = state.contentPacks;
        const packIdx = packs.findIndex(
          (pack) => pack.packId === action.contentPack.packId
        );
        if (packIdx === -1) {
          packs.push(convertedPack);
        } else {
          packs.splice(packIdx, 1, convertedPack);
        }
        packs = sortByDependencies(packs);
        commit2("setContentPacks", packs);
        commit2(
          "setCurrentContent",
          packs.reduce(
            (acc, value) => mergeContentPacks(acc, value)
          )
        );
      });
    },
    loadContentPacks(_0, _1) {
      return __async$G(this, arguments, function* ({ commit: commit2, state }, urls) {
        if (typeof urls === "string") {
          urls = [urls];
        }
        const contentPacks = yield Promise.all(
          urls.map((url) => __async$G(this, null, function* () {
            return yield loadContentPack(url);
          }))
        );
        const convertedPacks = yield Promise.all(
          contentPacks.map((contentPack) => convertContentPack(contentPack))
        );
        const existingPacks = new Set(state.contentPacks.map((x) => x.packId));
        let combinedPack = state.current;
        for (const convertedPack of convertedPacks) {
          for (const dependency of convertedPack.dependencies) {
            if (!existingPacks.has(dependency)) {
              throw new Error(
                `Missing dependency '${dependency}'. Refusing to install ${convertedPack.packId}`
              );
            }
          }
          combinedPack = mergeContentPacks(combinedPack, convertedPack);
        }
        commit2("setContentPacks", [...state.contentPacks, ...convertedPacks]);
        commit2("setCurrentContent", combinedPack);
        return contentPacks.map((x) => x.packId);
      });
    }
  },
  getters: {
    getCharacters({
      current
    }) {
      const ret = /* @__PURE__ */ new Map();
      for (const character of current.characters) {
        ret.set(character.id, character);
      }
      return ret;
    },
    getBackgrounds({ current }) {
      const ret = /* @__PURE__ */ new Map();
      for (const background of current.backgrounds) {
        ret.set(background.id, background);
      }
      return ret;
    }
  }
};
function loadContentPack(url) {
  return __async$G(this, null, function* () {
    const response = yield fetch(url);
    if (!response.ok) {
      throw new Error(
        `Could not load content pack. Server responded with: ${response.statusText}`
      );
    }
    let json;
    try {
      json = yield response.json();
    } catch (e) {
      throw new Error("Content pack is not valid json!");
    }
    try {
      const paths = {
        "./": baseDir(url),
        "/": baseDir(location.href) + "assets/"
      };
      if (json.version === "2.0") {
        return normalizeContentPack_1(json, paths);
      } else {
        return convert_1(
          normalizeCharacter_1(json, paths),
          paths,
          false
        );
      }
    } catch (e) {
      throw new Error("Content pack is not in a valid format!");
    }
  });
}
function sortByDependencies(packs) {
  return packs;
}
function convertContentPack(pack) {
  return __async$G(this, null, function* () {
    const types = new Set(
      (yield isWebPSupported()) ? ["webp", ...baseTypes] : baseTypes
    );
    const replacementMap = /* @__PURE__ */ new Map([
      ["ext", "{lq:.lq:}.{format:webp:webp:png:png}"]
    ]);
    return assetWalker_1(
      pack,
      (path, _type) => {
        var _a2;
        const hq = normalizePath_1(path, replacementMap, types, false);
        const lq = normalizePath_1(path, replacementMap, types, true);
        return {
          hq,
          lq,
          sourcePack: (_a2 = pack.packId) != null ? _a2 : "buildIn"
        };
      }
    );
  });
}
const screenWidth$1 = 1280;
const screenHeight$1 = 720;
const wheelInnerRadius$1 = 128;
const wheelWidth$1 = 32;
const WheelBackground$1 = "rgba(60,60,60,0.8)";
const positions$1 = [
  "4-1",
  "3-1",
  "2-1",
  "4-2",
  "center",
  "4-3",
  "2-2",
  "3-3",
  "4-4"
];
const sdCharacterScaleFactor$1 = 1;
const hdCharacterScaleFactor$1 = 1 / 1.5;
const CloseUpYOffset$1 = -74;
const BaseCharacterYPos$1 = 358;
const characterPositions$1 = [
  200,
  240,
  400,
  493,
  640,
  786,
  880,
  1040,
  1080
];
const Base$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  screenWidth: screenWidth$1,
  screenHeight: screenHeight$1,
  wheelInnerRadius: wheelInnerRadius$1,
  wheelWidth: wheelWidth$1,
  WheelBackground: WheelBackground$1,
  positions: positions$1,
  sdCharacterScaleFactor: sdCharacterScaleFactor$1,
  hdCharacterScaleFactor: hdCharacterScaleFactor$1,
  CloseUpYOffset: CloseUpYOffset$1,
  BaseCharacterYPos: BaseCharacterYPos$1,
  characterPositions: characterPositions$1
}, Symbol.toStringTag, { value: "Module" }));
var __defProp$H = Object.defineProperty;
var __defNormalProp$H = (obj, key, value) => key in obj ? __defProp$H(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$i = (obj, key, value) => {
  __defNormalProp$H(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _RGBAColor = class {
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    Object.freeze(this);
  }
  static validCss(str) {
    return this.validCssRgb(str) || this.validHex(str);
  }
  static fromCss(str) {
    if (this.validCssRgb(str)) {
      return this.fromCssRgb(str);
    }
    if (this.validHex(str)) {
      return this.fromHex(str);
    }
    throw new Error("Invalid RGB color format");
  }
  static validCssRgb(str) {
    return this.rgbEx.test(str) || this.rgbaEx.test(str);
  }
  static fromCssRgb(str) {
    if (!this.validCssRgb(str))
      throw new Error("Invalid RGB color format");
    const rgbHead = str.slice(0, -1);
    const parentesisPos = rgbHead.indexOf("(");
    const rbgTail = rgbHead.slice(parentesisPos + 1);
    const elements = rbgTail.split(",").map((x) => parseFloat(x.trim()));
    return new _RGBAColor(
      elements[0],
      elements[1],
      elements[2],
      elements.length === 4 ? elements[3] : 1
    );
  }
  static validHex(str) {
    return this.hexShortEx.test(str) || this.hexLongEx.test(str);
  }
  static fromHex(str) {
    if (!this.validHex(str))
      throw new Error("Invalid Hex color format");
    const hexTail = str.slice(1);
    if (hexTail.length === 3) {
      return new _RGBAColor(
        parseInt(hexTail[0] + hexTail[0], 16),
        parseInt(hexTail[1] + hexTail[1], 16),
        parseInt(hexTail[2] + hexTail[2], 16),
        1
      );
    }
    if (hexTail.length === 4) {
      return new _RGBAColor(
        parseInt(hexTail[0] + hexTail[0], 16),
        parseInt(hexTail[1] + hexTail[1], 16),
        parseInt(hexTail[2] + hexTail[2], 16),
        parseInt(hexTail[3] + hexTail[3], 16) / 255
      );
    }
    if (hexTail.length === 6) {
      return new _RGBAColor(
        parseInt(hexTail[0] + hexTail[1], 16),
        parseInt(hexTail[2] + hexTail[3], 16),
        parseInt(hexTail[4] + hexTail[5], 16),
        1
      );
    }
    if (hexTail.length === 8) {
      return new _RGBAColor(
        parseInt(hexTail[0] + hexTail[1], 16),
        parseInt(hexTail[2] + hexTail[3], 16),
        parseInt(hexTail[4] + hexTail[5], 16),
        parseInt(hexTail[6] + hexTail[7], 16) / 255
      );
    }
    throw new Error("Invalid Hex color format length");
  }
  toCss() {
    if (this.a > 1) {
      return `rgb(${this.r},${this.g},${this.b})`;
    }
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }
  toHex() {
    return `#${Math.round(this.r).toString(16).padStart(2, "0")}${Math.round(
      this.g
    ).toString(16).padStart(2, "0")}${Math.round(this.b).toString(16).padStart(2, "0")}${Math.round(this.a * 255).toString(16).padStart(2, "0")}`;
  }
  toRgb() {
    return this;
  }
  toHSL() {
    let { r, g, b } = this;
    const { a } = this;
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h2;
    let s;
    const l = (max + min) / 2;
    if (max === min) {
      h2 = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h2 = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h2 = (b - r) / d + 2;
          break;
        case b:
          h2 = (r - g) / d + 4;
          break;
      }
      h2 /= 6;
    }
    return new HSLAColor(h2, s, l, a);
  }
  get luminance() {
    return Math.sqrt(
      Math.pow(0.299 * (this.r / 255), 2) + Math.pow(0.587 * (this.g / 255), 2) + Math.pow(0.114 * (this.b / 255), 2)
    );
  }
};
let RGBAColor = _RGBAColor;
__publicField$i(RGBAColor, "rgbEx", /^rgb\((\d*?),(\d*?),(\d*?)\)$/i);
__publicField$i(RGBAColor, "rgbaEx", /^rgba\((\d{1,3}),(\d{1,3}),(\d{1,3}),([\d.]+)\)$/i);
__publicField$i(RGBAColor, "hexShortEx", /^#[0-9A-F]{3,4}$/i);
__publicField$i(RGBAColor, "hexLongEx", /^#[0-9A-F]{6,8}$/i);
class HSLAColor {
  constructor(h2, s, l, a) {
    this.h = h2;
    this.s = s;
    this.l = l;
    this.a = a;
    Object.freeze(this);
  }
  toCss() {
    if (this.a >= 1) {
      return `hsl(${this.h}, ${this.s}, ${this.l})`;
    }
    return `hsla(${this.h}, ${this.s}, ${this.l}, ${this.a})`;
  }
  shift(deltas) {
    let { h: h2, s, l, a } = this;
    h2 += deltas.h;
    if (h2 >= 1) {
      h2 -= 1;
    } else if (h2 < 0) {
      h2 += 1;
    }
    if (s + deltas.s > 1) {
      s -= deltas.s;
    } else {
      s += deltas.s;
      if (s < 0) {
        s = 0;
      }
    }
    if (l + deltas.l > 1 || l + deltas.l < 0) {
      l -= deltas.l;
    } else {
      l += deltas.l;
    }
    if (a + deltas.a > 1 || a + deltas.a < 0) {
      a -= deltas.a;
    } else {
      a += deltas.a;
    }
    return new HSLAColor(h2, s, l, a);
  }
  toRgb() {
    const { h: h2, s, l, a } = this;
    let r;
    let g;
    let b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p2 = 2 * l - q;
      r = HSLAColor.hue2rgb(p2, q, h2 + 1 / 3);
      g = HSLAColor.hue2rgb(p2, q, h2);
      b = HSLAColor.hue2rgb(p2, q, h2 - 1 / 3);
    }
    return new RGBAColor(
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255),
      a
    );
  }
  toHSL() {
    return this;
  }
  static hue2rgb(p2, q, t) {
    if (t < 0)
      t += 1;
    if (t > 1)
      t -= 1;
    if (t < 1 / 6)
      return p2 + (q - p2) * 6 * t;
    if (t < 1 / 2)
      return q;
    if (t < 2 / 3)
      return p2 + (q - p2) * (2 / 3 - t) * 6;
    return p2;
  }
}
const nameboxTextOutlineDelta$3 = new HSLAColor(
  -0.03065134099616873,
  -0.5714285714285714,
  -0.29607843137254897,
  0
);
const ChoiceButtonColor$1 = "#ffe6f4";
const ChoiceButtonBorderColor$1 = "#ffbde1";
const ChoiceButtonWidth$1 = 420;
const ChoiceSpacing$1 = 22;
const ChoiceX$1 = 640;
const ChoiceYOffset$1 = 270;
const ChoicePadding$1 = 7;
const Outline$1 = 3;
const ChoiceOuterPadding$1 = Math.ceil(Outline$1 / 2);
const ChoiceY$1 = (screenHeight$1 - ChoiceYOffset$1) / 2;
const ChoiceTextStyle$1 = {
  alpha: 1,
  color: "black",
  fontName: "aller",
  fontSize: 24,
  isBold: false,
  isItalic: false,
  isStrikethrough: false,
  isUnderlined: false,
  letterSpacing: 0,
  lineSpacing: 1,
  strokeColor: "",
  strokeWidth: 0
};
const Choices$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  nameboxTextOutlineDelta: nameboxTextOutlineDelta$3,
  ChoiceButtonColor: ChoiceButtonColor$1,
  ChoiceButtonBorderColor: ChoiceButtonBorderColor$1,
  ChoiceButtonWidth: ChoiceButtonWidth$1,
  ChoiceSpacing: ChoiceSpacing$1,
  ChoiceX: ChoiceX$1,
  ChoiceYOffset: ChoiceYOffset$1,
  ChoicePadding: ChoicePadding$1,
  Outline: Outline$1,
  ChoiceOuterPadding: ChoiceOuterPadding$1,
  ChoiceY: ChoiceY$1,
  ChoiceTextStyle: ChoiceTextStyle$1
}, Symbol.toStringTag, { value: "Module" }));
const textboxDefaultColor$1 = "#ffa8d2";
const controlsDefaultColor$1 = "#552222";
const nameboxDefaultColor$1 = "#ffeef6";
const nameboxStrokeDefaultColor$1 = "#bb5599";
const nameboxTextOutlineDelta$2 = new HSLAColor(
  -0.03065134099616873,
  -0.5714285714285714,
  -0.29607843137254897,
  0
);
const nameboxBackgroundDelta$1 = new HSLAColor(
  0.002028397565922768,
  0,
  0.13725490196078438,
  0
);
const nameboxGradientMiddleStopPosition$1 = 0.82;
const nameboxGradientEndDelta$1 = new HSLAColor(
  -0.004901960784313708,
  -0.8599999999999999,
  -0.16274509803921566,
  0
);
const nameboxRounding$1 = 12;
const nameboxRoundingBuffer$1 = 1.5;
const textboxRounding$1 = 12;
const textboxRoundingBuffer$1 = 1.5;
const nameColorThreshold$1 = 0.6;
const controlColorDelta$1 = new HSLAColor(
  0.08045977011494243,
  -0.5714285714285714,
  -0.5960784313725489,
  0
);
const controlDisableColorDelta$1 = new HSLAColor(
  0,
  -0.14285714285714296,
  0.3,
  0
);
const dotColorDelta$1 = new HSLAColor(
  0.004269293924466178,
  -0.01869158878504662,
  -0.039215686274509665,
  0
);
const dotRadius$1 = 9.5;
const dotPatternSize$1 = 47;
const textboxOutlineColorDelta$1 = new HSLAColor(
  0.0023347701149424305,
  0,
  0.10784313725490202,
  0
);
const textboxOutlineWidth$1 = 3;
const CustomTBConstants$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  textboxDefaultColor: textboxDefaultColor$1,
  controlsDefaultColor: controlsDefaultColor$1,
  nameboxDefaultColor: nameboxDefaultColor$1,
  nameboxStrokeDefaultColor: nameboxStrokeDefaultColor$1,
  nameboxTextOutlineDelta: nameboxTextOutlineDelta$2,
  nameboxBackgroundDelta: nameboxBackgroundDelta$1,
  nameboxGradientMiddleStopPosition: nameboxGradientMiddleStopPosition$1,
  nameboxGradientEndDelta: nameboxGradientEndDelta$1,
  nameboxRounding: nameboxRounding$1,
  nameboxRoundingBuffer: nameboxRoundingBuffer$1,
  textboxRounding: textboxRounding$1,
  textboxRoundingBuffer: textboxRoundingBuffer$1,
  nameColorThreshold: nameColorThreshold$1,
  controlColorDelta: controlColorDelta$1,
  controlDisableColorDelta: controlDisableColorDelta$1,
  dotColorDelta: dotColorDelta$1,
  dotRadius: dotRadius$1,
  dotPatternSize: dotPatternSize$1,
  textboxOutlineColorDelta: textboxOutlineColorDelta$1,
  textboxOutlineWidth: textboxOutlineWidth$1
}, Symbol.toStringTag, { value: "Module" }));
var __defProp$G = Object.defineProperty;
var __defProps$n = Object.defineProperties;
var __getOwnPropDescs$n = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$r = Object.getOwnPropertySymbols;
var __hasOwnProp$r = Object.prototype.hasOwnProperty;
var __propIsEnum$r = Object.prototype.propertyIsEnumerable;
var __defNormalProp$G = (obj, key, value) => key in obj ? __defProp$G(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$r = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$r.call(b, prop))
      __defNormalProp$G(a, prop, b[prop]);
  if (__getOwnPropSymbols$r)
    for (var prop of __getOwnPropSymbols$r(b)) {
      if (__propIsEnum$r.call(b, prop))
        __defNormalProp$G(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$n = (a, b) => __defProps$n(a, __getOwnPropDescs$n(b));
const TextBoxWidth$1 = 816;
const TextBoxCorruptedWidth$1 = 900;
const TextBoxHeight$1 = 146;
const TextBoxKerning$1 = 0;
const TextBoxLineHeight$1 = 29;
const TextBoxCorruptedKerning$1 = 8;
const TextBoxTextXOffset$1 = 38;
const TextBoxTextYOffset$1 = 44;
const TextBoxBottomSpacing$1 = 6;
const HdSpacing = 93;
const HdSideMargin = 404;
const TextBoxTextCorruptedXOffset$1 = 9;
const TextBoxTextCorruptedYOffset$1 = 9;
const NameboxHeight$1 = 39;
const NameboxWidth$1 = 168;
const NameboxXOffset$1 = 34;
const NameboxTextYOffset$1 = 29;
const ControlsYBottomOffset$1 = 12;
const ControlsXHistoryOffset$1 = -126;
const ControlsXSkipOffset$1 = -72;
const ControlsXStuffOffset$1 = -38;
const ArrowXRightOffset$1 = 30.75;
const ArrowYBottomOffset$1 = 26;
const GlowRX$1 = 426;
const GlowRY$1 = 58;
const BaseTextStyle$1 = {
  alpha: 1,
  color: "black",
  fontName: "aller",
  fontSize: 24,
  isBold: false,
  isItalic: false,
  isStrikethrough: false,
  isUnderlined: false,
  letterSpacing: 0,
  lineSpacing: 1,
  strokeColor: "",
  strokeWidth: 0
};
const NameboxTextStyle$1 = __spreadProps$n(__spreadValues$r({}, BaseTextStyle$1), {
  fontName: "riffic",
  fontSize: 24,
  strokeColor: nameboxStrokeDefaultColor$1,
  strokeWidth: 6,
  color: "white",
  letterSpacing: 1
});
const ControlsTextStyle$1 = {
  align: "left",
  font: "13px aller",
  fill: {
    style: "#522"
  }
};
const ControlsTextDisabledStyle$1 = __spreadProps$n(__spreadValues$r({}, ControlsTextStyle$1), {
  fill: {
    style: "#a66"
  }
});
const TextBoxCorruptedStyle$1 = {
  align: "left",
  font: "24px verily",
  outline: {
    style: "#000",
    width: 20
  },
  fill: {
    style: "#fff"
  }
};
const TextBoxStyle$1 = {
  alpha: 1,
  color: "#ffffff",
  fontName: "aller",
  fontSize: 24,
  isBold: false,
  isItalic: false,
  isStrikethrough: false,
  isUnderlined: false,
  letterSpacing: 0,
  strokeColor: "#523140",
  strokeWidth: 4,
  lineSpacing: 1.2
};
const TextBoxX$1 = screenWidth$1 / 2 - TextBoxWidth$1 / 2;
const TextBoxCorruptedX$1 = screenWidth$1 / 2 - TextBoxCorruptedWidth$1 / 2;
const TextBoxTextX$1 = TextBoxX$1 + TextBoxTextXOffset$1;
const NameboxX$1 = TextBoxX$1 + NameboxXOffset$1;
const NameboxTextX$1 = NameboxX$1 + NameboxWidth$1 / 2;
const ControlsXHistory$1 = TextBoxX$1 + ControlsXHistoryOffset$1;
const ControlsXSkip$1 = TextBoxX$1 + ControlsXSkipOffset$1;
const ControlsXStuff$1 = TextBoxX$1 + ControlsXStuffOffset$1;
const DefaultTextboxStyle$1 = "normal";
const TextBox$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TextBoxWidth: TextBoxWidth$1,
  TextBoxCorruptedWidth: TextBoxCorruptedWidth$1,
  TextBoxHeight: TextBoxHeight$1,
  TextBoxKerning: TextBoxKerning$1,
  TextBoxLineHeight: TextBoxLineHeight$1,
  TextBoxCorruptedKerning: TextBoxCorruptedKerning$1,
  TextBoxTextXOffset: TextBoxTextXOffset$1,
  TextBoxTextYOffset: TextBoxTextYOffset$1,
  TextBoxBottomSpacing: TextBoxBottomSpacing$1,
  HdSpacing,
  HdSideMargin,
  TextBoxTextCorruptedXOffset: TextBoxTextCorruptedXOffset$1,
  TextBoxTextCorruptedYOffset: TextBoxTextCorruptedYOffset$1,
  NameboxHeight: NameboxHeight$1,
  NameboxWidth: NameboxWidth$1,
  NameboxXOffset: NameboxXOffset$1,
  NameboxTextYOffset: NameboxTextYOffset$1,
  ControlsYBottomOffset: ControlsYBottomOffset$1,
  ControlsXHistoryOffset: ControlsXHistoryOffset$1,
  ControlsXSkipOffset: ControlsXSkipOffset$1,
  ControlsXStuffOffset: ControlsXStuffOffset$1,
  ArrowXRightOffset: ArrowXRightOffset$1,
  ArrowYBottomOffset: ArrowYBottomOffset$1,
  GlowRX: GlowRX$1,
  GlowRY: GlowRY$1,
  BaseTextStyle: BaseTextStyle$1,
  NameboxTextStyle: NameboxTextStyle$1,
  ControlsTextStyle: ControlsTextStyle$1,
  ControlsTextDisabledStyle: ControlsTextDisabledStyle$1,
  TextBoxCorruptedStyle: TextBoxCorruptedStyle$1,
  TextBoxStyle: TextBoxStyle$1,
  TextBoxX: TextBoxX$1,
  TextBoxCorruptedX: TextBoxCorruptedX$1,
  TextBoxTextX: TextBoxTextX$1,
  NameboxX: NameboxX$1,
  NameboxTextX: NameboxTextX$1,
  ControlsXHistory: ControlsXHistory$1,
  ControlsXSkip: ControlsXSkip$1,
  ControlsXStuff: ControlsXStuff$1,
  DefaultTextboxStyle: DefaultTextboxStyle$1
}, Symbol.toStringTag, { value: "Module" }));
var __defProp$F = Object.defineProperty;
var __defProps$m = Object.defineProperties;
var __getOwnPropDescs$m = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$q = Object.getOwnPropertySymbols;
var __hasOwnProp$q = Object.prototype.hasOwnProperty;
var __propIsEnum$q = Object.prototype.propertyIsEnumerable;
var __defNormalProp$F = (obj, key, value) => key in obj ? __defProp$F(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$q = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$q.call(b, prop))
      __defNormalProp$F(a, prop, b[prop]);
  if (__getOwnPropSymbols$q)
    for (var prop of __getOwnPropSymbols$q(b)) {
      if (__propIsEnum$q.call(b, prop))
        __defNormalProp$F(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$m = (a, b) => __defProps$m(a, __getOwnPropDescs$m(b));
const NotificationBackgroundColor$1 = "#ffe6f4";
const NotificationBorderColor$1 = "#ffbde1";
const NotificationBackdropColor$1 = "rgba(255,255,255,0.6)";
const NotificationPadding$1 = 40;
const NotificationSpacing$1 = 30;
const NotificationOkTextStyle$1 = __spreadProps$m(__spreadValues$q({}, BaseTextStyle$1), {
  fontName: "riffic",
  fontSize: 24,
  strokeColor: nameboxStrokeDefaultColor$1,
  strokeWidth: 8,
  letterSpacing: 1,
  color: "white"
});
const NotificationTextStyle$1 = {
  alpha: 1,
  color: "black",
  fontName: "aller",
  fontSize: 24,
  isBold: false,
  isItalic: false,
  isStrikethrough: false,
  isUnderlined: false,
  letterSpacing: 0,
  lineSpacing: 1.2,
  strokeColor: "",
  strokeWidth: 0
};
const Notification$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NotificationBackgroundColor: NotificationBackgroundColor$1,
  NotificationBorderColor: NotificationBorderColor$1,
  NotificationBackdropColor: NotificationBackdropColor$1,
  NotificationPadding: NotificationPadding$1,
  NotificationSpacing: NotificationSpacing$1,
  NotificationOkTextStyle: NotificationOkTextStyle$1,
  NotificationTextStyle: NotificationTextStyle$1
}, Symbol.toStringTag, { value: "Module" }));
var __defProp$E = Object.defineProperty;
var __defProps$l = Object.defineProperties;
var __getOwnPropDescs$l = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$p = Object.getOwnPropertySymbols;
var __hasOwnProp$p = Object.prototype.hasOwnProperty;
var __propIsEnum$p = Object.prototype.propertyIsEnumerable;
var __defNormalProp$E = (obj, key, value) => key in obj ? __defProp$E(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$p = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$p.call(b, prop))
      __defNormalProp$E(a, prop, b[prop]);
  if (__getOwnPropSymbols$p)
    for (var prop of __getOwnPropSymbols$p(b)) {
      if (__propIsEnum$p.call(b, prop))
        __defNormalProp$E(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$l = (a, b) => __defProps$l(a, __getOwnPropDescs$l(b));
const poemBackgrounds$1 = [
  { name: "Normal paper", file: "poem.jpg" },
  { name: "Lightly soiled paper", file: "poem_y1.jpg" },
  { name: "Heavily soiled paper", file: "poem_y2.jpg" },
  { name: "Console", file: "internal:console" },
  { name: "Transparent", file: "internal:transparent" }
];
const defaultPoemBackground$1 = 0;
const defaultPoemStyle$1 = 0;
const defaultX$1 = screenWidth$1 / 2;
const defaultY$1 = screenHeight$1 / 2;
const poemTopPadding$1 = 33;
const poemBottomPadding$1 = 100;
const poemPadding$1 = 30;
const defaultPoemWidth$1 = 800;
const defaultPoemHeight$1 = 720;
const backgroundScale$1 = sdCharacterScaleFactor$1;
const consoleBackgroundColor$1 = "#333333bf";
const consoleWidth$1 = 480;
const consoleHeight$1 = 180;
const defaultConsoleBackground$1 = 3;
const defaultConsoleStyle$1 = 7;
const BasePoemStyle$1 = {
  alpha: 1,
  color: "black",
  isBold: false,
  isItalic: false,
  isStrikethrough: false,
  isUnderlined: false,
  letterSpacing: 0,
  lineSpacing: 1.2,
  strokeColor: "",
  strokeWidth: 0,
  fontName: "aller",
  fontSize: 12
};
const poemTextStyles$1 = [
  __spreadProps$l(__spreadValues$p({}, BasePoemStyle$1), {
    name: "Sayori",
    fontName: "hashtag",
    fontSize: 34,
    lineSpacing: 1.05,
    letterSpacing: 0
  }),
  __spreadProps$l(__spreadValues$p({}, BasePoemStyle$1), {
    name: "Natsuki",
    fontName: "ammy_handwriting",
    fontSize: 28
  }),
  __spreadProps$l(__spreadValues$p({}, BasePoemStyle$1), {
    name: "Monika",
    fontName: "journal",
    fontSize: 34
  }),
  __spreadProps$l(__spreadValues$p({}, BasePoemStyle$1), {
    name: "Yuri",
    fontName: "jp_hand_slanted",
    lineSpacing: 1.5,
    fontSize: 32
  }),
  __spreadProps$l(__spreadValues$p({}, BasePoemStyle$1), {
    name: "Yuri Act 2",
    fontName: "damagrafik_script",
    fontSize: 18,
    letterSpacing: -8
  }),
  __spreadProps$l(__spreadValues$p({}, BasePoemStyle$1), {
    name: "Yuri Unused",
    fontName: "as_i_lay_dying",
    fontSize: 40
  }),
  __spreadProps$l(__spreadValues$p({}, BasePoemStyle$1), {
    name: "MC",
    fontName: "halogen",
    fontSize: 30,
    lineSpacing: 1.53
  }),
  __spreadProps$l(__spreadValues$p({}, BasePoemStyle$1), {
    name: "Console",
    fontName: "f25_bank_printer",
    fontSize: 18,
    color: "white",
    lineSpacing: 1.1
  })
];
const Poem$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  poemBackgrounds: poemBackgrounds$1,
  defaultPoemBackground: defaultPoemBackground$1,
  defaultPoemStyle: defaultPoemStyle$1,
  defaultX: defaultX$1,
  defaultY: defaultY$1,
  poemTopPadding: poemTopPadding$1,
  poemBottomPadding: poemBottomPadding$1,
  poemPadding: poemPadding$1,
  defaultPoemWidth: defaultPoemWidth$1,
  defaultPoemHeight: defaultPoemHeight$1,
  backgroundScale: backgroundScale$1,
  consoleBackgroundColor: consoleBackgroundColor$1,
  consoleWidth: consoleWidth$1,
  consoleHeight: consoleHeight$1,
  defaultConsoleBackground: defaultConsoleBackground$1,
  defaultConsoleStyle: defaultConsoleStyle$1,
  poemTextStyles: poemTextStyles$1
}, Symbol.toStringTag, { value: "Module" }));
const Ddlc = {
  Base: Base$1,
  Choices: Choices$1,
  Notification: Notification$2,
  Poem: Poem$2,
  TextBox: TextBox$2,
  TextBoxCustom: CustomTBConstants$1
};
const screenWidth = 1920;
const screenHeight = 1080;
const wheelInnerRadius = 128;
const wheelWidth = 32;
const WheelBackground = "rgba(60,60,60,0.8)";
const positions = [
  "4-1",
  "3-1",
  "2-1",
  "4-2",
  "center",
  "4-3",
  "2-2",
  "3-3",
  "4-4"
];
const sdCharacterScaleFactor = 1.5;
const hdCharacterScaleFactor = 1;
const CloseUpYOffset = -111;
const BaseCharacterYPos = 537;
const characterPositions = [
  300,
  360,
  600,
  740,
  960,
  1180,
  1320,
  1560,
  1620
];
const Base = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  screenWidth,
  screenHeight,
  wheelInnerRadius,
  wheelWidth,
  WheelBackground,
  positions,
  sdCharacterScaleFactor,
  hdCharacterScaleFactor,
  CloseUpYOffset,
  BaseCharacterYPos,
  characterPositions
}, Symbol.toStringTag, { value: "Module" }));
const nameboxTextOutlineDelta$1 = new HSLAColor(
  -0.03065134099616873,
  -0.5714285714285714,
  -0.29607843137254897,
  0
);
const ChoiceButtonColor = "#ffe6f4";
const ChoiceButtonBorderColor = "#ffbde1";
const ChoiceButtonWidth = 630;
const ChoiceSpacing = 33;
const ChoiceX = 960;
const ChoiceYOffset = 405;
const ChoicePadding = 10.5;
const Outline = 4.5;
const ChoiceOuterPadding = Math.ceil(Outline / 2);
const ChoiceY = (screenHeight - ChoiceYOffset) / 2;
const ChoiceTextStyle = {
  alpha: 1,
  color: "black",
  fontName: "aller",
  fontSize: 36,
  isBold: false,
  isItalic: false,
  isStrikethrough: false,
  isUnderlined: false,
  letterSpacing: 0,
  lineSpacing: 1,
  strokeColor: "",
  strokeWidth: 0
};
const Choices = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  nameboxTextOutlineDelta: nameboxTextOutlineDelta$1,
  ChoiceButtonColor,
  ChoiceButtonBorderColor,
  ChoiceButtonWidth,
  ChoiceSpacing,
  ChoiceX,
  ChoiceYOffset,
  ChoicePadding,
  Outline,
  ChoiceOuterPadding,
  ChoiceY,
  ChoiceTextStyle
}, Symbol.toStringTag, { value: "Module" }));
const textboxDefaultColor = "#ffa8d2";
const controlsDefaultColor = "#552222";
const nameboxDefaultColor = "#ffeef6";
const nameboxStrokeDefaultColor = "#bb5599";
const nameboxTextOutlineDelta = new HSLAColor(
  -0.03065134099616873,
  -0.5714285714285714,
  -0.29607843137254897,
  0
);
const nameboxBackgroundDelta = new HSLAColor(
  0.002028397565922768,
  0,
  0.13725490196078438,
  0
);
const nameboxGradientMiddleStopPosition = 0.82;
const nameboxGradientEndDelta = new HSLAColor(
  -0.004901960784313708,
  -0.8599999999999999,
  -0.16274509803921566,
  0
);
const nameboxRounding = 15;
const nameboxRoundingBuffer = 1.5;
const textboxRounding = 19;
const textboxRoundingBuffer = 1.5;
const nameColorThreshold = 0.6;
const controlColorDelta = new HSLAColor(
  0.08045977011494243,
  -0.5714285714285714,
  -0.5960784313725489,
  0
);
const controlDisableColorDelta = new HSLAColor(
  0,
  -0.14285714285714296,
  0.3,
  0
);
const dotColorDelta = new HSLAColor(
  0.004269293924466178,
  -0.01869158878504662,
  -0.039215686274509665,
  0
);
const dotRadius = 9.5 * 1.5;
const dotPatternSize = 47 * 1.5;
const textboxOutlineColorDelta = new HSLAColor(
  0.0023347701149424305,
  0,
  0.10784313725490202,
  0
);
const textboxOutlineWidth = 5;
const CustomTBConstants = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  textboxDefaultColor,
  controlsDefaultColor,
  nameboxDefaultColor,
  nameboxStrokeDefaultColor,
  nameboxTextOutlineDelta,
  nameboxBackgroundDelta,
  nameboxGradientMiddleStopPosition,
  nameboxGradientEndDelta,
  nameboxRounding,
  nameboxRoundingBuffer,
  textboxRounding,
  textboxRoundingBuffer,
  nameColorThreshold,
  controlColorDelta,
  controlDisableColorDelta,
  dotColorDelta,
  dotRadius,
  dotPatternSize,
  textboxOutlineColorDelta,
  textboxOutlineWidth
}, Symbol.toStringTag, { value: "Module" }));
var __defProp$D = Object.defineProperty;
var __defProps$k = Object.defineProperties;
var __getOwnPropDescs$k = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$o = Object.getOwnPropertySymbols;
var __hasOwnProp$o = Object.prototype.hasOwnProperty;
var __propIsEnum$o = Object.prototype.propertyIsEnumerable;
var __defNormalProp$D = (obj, key, value) => key in obj ? __defProp$D(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$o = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$o.call(b, prop))
      __defNormalProp$D(a, prop, b[prop]);
  if (__getOwnPropSymbols$o)
    for (var prop of __getOwnPropSymbols$o(b)) {
      if (__propIsEnum$o.call(b, prop))
        __defNormalProp$D(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$k = (a, b) => __defProps$k(a, __getOwnPropDescs$k(b));
const TextBoxWidth = 1220;
const TextBoxCorruptedWidth = 900;
const TextBoxHeight = 219;
const TextBoxKerning = 0;
const TextBoxLineHeight = 29;
const TextBoxCorruptedKerning = 8;
const TextBoxTextXOffset = 57;
const TextBoxTextYOffset = 68;
const TextBoxBottomSpacing = 54;
const TextBoxTextCorruptedXOffset = 9;
const TextBoxTextCorruptedYOffset = 9;
const NameboxHeight = 59;
const NameboxWidth = 252;
const NameboxXOffset = 49;
const NameboxTextYOffset = 43;
const ControlsYBottomOffset = 12 * 1.5;
const ControlsXHistoryOffset = -126 * 1.5;
const ControlsXSkipOffset = -72 * 1.5;
const ControlsXStuffOffset = -38 * 1.5;
const ArrowXRightOffset = 30.75 * 1.5;
const ArrowYBottomOffset = 26 * 1.5;
const GlowRX = 426 * 1.5;
const GlowRY = 58 * 1.5;
const BaseTextStyle = {
  alpha: 1,
  color: "black",
  fontName: "aller",
  fontSize: 24,
  isBold: false,
  isItalic: false,
  isStrikethrough: false,
  isUnderlined: false,
  letterSpacing: 1,
  lineSpacing: 1.2,
  strokeColor: "",
  strokeWidth: 0
};
const NameboxTextStyle = __spreadProps$k(__spreadValues$o({}, BaseTextStyle), {
  fontName: "riffic",
  fontSize: 36,
  strokeColor: nameboxStrokeDefaultColor,
  strokeWidth: 9,
  color: "white",
  letterSpacing: 2
});
const ControlsTextStyle = {
  align: "left",
  font: "24px aller",
  fill: {
    style: "#522"
  }
};
const ControlsTextDisabledStyle = __spreadProps$k(__spreadValues$o({}, ControlsTextStyle), {
  fill: {
    style: "#a66"
  }
});
const TextBoxStyle = {
  alpha: 1,
  color: "#ffffff",
  fontName: "aller",
  fontSize: 30,
  isBold: false,
  isItalic: false,
  isStrikethrough: false,
  isUnderlined: false,
  letterSpacing: 0,
  strokeColor: "#523140",
  strokeWidth: 5,
  lineSpacing: 1.2
};
const TextBoxCorruptedStyle = {
  align: "left",
  font: "24px verily",
  outline: {
    style: "#000",
    width: 20
  },
  fill: {
    style: "#fff"
  }
};
const TextBoxX = screenWidth / 2 - TextBoxWidth / 2;
const TextBoxCorruptedX = screenWidth / 2 - TextBoxCorruptedWidth / 2;
const TextBoxTextX = TextBoxX + TextBoxTextXOffset;
const NameboxX = TextBoxX + NameboxXOffset;
const NameboxTextX = NameboxX + NameboxWidth / 2;
const ControlsXHistory = TextBoxX + ControlsXHistoryOffset;
const ControlsXSkip = TextBoxX + ControlsXSkipOffset;
const ControlsXStuff = TextBoxX + ControlsXStuffOffset;
const DefaultTextboxStyle = "custom_plus";
const TextBox$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TextBoxWidth,
  TextBoxCorruptedWidth,
  TextBoxHeight,
  TextBoxKerning,
  TextBoxLineHeight,
  TextBoxCorruptedKerning,
  TextBoxTextXOffset,
  TextBoxTextYOffset,
  TextBoxBottomSpacing,
  TextBoxTextCorruptedXOffset,
  TextBoxTextCorruptedYOffset,
  NameboxHeight,
  NameboxWidth,
  NameboxXOffset,
  NameboxTextYOffset,
  ControlsYBottomOffset,
  ControlsXHistoryOffset,
  ControlsXSkipOffset,
  ControlsXStuffOffset,
  ArrowXRightOffset,
  ArrowYBottomOffset,
  GlowRX,
  GlowRY,
  BaseTextStyle,
  NameboxTextStyle,
  ControlsTextStyle,
  ControlsTextDisabledStyle,
  TextBoxStyle,
  TextBoxCorruptedStyle,
  TextBoxX,
  TextBoxCorruptedX,
  TextBoxTextX,
  NameboxX,
  NameboxTextX,
  ControlsXHistory,
  ControlsXSkip,
  ControlsXStuff,
  DefaultTextboxStyle
}, Symbol.toStringTag, { value: "Module" }));
var __defProp$C = Object.defineProperty;
var __defProps$j = Object.defineProperties;
var __getOwnPropDescs$j = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$n = Object.getOwnPropertySymbols;
var __hasOwnProp$n = Object.prototype.hasOwnProperty;
var __propIsEnum$n = Object.prototype.propertyIsEnumerable;
var __defNormalProp$C = (obj, key, value) => key in obj ? __defProp$C(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$n = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$n.call(b, prop))
      __defNormalProp$C(a, prop, b[prop]);
  if (__getOwnPropSymbols$n)
    for (var prop of __getOwnPropSymbols$n(b)) {
      if (__propIsEnum$n.call(b, prop))
        __defNormalProp$C(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$j = (a, b) => __defProps$j(a, __getOwnPropDescs$j(b));
const NotificationBackgroundColor = "#ffe6f4";
const NotificationBorderColor = "#ffbde1";
const NotificationBackdropColor = "rgba(255,255,255,0.6)";
const NotificationPadding = 60;
const NotificationSpacing = 45;
const NotificationOkTextStyle = __spreadProps$j(__spreadValues$n({}, BaseTextStyle), {
  fontName: "riffic",
  fontSize: 36,
  strokeColor: nameboxStrokeDefaultColor,
  strokeWidth: 12,
  letterSpacing: 1,
  color: "white"
});
const NotificationTextStyle = {
  alpha: 1,
  color: "black",
  fontName: "aller",
  fontSize: 36,
  isBold: false,
  isItalic: false,
  isStrikethrough: false,
  isUnderlined: false,
  letterSpacing: 0,
  lineSpacing: 1.2,
  strokeColor: "",
  strokeWidth: 0
};
const Notification$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NotificationBackgroundColor,
  NotificationBorderColor,
  NotificationBackdropColor,
  NotificationPadding,
  NotificationSpacing,
  NotificationOkTextStyle,
  NotificationTextStyle
}, Symbol.toStringTag, { value: "Module" }));
var __defProp$B = Object.defineProperty;
var __defProps$i = Object.defineProperties;
var __getOwnPropDescs$i = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$m = Object.getOwnPropertySymbols;
var __hasOwnProp$m = Object.prototype.hasOwnProperty;
var __propIsEnum$m = Object.prototype.propertyIsEnumerable;
var __defNormalProp$B = (obj, key, value) => key in obj ? __defProp$B(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$m = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$m.call(b, prop))
      __defNormalProp$B(a, prop, b[prop]);
  if (__getOwnPropSymbols$m)
    for (var prop of __getOwnPropSymbols$m(b)) {
      if (__propIsEnum$m.call(b, prop))
        __defNormalProp$B(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$i = (a, b) => __defProps$i(a, __getOwnPropDescs$i(b));
const poemBackgrounds = [
  { name: "Normal paper", file: "poem.jpg" },
  { name: "Lightly soiled paper", file: "poem_y1.jpg" },
  { name: "Heavily soiled paper", file: "poem_y2.jpg" },
  { name: "Console", file: "internal:console" },
  { name: "Transparent", file: "internal:transparent" }
];
const defaultPoemBackground = 0;
const defaultPoemStyle = 0;
const defaultX = screenWidth / 2;
const defaultY = screenHeight / 2;
const poemTopPadding = 26;
const poemBottomPadding = 150;
const poemPadding = 61;
const defaultPoemWidth = 1200;
const defaultPoemHeight = 1080;
const backgroundScale = sdCharacterScaleFactor;
const consoleBackgroundColor = "#333333bf";
const consoleWidth = 720;
const consoleHeight = 270;
const defaultConsoleBackground = 3;
const defaultConsoleStyle = 7;
const BasePoemStyle = {
  alpha: 1,
  color: "black",
  isBold: false,
  isItalic: false,
  isStrikethrough: false,
  isUnderlined: false,
  letterSpacing: 0,
  lineSpacing: 1.2,
  strokeColor: "",
  strokeWidth: 0,
  fontName: "aller",
  fontSize: 18
};
const poemTextStyles = [
  __spreadProps$i(__spreadValues$m({}, BasePoemStyle), {
    name: "Sayori",
    fontName: "hashtag",
    fontSize: 45,
    lineSpacing: 0.95,
    letterSpacing: 1
  }),
  __spreadProps$i(__spreadValues$m({}, BasePoemStyle), {
    name: "Natsuki",
    fontName: "ammy_handwriting",
    fontSize: 41,
    letterSpacing: -0.5
  }),
  __spreadProps$i(__spreadValues$m({}, BasePoemStyle), {
    name: "Monika",
    fontName: "journal",
    fontSize: 36,
    lineSpacing: 1.4,
    letterSpacing: 0.5
  }),
  __spreadProps$i(__spreadValues$m({}, BasePoemStyle), {
    name: "Yuri",
    fontName: "jp_hand_slanted",
    lineSpacing: 1.55,
    fontSize: 48
  }),
  __spreadProps$i(__spreadValues$m({}, BasePoemStyle), {
    name: "Yuri Act 2",
    fontName: "damagrafik_script",
    fontSize: 27,
    letterSpacing: -12
  }),
  __spreadProps$i(__spreadValues$m({}, BasePoemStyle), {
    name: "Yuri Unused",
    fontName: "as_i_lay_dying",
    fontSize: 60
  }),
  __spreadProps$i(__spreadValues$m({}, BasePoemStyle), {
    name: "MC",
    fontName: "halogen",
    fontSize: 45,
    lineSpacing: 1.53
  }),
  __spreadProps$i(__spreadValues$m({}, BasePoemStyle), {
    name: "Console",
    fontName: "f25_bank_printer",
    fontSize: 27,
    color: "white",
    lineSpacing: 1.1
  })
];
const Poem$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  poemBackgrounds,
  defaultPoemBackground,
  defaultPoemStyle,
  defaultX,
  defaultY,
  poemTopPadding,
  poemBottomPadding,
  poemPadding,
  defaultPoemWidth,
  defaultPoemHeight,
  backgroundScale,
  consoleBackgroundColor,
  consoleWidth,
  consoleHeight,
  defaultConsoleBackground,
  defaultConsoleStyle,
  poemTextStyles
}, Symbol.toStringTag, { value: "Module" }));
const DdlcPlus = {
  Base,
  Choices,
  Notification: Notification$1,
  Poem: Poem$1,
  TextBox: TextBox$1,
  TextBoxCustom: CustomTBConstants
};
function getConstants() {
  if (envX.gameMode === "ddlc_plus")
    return DdlcPlus;
  return Ddlc;
}
function between(min, val, max) {
  if (min > val)
    return min;
  if (val > max)
    return max;
  return val;
}
function mod(a, b) {
  return (a % b + b) % b;
}
function matrixEquals(a, b) {
  if (a === null && b === null)
    return true;
  if (a === null || b === null)
    return false;
  return a.a === b.a && a.b === b.b && a.c === b.c && a.d === b.d && a.e === b.e && a.f === b.f;
}
function decomposeMatrix(mat) {
  const { a, b, c, d, e, f } = mat;
  const delta = a * d - b * c;
  const result = {
    x: e,
    y: f,
    rotation: 0,
    scaleX: 0,
    scaleY: 0,
    skewX: 0,
    skewY: 0
  };
  if (a != 0 || b != 0) {
    const r = Math.sqrt(a * a + b * b);
    result.rotation = (b > 0 ? Math.acos(a / r) : -Math.acos(a / r)) / Math.PI * 180;
    result.scaleX = r;
    result.scaleY = delta / r;
    result.skewX = Math.atan((a * c + b * d) / (r * r)) / Math.PI * 180;
    result.skewY = 0;
  } else if (c != 0 || d != 0) {
    const s = Math.sqrt(c * c + d * d);
    result.rotation = (Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s))) / Math.PI * 180;
    result.scaleX = delta / s;
    result.scaleY = s;
    result.skewX = 0;
    result.skewY = Math.atan((a * c + b * d) / (s * s)) / Math.PI * 180;
  } else
    ;
  return result;
}
var __async$F = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function migrateSave2_5(data) {
  var _a2, _b, _c, _d, _e, _f, _g;
  const panels2 = Object.values(data.panels.panels);
  if (panels2.find((x) => Object.values(x.objects).find((x2) => "scaleX" in x2)))
    return;
  for (const panel of panels2) {
    for (const object of Object.values(panel.objects)) {
      object.scaleX = (_a2 = object.zoom) != null ? _a2 : 1;
      object.scaleY = (_b = object.zoom) != null ? _b : 1;
      object.skewX = 0;
      object.skewY = 0;
      object.linkedTo = null;
      const constants = getConstants();
      if (object.type === "character") {
        const character = object;
        const charData = data.content.current.characters.find(
          (c) => c.id === character.characterType
        );
        const size2 = (_f = (_e = (_d = (_c = charData == null ? void 0 : charData.styleGroups[character.styleGroupId]) == null ? void 0 : _c.styles[character.styleId]) == null ? void 0 : _d.poses[character.poseId]) == null ? void 0 : _e.size) != null ? _f : [960, 960];
        adjustObjectSize2_5(character, (_g = object.zoom) != null ? _g : 1, size2);
      }
      if (object.type === "textBox") {
        const textbox = object;
        textbox.height += constants.TextBox.NameboxHeight;
        textbox.y += textbox.height / 2;
      }
      if (object.type === "sprite") {
        object.requireFixing25 = true;
        data.requireFixing25 = true;
      }
      delete object.zoom;
    }
  }
}
function adjustObjectSize2_5(obj, zoom, size2) {
  let a = new DOMMatrixReadOnly().translate(obj.x, obj.y + obj.height / 2);
  a = a.translate(0, -obj.height / 2).scale(obj.width / size2[0], obj.height / size2[1]).translate(0, size2[1] / 2);
  a = a.rotate(obj.flip ? -obj.rotation : obj.rotation);
  a = a.translate(0, size2[1] / 2).scale(zoom).translate(0, -size2[1] / 2);
  const oldRot = obj.rotation;
  Object.assign(obj, decomposeMatrix(a));
  obj.rotation = obj.flip ? 360 - oldRot : oldRot;
  obj.skewX = 0;
  obj.skewY = 0;
  obj.width = size2[0];
  obj.height = size2[1];
}
const rootStateMigrations2_5 = {
  fixSprites2_5(state, data) {
    for (const panel of Object.values(state.panels.panels)) {
      for (const object of Object.values(panel.objects)) {
        if (object.type !== "sprite" || !object.requireFixing25 || object.scaleX !== object.scaleY)
          continue;
        const sprite = object;
        if (sprite.assets.length === 1 && sprite.assets[0].hq === data.url) {
          adjustObjectSize2_5(sprite, object.scaleX, data.size);
          delete object.requireFixing25;
        }
      }
    }
  }
};
function afterImageUpload2_5(rootState, commit2, assertUrl) {
  return __async$F(this, null, function* () {
    if ("requireFixing25" in rootState) {
      const asset = yield getAssetByUrl(assertUrl);
      commit2(
        "fixSprites2_5",
        { url: assertUrl, size: [asset.width, asset.height] },
        { root: true }
      );
    }
  });
}
function allowScaleModification(obj) {
  return !obj.requireFixing25;
}
function arraySeeker(array, pos, delta) {
  let val = pos + delta;
  const length = array.length;
  if (val < 0) {
    val += length;
  }
  if (val >= length) {
    val -= length;
  }
  return val;
}
var SelectedState = /* @__PURE__ */ ((SelectedState2) => {
  SelectedState2[SelectedState2["None"] = 0] = "None";
  SelectedState2[SelectedState2["Selected"] = 1] = "Selected";
  SelectedState2[SelectedState2["Focused"] = 2] = "Focused";
  SelectedState2[SelectedState2["Indirectly"] = 4] = "Indirectly";
  return SelectedState2;
})(SelectedState || {});
const selectionColors = {
  [0]: void 0,
  [1]: "#f00",
  [2]: "#00f",
  [1 + 2]: "#f0f",
  [4]: "#f66",
  [4 + 2]: "#f6f"
};
function disposeCanvas(canvas) {
  canvas.width = 0;
  canvas.height = 0;
  disposables.delete(canvas.disposalId || 0);
}
function makeCanvas() {
  const ret = document.createElement("canvas");
  markForDisposal(ret);
  return ret;
}
const disposables = /* @__PURE__ */ new Map();
let nextDisposalId = 0;
function markForDisposal(canvas) {
  canvas.disposalId = nextDisposalId++;
  if (typeof WeakRef === "undefined")
    return;
  disposables.set(
    canvas.disposalId,
    new WeakRef(canvas)
  );
}
window.addEventListener("unload", () => {
  disposables.forEach((x) => {
    const disposable = x.deref();
    if (!disposable)
      return;
    disposeCanvas(disposable);
  });
});
class RenderAbortedException {
}
var __defProp$A = Object.defineProperty;
var __getOwnPropSymbols$l = Object.getOwnPropertySymbols;
var __hasOwnProp$l = Object.prototype.hasOwnProperty;
var __propIsEnum$l = Object.prototype.propertyIsEnumerable;
var __defNormalProp$A = (obj, key, value) => key in obj ? __defProp$A(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$l = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$l.call(b, prop))
      __defNormalProp$A(a, prop, b[prop]);
  if (__getOwnPropSymbols$l)
    for (var prop of __getOwnPropSymbols$l(b)) {
      if (__propIsEnum$l.call(b, prop))
        __defNormalProp$A(a, prop, b[prop]);
    }
  return a;
};
var __publicField$h = (obj, key, value) => {
  __defNormalProp$A(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$E = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class RenderContext {
  constructor(canvas, fsCtx, hq, preview) {
    this.canvas = canvas;
    this.fsCtx = fsCtx;
    this.hq = hq;
    this.preview = preview;
    __publicField$h(this, "aborted", false);
  }
  static make(canvas, hq, preview) {
    return new RenderContext(canvas, canvas.getContext("2d"), hq, preview);
  }
  static makeWithContext(canvas, context, hq, preview) {
    return new RenderContext(canvas, context, hq, preview);
  }
  drawText(params) {
    if (this.aborted)
      throw new RenderAbortedException();
    this.fsCtx.save();
    const {
      font,
      align,
      x = 0,
      y = 0,
      text = ""
    } = __spreadValues$l(__spreadValues$l({}, {
      font: "20px aller",
      align: "left"
    }), params);
    this.fsCtx.lineJoin = "round";
    this.fsCtx.textAlign = align;
    this.fsCtx.font = font;
    if (params.outline) {
      this.fsCtx.strokeStyle = params.outline.style;
      this.fsCtx.lineWidth = params.outline.width;
      this.fsCtx.strokeText(text, x, y);
    }
    if (params.fill) {
      this.fsCtx.fillStyle = params.fill.style;
      this.fsCtx.fillText(text, x, y);
    }
    this.fsCtx.restore();
  }
  measureText(params) {
    if (this.aborted)
      throw new RenderAbortedException();
    this.fsCtx.save();
    const {
      font,
      align,
      text = ""
    } = __spreadValues$l(__spreadValues$l({}, {
      font: "20px aller",
      align: "left"
    }), params);
    this.fsCtx.lineJoin = "round";
    this.fsCtx.textAlign = align;
    this.fsCtx.font = font;
    if (params.outline) {
      this.fsCtx.strokeStyle = params.outline.style;
      this.fsCtx.lineWidth = params.outline.width;
    }
    if (params.fill) {
      this.fsCtx.fillStyle = params.fill.style;
    }
    const ret = this.fsCtx.measureText(text);
    this.fsCtx.restore();
    return ret;
  }
  drawImage(params) {
    if (this.aborted)
      throw new RenderAbortedException();
    const { image, flip, x, y, w, h: h2, filters, composite } = __spreadValues$l({
      flip: false,
      w: params.image.width,
      h: params.image.height,
      composite: "source-over"
    }, params);
    this.fsCtx.save();
    this.fsCtx.globalCompositeOperation = composite;
    if (filters) {
      if (!("filter" in this.fsCtx)) {
        let opacityCombined = 1;
        for (const filter of filters) {
          if (filter.type === "opacity") {
            opacityCombined *= filter.value;
          }
        }
        this.fsCtx.globalAlpha = opacityCombined;
      } else {
        const filterList = [];
        for (const filter of filters) {
          if (filter.type === "drop-shadow") {
            filterList.push(
              `drop-shadow(${filter.offsetX}px ${filter.offsetY}px ${filter.blurRadius}px ${filter.color})`
            );
          } else if (filter.type === "hue-rotate") {
            filterList.push(`hue-rotate(${filter.value}deg)`);
          } else if (filter.type === "blur") {
            filterList.push(`blur(${filter.value}px)`);
          } else {
            filterList.push(`${filter.type}(${filter.value * 100}%)`);
          }
        }
        this.fsCtx.filter = filterList.join(" ");
      }
    }
    if (params.shadow) {
      const shadow = params.shadow;
      if (shadow.color != null) {
        this.fsCtx.shadowColor = shadow.color;
      }
      if (shadow.blur != null) {
        this.fsCtx.shadowBlur = shadow.blur;
      }
      if (shadow.offsetX != null) {
        this.fsCtx.shadowOffsetX = shadow.offsetX;
      }
      if (shadow.offsetY != null) {
        this.fsCtx.shadowOffsetY = shadow.offsetY;
      }
    }
    if (params.rotation != null && params.rotation !== 0) {
      const rotX = params.rotationAnchor ? params.rotationAnchor.x : 0;
      const rotY = params.rotationAnchor ? params.rotationAnchor.y : 0;
      if (params.rotationAnchor) {
        this.fsCtx.translate(rotX, rotY);
      }
      this.fsCtx.rotate(params.rotation);
      if (params.rotationAnchor) {
        this.fsCtx.translate(-rotX, -rotY);
      }
    }
    this.fsCtx.translate(x + w / 2, y + h2 / 2);
    this.fsCtx.scale(flip ? -1 : 1, 1);
    image.paintOnto(this.fsCtx, { x: -w / 2, y: -h2 / 2, w, h: h2 });
    this.fsCtx.restore();
    this.fsCtx.globalCompositeOperation = "source-over";
  }
  drawRect({
    x,
    y,
    w,
    h: h2,
    outline,
    fill,
    composition,
    rotation,
    rotationAnchor
  }) {
    if (this.aborted)
      throw new RenderAbortedException();
    this.fsCtx.save();
    if (rotation != null && rotation !== 0) {
      const rotX = rotationAnchor ? rotationAnchor.x : 0;
      const rotY = rotationAnchor ? rotationAnchor.y : 0;
      if (rotationAnchor) {
        this.fsCtx.translate(rotX, rotY);
      }
      this.fsCtx.rotate(rotation);
      if (rotationAnchor) {
        this.fsCtx.translate(-rotX, -rotY);
      }
    }
    this.fsCtx.beginPath();
    this.fsCtx.rect(x, y, w, h2);
    if (composition) {
      this.fsCtx.globalCompositeOperation = composition;
    }
    if (fill) {
      this.fsCtx.fillStyle = fill.style;
      this.fsCtx.fill();
    }
    if (outline) {
      this.fsCtx.strokeStyle = outline.style;
      this.fsCtx.lineWidth = outline.width;
      this.fsCtx.stroke();
    }
    this.fsCtx.restore();
  }
  drawPath({
    outline,
    fill,
    path
  }) {
    if (this.aborted)
      throw new RenderAbortedException();
    this.fsCtx.save();
    this.fsCtx.beginPath();
    path(this.fsCtx);
    if (fill) {
      this.fsCtx.fillStyle = fill.style;
      this.fsCtx.fill();
    }
    if (outline) {
      this.fsCtx.strokeStyle = outline.style;
      this.fsCtx.lineWidth = outline.width;
      this.fsCtx.stroke();
    }
    this.fsCtx.restore();
  }
  patternFrom(image, repetition = "repeat") {
    if (image instanceof Renderer) {
      image = image.previewCanvas;
    }
    return this.fsCtx.createPattern(
      image,
      repetition
    );
  }
  customTransform(transform, render) {
    return __async$E(this, null, function* () {
      this.fsCtx.save();
      yield transform(this.fsCtx);
      yield render(this);
      this.fsCtx.restore();
    });
  }
  linearGradient(x0, y0, x1, y1) {
    return this.fsCtx.createLinearGradient(x0, y0, x1, y1);
  }
  applyFilters(filters) {
    if (filters.length === 0)
      return;
    this.fsCtx.save();
    let opacityCombined = 1;
    for (const filter of filters) {
      if (filter.type === "opacity") {
        opacityCombined *= filter.value;
      }
    }
    if ("filter" in this.fsCtx) {
      const filterList = [];
      for (const filter of filters) {
        if (filter.type === "opacity")
          continue;
        if (filter.type === "drop-shadow") {
          filterList.push(
            `drop-shadow(${filter.offsetX}px ${filter.offsetY}px ${filter.blurRadius}px ${filter.color})`
          );
        } else if (filter.type === "hue-rotate") {
          filterList.push(`hue-rotate(${filter.value}deg)`);
        } else if (filter.type === "blur") {
          filterList.push(`blur(${filter.value}px)`);
        } else {
          filterList.push(`${filter.type}(${filter.value * 100}%)`);
        }
      }
      this.fsCtx.filter = filterList.join(" ");
    }
    this.fsCtx.drawImage(this.canvas, 0, 0);
    if (opacityCombined !== 1) {
      this.fsCtx.globalCompositeOperation = "destination-atop";
      this.fsCtx.fillStyle = `rgba(0,0,0,${opacityCombined})`;
      this.fsCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.fsCtx.globalCompositeOperation = "source-over";
    }
    if ("filter" in this.fsCtx) {
      this.fsCtx.filter = "none";
    }
    this.fsCtx.restore();
  }
  abort() {
    this.aborted = true;
  }
}
var __defProp$z = Object.defineProperty;
var __defNormalProp$z = (obj, key, value) => key in obj ? __defProp$z(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$g = (obj, key, value) => {
  __defNormalProp$z(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$D = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class Renderer {
  constructor(w, h2) {
    __publicField$g(this, "previewCanvas");
    __publicField$g(this, "runningContext", null);
    __publicField$g(this, "_disposed", false);
    const constants = getConstants();
    this.previewCanvas = makeCanvas();
    this.previewCanvas.width = w != null ? w : constants.Base.screenWidth;
    this.previewCanvas.height = h2 != null ? h2 : constants.Base.screenHeight;
  }
  get disposed() {
    return this._disposed;
  }
  render(renderCallback, hq = true, preview = true) {
    return __async$D(this, null, function* () {
      if (this.runningContext) {
        this.runningContext.abort();
      }
      const ctx = this.previewCanvas.getContext("2d");
      ctx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
      const context = this.runningContext = RenderContext.makeWithContext(
        this.previewCanvas,
        ctx,
        hq,
        preview
      );
      try {
        yield renderCallback(this.runningContext);
      } catch (e) {
        if (e instanceof RenderAbortedException) {
          return false;
        }
        throw e;
      } finally {
        if (context === this.runningContext) {
          this.runningContext = null;
        }
      }
      return true;
    });
  }
  get width() {
    return this.previewCanvas.width;
  }
  get height() {
    return this.previewCanvas.height;
  }
  paintOnto(c, opts) {
    if (opts.w != null && opts.h != null) {
      c.drawImage(this.previewCanvas, opts.x, opts.y, opts.w, opts.h);
    } else {
      c.drawImage(this.previewCanvas, opts.x, opts.y);
    }
  }
  download(renderCallback, filename) {
    return __async$D(this, null, function* () {
      const downloadCanvas = yield this.drawToCanvas(renderCallback);
      return yield envX.saveToFile(downloadCanvas, filename);
    });
  }
  renderToBlob(renderCallback) {
    return __async$D(this, null, function* () {
      const downloadCanvas = yield this.drawToCanvas(renderCallback);
      return yield new Promise((resolve, reject) => {
        downloadCanvas.toBlob((blob) => {
          if (blob)
            resolve(blob);
          else
            reject();
        });
      });
    });
  }
  drawToCanvas(renderCallback) {
    return __async$D(this, null, function* () {
      const downloadCanvas = makeCanvas();
      downloadCanvas.width = this.previewCanvas.width;
      downloadCanvas.height = this.previewCanvas.height;
      const ctx = downloadCanvas.getContext("2d");
      ctx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
      yield renderCallback(
        RenderContext.makeWithContext(downloadCanvas, ctx, true, false)
      );
      return downloadCanvas;
    });
  }
  dispose() {
    if (this.runningContext) {
      this.runningContext.abort();
    }
    disposeCanvas(this.previewCanvas);
    this._disposed = true;
  }
  getDataAt(x, y) {
    const ctx = this.previewCanvas.getContext("2d");
    return ctx.getImageData(x, y, 1, 1).data;
  }
}
function baseProps() {
  return {
    flip: false,
    rotation: 0,
    version: 0,
    opacity: 100,
    x: getConstants().Base.screenWidth / 2,
    composite: "source-over",
    filters: [],
    label: null,
    textboxColor: null,
    enlargeWhenTalking: false,
    nameboxWidth: null,
    scaleX: 1,
    scaleY: 1,
    ratio: 1,
    preserveRatio: true,
    skewX: 0,
    skewY: 0,
    linkedTo: null
  };
}
var __defProp$y = Object.defineProperty;
var __defProps$h = Object.defineProperties;
var __getOwnPropDescs$h = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$k = Object.getOwnPropertySymbols;
var __hasOwnProp$k = Object.prototype.hasOwnProperty;
var __propIsEnum$k = Object.prototype.propertyIsEnumerable;
var __defNormalProp$y = (obj, key, value) => key in obj ? __defProp$y(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$k = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$k.call(b, prop))
      __defNormalProp$y(a, prop, b[prop]);
  if (__getOwnPropSymbols$k)
    for (var prop of __getOwnPropSymbols$k(b)) {
      if (__propIsEnum$k.call(b, prop))
        __defNormalProp$y(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$h = (a, b) => __defProps$h(a, __getOwnPropDescs$h(b));
var __async$C = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const characterMutations = {
  setPose(state, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    obj.poseId = command.poseId;
    ++obj.version;
  },
  setCharStyleGroup(state, { id, panelId, styleGroupId }) {
    const obj = state.panels[panelId].objects[id];
    obj.styleGroupId = styleGroupId;
    ++obj.version;
  },
  setCharStyle(state, { id, panelId, styleId }) {
    const obj = state.panels[panelId].objects[id];
    obj.styleId = styleId;
    ++obj.version;
  },
  setClose(state, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    obj.close = command.close;
    ++obj.version;
  },
  setPosePosition(state, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    obj.posePositions = __spreadValues$k(__spreadValues$k({}, obj.posePositions), command.posePositions);
    ++obj.version;
  },
  setFreeMove(state, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    obj.freeMove = command.freeMove;
    if (!obj.freeMove) {
      const constants = getConstants();
      obj.x = constants.Base.characterPositions[closestCharacterSlot(obj.x)];
      obj.y = constants.Base.BaseCharacterYPos;
    }
  }
};
function getData(store2, state) {
  const characters = store2.getters["content/getCharacters"];
  return characters.get(state.characterType);
}
function getDataG(rootGetters, characterType) {
  const characters = rootGetters["content/getCharacters"];
  return characters.get(characterType);
}
function getPose(data, state) {
  return data.styleGroups[state.styleGroupId].styles[state.styleId].poses[state.poseId];
}
function getParts(data, state) {
  const pose = getPose(data, state);
  const positionKeys = [
    ...Object.keys(pose.positions).filter(
      (positionKey) => pose.positions[positionKey].length > 1
    )
  ];
  if (pose.compatibleHeads.length > 0)
    positionKeys.unshift("head");
  return positionKeys;
}
function getHeads(data, state, headTypeId = state.posePositions.headType || 0) {
  const compatibleHeads = getPose(data, state).compatibleHeads;
  if (compatibleHeads.length === 0) {
    return null;
  }
  return data.heads[compatibleHeads[headTypeId]];
}
function closestCharacterSlot(pos) {
  const constants = getConstants();
  const sorted = constants.Base.characterPositions.map((x, idx) => ({ pos: Math.abs(pos - x), idx })).sort((a, b) => a.pos - b.pos);
  return sorted[0].idx;
}
const characterActions = {
  createCharacters({ rootState, rootGetters, commit: commit2, state }, command) {
    var _a2;
    const id = state.panels[command.panelId].lastObjId + 1;
    const constants = getConstants();
    const char = getDataG(rootGetters, command.characterType);
    const charScale = char.hd ? constants.Base.hdCharacterScaleFactor : constants.Base.sdCharacterScaleFactor;
    commit2("create", {
      object: __spreadProps$h(__spreadValues$k({}, baseProps()), {
        id,
        panelId: rootState.panels.currentPanel,
        onTop: false,
        type: "character",
        y: constants.Base.BaseCharacterYPos,
        width: char.size[0],
        height: char.size[1],
        scaleX: char.defaultScale[0] * charScale,
        scaleY: char.defaultScale[1] * charScale,
        characterType: command.characterType,
        close: false,
        freeMove: false,
        poseId: 0,
        styleId: 0,
        styleGroupId: 0,
        posePositions: {},
        label: (_a2 = char.label) != null ? _a2 : char.id,
        enlargeWhenTalking: rootState.ui.defaultCharacterTalkingZoom,
        linkedTo: null
      })
    });
    return id;
  },
  seekPart({ state, commit: commit2, dispatch: dispatch2, rootGetters }, { delta, id, panelId, part }) {
    if (part === "head") {
      dispatch2("seekHead", { id, panelId, delta });
      return;
    }
    const obj = state.panels[panelId].objects[id];
    const pose = getPose(getDataG(rootGetters, obj.characterType), obj);
    if (!pose.positions[part])
      return;
    commit2("setPosePosition", {
      id,
      panelId,
      posePositions: {
        [part]: arraySeeker(
          pose.positions[part],
          obj.posePositions[part] || 0,
          delta
        )
      }
    });
  },
  seekPose({ state, commit: commit2, rootGetters }, { id, panelId, delta }) {
    const obj = state.panels[panelId].objects[id];
    const data = getDataG(rootGetters, obj.characterType);
    const poses = data.styleGroups[obj.styleGroupId].styles[obj.styleId].poses;
    mutatePoseAndPositions(commit2, obj, data, (change) => {
      change.poseId = arraySeeker(poses, change.poseId, delta);
    });
  },
  seekStyle({ state, commit: commit2, rootGetters }, { id, panelId, delta }) {
    const obj = state.panels[panelId].objects[id];
    const data = getDataG(rootGetters, obj.characterType);
    const linearStyles = data.styleGroups.flatMap((styleGroup, styleGroupIdx) => {
      return styleGroup.styles.map((style, styleIdx) => {
        return {
          styleGroupIdx,
          styleIdx,
          styleGroupJson: JSON.stringify(style.components)
        };
      });
    }).sort(
      (styleA, styleB) => styleA.styleGroupJson.localeCompare(styleB.styleGroupJson)
    );
    const linearIdx = linearStyles.findIndex(
      (style) => style.styleGroupIdx === obj.styleGroupId && style.styleIdx === obj.styleId
    );
    mutatePoseAndPositions(commit2, obj, data, (change) => {
      const nextIdx = arraySeeker(linearStyles, linearIdx, delta);
      const style = linearStyles[nextIdx];
      change.styleGroupId = style.styleGroupIdx;
      change.styleId = style.styleIdx;
    });
  },
  seekHead({ state, commit: commit2, rootGetters }, { id, panelId, delta }) {
    const obj = state.panels[panelId].objects[id];
    const data = getDataG(rootGetters, obj.characterType);
    const pose = getPose(data, obj);
    let currentHeads = getHeads(data, obj);
    if (!currentHeads)
      return;
    let head2 = (obj.posePositions.head || 0) + delta;
    let headType = obj.posePositions.headType || 0;
    if (head2 < 0 || head2 >= currentHeads.variants.length) {
      headType = arraySeeker(
        pose.compatibleHeads.map((headKey) => data.heads[headKey]),
        headType,
        delta
      );
      currentHeads = getHeads(data, obj, headType);
      head2 = delta === 1 ? 0 : currentHeads.variants.length - 1;
    }
    commit2("setPosePosition", {
      id,
      panelId,
      posePositions: {
        head: head2,
        headType
      }
    });
  },
  setPart({ state, commit: commit2, rootGetters }, { panelId, id, part, val }) {
    const obj = state.panels[panelId].objects[id];
    const data = getDataG(rootGetters, obj.characterType);
    if (part === "pose") {
      mutatePoseAndPositions(commit2, obj, data, (change) => {
        change.poseId = val;
      });
    } else if (part === "style") {
      mutatePoseAndPositions(commit2, obj, data, (change) => {
        change.styleId = val;
      });
    } else {
      mutatePoseAndPositions(commit2, obj, data, (change) => {
        change.posePositions[part] = val;
      });
    }
  },
  setCharStyle({ state, commit: commit2, rootGetters }, { panelId, id, styleGroupId, styleId }) {
    const obj = state.panels[panelId].objects[id];
    const data = getDataG(rootGetters, obj.characterType);
    mutatePoseAndPositions(commit2, obj, data, (change) => {
      change.styleGroupId = styleGroupId;
      change.styleId = styleId;
    });
  },
  setCharacterPosition({ state, commit: commit2 }, { panelId, id, x, y }) {
    const obj = state.panels[panelId].objects[id];
    if (!obj.freeMove) {
      const constants = getConstants();
      x = constants.Base.characterPositions[closestCharacterSlot(x)];
      y = constants.Base.BaseCharacterYPos;
    }
    if (obj.x === x && obj.y === y)
      return;
    commit2("setPosition", {
      panelId,
      id,
      x,
      y
    });
  },
  shiftCharacterSlot({ state, commit: commit2 }, { panelId, id, delta }) {
    const obj = state.panels[panelId].objects[id];
    const constants = getConstants();
    const currentSlotNr = closestCharacterSlot(obj.x);
    let newSlotNr = currentSlotNr + delta;
    if (newSlotNr < 0) {
      newSlotNr = 0;
    }
    if (newSlotNr >= constants.Base.characterPositions.length) {
      newSlotNr = constants.Base.characterPositions.length - 1;
    }
    commit2("setPosition", {
      panelId,
      id,
      x: constants.Base.characterPositions[newSlotNr],
      y: obj.y
    });
  }
};
function fixContentPackRemovalFromCharacter(context, panelId, id, oldPack) {
  return __async$C(this, null, function* () {
    const obj = context.state.panels[panelId].objects[id];
    const oldCharData = oldPack.characters.find(
      (char) => char.id === obj.characterType
    );
    if (!oldCharData) {
      console.error("Character data is missing. Dropping the character.");
      yield context.dispatch("removeObject", {
        id,
        panelId
      });
      return;
    }
    const poseAndPositionChange = buildPoseAndPositionData(obj);
    const oldStyleGroup = oldCharData.styleGroups[obj.styleGroupId];
    const oldStyle = oldStyleGroup.styles[poseAndPositionChange.styleId];
    const oldPose = oldStyle.poses[poseAndPositionChange.poseId];
    const newCharData = context.rootState.content.current.characters.find(
      (chr) => chr.id === oldCharData.id
    );
    if (!newCharData) {
      console.error("Character data is missing. Dropping the character.");
      yield context.dispatch("removeObject", {
        id,
        panelId
      });
      return;
    }
    const newStyleGroupIdx = newCharData.styleGroups.findIndex(
      (styleGroup) => styleGroup.id === oldStyleGroup.id
    );
    poseAndPositionChange.styleGroupId = newStyleGroupIdx === -1 ? 0 : newStyleGroupIdx;
    const newStyleGroup = newCharData.styleGroups[poseAndPositionChange.styleGroupId];
    const styleProperies = JSON.stringify(oldStyle.components);
    const newStyleIdx = newStyleGroup.styles.findIndex(
      (style) => JSON.stringify(style.components) === styleProperies
    );
    poseAndPositionChange.styleId = newStyleIdx === -1 ? 0 : newStyleIdx;
    const newStyle = newStyleGroup.styles[poseAndPositionChange.styleId];
    const newPoseIdx = newStyle.poses.findIndex((pose) => pose.id === oldPose.id);
    poseAndPositionChange.poseId = newPoseIdx === -1 ? 0 : newPoseIdx;
    const newPose = newStyle.poses[poseAndPositionChange.poseId];
    for (const key in newPose.positions) {
      if (!Object.prototype.hasOwnProperty.call(newPose.positions, key))
        continue;
      const newPosition = newPose.positions[key];
      if (oldPose.positions[key]) {
        const oldPositionIdx = poseAndPositionChange.posePositions[key];
        if (oldPositionIdx >= 0 && oldPositionIdx < newPosition.length)
          ;
      }
    }
    const oldHeadGroup = oldPose.compatibleHeads[obj.posePositions.headType];
    const newHeadGroupIdx = newPose.compatibleHeads.indexOf(oldHeadGroup);
    if (newHeadGroupIdx === -1) {
      poseAndPositionChange.posePositions.headType = 0;
      poseAndPositionChange.posePositions.head = 0;
    } else {
      if (newHeadGroupIdx !== obj.posePositions.headType) {
        poseAndPositionChange.posePositions.headType = newHeadGroupIdx;
      }
      const oldHead = JSON.stringify(
        oldCharData.heads[oldHeadGroup].variants[obj.posePositions.head]
      );
      const newHeadIdx = newCharData.heads[oldHeadGroup].variants.findIndex(
        (variant) => JSON.stringify(variant) === oldHead
      );
      if (newHeadIdx === -1) {
        poseAndPositionChange.posePositions.head = 0;
      } else {
        poseAndPositionChange.posePositions.head = newHeadIdx;
      }
    }
    commitPoseAndPositionChanges(context.commit, obj, poseAndPositionChange);
  });
}
function buildPoseAndPositionData(character) {
  return {
    styleGroupId: character.styleGroupId,
    styleId: character.styleId,
    poseId: character.poseId,
    posePositions: __spreadValues$k({}, character.posePositions)
  };
}
function commitPoseAndPositionChanges(commit2, character, poseAndPosition) {
  if (poseAndPosition.styleGroupId !== character.styleGroupId) {
    commit2("setCharStyleGroup", {
      id: character.id,
      panelId: character.panelId,
      styleGroupId: poseAndPosition.styleGroupId
    });
  }
  if (poseAndPosition.styleId !== character.styleId) {
    console.log(
      `Setting style of ${character.id} to ${poseAndPosition.styleId}`
    );
    commit2("setCharStyle", {
      id: character.id,
      panelId: character.panelId,
      styleId: poseAndPosition.styleId
    });
  }
  if (poseAndPosition.poseId !== character.poseId) {
    commit2("setPose", {
      id: character.id,
      panelId: character.panelId,
      poseId: poseAndPosition.poseId
    });
  }
  if (JSON.stringify(poseAndPosition.posePositions) !== JSON.stringify(character.posePositions)) {
    commit2("setPosePosition", {
      id: character.id,
      panelId: character.panelId,
      posePositions: poseAndPosition.posePositions
    });
  }
}
function mutatePoseAndPositions(commit2, character, data, callback) {
  const poseAndPosition = buildPoseAndPositionData(character);
  callback(poseAndPosition);
  if (!data.styleGroups[poseAndPosition.styleGroupId]) {
    poseAndPosition.styleGroupId = 0;
  }
  const styleGroup = data.styleGroups[poseAndPosition.styleGroupId];
  if (!styleGroup.styles[poseAndPosition.styleId]) {
    poseAndPosition.styleId = 0;
  }
  const style = styleGroup.styles[poseAndPosition.styleId];
  if (!style.poses[poseAndPosition.poseId]) {
    poseAndPosition.poseId = 0;
  }
  const pose = style.poses[poseAndPosition.poseId];
  for (const positionKey in pose.positions) {
    if (!pose.positions[positionKey])
      continue;
    if (!pose.positions[positionKey][poseAndPosition.posePositions[positionKey]]) {
      poseAndPosition.posePositions[positionKey] = 0;
    }
  }
  const oldPose = data.styleGroups[character.styleGroupId].styles[character.styleId].poses[character.poseId];
  const oldHeadCollection = oldPose.compatibleHeads[character.posePositions.headType || 0];
  const newHeadCollectionNr = pose.compatibleHeads.indexOf(oldHeadCollection);
  if (newHeadCollectionNr >= 0) {
    poseAndPosition.posePositions.headType = newHeadCollectionNr;
  } else {
    poseAndPosition.posePositions.headType = 0;
    poseAndPosition.posePositions.head = 0;
  }
  commitPoseAndPositionChanges(commit2, character, poseAndPosition);
}
var dist = {};
var primitive = {};
Object.defineProperty(primitive, "__esModule", { value: true });
var builtIn = {};
Object.defineProperty(builtIn, "__esModule", { value: true });
var keyOfBase = {};
Object.defineProperty(keyOfBase, "__esModule", { value: true });
var strictExclude = {};
Object.defineProperty(strictExclude, "__esModule", { value: true });
var strictExtract = {};
Object.defineProperty(strictExtract, "__esModule", { value: true });
var strictOmit = {};
Object.defineProperty(strictOmit, "__esModule", { value: true });
var writable = {};
Object.defineProperty(writable, "__esModule", { value: true });
var asyncOrSync = {};
Object.defineProperty(asyncOrSync, "__esModule", { value: true });
var asyncOrSyncType = {};
Object.defineProperty(asyncOrSyncType, "__esModule", { value: true });
var dictionary = {};
Object.defineProperty(dictionary, "__esModule", { value: true });
var dictionaryValues = {};
Object.defineProperty(dictionaryValues, "__esModule", { value: true });
var merge = {};
Object.defineProperty(merge, "__esModule", { value: true });
var mergeN = {};
Object.defineProperty(mergeN, "__esModule", { value: true });
var newable = {};
Object.defineProperty(newable, "__esModule", { value: true });
var nonNever = {};
Object.defineProperty(nonNever, "__esModule", { value: true });
var omitProperties = {};
Object.defineProperty(omitProperties, "__esModule", { value: true });
var opaque = {};
Object.defineProperty(opaque, "__esModule", { value: true });
var pickProperties = {};
Object.defineProperty(pickProperties, "__esModule", { value: true });
var safeDictionary = {};
Object.defineProperty(safeDictionary, "__esModule", { value: true });
var unionToIntersection = {};
Object.defineProperty(unionToIntersection, "__esModule", { value: true });
var valueOf = {};
Object.defineProperty(valueOf, "__esModule", { value: true });
var xor = {};
Object.defineProperty(xor, "__esModule", { value: true });
var markOptional = {};
Object.defineProperty(markOptional, "__esModule", { value: true });
var markReadonly = {};
Object.defineProperty(markReadonly, "__esModule", { value: true });
var markRequired = {};
Object.defineProperty(markRequired, "__esModule", { value: true });
var markWritable = {};
Object.defineProperty(markWritable, "__esModule", { value: true });
var buildable = {};
Object.defineProperty(buildable, "__esModule", { value: true });
var deepNonNullable = {};
Object.defineProperty(deepNonNullable, "__esModule", { value: true });
var deepNullable = {};
Object.defineProperty(deepNullable, "__esModule", { value: true });
var deepOmit = {};
Object.defineProperty(deepOmit, "__esModule", { value: true });
var deepPartial = {};
Object.defineProperty(deepPartial, "__esModule", { value: true });
var deepPick = {};
Object.defineProperty(deepPick, "__esModule", { value: true });
var deepReadonly = {};
Object.defineProperty(deepReadonly, "__esModule", { value: true });
var deepRequired = {};
Object.defineProperty(deepRequired, "__esModule", { value: true });
var deepUndefinable = {};
Object.defineProperty(deepUndefinable, "__esModule", { value: true });
var deepWritable = {};
Object.defineProperty(deepWritable, "__esModule", { value: true });
var optionalKeys = {};
Object.defineProperty(optionalKeys, "__esModule", { value: true });
var pickKeys = {};
Object.defineProperty(pickKeys, "__esModule", { value: true });
var readonlyKeys = {};
Object.defineProperty(readonlyKeys, "__esModule", { value: true });
var requiredKeys = {};
Object.defineProperty(requiredKeys, "__esModule", { value: true });
var writableKeys = {};
Object.defineProperty(writableKeys, "__esModule", { value: true });
var exact = {};
Object.defineProperty(exact, "__esModule", { value: true });
var isAny = {};
Object.defineProperty(isAny, "__esModule", { value: true });
var isNever = {};
Object.defineProperty(isNever, "__esModule", { value: true });
var isUnknown = {};
Object.defineProperty(isUnknown, "__esModule", { value: true });
var isTuple = {};
Object.defineProperty(isTuple, "__esModule", { value: true });
var nonEmptyObject = {};
Object.defineProperty(nonEmptyObject, "__esModule", { value: true });
var anyArray = {};
Object.defineProperty(anyArray, "__esModule", { value: true });
var arrayOrSingle = {};
Object.defineProperty(arrayOrSingle, "__esModule", { value: true });
var elementOf = {};
Object.defineProperty(elementOf, "__esModule", { value: true });
var head = {};
Object.defineProperty(head, "__esModule", { value: true });
var nonEmptyArray = {};
Object.defineProperty(nonEmptyArray, "__esModule", { value: true });
var readonlyArrayOrSingle = {};
Object.defineProperty(readonlyArrayOrSingle, "__esModule", { value: true });
var tail = {};
Object.defineProperty(tail, "__esModule", { value: true });
var tuple = {};
Object.defineProperty(tuple, "__esModule", { value: true });
var camelCase = {};
Object.defineProperty(camelCase, "__esModule", { value: true });
var deepCamelCaseProperties = {};
Object.defineProperty(deepCamelCaseProperties, "__esModule", { value: true });
var anyFunction = {};
Object.defineProperty(anyFunction, "__esModule", { value: true });
var predicateFunction = {};
Object.defineProperty(predicateFunction, "__esModule", { value: true });
var predicateType = {};
Object.defineProperty(predicateType, "__esModule", { value: true });
var unreachableCaseError = {};
Object.defineProperty(unreachableCaseError, "__esModule", { value: true });
unreachableCaseError.UnreachableCaseError = void 0;
class UnreachableCaseError extends Error {
  constructor(value) {
    super(`Unreachable case: ${value}`);
  }
}
unreachableCaseError.UnreachableCaseError = UnreachableCaseError;
var assert$1 = {};
Object.defineProperty(assert$1, "__esModule", { value: true });
assert$1.assert = void 0;
function assert(condition, message = "no additional info provided") {
  if (!condition) {
    throw new Error("Assertion Error: " + message);
  }
}
assert$1.assert = assert;
var createFactoryWithConstraint$1 = {};
Object.defineProperty(createFactoryWithConstraint$1, "__esModule", { value: true });
createFactoryWithConstraint$1.createFactoryWithConstraint = void 0;
const createFactoryWithConstraint = () => (value) => value;
createFactoryWithConstraint$1.createFactoryWithConstraint = createFactoryWithConstraint;
var isExact$1 = {};
Object.defineProperty(isExact$1, "__esModule", { value: true });
isExact$1.isExact = void 0;
const isExact = () => (actual) => {
  return actual;
};
isExact$1.isExact = isExact;
var noop$1 = {};
Object.defineProperty(noop$1, "__esModule", { value: true });
noop$1.noop = void 0;
function noop(..._args) {
}
noop$1.noop = noop;
var awaited = {};
Object.defineProperty(awaited, "__esModule", { value: true });
(function(exports) {
  var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p2 in m)
      if (p2 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p2))
        __createBinding(exports2, m, p2);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(primitive, exports);
  __exportStar(builtIn, exports);
  __exportStar(keyOfBase, exports);
  __exportStar(strictExclude, exports);
  __exportStar(strictExtract, exports);
  __exportStar(strictOmit, exports);
  __exportStar(writable, exports);
  __exportStar(asyncOrSync, exports);
  __exportStar(asyncOrSyncType, exports);
  __exportStar(dictionary, exports);
  __exportStar(dictionaryValues, exports);
  __exportStar(merge, exports);
  __exportStar(mergeN, exports);
  __exportStar(newable, exports);
  __exportStar(nonNever, exports);
  __exportStar(omitProperties, exports);
  __exportStar(opaque, exports);
  __exportStar(pickProperties, exports);
  __exportStar(safeDictionary, exports);
  __exportStar(unionToIntersection, exports);
  __exportStar(valueOf, exports);
  __exportStar(xor, exports);
  __exportStar(markOptional, exports);
  __exportStar(markReadonly, exports);
  __exportStar(markRequired, exports);
  __exportStar(markWritable, exports);
  __exportStar(buildable, exports);
  __exportStar(deepNonNullable, exports);
  __exportStar(deepNullable, exports);
  __exportStar(deepOmit, exports);
  __exportStar(deepPartial, exports);
  __exportStar(deepPick, exports);
  __exportStar(deepReadonly, exports);
  __exportStar(deepRequired, exports);
  __exportStar(deepUndefinable, exports);
  __exportStar(deepWritable, exports);
  __exportStar(optionalKeys, exports);
  __exportStar(pickKeys, exports);
  __exportStar(readonlyKeys, exports);
  __exportStar(requiredKeys, exports);
  __exportStar(writableKeys, exports);
  __exportStar(exact, exports);
  __exportStar(isAny, exports);
  __exportStar(isNever, exports);
  __exportStar(isUnknown, exports);
  __exportStar(isTuple, exports);
  __exportStar(nonEmptyObject, exports);
  __exportStar(anyArray, exports);
  __exportStar(arrayOrSingle, exports);
  __exportStar(elementOf, exports);
  __exportStar(head, exports);
  __exportStar(nonEmptyArray, exports);
  __exportStar(readonlyArrayOrSingle, exports);
  __exportStar(tail, exports);
  __exportStar(tuple, exports);
  __exportStar(camelCase, exports);
  __exportStar(deepCamelCaseProperties, exports);
  __exportStar(anyFunction, exports);
  __exportStar(predicateFunction, exports);
  __exportStar(predicateType, exports);
  __exportStar(unreachableCaseError, exports);
  __exportStar(assert$1, exports);
  __exportStar(createFactoryWithConstraint$1, exports);
  __exportStar(isExact$1, exports);
  __exportStar(noop$1, exports);
  __exportStar(awaited, exports);
})(dist);
var __async$B = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class Background {
  constructor(id, assets, flip, scale2, compositeMode, filters) {
    this.id = id;
    this.assets = assets;
    this.flip = flip;
    this.scale = scale2;
    this.compositeMode = compositeMode;
    this.filters = filters;
  }
  render(rx) {
    return __async$B(this, null, function* () {
      const { screenWidth: screenWidth2, screenHeight: screenHeight2 } = getConstants().Base;
      const images = yield Promise.all(
        this.assets.map((asset) => getAAsset(asset, rx.hq))
      );
      for (const image of images) {
        let x = 0;
        let y = 0;
        let w = image.width;
        let h2 = image.height;
        const scale2 = this.scale;
        switch (scale2) {
          case ScalingModes.None:
            x = screenWidth2 / 2 - w / 2;
            y = screenHeight2 / 2 - h2 / 2;
            break;
          case ScalingModes.Stretch:
            w = screenWidth2;
            h2 = screenHeight2;
            break;
          case ScalingModes.Cover: {
            const ratio = w / h2;
            const screenRatio = screenWidth2 / screenHeight2;
            if (ratio > screenRatio) {
              h2 = screenHeight2;
              w = h2 * ratio;
            } else {
              w = screenWidth2;
              h2 = w / ratio;
            }
            x = screenWidth2 / 2 - w / 2;
            y = screenHeight2 / 2 - h2 / 2;
            break;
          }
          default:
            throw new dist.UnreachableCaseError(scale2);
        }
        rx.drawImage({
          image,
          x,
          y,
          w,
          h: h2,
          flip: this.flip,
          composite: this.compositeMode,
          filters: this.filters
        });
      }
    });
  }
}
const color = {
  id: "buildin.static-color",
  name: "Static color",
  color: "#000000",
  render(rx) {
    const { screenWidth: screenWidth2, screenHeight: screenHeight2 } = getConstants().Base;
    rx.drawRect({
      x: 0,
      y: 0,
      w: screenWidth2,
      h: screenHeight2,
      fill: { style: this.color }
    });
    return Promise.resolve();
  }
};
function roundedRectangle(ctx, x, y, w, h2, r) {
  if (w < 0)
    w = 0;
  if (h2 < 0)
    h2 = 0;
  if (w < 2 * r)
    r = w / 2;
  if (h2 < 2 * r)
    r = h2 / 2;
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h2, r);
  ctx.arcTo(x + w, y + h2, x, y + h2, r);
  ctx.arcTo(x, y + h2, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function roundedTopRectangle(ctx, x, y, w, h2, r) {
  if (w < 0)
    w = 0;
  if (h2 < 0)
    h2 = 0;
  if (w < 2 * r)
    r = w / 2;
  if (h2 < 2 * r)
    r = h2 / 2;
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h2, r);
  ctx.lineTo(x + w, y + h2);
  ctx.lineTo(x, y + h2);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function ctxScope(ctx, callback) {
  ctx.save();
  try {
    callback();
  } finally {
    ctx.restore();
  }
}
function applyStyle(ctx, params) {
  if (params.align) {
    ctx.textAlign = params.align;
  }
  if (params.font) {
    ctx.font = params.font;
  }
  if (params.fill) {
    ctx.fillStyle = params.fill.style;
  }
  if (params.outline) {
    ctx.strokeStyle = params.outline.style;
    ctx.lineWidth = params.outline.width;
  }
}
function applyFilter(ctx, filters) {
  if (!("filter" in ctx)) {
    let opacityCombined = 1;
    for (const filter of filters) {
      if (filter.type === "opacity") {
        opacityCombined *= filter.value;
      }
    }
    ctx.globalAlpha *= opacityCombined;
  } else {
    let filterStr = "";
    for (const filter of filters) {
      if (filter.type === "drop-shadow") {
        filterStr += ` drop-shadow(${filter.offsetX}px ${filter.offsetY}px ${filter.blurRadius}px ${filter.color})`;
      } else if (filter.type === "hue-rotate") {
        filterStr += ` hue-rotate(${filter.value}deg)`;
      } else if (filter.type === "blur") {
        filterStr += ` blur(${filter.value}px)`;
      } else {
        filterStr += ` ${filter.type}(${filter.value * 100}%)`;
      }
    }
    ctx.filter = (ctx.filter === "none" ? "" : ctx.filter) + filterStr.trimStart();
  }
}
var __defProp$x = Object.defineProperty;
var __defNormalProp$x = (obj, key, value) => key in obj ? __defProp$x(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$f = (obj, key, value) => {
  __defNormalProp$x(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class Renderable {
  constructor(obj) {
    this.obj = obj;
    __publicField$f(this, "lastVersion", null);
    __publicField$f(this, "localCanvasInvalid", true);
    __publicField$f(this, "lastHit", null);
    __publicField$f(this, "lastLocalTransform", null);
    __publicField$f(this, "refTextbox", null);
    __publicField$f(this, "preparedTransform");
    __publicField$f(this, "hitDetectionFallback", false);
    __publicField$f(this, "localCanvas", null);
  }
  get id() {
    return this.obj.id;
  }
  get canSkipLocal() {
    return false;
  }
  get transformIsLocal() {
    return false;
  }
  get height() {
    return this.obj.height;
  }
  get width() {
    return this.obj.width;
  }
  get x() {
    return this.obj.x;
  }
  get y() {
    return this.obj.y;
  }
  getTransfrom() {
    let transform = new DOMMatrix();
    const obj = this.obj;
    transform = transform.translate(this.x, this.y);
    const h2 = this.height / 2 * obj.scaleX;
    if ("close" in obj && obj.close) {
      transform = transform.translate(0, getConstants().Base.CloseUpYOffset);
      transform = transform.translate(0, -h2);
      transform = transform.scale(2, 2);
      transform = transform.translate(0, h2);
    }
    if (this.isTalking && obj.enlargeWhenTalking) {
      transform = transform.translate(0, +h2);
      transform = transform.scale(1.05, 1.05);
      transform = transform.translate(0, -h2);
    }
    if (obj.flip || obj.rotation !== 0 || obj.scaleX !== 1 || obj.scaleY !== 1 || obj.skewX !== 0 || obj.skewY !== 0) {
      if (obj.rotation !== 0) {
        transform = transform.rotate(0, 0, obj.rotation);
      }
      if (obj.skewX !== 0) {
        transform = transform.skewX(obj.skewX);
      }
      if (obj.skewY !== 0) {
        transform = transform.skewY(obj.skewY);
      }
      if (obj.flip) {
        transform = transform.flipX();
      }
      if (obj.scaleX !== 1 || obj.scaleY !== 1) {
        transform = transform.scale(obj.scaleX, obj.scaleY);
      }
    }
    return transform;
  }
  getLocalSize() {
    if (this.transformIsLocal) {
      const constants = getConstants();
      return new DOMPointReadOnly(
        constants.Base.screenWidth,
        constants.Base.screenHeight
      );
    } else {
      return new DOMPointReadOnly(this.width, this.height);
    }
  }
  get isTalking() {
    return this.refTextbox !== null;
  }
  get linkedTo() {
    return this.obj.linkedTo;
  }
  prepareData(panel, _store) {
    this.refTextbox = null;
    const inPanel = [...panel.order, ...panel.onTopOrder];
    for (const key of inPanel) {
      const obj = panel.objects[key];
      if (obj.type === "textBox" && obj.talkingObjId === this.obj.id) {
        this.refTextbox = obj;
        return;
      }
    }
  }
  prepareTransform(relative) {
    this.preparedTransform = relative.multiply(this.getTransfrom());
    return this.preparedTransform;
  }
  prepareRender(_lq) {
    if (this.lastVersion !== this.obj.version) {
      this.localCanvasInvalid = true;
      this.lastVersion = this.obj.version;
    }
    if (this.transformIsLocal) {
      const newTransform = this.preparedTransform;
      if (!matrixEquals(newTransform, this.lastLocalTransform)) {
        this.localCanvasInvalid = true;
        this.lastLocalTransform = newTransform;
      }
    } else {
      this.lastLocalTransform = null;
    }
  }
  render(ctx, selection, preview, hq, skipLocal) {
    if (!preview)
      selection = SelectedState.None;
    if (!this.canSkipLocal || selection !== SelectedState.None) {
      skipLocal = false;
    }
    const localCanvasSize = this.getLocalSize();
    const transform = this.preparedTransform.translate(
      -this.width / 2,
      -this.height / 2
    );
    if (this.localCanvas && (this.localCanvas.width !== localCanvasSize.x || this.localCanvas.height !== localCanvasSize.y)) {
      this.localCanvasInvalid = true;
    }
    if (this.localCanvasInvalid && !skipLocal) {
      if (!this.localCanvas) {
        this.localCanvas = makeCanvas();
      }
      this.localCanvas.width = localCanvasSize.x;
      this.localCanvas.height = localCanvasSize.y;
      const localCtx = this.localCanvas.getContext("2d");
      if (!localCtx)
        throw new Error("No canvas context received. Possibly out of memory?");
      if (this.transformIsLocal) {
        localCtx.setTransform(transform);
      }
      this.renderLocal(localCtx, hq);
      this.localCanvasInvalid = false;
      localCtx.resetTransform();
    }
    const shadow = selectionColors[selection];
    ctxScope(ctx, () => {
      var _a2;
      if (shadow != null) {
        ctx.shadowColor = shadow;
        ctx.shadowBlur = 20;
      }
      if (!this.transformIsLocal || skipLocal) {
        ctx.setTransform(transform);
      }
      ctx.globalCompositeOperation = (_a2 = this.obj.composite) != null ? _a2 : "source-over";
      applyFilter(ctx, this.obj.filters);
      if (skipLocal) {
        this.renderLocal(ctx, hq);
      } else {
        ctx.drawImage(this.localCanvas, 0, 0);
      }
    });
  }
  dispose() {
  }
  hitTest(point) {
    const transposed = point.matrixTransform(
      this.preparedTransform.translate(-this.width / 2, -this.height / 2).inverse()
    );
    const localSize = this.getLocalSize();
    if (transposed.x < 0 || transposed.y < 0 || transposed.x > localSize.x || transposed.y > localSize.y) {
      console.log("Hitbox text", transposed);
      return false;
    }
    if (this.hitDetectionFallback || !this.localCanvas || this.localCanvasInvalid)
      return true;
    try {
      const target = this.transformIsLocal ? point : transposed;
      this.lastHit = target;
      const ctx = this.localCanvas.getContext("2d", {
        willReadFrequently: true
      });
      const data = ctx.getImageData(target.x | 0, target.y | 0, 1, 1).data;
      return data[3] !== 0;
    } catch (e) {
      this.hitDetectionFallback = true;
      throw e;
    }
  }
}
var __defProp$w = Object.defineProperty;
var __defNormalProp$w = (obj, key, value) => key in obj ? __defProp$w(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$e = (obj, key, value) => {
  __defNormalProp$w(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$A = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class AssetListRenderable extends Renderable {
  constructor() {
    super(...arguments);
    __publicField$e(this, "refTextbox", null);
    __publicField$e(this, "lastUploadCount", 0);
    __publicField$e(this, "lastHq", false);
    __publicField$e(this, "missingAsset", false);
    __publicField$e(this, "_canSkipLocal", false);
    __publicField$e(this, "assetList", []);
  }
  get canSkipLocal() {
    return this._canSkipLocal;
  }
  get transformIsLocal() {
    return false;
  }
  prepareData(panel, store2) {
    super.prepareData(panel, store2);
    if (this.missingAsset) {
      const uploadCount = Object.keys(store2.state.uploadUrls).length;
      if (uploadCount !== this.lastUploadCount) {
        this.lastHq = null;
      }
      this.lastUploadCount = uploadCount;
    }
  }
  prepareRender(lq) {
    super.prepareRender(lq);
    let reloadAssets = !lq !== this.lastHq;
    if (this.isAssetListOutdated()) {
      this.assetList = this.getAssetList();
      reloadAssets = !!this.assetList.find(
        (x) => !("loadedAssets" in x) || x.hasMissing
      );
    }
    if (!reloadAssets)
      return;
    this.lastHq = !lq;
    this.localCanvasInvalid = true;
    this._canSkipLocal = this.assetList.length <= 1;
    return this.loadAssets(!lq);
  }
  getAssetsSize() {
    let width = 0;
    let height = 0;
    for (const assets of this.assetList) {
      if (!("loadedAssets" in assets))
        continue;
      for (const asset of assets.loadedAssets) {
        width = Math.max(width, assets.offset[0] + asset.width);
        height = Math.max(height, assets.offset[1] + asset.height);
      }
    }
    return new DOMPointReadOnly(width, height);
  }
  loadAssets(hq) {
    const promises = [];
    this.missingAsset = false;
    for (const assetEntry of this.assetList) {
      if ("loadedAssets" in assetEntry && !assetEntry.hasMissing)
        continue;
      promises.push(
        ((assetEntry2) => __async$A(this, null, function* () {
          const assets = yield Promise.all(
            assetEntry2.assets.map((asset) => getAAsset(asset, hq))
          );
          const out = assetEntry2;
          out.loadedAssets = assets;
          out.hasMissing = assets.some((x) => x instanceof ErrorAsset);
          this.missingAsset || (this.missingAsset = out.hasMissing);
          return;
        }))(assetEntry)
      );
    }
    if (promises.length === 0)
      return;
    return Promise.all(promises);
  }
  isAssetListOutdated() {
    return this.assetList.length === 0;
  }
  renderLocal(ctx, hq) {
    var _a2;
    console.log("rerendering local");
    for (const loadedDraw of this.assetList) {
      if (!("loadedAssets" in loadedDraw))
        continue;
      for (const asset of loadedDraw.loadedAssets) {
        if (!this.canSkipLocal) {
          ctx.globalCompositeOperation = (_a2 = loadedDraw.composite) != null ? _a2 : "source-over";
        }
        if (asset instanceof ErrorAsset) {
          asset.paintOnto(ctx, {
            x: loadedDraw.offset[0],
            y: loadedDraw.offset[1],
            h: this.height,
            w: this.width
          });
        } else {
          asset.paintOnto(ctx, {
            x: loadedDraw.offset[0],
            y: loadedDraw.offset[1]
          });
        }
      }
    }
  }
}
var __defProp$v = Object.defineProperty;
var __defProps$g = Object.defineProperties;
var __getOwnPropDescs$g = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$j = Object.getOwnPropertySymbols;
var __hasOwnProp$j = Object.prototype.hasOwnProperty;
var __propIsEnum$j = Object.prototype.propertyIsEnumerable;
var __defNormalProp$v = (obj, key, value) => key in obj ? __defProp$v(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$j = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$j.call(b, prop))
      __defNormalProp$v(a, prop, b[prop]);
  if (__getOwnPropSymbols$j)
    for (var prop of __getOwnPropSymbols$j(b)) {
      if (__propIsEnum$j.call(b, prop))
        __defNormalProp$v(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$g = (a, b) => __defProps$g(a, __getOwnPropDescs$g(b));
class Character extends AssetListRenderable {
  constructor(obj, data) {
    super(obj);
    this.data = data;
  }
  prepareData(panel, store2) {
    super.prepareData(panel, store2);
    this.data = getData(store2, this.obj);
  }
  prepareRender(lq) {
    return super.prepareRender(lq);
  }
  isAssetListOutdated() {
    return true;
  }
  getAssetList() {
    const pose = getPose(this.data, this.obj);
    const currentHeads = getHeads(this.data, this.obj);
    const drawAssetsNew = [];
    const oldAssets = this.assetList || [];
    for (const renderCommand of pose.renderCommands) {
      let newAssets = null;
      switch (renderCommand.type) {
        case "head": {
          if (!currentHeads)
            continue;
          const headVariant = currentHeads.variants[this.obj.posePositions.head || 0];
          if (headVariant == null)
            continue;
          newAssets = headVariant;
          break;
        }
        case "image":
          newAssets = renderCommand.images;
          break;
        case "pose-part": {
          const posePosition = pose.positions[renderCommand.part];
          if (!posePosition || posePosition.length === 0) {
            break;
          }
          const partAssets = posePosition[this.obj.posePositions[renderCommand.part] || 0];
          if (!partAssets)
            break;
          newAssets = partAssets;
          break;
        }
      }
      if (newAssets) {
        const oldEntry = oldAssets.find((x) => x.assets === newAssets);
        if (oldEntry) {
          drawAssetsNew.push(__spreadProps$g(__spreadValues$j({}, oldEntry), {
            offset: renderCommand.offset,
            composite: renderCommand.composite
          }));
        } else {
          drawAssetsNew.push({
            assets: newAssets,
            offset: renderCommand.offset,
            composite: renderCommand.composite
          });
        }
      }
    }
    return drawAssetsNew;
  }
}
var __defProp$u = Object.defineProperty;
var __defNormalProp$u = (obj, key, value) => key in obj ? __defProp$u(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$d = (obj, key, value) => {
  __defNormalProp$u(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const aroundContextSize = 5;
class StringWalker {
  constructor(str) {
    this.str = str;
    __publicField$d(this, "pos", 0);
  }
  current() {
    return this.str[this.pos];
  }
  get around() {
    return this.str.slice(
      Math.max(0, this.pos - aroundContextSize),
      this.pos + aroundContextSize
    );
  }
  get ahead() {
    return this.str[this.pos + 1];
  }
  get behind() {
    return this.str[this.pos + 1];
  }
  next() {
    ++this.pos;
    return this.current();
  }
}
function tokenize(str, loose = true) {
  const tokens = [];
  const stringWalker = new StringWalker(str);
  let currentTokenState = tokenStateNormal;
  while (currentTokenState !== tokenStateEnd) {
    const startPos = stringWalker.pos;
    try {
      currentTokenState = currentTokenState(tokens, stringWalker);
    } catch (e) {
      if (loose && currentTokenState !== tokenText) {
        stringWalker.pos = startPos;
        currentTokenState = (contents, walker) => tokenText(contents, walker, true);
      } else {
        throw e;
      }
    }
  }
  return tokens;
}
function tokenStateNormal(contents, walker) {
  if (walker.current() === void 0)
    return tokenStateEnd;
  if (walker.current() === "{")
    return tokenStateCommand;
  if (walker.current() === "\n")
    return tokenStateNewLine;
  return tokenText;
}
function tokenStateEnd() {
  return tokenStateEnd;
}
function tokenText(contents, walker, initEscape = false) {
  const { pos } = walker;
  let textContent = "";
  let escape = initEscape;
  let nextState;
  while (true) {
    if (walker.current() === void 0) {
      nextState = tokenStateEnd;
      break;
    } else if (escape) {
      textContent += walker.current();
      escape = false;
    } else if (walker.current() === "\\") {
      escape = true;
    } else if (walker.current() === "{" || walker.current() === "\n") {
      nextState = tokenStateNormal;
      break;
    } else {
      textContent += walker.current();
    }
    walker.next();
  }
  contents.push({
    type: "text",
    pos,
    content: textContent
  });
  return nextState;
}
function error(walker, msg) {
  throw new Error(
    `Error when parsing text at position ${walker.pos}: (around: "${walker.around}") ${msg}`
  );
}
function tokenStateCommand(contents, walker) {
  const { pos } = walker;
  if (walker.current() !== "{") {
    throw new Error("Parser error: Command does not start with {");
  }
  const closing = walker.next() === "/";
  if (closing) {
    walker.next();
  }
  let commandName = "";
  let argument = "";
  let argumentsState = false;
  while (true) {
    if (walker.current() === void 0) {
      error(walker, "Unexpected end of text inside a command");
    }
    if (walker.current() === "}") {
      break;
    } else if (!argumentsState) {
      if (walker.current().match(/[a-z]/i)) {
        commandName += walker.current();
      } else if (walker.current() === "=") {
        if (closing) {
          error(walker, "Closing commands may not contain arguments");
        }
        argumentsState = true;
      } else {
        error(
          walker,
          `Unexpected character '${walker.current()}' in command name.`
        );
      }
    } else {
      argument += walker.current();
    }
    walker.next();
  }
  walker.next();
  if (closing) {
    contents.push({
      type: "commandClose",
      commandName,
      pos
    });
  } else {
    contents.push({
      type: "command",
      pos,
      argument,
      commandName
    });
  }
  return tokenStateNormal;
}
function tokenStateNewLine(contents, walker) {
  contents.push({ type: "newline", pos: walker.pos });
  walker.next();
  return tokenStateNormal;
}
var __defProp$t = Object.defineProperty;
var __defProps$f = Object.defineProperties;
var __getOwnPropDescs$f = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$i = Object.getOwnPropertySymbols;
var __hasOwnProp$i = Object.prototype.hasOwnProperty;
var __propIsEnum$i = Object.prototype.propertyIsEnumerable;
var __defNormalProp$t = (obj, key, value) => key in obj ? __defProp$t(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$i = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$i.call(b, prop))
      __defNormalProp$t(a, prop, b[prop]);
  if (__getOwnPropSymbols$i)
    for (var prop of __getOwnPropSymbols$i(b)) {
      if (__propIsEnum$i.call(b, prop))
        __defNormalProp$t(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$f = (a, b) => __defProps$f(a, __getOwnPropDescs$f(b));
const textCommands = new Map([
  paramlessOp("i", (style) => __spreadProps$f(__spreadValues$i({}, style), { isItalic: true })),
  paramlessOp("b", (style) => __spreadProps$f(__spreadValues$i({}, style), { isBold: true })),
  paramlessOp("u", (style) => __spreadProps$f(__spreadValues$i({}, style), { isUnderlined: true })),
  paramlessOp("s", (style) => __spreadProps$f(__spreadValues$i({}, style), {
    isStrikethrough: true
  })),
  paramlessOp("plain", (style) => __spreadProps$f(__spreadValues$i({}, style), {
    isStrikethrough: false,
    isUnderlined: false,
    isBold: false,
    isItalic: false
  })),
  paramlessOp("edited", (style) => __spreadProps$f(__spreadValues$i({}, style), {
    fontName: "verily",
    strokeColor: "#000000",
    strokeWidth: 20,
    letterSpacing: 8
  })),
  relativeNumberOp("k", (style, relative, parameter) => __spreadProps$f(__spreadValues$i({}, style), {
    letterSpacing: relative ? style.letterSpacing + parameter : parameter
  })),
  relativeNumberOp("size", (style, relative, parameter) => __spreadProps$f(__spreadValues$i({}, style), {
    fontSize: relative ? style.fontSize + parameter : parameter
  })),
  relativeNumberOp("alpha", (style, relative, parameter) => __spreadProps$f(__spreadValues$i({}, style), {
    alpha: relative ? style.alpha + parameter : parameter
  })),
  relativeNumberOp("stroke", (style, relative, parameter) => __spreadProps$f(__spreadValues$i({}, style), {
    strokeWidth: relative ? style.strokeWidth + parameter : parameter
  })),
  [
    "font",
    (style, parameter) => {
      return __spreadProps$f(__spreadValues$i({}, style), { fontName: parameter });
    }
  ],
  [
    "color",
    (style, parameter) => {
      return __spreadProps$f(__spreadValues$i({}, style), { color: parameter });
    }
  ],
  [
    "outlinecolor",
    (style, parameter) => {
      return __spreadProps$f(__spreadValues$i({}, style), { strokeColor: parameter });
    }
  ]
]);
function paramlessOp(name, op) {
  return [
    name,
    (style, parameter) => {
      if (parameter !== "") {
        throw new Error(`Operator '${name}' does not take any arguments.`);
      }
      return op(style);
    }
  ];
}
function relativeNumberOp(name, op) {
  return [
    name,
    (style, parameter) => {
      if (parameter == "")
        throw new Error(`Operator '${name}' needs an argument.`);
      const relative = parameter[0] === "+" || parameter[0] === "-";
      const num = Number(parameter);
      if (isNaN(num)) {
        throw new Error(`Operator '${name}' needs a numeric argument.`);
      }
      return op(style, relative, num);
    }
  ];
}
var __defProp$s = Object.defineProperty;
var __defNormalProp$s = (obj, key, value) => key in obj ? __defProp$s(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$c = (obj, key, value) => {
  __defNormalProp$s(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class TextRenderer {
  constructor(str, baseStyle) {
    this.str = str;
    this.baseStyle = baseStyle;
    __publicField$c(this, "renderParts");
    __publicField$c(this, "tokens");
    __publicField$c(this, "loose");
    this.loose = envX.state.looseTextParsing;
    try {
      this.tokens = tokenize(str, this.loose);
    } catch (e) {
      if (e instanceof Error) {
        this.tokens = [
          {
            type: "text",
            pos: 0,
            content: e.message
          }
        ];
      } else {
        throw e;
      }
    }
    this.rebuildParts();
  }
  rebuildParts() {
    this.renderParts = TextRenderer.getRenderParts(
      this.tokens,
      this.baseStyle,
      this.loose
    );
  }
  loadFonts() {
    if (!("fonts" in document))
      return;
    const fonts = /* @__PURE__ */ new Set();
    let currentStyle = null;
    for (const part of this.renderParts) {
      if (!("style" in part))
        continue;
      if (part.style !== currentStyle) {
        currentStyle = part.style;
        if (currentStyle.fontName) {
          fonts.add(currentStyle.fontName);
        }
      }
    }
    const promises = [];
    for (const font of fonts) {
      const doc2 = document;
      const fontString = `8px '${font.replaceAll("'", "\\'")}'`;
      if (!doc2.fonts.check(fontString)) {
        promises.push(doc2.fonts.load(fontString));
      }
    }
    if (promises.length === 0)
      return;
    return Promise.all(promises).then(() => {
      const tokens = tokenize(this.str);
      this.renderParts = TextRenderer.getRenderParts(
        tokens,
        this.baseStyle,
        this.loose
      );
    });
  }
  render(ctx) {
    ctx.save();
    let currentStyle = null;
    for (const part of this.renderParts) {
      if (part.type === "newline")
        continue;
      if (part.style !== currentStyle) {
        currentStyle = part.style;
        applyTextStyleToCanvas(currentStyle, ctx);
      }
      if (currentStyle.strokeWidth > 0 && currentStyle.strokeColor > "") {
        ctx.strokeText(part.character, part.x, part.y);
      }
    }
    for (const part of this.renderParts) {
      if (part.type === "newline")
        continue;
      if (part.style !== currentStyle) {
        currentStyle = part.style;
        applyTextStyleToCanvas(currentStyle, ctx);
      }
      ctx.fillText(part.character, part.x, part.y);
    }
    ctx.restore();
  }
  quote() {
    let State;
    ((State2) => {
      State2[State2["None"] = 0] = "None";
      State2[State2["ExplictQuote"] = 1] = "ExplictQuote";
      State2[State2["ImplictQuote"] = 2] = "ImplictQuote";
      State2[State2["Star"] = 3] = "Star";
    })(State || (State = {}));
    let lastChar = -1;
    let state = 0;
    for (let i = 0; i < this.renderParts.length; ++i) {
      const part = this.renderParts[i];
      if (part.type !== "character")
        continue;
      switch (state) {
        case 0:
          if (part.character.match(/\s/))
            continue;
          if (part.character === '"') {
            state = 1;
            lastChar = i;
          } else if (part.character === "*") {
            state = 3;
            lastChar = i;
          } else {
            this.renderParts.splice(i, 0, {
              type: "character",
              x: 0,
              y: 0,
              style: part.style,
              character: '"',
              height: part.height,
              width: measureWidth(part.style, '"')
            });
            i++;
            lastChar = i;
            state = 2;
          }
          break;
        case 1:
          lastChar = i;
          if (part.character === '"') {
            state = 0;
          }
          break;
        case 2:
          if (part.character.match(/\s/))
            continue;
          if (part.character === "*") {
            this.renderParts.splice(lastChar + 1, 0, {
              type: "character",
              x: 0,
              y: 0,
              style: part.style,
              character: '"',
              height: part.height,
              width: measureWidth(part.style, '"')
            });
            state = 3;
            i++;
          }
          lastChar = i;
          break;
        case 3:
          if (part.character === "*") {
            state = 0;
          }
          lastChar = i;
          break;
        default:
          throw new dist.UnreachableCaseError(state);
      }
    }
    const lastPart = this.renderParts[lastChar];
    if (lastPart && state === 3) {
      this.renderParts.splice(lastChar + 1, 0, {
        type: "character",
        x: 0,
        y: 0,
        style: lastPart.style,
        character: "*",
        height: lastPart.height,
        width: measureWidth(lastPart.style, '"')
      });
    }
    if (lastPart && (state === 1 || state === 2)) {
      this.renderParts.splice(lastChar + 1, 0, {
        type: "character",
        x: 0,
        y: 0,
        style: lastPart.style,
        character: '"',
        height: lastPart.height,
        width: measureWidth(lastPart.style, '"')
      });
    }
  }
  fixAlignment(alignment, xStart, xEnd, yStart, maxLineWidth) {
    let lineWidth = 0;
    let currentLine = [];
    function fixLine() {
      let x = xStart;
      if (alignment === "center") {
        x = xStart + (xEnd - xStart) / 2 - lineWidth / 2;
      } else if (alignment === "right") {
        x = xEnd - lineWidth;
      }
      for (const item of currentLine) {
        item.x = x;
        x += item.width;
      }
    }
    let renderParts = this.renderParts;
    if (maxLineWidth > 0) {
      renderParts = TextRenderer.applyLineWrapping(
        this.renderParts.slice(0),
        maxLineWidth
      );
    }
    let y = yStart;
    const lineHeights = [];
    let lineHeight = 0;
    for (const item of renderParts) {
      lineHeight = Math.max(lineHeight, item.height);
      if (item.type === "newline") {
        lineHeights.push(lineHeight);
        lineHeight = 0;
      }
    }
    lineHeights.push(lineHeight);
    let line = 0;
    for (const item of renderParts) {
      lineHeight = Math.max(lineHeight, item.height);
      item.y = y;
      currentLine.push(item);
      lineWidth += item.width;
      if (item.type === "newline") {
        fixLine();
        y += lineHeights[++line] || 0;
        lineWidth = 0;
        lineHeight = 0;
        currentLine = [];
      } else if (item.type === "character") {
        const lastItem = currentLine[currentLine.length - 1];
        if (lastItem.type === "character") {
          lineWidth += lastItem.style.letterSpacing;
          lastItem.width += lastItem.style.letterSpacing;
        }
      }
    }
    fixLine();
  }
  getHeight(maxLineWidth) {
    let lineHeight = 0;
    let height = 0;
    const renderParts = maxLineWidth === 0 ? this.renderParts : TextRenderer.applyLineWrapping(
      this.renderParts.slice(0),
      maxLineWidth
    );
    for (const item of renderParts) {
      lineHeight = Math.max(lineHeight, item.height);
      if (item.type === "newline") {
        height += lineHeight;
        lineHeight = 0;
      }
    }
    height += lineHeight;
    return height;
  }
  getWidth() {
    let lineWidth = 0;
    let maxLineWidth = 0;
    let lastItemInLine = null;
    for (const item of this.renderParts) {
      lineWidth += item.width;
      if (item.type === "newline") {
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
        lineWidth = 0;
        lastItemInLine = null;
      } else if (item.type === "character") {
        if (lastItemInLine && lastItemInLine.type === "character") {
          lineWidth += lastItemInLine.style.letterSpacing;
        }
        lastItemInLine = item;
      }
    }
    maxLineWidth = Math.max(maxLineWidth, lineWidth);
    return maxLineWidth;
  }
  static getRenderParts(tokens, baseStyle, loose) {
    const renderParts = [];
    const styleStack = [];
    const tagStack = [];
    let currentStyleHeight = measureHeight(baseStyle);
    let currentStyle = baseStyle;
    let currentTag = null;
    function pushCharacters(str) {
      for (const character of str) {
        renderParts.push({
          type: "character",
          character,
          height: currentStyleHeight,
          width: measureWidth(currentStyle, character),
          style: currentStyle,
          x: 0,
          y: 0
        });
      }
    }
    for (const token of tokens) {
      const type = token.type;
      switch (type) {
        case "command":
          if (textCommands.has(token.commandName)) {
            styleStack.push(currentStyle);
            tagStack.push(currentTag);
            currentStyle = textCommands.get(token.commandName)(
              currentStyle,
              token.argument
            );
            currentStyleHeight = measureHeight(currentStyle);
            currentTag = token;
          } else {
            if (loose) {
              pushCharacters("{" + token.commandName + "}");
            } else {
              throw new Error(
                `There is no text command called '${token.commandName}' at position ${token.pos}.`
              );
            }
          }
          break;
        case "commandClose":
          if (!currentTag) {
            if (loose) {
              pushCharacters("{/" + token.commandName + "}");
              break;
            } else {
              throw new Error(
                `Unmatched closing command at position ${token.pos}. Closed '${token.commandName}', but no commands are currently open.`
              );
            }
          }
          if (token.commandName !== currentTag.commandName) {
            if (loose) {
              pushCharacters("{/" + token.commandName + "}");
              break;
            } else {
              throw new Error(
                `Unmatched closing command at position ${token.pos}. Closed '${token.commandName}', expected to close '${currentTag}' first. (Opened at position ${currentTag.pos})`
              );
            }
          }
          currentTag = tagStack.pop();
          currentStyle = styleStack.pop();
          break;
        case "newline":
          renderParts.push({
            height: currentStyleHeight,
            width: 0,
            x: 0,
            y: 0,
            type: "newline"
          });
          break;
        case "text":
          pushCharacters(token.content);
          break;
        default:
          throw new dist.UnreachableCaseError(type);
      }
    }
    return renderParts;
  }
  static applyLineWrapping(parts, maxLineWidth) {
    let lastBreakPoint = -1;
    let currentLineWidth = 0;
    let lastBreakLineWidth = 0;
    const newParts = [];
    for (const item of parts) {
      if (item.type === "newline") {
        lastBreakPoint = -1;
        currentLineWidth = 0;
        lastBreakLineWidth = 0;
        newParts.push(item);
      } else if (item.type === "character") {
        if (item.character === " ") {
          if (currentLineWidth > maxLineWidth) {
            lastBreakPoint = -1;
            currentLineWidth = 0;
            lastBreakLineWidth = 0;
            newParts.push({
              type: "newline",
              height: item.height,
              width: 0,
              x: 0,
              y: 0
            });
          } else {
            currentLineWidth += item.width;
            lastBreakLineWidth = currentLineWidth;
            lastBreakPoint = newParts.length;
            newParts.push(item);
          }
        } else {
          currentLineWidth += item.width;
          if (currentLineWidth > maxLineWidth && lastBreakPoint !== -1) {
            currentLineWidth -= lastBreakLineWidth;
            newParts.splice(lastBreakPoint, 1, {
              type: "newline",
              height: item.height,
              width: 0,
              x: 0,
              y: 0
            });
            lastBreakPoint = -1;
            lastBreakLineWidth = 0;
            newParts.push(item);
          } else {
            newParts.push(item);
          }
        }
      } else {
        throw new dist.UnreachableCaseError(item);
      }
    }
    return newParts;
  }
}
const tmpCanvas = makeCanvas();
tmpCanvas.width = 0;
tmpCanvas.height = 0;
const tmpContext = tmpCanvas.getContext("2d");
let lastStyle = null;
function measureWidth(textStyle, character) {
  if (textStyle !== lastStyle) {
    applyTextStyleToCanvas(textStyle, tmpContext);
    lastStyle = textStyle;
  }
  return tmpContext.measureText(character).width;
}
const heightCache = /* @__PURE__ */ new Map();
function measureHeight(textStyle) {
  const font = textStyle.fontSize + " " + textStyle.fontName;
  if (heightCache.has(font)) {
    return heightCache.get(font) * textStyle.lineSpacing;
  }
  const text = document.createElement("span");
  text.innerHTML = "Hg";
  text.style.fontFamily = textStyle.fontName;
  text.style.fontSize = `${textStyle.fontSize}px`;
  text.style.lineHeight = "1";
  const div = document.createElement("div");
  div.style.opacity = "0";
  div.style.fontFamily = textStyle.fontName;
  div.style.fontSize = `${textStyle.fontSize}px`;
  div.style.lineHeight = "1";
  div.style.position = "absolute";
  div.style.top = "0";
  div.style.left = "0";
  div.appendChild(text);
  document.body.appendChild(div);
  try {
    const height = div.offsetHeight;
    heightCache.set(font, height);
    return height * textStyle.lineSpacing;
  } finally {
    div.remove();
  }
}
function applyTextStyleToCanvas(style, ctx) {
  ctx.textAlign = "left";
  ctx.font = (style.isItalic ? "italic " : "") + (style.isBold ? "bold " : "") + style.fontSize + "px " + style.fontName;
  ctx.lineJoin = "round";
  if (style.strokeWidth > 0 && style.strokeColor > "") {
    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = style.strokeWidth;
  } else {
    ctx.strokeStyle = "";
    ctx.lineWidth = 0;
  }
  ctx.globalAlpha = style.alpha || 0;
  ctx.fillStyle = style.color;
}
class ScalingRenderable extends Renderable {
  get canSkipLocal() {
    return this.obj.composite === "source-over" && this.obj.filters.length === 0;
  }
  get transformIsLocal() {
    const transform = this.preparedTransform;
    if (this.obj.overflow)
      return true;
    if (envX.supports.limitedCanvasSpace)
      return false;
    return !(transform.a === 1 && transform.b === 0 && transform.c === 0 && transform.d === 1);
  }
}
var __defProp$r = Object.defineProperty;
var __defNormalProp$r = (obj, key, value) => key in obj ? __defProp$r(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$b = (obj, key, value) => {
  __defNormalProp$r(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class Choice extends ScalingRenderable {
  constructor() {
    super(...arguments);
    __publicField$b(this, "_height", 0);
    __publicField$b(this, "choiceRenderers", []);
  }
  get height() {
    const constants = getConstants().Choices;
    return this._height + constants.ChoiceOuterPadding * 2;
  }
  get width() {
    const constants = getConstants().Choices;
    return this.obj.width + constants.ChoiceOuterPadding * 2;
  }
  renderLocal(ctx, _hq) {
    const constants = getConstants().Choices;
    const w = this.obj.width;
    const x = constants.ChoiceOuterPadding;
    let y = constants.ChoiceOuterPadding;
    for (const choiceRenderer of this.choiceRenderers) {
      const height = choiceRenderer.getHeight(this.obj.autoWrap ? w : 0);
      ctx.strokeStyle = constants.ChoiceButtonBorderColor;
      ctx.lineWidth = constants.Outline;
      ctx.fillStyle = constants.ChoiceButtonColor;
      ctx.fillRect(x, y, w, height + constants.ChoicePadding * 2);
      ctx.strokeRect(x, y, w, height + constants.ChoicePadding * 2);
      choiceRenderer.fixAlignment(
        "center",
        x,
        w,
        y + constants.ChoiceSpacing * 1.25,
        this.obj.autoWrap ? w : 0
      );
      choiceRenderer.render(ctx);
      y += height + constants.ChoicePadding * 2 + constants.ChoiceSpacing;
    }
  }
  prepareRender(lq) {
    const constants = getConstants();
    this.choiceRenderers = this.obj.choices.map(
      (choice) => new TextRenderer(choice.text || " ", constants.Choices.ChoiceTextStyle)
    );
    const computeHeight = () => {
      this._height = this.choiceRenderers.reduce(
        (acc, renderer2) => acc + renderer2.getHeight(this.obj.autoWrap ? this.obj.width : 0) + constants.Choices.ChoicePadding * 2,
        0
      ) + this.obj.choiceDistance * (this.obj.choices.length - 1);
      return super.prepareRender(lq);
    };
    const fontLoaders = this.choiceRenderers.map((x) => x.loadFonts()).filter((x) => x !== void 0);
    if (fontLoaders.length === 0) {
      computeHeight();
    } else {
      return Promise.all(fontLoaders).then(computeHeight);
    }
  }
}
var __defProp$q = Object.defineProperty;
var __defNormalProp$q = (obj, key, value) => key in obj ? __defProp$q(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$a = (obj, key, value) => {
  __defNormalProp$q(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class Notification extends ScalingRenderable {
  constructor() {
    super(...arguments);
    __publicField$a(this, "_height", 0);
    __publicField$a(this, "_width", 0);
    __publicField$a(this, "_textRenderer", null);
    __publicField$a(this, "_buttonRenderer", null);
  }
  get height() {
    const constants = getConstants().Choices;
    return this._height + constants.ChoiceOuterPadding * 2;
  }
  get width() {
    const constants = getConstants().Choices;
    return this._width + constants.ChoiceOuterPadding * 2;
  }
  prepareRender(lq) {
    const superRet = super.prepareRender(lq);
    const constants = getConstants().Notification;
    const textRenderer = this._textRenderer = new TextRenderer(
      this.obj.text,
      constants.NotificationTextStyle
    );
    const buttonRenderer = this._buttonRenderer = new TextRenderer(
      "OK",
      constants.NotificationOkTextStyle
    );
    const loadTextFonts = textRenderer.loadFonts();
    const loadButtonFonts = buttonRenderer.loadFonts();
    const fixSize = () => {
      const lineWrap = this.obj.autoWrap ? this.obj.width - constants.NotificationPadding * 2 : 0;
      const textWidth = this.obj.autoWrap ? lineWrap : textRenderer.getWidth();
      const textHeight = textRenderer.getHeight(lineWrap);
      const buttonWidth = this.obj.autoWrap ? lineWrap : buttonRenderer.getWidth();
      const buttonHeight = buttonRenderer.getHeight(lineWrap);
      this._width = Math.max(textWidth, buttonWidth) + constants.NotificationPadding * 2;
      this._height = textHeight + constants.NotificationPadding * 2 + constants.NotificationSpacing + buttonHeight;
    };
    if (superRet || loadTextFonts || loadButtonFonts)
      return Promise.all([superRet, loadTextFonts, loadButtonFonts]).then(
        fixSize
      );
    fixSize();
    return;
  }
  render(ctx, selection, preview, hq, skipLocal) {
    if (this.obj.backdrop) {
      ctxScope(ctx, () => {
        const constants = getConstants();
        ctx.resetTransform();
        ctx.fillStyle = constants.Notification.NotificationBackdropColor;
        ctx.fillRect(
          0,
          0,
          constants.Base.screenWidth,
          constants.Base.screenHeight
        );
      });
    }
    return super.render(ctx, selection, preview, hq, skipLocal);
  }
  renderLocal(ctx, _hq) {
    const constants = getConstants();
    const lineWrap = this.obj.autoWrap ? this.obj.width - constants.Notification.NotificationPadding * 2 : 0;
    const textRenderer = this._textRenderer;
    const buttonRenderer = this._buttonRenderer;
    const w = this._width;
    const h2 = this._height;
    const p2 = constants.Choices.ChoiceOuterPadding;
    ctx.fillStyle = constants.Choices.ChoiceButtonColor, ctx.strokeStyle = constants.Choices.ChoiceButtonBorderColor;
    ctx.lineWidth = constants.Choices.Outline;
    ctx.fillRect(p2, p2, w, h2);
    ctx.strokeRect(p2, p2, w, h2);
    textRenderer.fixAlignment(
      "center",
      p2,
      w + p2,
      p2 + constants.Notification.NotificationPadding * 1.5,
      lineWrap
    );
    textRenderer.render(ctx);
    buttonRenderer.fixAlignment(
      "center",
      p2,
      w + p2,
      p2 + h2 - constants.Notification.NotificationPadding,
      lineWrap
    );
    buttonRenderer.render(ctx);
  }
}
var __defProp$p = Object.defineProperty;
var __defNormalProp$p = (obj, key, value) => key in obj ? __defProp$p(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$9 = (obj, key, value) => {
  __defNormalProp$p(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$z = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const consolePadding = -2;
const consoleTopPadding = 26;
const consoleLineWrapPadding = 10;
const poemTopMargin = 10;
class Poem extends ScalingRenderable {
  constructor() {
    super(...arguments);
    __publicField$9(this, "_paperHeight", null);
    __publicField$9(this, "_paperWidth", null);
    __publicField$9(this, "_paper", null);
    __publicField$9(this, "_lastPaperUrl", null);
  }
  get height() {
    var _a2;
    return (_a2 = this._paperHeight) != null ? _a2 : this.obj.height;
  }
  get width() {
    var _a2;
    return (_a2 = this._paperWidth) != null ? _a2 : this.obj.width;
  }
  prepareRender(lq) {
    const superRet = super.prepareRender(lq);
    const constants = getConstants().Poem;
    const bg = constants.poemBackgrounds[this.obj.background];
    const style = constants.poemTextStyles[this.obj.font];
    const render = new TextRenderer(this.obj.text, style);
    const fontLoading = render.loadFonts();
    let imageLoading = void 0;
    if (!bg.file.startsWith("internal:")) {
      if (this._lastPaperUrl !== bg.file) {
        imageLoading = (() => __async$z(this, null, function* () {
          this._paper = yield getAssetByUrl(
            `assets/poemBackgrounds/${bg.file}`
          );
          this._lastPaperUrl = bg.file;
          this._paperHeight = this._paper.height * constants.backgroundScale;
          this._paperWidth = this._paper.width * constants.backgroundScale;
        }))();
      }
    } else {
      this._lastPaperUrl = null;
      this._paper = null;
      this._paperHeight = null;
      this._paperWidth = null;
    }
    if (superRet || fontLoading || imageLoading) {
      return Promise.all([superRet, fontLoading, imageLoading]);
    }
    return;
  }
  renderLocal(ctx, _hq) {
    const constants = getConstants().Poem;
    const paper = constants.poemBackgrounds[this.obj.background];
    const w = this.width;
    const h2 = this.height;
    let padding = constants.poemPadding;
    let topPadding = constants.poemTopPadding;
    let lineWrapPadding = padding * 2;
    if (paper.file === "internal:console") {
      ctx.fillStyle = this.obj.consoleColor || constants.consoleBackgroundColor;
      ctx.fillRect(0, 0, w, h2);
      padding = consolePadding;
      topPadding = consoleTopPadding;
      lineWrapPadding = consoleLineWrapPadding;
    } else if (this._paper) {
      this._paper.paintOnto(ctx, {
        x: 0,
        y: 0,
        w,
        h: h2
      });
      if (!this.obj.overflow) {
        const rect = new Path2D();
        rect.rect(0, 0, w, h2);
        ctx.clip(rect);
      }
    }
    const style = constants.poemTextStyles[this.obj.font];
    const render = new TextRenderer(this.obj.text, style);
    render.fixAlignment(
      "left",
      poemTopMargin + padding,
      padding,
      topPadding + padding,
      this.obj.autoWrap ? this.width - lineWrapPadding : 0
    );
    render.render(ctx);
  }
}
class Sprite extends AssetListRenderable {
  getAssetList() {
    return [
      {
        assets: this.obj.assets,
        offset: [0, 0]
      }
    ];
  }
}
var __defProp$o = Object.defineProperty;
var __defNormalProp$o = (obj, key, value) => key in obj ? __defProp$o(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$8 = (obj, key, value) => {
  __defNormalProp$o(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$y = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class DdlcBase {
  constructor(base) {
    this.base = base;
    __publicField$8(this, "nextArrow", null);
  }
  static get defaultWidth() {
    return TextBoxWidth$1;
  }
  static get defaultHeight() {
    return TextBoxHeight$1 + NameboxHeight$1;
  }
  static get defaultX() {
    return getConstants().Base.screenWidth / 2;
  }
  static get defaultY() {
    return getConstants().Base.screenHeight - this.defaultHeight / 2 - getConstants().TextBox.TextBoxBottomSpacing;
  }
  get allowSkippingLocal() {
    return true;
  }
  get obj() {
    return this.base.obj;
  }
  get refObject() {
    return this.base.refObject;
  }
  getControlsStyle() {
    return ControlsTextStyle$1;
  }
  getControlsDisabledStyle() {
    return ControlsTextDisabledStyle$1;
  }
  get textboxStyle() {
    return TextBoxStyle$1;
  }
  renderControls(rx, y) {
    const w = this.width;
    const controlsCenter = w / 2;
    const controlsStyle = this.getControlsStyle();
    applyStyle(rx, controlsStyle);
    rx.fillText("History", controlsCenter + ControlsXHistoryOffset$1, y);
    applyStyle(
      rx,
      this.base.obj.skip ? controlsStyle : this.getControlsDisabledStyle()
    );
    rx.fillText("Skip", controlsCenter + ControlsXSkipOffset$1, y);
    applyStyle(rx, controlsStyle);
    rx.fillText(
      "Auto   Save   Load   Settings",
      controlsCenter + ControlsXStuffOffset$1,
      y
    );
  }
  prepare() {
    if (this.nextArrow instanceof ImageAsset)
      return;
    return (() => __async$y(this, null, function* () {
      this.nextArrow = yield getBuildInAsset("next");
    }))();
  }
}
var __defProp$n = Object.defineProperty;
var __defNormalProp$n = (obj, key, value) => key in obj ? __defProp$n(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$7 = (obj, key, value) => {
  __defNormalProp$n(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$x = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class Default extends DdlcBase {
  constructor() {
    super(...arguments);
    __publicField$7(this, "backgroundImage", "textbox");
    __publicField$7(this, "xOffset", 0);
    __publicField$7(this, "nameBoxAsset", null);
    __publicField$7(this, "backdropAsset", null);
  }
  static get resizable() {
    return false;
  }
  get height() {
    return TextBoxHeight$1 + NameboxHeight$1;
  }
  get width() {
    return TextBoxWidth$1;
  }
  get nameboxWidth() {
    return NameboxWidth$1;
  }
  get nameboxHeight() {
    return NameboxHeight$1;
  }
  get nameboxOffsetX() {
    return NameboxXOffset$1;
  }
  get nameboxOffsetY() {
    return NameboxTextYOffset$1;
  }
  get nameboxStyle() {
    return NameboxTextStyle$1;
  }
  get textOffsetX() {
    return TextBoxTextXOffset$1;
  }
  get textOffsetY() {
    return TextBoxTextYOffset$1;
  }
  renderNamebox(rx, x, y) {
    var _a2;
    (_a2 = this.nameBoxAsset) == null ? void 0 : _a2.paintOnto(rx, { x, y });
  }
  renderBackdrop(rx, x, y) {
    var _a2;
    x += this.xOffset;
    (_a2 = this.backdropAsset) == null ? void 0 : _a2.paintOnto(rx, { x, y });
  }
  render(rx) {
    var _a2;
    const w = this.width;
    const h2 = this.height;
    this.renderBackdrop(rx, 0, 0 + this.nameboxHeight);
    if (this.obj.talkingObjId !== null) {
      this.renderNamebox(rx, 0 + this.nameboxOffsetX, 0);
    }
    const bottom = h2;
    const controlsY = bottom - ControlsYBottomOffset$1;
    if (this.obj.controls)
      this.renderControls(rx, controlsY);
    if (this.obj.continue) {
      (_a2 = this.nextArrow) == null ? void 0 : _a2.paintOnto(rx, {
        x: w - ArrowXRightOffset$1,
        y: bottom - ArrowYBottomOffset$1
      });
    }
  }
  prepare() {
    const prep = super.prepare();
    if (!prep && this.backdropAsset && this.nameBoxAsset)
      return;
    return Promise.all([
      prep,
      this.backdropAsset instanceof ImageAsset ? void 0 : (() => __async$x(this, null, function* () {
        this.backdropAsset = yield getBuildInAsset(this.backgroundImage);
      }))(),
      this.nameBoxAsset instanceof ImageAsset ? void 0 : (() => __async$x(this, null, function* () {
        this.nameBoxAsset = yield getBuildInAsset("namebox");
      }))()
    ]);
  }
}
__publicField$7(Default, "id", "normal");
__publicField$7(Default, "label", "Normal");
__publicField$7(Default, "priority", 0);
__publicField$7(Default, "gameMode", "ddlc");
var __defProp$m = Object.defineProperty;
var __defNormalProp$m = (obj, key, value) => key in obj ? __defProp$m(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$6 = (obj, key, value) => {
  __defNormalProp$m(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class Corrupted extends Default {
  constructor() {
    super(...arguments);
    __publicField$6(this, "backgroundImage", "textbox_monika");
    __publicField$6(this, "xOffset", (TextBoxWidth$1 - TextBoxCorruptedWidth$1) / 2);
  }
}
__publicField$6(Corrupted, "id", "corrupt");
__publicField$6(Corrupted, "label", "Corrupted");
__publicField$6(Corrupted, "priority", 1);
__publicField$6(Corrupted, "gameMode", "ddlc");
var __defProp$l = Object.defineProperty;
var __defProps$e = Object.defineProperties;
var __getOwnPropDescs$e = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$h = Object.getOwnPropertySymbols;
var __hasOwnProp$h = Object.prototype.hasOwnProperty;
var __propIsEnum$h = Object.prototype.propertyIsEnumerable;
var __defNormalProp$l = (obj, key, value) => key in obj ? __defProp$l(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$h = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$h.call(b, prop))
      __defNormalProp$l(a, prop, b[prop]);
  if (__getOwnPropSymbols$h)
    for (var prop of __getOwnPropSymbols$h(b)) {
      if (__propIsEnum$h.call(b, prop))
        __defNormalProp$l(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$e = (a, b) => __defProps$e(a, __getOwnPropDescs$e(b));
var __publicField$5 = (obj, key, value) => {
  __defNormalProp$l(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class Custom extends DdlcBase {
  constructor() {
    super(...arguments);
    __publicField$5(this, "_dotPattern", null);
    __publicField$5(this, "_lastColor", null);
    __publicField$5(this, "backgroundImage", "textbox");
    __publicField$5(this, "xOffset", 0);
  }
  static get resizable() {
    return true;
  }
  get allowSkippingLocal() {
    return false;
  }
  get height() {
    return this.obj.height;
  }
  get width() {
    return this.obj.width;
  }
  get nameboxWidth() {
    if (this.refObject && this.refObject.nameboxWidth !== null) {
      return this.refObject.nameboxWidth;
    }
    if (this.obj.customNameboxWidth !== null)
      return this.obj.customNameboxWidth;
    return NameboxWidth$1;
  }
  get nameboxHeight() {
    return NameboxHeight$1;
  }
  get nameboxOffsetX() {
    return NameboxXOffset$1;
  }
  get nameboxOffsetY() {
    return NameboxTextYOffset$1;
  }
  get nameboxStyle() {
    return __spreadProps$e(__spreadValues$h({}, NameboxTextStyle$1), {
      strokeColor: this.nameboxOutlineColor,
      color: "#FFFFFF"
    });
  }
  get textOffsetX() {
    return TextBoxTextXOffset$1;
  }
  get textOffsetY() {
    return TextBoxTextYOffset$1;
  }
  get customColor() {
    if (this.obj.overrideColor)
      return this.obj.customColor;
    const refObject = this.refObject;
    if (refObject != null && refObject.textboxColor != null)
      return refObject.textboxColor;
    return textboxDefaultColor$1;
  }
  get nameboxOutlineColor() {
    if (this.obj.deriveCustomColors) {
      const base = RGBAColor.fromCss(this.customColor).toHSL();
      return base.shift(nameboxTextOutlineDelta$2).toRgb().toCss();
    }
    return this.obj.customNameboxStroke;
  }
  get nameboxBackgroundColor() {
    if (this.obj.deriveCustomColors) {
      const base = RGBAColor.fromCss(this.customColor).toHSL();
      return base.shift(nameboxBackgroundDelta$1).toRgb().toCss();
    }
    return this.obj.customNameboxColor;
  }
  renderNamebox(rx, x, y) {
    ctxScope(rx, () => {
      const w = this.nameboxWidth;
      const h2 = this.nameboxHeight;
      rx.beginPath();
      roundedTopRectangle(rx, x, y, w, h2, nameboxRounding$1);
      rx.clip();
      const gradient = rx.createLinearGradient(x, y, x, y + h2);
      const baseBG = RGBAColor.fromCss(this.nameboxBackgroundColor);
      const color2 = new RGBAColor(baseBG.r, baseBG.g, baseBG.b, 0.95);
      const targetColor = color2.toHSL().shift(nameboxGradientEndDelta$1).toRgb();
      gradient.addColorStop(0, color2.toCss());
      gradient.addColorStop(nameboxGradientMiddleStopPosition$1, color2.toCss());
      gradient.addColorStop(1, targetColor.toCss());
      rx.fillStyle = gradient;
      rx.fillRect(x, y, this.obj.width, h2);
    });
  }
  renderBackdrop(rx, y) {
    const customColor = RGBAColor.fromCss(this.customColor);
    const hslColor = customColor.toHSL();
    const h2 = this.obj.height - textboxRoundingBuffer$1 * 2 - y;
    const w = this.obj.width - textboxRoundingBuffer$1 * 2;
    ctxScope(rx, () => {
      rx.beginPath();
      roundedRectangle(rx, 0, y, w, h2, textboxRounding$1);
      rx.clip();
      const gradient = rx.createLinearGradient(0, y, 0, h2);
      gradient.addColorStop(0, customColor.toCss());
      gradient.addColorStop(
        1,
        `rgba(${customColor.r},${customColor.g},${customColor.b},0.6667)`
      );
      rx.fillStyle = gradient;
      rx.strokeStyle = "#ffdfee";
      rx.lineWidth = 6;
      rx.fillRect(0, y, w, h2);
      ctxScope(rx, () => {
        rx.translate(0, y);
        rx.fillStyle = this.getDotPattern();
        rx.globalCompositeOperation = "source-atop";
        rx.fillRect(-textboxRoundingBuffer$1, -textboxRoundingBuffer$1, w, h2);
      });
      const glowGradient = rx.createLinearGradient(
        0,
        y + h2 - GlowRY$1,
        0,
        y + h2
      );
      glowGradient.addColorStop(0, "rgba(255,255,255,0.3137)");
      glowGradient.addColorStop(0.5, "rgba(255,255,255,0.0627)");
      glowGradient.addColorStop(1, "rgba(255,255,255,0)");
      rx.fillStyle = glowGradient;
      rx.beginPath();
      rx.ellipse(
        w / 2,
        y + h2,
        GlowRX$1,
        GlowRY$1,
        0,
        0,
        2 * Math.PI
      );
      rx.closePath();
      rx.fill();
    });
    const outlineColor = hslColor.shift(textboxOutlineColorDelta$1).toRgb().toCss();
    rx.strokeStyle = outlineColor;
    rx.lineWidth = textboxOutlineWidth$1;
    rx.beginPath();
    roundedRectangle(rx, 0, y, w, h2, textboxRounding$1);
    rx.stroke();
  }
  render(rx) {
    const h2 = this.obj.height - textboxRoundingBuffer$1 * 2;
    const w = this.obj.width - textboxRoundingBuffer$1 * 2;
    rx.translate(textboxRoundingBuffer$1, textboxRoundingBuffer$1);
    if (this.obj.talkingObjId !== null) {
      this.renderNamebox(rx, this.nameboxOffsetX, 0);
    }
    this.renderBackdrop(rx, this.nameboxHeight);
    const bottom = h2;
    const controlsY = bottom - ControlsYBottomOffset$1;
    if (this.obj.controls)
      this.renderControls(rx, controlsY);
    if (this.obj.continue && this.nextArrow) {
      this.nextArrow.paintOnto(rx, {
        x: w - ArrowXRightOffset$1,
        y: bottom - ArrowYBottomOffset$1
      });
    }
  }
  getDotPattern(constants = CustomTBConstants$1) {
    if (this._dotPattern && this._lastColor === this.customColor)
      return this._dotPattern;
    const { dotPatternSize: dotPatternSize2, dotColorDelta: dotColorDelta2, dotRadius: dotRadius2 } = constants;
    const hslColor = RGBAColor.fromCss(this.customColor).toHSL();
    const dotPattern = makeCanvas();
    dotPattern.height = dotPatternSize2;
    dotPattern.width = dotPatternSize2;
    const dotRx = dotPattern.getContext("2d");
    if (!dotRx)
      throw new Error(
        "Failed to create canvas for textbox dot-pattern. Out of memory?"
      );
    dotRx.fillStyle = hslColor.shift(dotColorDelta2).toRgb().toCss();
    function drawDot(dotX, dotY) {
      dotRx.beginPath();
      dotRx.ellipse(dotX, dotY, dotRadius2, dotRadius2, 0, 0, 2 * Math.PI);
      dotRx.closePath();
      dotRx.fill();
    }
    drawDot(0, 0);
    drawDot(dotPatternSize2, 0);
    drawDot(0, dotPatternSize2);
    drawDot(dotPatternSize2, dotPatternSize2);
    drawDot(dotPatternSize2 / 2, dotPatternSize2 / 2);
    const pattern = dotRx.createPattern(dotPattern, "repeat");
    if (!pattern)
      throw new Error("Failed to create textbox dot-pattern. Out of memory?");
    this._dotPattern = pattern;
    return pattern;
  }
}
__publicField$5(Custom, "id", "custom");
__publicField$5(Custom, "label", "Custom");
__publicField$5(Custom, "priority", 0);
__publicField$5(Custom, "gameMode", "ddlc");
var __defProp$k = Object.defineProperty;
var __defNormalProp$k = (obj, key, value) => key in obj ? __defProp$k(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$4 = (obj, key, value) => {
  __defNormalProp$k(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$w = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _DdlcPlusBase = class {
  constructor(base) {
    this.base = base;
    __publicField$4(this, "nextArrow", null);
  }
  static get resizable() {
    return false;
  }
  static get defaultWidth() {
    return TextBoxWidth;
  }
  static get defaultHeight() {
    return TextBoxHeight + NameboxHeight;
  }
  static get defaultX() {
    return getConstants().Base.screenWidth / 2;
  }
  static get defaultY() {
    return getConstants().Base.screenHeight - this.defaultHeight / 2 - getConstants().TextBox.TextBoxBottomSpacing;
  }
  get allowSkippingLocal() {
    return true;
  }
  get obj() {
    return this.base.obj;
  }
  get refObject() {
    return this.base.refObject;
  }
  getControlsStyle() {
    return ControlsTextStyle;
  }
  getControlsDisabledStyle() {
    return ControlsTextDisabledStyle;
  }
  renderControls(rx, y) {
    const w = this.width;
    const w2 = w / 2;
    const baseX = w2;
    const x = baseX - w2;
    const controlsStyle = this.getControlsStyle();
    const texts = ["History", "Skip", "Auto", "Save", "Load", "Settings"];
    const textWidths = [];
    let combinedLength = 0;
    for (const text of texts) {
      const width = _DdlcPlusBase.controlWidth(rx, text);
      textWidths.push(width);
      combinedLength += width;
    }
    const spacing = Math.min((w - combinedLength) / (texts.length + 2), 78);
    let controlX = x + (w - combinedLength - spacing * (texts.length - 1)) / 2;
    for (let i = 0; i < texts.length; ++i) {
      const text = texts[i];
      const textWidth = textWidths[i];
      const style = text === "Skip" && !this.base.obj.skip ? this.getControlsDisabledStyle() : controlsStyle;
      applyStyle(rx, style);
      rx.fillText(text, controlX, y);
      controlX += textWidth + spacing;
    }
  }
  static controlWidth(rx, text) {
    if (this.widthCache[text])
      return this.widthCache[text];
    applyStyle(rx, ControlsTextStyle);
    const width = rx.measureText(text).width;
    this.widthCache[text] = width;
    return width;
  }
  prepare() {
    if (this.nextArrow instanceof ImageAsset)
      return;
    return (() => __async$w(this, null, function* () {
      this.nextArrow = yield getBuildInAsset("next_plus");
    }))();
  }
};
let DdlcPlusBase = _DdlcPlusBase;
__publicField$4(DdlcPlusBase, "widthCache", {});
var __defProp$j = Object.defineProperty;
var __defProps$d = Object.defineProperties;
var __getOwnPropDescs$d = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$g = Object.getOwnPropertySymbols;
var __hasOwnProp$g = Object.prototype.hasOwnProperty;
var __propIsEnum$g = Object.prototype.propertyIsEnumerable;
var __defNormalProp$j = (obj, key, value) => key in obj ? __defProp$j(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$g = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$g.call(b, prop))
      __defNormalProp$j(a, prop, b[prop]);
  if (__getOwnPropSymbols$g)
    for (var prop of __getOwnPropSymbols$g(b)) {
      if (__propIsEnum$g.call(b, prop))
        __defNormalProp$j(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$d = (a, b) => __defProps$d(a, __getOwnPropDescs$d(b));
var __publicField$3 = (obj, key, value) => {
  __defNormalProp$j(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class CustomPlus extends DdlcPlusBase {
  constructor() {
    super(...arguments);
    __publicField$3(this, "_lastColor", null);
    __publicField$3(this, "_dotPattern", null);
    __publicField$3(this, "backgroundImage", "textbox");
    __publicField$3(this, "xOffset", 0);
  }
  static get resizable() {
    return true;
  }
  get allowSkippingLocal() {
    return false;
  }
  get height() {
    return this.obj.height;
  }
  get width() {
    return this.obj.width;
  }
  get nameboxWidth() {
    if (this.refObject && this.refObject.nameboxWidth !== null) {
      return this.refObject.nameboxWidth;
    }
    if (this.obj.customNameboxWidth !== null)
      return this.obj.customNameboxWidth;
    return NameboxWidth;
  }
  get nameboxHeight() {
    return NameboxHeight;
  }
  get nameboxOffsetX() {
    return NameboxXOffset;
  }
  get nameboxOffsetY() {
    return NameboxTextYOffset;
  }
  get nameboxStyle() {
    return __spreadProps$d(__spreadValues$g({}, NameboxTextStyle), {
      strokeColor: this.nameboxOutlineColor,
      color: "#FFFFFF"
    });
  }
  get textOffsetX() {
    return TextBoxTextXOffset;
  }
  get textOffsetY() {
    return TextBoxTextYOffset;
  }
  get textboxStyle() {
    return TextBoxStyle;
  }
  get customColor() {
    if (this.obj.overrideColor)
      return this.obj.customColor;
    const refObject = this.refObject;
    if (refObject != null && refObject.textboxColor != null)
      return refObject.textboxColor;
    return textboxDefaultColor;
  }
  get nameboxOutlineColor() {
    if (this.obj.deriveCustomColors) {
      const base = RGBAColor.fromCss(this.customColor).toHSL();
      return base.shift(nameboxTextOutlineDelta).toRgb().toCss();
    }
    return this.obj.customNameboxStroke;
  }
  get nameboxBackgroundColor() {
    if (this.obj.deriveCustomColors) {
      const base = RGBAColor.fromCss(this.customColor).toHSL();
      return base.shift(nameboxBackgroundDelta).toRgb().toCss();
    }
    return this.obj.customNameboxColor;
  }
  renderNamebox(rx, x, y) {
    ctxScope(rx, () => {
      const w = this.nameboxWidth;
      const h2 = this.nameboxHeight;
      rx.beginPath();
      roundedTopRectangle(rx, x, y, w, h2, nameboxRounding);
      rx.clip();
      const gradient = rx.createLinearGradient(x, y, x, y + h2);
      const baseBG = RGBAColor.fromCss(this.nameboxBackgroundColor);
      const color2 = new RGBAColor(baseBG.r, baseBG.g, baseBG.b, 0.95);
      const targetColor = color2.toHSL().shift(nameboxGradientEndDelta).toRgb();
      gradient.addColorStop(0, color2.toCss());
      gradient.addColorStop(nameboxGradientMiddleStopPosition, color2.toCss());
      gradient.addColorStop(1, targetColor.toCss());
      rx.fillStyle = gradient;
      rx.fillRect(x, y, this.obj.width, h2);
    });
  }
  renderBackdrop(rx, y) {
    const h2 = this.obj.height - textboxRoundingBuffer * 2 - y;
    const w = this.obj.width - textboxRoundingBuffer * 2;
    const hslColor = RGBAColor.fromCss(this.customColor).toHSL();
    ctxScope(rx, () => {
      rx.beginPath();
      roundedRectangle(rx, 0, y, w, h2, textboxRounding);
      rx.clip();
      const gradient = rx.createLinearGradient(0, y, 0, y + h2);
      const color2 = RGBAColor.fromHex(this.customColor);
      gradient.addColorStop(0, color2.toCss());
      gradient.addColorStop(1, `rgba(${color2.r},${color2.g},${color2.b},0.6667)`);
      rx.fillStyle = gradient;
      rx.strokeStyle = "#ffdfee";
      rx.lineWidth = 6;
      rx.fillRect(0, y, w, h2);
      rx.strokeRect(0, y, w, h2);
      rx.fillStyle = this.getDotPattern();
      rx.globalCompositeOperation = "source-atop";
      rx.fillRect(0, y, w, h2);
      const glowGradient = rx.createLinearGradient(
        0,
        y + h2 - GlowRY,
        0,
        y + h2
      );
      glowGradient.addColorStop(0, "rgba(255,255,255,0.3137)");
      glowGradient.addColorStop(0.5, "rgba(255,255,255,0.0627)");
      glowGradient.addColorStop(1, "rgba(255,255,255,0)");
      rx.fillStyle = glowGradient;
      rx.beginPath();
      rx.ellipse(
        w / 2,
        y + h2,
        GlowRX,
        GlowRY,
        0,
        0,
        2 * Math.PI
      );
      rx.closePath();
      rx.fill();
    });
    const outlineColor = hslColor.shift(textboxOutlineColorDelta).toRgb().toCss();
    rx.strokeStyle = outlineColor;
    rx.lineWidth = textboxOutlineWidth;
    rx.beginPath();
    roundedRectangle(rx, 0, y, w, h2, textboxRounding);
    rx.stroke();
  }
  render(rx) {
    const h2 = this.obj.height - textboxRoundingBuffer * 2;
    const w = this.obj.width - textboxRoundingBuffer * 2;
    rx.translate(textboxRoundingBuffer, textboxRoundingBuffer);
    if (this.obj.talkingObjId !== null) {
      this.renderNamebox(rx, this.nameboxOffsetX, 0);
    }
    this.renderBackdrop(rx, this.nameboxHeight);
    const bottom = h2;
    const controlsY = bottom - ControlsYBottomOffset;
    if (this.obj.controls)
      this.renderControls(rx, controlsY);
    if (this.obj.continue && this.nextArrow) {
      this.nextArrow.paintOnto(rx, {
        x: w - ArrowXRightOffset,
        y: bottom - ArrowYBottomOffset
      });
    }
  }
  getDotPattern() {
    return Custom.prototype.getDotPattern.call(this, CustomTBConstants);
  }
}
__publicField$3(CustomPlus, "id", "custom_plus");
__publicField$3(CustomPlus, "label", "Custom (Plus)");
__publicField$3(CustomPlus, "priority", 0);
__publicField$3(CustomPlus, "gameMode", "ddlc_plus");
var __defProp$i = Object.defineProperty;
var __defNormalProp$i = (obj, key, value) => key in obj ? __defProp$i(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => {
  __defNormalProp$i(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$v = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class None extends DdlcBase {
  static get resizable() {
    return true;
  }
  get height() {
    return TextBoxHeight$1 + NameboxHeight$1;
  }
  get width() {
    return TextBoxWidth$1;
  }
  get nameboxWidth() {
    return NameboxWidth$1;
  }
  get nameboxHeight() {
    return NameboxHeight$1;
  }
  get nameboxOffsetX() {
    return NameboxXOffset$1;
  }
  get nameboxOffsetY() {
    return NameboxTextYOffset$1;
  }
  get nameboxStyle() {
    return NameboxTextStyle$1;
  }
  get textOffsetX() {
    return TextBoxTextXOffset$1;
  }
  get textOffsetY() {
    return TextBoxTextYOffset$1;
  }
  get textboxStyle() {
    return TextBoxStyle$1;
  }
  render(_rx) {
    return __async$v(this, null, function* () {
    });
  }
}
__publicField$2(None, "id", "none");
__publicField$2(None, "label", "None");
__publicField$2(None, "priority", 0);
__publicField$2(None, "gameMode", "ddlc");
var __defProp$h = Object.defineProperty;
var __defNormalProp$h = (obj, key, value) => key in obj ? __defProp$h(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => {
  __defNormalProp$h(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const styleRenderers = [
  Default,
  Corrupted,
  Custom,
  None,
  CustomPlus
];
const rendererLookup = (() => {
  const ret = {};
  for (const renderer2 of styleRenderers) {
    ret[renderer2.id] = renderer2;
  }
  return ret;
})();
class TextBox extends ScalingRenderable {
  constructor() {
    super(...arguments);
    __publicField$1(this, "nbTextRenderer", null);
    __publicField$1(this, "textRenderer", null);
    __publicField$1(this, "_lastRefVars", null);
    __publicField$1(this, "refObject", null);
    __publicField$1(this, "_lastRenderer", null);
  }
  getRefVars() {
    const refObj = this.refObject;
    if (!refObj)
      return null;
    return JSON.stringify([
      refObj.label,
      refObj.textboxColor,
      refObj.nameboxWidth
    ]);
  }
  getName() {
    var _a2, _b;
    return this.obj.talkingObjId === "$other$" ? this.obj.talkingOther : (_b = (_a2 = this.refObject) == null ? void 0 : _a2.label) != null ? _b : "Missing name";
  }
  get canSkipLocal() {
    var _a2, _b;
    return super.canSkipLocal && ((_b = (_a2 = this._lastRenderer) == null ? void 0 : _a2.allowSkippingLocal) != null ? _b : true);
  }
  prepareData(panel, store2) {
    var _a2;
    super.prepareData(panel, store2);
    if (typeof this.obj.talkingObjId === "number") {
      this.refObject = (_a2 = panel.objects[this.obj.talkingObjId]) != null ? _a2 : null;
    }
  }
  prepareRender(lq) {
    const ret = super.prepareRender(lq);
    const prepareRet = this.textboxRenderer.prepare();
    const currentRefVars = this.getRefVars();
    if (currentRefVars !== this._lastRefVars) {
      this.localCanvasInvalid = true;
      this._lastRefVars = currentRefVars;
    }
    this.nbTextRenderer = new TextRenderer(
      this.getName(),
      this.textboxRenderer.nameboxStyle
    );
    this.textRenderer = new TextRenderer(
      this.obj.text,
      this.textboxRenderer.textboxStyle
    );
    const nameFontLoad = this.nbTextRenderer.loadFonts();
    const textFontLoad = this.textRenderer.loadFonts();
    if (!ret && !prepareRet && !nameFontLoad && !textFontLoad)
      return;
    return Promise.all([ret, prepareRet, nameFontLoad, textFontLoad]);
  }
  renderLocal(ctx, _hq) {
    const styleRenderer = this.textboxRenderer;
    const w = styleRenderer.width;
    if (!this.obj.overflow) {
      const rect = new Path2D();
      rect.rect(0, 0, styleRenderer.width, this.height);
      ctx.clip(rect);
    }
    styleRenderer.render(ctx);
    if (this.obj.talkingObjId !== null) {
      this.renderName(ctx, styleRenderer.nameboxOffsetX, 0);
    }
    this.renderText(ctx, 0, 0, this.obj.autoWrap ? w : 0);
  }
  renderName(rx, x, y) {
    const styleRenderer = this.textboxRenderer;
    const w = styleRenderer.nameboxWidth;
    this.nbTextRenderer.fixAlignment(
      "center",
      x,
      x + w,
      y + styleRenderer.nameboxOffsetY,
      0
    );
    this.nbTextRenderer.render(rx);
  }
  renderText(rx, baseX, baseY, maxLineWidth) {
    const textboxRenderer = this.textboxRenderer;
    const render = this.textRenderer;
    if (this.obj.autoQuoting && this.obj.talkingObjId !== null) {
      render.quote();
    }
    render.fixAlignment(
      "left",
      baseX + textboxRenderer.textOffsetX,
      0,
      baseY + textboxRenderer.nameboxHeight + textboxRenderer.textOffsetY,
      maxLineWidth - textboxRenderer.textOffsetX * 2
    );
    render.render(rx);
  }
  get forcedStyle() {
    const refObject = this.refObject;
    if ((this.obj.style === "normal" || this.obj.style === "normal_plus") && refObject && (refObject.textboxColor != null || refObject.nameboxWidth != null))
      return "custom";
    return this.obj.style;
  }
  get textboxRenderer() {
    const forcedStyle = this.forcedStyle;
    const rendererConstructor = rendererLookup[forcedStyle];
    if (this._lastRenderer && this._lastRenderer.constructor === rendererConstructor) {
      return this._lastRenderer;
    }
    const newRenderer = new rendererConstructor(this);
    this._lastRenderer = newRenderer;
    return newRenderer;
  }
}
var __defProp$g = Object.defineProperty;
var __defNormalProp$g = (obj, key, value) => key in obj ? __defProp$g(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp$g(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$u = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _SceneRenderer = class {
  constructor(store2, _panelId, canvasWidth, canvasHeight) {
    this.store = store2;
    this._panelId = _panelId;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    __publicField(this, "renderObjectCache", /* @__PURE__ */ new Map());
    __publicField(this, "renderer");
    __publicField(this, "_disposed", false);
    this.renderer = new Renderer(canvasWidth, canvasHeight);
  }
  get panelId() {
    return this._panelId;
  }
  setPanelId(panelId) {
    if (this._disposed)
      throw new Error("Disposed scene-renderer called");
    if (this._panelId === panelId)
      return;
    this._panelId = panelId;
    this.renderObjectCache.forEach((a) => {
      a.dispose();
    });
    this.renderObjectCache.clear();
  }
  render(hq, preview, skipLocalCanvases) {
    if (this._disposed)
      throw new Error("Disposed scene-renderer called");
    if (!this.panel)
      return Promise.resolve(false);
    return this.renderer.render(
      this.renderCallback.bind(this, skipLocalCanvases),
      hq,
      preview
    );
  }
  download() {
    if (this._disposed)
      throw new Error("Disposed scene-renderer called");
    const date = new Date();
    const filename = `panel-${[
      date.getFullYear(),
      `${date.getMonth() + 1}`.padStart(2, "0"),
      `${date.getDate()}`.padStart(2, "0"),
      `${date.getHours()}`.padStart(2, "0"),
      `${date.getMinutes()}`.padStart(2, "0"),
      `${date.getSeconds()}`.padStart(2, "0")
    ].join("-")}.png`;
    return this.renderer.download(
      this.renderCallback.bind(this, true),
      filename
    );
  }
  paintOnto(c, opts) {
    this.renderer.paintOnto(c, opts);
  }
  objectsAt(x, y) {
    const point = new DOMPointReadOnly(x, y);
    return this.getRenderObjects().filter((renderObject) => renderObject.hitTest(point)).map((renderObject) => renderObject.id);
  }
  getLastRenderObject(id) {
    var _a2;
    return (_a2 = this.renderObjectCache.get(id)) != null ? _a2 : null;
  }
  renderCallback(skipLocalCanvases, rx) {
    return __async$u(this, null, function* () {
      var _a2, _b;
      if (this._disposed)
        throw new Error("Disposed scene-renderer called");
      rx.fsCtx.imageSmoothingEnabled = true;
      rx.fsCtx.imageSmoothingQuality = rx.hq ? "high" : "low";
      yield (_a2 = this.getBackgroundRenderer()) == null ? void 0 : _a2.render(rx);
      const renderables = this.getRenderObjects();
      const waiting = /* @__PURE__ */ new Map();
      const processed = /* @__PURE__ */ new Map();
      for (const renderable of renderables) {
        renderable.prepareData(this.panel, this.store);
        const linked = renderable.linkedTo;
        let linkTransform = new DOMMatrixReadOnly();
        if (linked != null) {
          const lookupTransform = processed.get(linked);
          if (lookupTransform) {
            linkTransform = lookupTransform;
          } else {
            const waitList = waiting.get(linked);
            if (waitList) {
              waitList.push(renderable);
            } else {
              waiting.set(linked, [renderable]);
            }
            continue;
          }
        }
        prepareTransform(renderable, linkTransform);
      }
      if (waiting.size > 0) {
        console.warn("Not all renderables processed. Infinite loop?");
      }
      const promises = renderables.map((x) => x.prepareRender(!rx.hq)).filter((x) => x !== void 0);
      if (promises.length > 0) {
        yield Promise.all(promises);
      }
      const selection = this.store.state.ui.selection;
      const links = /* @__PURE__ */ new Set();
      if (selection !== null)
        fetchLinks(selection, links);
      const focusedObjId = (_b = document.querySelector(_SceneRenderer.FocusProp)) == null ? void 0 : _b.getAttribute("data-obj-id");
      for (const object of renderables) {
        const selected = selection === object.id;
        const focused = focusedObjId === "" + object.id;
        object.render(
          rx.fsCtx,
          (selected ? SelectedState.Selected : links.has(object.id) ? SelectedState.Indirectly : SelectedState.None) + (focused ? SelectedState.Focused : SelectedState.None),
          rx.preview,
          rx.hq,
          skipLocalCanvases
        );
      }
      rx.applyFilters([...this.panel.filters]);
      if (rx.preview) {
        rx.drawImage({
          x: 0,
          y: 0,
          h: this.canvasHeight,
          w: this.canvasWidth,
          composite: "destination-over",
          image: yield getBuildInAsset("backgrounds/transparent")
        });
      }
      function fetchLinks(objId, links2) {
        links2.add(objId);
        for (const obj of renderables.filter((x) => x.linkedTo === objId)) {
          fetchLinks(obj.id, links2);
        }
      }
      function prepareTransform(renderable, linkTransform) {
        const newTransform = renderable.prepareTransform(linkTransform);
        processed.set(renderable.id, newTransform);
        const waitList = waiting.get(renderable.id);
        if (waitList) {
          for (const sub of waitList) {
            prepareTransform(sub, newTransform);
          }
          waiting.delete(renderable.id);
        }
      }
    });
  }
  getRenderObjects() {
    const objectsState = this.store.state.panels.panels[this.panelId];
    const order = [...objectsState.order, ...objectsState.onTopOrder];
    const objects = objectsState.objects;
    const toUncache = Array.from(this.renderObjectCache.keys()).filter(
      (id) => !order.includes(id)
    );
    for (const id of toUncache) {
      this.renderObjectCache.get(id).dispose();
      this.renderObjectCache.delete(id);
    }
    return order.map((id) => {
      let renderObject = this.renderObjectCache.get(id);
      if (!renderObject) {
        const obj = objects[id];
        const type = obj.type;
        switch (type) {
          case "sprite":
            renderObject = new Sprite(obj);
            break;
          case "character": {
            const char = obj;
            renderObject = new Character(char, getData(this.store, char));
            break;
          }
          case "textBox":
            renderObject = new TextBox(obj);
            break;
          case "choice":
            renderObject = new Choice(obj);
            break;
          case "notification":
            renderObject = new Notification(obj);
            break;
          case "poem":
            renderObject = new Poem(obj);
            break;
          default:
            throw new dist.UnreachableCaseError(type);
        }
        this.renderObjectCache.set(id, renderObject);
      }
      return renderObject;
    });
  }
  get panel() {
    return this.store.state.panels.panels[this.panelId];
  }
  getBackgroundRenderer() {
    const panel = this.panel;
    switch (panel.background.current) {
      case "buildin.static-color":
        color.color = panel.background.color;
        return color;
      default: {
        const lookup = this.store.getters["content/getBackgrounds"];
        const current = lookup.get(panel.background.current);
        if (!current)
          return null;
        const variant = current.variants[panel.background.variant];
        return new Background(
          panel.background.current,
          variant,
          panel.background.flipped,
          panel.background.scaling,
          panel.background.composite,
          panel.background.filters
        );
      }
    }
  }
  get disposed() {
    return this._disposed;
  }
  dispose() {
    this._disposed = true;
    this.renderer.dispose();
  }
};
let SceneRenderer = _SceneRenderer;
__publicField(SceneRenderer, "FocusProp", typeof CSS !== "undefined" && CSS.supports("selector(:focus-visible)") ? ":focus-visible" : ":focus");
let sceneRenderer = null;
function getMainSceneRenderer(store2) {
  if (sceneRenderer === null || sceneRenderer.disposed) {
    if (store2.state.panels.currentPanel === -1)
      return null;
    const constants = getConstants().Base;
    sceneRenderer = new SceneRenderer(
      store2,
      store2.state.panels.currentPanel,
      constants.screenWidth,
      constants.screenHeight
    );
  }
  return sceneRenderer;
}
var __defProp$f = Object.defineProperty;
var __defProps$c = Object.defineProperties;
var __getOwnPropDescs$c = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$f = Object.getOwnPropertySymbols;
var __hasOwnProp$f = Object.prototype.hasOwnProperty;
var __propIsEnum$f = Object.prototype.propertyIsEnumerable;
var __defNormalProp$f = (obj, key, value) => key in obj ? __defProp$f(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$f = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$f.call(b, prop))
      __defNormalProp$f(a, prop, b[prop]);
  if (__getOwnPropSymbols$f)
    for (var prop of __getOwnPropSymbols$f(b)) {
      if (__propIsEnum$f.call(b, prop))
        __defNormalProp$f(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$c = (a, b) => __defProps$c(a, __getOwnPropDescs$c(b));
const choiceMutations = {
  setChoicesProperty(state, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    obj[command.key] = command.value;
    ++obj.version;
  },
  setChoiceProperty(state, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    obj.choices[command.choiceIdx][command.key] = command.value;
    ++obj.version;
  },
  setChoices(state, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    obj.choices = command.choices;
    ++obj.version;
  }
};
const choiceActions = {
  createChoice({ commit: commit2, rootState, state }, command) {
    const constants = getConstants();
    const id = state.panels[command.panelId].lastObjId + 1;
    commit2("create", {
      object: __spreadProps$c(__spreadValues$f({}, baseProps()), {
        y: constants.Choices.ChoiceY,
        width: constants.Choices.ChoiceButtonWidth,
        height: 0,
        panelId: rootState.panels.currentPanel,
        id,
        onTop: true,
        autoWrap: true,
        type: "choice",
        choiceDistance: constants.Choices.ChoiceSpacing,
        choices: [
          {
            selected: false,
            text: "Click here to edit choice"
          }
        ],
        customColor: constants.Choices.ChoiceButtonColor
      })
    });
    return id;
  },
  addChoice({ state, commit: commit2 }, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    commit2("setChoices", {
      id: command.id,
      panelId: command.panelId,
      choices: [
        ...obj.choices,
        {
          selected: false,
          text: command.text
        }
      ]
    });
  },
  removeChoice({ state, commit: commit2 }, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    const choices = [...obj.choices];
    choices.splice(command.choiceIdx, 1);
    if (choices.length === 0) {
      choices.push({
        selected: false,
        text: ""
      });
    }
    commit2("setChoices", {
      id: command.id,
      panelId: command.panelId,
      choices
    });
  }
};
var __defProp$e = Object.defineProperty;
var __defProps$b = Object.defineProperties;
var __getOwnPropDescs$b = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$e = Object.getOwnPropertySymbols;
var __hasOwnProp$e = Object.prototype.hasOwnProperty;
var __propIsEnum$e = Object.prototype.propertyIsEnumerable;
var __defNormalProp$e = (obj, key, value) => key in obj ? __defProp$e(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$e = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$e.call(b, prop))
      __defNormalProp$e(a, prop, b[prop]);
  if (__getOwnPropSymbols$e)
    for (var prop of __getOwnPropSymbols$e(b)) {
      if (__propIsEnum$e.call(b, prop))
        __defNormalProp$e(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$b = (a, b) => __defProps$b(a, __getOwnPropDescs$b(b));
const notificationMutations = {
  setNotificationProperty(state, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    obj[command.key] = command.value;
    ++obj.version;
  }
};
const notificationActions = {
  createNotification({ commit: commit2, rootState, state }, command) {
    const constants = getConstants();
    const id = state.panels[command.panelId].lastObjId + 1;
    commit2("create", {
      object: __spreadProps$b(__spreadValues$e({}, baseProps()), {
        y: constants.Base.screenHeight / 2,
        width: constants.Choices.ChoiceButtonWidth,
        height: 0,
        panelId: rootState.panels.currentPanel,
        autoWrap: false,
        id,
        onTop: true,
        type: "notification",
        customColor: constants.Choices.ChoiceButtonColor,
        text: "Click here to edit notification",
        backdrop: true
      })
    });
    return id;
  }
};
var __defProp$d = Object.defineProperty;
var __defProps$a = Object.defineProperties;
var __getOwnPropDescs$a = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$d = Object.getOwnPropertySymbols;
var __hasOwnProp$d = Object.prototype.hasOwnProperty;
var __propIsEnum$d = Object.prototype.propertyIsEnumerable;
var __defNormalProp$d = (obj, key, value) => key in obj ? __defProp$d(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$d = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$d.call(b, prop))
      __defNormalProp$d(a, prop, b[prop]);
  if (__getOwnPropSymbols$d)
    for (var prop of __getOwnPropSymbols$d(b)) {
      if (__propIsEnum$d.call(b, prop))
        __defNormalProp$d(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$a = (a, b) => __defProps$a(a, __getOwnPropDescs$a(b));
const poemMutations = {
  setPoemProperty(state, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    obj[command.key] = command.value;
    ++obj.version;
  }
};
const poemActions = {
  createPoem({ commit: commit2, rootState, state }, command) {
    const constants = getConstants();
    const id = state.panels[command.panelId].lastObjId + 1;
    commit2("create", {
      object: {
        subType: "poem",
        x: constants.Poem.defaultX,
        y: constants.Poem.defaultY,
        width: constants.Poem.defaultPoemWidth,
        height: constants.Poem.defaultPoemHeight,
        panelId: rootState.panels.currentPanel,
        flip: false,
        rotation: 0,
        id,
        onTop: true,
        opacity: 100,
        type: "poem",
        version: 0,
        autoWrap: true,
        background: constants.Poem.defaultPoemBackground,
        font: constants.Poem.defaultPoemStyle,
        text: "New poem\n\nClick here to edit poem",
        composite: "source-over",
        filters: [],
        label: null,
        textboxColor: null,
        enlargeWhenTalking: true,
        nameboxWidth: null,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
        ratio: 1,
        preserveRatio: true,
        consoleColor: constants.Poem.consoleBackgroundColor,
        overflow: false,
        linkedTo: null
      }
    });
    return id;
  },
  createConsole({ commit: commit2, rootState, state }, _command) {
    const constants = getConstants();
    const id = state.panels[_command.panelId].lastObjId + 1;
    commit2("create", {
      object: __spreadProps$a(__spreadValues$d({}, baseProps()), {
        subType: "console",
        x: constants.Poem.consoleWidth / 2,
        y: constants.Poem.consoleHeight / 2,
        width: constants.Poem.consoleWidth,
        height: constants.Poem.consoleHeight,
        panelId: rootState.panels.currentPanel,
        id,
        onTop: true,
        type: "poem",
        background: constants.Poem.defaultConsoleBackground,
        font: constants.Poem.defaultConsoleStyle,
        text: "> _\n  \n  Console command\n  Click here to edit",
        autoWrap: true,
        consoleColor: constants.Poem.consoleBackgroundColor
      })
    });
    return id;
  }
};
var __defProp$c = Object.defineProperty;
var __defProps$9 = Object.defineProperties;
var __getOwnPropDescs$9 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$c = Object.getOwnPropertySymbols;
var __hasOwnProp$c = Object.prototype.hasOwnProperty;
var __propIsEnum$c = Object.prototype.propertyIsEnumerable;
var __defNormalProp$c = (obj, key, value) => key in obj ? __defProp$c(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$c = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$c.call(b, prop))
      __defNormalProp$c(a, prop, b[prop]);
  if (__getOwnPropSymbols$c)
    for (var prop of __getOwnPropSymbols$c(b)) {
      if (__propIsEnum$c.call(b, prop))
        __defNormalProp$c(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$9 = (a, b) => __defProps$9(a, __getOwnPropDescs$9(b));
var __async$t = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const spriteMutations = {};
const spriteActions = {
  createSprite(_0, _1) {
    return __async$t(this, arguments, function* ({ commit: commit2, rootState, state }, command) {
      const asset = yield getAAsset(command.assets[0], false);
      if (!(asset instanceof ImageAsset))
        return;
      const id = state.panels[command.panelId].lastObjId + 1;
      commit2("create", {
        object: __spreadProps$9(__spreadValues$c({}, baseProps()), {
          assets: command.assets,
          height: asset.height,
          width: asset.width,
          id,
          panelId: rootState.panels.currentPanel,
          onTop: false,
          type: "sprite",
          y: getConstants().Base.screenHeight / 2,
          enlargeWhenTalking: rootState.ui.defaultCharacterTalkingZoom
        })
      });
      return id;
    });
  }
};
var __defProp$b = Object.defineProperty;
var __defProps$8 = Object.defineProperties;
var __getOwnPropDescs$8 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$b = Object.getOwnPropertySymbols;
var __hasOwnProp$b = Object.prototype.hasOwnProperty;
var __propIsEnum$b = Object.prototype.propertyIsEnumerable;
var __defNormalProp$b = (obj, key, value) => key in obj ? __defProp$b(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$b = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$b.call(b, prop))
      __defNormalProp$b(a, prop, b[prop]);
  if (__getOwnPropSymbols$b)
    for (var prop of __getOwnPropSymbols$b(b)) {
      if (__propIsEnum$b.call(b, prop))
        __defNormalProp$b(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$8 = (a, b) => __defProps$8(a, __getOwnPropDescs$8(b));
var __async$s = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const splitTextboxSpacing = 4;
const textBoxMutations = {
  setTalkingObject(state, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    obj.talkingObjId = command.talkingObjId;
    ++obj.version;
  },
  setTalkingOther(state, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    obj.talkingOther = command.talkingOther;
    obj.talkingObjId = "$other$";
    ++obj.version;
  },
  setResetBounds(state, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    obj.resetBounds = command.resetBounds;
    obj.x = command.resetBounds.x;
    obj.y = command.resetBounds.y;
    obj.height = command.resetBounds.height;
    obj.width = command.resetBounds.width;
    obj.rotation = command.resetBounds.rotation;
    obj.skewX = command.resetBounds.skewX;
    obj.skewY = command.resetBounds.skewY;
    obj.scaleX = command.resetBounds.scaleX;
    obj.scaleY = command.resetBounds.scaleY;
    ++obj.version;
  },
  setTextBoxProperty(state, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    obj[command.key] = command.value;
    ++obj.version;
  }
};
const textBoxActions = {
  createTextBox({ commit: commit2, state, rootState }, command) {
    var _a2;
    const constants = getConstants();
    const id = state.panels[command.panelId].lastObjId + 1;
    const style = constants.TextBox.DefaultTextboxStyle;
    const renderer2 = rendererLookup[style];
    const resetBounds = command.resetBounds || {
      x: renderer2.defaultX,
      y: renderer2.defaultY,
      width: renderer2.defaultWidth,
      height: renderer2.defaultHeight,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      skewX: 0,
      skewY: 0
    };
    commit2("create", {
      object: __spreadProps$8(__spreadValues$b(__spreadValues$b({}, baseProps()), resetBounds), {
        panelId: rootState.panels.currentPanel,
        id,
        onTop: true,
        type: "textBox",
        continue: true,
        controls: true,
        skip: true,
        autoQuoting: true,
        autoWrap: true,
        style,
        overrideColor: false,
        customColor: constants.TextBoxCustom.textboxDefaultColor,
        deriveCustomColors: true,
        customControlsColor: constants.TextBoxCustom.controlsDefaultColor,
        customNameboxColor: constants.TextBoxCustom.nameboxDefaultColor,
        customNameboxWidth: null,
        customNameboxStroke: constants.TextBoxCustom.nameboxStrokeDefaultColor,
        talkingObjId: null,
        talkingOther: "",
        text: (_a2 = command.text) != null ? _a2 : "Click here to edit the textbox",
        resetBounds,
        overflow: false
      })
    });
    return id;
  },
  setStyle({ state, commit: commit2 }, command) {
    const constants = getConstants();
    const obj = state.panels[command.panelId].objects[command.id];
    const oldRenderer = rendererLookup[obj.style];
    const newRenderer = rendererLookup[command.style];
    const safetyMargin = 10;
    let updatePos = false;
    const posUpdate = {
      panelId: command.panelId,
      id: command.id,
      x: obj.x,
      y: obj.y
    };
    let updateSize = false;
    const sizeUpdate = {
      panelId: command.panelId,
      id: command.id,
      width: obj.width,
      height: obj.height
    };
    if (!newRenderer.resizable) {
      updateSize = true;
      sizeUpdate.width = newRenderer.defaultWidth;
      sizeUpdate.height = newRenderer.defaultHeight;
    } else {
      if (oldRenderer.defaultWidth !== newRenderer.defaultWidth) {
        updateSize = true;
        sizeUpdate.width = Math.max(
          sizeUpdate.width + newRenderer.defaultWidth - oldRenderer.defaultWidth,
          safetyMargin
        );
      }
      if (oldRenderer.defaultHeight !== newRenderer.defaultHeight) {
        updateSize = true;
        sizeUpdate.height = Math.max(
          sizeUpdate.height + newRenderer.defaultHeight - oldRenderer.defaultHeight,
          safetyMargin
        );
      }
    }
    if (oldRenderer.defaultX !== newRenderer.defaultX) {
      updatePos = true;
      posUpdate.x = between(
        -sizeUpdate.width + safetyMargin,
        posUpdate.x + newRenderer.defaultX - oldRenderer.defaultX,
        constants.Base.screenWidth - safetyMargin
      );
    }
    if (oldRenderer.defaultY !== newRenderer.defaultY) {
      updatePos = true;
      posUpdate.y = between(
        -sizeUpdate.height + safetyMargin,
        posUpdate.y + newRenderer.defaultY - oldRenderer.defaultY,
        constants.Base.screenHeight - safetyMargin
      );
    }
    if (updatePos) {
      commit2("setPosition", posUpdate);
    }
    if (updateSize) {
      commit2("setSize", sizeUpdate);
    }
    commit2(
      "setTextBoxProperty",
      textboxProperty(command.panelId, command.id, "style", command.style)
    );
  },
  resetTextboxBounds({ commit: commit2, state }, command) {
    const obj = state.panels[command.panelId].objects[command.id];
    commit2("setPosition", {
      panelId: command.panelId,
      id: command.id,
      x: obj.resetBounds.x,
      y: obj.resetBounds.y
    });
    commit2("setSize", {
      panelId: command.panelId,
      id: command.id,
      height: obj.resetBounds.height,
      width: obj.resetBounds.width
    });
    commit2("setRotation", {
      panelId: command.panelId,
      id: command.id,
      rotation: obj.resetBounds.rotation
    });
    commit2("setObjectScale", {
      panelId: command.panelId,
      id: command.id,
      scaleX: obj.resetBounds.scaleX,
      scaleY: obj.resetBounds.scaleY
    });
    commit2("setObjectSkew", {
      panelId: command.panelId,
      id: command.id,
      skewX: obj.resetBounds.skewX,
      skewY: obj.resetBounds.skewY
    });
  },
  splitTextbox(_0, _1) {
    return __async$s(this, arguments, function* ({ commit: commit2, state, dispatch: dispatch2 }, command) {
      const obj = state.panels[command.panelId].objects[command.id];
      if (obj.type !== "textBox")
        return;
      const newWidth = (obj.width - splitTextboxSpacing) / 2;
      const centerDistance = newWidth / 2 + splitTextboxSpacing / 2;
      let transform = new DOMMatrixReadOnly().translate(obj.x, obj.y);
      if (obj.rotation !== 0) {
        transform = transform.rotate(0, 0, obj.rotation);
      }
      if (obj.skewX !== 0) {
        transform = transform.skewX(obj.skewX);
      }
      if (obj.skewY !== 0) {
        transform = transform.skewY(obj.skewY);
      }
      if (obj.flip) {
        transform = transform.flipX();
      }
      transform = transform.scale(obj.scaleX, obj.scaleY);
      const boxOneCoords = transform.transformPoint(
        new DOMPointReadOnly(-centerDistance, 0)
      );
      const boxTwoCoords = transform.transformPoint(
        new DOMPointReadOnly(centerDistance, 0)
      );
      commit2("setResetBounds", {
        id: command.id,
        panelId: command.panelId,
        resetBounds: {
          x: boxOneCoords.x,
          y: boxOneCoords.y,
          width: newWidth,
          height: obj.height,
          rotation: obj.rotation,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          skewX: obj.skewX,
          skewY: obj.skewY
        }
      });
      const newStyle = obj.style === "custom_plus" ? "custom_plus" : "custom";
      if (obj.style !== newStyle) {
        yield dispatch2("setStyle", __spreadProps$8(__spreadValues$b({}, command), {
          style: newStyle
        }));
      }
      const id = yield dispatch2("createTextBox", {
        panelId: command.panelId,
        resetBounds: {
          x: boxTwoCoords.x,
          y: boxTwoCoords.y,
          width: newWidth,
          height: obj.height,
          rotation: obj.rotation,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          skewX: obj.skewX,
          skewY: obj.skewY
        }
      });
      yield dispatch2("setStyle", {
        panelId: command.panelId,
        id,
        style: newStyle
      });
      if (obj.flip) {
        commit2("setFlip", {
          id,
          panelId: command.panelId,
          flip: obj.flip
        });
      }
      commit2("setLink", {
        id,
        panelId: command.panelId,
        link: obj.linkedTo,
        rotation: obj.rotation,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        skewX: obj.skewX,
        skewY: obj.skewY,
        x: boxTwoCoords.x,
        y: boxTwoCoords.y
      });
    });
  }
};
function textboxProperty(panelId, id, key, value) {
  return { id, panelId, key, value };
}
var __defProp$a = Object.defineProperty;
var __getOwnPropSymbols$a = Object.getOwnPropertySymbols;
var __hasOwnProp$a = Object.prototype.hasOwnProperty;
var __propIsEnum$a = Object.prototype.propertyIsEnumerable;
var __defNormalProp$a = (obj, key, value) => key in obj ? __defProp$a(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$a = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$a.call(b, prop))
      __defNormalProp$a(a, prop, b[prop]);
  if (__getOwnPropSymbols$a)
    for (var prop of __getOwnPropSymbols$a(b)) {
      if (__propIsEnum$a.call(b, prop))
        __defNormalProp$a(a, prop, b[prop]);
    }
  return a;
};
const percentageValue = /* @__PURE__ */ new Set([
  "brightness",
  "contrast",
  "grayscale",
  "invert",
  "opacity",
  "saturate",
  "sepia"
]);
function addFilter(action, objLookup, setMutation) {
  const obj = objLookup();
  const filters = [...obj.filters];
  let newFilter;
  switch (action.type) {
    case "hue-rotate":
      newFilter = {
        type: action.type,
        value: 0
      };
      break;
    case "sepia":
    case "invert":
    case "blur":
    case "grayscale":
    case "brightness":
    case "contrast":
    case "opacity":
    case "saturate":
      newFilter = {
        type: action.type,
        value: 1
      };
      break;
    case "drop-shadow":
      newFilter = {
        type: action.type,
        blurRadius: 0,
        offsetX: 10,
        offsetY: 10,
        color: "#555555"
      };
      break;
    default:
      throw new dist.UnreachableCaseError(action.type);
  }
  filters.splice(action.idx, 0, newFilter);
  setMutation({
    panelId: action.panelId,
    id: action.id,
    filters
  });
}
function removeFilter(action, objLookup, setMutation) {
  const obj = objLookup();
  const filters = [...obj.filters];
  filters.splice(action.idx, 1);
  setMutation({
    id: action.id,
    panelId: action.panelId,
    filters
  });
}
function moveFilter(action, objLookup, setMutation) {
  const obj = objLookup();
  const filters = [...obj.filters];
  const filter = filters[action.idx];
  filters.splice(action.idx, 1);
  filters.splice(action.idx + action.moveBy, 0, filter);
  setMutation({
    id: action.id,
    panelId: action.panelId,
    filters
  });
}
function setFilter(action, objLookup, setMutation) {
  const obj = objLookup();
  const filters = [...obj.filters];
  const filter = __spreadValues$a({}, filters[action.idx]);
  filters[action.idx] = filter;
  if (filter.type === "drop-shadow") {
    if (action.blurRadius !== void 0) {
      filter.blurRadius = action.blurRadius;
    }
    if (action.color !== void 0) {
      filter.color = action.color;
    }
    if (action.offsetX !== void 0) {
      filter.offsetX = action.offsetX;
    }
    if (action.offsetY !== void 0) {
      filter.offsetY = action.offsetY;
    }
  } else {
    filter.value = action.value;
  }
  setMutation({
    id: action.id,
    panelId: action.panelId,
    filters
  });
}
var __defProp$9 = Object.defineProperty;
var __defProps$7 = Object.defineProperties;
var __getOwnPropDescs$7 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$9 = Object.getOwnPropertySymbols;
var __hasOwnProp$9 = Object.prototype.hasOwnProperty;
var __propIsEnum$9 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$9 = (obj, key, value) => key in obj ? __defProp$9(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$9 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$9.call(b, prop))
      __defNormalProp$9(a, prop, b[prop]);
  if (__getOwnPropSymbols$9)
    for (var prop of __getOwnPropSymbols$9(b)) {
      if (__propIsEnum$9.call(b, prop))
        __defNormalProp$9(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$7 = (a, b) => __defProps$7(a, __getOwnPropDescs$7(b));
const mutations = __spreadValues$9(__spreadValues$9(__spreadValues$9(__spreadValues$9(__spreadValues$9(__spreadValues$9({
  create(state, { object }) {
    const panel = state.panels[object.panelId];
    if (object.id > panel.lastObjId)
      panel.lastObjId = object.id;
    panel.objects[object.id] = object;
    const collection = object.onTop ? panel.onTopOrder : panel.order;
    collection.push(object.id);
  },
  removeFromList(state, command) {
    const panel = state.panels[command.panelId];
    const collection = command.onTop ? panel.onTopOrder : panel.order;
    const idx = collection.indexOf(command.id);
    collection.splice(idx, 1);
  },
  addToList(state, command) {
    const panel = state.panels[command.panelId];
    const collection = command.onTop ? panel.onTopOrder : panel.order;
    collection.splice(command.position, 0, command.id);
  },
  setOnTop(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.onTop = command.onTop;
  },
  setPosition(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.x = roundTo2Dec(command.x);
    obj.y = roundTo2Dec(command.y);
  },
  setLink(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    let check = panel.objects[command.link];
    if (!check && command.link)
      throw new Error("Linked object does not exist.");
    if (check === obj)
      throw new Error("Object cannot link to itself.");
    while (check) {
      check = panel.objects[check.linkedTo];
      if (check === obj)
        throw new Error("Objects cannot be linked recursively.");
    }
    obj.linkedTo = command.link;
    obj.x = roundTo2Dec(command.x);
    obj.y = roundTo2Dec(command.y);
    obj.rotation = roundTo2Dec(command.rotation);
    obj.scaleX = roundTo2Dec(command.scaleX);
    obj.scaleY = roundTo2Dec(command.scaleY);
    obj.skewX = roundTo2Dec(command.skewX);
    obj.skewY = roundTo2Dec(command.skewY);
  },
  setFlip(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.flip = command.flip;
  },
  setSize(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.width = Math.round(command.width * 100) / 100;
    obj.height = Math.round(command.height * 100) / 100;
    ++obj.version;
  },
  setRatio(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.preserveRatio = command.preserveRatio;
    obj.ratio = command.ratio;
  },
  setRotation(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.rotation = command.rotation < 0 ? 360 - Math.abs(command.rotation) % 360 : command.rotation % 360;
  },
  removeObject(state, command) {
    const panel = state.panels[command.panelId];
    delete panel.objects[command.id];
  },
  setComposition(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.composite = command.composite;
  },
  object_setFilters(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.filters = command.filters;
  },
  setLabel(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.label = command.label;
    ++obj.version;
  },
  setTextboxColor(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.textboxColor = command.textboxColor;
    ++obj.version;
  },
  setEnlargeWhenTalking(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.enlargeWhenTalking = command.enlargeWhenTalking;
    ++obj.version;
  },
  setObjectNameboxWidth(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.nameboxWidth = command.nameboxWidth;
    ++obj.version;
  },
  setObjectScale(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.scaleX = command.scaleX;
    obj.scaleY = command.scaleY;
    ++obj.version;
  },
  setObjectSkew(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.skewX = command.skewX < 0 ? 180 - Math.abs(command.skewX) % 180 : command.skewX % 180;
    obj.skewY = command.skewY < 0 ? 180 - Math.abs(command.skewY) % 180 : command.skewY % 180;
    ++obj.version;
  },
  setOverflow(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    if (!("overflow" in obj))
      return;
    obj.overflow = command.overflow;
    ++obj.version;
  }
}, spriteMutations), characterMutations), textBoxMutations), choiceMutations), notificationMutations), poemMutations);
const actions = __spreadValues$9(__spreadValues$9(__spreadValues$9(__spreadValues$9(__spreadValues$9(__spreadValues$9({
  removeObject({ state, commit: commit2, rootState }, command) {
    var _a2;
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    if (rootState.ui.selection === command.id) {
      commit2("ui/setSelection", null, { root: true });
    }
    for (const key of [...panel.onTopOrder, ...panel.order]) {
      if (obj.id === key)
        continue;
      const otherObject = panel.objects[key];
      if (otherObject.linkedTo === obj.id) {
        const currentSceneRenderer = getMainSceneRenderer(null);
        const otherObjRender = currentSceneRenderer == null ? void 0 : currentSceneRenderer.getLastRenderObject(
          otherObject.id
        );
        if (otherObjRender) {
          commit2("setLink", __spreadValues$9({
            panelId: command.panelId,
            id: otherObject.id,
            link: null
          }, decomposeMatrix(otherObjRender.preparedTransform)));
        } else {
          commit2("setLink", {
            panelId: command.panelId,
            id: otherObject.id,
            link: null,
            rotation: otherObject.rotation,
            scaleX: otherObject.scaleX,
            scaleY: otherObject.scaleY,
            skewX: otherObject.skewX,
            skewY: otherObject.skewY,
            x: otherObject.x,
            y: otherObject.y
          });
        }
      }
      if (otherObject.type === "textBox" && otherObject.talkingObjId === obj.id) {
        commit2("setTalkingOther", {
          id: otherObject.id,
          talkingOther: (_a2 = obj.label) != null ? _a2 : "",
          panelId: command.panelId
        });
      }
    }
    commit2("removeFromList", {
      id: command.id,
      panelId: command.panelId,
      onTop: obj.onTop
    });
    commit2("removeObject", {
      id: command.id,
      panelId: command.panelId
    });
  },
  setPosition({ state, commit: commit2, dispatch: dispatch2 }, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    if (obj.type === "character") {
      dispatch2("setCharacterPosition", command);
    } else {
      commit2("setPosition", command);
    }
  },
  setOnTop({ state, commit: commit2 }, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    if (obj.onTop === command.onTop)
      return;
    commit2("removeFromList", {
      panelId: command.panelId,
      id: command.id,
      onTop: obj.onTop
    });
    commit2("addToList", {
      id: command.id,
      panelId: command.panelId,
      position: (command.onTop ? panel.onTopOrder : panel.order).length,
      onTop: command.onTop
    });
    commit2("setOnTop", {
      panelId: command.panelId,
      id: command.id,
      onTop: command.onTop
    });
  },
  shiftLayer({ state, commit: commit2 }, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    const collection = obj.onTop ? panel.onTopOrder : panel.order;
    const position = collection.indexOf(obj.id);
    let newPosition = position + command.delta;
    if (newPosition < 0) {
      newPosition = 0;
    }
    if (newPosition > collection.length) {
      newPosition = collection.length;
    }
    commit2("removeFromList", {
      panelId: command.panelId,
      id: command.id,
      onTop: obj.onTop
    });
    commit2("addToList", {
      panelId: command.panelId,
      id: command.id,
      position: newPosition,
      onTop: obj.onTop
    });
  },
  setPreserveRatio({ commit: commit2, state }, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    const ratio = command.preserveRatio ? obj.width / obj.height : 0;
    commit2("setRatio", {
      panelId: command.panelId,
      id: command.id,
      preserveRatio: command.preserveRatio,
      ratio
    });
  },
  copyObjects({ commit: commit2, state }, { sourcePanelId, targetPanelId }) {
    const sourcePanel = state.panels[sourcePanelId];
    const targetPanel = state.panels[targetPanelId];
    const allSourceIds = [...sourcePanel.onTopOrder, ...sourcePanel.order];
    const transationTable = /* @__PURE__ */ new Map();
    let lastObjId = targetPanel.lastObjId;
    for (const sourceId of allSourceIds) {
      const targetId = ++lastObjId;
      transationTable.set(sourceId, targetId);
    }
    for (const sourceId of allSourceIds) {
      const oldObject = sourcePanel.objects[sourceId];
      const newObject = JSON.parse(JSON.stringify(oldObject));
      if ("talkingObjId" in newObject) {
        const newTextbox = newObject;
        if (newTextbox.talkingObjId !== null && newTextbox.talkingObjId !== "$other$" && transationTable.has(newTextbox.talkingObjId)) {
          newTextbox.talkingObjId = transationTable.get(
            newTextbox.talkingObjId
          );
        }
      }
      commit2("create", {
        object: __spreadProps$7(__spreadValues$9({}, newObject), {
          id: transationTable.get(sourceId),
          panelId: targetPanelId
        })
      });
    }
  },
  copyObjectToClipboard({ commit: commit2, state }, { id, panelId }) {
    const panel = state.panels[panelId];
    const baseObject = panel.objects[id];
    const allObject = Object.values(panel.objects);
    const objects = [baseObject];
    collectLinks(baseObject);
    function collectLinks(from, direct = true) {
      if (!direct && from === baseObject)
        throw new Error("Recursively linked object");
      for (const obj of allObject) {
        if (obj.linkedTo === from.id) {
          objects.push(obj);
          collectLinks(obj, false);
        }
      }
    }
    commit2("ui/setClipboard", JSON.stringify(objects), { root: true });
  },
  pasteObjectFromClipboard({ commit: commit2, state, rootState }) {
    var _a2;
    if (rootState.ui.clipboard == null)
      return;
    const newObjects = JSON.parse(rootState.ui.clipboard);
    const panel = state.panels[state.currentPanel];
    const newIds = /* @__PURE__ */ new Map();
    let id = panel.lastObjId;
    for (const obj of newObjects) {
      const newId = ++id;
      newIds.set(obj.id, newId);
      obj.id = newId;
    }
    for (const obj of newObjects) {
      if (obj.linkedTo != null) {
        obj.linkedTo = (_a2 = newIds.get(obj.linkedTo)) != null ? _a2 : null;
      }
      commit2("create", {
        object: __spreadProps$7(__spreadValues$9({}, obj), {
          panelId: state.currentPanel
        })
      });
    }
  },
  object_addFilter({ state, commit: commit2 }, action) {
    addFilter(
      action,
      () => state.panels[action.panelId].objects[action.id],
      (mutation) => commit2("object_setFilters", mutation)
    );
  },
  object_removeFilter({ state, commit: commit2 }, action) {
    removeFilter(
      action,
      () => state.panels[action.panelId].objects[action.id],
      (mutation) => commit2("object_setFilters", mutation)
    );
  },
  object_moveFilter({ state, commit: commit2 }, action) {
    moveFilter(
      action,
      () => state.panels[action.panelId].objects[action.id],
      (mutation) => commit2("object_setFilters", mutation)
    );
  },
  object_setFilter({ state, commit: commit2 }, action) {
    setFilter(
      action,
      () => state.panels[action.panelId].objects[action.id],
      (mutation) => commit2("object_setFilters", mutation)
    );
  }
}, spriteActions), characterActions), textBoxActions), choiceActions), notificationActions), poemActions);
function fixContentPackRemoval(context, oldContent) {
  const panels2 = context.state.panels;
  for (const panelId in panels2) {
    const panel = panels2[panelId];
    for (const objectId in panel.objects) {
      const obj = panel.objects[objectId];
      if (obj.type === "character") {
        fixContentPackRemovalFromCharacter(
          context,
          obj.panelId,
          obj.id,
          oldContent
        );
        return;
      }
    }
  }
}
function roundTo2Dec(val) {
  return Math.round(val * 100) / 100;
}
var __defProp$8 = Object.defineProperty;
var __defProps$6 = Object.defineProperties;
var __getOwnPropDescs$6 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$8 = Object.getOwnPropertySymbols;
var __hasOwnProp$8 = Object.prototype.hasOwnProperty;
var __propIsEnum$8 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$8 = (obj, key, value) => key in obj ? __defProp$8(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$8 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$8.call(b, prop))
      __defNormalProp$8(a, prop, b[prop]);
  if (__getOwnPropSymbols$8)
    for (var prop of __getOwnPropSymbols$8(b)) {
      if (__propIsEnum$8.call(b, prop))
        __defNormalProp$8(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$6 = (a, b) => __defProps$6(a, __getOwnPropDescs$6(b));
var ScalingModes = /* @__PURE__ */ ((ScalingModes2) => {
  ScalingModes2[ScalingModes2["None"] = 0] = "None";
  ScalingModes2[ScalingModes2["Stretch"] = 1] = "Stretch";
  ScalingModes2[ScalingModes2["Cover"] = 2] = "Cover";
  return ScalingModes2;
})(ScalingModes || {});
const transparentId = "buildin.transparent";
const previewManager = {
  panelToUrl: /* @__PURE__ */ new Map(),
  urlToPanel: /* @__PURE__ */ new Map(),
  register(panelId, url) {
    if (this.panelToUrl.has(panelId)) {
      if (this.panelToUrl.get(panelId) === url)
        return;
      this.unregister(panelId, this.panelToUrl.get(panelId));
    }
    this.panelToUrl.set(panelId, url);
    if (this.urlToPanel.has(url)) {
      this.urlToPanel.get(url).push(panelId);
    } else {
      this.urlToPanel.set(url, [panelId]);
    }
  },
  unregister(panelId, url) {
    if (this.urlToPanel.has(url)) {
      const panels2 = this.urlToPanel.get(url);
      panels2.splice(panels2.indexOf(panelId), 1);
      if (panels2.length === 0) {
        this.urlToPanel.delete(url);
        URL.revokeObjectURL(url);
      }
    }
    this.panelToUrl.delete(panelId);
  }
};
const panels = {
  namespaced: true,
  state: {
    lastPanelId: -1,
    panels: {},
    panelOrder: [],
    currentPanel: null
  },
  mutations: __spreadValues$8({
    setCurrentPanel(state, { panelId }) {
      state.currentPanel = panelId;
    },
    setPanelPreview(state, { panelId, url }) {
      state.panels[panelId].lastRender = url;
      previewManager.register(panelId, url);
    },
    createPanel(state, { panel }) {
      state.lastPanelId = panel.id;
      state.panels[panel.id] = panel;
    },
    setPanelOrder(state, { panelOrder }) {
      state.panelOrder = [...panelOrder];
    },
    setCurrentBackground(state, { current, panelId }) {
      const panel = state.panels[panelId];
      panel.background.current = current;
      panel.background.variant = 0;
    },
    setBackgroundColor(state, { color: color2, panelId }) {
      const panel = state.panels[panelId];
      panel.background.color = color2;
    },
    setBackgroundFlipped(state, { flipped, panelId }) {
      const panel = state.panels[panelId];
      panel.background.flipped = flipped;
    },
    setBackgroundVariant(state, { variant, panelId }) {
      const panel = state.panels[panelId];
      panel.background.variant = variant;
    },
    setBackgroundScaling(state, { scaling, panelId }) {
      const panel = state.panels[panelId];
      panel.background.scaling = scaling;
    },
    deletePanel(state, { panelId }) {
      previewManager.unregister(
        panelId,
        previewManager.panelToUrl.get(panelId)
      );
      delete state.panels[panelId];
    },
    setComposition(state, command) {
      const obj = state.panels[command.panelId];
      obj.composite = command.composite;
    },
    setFilters(state, command) {
      const obj = state.panels[command.panelId];
      obj.filters = command.filters;
    },
    backgroundSetComposition(state, command) {
      const obj = state.panels[command.panelId];
      obj.background.composite = command.composite;
    },
    backgroundSetFilters(state, command) {
      const obj = state.panels[command.panelId];
      obj.background.filters = command.filters;
    }
  }, mutations),
  actions: __spreadValues$8({
    createPanel({ state, commit: commit2 }) {
      const id = state.lastPanelId + 1;
      commit2("createPanel", {
        panel: {
          id,
          background: {
            color: "#000000",
            current: transparentId,
            flipped: false,
            scaling: 2,
            variant: 0,
            composite: "source-over",
            filters: []
          },
          lastRender: "",
          composite: "source-over",
          filters: [],
          objects: {},
          onTopOrder: [],
          order: [],
          lastObjId: -1
        }
      });
      commit2("setPanelOrder", {
        panelOrder: [...state.panelOrder, id]
      });
      commit2("setCurrentPanel", {
        panelId: id
      });
      return id;
    },
    duplicatePanel({ state, commit: commit2 }, { panelId }) {
      const panel = state.panels[panelId];
      const id = state.lastPanelId + 1;
      previewManager.register(id, panel.lastRender);
      const newPanel = JSON.parse(JSON.stringify(panel));
      let lastObjId = -1;
      const transationTable = /* @__PURE__ */ new Map();
      const newObjects = {};
      for (const key in newPanel.objects) {
        transationTable.set(+key, ++lastObjId);
      }
      for (const key in newPanel.objects) {
        const obj = newPanel.objects[key];
        const newId = transationTable.get(+key);
        newObjects[newId] = obj;
        obj.panelId = id;
        obj.id = newId;
        if ("talkingObjId" in obj) {
          const newTextbox = obj;
          if (newTextbox.talkingObjId !== null && newTextbox.talkingObjId !== "$other$" && transationTable.has(newTextbox.talkingObjId)) {
            newTextbox.talkingObjId = transationTable.get(
              newTextbox.talkingObjId
            );
          }
        }
        if (obj.linkedTo != null) {
          obj.linkedTo = transationTable.get(obj.linkedTo);
        }
      }
      commit2("createPanel", {
        panel: __spreadProps$6(__spreadValues$8({}, newPanel), {
          id,
          lastObjId,
          objects: newObjects,
          order: newPanel.order.map((oldId) => transationTable.get(oldId)),
          onTopOrder: newPanel.onTopOrder.map(
            (oldId) => transationTable.get(oldId)
          )
        })
      });
      const oldIdx = state.panelOrder.indexOf(panelId);
      commit2("setPanelOrder", {
        panelOrder: [
          ...state.panelOrder.slice(0, oldIdx + 1),
          id,
          ...state.panelOrder.slice(oldIdx + 1)
        ]
      });
      commit2("setCurrentPanel", {
        panelId: id
      });
    },
    seekBackgroundVariant({ state, rootGetters, commit: commit2 }, { delta }) {
      const panel = state.panels[state.currentPanel];
      const backgrounds = rootGetters["content/getBackgrounds"];
      const background = backgrounds.get(panel.background.current);
      if (!background)
        return;
      commit2("setBackgroundVariant", {
        panelId: state.currentPanel,
        variant: arraySeeker(
          background.variants,
          panel.background.variant,
          delta
        )
      });
    },
    delete({ state, commit: commit2 }, { panelId }) {
      if (state.panelOrder.length <= 1)
        return;
      const orderIdx = state.panelOrder.indexOf(panelId);
      let newOrderIdx;
      if (orderIdx === state.panelOrder.length - 1) {
        newOrderIdx = orderIdx - 1;
      } else {
        newOrderIdx = orderIdx + 1;
      }
      commit2("setCurrentPanel", {
        panelId: state.panelOrder[newOrderIdx]
      });
      commit2("setPanelOrder", {
        panelOrder: [
          ...state.panelOrder.slice(0, orderIdx),
          ...state.panelOrder.slice(orderIdx + 1)
        ]
      });
      commit2("deletePanel", {
        panelId
      });
    },
    fixContentPackRemoval(context, oldContent) {
      const { state, rootGetters, commit: commit2, rootState } = context;
      for (const panel of Object.values(state.panels)) {
        const oldBackground = oldContent.backgrounds.find(
          (x) => x.id === panel.background.current
        );
        if (!oldBackground)
          return;
        const newBackground = rootGetters["content/getBackgrounds"].get(panel.background.current);
        if (!newBackground) {
          if (rootState.content.current.backgrounds.length > 0) {
            commit2("setCurrentBackground", {
              current: rootState.content.current.backgrounds[0].id,
              panelId: panel.id
            });
          } else {
            commit2("setCurrentBackground", {
              current: "buildin.transparent",
              panelId: panel.id
            });
          }
          return;
        }
        const oldVariantJSON = JSON.stringify(
          oldBackground.variants[panel.background.variant]
        );
        const newVariantIdx = newBackground.variants.findIndex(
          (variant) => JSON.stringify(variant) === oldVariantJSON
        );
        if (newVariantIdx !== panel.background.variant) {
          commit2("setBackgroundVariant", {
            variant: newVariantIdx === -1 ? 0 : newVariantIdx,
            panelId: panel.id
          });
        }
      }
      fixContentPackRemoval(context, oldContent);
    },
    move({ state, commit: commit2 }, { panelId, delta }) {
      const collection = [...state.panelOrder];
      const oldIdx = collection.indexOf(panelId);
      collection.splice(oldIdx, 1);
      const newIdx = Math.max(oldIdx + delta, 0);
      collection.splice(newIdx, 0, panelId);
      commit2("setPanelOrder", { panelOrder: collection });
    },
    addFilter({ state, commit: commit2 }, action) {
      addFilter(
        action,
        () => state.panels[action.panelId],
        (mutation) => commit2("setFilters", mutation)
      );
    },
    removeFilter({ state, commit: commit2 }, action) {
      removeFilter(
        action,
        () => state.panels[action.panelId],
        (mutation) => commit2("setFilters", mutation)
      );
    },
    moveFilter({ state, commit: commit2 }, action) {
      moveFilter(
        action,
        () => state.panels[action.panelId],
        (mutation) => commit2("setFilters", mutation)
      );
    },
    setFilter({ state, commit: commit2 }, action) {
      setFilter(
        action,
        () => state.panels[action.panelId],
        (mutation) => commit2("setFilters", mutation)
      );
    },
    backgroundAddFilter({ state, commit: commit2 }, action) {
      addFilter(
        action,
        () => state.panels[action.panelId].background,
        (mutation) => commit2("backgroundSetFilters", mutation)
      );
    },
    backgroundRemoveFilter({ state, commit: commit2 }, action) {
      removeFilter(
        action,
        () => state.panels[action.panelId].background,
        (mutation) => commit2("backgroundSetFilters", mutation)
      );
    },
    backgroundMoveFilter({ state, commit: commit2 }, action) {
      moveFilter(
        action,
        () => state.panels[action.panelId].background,
        (mutation) => commit2("backgroundSetFilters", mutation)
      );
    },
    backgroundSetFilter({ state, commit: commit2 }, action) {
      setFilter(
        action,
        () => state.panels[action.panelId].background,
        (mutation) => commit2("backgroundSetFilters", mutation)
      );
    }
  }, actions)
};
function getDefaultUiState() {
  return {
    vertical: false,
    lqRendering: true,
    nsfw: false,
    selection: null,
    lastDownload: null,
    clipboard: null,
    useDarkTheme: null,
    defaultCharacterTalkingZoom: true,
    pickColor: false
  };
}
const ui = {
  namespaced: true,
  state: getDefaultUiState(),
  mutations: {
    setVertical(state, vertical) {
      state.vertical = vertical;
    },
    setNsfw(state, nsfw) {
      state.nsfw = nsfw;
    },
    setLqRendering(state, lqRendering) {
      state.lqRendering = lqRendering;
    },
    setSelection(state, selection) {
      state.selection = selection;
    },
    setLastDownload(state, download) {
      state.lastDownload = download;
    },
    setClipboard(state, contents) {
      state.clipboard = contents;
    },
    setDarkTheme(state, theme) {
      state.useDarkTheme = theme;
    },
    setDefaultCharacterTalkingZoom(state, zoom) {
      state.defaultCharacterTalkingZoom = zoom;
    },
    setColorPicker(state, pickColor) {
      state.pickColor = pickColor;
    }
  }
};
var __async$r = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const uploadUrls = {
  namespaced: true,
  state: {},
  mutations: {
    add(state, { name, url }) {
      state[name] = url;
    }
  },
  actions: {
    add(_0, _1) {
      return __async$r(this, arguments, function* ({ state, commit: commit2, rootState }, { name, url }) {
        if (state[name]) {
          throw new Error(`There is already an uploaded file called "${name}"`);
        }
        const assertUrl = "uploads:" + name;
        commit2("add", { name: assertUrl, url });
        registerAssetWithURL(assertUrl, url);
        yield afterImageUpload2_5(rootState, commit2, assertUrl);
        return assertUrl;
      });
    }
  }
};
var __defProp$7 = Object.defineProperty;
var __defProps$5 = Object.defineProperties;
var __getOwnPropDescs$5 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$7 = Object.getOwnPropertySymbols;
var __hasOwnProp$7 = Object.prototype.hasOwnProperty;
var __propIsEnum$7 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$7 = (obj, key, value) => key in obj ? __defProp$7(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$7 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$7.call(b, prop))
      __defNormalProp$7(a, prop, b[prop]);
  if (__getOwnPropSymbols$7)
    for (var prop of __getOwnPropSymbols$7(b)) {
      if (__propIsEnum$7.call(b, prop))
        __defNormalProp$7(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$5 = (a, b) => __defProps$5(a, __getOwnPropDescs$5(b));
var __async$q = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function useStore() {
  return useStore$1();
}
const store = createStore({
  state: {
    unsafe: false
  },
  mutations: __spreadValues$7({
    setUnsafe(state, unsafe) {
      state.unsafe = unsafe;
    }
  }, rootStateMigrations2_5),
  actions: {
    removePacks(_0, _1) {
      return __async$q(this, arguments, function* ({ dispatch: dispatch2, commit: commit2 }, { packs }) {
        commit2("setUnsafe", true);
        yield dispatch2("content/removeContentPacks", packs);
        commit2("setUnsafe", false);
      });
    },
    getSave(_0, _1) {
      return __async$q(this, arguments, function* ({ state }, compact) {
        const repo = yield Repo.getInstance();
        return JSON.stringify(
          __spreadProps$5(__spreadValues$7({}, state), { version: 2.5 }),
          (key, value) => {
            if (key === "ui")
              return void 0;
            if (key === "lastRender")
              return void 0;
            if (key === "uploadUrls")
              return Object.keys(value);
            if (key === "content" && compact)
              return value.contentPacks.filter(
                (x) => {
                  var _a2, _b;
                  return !((_a2 = x.packId) == null ? void 0 : _a2.startsWith("dddg.buildin.")) || ((_b = x.packId) == null ? void 0 : _b.endsWith(".nsfw"));
                }
              ).map((x) => {
                var _a2;
                let id = ((_a2 = x.packId) == null ? void 0 : _a2.startsWith("dddg.uploads.")) ? x : x.packId;
                if (x.packId != null) {
                  const pack = repo.getPack(x.packId);
                  if (pack && pack.repoUrl != null)
                    id += `;${pack.repoUrl}`;
                }
                return id;
              });
            return value;
          },
          2
        );
      });
    },
    loadSave(_0, _1) {
      return __async$q(this, arguments, function* ({ state }, str) {
        const data = JSON.parse(str);
        const contentData = data.content;
        data.ui = __spreadProps$5(__spreadValues$7({}, getDefaultUiState()), {
          vertical: state.ui.vertical,
          lqRendering: state.ui.lqRendering,
          nsfw: contentData.find(
            (pack) => typeof pack === "string" && pack.startsWith("dddg.buildin.") && pack.endsWith(".nsfw")
          ) !== void 0,
          clipboard: state.ui.clipboard,
          useDarkTheme: state.ui.useDarkTheme,
          defaultCharacterTalkingZoom: state.ui.defaultCharacterTalkingZoom
        });
        data.uploadUrls = {};
        data.content = getDefaultContentState();
        const repo = yield Repo.getInstance();
        data.content.contentPacks = [
          ...state.content.contentPacks.filter(
            (x) => {
              var _a2;
              return (_a2 = x.packId) == null ? void 0 : _a2.startsWith("dddg.buildin.");
            }
          ),
          ...(yield Promise.all(
            contentData.map((x) => __async$q(this, null, function* () {
              if (typeof x !== "string")
                return x;
              let url = null;
              let packId;
              if (x.indexOf(";") >= 0) {
                [packId, url] = x.split(";");
              } else {
                packId = x;
              }
              const alreadyLoaded = state.content.contentPacks.find(
                (pack2) => pack2.packId === packId
              );
              if (alreadyLoaded)
                return alreadyLoaded;
              if (x.startsWith("dddg.buildin.") && x.endsWith(".nsfw")) {
                const loaded2 = yield loadContentPack(
                  NsfwPacks[x]
                );
                return yield convertContentPack(loaded2);
              }
              if (url != null && !repo.hasPack(packId)) {
                yield repo.loadTempPack(url);
              }
              const pack = repo.getPack(packId);
              if (!pack) {
                console.warn(`Pack Id ${x} not found!`);
                return null;
              }
              const loaded = yield loadContentPack(
                pack.dddg2Path || pack.dddg1Path
              );
              return yield convertContentPack(loaded);
            }))
          )).filter((x) => x !== null)
        ];
        let combinedPack = data.content.current;
        for (const contentPack of data.content.contentPacks) {
          combinedPack = mergeContentPacks(combinedPack, contentPack);
        }
        data.content.current = combinedPack;
        if (data.version == null || data.version < 2.5) {
          migrateSave2_5(data);
        }
        this.replaceState(data);
        eventBus$1.fire(new InvalidateRenderEvent());
      });
    }
  },
  modules: { ui, panels, content, uploadUrls }
});
var __async$p = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _hoisted_1$u = { key: 0 };
const _hoisted_2$q = ["onClick"];
const _hoisted_3$j = ["onClick"];
const shortHidingTime = 5e3;
const longHidingTime = 2e4;
const hideShowTimeouts = 100;
const _sfc_main$B = /* @__PURE__ */ defineComponent({
  __name: "message-console",
  props: {
    loading: {
      default: false,
      type: Boolean
    }
  },
  setup(__props) {
    const store2 = useStore();
    const props = __props;
    const messages = ref([]);
    const errors = ref([]);
    const resolvableErrors = ref([]);
    const showLoading = ref(false);
    const showLoadingTimeout = ref(0);
    const hideLoadingTimeout = ref(0);
    const vertical = computed(() => store2.state.ui.vertical);
    onLoadingChange(props.loading);
    eventBus$1.subscribe(AssetFailureEvent, (ev) => {
      messages.value.push(`Failed to load asset '${ev.path}'`);
      setTimeout(() => {
        messages.value.shift();
      }, shortHidingTime);
    });
    eventBus$1.subscribe(CustomAssetFailureEvent, (_ev) => {
      messages.value.push(
        "Failed to load custom asset. Try to download it manually and then upload it."
      );
      setTimeout(() => {
        messages.value.shift();
      }, longHidingTime);
    });
    eventBus$1.subscribe(FailureEvent, (ev) => {
      errors.value.push(ev.message);
    });
    eventBus$1.subscribe(ResolvableErrorEvent, (ev) => {
      resolvableErrors.value.push(ev);
    });
    eventBus$1.subscribe(ShowMessageEvent, (ev) => {
      messages.value.push(ev.message);
      setTimeout(() => {
        messages.value.shift();
      }, longHidingTime);
    });
    eventBus$1.subscribe(VueErrorEvent, (ev) => {
      messages.value.push(ev.error.name);
      messages.value.push(JSON.stringify(ev.error.stack));
      messages.value.push(ev.info);
      setTimeout(() => {
        messages.value.shift();
        messages.value.shift();
        messages.value.shift();
      }, longHidingTime);
    });
    function onLoadingChange(newValue) {
      if (newValue) {
        if (hideLoadingTimeout.value) {
          clearTimeout(hideLoadingTimeout.value);
          hideLoadingTimeout.value = 0;
        }
        if (!showLoading.value && !showLoadingTimeout.value) {
          showLoadingTimeout.value = setTimeout(() => {
            showLoading.value = true;
            showLoadingTimeout.value = 0;
          }, hideShowTimeouts);
        }
      } else {
        if (showLoadingTimeout.value) {
          clearTimeout(showLoadingTimeout.value);
          showLoadingTimeout.value = 0;
        }
        if (showLoading.value && !hideLoadingTimeout.value) {
          hideLoadingTimeout.value = setTimeout(() => {
            showLoading.value = false;
            hideLoadingTimeout.value = 0;
          }, hideShowTimeouts);
        }
      }
    }
    function dismissError(i) {
      errors.value.splice(i, 1);
    }
    function resolvableAction(i, actionName) {
      return __async$p(this, null, function* () {
        const error2 = resolvableErrors.value[i];
        resolvableErrors.value.splice(i, 1);
        const action = error2.actions.find((a) => a.name === actionName);
        yield action.exec();
      });
    }
    watch(
      () => props.loading,
      (newValue) => {
        onLoadingChange(newValue);
      }
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        id: "messageConsole",
        class: normalizeClass({ vertical: vertical.value })
      }, [
        showLoading.value ? (openBlock(), createElementBlock("p", _hoisted_1$u, "Loading...")) : createCommentVNode("", true),
        (openBlock(true), createElementBlock(Fragment, null, renderList(messages.value, (message, i) => {
          return openBlock(), createElementBlock("p", {
            key: message + "_" + i
          }, toDisplayString(message), 1);
        }), 128)),
        (openBlock(true), createElementBlock(Fragment, null, renderList(resolvableErrors.value, (error2, i) => {
          return openBlock(), createElementBlock("p", {
            class: "error",
            key: "resolvableError_" + i
          }, [
            createTextVNode(toDisplayString(error2.message) + " ", 1),
            (openBlock(true), createElementBlock(Fragment, null, renderList(error2.actions, (action) => {
              return openBlock(), createElementBlock("a", {
                href: "#",
                key: "resolvableError_" + i + action.name,
                onClick: ($event) => resolvableAction(i, action.name)
              }, "[" + toDisplayString(action.name) + "]", 9, _hoisted_2$q);
            }), 128))
          ]);
        }), 128)),
        (openBlock(true), createElementBlock(Fragment, null, renderList(errors.value, (error2, i) => {
          return openBlock(), createElementBlock("p", {
            class: "error",
            key: "error_" + i
          }, [
            createTextVNode(toDisplayString(error2) + " ", 1),
            createBaseVNode("a", {
              href: "#",
              onClick: ($event) => dismissError(i)
            }, "[Dismiss]", 8, _hoisted_3$j)
          ]);
        }), 128))
      ], 2);
    };
  }
});
const messageConsole_vue_vue_type_style_index_0_scoped_fdb9d9bc_lang = "";
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const MessageConsole = /* @__PURE__ */ _export_sfc(_sfc_main$B, [["__scopeId", "data-v-fdb9d9bc"]]);
const _hoisted_1$t = {
  key: 0,
  id: "submit-options"
};
const _hoisted_2$p = ["onClick"];
const _hoisted_3$i = {
  key: 0,
  id: "submit-options"
};
const _hoisted_4$g = ["onClick"];
const _sfc_main$A = /* @__PURE__ */ defineComponent({
  __name: "modal-dialog",
  props: {
    noBaseSize: Boolean,
    options: {
      type: Array,
      default: []
    }
  },
  emits: ["leave", "option"],
  setup(__props, { emit: __emit }) {
    const isDialogSupported = window.HTMLDialogElement != null;
    const props = __props;
    const dialog = ref(null);
    const emit2 = __emit;
    function open() {
      if (isDialogSupported) {
        const ele = dialog.value;
        if (ele && !ele.open) {
          ele.showModal();
        }
      }
      window.addEventListener("click", clickSomewhere);
    }
    function close() {
      if (isDialogSupported) {
        const ele = dialog.value;
        if (ele && ele.open) {
          ele.close();
        }
        emit2("leave");
      }
      window.removeEventListener("click", clickSomewhere);
    }
    function clickSomewhere(e) {
      const ele = dialog.value;
      if (ele && ele.open) {
        if (e.target === ele) {
          close();
          e.preventDefault();
          e.stopPropagation();
        }
      } else {
        window.removeEventListener("click", clickSomewhere);
      }
    }
    onMounted(open);
    onActivated(open);
    onDeactivated(close);
    onUnmounted(close);
    return (_ctx, _cache) => {
      return isDialogSupported ? (openBlock(), createElementBlock("dialog", {
        key: 0,
        ref_key: "dialog",
        ref: dialog,
        class: normalizeClass(["native", { "base-size": !props.noBaseSize }]),
        onCancel: close
      }, [
        renderSlot(_ctx.$slots, "default", {}, void 0, true),
        __props.options.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_1$t, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.options, (option) => {
            return openBlock(), createElementBlock("button", {
              key: option,
              class: "option",
              onClick: ($event) => emit2("option", option)
            }, toDisplayString(option), 9, _hoisted_2$p);
          }), 128))
        ])) : createCommentVNode("", true)
      ], 34)) : (openBlock(), createElementBlock("div", {
        key: 1,
        class: "dialog-wrapper",
        onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("leave"))
      }, [
        createBaseVNode("dialog", {
          ref_key: "dialog",
          ref: dialog,
          open: "",
          class: normalizeClass({ "base-size": !props.noBaseSize }),
          onClick: _cache[0] || (_cache[0] = withModifiers(() => {
          }, ["stop"]))
        }, [
          renderSlot(_ctx.$slots, "default", {}, void 0, true),
          __props.options.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_3$i, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(props.options, (option) => {
              return openBlock(), createElementBlock("button", {
                key: option,
                class: "option",
                onClick: ($event) => emit2("option", option)
              }, toDisplayString(option), 9, _hoisted_4$g);
            }), 128))
          ])) : createCommentVNode("", true)
        ], 2)
      ]));
    };
  }
});
const modalDialog_vue_vue_type_style_index_0_scoped_95b82e11_lang = "";
const ModalDialog = /* @__PURE__ */ _export_sfc(_sfc_main$A, [["__scopeId", "data-v-95b82e11"]]);
const scale = "" + new URL("open_in_full.0d15444c.svg", import.meta.url).href;
const scaleDark = "" + new URL("open_in_full_dark.e8d5767b.svg", import.meta.url).href;
const rotate = "" + new URL("rotate_left.d26c7be6.svg", import.meta.url).href;
const rotateDark = "" + new URL("rotate_left_dark.1e7e3add.svg", import.meta.url).href;
var __async$o = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function safeAsync(name, callback) {
  return __async$o(this, null, function* () {
    try {
      yield callback();
    } catch (e) {
      console.error("Error in promise", name, e);
      eventBus$1.fire(
        new FailureEvent(
          "Unexpected error! Please copy the following message and send it to /u/edave64: Error in '" + name + '", ' + normalizeError(e)
        )
      );
    }
  });
}
function normalizeError(e) {
  if (e instanceof Error) {
    if (e.stack != null) {
      const stackLines = e.stack.split("\n");
      if (stackLines[0].includes(e.name) && stackLines[0].includes(e.message)) {
        return stackLines[0] + "\n<br />" + stackLines[1];
      } else {
        return e.name + ": " + e.message + "\n<br />" + stackLines[0];
      }
    }
    return e.name + ": " + e.message;
  }
  if (e instanceof Object) {
    return JSON.stringify(e);
  }
  return "" + e;
}
var __async$n = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var _a;
const pixelRatio = (_a = window.devicePixelRatio) != null ? _a : 1;
function paint(ctx, center) {
  const offsetCenter = movePointIntoView(center);
  ctx.save();
  if (dragData) {
    paintDashedLine(center, dragData.lastPos);
    dragData.grabby.paint(ctx, dragData);
    ctx.translate(dragData.lastPos.x, dragData.lastPos.y);
    ctx.scale(pixelRatio, pixelRatio);
    drawGrabby(ctx, dragData.grabby, new DOMPointReadOnly());
  } else {
    const constants = getConstants();
    ctx.translate(offsetCenter.x, offsetCenter.y);
    ctx.scale(pixelRatio, pixelRatio);
    if (center.x > constants.Base.screenWidth / 2) {
      ctx.scale(-1, 1);
    }
    if (center.y > constants.Base.screenHeight / 2) {
      ctx.scale(1, -1);
    }
    for (let i = 0; i < grabbies.length; i++) {
      const grabby = grabbies[i];
      if (!grabby.pos) {
        grabby.pos = getRadialPos(rotationOneSixth * (i + 1));
      }
      drawGrabby(ctx, grabby, grabby.pos);
    }
  }
  ctx.restore();
  function paintDashedLine(start, end) {
    ctx.save();
    try {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.setLineDash([5 * pixelRatio, 5 * pixelRatio]);
      ctx.strokeStyle = "#000";
      ctx.stroke();
      ctx.closePath();
    } finally {
      ctx.restore();
    }
  }
}
const tau = 2 * Math.PI;
const grabbies = [
  {
    icon: rotate,
    iconDark: rotateDark,
    paint(ctx, { lastPos, center, initialDragAngle }) {
      const { angle } = vectorToAngleAndDistance(
        pointsToVector(center, lastPos)
      );
      const constants = getConstants().Base;
      let normAngle = mod(initialDragAngle - angle, tau);
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      let start = initialDragAngle - Math.PI;
      let end = start + angle - initialDragAngle;
      if (normAngle <= Math.PI) {
        const tmp = end;
        end = start;
        start = tmp;
      }
      ctx.arc(center.x, center.y, constants.wheelInnerRadius, start, end);
      ctx.lineTo(center.x, center.y);
      ctx.globalCompositeOperation = "difference";
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    },
    onStartMove(store2, obj, dragData2) {
      dragData2.initalObjRotation = obj.rotation;
      const { angle } = vectorToAngleAndDistance(
        pointsToVector(dragData2.center, dragData2.lastPos)
      );
      dragData2.initialDragAngle = angle;
    },
    onMove(store2, obj, shift, { center, initalObjRotation, initialDragAngle }) {
      const { angle } = vectorToAngleAndDistance(
        pointsToVector(center, dragData.lastPos)
      );
      let rotation = mod(
        initalObjRotation + (angle - initialDragAngle) / Math.PI * 180,
        360
      );
      if (shift) {
        rotation = Math.round(rotation / 22.5) * 22.5;
      }
      if (obj.rotation === rotation)
        return;
      store2.commit("panels/setRotation", {
        panelId: obj.panelId,
        id: obj.id,
        rotation
      });
    }
  },
  {
    icon: scale,
    iconDark: scaleDark,
    paint(ctx, { renderObj, originalObjTransform }) {
      if (!originalObjTransform)
        return;
      const currentTransform = renderObj.preparedTransform;
      try {
        renderObj.preparedTransform = originalObjTransform;
        ctxScope(ctx, () => {
          ctx.globalAlpha = 0.5;
          renderObj.render(ctx, SelectedState.None, true, false, true);
          ctx.globalAlpha = 1;
        });
      } finally {
        renderObj.preparedTransform = currentTransform;
      }
    },
    onStartMove(store2, obj, dragData2) {
      dragData2.originalObjTransform = dragData2.renderObj.preparedTransform;
      dragData2.initialScaleX = obj.scaleX;
      dragData2.initialScaleY = obj.scaleY;
      dragData2.initialDelta = pointsToVector(dragData2.center, dragData2.lastPos);
    },
    onMove(store2, obj, shift, {
      initialScaleX,
      initialScaleY,
      initialDelta,
      center,
      lastPos
    }) {
      const constants = getConstants();
      const currentDelta = pointsToVector(center, lastPos);
      let scaleX = currentDelta.x / initialDelta.x * initialScaleX;
      let scaleY = currentDelta.y / initialDelta.y * initialScaleY;
      if (shift) {
        let startAdjustedDelta = currentDelta;
        if (center.x > constants.Base.screenWidth / 2) {
          startAdjustedDelta = new DOMPointReadOnly(
            -startAdjustedDelta.x,
            startAdjustedDelta.y
          );
        }
        if (center.y > constants.Base.screenHeight / 2) {
          startAdjustedDelta = new DOMPointReadOnly(
            startAdjustedDelta.x,
            -startAdjustedDelta.y
          );
        }
        const { angle } = vectorToAngleAndDistance(startAdjustedDelta);
        const angleDirection = Math.round(angle / tau * 11);
        const avg = (Math.abs(currentDelta.x) / Math.abs(initialDelta.x) + Math.abs(currentDelta.y) / Math.abs(initialDelta.y)) / 2;
        if (angleDirection === 0 || angleDirection === 11) {
          scaleY = initialScaleY;
        } else if (angleDirection === 1) {
          scaleX = -avg * initialScaleX;
          scaleY = -avg * initialScaleY;
        } else if (angleDirection === 2 || angleDirection === 3) {
          scaleX = initialScaleX;
        } else if (angleDirection === 4) {
          scaleX = avg * initialScaleX;
          scaleY = -avg * initialScaleY;
        } else if (angleDirection === 5 || angleDirection === 6) {
          scaleY = initialScaleY;
        } else if (angleDirection === 7) {
          scaleX = avg * initialScaleX;
          scaleY = avg * initialScaleY;
        } else if (angleDirection === 8 || angleDirection === 9) {
          scaleX = initialScaleX;
        } else if (angleDirection === 10) {
          scaleX = -avg * initialScaleX;
          scaleY = avg * initialScaleY;
        }
      }
      if (obj.scaleX === scaleX && obj.scaleY === scaleY)
        return;
      store2.commit("panels/setObjectScale", {
        panelId: obj.panelId,
        id: obj.id,
        scaleX,
        scaleY
      });
    }
  }
];
let dragData = null;
function onDown(pos) {
  const constants = getConstants();
  const grabbyHit = grabbies.find((grabby) => {
    const grabbyPos = grabby.lastDrawPos;
    if (!grabbyPos)
      return false;
    const distance = Math.sqrt(
      Math.pow(pos.x - grabbyPos.x, 2) + Math.pow(pos.y - grabbyPos.y, 2)
    );
    return distance <= constants.Base.wheelWidth / 2 * pixelRatio;
  });
  if (grabbyHit) {
    dragData = {
      lastPos: pos,
      started: false,
      grabby: grabbyHit,
      center: null,
      renderObj: null
    };
    return true;
  }
  return false;
}
function onMove(store2, pos, shift) {
  var _a2, _b;
  if (!dragData)
    return false;
  const panels2 = store2.state.panels;
  const currentPanel = panels2.panels[panels2.currentPanel];
  const obj = currentPanel.objects[store2.state.ui.selection];
  if (!dragData.started) {
    dragData.started = true;
    const sceneRenderer2 = getMainSceneRenderer(store2);
    const renderObj = sceneRenderer2 == null ? void 0 : sceneRenderer2.getLastRenderObject(obj.id);
    const linkedTransform = (_b = (_a2 = sceneRenderer2 == null ? void 0 : sceneRenderer2.getLastRenderObject(obj.linkedTo)) == null ? void 0 : _a2.preparedTransform) != null ? _b : new DOMMatrixReadOnly();
    dragData.renderObj = renderObj;
    dragData.center = linkedTransform.transformPoint(
      new DOMPointReadOnly(obj.x, obj.y)
    );
    dragData.grabby.onStartMove(store2, obj, dragData);
  }
  dragData.lastPos = pos;
  dragData.grabby.onMove(store2, obj, shift, dragData);
  return true;
}
function onDrop() {
  if (!dragData)
    return false;
  dragData = null;
  return true;
}
const grabbyIcons = /* @__PURE__ */ new Map();
for (const grabby of grabbies) {
  safeAsync(
    "Loading grabby icon",
    ((grabby2) => __async$n(void 0, null, function* () {
      grabbyIcons.set(grabby2.icon, yield getAssetByUrl(grabby2.icon));
      grabbyIcons.set(grabby2.iconDark, yield getAssetByUrl(grabby2.iconDark));
    })).bind(void 0, grabby)
  );
}
function drawGrabby(ctx, grabby, pos) {
  var _a2;
  const constants = getConstants();
  ctx.save();
  ctx.translate(pos.x, pos.y);
  grabby.lastDrawPos = ctx.getTransform().transformPoint(new DOMPointReadOnly());
  ctx.scale(-1, 1);
  ctx.beginPath();
  ctx.ellipse(
    0,
    0,
    constants.Base.wheelWidth / 2,
    constants.Base.wheelWidth / 2,
    0,
    0,
    tau
  );
  ctx.closePath();
  const style = getComputedStyle(document.body);
  ctx.fillStyle = style.getPropertyValue("--accent-background");
  ctx.strokeStyle = style.getPropertyValue("--border");
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  const icon = document.body.classList.contains("dark-theme") ? grabby.iconDark : grabby.icon;
  (_a2 = grabbyIcons.get(icon)) == null ? void 0 : _a2.paintOnto(ctx);
  ctx.restore();
}
function movePointIntoView(center) {
  const constants = getConstants();
  const fullRadius = constants.Base.wheelWidth + constants.Base.wheelInnerRadius * pixelRatio;
  return new DOMPointReadOnly(
    between(fullRadius, center.x, constants.Base.screenWidth - fullRadius),
    between(fullRadius, center.y, constants.Base.screenHeight - fullRadius)
  );
}
const rotationOneSixth = Math.PI / 6;
function getRadialPos(angle) {
  const constants = getConstants().Base;
  return new DOMPointReadOnly(
    constants.wheelInnerRadius * Math.cos(angle),
    constants.wheelInnerRadius * Math.sin(angle)
  );
}
function pointsToVector(a, b) {
  return new DOMPointReadOnly(a.x - b.x, a.y - b.y);
}
function vectorToAngleAndDistance(v) {
  const angle = Math.atan2(v.y, v.x);
  return {
    angle: mod(angle, tau),
    distance: Math.sqrt(v.x * v.x + v.y * v.y)
  };
}
var __async$m = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _hoisted_1$s = ["height", "width"];
const _sfc_main$z = /* @__PURE__ */ defineComponent({
  __name: "render",
  props: {
    canvasWidth: { default: 0 },
    canvasHeight: { default: 0 },
    preLoading: { type: Boolean }
  },
  setup(__props, { expose: __expose }) {
    const store2 = useStore();
    const props = __props;
    const sd = ref(null);
    const sdCtx = ref(null);
    const queuedRender = ref(null);
    const showingLast = ref(false);
    const dropPreventClick = ref(false);
    const selection = computed(() => {
      var _a2;
      return (_a2 = store2.state.ui.selection) != null ? _a2 : null;
    });
    const currentPanel = computed(
      () => store2.state.panels.panels[store2.state.panels.currentPanel]
    );
    const lqRendering = computed(() => store2.state.ui.lqRendering);
    function getSceneRender() {
      if (props.preLoading)
        return null;
      const renderer2 = getMainSceneRenderer(store2);
      renderer2 == null ? void 0 : renderer2.setPanelId(store2.state.panels.currentPanel);
      return renderer2;
    }
    const bitmapHeight = computed(() => {
      props.preLoading;
      return getConstants().Base.screenHeight;
    });
    const bitmapWidth = computed(() => {
      props.preLoading;
      return getConstants().Base.screenWidth;
    });
    function invalidateRender() {
      if (queuedRender.value != null)
        return;
      queuedRender.value = requestAnimationFrame(render_);
    }
    function render_() {
      return __async$m(this, null, function* () {
        var _a2;
        if (queuedRender.value != null) {
          cancelAnimationFrame(queuedRender.value);
          queuedRender.value = null;
        }
        if (props.preLoading)
          return;
        if (store2.state.unsafe)
          return;
        try {
          yield (_a2 = getSceneRender()) == null ? void 0 : _a2.render(!lqRendering.value, true, true);
        } catch (e) {
          console.log(e);
        }
        display();
        eventBus$1.fire(new RenderUpdatedEvent());
      });
    }
    function renderLoadingScreen() {
      const loadingScreen = document.createElement("canvas");
      loadingScreen.height = bitmapHeight.value;
      loadingScreen.width = bitmapWidth.value;
      try {
        const rctx = RenderContext.make(loadingScreen, true, false);
        rctx.drawText({
          text: "Starting...",
          x: loadingScreen.width / 2,
          y: loadingScreen.height / 2,
          align: "center",
          outline: {
            width: 5,
            style: "#b59"
          },
          font: "32px riffic",
          fill: {
            style: "white"
          }
        });
        sdCtx.value.drawImage(
          loadingScreen,
          props.canvasWidth,
          props.canvasHeight
        );
      } finally {
        disposeCanvas(loadingScreen);
      }
    }
    function display() {
      const renderer2 = getSceneRender();
      showingLast.value = false;
      renderer2 == null ? void 0 : renderer2.paintOnto(sdCtx.value, {
        x: 0,
        y: 0,
        w: bitmapWidth.value,
        h: bitmapHeight.value
      });
      const obj = renderer2 == null ? void 0 : renderer2.getLastRenderObject(selection.value);
      if (obj) {
        paint(
          sdCtx.value,
          obj.preparedTransform.transformPoint(new DOMPoint(0, 0))
        );
      }
      inBlendOver.value = false;
    }
    function toRendererCoordinate(x, y, transform) {
      const canvas = sd.value;
      const rx = x - canvas.offsetLeft;
      const ry = y - canvas.offsetTop;
      let sx = rx / canvas.offsetWidth * canvas.width;
      let sy = ry / canvas.offsetWidth * canvas.width;
      if (transform) {
        const point = transform.transformPoint(new DOMPointReadOnly(sx, sy));
        sx = point.x;
        sy = point.y;
      }
      return [sx, sy];
    }
    function onUiClick(e) {
      var _a2;
      const [sx, sy] = toRendererCoordinate(e.clientX, e.clientY);
      if (handleColorPickerClick(sx, sy))
        return;
      if (dropPreventClick.value) {
        dropPreventClick.value = false;
        return;
      }
      const objects = getSceneRender().objectsAt(sx, sy);
      const selectionId = selection.value;
      const currentObjectIdx = objects.findIndex((id) => id === selectionId);
      let selectedObject;
      if (currentObjectIdx === 0) {
        selectedObject = null;
      } else if (currentObjectIdx !== -1) {
        selectedObject = objects[currentObjectIdx - 1];
      } else {
        selectedObject = (_a2 = objects[objects.length - 1]) != null ? _a2 : null;
      }
      transaction(() => {
        if (store2.state.ui.selection === selectedObject)
          return;
        store2.commit("ui/setSelection", selectedObject);
      });
    }
    watch(
      () => [props.canvasWidth, props.canvasHeight],
      () => display()
    );
    eventBus$1.subscribe(InvalidateRenderEvent, invalidateRender);
    eventBus$1.subscribe(StateLoadingEvent, () => {
      const cache = getSceneRender();
      if (cache) {
        cache.setPanelId(-1);
      }
    });
    store2.subscribe((mut) => {
      if (mut.type === "panels/setPanelPreview")
        return;
      if (mut.type === "panels/currentPanel")
        return;
      invalidateRender();
    });
    onMounted(() => {
      sdCtx.value = sd.value.getContext("2d");
      renderLoadingScreen();
      invalidateRender();
    });
    onUnmounted(() => {
      getSceneRender().dispose();
    });
    const inBlendOver = ref(false);
    function blendOver(url) {
      return __async$m(this, null, function* () {
        if (inBlendOver.value) {
          render_();
          inBlendOver.value = false;
        } else {
          const image = yield imagePromise(url, true);
          sdCtx.value.clearRect(0, 0, sd.value.width, sd.value.height);
          image.paintOnto(sdCtx.value, {
            x: 0,
            y: 0
          });
          inBlendOver.value = true;
        }
        sdCtx.value;
      });
    }
    const pickerMode = computed(() => store2.state.ui.pickColor);
    const cursor = computed(
      () => pickerMode.value ? "crosshair" : "default"
    );
    function handleColorPickerClick(sx, sy) {
      if (pickerMode.value) {
        const data = sdCtx.value.getImageData(sx, sy, 1, 1).data;
        const hex = `rgba(${data[0].toString()},${data[1].toString()},${data[2].toString()},${(data[3] / 255).toString()})`;
        transaction(() => {
          store2.commit("ui/setColorPicker", false);
          eventBus$1.fire(new ColorPickedEvent(hex));
        });
        return true;
      }
      return false;
    }
    function download() {
      return __async$m(this, null, function* () {
        const url = yield getSceneRender().download();
        yield transaction(() => {
          const oldUrl = store2.state.ui.lastDownload;
          store2.commit("ui/setLastDownload", url);
          if (oldUrl != null) {
            URL.revokeObjectURL(oldUrl);
          }
        });
      });
    }
    let draggedObject = null;
    let dragTransform = null;
    let dragXOffset = 0;
    let dragYOffset = 0;
    let dragXOriginal = 0;
    let dragYOriginal = 0;
    function onDragStart(e) {
      e.preventDefault();
      dragStart(e.clientX, e.clientY);
    }
    function onTouchStart(e) {
      dragStart(e.touches[0].clientX, e.touches[0].clientY);
    }
    function dragStart(rx, ry) {
      var _a2, _b, _c;
      const selectionId = selection.value;
      if (selectionId === null)
        return;
      draggedObject = currentPanel.value.objects[selectionId];
      dragTransform = (_c = (_b = (_a2 = getMainSceneRenderer(store2).getLastRenderObject(draggedObject.linkedTo)) == null ? void 0 : _a2.preparedTransform) == null ? void 0 : _b.inverse()) != null ? _c : new DOMMatrixReadOnly();
      const [x, y] = toRendererCoordinate(rx, ry, dragTransform);
      if (selectionId != null && onDown(new DOMPointReadOnly(...toRendererCoordinate(rx, ry))))
        return;
      dragXOffset = x - draggedObject.x;
      dragYOffset = y - draggedObject.y;
      dragXOriginal = draggedObject.x;
      dragYOriginal = draggedObject.y;
    }
    function onDragOver(e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
    function onSpriteDragMove(e) {
      if (!draggedObject)
        return;
      e.preventDefault();
      const oX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
      const oY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
      let [x, y] = toRendererCoordinate(oX, oY, dragTransform);
      if (onMove(
        store2,
        new DOMPointReadOnly(...toRendererCoordinate(oX, oY)),
        e.shiftKey
      )) {
        invalidateRender();
        return;
      }
      x -= dragXOffset;
      y -= dragYOffset;
      const deltaX = Math.abs(x - dragXOriginal);
      const deltaY = Math.abs(y - dragYOriginal);
      if (deltaX + deltaY > 1)
        dropPreventClick.value = true;
      if (e.shiftKey) {
        if (deltaX > deltaY) {
          y = dragYOriginal;
        } else {
          x = dragXOriginal;
        }
      }
      transaction(() => __async$m(this, null, function* () {
        yield store2.dispatch("panels/setPosition", {
          panelId: draggedObject.panelId,
          id: draggedObject.id,
          x,
          y
        });
      }));
    }
    function onDrop$1(e) {
      return __async$m(this, null, function* () {
        e.stopPropagation();
        e.preventDefault();
        if (!e.dataTransfer)
          return;
        for (const item of e.dataTransfer.items) {
          if (item.kind === "file" && item.type.match(/image.*/)) {
            const file = item.getAsFile();
            const url = URL.createObjectURL(file);
            try {
              const assetUrl = yield store2.dispatch("uploadUrls/add", {
                name: file.name,
                url
              });
              yield transaction(() => __async$m(this, null, function* () {
                yield store2.dispatch("panels/createSprite", {
                  panelId: store2.state.panels.currentPanel,
                  assets: [
                    {
                      hq: assetUrl,
                      lq: assetUrl,
                      sourcePack: "dddg.uploaded.sprites"
                    }
                  ]
                });
              }));
            } catch (e2) {
              URL.revokeObjectURL(url);
            }
          }
        }
      });
    }
    function onSpriteDrop(e) {
      if (onDrop()) {
        invalidateRender();
        e.preventDefault();
        draggedObject = null;
        dropPreventClick.value = true;
        return;
      }
      if (draggedObject) {
        if ("TouchEvent" in window && e instanceof TouchEvent) {
          dropPreventClick.value = false;
        }
        draggedObject = null;
      }
    }
    function onMouseEnter(e) {
      if (e.buttons !== 1) {
        draggedObject = null;
        if (onDrop()) {
          invalidateRender();
        }
      }
    }
    __expose({ download, blendOver });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("canvas", {
        id: "scaled_display",
        ref_key: "sd",
        ref: sd,
        height: bitmapHeight.value,
        width: bitmapWidth.value,
        style: normalizeStyle$1({ width: __props.canvasWidth + "px", height: __props.canvasHeight + "px", cursor: cursor.value }),
        draggable: "true",
        onClick: onUiClick,
        onTouchstart: onTouchStart,
        onDragstart: onDragStart,
        onTouchmove: onSpriteDragMove,
        onMousemove: onSpriteDragMove,
        onTouchend: onSpriteDrop,
        onMouseup: onSpriteDrop,
        onDragover: onDragOver,
        onDrop: onDrop$1,
        onMouseenter: onMouseEnter,
        onContextmenu: _cache[0] || (_cache[0] = withModifiers(() => {
        }, ["prevent"]))
      }, " HTML5 is required to use the Doki Doki Dialog Generator. ", 44, _hoisted_1$s);
    };
  }
});
const render_vue_vue_type_style_index_0_lang = "";
const _hoisted_1$r = ["disabled", "title", "aria-label"];
const _hoisted_2$o = {
  key: 0,
  class: "material-icons",
  "aria-hidden": "true"
};
const _hoisted_3$h = { class: "content" };
const _hoisted_4$f = {
  key: 1,
  class: "shortcut-popup"
};
const _sfc_main$y = /* @__PURE__ */ defineComponent({
  __name: "d-button",
  props: {
    icon: {
      type: String,
      required: true
    },
    iconPos: {
      type: String,
      default: "left"
    },
    disabled: {
      type: Boolean,
      default: false
    },
    shortcut: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: null
    }
  },
  setup(__props) {
    const props = __props;
    const btn = ref(null);
    const showPopup = computed(
      () => props.shortcut != null && !props.shortcut.startsWith("!")
    );
    const popupText = computed(() => {
      const shortcut = props.shortcut;
      if (shortcut == null)
        return "";
      if (shortcut.startsWith("!"))
        return shortcut.substring(1);
      return shortcut;
    });
    function fireShortcut(e) {
      if (props.disabled)
        return;
      if (e.key === props.shortcut && e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
        btn.value.focus({ focusVisible: false });
        btn.value.click();
        e.preventDefault();
        e.stopPropagation();
      }
    }
    onMounted(() => {
      if (!props.shortcut)
        return;
      window.addEventListener("keydown", fireShortcut);
    });
    onUnmounted(() => {
      window.removeEventListener("keydown", fireShortcut);
    });
    return (_ctx, _cache) => {
      var _a2, _b;
      return openBlock(), createElementBlock("button", {
        class: normalizeClass([__props.iconPos]),
        disabled: __props.disabled,
        title: (_a2 = __props.title) != null ? _a2 : void 0,
        "aria-label": (_b = __props.title) != null ? _b : void 0,
        style: normalizeStyle$1(__props.icon ? "height: auto" : ""),
        ref_key: "btn",
        ref: btn
      }, [
        __props.icon ? (openBlock(), createElementBlock("div", _hoisted_2$o, toDisplayString(__props.icon), 1)) : createCommentVNode("", true),
        createBaseVNode("div", _hoisted_3$h, [
          renderSlot(_ctx.$slots, "default", {}, void 0, true)
        ]),
        showPopup.value ? (openBlock(), createElementBlock("div", _hoisted_4$f, toDisplayString(popupText.value), 1)) : createCommentVNode("", true)
      ], 14, _hoisted_1$r);
    };
  }
});
const dButton_vue_vue_type_style_index_0_scoped_eccae88d_lang = "";
const DButton = /* @__PURE__ */ _export_sfc(_sfc_main$y, [["__scopeId", "data-v-eccae88d"]]);
const VerticalScrollRedirect = {
  methods: {
    verticalScrollRedirect
  }
};
function verticalScrollRedirect(e) {
  if (e.type !== "wheel")
    return;
  if (!e.currentTarget)
    return;
  const currentTarget = e.currentTarget;
  const target = getComputedStyle(currentTarget);
  const ev = e;
  if (ev.deltaY === 0) {
    return;
  }
  if (target.overflowY === "auto") {
    if (ev.deltaY > 0) {
      if (currentTarget.scrollHeight > currentTarget.scrollTop + currentTarget.clientHeight) {
        e.stopPropagation();
        return;
      }
    } else {
      if (currentTarget.scrollTop > 0) {
        e.stopPropagation();
        return;
      }
    }
  }
  const oldScrollLeft = currentTarget.scrollLeft;
  currentTarget.scrollLeft += ev.deltaY;
  if (currentTarget.scrollLeft !== oldScrollLeft) {
    e.stopPropagation();
  }
}
function setupPanelMixin(root) {
  const store2 = useStore();
  const vertical = computed(() => store2.state.ui.vertical);
  function getRoot() {
    const rootV = root.value;
    if (!rootV)
      return null;
    if (rootV.$el) {
      return rootV.$el;
    }
    return rootV;
  }
  function updateVertical() {
    if (!root.value)
      return;
    getRoot().classList.toggle("vertical", vertical.value);
  }
  watch(() => vertical.value, updateVertical);
  onMounted(() => {
    updateVertical();
    getRoot().addEventListener(
      "wheel",
      (e) => {
        if (!vertical.value)
          verticalScrollRedirect(e);
      },
      { passive: true }
    );
  });
  return { vertical, getRoot };
}
var __async$l = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _hoisted_1$q = ["title", "onClick", "onKeypress"];
const _hoisted_2$n = ["src", "alt"];
const _sfc_main$x = /* @__PURE__ */ defineComponent({
  __name: "character",
  emits: ["show-dialog"],
  setup(__props, { emit: __emit }) {
    const store2 = useStore();
    const emit2 = __emit;
    const characters = computed(() => {
      return store2.state.content.current.characters;
    });
    function assetPath(character) {
      return character.chibi ? envX.supports.lq ? character.chibi.lq : character.chibi.hq : "";
    }
    function onChosen(id) {
      transaction(() => __async$l(this, null, function* () {
        yield store2.dispatch("panels/createCharacters", {
          characterType: id,
          panelId: store2.state.panels.currentPanel
        });
      }));
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(Fragment, null, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(characters.value, (character) => {
          return openBlock(), createElementBlock("div", {
            class: "character",
            tabindex: "0",
            key: character.id,
            title: character.label,
            onClick: withModifiers(($event) => onChosen(character.id), ["left"]),
            onKeypress: [
              withKeys(withModifiers(($event) => onChosen(character.id), ["prevent", "stop"]), ["enter"]),
              withKeys(withModifiers(($event) => onChosen(character.id), ["prevent", "stop"]), ["space"])
            ]
          }, [
            createBaseVNode("img", {
              src: assetPath(character),
              alt: character.label
            }, null, 8, _hoisted_2$n)
          ], 40, _hoisted_1$q);
        }), 128)),
        createVNode(DButton, {
          class: "custom-sprite",
          icon: "extension",
          onClick: _cache[0] || (_cache[0] = ($event) => emit2("show-dialog", "type: Characters"))
        }, {
          default: withCtx(() => [
            createTextVNode(" Search in content packs ")
          ]),
          _: 1
        })
      ], 64);
    };
  }
});
const character_vue_vue_type_style_index_0_scoped_f0d6ef73_lang = "";
const Characters = /* @__PURE__ */ _export_sfc(_sfc_main$x, [["__scopeId", "data-v-f0d6ef73"]]);
const _sfc_main$w = /* @__PURE__ */ defineComponent({
  __name: "drop-target",
  emits: ["drop"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit2 = __emit;
    const store2 = useStore();
    const visible = ref(false);
    const vertical = computed(() => store2.state.ui.vertical);
    function show() {
      visible.value = true;
    }
    function hide() {
      visible.value = false;
    }
    function drop(e) {
      hide();
      e.stopPropagation();
      e.preventDefault();
      if (!e.dataTransfer)
        return;
      for (const item of e.dataTransfer.items) {
        if (item.kind === "file" && item.type.match(/image.*/)) {
          emit2("drop", item.getAsFile());
        }
      }
    }
    __expose({ show, hide });
    return (_ctx, _cache) => {
      return visible.value ? (openBlock(), createElementBlock("div", {
        key: 0,
        onDragleave: _cache[0] || (_cache[0] = ($event) => visible.value = false),
        onDrop: drop,
        class: normalizeClass({ vertical: vertical.value })
      }, [
        renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ], 34)) : createCommentVNode("", true);
    };
  }
});
const dropTarget_vue_vue_type_style_index_0_scoped_34538d63_lang = "";
const DropTarget = /* @__PURE__ */ _export_sfc(_sfc_main$w, [["__scopeId", "data-v-34538d63"]]);
var __defProp$6 = Object.defineProperty;
var __defProps$4 = Object.defineProperties;
var __getOwnPropDescs$4 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$6 = Object.getOwnPropertySymbols;
var __hasOwnProp$6 = Object.prototype.hasOwnProperty;
var __propIsEnum$6 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$6 = (obj, key, value) => key in obj ? __defProp$6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$6 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$6.call(b, prop))
      __defNormalProp$6(a, prop, b[prop]);
  if (__getOwnPropSymbols$6)
    for (var prop of __getOwnPropSymbols$6(b)) {
      if (__propIsEnum$6.call(b, prop))
        __defNormalProp$6(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$4 = (a, b) => __defProps$4(a, __getOwnPropDescs$4(b));
var __async$k = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _hoisted_1$p = ["title", "onClick", "onKeypress"];
const _hoisted_2$m = ["title", "onClick", "onKeypress"];
const _sfc_main$v = /* @__PURE__ */ defineComponent({
  __name: "sprite",
  emits: ["show-dialog"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const store2 = useStore();
    const emit2 = __emit;
    const sprites = computed(() => {
      return store2.state.content.current.sprites.map((x) => {
        let missing = null;
        const urls = x.variants[0].map((y) => {
          const url = getAAssetUrl(y, false);
          if (url.startsWith("uploads:")) {
            Object.keys(store2.state.uploadUrls);
            missing = url;
            return MissingImage;
          } else {
            return url;
          }
        });
        return __spreadProps$4(__spreadValues$6({}, x), {
          missing,
          urls
        });
      });
    });
    const showSpritesFolder = computed(() => {
      return envX.supports.openableFolders.has(
        "sprites"
      );
    });
    function assetSpriteBackground(sprite) {
      return sprite.variants[0].map((variant) => `url('${getAAssetUrl(variant, false)}')`).join(",");
    }
    function addSpriteToScene(sprite) {
      return __async$k(this, null, function* () {
        yield transaction(() => __async$k(this, null, function* () {
          yield store2.dispatch("panels/createSprite", {
            panelId: store2.state.panels.currentPanel,
            assets: sprite.variants[0]
          });
        }));
      });
    }
    function openSpritesFolder() {
      envX.openFolder("sprites");
    }
    const missingSpriteUpload = ref(null);
    function onMissingSpriteFileUpload(_e) {
      return __async$k(this, null, function* () {
        const uploadInput = missingSpriteUpload.value;
        const spriteName = uploadInput.uploadingSprite;
        if (!uploadInput.files)
          return;
        if (uploadInput.files.length !== 1) {
          console.error("More than one file uploaded!");
          return;
        }
        const file = uploadInput.files[0];
        yield transaction(() => __async$k(this, null, function* () {
          const url = URL.createObjectURL(file);
          yield store2.dispatch("uploadUrls/add", {
            name: spriteName,
            url
          });
        }));
      });
    }
    function reuploadingSprite(sprite) {
      const missingSpriteUpload_ = missingSpriteUpload.value;
      missingSpriteUpload_.uploadingSprite = getAAssetUrl(
        sprite.variants[0][0]
      ).substring(8);
      missingSpriteUpload_.click();
    }
    const uploadedSpritesPackDefault = {
      packId: "dddg.uploads.sprites",
      packCredits: [""],
      dependencies: [],
      characters: [],
      fonts: [],
      sprites: [],
      poemStyles: [],
      poemBackgrounds: [],
      backgrounds: [],
      colors: []
    };
    const spriteUpload = ref(null);
    function onSpriteFileUpload() {
      const uploadInput = spriteUpload.value;
      if (!uploadInput.files)
        return;
      for (const file of uploadInput.files) {
        addCustomSpriteFile(file);
      }
    }
    function uploadFromURL() {
      return __async$k(this, null, function* () {
        const url = prompt("Enter the URL of the image");
        if (url == null)
          return;
        const lastSegment = url.split("/").slice(-1)[0];
        yield addNewCustomSprite(lastSegment, url);
      });
    }
    function addCustomSpriteFile(file) {
      return __async$k(this, null, function* () {
        yield transaction((subTransaction) => __async$k(this, null, function* () {
          const url = URL.createObjectURL(file);
          const assetUrl = yield store2.dispatch("uploadUrls/add", {
            name: file.name,
            url
          });
          yield addNewCustomSprite(file.name, assetUrl, subTransaction);
        }));
      });
    }
    function addNewCustomSprite(_0, _1) {
      return __async$k(this, arguments, function* (label, url, subTransaction = transaction) {
        const old = store2.state.content.contentPacks.find(
          (x) => x.packId === uploadedSpritesPackDefault.packId
        ) || uploadedSpritesPackDefault;
        const newPackVersion = __spreadProps$4(__spreadValues$6({}, old), {
          sprites: [
            ...old.sprites,
            {
              id: url,
              label,
              variants: [[{ lq: url, hq: url }]],
              defaultScale: [1, 1],
              hd: null
            }
          ]
        });
        yield subTransaction(() => __async$k(this, null, function* () {
          yield store2.dispatch("content/replaceContentPack", {
            contentPack: newPackVersion,
            processed: true
          });
        }));
      });
    }
    const spriteDt = ref(null);
    function showDropTarget(e) {
      if (!e.dataTransfer)
        return;
      e.dataTransfer.effectAllowed = "none";
      if (!Array.from(e.dataTransfer.items).find(
        (item) => item.type.match(/^image.*$/)
      )) {
        return;
      }
      e.dataTransfer.effectAllowed = "link";
      spriteDt.value.show();
    }
    function hideDropTarget() {
      spriteDt.value.hide();
    }
    __expose({ showDropTarget, hideDropTarget });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(Fragment, null, [
        createVNode(DropTarget, {
          ref_key: "spriteDt",
          ref: spriteDt,
          class: "drop-target",
          onDrop: addCustomSpriteFile
        }, {
          default: withCtx(() => [
            createTextVNode("Drop here to add as a new sprite ")
          ]),
          _: 1
        }, 512),
        (openBlock(true), createElementBlock(Fragment, null, renderList(sprites.value, (sprite) => {
          return openBlock(), createElementBlock(Fragment, null, [
            sprite.missing !== null ? (openBlock(), createElementBlock("div", {
              class: "sprite",
              tabindex: "0",
              key: `${sprite.label}_missing`,
              title: sprite.label,
              style: normalizeStyle$1({ background: assetSpriteBackground(sprite) }),
              onClick: ($event) => reuploadingSprite(sprite),
              onKeypress: [
                withKeys(withModifiers(($event) => reuploadingSprite(sprite), ["prevent", "stop"]), ["enter"]),
                withKeys(withModifiers(($event) => reuploadingSprite(sprite), ["prevent", "stop"]), ["space"])
              ]
            }, toDisplayString(sprite.label), 45, _hoisted_1$p)) : (openBlock(), createElementBlock("div", {
              class: "sprite",
              tabindex: "0",
              key: sprite.label,
              title: sprite.label,
              style: normalizeStyle$1({ background: assetSpriteBackground(sprite) }),
              onClick: ($event) => addSpriteToScene(sprite),
              onKeypress: [
                withKeys(withModifiers(($event) => addSpriteToScene(sprite), ["prevent", "stop"]), ["enter"]),
                withKeys(withModifiers(($event) => addSpriteToScene(sprite), ["prevent", "stop"]), ["space"])
              ]
            }, toDisplayString(sprite.label), 45, _hoisted_2$m))
          ], 64);
        }), 256)),
        createVNode(DButton, {
          class: "custom-sprite v-w100",
          icon: "publish",
          onClick: _cache[0] || (_cache[0] = ($event) => spriteUpload.value.click())
        }, {
          default: withCtx(() => [
            createTextVNode(" Upload new sprite "),
            createBaseVNode("input", {
              type: "file",
              ref_key: "spriteUpload",
              ref: spriteUpload,
              onChange: onSpriteFileUpload
            }, null, 544)
          ]),
          _: 1
        }),
        createVNode(DButton, {
          icon: "insert_link",
          onClick: uploadFromURL
        }, {
          default: withCtx(() => [
            createTextVNode(" New sprite from URL ")
          ]),
          _: 1
        }),
        createVNode(DButton, {
          icon: "extension",
          onClick: _cache[1] || (_cache[1] = ($event) => emit2("show-dialog", "type: Sprites"))
        }, {
          default: withCtx(() => [
            createTextVNode(" Search in content packs ")
          ]),
          _: 1
        }),
        showSpritesFolder.value ? (openBlock(), createBlock(DButton, {
          key: 0,
          icon: "folder",
          onClick: openSpritesFolder
        }, {
          default: withCtx(() => [
            createTextVNode(" Open sprites folder ")
          ]),
          _: 1
        })) : createCommentVNode("", true),
        createBaseVNode("input", {
          type: "file",
          ref_key: "missingSpriteUpload",
          ref: missingSpriteUpload,
          onChange: onMissingSpriteFileUpload
        }, null, 544)
      ], 64);
    };
  }
});
const sprite_vue_vue_type_style_index_0_scoped_d2e4e53f_lang = "";
const Sprites = /* @__PURE__ */ _export_sfc(_sfc_main$v, [["__scopeId", "data-v-d2e4e53f"]]);
var __async$j = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _sfc_main$u = /* @__PURE__ */ defineComponent({
  __name: "ui",
  setup(__props) {
    const store2 = useStore();
    function addTextBox() {
      return __async$j(this, null, function* () {
        return yield createUiElement("createTextBox");
      });
    }
    function addChoice() {
      return __async$j(this, null, function* () {
        return yield createUiElement("createChoice");
      });
    }
    function addDialog() {
      return __async$j(this, null, function* () {
        return yield createUiElement("createNotification");
      });
    }
    function addPoem() {
      return __async$j(this, null, function* () {
        return yield createUiElement("createPoem");
      });
    }
    function addConsole() {
      return __async$j(this, null, function* () {
        return yield createUiElement("createConsole");
      });
    }
    function createUiElement(messageName) {
      return __async$j(this, null, function* () {
        yield transaction(() => __async$j(this, null, function* () {
          yield store2.dispatch(`panels/${messageName}`, {
            panelId: store2.state.panels.currentPanel
          });
        }));
      });
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(Fragment, null, [
        createBaseVNode("button", {
          class: "v-w100",
          onClick: addTextBox
        }, "Textbox"),
        createBaseVNode("button", {
          class: "v-w100 v-bt0",
          onClick: addPoem
        }, "Poem"),
        createBaseVNode("button", {
          class: "v-w100 v-bt0",
          onClick: addDialog
        }, "Notification"),
        createBaseVNode("button", {
          class: "v-w100 v-bt0",
          onClick: addChoice
        }, "Choice"),
        createBaseVNode("button", {
          class: "v-w100 v-bt0",
          onClick: addConsole
        }, "Console")
      ], 64);
    };
  }
});
var __async$i = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _withScopeId$d = (n) => (pushScopeId("data-v-aad6f368"), n = n(), popScopeId(), n);
const _hoisted_1$o = /* @__PURE__ */ _withScopeId$d(() => /* @__PURE__ */ createBaseVNode("h1", null, "Add", -1));
const _hoisted_2$l = ["innerHTML"];
const _hoisted_3$g = ["disabled"];
const _sfc_main$t = /* @__PURE__ */ defineComponent({
  __name: "add",
  setup(__props) {
    const groups = {
      characters: {
        icon: "emoji_people",
        text: "Char&shy;acters",
        shortcut: "1"
      },
      sprites: {
        icon: "change_history",
        text: "Sprites",
        shortcut: "2"
      },
      ui: {
        icon: "view_quilt",
        text: "UI",
        shortcut: "3"
      }
    };
    const root = ref(null);
    const group = ref("characters");
    const sprites = ref(null);
    const store2 = useStore();
    const { vertical } = setupPanelMixin(root);
    const currentPanel = computed(() => {
      return store2.state.panels.panels[store2.state.panels.currentPanel];
    });
    const hasClipboardContent = computed(() => {
      return store2.state.ui.clipboard != null;
    });
    function paste() {
      transaction(() => __async$i(this, null, function* () {
        yield store2.dispatch("panels/pasteObjectFromClipboard", {
          panelId: currentPanel.value.id
        });
      }));
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "panel",
        ref_key: "root",
        ref: root,
        onDragenter: _cache[2] || (_cache[2] = (...args) => {
          var _a2, _b;
          return ((_a2 = sprites.value) == null ? void 0 : _a2.showDropTarget) && ((_b = sprites.value) == null ? void 0 : _b.showDropTarget(...args));
        }),
        onMouseleave: _cache[3] || (_cache[3] = (...args) => {
          var _a2, _b;
          return ((_a2 = sprites.value) == null ? void 0 : _a2.hideDropTarget) && ((_b = sprites.value) == null ? void 0 : _b.hideDropTarget(...args));
        })
      }, [
        _hoisted_1$o,
        createBaseVNode("div", {
          class: normalizeClass({ "group-selector": true, vertical: unref(vertical) })
        }, [
          (openBlock(), createElementBlock(Fragment, null, renderList(groups, (obj, key) => {
            return createVNode(DButton, {
              key,
              class: normalizeClass({
                active: group.value === key,
                "v-bl0": key !== "characters",
                "h-bt0": key !== "characters"
              }),
              "icon-pos": "top",
              icon: obj.icon,
              shortcut: obj.shortcut,
              onClick: ($event) => group.value = key
            }, {
              default: withCtx(() => [
                createBaseVNode("span", {
                  innerHTML: obj.text
                }, null, 8, _hoisted_2$l)
              ]),
              _: 2
            }, 1032, ["class", "icon", "shortcut", "onClick"]);
          }), 64))
        ], 2),
        createBaseVNode("div", {
          class: normalizeClass({ "item-grid": true, vertical: unref(vertical) })
        }, [
          group.value === "characters" ? (openBlock(), createBlock(Characters, {
            key: 0,
            onShowDialog: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("show-dialog", $event))
          })) : group.value === "sprites" ? (openBlock(), createBlock(Sprites, {
            key: 1,
            ref_key: "sprites",
            ref: sprites,
            onShowDialog: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("show-dialog", $event))
          }, null, 512)) : group.value === "ui" ? (openBlock(), createBlock(_sfc_main$u, { key: 2 })) : createCommentVNode("", true),
          createBaseVNode("button", {
            class: "v-w100",
            onClick: paste,
            disabled: !hasClipboardContent.value
          }, " Paste ", 8, _hoisted_3$g)
        ], 2)
      ], 544);
    };
  }
});
const add_vue_vue_type_style_index_0_scoped_aad6f368_lang = "";
const AddPanel = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["__scopeId", "data-v-aad6f368"]]);
var __defProp$5 = Object.defineProperty;
var __defProps$3 = Object.defineProperties;
var __getOwnPropDescs$3 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$5 = Object.getOwnPropertySymbols;
var __hasOwnProp$5 = Object.prototype.hasOwnProperty;
var __propIsEnum$5 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$5 = (obj, key, value) => key in obj ? __defProp$5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$5 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$5.call(b, prop))
      __defNormalProp$5(a, prop, b[prop]);
  if (__getOwnPropSymbols$5)
    for (var prop of __getOwnPropSymbols$5(b)) {
      if (__propIsEnum$5.call(b, prop))
        __defNormalProp$5(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$3 = (a, b) => __defProps$3(a, __getOwnPropDescs$3(b));
const _sfc_main$s = defineComponent({
  mixins: [VerticalScrollRedirect],
  props: {
    noWraping: {
      type: Boolean,
      default: false
    },
    direction: {
      type: String,
      default: "global"
    },
    maxSize: {},
    gap: {
      type: String,
      default: "0px"
    }
  },
  computed: {
    finalDirection() {
      if (this.direction === "global") {
        return this.$store.state.ui.vertical ? "vertical" : "horizontal";
      }
      if (this.direction === "inverted") {
        return this.$store.state.ui.vertical ? "horizontal" : "vertical";
      }
      return this.direction;
    }
  },
  render() {
    const wrapingClass = this.noWraping ? "no-wraping" : "wraping";
    const attrs = {};
    const flowContainer = h(
      "div",
      __spreadProps$3(__spreadValues$5({}, attrs), {
        class: ["d-flow", this.finalDirection, wrapingClass],
        style: {
          gap: this.gap
        }
      }),
      this.$slots.default()
    );
    if (this.maxSize !== void 0) {
      const maxSize = this.maxSize instanceof Array ? this.maxSize[this.finalDirection === "horizontal" ? 0 : 1] : this.maxSize;
      return h(
        "div",
        {
          ref: "scrollContainer",
          class: ["d-flow-scroll-container", this.finalDirection],
          style: {
            [this.finalDirection === "horizontal" ? "maxWidth" : "maxHeight"]: maxSize
          }
        },
        [flowContainer]
      );
    }
    return flowContainer;
  },
  mounted() {
    if (this.$refs.scrollContainer) {
      this.$refs.scrollContainer.addEventListener(
        "wheel",
        this.verticalScrollRedirect
      );
    }
  }
});
const dFlow_vue_vue_type_style_index_0_scoped_3912d02e_lang = "";
const DFlow = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["__scopeId", "data-v-3912d02e"]]);
let lastId = 0;
if (typeof BigInt !== "undefined") {
  lastId = BigInt(0);
}
function uniqId() {
  const id = lastId;
  lastId++;
  return id + "";
}
const _hoisted_1$n = ["for"];
const _hoisted_2$k = ["id", "x1", "x2"];
const _hoisted_3$f = ["offset"];
const _hoisted_4$e = ["fill"];
const _hoisted_5$c = ["d"];
const _hoisted_6$b = ["id", "max", "value"];
const sliderLength = 255;
const sliderOffset = 8;
const _sfc_main$r = /* @__PURE__ */ defineComponent({
  __name: "slider",
  props: {
    label: {
      type: String,
      required: true
    },
    gradientStops: {
      required: true,
      type: Array
    },
    modelValue: {
      type: Number,
      required: true
    },
    maxValue: {
      type: Number,
      required: true
    },
    shiftGradient: {
      default: false
    },
    noInput: {
      default: false
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const id = uniqId();
    const props = __props;
    const store2 = useStore();
    const emit2 = __emit;
    const vertical = computed(() => store2.state.ui.vertical);
    const svg = ref(null);
    const pointerPath = computed(() => {
      const val = props.modelValue / props.maxValue * sliderLength;
      return `M${val} 0L${val + 14} 0L${val + 7} 12Z`;
    });
    const gradientOffset = computed(() => {
      if (!props.shiftGradient)
        return 0;
      if (props.modelValue === 0)
        return 0;
      return props.modelValue / props.maxValue;
    });
    function onInput(event) {
      emit2(
        "update:modelValue",
        parseFloat(event.target.value)
      );
    }
    const dragActive = ref(false);
    function startDrag(event) {
      dragActive.value = true;
      moveDrag(event);
      if (event instanceof MouseEvent) {
        window.addEventListener("mousemove", moveDrag);
        window.addEventListener("mouseup", endDrag);
      }
      event.preventDefault();
    }
    function moveDrag(event) {
      if (!dragActive.value)
        return;
      const svgE = svg.value;
      if (event instanceof MouseEvent && event.buttons === 0) {
        endDrag();
        return;
      }
      event.preventDefault();
      const bounding = svgE.getBoundingClientRect();
      const scale2 = bounding.width / (sliderOffset + sliderLength + sliderOffset);
      const x = (event instanceof MouseEvent ? event.clientX : event.touches[0].clientX) - bounding.x;
      const scaledX = x / scale2;
      const value = Math.max(Math.min(scaledX - sliderOffset, sliderLength), 0) / sliderLength * props.maxValue;
      emit2("update:modelValue", value);
      event.preventDefault();
    }
    function endDrag() {
      dragActive.value = false;
      window.removeEventListener("mousemove", moveDrag);
      window.removeEventListener("mouseup", endDrag);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass({ slider: true, vertical: vertical.value }),
        onKeydown: _cache[1] || (_cache[1] = withModifiers(() => {
        }, ["stop"]))
      }, [
        !__props.noInput ? (openBlock(), createElementBlock("label", {
          key: 0,
          for: unref(id)
        }, toDisplayString(__props.label), 9, _hoisted_1$n)) : createCommentVNode("", true),
        createBaseVNode("div", null, [
          (openBlock(), createElementBlock("svg", {
            ref_key: "svg",
            ref: svg,
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 271 24",
            onMousedown: startDrag,
            onTouchstart: startDrag,
            onTouchmove: moveDrag,
            onTouchend: endDrag
          }, [
            createBaseVNode("defs", null, [
              createBaseVNode("linearGradient", {
                id: `gradient${unref(id)}`,
                x1: gradientOffset.value * 100 + "%",
                y1: "0%",
                x2: (gradientOffset.value + 1) * 100 + "%",
                y2: "0%",
                spreadMethod: "repeat"
              }, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(__props.gradientStops, (color2, idx) => {
                  return openBlock(), createElementBlock("stop", {
                    key: idx,
                    offset: idx / (__props.gradientStops.length - 1) * 100 + "%",
                    style: normalizeStyle$1("stop-color:" + color2)
                  }, null, 12, _hoisted_3$f);
                }), 128))
              ], 8, _hoisted_2$k)
            ]),
            createBaseVNode("g", null, [
              createBaseVNode("path", {
                d: "M7 0H262V24H7z",
                "stroke-width": "2",
                "paint-order": "fill stroke markers",
                fill: `url(#gradient${unref(id)})`
              }, null, 8, _hoisted_4$e),
              createBaseVNode("path", {
                d: pointerPath.value,
                "stroke-width": "2",
                class: "slider-pointer"
              }, null, 8, _hoisted_5$c)
            ])
          ], 544))
        ]),
        !__props.noInput ? (openBlock(), createElementBlock("input", {
          key: 1,
          id: unref(id),
          class: "sliderInput",
          min: "0",
          max: __props.maxValue,
          value: __props.modelValue,
          type: "number",
          onInput,
          onKeydown: _cache[0] || (_cache[0] = withModifiers(() => {
          }, ["stop"]))
        }, null, 40, _hoisted_6$b)) : createCommentVNode("", true)
      ], 34);
    };
  }
});
const slider_vue_vue_type_style_index_0_scoped_81831f96_lang = "";
const Slider = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["__scopeId", "data-v-81831f96"]]);
const _sfc_main$q = /* @__PURE__ */ defineComponent({
  __name: "slider-group",
  props: {
    modelValue: {
      type: String,
      validator: (val) => !!val.match(/^#[0-9a-f]{6,8}$/i)
    },
    mode: {
      type: String
    },
    relative: Boolean
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const emit2 = __emit;
    const props = __props;
    const lastRGBEmit = ref(null);
    const v1 = ref(0);
    const v2 = ref(0);
    const v3 = ref(0);
    const a = ref(0);
    const slider1 = stop({
      rgba: {
        label: "Red",
        stops() {
          const g = props.relative ? v2.value : 0;
          const b = props.relative ? v3.value : 0;
          return [new RGBAColor(0, g, b, 1), new RGBAColor(255, g, b, 1)];
        }
      },
      hsla: {
        label: "Hue",
        max: 360,
        stops() {
          const s = props.relative ? v2.value / 100 : 1;
          const l = props.relative ? v3.value / 100 : 0.5;
          return eightsStops((i) => new HSLAColor(i, s, l, 1));
        }
      }
    });
    const slider2 = stop({
      rgba: {
        label: "Green",
        stops() {
          const r = props.relative ? v1.value : 0;
          const b = props.relative ? v3.value : 0;
          return [new RGBAColor(r, 0, b, 1), new RGBAColor(r, 255, b, 1)];
        }
      },
      hsla: {
        label: "Saturation",
        stops() {
          const h2 = props.relative ? v1.value / 360 : 0;
          const l = props.relative ? v3.value / 100 : 0.5;
          return eightsStops((i) => new HSLAColor(h2, i, l, 1));
        }
      }
    });
    const slider3 = stop({
      rgba: {
        label: "Blue",
        stops() {
          const r = props.relative ? v1.value : 0;
          const g = props.relative ? v2.value : 0;
          return [new RGBAColor(r, g, 0, 1), new RGBAColor(r, g, 255, 1)];
        }
      },
      hsla: {
        label: "Luminosity",
        stops() {
          const h2 = props.relative ? v1.value / 360 : 0;
          const s = props.relative ? v2.value / 100 : 0.5;
          return eightsStops((i) => new HSLAColor(h2, s, i, 1));
        }
      }
    });
    const stopsAlpha = computed(() => {
      const color2 = RGBAColor.fromHex(props.modelValue);
      return [
        new RGBAColor(color2.r, color2.g, color2.b, 0).toCss(),
        new RGBAColor(color2.r, color2.g, color2.b, 1).toCss()
      ];
    });
    function valueChanged() {
      if (props.modelValue === lastRGBEmit.value)
        return;
      initValues();
    }
    function updateValue() {
      let newColor;
      if (props.mode === "rgba") {
        newColor = new RGBAColor(v1.value, v2.value, v3.value, a.value / 255);
      } else {
        newColor = new HSLAColor(
          v1.value / 360,
          v2.value / 100,
          v3.value / 100,
          a.value / 255
        );
      }
      const rgbColor = newColor.toRgb().toHex();
      if (lastRGBEmit.value === rgbColor)
        return;
      if (rgbColor.length !== 9) {
        throw new Error(`Invalid color code: ${rgbColor}`);
      }
      lastRGBEmit.value = rgbColor;
      emit2("update:modelValue", rgbColor);
    }
    function initValues() {
      const color2 = RGBAColor.fromHex(props.modelValue);
      lastRGBEmit.value = color2.toHex();
      a.value = color2.a * 255;
      if (props.mode === "hsla") {
        const hslColor = color2.toHSL();
        v1.value = hslColor.h * 360;
        v2.value = hslColor.s * 100;
        v3.value = hslColor.l * 100;
      } else {
        v1.value = color2.r;
        v2.value = color2.g;
        v3.value = color2.b;
      }
    }
    function eightsStops(gen) {
      const stops = [];
      for (let i = 0; i <= 8; ++i) {
        stops.push(gen(i / 8));
      }
      return stops;
    }
    watch(() => props.modelValue, valueChanged);
    watch(() => props.mode, initValues, { immediate: true });
    watch(() => [v1.value, v2.value, v3.value, a.value], updateValue);
    function stop({ rgba, hsla }) {
      const maxValue = computed(
        () => {
          var _a2;
          return props.mode === "rgba" ? 255 : (_a2 = hsla.max) != null ? _a2 : 100;
        }
      );
      const label = computed(
        () => props.mode === "rgba" ? rgba.label : hsla.label
      );
      const stops = computed(() => {
        const stops2 = props.mode === "rgba" ? rgba.stops() : hsla.stops();
        return stops2.map((stop2) => stop2.toRgb().toCss());
      });
      return { maxValue, label, stops };
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        createVNode(Slider, {
          label: unref(slider1).label.value,
          modelValue: v1.value,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => v1.value = $event),
          "max-value": unref(slider1).maxValue.value,
          "gradient-stops": unref(slider1).stops.value
        }, null, 8, ["label", "modelValue", "max-value", "gradient-stops"]),
        createVNode(Slider, {
          label: unref(slider2).label.value,
          modelValue: v2.value,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => v2.value = $event),
          "max-value": unref(slider2).maxValue.value,
          "gradient-stops": unref(slider2).stops.value
        }, null, 8, ["label", "modelValue", "max-value", "gradient-stops"]),
        createVNode(Slider, {
          label: unref(slider3).label.value,
          modelValue: v3.value,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => v3.value = $event),
          "max-value": unref(slider3).maxValue.value,
          "gradient-stops": unref(slider3).stops.value
        }, null, 8, ["label", "modelValue", "max-value", "gradient-stops"]),
        createVNode(Slider, {
          label: "Alpha",
          modelValue: a.value,
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => a.value = $event),
          "max-value": 255,
          "gradient-stops": stopsAlpha.value
        }, null, 8, ["modelValue", "gradient-stops"])
      ]);
    };
  }
});
const sliderGroup_vue_vue_type_style_index_0_scoped_d66257ab_lang = "";
const SliderGroup = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["__scopeId", "data-v-d66257ab"]]);
var __defProp$4 = Object.defineProperty;
var __defProps$2 = Object.defineProperties;
var __getOwnPropDescs$2 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$4 = Object.getOwnPropertySymbols;
var __hasOwnProp$4 = Object.prototype.hasOwnProperty;
var __propIsEnum$4 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$4 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$4.call(b, prop))
      __defNormalProp$4(a, prop, b[prop]);
  if (__getOwnPropSymbols$4)
    for (var prop of __getOwnPropSymbols$4(b)) {
      if (__propIsEnum$4.call(b, prop))
        __defNormalProp$4(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$2 = (a, b) => __defProps$2(a, __getOwnPropDescs$2(b));
var __async$h = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _hoisted_1$m = { class: "v-w100 h-h100" };
const _hoisted_2$j = { class: "hex-selector" };
const _hoisted_3$e = ["for"];
const _hoisted_4$d = ["id", "value"];
const _hoisted_5$b = ["title", "onClick"];
const generatedPackId = "dddg.generated.colors";
const _sfc_main$p = /* @__PURE__ */ defineComponent(__spreadProps$2(__spreadValues$4({}, { inheritAttrs: false }), {
  __name: "color",
  props: {
    modelValue: {
      required: true,
      type: String
    },
    title: { default: "" },
    format: {
      type: String,
      default: "hex"
    }
  },
  emits: ["leave", "update:modelValue"],
  setup(__props, { emit: __emit }) {
    const id = uniqId();
    const store2 = useStore();
    const emit2 = __emit;
    const props = __props;
    const mode = ref("hsla");
    const vertical = computed(() => store2.state.ui.vertical);
    const color2 = computed({
      get() {
        if (props.format === "rgb") {
          const rgb = RGBAColor.fromCss(props.modelValue);
          return rgb.toHex();
        } else {
          return props.modelValue;
        }
      },
      set(newColor) {
        if (props.format === "rgb") {
          const rgb = RGBAColor.fromCss(newColor);
          emit2("update:modelValue", rgb.toCss());
        } else {
          emit2("update:modelValue", newColor);
        }
      }
    });
    function updateHex(event) {
      const hex = event.target.value;
      if (RGBAColor.validHex(hex) && (hex.length === 7 || hex.length === 9)) {
        color2.value = hex;
      }
    }
    const swatches = computed(() => store2.state.content.current.colors);
    function addSwatch() {
      if (swatches.value.find((swatch) => swatch.color === color2.value))
        return;
      const existingPack = store2.state.content.contentPacks.find(
        (pack) => pack.packId === generatedPackId
      ) || {
        packId: generatedPackId,
        packCredits: [""],
        dependencies: [],
        characters: [],
        fonts: [],
        backgrounds: [],
        sprites: [],
        poemStyles: [],
        poemBackgrounds: [],
        colors: []
      };
      const newPack = __spreadProps$2(__spreadValues$4({}, existingPack), {
        colors: [
          ...existingPack.colors,
          {
            label: color2.value,
            color: color2.value
          }
        ]
      });
      transaction(() => __async$h(this, null, function* () {
        yield store2.dispatch("content/replaceContentPack", {
          contentPack: newPack,
          processed: true
        });
      }));
    }
    function pickColor() {
      transaction(() => {
        store2.commit("ui/setColorPicker", true);
      });
    }
    function settingColor(ev) {
      color2.value = RGBAColor.fromCss(ev.color).toHex();
    }
    onMounted(() => {
      eventBus$1.subscribe(ColorPickedEvent, settingColor);
    });
    onUnmounted(() => {
      eventBus$1.unsubscribe(ColorPickedEvent, settingColor);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass([{ color: true, vertical: vertical.value }, "v-w100 h-h100"])
      }, [
        createBaseVNode("h2", null, toDisplayString(__props.title), 1),
        createBaseVNode("button", {
          onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("leave"))
        }, "OK"),
        createBaseVNode("table", null, [
          createBaseVNode("tr", null, [
            createBaseVNode("td", null, [
              createBaseVNode("button", {
                onClick: _cache[1] || (_cache[1] = ($event) => mode.value = "hsla")
              }, "HSLA")
            ]),
            createBaseVNode("td", null, [
              createBaseVNode("button", {
                onClick: _cache[2] || (_cache[2] = ($event) => mode.value = "rgba")
              }, "RGBA")
            ])
          ])
        ]),
        createBaseVNode("div", _hoisted_1$m, [
          createVNode(SliderGroup, {
            mode: mode.value,
            modelValue: color2.value,
            "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => color2.value = $event),
            relative: true
          }, null, 8, ["mode", "modelValue"]),
          createBaseVNode("div", _hoisted_2$j, [
            createBaseVNode("label", {
              class: "hex-label",
              for: `hex_${unref(id)}`
            }, "Hex", 8, _hoisted_3$e),
            createBaseVNode("input", {
              id: `hex_${unref(id)}`,
              value: color2.value,
              onInput: updateHex,
              onKeydown: _cache[4] || (_cache[4] = withModifiers(() => {
              }, ["stop"]))
            }, null, 40, _hoisted_4$d)
          ]),
          createVNode(DFlow, {
            direction: "global",
            class: "color-tools"
          }, {
            default: withCtx(() => [
              createBaseVNode("button", { onClick: addSwatch }, "Add as swatch"),
              createVNode(DButton, {
                class: "h-bl0 v-bt0",
                icon: "colorize",
                onClick: pickColor
              }, {
                default: withCtx(() => [
                  createTextVNode("Pick color")
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        createBaseVNode("div", {
          id: "color-swatches",
          class: normalizeClass({ vertical: vertical.value })
        }, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(swatches.value, (swatch) => {
            return openBlock(), createElementBlock("button", {
              class: "swatch",
              key: swatch.color,
              style: normalizeStyle$1({ backgroundColor: swatch.color }),
              title: swatch.label,
              onClick: ($event) => {
                color2.value = swatch.color;
                emit2("leave");
              }
            }, null, 12, _hoisted_5$b);
          }), 128))
        ], 2)
      ], 2);
    };
  }
}));
const color_vue_vue_type_style_index_0_scoped_c1f9b924_lang = "";
const Color = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["__scopeId", "data-v-c1f9b924"]]);
const _hoisted_1$l = { class: "fieldset_wrapper" };
const _hoisted_2$i = { key: 0 };
const _hoisted_3$d = { class: "fieldset_contents" };
const _sfc_main$o = /* @__PURE__ */ defineComponent({
  __name: "d-fieldset",
  props: {
    title: {
      required: true,
      type: String
    }
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$l, [
        createBaseVNode("fieldset", null, [
          __props.title > "" ? (openBlock(), createElementBlock("legend", _hoisted_2$i, toDisplayString(props.title), 1)) : createCommentVNode("", true),
          createBaseVNode("div", _hoisted_3$d, [
            renderSlot(_ctx.$slots, "default", {}, void 0, true)
          ])
        ])
      ]);
    };
  }
});
const dFieldset_vue_vue_type_style_index_0_scoped_60e241fa_lang = "";
const DFieldset = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["__scopeId", "data-v-60e241fa"]]);
const _hoisted_1$k = ["href"];
const _sfc_main$n = /* @__PURE__ */ defineComponent({
  __name: "link",
  props: {
    to: {
      type: String,
      required: true
    }
  },
  setup(__props) {
    const root = ref(null);
    const props = __props;
    const href = computed(() => {
      let to = props.to;
      to = to.replace(
        /^github:\/\//,
        "https://github.com/edave64/Doki-Doki-Dialog-Generator/"
      );
      to = to.replace(/^wiki:\/\/(.*)/, (_, page) => {
        return "https://github.com/edave64/Doki-Doki-Dialog-Generator/wiki/Version-2:-" + page.replaceAll(" ", "-");
      });
      return to;
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("a", {
        target: "_blank",
        rel: "noopener noreferrer",
        ref_key: "root",
        ref: root,
        href: href.value
      }, [
        renderSlot(_ctx.$slots, "default")
      ], 8, _hoisted_1$k);
    };
  }
});
var __defProp$3 = Object.defineProperty;
var __getOwnPropSymbols$3 = Object.getOwnPropertySymbols;
var __hasOwnProp$3 = Object.prototype.hasOwnProperty;
var __propIsEnum$3 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$3 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$3.call(b, prop))
      __defNormalProp$3(a, prop, b[prop]);
  if (__getOwnPropSymbols$3)
    for (var prop of __getOwnPropSymbols$3(b)) {
      if (__propIsEnum$3.call(b, prop))
        __defNormalProp$3(a, prop, b[prop]);
    }
  return a;
};
var __async$g = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _withScopeId$c = (n) => (pushScopeId("data-v-3d98ba0e"), n = n(), popScopeId(), n);
const _hoisted_1$j = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("h2", null, "Image options", -1));
const _hoisted_2$h = { class: "column ok-col" };
const _hoisted_3$c = {
  key: 0,
  class: "column"
};
const _hoisted_4$c = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("label", { for: "compositionSelect" }, "Compositing Mode:", -1));
const _hoisted_5$a = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "source-over" }, "Normal", -1));
const _hoisted_6$a = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "source-atop" }, "source-atop", -1));
const _hoisted_7$a = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "destination-over" }, "destination-over", -1));
const _hoisted_8$9 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "destination-in" }, "destination-in", -1));
const _hoisted_9$9 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "destination-in" }, "destination-out", -1));
const _hoisted_10$8 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "destination-in" }, "destination-atop", -1));
const _hoisted_11$7 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "lighter" }, "lighter", -1));
const _hoisted_12$7 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "xor" }, "xor", -1));
const _hoisted_13$7 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "multiply" }, "multiply", -1));
const _hoisted_14$6 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "screen" }, "screen", -1));
const _hoisted_15$5 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "overlay" }, "overlay", -1));
const _hoisted_16$5 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "darken" }, "darken", -1));
const _hoisted_17$5 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "lighten" }, "lighten", -1));
const _hoisted_18$5 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "color-dodge" }, "color-dodge", -1));
const _hoisted_19$2 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "color-burn" }, "color-burn", -1));
const _hoisted_20$3 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "hard-light" }, "hard-light", -1));
const _hoisted_21$2 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "soft-light" }, "soft-light", -1));
const _hoisted_22$1 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "difference" }, "difference", -1));
const _hoisted_23$1 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "exclusion" }, "exclusion", -1));
const _hoisted_24$1 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "hue" }, "hue", -1));
const _hoisted_25$1 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "saturation" }, "saturation", -1));
const _hoisted_26$1 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "color" }, "color", -1));
const _hoisted_27$1 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("option", { value: "luminosity" }, "luminosity", -1));
const _hoisted_28$1 = [
  _hoisted_5$a,
  _hoisted_6$a,
  _hoisted_7$a,
  _hoisted_8$9,
  _hoisted_9$9,
  _hoisted_10$8,
  _hoisted_11$7,
  _hoisted_12$7,
  _hoisted_13$7,
  _hoisted_14$6,
  _hoisted_15$5,
  _hoisted_16$5,
  _hoisted_17$5,
  _hoisted_18$5,
  _hoisted_19$2,
  _hoisted_20$3,
  _hoisted_21$2,
  _hoisted_22$1,
  _hoisted_23$1,
  _hoisted_24$1,
  _hoisted_25$1,
  _hoisted_26$1,
  _hoisted_27$1
];
const _hoisted_29 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("label", { for: "addEffect" }, "Add new effect", -1));
const _hoisted_30 = ["value"];
const _hoisted_31 = ["disabled"];
const _hoisted_32 = ["disabled"];
const _hoisted_33 = ["disabled"];
const _hoisted_34 = ["disabled"];
const _hoisted_35 = ["onClick", "onKeydown"];
const _hoisted_36 = {
  key: 0,
  class: "value-input-table"
};
const _hoisted_37 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "shadow_color" }, "Color:")
], -1));
const _hoisted_38 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "filter_x" }, "X:")
], -1));
const _hoisted_39 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "filter_y" }, "Y:")
], -1));
const _hoisted_40 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "filter_blur" }, "Blur:")
], -1));
const _hoisted_41 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "filter_value" }, "Value:")
], -1));
const _hoisted_42 = ["value", "max", "min"];
const _hoisted_43 = { key: 0 };
const _hoisted_44 = { colspan: "2" };
const _hoisted_45 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "filter_value" }, "Value:")
], -1));
const _hoisted_46 = ["value", "max", "min"];
const _hoisted_47 = { key: 0 };
const _hoisted_48 = { colspan: "2" };
const _sfc_main$m = /* @__PURE__ */ defineComponent({
  __name: "image-options",
  props: {
    type: {
      type: String,
      required: true
    },
    title: {
      type: String
    },
    id: {},
    panelId: {
      required: true
    },
    noComposition: {
      type: Boolean,
      default: false
    }
  },
  emits: ["leave"],
  setup(__props, { emit: __emit }) {
    const filterText = /* @__PURE__ */ new Map([
      ["blur", "Blur"],
      ["brightness", "Brightness"],
      ["contrast", "Contrast"],
      ["grayscale", "Grayscale"],
      ["hue-rotate", "Rotate hue"],
      ["invert", "Invert colors"],
      ["opacity", "Opacity"],
      ["saturate", "Saturate"],
      ["sepia", "Sepia"],
      ["drop-shadow", "Drop shadow"]
    ]);
    const filterTypes = (() => {
      try {
        const canvas = makeCanvas();
        canvas.width = 0;
        canvas.height = 0;
        const context = canvas.getContext("2d");
        const hasFilter = "filter" in context;
        disposeCanvas(canvas);
        if (hasFilter) {
          return Array.from(filterText.keys()).sort();
        }
      } catch (e) {
      }
      return ["opacity"];
    })();
    const props = __props;
    const store2 = useStore();
    const addEffectSelection = ref("");
    const currentFilterIdx = ref(0);
    const object = computed(() => {
      switch (props.type) {
        case "object":
          return store2.state.panels.panels[props.panelId].objects[props.id];
        case "background":
          return store2.state.panels.panels[props.panelId].background;
        case "panel":
          return store2.state.panels.panels[props.panelId];
        default:
          throw new dist.UnreachableCaseError(props.type);
      }
    });
    const compositionMode = computed({
      get() {
        return object.value.composite;
      },
      set(composite) {
        transaction(() => {
          switch (props.type) {
            case "object":
              store2.commit("panels/setComposition", {
                id: props.id,
                panelId: props.panelId,
                composite
              });
              break;
            case "background":
              break;
            case "panel":
              break;
            default:
              throw new dist.UnreachableCaseError(props.type);
          }
        });
      }
    });
    const filters = computed(() => object.value.filters);
    const currentFilter = computed(
      () => {
        var _a2;
        return (_a2 = filters.value[currentFilterIdx.value]) != null ? _a2 : null;
      }
    );
    const isPercentFilter = computed(() => {
      const filter = currentFilter.value;
      if (!filter)
        return false;
      return percentageValue.has(filter.type);
    });
    const maxValue = computed(() => {
      const filter = currentFilter.value;
      if (!filter)
        return void 0;
      if (filter.type === "hue-rotate")
        return 360;
      if (filter.type === "grayscale" || filter.type === "sepia" || filter.type === "opacity" || filter.type === "invert")
        return 100;
      return void 0;
    });
    const minValue = computed(() => {
      const filter = currentFilter.value;
      if (!filter)
        return void 0;
      switch (filter.type) {
        case "blur":
        case "brightness":
        case "contrast":
        case "grayscale":
        case "hue-rotate":
        case "invert":
        case "opacity":
        case "saturate":
        case "sepia":
          return 0;
      }
      return void 0;
    });
    function getFilterLabel(type) {
      return filterText.get(type);
    }
    function getFilterText(filter) {
      if (percentageValue.has(filter.type)) {
        return `${filterText.get(filter.type)} ${(filter.value * 100).toFixed()}%`;
      } else if (filter.type === "hue-rotate") {
        return `${filterText.get(filter.type)} ${filter.value.toFixed()}\xB0`;
      } else if (filter.type === "blur") {
        return `${filterText.get(filter.type)} ${filter.value.toFixed()}px`;
      }
      return filterText.get(filter.type);
    }
    function objectTypeScope(command) {
      switch (props.type) {
        case "object":
          return "panels/object_" + command;
        case "background":
          return "panels/background" + command[0].toUpperCase() + command.slice(1);
        case "panel":
          return "panels/" + command;
      }
    }
    function addFilter2() {
      transaction(() => __async$g(this, null, function* () {
        yield store2.dispatch(objectTypeScope("addFilter"), {
          id: props.id,
          panelId: props.panelId,
          type: addEffectSelection.value,
          idx: currentFilterIdx.value + 1
        });
        return;
      }));
    }
    function selectFilter(idx) {
      currentFilterIdx.value = idx;
    }
    function removeFilter2() {
      transaction(() => __async$g(this, null, function* () {
        yield store2.dispatch(objectTypeScope("removeFilter"), {
          id: props.id,
          panelId: props.panelId,
          idx: currentFilterIdx.value
        });
        if (currentFilterIdx.value >= object.value.filters.length) {
          currentFilterIdx.value = object.value.filters.length - 1;
        }
        return;
      }));
    }
    function moveFilter2(moveBy) {
      transaction(() => __async$g(this, null, function* () {
        yield store2.dispatch(objectTypeScope("moveFilter"), {
          id: props.id,
          panelId: props.panelId,
          idx: currentFilterIdx.value,
          moveBy
        });
        currentFilterIdx.value += moveBy;
        return;
      }));
    }
    function updateValue(event) {
      if (!(event instanceof InputEvent))
        return;
      let value = Number(event.target.value);
      if (isPercentFilter.value) {
        value = value / 100;
      }
      setFilterProperty({ value });
    }
    function setFilterProperty(value) {
      transaction(() => __async$g(this, null, function* () {
        yield store2.dispatch(objectTypeScope("setFilter"), __spreadValues$3({
          id: props.id,
          panelId: props.panelId,
          idx: currentFilterIdx.value
        }, value));
      }));
    }
    const hueStops = computed(() => {
      const stops = eightsStops((i) => new HSLAColor(i, 1, 0.5, 1));
      return stops.map((stop) => stop.toRgb().toCss());
    });
    function eightsStops(gen) {
      const stops = [];
      for (let i = 0; i <= 8; ++i) {
        stops.push(gen(i / 8));
      }
      return stops;
    }
    const showShadowColor = ref(false);
    const shadowColor = shadowProp("color");
    const shadowX = shadowProp("offsetX");
    const shadowY = shadowProp("offsetY");
    const shadowBlur = shadowProp("blurRadius");
    function shadowProp(prop) {
      return computed({
        get() {
          const filter = currentFilter.value;
          if (!filter || !(prop in filter))
            throw new Error("Tried reading shadow prop on a non shadow object");
          return filter[prop];
        },
        set(value) {
          setFilterProperty({ [prop]: value });
        }
      });
    }
    return (_ctx, _cache) => {
      return showShadowColor.value ? (openBlock(), createBlock(Color, {
        key: 0,
        modelValue: unref(shadowColor),
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(shadowColor) ? shadowColor.value = $event : null),
        format: "rgb",
        onLeave: _cache[1] || (_cache[1] = ($event) => showShadowColor.value = false)
      }, null, 8, ["modelValue"])) : (openBlock(), createBlock(DFlow, {
        key: 1,
        "no-wraping": "",
        class: "image-options-subpanel"
      }, {
        default: withCtx(() => [
          _hoisted_1$j,
          createBaseVNode("div", _hoisted_2$h, [
            createBaseVNode("button", {
              onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("leave"))
            }, "Back")
          ]),
          !__props.noComposition ? (openBlock(), createElementBlock("div", _hoisted_3$c, [
            _hoisted_4$c,
            createVNode(_sfc_main$n, { to: "https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation#Types" }, {
              default: withCtx(() => [
                createTextVNode("[?] ")
              ]),
              _: 1
            }),
            withDirectives(createBaseVNode("select", {
              id: "compositionSelect",
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => compositionMode.value = $event),
              onKeydown: _cache[4] || (_cache[4] = withModifiers(() => {
              }, ["stop"]))
            }, _hoisted_28$1, 544), [
              [vModelSelect, compositionMode.value]
            ])
          ])) : createCommentVNode("", true),
          createVNode(DFieldset, {
            class: "column",
            title: "Effects",
            style: { "overflow": "hidden" }
          }, {
            default: withCtx(() => [
              createVNode(DFlow, {
                class: "filter-flow",
                "no-wraping": "",
                gap: "8px"
              }, {
                default: withCtx(() => [
                  createVNode(DFlow, {
                    direction: "vertical",
                    "no-wraping": ""
                  }, {
                    default: withCtx(() => [
                      _hoisted_29,
                      withDirectives(createBaseVNode("select", {
                        id: "addEffect",
                        "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => addEffectSelection.value = $event),
                        onKeydown: _cache[6] || (_cache[6] = withModifiers(() => {
                        }, ["stop"]))
                      }, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(unref(filterTypes), (filterType) => {
                          return openBlock(), createElementBlock("option", {
                            key: filterType,
                            value: filterType
                          }, toDisplayString(getFilterLabel(filterType)), 9, _hoisted_30);
                        }), 128))
                      ], 544), [
                        [vModelSelect, addEffectSelection.value]
                      ]),
                      createBaseVNode("button", {
                        disabled: addEffectSelection.value === "",
                        onClick: addFilter2,
                        onKeydown: _cache[7] || (_cache[7] = withModifiers(() => {
                        }, ["stop"]))
                      }, " Add ", 40, _hoisted_31),
                      createBaseVNode("button", {
                        disabled: !currentFilter.value,
                        onClick: removeFilter2,
                        onKeydown: _cache[8] || (_cache[8] = withModifiers(() => {
                        }, ["stop"]))
                      }, " Remove ", 40, _hoisted_32),
                      createBaseVNode("button", {
                        disabled: currentFilterIdx.value === 0,
                        onClick: _cache[9] || (_cache[9] = ($event) => moveFilter2(-1)),
                        onKeydown: _cache[10] || (_cache[10] = withModifiers(() => {
                        }, ["stop"]))
                      }, " Move up ", 40, _hoisted_33),
                      createBaseVNode("button", {
                        disabled: currentFilterIdx.value === filters.value.length - 1 || filters.value.length === 0,
                        onClick: _cache[11] || (_cache[11] = ($event) => moveFilter2(1)),
                        onKeydown: _cache[12] || (_cache[12] = withModifiers(() => {
                        }, ["stop"]))
                      }, " Move down ", 40, _hoisted_34)
                    ]),
                    _: 1
                  }),
                  createVNode(DFlow, {
                    maxSize: "100%",
                    direction: "vertical",
                    "no-wraping": ""
                  }, {
                    default: withCtx(() => [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(filters.value, (filter, filterIdx) => {
                        return openBlock(), createElementBlock("div", {
                          key: filterIdx,
                          class: normalizeClass({ choiceBtn: true, active: filterIdx === currentFilterIdx.value }),
                          tabindex: "0",
                          onClick: ($event) => selectFilter(filterIdx),
                          onKeydown: [
                            withKeys(($event) => selectFilter(filterIdx), ["enter"]),
                            withKeys(withModifiers(($event) => selectFilter(filterIdx), ["prevent"]), ["space"])
                          ]
                        }, toDisplayString(getFilterText(filter)), 43, _hoisted_35);
                      }), 128))
                    ]),
                    _: 1
                  }),
                  currentFilter.value ? (openBlock(), createElementBlock("table", _hoisted_36, [
                    currentFilter.value.type === "drop-shadow" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                      createBaseVNode("tr", null, [
                        _hoisted_37,
                        createBaseVNode("td", null, [
                          createBaseVNode("button", {
                            id: "shadow_color",
                            class: "color-button",
                            style: normalizeStyle$1({ background: unref(shadowColor) }),
                            onClick: _cache[13] || (_cache[13] = ($event) => showShadowColor.value = true)
                          }, " \xA0 ", 4)
                        ])
                      ]),
                      createBaseVNode("tr", null, [
                        _hoisted_38,
                        createBaseVNode("td", null, [
                          withDirectives(createBaseVNode("input", {
                            id: "filter_x",
                            type: "number",
                            "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => isRef(shadowX) ? shadowX.value = $event : null),
                            onKeydown: _cache[15] || (_cache[15] = withModifiers(() => {
                            }, ["stop"]))
                          }, null, 544), [
                            [
                              vModelText,
                              unref(shadowX),
                              void 0,
                              { number: true }
                            ]
                          ])
                        ])
                      ]),
                      createBaseVNode("tr", null, [
                        _hoisted_39,
                        createBaseVNode("td", null, [
                          withDirectives(createBaseVNode("input", {
                            id: "filter_y",
                            type: "number",
                            "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => isRef(shadowY) ? shadowY.value = $event : null),
                            onKeydown: _cache[17] || (_cache[17] = withModifiers(() => {
                            }, ["stop"]))
                          }, null, 544), [
                            [
                              vModelText,
                              unref(shadowY),
                              void 0,
                              { number: true }
                            ]
                          ])
                        ])
                      ]),
                      createBaseVNode("tr", null, [
                        _hoisted_40,
                        createBaseVNode("td", null, [
                          withDirectives(createBaseVNode("input", {
                            id: "filter_blur",
                            type: "number",
                            "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => isRef(shadowBlur) ? shadowBlur.value = $event : null),
                            onKeydown: _cache[19] || (_cache[19] = withModifiers(() => {
                            }, ["stop"]))
                          }, null, 544), [
                            [
                              vModelText,
                              unref(shadowBlur),
                              void 0,
                              { number: true }
                            ]
                          ])
                        ])
                      ])
                    ], 64)) : isPercentFilter.value ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                      createBaseVNode("tr", null, [
                        _hoisted_41,
                        createBaseVNode("td", null, [
                          createBaseVNode("input", {
                            id: "filter_value",
                            value: (currentFilter.value.value * 100).toFixed(),
                            type: "number",
                            max: maxValue.value,
                            min: minValue.value,
                            onInput: updateValue,
                            onKeydown: _cache[20] || (_cache[20] = withModifiers(() => {
                            }, ["stop"]))
                          }, null, 40, _hoisted_42),
                          createTextVNode("% ")
                        ])
                      ]),
                      minValue.value === 0 && maxValue.value !== void 0 ? (openBlock(), createElementBlock("tr", _hoisted_43, [
                        createBaseVNode("td", _hoisted_44, [
                          createVNode(Slider, {
                            gradientStops: ["#000000", "#ffffff"],
                            label: "",
                            maxValue: maxValue.value,
                            modelValue: currentFilter.value.value * 100,
                            "no-input": "",
                            "onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => setFilterProperty({ value: Math.round($event) / 100 }))
                          }, null, 8, ["maxValue", "modelValue"])
                        ])
                      ])) : createCommentVNode("", true)
                    ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 2 }, [
                      createBaseVNode("tr", null, [
                        _hoisted_45,
                        createBaseVNode("td", null, [
                          createBaseVNode("input", {
                            id: "filter_value",
                            value: currentFilter.value.value,
                            type: "number",
                            max: maxValue.value,
                            min: minValue.value,
                            onInput: updateValue,
                            onKeydown: _cache[22] || (_cache[22] = withModifiers(() => {
                            }, ["stop"]))
                          }, null, 40, _hoisted_46)
                        ])
                      ]),
                      minValue.value === 0 && maxValue.value !== void 0 ? (openBlock(), createElementBlock("tr", _hoisted_47, [
                        createBaseVNode("td", _hoisted_48, [
                          createVNode(Slider, {
                            gradientStops: hueStops.value,
                            label: "",
                            maxValue: maxValue.value,
                            modelValue: currentFilter.value.value,
                            "no-input": "",
                            "onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => setFilterProperty({ value: Math.round($event) }))
                          }, null, 8, ["gradientStops", "maxValue", "modelValue"]),
                          createVNode(Slider, {
                            gradientStops: hueStops.value,
                            label: "",
                            maxValue: maxValue.value,
                            modelValue: currentFilter.value.value,
                            "shift-gradient": "",
                            "no-input": "",
                            disabled: ""
                          }, null, 8, ["gradientStops", "maxValue", "modelValue"])
                        ])
                      ])) : createCommentVNode("", true)
                    ], 64))
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }));
    };
  }
});
const imageOptions_vue_vue_type_style_index_0_scoped_3d98ba0e_lang = "";
const ImageOptions = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["__scopeId", "data-v-3d98ba0e"]]);
var __async$f = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _hoisted_1$i = ["title"];
const _hoisted_2$g = ["title"];
const _sfc_main$l = /* @__PURE__ */ defineComponent({
  __name: "button",
  props: {
    backgroundId: {
      type: String,
      required: true
    }
  },
  setup(__props) {
    const store2 = useStore();
    const props = __props;
    const background = computed(() => {
      const currentPanel = store2.state.panels.currentPanel;
      return store2.state.panels.panels[currentPanel].background;
    });
    const missingBackgroundUpload = ref(null);
    const missing = computed(() => {
      Object.keys(store2.state.uploadUrls);
      const bg = bgData.value;
      if (!bg)
        return null;
      for (const v of bg.variants) {
        for (const asset of v) {
          const url = getAAssetUrl(asset, false);
          if (url.startsWith("uploads:")) {
            Object.keys(store2.state.uploadUrls);
            return url.substring(8);
          }
        }
      }
      return null;
    });
    const bgData = computed(() => {
      const backgrounds = store2.getters["content/getBackgrounds"];
      return backgrounds.get(props.backgroundId) || null;
    });
    const isActive = computed(() => {
      return props.backgroundId === background.value.current;
    });
    const title = computed(() => {
      var _a2;
      switch (props.backgroundId) {
        case "buildin.static-color":
          return "Static color";
        case "buildin.transparent":
          return "Transparent";
      }
      return (_a2 = bgData.value.label) != null ? _a2 : "";
    });
    const style = computed(() => {
      var _a2;
      switch (props.backgroundId) {
        case "buildin.static-color":
          return {
            "background-color": background.value.color
          };
        case "buildin.transparent":
          return {};
      }
      let missingAsset = false;
      const urls = (_a2 = bgData.value) == null ? void 0 : _a2.variants[0].map((img) => {
        const assetUrl = getAAssetUrl(img, false);
        if (assetUrl.startsWith("uploads:")) {
          missingAsset = true;
        }
        return `url('${assetUrl}')`;
      }).join(",");
      if (missingAsset) {
        Object.keys(store2.state.uploadUrls);
      }
      return {
        backgroundImage: urls != null ? urls : ""
      };
    });
    function reuploadingBackground() {
      const missingSpriteUpload_ = missingBackgroundUpload.value;
      missingSpriteUpload_.click();
    }
    function backgroundReupload(_e) {
      return __async$f(this, null, function* () {
        const uploadInput = missingBackgroundUpload.value;
        const spriteName = missing.value;
        if (!uploadInput.files)
          return;
        if (uploadInput.files.length !== 1) {
          console.error("More than one file uploaded!");
          return;
        }
        const file = uploadInput.files[0];
        yield transaction(() => __async$f(this, null, function* () {
          const url = URL.createObjectURL(file);
          yield store2.dispatch("uploadUrls/add", {
            name: spriteName,
            url
          });
        }));
      });
    }
    return (_ctx, _cache) => {
      return missing.value !== null ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: normalizeClass({ background: true, active: isActive.value }),
        title: title.value,
        style: normalizeStyle$1(style.value),
        tabindex: "0",
        onClick: _cache[0] || (_cache[0] = ($event) => reuploadingBackground()),
        onKeypress: [
          _cache[1] || (_cache[1] = withKeys(withModifiers(($event) => reuploadingBackground(), ["prevent", "stop"]), ["enter"])),
          _cache[2] || (_cache[2] = withKeys(withModifiers(($event) => reuploadingBackground(), ["prevent", "stop"]), ["space"]))
        ]
      }, [
        createTextVNode(toDisplayString(title.value) + " ", 1),
        createBaseVNode("input", {
          type: "file",
          style: { "display": "none" },
          ref_key: "missingBackgroundUpload",
          ref: missingBackgroundUpload,
          onChange: backgroundReupload
        }, null, 544)
      ], 46, _hoisted_1$i)) : (openBlock(), createElementBlock("div", {
        key: 1,
        class: normalizeClass({ background: true, active: isActive.value }),
        title: title.value,
        style: normalizeStyle$1(style.value),
        tabindex: "0",
        onClick: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("input", __props.backgroundId)),
        onKeydown: [
          _cache[4] || (_cache[4] = withKeys(($event) => _ctx.$emit("input", __props.backgroundId), ["enter"])),
          _cache[5] || (_cache[5] = withKeys(withModifiers(($event) => _ctx.$emit("input", __props.backgroundId), ["prevent"]), ["space"]))
        ]
      }, toDisplayString(title.value), 47, _hoisted_2$g));
    };
  }
});
const button_vue_vue_type_style_index_0_scoped_a03a1466_lang = "";
const BackgroundButton = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["__scopeId", "data-v-a03a1466"]]);
const _hoisted_1$h = { class: "toggle_box" };
const _hoisted_2$f = ["id"];
const _hoisted_3$b = ["for"];
const _hoisted_4$b = ["for"];
const _sfc_main$k = /* @__PURE__ */ defineComponent({
  __name: "toggle",
  props: {
    label: String,
    modelValue: { type: Boolean, default: false }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const id = uniqId();
    const emit2 = __emit;
    const value = computed({
      get() {
        return props.modelValue;
      },
      set(value2) {
        emit2("update:modelValue", value2);
      }
    });
    const checkbox = ref(null);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$h, [
        withDirectives(createBaseVNode("input", {
          id: unref(id),
          type: "checkbox",
          ref_key: "checkbox",
          ref: checkbox,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => value.value = $event)
        }, null, 8, _hoisted_2$f), [
          [vModelCheckbox, value.value]
        ]),
        createBaseVNode("label", {
          for: unref(id),
          class: "switch"
        }, null, 8, _hoisted_3$b),
        createBaseVNode("label", {
          for: unref(id),
          class: "toggle_label"
        }, toDisplayString(__props.label), 9, _hoisted_4$b)
      ]);
    };
  }
});
const toggle_vue_vue_type_style_index_0_lang = "";
var __async$e = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _withScopeId$b = (n) => (pushScopeId("data-v-29cb5d90"), n = n(), popScopeId(), n);
const _hoisted_1$g = /* @__PURE__ */ _withScopeId$b(() => /* @__PURE__ */ createBaseVNode("label", { for: "bg_color" }, "Color:", -1));
const _hoisted_2$e = { key: 1 };
const _hoisted_3$a = { colspan: "3" };
const _hoisted_4$a = { key: 0 };
const _hoisted_5$9 = { class: "arrow-col" };
const _hoisted_6$9 = /* @__PURE__ */ _withScopeId$b(() => /* @__PURE__ */ createBaseVNode("td", { style: { "text-align": "center" } }, "Variant", -1));
const _hoisted_7$9 = { class: "arrow-col" };
const _hoisted_8$8 = { colspan: "3" };
const _hoisted_9$8 = /* @__PURE__ */ _withScopeId$b(() => /* @__PURE__ */ createBaseVNode("option", { value: "0" }, "None", -1));
const _hoisted_10$7 = /* @__PURE__ */ _withScopeId$b(() => /* @__PURE__ */ createBaseVNode("option", { value: "1" }, "Stretch", -1));
const _hoisted_11$6 = /* @__PURE__ */ _withScopeId$b(() => /* @__PURE__ */ createBaseVNode("option", { value: "2" }, "Cover", -1));
const _hoisted_12$6 = [
  _hoisted_9$8,
  _hoisted_10$7,
  _hoisted_11$6
];
const _hoisted_13$6 = { colspan: "3" };
const _sfc_main$j = /* @__PURE__ */ defineComponent({
  __name: "settings",
  emits: ["open-image-options", "change-color"],
  setup(__props, { emit: __emit }) {
    const store2 = useStore();
    const emit2 = __emit;
    const vertical = computed(() => store2.state.ui.vertical);
    const background = computed(() => {
      const currentPanel = store2.state.panels.currentPanel;
      return store2.state.panels.panels[currentPanel].background;
    });
    const flipped = computed({
      get() {
        return background.value.flipped;
      },
      set(flipped2) {
        transaction(() => {
          store2.commit("panels/setBackgroundFlipped", {
            flipped: flipped2,
            panelId: store2.state.panels.currentPanel
          });
        });
      }
    });
    const scaling = computed({
      get() {
        return background.value.scaling.toString();
      },
      set(scaling2) {
        transaction(() => {
          store2.commit("panels/setBackgroundScaling", {
            scaling: parseInt(scaling2, 10),
            panelId: store2.state.panels.currentPanel
          });
        });
      }
    });
    const currentBackgroundId = computed(() => background.value.current);
    const bgData = computed(() => {
      return store2.state.content.current.backgrounds.find(
        (background2) => background2.id === currentBackgroundId.value
      ) || null;
    });
    const isColor = computed(
      () => currentBackgroundId.value === "buildin.static-color"
    );
    const color2 = computed({
      get() {
        return background.value.color;
      },
      set(color22) {
        transaction(() => {
          store2.commit("panels/setBackgroundColor", {
            color: color22,
            panelId: store2.state.panels.currentPanel
          });
        });
      }
    });
    const isVariant = computed(() => !!bgData.value);
    const hasVariants = computed(
      () => bgData.value ? bgData.value.variants.length > 1 : false
    );
    function seekVariant(delta) {
      transaction(() => __async$e(this, null, function* () {
        yield store2.dispatch("panels/seekBackgroundVariant", {
          delta,
          panelId: store2.state.panels.currentPanel
        });
      }));
    }
    return (_ctx, _cache) => {
      return openBlock(), createBlock(DFieldset, {
        class: normalizeClass({ "bg-settings": true, vertical: vertical.value }),
        title: "Settings:"
      }, {
        default: withCtx(() => [
          isColor.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
            _hoisted_1$g,
            createBaseVNode("button", {
              id: "bg_color",
              class: "color-button",
              style: normalizeStyle$1({ background: color2.value }),
              onClick: _cache[0] || (_cache[0] = ($event) => emit2("change-color"))
            }, null, 4)
          ], 64)) : createCommentVNode("", true),
          isVariant.value ? (openBlock(), createElementBlock("table", _hoisted_2$e, [
            createBaseVNode("tr", null, [
              createBaseVNode("td", _hoisted_3$a, [
                createVNode(_sfc_main$k, {
                  modelValue: flipped.value,
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => flipped.value = $event),
                  label: "Flipped?"
                }, null, 8, ["modelValue"])
              ])
            ]),
            hasVariants.value ? (openBlock(), createElementBlock("tr", _hoisted_4$a, [
              createBaseVNode("td", _hoisted_5$9, [
                createBaseVNode("button", {
                  class: "small-button",
                  onClick: _cache[2] || (_cache[2] = ($event) => seekVariant(-1))
                }, "<")
              ]),
              _hoisted_6$9,
              createBaseVNode("td", _hoisted_7$9, [
                createBaseVNode("button", {
                  class: "small-button",
                  onClick: _cache[3] || (_cache[3] = ($event) => seekVariant(1))
                }, ">")
              ])
            ])) : createCommentVNode("", true),
            createBaseVNode("tr", null, [
              createBaseVNode("td", _hoisted_8$8, [
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => scaling.value = $event),
                  onKeydown: _cache[5] || (_cache[5] = withModifiers(() => {
                  }, ["stop"]))
                }, _hoisted_12$6, 544), [
                  [vModelSelect, scaling.value]
                ])
              ])
            ]),
            createBaseVNode("tr", null, [
              createBaseVNode("td", _hoisted_13$6, [
                createBaseVNode("button", {
                  id: "image_options_button",
                  class: "v-w100",
                  onClick: _cache[6] || (_cache[6] = ($event) => emit2("open-image-options"))
                }, " Image options ")
              ])
            ])
          ])) : createCommentVNode("", true)
        ]),
        _: 1
      }, 8, ["class"]);
    };
  }
});
const settings_vue_vue_type_style_index_0_scoped_29cb5d90_lang = "";
const BackgroundSettings = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["__scopeId", "data-v-29cb5d90"]]);
var __defProp$2 = Object.defineProperty;
var __defProps$1 = Object.defineProperties;
var __getOwnPropDescs$1 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$2 = Object.getOwnPropertySymbols;
var __hasOwnProp$2 = Object.prototype.hasOwnProperty;
var __propIsEnum$2 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$2 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$2.call(b, prop))
      __defNormalProp$2(a, prop, b[prop]);
  if (__getOwnPropSymbols$2)
    for (var prop of __getOwnPropSymbols$2(b)) {
      if (__propIsEnum$2.call(b, prop))
        __defNormalProp$2(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$1 = (a, b) => __defProps$1(a, __getOwnPropDescs$1(b));
var __async$d = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _withScopeId$a = (n) => (pushScopeId("data-v-3d68fb70"), n = n(), popScopeId(), n);
const _hoisted_1$f = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("h1", null, "Background", -1));
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  __name: "backgrounds",
  setup(__props) {
    const uploadedBackgroundsPackDefaults = {
      packId: "dddg.uploads.backgrounds",
      dependencies: [],
      packCredits: [],
      characters: [],
      fonts: [],
      sprites: [],
      poemStyles: [],
      poemBackgrounds: [],
      backgrounds: [],
      colors: []
    };
    const store2 = useStore();
    const root = ref(null);
    setupPanelMixin(root);
    const colorSelect = ref(false);
    const imageOptions = ref(false);
    const bgColor = computed({
      get() {
        return store2.state.panels.panels[store2.state.panels.currentPanel].background.color;
      },
      set(color2) {
        transaction(() => {
          store2.commit("panels/setBackgroundColor", {
            color: color2,
            panelId: store2.state.panels.currentPanel
          });
        });
      }
    });
    const backgrounds = computed(() => {
      return [
        ...store2.state.content.current.backgrounds.map(
          (background) => background.id
        ),
        "buildin.static-color",
        "buildin.transparent"
      ];
    });
    const showBackgroundsFolder = computed(() => {
      return envX.supports.openableFolders.has(
        "backgrounds"
      );
    });
    function setBackground(id) {
      store2.commit("panels/setCurrentBackground", {
        current: id,
        panelId: store2.state.panels.currentPanel
      });
    }
    function openBackgroundFolder() {
      envX.openFolder("backgrounds");
    }
    const upload = ref(null);
    function onFileUpload(_e) {
      const uploadInput = upload.value;
      if (!uploadInput.files)
        return;
      for (const file of uploadInput.files) {
        addImageFile(file);
      }
    }
    function addImageFile(file) {
      return __async$d(this, null, function* () {
        yield transaction(() => __async$d(this, null, function* () {
          const url = URL.createObjectURL(file);
          const assetUrl = yield store2.dispatch("uploadUrls/add", {
            name: file.name,
            url
          });
          yield addNewCustomBackground(file.name, file.name, assetUrl);
        }));
      });
    }
    function addByUrl() {
      const url = prompt("Enter the URL of the image");
      if (url == null)
        return;
      const lastSegment = url.split("/").slice(-1)[0];
      addNewCustomBackground(lastSegment, lastSegment, url);
    }
    function addNewCustomBackground(id, label, url) {
      return __async$d(this, null, function* () {
        const old = store2.state.content.contentPacks.find(
          (x) => x.packId === uploadedBackgroundsPackDefaults.packId
        ) || uploadedBackgroundsPackDefaults;
        const newPackVersion = __spreadProps$1(__spreadValues$2({}, old), {
          backgrounds: [
            ...old.backgrounds,
            {
              id,
              label,
              variants: [
                [
                  {
                    hq: url,
                    lq: url,
                    sourcePack: uploadedBackgroundsPackDefaults.packId
                  }
                ]
              ],
              scaling: "none"
            }
          ]
        });
        yield transaction(() => __async$d(this, null, function* () {
          yield store2.dispatch("content/replaceContentPack", {
            contentPack: newPackVersion,
            processed: true
          });
          setBackground(id);
        }));
      });
    }
    const dt = ref(null);
    function dragEnter(e) {
      if (!e.dataTransfer)
        return;
      e.dataTransfer.effectAllowed = "none";
      if (!Array.from(e.dataTransfer.items).find(
        (item) => item.type.match(/^image.*$/)
      )) {
        return;
      }
      e.dataTransfer.effectAllowed = "link";
      dt.value.show();
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "panel",
        ref_key: "root",
        ref: root,
        onDragenter: dragEnter,
        onMouseleave: _cache[7] || (_cache[7] = ($event) => dt.value.hide())
      }, [
        createVNode(DropTarget, {
          ref_key: "dt",
          ref: dt,
          class: "drop-target",
          onDrop: addImageFile
        }, {
          default: withCtx(() => [
            createTextVNode("Drop here to add as a new background ")
          ]),
          _: 1
        }, 512),
        _hoisted_1$f,
        colorSelect.value ? (openBlock(), createBlock(Color, {
          key: 0,
          modelValue: bgColor.value,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => bgColor.value = $event),
          onLeave: _cache[1] || (_cache[1] = ($event) => colorSelect.value = false)
        }, null, 8, ["modelValue"])) : imageOptions.value ? (openBlock(), createBlock(ImageOptions, {
          key: 1,
          type: "background",
          title: "",
          "panel-id": unref(store2).state.panels.currentPanel,
          "no-composition": "",
          onLeave: _cache[2] || (_cache[2] = ($event) => imageOptions.value = false)
        }, null, 8, ["panel-id"])) : (openBlock(), createElementBlock(Fragment, { key: 2 }, [
          createVNode(BackgroundSettings, {
            onChangeColor: _cache[3] || (_cache[3] = ($event) => colorSelect.value = true),
            onOpenImageOptions: _cache[4] || (_cache[4] = ($event) => imageOptions.value = true)
          }),
          createVNode(DButton, {
            icon: "upload",
            class: "upload-background",
            onClick: _cache[5] || (_cache[5] = ($event) => upload.value.click())
          }, {
            default: withCtx(() => [
              createTextVNode(" Upload "),
              createBaseVNode("input", {
                type: "file",
                ref_key: "upload",
                ref: upload,
                onChange: onFileUpload
              }, null, 544)
            ]),
            _: 1
          }),
          createVNode(DButton, {
            icon: "link",
            class: "upload-background",
            onClick: addByUrl
          }, {
            default: withCtx(() => [
              createTextVNode(" Add by URL ")
            ]),
            _: 1
          }),
          createVNode(DButton, {
            icon: "extension",
            class: "upload-background",
            onClick: _cache[6] || (_cache[6] = ($event) => _ctx.$emit("show-dialog", "type: Backgrounds"))
          }, {
            default: withCtx(() => [
              createTextVNode(" Search in content packs ")
            ]),
            _: 1
          }),
          showBackgroundsFolder.value ? (openBlock(), createBlock(DButton, {
            key: 0,
            icon: "folder",
            class: "upload-background",
            onClick: openBackgroundFolder
          }, {
            default: withCtx(() => [
              createTextVNode(" Open backgrounds folder ")
            ]),
            _: 1
          })) : createCommentVNode("", true),
          (openBlock(true), createElementBlock(Fragment, null, renderList(backgrounds.value, (background) => {
            return openBlock(), createBlock(BackgroundButton, {
              key: background,
              backgroundId: background,
              onInput: ($event) => setBackground(background)
            }, null, 8, ["backgroundId", "onInput"]);
          }), 128))
        ], 64))
      ], 544);
    };
  }
});
const backgrounds_vue_vue_type_style_index_0_scoped_3d68fb70_lang = "";
const BackgroundsPanel = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["__scopeId", "data-v-3d68fb70"]]);
function genericSetterSplit(store2, object, message, action, key) {
  return computed({
    get() {
      return object.value[key];
    },
    set(value) {
      transaction(() => {
        store2[action ? "dispatch" : "commit"](message, {
          panelId: object.value.panelId,
          id: object.value.id,
          key,
          value
        });
      });
    }
  });
}
function genericSetterMerged(store2, object, message, action, key) {
  return computed({
    get() {
      return object.value[key];
    },
    set(value) {
      transaction(() => {
        store2[action ? "dispatch" : "commit"](message, {
          panelId: object.value.panelId,
          id: object.value.id,
          [key]: value
        });
      });
    }
  });
}
var __async$c = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _hoisted_1$e = ["onKeydown"];
const spriteSize = 960;
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "part-button",
  props: {
    part: {
      required: true,
      type: Object
    },
    value: {
      required: true
    },
    size: {
      type: Number,
      default: 150
    }
  },
  emits: ["quick-click", "click"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit2 = __emit;
    const lookups = ref([]);
    const scaleX = computed(() => {
      return props.size / props.part.size[0];
    });
    const scaleY = computed(() => {
      return props.size / props.part.size[1];
    });
    const backgroundSize = computed(() => {
      return `${Math.floor(spriteSize * scaleX.value)}px ${Math.floor(
        spriteSize * scaleY.value
      )}px`;
    });
    const background = computed(() => {
      var _a2, _b;
      let ret = "";
      const size2 = backgroundSize.value;
      const globalOffset = (_a2 = props.part.offset) != null ? _a2 : [0, 0];
      const max = props.part.images.length - 1;
      for (let i = 0; i <= max; ++i) {
        const image = props.part.images[max - i];
        const lookup = lookups.value[max - i];
        if (!lookup)
          continue;
        if (i > 0)
          ret += ", ";
        const localOffset = (_b = image.offset) != null ? _b : [0, 0];
        const pos = `${Math.floor((globalOffset[0] - localOffset[0]) * -scaleX.value)}px ${Math.floor((globalOffset[1] - localOffset[1]) * -scaleY.value)}px`;
        ret += `url('${lookup.replace("'", "\\'")}') ${pos} / ${size2}`;
      }
      return ret;
    });
    const style = computed(() => {
      return {
        height: props.size + "px",
        width: props.size + "px",
        background: background.value
      };
    });
    function quickClick(e) {
      e.preventDefault();
      emit2("quick-click");
    }
    function init() {
      return __async$c(this, null, function* () {
        lookups.value = yield Promise.all(
          props.part.images.map((image) => {
            if (typeof image.asset === "string") {
              return getBuildInAssetUrl(image.asset, false);
            } else {
              return getAAssetUrl(image.asset, false);
            }
          })
        );
      });
    }
    safeAsync("Initialization of parts button", init);
    return (_ctx, _cache) => {
      var _a2;
      return openBlock(), createElementBlock("div", {
        class: normalizeClass({ part: true, active: (_a2 = __props.part) == null ? void 0 : _a2.active }),
        style: normalizeStyle$1(style.value),
        tabindex: "0",
        onClick: _cache[0] || (_cache[0] = ($event) => emit2("click")),
        onContextmenu: quickClick,
        onKeydown: [
          _cache[1] || (_cache[1] = withKeys(withModifiers(($event) => emit2("click"), ["prevent"]), ["enter"])),
          withKeys(withModifiers(quickClick, ["prevent"]), ["space"])
        ]
      }, null, 46, _hoisted_1$e);
    };
  }
});
const partButton_vue_vue_type_style_index_0_scoped_fcce95d0_lang = "";
const PartButton = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["__scopeId", "data-v-fcce95d0"]]);
var __async$b = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _sfc_main$g = /* @__PURE__ */ defineComponent({
  __name: "parts",
  props: {
    character: {
      type: Object,
      required: true
    },
    part: {
      required: true,
      type: String
    }
  },
  emits: ["leave", "show-dialog", "show-expression-dialog"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const store2 = useStore();
    const emit2 = __emit;
    const isWebPSupported$1 = ref(null);
    const stylePriorities = ref([]);
    const packSearchType = computed(() => {
      switch (props.part) {
        case "head":
          return "Expressions";
        case "style":
          return "Styles";
        default:
          return "Poses";
      }
    });
    const charData = computed(() => getData(store2, props.character));
    const styleComponents = computed(() => {
      if (props.part !== "style")
        return [];
      const styleComponents2 = charData.value.styleGroups[props.character.styleGroupId];
      return styleComponents2.styleComponents.map((component) => {
        const buttons = {};
        for (const key in component.variants) {
          if (!component.variants.hasOwnProperty(key))
            continue;
          const variant = component.variants[key];
          buttons[key] = {
            size: styleComponents2.styles[0].poses[0].size,
            offset: [0, 0],
            images: [{ offset: [0, 0], asset: variant }],
            active: false
          };
        }
        return { label: component.label, name: component.id, buttons };
      });
    });
    const parts = computed(() => {
      const ret = {};
      let collection;
      let offset;
      let size2;
      const data = charData.value;
      const currentPose = getPose(data, props.character);
      switch (props.part) {
        case "head": {
          const activeHeadTypeIdx = props.character.posePositions.headType || 0;
          const activeHeadIdx = props.character.posePositions.head || 0;
          for (let headKeyIdx = 0; headKeyIdx < currentPose.compatibleHeads.length; ++headKeyIdx) {
            const headKey = currentPose.compatibleHeads[headKeyIdx];
            const heads = data.heads[headKey];
            for (let headIdx = 0; headIdx < heads.variants.length; ++headIdx) {
              const headImages = heads.variants[headIdx];
              ret[`${headKeyIdx}_${headIdx}`] = {
                size: heads.previewSize,
                offset: heads.previewOffset,
                images: headImages.map(
                  (image) => ({ asset: image, offset: [0, 0] })
                ),
                active: activeHeadIdx === headIdx && activeHeadTypeIdx === headKeyIdx
              };
            }
          }
          return ret;
        }
        case "pose":
          const currentStyle = data.styleGroups[props.character.styleGroupId].styles[props.character.styleId];
          for (let poseIdx = 0; poseIdx < currentStyle.poses.length; ++poseIdx) {
            const pose = currentStyle.poses[poseIdx];
            ret[poseIdx] = generatePosePreview(pose);
            ret[poseIdx].active = poseIdx === props.character.poseId;
          }
          return ret;
        case "style":
          for (let styleIdx = 0; styleIdx < data.styleGroups.length; ++styleIdx) {
            const styleGroup = data.styleGroups[styleIdx];
            ret[styleGroup.id] = generatePosePreview(styleGroup.styles[0].poses[0]);
            ret[styleGroup.id].active = styleIdx === props.character.styleGroupId;
          }
          return ret;
        default:
          collection = currentPose.positions[props.part];
          size2 = currentPose.previewSize;
          offset = currentPose.previewOffset;
          break;
      }
      for (let partIdx = 0; partIdx < collection.length; ++partIdx) {
        const part = collection[partIdx];
        ret[partIdx] = {
          images: part.map((partImage) => ({
            offset: [0, 0],
            asset: partImage
          })),
          size: size2,
          offset,
          active: partIdx === (props.character.posePositions[props.part] || 0)
        };
      }
      return ret;
    });
    function updateStyleData() {
      const baseStyle = charData.value.styleGroups[props.character.styleGroupId].styles[props.character.styleId];
      stylePriorities.value = Object.keys(baseStyle.components).map((key) => [
        key,
        baseStyle.components[key]
      ]);
    }
    function generatePosePreview(pose) {
      const data = charData.value;
      let images = [];
      for (const command of pose.renderCommands) {
        switch (command.type) {
          case "pose-part":
            const part = pose.positions[command.part];
            if (part == null || part.length === 0)
              break;
            images = images.concat(
              part[0].map((x) => ({ asset: x, offset: command.offset }))
            );
            break;
          case "head": {
            const heads = data.heads[pose.compatibleHeads[0]];
            if (pose.compatibleHeads.length === 0)
              break;
            const head2 = heads.variants[0];
            images = images.concat(
              head2.map((x) => ({
                asset: x,
                offset: command.offset
              }))
            );
            break;
          }
          case "image":
            images = images.concat(
              command.images.map((x) => ({ asset: x, offset: command.offset }))
            );
            break;
        }
      }
      return {
        images,
        size: pose.previewSize,
        offset: pose.previewOffset,
        active: false
      };
    }
    function updatePose(styleGroupId) {
      if (styleGroupId == void 0)
        styleGroupId = props.character.styleGroupId;
      const data = charData.value;
      const styleGroups = data.styleGroups[styleGroupId];
      let selection = styleGroups.styles;
      for (const priority of stylePriorities.value) {
        const subSelect = selection.filter((style) => {
          return style.components[priority[0]] === priority[1];
        });
        if (subSelect.length > 0)
          selection = subSelect;
      }
      transaction(() => __async$b(this, null, function* () {
        yield store2.dispatch("panels/setCharStyle", {
          id: props.character.id,
          panelId: props.character.panelId,
          styleGroupId,
          styleId: styleGroups.styles.indexOf(selection[0])
        });
      }));
    }
    function choose(index) {
      if (props.part === "style") {
        updatePose(
          charData.value.styleGroups.findIndex((group) => group.id === index)
        );
      } else if (props.part === "head") {
        const [headTypeIdx, headIdx] = ("" + index).split("_", 2).map((part) => parseInt(part, 10));
        store2.commit("panels/setPosePosition", {
          id: props.character.id,
          panelId: props.character.panelId,
          posePositions: {
            headType: headTypeIdx,
            head: headIdx
          }
        });
      } else {
        setPart(props.part, parseInt("" + index, 10));
      }
    }
    function choose_component(component, id) {
      const prioIdx = stylePriorities.value.findIndex(
        (stylePriority) => stylePriority[0] === component
      );
      stylePriorities.value.splice(prioIdx, 1);
      stylePriorities.value.unshift([component, "" + id]);
      updatePose();
    }
    function onKeydown(e) {
      if (e.key === "Backspace" || e.key === "Escape") {
        emit2("leave");
        e.preventDefault();
        e.stopPropagation();
      }
    }
    function setPart(part, index) {
      transaction(() => __async$b(this, null, function* () {
        yield store2.dispatch("panels/setPart", {
          id: props.character.id,
          panelId: props.character.panelId,
          part,
          val: index
        });
      }));
    }
    safeAsync("Initializing parts data", () => __async$b(this, null, function* () {
      isWebPSupported$1.value = yield isWebPSupported();
    }));
    watch(() => props.character, updateStyleData, { immediate: true });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(DFlow, {
        "no-wraping": "",
        onKeydown
      }, {
        default: withCtx(() => [
          createBaseVNode("button", {
            onClick: _cache[0] || (_cache[0] = ($event) => emit2("leave"))
          }, "Back"),
          __props.part === "head" ? (openBlock(), createBlock(DButton, {
            key: 0,
            icon: "extension",
            onClick: _cache[1] || (_cache[1] = ($event) => emit2("show-expression-dialog", { character: __props.character.characterType }))
          }, {
            default: withCtx(() => [
              createTextVNode(" Create new expressions ")
            ]),
            _: 1
          })) : createCommentVNode("", true),
          createVNode(DButton, {
            icon: "extension",
            onClick: _cache[2] || (_cache[2] = ($event) => emit2(
              "show-dialog",
              `type: ${packSearchType.value} character: ${charData.value.label}`
            ))
          }, {
            default: withCtx(() => [
              createTextVNode(" Search in content packs ")
            ]),
            _: 1
          }),
          (openBlock(true), createElementBlock(Fragment, null, renderList(parts.value, (part, index) => {
            return openBlock(), createBlock(PartButton, {
              key: index,
              value: index,
              part,
              onClick: ($event) => {
                choose(index);
                emit2("leave");
              },
              onQuickClick: ($event) => choose(index)
            }, null, 8, ["value", "part", "onClick", "onQuickClick"]);
          }), 128)),
          (openBlock(true), createElementBlock(Fragment, null, renderList(styleComponents.value, (styleComponent) => {
            return openBlock(), createBlock(DFieldset, {
              key: styleComponent.name,
              title: styleComponent.label
            }, {
              default: withCtx(() => [
                createVNode(DFlow, { noWraping: "" }, {
                  default: withCtx(() => [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(styleComponent.buttons, (button, id) => {
                      return openBlock(), createBlock(PartButton, {
                        size: 130,
                        key: id,
                        value: id,
                        part: button,
                        onClick: ($event) => choose_component(styleComponent.name, id)
                      }, null, 8, ["value", "part", "onClick"]);
                    }), 128))
                  ]),
                  _: 2
                }, 1024)
              ]),
              _: 2
            }, 1032, ["title"]);
          }), 128))
        ]),
        _: 1
      });
    };
  }
});
const parts_vue_vue_type_style_index_0_scoped_3aae698b_lang = "";
const Parts = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["__scopeId", "data-v-3aae698b"]]);
var __async$a = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "delete",
  props: {
    obj: {
      required: true,
      type: Object
    }
  },
  setup(__props) {
    const store2 = useStore();
    const props = __props;
    function onClick() {
      transaction(() => __async$a(this, null, function* () {
        yield store2.dispatch("panels/removeObject", {
          panelId: props.obj.panelId,
          id: props.obj.id
        });
      }));
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("button", { onClick }, "Delete");
    };
  }
});
var __async$9 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "layers",
  props: {
    object: {
      required: true,
      type: Object
    }
  },
  setup(__props) {
    const store2 = useStore();
    const props = __props;
    const onTop = genericSetterMerged(
      store2,
      computed(() => props.object),
      "panels/setOnTop",
      true,
      "onTop"
    );
    function shiftLayer(delta) {
      transaction(() => __async$9(this, null, function* () {
        yield store2.dispatch("panels/shiftLayer", {
          id: props.object.id,
          panelId: props.object.panelId,
          delta
        });
      }));
    }
    return (_ctx, _cache) => {
      return openBlock(), createBlock(DFieldset, {
        id: "layerfs",
        title: "Layer:"
      }, {
        default: withCtx(() => [
          createVNode(DFlow, {
            class: "layer_flow",
            direction: "horizontal"
          }, {
            default: withCtx(() => [
              createVNode(DButton, {
                icon: "vertical_align_bottom",
                "icon-pos": "top",
                onClick: _cache[0] || (_cache[0] = ($event) => shiftLayer(-Infinity)),
                title: "Move to back"
              }),
              createVNode(DButton, {
                icon: "arrow_downward",
                "icon-pos": "top",
                onClick: _cache[1] || (_cache[1] = ($event) => shiftLayer(-1)),
                title: "Move backwards"
              }),
              createVNode(DButton, {
                icon: "arrow_upward",
                "icon-pos": "top",
                onClick: _cache[2] || (_cache[2] = ($event) => shiftLayer(1)),
                title: "Move forwards"
              }),
              createVNode(DButton, {
                icon: "vertical_align_top",
                "icon-pos": "top",
                onClick: _cache[3] || (_cache[3] = ($event) => shiftLayer(Infinity)),
                title: "Move to front"
              })
            ]),
            _: 1
          }),
          createVNode(_sfc_main$k, {
            modelValue: unref(onTop),
            "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => isRef(onTop) ? onTop.value = $event : null),
            label: "In front?"
          }, null, 8, ["modelValue"])
        ]),
        _: 1
      });
    };
  }
});
const layers_vue_vue_type_style_index_0_scoped_59722cd0_lang = "";
const Layers = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__scopeId", "data-v-59722cd0"]]);
var __async$8 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _withScopeId$9 = (n) => (pushScopeId("data-v-e3c4690d"), n = n(), popScopeId(), n);
const _hoisted_1$d = { class: "v-w100" };
const _hoisted_2$d = { colspan: "2" };
const _hoisted_3$9 = { key: 0 };
const _hoisted_4$9 = { colspan: "2" };
const _hoisted_5$8 = { class: "v-w100 button-tbl" };
const _hoisted_6$8 = { class: "arrow-col" };
const _hoisted_7$8 = ["disabled"];
const _hoisted_8$7 = ["value"];
const _hoisted_9$7 = { class: "arrow-col" };
const _hoisted_10$6 = ["disabled"];
const _hoisted_11$5 = /* @__PURE__ */ _withScopeId$9(() => /* @__PURE__ */ createBaseVNode("td", { class: "v-w50" }, [
  /* @__PURE__ */ createBaseVNode("label", { for: "sprite_x" }, "X:")
], -1));
const _hoisted_12$5 = { class: "v-w50" };
const _hoisted_13$5 = /* @__PURE__ */ _withScopeId$9(() => /* @__PURE__ */ createBaseVNode("td", { class: "v-w50" }, [
  /* @__PURE__ */ createBaseVNode("label", { for: "sprite_y" }, "Y:")
], -1));
const _hoisted_14$5 = { class: "v-w50" };
const _hoisted_15$4 = /* @__PURE__ */ _withScopeId$9(() => /* @__PURE__ */ createBaseVNode("td", { class: "v-w50" }, [
  /* @__PURE__ */ createBaseVNode("label", { for: "sprite_w" }, "Width:")
], -1));
const _hoisted_16$4 = { class: "v-w50" };
const _hoisted_17$4 = /* @__PURE__ */ _withScopeId$9(() => /* @__PURE__ */ createBaseVNode("td", { class: "v-w50" }, [
  /* @__PURE__ */ createBaseVNode("label", { for: "sprite_h" }, "Height:")
], -1));
const _hoisted_18$4 = { class: "v-w50" };
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "position-and-size",
  props: {
    obj: {
      required: true,
      type: Object
    }
  },
  setup(__props) {
    const store2 = useStore();
    const props = __props;
    const height = computed({
      get() {
        const constants = getConstants().TextBox;
        return props.obj.height - (easterEgg.value ? constants.NameboxHeight : 0);
      },
      set(height2) {
        const constants = getConstants().TextBox;
        transaction(() => {
          store2.commit("panels/setSize", {
            id: props.obj.id,
            panelId: props.obj.panelId,
            height: height2 + (easterEgg.value ? constants.NameboxHeight : 0),
            width: props.obj.width
          });
        });
      }
    });
    const width = computed({
      get() {
        return props.obj.width;
      },
      set(width2) {
        transaction(() => {
          store2.commit("panels/setSize", {
            id: props.obj.id,
            panelId: props.obj.panelId,
            height: props.obj.height,
            width: width2
          });
        });
      }
    });
    const allowSize = computed(() => {
      const obj = props.obj;
      if (obj.type === "textBox") {
        const renderer2 = rendererLookup[obj.style];
        return renderer2.resizable;
      }
      const constants = getConstants().Poem;
      if (obj.type === "poem") {
        const bg = constants.poemBackgrounds[obj.background];
        return bg.file.startsWith("internal:");
      }
      return false;
    });
    const easterEgg = computed(() => {
      return props.obj.type === "textBox" && location.search.includes("alex");
    });
    const allowStepMove = computed(() => "freeMove" in props.obj);
    const positionNames = computed(() => getConstants().Base.positions);
    const isFirstPos = computed(() => pos.value === 0);
    const isLastPos = computed(
      () => pos.value === getConstants().Base.positions.length - 1
    );
    const pos = computed({
      get() {
        return closestCharacterSlot(props.obj.x);
      },
      set(value) {
        transaction(() => __async$8(this, null, function* () {
          yield store2.dispatch("panels/setPosition", {
            id: props.obj.id,
            panelId: props.obj.panelId,
            x: getConstants().Base.characterPositions[value],
            y: props.obj.y
          });
        }));
      }
    });
    const freeMove = computed({
      get() {
        return !!props.obj.freeMove;
      },
      set(freeMove2) {
        transaction(() => {
          store2.commit("panels/setFreeMove", {
            id: props.obj.id,
            panelId: props.obj.panelId,
            freeMove: freeMove2
          });
        });
      }
    });
    const x = computed({
      get() {
        return props.obj.x;
      },
      set(x2) {
        transaction(() => {
          store2.commit("panels/setPosition", {
            id: props.obj.id,
            panelId: props.obj.panelId,
            x: x2,
            y: y.value
          });
        });
      }
    });
    const y = computed({
      get() {
        return props.obj.y;
      },
      set(y2) {
        transaction(() => {
          store2.commit("panels/setPosition", {
            id: props.obj.id,
            panelId: props.obj.panelId,
            x: x.value,
            y: y2
          });
        });
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(DFieldset, {
        title: "Position" + (allowSize.value ? "/Size" : "")
      }, {
        default: withCtx(() => [
          createBaseVNode("table", _hoisted_1$d, [
            createBaseVNode("tr", null, [
              createBaseVNode("td", _hoisted_2$d, [
                allowStepMove.value ? (openBlock(), createBlock(_sfc_main$k, {
                  key: 0,
                  modelValue: freeMove.value,
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => freeMove.value = $event),
                  label: "Move freely?"
                }, null, 8, ["modelValue"])) : createCommentVNode("", true)
              ])
            ]),
            allowStepMove.value && !freeMove.value ? (openBlock(), createElementBlock("tr", _hoisted_3$9, [
              createBaseVNode("td", _hoisted_4$9, [
                createBaseVNode("table", _hoisted_5$8, [
                  createBaseVNode("tr", null, [
                    createBaseVNode("td", _hoisted_6$8, [
                      createBaseVNode("button", {
                        onClick: _cache[1] || (_cache[1] = ($event) => --pos.value),
                        disabled: isFirstPos.value
                      }, "<", 8, _hoisted_7$8)
                    ]),
                    createBaseVNode("td", null, [
                      withDirectives(createBaseVNode("select", {
                        id: "current_talking",
                        class: "v-w100",
                        style: { "text-align": "center" },
                        "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => pos.value = $event)
                      }, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(positionNames.value, (val, key) => {
                          return openBlock(), createElementBlock("option", {
                            key,
                            value: key
                          }, toDisplayString(val), 9, _hoisted_8$7);
                        }), 128))
                      ], 512), [
                        [
                          vModelSelect,
                          pos.value,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ]),
                    createBaseVNode("td", _hoisted_9$7, [
                      createBaseVNode("button", {
                        onClick: _cache[3] || (_cache[3] = ($event) => ++pos.value),
                        disabled: isLastPos.value
                      }, ">", 8, _hoisted_10$6)
                    ])
                  ])
                ])
              ])
            ])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              createBaseVNode("tr", null, [
                _hoisted_11$5,
                createBaseVNode("td", _hoisted_12$5, [
                  withDirectives(createBaseVNode("input", {
                    id: "sprite_x",
                    class: "w100",
                    type: "number",
                    "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => x.value = $event),
                    onKeydown: _cache[5] || (_cache[5] = withModifiers(() => {
                    }, ["stop"]))
                  }, null, 544), [
                    [
                      vModelText,
                      x.value,
                      void 0,
                      { number: true }
                    ]
                  ])
                ])
              ]),
              createBaseVNode("tr", null, [
                _hoisted_13$5,
                createBaseVNode("td", _hoisted_14$5, [
                  withDirectives(createBaseVNode("input", {
                    class: "w100",
                    id: "sprite_y",
                    type: "number",
                    "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => y.value = $event),
                    onKeydown: _cache[7] || (_cache[7] = withModifiers(() => {
                    }, ["stop"]))
                  }, null, 544), [
                    [
                      vModelText,
                      y.value,
                      void 0,
                      { number: true }
                    ]
                  ])
                ])
              ])
            ], 64)),
            allowSize.value ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
              createBaseVNode("tr", null, [
                _hoisted_15$4,
                createBaseVNode("td", _hoisted_16$4, [
                  withDirectives(createBaseVNode("input", {
                    id: "sprite_w",
                    min: "0",
                    type: "number",
                    "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => width.value = $event),
                    onKeydown: _cache[9] || (_cache[9] = withModifiers(() => {
                    }, ["stop"]))
                  }, null, 544), [
                    [
                      vModelText,
                      width.value,
                      void 0,
                      { number: true }
                    ]
                  ])
                ])
              ]),
              createBaseVNode("tr", null, [
                _hoisted_17$4,
                createBaseVNode("td", _hoisted_18$4, [
                  withDirectives(createBaseVNode("input", {
                    id: "sprite_h",
                    min: "0",
                    type: "number",
                    "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => height.value = $event),
                    onKeydown: _cache[11] || (_cache[11] = withModifiers(() => {
                    }, ["stop"]))
                  }, null, 544), [
                    [
                      vModelText,
                      height.value,
                      void 0,
                      { number: true }
                    ]
                  ])
                ])
              ])
            ], 64)) : createCommentVNode("", true)
          ])
        ]),
        _: 1
      }, 8, ["title"]);
    };
  }
});
const positionAndSize_vue_vue_type_style_index_0_scoped_e3c4690d_lang = "";
const PositionAndSize = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["__scopeId", "data-v-e3c4690d"]]);
var __defProp$1 = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$1 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$1.call(b, prop))
      __defNormalProp$1(a, prop, b[prop]);
  if (__getOwnPropSymbols$1)
    for (var prop of __getOwnPropSymbols$1(b)) {
      if (__propIsEnum$1.call(b, prop))
        __defNormalProp$1(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
const _withScopeId$8 = (n) => (pushScopeId("data-v-e63aaa5e"), n = n(), popScopeId(), n);
const _hoisted_1$c = { class: "column ok-col" };
const _hoisted_2$c = { class: "column" };
const _hoisted_3$8 = ["value"];
const _hoisted_4$8 = {
  key: 0,
  class: "column error-col"
};
const _hoisted_5$7 = { class: "column" };
const _hoisted_6$7 = /* @__PURE__ */ _withScopeId$8(() => /* @__PURE__ */ createBaseVNode("p", { class: "hint-col" }, "Apply style to selected text:", -1));
const _hoisted_7$7 = { class: "column" };
const _hoisted_8$6 = { class: "column" };
const _hoisted_9$6 = { class: "column" };
const _hoisted_10$5 = /* @__PURE__ */ createStaticVNode('<option value data-v-e63aaa5e>Font</option><option value="aller" style="font-family:aller;" data-v-e63aaa5e> Aller (Textbox) </option><option value="riffic" style="font-family:riffic;" data-v-e63aaa5e> Riffic (Bold text) </option><option value="hashtag" style="font-family:hashtag;" data-v-e63aaa5e> Hashtag (Sayori) </option><option value="ammy_handwriting" style="font-family:ammy_handwriting;" data-v-e63aaa5e> Ammy&#39;s Handwriting (Natsuki) </option><option value="journal" style="font-family:journal;" data-v-e63aaa5e> Journal (Monika) </option><option value="jp_hand_slanted" style="font-family:jp_hand_slanted;" data-v-e63aaa5e> JP Hand Slanted (Yuri) </option><option value="damagrafik_script" style="font-family:damagrafik_script;" data-v-e63aaa5e> Damagrafik (Yuri, Act 2) </option><option value="as_i_lay_dying" style="font-family:as_i_lay_dying;" data-v-e63aaa5e> As I Lay Dying (Yuri, Act Unused) </option><option value="halogen" style="font-family:halogen;" data-v-e63aaa5e> Halogen (MC) </option>', 10);
const _hoisted_20$2 = [
  _hoisted_10$5
];
const _sfc_main$c = /* @__PURE__ */ defineComponent(__spreadProps(__spreadValues$1({}, {
  inheritAttrs: false
}), {
  __name: "text",
  props: {
    modelValue: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ""
    }
  },
  emits: ["update:modelValue", "leave"],
  setup(__props, { emit: __emit }) {
    const store2 = useStore();
    const emit2 = __emit;
    const textArea = ref(null);
    const colorSelector = ref("");
    const selectedFont = ref("");
    const selectedColor = ref("#000000");
    const rememberedStart = ref(0);
    const rememberedEnd = ref(0);
    const error2 = ref("");
    const vertical = computed(() => store2.state.ui.vertical);
    watch(
      () => selectedFont.value,
      () => {
        if (selectedFont.value === "")
          return;
        insertCommand("font", selectedFont.value);
        selectedFont.value = "";
      }
    );
    function onValueChanged() {
      const constants = getConstants();
      const val = textArea.value.value;
      try {
        new TextRenderer(val, constants.TextBox.NameboxTextStyle);
        error2.value = "";
      } catch (e) {
        error2.value = e.message;
      }
      emit2("update:modelValue", val);
    }
    function selectColor(colorSelector_) {
      const el = textArea.value;
      colorSelector.value = colorSelector_;
      rememberedStart.value = el.selectionStart;
      rememberedEnd.value = el.selectionEnd;
    }
    function applyColor() {
      const color2 = selectedColor.value;
      const colorSelector_ = colorSelector.value;
      const apply = () => {
        const el = textArea.value;
        if (!el) {
          nextTick(apply);
          return;
        }
        el.selectionStart = rememberedStart.value;
        el.selectionEnd = rememberedEnd.value;
        insertCommand(colorSelector_ === "text" ? "color" : "outlinecolor", color2);
      };
      nextTick(apply);
      selectedColor.value = "#000000";
      colorSelector.value = "";
    }
    function insertText(text) {
      const el = textArea.value;
      const val = el.value;
      const selStart = el.selectionStart;
      const selEnd = el.selectionEnd;
      el.value = val.slice(0, selStart) + text + val.slice(selEnd);
      el.selectionStart = el.selectionEnd = selStart + text.length;
      el.focus();
      onValueChanged();
    }
    function insertCommand(command, arg) {
      const el = textArea.value;
      const val = el.value;
      const selStart = el.selectionStart;
      const selEnd = el.selectionEnd;
      const selectedText = val.slice(selStart, selEnd);
      const before = val.slice(0, selStart);
      const after = val.slice(selEnd);
      let commandOpen = command;
      if (arg) {
        commandOpen += "=" + arg;
      }
      el.value = `${before}{${commandOpen}}${selectedText}{/${command}}${after}`;
      el.selectionStart = selStart + commandOpen.length + 2;
      el.selectionEnd = el.selectionStart + selectedText.length;
      el.focus();
      onValueChanged();
    }
    return (_ctx, _cache) => {
      return colorSelector.value ? (openBlock(), createBlock(Color, {
        key: 0,
        modelValue: selectedColor.value,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => selectedColor.value = $event),
        onLeave: applyColor
      }, null, 8, ["modelValue"])) : (openBlock(), createElementBlock("div", {
        key: 1,
        class: normalizeClass({ "text-subpanel": true, vertical: vertical.value })
      }, [
        createBaseVNode("h2", null, toDisplayString(__props.title), 1),
        createBaseVNode("div", _hoisted_1$c, [
          createBaseVNode("button", {
            onClick: _cache[1] || (_cache[1] = ($event) => emit2("leave"))
          }, "OK")
        ]),
        createBaseVNode("div", _hoisted_2$c, [
          createBaseVNode("textarea", {
            ref_key: "textArea",
            ref: textArea,
            value: __props.modelValue,
            onInput: onValueChanged,
            onKeydown: _cache[2] || (_cache[2] = withModifiers(() => {
            }, ["stop"])),
            onKeypress: _cache[3] || (_cache[3] = withModifiers(() => {
            }, ["stop"]))
          }, null, 40, _hoisted_3$8)
        ]),
        error2.value ? (openBlock(), createElementBlock("div", _hoisted_4$8, toDisplayString(error2.value), 1)) : createCommentVNode("", true),
        createBaseVNode("div", _hoisted_5$7, [
          createBaseVNode("button", {
            onClick: _cache[4] || (_cache[4] = ($event) => insertText("\\\\")),
            class: "style-button"
          }, "Insert \\"),
          createBaseVNode("button", {
            onClick: _cache[5] || (_cache[5] = ($event) => insertText("\\{")),
            class: "style-button"
          }, "Insert {"),
          createBaseVNode("button", {
            onClick: _cache[6] || (_cache[6] = ($event) => insertText("\\}")),
            class: "style-button"
          }, "Insert }")
        ]),
        _hoisted_6$7,
        createBaseVNode("div", _hoisted_7$7, [
          createBaseVNode("button", {
            onClick: _cache[7] || (_cache[7] = ($event) => insertCommand("b")),
            class: "style-button",
            style: { "font-weight": "bold" }
          }, " Bold "),
          createBaseVNode("button", {
            onClick: _cache[8] || (_cache[8] = ($event) => insertCommand("i")),
            class: "style-button",
            style: { "font-style": "italic" }
          }, " Italics "),
          createBaseVNode("button", {
            onClick: _cache[9] || (_cache[9] = ($event) => insertCommand("plain")),
            class: "style-button"
          }, " Plain "),
          createBaseVNode("button", {
            onClick: _cache[10] || (_cache[10] = ($event) => insertCommand("edited")),
            class: "style-button edited-style"
          }, " Edited "),
          createBaseVNode("button", {
            onClick: _cache[11] || (_cache[11] = ($event) => insertCommand("k", 2)),
            class: "style-button",
            style: { "letter-spacing": "5px" }
          }, " Kerning ")
        ]),
        createBaseVNode("div", _hoisted_8$6, [
          createBaseVNode("button", {
            onClick: _cache[12] || (_cache[12] = ($event) => insertCommand("alpha", 0.5)),
            class: "style-button"
          }, " Alpha ")
        ]),
        createBaseVNode("div", _hoisted_9$6, [
          createBaseVNode("button", {
            onClick: _cache[13] || (_cache[13] = ($event) => insertCommand("size", 12)),
            class: "style-button",
            style: { "font-size": "20px" }
          }, " Font size "),
          withDirectives(createBaseVNode("select", {
            "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => selectedFont.value = $event),
            class: "style-button"
          }, _hoisted_20$2, 512), [
            [vModelSelect, selectedFont.value]
          ]),
          createBaseVNode("button", {
            onClick: _cache[15] || (_cache[15] = ($event) => selectColor("text")),
            class: "style-button"
          }, " Text color "),
          createBaseVNode("button", {
            onClick: _cache[16] || (_cache[16] = ($event) => selectColor("outline")),
            class: "style-button"
          }, " Outline color ")
        ])
      ], 2));
    };
  }
}));
const text_vue_vue_type_style_index_0_scoped_e63aaa5e_lang = "";
const TextEditor = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__scopeId", "data-v-e63aaa5e"]]);
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __async$7 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _withScopeId$7 = (n) => (pushScopeId("data-v-c01bac78"), n = n(), popScopeId(), n);
const _hoisted_1$b = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("span", { class: "icon material-icons" }, "edit", -1));
const _hoisted_2$b = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("p", { class: "modal-text" }, "Enter the new name", -1));
const _hoisted_3$7 = { class: "modal-text" };
const _hoisted_4$7 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("label", {
  for: "linked_to",
  class: "v-w100"
}, "Linked with:", -1));
const _hoisted_5$6 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("option", { value: "" }, "None", -1));
const _hoisted_6$6 = ["value"];
const _hoisted_7$6 = { class: "input-table v-w100" };
const _hoisted_8$5 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", {
    for: "rotation",
    class: "v-w100"
  }, "Rotation:\xA0\xB0")
], -1));
const _hoisted_9$5 = {
  for: "zoom",
  class: "v-w100"
};
const _hoisted_10$4 = { key: 0 };
const _hoisted_11$4 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", {
    for: "zoom",
    class: "v-w100"
  }, "Scale Y: ")
], -1));
const _hoisted_12$4 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", {
    for: "zoom",
    class: "v-w100"
  }, "Skew X: ")
], -1));
const _hoisted_13$4 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", {
    for: "zoom",
    class: "v-w100"
  }, "Skew Y: ")
], -1));
const _hoisted_14$4 = {
  key: 0,
  colspan: "2"
};
const _hoisted_15$3 = { key: 0 };
const _hoisted_16$3 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "textbox_color" }, "Color:")
], -1));
const _hoisted_17$3 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "namebox_width" }, "Namebox width:")
], -1));
const _hoisted_18$3 = ["placeholder"];
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "object-tool",
  props: {
    object: {
      type: Object,
      required: true
    },
    title: String,
    textHandler: {
      type: Object
    },
    colorHandler: {
      type: Object
    },
    showAltPanel: Boolean
  },
  setup(__props) {
    const store2 = useStore();
    const root = ref(null);
    const props = __props;
    const setable = (prop, message) => genericSetterMerged(
      store2,
      computed(() => props.object),
      message,
      false,
      prop
    );
    setupPanelMixin(root);
    const transformLink = computed({
      get() {
        var _a2;
        return (_a2 = props.object.linkedTo) != null ? _a2 : "";
      },
      set(value) {
        const obj = props.object;
        const link = value === "" ? null : value;
        const currentSceneRenderer = getMainSceneRenderer(store2);
        const objRender = currentSceneRenderer == null ? void 0 : currentSceneRenderer.getLastRenderObject(obj.id);
        const linkRender = link === null ? currentSceneRenderer == null ? void 0 : currentSceneRenderer.getLastRenderObject(obj.linkedTo) : currentSceneRenderer == null ? void 0 : currentSceneRenderer.getLastRenderObject(link);
        try {
          if (!objRender || !linkRender) {
            store2.commit("panels/setLink", {
              panelId: currentPanel.value.id,
              id: obj.id,
              link,
              x: obj.x,
              y: obj.y,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              skewX: obj.skewX,
              skewY: obj.skewY,
              rotation: obj.rotation
            });
          } else if (link == null) {
            store2.commit("panels/setLink", __spreadValues({
              panelId: currentPanel.value.id,
              id: obj.id,
              link
            }, decomposeMatrix(objRender.preparedTransform)));
          } else {
            const inverse = linkRender.preparedTransform.inverse();
            const newTransform = inverse.multiply(objRender.preparedTransform);
            console.log(objRender.preparedTransform);
            console.log(linkRender.preparedTransform.multiply(newTransform));
            console.log(newTransform);
            store2.commit("panels/setLink", __spreadValues({
              panelId: currentPanel.value.id,
              id: obj.id,
              link
            }, decomposeMatrix(newTransform)));
          }
        } catch (e) {
          eventBus$1.fire(new FailureEvent(e.message));
        }
      }
    });
    const imageOptionsOpen = ref(false);
    const modalNameInput = ref("");
    const showRename = ref(false);
    const localColorHandler = ref(null);
    const flip = setable("flip", "panels/setFlip");
    const rotation = setable("rotation", "panels/setRotation");
    const enlargeWhenTalking = setable(
      "enlargeWhenTalking",
      "panels/setEnlargeWhenTalking"
    );
    const canOverflow = computed(() => {
      return "overflow" in props.object;
    });
    const allowZoom = computed(() => {
      return allowScaleModification(props.object);
    });
    const currentPanel = computed(() => {
      return store2.state["panels"].panels[props.object.panelId];
    });
    const linkObjectList = computed(() => {
      const panel = currentPanel.value;
      const ret = [];
      for (const id of [...panel.order, ...panel.onTopOrder]) {
        const obj = panel.objects[id];
        if (obj.label === null || obj === props.object)
          continue;
        ret.push([id, obj.label]);
      }
      return ret;
    });
    const easterEgg = location.search.includes("alex");
    const overflow = computed({
      get() {
        var _a2;
        return (_a2 = props.object.overflow) != null ? _a2 : false;
      },
      set(overflow2) {
        transaction(() => __async$7(this, null, function* () {
          yield store2.commit("panels/setOverflow", {
            id: props.object.id,
            panelId: props.object.panelId,
            overflow: overflow2
          });
        }));
      }
    });
    const preserveRatio = computed({
      get() {
        return props.object.preserveRatio;
      },
      set(preserveRatio2) {
        transaction(() => __async$7(this, null, function* () {
          yield store2.dispatch("panels/setPreserveRatio", {
            id: props.object.id,
            panelId: props.object.panelId,
            preserveRatio: preserveRatio2
          });
        }));
      }
    });
    const nameboxWidth = computed({
      get() {
        const val = props.object.nameboxWidth;
        if (val === null)
          return "";
        return val;
      },
      set(value) {
        const val = typeof value === "string" && value.trim() === "" ? null : parseInt(value + "");
        transaction(() => {
          store2.commit("panels/setObjectNameboxWidth", {
            id: props.object.id,
            panelId: props.object.panelId,
            nameboxWidth: val
          });
        });
      }
    });
    const scaleX = computed({
      get() {
        return props.object.scaleX * 100;
      },
      set(zoom) {
        transaction(() => {
          store2.commit("panels/setObjectScale", {
            id: props.object.id,
            panelId: props.object.panelId,
            scaleX: zoom / 100,
            scaleY: props.object.preserveRatio ? zoom / 100 * props.object.ratio : props.object.scaleY
          });
        });
      }
    });
    const scaleY = computed({
      get() {
        return props.object.scaleY * 100;
      },
      set(zoom) {
        transaction(() => {
          store2.commit("panels/setObjectScale", {
            id: props.object.id,
            panelId: props.object.panelId,
            scaleX: props.object.preserveRatio ? zoom / 100 / props.object.ratio : props.object.scaleX,
            scaleY: zoom / 100
          });
        });
      }
    });
    const skewX = computed({
      get() {
        return props.object.skewX;
      },
      set(skew) {
        transaction(() => {
          store2.commit("panels/setObjectSkew", {
            id: props.object.id,
            panelId: props.object.panelId,
            skewX: skew,
            skewY: props.object.skewY
          });
        });
      }
    });
    const skewY = computed({
      get() {
        return props.object.skewY;
      },
      set(skew) {
        transaction(() => {
          store2.commit("panels/setObjectSkew", {
            id: props.object.id,
            panelId: props.object.panelId,
            skewX: props.object.skewX,
            skewY: skew
          });
        });
      }
    });
    const defaultNameboxWidth = computed(() => getConstants().TextBox.NameboxWidth);
    const finalColorHandler = computed(
      () => localColorHandler.value || props.colorHandler || null
    );
    const hasLabel = computed(() => props.object.label !== null);
    const heading = computed(() => {
      var _a2, _b;
      return (_b = (_a2 = props.object.label) != null ? _a2 : props.title) != null ? _b : "Object";
    });
    const useCustomTextboxColor = computed({
      get() {
        return props.object.textboxColor !== null;
      },
      set(val) {
        transaction(() => {
          store2.commit("panels/setTextboxColor", {
            panelId: props.object.panelId,
            id: props.object.id,
            textboxColor: val ? getConstants().TextBoxCustom.textboxDefaultColor : null
          });
        });
      }
    });
    function copy() {
      transaction(() => __async$7(this, null, function* () {
        yield store2.dispatch("panels/copyObjectToClipboard", {
          panelId: props.object.panelId,
          id: props.object.id
        });
      }));
    }
    function enableNameEdit() {
      var _a2;
      modalNameInput.value = (_a2 = props.object.label) != null ? _a2 : "";
      showRename.value = true;
    }
    function renameOption(option) {
      showRename.value = false;
      if (option === "Apply") {
        transaction(() => {
          store2.commit("panels/setLabel", {
            panelId: props.object.panelId,
            id: props.object.id,
            label: modalNameInput.value
          });
        });
      }
    }
    function selectTextboxColor() {
      localColorHandler.value = {
        title: "Textbox color",
        get: () => props.object.textboxColor,
        set: (color2) => {
          transaction(() => {
            store2.commit("panels/setTextboxColor", {
              panelId: props.object.panelId,
              id: props.object.id,
              textboxColor: color2
            });
          });
        },
        leave: () => {
          localColorHandler.value = null;
        }
      };
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "panel",
        ref_key: "root",
        ref: root
      }, [
        createBaseVNode("h1", {
          style: normalizeStyle$1({ fontStyle: hasLabel.value ? "italic" : "normal" }),
          onClick: enableNameEdit
        }, [
          createTextVNode(toDisplayString(heading.value) + " ", 1),
          _hoisted_1$b
        ], 4),
        (openBlock(), createBlock(Teleport, { to: "#modal-messages" }, [
          showRename.value ? (openBlock(), createBlock(ModalDialog, {
            key: 0,
            options: ["Apply", "Cancel"],
            "no-base-size": "",
            class: "modal-rename",
            onOption: renameOption,
            onLeave: _cache[2] || (_cache[2] = ($event) => renameOption("Cancel"))
          }, {
            default: withCtx(() => [
              _hoisted_2$b,
              createBaseVNode("p", _hoisted_3$7, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => modalNameInput.value = $event),
                  style: { "width": "100%" },
                  onKeydown: _cache[1] || (_cache[1] = withKeys(withModifiers(($event) => renameOption("Apply"), ["prevent", "stop"]), ["enter"]))
                }, null, 544), [
                  [vModelText, modalNameInput.value]
                ])
              ])
            ]),
            _: 1
          })) : createCommentVNode("", true)
        ])),
        __props.textHandler ? (openBlock(), createBlock(TextEditor, {
          key: 0,
          title: __props.textHandler.title,
          modelValue: __props.textHandler.get(),
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => __props.textHandler.set($event)),
          onLeave: _cache[4] || (_cache[4] = ($event) => __props.textHandler.leave())
        }, null, 8, ["title", "modelValue"])) : finalColorHandler.value ? (openBlock(), createBlock(Color, {
          key: 1,
          title: finalColorHandler.value.title,
          modelValue: finalColorHandler.value.get(),
          "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => finalColorHandler.value.set($event)),
          onLeave: _cache[6] || (_cache[6] = ($event) => finalColorHandler.value.leave())
        }, null, 8, ["title", "modelValue"])) : imageOptionsOpen.value ? (openBlock(), createBlock(ImageOptions, {
          key: 2,
          type: "object",
          "panel-id": __props.object.panelId,
          id: __props.object.id,
          onLeave: _cache[7] || (_cache[7] = ($event) => imageOptionsOpen.value = false)
        }, null, 8, ["panel-id", "id"])) : __props.showAltPanel ? renderSlot(_ctx.$slots, "alt-panel", { key: 3 }, void 0, true) : (openBlock(), createElementBlock(Fragment, { key: 4 }, [
          renderSlot(_ctx.$slots, "default", {}, void 0, true),
          canOverflow.value ? (openBlock(), createBlock(_sfc_main$k, {
            key: 0,
            modelValue: overflow.value,
            "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => overflow.value = $event),
            label: "Overflow",
            title: "Allow the text to move outside of the textbox"
          }, null, 8, ["modelValue"])) : createCommentVNode("", true),
          createVNode(PositionAndSize, { obj: __props.object }, null, 8, ["obj"]),
          createVNode(Layers, { object: __props.object }, null, 8, ["object"]),
          createVNode(DFieldset, {
            title: "Transform",
            class: "transforms"
          }, {
            default: withCtx(() => [
              createVNode(_sfc_main$k, {
                modelValue: unref(flip),
                "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => isRef(flip) ? flip.value = $event : null),
                label: "Flip?"
              }, null, 8, ["modelValue"]),
              _hoisted_4$7,
              withDirectives(createBaseVNode("select", {
                id: "linked_to",
                class: "v-w100",
                "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => transformLink.value = $event),
                onKeydown: _cache[11] || (_cache[11] = withModifiers(() => {
                }, ["stop"]))
              }, [
                _hoisted_5$6,
                (openBlock(true), createElementBlock(Fragment, null, renderList(linkObjectList.value, ([id, label]) => {
                  return openBlock(), createElementBlock("option", {
                    key: id,
                    value: id
                  }, toDisplayString(label), 9, _hoisted_6$6);
                }), 128))
              ], 544), [
                [vModelSelect, transformLink.value]
              ]),
              createBaseVNode("table", _hoisted_7$6, [
                createBaseVNode("tr", null, [
                  _hoisted_8$5,
                  createBaseVNode("td", null, [
                    withDirectives(createBaseVNode("input", {
                      id: "rotation",
                      class: "smol v-w100",
                      type: "number",
                      "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => isRef(rotation) ? rotation.value = $event : null),
                      onKeydown: _cache[13] || (_cache[13] = withModifiers(() => {
                      }, ["stop"]))
                    }, null, 544), [
                      [vModelText, unref(rotation)]
                    ])
                  ])
                ]),
                allowZoom.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                  createBaseVNode("tr", null, [
                    createBaseVNode("td", null, [
                      createBaseVNode("label", _hoisted_9$5, toDisplayString(unref(easterEgg) ? "Zoom" : "Scale X"), 1)
                    ]),
                    createBaseVNode("td", null, [
                      withDirectives(createBaseVNode("input", {
                        id: "zoom",
                        type: "number",
                        class: "smol v-w100",
                        step: "1",
                        min: "0",
                        "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => scaleX.value = $event),
                        onKeydown: _cache[15] || (_cache[15] = withModifiers(() => {
                        }, ["stop"]))
                      }, null, 544), [
                        [vModelText, scaleX.value]
                      ])
                    ])
                  ]),
                  !unref(easterEgg) ? (openBlock(), createElementBlock("tr", _hoisted_10$4, [
                    _hoisted_11$4,
                    createBaseVNode("td", null, [
                      withDirectives(createBaseVNode("input", {
                        id: "zoom",
                        type: "number",
                        class: "smol v-w100",
                        step: "1",
                        min: "0",
                        "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => scaleY.value = $event),
                        onKeydown: _cache[17] || (_cache[17] = withModifiers(() => {
                        }, ["stop"]))
                      }, null, 544), [
                        [vModelText, scaleY.value]
                      ])
                    ])
                  ])) : createCommentVNode("", true)
                ], 64)) : createCommentVNode("", true),
                createBaseVNode("tr", null, [
                  _hoisted_12$4,
                  createBaseVNode("td", null, [
                    withDirectives(createBaseVNode("input", {
                      id: "zoom",
                      type: "number",
                      class: "smol v-w100",
                      step: "1",
                      "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => skewX.value = $event),
                      onKeydown: _cache[19] || (_cache[19] = withModifiers(() => {
                      }, ["stop"]))
                    }, null, 544), [
                      [vModelText, skewX.value]
                    ])
                  ])
                ]),
                createBaseVNode("tr", null, [
                  _hoisted_13$4,
                  createBaseVNode("td", null, [
                    withDirectives(createBaseVNode("input", {
                      id: "zoom",
                      type: "number",
                      class: "smol v-w100",
                      step: "1",
                      "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => skewY.value = $event),
                      onKeydown: _cache[21] || (_cache[21] = withModifiers(() => {
                      }, ["stop"]))
                    }, null, 544), [
                      [vModelText, skewY.value]
                    ])
                  ])
                ]),
                createBaseVNode("tr", null, [
                  !unref(easterEgg) ? (openBlock(), createElementBlock("td", _hoisted_14$4, [
                    createVNode(_sfc_main$k, {
                      modelValue: preserveRatio.value,
                      "onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => preserveRatio.value = $event),
                      label: "Lock scale ratio?"
                    }, null, 8, ["modelValue"])
                  ])) : createCommentVNode("", true)
                ])
              ]),
              renderSlot(_ctx.$slots, "transform", {}, void 0, true)
            ]),
            _: 3
          }),
          renderSlot(_ctx.$slots, "options", {}, void 0, true),
          hasLabel.value ? (openBlock(), createBlock(DFieldset, {
            key: 1,
            title: "Textbox settings"
          }, {
            default: withCtx(() => {
              var _a2;
              return [
                __props.object.type === "character" || __props.object.type === "sprite" ? (openBlock(), createBlock(_sfc_main$k, {
                  key: 0,
                  label: "Enlarge when talking",
                  modelValue: unref(enlargeWhenTalking),
                  "onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => isRef(enlargeWhenTalking) ? enlargeWhenTalking.value = $event : null)
                }, null, 8, ["modelValue"])) : createCommentVNode("", true),
                createVNode(_sfc_main$k, {
                  label: "Own textbox color",
                  modelValue: useCustomTextboxColor.value,
                  "onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => useCustomTextboxColor.value = $event)
                }, null, 8, ["modelValue"]),
                createBaseVNode("table", null, [
                  useCustomTextboxColor.value ? (openBlock(), createElementBlock("tr", _hoisted_15$3, [
                    _hoisted_16$3,
                    createBaseVNode("td", null, [
                      createBaseVNode("button", {
                        id: "textbox_color",
                        class: "color-button",
                        style: normalizeStyle$1({ background: (_a2 = __props.object.textboxColor) != null ? _a2 : "" }),
                        onClick: selectTextboxColor
                      }, null, 4)
                    ])
                  ])) : createCommentVNode("", true),
                  createBaseVNode("tr", null, [
                    _hoisted_17$3,
                    createBaseVNode("td", null, [
                      withDirectives(createBaseVNode("input", {
                        id: "namebox_width",
                        type: "number",
                        placeholder: defaultNameboxWidth.value + "",
                        "onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => nameboxWidth.value = $event)
                      }, null, 8, _hoisted_18$3), [
                        [
                          vModelText,
                          nameboxWidth.value,
                          void 0,
                          { lazy: true }
                        ]
                      ])
                    ])
                  ])
                ])
              ];
            }),
            _: 1
          })) : createCommentVNode("", true),
          createBaseVNode("button", {
            onClick: _cache[26] || (_cache[26] = ($event) => imageOptionsOpen.value = true)
          }, "Image options"),
          createBaseVNode("button", {
            class: "v-bt0",
            onClick: copy
          }, "Copy"),
          createVNode(_sfc_main$f, {
            class: "v-bt0",
            obj: __props.object
          }, null, 8, ["obj"])
        ], 64))
      ], 512);
    };
  }
});
const objectTool_vue_vue_type_style_index_0_scoped_c01bac78_lang = "";
const ObjectTool = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-c01bac78"]]);
var __async$6 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _hoisted_1$a = { class: "warning" };
const _hoisted_2$a = { style: { "word-wrap": "break-word" } };
const _hoisted_3$6 = { class: "button-tbl" };
const _hoisted_4$6 = { key: 0 };
const _hoisted_5$5 = { class: "arrow-col" };
const _hoisted_6$5 = { class: "arrow-col" };
const _hoisted_7$5 = { key: 1 };
const _hoisted_8$4 = { class: "arrow-col" };
const _hoisted_9$4 = { class: "arrow-col" };
const _hoisted_10$3 = { class: "arrow-col" };
const _hoisted_11$3 = ["onClick"];
const _hoisted_12$3 = ["onClick"];
const _hoisted_13$3 = { class: "arrow-col" };
const _hoisted_14$3 = ["onClick"];
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "character",
  setup(__props) {
    const store2 = useStore();
    const root = ref(null);
    const missingHeadUpload = ref(null);
    setupPanelMixin(root);
    const panelForParts = ref(null);
    const currentPanel = computed(
      () => store2.state.panels.panels[store2.state.panels.currentPanel]
    );
    const selection = computed(() => store2.state.ui.selection);
    const object = computed(() => {
      const obj = currentPanel.value.objects[selection.value];
      if (obj.type !== "character")
        return void 0;
      return obj;
    });
    const closeUp = genericSetterMerged(
      store2,
      object,
      "panels/setClose",
      false,
      "close"
    );
    const missingHead = computed(() => {
      const obj = object.value;
      const heads = getHeads(charData.value, obj);
      if (!heads)
        return null;
      for (const asset of heads.variants) {
        const url = getAAssetUrl(asset[0], false);
        if (url.startsWith("uploads:"))
          return url.substring(8);
      }
      return null;
    });
    const charData = computed(() => getData(store2, object.value));
    const label = computed(() => {
      var _a2;
      return (_a2 = charData.value.label) != null ? _a2 : "";
    });
    const parts = computed(() => getParts(charData.value, object.value));
    const hasMultipleStyles = computed(
      () => charData.value.styleGroups[object.value.styleGroupId].styles.length > 1 || charData.value.styleGroups.length > 1
    );
    const hasMultiplePoses = computed(() => {
      const styleGroup = charData.value.styleGroups[object.value.styleGroupId];
      const style = styleGroup.styles[object.value.styleId];
      return style.poses.length > 1;
    });
    function reuploadHead() {
      missingHeadUpload.value.click();
    }
    function onMissingHeadFileUpload(_e) {
      return __async$6(this, null, function* () {
        const uploadInput = missingHeadUpload.value;
        if (!uploadInput.files)
          return;
        if (uploadInput.files.length !== 1) {
          console.error("More than one file uploaded!");
          return;
        }
        const file = uploadInput.files[0];
        yield transaction(() => __async$6(this, null, function* () {
          const url = URL.createObjectURL(file);
          yield store2.dispatch("uploadUrls/add", {
            name: missingHead.value,
            url
          });
        }));
      });
    }
    function seekPose(delta) {
      transaction(() => __async$6(this, null, function* () {
        yield store2.dispatch("panels/seekPose", {
          id: object.value.id,
          panelId: object.value.panelId,
          delta
        });
      }));
    }
    function seekStyle(delta) {
      transaction(() => __async$6(this, null, function* () {
        yield store2.dispatch("panels/seekStyle", {
          id: object.value.id,
          panelId: object.value.panelId,
          delta
        });
      }));
    }
    function seekPart(part, delta) {
      transaction(() => __async$6(this, null, function* () {
        yield store2.dispatch("panels/seekPart", {
          id: object.value.id,
          panelId: object.value.panelId,
          delta,
          part
        });
      }));
    }
    function captialize(str) {
      return str.charAt(0).toUpperCase() + str.substring(1);
    }
    watch(
      () => selection.value,
      () => {
        panelForParts.value = null;
      }
    );
    return (_ctx, _cache) => {
      return openBlock(), createBlock(ObjectTool, {
        ref_key: "root",
        ref: root,
        object: object.value,
        title: label.value,
        showAltPanel: !!panelForParts.value
      }, {
        "alt-panel": withCtx(() => [
          panelForParts.value ? (openBlock(), createBlock(Parts, {
            key: 0,
            character: object.value,
            part: panelForParts.value,
            onLeave: _cache[0] || (_cache[0] = ($event) => panelForParts.value = null),
            onShowDialog: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("show-dialog", $event)),
            onShowExpressionDialog: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("show-expression-dialog", $event))
          }, null, 8, ["character", "part"])) : createCommentVNode("", true)
        ]),
        default: withCtx(() => [
          missingHead.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
            createBaseVNode("p", _hoisted_1$a, [
              createTextVNode(" MISSING Head sprite! Click below to re-upload "),
              createBaseVNode("span", _hoisted_2$a, '"' + toDisplayString(missingHead.value) + '"', 1),
              createTextVNode(". ")
            ]),
            createBaseVNode("button", {
              onClick: _cache[3] || (_cache[3] = ($event) => reuploadHead())
            }, "Re-Upload"),
            createBaseVNode("input", {
              type: "file",
              ref_key: "missingHeadUpload",
              ref: missingHeadUpload,
              onChange: onMissingHeadFileUpload
            }, null, 544)
          ], 64)) : createCommentVNode("", true),
          hasMultiplePoses.value || parts.value.length > 0 || hasMultipleStyles.value ? (openBlock(), createBlock(DFieldset, {
            key: 1,
            class: "pose-list",
            title: "Pose:"
          }, {
            default: withCtx(() => [
              createBaseVNode("table", _hoisted_3$6, [
                createBaseVNode("tbody", null, [
                  hasMultipleStyles.value ? (openBlock(), createElementBlock("tr", _hoisted_4$6, [
                    createBaseVNode("td", _hoisted_5$5, [
                      createBaseVNode("button", {
                        onClick: _cache[4] || (_cache[4] = ($event) => seekStyle(-1))
                      }, "<")
                    ]),
                    createBaseVNode("td", null, [
                      createBaseVNode("button", {
                        class: "middle-button",
                        onClick: _cache[5] || (_cache[5] = ($event) => panelForParts.value = "style")
                      }, " Style ")
                    ]),
                    createBaseVNode("td", _hoisted_6$5, [
                      createBaseVNode("button", {
                        onClick: _cache[6] || (_cache[6] = ($event) => seekStyle(1))
                      }, ">")
                    ])
                  ])) : createCommentVNode("", true),
                  hasMultiplePoses.value ? (openBlock(), createElementBlock("tr", _hoisted_7$5, [
                    createBaseVNode("td", _hoisted_8$4, [
                      createBaseVNode("button", {
                        onClick: _cache[7] || (_cache[7] = ($event) => seekPose(-1))
                      }, "<")
                    ]),
                    createBaseVNode("td", null, [
                      createBaseVNode("button", {
                        class: "middle-button",
                        onClick: _cache[8] || (_cache[8] = ($event) => panelForParts.value = "pose")
                      }, " Pose ")
                    ]),
                    createBaseVNode("td", _hoisted_9$4, [
                      createBaseVNode("button", {
                        onClick: _cache[9] || (_cache[9] = ($event) => seekPose(1))
                      }, ">")
                    ])
                  ])) : createCommentVNode("", true),
                  (openBlock(true), createElementBlock(Fragment, null, renderList(parts.value, (part) => {
                    return openBlock(), createElementBlock("tr", { key: part }, [
                      createBaseVNode("td", _hoisted_10$3, [
                        createBaseVNode("button", {
                          onClick: ($event) => seekPart(part, -1)
                        }, "<", 8, _hoisted_11$3)
                      ]),
                      createBaseVNode("td", null, [
                        createBaseVNode("button", {
                          class: "middle-button",
                          onClick: ($event) => panelForParts.value = part
                        }, toDisplayString(captialize(part)), 9, _hoisted_12$3)
                      ]),
                      createBaseVNode("td", _hoisted_13$3, [
                        createBaseVNode("button", {
                          onClick: ($event) => seekPart(part, 1)
                        }, ">", 8, _hoisted_14$3)
                      ])
                    ]);
                  }), 128))
                ])
              ])
            ]),
            _: 1
          })) : createCommentVNode("", true)
        ]),
        transform: withCtx(() => [
          createVNode(_sfc_main$k, {
            modelValue: unref(closeUp),
            "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => isRef(closeUp) ? closeUp.value = $event : null),
            label: "Close up?"
          }, null, 8, ["modelValue"])
        ]),
        _: 1
      }, 8, ["object", "title", "showAltPanel"]);
    };
  }
});
const character_vue_vue_type_style_index_0_scoped_397a50d2_lang = "";
const CharacterPanel = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-397a50d2"]]);
var __async$5 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _withScopeId$6 = (n) => (pushScopeId("data-v-50b44756"), n = n(), popScopeId(), n);
const _hoisted_1$9 = ["onClick"];
const _hoisted_2$9 = /* @__PURE__ */ _withScopeId$6(() => /* @__PURE__ */ createBaseVNode("tr", null, [
  /* @__PURE__ */ createBaseVNode("td", { colspan: "2" }, [
    /* @__PURE__ */ createBaseVNode("label", { for: "choice-button-input" }, "Text")
  ])
], -1));
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "choice",
  setup(__props) {
    const store2 = useStore();
    const root = ref(null);
    setupPanelMixin(root);
    const currentPanel = computed(() => {
      return store2.state.panels.panels[store2.state.panels.currentPanel];
    });
    const object = computed(() => {
      const obj = currentPanel.value.objects[store2.state.ui.selection];
      if (obj.type !== "choice")
        return void 0;
      return obj;
    });
    const setable = (prop, message) => genericSetterMerged(store2, object, message, false, prop);
    const currentIdx = ref(0);
    const textEditor = ref(false);
    const autoWrap = setable("autoWrap", "panels/setAutoWrapping");
    const buttonText = simpleButtonSettable("text");
    const buttons = computed(() => {
      return object.value.choices;
    });
    const textHandler = computed(() => {
      if (!textEditor.value)
        return void 0;
      return {
        title: "Text",
        get: () => {
          return buttonText.value;
        },
        set: (text) => {
          buttonText.value = text;
        },
        leave: () => {
          textEditor.value = false;
        }
      };
    });
    function select(idx) {
      currentIdx.value = idx;
    }
    function addChoice() {
      transaction(() => __async$5(this, null, function* () {
        yield store2.dispatch("panels/addChoice", {
          id: object.value.id,
          panelId: object.value.panelId,
          text: ""
        });
      }));
    }
    function removeChoice() {
      transaction(() => __async$5(this, null, function* () {
        if (currentIdx.value === object.value.choices.length - 1 && currentIdx.value > 0) {
          select(currentIdx.value - 1);
        }
        yield store2.dispatch("panels/removeChoice", {
          id: object.value.id,
          panelId: object.value.panelId,
          choiceIdx: currentIdx.value
        });
      }));
    }
    function simpleButtonSettable(key) {
      return computed({
        get() {
          return object.value.choices[currentIdx.value][key];
        },
        set(val) {
          transaction(() => {
            store2.commit("panels/setChoiceProperty", {
              id: object.value.id,
              panelId: object.value.panelId,
              choiceIdx: currentIdx.value,
              key,
              value: val
            });
          });
        }
      });
    }
    return (_ctx, _cache) => {
      return openBlock(), createBlock(ObjectTool, {
        ref_key: "root",
        ref: root,
        object: object.value,
        title: "Choice",
        textHandler: textHandler.value
      }, {
        default: withCtx(() => [
          createVNode(DFieldset, {
            class: "buttons",
            title: "Buttons:"
          }, {
            default: withCtx(() => [
              createVNode(DFlow, {
                maxSize: "100%",
                direction: "vertical",
                noWraping: ""
              }, {
                default: withCtx(() => [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(buttons.value, (button, btnIdx) => {
                    return openBlock(), createElementBlock("div", {
                      class: normalizeClass({ choiceBtn: true, active: btnIdx === currentIdx.value }),
                      key: btnIdx,
                      onClick: ($event) => select(btnIdx)
                    }, toDisplayString(button.text.trim() === "" ? "[Empty]" : button.text), 11, _hoisted_1$9);
                  }), 128))
                ]),
                _: 1
              })
            ]),
            _: 1
          }),
          createVNode(DFieldset, {
            class: "current_button",
            title: "Current button:"
          }, {
            default: withCtx(() => [
              createBaseVNode("table", null, [
                _hoisted_2$9,
                createBaseVNode("tr", null, [
                  createBaseVNode("td", null, [
                    withDirectives(createBaseVNode("input", {
                      id: "choice-button-input",
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(buttonText) ? buttonText.value = $event : null),
                      onKeydown: _cache[1] || (_cache[1] = withModifiers(() => {
                      }, ["stop"]))
                    }, null, 544), [
                      [vModelText, unref(buttonText)]
                    ])
                  ]),
                  createBaseVNode("td", null, [
                    createBaseVNode("button", {
                      onClick: _cache[2] || (_cache[2] = ($event) => textEditor.value = true)
                    }, "...")
                  ])
                ])
              ])
            ]),
            _: 1
          }),
          createBaseVNode("button", { onClick: addChoice }, "Add"),
          createBaseVNode("button", { onClick: removeChoice }, "Remove"),
          createVNode(_sfc_main$k, {
            label: "Auto line wrap?",
            modelValue: unref(autoWrap),
            "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => isRef(autoWrap) ? autoWrap.value = $event : null)
          }, null, 8, ["modelValue"])
        ]),
        _: 1
      }, 8, ["object", "textHandler"]);
    };
  }
});
const choice_vue_vue_type_style_index_0_scoped_50b44756_lang = "";
const ChoicePanel = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-50b44756"]]);
const _withScopeId$5 = (n) => (pushScopeId("data-v-e852d4f2"), n = n(), popScopeId(), n);
const _hoisted_1$8 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("h1", null, "Help and Credits", -1));
const _hoisted_2$8 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, " All assets used are IP of Team Salvato and created by them, unless noted otherwise. ", -1));
const _hoisted_3$5 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, [
  /* @__PURE__ */ createTextVNode(" Doki Doki Dialog Generator developed by EDave64 "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode("Based on gemdude46's DDLC Shitpost generator ")
], -1));
const _hoisted_4$5 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, [
  /* @__PURE__ */ createTextVNode(" MC Sprite by Childish-N "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode("MC Casual Sprite by SlightlySimple "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode("MC Chibi by SlightlySimple ")
], -1));
const _hoisted_5$4 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, [
  /* @__PURE__ */ createTextVNode(" MC Chad Sprite by Cylent-Nite "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode("MC Chad Poses and expressions by SlightlySimple "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode("MC Chad Poses and chibi by Meddy-sin ")
], -1));
const _hoisted_6$4 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, [
  /* @__PURE__ */ createTextVNode(" FeMC Sprite by Meddy-sin "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode("FeMC Casual Sprite by SlightlySimple ")
], -1));
const _hoisted_7$4 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, "Amy Sprite by Meddy-sin and SlightlySimple", -1));
const _hoisted_8$3 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, "Special thanks to SlightlySimple for testing and technical help", -1));
const _hoisted_9$3 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, " Atlas421, T-Rex Harris, smearglexd and Tactical Cupcakes for suggestions and testing ", -1));
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "credits",
  setup(__props) {
    const root = ref(null);
    setupPanelMixin(root);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "panel",
        ref_key: "root",
        ref: root
      }, [
        _hoisted_1$8,
        createVNode(_sfc_main$n, {
          class: "btn",
          to: "wiki://Dokumentation"
        }, {
          default: withCtx(() => [
            createTextVNode("Help")
          ]),
          _: 1
        }),
        createVNode(_sfc_main$n, {
          class: "btn",
          to: "github://"
        }, {
          default: withCtx(() => [
            createTextVNode("Fork me on GitHub")
          ]),
          _: 1
        }),
        createVNode(_sfc_main$n, {
          class: "btn",
          to: "wiki://Privacy Statement"
        }, {
          default: withCtx(() => [
            createTextVNode("Privacy Statement")
          ]),
          _: 1
        }),
        _hoisted_2$8,
        _hoisted_3$5,
        createBaseVNode("p", null, [
          createTextVNode(" Unused House Background by "),
          createVNode(_sfc_main$n, { to: "https://www.deviantart.com/fatelogic/art/VN-Background-Practice-295671161" }, {
            default: withCtx(() => [
              createTextVNode(" Fatelogic ")
            ]),
            _: 1
          })
        ]),
        createBaseVNode("p", null, [
          createTextVNode(" Aller Font by "),
          createVNode(_sfc_main$n, { to: "https://www.daltonmaag.com/library/aller" }, {
            default: withCtx(() => [
              createTextVNode("Dalton Maag Ltd")
            ]),
            _: 1
          })
        ]),
        createBaseVNode("p", null, [
          createTextVNode(" Riffic Bold Font by "),
          createVNode(_sfc_main$n, { to: "https://www.fontspring.com/fonts/inky-type/riffic" }, {
            default: withCtx(() => [
              createTextVNode("InkyType")
            ]),
            _: 1
          })
        ]),
        createBaseVNode("p", null, [
          createTextVNode(" Verily Serif Mono Font by "),
          createVNode(_sfc_main$n, { to: "https://www.dafont.com/verily-serif-mono.font" }, {
            default: withCtx(() => [
              createTextVNode("Stephen G. Hartke")
            ]),
            _: 1
          })
        ]),
        createBaseVNode("p", null, [
          createTextVNode(" F25 Bank Printer Font by "),
          createVNode(_sfc_main$n, { to: "https://www.dafont.com/f25-bank-printer.font" }, {
            default: withCtx(() => [
              createTextVNode("F25 Digital Typeface Design")
            ]),
            _: 1
          })
        ]),
        createBaseVNode("p", null, [
          createTextVNode(" Journal Font by "),
          createVNode(_sfc_main$n, { to: "https://www.dafont.com/journal.font" }, {
            default: withCtx(() => [
              createTextVNode("Fontourist")
            ]),
            _: 1
          })
        ]),
        createBaseVNode("p", null, [
          createTextVNode(" Hashtag Font by "),
          createVNode(_sfc_main$n, { to: "https://www.dafont.com/hashtag.font" }, {
            default: withCtx(() => [
              createTextVNode(" TitanVex")
            ]),
            _: 1
          })
        ]),
        createBaseVNode("p", null, [
          createTextVNode(" JP Hand Slanted Font by "),
          createVNode(_sfc_main$n, { to: "https://www.dafont.com/jp-hand-slanted.font" }, {
            default: withCtx(() => [
              createTextVNode("Jonathan Paterson")
            ]),
            _: 1
          })
        ]),
        createBaseVNode("p", null, [
          createTextVNode(" As I Lay Dying Font by "),
          createVNode(_sfc_main$n, { to: "https://www.dafont.com/as-i-lay-dying.font" }, {
            default: withCtx(() => [
              createTextVNode("Moises Esqueda")
            ]),
            _: 1
          })
        ]),
        createBaseVNode("p", null, [
          createTextVNode(" Damagrafik Script Font by "),
          createVNode(_sfc_main$n, { to: "https://www.dafont.com/damagrafik-script.font" }, {
            default: withCtx(() => [
              createTextVNode("Davide Terenzi")
            ]),
            _: 1
          })
        ]),
        createBaseVNode("p", null, [
          createTextVNode(" Ammy's Handwriting Font by "),
          createVNode(_sfc_main$n, { to: "https://www.dafont.com/ammys-handwriting.font" }, {
            default: withCtx(() => [
              createTextVNode("Ammy K.")
            ]),
            _: 1
          })
        ]),
        createBaseVNode("p", null, [
          createTextVNode(" Halogen Font by "),
          createVNode(_sfc_main$n, { to: "https://www.dafont.com/halogen.font" }, {
            default: withCtx(() => [
              createTextVNode("JLH Fonts")
            ]),
            _: 1
          })
        ]),
        _hoisted_4$5,
        createBaseVNode("p", null, [
          createVNode(_sfc_main$n, { to: "https://www.reddit.com/ofkg59" }, {
            default: withCtx(() => [
              createTextVNode("Concept MC")
            ]),
            _: 1
          }),
          createTextVNode(" by StormBlazed76, "),
          createVNode(_sfc_main$n, { to: "https://www.reddit.com/og6shh" }, {
            default: withCtx(() => [
              createTextVNode("red")
            ]),
            _: 1
          }),
          createTextVNode(" and "),
          createVNode(_sfc_main$n, { to: "https://www.reddit.com/oft3vb" }, {
            default: withCtx(() => [
              createTextVNode("yellow")
            ]),
            _: 1
          }),
          createTextVNode(" eyes by YinuS_WinneR, "),
          createVNode(_sfc_main$n, { to: "https://www.reddit.com/ofof3o" }, {
            default: withCtx(() => [
              createTextVNode("chibi")
            ]),
            _: 1
          }),
          createTextVNode(" by Hadrosaur838 ")
        ]),
        _hoisted_5$4,
        _hoisted_6$4,
        createBaseVNode("p", null, [
          createVNode(_sfc_main$n, { to: "https://www.reddit.com/oizaow" }, {
            default: withCtx(() => [
              createTextVNode("Concept FeMC")
            ]),
            _: 1
          }),
          createTextVNode(" by ShidoDraws, "),
          createVNode(_sfc_main$n, { to: "https://www.reddit.com/oosuxu" }, {
            default: withCtx(() => [
              createTextVNode("additional poses, expressions and chibi")
            ]),
            _: 1
          }),
          createTextVNode(" by SlightlySimple ")
        ]),
        _hoisted_7$4,
        _hoisted_8$3,
        _hoisted_9$3
      ], 512);
    };
  }
});
const credits_vue_vue_type_style_index_0_scoped_e852d4f2_lang = "";
const CreditsPanel = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-e852d4f2"]]);
const _withScopeId$4 = (n) => (pushScopeId("data-v-e3fa2c53"), n = n(), popScopeId(), n);
const _hoisted_1$7 = { id: "notification_text_wrapper" };
const _hoisted_2$7 = /* @__PURE__ */ _withScopeId$4(() => /* @__PURE__ */ createBaseVNode("label", { for: "notification_text" }, "Text:", -1));
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "notification",
  setup(__props) {
    const store2 = useStore();
    const root = ref(null);
    setupPanelMixin(root);
    const currentPanel = computed(() => {
      return store2.state.panels.panels[store2.state.panels.currentPanel];
    });
    const object = computed(() => {
      const obj = currentPanel.value.objects[store2.state.ui.selection];
      if (obj.type !== "notification")
        return void 0;
      return obj;
    });
    const setableN = (key) => genericSetterSplit(
      store2,
      object,
      "panels/setNotificationProperty",
      false,
      key
    );
    const text = setableN("text");
    const renderBackdrop = setableN("backdrop");
    const textEditor = ref(false);
    const textHandler = computed(() => {
      if (!textEditor.value)
        return void 0;
      return {
        title: "Text",
        get: () => {
          return text.value;
        },
        set: (val) => {
          text.value = val;
        },
        leave: () => {
          textEditor.value = false;
        }
      };
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(ObjectTool, {
        ref_key: "root",
        ref: root,
        object: object.value,
        title: "Notification",
        textHandler: textHandler.value
      }, {
        default: withCtx(() => [
          createBaseVNode("div", _hoisted_1$7, [
            _hoisted_2$7,
            withDirectives(createBaseVNode("textarea", {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(text) ? text.value = $event : null),
              id: "notification_text",
              onKeydown: _cache[1] || (_cache[1] = withModifiers(() => {
              }, ["stop"]))
            }, null, 544), [
              [vModelText, unref(text)]
            ]),
            createBaseVNode("button", {
              onClick: _cache[2] || (_cache[2] = ($event) => textEditor.value = true)
            }, "Formatting")
          ])
        ]),
        options: withCtx(() => [
          createVNode(_sfc_main$k, {
            modelValue: unref(renderBackdrop),
            "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => isRef(renderBackdrop) ? renderBackdrop.value = $event : null),
            label: "Show backdrop?"
          }, null, 8, ["modelValue"])
        ]),
        _: 1
      }, 8, ["object", "textHandler"]);
    };
  }
});
const notification_vue_vue_type_style_index_0_scoped_e3fa2c53_lang = "";
const NotificationPanel = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-e3fa2c53"]]);
var __async$4 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _withScopeId$3 = (n) => (pushScopeId("data-v-74b7d9e5"), n = n(), popScopeId(), n);
const _hoisted_1$6 = /* @__PURE__ */ _withScopeId$3(() => /* @__PURE__ */ createBaseVNode("h1", null, "Panels", -1));
const _hoisted_2$6 = ["onClick", "onKeydown"];
const _hoisted_3$4 = { class: "panel_text" };
const _hoisted_4$4 = { class: "panel_nr" };
const _hoisted_5$3 = { class: "column" };
const _hoisted_6$3 = { class: "v-w100" };
const _hoisted_7$3 = /* @__PURE__ */ _withScopeId$3(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "export_format" }, "Format")
], -1));
const _hoisted_8$2 = /* @__PURE__ */ _withScopeId$3(() => /* @__PURE__ */ createBaseVNode("option", { value: "image/png" }, "PNG (lossless)", -1));
const _hoisted_9$2 = {
  key: 0,
  value: "image/webp"
};
const _hoisted_10$2 = {
  key: 1,
  value: "image/heif"
};
const _hoisted_11$2 = /* @__PURE__ */ _withScopeId$3(() => /* @__PURE__ */ createBaseVNode("option", { value: "image/jpeg" }, "JPEG (lossy)", -1));
const _hoisted_12$2 = { key: 0 };
const _hoisted_13$2 = /* @__PURE__ */ _withScopeId$3(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "export_quality" }, "Quality:")
], -1));
const _hoisted_14$2 = { for: "export_ppi" };
const _hoisted_15$2 = { key: 0 };
const _hoisted_16$2 = /* @__PURE__ */ _withScopeId$3(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_17$2 = { for: "export_pages" };
const _hoisted_18$2 = { key: 0 };
const _hoisted_19$1 = /* @__PURE__ */ _withScopeId$3(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_20$1 = { colspan: "2" };
const _hoisted_21$1 = { class: "column" };
const qualityFactor = 100;
const defaultQuality = 90;
const qualityWarningThreshold = 70;
const thumbnailFactor = 1 / 4;
const thumbnailQuality = 0.5;
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "panels",
  setup(__props) {
    const store2 = useStore();
    const root = ref(null);
    const { vertical, getRoot } = setupPanelMixin(root);
    const ppi = ref(envX.supports.limitedCanvasSpace ? 10 : 0);
    const pages = ref("");
    const format = ref("image/png");
    const quality = ref(defaultQuality);
    const imageOptions = ref(false);
    const loadUpload = ref(null);
    const baseConst = getConstants().Base;
    const currentPanel = computed(
      () => store2.state.panels.panels[store2.state.panels.currentPanel]
    );
    const isLossy = computed(() => format.value !== "image/png");
    const canDeletePanel = computed(() => panelButtons.value.length > 1);
    function emptyStringInInt(v) {
      if (v === "")
        return true;
      return false;
    }
    const webpSupport = ref(false);
    const heifSupport = ref(false);
    Promise.allSettled([isWebPSupported(), isHeifSupported()]).then(
      ([webp, heif]) => {
        if (webp.status === "fulfilled")
          webpSupport.value = webp.value;
        if (heif.status === "fulfilled")
          heifSupport.value = heif.value;
      }
    );
    const canMoveAhead = computed(() => {
      const panelOrder = store2.state.panels.panelOrder;
      const idx = panelOrder.indexOf(currentPanel.value.id);
      return idx > 0;
    });
    const canMoveBehind = computed(() => {
      const panelOrder = store2.state.panels.panelOrder;
      const idx = panelOrder.indexOf(currentPanel.value.id);
      return idx < panelOrder.length - 1;
    });
    const panelButtons = computed(() => {
      const panelOrder = store2.state.panels.panelOrder;
      return panelOrder.map((id) => {
        const panel = store2.state.panels.panels[id];
        const objectOrders = store2.state.panels.panels[id];
        const txtBox = [...objectOrders.order, ...objectOrders.onTopOrder].map((objId) => store2.state.panels.panels[id].objects[objId]).map(extractObjectText);
        return {
          id,
          image: panel.lastRender,
          text: txtBox.reduce(
            (acc, current) => acc.length > current.length ? acc : current,
            ""
          )
        };
      });
    });
    function extractObjectText(obj) {
      switch (obj.type) {
        case "textBox":
          return obj.text;
        case "notification":
          return obj.text;
        case "poem":
          return obj.text;
        case "choice":
          return obj.choices.map((choice) => `[${choice.text}]`).join("\n");
      }
      return "";
    }
    function moveFocusToActivePanel() {
      const active = getRoot().querySelector(".panel_button.active");
      if (active) {
        scrollIntoView(active);
      }
    }
    function scrollIntoView(ele) {
      const parent = ele.parentElement.parentElement;
      if (store2.state.ui.vertical) {
        parent.scrollTop = ele.offsetTop - parent.clientHeight / 2;
        parent.scrollLeft = 0;
      } else {
        parent.scrollLeft = ele.offsetLeft - parent.clientWidth / 2;
        parent.scrollTop = 0;
      }
    }
    onMounted(() => {
      moveFocusToActivePanel();
    });
    function getDownloadFilenamePrefix() {
      const date = new Date();
      return `cd-${[
        date.getFullYear(),
        `${date.getMonth() + 1}`.padStart(2, "0"),
        `${date.getDate()}`.padStart(2, "0"),
        `${date.getHours()}`.padStart(2, "0"),
        `${date.getMinutes()}`.padStart(2, "0"),
        `${date.getSeconds()}`.padStart(2, "0")
      ].join("-")}`;
    }
    function download() {
      return __async$4(this, null, function* () {
        yield safeAsync("export image", () => __async$4(this, null, function* () {
          const distribution = getPanelDistibution();
          const extension = format.value.split("/")[1];
          const format_ = format.value;
          const quality_ = quality.value;
          const prefix = getDownloadFilenamePrefix();
          yield renderObjects(
            distribution,
            true,
            (imageIdx, canvasEle) => __async$4(this, null, function* () {
              yield envX.saveToFile(
                canvasEle,
                `${prefix}_${imageIdx}.${extension}`,
                format_,
                quality_ / qualityFactor
              );
            })
          );
        }));
      });
    }
    function renderObjects(distribution, hq, mapper) {
      return __async$4(this, null, function* () {
        const baseConst2 = getConstants().Base;
        const ret = [];
        for (let imageIdx = 0; imageIdx < distribution.length; ++imageIdx) {
          const image = distribution[imageIdx];
          const targetCanvas2 = document.createElement("canvas");
          targetCanvas2.width = baseConst2.screenWidth;
          targetCanvas2.height = baseConst2.screenHeight * image.length;
          try {
            const context = targetCanvas2.getContext("2d");
            for (let panelIdx = 0; panelIdx < image.length; ++panelIdx) {
              const panelId = image[panelIdx];
              const sceneRenderer2 = new SceneRenderer(
                store2,
                panelId,
                baseConst2.screenWidth,
                baseConst2.screenHeight
              );
              try {
                yield sceneRenderer2.render(hq, false, true);
                sceneRenderer2.paintOnto(context, {
                  x: 0,
                  y: baseConst2.screenHeight * panelIdx,
                  w: baseConst2.screenWidth,
                  h: baseConst2.screenHeight
                });
              } finally {
                sceneRenderer2.dispose();
              }
            }
            ret.push(yield mapper(imageIdx, targetCanvas2));
          } finally {
            disposeCanvas(targetCanvas2);
          }
        }
        return ret;
      });
    }
    function getLimitedPanelList() {
      const max = store2.state.panels.panelOrder.length - 1;
      const min = 0;
      const parts = pages.value.split(",");
      const listedPages = [];
      let foundMatch = false;
      for (const part of parts) {
        const trimmedPart = part.trim();
        const match = trimmedPart.match(/^\s*((\d+)|(\d+)\s*-\s*(\d+))\s*$/);
        if (!match) {
          if (trimmedPart !== "") {
            eventBus$1.fire(
              new ShowMessageEvent(`Could not read '${part}' in the page list.`)
            );
          }
          continue;
        }
        foundMatch = true;
        if (match[2]) {
          listedPages.push(parseInt(match[2], 10) - 1);
        } else {
          const from = Math.max(parseInt(match[3], 10) - 1, min);
          const to = Math.min(parseInt(match[4], 10) - 1, max);
          if (from == void 0 || to == void 0 || from > to)
            continue;
          for (let i = from; i <= to; ++i) {
            listedPages.push(i);
          }
        }
      }
      if (!foundMatch) {
        return store2.state.panels.panelOrder;
      }
      return listedPages.sort((a, b) => a - b).filter((value, idx, ary) => ary[idx - 1] !== value).map((pageIdx) => store2.state.panels.panelOrder[pageIdx]);
    }
    function getPanelDistibution() {
      const panelOrder = getLimitedPanelList();
      if (isNaN(ppi.value)) {
        ppi.value = 0;
      }
      if (ppi.value === 0)
        return [panelOrder];
      const images = [];
      for (let imageI = 0; imageI < panelOrder.length / ppi.value; ++imageI) {
        const sliceStart = imageI * ppi.value;
        const sliceEnd = sliceStart + ppi.value;
        images.push([...panelOrder.slice(sliceStart, sliceEnd)]);
      }
      return images;
    }
    function addNewPanel() {
      return __async$4(this, null, function* () {
        yield transaction(() => __async$4(this, null, function* () {
          yield store2.dispatch("panels/duplicatePanel", {
            panelId: store2.state.panels.currentPanel
          });
        }));
        yield nextTick();
        moveFocusToActivePanel();
      });
    }
    function updateCurrentPanel(panelId) {
      transaction(() => {
        store2.commit("panels/setCurrentPanel", {
          panelId
        });
      });
      nextTick(() => {
        moveFocusToActivePanel();
      });
    }
    function deletePanel() {
      transaction(() => __async$4(this, null, function* () {
        yield store2.dispatch("panels/delete", {
          panelId: store2.state.panels.currentPanel
        });
      }));
      nextTick(() => {
        moveFocusToActivePanel();
      });
    }
    function moveAhead() {
      transaction(() => __async$4(this, null, function* () {
        yield store2.dispatch("panels/move", {
          panelId: currentPanel.value.id,
          delta: -1
        });
      }));
    }
    function moveBehind() {
      transaction(() => __async$4(this, null, function* () {
        yield store2.dispatch("panels/move", {
          panelId: currentPanel.value.id,
          delta: 1
        });
      }));
    }
    const targetCanvas = makeCanvas();
    targetCanvas.width = baseConst.screenWidth * thumbnailFactor;
    targetCanvas.height = baseConst.screenHeight * thumbnailFactor;
    const thumbnailCtx = targetCanvas.getContext("2d");
    const isMounted = ref(false);
    const missingThumbnails = computed(() => {
      const panelOrder = store2.state.panels.panelOrder;
      return panelOrder.filter((id) => {
        const panel = store2.state.panels.panels[id];
        return panel.lastRender == null;
      });
    });
    function renderCurrentThumbnail() {
      return __async$4(this, null, function* () {
        const sceneRenderer2 = getMainSceneRenderer(store2);
        yield renderPanelThumbnail(sceneRenderer2);
      });
    }
    function renderPanelThumbnail(sceneRenderer2) {
      return __async$4(this, null, function* () {
        yield safeAsync("render thumbnail", () => __async$4(this, null, function* () {
          const panelId = sceneRenderer2.panelId;
          sceneRenderer2.paintOnto(thumbnailCtx, {
            x: 0,
            y: 0,
            w: thumbnailCtx.canvas.width,
            h: thumbnailCtx.canvas.height
          });
          thumbnailCtx.canvas.toBlob(
            (blob) => {
              if (!blob)
                return;
              const url = URL.createObjectURL(blob);
              transaction(() => {
                store2.commit("panels/setPanelPreview", {
                  panelId,
                  url
                });
              });
            },
            (yield isWebPSupported()) ? "image/webp" : "image/jpeg",
            thumbnailQuality
          );
        }));
      });
    }
    function restoreThumbnails() {
      return __async$4(this, null, function* () {
        const baseConst2 = getConstants().Base;
        if (!isMounted.value)
          return;
        if (envX.supports.limitedCanvasSpace)
          return;
        const missingThumbnails_ = missingThumbnails.value;
        if (missingThumbnails_.length === 0)
          return;
        const toRender = missingThumbnails_[0];
        const localRenderer = new SceneRenderer(
          store2,
          toRender,
          baseConst2.screenWidth,
          baseConst2.screenHeight
        );
        yield localRenderer.render(false, false, true);
        yield renderPanelThumbnail(localRenderer);
        setTimeout(() => {
          restoreThumbnails();
        }, 500);
      });
    }
    onMounted(() => {
      isMounted.value = true;
      requestAnimationFrame(() => renderCurrentThumbnail().catch(() => {
      }));
    });
    onUnmounted(() => {
      isMounted.value = false;
      disposeCanvas(thumbnailCtx.canvas);
    });
    eventBus$1.subscribe(
      RenderUpdatedEvent,
      () => requestAnimationFrame(renderCurrentThumbnail)
    );
    function save() {
      return __async$4(this, null, function* () {
        const str = yield store2.dispatch("getSave", true);
        const saveBlob = new Blob([str], {
          type: "text/plain"
        });
        const date = new Date();
        const prefix = `save-${[
          date.getFullYear(),
          `${date.getMonth() + 1}`.padStart(2, "0"),
          `${date.getDate()}`.padStart(2, "0"),
          `${date.getHours()}`.padStart(2, "0"),
          `${date.getMinutes()}`.padStart(2, "0"),
          `${date.getSeconds()}`.padStart(2, "0")
        ].join("-")}`;
        envX.storeSaveFile(saveBlob, `${prefix}.dddg`);
      });
    }
    function load() {
      return __async$4(this, null, function* () {
        yield transaction(() => __async$4(this, null, function* () {
          const uploadInput = loadUpload.value;
          if (!uploadInput.files)
            return;
          eventBus$1.fire(new StateLoadingEvent());
          const data = yield blobToText(uploadInput.files[0]);
          yield store2.dispatch("loadSave", data);
          if (envX.supports.limitedCanvasSpace) {
            eventBus$1.fire(
              new ShowMessageEvent(
                "To prevent running out of memory, thumbnails will not be automatically restored in the background."
              )
            );
          }
        }));
        yield renderCurrentThumbnail();
        setTimeout(() => {
          restoreThumbnails();
        }, 1e3);
      });
    }
    function blobToText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function() {
          resolve(reader.result);
        };
        reader.onerror = function(e) {
          reject(e);
        };
        reader.readAsText(file);
      });
    }
    watch(
      () => quality.value,
      (quality2, oldQuality) => {
        if (quality2 === 100) {
          eventBus$1.fire(
            new ShowMessageEvent(
              "Note: 100% quality on a lossy format is still not lossless! Select PNG if you want lossless compression."
            )
          );
          return;
        }
        if (oldQuality > qualityWarningThreshold && quality2 <= qualityWarningThreshold) {
          eventBus$1.fire(
            new ShowMessageEvent(
              "Note: A quality level below 70% might be very noticeable and impair legibility of text."
            )
          );
          return;
        }
      }
    );
    watch(
      () => ppi.value,
      (ppi2, oldppi) => {
        if (!envX.supports.limitedCanvasSpace)
          return;
        if (oldppi <= 10 && ppi2 > 10 || ppi2 === 0 && panelButtons.value.length > 10) {
          eventBus$1.fire(
            new ShowMessageEvent(
              "Note: Safari has strict limitations on available memory. More images per panel can easily cause crashes."
            )
          );
          return;
        }
      }
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "panel",
        ref_key: "root",
        ref: root
      }, [
        _hoisted_1$6,
        imageOptions.value ? (openBlock(), createBlock(ImageOptions, {
          key: 0,
          type: "panel",
          title: "",
          "panel-id": currentPanel.value.id,
          "no-composition": "",
          onLeave: _cache[0] || (_cache[0] = ($event) => {
            imageOptions.value = false;
            renderCurrentThumbnail();
          })
        }, null, 8, ["panel-id"])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
          createVNode(DFieldset, {
            class: "existing_panels_fieldset",
            title: "Existing Panels"
          }, {
            default: withCtx(() => [
              createVNode(DFlow, {
                "no-wraping": "",
                maxSize: "350px"
              }, {
                default: withCtx(() => [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(panelButtons.value, (panel, idx) => {
                    return openBlock(), createElementBlock("div", {
                      key: panel.id,
                      class: normalizeClass({
                        panel_button: true,
                        active: panel.id === currentPanel.value.id
                      }),
                      style: normalizeStyle$1(`background-image: url('${panel.image}')`),
                      tabindex: "0",
                      onClick: ($event) => updateCurrentPanel(panel.id),
                      onKeydown: [
                        withKeys(($event) => updateCurrentPanel(panel.id), ["enter"]),
                        withKeys(withModifiers(($event) => updateCurrentPanel(panel.id), ["prevent"]), ["space"])
                      ]
                    }, [
                      createBaseVNode("div", _hoisted_3$4, [
                        createBaseVNode("p", null, toDisplayString(panel.text), 1)
                      ]),
                      createBaseVNode("div", _hoisted_4$4, toDisplayString(idx + 1), 1)
                    ], 46, _hoisted_2$6);
                  }), 128))
                ]),
                _: 1
              })
            ]),
            _: 1
          }),
          createBaseVNode("div", _hoisted_5$3, [
            createVNode(DButton, {
              icon: "add_to_queue",
              onClick: addNewPanel
            }, {
              default: withCtx(() => [
                createTextVNode(" Add new")
              ]),
              _: 1
            }),
            createVNode(DButton, {
              icon: "remove_from_queue",
              class: "bt0",
              onClick: deletePanel,
              disabled: !canDeletePanel.value
            }, {
              default: withCtx(() => [
                createTextVNode(" Delete panel ")
              ]),
              _: 1
            }, 8, ["disabled"]),
            createVNode(DButton, {
              icon: "arrow_upward",
              class: "bt0",
              onClick: moveAhead,
              disabled: !canMoveAhead.value
            }, {
              default: withCtx(() => [
                createTextVNode(" Move ahead ")
              ]),
              _: 1
            }, 8, ["disabled"]),
            createVNode(DButton, {
              icon: "arrow_downward",
              class: "bt0",
              onClick: moveBehind,
              disabled: !canMoveBehind.value
            }, {
              default: withCtx(() => [
                createTextVNode(" Move behind ")
              ]),
              _: 1
            }, 8, ["disabled"]),
            createVNode(DButton, {
              class: "bt0",
              icon: "color_lens",
              onClick: _cache[1] || (_cache[1] = ($event) => imageOptions.value = true)
            }, {
              default: withCtx(() => [
                createTextVNode(" Image options ")
              ]),
              _: 1
            })
          ]),
          createVNode(DFieldset, {
            title: "Export",
            class: "h-h100"
          }, {
            default: withCtx(() => [
              createBaseVNode("table", _hoisted_6$3, [
                createBaseVNode("tr", null, [
                  _hoisted_7$3,
                  createBaseVNode("td", null, [
                    withDirectives(createBaseVNode("select", {
                      id: "export_format",
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => format.value = $event)
                    }, [
                      _hoisted_8$2,
                      webpSupport.value ? (openBlock(), createElementBlock("option", _hoisted_9$2, " WebP (lossy) ")) : createCommentVNode("", true),
                      heifSupport.value ? (openBlock(), createElementBlock("option", _hoisted_10$2, " HEIF (lossy) ")) : createCommentVNode("", true),
                      _hoisted_11$2
                    ], 512), [
                      [vModelSelect, format.value]
                    ])
                  ])
                ]),
                isLossy.value ? (openBlock(), createElementBlock("tr", _hoisted_12$2, [
                  _hoisted_13$2,
                  createBaseVNode("td", null, [
                    withDirectives(createBaseVNode("input", {
                      id: "export_quality",
                      type: "number",
                      min: "0",
                      max: "100",
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => quality.value = $event),
                      onKeydown: _cache[4] || (_cache[4] = withModifiers(() => {
                      }, ["stop"]))
                    }, null, 544), [
                      [
                        vModelText,
                        quality.value,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ])
                ])) : createCommentVNode("", true),
                createBaseVNode("tr", null, [
                  createBaseVNode("td", null, [
                    createBaseVNode("label", _hoisted_14$2, [
                      createTextVNode(" Panels per image: "),
                      !isLossy.value || unref(vertical) ? (openBlock(), createElementBlock("small", _hoisted_15$2, [
                        _hoisted_16$2,
                        createTextVNode("(0 for one single image)")
                      ])) : createCommentVNode("", true)
                    ])
                  ]),
                  createBaseVNode("td", null, [
                    withDirectives(createBaseVNode("input", {
                      id: "export_ppi",
                      type: "number",
                      min: "0",
                      "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => ppi.value = $event),
                      onKeydown: _cache[6] || (_cache[6] = withModifiers(() => {
                      }, ["stop"])),
                      onBlur: _cache[7] || (_cache[7] = ($event) => {
                        if (emptyStringInInt(ppi.value))
                          ppi.value = 0;
                      })
                    }, null, 544), [
                      [
                        vModelText,
                        ppi.value,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ])
                ]),
                createBaseVNode("tr", null, [
                  createBaseVNode("td", null, [
                    createBaseVNode("label", _hoisted_17$2, [
                      createTextVNode(" Panels to export: "),
                      !isLossy.value || unref(vertical) ? (openBlock(), createElementBlock("small", _hoisted_18$2, [
                        _hoisted_19$1,
                        createTextVNode("(Leave empty for all)")
                      ])) : createCommentVNode("", true)
                    ])
                  ]),
                  createBaseVNode("td", null, [
                    withDirectives(createBaseVNode("input", {
                      id: "export_pages",
                      "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => pages.value = $event),
                      placeholder: "E.g. 1-5, 8, 11-13"
                    }, null, 512), [
                      [vModelText, pages.value]
                    ])
                  ])
                ]),
                createBaseVNode("tr", null, [
                  createBaseVNode("td", _hoisted_20$1, [
                    createVNode(DButton, {
                      icon: "photo_camera",
                      class: "w100",
                      onClick: download
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Download ")
                      ]),
                      _: 1
                    })
                  ])
                ])
              ])
            ]),
            _: 1
          }),
          createBaseVNode("div", _hoisted_21$1, [
            createVNode(DButton, {
              icon: "save",
              onClick: save
            }, {
              default: withCtx(() => [
                createTextVNode("Save")
              ]),
              _: 1
            }),
            createVNode(DButton, {
              class: "v-bt0",
              icon: "folder_open",
              onClick: _cache[9] || (_cache[9] = ($event) => loadUpload.value.click())
            }, {
              default: withCtx(() => [
                createTextVNode(" Load "),
                createBaseVNode("input", {
                  type: "file",
                  ref_key: "loadUpload",
                  ref: loadUpload,
                  onChange: load
                }, null, 544)
              ]),
              _: 1
            })
          ])
        ], 64))
      ], 512);
    };
  }
});
const panels_vue_vue_type_style_index_0_scoped_74b7d9e5_lang = "";
const PanelsPanel = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-74b7d9e5"]]);
const _withScopeId$2 = (n) => (pushScopeId("data-v-f4db8760"), n = n(), popScopeId(), n);
const _hoisted_1$5 = {
  id: "poem_text",
  class: "v-w100"
};
const _hoisted_2$5 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("label", { for: "poem_text" }, "Text:", -1));
const _hoisted_3$3 = ["value"];
const _hoisted_4$3 = ["value"];
const _hoisted_5$2 = { key: 1 };
const _hoisted_6$2 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("td", { style: { "width": "0" } }, "Color:", -1));
const _hoisted_7$2 = { class: "v-w100" };
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "poem",
  setup(__props) {
    const store2 = useStore();
    const root = ref(null);
    const textarea = ref(null);
    const { vertical } = setupPanelMixin(root);
    const textEditor = ref(false);
    const colorSelect = ref("");
    watch(
      () => vertical.value,
      () => {
        textarea.value.style.height = "";
        textarea.value.style.width = "";
      }
    );
    const currentPanel = computed(
      () => store2.state.panels.panels[store2.state.panels.currentPanel]
    );
    const object = computed(() => {
      const obj = currentPanel.value.objects[store2.state.ui.selection];
      if (obj.type !== "poem")
        return void 0;
      return obj;
    });
    const setableP = (k) => genericSetterSplit(
      store2,
      object,
      "panels/setPoemProperty",
      false,
      k
    );
    const textHandler = computed(() => {
      if (!textEditor.value)
        return void 0;
      return {
        title: "Text",
        get: () => {
          return text.value;
        },
        set: (val) => {
          text.value = val;
        },
        leave: () => {
          textEditor.value = false;
        }
      };
    });
    const colorHandler = computed(() => {
      if (!colorSelect.value)
        return void 0;
      return {
        title: "Color",
        get: () => {
          switch (colorSelect.value) {
            case "":
              return "#000000";
            case "base":
              return object.value.consoleColor;
            default:
              throw new dist.UnreachableCaseError(colorSelect.value);
          }
        },
        set: (color2) => {
          transaction(() => {
            const panelId = currentPanel.value.id;
            const id = object.value.id;
            if (color2 === void 0)
              return;
            store2.commit("panels/setPoemProperty", {
              key: "consoleColor",
              panelId,
              id,
              value: color2
            });
          });
        },
        leave: () => {
          colorSelect.value = "";
        }
      };
    });
    const text = setableP("text");
    const autoWrap = setableP("autoWrap");
    const poemStyle = setableP("font");
    const overflow = setableP("overflow");
    const poemBackground = setableP("background");
    return (_ctx, _cache) => {
      return openBlock(), createBlock(ObjectTool, {
        ref_key: "root",
        ref: root,
        object: object.value,
        title: object.value.subType === "poem" ? "Poem" : "Console",
        textHandler: textHandler.value,
        colorHandler: colorHandler.value
      }, {
        default: withCtx(() => [
          createBaseVNode("div", _hoisted_1$5, [
            _hoisted_2$5,
            withDirectives(createBaseVNode("textarea", {
              class: "v-w100",
              ref_key: "textarea",
              ref: textarea,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(text) ? text.value = $event : null),
              onKeydown: _cache[1] || (_cache[1] = withModifiers(() => {
              }, ["stop"]))
            }, null, 544), [
              [vModelText, unref(text)]
            ]),
            createBaseVNode("button", {
              class: "w100 bt0",
              onClick: _cache[2] || (_cache[2] = ($event) => textEditor.value = true)
            }, "Formatting")
          ]),
          createVNode(_sfc_main$k, {
            label: "Auto line wrap?",
            modelValue: unref(autoWrap),
            "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => isRef(autoWrap) ? autoWrap.value = $event : null)
          }, null, 8, ["modelValue"]),
          createVNode(_sfc_main$k, {
            label: "Allow overflow?",
            modelValue: unref(overflow),
            "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => isRef(overflow) ? overflow.value = $event : null),
            title: "When text is too long, it is shown outside the container. Uses more memory"
          }, null, 8, ["modelValue"]),
          object.value.subType === "poem" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
            withDirectives(createBaseVNode("select", {
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => isRef(poemBackground) ? poemBackground.value = $event : null),
              onKeydown: _cache[6] || (_cache[6] = withModifiers(() => {
              }, ["stop"]))
            }, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(unref(poemBackgrounds$1), (background, idx) => {
                return openBlock(), createElementBlock("option", {
                  value: idx,
                  key: idx
                }, toDisplayString(background.name), 9, _hoisted_3$3);
              }), 128))
            ], 544), [
              [vModelSelect, unref(poemBackground)]
            ]),
            withDirectives(createBaseVNode("select", {
              "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => isRef(poemStyle) ? poemStyle.value = $event : null),
              onKeydown: _cache[8] || (_cache[8] = withModifiers(() => {
              }, ["stop"]))
            }, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(unref(poemTextStyles$1), (style, idx) => {
                return openBlock(), createElementBlock("option", {
                  value: idx,
                  key: idx
                }, toDisplayString(style.name), 9, _hoisted_4$3);
              }), 128))
            ], 544), [
              [vModelSelect, unref(poemStyle)]
            ])
          ], 64)) : (openBlock(), createElementBlock("table", _hoisted_5$2, [
            createBaseVNode("tr", null, [
              _hoisted_6$2,
              createBaseVNode("td", _hoisted_7$2, [
                createBaseVNode("button", {
                  id: "console_color",
                  class: "w100",
                  style: normalizeStyle$1([{ background: object.value.consoleColor }, { "min-width": "64px" }]),
                  onClick: _cache[9] || (_cache[9] = ($event) => colorSelect.value = "base")
                }, null, 4)
              ])
            ])
          ]))
        ]),
        _: 1
      }, 8, ["object", "title", "textHandler", "colorHandler"]);
    };
  }
});
const poem_vue_vue_type_style_index_0_scoped_f4db8760_lang = "";
const PoemPanel = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-f4db8760"]]);
var __async$3 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _withScopeId$1 = (n) => (pushScopeId("data-v-b7c535f5"), n = n(), popScopeId(), n);
const _hoisted_1$4 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("h1", null, "Settings", -1));
const _hoisted_2$4 = { class: "modal-scroll-area" };
const _hoisted_3$2 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("p", null, "Do you want to allow DDDG to save settings on your device?", -1));
const _hoisted_4$2 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("p", null, " By choosing to enable saving settings, DDDG can save data to your device, and nowhere else. However, your browser and any installed browser extensions might possibly read and send this data to other servers, e.g. to sync between devices. This is outside of our control. But in general, we recommend only using browsers and browser extensions that you trust with your personal data. ", -1));
const _hoisted_5$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("p", null, "You can revoke this permission at any time.", -1));
const _hoisted_6$1 = { class: "modal-scroll-area" };
const _hoisted_7$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("p", null, "Do you want to deny DDDG from saving settings on your device?", -1));
const _hoisted_8$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("p", null, " This will cause all your settings to reset when leaving the page. ", -1));
const _hoisted_9$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("div", { class: "modal-scroll-area" }, [
  /* @__PURE__ */ createBaseVNode("p", null, " WARNING: Swiching modes will discard everything you have done in this session. All dialouge will be lost! ")
], -1));
const _hoisted_10$1 = {
  key: 0,
  disabled: ""
};
const _hoisted_11$1 = { class: "v-w100" };
const _hoisted_12$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", null, "Theme:")
], -1));
const _hoisted_13$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("option", { value: null }, "System", -1));
const _hoisted_14$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("option", { value: false }, "Light", -1));
const _hoisted_15$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("option", { value: true }, "Dark", -1));
const _hoisted_16$1 = [
  _hoisted_13$1,
  _hoisted_14$1,
  _hoisted_15$1
];
const _hoisted_17$1 = {
  key: 4,
  class: "downloadTable"
};
const _hoisted_18$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", null, "Download folder:")
], -1));
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "settings",
  setup(__props) {
    const store2 = useStore();
    const root = ref(null);
    setupPanelMixin(root);
    function saveSettings() {
      var _a2;
      envX.saveSettings({
        lq: store2.state.ui.lqRendering,
        nsfw: store2.state.ui.nsfw,
        darkMode: (_a2 = store2.state.ui.useDarkTheme) != null ? _a2 : void 0,
        looseTextParsing: envX.state.looseTextParsing,
        defaultCharacterTalkingZoom: store2.state.ui.defaultCharacterTalkingZoom
      });
    }
    const savesEnabledInEnv = computed(() => envX.supports.optionalSaving);
    const allowSavesModal = ref(false);
    const denySavesModal = ref(false);
    const waitOnSaveChange = ref(false);
    const savesAllowed = computed({
      get() {
        return envX.savingEnabled;
      },
      set(allowed) {
        waitOnSaveChange.value = true;
        envX.savingEnabled = allowed;
        saveSettings();
      }
    });
    function allowSaves(choice) {
      allowSavesModal.value = false;
      if (choice === "Allow") {
        savesAllowed.value = true;
      }
    }
    function denySaves(choice) {
      denySavesModal.value = false;
      if (choice === "Deny") {
        savesAllowed.value = false;
      }
    }
    watch(
      () => savesAllowed.value,
      () => waitOnSaveChange.value = false
    );
    const showModeDialog = ref(false);
    const inPlusMode = computed(() => envX.gameMode === "ddlc_plus");
    function modeChange(choice) {
      safeAsync("changing modes", () => __async$3(this, null, function* () {
        if (choice === "Enter Classic Mode") {
          yield envX.setGameMode("ddlc");
        } else if (choice === "Enter Plus mode") {
          yield envX.setGameMode("ddlc_plus");
        } else {
          showModeDialog.value = false;
        }
      }));
    }
    const lqAllowed = computed(() => envX.supports.lq);
    const lqRendering = computed({
      get() {
        return store2.state.ui.lqRendering;
      },
      set(lqRendering2) {
        transaction(() => {
          store2.commit("ui/setLqRendering", lqRendering2);
        });
        saveSettings();
      }
    });
    const nsfw = computed({
      get() {
        return !!store2.state.ui.nsfw;
      },
      set(value) {
        transaction(() => {
          store2.commit("ui/setNsfw", value);
          saveSettings();
        });
      }
    });
    const defaultCharacterTalkingZoom = computed({
      get() {
        return !!store2.state.ui.defaultCharacterTalkingZoom;
      },
      set(value) {
        transaction(() => {
          store2.commit("ui/setDefaultCharacterTalkingZoom", value);
          saveSettings();
        });
      }
    });
    const looseTextParsing = computed({
      get() {
        return envX.state.looseTextParsing;
      },
      set(looseTextParsing2) {
        envX.state.looseTextParsing = looseTextParsing2;
        saveSettings();
      }
    });
    const theme = computed({
      get() {
        return store2.state.ui.useDarkTheme;
      },
      set(value) {
        transaction(() => {
          store2.commit("ui/setDarkTheme", value);
          saveSettings();
        });
      }
    });
    const showDownloadFolder = computed(
      () => envX.supports.setDownloadFolder
    );
    const downloadFolder = computed(
      () => envX.state.downloadLocation
    );
    function setDownloadFolder() {
      envX.updateDownloadFolder();
    }
    function openDownloadFolder() {
      envX.openFolder("downloads");
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "panel",
        ref_key: "root",
        ref: root
      }, [
        _hoisted_1$4,
        (openBlock(), createBlock(Teleport, { to: "#modal-messages" }, [
          allowSavesModal.value ? (openBlock(), createBlock(ModalDialog, {
            key: 0,
            options: ["Allow", "Deny"],
            onLeave: _cache[0] || (_cache[0] = ($event) => allowSaves("Deny")),
            onOption: allowSaves,
            "no-base-size": ""
          }, {
            default: withCtx(() => [
              createBaseVNode("div", _hoisted_2$4, [
                _hoisted_3$2,
                _hoisted_4$2,
                _hoisted_5$1,
                createBaseVNode("p", null, [
                  createTextVNode(" Our usual "),
                  createVNode(_sfc_main$n, { to: "wiki://Privacy Statement" }, {
                    default: withCtx(() => [
                      createTextVNode("privacy policy")
                    ]),
                    _: 1
                  }),
                  createTextVNode(" still applies. ")
                ])
              ])
            ]),
            _: 1
          })) : createCommentVNode("", true),
          denySavesModal.value ? (openBlock(), createBlock(ModalDialog, {
            key: 1,
            options: ["Deny", "Cancle"],
            onLeave: _cache[1] || (_cache[1] = ($event) => denySaves("Cancel")),
            onOption: denySaves,
            "no-base-size": ""
          }, {
            default: withCtx(() => [
              createBaseVNode("div", _hoisted_6$1, [
                _hoisted_7$1,
                _hoisted_8$1,
                createBaseVNode("p", null, [
                  createTextVNode(" Our usual "),
                  createVNode(_sfc_main$n, { to: "wiki://Privacy Statement" }, {
                    default: withCtx(() => [
                      createTextVNode("privacy policy")
                    ]),
                    _: 1
                  }),
                  createTextVNode(" still applies. ")
                ])
              ])
            ]),
            _: 1
          })) : createCommentVNode("", true),
          showModeDialog.value ? (openBlock(), createBlock(ModalDialog, {
            key: 2,
            options: [
              inPlusMode.value ? "Enter Classic Mode" : "Enter Plus mode",
              "Stay"
            ],
            onLeave: _cache[2] || (_cache[2] = ($event) => showModeDialog.value = false),
            onOption: modeChange,
            "no-base-size": ""
          }, {
            default: withCtx(() => [
              _hoisted_9$1
            ]),
            _: 1
          }, 8, ["options"])) : createCommentVNode("", true)
        ])),
        waitOnSaveChange.value ? (openBlock(), createElementBlock("button", _hoisted_10$1, "Applying...")) : !savesAllowed.value && savesEnabledInEnv.value ? (openBlock(), createElementBlock("button", {
          key: 1,
          onClick: _cache[3] || (_cache[3] = ($event) => allowSavesModal.value = true)
        }, " Allow saving options ")) : savesAllowed.value && savesEnabledInEnv.value ? (openBlock(), createElementBlock("button", {
          key: 2,
          onClick: _cache[4] || (_cache[4] = ($event) => denySavesModal.value = true)
        }, " Deny saving options ")) : createCommentVNode("", true),
        createBaseVNode("button", {
          onClick: _cache[5] || (_cache[5] = ($event) => showModeDialog.value = true)
        }, [
          inPlusMode.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
            createTextVNode(" Enter Classic Mode ")
          ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
            createTextVNode(" Enter DDLC Plus Mode ")
          ], 64))
        ]),
        lqAllowed.value ? (openBlock(), createBlock(_sfc_main$k, {
          key: 3,
          label: "Low quality preview?",
          title: "Reduces the quality of the preview images to speed up the user experience and consume less data. Does not effect final render.",
          modelValue: lqRendering.value,
          "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => lqRendering.value = $event)
        }, null, 8, ["modelValue"])) : createCommentVNode("", true),
        createVNode(_sfc_main$k, {
          label: "NSFW Mode?",
          modelValue: nsfw.value,
          "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => nsfw.value = $event)
        }, null, 8, ["modelValue"]),
        createVNode(_sfc_main$k, {
          label: "Enlarge talking objects? (Default value)",
          modelValue: defaultCharacterTalkingZoom.value,
          "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => defaultCharacterTalkingZoom.value = $event)
        }, null, 8, ["modelValue"]),
        createVNode(_sfc_main$k, {
          label: "Fault tolerant text parsing",
          title: "Silently ignore parse errors in texts. (Like unexpected '{' characters) Prevents beginners from getting stuck working with textboxes, but also makes it harder to understand what you are doing wrong.",
          modelValue: looseTextParsing.value,
          "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => looseTextParsing.value = $event)
        }, null, 8, ["modelValue"]),
        createBaseVNode("table", _hoisted_11$1, [
          createBaseVNode("tr", null, [
            _hoisted_12$1,
            createBaseVNode("td", null, [
              withDirectives(createBaseVNode("select", {
                "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => theme.value = $event),
                class: "v-w100"
              }, _hoisted_16$1, 512), [
                [vModelSelect, theme.value]
              ])
            ])
          ])
        ]),
        showDownloadFolder.value ? (openBlock(), createElementBlock("table", _hoisted_17$1, [
          createBaseVNode("tr", null, [
            _hoisted_18$1,
            createBaseVNode("td", null, toDisplayString(downloadFolder.value), 1),
            createBaseVNode("td", null, [
              createBaseVNode("button", { onClick: setDownloadFolder }, "Set"),
              createBaseVNode("button", { onClick: openDownloadFolder }, "Open")
            ])
          ])
        ])) : createCommentVNode("", true)
      ], 512);
    };
  }
});
const settings_vue_vue_type_style_index_0_scoped_b7c535f5_lang = "";
const SettingsPanel = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-b7c535f5"]]);
var __async$2 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _hoisted_1$3 = { class: "warning" };
const _hoisted_2$3 = { style: { "word-wrap": "break-word" } };
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "sprite",
  setup(__props) {
    const store2 = useStore();
    const root = ref(null);
    const missingSpriteUpload = ref(null);
    setupPanelMixin(root);
    const missing = computed(() => {
      for (const asset of object.value.assets) {
        const url = getAAssetUrl(asset, false);
        console.log(url);
        if (url.startsWith("uploads:"))
          return url.substring(8);
      }
      return null;
    });
    const currentPanel = computed(() => {
      return store2.state.panels.panels[store2.state.panels.currentPanel];
    });
    const object = computed(() => {
      const obj = currentPanel.value.objects[store2.state.ui.selection];
      if (obj.type !== "sprite")
        return void 0;
      return obj;
    });
    function reupload() {
      missingSpriteUpload.value.click();
    }
    function onMissingSpriteFileUpload(_e) {
      return __async$2(this, null, function* () {
        const uploadInput = missingSpriteUpload.value;
        if (!uploadInput.files)
          return;
        if (uploadInput.files.length !== 1) {
          console.error("More than one file uploaded!");
          return;
        }
        const file = uploadInput.files[0];
        yield transaction(() => __async$2(this, null, function* () {
          const url = URL.createObjectURL(file);
          yield store2.dispatch("uploadUrls/add", {
            name: missing.value,
            url
          });
        }));
      });
    }
    return (_ctx, _cache) => {
      return openBlock(), createBlock(ObjectTool, {
        ref_key: "root",
        ref: root,
        object: object.value,
        title: "Custom Sprite"
      }, {
        default: withCtx(() => [
          missing.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
            createBaseVNode("p", _hoisted_1$3, [
              createTextVNode(" MISSING SPRITE! Click below to re-upload "),
              createBaseVNode("span", _hoisted_2$3, '"' + toDisplayString(missing.value) + '"', 1),
              createTextVNode(". ")
            ]),
            createBaseVNode("button", {
              onClick: _cache[0] || (_cache[0] = ($event) => reupload())
            }, "Re-Upload"),
            createBaseVNode("input", {
              type: "file",
              ref_key: "missingSpriteUpload",
              ref: missingSpriteUpload,
              onChange: onMissingSpriteFileUpload
            }, null, 544)
          ], 64)) : createCommentVNode("", true)
        ]),
        _: 1
      }, 8, ["object"]);
    };
  }
});
const sprite_vue_vue_type_style_index_0_scoped_55fd1d74_lang = "";
const SpritePanel = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-55fd1d74"]]);
var __async$1 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _withScopeId = (n) => (pushScopeId("data-v-66c34976"), n = n(), popScopeId(), n);
const _hoisted_1$2 = { class: "upper-combos" };
const _hoisted_2$2 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "text_style" }, "Style:")
], -1));
const _hoisted_3$1 = { colspan: "2" };
const _hoisted_4$1 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("option", { value: "normal" }, "Normal", -1));
const _hoisted_5 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("option", { value: "corrupt" }, "Corrupt", -1));
const _hoisted_6 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("option", { value: "custom" }, "Custom", -1));
const _hoisted_7 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("option", { value: "custom_plus" }, "Custom (Plus)", -1));
const _hoisted_8 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("option", { value: "none" }, "None", -1));
const _hoisted_9 = [
  _hoisted_4$1,
  _hoisted_5,
  _hoisted_6,
  _hoisted_7,
  _hoisted_8
];
const _hoisted_10 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "current_talking" }, "Person talking:")
], -1));
const _hoisted_11 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("option", { value: "$null$" }, "No-one", -1));
const _hoisted_12 = ["value"];
const _hoisted_13 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("option", { value: "$other$" }, "Other", -1));
const _hoisted_14 = ["disabled"];
const _hoisted_15 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "custom_name" }, "Other name:")
], -1));
const _hoisted_16 = {
  id: "dialog_text_wrapper",
  class: "v-w100"
};
const _hoisted_17 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("label", { for: "dialog_text" }, "Dialog:", -1));
const _hoisted_18 = { key: 0 };
const _hoisted_19 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "custom_namebox_width" }, "Namebox width:")
], -1));
const _hoisted_20 = ["placeholder"];
const _hoisted_21 = { colspan: "2" };
const _hoisted_22 = { key: 0 };
const _hoisted_23 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "textbox_color" }, "Color:")
], -1));
const _hoisted_24 = { key: 1 };
const _hoisted_25 = { colspan: "2" };
const _hoisted_26 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "custom_controls_color" }, "Controls color:")
], -1));
const _hoisted_27 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "custom_namebox_color" }, "Namebox color:")
], -1));
const _hoisted_28 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "custom_namebox_stroke" }, "Namebox text stroke:")
], -1));
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "textbox",
  setup(__props) {
    const store2 = useStore();
    const root = ref(null);
    const textarea = ref(null);
    const { vertical } = setupPanelMixin(root);
    const textEditor = ref("");
    const colorSelect = ref(
      ""
    );
    watch(
      () => vertical.value,
      () => {
        textarea.value.style.height = "";
        textarea.value.style.width = "";
      }
    );
    const currentPanel = computed(
      () => store2.state.panels.panels[store2.state.panels.currentPanel]
    );
    const object = computed(() => {
      const obj = currentPanel.value.objects[store2.state.ui.selection];
      if (obj.type !== "textBox")
        return void 0;
      return obj;
    });
    const tbSetable = (k) => genericSetterSplit(
      store2,
      object,
      "panels/setTextBoxProperty",
      false,
      k
    );
    const textHandler = computed(() => {
      if (!textEditor.value)
        return void 0;
      return {
        title: textEditorName.value,
        get() {
          if (textEditor.value === "name")
            return object.value.talkingOther;
          if (textEditor.value === "body")
            return dialog.value;
          return "";
        },
        set(text) {
          if (textEditor.value === "name")
            talkingOther.value = text;
          else if (textEditor.value === "body")
            dialog.value = text;
        },
        leave() {
          textEditor.value = "";
        }
      };
    });
    const colorHandler = computed(() => {
      if (!colorSelect.value)
        return void 0;
      return {
        title: colorName.value,
        get: () => {
          switch (colorSelect.value) {
            case "":
              return "#000000";
            case "base":
              return object.value.customColor;
            case "controls":
              return object.value.customControlsColor;
            case "namebox":
              return object.value.customNameboxColor;
            case "nameboxStroke":
              return object.value.customNameboxStroke;
            default:
              throw new dist.UnreachableCaseError(colorSelect.value);
          }
        },
        set: (color2) => {
          transaction(() => {
            const panelId = currentPanel.value.id;
            const id = object.value.id;
            let colorKey = {
              base: "customColor",
              controls: "customControlsColor",
              namebox: "customNameboxColor",
              nameboxStroke: "customNameboxStroke",
              "": void 0
            }[colorSelect.value];
            if (color2 === void 0)
              return;
            store2.commit(
              "panels/setTextBoxProperty",
              textboxProperty(panelId, id, colorKey, color2)
            );
          });
        },
        leave: () => {
          colorSelect.value = "";
        }
      };
    });
    const talkingObjId = computed({
      get() {
        var _a2;
        return (_a2 = object.value.talkingObjId) != null ? _a2 : "$null$";
      },
      set(val) {
        transaction(() => {
          store2.commit("panels/setTalkingObject", {
            id: object.value.id,
            panelId: object.value.panelId,
            talkingObjId: val === "$null$" ? null : val
          });
        });
      }
    });
    const talkingOther = genericSetterMerged(
      store2,
      object,
      "panels/setTalkingOther",
      false,
      "talkingOther"
    );
    const nameList = computed(() => {
      const panel = currentPanel.value;
      const ret = [];
      for (const id of [...panel.order, ...panel.onTopOrder]) {
        const obj = panel.objects[id];
        if (obj.label === null)
          continue;
        ret.push([id, obj.label]);
      }
      return ret;
    });
    const textEditorName = computed(() => {
      if (textEditor.value === "name")
        return "Name";
      if (textEditor.value === "body")
        return "Dialog";
      return "";
    });
    const colorName = computed(() => {
      switch (colorSelect.value) {
        case "":
          return "";
        case "base":
          return "Base color";
        case "controls":
          return "Controls color";
        case "namebox":
          return "Namebox color";
        case "nameboxStroke":
          return "Namebox text stroke";
        default:
          throw new dist.UnreachableCaseError(colorSelect.value);
      }
    });
    const autoQuoting = tbSetable("autoQuoting");
    const autoWrap = tbSetable("autoWrap");
    const overflow = tbSetable("overflow");
    const dialog = tbSetable("text");
    const customizable = computed(() => textBoxStyle.value.startsWith("custom"));
    const textBoxStyle = genericSetterMerged(
      store2,
      object,
      "panels/setStyle",
      true,
      "style"
    );
    const showControls = tbSetable("controls");
    const allowSkipping = tbSetable("skip");
    const showContinueArrow = tbSetable("continue");
    const overrideColor = tbSetable("overrideColor");
    const deriveCustomColors = tbSetable("deriveCustomColors");
    const customNameboxWidth = tbSetable("customNameboxWidth");
    const nameboxWidthDefault = computed(() => getConstants().TextBox.NameboxWidth);
    function splitTextbox() {
      transaction(() => __async$1(this, null, function* () {
        yield store2.dispatch("panels/splitTextbox", {
          id: object.value.id,
          panelId: object.value.panelId
        });
      }));
    }
    function resetPosition() {
      transaction(() => __async$1(this, null, function* () {
        yield store2.dispatch("panels/resetTextboxBounds", {
          id: object.value.id,
          panelId: object.value.panelId
        });
      }));
    }
    function jumpToCharacter() {
      transaction(() => {
        store2.commit("ui/setSelection", talkingObjId.value);
      });
    }
    return (_ctx, _cache) => {
      return openBlock(), createBlock(ObjectTool, {
        ref_key: "root",
        ref: root,
        object: object.value,
        title: "Textbox",
        textHandler: textHandler.value,
        colorHandler: colorHandler.value
      }, {
        default: withCtx(() => [
          createBaseVNode("table", _hoisted_1$2, [
            createBaseVNode("tr", null, [
              _hoisted_2$2,
              createBaseVNode("td", _hoisted_3$1, [
                withDirectives(createBaseVNode("select", {
                  id: "text_style",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(textBoxStyle) ? textBoxStyle.value = $event : null),
                  onKeydown: _cache[1] || (_cache[1] = withModifiers(() => {
                  }, ["stop"]))
                }, _hoisted_9, 544), [
                  [vModelSelect, unref(textBoxStyle)]
                ])
              ])
            ]),
            createBaseVNode("tr", null, [
              _hoisted_10,
              createBaseVNode("td", null, [
                withDirectives(createBaseVNode("select", {
                  id: "current_talking",
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => talkingObjId.value = $event),
                  onKeydown: _cache[3] || (_cache[3] = withModifiers(() => {
                  }, ["stop"]))
                }, [
                  _hoisted_11,
                  (openBlock(true), createElementBlock(Fragment, null, renderList(nameList.value, ([id, label]) => {
                    return openBlock(), createElementBlock("option", {
                      key: id,
                      value: id
                    }, toDisplayString(label), 9, _hoisted_12);
                  }), 128)),
                  _hoisted_13
                ], 544), [
                  [vModelSelect, talkingObjId.value]
                ])
              ]),
              createBaseVNode("td", null, [
                createBaseVNode("button", {
                  title: "Jump to talking character",
                  onClick: jumpToCharacter,
                  disabled: talkingObjId.value === "$null$" || talkingObjId.value === "$other$"
                }, " > ", 8, _hoisted_14)
              ])
            ]),
            createBaseVNode("tr", null, [
              _hoisted_15,
              createBaseVNode("td", null, [
                withDirectives(createBaseVNode("input", {
                  id: "custom_name",
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => isRef(talkingOther) ? talkingOther.value = $event : null),
                  onKeydown: _cache[5] || (_cache[5] = withModifiers(() => {
                  }, ["stop"]))
                }, null, 544), [
                  [vModelText, unref(talkingOther)]
                ])
              ]),
              createBaseVNode("td", null, [
                createBaseVNode("button", {
                  onClick: _cache[6] || (_cache[6] = ($event) => textEditor.value = "name")
                }, "...")
              ])
            ])
          ]),
          createVNode(_sfc_main$k, {
            label: "Auto quoting?",
            modelValue: unref(autoQuoting),
            "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => isRef(autoQuoting) ? autoQuoting.value = $event : null),
            title: "Try to automatically fix missing/unclosed quotation marks when a character is speaking"
          }, null, 8, ["modelValue"]),
          createVNode(_sfc_main$k, {
            label: "Auto line wrap?",
            modelValue: unref(autoWrap),
            "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => isRef(autoWrap) ? autoWrap.value = $event : null),
            title: "Automatically insert line breaks when a line of text is larger than the textbox"
          }, null, 8, ["modelValue"]),
          createVNode(_sfc_main$k, {
            label: "Allow overflow?",
            modelValue: unref(overflow),
            "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => isRef(overflow) ? overflow.value = $event : null),
            title: "When text is too long, it is shown outside the textbox. Uses more memory"
          }, null, 8, ["modelValue"]),
          createBaseVNode("div", _hoisted_16, [
            _hoisted_17,
            withDirectives(createBaseVNode("textarea", {
              class: "v-w100",
              ref_key: "textarea",
              ref: textarea,
              "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => isRef(dialog) ? dialog.value = $event : null),
              id: "dialog_text",
              onKeydown: _cache[11] || (_cache[11] = withModifiers(() => {
              }, ["stop"]))
            }, null, 544), [
              [vModelText, unref(dialog)]
            ]),
            createBaseVNode("button", {
              class: "w100 bt0",
              onClick: _cache[12] || (_cache[12] = ($event) => textEditor.value = "body")
            }, " Formatting ")
          ])
        ]),
        options: withCtx(() => [
          createVNode(DFieldset, {
            title: "Customization:",
            class: normalizeClass(customizable.value ? "customization-set" : "")
          }, {
            default: withCtx(() => [
              createVNode(DFlow, {
                direction: "vertical",
                maxSize: "100%",
                "no-wraping": ""
              }, {
                default: withCtx(() => [
                  createVNode(_sfc_main$k, {
                    label: "Controls visible?",
                    modelValue: unref(showControls),
                    "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => isRef(showControls) ? showControls.value = $event : null)
                  }, null, 8, ["modelValue"]),
                  createVNode(_sfc_main$k, {
                    label: "Able to skip?",
                    modelValue: unref(allowSkipping),
                    "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => isRef(allowSkipping) ? allowSkipping.value = $event : null)
                  }, null, 8, ["modelValue"]),
                  createVNode(_sfc_main$k, {
                    label: "Continue arrow?",
                    modelValue: unref(showContinueArrow),
                    "onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => isRef(showContinueArrow) ? showContinueArrow.value = $event : null)
                  }, null, 8, ["modelValue"]),
                  customizable.value ? (openBlock(), createElementBlock("table", _hoisted_18, [
                    createBaseVNode("tr", null, [
                      _hoisted_19,
                      createBaseVNode("td", null, [
                        withDirectives(createBaseVNode("input", {
                          id: "custom_namebox_width",
                          type: "number",
                          style: { "width": "48px" },
                          placeholder: nameboxWidthDefault.value + "",
                          "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => isRef(customNameboxWidth) ? customNameboxWidth.value = $event : null),
                          onKeydown: _cache[17] || (_cache[17] = withModifiers(() => {
                          }, ["stop"]))
                        }, null, 40, _hoisted_20), [
                          [
                            vModelText,
                            unref(customNameboxWidth),
                            void 0,
                            { number: true }
                          ]
                        ])
                      ])
                    ]),
                    createBaseVNode("tr", null, [
                      createBaseVNode("td", _hoisted_21, [
                        createVNode(_sfc_main$k, {
                          modelValue: unref(overrideColor),
                          "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => isRef(overrideColor) ? overrideColor.value = $event : null),
                          label: "Override color"
                        }, null, 8, ["modelValue"])
                      ])
                    ]),
                    unref(overrideColor) ? (openBlock(), createElementBlock("tr", _hoisted_22, [
                      _hoisted_23,
                      createBaseVNode("td", null, [
                        createBaseVNode("button", {
                          id: "textbox_color",
                          class: "color-button",
                          style: normalizeStyle$1({ background: object.value.customColor }),
                          onClick: _cache[19] || (_cache[19] = ($event) => colorSelect.value = "base")
                        }, null, 4)
                      ])
                    ])) : createCommentVNode("", true),
                    unref(overrideColor) ? (openBlock(), createElementBlock("tr", _hoisted_24, [
                      createBaseVNode("td", _hoisted_25, [
                        createVNode(_sfc_main$k, {
                          id: "derive_custom_colors",
                          modelValue: unref(deriveCustomColors),
                          "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => isRef(deriveCustomColors) ? deriveCustomColors.value = $event : null),
                          label: "Derive other colors"
                        }, null, 8, ["modelValue"])
                      ])
                    ])) : createCommentVNode("", true),
                    unref(overrideColor) && !unref(deriveCustomColors) ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
                      createBaseVNode("tr", null, [
                        _hoisted_26,
                        createBaseVNode("td", null, [
                          createBaseVNode("button", {
                            id: "custom_controls_color",
                            class: "color-button",
                            style: normalizeStyle$1({ background: object.value.customControlsColor }),
                            onClick: _cache[21] || (_cache[21] = ($event) => colorSelect.value = "controls")
                          }, null, 4)
                        ])
                      ]),
                      createBaseVNode("tr", null, [
                        _hoisted_27,
                        createBaseVNode("td", null, [
                          createBaseVNode("button", {
                            id: "custom_namebox_color",
                            class: "color-button",
                            style: normalizeStyle$1({ background: object.value.customNameboxColor }),
                            onClick: _cache[22] || (_cache[22] = ($event) => colorSelect.value = "namebox")
                          }, null, 4)
                        ])
                      ]),
                      createBaseVNode("tr", null, [
                        _hoisted_28,
                        createBaseVNode("td", null, [
                          createBaseVNode("button", {
                            id: "custom_namebox_stroke",
                            class: "color-button",
                            style: normalizeStyle$1({ background: object.value.customNameboxStroke }),
                            onClick: _cache[23] || (_cache[23] = ($event) => colorSelect.value = "nameboxStroke")
                          }, null, 4)
                        ])
                      ])
                    ], 64)) : createCommentVNode("", true)
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["class"]),
          createBaseVNode("button", { onClick: resetPosition }, "Reset position"),
          createBaseVNode("button", {
            class: "bt0",
            onClick: splitTextbox
          }, "Split textbox")
        ]),
        _: 1
      }, 8, ["object", "textHandler", "colorHandler"]);
    };
  }
});
const textbox_vue_vue_type_style_index_0_scoped_66c34976_lang = "";
const TextBoxPanel = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-66c34976"]]);
const _hoisted_1$1 = { id: "toolbar" };
const _hoisted_2$1 = { id: "toolbar-end" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "toolbox",
  emits: [
    "show-dialog",
    "show-prev-render",
    "download",
    "show-expression-dialog"
  ],
  setup(__props, { emit: __emit }) {
    const store2 = useStore();
    const emit2 = __emit;
    const panels2 = ref(null);
    const panelSelection = ref("add");
    const currentPanel = computed(() => {
      return store2.state.panels.panels[store2.state.panels.currentPanel];
    });
    const vertical = computed(() => store2.state.ui.vertical);
    const selection = computed(() => store2.state.ui.selection);
    const panel = computed(() => {
      if (panelSelection.value === "selection") {
        if (selection.value === null) {
          panelSelection.value = "add";
        } else {
          return currentPanel.value.objects[selection.value].type;
        }
      }
      return panelSelection.value;
    });
    const hasPrevRender = computed(() => store2.state.ui.lastDownload !== null);
    function setPanel(name) {
      if (name === panelSelection.value)
        name = "add";
      panelSelection.value = name;
      if (selection.value !== null) {
        store2.commit("ui/setSelection", null);
      }
    }
    function resetScroll() {
      if (panels2.value instanceof HTMLElement) {
        panels2.value.scrollTop = 0;
        panels2.value.scrollLeft = 0;
      }
    }
    watch(
      () => selection.value,
      (newSelection) => {
        if (newSelection != null) {
          panelSelection.value = "selection";
          return;
        }
        if (panelSelection.value === "selection") {
          panelSelection.value = "add";
        }
      }
    );
    envX.onPanelChange((panel2) => {
      panelSelection.value = panel2;
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        id: "panels",
        class: normalizeClass({ vertical: vertical.value }),
        onScroll: resetScroll,
        ref_key: "panels",
        ref: panels2
      }, [
        createBaseVNode("div", _hoisted_1$1, [
          createVNode(DButton, {
            icon: "add_box",
            "icon-pos": "top",
            class: normalizeClass({ active: panel.value === "add" }),
            title: "Add new objects to the scene",
            shortcut: "a",
            onClick: _cache[0] || (_cache[0] = ($event) => setPanel("add"))
          }, null, 8, ["class"]),
          createVNode(DButton, {
            icon: "panorama",
            "icon-pos": "top",
            class: normalizeClass({ active: panel.value === "backgrounds" }),
            title: "Change the current background",
            shortcut: "s",
            onClick: _cache[1] || (_cache[1] = ($event) => setPanel("backgrounds"))
          }, null, 8, ["class"]),
          createVNode(DButton, {
            icon: "view_module",
            "icon-pos": "top",
            class: normalizeClass({ active: panel.value === "panels" }),
            title: "Panels",
            shortcut: "d",
            onClick: _cache[2] || (_cache[2] = ($event) => setPanel("panels"))
          }, null, 8, ["class"]),
          createVNode(DButton, {
            icon: "settings_applications",
            "icon-pos": "top",
            class: normalizeClass({ active: panel.value === "settings" }),
            title: "Settings",
            shortcut: "f",
            onClick: _cache[3] || (_cache[3] = ($event) => setPanel("settings"))
          }, null, 8, ["class"])
        ]),
        panel.value === "settings" ? (openBlock(), createBlock(SettingsPanel, { key: 0 })) : panel.value === "backgrounds" ? (openBlock(), createBlock(BackgroundsPanel, {
          key: 1,
          onShowDialog: _cache[4] || (_cache[4] = ($event) => emit2("show-dialog", $event))
        })) : panel.value === "help_credits" ? (openBlock(), createBlock(CreditsPanel, { key: 2 })) : panel.value === "character" ? (openBlock(), createBlock(CharacterPanel, {
          key: 3,
          onShowDialog: _cache[5] || (_cache[5] = ($event) => emit2("show-dialog", $event)),
          onShowExpressionDialog: _cache[6] || (_cache[6] = ($event) => emit2("show-expression-dialog", $event))
        })) : panel.value === "sprite" ? (openBlock(), createBlock(SpritePanel, { key: 4 })) : panel.value === "textBox" ? (openBlock(), createBlock(TextBoxPanel, { key: 5 })) : panel.value === "choice" ? (openBlock(), createBlock(ChoicePanel, { key: 6 })) : panel.value === "panels" ? (openBlock(), createBlock(PanelsPanel, { key: 7 })) : panel.value === "notification" ? (openBlock(), createBlock(NotificationPanel, { key: 8 })) : panel.value === "poem" ? (openBlock(), createBlock(PoemPanel, { key: 9 })) : (openBlock(), createBlock(AddPanel, {
          key: 10,
          onShowDialog: _cache[7] || (_cache[7] = ($event) => emit2("show-dialog", $event))
        })),
        createBaseVNode("div", _hoisted_2$1, [
          createVNode(DButton, {
            icon: "help",
            "icon-pos": "top",
            class: normalizeClass({ active: panel.value === "help_credits" }),
            title: "Help & Credits",
            shortcut: "h",
            onClick: _cache[8] || (_cache[8] = ($event) => setPanel("help_credits"))
          }, null, 8, ["class"]),
          createVNode(DButton, {
            icon: "extension",
            "icon-pos": "top",
            title: "Content Packs",
            shortcut: "p",
            onClick: _cache[9] || (_cache[9] = ($event) => emit2("show-dialog"))
          }),
          createVNode(DButton, {
            icon: "flip_to_back",
            "icon-pos": "top",
            title: "Show last downloaded panel",
            shortcut: "l",
            onClick: _cache[10] || (_cache[10] = ($event) => emit2("show-prev-render")),
            disabled: !hasPrevRender.value
          }, null, 8, ["disabled"]),
          createVNode(DButton, {
            icon: "photo_camera",
            "icon-pos": "top",
            title: "Take a screenshot of the current scene",
            shortcut: "i",
            onClick: _cache[11] || (_cache[11] = ($event) => emit2("download"))
          })
        ])
      ], 34);
    };
  }
});
const toolbox_vue_vue_type_style_index_0_lang = "";
var __async2 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _hoisted_1 = { id: "app" };
const _hoisted_2 = { class: "hidden-selectors" };
const _hoisted_3 = ["data-obj-id", "onKeydown"];
const _hoisted_4 = /* @__PURE__ */ createBaseVNode("div", { id: "modal-messages" }, null, -1);
const arrowMoveStepSize = 20;
const aspectRatio = 16 / 9;
const packDialogWaitMs = 50;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "app",
  setup(__props) {
    const SingleBox = defineAsyncComponent(
      () => __vitePreload(() => import("./single-box.60dd15b7.js"), true ? ["./single-box.60dd15b7.js","./single-box.8809abf1.css"] : void 0, import.meta.url)
    );
    const ExpressionBuilder = defineAsyncComponent(
      () => __vitePreload(() => import("./index.faea2191.js"), true ? ["./index.faea2191.js","./index.57068694.css"] : void 0, import.meta.url)
    );
    const store2 = useStore();
    const preLoading = ref(true);
    const renderer2 = ref(null);
    const objects = computed(() => {
      const panels2 = store2.state.panels;
      const currentPanel = panels2.panels[panels2.currentPanel];
      if (currentPanel == null)
        return [];
      return [...currentPanel.order, ...currentPanel.onTopOrder];
    });
    function drawLastDownload() {
      const last = store2.state.ui.lastDownload;
      if (last == null)
        return;
      renderer2.value.blendOver(last);
    }
    function cancleEvent(e) {
      e.preventDefault();
    }
    onMounted(() => {
      document.body.addEventListener("drop", cancleEvent, true);
      document.body.addEventListener("dragover", cancleEvent, true);
    });
    onUnmounted(() => {
      document.body.removeEventListener("drop", cancleEvent, true);
      document.body.removeEventListener("dragover", cancleEvent, true);
    });
    const canvasWidth = ref(0);
    const canvasHeight = ref(0);
    const uiSize = ref(192);
    function optimum(sw, sh) {
      let rh = sw / aspectRatio;
      let rw = sh * aspectRatio;
      if (rh > sh) {
        rh = sh;
      } else {
        rw = sw;
      }
      return [rw, rh];
    }
    function optimizeWithMenu(sw, sh) {
      const opth = optimum(sw, sh - uiSize.value);
      const optv = optimum(sw - uiSize.value, sh);
      if (opth[0] * opth[1] > optv[0] * optv[1]) {
        return [opth[0], opth[1], false];
      } else {
        return [optv[0], optv[1], true];
      }
    }
    function updateArea() {
      const [cw, ch, v] = optimizeWithMenu(
        document.documentElement.clientWidth,
        document.documentElement.clientHeight
      );
      canvasWidth.value = cw;
      canvasHeight.value = ch;
      if (store2.state.ui.vertical === v)
        return;
      store2.commit("ui/setVertical", v);
    }
    updateArea();
    onMounted(() => {
      window.addEventListener("resize", updateArea);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", updateArea);
    });
    const systemPrefersDarkMode = ref(false);
    const userPrefersDarkMode = computed(() => store2.state.ui.useDarkTheme);
    const useDarkTheme = computed(
      () => {
        var _a2;
        return (_a2 = userPrefersDarkMode.value) != null ? _a2 : systemPrefersDarkMode.value;
      }
    );
    watch(
      () => useDarkTheme.value,
      (value) => {
        document.body.classList.toggle("dark-theme", value);
      },
      { immediate: true }
    );
    if (window.matchMedia != null) {
      const matcher = window.matchMedia("(prefers-color-scheme: dark)");
      systemPrefersDarkMode.value = matcher.matches;
      const handler = (match) => systemPrefersDarkMode.value = match.matches;
      if (matcher.addEventListener) {
        matcher.addEventListener("change", handler);
      } else {
        matcher.addListener(handler);
      }
    }
    const expressionBuilderVisible = ref(false);
    const expressionBuilderCharacter = ref("");
    const expressionBuilderHeadGroup = ref(void 0);
    function showExpressionDialog(e) {
      expressionBuilderVisible.value = true;
      expressionBuilderCharacter.value = e.character;
      expressionBuilderHeadGroup.value = e.headGroup;
    }
    const packDialog = ref(null);
    const dialogVisable = ref(false);
    function showDialog(search) {
      dialogVisable.value = true;
      if (search == null)
        return;
      const wait = () => {
        if (packDialog.value) {
          packDialog.value.setSearch(search);
        } else {
          setTimeout(wait, packDialogWaitMs);
        }
      };
      nextTick(wait);
    }
    const nsfw = computed(() => store2.state.ui.nsfw);
    watch(
      () => nsfw.value,
      (value) => __async2(this, null, function* () {
        if (value) {
          yield store2.dispatch("content/loadContentPacks", NsfwPaths);
        } else {
          yield store2.dispatch("removePacks", {
            packs: NsfwNames
          });
        }
      })
    );
    let queuedRerender = null;
    function rerender() {
      if (queuedRerender != null)
        return;
      queuedRerender = requestAnimationFrame(() => {
        queuedRerender = null;
        eventBus$1.fire(new InvalidateRenderEvent());
      });
    }
    function onKeydown(e) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        console.log("skip keydown on potential target");
        return;
      }
      transaction(() => __async2(this, null, function* () {
        const ctrl = e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey;
        const noMod = !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey;
        if (ctrl && e.key === "v") {
          yield store2.dispatch(
            "panels/pasteObjectFromClipboard",
            {}
          );
          e.preventDefault();
          return;
        }
        if (noMod && e.key === "Escape") {
          if (store2.state.ui.selection === null)
            return;
          store2.commit("ui/setSelection", null);
          return;
        }
        const selectionPanel = store2.state.panels.panels[store2.state.panels.currentPanel];
        const selection = selectionPanel.objects[store2.state.ui.selection];
        if (selection == null)
          return;
        if (ctrl) {
          if (e.key === "c" || e.key === "x") {
            yield store2.dispatch("panels/copyObjectToClipboard", {
              id: selection.id,
              panelId: selection.panelId
            });
            if (e.key === "x") {
              yield store2.dispatch("panels/removeObject", {
                id: selection.id,
                panelId: selection.panelId
              });
            }
            e.preventDefault();
            return;
          }
        } else if (noMod) {
          if (e.key === "Delete") {
            yield store2.dispatch("panels/removeObject", {
              id: selection.id,
              panelId: selection.panelId
            });
            return;
          }
          if (e.key === "/" || e.key === "*") {
            let delta = e.key === "/" ? -10 : 10;
            if (e.shiftKey) {
              delta /= Math.abs(delta);
            }
            store2.commit("panels/setRotation", {
              id: selection.id,
              panelId: selection.panelId,
              rotation: selection.rotation + delta
            });
            e.stopPropagation();
            e.preventDefault();
            return;
          }
          if (selection.type === "character") {
            const character = selection;
            if (!character.freeMove) {
              if (e.key === "ArrowLeft") {
                yield store2.dispatch("panels/shiftCharacterSlot", {
                  id: character.id,
                  panelId: character.panelId,
                  delta: -1
                });
                return;
              }
              if (e.key === "ArrowRight") {
                yield store2.dispatch("panels/shiftCharacterSlot", {
                  id: character.id,
                  panelId: character.panelId,
                  delta: 1
                });
                return;
              }
            }
          }
          let { x, y } = selection;
          const stepSize = e.shiftKey ? 1 : arrowMoveStepSize;
          switch (e.key) {
            case "ArrowLeft":
              x -= stepSize;
              break;
            case "ArrowRight":
              x += stepSize;
              break;
            case "ArrowUp":
              y -= stepSize;
              break;
            case "ArrowDown":
              y += stepSize;
              break;
            default:
              return;
          }
          yield store2.dispatch("panels/setPosition", {
            id: selection.id,
            panelId: selection.panelId,
            x,
            y
          });
        }
      }));
    }
    onMounted(() => {
      window.addEventListener("keydown", onKeydown);
    });
    onUnmounted(() => {
      window.removeEventListener("keydown", onKeydown);
    });
    let ctrlTimeout = null;
    let ctrlShown = false;
    function testShortcutKey(e) {
      if (e.ctrlKey) {
        if (!ctrlShown && ctrlTimeout === null) {
          ctrlTimeout = setTimeout(showCtrlLabels);
        }
      } else {
        removeCtrlLables();
      }
    }
    function showCtrlLabels() {
      document.body.classList.add("ctrl-key");
      ctrlShown = true;
    }
    function removeCtrlLables() {
      if (ctrlTimeout !== null) {
        clearTimeout(ctrlTimeout);
        ctrlTimeout = null;
      }
      document.body.classList.remove("ctrl-key");
      ctrlShown = false;
    }
    onMounted(() => {
      for (const eventType of ["keydown", "keyup", "mousemove"]) {
        window.addEventListener(eventType, testShortcutKey, true);
      }
      window.addEventListener("blur", removeCtrlLables);
    });
    onUnmounted(() => {
      for (const eventType of ["keydown", "keyup", "mousemove"]) {
        window.removeEventListener(eventType, testShortcutKey, true);
      }
      window.removeEventListener("blur", removeCtrlLables);
    });
    function select(id) {
      transaction(() => {
        if (store2.state.ui.selection === id)
          return;
        store2.commit("ui/setSelection", id);
      });
    }
    watch(
      () => store2.state.ui.selection,
      (id) => {
        var _a2, _b;
        if (((_a2 = document.activeElement) == null ? void 0 : _a2.getAttribute("data-obj-id")) !== "" + id) {
          (_b = document.querySelector(`*[data-obj-id='${id}']`)) == null ? void 0 : _b.focus({
            focusVisible: false,
            preventScroll: true
          });
        }
      },
      { immediate: true }
    );
    Repo.setStore(store2);
    window.store = store2;
    window.env = envX;
    onMounted(() => __async2(this, null, function* () {
      yield envX.loadGameMode();
      envX.connectToStore(store2);
      preLoading.value = false;
      const settings = yield envX.loadSettings();
      yield transaction(() => __async2(this, null, function* () {
        var _a2, _b, _c, _d;
        envX.state.looseTextParsing = settings.looseTextParsing || true;
        store2.commit("ui/setLqRendering", (_a2 = settings.lq) != null ? _a2 : false);
        store2.commit("ui/setDarkTheme", (_b = settings.darkMode) != null ? _b : null);
        store2.commit(
          "ui/setDefaultCharacterTalkingZoom",
          (_c = settings.defaultCharacterTalkingZoom) != null ? _c : true
        );
        yield store2.dispatch("content/loadContentPacks", [
          `${baseUrl}packs/buildin.base.backgrounds.json`,
          `${baseUrl}packs/buildin.base.monika.json`,
          `${baseUrl}packs/buildin.base.sayori.json`,
          `${baseUrl}packs/buildin.base.natsuki.json`,
          `${baseUrl}packs/buildin.base.yuri.json`,
          `${baseUrl}packs/buildin.extra.mc.json`,
          `${baseUrl}packs/buildin.extra.concept_mc.json`,
          `${baseUrl}packs/buildin.extra.mc_chad.json`,
          `${baseUrl}packs/buildin.extra.femc.json`,
          `${baseUrl}packs/buildin.extra.concept_femc.json`,
          `${baseUrl}packs/buildin.extra.amy.json`
        ]);
        yield envX.loadContentPacks();
        const panelId = yield store2.dispatch("panels/createPanel");
        if (Object.keys(store2.state.panels.panels[panelId].objects).length === 0) {
          yield store2.dispatch("panels/createTextBox", {
            panelId,
            text: `Hi! Click here to edit this textbox! ${store2.state.ui.vertical ? "To the right" : "At the bottom"} you find the toolbox. There you can add things (try clicking the chibis), change backgrounds and more! Use the camera icon to download the image.`
          });
        }
        store2.commit("panels/setCurrentBackground", {
          current: "dddg.buildin.backgrounds:ddlc.clubroom",
          panelId: store2.state.panels.currentPanel
        });
        store2.commit("ui/setNsfw", (_d = settings.nsfw) != null ? _d : false);
      }));
    }));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(Fragment, null, [
        createBaseVNode("div", _hoisted_1, [
          createBaseVNode("div", _hoisted_2, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(objects.value, (obj) => {
              return openBlock(), createElementBlock("div", {
                key: obj,
                tabindex: "0",
                "data-obj-id": obj,
                onFocus: _cache[0] || (_cache[0] = ($event) => rerender()),
                onBlur: _cache[1] || (_cache[1] = ($event) => rerender()),
                onKeydown: [
                  withKeys(withModifiers(($event) => select(obj), ["prevent"]), ["enter"]),
                  withKeys(withModifiers(($event) => select(obj), ["prevent"]), ["space"])
                ]
              }, null, 40, _hoisted_3);
            }), 128))
          ]),
          createVNode(_sfc_main$z, {
            ref_key: "renderer",
            ref: renderer2,
            canvasWidth: canvasWidth.value,
            canvasHeight: canvasHeight.value,
            preLoading: preLoading.value
          }, null, 8, ["canvasWidth", "canvasHeight", "preLoading"]),
          createVNode(MessageConsole),
          createVNode(_sfc_main$1, {
            onShowPrevRender: drawLastDownload,
            onDownload: _cache[2] || (_cache[2] = ($event) => renderer2.value.download()),
            onShowDialog: showDialog,
            onShowExpressionDialog: showExpressionDialog
          }),
          (openBlock(), createBlock(KeepAlive, null, [
            dialogVisable.value ? (openBlock(), createBlock(ModalDialog, {
              key: 0,
              ref: "dialog",
              onLeave: _cache[4] || (_cache[4] = ($event) => dialogVisable.value = false)
            }, {
              default: withCtx(() => [
                createVNode(unref(SingleBox), {
                  ref_key: "packDialog",
                  ref: packDialog,
                  onLeave: _cache[3] || (_cache[3] = ($event) => dialogVisable.value = false)
                }, null, 512)
              ]),
              _: 1
            }, 512)) : createCommentVNode("", true)
          ], 1024)),
          expressionBuilderVisible.value ? (openBlock(), createBlock(ModalDialog, {
            key: 0,
            ref: "dialog",
            onLeave: _cache[6] || (_cache[6] = ($event) => expressionBuilderVisible.value = false)
          }, {
            default: withCtx(() => [
              createVNode(unref(ExpressionBuilder), {
                character: expressionBuilderCharacter.value,
                initHeadGroup: expressionBuilderHeadGroup.value,
                onLeave: _cache[5] || (_cache[5] = ($event) => expressionBuilderVisible.value = false)
              }, null, 8, ["character", "initHeadGroup"])
            ]),
            _: 1
          }, 512)) : createCommentVNode("", true)
        ]),
        _hoisted_4
      ], 64);
    };
  }
});
const app_vue_vue_type_style_index_0_lang = "";
createApp(_sfc_main).use(store).mount("#main_wrapper");
export {
  onUnmounted as A,
  withDirectives as B,
  vModelText as C,
  createStaticVNode as D,
  onActivated as E,
  Fragment as F,
  safeAsync as G,
  eventBus$1 as H,
  reactive as I,
  renderSlot as J,
  DropTarget as K,
  verticalScrollRedirect as L,
  vModelSelect as M,
  DFieldset as N,
  getAssetByUrl as O,
  Renderer as P,
  transaction as Q,
  Repo as R,
  getAAssetUrl as S,
  TransitionGroup as T,
  Character as U,
  VueErrorEvent as V,
  AssetListRenderable as W,
  ScalingModes as X,
  SelectedState as Y,
  _export_sfc as _,
  createElementBlock as a,
  createBaseVNode as b,
  computed as c,
  defineComponent as d,
  renderList as e,
  createCommentVNode as f,
  createVNode as g,
  withCtx as h,
  nextTick as i,
  createTextVNode as j,
  unref as k,
  _sfc_main$n as l,
  createBlock as m,
  normalizeClass as n,
  openBlock as o,
  _sfc_main$k as p,
  normalizeStyle$1 as q,
  ref as r,
  withModifiers as s,
  toDisplayString as t,
  useStore as u,
  envX as v,
  watch as w,
  pushScopeId as x,
  popScopeId as y,
  onMounted as z
};
