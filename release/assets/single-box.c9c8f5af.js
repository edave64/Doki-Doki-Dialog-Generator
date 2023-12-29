import{d as G,r as k,c as D,w as ie,o as m,a as g,b as p,F as U,e as j,t as T,f as P,g as z,h as F,n as Y,T as he,i as B,_ as R,u as ve,j as M,k as Z,l as ee,m as J,p as me,q as ge,s as q,v as A,x as de,y as ce,z as ue,A as ye,B as _e,C as ke,D as be,E as we,G as Ce,R as te,H as xe,V as Pe}from"./index.fb312224.js";const De=["author","character","type","pack","engine"],X=new Map;for(const r of De)for(let e=1;e<=r.length;++e){const t=r.slice(0,e);X.set(t,r)}const Te=/\s/;function Le(r){const e=[];let t="",o="",a=!1,u=!1;function c(){e.push({type:o||"all",payload:t.toLowerCase()}),t="",o="",u=!1,a=!1}for(const i of r){if(u){t+=i,u=!1;continue}switch(i){case"\\":u=!0;continue;case":":const d=t.toLowerCase();if(!a&&o===""&&X.has(d)){o=X.get(d),t="";continue}break;case'"':a?c():a=!0;continue}!a&&Te.test(i)?t&&c():t+=i}return t&&c(),e}const ae=new Map([["engine",0],["pack",1],["type",2],["character",2],["author",2],["all",3]]);function Ae(r){return Se($e(r))}function Se(r){return r.sort((e,t)=>ae.get(e.type)-ae.get(t.type)||t.payload.length-e.payload.length)}function $e(r){const e=new Map;for(const o of r){let a=e.get(o.type);a||(a=[],e.set(o.type,a)),a.push(o)}for(const o of e.keys()){const u=e.get(o).sort((c,i)=>c.payload.localeCompare(i.payload)).filter((c,i,d)=>d[i+1]?!d[i+1].payload.startsWith(c.payload):!0);e.set(o,u.filter((c,i,d)=>!d.find((f,w)=>w!==i&&f.payload.indexOf(c.payload)!==-1)))}const t=Array.from(e.keys()).filter(o=>o!=="all");return e.set("all",(e.get("all")||[]).filter(o=>!t.find(a=>e.get(a).find(u=>u.payload.indexOf(o.payload)!==-1)))),[...e.values()].flatMap(o=>o)}class O{constructor(e){e=e.replace(/[\s-]/g,"").toLowerCase();const t=new Set;for(const[o,a]of O.engines)o.toLowerCase().indexOf(e)>=0&&t.add(a);this.matchingProps=Array.from(t)}get isImpossible(){return this.matchingProps.length===0}match(e){for(const t of this.matchingProps)if(e[t])return!0;return!1}}O.engines=[["Doki Doki Dialog Generator 1","dddg1Path"],["Doki Doki Dialouge Generator 1","dddg1Path"],["DDDG1","dddg1Path"],["Doki Doki Dialog Generator 2","dddg2Path"],["Doki Doki Dialouge Generator 2","dddg2Path"],["DDDG2","dddg2Path"],["Doki Doki Comic Club 2","ddcc2Path"],["DDCC2","ddcc2Path"]].map(([r,e])=>[r.replace(/\s/g,"").toLowerCase(),e]);class pe{constructor(e,t){e=e.toLowerCase();const o=new Set;for(const a in t){if(!Object.prototype.hasOwnProperty.call(t,a))continue;const u=t[a],c=Object.keys(u);(a.toLowerCase().indexOf(e)>=0||c.find(i=>u[i].toLowerCase().indexOf(e)>=0))&&o.add(a)}this.matchingAuthors=o}get isImpossible(){return this.matchingAuthors.size===0}match(e){return!!e.authors.find(t=>this.matchingAuthors.has(t))}}class N{constructor(e,t,o){e=e.toLowerCase(),this.matchingCharacters=new Set(N.getUniqueCharacters(o).filter(a=>a.toLowerCase().indexOf(e)>=0))}get isImpossible(){return this.matchingCharacters.size===0}match(e){return!!e.characters.find(t=>this.matchingCharacters.has(t))}static getUniqueCharacters(e){let t=this.uniqueCharacters.get(e);return t||(t=Array.from(new Set(e.flatMap(o=>o.characters))),this.uniqueCharacters.set(e,t)),t}}N.uniqueCharacters=new Map;class V{constructor(e){e=e.toLowerCase(),this.matchingTypes=new Set(V.types.filter(t=>t.toLowerCase().indexOf(e)>=0))}get isImpossible(){return this.matchingTypes.size===0}match(e){return!!e.kind.find(t=>this.matchingTypes.has(t))}}V.types=["Styles","Characters","Expressions","Poses","Backgrounds","Sprites","Misc"];class S{constructor(e,t,o){e=e.toLowerCase(),this.payload=e;const a=S.getTriplets(o);for(let u=0,c=e.length-2;u<c;++u)if(!a.has(e.substr(u,3))){this.isImpossible=!0;return}this.isImpossible=!1}match(e){if(this.isImpossible)return!1;const t=this.payload;return!!(e.id.toLowerCase().indexOf(t)>=0||e.name.toLowerCase().indexOf(t)>=0||e.searchWords.find(o=>o.toLowerCase().indexOf(t)>=0))}static getTriplets(e){let t=this.tripletCache.get(e);if(!t){t=new Set;for(const o of e){S.splitTriplets(o.id,t),S.splitTriplets(o.name,t);for(const a of o.searchWords)S.splitTriplets(a,t)}this.tripletCache.set(e,t)}return t}static splitTriplets(e,t){e=e.toLowerCase();for(let o=0,a=e.length-2;o<a;++o)t.add(e.substr(o,3))}}S.tripletCache=new Map;class K{constructor(e,t,o){this.matchers=K.allMatchers.map(a=>new a(e,t,o)).filter(a=>!a.isImpossible)}get isImpossible(){return this.matchers.length===0}match(e){return!!this.matchers.find(t=>t.match(e))}}K.allMatchers=[O,pe,N,V,S];const Ie=new Map([["all",K],["author",pe],["character",N],["engine",O],["pack",S],["type",V]]);function Me(r,e,t){return r.map(o=>new(Ie.get(o.type))(o.payload,e,t))}function Ee(r,e,t){const o=Le(r),a=Ae(o),u=Me(a,e,t);return u.find(c=>c.isImpossible)?[]:t.filter(c=>u.every(i=>i.match(c)))}const Be=["tabindex","onClick","onKeydown"],Oe={key:0},Ne=["onMousedown","onClick"],oe=10,Ve=G({__name:"list",props:{search:{type:String,required:!0},repo:{type:Object},disabled:{type:Boolean,default:!1}},emits:["selected","select-search-bar"],setup(r,{emit:e}){const t=r,o=e,a=k(null),u=k(null),c=k(null),i=k(""),d=k(!1),f=k(""),w=D(()=>t.repo?t.repo.getPacks():[]),h=D(()=>{const s=b(w.value,t.search);if(i.value&&s.length>0){const n=i.value;let l;if(typeof s[0][n]=="string"?l=(_,C)=>_.name.localeCompare(C.name):s[0][n]instanceof Array&&(l=(_,C)=>_[n].join(", ").localeCompare(C[n].join(", "))),l){if(d.value){const _=l;l=(C,H)=>_(H,C)}s.sort(l)}}return s});function $(){u.value.$el.focus()}function I(s){const n=h.value.findIndex(l=>l.id===f.value);switch(s.key){case"Enter":o("selected",{id:f.value,source:"keyboard"}),s.stopPropagation(),s.preventDefault();break;case"ArrowUp":s.preventDefault(),s.stopPropagation(),n===0?o("select-search-bar"):f.value=h.value[n-1].id;break;case"ArrowDown":s.preventDefault(),s.stopPropagation(),n<h.value.length-1&&(f.value=h.value[n+1].id);break;case"PageUp":{s.preventDefault(),s.stopPropagation();let l=n-oe;l<0&&(l=0),f.value=h.value[l].id;break}case"PageDown":{s.preventDefault(),s.stopPropagation();let l=n+oe;const _=h.value.length-1;l>_&&(l=_),f.value=h.value[l].id;break}}}function x(s,n){switch(s.key){case"Enter":case" ":y(n),s.preventDefault(),s.stopPropagation();break;case"ArrowDown":$(),s.stopPropagation(),s.preventDefault();break;case"ArrowUp":o("select-search-bar"),s.stopPropagation(),s.preventDefault();break}}function L(){if(h.value.length===0){f.value="";return}f.value===""&&(f.value=h.value[0].id),B(()=>{const s=document.querySelector(".list tbody .focused"),n=a.value.offsetHeight-c.value.offsetHeight,l=a.value.scrollTop,_=l+n;if(s){const C=s.offsetTop-c.value.offsetHeight,H=C+s.offsetHeight;H>_?a.value.scrollTop=H-n:C<l&&(a.value.scrollTop=C)}})}function y(s){i.value===s?d.value?(i.value="",d.value=!1):d.value=!0:(i.value=s,d.value=!1)}function b(s,n){return n?Ee(n,t.repo?t.repo.getAuthors():{},s):[...s]}function v(s){return s.loaded?"Active":s.installed?"Installed":""}return ie(()=>f.value,L),(s,n)=>(m(),g("div",{ref_key:"root",ref:a,class:"list"},[p("table",null,[p("thead",null,[p("tr",{ref_key:"header",ref:c},[(m(),g(U,null,j([["name","Pack"],["characters","Character"],["kind","Type"],["authors","Authors"],["state","Status"]],(l,_)=>p("th",{key:_,tabindex:r.disabled?-1:0,onClick:C=>y(l[0]),onKeydown:C=>x(C,l[0])},[p("div",null,[p("div",null,T(l[1]),1),i.value===l[0]?(m(),g("div",Oe,T(d.value?"\u25BC":"\u25B2"),1)):P("",!0)])],40,Be)),64))],512)]),z(he,{name:"tbody-group",tag:"tbody",ref_key:"tbody",ref:u,tabindex:r.disabled?-1:0,onKeydown:I,onFocus:L},{default:F(()=>[(m(!0),g(U,null,j(h.value,l=>(m(),g("tr",{key:l.id,class:Y({"tbody-group-item":!0,focused:f.value===l.id}),onMousedown:_=>f.value=l.id,onClick:_=>o("selected",{id:l.id,source:"pointer"})},[p("td",null,T(l.name),1),p("td",null,T(l.characters.join(", ")),1),p("td",null,T(l.kind.join(", ")),1),p("td",null,T(l.authors.join(", ")),1),p("td",null,T(v(l)),1)],42,Ne))),128))]),_:1},8,["tabindex"])])],512))}});const He=R(Ve,[["__scopeId","data-v-69bf1510"]]),qe=["h3","h4","h5","h6","blockquote","p","a","ul","ol","nl","li","b","i","strong","em","strike","code","hr","br","div","table","thead","caption","tbody","tr","th","td","pre"],Ue={a:["href"],img:["src"]},je=["href","src"],ze=["http","https"],Ge={a:{target:"_blank",rel:"noopener noreferrer"}};function se(r){const e=document.createElement("div"),t=document.createElement("div");t.innerHTML=r;for(const o of Array.from(t.childNodes))for(const a of Q(o))e.appendChild(a);return e.innerHTML}const Re=/^(\w+):/;function Q(r){if(r.nodeType!==Node.ELEMENT_NODE)return[r];const e=r,t=e.tagName.toLowerCase();if(qe.includes(t)){const o=document.createElement(t),a=Array.prototype.slice.call(e.attributes),u=Ue[t]||[];for(const d of a)if(!!u.includes(d.name)){if(je.includes(d.name)){const f=d.value.match(Re);if(f&&!ze.includes(f[1]))continue}o.setAttribute(d.name,e.getAttribute(d.name))}const c=Ge[t];if(c)for(const d in c)!Object.prototype.hasOwnProperty.call(c,d)||o.setAttribute(d,c[d]);const i=Array.prototype.slice.call(e.childNodes);for(const d of i){const f=Q(d);for(const w of f)o.appendChild(w)}return[o]}else{let o=[];o.push(document.createTextNode(`<${t}>`));for(const a of e.childNodes)o=o.concat(Q(a));return o.push(document.createTextNode(`</${t}>`)),o}}var Ke=Object.defineProperty,ne=Object.getOwnPropertySymbols,We=Object.prototype.hasOwnProperty,Fe=Object.prototype.propertyIsEnumerable,re=(r,e,t)=>e in r?Ke(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t,Je=(r,e)=>{for(var t in e||(e={}))We.call(e,t)&&re(r,t,e[t]);if(ne)for(var t of ne(e))Fe.call(e,t)&&re(r,t,e[t]);return r},W=(r,e,t)=>new Promise((o,a)=>{var u=d=>{try{i(t.next(d))}catch(f){a(f)}},c=d=>{try{i(t.throw(d))}catch(f){a(f)}},i=d=>d.done?o(d.value):Promise.resolve(d.value).then(u,c);i((t=t.apply(r,e)).next())});const E=r=>(de("data-v-5c5c818a"),r=r(),ce(),r),Xe=E(()=>p("i",{class:"material-icons"},"arrow_back",-1)),Qe=[Xe],Ye=["innerHTML"],Ze={key:1},et=E(()=>p("i",{class:"material-icons"},"add",-1)),tt=E(()=>p("i",{class:"material-icons"},"remove",-1)),at=E(()=>p("i",{class:"material-icons"},"add",-1)),ot=E(()=>p("i",{class:"material-icons"},"remove",-1)),st=E(()=>p("h3",null,"Authors",-1)),nt=["title","src"],rt={key:2},lt=E(()=>p("h3",null,"Credits",-1)),it=["innerHTML"],dt=G({__name:"pack-display",props:{selected:{type:String,required:!0},repo:{type:Object,require:!0},showBack:{type:Boolean,require:!1}},setup(r){const e=[["reddit","https://reddit.com/u/%1","reddit.png"],["deviantart","https://www.deviantart.com/%1","deviantart.png"],["twitter","https://twitter.com/%1","twitter.svg"],["pixiv","https://www.pixiv.net/users/%1","pixiv.ico"],["patreon","https://www.patreon.com/%1","patreon.png"],["facebook","https://www.facebook.com/%1","facebook.png"],["github","https://github.com/%1","github.png"],["website","%1","website.svg"]],t=ve(),o=r,a=D(()=>o.repo.getPack(o.selected)),u=D(()=>a.value.preview.map(v=>`url('${v}')`).join(",")),c=D(()=>a.value.loaded),i=D(()=>!a.value.loaded),d=D(()=>A.supports.autoLoading),f=D(()=>A.supports.localRepo?!a.value.installed:!1),w=D(()=>A.supports.localRepo?a.value.installed:!1),h=D({get(){return A.state.autoAdd.includes(o.selected)},set(v){let s=o.selected;const n=a.value;n.repoUrl!=null&&(s+=`;${n.repoUrl}`),v?A.autoLoadAdd(s):A.autoLoadRemove(s)}});function $(v){const s=o.repo.getAuthor(v);return s&&s.currentName!=null?s.currentName:v}function I(v){const s=o.repo.getAuthor(v);return s?e.filter(n=>s[n[0]]).map(n=>{const l=s[n[0]];return{target:n[1].replace("%1",l),platform:n[0][0].toUpperCase()+n[0].slice(1),icon:"icons/"+n[2]}}):[]}function x(){if(a.value.installed)return;const v={};for(const n of a.value.authors)v[n]=Je({},o.repo.getAuthor(n));const s=JSON.parse(JSON.stringify(a.value));delete s.autoloading,delete s.online,delete s.loaded,delete s.installed,A.localRepoInstall(a.value.dddg2Path||a.value.dddg1Path,s,v)}function L(){return W(this,null,function*(){var v;const s=a.value;!s.installed||(s.repoUrl&&!((v=o.repo)!=null&&v.hasPack(s.id,!0))&&(yield o.repo.loadTempPack(s.repoUrl)),A.localRepoUninstall(s.id))})}function y(){return W(this,null,function*(){yield t.dispatch("removePacks",{packs:new Set([a.value.id])})})}function b(){return W(this,null,function*(){yield t.dispatch("content/loadContentPacks",a.value.dddg2Path||a.value.dddg1Path)})}return(v,s)=>(m(),g("div",{class:"pack-display",style:ge({backgroundImage:u.value}),onClick:s[2]||(s[2]=q(()=>{},["stop"]))},[p("header",null,[p("h1",null,[r.showBack?(m(),g("button",{key:0,class:"exit-button",onClick:s[0]||(s[0]=n=>v.$emit("leave",!0))},Qe)):P("",!0),M(" "+T(a.value.name),1)]),p("h2",null,T(a.value.id),1)]),a.value.disclaimer?(m(),g("section",{key:0,class:"disclaimer",innerHTML:Z(se)(a.value.disclaimer)},null,8,Ye)):P("",!0),a.value.source?(m(),g("section",Ze,[z(ee,{to:a.value.source},{default:F(()=>[M("Source")]),_:1},8,["to"])])):P("",!0),p("section",null,[i.value?(m(),g("button",{key:0,onClick:b},[et,M(" Activate ")])):P("",!0),c.value?(m(),g("button",{key:1,onClick:y},[tt,M(" Deactivate ")])):P("",!0),f.value?(m(),g("button",{key:2,onClick:x},[at,M(" Store locally ")])):P("",!0),w.value?(m(),g("button",{key:3,onClick:L},[ot,M(" Remove locally ")])):P("",!0),d.value?(m(),J(me,{key:4,label:"Load on startup",modelValue:h.value,"onUpdate:modelValue":s[1]||(s[1]=n=>h.value=n)},null,8,["modelValue"])):P("",!0)]),p("section",null,[st,p("table",null,[p("tbody",null,[(m(!0),g(U,null,j(a.value.authors,n=>(m(),g("tr",{key:n},[p("td",null,T($(n)),1),p("td",null,[(m(!0),g(U,null,j(I(n),l=>(m(),J(ee,{key:l.target,to:l.target,class:"platform_button"},{default:F(()=>[p("img",{title:l.platform,src:l.icon,height:"32",width:"32",alt:""},null,8,nt)]),_:2},1032,["to"]))),128))])]))),128))])])]),a.value.description?(m(),g("section",rt,[lt,p("p",{innerHTML:Z(se)(a.value.description)},null,8,it)])):P("",!0)],4))}});const ct=R(dt,[["__scopeId","data-v-5c5c818a"]]),fe=r=>(de("data-v-dd58135a"),r=r(),ce(),r),ut={class:"search-area"},pt={class:"search-bar"},ft=["disabled"],ht=["disabled"],vt=fe(()=>p("i",{class:"material-icons"},"info",-1)),mt=[vt],gt=fe(()=>p("i",{class:"material-icons"},"clear",-1)),yt=[gt],_t=be("<p data-v-dd58135a>Enter the text you want to search for. E.g. <code data-v-dd58135a>Monika</code></p><p data-v-dd58135a> If multiple words are given, each word must be found. E.g. <code data-v-dd58135a>Monika Pose</code></p><p data-v-dd58135a> To search phrases with spaces, surround them with double quotes. E.g. <code data-v-dd58135a>&quot;Monika R63&quot; Pose</code></p><p data-v-dd58135a> To limit your search to specific attributes of a pack, you can use the following prefixes: </p><table data-v-dd58135a><tr data-v-dd58135a><th data-v-dd58135a>Prefix</th><th data-v-dd58135a>Description</th><th data-v-dd58135a>Example</th></tr><tr data-v-dd58135a><td data-v-dd58135a>Character:</td><td data-v-dd58135a></td><td data-v-dd58135a><code data-v-dd58135a>Character: Monika</code></td></tr><tr data-v-dd58135a><td data-v-dd58135a>Artist:</td><td data-v-dd58135a></td><td data-v-dd58135a><code data-v-dd58135a>Artist: edave64</code></td></tr><tr data-v-dd58135a><td data-v-dd58135a>Type:</td><td data-v-dd58135a><code data-v-dd58135a>Backgrounds</code>, <code data-v-dd58135a>Sprites</code>, <code data-v-dd58135a>Expressions</code>, <code data-v-dd58135a>Styles</code>, <code data-v-dd58135a>Poses</code> or <code data-v-dd58135a>Characters</code></td><td data-v-dd58135a><code data-v-dd58135a>Type: Poses</code></td></tr><tr data-v-dd58135a><td data-v-dd58135a>Engine:</td><td data-v-dd58135a><code data-v-dd58135a>Doki Doki Dialog Generator</code>, <code data-v-dd58135a>DDDG</code> or <code data-v-dd58135a>Doki Doki Comic Club</code>, <code data-v-dd58135a>DDCC</code></td><td data-v-dd58135a><code data-v-dd58135a>Engine: DDCC</code></td></tr><tr data-v-dd58135a><td data-v-dd58135a>Pack:</td><td data-v-dd58135a>The pack itself must contain the text</td><td data-v-dd58135a><code data-v-dd58135a>Pack: Angry</code></td></tr></table><p data-v-dd58135a> Prefixes can be shorted, so <code data-v-dd58135a>Character: Monika</code> can be shortend to <code data-v-dd58135a>C: Monika</code></p>",6),kt=[_t],bt=250,wt=G({__name:"search-bar",props:{disabled:{type:Boolean,default:!1},modelValue:{type:String,default:""}},emits:["leave","focus-list","update:modelValue"],setup(r,{expose:e,emit:t}){const o=r,a=t,u=k(null),c=k(""),i=k(null),d=k("");function f(){const y=u.value;y&&y.focus()}e({focus:f});function w(y){y.key==="ArrowDown"&&(a("focus-list"),y.preventDefault(),y.stopPropagation())}function h(){if(d.value===o.modelValue){d.value="";return}c.value=o.modelValue}function $(){i.value!=null&&clearTimeout(i.value),i.value=setTimeout(I,bt)}function I(){i.value!=null&&clearTimeout(i.value),i.value=null;const y=document.createElement("div");y.innerHTML=c.value,d.value=y.innerText,a("update:modelValue",y.innerText)}ie(()=>o.modelValue,h,{immediate:!0});const x=k(!1);function L(y){x.value=!1}return ue(()=>{document.body.addEventListener("click",L)}),ye(()=>{document.body.removeEventListener("click",L)}),(y,b)=>(m(),g("div",ut,[p("div",pt,[_e(p("input",{class:"input",ref_key:"input",ref:u,"onUpdate:modelValue":b[0]||(b[0]=v=>c.value=v),disabled:r.disabled,onInput:$,onClick:b[1]||(b[1]=q(()=>{},["stop"])),onKeydown:w},null,40,ft),[[ke,c.value]]),p("button",{class:Y({help:!0,toggled:x.value}),disabled:r.disabled,onClick:b[2]||(b[2]=q(v=>x.value=!x.value,["stop"]))},mt,10,ht),p("button",{class:"exit-button",onClick:b[3]||(b[3]=v=>a("leave",!0))},yt)]),x.value?(m(),g("div",{key:0,class:"info-area",onClick:b[4]||(b[4]=q(()=>{},["stop"]))},kt)):P("",!0)]))}});const Ct=R(wt,[["__scopeId","data-v-dd58135a"]]);var le=(r,e,t)=>new Promise((o,a)=>{var u=d=>{try{i(t.next(d))}catch(f){a(f)}},c=d=>{try{i(t.throw(d))}catch(f){a(f)}},i=d=>d.done?o(d.value):Promise.resolve(d.value).then(u,c);i((t=t.apply(r,e)).next())});const xt={key:1,class:"ask-download"},Pt={key:1,class:"page fly-right"},Dt=G({__name:"single-box",emits:["leave"],setup(r,{expose:e,emit:t}){const o=t,a=k(null),u=k(null),c=k(null),i=k(""),d=k([]),f=k({}),w=k(null),h=k(null),$=D(()=>i.value.endsWith(".json")&&(i.value.startsWith("http://")||i.value.startsWith("https://")));function I(n){h.value=null,i.value=n}e({setSearch:I});function x(n){h.value=null,n&&v()}function L(n){n.key==="Escape"&&(h.value="",B(()=>{a.value.focus()}))}function y({id:n,source:l}){h.value=n,l==="keyboard"&&B(()=>{c.value.focus()})}function b(){B(()=>{u.value&&u.value.focus()})}function v(){B(()=>{a.value&&a.value.focus()})}function s(){return le(this,null,function*(){try{const l=yield(yield te.getInstance()).loadTempPack(i.value);i.value="",l&&(h.value=l)}catch(n){xe.fire(new Pe(n,"Error while loading external pack")),console.error(n)}})}return we(v),ue(v),Ce("Initializing repo list",()=>le(this,null,function*(){const n=yield te.getInstance();w.value=n,d.value=n.getPacks(),f.value=n.getAuthors()})),(n,l)=>(m(),g("div",{class:"pages",onKeydown:L},[h.value?(m(),g("div",Pt,[z(ct,{ref_key:"dialog",ref:c,class:"pack-display",repo:w.value,selected:h.value,"show-back":"",onLeave:x},null,8,["repo","selected"])])):(m(),g("div",{key:0,class:Y(["page fly-left",{blured:h.value}])},[z(Ct,{class:"search-bar",ref_key:"searchBar",ref:a,modelValue:i.value,"onUpdate:modelValue":l[0]||(l[0]=_=>i.value=_),disabled:!!h.value,onFocusList:b,onLeave:l[1]||(l[1]=_=>o("leave"))},null,8,["modelValue","disabled"]),$.value?(m(),g("div",xt,[M(" Do you want to download the pack from '"+T(i.value)+"'? ",1),p("button",{onClick:s},"Add package")])):(m(),J(He,{key:0,class:"list",ref_key:"list",ref:u,search:i.value,repo:w.value,disabled:!!h.value,onSelected:y,onSelectSearchBar:l[2]||(l[2]=_=>a.value.focus())},null,8,["search","repo","disabled"]))],2))],32))}});const Lt=R(Dt,[["__scopeId","data-v-f4ce706c"]]);export{Lt as default};
