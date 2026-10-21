
const modal=document.getElementById('modal');
const modalBody=document.getElementById('modalBody');

/* ===== 系統登入帳號 ===== */
const systemAccounts = {
  's.essen': 'essen-HT214',
  'a.strange': 'strange-SP779',
  'vip-guest': 'VIP-Blackgate88'
};

const systemProfiles = {
  's.essen': '獄警 莎拉．艾森',
  'a.strange': '醫生 阿黛爾．史特蘭奇',
  'vip-guest': '訪客 未知'
};

const loginLock = document.getElementById('loginLock');
const loginForm = document.getElementById('loginForm');
const loginAccount = document.getElementById('loginAccount');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const welcomeText = document.getElementById('welcomeText');
const logoutButton = document.getElementById('logoutButton');
const logoutDialog = document.getElementById('logoutDialog');
const confirmLogout = document.getElementById('confirmLogout');
const cancelLogout = document.getElementById('cancelLogout');

/* 登入後閒置五分鐘，顯示二十秒倒數；只有按取消才會延長使用時間。 */
const IDLE_TIMEOUT = 5 * 60 * 1000;
const LOGOUT_COUNTDOWN = 20 * 1000;
const idleLogoutDialog = document.getElementById('idleLogoutDialog');
const idleLogoutSeconds = document.getElementById('idleLogoutSeconds');
const cancelIdleLogout = document.getElementById('cancelIdleLogout');
let sessionActive = false;
let currentAccount = '';
let idleDeadline = 0;
let idleTimer;
let idleWarningVisible = false;
let previousFocus;
let idleBackground = [];

function resetIdleTimer(){
  clearTimeout(idleTimer);
  idleDeadline = Date.now() + IDLE_TIMEOUT;
  idleTimer = setTimeout(checkIdleSession, IDLE_TIMEOUT);
}

function checkIdleSession(){
  if(!sessionActive) return;
  clearTimeout(idleTimer);
  const now = Date.now();
  if(now < idleDeadline){
    idleTimer = setTimeout(checkIdleSession, idleDeadline - now);
    return;
  }
  const remaining = idleDeadline + LOGOUT_COUNTDOWN - now;
  // 用實際時間判斷，避免切換分頁或手機休眠讓倒數重新開始。
  if(remaining <= 0){
    sessionActive = false;
    window.location.reload();
    return;
  }
  idleLogoutSeconds.textContent = ['零','一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十'][Math.ceil(remaining / 1000)];
  if(!idleWarningVisible){
    document.querySelectorAll('.medical-password-dialog').forEach(dialog=>{dialog.close();dialog.remove();});
    idleWarningVisible = true;
    previousFocus = document.activeElement;
    idleBackground = [...document.querySelectorAll('.desktop, #modal, #logoutDialog')]
      .map(element => ({element, inert:element.inert}));
    idleBackground.forEach(({element}) => { element.inert = true; });
    idleLogoutDialog.classList.add('active');
    idleLogoutDialog.setAttribute('aria-hidden','false');
    cancelIdleLogout.focus({preventScroll:true});
  }
  idleTimer = setTimeout(checkIdleSession, Math.min(1000, remaining));
}

function recordSessionActivity(){
  if(!sessionActive) return;
  if(Date.now() >= idleDeadline) checkIdleSession();
  if(sessionActive && !idleWarningVisible) resetIdleTimer();
}

// capture 可收到文件彈窗內的捲動；觸控滑動與鍵盤輸入也算使用中。
['pointerdown','click','touchmove','wheel','scroll','keydown','input'].forEach(type => {
  document.addEventListener(type, recordSessionActivity, {capture:true, passive:true});
});
document.addEventListener('visibilitychange', checkIdleSession);
window.addEventListener('pageshow', checkIdleSession);

cancelIdleLogout.addEventListener('click', () => {
  if(!sessionActive || !idleWarningVisible) return;
  if(Date.now() >= idleDeadline + LOGOUT_COUNTDOWN){
    checkIdleSession();
    return;
  }
  idleWarningVisible = false;
  idleLogoutDialog.classList.remove('active');
  idleLogoutDialog.setAttribute('aria-hidden','true');
  idleBackground.forEach(({element, inert}) => { element.inert = inert; });
  resetIdleTimer();
  if(previousFocus?.isConnected) previousFocus.focus({preventScroll:true});
});
cancelIdleLogout.addEventListener('keydown', event => {
  if(event.key === 'Tab') event.preventDefault();
});

