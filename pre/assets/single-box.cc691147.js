import { d as defineComponent, r as ref, c as computed, w as watch, o as openBlock, a as createElementBlock, b as createBaseVNode, F as Fragment, e as renderList, t as toDisplayString, f as createCommentVNode, g as createVNode, h as withCtx, n as normalizeClass, T as TransitionGroup, i as nextTick, _ as _export_sfc, u as useStore, j as createTextVNode, k as unref, l as _sfc_main$4, m as createBlock, p as _sfc_main$5, q as normalizeStyle, s as withModifiers, v as envX, x as pushScopeId, y as popScopeId, z as onMounted, A as onUnmounted, B as withDirectives, C as vModelText, D as createStaticVNode, E as onActivated, G as safeAsync, R as Repo, H as eventBus, V as VueErrorEvent } from "./index.2e1cbb44.js";
const availablePrefixes = ["author", "character", "type", "pack", "engine"];
const prefixLookup = /* @__PURE__ */ new Map();
for (const prefix of availablePrefixes) {
  for (let i = 1; i <= prefix.length; ++i) {
    const short = prefix.slice(0, i);
    prefixLookup.set(short, prefix);
  }
}
const spaceMatcher = /\s/;
function parseSearchwords(str) {
  const matchers = [];
  let word = "";
  let type = "";
  let quote = false;
  let escape = false;
  function finishWord() {
    matchers.push({
      type: type || "all",
      payload: word.toLowerCase()
    });
    word = "";
    type = "";
    escape = false;
    quote = false;
  }
  for (const char of str) {
    if (escape) {
      word += char;
      escape = false;
      continue;
    }
    switch (char) {
      case "\\":
        escape = true;
        continue;
      case ":":
        const lowerWord = word.toLowerCase();
        if (!quote && type === "" && prefixLookup.has(lowerWord)) {
          type = prefixLookup.get(lowerWord);
          word = "";
          continue;
        }
        break;
      case '"':
        if (quote) {
          finishWord();
        } else {
          quote = true;
        }
        continue;
    }
    if (!quote && spaceMatcher.test(char)) {
      if (word) {
        finishWord();
      }
    } else {
      word += char;
    }
  }
  if (word)
    finishWord();
  return matchers;
}
const matchCost = /* @__PURE__ */ new Map([
  ["engine", 0],
  ["pack", 1],
  ["type", 2],
  ["character", 2],
  ["author", 2],
  ["all", 3]
]);
function optimize(matchers) {
  return sortByCost(deduplicateMatchers(matchers));
}
function sortByCost(matchers) {
  return matchers.sort((a, b) => matchCost.get(a.type) - matchCost.get(b.type) || b.payload.length - a.payload.length);
}
function deduplicateMatchers(matchers) {
  const splitByType = /* @__PURE__ */ new Map();
  for (const matcher of matchers) {
    let list = splitByType.get(matcher.type);
    if (!list) {
      list = [];
      splitByType.set(matcher.type, list);
    }
    list.push(matcher);
  }
  for (const key of splitByType.keys()) {
    const value = splitByType.get(key);
    const quickDeprefix = value.sort((a, b) => a.payload.localeCompare(b.payload)).filter((matcher, idx, ary) => {
      if (!ary[idx + 1])
        return true;
      return !ary[idx + 1].payload.startsWith(matcher.payload);
    });
    splitByType.set(key, quickDeprefix.filter((matcher, idx, ary) => {
      return !ary.find((collision, collIdx) => collIdx !== idx && collision.payload.indexOf(matcher.payload) !== -1);
    }));
  }
  const specializedTypes = Array.from(splitByType.keys()).filter((type) => type !== "all");
  splitByType.set("all", (splitByType.get("all") || []).filter((matcher) => {
    return !specializedTypes.find((typeKey) => splitByType.get(typeKey).find((competingMatcher) => competingMatcher.payload.indexOf(matcher.payload) !== -1));
  }));
  return [...splitByType.values()].flatMap((x) => x);
}
class EngineMatcher {
  constructor(payload) {
    payload = payload.replace(/[\s-]/g, "").toLowerCase();
    const matchingProps = /* @__PURE__ */ new Set();
    for (const [searchText, key] of EngineMatcher.engines) {
      if (searchText.toLowerCase().indexOf(payload) >= 0) {
        matchingProps.add(key);
      }
    }
    this.matchingProps = Array.from(matchingProps);
  }
  get isImpossible() {
    return this.matchingProps.length === 0;
  }
  match(pack) {
    for (const matchingProp of this.matchingProps) {
      if (pack[matchingProp])
        return true;
    }
    return false;
  }
}
EngineMatcher.engines = [
  ["Doki Doki Dialog Generator 1", "dddg1Path"],
  ["Doki Doki Dialouge Generator 1", "dddg1Path"],
  ["DDDG1", "dddg1Path"],
  ["Doki Doki Dialog Generator 2", "dddg2Path"],
  ["Doki Doki Dialouge Generator 2", "dddg2Path"],
  ["DDDG2", "dddg2Path"],
  ["Doki Doki Comic Club 2", "ddcc2Path"],
  ["DDCC2", "ddcc2Path"]
].map(([searchTerm, prop]) => [
  searchTerm.replace(/\s/g, "").toLowerCase(),
  prop
]);
class AuthorMatcher {
  constructor(payload, peopleRepository) {
    payload = payload.toLowerCase();
    const matchingAuthors = /* @__PURE__ */ new Set();
    for (const authorKey in peopleRepository) {
      if (!Object.prototype.hasOwnProperty.call(peopleRepository, authorKey))
        continue;
      const author = peopleRepository[authorKey];
      const props = Object.keys(author);
      if (authorKey.toLowerCase().indexOf(payload) >= 0 || props.find((prop) => author[prop].toLowerCase().indexOf(payload) >= 0)) {
        matchingAuthors.add(authorKey);
      }
    }
    this.matchingAuthors = matchingAuthors;
  }
  get isImpossible() {
    return this.matchingAuthors.size === 0;
  }
  match(pack) {
    return !!pack.authors.find((author) => this.matchingAuthors.has(author));
  }
}
class CharacterMatcher {
  constructor(payload, _peopleRepository, packRepository) {
    payload = payload.toLowerCase();
    this.matchingCharacters = new Set(CharacterMatcher.getUniqueCharacters(packRepository).filter((char) => char.toLowerCase().indexOf(payload) >= 0));
  }
  get isImpossible() {
    return this.matchingCharacters.size === 0;
  }
  match(pack) {
    return !!pack.characters.find((character) => this.matchingCharacters.has(character));
  }
  static getUniqueCharacters(repo) {
    let unique = this.uniqueCharacters.get(repo);
    if (!unique) {
      unique = Array.from(new Set(repo.flatMap((pack) => pack.characters)));
      this.uniqueCharacters.set(repo, unique);
    }
    return unique;
  }
}
CharacterMatcher.uniqueCharacters = /* @__PURE__ */ new Map();
class TypeMatcher {
  constructor(payload) {
    payload = payload.toLowerCase();
    this.matchingTypes = new Set(TypeMatcher.types.filter((type) => type.toLowerCase().indexOf(payload) >= 0));
  }
  get isImpossible() {
    return this.matchingTypes.size === 0;
  }
  match(pack) {
    return !!pack.kind.find((character) => this.matchingTypes.has(character));
  }
}
TypeMatcher.types = [
  "Styles",
  "Characters",
  "Expressions",
  "Poses",
  "Backgrounds",
  "Sprites",
  "Misc"
];
class PackMatcher {
  constructor(payload, _peopleRepository, packRepository) {
    payload = payload.toLowerCase();
    this.payload = payload;
    const triplets = PackMatcher.getTriplets(packRepository);
    for (let i = 0, length = payload.length - 2; i < length; ++i) {
      if (!triplets.has(payload.substr(i, 3))) {
        this.isImpossible = true;
        return;
      }
    }
    this.isImpossible = false;
  }
  match(pack) {
    if (this.isImpossible)
      return false;
    const payload = this.payload;
    return !!(pack.id.toLowerCase().indexOf(payload) >= 0 || pack.name.toLowerCase().indexOf(payload) >= 0 || pack.searchWords.find((word) => word.toLowerCase().indexOf(payload) >= 0));
  }
  static getTriplets(repo) {
    let triplets = this.tripletCache.get(repo);
    if (!triplets) {
      triplets = /* @__PURE__ */ new Set();
      for (const pack of repo) {
        PackMatcher.splitTriplets(pack.id, triplets);
        PackMatcher.splitTriplets(pack.name, triplets);
        for (const word of pack.searchWords) {
          PackMatcher.splitTriplets(word, triplets);
        }
      }
      this.tripletCache.set(repo, triplets);
    }
    return triplets;
  }
  static splitTriplets(str, cache) {
    str = str.toLowerCase();
    for (let i = 0, length = str.length - 2; i < length; ++i) {
      cache.add(str.substr(i, 3));
    }
  }
}
PackMatcher.tripletCache = /* @__PURE__ */ new Map();
class AllMatcher {
  constructor(payload, peopleRepository, packRepository) {
    this.matchers = AllMatcher.allMatchers.map((compiler) => new compiler(payload, peopleRepository, packRepository)).filter((matcher) => !matcher.isImpossible);
  }
  get isImpossible() {
    return this.matchers.length === 0;
  }
  match(pack) {
    return !!this.matchers.find((matcher) => matcher.match(pack));
  }
}
AllMatcher.allMatchers = [
  EngineMatcher,
  AuthorMatcher,
  CharacterMatcher,
  TypeMatcher,
  PackMatcher
];
const CompilerMatch = /* @__PURE__ */ new Map([
  ["all", AllMatcher],
  ["author", AuthorMatcher],
  ["character", CharacterMatcher],
  ["engine", EngineMatcher],
  ["pack", PackMatcher],
  ["type", TypeMatcher]
]);
function compile(matchers, authors, packs) {
  return matchers.map((matcher) => new (CompilerMatch.get(matcher.type))(matcher.payload, authors, packs));
}
function filter(search, authors, list) {
  const parsed = parseSearchwords(search);
  const optimized = optimize(parsed);
  const compiled = compile(optimized, authors, list);
  if (compiled.find((matcher) => matcher.isImpossible))
    return [];
  return list.filter((pack) => compiled.every((matcher) => matcher.match(pack)));
}
const _hoisted_1$3 = ["tabindex", "onClick", "onKeydown"];
const _hoisted_2$3 = { key: 0 };
const _hoisted_3$2 = ["onMousedown", "onClick"];
const pageKeyMoveBy = 10;
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "list",
  props: {
    search: { type: String, required: true },
    repo: {
      type: Object
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ["selected", "select-search-bar"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const root = ref(null);
    const tbody = ref(null);
    const header = ref(null);
    const sort = ref("");
    const desc = ref(false);
    const focusedItem = ref("");
    const packs = computed(() => {
      if (!props.repo)
        return [];
      return props.repo.getPacks();
    });
    const list = computed(() => {
      const filtered = filterList(packs.value, props.search);
      if (sort.value && filtered.length > 0) {
        const sort_ = sort.value;
        let sortFunc;
        if (typeof filtered[0][sort_] === "string") {
          sortFunc = (a, b) => a.name.localeCompare(b.name);
        } else if (filtered[0][sort_] instanceof Array) {
          sortFunc = (a, b) => a[sort_].join(", ").localeCompare(b[sort_].join(", "));
        }
        if (sortFunc) {
          if (desc.value) {
            const oldSort = sortFunc;
            sortFunc = (b, a) => oldSort(a, b);
          }
          filtered.sort(sortFunc);
        }
      }
      return filtered;
    });
    function focus() {
      tbody.value.$el.focus();
    }
    function keydownHandler(event) {
      const indexOf = list.value.findIndex((pack) => pack.id === focusedItem.value);
      switch (event.key) {
        case "Enter":
          emit("selected", { id: focusedItem.value, source: "keyboard" });
          event.stopPropagation();
          event.preventDefault();
          break;
        case "ArrowUp":
          event.preventDefault();
          event.stopPropagation();
          if (indexOf === 0) {
            emit("select-search-bar");
          } else {
            focusedItem.value = list.value[indexOf - 1].id;
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          event.stopPropagation();
          if (indexOf < list.value.length - 1) {
            focusedItem.value = list.value[indexOf + 1].id;
          }
          break;
        case "PageUp": {
          event.preventDefault();
          event.stopPropagation();
          let newIdx = indexOf - pageKeyMoveBy;
          if (newIdx < 0) {
            newIdx = 0;
          }
          focusedItem.value = list.value[newIdx].id;
          break;
        }
        case "PageDown": {
          event.preventDefault();
          event.stopPropagation();
          let newIdx = indexOf + pageKeyMoveBy;
          const max = list.value.length - 1;
          if (newIdx > max) {
            newIdx = max;
          }
          focusedItem.value = list.value[newIdx].id;
          break;
        }
      }
    }
    function headerKeydownListener(event, headerId) {
      switch (event.key) {
        case "Enter":
        case " ":
          sortBy(headerId);
          event.preventDefault();
          event.stopPropagation();
          break;
        case "ArrowDown":
          focus();
          event.stopPropagation();
          event.preventDefault();
          break;
        case "ArrowUp":
          emit("select-search-bar");
          event.stopPropagation();
          event.preventDefault();
          break;
      }
    }
    function updateFocusedItem() {
      if (list.value.length === 0) {
        focusedItem.value = "";
        return;
      }
      if (focusedItem.value === "") {
        focusedItem.value = list.value[0].id;
      }
      nextTick(() => {
        const element = document.querySelector(".list tbody .focused");
        const containerHeight = root.value.offsetHeight - header.value.offsetHeight;
        const scrollTop = root.value.scrollTop;
        const scrollBottom = scrollTop + containerHeight;
        if (element) {
          const itemTop = element.offsetTop - header.value.offsetHeight;
          const itemBottom = itemTop + element.offsetHeight;
          if (itemBottom > scrollBottom) {
            root.value.scrollTop = itemBottom - containerHeight;
          } else if (itemTop < scrollTop) {
            root.value.scrollTop = itemTop;
          }
        }
      });
    }
    function sortBy(by) {
      if (sort.value === by) {
        if (!desc.value) {
          desc.value = true;
        } else {
          sort.value = "";
          desc.value = false;
        }
      } else {
        sort.value = by;
        desc.value = false;
      }
    }
    function filterList(list2, search) {
      if (!search)
        return [...list2];
      return filter(
        search,
        props.repo ? props.repo.getAuthors() : {},
        list2
      );
    }
    function translatePackState(state) {
      if (state.loaded)
        return "Active";
      if (state.installed)
        return "Installed";
      return "";
    }
    watch(() => focusedItem.value, updateFocusedItem);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "root",
        ref: root,
        class: "list"
      }, [
        createBaseVNode("table", null, [
          createBaseVNode("thead", null, [
            createBaseVNode("tr", {
              ref_key: "header",
              ref: header
            }, [
              (openBlock(), createElementBlock(Fragment, null, renderList([
                ["name", "Pack"],
                ["characters", "Character"],
                ["kind", "Type"],
                ["authors", "Authors"],
                ["state", "Status"]
              ], (header2, idx) => {
                return createBaseVNode("th", {
                  key: idx,
                  tabindex: __props.disabled ? -1 : 0,
                  onClick: ($event) => sortBy(header2[0]),
                  onKeydown: ($event) => headerKeydownListener($event, header2[0])
                }, [
                  createBaseVNode("div", null, [
                    createBaseVNode("div", null, toDisplayString(header2[1]), 1),
                    sort.value === header2[0] ? (openBlock(), createElementBlock("div", _hoisted_2$3, toDisplayString(desc.value ? "\u25BC" : "\u25B2"), 1)) : createCommentVNode("", true)
                  ])
                ], 40, _hoisted_1$3);
              }), 64))
            ], 512)
          ]),
          createVNode(TransitionGroup, {
            name: "tbody-group",
            tag: "tbody",
            ref_key: "tbody",
            ref: tbody,
            tabindex: __props.disabled ? -1 : 0,
            onKeydown: keydownHandler,
            onFocus: updateFocusedItem
          }, {
            default: withCtx(() => [
              (openBlock(true), createElementBlock(Fragment, null, renderList(list.value, (pack) => {
                return openBlock(), createElementBlock("tr", {
                  key: pack.id,
                  class: normalizeClass({
                    "tbody-group-item": true,
                    focused: focusedItem.value === pack.id
                  }),
                  onMousedown: ($event) => focusedItem.value = pack.id,
                  onClick: ($event) => emit("selected", { id: pack.id, source: "pointer" })
                }, [
                  createBaseVNode("td", null, toDisplayString(pack.name), 1),
                  createBaseVNode("td", null, toDisplayString(pack.characters.join(", ")), 1),
                  createBaseVNode("td", null, toDisplayString(pack.kind.join(", ")), 1),
                  createBaseVNode("td", null, toDisplayString(pack.authors.join(", ")), 1),
                  createBaseVNode("td", null, toDisplayString(translatePackState(pack)), 1)
                ], 42, _hoisted_3$2);
              }), 128))
            ]),
            _: 1
          }, 8, ["tabindex"])
        ])
      ], 512);
    };
  }
});
const list_vue_vue_type_style_index_0_scoped_69bf1510_lang = "";
const List = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-69bf1510"]]);
const allowedTags = [
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "p",
  "a",
  "ul",
  "ol",
  "nl",
  "li",
  "b",
  "i",
  "strong",
  "em",
  "strike",
  "code",
  "hr",
  "br",
  "div",
  "table",
  "thead",
  "caption",
  "tbody",
  "tr",
  "th",
  "td",
  "pre"
];
const allowedAttributes = {
  a: ["href"],
  img: ["src"]
};
const schemaLimitedAttributes = ["href", "src"];
const allowedSchemas = ["http", "https"];
const enforceAttributes = {
  a: {
    target: "_blank",
    rel: "noopener noreferrer"
  }
};
function sanitize(html) {
  const retDoc = document.createElement("div");
  const doc = document.createElement("div");
  doc.innerHTML = html;
  for (const node of Array.from(doc.childNodes)) {
    for (const sanitizedNode of sanitizeElement(node)) {
      retDoc.appendChild(sanitizedNode);
    }
  }
  return retDoc.innerHTML;
}
const protocolMatcher = /^(\w+):/;
function sanitizeElement(node) {
  if (node.nodeType !== Node.ELEMENT_NODE)
    return [node];
  const el = node;
  const tagName = el.tagName.toLowerCase();
  if (allowedTags.includes(tagName)) {
    const newEl = document.createElement(tagName);
    const attrs = Array.prototype.slice.call(el.attributes);
    const allowedAttrs = allowedAttributes[tagName] || [];
    for (const attr of attrs) {
      if (!allowedAttrs.includes(attr.name))
        continue;
      if (schemaLimitedAttributes.includes(attr.name)) {
        const protocolMatch = attr.value.match(protocolMatcher);
        if (protocolMatch && !allowedSchemas.includes(protocolMatch[1])) {
          continue;
        }
      }
      newEl.setAttribute(attr.name, el.getAttribute(attr.name));
    }
    const enforce = enforceAttributes[tagName];
    if (enforce) {
      for (const attrName in enforce) {
        if (!Object.prototype.hasOwnProperty.call(enforce, attrName))
          continue;
        newEl.setAttribute(attrName, enforce[attrName]);
      }
    }
    const children = Array.prototype.slice.call(el.childNodes);
    for (const childNode of children) {
      const subNodes = sanitizeElement(childNode);
      for (const subNode of subNodes) {
        newEl.appendChild(subNode);
      }
    }
    return [newEl];
  } else {
    let ret = [];
    ret.push(document.createTextNode(`<${tagName}>`));
    for (const subNode of el.childNodes) {
      ret = ret.concat(sanitizeElement(subNode));
    }
    ret.push(document.createTextNode(`</${tagName}>`));
    return ret;
  }
}
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
const _withScopeId$1 = (n) => (pushScopeId("data-v-5c5c818a"), n = n(), popScopeId(), n);
const _hoisted_1$2 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "arrow_back", -1));
const _hoisted_2$2 = [
  _hoisted_1$2
];
const _hoisted_3$1 = ["innerHTML"];
const _hoisted_4$1 = { key: 1 };
const _hoisted_5$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "add", -1));
const _hoisted_6$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "remove", -1));
const _hoisted_7$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "add", -1));
const _hoisted_8$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "remove", -1));
const _hoisted_9$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("h3", null, "Authors", -1));
const _hoisted_10 = ["title", "src"];
const _hoisted_11 = { key: 2 };
const _hoisted_12 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("h3", null, "Credits", -1));
const _hoisted_13 = ["innerHTML"];
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "pack-display",
  props: {
    selected: {
      type: String,
      required: true
    },
    repo: {
      type: Object,
      require: true
    },
    showBack: {
      type: Boolean,
      require: false
    }
  },
  setup(__props) {
    const linkablePlatforms = [
      ["reddit", "https://reddit.com/u/%1", "reddit.png"],
      ["deviantart", "https://www.deviantart.com/%1", "deviantart.png"],
      ["twitter", "https://twitter.com/%1", "twitter.svg"],
      ["pixiv", "https://www.pixiv.net/users/%1", "pixiv.ico"],
      ["patreon", "https://www.patreon.com/%1", "patreon.png"],
      ["facebook", "https://www.facebook.com/%1", "facebook.png"],
      ["github", "https://github.com/%1", "github.png"],
      ["website", "%1", "website.svg"]
    ];
    const store = useStore();
    const props = __props;
    const pack = computed(() => props.repo.getPack(props.selected));
    const backgroundImage = computed(
      () => pack.value.preview.map((preview) => `url('${preview}')`).join(",")
    );
    const removable = computed(() => pack.value.loaded);
    const addable = computed(() => !pack.value.loaded);
    const autoloadEnabled = computed(() => envX.supports.autoLoading);
    const installable = computed(() => {
      if (!envX.supports.localRepo)
        return false;
      return !pack.value.installed;
    });
    const uninstallable = computed(() => {
      if (!envX.supports.localRepo)
        return false;
      return pack.value.installed;
    });
    const autoload = computed({
      get() {
        return envX.state.autoAdd.includes(props.selected);
      },
      set(val) {
        let loadId = props.selected;
        const pack_ = pack.value;
        if (pack_.repoUrl != null)
          loadId += `;${pack_.repoUrl}`;
        if (val) {
          envX.autoLoadAdd(loadId);
        } else {
          envX.autoLoadRemove(loadId);
        }
      }
    });
    function authorName(authorId) {
      const author = props.repo.getAuthor(authorId);
      if (author && author.currentName != null)
        return author.currentName;
      return authorId;
    }
    function authorsLinks(authorId) {
      const author = props.repo.getAuthor(authorId);
      if (!author)
        return [];
      return linkablePlatforms.filter((platform) => author[platform[0]]).map((platform) => {
        const value = author[platform[0]];
        const target = platform[1].replace("%1", value);
        return {
          target,
          platform: platform[0][0].toUpperCase() + platform[0].slice(1),
          icon: "icons/" + platform[2]
        };
      });
    }
    function install() {
      if (pack.value.installed)
        return;
      const authors = {};
      for (const key of pack.value.authors) {
        authors[key] = __spreadValues({}, props.repo.getAuthor(key));
      }
      const pack_ = JSON.parse(JSON.stringify(pack.value));
      delete pack_.autoloading;
      delete pack_.online;
      delete pack_.loaded;
      delete pack_.installed;
      envX.localRepoInstall(
        pack.value.dddg2Path || pack.value.dddg1Path,
        pack_,
        authors
      );
    }
    function uninstall() {
      return __async$1(this, null, function* () {
        var _a;
        const pack_ = pack.value;
        if (!pack_.installed)
          return;
        if (pack_.repoUrl && !((_a = props.repo) == null ? void 0 : _a.hasPack(pack_.id, true))) {
          yield props.repo.loadTempPack(pack_.repoUrl);
        }
        envX.localRepoUninstall(pack_.id);
      });
    }
    function remove() {
      return __async$1(this, null, function* () {
        yield store.dispatch("removePacks", {
          packs: /* @__PURE__ */ new Set([pack.value.id])
        });
      });
    }
    function add() {
      return __async$1(this, null, function* () {
        yield store.dispatch(
          "content/loadContentPacks",
          pack.value.dddg2Path || pack.value.dddg1Path
        );
      });
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "pack-display",
        style: normalizeStyle({ backgroundImage: backgroundImage.value }),
        onClick: _cache[2] || (_cache[2] = withModifiers(() => {
        }, ["stop"]))
      }, [
        createBaseVNode("header", null, [
          createBaseVNode("h1", null, [
            __props.showBack ? (openBlock(), createElementBlock("button", {
              key: 0,
              class: "exit-button",
              onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("leave", true))
            }, _hoisted_2$2)) : createCommentVNode("", true),
            createTextVNode(" " + toDisplayString(pack.value.name), 1)
          ]),
          createBaseVNode("h2", null, toDisplayString(pack.value.id), 1)
        ]),
        pack.value.disclaimer ? (openBlock(), createElementBlock("section", {
          key: 0,
          class: "disclaimer",
          innerHTML: unref(sanitize)(pack.value.disclaimer)
        }, null, 8, _hoisted_3$1)) : createCommentVNode("", true),
        pack.value.source ? (openBlock(), createElementBlock("section", _hoisted_4$1, [
          createVNode(_sfc_main$4, {
            to: pack.value.source
          }, {
            default: withCtx(() => [
              createTextVNode("Source")
            ]),
            _: 1
          }, 8, ["to"])
        ])) : createCommentVNode("", true),
        createBaseVNode("section", null, [
          addable.value ? (openBlock(), createElementBlock("button", {
            key: 0,
            onClick: add
          }, [
            _hoisted_5$1,
            createTextVNode(" Activate ")
          ])) : createCommentVNode("", true),
          removable.value ? (openBlock(), createElementBlock("button", {
            key: 1,
            onClick: remove
          }, [
            _hoisted_6$1,
            createTextVNode(" Deactivate ")
          ])) : createCommentVNode("", true),
          installable.value ? (openBlock(), createElementBlock("button", {
            key: 2,
            onClick: install
          }, [
            _hoisted_7$1,
            createTextVNode(" Store locally ")
          ])) : createCommentVNode("", true),
          uninstallable.value ? (openBlock(), createElementBlock("button", {
            key: 3,
            onClick: uninstall
          }, [
            _hoisted_8$1,
            createTextVNode(" Remove locally ")
          ])) : createCommentVNode("", true),
          autoloadEnabled.value ? (openBlock(), createBlock(_sfc_main$5, {
            key: 4,
            label: "Load on startup",
            modelValue: autoload.value,
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => autoload.value = $event)
          }, null, 8, ["modelValue"])) : createCommentVNode("", true)
        ]),
        createBaseVNode("section", null, [
          _hoisted_9$1,
          createBaseVNode("table", null, [
            createBaseVNode("tbody", null, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(pack.value.authors, (authorId) => {
                return openBlock(), createElementBlock("tr", { key: authorId }, [
                  createBaseVNode("td", null, toDisplayString(authorName(authorId)), 1),
                  createBaseVNode("td", null, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(authorsLinks(authorId), (link) => {
                      return openBlock(), createBlock(_sfc_main$4, {
                        key: link.target,
                        to: link.target,
                        class: "platform_button"
                      }, {
                        default: withCtx(() => [
                          createBaseVNode("img", {
                            title: link.platform,
                            src: link.icon,
                            height: "32",
                            width: "32",
                            alt: ""
                          }, null, 8, _hoisted_10)
                        ]),
                        _: 2
                      }, 1032, ["to"]);
                    }), 128))
                  ])
                ]);
              }), 128))
            ])
          ])
        ]),
        pack.value.description ? (openBlock(), createElementBlock("section", _hoisted_11, [
          _hoisted_12,
          createBaseVNode("p", {
            innerHTML: unref(sanitize)(pack.value.description)
          }, null, 8, _hoisted_13)
        ])) : createCommentVNode("", true)
      ], 4);
    };
  }
});
const packDisplay_vue_vue_type_style_index_0_scoped_5c5c818a_lang = "";
const packDisplay_vue_vue_type_style_index_1_lang = "";
const PackDisplay = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-5c5c818a"]]);
const _withScopeId = (n) => (pushScopeId("data-v-dd58135a"), n = n(), popScopeId(), n);
const _hoisted_1$1 = { class: "search-area" };
const _hoisted_2$1 = { class: "search-bar" };
const _hoisted_3 = ["disabled"];
const _hoisted_4 = ["disabled"];
const _hoisted_5 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "info", -1));
const _hoisted_6 = [
  _hoisted_5
];
const _hoisted_7 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "clear", -1));
const _hoisted_8 = [
  _hoisted_7
];
const _hoisted_9 = /* @__PURE__ */ createStaticVNode("<p data-v-dd58135a>Enter the text you want to search for. E.g. <code data-v-dd58135a>Monika</code></p><p data-v-dd58135a> If multiple words are given, each word must be found. E.g. <code data-v-dd58135a>Monika Pose</code></p><p data-v-dd58135a> To search phrases with spaces, surround them with double quotes. E.g. <code data-v-dd58135a>&quot;Monika R63&quot; Pose</code></p><p data-v-dd58135a> To limit your search to specific attributes of a pack, you can use the following prefixes: </p><table data-v-dd58135a><tr data-v-dd58135a><th data-v-dd58135a>Prefix</th><th data-v-dd58135a>Description</th><th data-v-dd58135a>Example</th></tr><tr data-v-dd58135a><td data-v-dd58135a>Character:</td><td data-v-dd58135a></td><td data-v-dd58135a><code data-v-dd58135a>Character: Monika</code></td></tr><tr data-v-dd58135a><td data-v-dd58135a>Artist:</td><td data-v-dd58135a></td><td data-v-dd58135a><code data-v-dd58135a>Artist: edave64</code></td></tr><tr data-v-dd58135a><td data-v-dd58135a>Type:</td><td data-v-dd58135a><code data-v-dd58135a>Backgrounds</code>, <code data-v-dd58135a>Sprites</code>, <code data-v-dd58135a>Expressions</code>, <code data-v-dd58135a>Styles</code>, <code data-v-dd58135a>Poses</code> or <code data-v-dd58135a>Characters</code></td><td data-v-dd58135a><code data-v-dd58135a>Type: Poses</code></td></tr><tr data-v-dd58135a><td data-v-dd58135a>Engine:</td><td data-v-dd58135a><code data-v-dd58135a>Doki Doki Dialog Generator</code>, <code data-v-dd58135a>DDDG</code> or <code data-v-dd58135a>Doki Doki Comic Club</code>, <code data-v-dd58135a>DDCC</code></td><td data-v-dd58135a><code data-v-dd58135a>Engine: DDCC</code></td></tr><tr data-v-dd58135a><td data-v-dd58135a>Pack:</td><td data-v-dd58135a>The pack itself must contain the text</td><td data-v-dd58135a><code data-v-dd58135a>Pack: Angry</code></td></tr></table><p data-v-dd58135a> Prefixes can be shorted, so <code data-v-dd58135a>Character: Monika</code> can be shortend to <code data-v-dd58135a>C: Monika</code></p>", 6);
const _hoisted_15 = [
  _hoisted_9
];
const debounce = 250;
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "search-bar",
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: String,
      default: ""
    }
  },
  emits: ["leave", "focus-list", "update:modelValue"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const input = ref(null);
    const message = ref("");
    const debounceTimeout = ref(null);
    const lastSend = ref("");
    function focus() {
      const ele = input.value;
      if (ele) {
        ele.focus();
      }
    }
    __expose({ focus });
    function keydownHandler(event) {
      if (event.key === "ArrowDown") {
        emit("focus-list");
        event.preventDefault();
        event.stopPropagation();
      }
    }
    function updateInternalValue() {
      if (lastSend.value === props.modelValue) {
        lastSend.value = "";
        return;
      }
      message.value = props.modelValue;
    }
    function onUpdate() {
      if (debounceTimeout.value != null)
        clearTimeout(debounceTimeout.value);
      debounceTimeout.value = setTimeout(doUpdate, debounce);
    }
    function doUpdate() {
      if (debounceTimeout.value != null)
        clearTimeout(debounceTimeout.value);
      debounceTimeout.value = null;
      const div = document.createElement("div");
      div.innerHTML = message.value;
      lastSend.value = div.innerText;
      emit("update:modelValue", div.innerText);
    }
    watch(() => props.modelValue, updateInternalValue, { immediate: true });
    const showHelp = ref(false);
    function documentClickHandler(event) {
      showHelp.value = false;
    }
    onMounted(() => {
      document.body.addEventListener("click", documentClickHandler);
    });
    onUnmounted(() => {
      document.body.removeEventListener("click", documentClickHandler);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createBaseVNode("div", _hoisted_2$1, [
          withDirectives(createBaseVNode("input", {
            class: "input",
            ref_key: "input",
            ref: input,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => message.value = $event),
            disabled: __props.disabled,
            onInput: onUpdate,
            onClick: _cache[1] || (_cache[1] = withModifiers(() => {
            }, ["stop"])),
            onKeydown: keydownHandler
          }, null, 40, _hoisted_3), [
            [vModelText, message.value]
          ]),
          createBaseVNode("button", {
            class: normalizeClass({ help: true, toggled: showHelp.value }),
            disabled: __props.disabled,
            onClick: _cache[2] || (_cache[2] = withModifiers(($event) => showHelp.value = !showHelp.value, ["stop"]))
          }, _hoisted_6, 10, _hoisted_4),
          createBaseVNode("button", {
            class: "exit-button",
            onClick: _cache[3] || (_cache[3] = ($event) => emit("leave", true))
          }, _hoisted_8)
        ]),
        showHelp.value ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: "info-area",
          onClick: _cache[4] || (_cache[4] = withModifiers(() => {
          }, ["stop"]))
        }, _hoisted_15)) : createCommentVNode("", true)
      ]);
    };
  }
});
const searchBar_vue_vue_type_style_index_0_scoped_dd58135a_lang = "";
const searchBar_vue_vue_type_style_index_1_lang = "";
const SearchBar = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-dd58135a"]]);
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
const _hoisted_1 = {
  key: 1,
  class: "ask-download"
};
const _hoisted_2 = {
  key: 1,
  class: "page fly-right"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "single-box",
  emits: ["leave"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const searchBar = ref(null);
    const list = ref(null);
    const dialog = ref(null);
    const search = ref("");
    const packs = ref([]);
    const authors = ref({});
    const repo = ref(null);
    const selected = ref(null);
    const isRepoUrl = computed(() => {
      return search.value.endsWith(".json") && (search.value.startsWith("http://") || search.value.startsWith("https://"));
    });
    function setSearch(str) {
      selected.value = null;
      search.value = str;
    }
    __expose({ setSearch });
    function leavePackDisplay(moveFocus) {
      selected.value = null;
      if (moveFocus) {
        focusSearchBar();
      }
    }
    function keydownHandler(event) {
      if (event.key === "Escape") {
        selected.value = "";
        nextTick(() => {
          searchBar.value.focus();
        });
      }
    }
    function onSelect({ id, source }) {
      selected.value = id;
      if (source === "keyboard") {
        nextTick(() => {
          dialog.value.focus();
        });
      }
    }
    function focusListHandler() {
      nextTick(() => {
        if (list.value) {
          list.value.focus();
        }
      });
    }
    function focusSearchBar() {
      nextTick(() => {
        if (searchBar.value) {
          searchBar.value.focus();
        }
      });
    }
    function add_repo_pack() {
      return __async(this, null, function* () {
        try {
          const repo2 = yield Repo.getInstance();
          const packId = yield repo2.loadTempPack(search.value);
          search.value = "";
          if (packId) {
            selected.value = packId;
          }
        } catch (e) {
          eventBus.fire(
            new VueErrorEvent(e, "Error while loading external pack")
          );
          console.error(e);
        }
      });
    }
    onActivated(focusSearchBar);
    onMounted(focusSearchBar);
    safeAsync("Initializing repo list", () => __async(this, null, function* () {
      const repo_ = yield Repo.getInstance();
      repo.value = repo_;
      packs.value = repo_.getPacks();
      authors.value = repo_.getAuthors();
    }));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "pages",
        onKeydown: keydownHandler
      }, [
        !selected.value ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(["page fly-left", { blured: selected.value }])
        }, [
          createVNode(SearchBar, {
            class: "search-bar",
            ref_key: "searchBar",
            ref: searchBar,
            modelValue: search.value,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => search.value = $event),
            disabled: !!selected.value,
            onFocusList: focusListHandler,
            onLeave: _cache[1] || (_cache[1] = ($event) => emit("leave"))
          }, null, 8, ["modelValue", "disabled"]),
          !isRepoUrl.value ? (openBlock(), createBlock(List, {
            key: 0,
            class: "list",
            ref_key: "list",
            ref: list,
            search: search.value,
            repo: repo.value,
            disabled: !!selected.value,
            onSelected: onSelect,
            onSelectSearchBar: _cache[2] || (_cache[2] = ($event) => searchBar.value.focus())
          }, null, 8, ["search", "repo", "disabled"])) : (openBlock(), createElementBlock("div", _hoisted_1, [
            createTextVNode(" Do you want to download the pack from '" + toDisplayString(search.value) + "'? ", 1),
            createBaseVNode("button", { onClick: add_repo_pack }, "Add package")
          ]))
        ], 2)) : (openBlock(), createElementBlock("div", _hoisted_2, [
          createVNode(PackDisplay, {
            ref_key: "dialog",
            ref: dialog,
            class: "pack-display",
            repo: repo.value,
            selected: selected.value,
            "show-back": "",
            onLeave: leavePackDisplay
          }, null, 8, ["repo", "selected"])
        ]))
      ], 32);
    };
  }
});
const singleBox_vue_vue_type_style_index_0_scoped_f4ce706c_lang = "";
const singleBox = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f4ce706c"]]);
export {
  singleBox as default
};
