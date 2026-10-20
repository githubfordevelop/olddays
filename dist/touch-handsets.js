"use strict";
// Touch-only models must not inherit the generic feature-phone key deck.
const touchHardwareBase=phoneHardwareMarkup;
phoneHardwareMarkup=function(){return ['fullscreen','iphone'].includes(phoneState.model)?'':touchHardwareBase();};
const touchRenderBase=renderPhoneLab;
renderPhoneLab=function(){let html=touchRenderBase();if(!['fullscreen','iphone'].includes(phoneState.model))return html;html=html.replace(/<div class="device-keypad">[\s\S]*?<\/div>/g,'').replace(/<div class="device-hinge"><\/div>/g,'');if(phoneState.model==='fullscreen')html=html.replace(/<button class="device-home-button"[\s\S]*?<\/button>/g,'').replace(/<div class="device-softkeys">[\s\S]*?<\/div>/g,'<nav class="touch-navigation" aria-label="屏幕触控导航"><button data-touch-back aria-label="触屏返回">‹</button><button data-phone-app="home" class="touch-home-gesture" aria-label="触屏主页"><i></i></button></nav>');return html;};
const touchJavaLayoutBase=layoutPhoneJavaKeypad;
layoutPhoneJavaKeypad=function(){if(['fullscreen','iphone'].includes(phoneState.model))return;return touchJavaLayoutBase();};
const touchScreenBase=phoneScreen;phoneScreen=function(){const html=touchScreenBase();return ['fullscreen','iphone'].includes(phoneState.model)?html.replace('按数字键 / 点图标，开始探索','轻点图标，开始探索'):html;};

document.addEventListener('click',e=>{const b=e.target.closest('[data-touch-back]');if(!b||phoneState.model!=='fullscreen')return;e.preventDefault();if(phoneState.app==='sms'&&smsView!=='inbox'){smsView='inbox';return refreshPhone();}if(phoneState.app==='magazines'&&phoneMagSelected){phoneMagSelected=null;return refreshPhone();}phoneSelectApp('home');});

// Offline players have their own controls; never reuse a telephone key deck.
const playerHardwareBase=phoneHardwareMarkup;
phoneHardwareMarkup=function(){if(!['mp3','mp4'].includes(phoneState.model))return playerHardwareBase();return `<div class="player-physical-controls" aria-label="播放器实体控制"><button data-phone-app="home" aria-label="播放器菜单">MENU</button><button data-track-step="-1" aria-label="上一首">◀◀</button><button data-music-toggle data-music-compact aria-label="播放或暂停">▶Ⅱ</button><button data-track-step="1" aria-label="下一首">▶▶</button><button data-phone-app="music" aria-label="打开本机曲库">♪</button></div>`;};
const playerRenderBase=renderPhoneLab;
renderPhoneLab=function(){if(!['mp3','mp4'].includes(phoneState.model))return playerRenderBase();if(!phoneAppAllowed(phoneState.app))phoneState.app='home';return playerRenderBase().replace(/<div class="device-keypad">[\s\S]*?<\/div>/g,'').replace(/<div class="device-hinge"><\/div>/g,'').replace(/<button class="device-home-button"[\s\S]*?<\/button>/g,'').replace(/<div class="device-softkeys">[\s\S]*?<\/div>/g,'<div class="player-screen-menu"><button data-phone-app="home">主菜单</button><button data-phone-app="music">本机曲库</button></div>').replace('▂▄▆ 中国移动','♪ 本机播放').replaceAll('时光网络','离线播放器');};
const playerRefreshBase=refreshPhone;
refreshPhone=function(){playerRefreshBase();if(['mp3','mp4'].includes(phoneState.model)){const title=document.querySelector('.device-app-title span');if(title)title.textContent='离线播放器';}};

const portableHardwareBase=phoneHardwareMarkup;
phoneHardwareMarkup=function(){if(!['psp','mp5'].includes(phoneState.model))return portableHardwareBase();return `<div class="portable-controls" aria-label="掌机控制"><button data-phone-app="home" aria-label="掌机主页">HOME</button><button data-phone-dir="up" aria-label="手机方向上">▲</button><button data-phone-app="games" aria-label="打开掌机游戏">GAME</button><button data-phone-dir="left" aria-label="手机方向左">◀</button><button data-phone-ok aria-label="手机确认">○</button><button data-phone-dir="right" aria-label="手机方向右">▶</button><button data-phone-app="music" aria-label="掌机音乐">♪</button><button data-phone-dir="down" aria-label="手机方向下">▼</button><button data-phone-app="home" aria-label="返回掌机菜单">BACK</button></div>`;};
const portableRenderBase=renderPhoneLab;
renderPhoneLab=function(){let html=portableRenderBase();if(!['psp','mp5'].includes(phoneState.model))return html;return html.replace(/<div class="device-keypad">[\s\S]*?<\/div>/g,'').replace(/<div class="device-hinge"><\/div>/g,'').replace(/<button class="device-home-button"[\s\S]*?<\/button>/g,'').replace(/<div class="device-softkeys">[\s\S]*?<\/div>/g,'<div class="player-screen-menu"><button data-phone-app="home">主菜单</button><button data-phone-app="games">游戏</button></div>').replace('▂▄▆ 中国移动','▂▄▆ Wi-Fi').replaceAll('时光网络','掌上娱乐');};
const portableRefreshBase=refreshPhone;
refreshPhone=function(){portableRefreshBase();if(['psp','mp5'].includes(phoneState.model)){const title=document.querySelector('.device-app-title span');if(title)title.textContent='掌上娱乐';}};

const n97HardwareBase=phoneHardwareMarkup;
phoneHardwareMarkup=function(){if(phoneState.model!=='n97')return n97HardwareBase();return `<div class="device-controls hardware-5230 hardware-n97-front"><button data-phone-app="contacts" aria-label="N97通话键">☎</button><button data-phone-app="home" aria-label="N97菜单键">▭</button><button data-phone-app="home" aria-label="N97结束键">☎</button></div>`;};
const n97RenderBase=renderPhoneLab;
renderPhoneLab=function(){let html=n97RenderBase();if(phoneState.model!=='n97')return html;html=html.replace(/<div class="device-keypad">[\s\S]*?<\/div>/g,'').replace(/<button class="device-home-button"[\s\S]*?<\/button>/g,'');return html.replace('<div class="n97-keyboard">','<div class="n97-keyboard"><nav class="n97-edit-tools"><button data-n97-edit="shift" aria-label="N97大小写" aria-pressed="'+n97Uppercase+'">⇧</button><button data-n97-edit="backspace" aria-label="N97退格">⌫</button></nav>');};
