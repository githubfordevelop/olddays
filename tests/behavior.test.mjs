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
      scrollTo() {},
      location: { assign: runtime.onNavigate || (() => {}) },
    },
    localStorage: {
      getItem: (k) => values.get(k) ?? null,
      setItem: (k, v) => values.set(k, v),
    },
    URL,
    AbortSignal,
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
    "app.js",
  ])
    vm.runInContext(readFileSync("dist/" + file, "utf8"), context, {
      filename: file,
    });
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
    assert.match(html, /加入编辑部/);
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
