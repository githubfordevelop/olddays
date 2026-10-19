"use strict";
// In-app tabs keep independent time coordinates and navigation histories.
let browserTabs=[{id:1,date:'2004-08-01',page:{type:'home'},history:[],cursor:-1}],activeTab=1,nextTab=2;
function saveTabState(){const tab=browserTabs.find(t=>t.id===activeTab);if(tab)Object.assign(tab,{date,page:{...current},history:history.map(h=>({date:h.date,page:{...h.page}})),cursor});}
function renderBrowserTabs(){
  $('#browser-tabs').innerHTML=browserTabs.map(t=>`<div class="browser-tab ${t.id===activeTab?'active':''}"><button data-switch-tab="${t.id}" aria-pressed="${t.id===activeTab}" title="${escapeHTML(t.page.name||'时光首页')} · ${t.date}">▧ ${escapeHTML(t.page.name||'时光首页')}</button><button data-close-tab="${t.id}" aria-label="关闭标签页 ${t.id}">×</button></div>`).join('')+'<button class="new-browser-tab" data-action="newtab" aria-label="新建标签页">＋</button>';
}
function switchBrowserTab(id){const tab=browserTabs.find(t=>t.id===Number(id));if(!tab)return;saveTabState();activeTab=tab.id;date=tab.date;history=tab.history.map(h=>({date:h.date,page:{...h.page}}));cursor=tab.cursor;navigate({...tab.page},false);}
function newBrowserTab(){if(browserTabs.length>=8)return toast('最多同时打开 8 个标签页');saveTabState();const tab={id:nextTab++,date,page:{type:'home'},history:[],cursor:-1};browserTabs.push(tab);switchBrowserTab(tab.id);navigate({type:'home'});}
function closeBrowserTab(id){if(browserTabs.length===1){navigate({type:'home'});return;}const index=browserTabs.findIndex(t=>t.id===Number(id));if(index<0)return;browserTabs.splice(index,1);if(activeTab===Number(id)){activeTab=-1;switchBrowserTab(browserTabs[Math.max(0,index-1)].id);}else renderBrowserTabs();}
function browserMenu(kind){
 const options={file:[['newtab','新建标签页',''],['home','打开时光首页',''],['favorites','收藏当前时间坐标 / 管理收藏',''],['close-tab','关闭当前标签页','']],view:[['refresh','刷新',''],['stop','停止加载',''],['history','浏览记录',''],['fullscreen','全屏显示','']],tools:[['settings','浏览器外观与阅读设置',''],['newscenter','年度新闻中心',''],['sources','历史资料来源','']]};
 dialog({file:'文件',view:'查看',tools:'工具'}[kind]||'浏览器菜单',`<div class="classic-menu">${(options[kind]||options.tools).map(([action,label])=>`<button data-browser-command="${action}">${label}</button>`).join('')}</div>`);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-switch-tab],[data-close-tab],[data-browser-command]');if(!b)return;e.preventDefault();if(b.dataset.switchTab)switchBrowserTab(Number(b.dataset.switchTab));else if(b.dataset.closeTab)closeBrowserTab(Number(b.dataset.closeTab));else {$('#modal').close();action(b.dataset.browserCommand);}});
