import { J as reactive, d as defineComponent, c as computed, o as openBlock, a as createElementBlock, b as createBaseVNode, t as toDisplayString, s as normalizeStyle, u as unref, v as withModifiers, _ as _export_sfc, K as renderSlot, j as useStore, r as ref, w as watch, m as createBlock, h as withCtx, F as Fragment, e as renderList, k as createTextVNode, l as _sfc_main$3, f as createCommentVNode, g as createVNode, L as DropTarget, M as verticalScrollRedirect, n as normalizeClass, C as withDirectives, N as vModelSelect, D as vModelText, O as DFieldset, q as _sfc_main$4, P as getAssetByUrl, Q as Renderer, S as transaction, x as envX, y as pushScopeId, z as popScopeId, U as getAAssetUrl, W as Character, i as nextTick, X as SelectedState } from "./index.b3569706.js";
var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
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
class WorkBatch {
  constructor(runner, disposer, parallel = 4) {
    this.runner = runner;
    this.disposer = disposer;
    this.parallel = parallel;
    __publicField(this, "state", reactive({
      busy: false,
      error: null,
      completed: 0,
      fullCount: 0
    }));
    __publicField(this, "pendingData", []);
    __publicField(this, "currentlyRunning", /* @__PURE__ */ new Set());
    __publicField(this, "resolveCurrentRun", null);
    __publicField(this, "rejectCurrentRun", null);
    __publicField(this, "returnData", []);
    __publicField(this, "remainingDisposers", /* @__PURE__ */ new Set());
    __publicField(this, "runningDisposers", /* @__PURE__ */ new Set());
  }
  run(newData) {
    if (this.rejectCurrentRun) {
      this.reject();
    }
    newData = newData.slice();
    this.pendingData = newData;
    this.returnData = [];
    this.state.fullCount = newData.length;
    this.state.error = null;
    this.state.busy = true;
    this.state.completed = 0;
    return new Promise((resolve, reject) => {
      this.resolveCurrentRun = resolve;
      this.rejectCurrentRun = reject;
      if (newData.length > 0) {
        this.restock();
      } else {
        this.resolve();
      }
    });
  }
  get remainingCapacity() {
    return this.parallel - this.currentlyRunning.size - this.runningDisposers.size;
  }
  restock() {
    while (this.remainingCapacity > 0 && this.pendingData.length > 0) {
      this.startOne();
    }
    while (this.remainingCapacity > 0 && this.remainingDisposers.size > 0) {
      this.startDisposer();
    }
  }
  startOne() {
    return __async$1(this, null, function* () {
      const data = this.pendingData.shift();
      const idx = this.returnData.length;
      this.returnData[idx] = void 0;
      if (data == null)
        return;
      this.currentlyRunning.add(data);
      const isRunning = () => this.currentlyRunning.has(data);
      let ret;
      try {
        ret = yield this.runner(data, isRunning);
      } catch (e) {
        this.reject(e);
      }
      if (isRunning()) {
        ++this.state.completed;
        this.returnData[idx] = ret;
        this.currentlyRunning.delete(data);
        if (this.currentlyRunning.size === 0 && this.pendingData.length === 0) {
          this.resolve();
        }
      } else if (ret !== void 0) {
        this.remainingDisposers.add(ret);
      }
      this.restock();
    });
  }
  startDisposer() {
    return __async$1(this, null, function* () {
      const data = this.remainingDisposers.values().next().value;
      this.remainingDisposers.delete(data);
      this.runningDisposers.add(data);
      try {
        yield this.disposer(data);
      } catch (e) {
      }
      this.runningDisposers.delete(data);
      this.restock();
    });
  }
  resolve() {
    this.state.busy = false;
    this.state.completed = this.state.fullCount;
    const returnData = this.returnData;
    const resolveCurrentRun = this.resolveCurrentRun;
    this.reset();
    resolveCurrentRun(returnData);
  }
  reject(e) {
    var _a;
    this.state.busy = false;
    this.state.error = (_a = e == null ? void 0 : e.message) != null ? _a : null;
    const returnData = this.returnData;
    const rejectCurrentRun = this.rejectCurrentRun;
    this.reset();
    for (const data of returnData) {
      if (data !== void 0)
        this.remainingDisposers.add(data);
    }
    rejectCurrentRun();
  }
  reset() {
    this.returnData = [];
    this.currentlyRunning = /* @__PURE__ */ new Set();
    this.resolveCurrentRun = null;
    this.rejectCurrentRun = null;
  }
  get busy() {
    return this.state.busy;
  }
  get fullCount() {
    return this.state.fullCount;
  }
  get completed() {
    return this.state.completed;
  }
  get percentage() {
    if (this.fullCount === 0)
      return 0;
    return this.completed / this.fullCount;
  }
  get error() {
    return this.state.error;
  }
}
const _hoisted_1$2 = { class: "icon material-icons" };
const _hoisted_2$1 = { class: "label" };
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "selection",
  props: {
    icon: String,
    label: String,
    images: {
      default: []
    }
  },
  setup(__props) {
    const props = __props;
    const background = computed(() => {
      return props.images.map((i) => `center / contain no-repeat url('${i}')`).join(",");
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "selection",
        style: normalizeStyle({ background: unref(background) }),
        onClick: _cache[0] || (_cache[0] = withModifiers(($event) => _ctx.$emit("selected"), ["stop"]))
      }, [
        createBaseVNode("div", _hoisted_1$2, toDisplayString(__props.icon), 1),
        createBaseVNode("div", _hoisted_2$1, toDisplayString(__props.label), 1)
      ], 4);
    };
  }
});
const selection_vue_vue_type_style_index_0_scoped_c645b674_lang = "";
const Selection = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-c645b674"]]);
const selector_vue_vue_type_style_index_0_scoped_b9600c26_lang = "";
const _sfc_main$1 = {};
const _hoisted_1$1 = { class: "selector" };
function _sfc_render(_ctx, _cache) {
  return openBlock(), createElementBlock("div", _hoisted_1$1, [
    renderSlot(_ctx.$slots, "default", {}, void 0, true)
  ]);
}
const Selector = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-b9600c26"]]);
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
const _withScopeId = (n) => (pushScopeId("data-v-61fa4824"), n = n(), popScopeId(), n);
const _hoisted_1 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("h1", null, "Add expressions", -1));
const _hoisted_2 = {
  key: 0,
  class: "page"
};
const _hoisted_3 = { class: "expression_list_wrapper" };
const _hoisted_4 = ["onClick"];
const _hoisted_5 = { class: "options_wrapper" };
const _hoisted_6 = { class: "image" };
const _hoisted_7 = ["width", "height"];
const _hoisted_8 = ["value"];
const _hoisted_9 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("th", null, "X:", -1));
const _hoisted_10 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("th", null, "Y:", -1));
const _hoisted_11 = { key: 0 };
const _hoisted_12 = ["disabled"];
const _hoisted_13 = { key: 1 };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  props: {
    character: {
      type: String,
      required: true
    },
    initHeadGroup: String
  },
  emits: ["leave"],
  setup(__props, { emit }) {
    const props = __props;
    const uploadedExpressionsPackDefaults = {
      packId: "dddg.uploads.expressions",
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
    const partFiles = {};
    const store = useStore();
    const target = ref(null);
    const headGroup = ref(null);
    const uploadedExpressions = ref([]);
    const currentUploadedExpression = ref(null);
    const previewPoseIdx = ref(0);
    const offsetX = ref(0);
    const offsetY = ref(0);
    const addMask = ref(false);
    const addExtras = ref(false);
    const names = ref({});
    const characterData = computed(() => {
      return store.state.content.current.characters.find(
        (char) => char.id === props.character
      );
    });
    const availableHeadGroups = computed(() => {
      const headTypes = Object.keys(characterData.value.heads);
      return headTypes.map((headTypeKey) => {
        const headType = characterData.value.heads[headTypeKey];
        return {
          name: headTypeKey,
          preview: headType.variants[0].map((asset) => getAAssetUrl(asset, false)),
          partsFiles: partFiles[headTypeKey] || [],
          imagePatching: {
            mask: masks[headTypeKey],
            addition: adds[headTypeKey]
          }
        };
      });
    });
    window.exp = this;
    if (props.initHeadGroup != null) {
      headGroup.value = availableHeadGroups.value.find(
        (group) => group.name === props.initHeadGroup
      );
    }
    applySingleHeadGroup();
    function applySingleHeadGroup() {
      if (availableHeadGroups.value.length === 1) {
        headGroup.value = availableHeadGroups.value[0];
      }
    }
    function leave() {
      emit("leave");
      headGroup.value = null;
      uploadedExpressions.value = [];
    }
    function removeUploadedExpression() {
      if (currentUploadedExpression.value == null)
        return;
      const expression = currentUploadedExpression.value;
      currentUploadedExpression.value = null;
      if (expression.startsWith("blob:")) {
        URL.revokeObjectURL(expression);
      }
      let idx = uploadedExpressions.value.indexOf(expression);
      uploadedExpressions.value.splice(idx, 1);
      if (idx > uploadedExpressions.value.length - 1) {
        idx = uploadedExpressions.value.length - 1;
      }
      currentUploadedExpression.value = uploadedExpressions.value[idx] || null;
    }
    function normalizeName(name) {
      const parts = name.split(":");
      let actualName = parts[parts.length - 1];
      const packId = parts.length > 1 ? parts[0].trim() : "";
      actualName = (actualName[0].toUpperCase() + actualName.slice(1).toLowerCase()).split("_").join(" ");
      if (packId.startsWith("dddg.") || packId === "") {
        return actualName;
      }
      return packId + ": " + actualName;
    }
    const downloadLink = computed(() => {
      const character = characterData.value;
      if (!headGroup.value)
        return null;
      const headType = character.heads[headGroup.value.name];
      return headType.variants[0][0].hq;
    });
    const listLink = computed(() => {
      var _a, _b;
      if (!headGroup.value)
        return null;
      const charName = characterData.value.id;
      const headGroupName = headGroup.value.name;
      return (_b = (_a = listPaths[charName + ":" + headGroupName]) != null ? _a : listPaths[charName]) != null ? _b : null;
    });
    const dt = ref(null);
    function dragEnter(e) {
      if (!headGroup.value)
        return;
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
    function redraw() {
      return __async(this, null, function* () {
        if (uploadsFinished.value)
          return;
        const pose = previewPoses.value[previewPoseIdx.value];
        let charRenderer;
        try {
          charRenderer = new Character(
            __spreadProps(__spreadValues({}, charDefDefaults), {
              width: pose.width,
              height: pose.height,
              poseId: previewPoseIdx.value,
              x: pose.width / 2,
              posePositions: {
                headGroup: 0,
                head: uploadedExpressions.value.indexOf(
                  currentUploadedExpression.value
                )
              },
              label: null,
              textboxColor: null,
              enlargeWhenTalking: false,
              nameboxWidth: null,
              zoom: 1
            }),
            yield temporaryCharacterModel.value
          );
        } catch (e) {
          return;
        }
        nextTick(() => __async(this, null, function* () {
          if (uploadsFinished.value)
            return;
          const renderer = new Renderer(pose.width, pose.height);
          try {
            yield renderer.render((rx) => __async(this, null, function* () {
              yield charRenderer.render(SelectedState.None, rx, false);
            }));
            const ctx = target.value.getContext("2d");
            ctx.clearRect(0, 0, target.value.width, target.value.height);
            renderer.paintOnto(ctx, {
              x: 0,
              y: 0,
              w: target.value.width,
              h: target.value.height
            });
          } finally {
            charRenderer.dispose();
            renderer.dispose();
          }
        }));
      });
    }
    const previewPoses = computed(() => {
      const character = characterData.value;
      if (!headGroup.value)
        return [];
      const poses = [];
      for (let styleGroupIdx = 0; styleGroupIdx < character.styleGroups.length; ++styleGroupIdx) {
        const styleGroup = character.styleGroups[styleGroupIdx];
        for (let styleIdx = 0; styleIdx < styleGroup.styles.length; ++styleIdx) {
          const style = styleGroup.styles[styleIdx];
          for (let poseIdx = 0; poseIdx < style.poses.length; ++poseIdx) {
            const pose = style.poses[poseIdx];
            if (pose.compatibleHeads.includes(headGroup.value.name)) {
              poses.push({
                name: pose.id,
                styleGroupId: styleGroupIdx,
                styleId: styleIdx,
                poseId: poseIdx,
                width: pose.size[0],
                height: pose.size[1]
              });
            }
          }
        }
      }
      return poses;
    });
    const expressionModels = computed(() => {
      return uploadedExpressions.value.map((expression) => [
        {
          hq: expression,
          lq: expression,
          sourcePack: "dddg.temp1:default"
        }
      ]);
    });
    const temporaryCharacterModel = computed(() => {
      const poses = previewPoses.value;
      const character = store.state.content.current.characters.find(
        (char) => char.id === props.character
      );
      return {
        id: character.id,
        size: [960, 960],
        defaultScale: [0.8, 0.8],
        hd: false,
        heads: {
          "dddg.temp1:default": {
            variants: expressionModels.value,
            previewSize: [0, 0],
            previewOffset: [0, 0]
          }
        },
        styleGroups: [
          {
            id: "preview",
            styleComponents: [],
            styles: [
              {
                components: {},
                poses: poses.map((pose, idx) => {
                  const styleGroup = character.styleGroups[pose.styleGroupId];
                  const style = styleGroup.styles[pose.styleId];
                  const renderCommands = style.poses[pose.poseId].renderCommands.slice(0);
                  let headIdx = renderCommands.findIndex(
                    (command) => command.type === "head"
                  );
                  const headRenderCommand = renderCommands[headIdx];
                  const newHeadCommand = {
                    type: "head",
                    offset: [
                      headRenderCommand.offset[0] + offsetX.value,
                      headRenderCommand.offset[1] + offsetY.value
                    ]
                  };
                  if (addMask.value && headGroup.value && headGroup.value.imagePatching && headGroup.value.imagePatching.mask != null) {
                    const mask = headGroup.value.imagePatching.mask;
                    renderCommands.splice(headIdx, 1);
                    headIdx = 1;
                    renderCommands.splice(0, 0, newHeadCommand, {
                      type: "image",
                      images: [
                        {
                          hq: mask,
                          lq: mask,
                          sourcePack: "dddg.temp1"
                        }
                      ],
                      composite: "destination-in",
                      offset: headRenderCommand.offset
                    });
                  } else {
                    renderCommands.splice(headIdx, 1, newHeadCommand);
                  }
                  if (addExtras.value && headGroup.value && headGroup.value.imagePatching && headGroup.value.imagePatching.addition != null) {
                    const add = headGroup.value.imagePatching.addition;
                    renderCommands.splice(headIdx + 1, 0, {
                      type: "image",
                      images: [
                        {
                          hq: add,
                          lq: add,
                          sourcePack: "dddg.temp1"
                        }
                      ],
                      offset: headRenderCommand.offset
                    });
                  }
                  return __spreadProps(__spreadValues({}, style.poses[pose.poseId]), {
                    renderCommands,
                    id: "dddg.temp1:pose" + idx,
                    compatibleHeads: ["dddg.temp1:default"]
                  });
                })
              }
            ]
          }
        ],
        label: "",
        chibi: null
      };
    });
    const uploadsFinished = ref(false);
    const batchRunner = ref(null);
    batchRunner.value = new WorkBatch(
      processExpression,
      () => __async(this, null, function* () {
      })
    );
    function processExpression(expression, isRunning) {
      return __async(this, null, function* () {
        const asset = yield getAssetByUrl(expression);
        if (!isRunning())
          return void 0;
        const renderer = new Renderer(
          asset.width + offsetX.value,
          asset.height + offsetY.value
        );
        const blob = yield renderer.renderToBlob((rx) => __async(this, null, function* () {
          rx.drawImage({
            image: asset,
            x: offsetX.value,
            y: offsetY.value,
            w: asset.width,
            h: asset.height
          });
          if (addMask.value && headGroup.value && headGroup.value.imagePatching && headGroup.value.imagePatching.mask != null) {
            const mask = yield getAssetByUrl(headGroup.value.imagePatching.mask);
            if (!isRunning())
              return void 0;
            rx.drawImage({
              image: mask,
              x: 0,
              y: 0,
              w: mask.width,
              h: mask.height,
              composite: "destination-in"
            });
          }
          if (addExtras.value && headGroup.value && headGroup.value.imagePatching && headGroup.value.imagePatching.addition != null) {
            const addition = yield getAssetByUrl(
              headGroup.value.imagePatching.addition
            );
            if (!isRunning())
              return void 0;
            rx.drawImage({
              image: addition,
              x: 0,
              y: 0,
              w: addition.width,
              h: addition.height
            });
          }
        }));
        const finalExpression = URL.createObjectURL(blob);
        names.value[finalExpression] = names.value[expression];
        if (expression !== finalExpression && expression.startsWith("blob:")) {
          URL.revokeObjectURL(expression);
        }
        return finalExpression;
      });
    }
    function finishUpload() {
      return __async(this, null, function* () {
        uploadsFinished.value = true;
        const processedExpressions = (yield batchRunner.value.run(uploadedExpressions.value)).filter((exp) => exp);
        const storeCharacter = store.state.content.current.characters.find(
          (char) => char.id === props.character
        );
        const old = store.state.content.contentPacks.find(
          (x) => x.packId === uploadedExpressionsPackDefaults.packId
        ) || uploadedExpressionsPackDefaults;
        const newPackVersion = JSON.parse(
          JSON.stringify(old)
        );
        let character = newPackVersion.characters.find(
          (char) => char.id === props.character
        );
        if (!character) {
          character = {
            id: props.character,
            heads: {},
            styleGroups: [],
            label: "",
            chibi: null,
            size: [960, 960],
            defaultScale: [0.8, 0.8],
            hd: false
          };
          newPackVersion.characters.push(character);
        }
        let headGroup_ = character.heads[headGroup.value.name];
        const storeHeadGroup = storeCharacter.heads[headGroup.value.name];
        if (!headGroup_) {
          headGroup_ = {
            previewSize: storeHeadGroup.previewSize,
            previewOffset: storeHeadGroup.previewOffset,
            variants: []
          };
          character.heads[headGroup.value.name] = headGroup_;
        }
        for (const processedExpression of processedExpressions) {
          const assetUrl = yield store.dispatch("uploadUrls/add", {
            name: "expression_" + (names.value[processedExpression] || ""),
            url: processedExpression
          });
          headGroup_.variants.push([
            {
              hq: assetUrl,
              lq: assetUrl,
              sourcePack: uploadedExpressionsPackDefaults.packId
            }
          ]);
        }
        yield transaction(() => __async(this, null, function* () {
          yield store.dispatch("content/replaceContentPack", {
            contentPack: newPackVersion,
            processed: true
          });
        }));
        leave();
      });
    }
    const upload = ref(null);
    function addByUpload() {
      const uploadInput = upload.value;
      if (!uploadInput.files)
        return;
      for (const file of uploadInput.files) {
        addByImageFile(file);
      }
    }
    function addByImageFile(file) {
      const url = URL.createObjectURL(file);
      addUrl(file.name, url);
    }
    function addByUrl() {
      return __async(this, null, function* () {
        const url = yield envX.prompt("Enter the url of the image.", "");
        if (url == null)
          return;
        const lastSegment = url.split("/").slice(-1)[0];
        addUrl(lastSegment, url);
      });
    }
    function addUrl(name, url) {
      currentUploadedExpression.value = url;
      names.value[url] = name;
      uploadedExpressions.value.push(url);
    }
    const masks = {
      "dddg.buildin.base.monika:straight": "assets/mask/monika-a-mask.png",
      "dddg.buildin.base.monika:sideways": "assets/mask/monika-b-mask.png",
      "dddg.buildin.base.natsuki:straight": "assets/mask/natsuki-a-mask.png",
      "dddg.buildin.base.natsuki:sideways": "assets/mask/natsuki-b-mask.png",
      "dddg.buildin.base.natsuki:turnedAway": "assets/mask/natsuki-c-mask.png",
      "dddg.buildin.base.sayori:straight": "assets/mask/sayori-a-mask.png",
      "dddg.buildin.base.sayori:sideways": "assets/mask/sayori-b-mask.png",
      "dddg.buildin.base.yuri:straight": "assets/mask/yuri-a-mask.png",
      "dddg.buildin.base.yuri:sideways": "assets/mask/yuri-b-mask.png"
    };
    const adds = {
      "dddg.buildin.base.natsuki:straight": "assets/mask/natsuki-a-add.png"
    };
    const baseUrl = "https://github.com/edave64/Doki-Doki-Dialog-Generator/tree/master/public/assets/";
    const listPaths = {
      "dddg.buildin.base.monika:ddlc.monika": `${baseUrl}monika`,
      "dddg.buildin.base.natsuki:ddlc.natsuki": `${baseUrl}natsuki`,
      "dddg.buildin.base.sayori:ddlc.sayori": `${baseUrl}sayori`,
      "dddg.buildin.base.yuri:ddlc.yuri": `${baseUrl}yuri`,
      "dddg.buildin.amy1:ddlc.fan.amy1": `${baseUrl}classic_amy`,
      "dddg.buildin.amy2:ddlc.fan.amy2": `${baseUrl}amy`,
      "dddg.buildin.femc:ddlc.fan.femc": `${baseUrl}femc`,
      "dddg.buildin.femc:ddlc.fan.femc:straight_lh": `${baseUrl}femc_lh`,
      "dddg.buildin.femc:ddlc.fan.femc:straight_hetero": `${baseUrl}femc/hetero`,
      "dddg.buildin.femc:ddlc.fan.femc:straight_hetero_lh": `${baseUrl}femc_lh/hetero`,
      "dddg.buildin.mc_classic:ddlc.fan.mc1": `${baseUrl}classic_mc`,
      "dddg.buildin.mc:ddlc.fan.mc2": `${baseUrl}mc`,
      "dddg.buildin.mc:ddlc.fan.mc2:straight_red": `${baseUrl}mc/red`,
      "dddg.buildin.mc_chad:ddlc.fan.mc_chad": `${baseUrl}chad`,
      "dddg.buildin.mc_chad:ddlc.fan.mc_chad:straight_red": `${baseUrl}chad/red`
    };
    const charDefDefaults = {
      type: "character",
      characterType: "",
      freeMove: false,
      close: false,
      styleGroupId: 0,
      styleId: 0,
      poseId: 0,
      posePositions: {},
      panelId: 0,
      id: 0,
      y: 0,
      rotation: 0,
      preserveRatio: true,
      ratio: 1,
      opacity: 100,
      version: 1,
      flip: false,
      onTop: false,
      composite: "source-over",
      filters: []
    };
    watch(() => availableHeadGroups.value, applySingleHeadGroup);
    watch(
      () => [
        availableHeadGroups.value,
        previewPoseIdx.value,
        previewPoses.value,
        currentUploadedExpression.value,
        offsetX.value,
        offsetY.value,
        addMask.value,
        addExtras.value
      ],
      redraw
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "wrapper",
        onDragenter: dragEnter,
        onMouseleave: _cache[9] || (_cache[9] = ($event) => dt.value.hide())
      }, [
        _hoisted_1,
        !headGroup.value ? (openBlock(), createBlock(Selector, {
          key: 0,
          label: "What kind of expression would you like to add?"
        }, {
          default: withCtx(() => [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(availableHeadGroups), (headgroup) => {
              return openBlock(), createBlock(Selection, {
                key: headgroup.name,
                label: normalizeName(headgroup.name),
                images: headgroup.preview,
                onSelected: ($event) => headGroup.value = headgroup
              }, null, 8, ["label", "images", "onSelected"]);
            }), 128))
          ]),
          _: 1
        })) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
          !uploadsFinished.value ? (openBlock(), createElementBlock("div", _hoisted_2, [
            createBaseVNode("h2", null, [
              createTextVNode(" Upload new '" + toDisplayString(normalizeName(headGroup.value.name)) + "' expressions ", 1),
              unref(downloadLink) ? (openBlock(), createBlock(_sfc_main$3, {
                key: 0,
                to: unref(downloadLink)
              }, {
                default: withCtx(() => [
                  createTextVNode("(Template)")
                ]),
                _: 1
              }, 8, ["to"])) : createCommentVNode("", true),
              unref(listLink) ? (openBlock(), createBlock(_sfc_main$3, {
                key: 1,
                to: unref(listLink)
              }, {
                default: withCtx(() => [
                  createTextVNode("(List)")
                ]),
                _: 1
              }, 8, ["to"])) : createCommentVNode("", true)
            ]),
            createVNode(DropTarget, {
              ref_key: "dt",
              ref: dt,
              class: "drop-target",
              onDrop: addByImageFile
            }, {
              default: withCtx(() => [
                createTextVNode("Drop here to add as a new expression ")
              ]),
              _: 1
            }, 512),
            createBaseVNode("div", _hoisted_3, [
              createBaseVNode("div", {
                class: "expression_list",
                onWheelPassive: _cache[1] || (_cache[1] = (...args) => unref(verticalScrollRedirect) && unref(verticalScrollRedirect)(...args))
              }, [
                createBaseVNode("button", {
                  onClick: _cache[0] || (_cache[0] = ($event) => upload.value.click())
                }, [
                  createTextVNode(" Upload expression "),
                  createBaseVNode("input", {
                    type: "file",
                    ref_key: "upload",
                    ref: upload,
                    multiple: "",
                    onChange: addByUpload
                  }, null, 544)
                ]),
                createBaseVNode("button", { onClick: addByUrl }, "Add expression from URL"),
                (openBlock(true), createElementBlock(Fragment, null, renderList(uploadedExpressions.value, (expression, idx) => {
                  return openBlock(), createElementBlock("div", {
                    key: idx,
                    style: normalizeStyle({ backgroundImage: `url('${expression}')` }),
                    class: normalizeClass({
                      expression_item: true,
                      active: currentUploadedExpression.value === expression
                    }),
                    onClick: ($event) => currentUploadedExpression.value = expression
                  }, null, 14, _hoisted_4);
                }), 128))
              ], 32),
              createBaseVNode("div", _hoisted_5, [
                createBaseVNode("div", _hoisted_6, [
                  createBaseVNode("canvas", {
                    ref_key: "target",
                    ref: target,
                    width: unref(previewPoses)[previewPoseIdx.value].width,
                    height: unref(previewPoses)[previewPoseIdx.value].height
                  }, null, 8, _hoisted_7)
                ]),
                createBaseVNode("div", null, [
                  createTextVNode(" Preview pose: "),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => previewPoseIdx.value = $event)
                  }, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(unref(previewPoses), (pose, idx) => {
                      return openBlock(), createElementBlock("option", {
                        key: idx,
                        value: idx
                      }, toDisplayString(normalizeName(pose.name)), 9, _hoisted_8);
                    }), 128))
                  ], 512), [
                    [vModelSelect, previewPoseIdx.value]
                  ]),
                  createVNode(DFieldset, { title: "Offset" }, {
                    default: withCtx(() => [
                      createBaseVNode("table", null, [
                        createBaseVNode("tr", null, [
                          _hoisted_9,
                          createBaseVNode("td", null, [
                            withDirectives(createBaseVNode("input", {
                              type: "number",
                              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => offsetX.value = $event),
                              onKeydown: _cache[4] || (_cache[4] = withModifiers(() => {
                              }, ["stop"]))
                            }, null, 544), [
                              [
                                vModelText,
                                offsetX.value,
                                void 0,
                                { number: true }
                              ]
                            ])
                          ]),
                          _hoisted_10,
                          createBaseVNode("td", null, [
                            withDirectives(createBaseVNode("input", {
                              type: "number",
                              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => offsetY.value = $event),
                              onKeydown: _cache[6] || (_cache[6] = withModifiers(() => {
                              }, ["stop"]))
                            }, null, 544), [
                              [
                                vModelText,
                                offsetY.value,
                                void 0,
                                { number: true }
                              ]
                            ])
                          ])
                        ])
                      ]),
                      offsetX.value !== 0 || offsetY.value !== 0 ? (openBlock(), createElementBlock("p", _hoisted_11, " WARNING: Offsets will be lost when saving/loading. ")) : createCommentVNode("", true)
                    ]),
                    _: 1
                  }),
                  headGroup.value.imagePatching && headGroup.value.imagePatching.mask ? (openBlock(), createBlock(_sfc_main$4, {
                    key: 0,
                    label: "Reduce to fit DDDG standard",
                    modelValue: addMask.value,
                    "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => addMask.value = $event)
                  }, null, 8, ["modelValue"])) : createCommentVNode("", true),
                  headGroup.value.imagePatching && headGroup.value.imagePatching.addition ? (openBlock(), createBlock(_sfc_main$4, {
                    key: 1,
                    label: "Add new parts to fit DDDG standard",
                    modelValue: addExtras.value,
                    "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => addExtras.value = $event)
                  }, null, 8, ["modelValue"])) : createCommentVNode("", true),
                  createBaseVNode("button", {
                    disabled: currentUploadedExpression.value === null,
                    onClick: removeUploadedExpression
                  }, " Remove this expression ", 8, _hoisted_12),
                  createBaseVNode("button", { onClick: finishUpload }, "Finish"),
                  createBaseVNode("button", { onClick: leave }, "Abort")
                ])
              ])
            ])
          ])) : (openBlock(), createElementBlock("div", _hoisted_13, [
            createBaseVNode("h2", null, " Finishing up images. " + toDisplayString(Math.round(batchRunner.value.percentage * 100)) + "% ", 1)
          ]))
        ], 64))
      ], 32);
    };
  }
});
const index_vue_vue_type_style_index_0_scoped_61fa4824_lang = "";
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-61fa4824"]]);
export {
  index as default
};
