"use strict";(()=>{var tt=Object.create;var ce=Object.defineProperty,nt=Object.defineProperties,it=Object.getOwnPropertyDescriptor,st=Object.getOwnPropertyDescriptors,at=Object.getOwnPropertyNames,Se=Object.getOwnPropertySymbols,rt=Object.getPrototypeOf,Ae=Object.prototype.hasOwnProperty,ot=Object.prototype.propertyIsEnumerable;var De=(t,e,n)=>e in t?ce(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,V=(t,e)=>{for(var n in e||(e={}))Ae.call(e,n)&&De(t,n,e[n]);if(Se)for(var n of Se(e))ot.call(e,n)&&De(t,n,e[n]);return t},G=(t,e)=>nt(t,st(e));var Y=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports);var lt=(t,e,n,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of at(e))!Ae.call(t,s)&&s!==n&&ce(t,s,{get:()=>e[s],enumerable:!(i=it(e,s))||i.enumerable});return t};var ct=(t,e,n)=>(n=t!=null?tt(rt(t)):{},lt(e||!t||!t.__esModule?ce(n,"default",{value:t,enumerable:!0}):n,t));var de=(t,e,n)=>{if(!e.has(t))throw TypeError("Cannot "+n)};var R=(t,e,n)=>(de(t,e,"read from private field"),n?n.call(t):e.get(t)),H=(t,e,n)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,n)},J=(t,e,n,i)=>(de(t,e,"write to private field"),i?i.call(t,n):e.set(t,n),n);var j=(t,e,n)=>(de(t,e,"access private method"),n);var ue=Y(u=>{"use strict";Object.defineProperty(u,"__esModule",{value:!0});u.Events=u.ChannelReceiver=u.SystemSender=u.ErrorTypes=u.ChannelState=u.ClientActions=u.ServerActions=u.PresenceEventTypes=void 0;var yt;(function(t){t.JOIN="JOIN",t.LEAVE="LEAVE",t.UPDATE="UPDATE"})(yt=u.PresenceEventTypes||(u.PresenceEventTypes={}));var Ct;(function(t){t.PRESENCE="PRESENCE",t.SYSTEM="SYSTEM",t.BROADCAST="BROADCAST",t.ERROR="ERROR"})(Ct=u.ServerActions||(u.ServerActions={}));var Lt;(function(t){t.JOIN_CHANNEL="JOIN_CHANNEL",t.LEAVE_CHANNEL="LEAVE_CHANNEL",t.BROADCAST="BROADCAST"})(Lt=u.ClientActions||(u.ClientActions={}));var Tt;(function(t){t.IDLE="IDLE",t.JOINING="JOINING",t.JOINED="JOINED",t.STALLED="STALLED",t.CLOSED="CLOSED"})(Tt=u.ChannelState||(u.ChannelState={}));var wt;(function(t){t.UNAUTHORIZED_CONNECTION="UNAUTHORIZED_CONNECTION",t.UNAUTHORIZED_JOIN_REQUEST="UNAUTHORIZED_JOIN_REQUEST",t.UNAUTHORIZED_BROADCAST="UNAUTHORIZED_BROADCAST",t.INVALID_MESSAGE="INVALID_MESSAGE",t.HANDLER_NOT_FOUND="HANDLER_NOT_FOUND",t.PRESENCE_ERROR="PRESENCE_ERROR",t.CHANNEL_ERROR="CHANNEL_ERROR",t.ENDPOINT_ERROR="ENDPOINT_ERROR",t.INTERNAL_SERVER_ERROR="INTERNAL_SERVER_ERROR"})(wt=u.ErrorTypes||(u.ErrorTypes={}));var St;(function(t){t.ENDPOINT="ENDPOINT",t.CHANNEL="CHANNEL"})(St=u.SystemSender||(u.SystemSender={}));var Dt;(function(t){t.ALL_USERS="ALL_USERS",t.ALL_EXCEPT_SENDER="ALL_EXCEPT_SENDER"})(Dt=u.ChannelReceiver||(u.ChannelReceiver={}));var At;(function(t){t.ACKNOWLEDGE="ACKNOWLEDGE"})(At=u.Events||(u.Events={}))});var fe=Y(E=>{"use strict";var B=E&&E.__classPrivateFieldSet||function(t,e,n,i,s){if(i==="m")throw new TypeError("Private method is not writable");if(i==="a"&&!s)throw new TypeError("Private accessor was defined without a setter");if(typeof e=="function"?t!==e||!s:!e.has(t))throw new TypeError("Cannot write private member to an object whose class did not declare it");return i==="a"?s.call(t,n):s?s.value=n:e.set(t,n),n},g=E&&E.__classPrivateFieldGet||function(t,e,n,i){if(n==="a"&&!i)throw new TypeError("Private accessor was defined without a getter");if(typeof e=="function"?t!==e||!i:!e.has(t))throw new TypeError("Cannot read private member from an object whose class did not declare it");return n==="m"?i:n==="a"?i.call(t):i?i.value:e.get(t)},w,S,M,P;Object.defineProperty(E,"__esModule",{value:!0});E.BehaviorSubject=E.Subject=E.SimpleBehaviorSubject=E.SimpleSubject=void 0;var q=class{constructor(){w.set(this,void 0),B(this,w,new Set,"f")}subscribe(e){return g(this,w,"f").add(e),()=>g(this,w,"f").delete(e)}publish(e){g(this,w,"f").forEach(n=>n(e))}get size(){return g(this,w,"f").size}};E.SimpleSubject=q;w=new WeakMap;var he=class extends q{constructor(e){super(),S.set(this,void 0),B(this,S,e,"f")}get value(){return g(this,S,"f")}publish(e){B(this,S,e,"f"),super.publish(e)}subscribe(e){return g(this,S,"f")&&e(g(this,S,"f")),super.subscribe(e)}};E.SimpleBehaviorSubject=he;S=new WeakMap;var ee=class extends q{constructor(){super(...arguments),M.set(this,{})}subscribeWith(e,n){g(this,M,"f")[e]=super.subscribe(n)}unsubscribe(e){var n,i;(i=(n=g(this,M,"f"))[e])===null||i===void 0||i.call(n),delete g(this,M,"f")[e]}has(e){return!!g(this,M,"f")[e]}};E.Subject=ee;M=new WeakMap;var pe=class extends ee{constructor(e){super(),P.set(this,void 0),B(this,P,e,"f")}subscribeWith(e,n){g(this,P,"f")&&n(g(this,P,"f")),super.subscribeWith(e,n)}publish(e){B(this,P,e,"f"),super.publish(e)}};E.BehaviorSubject=pe;P=new WeakMap});var Fe=Y(T=>{"use strict";var y=T&&T.__classPrivateFieldSet||function(t,e,n,i,s){if(i==="m")throw new TypeError("Private method is not writable");if(i==="a"&&!s)throw new TypeError("Private accessor was defined without a setter");if(typeof e=="function"?t!==e||!s:!e.has(t))throw new TypeError("Cannot write private member to an object whose class did not declare it");return i==="a"?s.call(t,n):s?s.value=n:e.set(t,n),n},c=T&&T.__classPrivateFieldGet||function(t,e,n,i){if(n==="a"&&!i)throw new TypeError("Private accessor was defined without a getter");if(typeof e=="function"?t!==e||!i:!e.has(t))throw new TypeError("Cannot read private member from an object whose class did not declare it");return n==="m"?i:n==="a"?i.call(t):i?i.value:e.get(t)},v,L,K,O,U,m,D,I,$,te,ne,me,F,Ie,Me;Object.defineProperty(T,"__esModule",{value:!0});T.Channel=void 0;var d=ue(),Pe=fe(),Ee=class{constructor(e,n,i,s,a={}){v.add(this),L.set(this,void 0),K.set(this,void 0),O.set(this,void 0),U.set(this,void 0),m.set(this,void 0),D.set(this,void 0),I.set(this,void 0),$.set(this,void 0),te.set(this,void 0),y(this,L,i,"f"),y(this,I,[],"f"),y(this,$,[],"f"),y(this,K,a,"f"),y(this,D,e,"f"),y(this,U,n,"f"),y(this,O,new Pe.SimpleSubject,"f"),y(this,m,new Pe.SimpleBehaviorSubject(d.ChannelState.IDLE),"f"),y(this,te,c(this,v,"m",Ie).call(this,s),"f")}join(){if(c(this,m,"f").value===d.ChannelState.CLOSED)throw new Error("This channel has been closed");let e={action:d.ClientActions.JOIN_CHANNEL,channelName:c(this,L,"f"),event:d.ClientActions.JOIN_CHANNEL,payload:c(this,K,"f")};c(this,m,"f").publish(d.ChannelState.JOINING),c(this,U,"f").value?c(this,D,"f").call(this,e):c(this,m,"f").publish(d.ChannelState.STALLED)}leave(){let e={action:d.ClientActions.LEAVE_CHANNEL,channelName:c(this,L,"f"),event:d.ClientActions.LEAVE_CHANNEL,payload:{}};c(this,v,"m",me).call(this,e),c(this,m,"f").publish(d.ChannelState.CLOSED),c(this,te,"f").call(this)}onMessage(e){return c(this,O,"f").subscribe(n=>{if(n.action!==d.ServerActions.PRESENCE)return e(n.event,n.payload)})}onMessageEvent(e,n){return this.onMessage((i,s)=>{if(i===e)return n(s)})}onChannelStateChange(e){return c(this,m,"f").subscribe(n=>{e(n)})}onJoin(e){return c(this,v,"m",F).call(this,(n,i)=>{if(n===d.PresenceEventTypes.JOIN)return e(i.changed)})}onLeave(e){return c(this,v,"m",F).call(this,(n,i)=>{if(n===d.PresenceEventTypes.LEAVE)return e(i.changed)})}onPresenceChange(e){return c(this,v,"m",F).call(this,(n,i)=>{if(n===d.PresenceEventTypes.UPDATE)return e(i)})}sendMessage(e,n,i){c(this,v,"m",ne).call(this,e,n,i)}broadcastFrom(e,n){c(this,v,"m",ne).call(this,e,n,d.ChannelReceiver.ALL_EXCEPT_SENDER)}broadcast(e,n){c(this,v,"m",ne).call(this,e,n)}get channelState(){return c(this,m,"f").value}getPresence(){return c(this,$,"f")}onUsersChange(e){return c(this,v,"m",F).call(this,(n,i)=>e(i.presence))}isConnected(){return c(this,m,"f").value===d.ChannelState.JOINED||c(this,m,"f").value===d.ChannelState.STALLED}onConnectionChange(e){return this.onChannelStateChange(n=>{e(n===d.ChannelState.JOINED||n===d.ChannelState.STALLED)})}};T.Channel=Ee;L=new WeakMap,K=new WeakMap,O=new WeakMap,U=new WeakMap,m=new WeakMap,D=new WeakMap,I=new WeakMap,$=new WeakMap,te=new WeakMap,v=new WeakSet,ne=function(e,n,i=d.ChannelReceiver.ALL_USERS){let s={action:d.ClientActions.BROADCAST,channelName:c(this,L,"f"),event:e,payload:n,addresses:i};c(this,v,"m",me).call(this,s)},me=function(e){if(c(this,U,"f").value){c(this,m,"f").value===d.ChannelState.JOINED&&c(this,D,"f").call(this,e);return}c(this,I,"f").push(e)},F=function(e){return c(this,O,"f").subscribe(n=>{if(n.action===d.ServerActions.PRESENCE)return e(n.event,n.payload)})},Ie=function(e){let n=e.subscribe(a=>{a.channelName===c(this,L,"f")&&(a.event===d.Events.ACKNOWLEDGE?(c(this,m,"f").publish(d.ChannelState.JOINED),c(this,v,"m",Me).call(this)):c(this,O,"f").publish(a))}),i=c(this,U,"f").subscribe(a=>{if(a&&c(this,m,"f").value===d.ChannelState.STALLED){let r={action:d.ClientActions.JOIN_CHANNEL,channelName:c(this,L,"f"),event:d.ClientActions.JOIN_CHANNEL,payload:c(this,K,"f")};c(this,D,"f").call(this,r)}else!a&&c(this,m,"f").value===d.ChannelState.JOINED&&c(this,m,"f").publish(d.ChannelState.STALLED)}),s=c(this,v,"m",F).call(this,(a,r)=>{y(this,$,r.presence,"f")});return()=>{n(),i(),s()}},Me=function(){c(this,I,"f").filter(e=>e.action!==d.ClientActions.JOIN_CHANNEL).forEach(e=>{c(this,D,"f").call(this,e)}),c(this,m,"f").publish(d.ChannelState.JOINED),y(this,I,[],"f")}});var We=Y(A=>{"use strict";var Oe=A&&A.__classPrivateFieldSet||function(t,e,n,i,s){if(i==="m")throw new TypeError("Private method is not writable");if(i==="a"&&!s)throw new TypeError("Private accessor was defined without a setter");if(typeof e=="function"?t!==e||!s:!e.has(t))throw new TypeError("Cannot write private member to an object whose class did not declare it");return i==="a"?s.call(t,n):s?s.value=n:e.set(t,n),n},k=A&&A.__classPrivateFieldGet||function(t,e,n,i){if(n==="a"&&!i)throw new TypeError("Private accessor was defined without a getter");if(typeof e=="function"?t!==e||!i:!e.has(t))throw new TypeError("Cannot read private member from an object whose class did not declare it");return n==="m"?i:n==="a"?i.call(t):i?i.value:e.get(t)},ve,C,ke;Object.defineProperty(A,"__esModule",{value:!0});var bt=Fe(),Nt=ue(),Ue=fe(),ge=class{constructor(e,n={}){ve.add(this),C.set(this,void 0);let i;try{i=new URL(e)}catch(r){i=new URL(window.location.toString()),i.pathname=e}let s=new URLSearchParams(n);i.search=s.toString();let a=i.protocol==="https:"?"wss:":"ws:";i.protocol!=="wss:"&&i.protocol!=="ws:"&&(i.protocol=a),this._address=i,Oe(this,C,{},"f"),this._broadcaster=new Ue.SimpleSubject,this._connectionState=new Ue.SimpleBehaviorSubject(!1)}connect(e=1){let n=new WebSocket(this._address.toString());n.onopen=()=>{this._connectionState.publish(!0)},n.onmessage=i=>{let s=JSON.parse(i.data);this._broadcaster.publish(s)},n.onerror=()=>{this._connectionState.publish(!1),setTimeout(()=>{this.connect(e*2)},e*1e3)},this._socket=n}getState(){return this._connectionState.value}disconnect(){var e;Object.values(k(this,C,"f")).forEach(n=>n.leave()),(e=this._socket)===null||e===void 0||e.close(),Oe(this,C,{},"f")}createChannel(e,n){if(k(this,C,"f")[e]&&k(this,C,"f")[e].channelState!==Nt.ChannelState.CLOSED)return k(this,C,"f")[e];let i=k(this,ve,"m",ke).call(this),s=new bt.Channel(i,this._connectionState,e,this._broadcaster,n);return k(this,C,"f")[e]=s,s}onConnectionChange(e){return this._connectionState.subscribe(e)}};A.default=ge;C=new WeakMap,ve=new WeakSet,ke=function(){return e=>{this._connectionState.value&&this._socket.send(JSON.stringify(e))}}});var p=(t,e,n)=>{let i=new CustomEvent(t,{detail:e,bubbles:!0,cancelable:!0});n?n.dispatchEvent(i):window.dispatchEvent(i)},be=(t,e,n)=>{t.broadcastFrom("event",n)},Ne=(t,e,n)=>{t.broadcastFrom(e,n)};var dt=t=>{t.onAttributeChange("[pond-value]",(e,n,i)=>{let s=e;s.value=i||""})},ut=t=>{t.onAttributeChange("[pond-checked]",(e,n,i)=>{let s=e;s.checked=i==="true"})},ht=t=>{t.onAttributeChange("[pond-disabled]",(e,n,i)=>{let s=e;s.disabled=i==="true"})},pt=t=>{t.onAttributeChange("[pond-hidden]",(e,n,i)=>{let s=e;s.hidden=i==="true"})},ft=t=>{t.onAttributeChange("[pond-readonly]",(e,n,i)=>{let s=e;s.readOnly=i==="true"})},mt=t=>{t.onAttributeChange("[pond-required]",(e,n,i)=>{let s=e;s.required=i==="true"})},Et=t=>{t.onAttributeChange("[pond-focused]",(e,n,i)=>{let s=e;i==="true"?s.focus():s.blur()})},vt=t=>{t.onAttributeChange("[pond-copy]",(e,n,i)=>{let s=e;s.value=i||"",navigator.clipboard.writeText(s.value).catch(console.error)})},gt=t=>{t.onAttributeChange("[pond-emit]",(e,n,i)=>{try{let s=JSON.parse(i||"{}");p("pond-emit",s,e)}catch(s){p("pond-emit",i,e)}})},Re=t=>{dt(t),ut(t),ht(t),pt(t),ft(t),mt(t),Et(t),gt(t),vt(t)};var _t=async(t,e,n,i,s)=>{s.preventDefault();let a=e.replace(/[\[\].#]/g,""),r=i.getAttribute(a),o=i.getAttribute("pond-data-id");if(r){let l=await n(s,i,r);l&&(l.event?Ne(t,l.event,G(V({},l),{dataId:o,action:r,address:window.location.toString()})):be(t,"event",G(V({},l),{dataId:o,action:r,address:window.location.toString()})))}},He=(t,e)=>(n,i,s)=>{e.addEventListener(n,i,async(a,r)=>{await _t(t,n,s,a,r)})};var qe=ct(We());var ie=t=>typeof t=="function",ye=t=>Array.isArray(t),_e=t=>t instanceof Date,Rt=t=>typeof t=="object"&&t!==null&&!ye(t)&&!_e(t),Z=t=>!Rt(t)&&!ye(t),z=t=>t!=null,xe=(t,e)=>{let n=(s,a)=>s===a||_e(s)&&_e(a)&&s.getTime()===a.getTime()?"unchanged":s===void 0?"created":a===void 0?"deleted":"updated",i=(s,a)=>{if(ie(s)||ie(a))throw new Error("Invalid argument. Function given, object expected.");if(Z(s)||Z(a)){let o=n(s,a);return o==="updated"?{type:o,data:a}:{type:o,data:s===void 0?a:s}}let r={};for(let o in s){if(ie(s[o]))continue;let l;a[o]!==void 0&&(l=a[o]),r[o]=i(s[o],l)}for(let o in a)ie(a[o])||r[o]!==void 0||(r[o]=i(void 0,a[o]));return r};return i(t,e)},Ce=t=>{let e={};for(let n in t)if(t[n]){if(t[n].type==="created"||t[n].type==="updated")e[n]=t[n].data;else if(t[n].type==="deleted")e[n]=null;else if(typeof t[n]=="object"){let i=Ce(t[n]);i&&Object.keys(i).length>0&&(e[n]=i)}}return e};function Ht(t,e){let n=t.map((i,s)=>z(e[s])?se(i,e[s]):e[s]===null?void 0:i);for(let i in e)n[i]===void 0&&z(e[i])&&(n[i]=e[i]);return n.filter(i=>z(i))}function Mt(t,e){let n={};for(let i in t)if(e[i]!==void 0&&e[i]!==null)if(Z(t[i]))n[i]=e[i];else{let s=se(t[i],e[i]);z(s)&&(n[i]=s)}else n[i]=t[i];for(let i in e)n[i]===void 0&&z(e[i])&&(n[i]=e[i]);return n}var se=(t,e)=>{if(t===void 0)return e;if(e===void 0)return t;if(e!==null)return Z(t)&&Z(e)?e:ye(t)?Ht(t,e):Mt(t,e)};var Ge={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"},Pt=new RegExp(Object.keys(Ge).join("|"),"g"),_=class{constructor(e,n){this.statics=e,this.dynamics=n}static parse(e){let n=e,i=n.s||[""];delete n.s;let s=Object.values(n).filter(a=>a!=null);return new _(i,s)}toString(){let e=this.statics[0];for(let n=0;n<this.dynamics.length;n++)this.dynamics[n]instanceof _?e+=this.dynamics[n].toString()+this.statics[n+1]:Array.isArray(this.dynamics[n])?e+=ae(this.dynamics[n],"").toString()+this.statics[n+1]:typeof this.dynamics[n]=="object"?e+=this.parsedHtmlToString(this.dynamics[n])+this.statics[n+1]:e+=Ve(this.dynamics[n])+this.statics[n+1];return e}getParts(){let e={s:this.statics};for(let n=0;n<this.dynamics.length;n++)this.dynamics[n]instanceof _?e[n]=this.dynamics[n].getParts():Array.isArray(this.dynamics[n])?e[n]=ae(this.dynamics[n],"").getParts():this.dynamics[n]===void 0?e[n]=null:e[n]=this.dynamics[n];return e}parsedHtmlToString(e){var s;let n=e,i="";if(Array.isArray(n))return ae(n,"").toString();if(((s=n==null?void 0:n.s)==null?void 0:s.length)>0){let a=n.s.filter(r=>r!=null);i=n.s[0];for(let r=0;r<a.length-1;r++)typeof n[r]=="object"?i+=this.parsedHtmlToString(e[r])+n.s[r+1]:i+=Ve(e[r])+n.s[r+1]}return i}differentiate(e){let n=e.getParts(),i=this.getParts(),s=xe(i,n);return Ce(s)}patch(e){let n=se(this.getParts(),e);return _.parse(n)}};function ae(t,e){return t.length<=0?new _([""],[]):new _(["",...Array(t.length-1).fill(e),""],t)}function Ve(t){return t==null?"":t instanceof _?t.toString():Array.isArray(t)?ae(t,"").toString():String(t).replace(Pt,e=>Ge[e])}var It=(t,e)=>{let n=t.childNodes;for(let i=n.length-1;i>=e;i--)n[i].remove()};function Je(t,e){if(t instanceof Text&&e instanceof Text&&t.textContent!==e.textContent){t.replaceWith(e.cloneNode(!0));return}if(t instanceof Text&&e instanceof Element){t.replaceWith(e.cloneNode(!0));return}if(t instanceof Element&&e instanceof Text){t.replaceWith(e.cloneNode(!0));return}if(t.tagName!==e.tagName){t.replaceWith(e.cloneNode(!0));return}for(let i in e.attributes){let s=e.attributes[i];s&&s.name&&s.value&&(!t.hasAttribute(s.name)||t.getAttribute(s.name)!==s.value)&&t.setAttribute(s.name,s.value)}for(let i in t.attributes){let s=t.attributes[i];s&&s.name&&s.value&&(e.hasAttribute(s.name)?e.hasAttribute(s.name)&&e.getAttribute(s.name)!==s.value&&t.setAttribute(s.name,e.getAttribute(s.name)):t.removeAttribute(s.name))}let n=Math.max(t.childNodes.length,e.childNodes.length);for(let i=0;i<n;i++){let s=t.childNodes[i],a=e.childNodes[i];if(s&&a)Je(s,a);else{if(s)return It(t,i);a&&t.appendChild(a.cloneNode(!0))}}}function Be(t){let e=document.createElement("div"),n=document.getElementById("app");if(!n)throw new Error("App element not found");e.innerHTML=t.trim(),e.setAttribute("id","app"),Je(n,e)}var X,W,b,oe,Ke,Q,Le,Te=class{constructor(e,n,i){H(this,oe);H(this,Q);H(this,X,void 0);H(this,W,void 0);H(this,b,void 0);J(this,X,i),J(this,W,e),J(this,b,n)}get channel(){return R(this,W)}static connect(e,n,i){var l;let s=new qe.default("ws://localhost:3000/live");s.connect();let a=s.createChannel(`/${e}`,{address:window.location.toString()});a.join();let r=_.parse(i),o=new Te(a,r,e);return j(l=o,oe,Ke).call(l,n),o}async navigateTo(e,n=!0){let i={"Content-Type":"application/json",Accept:"application/json",["x-pond-live-router"]:"true",["x-pond-live-user-id"]:R(this,X)},s=await fetch(e,{headers:i,method:"GET",redirect:"follow",credentials:"same-origin"});if(n)try{let a=await s.json();j(this,Q,Le).call(this,a)}catch(a){console.error(a)}}},re=Te;X=new WeakMap,W=new WeakMap,b=new WeakMap,oe=new WeakSet,Ke=function(e){R(this,W).onMessage((n,i)=>{if(n==="update")j(this,Q,Le).call(this,i);else if(n==="live-event"){let{event:s,data:a}=i;p(s,a)}}),e.delegateEvent("a","click",async(n,i)=>{i.preventDefault();let a=n.href;p("navigate-start",{url:a}),await this.navigateTo(a),history.pushState(null,"",a),p("navigate-end",{url:a})})},Q=new WeakSet,Le=function(e){var n,i;if(e.diff&&(J(this,b,R(this,b).patch(e.diff)),Be(R(this,b).toString())),e["x-pond-live-page-title"]&&(document.title=e["x-pond-live-page-title"]),e["x-pond-live-router-action"])switch(e["x-pond-live-router-action"]){case"reload":window.location.reload();break;case"get-cookie":this.navigateTo((n=e.address)!=null?n:"",!1);break;case"update":break;case"navigate":this.navigateTo((i=e.address)!=null?i:"");break;default:break}};var ze=(t,e,n)=>{let i=new XMLHttpRequest;return i.open("POST",t),i.setRequestHeader("x-pond-live-router","true"),i.setRequestHeader("x-pond-live-user-id",e),i.onreadystatechange=()=>{if(i.readyState===4&&i.status===200){let s=JSON.parse(i.responseText);p("pond-upload-success",s,n)}else p("pond-upload-error",i.responseText,n)},i.onloadstart=()=>p("pond-upload-start",{}),i.onloadend=()=>p("pond-upload-end",{}),i.onprogress=s=>{s.lengthComputable&&p("pond-upload-progress",{progress:Math.round(s.loaded/s.total*100)},n)},i},Ze=(t,e="/")=>new Promise(n=>{if(t.isFile)t.file(s=>{let a=`${e}${s.name}`;n([{path:a,file:s}])});else if(t.isDirectory){let i=t,s=i.createReader(),a=[];s.readEntries(async r=>{for(let o=0;o<r.length;o++){let l=r[o],h=`${e}${i.name}/`,f=await Ze(l,h);a.push(...f)}n(a)})}}),Ft=t=>{let e=[];if(!t)return e;for(let n=0;n<t.length;n++)e.push({path:`/${t[n].name}`,file:t[n]});return e},Ot=t=>new Promise(async e=>{let n=[];for(let a=0;a<t.length;a++){let r=t[a].webkitGetAsEntry();r&&n.push(r)}let i=n.map(a=>Ze(a)),s=await Promise.all(i);e(s.flat())}),$e=t=>t.map(e=>({name:e.path,size:e.file.size,mimeType:e.file.type,path:e.path,file:e.file,lastModified:e.file.lastModified,lastModifiedDate:new Date(e.file.lastModified)}));async function Ut(t){if(t instanceof FileList)return $e(Ft(t));if(t instanceof DataTransferItemList){let e=await Ot(t);return $e(e)}return[]}function kt(t,e,n,i){let s=`${t.name}-${Math.random().toString(36).substring(2,15)}`,a=i(s,r=>{if(r.accepted||p("pond-upload-error",r.message),!r.route){p("pond-upload-error","No route provided");return}let o=ze(r.route,n,e),l=new FormData;l.append(t.path,t.file,t.name),o.send(l)});return G(V({},t),{file:t.file,unsubscribe:a,identifier:s})}async function x(t,e,n,i){let s=await Ut(t),a=s.map(l=>kt(l,e,n,i)),r=`${Math.random().toString(36).substring(2,15)}`;return i(r,l=>{if(l.accepted||p("pond-upload-error",l.message),!l.route){p("pond-upload-error","No route provided");return}a.forEach(N=>N.unsubscribe());let h=ze(l.route,n,e),f=new FormData;s.forEach(N=>f.append(N.path,N.file,N.name)),h.send(f)}),{files:a.map(l=>({name:l.path,size:l.file.size,mimeType:l.file.type,path:l.path,lastModified:l.file.lastModified,identifier:l.identifier,lastModifiedDate:new Date(l.file.lastModified)})),identifier:r}}var Wt=t=>{t("[pond-focus]","focus",(e,n)=>({value:null,dataId:n.getAttribute("pond-data-id")}))},xt=t=>{t("[pond-blur]","blur",(e,n)=>({value:null,dataId:n.getAttribute("pond-data-id")}))},Vt=t=>{t("[pond-change]","change",(e,n)=>{let i=e.target,s=n.getAttribute("pond-data-id");return{value:i.value,dataId:s}})},Gt=t=>{t("[pond-input]","input",(e,n)=>({value:null,dataId:n.getAttribute("pond-data-id")}))},Jt=t=>{t("[pond-submit]","submit",(e,n)=>{e.preventDefault();let i=n.querySelectorAll("input, select, textarea"),s={};return i.forEach((a,r)=>{s[a.getAttribute("name")||`${r}`]=a.value}),{value:null,formData:s,dataId:n.getAttribute("pond-data-id")}})},Bt=(t,e,n)=>{t("[pond-file]","change",async(i,s)=>{let r=s.files;return r?{value:null,files:await x(r,s,e,n)}:null})},Xe=(t,e,n)=>{Wt(t),xt(t),Vt(t),Gt(t),Jt(t),Bt(t,n,e)};var qt=t=>{t("[pond-keydown]","keydown",e=>({value:e.target.value}))},Kt=t=>{t("[pond-keyup]","keyup",e=>({value:e.target.value}))},$t=t=>{t("[pond-keypress]","keypress",e=>({value:e.target.value}))},Qe=t=>{qt(t),Kt(t),$t(t)};var zt=t=>{t("[pond-click]","click",()=>({value:null}))},Zt=t=>{t("[pond-mouseenter]","mouseenter",()=>({value:null}))},Xt=t=>{t("[pond-mouseleave]","mouseleave",()=>({value:null}))},Qt=t=>{t("[pond-mousemove]","mousemove",()=>({value:null}))},Yt=t=>{t("[pond-mousedown]","mousedown",()=>({value:null}))},jt=t=>{t("[pond-mouseup]","mouseup",()=>({value:null}))},en=t=>{t("[pond-double-click]","dblclick",()=>({value:null}))},tn=t=>{t("[pond-context-menu]","contextmenu",()=>({value:null}))},nn=t=>{t("[pond-drag-start]","dragstart",(e,n)=>{let i=n.getBoundingClientRect();return{value:null,dragData:{top:i.top,left:i.left,width:i.width,height:i.height}}})},sn=t=>{t("[pond-drag-end]","dragend",(e,n)=>{let i=n.getBoundingClientRect();return{value:null,dragData:{top:i.top,left:i.left,width:i.width,height:i.height}}})},an=t=>{t("[pond-drag-over]","dragover",(e,n)=>{let i=n.getBoundingClientRect();return{value:null,dragData:{top:i.top,left:i.left,width:i.width,height:i.height}}})},rn=t=>{t("[pond-drag-enter]","dragenter",(e,n)=>{let i=n.getBoundingClientRect();return{value:null,dragData:{top:i.top,left:i.left,width:i.width,height:i.height}}})},on=t=>{t("[pond-drag-leave]","dragleave",(e,n)=>{let i=n.getBoundingClientRect();return{value:null,dragData:{top:i.top,left:i.left,width:i.width,height:i.height}}})},ln=(t,e,n)=>{t("[pond-drop]","drop",async(i,s)=>{var h;i.preventDefault();let a=(h=i.dataTransfer)==null?void 0:h.items,r=s.getBoundingClientRect(),o={top:r.top,left:r.left,width:r.width,height:r.height},l;return a&&(l=await x(a,s,n,e)),{value:null,files:l,dragData:o}})},cn=(t,e,n)=>{t("[pond-upload]","submit",async(i,s)=>{i.preventDefault();let r=s.querySelector('input[type="file"]').files,o;return r&&(o=await x(r,s,n,e)),{value:null,files:o}})},dn=(t,e,n)=>{t("[pond-paste]","paste",async(i,s)=>{var l,h,f;i.preventDefault();let a=(l=i.clipboardData)==null?void 0:l.items,r=(f=(h=i.clipboardData)==null?void 0:h.getData("text/plain"))!=null?f:null,o;return a&&(o=await x(a,s,n,e)),{value:r,files:o}})},Ye=(t,e,n)=>{zt(t),Zt(t),Xt(t),Qt(t),Yt(t),jt(t),en(t),nn(t),sn(t),an(t),rn(t),on(t),tn(t),ln(t,e,n),cn(t,e,n),dn(t,e,n)};function je(t){return(e,n,i=!0)=>{let s=t.onMessage((a,r)=>{if(a===e)return i&&s(),n(r)});return s}}function et(t,e,n){let i=He(t,e),s=je(t);Qe(i),Xe(i,s,n),Ye(i,s,n)}var le=class{constructor(){this._modifiers={};let e=new MutationObserver(n=>{for(let i=0;i<n.length;i++){let s=n[i];switch(s.type){case"childList":for(let o=0;o<s.removedNodes.length;o++){let l=s.removedNodes[o];if(l instanceof HTMLElement){let h=l;for(let f in this._modifiers)h.matches(f)&&this._modifiers[f].forEach(we=>{we.onRemove&&we.onRemove(h,null,null)})}}for(let o=0;o<s.addedNodes.length;o++){let l=s.addedNodes[o];if(l instanceof HTMLElement){let h=l;this._addNewElement(h)}}break;case"attributes":let a=s.target,r=`[${s.attributeName}]`;for(let o in this._modifiers)if(r===o)if(s.oldValue===null){let l=this._modifiers[o],h=a.getAttribute(s.attributeName);l.forEach(f=>{f.onAdd&&f.onAdd(a,null,h)})}else{let l=this._modifiers[o],h=a.getAttribute(s.attributeName);l.forEach(f=>{h?f.onUpdated&&f.onUpdated(a,s.oldValue,h):f.onRemove&&f.onRemove(a,s.oldValue,null)})}break;default:break}}});e.observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeOldValue:!0}),this._observer=e}watch(e,n){let i=document.querySelectorAll(e);for(let a=0;a<i.length;a++){let r=i[a],o=r.getAttribute(e);n.onAdd&&n.onAdd(r,null,o)}let s=this._modifiers[e]||[];s.push(n),this._modifiers[e]=s}unwatch(e){delete this._modifiers[e]}isWatching(e){return!!this._modifiers[e]}addEventListener(e,n,i){this.watch(e,{onAdd:s=>{s.addEventListener(n,a=>{i(s,a)},{capture:!0})},onRemove:s=>{s.removeEventListener(n,a=>{i(s,a)},{capture:!0})}})}delegateEvent(e,n,i){document.body.addEventListener(n,s=>{let a=s.target;if(a.tagName.toLowerCase()===e.toLowerCase())return i(a,s);let r=a.parentElement;if(r&&r.tagName.toLowerCase()===e.toLowerCase())return i(r,s);let o=a.firstElementChild;if(o&&o.tagName.toLowerCase()===e.toLowerCase())return i(o,s)})}delegateSelectorEvent(e,n,i){document.body.addEventListener(n,s=>{let r=s.target.closest(e);if(r)return i(r,s)})}onAttributeChange(e,n){this.watch(e,{onAdd:n,onUpdated:n,onRemove:n})}shutdown(){for(let e in this._modifiers)this.unwatch(e);this._observer.disconnect()}_addNewElement(e){for(let n in this._modifiers)e.matches(n)&&this._modifiers[n].forEach(s=>{let a=e.getAttribute(n);s.onAdd&&s.onAdd(e,null,a)});for(let n=0;n<e.children.length;n++)this._addNewElement(e.children[n])}};window.onload=()=>{let t=window.__STATE__,e=window.__USER_ID__,n=new le,i=re.connect(e,n,t);Re(n),et(i.channel,n,e),p("pond-ready",{userId:e,router:i})};})();