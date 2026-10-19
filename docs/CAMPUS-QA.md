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
