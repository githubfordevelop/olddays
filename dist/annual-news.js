"use strict";
const CHRONICLE =
  "https://www.gov.cn/xinwen/2019-09/27/content_5434223.htm?allContent=";
const yearEvents = {
  1996: [["10.10", "精神文明建设决议通过"]],
  1997: [["07.01", "香港回归"]],
  1998: [["夏季", "抗洪抢险"]],
  1999: [["12.20", "澳门回归"]],
  2000: [["11.08", "西电东送工程启动"]],
  2001: [["12.11", "中国加入世贸组织"]],
  2002: [["12.27", "南水北调工程开工"]],
  2003: [["10.15", "神舟五号升空"]],
  2004: [
    [
      "01月",
      "双火星车登陆火星",
      "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
      "NASA",
    ],
    [
      "08月",
      "雅典奥运会举行",
      "https://olympics.com/en/olympic-games/athens-2004",
      "国际奥委会",
    ],
  ],
  2005: [
    [
      "10.12",
      "神舟六号升空",
      "https://www.gov.cn/ztzl/2005-10/17/content_78741.htm",
      "中国政府网",
    ],
  ],
  2006: [["07.01", "青藏铁路通车"]],
  2007: [["10.24", "嫦娥一号发射"]],
  2008: [
    ["08.01", "京津城际铁路通车"],
    ["08.08", "北京奥运会开幕"],
    ["09.27", "神舟七号太空出舱"],
  ],
  2009: [["10.01", "新中国成立六十周年"]],
  2010: [
    ["04.30", "上海世博会开幕式"],
    ["10.01", "嫦娥二号发射"],
  ],
  2011: [
    [
      "09.29",
      "天宫一号发射",
      "https://statistics.cmse.gov.cn/xwzx/yzjz/201109/t20110929_44860.html",
      "中国载人航天工程网",
    ],
  ],
  2012: [["06.27", "蛟龙号下潜7062米"]],
  2013: [["12.14", "嫦娥三号月面软着陆"]],
  2014: [["11.17", "沪港通启动"]],
  2015: [
    [
      "10月",
      "屠呦呦获诺贝尔奖",
      "https://www.nobelprize.org/prizes/medicine/2015/tu/biographical/",
      "诺贝尔奖官网",
    ],
  ],
  2016: [["08.16", "墨子号卫星发射"]],
  2017: [["05.05", "C919首飞成功"]],
  2018: [
    ["10.23", "港珠澳大桥开通仪式"],
    ["12.08", "嫦娥四号发射"],
  ],
  2019: [["01.03", "嫦娥四号月背着陆"]],
  2020: [
    [
      "07.30",
      "毅力号火星车启程",
      "https://www.jpl.nasa.gov/news/press_kits/mars_2020/landing/mission/",
      "NASA/JPL",
    ],
  ],
  2021: [
    [
      "02.18",
      "毅力号登陆火星",
      "https://science.nasa.gov/blogs/perseverance-mars-rover/2021/02/18/blog-nasas-perseverance-has-landed/",
      "NASA",
    ],
  ],
  2022: [
    [
      "07.12",
      "韦布望远镜首批科学影像发布",
      "https://science.nasa.gov/mission/webb/webbs-first-images/",
      "NASA",
    ],
  ],
  2023: [
    [
      "09.24",
      "OSIRIS-REx带回小行星样本",
      "https://www.nasa.gov/news-release/nasas-first-asteroid-sample-has-landed-now-secure-in-clean-room/",
      "NASA",
    ],
  ],
  2024: [
    [
      "06.25",
      "嫦娥六号月背采样返回",
      "https://www.cnsa.gov.cn/n6758823/n6758838/c10565180/content.html",
      "国家航天局",
    ],
  ],
  2025: [
    [
      "05.29",
      "天问二号发射",
      "https://www.cnsa.gov.cn/n6758823/n6758838/c10676920/content.html",
      "国家航天局",
    ],
  ],
};

