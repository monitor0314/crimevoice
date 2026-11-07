/* 線索清單、每日完成與提示系統 */
const ALL_POSTS=[
  ...new Map(
    [
      NEWS_POST,
	  ...SCHEDULED_NEWS_POSTS,
	  ...PROFILE_ONLY_SCHEDULED_NEWS,
      LILITH_1114_POST,
	  ...NEWS_RECENT_POSTS,
      ...NEWS_PROFILE_POSTS,
      ...POSTS,
      ...INLINE_REPLY_PARENT_POSTS,
      ...REPLY_POSTS,
      ...MEDIA_POSTS,
      ...REPOST_POSTS,
      ...ALT_INLINE_REPLY_PARENT_POSTS,
      ...ALT_REPLY_POSTS,
      ...ALT_POSTS,
      ...ACTIVITY_POSTS
    ].map(post=>[post.id,post])
  ).values()
];
const CLUES=[
  ...ALL_POSTS.flatMap(p=>{
    if(Array.isArray(p.clues)){
      return p.clues
        .filter(c=>String(c.title||'').trim()&&String(c.text||'').trim())
        .map((c,i)=>({
          id:`${p.id}-clue-${i}`,
          postId:p.id,
          clueTitle:c.title,
          clue:c.text
        }));
    }

    if(String(p.clueTitle||'').trim()&&String(p.clue||'').trim()){
      return [{
        id:p.id,
        postId:p.id,
        clueTitle:p.clueTitle,
        clue:p.clue
      }];
    }

    return [];
  }),

  {
    id:'lilith-profile-entry-clue',
    postId:'lilith-profile-entry',
    clueTitle:'莉莉絲凱特',
    clue:'在高譚日報留言區內留言，似乎了解很多內幕，今年32歲。'
	
  },
  {
    id:'alt-follower-connection-clue',
    postId:'alt-follower-connection',
    releaseAt:RELEASE.portrait,
    clueTitle:'追蹤者名單',
    clue:'LH也有追蹤莉莉絲，他們是什麼關係?'
  },
  {
    id:'lh-understands-hill-clue',
    postId:'lh-understands-hill',
    releaseAt:RELEASE.portrait,
    clueTitle:'理解希爾的人',
    clue:'在希爾肖像遭撤下的新聞下，LH聲稱其他人從來沒有理解過希爾。'
  }
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

/* ===== 隱藏可點擊提示＋基本頁面保護 ===== */

function unlock(id){
  const post=ALL_POSTS.find(item=>item.id===id);
  if(post&&!canAccessPost(post))return;
  const clues=CLUES.filter(c=>c.postId===id);
  const newClues=clues.filter(c=>!state.unlocked.has(c.id));

  if(!newClues.length){
    checkCompletion();
    return;
  }

  newClues.forEach(c=>{
    state.unlocked.add(c.id);
  });

  save();
  toast(`已新增 ${newClues.length} 個線索`);
  renderProgress();
  checkCompletion();
}
function renderProgress(){
  const found=[...state.unlocked]
    .map(id=>CLUES.find(c=>c.id===id))
    .filter(Boolean);

  $('#clueList').innerHTML=found
    .map((p,i)=>`
      <div class="clue">
        <span class="clue-num">${i+1}</span>
        <div>
          <h3>${esc(p.clueTitle)}</h3>
          <p>${esc(p.clue)}</p>
        </div>
      </div>
    `)
    .join('');
}
let completionTimer=null;

const GAME_START_DAY='2026-11-11';
const GAME_LAST_DAY='2026-11-14';
const GAME_ENDED_DAY='2026-11-15';

function currentTaipeiDay(){return dateInTaipei(Date.now())}

function clueReleaseDay(clue){
  if(clue.releaseAt){
    const day=dateInTaipei(clue.releaseAt);
    return day<GAME_START_DAY?GAME_START_DAY:day;
  }
  const post=ALL_POSTS.find(item=>item.id===clue.postId);
  if(!post||!post.publishedAt)return GAME_START_DAY;
  const day=dateInTaipei(post.publishedAt);
  return day<GAME_START_DAY?GAME_START_DAY:day;
}

function getAvailableClues(){
  const today=currentTaipeiDay();
  return CLUES.filter(clue=>clueReleaseDay(clue)<=today);
}

function getTodayClues(){
  const today=currentTaipeiDay();
  return CLUES.filter(clue=>clueReleaseDay(clue)===today);
}

function getCompletionSignature(){
  return getAvailableClues()
    .map(c=>c.id)
    .sort()
    .join('|');
}

function checkCompletion(){
  const today=currentTaipeiDay();
  if(today>GAME_LAST_DAY||(today===GAME_LAST_DAY&&state.endingViewed))return;

  const availableClues=getAvailableClues();
  if(!availableClues.length)return;

  const collectedAll=availableClues.every(c=>{
    return state.unlocked.has(c.id);
  });

  if(!collectedAll){
    if(completionTimer){
      clearTimeout(completionTimer);
      completionTimer=null;
    }

    return;
  }

  const signature=getCompletionSignature();

  if(state.completionSignature===signature)return;
  if(completionTimer)return;

  completionTimer=setTimeout(()=>{
    completionTimer=null;

    const currentAvailableClues=getAvailableClues();
    const stillCollectedAll=currentAvailableClues.every(c=>{
      return state.unlocked.has(c.id);
    });

    if(!stillCollectedAll)return;

    const currentSignature=getCompletionSignature();
    if(currentSignature!==signature)return;
    const day=currentTaipeiDay();
    if(day>GAME_LAST_DAY||state.endingViewed)return;

    state.completionSignature=signature;
    save();

    const dialog=$('#completionDialog');
    if(dialog){
      dialog.querySelector('p').textContent=day===GAME_LAST_DAY
        ? hasArrived(RELEASE.lilithMessages)
          ? '莉莉絲今天重新開放陌生訊息了。去看看她的新串文，再試著傳訊息給她吧。'
          : '今天還有新的發展，稍晚再來看看莉莉絲的串文吧。'
        : '但……明天大家又會發什麼串文呢？';
    }

    if(dialog&&!dialog.open){
      dialog.showModal();
    }
  },5000);
}

function checkDailyAndGameNotices(isStartup=false){
  const today=currentTaipeiDay();
  const shouldShowGameEnd=today>=GAME_ENDED_DAY||(isStartup&&today===GAME_LAST_DAY&&state.endingViewed);

  if(shouldShowGameEnd){
    if(!state.gameEndNoticeDismissed){
      const dialog=$('#gameEndDialog');
      if(dialog&&!dialog.open)dialog.showModal();
    }
    return;
  }

  if(today<GAME_START_DAY||today>GAME_LAST_DAY)return;
  if(today===GAME_LAST_DAY){
    if(!hasArrived(RELEASE.lilithMessages)||state.endingViewed)return;
    const noticeKey=`${today}-ending`;
    if(state.dailyNoClueNotices.has(noticeKey))return;
    const dialog=$('#dailyNoClueDialog');
    if(!dialog||dialog.open)return;
    dialog.querySelector('h2').textContent='今天的故事還沒結束';
    dialog.querySelector('p').textContent='莉莉絲重新開放陌生訊息了。去看看她今天的新串文，再試著傳訊息給她吧。';
    dialog.showModal();
    state.dailyNoClueNotices.add(noticeKey);
    save();
    return;
  }
  if(getTodayClues().length)return;
  if(state.dailyNoClueNotices.has(today))return;

  state.dailyNoClueNotices.add(today);
  save();
  const dialog=$('#dailyNoClueDialog');
  if(dialog&&!dialog.open)dialog.showModal();
}
