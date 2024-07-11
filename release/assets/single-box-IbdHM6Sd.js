import{d as G,r as y,c as T,w as ce,o as h,a as g,b as p,F as N,e as z,t as L,f as x,g as R,h as F,n as Y,T as he,i as O,_ as K,u as ve,j as S,k as M,l as Z,m as ee,p as J,q as me,s as ge,v as j,x as ie,y as de,z as ye,A as ue,B as ke,C as be,D as we,E as _e,G as Ce,H as Pe,R as te,I as De,V as xe}from"./index-kBpnNdg9.js";const Te=["author","character","type","pack","engine"],X=new Map;for(const l of Te)for(let e=1;e<=l.length;++e){const t=l.slice(0,e);X.set(t,l)}const Le=/\s/;function Ae(l){const e=[];let t="",o="",a=!1,u=!1;function d(){e.push({type:o||"all",payload:t.toLowerCase()}),t="",o="",u=!1,a=!1}for(const c of l){if(u){t+=c,u=!1;continue}switch(c){case"\\":u=!0;continue;case":":const i=t.toLowerCase();if(!a&&o===""&&X.has(i)){o=X.get(i),t="";continue}break;case'"':a?d():a=!0;continue}!a&&Le.test(c)?t&&d():t+=c}return t&&d(),e}const ae=new Map([["engine",0],["pack",1],["type",2],["character",2],["author",2],["all",3]]);function Se(l){return Ie($e(l))}function Ie(l){return l.sort((e,t)=>ae.get(e.type)-ae.get(t.type)||t.payload.length-e.payload.length)}function $e(l){const e=new Map;for(const o of l){let a=e.get(o.type);a||(a=[],e.set(o.type,a)),a.push(o)}for(const o of e.keys()){const u=e.get(o).sort((d,c)=>d.payload.localeCompare(c.payload)).filter((d,c,i)=>i[c+1]?!i[c+1].payload.startsWith(d.payload):!0);e.set(o,u.filter((d,c,i)=>!i.find((f,w)=>w!==c&&f.payload.indexOf(d.payload)!==-1)))}const t=Array.from(e.keys()).filter(o=>o!=="all");return e.set("all",(e.get("all")||[]).filter(o=>!t.find(a=>e.get(a).find(u=>u.payload.indexOf(o.payload)!==-1)))),[...e.values()].flatMap(o=>o)}class B{constructor(e){e=e.replace(/[\s-]/g,"").toLowerCase();const t=new Set;for(const[o,a]of B.engines)o.toLowerCase().indexOf(e)>=0&&t.add(a);this.matchingProps=Array.from(t)}get isImpossible(){return this.matchingProps.length===0}match(e){for(const t of this.matchingProps)if(e[t])return!0;return!1}}B.engines=[["Doki Doki Dialog Generator 1","dddg1Path"],["Doki Doki Dialouge Generator 1","dddg1Path"],["DDDG1","dddg1Path"],["Doki Doki Dialog Generator 2","dddg2Path"],["Doki Doki Dialouge Generator 2","dddg2Path"],["DDDG2","dddg2Path"],["Doki Doki Comic Club 2","ddcc2Path"],["DDCC2","ddcc2Path"]].map(([l,e])=>[l.replace(/\s/g,"").toLowerCase(),e]);class pe{constructor(e,t){e=e.toLowerCase();const o=new Set;for(const a in t){if(!Object.prototype.hasOwnProperty.call(t,a))continue;const u=t[a],d=Object.keys(u);(a.toLowerCase().indexOf(e)>=0||d.find(c=>u[c].toLowerCase().indexOf(e)>=0))&&o.add(a)}this.matchingAuthors=o}get isImpossible(){return this.matchingAuthors.size===0}match(e){return!!e.authors.find(t=>this.matchingAuthors.has(t))}}class V{constructor(e,t,o){e=e.toLowerCase(),this.matchingCharacters=new Set(V.getUniqueCharacters(o).filter(a=>a.toLowerCase().indexOf(e)>=0))}get isImpossible(){return this.matchingCharacters.size===0}match(e){return!!e.characters.find(t=>this.matchingCharacters.has(t))}static getUniqueCharacters(e){let t=this.uniqueCharacters.get(e);return t||(t=Array.from(new Set(e.flatMap(o=>o.characters))),this.uniqueCharacters.set(e,t)),t}}V.uniqueCharacters=new Map;class H{constructor(e){e=e.toLowerCase(),this.matchingTypes=new Set(H.types.filter(t=>t.toLowerCase().indexOf(e)>=0))}get isImpossible(){return this.matchingTypes.size===0}match(e){return!!e.kind.find(t=>this.matchingTypes.has(t))}}H.types=["Styles","Characters","Expressions","Poses","Backgrounds","Sprites","Misc"];class I{constructor(e,t,o){e=e.toLowerCase(),this.payload=e;const a=I.getTriplets(o);for(let u=0,d=e.length-2;u<d;++u)if(!a.has(e.substr(u,3))){this.isImpossible=!0;return}this.isImpossible=!1}match(e){if(this.isImpossible)return!1;const t=this.payload;return!!(e.id.toLowerCase().indexOf(t)>=0||e.name.toLowerCase().indexOf(t)>=0||e.searchWords.find(o=>o.toLowerCase().indexOf(t)>=0))}static getTriplets(e){let t=this.tripletCache.get(e);if(!t){t=new Set;for(const o of e){I.splitTriplets(o.id,t),I.splitTriplets(o.name,t);for(const a of o.searchWords)I.splitTriplets(a,t)}this.tripletCache.set(e,t)}return t}static splitTriplets(e,t){e=e.toLowerCase();for(let o=0,a=e.length-2;o<a;++o)t.add(e.substr(o,3))}}I.tripletCache=new Map;class W{constructor(e,t,o){this.matchers=W.allMatchers.map(a=>new a(e,t,o)).filter(a=>!a.isImpossible)}get isImpossible(){return this.matchers.length===0}match(e){return!!this.matchers.find(t=>t.match(e))}}W.allMatchers=[B,pe,V,H,I];const Me=new Map([["all",W],["author",pe],["character",V],["engine",B],["pack",I],["type",H]]);function Ee(l,e,t){return l.map(o=>new(Me.get(o.type))(o.payload,e,t))}function Oe(l,e,t){const o=Ae(l),a=Se(o),u=Ee(a,e,t);return u.find(d=>d.isImpossible)?[]:t.filter(d=>u.every(c=>c.match(d)))}const Ne=["tabindex","onClick","onKeydown"],Be={key:0},Ve=["onMousedown","onClick"],oe=10,He=G({__name:"list",props:{search:{type:String,required:!0},repo:{type:Object},disabled:{type:Boolean,default:!1}},emits:["selected","select-search-bar"],setup(l,{emit:e}){const t=l,o=e,a=y(null),u=y(null),d=y(null),c=y(""),i=y(!1),f=y(""),w=T(()=>t.repo?t.repo.getPacks():[]),v=T(()=>{const r=b(w.value,t.search);if(c.value&&r.length>0){const n=c.value;let s;if(typeof r[0][n]=="string"?s=(m,_)=>m.name.localeCompare(_.name):r[0][n]instanceof Array&&(s=(m,_)=>m[n].join(", ").localeCompare(_[n].join(", "))),s){if(i.value){const m=s;s=(_,q)=>m(q,_)}r.sort(s)}}return r});function C(){u.value.$el.focus()}function $(r){const n=v.value.findIndex(s=>s.id===f.value);switch(r.key){case"Enter":o("selected",{id:f.value,source:"keyboard"}),r.stopPropagation(),r.preventDefault();break;case"ArrowUp":r.preventDefault(),r.stopPropagation(),n===0?o("select-search-bar"):f.value=v.value[n-1].id;break;case"ArrowDown":r.preventDefault(),r.stopPropagation(),n<v.value.length-1&&(f.value=v.value[n+1].id);break;case"PageUp":{r.preventDefault(),r.stopPropagation();let s=n-oe;s<0&&(s=0),f.value=v.value[s].id;break}case"PageDown":{r.preventDefault(),r.stopPropagation();let s=n+oe;const m=v.value.length-1;s>m&&(s=m),f.value=v.value[s].id;break}}}function P(r,n){switch(r.key){case"Enter":case" ":k(n),r.preventDefault(),r.stopPropagation();break;case"ArrowDown":C(),r.stopPropagation(),r.preventDefault();break;case"ArrowUp":o("select-search-bar"),r.stopPropagation(),r.preventDefault();break}}function A(){if(v.value.length===0){f.value="";return}f.value===""&&(f.value=v.value[0].id),O(()=>{const r=document.querySelector(".list tbody .focused"),n=a.value.offsetHeight-d.value.offsetHeight,s=a.value.scrollTop,m=s+n;if(r){const _=r.offsetTop-d.value.offsetHeight,q=_+r.offsetHeight;q>m?a.value.scrollTop=q-n:_<s&&(a.value.scrollTop=_)}})}function k(r){c.value===r?i.value?(c.value="",i.value=!1):i.value=!0:(c.value=r,i.value=!1)}function b(r,n){return n?Oe(n,t.repo?t.repo.getAuthors():{},r):[...r]}function D(r){return r.loaded?"Active":r.installed?"Installed":""}return ce(()=>f.value,A),(r,n)=>(h(),g("div",{ref_key:"root",ref:a,class:"list"},[p("table",null,[p("thead",null,[p("tr",{ref_key:"header",ref:d},[(h(),g(N,null,z([["name","Pack"],["characters","Character"],["kind","Type"],["authors","Authors"],["state","Status"]],(s,m)=>p("th",{key:m,tabindex:l.disabled?-1:0,onClick:_=>k(s[0]),onKeydown:_=>P(_,s[0])},[p("div",null,[p("div",null,L(s[1]),1),c.value===s[0]?(h(),g("div",Be,L(i.value?"▼":"▲"),1)):x("",!0)])],40,Ne)),64))],512)]),R(he,{name:"tbody-group",tag:"tbody",ref_key:"tbody",ref:u,tabindex:l.disabled?-1:0,onKeydown:$,onFocus:A},{default:F(()=>[(h(!0),g(N,null,z(v.value,s=>(h(),g("tr",{key:s.id,class:Y({"tbody-group-item":!0,focused:f.value===s.id}),onMousedown:m=>f.value=s.id,onClick:m=>o("selected",{id:s.id,source:"pointer"})},[p("td",null,L(s.name),1),p("td",null,L(s.characters.join(", ")),1),p("td",null,L(s.kind.join(", ")),1),p("td",null,L(s.authors.join(", ")),1),p("td",null,L(D(s)),1)],42,Ve))),128))]),_:1},8,["tabindex"])])],512))}}),qe=K(He,[["__scopeId","data-v-c8f9e5fd"]]),Ue=["h3","h4","h5","h6","blockquote","p","a","ul","ol","nl","li","b","i","strong","em","strike","code","hr","br","div","table","thead","caption","tbody","tr","th","td","pre"],je={a:["href"],img:["src"]},ze=["href","src"],Re=["http","https"],Ge={a:{target:"_blank",rel:"noopener noreferrer"}};function se(l){const e=document.createElement("div"),t=document.createElement("div");t.innerHTML=l;for(const o of Array.from(t.childNodes))for(const a of Q(o))e.appendChild(a);return e.innerHTML}const Ke=/^(\w+):/;function Q(l){if(l.nodeType!==Node.ELEMENT_NODE)return[l];const e=l,t=e.tagName.toLowerCase();if(Ue.includes(t)){const o=document.createElement(t),a=Array.prototype.slice.call(e.attributes),u=je[t]||[];for(const i of a)if(u.includes(i.name)){if(ze.includes(i.name)){const f=i.value.match(Ke);if(f&&!Re.includes(f[1]))continue}o.setAttribute(i.name,e.getAttribute(i.name))}const d=Ge[t];if(d)for(const i in d)Object.prototype.hasOwnProperty.call(d,i)&&o.setAttribute(i,d[i]);const c=Array.prototype.slice.call(e.childNodes);for(const i of c){const f=Q(i);for(const w of f)o.appendChild(w)}return[o]}else{let o=[];o.push(document.createTextNode(`<${t}>`));for(const a of e.childNodes)o=o.concat(Q(a));return o.push(document.createTextNode(`</${t}>`)),o}}var We=Object.defineProperty,ne=Object.getOwnPropertySymbols,Fe=Object.prototype.hasOwnProperty,Je=Object.prototype.propertyIsEnumerable,re=(l,e,t)=>e in l?We(l,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):l[e]=t,Xe=(l,e)=>{for(var t in e||(e={}))Fe.call(e,t)&&re(l,t,e[t]);if(ne)for(var t of ne(e))Je.call(e,t)&&re(l,t,e[t]);return l},U=(l,e,t)=>new Promise((o,a)=>{var u=i=>{try{c(t.next(i))}catch(f){a(f)}},d=i=>{try{c(t.throw(i))}catch(f){a(f)}},c=i=>i.done?o(i.value):Promise.resolve(i.value).then(u,d);c((t=t.apply(l,e)).next())});const E=l=>(ie("data-v-65b4ab43"),l=l(),de(),l),Qe=E(()=>p("i",{class:"material-icons"},"arrow_back",-1)),Ye=[Qe],Ze=["innerHTML"],et={key:1},tt=E(()=>p("i",{class:"material-icons"},"add",-1)),at=E(()=>p("i",{class:"material-icons"},"remove",-1)),ot={key:2,disabled:""},st=E(()=>p("i",{class:"material-icons"},"add",-1)),nt=E(()=>p("i",{class:"material-icons"},"remove",-1)),rt=E(()=>p("h3",null,"Authors",-1)),lt=["title","src"],ct={key:2},it=E(()=>p("h3",null,"Credits",-1)),dt=["innerHTML"],ut=G({__name:"pack-display",props:{selected:{type:String,required:!0},repo:{type:Object,require:!0},showBack:{type:Boolean,require:!1}},setup(l){const e=[["reddit","https://reddit.com/u/%1","reddit.png"],["deviantart","https://www.deviantart.com/%1","deviantart.png"],["twitter","https://twitter.com/%1","twitter.svg"],["pixiv","https://www.pixiv.net/users/%1","pixiv.ico"],["patreon","https://www.patreon.com/%1","patreon.png"],["facebook","https://www.facebook.com/%1","facebook.png"],["github","https://github.com/%1","github.png"],["website","%1","website.svg"]],t=ve(),o=l,a=T(()=>o.repo.getPack(o.selected)),u=T(()=>a.value.preview.map(r=>`url('${r}')`).join(",")),d=T(()=>a.value.loaded),c=T(()=>!a.value.loaded),i=T(()=>S.supports.autoLoading),f=T(()=>S.supports.localRepo?!a.value.installed:!1),w=T(()=>S.supports.localRepo?a.value.installed:!1),v=T({get(){return S.state.autoAdd.includes(o.selected)},set(r){let n=o.selected;const s=a.value;s.repoUrl!=null&&(n+=`;${s.repoUrl}`),r?S.autoLoadAdd(n):S.autoLoadRemove(n)}}),C=y(!1);function $(r){const n=o.repo.getAuthor(r);return n&&n.currentName!=null?n.currentName:r}function P(r){const n=o.repo.getAuthor(r);return n?e.filter(s=>n[s[0]]).map(s=>{const m=n[s[0]];return{target:s[1].replace("%1",m),platform:s[0][0].toUpperCase()+s[0].slice(1),icon:"icons/"+s[2]}}):[]}function A(){return U(this,null,function*(){if(a.value.installed)return;const r={};for(const s of a.value.authors)r[s]=Xe({},o.repo.getAuthor(s));const n=JSON.parse(JSON.stringify(a.value));delete n.autoloading,delete n.online,delete n.loaded,delete n.installed;try{C.value=!0,yield S.localRepoInstall(a.value.dddg2Path||a.value.dddg1Path,n,r)}catch(s){ye(s)}finally{C.value=!1}})}function k(){return U(this,null,function*(){var r;const n=a.value;if(n.installed){n.repoUrl&&!((r=o.repo)!=null&&r.hasPack(n.id,!0))&&(yield o.repo.loadTempPack(n.repoUrl));try{C.value=!0,yield S.localRepoUninstall(n.id)}finally{C.value=!1}}})}function b(){return U(this,null,function*(){yield t.dispatch("removePacks",{packs:new Set([a.value.id])})})}function D(){return U(this,null,function*(){yield t.dispatch("content/loadContentPacks",a.value.dddg2Path||a.value.dddg1Path)})}return(r,n)=>(h(),g("div",{class:"pack-display",style:ge({backgroundImage:u.value}),onClick:n[2]||(n[2]=j(()=>{},["stop"]))},[p("header",null,[p("h1",null,[l.showBack?(h(),g("button",{key:0,class:"exit-button",onClick:n[0]||(n[0]=s=>r.$emit("leave",!0))},Ye)):x("",!0),M(" "+L(a.value.name),1)]),p("h2",null,L(a.value.id),1)]),a.value.disclaimer?(h(),g("section",{key:0,class:"disclaimer",innerHTML:Z(se)(a.value.disclaimer)},null,8,Ze)):x("",!0),a.value.source?(h(),g("section",et,[R(ee,{to:a.value.source},{default:F(()=>[M("Source")]),_:1},8,["to"])])):x("",!0),p("section",null,[c.value?(h(),g("button",{key:0,onClick:D},[tt,M(" Activate ")])):x("",!0),d.value?(h(),g("button",{key:1,onClick:b},[at,M(" Deactivate ")])):x("",!0),C.value?(h(),g("button",ot,"Processing...")):(h(),g(N,{key:3},[f.value?(h(),g("button",{key:0,onClick:A},[st,M(" Store locally ")])):x("",!0),w.value?(h(),g("button",{key:1,onClick:k},[nt,M(" Remove locally ")])):x("",!0)],64)),i.value?(h(),J(me,{key:4,label:"Load on startup",modelValue:v.value,"onUpdate:modelValue":n[1]||(n[1]=s=>v.value=s)},null,8,["modelValue"])):x("",!0)]),p("section",null,[rt,p("table",null,[p("tbody",null,[(h(!0),g(N,null,z(a.value.authors,s=>(h(),g("tr",{key:s},[p("td",null,L($(s)),1),p("td",null,[(h(!0),g(N,null,z(P(s),m=>(h(),J(ee,{key:m.target,to:m.target,class:"platform_button"},{default:F(()=>[p("img",{title:m.platform,src:m.icon,height:"32",width:"32",alt:""},null,8,lt)]),_:2},1032,["to"]))),128))])]))),128))])])]),a.value.description?(h(),g("section",ct,[it,p("p",{innerHTML:Z(se)(a.value.description)},null,8,dt)])):x("",!0)],4))}}),pt=K(ut,[["__scopeId","data-v-65b4ab43"]]),fe=l=>(ie("data-v-a63c61d7"),l=l(),de(),l),ft={class:"search-area"},ht={class:"search-bar"},vt=["disabled"],mt=["disabled"],gt=fe(()=>p("i",{class:"material-icons"},"info",-1)),yt=[gt],kt=fe(()=>p("i",{class:"material-icons"},"clear",-1)),bt=[kt],wt=_e("<p data-v-a63c61d7>Enter the text you want to search for. E.g. <code data-v-a63c61d7>Monika</code></p><p data-v-a63c61d7> If multiple words are given, each word must be found. E.g. <code data-v-a63c61d7>Monika Pose</code></p><p data-v-a63c61d7> To search phrases with spaces, surround them with double quotes. E.g. <code data-v-a63c61d7>&quot;Monika R63&quot; Pose</code></p><p data-v-a63c61d7> To limit your search to specific attributes of a pack, you can use the following prefixes: </p><table data-v-a63c61d7><tr data-v-a63c61d7><th data-v-a63c61d7>Prefix</th><th data-v-a63c61d7>Description</th><th data-v-a63c61d7>Example</th></tr><tr data-v-a63c61d7><td data-v-a63c61d7>Character:</td><td data-v-a63c61d7></td><td data-v-a63c61d7><code data-v-a63c61d7>Character: Monika</code></td></tr><tr data-v-a63c61d7><td data-v-a63c61d7>Artist:</td><td data-v-a63c61d7></td><td data-v-a63c61d7><code data-v-a63c61d7>Artist: edave64</code></td></tr><tr data-v-a63c61d7><td data-v-a63c61d7>Type:</td><td data-v-a63c61d7><code data-v-a63c61d7>Backgrounds</code>, <code data-v-a63c61d7>Sprites</code>, <code data-v-a63c61d7>Expressions</code>, <code data-v-a63c61d7>Styles</code>, <code data-v-a63c61d7>Poses</code> or <code data-v-a63c61d7>Characters</code></td><td data-v-a63c61d7><code data-v-a63c61d7>Type: Poses</code></td></tr><tr data-v-a63c61d7><td data-v-a63c61d7>Engine:</td><td data-v-a63c61d7><code data-v-a63c61d7>Doki Doki Dialog Generator</code>, <code data-v-a63c61d7>DDDG</code> or <code data-v-a63c61d7>Doki Doki Comic Club</code>, <code data-v-a63c61d7>DDCC</code></td><td data-v-a63c61d7><code data-v-a63c61d7>Engine: DDCC</code></td></tr><tr data-v-a63c61d7><td data-v-a63c61d7>Pack:</td><td data-v-a63c61d7>The pack itself must contain the text</td><td data-v-a63c61d7><code data-v-a63c61d7>Pack: Angry</code></td></tr></table><p data-v-a63c61d7> Prefixes can be shorted, so <code data-v-a63c61d7>Character: Monika</code> can be shortend to <code data-v-a63c61d7>C: Monika</code></p>",6),_t=[wt],Ct=250,Pt=G({__name:"search-bar",props:{disabled:{type:Boolean,default:!1},modelValue:{type:String,default:""}},emits:["leave","focus-list","update:modelValue"],setup(l,{expose:e,emit:t}){const o=l,a=t,u=y(null),d=y(""),c=y(null),i=y("");function f(){const k=u.value;k&&k.focus()}e({focus:f});function w(k){k.key==="ArrowDown"&&(a("focus-list"),k.preventDefault(),k.stopPropagation())}function v(){if(i.value===o.modelValue){i.value="";return}d.value=o.modelValue}function C(){c.value!=null&&clearTimeout(c.value),c.value=setTimeout($,Ct)}function $(){c.value!=null&&clearTimeout(c.value),c.value=null;const k=document.createElement("div");k.innerHTML=d.value,i.value=k.innerText,a("update:modelValue",k.innerText)}ce(()=>o.modelValue,v,{immediate:!0});const P=y(!1);function A(k){P.value=!1}return ue(()=>{document.body.addEventListener("click",A)}),ke(()=>{document.body.removeEventListener("click",A)}),(k,b)=>(h(),g("div",ft,[p("div",ht,[be(p("input",{class:"input",ref_key:"input",ref:u,"onUpdate:modelValue":b[0]||(b[0]=D=>d.value=D),disabled:l.disabled,onInput:C,onClick:b[1]||(b[1]=j(()=>{},["stop"])),onKeydown:w},null,40,vt),[[we,d.value]]),p("button",{class:Y({help:!0,toggled:P.value}),disabled:l.disabled,onClick:b[2]||(b[2]=j(D=>P.value=!P.value,["stop"]))},yt,10,mt),p("button",{class:"exit-button",onClick:b[3]||(b[3]=D=>a("leave",!0))},bt)]),P.value?(h(),g("div",{key:0,class:"info-area",onClick:b[4]||(b[4]=j(()=>{},["stop"]))},_t)):x("",!0)]))}}),Dt=K(Pt,[["__scopeId","data-v-a63c61d7"]]);var le=(l,e,t)=>new Promise((o,a)=>{var u=i=>{try{c(t.next(i))}catch(f){a(f)}},d=i=>{try{c(t.throw(i))}catch(f){a(f)}},c=i=>i.done?o(i.value):Promise.resolve(i.value).then(u,d);c((t=t.apply(l,e)).next())});const xt={key:1,class:"ask-download"},Tt={key:1,class:"page fly-right"},Lt=G({__name:"single-box",emits:["leave"],setup(l,{expose:e,emit:t}){const o=t,a=y(null),u=y(null),d=y(null),c=y(""),i=y([]),f=y({}),w=y(null),v=y(null),C=T(()=>c.value.endsWith(".json")&&(c.value.startsWith("http://")||c.value.startsWith("https://")));function $(n){v.value=null,c.value=n}e({setSearch:$});function P(n){v.value=null,n&&D()}function A(n){n.key==="Escape"&&(v.value="",O(()=>{a.value.focus()}))}function k({id:n,source:s}){v.value=n,s==="keyboard"&&O(()=>{d.value.focus()})}function b(){O(()=>{u.value&&u.value.focus()})}function D(){O(()=>{a.value&&a.value.focus()})}function r(){return le(this,null,function*(){try{const s=yield(yield te.getInstance()).loadTempPack(c.value);c.value="",s&&(v.value=s)}catch(n){De.fire(new xe(n,"Error while loading external pack")),console.error(n)}})}return Ce(D),ue(D),Pe("Initializing repo list",()=>le(this,null,function*(){const n=yield te.getInstance();w.value=n,i.value=n.getPacks(),f.value=n.getAuthors()})),(n,s)=>(h(),g("div",{class:"pages",onKeydown:A},[v.value?(h(),g("div",Tt,[R(pt,{ref_key:"dialog",ref:d,class:"pack-display",repo:w.value,selected:v.value,"show-back":"",onLeave:P},null,8,["repo","selected"])])):(h(),g("div",{key:0,class:Y(["page fly-left",{blured:v.value}])},[R(Dt,{class:"search-bar",ref_key:"searchBar",ref:a,modelValue:c.value,"onUpdate:modelValue":s[0]||(s[0]=m=>c.value=m),disabled:!!v.value,onFocusList:b,onLeave:s[1]||(s[1]=m=>o("leave"))},null,8,["modelValue","disabled"]),C.value?(h(),g("div",xt,[M(" Do you want to download the pack from '"+L(c.value)+"'? ",1),p("button",{onClick:r},"Add package")])):(h(),J(qe,{key:0,class:"list",ref_key:"list",ref:u,search:c.value,repo:w.value,disabled:!!v.value,onSelected:k,onSelectSearchBar:s[2]||(s[2]=m=>a.value.focus())},null,8,["search","repo","disabled"]))],2))],32))}}),St=K(Lt,[["__scopeId","data-v-7ce68e03"]]);export{St as default};
