# 新闻正文与资料许可

`dist/news-articles.js` 的正文资料由维基百科贡献者共同编写，依 **CC BY-SA 4.0** 使用，不属于代码 MIT 许可。每篇数据均保留条目名称、固定修订版本、作者修订历史和来源网址；`docs/article-sources.json` 提供机器可读的来源清单。

本项目所做修改为：简体转换、节选段落、删除脚注和空白、分段、选择小标题与网页编排。标题是本站为年度事件拟定的标题，正文可能包含其主题的较长历史背景。页面明确标记为后来的历史资料版，复古版式不意味着该文字在当年已经发表。

再分发或改写这些正文时，请保留来源、贡献者署名、修改说明及本许可，衍生内容继续适用相同许可。许可全文：<https://creativecommons.org/licenses/by-sa/4.0/legalcode.zh-hans>。

本站没有取得新浪、腾讯、新华社等媒体原稿的全文转载权，因此不将它们的当年报道全文复制为本站内容。机构新闻与当年存档可作为另行查阅的外链。

## Expanded yearbook records

`data/yearbook.json` and `dist/yearbook.js` contain dated event excerpts from Chinese Wikipedia year/month pages. Each record retains a fixed revision URL and an author-history URL. Text is by Wikipedia contributors under CC BY-SA 4.0. Changes: extraction of event list paragraphs, removal of reference markers, selection and headline shortening for the index. Full extracted paragraphs remain in record detail pages. These are later historical compilations, not contemporary news reports. Some yearbook records overlap with the 300 long-form reading articles; counts are record counts, not deduplicated events. `scripts/import-yearbook.py` reproduces the import; the offline data is committed so CI does not depend on Wikimedia availability.
