import { d as defineComponent, _ as _export_sfc, o as openBlock, c as createElementBlock, a as createBaseVNode, w as withDirectives, v as vModelText, n as normalizeClass, b as withModifiers, e as createCommentVNode, f as createStaticVNode, p as pushScopeId, g as popScopeId, F as Fragment, r as renderList, t as toDisplayString, h as createVNode, i as withCtx, T as TransitionGroup, L, j as ToggleBox, k as envX, l as createTextVNode, m as createBlock, q as normalizeStyle, s as resolveComponent, R as Repo, u as eventBus, V as VueErrorEvent } from "./index.75d91810.js";
const debounce = 250;
const _sfc_main$3 = defineComponent({
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
  data: () => ({
    showHelp: false,
    message: "",
    debounceTimeout: null,
    lastSend: ""
  }),
  methods: {
    focus() {
      const ele = this.$refs.input;
      if (ele) {
        ele.focus();
      }
    },
    documentClickHandler(event) {
      if (event.dontCloseHelp)
        return;
      this.showHelp = false;
    },
    keydownHandler(event) {
      if (event.key === "ArrowDown") {
        this.$emit("focus-list");
        event.preventDefault();
        event.stopPropagation();
      }
    },
    updateInternalValue() {
      if (this.lastSend === this.modelValue) {
        this.lastSend = "";
        return;
      }
      this.message = this.modelValue;
    },
    onUpdate() {
      if (this.debounceTimeout != null)
        clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(this.doUpdate, debounce);
    },
    doUpdate() {
      if (this.debounceTimeout != null)
        clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
      const div = document.createElement("div");
      div.innerHTML = this.message;
      this.lastSend = div.innerText;
      this.$emit("update:modelValue", div.innerText);
    }
  },
  mounted() {
    document.body.addEventListener("click", this.documentClickHandler);
    this.updateInternalValue();
  },
  unmounted() {
    document.body.removeEventListener("click", this.documentClickHandler);
  },
  watch: {
    modelValue() {
      this.updateInternalValue();
    }
  }
});
const SearchBar_vue_vue_type_style_index_0_scoped_2b7a0082_lang = "";
const SearchBar_vue_vue_type_style_index_1_lang = "";
const _withScopeId$1 = (n) => (pushScopeId("data-v-2b7a0082"), n = n(), popScopeId(), n);
const _hoisted_1$3 = { class: "search-area" };
const _hoisted_2$3 = { class: "search-bar" };
const _hoisted_3$2 = ["disabled"];
const _hoisted_4$2 = ["disabled"];
const _hoisted_5$2 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "info", -1));
const _hoisted_6$1 = [
  _hoisted_5$2
];
const _hoisted_7$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "clear", -1));
const _hoisted_8$1 = [
  _hoisted_7$1
];
const _hoisted_9$1 = /* @__PURE__ */ createStaticVNode("<p data-v-2b7a0082>Enter the text you want to search for. E.g. <code data-v-2b7a0082>Monika</code></p><p data-v-2b7a0082> If multiple words are given, each word must be found. E.g. <code data-v-2b7a0082>Monika Pose</code></p><p data-v-2b7a0082> To search phrases with spaces, surround them with double quotes. E.g. <code data-v-2b7a0082>&quot;Monika R63&quot; Pose</code></p><p data-v-2b7a0082> To limit your search to specific attributes of a pack, you can use the following prefixes: </p><table data-v-2b7a0082><tr data-v-2b7a0082><th data-v-2b7a0082>Prefix</th><th data-v-2b7a0082>Description</th><th data-v-2b7a0082>Example</th></tr><tr data-v-2b7a0082><td data-v-2b7a0082>Character:</td><td data-v-2b7a0082></td><td data-v-2b7a0082><code data-v-2b7a0082>Character: Monika</code></td></tr><tr data-v-2b7a0082><td data-v-2b7a0082>Artist:</td><td data-v-2b7a0082></td><td data-v-2b7a0082><code data-v-2b7a0082>Artist: edave64</code></td></tr><tr data-v-2b7a0082><td data-v-2b7a0082>Type:</td><td data-v-2b7a0082><code data-v-2b7a0082>Backgrounds</code>, <code data-v-2b7a0082>Sprites</code>, <code data-v-2b7a0082>Expressions</code>, <code data-v-2b7a0082>Styles</code>, <code data-v-2b7a0082>Poses</code> or <code data-v-2b7a0082>Characters</code></td><td data-v-2b7a0082><code data-v-2b7a0082>Type: Poses</code></td></tr><tr data-v-2b7a0082><td data-v-2b7a0082>Engine:</td><td data-v-2b7a0082><code data-v-2b7a0082>Doki Doki Dialog Generator</code>, <code data-v-2b7a0082>DDDG</code> or <code data-v-2b7a0082>Doki Doki Comic Club</code>, <code data-v-2b7a0082>DDCC</code></td><td data-v-2b7a0082><code data-v-2b7a0082>Engine: DDCC</code></td></tr><tr data-v-2b7a0082><td data-v-2b7a0082>Pack:</td><td data-v-2b7a0082>The pack itself must contain the text</td><td data-v-2b7a0082><code data-v-2b7a0082>Pack: Angry</code></td></tr></table><p data-v-2b7a0082> Prefixes can be shorted, so <code data-v-2b7a0082>Character: Monika</code> can be shortend to <code data-v-2b7a0082>C: Monika</code></p>", 6);
const _hoisted_15 = [
  _hoisted_9$1
];
function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1$3, [
    createBaseVNode("div", _hoisted_2$3, [
      withDirectives(createBaseVNode("input", {
        class: "input",
        ref: "input",
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.message = $event),
        disabled: _ctx.disabled,
        onInput: _cache[1] || (_cache[1] = (...args) => _ctx.onUpdate && _ctx.onUpdate(...args)),
        onClick: _cache[2] || (_cache[2] = ($event) => $event.dontCloseHelp = true),
        onKeydown: _cache[3] || (_cache[3] = (...args) => _ctx.keydownHandler && _ctx.keydownHandler(...args))
      }, null, 40, _hoisted_3$2), [
        [vModelText, _ctx.message]
      ]),
      createBaseVNode("button", {
        class: normalizeClass({ help: true, toggled: _ctx.showHelp }),
        disabled: _ctx.disabled,
        onClick: _cache[4] || (_cache[4] = withModifiers(($event) => {
          _ctx.showHelp = !_ctx.showHelp;
          $event.dontCloseHelp = true;
        }, ["stop"]))
      }, _hoisted_6$1, 10, _hoisted_4$2),
      createBaseVNode("button", {
        class: "exit-button",
        onClick: _cache[5] || (_cache[5] = ($event) => _ctx.$emit("leave", true))
      }, _hoisted_8$1)
    ]),
    _ctx.showHelp ? (openBlock(), createElementBlock("div", {
      key: 0,
      class: "info-area",
      onClick: _cache[6] || (_cache[6] = ($event) => $event.dontCloseHelp = true)
    }, _hoisted_15)) : createCommentVNode("", true)
  ]);
}
const SearchBar = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$3], ["__scopeId", "data-v-2b7a0082"]]);
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
const pageKeyMoveBy = 10;
const _sfc_main$2 = defineComponent({
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
  data: () => ({
    sort: "",
    desc: false,
    focusedItem: "",
    wordCache: {}
  }),
  computed: {
    packs() {
      if (!this.repo)
        return [];
      return this.repo.getPacks();
    },
    list() {
      const filtered = this.filterList(this.packs, this.search);
      if (this.sort && filtered.length > 0) {
        const sort = this.sort;
        let sortFunc;
        if (typeof filtered[0][sort] === "string") {
          sortFunc = (a, b) => a.name.localeCompare(b.name);
        } else if (filtered[0][sort] instanceof Array) {
          sortFunc = (a, b) => a[sort].join(", ").localeCompare(b[sort].join(", "));
        }
        if (sortFunc) {
          if (this.desc) {
            const oldSort = sortFunc;
            sortFunc = (b, a) => oldSort(a, b);
          }
          filtered.sort(sortFunc);
        }
      }
      return filtered;
    },
    listById() {
      return new Map(this.packs.map((pack) => [pack.id, pack]));
    },
    uniqueCharacters() {
      return Array.from(
        new Set(
          this.packs.flatMap(
            (pack) => pack.characters.map((char) => char.toLowerCase())
          )
        )
      );
    }
  },
  methods: {
    focus() {
      this.$refs.tbody.$el.focus();
    },
    keydownHandler(event) {
      const indexOf = this.list.findIndex(
        (pack) => pack.id === this.focusedItem
      );
      console.log(indexOf);
      switch (event.key) {
        case "Enter":
          this.$emit("selected", { id: this.focusedItem, source: "keyboard" });
          event.stopPropagation();
          event.preventDefault();
          break;
        case "ArrowUp":
          event.preventDefault();
          event.stopPropagation();
          if (indexOf === 0) {
            this.$emit("select-search-bar");
          } else {
            this.focusedItem = this.list[indexOf - 1].id;
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          event.stopPropagation();
          if (indexOf < this.list.length - 1) {
            this.focusedItem = this.list[indexOf + 1].id;
          }
          break;
        case "PageUp": {
          event.preventDefault();
          event.stopPropagation();
          let newIdx = indexOf - pageKeyMoveBy;
          if (newIdx < 0) {
            newIdx = 0;
          }
          this.focusedItem = this.list[newIdx].id;
          break;
        }
        case "PageDown": {
          event.preventDefault();
          event.stopPropagation();
          let newIdx = indexOf + pageKeyMoveBy;
          const max = this.list.length - 1;
          if (newIdx > max) {
            newIdx = max;
          }
          this.focusedItem = this.list[newIdx].id;
          break;
        }
      }
    },
    headerKeydownListener(event, headerId) {
      switch (event.key) {
        case "Enter":
        case " ":
          this.sortBy(headerId);
          event.preventDefault();
          event.stopPropagation();
          break;
        case "ArrowDown":
          this.focus();
          event.stopPropagation();
          event.preventDefault();
          break;
        case "ArrowUp":
          this.$emit("select-search-bar");
          event.stopPropagation();
          event.preventDefault();
          break;
      }
    },
    updateFocusedItem() {
      if (this.list.length === 0) {
        this.focusedItem = "";
        return;
      }
      if (this.focusedItem === "") {
        this.focusedItem = this.list[0].id;
      }
      this.$nextTick(() => {
        const header = this.$refs.header;
        const element = document.querySelector(".list tbody .focused");
        const containerHeight = this.$el.offsetHeight - header.offsetHeight;
        const scrollTop = this.$el.scrollTop;
        const scrollBottom = scrollTop + containerHeight;
        if (element) {
          const itemTop = element.offsetTop - header.offsetHeight;
          const itemBottom = itemTop + element.offsetHeight;
          if (itemBottom > scrollBottom) {
            this.$el.scrollTop = itemBottom - containerHeight;
          } else if (itemTop < scrollTop) {
            this.$el.scrollTop = itemTop;
          }
        }
      });
    },
    sortBy(by) {
      if (this.sort === by) {
        if (!this.desc) {
          this.desc = true;
        } else {
          this.sort = "";
          this.desc = false;
        }
      } else {
        this.sort = by;
        this.desc = false;
      }
    },
    filterList(list, search) {
      if (!search)
        return [...list];
      return filter(
        search,
        this.repo ? this.repo.getAuthors() : {},
        list
      );
    },
    translatePackState(state) {
      if (state.loaded)
        return "Active";
      if (state.installed)
        return "Installed";
      return "";
    }
  },
  watch: {
    focusedItem() {
      this.updateFocusedItem();
    }
  }
});
const List_vue_vue_type_style_index_0_scoped_26744ef4_lang = "";
const _hoisted_1$2 = { class: "list" };
const _hoisted_2$2 = { ref: "header" };
const _hoisted_3$1 = ["tabindex", "onClick", "onKeydown"];
const _hoisted_4$1 = { key: 0 };
const _hoisted_5$1 = ["onMousedown", "onClick"];
function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1$2, [
    createBaseVNode("table", null, [
      createBaseVNode("thead", null, [
        createBaseVNode("tr", _hoisted_2$2, [
          (openBlock(), createElementBlock(Fragment, null, renderList([
            ["name", "Pack"],
            ["characters", "Character"],
            ["kind", "Type"],
            ["authors", "Authors"],
            ["state", "Status"]
          ], (header, idx) => {
            return createBaseVNode("th", {
              key: idx,
              tabindex: _ctx.disabled ? -1 : 0,
              onClick: ($event) => _ctx.sortBy(header[0]),
              onKeydown: ($event) => _ctx.headerKeydownListener($event, header[0])
            }, [
              createBaseVNode("div", null, [
                createBaseVNode("div", null, toDisplayString(header[1]), 1),
                _ctx.sort === header[0] ? (openBlock(), createElementBlock("div", _hoisted_4$1, toDisplayString(_ctx.desc ? "\u25BC" : "\u25B2"), 1)) : createCommentVNode("", true)
              ])
            ], 40, _hoisted_3$1);
          }), 64))
        ], 512)
      ]),
      createVNode(TransitionGroup, {
        name: "tbody-group",
        tag: "tbody",
        ref: "tbody",
        tabindex: _ctx.disabled ? -1 : 0,
        onKeydown: _ctx.keydownHandler,
        onFocus: _ctx.updateFocusedItem
      }, {
        default: withCtx(() => [
          (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.list, (pack) => {
            return openBlock(), createElementBlock("tr", {
              key: pack.id,
              class: normalizeClass({
                "tbody-group-item": true,
                focused: _ctx.focusedItem === pack.id
              }),
              onMousedown: ($event) => _ctx.focusedItem = pack.id,
              onClick: ($event) => _ctx.$emit("selected", { id: pack.id, source: "pointer" })
            }, [
              createBaseVNode("td", null, toDisplayString(pack.name), 1),
              createBaseVNode("td", null, toDisplayString(pack.characters.join(", ")), 1),
              createBaseVNode("td", null, toDisplayString(pack.kind.join(", ")), 1),
              createBaseVNode("td", null, toDisplayString(pack.authors.join(", ")), 1),
              createBaseVNode("td", null, toDisplayString(_ctx.translatePackState(pack)), 1)
            ], 42, _hoisted_5$1);
          }), 128))
        ]),
        _: 1
      }, 8, ["tabindex", "onKeydown", "onFocus"])
    ])
  ]);
}
const List = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$2], ["__scopeId", "data-v-26744ef4"]]);
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
const _sfc_main$1 = defineComponent({
  components: { L, Toggle: ToggleBox },
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
  computed: {
    pack() {
      return this.repo.getPack(this.selected);
    },
    backgroundImage() {
      return this.pack.preview.map((preview) => `url('${preview}')`).join(",");
    },
    installable() {
      if (!envX.supports.localRepo)
        return false;
      return !this.pack.installed;
    },
    uninstallable() {
      if (!envX.supports.localRepo)
        return false;
      return this.pack.installed;
    },
    removable() {
      return this.pack.loaded;
    },
    addable() {
      return !this.pack.loaded;
    },
    autoloadEnabled() {
      return envX.supports.autoLoading;
    },
    autoload: {
      get() {
        return envX.state.autoAdd.includes(this.selected);
      },
      set(val) {
        let loadId = this.selected;
        const pack = this.pack;
        if (pack.repoUrl != null)
          loadId += `;${pack.repoUrl}`;
        if (val) {
          envX.autoLoadAdd(loadId);
        } else {
          envX.autoLoadRemove(loadId);
        }
      }
    }
  },
  methods: {
    focus() {
      this.$refs.toFocus.focus();
    },
    authorName(authorId) {
      const author = this.repo.getAuthor(authorId);
      if (author && author.currentName != null)
        return author.currentName;
      return authorId;
    },
    authorsLinks(authorId) {
      const author = this.repo.getAuthor(authorId);
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
    },
    sanitize(credits) {
      return sanitize(credits);
    },
    install() {
      if (this.pack.installed)
        return;
      const authors = {};
      for (const key of this.pack.authors) {
        authors[key] = __spreadValues({}, this.repo.getAuthor(key));
      }
      const pack = JSON.parse(JSON.stringify(this.pack));
      delete pack.autoloading;
      delete pack.online;
      delete pack.loaded;
      delete pack.installed;
      envX.localRepoInstall(
        this.pack.dddg2Path || this.pack.dddg1Path,
        pack,
        authors
      );
    },
    uninstall() {
      return __async$1(this, null, function* () {
        var _a;
        const pack = this.pack;
        if (!pack.installed)
          return;
        if (pack.repoUrl && !((_a = this.repo) == null ? void 0 : _a.hasPack(pack.id, true))) {
          yield this.repo.loadTempPack(pack.repoUrl);
        }
        envX.localRepoUninstall(this.pack.id);
      });
    },
    remove() {
      return __async$1(this, null, function* () {
        yield this.$store.dispatch("removePacks", {
          packs: /* @__PURE__ */ new Set([this.pack.id])
        });
      });
    },
    add() {
      return __async$1(this, null, function* () {
        yield this.$store.dispatch(
          "content/loadContentPacks",
          this.pack.dddg2Path || this.pack.dddg1Path
        );
      });
    }
  }
});
const PackDisplay_vue_vue_type_style_index_0_scoped_e0f6c8f4_lang = "";
const PackDisplay_vue_vue_type_style_index_1_lang = "";
const _withScopeId = (n) => (pushScopeId("data-v-e0f6c8f4"), n = n(), popScopeId(), n);
const _hoisted_1$1 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "arrow_back", -1));
const _hoisted_2$1 = [
  _hoisted_1$1
];
const _hoisted_3 = ["innerHTML"];
const _hoisted_4 = { key: 1 };
const _hoisted_5 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "add", -1));
const _hoisted_6 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "remove", -1));
const _hoisted_7 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "add", -1));
const _hoisted_8 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("i", { class: "material-icons" }, "remove", -1));
const _hoisted_9 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("h3", null, "Authors", -1));
const _hoisted_10 = ["title", "src"];
const _hoisted_11 = { key: 2 };
const _hoisted_12 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("h3", null, "Credits", -1));
const _hoisted_13 = ["innerHTML"];
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_l = resolveComponent("l");
  const _component_toggle = resolveComponent("toggle");
  return openBlock(), createElementBlock("div", {
    class: "pack-display",
    style: normalizeStyle({ backgroundImage: _ctx.backgroundImage }),
    onClick: _cache[6] || (_cache[6] = withModifiers(() => {
    }, ["stop"]))
  }, [
    createBaseVNode("header", null, [
      createBaseVNode("h1", null, [
        _ctx.showBack ? (openBlock(), createElementBlock("button", {
          key: 0,
          class: "exit-button",
          onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("leave", true))
        }, _hoisted_2$1)) : createCommentVNode("", true),
        createTextVNode(" " + toDisplayString(_ctx.pack.name), 1)
      ]),
      createBaseVNode("h2", null, toDisplayString(_ctx.pack.id), 1)
    ]),
    _ctx.pack.disclaimer ? (openBlock(), createElementBlock("section", {
      key: 0,
      class: "disclaimer",
      innerHTML: _ctx.sanitize(_ctx.pack.disclaimer)
    }, null, 8, _hoisted_3)) : createCommentVNode("", true),
    _ctx.pack.source ? (openBlock(), createElementBlock("section", _hoisted_4, [
      createVNode(_component_l, {
        to: _ctx.pack.source
      }, {
        default: withCtx(() => [
          createTextVNode("Source")
        ]),
        _: 1
      }, 8, ["to"])
    ])) : createCommentVNode("", true),
    createBaseVNode("section", null, [
      _ctx.addable ? (openBlock(), createElementBlock("button", {
        key: 0,
        onClick: _cache[1] || (_cache[1] = (...args) => _ctx.add && _ctx.add(...args))
      }, [
        _hoisted_5,
        createTextVNode(" Activate ")
      ])) : createCommentVNode("", true),
      _ctx.removable ? (openBlock(), createElementBlock("button", {
        key: 1,
        onClick: _cache[2] || (_cache[2] = (...args) => _ctx.remove && _ctx.remove(...args))
      }, [
        _hoisted_6,
        createTextVNode(" Deactivate ")
      ])) : createCommentVNode("", true),
      _ctx.installable ? (openBlock(), createElementBlock("button", {
        key: 2,
        onClick: _cache[3] || (_cache[3] = (...args) => _ctx.install && _ctx.install(...args))
      }, [
        _hoisted_7,
        createTextVNode(" Store locally ")
      ])) : createCommentVNode("", true),
      _ctx.uninstallable ? (openBlock(), createElementBlock("button", {
        key: 3,
        onClick: _cache[4] || (_cache[4] = (...args) => _ctx.uninstall && _ctx.uninstall(...args))
      }, [
        _hoisted_8,
        createTextVNode(" Remove locally ")
      ])) : createCommentVNode("", true),
      _ctx.autoloadEnabled ? (openBlock(), createBlock(_component_toggle, {
        key: 4,
        label: "Load on startup",
        modelValue: _ctx.autoload,
        "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => _ctx.autoload = $event)
      }, null, 8, ["modelValue"])) : createCommentVNode("", true)
    ]),
    createBaseVNode("section", null, [
      _hoisted_9,
      createBaseVNode("table", null, [
        createBaseVNode("tbody", null, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.pack.authors, (authorId) => {
            return openBlock(), createElementBlock("tr", { key: authorId }, [
              createBaseVNode("td", null, toDisplayString(_ctx.authorName(authorId)), 1),
              createBaseVNode("td", null, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.authorsLinks(authorId), (link) => {
                  return openBlock(), createBlock(_component_l, {
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
    _ctx.pack.description ? (openBlock(), createElementBlock("section", _hoisted_11, [
      _hoisted_12,
      createBaseVNode("p", {
        innerHTML: _ctx.sanitize(_ctx.pack.description)
      }, null, 8, _hoisted_13)
    ])) : createCommentVNode("", true)
  ], 4);
}
const PackDisplay = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__scopeId", "data-v-e0f6c8f4"]]);
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
const _sfc_main = defineComponent({
  components: {
    SearchBar,
    List,
    PackDisplay
  },
  data: () => ({
    search: "",
    packs: [],
    authors: {},
    repo: null,
    selected: null
  }),
  computed: {
    isRepoUrl() {
      return this.search.endsWith(".json") && (this.search.startsWith("http://") || this.search.startsWith("https://"));
    }
  },
  methods: {
    focus() {
    },
    setSearch(str) {
      this.selected = null;
      this.search = str;
    },
    leavePackDisplay(moveFocus) {
      this.selected = null;
      if (moveFocus) {
        this.focusSearchBar();
      }
    },
    keydownHandler(event) {
      if (event.key === "Escape") {
        this.selected = "";
        this.$nextTick(() => {
          this.$refs.searchBar.focus();
        });
      }
    },
    onSelect({ id, source }) {
      this.selected = id;
      if (source === "keyboard") {
        this.$nextTick(() => {
          const dialog = this.$refs.dialog;
          dialog.focus();
        });
      }
    },
    focusListHandler() {
      this.$nextTick(() => {
        const list = this.$refs.list;
        if (list) {
          list.focus();
        }
      });
    },
    focusSearchBar() {
      this.$nextTick(() => {
        const searchBar = this.$refs.searchBar;
        if (searchBar) {
          searchBar.focus();
        }
      });
    },
    add_repo_pack() {
      return __async(this, null, function* () {
        try {
          const repo = yield Repo.getInstance();
          const packId = yield repo.loadTempPack(this.search);
          this.search = "";
          if (packId) {
            this.selected = packId;
          }
        } catch (e) {
          eventBus.fire(
            new VueErrorEvent(e, "Error while loading external pack")
          );
          console.error(e);
        }
      });
    }
  },
  created() {
    return __async(this, null, function* () {
      const repo = yield Repo.getInstance();
      this.repo = repo;
      this.packs = repo.getPacks();
      this.authors = repo.getAuthors();
    });
  },
  activated() {
    this.focusSearchBar();
  },
  mounted() {
    this.focusSearchBar();
  }
});
const SingleBox_vue_vue_type_style_index_0_scoped_a3a53c3b_lang = "";
const _hoisted_1 = {
  key: 1,
  class: "ask-download"
};
const _hoisted_2 = {
  key: 1,
  class: "page fly-right"
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_search_bar = resolveComponent("search-bar");
  const _component_list = resolveComponent("list");
  const _component_pack_display = resolveComponent("pack-display");
  return openBlock(), createElementBlock("div", {
    class: "pages",
    onKeydown: _cache[4] || (_cache[4] = (...args) => _ctx.keydownHandler && _ctx.keydownHandler(...args))
  }, [
    !_ctx.selected ? (openBlock(), createElementBlock("div", {
      key: 0,
      class: normalizeClass(["page fly-left", { blured: _ctx.selected }])
    }, [
      createVNode(_component_search_bar, {
        class: "search-bar",
        ref: "searchBar",
        modelValue: _ctx.search,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.search = $event),
        disabled: !!_ctx.selected,
        onFocusList: _ctx.focusListHandler,
        onLeave: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("leave"))
      }, null, 8, ["modelValue", "disabled", "onFocusList"]),
      !_ctx.isRepoUrl ? (openBlock(), createBlock(_component_list, {
        key: 0,
        class: "list",
        ref: "list",
        search: _ctx.search,
        repo: _ctx.repo,
        disabled: !!_ctx.selected,
        onSelected: _ctx.onSelect,
        onSelectSearchBar: _cache[2] || (_cache[2] = ($event) => _ctx.$refs.searchBar.focus())
      }, null, 8, ["search", "repo", "disabled", "onSelected"])) : (openBlock(), createElementBlock("div", _hoisted_1, [
        createTextVNode(" Do you want to download the pack from '" + toDisplayString(_ctx.search) + "'? ", 1),
        createBaseVNode("button", {
          onClick: _cache[3] || (_cache[3] = (...args) => _ctx.add_repo_pack && _ctx.add_repo_pack(...args))
        }, "Add package")
      ]))
    ], 2)) : (openBlock(), createElementBlock("div", _hoisted_2, [
      createVNode(_component_pack_display, {
        ref: "dialog",
        class: "pack-display",
        repo: _ctx.repo,
        selected: _ctx.selected,
        "show-back": "",
        onLeave: _ctx.leavePackDisplay
      }, null, 8, ["repo", "selected", "onLeave"])
    ]))
  ], 32);
}
const SingleBox = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a3a53c3b"]]);
export {
  SingleBox as default
};