function enterSystem(account){
  if(sessionActive) return;
  loginError.textContent = '';
  welcomeText.textContent = `歡迎你，${systemProfiles[account]}`;
  loginLock.classList.add('unlocked');
  sessionActive = true;
  currentAccount = account;
  resetIdleTimer();
  setTimeout(() => loginLock.remove(), 500);
}

// 主持人快捷登入；只在登入畫面生效，不變更既有登入者或病歷解鎖狀態。
document.addEventListener('keydown', event => {
  if(event.ctrlKey && event.altKey && !event.shiftKey && !event.metaKey &&
     event.code === 'KeyL' && !event.repeat && !sessionActive && loginLock.isConnected){
    event.preventDefault();
    enterSystem('a.strange');
  }
});

loginForm.addEventListener('submit', event => {
  event.preventDefault();

  const account = loginAccount.value.trim().toLowerCase();
  const password = loginPassword.value;

  if(systemAccounts[account] === password){
    enterSystem(account);
    return;
  }

  loginError.textContent = '帳號或密碼錯誤，請重新輸入。';
  loginPassword.value = '';
  loginPassword.focus();
});

logoutButton.addEventListener('click', () => {
  logoutDialog.classList.add('active');
  logoutDialog.setAttribute('aria-hidden','false');
});

cancelLogout.addEventListener('click', () => {
  logoutDialog.classList.remove('active');
  logoutDialog.setAttribute('aria-hidden','true');
});

confirmLogout.addEventListener('click', () => {
  window.location.reload();
});

logoutDialog.addEventListener('click', event => {
  if(event.target === logoutDialog){
    cancelLogout.click();
  }
});

function openModal(html){
  modalBody.innerHTML = `
    <button type="button" class="close-btn" aria-label="關閉視窗" onclick="closeModal()">✕</button>
    ${html}
  `;
  modalBody.scrollTop = 0;
  modal.classList.add('active');
}
function closeModal(){
  modal.classList.remove('active');
  modalBody.innerHTML='';
}

/* ===== 文件 ===== */

const fileMap={
"GHMA-114-DRAFT":"doc114",
"GHMA-833-STASH":"doc833",
"ARKH-320-PUNIS":"doc320"
};

const documents={

doc320:`
<div class="document-bg"><div class="document disciplinary-document">
<div class="doc-header">
<h2>哥譚市公務人員懲處處分通知單</h2>
<div class="meta-box">
發文字號： 監警 甲字第ARKH-320-PUNIS號<br>
發文日期： 2018 年 3 月 20 日<br>
密等及解密條件或保密期限： 普通<br>
附件： 懲處事證與調查紀錄表乙份
</div></div>
<h3>【主旨】</h3>
<p>受處分人等 5 名因重大執行勤務過失，嚴重違反公務員服務法及矯正機關勤務規範，依法予以廢止受聘（僱）僱用／免職處分，自送達之次日起生效。</p>
<h3>【事實與理由】</h3>
<h4>一、 違失事實</h4>
<p>受處分人編號 0181B、0182B、0183B、0184B、0185B，於執行戒護與監控勤務期間，未恪遵公務員應盡之善良管理者注意義務，致生重大職業過失，造成機關秩序與戒護安全之嚴重危害，事實明確。</p>
<h4>二、 認定依據與法令</h4>
<p>依據《公務員服務法》第 8 條及第 11 條規定，公務員應執行職務勤加盡責，不得有懈怠職務之行為。</p>
<p>本案業經考績委員會（考評會）於 2016 年 3 月 15 日召開第 12 次會議審議，經出席委員過半數決議，認定過失情節重大，合於革職/免職要件。</p>
<h3>【處分內容】</h3>
<p>處分種類： 革職（廢止僱用 / 免職）</p>
<p>生效日期： 本處分書送達受處分人之次日起生效。受處分人應於生效日起 3 日內完成移交手續並辦理離職。</p>
<div class="disciplinary-dialogue">
<p><strong>S.Essen</strong> ：請求撤回處分通知。</p>
<p><strong>Superior-12</strong>：請求駁回，你也清楚我們需要拿出誠意</p>
<p><strong>S.Essen</strong> ：沒有轉圜的餘地嗎？移交病患已經讓大家焦頭爛額，現在正需要人手，不能就這麼把整個部門都裁了吧？</p>
<p><strong>Superior-12</strong>：那你就挑幾個人出來。我下午要看到名單。</p>
</div>
<p class="disciplinary-archive-notice"><mark class="medical-revealed">===［對話已被　Superior-12　封存，無法再留言。］===</mark></p>
<aside class="medical-objective" aria-labelledby="disciplinaryObjectiveTitle">
<h3 id="disciplinaryObjectiveTitle">【目標】</h3>
<p><span class="medical-objective-check" aria-hidden="true">✓</span><span>你在檔案室裡看到了艾森與上級的對話，你決定去找艾森問清楚。</span></p>
</aside>
</div></div>`,

doc114:`
<div class="document-bg"><div class="document">
<div class="doc-header">
<h2>--------------</h2>
<div class="meta-box">
法案名稱：-------<br>
提案單位：-------<br>
提案人：-------<br>
檔案編號：-------
</div></div>

你以為這是第一屆嗎？
這甚至是七年後的法案耶`,

doc833:`
<div class="document-bg"><div class="document">
<div class="doc-header">
<h2>--------------</h2>
<div class="meta-box">
保密等級：-------<br>
保存期限：-------<br>
流通限制：-------<br>
會議時間：-------<br>
會議地點：-------<br>
與會人員：-------<br>
檔案編號：-------
</div></div>

你以為這是第一屆嗎？
這甚至是七年後的會議耶
`
};

