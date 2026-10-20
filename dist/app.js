"use strict";
const $ = (s) => document.querySelector(s);
const escapeHTML = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const eras = {
  2004: {
    phrase: "好久不见，2004。",
    sub: "那时的网页很慢，日子却很长。",
    memo: "拨号声响起，世界就从这块小小的屏幕开始了。",
    topics: [
      ["当时的体育版面", "sports.sina.com.cn"],
      ["超级女声的第一年", "ent.sina.com.cn"],
      ["属于你的个人主页", "www.blogcn.com"],
    ],
  },
  2005: {
    phrase: "你好，2005。",
    sub: "一首歌，一篇帖子，一个通宵。",
    memo: "在论坛里认识的朋友，可能从没见过面，却聊过整个人生。",
    topics: [
      ["2005 年的娱乐版面", "ent.sina.com.cn"],
      ["博客时代的日常", "www.blogcn.com"],
      ["那时的游戏世界", "games.sina.com.cn"],
    ],
  },
  2008: {
    phrase: "又见面了，2008。",
    sub: "熟悉的首页，藏着一整年的记忆。",
    memo: "你记得那个夏天吗？所有人的目光，都望向同一个地方。",
    topics: [
      ["北京奥运会专题入口", "2008.sina.com.cn"],
      ["那一年的新闻", "news.sina.com.cn"],
      ["数码爱好者的讨论", "www.pconline.com.cn"],
    ],
  },
  2010: {
    phrase: "久违了，2010。",
    sub: "旧的书签里，有年轻的自己。",
    memo: "博客还在更新，论坛依然热闹。我们开始把心情写得越来越短。",
    topics: [
      ["南非世界杯", "sports.sina.com.cn"],
      ["博客与微博之间", "t.sina.com.cn"],
      ["豆瓣上的书影音", "www.douban.com"],
    ],
  },
  2018: {
    phrase: "再逛一次，2018。",
    sub: "有些昨天，已经成为历史。",
    memo: "后来才发现，那些随手收藏的网页，也是一种时间胶囊。",
    topics: [
      ["俄罗斯世界杯", "sports.sina.com.cn"],
      ["2018 年的哔哩哔哩", "www.bilibili.com"],
      ["那一年的技术社区", "www.v2ex.com"],
    ],
  },
};
function catalogMarkup(prefix) {
  const total = siteCatalog.reduce((n,c)=>n+c.sites.length,0);
  const eligible = siteCatalog.reduce((n,c)=>n+c.sites.filter(s=>s.since<=Number(year())).length,0);
  return `<section class="old-catalog" id="${prefix}" data-catalog><h2>万维网旧址簿 <small>${eligible} 个候选入口 / 共 ${total} 个</small></h2><p>回到 ${year()} · 按建议浏览年代筛选。目录收录不代表已有可用快照；点击后查询真实存档。</p><label class="catalog-search">⌕ <input type="search" data-catalog-search placeholder="找旧站：梦网、易搜、天涯、QQ…" aria-label="搜索旧网站名称或域名"></label><div class="catalog-index">${siteCatalog.map(c=>`<a href="#${prefix}-${c.id}">${escapeHTML(c.title.split(" · ")[0])}</a>`).join("")}</div><p class="catalog-result" aria-live="polite">显示 ${eligible} 个年代候选入口</p>${siteCatalog.map(c=>{const sites=c.sites.filter(s=>s.since<=Number(year()));return `<details class="catalog-group" id="${prefix}-${c.id}" ${sites.length?'open':''}><summary>${escapeHTML(c.title)} <small>${sites.length}</small></summary><div class="catalog-links">${sites.map(s=>`<div class="catalog-entry" data-catalog-key="${escapeHTML(s.name+' '+s.url)}">${siteLink(s.name,s.url)}<small>${escapeHTML(s.url)}</small></div>`).join("")}</div>${sites.length?'':'<p>这个分类在所选年代暂无候选入口，可切换较晚年份。</p>'}</details>`}).join("")}<p class="catalog-empty" hidden>没有找到这个名称。可从主菜单选择“打开旧网址”。</p><p class="catalog-foot">旧网页是历史资料，部分登录、音乐、下载与游戏服务已失效。本站家园、菜园与精武堂为原创重制，和历史站点入口分开提供。也可从主菜单打开记得的旧域名。</p></section>`;
}
document.addEventListener("input", e=>{
  if (!e.target.matches?.("[data-catalog-search]")) return;
  const box=e.target.closest("[data-catalog]"), q=e.target.value.trim().toLowerCase();
  let count=0;
  box.querySelectorAll(".catalog-group").forEach(group=>{
    let matches=0;
    group.querySelectorAll("[data-catalog-key]").forEach(entry=>{
      const show=entry.dataset.catalogKey.toLowerCase().includes(q); entry.hidden=!show; if(show)matches++;
    });
    group.hidden=!!q&&!matches; if(q&&matches)group.open=true; count+=matches;
  });
  box.querySelector(".catalog-result").textContent=`找到 ${count} 个旧站入口`;
  box.querySelector(".catalog-empty").hidden=count>0;
});
let date = "2004-08-01",
  current = { type: "home" },
  history = [],
  cursor = -1,
  requestId = 0;
function validTravelDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&value>='1996-01-01'&&value<='2025-12-31'&&!Number.isNaN(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;}
try{const storedDate=localStorage.getItem('olddays-selected-date');if(validTravelDate(storedDate))date=storedDate;}catch{}
let pendingArchive = null;
let saved = [];
try {
  saved = JSON.parse(localStorage.getItem("archaeo-bookmarks") || "[]");
  if (!Array.isArray(saved)) saved = [];
  saved = saved.filter((s) => {
    try {
      return (
        s &&
        typeof s.name === "string" &&
        typeof s.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(s.date) &&
        !Number.isNaN(Date.parse(s.date + "T12:00:00Z")) &&
        new Date(s.date + "T12:00:00Z").toISOString().slice(0, 10) === s.date &&
        s.date >= "1996-01-01" &&
        s.date <= "2025-12-31" &&
        ["http:", "https:"].includes(new URL(s.url).protocol)
      );
    } catch {
      return false;
    }
  });
} catch {}

const mobileSkins = {
  uc: {
    name: "UC 经典",
    mark: "UC",
    description: "橙色高光 · 九宫格导航 · 经典菜单",
  },
  opera: {
    name: "Opera Mini",
    mark: "O",
    description: "红黑工具栏 · 快速拨号 · 简洁列表",
  },
  original: {
    name: "考古原版",
    mark: "◉",
    description: "墨绿纸色 · 原创年代导航",
  },
};
let preferences = { skin: "uc", font: "standard", night: false };
try {
  const p = JSON.parse(localStorage.getItem("archaeo-appearance") || "{}");
  if (p && Object.hasOwn(mobileSkins, p.skin)) preferences.skin = p.skin;
  if (["standard", "large"].includes(p.font)) preferences.font = p.font;
  preferences.night = p.night === true;
} catch {}
function applyAppearance() {
  applyWorldAppearance();
  document.body.dataset.mobileSkin = preferences.skin;
  document.body.classList.toggle("mobile-large", preferences.font === "large");
  document.body.classList.toggle("mobile-night", preferences.night && document.body.dataset.chrome === "classic");
  $("#phone-mark").textContent = mobileSkins[preferences.skin].mark;
  $("#phone-name").textContent = "考古 · " + mobileSkins[preferences.skin].name;
  try {
    localStorage.setItem("archaeo-appearance", JSON.stringify(preferences));
  } catch {}
}
function settings() {
  dialog(
    "阅读与外观",
    `<div class="retro-options"><div class="retro-option-tabs"><button data-option-tab="appearance" aria-selected="true">界面</button><button data-option-tab="reading" aria-selected="false">经典阅读</button></div><section data-option-panel="appearance"><div class="settings-heading"><span class="settings-logo">旧日</span><div><b>找回熟悉的上网手感</b><small>按你喜欢的方式逛旧时光，设置保存在本机。</small></div></div><label class="setting-row" for="interface-shell"><span>浏览方式<small>简洁界面给内容留出更多空间</small></span><select id="interface-shell"><option value="simple" ${document.body.dataset.chrome!=='classic'?'selected':''}>简洁界面</option><option value="classic" ${document.body.dataset.chrome==='classic'?'selected':''}>经典浏览器</option></select></label><details class="browser-skin-details"><summary>经典手机浏览器皮肤</summary><div class="skin-options">${Object.entries(
      mobileSkins,
    )
      .map(
        ([key, skin]) =>
          `<button class="skin-option ${preferences.skin === key ? "chosen" : ""}" data-skin="${key}" aria-pressed="${preferences.skin === key}"><span class="skin-preview ${key}"><i>${skin.mark}</i><span>▤ archaeo://home</span><em>▦ ▦ ▦<br>▦ ▦ ▦</em><small>‹　⌂　☰</small></span><strong>${skin.name}</strong><span>${skin.description}</span><b class="skin-check">${preferences.skin === key ? "●" : "○"}</b></button>`,
      )
      .join(
        "",
      )}</div></details></section><section data-option-panel="reading" hidden><h3 class="settings-label">网页显示</h3><label class="setting-row" for="reading-font"><span>页面字号<small>用于经典浏览器的旧网址导航</small></span><select id="reading-font"><option value="standard" ${preferences.font === "standard" ? "selected" : ""}>标准</option><option value="large" ${preferences.font === "large" ? "selected" : ""}>大字</option></select></label><label class="setting-row" for="reading-night"><span>夜间配色<small>用于经典手机浏览器外观</small></span><input id="reading-night" type="checkbox" ${preferences.night ? "checked" : ""}></label></section><div class="retro-option-footer"><span>设置将在本机保存</span><button class="primary" id="finish-settings">确定</button></div><p class="settings-disclaimer">小说字号与夜读，可在正文顶部直接调整。<br>UC 与 Opera Mini 为风格参考，非官方产品，也不是某一版本的精确复刻。设置保存在当前设备。</p></div>`,
  );
}
function mobileMenu() {
  dialog(
    "浏览器菜单",
    `<div class="phone-menu"><button data-era-media><span>♫</span>影音与软件</button><button data-menu-action="newtab"><span>＋</span>新建标签页</button><button data-menu-action="newscenter"><span>▤</span>新闻中心</button><button data-menu-action="stop"><span>✕</span>停止加载</button><button data-menu-action="home"><span>⌂</span>时光首页</button><button data-menu-action="favorites"><span>☆</span>我的收藏</button><button data-menu-action="history"><span>◷</span>浏览记录</button><button data-menu-action="date"><span>▦</span>穿越日期</button><button data-menu-action="refresh"><span>⟳</span>刷新页面</button><button data-menu-action="settings"><span>⚙</span>浏览器设置</button><button data-scene="homeworld"><span>⌂</span>家园空间</button><button data-scene="garden"><span>❀</span>开心菜园</button><button data-scene="wutang"><span>武</span>精武堂闯关</button></div><div class="menu-foot">${mobileSkins[preferences.skin].name}风格 · ${date}</div>`,
  );
}
function mobileHome() {
  return `<section class="wap-home"><div class="wap-welcome"><b>时光导航</b><span>${date.replaceAll("-", ".")} · 历史互联网</span></div><div class="wap-search"><span>⌕</span><button id="focus-address">输入旧网址，回到那一年…</button><button data-action="settings" aria-label="切换浏览器皮肤">换肤</button></div><nav class="nostalgia-channels"><button data-scroll-news>大事记</button><button data-era-media>影音软件</button><button data-section="mobile-catalog">旧站大全</button><button data-scene="homeworld">家园</button><button data-scene="friends">朋友</button><button data-scene="garden">种菜</button><button data-scene="wutang">精武堂</button><button data-scene="novels">小说</button><a href="https://web.archive.org/web/${year()}*/http://www.mop.com/" data-site="www.mop.com" data-name="猫扑大杂烩">猫扑</a></nav><div class="wap-caption">常用网址<span>经典入口 · 存档覆盖以来源为准</span></div><div class="speed-dial">${[
    ["新浪", "www.sina.com.cn", "新"],
    ["网易", "www.163.com", "网"],
    ["搜狐", "www.sohu.com", "狐"],
    ["天涯", "www.tianya.cn", "涯"],
    ["贴吧", "post.baidu.com", "贴"],
    ["hao123", "www.hao123.com", "123"],
  ]
    .map(
      (x, i) =>
        `<a href="https://web.archive.org/web/${year()}*/http://${x[1] === "www.tianya.cn" && date < "2005-11-01" ? "www.tianyaclub.com" : x[1]}/" data-site="${x[1] === "www.tianya.cn" && date < "2005-11-01" ? "www.tianyaclub.com" : x[1]}" data-name="${x[0]}" class="dial dial-${i}"><b>${x[2]}</b><span>${x[0]}</span></a>`,
    )
    .join("")}</div><div class="wap-years"><span>穿越</span>${Object.keys(eras)
    .map(
      (y) =>
        `<button data-year="${y}" class="${year() === y ? "selected" : ""}">${y}</button>`,
    )
    .join(
      "",
    )}<button id="wap-more-date" aria-label="更多日期">…</button></div>${annualNewsMarkup("mobile")}${catalogMarkup("mobile-catalog")}<div class="wap-bottom"><button data-action="settings">⚙ 换个浏览器，换种心情</button><p>真实历史资料 · 不生成虚构新闻<br>考古浏览器 / ARCHAEO BROWSER</p></div></section>`;
}

function year() {
  return date.slice(0, 4);
}
function era() {
  return (
    eras[year()] || {
      phrase: `你好，${year()}。`,
      sub: "打开旧的书签，回到那个时候。",
      memo: "这里的时钟停在你选择的日期。网页存档可能不完整，但每一段留下的记录，都有它自己的时间。",
      topics: [
        ["当时的新闻版面", "news.sina.com.cn"],
        ["当时的门户首页", "www.163.com"],
        ["当时的论坛", "www.tianya.cn"],
      ],
    }
  );
}
function siteLink(name, url, extra = "") {
  if(url === "www.tianya.cn" && date < "2005-11-01") url="www.tianyaclub.com";
  return `<a href="https://web.archive.org/web/${year()}*/http://${escapeHTML(url)}/" data-site="${escapeHTML(url)}" data-name="${escapeHTML(name)}">${escapeHTML(name)}${extra}</a>`;
}
function renderDirectoryHome() {
  const e = era();
  return `${mobileHome()}<div class="portal"><div class="portal-topline"><span>欢迎回来，远方的网友。</span><span class="online">● 时光连接已建立 · ${year()}</span></div><header class="portal-head"><div class="wordmark"><div class="logo" aria-hidden="true"></div><div><div class="brand">考古浏览器</div><div class="brand-en">ARCHAEO BROWSER</div></div></div><div class="tagline">在地址栏输入一个网址，<br>在时间里找回一段记忆。</div><div class="head-date"><b>${year()}</b><small>THE INTERNET, THEN.</small></div></header><nav class="portal-nav"><button class="active" data-action="home">时光首页</button><button data-news-center>新闻中心</button><button data-era-media>影音软件</button><button data-section="desktop-catalog-forum">论坛社区</button><button data-section="desktop-catalog-life">个人天地</button><button data-section="desktop-catalog">旧站大全</button><button data-action="favorites">我的收藏</button></nav><div class="welcome-strip"><span>✉ 欢迎来到过去。<b> 今天，你想回到哪一年？</b></span><span>EST. IN MEMORIES / 001</span></div><section class="retro-bulletin"><b>欢迎来到 ${year()} 年的互联网</b><span>${e.memo}</span><button data-news-center>新闻中心 &gt;&gt;</button></section><div class="year-selector"><span>选择你的年代 →</span>${Object.keys(
    eras,
  )
    .map(
      (y) =>
        `<button data-year="${y}" class="${year() === y ? "active" : ""}" aria-pressed="${year() === y}">${y}</button>`,
    )
    .join(
      "",
    )}</div>${annualNewsMarkup("desktop")}<div class="columns"><aside class="left-col"><section class="box"><h2>☆ 旧日常用站 <span>BOOKMARKS</span></h2><div class="site-list">${[
    ["新浪首页", "www.sina.com.cn", "sina.com.cn"],
    ["网易首页", "www.163.com", "163.com"],
    ["搜狐首页", "www.sohu.com", "sohu.com"],
    ["天涯社区", "www.tianya.cn", "tianya.cn"],
    ["hao123 导航", "www.hao123.com", "hao123.com"],
  ]
    .map(
      (s, i) =>
        `<div class="site-row"><span class="number">0${i + 1}</span>${siteLink(s[0], s[1])}<span class="domain">${s[2]}</span></div>`,
    )
    .join(
      "",
    )}</div></section><section class="box"><h2>▤ 考古须知 <span>READ ME</span></h2><p class="note">这里的链接通往<strong>真实历史存档</strong>。<br>首页是我们重制的年代导航，<strong>并非历史原页</strong>。<br>有些图片和帖子已经遗失。缺失，也是历史的一部分。<br><a href="#" data-action="about">了解存档来源 →</a></p></section><div class="text-ad"><b>慢一点，上网。</b><small>TAKE YOUR TIME ONLINE</small></div></aside><div class="center-col"><h2 class="section-title">◇ 那一年的互联网 <span>EXPLORE THE OLD WEB</span></h2>${catalogMarkup("desktop-catalog")}</div><aside class="right-col"><div class="memory-card"><h3>一小片回忆</h3><p>${e.memo}</p><small>— 编者手记 / ${year()}</small></div><section class="box"><h2>↗ 年代探索 <span>TIME CAPSULE</span></h2><div class="topic-list">${e.topics.map((t) => `<div>${siteLink(t[0], t[1])}<small>${year()} · 主题站点入口</small></div>`).join("")}</div><p class="note" style="border-top:1px solid #d9dccd;font-size:10px">编辑选题，非历史新闻标题。<br>点击查找所选年份的真实页面。</p></section></aside></div><footer class="portal-foot"><div><button data-action="about">关于旧日未关机</button>·<button data-action="sources">资料来源</button>·<button data-action="install">添加到手机主屏幕</button></div><div>本站不属于过去，但希望帮你找到过去。 &nbsp; 最佳浏览心情：有一点怀念。</div><div>你的本机探索足迹 <span class="counter" id="counter">${String(
    history.filter((x) => x.page.type === "archive").length,
  )
    .padStart(5, "0")
    .split("")
    .map((x) => `<i>${x}</i>`)
    .join("")}</span></div></footer></div>`;
}
function setTheme() {
  applyAppearance();
  document.body.classList.toggle("era-modern", Number(year()) >= 2010);
  $("#timeLabel").textContent = date.replaceAll("-", ".");
  document.documentElement.style.setProperty(
    "--chrome",
    Number(year()) >= 2010 ? "#e8ebe5" : "#ece9d8",
  );
}
function renderHome() { return typeof renderExperienceHome==='function'?renderExperienceHome():deskEntered?renderWorkbench():renderPhoneEntrance(); }
function renderWorldPage(page) {
 const renderers={portal:renderTimeHome,devices:renderDeviceLab,magazines:renderMagazineKiosk,anime:renderAnimeClub,posters:renderPosterRoom,pictures:renderMemoryGallery,picturestory:()=>renderPictureStory(page),community:renderCommunity,javame:renderJavaRoom,phone:renderPhoneLab,admagazine:renderAdMagazine,arcade:()=>renderArcade(page),bookshelf:renderBookshelf,book:()=>renderBook(page),games:renderGamesHall,music:renderMusicSalon,videos:renderVideoSalon};
 return renderers[page.type]?.();
}
function navigate(page, push = true) {
  try{if(validTravelDate(date))localStorage.setItem('olddays-selected-date',date);}catch{}
  if((current.type==='phone'&&page.type!=='phone')||(current.type==='home'&&page.type!=='home')){
    pocketJavaReleaseAll();
    document.body.classList.remove('pocket-expanded','pocket-landscape');
  }
  if(push) $("#modal").close();
  requestId++;
  if(pendingArchive) pendingArchive.abort();
  pendingArchive=null;
  if(page.type==='home'&&current.type!=='home')phoneState.app='home';
  current = page;
  document.body.classList.toggle("workbench-mode",page.type==='home'&&deskEntered);
  document.body.classList.toggle("handset-mode",page.type==='phone'||page.type==='home');
  setTheme();
  if (push) {
    history = history.slice(0, cursor + 1);
    history.push({ page: { ...page }, date });
    cursor = history.length - 1;
  } else if(history[cursor]) history[cursor]={page:{...page},date};
  $("#content").innerHTML = renderWorldPage(page) ?? (
    page.type === "home"
      ? renderHome()
      : page.type === "scene"
        ? renderScene(page)
        : page.type === "media"
          ? renderEraMedia()
          : page.type === "newscenter"
          ? renderNewsCenter(page)
          : page.type === "yearrecord"
            ? renderYearRecord(page)
            : page.type === "news"
          ? renderAnnualStory(page)
          : embeddedArchivePage(page));
  $("#address").value = page.type === "home" ? "archaeo://home" : page.url;
  document.body.classList.toggle('lobby-mode',page.type==='home'&&typeof experienceZone!=='undefined'&&!experienceZone);
  const homeTitle=typeof experienceZone==='undefined'?'系统桌面':({phone:'口袋时光',pc:'重连旧网',story:'旧巷来客'}[experienceZone]||'旧日未关机');
  $("#windowtitle").textContent = page.type === "home" ? homeTitle : page.name;
  $("#status").textContent = page.type === "archive" ? "◷ 等待历史存档" : "✓ 完成";
  document.title = `${page.type === "home" ? homeTitle : page.name} · ${year()} — 旧日未关机`;
  updateNav();
  saveTabState();
  renderBrowserTabs();
  const appTitle=document.querySelector('#app-page-title'),appEra=document.querySelector('#app-era-label');
  if(appTitle)appTitle.textContent=page.type==='home'?homeTitle:page.name;
  if(appEra)appEra.textContent=year();
  document.querySelector('.app-overflow')?.removeAttribute?.('open');
  if (page.type === "phone"||page.type === "home") layoutPhoneJavaKeypad();
  if (page.type === "phone" && window.innerWidth <= 600 && !document.body.classList.contains("pocket-expanded")) pocketExpand();
  if(page.type === "phone"||page.type === "home"){syncPocketControls();syncPhoneSmsSoftkeys();}
  window.scrollTo({ top: 0, behavior: "instant" });
  if (page.type === "archive") return resolveSnapshot(page, requestId);
}
function updateNav() {
  const appBack=document.querySelector(".app-back");if(appBack)appBack.disabled=cursor<=0;
  for (const id of ["back", "mback"]) $("#" + id).disabled = cursor <= 0;
  for (const id of ["forward", "mforward"])
    $("#" + id).disabled = cursor >= history.length - 1;
}
function move(n) {
  const next = cursor + n;
  if (next < 0 || next >= history.length) return;
  cursor = next;
  date = history[cursor].date;
  navigate(history[cursor].page, false);
}
function embeddedArchivePage(page) {
  return `<section class="embedded-archive"><div class="embedded-toolbar"><span id="embedded-stamp">正在连接 ${escapeHTML(page.name)} 的历史页面…</span><button data-action="home">返回首页</button><button id="retry">重新载入</button></div><div id="archive-frame-holder" class="archive-frame-holder"><div class="archive-loading">◷ 正在查找 ${date} 及之前、同一年内的快照。找到后会在这里显示。</div></div><p class="embedded-note">历史网页在复古外壳内显示，页面中的链接由存档站提供，后续页面的存档日期可能不同。若显示空白或拒绝连接，可重新载入或换一个时间。</p></section>`;
}
function archiveFailure(page, message) {
  $("#status").textContent = "历史页面暂时不可用";
  $("#embedded-stamp").textContent = message;
  $("#archive-frame-holder").innerHTML =
    `<div class="archive-loading"><h2>这页历史暂时没有打开</h2><p>${escapeHTML(message)}</p><p>可以重新载入、换一个时间，或返回首页继续探索。</p></div>`;
}
async function resolveSnapshot(p, id) {
  const controller=new AbortController();pendingArchive=controller;
  const timer=setTimeout(()=>controller.abort(),8500);
  try {
    const cutoff = date.replaceAll("-", "") + "235959";
    const requestedYear = year();
    const endpoint = new URL("https://archive.org/wayback/available");
    endpoint.searchParams.set("url", p.url);
    endpoint.searchParams.set("timestamp", cutoff);
    const response = await fetch(endpoint, {
      signal: controller.signal,
    });
    if (id !== requestId) return;
    if (!response.ok) throw Error("unavailable");
    const data = await response.json();
    if (id !== requestId) return;
    const snap = data.archived_snapshots?.closest;
    if (!snap || !snap.available) {
      archiveFailure(p, "没有找到这个网址的可用存档。");
      return;
    }
    if (
      !/^\d{14}$/.test(snap.timestamp) ||
      snap.timestamp > cutoff ||
      !snap.timestamp.startsWith(requestedYear)
    ) {
      archiveFailure(
        p,
        "最近快照不在所选年份，或晚于目标日期，因此没有自动打开。",
      );
      return;
    }
    const target = new URL(snap.url);
    if (
      target.hostname !== "web.archive.org" ||
      target.username ||
      target.password ||
      !target.pathname.startsWith(`/web/${snap.timestamp}/`)
    )
      throw Error("invalid-source");
    target.protocol = "https:";
    $("#embedded-stamp").textContent =
      `存档日期 ${snap.timestamp.slice(0, 4)}-${snap.timestamp.slice(4, 6)}-${snap.timestamp.slice(6, 8)} · ${p.name}`;
    $("#archive-frame-holder").innerHTML =
      `<iframe class="history-frame" title="${escapeHTML(p.name)}历史网页" src="${escapeHTML(target.href)}" sandbox="allow-scripts allow-same-origin" referrerpolicy="no-referrer" allow="fullscreen" loading="eager"></iframe>`;
    $("#status").textContent = "✓ 已连接快照 · 在考古浏览器内阅读";
  } catch (error) {
    if (id !== requestId) return;
    archiveFailure(p, "暂时无法连接历史存档服务，请稍后重试。");
  } finally { clearTimeout(timer); if(pendingArchive===controller)pendingArchive=null; }
}

function toast(msg) {
  $("#toast").textContent = msg;
  $("#toast").classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(
    () => $("#toast").classList.remove("show"),
    2600,
  );
}
function dialog(title, html) {
  $("#dialogtitle").textContent = title;
  $("#dialogbody").innerHTML = `<div class="dialog-content">${html}</div>`;
  if (!$("#modal").open) $("#modal").showModal();
}
function dateDialog() {
  dialog(
    "◷ 选择你的时间坐标",
    `<p>选一个日期，重新走进那时的互联网。浏览器会优先查找同一年、目标日期之前的快照。</p><label for="traveldate">想回到哪一天？</label><input id="traveldate" type="date" min="1996-01-01" max="2025-12-31" value="${date}"><button class="primary" id="applydate">进入那个年代 →</button><p style="font-size:10px;color:#87917a;margin-top:13px">网页快照使用所选日期；大事记按全年回顾。可从菜单切换经典浏览器外壳。</p>`,
  );
}
function applyDate(d) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || d < "1996-01-01" || d > "2025-12-31") {
    toast("请选择 1996 至 2025 年的有效日期");
    return;
  }
  if (
    Number.isNaN(Date.parse(d + "T12:00:00Z")) ||
    new Date(d + "T12:00:00Z").toISOString().slice(0, 10) !== d
  ) {
    toast("这个日期不存在，请重新选择");
    return;
  }
  date = d;
  $("#modal").close();
  if (current.type === "media") openEraMedia();
  else if (["newscenter","yearrecord"].includes(current.type)) openNewsCenter();
  else navigate(current.type === "news" ? { type: "home" } : current);
  toast(`已回到 ${date.replaceAll("-", ".")}`);
}
function favorites() {
  dialog(
    "☆ 我的时光收藏",
    (current.type === "archive" ? `<button class="primary" id="savebookmark">收藏这个时间坐标 · ${escapeHTML(current.name)}</button>` : "") + (saved.length
      ? `<p>保存在这台设备上，每一条都带着当时的日期。</p>${saved.map((s, i) => `<div class="saved-row"><a href="#" data-bookmark="${i}">${escapeHTML(s.name)}<small>${escapeHTML(s.date)} · ${escapeHTML(s.url)}</small></a><button data-delete="${i}" aria-label="删除收藏">×</button></div>`).join("")}`
      : "<p>还没有收藏。打开一个历史网址，点击「收藏这个时间坐标」，把它留在这里。</p>"),
  );
}
function action(a) {
  document.querySelector('.app-overflow')?.removeAttribute?.('open');
  if(a === 'open-url'){dialog('打开旧网址',`<form id="simple-address-form"><label for="simple-address">还记得那个网址吗？</label><input id="simple-address" type="text" inputmode="url" autocomplete="url" placeholder="例如 www.sina.com.cn" required><button class="primary" type="submit">寻找 ${year()} 年的网页 →</button></form>`);$('#simple-address').focus();}
  if(a === 'back') move(-1);
  if(a === 'leave-phone'){if(cursor>0)move(-1);else navigate({type:'home'});}
  if(a === 'date') dateDialog();
  if(a === 'toggle-shell'){
    const classic=document.body.dataset.chrome !== 'classic';
    document.body.dataset.chrome=classic?'classic':'simple';
    try{localStorage.setItem('olddays-chrome',document.body.dataset.chrome);}catch{}
    applyAppearance();
  }
  if (a === "settings") settings();
  if (a === "mobilemenu") mobileMenu();
  if (a === "home") {deskEntered=false;phoneState.app="home";document.body.classList.remove("pocket-expanded","pocket-landscape");navigate({ type: "home" });}
  if (a === "favorites") favorites();
  if (a === "refresh") navigate(current, false);
  if (a === "newtab") newBrowserTab();
  if (a === "stop") { requestId++; if(pendingArchive)pendingArchive.abort(); pendingArchive=null; if(current.type === "archive") archiveFailure(current,"你已停止此次加载，可重新载入。"); $("#status").textContent="已停止加载"; }
  if (a.startsWith("menu-")) browserMenu(a.slice(5));
  if (a === "close-tab") closeBrowserTab(activeTab);
  if (a === "newscenter") openNewsCenter();
  if (a === "history")
    dialog(
      "◷ 本次探索记录",
      history.length
        ? history
            .map(
              (h, i) =>
                `<div class="saved-row"><a href="#" data-history="${i}">${escapeHTML(h.page.name || "时光首页")}<small>${h.date}</small></a></div>`,
            )
            .join("")
        : "还没有记录",
    );
  if (a === "fullscreen") {
    if (
      !document.fullscreenElement &&
      document.documentElement.requestFullscreen
    )
      document.documentElement
        .requestFullscreen()
        .catch(() => toast("此设备不支持全屏"));
    else if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }
  if (a === "about" || a === "sources")
    dialog(
      a === "about" ? "关于旧日未关机" : "历史资料来源",
      `<p><b>旧日未关机 / OLDDAYS</b><br>那些回不去的日子，还在这里亮着。旧手机、老互联网与陌生人的故事，在三个独立入口里继续。</p><p>浏览器外壳与首页为年代风格重制；站点链接指向 Internet Archive 的真实存档。这里没有生成的历史新闻，也不保证候选站点每年都有存档。</p><p><a href="https://web.archive.org/" target="_blank" rel="noopener noreferrer">Wayback Machine ↗</a> · 快照查询与历史页面<br><a href="https://commoncrawl.org/overview" target="_blank" rel="noopener noreferrer">Common Crawl ↗</a> · 后续可扩展的数据源，尚未接入</p><p>第一版：日期选择、网址查询、跨年份导航、本机收藏、iPhone 适配。历史网页在外壳内展示，电脑与手机均保留工具栏。部分来源可能限制内嵌；内页后续跳转由存档站控制，不能保证整段浏览严格停留在同一天。</p>`,
    );
  if (a === "install")
    dialog(
      "在 iPhone 上使用",
      `<p>用 <b>Safari</b> 打开本站，点击「分享」，选择「添加到主屏幕」，即可从桌面图标进入。</p><p>这是适配 iPhone 的网页应用，支持安全区和底部触控导航。历史存档仍需要网络连接。</p><p style="color:#87917a">收藏仅保存在当前设备的浏览器中。不同浏览器或主屏幕应用之间可能不共享数据。</p>`,
    );
}
document.addEventListener("click", (e) => {
  const el = e.target.closest("button,a");
  if (!el) return;
  if (el.dataset.skin) {
    preferences.skin = el.dataset.skin;
    applyAppearance();
    settings();
  }
  if (el.dataset.menuAction) {
    $("#modal").close();
    if (el.dataset.menuAction === "date") dateDialog();
    else action(el.dataset.menuAction);
  }
  if (el.id === "finish-settings") {
    $("#modal").close();
    toast("已保存浏览器外观");
  }
  if (el.id === "focus-address") {
    $("#address").focus();
    $("#address").select();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (el.id === "wap-more-date") dateDialog();
  if (el.dataset.action) {
    e.preventDefault();
    action(el.dataset.action);
  }
  if (el.dataset.site) {
    e.preventDefault();
    navigate({
      type: "archive",
      name: el.dataset.name,
      url: "http://" + el.dataset.site + "/",
    });
  }
  if (el.dataset.year) {
    applyDate(el.dataset.year + date.slice(4));
  }
  if (el.dataset.section) {
    const target = $("#" + el.dataset.section);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  if (el.dataset.bookmark !== undefined) {
    e.preventDefault();
    const s = saved[Number(el.dataset.bookmark)];
    if (s) {
      date = s.date;
      $("#modal").close();
      navigate({ type: "archive", url: s.url, name: s.name });
    }
  }
  if (el.dataset.delete !== undefined) {
    saved.splice(Number(el.dataset.delete), 1);
    persist();
    favorites();
  }
  if (el.dataset.history !== undefined) {
    e.preventDefault();
    cursor = Number(el.dataset.history);
    date = history[cursor].date;
    $("#modal").close();
    navigate(history[cursor].page, false);
  }
  if (el.id === "applydate") applyDate($("#traveldate").value);
  if (el.id === "savebookmark") {
    if (saved.some((s) => s.url === current.url && s.date === date))
      return toast("这个时间坐标已在收藏夹");
    saved.push({ url: current.url, name: current.name, date });
    persist();
    toast("已收藏这个时间坐标");
  }
  if (el.id === "retry") navigate(current, false);
});
function persist() {
  try {
    localStorage.setItem("archaeo-bookmarks", JSON.stringify(saved));
  } catch {
    toast("设备无法保存收藏，请检查浏览器存储设置");
  }
}
function navigateAddress(value){
  const v=value.trim();
  if(v === "archaeo://media"){openEraMedia();return;}
  if (v === "archaeo://home" || v === "") {
    navigate({ type: "home" });
    return;
  }
  if (
    v.startsWith("archaeo://") &&
    Object.hasOwn(sceneNames, v.slice("archaeo://".length))
  ) {
    openScene(v.slice("archaeo://".length));
    return;
  }
  const centerMatch=v.match(/^archaeo:\/\/news\/(\d{4})$/);
  if(centerMatch && Number(centerMatch[1])>=1996 && Number(centerMatch[1])<=2025){ date=centerMatch[1]+date.slice(4);openNewsCenter();return; }
  const recordMatch=v.match(/^archaeo:\/\/yearrecord\/(\d{4})\/(\d+)$/);
  if(recordMatch && yearbookCounts[recordMatch[1]]){openYearRecord(Number(recordMatch[2]),recordMatch[1]);return;}
  const storyMatch = v.match(/^archaeo:\/\/news\/(\d{4})\/(\d+)$/);
  if (storyMatch) {
    openAnnualStory(storyMatch[1], Number(storyMatch[2]));
    return;
  }
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : "http://" + v);
    if (
      !["http:", "https:"].includes(u.protocol) ||
      !u.hostname.includes(".") ||
      u.username ||
      u.password
    )
      throw Error();
    u.hash = "";
    navigate({ type: "archive", name: u.hostname, url: u.href });
  } catch {
    toast("请输入有效网址，例如 www.sina.com.cn");
  }
}
$("#addressform").addEventListener("submit",e=>{e.preventDefault();navigateAddress($("#address").value);});
document.addEventListener('submit',e=>{if(e.target.id!=='simple-address-form')return;e.preventDefault();const value=$('#simple-address').value;$('#modal').close();navigateAddress(value);});

document.addEventListener("change", (e) => {
  if(e.target.id==='interface-shell'){
    document.body.dataset.chrome=e.target.value==='classic'?'classic':'simple';
    try{localStorage.setItem('olddays-chrome',document.body.dataset.chrome);}catch{}
    applyAppearance();
  }
  if (e.target.id === "reading-font") {
    preferences.font = e.target.value;
    applyAppearance();
  }
  if (e.target.id === "reading-night") {
    preferences.night = e.target.checked;
    applyAppearance();
  }
});
$("#closedialog").onclick = () => $("#modal").close();
$("#modal").addEventListener("click", (e) => {
  if (e.target === $("#modal")) {
    const r = $("#modal").getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      $("#modal").close();
  }
});
$("#datebutton").onclick = dateDialog;
$("#mdate").onclick = dateDialog;
$("#back").onclick = () => move(-1);
$("#mback").onclick = () => move(-1);
$("#forward").onclick = () => move(1);
$("#mforward").onclick = () => move(1);
try{document.body.dataset.chrome=localStorage.getItem('olddays-chrome')==='classic'?'classic':'simple';}catch{document.body.dataset.chrome='simple';}
function clock() {
  $("#localclock").textContent = new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
$("#retro-audio").volume=0.35;
clock();
setInterval(clock, 60000);
navigate({ type: "home" });

document.addEventListener('click',e=>{const b=e.target.closest('[data-option-tab]');if(!b)return;document.querySelectorAll('[data-option-panel]').forEach(p=>p.hidden=p.dataset.optionPanel!==b.dataset.optionTab);document.querySelectorAll('[data-option-tab]').forEach(t=>t.setAttribute('aria-selected',String(t===b)));});

document.addEventListener('click',e=>{if(!e.target.closest('.app-overflow')||e.target.closest('.app-overflow nav button'))document.querySelector('.app-overflow')?.removeAttribute?.('open');});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelector('.app-overflow')?.removeAttribute?.('open');});
