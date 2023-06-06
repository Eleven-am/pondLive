"use strict";(()=>{var Qe=Object.create;var oe=Object.defineProperty,Ye=Object.defineProperties,je=Object.getOwnPropertyDescriptor,et=Object.getOwnPropertyDescriptors,tt=Object.getOwnPropertyNames,Ce=Object.getOwnPropertySymbols,nt=Object.getPrototypeOf,Te=Object.prototype.hasOwnProperty,it=Object.prototype.propertyIsEnumerable;var Le=(t,e,n)=>e in t?oe(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,G=(t,e)=>{for(var n in e||(e={}))Te.call(e,n)&&Le(t,n,e[n]);if(Ce)for(var n of Ce(e))it.call(e,n)&&Le(t,n,e[n]);return t},J=(t,e)=>Ye(t,et(e));var Q=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports);var st=(t,e,n,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of tt(e))!Te.call(t,s)&&s!==n&&oe(t,s,{get:()=>e[s],enumerable:!(i=je(e,s))||i.enumerable});return t};var at=(t,e,n)=>(n=t!=null?Qe(nt(t)):{},st(e||!t||!t.__esModule?oe(n,"default",{value:t,enumerable:!0}):n,t));var le=(t,e,n)=>{if(!e.has(t))throw TypeError("Cannot "+n)};var H=(t,e,n)=>(le(t,e,"read from private field"),n?n.call(t):e.get(t)),M=(t,e,n)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,n)},B=(t,e,n,i)=>(le(t,e,"write to private field"),i?i.call(t,n):e.set(t,n),n);var Y=(t,e,n)=>(le(t,e,"access private method"),n);var ce=Q(p=>{"use strict";Object.defineProperty(p,"__esModule",{value:!0});p.Events=p.ChannelReceiver=p.SystemSender=p.ErrorTypes=p.ChannelState=p.ClientActions=p.ServerActions=p.PresenceEventTypes=void 0;var Et;(function(t){t.JOIN="JOIN",t.LEAVE="LEAVE",t.UPDATE="UPDATE"})(Et=p.PresenceEventTypes||(p.PresenceEventTypes={}));var vt;(function(t){t.PRESENCE="PRESENCE",t.SYSTEM="SYSTEM",t.BROADCAST="BROADCAST",t.ERROR="ERROR"})(vt=p.ServerActions||(p.ServerActions={}));var gt;(function(t){t.JOIN_CHANNEL="JOIN_CHANNEL",t.LEAVE_CHANNEL="LEAVE_CHANNEL",t.BROADCAST="BROADCAST"})(gt=p.ClientActions||(p.ClientActions={}));var _t;(function(t){t.IDLE="IDLE",t.JOINING="JOINING",t.JOINED="JOINED",t.STALLED="STALLED",t.CLOSED="CLOSED"})(_t=p.ChannelState||(p.ChannelState={}));var yt;(function(t){t.UNAUTHORIZED_CONNECTION="UNAUTHORIZED_CONNECTION",t.UNAUTHORIZED_JOIN_REQUEST="UNAUTHORIZED_JOIN_REQUEST",t.UNAUTHORIZED_BROADCAST="UNAUTHORIZED_BROADCAST",t.INVALID_MESSAGE="INVALID_MESSAGE",t.HANDLER_NOT_FOUND="HANDLER_NOT_FOUND",t.PRESENCE_ERROR="PRESENCE_ERROR",t.CHANNEL_ERROR="CHANNEL_ERROR",t.ENDPOINT_ERROR="ENDPOINT_ERROR",t.INTERNAL_SERVER_ERROR="INTERNAL_SERVER_ERROR"})(yt=p.ErrorTypes||(p.ErrorTypes={}));var Ct;(function(t){t.ENDPOINT="ENDPOINT",t.CHANNEL="CHANNEL"})(Ct=p.SystemSender||(p.SystemSender={}));var Lt;(function(t){t.ALL_USERS="ALL_USERS",t.ALL_EXCEPT_SENDER="ALL_EXCEPT_SENDER"})(Lt=p.ChannelReceiver||(p.ChannelReceiver={}));var Tt;(function(t){t.ACKNOWLEDGE="ACKNOWLEDGE"})(Tt=p.Events||(p.Events={}))});var he=Q(v=>{"use strict";var q=v&&v.__classPrivateFieldSet||function(t,e,n,i,s){if(i==="m")throw new TypeError("Private method is not writable");if(i==="a"&&!s)throw new TypeError("Private accessor was defined without a setter");if(typeof e=="function"?t!==e||!s:!e.has(t))throw new TypeError("Cannot write private member to an object whose class did not declare it");return i==="a"?s.call(t,n):s?s.value=n:e.set(t,n),n},_=v&&v.__classPrivateFieldGet||function(t,e,n,i){if(n==="a"&&!i)throw new TypeError("Private accessor was defined without a getter");if(typeof e=="function"?t!==e||!i:!e.has(t))throw new TypeError("Cannot read private member from an object whose class did not declare it");return n==="m"?i:n==="a"?i.call(t):i?i.value:e.get(t)},b,D,P,I;Object.defineProperty(v,"__esModule",{value:!0});v.BehaviorSubject=v.Subject=v.SimpleBehaviorSubject=v.SimpleSubject=void 0;var K=class{constructor(){b.set(this,void 0),q(this,b,new Set,"f")}subscribe(e){return _(this,b,"f").add(e),()=>_(this,b,"f").delete(e)}publish(e){_(this,b,"f").forEach(n=>n(e))}get size(){return _(this,b,"f").size}};v.SimpleSubject=K;b=new WeakMap;var de=class extends K{constructor(e){super(),D.set(this,void 0),q(this,D,e,"f")}get value(){return _(this,D,"f")}publish(e){q(this,D,e,"f"),super.publish(e)}subscribe(e){return _(this,D,"f")&&e(_(this,D,"f")),super.subscribe(e)}};v.SimpleBehaviorSubject=de;D=new WeakMap;var j=class extends K{constructor(){super(...arguments),P.set(this,{})}subscribeWith(e,n){_(this,P,"f")[e]=super.subscribe(n)}unsubscribe(e){var n,i;(i=(n=_(this,P,"f"))[e])===null||i===void 0||i.call(n),delete _(this,P,"f")[e]}has(e){return!!_(this,P,"f")[e]}};v.Subject=j;P=new WeakMap;var ue=class extends j{constructor(e){super(),I.set(this,void 0),q(this,I,e,"f")}subscribeWith(e,n){_(this,I,"f")&&n(_(this,I,"f")),super.subscribeWith(e,n)}publish(e){q(this,I,e,"f"),super.publish(e)}};v.BehaviorSubject=ue;I=new WeakMap});var He=Q(w=>{"use strict";var L=w&&w.__classPrivateFieldSet||function(t,e,n,i,s){if(i==="m")throw new TypeError("Private method is not writable");if(i==="a"&&!s)throw new TypeError("Private accessor was defined without a setter");if(typeof e=="function"?t!==e||!s:!e.has(t))throw new TypeError("Cannot write private member to an object whose class did not declare it");return i==="a"?s.call(t,n):s?s.value=n:e.set(t,n),n},l=w&&w.__classPrivateFieldGet||function(t,e,n,i){if(n==="a"&&!i)throw new TypeError("Private accessor was defined without a getter");if(typeof e=="function"?t!==e||!i:!e.has(t))throw new TypeError("Cannot read private member from an object whose class did not declare it");return n==="m"?i:n==="a"?i.call(t):i?i.value:e.get(t)},g,S,$,U,k,E,A,O,z,ee,te,pe,F,Re,Ae;Object.defineProperty(w,"__esModule",{value:!0});w.Channel=void 0;var h=ce(),Ne=he(),fe=class{constructor(e,n,i,s,a={}){g.add(this),S.set(this,void 0),$.set(this,void 0),U.set(this,void 0),k.set(this,void 0),E.set(this,void 0),A.set(this,void 0),O.set(this,void 0),z.set(this,void 0),ee.set(this,void 0),L(this,S,i,"f"),L(this,O,[],"f"),L(this,z,[],"f"),L(this,$,a,"f"),L(this,A,e,"f"),L(this,k,n,"f"),L(this,U,new Ne.SimpleSubject,"f"),L(this,E,new Ne.SimpleBehaviorSubject(h.ChannelState.IDLE),"f"),L(this,ee,l(this,g,"m",Re).call(this,s),"f")}join(){if(l(this,E,"f").value===h.ChannelState.CLOSED)throw new Error("This channel has been closed");let e={action:h.ClientActions.JOIN_CHANNEL,channelName:l(this,S,"f"),event:h.ClientActions.JOIN_CHANNEL,payload:l(this,$,"f")};l(this,E,"f").publish(h.ChannelState.JOINING),l(this,k,"f").value?l(this,A,"f").call(this,e):l(this,E,"f").publish(h.ChannelState.STALLED)}leave(){let e={action:h.ClientActions.LEAVE_CHANNEL,channelName:l(this,S,"f"),event:h.ClientActions.LEAVE_CHANNEL,payload:{}};l(this,g,"m",pe).call(this,e),l(this,E,"f").publish(h.ChannelState.CLOSED),l(this,ee,"f").call(this)}onMessage(e){return l(this,U,"f").subscribe(n=>{if(n.action!==h.ServerActions.PRESENCE)return e(n.event,n.payload)})}onMessageEvent(e,n){return this.onMessage((i,s)=>{if(i===e)return n(s)})}onChannelStateChange(e){return l(this,E,"f").subscribe(n=>{e(n)})}onJoin(e){return l(this,g,"m",F).call(this,(n,i)=>{if(n===h.PresenceEventTypes.JOIN)return e(i.changed)})}onLeave(e){return l(this,g,"m",F).call(this,(n,i)=>{if(n===h.PresenceEventTypes.LEAVE)return e(i.changed)})}onPresenceChange(e){return l(this,g,"m",F).call(this,(n,i)=>{if(n===h.PresenceEventTypes.UPDATE)return e(i)})}sendMessage(e,n,i){l(this,g,"m",te).call(this,e,n,i)}broadcastFrom(e,n){l(this,g,"m",te).call(this,e,n,h.ChannelReceiver.ALL_EXCEPT_SENDER)}broadcast(e,n){l(this,g,"m",te).call(this,e,n)}get channelState(){return l(this,E,"f").value}getPresence(){return l(this,z,"f")}onUsersChange(e){return l(this,g,"m",F).call(this,(n,i)=>e(i.presence))}isConnected(){return l(this,E,"f").value===h.ChannelState.JOINED||l(this,E,"f").value===h.ChannelState.STALLED}onConnectionChange(e){return this.onChannelStateChange(n=>{e(n===h.ChannelState.JOINED||n===h.ChannelState.STALLED)})}};w.Channel=fe;S=new WeakMap,$=new WeakMap,U=new WeakMap,k=new WeakMap,E=new WeakMap,A=new WeakMap,O=new WeakMap,z=new WeakMap,ee=new WeakMap,g=new WeakSet,te=function(e,n,i=h.ChannelReceiver.ALL_USERS){let s={action:h.ClientActions.BROADCAST,channelName:l(this,S,"f"),event:e,payload:n,addresses:i};l(this,g,"m",pe).call(this,s)},pe=function(e){if(l(this,k,"f").value){l(this,E,"f").value===h.ChannelState.JOINED&&l(this,A,"f").call(this,e);return}l(this,O,"f").push(e)},F=function(e){return l(this,U,"f").subscribe(n=>{if(n.action===h.ServerActions.PRESENCE)return e(n.event,n.payload)})},Re=function(e){let n=e.subscribe(a=>{a.channelName===l(this,S,"f")&&(a.event===h.Events.ACKNOWLEDGE?(l(this,E,"f").publish(h.ChannelState.JOINED),l(this,g,"m",Ae).call(this)):l(this,U,"f").publish(a))}),i=l(this,k,"f").subscribe(a=>{if(a&&l(this,E,"f").value===h.ChannelState.STALLED){let r={action:h.ClientActions.JOIN_CHANNEL,channelName:l(this,S,"f"),event:h.ClientActions.JOIN_CHANNEL,payload:l(this,$,"f")};l(this,A,"f").call(this,r)}else!a&&l(this,E,"f").value===h.ChannelState.JOINED&&l(this,E,"f").publish(h.ChannelState.STALLED)}),s=l(this,g,"m",F).call(this,(a,r)=>{L(this,z,r.presence,"f")});return()=>{n(),i(),s()}},Ae=function(){l(this,O,"f").filter(e=>e.action!==h.ClientActions.JOIN_CHANNEL).forEach(e=>{l(this,A,"f").call(this,e)}),l(this,E,"f").publish(h.ChannelState.JOINED),L(this,O,[],"f")}});var Oe=Q(N=>{"use strict";var Me=N&&N.__classPrivateFieldSet||function(t,e,n,i,s){if(i==="m")throw new TypeError("Private method is not writable");if(i==="a"&&!s)throw new TypeError("Private accessor was defined without a setter");if(typeof e=="function"?t!==e||!s:!e.has(t))throw new TypeError("Cannot write private member to an object whose class did not declare it");return i==="a"?s.call(t,n):s?s.value=n:e.set(t,n),n},W=N&&N.__classPrivateFieldGet||function(t,e,n,i){if(n==="a"&&!i)throw new TypeError("Private accessor was defined without a getter");if(typeof e=="function"?t!==e||!i:!e.has(t))throw new TypeError("Cannot read private member from an object whose class did not declare it");return n==="m"?i:n==="a"?i.call(t):i?i.value:e.get(t)},me,T,Ie;Object.defineProperty(N,"__esModule",{value:!0});var St=He(),wt=ce(),Pe=he(),Ee=class{constructor(e,n={}){me.add(this),T.set(this,void 0);let i;try{i=new URL(e)}catch(r){i=new URL(window.location.toString()),i.pathname=e}let s=new URLSearchParams(n);i.search=s.toString();let a=i.protocol==="https:"?"wss:":"ws:";i.protocol!=="wss:"&&i.protocol!=="ws:"&&(i.protocol=a),this._address=i,Me(this,T,{},"f"),this._broadcaster=new Pe.SimpleSubject,this._connectionState=new Pe.SimpleBehaviorSubject(!1)}connect(e=1){let n=new WebSocket(this._address.toString());n.onopen=()=>{this._connectionState.publish(!0)},n.onmessage=i=>{let s=JSON.parse(i.data);this._broadcaster.publish(s)},n.onerror=()=>{this._connectionState.publish(!1),setTimeout(()=>{this.connect(e*2)},e*1e3)},this._socket=n}getState(){return this._connectionState.value}disconnect(){var e;Object.values(W(this,T,"f")).forEach(n=>n.leave()),(e=this._socket)===null||e===void 0||e.close(),Me(this,T,{},"f")}createChannel(e,n){if(W(this,T,"f")[e]&&W(this,T,"f")[e].channelState!==wt.ChannelState.CLOSED)return W(this,T,"f")[e];let i=W(this,me,"m",Ie).call(this),s=new St.Channel(i,this._connectionState,e,this._broadcaster,n);return W(this,T,"f")[e]=s,s}onConnectionChange(e){return this._connectionState.subscribe(e)}};N.default=Ee;T=new WeakMap,me=new WeakSet,Ie=function(){return e=>{this._connectionState.value&&this._socket.send(JSON.stringify(e))}}});var f=(t,e,n)=>{let i=new CustomEvent(t,{detail:e,bubbles:!0,cancelable:!0});n?n.dispatchEvent(i):window.dispatchEvent(i)},Se=(t,e,n)=>{t.broadcastFrom("event",n)},we=(t,e,n)=>{t.broadcastFrom(e,n)};var rt=t=>{t.onAttributeChange("[pond-value]",(e,n,i)=>{let s=e;s.value=i||""})},ot=t=>{t.onAttributeChange("[pond-checked]",(e,n,i)=>{let s=e;s.checked=i==="true"})},lt=t=>{t.onAttributeChange("[pond-disabled]",(e,n,i)=>{let s=e;s.disabled=i==="true"})},ct=t=>{t.onAttributeChange("[pond-hidden]",(e,n,i)=>{let s=e;s.hidden=i==="true"})},dt=t=>{t.onAttributeChange("[pond-readonly]",(e,n,i)=>{let s=e;s.readOnly=i==="true"})},ut=t=>{t.onAttributeChange("[pond-required]",(e,n,i)=>{let s=e;s.required=i==="true"})},ht=t=>{t.onAttributeChange("[pond-focused]",(e,n,i)=>{let s=e;i==="true"?s.focus():s.blur()})},pt=t=>{t.onAttributeChange("[pond-copy]",(e,n,i)=>{let s=e;s.value=i||"",navigator.clipboard.writeText(s.value).catch(console.error)})},ft=t=>{t.onAttributeChange("[pond-emit]",(e,n,i)=>{try{let s=JSON.parse(i||"{}");f("pond-emit",s,e)}catch(s){f("pond-emit",i,e)}})},be=t=>{rt(t),ot(t),lt(t),ct(t),dt(t),ut(t),ht(t),ft(t),pt(t)};var mt=async(t,e,n,i,s)=>{s.preventDefault();let a=e.replace(/[\[\].#]/g,""),r=i.getAttribute(a),d=i.getAttribute("pond-data-id");if(r){let o=await n(s,i,r);o&&(o.event?we(t,o.event,J(G({},o),{dataId:d,action:r,address:window.location.toString()})):Se(t,"event",J(G({},o),{dataId:d,action:r,address:window.location.toString()})))}},De=(t,e)=>(n,i,s)=>{e.addEventListener(n,i,async(a,r)=>{await mt(t,n,s,a,r)})};var Ve=at(Oe());var Fe=(t,e)=>{let n=c=>Object.prototype.toString.call(c)==="[object Function]",i=c=>Object.prototype.toString.call(c)==="[object Array]",s=c=>Object.prototype.toString.call(c)==="[object Date]",a=c=>Object.prototype.toString.call(c)==="[object Object]",r=c=>!a(c)&&!i(c),d=(c,u)=>c===u||s(c)&&s(u)&&c.getTime()===u.getTime()?"unchanged":c===void 0?"created":u===void 0?"deleted":"updated",o=(c,u)=>{if(n(c)||n(u))throw new Error("Invalid argument. Function given, object expected.");if(r(c)||r(u)){let m=d(c,u);return m==="updated"?{type:m,data:u}:{type:m,data:c===void 0?u:c}}let C={};for(let m in c){if(n(c[m]))continue;let ye;u[m]!==void 0&&(ye=u[m]),C[m]=o(c[m],ye)}for(let m in u)n(u[m])||C[m]!==void 0||(C[m]=o(void 0,u[m]));return C};return o(t,e)},ve=t=>{let e={};for(let n in t)if(t[n]){if(t[n].type==="created"||t[n].type==="updated")e[n]=t[n].data;else if(t[n].type==="deleted")e[n]=null;else if(typeof t[n]=="object"){let i=ve(t[n]);i&&Object.keys(i).length>0&&(e[n]=i)}}return e};function bt(t,e){let n=t.map((i,s)=>e[s]!==void 0&&e[s]!==null?ne(i,e[s]):i);for(let i in e)n[i]===void 0&&(n[i]=e[i]);return n}function Dt(t,e){let n={};for(let i in t)e[i]!==void 0&&e[i]!==null?t[i]instanceof Object?n[i]=ne(t[i],e[i]):n[i]=e[i]:n[i]=t[i];for(let i in e)n[i]===void 0&&(n[i]=e[i]);return n}var ne=(t,e)=>t===void 0?e:e===void 0?t:typeof t!="object"&&typeof e!="object"?e:Array.isArray(t)?bt(t,e):Dt(t,e);var ke={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"},At=new RegExp(Object.keys(ke).join("|"),"g"),y=class{constructor(e,n){this.statics=e,this.dynamics=n}static parse(e){let n=e,i=n.s||[""];delete n.s;let s=Object.values(n).filter(a=>a!=null);return new y(i,s)}toString(){let e=this.statics[0];for(let n=0;n<this.dynamics.length;n++)this.dynamics[n]instanceof y?e+=this.dynamics[n].toString()+this.statics[n+1]:Array.isArray(this.dynamics[n])?e+=ie(this.dynamics[n],"").toString()+this.statics[n+1]:typeof this.dynamics[n]=="object"?e+=this.parsedHtmlToString(this.dynamics[n])+this.statics[n+1]:e+=Ue(this.dynamics[n])+this.statics[n+1];return e}getParts(){let e={s:this.statics};for(let n=0;n<this.dynamics.length;n++)this.dynamics[n]instanceof y?e[n]=this.dynamics[n].getParts():Array.isArray(this.dynamics[n])?e[n]=ie(this.dynamics[n],"").getParts():this.dynamics[n]===void 0?e[n]=null:e[n]=this.dynamics[n];return e}parsedHtmlToString(e){var s;let n=e,i="";if(Array.isArray(n))return ie(n,"").toString();if(((s=n==null?void 0:n.s)==null?void 0:s.length)>0){let a=n.s.filter(r=>r!=null);i=n.s[0];for(let r=0;r<a.length-1;r++)typeof n[r]=="object"?i+=this.parsedHtmlToString(e[r])+n.s[r+1]:i+=Ue(e[r])+n.s[r+1]}return i}differentiate(e){let n=e.getParts(),i=this.getParts(),s=Fe(i,n);return ve(s)}reconstruct(e){let n=ne(this.getParts(),e);return y.parse(n)}};function ie(t,e){return t.length<=0?new y([""],[]):new y(["",...Array(t.length-1).fill(e),""],t)}function Ue(t){return t==null?"":t instanceof y?t.toString():Array.isArray(t)?ie(t,"").toString():String(t).replace(At,e=>ke[e])}var Nt=(t,e)=>{let n=t.childNodes;for(let i=n.length-1;i>=e;i--)n[i].remove()};function We(t,e){if(t instanceof Text&&e instanceof Text&&t.textContent!==e.textContent){t.replaceWith(e.cloneNode(!0));return}if(t instanceof Text&&e instanceof Element){t.replaceWith(e.cloneNode(!0));return}if(t instanceof Element&&e instanceof Text){t.replaceWith(e.cloneNode(!0));return}if(t.tagName!==e.tagName){t.replaceWith(e.cloneNode(!0));return}for(let i in e.attributes){let s=e.attributes[i];s&&s.name&&s.value&&(!t.hasAttribute(s.name)||t.getAttribute(s.name)!==s.value)&&t.setAttribute(s.name,s.value)}for(let i in t.attributes){let s=t.attributes[i];s&&s.name&&s.value&&(e.hasAttribute(s.name)?e.hasAttribute(s.name)&&e.getAttribute(s.name)!==s.value&&t.setAttribute(s.name,e.getAttribute(s.name)):t.removeAttribute(s.name))}let n=Math.max(t.childNodes.length,e.childNodes.length);for(let i=0;i<n;i++){let s=t.childNodes[i],a=e.childNodes[i];if(s&&a)We(s,a);else{if(s)return Nt(t,i);a&&t.appendChild(a.cloneNode(!0))}}}function xe(t){let e=document.createElement("div"),n=document.getElementById("app");if(!n)throw new Error("App element not found");e.innerHTML=t.trim(),e.setAttribute("id","app"),We(n,e)}var Z,x,R,ae,Ge,X,ge,_e=class{constructor(e,n,i){M(this,ae);M(this,X);M(this,Z,void 0);M(this,x,void 0);M(this,R,void 0);B(this,Z,i),B(this,x,e),B(this,R,n)}get channel(){return H(this,x)}static connect(e,n,i){var o;let s=new Ve.default("ws://localhost:3000/live");s.connect();let a=s.createChannel(`/${e}`,{address:window.location.toString()});a.join();let r=y.parse(i),d=new _e(a,r,e);return Y(o=d,ae,Ge).call(o,n),d}async navigateTo(e,n=!0){let i={"Content-Type":"application/json",Accept:"application/json",["x-pond-live-router"]:"true",["x-pond-live-user-id"]:H(this,Z)},s=await fetch(e,{headers:i,method:"GET",redirect:"follow",credentials:"same-origin"});if(n)try{let a=await s.json();Y(this,X,ge).call(this,a)}catch(a){console.error(a)}}},se=_e;Z=new WeakMap,x=new WeakMap,R=new WeakMap,ae=new WeakSet,Ge=function(e){H(this,x).onMessage((n,i)=>{if(n==="update")Y(this,X,ge).call(this,i);else if(n==="live-event"){let{event:s,data:a}=i;f(s,a)}}),e.delegateEvent("a","click",async(n,i)=>{i.preventDefault();let a=n.href;f("navigate-start",{url:a}),await this.navigateTo(a),history.pushState(null,"",a),f("navigate-end",{url:a})})},X=new WeakSet,ge=function(e){var n,i;if(e.diff&&(B(this,R,H(this,R).reconstruct(e.diff)),xe(H(this,R).toString())),e["x-pond-live-page-title"]&&(document.title=e["x-pond-live-page-title"]),e["x-pond-live-router-action"])switch(e["x-pond-live-router-action"]){case"reload":window.location.reload();break;case"get-cookie":this.navigateTo((n=e.address)!=null?n:"",!1);break;case"update":break;case"navigate":this.navigateTo((i=e.address)!=null?i:"");break;default:break}};var Be=(t,e,n)=>{let i=new XMLHttpRequest;return i.open("POST",t),i.setRequestHeader("x-pond-live-router","true"),i.setRequestHeader("x-pond-live-user-id",e),i.onreadystatechange=()=>{if(i.readyState===4&&i.status===200){let s=JSON.parse(i.responseText);f("pond-upload-success",s,n)}else f("pond-upload-error",i.responseText,n)},i.onloadstart=()=>f("pond-upload-start",{}),i.onloadend=()=>f("pond-upload-end",{}),i.onprogress=s=>{s.lengthComputable&&f("pond-upload-progress",{progress:Math.round(s.loaded/s.total*100)},n)},i},qe=(t,e="/")=>new Promise(n=>{if(t.isFile)t.file(s=>{let a=`${e}${s.name}`;n([{path:a,file:s}])});else if(t.isDirectory){let i=t,s=i.createReader(),a=[];s.readEntries(async r=>{for(let d=0;d<r.length;d++){let o=r[d],c=`${e}${i.name}/`,u=await qe(o,c);a.push(...u)}n(a)})}}),Rt=t=>{let e=[];if(!t)return e;for(let n=0;n<t.length;n++)e.push({path:`/${t[n].name}`,file:t[n]});return e},Ht=t=>new Promise(async e=>{let n=[];for(let a=0;a<t.length;a++){let r=t[a].webkitGetAsEntry();r&&n.push(r)}let i=n.map(a=>qe(a)),s=await Promise.all(i);e(s.flat())}),Je=t=>t.map(e=>({name:e.path,size:e.file.size,mimeType:e.file.type,path:e.path,file:e.file,lastModified:e.file.lastModified,lastModifiedDate:new Date(e.file.lastModified)}));async function Mt(t){if(t instanceof FileList)return Je(Rt(t));if(t instanceof DataTransferItemList){let e=await Ht(t);return Je(e)}return[]}function Pt(t,e,n,i){let s=`${t.name}-${Math.random().toString(36).substring(2,15)}`,a=i(s,r=>{if(r.accepted||f("pond-upload-error",r.message),!r.route){f("pond-upload-error","No route provided");return}let d=Be(r.route,n,e),o=new FormData;o.append(t.path,t.file,t.name),d.send(o)});return J(G({},t),{file:t.file,unsubscribe:a,identifier:s})}async function V(t,e,n,i){let s=await Mt(t),a=s.map(o=>Pt(o,e,n,i)),r=`${Math.random().toString(36).substring(2,15)}`;return i(r,o=>{if(o.accepted||f("pond-upload-error",o.message),!o.route){f("pond-upload-error","No route provided");return}a.forEach(C=>C.unsubscribe());let c=Be(o.route,n,e),u=new FormData;s.forEach(C=>u.append(C.path,C.file,C.name)),c.send(u)}),{files:a.map(o=>({name:o.path,size:o.file.size,mimeType:o.file.type,path:o.path,lastModified:o.file.lastModified,identifier:o.identifier,lastModifiedDate:new Date(o.file.lastModified)})),identifier:r}}var It=t=>{t("[pond-focus]","focus",(e,n)=>({value:null,dataId:n.getAttribute("pond-data-id")}))},Ot=t=>{t("[pond-blur]","blur",(e,n)=>({value:null,dataId:n.getAttribute("pond-data-id")}))},Ft=t=>{t("[pond-change]","change",(e,n)=>{let i=e.target,s=n.getAttribute("pond-data-id");return{value:i.value,dataId:s}})},Ut=t=>{t("[pond-input]","input",(e,n)=>({value:null,dataId:n.getAttribute("pond-data-id")}))},kt=t=>{t("[pond-submit]","submit",(e,n)=>{e.preventDefault();let i=n.querySelectorAll("input, select, textarea"),s={};return i.forEach((a,r)=>{s[a.getAttribute("name")||`${r}`]=a.value}),{value:null,formData:s,dataId:n.getAttribute("pond-data-id")}})},Wt=(t,e,n)=>{t("[pond-file]","change",async(i,s)=>{let r=s.files;return r?{value:null,files:await V(r,s,e,n)}:null})},Ke=(t,e,n)=>{It(t),Ot(t),Ft(t),Ut(t),kt(t),Wt(t,n,e)};var xt=t=>{t("[pond-keydown]","keydown",e=>({value:e.target.value}))},Vt=t=>{t("[pond-keyup]","keyup",e=>({value:e.target.value}))},Gt=t=>{t("[pond-keypress]","keypress",e=>({value:e.target.value}))},$e=t=>{xt(t),Vt(t),Gt(t)};var Jt=t=>{t("[pond-click]","click",()=>({value:null}))},Bt=t=>{t("[pond-mouseenter]","mouseenter",()=>({value:null}))},qt=t=>{t("[pond-mouseleave]","mouseleave",()=>({value:null}))},Kt=t=>{t("[pond-mousemove]","mousemove",()=>({value:null}))},$t=t=>{t("[pond-mousedown]","mousedown",()=>({value:null}))},zt=t=>{t("[pond-mouseup]","mouseup",()=>({value:null}))},Zt=t=>{t("[pond-double-click]","dblclick",()=>({value:null}))},Xt=t=>{t("[pond-context-menu]","contextmenu",()=>({value:null}))},Qt=t=>{t("[pond-drag-start]","dragstart",(e,n)=>{let i=n.getBoundingClientRect();return{value:null,dragData:{top:i.top,left:i.left,width:i.width,height:i.height}}})},Yt=t=>{t("[pond-drag-end]","dragend",(e,n)=>{let i=n.getBoundingClientRect();return{value:null,dragData:{top:i.top,left:i.left,width:i.width,height:i.height}}})},jt=t=>{t("[pond-drag-over]","dragover",(e,n)=>{let i=n.getBoundingClientRect();return{value:null,dragData:{top:i.top,left:i.left,width:i.width,height:i.height}}})},en=t=>{t("[pond-drag-enter]","dragenter",(e,n)=>{let i=n.getBoundingClientRect();return{value:null,dragData:{top:i.top,left:i.left,width:i.width,height:i.height}}})},tn=t=>{t("[pond-drag-leave]","dragleave",(e,n)=>{let i=n.getBoundingClientRect();return{value:null,dragData:{top:i.top,left:i.left,width:i.width,height:i.height}}})},nn=(t,e,n)=>{t("[pond-drop]","drop",async(i,s)=>{var c;i.preventDefault();let a=(c=i.dataTransfer)==null?void 0:c.items,r=s.getBoundingClientRect(),d={top:r.top,left:r.left,width:r.width,height:r.height},o;return a&&(o=await V(a,s,n,e)),{value:null,files:o,dragData:d}})},sn=(t,e,n)=>{t("[pond-upload]","submit",async(i,s)=>{i.preventDefault();let r=s.querySelector('input[type="file"]').files,d;return r&&(d=await V(r,s,n,e)),{value:null,files:d}})},an=(t,e,n)=>{t("[pond-paste]","paste",async(i,s)=>{var o,c,u;i.preventDefault();let a=(o=i.clipboardData)==null?void 0:o.items,r=(u=(c=i.clipboardData)==null?void 0:c.getData("text/plain"))!=null?u:null,d;return a&&(d=await V(a,s,n,e)),{value:r,files:d}})},ze=(t,e,n)=>{Jt(t),Bt(t),qt(t),Kt(t),$t(t),zt(t),Zt(t),Qt(t),Yt(t),jt(t),en(t),tn(t),Xt(t),nn(t,e,n),sn(t,e,n),an(t,e,n)};function Ze(t){return(e,n,i=!0)=>{let s=t.onMessage((a,r)=>{if(a===e)return i&&s(),n(r)});return s}}function Xe(t,e,n){let i=De(t,e),s=Ze(t);$e(i),Ke(i,s,n),ze(i,s,n)}var re=class{constructor(){this._modifiers={};let e=new MutationObserver(n=>{for(let i=0;i<n.length;i++){let s=n[i];switch(s.type){case"childList":for(let d=0;d<s.removedNodes.length;d++){let o=s.removedNodes[d];if(o instanceof HTMLElement){let c=o;for(let u in this._modifiers)c.matches(u)&&this._modifiers[u].forEach(m=>{m.onRemove&&m.onRemove(c,null,null)})}}for(let d=0;d<s.addedNodes.length;d++){let o=s.addedNodes[d];if(o instanceof HTMLElement){let c=o;this._addNewElement(c)}}break;case"attributes":let a=s.target,r=`[${s.attributeName}]`;for(let d in this._modifiers)if(r===d)if(s.oldValue===null){let o=this._modifiers[d],c=a.getAttribute(s.attributeName);o.forEach(u=>{u.onAdd&&u.onAdd(a,null,c)})}else{let o=this._modifiers[d],c=a.getAttribute(s.attributeName);o.forEach(u=>{c?u.onUpdated&&u.onUpdated(a,s.oldValue,c):u.onRemove&&u.onRemove(a,s.oldValue,null)})}break;default:break}}});e.observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeOldValue:!0}),this._observer=e}watch(e,n){let i=document.querySelectorAll(e);for(let a=0;a<i.length;a++){let r=i[a],d=r.getAttribute(e);n.onAdd&&n.onAdd(r,null,d)}let s=this._modifiers[e]||[];s.push(n),this._modifiers[e]=s}unwatch(e){delete this._modifiers[e]}isWatching(e){return!!this._modifiers[e]}addEventListener(e,n,i){this.watch(e,{onAdd:s=>{s.addEventListener(n,a=>{i(s,a)},{capture:!0})},onRemove:s=>{s.removeEventListener(n,a=>{i(s,a)},{capture:!0})}})}delegateEvent(e,n,i){document.body.addEventListener(n,s=>{let a=s.target;if(a.tagName.toLowerCase()===e.toLowerCase())return i(a,s);let r=a.parentElement;if(r&&r.tagName.toLowerCase()===e.toLowerCase())return i(r,s);let d=a.firstElementChild;if(d&&d.tagName.toLowerCase()===e.toLowerCase())return i(d,s)})}delegateSelectorEvent(e,n,i){document.body.addEventListener(n,s=>{let r=s.target.closest(e);if(r)return i(r,s)})}onAttributeChange(e,n){this.watch(e,{onAdd:n,onUpdated:n,onRemove:n})}shutdown(){for(let e in this._modifiers)this.unwatch(e);this._observer.disconnect()}_addNewElement(e){for(let n in this._modifiers)e.matches(n)&&this._modifiers[n].forEach(s=>{let a=e.getAttribute(n);s.onAdd&&s.onAdd(e,null,a)});for(let n=0;n<e.children.length;n++)this._addNewElement(e.children[n])}};window.onload=()=>{let t=window.__STATE__,e=window.__USER_ID__,n=new re,i=se.connect(e,n,t);be(n),Xe(i.channel,n,e),f("pond-ready",{userId:e,router:i})};})();