/* ===== 黑框轉換：只處理 ＂...＂；每段各自一條海苔；點一下整段解鎖 ===== */
function renderDocument(html){

  html = html.replace(/＂([\s\S]*?)＂/g, (m, content) => {
    const normalized = normalizeSpoilerContent(content);
    return `<span class="redacted-group">${normalized}</span>`;
  });

  openModal(html);

  document.querySelectorAll('.redacted-group').forEach(group=>{
    group.onclick = (e)=>{ e.stopPropagation(); startAuth(group); };
  });
}

/* 將內容中的 <p> 與 <br><br> 視為「段落分隔」；
   每個段落各自包一個 .redacted-spoiler，分隔用 <br><br> 放在 span 外面
   => 段落間不會出現小黑塊 */
function normalizeSpoilerContent(raw){
  const tpl = document.createElement('template');
  tpl.innerHTML = raw;

  // 1) <p> 攤平：內容 + "\n\n"
  const ps = [...tpl.content.querySelectorAll('p')];
  ps.forEach(p=>{
    const frag = document.createDocumentFragment();
    while(p.firstChild) frag.appendChild(p.firstChild);
    frag.appendChild(document.createTextNode('\n\n'));
    p.replaceWith(frag);
  });

  // 2) <br> 轉成換行字元
  let htmlStr = tpl.innerHTML
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n');

  // 3) 壓縮多餘空白：3 個以上換行 => 2 個換行
  htmlStr = htmlStr.replace(/\n{3,}/g, '\n\n').trim();

  // 4) 以空行分段（段落切割）
  let parts = htmlStr
    .split(/\n\s*\n/g)
    .map(s => s.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    parts = [ (parts[0] + '\n' + parts[1]).trim(), ...parts.slice(2) ];
  }

  // 5) 每段包成一條海苔；段內單換行 => <br>；段與段之間 => <br><br>
  return parts
    .map(part => `<span class="redacted-spoiler">${part.replace(/\n+/g, '<br>')}</span>`)
    .join('<br><br>');
}
/* ===== 權限流程 ===== */
function startAuth(group){

  if(group.classList.contains('revealed')) return;

  const auth=document.createElement('div');
  auth.className="auth-box";
  document.body.appendChild(auth);

  let dots=0;
  const dotInterval=setInterval(()=>{
    dots=(dots+1)%4;
    auth.innerHTML="確認權限中"+ ".".repeat(dots);
  },500);

  setTimeout(()=>{
    auth.innerHTML="確認完成<br>權限已解鎖...";
    clearInterval(dotInterval);
  },3000);

  setTimeout(()=>{
    auth.remove();
    group.classList.add('revealed');
  },5000);
}
/* ===== 密碼輸入 ===== */
function querySystemGate(system = 'prison'){
  if(!sessionActive) return;

  openModal(`
  <div class="query-panel">
  <h2>${system === 'medical' ? '高譚醫療系統' : '高譚監獄綜合系統'}</h2>
  <p>${system === 'medical' ? '已整合高譚各醫療體系系統' : '本監獄系統已整合高譚各監獄系統'}</p>
  <p id="fileCodeLabel">請輸入檔案編號</p>
  <div class="file-code" role="group" aria-labelledby="fileCodeLabel">
  <div class="code-group">${Array.from({length:4}, (_, i) => `<input class="pwd start" maxlength="1" aria-label="第一組第 ${i + 1} 個英文字母" inputmode="text" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false">`).join('')}</div>
  <span class="code-separator" aria-hidden="true">-</span>
  <div class="code-group">${Array.from({length:3}, (_, i) => `<input class="pwd mid" maxlength="1" aria-label="第二組第 ${i + 1} 個數字" inputmode="numeric" autocomplete="off">`).join('')}</div>
  <span class="code-separator" aria-hidden="true">-</span>
  <div class="code-group">${Array.from({length:5}, (_, i) => `<input class="pwd end" maxlength="1" aria-label="第三組第 ${i + 1} 個英文字母" inputmode="text" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false">`).join('')}</div>
  </div>
  <button id="pwdConfirm">確定</button>
  </div>
  `);

  const inputs=[...document.querySelectorAll('.pwd')];

  function submitPassword(){
    const starts=[...document.querySelectorAll('.start')].map(i=>i.value).join('');
    const mids=[...document.querySelectorAll('.mid')].map(i=>i.value).join('');
    const ends=[...document.querySelectorAll('.end')].map(i=>i.value).join('');
    const val=`${starts}-${mids}-${ends}`;

    if(system === 'medical'){
      if(deathCertificates[val]) showDeathCertificate(val);
      else if(medicalRecords[val]) showMedicalRecord(val);
      else alert("查無此病歷");
    }else if(fileMap[val]){
      renderDocument(documents[fileMap[val]]);
    }else{
      alert("查無此檔案");
    }
  }

  inputs.forEach((input,idx)=>{
    input.addEventListener('paste', e=>{
      const pasted=e.clipboardData.getData('text').trim().toUpperCase().replace(/[-\s]/g,'');
      if(!/^[A-Z]{4}\d{3}[A-Z]{5}$/.test(pasted)) return;
      e.preventDefault();
      inputs.forEach((field,i)=>{field.value=pasted[i];});
      inputs[inputs.length-1].focus();
    });

    input.addEventListener('input', ()=>{
      if(input.classList.contains('mid')){
        input.value = input.value.replace(/\D/g,'');
      } else {
        input.value = input.value.toUpperCase().replace(/[^A-Z]/g,'');
      }
      if(input.value && inputs[idx+1]) inputs[idx+1].focus();
    });

    input.addEventListener('keydown', e=>{
      if(e.key==='Enter'){
        submitPassword();
      }

      if(e.key==='Backspace'){
        if(input.value === '' && idx>0){
          inputs[idx-1].focus();
          inputs[idx-1].value = '';
        }
      }

      if(e.key==='ArrowLeft' && idx>0){
        inputs[idx-1].focus();
      }

      if(e.key==='ArrowRight' && idx<inputs.length-1){
        inputs[idx+1].focus();
      }
    });

  });

  document.getElementById('pwdConfirm').onclick = submitPassword;

}
  modal.addEventListener('click', e=>{
  if(e.target === modal){
    closeModal();
  }
});
/* 禁止右鍵選單 */
document.addEventListener('contextmenu', event => {
  event.preventDefault();
});

/* 禁止拖曳圖片或其他元素 */
document.addEventListener('dragstart', event => {
  event.preventDefault();
});

/* 禁止反白與複製 */
document.addEventListener('selectstart', event => {
  if(event.target.closest?.('.certificate-editor')) return;
  event.preventDefault();
});

document.addEventListener('copy', event => {
  if(event.target.closest?.('.certificate-editor')) return;
  event.preventDefault();
});

/* 阻擋常見的查看原始碼、儲存和開發工具快捷鍵 */
document.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();

  const blocked =
    event.key === 'F12' ||
    (event.ctrlKey && key === 'u') ||                    // 查看原始碼
    (event.ctrlKey && key === 's') ||                    // 儲存網頁
    (event.ctrlKey && key === 'p') ||                    // 列印
    (event.ctrlKey && event.shiftKey && key === 'i') || // 開發者工具
    (event.ctrlKey && event.shiftKey && key === 'j') || // 控制台
    (event.ctrlKey && event.shiftKey && key === 'c');   // 元素檢查

  if (blocked) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});
