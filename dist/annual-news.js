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
  return `<section class="daily-news annual-news" data-context="${context}"><header class="daily-news-head"><span>▤ ${year()} 年大新闻</span><small>${events.length} 条精选</small></header><div class="news-controls"><button data-year-step="-1">‹ 上一年</button><span>全年回顾 · 点击阅读详情</span><button data-year-step="1">下一年 ›</button></div><div class="news-feed">${events.length ? events.map((n, i) => `<article class="news-item ${i === 0 ? "news-top-story" : ""}"><time>${n[0]}</time><a href="archaeo://news/${year()}/${i}" data-news-year="${year()}" data-news-index="${i}">${i === 0 ? '<span class="headline-tag">年度焦点</span>' : ""}${n[1]}<span class="news-read-more">阅读详情 ›</span></a><small>${n[3] || "中国政府网"}</small></article>`).join("") : '<div class="news-empty">这个年份的大事记正在整理中。</div>'}</div><footer class="news-foot">编辑精选，非完整年鉴。站内导读附来源；部分资料为后来发表的历史回顾。</footer></section>`;
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
  const sourceName =
    detail.sourceName || event[3] || "中国政府网 · 中华人民共和国大事记";
  const paragraphs = detail.paragraphs ||
    (event[4] ? [event[4]] : null) || [
      `${y}年，${event[1]}。这项事件以“${event[0]}”为时间标记收录在本年度精选中。`,
    ];
  const facts = detail.facts || [
    ["年份", `${y}年`],
    ["事件时间", event[0]],
    ["事件", event[1]],
  ];
  const related = (yearEvents[y] || [])
    .map((n, j) => ({ n, j }))
    .filter((x) => x.j !== i);
  return `<article class="historical-article"><div class="article-paper-top"><span>考古资讯 / ${y}</span><button data-action="home">‹ 返回年度首页</button></div><header><div class="article-section">${escapeHTML(detail.category || "年度大事")} · 历史回顾</div><h1>${escapeHTML(event[1])}</h1>${detail.deck ? `<p class="article-deck">${escapeHTML(detail.deck)}</p>` : ""}<div class="article-meta"><span>事件：${y} · ${escapeHTML(event[0])}</span><span>考古浏览器整理</span></div></header><div class="article-retrospective">这是一篇编辑整理的历史导读，不是当年的原始报道。年度大新闻按全年回顾展示。</div><div class="article-body">${paragraphs.map((p) => `<p>${escapeHTML(p)}</p>`).join("")}</div><section class="article-facts"><h2>事件资料卡</h2><dl>${facts.map(([k, v]) => `<div><dt>${escapeHTML(k)}</dt><dd>${escapeHTML(v)}</dd></div>`).join("")}</dl></section><section class="article-source"><h2>查阅来源</h2><p>${escapeHTML(sourceName)}</p><a class="primary" href="${escapeHTML(source)}" target="_blank" rel="noopener noreferrer">查看完整资料 ↗</a><p class="scene-note">来源网站可能包含后续更新或相关内容；以原站标注为准。这里不复制整篇原报道。</p></section>${related.length ? `<section class="article-related"><h2>同一年，也发生了</h2>${related.map(({ n, j }) => `<a href="archaeo://news/${y}/${j}" data-news-year="${y}" data-news-index="${j}">${n[0]}　${escapeHTML(n[1])} ›</a>`).join("")}</section>` : ""}</article>`;
}

document.addEventListener("click", (e) => {
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
