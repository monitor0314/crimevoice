(() => {
  'use strict';
  const KEY = 'guard_duty_16_v3';
  const MESSAGE_DELAY = 1450;
  const people = {
    captain: { name: '組長', avatar: 'assets/captain.webp' },
    Joseph: { name: '約瑟夫', avatar: 'assets/Joseph.webp' },
    Anne: { name: '安妮', avatar: 'assets/Anne.webp' },
    Thor: { name: '托爾', avatar: 'assets/Thor.webp' },
    James: { name: '詹姆斯', avatar: 'assets/James.webp' },
    David: { name: '大衛', avatar: 'assets/David.webp' },
    me: { name: '你', avatar: 'assets/me.webp' }
  };
  const privateIntro = [
    ['captain', '是艾森獄警請你來的嗎？'],
    ['me', '是的。'],
    ['captain', '那好，我把你加進群組。']
  ];
  const intro = [
    ['captain', '新來的，3月13號晚上，黑門監獄出了點狀況，當天的值班位置表不見了。'],
    ['captain', '我把當天負責值班的五名獄警都找來了，他們接下來會一個一個跟你們說證詞。'],
    ['captain', '我們已經可以確定，當天只有一人負責移交區，而且只有他在說謊，其餘四人說的都是真話。'],
    ['Joseph', '13號既不是安妮負責移交區，也不是大衛負責移交區。'],
    ['Anne', '約瑟夫和托爾說的話，要嘛都是真的，要嘛都是假的。'],
    ['Thor', '13號負責移交區的人，是詹姆斯或伊森其中一個。'],
    ['James', '那天是約瑟夫或托爾負責移交區。'],
    ['David', '安妮和詹姆斯之中，只有一個人說真話。'],
    ['captain', '請幫我查出，誰負責13號的移交區？']
  ];
  const $ = id => document.getElementById(id);
  const messages = $('messages'), input = $('answerInput');
  let timer;
  const fresh = () => ({ version: 3, privateRevealed: 0, joined: false, revealed: 0, extra: [], finished: false, askedDays: [], datePhase: false, replyPending: false, pendingReplies: [], finishAfterReplies: false, choicesAfterReplies: false });
  function load() {
    try {
      const x = JSON.parse(localStorage.getItem(KEY));
      if (x && x.version === 3 && Number.isInteger(x.privateRevealed) && x.privateRevealed >= 0 && x.privateRevealed <= privateIntro.length && typeof x.joined === 'boolean' && Number.isInteger(x.revealed) && x.revealed >= 0 && x.revealed <= intro.length && Array.isArray(x.extra) && x.extra.every(m => people[m.who] && typeof m.text === 'string' && typeof m.time === 'string') && typeof x.finished === 'boolean' && Array.isArray(x.askedDays) && typeof x.datePhase === 'boolean' && typeof x.replyPending === 'boolean' && Array.isArray(x.pendingReplies) && typeof x.finishAfterReplies === 'boolean' && typeof x.choicesAfterReplies === 'boolean') return x;
    } catch (_) {}
    return fresh();
  }
  let state = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }
  function now() { return new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }); }
  function bottom() { requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; }); }
  function addMessage(who, text, time = '22:14') {
    const row = document.createElement('div'); row.className = 'message' + (who === 'me' ? ' me' : '');
    const avatar = document.createElement('img'); avatar.className = 'avatar'; avatar.src = people[who].avatar; avatar.alt = people[who].name + '的頭貼';
    const body = document.createElement('div'); body.className = 'msg-body';
    const name = document.createElement('div'); name.className = 'sender'; name.textContent = people[who].name;
    const bubble = document.createElement('div'); bubble.className = 'bubble'; bubble.textContent = text;
    const stamp = document.createElement('div'); stamp.className = 'stamp'; stamp.textContent = (who === 'me' ? '已讀　' : '') + time;
    body.append(name, bubble, stamp); row.append(avatar, body); messages.append(row);
  }
  function addPhoto(src, time) {
    const row = document.createElement('div'); row.className = 'message';
    const avatar = document.createElement('img'); avatar.className = 'avatar'; avatar.src = people.James.avatar; avatar.alt = '詹姆斯的頭貼';
    const body = document.createElement('div'); body.className = 'msg-body';
    const name = document.createElement('div'); name.className = 'sender'; name.textContent = people.James.name;
    const photo = document.createElement('img'); photo.className = 'chat-photo'; photo.src = src; photo.alt = '10號當天監視器畫面';
    const stamp = document.createElement('div'); stamp.className = 'stamp'; stamp.textContent = time;
    body.append(name, photo, stamp); row.append(avatar, body); messages.append(row);
  }
  function extra(who, text, image = null) { const m = { who, text, time: now(), ...(image ? { image } : {}) }; state.extra.push(m); if (image) addPhoto(image, m.time); else addMessage(who, text, m.time); }
  function showDateChoices() {
    if (!state.joined || !state.datePhase || state.finished || state.replyPending || state.revealed < intro.length) return;
    messages.querySelectorAll('.date-choices').forEach(el => el.remove());
    const wrap = document.createElement('div'); wrap.className = 'date-choices'; wrap.setAttribute('aria-label', '詢問詹姆斯值班日期');
    [9, 10, 11, 12].filter(day => !state.askedDays.includes(day)).forEach(day => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = `2/${day}那天也是你負責這個位置嗎？`;
      button.addEventListener('click', () => askDate(day)); wrap.append(button);
    });
    if (wrap.childElementCount) messages.append(wrap);
  }
  function askDate(day) {
    if (state.finished || state.replyPending || state.askedDays.includes(day)) return;
    state.askedDays.push(day);
    messages.querySelectorAll('.date-choices').forEach(el => el.remove());
    extra('me', `2/${day}那天也是你負責這個位置嗎？`);
    if (day === 10) {
      state.pendingReplies = [
        { who: 'James', text: '是我沒錯' },
        { who: 'James', text: '我記得就是那天將莫羅移至阿卡漢的，這事是艾森長官許可的。\n不過奇怪的是，莫羅這個名字在那天之前並不存在。' },
        { who: 'James', text: '', image: 'assets/NO.jpg' },
        { who: 'James', text: '這是10號那天那個人出現的監視器畫面，其他的我就不知道了。' },
        { who: 'captain', text: '詹姆斯，到辦公室向我說明當晚的情況。' },
		{ who: 'captain', text: '新人，如果你想知道監視器裡的人到底是誰，\n文件區裡有囚犯名籍冊，\n裡面會有囚犯的入監照和身分資料。' },
        { who: 'captain', text: '謝謝你幫我查出值班的人。' }
      ];
    } else {
      state.pendingReplies = [
        { who: 'James', text: '不是' },
        { who: 'captain', text: '詹姆斯，到辦公室向我說明當晚的情況。\n謝謝你幫我查出值班的人。' }
      ];
    }
    state.replyPending = true;
    state.finishAfterReplies = true;
    state.choicesAfterReplies = false;
    save(); sync(); bottom();
    scheduleReply();
  }
  function scheduleReply() {
    if (!state.replyPending || !state.pendingReplies.length) return;
    timer = setTimeout(() => {
      const next = state.pendingReplies.shift();
      extra(next.who, next.text, next.image || null);
      if (state.pendingReplies.length) scheduleReply();
      else if (state.finishAfterReplies) {
        state.replyPending = false; state.finished = true;
        save(); sync(); finishedNote();
      } else {
        state.replyPending = false;
        if (state.choicesAfterReplies) { state.choicesAfterReplies = false; showDateChoices(); }
      }
      save(); sync(); bottom();
    }, MESSAGE_DELAY);
  }
  function sync() {
    input.disabled = !state.joined || state.finished || state.revealed < intro.length || state.datePhase;
    $('sendBtn').disabled = input.disabled || !input.value.trim();
    input.placeholder = state.finished ? '本次調查已結束' : !state.joined ? '加入群組後即可作答' : state.revealed < intro.length ? '請稍候……' : state.datePhase ? '請選擇要詢問的日期' : '輸入值班者的名字';
    $('composer').hidden = !state.joined;
    $('membersBtn').hidden = !state.joined;
    $('chatTitle').textContent = state.joined ? '獄警值班群組' : '組長';
    $('chatCount').textContent = state.joined ? '(7)' : '';
    $('chatCount').hidden = !state.joined;
    $('messages').setAttribute('aria-label', state.joined ? '群組訊息' : '與組長的私訊');
    document.title = state.joined ? '獄警值班群組' : '組長';
  }
  function finishedNote() { const el = document.createElement('div'); el.className = 'finished-note'; el.textContent = '本次調查已結束。'; messages.append(el); }
  function reveal() {
    if (!state.joined) {
      if (state.privateRevealed >= privateIntro.length) return;
      const nearBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight < 100;
      const m = privateIntro[state.privateRevealed++]; addMessage(...m); save(); sync();
      if (nearBottom) bottom();
      if (state.privateRevealed < privateIntro.length) timer = setTimeout(reveal, MESSAGE_DELAY);
      else timer = setTimeout(showJoinCard, MESSAGE_DELAY);
      return;
    }
    if (state.revealed >= intro.length) return;
    const nearBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight < 100;
    const m = intro[state.revealed++]; addMessage(...m); save(); sync();
    if (nearBottom) bottom();
    if (state.revealed < intro.length) timer = setTimeout(reveal, MESSAGE_DELAY);
  }
  function showJoinCard() {
    if (state.joined || state.privateRevealed < privateIntro.length) return;
    messages.querySelectorAll('.join-card').forEach(el => el.remove());
    const card = document.createElement('div'); card.className = 'join-card';
    const title = document.createElement('strong'); title.textContent = '組長邀請你加入群組';
    const button = document.createElement('button'); button.type = 'button'; button.textContent = '加入群組';
    button.addEventListener('click', joinGroup); card.append(title, button); messages.append(card); bottom();
  }
  function joinGroup() {
    if (state.joined || state.privateRevealed < privateIntro.length) return;
    state.joined = true; save(); sync(); render();
  }
  function render() {
    clearTimeout(timer); messages.replaceChildren();
    const day = document.createElement('div'); day.className = 'day'; const label = document.createElement('span'); label.textContent = '今天'; day.append(label); messages.append(day);
    if (!state.joined) {
      privateIntro.slice(0, state.privateRevealed).forEach(m => addMessage(...m));
      if (state.privateRevealed >= privateIntro.length) showJoinCard();
    } else intro.slice(0, state.revealed).forEach(m => addMessage(...m));
    state.extra.forEach(m => m.image ? addPhoto(m.image, m.time) : addMessage(m.who, m.text, m.time));
    if (state.joined && state.datePhase && !state.finished && !state.replyPending) showDateChoices();
    if (state.finished) finishedNote();
    sync(); bottom();
    if (!state.joined && state.privateRevealed < privateIntro.length) timer = setTimeout(reveal, state.privateRevealed ? MESSAGE_DELAY : 100);
    else if (state.joined && state.revealed < intro.length) timer = setTimeout(reveal, state.revealed ? MESSAGE_DELAY : 100);
    else if (state.replyPending) scheduleReply();
  }
  function submit(raw) {
    if (typeof raw !== 'string' || !raw.trim() || raw.length > 50 || !state.joined || state.finished || state.datePhase || state.revealed < intro.length) return { accepted: false };
    raw = raw.trim(); extra('me', raw); input.value = '';
    const cleaned = raw.replace(/[\s，。！？!?,.：:]/g, '');
    const matched = ['Joseph', 'Anne', 'Thor', 'James', 'David'].filter(id => cleaned.includes(people[id].name));
    const named = matched.length === 1 ? matched[0] : null;
    const negated = named && (new RegExp('(?:不是|不會是|不可能是|並非|并非|非|排除|不選|不选)' + people[named].name).test(cleaned) || new RegExp(people[named].name + '(?:不是|沒有|没有|不值班|沒值班|没值班)').test(cleaned));
    const suspect = negated ? null : named;
    if (matched.length > 1) extra('captain', '值班者只有一位，請重新回答一次好嗎?');
    else if (!suspect) extra('captain', '你在說什麼?請重新回答一次好嗎?');
    else if (suspect !== 'James') extra('captain', '這個答案不符合證詞。只有值班的人說謊，其餘四人都說真話，再核對一次。');
    else {
      extra('captain', '確認了，13號是詹姆斯負責移交區。');
      state.datePhase = true;
      state.replyPending = true;
      state.pendingReplies = [{ who: 'captain', text: '你是不是還有問題想問詹姆斯？' }];
      state.finishAfterReplies = false;
      state.choicesAfterReplies = true;
      scheduleReply();
    }
    save(); sync(); bottom(); return { accepted: true, finished: state.finished };
  }
  function resetGame(){
    clearTimeout(timer);
    // Cookies can have different path/domain scopes; expire each accessible scope.
    const paths=new Set(['/']);
    const parts=location.pathname.split('/');
    for(let i=1;i<=parts.length;i++){
      const path=parts.slice(0,i).join('/')||'/';paths.add(path);paths.add(path+'/');
    }
    const domains=[''];
    const labels=location.hostname.split('.');
    for(let i=0;i<labels.length;i++){const domain=labels.slice(i).join('.');domains.push('; Domain='+domain,'; Domain=.'+domain)}
    for(const cookie of document.cookie.split(';')){
      const name=cookie.split('=')[0].trim();if(!name)continue;
      for(const path of paths)for(const domain of domains){
        document.cookie=name+'=; Max-Age=0; Path='+path+domain;
      }
    }
    localStorage.removeItem(KEY);
    history.replaceState({},'',location.pathname+location.search);
    location.reload();
  }
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey&&e.altKey&&!e.shiftKey&&!e.metaKey&&e.code==='KeyD'){
      e.preventDefault();if(!e.repeat)resetGame();
    }
  });
  $('composer').addEventListener('submit', event => { event.preventDefault(); if (!event.isComposing) submit(input.value); });
  input.addEventListener('input', sync);
  input.addEventListener('keydown', event => { if (event.key === 'Enter' && event.isComposing) event.preventDefault(); });
  for (const p of Object.values(people)) {
    const row = document.createElement('div'); row.className = 'member'; const img = document.createElement('img'); img.className = 'avatar'; img.src = p.avatar; img.alt = ''; const name = document.createElement('span'); name.textContent = p.name; row.append(img, name); $('memberList').append(row);
  }
  $('membersBtn').onclick = () => $('membersDialog').showModal();
  $('closeMembers').onclick = () => $('membersDialog').close();
  // 手機鍵盤開啟時保持輸入框位於可見區域。
  function viewport() { document.documentElement.style.setProperty('--app-height', (window.visualViewport?.height || window.innerHeight) + 'px'); }
  window.visualViewport?.addEventListener('resize', viewport); window.addEventListener('resize', viewport); viewport();
  const context = document.modelContext;
  if (context?.registerTool) {
    try { Promise.resolve(context.registerTool({ name: 'submit_duty_answer', description: '在群組回覆一位值班者的姓名。', inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'], additionalProperties: false }, annotations: { readOnlyHint: false }, execute: args => submit(args?.name) })).catch(() => {}); } catch (_) {}
  }
  render();
})();
