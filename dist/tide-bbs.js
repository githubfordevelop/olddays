"use strict";
// Fictional 2008 board. Interface patterns researched; no copied real user posts.
const bbsMembers={
 listener:{name:'听潮的人',joined:'2007-06',signature:'别把白天删掉。',about:'学生 / 便携录音 / 偶尔蹭实验室网络'},
 xun:{name:'阿巡',joined:'2006-09',signature:'先查接触不良。',about:'校园网经常掉线；器材区常客'},
 sound:{name:'声卡坏了',joined:'2005-11',signature:'线插好再开声。',about:'喜欢修旧耳机，不接商业维修'},
 repair:{name:'夜班修车',joined:'2007-02',signature:'收工就回家。',about:'东站附近上夜班，偶尔借店里的电脑回帖'},
 salt:{name:'盐汽水',joined:'2008-04',signature:'周末晒太阳。',about:'只用手机上网，图片大了打不开'},
 admin:{name:'管理员',joined:'2005-03',signature:'请保留原帖，勿发布私人联系方式。',about:'本机保存的版务记录'},
 noodle:{name:'炒面不要葱',joined:'2006-08',signature:'晚饭比器材重要。',about:'潜水居多，饭点出现'},
 guest:{name:'未显示昵称',joined:'未缓存',signature:'签名未缓存',about:'这层的用户资料未能保存'}
};
function bbsMemberFromLine(line){return Object.keys(bbsMembers).find(id=>line.includes(bbsMembers[id].name))||'listener';}
const bbsThreads=Object.fromEntries(Object.entries(deepForumPages).map(([id,p])=>[id,{title:p.title,board:id==='windpost'?'gear':'field',author:'listener',date:id==='windpost'?'10-17':'10-18',read:p.read,posts:p.rows.map(([line,text],i)=>({user:id==='deletedpost'?(line.includes('管理员')?'admin':'listener'):bbsMemberFromLine(line),time:line.match(/\d{2}:\d{2}/)?.[0]||'时间未缓存',text,stamp:line}))}]));
bbsThreads.night={title:'[闲聊] 末班车有人坐过吗',board:'street',author:'repair',date:'10-18',posts:[
 {user:'repair',time:'11:26',text:'东站那块站牌换过一次。我晚上只记得有人问买电池的店关没关。车有没有按点来，我在里面修链条，没看见。'},
 {user:'salt',time:'11:42',text:'海边有个门一直响，是风。那天我白天去过，晚上没去。我的帖子别引用成我在现场啊。'},
 {user:'listener',time:'12:03',text:'我回去以后，窗户关着。声音不是从窗户来的。'},
 {user:'admin',time:'12:20',text:'第三楼是引用还是本人回复，保存的页面缺了标记。我这边不补。先留原文件。'},
 {user:'guest',time:'时间缺失',text:'如果听见门外的人先叫出你的名字，先看一下它是从哪一年的帖子里学到的。'}]};
bbsThreads.breakfast={title:'[灌水] 拍吃的总是糊，手别抖就行？',board:'life',author:'listener',date:'10-12',posts:[
 {user:'listener',time:'09:32',text:'我妈说煎饼都凉了还拍。早上桌边光好，杯子清楚，饼怎么总糊一块。不是拿来参赛，就想留一张。'},
 {user:'salt',time:'10:05',text:'别贴太近啦，我拍面包也这样。手机里一半是吃的，另一半是重复的吃的。'},
 {user:'noodle',time:'12:11',text:'看得我饿了。饭都没吃，先回这个帖子。'},
 {user:'listener',time:'12:18',text:'她说下次要拍先告诉她，好盛个没有缺口的碗。我觉得那个碗挺好。'},
 {user:'xun',time:'13:40',text:'你欠班长那三块别忘了。饭钱和器材账又记一起了吧。'}]};
bbsThreads.cable={title:'[器材] 旧耳机左边时响时不响',board:'gear',author:'xun',date:'10-14',posts:[
 {user:'xun',time:'18:07',text:'插头转一点就好，走两步又没了。宿舍没烙铁，今晚能不能先撑过去？'},
 {user:'sound',time:'18:30',text:'插头根部那截多半断芯。先别拆手机，借条耳机试试。线绕紧只能顶一会儿。'},
 {user:'listener',time:'19:02',text:'我那条借你。下课放你桌上，右边海绵掉了，别塞太深。'},
 {user:'xun',time:'22:16',text:'试了，确实是线。别为了我把新耳机拆了，明天还你。'}]};
