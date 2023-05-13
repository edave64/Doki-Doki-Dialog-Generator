import{x as A,d as O,_ as x,o as h,c as f,a as l,t as _,q as T,b as S,y as q,z as X,j as Y,D as W,A as J,L as Q,B as Z,k as K,C as U,E as j,G as ee,S as te,m as y,i as b,F as D,l as k,e as w,h as C,r as I,n as se,w as E,H as ie,s as G,v as H,p as ae,g as re}from"./index.c69ab439.js";var ne=Object.defineProperty,de=(e,t,s)=>t in e?ne(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s,g=(e,t,s)=>(de(e,typeof t!="symbol"?t+"":t,s),s),z=(e,t,s)=>new Promise((r,a)=>{var o=d=>{try{n(s.next(d))}catch(p){a(p)}},u=d=>{try{n(s.throw(d))}catch(p){a(p)}},n=d=>d.done?r(d.value):Promise.resolve(d.value).then(o,u);n((s=s.apply(e,t)).next())});class oe{constructor(t,s,r=4){this.runner=t,this.disposer=s,this.parallel=r,g(this,"state",A({busy:!1,error:null,completed:0,fullCount:0})),g(this,"pendingData",[]),g(this,"currentlyRunning",new Set),g(this,"resolveCurrentRun",null),g(this,"rejectCurrentRun",null),g(this,"returnData",[]),g(this,"remainingDisposers",new Set),g(this,"runningDisposers",new Set)}run(t){return this.rejectCurrentRun&&this.reject(),t=t.slice(),this.pendingData=t,this.returnData=[],this.state.fullCount=t.length,this.state.error=null,this.state.busy=!0,this.state.completed=0,new Promise((s,r)=>{this.resolveCurrentRun=s,this.rejectCurrentRun=r,t.length>0?this.restock():this.resolve()})}get remainingCapacity(){return this.parallel-this.currentlyRunning.size-this.runningDisposers.size}restock(){for(;this.remainingCapacity>0&&this.pendingData.length>0;)this.startOne();for(;this.remainingCapacity>0&&this.remainingDisposers.size>0;)this.startDisposer()}startOne(){return z(this,null,function*(){const t=this.pendingData.shift(),s=this.returnData.length;if(this.returnData[s]=void 0,t==null)return;this.currentlyRunning.add(t);const r=()=>this.currentlyRunning.has(t);let a;try{a=yield this.runner(t,r)}catch(o){this.reject(o)}r()?(++this.state.completed,this.returnData[s]=a,this.currentlyRunning.delete(t),this.currentlyRunning.size===0&&this.pendingData.length===0&&this.resolve()):a!==void 0&&this.remainingDisposers.add(a),this.restock()})}startDisposer(){return z(this,null,function*(){const t=this.remainingDisposers.values().next().value;this.remainingDisposers.delete(t),this.runningDisposers.add(t);try{yield this.disposer(t)}catch(s){}this.runningDisposers.delete(t),this.restock()})}resolve(){this.state.busy=!1,this.state.completed=this.state.fullCount;const t=this.returnData,s=this.resolveCurrentRun;this.reset(),s(t)}reject(t){var s;this.state.busy=!1,this.state.error=(s=t==null?void 0:t.message)!=null?s:null;const r=this.returnData,a=this.rejectCurrentRun;this.reset();for(const o of r)o!==void 0&&this.remainingDisposers.add(o);a()}reset(){this.returnData=[],this.currentlyRunning=new Set,this.resolveCurrentRun=null,this.rejectCurrentRun=null}get busy(){return this.state.busy}get fullCount(){return this.state.fullCount}get completed(){return this.state.completed}get percentage(){return this.fullCount===0?0:this.completed/this.fullCount}get error(){return this.state.error}}const le=O({props:{icon:String,label:String,images:{default:[]}},computed:{background(){return this.images.map(e=>`center / contain no-repeat url('${e}')`).join(",")}}});const ue={class:"icon material-icons"},he={class:"label"};function pe(e,t,s,r,a,o){return h(),f("div",{class:"selection",style:T({background:e.background}),onClick:t[0]||(t[0]=S(u=>e.$emit("selected"),["stop"]))},[l("div",ue,_(e.icon),1),l("div",he,_(e.label),1)],4)}const ce=x(le,[["render",pe],["__scopeId","data-v-2af22ee1"]]),fe=O({});const me={class:"selector"};function ge(e,t,s,r,a,o){return h(),f("div",me,[q(e.$slots,"default",{},void 0,!0)])}const ye=x(fe,[["render",ge],["__scopeId","data-v-5cd45a10"]]);var ve=Object.defineProperty,be=Object.defineProperties,ke=Object.getOwnPropertyDescriptors,L=Object.getOwnPropertySymbols,we=Object.prototype.hasOwnProperty,Ge=Object.prototype.propertyIsEnumerable,N=(e,t,s)=>t in e?ve(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s,F=(e,t)=>{for(var s in t||(t={}))we.call(t,s)&&N(e,s,t[s]);if(L)for(var s of L(t))Ge.call(t,s)&&N(e,s,t[s]);return e},M=(e,t)=>be(e,ke(t)),m=(e,t,s)=>new Promise((r,a)=>{var o=d=>{try{n(s.next(d))}catch(p){a(p)}},u=d=>{try{n(s.throw(d))}catch(p){a(p)}},n=d=>d.done?r(d.value):Promise.resolve(d.value).then(o,u);n((s=s.apply(e,t)).next())});const R={packId:"dddg.uploads.expressions",dependencies:[],packCredits:[],characters:[],fonts:[],sprites:[],poemStyles:[],poemBackgrounds:[],backgrounds:[],colors:[]},Pe={"dddg.buildin.base.monika:straight":"assets/mask/monika-a-mask.png","dddg.buildin.base.monika:sideways":"assets/mask/monika-b-mask.png","dddg.buildin.base.natsuki:straight":"assets/mask/natsuki-a-mask.png","dddg.buildin.base.natsuki:sideways":"assets/mask/natsuki-b-mask.png","dddg.buildin.base.natsuki:turnedAway":"assets/mask/natsuki-c-mask.png","dddg.buildin.base.sayori:straight":"assets/mask/sayori-a-mask.png","dddg.buildin.base.sayori:sideways":"assets/mask/sayori-b-mask.png","dddg.buildin.base.yuri:straight":"assets/mask/yuri-a-mask.png","dddg.buildin.base.yuri:sideways":"assets/mask/yuri-b-mask.png"},$e={"dddg.buildin.base.natsuki:straight":"assets/mask/natsuki-a-add.png"},c="https://github.com/edave64/Doki-Doki-Dialog-Generator/tree/master/public/assets/",V={"dddg.buildin.base.monika:ddlc.monika":`${c}monika`,"dddg.buildin.base.natsuki:ddlc.natsuki":`${c}natsuki`,"dddg.buildin.base.sayori:ddlc.sayori":`${c}sayori`,"dddg.buildin.base.yuri:ddlc.yuri":`${c}yuri`,"dddg.buildin.amy1:ddlc.fan.amy1":`${c}classic_amy`,"dddg.buildin.amy2:ddlc.fan.amy2":`${c}amy`,"dddg.buildin.femc:ddlc.fan.femc":`${c}femc`,"dddg.buildin.femc:ddlc.fan.femc:straight_lh":`${c}femc_lh`,"dddg.buildin.femc:ddlc.fan.femc:straight_hetero":`${c}femc/hetero`,"dddg.buildin.femc:ddlc.fan.femc:straight_hetero_lh":`${c}femc_lh/hetero`,"dddg.buildin.mc_classic:ddlc.fan.mc1":`${c}classic_mc`,"dddg.buildin.mc:ddlc.fan.mc2":`${c}mc`,"dddg.buildin.mc:ddlc.fan.mc2:straight_red":`${c}mc/red`,"dddg.buildin.mc_chad:ddlc.fan.mc_chad":`${c}chad`,"dddg.buildin.mc_chad:ddlc.fan.mc_chad:straight_red":`${c}chad/red`},_e={},De={type:"character",characterType:"",freeMove:!1,close:!1,styleGroupId:0,styleId:0,poseId:0,posePositions:{},panelId:0,id:0,y:0,rotation:0,preserveRatio:!0,ratio:1,opacity:100,version:1,flip:!1,onTop:!1,composite:"source-over",filters:[]},Ce=O({mixins:[X],components:{Selection:ce,Selector:ye,ToggleBox:Y,DropTarget:W,DFieldset:J,L:Q},props:{character:{type:String,required:!0},initHeadGroup:String},data:()=>({method:"upload",headGroup:null,uploadsFinished:!1,everythingBroken:!1,uploadedExpressions:[],currentUploadedExpression:null,previewPoseIdx:0,offsetX:0,offsetY:0,addMask:!1,addExtras:!1,batchRunner:null,names:{}}),created(){window.exp=this,this.batchRunner=new oe(this.processExpression.bind(this),()=>m(this,null,function*(){})),this.initHeadGroup!=null&&(this.headGroup=this.availableHeadGroups.find(e=>e.name===this.initHeadGroup)),this.applySingleHeadGroup()},watch:{availableHeadGroups(){this.applySingleHeadGroup()},previewPoseIdx(){this.redraw()},previewPoses(){this.redraw()},currentUploadedExpression(){this.redraw()},offsetX(){this.redraw()},offsetY(){this.redraw()},addMask(){this.redraw()},addExtras(){this.redraw()}},methods:{applySingleHeadGroup(){this.availableHeadGroups.length===1&&(this.headGroup=this.availableHeadGroups[0])},addByUpload(){return m(this,null,function*(){const e=this.$refs.upload;if(!!e.files)for(const t of e.files)this.addByImageFile(t)})},addByImageFile(e){const t=URL.createObjectURL(e);this.addUrl(e.name,t)},addByUrl(){return m(this,null,function*(){const e=yield K.prompt("Enter the url of the image.","");if(e==null)return;const t=e.split("/").slice(-1)[0];this.addUrl(t,e)})},addUrl(e,t){this.currentUploadedExpression=t,this.names[t]=e,this.uploadedExpressions.push(t)},processExpression(e,t){return m(this,null,function*(){const s=yield U(e);if(!t())return;const a=yield new j(s.width+this.offsetX,s.height+this.offsetY).renderToBlob(u=>m(this,null,function*(){if(u.drawImage({image:s,x:this.offsetX,y:this.offsetY,w:s.width,h:s.height}),this.addMask&&this.headGroup&&this.headGroup.imagePatching&&this.headGroup.imagePatching.mask!=null){const n=yield U(this.headGroup.imagePatching.mask);if(!t())return;u.drawImage({image:n,x:0,y:0,w:n.width,h:n.height,composite:"destination-in"})}if(this.addExtras&&this.headGroup&&this.headGroup.imagePatching&&this.headGroup.imagePatching.addition!=null){const n=yield U(this.headGroup.imagePatching.addition);if(!t())return;u.drawImage({image:n,x:0,y:0,w:n.width,h:n.height})}})),o=URL.createObjectURL(a);return this.names[o]=this.names[e],e!==o&&e.startsWith("blob:")&&URL.revokeObjectURL(e),o})},redraw(){return m(this,null,function*(){if(this.uploadsFinished)return;const e=this.previewPoses[this.previewPoseIdx];let t;try{t=new ee(M(F({},De),{width:e.width,height:e.height,poseId:this.previewPoseIdx,x:e.width/2,posePositions:{headGroup:0,head:this.uploadedExpressions.indexOf(this.currentUploadedExpression)},label:null,textboxColor:null,enlargeWhenTalking:!1,nameboxWidth:null,zoom:1}),yield this.temporaryCharacterModel)}catch(s){return}this.$nextTick(()=>m(this,null,function*(){if(this.uploadsFinished)return;const s=new j(e.width,e.height);try{yield s.render(o=>m(this,null,function*(){yield t.render(te.None,o,!1)}));const r=this.$refs.target,a=r.getContext("2d");a.clearRect(0,0,r.width,r.height),s.paintOnto(a,{x:0,y:0,w:r.width,h:r.height})}finally{t.dispose(),s.dispose()}}))})},finishUpload(){return m(this,null,function*(){this.uploadsFinished=!0;const e=(yield this.batchRunner.run(this.uploadedExpressions)).filter(n=>n),t=this.$store.state.content.current.characters.find(n=>n.id===this.character),s=this.$store.state.content.contentPacks.find(n=>n.packId===R.packId)||R,r=JSON.parse(JSON.stringify(s));let a=r.characters.find(n=>n.id===this.character);a||(a={id:this.character,heads:{},styleGroups:[],label:"",chibi:null,size:[960,960],defaultScale:[.8,.8],hd:!1},r.characters.push(a));let o=a.heads[this.headGroup.name];const u=t.heads[this.headGroup.name];o||(o={previewSize:u.previewSize,previewOffset:u.previewOffset,variants:[]},a.heads[this.headGroup.name]=o);for(const n of e){const d=yield this.$store.dispatch("uploadUrls/add",{name:"expression_"+(this.names[n]||""),url:n});o.variants.push([{hq:d,lq:d,sourcePack:R.packId}])}yield this.vuexHistory.transaction(()=>{this.$store.dispatch("content/replaceContentPack",{contentPack:r,processed:!0})}),this.leave()})},leave(){this.$emit("leave"),this.method=null,this.headGroup=null,this.uploadedExpressions=[]},removeUploadedExpression(){if(this.currentUploadedExpression==null)return;const e=this.currentUploadedExpression;this.currentUploadedExpression=null,e.startsWith("blob:")&&URL.revokeObjectURL(e);let t=this.uploadedExpressions.indexOf(e);this.uploadedExpressions.splice(t,1),t>this.uploadedExpressions.length-1&&(t=this.uploadedExpressions.length-1),this.currentUploadedExpression=this.uploadedExpressions[t]||null},normalizeName(e){const t=e.split(":");let s=t[t.length-1];const r=t.length>1?t[0].trim():"";return s=(s[0].toUpperCase()+s.slice(1).toLowerCase()).split("_").join(" "),r.startsWith("dddg.")||r===""?s:r+": "+s},dragEnter(e){!this.headGroup||this.method!=="upload"||!e.dataTransfer||(e.dataTransfer.effectAllowed="none",Array.from(e.dataTransfer.items).find(t=>t.type.match(/^image.*$/))&&(e.dataTransfer.effectAllowed="link",this.$refs.dt.show()))},hideDt(){this.$refs.dt&&this.$refs.dt.hide()}},computed:{characterData(){return this.$store.state.content.current.characters.find(e=>e.id===this.character)},availableHeadGroups(){const e=this.characterData;return Object.keys(e.heads).map(s=>{const r=e.heads[s];return{name:s,preview:r.variants[0].map(a=>Z(a,!1)),partsFiles:_e[s]||[],imagePatching:{mask:Pe[s],addition:$e[s]}}})},hasParts(){return!!this.availableHeadGroups.find(e=>e.partsFiles.length>0)},downloadLink(){const e=this.characterData;return this.headGroup?e.heads[this.headGroup.name].variants[0][0].hq:null},listLink(){var e,t;if(!this.headGroup)return null;const s=this.characterData.id,r=this.headGroup.name;return(t=(e=V[s+":"+r])!=null?e:V[s])!=null?t:null},previewPoses(){const e=this.characterData;if(!this.headGroup)return[];const t=[];for(let s=0;s<e.styleGroups.length;++s){const r=e.styleGroups[s];for(let a=0;a<r.styles.length;++a){const o=r.styles[a];for(let u=0;u<o.poses.length;++u){const n=o.poses[u];n.compatibleHeads.includes(this.headGroup.name)&&t.push({name:n.id,styleGroupId:s,styleId:a,poseId:u,width:n.size[0],height:n.size[1]})}}}return t},expressionModels(){return this.uploadedExpressions.map(e=>[{hq:e,lq:e,sourcePack:"dddg.temp1:default"}])},temporaryCharacterModel(){const e=this.previewPoses,t=this.$store.state.content.current.characters.find(a=>a.id===this.character),s=this.offsetX,r=this.offsetY;return{id:this.character,size:[960,960],defaultScale:[.8,.8],hd:!1,heads:{"dddg.temp1:default":{variants:this.expressionModels,previewSize:[0,0],previewOffset:[0,0]}},styleGroups:[{id:"preview",styleComponents:[],styles:[{components:{},poses:e.map((a,o)=>{const n=t.styleGroups[a.styleGroupId].styles[a.styleId],d=n.poses[a.poseId].renderCommands.slice(0);let p=d.findIndex(i=>i.type==="head");const v=d[p],P={type:"head",offset:[v.offset[0]+s,v.offset[1]+r]};if(this.addMask&&this.headGroup&&this.headGroup.imagePatching&&this.headGroup.imagePatching.mask!=null){const i=this.headGroup.imagePatching.mask;d.splice(p,1),p=1,d.splice(0,0,P,{type:"image",images:[{hq:i,lq:i,sourcePack:"dddg.temp1"}],composite:"destination-in",offset:v.offset})}else d.splice(p,1,P);if(this.addExtras&&this.headGroup&&this.headGroup.imagePatching&&this.headGroup.imagePatching.addition!=null){const i=this.headGroup.imagePatching.addition;d.splice(p+1,0,{type:"image",images:[{hq:i,lq:i,sourcePack:"dddg.temp1"}],offset:v.offset})}return M(F({},n.poses[a.poseId]),{renderCommands:d,id:"dddg.temp1:pose"+o,compatibleHeads:["dddg.temp1:default"]})})}]}],label:"",chibi:null}}}});const B=e=>(ae("data-v-7a67ddd3"),e=e(),re(),e),Ue=B(()=>l("h1",null,"Add expressions",-1)),Ie={key:0,class:"page"},Ee={class:"expression_list_wrapper"},Re=["onClick"],Se={class:"options_wrapper"},Oe={class:"image"},xe=["width","height"],Be=["value"],je=B(()=>l("th",null,"X:",-1)),He=B(()=>l("th",null,"Y:",-1)),ze={key:0},Le=["disabled"],Ne={key:1};function Fe(e,t,s,r,a,o){const u=G("selection"),n=G("selector"),d=G("l"),p=G("drop-target"),v=G("d-fieldset"),P=G("toggle-box");return h(),f("div",{class:"wrapper",onDragenter:t[16]||(t[16]=(...i)=>e.dragEnter&&e.dragEnter(...i)),onMouseleave:t[17]||(t[17]=(...i)=>e.hideDt&&e.hideDt(...i))},[Ue,e.headGroup?e.method?e.method==="upload"?(h(),f(D,{key:2},[e.uploadsFinished?(h(),f("div",Ne,[l("h2",null," Finishing up images. "+_(Math.round(e.batchRunner.percentage*100))+"% ",1)])):(h(),f("div",Ie,[l("h2",null,[k(" Upload new '"+_(e.normalizeName(e.headGroup.name))+"' expressions ",1),e.downloadLink?(h(),y(d,{key:0,to:e.downloadLink},{default:b(()=>[k("(Template)")]),_:1},8,["to"])):w("",!0),e.listLink?(h(),y(d,{key:1,to:e.listLink},{default:b(()=>[k("(List)")]),_:1},8,["to"])):w("",!0)]),C(p,{ref:"dt",class:"drop-target",onDrop:e.addByImageFile},{default:b(()=>[k("Drop here to add as a new expression ")]),_:1},8,["onDrop"]),l("div",Ee,[l("div",{class:"expression_list",onWheelPassive:t[5]||(t[5]=(...i)=>e.verticalScrollRedirect&&e.verticalScrollRedirect(...i))},[l("button",{onClick:t[3]||(t[3]=i=>e.$refs.upload.click())},[k(" Upload expression "),l("input",{type:"file",ref:"upload",multiple:"",onChange:t[2]||(t[2]=(...i)=>e.addByUpload&&e.addByUpload(...i))},null,544)]),l("button",{onClick:t[4]||(t[4]=(...i)=>e.addByUrl&&e.addByUrl(...i))},"Add expression from URL"),(h(!0),f(D,null,I(e.uploadedExpressions,(i,$)=>(h(),f("div",{key:$,style:T({backgroundImage:`url('${i}')`}),class:se({expression_item:!0,active:e.currentUploadedExpression===i}),onClick:Me=>e.currentUploadedExpression=i},null,14,Re))),128))],32),l("div",Se,[l("div",Oe,[l("canvas",{ref:"target",width:e.previewPoses[e.previewPoseIdx].width,height:e.previewPoses[e.previewPoseIdx].height},null,8,xe)]),l("div",null,[k(" Preview pose: "),E(l("select",{"onUpdate:modelValue":t[6]||(t[6]=i=>e.previewPoseIdx=i)},[(h(!0),f(D,null,I(e.previewPoses,(i,$)=>(h(),f("option",{key:$,value:$},_(e.normalizeName(i.name)),9,Be))),128))],512),[[ie,e.previewPoseIdx]]),C(v,{title:"Offset"},{default:b(()=>[l("table",null,[l("tr",null,[je,l("td",null,[E(l("input",{type:"number","onUpdate:modelValue":t[7]||(t[7]=i=>e.offsetX=i),onKeydown:t[8]||(t[8]=S(()=>{},["stop"]))},null,544),[[H,e.offsetX,void 0,{number:!0}]])]),He,l("td",null,[E(l("input",{type:"number","onUpdate:modelValue":t[9]||(t[9]=i=>e.offsetY=i),onKeydown:t[10]||(t[10]=S(()=>{},["stop"]))},null,544),[[H,e.offsetY,void 0,{number:!0}]])])])]),e.offsetX!==0||e.offsetY!==0?(h(),f("p",ze," WARNING: Offsets will be lost when saving/loading. ")):w("",!0)]),_:1}),e.headGroup.imagePatching&&e.headGroup.imagePatching.mask?(h(),y(P,{key:0,label:"Reduce to fit DDDG standard",modelValue:e.addMask,"onUpdate:modelValue":t[11]||(t[11]=i=>e.addMask=i)},null,8,["modelValue"])):w("",!0),e.headGroup.imagePatching&&e.headGroup.imagePatching.addition?(h(),y(P,{key:1,label:"Add new parts to fit DDDG standard",modelValue:e.addExtras,"onUpdate:modelValue":t[12]||(t[12]=i=>e.addExtras=i)},null,8,["modelValue"])):w("",!0),l("button",{disabled:e.currentUploadedExpression===null,onClick:t[13]||(t[13]=(...i)=>e.removeUploadedExpression&&e.removeUploadedExpression(...i))}," Remove this expression ",8,Le),l("button",{onClick:t[14]||(t[14]=(...i)=>e.finishUpload&&e.finishUpload(...i))},"Finish"),l("button",{onClick:t[15]||(t[15]=(...i)=>e.leave&&e.leave(...i))},"Abort")])])])]))],64)):w("",!0):(h(),y(n,{key:1,label:"How would you like to add the new expressions?"},{default:b(()=>[C(u,{label:"Build expressions from parts",icon:"info",disabled:e.hasParts,onSelected:t[0]||(t[0]=i=>e.method="parts")},null,8,["disabled"]),C(u,{label:"Upload expression images",icon:"info",onSelected:t[1]||(t[1]=i=>e.method="upload")})]),_:1})):(h(),y(n,{key:0,label:"What kind of expression would you like to add?"},{default:b(()=>[(h(!0),f(D,null,I(e.availableHeadGroups,i=>(h(),y(u,{key:i.name,label:e.normalizeName(i.name),images:i.preview,onSelected:$=>e.headGroup=i},null,8,["label","images","onSelected"]))),128))]),_:1}))],32)}const Te=x(Ce,[["render",Fe],["__scopeId","data-v-7a67ddd3"]]);export{Te as default};
