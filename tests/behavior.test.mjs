import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

function boot(initial = {}, runtime = {}) {
  const values = new Map(Object.entries(initial));
  const elements = new Map();
  const listeners = new Map();
  const classes = () => ({ add() {}, remove() {}, toggle() {} });
  const element = (id) => {
    if (!elements.has(id))
      elements.set(id, {
        value: "",
        textContent: "",
        innerHTML: "",
        disabled: false,
        open: false,
        classList: classes(),
        style: { setProperty() {} },
        close() {
          this.open = false;
        },
        showModal() {
          this.open = true;
        },
        addEventListener() {},
        focus() {},
        select() {},
      });
    return elements.get(id);
  };
  const document = {
    querySelector: element,
    querySelectorAll: () => [],
    addEventListener(type, fn) {
      const list = listeners.get(type) || [];
      list.push(fn);
      listeners.set(type, list);
    },
    documentElement: { style: { setProperty() {} } },
    body: { dataset: {}, classList: classes() },
  };
  const context = vm.createContext({
    document,
    window: {
      addEventListener() {},
      scrollTo() {},
      location: { assign: runtime.onNavigate || (() => {}) },
    },
    localStorage: {
      getItem: (k) => values.get(k) ?? null,
      setItem: (k, v) => values.set(k, v),
    },
    URL,
    AbortSignal,
    AbortController,
    fetch:
      runtime.fetch || (() => Promise.reject(Error("No network in tests"))),
    console,
    setTimeout: () => 0,
    clearTimeout() {},
    setInterval() {},
  });
  for (const file of [
    "annual-news.js",
    "annual-news-extra.js",
    "news-articles.js",
    "mobile-scenes.js",
    "site-catalog.js",
    "yearbook.js",
    "news-center.js",
    "browser-features.js",
    "era-media.js",
    "classic-shelf.js",
    "era-adverts.js",
    "phone-lab.js",
    "pocket-games.js",
    "reading-room.js",
    "capture-studio.js",
    "media-salon.js",
    "memory-gallery.js",
    "community-room.js",
    "javame-room.js",
    "era-posters.js",
    "anime-progress.js",
    "anime-club.js",
    "magazine-reading.js",
    "magazine-kiosk.js",
    "device-lab.js",
    "era-home.js",
    "system-shell.js",
    "desk-experience.js",
    "device-profiles.js",
    "dreamnet-game.js",
    "playground-extras.js",
    "mystery-case.js",
    "handset-ui.js",
    "tide-story.js",
    "campus-case.js",
    "anime-pocket.js",
    "pc-browser.js",

  ])
    vm.runInContext(readFileSync("dist/" + file, "utf8"), context, {
      filename: file,
    });
  context.yearbookTestData=JSON.parse(readFileSync("data/yearbook.json","utf8"));
  vm.runInContext("Object.assign(yearbook, yearbookTestData)",context);
  delete context.yearbookTestData;
  vm.runInContext(readFileSync("dist/app.js","utf8"),context,{filename:"app.js"});
  return {
    context,
    document,
    values,
    listeners,
    run: (s) => vm.runInContext(s, context),
    click(dataset) {
      const target = {
        dataset,
        id: "",
        hasAttribute() {
          return false;
        },
        closest(selector) {
          if (selector === "a,button" || selector === "button,a") return this;
          const m = selector.match(/^\[data-([a-z-]+)\]$/);
          if (!m) return null;
          const key = m[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          return Object.hasOwn(this.dataset, key) ? this : null;
        },
      };
      for (const fn of listeners.get("click") || [])
        fn({ target, preventDefault() {} });
    },
  };
}

test("invalid or rolled-over dates do not change the selected time", () => {
  const b = boot();
  assert.doesNotThrow(() => b.run("applyDate('1996-99-99')"));
  b.run("applyDate('2004-02-31')");
  assert.equal(b.run("date"), "2004-08-01");
  b.run("applyDate('2005-06-18')");
  assert.equal(b.run("date"), "2005-06-18");
  assert.equal(
    b.document.querySelector("#timeLabel").textContent,
    "2005.06.18",
  );
});

test("corrupt bookmarks and inherited skin keys are not used", () => {
  const b = boot({
    "archaeo-appearance": '{"skin":"constructor"}',
    "archaeo-bookmarks": JSON.stringify([
      { name: "bad protocol", url: "javascript:alert(1)", date: "2004-08-01" },
      { name: "bad date", url: "https://example.com", date: "2004-02-31" },
      { name: "valid", url: "https://example.com", date: "2004-08-01" },
    ]),
  });
  assert.equal(b.document.body.dataset.mobileSkin, "uc");
  assert.equal(b.run("saved.length"), 1);
  assert.equal(b.run("saved[0].name"), "valid");
});

test("a complete farming cycle spends seeds and records one harvest", () => {
  const b = boot();
  b.run("openScene('garden')");
  const before = b.run("playState.coins");
  for (let i = 0; i < 4; i++) b.click({ plot: "0" });
  assert.equal(b.run("playState.coins"), before + 10);
  assert.equal(b.run("playState.harvests"), 1);
  assert.equal(b.run("playState.plots[0]"), 0);
  const again = boot(Object.fromEntries(b.values));
  assert.equal(again.run("playState.harvests"), 1);
});

test("training unlocks an upgrade and combat grants rewards on victory", () => {
  const b = boot();
  b.run("openScene('wutang')");
  for (let i = 0; i < 3; i++) b.run("game('train')");
  assert.equal(b.run("playState.level"), 2);
  const before = b.run("playState.coins");
  b.run("game('challenge')");
  for (let i = 0; i < 10 && b.run("playState.enemy!==null"); i++)
    b.run("game('attack')");
  assert.equal(b.run("playState.enemy"), null);
  assert.equal(b.run("playState.coins"), before + 10);
  assert.ok(b.run('playState.log.some(x=>x.includes("闯关成功"))'));
});

test("annual news opens a readable local detail and year changes return to matching news", () => {
  const b = boot();
  b.run("openAnnualStory('2004',0)");
  assert.equal(b.run("current.type"), "news");
  assert.match(b.document.querySelector("#content").innerHTML, /2004/);
  assert.match(b.document.querySelector("#content").innerHTML, /维基百科/);
  b.run("applyDate('2005-06-18')");
  assert.equal(b.run("current.type"), "home");
  assert.match(b.document.querySelector("#content").innerHTML, /2005 \/ 06 \/ 18/);
  assert.match(b.run("renderTimeHome()"), /2005 年大新闻/);
});

test("all supported years contain at least ten news cards with working local detail pages", () => {
  const b = boot();
  for (let y = 1996; y <= 2025; y++) {
    const size = b.run(`yearEvents[${y}].length`);
    assert.ok(size >= 10);
    for (let i = 0; i < size; i++) {
      b.run(`openAnnualStory('${y}',${i})`);
      assert.equal(b.run("current.type"), "news");
      assert.match(
        b.document.querySelector("#content").innerHTML,
        /事件资料卡/,
      );
      assert.match(
        b.document.querySelector("#content").innerHTML,
        /查看完整资料/,
      );
    }
  }
});

test("all 300 articles contain substantive attributed text and reader navigation", () => {
  const b = boot();
  assert.equal(b.run("researchedArticles.length"), 300);
  for (const article of b.run("researchedArticles")) {
    const text = article.sections.flatMap((s) => s.paragraphs).join("");
    assert.ok(text.length >= 750, article.id);
    assert.ok(
      article.sources.every(
        (s) =>
          Number.isSafeInteger(s.revision) &&
          s.source.startsWith("https://zh.wikipedia.org/w/index.php?oldid="),
      ),
      article.id,
    );
    const [year, index] = article.id.split("-");
    b.run(`openAnnualStory('${year}',${index})`);
    const html = b.document.querySelector("#content").innerHTML;
    assert.match(html, /CC BY-SA 4.0/);
    assert.match(html, /data-article-size="large"/);
    assert.match(html, /正文目录/);
    assert.match(html, /社区客厅/);
    assert.match(html, /article-pagination/);
  }
});

test("source paragraphs and headlines cannot inject HTML into reader pages", () => {
  const b = boot();
  b.run(
    `eventDetails['2004-0'].sections = [{title:'<script>alert(1)</script>',paragraphs:['<img src=x onerror=alert(1)>']}]; openAnnualStory('2004',0)`,
  );
  const html = b.document.querySelector("#content").innerHTML;
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.ok(html.includes("&lt;img"));
});

test("old sites embed verified snapshots while keeping the browser shell", async () => {
  const opened = [];
  const b = boot(
    {},
    {
      onNavigate: (url) => opened.push(url),
      fetch: async () => ({
        ok: true,
        json: async () => ({
          archived_snapshots: {
            closest: {
              available: true,
              timestamp: "20040731120000",
              url: "http://web.archive.org/web/20040731120000/http://www.sina.com.cn/",
            },
          },
        }),
      }),
    },
  );
  const before = b.document.querySelector("#content").innerHTML;
  await b.run(
    "navigate({type:'archive',name:'新浪',url:'http://www.sina.com.cn/'})",
  );
  assert.deepEqual(opened, []);
  assert.match(
    b.document.querySelector("#content").innerHTML,
    /embedded-archive/,
  );
  assert.match(
    b.document.querySelector("#archive-frame-holder").innerHTML,
    /<iframe/,
  );
  assert.match(
    b.document.querySelector("#archive-frame-holder").innerHTML,
    /sandbox="allow-scripts allow-same-origin"/,
  );
  assert.match(
    b.document.querySelector("#archive-frame-holder").innerHTML,
    /20040731120000/,
  );
  assert.equal(b.run("current.type"), "archive");
});

test("direct archive navigation rejects wrong dates, foreign hosts, and stale responses", async () => {
  for (const [timestamp, url] of [
    [
      "20040802000000",
      "https://web.archive.org/web/20040802000000/http://example.com/",
    ],
    [
      "20030701000000",
      "https://web.archive.org/web/20030701000000/http://example.com/",
    ],
    ["20040701000000", "https://example.com/web/20040701000000/"],
    [
      "20040701000000",
      "https://web.archive.org/web/20040601000000/http://example.com/",
    ],
  ]) {
    const opened = [];
    const b = boot(
      {},
      {
        onNavigate: (u) => opened.push(u),
        fetch: async () => ({
          ok: true,
          json: async () => ({
            archived_snapshots: {
              closest: { available: true, timestamp, url },
            },
          }),
        }),
      },
    );
    await b.run(
      "navigate({type:'archive',name:'旧站',url:'http://example.com/'})",
    );
    assert.equal(opened.length, 0);
    assert.equal(b.run("current.type"), "archive");
  }
  let resolve;
  const opened = [];
  const b = boot(
    {},
    {
      onNavigate: (u) => opened.push(u),
      fetch: () =>
        new Promise((r) => {
          resolve = r;
        }),
    },
  );
  const pending = b.run(
    "navigate({type:'archive',name:'旧站',url:'http://example.com/'})",
  );
  b.run("navigate({type:'home'})");
  resolve({
    ok: true,
    json: async () => ({
      archived_snapshots: {
        closest: {
          available: true,
          timestamp: "20040701000000",
          url: "https://web.archive.org/web/20040701000000/http://example.com/",
        },
      },
    }),
  });
  await pending;
  assert.equal(opened.length, 0);
});


test("old-web catalog has unique safe entries, year filtering and both screen layouts", () => {
  const app=boot();
  assert.equal(app.run("siteCatalog.length"),14);
  assert.ok(app.run("siteCatalog.reduce((n,c)=>n+c.sites.length,0)")>=240);
  assert.equal(app.run("new Set(siteCatalog.flatMap(c=>c.sites.map(s=>s.url))).size"),240);
  assert.equal(app.run("siteCatalog.every(c=>c.sites.every(s=>/^[a-z0-9.-]+$/.test(s.url)&&s.since>=1994&&s.since<=2025))"),true);
  const early=app.run('date="2004-08-01"; catalogMarkup("test")');
  assert.match(early,/移动梦网/); assert.match(early,/一搜/); assert.match(early,/www.tianyaclub.com/);
  assert.doesNotMatch(early,/www.pengyou.com/);
  assert.match(app.run('date="2018-08-01"; catalogMarkup("test")'),/www.pengyou.com/);
  const home=app.run('renderTimeHome()');
  assert.match(home,/id="mobile-catalog"/); assert.match(home,/id="desktop-catalog"/);
  assert.match(app.run('date="2004-08-01";siteLink("天涯","www.tianya.cn")'),/data-site="www.tianyaclub.com"/);
});

test("browser tabs keep separate dates and histories and close safely",()=>{
 const app=boot();
 app.run('applyDate("2008-08-08"); newBrowserTab(); applyDate("2018-08-08")');
 assert.equal(app.run('browserTabs.length'),2);
 app.run('switchBrowserTab(1)');assert.equal(app.run('date'),'2008-08-08');
 app.run('switchBrowserTab(2)');assert.equal(app.run('date'),'2018-08-08');
 app.run('closeBrowserTab(2)');assert.equal(app.run('activeTab'),1);assert.equal(app.run('date'),'2008-08-08');
 app.run('closeBrowserTab(1)');assert.equal(app.run('browserTabs.length'),1);assert.equal(app.run('current.type'),'home');
});

test("news center offers real additional records, pagination, filtering and attributed detail",()=>{
 const app=boot();
 assert.equal(app.run('Object.keys(yearbook).length'),30);
 assert.equal(app.run('Object.values(yearbook).every(rows=>rows.length>=10)'),true);
 app.run('openNewsCenter()');
 assert.equal(app.run('current.type'),'newscenter');
 assert.ok(app.run('newsCenterRows(current).length')>10);
 const first=app.run('renderNewsCenter(current)');
 assert.match(first,/下一页/);assert.match(first,/搜索年度新闻/);
 const next=app.run('renderNewsCenter({...current,page:2})');assert.notEqual(first,next);
 assert.equal(app.run('newsCenterRows({month:"2",query:""}).every(r=>Number(r.date.slice(0,2))===2)'),true);
 assert.equal(app.run('newsCenterRows({query:"zzzz_no_such_event",month:""}).length'),0);
 const detail=app.run('renderYearRecord({index:0})');assert.match(detail,/CC BY-SA/);assert.match(detail,/oldid=/);
 app.run('applyDate("2005-08-01")');assert.equal(app.run('current.type'),'newscenter');assert.match(app.run('current.url'),/2005/);
});

test("lazy yearbook loads just one requested year and ignores a stale screen", async()=>{
 const rows=JSON.parse(readFileSync('dist/yearbook/2004.json','utf8'));const calls=[];
 const app=boot({}, {fetch:async url=>{calls.push(url);return {ok:true,json:async()=>rows};}});
 app.run('delete yearbook["2004"]; openNewsCenter()');
 await app.run('ensureYearbook("2004")');
 assert.equal(calls.length,1);assert.match(calls[0],/yearbook\/2004.json/);
 assert.equal(app.run('current.loading'),false);assert.equal(app.run('history[cursor].page.loading'),false);
 let resolve;
 const other=boot({}, {fetch:()=>new Promise(r=>resolve=r)});
 other.run('delete yearbook["2004"];openNewsCenter();navigate({type:"home"})');
 resolve({ok:true,json:async()=>rows});await other.run('ensureYearbook("2004")');
 assert.equal(other.run('current.type'),'home');
});

test("media room filters later films and links real historical site entries",()=>{
 const app=boot();
 const early=app.run('date="2004-08-01";renderEraMedia()');
 assert.match(early,/原创8位合成旋律/);assert.match(early,/www.ttplayer.com/);assert.match(early,/www.qidian.com/);assert.match(early,/NASA/);assert.doesNotMatch(early,/Elephants Dream/);
 const later=app.run('date="2008-08-01";renderEraMedia()');
 assert.equal((later.match(/<video /g)||[]).length,4);assert.match(later,/CC BY/);assert.match(later,/preload="none"/);
 app.run('openEraMedia()');assert.equal(app.run('current.type'),'media');assert.equal(app.run('current.url'),'archaeo://media');
 app.run('applyDate("2010-08-01")');assert.match(app.run('current.name'),/2010/);
});

test('snake moves, rejects reversal, scores food and ends on a wall',()=>{const {run}=boot();run('resetSnake();snake.running=true;snakeTurn("left");stepSnake()');assert.equal(run('snake.body[0].x'),5);run('snake.food={x:6,y:5};stepSnake()');assert.equal(run('snake.score'),10);assert.equal(run('snake.body.length'),4);run('for(let i=0;i<20;i++)stepSnake()');assert.equal(run('snake.over'),true);assert.equal(run('snake.running'),false);});
test('mines guarantee a safe first click and never create duplicate mines',()=>{const {run}=boot();run('resetMines();revealMine(0)');assert.equal(run('arcade.mines.includes(0)'),false);assert.equal(run('new Set(arcade.mines).size'),8);assert.equal(run('arcade.revealed.includes(0)'),true);run('revealMine(NaN)');assert.equal(run('arcade.revealed.every(Number.isInteger)'),true);});
test('SMS remains local, bounded and safely rendered',()=>{const {run}=boot();run('sendPhoneSms("壁纸01");sendPhoneSms("<img src=x onerror=1>");phoneState.app="sms"');assert.equal(run('phoneState.wallpaper'),'blue');assert.match(run('phoneScreen()'),/&lt;img/);assert.doesNotMatch(run('phoneScreen()'),/<img src=x/);run('for(let i=0;i<20;i++)sendPhoneSms("hello")');assert.equal(run('phoneState.sent.length'),12);});
test('picture search matches story text, filters tags and returns full local detail',()=>{const {run}=boot();run('galleryQuery="短信";galleryTag="全部"');assert.ok(run('filteredPictures().length')>=1);run('galleryTag="校园"');assert.equal(run('filteredPictures().every(s=>s.tag==="校园")'),true);run('galleryQuery="no-such-memory-2384"');assert.equal(run('filteredPictures().length'),0);assert.match(run('renderPictureStory({story:"one-seventeen"})'),/草稿箱/);assert.ok(run('pictureStories.every(s=>s.text.join("").length>500)'));});
test('community choices respect the selected year and escape local replies',()=>{const {run}=boot({'archaeo-community-replies':JSON.stringify({'tianya-0':['<script>alert(1)</script>']})});run('date="2004-08-01"');assert.equal(run('communityAvailable().some(c=>c.id==="qzone")'),false);run('communityThread=0');assert.match(run('renderCommunity()'),/&lt;script&gt;/);assert.doesNotMatch(run('renderCommunity()'),/<script>alert/);run('date="2011-01-01"');assert.equal(run('communityAvailable().some(c=>c.id==="pengyou")'),true);});
test('skin delegated buttons cannot match the body appearance attribute',()=>{const source=readFileSync('dist/capture-studio.js','utf8');assert.match(source,/button\[data-world-skin\]/);assert.doesNotMatch(source,/closest\('\[data-open-skins\],\[data-world-skin\]/);});

test('anime discussion respects era, stores only a local choice and never reveals future solutions',()=>{const {run}=boot();run('date="1996-08-01"');assert.doesNotMatch(run('renderAnimeClub()'),/鸣人的身世/);run('date="2004-08-01";animeTopic="onepiece-sky";animeChoices[animeTopic]=1');assert.match(run('renderAnimeClub()'),/空岛/);assert.match(run('renderAnimeClub()'),/不公布/);assert.match(run('renderAnimeClub()'),/class="selected"/);});

test('magazine kiosk gates launches, searches titles and marks its original catalog cards',()=>{const {run}=boot();run('date="2004-08-01"');assert.equal(run('kioskAvailable().some(m=>m.id==="manke")'),false);run('date="2006-08-01";kioskQuery="故事会"');assert.equal(run('kioskVisible().length'),1);assert.match(run('renderMagazineKiosk()'),/非原刊封面/);run('kioskSelected="manke"');assert.match(run('renderMagazineKiosk()'),/不是该杂志原文/);});

test('anime progress never includes a future broadcast',()=>{const {run}=boot();assert.equal(run('animeAtDate({episodes:[{date:"2004-10-05"},{date:"2004-10-12"}]},"2004-10-04").count'),0);assert.equal(run('animeAtDate({episodes:[{date:"2004-10-05"},{date:"2004-10-12"}]},"2004-10-05").count'),1);run('date="2004-08-01"');assert.equal(run('animeTopicAvailable(animeTopics.find(t=>t.id==="bleach-power"))'),false);});

test('magazine reader has complete paged stories and a four-page original comic',()=>{const {run}=boot();assert.equal(run('kioskReadPages(kioskReads.find(r=>r.id==="lost-phone")).length'),4);assert.ok(run('kioskReads.filter(r=>r.kind==="故事阅读").every(r=>r.paragraphs.join("").length>500)'));run('date="2006-01-01"');assert.match(run('kioskCover(kioskMagazines[0]).label'),/原创/);run('date="2006-08-01"');assert.match(run('kioskCover(kioskMagazines[0]).label'),/真实/);});
test('device lock blocks menu selection and MP4 retains the chosen video',()=>{const {run}=boot();run('retroDevice.on=true;retroDevice.locked=true;retroDevice.view="menu";gadgetSelect(0)');assert.equal(run('retroDevice.view'),'menu');run('date="2004-08-01";retroDevice.locked=false;retroDevice.model="mp4";retroDevice.view="video";retroDevice.index=1;deviceScreen()');assert.equal(run('retroDevice.index'),1);});

test('physical phone magazine key 6 advances original paginated content',()=>{const {run}=boot();run('date="2004-08-01";phoneMagazineOriginal=true;phoneMagSelected="story";phoneMagRead="last-bus";phoneMagPage=0;phoneMagazineKey("6")');assert.equal(run('phoneMagPage'),1);assert.match(run('phoneMagazineMarkup()'),/2\/8 页/);assert.match(run('phoneMagazineMarkup()'),/小林不信/);});

test('real magazine sources are dated and original reading is optional',()=>{const {run}=boot();run('date="2007-12-31"');assert.equal(run('realMagazineItems({id:"manke"}).length'),0);run('date="2010-08-01";phoneMagSelected="manke"');assert.match(run('phoneMagazineMarkup()'),/kanman.com\/25935\/1.html/);assert.doesNotMatch(run('phoneMagazineMarkup()'),/雨停以前/);});

test('classic Nokia models retain local apps and expose pocket expansion',()=>{const {run}=boot();for(const id of ['nokia5230','n97','n95'])assert.match(run('phoneModels['+JSON.stringify(id)+'].name'),/Nokia/);run('phoneState.model="n97"');assert.match(run('renderPhoneLab()'),/N97键盘便笺/);assert.match(run('renderPhoneLab()'),/data-pocket-expand/);assert.match(run('phoneJavaMarkup()'),/选择手机游戏/);assert.equal(run('pocketJavaGames.length'),15);});

test('phone Java imports expose a local file picker and accept full numeric controls',()=>{const {run}=boot();assert.match(run('phoneJavaMarkup()'),/data-pocket-java-import/);for(const key of [-1,-5,35,42,48,49,57])assert.equal(run('validPocketJavaKey('+key+')'),true);for(const key of [0,1000,-99])assert.equal(run('validPocketJavaKey('+key+')'),false);assert.equal(run('pocketJavaChoice'),'grid-tactics');});

test('unsupported Java share bridge replies do not reach the virtual filesystem',()=>{
 const source=readFileSync('dist/javame/bld/main-all.js','utf8');
 const start=source.indexOf('DumbPipe.open("mozActivityHandler", {}, function(message) {');
 const end=source.indexOf('\n  });',start)+6;
 const calls=[];let handler;
 vm.runInNewContext(source.slice(start,end),{DumbPipe:{open(type,options,callback){handler=callback;}},fs:{createUniqueFile(...args){calls.push(args);return 'test.jar';}},Blob,getInvocationCalled:false,addInvocation(){}});
 for(const reply of [undefined,null,{}, {type:'error',error:'Unavailable in offline museum'}, {fileName:'x.jar'}])handler(reply);
 assert.equal(calls.length,0);
 handler({fileName:'valid.jar',data:new Uint8Array([1,2])});
 assert.equal(calls.length,1);assert.equal(calls[0][1],'valid.jar');
});

test('leaving the handset restores page scrolling and navigation chrome',()=>{
 const {run,document}=boot();const removed=[];
 document.body.classList.remove=(...names)=>removed.push(...names);
 run('current={type:"phone"};navigate({type:"home"})');
 assert.ok(removed.includes('pocket-expanded'));
 assert.ok(removed.includes('pocket-landscape'));
 assert.equal(run('current.type'),'home');
});

test('paid and unavailable magazine sources show clear access cards instead of blank embeds',()=>{
 const {run}=boot();run('date="2020-08-01";realMagazineIndex=0');
 for(const id of ['story','duzhe']){
  const html=run('realMagazineFrame({id:'+JSON.stringify(id)+'})');
  assert.match(html,/reading-access-card/);
  assert.doesNotMatch(html,/<iframe/);
  assert.match(html,/<a href="https:/);
 }
 assert.match(run('realMagazineFrame({id:"manke"})'),/<iframe/);
});

test('screen-sized reading paragraphs preserve every source character',()=>{
 const {run}=boot();
 const book=JSON.parse(readFileSync('dist/books/journey.json','utf8'));
 for(const chapter of book.chapters){
  const formatted=run('readingParagraphs('+JSON.stringify(chapter.paragraphs)+')');
  assert.equal(formatted.join(''),chapter.paragraphs.join(''));
  assert.ok(formatted.length>=chapter.paragraphs.length);
 }
 assert.ok(run('readingParagraphs('+JSON.stringify(book.chapters[0].paragraphs)+').length')>1);
});

test('changing music tracks preserves a muted volume',()=>{
 const {run,document}=boot();
 document.querySelector('#retro-audio').volume=0;
 run('setMemoryTrack(1,false)');
 assert.equal(document.querySelector('#retro-audio').volume,0);
 assert.match(run('renderMusicSalon()'),/value="0" aria-label="随身听音量"/);
});


test('system installs persist once, reject unknown software and survive a reload',()=>{
 const b=boot({'olddays-system-apps':'["unknown", "calculator", "calculator"]'});
 assert.equal(b.run('systemInstalled.filter(id=>id==="calculator").length'),1);
 assert.equal(b.run('systemInstalled.includes("unknown")'),false);
 assert.equal(b.run('installSystemApp("not-an-app")'),false);
 assert.equal(b.run('installSystemApp("notes")'),true);
 assert.equal(b.run('installSystemApp("notes")'),false);
 const reloaded=boot({'olddays-system-apps':b.values.get('olddays-system-apps')});
 assert.match(reloaded.run('deskEntered=true;renderHome()'),/data-system-launch="notes"/);
 assert.match(reloaded.run('phoneStoreMarkup()'),/javame\/demos\/notes.jar/);
});
test('UC search filters local destinations and safely renders query text',()=>{
 const b=boot();b.run('ucQuery="小说"');
 assert.match(b.run('phoneUCMarkup()'),/data-uc-open="books"/);
 assert.doesNotMatch(b.run('phoneUCMarkup()'),/data-uc-open="music"/);
 b.run('ucQuery="<img src=x onerror=alert(1)>"');
 assert.doesNotMatch(b.run('phoneUCMarkup()'),/<img src=x/);
 b.run('ucPage="saved"');assert.match(b.run('phoneUCMarkup()'),/我的书签/);
});


test('quarantined historical game is absent from all playable menus and defaults',()=>{
 const b=boot();assert.equal(b.run('pocketJavaChoice'),'grid-tactics');
 assert.doesNotMatch(b.run('phoneJavaMarkup()'),/value="ancient-empires-2"/);
 assert.doesNotMatch(b.run('renderGamesHall()'),/data-launch-java="ancient-empires-2"/);
 assert.doesNotMatch(readFileSync('dist/javame/index.html','utf8'),/option value="ancient-empires-2"/);
});


test('3310 and 1100 expose native text functions and reject color or Java apps',()=>{
 const b=boot();
 for(const model of ['nokia3310','nokia1100']){
  b.run('phoneState.model='+JSON.stringify(model)+';phoneState.app="home";deskEntered=true');
  for(const app of ['sms','contacts','snake','calculator'])assert.equal(b.run('phoneAppAllowed('+JSON.stringify(app)+')'),true);
  for(const app of ['browser','qq','java','ads','videos','comics','store'])assert.equal(b.run('phoneAppAllowed('+JSON.stringify(app)+')'),false);
  assert.doesNotMatch(b.run('phoneScreen()'),/data-system-launch="browser"|phone-java-frame/);
  assert.doesNotMatch(b.run('renderMonoWorkbench()'),/data-desk-open="browser"|data-sms-offer/);
 }
 b.run('phoneState.model="fullscreen"');assert.equal(b.run('phoneAppAllowed("browser")'),true);
 assert.ok(b.run('Object.keys(phoneModels).length')>=13);
});
test('SMS download only installs the requested asset after an explicit claim and persists it',()=>{
 const b=boot();assert.equal(b.run('systemInstalled.includes("comics")'),false);
 assert.equal(b.run('sendPhoneSms("漫画01")'),true);
 assert.equal(b.run('systemInstalled.includes("comics")'),false);
 assert.equal(b.run('claimSmsDownload("软件01")'),false);
 assert.equal(b.run('claimSmsDownload("漫画01")'),true);
 assert.equal(b.run('systemInstalled.includes("comics")'),true);
 assert.equal(b.run('claimSmsDownload("漫画01")'),false);
 const restored=boot({'archaeo-phone-lab':b.values.get('archaeo-phone-lab'),'olddays-system-apps':b.values.get('olddays-system-apps')});
 assert.equal(restored.run('phoneState.sent[0].claimed'),true);
 assert.equal(restored.run('systemInstalled.includes("comics")'),true);
 restored.run('phoneState.model="nokia3310";sendPhoneSms("软件01")');
 assert.equal(restored.run('claimSmsDownload("软件01")'),false);
});
test('native calculator evaluates keys without Java and handles division by zero',()=>{
 const b=boot();for(const key of ['1','3','+','2','9','='])b.run('monoCalculatorKey('+JSON.stringify(key)+')');
 assert.equal(b.run('monoCalcValue'),'42');
 for(const key of ['C','9','÷','0','='])b.run('monoCalculatorKey('+JSON.stringify(key)+')');
 assert.equal(b.run('monoCalcValue'),'错误');
});
test('memory stamps only accept known milestones and never count twice',()=>{
 const b=boot();assert.equal(b.run('unlockDeskStamp("arbitrary")'),false);
 assert.equal(b.run('unlockDeskStamp("comic")'),true);assert.equal(b.run('unlockDeskStamp("comic")'),false);
 assert.equal(b.run('deskStamps.length'),1);
});


test('virtual dreamnet starts with 100 yuan and a welcome SMS, and never double-charges one download',()=>{
 const b=boot();assert.equal(b.run('dreamnet.balance'),10000);assert.equal(b.run('walletUnreadCount()'),1);
 assert.equal(b.run('walletPurchase("火影01").ok'),true);assert.equal(b.run('dreamnet.balance'),9700);
 assert.equal(b.run('walletPurchase("火影01").charged'),0);assert.equal(b.run('dreamnet.balance'),9700);
 b.run('markWalletMessageRead(1)');assert.equal(b.run('dreamnet.messages.find(m=>m.id===1).unread'),false);
});
test('monthly billing advances only on a game turn and closing dreamnet stops all future charges',()=>{
 const b=boot();b.run('walletPurchase("铃声01","monthly")');assert.equal(b.run('dreamnet.balance'),9500);
 assert.equal(b.run('walletAdvanceMonth()'),500);assert.equal(b.run('dreamnet.balance'),9000);
 b.run('walletDisable()');assert.equal(b.run('walletAdvanceMonth()'),0);assert.equal(b.run('dreamnet.balance'),9000);
 assert.equal(b.run('walletPurchase("海贼01").ok'),false);assert.equal(b.run('dreamnet.balance'),9000);
 assert.equal(b.run('walletPurchase("铃声01").charged'),0);
});
test('insufficient virtual credit cannot go negative and SMS TD cancels recurring services',()=>{
 const b=boot();b.run('dreamnet.balance=100');assert.equal(b.run('walletPurchase("游戏01").ok'),false);
 assert.equal(b.run('dreamnet.balance'),100);assert.equal(b.run('walletTopUp(999)'),false);
 assert.equal(b.run('walletTopUp(2000)'),true);assert.equal(b.run('dreamnet.balance'),2100);
 b.run('walletPurchase("铃声01","monthly");sendPhoneSms("TD")');
 assert.equal(b.run('dreamnet.enabled'),false);assert.match(b.run('phoneState.sent.at(-1).reply'),/关闭成功/);assert.equal(b.run('walletAdvanceMonth()'),0);
});

test('device years sort chronologically and Apple/offline players enforce capabilities',()=>{
 const b=boot();assert.equal(b.run('Object.keys(phoneModels).length'),18);
 assert.equal(b.run('sortedPhoneModels().map(([,m])=>parseInt(m.era)).every((v,i,a)=>!i||a[i-1]<=v)'),true);
 for(const model of ['iphone','fullscreen','mp3','mp4','mp5','psp']){b.run(`phoneState.model=${JSON.stringify(model)}`);assert.equal(b.run("phoneAppAllowed('java')"),false,model);}
 b.run("phoneState.model='mp3'");assert.equal(b.run("phoneAppAllowed('music')"),true);assert.equal(b.run("phoneAppAllowed('videos')"),false);
 b.run("phoneState.model='mp4'");assert.equal(b.run("phoneAppAllowed('videos')"),true);assert.equal(b.run("phoneAppAllowed('browser')"),false);assert.doesNotMatch(b.run("extraPhoneScreen('videos')"),/iframe|https:/);
 b.run("phoneState.model='mp5'");assert.equal(b.run("phoneAppAllowed('browser')"),true);
 b.run("phoneState.model='symbian'");assert.equal(b.run("phoneAppAllowed('java')"),true);
});
test('virtual single purchases refund once and SMS can cancel one subscription without cancelling another',()=>{
 const b=boot();b.run("walletPurchase('神作20')");assert.equal(b.run('dreamnet.balance'),8000);assert.equal(b.run("walletRefund('神作20')"),true);assert.equal(b.run('dreamnet.balance'),10000);assert.equal(b.run("walletRefund('神作20')"),false);assert.equal(b.run('dreamnet.balance'),10000);
 b.run("walletPurchase('铃声01','monthly');walletPurchase('漫画01','monthly');handleDreamnetSms('退订 铃声01')");assert.equal(b.run("dreamnet.subscriptions['铃声01'].active"),false);assert.equal(b.run("dreamnet.subscriptions['漫画01'].active"),true);assert.equal(b.run('walletAdvanceMonth()'),800);
 b.run("handleDreamnetSms('TD')");assert.equal(b.run('walletAdvanceMonth()'),0);
});
test('original pocket games have reachable wins and secrets only unlock from discovered inputs',()=>{
 const b=boot();assert.equal(b.run("discoveries.includes('cheat')"),false);b.run("handleDreamnetSms('上上下下左右左右BA')");assert.equal(b.run("discoveries.includes('cheat')"),true);
 b.run("resetArcade('lights');lights=Array(9).fill(false);[0,2,4,7].forEach(toggleLight);[0,2,4,7].forEach(arcadePlay)");assert.equal(b.run('lights.every(v=>!v)'),true);assert.equal(b.run("discoveries.includes('lights')"),true);
 b.run("resetArcade('slide');slideTiles=[1,2,3,4,5,6,0,7,8]");assert.equal(b.run('arcadePlay(0)'),false);b.run('arcadePlay(7);arcadePlay(8)');assert.equal(b.run("slideTiles.join(',')"),'1,2,3,4,5,6,7,8,0');
 b.run("resetArcade('memory');memoryCards=['★','★','♪','♪','☀','☀','♠','♠','♥','♥','☂','☂'];for(let i=0;i<12;i++)arcadePlay(i)");assert.equal(b.run('memoryMatched.length'),12);
});
test('new advertised resources and published comic pages exist locally',()=>{
 const b=boot();assert.equal(b.run('smsDownloads.length'),24);for(const image of JSON.parse(b.run('JSON.stringify(smsDownloads.map(o=>o.image))')))assert.ok(readFileSync('dist/'+image).length,image);
 for(let i=0;i<=32;i++)assert.ok(readFileSync(`dist/images/daming/${String(i).padStart(2,'0')}.jpg`).length>1000);
 assert.ok(readFileSync('dist/video/pocket-summer.mp4').length>1000);
});


test('Java physical keys support click fallback and pointer capture failure without losing presses',()=>{
 const b=boot();b.run("phoneState.app='java';var keyEvents=[];pocketJavaMessage=(a,c,d)=>keyEvents.push([a,c,d])");
 const key={dataset:{phoneKey:'5'},focus(){},setPointerCapture(){throw Error('touch capture unavailable')},classList:{add(){},remove(){}},hasAttribute(name){return name==='data-phone-key'},closest(selector){return selector.split(',').some(s=>s.trim()==='[data-phone-key]')?this:null}};
 const event={target:key,pointerId:7,detail:1,preventDefault(){}};
 // Click-only input (including synthetic taps) must press rather than being discarded by detail>0.
 for(const fn of b.listeners.get('click'))fn(event);
 assert.equal(b.run('keyEvents.length'),1);assert.equal(b.run('keyEvents[0][1]'),53);
 assert.doesNotThrow(()=>{for(const fn of b.listeners.get('pointerdown'))fn(event)});
 assert.equal(b.run('keyEvents.length'),2);assert.equal(b.run('pocketJavaHeld.get(7)'),53);
 // The compatibility click following a real pointer press must not send a duplicate keydown.
 for(const fn of b.listeners.get('click'))fn(event);
 assert.equal(b.run('keyEvents.length'),2);
 for(const fn of b.listeners.get('pointerup'))fn(event);
 assert.equal(b.run('pocketJavaHeld.size'),0);assert.equal(b.run('keyEvents[2][2]'),false);
});


test("handset controls separate Navi models from four-way joystick models",()=>{
 const b=boot();
 b.run("phoneState.model='nokia3310'");
 assert.match(b.run("phoneHardwareMarkup()"),/hardware-navi/);
 assert.equal((b.run("phoneHardwareMarkup()").match(/data-phone-dir=/g)||[]).length,2);
 b.run("phoneState.model='symbian'");
 assert.equal((b.run("phoneHardwareMarkup()").match(/data-phone-dir=/g)||[]).length,4);
 assert.match(b.run("phoneHardwareMarkup()"),/data-phone-ok/);
});
test("browser skins preserve content selection and replace handset branding",()=>{
 const b=boot();b.run("ucQuery='旧城';ucPage='nav';handsetBrowserSkin='opera'");
 const html=b.run("phoneUCMarkup()");
 assert.match(html,/browser-skin-opera/);assert.match(html,/工具 \/ 年代画风/);
 assert.equal(b.run("ucQuery"),'旧城');assert.equal(b.run("ucPage"),'nav');
 assert.equal(b.run("systemApps.find(a=>a.id==='browser').name"),'浏览器');
});


test('campus case requires six independent sources and correct owner, code and cause',()=>{const b=boot();assert.equal(b.run("campusCollect('sms')"),false);b.run("campus.started=true;campusCollect('sms');campusCollect('sms')");assert.equal(b.run('campus.evidence.length'),1);assert.match(b.run("campusSolve('chen','0612','broadcast')"),/没齐/);b.run('campusEvidenceKeys.forEach(campusCollect)');assert.match(b.run("campusSolve('zhou','0612','broadcast')"),/对不上/);assert.match(b.run("campusSolve('chen','0717','broadcast')"),/对不上/);assert.match(b.run("campusSolve('chen','0612','ghost')"),/对不上/);assert.match(b.run("campusSolve('chen','0612','broadcast')"),/陈默/);assert.equal(b.run('campus.solved'),true);const saved=Object.fromEntries(b.values);assert.equal(boot(saved).run('campus.solved'),true);});
test('PC mode has its own browser without UC chrome and does not inherit MP3 restrictions',()=>{const b=boot();b.run("visitMode='pc';phoneState.model='mp3';phoneState.app='browser'");assert.equal(b.run("phoneAppAllowed('qq')"),true);assert.match(b.run('renderPcWorkbench()'),/Internet Explorer|pc-window/);assert.doesNotMatch(b.run('phoneUCMarkup()'),/uc-top|优视浏览器|handset-browser-settings/);b.run("visitMode='phone'");assert.equal(b.run("phoneAppAllowed('qq')"),false);});
test('anime pocket catalogue gates later shows and keeps original clue sources distinct',()=>{const b=boot();b.run("date='2004-08-01'");assert.equal(b.run("pocketAnimeAvailable(pocketAnimeCards.find(c=>c.id==='bleach-card'))"),false);assert.match(b.run('animePocketMarkup()'),/数码宝贝/);assert.doesNotMatch(b.run('animePocketMarkup()'),/死神 BLEACH/);assert.match(b.run('campusClues.audio.body'),/原创合成示意音/);});


test('cancelled monthly ownership remains labelled correctly after reload',()=>{const b=boot();b.run("walletPurchase('铃声01','monthly');handleDreamnetSms('退订 铃声01')");const restored=boot(Object.fromEntries(b.values));assert.equal(restored.run("dreamnet.subscriptions['铃声01'].active"),false);assert.match(restored.run('walletPurchasesMarkup()'),/包月已退订/);assert.equal(restored.run('walletAdvanceMonth()'),0);});

test('story banners stay in inbox and never obstruct composing or claiming downloads',()=>{const b=boot();b.run("smsView='compose'");assert.doesNotMatch(b.run('phoneSmsMarkup()'),/campus-incoming|mystery-incoming/);b.run("smsView='inbox'");assert.match(b.run('phoneSmsMarkup()'),/campus-incoming/);});
test('tide story requires independent traces, rejects guesses and preserves endings',()=>{
 const b=boot();b.run("tide.active=true;tide.device='black'");
 assert.match(b.run("tideJudge('xu','field','gate','0317','sealed')"),/太早/);
 b.run("['qq','gate','back','forum','timetable','recording'].forEach(tideMark)");
 assert.match(b.run("tideJudge('xu','birds','gate','0317','sealed')"),/不能互相/);
 assert.match(b.run("tideJudge('xu','field','gate','0317','sealed')"),/纸袋/);
 assert.equal(boot(Object.fromEntries(b.values)).run('tide.solved'),true);
 assert.equal(boot(Object.fromEntries(b.values)).run('tide.ending'),'sealed');
});
test('tide devices differ by era and ordinary phones retain ordinary lives',()=>{
 const b=boot();b.run("tide.device='silver'");assert.match(b.run('tideSms()'),/阿禾/);assert.doesNotMatch(b.run('tideSms()'),/许舟/);
 b.run("tide.device='white'");assert.match(b.run('tideQQ()'),/全班/);assert.match(b.run('tideAlbum()'),/2010/);
 b.run("tide.device='black';tideView='qq:chat'");assert.match(b.run('tideQQ()'),/许舟/);assert.equal(b.run('tideStage()'),0);
 assert.equal(b.run("tideOpenDevice('untrusted')"),false);
});

test('tide suspense escalates from reading and supports the second ending',()=>{
 const b=boot();b.run("tide.active=true;tide.device='black'");assert.equal(b.run('tideStage()'),0);
 assert.doesNotMatch(b.run('tideSms()'),/本机号码/);
 b.run("['qq','gate','back','forum','timetable','recording'].forEach(tideMark)");assert.equal(b.run('tideStage()'),2);
 assert.match(b.run('tideSms()'),/本机号码/);
 assert.match(b.run("tideJudge('xu','field','gate','0317','played')"),/第二遍/);
 assert.equal(b.run('tide.ending'),'played');
});
test('tide notebooks stay with their handsets and entertainment stays available',()=>{
 const b=boot();b.run("tideOpenDevice('black');tide.notes='潮声的笔记';tideOpenDevice('silver')");assert.equal(b.run('tide.notes'),'');
 assert.doesNotMatch(b.run('tideJournal()'),/data-tide-finish/);
 b.run("tide.notes='排练的笔记';tideOpenDevice('black')");assert.equal(b.run('tide.notes'),'潮声的笔记');
 b.run("phoneState.app='games'");assert.match(b.run('phoneScreen()'),/贪吃蛇/);
 b.run("phoneState.app='music'");assert.match(b.run('phoneScreen()'),/海堤_1018/);
 assert.match(b.run('phoneScreen()'),/data-memory-track/);
});

test('PC desktop and native phone selection do not consume or hide the Tide story progress',()=>{const b=boot();b.run("tide.active=true;tide.device='black';visitMode='pc';phoneState.app='browser'");assert.match(b.run('phoneScreen()'),/PERSONAL INTERNET/);assert.equal(b.run('tide.active'),true);b.run("visitMode='phone';phoneState.app='home'");assert.match(b.run('phoneScreen()'),/存储卡已插入|退出故事，普通游玩/);});

test('Tide QQ conversations are handset-specific, persistent, and do not send SMS drafts',()=>{
 const b=boot();b.run("tide.device='silver';tideChatReply('song')");assert.match(b.run('tideQQ()'),/下雨以前/);assert.equal(b.run('tide.replied'),false);
 b.run("tide.device='white'");assert.doesNotMatch(b.run('tideQQ()'),/下雨以前/);b.run("tideChatReply('photo')");assert.match(b.run('tideQQ()'),/十年以后/);
 const c=boot(Object.fromEntries(b.values));c.run("tide.device='silver'");assert.match(c.run('tideQQ()'),/下雨以前/);assert.equal(c.run("tideChatReply('unknown')"),false);
 c.run("tide.device='black';tideView='qq:chat';tideChatReply('file')");assert.match(c.run('tideQQ()'),/不能替你确定/);assert.equal(c.run('tide.replied'),false);
});
test('Only the annotated gate photo reverse counts as the Tide reverse evidence',()=>{
 const b=boot();b.run("tide.device='black';tideView='back:pier';tideAlbum()");assert.equal(b.run("tide.seen.includes('back')"),false);
 b.run("tideView='back:gate';tideAlbum()");assert.equal(b.run("tide.seen.includes('back')"),true);
});
test('Campus evidence overlays never leak into a collected Tide handset',()=>{
 const b=boot();b.run("tide.active=true;tide.device='black';campus.started=true;campusPanel='photo';phoneState.app='photos';visitMode='phone'");assert.doesNotMatch(b.run('phoneScreen()'),/广播社|第02案/);assert.match(b.run('phoneScreen()'),/DSC0018/);
 b.run("tide.active=false;campusPanel='';phoneState.app='photos'");assert.match(b.run('phoneScreen()'),/广播社报名单/);
});

test('Ordinary collected phones have distinct browsable albums with safe photo metadata',()=>{
 const b=boot();b.run("tide.device='silver';tideView=''");assert.match(b.run('tideAlbum()'),/排练以后/);assert.doesNotMatch(b.run('tideAlbum()'),/毕业的夏天/);
 b.run("tideView='lifeback:1'");assert.match(b.run('tideAlbum()'),/忘了带午饭/);assert.equal(b.run('tide.seen.length'),0);
 b.run("tide.device='white';tideView='lifemeta:0'");assert.match(b.run('tideAlbum()'),/2010-06-05/);assert.match(b.run('tideAlbum()'),/并非人物实拍/);
 b.run("tideView='lifephoto:1'");assert.match(b.run('tideAlbum()'),/原创人像/);assert.match(b.run('tideAlbum()'),/下一张/);
 b.run("tideView='lifephoto:999'");assert.match(b.run('tideAlbum()'),/生活照片/);assert.equal(b.run('tide.seen.length'),0);
});

test('Campus notebook only offers rereading discovered records and keeps bounded escaped notes',()=>{
 const b=boot();b.run("campus.started=true;campusPanel='notebook';campusCollect('sms')");
 const markup=b.run('campusMarkup()');assert.match(markup,/data-campus="review:sms"/);assert.doesNotMatch(markup,/data-campus="review:qq"/);assert.doesNotMatch(markup,/去短信找附件/);
 b.run(`campusSaveNotes(${JSON.stringify('<script>private notes</script>')})`);assert.doesNotMatch(b.run('campusMarkup()'),/<script>private/);assert.match(b.run('campusMarkup()'),/&lt;script/);
 const c=boot(Object.fromEntries(b.values));assert.equal(c.run('campus.notes'),'<script>private notes</script>');c.run("campusSaveNotes('x'.repeat(1400))");assert.equal(c.run('campus.notes.length'),1200);
});
