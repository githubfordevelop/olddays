import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
function catalog(){const context=vm.createContext({document:{addEventListener(){}},year:()=>context.selectedYear,selectedYear:'2004',escapeHTML:s=>String(s).replaceAll('<','&lt;'),siteLink:(n,u)=>`<a href="${u}">${n}</a>`,encodeURIComponent,eraFilms:[],salonNav:()=>'',eraAdvertMarkup:()=>'',posterStrip:()=>''});vm.runInContext(readFileSync('dist/media-salon.js','utf8'),context);return context;}
test('historical video sites respect launch eras including the MikuFans transition',()=>{const c=catalog();let html=vm.runInContext('videoStationsMarkup()',c);assert.doesNotMatch(html,/优酷|哔哩哔哩|土豆/);c.selectedYear='2006';html=vm.runInContext('videoStationsMarkup()',c);assert.match(html,/优酷/);assert.doesNotMatch(html,/哔哩哔哩/);c.selectedYear='2009';assert.match(vm.runInContext('videoStationsMarkup()',c),/MikuFans/);c.selectedYear='2010';html=vm.runInContext('videoStationsMarkup()',c);assert.match(html,/哔哩哔哩/);assert.doesNotMatch(html,/MikuFans/);});
test('anime playback is opt-in and a future series cannot stay embedded in an earlier year',()=>{const c=catalog();c.selectedYear='2005';vm.runInContext('selectedCartoon="doraemon"',c);assert.match(vm.runInContext('cartoonMarkup()',c),/player.bilibili.com/);c.selectedYear='2004';assert.doesNotMatch(vm.runInContext('cartoonMarkup()',c),/<iframe/);assert.match(vm.runInContext('cartoonMarkup()',c),/哪吒传奇/);});
test('ringtone library assets exist and the songbook excludes future releases',()=>{const c=catalog();assert.equal(vm.runInContext('memoryTracks.length',c),12);const tracks=JSON.parse(JSON.stringify(vm.runInContext('memoryTracks',c)));for(const t of tracks)assert.ok(readFileSync('dist/audio/'+t.id+'.mp3').length>20000);const html=vm.runInContext('eraSongMarkup()',c);assert.match(html,/七里香/);assert.doesNotMatch(html,/秋天不回来|平凡之路/);});

test('Blender GLB exports include actual interactive keys and shop objects',()=>{
 function glb(name){const b=readFileSync('dist/models/'+name+'.glb');assert.equal(b.toString('ascii',0,4),'glTF');assert.equal(b.readUInt32LE(4),2);const length=b.readUInt32LE(12);return JSON.parse(b.toString('utf8',20,20+length));}
 const phone=glb('n73-blender'),room=glb('oldlane-shop');const actions=phone.nodes.map(n=>n.extras?.action).filter(Boolean);
 for(const a of ['power','ok','dir:up','dir:down','soft:left','soft:right','edit','clear','music','digit:1','digit:5','digit:#'])assert.ok(actions.includes(a),a);
 const objects=room.nodes.map(n=>n.extras?.action).filter(Boolean);for(const a of ['drawer','drag:cards','drag:battery','photo','receipt','key','phone:black','phone:silver','phone:white'])assert.ok(objects.includes(a),a);
 const old=glb('6600-blender').nodes.map(n=>n.extras?.action),touch=glb('5230-blender').nodes.map(n=>n.extras?.action);for(const a of ['power','ok','dir:left','digit:5','clear'])assert.ok(old.includes(a));for(const a of ['power','home','contacts','end'])assert.ok(touch.includes(a));assert.ok(!touch.some(a=>a?.startsWith('digit:')),'5230 must not acquire a numeric keypad');assert.ok(phone.meshes.length>35);assert.ok(room.meshes.length>70);
});

