/* 畫面渲染、互動事件與啟動流程 */
function installPageProtection(){
  const style=document.createElement('style');
  style.textContent=`
    [data-neutral-hover],
    [data-neutral-hover] *{
      cursor:default !important;
    }

    [data-neutral-hover]:hover{
      background-color:var(--neutral-bg) !important;
      color:var(--neutral-color) !important;
      opacity:var(--neutral-opacity) !important;
      filter:var(--neutral-filter) !important;
      box-shadow:var(--neutral-shadow) !important;
      text-decoration-line:var(--neutral-decoration) !important;
      transform:var(--neutral-transform) !important;
      transition:none !important;
    }
  `;
  document.head.appendChild(style);

  const clickableSelector=[
    'a',
    'button',
    '[role="link"]',
    '[role="button"]',
    '[onclick]',
    '[data-post]',
    '[data-open]',
    '[data-reply-thread]',
    '[data-news-profile-link]',
    '[data-profile-entry-target]',
    '[data-alt-profile]',
    '[data-nav]',
    '[data-person-follow]',
    '[data-chat]'
  ].join(',');

  const rememberNormalAppearance=element=>{
    [element,...element.querySelectorAll('*')].forEach(node=>{
      if(node.hasAttribute('data-neutral-hover'))return;

      const computed=getComputedStyle(node);
      node.style.setProperty('--neutral-bg',computed.backgroundColor);
      node.style.setProperty('--neutral-color',computed.color);
      node.style.setProperty('--neutral-opacity',computed.opacity);
      node.style.setProperty('--neutral-filter',computed.filter);
      node.style.setProperty('--neutral-shadow',computed.boxShadow);
      node.style.setProperty('--neutral-decoration',computed.textDecorationLine);
      node.style.setProperty('--neutral-transform',computed.transform);
      node.setAttribute('data-neutral-hover','');
    });
  };

  const neutralize=root=>{
    if(root.nodeType!==Node.ELEMENT_NODE&&root!==document)return;
    if(root!==document&&root.matches(clickableSelector))rememberNormalAppearance(root);
    root.querySelectorAll(clickableSelector).forEach(rememberNormalAppearance);
  };

  neutralize(document);

  new MutationObserver(mutations=>{
    mutations.forEach(mutation=>{
      mutation.addedNodes.forEach(node=>neutralize(node));
    });
  }).observe(document.body,{childList:true,subtree:true});

  document.addEventListener('contextmenu',event=>{
    event.preventDefault();
  },true);

  document.addEventListener('keydown',event=>{
    const key=event.key.toLowerCase();
    const windowsDevtools=event.ctrlKey&&event.shiftKey&&['i','j','c','k'].includes(key);
    const macDevtools=event.metaKey&&event.altKey&&['i','j','c'].includes(key);
    const viewSource=(event.ctrlKey||event.metaKey)&&key==='u';

    if(event.key==='F12'||windowsDevtools||macDevtools||viewSource){
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },true);
}

installPageProtection();

const STORAGE_KEY='lilith-arg-state-v2';
const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
const state={
  unlocked:new Set(saved.unlocked||[]),

  followedProfiles:new Set(saved.followedProfiles||[]),

  altFollowed:!!saved.altFollowed,
  mutual:!!saved.mutual,
  altDiscoveredInNews:!!saved.altDiscoveredInNews,
  unreadChats:new Set(saved.unreadChats||(saved.unread?['alt']:[])),
  seenChatEvents:new Set(saved.seenChatEvents||[]),
  seenActivityEvents:new Set(saved.seenActivityEvents||[]),
  museumNewsOpened:!!saved.museumNewsOpened,
  xiaAnReply:saved.xiaAnReply||'',
  xiaAnReplyAt:Number(saved.xiaAnReplyAt)||0,
  xiaAnAppointmentReplied:!!saved.xiaAnAppointmentReplied,
  xiaAnDeclined:!!saved.xiaAnDeclined,
  xiaAnWarnedOff:!!saved.xiaAnWarnedOff,
  xiaAnEmergencyTriggered:!!saved.xiaAnEmergencyTriggered,
  xiaAnEmergencyMessagesShown:Number(saved.xiaAnEmergencyMessagesShown)||0,
  lilithChatStarted:!!saved.lilithChatStarted,
  endingUnlocked:!!saved.endingUnlocked,
  endingViewed:!!saved.endingViewed,
  altChatHistory:Array.isArray(saved.altChatHistory)?saved.altChatHistory:[],
  lilithChatHistory:Array.isArray(saved.lilithChatHistory)?saved.lilithChatHistory:[],
  dailyNoClueNotices:new Set(saved.dailyNoClueNotices||[]),
  gameEndNoticeDismissed:!!saved.gameEndNoticeDismissed,
  completionSignature:saved.completionSignature||'',
  view:'news',
  previous:'news',
  lastHomeView:'news',
  homeScrolls:{}
};
function save(){
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      unlocked:[...state.unlocked],

      followedProfiles:[...state.followedProfiles],

      altFollowed:state.altFollowed,
      mutual:state.mutual,
      altDiscoveredInNews:state.altDiscoveredInNews,
      unreadChats:[...state.unreadChats],
      seenChatEvents:[...state.seenChatEvents],
      seenActivityEvents:[...state.seenActivityEvents],
      museumNewsOpened:state.museumNewsOpened,
      xiaAnReply:state.xiaAnReply,
      xiaAnReplyAt:state.xiaAnReplyAt,
      xiaAnAppointmentReplied:state.xiaAnAppointmentReplied,
	  xiaAnDeclined:state.xiaAnDeclined,
      xiaAnWarnedOff:state.xiaAnWarnedOff,
      xiaAnEmergencyTriggered:state.xiaAnEmergencyTriggered,
      xiaAnEmergencyMessagesShown:state.xiaAnEmergencyMessagesShown,
      lilithChatStarted:state.lilithChatStarted,
      endingUnlocked:state.endingUnlocked,
      endingViewed:state.endingViewed,
      altChatHistory:state.altChatHistory,
      lilithChatHistory:state.lilithChatHistory,
      dailyNoClueNotices:[...state.dailyNoClueNotices],
      gameEndNoticeDismissed:state.gameEndNoticeDismissed,
      completionSignature:state.completionSignature
    })
  );
}
function updateFollowButton(selector,profileId){
  const button=$(selector);

  if(!button)return;

  const followed=state.followedProfiles.has(profileId);

  button.classList.toggle('following',followed);
  button.textContent=followed?'追蹤中':'追蹤';
}