const eventDetails = {
  "2004-0": {
    category: "科学探索",
    deck: "两台火星车，在同一个月抵达另一颗星球。",
    paragraphs: [
      "2004年1月，勇气号与机遇号先后在火星着陆。两台探测车组成火星探测漫游者任务，分别在不同地点寻找火星过去存在水的线索。",
      "它们通过地面行驶、拍摄和分析岩石与土壤，为研究火星早期环境提供了实地资料。下方 NASA 任务页保留了项目背景与探测记录。",
    ],
    facts: [
      ["事件时间", "2004年1月"],
      ["任务", "Mars Exploration Rovers"],
      ["探测器", "Spirit / Opportunity"],
    ],
    source:
      "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
    sourceName: "NASA 任务资料",
  },
  "2004-1": {
    category: "体育",
    deck: "2004年的夏天，奥运会回到雅典。",
    paragraphs: [
      "2004年8月13日至29日，雅典举办第28届夏季奥林匹克运动会。来自各地的运动员在希腊相聚，奥运会再次回到现代奥林匹克运动的发源城市。",
      "这条档案采用全年回顾口径。具体赛事与成绩，请在国际奥委会的雅典2004资料页继续查阅。",
    ],
    facts: [
      ["举办地", "希腊 · 雅典"],
      ["赛期", "2004年8月13日至29日"],
    ],
    source: "https://olympics.com/en/olympic-games/athens-2004",
    sourceName: "国际奥委会资料",
  },
  "2005-0": {
    category: "中国航天",
    deck: "从一人一天，迈向多人多天的载人飞行。",
    paragraphs: [
      "2005年10月12日，神舟六号载人飞船从酒泉升空。费俊龙、聂海胜执行这次任务，并于10月17日返回。",
      "这次飞行开展了多人、多天在轨任务。中国政府网刊载的新华社全记录按日期梳理了出征、发射、在轨工作和返回等过程。",
    ],
    facts: [
      ["发射", "2005年10月12日"],
      ["返回", "2005年10月17日"],
      ["航天员", "费俊龙、聂海胜"],
    ],
    source: "https://www.gov.cn/ztzl/2005-10/17/content_78741.htm",
    sourceName: "中国政府网 · 新华社飞天全记录",
  },
  "2008-0": {
    category: "交通",
    deck: "京津之间，多了一条高速铁路。",
    paragraphs: [
      "2008年8月1日，京津城际铁路通车运营。它连接北京与天津，是当年交通建设中的一项重要进展。",
      "本条目根据官方大事记整理。来源全文包含相关历史背景与后续发展，阅读时请区分事件当年和后来补充的信息。",
    ],
    facts: [
      ["通车日期", "2008年8月1日"],
      ["连接城市", "北京、天津"],
    ],
  },
  "2008-1": {
    category: "体育",
    deck: "北京，迎来属于整个夏天的盛会。",
    paragraphs: [
      "2008年8月8日至24日，第29届夏季奥林匹克运动会在北京举行。这是中国首次举办夏季奥运会。",
      "这一页是对全年大事的简要回顾。正式赛程、项目和赛事档案，可在奥林匹克官方资料中进一步核对。",
    ],
    facts: [
      ["举办地", "中国 · 北京"],
      ["开幕", "2008年8月8日"],
      ["闭幕", "2008年8月24日"],
    ],
  },
  "2008-2": {
    category: "中国航天",
    deck: "中国航天员首次走出飞船。",
    paragraphs: [
      "2008年9月27日，神舟七号任务实施航天员空间出舱活动。中国成为第三个独立掌握空间出舱技术的国家。",
    ],
    facts: [
      ["事件时间", "2008年9月27日"],
      ["任务", "神舟七号"],
    ],
  },
  "2010-0": {
    category: "城市与文化",
    deck: "城市，让生活更美好。",
    paragraphs: [
      "2010年4月30日，上海世博会举行开幕式；展会于5月1日至10月31日向公众开放，主题是“城市，让生活更美好”。",
      "不同国家与地区通过展馆呈现对城市生活的想象。国际展览局的资料页介绍了主题、举办背景与展会信息。",
    ],
    facts: [
      ["举办城市", "上海"],
      ["开幕式", "2010年4月30日"],
      ["展期", "2010年5月1日至10月31日"],
    ],
    source: "https://bie-expo.bie-paris.org/site/en/2010-shanghai",
    sourceName: "国际展览局资料",
  },
  "2010-1": {
    category: "中国航天",
    deck: "中国探月工程继续向前。",
    paragraphs: [
      "2010年10月1日，嫦娥二号探测器成功发射。这是中国探月工程继嫦娥一号之后的又一次探测任务。",
    ],
    facts: [
      ["发射日期", "2010年10月1日"],
      ["任务", "嫦娥二号"],
    ],
  },
  "2018-0": {
    category: "交通与工程",
    deck: "一座大桥，把粤港澳三地连在一起。",
    paragraphs: [
      "2018年10月23日，港珠澳大桥开通仪式在广东珠海举行。大桥跨越伶仃洋，连接香港、珠海和澳门。",
      "这是一项由粤港澳三地合作建设的跨海交通工程。下方资料介绍了开通仪式和工程背景；条目日期指仪式举行时间。",
    ],
    facts: [
      ["开通仪式", "2018年10月23日"],
      ["地点", "广东 · 珠海"],
      ["连接地区", "香港、珠海、澳门"],
    ],
    source:
      "https://wap.sasac.gov.cn/n2588025/n10248920/c12378736/content.html",
    sourceName: "国务院国资委历史资料",
  },
  "2018-1": {
    category: "中国航天",
    deck: "向着尚未软着陆过的月球背面出发。",
    paragraphs: [
      "2018年12月8日2时23分，嫦娥四号探测器在西昌卫星发射中心发射升空，开启面向月球背面的探测任务。",
      "本条目记录的是2018年的发射。着陆属于2019年的另一条大事，年度列表中分别记录，避免把两个时间混为一谈。",
    ],
    facts: [
      ["发射", "2018年12月8日"],
      ["发射场", "西昌卫星发射中心"],
    ],
    source:
      "https://www.cnsa.gov.cn/n6758823/n6758844/n6760026/n6760027/c6804677/content.html",
    sourceName: "国家航天局任务资料",
  },
};

