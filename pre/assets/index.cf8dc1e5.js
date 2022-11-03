var __async = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
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
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
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
  } else if (isString(value)) {
    return value;
  } else if (isObject$1(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:(.+)/;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.split(listDelimiterRE).forEach((item) => {
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
  return val == null ? "" : isArray(val) || isObject$1(val) && (val.toString === objectToString || !isFunction(val.toString)) ? JSON.stringify(val, replacer, 2) : String(val);
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
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
const isArray = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isDate = (val) => val instanceof Date;
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject$1 = (val) => val !== null && typeof val === "object";
const isPromise$1 = (val) => {
  return isObject$1(val) && isFunction(val.then) && isFunction(val.catch);
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
const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
const toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
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
const toNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
let activeEffectScope;
const effectScopeStack = [];
class EffectScope {
  constructor(detached = false) {
    this.active = true;
    this.effects = [];
    this.cleanups = [];
    if (!detached && activeEffectScope) {
      this.parent = activeEffectScope;
      this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
    }
  }
  run(fn) {
    if (this.active) {
      try {
        this.on();
        return fn();
      } finally {
        this.off();
      }
    }
  }
  on() {
    if (this.active) {
      effectScopeStack.push(this);
      activeEffectScope = this;
    }
  }
  off() {
    if (this.active) {
      effectScopeStack.pop();
      activeEffectScope = effectScopeStack[effectScopeStack.length - 1];
    }
  }
  stop(fromParent) {
    if (this.active) {
      this.effects.forEach((e) => e.stop());
      this.cleanups.forEach((cleanup) => cleanup());
      if (this.scopes) {
        this.scopes.forEach((e) => e.stop(true));
      }
      if (this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.active = false;
    }
  }
}
function recordEffectScope(effect, scope) {
  scope = scope || activeEffectScope;
  if (scope && scope.active) {
    scope.effects.push(effect);
  }
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
const effectStack = [];
let activeEffect;
const ITERATE_KEY = Symbol("");
const MAP_KEY_ITERATE_KEY = Symbol("");
class ReactiveEffect {
  constructor(fn, scheduler = null, scope) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
    recordEffectScope(this, scope);
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    if (!effectStack.includes(this)) {
      try {
        effectStack.push(activeEffect = this);
        enableTracking();
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
        resetTracking();
        effectStack.pop();
        const n = effectStack.length;
        activeEffect = n > 0 ? effectStack[n - 1] : void 0;
      }
    }
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}
function cleanupEffect(effect) {
  const { deps } = effect;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
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
function enableTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = true;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function track(target, type, key) {
  if (!isTracking()) {
    return;
  }
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
function isTracking() {
  return shouldTrack && activeEffect !== void 0;
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
function trigger$1(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps = [];
  if (type === "clear") {
    deps = [...depsMap.values()];
  } else if (key === "length" && isArray(target)) {
    depsMap.forEach((dep, key2) => {
      if (key2 === "length" || key2 >= newValue) {
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
  for (const effect of isArray(dep) ? dep : [...dep]) {
    if (effect !== activeEffect || effect.allowRecurse) {
      if (effect.scheduler) {
        effect.scheduler();
      } else {
        effect.run();
      }
    }
  }
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol).map((key) => Symbol[key]).filter(isSymbol));
const get = /* @__PURE__ */ createGetter();
const shallowGet = /* @__PURE__ */ createGetter(false, true);
const readonlyGet = /* @__PURE__ */ createGetter(true);
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
function createGetter(isReadonly2 = false, shallow = false) {
  return function get3(target, key, receiver) {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw" && receiver === (isReadonly2 ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target)) {
      return target;
    }
    const targetIsArray = isArray(target);
    if (!isReadonly2 && targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver);
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
      const shouldUnwrap = !targetIsArray || !isIntegerKey(key);
      return shouldUnwrap ? res.value : res;
    }
    if (isObject$1(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  };
}
const set = /* @__PURE__ */ createSetter();
const shallowSet = /* @__PURE__ */ createSetter(true);
function createSetter(shallow = false) {
  return function set2(target, key, value, receiver) {
    let oldValue = target[key];
    if (!shallow && !isReadonly(value)) {
      value = toRaw(value);
      oldValue = toRaw(oldValue);
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value;
        return true;
      }
    }
    const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger$1(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger$1(target, "set", key, value);
      }
    }
    return result;
  };
}
function deleteProperty(target, key) {
  const hadKey = hasOwn(target, key);
  target[key];
  const result = Reflect.deleteProperty(target, key);
  if (result && hadKey) {
    trigger$1(target, "delete", key, void 0);
  }
  return result;
}
function has(target, key) {
  const result = Reflect.has(target, key);
  if (!isSymbol(key) || !builtInSymbols.has(key)) {
    track(target, "has", key);
  }
  return result;
}
function ownKeys(target) {
  track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
  return Reflect.ownKeys(target);
}
const mutableHandlers = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
};
const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    return true;
  },
  deleteProperty(target, key) {
    return true;
  }
};
const shallowReactiveHandlers = /* @__PURE__ */ extend({}, mutableHandlers, {
  get: shallowGet,
  set: shallowSet
});
const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function get$1(target, key, isReadonly2 = false, isShallow = false) {
  target = target["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (key !== rawKey) {
    !isReadonly2 && track(rawTarget, "get", key);
  }
  !isReadonly2 && track(rawTarget, "get", rawKey);
  const { has: has2 } = getProto(rawTarget);
  const wrap = isShallow ? toShallow : isReadonly2 ? toReadonly : toReactive;
  if (has2.call(rawTarget, key)) {
    return wrap(target.get(key));
  } else if (has2.call(rawTarget, rawKey)) {
    return wrap(target.get(rawKey));
  } else if (target !== rawTarget) {
    target.get(key);
  }
}
function has$1(key, isReadonly2 = false) {
  const target = this["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (key !== rawKey) {
    !isReadonly2 && track(rawTarget, "has", key);
  }
  !isReadonly2 && track(rawTarget, "has", rawKey);
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
    trigger$1(target, "add", value, value);
  }
  return this;
}
function set$1(key, value) {
  value = toRaw(value);
  const target = toRaw(this);
  const { has: has2, get: get3 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  const oldValue = get3.call(target, key);
  target.set(key, value);
  if (!hadKey) {
    trigger$1(target, "add", key, value);
  } else if (hasChanged(value, oldValue)) {
    trigger$1(target, "set", key, value);
  }
  return this;
}
function deleteEntry(key) {
  const target = toRaw(this);
  const { has: has2, get: get3 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  get3 ? get3.call(target, key) : void 0;
  const result = target.delete(key);
  if (hadKey) {
    trigger$1(target, "delete", key, void 0);
  }
  return result;
}
function clear() {
  const target = toRaw(this);
  const hadItems = target.size !== 0;
  const result = target.clear();
  if (hadItems) {
    trigger$1(target, "clear", void 0, void 0);
  }
  return result;
}
function createForEach(isReadonly2, isShallow) {
  return function forEach(callback, thisArg) {
    const observed = this;
    const target = observed["__v_raw"];
    const rawTarget = toRaw(target);
    const wrap = isShallow ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
    return target.forEach((value, key) => {
      return callback.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}
function createIterableMethod(method, isReadonly2, isShallow) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
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
      return get$1(this, key);
    },
    get size() {
      return size(this);
    },
    has: has$1,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  const shallowInstrumentations2 = {
    get(key) {
      return get$1(this, key, false, true);
    },
    get size() {
      return size(this);
    },
    has: has$1,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  const readonlyInstrumentations2 = {
    get(key) {
      return get$1(this, key, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, false)
  };
  const shallowReadonlyInstrumentations2 = {
    get(key) {
      return get$1(this, key, true, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, true)
  };
  const iteratorMethods = ["keys", "values", "entries", Symbol.iterator];
  iteratorMethods.forEach((method) => {
    mutableInstrumentations2[method] = createIterableMethod(method, false, false);
    readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
    shallowInstrumentations2[method] = createIterableMethod(method, false, true);
    shallowReadonlyInstrumentations2[method] = createIterableMethod(method, true, true);
  });
  return [
    mutableInstrumentations2,
    readonlyInstrumentations2,
    shallowInstrumentations2,
    shallowReadonlyInstrumentations2
  ];
}
const [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* @__PURE__ */ createInstrumentations();
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
    return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
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
  if (target && target["__v_isReadonly"]) {
    return target;
  }
  return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
}
function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
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
  const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
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
  if (isTracking()) {
    ref2 = toRaw(ref2);
    if (!ref2.dep) {
      ref2.dep = createDep();
    }
    {
      trackEffects(ref2.dep);
    }
  }
}
function triggerRefValue(ref2, newVal) {
  ref2 = toRaw(ref2);
  if (ref2.dep) {
    {
      triggerEffects(ref2.dep);
    }
  }
}
function isRef(r) {
  return Boolean(r && r.__v_isRef === true);
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
  constructor(value, _shallow) {
    this._shallow = _shallow;
    this.dep = void 0;
    this.__v_isRef = true;
    this._rawValue = _shallow ? value : toRaw(value);
    this._value = _shallow ? value : toReactive(value);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newVal) {
    newVal = this._shallow ? newVal : toRaw(newVal);
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = this._shallow ? newVal : toReactive(newVal);
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
  constructor(getter, _setter, isReadonly2) {
    this._setter = _setter;
    this.dep = void 0;
    this._dirty = true;
    this.__v_isRef = true;
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerRefValue(this);
      }
    });
    this["__v_isReadonly"] = isReadonly2;
  }
  get value() {
    const self2 = toRaw(this);
    trackRefValue(self2);
    if (self2._dirty) {
      self2._dirty = false;
      self2._value = self2.effect.run();
    }
    return self2._value;
  }
  set value(newValue) {
    this._setter(newValue);
  }
}
function computed(getterOrOptions, debugOptions) {
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
  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter);
  return cRef;
}
Promise.resolve();
function emit$1(instance, event, ...rawArgs) {
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modelArg = isModelListener2 && event.slice(7);
  if (modelArg && modelArg in props) {
    const modifiersKey = `${modelArg === "modelValue" ? "model" : modelArg}Modifiers`;
    const { number, trim } = props[modifiersKey] || EMPTY_OBJ;
    if (trim) {
      args = rawArgs.map((a) => a.trim());
    } else if (number) {
      args = rawArgs.map(toNumber);
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(handler, instance, 6, args);
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(onceHandler, instance, 6, args);
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
    cache.set(comp, null);
    return null;
  }
  if (isArray(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend(normalized, raw);
  }
  cache.set(comp, normalized);
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
    const res = fn(...args);
    setCurrentRenderingInstance(prevInstance);
    if (renderFnWithContext._d) {
      setBlockTracking(1);
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
  const { type: Component, vnode, proxy, withProxy, props, propsOptions: [propsOptions], slots, attrs, emit, render, renderCache, data, setupState, ctx, inheritAttrs } = instance;
  let result;
  let fallthroughAttrs;
  const prev = setCurrentRenderingInstance(instance);
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      result = normalizeVNode(render.call(proxyToUse, proxyToUse, renderCache, props, setupState, data, ctx));
      fallthroughAttrs = attrs;
    } else {
      const render2 = Component;
      if (false)
        ;
      result = normalizeVNode(render2.length > 1 ? render2(props, false ? {
        get attrs() {
          markAttrsAccessed();
          return attrs;
        },
        slots,
        emit
      } : { attrs, slots, emit }) : render2(props, null));
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
          fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
        }
        root = cloneVNode(root, fallthroughAttrs);
      }
    }
  }
  if (vnode.dirs) {
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
  if (instance) {
    const provides = instance.parent == null ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance.proxy) : defaultValue;
    } else
      ;
  }
}
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
const BaseTransitionImpl = {
  name: `BaseTransition`,
  props: {
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
  },
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    let prevTransitionKey;
    return () => {
      const children = slots.default && getTransitionRawChildren(slots.default(), true);
      if (!children || !children.length) {
        return;
      }
      const rawProps = toRaw(props);
      const { mode } = rawProps;
      const child = children[0];
      if (state.isLeaving) {
        return emptyPlaceholder(child);
      }
      const innerChild = getKeepAliveChild(child);
      if (!innerChild) {
        return emptyPlaceholder(child);
      }
      const enterHooks = resolveTransitionHooks(innerChild, rawProps, state, instance);
      setTransitionHooks(innerChild, enterHooks);
      const oldChild = instance.subTree;
      const oldInnerChild = oldChild && getKeepAliveChild(oldChild);
      let transitionKeyChanged = false;
      const { getTransitionKey } = innerChild.type;
      if (getTransitionKey) {
        const key = getTransitionKey();
        if (prevTransitionKey === void 0) {
          prevTransitionKey = key;
        } else if (key !== prevTransitionKey) {
          prevTransitionKey = key;
          transitionKeyChanged = true;
        }
      }
      if (oldInnerChild && oldInnerChild.type !== Comment && (!isSameVNodeType(innerChild, oldInnerChild) || transitionKeyChanged)) {
        const leavingHooks = resolveTransitionHooks(oldInnerChild, rawProps, state, instance);
        setTransitionHooks(oldInnerChild, leavingHooks);
        if (mode === "out-in") {
          state.isLeaving = true;
          leavingHooks.afterLeave = () => {
            state.isLeaving = false;
            instance.update();
          };
          return emptyPlaceholder(child);
        } else if (mode === "in-out" && innerChild.type !== Comment) {
          leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
            const leavingVNodesCache = getLeavingNodesForType(state, oldInnerChild);
            leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
            el._leaveCb = () => {
              earlyRemove();
              el._leaveCb = void 0;
              delete enterHooks.delayedLeave;
            };
            enterHooks.delayedLeave = delayedLeave;
          };
        }
      }
      return child;
    };
  }
};
const BaseTransition = BaseTransitionImpl;
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
  const { appear, mode, persisted = false, onBeforeEnter, onEnter, onAfterEnter, onEnterCancelled, onBeforeLeave, onLeave, onAfterLeave, onLeaveCancelled, onBeforeAppear, onAppear, onAfterAppear, onAppearCancelled } = props;
  const key = String(vnode.key);
  const leavingVNodesCache = getLeavingNodesForType(state, vnode);
  const callHook2 = (hook, args) => {
    hook && callWithAsyncErrorHandling(hook, instance, 9, args);
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
      if (el._leaveCb) {
        el._leaveCb(true);
      }
      const leavingVNode = leavingVNodesCache[key];
      if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el._leaveCb) {
        leavingVNode.el._leaveCb();
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
      const done = el._enterCb = (cancelled) => {
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
        el._enterCb = void 0;
      };
      if (hook) {
        hook(el, done);
        if (hook.length <= 1) {
          done();
        }
      } else {
        done();
      }
    },
    leave(el, remove2) {
      const key2 = String(vnode.key);
      if (el._enterCb) {
        el._enterCb(true);
      }
      if (state.isUnmounting) {
        return remove2();
      }
      callHook2(onBeforeLeave, [el]);
      let called = false;
      const done = el._leaveCb = (cancelled) => {
        if (called)
          return;
        called = true;
        remove2();
        if (cancelled) {
          callHook2(onLeaveCancelled, [el]);
        } else {
          callHook2(onAfterLeave, [el]);
        }
        el._leaveCb = void 0;
        if (leavingVNodesCache[key2] === vnode) {
          delete leavingVNodesCache[key2];
        }
      };
      leavingVNodesCache[key2] = vnode;
      if (onLeave) {
        onLeave(el, done);
        if (onLeave.length <= 1) {
          done();
        }
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
function emptyPlaceholder(vnode) {
  if (isKeepAlive(vnode)) {
    vnode = cloneVNode(vnode);
    vnode.children = null;
    return vnode;
  }
}
function getKeepAliveChild(vnode) {
  return isKeepAlive(vnode) ? vnode.children ? vnode.children[0] : void 0 : vnode;
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
function getTransitionRawChildren(children, keepComment = false) {
  let ret = [];
  let keyedFragmentCount = 0;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.type === Fragment) {
      if (child.patchFlag & 128)
        keyedFragmentCount++;
      ret = ret.concat(getTransitionRawChildren(child.children, keepComment));
    } else if (keepComment || child.type !== Comment) {
      ret.push(child);
    }
  }
  if (keyedFragmentCount > 1) {
    for (let i = 0; i < ret.length; i++) {
      ret[i].patchFlag = -2;
    }
  }
  return ret;
}
function defineComponent(options) {
  return isFunction(options) ? { setup: options, name: options.name } : options;
}
const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
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
        return new Promise((resolve2, reject) => {
          const userRetry = () => resolve2(retry());
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
        handleError(err, instance, 13, !errorComponent);
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
            const err = new Error(`Async component timed out after ${timeout}ms.`);
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
function createInnerComp(comp, { vnode: { ref: ref2, props, children } }) {
  const vnode = createVNode(comp, props, children);
  vnode.ref = ref2;
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
      return slots.default;
    }
    const cache = /* @__PURE__ */ new Map();
    const keys = /* @__PURE__ */ new Set();
    let current = null;
    const parentSuspense = instance.suspense;
    const { renderer: { p: patch, m: move, um: _unmount, o: { createElement } } } = sharedContext;
    const storageContainer = createElement("div");
    sharedContext.activate = (vnode, container, anchor, isSVG, optimized) => {
      const instance2 = vnode.component;
      move(vnode, container, anchor, 0, parentSuspense);
      patch(instance2.vnode, vnode, container, anchor, instance2, parentSuspense, isSVG, vnode.slotScopeIds, optimized);
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
      _unmount(vnode, instance, parentSuspense);
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
      if (!current || cached.type !== current.type) {
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
        if (cached.type === vnode.type) {
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
      const name = getComponentName(isAsyncWrapper(vnode) ? vnode.type.__asyncResolved || {} : comp);
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
      return rawVNode;
    };
  }
};
const KeepAlive = KeepAliveImpl;
function matches(pattern, name) {
  if (isArray(pattern)) {
    return pattern.some((p2) => matches(p2, name));
  } else if (isString(pattern)) {
    return pattern.split(",").indexOf(name) > -1;
  } else if (pattern.test) {
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
  const injected = injectHook(type, hook, keepAliveRoot, true);
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
function resetShapeFlag(vnode) {
  let shapeFlag = vnode.shapeFlag;
  if (shapeFlag & 256) {
    shapeFlag -= 256;
  }
  if (shapeFlag & 512) {
    shapeFlag -= 512;
  }
  vnode.shapeFlag = shapeFlag;
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
const createHook = (lifecycle) => (hook, target = currentInstance) => (!isInSSRComponentSetup || lifecycle === "sp") && injectHook(lifecycle, hook, target);
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook("bu");
const onUpdated = createHook("u");
const onBeforeUnmount = createHook("bum");
const onUnmounted = createHook("um");
const onServerPrefetch = createHook("sp");
const onRenderTriggered = createHook("rtg");
const onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
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
    filters: filters2
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties, instance.appContext.config.unwrapInjectedRef);
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
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP, unwrapRef = false) {
  if (isArray(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject$1(opt)) {
      if ("default" in opt) {
        injected = inject(opt.from || key, opt.default, true);
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (isRef(injected)) {
      if (unwrapRef) {
        Object.defineProperty(ctx, key, {
          enumerable: true,
          configurable: true,
          get: () => injected.value,
          set: (v) => injected.value = v
        });
      } else {
        ctx[key] = injected;
      }
    } else {
      ctx[key] = injected;
    }
  }
}
function callHook$1(hook, instance, type) {
  callWithAsyncErrorHandling(isArray(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy), instance, type);
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
  const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
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
      globalMixins.forEach((m) => mergeOptions(resolved, m, optionMergeStrategies, true));
    }
    mergeOptions(resolved, base, optionMergeStrategies);
  }
  cache.set(base, resolved);
  return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach((m) => mergeOptions(to, m, strats, true));
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
  props: mergeObjectOptions,
  emits: mergeObjectOptions,
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
    return extend(isFunction(to) ? to.call(this, this) : to, isFunction(from) ? from.call(this, this) : from);
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
  return to ? extend(extend(/* @__PURE__ */ Object.create(null), to), from) : from;
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
  const { props, attrs, vnode: { patchFlag } } = instance;
  const rawCurrentProps = toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if ((optimized || patchFlag > 0) && !(patchFlag & 16)) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value, instance, false);
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
            props[key] = resolvePropValue(options, rawCurrentProps, key, void 0, instance, true);
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key)) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger$1(instance, "set", "$attrs");
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
      props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !hasOwn(castValues, key));
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
      if (opt.type !== Function && isFunction(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(null, props);
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
    cache.set(comp, EMPTY_ARR);
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
        const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : opt;
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
  cache.set(comp, res);
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$") {
    return true;
  }
  return false;
}
function getType(ctor) {
  const match = ctor && ctor.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : ctor === null ? "null" : "";
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
  const normalized = withCtx((...args) => {
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
      normalizeObjectSlots(children, instance.slots = {});
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
      if (!isInternalKey(key) && !(key in deletionComparisonTarget)) {
        delete slots[key];
      }
    }
  }
};
function withDirectives(vnode, directives) {
  const internalInstance = currentRenderingInstance;
  if (internalInstance === null) {
    return vnode;
  }
  const instance = internalInstance.proxy;
  const bindings = vnode.dirs || (vnode.dirs = []);
  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
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
let uid = 0;
function createAppAPI(render, hydrate) {
  return function createApp2(rootComponent, rootProps = null) {
    if (rootProps != null && !isObject$1(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new Set();
    let isMounted = false;
    const app = context.app = {
      _uid: uid++,
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
      }
    };
    return app;
  };
}
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray(rawRef)) {
    rawRef.forEach((r, i) => setRef(r, oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount));
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
          const existing = _isString ? refs[ref2] : ref2.value;
          if (isUnmount) {
            isArray(existing) && remove(existing, refValue);
          } else {
            if (!isArray(existing)) {
              if (_isString) {
                refs[ref2] = [refValue];
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
        } else if (isRef(ref2)) {
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
  const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, cloneNode: hostCloneNode, insertStaticContent: hostInsertStaticContent } = options;
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
        processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        break;
      default:
        if (shapeFlag & 1) {
          processElement(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else if (shapeFlag & 6) {
          processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else if (shapeFlag & 64) {
          type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
        } else if (shapeFlag & 128) {
          type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
        } else
          ;
    }
    if (ref2 != null && parentComponent) {
      setRef(ref2, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(n2.el = hostCreateText(n2.children), container, anchor);
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(n2.el = hostCreateComment(n2.children || ""), container, anchor);
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, isSVG) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, isSVG);
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
      mountElement(n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    } else {
      patchElement(n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { type, props, shapeFlag, transition, patchFlag, dirs } = vnode;
    if (vnode.el && hostCloneNode !== void 0 && patchFlag === -1) {
      el = vnode.el = hostCloneNode(vnode.el);
    } else {
      el = vnode.el = hostCreateElement(vnode.type, isSVG, props && props.is, props);
      if (shapeFlag & 8) {
        hostSetElementText(el, vnode.children);
      } else if (shapeFlag & 16) {
        mountChildren(vnode.children, el, null, parentComponent, parentSuspense, isSVG && type !== "foreignObject", slotScopeIds, optimized);
      }
      if (dirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "created");
      }
      if (props) {
        for (const key in props) {
          if (key !== "value" && !isReservedProp(key)) {
            hostPatchProp(el, key, null, props[key], isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
          }
        }
        if ("value" in props) {
          hostPatchProp(el, "value", null, props.value);
        }
        if (vnodeHook = props.onVnodeBeforeMount) {
          invokeVNodeHook(vnodeHook, parentComponent, vnode);
        }
      }
      setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
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
        setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, start = 0) => {
    for (let i = start; i < children.length; i++) {
      const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
      patch(null, child, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
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
      patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds);
    } else if (!optimized) {
      patchChildren(n1, n2, el, null, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds, false);
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
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
              hostPatchProp(el, key, prev, next, isSVG, n1.children, parentComponent, parentSuspense, unmountChildren);
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
      patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
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
      patch(oldVNode, newVNode, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, true);
    }
  };
  const patchProps = (el, vnode, oldProps, newProps, parentComponent, parentSuspense, isSVG) => {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        if (isReservedProp(key))
          continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(el, key, prev, next, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
        }
      }
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
          }
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
      mountChildren(n2.children, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && n1.dynamicChildren) {
        patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, isSVG, slotScopeIds);
        if (n2.key != null || parentComponent && n2 === parentComponent.subTree) {
          traverseStaticChildren(n1, n2, true);
        }
      } else {
        patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(n2, container, anchor, isSVG, optimized);
      } else {
        mountComponent(n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
    const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense);
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
    setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized);
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
      n2.component = n1.component;
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
            hydrateNode(el, instance.subTree, instance, parentSuspense, null);
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
          patch(null, subTree, container, anchor, instance, parentSuspense, isSVG);
          initialVNode.el = subTree.el;
        }
        if (m) {
          queuePostRenderEffect(m, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
        }
        if (initialVNode.shapeFlag & 256) {
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
          queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next, vnode), parentSuspense);
        }
      }
    };
    const effect = instance.effect = new ReactiveEffect(
      componentUpdateFn,
      () => queueJob(instance.update),
      instance.scope
    );
    const update3 = instance.update = effect.run.bind(effect);
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
    flushPreFlushCbs(void 0, instance.update);
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
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
          patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
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
      patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
    if (oldLength > newLength) {
      unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
    } else {
      mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, commonLength);
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
        patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
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
          patch(null, c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]), container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
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
          patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
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
          patch(null, nextChild, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
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
    const needTransition = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition) {
      if (moveType === 0) {
        transition.beforeEnter(el);
        hostInsert(el, container, anchor);
        queuePostRenderEffect(() => transition.enter(el), parentSuspense);
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove3 = () => hostInsert(el, container, anchor);
        const performLeave = () => {
          leave(el, () => {
            remove3();
            afterLeave && afterLeave();
          });
        };
        if (delayLeave) {
          delayLeave(el, remove3, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const { type, props, ref: ref2, children, dynamicChildren, shapeFlag, patchFlag, dirs } = vnode;
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
        vnode.type.remove(vnode, parentComponent, parentSuspense, optimized, internals, doRemove);
      } else if (dynamicChildren && (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
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
      removeFragment(el, anchor);
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
    [hydrate, hydrateNode] = createHydrationFns(internals);
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
    const { mc: mountChildren, pc: patchChildren, pbc: patchBlockChildren, o: { insert, querySelector, createText, createComment } } = internals;
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
          mountChildren(children, container2, anchor2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
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
        patchBlockChildren(n1.dynamicChildren, dynamicChildren, currentContainer, parentComponent, parentSuspense, isSVG, slotScopeIds);
        traverseStaticChildren(n1, n2, true);
      } else if (!optimized) {
        patchChildren(n1, n2, currentContainer, currentAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, false);
      }
      if (disabled) {
        if (!wasDisabled) {
          moveTeleport(n2, container, mainAnchor, internals, 1);
        }
      } else {
        if ((n2.props && n2.props.to) !== (n1.props && n1.props.to)) {
          const nextTarget = n2.target = resolveTarget(n2.props, querySelector);
          if (nextTarget) {
            moveTeleport(n2, nextTarget, null, internals, 0);
          }
        } else if (wasDisabled) {
          moveTeleport(n2, target, targetAnchor, internals, 1);
        }
      }
    }
  },
  remove(vnode, parentComponent, parentSuspense, optimized, { um: unmount, o: { remove: hostRemove } }, doRemove) {
    const { shapeFlag, children, anchor, targetAnchor, target, props } = vnode;
    if (target) {
      hostRemove(targetAnchor);
    }
    if (doRemove || !isTeleportDisabled(props)) {
      hostRemove(anchor);
      if (shapeFlag & 16) {
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          unmount(child, parentComponent, parentSuspense, true, !!child.dynamicChildren);
        }
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
        move(children[i], container, parentAnchor, 2);
      }
    }
  }
  if (isReorder) {
    insert(anchor, container, parentAnchor);
  }
}
function hydrateTeleport(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, { o: { nextSibling, parentNode, querySelector } }, hydrateChildren) {
  const target = vnode.target = resolveTarget(vnode.props, querySelector);
  if (target) {
    const targetNode = target._lpa || target.firstChild;
    if (vnode.shapeFlag & 16) {
      if (isTeleportDisabled(vnode.props)) {
        vnode.anchor = hydrateChildren(nextSibling(node), vnode, parentNode(node), parentComponent, parentSuspense, slotScopeIds, optimized);
        vnode.targetAnchor = targetNode;
      } else {
        vnode.anchor = nextSibling(node);
        vnode.targetAnchor = hydrateChildren(targetNode, vnode, target, parentComponent, parentSuspense, slotScopeIds, optimized);
      }
      target._lpa = vnode.targetAnchor && nextSibling(vnode.targetAnchor);
    }
  }
  return vnode.anchor && nextSibling(vnode.anchor);
}
const Teleport = TeleportImpl;
const COMPONENTS = "components";
function resolveComponent(name, maybeSelfReference) {
  return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
}
const NULL_DYNAMIC_COMPONENT = Symbol();
function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
  const instance = currentRenderingInstance || currentInstance;
  if (instance) {
    const Component = instance.type;
    if (type === COMPONENTS) {
      const selfName = getComponentName(Component);
      if (selfName && (selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))) {
        return Component;
      }
    }
    const res = resolve(instance[type] || Component[type], name) || resolve(instance.appContext[type], name);
    if (!res && maybeSelfReference) {
      return Component;
    }
    return res;
  }
}
function resolve(registry, name) {
  return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))]);
}
const Fragment = Symbol(void 0);
const Text = Symbol(void 0);
const Comment = Symbol(void 0);
const Static = Symbol(void 0);
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
  return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true));
}
function createBlock(type, props, children, patchFlag, dynamicProps) {
  return setupBlock(createVNode(type, props, children, patchFlag, dynamicProps, true));
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
const InternalObjectKey = `__vInternal`;
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({ ref: ref2, ref_key, ref_for }) => {
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
    appContext: null
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
    const cloned = cloneVNode(type, props, true);
    if (children) {
      normalizeChildren(cloned, children);
    }
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
  return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
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
    anchor: vnode.anchor
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
  return child.el === null || child.memo ? child : cloneVNode(child);
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
        if (existing !== incoming && !(isArray(existing) && existing.includes(incoming))) {
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
      ret = Array.from(source, (item, i) => renderItem(item, i, void 0, cached && cached[i]));
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
  if (currentRenderingInstance.isCE) {
    return createVNode("slot", name === "default" ? null : { name }, fallback && fallback());
  }
  let slot = slots[name];
  if (slot && slot._c) {
    slot._d = false;
  }
  openBlock();
  const validSlotContent = slot && ensureValidVNode(slot(props));
  const rendered = createBlock(Fragment, { key: props.key || `_${name}` }, validSlotContent || (fallback ? fallback() : []), validSlotContent && slots._ === 1 ? 64 : -2);
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
const publicPropertiesMap = extend(/* @__PURE__ */ Object.create(null), {
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
  $forceUpdate: (i) => () => queueJob(i.update),
  $nextTick: (i) => nextTick.bind(i.proxy),
  $watch: (i) => instanceWatch.bind(i)
});
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
      } else if (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) {
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
    if (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) {
      setupState[key] = value;
    } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
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
  has({ _: { data, setupState, accessCache, ctx, appContext, propsOptions } }, key) {
    let normalizedProps;
    return !!accessCache[key] || data !== EMPTY_OBJ && hasOwn(data, key) || setupState !== EMPTY_OBJ && hasOwn(setupState, key) || (normalizedProps = propsOptions[0]) && hasOwn(normalizedProps, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key);
  }
};
const emptyAppContext = createAppContext();
let uid$1 = 0;
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid$1++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    next: null,
    subTree: null,
    effect: null,
    update: null,
    scope: new EffectScope(true),
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
  instance.emit = emit$1.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
const setCurrentInstance = (instance) => {
  currentInstance = instance;
  instance.scope.on();
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  currentInstance = null;
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
    const setupResult = callWithErrorHandling(setup, instance, 0, [instance.props, setupContext]);
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
      const template = Component.template;
      if (template) {
        const { isCustomElement, compilerOptions } = instance.appContext.config;
        const { delimiters, compilerOptions: componentCompilerOptions } = Component;
        const finalCompilerOptions = extend(extend({
          isCustomElement,
          delimiters
        }, compilerOptions), componentCompilerOptions);
        Component.render = compile(template, finalCompilerOptions);
      }
    }
    instance.render = Component.render || NOOP;
  }
  {
    setCurrentInstance(instance);
    pauseTracking();
    applyOptions(instance);
    resetTracking();
    unsetCurrentInstance();
  }
}
function createAttrsProxy(instance) {
  return new Proxy(instance.attrs, {
    get(target, key) {
      track(instance, "get", "$attrs");
      return target[key];
    }
  });
}
function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };
  let attrs;
  {
    return {
      get attrs() {
        return attrs || (attrs = createAttrsProxy(instance));
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
      }
    }));
  }
}
function getComponentName(Component) {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name;
}
function isClassComponent(value) {
  return isFunction(value) && "__vccOpts" in value;
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
      callWithErrorHandling(appErrorHandler, null, 10, [err, exposedInstance, errorInfo]);
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
const pendingPreFlushCbs = [];
let activePreFlushCbs = null;
let preFlushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = Promise.resolve();
let currentFlushPromise = null;
let currentPreFlushParentJob = null;
function nextTick(fn) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
}
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJobId = getId(queue[middle]);
    middleJobId < id ? start = middle + 1 : end = middle;
  }
  return start;
}
function queueJob(job) {
  if ((!queue.length || !queue.includes(job, isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex)) && job !== currentPreFlushParentJob) {
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
function queueCb(cb, activeQueue, pendingQueue, index) {
  if (!isArray(cb)) {
    if (!activeQueue || !activeQueue.includes(cb, cb.allowRecurse ? index + 1 : index)) {
      pendingQueue.push(cb);
    }
  } else {
    pendingQueue.push(...cb);
  }
  queueFlush();
}
function queuePreFlushCb(cb) {
  queueCb(cb, activePreFlushCbs, pendingPreFlushCbs, preFlushIndex);
}
function queuePostFlushCb(cb) {
  queueCb(cb, activePostFlushCbs, pendingPostFlushCbs, postFlushIndex);
}
function flushPreFlushCbs(seen2, parentJob = null) {
  if (pendingPreFlushCbs.length) {
    currentPreFlushParentJob = parentJob;
    activePreFlushCbs = [...new Set(pendingPreFlushCbs)];
    pendingPreFlushCbs.length = 0;
    for (preFlushIndex = 0; preFlushIndex < activePreFlushCbs.length; preFlushIndex++) {
      activePreFlushCbs[preFlushIndex]();
    }
    activePreFlushCbs = null;
    preFlushIndex = 0;
    currentPreFlushParentJob = null;
    flushPreFlushCbs(seen2, parentJob);
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
function flushJobs(seen2) {
  isFlushPending = false;
  isFlushing = true;
  flushPreFlushCbs(seen2);
  queue.sort((a, b) => getId(a) - getId(b));
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
    if (queue.length || pendingPreFlushCbs.length || pendingPostFlushCbs.length) {
      flushJobs(seen2);
    }
  }
}
const INITIAL_WATCHER_VALUE = {};
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = EMPTY_OBJ) {
  const instance = currentInstance;
  let getter;
  let forceTrigger = false;
  let isMultiSource = false;
  if (isRef(source)) {
    getter = () => source.value;
    forceTrigger = !!source._shallow;
  } else if (isReactive(source)) {
    getter = () => source;
    deep = true;
  } else if (isArray(source)) {
    isMultiSource = true;
    forceTrigger = source.some(isReactive);
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
        return callWithAsyncErrorHandling(source, instance, 3, [onInvalidate]);
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
  let onInvalidate = (fn) => {
    cleanup = effect.onStop = () => {
      callWithErrorHandling(fn, instance, 4);
    };
  };
  if (isInSSRComponentSetup) {
    onInvalidate = NOOP;
    if (!cb) {
      getter();
    } else if (immediate) {
      callWithAsyncErrorHandling(cb, instance, 3, [
        getter(),
        isMultiSource ? [] : void 0,
        onInvalidate
      ]);
    }
    return NOOP;
  }
  let oldValue = isMultiSource ? [] : INITIAL_WATCHER_VALUE;
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
          oldValue === INITIAL_WATCHER_VALUE ? void 0 : oldValue,
          onInvalidate
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
    scheduler = () => {
      if (!instance || instance.isMounted) {
        queuePreFlushCb(job);
      } else {
        job();
      }
    };
  }
  const effect = new ReactiveEffect(getter, scheduler);
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect.run();
    }
  } else if (flush === "post") {
    queuePostRenderEffect(effect.run.bind(effect), instance && instance.suspense);
  } else {
    effect.run();
  }
  return () => {
    effect.stop();
    if (instance && instance.scope) {
      remove(instance.scope.effects, effect);
    }
  };
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
const version = "3.2.26";
const svgNS = "http://www.w3.org/2000/svg";
const doc = typeof document !== "undefined" ? document : null;
const staticTemplateCache = /* @__PURE__ */ new Map();
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
  cloneNode(el) {
    const cloned = el.cloneNode(true);
    if (`_value` in el) {
      cloned._value = el._value;
    }
    return cloned;
  },
  insertStaticContent(content2, parent, anchor, isSVG) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    let template = staticTemplateCache.get(content2);
    if (!template) {
      const t = doc.createElement("template");
      t.innerHTML = isSVG ? `<svg>${content2}</svg>` : content2;
      template = t.content;
      if (isSVG) {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      staticTemplateCache.set(content2, template);
    }
    parent.insertBefore(template.cloneNode(true), anchor);
    return [
      before ? before.nextSibling : parent.firstChild,
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};
function patchClass(el, value, isSVG) {
  const transitionClasses = el._vtc;
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
function patchStyle(el, prev, next) {
  const style = el.style;
  const isCssString = isString(next);
  if (next && !isCssString) {
    for (const key in next) {
      setStyle(style, key, next[key]);
    }
    if (prev && !isString(prev)) {
      for (const key in prev) {
        if (next[key] == null) {
          setStyle(style, key, "");
        }
      }
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
    if ("_vod" in el) {
      style.display = currentDisplay;
    }
  }
}
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
  if (isArray(val)) {
    val.forEach((v) => setStyle(style, name, v));
  } else {
    if (name.startsWith("--")) {
      style.setProperty(name, val);
    } else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) {
        style.setProperty(hyphenate(prefixed), val.replace(importantRE, ""), "important");
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
  if (key === "value" && el.tagName !== "PROGRESS" && !el.tagName.includes("-")) {
    el._value = value;
    const newValue = value == null ? "" : value;
    if (el.value !== newValue || el.tagName === "OPTION") {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    return;
  }
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      el[key] = includeBooleanAttr(value);
      return;
    } else if (value == null && type === "string") {
      el[key] = "";
      el.removeAttribute(key);
      return;
    } else if (type === "number") {
      try {
        el[key] = 0;
      } catch (_a) {
      }
      el.removeAttribute(key);
      return;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
  }
}
let _getNow = Date.now;
let skipTimestampCheck = false;
if (typeof window !== "undefined") {
  if (_getNow() > document.createEvent("Event").timeStamp) {
    _getNow = () => performance.now();
  }
  const ffMatch = navigator.userAgent.match(/firefox\/(\d+)/i);
  skipTimestampCheck = !!(ffMatch && Number(ffMatch[1]) <= 53);
}
let cachedNow = 0;
const p = Promise.resolve();
const reset = () => {
  cachedNow = 0;
};
const getNow = () => cachedNow || (p.then(reset), cachedNow = _getNow());
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el._vei || (el._vei = {});
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
  return [hyphenate(name.slice(2)), options];
}
function createInvoker(initialValue, instance) {
  const invoker = (e) => {
    const timeStamp = e.timeStamp || _getNow();
    if (skipTimestampCheck || timeStamp >= invoker.attached - 1) {
      callWithAsyncErrorHandling(patchStopImmediatePropagation(e, invoker.value), instance, 5, [e]);
    }
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
    return value.map((fn) => (e2) => !e2._stopped && fn(e2));
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
    patchDOMProp(el, key, nextValue, prevChildren, parentComponent, parentSuspense, unmountChildren);
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
  if (key === "spellcheck" || key === "draggable") {
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
const TRANSITION = "transition";
const ANIMATION = "animation";
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
const TransitionPropsValidators = /* @__PURE__ */ extend({}, BaseTransition.props, DOMTransitionPropsValidators);
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
  const { name = "v", type, duration, enterFromClass = `${name}-enter-from`, enterActiveClass = `${name}-enter-active`, enterToClass = `${name}-enter-to`, appearFromClass = enterFromClass, appearActiveClass = enterActiveClass, appearToClass = enterToClass, leaveFromClass = `${name}-leave-from`, leaveActiveClass = `${name}-leave-active`, leaveToClass = `${name}-leave-to` } = rawProps;
  const durations = normalizeDuration(duration);
  const enterDuration = durations && durations[0];
  const leaveDuration = durations && durations[1];
  const { onBeforeEnter, onEnter, onEnterCancelled, onLeave, onLeaveCancelled, onBeforeAppear = onBeforeEnter, onAppear = onEnter, onAppearCancelled = onEnterCancelled } = baseProps2;
  const finishEnter = (el, isAppear, done) => {
    removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
    removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
    done && done();
  };
  const finishLeave = (el, done) => {
    removeTransitionClass(el, leaveToClass);
    removeTransitionClass(el, leaveActiveClass);
    done && done();
  };
  const makeEnterHook = (isAppear) => {
    return (el, done) => {
      const hook = isAppear ? onAppear : onEnter;
      const resolve2 = () => finishEnter(el, isAppear, done);
      callHook(hook, [el, resolve2]);
      nextFrame(() => {
        removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
        addTransitionClass(el, isAppear ? appearToClass : enterToClass);
        if (!hasExplicitCallback(hook)) {
          whenTransitionEnds(el, type, enterDuration, resolve2);
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
      const resolve2 = () => finishLeave(el, done);
      addTransitionClass(el, leaveFromClass);
      forceReflow();
      addTransitionClass(el, leaveActiveClass);
      nextFrame(() => {
        removeTransitionClass(el, leaveFromClass);
        addTransitionClass(el, leaveToClass);
        if (!hasExplicitCallback(onLeave)) {
          whenTransitionEnds(el, type, leaveDuration, resolve2);
        }
      });
      callHook(onLeave, [el, resolve2]);
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
  (el._vtc || (el._vtc = /* @__PURE__ */ new Set())).add(cls);
}
function removeTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
  const { _vtc } = el;
  if (_vtc) {
    _vtc.delete(cls);
    if (!_vtc.size) {
      el._vtc = void 0;
    }
  }
}
function nextFrame(cb) {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
}
let endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve2) {
  const id = el._endId = ++endId;
  const resolveIfNotStale = () => {
    if (id === el._endId) {
      resolve2();
    }
  };
  if (explicitTimeout) {
    return setTimeout(resolveIfNotStale, explicitTimeout);
  }
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
  if (!type) {
    return resolve2();
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
  const transitionDelays = getStyleProperties(TRANSITION + "Delay");
  const transitionDurations = getStyleProperties(TRANSITION + "Duration");
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = getStyleProperties(ANIMATION + "Delay");
  const animationDurations = getStyleProperties(ANIMATION + "Duration");
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
  const hasTransform = type === TRANSITION && /\b(transform|all)(,|$)/.test(styles[TRANSITION + "Property"]);
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
  return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
}
function forceReflow() {
  return document.body.offsetHeight;
}
const positionMap = /* @__PURE__ */ new WeakMap();
const newPositionMap = /* @__PURE__ */ new WeakMap();
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
      if (!hasCSSTransform(prevChildren[0].el, instance.vnode.el, moveClass)) {
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
        const cb = el._moveCb = (e) => {
          if (e && e.target !== el) {
            return;
          }
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener("transitionend", cb);
            el._moveCb = null;
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
          setTransitionHooks(child, resolveTransitionHooks(child, cssTransitionProps, state, instance));
        }
      }
      if (prevChildren) {
        for (let i = 0; i < prevChildren.length; i++) {
          const child = prevChildren[i];
          setTransitionHooks(child, resolveTransitionHooks(child, cssTransitionProps, state, instance));
          positionMap.set(child, child.el.getBoundingClientRect());
        }
      }
      return createVNode(tag, null, children);
    };
  }
};
const TransitionGroup = TransitionGroupImpl;
function callPendingCbs(c) {
  const el = c.el;
  if (el._moveCb) {
    el._moveCb();
  }
  if (el._enterCb) {
    el._enterCb();
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
  if (el._vtc) {
    el._vtc.forEach((cls) => {
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
  const fn = vnode.props["onUpdate:modelValue"];
  return isArray(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
  e.target.composing = true;
}
function onCompositionEnd(e) {
  const target = e.target;
  if (target.composing) {
    target.composing = false;
    trigger(target, "input");
  }
}
function trigger(el, type) {
  const e = document.createEvent("HTMLEvents");
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
}
const vModelText = {
  created(el, { modifiers: { lazy, trim, number } }, vnode) {
    el._assign = getModelAssigner(vnode);
    const castToNumber = number || vnode.props && vnode.props.type === "number";
    addEventListener(el, lazy ? "change" : "input", (e) => {
      if (e.target.composing)
        return;
      let domValue = el.value;
      if (trim) {
        domValue = domValue.trim();
      } else if (castToNumber) {
        domValue = toNumber(domValue);
      }
      el._assign(domValue);
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
    el._assign = getModelAssigner(vnode);
    if (el.composing)
      return;
    if (document.activeElement === el) {
      if (lazy) {
        return;
      }
      if (trim && el.value.trim() === value) {
        return;
      }
      if ((number || el.type === "number") && toNumber(el.value) === value) {
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
    el._assign = getModelAssigner(vnode);
    addEventListener(el, "change", () => {
      const modelValue = el._modelValue;
      const elementValue = getValue(el);
      const checked = el.checked;
      const assign = el._assign;
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
    el._assign = getModelAssigner(vnode);
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
      const selectedVal = Array.prototype.filter.call(el.options, (o) => o.selected).map((o) => number ? toNumber(getValue(o)) : getValue(o));
      el._assign(el.multiple ? isSetModel ? new Set(selectedVal) : selectedVal : selectedVal[0]);
    });
    el._assign = getModelAssigner(vnode);
  },
  mounted(el, { value }) {
    setSelected(el, value);
  },
  beforeUpdate(el, _binding, vnode) {
    el._assign = getModelAssigner(vnode);
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
const rendererOptions = extend({ patchProp }, nodeOps);
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
  return Promise.all(deps.map((dep) => {
    dep = assetsURL(dep, importerUrl);
    if (dep in seen)
      return;
    seen[dep] = true;
    const isCss = dep.endsWith(".css");
    const cssSelector = isCss ? '[rel="stylesheet"]' : "";
    if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
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
var __publicField$r = (obj, key, value) => {
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
    __publicField$r(this, "kind", "AssetFailureEvent");
  }
}
__publicField$r(AssetFailureEvent, "kind", "AssetFailureEvent");
class FailureEvent {
  constructor(message) {
    this.message = message;
    __publicField$r(this, "kind", "FailureEvent");
  }
}
__publicField$r(FailureEvent, "kind", "FailureEvent");
class CustomAssetFailureEvent {
  constructor(error2) {
    this.error = error2;
    __publicField$r(this, "kind", "CustomAssetFailureEvent");
  }
}
__publicField$r(CustomAssetFailureEvent, "kind", "CustomAssetFailureEvent");
class InvalidateRenderEvent {
  constructor() {
    __publicField$r(this, "kind", "InvalidateRenderEvent");
  }
}
__publicField$r(InvalidateRenderEvent, "kind", "InvalidateRenderEvent");
const _RenderUpdatedEvent = class {
  constructor() {
    __publicField$r(this, "kind", _RenderUpdatedEvent.kind);
  }
};
let RenderUpdatedEvent = _RenderUpdatedEvent;
__publicField$r(RenderUpdatedEvent, "kind", "RenderUpdatedEvent");
const _StateLoadingEvent = class {
  constructor() {
    __publicField$r(this, "kind", _StateLoadingEvent.kind);
  }
};
let StateLoadingEvent = _StateLoadingEvent;
__publicField$r(StateLoadingEvent, "kind", "StateLoadingEvent");
class ShowMessageEvent {
  constructor(message) {
    this.message = message;
    __publicField$r(this, "kind", "ShowMessageEvent");
  }
}
__publicField$r(ShowMessageEvent, "kind", "ShowMessageEvent");
class ResolvableErrorEvent {
  constructor(message, actions2) {
    this.message = message;
    this.actions = actions2;
    __publicField$r(this, "kind", "ResolvableErrorEvent");
  }
}
__publicField$r(ResolvableErrorEvent, "kind", "ResolvableErrorEvent");
class ColorPickedEvent {
  constructor(color2) {
    this.color = color2;
    __publicField$r(this, "kind", "ColorPickedEvent");
  }
}
__publicField$r(ColorPickedEvent, "kind", "ColorPickedEvent");
class VueErrorEvent {
  constructor(error2, info) {
    this.error = error2;
    this.info = info;
    __publicField$r(this, "kind", "VueErrorEvent");
  }
}
__publicField$r(VueErrorEvent, "kind", "VueErrorEvent");
var __defProp$O = Object.defineProperty;
var __defNormalProp$O = (obj, key, value) => key in obj ? __defProp$O(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$q = (obj, key, value) => {
  __defNormalProp$O(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class ErrorAsset {
  constructor() {
    __publicField$q(this, "width", 0);
    __publicField$q(this, "height", 0);
  }
  paintOnto(_fsCtx) {
  }
}
var __defProp$N = Object.defineProperty;
var __defProps$n = Object.defineProperties;
var __getOwnPropDescs$n = Object.getOwnPropertyDescriptors;
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
var __spreadProps$n = (a, b) => __defProps$n(a, __getOwnPropDescs$n(b));
var __publicField$p = (obj, key, value) => {
  __defNormalProp$N(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$C = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const repoUrl = "https://edave64.github.io/Doki-Doki-Dialog-Generator-Packs/";
const _Repo = class {
  constructor(onlineRepo, localRepo, $store) {
    this.$store = $store;
    __publicField$p(this, "onlineRepo");
    __publicField$p(this, "localRepo");
    __publicField$p(this, "tempRepo", reactive({
      authors: {},
      packs: []
    }));
    __publicField$p(this, "combinedList");
    __publicField$p(this, "authors");
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
      var _a, _b;
      const onlineRepo2 = this.onlineRepo.value;
      const onlinePacks = (_a = onlineRepo2 == null ? void 0 : onlineRepo2.packs) != null ? _a : [];
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
        var _a2, _b2, _c;
        return __spreadProps$n(__spreadValues$u(__spreadValues$u(__spreadValues$u({}, (_a2 = onlineRepoLookup.get(packId)) != null ? _a2 : {
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
      var _a, _b;
      const onlineRepo2 = this.onlineRepo.value;
      const onlineAuthors = (_a = onlineRepo2 == null ? void 0 : onlineRepo2.authors) != null ? _a : {};
      const localRepo2 = this.localRepo.value;
      const localAuthors = (_b = localRepo2 == null ? void 0 : localRepo2.authors) != null ? _b : {};
      return __spreadValues$u(__spreadValues$u({}, onlineAuthors), localAuthors);
    });
    Object.freeze(this);
  }
  static getInstance() {
    if (!_Repo.instance)
      _Repo.instance = this.createInstance();
    return _Repo.instance;
  }
  static createInstance() {
    return __async$C(this, null, function* () {
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
    return __async$C(this, null, function* () {
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
    return __async$C(this, null, function* () {
      const req = yield fetch(path);
      if (!req.ok)
        throw new Error("Could not load json");
      return yield req.json();
    });
  }
  reloadLocalRepo() {
    return __async$C(this, null, function* () {
      this.localRepo.value = envX.supports.localRepo ? yield _Repo.loadRepo(envX.localRepositoryUrl) : null;
    });
  }
  getPacks() {
    return this.combinedList.value;
  }
  hasPack(id, onlineOnly = false) {
    var _a;
    if (onlineOnly) {
      return !!((_a = this.onlineRepo.value) == null ? void 0 : _a.packs.find((pack) => pack.id === id));
    }
    return !!this.getPacks().find((pack) => pack.id === id);
  }
  getPack(id) {
    var _a;
    return (_a = this.getPacks().find((pack) => pack.id === id)) != null ? _a : null;
  }
  getAuthor(id) {
    return this.authors.value[id] || null;
  }
  getAuthors() {
    return this.authors.value;
  }
  loadTempPack(url) {
    return __async$C(this, null, function* () {
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
__publicField$p(Repo, "instance");
__publicField$p(Repo, "setStore");
__publicField$p(Repo, "$store", new Promise(
  (resolve2, _reject) => {
    _Repo.setStore = resolve2;
  }
));
var __defProp$M = Object.defineProperty;
var __getOwnPropSymbols$t = Object.getOwnPropertySymbols;
var __hasOwnProp$t = Object.prototype.hasOwnProperty;
var __propIsEnum$t = Object.prototype.propertyIsEnumerable;
var __defNormalProp$M = (obj, key, value) => key in obj ? __defProp$M(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$t = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$t.call(b, prop))
      __defNormalProp$M(a, prop, b[prop]);
  if (__getOwnPropSymbols$t)
    for (var prop of __getOwnPropSymbols$t(b)) {
      if (__propIsEnum$t.call(b, prop))
        __defNormalProp$M(a, prop, b[prop]);
    }
  return a;
};
var __publicField$o = (obj, key, value) => {
  __defNormalProp$M(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$B = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const ua = navigator.userAgent;
const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
const webkit = !!ua.match(/WebKit/i);
const mobileSafari = iOS && webkit && !ua.match(/CriOS/i);
class Browser {
  constructor() {
    __publicField$o(this, "state", reactive({
      looseTextParsing: true,
      autoAdd: [],
      downloadLocation: "Default download folder"
    }));
    __publicField$o(this, "supports");
    __publicField$o(this, "_gameMode", null);
    __publicField$o(this, "vuexHistory", null);
    __publicField$o(this, "$store", null);
    __publicField$o(this, "isSavingEnabled", ref(false));
    __publicField$o(this, "localRepositoryUrl", "");
    __publicField$o(this, "loading");
    __publicField$o(this, "creatingDB");
    __publicField$o(this, "loadingContentPacksAllowed");
    __publicField$o(this, "loadContentPacks");
    const self2 = this;
    const canSave = IndexedDBHandler.canSave();
    window.addEventListener("beforeunload", function(e) {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? All your progress will be lost!";
    });
    this.loadingContentPacksAllowed = new Promise((resolve2, _reject) => {
      this.loadContentPacks = () => resolve2();
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
      this.loading = (() => __async$B(this, null, function* () {
        this.savingEnabled = yield IndexedDBHandler.doesDbExists();
      }))();
    } else {
      this.loading = Promise.resolve();
    }
    this.loading.then(() => __async$B(this, null, function* () {
      var _a;
      yield this.loadingContentPacksAllowed;
      if (this.creatingDB)
        yield this.creatingDB;
      if (this.savingEnabled) {
        const autoload = (_a = yield IndexedDBHandler.loadAutoload()) != null ? _a : [];
        this.state.autoAdd = autoload;
        const repo = yield Repo.getInstance();
        const packUrls = yield Promise.all(
          autoload.map((compoundId) => __async$B(this, null, function* () {
            var _a2;
            const [id, url] = compoundId.split(";", 2);
            if (url != null && !repo.hasPack(id)) {
              yield repo.loadTempPack(url);
            }
            const pack = repo.getPack(id);
            return (_a2 = pack.dddg2Path) != null ? _a2 : pack.dddg1Path;
          }))
        );
        yield this.vuexHistory.transaction(() => __async$B(this, null, function* () {
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
  loadGameMode() {
    return __async$B(this, null, function* () {
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
    return __async$B(this, null, function* () {
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
  connectToStore(vuexHistory, store2) {
    this.vuexHistory = vuexHistory;
    this.$store = store2;
  }
  saveToFile(downloadCanvas, filename, format = "image/png", quality = 1) {
    return __async$B(this, null, function* () {
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
    return __async$B(this, null, function* () {
      yield this.loading;
      yield this.creatingDB;
      yield IndexedDBHandler.saveAutoload([...this.state.autoAdd, id]);
      this.state.autoAdd.push(id);
    });
  }
  autoLoadRemove(id) {
    return __async$B(this, null, function* () {
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
    return __async$B(this, null, function* () {
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
      return __spreadValues$t(__spreadValues$t({}, base), yield IndexedDBHandler.loadSettings());
    });
  }
  saveSettings(settings) {
    return __async$B(this, null, function* () {
      yield this.loading;
      yield this.creatingDB;
      if (!this.isSavingEnabled.value)
        return;
      yield IndexedDBHandler.saveSettings(settings);
    });
  }
  isInitialized() {
    return __async$B(this, null, function* () {
      yield this.loading;
      yield this.creatingDB;
    });
  }
  prompt(message, defaultValue) {
    return new Promise((resolve2, _reject) => {
      resolve2(prompt(message, defaultValue));
    });
  }
  onPanelChange(_handler) {
    return;
  }
  createObjectURL(canvas, format, quality) {
    return new Promise((resolve2, reject) => {
      const canCreateObjectUrl = window.URL != null && window.URL.createObjectURL != null;
      if (!canCreateObjectUrl)
        return resolve2(canvas.toDataURL(format, quality));
      if (canvas.toBlob != null) {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject();
              return;
            }
            resolve2(URL.createObjectURL(blob));
          },
          format,
          quality
        );
      } else {
        const url = canvas.toDataURL(format, quality);
        const blob = this.dataURItoBlob(url, format);
        resolve2(URL.createObjectURL(blob));
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
    var _a, _b, _c;
    try {
      return (_c = (_b = (_a = window.indexedDB) != null ? _a : window.mozIndexedDB) != null ? _b : window.webkitIndexedDB) != null ? _c : window.msIndexedDB;
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
    return IndexedDBHandler.db = new Promise((resolve2, reject) => {
      const req = IndexedDBHandler.indexedDB.open("dddg", 3);
      req.onerror = (event) => {
        reject(event);
      };
      req.onupgradeneeded = (event) => {
        var _a;
        const db = event.target.result;
        const oldVer = (_a = event.oldVersion) != null ? _a : event.version;
        if (oldVer < 1) {
          db.createObjectStore("settings");
        }
        if (oldVer === 1) {
          db.deleteObjectStore("settings");
          db.createObjectStore("settings");
        }
      };
      req.onsuccess = (_event) => {
        resolve2(req.result);
      };
    });
  },
  clearDB() {
    return new Promise((resolve2, reject) => {
      if (!IndexedDBHandler.db) {
        resolve2();
        return;
      }
      const req = IndexedDBHandler.indexedDB.deleteDatabase("dddg");
      IndexedDBHandler.db = null;
      req.onerror = (event) => {
        reject(event);
      };
      req.onsuccess = (_event) => {
        resolve2();
      };
    });
  },
  loadAutoload() {
    return this.objectStorePromise("readonly", (store2) => __async$B(this, null, function* () {
      return yield this.reqPromise(store2.get("autoload"));
    }));
  },
  saveAutoload(autoloads) {
    return this.objectStorePromise("readwrite", (store2) => __async$B(this, null, function* () {
      yield this.reqPromise(store2.put([...autoloads], "autoload"));
    }));
  },
  loadGameMode() {
    return this.objectStorePromise("readonly", (store2) => __async$B(this, null, function* () {
      return yield this.reqPromise(store2.get("gameMode"));
    }));
  },
  saveGameMode(mode) {
    return this.objectStorePromise("readwrite", (store2) => __async$B(this, null, function* () {
      yield this.reqPromise(store2.put(mode, "gameMode"));
    }));
  },
  saveSettings(settings) {
    return this.objectStorePromise("readwrite", (store2) => __async$B(this, null, function* () {
      yield this.reqPromise(store2.put(__spreadValues$t({}, settings), "settings"));
    }));
  },
  loadSettings() {
    return this.objectStorePromise("readonly", (store2) => __async$B(this, null, function* () {
      return yield this.reqPromise(store2.get("settings"));
    }));
  },
  objectStorePromise(mode, callback) {
    if (!this.db)
      return Promise.reject(new Error("No database"));
    return new Promise((resolve2, reject) => __async$B(this, null, function* () {
      const transact = (yield this.db).transaction(["settings"], mode);
      const store2 = transact.objectStore("settings");
      try {
        resolve2(yield callback(store2));
      } catch (e) {
        reject(e);
      }
    }));
  },
  reqPromise(req) {
    return new Promise((resolve2, reject) => {
      req.onerror = (error2) => {
        reject(error2);
      };
      req.onsuccess = (_event) => {
        resolve2(req.result);
      };
    });
  }
};
var __async$A = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class OldEdge extends Browser {
  saveToFile(downloadCanvas, filename, format = "image/png", quality = 1) {
    return __async$A(this, null, function* () {
      let url = downloadCanvas.toDataURL(format, quality);
      const blob = this.dataURItoBlob(url, format);
      if (window.URL != null && window.URL.createObjectURL != null) {
        url = URL.createObjectURL(blob);
      }
      window.navigator.msSaveBlob(blob, filename);
      return url;
    });
  }
}
var __defProp$L = Object.defineProperty;
var __defNormalProp$L = (obj, key, value) => key in obj ? __defProp$L(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$n = (obj, key, value) => {
  __defNormalProp$L(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$z = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
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
    __publicField$n(this, "state", reactive({
      looseTextParsing: true,
      autoAdd: [],
      downloadLocation: ""
    }));
    __publicField$n(this, "localRepositoryUrl", "/repo/");
    __publicField$n(this, "_gameMode", null);
    __publicField$n(this, "electron", window);
    __publicField$n(this, "vuexHistory", null);
    __publicField$n(this, "$store", null);
    __publicField$n(this, "bgInvalidation", null);
    __publicField$n(this, "pendingContentPacks", []);
    __publicField$n(this, "pendingContentPacksReplace", []);
    __publicField$n(this, "loadingContentPacksAllowed");
    __publicField$n(this, "loadContentPacks");
    __publicField$n(this, "supports", {
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
    __publicField$n(this, "savingEnabled", true);
    this.loadingContentPacksAllowed = new Promise((resolve2, _reject) => {
      this.loadContentPacks = () => resolve2();
    });
    this.electron.ipcRenderer.on(
      "add-persistent-content-pack",
      (filePath) => __async$z(this, null, function* () {
        yield this.loadingContentPacksAllowed;
        if (!this.$store || !this.vuexHistory) {
          this.pendingContentPacks.push(filePath);
          return;
        }
        yield this.vuexHistory.transaction(() => __async$z(this, null, function* () {
          yield this.$store.dispatch("content/loadContentPacks", filePath);
        }));
      })
    );
    this.electron.ipcRenderer.on(
      "add-persistent-background",
      (filepath) => __async$z(this, null, function* () {
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
    this.electron.ipcRenderer.on("push-message", (message) => __async$z(this, null, function* () {
      eventBus$1.fire(new ShowMessageEvent(message));
    }));
    this.electron.ipcRenderer.on(
      "config.downloadFolderUpdate",
      (location2) => __async$z(this, null, function* () {
        this.state.downloadLocation = location2;
      })
    );
    this.electron.ipcRenderer.onConversation(
      "load-packs",
      (packIds) => __async$z(this, null, function* () {
        const repo = yield Repo.getInstance();
        const packUrls = yield Promise.all(
          packIds.map((compoundId) => __async$z(this, null, function* () {
            const [id, url] = compoundId.split(";", 2);
            if (url != null && !repo.hasPack(id)) {
              yield repo.loadTempPack(url);
            }
            const pack = repo.getPack(id);
            return pack.dddg2Path || pack.dddg1Path;
          }))
        );
        if (!this.$store || !this.vuexHistory) {
          packUrls.forEach((url) => this.pendingContentPacks.push(url));
          return;
        }
        yield this.vuexHistory.transaction(() => __async$z(this, null, function* () {
          yield this.$store.dispatch("content/loadContentPacks", packUrls);
        }));
      })
    );
    this.electron.ipcRenderer.onConversation(
      "auto-load.changed",
      (packIds) => __async$z(this, null, function* () {
        this.state.autoAdd = packIds;
      })
    );
    this.electron.ipcRenderer.onConversation("reload-repo", () => __async$z(this, null, function* () {
      yield (yield Repo.getInstance()).reloadLocalRepo();
    }));
    this.electron.ipcRenderer.onConversation(
      "replace-pack",
      (contentPack) => __async$z(this, null, function* () {
        const action = {
          processed: false,
          contentPack
        };
        if (!this.$store || !this.vuexHistory) {
          this.pendingContentPacksReplace.push(action);
        } else {
          yield this.vuexHistory.transaction(() => __async$z(this, null, function* () {
            yield this.$store.dispatch("content/replaceContentPack", action);
          }));
        }
      })
    );
    this.electron.ipcRenderer.onConversation(
      "resolvable-error",
      (message, actions2) => {
        return new Promise((resolve2, _reject) => {
          eventBus$1.fire(
            new ResolvableErrorEvent(
              message,
              actions2.map((action) => ({
                exec: () => resolve2(action),
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
  updateDownloadFolder() {
    this.electron.ipcRenderer.send("config.newDownloadFolder");
  }
  openFolder(folder) {
    this.electron.ipcRenderer.send("open-folder", folder);
  }
  onPanelChange(_handler) {
  }
  saveSettings(settings) {
    return __async$z(this, null, function* () {
      var _a;
      yield this.electron.ipcRenderer.sendConvo(
        "config.set",
        "nsfw",
        settings.nsfw
      );
      yield this.electron.ipcRenderer.sendConvo(
        "config.set",
        "darkMode",
        (_a = settings.darkMode) != null ? _a : void 0
      );
      yield this.electron.ipcRenderer.sendConvo(
        "config.set",
        "defaultCharacterTalkingZoom",
        settings.defaultCharacterTalkingZoom
      );
    });
  }
  loadGameMode() {
    return __async$z(this, null, function* () {
      this._gameMode = (yield this.electron.ipcRenderer.sendConvo("config.get", "gameMode")) || "ddlc";
    });
  }
  setGameMode(mode) {
    return __async$z(this, null, function* () {
      yield this.electron.ipcRenderer.sendConvo("config.set", "gameMode", mode);
      this.electron.ipcRenderer.send("reload");
    });
  }
  loadSettings() {
    return __async$z(this, null, function* () {
      var _a, _b, _c;
      return {
        lq: false,
        nsfw: (_a = yield this.electron.ipcRenderer.sendConvo("config.get", "nsfw")) != null ? _a : false,
        darkMode: (_b = yield this.electron.ipcRenderer.sendConvo("config.get", "darkMode")) != null ? _b : void 0,
        defaultCharacterTalkingZoom: (_c = yield this.electron.ipcRenderer.sendConvo(
          "config.get",
          "defaultCharacterTalkingZoom"
        )) != null ? _c : void 0
      };
    });
  }
  localRepoInstall(url, repo, authors) {
    return __async$z(this, null, function* () {
      yield this.electron.ipcRenderer.sendConvo(
        "repo.install",
        url,
        repo,
        authors
      );
    });
  }
  localRepoUninstall(id) {
    return __async$z(this, null, function* () {
      yield this.electron.ipcRenderer.sendConvo("repo.uninstall", id);
    });
  }
  autoLoadAdd(id) {
    return __async$z(this, null, function* () {
      yield this.electron.ipcRenderer.sendConvo("auto-load.add", id);
    });
  }
  autoLoadRemove(id) {
    return __async$z(this, null, function* () {
      yield this.electron.ipcRenderer.sendConvo("auto-load.remove", id);
    });
  }
  saveToFile(downloadCanvas, filename, format = "image/png", quality = 1) {
    return new Promise((resolve2, reject) => {
      downloadCanvas.toBlob(
        (blob) => __async$z(this, null, function* () {
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
          resolve2(URL.createObjectURL(blob));
        }),
        format,
        quality
      );
    });
  }
  prompt(message, defaultValue) {
    return __async$z(this, null, function* () {
      return yield this.electron.ipcRenderer.sendConvo(
        "show-prompt",
        message,
        defaultValue
      );
    });
  }
  connectToStore(vuexHistory, store2) {
    this.vuexHistory = vuexHistory;
    this.$store = store2;
    this.invalidateInstalledBGs();
    this.vuexHistory.transaction(() => __async$z(this, null, function* () {
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
    if (!this.vuexHistory || !this.$store)
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
    if (!this.vuexHistory || !this.$store)
      return;
    this.vuexHistory.transaction(() => __async$z(this, null, function* () {
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
var __defProp$K = Object.defineProperty;
var __getOwnPropSymbols$s = Object.getOwnPropertySymbols;
var __hasOwnProp$s = Object.prototype.hasOwnProperty;
var __propIsEnum$s = Object.prototype.propertyIsEnumerable;
var __defNormalProp$K = (obj, key, value) => key in obj ? __defProp$K(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$s = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$s.call(b, prop))
      __defNormalProp$K(a, prop, b[prop]);
  if (__getOwnPropSymbols$s)
    for (var prop of __getOwnPropSymbols$s(b)) {
      if (__propIsEnum$s.call(b, prop))
        __defNormalProp$K(a, prop, b[prop]);
    }
  return a;
};
var __publicField$m = (obj, key, value) => {
  __defNormalProp$K(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class ImageAsset {
  constructor(html) {
    this.html = html;
    __publicField$m(this, "width");
    __publicField$m(this, "height");
    this.width = html.width;
    this.height = html.height;
  }
  paintOnto(fsCtx, opts = {}) {
    const { w, h: h2 } = __spreadValues$s({
      w: this.width,
      h: this.height
    }, opts);
    const { x, y } = __spreadValues$s({
      x: -w / 2,
      y: -h2 / 2
    }, opts);
    fsCtx.drawImage(this.html, x, y, w, h2);
  }
}
var __defProp$J = Object.defineProperty;
var __defNormalProp$J = (obj, key, value) => key in obj ? __defProp$J(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$l = (obj, key, value) => {
  __defNormalProp$J(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$y = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
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
  return webpSupportPromise = (() => __async$y(this, null, function* () {
    const ret = yield Promise.all([
      canLoadImg(losslessCode, 1, 2),
      canLoadImg(transparentCode, 720, 1280)
    ]);
    return ret[0] && ret[1];
  }))();
}
function canLoadImg(url, height, width) {
  return new Promise((resolve2, _reject) => {
    const img = document.createElement("img");
    img.addEventListener("load", () => {
      resolve2(img.width === width && img.height === height);
    });
    img.addEventListener("error", () => {
      resolve2(false);
    });
    img.src = url;
  });
}
let heifSupportPromise;
function isHeifSupported() {
  if (heifSupportPromise)
    return heifSupportPromise;
  return heifSupportPromise = new Promise((resolve2, _reject) => {
    const losslessCode = "data:image/heic;base64,AAAAGGZ0eXBoZWljAAAAAG1pZjFoZWljAAAAsW1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAHBpY3QAXABjAGMAcwBsAGEAAAAADnBpdG0AAAAAAAEAAAAQaWxvYwAAAABEQAAAAAAAI2lpbmYAAAAAAAEAAAAVaW5mZQIAAAAAAQAAaHZjMQAAAABDaXBycAAAACdpcGNvAAAAH2h2Y0NmzGx1ci0AAAAAAABv9HP+//v9bjr3AAAAABRpcG1hAAAAAAAAAAEAAQGBAAAACG1kYXQ=";
    const img = document.createElement("img");
    img.addEventListener("load", () => {
      console.log("Heif no error. " + (img.width === 2 && img.height === 1));
      resolve2(img.width === 2 && img.height === 1);
    });
    img.addEventListener("error", () => {
      console.log("Heif not supported");
      resolve2(false);
    });
    img.src = losslessCode;
  });
}
class AssetCache {
  constructor() {
    __publicField$l(this, "cache", /* @__PURE__ */ new Map());
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
    __publicField$l(this, "cache", /* @__PURE__ */ new Map());
  }
  get(url) {
    var _a;
    const lookup = (_a = this.cache.get(url)) == null ? void 0 : _a.deref();
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
  return __async$y(this, null, function* () {
    const url = `${baseUrl}assets/${asset}${hq ? "" : ".lq"}${(yield isWebPSupported()) ? ".webp" : ".png"}`.replace(/\/+/, "/");
    return yield getAssetCache().get(url);
  });
}
function getBuildInAssetUrl(asset, hq = true) {
  return __async$y(this, null, function* () {
    return `${baseUrl}assets/${asset}${envX.supports.lq && !hq ? ".lq" : ""}${(yield isWebPSupported()) ? ".webp" : ".png"}`.replace(/\/+/, "/");
  });
}
function registerAssetWithURL(asset, url) {
  customUrl[asset] = url;
}
function requestAssetByUrl(url) {
  return __async$y(this, null, function* () {
    const isCustom = !!customUrl[url];
    if (isCustom)
      url = customUrl[url];
    return (() => __async$y(this, null, function* () {
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
function imagePromise(url) {
  return new Promise((resolve2, reject) => {
    const img = new Image();
    img.addEventListener("load", () => {
      resolve2(new ImageAsset(img));
      if (!envX.supports.assetCaching) {
        document.body.removeChild(img);
      }
    });
    img.addEventListener("error", (_e) => {
      reject(new Error(`Failed to load image ${url}`));
      if (!envX.supports.assetCaching) {
        document.body.removeChild(img);
      }
    });
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.style.display = "none";
    document.body.appendChild(img);
  });
}
const _sfc_main$y = defineComponent({
  props: {
    label: String,
    modelValue: { type: Boolean, default: false }
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      }
    },
    checkbox() {
      return this.$refs.checkbox;
    }
  }
});
const toggle_vue_vue_type_style_index_0_lang = "";
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _hoisted_1$s = { class: "toggle_box" };
const _hoisted_2$p = ["id"];
const _hoisted_3$n = ["for"];
const _hoisted_4$l = ["for"];
function _sfc_render$x(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1$s, [
    withDirectives(createBaseVNode("input", {
      id: _ctx._.uid,
      type: "checkbox",
      ref: "checkbox",
      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.value = $event)
    }, null, 8, _hoisted_2$p), [
      [vModelCheckbox, _ctx.value]
    ]),
    createBaseVNode("label", {
      for: _ctx._.uid,
      class: "switch"
    }, null, 8, _hoisted_3$n),
    createBaseVNode("label", {
      for: _ctx._.uid,
      class: "toggle_label"
    }, toDisplayString(_ctx.label), 9, _hoisted_4$l)
  ]);
}
const ToggleBox = /* @__PURE__ */ _export_sfc(_sfc_main$y, [["render", _sfc_render$x]]);
const VerticalScrollRedirect = {
  methods: {
    verticalScrollRedirect(e) {
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
  }
};
const PanelMixin = {
  mixins: [VerticalScrollRedirect],
  computed: {
    vertical() {
      return this.$store.state.ui.vertical;
    }
  },
  mounted() {
    this.updateVertical();
    this.$el.addEventListener(
      "wheel",
      (e) => {
        if (!this.vertical)
          this.verticalScrollRedirect(e);
      },
      {
        passive: true
      }
    );
  },
  methods: {
    updateVertical() {
      if (!this.$el)
        return;
      if (this.vertical) {
        this.$el.classList.add("vertical");
      } else {
        this.$el.classList.remove("vertical");
      }
    }
  },
  watch: {
    vertical() {
      this.updateVertical();
    }
  }
};
const isDialogSupported = window.HTMLDialogElement != null;
const _sfc_main$x = defineComponent({
  props: {
    noBaseSize: Boolean,
    options: {
      type: Array,
      default: []
    }
  },
  computed: {
    nativeDialogs() {
      return isDialogSupported;
    }
  },
  methods: {
    open() {
      if (this.nativeDialogs) {
        const ele = this.$refs.dialog;
        if (ele && !ele.open) {
          ele.showModal();
        }
      }
      window.addEventListener("click", this.clickSomewhere);
    },
    close() {
      if (this.nativeDialogs) {
        const ele = this.$refs.dialog;
        if (ele && ele.open) {
          ele.close();
        }
        this.$emit("leave");
      }
      window.removeEventListener("click", this.clickSomewhere);
    },
    clickSomewhere(e) {
      const ele = this.$refs.dialog;
      if (ele && ele.open) {
        if (e.target === ele) {
          this.close();
          e.preventDefault();
          e.stopPropagation();
        }
      } else {
        window.removeEventListener("click", this.clickSomewhere);
      }
    }
  },
  mounted() {
    this.open();
  },
  activated() {
    this.open();
  },
  deactivated() {
    this.close();
  },
  unmounted() {
    this.close();
  }
});
const ModalDialog_vue_vue_type_style_index_0_scoped_dfb4ac8d_lang = "";
const _hoisted_1$r = {
  key: 0,
  id: "submit-options"
};
const _hoisted_2$o = ["onClick"];
const _hoisted_3$m = {
  key: 0,
  id: "submit-options"
};
const _hoisted_4$k = ["onClick"];
function _sfc_render$w(_ctx, _cache, $props, $setup, $data, $options) {
  return _ctx.nativeDialogs ? (openBlock(), createElementBlock("dialog", {
    key: 0,
    ref: "dialog",
    class: normalizeClass(["native", { "base-size": !_ctx.noBaseSize }]),
    onCancel: _cache[0] || (_cache[0] = (...args) => _ctx.close && _ctx.close(...args))
  }, [
    renderSlot(_ctx.$slots, "default", {}, void 0, true),
    _ctx.options.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_1$r, [
      (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.options, (option) => {
        return openBlock(), createElementBlock("button", {
          key: option,
          class: "option",
          onClick: ($event) => _ctx.$emit("option", option)
        }, toDisplayString(option), 9, _hoisted_2$o);
      }), 128))
    ])) : createCommentVNode("", true)
  ], 34)) : (openBlock(), createElementBlock("div", {
    key: 1,
    class: "dialog-wrapper",
    onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("leave"))
  }, [
    createBaseVNode("dialog", {
      ref: "dialog",
      open: "",
      class: normalizeClass({ "base-size": !_ctx.noBaseSize }),
      onClick: _cache[1] || (_cache[1] = withModifiers(() => {
      }, ["stop"]))
    }, [
      renderSlot(_ctx.$slots, "default", {}, void 0, true),
      _ctx.options.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_3$m, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.options, (option) => {
          return openBlock(), createElementBlock("button", {
            key: option,
            class: "option",
            onClick: ($event) => _ctx.$emit("option", option)
          }, toDisplayString(option), 9, _hoisted_4$k);
        }), 128))
      ])) : createCommentVNode("", true)
    ], 2)
  ]));
}
const ModalDialog = /* @__PURE__ */ _export_sfc(_sfc_main$x, [["render", _sfc_render$w], ["__scopeId", "data-v-dfb4ac8d"]]);
const _sfc_main$w = defineComponent({
  mixins: [VerticalScrollRedirect],
  props: {
    to: {
      type: String,
      required: true
    }
  },
  computed: {
    href() {
      let to = this.to;
      to = to.replace(
        /^github:\/\//,
        "https://github.com/edave64/Doki-Doki-Dialog-Generator/"
      );
      to = to.replace(/^wiki:\/\/(.*)/, (_, page) => {
        return "https://github.com/edave64/Doki-Doki-Dialog-Generator/wiki/Version-2:-" + page.replaceAll(" ", "-");
      });
      return to;
    }
  }
});
const _hoisted_1$q = ["href"];
function _sfc_render$v(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("a", {
    target: "_blank",
    rel: "noopener noreferrer",
    href: _ctx.href
  }, [
    renderSlot(_ctx.$slots, "default")
  ], 8, _hoisted_1$q);
}
const L = /* @__PURE__ */ _export_sfc(_sfc_main$w, [["render", _sfc_render$v]]);
var __async$x = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function safeAsync(name, callback) {
  return __async$x(this, null, function* () {
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
var __async$w = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _sfc_main$v = defineComponent({
  mixins: [PanelMixin],
  components: { Toggle: ToggleBox, ModalDialog, L },
  data: () => ({
    allowSavesModal: false,
    denySavesModal: false,
    waitOnSaveChange: false,
    showModeDialog: false
  }),
  computed: {
    savesAllowed: {
      get() {
        return envX.savingEnabled;
      },
      set(allowed) {
        this.waitOnSaveChange = true;
        envX.savingEnabled = allowed;
        this.saveSettings();
      }
    },
    inPlusMode() {
      return envX.gameMode === "ddlc_plus";
    },
    savesEnabledInEnv() {
      return envX.supports.optionalSaving;
    },
    lqAllowed() {
      return envX.supports.lq;
    },
    looseTextParsing: {
      get() {
        return envX.state.looseTextParsing;
      },
      set(looseTextParsing) {
        envX.state.looseTextParsing = looseTextParsing;
        this.saveSettings();
      }
    },
    lqRendering: {
      get() {
        return this.$store.state.ui.lqRendering;
      },
      set(lqRendering) {
        this.vuexHistory.transaction(() => __async$w(this, null, function* () {
          yield this.$store.commit("ui/setLqRendering", lqRendering);
        }));
        this.saveSettings();
      }
    },
    nsfw: {
      get() {
        return !!this.$store.state.ui.nsfw;
      },
      set(value) {
        this.vuexHistory.transaction(() => __async$w(this, null, function* () {
          yield this.$store.commit("ui/setNsfw", value);
          this.saveSettings();
        }));
      }
    },
    defaultCharacterTalkingZoom: {
      get() {
        return !!this.$store.state.ui.defaultCharacterTalkingZoom;
      },
      set(value) {
        this.vuexHistory.transaction(() => __async$w(this, null, function* () {
          yield this.$store.commit("ui/setDefaultCharacterTalkingZoom", value);
          this.saveSettings();
        }));
      }
    },
    theme: {
      get() {
        return this.$store.state.ui.useDarkTheme;
      },
      set(value) {
        this.vuexHistory.transaction(() => __async$w(this, null, function* () {
          yield this.$store.commit("ui/setDarkTheme", value);
          this.saveSettings();
        }));
      }
    },
    showDownloadFolder() {
      return envX.supports.setDownloadFolder;
    },
    downloadFolder() {
      return envX.state.downloadLocation;
    }
  },
  watch: {
    savesAllowed() {
      this.waitOnSaveChange = false;
    }
  },
  methods: {
    allowSaves(choice) {
      this.allowSavesModal = false;
      if (choice === "Allow") {
        this.savesAllowed = true;
      }
    },
    denySaves(choice) {
      this.denySavesModal = false;
      if (choice === "Deny") {
        this.savesAllowed = false;
      }
    },
    modeChange(choice) {
      safeAsync("changing modes", () => __async$w(this, null, function* () {
        if (choice === "Enter Classic Mode") {
          yield envX.setGameMode("ddlc");
        } else if (choice === "Enter Plus mode") {
          yield envX.setGameMode("ddlc_plus");
        } else {
          this.showModeDialog = false;
        }
      }));
    },
    saveSettings() {
      var _a;
      envX.saveSettings({
        lq: this.$store.state.ui.lqRendering,
        nsfw: this.$store.state.ui.nsfw,
        darkMode: (_a = this.$store.state.ui.useDarkTheme) != null ? _a : void 0,
        looseTextParsing: envX.state.looseTextParsing,
        defaultCharacterTalkingZoom: this.$store.state.ui.defaultCharacterTalkingZoom
      });
    },
    setDownloadFolder() {
      envX.updateDownloadFolder();
    },
    openDownloadFolder() {
      envX.openFolder("downloads");
    }
  }
});
const settings_vue_vue_type_style_index_0_scoped_11f6d92f_lang = "";
const _withScopeId$f = (n) => (pushScopeId("data-v-11f6d92f"), n = n(), popScopeId(), n);
const _hoisted_1$p = { class: "panel" };
const _hoisted_2$n = /* @__PURE__ */ _withScopeId$f(() => /* @__PURE__ */ createBaseVNode("h1", null, "Settings", -1));
const _hoisted_3$l = { class: "modal-scroll-area" };
const _hoisted_4$j = /* @__PURE__ */ _withScopeId$f(() => /* @__PURE__ */ createBaseVNode("p", null, "Do you want to allow DDDG to save settings on your device?", -1));
const _hoisted_5$g = /* @__PURE__ */ _withScopeId$f(() => /* @__PURE__ */ createBaseVNode("p", null, " By choosing to enable saving settings, DDDG can save data to your device, and nowhere else. However, your browser and any installed browser extensions might possibly read and send this data to other servers, e.g. to sync between devices. This is outside of our control. But in general, we recommend only using browsers and browser extensions that you trust with your personal data. ", -1));
const _hoisted_6$g = /* @__PURE__ */ _withScopeId$f(() => /* @__PURE__ */ createBaseVNode("p", null, "You can revoke this permission at any time.", -1));
const _hoisted_7$e = /* @__PURE__ */ createTextVNode(" Our usual ");
const _hoisted_8$d = /* @__PURE__ */ createTextVNode("privacy policy");
const _hoisted_9$c = /* @__PURE__ */ createTextVNode(" still applies. ");
const _hoisted_10$c = { class: "modal-scroll-area" };
const _hoisted_11$b = /* @__PURE__ */ _withScopeId$f(() => /* @__PURE__ */ createBaseVNode("p", null, "Do you want to deny DDDG from saving settings on your device?", -1));
const _hoisted_12$a = /* @__PURE__ */ _withScopeId$f(() => /* @__PURE__ */ createBaseVNode("p", null, " This will cause all your settings to reset when leaving the page. ", -1));
const _hoisted_13$8 = /* @__PURE__ */ createTextVNode(" Our usual ");
const _hoisted_14$6 = /* @__PURE__ */ createTextVNode("privacy policy");
const _hoisted_15$5 = /* @__PURE__ */ createTextVNode(" still applies. ");
const _hoisted_16$5 = /* @__PURE__ */ _withScopeId$f(() => /* @__PURE__ */ createBaseVNode("div", { class: "modal-scroll-area" }, [
  /* @__PURE__ */ createBaseVNode("p", null, " WARNING: Swiching modes will discard everything you have done in this session. All dialouge will be lost! ")
], -1));
const _hoisted_17$5 = {
  key: 0,
  disabled: ""
};
const _hoisted_18$5 = /* @__PURE__ */ createTextVNode(" Enter Classic Mode ");
const _hoisted_19$5 = /* @__PURE__ */ createTextVNode(" Enter DDLC Plus Mode ");
const _hoisted_20$6 = /* @__PURE__ */ _withScopeId$f(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", null, "Theme:")
], -1));
const _hoisted_21$5 = /* @__PURE__ */ _withScopeId$f(() => /* @__PURE__ */ createBaseVNode("option", { value: null }, "System", -1));
const _hoisted_22$5 = /* @__PURE__ */ _withScopeId$f(() => /* @__PURE__ */ createBaseVNode("option", { value: false }, "Light", -1));
const _hoisted_23$5 = /* @__PURE__ */ _withScopeId$f(() => /* @__PURE__ */ createBaseVNode("option", { value: true }, "Dark", -1));
const _hoisted_24$4 = [
  _hoisted_21$5,
  _hoisted_22$5,
  _hoisted_23$5
];
const _hoisted_25$3 = {
  key: 4,
  class: "downloadTable"
};
const _hoisted_26$3 = /* @__PURE__ */ _withScopeId$f(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", null, "Download folder:")
], -1));
function _sfc_render$u(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_l = resolveComponent("l");
  const _component_modal_dialog = resolveComponent("modal-dialog");
  const _component_toggle = resolveComponent("toggle");
  return openBlock(), createElementBlock("div", _hoisted_1$p, [
    _hoisted_2$n,
    (openBlock(), createBlock(Teleport, { to: "#modal-messages" }, [
      _ctx.allowSavesModal ? (openBlock(), createBlock(_component_modal_dialog, {
        key: 0,
        options: ["Allow", "Deny"],
        onLeave: _cache[0] || (_cache[0] = ($event) => _ctx.allowSaves("Deny")),
        onOption: _ctx.allowSaves,
        "no-base-size": ""
      }, {
        default: withCtx(() => [
          createBaseVNode("div", _hoisted_3$l, [
            _hoisted_4$j,
            _hoisted_5$g,
            _hoisted_6$g,
            createBaseVNode("p", null, [
              _hoisted_7$e,
              createVNode(_component_l, { to: "wiki://Privacy Statement" }, {
                default: withCtx(() => [
                  _hoisted_8$d
                ]),
                _: 1
              }),
              _hoisted_9$c
            ])
          ])
        ]),
        _: 1
      }, 8, ["onOption"])) : createCommentVNode("", true),
      _ctx.denySavesModal ? (openBlock(), createBlock(_component_modal_dialog, {
        key: 1,
        options: ["Deny", "Cancle"],
        onLeave: _cache[1] || (_cache[1] = ($event) => _ctx.denySaves("Cancle")),
        onOption: _ctx.denySaves,
        "no-base-size": ""
      }, {
        default: withCtx(() => [
          createBaseVNode("div", _hoisted_10$c, [
            _hoisted_11$b,
            _hoisted_12$a,
            createBaseVNode("p", null, [
              _hoisted_13$8,
              createVNode(_component_l, { to: "wiki://Privacy Statement" }, {
                default: withCtx(() => [
                  _hoisted_14$6
                ]),
                _: 1
              }),
              _hoisted_15$5
            ])
          ])
        ]),
        _: 1
      }, 8, ["onOption"])) : createCommentVNode("", true),
      _ctx.showModeDialog ? (openBlock(), createBlock(_component_modal_dialog, {
        key: 2,
        options: [
          _ctx.inPlusMode ? "Enter Classic Mode" : "Enter Plus mode",
          "Stay"
        ],
        onLeave: _cache[2] || (_cache[2] = ($event) => _ctx.showModeDialog = false),
        onOption: _ctx.modeChange,
        "no-base-size": ""
      }, {
        default: withCtx(() => [
          _hoisted_16$5
        ]),
        _: 1
      }, 8, ["options", "onOption"])) : createCommentVNode("", true)
    ])),
    _ctx.waitOnSaveChange ? (openBlock(), createElementBlock("button", _hoisted_17$5, "Applying...")) : !_ctx.savesAllowed && _ctx.savesEnabledInEnv ? (openBlock(), createElementBlock("button", {
      key: 1,
      onClick: _cache[3] || (_cache[3] = ($event) => _ctx.allowSavesModal = true)
    }, " Allow saving options ")) : _ctx.savesAllowed && _ctx.savesEnabledInEnv ? (openBlock(), createElementBlock("button", {
      key: 2,
      onClick: _cache[4] || (_cache[4] = ($event) => _ctx.denySavesModal = true)
    }, " Deny saving options ")) : createCommentVNode("", true),
    createBaseVNode("button", {
      onClick: _cache[5] || (_cache[5] = ($event) => _ctx.showModeDialog = true)
    }, [
      _ctx.inPlusMode ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
        _hoisted_18$5
      ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
        _hoisted_19$5
      ], 64))
    ]),
    _ctx.lqAllowed ? (openBlock(), createBlock(_component_toggle, {
      key: 3,
      label: "Low quality preview?",
      title: "Reduces the quality of the preview images to speed up the user experience and consume less data. Does not effect final render.",
      modelValue: _ctx.lqRendering,
      "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => _ctx.lqRendering = $event)
    }, null, 8, ["modelValue"])) : createCommentVNode("", true),
    createVNode(_component_toggle, {
      label: "NSFW Mode?",
      modelValue: _ctx.nsfw,
      "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => _ctx.nsfw = $event)
    }, null, 8, ["modelValue"]),
    createVNode(_component_toggle, {
      label: "Enlarge talking objects? (Default value)",
      modelValue: _ctx.defaultCharacterTalkingZoom,
      "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => _ctx.defaultCharacterTalkingZoom = $event)
    }, null, 8, ["modelValue"]),
    createVNode(_component_toggle, {
      label: "Fault tolerant text parsing",
      title: "Silently ignore parse errors in texts. (Like unexpected '{' characters) Prevents beginners from getting stuck working with textboxes, but also makes it harder to understand what you are doing wrong.",
      modelValue: _ctx.looseTextParsing,
      "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => _ctx.looseTextParsing = $event)
    }, null, 8, ["modelValue"]),
    createBaseVNode("table", null, [
      createBaseVNode("tr", null, [
        _hoisted_20$6,
        createBaseVNode("td", null, [
          withDirectives(createBaseVNode("select", {
            "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => _ctx.theme = $event)
          }, _hoisted_24$4, 512), [
            [vModelSelect, _ctx.theme]
          ])
        ])
      ])
    ]),
    _ctx.showDownloadFolder ? (openBlock(), createElementBlock("table", _hoisted_25$3, [
      createBaseVNode("tr", null, [
        _hoisted_26$3,
        createBaseVNode("td", null, toDisplayString(_ctx.downloadFolder), 1),
        createBaseVNode("td", null, [
          createBaseVNode("button", {
            onClick: _cache[11] || (_cache[11] = (...args) => _ctx.setDownloadFolder && _ctx.setDownloadFolder(...args))
          }, "Set"),
          createBaseVNode("button", {
            onClick: _cache[12] || (_cache[12] = (...args) => _ctx.openDownloadFolder && _ctx.openDownloadFolder(...args))
          }, "Open")
        ])
      ])
    ])) : createCommentVNode("", true)
  ]);
}
const SettingsPanel = /* @__PURE__ */ _export_sfc(_sfc_main$v, [["render", _sfc_render$u], ["__scopeId", "data-v-11f6d92f"]]);
const _sfc_main$u = defineComponent({
  computed: {
    vertical() {
      return this.$store.state.ui.vertical;
    }
  },
  data: () => ({
    visible: false
  }),
  methods: {
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    drop(e) {
      this.hide();
      e.stopPropagation();
      e.preventDefault();
      if (!e.dataTransfer)
        return;
      for (const item of e.dataTransfer.items) {
        if (item.kind === "file" && item.type.match(/image.*/)) {
          this.$emit("drop", item.getAsFile());
        }
      }
    }
  }
});
const dropTarget_vue_vue_type_style_index_0_scoped_ac1f253b_lang = "";
function _sfc_render$t(_ctx, _cache, $props, $setup, $data, $options) {
  return _ctx.visible ? (openBlock(), createElementBlock("div", {
    key: 0,
    onDragleave: _cache[0] || (_cache[0] = ($event) => _ctx.visible = false),
    onDrop: _cache[1] || (_cache[1] = (...args) => _ctx.drop && _ctx.drop(...args)),
    class: normalizeClass({ vertical: _ctx.vertical })
  }, [
    renderSlot(_ctx.$slots, "default", {}, void 0, true)
  ], 34)) : createCommentVNode("", true);
}
const DropTarget = /* @__PURE__ */ _export_sfc(_sfc_main$u, [["render", _sfc_render$t], ["__scopeId", "data-v-ac1f253b"]]);
const _sfc_main$t = defineComponent({
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
    }
  },
  computed: {
    showPopup() {
      return this.shortcut != null && !this.shortcut.startsWith("!");
    },
    popupText() {
      const shortcut = this.shortcut;
      if (shortcut == null)
        return "";
      if (shortcut.startsWith("!"))
        return shortcut.substring(1);
      return shortcut;
    }
  }
});
const dButton_vue_vue_type_style_index_0_scoped_b2a4f97d_lang = "";
const _hoisted_1$o = ["disabled"];
const _hoisted_2$m = {
  class: "material-icons",
  "aria-hidden": "true"
};
const _hoisted_3$k = { class: "content" };
const _hoisted_4$i = {
  key: 0,
  class: "shortcut-popup"
};
function _sfc_render$s(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("button", {
    class: normalizeClass([_ctx.iconPos]),
    disabled: _ctx.disabled
  }, [
    createBaseVNode("div", _hoisted_2$m, toDisplayString(_ctx.icon), 1),
    createBaseVNode("div", _hoisted_3$k, [
      renderSlot(_ctx.$slots, "default", {}, void 0, true)
    ]),
    _ctx.showPopup ? (openBlock(), createElementBlock("div", _hoisted_4$i, toDisplayString(_ctx.popupText), 1)) : createCommentVNode("", true)
  ], 10, _hoisted_1$o);
}
const DButton = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["render", _sfc_render$s], ["__scopeId", "data-v-b2a4f97d"]]);
var __defProp$I = Object.defineProperty;
var __defProps$m = Object.defineProperties;
var __getOwnPropDescs$m = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$r = Object.getOwnPropertySymbols;
var __hasOwnProp$r = Object.prototype.hasOwnProperty;
var __propIsEnum$r = Object.prototype.propertyIsEnumerable;
var __defNormalProp$I = (obj, key, value) => key in obj ? __defProp$I(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$r = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$r.call(b, prop))
      __defNormalProp$I(a, prop, b[prop]);
  if (__getOwnPropSymbols$r)
    for (var prop of __getOwnPropSymbols$r(b)) {
      if (__propIsEnum$r.call(b, prop))
        __defNormalProp$I(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$m = (a, b) => __defProps$m(a, __getOwnPropDescs$m(b));
var __async$v = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
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
const _sfc_main$s = defineComponent({
  mixins: [PanelMixin],
  components: { DropTarget, DButton },
  data: () => ({
    isWebPSupported: null,
    customAssetCount: 0,
    group: "characters"
  }),
  computed: {
    currentPanel() {
      return this.$store.state.panels.panels[this.$store.state.panels.currentPanel];
    },
    characters() {
      return this.$store.state.content.current.characters;
    },
    sprites() {
      return this.$store.state.content.current.sprites;
    },
    hasClipboardContent() {
      return this.$store.state.ui.clipboard != null;
    },
    showSpritesFolder() {
      return envX.supports.openableFolders.has(
        "sprites"
      );
    }
  },
  methods: {
    assetSpriteBackground(sprite) {
      return sprite.variants[0].map((variant) => `url('${getAAssetUrl(variant, false)}')`).join(",");
    },
    assetPath(character) {
      return character.chibi ? envX.supports.lq ? character.chibi.lq : character.chibi.hq : "";
    },
    showDropTarget(e) {
      if (!e.dataTransfer)
        return;
      e.dataTransfer.effectAllowed = "none";
      if (!Array.from(e.dataTransfer.items).find(
        (item) => item.type.match(/^image.*$/)
      )) {
        return;
      }
      e.dataTransfer.effectAllowed = "link";
      if (this.group === "sprites") {
        this.$refs.spriteDt.show();
      }
    },
    hideDropTarget() {
      if (this.group === "sprites") {
        this.$refs.spriteDt.hide();
      }
    },
    onSpriteFileUpload() {
      const uploadInput = this.$refs.spriteUpload;
      if (!uploadInput.files)
        return;
      for (const file of uploadInput.files) {
        this.addCustomSpriteFile(file);
      }
    },
    uploadFromURL() {
      return __async$v(this, null, function* () {
        const url = prompt("Enter the URL of the image");
        if (url == null)
          return;
        const lastSegment = url.split("/").slice(-1)[0];
        yield this.vuexHistory.transaction(() => __async$v(this, null, function* () {
          yield this.addNewCustomSprite(lastSegment, url);
        }));
      });
    },
    addSpriteToScene(sprite) {
      return __async$v(this, null, function* () {
        yield this.vuexHistory.transaction(() => __async$v(this, null, function* () {
          yield this.$store.dispatch("panels/createSprite", {
            panelId: this.currentPanel.id,
            assets: sprite.variants[0]
          });
        }));
      });
    },
    addTextBox() {
      this.vuexHistory.transaction(() => __async$v(this, null, function* () {
        yield this.$store.dispatch("panels/createTextBox", {
          panelId: this.currentPanel.id
        });
      }));
    },
    addChoice() {
      this.vuexHistory.transaction(() => __async$v(this, null, function* () {
        yield this.$store.dispatch("panels/createChoice", {
          panelId: this.currentPanel.id
        });
      }));
    },
    addDialog() {
      this.vuexHistory.transaction(() => __async$v(this, null, function* () {
        yield this.$store.dispatch("panels/createNotification", {
          panelId: this.currentPanel.id
        });
      }));
    },
    addPoem() {
      this.vuexHistory.transaction(() => __async$v(this, null, function* () {
        yield this.$store.dispatch("panels/createPoem", {
          panelId: this.currentPanel.id
        });
      }));
    },
    addConsole() {
      this.vuexHistory.transaction(() => __async$v(this, null, function* () {
        yield this.$store.dispatch("panels/createConsole", {
          panelId: this.currentPanel.id
        });
      }));
    },
    paste() {
      this.vuexHistory.transaction(() => __async$v(this, null, function* () {
        yield this.$store.dispatch("panels/pasteObjectFromClipboard", {
          panelId: this.currentPanel.id
        });
      }));
    },
    onChosen(id) {
      this.vuexHistory.transaction(() => __async$v(this, null, function* () {
        yield this.$store.dispatch("panels/createCharacters", {
          characterType: id,
          panelId: this.currentPanel.id
        });
      }));
    },
    addCustomSpriteFile(file) {
      return __async$v(this, null, function* () {
        yield this.vuexHistory.transaction(() => __async$v(this, null, function* () {
          const url = URL.createObjectURL(file);
          const assetUrl = yield this.$store.dispatch("uploadUrls/add", {
            name: file.name,
            url
          });
          yield this.addNewCustomSprite(file.name, assetUrl);
        }));
      });
    },
    addNewCustomSprite(label, url) {
      return __async$v(this, null, function* () {
        const old = this.$store.state.content.contentPacks.find(
          (x) => x.packId === uploadedSpritesPackDefault.packId
        ) || uploadedSpritesPackDefault;
        const newPackVersion = __spreadProps$m(__spreadValues$r({}, old), {
          sprites: [
            ...old.sprites,
            {
              id: url,
              label,
              variants: [[url]],
              defaultScale: [1, 1],
              hd: null
            }
          ]
        });
        yield this.$store.dispatch("content/replaceContentPack", {
          contentPack: newPackVersion,
          processed: false
        });
      });
    },
    openSpritesFolder() {
      envX.openFolder("sprites");
    }
  },
  created() {
    return __async$v(this, null, function* () {
      this.isWebPSupported = yield isWebPSupported();
    });
  }
});
const add_vue_vue_type_style_index_0_scoped_24e67e76_lang = "";
const _withScopeId$e = (n) => (pushScopeId("data-v-24e67e76"), n = n(), popScopeId(), n);
const _hoisted_1$n = /* @__PURE__ */ createTextVNode("Drop here to add as a new sprite ");
const _hoisted_2$l = /* @__PURE__ */ _withScopeId$e(() => /* @__PURE__ */ createBaseVNode("h1", null, "Add", -1));
const _hoisted_3$j = /* @__PURE__ */ createTextVNode(" Char\xADacters ");
const _hoisted_4$h = /* @__PURE__ */ createTextVNode(" Sprites ");
const _hoisted_5$f = /* @__PURE__ */ createTextVNode(" UI ");
const _hoisted_6$f = ["title", "onClick", "onKeypress"];
const _hoisted_7$d = ["src", "alt"];
const _hoisted_8$c = /* @__PURE__ */ createTextVNode(" Search in content packs ");
const _hoisted_9$b = ["title", "onClick", "onKeypress"];
const _hoisted_10$b = /* @__PURE__ */ createTextVNode(" Upload new sprite ");
const _hoisted_11$a = /* @__PURE__ */ createTextVNode(" New sprite from URL ");
const _hoisted_12$9 = /* @__PURE__ */ createTextVNode(" Search in content packs ");
const _hoisted_13$7 = /* @__PURE__ */ createTextVNode(" Open sprites folder ");
const _hoisted_14$5 = ["disabled"];
function _sfc_render$r(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_drop_target = resolveComponent("drop-target");
  const _component_d_button = resolveComponent("d-button");
  return _ctx.isWebPSupported !== void 0 ? (openBlock(), createElementBlock("div", {
    key: 0,
    class: "panel",
    onDragenter: _cache[13] || (_cache[13] = (...args) => _ctx.showDropTarget && _ctx.showDropTarget(...args)),
    onMouseleave: _cache[14] || (_cache[14] = (...args) => _ctx.hideDropTarget && _ctx.hideDropTarget(...args))
  }, [
    createVNode(_component_drop_target, {
      ref: "spriteDt",
      class: "drop-target",
      onDrop: _ctx.addCustomSpriteFile
    }, {
      default: withCtx(() => [
        _hoisted_1$n
      ]),
      _: 1
    }, 8, ["onDrop"]),
    _hoisted_2$l,
    createBaseVNode("div", {
      class: normalizeClass({ "group-selector": true, vertical: _ctx.vertical })
    }, [
      createVNode(_component_d_button, {
        class: normalizeClass({ active: _ctx.group === "characters" }),
        "icon-pos": "top",
        icon: "emoji_people",
        onClick: _cache[0] || (_cache[0] = ($event) => _ctx.group = "characters")
      }, {
        default: withCtx(() => [
          _hoisted_3$j
        ]),
        _: 1
      }, 8, ["class"]),
      createVNode(_component_d_button, {
        class: normalizeClass({ active: _ctx.group === "sprites" }),
        "icon-pos": "top",
        icon: "change_history",
        onClick: _cache[1] || (_cache[1] = ($event) => _ctx.group = "sprites")
      }, {
        default: withCtx(() => [
          _hoisted_4$h
        ]),
        _: 1
      }, 8, ["class"]),
      createVNode(_component_d_button, {
        class: normalizeClass({ active: _ctx.group === "ui" }),
        "icon-pos": "top",
        icon: "view_quilt",
        onClick: _cache[2] || (_cache[2] = ($event) => _ctx.group = "ui")
      }, {
        default: withCtx(() => [
          _hoisted_5$f
        ]),
        _: 1
      }, 8, ["class"])
    ], 2),
    createBaseVNode("div", {
      class: normalizeClass({ "item-grid": true, vertical: _ctx.vertical })
    }, [
      _ctx.group === "characters" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.characters, (character) => {
          return openBlock(), createElementBlock("div", {
            class: "character",
            tabindex: "0",
            key: character.id,
            title: character.label,
            onClick: withModifiers(($event) => _ctx.onChosen(character.id.toLowerCase()), ["left"]),
            onKeypress: [
              withKeys(withModifiers(($event) => _ctx.onChosen(character.id.toLowerCase()), ["prevent", "stop"]), ["enter"]),
              withKeys(withModifiers(($event) => _ctx.onChosen(character.id.toLowerCase()), ["prevent", "stop"]), ["space"])
            ]
          }, [
            createBaseVNode("img", {
              src: _ctx.assetPath(character),
              alt: character.label
            }, null, 8, _hoisted_7$d)
          ], 40, _hoisted_6$f);
        }), 128)),
        createVNode(_component_d_button, {
          class: "custom-sprite",
          icon: "extension",
          onClick: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("show-dialog", "type: Characters"))
        }, {
          default: withCtx(() => [
            _hoisted_8$c
          ]),
          _: 1
        })
      ], 64)) : createCommentVNode("", true),
      _ctx.group === "sprites" ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.sprites, (sprite) => {
          return openBlock(), createElementBlock("div", {
            class: "sprite",
            tabindex: "0",
            key: sprite.label,
            title: sprite.label,
            style: normalizeStyle$1({ background: _ctx.assetSpriteBackground(sprite) }),
            onClick: ($event) => _ctx.addSpriteToScene(sprite),
            onKeypress: [
              withKeys(withModifiers(($event) => _ctx.addSpriteToScene(sprite), ["prevent", "stop"]), ["enter"]),
              withKeys(withModifiers(($event) => _ctx.addSpriteToScene(sprite), ["prevent", "stop"]), ["space"])
            ]
          }, toDisplayString(sprite.label), 45, _hoisted_9$b);
        }), 128)),
        createVNode(_component_d_button, {
          class: "custom-sprite",
          icon: "publish",
          onClick: _cache[5] || (_cache[5] = ($event) => _ctx.$refs.spriteUpload.click())
        }, {
          default: withCtx(() => [
            _hoisted_10$b,
            createBaseVNode("input", {
              type: "file",
              ref: "spriteUpload",
              onChange: _cache[4] || (_cache[4] = (...args) => _ctx.onSpriteFileUpload && _ctx.onSpriteFileUpload(...args))
            }, null, 544)
          ]),
          _: 1
        }),
        createVNode(_component_d_button, {
          icon: "insert_link",
          onClick: _ctx.uploadFromURL
        }, {
          default: withCtx(() => [
            _hoisted_11$a
          ]),
          _: 1
        }, 8, ["onClick"]),
        createVNode(_component_d_button, {
          icon: "extension",
          onClick: _cache[6] || (_cache[6] = ($event) => _ctx.$emit("show-dialog", "type: Sprites"))
        }, {
          default: withCtx(() => [
            _hoisted_12$9
          ]),
          _: 1
        }),
        _ctx.showSpritesFolder ? (openBlock(), createBlock(_component_d_button, {
          key: 0,
          icon: "folder",
          onClick: _ctx.openSpritesFolder
        }, {
          default: withCtx(() => [
            _hoisted_13$7
          ]),
          _: 1
        }, 8, ["onClick"])) : createCommentVNode("", true)
      ], 64)) : createCommentVNode("", true),
      _ctx.group === "ui" ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
        createBaseVNode("button", {
          onClick: _cache[7] || (_cache[7] = (...args) => _ctx.addTextBox && _ctx.addTextBox(...args))
        }, "Textbox"),
        createBaseVNode("button", {
          onClick: _cache[8] || (_cache[8] = (...args) => _ctx.addPoem && _ctx.addPoem(...args))
        }, "Poem"),
        createBaseVNode("button", {
          onClick: _cache[9] || (_cache[9] = (...args) => _ctx.addDialog && _ctx.addDialog(...args))
        }, "Notification"),
        createBaseVNode("button", {
          onClick: _cache[10] || (_cache[10] = (...args) => _ctx.addChoice && _ctx.addChoice(...args))
        }, "Choice"),
        createBaseVNode("button", {
          onClick: _cache[11] || (_cache[11] = (...args) => _ctx.addConsole && _ctx.addConsole(...args))
        }, "Console")
      ], 64)) : createCommentVNode("", true),
      createBaseVNode("button", {
        onClick: _cache[12] || (_cache[12] = (...args) => _ctx.paste && _ctx.paste(...args)),
        disabled: !_ctx.hasClipboardContent
      }, "Paste", 8, _hoisted_14$5)
    ], 2)
  ], 32)) : createCommentVNode("", true);
}
const AddPanel = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["render", _sfc_render$r], ["__scopeId", "data-v-24e67e76"]]);
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
const screenWidth$1 = 1280;
const screenHeight$1 = 720;
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
const BaseCharacterYPos$1 = -26;
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
  positions: positions$1,
  sdCharacterScaleFactor: sdCharacterScaleFactor$1,
  hdCharacterScaleFactor: hdCharacterScaleFactor$1,
  CloseUpYOffset: CloseUpYOffset$1,
  BaseCharacterYPos: BaseCharacterYPos$1,
  characterPositions: characterPositions$1
}, Symbol.toStringTag, { value: "Module" }));
var __defProp$H = Object.defineProperty;
var __defNormalProp$H = (obj, key, value) => key in obj ? __defProp$H(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$k = (obj, key, value) => {
  __defNormalProp$H(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _RGBAColor = class {
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
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
__publicField$k(RGBAColor, "rgbEx", /^rgb\((\d*?),(\d*?),(\d*?)\)$/i);
__publicField$k(RGBAColor, "rgbaEx", /^rgba\((\d{1,3}),(\d{1,3}),(\d{1,3}),([\d.]+)\)$/i);
__publicField$k(RGBAColor, "hexShortEx", /^#[0-9A-Z]{3,4}$/i);
__publicField$k(RGBAColor, "hexLongEx", /^#[0-9A-Z]{6,8}$/i);
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
const TextBoxCustom$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
var __defProps$l = Object.defineProperties;
var __getOwnPropDescs$l = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$q = Object.getOwnPropertySymbols;
var __hasOwnProp$q = Object.prototype.hasOwnProperty;
var __propIsEnum$q = Object.prototype.propertyIsEnumerable;
var __defNormalProp$G = (obj, key, value) => key in obj ? __defProp$G(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$q = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$q.call(b, prop))
      __defNormalProp$G(a, prop, b[prop]);
  if (__getOwnPropSymbols$q)
    for (var prop of __getOwnPropSymbols$q(b)) {
      if (__propIsEnum$q.call(b, prop))
        __defNormalProp$G(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$l = (a, b) => __defProps$l(a, __getOwnPropDescs$l(b));
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
const NameboxTextStyle$1 = __spreadProps$l(__spreadValues$q({}, BaseTextStyle$1), {
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
const ControlsTextDisabledStyle$1 = __spreadProps$l(__spreadValues$q({}, ControlsTextStyle$1), {
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
var __defProps$k = Object.defineProperties;
var __getOwnPropDescs$k = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$p = Object.getOwnPropertySymbols;
var __hasOwnProp$p = Object.prototype.hasOwnProperty;
var __propIsEnum$p = Object.prototype.propertyIsEnumerable;
var __defNormalProp$F = (obj, key, value) => key in obj ? __defProp$F(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$p = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$p.call(b, prop))
      __defNormalProp$F(a, prop, b[prop]);
  if (__getOwnPropSymbols$p)
    for (var prop of __getOwnPropSymbols$p(b)) {
      if (__propIsEnum$p.call(b, prop))
        __defNormalProp$F(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$k = (a, b) => __defProps$k(a, __getOwnPropDescs$k(b));
const NotificationBackgroundColor$1 = "#ffe6f4";
const NotificationBorderColor$1 = "#ffbde1";
const NotificationBackdropColor$1 = "rgba(255,255,255,0.6)";
const NotificationPadding$1 = 40;
const NotificationSpacing$1 = 30;
const NotificationOkTextStyle$1 = __spreadProps$k(__spreadValues$p({}, BaseTextStyle$1), {
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
var __defProps$j = Object.defineProperties;
var __getOwnPropDescs$j = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$o = Object.getOwnPropertySymbols;
var __hasOwnProp$o = Object.prototype.hasOwnProperty;
var __propIsEnum$o = Object.prototype.propertyIsEnumerable;
var __defNormalProp$E = (obj, key, value) => key in obj ? __defProp$E(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$o = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$o.call(b, prop))
      __defNormalProp$E(a, prop, b[prop]);
  if (__getOwnPropSymbols$o)
    for (var prop of __getOwnPropSymbols$o(b)) {
      if (__propIsEnum$o.call(b, prop))
        __defNormalProp$E(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$j = (a, b) => __defProps$j(a, __getOwnPropDescs$j(b));
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
const consoleBackgroundColor$1 = "rgba(51,51,51,0.75)";
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
  __spreadProps$j(__spreadValues$o({}, BasePoemStyle$1), {
    name: "Sayori",
    fontName: "hashtag",
    fontSize: 34,
    lineSpacing: 1.05,
    letterSpacing: 0
  }),
  __spreadProps$j(__spreadValues$o({}, BasePoemStyle$1), {
    name: "Natsuki",
    fontName: "ammy_handwriting",
    fontSize: 28
  }),
  __spreadProps$j(__spreadValues$o({}, BasePoemStyle$1), {
    name: "Monika",
    fontName: "journal",
    fontSize: 34
  }),
  __spreadProps$j(__spreadValues$o({}, BasePoemStyle$1), {
    name: "Yuri",
    fontName: "jp_hand_slanted",
    lineSpacing: 1.5,
    fontSize: 32
  }),
  __spreadProps$j(__spreadValues$o({}, BasePoemStyle$1), {
    name: "Yuri Act 2",
    fontName: "damagrafik_script",
    fontSize: 18,
    letterSpacing: -8
  }),
  __spreadProps$j(__spreadValues$o({}, BasePoemStyle$1), {
    name: "Yuri Unused",
    fontName: "as_i_lay_dying",
    fontSize: 40
  }),
  __spreadProps$j(__spreadValues$o({}, BasePoemStyle$1), {
    name: "MC",
    fontName: "halogen",
    fontSize: 30,
    lineSpacing: 1.53
  }),
  __spreadProps$j(__spreadValues$o({}, BasePoemStyle$1), {
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
  TextBoxCustom: TextBoxCustom$1
};
const screenWidth = 1920;
const screenHeight = 1080;
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
const BaseCharacterYPos = -39;
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
const TextBoxCustom = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
var __defProps$i = Object.defineProperties;
var __getOwnPropDescs$i = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$n = Object.getOwnPropertySymbols;
var __hasOwnProp$n = Object.prototype.hasOwnProperty;
var __propIsEnum$n = Object.prototype.propertyIsEnumerable;
var __defNormalProp$D = (obj, key, value) => key in obj ? __defProp$D(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$n = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$n.call(b, prop))
      __defNormalProp$D(a, prop, b[prop]);
  if (__getOwnPropSymbols$n)
    for (var prop of __getOwnPropSymbols$n(b)) {
      if (__propIsEnum$n.call(b, prop))
        __defNormalProp$D(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$i = (a, b) => __defProps$i(a, __getOwnPropDescs$i(b));
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
const NameboxTextStyle = __spreadProps$i(__spreadValues$n({}, BaseTextStyle), {
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
const ControlsTextDisabledStyle = __spreadProps$i(__spreadValues$n({}, ControlsTextStyle), {
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
var __defProps$h = Object.defineProperties;
var __getOwnPropDescs$h = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$m = Object.getOwnPropertySymbols;
var __hasOwnProp$m = Object.prototype.hasOwnProperty;
var __propIsEnum$m = Object.prototype.propertyIsEnumerable;
var __defNormalProp$C = (obj, key, value) => key in obj ? __defProp$C(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$m = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$m.call(b, prop))
      __defNormalProp$C(a, prop, b[prop]);
  if (__getOwnPropSymbols$m)
    for (var prop of __getOwnPropSymbols$m(b)) {
      if (__propIsEnum$m.call(b, prop))
        __defNormalProp$C(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$h = (a, b) => __defProps$h(a, __getOwnPropDescs$h(b));
const NotificationBackgroundColor = "#ffe6f4";
const NotificationBorderColor = "#ffbde1";
const NotificationBackdropColor = "rgba(255,255,255,0.6)";
const NotificationPadding = 60;
const NotificationSpacing = 45;
const NotificationOkTextStyle = __spreadProps$h(__spreadValues$m({}, BaseTextStyle), {
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
var __defProps$g = Object.defineProperties;
var __getOwnPropDescs$g = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$l = Object.getOwnPropertySymbols;
var __hasOwnProp$l = Object.prototype.hasOwnProperty;
var __propIsEnum$l = Object.prototype.propertyIsEnumerable;
var __defNormalProp$B = (obj, key, value) => key in obj ? __defProp$B(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$l = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$l.call(b, prop))
      __defNormalProp$B(a, prop, b[prop]);
  if (__getOwnPropSymbols$l)
    for (var prop of __getOwnPropSymbols$l(b)) {
      if (__propIsEnum$l.call(b, prop))
        __defNormalProp$B(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$g = (a, b) => __defProps$g(a, __getOwnPropDescs$g(b));
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
const poemTopPadding = 33;
const poemBottomPadding = 100;
const poemPadding = 30;
const defaultPoemWidth = 800;
const defaultPoemHeight = 720;
const consoleBackgroundColor = "rgba(51,51,51,0.75)";
const consoleWidth = 480;
const consoleHeight = 180;
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
  fontSize: 12
};
const poemTextStyles = [
  __spreadProps$g(__spreadValues$l({}, BasePoemStyle), {
    name: "Sayori",
    fontName: "hashtag",
    fontSize: 34,
    lineSpacing: 1.05,
    letterSpacing: 0
  }),
  __spreadProps$g(__spreadValues$l({}, BasePoemStyle), {
    name: "Natsuki",
    fontName: "ammy_handwriting",
    fontSize: 28
  }),
  __spreadProps$g(__spreadValues$l({}, BasePoemStyle), {
    name: "Monika",
    fontName: "journal",
    fontSize: 34
  }),
  __spreadProps$g(__spreadValues$l({}, BasePoemStyle), {
    name: "Yuri",
    fontName: "jp_hand_slanted",
    lineSpacing: 1.5,
    fontSize: 32
  }),
  __spreadProps$g(__spreadValues$l({}, BasePoemStyle), {
    name: "Yuri Act 2",
    fontName: "damagrafik_script",
    fontSize: 18,
    letterSpacing: -8
  }),
  __spreadProps$g(__spreadValues$l({}, BasePoemStyle), {
    name: "Yuri Unused",
    fontName: "as_i_lay_dying",
    fontSize: 40
  }),
  __spreadProps$g(__spreadValues$l({}, BasePoemStyle), {
    name: "MC",
    fontName: "halogen",
    fontSize: 30,
    lineSpacing: 1.53
  }),
  __spreadProps$g(__spreadValues$l({}, BasePoemStyle), {
    name: "Console",
    fontName: "f25_bank_printer",
    fontSize: 18,
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
  TextBoxCustom
};
function getConstants() {
  if (envX.gameMode === "ddlc_plus")
    return DdlcPlus;
  return Ddlc;
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
    zoom: 1
  };
}
var __defProp$A = Object.defineProperty;
var __defProps$f = Object.defineProperties;
var __getOwnPropDescs$f = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$k = Object.getOwnPropertySymbols;
var __hasOwnProp$k = Object.prototype.hasOwnProperty;
var __propIsEnum$k = Object.prototype.propertyIsEnumerable;
var __defNormalProp$A = (obj, key, value) => key in obj ? __defProp$A(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$k = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$k.call(b, prop))
      __defNormalProp$A(a, prop, b[prop]);
  if (__getOwnPropSymbols$k)
    for (var prop of __getOwnPropSymbols$k(b)) {
      if (__propIsEnum$k.call(b, prop))
        __defNormalProp$A(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$f = (a, b) => __defProps$f(a, __getOwnPropDescs$f(b));
var __async$u = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
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
    var _a;
    const id = state.panels[command.panelId].lastObjId + 1;
    const constants = getConstants();
    const char = getDataG(rootGetters, command.characterType);
    const charScale = char.hd ? constants.Base.hdCharacterScaleFactor : constants.Base.sdCharacterScaleFactor;
    commit2("create", {
      object: __spreadProps$f(__spreadValues$k({}, baseProps()), {
        id,
        panelId: rootState.panels.currentPanel,
        onTop: false,
        type: "character",
        y: constants.Base.BaseCharacterYPos,
        preserveRatio: true,
        ratio: 1,
        width: char.size[0] * char.defaultScale[0] * charScale,
        height: char.size[1] * char.defaultScale[1] * charScale,
        characterType: command.characterType,
        close: false,
        freeMove: false,
        poseId: 0,
        styleId: 0,
        styleGroupId: 0,
        posePositions: {},
        label: (_a = char.label) != null ? _a : char.id,
        enlargeWhenTalking: rootState.ui.defaultCharacterTalkingZoom
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
    let head = (obj.posePositions.head || 0) + delta;
    let headType = obj.posePositions.headType || 0;
    if (head < 0 || head >= currentHeads.variants.length) {
      headType = arraySeeker(
        pose.compatibleHeads.map((headKey) => data.heads[headKey]),
        headType,
        delta
      );
      currentHeads = getHeads(data, obj, headType);
      head = delta === 1 ? 0 : currentHeads.variants.length - 1;
    }
    commit2("setPosePosition", {
      id,
      panelId,
      posePositions: {
        head,
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
      y = constants.Base.BaseCharacterYPos + (obj.close ? constants.Base.CloseUpYOffset : 0);
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
  return __async$u(this, null, function* () {
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
      if (!newPose.positions.hasOwnProperty(key))
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
const _sfc_main$r = defineComponent({
  props: {
    title: {
      required: true,
      type: String
    }
  }
});
const dFieldset_vue_vue_type_style_index_0_scoped_d714a009_lang = "";
const _hoisted_1$m = { class: "fieldset_wrapper" };
const _hoisted_2$k = { key: 0 };
const _hoisted_3$i = { class: "fieldset_contents" };
function _sfc_render$q(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1$m, [
    createBaseVNode("fieldset", null, [
      _ctx.title > "" ? (openBlock(), createElementBlock("legend", _hoisted_2$k, toDisplayString(_ctx.title), 1)) : createCommentVNode("", true),
      createBaseVNode("div", _hoisted_3$i, [
        renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ])
    ])
  ]);
}
const DFieldset = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["render", _sfc_render$q], ["__scopeId", "data-v-d714a009"]]);
var __async$t = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const spriteSize = 960;
const _sfc_main$q = defineComponent({
  props: {
    part: {
      required: true
    },
    value: {
      required: true
    },
    size: {
      type: Number,
      default: 150
    }
  },
  data: () => ({
    lookups: [],
    loaded: false
  }),
  computed: {
    scaleX() {
      return this.size / this.part.size[0];
    },
    scaleY() {
      return this.size / this.part.size[1];
    },
    backgroundSize() {
      return `${Math.floor(spriteSize * this.scaleX)}px ${Math.floor(
        spriteSize * this.scaleY
      )}px`;
    },
    backgroundPosition() {
      return `${Math.floor(this.part.offset[0] * -this.scaleX)}px ${Math.floor(this.part.offset[1] * -this.scaleY)}px`;
    },
    background() {
      var _a, _b;
      let ret = "";
      const size2 = this.backgroundSize;
      const globalOffset = (_a = this.part.offset) != null ? _a : [0, 0];
      for (let i = 0; i < this.part.images.length; ++i) {
        const image = this.part.images[i];
        const lookup = this.lookups[i];
        if (!lookup)
          continue;
        if (i > 0)
          ret += ", ";
        const localOffset = (_b = image.offset) != null ? _b : [0, 0];
        const pos = `${Math.floor(
          (globalOffset[0] - localOffset[0]) * -this.scaleX
        )}px ${Math.floor((globalOffset[1] - localOffset[1]) * -this.scaleY)}px`;
        ret += `url('${lookup.replace("'", "\\'")}') ${pos} / ${size2}`;
      }
      return ret;
    },
    style() {
      return {
        height: this.size + "px",
        width: this.size + "px",
        background: this.background
      };
    }
  },
  created() {
    return __async$t(this, null, function* () {
      this.lookups = yield Promise.all(
        this.part.images.map((image) => {
          if (typeof image.asset === "string") {
            return getBuildInAssetUrl(image.asset, false);
          } else {
            return getAAssetUrl(image.asset, false);
          }
        })
      );
    });
  },
  methods: {
    quickClick(e) {
      e.preventDefault();
      this.$emit("quick-click");
    }
  }
});
const partButton_vue_vue_type_style_index_0_scoped_aa6e96cb_lang = "";
function _sfc_render$p(_ctx, _cache, $props, $setup, $data, $options) {
  var _a;
  return openBlock(), createElementBlock("div", {
    class: normalizeClass({ part: true, active: (_a = _ctx.part) == null ? void 0 : _a.active }),
    style: normalizeStyle$1(_ctx.style),
    tabindex: "0",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click")),
    onContextmenu: _cache[1] || (_cache[1] = (...args) => _ctx.quickClick && _ctx.quickClick(...args)),
    onKeydown: [
      _cache[2] || (_cache[2] = withKeys(withModifiers(($event) => _ctx.$emit("click"), ["prevent"]), ["enter"])),
      _cache[3] || (_cache[3] = withKeys(withModifiers((...args) => _ctx.quickClick && _ctx.quickClick(...args), ["prevent"]), ["space"]))
    ]
  }, null, 38);
}
const PartButton = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["render", _sfc_render$p], ["__scopeId", "data-v-aa6e96cb"]]);
var __defProp$z = Object.defineProperty;
var __defProps$e = Object.defineProperties;
var __getOwnPropDescs$e = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$j = Object.getOwnPropertySymbols;
var __hasOwnProp$j = Object.prototype.hasOwnProperty;
var __propIsEnum$j = Object.prototype.propertyIsEnumerable;
var __defNormalProp$z = (obj, key, value) => key in obj ? __defProp$z(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$j = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$j.call(b, prop))
      __defNormalProp$z(a, prop, b[prop]);
  if (__getOwnPropSymbols$j)
    for (var prop of __getOwnPropSymbols$j(b)) {
      if (__propIsEnum$j.call(b, prop))
        __defNormalProp$z(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$e = (a, b) => __defProps$e(a, __getOwnPropDescs$e(b));
const _sfc_main$p = defineComponent({
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
      __spreadProps$e(__spreadValues$j({}, attrs), {
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
const dFlow_vue_vue_type_style_index_0_scoped_f45f382d_lang = "";
const DFlow = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["__scopeId", "data-v-f45f382d"]]);
var __async$s = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _sfc_main$o = defineComponent({
  components: { PartButton, DFieldset, DFlow },
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
  data: () => ({
    isWebPSupported: null,
    stylePriorities: []
  }),
  computed: {
    vertical() {
      return this.$store.state.ui.vertical;
    },
    styleComponents() {
      if (this.part !== "style")
        return [];
      const styleComponents = this.charData.styleGroups[this.character.styleGroupId];
      return styleComponents.styleComponents.map((component) => {
        const buttons = {};
        for (const key in component.variants) {
          if (!component.variants.hasOwnProperty(key))
            continue;
          const variant = component.variants[key];
          buttons[key] = {
            size: styleComponents.styles[0].poses[0].size,
            offset: [0, 0],
            images: [{ offset: [0, 0], asset: variant }],
            active: false
          };
        }
        return { label: component.label, name: component.id, buttons };
      });
    },
    parts() {
      const ret = {};
      let collection;
      let offset;
      let size2;
      const data = this.charData;
      const currentPose = getPose(data, this.character);
      switch (this.part) {
        case "head":
          const activeHeadTypeIdx = this.character.posePositions.headType || 0;
          const activeHeadIdx = this.character.posePositions.head || 0;
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
        case "pose":
          const currentStyle = data.styleGroups[this.character.styleGroupId].styles[this.character.styleId];
          for (let poseIdx = 0; poseIdx < currentStyle.poses.length; ++poseIdx) {
            const pose = currentStyle.poses[poseIdx];
            ret[poseIdx] = this.generatePosePreview(pose);
            ret[poseIdx].active = poseIdx === this.character.poseId;
          }
          return ret;
        case "style":
          for (let styleIdx = 0; styleIdx < data.styleGroups.length; ++styleIdx) {
            const styleGroup = data.styleGroups[styleIdx];
            ret[styleGroup.id] = this.generatePosePreview(
              styleGroup.styles[0].poses[0]
            );
            ret[styleGroup.id].active = styleIdx === this.character.styleGroupId;
          }
          return ret;
        default:
          collection = currentPose.positions[this.part];
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
          active: partIdx === (this.character.posePositions[this.part] || 0)
        };
      }
      return ret;
    },
    charData() {
      return getData(this.$store, this.character);
    }
  },
  methods: {
    updateStyleData() {
      const baseStyle = this.charData.styleGroups[this.character.styleGroupId].styles[this.character.styleId];
      this.stylePriorities = Object.keys(baseStyle.components).map((key) => [
        key,
        baseStyle.components[key]
      ]);
    },
    generatePosePreview(pose) {
      const data = this.charData;
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
          case "head":
            const heads = data.heads[pose.compatibleHeads[0]];
            if (pose.compatibleHeads.length === 0)
              break;
            const head = heads.variants[0];
            images = images.concat(
              head.map((x) => ({
                asset: x,
                offset: command.offset
              }))
            );
            break;
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
    },
    updatePose(styleGroupId) {
      if (styleGroupId == void 0)
        styleGroupId = this.character.styleGroupId;
      const data = this.charData;
      const styleGroups = data.styleGroups[styleGroupId];
      let selection = styleGroups.styles;
      for (const priority of this.stylePriorities) {
        const subSelect = selection.filter((style) => {
          return style.components[priority[0]] === priority[1];
        });
        if (subSelect.length > 0)
          selection = subSelect;
      }
      this.vuexHistory.transaction(() => __async$s(this, null, function* () {
        yield this.$store.dispatch("panels/setCharStyle", {
          id: this.character.id,
          panelId: this.character.panelId,
          styleGroupId,
          styleId: styleGroups.styles.indexOf(selection[0])
        });
      }));
    },
    choose(index) {
      if (this.part === "style") {
        this.updatePose(
          this.charData.styleGroups.findIndex((group) => group.id === index)
        );
      } else if (this.part === "head") {
        const [headTypeIdx, headIdx] = index.split("_", 2).map((part) => parseInt(part, 10));
        this.$store.commit("panels/setPosePosition", {
          id: this.character.id,
          panelId: this.character.panelId,
          posePositions: {
            headType: headTypeIdx,
            head: headIdx
          }
        });
      } else {
        this.setPart(this.part, parseInt(index, 10));
      }
    },
    choose_component(component, id) {
      const prioIdx = this.stylePriorities.findIndex(
        (stylePriority) => stylePriority[0] === component
      );
      this.stylePriorities.splice(prioIdx, 1);
      this.stylePriorities.unshift([component, id]);
      this.updatePose();
    },
    onKeydown(e) {
      if (e.key === "Backspace" || e.key === "Escape") {
        this.$emit("leave");
        e.preventDefault();
        e.stopPropagation();
      }
    },
    setPart(part, index) {
      this.vuexHistory.transaction(() => {
        this.$store.dispatch("panels/setPart", {
          id: this.character.id,
          panelId: this.character.panelId,
          part,
          val: index
        });
      });
    }
  },
  created() {
    return __async$s(this, null, function* () {
      this.updateStyleData();
      this.isWebPSupported = yield isWebPSupported();
    });
  },
  watch: {
    character() {
      this.updateStyleData();
    }
  }
});
const parts_vue_vue_type_style_index_0_scoped_15457ce1_lang = "";
const _withScopeId$d = (n) => (pushScopeId("data-v-15457ce1"), n = n(), popScopeId(), n);
const _hoisted_1$l = /* @__PURE__ */ _withScopeId$d(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "extension", -1));
const _hoisted_2$j = /* @__PURE__ */ _withScopeId$d(() => /* @__PURE__ */ createBaseVNode("span", { class: "text-block" }, "Create new expressions", -1));
const _hoisted_3$h = [
  _hoisted_1$l,
  _hoisted_2$j
];
const _hoisted_4$g = /* @__PURE__ */ _withScopeId$d(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "extension", -1));
const _hoisted_5$e = /* @__PURE__ */ _withScopeId$d(() => /* @__PURE__ */ createBaseVNode("span", { class: "text-block" }, "Search in content packs", -1));
const _hoisted_6$e = [
  _hoisted_4$g,
  _hoisted_5$e
];
const _hoisted_7$c = /* @__PURE__ */ _withScopeId$d(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "extension", -1));
const _hoisted_8$b = /* @__PURE__ */ _withScopeId$d(() => /* @__PURE__ */ createBaseVNode("span", null, "Search in content packs", -1));
const _hoisted_9$a = [
  _hoisted_7$c,
  _hoisted_8$b
];
const _hoisted_10$a = /* @__PURE__ */ _withScopeId$d(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "extension", -1));
const _hoisted_11$9 = /* @__PURE__ */ _withScopeId$d(() => /* @__PURE__ */ createBaseVNode("span", null, "Search in content packs", -1));
const _hoisted_12$8 = [
  _hoisted_10$a,
  _hoisted_11$9
];
function _sfc_render$o(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_part_button = resolveComponent("part-button");
  const _component_d_flow = resolveComponent("d-flow");
  const _component_d_fieldset = resolveComponent("d-fieldset");
  return openBlock(), createBlock(_component_d_flow, {
    "no-wraping": "",
    onKeydown: _ctx.onKeydown
  }, {
    default: withCtx(() => [
      createBaseVNode("button", {
        onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("leave"))
      }, "Back"),
      _ctx.part === "head" ? (openBlock(), createElementBlock("button", {
        key: 0,
        onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("show-expression-dialog", { character: _ctx.character.characterType })),
        class: "icon-button"
      }, _hoisted_3$h)) : createCommentVNode("", true),
      _ctx.part === "head" ? (openBlock(), createElementBlock("button", {
        key: 1,
        onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("show-dialog", "type: Expressions character: " + _ctx.charData.label)),
        class: "icon-button"
      }, _hoisted_6$e)) : _ctx.part === "style" ? (openBlock(), createElementBlock("button", {
        key: 2,
        onClick: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("show-dialog", "type: Styles character: " + _ctx.charData.label)),
        class: "icon-button"
      }, _hoisted_9$a)) : (openBlock(), createElementBlock("button", {
        key: 3,
        onClick: _cache[4] || (_cache[4] = ($event) => _ctx.$emit("show-dialog", "type: Poses character: " + _ctx.charData.label)),
        class: "icon-button"
      }, _hoisted_12$8)),
      (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.parts, (part, index) => {
        return openBlock(), createBlock(_component_part_button, {
          key: index,
          value: index,
          part,
          onClick: ($event) => {
            _ctx.choose(index);
            _ctx.$emit("leave");
          },
          onQuickClick: ($event) => _ctx.choose(index)
        }, null, 8, ["value", "part", "onClick", "onQuickClick"]);
      }), 128)),
      (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.styleComponents, (styleComponent) => {
        return openBlock(), createBlock(_component_d_fieldset, {
          key: styleComponent.name,
          title: styleComponent.label
        }, {
          default: withCtx(() => [
            createVNode(_component_d_flow, { noWraping: "" }, {
              default: withCtx(() => [
                (openBlock(true), createElementBlock(Fragment, null, renderList(styleComponent.buttons, (button, id) => {
                  return openBlock(), createBlock(_component_part_button, {
                    size: 130,
                    key: id,
                    value: id,
                    part: button,
                    onClick: ($event) => _ctx.choose_component(styleComponent.name, id)
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
  }, 8, ["onKeydown"]);
}
const Parts = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["render", _sfc_render$o], ["__scopeId", "data-v-15457ce1"]]);
function genericSetable() {
  return function setable2(key, message, action = false) {
    return {
      get() {
        return this.object[key];
      },
      set(val) {
        this.vuexHistory.transaction(() => {
          this.$store[action ? "dispatch" : "commit"](message, {
            panelId: this.object.panelId,
            id: this.object.id,
            [key]: val
          });
        });
      }
    };
  };
}
function genericSimpleSetter(message) {
  return function setable2(key) {
    return {
      get() {
        return this.object[key];
      },
      set(value) {
        this.vuexHistory.transaction(() => {
          this.$store["commit"](message, {
            panelId: this.object.panelId,
            id: this.object.id,
            key,
            value
          });
        });
      }
    };
  };
}
var __defProp$y = Object.defineProperty;
var __defNormalProp$y = (obj, key, value) => key in obj ? __defProp$y(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$j = (obj, key, value) => {
  __defNormalProp$y(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const aroundContextSize = 5;
class StringWalker {
  constructor(str) {
    this.str = str;
    __publicField$j(this, "pos", 0);
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
var __defProp$x = Object.defineProperty;
var __defProps$d = Object.defineProperties;
var __getOwnPropDescs$d = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$i = Object.getOwnPropertySymbols;
var __hasOwnProp$i = Object.prototype.hasOwnProperty;
var __propIsEnum$i = Object.prototype.propertyIsEnumerable;
var __defNormalProp$x = (obj, key, value) => key in obj ? __defProp$x(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$i = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$i.call(b, prop))
      __defNormalProp$x(a, prop, b[prop]);
  if (__getOwnPropSymbols$i)
    for (var prop of __getOwnPropSymbols$i(b)) {
      if (__propIsEnum$i.call(b, prop))
        __defNormalProp$x(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$d = (a, b) => __defProps$d(a, __getOwnPropDescs$d(b));
const textCommands = new Map([
  paramlessOp("i", (style) => __spreadProps$d(__spreadValues$i({}, style), { isItalic: true })),
  paramlessOp("b", (style) => __spreadProps$d(__spreadValues$i({}, style), { isBold: true })),
  paramlessOp("u", (style) => __spreadProps$d(__spreadValues$i({}, style), { isUnderlined: true })),
  paramlessOp("s", (style) => __spreadProps$d(__spreadValues$i({}, style), {
    isStrikethrough: true
  })),
  paramlessOp("plain", (style) => __spreadProps$d(__spreadValues$i({}, style), {
    isStrikethrough: false,
    isUnderlined: false,
    isBold: false,
    isItalic: false
  })),
  paramlessOp("edited", (style) => __spreadProps$d(__spreadValues$i({}, style), {
    fontName: "verily",
    strokeColor: "#000000",
    strokeWidth: 20,
    letterSpacing: 8
  })),
  relativeNumberOp("k", (style, relative, parameter) => __spreadProps$d(__spreadValues$i({}, style), {
    letterSpacing: relative ? style.letterSpacing + parameter : parameter
  })),
  relativeNumberOp("size", (style, relative, parameter) => __spreadProps$d(__spreadValues$i({}, style), {
    fontSize: relative ? style.fontSize + parameter : parameter
  })),
  relativeNumberOp("alpha", (style, relative, parameter) => __spreadProps$d(__spreadValues$i({}, style), {
    alpha: relative ? style.alpha + parameter : parameter
  })),
  relativeNumberOp("stroke", (style, relative, parameter) => __spreadProps$d(__spreadValues$i({}, style), {
    strokeWidth: relative ? style.strokeWidth + parameter : parameter
  })),
  [
    "font",
    (style, parameter) => {
      return __spreadProps$d(__spreadValues$i({}, style), { fontName: parameter });
    }
  ],
  [
    "color",
    (style, parameter) => {
      return __spreadProps$d(__spreadValues$i({}, style), { color: parameter });
    }
  ],
  [
    "outlinecolor",
    (style, parameter) => {
      return __spreadProps$d(__spreadValues$i({}, style), { strokeColor: parameter });
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
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var dist = {};
var types = {};
Object.defineProperty(types, "__esModule", { value: true });
var functions = {};
Object.defineProperty(functions, "__esModule", { value: true });
functions.createFactoryWithConstraint = functions.isExact = functions.noop = functions.assert = functions.UnreachableCaseError = void 0;
class UnreachableCaseError extends Error {
  constructor(value) {
    super(`Unreachable case: ${value}`);
  }
}
functions.UnreachableCaseError = UnreachableCaseError;
function assert(condition, msg = "no additional info provided") {
  if (!condition) {
    throw new Error("Assertion Error: " + msg);
  }
}
functions.assert = assert;
function noop(..._args) {
}
functions.noop = noop;
const isExact = () => (x) => {
  return x;
};
functions.isExact = isExact;
const createFactoryWithConstraint = () => (value) => value;
functions.createFactoryWithConstraint = createFactoryWithConstraint;
var literalTypes = {};
Object.defineProperty(literalTypes, "__esModule", { value: true });
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
  __exportStar(types, exports);
  __exportStar(functions, exports);
  __exportStar(literalTypes, exports);
})(dist);
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
var __defProp$w = Object.defineProperty;
var __defNormalProp$w = (obj, key, value) => key in obj ? __defProp$w(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$i = (obj, key, value) => {
  __defNormalProp$w(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$r = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class TextRenderer {
  constructor(str, baseStyle) {
    this.str = str;
    this.baseStyle = baseStyle;
    __publicField$i(this, "renderParts");
    __publicField$i(this, "tokens");
    __publicField$i(this, "loose");
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
    return __async$r(this, null, function* () {
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
      let neededToLoad = false;
      for (const font of fonts) {
        const doc2 = document;
        const fontString = `8px ${font}`;
        if (!doc2.fonts.check(fontString)) {
          neededToLoad = true;
          yield doc2.fonts.load(fontString);
        }
      }
      if (neededToLoad) {
        const tokens = tokenize(this.str);
        this.renderParts = TextRenderer.getRenderParts(
          tokens,
          this.baseStyle,
          this.loose
        );
      }
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
class RenderAbortedException {
}
var __defProp$v = Object.defineProperty;
var __getOwnPropSymbols$h = Object.getOwnPropertySymbols;
var __hasOwnProp$h = Object.prototype.hasOwnProperty;
var __propIsEnum$h = Object.prototype.propertyIsEnumerable;
var __defNormalProp$v = (obj, key, value) => key in obj ? __defProp$v(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$h = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$h.call(b, prop))
      __defNormalProp$v(a, prop, b[prop]);
  if (__getOwnPropSymbols$h)
    for (var prop of __getOwnPropSymbols$h(b)) {
      if (__propIsEnum$h.call(b, prop))
        __defNormalProp$v(a, prop, b[prop]);
    }
  return a;
};
var __publicField$h = (obj, key, value) => {
  __defNormalProp$v(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$q = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
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
    } = __spreadValues$h(__spreadValues$h({}, {
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
    } = __spreadValues$h(__spreadValues$h({}, {
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
    if (params.image instanceof ErrorAsset)
      return;
    const { image, flip, x, y, w, h: h2, filters: filters2, composite } = __spreadValues$h({
      flip: false,
      w: params.image.width,
      h: params.image.height,
      composite: "source-over"
    }, params);
    this.fsCtx.save();
    this.fsCtx.globalCompositeOperation = composite;
    if (filters2) {
      if (!("filter" in this.fsCtx)) {
        let opacityCombined = 1;
        for (const filter of filters2) {
          if (filter.type === "opacity") {
            opacityCombined *= filter.value;
          }
        }
        this.fsCtx.globalAlpha = opacityCombined;
      } else {
        const filterList = [];
        for (const filter of filters2) {
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
    composition
  }) {
    if (this.aborted)
      throw new RenderAbortedException();
    this.fsCtx.save();
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
    return __async$q(this, null, function* () {
      this.fsCtx.save();
      yield transform(this.fsCtx);
      yield render(this);
      this.fsCtx.restore();
    });
  }
  linearGradient(x0, y0, x1, y1) {
    return this.fsCtx.createLinearGradient(x0, y0, x1, y1);
  }
  applyFilters(filters2) {
    if (filters2.length === 0)
      return;
    this.fsCtx.save();
    let opacityCombined = 1;
    for (const filter of filters2) {
      if (filter.type === "opacity") {
        opacityCombined *= filter.value;
      }
    }
    if ("filter" in this.fsCtx) {
      const filterList = [];
      for (const filter of filters2) {
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
var __defProp$u = Object.defineProperty;
var __defNormalProp$u = (obj, key, value) => key in obj ? __defProp$u(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$g = (obj, key, value) => {
  __defNormalProp$u(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$p = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
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
    return __async$p(this, null, function* () {
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
    return __async$p(this, null, function* () {
      const downloadCanvas = yield this.drawToCanvas(renderCallback);
      return yield envX.saveToFile(downloadCanvas, filename);
    });
  }
  renderToBlob(renderCallback) {
    return __async$p(this, null, function* () {
      const downloadCanvas = yield this.drawToCanvas(renderCallback);
      return yield new Promise((resolve2, reject) => {
        downloadCanvas.toBlob((blob) => {
          if (blob)
            resolve2(blob);
          else
            reject();
        });
      });
    });
  }
  drawToCanvas(renderCallback) {
    return __async$p(this, null, function* () {
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
function rotateAround(x, y, relX, relY, angle) {
  const angleCos = Math.cos(angle);
  const angleSin = Math.sin(angle);
  const translatedX = x - relX;
  const translatedY = y - relY;
  const rotatedX = angleCos * translatedX - angleSin * translatedY + relX;
  const rotatedY = angleSin * translatedX + angleCos * translatedY + relY;
  return [rotatedX, rotatedY];
}
var __defProp$t = Object.defineProperty;
var __defNormalProp$t = (obj, key, value) => key in obj ? __defProp$t(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$f = (obj, key, value) => {
  __defNormalProp$t(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$o = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var SelectedState = /* @__PURE__ */ ((SelectedState2) => {
  SelectedState2[SelectedState2["None"] = 0] = "None";
  SelectedState2[SelectedState2["Selected"] = 1] = "Selected";
  SelectedState2[SelectedState2["Focused"] = 2] = "Focused";
  SelectedState2[SelectedState2["Both"] = 3] = "Both";
  return SelectedState2;
})(SelectedState || {});
class OffscreenRenderable {
  constructor(obj) {
    this.obj = obj;
    __publicField$f(this, "localRenderer", null);
    __publicField$f(this, "lastVersion", null);
    __publicField$f(this, "hitDetectionFallback", false);
    __publicField$f(this, "renderable", false);
    __publicField$f(this, "_disposed", false);
    __publicField$f(this, "lastHq", false);
    __publicField$f(this, "ready", Promise.resolve());
  }
  get id() {
    return this.obj.id;
  }
  get x() {
    return this.obj.x;
  }
  get y() {
    return this.obj.y;
  }
  get version() {
    return this.obj.version;
  }
  get flip() {
    return this.obj.flip;
  }
  get rotation() {
    return this.obj.rotation / 180 * Math.PI;
  }
  get composite() {
    return this.obj.composite;
  }
  get filters() {
    return this.obj.filters;
  }
  get width() {
    return this.obj.width;
  }
  get height() {
    return this.obj.height;
  }
  get allowSkippingLocalCanvas() {
    return true;
  }
  updateLocalCanvas(hq, skipLocal) {
    return __async$o(this, null, function* () {
      if (this._disposed)
        throw new Error("Disposed renderable called");
      yield this.ready;
      const width = this.canvasWidth;
      const height = this.canvasHeight;
      if (height === 0 && width === 0) {
        this.renderable = false;
        return;
      }
      this.renderable = true;
      this.lastHq = hq;
      if (skipLocal)
        return;
      this.localRenderer = new Renderer(width, height);
      try {
        yield this.localRenderer.render(this.renderLocal.bind(this), hq);
      } catch (e) {
        this.localRenderer.dispose();
        this.localRenderer = null;
        throw e;
      }
    });
  }
  needsRedraw() {
    return this.localRenderer === null || this.lastVersion !== this.version;
  }
  getRenderRotation() {
    return [
      this.flip ? -this.rotation : this.rotation,
      {
        x: this.x,
        y: this.y + this.height / 2
      }
    ];
  }
  render(selected, rx, skipLocal) {
    return __async$o(this, null, function* () {
      if (this._disposed)
        throw new Error("Disposed renderable called");
      if (!this.canSkipLocal())
        skipLocal = false;
      if (selected !== 0 || this.localRenderer)
        skipLocal = false;
      const needRedraw = this.lastHq !== rx.hq || this.needsRedraw();
      if (needRedraw)
        yield this.updateLocalCanvas(rx.hq, skipLocal);
      this.lastVersion = this.version;
      if (!this.renderable)
        return;
      const [rotation, rotationAnchor] = this.getRenderRotation();
      let shadow = void 0;
      switch (selected) {
        case 0:
          shadow = void 0;
          break;
        case 1:
          shadow = { blur: 20, color: "red" };
          break;
        case 2:
          shadow = { blur: 20, color: "blue" };
          break;
        case 3:
          shadow = { blur: 20, color: "purple" };
          break;
      }
      if (skipLocal) {
        yield rx.customTransform((ctx) => __async$o(this, null, function* () {
          ctx.translate(this.canvasDrawPosX, this.canvasDrawPosY);
        }), this.renderLocal.bind(this));
      } else {
        rx.drawImage({
          image: this.localRenderer,
          x: this.canvasDrawPosX,
          y: this.canvasDrawPosY,
          w: this.canvasDrawWidth,
          h: this.canvasDrawHeight,
          rotation,
          rotationAnchor,
          flip: this.flip,
          shadow: selected && rx.preview ? shadow : void 0,
          composite: this.composite,
          filters: this.filters
        });
      }
    });
  }
  canSkipLocal() {
    return this.allowSkippingLocalCanvas && this.obj.filters.length === 0 && !this.obj.flip;
  }
  hitTest(hx, hy) {
    if (!this.localRenderer)
      return false;
    const hitbox = this.getHitbox();
    const centerX = hitbox.x0 + (hitbox.x1 - hitbox.x0) / 2;
    const centerY = hitbox.y0 + (hitbox.y1 - hitbox.y0) / 2;
    const [rotatedHitX, rotatedHitY] = rotateAround(
      hx,
      hy,
      centerX,
      centerY,
      this.flip ? this.rotation : -this.rotation
    );
    const hit = rotatedHitX >= hitbox.x0 && rotatedHitX <= hitbox.x1 && rotatedHitY >= hitbox.y0 && rotatedHitY <= hitbox.y1;
    if (!hit)
      return false;
    if (this.hitDetectionFallback)
      return true;
    try {
      return this.pixelPerfectHitTest(hx, hy);
    } catch (e) {
      this.hitDetectionFallback = true;
    }
    return true;
  }
  pixelPerfectHitTest(x, y) {
    if (!this.localRenderer)
      return false;
    const [angle, anchor] = this.getRenderRotation();
    const [rotatedHitX, rotatedHitY] = anchor ? rotateAround(x, y, anchor.x, anchor.y, -angle) : [x, y];
    const innerX = Math.round(rotatedHitX - this.canvasDrawPosX);
    const innerY = Math.round(rotatedHitY - this.canvasDrawPosY);
    const canvasDrawWidth = this.canvasDrawWidth;
    const canvasDrawHeight = this.canvasDrawHeight;
    if (innerX >= 0 && innerX <= canvasDrawWidth && innerY >= 0 && innerY <= canvasDrawHeight) {
      const flippedX = this.flip ? this.canvasDrawWidth - innerX : innerX;
      const scaleX = this.canvasWidth / this.canvasDrawWidth;
      const scaleY = this.canvasHeight / this.canvasDrawHeight;
      const data = this.localRenderer.getDataAt(
        Math.round(flippedX * scaleX),
        Math.round(innerY * scaleY)
      );
      return data[3] !== 0;
    }
    return false;
  }
  getHitbox() {
    return {
      x0: this.x - this.width / 2,
      x1: this.x + this.width / 2,
      y0: this.y,
      y1: this.y + this.height
    };
  }
  updatedContent(_current, _panelId) {
  }
  get disposed() {
    return this._disposed;
  }
  dispose() {
    var _a;
    this._disposed = true;
    (_a = this.localRenderer) == null ? void 0 : _a.dispose();
    this.localRenderer = null;
  }
}
var __defProp$s = Object.defineProperty;
var __getProtoOf$1 = Object.getPrototypeOf;
var __reflectGet$1 = Reflect.get;
var __defNormalProp$s = (obj, key, value) => key in obj ? __defProp$s(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$e = (obj, key, value) => {
  __defNormalProp$s(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __superGet$1 = (cls, obj, key) => __reflectGet$1(__getProtoOf$1(cls), key, obj);
var __async$n = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class ScalingRenderable extends OffscreenRenderable {
  constructor(obj) {
    super(obj);
    __publicField$e(this, "lastWidth", -1);
    __publicField$e(this, "lastHeight", -1);
    __publicField$e(this, "lastX", -1);
    __publicField$e(this, "lastY", -1);
    __publicField$e(this, "lastFlip", null);
    __publicField$e(this, "canvasHeight");
    __publicField$e(this, "canvasWidth");
    __publicField$e(this, "canvasDrawHeight");
    __publicField$e(this, "canvasDrawWidth");
    __publicField$e(this, "canvasDrawPosX", 0);
    __publicField$e(this, "canvasDrawPosY", 0);
    const constants = getConstants().Base;
    this.canvasHeight = constants.screenHeight;
    this.canvasWidth = constants.screenWidth;
    this.canvasDrawHeight = constants.screenHeight;
    this.canvasDrawWidth = constants.screenWidth;
  }
  getRenderRotation() {
    return [0, void 0];
  }
  needsRedraw() {
    if (super.needsRedraw())
      return true;
    return this.width !== this.lastWidth || this.height !== this.lastHeight || this.x !== this.lastX || this.y !== this.lastY || this.flip !== this.lastFlip;
  }
  updateLocalCanvas(hq, skipLocal) {
    return __async$n(this, null, function* () {
      this.lastWidth = this.width;
      this.lastHeight = this.height;
      this.lastX = this.x;
      this.lastY = this.y;
      this.lastFlip = this.flip;
      yield __superGet$1(ScalingRenderable.prototype, this, "updateLocalCanvas").call(this, hq, skipLocal);
    });
  }
  renderLocal(rx) {
    return __async$n(this, null, function* () {
      const constants = getConstants().Base;
      if (this.rotation === 0)
        return yield this.draw(rx);
      yield rx.customTransform((trx) => __async$n(this, null, function* () {
        const hitbox = this.getHitbox();
        const centerX = hitbox.x0 + (hitbox.x1 - hitbox.x0) / 2;
        const centerY = hitbox.y0 + (hitbox.y1 - hitbox.y0) / 2;
        const flipNormalizedCenterX = this.flip ? constants.screenWidth - centerX : centerX;
        trx.translate(flipNormalizedCenterX, centerY);
        trx.rotate(this.rotation);
        trx.translate(-flipNormalizedCenterX, -centerY);
      }), this.draw.bind(this));
    });
  }
  getHitbox() {
    const vCentered = this.centeredVertically;
    const w2 = this.width / 2;
    const h2 = this.height / 2;
    return {
      x0: this.x - w2,
      x1: this.x + w2,
      y0: vCentered ? this.y - h2 : this.y,
      y1: vCentered ? this.y + h2 : this.y + this.height
    };
  }
  get centeredVertically() {
    return false;
  }
}
var __defProp$r = Object.defineProperty;
var __getOwnPropSymbols$g = Object.getOwnPropertySymbols;
var __hasOwnProp$g = Object.prototype.hasOwnProperty;
var __propIsEnum$g = Object.prototype.propertyIsEnumerable;
var __defNormalProp$r = (obj, key, value) => key in obj ? __defProp$r(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$g = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$g.call(b, prop))
      __defNormalProp$r(a, prop, b[prop]);
  if (__getOwnPropSymbols$g)
    for (var prop of __getOwnPropSymbols$g(b)) {
      if (__propIsEnum$g.call(b, prop))
        __defNormalProp$r(a, prop, b[prop]);
    }
  return a;
};
class DdlcBase {
  constructor(base) {
    this.base = base;
  }
  static get resizable() {
    return false;
  }
  static get defaultWidth() {
    return TextBoxWidth$1;
  }
  static get defaultHeight() {
    return TextBoxHeight$1;
  }
  static get defaultX() {
    return getConstants().Base.screenWidth / 2;
  }
  static get defaultY() {
    return getConstants().Base.screenHeight - this.defaultHeight - NameboxHeight$1 - getConstants().TextBox.TextBoxBottomSpacing;
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
    const constants = getConstants();
    const w = this.width;
    const w2 = w / 2;
    const baseX = this.base.obj.flip ? constants.Base.screenWidth - this.base.obj.x : this.base.obj.x;
    const x = baseX - w2;
    const controlsCenter = x + w / 2;
    const controlsStyle = this.getControlsStyle();
    rx.drawText(__spreadValues$g({
      text: "History",
      x: controlsCenter + ControlsXHistoryOffset$1,
      y
    }, controlsStyle));
    rx.drawText(__spreadValues$g({
      text: "Skip",
      x: controlsCenter + ControlsXSkipOffset$1,
      y
    }, this.base.obj.skip ? controlsStyle : this.getControlsDisabledStyle()));
    rx.drawText(__spreadValues$g({
      text: "Auto   Save   Load   Settings",
      x: controlsCenter + ControlsXStuffOffset$1,
      y
    }, controlsStyle));
  }
}
var __defProp$q = Object.defineProperty;
var __defNormalProp$q = (obj, key, value) => key in obj ? __defProp$q(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$d = (obj, key, value) => {
  __defNormalProp$q(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$m = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class Default extends DdlcBase {
  constructor() {
    super(...arguments);
    __publicField$d(this, "backgroundImage", "textbox");
    __publicField$d(this, "xOffset", 0);
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
    return __async$m(this, null, function* () {
      rx.drawImage({
        image: yield getBuildInAsset("namebox"),
        x,
        y
      });
    });
  }
  renderBackdrop(rx, x, y) {
    return __async$m(this, null, function* () {
      x += this.xOffset;
      const image = yield getBuildInAsset(this.backgroundImage);
      rx.drawImage({ image, x, y });
    });
  }
  render(rx) {
    return __async$m(this, null, function* () {
      const constants = getConstants();
      const w = this.width;
      const h2 = this.height;
      const w2 = w / 2;
      const baseX = this.obj.flip ? constants.Base.screenWidth - this.obj.x : this.obj.x;
      const x = baseX - w2;
      const y = this.obj.y;
      yield this.renderBackdrop(rx, x, y + this.nameboxHeight);
      if (this.obj.talkingObjId !== null) {
        yield this.renderNamebox(rx, x + this.nameboxOffsetX, y);
      }
      const bottom = y + h2;
      const controlsY = bottom - ControlsYBottomOffset$1;
      if (this.obj.controls)
        this.renderControls(rx, controlsY);
      if (this.obj.continue) {
        rx.drawImage({
          image: yield getBuildInAsset("next"),
          x: x + w - ArrowXRightOffset$1,
          y: bottom - ArrowYBottomOffset$1
        });
      }
    });
  }
}
__publicField$d(Default, "id", "normal");
__publicField$d(Default, "label", "Normal");
__publicField$d(Default, "priority", 0);
__publicField$d(Default, "gameMode", "ddlc");
var __defProp$p = Object.defineProperty;
var __defNormalProp$p = (obj, key, value) => key in obj ? __defProp$p(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$c = (obj, key, value) => {
  __defNormalProp$p(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class Corrupted extends Default {
  constructor() {
    super(...arguments);
    __publicField$c(this, "backgroundImage", "textbox_monika");
    __publicField$c(this, "xOffset", (TextBoxWidth$1 - TextBoxCorruptedWidth$1) / 2);
  }
}
__publicField$c(Corrupted, "id", "corrupt");
__publicField$c(Corrupted, "label", "Corrupted");
__publicField$c(Corrupted, "priority", 1);
__publicField$c(Corrupted, "gameMode", "ddlc");
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
var __defProp$o = Object.defineProperty;
var __defProps$c = Object.defineProperties;
var __getOwnPropDescs$c = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$f = Object.getOwnPropertySymbols;
var __hasOwnProp$f = Object.prototype.hasOwnProperty;
var __propIsEnum$f = Object.prototype.propertyIsEnumerable;
var __defNormalProp$o = (obj, key, value) => key in obj ? __defProp$o(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$f = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$f.call(b, prop))
      __defNormalProp$o(a, prop, b[prop]);
  if (__getOwnPropSymbols$f)
    for (var prop of __getOwnPropSymbols$f(b)) {
      if (__propIsEnum$f.call(b, prop))
        __defNormalProp$o(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$c = (a, b) => __defProps$c(a, __getOwnPropDescs$c(b));
var __publicField$b = (obj, key, value) => {
  __defNormalProp$o(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$l = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class Custom extends DdlcBase {
  constructor() {
    super(...arguments);
    __publicField$b(this, "backgroundImage", "textbox");
    __publicField$b(this, "xOffset", 0);
  }
  static get resizable() {
    return true;
  }
  get height() {
    return this.obj.height + NameboxHeight$1;
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
    return __spreadProps$c(__spreadValues$f({}, NameboxTextStyle$1), {
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
    return __async$l(this, null, function* () {
      const w = this.nameboxWidth;
      const h2 = this.nameboxHeight;
      yield rx.customTransform(
        (ctx) => __async$l(this, null, function* () {
          ctx.beginPath();
          roundedTopRectangle(ctx, x, y, w, h2, nameboxRounding$1);
          ctx.clip();
        }),
        (subRx) => __async$l(this, null, function* () {
          const gradient = subRx.linearGradient(x, y, x, y + h2);
          const baseBG = RGBAColor.fromCss(this.nameboxBackgroundColor);
          const color2 = new RGBAColor(baseBG.r, baseBG.g, baseBG.b, 0.95);
          const targetColor = color2.toHSL().shift(nameboxGradientEndDelta$1).toRgb();
          gradient.addColorStop(0, color2.toCss());
          gradient.addColorStop(nameboxGradientMiddleStopPosition$1, color2.toCss());
          gradient.addColorStop(1, targetColor.toCss());
          subRx.drawRect({
            x,
            y,
            w: this.obj.width,
            h: h2,
            fill: {
              style: gradient
            }
          });
        })
      );
    });
  }
  renderBackdrop(rx, x, y) {
    return __async$l(this, null, function* () {
      const hslColor = RGBAColor.fromCss(this.customColor).toHSL();
      const dotPattern = new Renderer(dotPatternSize$1, dotPatternSize$1);
      yield dotPattern.render((dotRx) => __async$l(this, null, function* () {
        const fill = {
          style: hslColor.shift(dotColorDelta$1).toRgb().toCss()
        };
        function drawDot(dotX, dotY) {
          dotRx.drawPath({
            path: (ctx) => {
              ctx.ellipse(dotX, dotY, dotRadius$1, dotRadius$1, 0, 0, 2 * Math.PI);
            },
            fill
          });
        }
        drawDot(0, 0);
        drawDot(dotPatternSize$1, 0);
        drawDot(0, dotPatternSize$1);
        drawDot(dotPatternSize$1, dotPatternSize$1);
        drawDot(dotPatternSize$1 / 2, dotPatternSize$1 / 2);
      }), true);
      yield rx.customTransform(
        (ctx) => __async$l(this, null, function* () {
          ctx.beginPath();
          roundedRectangle(
            ctx,
            x + textboxRoundingBuffer$1,
            y + textboxRoundingBuffer$1,
            this.width - textboxRoundingBuffer$1 * 2,
            this.height - NameboxHeight$1 - textboxRoundingBuffer$1 * 2,
            textboxRounding$1
          );
          ctx.clip();
        }),
        (subRx) => __async$l(this, null, function* () {
          const h2 = this.obj.height;
          const w = this.obj.width;
          const gradient = subRx.linearGradient(x, y, x, y + h2);
          const color2 = RGBAColor.fromHex(this.customColor);
          gradient.addColorStop(0, color2.toCss());
          gradient.addColorStop(
            1,
            `rgba(${color2.r},${color2.g},${color2.b},0.6667)`
          );
          subRx.drawRect({
            x,
            y,
            w,
            h: h2,
            fill: {
              style: gradient
            },
            outline: {
              style: "#ffdfee",
              width: 6
            }
          });
          yield subRx.customTransform(
            (ctx) => __async$l(this, null, function* () {
              ctx.translate(x, y);
            }),
            (_subSubRx) => __async$l(this, null, function* () {
              const pattern = subRx.patternFrom(dotPattern);
              subRx.drawRect({
                x: 0,
                y: 0,
                w,
                h: h2,
                fill: {
                  style: pattern
                },
                composition: "source-atop"
              });
            })
          );
          const glowGradient = subRx.linearGradient(
            x,
            y + h2 - GlowRY$1,
            x,
            y + h2
          );
          glowGradient.addColorStop(0, "rgba(255,255,255,0.3137)");
          glowGradient.addColorStop(0.5, "rgba(255,255,255,0.0627)");
          glowGradient.addColorStop(1, "rgba(255,255,255,0)");
          subRx.drawPath({
            path: (ctx) => {
              ctx.ellipse(
                x + w / 2,
                y + h2,
                GlowRX$1,
                GlowRY$1,
                0,
                0,
                2 * Math.PI
              );
            },
            fill: {
              style: glowGradient
            }
          });
        })
      );
      const outlineColor = hslColor.shift(textboxOutlineColorDelta$1).toRgb().toCss();
      rx.drawPath({
        path: (path) => {
          roundedRectangle(
            path,
            x + textboxRoundingBuffer$1,
            y + textboxRoundingBuffer$1,
            this.width - textboxRoundingBuffer$1 * 2,
            this.height - NameboxHeight$1 - textboxRoundingBuffer$1 * 2,
            textboxRounding$1
          );
        },
        outline: {
          style: outlineColor,
          width: textboxOutlineWidth$1
        }
      });
      dotPattern.dispose();
    });
  }
  render(rx) {
    return __async$l(this, null, function* () {
      const constants = getConstants();
      const w = this.width;
      const h2 = this.height;
      const w2 = w / 2;
      const baseX = this.obj.flip ? constants.Base.screenWidth - this.obj.x : this.obj.x;
      const x = baseX - w2;
      const y = this.obj.y;
      if (this.obj.talkingObjId !== null) {
        yield this.renderNamebox(rx, x + this.nameboxOffsetX, y);
      }
      yield this.renderBackdrop(rx, x, y + this.nameboxHeight);
      const bottom = y + h2;
      const controlsY = bottom - ControlsYBottomOffset$1;
      if (this.obj.controls)
        this.renderControls(rx, controlsY);
      if (this.obj.continue) {
        rx.drawImage({
          image: yield getBuildInAsset("next"),
          x: x + w - ArrowXRightOffset$1,
          y: bottom - ArrowYBottomOffset$1
        });
      }
    });
  }
}
__publicField$b(Custom, "id", "custom");
__publicField$b(Custom, "label", "Custom");
__publicField$b(Custom, "priority", 0);
__publicField$b(Custom, "gameMode", "ddlc");
var __defProp$n = Object.defineProperty;
var __defNormalProp$n = (obj, key, value) => key in obj ? __defProp$n(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$a = (obj, key, value) => {
  __defNormalProp$n(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$k = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class None extends DdlcBase {
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
    return __async$k(this, null, function* () {
    });
  }
}
__publicField$a(None, "id", "none");
__publicField$a(None, "label", "None");
__publicField$a(None, "priority", 0);
__publicField$a(None, "gameMode", "ddlc");
var __defProp$m = Object.defineProperty;
var __getOwnPropSymbols$e = Object.getOwnPropertySymbols;
var __hasOwnProp$e = Object.prototype.hasOwnProperty;
var __propIsEnum$e = Object.prototype.propertyIsEnumerable;
var __defNormalProp$m = (obj, key, value) => key in obj ? __defProp$m(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$e = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$e.call(b, prop))
      __defNormalProp$m(a, prop, b[prop]);
  if (__getOwnPropSymbols$e)
    for (var prop of __getOwnPropSymbols$e(b)) {
      if (__propIsEnum$e.call(b, prop))
        __defNormalProp$m(a, prop, b[prop]);
    }
  return a;
};
var __publicField$9 = (obj, key, value) => {
  __defNormalProp$m(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _DdlcPlusBase = class {
  constructor(base) {
    this.base = base;
  }
  static get resizable() {
    return false;
  }
  static get defaultWidth() {
    return TextBoxWidth;
  }
  static get defaultHeight() {
    return TextBoxHeight;
  }
  static get defaultX() {
    return getConstants().Base.screenWidth / 2;
  }
  static get defaultY() {
    return getConstants().Base.screenHeight - this.defaultHeight - NameboxHeight - getConstants().TextBox.TextBoxBottomSpacing;
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
    const constants = getConstants();
    const w = this.width;
    const w2 = w / 2;
    const baseX = this.base.obj.flip ? constants.Base.screenWidth - this.base.obj.x : this.base.obj.x;
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
      rx.drawText(__spreadValues$e({
        text,
        x: controlX,
        y
      }, style));
      controlX += textWidth + spacing;
    }
  }
  static controlWidth(rx, text) {
    if (this.widthCache[text])
      return this.widthCache[text];
    const width = rx.measureText(__spreadValues$e({ text }, ControlsTextStyle)).width;
    this.widthCache[text] = width;
    return width;
  }
};
let DdlcPlusBase = _DdlcPlusBase;
__publicField$9(DdlcPlusBase, "widthCache", {});
var __defProp$l = Object.defineProperty;
var __defProps$b = Object.defineProperties;
var __getOwnPropDescs$b = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$d = Object.getOwnPropertySymbols;
var __hasOwnProp$d = Object.prototype.hasOwnProperty;
var __propIsEnum$d = Object.prototype.propertyIsEnumerable;
var __defNormalProp$l = (obj, key, value) => key in obj ? __defProp$l(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$d = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$d.call(b, prop))
      __defNormalProp$l(a, prop, b[prop]);
  if (__getOwnPropSymbols$d)
    for (var prop of __getOwnPropSymbols$d(b)) {
      if (__propIsEnum$d.call(b, prop))
        __defNormalProp$l(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$b = (a, b) => __defProps$b(a, __getOwnPropDescs$b(b));
var __publicField$8 = (obj, key, value) => {
  __defNormalProp$l(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$j = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class CustomPlus extends DdlcPlusBase {
  constructor() {
    super(...arguments);
    __publicField$8(this, "backgroundImage", "textbox");
    __publicField$8(this, "xOffset", 0);
  }
  static get resizable() {
    return true;
  }
  get height() {
    return this.obj.height + NameboxHeight;
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
    return __spreadProps$b(__spreadValues$d({}, NameboxTextStyle), {
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
    return __async$j(this, null, function* () {
      const w = this.nameboxWidth;
      const h2 = this.nameboxHeight;
      yield rx.customTransform(
        (ctx) => __async$j(this, null, function* () {
          ctx.beginPath();
          roundedTopRectangle(ctx, x, y, w, h2, nameboxRounding);
          ctx.clip();
        }),
        (subRx) => __async$j(this, null, function* () {
          const gradient = subRx.linearGradient(x, y, x, y + h2);
          const baseBG = RGBAColor.fromCss(this.nameboxBackgroundColor);
          const color2 = new RGBAColor(baseBG.r, baseBG.g, baseBG.b, 0.95);
          const targetColor = color2.toHSL().shift(nameboxGradientEndDelta).toRgb();
          gradient.addColorStop(0, color2.toCss());
          gradient.addColorStop(nameboxGradientMiddleStopPosition, color2.toCss());
          gradient.addColorStop(1, targetColor.toCss());
          subRx.drawRect({
            x,
            y,
            w: this.obj.width,
            h: h2,
            fill: {
              style: gradient
            }
          });
        })
      );
    });
  }
  renderBackdrop(rx, x, y) {
    return __async$j(this, null, function* () {
      const hslColor = RGBAColor.fromCss(this.customColor).toHSL();
      const dotPattern = new Renderer(dotPatternSize, dotPatternSize);
      yield dotPattern.render((dotRx) => __async$j(this, null, function* () {
        const fill = {
          style: hslColor.shift(dotColorDelta).toRgb().toCss()
        };
        function drawDot(dotX, dotY) {
          dotRx.drawPath({
            path: (ctx) => {
              ctx.ellipse(dotX, dotY, dotRadius, dotRadius, 0, 0, 2 * Math.PI);
            },
            fill
          });
        }
        drawDot(0, 0);
        drawDot(dotPatternSize, 0);
        drawDot(0, dotPatternSize);
        drawDot(dotPatternSize, dotPatternSize);
        drawDot(dotPatternSize / 2, dotPatternSize / 2);
      }), true);
      yield rx.customTransform(
        (ctx) => __async$j(this, null, function* () {
          ctx.beginPath();
          roundedRectangle(
            ctx,
            x + textboxRoundingBuffer,
            y + textboxRoundingBuffer,
            this.width - textboxRoundingBuffer * 2,
            this.height - NameboxHeight - textboxRoundingBuffer * 2,
            textboxRounding
          );
          ctx.clip();
        }),
        (subRx) => __async$j(this, null, function* () {
          const h2 = this.obj.height;
          const w = this.obj.width;
          const gradient = subRx.linearGradient(x, y, x, y + h2);
          const color2 = RGBAColor.fromHex(this.customColor);
          gradient.addColorStop(0, color2.toCss());
          gradient.addColorStop(
            1,
            `rgba(${color2.r},${color2.g},${color2.b},0.6667)`
          );
          subRx.drawRect({
            x,
            y,
            w,
            h: h2,
            fill: {
              style: gradient
            },
            outline: {
              style: "#ffdfee",
              width: 6
            }
          });
          yield subRx.customTransform(
            (ctx) => __async$j(this, null, function* () {
              ctx.translate(x, y);
            }),
            (_subSubRx) => __async$j(this, null, function* () {
              const pattern = subRx.patternFrom(dotPattern);
              subRx.drawRect({
                x: 0,
                y: 0,
                w,
                h: h2,
                fill: {
                  style: pattern
                },
                composition: "source-atop"
              });
            })
          );
          const glowGradient = subRx.linearGradient(
            x,
            y + h2 - GlowRY,
            x,
            y + h2
          );
          glowGradient.addColorStop(0, "rgba(255,255,255,0.3137)");
          glowGradient.addColorStop(0.5, "rgba(255,255,255,0.0627)");
          glowGradient.addColorStop(1, "rgba(255,255,255,0)");
          subRx.drawPath({
            path: (ctx) => {
              ctx.ellipse(
                x + w / 2,
                y + h2,
                GlowRX,
                GlowRY,
                0,
                0,
                2 * Math.PI
              );
            },
            fill: {
              style: glowGradient
            }
          });
        })
      );
      const outlineColor = hslColor.shift(textboxOutlineColorDelta).toRgb().toCss();
      rx.drawPath({
        path: (path) => {
          roundedRectangle(
            path,
            x + textboxRoundingBuffer,
            y + textboxRoundingBuffer,
            this.width - textboxRoundingBuffer * 2,
            this.height - NameboxHeight - textboxRoundingBuffer * 2,
            textboxRounding
          );
        },
        outline: {
          style: outlineColor,
          width: textboxOutlineWidth
        }
      });
      dotPattern.dispose();
    });
  }
  render(rx) {
    return __async$j(this, null, function* () {
      const constants = getConstants();
      const w = this.width;
      const h2 = this.height;
      const w2 = w / 2;
      const baseX = this.obj.flip ? constants.Base.screenWidth - this.obj.x : this.obj.x;
      const x = baseX - w2;
      const y = this.obj.y;
      if (this.obj.talkingObjId !== null) {
        yield this.renderNamebox(rx, x + this.nameboxOffsetX, y);
      }
      yield this.renderBackdrop(rx, x, y + this.nameboxHeight);
      const bottom = y + h2;
      const controlsY = bottom - ControlsYBottomOffset;
      if (this.obj.controls)
        this.renderControls(rx, controlsY);
      if (this.obj.continue) {
        rx.drawImage({
          image: yield getBuildInAsset("next_plus"),
          x: x + w - ArrowXRightOffset,
          y: bottom - ArrowYBottomOffset
        });
      }
    });
  }
}
__publicField$8(CustomPlus, "id", "custom_plus");
__publicField$8(CustomPlus, "label", "Custom (Plus)");
__publicField$8(CustomPlus, "priority", 0);
__publicField$8(CustomPlus, "gameMode", "ddlc_plus");
var __defProp$k = Object.defineProperty;
var __defNormalProp$k = (obj, key, value) => key in obj ? __defProp$k(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$7 = (obj, key, value) => {
  __defNormalProp$k(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$i = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
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
    __publicField$7(this, "refObject", null);
    __publicField$7(this, "_lastRenderer", null);
  }
  get y() {
    return this.obj.y;
  }
  get width() {
    return this.textboxRenderer.width;
  }
  get height() {
    return this.textboxRenderer.height;
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
  get forcedStyle() {
    const refObject = this.refObject;
    if ((this.obj.style === "normal" || this.obj.style === "normal_plus") && refObject && (refObject.textboxColor != null || refObject.nameboxWidth != null))
      return "custom";
    return this.obj.style;
  }
  updatedContent(_current, panelId) {
    super.updatedContent(_current, panelId);
    const talkingObj = this.obj.talkingObjId;
    if (talkingObj !== null && talkingObj !== "$other$") {
      const obj = _current.state.panels.panels[panelId].objects[talkingObj];
      this.refObject = obj != null ? obj : null;
      return;
    }
    this.refObject = null;
  }
  draw(rx) {
    return __async$i(this, null, function* () {
      var _a, _b;
      const constants = getConstants();
      const styleRenderer = this.textboxRenderer;
      const w = styleRenderer.width;
      const w2 = w / 2;
      const baseX = this.flip ? constants.Base.screenWidth - this.obj.x : this.obj.x;
      const x = baseX - w2;
      const y = this.obj.y;
      yield styleRenderer.render(rx);
      if (this.obj.talkingObjId !== null) {
        const name = this.obj.talkingObjId === "$other$" ? this.obj.talkingOther : (_b = (_a = this.refObject) == null ? void 0 : _a.label) != null ? _b : "Missing name";
        yield this.renderName(rx, x + styleRenderer.nameboxOffsetX, y, name);
      }
      yield this.renderText(rx, x, y, this.obj.autoWrap ? w : 0);
    });
  }
  renderName(rx, x, y, name) {
    return __async$i(this, null, function* () {
      const styleRenderer = this.textboxRenderer;
      const w = styleRenderer.nameboxWidth;
      const style = styleRenderer.nameboxStyle;
      const render = new TextRenderer(name, style);
      yield render.loadFonts();
      render.fixAlignment(
        "center",
        x,
        x + w,
        y + styleRenderer.nameboxOffsetY,
        0
      );
      render.render(rx.fsCtx);
    });
  }
  renderText(rx, baseX, baseY, maxLineWidth) {
    return __async$i(this, null, function* () {
      const textboxRenderer = this.textboxRenderer;
      const render = new TextRenderer(
        this.obj.text,
        textboxRenderer.textboxStyle
      );
      if (this.obj.autoQuoting && this.obj.talkingObjId !== null) {
        render.quote();
      }
      yield render.loadFonts();
      render.fixAlignment(
        "left",
        baseX + textboxRenderer.textOffsetX,
        0,
        baseY + textboxRenderer.nameboxHeight + textboxRenderer.textOffsetY,
        maxLineWidth - textboxRenderer.textOffsetX * 2
      );
      render.render(rx.fsCtx);
    });
  }
}
const _sfc_main$n = defineComponent({
  components: { Toggle: ToggleBox, DFieldset },
  props: {
    obj: {
      required: true
    }
  },
  computed: {
    freeMove: {
      get() {
        return this.obj.freeMove;
      },
      set(freeMove) {
        this.vuexHistory.transaction(() => {
          this.$store.commit("panels/setFreeMove", {
            id: this.obj.id,
            panelId: this.obj.panelId,
            freeMove
          });
        });
      }
    },
    preserveRatio: {
      get() {
        return this.obj.preserveRatio;
      },
      set(preserveRatio) {
        this.vuexHistory.transaction(() => {
          this.$store.dispatch("panels/setPreserveRatio", {
            id: this.obj.id,
            panelId: this.obj.panelId,
            preserveRatio
          });
        });
      }
    },
    pos: {
      get() {
        return closestCharacterSlot(this.obj.x);
      },
      set(value) {
        this.vuexHistory.transaction(() => {
          this.$store.dispatch("panels/setPosition", {
            id: this.obj.id,
            panelId: this.obj.panelId,
            x: getConstants().Base.characterPositions[value],
            y: this.obj.y
          });
        });
      }
    },
    x: {
      get() {
        return this.obj.x;
      },
      set(x) {
        this.vuexHistory.transaction(() => {
          this.$store.commit("panels/setPosition", {
            id: this.obj.id,
            panelId: this.obj.panelId,
            x,
            y: this.y
          });
        });
      }
    },
    y: {
      get() {
        return this.obj.y;
      },
      set(y) {
        this.vuexHistory.transaction(() => {
          this.$store.commit("panels/setPosition", {
            id: this.obj.id,
            panelId: this.obj.panelId,
            x: this.x,
            y
          });
        });
      }
    },
    height: {
      get() {
        return this.obj.height;
      },
      set(height) {
        this.vuexHistory.transaction(() => {
          this.$store.dispatch("panels/setHeight", {
            id: this.obj.id,
            panelId: this.obj.panelId,
            height
          });
        });
      }
    },
    width: {
      get() {
        return this.obj.width;
      },
      set(width) {
        this.vuexHistory.transaction(() => {
          this.$store.dispatch("panels/setWidth", {
            id: this.obj.id,
            panelId: this.obj.panelId,
            width
          });
        });
      }
    },
    allowSize() {
      const obj = this.obj;
      if (obj.type === "textBox") {
        const renderer2 = rendererLookup[obj.style];
        return renderer2.resizable;
      }
      if (obj.type === "character" && !obj.freeMove) {
        return false;
      }
      return true;
    },
    allowStepMove() {
      return "freeMove" in this.obj;
    },
    positionNames() {
      return getConstants().Base.positions;
    },
    isFirstPos() {
      return this.pos === 0;
    },
    isLastPos() {
      return this.pos === getConstants().Base.positions.length - 1;
    }
  }
});
const positionAndSize_vue_vue_type_style_index_0_scoped_c33846f6_lang = "";
const _withScopeId$c = (n) => (pushScopeId("data-v-c33846f6"), n = n(), popScopeId(), n);
const _hoisted_1$k = { colspan: "2" };
const _hoisted_2$i = { key: 0 };
const _hoisted_3$g = { colspan: "2" };
const _hoisted_4$f = { class: "arrow-col" };
const _hoisted_5$d = ["disabled"];
const _hoisted_6$d = ["value"];
const _hoisted_7$b = { class: "arrow-col" };
const _hoisted_8$a = ["disabled"];
const _hoisted_9$9 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "sprite_x" }, "X:")
], -1));
const _hoisted_10$9 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "sprite_y" }, "Y:")
], -1));
const _hoisted_11$8 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "sprite_w" }, "Width:")
], -1));
const _hoisted_12$7 = /* @__PURE__ */ _withScopeId$c(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "sprite_h" }, "Height:")
], -1));
const _hoisted_13$6 = { colspan: "2" };
function _sfc_render$n(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_toggle = resolveComponent("toggle");
  const _component_d_fieldset = resolveComponent("d-fieldset");
  return openBlock(), createBlock(_component_d_fieldset, {
    title: "Position" + (_ctx.allowSize ? "/Size" : "")
  }, {
    default: withCtx(() => [
      createBaseVNode("table", null, [
        createBaseVNode("tr", null, [
          createBaseVNode("td", _hoisted_1$k, [
            _ctx.allowStepMove ? (openBlock(), createBlock(_component_toggle, {
              key: 0,
              modelValue: _ctx.freeMove,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.freeMove = $event),
              label: "Move freely?"
            }, null, 8, ["modelValue"])) : createCommentVNode("", true)
          ])
        ]),
        _ctx.allowStepMove && !_ctx.freeMove ? (openBlock(), createElementBlock("tr", _hoisted_2$i, [
          createBaseVNode("td", _hoisted_3$g, [
            createBaseVNode("table", null, [
              createBaseVNode("tr", null, [
                createBaseVNode("td", _hoisted_4$f, [
                  createBaseVNode("button", {
                    onClick: _cache[1] || (_cache[1] = ($event) => --_ctx.pos),
                    disabled: _ctx.isFirstPos
                  }, "<", 8, _hoisted_5$d)
                ]),
                createBaseVNode("td", null, [
                  withDirectives(createBaseVNode("select", {
                    id: "current_talking",
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => _ctx.pos = $event)
                  }, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.positionNames, (val, key) => {
                      return openBlock(), createElementBlock("option", {
                        key,
                        value: key
                      }, toDisplayString(val), 9, _hoisted_6$d);
                    }), 128))
                  ], 512), [
                    [
                      vModelSelect,
                      _ctx.pos,
                      void 0,
                      { number: true }
                    ]
                  ])
                ]),
                createBaseVNode("td", _hoisted_7$b, [
                  createBaseVNode("button", {
                    onClick: _cache[3] || (_cache[3] = ($event) => ++_ctx.pos),
                    disabled: _ctx.isLastPos
                  }, ">", 8, _hoisted_8$a)
                ])
              ])
            ])
          ])
        ])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
          createBaseVNode("tr", null, [
            _hoisted_9$9,
            createBaseVNode("td", null, [
              withDirectives(createBaseVNode("input", {
                id: "sprite_x",
                type: "number",
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => _ctx.x = $event),
                onKeydown: _cache[5] || (_cache[5] = withModifiers(() => {
                }, ["stop"]))
              }, null, 544), [
                [
                  vModelText,
                  _ctx.x,
                  void 0,
                  { number: true }
                ]
              ])
            ])
          ]),
          createBaseVNode("tr", null, [
            _hoisted_10$9,
            createBaseVNode("td", null, [
              withDirectives(createBaseVNode("input", {
                id: "sprite_y",
                type: "number",
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => _ctx.y = $event),
                onKeydown: _cache[7] || (_cache[7] = withModifiers(() => {
                }, ["stop"]))
              }, null, 544), [
                [
                  vModelText,
                  _ctx.y,
                  void 0,
                  { number: true }
                ]
              ])
            ])
          ])
        ], 64)),
        _ctx.allowSize ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
          createBaseVNode("tr", null, [
            _hoisted_11$8,
            createBaseVNode("td", null, [
              withDirectives(createBaseVNode("input", {
                id: "sprite_w",
                min: "0",
                type: "number",
                "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => _ctx.width = $event),
                onKeydown: _cache[9] || (_cache[9] = withModifiers(() => {
                }, ["stop"]))
              }, null, 544), [
                [
                  vModelText,
                  _ctx.width,
                  void 0,
                  { number: true }
                ]
              ])
            ])
          ]),
          createBaseVNode("tr", null, [
            _hoisted_12$7,
            createBaseVNode("td", null, [
              withDirectives(createBaseVNode("input", {
                id: "sprite_h",
                min: "0",
                type: "number",
                "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => _ctx.height = $event),
                onKeydown: _cache[11] || (_cache[11] = withModifiers(() => {
                }, ["stop"]))
              }, null, 544), [
                [
                  vModelText,
                  _ctx.height,
                  void 0,
                  { number: true }
                ]
              ])
            ])
          ]),
          createBaseVNode("tr", null, [
            createBaseVNode("td", _hoisted_13$6, [
              createVNode(_component_toggle, {
                modelValue: _ctx.preserveRatio,
                "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => _ctx.preserveRatio = $event),
                label: "Lock ratio?"
              }, null, 8, ["modelValue"])
            ])
          ])
        ], 64)) : createCommentVNode("", true)
      ])
    ]),
    _: 1
  }, 8, ["title"]);
}
const PositionAndSize = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["render", _sfc_render$n], ["__scopeId", "data-v-c33846f6"]]);
const _sfc_main$m = defineComponent({
  components: { Toggle: ToggleBox, DFieldset },
  props: {
    object: {
      required: true
    }
  },
  computed: {
    onTop: genericSetable()("onTop", "panels/setOnTop", true)
  },
  methods: {
    shiftLayer(delta) {
      this.vuexHistory.transaction(() => {
        this.$store.dispatch("panels/shiftLayer", {
          id: this.object.id,
          panelId: this.object.panelId,
          delta
        });
      });
    }
  }
});
const layers_vue_vue_type_style_index_0_scoped_d80e9416_lang = "";
const _withScopeId$b = (n) => (pushScopeId("data-v-d80e9416"), n = n(), popScopeId(), n);
const _hoisted_1$j = /* @__PURE__ */ _withScopeId$b(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "vertical_align_bottom", -1));
const _hoisted_2$h = [
  _hoisted_1$j
];
const _hoisted_3$f = /* @__PURE__ */ _withScopeId$b(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "arrow_downward", -1));
const _hoisted_4$e = [
  _hoisted_3$f
];
const _hoisted_5$c = /* @__PURE__ */ _withScopeId$b(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "arrow_upward", -1));
const _hoisted_6$c = [
  _hoisted_5$c
];
const _hoisted_7$a = /* @__PURE__ */ _withScopeId$b(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "vertical_align_top", -1));
const _hoisted_8$9 = [
  _hoisted_7$a
];
function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_toggle = resolveComponent("toggle");
  const _component_d_fieldset = resolveComponent("d-fieldset");
  return openBlock(), createBlock(_component_d_fieldset, {
    id: "layerfs",
    title: "Layer:"
  }, {
    default: withCtx(() => [
      createBaseVNode("table", null, [
        createBaseVNode("tbody", null, [
          createBaseVNode("tr", null, [
            createBaseVNode("td", null, [
              createBaseVNode("button", {
                onClick: _cache[0] || (_cache[0] = ($event) => _ctx.shiftLayer(-Infinity)),
                title: "Move to back"
              }, _hoisted_2$h)
            ]),
            createBaseVNode("td", null, [
              createBaseVNode("button", {
                onClick: _cache[1] || (_cache[1] = ($event) => _ctx.shiftLayer(-1)),
                title: "Move backwards"
              }, _hoisted_4$e)
            ]),
            createBaseVNode("td", null, [
              createBaseVNode("button", {
                onClick: _cache[2] || (_cache[2] = ($event) => _ctx.shiftLayer(1)),
                title: "Move forwards"
              }, _hoisted_6$c)
            ]),
            createBaseVNode("td", null, [
              createBaseVNode("button", {
                onClick: _cache[3] || (_cache[3] = ($event) => _ctx.shiftLayer(Infinity)),
                title: "Move to front"
              }, _hoisted_8$9)
            ])
          ])
        ])
      ]),
      createVNode(_component_toggle, {
        modelValue: _ctx.onTop,
        "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => _ctx.onTop = $event),
        label: "In front?"
      }, null, 8, ["modelValue"])
    ]),
    _: 1
  });
}
const Layers = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$m], ["__scopeId", "data-v-d80e9416"]]);
const _sfc_main$l = defineComponent({
  props: {
    obj: {
      required: true
    }
  },
  methods: {
    onClick() {
      this.vuexHistory.transaction(() => {
        this.$store.dispatch("panels/removeObject", {
          panelId: this.obj.panelId,
          id: this.obj.id
        });
      });
    }
  }
});
function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("button", {
    onClick: _cache[0] || (_cache[0] = (...args) => _ctx.onClick && _ctx.onClick(...args))
  }, "Delete");
}
const Delete = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$l]]);
const sliderLength = 255;
const sliderOffset = 8;
const _sfc_main$k = defineComponent({
  props: {
    label: {
      type: String,
      required: true
    },
    gradientStops: {
      required: true
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
      type: Boolean,
      default: false
    },
    noInput: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    slideActive: false
  }),
  computed: {
    vertical() {
      return this.$store.state.ui.vertical;
    },
    pointerPath() {
      const val = this.modelValue / this.maxValue * sliderLength;
      return `M${val} 0L${val + 14} 0L${val + 7} 12Z`;
    },
    gradientOffset() {
      if (!this.shiftGradient)
        return 0;
      if (this.modelValue === 0)
        return 0;
      return this.modelValue / this.maxValue;
    }
  },
  methods: {
    enterSlide(event) {
      this.slideActive = true;
      this.moveSlide(event);
    },
    moveSlide(event) {
      if (!this.slideActive)
        return;
      const svg = this.$refs.svg;
      if (!svg.contains(event.target) && event.target !== svg)
        return;
      if (event instanceof MouseEvent && event.which !== 1) {
        this.slideActive = false;
        return;
      }
      const bounding = svg.getBoundingClientRect();
      const scale = bounding.width / (sliderOffset + sliderLength + sliderOffset);
      const x = (event instanceof MouseEvent ? event.clientX : event.touches[0].clientX) - bounding.x;
      const scaledX = x / scale;
      event.preventDefault();
      const value = Math.max(Math.min(scaledX - sliderOffset, sliderLength), 0) / sliderLength * this.maxValue;
      this.$emit("update:modelValue", value);
    },
    exitSlide() {
      this.slideActive = false;
    }
  }
});
const slider_vue_vue_type_style_index_0_scoped_7a5dc4a7_lang = "";
const _hoisted_1$i = ["for"];
const _hoisted_2$g = ["id", "x1", "x2"];
const _hoisted_3$e = ["offset"];
const _hoisted_4$d = ["fill"];
const _hoisted_5$b = ["d"];
const _hoisted_6$b = ["id", "max", "value"];
function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", {
    class: normalizeClass({ slider: true, vertical: _ctx.vertical }),
    onKeydown: _cache[8] || (_cache[8] = withModifiers(() => {
    }, ["stop"]))
  }, [
    !_ctx.noInput ? (openBlock(), createElementBlock("label", {
      key: 0,
      for: _ctx._.uid
    }, toDisplayString(_ctx.label), 9, _hoisted_1$i)) : createCommentVNode("", true),
    createBaseVNode("div", null, [
      (openBlock(), createElementBlock("svg", {
        ref: "svg",
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 271 24",
        onMousedown: _cache[0] || (_cache[0] = (...args) => _ctx.enterSlide && _ctx.enterSlide(...args)),
        onTouchstart: _cache[1] || (_cache[1] = (...args) => _ctx.enterSlide && _ctx.enterSlide(...args)),
        onMousemove: _cache[2] || (_cache[2] = (...args) => _ctx.moveSlide && _ctx.moveSlide(...args)),
        onTouchmove: _cache[3] || (_cache[3] = (...args) => _ctx.moveSlide && _ctx.moveSlide(...args)),
        onMouseup: _cache[4] || (_cache[4] = (...args) => _ctx.exitSlide && _ctx.exitSlide(...args)),
        onTouchend: _cache[5] || (_cache[5] = (...args) => _ctx.exitSlide && _ctx.exitSlide(...args))
      }, [
        createBaseVNode("defs", null, [
          createBaseVNode("linearGradient", {
            id: `gradient${_ctx._.uid}`,
            x1: _ctx.gradientOffset * 100 + "%",
            y1: "0%",
            x2: (_ctx.gradientOffset + 1) * 100 + "%",
            y2: "0%",
            spreadMethod: "repeat"
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.gradientStops, (color2, idx) => {
              return openBlock(), createElementBlock("stop", {
                key: idx,
                offset: idx / (_ctx.gradientStops.length - 1) * 100 + "%",
                style: normalizeStyle$1("stop-color:" + color2)
              }, null, 12, _hoisted_3$e);
            }), 128))
          ], 8, _hoisted_2$g)
        ]),
        createBaseVNode("g", null, [
          createBaseVNode("path", {
            d: "M7 0H262V24H7z",
            "stroke-width": "2",
            "paint-order": "fill stroke markers",
            fill: `url(#gradient${_ctx._.uid})`
          }, null, 8, _hoisted_4$d),
          createBaseVNode("path", {
            d: _ctx.pointerPath,
            "stroke-width": "2",
            class: "slider-pointer"
          }, null, 8, _hoisted_5$b)
        ])
      ], 544))
    ]),
    !_ctx.noInput ? (openBlock(), createElementBlock("input", {
      key: 1,
      id: _ctx._.uid,
      class: "sliderInput",
      min: "0",
      max: _ctx.maxValue,
      value: _ctx.modelValue,
      type: "number",
      onInput: _cache[6] || (_cache[6] = ($event) => _ctx.$emit("update:modelValue", parseFloat($event.target.value))),
      onKeydown: _cache[7] || (_cache[7] = withModifiers(() => {
      }, ["stop"]))
    }, null, 40, _hoisted_6$b)) : createCommentVNode("", true)
  ], 34);
}
const Slider = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$k], ["__scopeId", "data-v-7a5dc4a7"]]);
const _sfc_main$j = defineComponent({
  components: { Slider },
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
  data: () => ({
    lastRGBEmit: null,
    v1: 0,
    v2: 0,
    v3: 0,
    a: 0
  }),
  computed: {
    vertical() {
      return this.$store.state.ui.vertical;
    },
    maxValue1() {
      if (this.mode === "rgba")
        return 255;
      return 360;
    },
    label1() {
      if (this.mode === "rgba")
        return "Red";
      return "Hue";
    },
    stops1() {
      let stops = [];
      if (this.mode === "rgba") {
        const g = this.relative ? this.v2 : 0;
        const b = this.relative ? this.v3 : 0;
        stops = [new RGBAColor(0, g, b, 1), new RGBAColor(255, g, b, 1)];
      } else {
        const s = this.relative ? this.v2 / 100 : 1;
        const l = this.relative ? this.v3 / 100 : 0.5;
        stops = this.eightsStops((i) => new HSLAColor(i, s, l, 1));
      }
      return stops.map((stop) => stop.toRgb().toCss());
    },
    maxValue2() {
      if (this.mode === "rgba")
        return 255;
      return 100;
    },
    label2() {
      if (this.mode === "rgba")
        return "Green";
      return "Saturation";
    },
    stops2() {
      let stops = [];
      if (this.mode === "rgba") {
        const r = this.relative ? this.v1 : 0;
        const b = this.relative ? this.v3 : 0;
        stops = [new RGBAColor(r, 0, b, 1), new RGBAColor(r, 255, b, 1)];
      } else {
        const h2 = this.relative ? this.v1 / 360 : 0;
        const l = this.relative ? this.v3 / 100 : 0.5;
        stops = this.eightsStops((i) => new HSLAColor(h2, i, l, 1));
      }
      return stops.map((stop) => stop.toRgb().toCss());
    },
    maxValue3() {
      if (this.mode === "rgba")
        return 255;
      return 100;
    },
    label3() {
      if (this.mode === "rgba")
        return "Blue";
      return "Luminosity";
    },
    stops3() {
      let stops = [];
      if (this.mode === "rgba") {
        const r = this.relative ? this.v1 : 0;
        const g = this.relative ? this.v2 : 0;
        stops = [new RGBAColor(r, g, 0, 1), new RGBAColor(r, g, 255, 1)];
      } else {
        const h2 = this.relative ? this.v1 / 360 : 0;
        const s = this.relative ? this.v2 / 100 : 0.5;
        stops = this.eightsStops((i) => new HSLAColor(h2, s, i, 1));
      }
      return stops.map((stop) => stop.toRgb().toCss());
    },
    stopsAlpha() {
      const color2 = RGBAColor.fromHex(this.modelValue);
      return [
        new RGBAColor(color2.r, color2.g, color2.b, 0).toCss(),
        new RGBAColor(color2.r, color2.g, color2.b, 1).toCss()
      ];
    }
  },
  created() {
    this.initValues();
  },
  methods: {
    valueChanged() {
      if (this.modelValue === this.lastRGBEmit)
        return;
      this.initValues();
    },
    updateValue() {
      let newColor;
      if (this.mode === "rgba") {
        newColor = new RGBAColor(this.v1, this.v2, this.v3, this.a / 255);
      } else {
        newColor = new HSLAColor(
          this.v1 / 360,
          this.v2 / 100,
          this.v3 / 100,
          this.a / 255
        );
      }
      const rgbColor = newColor.toRgb().toHex();
      if (this.lastRGBEmit === rgbColor)
        return;
      if (rgbColor.length !== 9) {
        throw new Error(`Invalid color code: ${rgbColor}`);
      }
      this.lastRGBEmit = rgbColor;
      this.$emit("update:modelValue", rgbColor);
    },
    initValues() {
      const color2 = RGBAColor.fromHex(this.modelValue);
      this.lastRGBEmit = color2.toHex();
      this.a = color2.a * 255;
      if (this.mode === "hsla") {
        const hslColor = color2.toHSL();
        this.v1 = hslColor.h * 360;
        this.v2 = hslColor.s * 100;
        this.v3 = hslColor.l * 100;
      } else {
        this.v1 = color2.r;
        this.v2 = color2.g;
        this.v3 = color2.b;
      }
    },
    eightsStops(gen) {
      const stops = [];
      for (let i = 0; i <= 8; ++i) {
        stops.push(gen(i / 8));
      }
      return stops;
    }
  },
  watch: {
    value() {
      this.valueChanged();
    },
    v1() {
      this.updateValue();
    },
    v2() {
      this.updateValue();
    },
    v3() {
      this.updateValue();
    },
    a() {
      this.updateValue();
    },
    mode() {
      this.initValues();
    }
  }
});
const sliderGroup_vue_vue_type_style_index_0_scoped_f8c6e84c_lang = "";
function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_slider = resolveComponent("slider");
  return openBlock(), createElementBlock("div", null, [
    createVNode(_component_slider, {
      label: _ctx.label1,
      modelValue: _ctx.v1,
      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.v1 = $event),
      "max-value": _ctx.maxValue1,
      "gradient-stops": _ctx.stops1
    }, null, 8, ["label", "modelValue", "max-value", "gradient-stops"]),
    createVNode(_component_slider, {
      label: _ctx.label2,
      modelValue: _ctx.v2,
      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _ctx.v2 = $event),
      "max-value": _ctx.maxValue2,
      "gradient-stops": _ctx.stops2
    }, null, 8, ["label", "modelValue", "max-value", "gradient-stops"]),
    createVNode(_component_slider, {
      label: _ctx.label3,
      modelValue: _ctx.v3,
      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => _ctx.v3 = $event),
      "max-value": _ctx.maxValue3,
      "gradient-stops": _ctx.stops3
    }, null, 8, ["label", "modelValue", "max-value", "gradient-stops"]),
    createVNode(_component_slider, {
      label: "Alpha",
      modelValue: _ctx.a,
      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => _ctx.a = $event),
      "max-value": 255,
      "gradient-stops": _ctx.stopsAlpha
    }, null, 8, ["modelValue", "gradient-stops"])
  ]);
}
const SliderGroup = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$j], ["__scopeId", "data-v-f8c6e84c"]]);
var __defProp$j = Object.defineProperty;
var __defProps$a = Object.defineProperties;
var __getOwnPropDescs$a = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$c = Object.getOwnPropertySymbols;
var __hasOwnProp$c = Object.prototype.hasOwnProperty;
var __propIsEnum$c = Object.prototype.propertyIsEnumerable;
var __defNormalProp$j = (obj, key, value) => key in obj ? __defProp$j(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$c = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$c.call(b, prop))
      __defNormalProp$j(a, prop, b[prop]);
  if (__getOwnPropSymbols$c)
    for (var prop of __getOwnPropSymbols$c(b)) {
      if (__propIsEnum$c.call(b, prop))
        __defNormalProp$j(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$a = (a, b) => __defProps$a(a, __getOwnPropDescs$a(b));
const generatedPackId = "dddg.uploads.colors";
const _sfc_main$i = defineComponent({
  components: {
    SliderGroup,
    DButton
  },
  inheritAttrs: false,
  emits: ["leave", "update:modelValue"],
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
  data: () => ({
    mode: "hsla",
    relative: true
  }),
  computed: {
    vertical() {
      return this.$store.state.ui.vertical;
    },
    swatches() {
      return this.$store.state.content.current.colors;
    },
    color: {
      get() {
        if (this.format === "rgb") {
          const rgb = RGBAColor.fromCss(this.modelValue);
          return rgb.toHex();
        } else {
          return this.modelValue;
        }
      },
      set(newColor) {
        if (this.format === "rgb") {
          const rgb = RGBAColor.fromCss(newColor);
          this.$emit("update:modelValue", rgb.toCss());
        } else {
          this.$emit("update:modelValue", newColor);
        }
      }
    }
  },
  mounted() {
    eventBus$1.subscribe(ColorPickedEvent, this.settingColor);
  },
  unmounted() {
    eventBus$1.unsubscribe(ColorPickedEvent, this.settingColor);
  },
  methods: {
    settingColor(ev) {
      this.color = RGBAColor.fromCss(ev.color).toHex();
    },
    updateHex(event) {
      const hex = event.target.value;
      if (RGBAColor.validHex(hex) && (hex.length === 7 || hex.length === 9)) {
        this.color = hex;
      }
    },
    addSwatch() {
      if (this.swatches.find((swatch) => swatch.color === this.color))
        return;
      const existingPack = this.$store.state.content.contentPacks.find(
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
      const newPack = __spreadProps$a(__spreadValues$c({}, existingPack), {
        colors: [
          ...existingPack.colors,
          {
            label: this.color,
            color: this.color
          }
        ]
      });
      this.vuexHistory.transaction(() => {
        this.$store.dispatch("content/replaceContentPack", {
          contentPack: newPack,
          processed: true
        });
      });
    },
    pickColor() {
      this.vuexHistory.transaction(() => {
        this.$store.commit("ui/setColorPicker", true);
      });
    }
  }
});
const color_vue_vue_type_style_index_0_scoped_5ebdee88_lang = "";
const _hoisted_1$h = { class: "column" };
const _hoisted_2$f = { class: "hex-selector" };
const _hoisted_3$d = ["for"];
const _hoisted_4$c = ["id", "value"];
const _hoisted_5$a = /* @__PURE__ */ createTextVNode("Pick color");
const _hoisted_6$a = ["title", "onClick"];
function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_slider_group = resolveComponent("slider-group");
  const _component_d_button = resolveComponent("d-button");
  return openBlock(), createElementBlock("div", {
    class: normalizeClass({ color: true, vertical: _ctx.vertical })
  }, [
    createBaseVNode("h2", null, toDisplayString(_ctx.title), 1),
    createBaseVNode("button", {
      onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("leave"))
    }, "OK"),
    createBaseVNode("table", null, [
      createBaseVNode("tr", null, [
        createBaseVNode("td", null, [
          createBaseVNode("button", {
            onClick: _cache[1] || (_cache[1] = ($event) => _ctx.mode = "hsla")
          }, "HSLA")
        ]),
        createBaseVNode("td", null, [
          createBaseVNode("button", {
            onClick: _cache[2] || (_cache[2] = ($event) => _ctx.mode = "rgba")
          }, "RGBA")
        ])
      ])
    ]),
    createBaseVNode("div", _hoisted_1$h, [
      createVNode(_component_slider_group, {
        mode: _ctx.mode,
        modelValue: _ctx.color,
        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => _ctx.color = $event),
        relative: true
      }, null, 8, ["mode", "modelValue"]),
      createBaseVNode("div", _hoisted_2$f, [
        createBaseVNode("label", {
          class: "hex-label",
          for: `hex_${_ctx._.uid}`
        }, "Hex", 8, _hoisted_3$d),
        createBaseVNode("input", {
          id: `hex_${_ctx._.uid}`,
          value: _ctx.color,
          onInput: _cache[4] || (_cache[4] = (...args) => _ctx.updateHex && _ctx.updateHex(...args)),
          onKeydown: _cache[5] || (_cache[5] = withModifiers(() => {
          }, ["stop"]))
        }, null, 40, _hoisted_4$c)
      ]),
      createBaseVNode("button", {
        onClick: _cache[6] || (_cache[6] = (...args) => _ctx.addSwatch && _ctx.addSwatch(...args))
      }, "Add as swatch"),
      createVNode(_component_d_button, {
        icon: "colorize",
        onClick: _ctx.pickColor
      }, {
        default: withCtx(() => [
          _hoisted_5$a
        ]),
        _: 1
      }, 8, ["onClick"])
    ]),
    createBaseVNode("div", {
      id: "color-swatches",
      class: normalizeClass({ vertical: _ctx.vertical })
    }, [
      (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.swatches, (swatch) => {
        return openBlock(), createElementBlock("button", {
          class: "swatch",
          key: swatch.color,
          style: normalizeStyle$1({ backgroundColor: swatch.color }),
          title: swatch.label,
          onClick: ($event) => {
            _ctx.color = swatch.color;
            _ctx.$emit("leave");
          }
        }, null, 12, _hoisted_6$a);
      }), 128))
    ], 2)
  ], 2);
}
const Color = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$i], ["__scopeId", "data-v-5ebdee88"]]);
var __defProp$i = Object.defineProperty;
var __getOwnPropSymbols$b = Object.getOwnPropertySymbols;
var __hasOwnProp$b = Object.prototype.hasOwnProperty;
var __propIsEnum$b = Object.prototype.propertyIsEnumerable;
var __defNormalProp$i = (obj, key, value) => key in obj ? __defProp$i(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$b = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$b.call(b, prop))
      __defNormalProp$i(a, prop, b[prop]);
  if (__getOwnPropSymbols$b)
    for (var prop of __getOwnPropSymbols$b(b)) {
      if (__propIsEnum$b.call(b, prop))
        __defNormalProp$i(a, prop, b[prop]);
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
  const filters2 = [...obj.filters];
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
  filters2.splice(action.idx, 0, newFilter);
  setMutation({
    panelId: action.panelId,
    id: action.id,
    filters: filters2
  });
}
function removeFilter(action, objLookup, setMutation) {
  const obj = objLookup();
  const filters2 = [...obj.filters];
  filters2.splice(action.idx, 1);
  setMutation({
    id: action.id,
    panelId: action.panelId,
    filters: filters2
  });
}
function moveFilter(action, objLookup, setMutation) {
  const obj = objLookup();
  const filters2 = [...obj.filters];
  const filter = filters2[action.idx];
  filters2.splice(action.idx, 1);
  filters2.splice(action.idx + action.moveBy, 0, filter);
  setMutation({
    id: action.id,
    panelId: action.panelId,
    filters: filters2
  });
}
function setFilter(action, objLookup, setMutation) {
  const obj = objLookup();
  const filters2 = [...obj.filters];
  const filter = __spreadValues$b({}, filters2[action.idx]);
  filters2[action.idx] = filter;
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
    filters: filters2
  });
}
var __defProp$h = Object.defineProperty;
var __getOwnPropSymbols$a = Object.getOwnPropertySymbols;
var __hasOwnProp$a = Object.prototype.hasOwnProperty;
var __propIsEnum$a = Object.prototype.propertyIsEnumerable;
var __defNormalProp$h = (obj, key, value) => key in obj ? __defProp$h(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$a = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$a.call(b, prop))
      __defNormalProp$h(a, prop, b[prop]);
  if (__getOwnPropSymbols$a)
    for (var prop of __getOwnPropSymbols$a(b)) {
      if (__propIsEnum$a.call(b, prop))
        __defNormalProp$h(a, prop, b[prop]);
    }
  return a;
};
var __async$h = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
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
const filters = (() => {
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
const _sfc_main$h = defineComponent({
  components: { DFlow, DFieldset, Color, Slider, L },
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
  data: () => ({
    addEffectSelection: "",
    currentFilterIdx: 0,
    showShadowColor: false
  }),
  computed: {
    object() {
      switch (this.type) {
        case "object":
          return this.$store.state.panels.panels[this.panelId].objects[this.id];
        case "background":
          return this.$store.state.panels.panels[this.panelId].background;
        case "panel":
          return this.$store.state.panels.panels[this.panelId];
        default:
          throw new dist.UnreachableCaseError(this.type);
      }
    },
    compositionMode: {
      get() {
        return this.object.composite;
      },
      set(composite) {
        this.vuexHistory.transaction(() => {
          switch (this.type) {
            case "object":
              this.$store.commit("panels/setComposition", {
                id: this.id,
                panelId: this.panelId,
                composite
              });
              break;
            case "background":
              break;
            case "panel":
              break;
            default:
              throw new dist.UnreachableCaseError(this.type);
          }
        });
      }
    },
    filters() {
      return this.object.filters;
    },
    filterTypes() {
      return filters;
    },
    currentFilter() {
      var _a;
      return (_a = this.filters[this.currentFilterIdx]) != null ? _a : null;
    },
    isPercentFilter() {
      const filter = this.currentFilter;
      if (!filter)
        return false;
      return percentageValue.has(filter.type);
    },
    maxValue() {
      const filter = this.currentFilter;
      if (!filter)
        return void 0;
      if (filter.type === "hue-rotate")
        return 360;
      if (filter.type === "grayscale" || filter.type === "sepia" || filter.type === "opacity" || filter.type === "invert")
        return 100;
      return void 0;
    },
    minValue() {
      const filter = this.currentFilter;
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
    },
    shadowColor: {
      get() {
        const filter = this.currentFilter;
        if (!filter)
          return void 0;
        if (!("color" in filter))
          return void 0;
        return filter.color;
      },
      set(color2) {
        this.setValue({ color: color2 });
      }
    },
    shadowX: {
      get() {
        const filter = this.currentFilter;
        if (!filter)
          return void 0;
        if (!("offsetX" in filter))
          return void 0;
        return filter.offsetX;
      },
      set(offsetX) {
        this.setValue({ offsetX });
      }
    },
    shadowY: {
      get() {
        const filter = this.currentFilter;
        if (!filter)
          return void 0;
        if (!("offsetY" in filter))
          return void 0;
        return filter.offsetY;
      },
      set(offsetY) {
        this.setValue({ offsetY });
      }
    },
    shadowBlur: {
      get() {
        const filter = this.currentFilter;
        if (!filter)
          return void 0;
        if (!("blurRadius" in filter))
          return void 0;
        return filter.blurRadius;
      },
      set(blurRadius) {
        this.setValue({ blurRadius });
      }
    },
    hueStops() {
      const stops = this.eightsStops((i) => new HSLAColor(i, 1, 0.5, 1));
      return stops.map((stop) => stop.toRgb().toCss());
    }
  },
  methods: {
    getFilterLabel(type) {
      return filterText.get(type);
    },
    getFilterText(filter) {
      if (percentageValue.has(filter.type)) {
        return `${filterText.get(filter.type)} ${(filter.value * 100).toFixed()}%`;
      } else if (filter.type === "hue-rotate") {
        return `${filterText.get(filter.type)} ${filter.value.toFixed()}\xB0`;
      } else if (filter.type === "blur") {
        return `${filterText.get(filter.type)} ${filter.value.toFixed()}px`;
      }
      return filterText.get(filter.type);
    },
    objectTypeScope(command) {
      switch (this.type) {
        case "object":
          return "panels/object_" + command;
        case "background":
          return "panels/background" + command[0].toUpperCase() + command.slice(1);
        case "panel":
          return "panels/" + command;
      }
    },
    addFilter() {
      this.vuexHistory.transaction(() => {
        this.$store.dispatch(this.objectTypeScope("addFilter"), {
          id: this.id,
          panelId: this.panelId,
          type: this.addEffectSelection,
          idx: this.currentFilterIdx + 1
        });
        return;
      });
    },
    selectFilter(idx) {
      this.currentFilterIdx = idx;
    },
    removeFilter() {
      this.vuexHistory.transaction(() => __async$h(this, null, function* () {
        yield this.$store.dispatch(this.objectTypeScope("removeFilter"), {
          id: this.id,
          panelId: this.panelId,
          idx: this.currentFilterIdx
        });
        if (this.currentFilterIdx >= this.object.filters.length) {
          this.currentFilterIdx = this.object.filters.length - 1;
        }
        return;
      }));
    },
    moveFilter(moveBy) {
      this.vuexHistory.transaction(() => {
        this.$store.dispatch(this.objectTypeScope("moveFilter"), {
          id: this.id,
          panelId: this.panelId,
          idx: this.currentFilterIdx,
          moveBy
        });
        this.currentFilterIdx += moveBy;
        return;
      });
    },
    setValue(value) {
      this.vuexHistory.transaction(() => {
        this.$store.dispatch(this.objectTypeScope("setFilter"), __spreadValues$a({
          id: this.id,
          panelId: this.panelId,
          idx: this.currentFilterIdx
        }, value));
      });
    },
    eightsStops(gen) {
      const stops = [];
      for (let i = 0; i <= 8; ++i) {
        stops.push(gen(i / 8));
      }
      return stops;
    }
  }
});
const imageOptions_vue_vue_type_style_index_0_scoped_d8e66f9b_lang = "";
const _withScopeId$a = (n) => (pushScopeId("data-v-d8e66f9b"), n = n(), popScopeId(), n);
const _hoisted_1$g = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("h2", null, "Image options", -1));
const _hoisted_2$e = { class: "column ok-col" };
const _hoisted_3$c = {
  key: 0,
  class: "column"
};
const _hoisted_4$b = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("label", { for: "compositionSelect" }, "Compositing Mode:", -1));
const _hoisted_5$9 = /* @__PURE__ */ createTextVNode("[?] ");
const _hoisted_6$9 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "source-over" }, "source-over", -1));
const _hoisted_7$9 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "source-atop" }, "source-atop", -1));
const _hoisted_8$8 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "destination-over" }, "destination-over", -1));
const _hoisted_9$8 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "destination-in" }, "destination-in", -1));
const _hoisted_10$8 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "destination-in" }, "destination-out", -1));
const _hoisted_11$7 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "destination-in" }, "destination-atop", -1));
const _hoisted_12$6 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "lighter" }, "lighter", -1));
const _hoisted_13$5 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "xor" }, "xor", -1));
const _hoisted_14$4 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "multiply" }, "multiply", -1));
const _hoisted_15$4 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "screen" }, "screen", -1));
const _hoisted_16$4 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "overlay" }, "overlay", -1));
const _hoisted_17$4 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "darken" }, "darken", -1));
const _hoisted_18$4 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "lighten" }, "lighten", -1));
const _hoisted_19$4 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "color-dodge" }, "color-dodge", -1));
const _hoisted_20$5 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "color-burn" }, "color-burn", -1));
const _hoisted_21$4 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "hard-light" }, "hard-light", -1));
const _hoisted_22$4 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "soft-light" }, "soft-light", -1));
const _hoisted_23$4 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "difference" }, "difference", -1));
const _hoisted_24$3 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "exclusion" }, "exclusion", -1));
const _hoisted_25$2 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "hue" }, "hue", -1));
const _hoisted_26$2 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "saturation" }, "saturation", -1));
const _hoisted_27$2 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "color" }, "color", -1));
const _hoisted_28$2 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("option", { value: "luminosity" }, "luminosity", -1));
const _hoisted_29$1 = [
  _hoisted_6$9,
  _hoisted_7$9,
  _hoisted_8$8,
  _hoisted_9$8,
  _hoisted_10$8,
  _hoisted_11$7,
  _hoisted_12$6,
  _hoisted_13$5,
  _hoisted_14$4,
  _hoisted_15$4,
  _hoisted_16$4,
  _hoisted_17$4,
  _hoisted_18$4,
  _hoisted_19$4,
  _hoisted_20$5,
  _hoisted_21$4,
  _hoisted_22$4,
  _hoisted_23$4,
  _hoisted_24$3,
  _hoisted_25$2,
  _hoisted_26$2,
  _hoisted_27$2,
  _hoisted_28$2
];
const _hoisted_30$1 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("label", { for: "addEffect" }, "Add new effect", -1));
const _hoisted_31$1 = ["value"];
const _hoisted_32$1 = ["disabled"];
const _hoisted_33$1 = ["disabled"];
const _hoisted_34$1 = ["disabled"];
const _hoisted_35$1 = ["disabled"];
const _hoisted_36$1 = ["onClick", "onKeydown"];
const _hoisted_37$1 = {
  key: 0,
  class: "value-input-table"
};
const _hoisted_38$1 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "shadow_color" }, "Color:")
], -1));
const _hoisted_39$1 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "filter_x" }, "X:")
], -1));
const _hoisted_40$1 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "filter_y" }, "Y:")
], -1));
const _hoisted_41$1 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "filter_blur" }, "Blur:")
], -1));
const _hoisted_42$1 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "filter_value" }, "Value:")
], -1));
const _hoisted_43$1 = ["value", "max", "min"];
const _hoisted_44$1 = /* @__PURE__ */ createTextVNode("% ");
const _hoisted_45$1 = { key: 0 };
const _hoisted_46$1 = { colspan: "2" };
const _hoisted_47$1 = /* @__PURE__ */ _withScopeId$a(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "filter_value" }, "Value:")
], -1));
const _hoisted_48$1 = ["value", "max", "min"];
const _hoisted_49$1 = { key: 0 };
const _hoisted_50 = { colspan: "2" };
function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_color = resolveComponent("color");
  const _component_l = resolveComponent("l");
  const _component_d_flow = resolveComponent("d-flow");
  const _component_slider = resolveComponent("slider");
  const _component_d_fieldset = resolveComponent("d-fieldset");
  return _ctx.showShadowColor ? (openBlock(), createBlock(_component_color, {
    key: 0,
    modelValue: _ctx.shadowColor,
    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.shadowColor = $event),
    format: "rgb",
    onLeave: _cache[1] || (_cache[1] = ($event) => _ctx.showShadowColor = false)
  }, null, 8, ["modelValue"])) : (openBlock(), createBlock(_component_d_flow, {
    key: 1,
    "no-wraping": "",
    class: "image-options-subpanel"
  }, {
    default: withCtx(() => [
      _hoisted_1$g,
      createBaseVNode("div", _hoisted_2$e, [
        createBaseVNode("button", {
          onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("leave"))
        }, "Back")
      ]),
      !_ctx.noComposition ? (openBlock(), createElementBlock("div", _hoisted_3$c, [
        _hoisted_4$b,
        createVNode(_component_l, { to: "https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation#Types" }, {
          default: withCtx(() => [
            _hoisted_5$9
          ]),
          _: 1
        }),
        withDirectives(createBaseVNode("select", {
          id: "compositionSelect",
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => _ctx.compositionMode = $event),
          onKeydown: _cache[4] || (_cache[4] = withModifiers(() => {
          }, ["stop"]))
        }, _hoisted_29$1, 544), [
          [vModelSelect, _ctx.compositionMode]
        ])
      ])) : createCommentVNode("", true),
      createVNode(_component_d_fieldset, {
        class: "column",
        title: "Effects",
        style: { "overflow": "hidden" }
      }, {
        default: withCtx(() => [
          createVNode(_component_d_flow, {
            class: "filter-flow",
            "no-wraping": "",
            gap: "8px"
          }, {
            default: withCtx(() => [
              createVNode(_component_d_flow, {
                direction: "vertical",
                "no-wraping": ""
              }, {
                default: withCtx(() => [
                  _hoisted_30$1,
                  withDirectives(createBaseVNode("select", {
                    id: "addEffect",
                    "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => _ctx.addEffectSelection = $event),
                    onKeydown: _cache[6] || (_cache[6] = withModifiers(() => {
                    }, ["stop"]))
                  }, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.filterTypes, (filterType) => {
                      return openBlock(), createElementBlock("option", {
                        key: filterType,
                        value: filterType
                      }, toDisplayString(_ctx.getFilterLabel(filterType)), 9, _hoisted_31$1);
                    }), 128))
                  ], 544), [
                    [vModelSelect, _ctx.addEffectSelection]
                  ]),
                  createBaseVNode("button", {
                    disabled: _ctx.addEffectSelection === "",
                    onClick: _cache[7] || (_cache[7] = (...args) => _ctx.addFilter && _ctx.addFilter(...args)),
                    onKeydown: _cache[8] || (_cache[8] = withModifiers(() => {
                    }, ["stop"]))
                  }, " Add ", 40, _hoisted_32$1),
                  createBaseVNode("button", {
                    disabled: !_ctx.currentFilter,
                    onClick: _cache[9] || (_cache[9] = (...args) => _ctx.removeFilter && _ctx.removeFilter(...args)),
                    onKeydown: _cache[10] || (_cache[10] = withModifiers(() => {
                    }, ["stop"]))
                  }, " Remove ", 40, _hoisted_33$1),
                  createBaseVNode("button", {
                    disabled: _ctx.currentFilterIdx === 0,
                    onClick: _cache[11] || (_cache[11] = ($event) => _ctx.moveFilter(-1)),
                    onKeydown: _cache[12] || (_cache[12] = withModifiers(() => {
                    }, ["stop"]))
                  }, " Move up ", 40, _hoisted_34$1),
                  createBaseVNode("button", {
                    disabled: _ctx.currentFilterIdx === _ctx.filters.length - 1 || _ctx.filters.length === 0,
                    onClick: _cache[13] || (_cache[13] = ($event) => _ctx.moveFilter(1)),
                    onKeydown: _cache[14] || (_cache[14] = withModifiers(() => {
                    }, ["stop"]))
                  }, " Move down ", 40, _hoisted_35$1)
                ]),
                _: 1
              }),
              createVNode(_component_d_flow, {
                maxSize: "100%",
                direction: "vertical",
                "no-wraping": ""
              }, {
                default: withCtx(() => [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.filters, (filter, filterIdx) => {
                    return openBlock(), createElementBlock("div", {
                      key: filterIdx,
                      class: normalizeClass({ choiceBtn: true, active: filterIdx === _ctx.currentFilterIdx }),
                      tabindex: "0",
                      onClick: ($event) => _ctx.selectFilter(filterIdx),
                      onKeydown: [
                        withKeys(($event) => _ctx.selectFilter(filterIdx), ["enter"]),
                        withKeys(withModifiers(($event) => _ctx.selectFilter(filterIdx), ["prevent"]), ["space"])
                      ]
                    }, toDisplayString(_ctx.getFilterText(filter)), 43, _hoisted_36$1);
                  }), 128))
                ]),
                _: 1
              }),
              _ctx.currentFilter ? (openBlock(), createElementBlock("table", _hoisted_37$1, [
                _ctx.currentFilter.type === "drop-shadow" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                  createBaseVNode("tr", null, [
                    _hoisted_38$1,
                    createBaseVNode("td", null, [
                      createBaseVNode("button", {
                        id: "shadow_color",
                        class: "color-button",
                        style: normalizeStyle$1({ background: _ctx.shadowColor }),
                        onClick: _cache[15] || (_cache[15] = ($event) => _ctx.showShadowColor = true)
                      }, " \xA0 ", 4)
                    ])
                  ]),
                  createBaseVNode("tr", null, [
                    _hoisted_39$1,
                    createBaseVNode("td", null, [
                      withDirectives(createBaseVNode("input", {
                        id: "filter_x",
                        type: "number",
                        "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => _ctx.shadowX = $event),
                        onKeydown: _cache[17] || (_cache[17] = withModifiers(() => {
                        }, ["stop"]))
                      }, null, 544), [
                        [
                          vModelText,
                          _ctx.shadowX,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ])
                  ]),
                  createBaseVNode("tr", null, [
                    _hoisted_40$1,
                    createBaseVNode("td", null, [
                      withDirectives(createBaseVNode("input", {
                        id: "filter_y",
                        type: "number",
                        "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => _ctx.shadowY = $event),
                        onKeydown: _cache[19] || (_cache[19] = withModifiers(() => {
                        }, ["stop"]))
                      }, null, 544), [
                        [
                          vModelText,
                          _ctx.shadowY,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ])
                  ]),
                  createBaseVNode("tr", null, [
                    _hoisted_41$1,
                    createBaseVNode("td", null, [
                      withDirectives(createBaseVNode("input", {
                        id: "filter_blur",
                        type: "number",
                        "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => _ctx.shadowBlur = $event),
                        onKeydown: _cache[21] || (_cache[21] = withModifiers(() => {
                        }, ["stop"]))
                      }, null, 544), [
                        [
                          vModelText,
                          _ctx.shadowBlur,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ])
                  ])
                ], 64)) : _ctx.isPercentFilter ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                  createBaseVNode("tr", null, [
                    _hoisted_42$1,
                    createBaseVNode("td", null, [
                      createBaseVNode("input", {
                        id: "filter_value",
                        value: (_ctx.currentFilter.value * 100).toFixed(),
                        type: "number",
                        max: _ctx.maxValue,
                        min: _ctx.minValue,
                        onInput: _cache[22] || (_cache[22] = ($event) => _ctx.setValue({ value: Number($event.target.value / 100) })),
                        onKeydown: _cache[23] || (_cache[23] = withModifiers(() => {
                        }, ["stop"]))
                      }, null, 40, _hoisted_43$1),
                      _hoisted_44$1
                    ])
                  ]),
                  _ctx.minValue === 0 && _ctx.maxValue !== void 0 ? (openBlock(), createElementBlock("tr", _hoisted_45$1, [
                    createBaseVNode("td", _hoisted_46$1, [
                      createVNode(_component_slider, {
                        gradientStops: ["#000000", "#ffffff"],
                        label: "",
                        maxValue: _ctx.maxValue,
                        modelValue: _ctx.currentFilter.value * 100,
                        "no-input": "",
                        "onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => _ctx.setValue({ value: Math.round($event) / 100 }))
                      }, null, 8, ["maxValue", "modelValue"])
                    ])
                  ])) : createCommentVNode("", true)
                ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 2 }, [
                  createBaseVNode("tr", null, [
                    _hoisted_47$1,
                    createBaseVNode("td", null, [
                      createBaseVNode("input", {
                        id: "filter_value",
                        value: _ctx.currentFilter.value,
                        type: "number",
                        max: _ctx.maxValue,
                        min: _ctx.minValue,
                        onInput: _cache[25] || (_cache[25] = ($event) => _ctx.setValue({ value: Number($event.target.value) })),
                        onKeydown: _cache[26] || (_cache[26] = withModifiers(() => {
                        }, ["stop"]))
                      }, null, 40, _hoisted_48$1)
                    ])
                  ]),
                  _ctx.minValue === 0 && _ctx.maxValue !== void 0 ? (openBlock(), createElementBlock("tr", _hoisted_49$1, [
                    createBaseVNode("td", _hoisted_50, [
                      createVNode(_component_slider, {
                        gradientStops: _ctx.hueStops,
                        label: "",
                        maxValue: _ctx.maxValue,
                        modelValue: _ctx.currentFilter.value,
                        "no-input": "",
                        "onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => _ctx.setValue({ value: Math.round($event) }))
                      }, null, 8, ["gradientStops", "maxValue", "modelValue"]),
                      createVNode(_component_slider, {
                        gradientStops: _ctx.hueStops,
                        label: "",
                        maxValue: _ctx.maxValue,
                        modelValue: _ctx.currentFilter.value,
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
}
const ImageOptions = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$h], ["__scopeId", "data-v-d8e66f9b"]]);
const _sfc_main$g = defineComponent({
  inheritAttrs: false,
  components: { Color },
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
  data: () => ({
    colorSelector: "",
    selectedFont: "",
    selectedColor: "#000000",
    rememberedStart: 0,
    rememberedEnd: 0,
    error: ""
  }),
  computed: {
    vertical() {
      return this.$store.state.ui.vertical;
    }
  },
  watch: {
    selectedFont() {
      if (this.selectedFont === "")
        return;
      this.insertCommand("font", this.selectedFont);
      this.selectedFont = "";
    }
  },
  methods: {
    onValueChanged() {
      const constants = getConstants();
      const val = this.$refs.textArea.value;
      try {
        new TextRenderer(val, constants.TextBox.NameboxTextStyle);
        this.error = "";
      } catch (e) {
        this.error = e.message;
      }
      this.$emit("update:modelValue", val);
    },
    selectColor(colorSelector) {
      const el = this.$refs.textArea;
      this.colorSelector = colorSelector;
      this.rememberedStart = el.selectionStart;
      this.rememberedEnd = el.selectionEnd;
    },
    applyColor() {
      const color2 = this.selectedColor;
      const colorSelector = this.colorSelector;
      const apply = () => {
        const el = this.$refs.textArea;
        if (!el) {
          this.$nextTick(apply);
          return;
        }
        el.selectionStart = this.rememberedStart;
        el.selectionEnd = this.rememberedEnd;
        this.insertCommand(
          colorSelector === "text" ? "color" : "outlinecolor",
          color2
        );
      };
      this.$nextTick(apply);
      this.selectedColor = "#000000";
      this.colorSelector = "";
    },
    insertText(text) {
      const el = this.$refs.textArea;
      const val = el.value;
      const selStart = el.selectionStart;
      const selEnd = el.selectionEnd;
      el.value = val.slice(0, selStart) + text + val.slice(selEnd);
      el.selectionStart = el.selectionEnd = selStart + text.length;
      el.focus();
      this.onValueChanged();
    },
    insertCommand(command, arg) {
      const el = this.$refs.textArea;
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
      this.onValueChanged();
    }
  }
});
const text_vue_vue_type_style_index_0_scoped_61424637_lang = "";
const _withScopeId$9 = (n) => (pushScopeId("data-v-61424637"), n = n(), popScopeId(), n);
const _hoisted_1$f = { class: "column ok-col" };
const _hoisted_2$d = { class: "column" };
const _hoisted_3$b = ["value"];
const _hoisted_4$a = {
  key: 0,
  class: "column error-col"
};
const _hoisted_5$8 = { class: "column" };
const _hoisted_6$8 = /* @__PURE__ */ _withScopeId$9(() => /* @__PURE__ */ createBaseVNode("p", { class: "hint-col" }, "Apply style to selected text:", -1));
const _hoisted_7$8 = { class: "column" };
const _hoisted_8$7 = { class: "column" };
const _hoisted_9$7 = { class: "column" };
const _hoisted_10$7 = /* @__PURE__ */ createStaticVNode('<option value data-v-61424637>Font</option><option value="aller" style="font-family:aller;" data-v-61424637> Aller (Textbox) </option><option value="riffic" style="font-family:riffic;" data-v-61424637> Riffic (Bold text) </option><option value="hashtag" style="font-family:hashtag;" data-v-61424637> Hashtag (Sayori) </option><option value="ammy_handwriting" style="font-family:ammy_handwriting;" data-v-61424637> Ammy&#39;s Handwriting (Natsuki) </option><option value="journal" style="font-family:journal;" data-v-61424637> Journal (Monika) </option><option value="jp_hand_slanted" style="font-family:jp_hand_slanted;" data-v-61424637> JP Hand Slanted (Yuri) </option><option value="damagrafik_script" style="font-family:damagrafik_script;" data-v-61424637> Damagrafik (Yuri, Act 2) </option><option value="as_i_lay_dying" style="font-family:as_i_lay_dying;" data-v-61424637> As I Lay Dying (Yuri, Act Unused) </option><option value="halogen" style="font-family:halogen;" data-v-61424637> Halogen (MC) </option>', 10);
const _hoisted_20$4 = [
  _hoisted_10$7
];
function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_color = resolveComponent("color");
  return _ctx.colorSelector ? (openBlock(), createBlock(_component_color, {
    key: 0,
    modelValue: _ctx.selectedColor,
    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.selectedColor = $event),
    onLeave: _ctx.applyColor
  }, null, 8, ["modelValue", "onLeave"])) : (openBlock(), createElementBlock("div", {
    key: 1,
    class: normalizeClass({ "text-subpanel": true, vertical: _ctx.vertical })
  }, [
    createBaseVNode("h2", null, toDisplayString(_ctx.title), 1),
    createBaseVNode("div", _hoisted_1$f, [
      createBaseVNode("button", {
        onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("leave"))
      }, "OK")
    ]),
    createBaseVNode("div", _hoisted_2$d, [
      createBaseVNode("textarea", {
        ref: "textArea",
        value: _ctx.modelValue,
        onInput: _cache[2] || (_cache[2] = (...args) => _ctx.onValueChanged && _ctx.onValueChanged(...args)),
        onKeydown: _cache[3] || (_cache[3] = withModifiers(() => {
        }, ["stop"])),
        onKeypress: _cache[4] || (_cache[4] = withModifiers(() => {
        }, ["stop"]))
      }, null, 40, _hoisted_3$b)
    ]),
    _ctx.error ? (openBlock(), createElementBlock("div", _hoisted_4$a, toDisplayString(_ctx.error), 1)) : createCommentVNode("", true),
    createBaseVNode("div", _hoisted_5$8, [
      createBaseVNode("button", {
        onClick: _cache[5] || (_cache[5] = ($event) => _ctx.insertText("\\\\")),
        class: "style-button"
      }, "Insert \\"),
      createBaseVNode("button", {
        onClick: _cache[6] || (_cache[6] = ($event) => _ctx.insertText("\\{")),
        class: "style-button"
      }, "Insert {"),
      createBaseVNode("button", {
        onClick: _cache[7] || (_cache[7] = ($event) => _ctx.insertText("\\}")),
        class: "style-button"
      }, "Insert }")
    ]),
    _hoisted_6$8,
    createBaseVNode("div", _hoisted_7$8, [
      createBaseVNode("button", {
        onClick: _cache[8] || (_cache[8] = ($event) => _ctx.insertCommand("b")),
        class: "style-button",
        style: { "font-weight": "bold" }
      }, " Bold "),
      createBaseVNode("button", {
        onClick: _cache[9] || (_cache[9] = ($event) => _ctx.insertCommand("i")),
        class: "style-button",
        style: { "font-style": "italic" }
      }, " Italics "),
      createBaseVNode("button", {
        onClick: _cache[10] || (_cache[10] = ($event) => _ctx.insertCommand("plain")),
        class: "style-button"
      }, " Plain "),
      createBaseVNode("button", {
        onClick: _cache[11] || (_cache[11] = ($event) => _ctx.insertCommand("edited")),
        class: "style-button edited-style"
      }, " Edited "),
      createBaseVNode("button", {
        onClick: _cache[12] || (_cache[12] = ($event) => _ctx.insertCommand("k", 2)),
        class: "style-button",
        style: { "letter-spacing": "5px" }
      }, " Kerning ")
    ]),
    createBaseVNode("div", _hoisted_8$7, [
      createBaseVNode("button", {
        onClick: _cache[13] || (_cache[13] = ($event) => _ctx.insertCommand("alpha", 0.5)),
        class: "style-button"
      }, " Alpha ")
    ]),
    createBaseVNode("div", _hoisted_9$7, [
      createBaseVNode("button", {
        onClick: _cache[14] || (_cache[14] = ($event) => _ctx.insertCommand("size", 12)),
        class: "style-button",
        style: { "font-size": "20px" }
      }, " Font size "),
      withDirectives(createBaseVNode("select", {
        "onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => _ctx.selectedFont = $event),
        class: "style-button"
      }, _hoisted_20$4, 512), [
        [vModelSelect, _ctx.selectedFont]
      ]),
      createBaseVNode("button", {
        onClick: _cache[16] || (_cache[16] = ($event) => _ctx.selectColor("text")),
        class: "style-button"
      }, " Text color "),
      createBaseVNode("button", {
        onClick: _cache[17] || (_cache[17] = ($event) => _ctx.selectColor("outline")),
        class: "style-button"
      }, " Outline color ")
    ])
  ], 2));
}
const TextEditor = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$g], ["__scopeId", "data-v-61424637"]]);
var __async$g = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const setable$3 = genericSetable();
const _sfc_main$f = defineComponent({
  mixins: [PanelMixin],
  components: {
    Toggle: ToggleBox,
    PositionAndSize,
    Layers,
    Delete,
    TextEditor,
    ImageOptions,
    Color,
    ModalDialog,
    DFieldset
  },
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
  data: () => ({
    imageOptionsOpen: false,
    canEdit: true,
    modalNameInput: "",
    showRename: false,
    localColorHandler: null
  }),
  computed: {
    flip: setable$3("flip", "panels/setFlip"),
    rotation: setable$3("rotation", "panels/setRotation"),
    enlargeWhenTalking: setable$3(
      "enlargeWhenTalking",
      "panels/setEnlargeWhenTalking"
    ),
    currentPanel() {
      return this.$store.state.panels.panels[this.$store.state.panels.currentPanel];
    },
    nameboxWidth: {
      get() {
        const val = this.object.nameboxWidth;
        if (val === null)
          return "";
        return val + "";
      },
      set(value) {
        const val = value.trim() === "" ? null : parseInt(value);
        this.vuexHistory.transaction(() => __async$g(this, null, function* () {
          this.$store.commit("panels/setObjectNameboxWidth", {
            id: this.object.id,
            panelId: this.object.panelId,
            nameboxWidth: val
          });
        }));
      }
    },
    zoom: {
      get() {
        return this.object.zoom * 100;
      },
      set(zoom) {
        this.vuexHistory.transaction(() => __async$g(this, null, function* () {
          this.$store.commit("panels/setObjectZoom", {
            id: this.object.id,
            panelId: this.object.panelId,
            zoom: zoom / 100
          });
        }));
      }
    },
    defaultNameboxWidth() {
      return getConstants().TextBox.NameboxWidth;
    },
    finalColorHandler() {
      return this.localColorHandler || this.colorHandler || null;
    },
    hasLabel() {
      return this.object.label !== null;
    },
    heading() {
      var _a, _b;
      return (_b = (_a = this.object.label) != null ? _a : this.title) != null ? _b : "Object";
    },
    useCustomTextboxColor: {
      get() {
        return this.object.textboxColor !== null;
      },
      set(val) {
        this.vuexHistory.transaction(() => __async$g(this, null, function* () {
          this.$store.commit("panels/setTextboxColor", {
            panelId: this.object.panelId,
            id: this.object.id,
            textboxColor: val ? getConstants().TextBoxCustom.textboxDefaultColor : null
          });
        }));
      }
    }
  },
  methods: {
    copy() {
      this.vuexHistory.transaction(() => __async$g(this, null, function* () {
        yield this.$store.dispatch("panels/copyObjectToClipboard", {
          panelId: this.object.panelId,
          id: this.object.id
        });
      }));
    },
    enableNameEdit() {
      var _a;
      this.modalNameInput = (_a = this.object.label) != null ? _a : "";
      this.showRename = true;
    },
    renameOption(option) {
      this.showRename = false;
      if (option === "Apply") {
        this.vuexHistory.transaction(() => __async$g(this, null, function* () {
          this.$store.commit("panels/setLabel", {
            panelId: this.object.panelId,
            id: this.object.id,
            label: this.modalNameInput
          });
        }));
      }
    },
    selectTextboxColor() {
      this.localColorHandler = {
        title: "Textbox color",
        get: () => this.object.textboxColor,
        set: (color2) => {
          this.vuexHistory.transaction(() => __async$g(this, null, function* () {
            this.$store.commit("panels/setTextboxColor", {
              panelId: this.object.panelId,
              id: this.object.id,
              textboxColor: color2
            });
          }));
        },
        leave: () => {
          this.localColorHandler = null;
        }
      };
    }
  }
});
const objectTool_vue_vue_type_style_index_0_scoped_96a1ac72_lang = "";
const objectTool_vue_vue_type_style_index_1_lang = "";
const _withScopeId$8 = (n) => (pushScopeId("data-v-96a1ac72"), n = n(), popScopeId(), n);
const _hoisted_1$e = { class: "panel" };
const _hoisted_2$c = /* @__PURE__ */ _withScopeId$8(() => /* @__PURE__ */ createBaseVNode("span", { class: "icon material-icons" }, "edit", -1));
const _hoisted_3$a = /* @__PURE__ */ _withScopeId$8(() => /* @__PURE__ */ createBaseVNode("p", { class: "modal-text" }, "Enter the new name", -1));
const _hoisted_4$9 = { class: "modal-text" };
const _hoisted_5$7 = { class: "input-table" };
const _hoisted_6$7 = /* @__PURE__ */ _withScopeId$8(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "rotation" }, "Rotation: \xB0")
], -1));
const _hoisted_7$7 = { key: 0 };
const _hoisted_8$6 = /* @__PURE__ */ _withScopeId$8(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "zoom" }, "Zoom: ")
], -1));
const _hoisted_9$6 = { key: 0 };
const _hoisted_10$6 = /* @__PURE__ */ _withScopeId$8(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "textbox_color" }, "Color:")
], -1));
const _hoisted_11$6 = /* @__PURE__ */ _withScopeId$8(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "namebox_width" }, "Namebox width:")
], -1));
const _hoisted_12$5 = ["placeholder"];
function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_modal_dialog = resolveComponent("modal-dialog");
  const _component_text_editor = resolveComponent("text-editor");
  const _component_color = resolveComponent("color");
  const _component_image_options = resolveComponent("image-options");
  const _component_position_and_size = resolveComponent("position-and-size");
  const _component_layers = resolveComponent("layers");
  const _component_toggle = resolveComponent("toggle");
  const _component_d_fieldset = resolveComponent("d-fieldset");
  const _component_delete = resolveComponent("delete");
  return openBlock(), createElementBlock("div", _hoisted_1$e, [
    createBaseVNode("h1", {
      style: normalizeStyle$1({ fontStyle: _ctx.hasLabel ? "italic" : "normal" }),
      onClick: _cache[0] || (_cache[0] = (...args) => _ctx.enableNameEdit && _ctx.enableNameEdit(...args))
    }, [
      createTextVNode(toDisplayString(_ctx.heading) + " ", 1),
      _hoisted_2$c
    ], 4),
    (openBlock(), createBlock(Teleport, { to: "#modal-messages" }, [
      _ctx.showRename ? (openBlock(), createBlock(_component_modal_dialog, {
        key: 0,
        options: ["Apply", "Cancel"],
        "no-base-size": "",
        class: "modal-rename",
        onOption: _ctx.renameOption,
        onLeave: _cache[3] || (_cache[3] = ($event) => _ctx.renameOption("Cancel"))
      }, {
        default: withCtx(() => [
          _hoisted_3$a,
          createBaseVNode("p", _hoisted_4$9, [
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _ctx.modalNameInput = $event),
              style: { "width": "100%" },
              onKeydown: _cache[2] || (_cache[2] = withKeys(withModifiers(($event) => _ctx.renameOption("Apply"), ["prevent", "stop"]), ["enter"]))
            }, null, 544), [
              [vModelText, _ctx.modalNameInput]
            ])
          ])
        ]),
        _: 1
      }, 8, ["onOption"])) : createCommentVNode("", true)
    ])),
    _ctx.textHandler ? (openBlock(), createBlock(_component_text_editor, {
      key: 0,
      title: _ctx.textHandler.title,
      modelValue: _ctx.textHandler.get(),
      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => _ctx.textHandler.set($event)),
      onLeave: _cache[5] || (_cache[5] = ($event) => _ctx.textHandler.leave())
    }, null, 8, ["title", "modelValue"])) : _ctx.finalColorHandler ? (openBlock(), createBlock(_component_color, {
      key: 1,
      title: _ctx.finalColorHandler.title,
      modelValue: _ctx.finalColorHandler.get(),
      "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => _ctx.finalColorHandler.set($event)),
      onLeave: _cache[7] || (_cache[7] = ($event) => _ctx.finalColorHandler.leave())
    }, null, 8, ["title", "modelValue"])) : _ctx.imageOptionsOpen ? (openBlock(), createBlock(_component_image_options, {
      key: 2,
      type: "object",
      "panel-id": _ctx.object.panelId,
      id: _ctx.object.id,
      onLeave: _cache[8] || (_cache[8] = ($event) => _ctx.imageOptionsOpen = false)
    }, null, 8, ["panel-id", "id"])) : _ctx.showAltPanel ? renderSlot(_ctx.$slots, "alt-panel", { key: 3 }, void 0, true) : (openBlock(), createElementBlock(Fragment, { key: 4 }, [
      renderSlot(_ctx.$slots, "default", {}, void 0, true),
      createVNode(_component_position_and_size, { obj: _ctx.object }, null, 8, ["obj"]),
      createVNode(_component_layers, { object: _ctx.object }, null, 8, ["object"]),
      createVNode(_component_toggle, {
        modelValue: _ctx.flip,
        "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => _ctx.flip = $event),
        label: "Flip?"
      }, null, 8, ["modelValue"]),
      createBaseVNode("table", _hoisted_5$7, [
        createBaseVNode("tr", null, [
          _hoisted_6$7,
          createBaseVNode("td", null, [
            withDirectives(createBaseVNode("input", {
              id: "rotation",
              class: "smol",
              type: "number",
              "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => _ctx.rotation = $event),
              onKeydown: _cache[11] || (_cache[11] = withModifiers(() => {
              }, ["stop"]))
            }, null, 544), [
              [vModelText, _ctx.rotation]
            ])
          ])
        ]),
        _ctx.object.type === "character" || _ctx.object.type === "sprite" ? (openBlock(), createElementBlock("tr", _hoisted_7$7, [
          _hoisted_8$6,
          createBaseVNode("td", null, [
            withDirectives(createBaseVNode("input", {
              id: "zoom",
              type: "number",
              class: "smol",
              step: "1",
              min: "0",
              "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => _ctx.zoom = $event),
              onKeydown: _cache[13] || (_cache[13] = withModifiers(() => {
              }, ["stop"]))
            }, null, 544), [
              [vModelText, _ctx.zoom]
            ])
          ])
        ])) : createCommentVNode("", true)
      ]),
      renderSlot(_ctx.$slots, "options", {}, void 0, true),
      _ctx.hasLabel ? (openBlock(), createBlock(_component_d_fieldset, {
        key: 0,
        title: "Textbox settings"
      }, {
        default: withCtx(() => [
          _ctx.object.type === "character" || _ctx.object.type === "sprite" ? (openBlock(), createBlock(_component_toggle, {
            key: 0,
            label: "Enlarge when talking",
            modelValue: _ctx.enlargeWhenTalking,
            "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => _ctx.enlargeWhenTalking = $event)
          }, null, 8, ["modelValue"])) : createCommentVNode("", true),
          createVNode(_component_toggle, {
            label: "Use custom textbox color",
            modelValue: _ctx.useCustomTextboxColor,
            "onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => _ctx.useCustomTextboxColor = $event)
          }, null, 8, ["modelValue"]),
          createBaseVNode("table", null, [
            _ctx.useCustomTextboxColor ? (openBlock(), createElementBlock("tr", _hoisted_9$6, [
              _hoisted_10$6,
              createBaseVNode("td", null, [
                createBaseVNode("button", {
                  id: "textbox_color",
                  class: "color-button",
                  style: normalizeStyle$1({ background: _ctx.object.textboxColor }),
                  onClick: _cache[16] || (_cache[16] = (...args) => _ctx.selectTextboxColor && _ctx.selectTextboxColor(...args))
                }, null, 4)
              ])
            ])) : createCommentVNode("", true),
            createBaseVNode("tr", null, [
              _hoisted_11$6,
              createBaseVNode("td", null, [
                withDirectives(createBaseVNode("input", {
                  id: "namebox_width",
                  type: "number",
                  placeholder: _ctx.defaultNameboxWidth,
                  "onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => _ctx.nameboxWidth = $event)
                }, null, 8, _hoisted_12$5), [
                  [
                    vModelText,
                    _ctx.nameboxWidth,
                    void 0,
                    { lazy: true }
                  ]
                ])
              ])
            ])
          ])
        ]),
        _: 1
      })) : createCommentVNode("", true),
      createBaseVNode("button", {
        onClick: _cache[18] || (_cache[18] = ($event) => _ctx.imageOptionsOpen = true)
      }, "Image options"),
      createBaseVNode("button", {
        onClick: _cache[19] || (_cache[19] = (...args) => _ctx.copy && _ctx.copy(...args))
      }, "Copy"),
      createVNode(_component_delete, { obj: _ctx.object }, null, 8, ["obj"])
    ], 64))
  ]);
}
const ObjectTool = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$f], ["__scopeId", "data-v-96a1ac72"]]);
const setable$2 = genericSetable();
const _sfc_main$e = defineComponent({
  mixins: [PanelMixin],
  components: {
    Toggle: ToggleBox,
    Parts,
    DFieldset,
    ObjectTool
  },
  data: () => ({
    panelForParts: null
  }),
  computed: {
    flip: setable$2("flip", "panels/setFlip"),
    closeUp: setable$2("close", "panels/setClose"),
    selection() {
      return this.$store.state.ui.selection;
    },
    currentPanel() {
      return this.$store.state.panels.panels[this.$store.state.panels.currentPanel];
    },
    object() {
      const obj = this.currentPanel.objects[this.selection];
      if (obj.type !== "character")
        return void 0;
      return obj;
    },
    charData() {
      return getData(this.$store, this.object);
    },
    label() {
      var _a;
      return (_a = this.charData.label) != null ? _a : "";
    },
    parts() {
      return getParts(this.charData, this.object);
    },
    hasMultipleStyles() {
      return this.charData.styleGroups[this.object.styleGroupId].styles.length > 1 || this.charData.styleGroups.length > 1;
    },
    hasMultiplePoses() {
      const styleGroup = this.charData.styleGroups[this.object.styleGroupId];
      const style = styleGroup.styles[this.object.styleId];
      return style.poses.length > 1;
    }
  },
  methods: {
    seekPose(delta) {
      this.vuexHistory.transaction(() => {
        this.$store.dispatch("panels/seekPose", {
          id: this.object.id,
          panelId: this.object.panelId,
          delta
        });
      });
    },
    seekStyle(delta) {
      this.vuexHistory.transaction(() => {
        this.$store.dispatch("panels/seekStyle", {
          id: this.object.id,
          panelId: this.object.panelId,
          delta
        });
      });
    },
    seekPart(part, delta) {
      this.vuexHistory.transaction(() => {
        this.$store.dispatch("panels/seekPart", {
          id: this.object.id,
          panelId: this.object.panelId,
          delta,
          part
        });
      });
    },
    captialize(str) {
      return str.charAt(0).toUpperCase() + str.substring(1);
    }
  },
  watch: {
    selection() {
      this.panelForParts = null;
    }
  }
});
const character_vue_vue_type_style_index_0_scoped_a458f9e9_lang = "";
const _hoisted_1$d = { key: 0 };
const _hoisted_2$b = { class: "arrow-col" };
const _hoisted_3$9 = { class: "arrow-col" };
const _hoisted_4$8 = { key: 1 };
const _hoisted_5$6 = { class: "arrow-col" };
const _hoisted_6$6 = { class: "arrow-col" };
const _hoisted_7$6 = { class: "arrow-col" };
const _hoisted_8$5 = ["onClick"];
const _hoisted_9$5 = ["onClick"];
const _hoisted_10$5 = { class: "arrow-col" };
const _hoisted_11$5 = ["onClick"];
function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_parts = resolveComponent("parts");
  const _component_d_fieldset = resolveComponent("d-fieldset");
  const _component_toggle = resolveComponent("toggle");
  const _component_object_tool = resolveComponent("object-tool");
  return openBlock(), createBlock(_component_object_tool, {
    object: _ctx.object,
    title: _ctx.label,
    showAltPanel: !!_ctx.panelForParts
  }, {
    "alt-panel": withCtx(() => [
      _ctx.panelForParts ? (openBlock(), createBlock(_component_parts, {
        key: 0,
        character: _ctx.object,
        part: _ctx.panelForParts,
        onLeave: _cache[0] || (_cache[0] = ($event) => _ctx.panelForParts = null),
        onShowDialog: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("show-dialog", $event)),
        onShowExpressionDialog: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("show-expression-dialog", $event))
      }, null, 8, ["character", "part"])) : createCommentVNode("", true)
    ]),
    default: withCtx(() => [
      _ctx.hasMultiplePoses || _ctx.parts.length > 0 || _ctx.hasMultipleStyles ? (openBlock(), createBlock(_component_d_fieldset, {
        key: 0,
        class: "pose-list",
        title: "Pose:"
      }, {
        default: withCtx(() => [
          createBaseVNode("table", null, [
            createBaseVNode("tbody", null, [
              _ctx.hasMultipleStyles ? (openBlock(), createElementBlock("tr", _hoisted_1$d, [
                createBaseVNode("td", _hoisted_2$b, [
                  createBaseVNode("button", {
                    onClick: _cache[3] || (_cache[3] = ($event) => _ctx.seekStyle(-1))
                  }, "<")
                ]),
                createBaseVNode("td", null, [
                  createBaseVNode("button", {
                    class: "middle-button",
                    onClick: _cache[4] || (_cache[4] = ($event) => _ctx.panelForParts = "style")
                  }, " Style ")
                ]),
                createBaseVNode("td", _hoisted_3$9, [
                  createBaseVNode("button", {
                    onClick: _cache[5] || (_cache[5] = ($event) => _ctx.seekStyle(1))
                  }, ">")
                ])
              ])) : createCommentVNode("", true),
              _ctx.hasMultiplePoses ? (openBlock(), createElementBlock("tr", _hoisted_4$8, [
                createBaseVNode("td", _hoisted_5$6, [
                  createBaseVNode("button", {
                    onClick: _cache[6] || (_cache[6] = ($event) => _ctx.seekPose(-1))
                  }, "<")
                ]),
                createBaseVNode("td", null, [
                  createBaseVNode("button", {
                    class: "middle-button",
                    onClick: _cache[7] || (_cache[7] = ($event) => _ctx.panelForParts = "pose")
                  }, " Pose ")
                ]),
                createBaseVNode("td", _hoisted_6$6, [
                  createBaseVNode("button", {
                    onClick: _cache[8] || (_cache[8] = ($event) => _ctx.seekPose(1))
                  }, ">")
                ])
              ])) : createCommentVNode("", true),
              (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.parts, (part) => {
                return openBlock(), createElementBlock("tr", { key: part }, [
                  createBaseVNode("td", _hoisted_7$6, [
                    createBaseVNode("button", {
                      onClick: ($event) => _ctx.seekPart(part, -1)
                    }, "<", 8, _hoisted_8$5)
                  ]),
                  createBaseVNode("td", null, [
                    createBaseVNode("button", {
                      class: "middle-button",
                      onClick: ($event) => _ctx.panelForParts = part
                    }, toDisplayString(_ctx.captialize(part)), 9, _hoisted_9$5)
                  ]),
                  createBaseVNode("td", _hoisted_10$5, [
                    createBaseVNode("button", {
                      onClick: ($event) => _ctx.seekPart(part, 1)
                    }, ">", 8, _hoisted_11$5)
                  ])
                ]);
              }), 128))
            ])
          ])
        ]),
        _: 1
      })) : createCommentVNode("", true)
    ]),
    options: withCtx(() => [
      createVNode(_component_toggle, {
        modelValue: _ctx.closeUp,
        "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => _ctx.closeUp = $event),
        label: "Close up?"
      }, null, 8, ["modelValue"])
    ]),
    _: 1
  }, 8, ["object", "title", "showAltPanel"]);
}
const CharacterPanel = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$e], ["__scopeId", "data-v-a458f9e9"]]);
const _sfc_main$d = defineComponent({
  mixins: [PanelMixin],
  components: { ObjectTool },
  computed: {
    currentPanel() {
      return this.$store.state.panels.panels[this.$store.state.panels.currentPanel];
    },
    object() {
      const obj = this.currentPanel.objects[this.$store.state.ui.selection];
      if (obj.type !== "sprite")
        return void 0;
      return obj;
    }
  }
});
function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_object_tool = resolveComponent("object-tool");
  return openBlock(), createBlock(_component_object_tool, {
    object: _ctx.object,
    title: "Custom Sprite"
  }, null, 8, ["object"]);
}
const SpritePanel = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$d]]);
function between(min, val, max) {
  if (min > val)
    return min;
  if (val > max)
    return max;
  return val;
}
var __defProp$g = Object.defineProperty;
var __defProps$9 = Object.defineProperties;
var __getOwnPropDescs$9 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$9 = Object.getOwnPropertySymbols;
var __hasOwnProp$9 = Object.prototype.hasOwnProperty;
var __propIsEnum$9 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$g = (obj, key, value) => key in obj ? __defProp$g(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$9 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$9.call(b, prop))
      __defNormalProp$g(a, prop, b[prop]);
  if (__getOwnPropSymbols$9)
    for (var prop of __getOwnPropSymbols$9(b)) {
      if (__propIsEnum$9.call(b, prop))
        __defNormalProp$g(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$9 = (a, b) => __defProps$9(a, __getOwnPropDescs$9(b));
var __async$f = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
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
    var _a;
    const constants = getConstants();
    const id = state.panels[command.panelId].lastObjId + 1;
    const style = constants.TextBox.DefaultTextboxStyle;
    const renderer2 = rendererLookup[style];
    const resetBounds = command.resetBounds || {
      x: renderer2.defaultX,
      y: renderer2.defaultY,
      width: renderer2.defaultWidth,
      height: renderer2.defaultHeight,
      rotation: 0
    };
    commit2("create", {
      object: __spreadProps$9(__spreadValues$9(__spreadValues$9({}, baseProps()), resetBounds), {
        panelId: rootState.panels.currentPanel,
        id,
        onTop: true,
        type: "textBox",
        preserveRatio: false,
        ratio: constants.TextBox.TextBoxWidth / constants.TextBox.TextBoxHeight,
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
        text: (_a = command.text) != null ? _a : "Click here to edit the textbox",
        resetBounds
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
  },
  splitTextbox(_0, _1) {
    return __async$f(this, arguments, function* ({ commit: commit2, state, dispatch: dispatch2 }, command) {
      const obj = state.panels[command.panelId].objects[command.id];
      if (obj.type !== "textBox")
        return;
      const newWidth = (obj.width - splitTextboxSpacing) / 2;
      const centerDistance = newWidth / 2 + splitTextboxSpacing / 2;
      const baseCenter = [obj.x, obj.y];
      let boxOneCoords = [obj.x - centerDistance, obj.y];
      let boxTwoCoords = [obj.x + centerDistance, obj.y];
      if (obj.rotation !== 0) {
        boxOneCoords = rotateAround(
          boxOneCoords[0],
          boxOneCoords[1],
          baseCenter[0],
          baseCenter[1],
          obj.rotation / 180 * Math.PI
        );
        boxTwoCoords = rotateAround(
          boxTwoCoords[0],
          boxTwoCoords[1],
          baseCenter[0],
          baseCenter[1],
          obj.rotation / 180 * Math.PI
        );
      }
      commit2("setResetBounds", {
        id: command.id,
        panelId: command.panelId,
        resetBounds: {
          x: boxOneCoords[0],
          y: boxOneCoords[1],
          width: newWidth,
          height: obj.height,
          rotation: obj.rotation
        }
      });
      const newStyle = obj.style === "custom_plus" ? "custom_plus" : "custom";
      if (obj.style !== newStyle) {
        yield dispatch2(
          "setStyle",
          textboxProperty(command.panelId, command.id, "style", newStyle)
        );
      }
      const id = yield dispatch2("createTextBox", {
        panelId: command.panelId,
        resetBounds: {
          x: boxTwoCoords[0],
          y: boxTwoCoords[1],
          width: newWidth,
          height: obj.height,
          rotation: obj.rotation
        }
      });
      yield dispatch2(
        "setStyle",
        textboxProperty(command.panelId, id, "style", newStyle)
      );
      if (obj.flip) {
        commit2("setFlip", {
          id,
          panelId: command.panelId,
          flip: obj.flip
        });
      }
    });
  }
};
function textboxProperty(panelId, id, key, value) {
  return { id, panelId, key, value };
}
const setable$1 = genericSetable();
const tbSetable = genericSimpleSetter(
  "panels/setTextBoxProperty"
);
const _sfc_main$c = defineComponent({
  components: {
    Toggle: ToggleBox,
    DFieldset,
    ObjectTool,
    DFlow
  },
  mixins: [PanelMixin],
  data: () => ({
    textEditor: "",
    colorSelect: ""
  }),
  computed: {
    currentPanel() {
      return this.$store.state.panels.panels[this.$store.state.panels.currentPanel];
    },
    customizable() {
      return this.textBoxStyle.startsWith("custom");
    },
    nameboxWidthDefault() {
      return getConstants().TextBox.NameboxWidth;
    },
    object() {
      const obj = this.currentPanel.objects[this.$store.state.ui.selection];
      if (obj.type !== "textBox")
        return void 0;
      return obj;
    },
    textHandler() {
      if (!this.textEditor)
        return void 0;
      return {
        title: this.textEditorName,
        get: () => {
          if (this.textEditor === "name")
            return this.object.talkingOther;
          if (this.textEditor === "body")
            return this.dialog;
          return "";
        },
        set: (text) => {
          if (this.textEditor === "name")
            this.talkingOther = text;
          else if (this.textEditor === "body")
            this.dialog = text;
        },
        leave: () => {
          this.textEditor = "";
        }
      };
    },
    colorHandler() {
      if (!this.colorSelect)
        return void 0;
      return {
        title: this.colorName,
        get: () => {
          switch (this.colorSelect) {
            case "":
              return "#000000";
            case "base":
              return this.object.customColor;
            case "controls":
              return this.object.customControlsColor;
            case "namebox":
              return this.object.customNameboxColor;
            case "nameboxStroke":
              return this.object.customNameboxStroke;
            default:
              throw new dist.UnreachableCaseError(this.colorSelect);
          }
        },
        set: (color2) => {
          this.vuexHistory.transaction(() => {
            const panelId = this.currentPanel.id;
            const id = this.object.id;
            let colorKey = {
              base: "customColor",
              controls: "customControlsColor",
              namebox: "customNameboxColor",
              nameboxStroke: "customNameboxStroke",
              "": void 0
            }[this.colorSelect];
            if (color2 === void 0)
              return;
            this.$store.commit(
              "panels/setTextBoxProperty",
              textboxProperty(panelId, id, "customNameboxStroke", colorKey)
            );
          });
        },
        leave: () => {
          this.colorSelect = "";
        }
      };
    },
    talkingObjId: {
      get() {
        var _a;
        return (_a = this.object.talkingObjId) != null ? _a : "$null$";
      },
      set(val) {
        this.vuexHistory.transaction(() => {
          this.$store.commit("panels/setTalkingObject", {
            id: this.object.id,
            panelId: this.object.panelId,
            talkingObjId: val === "$null$" ? null : val
          });
        });
      }
    },
    talkingOther: setable$1("talkingOther", "panels/setTalkingOther"),
    textBoxStyle: setable$1("style", "panels/setStyle", true),
    showControls: tbSetable("controls"),
    allowSkipping: tbSetable("skip"),
    autoQuoting: tbSetable("autoQuoting"),
    autoWrap: tbSetable("autoWrap"),
    showContinueArrow: tbSetable("continue"),
    dialog: tbSetable("text"),
    overrideColor: tbSetable("overrideColor"),
    deriveCustomColors: tbSetable("deriveCustomColors"),
    customNameboxWidth: tbSetable("customNameboxWidth"),
    nameList() {
      const panel = this.currentPanel;
      const ret = [];
      for (const id of [...panel.order, ...panel.onTopOrder]) {
        const obj = panel.objects[id];
        if (obj.label === null)
          continue;
        ret.push([id, obj.label]);
      }
      return ret;
    },
    textEditorName() {
      if (this.textEditor === "name")
        return "Name";
      if (this.textEditor === "body")
        return "Dialog";
      return "";
    },
    customControlsColor() {
      return this.object.customControlsColor;
    },
    colorName() {
      switch (this.colorSelect) {
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
          throw new dist.UnreachableCaseError(this.colorSelect);
      }
    }
  },
  methods: {
    splitTextbox() {
      this.vuexHistory.transaction(() => {
        this.$store.dispatch("panels/splitTextbox", {
          id: this.object.id,
          panelId: this.object.panelId
        });
      });
    },
    resetPosition() {
      this.vuexHistory.transaction(() => {
        this.$store.dispatch("panels/resetTextboxBounds", {
          id: this.object.id,
          panelId: this.object.panelId
        });
      });
    },
    jumpToCharacter() {
      this.vuexHistory.transaction(() => {
        this.$store.commit("ui/setSelection", this.talkingObjId);
      });
    }
  }
});
const textbox_vue_vue_type_style_index_0_scoped_95864fe4_lang = "";
const _withScopeId$7 = (n) => (pushScopeId("data-v-95864fe4"), n = n(), popScopeId(), n);
const _hoisted_1$c = { class: "upper-combos" };
const _hoisted_2$a = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "text_style" }, "Style:")
], -1));
const _hoisted_3$8 = { colspan: "2" };
const _hoisted_4$7 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("option", { value: "normal" }, "Normal", -1));
const _hoisted_5$5 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("option", { value: "corrupt" }, "Corrupt", -1));
const _hoisted_6$5 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("option", { value: "custom" }, "Custom", -1));
const _hoisted_7$5 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("option", { value: "custom_plus" }, "Custom (Plus)", -1));
const _hoisted_8$4 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("option", { value: "none" }, "None", -1));
const _hoisted_9$4 = [
  _hoisted_4$7,
  _hoisted_5$5,
  _hoisted_6$5,
  _hoisted_7$5,
  _hoisted_8$4
];
const _hoisted_10$4 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "current_talking" }, "Person talking:")
], -1));
const _hoisted_11$4 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("option", { value: "$null$" }, "No-one", -1));
const _hoisted_12$4 = ["value"];
const _hoisted_13$4 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("option", { value: "$other$" }, "Other", -1));
const _hoisted_14$3 = ["disabled"];
const _hoisted_15$3 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "custom_name" }, "Other name:")
], -1));
const _hoisted_16$3 = { id: "dialog_text_wrapper" };
const _hoisted_17$3 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("label", { for: "dialog_text" }, "Dialog:", -1));
const _hoisted_18$3 = { key: 0 };
const _hoisted_19$3 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "custom_namebox_width" }, "Namebox width:")
], -1));
const _hoisted_20$3 = ["placeholder", "disabled"];
const _hoisted_21$3 = { colspan: "2" };
const _hoisted_22$3 = { key: 0 };
const _hoisted_23$3 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "textbox_color" }, "Color:")
], -1));
const _hoisted_24$2 = { key: 1 };
const _hoisted_25$1 = { colspan: "2" };
const _hoisted_26$1 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "custom_controls_color" }, "Controls Color:")
], -1));
const _hoisted_27$1 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "custom_namebox_color" }, "Namebox Color:")
], -1));
const _hoisted_28$1 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "custom_namebox_stroke" }, "Namebox text stroke:")
], -1));
function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_toggle = resolveComponent("toggle");
  const _component_d_flow = resolveComponent("d-flow");
  const _component_d_fieldset = resolveComponent("d-fieldset");
  const _component_object_tool = resolveComponent("object-tool");
  return openBlock(), createBlock(_component_object_tool, {
    object: _ctx.object,
    title: "Textbox",
    textHandler: _ctx.textHandler,
    colorHandler: _ctx.colorHandler
  }, {
    default: withCtx(() => [
      createBaseVNode("table", _hoisted_1$c, [
        createBaseVNode("tr", null, [
          _hoisted_2$a,
          createBaseVNode("td", _hoisted_3$8, [
            withDirectives(createBaseVNode("select", {
              id: "text_style",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.textBoxStyle = $event),
              onKeydown: _cache[1] || (_cache[1] = withModifiers(() => {
              }, ["stop"]))
            }, _hoisted_9$4, 544), [
              [vModelSelect, _ctx.textBoxStyle]
            ])
          ])
        ]),
        createBaseVNode("tr", null, [
          _hoisted_10$4,
          createBaseVNode("td", null, [
            withDirectives(createBaseVNode("select", {
              id: "current_talking",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => _ctx.talkingObjId = $event),
              onKeydown: _cache[3] || (_cache[3] = withModifiers(() => {
              }, ["stop"]))
            }, [
              _hoisted_11$4,
              (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.nameList, ([id, label]) => {
                return openBlock(), createElementBlock("option", {
                  key: id,
                  value: id
                }, toDisplayString(label), 9, _hoisted_12$4);
              }), 128)),
              _hoisted_13$4
            ], 544), [
              [vModelSelect, _ctx.talkingObjId]
            ])
          ]),
          createBaseVNode("td", null, [
            createBaseVNode("button", {
              title: "Jump to talking character",
              onClick: _cache[4] || (_cache[4] = (...args) => _ctx.jumpToCharacter && _ctx.jumpToCharacter(...args)),
              disabled: _ctx.talkingObjId === "$null$" || _ctx.talkingObjId === "$other$"
            }, " > ", 8, _hoisted_14$3)
          ])
        ]),
        createBaseVNode("tr", null, [
          _hoisted_15$3,
          createBaseVNode("td", null, [
            withDirectives(createBaseVNode("input", {
              id: "custom_name",
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => _ctx.talkingOther = $event),
              onKeydown: _cache[6] || (_cache[6] = withModifiers(() => {
              }, ["stop"]))
            }, null, 544), [
              [vModelText, _ctx.talkingOther]
            ])
          ]),
          createBaseVNode("td", null, [
            createBaseVNode("button", {
              onClick: _cache[7] || (_cache[7] = ($event) => _ctx.textEditor = "name")
            }, "...")
          ])
        ])
      ]),
      createVNode(_component_toggle, {
        label: "Auto quoting?",
        modelValue: _ctx.autoQuoting,
        "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => _ctx.autoQuoting = $event)
      }, null, 8, ["modelValue"]),
      createVNode(_component_toggle, {
        label: "Auto line wrap?",
        modelValue: _ctx.autoWrap,
        "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => _ctx.autoWrap = $event)
      }, null, 8, ["modelValue"]),
      createBaseVNode("div", _hoisted_16$3, [
        _hoisted_17$3,
        withDirectives(createBaseVNode("textarea", {
          "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => _ctx.dialog = $event),
          id: "dialog_text",
          onKeydown: _cache[11] || (_cache[11] = withModifiers(() => {
          }, ["stop"]))
        }, null, 544), [
          [vModelText, _ctx.dialog]
        ]),
        createBaseVNode("button", {
          onClick: _cache[12] || (_cache[12] = ($event) => _ctx.textEditor = "body")
        }, "Formatting")
      ])
    ]),
    options: withCtx(() => [
      createVNode(_component_d_fieldset, {
        title: "Customization:",
        class: normalizeClass(_ctx.customizable ? "customization-set" : "")
      }, {
        default: withCtx(() => [
          createVNode(_component_d_flow, {
            direction: "vertical",
            maxSize: "100%",
            "no-wraping": ""
          }, {
            default: withCtx(() => [
              createVNode(_component_toggle, {
                label: "Controls visible?",
                modelValue: _ctx.showControls,
                "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => _ctx.showControls = $event)
              }, null, 8, ["modelValue"]),
              createVNode(_component_toggle, {
                label: "Able to skip?",
                modelValue: _ctx.allowSkipping,
                "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => _ctx.allowSkipping = $event)
              }, null, 8, ["modelValue"]),
              createVNode(_component_toggle, {
                label: "Continue arrow?",
                modelValue: _ctx.showContinueArrow,
                "onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => _ctx.showContinueArrow = $event)
              }, null, 8, ["modelValue"]),
              _ctx.customizable ? (openBlock(), createElementBlock("table", _hoisted_18$3, [
                createBaseVNode("tr", null, [
                  _hoisted_19$3,
                  createBaseVNode("td", null, [
                    withDirectives(createBaseVNode("input", {
                      id: "custom_namebox_width",
                      type: "number",
                      style: { "width": "48px" },
                      placeholder: _ctx.nameboxWidthDefault,
                      "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => _ctx.customNameboxWidth = $event),
                      disabled: _ctx.overrideColor,
                      onKeydown: _cache[17] || (_cache[17] = withModifiers(() => {
                      }, ["stop"]))
                    }, null, 40, _hoisted_20$3), [
                      [
                        vModelText,
                        _ctx.customNameboxWidth,
                        void 0,
                        { number: true }
                      ]
                    ])
                  ])
                ]),
                createBaseVNode("tr", null, [
                  createBaseVNode("td", _hoisted_21$3, [
                    createVNode(_component_toggle, {
                      modelValue: _ctx.overrideColor,
                      "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => _ctx.overrideColor = $event),
                      label: "Override color"
                    }, null, 8, ["modelValue"])
                  ])
                ]),
                _ctx.overrideColor ? (openBlock(), createElementBlock("tr", _hoisted_22$3, [
                  _hoisted_23$3,
                  createBaseVNode("td", null, [
                    createBaseVNode("button", {
                      id: "textbox_color",
                      class: "color-button",
                      style: normalizeStyle$1({ background: _ctx.object.customColor }),
                      onClick: _cache[19] || (_cache[19] = ($event) => _ctx.colorSelect = "base")
                    }, null, 4)
                  ])
                ])) : createCommentVNode("", true),
                _ctx.overrideColor ? (openBlock(), createElementBlock("tr", _hoisted_24$2, [
                  createBaseVNode("td", _hoisted_25$1, [
                    createVNode(_component_toggle, {
                      id: "derive_custom_colors",
                      modelValue: _ctx.deriveCustomColors,
                      "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => _ctx.deriveCustomColors = $event),
                      label: "Derive other colors"
                    }, null, 8, ["modelValue"])
                  ])
                ])) : createCommentVNode("", true),
                _ctx.overrideColor && !_ctx.deriveCustomColors ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
                  createBaseVNode("tr", null, [
                    _hoisted_26$1,
                    createBaseVNode("td", null, [
                      createBaseVNode("button", {
                        id: "custom_controls_color",
                        class: "color-button",
                        style: normalizeStyle$1({ background: _ctx.object.customControlsColor }),
                        onClick: _cache[21] || (_cache[21] = ($event) => _ctx.colorSelect = "controls")
                      }, null, 4)
                    ])
                  ]),
                  createBaseVNode("tr", null, [
                    _hoisted_27$1,
                    createBaseVNode("td", null, [
                      createBaseVNode("button", {
                        id: "custom_namebox_color",
                        class: "color-button",
                        style: normalizeStyle$1({ background: _ctx.object.customNameboxColor }),
                        onClick: _cache[22] || (_cache[22] = ($event) => _ctx.colorSelect = "namebox")
                      }, null, 4)
                    ])
                  ]),
                  createBaseVNode("tr", null, [
                    _hoisted_28$1,
                    createBaseVNode("td", null, [
                      createBaseVNode("button", {
                        id: "custom_namebox_stroke",
                        class: "color-button",
                        style: normalizeStyle$1({ background: _ctx.object.customNameboxStroke }),
                        onClick: _cache[23] || (_cache[23] = ($event) => _ctx.colorSelect = "nameboxStroke")
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
      createBaseVNode("button", {
        onClick: _cache[24] || (_cache[24] = (...args) => _ctx.resetPosition && _ctx.resetPosition(...args))
      }, "Reset position"),
      createBaseVNode("button", {
        onClick: _cache[25] || (_cache[25] = (...args) => _ctx.splitTextbox && _ctx.splitTextbox(...args))
      }, "Split textbox")
    ]),
    _: 1
  }, 8, ["object", "textHandler", "colorHandler"]);
}
const TextBoxPanel = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$c], ["__scopeId", "data-v-95864fe4"]]);
const setable = genericSetable();
const _sfc_main$b = defineComponent({
  mixins: [PanelMixin],
  components: {
    Toggle: ToggleBox,
    DFieldset,
    DFlow,
    ObjectTool
  },
  data: () => ({
    currentIdx: 0,
    textEditor: false
  }),
  computed: {
    currentPanel() {
      return this.$store.state.panels.panels[this.$store.state.panels.currentPanel];
    },
    object() {
      const obj = this.currentPanel.objects[this.$store.state.ui.selection];
      if (obj.type !== "choice")
        return void 0;
      return obj;
    },
    autoWrap: setable("autoWrap", "panels/setAutoWrapping"),
    buttonText: simpleButtonSettable("text"),
    buttons() {
      return this.object.choices;
    },
    textHandler() {
      if (!this.textEditor)
        return void 0;
      return {
        title: "Text",
        get: () => {
          return this.buttonText;
        },
        set: (text) => {
          this.buttonText = text;
        },
        leave: () => {
          this.textEditor = false;
        }
      };
    }
  },
  methods: {
    select(idx) {
      this.currentIdx = idx;
    },
    addChoice() {
      this.vuexHistory.transaction(() => {
        this.$store.dispatch("panels/addChoice", {
          id: this.object.id,
          panelId: this.object.panelId,
          text: ""
        });
      });
    },
    removeChoice() {
      this.vuexHistory.transaction(() => {
        if (this.currentIdx === this.object.choices.length - 1 && this.currentIdx > 0) {
          this.select(this.currentIdx - 1);
        }
        this.$store.dispatch("panels/removeChoice", {
          id: this.object.id,
          panelId: this.object.panelId,
          choiceIdx: this.currentIdx
        });
      });
    }
  }
});
function simpleButtonSettable(key) {
  return {
    get() {
      return this.object.choices[this.currentIdx][key];
    },
    set(val) {
      this.vuexHistory.transaction(() => {
        this.$store.commit("panels/setChoiceProperty", {
          id: this.object.id,
          panelId: this.object.panelId,
          choiceIdx: this.currentIdx,
          key,
          value: val
        });
      });
    }
  };
}
const choice_vue_vue_type_style_index_0_scoped_60e50bc5_lang = "";
const _withScopeId$6 = (n) => (pushScopeId("data-v-60e50bc5"), n = n(), popScopeId(), n);
const _hoisted_1$b = ["onClick"];
const _hoisted_2$9 = /* @__PURE__ */ _withScopeId$6(() => /* @__PURE__ */ createBaseVNode("tr", null, [
  /* @__PURE__ */ createBaseVNode("td", { colspan: "2" }, [
    /* @__PURE__ */ createBaseVNode("label", { for: "choice-button-input" }, "Text")
  ])
], -1));
function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_d_flow = resolveComponent("d-flow");
  const _component_d_fieldset = resolveComponent("d-fieldset");
  const _component_toggle = resolveComponent("toggle");
  const _component_object_tool = resolveComponent("object-tool");
  return openBlock(), createBlock(_component_object_tool, {
    object: _ctx.object,
    title: "Choice",
    textHandler: _ctx.textHandler
  }, {
    default: withCtx(() => [
      createVNode(_component_d_fieldset, {
        class: "buttons",
        title: "Buttons:"
      }, {
        default: withCtx(() => [
          createVNode(_component_d_flow, {
            maxSize: "100%",
            direction: "vertical",
            noWraping: ""
          }, {
            default: withCtx(() => [
              (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.buttons, (button, btnIdx) => {
                return openBlock(), createElementBlock("div", {
                  class: normalizeClass({ choiceBtn: true, active: btnIdx === _ctx.currentIdx }),
                  key: btnIdx,
                  onClick: ($event) => _ctx.select(btnIdx)
                }, toDisplayString(button.text.trim() === "" ? "[Empty]" : button.text), 11, _hoisted_1$b);
              }), 128))
            ]),
            _: 1
          })
        ]),
        _: 1
      }),
      createVNode(_component_d_fieldset, {
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
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.buttonText = $event),
                  onKeydown: _cache[1] || (_cache[1] = withModifiers(() => {
                  }, ["stop"]))
                }, null, 544), [
                  [vModelText, _ctx.buttonText]
                ])
              ]),
              createBaseVNode("td", null, [
                createBaseVNode("button", {
                  onClick: _cache[2] || (_cache[2] = ($event) => _ctx.textEditor = true)
                }, "...")
              ])
            ])
          ])
        ]),
        _: 1
      }),
      createBaseVNode("button", {
        onClick: _cache[3] || (_cache[3] = (...args) => _ctx.addChoice && _ctx.addChoice(...args))
      }, "Add"),
      createBaseVNode("button", {
        onClick: _cache[4] || (_cache[4] = (...args) => _ctx.removeChoice && _ctx.removeChoice(...args))
      }, "Remove"),
      createVNode(_component_toggle, {
        label: "Auto line wrap?",
        modelValue: _ctx.autoWrap,
        "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => _ctx.autoWrap = $event)
      }, null, 8, ["modelValue"])
    ]),
    _: 1
  }, 8, ["object", "textHandler"]);
}
const ChoicePanel = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$b], ["__scopeId", "data-v-60e50bc5"]]);
const _sfc_main$a = defineComponent({
  mixins: [PanelMixin],
  components: { L }
});
const credits_vue_vue_type_style_index_0_scoped_8073b468_lang = "";
const _withScopeId$5 = (n) => (pushScopeId("data-v-8073b468"), n = n(), popScopeId(), n);
const _hoisted_1$a = { class: "panel" };
const _hoisted_2$8 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("h1", null, "Help and Credits", -1));
const _hoisted_3$7 = /* @__PURE__ */ createTextVNode("Help");
const _hoisted_4$6 = /* @__PURE__ */ createTextVNode("Fork me on GitHub");
const _hoisted_5$4 = /* @__PURE__ */ createTextVNode("Privacy Statement");
const _hoisted_6$4 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, " All assets used are IP of Team Salvato and created by them, unless noted otherwise. ", -1));
const _hoisted_7$4 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, [
  /* @__PURE__ */ createTextVNode(" Doki Doki Dialog Generator developed by EDave64 "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode("Based on gemdude46's DDLC Shitpost generator ")
], -1));
const _hoisted_8$3 = /* @__PURE__ */ createTextVNode(" Unused House Background by ");
const _hoisted_9$3 = /* @__PURE__ */ createTextVNode(" Fatelogic ");
const _hoisted_10$3 = /* @__PURE__ */ createTextVNode(" Aller Font by ");
const _hoisted_11$3 = /* @__PURE__ */ createTextVNode("Dalton Maag Ltd");
const _hoisted_12$3 = /* @__PURE__ */ createTextVNode(" Riffic Bold Font by ");
const _hoisted_13$3 = /* @__PURE__ */ createTextVNode("InkyType");
const _hoisted_14$2 = /* @__PURE__ */ createTextVNode(" Verily Serif Mono Font by ");
const _hoisted_15$2 = /* @__PURE__ */ createTextVNode("Stephen G. Hartke");
const _hoisted_16$2 = /* @__PURE__ */ createTextVNode(" F25 Bank Printer Font by ");
const _hoisted_17$2 = /* @__PURE__ */ createTextVNode("F25 Digital Typeface Design");
const _hoisted_18$2 = /* @__PURE__ */ createTextVNode(" Journal Font by ");
const _hoisted_19$2 = /* @__PURE__ */ createTextVNode("Fontourist");
const _hoisted_20$2 = /* @__PURE__ */ createTextVNode(" Hashtag Font by ");
const _hoisted_21$2 = /* @__PURE__ */ createTextVNode(" TitanVex");
const _hoisted_22$2 = /* @__PURE__ */ createTextVNode(" JP Hand Slanted Font by ");
const _hoisted_23$2 = /* @__PURE__ */ createTextVNode("Jonathan Paterson");
const _hoisted_24$1 = /* @__PURE__ */ createTextVNode(" As I Lay Dying Font by ");
const _hoisted_25 = /* @__PURE__ */ createTextVNode("Moises Esqueda");
const _hoisted_26 = /* @__PURE__ */ createTextVNode(" Damagrafik Script Font by ");
const _hoisted_27 = /* @__PURE__ */ createTextVNode("Davide Terenzi");
const _hoisted_28 = /* @__PURE__ */ createTextVNode(" Ammy's Handwriting Font by ");
const _hoisted_29 = /* @__PURE__ */ createTextVNode("Ammy K.");
const _hoisted_30 = /* @__PURE__ */ createTextVNode(" Halogen Font by ");
const _hoisted_31 = /* @__PURE__ */ createTextVNode("JLH Fonts");
const _hoisted_32 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, [
  /* @__PURE__ */ createTextVNode(" MC Sprite by Childish-N "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode("MC Casual Sprite by SlightlySimple "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode("MC Chibi by SlightlySimple ")
], -1));
const _hoisted_33 = /* @__PURE__ */ createTextVNode("Concept MC");
const _hoisted_34 = /* @__PURE__ */ createTextVNode(" by StormBlazed76, ");
const _hoisted_35 = /* @__PURE__ */ createTextVNode("red");
const _hoisted_36 = /* @__PURE__ */ createTextVNode(" and ");
const _hoisted_37 = /* @__PURE__ */ createTextVNode("yellow");
const _hoisted_38 = /* @__PURE__ */ createTextVNode(" eyes by YinuS_WinneR, ");
const _hoisted_39 = /* @__PURE__ */ createTextVNode("chibi");
const _hoisted_40 = /* @__PURE__ */ createTextVNode(" by Hadrosaur838 ");
const _hoisted_41 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, [
  /* @__PURE__ */ createTextVNode(" MC Chad Sprite by Cylent-Nite "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode("MC Chad Poses and expressions by SlightlySimple "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode("MC Chad Poses and chibi by Meddy-sin ")
], -1));
const _hoisted_42 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, [
  /* @__PURE__ */ createTextVNode(" FeMC Sprite by Meddy-sin "),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode("FeMC Casual Sprite by SlightlySimple ")
], -1));
const _hoisted_43 = /* @__PURE__ */ createTextVNode("Concept FeMC");
const _hoisted_44 = /* @__PURE__ */ createTextVNode(" by ShidoDraws, ");
const _hoisted_45 = /* @__PURE__ */ createTextVNode("additional poses, expressions and chibi");
const _hoisted_46 = /* @__PURE__ */ createTextVNode(" by SlightlySimple ");
const _hoisted_47 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, "Amy Sprite by Meddy-sin and SlightlySimple", -1));
const _hoisted_48 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, "Special thanks to SlightlySimple for testing and technical help", -1));
const _hoisted_49 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createBaseVNode("p", null, " Atlas421, T-Rex Harris, smearglexd and Tactical Cupcakes for suggestions and testing ", -1));
function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_l = resolveComponent("l");
  return openBlock(), createElementBlock("div", _hoisted_1$a, [
    _hoisted_2$8,
    createVNode(_component_l, {
      class: "btn",
      to: "wiki://Dokumentation"
    }, {
      default: withCtx(() => [
        _hoisted_3$7
      ]),
      _: 1
    }),
    createVNode(_component_l, {
      class: "btn",
      to: "github://"
    }, {
      default: withCtx(() => [
        _hoisted_4$6
      ]),
      _: 1
    }),
    createVNode(_component_l, {
      class: "btn",
      to: "wiki://Privacy Statement"
    }, {
      default: withCtx(() => [
        _hoisted_5$4
      ]),
      _: 1
    }),
    _hoisted_6$4,
    _hoisted_7$4,
    createBaseVNode("p", null, [
      _hoisted_8$3,
      createVNode(_component_l, { to: "https://www.deviantart.com/fatelogic/art/VN-Background-Practice-295671161" }, {
        default: withCtx(() => [
          _hoisted_9$3
        ]),
        _: 1
      })
    ]),
    createBaseVNode("p", null, [
      _hoisted_10$3,
      createVNode(_component_l, { to: "https://www.daltonmaag.com/library/aller" }, {
        default: withCtx(() => [
          _hoisted_11$3
        ]),
        _: 1
      })
    ]),
    createBaseVNode("p", null, [
      _hoisted_12$3,
      createVNode(_component_l, { to: "https://www.fontspring.com/fonts/inky-type/riffic" }, {
        default: withCtx(() => [
          _hoisted_13$3
        ]),
        _: 1
      })
    ]),
    createBaseVNode("p", null, [
      _hoisted_14$2,
      createVNode(_component_l, { to: "https://www.dafont.com/verily-serif-mono.font" }, {
        default: withCtx(() => [
          _hoisted_15$2
        ]),
        _: 1
      })
    ]),
    createBaseVNode("p", null, [
      _hoisted_16$2,
      createVNode(_component_l, { to: "https://www.dafont.com/f25-bank-printer.font" }, {
        default: withCtx(() => [
          _hoisted_17$2
        ]),
        _: 1
      })
    ]),
    createBaseVNode("p", null, [
      _hoisted_18$2,
      createVNode(_component_l, { to: "https://www.dafont.com/journal.font" }, {
        default: withCtx(() => [
          _hoisted_19$2
        ]),
        _: 1
      })
    ]),
    createBaseVNode("p", null, [
      _hoisted_20$2,
      createVNode(_component_l, { to: "https://www.dafont.com/hashtag.font" }, {
        default: withCtx(() => [
          _hoisted_21$2
        ]),
        _: 1
      })
    ]),
    createBaseVNode("p", null, [
      _hoisted_22$2,
      createVNode(_component_l, { to: "https://www.dafont.com/jp-hand-slanted.font" }, {
        default: withCtx(() => [
          _hoisted_23$2
        ]),
        _: 1
      })
    ]),
    createBaseVNode("p", null, [
      _hoisted_24$1,
      createVNode(_component_l, { to: "https://www.dafont.com/as-i-lay-dying.font" }, {
        default: withCtx(() => [
          _hoisted_25
        ]),
        _: 1
      })
    ]),
    createBaseVNode("p", null, [
      _hoisted_26,
      createVNode(_component_l, { to: "https://www.dafont.com/damagrafik-script.font" }, {
        default: withCtx(() => [
          _hoisted_27
        ]),
        _: 1
      })
    ]),
    createBaseVNode("p", null, [
      _hoisted_28,
      createVNode(_component_l, { to: "https://www.dafont.com/ammys-handwriting.font" }, {
        default: withCtx(() => [
          _hoisted_29
        ]),
        _: 1
      })
    ]),
    createBaseVNode("p", null, [
      _hoisted_30,
      createVNode(_component_l, { to: "https://www.dafont.com/halogen.font" }, {
        default: withCtx(() => [
          _hoisted_31
        ]),
        _: 1
      })
    ]),
    _hoisted_32,
    createBaseVNode("p", null, [
      createVNode(_component_l, { to: "https://www.reddit.com/ofkg59" }, {
        default: withCtx(() => [
          _hoisted_33
        ]),
        _: 1
      }),
      _hoisted_34,
      createVNode(_component_l, { to: "https://www.reddit.com/og6shh" }, {
        default: withCtx(() => [
          _hoisted_35
        ]),
        _: 1
      }),
      _hoisted_36,
      createVNode(_component_l, { to: "https://www.reddit.com/oft3vb" }, {
        default: withCtx(() => [
          _hoisted_37
        ]),
        _: 1
      }),
      _hoisted_38,
      createVNode(_component_l, { to: "https://www.reddit.com/ofof3o" }, {
        default: withCtx(() => [
          _hoisted_39
        ]),
        _: 1
      }),
      _hoisted_40
    ]),
    _hoisted_41,
    _hoisted_42,
    createBaseVNode("p", null, [
      createVNode(_component_l, { to: "https://www.reddit.com/oizaow" }, {
        default: withCtx(() => [
          _hoisted_43
        ]),
        _: 1
      }),
      _hoisted_44,
      createVNode(_component_l, { to: "https://www.reddit.com/oosuxu" }, {
        default: withCtx(() => [
          _hoisted_45
        ]),
        _: 1
      }),
      _hoisted_46
    ]),
    _hoisted_47,
    _hoisted_48,
    _hoisted_49
  ]);
}
const CreditsPanel = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$a], ["__scopeId", "data-v-8073b468"]]);
const _sfc_main$9 = defineComponent({
  props: {
    backgroundId: {
      type: String,
      required: true
    }
  },
  data: () => ({
    isWebPSupported: null,
    assets: []
  }),
  computed: {
    background() {
      const currentPanel = this.$store.state.panels.currentPanel;
      return this.$store.state.panels.panels[currentPanel].background;
    },
    bgData() {
      const backgrounds = this.$store.getters["content/getBackgrounds"];
      return backgrounds.get(this.backgroundId) || null;
    },
    isActive() {
      return this.backgroundId === this.background.current;
    },
    title() {
      var _a;
      switch (this.backgroundId) {
        case "buildin.static-color":
          return "Static color";
        case "buildin.transparent":
          return "Transparent";
      }
      return (_a = this.bgData.label) != null ? _a : "";
    },
    style() {
      var _a;
      switch (this.backgroundId) {
        case "buildin.static-color":
          return {
            "background-color": this.background.color
          };
        case "buildin.transparent":
          return {};
      }
      const urls = (_a = this.bgData) == null ? void 0 : _a.variants[0].map((img) => `url('${getAAssetUrl(img, false)}')`).join(",");
      return {
        backgroundImage: urls != null ? urls : ""
      };
    }
  }
});
const button_vue_vue_type_style_index_0_scoped_e727d6d8_lang = "";
const _hoisted_1$9 = ["title"];
function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", {
    class: normalizeClass({ background: true, active: _ctx.isActive }),
    title: _ctx.title,
    style: normalizeStyle$1(_ctx.style),
    tabindex: "0",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("input", _ctx.backgroundId)),
    onKeydown: [
      _cache[1] || (_cache[1] = withKeys(($event) => _ctx.$emit("input", _ctx.backgroundId), ["enter"])),
      _cache[2] || (_cache[2] = withKeys(withModifiers(($event) => _ctx.$emit("input", _ctx.backgroundId), ["prevent"]), ["space"]))
    ]
  }, toDisplayString(_ctx.title), 47, _hoisted_1$9);
}
const BackgroundButton = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$9], ["__scopeId", "data-v-e727d6d8"]]);
const _sfc_main$8 = defineComponent({
  components: { Toggle: ToggleBox, DFieldset },
  computed: {
    vertical() {
      return this.$store.state.ui.vertical;
    },
    color: {
      get() {
        return this.background.color;
      },
      set(color2) {
        this.vuexHistory.transaction(() => {
          this.$store.commit("panels/setBackgroundColor", {
            color: color2,
            panelId: this.$store.state.panels.currentPanel
          });
        });
      }
    },
    flipped: {
      get() {
        return this.background.flipped;
      },
      set(flipped) {
        this.vuexHistory.transaction(() => {
          this.$store.commit("panels/setBackgroundFlipped", {
            flipped,
            panelId: this.$store.state.panels.currentPanel
          });
        });
      }
    },
    scaling: {
      get() {
        return this.background.scaling.toString();
      },
      set(scaling) {
        this.vuexHistory.transaction(() => {
          this.$store.commit("panels/setBackgroundScaling", {
            scaling: parseInt(scaling, 10),
            panelId: this.$store.state.panels.currentPanel
          });
        });
      }
    },
    currentBackgroundId() {
      return this.background.current;
    },
    background() {
      const currentPanel = this.$store.state.panels.currentPanel;
      return this.$store.state.panels.panels[currentPanel].background;
    },
    bgData() {
      return this.$store.state.content.current.backgrounds.find(
        (background) => background.id === this.currentBackgroundId
      ) || null;
    },
    isColor() {
      return this.currentBackgroundId === "buildin.static-color";
    },
    isVariant() {
      return !!this.bgData;
    },
    hasVariants() {
      return this.bgData ? this.bgData.variants.length > 1 : false;
    }
  },
  methods: {
    seekVariant(delta) {
      this.vuexHistory.transaction(() => {
        this.$store.dispatch("panels/seekBackgroundVariant", {
          delta,
          panelId: this.$store.state.panels.currentPanel
        });
      });
    }
  }
});
const settings_vue_vue_type_style_index_0_scoped_c3bc3296_lang = "";
const _withScopeId$4 = (n) => (pushScopeId("data-v-c3bc3296"), n = n(), popScopeId(), n);
const _hoisted_1$8 = /* @__PURE__ */ _withScopeId$4(() => /* @__PURE__ */ createBaseVNode("label", { for: "bg_color" }, "Color:", -1));
const _hoisted_2$7 = { key: 1 };
const _hoisted_3$6 = { colspan: "3" };
const _hoisted_4$5 = { key: 0 };
const _hoisted_5$3 = { class: "arrow-col" };
const _hoisted_6$3 = /* @__PURE__ */ _withScopeId$4(() => /* @__PURE__ */ createBaseVNode("td", { style: { "text-align": "center" } }, "Variant", -1));
const _hoisted_7$3 = { class: "arrow-col" };
const _hoisted_8$2 = { colspan: "3" };
const _hoisted_9$2 = /* @__PURE__ */ _withScopeId$4(() => /* @__PURE__ */ createBaseVNode("option", { value: "0" }, "None", -1));
const _hoisted_10$2 = /* @__PURE__ */ _withScopeId$4(() => /* @__PURE__ */ createBaseVNode("option", { value: "1" }, "Stretch", -1));
const _hoisted_11$2 = /* @__PURE__ */ _withScopeId$4(() => /* @__PURE__ */ createBaseVNode("option", { value: "2" }, "Cover", -1));
const _hoisted_12$2 = [
  _hoisted_9$2,
  _hoisted_10$2,
  _hoisted_11$2
];
const _hoisted_13$2 = { colspan: "3" };
function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_toggle = resolveComponent("toggle");
  const _component_d_fieldset = resolveComponent("d-fieldset");
  return openBlock(), createBlock(_component_d_fieldset, {
    class: normalizeClass({ "bg-settings": true, vertical: _ctx.vertical }),
    title: "Settings:"
  }, {
    default: withCtx(() => [
      _ctx.isColor ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
        _hoisted_1$8,
        createBaseVNode("button", {
          id: "bg_color",
          class: "color-button",
          style: normalizeStyle$1({ background: _ctx.color }),
          onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("change-color"))
        }, null, 4)
      ], 64)) : createCommentVNode("", true),
      _ctx.isVariant ? (openBlock(), createElementBlock("table", _hoisted_2$7, [
        createBaseVNode("tr", null, [
          createBaseVNode("td", _hoisted_3$6, [
            createVNode(_component_toggle, {
              modelValue: _ctx.flipped,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _ctx.flipped = $event),
              label: "Flipped?"
            }, null, 8, ["modelValue"])
          ])
        ]),
        _ctx.hasVariants ? (openBlock(), createElementBlock("tr", _hoisted_4$5, [
          createBaseVNode("td", _hoisted_5$3, [
            createBaseVNode("button", {
              class: "small-button",
              onClick: _cache[2] || (_cache[2] = ($event) => _ctx.seekVariant(-1))
            }, "<")
          ]),
          _hoisted_6$3,
          createBaseVNode("td", _hoisted_7$3, [
            createBaseVNode("button", {
              class: "small-button",
              onClick: _cache[3] || (_cache[3] = ($event) => _ctx.seekVariant(1))
            }, ">")
          ])
        ])) : createCommentVNode("", true),
        createBaseVNode("tr", null, [
          createBaseVNode("td", _hoisted_8$2, [
            withDirectives(createBaseVNode("select", {
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => _ctx.scaling = $event),
              onKeydown: _cache[5] || (_cache[5] = withModifiers(() => {
              }, ["stop"]))
            }, _hoisted_12$2, 544), [
              [vModelSelect, _ctx.scaling]
            ])
          ])
        ]),
        createBaseVNode("tr", null, [
          createBaseVNode("td", _hoisted_13$2, [
            createBaseVNode("button", {
              id: "image_options_button",
              onClick: _cache[6] || (_cache[6] = ($event) => _ctx.$emit("open-image-options"))
            }, " Image options ")
          ])
        ])
      ])) : createCommentVNode("", true)
    ]),
    _: 1
  }, 8, ["class"]);
}
const BackgroundSettings = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$8], ["__scopeId", "data-v-c3bc3296"]]);
var __defProp$f = Object.defineProperty;
var __defProps$8 = Object.defineProperties;
var __getOwnPropDescs$8 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$8 = Object.getOwnPropertySymbols;
var __hasOwnProp$8 = Object.prototype.hasOwnProperty;
var __propIsEnum$8 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$f = (obj, key, value) => key in obj ? __defProp$f(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$8 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$8.call(b, prop))
      __defNormalProp$f(a, prop, b[prop]);
  if (__getOwnPropSymbols$8)
    for (var prop of __getOwnPropSymbols$8(b)) {
      if (__propIsEnum$8.call(b, prop))
        __defNormalProp$f(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$8 = (a, b) => __defProps$8(a, __getOwnPropDescs$8(b));
var __async$e = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
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
const _sfc_main$7 = defineComponent({
  mixins: [PanelMixin],
  components: {
    BackgroundButton,
    BackgroundSettings,
    DropTarget,
    Color,
    ImageOptions,
    DButton
  },
  data: () => ({
    colorSelect: false,
    imageOptions: false
  }),
  computed: {
    bgColor: {
      get() {
        return this.$store.state.panels.panels[this.$store.state.panels.currentPanel].background.color;
      },
      set(color2) {
        this.vuexHistory.transaction(() => {
          this.$store.commit("panels/setBackgroundColor", {
            color: color2,
            panelId: this.$store.state.panels.currentPanel
          });
        });
      }
    },
    backgrounds() {
      return [
        ...this.$store.state.content.current.backgrounds.map(
          (background) => background.id
        ),
        "buildin.static-color",
        "buildin.transparent"
      ];
    },
    showBackgroundsFolder() {
      return envX.supports.openableFolders.has(
        "backgrounds"
      );
    }
  },
  methods: {
    setBackground(id) {
      this.$store.commit("panels/setCurrentBackground", {
        current: id,
        panelId: this.$store.state.panels.currentPanel
      });
    },
    onFileUpload(_e) {
      const uploadInput = this.$refs.upload;
      if (!uploadInput.files)
        return;
      for (const file of uploadInput.files) {
        this.addImageFile(file);
      }
    },
    addImageFile(file) {
      return __async$e(this, null, function* () {
        yield this.vuexHistory.transaction(() => __async$e(this, null, function* () {
          const url = URL.createObjectURL(file);
          const assetUrl = yield this.$store.dispatch("uploadUrls/add", {
            name: file.name,
            url
          });
          this.addNewCustomBackground(file.name, file.name, assetUrl);
        }));
      });
    },
    addByUrl() {
      const url = prompt("Enter the URL of the image");
      if (url == null)
        return;
      const lastSegment = url.split("/").slice(-1)[0];
      this.addNewCustomBackground(lastSegment, lastSegment, url);
    },
    addNewCustomBackground(id, label, url) {
      const old = this.$store.state.content.contentPacks.find(
        (x) => x.packId === uploadedBackgroundsPackDefaults.packId
      ) || uploadedBackgroundsPackDefaults;
      const newPackVersion = __spreadProps$8(__spreadValues$8({}, old), {
        backgrounds: [
          ...old.backgrounds,
          {
            id,
            label,
            variants: [[url]],
            scaling: "none"
          }
        ]
      });
      this.vuexHistory.transaction(() => {
        this.$store.dispatch("content/replaceContentPack", {
          contentPack: newPackVersion
        });
        this.setBackground(id);
      });
    },
    dragEnter(e) {
      if (!e.dataTransfer)
        return;
      e.dataTransfer.effectAllowed = "none";
      if (!Array.from(e.dataTransfer.items).find(
        (item) => item.type.match(/^image.*$/)
      )) {
        return;
      }
      e.dataTransfer.effectAllowed = "link";
      this.$refs.dt.show();
    },
    openBackgroundFolder() {
      envX.openFolder("backgrounds");
    }
  }
});
const backgrounds_vue_vue_type_style_index_0_scoped_dd870fc5_lang = "";
const _withScopeId$3 = (n) => (pushScopeId("data-v-dd870fc5"), n = n(), popScopeId(), n);
const _hoisted_1$7 = /* @__PURE__ */ createTextVNode("Drop here to add as a new background ");
const _hoisted_2$6 = /* @__PURE__ */ _withScopeId$3(() => /* @__PURE__ */ createBaseVNode("h1", null, "Background", -1));
const _hoisted_3$5 = /* @__PURE__ */ createTextVNode(" Upload ");
const _hoisted_4$4 = /* @__PURE__ */ _withScopeId$3(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "extension", -1));
const _hoisted_5$2 = /* @__PURE__ */ createTextVNode(" Search in content packs ");
const _hoisted_6$2 = [
  _hoisted_4$4,
  _hoisted_5$2
];
const _hoisted_7$2 = /* @__PURE__ */ createTextVNode(" Open backgrounds folder ");
function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_drop_target = resolveComponent("drop-target");
  const _component_color = resolveComponent("color");
  const _component_image_options = resolveComponent("image-options");
  const _component_background_settings = resolveComponent("background-settings");
  const _component_d_button = resolveComponent("d-button");
  const _component_background_button = resolveComponent("background-button");
  return openBlock(), createElementBlock("div", {
    class: "panel",
    onDragenter: _cache[9] || (_cache[9] = (...args) => _ctx.dragEnter && _ctx.dragEnter(...args)),
    onMouseleave: _cache[10] || (_cache[10] = ($event) => _ctx.$refs.dt.hide())
  }, [
    createVNode(_component_drop_target, {
      ref: "dt",
      class: "drop-target",
      onDrop: _ctx.addImageFile
    }, {
      default: withCtx(() => [
        _hoisted_1$7
      ]),
      _: 1
    }, 8, ["onDrop"]),
    _hoisted_2$6,
    _ctx.colorSelect ? (openBlock(), createBlock(_component_color, {
      key: 0,
      modelValue: _ctx.bgColor,
      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.bgColor = $event),
      onLeave: _cache[1] || (_cache[1] = ($event) => _ctx.colorSelect = false)
    }, null, 8, ["modelValue"])) : _ctx.imageOptions ? (openBlock(), createBlock(_component_image_options, {
      key: 1,
      type: "background",
      title: "",
      "panel-id": _ctx.$store.state.panels.currentPanel,
      "no-composition": "",
      onLeave: _cache[2] || (_cache[2] = ($event) => _ctx.imageOptions = false)
    }, null, 8, ["panel-id"])) : (openBlock(), createElementBlock(Fragment, { key: 2 }, [
      createVNode(_component_background_settings, {
        onChangeColor: _cache[3] || (_cache[3] = ($event) => _ctx.colorSelect = true),
        onOpenImageOptions: _cache[4] || (_cache[4] = ($event) => _ctx.imageOptions = true)
      }),
      createBaseVNode("button", {
        class: "btn upload-background",
        onClick: _cache[6] || (_cache[6] = ($event) => _ctx.$refs.upload.click())
      }, [
        _hoisted_3$5,
        createBaseVNode("input", {
          type: "file",
          ref: "upload",
          onChange: _cache[5] || (_cache[5] = (...args) => _ctx.onFileUpload && _ctx.onFileUpload(...args))
        }, null, 544)
      ]),
      createBaseVNode("button", {
        class: "upload-background",
        onClick: _cache[7] || (_cache[7] = (...args) => _ctx.addByUrl && _ctx.addByUrl(...args))
      }, "Add by URL"),
      createBaseVNode("button", {
        class: "upload-background",
        onClick: _cache[8] || (_cache[8] = ($event) => _ctx.$emit("show-dialog", "type: Backgrounds"))
      }, _hoisted_6$2),
      _ctx.showBackgroundsFolder ? (openBlock(), createBlock(_component_d_button, {
        key: 0,
        icon: "folder",
        class: "upload-background",
        onClick: _ctx.openBackgroundFolder
      }, {
        default: withCtx(() => [
          _hoisted_7$2
        ]),
        _: 1
      }, 8, ["onClick"])) : createCommentVNode("", true),
      (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.backgrounds, (background) => {
        return openBlock(), createBlock(_component_background_button, {
          key: background,
          backgroundId: background,
          onInput: ($event) => _ctx.setBackground(background)
        }, null, 8, ["backgroundId", "onInput"]);
      }), 128))
    ], 64))
  ], 32);
}
const BackgroundsPanel = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$7], ["__scopeId", "data-v-dd870fc5"]]);
var __defProp$e = Object.defineProperty;
var __defProps$7 = Object.defineProperties;
var __getOwnPropDescs$7 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$7 = Object.getOwnPropertySymbols;
var __hasOwnProp$7 = Object.prototype.hasOwnProperty;
var __propIsEnum$7 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$e = (obj, key, value) => key in obj ? __defProp$e(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$7 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$7.call(b, prop))
      __defNormalProp$e(a, prop, b[prop]);
  if (__getOwnPropSymbols$7)
    for (var prop of __getOwnPropSymbols$7(b)) {
      if (__propIsEnum$7.call(b, prop))
        __defNormalProp$e(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$7 = (a, b) => __defProps$7(a, __getOwnPropDescs$7(b));
var __async$d = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const spriteMutations = {};
const spriteActions = {
  createSprite(_0, _1) {
    return __async$d(this, arguments, function* ({ commit: commit2, rootState, state }, command) {
      const asset = yield getAAsset(command.assets[0], false);
      if (!(asset instanceof ImageAsset))
        return;
      const id = state.panels[command.panelId].lastObjId + 1;
      commit2("create", {
        object: __spreadProps$7(__spreadValues$7({}, baseProps()), {
          assets: command.assets,
          height: asset.height,
          width: asset.width,
          id,
          panelId: rootState.panels.currentPanel,
          onTop: false,
          preserveRatio: true,
          ratio: asset.width / asset.height,
          type: "sprite",
          y: 0,
          enlargeWhenTalking: rootState.ui.defaultCharacterTalkingZoom
        })
      });
      return id;
    });
  }
};
var __defProp$d = Object.defineProperty;
var __defProps$6 = Object.defineProperties;
var __getOwnPropDescs$6 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$6 = Object.getOwnPropertySymbols;
var __hasOwnProp$6 = Object.prototype.hasOwnProperty;
var __propIsEnum$6 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$d = (obj, key, value) => key in obj ? __defProp$d(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$6 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$6.call(b, prop))
      __defNormalProp$d(a, prop, b[prop]);
  if (__getOwnPropSymbols$6)
    for (var prop of __getOwnPropSymbols$6(b)) {
      if (__propIsEnum$6.call(b, prop))
        __defNormalProp$d(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$6 = (a, b) => __defProps$6(a, __getOwnPropDescs$6(b));
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
      object: __spreadProps$6(__spreadValues$6({}, baseProps()), {
        y: constants.Choices.ChoiceY,
        width: constants.Choices.ChoiceButtonWidth,
        height: 0,
        panelId: rootState.panels.currentPanel,
        id,
        onTop: true,
        autoWrap: true,
        type: "choice",
        preserveRatio: false,
        ratio: constants.TextBox.TextBoxWidth / constants.TextBox.TextBoxHeight,
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
var __defProp$c = Object.defineProperty;
var __defProps$5 = Object.defineProperties;
var __getOwnPropDescs$5 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$5 = Object.getOwnPropertySymbols;
var __hasOwnProp$5 = Object.prototype.hasOwnProperty;
var __propIsEnum$5 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$c = (obj, key, value) => key in obj ? __defProp$c(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$5 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$5.call(b, prop))
      __defNormalProp$c(a, prop, b[prop]);
  if (__getOwnPropSymbols$5)
    for (var prop of __getOwnPropSymbols$5(b)) {
      if (__propIsEnum$5.call(b, prop))
        __defNormalProp$c(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$5 = (a, b) => __defProps$5(a, __getOwnPropDescs$5(b));
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
      object: __spreadProps$5(__spreadValues$5({}, baseProps()), {
        y: constants.Base.screenHeight / 2,
        width: constants.Choices.ChoiceButtonWidth,
        height: 0,
        panelId: rootState.panels.currentPanel,
        autoWrap: false,
        id,
        onTop: true,
        type: "notification",
        preserveRatio: false,
        ratio: constants.TextBox.TextBoxWidth / constants.TextBox.TextBoxHeight,
        customColor: constants.Choices.ChoiceButtonColor,
        text: "Click here to edit notification",
        backdrop: true
      })
    });
    return id;
  }
};
var __defProp$b = Object.defineProperty;
var __defProps$4 = Object.defineProperties;
var __getOwnPropDescs$4 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$4 = Object.getOwnPropertySymbols;
var __hasOwnProp$4 = Object.prototype.hasOwnProperty;
var __propIsEnum$4 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$b = (obj, key, value) => key in obj ? __defProp$b(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$4 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$4.call(b, prop))
      __defNormalProp$b(a, prop, b[prop]);
  if (__getOwnPropSymbols$4)
    for (var prop of __getOwnPropSymbols$4(b)) {
      if (__propIsEnum$4.call(b, prop))
        __defNormalProp$b(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$4 = (a, b) => __defProps$4(a, __getOwnPropDescs$4(b));
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
        preserveRatio: false,
        autoWrap: true,
        ratio: constants.Poem.defaultPoemWidth / constants.Poem.defaultPoemHeight,
        background: constants.Poem.defaultPoemBackground,
        font: constants.Poem.defaultPoemStyle,
        text: "New poem\n\nClick here to edit poem",
        composite: "source-over",
        filters: [],
        label: null,
        textboxColor: null,
        enlargeWhenTalking: true,
        nameboxWidth: null,
        zoom: 1
      }
    });
    return id;
  },
  createConsole({ commit: commit2, rootState, state }, _command) {
    const constants = getConstants();
    const id = state.panels[_command.panelId].lastObjId + 1;
    commit2("create", {
      object: __spreadProps$4(__spreadValues$4({}, baseProps()), {
        subType: "console",
        x: constants.Poem.consoleWidth / 2,
        y: constants.Poem.consoleHeight / 2,
        width: constants.Poem.consoleWidth,
        height: constants.Poem.consoleHeight,
        panelId: rootState.panels.currentPanel,
        id,
        onTop: true,
        type: "poem",
        preserveRatio: false,
        ratio: constants.Poem.consoleWidth / constants.Poem.consoleHeight,
        background: constants.Poem.defaultConsoleBackground,
        font: constants.Poem.defaultConsoleStyle,
        text: "> _\n  \n  Console command\n  Click here to edit",
        autoWrap: true
      })
    });
    return id;
  }
};
var __defProp$a = Object.defineProperty;
var __defProps$3 = Object.defineProperties;
var __getOwnPropDescs$3 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$3 = Object.getOwnPropertySymbols;
var __hasOwnProp$3 = Object.prototype.hasOwnProperty;
var __propIsEnum$3 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$a = (obj, key, value) => key in obj ? __defProp$a(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$3 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$3.call(b, prop))
      __defNormalProp$a(a, prop, b[prop]);
  if (__getOwnPropSymbols$3)
    for (var prop of __getOwnPropSymbols$3(b)) {
      if (__propIsEnum$3.call(b, prop))
        __defNormalProp$a(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$3 = (a, b) => __defProps$3(a, __getOwnPropDescs$3(b));
const mutations = __spreadValues$3(__spreadValues$3(__spreadValues$3(__spreadValues$3(__spreadValues$3(__spreadValues$3({
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
    obj.x = command.x;
    obj.y = command.y;
  },
  setFlip(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.flip = command.flip;
  },
  setSize(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.width = command.width;
    obj.height = command.height;
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
  },
  setTextboxColor(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.textboxColor = command.textboxColor;
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
  setObjectZoom(state, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    obj.zoom = command.zoom;
    ++obj.version;
  }
}, spriteMutations), characterMutations), textBoxMutations), choiceMutations), notificationMutations), poemMutations);
const actions = __spreadValues$3(__spreadValues$3(__spreadValues$3(__spreadValues$3(__spreadValues$3(__spreadValues$3({
  removeObject({ state, commit: commit2, rootState }, command) {
    var _a;
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    if (rootState.ui.selection === command.id) {
      commit2("ui/setSelection", null, { root: true });
    }
    for (const key of [...panel.onTopOrder, ...panel.order]) {
      const otherObject = panel.objects[key];
      if (obj.id === key || otherObject.type !== "textBox")
        continue;
      if (otherObject.talkingObjId !== obj.id)
        continue;
      commit2("setTalkingOther", {
        id: otherObject.id,
        talkingOther: (_a = obj.label) != null ? _a : "",
        panelId: command.panelId
      });
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
  setWidth({ commit: commit2, state }, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    const height = !obj.preserveRatio ? obj.height : command.width / obj.ratio;
    commit2("setSize", {
      panelId: command.panelId,
      id: command.id,
      height,
      width: command.width
    });
  },
  setHeight({ commit: commit2, state }, command) {
    const panel = state.panels[command.panelId];
    const obj = panel.objects[command.id];
    const width = !obj.preserveRatio ? obj.width : command.height * obj.ratio;
    commit2("setSize", {
      panelId: command.panelId,
      id: command.id,
      height: command.height,
      width
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
        object: __spreadProps$3(__spreadValues$3({}, newObject), {
          id: transationTable.get(sourceId),
          panelId: targetPanelId
        })
      });
    }
  },
  copyObjectToClipboard({ commit: commit2, state }, { id, panelId }) {
    const oldObject = state.panels[panelId].objects[id];
    commit2("ui/setClipboard", JSON.stringify(oldObject), { root: true });
  },
  pasteObjectFromClipboard({ commit: commit2, state, rootState }) {
    if (rootState.ui.clipboard == null)
      return;
    const oldObject = JSON.parse(rootState.ui.clipboard);
    commit2("create", {
      object: __spreadProps$3(__spreadValues$3({}, oldObject), {
        id: state.panels[state.currentPanel].lastObjId + 1,
        panelId: state.currentPanel
      })
    });
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
var __defProp$9 = Object.defineProperty;
var __defProps$2 = Object.defineProperties;
var __getOwnPropDescs$2 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$2 = Object.getOwnPropertySymbols;
var __hasOwnProp$2 = Object.prototype.hasOwnProperty;
var __propIsEnum$2 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$9 = (obj, key, value) => key in obj ? __defProp$9(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$2 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$2.call(b, prop))
      __defNormalProp$9(a, prop, b[prop]);
  if (__getOwnPropSymbols$2)
    for (var prop of __getOwnPropSymbols$2(b)) {
      if (__propIsEnum$2.call(b, prop))
        __defNormalProp$9(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$2 = (a, b) => __defProps$2(a, __getOwnPropDescs$2(b));
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
  mutations: __spreadValues$2({
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
  actions: __spreadValues$2({
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
      }
      commit2("createPanel", {
        panel: __spreadProps$2(__spreadValues$2({}, newPanel), {
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
var __async$c = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class Background {
  constructor(id, assets, flip, scale, compositeMode, filters2) {
    this.id = id;
    this.assets = assets;
    this.flip = flip;
    this.scale = scale;
    this.compositeMode = compositeMode;
    this.filters = filters2;
  }
  render(rx) {
    return __async$c(this, null, function* () {
      const { screenWidth: screenWidth2, screenHeight: screenHeight2 } = getConstants().Base;
      const images = yield Promise.all(
        this.assets.map((asset) => getAAsset(asset, rx.hq))
      );
      for (const image of images) {
        let x = 0;
        let y = 0;
        let w = image.width;
        let h2 = image.height;
        switch (this.scale) {
          case ScalingModes.None:
            x = screenWidth2 / 2 - w / 2;
            y = screenHeight2 / 2 - h2 / 2;
            break;
          case ScalingModes.Stretch:
            w = screenWidth2;
            h2 = screenHeight2;
            break;
          case ScalingModes.Cover:
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
    return __async$c(this, null, function* () {
      const { screenWidth: screenWidth2, screenHeight: screenHeight2 } = getConstants().Base;
      rx.drawRect({
        x: 0,
        y: 0,
        w: screenWidth2,
        h: screenHeight2,
        fill: { style: this.color }
      });
    });
  }
};
var __defProp$8 = Object.defineProperty;
var __defNormalProp$8 = (obj, key, value) => key in obj ? __defProp$8(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$6 = (obj, key, value) => {
  __defNormalProp$8(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$b = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class AssetListRenderable extends OffscreenRenderable {
  constructor() {
    super(...arguments);
    __publicField$6(this, "refTextbox", null);
  }
  get canvasDrawWidth() {
    return this.width * this.objZoom;
  }
  get canvasDrawHeight() {
    return this.height * this.objZoom;
  }
  get canvasDrawPosX() {
    return this.x - this.width / 2 + (this.height - this.canvasDrawHeight) / 2;
  }
  get canvasDrawPosY() {
    return this.y + (this.height - this.canvasDrawHeight);
  }
  get allowSkippingLocalCanvas() {
    return false;
  }
  get objZoom() {
    const textboxZoom = this.obj.enlargeWhenTalking && this.refTextbox ? 1.05 : 1;
    return textboxZoom * this.obj.zoom;
  }
  getHitbox() {
    const base = super.getHitbox();
    const zoomWidthDelta = this.width * (this.objZoom - 1);
    const zoomHeightDelta = this.height * (this.objZoom - 1);
    return {
      x0: base.x0 - zoomWidthDelta / 2,
      x1: base.x1 + zoomWidthDelta / 2,
      y0: base.y0 - zoomHeightDelta,
      y1: base.y1
    };
  }
  updatedContent(_current, panelId) {
    const panel = _current.state.panels.panels[panelId];
    const inPanel = [...panel.order, ...panel.onTopOrder];
    this.refTextbox = null;
    for (const key of inPanel) {
      const obj = _current.state.panels.panels[panelId].objects[key];
      if (obj.type === "textBox" && obj.talkingObjId === this.obj.id) {
        this.refTextbox = obj;
        return;
      }
    }
  }
  renderLocal(rx) {
    return __async$b(this, null, function* () {
      const drawAssetsUnloaded = this.getAssetList();
      const loadedDraws = yield Promise.all(
        drawAssetsUnloaded.filter((drawAsset) => drawAsset.assets).map((drawAsset) => loadAssets(drawAsset, rx.hq))
      );
      for (const loadedDraw of loadedDraws) {
        for (const asset of loadedDraw.assets) {
          rx.drawImage({
            image: asset,
            composite: loadedDraw.composite,
            x: loadedDraw.offset[0],
            y: loadedDraw.offset[1]
          });
        }
      }
    });
  }
}
function loadAssets(unloaded, hq) {
  return __async$b(this, null, function* () {
    if ("loaded" in unloaded)
      return unloaded;
    return {
      loaded: true,
      offset: unloaded.offset,
      assets: yield Promise.all(
        unloaded.assets.map((asset) => getAAsset(asset, hq))
      ),
      composite: unloaded.composite
    };
  });
}
var __defProp$7 = Object.defineProperty;
var __defNormalProp$7 = (obj, key, value) => key in obj ? __defProp$7(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$5 = (obj, key, value) => {
  __defNormalProp$7(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$a = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class Sprite extends AssetListRenderable {
  constructor(obj) {
    super(obj);
    __publicField$5(this, "assets");
    __publicField$5(this, "ready", null);
    __publicField$5(this, "canvasHeight", 0);
    __publicField$5(this, "canvasWidth", 0);
    this.init();
  }
  get version() {
    return this.assets === null ? -1 : this.obj.version;
  }
  init() {
    return __async$a(this, null, function* () {
      let readyResolve;
      this.ready = new Promise((resolve2, _reject) => {
        readyResolve = resolve2;
      });
      const assets = yield Promise.all(
        this.obj.assets.map((asset) => getAAsset(asset))
      );
      let width = 0;
      let height = 0;
      for (const asset of assets) {
        if (asset.height > height)
          height = asset.height;
        if (asset.width > width)
          width = asset.width;
      }
      this.canvasWidth = width;
      this.canvasHeight = height;
      this.assets = [
        {
          loaded: true,
          assets,
          offset: [0, 0]
        }
      ];
      readyResolve();
    });
  }
  getAssetList() {
    var _a;
    return (_a = this.assets) != null ? _a : [];
  }
}
var __defProp$6 = Object.defineProperty;
var __defNormalProp$6 = (obj, key, value) => key in obj ? __defProp$6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$4 = (obj, key, value) => {
  __defNormalProp$6(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class Character extends AssetListRenderable {
  constructor(obj, data) {
    super(obj);
    this.data = data;
    __publicField$4(this, "scaleable", true);
  }
  updatedContent(store2, panelId) {
    super.updatedContent(store2, panelId);
    this.data = getData(store2, this.obj);
  }
  getAssetList() {
    const pose = getPose(this.data, this.obj);
    const currentHeads = getHeads(this.data, this.obj);
    const drawAssetsUnloaded = [];
    for (const renderCommand of pose.renderCommands) {
      switch (renderCommand.type) {
        case "head":
          drawAssetsUnloaded.push({
            offset: renderCommand.offset,
            composite: renderCommand.composite,
            assets: currentHeads ? currentHeads.variants[this.obj.posePositions.head || 0] : []
          });
          break;
        case "image":
          drawAssetsUnloaded.push({
            offset: renderCommand.offset,
            composite: renderCommand.composite,
            assets: renderCommand.images
          });
          break;
        case "pose-part":
          const posePosition = pose.positions[renderCommand.part];
          if (!posePosition || posePosition.length === 0) {
            break;
          }
          const partAssets = posePosition[this.obj.posePositions[renderCommand.part] || 0];
          if (!partAssets)
            break;
          drawAssetsUnloaded.push({
            offset: renderCommand.offset,
            composite: renderCommand.composite,
            assets: partAssets
          });
          break;
      }
    }
    return drawAssetsUnloaded;
  }
  get canvasHeight() {
    const pose = getPose(this.data, this.obj);
    return pose.size[1];
  }
  get canvasWidth() {
    const pose = getPose(this.data, this.obj);
    return pose.size[0];
  }
  get closeZoom() {
    let zoom = 1;
    if (this.obj.close)
      zoom *= 2;
    return zoom;
  }
  get width() {
    return this.obj.width * this.closeZoom;
  }
  get height() {
    return this.obj.height * this.closeZoom;
  }
}
var __defProp$5 = Object.defineProperty;
var __defNormalProp$5 = (obj, key, value) => key in obj ? __defProp$5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$3 = (obj, key, value) => {
  __defNormalProp$5(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$9 = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class Choice extends ScalingRenderable {
  constructor() {
    super(...arguments);
    __publicField$3(this, "_height", 0);
    __publicField$3(this, "choiceRenderers", []);
  }
  get height() {
    return this._height;
  }
  get centeredVertically() {
    return true;
  }
  draw(rx) {
    return __async$9(this, null, function* () {
      yield this.updateChoiceBounds();
      const constants = getConstants();
      const w = this.obj.width;
      const h2 = this.height;
      const w2 = w / 2;
      const baseX = this.flip ? constants.Base.screenWidth - this.obj.x : this.obj.x;
      const x = baseX - w2;
      let y = this.obj.y - h2 / 2;
      for (const choiceRenderer of this.choiceRenderers) {
        yield choiceRenderer.loadFonts();
        const height = choiceRenderer.getHeight(
          this.obj.autoWrap ? this.obj.width : 0
        );
        rx.drawRect({
          x,
          y,
          w,
          h: height + constants.Choices.ChoicePadding * 2,
          outline: {
            style: constants.Choices.ChoiceButtonBorderColor,
            width: constants.Choices.Outline
          },
          fill: {
            style: constants.Choices.ChoiceButtonColor
          }
        });
        choiceRenderer.fixAlignment(
          "center",
          x,
          x + w,
          y + constants.Choices.ChoiceSpacing * 1.25,
          this.obj.autoWrap ? w : 0
        );
        choiceRenderer.render(rx.fsCtx);
        y += height + constants.Choices.ChoicePadding * 2 + constants.Choices.ChoiceSpacing;
      }
    });
  }
  updateChoiceBounds() {
    return __async$9(this, null, function* () {
      const constants = getConstants();
      this.choiceRenderers = this.obj.choices.map(
        (choice) => new TextRenderer(choice.text || " ", constants.Choices.ChoiceTextStyle)
      );
      this._height = this.choiceRenderers.reduce(
        (acc, renderer2) => acc + renderer2.getHeight(this.obj.autoWrap ? this.obj.width : 0) + constants.Choices.ChoicePadding * 2,
        0
      ) + this.obj.choiceDistance * (this.obj.choices.length - 1);
    });
  }
}
var __defProp$4 = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __reflectGet = Reflect.get;
var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => {
  __defNormalProp$4(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __superGet = (cls, obj, key) => __reflectGet(__getProtoOf(cls), key, obj);
var __async$8 = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class Notification extends ScalingRenderable {
  constructor() {
    super(...arguments);
    __publicField$2(this, "_height", 0);
    __publicField$2(this, "_width", 0);
  }
  get height() {
    return this._height;
  }
  get width() {
    return this._width;
  }
  get centeredVertically() {
    return true;
  }
  get id() {
    return this.obj.id;
  }
  render(selected, rx, skipLocal) {
    return __async$8(this, null, function* () {
      const constants = getConstants();
      if (this.obj.backdrop) {
        rx.drawRect({
          x: 0,
          y: 0,
          w: constants.Base.screenWidth,
          h: constants.Base.screenHeight,
          fill: {
            style: getConstants().Notification.NotificationBackdropColor
          }
        });
      }
      yield __superGet(Notification.prototype, this, "render").call(this, selected, rx, skipLocal);
    });
  }
  draw(rx) {
    return __async$8(this, null, function* () {
      const constants = getConstants();
      const textRenderer = new TextRenderer(
        this.obj.text,
        constants.Notification.NotificationTextStyle
      );
      const buttonRenderer = new TextRenderer(
        "OK",
        constants.Notification.NotificationOkTextStyle
      );
      yield textRenderer.loadFonts();
      yield buttonRenderer.loadFonts();
      const lineWrap = this.obj.autoWrap ? this.obj.width - constants.Notification.NotificationPadding * 2 : 0;
      const textWidth = this.obj.autoWrap ? lineWrap : textRenderer.getWidth();
      const textHeight = textRenderer.getHeight(lineWrap);
      const buttonWidth = this.obj.autoWrap ? lineWrap : buttonRenderer.getWidth();
      const buttonHeight = buttonRenderer.getHeight(lineWrap);
      const w = this._width = Math.max(textWidth, buttonWidth) + constants.Notification.NotificationPadding * 2;
      const h2 = this._height = textHeight + constants.Notification.NotificationPadding * 2 + constants.Notification.NotificationSpacing + buttonHeight;
      const w2 = w / 2;
      const baseX = this.flip ? constants.Base.screenWidth - this.obj.x : this.obj.x;
      const x = baseX - w2;
      const y = this.obj.y - h2 / 2;
      rx.drawRect({
        x,
        y,
        w,
        h: h2,
        outline: {
          style: constants.Choices.ChoiceButtonBorderColor,
          width: 3
        },
        fill: {
          style: constants.Choices.ChoiceButtonColor
        }
      });
      textRenderer.fixAlignment(
        "center",
        x,
        x + w,
        y + constants.Notification.NotificationPadding * 1.5,
        lineWrap
      );
      textRenderer.render(rx.fsCtx);
      buttonRenderer.fixAlignment(
        "center",
        x,
        x + w,
        y + h2 - constants.Notification.NotificationPadding,
        lineWrap
      );
      buttonRenderer.render(rx.fsCtx);
    });
  }
}
var __defProp$3 = Object.defineProperty;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => {
  __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$7 = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
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
    __publicField$1(this, "_height", 0);
    __publicField$1(this, "_width", 0);
  }
  get height() {
    return this._height;
  }
  get width() {
    return this._width;
  }
  get centeredVertically() {
    return true;
  }
  draw(rx) {
    return __async$7(this, null, function* () {
      const constants = getConstants();
      const paper = constants.Poem.poemBackgrounds[this.obj.background];
      const flippedX = this.flip ? constants.Base.screenWidth - this.obj.x : this.obj.x;
      let y = this.obj.y;
      let x = flippedX + poemTopMargin;
      let padding = constants.Poem.poemPadding;
      let topPadding = constants.Poem.poemTopPadding;
      let lineWrapPadding = padding * 2;
      if (paper.file === "internal:console") {
        const h2 = this._height = this.obj.height;
        const w = this._width = this.obj.width;
        rx.drawRect({
          x: flippedX - w / 2,
          y: this.obj.y - h2 / 2,
          h: h2,
          w,
          fill: { style: constants.Poem.consoleBackgroundColor }
        });
        padding = consolePadding;
        topPadding = consoleTopPadding;
        lineWrapPadding = consoleLineWrapPadding;
      } else if (paper.file === "internal:transparent") {
        this._height = this.obj.height;
        this._width = this.obj.width;
      } else {
        const asset = yield getAssetByUrl(`assets/poemBackgrounds/${paper.file}`);
        rx.drawImage({
          image: asset,
          x: flippedX - asset.width / 2,
          y: this.obj.y - asset.height / 2
        });
        this._height = asset.height;
        this._width = asset.width;
      }
      y -= this.height / 2;
      x -= this.width / 2;
      const style = constants.Poem.poemTextStyles[this.obj.font];
      const render = new TextRenderer(this.obj.text, style);
      yield render.loadFonts();
      render.fixAlignment(
        "left",
        x + padding,
        x + padding,
        y + topPadding + padding,
        this.obj.autoWrap ? this.width - lineWrapPadding : 0
      );
      render.render(rx.fsCtx);
    });
  }
}
var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async$6 = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
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
    return this.getRenderObjects().filter((renderObject) => renderObject.hitTest(x, y)).map((renderObject) => renderObject.id);
  }
  renderCallback(skipLocalCanvases, rx) {
    return __async$6(this, null, function* () {
      var _a;
      if (this._disposed)
        throw new Error("Disposed scene-renderer called");
      rx.fsCtx.imageSmoothingEnabled = true;
      rx.fsCtx.imageSmoothingQuality = rx.hq ? "high" : "low";
      yield (_a = this.getBackgroundRenderer()) == null ? void 0 : _a.render(rx);
      const selection = this.store.state.ui.selection;
      for (const object of this.getRenderObjects()) {
        object.updatedContent(this.store, this.panelId);
        const selected = selection === object.id;
        const focusedObj = document.querySelector(_SceneRenderer.FocusProp);
        const focused = (focusedObj == null ? void 0 : focusedObj.getAttribute("data-obj-id")) === "" + object.id;
        yield object.render(
          (selected ? SelectedState.Selected : SelectedState.None) + (focused ? SelectedState.Focused : SelectedState.None),
          rx,
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
          case "character":
            const char = obj;
            renderObject = new Character(char, getData(this.store, char));
            break;
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
      default:
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
var __async$5 = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const estimateFactor = 1.5;
const thumbnailFactor = 1 / 4;
const thumbnailQuality = 0.5;
const qualityFactor = 100;
const defaultQuality = 90;
const qualityWarningThreshold = 70;
const _sfc_main$6 = defineComponent({
  mixins: [PanelMixin],
  components: { DFieldset, DFlow, DButton, ImageOptions },
  data: () => ({
    webpSupport: false,
    heifSupport: false,
    ppi: envX.supports.limitedCanvasSpace ? 10 : 0,
    pages: "",
    format: "image/png",
    quality: defaultQuality,
    imageOptions: false,
    thumbnailCtx: null
  }),
  computed: {
    currentPanel() {
      return this.$store.state.panels.panels[this.$store.state.panels.currentPanel];
    },
    isLossy() {
      return this.format !== "image/png";
    },
    canDeletePanel() {
      return this.panelButtons.length > 1;
    },
    panelButtons() {
      const panelOrder = this.$store.state.panels.panelOrder;
      return panelOrder.map((id) => {
        const panel = this.$store.state.panels.panels[id];
        const objectOrders = this.$store.state.panels.panels[id];
        const txtBox = [...objectOrders.order, ...objectOrders.onTopOrder].map((objId) => this.$store.state.panels.panels[id].objects[objId]).map(this.extractObjectText);
        return {
          id,
          image: panel.lastRender,
          text: txtBox.reduce(
            (acc, current) => acc.length > current.length ? acc : current,
            ""
          )
        };
      });
    },
    canMoveAhead() {
      const panelOrder = this.$store.state.panels.panelOrder;
      const idx = panelOrder.indexOf(this.currentPanel.id);
      return idx > 0;
    },
    canMoveBehind() {
      const panelOrder = this.$store.state.panels.panelOrder;
      const idx = panelOrder.indexOf(this.currentPanel.id);
      return idx < panelOrder.length - 1;
    }
  },
  created() {
    return __async$5(this, null, function* () {
      eventBus$1.subscribe(
        RenderUpdatedEvent,
        () => requestAnimationFrame(() => this.renderThumbnail())
      );
      const baseConst = getConstants().Base;
      const targetCanvas = makeCanvas();
      targetCanvas.width = baseConst.screenWidth * thumbnailFactor;
      targetCanvas.height = baseConst.screenHeight * thumbnailFactor;
      this.thumbnailCtx = markRaw(targetCanvas.getContext("2d"));
      [this.webpSupport, this.heifSupport] = yield Promise.all([
        isWebPSupported(),
        isHeifSupported()
      ]);
    });
  },
  mounted() {
    this.moveFocusToActivePanel();
    requestAnimationFrame(() => this.renderThumbnail().catch(() => {
    }));
  },
  unmounted() {
    disposeCanvas(this.thumbnailCtx.canvas);
  },
  methods: {
    download() {
      return __async$5(this, null, function* () {
        yield safeAsync("export image", () => __async$5(this, null, function* () {
          const distribution = this.getPanelDistibution();
          const date = new Date();
          const prefix = `cd-${[
            date.getFullYear(),
            `${date.getMonth() + 1}`.padStart(2, "0"),
            `${date.getDate()}`.padStart(2, "0"),
            `${date.getHours()}`.padStart(2, "0"),
            `${date.getMinutes()}`.padStart(2, "0"),
            `${date.getSeconds()}`.padStart(2, "0")
          ].join("-")}`;
          const extension = this.format.split("/")[1];
          const format = this.format;
          const quality = this.quality;
          yield this.renderObjects(
            distribution,
            true,
            (imageIdx, canvasEle) => __async$5(this, null, function* () {
              yield envX.saveToFile(
                canvasEle,
                `${prefix}_${imageIdx}.${extension}`,
                format,
                quality / qualityFactor
              );
            })
          );
        }));
      });
    },
    estimateExportSize() {
      return __async$5(this, null, function* () {
        const distribution = this.getPanelDistibution();
        const format = this.format || "image/png";
        const quality = this.quality || defaultQuality;
        const sizes = yield this.renderObjects(
          distribution,
          false,
          (imageIdx, canvasEle) => __async$5(this, null, function* () {
            return new Promise((resolve2, reject) => {
              canvasEle.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(`Image ${imageIdx + 1} could not be rendered.`);
                    return;
                  }
                  resolve2(blob.size);
                },
                format,
                quality / qualityFactor
              );
            });
          })
        );
        const readableSizes = sizes.map(
          (size2) => (size2 * estimateFactor / 1024 / 1024).toFixed(2) + "MiB"
        );
        const filePluralize = readableSizes.length > 1 ? "files" : "file";
        const itPluralize = readableSizes.length > 1 ? "These" : "It";
        const sizePluralize = readableSizes.length > 1 ? "sizes" : "size";
        eventBus$1.fire(
          new ShowMessageEvent(
            `This would export ${readableSizes.length} ${filePluralize}. ${itPluralize} would have the following (aproximate) ${sizePluralize}: ${readableSizes.join(
              ","
            )}`
          )
        );
      });
    },
    renderObjects(distribution, hq, mapper) {
      return __async$5(this, null, function* () {
        const baseConst = getConstants().Base;
        const ret = [];
        for (let imageIdx = 0; imageIdx < distribution.length; ++imageIdx) {
          const image = distribution[imageIdx];
          const targetCanvas = document.createElement("canvas");
          targetCanvas.width = baseConst.screenWidth;
          targetCanvas.height = baseConst.screenHeight * image.length;
          try {
            const context = targetCanvas.getContext("2d");
            for (let panelIdx = 0; panelIdx < image.length; ++panelIdx) {
              const panelId = image[panelIdx];
              const sceneRenderer = new SceneRenderer(
                this.$store,
                panelId,
                baseConst.screenWidth,
                baseConst.screenHeight
              );
              try {
                yield sceneRenderer.render(hq, false, true);
                sceneRenderer.paintOnto(context, {
                  x: 0,
                  y: baseConst.screenHeight * panelIdx,
                  w: baseConst.screenWidth,
                  h: baseConst.screenHeight
                });
              } finally {
                sceneRenderer.dispose();
              }
            }
            ret.push(yield mapper(imageIdx, targetCanvas));
          } finally {
            disposeCanvas(targetCanvas);
          }
        }
        return ret;
      });
    },
    getLimitedPanelList() {
      const max = this.$store.state.panels.panelOrder.length - 1;
      const min = 0;
      const parts = this.pages.split(",");
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
        return this.$store.state.panels.panelOrder;
      }
      return listedPages.sort((a, b) => a - b).filter((value, idx, ary) => ary[idx - 1] !== value).map((pageIdx) => this.$store.state.panels.panelOrder[pageIdx]);
    },
    getPanelDistibution() {
      const panelOrder = this.getLimitedPanelList();
      if (isNaN(this.ppi)) {
        this.ppi = 0;
      }
      if (this.ppi === 0)
        return [panelOrder];
      const images = [];
      for (let imageI = 0; imageI < panelOrder.length / this.ppi; ++imageI) {
        const sliceStart = imageI * this.ppi;
        const sliceEnd = sliceStart + this.ppi;
        images.push([...panelOrder.slice(sliceStart, sliceEnd)]);
      }
      return images;
    },
    moveFocusToActivePanel() {
      const active = this.$el.querySelector(".panel_button.active");
      if (active) {
        this.scrollIntoView(active);
      }
    },
    scrollIntoView(ele) {
      const parent = ele.parentElement.parentElement;
      if (this.$store.state.ui.vertical) {
        parent.scrollTop = ele.offsetTop - parent.clientHeight / 2;
        parent.scrollLeft = 0;
      } else {
        parent.scrollLeft = ele.offsetLeft - parent.clientWidth / 2;
        parent.scrollTop = 0;
      }
    },
    extractObjectText(obj) {
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
    },
    addNewPanel() {
      return __async$5(this, null, function* () {
        yield this.vuexHistory.transaction(() => __async$5(this, null, function* () {
          yield this.$store.dispatch("panels/duplicatePanel", {
            panelId: this.$store.state.panels.currentPanel
          });
        }));
        yield this.$nextTick();
        this.moveFocusToActivePanel();
      });
    },
    updateCurrentPanel(panelId) {
      this.vuexHistory.transaction(() => __async$5(this, null, function* () {
        this.$store.commit("panels/setCurrentPanel", {
          panelId
        });
      }));
      this.$nextTick(() => {
        this.moveFocusToActivePanel();
      });
    },
    deletePanel() {
      this.vuexHistory.transaction(() => __async$5(this, null, function* () {
        yield this.$store.dispatch("panels/delete", {
          panelId: this.$store.state.panels.currentPanel
        });
      }));
      this.$nextTick(() => {
        this.moveFocusToActivePanel();
      });
    },
    moveAhead() {
      this.vuexHistory.transaction(() => __async$5(this, null, function* () {
        yield this.$store.dispatch("panels/move", {
          panelId: this.currentPanel.id,
          delta: -1
        });
      }));
    },
    moveBehind() {
      this.vuexHistory.transaction(() => __async$5(this, null, function* () {
        yield this.$store.dispatch("panels/move", {
          panelId: this.currentPanel.id,
          delta: 1
        });
      }));
    },
    renderThumbnail() {
      return __async$5(this, null, function* () {
        yield safeAsync("render thumbnail", () => __async$5(this, null, function* () {
          const getMainSceneRenderer = window.getMainSceneRenderer;
          const sceneRenderer = getMainSceneRenderer && getMainSceneRenderer();
          if (!sceneRenderer)
            return;
          sceneRenderer.paintOnto(this.thumbnailCtx, {
            x: 0,
            y: 0,
            w: this.thumbnailCtx.canvas.width,
            h: this.thumbnailCtx.canvas.height
          });
          this.thumbnailCtx.canvas.toBlob(
            (blob) => {
              if (!blob)
                return;
              const url = URL.createObjectURL(blob);
              this.vuexHistory.transaction(() => {
                this.$store.commit("panels/setPanelPreview", {
                  panelId: this.$store.state.panels.currentPanel,
                  url
                });
              });
            },
            (yield isWebPSupported()) ? "image/webp" : "image/jpeg",
            thumbnailQuality
          );
        }));
      });
    },
    save() {
      return __async$5(this, null, function* () {
        const str = yield this.$store.dispatch("getSave", true);
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
        const filename = `${prefix}.dddg`;
        const a = document.createElement("a");
        const url = URL.createObjectURL(saveBlob);
        a.setAttribute("download", filename);
        a.setAttribute("href", url);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    },
    load() {
      return __async$5(this, null, function* () {
        yield this.vuexHistory.transaction(() => __async$5(this, null, function* () {
          const uploadInput = this.$refs.loadUpload;
          if (!uploadInput.files)
            return;
          eventBus$1.fire(new StateLoadingEvent());
          const data = yield blobToText(uploadInput.files[0]);
          yield this.$store.dispatch("loadSave", data);
        }));
        yield this.renderThumbnail();
      });
    }
  },
  watch: {
    quality(quality, oldQuality) {
      if (quality === 100) {
        eventBus$1.fire(
          new ShowMessageEvent(
            "Note: 100% quality on a lossy format is still not lossless! Select PNG if you want lossless compression."
          )
        );
        return;
      }
      if (oldQuality > qualityWarningThreshold && quality <= qualityWarningThreshold) {
        eventBus$1.fire(
          new ShowMessageEvent(
            "Note: A quality level below 70% might be very noticeable and impair legibility of text."
          )
        );
        return;
      }
    },
    ppi(ppi, oldppi) {
      if (!envX.supports.limitedCanvasSpace)
        return;
      if (oldppi <= 10 && ppi > 10 || ppi === 0 && this.panelButtons.length > 10) {
        eventBus$1.fire(
          new ShowMessageEvent(
            "Note: Safari has strict limitations on available memory. More images per panel can easily cause crashes."
          )
        );
        return;
      }
    }
  }
});
function blobToText(file) {
  return new Promise((resolve2, reject) => {
    const reader = new FileReader();
    reader.onload = function() {
      resolve2(reader.result);
    };
    reader.onerror = function(e) {
      reject(e);
    };
    reader.readAsText(file);
  });
}
const panels_vue_vue_type_style_index_0_scoped_9ef644f2_lang = "";
const _withScopeId$2 = (n) => (pushScopeId("data-v-9ef644f2"), n = n(), popScopeId(), n);
const _hoisted_1$6 = { class: "panel" };
const _hoisted_2$5 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("h1", null, "Panels", -1));
const _hoisted_3$4 = ["onClick", "onKeydown"];
const _hoisted_4$3 = { class: "panel_text" };
const _hoisted_5$1 = { class: "panel_nr" };
const _hoisted_6$1 = { class: "column" };
const _hoisted_7$1 = /* @__PURE__ */ createTextVNode(" Add new");
const _hoisted_8$1 = /* @__PURE__ */ createTextVNode(" Delete panel ");
const _hoisted_9$1 = /* @__PURE__ */ createTextVNode(" Move ahead ");
const _hoisted_10$1 = /* @__PURE__ */ createTextVNode(" Move behind ");
const _hoisted_11$1 = /* @__PURE__ */ createTextVNode(" Image options ");
const _hoisted_12$1 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "export_format" }, "Format")
], -1));
const _hoisted_13$1 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("option", { value: "image/png" }, "PNG (lossless)", -1));
const _hoisted_14$1 = {
  key: 0,
  value: "image/webp"
};
const _hoisted_15$1 = {
  key: 1,
  value: "image/heif"
};
const _hoisted_16$1 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("option", { value: "image/jpeg" }, "JPEG (lossy)", -1));
const _hoisted_17$1 = { key: 0 };
const _hoisted_18$1 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "export_quality" }, "Quality:")
], -1));
const _hoisted_19$1 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "export_ppi" }, [
    /* @__PURE__ */ createTextVNode(" Panels per image: "),
    /* @__PURE__ */ createBaseVNode("br"),
    /* @__PURE__ */ createBaseVNode("small", null, "(0 for one single image)")
  ])
], -1));
const _hoisted_20$1 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createBaseVNode("td", null, [
  /* @__PURE__ */ createBaseVNode("label", { for: "export_pages" }, [
    /* @__PURE__ */ createTextVNode(" Panels to export: "),
    /* @__PURE__ */ createBaseVNode("br"),
    /* @__PURE__ */ createBaseVNode("small", null, "(Leave empty for all)")
  ])
], -1));
const _hoisted_21$1 = /* @__PURE__ */ createTextVNode(" Download ");
const _hoisted_22$1 = { class: "column" };
const _hoisted_23$1 = /* @__PURE__ */ createTextVNode("Save");
const _hoisted_24 = /* @__PURE__ */ createTextVNode(" Load ");
function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_image_options = resolveComponent("image-options");
  const _component_d_flow = resolveComponent("d-flow");
  const _component_d_fieldset = resolveComponent("d-fieldset");
  const _component_d_button = resolveComponent("d-button");
  return openBlock(), createElementBlock("div", _hoisted_1$6, [
    _hoisted_2$5,
    _ctx.imageOptions ? (openBlock(), createBlock(_component_image_options, {
      key: 0,
      type: "panel",
      title: "",
      "panel-id": _ctx.currentPanel.id,
      "no-composition": "",
      onLeave: _cache[0] || (_cache[0] = ($event) => {
        _ctx.imageOptions = false;
        _ctx.renderThumbnail();
      })
    }, null, 8, ["panel-id"])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
      createVNode(_component_d_fieldset, {
        class: "existing_panels_fieldset",
        title: "Existing Panels"
      }, {
        default: withCtx(() => [
          createVNode(_component_d_flow, {
            "no-wraping": "",
            maxSize: "350px"
          }, {
            default: withCtx(() => [
              (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.panelButtons, (panel, idx) => {
                return openBlock(), createElementBlock("div", {
                  key: panel.id,
                  class: normalizeClass({
                    panel_button: true,
                    active: panel.id === _ctx.currentPanel.id
                  }),
                  style: normalizeStyle$1(`background-image: url('${panel.image}')`),
                  tabindex: "0",
                  onClick: ($event) => _ctx.updateCurrentPanel(panel.id),
                  onKeydown: [
                    withKeys(($event) => _ctx.updateCurrentPanel(panel.id), ["enter"]),
                    withKeys(withModifiers(($event) => _ctx.updateCurrentPanel(panel.id), ["prevent"]), ["space"])
                  ]
                }, [
                  createBaseVNode("div", _hoisted_4$3, [
                    createBaseVNode("p", null, toDisplayString(panel.text), 1)
                  ]),
                  createBaseVNode("div", _hoisted_5$1, toDisplayString(idx + 1), 1)
                ], 46, _hoisted_3$4);
              }), 128))
            ]),
            _: 1
          })
        ]),
        _: 1
      }),
      createBaseVNode("div", _hoisted_6$1, [
        createVNode(_component_d_button, {
          icon: "add_to_queue",
          onClick: _ctx.addNewPanel
        }, {
          default: withCtx(() => [
            _hoisted_7$1
          ]),
          _: 1
        }, 8, ["onClick"]),
        createVNode(_component_d_button, {
          icon: "remove_from_queue",
          onClick: _ctx.deletePanel,
          disabled: !_ctx.canDeletePanel
        }, {
          default: withCtx(() => [
            _hoisted_8$1
          ]),
          _: 1
        }, 8, ["onClick", "disabled"]),
        createVNode(_component_d_button, {
          icon: "arrow_upward",
          onClick: _ctx.moveAhead,
          disabled: !_ctx.canMoveAhead
        }, {
          default: withCtx(() => [
            _hoisted_9$1
          ]),
          _: 1
        }, 8, ["onClick", "disabled"]),
        createVNode(_component_d_button, {
          icon: "arrow_downward",
          onClick: _ctx.moveBehind,
          disabled: !_ctx.canMoveBehind
        }, {
          default: withCtx(() => [
            _hoisted_10$1
          ]),
          _: 1
        }, 8, ["onClick", "disabled"]),
        createVNode(_component_d_button, {
          icon: "color_lens",
          onClick: _cache[1] || (_cache[1] = ($event) => _ctx.imageOptions = true)
        }, {
          default: withCtx(() => [
            _hoisted_11$1
          ]),
          _: 1
        })
      ]),
      createVNode(_component_d_fieldset, { title: "Export" }, {
        default: withCtx(() => [
          createBaseVNode("table", null, [
            createBaseVNode("tr", null, [
              _hoisted_12$1,
              createBaseVNode("td", null, [
                withDirectives(createBaseVNode("select", {
                  id: "export_format",
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => _ctx.format = $event)
                }, [
                  _hoisted_13$1,
                  _ctx.webpSupport ? (openBlock(), createElementBlock("option", _hoisted_14$1, " WebP (lossy) ")) : createCommentVNode("", true),
                  _ctx.heifSupport ? (openBlock(), createElementBlock("option", _hoisted_15$1, " HEIF (lossy) ")) : createCommentVNode("", true),
                  _hoisted_16$1
                ], 512), [
                  [vModelSelect, _ctx.format]
                ])
              ])
            ]),
            _ctx.isLossy ? (openBlock(), createElementBlock("tr", _hoisted_17$1, [
              _hoisted_18$1,
              createBaseVNode("td", null, [
                withDirectives(createBaseVNode("input", {
                  id: "export_quality",
                  type: "number",
                  min: "0",
                  max: "100",
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => _ctx.quality = $event),
                  onKeydown: _cache[4] || (_cache[4] = withModifiers(() => {
                  }, ["stop"]))
                }, null, 544), [
                  [
                    vModelText,
                    _ctx.quality,
                    void 0,
                    { number: true }
                  ]
                ])
              ])
            ])) : createCommentVNode("", true),
            createBaseVNode("tr", null, [
              _hoisted_19$1,
              createBaseVNode("td", null, [
                withDirectives(createBaseVNode("input", {
                  id: "export_ppi",
                  type: "number",
                  min: "0",
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => _ctx.ppi = $event),
                  onKeydown: _cache[6] || (_cache[6] = withModifiers(() => {
                  }, ["stop"])),
                  onBlur: _cache[7] || (_cache[7] = ($event) => {
                    if (_ctx.ppi === "")
                      _ctx.ppi = 0;
                  })
                }, null, 544), [
                  [
                    vModelText,
                    _ctx.ppi,
                    void 0,
                    { number: true }
                  ]
                ])
              ])
            ]),
            createBaseVNode("tr", null, [
              _hoisted_20$1,
              createBaseVNode("td", null, [
                withDirectives(createBaseVNode("input", {
                  id: "export_pages",
                  "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => _ctx.pages = $event),
                  placeholder: "E.g. 1-5, 8, 11-13"
                }, null, 512), [
                  [vModelText, _ctx.pages]
                ])
              ])
            ]),
            createBaseVNode("tr", null, [
              createBaseVNode("td", null, [
                createVNode(_component_d_button, {
                  icon: "photo_camera",
                  onClick: _ctx.download
                }, {
                  default: withCtx(() => [
                    _hoisted_21$1
                  ]),
                  _: 1
                }, 8, ["onClick"])
              ]),
              createBaseVNode("td", null, [
                createBaseVNode("button", {
                  onClick: _cache[9] || (_cache[9] = (...args) => _ctx.estimateExportSize && _ctx.estimateExportSize(...args))
                }, "Estimate filesizes")
              ])
            ])
          ])
        ]),
        _: 1
      }),
      createBaseVNode("div", _hoisted_22$1, [
        createVNode(_component_d_button, {
          icon: "save",
          onClick: _ctx.save
        }, {
          default: withCtx(() => [
            _hoisted_23$1
          ]),
          _: 1
        }, 8, ["onClick"]),
        createVNode(_component_d_button, {
          icon: "folder_open",
          onClick: _cache[11] || (_cache[11] = ($event) => _ctx.$refs.loadUpload.click())
        }, {
          default: withCtx(() => [
            _hoisted_24,
            createBaseVNode("input", {
              type: "file",
              ref: "loadUpload",
              onChange: _cache[10] || (_cache[10] = (...args) => _ctx.load && _ctx.load(...args))
            }, null, 544)
          ]),
          _: 1
        })
      ])
    ], 64))
  ]);
}
const PanelsPanel = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$6], ["__scopeId", "data-v-9ef644f2"]]);
const setableN = genericSimpleSetter("panels/setNotificationProperty");
const _sfc_main$5 = defineComponent({
  mixins: [PanelMixin],
  components: {
    Toggle: ToggleBox,
    ObjectTool
  },
  data: () => ({
    textEditor: false
  }),
  computed: {
    currentPanel() {
      return this.$store.state.panels.panels[this.$store.state.panels.currentPanel];
    },
    object() {
      const obj = this.currentPanel.objects[this.$store.state.ui.selection];
      if (obj.type !== "notification")
        return void 0;
      return obj;
    },
    textHandler() {
      if (!this.textEditor)
        return void 0;
      return {
        title: "Text",
        get: () => {
          return this.text;
        },
        set: (text) => {
          this.text = text;
        },
        leave: () => {
          this.textEditor = false;
        }
      };
    },
    text: setableN("text"),
    autoWrap: setableN("autoWrap"),
    renderBackdrop: setableN("backdrop")
  }
});
const notification_vue_vue_type_style_index_0_scoped_cd3c38a2_lang = "";
const _withScopeId$1 = (n) => (pushScopeId("data-v-cd3c38a2"), n = n(), popScopeId(), n);
const _hoisted_1$5 = { id: "notification_text_wrapper" };
const _hoisted_2$4 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("label", { for: "notification_text" }, "Text:", -1));
function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_toggle = resolveComponent("toggle");
  const _component_object_tool = resolveComponent("object-tool");
  return openBlock(), createBlock(_component_object_tool, {
    object: _ctx.object,
    title: "Notification",
    textHandler: _ctx.textHandler
  }, {
    default: withCtx(() => [
      createBaseVNode("div", _hoisted_1$5, [
        _hoisted_2$4,
        withDirectives(createBaseVNode("textarea", {
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.text = $event),
          id: "notification_text",
          onKeydown: _cache[1] || (_cache[1] = withModifiers(() => {
          }, ["stop"]))
        }, null, 544), [
          [vModelText, _ctx.text]
        ]),
        createBaseVNode("button", {
          onClick: _cache[2] || (_cache[2] = ($event) => _ctx.textEditor = true)
        }, "Formatting")
      ])
    ]),
    options: withCtx(() => [
      createVNode(_component_toggle, {
        modelValue: _ctx.renderBackdrop,
        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => _ctx.renderBackdrop = $event),
        label: "Show backdrop?"
      }, null, 8, ["modelValue"])
    ]),
    _: 1
  }, 8, ["object", "textHandler"]);
}
const NotificationPanel = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$5], ["__scopeId", "data-v-cd3c38a2"]]);
const setableP = genericSimpleSetter(
  "panels/setPoemProperty"
);
const _sfc_main$4 = defineComponent({
  mixins: [PanelMixin],
  components: {
    Toggle: ToggleBox,
    ObjectTool
  },
  data: () => ({
    textEditor: false
  }),
  computed: {
    currentPanel() {
      return this.$store.state.panels.panels[this.$store.state.panels.currentPanel];
    },
    backgrounds() {
      return poemBackgrounds$1;
    },
    poemTextStyles() {
      return poemTextStyles$1;
    },
    object() {
      const obj = this.currentPanel.objects[this.$store.state.ui.selection];
      if (obj.type !== "poem")
        return void 0;
      return obj;
    },
    textHandler() {
      if (!this.textEditor)
        return void 0;
      return {
        title: "Text",
        get: () => {
          return this.text;
        },
        set: (text) => {
          this.text = text;
        },
        leave: () => {
          this.textEditor = false;
        }
      };
    },
    text: setableP("text"),
    autoWrap: setableP("autoWrap"),
    poemStyle: setableP("font"),
    poemBackground: setableP("background")
  }
});
const poem_vue_vue_type_style_index_0_scoped_47525611_lang = "";
const _withScopeId = (n) => (pushScopeId("data-v-47525611"), n = n(), popScopeId(), n);
const _hoisted_1$4 = { id: "poem_text" };
const _hoisted_2$3 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("label", { for: "poem_text" }, "Text:", -1));
const _hoisted_3$3 = ["value"];
const _hoisted_4$2 = ["value"];
function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_toggle = resolveComponent("toggle");
  const _component_object_tool = resolveComponent("object-tool");
  return openBlock(), createBlock(_component_object_tool, {
    object: _ctx.object,
    title: _ctx.object.subType === "poem" ? "Poem" : "Console",
    textHandler: _ctx.textHandler
  }, {
    default: withCtx(() => [
      createBaseVNode("div", _hoisted_1$4, [
        _hoisted_2$3,
        withDirectives(createBaseVNode("textarea", {
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.text = $event),
          onKeydown: _cache[1] || (_cache[1] = withModifiers(() => {
          }, ["stop"]))
        }, null, 544), [
          [vModelText, _ctx.text]
        ]),
        createBaseVNode("button", {
          onClick: _cache[2] || (_cache[2] = ($event) => _ctx.textEditor = true)
        }, "Formatting")
      ]),
      createVNode(_component_toggle, {
        label: "Auto line wrap?",
        modelValue: _ctx.autoWrap,
        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => _ctx.autoWrap = $event)
      }, null, 8, ["modelValue"]),
      _ctx.object.subType === "poem" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
        withDirectives(createBaseVNode("select", {
          "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => _ctx.poemBackground = $event),
          onKeydown: _cache[5] || (_cache[5] = withModifiers(() => {
          }, ["stop"]))
        }, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.backgrounds, (background, idx) => {
            return openBlock(), createElementBlock("option", {
              value: idx,
              key: idx
            }, toDisplayString(background.name), 9, _hoisted_3$3);
          }), 128))
        ], 544), [
          [vModelSelect, _ctx.poemBackground]
        ]),
        withDirectives(createBaseVNode("select", {
          "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => _ctx.poemStyle = $event),
          onKeydown: _cache[7] || (_cache[7] = withModifiers(() => {
          }, ["stop"]))
        }, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.poemTextStyles, (style, idx) => {
            return openBlock(), createElementBlock("option", {
              value: idx,
              key: idx
            }, toDisplayString(style.name), 9, _hoisted_4$2);
          }), 128))
        ], 544), [
          [vModelSelect, _ctx.poemStyle]
        ])
      ], 64)) : createCommentVNode("", true)
    ]),
    _: 1
  }, 8, ["object", "title", "textHandler"]);
}
const PoemPanel = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$4], ["__scopeId", "data-v-47525611"]]);
const ToolKeybindings = {
  a: "add",
  s: "backgrounds",
  d: "panels",
  f: "settings"
};
const _sfc_main$3 = defineComponent({
  components: {
    SettingsPanel,
    AddPanel,
    BackgroundsPanel,
    CreditsPanel,
    CharacterPanel,
    TextBoxPanel,
    ChoicePanel,
    SpritePanel,
    PanelsPanel,
    NotificationPanel,
    PoemPanel
  },
  data: () => ({
    panelSelection: "add"
  }),
  computed: {
    currentPanel() {
      return this.$store.state.panels.panels[this.$store.state.panels.currentPanel];
    },
    vertical() {
      return this.$store.state.ui.vertical;
    },
    selection() {
      return this.$store.state.ui.selection;
    },
    panel() {
      if (this.panelSelection === "selection") {
        if (this.selection === null) {
          this.panelSelection = "add";
        } else {
          return this.currentPanel.objects[this.selection].type;
        }
      }
      return this.panelSelection;
    },
    hasPrevRender() {
      return this.$store.state.ui.lastDownload !== null;
    }
  },
  methods: {
    setPanel(name) {
      if (name === this.panelSelection)
        name = "add";
      this.panelSelection = name;
      if (this.selection !== null) {
        this.$store.commit("ui/setSelection", null);
      }
    },
    resetScroll() {
      console.log("resetting scrolls");
      if (this.$refs.panels instanceof HTMLElement) {
        this.$refs.panels.scrollTop = 0;
        this.$refs.panels.scrollLeft = 0;
      }
    },
    onKeydown(e) {
      if (e.ctrlKey) {
        const newPanel = ToolKeybindings[e.key];
        if (newPanel) {
          this.setPanel(newPanel);
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }
  },
  watch: {
    selection(newSelection) {
      if (newSelection != null) {
        this.panelSelection = "selection";
        return;
      }
      if (this.panelSelection === "selection") {
        this.panelSelection = "add";
      }
    }
  },
  created() {
    envX.onPanelChange((panel) => {
      this.panelSelection = panel;
    });
    window.removeEventListener("keydown", this.onKeydown);
    window.addEventListener("keydown", this.onKeydown);
  }
});
const toolbox_vue_vue_type_style_index_0_lang = "";
const _hoisted_1$3 = { id: "toolbar" };
const _hoisted_2$2 = /* @__PURE__ */ createBaseVNode("i", {
  class: "material-icons",
  "aria-hidden": "true"
}, "add_box", -1);
const _hoisted_3$2 = /* @__PURE__ */ createBaseVNode("div", { class: "shortcut-popup" }, "A", -1);
const _hoisted_4$1 = [
  _hoisted_2$2,
  _hoisted_3$2
];
const _hoisted_5 = /* @__PURE__ */ createBaseVNode("i", {
  class: "material-icons",
  "aria-hidden": "true"
}, "panorama", -1);
const _hoisted_6 = /* @__PURE__ */ createBaseVNode("div", { class: "shortcut-popup" }, "S", -1);
const _hoisted_7 = [
  _hoisted_5,
  _hoisted_6
];
const _hoisted_8 = /* @__PURE__ */ createBaseVNode("i", {
  class: "material-icons",
  "aria-hidden": "true"
}, "view_module", -1);
const _hoisted_9 = /* @__PURE__ */ createBaseVNode("div", { class: "shortcut-popup" }, "D", -1);
const _hoisted_10 = [
  _hoisted_8,
  _hoisted_9
];
const _hoisted_11 = /* @__PURE__ */ createBaseVNode("i", {
  class: "material-icons",
  "aria-hidden": "true"
}, "settings_applications", -1);
const _hoisted_12 = /* @__PURE__ */ createBaseVNode("div", { class: "shortcut-popup" }, "F", -1);
const _hoisted_13 = [
  _hoisted_11,
  _hoisted_12
];
const _hoisted_14 = { id: "toolbar-end" };
const _hoisted_15 = /* @__PURE__ */ createBaseVNode("i", {
  class: "material-icons",
  "aria-hidden": "true"
}, "help", -1);
const _hoisted_16 = [
  _hoisted_15
];
const _hoisted_17 = /* @__PURE__ */ createBaseVNode("i", {
  class: "material-icons",
  "aria-hidden": "true"
}, "extension", -1);
const _hoisted_18 = [
  _hoisted_17
];
const _hoisted_19 = ["disabled"];
const _hoisted_20 = /* @__PURE__ */ createBaseVNode("i", {
  class: "material-icons",
  "aria-hidden": "true"
}, "flip_to_back", -1);
const _hoisted_21 = [
  _hoisted_20
];
const _hoisted_22 = /* @__PURE__ */ createBaseVNode("i", {
  class: "material-icons",
  "aria-hidden": "true"
}, "photo_camera", -1);
const _hoisted_23 = [
  _hoisted_22
];
function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_settings_panel = resolveComponent("settings-panel");
  const _component_backgrounds_panel = resolveComponent("backgrounds-panel");
  const _component_credits_panel = resolveComponent("credits-panel");
  const _component_character_panel = resolveComponent("character-panel");
  const _component_sprite_panel = resolveComponent("sprite-panel");
  const _component_text_box_panel = resolveComponent("text-box-panel");
  const _component_choice_panel = resolveComponent("choice-panel");
  const _component_panels_panel = resolveComponent("panels-panel");
  const _component_notification_panel = resolveComponent("notification-panel");
  const _component_poem_panel = resolveComponent("poem-panel");
  const _component_add_panel = resolveComponent("add-panel");
  return openBlock(), createElementBlock("div", {
    id: "panels",
    class: normalizeClass({ vertical: _ctx.vertical }),
    onScroll: _cache[12] || (_cache[12] = (...args) => _ctx.resetScroll && _ctx.resetScroll(...args)),
    ref: "panels"
  }, [
    createBaseVNode("div", _hoisted_1$3, [
      createBaseVNode("button", {
        class: normalizeClass({ active: _ctx.panel === "add" }),
        onClick: _cache[0] || (_cache[0] = ($event) => _ctx.setPanel("add")),
        title: "Add new objects to the scene",
        "aria-label": "Add new objects to the scene"
      }, _hoisted_4$1, 2),
      createBaseVNode("button", {
        class: normalizeClass({ active: _ctx.panel === "backgrounds" }),
        onClick: _cache[1] || (_cache[1] = ($event) => _ctx.setPanel("backgrounds")),
        "aria-label": "Change the current background",
        title: "Change the current background"
      }, _hoisted_7, 2),
      createBaseVNode("button", {
        class: normalizeClass({ active: _ctx.panel === "panels" }),
        title: "Panels",
        "aria-label": "Panels",
        onClick: _cache[2] || (_cache[2] = ($event) => _ctx.setPanel("panels"))
      }, _hoisted_10, 2),
      createBaseVNode("button", {
        class: normalizeClass({ active: _ctx.panel === "settings" }),
        title: "Settings",
        "aria-label": "Settings",
        onClick: _cache[3] || (_cache[3] = ($event) => _ctx.setPanel("settings"))
      }, _hoisted_13, 2)
    ]),
    _ctx.panel === "settings" ? (openBlock(), createBlock(_component_settings_panel, { key: 0 })) : _ctx.panel === "backgrounds" ? (openBlock(), createBlock(_component_backgrounds_panel, {
      key: 1,
      onShowDialog: _cache[4] || (_cache[4] = ($event) => _ctx.$emit("show-dialog", $event))
    })) : _ctx.panel === "help_credits" ? (openBlock(), createBlock(_component_credits_panel, { key: 2 })) : _ctx.panel === "character" ? (openBlock(), createBlock(_component_character_panel, {
      key: 3,
      onShowDialog: _cache[5] || (_cache[5] = ($event) => _ctx.$emit("show-dialog", $event)),
      onShowExpressionDialog: _cache[6] || (_cache[6] = ($event) => _ctx.$emit("show-expression-dialog", $event))
    })) : _ctx.panel === "sprite" ? (openBlock(), createBlock(_component_sprite_panel, { key: 4 })) : _ctx.panel === "textBox" ? (openBlock(), createBlock(_component_text_box_panel, { key: 5 })) : _ctx.panel === "choice" ? (openBlock(), createBlock(_component_choice_panel, { key: 6 })) : _ctx.panel === "panels" ? (openBlock(), createBlock(_component_panels_panel, { key: 7 })) : _ctx.panel === "notification" ? (openBlock(), createBlock(_component_notification_panel, { key: 8 })) : _ctx.panel === "poem" ? (openBlock(), createBlock(_component_poem_panel, { key: 9 })) : (openBlock(), createBlock(_component_add_panel, {
      key: 10,
      onShowDialog: _cache[7] || (_cache[7] = ($event) => _ctx.$emit("show-dialog", $event))
    })),
    createBaseVNode("div", _hoisted_14, [
      createBaseVNode("button", {
        class: normalizeClass({ active: _ctx.panel === "help_credits" }),
        onClick: _cache[8] || (_cache[8] = ($event) => _ctx.setPanel("help_credits")),
        title: "Help & Credits",
        "aria-label": "Help & Credits"
      }, _hoisted_16, 2),
      createBaseVNode("button", {
        class: normalizeClass({ active: _ctx.panel === "packs" }),
        onClick: _cache[9] || (_cache[9] = ($event) => _ctx.$emit("show-dialog")),
        title: "Content packs",
        "aria-label": "Content packs"
      }, _hoisted_18, 2),
      createBaseVNode("button", {
        onClick: _cache[10] || (_cache[10] = ($event) => _ctx.$emit("show-prev-render")),
        title: "Show last downloaded panel",
        "aria-label": "Show last downloaded panel",
        disabled: !_ctx.hasPrevRender
      }, _hoisted_21, 8, _hoisted_19),
      createBaseVNode("button", {
        title: "Take a screenshot of the current scene",
        "aria-label": "Take a screenshot of the current scene",
        onClick: _cache[11] || (_cache[11] = ($event) => _ctx.$emit("download"))
      }, _hoisted_23)
    ])
  ], 34);
}
const ToolBox = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$3]]);
var __async$4 = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const shortHidingTime = 5e3;
const longHidingTime = 2e4;
const hideShowTimeouts = 100;
const _sfc_main$2 = defineComponent({
  props: {
    loading: {
      default: false,
      type: Boolean
    }
  },
  data: () => ({
    messages: [],
    errors: [],
    resolvableErrors: [],
    showLoading: false,
    showLoadingTimeout: 0,
    hideLoadingTimeout: 0
  }),
  computed: {
    vertical() {
      return this.$store.state.ui.vertical;
    }
  },
  created() {
    this.onLoadingChange(this.loading);
    eventBus$1.subscribe(AssetFailureEvent, (ev) => {
      this.messages.push(`Failed to load asset '${ev.path}'`);
      setTimeout(() => {
        this.messages.shift();
      }, shortHidingTime);
    });
    eventBus$1.subscribe(CustomAssetFailureEvent, (_ev) => {
      this.messages.push(
        "Failed to load custom asset. Try to download it manually and then upload it."
      );
      setTimeout(() => {
        this.messages.shift();
      }, longHidingTime);
    });
    eventBus$1.subscribe(FailureEvent, (ev) => {
      this.errors.push(ev.message);
    });
    eventBus$1.subscribe(ResolvableErrorEvent, (ev) => {
      this.resolvableErrors.push(ev);
    });
    eventBus$1.subscribe(ShowMessageEvent, (ev) => {
      this.messages.push(ev.message);
      setTimeout(() => {
        this.messages.shift();
      }, longHidingTime);
    });
    eventBus$1.subscribe(VueErrorEvent, (ev) => {
      this.messages.push(ev.error.name);
      this.messages.push(JSON.stringify(ev.error.stack));
      this.messages.push(ev.info);
      setTimeout(() => {
        this.messages.shift();
        this.messages.shift();
        this.messages.shift();
      }, longHidingTime);
    });
  },
  methods: {
    onLoadingChange(newValue) {
      if (newValue) {
        if (this.hideLoadingTimeout) {
          clearTimeout(this.hideLoadingTimeout);
          this.hideLoadingTimeout = 0;
        }
        if (!this.showLoading && !this.showLoadingTimeout) {
          this.showLoadingTimeout = setTimeout(() => {
            this.showLoading = true;
            this.showLoadingTimeout = 0;
          }, hideShowTimeouts);
        }
      } else {
        if (this.showLoadingTimeout) {
          clearTimeout(this.showLoadingTimeout);
          this.showLoadingTimeout = 0;
        }
        if (this.showLoading && !this.hideLoadingTimeout) {
          this.hideLoadingTimeout = setTimeout(() => {
            this.showLoading = false;
            this.hideLoadingTimeout = 0;
          }, hideShowTimeouts);
        }
      }
    },
    dismissError(i) {
      this.errors.splice(i, 1);
    },
    resolvableAction(i, actionName) {
      return __async$4(this, null, function* () {
        const error2 = this.resolvableErrors[i];
        this.resolvableErrors.splice(i, 1);
        const action = error2.actions.find((a) => a.name === actionName);
        yield action.exec();
      });
    }
  },
  watch: {
    loading(newValue) {
      this.onLoadingChange(newValue);
    }
  }
});
const messageConsole_vue_vue_type_style_index_0_scoped_20f42fc5_lang = "";
const _hoisted_1$2 = { key: 0 };
const _hoisted_2$1 = ["onClick"];
const _hoisted_3$1 = ["onClick"];
function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", {
    id: "messageConsole",
    class: normalizeClass({ vertical: _ctx.vertical })
  }, [
    _ctx.showLoading ? (openBlock(), createElementBlock("p", _hoisted_1$2, "Loading...")) : createCommentVNode("", true),
    (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.messages, (message, i) => {
      return openBlock(), createElementBlock("p", {
        key: message + "_" + i
      }, toDisplayString(message), 1);
    }), 128)),
    (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.resolvableErrors, (error2, i) => {
      return openBlock(), createElementBlock("p", {
        class: "error",
        key: "resolvableError_" + i
      }, [
        createTextVNode(toDisplayString(error2.message) + " ", 1),
        (openBlock(true), createElementBlock(Fragment, null, renderList(error2.actions, (action) => {
          return openBlock(), createElementBlock("a", {
            href: "#",
            key: "resolvableError_" + i + action.name,
            onClick: ($event) => _ctx.resolvableAction(i, action.name)
          }, "[" + toDisplayString(action.name) + "]", 9, _hoisted_2$1);
        }), 128))
      ]);
    }), 128)),
    (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.errors, (error2, i) => {
      return openBlock(), createElementBlock("p", {
        class: "error",
        key: "error_" + i
      }, [
        createTextVNode(toDisplayString(error2) + " ", 1),
        createBaseVNode("a", {
          href: "#",
          onClick: ($event) => _ctx.dismissError(i)
        }, "[Dismiss]", 8, _hoisted_3$1)
      ]);
    }), 128))
  ], 2);
}
const MessageConsole = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$2], ["__scopeId", "data-v-20f42fc5"]]);
var __async$3 = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _sfc_main$1 = defineComponent({
  props: {
    canvasWidth: { default: 0 },
    canvasHeight: { default: 0 },
    preLoading: { type: Boolean }
  },
  data: () => ({
    sdCtx: null,
    currentlyRendering: false,
    queuedRender: null,
    showingLast: false,
    dropSpriteCount: 0,
    dropPreventClick: false,
    draggedObject: null,
    dragXOffset: 0,
    dragYOffset: 0,
    dragXOriginal: 0,
    dragYOriginal: 0,
    sceneRendererCache: null
  }),
  computed: {
    selection() {
      var _a;
      return (_a = this.$store.state.ui.selection) != null ? _a : null;
    },
    currentPanel() {
      return this.$store.state.panels.panels[this.$store.state.panels.currentPanel];
    },
    lqRendering() {
      return this.$store.state.ui.lqRendering;
    },
    sceneRender() {
      const panelId = this.$store.state.panels.currentPanel;
      if (!this.sceneRendererCache) {
        console.log("New scene renderer!");
        this.sceneRendererCache = markRaw(
          new SceneRenderer(
            this.$store,
            panelId,
            this.bitmapWidth,
            this.bitmapHeight
          )
        );
      } else {
        this.sceneRendererCache.setPanelId(panelId);
      }
      return this.sceneRendererCache;
    },
    bitmapHeight() {
      this.preLoading;
      return getConstants().Base.screenHeight;
    },
    bitmapWidth() {
      this.preLoading;
      return getConstants().Base.screenWidth;
    },
    pickerMode() {
      return this.$store.state.ui.pickColor;
    },
    cursor() {
      return this.pickerMode ? "crosshair" : "default";
    }
  },
  methods: {
    download() {
      return __async$3(this, null, function* () {
        const url = yield this.sceneRender.download();
        yield this.vuexHistory.transaction(() => __async$3(this, null, function* () {
          const oldUrl = this.$store.state.ui.lastDownload;
          this.$store.commit("ui/setLastDownload", url);
          if (oldUrl != null) {
            URL.revokeObjectURL(oldUrl);
          }
        }));
      });
    },
    invalidateRender() {
      if (this.queuedRender != null)
        return;
      this.queuedRender = requestAnimationFrame(this.render_);
    },
    render_() {
      return __async$3(this, null, function* () {
        if (this.queuedRender != null) {
          cancelAnimationFrame(this.queuedRender);
          this.queuedRender = null;
        }
        if (this.$store.state.unsafe)
          return;
        try {
          yield this.sceneRender.render(!this.lqRendering, true, false);
        } catch (e) {
          console.log(e);
        }
        this.display();
        eventBus$1.fire(new RenderUpdatedEvent());
      });
    },
    renderLoadingScreen() {
      const loadingScreen = document.createElement("canvas");
      loadingScreen.height = this.bitmapHeight;
      loadingScreen.width = this.bitmapWidth;
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
        this.sdCtx.drawImage(
          loadingScreen,
          this.canvasWidth,
          this.canvasHeight
        );
      } finally {
        disposeCanvas(loadingScreen);
      }
    },
    display() {
      this.showingLast = false;
      this.sceneRender.paintOnto(this.sdCtx, {
        x: 0,
        y: 0,
        w: this.bitmapWidth,
        h: this.bitmapHeight
      });
    },
    toRendererCoordinate(x, y) {
      const sd = this.$refs.sd;
      const rx = x - sd.offsetLeft;
      const ry = y - sd.offsetTop;
      const sx = rx / sd.offsetWidth * sd.width;
      const sy = ry / sd.offsetWidth * sd.width;
      return [sx, sy];
    },
    onUiClick(e) {
      var _a;
      const [sx, sy] = this.toRendererCoordinate(e.clientX, e.clientY);
      if (this.pickerMode) {
        const data = this.sdCtx.getImageData(sx, sy, 1, 1).data;
        const hex = `rgba(${data[0].toString()},${data[1].toString()},${data[2].toString()},${(data[3] / 255).toString()})`;
        this.vuexHistory.transaction(() => {
          this.$store.commit("ui/setColorPicker", false);
          eventBus$1.fire(new ColorPickedEvent(hex));
        });
        return;
      }
      if (this.dropPreventClick) {
        this.dropPreventClick = false;
        return;
      }
      const objects = this.sceneRender.objectsAt(sx, sy);
      const currentObjectIdx = objects.findIndex((id) => id === this.selection);
      let selectedObject;
      if (currentObjectIdx === 0) {
        selectedObject = null;
      } else if (currentObjectIdx !== -1) {
        selectedObject = objects[currentObjectIdx - 1];
      } else {
        selectedObject = (_a = objects[objects.length - 1]) != null ? _a : null;
      }
      if (this.$store.state.ui.selection === selectedObject)
        return;
      this.vuexHistory.transaction(() => {
        this.$store.commit("ui/setSelection", selectedObject);
      });
    },
    onDragStart(e) {
      e.preventDefault();
      if (this.selection === null)
        return;
      this.draggedObject = this.currentPanel.objects[this.selection];
      const [x, y] = this.toRendererCoordinate(e.clientX, e.clientY);
      this.dragXOffset = x - this.draggedObject.x;
      this.dragYOffset = y - this.draggedObject.y;
      this.dragXOriginal = this.draggedObject.x;
      this.dragYOriginal = this.draggedObject.y;
    },
    onTouchStart(e) {
      if (this.selection === null)
        return;
      this.draggedObject = this.currentPanel.objects[this.selection];
      const [x, y] = this.toRendererCoordinate(
        e.touches[0].clientX,
        e.touches[0].clientY
      );
      this.dragXOffset = x - this.draggedObject.x;
      this.dragYOffset = y - this.draggedObject.y;
      this.dragXOriginal = this.draggedObject.x;
      this.dragYOriginal = this.draggedObject.y;
    },
    onDragOver(e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    onSpriteDragMove(e) {
      if (!this.draggedObject)
        return;
      e.preventDefault();
      let [x, y] = e instanceof MouseEvent ? this.toRendererCoordinate(e.clientX, e.clientY) : this.toRendererCoordinate(
        e.touches[0].clientX,
        e.touches[0].clientY
      );
      x -= this.dragXOffset;
      y -= this.dragYOffset;
      const deltaX = Math.abs(x - this.dragXOriginal);
      const deltaY = Math.abs(y - this.dragYOriginal);
      if (deltaX + deltaY > 1)
        this.dropPreventClick = true;
      if (e.shiftKey) {
        if (deltaX > deltaY) {
          y = this.dragYOriginal;
        } else {
          x = this.dragXOriginal;
        }
      }
      this.vuexHistory.transaction(() => {
        this.$store.dispatch("panels/setPosition", {
          panelId: this.draggedObject.panelId,
          id: this.draggedObject.id,
          x,
          y
        });
      });
    },
    onDrop(e) {
      return __async$3(this, null, function* () {
        e.stopPropagation();
        e.preventDefault();
        if (!e.dataTransfer)
          return;
        for (const item of e.dataTransfer.items) {
          if (item.kind === "file" && item.type.match(/image.*/)) {
            const file = item.getAsFile();
            const url = URL.createObjectURL(file);
            try {
              const assetUrl = yield this.$store.dispatch(
                "uploadUrls/add",
                {
                  name: file.name,
                  url
                }
              );
              yield this.vuexHistory.transaction(() => __async$3(this, null, function* () {
                yield this.$store.dispatch("panels/createSprite", {
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
    },
    onSpriteDrop(e) {
      if (this.draggedObject) {
        if ("TouchEvent" in window && e instanceof TouchEvent) {
          this.dropPreventClick = false;
        }
        this.draggedObject = null;
      }
    },
    onMouseEnter(e) {
      if (e.buttons !== 1) {
        this.draggedObject = null;
      }
    }
  },
  watch: {
    canvasWidth() {
      this.display();
    },
    canvasHeight() {
      this.display();
    }
  },
  created() {
    return __async$3(this, null, function* () {
      if (typeof WeakRef !== "undefined") {
        const self2 = new WeakRef(this);
        window.getMainSceneRenderer = function() {
          var _a;
          return (_a = self2.deref()) == null ? void 0 : _a.sceneRender;
        };
      } else {
        window.getMainSceneRenderer = () => {
          return this.sceneRender;
        };
      }
      eventBus$1.subscribe(InvalidateRenderEvent, () => this.invalidateRender());
      eventBus$1.subscribe(StateLoadingEvent, () => {
        const cache = this.sceneRendererCache;
        if (cache) {
          cache.setPanelId(-1);
        }
      });
      this.$store.subscribe((mut) => {
        if (mut.type === "panels/setPanelPreview")
          return;
        if (mut.type === "panels/currentPanel")
          return;
        this.invalidateRender();
      });
    });
  },
  mounted() {
    const sd = this.$refs.sd;
    this.sdCtx = sd.getContext("2d");
    this.renderLoadingScreen();
    this.invalidateRender();
  },
  unmounted() {
    var _a;
    (_a = this.sceneRendererCache) == null ? void 0 : _a.dispose();
  }
});
const render_vue_vue_type_style_index_0_lang = "";
const _hoisted_1$1 = ["height", "width"];
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("canvas", {
    id: "scaled_display",
    ref: "sd",
    height: _ctx.bitmapHeight,
    width: _ctx.bitmapWidth,
    style: normalizeStyle$1({ width: _ctx.canvasWidth + "px", height: _ctx.canvasHeight + "px", cursor: _ctx.cursor }),
    draggable: "true",
    onClick: _cache[0] || (_cache[0] = (...args) => _ctx.onUiClick && _ctx.onUiClick(...args)),
    onTouchstart: _cache[1] || (_cache[1] = (...args) => _ctx.onTouchStart && _ctx.onTouchStart(...args)),
    onDragstart: _cache[2] || (_cache[2] = (...args) => _ctx.onDragStart && _ctx.onDragStart(...args)),
    onTouchmove: _cache[3] || (_cache[3] = (...args) => _ctx.onSpriteDragMove && _ctx.onSpriteDragMove(...args)),
    onMousemove: _cache[4] || (_cache[4] = (...args) => _ctx.onSpriteDragMove && _ctx.onSpriteDragMove(...args)),
    onTouchend: _cache[5] || (_cache[5] = (...args) => _ctx.onSpriteDrop && _ctx.onSpriteDrop(...args)),
    onMouseup: _cache[6] || (_cache[6] = (...args) => _ctx.onSpriteDrop && _ctx.onSpriteDrop(...args)),
    onDragover: _cache[7] || (_cache[7] = (...args) => _ctx.onDragOver && _ctx.onDragOver(...args)),
    onDrop: _cache[8] || (_cache[8] = (...args) => _ctx.onDrop && _ctx.onDrop(...args)),
    onMouseenter: _cache[9] || (_cache[9] = (...args) => _ctx.onMouseEnter && _ctx.onMouseEnter(...args)),
    onContextmenu: _cache[10] || (_cache[10] = withModifiers(() => {
    }, ["prevent"]))
  }, "HTML5 is required to use the Doki Doki Dialog Generator. ", 44, _hoisted_1$1);
}
const Render = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1]]);
const NsfwPacks = {
  "dddg.buildin.backgrounds.nsfw": `${baseUrl}packs/buildin.base.backgrounds.nsfw.json`,
  "dddg.buildin.sayori.nsfw": `${baseUrl}packs/buildin.base.sayori.nsfw.json`,
  "dddg.buildin.base.natsuki.nsfw": `${baseUrl}packs/buildin.base.natsuki.nsfw.json`,
  "dddg.buildin.yuri.nsfw": `${baseUrl}packs/buildin.base.yuri.nsfw.json`
};
const NsfwNames = new Set(Object.keys(NsfwPacks));
const NsfwPaths = Object.values(NsfwPacks);
var __async$2 = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const aspectRatio = 16 / 9;
const arrowMoveStepSize = 20;
const packDialogWaitMs = 50;
const canvasTooSmallThreshold = 200;
const _sfc_main = defineComponent({
  components: {
    ToolBox,
    MessageConsole,
    Render,
    ModalDialog,
    SingleBox: defineAsyncComponent(
      () => __vitePreload(() => import("./SingleBox.5a596653.js"), true ? ["SingleBox.5a596653.js","SingleBox.378faf79.css"] : void 0, import.meta.url)
    ),
    ExpressionBuilder: defineAsyncComponent(
      () => __vitePreload(() => import("./index.6d53e0b5.js"), true ? ["index.6d53e0b5.js","index.b33ad874.css"] : void 0, import.meta.url)
    )
  },
  data: () => ({
    canvasWidth: 0,
    canvasHeight: 0,
    blendOver: null,
    uiSize: 192,
    currentlyRendering: false,
    panel: "",
    dialogVisable: false,
    canvasTooSmall: false,
    expressionBuilderVisible: false,
    expressionBuilderCharacter: "",
    expressionBuilderHeadGroup: void 0,
    systemPrefersDarkMode: false,
    preLoading: true,
    classes: /* @__PURE__ */ new Set(),
    classTimeout: null,
    queuedRerender: null
  }),
  computed: {
    isSafari() {
      return false;
    },
    useDarkTheme() {
      var _a;
      return (_a = this.userPrefersDarkMode) != null ? _a : this.systemPrefersDarkMode;
    },
    userPrefersDarkMode() {
      return this.$store.state.ui.useDarkTheme;
    },
    nsfw() {
      return this.$store.state.ui.nsfw;
    },
    objects() {
      const panels2 = this.$store.state.panels;
      const currentPanel = panels2.panels[panels2.currentPanel];
      if (currentPanel == null)
        return [];
      return [...currentPanel.order, ...currentPanel.onTopOrder];
    }
  },
  methods: {
    drawLastDownload() {
      const last = this.$store.state.ui.lastDownload;
      if (last == null)
        return;
      this.$refs.render.blendOver(last);
    },
    setBlendOver() {
      this.blendOver = this.$store.state.ui.lastDownload;
    },
    optimum(sw, sh) {
      let rh = sw / aspectRatio;
      let rw = sh * aspectRatio;
      if (rh > sh) {
        rh = sh;
      } else {
        rw = sw;
      }
      return [rw, rh];
    },
    optimizeWithMenu(sw, sh) {
      const opth = this.optimum(sw, sh - this.uiSize);
      const optv = this.optimum(sw - this.uiSize, sh);
      if (!this.isSafari && opth[0] * opth[1] > optv[0] * optv[1]) {
        return [opth[0], opth[1], false];
      } else {
        return [optv[0], optv[1], true];
      }
    },
    updateArea() {
      const [cw, ch, v] = this.optimizeWithMenu(
        document.documentElement.clientWidth,
        document.documentElement.clientHeight
      );
      this.canvasWidth = cw;
      this.canvasHeight = ch;
      this.canvasTooSmall = Math.max(cw, ch) < canvasTooSmallThreshold;
      if (this.$store.state.ui.vertical === v)
        return;
      this.$store.commit("ui/setVertical", v);
    },
    showDialog(search) {
      this.dialogVisable = true;
      if (search == null)
        return;
      const wait = () => {
        if (this.$refs.packDialog) {
          this.$refs.packDialog.setSearch(search);
        } else {
          setTimeout(wait, packDialogWaitMs);
        }
      };
      this.$nextTick(wait);
    },
    showExpressionDialog(e) {
      this.expressionBuilderVisible = true;
      this.expressionBuilderCharacter = e.character;
      this.expressionBuilderHeadGroup = e.headGroup;
    },
    rerender() {
      if (this.queuedRerender != null)
        return;
      this.queuedRerender = requestAnimationFrame(() => {
        this.queuedRerender = null;
        eventBus$1.fire(new InvalidateRenderEvent());
      });
    },
    onKeydown(e) {
      if (e.key === "Control") {
        if (this.classTimeout === null) {
          this.classTimeout = setTimeout(() => {
            this.classTimeout = null;
            this.classes.add("ctrl-key");
          }, 500);
        }
        return;
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        console.log("skip keydown on potential target");
        return;
      }
      this.vuexHistory.transaction(() => {
        if (e.ctrlKey) {
          if (e.key === "z") {
            e.preventDefault();
            return;
          } else if (e.key === "y") {
            e.preventDefault();
            return;
          } else if (e.key === "v") {
            this.$store.dispatch(
              "panels/pasteObjectFromClipboard",
              {}
            );
            e.preventDefault();
            return;
          }
        }
        const selectionPanel = this.$store.state.panels.panels[this.$store.state.panels.currentPanel];
        const selection = selectionPanel.objects[this.$store.state.ui.selection];
        if (selection == null)
          return;
        if (e.key === "Delete") {
          this.$store.dispatch("panels/removeObject", {
            id: selection.id,
            panelId: selection.panelId
          });
          return;
        }
        if (e.key === "c" || e.key === "x") {
          this.$store.dispatch("panels/copyObjectToClipboard", {
            id: selection.id,
            panelId: selection.panelId
          });
          if (e.key === "x") {
            this.$store.dispatch("panels/removeObject", {
              id: selection.id,
              panelId: selection.panelId
            });
          }
          e.preventDefault();
          return;
        }
        if (e.key === "/" || e.key === "*") {
          let delta = e.key === "/" ? -10 : 10;
          if (e.shiftKey) {
            delta /= Math.abs(delta);
          }
          this.$store.commit("panels/setRotation", {
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
              this.$store.dispatch("panels/shiftCharacterSlot", {
                id: character.id,
                panelId: character.panelId,
                delta: -1
              });
              return;
            }
            if (e.key === "ArrowRight") {
              this.$store.dispatch("panels/shiftCharacterSlot", {
                id: character.id,
                panelId: character.panelId,
                delta: 1
              });
              return;
            }
          }
        }
        let { x, y } = selection;
        if (e.key === "ArrowLeft") {
          x -= e.shiftKey ? 1 : arrowMoveStepSize;
        } else if (e.key === "ArrowRight") {
          x += e.shiftKey ? 1 : arrowMoveStepSize;
        } else if (e.key === "ArrowUp") {
          y -= e.shiftKey ? 1 : arrowMoveStepSize;
        } else if (e.key === "ArrowDown") {
          y += e.shiftKey ? 1 : arrowMoveStepSize;
        } else {
          return;
        }
        this.$store.dispatch("panels/setPosition", {
          id: selection.id,
          panelId: selection.panelId,
          x,
          y
        });
        return;
      });
    },
    onKeyup(e) {
      if (e.key === "Control") {
        if (this.classTimeout != null)
          clearTimeout(this.classTimeout);
        this.classTimeout = null;
        this.classes.delete("ctrl-key");
        return;
      }
    },
    applyTheme() {
      document.body.classList.toggle("dark-theme", this.useDarkTheme);
    },
    select(id) {
      if (this.$store.state.ui.selection === id)
        return;
      this.vuexHistory.transaction(() => {
        this.$store.commit("ui/setSelection", id);
      });
    }
  },
  watch: {
    systemPrefersDarkMode() {
      this.applyTheme();
    },
    userPrefersDarkMode() {
      this.applyTheme();
    },
    nsfw(value) {
      return __async$2(this, null, function* () {
        if (value) {
          yield this.$store.dispatch("content/loadContentPacks", NsfwPaths);
        } else {
          yield this.$store.dispatch("removePacks", {
            packs: NsfwNames
          });
        }
      });
    }
  },
  mounted() {
    window.addEventListener("keypress", (e) => {
      if (e.key === "Escape") {
        this.vuexHistory.transaction(() => {
          if (this.$store.state.ui.selection === null)
            return;
          this.$store.commit("ui/setSelection", null);
        });
      }
    });
    window.addEventListener("resize", this.updateArea);
    window.removeEventListener("keydown", this.onKeydown);
    window.addEventListener("keydown", this.onKeydown);
    window.addEventListener("keyup", this.onKeyup);
    if (window.matchMedia != null) {
      const matcher = window.matchMedia("(prefers-color-scheme: dark)");
      this.systemPrefersDarkMode = matcher.matches;
      matcher.addListener((match) => {
        this.systemPrefersDarkMode = match.matches;
      });
    }
  },
  created() {
    return __async$2(this, null, function* () {
      this.updateArea();
      Repo.setStore(this.$store);
      window.app = this;
      window.store = this.$store;
      window.env = envX;
      watch(
        () => this.$store.state.ui.selection,
        (id) => {
          var _a, _b;
          if (((_a = document.activeElement) == null ? void 0 : _a.getAttribute("data-obj-id")) !== "" + id) {
            (_b = document.querySelector(`*[data-obj-id='${id}']`)) == null ? void 0 : _b.focus({ focusVisible: false, preventScroll: true });
          }
        }
      );
      document.body.addEventListener(
        "drop",
        (event) => {
          event.preventDefault();
        },
        true
      );
      document.body.addEventListener(
        "dragover",
        (event) => {
          event.preventDefault();
        },
        true
      );
      yield envX.loadGameMode();
      this.preLoading = false;
      envX.connectToStore(this.vuexHistory, this.$store);
      const settings = yield envX.loadSettings();
      yield this.vuexHistory.transaction(() => __async$2(this, null, function* () {
        var _a, _b, _c, _d;
        envX.state.looseTextParsing = settings.looseTextParsing || true;
        this.$store.commit("ui/setLqRendering", (_a = settings.lq) != null ? _a : false);
        this.$store.commit("ui/setDarkTheme", (_b = settings.darkMode) != null ? _b : null);
        this.$store.commit(
          "ui/setDefaultCharacterTalkingZoom",
          (_c = settings.defaultCharacterTalkingZoom) != null ? _c : true
        );
        yield this.$store.dispatch("content/loadContentPacks", [
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
        const panelId = yield this.$store.dispatch("panels/createPanel");
        if (Object.keys(this.$store.state.panels.panels[panelId].objects).length === 0) {
          yield this.$store.dispatch("panels/createTextBox", {
            panelId,
            text: `Hi! Click here to edit this textbox! ${this.$store.state.ui.vertical ? "To the right" : "At the bottom"} you find the toolbox. There you can add things (try clicking the chibis), change backgrounds and more!`
          });
        }
        yield this.$store.commit("panels/setCurrentBackground", {
          current: "dddg.buildin.backgrounds:ddlc.clubroom",
          panelId: this.$store.state.panels.currentPanel
        });
        yield this.$store.commit("ui/setNsfw", (_d = settings.nsfw) != null ? _d : false);
      }));
    });
  },
  unmounted() {
    window.removeEventListener("keydown", this.onKeydown);
    window.removeEventListener("keyup", this.onKeyup);
  }
});
const App_vue_vue_type_style_index_0_lang = "";
const _hoisted_1 = { key: 0 };
const _hoisted_2 = { class: "hidden-selectors" };
const _hoisted_3 = ["data-obj-id", "onKeydown"];
const _hoisted_4 = /* @__PURE__ */ createBaseVNode("div", { id: "modal-messages" }, null, -1);
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_render = resolveComponent("render");
  const _component_message_console = resolveComponent("message-console");
  const _component_tool_box = resolveComponent("tool-box");
  const _component_single_box = resolveComponent("single-box");
  const _component_modal_dialog = resolveComponent("modal-dialog");
  const _component_expression_builder = resolveComponent("expression-builder");
  return openBlock(), createElementBlock(Fragment, null, [
    _ctx.canvasTooSmall && _ctx.isSafari ? (openBlock(), createElementBlock("div", _hoisted_1, " Protrait mode is not supported by safari. Please turn the device sideways. ")) : (openBlock(), createElementBlock("div", {
      key: 1,
      id: "app",
      class: normalizeClass(Array.from(_ctx.classes))
    }, [
      createBaseVNode("div", _hoisted_2, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.objects, (obj) => {
          return openBlock(), createElementBlock("div", {
            key: obj,
            tabindex: "0",
            "data-obj-id": obj,
            onFocus: _cache[0] || (_cache[0] = ($event) => _ctx.rerender()),
            onBlur: _cache[1] || (_cache[1] = ($event) => _ctx.rerender()),
            onKeydown: [
              withKeys(withModifiers(($event) => _ctx.select(obj), ["prevent"]), ["enter"]),
              withKeys(withModifiers(($event) => _ctx.select(obj), ["prevent"]), ["space"])
            ]
          }, null, 40, _hoisted_3);
        }), 128))
      ]),
      createVNode(_component_render, {
        ref: "render",
        canvasWidth: _ctx.canvasWidth,
        canvasHeight: _ctx.canvasHeight,
        preLoading: _ctx.preLoading
      }, null, 8, ["canvasWidth", "canvasHeight", "preLoading"]),
      createVNode(_component_message_console),
      createVNode(_component_tool_box, {
        onShowPrevRender: _ctx.drawLastDownload,
        onDownload: _cache[2] || (_cache[2] = ($event) => _ctx.$refs.render.download()),
        onShowDialog: _ctx.showDialog,
        onShowExpressionDialog: _ctx.showExpressionDialog
      }, null, 8, ["onShowPrevRender", "onShowDialog", "onShowExpressionDialog"]),
      (openBlock(), createBlock(KeepAlive, null, [
        _ctx.dialogVisable ? (openBlock(), createBlock(_component_modal_dialog, {
          key: 0,
          ref: "dialog",
          onLeave: _cache[4] || (_cache[4] = ($event) => _ctx.dialogVisable = false)
        }, {
          default: withCtx(() => [
            createVNode(_component_single_box, {
              ref: "packDialog",
              onLeave: _cache[3] || (_cache[3] = ($event) => _ctx.dialogVisable = false)
            }, null, 512)
          ]),
          _: 1
        }, 512)) : createCommentVNode("", true)
      ], 1024)),
      _ctx.expressionBuilderVisible ? (openBlock(), createBlock(_component_modal_dialog, {
        key: 0,
        ref: "dialog",
        onLeave: _cache[6] || (_cache[6] = ($event) => _ctx.expressionBuilderVisible = false)
      }, {
        default: withCtx(() => [
          createVNode(_component_expression_builder, {
            character: _ctx.expressionBuilderCharacter,
            initHeadGroup: _ctx.expressionBuilderHeadGroup,
            onLeave: _cache[5] || (_cache[5] = ($event) => _ctx.expressionBuilderVisible = false)
          }, null, 8, ["character", "initHeadGroup"])
        ]),
        _: 1
      }, 512)) : createCommentVNode("", true)
    ], 2)),
    _hoisted_4
  ], 64);
}
const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);
var __defProp$1 = Object.defineProperty;
var __defProps$1 = Object.defineProperties;
var __getOwnPropDescs$1 = Object.getOwnPropertyDescriptors;
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
var __spreadProps$1 = (a, b) => __defProps$1(a, __getOwnPropDescs$1(b));
function mergeContentPacks(x, y) {
  return {
    backgrounds: mergeBackgrounds(x.backgrounds, y.backgrounds),
    characters: mergeCharacters(x.characters, y.characters),
    dependencies: mergeArrayUnique(x.dependencies, y.dependencies),
    fonts: mergeIdArrays(
      x.fonts,
      y.fonts,
      (obj) => obj.id,
      (xObj, yObj) => __spreadProps$1(__spreadValues$1({}, xObj), {
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
        var _a;
        return {
          id: xObj.id,
          label: xObj.label,
          variants: [...xObj.variants, ...yObj.variants],
          defaultScale: xObj.defaultScale,
          hd: xObj.hd,
          sdVersion: (_a = xObj.sdVersion) != null ? _a : yObj.sdVersion
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
  var _a;
  return {
    id: x.id,
    label: x.label,
    variants: [...x.variants, ...y.variants],
    scaling: x.scaling,
    sdVersion: (_a = x.sdVersion) != null ? _a : y.sdVersion
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
  const ret = __spreadValues$1({}, x);
  for (const classKey in y) {
    if (!y.hasOwnProperty(classKey))
      continue;
    if (ret.hasOwnProperty(classKey))
      continue;
    ret[classKey] = y[classKey];
  }
  return ret;
}
function mergePose(x, y) {
  const positions2 = __spreadValues$1({}, x.positions);
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
  const ret = __spreadValues$1({}, x);
  for (const headGroupKey in y) {
    if (!y.hasOwnProperty(headGroupKey))
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
function mergeIdArrays(x, y, getId2, merge) {
  const ret = [...x];
  const definedIds = new Map(
    x.map((xObj, idx) => [getId2(xObj), idx])
  );
  for (const yObj of y) {
    const yId = getId2(yObj);
    if (definedIds.has(yId)) {
      const existingIdx = definedIds.get(yId);
      const existing = ret[existingIdx];
      ret.splice(existingIdx, 1, merge(existing, yObj));
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
            return new Promise((resolve2) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: resolve2
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
  const target = getTarget();
  const hook = getDevtoolsGlobalHook();
  const enableProxy = isProxyAvailable && pluginDescriptor.enableEarlyProxy;
  if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
    hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
  } else {
    const proxy = enableProxy ? new ApiProxy(pluginDescriptor, hook) : null;
    const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
    list.push({
      pluginDescriptor,
      setupFn,
      proxy
    });
    if (proxy)
      setupFn(proxy.proxiedTarget);
  }
}
/*!
 * vuex v4.0.2
 * (c) 2021 Evan You
 * @license MIT
 */
var storeKey = "store";
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
  store2.getters = {};
  store2._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
  var wrappedGetters = store2._wrappedGetters;
  var computedObj = {};
  forEachValue(wrappedGetters, function(fn, key) {
    computedObj[key] = partial(fn, store2);
    Object.defineProperty(store2.getters, key, {
      get: function() {
        return computedObj[key]();
      },
      enumerable: true
    });
  });
  store2._state = reactive({
    data: state
  });
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
  return new Promise(function(resolve2, reject) {
    result.then(function(res) {
      try {
        this$1$1._actionSubscribers.filter(function(sub) {
          return sub.after;
        }).forEach(function(sub) {
          return sub.after(action, this$1$1.state);
        });
      } catch (e) {
      }
      resolve2(res);
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
  var e_1, _a;
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
        if (_c && !_c.done && (_a = _b.return))
          _a.call(_b);
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
  var e_2, _a;
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
      if (_c && !_c.done && (_a = _b.return))
        _a.call(_b);
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
var parser$1 = {};
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
  var _a;
  var spriteFolder = joinNormalize$1(baseFolder, sprite.folder, ctx);
  return {
    id: expandId(ctx.packId, sprite.id),
    label: sprite.label || sprite.variants[0][0],
    variants: sprite.variants.map(function(variant) {
      return normalizFileCollection(variant, spriteFolder, ctx);
    }),
    defaultScale: sprite.defaultScale || [1, 1],
    sdVersion: sprite.sdVersion,
    hd: (_a = sprite.hd) !== null && _a !== void 0 ? _a : null
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
  var _a;
  var backgroundFolder = joinNormalize$1(baseFolder, background.folder, ctx);
  return {
    id: expandId(ctx.packId, background.id),
    label: background.label ? background.label : background.variants[0][0],
    variants: background.variants.map(function(collection) {
      return normalizFileCollection(collection, backgroundFolder, ctx);
    }),
    scaling: ["none", "strech", "cover"].includes((_a = background.scaling) === null || _a === void 0 ? void 0 : _a.toLowerCase()) ? background.scaling.toLowerCase() : "cover",
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
  var _a, _b, _c;
  var charFolder = joinNormalize$1(baseFolder, character.folder, ctx);
  return {
    id: expandId(ctx.packId, character.id),
    label: character.label,
    chibi: character.chibi ? joinNormalize$1(charFolder, character.chibi, ctx) : void 0,
    heads: normalizeHeads$1(character.heads, charFolder, ctx),
    defaultScale: (_a = character.defaultScale) !== null && _a !== void 0 ? _a : [0.8, 0.8],
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
  var _a, _b;
  var poseFolder = joinNormalize$1(baseFolder, pose.folder, ctx);
  return {
    compatibleHeads: ((_a = pose.compatibleHeads) === null || _a === void 0 ? void 0 : _a.map(function(head) {
      return expandId(ctx.packId, head);
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
var convertV1 = {};
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
  var e_1, _a;
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
    var e_2, _a2, e_3, _b;
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
        if (useComponents_1_1 && !useComponents_1_1.done && (_a2 = useComponents_1.return))
          _a2.call(useComponents_1);
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
      if (styleNames_1_1 && !styleNames_1_1.done && (_a = styleNames_1.return))
        _a.call(styleNames_1);
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
  var e_4, _a;
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
      if (_c && !_c.done && (_a = _b.return))
        _a.call(_b);
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
var __async$1 = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
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
      return __async$1(this, arguments, function* ({ commit: commit2, state }, action) {
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
      return __async$1(this, arguments, function* ({ commit: commit2, state }, urls) {
        if (typeof urls === "string") {
          urls = [urls];
        }
        const contentPacks = yield Promise.all(
          urls.map((url) => __async$1(this, null, function* () {
            return loadContentPack(url);
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
  return __async$1(this, null, function* () {
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
  return __async$1(this, null, function* () {
    const types2 = new Set(
      (yield isWebPSupported()) ? ["webp", ...baseTypes] : baseTypes
    );
    const replacementMap = /* @__PURE__ */ new Map([
      ["ext", "{lq:.lq:}.{format:webp:webp:png:png}"]
    ]);
    return assetWalker_1(
      pack,
      (path, _type) => {
        var _a;
        const hq = normalizePath_1(path, replacementMap, types2, false);
        const lq = normalizePath_1(path, replacementMap, types2, true);
        return {
          hq,
          lq,
          sourcePack: (_a = pack.packId) != null ? _a : "buildIn"
        };
      }
    );
  });
}
const uploadUrls = {
  namespaced: true,
  state: {},
  mutations: {
    add(state, { name, url }) {
      state[name] = url;
    }
  },
  actions: {
    add({ state, commit: commit2 }, { name, url }) {
      if (state[name]) {
        throw new Error(`There is already an uploaded file called "${name}"`);
      }
      const assertUrl = "uploads:" + name;
      commit2("add", { name: assertUrl, url });
      registerAssetWithURL(assertUrl, url);
      return assertUrl;
    }
  }
};
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async2 = (__this, __arguments, generator) => {
  return new Promise((resolve2, reject) => {
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
    var step = (x) => x.done ? resolve2(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const store = createStore({
  state: {
    unsafe: false
  },
  mutations: {
    setUnsafe(state, unsafe) {
      state.unsafe = unsafe;
    }
  },
  actions: {
    removePacks(_0, _1) {
      return __async2(this, arguments, function* ({ dispatch: dispatch2, commit: commit2 }, { packs }) {
        commit2("setUnsafe", true);
        dispatch2("content/removeContentPacks", packs);
        commit2("setUnsafe", false);
      });
    },
    getSave({ state }, compact) {
      return JSON.stringify(
        state,
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
                var _a, _b;
                return !((_a = x.packId) == null ? void 0 : _a.startsWith("dddg.buildin.")) || ((_b = x.packId) == null ? void 0 : _b.endsWith(".nsfw"));
              }
            ).map(
              (x) => {
                var _a;
                return ((_a = x.packId) == null ? void 0 : _a.startsWith("dddg.uploads.")) ? x : x.packId;
              }
            );
          return value;
        },
        2
      );
    },
    loadSave(_0, _1) {
      return __async2(this, arguments, function* ({ state }, str) {
        const data = JSON.parse(str);
        const contentData = data.content;
        data.ui = __spreadProps(__spreadValues({}, getDefaultUiState()), {
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
              var _a;
              return (_a = x.packId) == null ? void 0 : _a.startsWith("dddg.buildin.");
            }
          ),
          ...(yield Promise.all(
            contentData.map((x) => __async2(this, null, function* () {
              if (typeof x === "string") {
                const alreadyLoaded = state.content.contentPacks.find(
                  (pack2) => pack2.packId === x
                );
                if (alreadyLoaded)
                  return alreadyLoaded;
                if (x.startsWith("dddg.buildin.") && x.endsWith(".nsfw")) {
                  const loaded2 = yield loadContentPack(
                    NsfwPacks[x]
                  );
                  return yield convertContentPack(loaded2);
                }
                const pack = repo.getPack(x);
                if (!pack) {
                  console.warn(`Pack Id ${x} not found!`);
                  return null;
                }
                const loaded = yield loadContentPack(
                  pack.dddg2Path || pack.dddg1Path
                );
                return yield convertContentPack(loaded);
              } else {
                return x;
              }
            }))
          )).filter((x) => x !== null)
        ];
        let combinedPack = data.content.current;
        for (const contentPack of data.content.contentPacks) {
          combinedPack = mergeContentPacks(combinedPack, contentPack);
        }
        data.content.current = combinedPack;
        this.replaceState(data);
        eventBus$1.fire(new InvalidateRenderEvent());
      });
    }
  },
  modules: { ui, panels, content, uploadUrls }
});
const History = {
  install(vueApp, options = {}) {
    if (!vueApp.config.globalProperties.$store) {
      throw new Error(
        "VuexUndoRedo plugin must be installed after the Vuex plugin."
      );
    }
    if (!options.resetStateMutation)
      options.resetStateMutation = "emptyState";
    if (!options.mutations)
      options.mutations = {};
    const $store = vueApp.config.globalProperties.$store;
    function replayMutation(vm, mutation) {
      let baseObj = {};
      switch (typeof mutation.payload) {
        case "object":
          if (mutation.payload instanceof Array) {
            baseObj = [];
          }
          $store.commit(
            `${mutation.type}`,
            Object.assign(baseObj, mutation.payload)
          );
          break;
        default:
          $store.commit(`${mutation.type}`, mutation.payload);
      }
    }
    function replayTransaction(vm, transaction) {
      return __async(this, null, function* () {
        return yield vm.transaction(() => {
          transaction.forEach((mutation) => {
            replayMutation(vm, mutation);
          });
        });
      });
    }
    function replayAll(vm) {
      return __async(this, null, function* () {
        const oldTransactions = vm.data.done.slice(0);
        vm.data.done = [];
        $store.commit(options.resetStateMutation);
        for (let i = 0; i < oldTransactions.length; ++i) {
          yield replayTransaction(vm, oldTransactions[i]);
        }
      });
    }
    const mutationProperiesCache = {};
    function getMutationProperties(name) {
      if (!mutationProperiesCache[name]) {
        const parts = name.split("/");
        const mutationProperties = {
          ignore: (_mutation) => false,
          combinable: (_oldMutation, _newMutation) => false,
          combinator: (oldMutation, newMutation) => newMutation
        };
        let currentWildcard = "";
        for (const part of parts) {
          if (options.mutations[currentWildcard + "*"]) {
            Object.assign(
              mutationProperties,
              options.mutations[currentWildcard + "*"]
            );
          }
          currentWildcard += part + "/";
        }
        if (options.mutations[name]) {
          Object.assign(mutationProperties, options.mutations[name]);
        }
        mutationProperiesCache[name] = mutationProperties;
      }
      return mutationProperiesCache[name];
    }
    const history = {
      data: reactive({
        done: [],
        undone: [],
        snapshots: [],
        transactionsSinceSnapshot: 0,
        newMutation: true,
        ignoreMutations: options.ignoreMutations || [],
        currentTransaction: null,
        transactionQueue: [],
        initialized: false
      }),
      initialize() {
        if (history.initialized)
          return;
        history.initialized = true;
        $store.subscribe((mutation) => {
          const exec = () => {
            if (mutation.type === options.resetStateMutation || getMutationProperties(mutation.type).ignore(mutation)) {
              return;
            }
            history.currentTransaction.push(mutation);
            if (history.newMutation) {
              history.data.undone = [];
            }
          };
          if (history.currentTransaction) {
            exec();
          } else {
            history.transaction(() => {
              exec();
            });
          }
        });
      },
      redo() {
        return __async(this, null, function* () {
          if (history.data.undone.length <= 0)
            return;
          const commit2 = history.data.undone.pop();
          history.newMutation = false;
          yield replayTransaction(history, commit2);
          history.newMutation = true;
        });
      },
      undo() {
        return __async(this, null, function* () {
          if (history.data.done.length <= 0)
            return;
          history.data.undone.push(history.data.done.pop());
          history.newMutation = false;
          yield replayAll(history);
          history.newMutation = true;
        });
      },
      clearHistory() {
        return new Promise((resolve2, _reject) => {
          const exec = () => __async(this, null, function* () {
            history.currentTransaction = [];
            history.transactionsSinceSnapshot = 0;
            history.data.undone = [];
            history.data.done = [];
            resolve2();
            history.currentTransaction = null;
            if (history.data.transactionQueue.length > 0) {
              history.data.transactionQueue.shift()();
            }
          });
          if (history.currentTransaction) {
            history.data.transactionQueue.push(exec);
          } else {
            exec();
          }
        });
      },
      transaction(callback) {
        return new Promise((resolve2, _reject) => {
          const exec = () => __async(this, null, function* () {
            history.currentTransaction = [];
            history.transactionsSinceSnapshot++;
            try {
              yield callback();
            } catch (e) {
              console.log("Error during transaction!: ", e);
            }
            history.currentTransaction = null;
            if (history.data.transactionQueue.length > 0) {
              history.data.transactionQueue.shift()();
            }
            resolve2();
          });
          if (history.currentTransaction) {
            history.data.transactionQueue.push(exec);
          } else {
            exec();
          }
        });
      }
    };
    window.storeHistory = history;
    vueApp.config.globalProperties.vuexHistory = history;
    history.initialize();
  }
};
createApp(App).use(store).use(History).mount("#main_wrapper");
export {
  DFieldset as A,
  getAAssetUrl as B,
  getAssetByUrl as C,
  DropTarget as D,
  Renderer as E,
  Fragment as F,
  Character as G,
  vModelSelect as H,
  L,
  Repo as R,
  SelectedState as S,
  TransitionGroup as T,
  VueErrorEvent as V,
  _export_sfc as _,
  createBaseVNode as a,
  withModifiers as b,
  createElementBlock as c,
  defineComponent as d,
  createCommentVNode as e,
  createStaticVNode as f,
  popScopeId as g,
  createVNode as h,
  withCtx as i,
  ToggleBox as j,
  envX as k,
  resolveComponent as l,
  createTextVNode as m,
  normalizeClass as n,
  openBlock as o,
  pushScopeId as p,
  createBlock as q,
  renderList as r,
  normalizeStyle$1 as s,
  toDisplayString as t,
  eventBus$1 as u,
  vModelText as v,
  withDirectives as w,
  reactive as x,
  renderSlot as y,
  VerticalScrollRedirect as z
};
