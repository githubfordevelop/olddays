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
  assert.match(b.document.querySelector("#content").innerHTML, /2005 年大新闻/);
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
  const home=app.run('renderHome()');
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

test('phone Java imports expose a local file picker and accept full numeric controls',()=>{const {run}=boot();assert.match(run('phoneJavaMarkup()'),/data-pocket-java-import/);for(const key of [-1,-5,35,42,48,49,57])assert.equal(run('validPocketJavaKey('+key+')'),true);for(const key of [0,1000,-99])assert.equal(run('validPocketJavaKey('+key+')'),false);assert.equal(run('pocketJavaChoice'),'ancient-empires-2');});

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
