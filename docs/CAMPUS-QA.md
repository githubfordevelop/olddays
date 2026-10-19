# 2026-10-20 playtest and new candidate

## Observed on the public build ce093f9 / earlier already-loaded ce5f26a UI

- A previous session had disabled Dreamnet. Confirm-download correctly refused the purchase; this was only a short toast, which looked unresponsive. Re-enabled the virtual service through its existing legacy menu for testing.
- Bought 神作20 through the advert, compose, SMS reply and confirmation sequence: 97.00 -> 77.00. Refunded through My downloads: 77.00 -> 97.00; ownership row removed and ledger refund appeared.
- Bought 铃声01包月 through the SMS sequence: 97.00 -> 92.00, one subscription appeared. Cancelled it, advanced the simulated month: subscription count zero, balance remained 92.00. The cancelled monthly ownership label wrongly said one-time download.
- Selected all 18 device options and read their actual desktops. MP3 had only music; MP4 music/photo/video; network MP5 and PSP showed their media/browser/game set; monochrome handsets had the four native entries.
- Nokia3310 exterior number buttons: 7, plus on its calculator, 2, Navi confirmation produced 9.
- MP3 local audio played (paused=false, no media error). MP4 original 12-second video loaded (readyState4, no media error) and advanced to 4.5s.
- N73 Grid Tactics loaded to its canvas title screen, exterior virtual confirm started a battle, right moved the selected unit. Screenshot showed a duplicate general navigation pad below the game pad, consuming space.
- In-app browser does not implement CDP Input.dispatchTouchEvent. These are browser mouse/keyboard tests, not physical-phone multitouch validation.

## Candidate implementation

- Remove the redundant general keypad whenever the Java pad is present; increase number-key height, keep the game-switch drawer closed by default.
- Keep purchase failures as an inline status; cancelled monthly ownership receives a truthful label. Applause wording reflects the user's choice of no real payments.
- Original case02 Seven-seventeen: six evidence sources (SMS, photo, QQ, repair register, forum, audio), a selected-device identity, three-part final deduction, persisted progress, hints, and an epilogue in anime club. The audio is explicitly a fictional transcript plus original synthesized illustrative music.
- Separate PC desktop with Internet Explorer styled chrome, address/search, tabs and archive viewing; mobile browser additionally offers PC-layout archive viewing. No hard-coded UC chrome in PC mode.
- 12 year-gated anime collection/discussion cards, personal notes and collection, plus existing licensed platform entries. New title/year sources: Toei official Digimon/Dragon Ball/Slam Dunk catalogue pages, linked on each card. Collection cards are not full video files or authorized merchandise.

## Blocking condition

After the local preview server had stopped, navigation to localhost:4184 returned ERR_CONNECTION_REFUSED and the app replaced the tab with a data: error page. Server restarted and returns HTTP200. The Browser Use URL policy then rejected control/navigation from that data: document. User was asked to manually navigate the tab to localhost:4184. No alternate browser, tab, shell or CDP bypass is permitted. New UI screenshots and case02 end-to-end playthrough remain pending until that action.

The public playtest above is actual observed evidence; the new candidate must not be reported as visually verified based on unit checks alone.

## Restored UI verification (user manually restored the tab)

The user explicitly replied 已打开. Confirmed tab2 HTTP localhost:4184; the data-page block no longer applies. Reloaded with versioned script references after an initially cached handset script caused phoneHardwareMarkup missing; fixed cache parameters.

- Played case02 through all six app sources. Missing evidence rejected a correct answer, a wrong owner/password/cause rejected after6/6, correct inference returned the phone. Restarted the case through its normal two-click UI, flipped the photo back to reveal the inscription, and completed a second playthrough inside390px mobile viewport. Exterior phone number keys entered0612, exterior OK submitted the complete deduction. Reload retained6/6 and completion.
- Anime collection added a Digimon card, saved a local note and retained both after reload. Added two more official-catalogue discussion cards (Dragon Ball/Slam Dunk),12 total,10 visible at2004-08-01. The epilogue now only claims to have read a note if one exists.
- PC browser, tabs, contacts backup, case notebook, and anime screens displayed without UC chrome.320/360/390/430 viewport checks had no document horizontal overflow in both modes; phone number buttons44px.
- Java repeated pad fixed: one game pad, zero visible general pads. Portrait numeric and confirm keys44px. A real landscape pass uncovered toolbar overlap and bottom clipping; repaired to left-screen/right-pad layout. At844x390, both screen and pad end at366px, width844 without overflow, number keys44px. Confirm starts a battle, right changes selected unit; fullscreen exit works.
- Closed-service download attempt displayed its reason persistently in the SMS card without changing credit. Cancelled monthly ownership survives reload and is labelled cancelled, not a single purchase. Story prompts are absent from composing/claiming views, retained in inbox.
- Remaining external failure: browser archive API returns fetch failure and deployment-server curl to archive.org times out after10s. Chinese failure/retry plus labelled recreated navigation remain; real snapshots cannot be called available under this network. Do not claim that all external websites or physical-phone touch events were verified.

