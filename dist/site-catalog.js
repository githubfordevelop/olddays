"use strict";
// Earliest suggested browsing year, not a claim of exact launch date.
const siteCatalog = [
  {
    "id": "portal",
    "title": "新闻 · 门户",
    "en": "NEWS & PORTALS",
    "sites": [
      {
        "name": "新浪",
        "url": "www.sina.com.cn",
        "since": 1998
      },
      {
        "name": "搜狐",
        "url": "www.sohu.com",
        "since": 1998
      },
      {
        "name": "网易",
        "url": "www.163.com",
        "since": 1997
      },
      {
        "name": "腾讯网",
        "url": "www.qq.com",
        "since": 2003
      },
      {
        "name": "中华网",
        "url": "www.china.com",
        "since": 1999
      },
      {
        "name": "中国网",
        "url": "www.china.org.cn",
        "since": 2000
      },
      {
        "name": "人民网",
        "url": "www.people.com.cn",
        "since": 1997
      },
      {
        "name": "新华网",
        "url": "www.xinhuanet.com",
        "since": 2000
      },
      {
        "name": "中国新闻网",
        "url": "www.chinanews.com.cn",
        "since": 1999
      },
      {
        "name": "央视国际",
        "url": "www.cctv.com",
        "since": 1996
      },
      {
        "name": "凤凰网",
        "url": "www.ifeng.com",
        "since": 2006
      },
      {
        "name": "TOM",
        "url": "www.tom.com",
        "since": 2000
      },
      {
        "name": "21CN",
        "url": "www.21cn.com",
        "since": 1999
      },
      {
        "name": "千龙网",
        "url": "www.qianlong.com",
        "since": 2000
      },
      {
        "name": "东方网",
        "url": "www.eastday.com",
        "since": 2000
      },
      {
        "name": "红网",
        "url": "www.rednet.cn",
        "since": 2001
      },
      {
        "name": "北方网",
        "url": "www.enorth.com.cn",
        "since": 2000
      },
      {
        "name": "大洋网",
        "url": "www.dayoo.com",
        "since": 1999
      },
      {
        "name": "南方网",
        "url": "www.southcn.com",
        "since": 2001
      },
      {
        "name": "雅虎中国",
        "url": "cn.yahoo.com",
        "since": 1999
      }
    ]
  },
  {
    "id": "search",
    "title": "搜索 · 网址导航",
    "en": "SEARCH & DIRECTORIES",
    "sites": [
      {
        "name": "百度",
        "url": "www.baidu.com",
        "since": 2000
      },
      {
        "name": "Google",
        "url": "www.google.com",
        "since": 1998
      },
      {
        "name": "一搜（雅虎搜索 / 易搜）",
        "url": "www.yisou.com",
        "since": 2004
      },
      {
        "name": "搜狗",
        "url": "www.sogou.com",
        "since": 2004
      },
      {
        "name": "爱问",
        "url": "www.iask.com",
        "since": 2004
      },
      {
        "name": "搜搜",
        "url": "www.soso.com",
        "since": 2006
      },
      {
        "name": "雅虎搜索",
        "url": "search.yahoo.com",
        "since": 1995
      },
      {
        "name": "AltaVista",
        "url": "www.altavista.com",
        "since": 1995
      },
      {
        "name": "Lycos",
        "url": "www.lycos.com",
        "since": 1994
      },
      {
        "name": "Excite",
        "url": "www.excite.com",
        "since": 1995
      },
      {
        "name": "3721",
        "url": "www.3721.com",
        "since": 1998
      },
      {
        "name": "中搜",
        "url": "www.zhongsou.com",
        "since": 2003
      },
      {
        "name": "hao123",
        "url": "www.hao123.com",
        "since": 2000
      },
      {
        "name": "265 导航",
        "url": "www.265.com",
        "since": 2003
      },
      {
        "name": "搜房网",
        "url": "www.soufun.com",
        "since": 1999
      }
    ]
  },
  {
    "id": "forum",
    "title": "论坛 · BBS",
    "en": "FORUMS & BBS",
    "sites": [
      {
        "name": "天涯社区（早期域名）",
        "url": "www.tianyaclub.com",
        "since": 1999
      },
      {
        "name": "天涯社区",
        "url": "www.tianya.cn",
        "since": 2005
      },
      {
        "name": "天涯论坛",
        "url": "bbs.tianya.cn",
        "since": 2005
      },
      {
        "name": "猫扑大杂烩",
        "url": "www.mop.com",
        "since": 1997
      },
      {
        "name": "西祠胡同",
        "url": "www.xici.net",
        "since": 1998
      },
      {
        "name": "西陆社区",
        "url": "www.xilu.com",
        "since": 1998
      },
      {
        "name": "凯迪社区",
        "url": "www.kdnet.net",
        "since": 2000
      },
      {
        "name": "强国论坛",
        "url": "bbs.people.com.cn",
        "since": 1999
      },
      {
        "name": "百度贴吧（早期）",
        "url": "post.baidu.com",
        "since": 2003
      },
      {
        "name": "百度贴吧",
        "url": "tieba.baidu.com",
        "since": 2005
      },
      {
        "name": "水木清华",
        "url": "www.smth.org",
        "since": 1995
      },
      {
        "name": "水木社区",
        "url": "www.newsmth.net",
        "since": 2005
      },
      {
        "name": "北大未名",
        "url": "bbs.pku.edu.cn",
        "since": 2000
      },
      {
        "name": "日月光华",
        "url": "bbs.fudan.edu.cn",
        "since": 1996
      },
      {
        "name": "饮水思源",
        "url": "bbs.sjtu.edu.cn",
        "since": 1996
      },
      {
        "name": "一塌糊涂",
        "url": "ytht.net",
        "since": 1999
      },
      {
        "name": "虎扑",
        "url": "www.hoopchina.com",
        "since": 2004
      },
      {
        "name": "天涯体育",
        "url": "sports.tianya.cn",
        "since": 2005
      },
      {
        "name": "龙的天空",
        "url": "www.lkong.net",
        "since": 2000
      },
      {
        "name": "天使动漫",
        "url": "www.tsdm.net",
        "since": 2010
      }
    ]
  },
  {
    "id": "wap",
    "title": "梦网 · WAP 手机站",
    "en": "MOBILE & WAP",
    "sites": [
      {
        "name": "移动梦网",
        "url": "wap.monternet.com",
        "since": 2000
      },
      {
        "name": "移动梦网电脑版",
        "url": "www.monternet.com",
        "since": 2000
      },
      {
        "name": "腾讯手机网 · QQ家园",
        "url": "wap.3g.qq.com",
        "since": 2004
      },
      {
        "name": "手机腾讯网",
        "url": "3g.qq.com",
        "since": 2004
      },
      {
        "name": "手机新浪网",
        "url": "wap.sina.com.cn",
        "since": 2000
      },
      {
        "name": "手机搜狐网",
        "url": "wap.sohu.com",
        "since": 2000
      },
      {
        "name": "手机网易",
        "url": "wap.163.com",
        "since": 2000
      },
      {
        "name": "3G门户",
        "url": "www.3g.cn",
        "since": 2004
      },
      {
        "name": "3G门户手机站",
        "url": "wap.3g.cn",
        "since": 2004
      },
      {
        "name": "空中网",
        "url": "www.kongzhong.com",
        "since": 2002
      },
      {
        "name": "空中网 WAP",
        "url": "wap.kongzhong.com",
        "since": 2002
      },
      {
        "name": "乐讯",
        "url": "www.lexun.com",
        "since": 2004
      },
      {
        "name": "乐讯手机站",
        "url": "wap.lexun.com",
        "since": 2004
      },
      {
        "name": "UC浏览器",
        "url": "www.ucweb.com",
        "since": 2004
      },
      {
        "name": "Opera Mini",
        "url": "www.operamini.com",
        "since": 2006
      },
      {
        "name": "宜搜（手机搜索）",
        "url": "www.easou.com",
        "since": 2005
      },
      {
        "name": "宜搜 WAP",
        "url": "wap.easou.com",
        "since": 2005
      },
      {
        "name": "泡泡网 WAP",
        "url": "wap.pcpop.com",
        "since": 2003
      },
      {
        "name": "捉鱼网",
        "url": "www.joyes.com",
        "since": 2003
      },
      {
        "name": "当乐网",
        "url": "www.d.cn",
        "since": 2004
      },
      {
        "name": "百阅",
        "url": "www.byread.com",
        "since": 2005
      },
      {
        "name": "3G书城",
        "url": "www.3gsc.com.cn",
        "since": 2005
      }
    ]
  },
  {
    "id": "life",
    "title": "博客 · 个人主页",
    "en": "BLOGS & HOMEPAGES",
    "sites": [
      {
        "name": "中国博客网",
        "url": "www.blogcn.com",
        "since": 2002
      },
      {
        "name": "博客中国",
        "url": "www.blogchina.com",
        "since": 2002
      },
      {
        "name": "博客大巴",
        "url": "www.blogbus.com",
        "since": 2002
      },
      {
        "name": "新浪博客",
        "url": "blog.sina.com.cn",
        "since": 2005
      },
      {
        "name": "搜狐博客",
        "url": "blog.sohu.com",
        "since": 2004
      },
      {
        "name": "网易博客",
        "url": "blog.163.com",
        "since": 2006
      },
      {
        "name": "和讯博客",
        "url": "blog.hexun.com",
        "since": 2004
      },
      {
        "name": "歪酷博客",
        "url": "www.yculblog.com",
        "since": 2002
      },
      {
        "name": "MSN Spaces",
        "url": "spaces.msn.com",
        "since": 2004
      },
      {
        "name": "Windows Live Spaces",
        "url": "spaces.live.com",
        "since": 2006
      },
      {
        "name": "GeoCities",
        "url": "www.geocities.com",
        "since": 1994
      },
      {
        "name": "Tripod",
        "url": "www.tripod.com",
        "since": 1995
      },
      {
        "name": "Blogger",
        "url": "www.blogger.com",
        "since": 1999
      },
      {
        "name": "WordPress",
        "url": "wordpress.com",
        "since": 2005
      },
      {
        "name": "LOFTER",
        "url": "www.lofter.com",
        "since": 2011
      }
    ]
  },
  {
    "id": "social",
    "title": "QQ · 校园 · 交友",
    "en": "SOCIAL & CAMPUS",
    "sites": [
      {
        "name": "腾讯 OICQ",
        "url": "www.tencent.com",
        "since": 1998
      },
      {
        "name": "QQ空间",
        "url": "qzone.qq.com",
        "since": 2005
      },
      {
        "name": "朋友网",
        "url": "www.pengyou.com",
        "since": 2011
      },
      {
        "name": "QQ校友",
        "url": "xiaoyou.qq.com",
        "since": 2009
      },
      {
        "name": "校内网",
        "url": "www.xiaonei.com",
        "since": 2006
      },
      {
        "name": "人人网",
        "url": "www.renren.com",
        "since": 2009
      },
      {
        "name": "开心网",
        "url": "www.kaixin001.com",
        "since": 2008
      },
      {
        "name": "51个人空间",
        "url": "www.51.com",
        "since": 2005
      },
      {
        "name": "ChinaRen",
        "url": "www.chinaren.com",
        "since": 1999
      },
      {
        "name": "ChinaRen校友录",
        "url": "alumni.chinaren.com",
        "since": 2000
      },
      {
        "name": "同学录5460",
        "url": "www.5460.net",
        "since": 1998
      },
      {
        "name": "豆瓣",
        "url": "www.douban.com",
        "since": 2005
      },
      {
        "name": "饭否",
        "url": "www.fanfou.com",
        "since": 2007
      },
      {
        "name": "嘀咕",
        "url": "www.digu.com",
        "since": 2009
      },
      {
        "name": "新浪微博（早期）",
        "url": "t.sina.com.cn",
        "since": 2009
      },
      {
        "name": "新浪微博",
        "url": "weibo.com",
        "since": 2011
      }
    ]
  },
  {
    "id": "mail",
    "title": "邮箱 · 即时通信",
    "en": "MAIL & MESSENGERS",
    "sites": [
      {
        "name": "网易163邮箱",
        "url": "mail.163.com",
        "since": 2000
      },
      {
        "name": "网易126邮箱",
        "url": "www.126.com",
        "since": 2001
      },
      {
        "name": "网易188邮箱",
        "url": "www.188.com",
        "since": 2004
      },
      {
        "name": "新浪邮箱",
        "url": "mail.sina.com.cn",
        "since": 1999
      },
      {
        "name": "搜狐邮箱",
        "url": "mail.sohu.com",
        "since": 2000
      },
      {
        "name": "QQ邮箱",
        "url": "mail.qq.com",
        "since": 2002
      },
      {
        "name": "Hotmail",
        "url": "www.hotmail.com",
        "since": 1996
      },
      {
        "name": "Gmail",
        "url": "mail.google.com",
        "since": 2004
      },
      {
        "name": "雅虎邮箱",
        "url": "mail.yahoo.com",
        "since": 1997
      },
      {
        "name": "263邮箱",
        "url": "www.263.net",
        "since": 1998
      },
      {
        "name": "21CN邮箱",
        "url": "mail.21cn.com",
        "since": 1999
      },
      {
        "name": "MSN",
        "url": "www.msn.com",
        "since": 1995
      },
      {
        "name": "ICQ",
        "url": "www.icq.com",
        "since": 1996
      }
    ]
  },
  {
    "id": "game",
    "title": "网游 · 小游戏",
    "en": "GAMES & ARCADES",
    "sites": [
      {
        "name": "联众世界",
        "url": "www.ourgame.com",
        "since": 1998
      },
      {
        "name": "中国游戏中心",
        "url": "www.chinagames.net",
        "since": 1999
      },
      {
        "name": "17173",
        "url": "www.17173.com",
        "since": 2001
      },
      {
        "name": "新浪游戏",
        "url": "games.sina.com.cn",
        "since": 2000
      },
      {
        "name": "游侠网",
        "url": "www.ali213.net",
        "since": 1999
      },
      {
        "name": "游民星空",
        "url": "www.gamersky.com",
        "since": 2003
      },
      {
        "name": "多玩游戏",
        "url": "www.duowan.com",
        "since": 2005
      },
      {
        "name": "太平洋游戏网",
        "url": "www.pcgames.com.cn",
        "since": 2003
      },
      {
        "name": "4399小游戏",
        "url": "www.4399.com",
        "since": 2004
      },
      {
        "name": "7k7k小游戏",
        "url": "www.7k7k.com",
        "since": 2003
      },
      {
        "name": "3366小游戏",
        "url": "www.3366.com",
        "since": 2010
      },
      {
        "name": "QQ游戏",
        "url": "game.qq.com",
        "since": 2003
      },
      {
        "name": "QQ堂",
        "url": "qqtang.qq.com",
        "since": 2004
      },
      {
        "name": "QQ幻想",
        "url": "fo.qq.com",
        "since": 2005
      },
      {
        "name": "QQ宠物",
        "url": "pet.qq.com",
        "since": 2005
      },
      {
        "name": "摩尔庄园",
        "url": "www.51mole.com",
        "since": 2008
      },
      {
        "name": "赛尔号",
        "url": "seer.61.com",
        "since": 2009
      },
      {
        "name": "泡泡堂",
        "url": "bnb.sdo.com",
        "since": 2003
      },
      {
        "name": "盛大网络",
        "url": "www.shanda.com.cn",
        "since": 2000
      },
      {
        "name": "传奇",
        "url": "mir2.sdo.com",
        "since": 2001
      },
      {
        "name": "梦幻西游",
        "url": "xyq.163.com",
        "since": 2003
      },
      {
        "name": "大话西游II",
        "url": "xy2.163.com",
        "since": 2002
      }
    ]
  },
  {
    "id": "reading",
    "title": "小说 · 文学 · 漫画",
    "en": "READING & COMICS",
    "sites": [
      {
        "name": "榕树下",
        "url": "www.rongshuxia.com",
        "since": 1997
      },
      {
        "name": "起点中文网",
        "url": "www.qidian.com",
        "since": 2002
      },
      {
        "name": "红袖添香",
        "url": "www.hongxiu.com",
        "since": 1999
      },
      {
        "name": "晋江文学城",
        "url": "www.jjwxc.net",
        "since": 2003
      },
      {
        "name": "潇湘书院",
        "url": "www.xxsy.net",
        "since": 2001
      },
      {
        "name": "小说阅读网",
        "url": "www.readnovel.com",
        "since": 2004
      },
      {
        "name": "幻剑书盟",
        "url": "www.hjsm.net",
        "since": 2001
      },
      {
        "name": "逐浪网",
        "url": "www.zhulang.com",
        "since": 2003
      },
      {
        "name": "17K小说网",
        "url": "www.17k.com",
        "since": 2006
      },
      {
        "name": "纵横中文网",
        "url": "www.zongheng.com",
        "since": 2008
      },
      {
        "name": "四月天",
        "url": "www.4yt.net",
        "since": 2006
      },
      {
        "name": "腾讯读书",
        "url": "book.qq.com",
        "since": 2004
      },
      {
        "name": "新浪读书",
        "url": "book.sina.com.cn",
        "since": 2000
      },
      {
        "name": "天极动漫",
        "url": "comic.yesky.com",
        "since": 2000
      },
      {
        "name": "有妖气",
        "url": "www.u17.com",
        "since": 2009
      },
      {
        "name": "动漫之家",
        "url": "www.dmzj.com",
        "since": 2005
      }
    ]
  },
  {
    "id": "media",
    "title": "音乐 · 视频 · 娱乐",
    "en": "MUSIC & VIDEO",
    "sites": [
      {
        "name": "百度MP3",
        "url": "mp3.baidu.com",
        "since": 2002
      },
      {
        "name": "九天音乐",
        "url": "www.9sky.com",
        "since": 1999
      },
      {
        "name": "一听音乐",
        "url": "www.1ting.com",
        "since": 2003
      },
      {
        "name": "搜刮音乐",
        "url": "www.sogua.com",
        "since": 2000
      },
      {
        "name": "巨鲸音乐",
        "url": "www.top100.cn",
        "since": 2006
      },
      {
        "name": "酷狗",
        "url": "www.kugou.com",
        "since": 2004
      },
      {
        "name": "千千静听",
        "url": "www.ttplayer.com",
        "since": 2002
      },
      {
        "name": "虾米音乐",
        "url": "www.xiami.com",
        "since": 2008
      },
      {
        "name": "土豆网",
        "url": "www.tudou.com",
        "since": 2005
      },
      {
        "name": "优酷",
        "url": "www.youku.com",
        "since": 2006
      },
      {
        "name": "56网",
        "url": "www.56.com",
        "since": 2005
      },
      {
        "name": "六间房",
        "url": "www.6.cn",
        "since": 2006
      },
      {
        "name": "酷6网",
        "url": "www.ku6.com",
        "since": 2006
      },
      {
        "name": "AcFun",
        "url": "www.acfun.cn",
        "since": 2007
      },
      {
        "name": "哔哩哔哩",
        "url": "www.bilibili.com",
        "since": 2010
      },
      {
        "name": "VeryCD",
        "url": "www.verycd.com",
        "since": 2003
      },
      {
        "name": "时光网",
        "url": "www.mtime.com",
        "since": 2004
      }
    ]
  },
  {
    "id": "tech",
    "title": "数码 · 软件 · 技术",
    "en": "TECH & SOFTWARE",
    "sites": [
      {
        "name": "中关村在线",
        "url": "www.zol.com.cn",
        "since": 1999
      },
      {
        "name": "太平洋电脑网",
        "url": "www.pconline.com.cn",
        "since": 1999
      },
      {
        "name": "硅谷动力",
        "url": "www.enet.com.cn",
        "since": 1999
      },
      {
        "name": "天极网",
        "url": "www.yesky.com",
        "since": 1999
      },
      {
        "name": "泡泡网",
        "url": "www.pcpop.com",
        "since": 2000
      },
      {
        "name": "驱动之家",
        "url": "www.mydrivers.com",
        "since": 1997
      },
      {
        "name": "华军软件园",
        "url": "www.onlinedown.net",
        "since": 1997
      },
      {
        "name": "天空软件站",
        "url": "www.skycn.com",
        "since": 1998
      },
      {
        "name": "霏凡软件",
        "url": "www.crsky.com",
        "since": 2002
      },
      {
        "name": "太平洋下载",
        "url": "dl.pconline.com.cn",
        "since": 2000
      },
      {
        "name": "电脑之家",
        "url": "www.pchome.net",
        "since": 1997
      },
      {
        "name": "CSDN",
        "url": "www.csdn.net",
        "since": 1999
      },
      {
        "name": "博客园",
        "url": "www.cnblogs.com",
        "since": 2004
      },
      {
        "name": "ChinaUnix",
        "url": "www.chinaunix.net",
        "since": 2001
      },
      {
        "name": "ITPUB",
        "url": "www.itpub.net",
        "since": 2001
      },
      {
        "name": "开源中国",
        "url": "www.oschina.net",
        "since": 2008
      },
      {
        "name": "V2EX",
        "url": "www.v2ex.com",
        "since": 2010
      },
      {
        "name": "远景论坛",
        "url": "bbs.pcbeta.com",
        "since": 2006
      },
      {
        "name": "深度",
        "url": "www.deepin.org",
        "since": 2004
      }
    ]
  },
  {
    "id": "group11",
    "title": "购物 · 城市 · 出行",
    "en": "SHOPPING & CITY",
    "sites": [
      {
        "name": "易趣",
        "url": "www.eachnet.com",
        "since": 1999
      },
      {
        "name": "淘宝",
        "url": "www.taobao.com",
        "since": 2003
      },
      {
        "name": "拍拍网",
        "url": "www.paipai.com",
        "since": 2005
      },
      {
        "name": "当当网",
        "url": "www.dangdang.com",
        "since": 1999
      },
      {
        "name": "卓越网",
        "url": "www.joyo.com",
        "since": 2000
      },
      {
        "name": "京东商城",
        "url": "www.360buy.com",
        "since": 2004
      },
      {
        "name": "阿里巴巴",
        "url": "www.alibaba.com",
        "since": 1999
      },
      {
        "name": "慧聪网",
        "url": "www.hc360.com",
        "since": 2003
      },
      {
        "name": "58同城",
        "url": "www.58.com",
        "since": 2005
      },
      {
        "name": "赶集网",
        "url": "www.ganji.com",
        "since": 2005
      },
      {
        "name": "大众点评",
        "url": "www.dianping.com",
        "since": 2003
      },
      {
        "name": "携程",
        "url": "www.ctrip.com",
        "since": 1999
      },
      {
        "name": "艺龙",
        "url": "www.elong.com",
        "since": 1999
      },
      {
        "name": "去哪儿",
        "url": "www.qunar.com",
        "since": 2005
      },
      {
        "name": "天涯旅游",
        "url": "travel.tianya.cn",
        "since": 2005
      },
      {
        "name": "汽车之家",
        "url": "www.autohome.com.cn",
        "since": 2005
      },
      {
        "name": "爱卡汽车",
        "url": "www.xcar.com.cn",
        "since": 2002
      },
      {
        "name": "太平洋汽车网",
        "url": "www.pcauto.com.cn",
        "since": 2002
      }
    ]
  },
  {
    "id": "group12",
    "title": "学习 · 问答 · 工具",
    "en": "LEARNING & TOOLS",
    "sites": [
      {
        "name": "中国教育在线",
        "url": "www.eol.cn",
        "since": 2001
      },
      {
        "name": "新东方",
        "url": "www.neworiental.org",
        "since": 2000
      },
      {
        "name": "沪江",
        "url": "www.hjenglish.com",
        "since": 2001
      },
      {
        "name": "无忧考网",
        "url": "www.51test.net",
        "since": 1999
      },
      {
        "name": "百度知道",
        "url": "zhidao.baidu.com",
        "since": 2005
      },
      {
        "name": "百度百科",
        "url": "baike.baidu.com",
        "since": 2006
      },
      {
        "name": "搜搜问问",
        "url": "wenwen.soso.com",
        "since": 2006
      },
      {
        "name": "维基百科",
        "url": "zh.wikipedia.org",
        "since": 2002
      },
      {
        "name": "金山词霸",
        "url": "www.iciba.com",
        "since": 2003
      },
      {
        "name": "有道",
        "url": "www.youdao.com",
        "since": 2007
      },
      {
        "name": "在线新华字典",
        "url": "www.zdic.net",
        "since": 2004
      }
    ]
  },
  {
    "id": "group13",
    "title": "海外 · 经典网络",
    "en": "WORLD WIDE WEB",
    "sites": [
      {
        "name": "Yahoo!",
        "url": "www.yahoo.com",
        "since": 1994
      },
      {
        "name": "雅虎奇摩",
        "url": "tw.yahoo.com",
        "since": 2001
      },
      {
        "name": "蕃薯藤",
        "url": "www.yam.com",
        "since": 1995
      },
      {
        "name": "PChome台湾",
        "url": "www.pchome.com.tw",
        "since": 1996
      },
      {
        "name": "新浪台湾",
        "url": "www.sina.com.tw",
        "since": 1996
      },
      {
        "name": "BBC",
        "url": "www.bbc.co.uk",
        "since": 1997
      },
      {
        "name": "CNN",
        "url": "www.cnn.com",
        "since": 1995
      },
      {
        "name": "Wikipedia",
        "url": "www.wikipedia.org",
        "since": 2001
      },
      {
        "name": "Slashdot",
        "url": "slashdot.org",
        "since": 1997
      },
      {
        "name": "Digg",
        "url": "www.digg.com",
        "since": 2004
      },
      {
        "name": "Reddit",
        "url": "www.reddit.com",
        "since": 2005
      },
      {
        "name": "Flickr",
        "url": "www.flickr.com",
        "since": 2004
      },
      {
        "name": "MySpace",
        "url": "www.myspace.com",
        "since": 2003
      },
      {
        "name": "Friendster",
        "url": "www.friendster.com",
        "since": 2002
      },
      {
        "name": "YouTube",
        "url": "www.youtube.com",
        "since": 2005
      },
      {
        "name": "Internet Archive",
        "url": "www.archive.org",
        "since": 1996
      }
    ]
  }
];
