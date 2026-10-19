# 影音资料来源

- Elephants Dream（2006）：https://orange.blender.org/download/ ，开放电影；播放文件来自 Internet Archive 的 ElephantsDream 条目，metadata 指向 CC BY 3.0 US。署名 Blender Foundation / Netherlands Media Art Institute / Elephants Dream。播放器原样串流，不在本仓库存放影片。
- Big Buck Bunny（2008）：https://peach.blender.org/download/ ，CC BY 3.0；播放文件来自 Internet Archive 的 BigBuckBunny1280x720Stereo 条目。署名 Blender Foundation / Big Buck Bunny。播放器原样串流，不在本仓库存放影片。
- 音乐：本站合成的原创旋律，无采样，不是旧歌曲录音。scripts/make-retro-music.py 可生成波形，audio/nostalgia-original.mp3 按项目 MIT 许可分发。

影片是所选年份之前已经发布的开放作品示例，不冒充当年流行排行。其他音乐、视频、Flash、软件和小说条目仅是历史域名线索，点击后查询 Wayback，不提供商业软件安装包或未获授权的小说全文。

## 口袋影音与画报补充

- NASA 2001 地球变焦：https://svs.gsfc.nasa.gov/2255 。NASA 2004 太阳与火星：https://svs.gsfc.nasa.gov/2924 。播放器直接串流 NASA 文件，使用说明：https://svs.gsfc.nasa.gov/help/ 。不是当年热门视频排行。
- `moon-letter`、`summer-ringtone` 为原创合成配乐；`elise-memory` 是公版贝多芬旋律的自行合成演奏，不使用商业录音。
- 图片和四张年代海报为 AI 辅助原创怀旧创作，人物为虚构成年角色，非历史照片、历史原刊或官方广告。生成内容说明见 `data/memory-image-prompts.json`。短信号码为不可订购的演示占位符。
- 《秋天不回来》仅作为彩铃回忆资料主题；本站不分发原曲录音或歌词。正版演唱入口：https://tv.cctv.com/2018/12/16/VIDEW56WwKAMSwFzClIi7tle181216.shtml ；年代资料：https://ent.cctv.com/20080606/104144.shtml 。新版宣传视频使用原创 `moon-letter` 配乐。
- 动漫猜测楼是新创作的模拟讨论，不是抓取的历史论坛原帖。按年份保守限定早期设定，不公布后续答案；原作名称归各自权利人，海报人物为原创。投票和回复仅保存在本机。

## 旧日报刊亭

11条刊物目录的资料链接逐条保存在 `dist/magazine-kiosk.js`，包括湖北省版权服务资料、出版社品牌资料、期刊协会与公共图书馆资料、官方阅读入口及历史报道。知音漫客从2006年、昕薇从正式首刊2001年、漫友从2002年的杂志体验范围开放；瑞丽系列分别展示。所有目录封面是原创排版文字卡，不是原刊扫描；回忆短文为本站新创作，不是杂志原文。站内不提供未经授权的整期PDF、原刊内页或写真图集。

## 0.5 阅读与动漫资料