function annualNewsMarkup(context) {
  const events = yearEvents[year()] || [];
  return `<section class="daily-news annual-news" data-context="${context}"><header class="daily-news-head"><span>▤ ${year()} 年大新闻</span><small>${events.length} 条精选</small></header><div class="news-controls"><button data-year-step="-1">‹ 上一年</button><span>全年回顾 · 点击阅读详情</span><button data-year-step="1">下一年 ›</button></div><div class="news-feed">${events.length ? events.map((n, i) => `<article class="news-item ${i === 0 ? "news-top-story" : ""}"><time>${n[0]}</time><a href="archaeo://news/${year()}/${i}" data-news-year="${year()}" data-news-index="${i}">${i === 0 ? '<span class="headline-tag">年度焦点</span>' : ""}${n[1]}<span class="news-read-more">阅读详情 ›</span></a><small>${n[3] || "中国政府网"}</small></article>`).join("") : '<div class="news-empty">这个年份的大事记正在整理中。</div>'}</div><footer class="news-foot"><button class="more-news" data-news-center>查看更多新闻 › 年度新闻中心</button><span>10 篇精选长文 + ${yearbookCounts[year()] || 0} 条年表记录</span><a href="https://github.com/githubfordevelop/olddays/issues/new/choose" target="_blank" rel="noopener noreferrer">一起补完这份互联网记忆 ›</a></footer></section>`;
}

function openAnnualStory(y, i) {
  if (
    !/^\d{4}$/.test(String(y)) ||
    !Number.isInteger(Number(i)) ||
    !yearEvents[y]?.[i]
  )
    return;
  if (year() !== String(y)) date = String(y) + "-12-31";
  const event = yearEvents[y][i];
  navigate({
    type: "news",
    eventYear: String(y),
    eventIndex: Number(i),
    name: event[1],
    url: `archaeo://news/${y}/${i}`,
  });
}

