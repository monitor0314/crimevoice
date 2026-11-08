/* 時區、發布時間與帳號資料 */
/* ===== 主要資料：文字與圖片路徑都可在這裡替換 ===== */
const APP_TIME_ZONE='Asia/Taipei';
const MINUTE=60*1000;
const HOUR=60*MINUTE;
const DAY=24*HOUR;
const RELEASE={
  portrait:'2026-11-12T12:00:00+08:00',
  altPost:'2026-11-13T12:00:00+08:00',
  xiaAppointment:'2026-11-13T10:05:00+08:00',
  groupFilled:'2026-11-12T20:16:00+08:00',
  groupArrivedOne:'2026-11-13T13:55:00+08:00',
  groupArrivedTwo:'2026-11-13T13:58:00+08:00',
  groupPing:'2026-11-13T14:03:00+08:00',
  prisonRumor:'2026-11-13T12:30:00+08:00',
  xiaReplyDeadline:'2026-11-13T23:00:00+08:00',
  lilithMessages:'2026-11-14T09:00:00+08:00',
  xiaEarly:'2026-11-14T10:48:00+08:00',
  xiaSafe:'2026-11-14T11:05:00+08:00',
  museumExplosion:'2026-11-14T11:00:00+08:00'
};

function timeMs(value){return new Date(value).getTime()}
function hasArrived(value,now=Date.now()){return now>=timeMs(value)}
function dateInTaipei(value){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:APP_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value));
  const get=type=>parts.find(part=>part.type===type)?.value||'';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function formatPublishedTime(item,now=Date.now()){
  if(!item?.publishedAt)return item?.time||'';
  const published=timeMs(item.publishedAt);
  const diff=now-published;
  if(diff>=0){
    if(diff<MINUTE)return '剛剛';
    if(diff<HOUR)return `${Math.floor(diff/MINUTE)}分鐘`;
    if(diff<DAY)return `${Math.floor(diff/HOUR)}小時`;
    if(diff<7*DAY)return `${Math.floor(diff/DAY)}天`;
    return dateInTaipei(published);
  }
  // Scheduled posts stay hidden until release. Use a date as a fallback,
  // including when a device clock is slow; never show a future countdown.
  return dateInTaipei(published);
}
const PROFILE={name:'莉莉絲・凱特',handle:'lilith.kate',flag:'🇺🇸',location:'高譚',bio:'高譚人\n這裡的言論僅代表我個人。\n1994/08/21',tags:['#Gotham','#Democrats','#公共政策'],followers:'1,284',following:'156',avatar:'assets/avatar.webp'};
const ALT={name:'LH',handle:'LH5588812',avatar:'assets/person-alt.webp'};
const FOLLOWERS=[
 {name:'林七',handle:'lin_seven',bio:'偶爾拍照。',avatar:'assets/person-lin.svg'},
 {name:'雨停以前',handle:'before_rainstops',bio:'你說的不過是如果。',avatar:'assets/person-rain.svg'},
 {name:'無名',handle:'deleted_0826',bio:'',avatar:'assets/person-unknown.svg'},
 {name:'LH',handle:'LH5588812',bio:'好喜歡你。',avatar:'assets/person-alt.webp',isAlt:true},
 {name:'陳暮',handle:'muchen_26',bio:'Gotham',avatar:'assets/person-chen.svg'},
 {name:'73號',handle:'room_73',bio:'請勿敲門。',avatar:'assets/room_73.webp'},
 {name:'路過的人',handle:'passing_by',bio:'只是剛好看到。',avatar:'assets/passing.webp'},
 {name:'艾琳',handle:'erin_writes',bio:'城市裡的一個普通人。',avatar:'assets/avatar-2.svg'},
 {name:'M.',handle:'monday_morning',bio:'咖啡比政治可靠。',avatar:'assets/avatar-3.svg'},
 {name:'北邊的人',handle:'north_side_04',bio:'住在高譚北邊。',avatar:'assets/person-lin.svg'},
 {name:'喬治',handle:'george_w',bio:'偶爾評論市政。',avatar:'assets/person-chen.svg'},
 {name:'夜班記者',handle:'night_shift',bio:'還沒下班。',avatar:'assets/avatar-2.svg'},
 {name:'紙杯咖啡',handle:'paper_cup_01',bio:'每天都需要咖啡。',avatar:'assets/avatar-3.svg'},
 {name:'安娜',handle:'anna_in_gotham',bio:'在這座城市生活。',avatar:'assets/person-rain.svg'},
 {name:'老城區居民',handle:'old_gotham_resident',bio:'搬來很多年了。',avatar:'assets/person-chen.svg'},
 {name:'R.',handle:'r_after_work',bio:'下班之後才是人生。',avatar:'assets/avatar-2.svg'},
 {name:'七點半',handle:'seven_thirty',bio:'通常七點半起床。',avatar:'assets/avatar-3.svg'},
 {name:'不知道叫什麼',handle:'probably_nobody',bio:'如題。',avatar:'assets/person-unknown.svg'},
 {name:'觀察者',handle:'just_observing',bio:'看看而已。',avatar:'assets/person-lin.svg'},
 {name:'小湯姆',handle:'tom_from_gotham',bio:'本地居民。',avatar:'assets/avatar-2.svg'},
 {name:'瑪莎',handle:'martha_works',bio:'工作中，勿擾。',avatar:'assets/works.webp'},
 {name:'紙上談兵',handle:'on_paper_only',bio:'我只負責提出問題。',avatar:'assets/person-rain.svg'},
 {name:'南邊來的',handle:'from_the_south',bio:'偶爾來市中心。',avatar:'assets/person-chen.svg'},
 {name:'咖啡第二杯',handle:'coffee_second',bio:'第一杯已經喝完了。',avatar:'assets/avatar-2.svg'},
 {name:'伊森',handle:'ethan_works',bio:'城市、工作、睡眠。',avatar:'assets/avatar-3.svg'},
 {name:'晚安高譚',handle:'goodnight_gotham',bio:'晚上比較清醒....',avatar:'assets/person-lin.svg'},
 {name:'小報讀者',handle:'tabloid_reader',bio:'我只是看看新聞。',avatar:'assets/tabloid_reader.webp'},
 {name:'沒有暱稱',handle:'no_nickname_here',bio:'',avatar:'assets/person-unknown.svg'},
 {name:'星期三',handle:'wednesday_person',bio:'不是每個星期三都一樣。',avatar:'assets/avatar-2.svg'},
 {name:'城市邊緣',handle:'edge_of_city',bio:'離市中心很遠。',avatar:'assets/avatar-3.svg'},
 {name:'阿德',handle:'ade_gotham',bio:'今天也在上班。',avatar:'assets/person-chen.svg'},
 {name:'看熱鬧的',handle:'just_here_for_this',bio:'沒有立場。',avatar:'assets/person-lin.svg'},
 {name:'舊報紙',handle:'old_newspaper',bio:'昨天的新聞也是新聞。',avatar:'assets/old_newspaper.webp'},
 {name:'白噪音',handle:'white_noise_g',bio:'保持安靜。',avatar:'assets/avatar-3.svg'},
 {name:'米亞',handle:'mia_afterfive',bio:'五點以後才是我的時間。',avatar:'assets/mia.webp'},
 {name:'湯姆森',handle:'thomson_g',bio:'住在河邊。',avatar:'assets/thomson_g.webp'},
 {name:'小雨',handle:'rainy_window',bio:'今天也在下雨。',avatar:'assets/rainy_window.webp'},
 {name:'沒有新聞',handle:'no_news_today',bio:'希望今天沒有新聞。',avatar:'assets/avatar-3.svg'},
 {name:'艾倫',handle:'alan_corner',bio:'城市觀察。',avatar:'assets/person-lin.svg'},
 {name:'南區居民',handle:'southside_local',bio:'南區生活紀錄。',avatar:'assets/southside_local.webp'},
 {name:'老麥',handle:'old_mack_g',bio:'這城市比我年輕。',avatar:'assets/old_mack_g.webp'},
 {name:'卡洛',handle:'carlo_notes',bio:'一些城市雜記。',avatar:'assets/avatar-2.svg'},
 {name:'蘇菲',handle:'sophie_park',bio:'拍照、散步、咖啡。',avatar:'assets/sophie_park.webp'},
 {name:'布朗先生',handle:'mr_brown_g',bio:'退休之後比較有時間。',avatar:'assets/mr_brown_g.webp'},
 {name:'不想上班',handle:'dont_wanna_work',bio:'每天都在努力。',avatar:'assets/person-rain.svg'},
 {name:'報紙角落',handle:'corner_of_paper',bio:'每天看一點新聞。',avatar:'assets/person-unknown.svg'},
 {name:'傑克',handle:'jack_around_g',bio:'高譚本地人。',avatar:'assets/avatar-2.svg'},
 {name:'艾蜜莉',handle:'emily_gotham',bio:'偶爾發牢騷。',avatar:'assets/avatar-3.svg'},
 {name:'半夜三點',handle:'three_am_again',bio:'又睡不著。',avatar:'assets/person-chen.svg'},
 {name:'城市居民A',handle:'gotham_citizen_a',bio:'普通市民。',avatar:'assets/person-lin.svg'},
 {name:'城市居民B',handle:'gotham_citizen_b',bio:'沒有什麼好介紹的。',avatar:'assets/person-rain.svg'},
 {name:'老朋友',handle:'old_friend_g',bio:'認識一些人，也認識一些事。',avatar:'assets/person-chen.svg'}
];

