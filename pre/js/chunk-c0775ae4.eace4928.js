(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-c0775ae4"],{"519d":function(e,t,n){"use strict";n("d61e")},"5c1a":function(e,t,n){},"936d":function(e,t,n){},"9e5a6":function(e,t,n){"use strict";n("936d")},a48c:function(e,t,n){"use strict";n("5c1a")},d61e:function(e,t,n){},d785:function(e,t,n){"use strict";n.r(t);n("b0c0");var r=n("7a23"),a=Object(r["F"])("data-v-09ef01a3");Object(r["r"])("data-v-09ef01a3");var i=Object(r["k"])("h1",null,"Add expressions",-1),s={key:0,class:"page"},o=Object(r["j"])("(Template)"),c=Object(r["j"])("(List)"),d=Object(r["j"])("Drop here to add as a new expression"),u={class:"expression_list_wrapper"},l=Object(r["j"])(" Upload expression "),p={class:"options_wrapper"},h={class:"image"},f=Object(r["j"])(" Preview pose: "),b=Object(r["k"])("th",null,"X:",-1),m=Object(r["k"])("th",null,"Y:",-1),g={key:1};Object(r["q"])();var v=a((function(e,t,n,v,k,j){var O=Object(r["w"])("selection"),y=Object(r["w"])("selector"),w=Object(r["w"])("l"),x=Object(r["w"])("drop-target"),G=Object(r["w"])("d-fieldset"),R=Object(r["w"])("toggle-box");return Object(r["p"])(),Object(r["g"])("div",{class:"wrapper",onDragenter:t[17]||(t[17]=function(){return e.dragEnter.apply(e,arguments)}),onMouseleave:t[18]||(t[18]=function(){return e.hideDt.apply(e,arguments)})},[i,e.headGroup?e.method?"upload"===e.method?(Object(r["p"])(),Object(r["g"])(r["a"],{key:2},[e.uploadsFinished?(Object(r["p"])(),Object(r["g"])("div",g,[Object(r["k"])("h2",null," Finishing up images. "+Object(r["x"])(Math.round(100*e.batchRunner.percentage))+"% ",1)])):(Object(r["p"])(),Object(r["g"])("div",s,[Object(r["k"])("h2",null,[Object(r["j"])(" Upload new '"+Object(r["x"])(e.normalizeName(e.headGroup.name))+"' expressions ",1),e.downloadLink?Object(r["k"])(w,{key:0,to:e.downloadLink},{default:a((function(){return[o]})),_:1},8,["to"]):Object(r["h"])("",!0),e.listLink?Object(r["k"])(w,{key:1,to:e.listLink},{default:a((function(){return[c]})),_:1},8,["to"]):Object(r["h"])("",!0)]),Object(r["k"])(x,{ref:"dt",class:"drop-target",onDrop:e.addByImageFile},{default:a((function(){return[d]})),_:1},8,["onDrop"]),Object(r["k"])("div",u,[Object(r["k"])("div",{class:"expression_list",onWheelPassive:t[6]||(t[6]=function(){return e.verticalScrollRedirect.apply(e,arguments)})},[Object(r["k"])("button",{onClick:t[4]||(t[4]=function(t){return e.$refs.upload.click()})},[l,Object(r["k"])("input",{type:"file",ref:"upload",multiple:"",onChange:t[3]||(t[3]=function(){return e.addByUpload.apply(e,arguments)})},null,544)]),Object(r["k"])("button",{onClick:t[5]||(t[5]=function(){return e.addByUrl.apply(e,arguments)})},"Add expression from URL"),(Object(r["p"])(!0),Object(r["g"])(r["a"],null,Object(r["u"])(e.uploadedExpressions,(function(t,n){return Object(r["p"])(),Object(r["g"])("div",{key:n,style:{backgroundImage:"url('".concat(t,"')")},class:{expression_item:!0,active:e.currentUploadedExpression===t},onClick:function(n){return e.currentUploadedExpression=t}},null,14,["onClick"])})),128))],32),Object(r["k"])("div",p,[Object(r["k"])("div",h,[Object(r["k"])("canvas",{ref:"target",width:e.previewPoses[e.previewPoseIdx].width,height:e.previewPoses[e.previewPoseIdx].height},null,8,["width","height"])]),Object(r["k"])("div",null,[f,Object(r["D"])(Object(r["k"])("select",{"onUpdate:modelValue":t[7]||(t[7]=function(t){return e.previewPoseIdx=t})},[(Object(r["p"])(!0),Object(r["g"])(r["a"],null,Object(r["u"])(e.previewPoses,(function(t,n){return Object(r["p"])(),Object(r["g"])("option",{key:n,value:n},Object(r["x"])(e.normalizeName(t.name)),9,["value"])})),128))],512),[[r["z"],e.previewPoseIdx]]),Object(r["k"])(G,{title:"Offset"},{default:a((function(){return[Object(r["k"])("table",null,[Object(r["k"])("tr",null,[b,Object(r["k"])("td",null,[Object(r["D"])(Object(r["k"])("input",{type:"number","onUpdate:modelValue":t[8]||(t[8]=function(t){return e.offsetX=t}),onKeydown:t[9]||(t[9]=Object(r["E"])((function(){}),["stop"]))},null,544),[[r["A"],e.offsetX,void 0,{number:!0}]])]),m,Object(r["k"])("td",null,[Object(r["D"])(Object(r["k"])("input",{type:"number","onUpdate:modelValue":t[10]||(t[10]=function(t){return e.offsetY=t}),onKeydown:t[11]||(t[11]=Object(r["E"])((function(){}),["stop"]))},null,544),[[r["A"],e.offsetY,void 0,{number:!0}]])])])])]})),_:1}),e.headGroup.imagePatching&&e.headGroup.imagePatching.mask?Object(r["k"])(R,{key:0,label:"Reduce to fit DDDG standard",modelValue:e.addMask,"onUpdate:modelValue":t[12]||(t[12]=function(t){return e.addMask=t})},null,8,["modelValue"]):Object(r["h"])("",!0),e.headGroup.imagePatching&&e.headGroup.imagePatching.addition?Object(r["k"])(R,{key:1,label:"Add new parts to fit DDDG standard",modelValue:e.addExtras,"onUpdate:modelValue":t[13]||(t[13]=function(t){return e.addExtras=t})},null,8,["modelValue"]):Object(r["h"])("",!0),Object(r["k"])("button",{disabled:null===e.currentUploadedExpression,onClick:t[14]||(t[14]=function(){return e.removeUploadedExpression.apply(e,arguments)})}," Remove this expression ",8,["disabled"]),Object(r["k"])("button",{onClick:t[15]||(t[15]=function(){return e.finishUpload.apply(e,arguments)})},"Finish"),Object(r["k"])("button",{onClick:t[16]||(t[16]=function(){return e.leave.apply(e,arguments)})},"Abort")])])])]))],64)):Object(r["h"])("",!0):Object(r["k"])(y,{key:1,label:"How would you like to add the new expressions?"},{default:a((function(){return[Object(r["k"])(O,{label:"Build expressions from parts",icon:"info",disabled:e.hasParts,onSelected:t[1]||(t[1]=function(t){return e.method="parts"})},null,8,["disabled"]),Object(r["k"])(O,{label:"Upload expression images",icon:"info",onSelected:t[2]||(t[2]=function(t){return e.method="upload"})})]})),_:1}):Object(r["k"])(y,{key:0,label:"What kind of expression would you like to add?"},{default:a((function(){return[(Object(r["p"])(!0),Object(r["g"])(r["a"],null,Object(r["u"])(e.availableHeadGroups,(function(t){return Object(r["p"])(),Object(r["g"])(O,{key:t.name,label:e.normalizeName(t.name),images:t.preview,onSelected:function(n){return e.headGroup=t}},null,8,["label","images","onSelected"])})),128))]})),_:1})],32)})),k=(n("4de4"),n("7db0"),n("c740"),n("a630"),n("caad"),n("c975"),n("a15b"),n("d81d"),n("fb6a"),n("a434"),n("b64b"),n("d3b7"),n("ac1f"),n("2532"),n("3ca3"),n("466d"),n("1276"),n("2ca0"),n("498a"),n("ddb0"),n("2b3d"),n("5530")),j=n("b85c"),O=(n("96cf"),n("1da1")),y=Object(r["F"])("data-v-044096e4");Object(r["r"])("data-v-044096e4");var w={class:"icon material-icons"},x={class:"label"};Object(r["q"])();var G=y((function(e,t,n,a,i,s){return Object(r["p"])(),Object(r["g"])("div",{class:"selection",style:{background:e.background},onClick:t[1]||(t[1]=Object(r["E"])((function(t){return e.$emit("selected")}),["stop"]))},[Object(r["k"])("div",w,Object(r["x"])(e.icon),1),Object(r["k"])("div",x,Object(r["x"])(e.label),1)],4)})),R=Object(r["m"])({props:{icon:String,label:String,images:{default:[]}},computed:{background:function(){return this.images.map((function(e){return"center / contain no-repeat url('".concat(e,"')")})).join(",")}}});n("519d");R.render=G,R.__scopeId="data-v-044096e4";var D=R,P=Object(r["F"])("data-v-2f9a028c");Object(r["r"])("data-v-2f9a028c");var E={class:"selector"};Object(r["q"])();var U=P((function(e,t,n,a,i,s){return Object(r["p"])(),Object(r["g"])("div",E,[Object(r["v"])(e.$slots,"default")])})),C=Object(r["m"])({});n("a48c");C.render=U,C.__scopeId="data-v-2f9a028c";var _=C,I=n("dc61"),S=n("c4e5"),L=n("032b"),H=n("aacd"),F=n("b3d7"),$=n("1a7b"),z=n("5947"),M=n("fd0b"),q=(n("6062"),n("d4ec")),B=n("bee2"),T=function(){function e(t,n){var a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:4;Object(q["a"])(this,e),this.runner=t,this.disposer=n,this.parallel=a,this.state=Object(r["s"])({busy:!1,error:null,completed:0,fullCount:0}),this.pendingData=[],this.currentlyRunning=new Set,this.resolveCurrentRun=null,this.rejectCurrentRun=null,this.returnData=[],this.remainingDisposers=new Set,this.runningDisposers=new Set}return Object(B["a"])(e,[{key:"run",value:function(e){var t=this;return this.rejectCurrentRun&&this.reject(),e=e.slice(),this.pendingData=e,this.returnData=[],this.state.fullCount=e.length,this.state.error=null,this.state.busy=!0,this.state.completed=0,new Promise((function(n,r){t.resolveCurrentRun=n,t.rejectCurrentRun=r,e.length>0?t.restock():t.resolve()}))}},{key:"restock",value:function(){while(this.remainingCapacity>0&&this.pendingData.length>0)this.startOne();while(this.remainingCapacity>0&&this.remainingDisposers.size>0)this.startDisposer()}},{key:"startOne",value:function(){var e=Object(O["a"])(regeneratorRuntime.mark((function e(){var t,n,r,a,i=this;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(t=this.pendingData.shift(),n=this.returnData.length,this.returnData[n]=void 0,t){e.next=5;break}return e.abrupt("return");case 5:return this.currentlyRunning.add(t),r=function(){return i.currentlyRunning.has(t)},e.prev=7,e.next=10,this.runner(t,r);case 10:a=e.sent,e.next=16;break;case 13:e.prev=13,e.t0=e["catch"](7),this.reject(e.t0);case 16:r()?(++this.state.completed,this.returnData[n]=a,this.currentlyRunning.delete(t),0===this.currentlyRunning.size&&0===this.pendingData.length&&this.resolve()):void 0!==a&&this.remainingDisposers.add(a),this.restock();case 18:case"end":return e.stop()}}),e,this,[[7,13]])})));function t(){return e.apply(this,arguments)}return t}()},{key:"startDisposer",value:function(){var e=Object(O["a"])(regeneratorRuntime.mark((function e(){var t;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return t=this.remainingDisposers.values().next().value,this.remainingDisposers.delete(t),this.runningDisposers.add(t),e.prev=3,e.next=6,this.disposer(t);case 6:e.next=10;break;case 8:e.prev=8,e.t0=e["catch"](3);case 10:this.runningDisposers.delete(t),this.restock();case 12:case"end":return e.stop()}}),e,this,[[3,8]])})));function t(){return e.apply(this,arguments)}return t}()},{key:"resolve",value:function(){this.state.busy=!1,this.state.completed=this.state.fullCount;var e=this.returnData,t=this.resolveCurrentRun;this.reset(),t(e)}},{key:"reject",value:function(e){this.state.busy=!1,this.state.error=(null===e||void 0===e?void 0:e.message)||null;var t=this.returnData,n=this.rejectCurrentRun;this.reset();var r,a=Object(j["a"])(t);try{for(a.s();!(r=a.n()).done;){var i=r.value;void 0!==i&&this.remainingDisposers.add(i)}}catch(s){a.e(s)}finally{a.f()}n()}},{key:"reset",value:function(){this.returnData=[],this.currentlyRunning=new Set,this.resolveCurrentRun=null,this.rejectCurrentRun=null}},{key:"remainingCapacity",get:function(){return this.parallel-this.currentlyRunning.size-this.runningDisposers.size}},{key:"busy",get:function(){return this.state.busy}},{key:"fullCount",get:function(){return this.state.fullCount}},{key:"completed",get:function(){return this.state.completed}},{key:"percentage",get:function(){return 0===this.fullCount?0:this.completed/this.fullCount}},{key:"error",get:function(){return this.state.error}}]),e}(),A=n("39b7"),V={packId:"dddg.buildin.uploadedExpressions",dependencies:[],packCredits:[],characters:[],fonts:[],sprites:[],poemStyles:[],poemBackgrounds:[],backgrounds:[],colors:[]},X={"dddg.buildin.base.monika:straight":"assets/mask/monika-a-mask.png","dddg.buildin.base.monika:sideways":"assets/mask/monika-b-mask.png","dddg.buildin.base.natsuki:straight":"assets/mask/natsuki-a-mask.png","dddg.buildin.base.natsuki:sideways":"assets/mask/natsuki-b-mask.png","dddg.buildin.base.natsuki:turnedAway":"assets/mask/natsuki-c-mask.png","dddg.buildin.base.sayori:straight":"assets/mask/sayori-a-mask.png","dddg.buildin.base.sayori:sideways":"assets/mask/sayori-b-mask.png","dddg.buildin.base.yuri:straight":"assets/mask/yuri-a-mask.png","dddg.buildin.base.yuri:sideways":"assets/mask/yuri-b-mask.png"},Y={"dddg.buildin.base.natsuki:straight":"assets/mask/natsuki-a-add.png"},W="https://github.com/edave64/Doki-Doki-Dialog-Generator/tree/master/public/assets/",N={"dddg.buildin.base.monika:ddlc.monika":"".concat(W,"monika"),"dddg.buildin.base.natsuki:ddlc.natsuki":"".concat(W,"natsuki"),"dddg.buildin.base.sayori:ddlc.sayori":"".concat(W,"sayori"),"dddg.buildin.base.yuri:ddlc.yuri":"".concat(W,"yuri"),"dddg.buildin.amy1:ddlc.fan.amy1":"".concat(W,"classic_amy"),"dddg.buildin.amy2:ddlc.fan.amy2":"".concat(W,"amy"),"dddg.buildin.femc:ddlc.fan.femc":"".concat(W,"femc"),"dddg.buildin.femc:ddlc.fan.femc:straight_lh":"".concat(W,"femc_lh"),"dddg.buildin.femc:ddlc.fan.femc:straight_hetero":"".concat(W,"femc/hetero"),"dddg.buildin.femc:ddlc.fan.femc:straight_hetero_lh":"".concat(W,"femc_lh/hetero"),"dddg.buildin.mc_classic:ddlc.fan.mc1":"".concat(W,"classic_mc"),"dddg.buildin.mc:ddlc.fan.mc2":"".concat(W,"mc"),"dddg.buildin.mc:ddlc.fan.mc2:straight_red":"".concat(W,"mc/red"),"dddg.buildin.mc_chad:ddlc.fan.mc_chad":"".concat(W,"chad"),"dddg.buildin.mc_chad:ddlc.fan.mc_chad:straight_red":"".concat(W,"chad/red")},J={},K={type:"character",characterType:"",freeMove:!1,close:!1,styleGroupId:0,styleId:0,poseId:0,posePositions:{},panelId:"",id:"",y:0,rotation:0,preserveRatio:!0,ratio:1,opacity:100,version:1,flip:!1,onTop:!1,composite:"source-over",filters:[]},Q=Object(r["m"])({mixins:[H["a"]],components:{Selection:D,Selector:_,ToggleBox:S["a"],DropTarget:I["a"],DFieldset:F["a"],L:A["a"]},props:{character:{type:String,required:!0},initHeadGroup:String},data:function(){return{method:"upload",headGroup:null,uploadsFinished:!1,everythingBroken:!1,uploadedExpressions:[],currentUploadedExpression:null,previewPoseIdx:0,offsetX:0,offsetY:0,addMask:!1,addExtras:!1,batchRunner:null}},created:function(){var e=this;window.exp=this,this.batchRunner=new T(this.processExpression.bind(this),Object(O["a"])(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:case"end":return e.stop()}}),e)})))),this.initHeadGroup&&(this.headGroup=this.availableHeadGroups.find((function(t){return t.name===e.initHeadGroup}))),this.applySingleHeadGroup()},watch:{availableHeadGroups:function(){this.applySingleHeadGroup()},previewPoseIdx:function(){this.redraw()},previewPoses:function(){this.redraw()},currentUploadedExpression:function(){this.redraw()},offsetX:function(){this.redraw()},offsetY:function(){this.redraw()},addMask:function(){this.redraw()},addExtras:function(){this.redraw()}},methods:{applySingleHeadGroup:function(){1===this.availableHeadGroups.length&&(this.headGroup=this.availableHeadGroups[0])},addByUpload:function(){var e=this;return Object(O["a"])(regeneratorRuntime.mark((function t(){var n,r,a,i;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:if(n=e.$refs.upload,n.files){t.next=3;break}return t.abrupt("return");case 3:r=Object(j["a"])(n.files);try{for(r.s();!(a=r.n()).done;)i=a.value,e.addByImageFile(i)}catch(s){r.e(s)}finally{r.f()}case 5:case"end":return t.stop()}}),t)})))()},addByImageFile:function(e){var t=URL.createObjectURL(e);this.addUrl(t)},addByUrl:function(){var e=this;return Object(O["a"])(regeneratorRuntime.mark((function t(){var n;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,L["a"].prompt("Enter the url of the image.","");case 2:if(n=t.sent,n){t.next=5;break}return t.abrupt("return");case 5:e.addUrl(n);case 6:case"end":return t.stop()}}),t)})))()},addUrl:function(e){this.currentUploadedExpression=e,this.uploadedExpressions.push(e)},processExpression:function(e,t){var n=this;return Object(O["a"])(regeneratorRuntime.mark((function r(){var a,i,s,o;return regeneratorRuntime.wrap((function(r){while(1)switch(r.prev=r.next){case 0:return r.next=2,Object(z["c"])(e);case 2:if(a=r.sent,t()){r.next=5;break}return r.abrupt("return",void 0);case 5:return i=new M["a"](a.width+n.offsetX,a.height+n.offsetY),r.next=8,i.renderToBlob(function(){var e=Object(O["a"])(regeneratorRuntime.mark((function e(r){var i,s;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(r.drawImage({image:a,x:n.offsetX,y:n.offsetY,w:a.width,h:a.height}),!(n.addMask&&n.headGroup&&n.headGroup.imagePatching&&n.headGroup.imagePatching.mask)){e.next=8;break}return e.next=4,Object(z["c"])(n.headGroup.imagePatching.mask);case 4:if(i=e.sent,t()){e.next=7;break}return e.abrupt("return",void 0);case 7:r.drawImage({image:i,x:0,y:0,w:i.width,h:i.height,composite:"destination-in"});case 8:if(!(n.addExtras&&n.headGroup&&n.headGroup.imagePatching&&n.headGroup.imagePatching.addition)){e.next=15;break}return e.next=11,Object(z["c"])(n.headGroup.imagePatching.addition);case 11:if(s=e.sent,t()){e.next=14;break}return e.abrupt("return",void 0);case 14:r.drawImage({image:s,x:0,y:0,w:s.width,h:s.height});case 15:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}());case 8:return s=r.sent,o=URL.createObjectURL(s),e!==o&&e.startsWith("blob:")&&URL.revokeObjectURL(e),r.abrupt("return",o);case 12:case"end":return r.stop()}}),r)})))()},redraw:function(){var e=this;return Object(O["a"])(regeneratorRuntime.mark((function t(){var n,r;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:if(!e.uploadsFinished){t.next=2;break}return t.abrupt("return");case 2:if(n=e.previewPoses[e.previewPoseIdx],n){t.next=5;break}return t.abrupt("return");case 5:return t.prev=5,t.t0=$["a"],t.t1=Object(k["a"])(Object(k["a"])({},K),{},{width:n.width,height:n.height,poseId:e.previewPoseIdx,x:n.width/2,posePositions:{headGroup:0,head:e.uploadedExpressions.indexOf(e.currentUploadedExpression)},label:null,textboxColor:null}),t.next=10,e.temporaryCharacterModel;case 10:t.t2=t.sent,r=new t.t0(t.t1,t.t2),t.next=17;break;case 14:return t.prev=14,t.t3=t["catch"](5),t.abrupt("return");case 17:e.$nextTick(Object(O["a"])(regeneratorRuntime.mark((function t(){var a,i,s;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:if(!e.uploadsFinished){t.next=2;break}return t.abrupt("return");case 2:return a=new M["a"](n.width,n.height),t.next=5,a.render(function(){var e=Object(O["a"])(regeneratorRuntime.mark((function e(t){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,r.render(!1,t);case 2:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}());case 5:i=e.$refs.target,s=i.getContext("2d"),s.clearRect(0,0,i.width,i.height),a.paintOnto(s,{x:0,y:0,w:i.width,h:i.height});case 9:case"end":return t.stop()}}),t)}))));case 18:case"end":return t.stop()}}),t,null,[[5,14]])})))()},finishUpload:function(){var e=this;return Object(O["a"])(regeneratorRuntime.mark((function t(){var n,r,a,i,s,o,c,d;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return e.uploadsFinished=!0,t.next=3,e.batchRunner.run(e.uploadedExpressions);case 3:n=t.sent.filter((function(e){return e})),r=e.$store.state.content.current.characters.find((function(t){return t.id===e.character})),a=V.characters.find((function(t){return t.id===e.character})),a||(a={id:e.character,heads:{},styleGroups:[],label:"",chibi:""},V.characters.push(a)),i=a.heads[e.headGroup.name],s=r.heads[e.headGroup.name],i||(i={previewSize:s.previewSize,previewOffset:s.previewOffset,variants:[]},a.heads[e.headGroup.name]=i),o=Object(j["a"])(n);try{for(o.s();!(c=o.n()).done;)d=c.value,i.variants.push([d])}catch(u){o.e(u)}finally{o.f()}return t.next=14,e.vuexHistory.transaction((function(){e.$store.dispatch("content/replaceContentPack",{contentPack:V})}));case 14:e.leave();case 15:case"end":return t.stop()}}),t)})))()},leave:function(){this.$emit("leave"),this.method=null,this.headGroup=null,this.uploadedExpressions=[]},removeUploadedExpression:function(){if(this.currentUploadedExpression){var e=this.currentUploadedExpression;this.currentUploadedExpression=null,e.startsWith("blob:")&&URL.revokeObjectURL(e);var t=this.uploadedExpressions.indexOf(e);this.uploadedExpressions.splice(t,1),t>this.uploadedExpressions.length-1&&(t=this.uploadedExpressions.length-1),this.currentUploadedExpression=this.uploadedExpressions[t]||null}},normalizeName:function(e){var t=e.split(":"),n=t[t.length-1],r=t.length>1?t[0].trim():"";return n=(n[0].toUpperCase()+n.slice(1).toLowerCase()).split("_").join(" "),r.startsWith("dddg.")||""===r?n:r+": "+n},dragEnter:function(e){this.headGroup&&"upload"===this.method&&e.dataTransfer&&(e.dataTransfer.effectAllowed="none",Array.from(e.dataTransfer.items).find((function(e){return e.type.match(/^image.*$/)}))&&(e.dataTransfer.effectAllowed="link",this.$refs.dt.show()))},hideDt:function(){this.$refs.dt&&this.$refs.dt.hide()}},computed:{characterData:function(){var e=this;return this.$store.state.content.current.characters.find((function(t){return t.id===e.character}))},availableHeadGroups:function(){var e=this.characterData,t=Object.keys(e.heads);return t.map((function(t){var n=e.heads[t];return{name:t,preview:n.variants[0].map((function(e){return e.lq})),partsFiles:J[t]||[],imagePatching:{mask:X[t],addition:Y[t]}}}))},hasParts:function(){return!!this.availableHeadGroups.find((function(e){return e.partsFiles.length>0}))},downloadLink:function(){var e=this.characterData;if(!e||!this.headGroup)return null;var t=e.heads[this.headGroup.name];return t?t.variants[0][0].hq:null},listLink:function(){if(!this.characterData||!this.headGroup)return null;var e=this.characterData.id,t=this.headGroup.name;return N[e+":"+t]?N[e+":"+t]||null:N[e]||null},previewPoses:function(){var e=this.characterData;if(!e||!this.headGroup)return[];for(var t=[],n=0;n<e.styleGroups.length;++n)for(var r=e.styleGroups[n],a=0;a<r.styles.length;++a)for(var i=r.styles[a],s=0;s<i.poses.length;++s){var o=i.poses[s];o.compatibleHeads.includes(this.headGroup.name)&&t.push({name:o.id,styleGroupId:n,styleId:a,poseId:s,width:o.size[0],height:o.size[1]})}return t},expressionModels:function(){return this.uploadedExpressions.map((function(e){return[{hq:e,lq:e,sourcePack:"dddg.temp1:default"}]}))},temporaryCharacterModel:function(){var e=this,t=this.previewPoses,n=this.$store.state.content.current.characters.find((function(t){return t.id===e.character})),r=this.offsetX,a=this.offsetY;return{id:this.character,heads:{"dddg.temp1:default":{variants:this.expressionModels,previewSize:[0,0],previewOffset:[0,0]}},styleGroups:[{id:"preview",styleComponents:[],styles:[{components:{},poses:t.map((function(t,i){var s=n.styleGroups[t.styleGroupId],o=s.styles[t.styleId],c=o.poses[t.poseId].renderCommands.slice(0),d=c.findIndex((function(e){return"head"===e.type})),u=c[d],l={type:"head",offset:[u.offset[0]+r,u.offset[1]+a]};if(e.addMask&&e.headGroup&&e.headGroup.imagePatching&&e.headGroup.imagePatching.mask){var p=e.headGroup.imagePatching.mask;c.splice(d,1),d=1,c.splice(0,0,l,{type:"image",images:[{hq:p,lq:p,sourcePack:"dddg.temp1"}],composite:"destination-in",offset:u.offset})}else c.splice(d,1,l);if(e.addExtras&&e.headGroup&&e.headGroup.imagePatching&&e.headGroup.imagePatching.addition){var h=e.headGroup.imagePatching.addition;c.splice(d+1,0,{type:"image",images:[{hq:h,lq:h,sourcePack:"dddg.temp1"}],offset:u.offset})}return Object(k["a"])(Object(k["a"])({},o.poses[t.poseId]),{},{renderCommands:c,id:"dddg.temp1:pose"+i,compatibleHeads:["dddg.temp1:default"]})}))}]}],label:"",chibi:null}}}});n("9e5a6");Q.render=v,Q.__scopeId="data-v-09ef01a3";t["default"]=Q}}]);
//# sourceMappingURL=chunk-c0775ae4.eace4928.js.map