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