const FOLLOWING=[
 {name:'73號',handle:'room_73',bio:'請勿敲門。',avatar:'assets/room_73.webp'},
 {name:'路過的人',handle:'passing_by',bio:'我只是路過',avatar:'assets/passing.webp'},
 {name:'林七',handle:'lin_seven',bio:'偶爾拍照',avatar:'assets/person-lin.svg'},
 {name:'雨停以前',handle:'before_rainstops',bio:'你說的不過是如果。',avatar:'assets/person-rain.svg'},
 {name:'陳暮',handle:'muchen_26',bio:'Gotham',avatar:'assets/person-chen.svg'},
 {name:'艾琳',handle:'erin_writes',bio:'城市裡的一個普通人',avatar:'assets/avatar-2.svg'},
 {name:'夜班記者',handle:'night_shift',bio:'還沒下班',avatar:'assets/avatar-2.svg'},
 {name:'安娜',handle:'anna_in_gotham',bio:'在這座城市生活。',avatar:'assets/person-rain.svg'},
 {name:'R.',handle:'r_after_work',bio:'下班之後才是人生。',avatar:'assets/avatar-3.svg'},
 {name:'晚安高譚',handle:'goodnight_gotham',bio:'晚上比較清醒。',avatar:'assets/person-lin.svg'},
 {name:'米亞',handle:'mia_afterfive',bio:'五點以後才是我的時間。',avatar:'assets/mia.webp'},
 {name:'湯姆森',handle:'thomson_g',bio:'住在河邊。',avatar:'assets/thomson_g.webp'},
 {name:'艾倫',handle:'alan_corner',bio:'城市觀察。',avatar:'assets/person-lin.svg'},
 {name:'蘇菲',handle:'sophie_park',bio:'拍照、散步、咖啡。',avatar:'assets/sophie_park.webp'},
 {name:'卡洛',handle:'carlo_notes',bio:'一些城市雜記。',avatar:'assets/avatar-2.svg'},
 {name:'舊報紙',handle:'old_newspaper',bio:'昨天的新聞也是新聞。',avatar:'assets/old_newspaper.webp'},
 {name:'老城區居民',handle:'old_gotham_resident',bio:'搬來很多年了。',avatar:'assets/person-chen.svg'},
 {name:'看熱鬧的',handle:'just_here_for_this',bio:'沒有立場。',avatar:'assets/avatar-3.svg'},
 {name:'老朋友',handle:'old_friend_g',bio:'認識一些人，也認識一些事。',avatar:'assets/person-chen.svg'},
 {name:'沒有新聞',handle:'no_news_today',bio:'希望今天沒有新聞。',avatar:'assets/avatar-2.svg'}
];