function toggleProfileFollow(selector,profileId){
  if(state.followedProfiles.has(profileId)){
    state.followedProfiles.delete(profileId);
  }else{
    state.followedProfiles.add(profileId);
  }

  save();
  updateFollowButton(selector,profileId);
  if(profileId===NEWS_PROFILE.handle&&state.view==='activity')renderActivity(false);
}

function renderFollowStates(){
  updateFollowButton('#followBtn',PROFILE.handle);
  updateFollowButton('#newsFollowBtn',NEWS_PROFILE.handle);
}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function icon(id){return `<svg><use href="#${id}"/></svg>`}
function avatar(name,src,attrs=''){return `<img class="avatar post-avatar" src="${src}" alt="${esc(name)} 的頭像" ${attrs}>`}
function postAvatar(p){
  if(p.avatar)return p.avatar;
  if(p.handle===PROFILE.handle)return PROFILE.avatar;
  if(p.handle===NEWS_PROFILE.handle)return NEWS_PROFILE.avatar;
  if(p.handle===ALT.handle)return ALT.avatar;
  return 'assets/avatar-3.svg';
}
function publishedTimeHTML(item){
  const stamp=item.publishedAt?` data-published-at="${esc(item.publishedAt)}"`:'';
  return `<span class="dynamic-time"${stamp}>${esc(formatPublishedTime(item))}</span>`;
}
function actions(p,openable=true){
  const liked=localStorage.getItem('liked-'+p.id)==='1';
  const baseLikes=Number(p.likes)||0;
  const replyCount=p.comments??(p.replies?.length||0);
  return `<div class="actions"><button class="action heart ${liked?'liked':''}" data-like="${p.id}" data-base-likes="${baseLikes}">${icon('i-heart')}<span>${baseLikes+(liked?1:0)}</span></button><button class="action" ${openable?`data-open="${p.id}"`:''}>${icon('i-comment')}<span>${replyCount}</span></button><button class="action">${icon('i-repost')}<span>${p.reposts||0}</span></button><button class="action">${icon('i-send')}<span>${p.shares||0}</span></button></div>`;
}
function postHTML(p,clickable=true){const own=p.handle===PROFILE.handle;const account=p.handle;const newsAccount=account===NEWS_PROFILE.handle;const altAccount=account===ALT.handle&&hasArrived(RELEASE.portrait);const accountLink=newsAccount?'data-news-profile-link="1" tabindex="0" role="link" aria-label="前往高譚日報的個人頁面"':altAccount?'data-alt-profile-link="1" tabindex="0" role="link" aria-label="前往 LH5588812 的個人頁面"':'';return `<article class="post ${p.headline?'news-post':''}" ${clickable?`data-post="${p.id}"`:''}>${avatar(account,postAvatar(p),accountLink)}<div><div class="post-header"><strong ${accountLink}>${esc(account)}</strong><span class="meta">${own?PROFILE.flag+' '+PROFILE.location+' · ':''}${publishedTimeHTML(p)}</span><span class="dots">•••</span></div>${p.feedReason?`<div class="feed-reason">${esc(p.feedReason)}</div>`:''}${p.headline?`<h1 class="news-headline">${esc(p.headline)}</h1>`:''}<p class="post-text">${esc(p.text)}</p>${p.image?`<img class="post-image" src="${esc(p.image)}" alt="串文圖片">`:''}${actions(p,clickable)}</div></article>`}
function getReplyParent(reply){
  if(reply.parentId)return ALL_POSTS.find(post=>post.id===reply.parentId);
  if(reply.parentPost)return ALL_POSTS.find(post=>post.id===reply.parentPost.id)||reply.parentPost;
  return null;
}
function replyThreadHTML(reply){
  const parent=getReplyParent(reply);
  if(!parent)return postHTML(reply);
  const liked=localStorage.getItem('liked-'+reply.id)==='1';
  const baseLikes=Number(reply.likes)||0;
  return `<div class="reply-thread" data-reply-thread="${parent.id}" tabindex="0" role="link" aria-label="開啟 ${esc(parent.handle)} 的原始串文">
    <div class="reply-thread-parent">${postHTML(parent,false)}</div>
    <article class="reply-thread-response">
      ${avatar(reply.handle,postAvatar(reply))}
      <div>
        <div class="post-header"><strong>${esc(reply.handle)}</strong><span class="meta">${publishedTimeHTML(reply)} · ${PROFILE.flag} ${esc(PROFILE.location)}</span><span class="dots">•••</span></div>
        <p class="post-text">${esc(reply.text)}</p>
        ${reply.image?`<img class="post-image" src="${esc(reply.image)}" alt="回覆圖片">`:''}
        <div class="actions"><button class="action heart ${liked?'liked':''}" data-like="${reply.id}" data-base-likes="${baseLikes}">${icon('i-heart')}<span>${baseLikes+(liked?1:0)}</span></button><button class="action">${icon('i-comment')}<span>${reply.replies?.length||0}</span></button><button class="action">${icon('i-repost')}<span>${reply.reposts||0}</span></button><button class="action">${icon('i-send')}<span>${reply.shares||0}</span></button></div>
      </div>
    </article>
  </div>`;
}
const EMPTY_TAB_TEXT={
  posts:'尚未發布任何串文',
  replies:'尚未發布任何回覆',
  media:'尚未發布任何影音內容',
  reposts:'尚未轉發任何串文'
};
let newsProfileTab='posts';
let altProfileTab='posts';
let viewerProfileTab='posts';
function isPostReleased(post){return !post.publishedAt||hasArrived(post.publishedAt)}
function canAccessPost(post){
  return isPostReleased(post)&&(!ALT_POSTS.some(item=>item.id===post.id)||state.mutual);
}
function renderFeed(list=profilePosts(),target='#feed',emptyText='目前沒有內容'){
  list=list.filter(canAccessPost);
  const el=$(target);
  el.innerHTML=list.length?list.map(p=>(p.parentId||p.parentPost)?replyThreadHTML(p):postHTML(p)).join(''):`<div class="empty">${esc(emptyText)}</div>`;
  bindActions();
}
function updateLikeButton(button,storageKey){
  const on=button.classList.toggle('liked');
  const baseLikes=Number(button.dataset.baseLikes)||0;
  localStorage.setItem('liked-'+storageKey,on?'1':'0');
  button.querySelector('span').textContent=baseLikes+(on?1:0);
}
function bindActions(){
  $$('[data-like]').forEach(b=>b.onclick=e=>{
    e.stopPropagation();
    updateLikeButton(b,b.dataset.like);
  });
  $$('[data-post]').forEach(x=>x.onclick=()=>openPost(x.dataset.post));
  $$('[data-open]').forEach(x=>x.onclick=e=>{e.stopPropagation();openPost(x.dataset.open)});
  $$('[data-reply-thread]').forEach(x=>{
    const open=e=>{
      if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;
      if(e.target.closest('button,a,[data-news-profile-link]'))return;
      e.preventDefault();
      openPost(x.dataset.replyThread);
    };
    x.onclick=open;
    x.onkeydown=open;
  });
  $$('[data-news-profile-link]').forEach(x=>{const open=e=>{if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;e.preventDefault();e.stopPropagation();showView('newsProfile',state.view);renderNewsProfile()};x.onclick=open;x.onkeydown=open});
  $$('[data-alt-profile-link]').forEach(x=>{const open=e=>{if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;e.preventDefault();e.stopPropagation();openAlt()};x.onclick=open;x.onkeydown=open});
}
function repliesHTML(p){const ordered=(p.replies||[]).map((r,i)=>({...r,index:i})).sort((a,b)=>Number(b.ownerLiked)-Number(a.ownerLiked));return ordered.length?ordered.map(r=>{
  const key=r.likeId||(p.id+'r'+r.index);
  const on=localStorage.getItem('liked-'+key)==='1';
  const baseLikes=Number(r.likes)||0;

  const isAuthor=r.isAuthor===true;

  const profileAttrs=r.profileLink?'data-profile-entry-target="1" tabindex="0" role="link" aria-label="前往此帳號的個人頁面"':r.altProfileLink?'data-alt-entry-target="1" tabindex="0" role="link" aria-label="前往此帳號的個人頁面"':'';
  const visibleClueAttrs=r.visibleClue?`data-visible-clue="${esc(r.visibleClue)}"`:'';
  return `<article class="reply" ${visibleClueAttrs}>${avatar(r.handle,r.avatar,profileAttrs)}<div><div class="post-header">
  <strong ${profileAttrs}>${esc(r.handle)}</strong>

<span class="meta">
  ${(r.time||r.publishedAt)?`${publishedTimeHTML(r)} · `:''}
  ${esc(r.flag||'🇺🇸')} ${esc(r.location||'高譚')}
  ${isAuthor?' · 作者':''}
</span>

  ${
    r.ownerLiked
      ? `
        <span class="owner-liked">
          ♥
          <img src="${postAvatar(p)}" alt="由 ${esc(p.handle)} 按讚" title="${esc(p.handle)} 按讚">
        </span>
      `
      : ''
  }
  </div>${r.text?`<p class="post-text">${esc(r.text)}</p>`:''}${r.image?`<img class="reply-image" src="${esc(r.image)}" alt="留言圖片">`:''}${r.link?`<a class="reply-link" href="${esc(r.link)}" target="_blank" rel="noopener noreferrer">${esc(r.link)}</a>`:''}<div class="actions"><button class="action heart ${on?'liked':''}" data-reply-like="${key}" data-base-likes="${baseLikes}">${icon('i-heart')}<span>${baseLikes+(on?1:0)}</span></button><button class="action">${icon('i-comment')}<span>0</span></button><button class="action">${icon('i-repost')}<span>${r.reposts||0}</span></button><button class="action">${icon('i-send')}<span>${r.shares||0}</span></button></div></div></article>`}).join(''):'<div class="empty">尚無回覆</div>'}