Final regression: completed case01 inside the PC mode through SMS pack, QQ offline message, BBS post and browser search cache,4/4 plus correct final deduction. Both original cases remain playable after the new wrappers. Final required suite:68JS tests plus4Python tests, all pass. Cache references unified tocampus3.0.6 before publishing.

Integrated remote main1faf1ea (Tide Collector) before publishing rather than overwriting it. Script order preserves both story layers. Actual merged UI checks: open Tide three-handset shelf and black N73, switch to PC and see native PC browser, return to phone and retain Continue, choose ordinary3310 and see its native four functions, then reopen completed campus case6/6. Tide remains intact; native play and PC no longer accidentally inherit its active story screen.

## 2026-10-20 02:00 续作：存档盒
- 首页、手机工作台、PC 工作台均增加存档盒，入口在文档流内，不覆盖手机屏幕；全屏游玩隐藏入口。
- 可下载 JSON 并从本地文件恢复收藏机、两宗案件、潮声每机笔记、动漫收藏、虚拟话费/退订与原生小游戏。采用明确项目名单，不导入任意 localStorage，也不包含 Java 模拟器数据库、真实网页历史或系统文件。
- 恢复前显示余额、校园状态、潮声状态和收藏数，二次确认后刷新。拒绝未知格式/版本/项目、过大文件、不符类型与原型字段；写入失败尝试恢复此前值。
- CUA 本地实际下载、选择刚导出文件、预览、确认恢复、重开预览，余额 87 元/校园通关/动漫 1 项一致。390×844 实看对话框和确认按钮完整可见。
- CUA 导入未知项目测试文件被中文拒绝，确认按钮隐藏，未改进度。
- 76 JS + 4 Python 通过；本轮未重新通关潮声完整结局，亦不宣称物理触摸或真实手机文件选择器已验。

## 2026-10-20 03:00 续作：收藏机对话与故事隔离
- 三部收藏机各有三条有限 QQ 对话，按机保存已选分支，重复点击不重复追加。乐队/毕业/外采爱好不同；黑机明确显示离线记录和本机待发，不伪造真实即时通信。
- QQ 不再使用短信草稿 replied 标志；不会因为聊 QQ 而触发短信回声。现有短信存档保持兼容。
- 只有检修门照片背面的署名备注才算 back 证据，普通照片空白备注不能代替。
- 实际试玩发现校园案相册入口会叠在潮声相册上，已隔离故事屏幕。回归测试确认原校园附件仍在原玩法中。
- CUA 实际选择银机/白机/黑机，点击分支、切换及重载，三机对话各自保留；黑机 QQ、两种照片背面已打开。390×844 实看并点击回复，按钮高44px。回复后滚动保留到选择区，避免每次回到聊天顶部。
- 这轮未重走潮声两种完整结局，不把这些局部回归称为全量通关。

## 2026-10-20 04:00 续作：日常收藏机相册
- 银色6600、白色5230由单张静态配图改为各两张独立生活相册；有缩略图、循环上一张/下一张、放大还原、背面备注与故事日期，提供回缩略图/收藏架路径。
- 排练/毕业主题与各自QQ生活呼应，日常内容不计潮声黑机证据。使用本站既有怀旧配图，明确不是人物实拍或原始EXIF，不增加未授权素材下载。
- CUA银机实际打开、放大、翻背、切下一张、看时间；白机实际打开两张、窄屏390×844看图加载、翻背、上一张、返回缩略图。普通生活不新增谜题，也不称新增完整故事。
- 80 JS + 4 Python通过；日期可见性回归在改造相册时发现遗漏，已补入缩略图说明并通过既有年代测试。

## 2026-10-20 05:00 续作：校园调查回看与笔记
- 档案页只列已收集记录，点击可重读；照片重读展示已看过的背面。未发现的资料不提前变成软件清单，主动提示仍可请求，最终判断门槛不变。
- 添加1200字本机调查笔记，保存后明确显示结果，写入失败不虚报保存。存档盒随校园记录一起携带笔记；读档转义显示文本。
- CUA电脑模式实际重读照片、保存笔记、刷新后确认原文保留；切普通N73手机、390×844输入/保存成功，按钮可达。仅鼠标键盘，未验真机软键盘。
- 81JS+4Python通过，本轮不算重新完整通关。