test('unsupported classic links show maintenance instead of launching another game',()=>{const wrapper=readFileSync('dist/javame/wrapper.js','utf8');assert.match(wrapper,/requestedUnsupported/);assert.match(wrapper,/暂未通过兼容验收/);assert.match(readFileSync('dist/javame/index.html','utf8'),/value="pokemon-crystal"/);});
function club(saved=''){const c=vm.createContext({localStorage:{getItem:()=>saved,setItem:(k,v)=>{c.saved=v;}},document:{addEventListener(){}},phoneApps:[],systemApps:[],systemInstalled:[],phoneAppAllowed:()=>true,phoneScreen:()=>'',phoneGameShelfMarkup:()=>'',phoneSmsMarkup:()=>'',isTextOnlyPhone:()=>false,deviceCapabilities:{},escapeHTML:s=>String(s).replaceAll('<','&lt;'),refreshPhone(){}});vm.runInContext(readFileSync('dist/pocket-club.js','utf8'),c);return c;}
test('pocket companion can complete three encounters, grow and keep collected rewards',()=>{const c=club();vm.runInContext("pocketClubAction('start');for(let i=0;i<40&&pocketBattle;i++){pocketClubAction(pocketBattle.hp<15&&pocketBattle.potions?'potion':'attack',1000,()=>0.9)}",c);assert.equal(vm.runInContext('pocketClub.wins',c),1);assert.equal(vm.runInContext('pocketClub.collection.length',c),1);assert.ok(vm.runInContext('pocketClub.level',c)>1);const loaded=club(c.saved);assert.equal(vm.runInContext('pocketClub.wins',loaded),1);assert.equal(vm.runInContext('pocketClub.collection.length',loaded),1);});
test('fishing timing gives honest misses and catches, and damaged progress is bounded',()=>{const c=club('{"energy":999,"coins":-5,"collection":[-1,30,2,2],"name":"<hi>"}');assert.equal(vm.runInContext('pocketClub.energy',c),6);assert.equal(vm.runInContext('pocketClub.collection.length',c),1);vm.runInContext("pocketClubAction('cast',1000);pocketClubAction('catch',1100,()=>0);",c);assert.equal(vm.runInContext('pocketClub.fish',c),0);vm.runInContext("pocketClubAction('cast',2000);pocketClubAction('catch',2900,()=>0);",c);assert.equal(vm.runInContext('pocketClub.fish',c),1);assert.match(vm.runInContext('pocketClubMarkup()',c),/钓到了/);});

test('pocket address navigation preserves paths, blocks credentials and future sites, leaves words to search',()=>{
 const source=readFileSync('dist/system-shell.js','utf8').slice(readFileSync('dist/system-shell.js','utf8').indexOf('function openPocketAddress('));
 const c=vm.createContext({URL,siteCatalog:[{sites:[{name:'优酷',url:'https://www.youku.com',since:2006}]}],year:()=>2004,toast:s=>c.notice=s,refreshPhone:()=>c.refreshes++,refreshes:0,deskWebsite:null,ucContent:'',ucQuery:'',ucPage:''});vm.runInContext(source,c);
 assert.equal(vm.runInContext('openPocketAddress("小说")',c),false);
 assert.equal(vm.runInContext('openPocketAddress("www.sina.com.cn/news?a=1#top")',c),true);assert.equal(c.deskWebsite.url,'https://www.sina.com.cn/news?a=1');assert.equal(c.ucContent,'web');assert.equal(c.refreshes,1);
 vm.runInContext('openPocketAddress("https://www.youku.com")',c);assert.match(c.notice,/2006/);assert.equal(c.refreshes,1);
 vm.runInContext('openPocketAddress("https://name:secret@example.com")',c);assert.match(c.notice,/有效网址/);assert.equal(c.refreshes,1);
});

test('in-flight companion battle resumes without another energy charge and rewards cannot be claimed twice',()=>{
 const c=club();vm.runInContext("pocketClubAction('start');pocketClubAction('attack',1000,()=>0);",c);
 const loaded=club(c.saved);assert.equal(vm.runInContext('pocketBattle.stage',loaded),1);assert.equal(vm.runInContext('pocketClub.energy',loaded),5);
 vm.runInContext("pocketClubAction('resume');pocketClubAction('route:1');",loaded);assert.equal(vm.runInContext('pocketClub.energy',loaded),5);
 vm.runInContext("for(let i=0;i<40&&pocketBattle;i++)pocketClubAction(pocketBattle.hp<15&&pocketBattle.potions?'potion':'attack',1000,()=>0.9);pocketClubAction('claim:first');",loaded);
 const coins=vm.runInContext('pocketClub.coins',loaded);assert.equal(vm.runInContext("pocketClubAction('claim:first')",loaded),false);assert.equal(vm.runInContext('pocketClub.coins',loaded),coins);
 assert.equal(vm.runInContext('pocketBattle',club('{"battle":{"stage":1,"route":99,"hp":99}}')),null);
});
test('all companion routes can finish, unlock by level, and telegraph charged attacks',()=>{
 const c=club();assert.equal(vm.runInContext("pocketClubAction('route:2')",c),false);
 for(let r=0;r<3;r++){
  vm.runInContext(`pocketClub.level=5;pocketClub.energy=6;pocketClubAction('route:${r}');`,c);
  if(r){vm.runInContext("pocketClubAction('guard');pocketClubAction('guard');",c);assert.match(vm.runInContext('pocketClubMarkup()',c),/正在蓄力/);}
  vm.runInContext("for(let i=0;i<50&&pocketBattle;i++)pocketClubAction(pocketBattle.hp<20&&pocketBattle.potions?'potion':'attack',1000,()=>0.9)",c);
  assert.equal(vm.runInContext('pocketClub.wins',c),r+1);
 }
});