let visibleClueObserver=null;
function bindVisibleClues(){
  if(visibleClueObserver)visibleClueObserver.disconnect();
  visibleClueObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const triggerId=entry.target.dataset.visibleClue;
      if(triggerId==='lh-understands-hill'){
        state.altDiscoveredInNews=true;
        save();
      }
      const clue=CLUES.find(item=>item.postId===triggerId);
      if(!clue)return;
      if(state.unlocked.has(clue.id)){
        visibleClueObserver.unobserve(entry.target);
        return;
      }
      if(clueReleaseDay(clue)>currentTaipeiDay())return;
      unlock(triggerId);
      visibleClueObserver.unobserve(entry.target);
    });
  },{threshold:0.65});
  $$('[data-visible-clue]').forEach(element=>visibleClueObserver.observe(element));
}
function bindReplyActions(){
  $$('[data-reply-like]').forEach(b=>{
    b.onclick=e=>{
      e.stopPropagation();

      updateLikeButton(b,b.dataset.replyLike);
    };
  });

  $$('[data-profile-entry-target]').forEach(x=>{
    const open=e=>{
      if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;

      e.preventDefault();
      e.stopPropagation();

      unlock('lilith-profile-entry');
      showView('profile','news');
    };

    x.onclick=open;
    x.onkeydown=open;
  });
  $$('[data-alt-entry-target]').forEach(x=>{
    const open=e=>{
      if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;
      e.preventDefault();
      e.stopPropagation();
      state.altDiscoveredInNews=true;
      save();
      openAlt();
    };
    x.onclick=open;x.onkeydown=open;
  });
  bindVisibleClues();
}
function renderNews(){$('#newsPost').innerHTML=postHTML(NEWS_POST,true);$('#newsReplies').innerHTML=repliesHTML(NEWS_POST);bindActions();bindReplyActions()}
function releasedScheduledNews(){return SCHEDULED_NEWS_POSTS.filter(post=>hasArrived(post.publishedAt))}
function releasedProfileOnlyNews(){return PROFILE_ONLY_SCHEDULED_NEWS.filter(post=>hasArrived(post.publishedAt))}
function newsProfilePosts(){
  const scheduled=[...releasedScheduledNews(),...releasedProfileOnlyNews()].sort((a,b)=>timeMs(b.publishedAt)-timeMs(a.publishedAt));
  return [...scheduled,...NEWS_RECENT_POSTS,NEWS_POST,...NEWS_PROFILE_POSTS];
}
function renderNewsProfile(tab=newsProfileTab){
  newsProfileTab=tab;
  $('#newsProfileAvatar').src=NEWS_PROFILE.avatar;$('#newsProfileName').textContent=NEWS_PROFILE.name;$('#newsProfileHandle').textContent=NEWS_PROFILE.handle;
  $$('[data-news-tab]').forEach(button=>button.classList.toggle('active',button.dataset.newsTab===tab));
  const posts=newsProfilePosts();
  const content={posts,replies:[],media:posts.filter(post=>post.image),reposts:[]}[tab]||[];
  renderFeed(content,'#newsProfileFeed',EMPTY_TAB_TEXT[tab]);
}
function openPost(id){
  const p=ALL_POSTS.find(x=>x.id===id);
  if(!p||!canAccessPost(p))return;
  if([...SCHEDULED_NEWS_POSTS,...PROFILE_ONLY_SCHEDULED_NEWS].includes(p)&&!hasArrived(p.publishedAt))return;
  if(id===NEWS_1114_POST.id){state.museumNewsOpened=true;save()}
  unlock(id);showView('detail');$('#detailPost').innerHTML=postHTML(p,false);$('#detailReplies').innerHTML=repliesHTML(p);bindActions();bindReplyActions()
}
function renderPeople(type='followers'){
  if(type==='followers'&&hasArrived(RELEASE.portrait)&&state.altDiscoveredInNews){
    unlock('alt-follower-connection');
  }
  const list=type==='followers'?FOLLOWERS:FOLLOWING;
  $('#followersTab').classList.toggle('active',type==='followers');$('#followingTab').classList.toggle('active',type==='following');
  $('#peopleList').innerHTML=list.map((p,i)=>{
    const canOpenAlt=p.isAlt&&hasArrived(RELEASE.portrait);
    return `<article class="person ${canOpenAlt?'clickable-person':''}" ${canOpenAlt?'data-alt-profile="1" tabindex="0" role="link"':''}><img class="avatar person-avatar" src="${p.avatar}" alt="${esc(p.name)}"><div class="person-copy"><strong>${esc(p.name)}</strong><span>@${esc(p.handle)}</span>${p.bio?`<p>${esc(p.bio)}</p>`:''}</div><button class="mini-follow" data-person-follow="${type}-${i}">追蹤</button></article>`;
  }).join('');
  $$('[data-alt-profile]').forEach(row=>{const open=e=>{if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;if(e.target.closest('[data-person-follow]'))return;e.preventDefault();openAlt()};row.onclick=open;row.onkeydown=open});
  $$('[data-person-follow]').forEach(b=>b.onclick=()=>{const on=b.classList.toggle('following');b.textContent=on?'追蹤中':'追蹤'});
}
function openAlt(){if(!hasArrived(RELEASE.portrait))return;showView('alt');renderAlt()}
function renderAlt(tab=altProfileTab){
  altProfileTab=tab;
  $('#altProfileAvatar').src=ALT.avatar;
  const follow=$('#altFollowBtn');follow.textContent=state.altFollowed?'追蹤中':'追蹤';follow.classList.toggle('following',state.altFollowed);
  const canViewFeed=state.mutual;
  $('#followsYou').classList.toggle('hidden',!state.mutual);
  $('#altGate').classList.toggle('hidden',canViewFeed);
  $('#altFeed').classList.toggle('hidden',!canViewFeed);
  $$('[data-alt-tab]').forEach(button=>button.classList.toggle('active',button.dataset.altTab===tab));
  if(canViewFeed){
    const posts=ALT_POSTS.filter(post=>post.id!=='alt-1113-fraction'||hasArrived(post.publishedAt));
    const availableReplies=ALT_REPLY_POSTS.filter(reply=>!reply.publishedAt||hasArrived(reply.publishedAt));
    const content={posts,replies:availableReplies,media:posts.filter(post=>post.image),reposts:[]}[tab]||[];
    renderFeed(content,'#altFeed',EMPTY_TAB_TEXT[tab]);
  }
}
function followAlt(){if(state.altFollowed)return;state.altFollowed=true;state.unreadChats.add('alt');save();renderAlt();updateUnread();updateActivityBadge();toast('追蹤邀請已送出')}
function syncTimedChatUnread(){
  if(hasArrived(RELEASE.xiaAppointment)&&!state.seenChatEvents.has('xia-appointment'))state.unreadChats.add('friend1');
  if(hasArrived(RELEASE.xiaReplyDeadline)&&!state.xiaAnAppointmentReplied&&!state.seenChatEvents.has('xia-reminder'))state.unreadChats.add('friend1');
  if(hasArrived(state.xiaAnWarnedOff?RELEASE.xiaSafe:RELEASE.xiaEarly)&&!state.seenChatEvents.has('xia-early'))state.unreadChats.add('friend1');
  if(hasArrived(RELEASE.groupFilled)&&!state.seenChatEvents.has('group-filled'))state.unreadChats.add('group');
  if(hasArrived(RELEASE.groupArrivedOne)&&!state.seenChatEvents.has('group-meet'))state.unreadChats.add('group');
}
function xiaMessages(){
  const messages=[['date','2026年11月11日 上午11:23'],...CHATS.find(chat=>chat.id==='friend1').messages];
  if(hasArrived(RELEASE.xiaAppointment))messages.push(['date','2026年11月13日 上午10:05'],['in','明天11點半在美術館見面？']);
  if(state.xiaAnAppointmentReplied){
  messages.push(['out',state.xiaAnReply]);

  if(Date.now()-state.xiaAnReplyAt>=1000){
    messages.push([
      'in',
      state.xiaAnWarnedOff
        ? '怎麼突然這麼說？\n好吧，那我不去了。'
        : state.xiaAnDeclined
          ? '你怎麼突然反悔了？\n算了 我自己去吧。'
          : '明天見'
    ]);
  }
}
  if(hasArrived(RELEASE.xiaReplyDeadline)&&!state.xiaAnAppointmentReplied){
    messages.push(['in','你怎麼今天都沒回我訊息?記得明天見喔！']);
  }
if(state.xiaAnWarnedOff&&hasArrived(RELEASE.xiaSafe)){
  messages.push(
    ['date','2026年11月14日 上午11:05'],
    ['in','還好昨天有聽你的沒有去……\n看到新聞嚇死了，你沒事吧？']
  );
}else if(!state.xiaAnWarnedOff&&hasArrived(RELEASE.xiaEarly)){
  messages.push(
    ['date','2026年11月14日 上午10:48'],
    [
      'in',
      state.xiaAnDeclined
        ? '我提早到了，如果你最後決定有要來再跟我說一下～'
        : '我估錯時間太早到美術館了XDD\n先進去美術館裡面咖啡廳等你'
    ]
  );
}
  if(state.xiaAnEmergencyTriggered){
    messages.push(['share',NEWS_1114_POST.headline]);
    ['你沒事吧?','你可以回我嗎?','拜託你回我一下'].slice(0,state.xiaAnEmergencyMessagesShown).forEach(text=>messages.push(['out',text]));
  }
  return messages;
}
function groupMessages(){
  const messages=[...CHATS.find(chat=>chat.id==='group').messages];
  if(hasArrived(RELEASE.groupFilled))messages.push(['date','2026年11月12日 下午8:16'],['in','JOY：我約到人了囉~']);
  if(hasArrived(RELEASE.groupArrivedOne))messages.push(['date','2026年11月13日 下午1:55'],['in','Mika：我到了']);
  if(hasArrived(RELEASE.groupArrivedTwo))messages.push(['in','JOY：我也到了']);
  if(hasArrived(RELEASE.groupPing))messages.push(['in','Joe：@irrelevant.me 你到了嗎?']);
  return messages;
}
function chatMessages(chat){
  if(chat.id==='friend1')return xiaMessages();
  if(chat.id==='group')return groupMessages();
  return chat.messages;
}
function renderMessages(){
  syncTimedChatUnread();
  const altLastHistory=state.altChatHistory.at(-1);
  const altPreview=altLastHistory
    ? (altLastHistory.correct?'答對了，我追蹤你了。':'答錯了。')
    : state.mutual
      ? '答對了，我追蹤你了。'
      : '你也喜歡他？那你也記得他的生日嗎？';
  const mystery=state.altFollowed?`<button class="message-row" data-chat="alt"><img class="avatar" src="${ALT.avatar}" alt="${ALT.name}"><span><strong>${ALT.handle}</strong><small>${esc(altPreview)}</small></span>${state.unreadChats.has('alt')?'<i class="unread-dot">1</i>':''}</button>`:'';
	const lilith=state.lilithChatStarted
	  ? `
		<button class="message-row" data-chat="lilith">
		  <img class="avatar" src="${PROFILE.avatar}" alt="${PROFILE.name}">
		  <span>
			<strong>${PROFILE.handle}</strong>
			<small>
			  ${state.endingUnlocked
				? '你怎麼知道這些事情？'
				: state.lilithChatHistory.at(-1)?.text||'尚無訊息'
			  }
			</small>
		  </span>
		</button>
	  `
	  : '';
  $('#messageList').innerHTML=lilith+mystery+CHATS.map(c=>{const messages=chatMessages(c).filter(message=>message[0]!=='date');const preview=messages.at(-1)?.[1]||c.preview;return `<button class="message-row" data-chat="${c.id}"><img class="avatar" src="${c.avatar}" alt="${esc(c.name)}"><span><strong>${esc(c.name)}</strong><small>${esc(preview)}</small></span>${state.unreadChats.has(c.id)?'<i class="unread-dot">1</i>':`<time>${esc(c.time)}</time>`}</button>`}).join('');
  $$('[data-chat]').forEach(b=>b.onclick=()=>b.dataset.chat==='alt'?openChat():b.dataset.chat==='lilith'?openLilithChat():openRegularChat(b.dataset.chat));save()
}
function updateUnread(){syncTimedChatUnread();$('#navUnread').classList.toggle('hidden',state.unreadChats.size===0);if(state.view==='messages')renderMessages()}
function eligibleActivityEvents(){
  const events=releasedScheduledNews().map(post=>post.id);
  if(state.mutual&&hasArrived(RELEASE.altPost))events.push('alt-1113-fraction');
  if(hasArrived(RELEASE.prisonRumor))events.push('a9-prison-rumor');
  return events;
}
function activityPosts(){
  const reason=state.followedProfiles.has(NEWS_PROFILE.handle)?'因為你追蹤':'建議串文';
  const news=releasedScheduledNews().map(post=>({...post,feedReason:reason}));
  const alt=state.mutual&&hasArrived(RELEASE.altPost)?[{...ALT_POSTS.find(post=>post.id==='alt-1113-fraction'),feedReason:'因為你追蹤'}]:[];
  const regular=ACTIVITY_POSTS.filter(post=>post.id!=='a9-prison-rumor'||hasArrived(post.publishedAt));
  return [...news,...alt,...regular].sort((a,b)=>timeMs(b.publishedAt||0)-timeMs(a.publishedAt||0));
}
function updateActivityBadge(){
  const count=eligibleActivityEvents().filter(id=>!state.seenActivityEvents.has(id)).length;
  const badge=$('#activityUnread');
  badge.textContent=String(Math.min(9,count));
  badge.classList.toggle('hidden',count===0);
}
function renderActivity(markSeen=false){
  renderFeed(activityPosts(),'#activityFeed');
  if(markSeen){eligibleActivityEvents().forEach(id=>state.seenActivityEvents.add(id));save()}
  updateActivityBadge();
}
function refreshRelativeTimeLabels(){
  $$('[data-published-at]').forEach(node=>{node.textContent=formatPublishedTime({publishedAt:node.dataset.publishedAt})});
}
let lastTimelineSignature='';
function refreshTimeline(){
  syncTimedChatUnread();
  const signature=[...POSTS.filter(isPostReleased).map(post=>post.id),...NEWS_RECENT_POSTS.filter(isPostReleased).map(post=>post.id),...ACTIVITY_POSTS.filter(isPostReleased).map(post=>post.id),...eligibleActivityEvents(),...releasedProfileOnlyNews().map(post=>post.id),hasArrived(RELEASE.xiaAppointment),hasArrived(RELEASE.xiaReplyDeadline),hasArrived(RELEASE.lilithMessages),hasArrived(RELEASE.xiaEarly),hasArrived(RELEASE.xiaSafe),hasArrived(RELEASE.groupFilled),hasArrived(RELEASE.groupArrivedOne),hasArrived(RELEASE.groupArrivedTwo),hasArrived(RELEASE.groupPing)].join('|');
  if(signature!==lastTimelineSignature){
    lastTimelineSignature=signature;
    if(state.view==='newsProfile')renderNewsProfile();
    if(state.view==='activity')renderActivity(false);
    if(state.view==='alt')renderAlt();
    if(state.view==='profile')renderFeed(profilePosts());
    if(state.view==='messages')renderMessages();
    if(state.view==='chat'&&activeChatId==='friend1'){
      if(hasArrived(RELEASE.xiaReplyDeadline)&&!state.xiaAnAppointmentReplied){
        state.seenChatEvents.add('xia-reminder');state.unreadChats.delete('friend1');
      }
      renderRegularChat(CHATS.find(chat=>chat.id==='friend1'));
    }
    if(state.view==='chat'&&activeChatId==='group'){
      if(hasArrived(RELEASE.groupFilled))state.seenChatEvents.add('group-filled');
      if(hasArrived(RELEASE.groupArrivedOne))state.seenChatEvents.add('group-meet');
      state.unreadChats.delete('group');
      renderRegularChat(CHATS.find(chat=>chat.id==='group'));
    }
    updateUnread();updateActivityBadge();save();
  }
  refreshRelativeTimeLabels();
  checkCompletion();
  checkDailyAndGameNotices(false);
}
function normalizeChatAnswer(value){
  return String(value).normalize('NFKC').replace(/[\s\p{P}]/gu,'');
}
function isEndingQuestion(value) {
  const answer = normalizeChatAnswer(value);
  return /^(?:你|妳)今天要去見(?:他|希爾)(?:嗎[?？]?|[?？])$/.test(answer);
}