bbsThreads.transfer={title:'[转让] 老录音机，还能转，送两盘带',board:'street',author:'repair',date:'10-09',posts:[
 {user:'repair',time:'17:20',text:'帮隔壁店清柜子，机器没盒。可以通电看转不转，音质我不懂。纸标签是跟机器来的，别扯。白天来，晚了就别敲门。'},
 {user:'sound',time:'18:01',text:'皮带松不松？这种老的先别拿重要带子试。'},
 {user:'listener',time:'18:46',text:'我周末过去看看。先别寄，想当面听一下。'},
 {user:'repair',time:'19:05',text:'行。东西都在店里，我只是帮转个帖子。'},
 {user:'listener',time:'10-16 21:25',text:'机器留店里测了。我拍了张桌面，纸带没动。'},
 {user:'salt',time:'10-18 12:41',quote:{thread:'transfer',floor:1,text:'白天来，打烊以后没人。'},text:'那楼上说回家听见有人敲门，是不是看错帖子了？首楼现在不是这么写的。我这边连图片也全掉了。'},
 {user:'admin',time:'10-18 12:50',text:'引用保留的是回帖当时的版本；首楼最后编辑时间未缓存。不要靠印象替别人把后半句接上。'}]};
bbsThreads.window={title:'[随手录] 下雨时窗边的底噪',board:'field',author:'sound',date:'10-15',posts:[
 {user:'sound',time:'21:14',text:'想录雨，结果都是楼上拖椅子。住楼房就这样，不是每个声音都值得留。'},
 {user:'listener',time:'21:36',text:'我这边天还没下，先关窗了。上周那个文件是旧带子转的，名字没改。'},
 {user:'noodle',time:'22:04',text:'录完早点睡，我楼上天天十一点洗衣服。'},
 {user:'listener',time:'10-18 09:56',quote:{thread:'window',floor:2,text:'我这边天还没下，先关窗了。'},text:'我只记得关过一次。怎么后面又有一张窗户照片。'}]};
bbsThreads.outtake={title:'[外采] 海边的底噪里，有一段不属于海的声音',board:'field',author:'listener',date:'10-17',posts:[{user:'listener',time:'时间未缓存',text:'不是观鸟。我想留下一些没人注意过的环境声音。灯塔那边风太大，昨晚换到了堤下面，门缝里很安静。'},{user:'sound',time:'时间未缓存',text:'先查串音和回授。为什么最后八秒像有人在学你呼吸？'},{user:'listener',time:'已编辑',text:'那时候我没有开口。潮最低的时候，门外才有地方站。'},{user:'xun',time:'时间未缓存',text:'别再传了。你说那句是以后才会说的，到底什么意思？'},{user:'admin',time:'时间未缓存',text:'音频暂不可下载。保留文字，等待楼主补充说明。'}]};
bbsThreads.paper={title:'[闲聊] 修理单背面，写过字还能用吗',board:'life',author:'listener',date:'10-16',posts:[
 {user:'listener',time:'21:46',text:'店里那张单子反面还有字，老板翻过来给我签名了。想起家里记菜钱也是用旧纸。正面日期是新的，背面不一定。'},
 {user:'noodle',time:'22:03',text:'我爸拿练习本背面列清单，一本能用两遍。你别把价钱看反了就行。'},
 {user:'listener',time:'22:08',text:'不是价钱。背面像写过一段路线，擦了，铅笔印还在。笔画很像我的。'},
 {user:'sound',time:'22:16',text:'纸压在底下写字会留下压痕。先看是不是上一张纸透下来的，别急着往怪处想。'},
 {user:'xun',time:'22:31',text:'日期别拿来对时间，签单子和拍照片不是一回事。机器留店里了吧？'},
 {user:'listener',time:'22:36',text:'留了。纸回去压在书下，我妈说别再当废纸扔。那行字先留着，不描。'}]};
