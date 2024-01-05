import{I as Le,d as Pe,c as x,o as f,a as b,b as d,t as q,q as Ce,s as Z,_ as K,J as Ve,u as ze,r as _,w as ue,m as j,h as z,F as M,e as Y,j as T,l as ce,f as E,g as pe,K as Ee,k as he,L as ve,n as qe,B as J,M as Ae,C as fe,N as Me,p as me,O as Q,P as ge,Q as Be,v as Fe,x as We,y as He,S as Xe,U as Ye,i as Je,W as Qe,X as Ze,Y as Ke}from"./index.2aedd05f.js";var et=Object.defineProperty,tt=(l,a,i)=>a in l?et(l,a,{enumerable:!0,configurable:!0,writable:!0,value:i}):l[a]=i,I=(l,a,i)=>(tt(l,typeof a!="symbol"?a+"":a,i),i),ye=(l,a,i)=>new Promise((v,u)=>{var m=n=>{try{P(i.next(n))}catch(p){u(p)}},k=n=>{try{P(i.throw(n))}catch(p){u(p)}},P=n=>n.done?v(n.value):Promise.resolve(n.value).then(m,k);P((i=i.apply(l,a)).next())});class st{constructor(a,i,v=4){this.runner=a,this.disposer=i,this.parallel=v,I(this,"state",Le({busy:!1,error:null,completed:0,fullCount:0})),I(this,"pendingData",[]),I(this,"currentlyRunning",new Set),I(this,"resolveCurrentRun",null),I(this,"rejectCurrentRun",null),I(this,"returnData",[]),I(this,"remainingDisposers",new Set),I(this,"runningDisposers",new Set)}run(a){return this.rejectCurrentRun&&this.reject(),a=a.slice(),this.pendingData=a,this.returnData=[],this.state.fullCount=a.length,this.state.error=null,this.state.busy=!0,this.state.completed=0,new Promise((i,v)=>{this.resolveCurrentRun=i,this.rejectCurrentRun=v,a.length>0?this.restock():this.resolve()})}get remainingCapacity(){return this.parallel-this.currentlyRunning.size-this.runningDisposers.size}restock(){for(;this.remainingCapacity>0&&this.pendingData.length>0;)this.startOne();for(;this.remainingCapacity>0&&this.remainingDisposers.size>0;)this.startDisposer()}startOne(){return ye(this,null,function*(){const a=this.pendingData.shift(),i=this.returnData.length;if(this.returnData[i]=void 0,a==null)return;this.currentlyRunning.add(a);const v=()=>this.currentlyRunning.has(a);let u;try{u=yield this.runner(a,v)}catch(m){this.reject(m)}v()?(++this.state.completed,this.returnData[i]=u,this.currentlyRunning.delete(a),this.currentlyRunning.size===0&&this.pendingData.length===0&&this.resolve()):u!==void 0&&this.remainingDisposers.add(u),this.restock()})}startDisposer(){return ye(this,null,function*(){const a=this.remainingDisposers.values().next().value;this.remainingDisposers.delete(a),this.runningDisposers.add(a);try{yield this.disposer(a)}catch(i){}this.runningDisposers.delete(a),this.restock()})}resolve(){this.state.busy=!1,this.state.completed=this.state.fullCount;const a=this.returnData,i=this.resolveCurrentRun;this.reset(),i(a)}reject(a){var i;this.state.busy=!1,this.state.error=(i=a==null?void 0:a.message)!=null?i:null;const v=this.returnData,u=this.rejectCurrentRun;this.reset();for(const m of v)m!==void 0&&this.remainingDisposers.add(m);u()}reset(){this.returnData=[],this.currentlyRunning=new Set,this.resolveCurrentRun=null,this.rejectCurrentRun=null}get busy(){return this.state.busy}get fullCount(){return this.state.fullCount}get completed(){return this.state.completed}get percentage(){return this.fullCount===0?0:this.completed/this.fullCount}get error(){return this.state.error}}const at={class:"icon material-icons"},nt={class:"label"},it=Pe({__name:"selection",props:{icon:String,label:String,images:{default:[]}},setup(l){const a=l,i=x(()=>a.images.map(v=>`center / contain no-repeat url('${v}')`).join(","));return(v,u)=>(f(),b("div",{class:"selection",style:Ce({background:i.value}),onClick:u[0]||(u[0]=Z(m=>v.$emit("selected"),["stop"]))},[d("div",at,q(l.icon),1),d("div",nt,q(l.label),1)],4))}});const lt=K(it,[["__scopeId","data-v-d99641c1"]]);const rt={},ot={class:"selector"};function dt(l,a){return f(),b("div",ot,[Ve(l.$slots,"default",{},void 0,!0)])}const ut=K(rt,[["render",dt],["__scopeId","data-v-b9600c26"]]);var ct=Object.defineProperty,pt=Object.defineProperties,ht=Object.getOwnPropertyDescriptors,_e=Object.getOwnPropertySymbols,vt=Object.prototype.hasOwnProperty,ft=Object.prototype.propertyIsEnumerable,be=(l,a,i)=>a in l?ct(l,a,{enumerable:!0,configurable:!0,writable:!0,value:i}):l[a]=i,ke=(l,a)=>{for(var i in a||(a={}))vt.call(a,i)&&be(l,i,a[i]);if(_e)for(var i of _e(a))ft.call(a,i)&&be(l,i,a[i]);return l},we=(l,a)=>pt(l,ht(a)),C=(l,a,i)=>new Promise((v,u)=>{var m=n=>{try{P(i.next(n))}catch(p){u(p)}},k=n=>{try{P(i.throw(n))}catch(p){u(p)}},P=n=>n.done?v(n.value):Promise.resolve(n.value).then(m,k);P((i=i.apply(l,a)).next())});const ee=l=>(We("data-v-cce15f0b"),l=l(),He(),l),mt=ee(()=>d("h1",null,"Add expressions",-1)),gt={key:0,class:"page"},yt={class:"expression_list_wrapper"},_t=["onClick"],bt={class:"options_wrapper"},kt={class:"image"},wt=["width","height"],Pt=["value"],Ct=ee(()=>d("th",null,"X:",-1)),xt=ee(()=>d("th",null,"Y:",-1)),Dt={key:0},It=["disabled"],Rt={key:1},y="https://github.com/edave64/Doki-Doki-Dialog-Generator/tree/master/public/assets/",St=Pe({__name:"index",props:{character:{type:String,required:!0},initHeadGroup:String},emits:["leave"],setup(l,{emit:a}){const i={packId:"dddg.uploads.expressions",dependencies:[],packCredits:[],characters:[],fonts:[],sprites:[],poemStyles:[],poemBackgrounds:[],backgrounds:[],colors:[]},v={},u=l,m=ze(),k=_(null),P=a,n=_(null),p=_([]),w=_(null),D=_(0),R=_(0),S=_(0),N=_(!1),L=_(!1),A=_({}),V=x(()=>m.state.content.current.characters.find(t=>t.id===u.character)),G=x(()=>Object.keys(V.value.heads).map(e=>{const s=V.value.heads[e];return{name:e,preview:s.variants[0].map(r=>Xe(r,!1)),partsFiles:v[e]||[],imagePatching:{mask:je[e],addition:Te[e]}}}));function te(){G.value.length===1&&(n.value=G.value[0])}function se(){P("leave"),n.value=null,p.value=[]}function xe(){if(w.value==null)return;const t=w.value;w.value=null,t.startsWith("blob:")&&URL.revokeObjectURL(t);let e=p.value.indexOf(t);p.value.splice(e,1),e>p.value.length-1&&(e=p.value.length-1),w.value=p.value[e]||null}function B(t){const e=t.split(":");let s=e[e.length-1];const r=e.length>1?e[0].trim():"";return s=(s[0].toUpperCase()+s.slice(1).toLowerCase()).split("_").join(" "),r.startsWith("dddg.")||r===""?s:r+": "+s}const ae=x(()=>{const t=V.value;return n.value?t.heads[n.value.name].variants[0][0].hq:null}),ne=x(()=>{var t,e;if(!n.value)return null;const s=V.value.id,r=n.value.name;return(e=(t=re[s+":"+r])!=null?t:re[s])!=null?e:null}),F=_(null);function De(t){!n.value||!t.dataTransfer||(t.dataTransfer.effectAllowed="none",Array.from(t.dataTransfer.items).find(e=>e.type.match(/^image.*$/))&&(t.dataTransfer.effectAllowed="link",F.value.show()))}function Ie(){return C(this,null,function*(){let t=Ne.value,e;const s=O.value[D.value];try{e=new Ye(t,yield Se.value)}catch(r){return}Je(()=>C(this,null,function*(){if(W.value)return;const r=new ge(s.width,s.height);try{yield r.render(h=>C(this,null,function*(){Qe.prototype.prepareData.call(e,{background:c,composite:"source-over",filters:[],id:0,lastObjId:0,lastRender:"",objects:{[t.id]:t},onTopOrder:[],order:[t.id]},m),e.prepareTransform(new DOMMatrixReadOnly);const c={color:"",composite:"source-over",current:"",filters:[],flipped:!1,scaling:Ze.None,variant:0};yield e.prepareRender(!h.hq),yield e.render(h.fsCtx,Ke.None,h.preview,h.hq,!1)}));const g=k.value.getContext("2d");g.clearRect(0,0,k.value.width,k.value.height),r.paintOnto(g,{x:0,y:0,w:k.value.width,h:k.value.height})}finally{e.dispose(),r.dispose()}}))})}const O=x(()=>{const t=V.value;if(!n.value)return[];const e=[];for(let s=0;s<t.styleGroups.length;++s){const r=t.styleGroups[s];for(let g=0;g<r.styles.length;++g){const h=r.styles[g];for(let c=0;c<h.poses.length;++c){const o=h.poses[c];o.compatibleHeads.includes(n.value.name)&&e.push({name:o.id,styleGroupId:s,styleId:g,poseId:c,width:o.size[0],height:o.size[1]})}}}return e}),Re=x(()=>p.value.map(t=>[{hq:t,lq:t,sourcePack:"dddg.temp1:default"}])),Se=x(()=>{const t=O.value,e=m.state.content.current.characters.find(s=>s.id===u.character);return{id:e.id,size:[960,960],defaultScale:[.8,.8],hd:!1,heads:{"dddg.temp1:default":{variants:Re.value,previewSize:[0,0],previewOffset:[0,0]}},styleGroups:[{id:"preview",styleComponents:[],styles:[{components:{},poses:t.map((s,r)=>{const h=e.styleGroups[s.styleGroupId].styles[s.styleId],c=h.poses[s.poseId].renderCommands.slice(0);let o=c.findIndex(U=>U.type==="head");const $=c[o],de={type:"head",offset:[$.offset[0]+R.value,$.offset[1]+S.value]};if(N.value&&n.value&&n.value.imagePatching&&n.value.imagePatching.mask!=null){const U=n.value.imagePatching.mask;c.splice(o,1),o=1,c.splice(0,0,de,{type:"image",images:[{hq:U,lq:U,sourcePack:"dddg.temp1"}],composite:"destination-in",offset:$.offset})}else c.splice(o,1,de);if(L.value&&n.value&&n.value.imagePatching&&n.value.imagePatching.addition!=null){const U=n.value.imagePatching.addition;c.splice(o+1,0,{type:"image",images:[{hq:U,lq:U,sourcePack:"dddg.temp1"}],offset:$.offset})}return we(ke({},h.poses[s.poseId]),{renderCommands:c,id:"dddg.temp1:pose"+r,compatibleHeads:["dddg.temp1:default"]})})}]}],label:"",chibi:null}}),W=_(!1),H=_(null);H.value=new st(Oe,()=>C(this,null,function*(){}));function Oe(t,e){return C(this,null,function*(){const s=yield Q(t);if(!e())return;const g=yield new ge(s.width+R.value,s.height+S.value).renderToBlob(c=>C(this,null,function*(){if(c.drawImage({image:s,x:R.value,y:S.value,w:s.width,h:s.height}),N.value&&n.value&&n.value.imagePatching&&n.value.imagePatching.mask!=null){const o=yield Q(n.value.imagePatching.mask);if(!e())return;c.drawImage({image:o,x:0,y:0,w:o.width,h:o.height,composite:"destination-in"})}if(L.value&&n.value&&n.value.imagePatching&&n.value.imagePatching.addition!=null){const o=yield Q(n.value.imagePatching.addition);if(!e())return;c.drawImage({image:o,x:0,y:0,w:o.width,h:o.height})}})),h=URL.createObjectURL(g);return A.value[h]=A.value[t],t!==h&&t.startsWith("blob:")&&URL.revokeObjectURL(t),h})}function $e(){return C(this,null,function*(){W.value=!0;const t=(yield H.value.run(p.value)).filter(o=>o),e=m.state.content.current.characters.find(o=>o.id===u.character),s=m.state.content.contentPacks.find(o=>o.packId===i.packId)||i,r=JSON.parse(JSON.stringify(s));let g=r.characters.find(o=>o.id===u.character);g||(g={id:u.character,heads:{},styleGroups:[],label:"",chibi:null,size:[960,960],defaultScale:[.8,.8],hd:!1},r.characters.push(g));let h=g.heads[n.value.name];const c=e.heads[n.value.name];h||(h={previewSize:c.previewSize,previewOffset:c.previewOffset,variants:[]},g.heads[n.value.name]=h);for(const o of t){const $=yield m.dispatch("uploadUrls/add",{name:"expression_"+(A.value[o]||""),url:o});h.variants.push([{hq:$,lq:$,sourcePack:i.packId}])}yield Be(()=>C(this,null,function*(){yield m.dispatch("content/replaceContentPack",{contentPack:r,processed:!0})})),se()})}const X=_(null);function Ue(){const t=X.value;if(!!t.files)for(const e of t.files)ie(e)}function ie(t){const e=URL.createObjectURL(t);le(t.name,e)}function Ge(){return C(this,null,function*(){const t=yield Fe.prompt("Enter the url of the image.","");if(t==null)return;const e=t.split("/").slice(-1)[0];le(e,t)})}function le(t,e){w.value=e,A.value[e]=t,p.value.push(e)}const je={"dddg.buildin.base.monika:straight":"assets/mask/monika-a-mask.png","dddg.buildin.base.monika:sideways":"assets/mask/monika-b-mask.png","dddg.buildin.base.natsuki:straight":"assets/mask/natsuki-a-mask.png","dddg.buildin.base.natsuki:sideways":"assets/mask/natsuki-b-mask.png","dddg.buildin.base.natsuki:turnedAway":"assets/mask/natsuki-c-mask.png","dddg.buildin.base.sayori:straight":"assets/mask/sayori-a-mask.png","dddg.buildin.base.sayori:sideways":"assets/mask/sayori-b-mask.png","dddg.buildin.base.yuri:straight":"assets/mask/yuri-a-mask.png","dddg.buildin.base.yuri:sideways":"assets/mask/yuri-b-mask.png"},Te={"dddg.buildin.base.natsuki:straight":"assets/mask/natsuki-a-add.png"},re={"dddg.buildin.base.monika:ddlc.monika":`${y}monika`,"dddg.buildin.base.natsuki:ddlc.natsuki":`${y}natsuki`,"dddg.buildin.base.sayori:ddlc.sayori":`${y}sayori`,"dddg.buildin.base.yuri:ddlc.yuri":`${y}yuri`,"dddg.buildin.amy1:ddlc.fan.amy1":`${y}classic_amy`,"dddg.buildin.amy2:ddlc.fan.amy2":`${y}amy`,"dddg.buildin.femc:ddlc.fan.femc":`${y}femc`,"dddg.buildin.femc:ddlc.fan.femc:straight_lh":`${y}femc_lh`,"dddg.buildin.femc:ddlc.fan.femc:straight_hetero":`${y}femc/hetero`,"dddg.buildin.femc:ddlc.fan.femc:straight_hetero_lh":`${y}femc_lh/hetero`,"dddg.buildin.mc_classic:ddlc.fan.mc1":`${y}classic_mc`,"dddg.buildin.mc:ddlc.fan.mc2":`${y}mc`,"dddg.buildin.mc:ddlc.fan.mc2:straight_red":`${y}mc/red`,"dddg.buildin.mc_chad:ddlc.fan.mc_chad":`${y}chad`,"dddg.buildin.mc_chad:ddlc.fan.mc_chad:straight_red":`${y}chad/red`},oe={type:"character",characterType:"",freeMove:!1,close:!1,styleGroupId:0,styleId:0,poseId:0,posePositions:{},panelId:0,id:0,y:0,rotation:0,preserveRatio:!0,ratio:1,opacity:100,version:1,flip:!1,onTop:!1,composite:"source-over",filters:[]},Ne=x(()=>{const t=O.value[D.value];return t==null?oe:we(ke({},oe),{characterType:u.character,width:t.width,height:t.height,poseId:D.value,x:t.width/2,y:t.height/2,posePositions:{headGroup:0,head:p.value.indexOf(w.value)},label:null,textboxColor:null,enlargeWhenTalking:!1,nameboxWidth:null,scaleX:1,scaleY:1,linkedTo:null,skewX:0,skewY:0})});return window.exp=this,u.initHeadGroup!=null&&(n.value=G.value.find(t=>t.name===u.initHeadGroup)),te(),ue(()=>G.value,te),ue(()=>[G.value,D.value,O.value,w.value,R.value,S.value,N.value,L.value],Ie),(t,e)=>(f(),b("div",{class:"wrapper",onDragenter:De,onMouseleave:e[9]||(e[9]=s=>{var r;return(r=F.value)==null?void 0:r.hide()})},[mt,n.value?(f(),b(M,{key:1},[W.value?(f(),b("div",Rt,[d("h2",null," Finishing up images. "+q(Math.round(H.value.percentage*100))+"% ",1)])):(f(),b("div",gt,[d("h2",null,[T(" Upload new '"+q(B(n.value.name))+"' expressions ",1),ae.value?(f(),j(ce,{key:0,to:ae.value},{default:z(()=>[T("(Template)")]),_:1},8,["to"])):E("",!0),ne.value?(f(),j(ce,{key:1,to:ne.value},{default:z(()=>[T("(List)")]),_:1},8,["to"])):E("",!0)]),pe(Ee,{ref_key:"dt",ref:F,class:"drop-target",onDrop:ie},{default:z(()=>[T("Drop here to add as a new expression ")]),_:1},512),d("div",yt,[d("div",{class:"expression_list",onWheelPassive:e[1]||(e[1]=(...s)=>he(ve)&&he(ve)(...s))},[d("button",{onClick:e[0]||(e[0]=s=>X.value.click())},[T(" Upload expression "),d("input",{type:"file",ref_key:"upload",ref:X,multiple:"",onChange:Ue},null,544)]),d("button",{onClick:Ge},"Add expression from URL"),(f(!0),b(M,null,Y(p.value,(s,r)=>(f(),b("div",{key:r,style:Ce({backgroundImage:`url('${s}')`}),class:qe({expression_item:!0,active:w.value===s}),onClick:g=>w.value=s},null,14,_t))),128))],32),d("div",bt,[d("div",kt,[d("canvas",{ref_key:"target",ref:k,width:O.value[D.value].width,height:O.value[D.value].height},null,8,wt)]),d("div",null,[T(" Preview pose: "),J(d("select",{"onUpdate:modelValue":e[2]||(e[2]=s=>D.value=s)},[(f(!0),b(M,null,Y(O.value,(s,r)=>(f(),b("option",{key:r,value:r},q(B(s.name)),9,Pt))),128))],512),[[Ae,D.value]]),pe(Me,{title:"Offset"},{default:z(()=>[d("table",null,[d("tr",null,[Ct,d("td",null,[J(d("input",{type:"number","onUpdate:modelValue":e[3]||(e[3]=s=>R.value=s),onKeydown:e[4]||(e[4]=Z(()=>{},["stop"]))},null,544),[[fe,R.value,void 0,{number:!0}]])]),xt,d("td",null,[J(d("input",{type:"number","onUpdate:modelValue":e[5]||(e[5]=s=>S.value=s),onKeydown:e[6]||(e[6]=Z(()=>{},["stop"]))},null,544),[[fe,S.value,void 0,{number:!0}]])])])]),R.value!==0||S.value!==0?(f(),b("p",Dt," WARNING: Offsets will be lost when saving/loading. ")):E("",!0)]),_:1}),n.value.imagePatching&&n.value.imagePatching.mask?(f(),j(me,{key:0,label:"Reduce to fit DDDG standard",modelValue:N.value,"onUpdate:modelValue":e[7]||(e[7]=s=>N.value=s)},null,8,["modelValue"])):E("",!0),n.value.imagePatching&&n.value.imagePatching.addition?(f(),j(me,{key:1,label:"Add new parts to fit DDDG standard",modelValue:L.value,"onUpdate:modelValue":e[8]||(e[8]=s=>L.value=s)},null,8,["modelValue"])):E("",!0),d("button",{disabled:w.value===null,onClick:xe}," Remove this expression ",8,It),d("button",{onClick:$e},"Finish"),d("button",{onClick:se},"Abort")])])])]))],64)):(f(),j(ut,{key:0,label:"What kind of expression would you like to add?"},{default:z(()=>[(f(!0),b(M,null,Y(G.value,s=>(f(),j(lt,{key:s.name,label:B(s.name),images:s.preview,onSelected:r=>n.value=s},null,8,["label","images","onSelected"]))),128))]),_:1}))],32))}});const $t=K(St,[["__scopeId","data-v-cce15f0b"]]);export{$t as default};