function cabinet(saved=''){const c=vm.createContext({date:'2010-12-31',localStorage:{getItem:()=>saved,setItem:(k,v)=>c.saved=v},document:{addEventListener(){}},phoneApps:[],systemApps:[],systemInstalled:[],phoneScreen:()=>'',phoneAppAllowed:()=>true,phoneGameShelfMarkup:()=>'',phoneState:{app:'cabinet',model:'n73'},experienceZone:'phone',isTextOnlyPhone:()=>false,deviceCapabilities:{}});vm.runInContext(readFileSync('dist/memory-cabinet.js','utf8'),c);return c;}
test('real photo cabinet respects photograph dates, keeps source licenses and persists collection stamps',()=>{
 const c=cabinet();assert.equal(vm.runInContext('cabinetAvailable().length',c),6);
 for(const item of JSON.parse(JSON.stringify(vm.runInContext('cabinetItems',c)))){assert.ok(readFileSync('dist/images/references/'+item.file).length>10000);assert.match(item.licenseURL,/creativecommons.org/);assert.ok(item.author);}
 vm.runInContext("date='2008-01-01'",c);assert.equal(vm.runInContext('cabinetAvailable().length',c),2);assert.equal(vm.runInContext("cabinetOpen('seg')",c),false);
 vm.runInContext("cabinetOpen('n73')",c);assert.equal(vm.runInContext('cabinetAnswer(2)',c),false);assert.equal(vm.runInContext('cabinetAnswer(0)',c),true);vm.runInContext('cabinetAnswer(0)',c);assert.equal(vm.runInContext('cabinetState.stamps.length',c),1);
 assert.equal(vm.runInContext('cabinetState.stamps.length',cabinet(c.saved)),1);assert.equal(vm.runInContext('cabinetState.stamps.length',cabinet('{"stamps":["n73","n73","bad"]}')),1);
 c.experienceZone='story';assert.equal(vm.runInContext("phoneAppAllowed('cabinet')",c),false);
});

test('photo recognition quiz can finish using hardware keys and never skips unsolved cards',()=>{
 const c=cabinet();vm.runInContext("date='2008-01-01';cabinetHardware('5')",c);assert.equal(vm.runInContext('cabinetQuiz',c),true);assert.equal(vm.runInContext('cabinetQuizNext()',c),false);
 vm.runInContext("cabinetHardware('3')",c);assert.equal(vm.runInContext('cabinetQuizSolved',c),false);
 vm.runInContext("cabinetHardware('1');cabinetHardware('5')",c);assert.equal(vm.runInContext('cabinetSelected',c),'shop');
 vm.runInContext("cabinetHardware('2');cabinetHardware('5')",c);assert.equal(vm.runInContext('cabinetQuiz',c),false);assert.equal(vm.runInContext('cabinetState.stamps.length',c),2);
 const restored=cabinet(c.saved);assert.equal(vm.runInContext('cabinetState.stamps.length',restored),2);
 vm.runInContext("cabinetOpen('n73');cabinetHardware('6');cabinetHardware('5')",c);assert.equal(vm.runInContext('cabinetSelected',c),'shop');assert.equal(vm.runInContext('cabinetZoom',c),2);
 vm.runInContext("cabinetHardware('0')",c);assert.equal(vm.runInContext('cabinetSelected',c),'');
});