let bbsQuery='',bbsBoard='all',bbsTrail='bbs:list';
const bbsBoards={all:'全部',gear:'器材',field:'现场',life:'水区',street:'同城'};
function bbsState(){const n=nightState();if(!n.bbs||typeof n.bbs!=='object')n.bbs={last:'',visited:[]};return n.bbs;}
try{const s=JSON.parse(localStorage.getItem(tideStoreKey)||'null')?.expansion?.night?.bbs;if(s&&typeof s==='object')nightState().bbs={last:typeof s.last==='string'&&/^bbs:thread:[a-z]+:\d+:\d+:\d+$/.test(s.last)?s.last:'',visited:Array.isArray(s.visited)?s.visited.filter(id=>Object.hasOwn(bbsThreads,id)):[],floors:Array.isArray(s.floors)?s.floors.filter(k=>typeof k==='string'&&/^[a-z]+:[0-9]+$/.test(k)&&bbsThreads[k.split(':')[0]]?.posts[Number(k.split(':')[1])-1]):[]};}catch{}
function bbsLink(route,label){return `<button data-bbs-route="${escapeHTML(route)}">${escapeHTML(label)}</button>`;}
function bbsRouteValid(route){return route==='bbs:list'||/^bbs:user:[a-z]+$/.test(route)&&Object.hasOwn(bbsMembers,route.split(':')[2])||/^bbs:thread:[a-z]+:\d+:\d+:\d+$/.test(route)&&Object.hasOwn(bbsThreads,route.split(':')[2]);}
function bbsOpen(route){if(!tide.active||tide.device!=='black'||!bbsRouteValid(route))return false;if(tideView.startsWith('bbs:thread:'))bbsTrail=tideView;tideView=route;phoneState.app='community';refreshPhone();const floor=Number(route.split(':')[5]);if(floor)document.querySelector(`[data-bbs-floor="${floor}"]`)?.scrollIntoView?.({block:'nearest'});return true;}
function bbsResults(q=bbsQuery,board=bbsBoard){const query=String(q).trim().toLowerCase().slice(0,40);return Object.entries(bbsThreads).filter(([,t])=>(board==='all'||t.board===board)&&(!query||(t.title+t.posts.map(p=>bbsMembers[p.user].name+p.text).join('')).toLowerCase().includes(query)));}
function bbsList(){const results=bbsResults();return tideFrame('回声采集 BBS',`<div class="bbs-page"><small class="bbs-path">首页 › 讨论区 › ${bbsBoards[bbsBoard]}</small><nav class="bbs-boards">${Object.entries(bbsBoards).map(([id,label])=>`<button data-bbs-board="${id}" aria-pressed="${id===bbsBoard}">${label}</button>`).join('')}</nav><details class="bbs-search"><summary>搜索帖子${bbsQuery?' / '+escapeHTML(bbsQuery):''}</summary><form data-bbs-search><label>站内搜索<input name="q" maxlength="40" aria-label="论坛搜索" value="${escapeHTML(bbsQuery)}" placeholder="主题、正文或用户名"></label><button>查找</button></form></details><div class="bbs-topics">${results.map(([id,t])=>`<section>${bbsLink(`bbs:thread:${id}:1:0:0`,t.title)}<small>${bbsMembers[t.author].name} · ${t.date} · ${t.posts.length}楼</small></section>`).join('')||'<p>没有找到相符的帖子。换个词也许有结果。</p>'}</div>${bbsState().last&&bbsRouteValid(bbsState().last)?bbsLink(bbsState().last,'继续上次帖子'):''}<small>本机保存的虚构论坛 · 2008 / 原创故事</small></div>`);}
function bbsThread(id,page=1,only=0,highlight=0){const t=bbsThreads[id];if(!t)return bbsList();const all=t.posts.map((post,i)=>({...post,floor:i+1}));const rows=only?all.filter(p=>p.user===t.author):all;const pages=Math.max(1,Math.ceil(rows.length/3));page=Math.max(1,Math.min(pages,Math.trunc(page)||1));const shown=rows.slice((page-1)*3,page*3);const state=bbsState();state.last=`bbs:thread:${id}:${page}:${only?1:0}:${highlight}`;if(!state.visited.includes(id))state.visited.push(id);state.floors=state.floors||[];for(const post of shown){const key=id+':'+post.floor;if(!state.floors.includes(key))state.floors.push(key);}if(t.posts.every((_,i)=>state.floors.includes(id+':'+(i+1)))){if(t.read)deepMark(t.read);if(id==='outtake')tideMark('forum');}if(id==='night'&&shown.some(p=>p.floor===5))nightRead('forum');tideSave();return tideFrame('回声采集 / 帖子',`<article class="bbs-page"><small class="bbs-path">${bbsBoards[t.board]} › ${t.date}</small><h3>${escapeHTML(t.title)}</h3><nav class="bbs-toolbar">${bbsLink(`bbs:thread:${id}:1:${only?0:1}:0`,only?'显示全部回复':'只看楼主')}${bbsLink('bbs:user:'+t.author,'楼主资料')}${bbsLink('bbs:list','主题列表')}</nav><small>第 ${page} / ${pages} 页 · ${only?'楼主 '+rows.length+'楼':'共 '+rows.length+'楼'}</small>${shown.map(p=>`<section class="bbs-post ${p.floor===highlight?'bbs-highlight':''}" data-bbs-floor="${p.floor}"><header><span>${p.floor}楼 ${p.user===t.author?'楼主':''}</span>${bbsLink('bbs:user:'+p.user,bbsMembers[p.user].name)}<small>${escapeHTML(p.time)}</small></header>${p.stamp?`<small>${escapeHTML(p.stamp)}</small>`:''}${p.quote?`<blockquote>${escapeHTML(p.quote.text)}${bbsLink(`bbs:thread:${p.quote.thread}:${Math.ceil(p.quote.floor/3)}:0:${p.quote.floor}`,'查看引用原楼')}</blockquote>`:''}<p>${escapeHTML(p.text)}</p><small class="bbs-sign">—— ${escapeHTML(bbsMembers[p.user].signature)}</small></section>`).join('')}<nav class="bbs-pages">${page>1?bbsLink(`bbs:thread:${id}:${page-1}:${only?1:0}:0`,'上一页'):''}${page<pages?bbsLink(`bbs:thread:${id}:${page+1}:${only?1:0}:0`,'下一页'):''}</nav>${id==='returnpost'?bbsLink('bbs:thread:deletedpost:1:0:0','本帖楼主 / 编辑记录'):''}${bbsLink('bbs:list','返回主题列表')}</article>`);}
function bbsProfile(id){const member=bbsMembers[id];if(!member)return bbsList();const posts=Object.entries(bbsThreads).flatMap(([thread,t])=>t.posts.map((p,i)=>({thread,t,p,floor:i+1}))).filter(x=>x.p.user===id);return tideFrame('回声采集 / 会员',`<article class="bbs-page"><h3>${member.name}</h3><dl><dt>注册</dt><dd>${member.joined}</dd><dt>签名</dt><dd>${member.signature}</dd></dl><p>${member.about}</p><h4>缓存中的回帖 (${posts.length})</h4>${posts.map(x=>`<section class="bbs-history">${bbsLink(`bbs:thread:${x.thread}:${Math.ceil(x.floor/3)}:0:${x.floor}`,x.t.title+' / '+x.floor+'楼')}<small>${escapeHTML(x.p.text.slice(0,48))}…</small></section>`).join('')||'<p>没有保存到更多回帖。</p>'}${bbsLink(bbsRouteValid(bbsTrail)?bbsTrail:'bbs:list','返回来处')}${bbsLink('bbs:list','主题列表')}</article>`);}
function bbsRender(){if(tideView==='bbs:list')return bbsList();const p=tideView.split(':');if(p[1]==='user')return bbsProfile(p[2]);return bbsThread(p[2],Number(p[3]),Number(p[4]),Number(p[5]));}
const bbsPhoneBase=phoneScreen;phoneScreen=function(){if(tide.active&&tide.device==='black'&&tideView.startsWith('bbs:'))return bbsRender();return bbsPhoneBase();};
const bbsForumBase=tideForum;tideForum=function(){if(tide.device==='black'&&['','community','forum','deep:forum','deep:search'].includes(tideView))return bbsList();return bbsForumBase();};
const bbsNightOpen=nightOpen;nightOpen=function(id){if(id==='forum')return bbsOpen('bbs:thread:night:1:0:0');return bbsNightOpen(id);};
const bbsDeepView=deepSetView;deepSetView=function(view){if(tide.active&&tide.device==='black'){if(view.startsWith('forumdeep:')&&Object.hasOwn(bbsThreads,view.slice(10)))return bbsOpen(`bbs:thread:${view.slice(10)}:1:0:0`);if(view==='deep:forum'||view==='deep:search')return bbsOpen('bbs:list');}return bbsDeepView(view);};
document.addEventListener('click',e=>{if(!tide.active||tide.device!=='black')return;const b=e.target.closest('[data-bbs-route],[data-bbs-board]');if(!b)return;e.preventDefault();if(b.dataset.bbsRoute)return bbsOpen(b.dataset.bbsRoute);if(Object.hasOwn(bbsBoards,b.dataset.bbsBoard)){bbsBoard=b.dataset.bbsBoard;bbsOpen('bbs:list');}});
document.addEventListener('submit',e=>{if(!tide.active||tide.device!=='black'||!e.target.matches('[data-bbs-search]'))return;e.preventDefault();bbsQuery=String(new FormData(e.target).get('q')||'').trim().slice(0,40);bbsOpen('bbs:list');});
const paperThreadBase=bbsThread;bbsThread=function(...args){const html=paperThreadBase(...args);nightPaperReady();return html;};
