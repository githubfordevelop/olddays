"use strict";
const browserSkins={uc:'UC经典橙',opera:'Opera红黑',wap:'WAP蓝白'};
let handsetBrowserSkin='uc';
try{const saved=localStorage.getItem('olddays-browser-skin');if(Object.hasOwn(browserSkins,saved))handsetBrowserSkin=saved;}catch{}
for(const app of systemApps)if(app.id==='browser'){app.name='浏览器';app.icon='网';app.desc='地址、搜索、书签与年代换肤';}
for(const app of phoneApps)if(app[0]==='browser'){app[1]='浏览器';app[2]='网';}
const handsetBrowserBase=phoneUCMarkup;
phoneUCMarkup=function(){const source=handsetBrowserBase().replace('<section class="phone-uc">',`<section class="phone-uc browser-skin-${handsetBrowserSkin}">`).replace('<b>UC</b><span>优视浏览器','<b>网</b><span>浏览器').replace('退出UC回到手机桌面','退出浏览器回到手机桌面').replace('UC搜索站内内容','浏览器搜索站内内容');const settings=`<details class="handset-browser-settings"><summary>工具 / 年代画风</summary><fieldset><legend>浏览器皮肤</legend>${Object.entries(browserSkins).map(([id,label])=>`<button data-browser-skin="${id}" aria-pressed="${id===handsetBrowserSkin}">${label}</button>`).join('')}</fieldset><p>只更换界面，当前页面、搜索和案件进度保留。</p></details>`;return source.replace('<form data-uc-search',settings+'<form data-uc-search');};
const handsetWorkbenchBase=renderWorkbench;
renderWorkbench=function(){return `<div class="handset-mobile-tools"><button data-explore-toggle aria-expanded="false">☷ 应用与探索目录</button><button data-pocket-expand>⛶ 放大 / 退出</button><button data-phone-picker>换设备</button></div>`+handsetWorkbenchBase().replaceAll('UC 浏览器','浏览器').replace('>UC</b>','>网</b>');};
document.addEventListener('click',e=>{const b=e.target.closest('[data-browser-skin],[data-explore-toggle],[data-desk-open],[data-uc-open],[data-phone-app]');if(!b)return;if(b.dataset.browserSkin){if(!Object.hasOwn(browserSkins,b.dataset.browserSkin))return;handsetBrowserSkin=b.dataset.browserSkin;try{localStorage.setItem('olddays-browser-skin',handsetBrowserSkin);}catch{}const view=document.querySelector('#device-viewport'),top=view?.scrollTop||0;refreshPhone();if(view)view.scrollTop=top;return;}if(b.hasAttribute('data-explore-toggle')){const open=document.body.classList.toggle('exploration-open');b.setAttribute('aria-expanded',String(open));return;}document.body.classList.remove('exploration-open');document.querySelector('[data-explore-toggle]')?.setAttribute('aria-expanded','false');});

function phoneHardwareMarkup(){
 if(['nokia3310','nokia1100'].includes(phoneState.model))return `<div class="device-controls hardware-navi"><button class="navi-confirm" data-navi-confirm aria-label="Navi功能确认键">—</button><button class="navi-clear" data-navi-back aria-label="C清除返回键">C</button><div class="navi-scroll"><button data-phone-dir="up" aria-label="手机方向上">⌃</button><button data-phone-dir="down" aria-label="手机方向下">⌄</button></div></div>`;
 return `<div class="device-controls hardware-fiveway"><div class="hardware-side"><button data-phone-soft="left" aria-label="左功能键">—</button><button class="device-call" data-phone-app="sms" aria-label="打开短信">☎</button></div><div class="device-dpad"><button data-phone-dir="up" aria-label="手机方向上">▲</button><button data-phone-dir="left" aria-label="手机方向左">◀</button><button data-phone-ok aria-label="手机确认">●</button><button data-phone-dir="right" aria-label="手机方向右">▶</button><button data-phone-dir="down" aria-label="手机方向下">▼</button></div><div class="hardware-side"><button data-phone-soft="right" aria-label="右功能键">—</button><button class="device-end" data-phone-app="home" aria-label="返回手机首页">☎</button></div></div>`;
}

document.addEventListener('click',e=>{
 const b=e.target.closest('[data-navi-confirm],[data-navi-back]');if(!b)return;e.preventDefault();
 if(b.hasAttribute('data-navi-back')){if(phoneState.app==='sms'&&smsView!=='inbox'){smsView='inbox';return refreshPhone();}return phoneSelectApp('home');}
 if(phoneState.app==='home')return launchSystemApp(installedSystemApps()[systemHomeIndex]?.id);
 if(phoneState.app==='sms'){if(smsView==='compose')return sendSmsFromComposer();smsView='compose';return refreshPhone();}
 if(phoneState.app==='snake')return toggleSnake();
 if(phoneState.app==='calculator'){monoCalculatorKey('=');return refreshPhone();}
 const selected=document.querySelector('#device-viewport .hardware-selected');selected?.click();
});
