/* Portable local fiction saves. No account data or emulator databases. */
const saveBoxKeys = Object.freeze({
  'archaeo-phone-lab':'object','olddays-system-apps':'array','olddays-dreamnet-game':'object',
  'olddays-mystery-01':'object','olddays-campus-case-02':'object','olddays-tide-v1':'object',
  'olddays-pocket-anime':'object','olddays-arcade-save':'object','olddays-discoveries':'array',
  'olddays-support-applause':'number','olddays-qq-demo':'object','olddays-memory-stamps':'array',
  'olddays-visit-mode':'mode','olddays-selected-date':'date'
});
let saveBoxPending=null,saveBoxRead=0;
const saveBoxFields={
 'olddays-dreamnet-game':{balance:'integer',month:'integer',purchases:'object',subscriptions:'object',ledger:'array',messages:'array'},
 'olddays-campus-case-02':{evidence:'array',started:'boolean',solved:'boolean'},
 'olddays-mystery-01':{evidence:'array',started:'boolean',solved:'boolean'},
 'olddays-tide-v1':{seen:'array',notebooks:'object',active:'boolean',solved:'boolean'},
 'olddays-pocket-anime':{collection:'array',notes:'object'},
 'archaeo-phone-lab':{sent:'array'},
 'olddays-arcade-save':{lights:'array',slideTiles:'array',memoryCards:'array'}
};
function saveBoxValidate(input){
  if(typeof input!=='string'||input.length>1000000)throw Error('文件太大，或不是文本存档。');
  let data;try{data=JSON.parse(input);}catch{throw Error('无法读取 JSON 存档。');}
  if(data?.format!=='olddays-save'||data.version!==1||!data.entries||Array.isArray(data.entries)||typeof data.entries!=='object')throw Error('这不是受支持的旧日存档。');
  const entries={};
  for(const [key,raw] of Object.entries(data.entries)){
    if(!Object.hasOwn(saveBoxKeys,key))throw Error('存档包含未知项目，请使用旧日导出的文件。');
    if(typeof raw!=='string'||raw.length>200000)throw Error('存档项目损坏或过大。');
    const type=saveBoxKeys[key];
    if(type==='date'){if(!/^\d{4}-\d{2}-\d{2}$/.test(raw)||raw<'1996-01-01'||raw>'2025-12-31'||Number.isNaN(Date.parse(raw+'T12:00:00Z'))||new Date(raw+'T12:00:00Z').toISOString().slice(0,10)!==raw)throw Error('存档日期无效。');}
    else if(type==='mode'){if(!['pc','phone'].includes(raw))throw Error('显示模式损坏。');}
    else {
      let value;try{value=JSON.parse(raw);}catch{throw Error('存档项目不是有效 JSON。');}
      if(type==='array'&&!Array.isArray(value)||type==='object'&&(!value||Array.isArray(value)||typeof value!=='object')||type==='number'&&(!Number.isSafeInteger(value)||value<0))throw Error('存档项目类型不符。');
      for(const [field,kind]of Object.entries(saveBoxFields[key]||{})){if(!Object.hasOwn(value,field))continue;const v=value[field];if(kind==='array'?!Array.isArray(v):kind==='object'?(!v||Array.isArray(v)||typeof v!=='object'):kind==='integer'?(!Number.isSafeInteger(v)||v<0):typeof v!==kind)throw Error('存档字段损坏：'+field);}
      const inspect=(v,depth=0)=>{if(depth>20)throw Error('存档结构过深。');if(v&&typeof v==='object')for(const [k,item]of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(k))throw Error('存档含不安全字段。');inspect(item,depth+1);}};inspect(value);
    }
    entries[key]=raw;
  }
  if(!Object.keys(entries).length)throw Error('存档中没有可恢复的进度。');
  return {format:'olddays-save',version:1,createdAt:typeof data.createdAt==='string'?data.createdAt.slice(0,40):'',entries};
}
function saveBoxExport(){
  const entries={};for(const key of Object.keys(saveBoxKeys)){const raw=localStorage.getItem(key);if(raw!==null)entries[key]=raw;}
  return JSON.stringify({format:'olddays-save',version:1,createdAt:new Date().toISOString(),entries},null,2);
}
function saveBoxRestore(data){
  const checked=saveBoxValidate(JSON.stringify(data)),before={};
  for(const key of Object.keys(saveBoxKeys))before[key]=localStorage.getItem(key);
  try{for(const key of Object.keys(saveBoxKeys)){if(Object.hasOwn(checked.entries,key))localStorage.setItem(key,checked.entries[key]);else localStorage.removeItem(key);}}
  catch(error){for(const [key,raw]of Object.entries(before)){try{if(raw===null)localStorage.removeItem(key);else localStorage.setItem(key,raw);}catch{}}throw Error('存储空间不足或写入失败，已尝试恢复原进度；请先导出当前备份。');}
}
function saveBoxSummary(data){
  const e=data.entries,read=k=>{try{return JSON.parse(e[k]||'null');}catch{return null;}};
  const wallet=read('olddays-dreamnet-game'),campus=read('olddays-campus-case-02'),t=read('olddays-tide-v1'),anime=read('olddays-pocket-anime');
  return `${Object.keys(e).length} 项本机记录 · 年代 ${e['olddays-selected-date']||'旧备份未记录'} · 虚拟话费 ${Number.isFinite(wallet?.balance)?(wallet.balance/100).toFixed(2)+' 元':'未记录'} · 校园故事${campus?.solved?'已完成':campus?.started?'进行中':'未开始'} · 潮声${t?.solved?'已完成':t?.active?'进行中':'已收藏或未开始'} · 动漫收藏 ${Array.isArray(anime?.collection)?anime.collection.length:0} 项`;
}
function saveBoxOpen(){
  saveBoxPending=null;saveBoxRead++;
  let dialog=document.getElementById('save-box');
  if(!dialog){dialog=document.createElement('dialog');dialog.id='save-box';dialog.className='save-box';document.body.append(dialog);}
  dialog.innerHTML=`<form method="dialog"><button class="save-box-close" aria-label="关闭存档盒">×</button></form><small>旧日收藏 / 本机存档</small><h2>把这些日子带走</h2><p>备份所选年代、收藏手机、故事、动漫收藏、小游戏与虚拟话费。仅限本游戏的本机记录，不含 Java 模拟器内部进度、网页历史与系统文件。</p><button data-save-export>下载当前存档</button><label class="save-box-file">选择存档文件<input type="file" accept=".json,application/json" data-save-import></label><p data-save-feedback role="status">恢复会替换上述项目，建议先下载当前存档。</p><button data-save-confirm hidden>确认替换进度并重新打开</button>`;
  dialog.showModal();
}
const saveBoxEntranceBase=renderPhoneEntrance,saveBoxWorkbenchBase=renderWorkbench;
function saveBoxButton(){return '<button class="save-box-entry" data-save-open>▣ 存档盒</button>';}
renderPhoneEntrance=function(){return saveBoxButton()+saveBoxEntranceBase();};
renderWorkbench=function(){return saveBoxButton()+saveBoxWorkbenchBase();};
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-save-open],[data-save-export],[data-save-confirm]');if(!b)return;e.preventDefault();
  if(b.hasAttribute('data-save-open'))return saveBoxOpen();
  const status=document.querySelector('[data-save-feedback]');
  try{
    if(b.hasAttribute('data-save-export')){const text=saveBoxExport();saveBoxValidate(text);const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`olddays-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='已生成下载文件，请保管好这份本机记录。';}
    else if(saveBoxPending){saveBoxRestore(saveBoxPending);location.reload();}
  }catch(error){status.textContent=error.message;}
});
document.addEventListener('change',async e=>{
  if(!e.target.matches('[data-save-import]'))return;
  saveBoxPending=null;const read=++saveBoxRead;const button=document.querySelector('[data-save-confirm]'),status=document.querySelector('[data-save-feedback]');button.hidden=true;
  try{const file=e.target.files?.[0];if(!file)return;if(file.size>1000000)throw Error('存档超过 1 MB，请选择旧日导出的 JSON 文件。');const text=await file.text();if(read!==saveBoxRead)return;saveBoxPending=saveBoxValidate(text);status.textContent=saveBoxSummary(saveBoxPending)+'。确认后将替换当前进度。';button.hidden=false;}
  catch(error){status.textContent=error.message;}
});