function renderAnnualStory(page) {
  const y = page.eventYear,
    i = page.eventIndex,
    event = yearEvents[y]?.[i];
  if (!event)
    return '<section class="archive-view"><h1>暂未收录这条新闻</h1></section>';
  const detail = eventDetails[`${y}-${i}`] || {};
  const source = detail.source || event[2] || CHRONICLE;
  const sourceName = detail.sourceName || event[3] || "中国政府网";
  const sections = detail.sections || [
    {
      title: "事件回顾",
      paragraphs: detail.paragraphs || [event[4] || event[1]],
    },
  ];
  const textLength = sections.reduce(
    (n, s) => n + s.paragraphs.join("").length,
    0,
  );
  const facts = [
    ["档案年份", `${y}年`],
    ["时间标记", event[0]],
    [
      "阅读篇幅",
      `${textLength}字 · 约${Math.max(1, Math.ceil(textLength / 400))}分钟`,
    ],
  ];
  const rows = yearEvents[y] || [];
  const storyLink = (j, label) =>
    `<a href="archaeo://news/${y}/${j}" data-news-year="${y}" data-news-index="${j}">${label}${escapeHTML(rows[j][1])}</a>`;
  const related = rows.map((n, j) => ({ n, j })).filter((x) => x.j !== i);
  const license = detail.revision
    ? `<div class="article-attribution"><p>以下正文资料由维基百科贡献者共同编写，本站做简体转换、段落节选和版式编排。</p><ul>${(detail.sources || [detail]).map((ref) => `<li>《${escapeHTML(ref.topic)}》 · <a href="${escapeHTML(ref.source)}" target="_blank" rel="noopener noreferrer">固定版本 ${ref.revision}</a> · <a href="${escapeHTML(ref.history)}" target="_blank" rel="noopener noreferrer">作者与修订历史</a></li>`).join("")}</ul><p>正文资料许可：<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>。复古版式不表示这些文字在当年已经发表。</p></div>`
    : "";
  return `<article class="historical-article portal-article" data-era="${Number(y) < 2008 ? "early" : Number(y) < 2014 ? "classic" : "modern"}">
    <div class="portal-masthead"><strong>考古资讯<span>NEWS · ${y}</span></strong><small>把那一年的世界，重新读一遍</small></div>
    <nav class="portal-nav" aria-label="新闻栏目"><button data-action="home">新闻首页</button><span>国内 · 国际 · 科技 · 体育 · 社会</span><a href="https://github.com/githubfordevelop/olddays/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">加入编辑部</a></nav>
    <div class="article-paper-top"><span>考古资讯 &gt; ${y}年档案 &gt; 正文</span><button data-action="home">返回年度首页</button></div>
    <div class="portal-columns"><div class="portal-main"><header><div class="article-section">${y} 年度新闻档案</div><h1>${escapeHTML(event[1])}</h1><div class="article-meta"><span>${y}年 · ${escapeHTML(event[0])}</span><span>资料整理 / 考古浏览器</span></div></header>
    <div class="article-toolbar"><span>正文阅读</span><button data-article-size="small" aria-label="小号正文字体">小</button><button data-article-size="normal" aria-label="标准正文字体">中</button><button data-article-size="large" aria-label="大号正文字体">大</button><span>约${Math.max(1, Math.ceil(textLength / 400))}分钟</span></div>
    <p class="article-retrospective">历史资料版｜沿用旧网页的阅读版式，正文来自后来整理的百科资料，可能涉及后续发展；并非${y}年的即时报道。</p>
    <nav class="article-toc" aria-label="正文目录">${sections.map((s, k) => `<a href="#story-section-${k}">${k + 1}. ${escapeHTML(s.title)}</a>`).join("")}</nav>
    <div class="article-body" data-reading-size="normal">${sections.map((s, k) => `<section id="story-section-${k}"><h2>${escapeHTML(s.title)}</h2>${s.paragraphs.map((p) => `<p>${escapeHTML(p)}</p>`).join("")}${s.source ? `<a class="section-citation" href="${escapeHTML(s.source)}" target="_blank" rel="noopener noreferrer">本节资料出处 ↗</a>` : ""}</section>`).join("")}</div>
    <div class="article-end">—— 本篇资料阅读完毕 ——</div>
    <section class="article-source"><h2>资料来源与阅读说明</h2><p>${escapeHTML(sourceName)}</p><a class="primary" href="${escapeHTML(source)}" target="_blank" rel="noopener noreferrer">查看完整资料 ↗</a>${license}<p class="scene-note">事件标题为编辑拟定，正文为所列条目的节选，原条目可能讨论更长的时间范围。欢迎附可靠出处提交勘误。</p></section>
    <nav class="article-pagination" aria-label="上一篇和下一篇">${i > 0 ? storyLink(i - 1, "上一篇：") : "<span>本年度第一篇</span>"}${i < rows.length - 1 ? storyLink(i + 1, "下一篇：") : "<span>本年度最后一篇</span>"}</nav>
    <section class="article-invite"><h2>这份互联网记忆，等你来补完</h2><p>会写代码、记得旧网址、愿意查资料，或者只是想帮忙试一试手机，都欢迎加入。</p><a href="https://github.com/githubfordevelop/olddays/issues/new/choose" target="_blank" rel="noopener noreferrer">我要参与 / 提交线索</a><a href="https://github.com/githubfordevelop/olddays/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">查看参与指南</a></section></div>
    <aside class="portal-sidebar"><section class="article-facts"><h2>事件资料卡</h2><dl>${facts.map(([k, v]) => `<div><dt>${escapeHTML(k)}</dt><dd>${escapeHTML(v)}</dd></div>`).join("")}</dl></section><section class="article-related"><h2>${y}年 · 其他大事</h2>${related.map(({ j }) => storyLink(j, "")).join("")}</section><div class="portal-stamp">OLD DAYS<br>${y}<small>历史资料 · 共同整理</small></div></aside></div>
    <footer class="portal-footer">考古资讯 · 记忆可以重访，历史需要查证。<br>开源共建 / Olddays</footer></article>`;
}

document.addEventListener("click", (e) => {
  const sizeButton = e.target.closest("[data-article-size]");
  if (sizeButton) {
    const body = document.querySelector(".article-body");
    if (
      body &&
      ["small", "normal", "large"].includes(sizeButton.dataset.articleSize)
    )
      body.dataset.readingSize = sizeButton.dataset.articleSize;
    return;
  }
  const story = e.target.closest("[data-news-index]");
  if (story) {
    e.preventDefault();
    openAnnualStory(story.dataset.newsYear, story.dataset.newsIndex);
    return;
  }
  const el = e.target.closest("[data-year-step]");
  if (el) {
    const y = Number(year()) + Number(el.dataset.yearStep);
    const maxDay = new Date(
      Date.UTC(y, Number(date.slice(5, 7)), 0),
    ).getUTCDate();
    const day = Math.min(Number(date.slice(8)), maxDay);
    applyDate(`${y}${date.slice(4, 8)}${String(day).padStart(2, "0")}`);
  }
});