- `dist/data/anime-airdates.json`：TVmaze API常规剧集播出元数据，采集于2026-10-19，截断至2025-12-31；火影495、疾风传488、航海王动画1505（不是真人版）、死神1905、千年血战80375。CC BY-SA 4.0，页面与文件保留署名，派生数据同许可。日本原播日期口径，不等于中国播出/字幕组日期，不含特别篇。累计集数由日期筛选后的常规集序列计算。原始集名未自行翻译。
- 动漫画面来自对应系列第一集的 TVmaze 图片字段，仅用于作品识别和初期画面资料；保留原作权利。API允许图片缓存：https://www.tvmaze.com/api#images 。图片来源URL保存在各系列imageSource字段，图片不作为本站MIT原创素材。
- 《故事会》1994年第5期封面：新浪收藏2018年美术馆报道 https://collection.sina.com.cn/yjjj/2018-01-03/doc-ifyqcwaq7234781.shtml ；《知音漫客》早期创刊号封面：搜狐历史回顾 https://www.sohu.com/na/476237129_100193305 。仅展示封面用于刊物识别，保留水印，非整期扫描；权利归原刊物/作者，不适用本站MIT许可。封面日期不晚于当前所选日期才显示；其余卡片明确标为原创导览封面。
- 《故事会》正版App说明列有1990年至今过刊：https://apps.apple.com/cn/app/id1097655732 。正版内容可能需要订阅，本站不绕过登录或付费。知音漫客网正版漫画目录：https://www.zymk.cn/sort/28.html ，这是当前平台，不当作所选年份的原刊。
- “旧日阅读本”含4篇完整原创故事、1篇原创时尚图文、1篇四页原创漫画《雨停以前》。不是上述真实杂志的原文或内页。漫画由内置image_gen辅助绘制原创分镜，文件images/reading/rain-comic.jpg；原创虚构角色，非历史照片。
- 设备馆为原创交互模拟，非任何品牌原厂固件；20词词库是小型体验词库。USB、电池和容量仅界面设定；音频、音量、锁键、字典、视频操作有实际网页行为。

旧手机报刊应用沿用同一原创阅读库：每段一页，实体4/6键翻页、2/8滚动、软键返回；手机与MP3等设备支持本机PNG场景导出。

## Real periodical readers (v0.5.1)

- 知音漫客 official title list https://www.zymk.cn/407/ links chapter 1 to https://www.kanman.com/5471/1.html. Anonymous reader visibly loads 44 pages. Embedded without copying panels or stripping headers. Historical work on the current platform, not a scanned issue. Conservative availability from 2009; not an assertion of first serialization date.
- 故事会 official library https://app.touchread.cn/app/dt/pd/1454027812?s=1 links 1999 issue 1 to https://app.touchread.cn/app/dt/bi/1454027812/414177-386538696da9d5?s=1. Detail explicitly credits 上海故事会文化传媒有限公司 and costs CNY5. No public full text observed; preserve purchase restriction, no paid access bypass.
- Other magazine interiors remain unavailable rather than substituting original work. Original night reading stays in a separate optional section. Publisher pages may contain contemporary recommendations. Cross-origin reader is not captured by built-in canvas export.

## Pocket expansion and open games (v0.6)

- 5230 (2009), N97 (2009), N95 (2007) are CSS style recreations, not manufacturer firmware. Pocket mode fills browser viewport, retaining a device bezel. Physical orientation is controlled by the user; the layout button resizes the simulated display. N97 keyboard is a local note pad.
- 12 Java ME games built from https://github.com/agneay/j2me-100-games, MIT license retained with sources.zip and NOTICE.txt under javame/open-games/. These are recent open-source recreations, NOT historical commercial game releases. Rebuild: clone upstream to work/j2me-open-games at the commit recorded in NOTICE, then run python3 scripts/build-open-games.py with the existing ecj compiler and MIDP library.
- Added 偷星九月天 chapter 1: official https://www.zymk.cn/38/3811.html redirects to https://www.kanman.com/25935/1.html. Conservative availability from 2008, not an assertion of exact issue date.
- Investigated 读者原创版 2015 anthology trial on Dangdang; live detail says withdrawn, so do not claim the trial is readable. Dooland historical 2011 reader failed to load and was not added as working content.
- Automatic large home banner and pocket lab side advertisements are hidden. Ad magazine remains an intentional separate destination.

Java gameplay QA: Brick Buster launch, play, ball launch, movement and pause checked after disabling native tone generation. Other JARs are build checked; full gameplay compatibility is not claimed. Initial automated screenshot sweep ran too early to confirm runtime readiness and is not treated as gameplay verification. Native tones disabled in modified Sfx.java; modified sources included.