function endingReplyHint(value) {
  const answer = normalizeChatAnswer(value);
  if (answer.includes('見他') && !answer.includes('今天')) {
    return '你在說什麼？';
  }
  if (answer.includes('今天') && !answer.includes('見他')) {
    return '今天怎麼了？';
  }
  return '你想問什麼？';
}
function isXiaWarning(value){
  // Match a request not to go; a first-person refusal alone does not warn Xia An.
  return String(value).split(/[，。！？!?；;\n]/u).some(part=>{
    const answer=normalizeChatAnswer(part);
    return /^(?:小安)?(?:拜託|拜托|請|我覺得|我建議|我希望)?(?:(?:今天|明天))?(?:你們|我們|咱們|你|妳)?(?:今天|明天)?(?:真的|千萬|最好|還是|絕對)?(?:都|先)?(?:不要|別|不准)(?:再)?(?:去|過去)/.test(answer)
      || /^(?:小安)?(?:你們|我們|咱們|你|妳)(?:今天|明天)?(?:都|還是)?(?:不去|不去了|別去了|不要去了)(?:美術館|看展)?(?:了|吧|好嗎)?$/.test(answer)
      || /^(?:小安)?(?:取消|改天再去)(?:明天的?|今天的?)?(?:看展|美術館|約定|行程)/.test(answer);
  });
}
function openChat(){
  showView('chat','messages');
  activeChatId='alt';
  state.unreadChats.delete('alt');
  save();
  updateUnread();

  const history=state.altChatHistory.length
    ? state.altChatHistory
    : state.mutual?[{text:'0831',correct:true}]:[];

  $('#chatBody').innerHTML=`
    <div class="chat-person">
      <img class="avatar" src="${ALT.avatar}" alt="${esc(ALT.name)}">
      <strong>${esc(ALT.name)}</strong>
      <span>@${esc(ALT.handle)}</span>
    </div>
    <div class="date-divider">今天</div>
    <div class="bubble incoming">你也喜歡他？那你也記得他的生日嗎？</div>
    ${history.map(item=>`
      <div class="bubble outgoing">${esc(item.text)}</div>
      <div class="bubble incoming">${item.correct?'答對了，我追蹤你了。':'答錯了。'}</div>
    `).join('')}
    ${state.mutual?'<button class="view-alt-btn" id="viewAltFromChat">查看帳號</button>':''}
  `;

  const input=$('#codeInput');input.inputMode='text';input.removeAttribute('maxlength');input.placeholder='發送訊息……';input.setAttribute('aria-label','發送訊息……');
  $('#codeForm').classList.toggle('hidden',state.mutual);

  if(state.mutual){
    $('#viewAltFromChat').onclick=openAlt;
  }
}
let activeChatId='';
let endingTypingTimer=null;
function renderEnding(){
  clearTimeout(endingTypingTimer);
  const text=$('#endingText');
  const image=$('#endingImage');
  image.classList.add('hidden');
  if(ENDING_CONTENT.image)image.src=ENDING_CONTENT.image;
  const characters=Array.from(ENDING_CONTENT.text);
  let index=0;
  text.textContent='';

  const typeNextCharacter=()=>{
    if(state.view!=='ending')return;
    text.textContent+=characters[index]||'';
    index++;
    if(index<characters.length)endingTypingTimer=setTimeout(typeNextCharacter,28);
    else {
      image.classList.toggle('hidden',!ENDING_CONTENT.image);
      state.endingViewed=true;
      save();
      checkDailyAndGameNotices();
    }
  };

  typeNextCharacter();
}
function openLilithChat(){
  if(
    !state.lilithChatStarted &&
    !hasArrived(RELEASE.lilithMessages)
  ){
    return;
  }

  state.lilithChatStarted=true;
  save();

  activeChatId='lilith';
  showView('chat','messages');
  const history=state.lilithChatHistory.length
    ? state.lilithChatHistory
    : state.endingUnlocked?[{text:'你今天要去見他嗎？',correct:true}]:[];

  $('#chatBody').innerHTML=`
    <div class="chat-person">
      <img
        class="avatar"
        src="${PROFILE.avatar}"
        alt="${esc(PROFILE.name)}"
      >
      <strong>${esc(PROFILE.name)}</strong>
      <span>@${esc(PROFILE.handle)}</span>
    </div>

    ${history.map(item=>`<div class="bubble outgoing">${esc(item.text)}</div>${item.reply?`<div class="bubble incoming">${esc(item.reply)}</div>`:''}`).join('')}
    ${state.endingUnlocked?`
      <div class="bubble incoming">你是誰？</div>
      <div class="bubble incoming">你怎麼知道這些事情？</div>
      <button class="view-alt-btn" id="showEndingBtn">顯示結局</button>
    `:''}
  `;

  const input=$('#codeInput');

  input.inputMode='text';
  input.removeAttribute('maxlength');
  input.placeholder='傳送訊息';

  $('#codeForm').classList.toggle(
    'hidden',
    state.endingUnlocked
  );

  if(state.endingUnlocked){
    $('#showEndingBtn').onclick=()=>{
      
      if(completionTimer){clearTimeout(completionTimer);completionTimer=null}
      showView('ending','chat');
      renderEnding();
    };
  }
}
function chatMessageHTML(message){
  if(message[0]==='date')return `<div class="date-divider">${esc(message[1])}</div>`;
  if(message[0]==='share')return `<button class="shared-post" data-open="${NEWS_1114_POST.id}"><strong>高譚日報</strong><span>${esc(message[1])}</span></button>`;
  return `<div class="bubble ${message[0]==='in'?'incoming':'outgoing'}">${esc(message[1])}</div>`;
}
function renderRegularChat(c){
  const subtitle=c.isGroup?c.subtitle:`@${c.handle}`;
  $('#chatBody').innerHTML=`<div class="chat-person"><img class="avatar" src="${c.avatar}" alt="${esc(c.name)}"><strong>${esc(c.name)}</strong><span>${esc(subtitle)}</span></div>${chatMessages(c).map(chatMessageHTML).join('')}`;
  bindActions();
  const input=$('#codeInput');
  const canReply=c.id==='friend1'&&hasArrived(RELEASE.xiaAppointment)&&!hasArrived(RELEASE.xiaReplyDeadline)&&!state.xiaAnAppointmentReplied;
  input.inputMode='text';input.removeAttribute('maxlength');input.placeholder='輸入訊息';
  $('#codeForm').classList.toggle('hidden',!canReply);
}
let xiaEmergencyTimer=null;
function continueXiaEmergency(){
  if(!state.xiaAnEmergencyTriggered||xiaEmergencyTimer!==null)return;
  const messages=['你沒事吧?','你可以回我嗎?','拜託你回我一下'];
  const next=state.xiaAnEmergencyMessagesShown;
  if(next>=messages.length)return;
  xiaEmergencyTimer=setTimeout(()=>{
    xiaEmergencyTimer=null;
    if(!state.xiaAnEmergencyTriggered||state.xiaAnEmergencyMessagesShown!==next)return;
    state.xiaAnEmergencyMessagesShown=next+1;
    save();
    if(activeChatId==='friend1'&&state.view==='chat'){
      $('#chatBody').insertAdjacentHTML('beforeend',chatMessageHTML(['out',messages[next]]));
      scrollTo(0,document.body.scrollHeight);
    }
    continueXiaEmergency();
  },1000);
}
function openRegularChat(id){
  const c=CHATS.find(x=>x.id===id);if(!c)return;
  activeChatId=id;showView('chat','messages');
  if(id==='friend1'){
    if(hasArrived(RELEASE.xiaAppointment))state.seenChatEvents.add('xia-appointment');
    if(hasArrived(RELEASE.xiaReplyDeadline))state.seenChatEvents.add('xia-reminder');
    if(hasArrived(state.xiaAnWarnedOff?RELEASE.xiaSafe:RELEASE.xiaEarly))state.seenChatEvents.add('xia-early');
    state.unreadChats.delete('friend1');
    if(state.museumNewsOpened&&hasArrived(RELEASE.museumExplosion)&&!state.xiaAnWarnedOff&&!state.xiaAnEmergencyTriggered){
      state.xiaAnEmergencyTriggered=true;state.xiaAnEmergencyMessagesShown=0;
    }
  }
  if(id==='group'){
    if(hasArrived(RELEASE.groupFilled))state.seenChatEvents.add('group-filled');
    if(hasArrived(RELEASE.groupArrivedOne))state.seenChatEvents.add('group-meet');
    state.unreadChats.delete('group');
  }
  save();updateUnread();renderRegularChat(c);
  if(id==='friend1')continueXiaEmergency();
}
function initProfile(){$('#displayName').textContent=PROFILE.name;$('#handle').textContent=PROFILE.handle;$('#location').textContent=PROFILE.location;$('.flag').textContent=PROFILE.flag;$('#bio').innerHTML=esc(PROFILE.bio).replace(/\n/g,'<br>');$('#tags').innerHTML=PROFILE.tags.map(t=>`<span>${esc(t)}</span>`).join('');$('#followers').textContent=PROFILE.followers;$('#following').textContent=PROFILE.following;$('#profileAvatar').src=PROFILE.avatar}
function toast(t){const x=$('#toast');x.textContent=t;x.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>x.classList.remove('show'),1800)}
$('#followBtn').onclick=()=>{  toggleProfileFollow('#followBtn',PROFILE.handle);};
$('#messageBtn').onclick=()=>(state.lilithChatStarted||hasArrived(RELEASE.lilithMessages))?openLilithChat():$('#messageDialog').showModal();
$('#closeDialog').onclick=()=>$('#messageDialog').close();
$('#closeCompletionDialog').onclick=()=>$('#completionDialog').close();
$('#closeDailyNoClueDialog').onclick=()=>$('#dailyNoClueDialog').close();
$('#closeGameEndDialog').onclick=()=>{
  state.gameEndNoticeDismissed=true;
  save();
  $('#gameEndDialog').close();
};
$('#gameEndDialog').addEventListener('close',()=>{
  state.gameEndNoticeDismissed=true;
  save();
});

