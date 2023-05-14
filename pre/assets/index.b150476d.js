import { x as reactive, d as defineComponent, _ as _export_sfc, o as openBlock, c as createElementBlock, a as createBaseVNode, t as toDisplayString, q as normalizeStyle, b as withModifiers, y as renderSlot, z as VerticalScrollRedirect, j as ToggleBox, D as DropTarget, A as DFieldset, L, B as getAAssetUrl, k as envX, C as getAssetByUrl, E as Renderer, G as Character, S as SelectedState, m as createBlock, i as withCtx, F as Fragment, l as createTextVNode, e as createCommentVNode, h as createVNode, r as renderList, n as normalizeClass, w as withDirectives, H as vModelSelect, s as resolveComponent, v as vModelText, p as pushScopeId, g as popScopeId } from "./index.75d91810.js";
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
const _sfc_main$2 = defineComponent({
  props: {
    icon: String,
    label: String,
    images: {
      default: []
    }
  },
  computed: {
    background() {
      return this.images.map((i) => `center / contain no-repeat url('${i}')`).join(",");
    }
  }
});
const selection_vue_vue_type_style_index_0_scoped_9845bfb8_lang = "";
const _hoisted_1$2 = { class: "icon material-icons" };
const _hoisted_2$1 = { class: "label" };
function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", {
    class: "selection",
    style: normalizeStyle({ background: _ctx.background }),
    onClick: _cache[0] || (_cache[0] = withModifiers(($event) => _ctx.$emit("selected"), ["stop"]))
  }, [
    createBaseVNode("div", _hoisted_1$2, toDisplayString(_ctx.icon), 1),
    createBaseVNode("div", _hoisted_2$1, toDisplayString(_ctx.label), 1)
  ], 4);
}
const Selection = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$2], ["__scopeId", "data-v-9845bfb8"]]);
const _sfc_main$1 = defineComponent({});
const selector_vue_vue_type_style_index_0_scoped_5cd45a10_lang = "";
const _hoisted_1$1 = { class: "selector" };
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1$1, [
    renderSlot(_ctx.$slots, "default", {}, void 0, true)
  ]);
}
const Selector = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__scopeId", "data-v-5cd45a10"]]);
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
const partFiles = {};
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
const _sfc_main = defineComponent({
  mixins: [VerticalScrollRedirect],
  components: { Selection, Selector, ToggleBox, DropTarget, DFieldset, L },
  props: {
    character: {
      type: String,
      required: true
    },
    initHeadGroup: String
  },
  data: () => ({
    method: "upload",
    headGroup: null,
    uploadsFinished: false,
    everythingBroken: false,
    uploadedExpressions: [],
    currentUploadedExpression: null,
    previewPoseIdx: 0,
    offsetX: 0,
    offsetY: 0,
    addMask: false,
    addExtras: false,
    batchRunner: null,
    names: {}
  }),
  created() {
    window.exp = this;
    this.batchRunner = new WorkBatch(
      this.processExpression.bind(this),
      () => __async(this, null, function* () {
      })
    );
    if (this.initHeadGroup != null) {
      this.headGroup = this.availableHeadGroups.find(
        (group) => group.name === this.initHeadGroup
      );
    }
    this.applySingleHeadGroup();
  },
  watch: {
    availableHeadGroups() {
      this.applySingleHeadGroup();
    },
    previewPoseIdx() {
      this.redraw();
    },
    previewPoses() {
      this.redraw();
    },
    currentUploadedExpression() {
      this.redraw();
    },
    offsetX() {
      this.redraw();
    },
    offsetY() {
      this.redraw();
    },
    addMask() {
      this.redraw();
    },
    addExtras() {
      this.redraw();
    }
  },
  methods: {
    applySingleHeadGroup() {
      if (this.availableHeadGroups.length === 1) {
        this.headGroup = this.availableHeadGroups[0];
      }
    },
    addByUpload() {
      return __async(this, null, function* () {
        const uploadInput = this.$refs.upload;
        if (!uploadInput.files)
          return;
        for (const file of uploadInput.files) {
          this.addByImageFile(file);
        }
      });
    },
    addByImageFile(file) {
      const url = URL.createObjectURL(file);
      this.addUrl(file.name, url);
    },
    addByUrl() {
      return __async(this, null, function* () {
        const url = yield envX.prompt("Enter the url of the image.", "");
        if (url == null)
          return;
        const lastSegment = url.split("/").slice(-1)[0];
        this.addUrl(lastSegment, url);
      });
    },
    addUrl(name, url) {
      this.currentUploadedExpression = url;
      this.names[url] = name;
      this.uploadedExpressions.push(url);
    },
    processExpression(expression, isRunning) {
      return __async(this, null, function* () {
        const asset = yield getAssetByUrl(expression);
        if (!isRunning())
          return void 0;
        const renderer = new Renderer(
          asset.width + this.offsetX,
          asset.height + this.offsetY
        );
        const blob = yield renderer.renderToBlob((rx) => __async(this, null, function* () {
          rx.drawImage({
            image: asset,
            x: this.offsetX,
            y: this.offsetY,
            w: asset.width,
            h: asset.height
          });
          if (this.addMask && this.headGroup && this.headGroup.imagePatching && this.headGroup.imagePatching.mask != null) {
            const mask = yield getAssetByUrl(this.headGroup.imagePatching.mask);
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
          if (this.addExtras && this.headGroup && this.headGroup.imagePatching && this.headGroup.imagePatching.addition != null) {
            const addition = yield getAssetByUrl(
              this.headGroup.imagePatching.addition
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
        this.names[finalExpression] = this.names[expression];
        if (expression !== finalExpression && expression.startsWith("blob:")) {
          URL.revokeObjectURL(expression);
        }
        return finalExpression;
      });
    },
    redraw() {
      return __async(this, null, function* () {
        if (this.uploadsFinished)
          return;
        const pose = this.previewPoses[this.previewPoseIdx];
        let charRenderer;
        try {
          charRenderer = new Character(
            __spreadProps(__spreadValues({}, charDefDefaults), {
              width: pose.width,
              height: pose.height,
              poseId: this.previewPoseIdx,
              x: pose.width / 2,
              posePositions: {
                headGroup: 0,
                head: this.uploadedExpressions.indexOf(
                  this.currentUploadedExpression
                )
              },
              label: null,
              textboxColor: null,
              enlargeWhenTalking: false,
              nameboxWidth: null,
              zoom: 1
            }),
            yield this.temporaryCharacterModel
          );
        } catch (e) {
          return;
        }
        this.$nextTick(() => __async(this, null, function* () {
          if (this.uploadsFinished)
            return;
          const renderer = new Renderer(pose.width, pose.height);
          try {
            yield renderer.render((rx) => __async(this, null, function* () {
              yield charRenderer.render(SelectedState.None, rx, false);
            }));
            const target = this.$refs.target;
            const ctx = target.getContext("2d");
            ctx.clearRect(0, 0, target.width, target.height);
            renderer.paintOnto(ctx, {
              x: 0,
              y: 0,
              w: target.width,
              h: target.height
            });
          } finally {
            charRenderer.dispose();
            renderer.dispose();
          }
        }));
      });
    },
    finishUpload() {
      return __async(this, null, function* () {
        this.uploadsFinished = true;
        const processedExpressions = (yield this.batchRunner.run(this.uploadedExpressions)).filter((exp) => exp);
        const storeCharacter = this.$store.state.content.current.characters.find(
          (char) => char.id === this.character
        );
        const old = this.$store.state.content.contentPacks.find(
          (x) => x.packId === uploadedExpressionsPackDefaults.packId
        ) || uploadedExpressionsPackDefaults;
        const newPackVersion = JSON.parse(
          JSON.stringify(old)
        );
        let character = newPackVersion.characters.find(
          (char) => char.id === this.character
        );
        if (!character) {
          character = {
            id: this.character,
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
        let headGroup = character.heads[this.headGroup.name];
        const storeHeadGroup = storeCharacter.heads[this.headGroup.name];
        if (!headGroup) {
          headGroup = {
            previewSize: storeHeadGroup.previewSize,
            previewOffset: storeHeadGroup.previewOffset,
            variants: []
          };
          character.heads[this.headGroup.name] = headGroup;
        }
        for (const processedExpression of processedExpressions) {
          const assetUrl = yield this.$store.dispatch("uploadUrls/add", {
            name: "expression_" + (this.names[processedExpression] || ""),
            url: processedExpression
          });
          headGroup.variants.push([
            {
              hq: assetUrl,
              lq: assetUrl,
              sourcePack: uploadedExpressionsPackDefaults.packId
            }
          ]);
        }
        yield this.vuexHistory.transaction(() => {
          this.$store.dispatch("content/replaceContentPack", {
            contentPack: newPackVersion,
            processed: true
          });
        });
        this.leave();
      });
    },
    leave() {
      this.$emit("leave");
      this.method = null;
      this.headGroup = null;
      this.uploadedExpressions = [];
    },
    removeUploadedExpression() {
      if (this.currentUploadedExpression == null)
        return;
      const expression = this.currentUploadedExpression;
      this.currentUploadedExpression = null;
      if (expression.startsWith("blob:")) {
        URL.revokeObjectURL(expression);
      }
      let idx = this.uploadedExpressions.indexOf(expression);
      this.uploadedExpressions.splice(idx, 1);
      if (idx > this.uploadedExpressions.length - 1) {
        idx = this.uploadedExpressions.length - 1;
      }
      this.currentUploadedExpression = this.uploadedExpressions[idx] || null;
    },
    normalizeName(name) {
      const parts = name.split(":");
      let actualName = parts[parts.length - 1];
      const packId = parts.length > 1 ? parts[0].trim() : "";
      actualName = (actualName[0].toUpperCase() + actualName.slice(1).toLowerCase()).split("_").join(" ");
      if (packId.startsWith("dddg.") || packId === "") {
        return actualName;
      }
      return packId + ": " + actualName;
    },
    dragEnter(e) {
      if (!this.headGroup || this.method !== "upload")
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
      this.$refs.dt.show();
    },
    hideDt() {
      if (this.$refs.dt)
        this.$refs.dt.hide();
    }
  },
  computed: {
    characterData() {
      return this.$store.state.content.current.characters.find(
        (char) => char.id === this.character
      );
    },
    availableHeadGroups() {
      const characterData = this.characterData;
      const headTypes = Object.keys(characterData.heads);
      return headTypes.map((headTypeKey) => {
        const headType = characterData.heads[headTypeKey];
        return {
          name: headTypeKey,
          preview: headType.variants[0].map(
            (asset) => getAAssetUrl(asset, false)
          ),
          partsFiles: partFiles[headTypeKey] || [],
          imagePatching: {
            mask: masks[headTypeKey],
            addition: adds[headTypeKey]
          }
        };
      });
    },
    hasParts() {
      return !!this.availableHeadGroups.find(
        (headGroup) => headGroup.partsFiles.length > 0
      );
    },
    downloadLink() {
      const character = this.characterData;
      if (!this.headGroup)
        return null;
      const headType = character.heads[this.headGroup.name];
      return headType.variants[0][0].hq;
    },
    listLink() {
      var _a, _b;
      if (!this.headGroup)
        return null;
      const charName = this.characterData.id;
      const headGroupName = this.headGroup.name;
      return (_b = (_a = listPaths[charName + ":" + headGroupName]) != null ? _a : listPaths[charName]) != null ? _b : null;
    },
    previewPoses() {
      const character = this.characterData;
      if (!this.headGroup)
        return [];
      const poses = [];
      for (let styleGroupIdx = 0; styleGroupIdx < character.styleGroups.length; ++styleGroupIdx) {
        const styleGroup = character.styleGroups[styleGroupIdx];
        for (let styleIdx = 0; styleIdx < styleGroup.styles.length; ++styleIdx) {
          const style = styleGroup.styles[styleIdx];
          for (let poseIdx = 0; poseIdx < style.poses.length; ++poseIdx) {
            const pose = style.poses[poseIdx];
            if (pose.compatibleHeads.includes(this.headGroup.name)) {
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
    },
    expressionModels() {
      return this.uploadedExpressions.map((expression) => [
        {
          hq: expression,
          lq: expression,
          sourcePack: "dddg.temp1:default"
        }
      ]);
    },
    temporaryCharacterModel() {
      const poses = this.previewPoses;
      const character = this.$store.state.content.current.characters.find(
        (char) => char.id === this.character
      );
      const offsetX = this.offsetX;
      const offsetY = this.offsetY;
      return {
        id: this.character,
        size: [960, 960],
        defaultScale: [0.8, 0.8],
        hd: false,
        heads: {
          "dddg.temp1:default": {
            variants: this.expressionModels,
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
                      headRenderCommand.offset[0] + offsetX,
                      headRenderCommand.offset[1] + offsetY
                    ]
                  };
                  if (this.addMask && this.headGroup && this.headGroup.imagePatching && this.headGroup.imagePatching.mask != null) {
                    const mask = this.headGroup.imagePatching.mask;
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
                  if (this.addExtras && this.headGroup && this.headGroup.imagePatching && this.headGroup.imagePatching.addition != null) {
                    const add = this.headGroup.imagePatching.addition;
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
    }
  }
});
const index_vue_vue_type_style_index_0_scoped_39890924_lang = "";
const _withScopeId = (n) => (pushScopeId("data-v-39890924"), n = n(), popScopeId(), n);
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
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_selection = resolveComponent("selection");
  const _component_selector = resolveComponent("selector");
  const _component_l = resolveComponent("l");
  const _component_drop_target = resolveComponent("drop-target");
  const _component_d_fieldset = resolveComponent("d-fieldset");
  const _component_toggle_box = resolveComponent("toggle-box");
  return openBlock(), createElementBlock("div", {
    class: "wrapper",
    onDragenter: _cache[16] || (_cache[16] = (...args) => _ctx.dragEnter && _ctx.dragEnter(...args)),
    onMouseleave: _cache[17] || (_cache[17] = (...args) => _ctx.hideDt && _ctx.hideDt(...args))
  }, [
    _hoisted_1,
    !_ctx.headGroup ? (openBlock(), createBlock(_component_selector, {
      key: 0,
      label: "What kind of expression would you like to add?"
    }, {
      default: withCtx(() => [
        (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.availableHeadGroups, (headgroup) => {
          return openBlock(), createBlock(_component_selection, {
            key: headgroup.name,
            label: _ctx.normalizeName(headgroup.name),
            images: headgroup.preview,
            onSelected: ($event) => _ctx.headGroup = headgroup
          }, null, 8, ["label", "images", "onSelected"]);
        }), 128))
      ]),
      _: 1
    })) : !_ctx.method ? (openBlock(), createBlock(_component_selector, {
      key: 1,
      label: "How would you like to add the new expressions?"
    }, {
      default: withCtx(() => [
        createVNode(_component_selection, {
          label: "Build expressions from parts",
          icon: "info",
          disabled: _ctx.hasParts,
          onSelected: _cache[0] || (_cache[0] = ($event) => _ctx.method = "parts")
        }, null, 8, ["disabled"]),
        createVNode(_component_selection, {
          label: "Upload expression images",
          icon: "info",
          onSelected: _cache[1] || (_cache[1] = ($event) => _ctx.method = "upload")
        })
      ]),
      _: 1
    })) : _ctx.method === "upload" ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
      !_ctx.uploadsFinished ? (openBlock(), createElementBlock("div", _hoisted_2, [
        createBaseVNode("h2", null, [
          createTextVNode(" Upload new '" + toDisplayString(_ctx.normalizeName(_ctx.headGroup.name)) + "' expressions ", 1),
          _ctx.downloadLink ? (openBlock(), createBlock(_component_l, {
            key: 0,
            to: _ctx.downloadLink
          }, {
            default: withCtx(() => [
              createTextVNode("(Template)")
            ]),
            _: 1
          }, 8, ["to"])) : createCommentVNode("", true),
          _ctx.listLink ? (openBlock(), createBlock(_component_l, {
            key: 1,
            to: _ctx.listLink
          }, {
            default: withCtx(() => [
              createTextVNode("(List)")
            ]),
            _: 1
          }, 8, ["to"])) : createCommentVNode("", true)
        ]),
        createVNode(_component_drop_target, {
          ref: "dt",
          class: "drop-target",
          onDrop: _ctx.addByImageFile
        }, {
          default: withCtx(() => [
            createTextVNode("Drop here to add as a new expression ")
          ]),
          _: 1
        }, 8, ["onDrop"]),
        createBaseVNode("div", _hoisted_3, [
          createBaseVNode("div", {
            class: "expression_list",
            onWheelPassive: _cache[5] || (_cache[5] = (...args) => _ctx.verticalScrollRedirect && _ctx.verticalScrollRedirect(...args))
          }, [
            createBaseVNode("button", {
              onClick: _cache[3] || (_cache[3] = ($event) => _ctx.$refs.upload.click())
            }, [
              createTextVNode(" Upload expression "),
              createBaseVNode("input", {
                type: "file",
                ref: "upload",
                multiple: "",
                onChange: _cache[2] || (_cache[2] = (...args) => _ctx.addByUpload && _ctx.addByUpload(...args))
              }, null, 544)
            ]),
            createBaseVNode("button", {
              onClick: _cache[4] || (_cache[4] = (...args) => _ctx.addByUrl && _ctx.addByUrl(...args))
            }, "Add expression from URL"),
            (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.uploadedExpressions, (expression, idx) => {
              return openBlock(), createElementBlock("div", {
                key: idx,
                style: normalizeStyle({ backgroundImage: `url('${expression}')` }),
                class: normalizeClass({
                  expression_item: true,
                  active: _ctx.currentUploadedExpression === expression
                }),
                onClick: ($event) => _ctx.currentUploadedExpression = expression
              }, null, 14, _hoisted_4);
            }), 128))
          ], 32),
          createBaseVNode("div", _hoisted_5, [
            createBaseVNode("div", _hoisted_6, [
              createBaseVNode("canvas", {
                ref: "target",
                width: _ctx.previewPoses[_ctx.previewPoseIdx].width,
                height: _ctx.previewPoses[_ctx.previewPoseIdx].height
              }, null, 8, _hoisted_7)
            ]),
            createBaseVNode("div", null, [
              createTextVNode(" Preview pose: "),
              withDirectives(createBaseVNode("select", {
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => _ctx.previewPoseIdx = $event)
              }, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.previewPoses, (pose, idx) => {
                  return openBlock(), createElementBlock("option", {
                    key: idx,
                    value: idx
                  }, toDisplayString(_ctx.normalizeName(pose.name)), 9, _hoisted_8);
                }), 128))
              ], 512), [
                [vModelSelect, _ctx.previewPoseIdx]
              ]),
              createVNode(_component_d_fieldset, { title: "Offset" }, {
                default: withCtx(() => [
                  createBaseVNode("table", null, [
                    createBaseVNode("tr", null, [
                      _hoisted_9,
                      createBaseVNode("td", null, [
                        withDirectives(createBaseVNode("input", {
                          type: "number",
                          "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => _ctx.offsetX = $event),
                          onKeydown: _cache[8] || (_cache[8] = withModifiers(() => {
                          }, ["stop"]))
                        }, null, 544), [
                          [
                            vModelText,
                            _ctx.offsetX,
                            void 0,
                            { number: true }
                          ]
                        ])
                      ]),
                      _hoisted_10,
                      createBaseVNode("td", null, [
                        withDirectives(createBaseVNode("input", {
                          type: "number",
                          "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => _ctx.offsetY = $event),
                          onKeydown: _cache[10] || (_cache[10] = withModifiers(() => {
                          }, ["stop"]))
                        }, null, 544), [
                          [
                            vModelText,
                            _ctx.offsetY,
                            void 0,
                            { number: true }
                          ]
                        ])
                      ])
                    ])
                  ]),
                  _ctx.offsetX !== 0 || _ctx.offsetY !== 0 ? (openBlock(), createElementBlock("p", _hoisted_11, " WARNING: Offsets will be lost when saving/loading. ")) : createCommentVNode("", true)
                ]),
                _: 1
              }),
              _ctx.headGroup.imagePatching && _ctx.headGroup.imagePatching.mask ? (openBlock(), createBlock(_component_toggle_box, {
                key: 0,
                label: "Reduce to fit DDDG standard",
                modelValue: _ctx.addMask,
                "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => _ctx.addMask = $event)
              }, null, 8, ["modelValue"])) : createCommentVNode("", true),
              _ctx.headGroup.imagePatching && _ctx.headGroup.imagePatching.addition ? (openBlock(), createBlock(_component_toggle_box, {
                key: 1,
                label: "Add new parts to fit DDDG standard",
                modelValue: _ctx.addExtras,
                "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => _ctx.addExtras = $event)
              }, null, 8, ["modelValue"])) : createCommentVNode("", true),
              createBaseVNode("button", {
                disabled: _ctx.currentUploadedExpression === null,
                onClick: _cache[13] || (_cache[13] = (...args) => _ctx.removeUploadedExpression && _ctx.removeUploadedExpression(...args))
              }, " Remove this expression ", 8, _hoisted_12),
              createBaseVNode("button", {
                onClick: _cache[14] || (_cache[14] = (...args) => _ctx.finishUpload && _ctx.finishUpload(...args))
              }, "Finish"),
              createBaseVNode("button", {
                onClick: _cache[15] || (_cache[15] = (...args) => _ctx.leave && _ctx.leave(...args))
              }, "Abort")
            ])
          ])
        ])
      ])) : (openBlock(), createElementBlock("div", _hoisted_13, [
        createBaseVNode("h2", null, " Finishing up images. " + toDisplayString(Math.round(_ctx.batchRunner.percentage * 100)) + "% ", 1)
      ]))
    ], 64)) : createCommentVNode("", true)
  ], 32);
}
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-39890924"]]);
export {
  index as default
};
