"use strict";
const yearbookRequests=new Map();
function ensureYearbook(y) {
  if(yearbook[y])return Promise.resolve(yearbook[y]);
  if(!yearbookRequests.has(y))yearbookRequests.set(y,fetch(`yearbook/${y}.json?v=0.3.0`).then(r=>{if(!r.ok)throw Error('yearbook unavailable');return r.json();}).then(rows=>{
    if(!Array.isArray(rows)||rows.length!==yearbookCounts[y]||!rows.every(e=>typeof e.title==='string'&&typeof e.body==='string'&&/^https:\/\/zh\.wikipedia\.org\/w\/index\.php\?oldid=\d+$/.test(e.source)))throw Error('invalid yearbook');
    yearbook[y]=rows;return rows;
  }).catch(err=>{yearbookRequests.delete(y);throw err;}));
  return yearbookRequests.get(y);
}
function openNewsCenter(options={}) {
  const y=year();
  navigate({type:"newscenter",name:`${year()}年新闻中心`,url:`archaeo://news/${year()}`,page:1,query:"",month:"",...options,loading:!yearbook[y]});
  if(!yearbook[y]){const id=requestId;ensureYearbook(y).then(()=>{if(id===requestId&&current.type==='newscenter'&&year()===y)navigate({...current,loading:false},false);}).catch(()=>{if(id===requestId)navigate({...current,loading:false,error:true},false);});}

}
function newsCenterRows(page) {
  const rows=yearEvents[year()].map((e,i)=>({title:e[1],date:e[0],kind:"长文资料",index:i,body:eventDetails[`${year()}-${i}`]?.deck||"",type:"news"}));
  for(const [i,e] of (yearbook[year()]||[]).entries()) rows.push({...e,index:i,kind:"年表记录",type:"yearrecord"});
  return rows.filter(e=>(!page.month||Number(e.date.slice(0,2))===Number(page.month))&&(!page.query||(e.title+e.body).toLowerCase().includes(page.query.toLowerCase()))).sort((a,b)=>a.date.localeCompare(b.date));
}
function renderNewsCenter(page) {
  const rows=newsCenterRows(page), pages=Math.max(1,Math.ceil(rows.length/20)), p=Math.max(1,Math.min(Number(page.page)||1,pages));
  page.page=p;
  const buttons=()=>`<nav class="center-pagination"><button data-news-page="${p-1}" ${p<=1?'disabled':''}>上一页</button><span>第 ${p} / ${pages} 页 · ${rows.length} 条</span><button data-news-page="${p+1}" ${p>=pages?'disabled':''}>下一页</button></nav>`;
  return `<section class="news-center"><header class="center-masthead"><strong>考古资讯</strong><span>${year()} 年 新闻中心</span><small>国内 / 国际 / 科技 / 体育 / 社会</small></header><div class="center-nav"><button data-action="home">首页</button><button data-year-step="-1">上一年</button><b>${year()} 年全年档案</b><button data-year-step="1">下一年</button></div><p class="center-notice">全年回顾 · ${yearEvents[year()].length} 篇长文资料 + ${yearbookCounts[year()]||0} 条年表记录。均为历史整理资料，非当年即时新闻原稿。</p><form id="news-filter"><label>站内检索 <input name="query" aria-label="搜索年度新闻" value="${escapeHTML(page.query||'')}" placeholder="输入关键词"></label><label>月份 <select name="month" aria-label="筛选新闻月份"><option value="">全年</option>${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${Number(page.month)===i+1?'selected':''}>${i+1}月</option>`).join('')}</select></label><button type="submit">查询</button><button type="button" data-news-reset>全部新闻</button></form>${page.loading?'<p role="status">正在载入这一年的年表记录…</p>':page.error?'<p role="status">年表暂时未载入，可点击“全部新闻”重试；长文资料仍可阅读。</p>':""}${buttons()}<div class="center-list">${rows.slice((p-1)*20,p*20).map(e=>`<article><time>${escapeHTML(e.date)}</time><a href="archaeo://${e.type}/${year()}/${e.index}" ${e.type==='news'?`data-news-year="${year()}" data-news-index="${e.index}"`:`data-year-record="${e.index}"`}>${escapeHTML(e.title)}</a><small>${e.kind}</small></article>`).join('')||'<p class="news-empty">没有找到匹配记录，请换个关键词或月份。</p>'}</div>${buttons()}<footer>年表资料：维基百科贡献者 · CC BY-SA 4.0。各条记录内附固定版本与作者历史。年表与长文可能涵盖同一事件，不计作独立事件总数。</footer></section>`;
}
function openYearRecord(i,y=year()) {
  if(!/^\d{4}$/.test(y)||!Number.isInteger(i)||i<0||i>=yearbookCounts[y])return;
  if(year()!==y)date=y+"-12-31";
  const open=()=>{const rec=yearbook[y]?.[i];if(rec)navigate({type:'yearrecord',name:rec.title,index:i,url:`archaeo://yearrecord/${y}/${i}`});};
  if(yearbook[y])return open();
  navigate({type:'yearrecord',name:'正在载入年表记录',index:i,url:`archaeo://yearrecord/${y}/${i}`});const id=requestId;
  ensureYearbook(y).then(()=>{if(year()===y&&requestId===id)navigate({...current,name:yearbook[y][i].title},false);}).catch(()=>{if(requestId===id)navigate({...current,error:true},false);});
}
function renderYearRecord(page) {
  const e=yearbook[year()]?.[page.index];if(!e)return `<section class="news-center"><p role="status">${page.error?'年表暂时未载入，请重试。':'正在载入这一年的记录…'}</p><button data-year-record="${page.index}">重新载入</button><button data-news-center>返回新闻中心</button></section>`;
  return `<article class="year-record news-center"><header class="center-masthead"><strong>考古资讯</strong><span>${year()} 年 · 年表记录</span></header><div class="center-nav"><button data-news-center>返回新闻中心</button><button data-action="home">时光首页</button></div><h1>${escapeHTML(e.title)}</h1><div class="article-meta">${year()}年 ${escapeHTML(e.date)} · 年表节录</div><p class="article-retrospective">这是后来整理的年度年表节录，与本站长文资料分列，不冒充当年新闻报道。</p><div class="article-body"><p>${escapeHTML(e.body)}</p></div><section class="article-source"><h2>来源与延伸阅读</h2><p>维基百科贡献者 · 固定版本 ${e.revision} · 本站仅做段落提取和版式编排。</p><a href="${escapeHTML(e.source)}" target="_blank" rel="noopener noreferrer">完整来源</a> · <a href="${escapeHTML(e.history)}" target="_blank" rel="noopener noreferrer">作者与修订历史</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a></section><div class="center-pagination"><button data-year-record="${page.index-1}" ${page.index<=0?'disabled':''}>上一条</button><button data-news-center>更多新闻</button><button data-year-record="${page.index+1}" ${page.index>=yearbook[year()].length-1?'disabled':''}>下一条</button></div></article>`;
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-news-center],[data-news-page],[data-year-record],[data-news-reset]');if(!b)return;e.preventDefault();
 if(b.hasAttribute('data-year-record')) {openYearRecord(Number(b.dataset.yearRecord));}
 else if(b.hasAttribute('data-news-page'))openNewsCenter({...current,page:Number(b.dataset.newsPage)});
 else if(b.hasAttribute('data-news-reset'))openNewsCenter();else openNewsCenter();
});
document.addEventListener('submit',e=>{
 if(e.target.id!=='news-filter')return;e.preventDefault();
 openNewsCenter({query:e.target.elements.query.value.trim().slice(0,120),month:e.target.elements.month.value});
});