function openCreatorDialog(){
  $('#creatorDialog').showModal();
}

$('#pageTitle').onclick=openCreatorDialog;

$('#pageTitle').onkeydown=e=>{
  if(e.key!=='Enter'&&e.key!==' ')return;

  e.preventDefault();
  openCreatorDialog();
};

$('#closeCreatorDialog').onclick=()=>{
  $('#creatorDialog').close();
};
$('#newsFollowBtn').onclick=()=>{  toggleProfileFollow('#newsFollowBtn',NEWS_PROFILE.handle);};
$('#newsMessageBtn').onclick=()=>$('#messageDialog').showModal();
$('#searchBtn').onclick=()=>showView('search');$('#backBtn').onclick=()=>{
  if(history.state?.argView!=='news'){
    history.back();
  }else{
    showView('news','news',false);
  }
};
$('#followersBtn').onclick=()=>{showView('people');renderPeople('followers')};$('#followingBtn').onclick=()=>{showView('people');renderPeople('following')};$('#followersTab').onclick=()=>renderPeople('followers');$('#followingTab').onclick=()=>renderPeople('following');
$('#altFollowBtn').onclick=followAlt;$('#altMessageBtn').onclick=()=>state.altFollowed?openChat():$('#messageDialog').showModal();
$('#codeForm').onsubmit=e=>{
  e.preventDefault();

  const input=$('#codeInput');
  const answer=input.value.trim().replace(/\s/g,'');

  if(!answer)return;

if(activeChatId==='lilith'){
  const message=input.value.trim();
  const correct=isEndingQuestion(message);
  const reply=correct?'':endingReplyHint(message);

  state.lilithChatHistory.push({text:message,correct,reply});
  save();

  input.value='';

  $('#chatBody').insertAdjacentHTML(
    'beforeend',
    `<div class="bubble outgoing">${esc(message)}</div>`
  );

  if(correct){
    state.endingUnlocked=true;
    save();

    $('#codeForm').classList.add('hidden');

    setTimeout(()=>{
  if(activeChatId!=='lilith'||state.view!=='chat')return;

  $('#chatBody').insertAdjacentHTML(
    'beforeend',
    `
      <div class="bubble incoming">
        你是誰？
      </div>
    `
  );

  scrollTo(0,document.body.scrollHeight);
},2000);

setTimeout(()=>{
  if(activeChatId!=='lilith'||state.view!=='chat')return;

  $('#chatBody').insertAdjacentHTML(
    'beforeend',
    `
      <div class="bubble incoming">
        你怎麼知道這些事情？
      </div>
    `
  );

  scrollTo(0,document.body.scrollHeight);
},4000);

setTimeout(()=>{
  if(activeChatId!=='lilith'||state.view!=='chat')return;

  $('#chatBody').insertAdjacentHTML(
    'beforeend',
    `
      <button
        class="view-alt-btn"
        id="showEndingBtn"
      >
        顯示結局
      </button>
    `
  );

  $('#showEndingBtn').onclick=()=>{
    
    if(completionTimer){clearTimeout(completionTimer);completionTimer=null}
    showView('ending','chat');
    renderEnding();
  };

  scrollTo(0,document.body.scrollHeight);
},6000);
  }else{
    $('#chatBody').insertAdjacentHTML('beforeend',`<div class="bubble incoming">${esc(reply)}</div>`);
    scrollTo(0,document.body.scrollHeight);
  }

  return;
}

  if(activeChatId==='friend1'){
    if(state.xiaAnAppointmentReplied||!hasArrived(RELEASE.xiaAppointment)||hasArrived(RELEASE.xiaReplyDeadline)){
      input.value='';
      state.seenChatEvents.add('xia-reminder');state.unreadChats.delete('friend1');save();
      renderRegularChat(CHATS.find(chat=>chat.id==='friend1'));
      return;
    }
    state.xiaAnReply=input.value.trim();
	state.xiaAnReplyAt=Date.now();
	state.xiaAnAppointmentReplied=true;
	state.xiaAnWarnedOff=isXiaWarning(state.xiaAnReply);

		const declineKeywords=[
		  '沒空','不去','不能去','沒辦法去','不想去','不方便','臨時有事',];

state.xiaAnDeclined=!state.xiaAnWarnedOff&&declineKeywords.some(keyword=>{
  return state.xiaAnReply.includes(keyword);
});
    input.value='';save();
    renderRegularChat(CHATS.find(chat=>chat.id==='friend1'));
    setTimeout(()=>{
      if(activeChatId==='friend1')renderRegularChat(CHATS.find(chat=>chat.id==='friend1'));
    },1000);
    return;
  }

  const accepted=['八三一','831','0831','8/31','08/31','8月31日','八月三十一日','八月三十一號','八月三十一','8月31號','8月31'];
  const altMessage=input.value.trim();
  const altCorrect=accepted.includes(answer.normalize('NFKC'));

  state.altChatHistory.push({text:altMessage,correct:altCorrect});
  save();

  $('#chatBody').insertAdjacentHTML(
    'beforeend',
    `<div class="bubble outgoing">${esc(input.value.trim())}</div>`
  );

  if(altCorrect){
    state.mutual=true;
    save();

    $('#chatBody').insertAdjacentHTML(
      'beforeend',
      `<div class="bubble incoming">答對了，我追蹤你了。</div>
       <button class="view-alt-btn" id="viewAltFromChat">查看帳號</button>`
    );

    input.value='';
    $('#codeForm').classList.add('hidden');
    $('#viewAltFromChat').onclick=openAlt;
  }else{
    $('#chatBody').insertAdjacentHTML(
      'beforeend',
      `<div class="bubble incoming">答錯了。</div>`
    );

    input.value='';
  }
};
$$('[data-nav]').forEach(b=>b.onclick=()=>{
  const v=b.dataset.nav;
  if(v==='news'){openRememberedHome();return}
  showView(v,v);
  if(v==='messages')renderMessages();
  if(v==='activity')renderActivity(true);
  if(v==='search')renderProgress();
  if(v==='viewer')renderViewerTab();
});
const TAB_CONTENT={replies:REPLY_POSTS,media:MEDIA_POSTS,reposts:REPOST_POSTS};$$('[data-profile-tab]').forEach(b=>b.onclick=()=>{$$('[data-profile-tab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderFeed(b.dataset.profileTab==='posts'?profilePosts():TAB_CONTENT[b.dataset.profileTab])});
$$('[data-news-tab]').forEach(button=>button.onclick=()=>renderNewsProfile(button.dataset.newsTab));
$$('[data-alt-tab]').forEach(button=>button.onclick=()=>renderAlt(button.dataset.altTab));
function renderViewerTab(tab=viewerProfileTab){
  viewerProfileTab=tab;
  $$('[data-viewer-tab]').forEach(button=>button.classList.toggle('active',button.dataset.viewerTab===tab));
  renderFeed([],'#viewerFeed',EMPTY_TAB_TEXT[tab]);
}
$$('[data-viewer-tab]').forEach(button=>button.onclick=()=>renderViewerTab(button.dataset.viewerTab));
$('#searchInput').oninput=e=>{const q=e.target.value.trim().toLowerCase();if(q==='0826')unlock('p3');const list=POSTS.filter(isPostReleased).filter(p=>(p.text+(p.clue||'')+(p.clueTitle||'')).toLowerCase().includes(q));$('#searchResults').innerHTML=q?`<div class="reply-heading">搜尋結果</div>${list.map(p=>postHTML(p)).join('')}`:'';bindActions()};
history.replaceState(
  {
    argView:'news',
    previousView:'news'
  },
  ''
);

window.addEventListener('popstate',event=>{
  const view=event.state?.argView;

  if(!view)return;

  showView(
    view,
    event.state?.previousView||'profile',
    false
  );

  if(view==='messages'){
    renderMessages();
  }

  if(view==='activity'){
    renderActivity(false);
  }

  if(view==='search'){
    renderProgress();
  }

  if(view==='alt'){
    renderAlt();
  }

  if(view==='newsProfile'){
    renderNewsProfile();
  }

  if(view==='viewer'){
    renderViewerTab();
  }
});
initProfile();
renderFollowStates();
renderNews();
unlock(NEWS_POST.id);
renderNewsProfile();
renderFeed();
renderViewerTab();
renderProgress();
updateUnread();
updateActivityBadge();
renderMessages();
checkCompletion();
checkDailyAndGameNotices(true);
refreshTimeline();
setInterval(refreshTimeline,30000);
