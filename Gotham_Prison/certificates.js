const MICHAEL_CERTIFICATE_CODE='BLKG-519-VASQZ';
const CERTIFICATE_STORAGE_KEY='gotham.medical.michael-certificate.v1';
const deathCertificates={
  'BLKG-519-VASQZ':{
    hospital:'黑門監獄附設醫院',name:'麥可．華斯基',sex:'男',age:'28 歲',birth:'1990 年 01 月 27 日',
    death:'2018 年 03 月 05 日',location:'黑門監獄，經緊急處置後送至 黑門監獄附設醫院',
    cause:'急性食物過敏反應引發過敏性休克。',
    statement:'茲證明上列病患於黑門監獄內發生急性食物過敏，經發現時已無生命跡象，緊急送往本院搶救後宣告不治身亡。死亡原因如上所載。',
    institution:'黑門監獄附設醫院',doctor:'阿黛爾．史特蘭奇',issued:'2018 年 03 月 05 日',
    note:'死因初查無異常。'
  },
  'ARKH-593-KROLL':{
    hospital:'阿卡漢療養院',name:'亞曼德．克羅爾',sex:'男',age:'53 歲',birth:'1964年11月8日',
    death:'2018 年 03 月 13 日',location:'阿卡漢療養院',cause:'阿卡漢爆炸。',
    statement:'茲證明上列病患已於上述日期死亡，死亡原因如上所載。',
    institution:'阿卡漢療養院',doctor:'阿黛爾．史特蘭奇',issued:'2018 年 03 月 13 日',
    note:'死因初查無異常。'
  }
};

function readDeathCertificate(code){
  const original=deathCertificates[code];
  if(code!==MICHAEL_CERTIFICATE_CODE) return {...original};
  const saved=localStorage.getItem(CERTIFICATE_STORAGE_KEY);
  if(!saved) return {...original};
  const data=JSON.parse(saved);
  // Older full-document edits no longer apply: only the note can be overridden.
  if(data.version===1) return {...original};
  if(data.version!==2 || typeof data.note!=='string' || !data.note.trim() || data.note.length>10000 ||
     typeof data.updatedAt!=='string' || !Number.isFinite(Date.parse(data.updatedAt))) throw new Error('Invalid saved note');
  return {...original,note:data.note,updatedAt:data.updatedAt};
}

function certificateEditTime(value){
  return new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date(value));
}

function showDeathCertificate(code,notice=''){
  if(!sessionActive || !deathCertificates[code]) return;
  let r;
  try{r=readDeathCertificate(code);}catch{
    r={...deathCertificates[code]};
    notice='無法讀取本機儲存的修改，目前顯示原始檔案。';
  }
  const e=escapeMedical;
  const editable=currentAccount==='a.strange' && code===MICHAEL_CERTIFICATE_CODE;
  openModal(`<div class="document-bg"><div class="document certificate-document" data-certificate-code="${code}">
    <nav class="medical-toolbar"><button type="button" id="certificateSearch">返回醫療查詢</button></nav>
    <p class="certificate-status" role="status">${e(notice)}</p>
    <header class="doc-header"><h2>${e(r.hospital)}<br>死亡證明書</h2>
      <div class="meta-box medical-metadata">
        <div class="medical-identity-row"><div class="medical-identity-0">姓名：${e(r.name)}</div><div class="medical-identity-1">檔案編號：${code}</div><div class="medical-identity-2">性別：${e(r.sex)}</div></div>
        <p>年齡：${e(r.age)}</p><p>出生日期：${e(r.birth)}</p>
      </div>
    </header>
    <h3>死亡資料</h3><p>死亡地點：${e(r.location)}</p><p>死亡日期：${e(r.death)}</p>
    <h3>死亡原因</h3><p>${e(r.cause)}</p>
    <h3>證明事項</h3><p>${e(r.statement)}</p>
    <p>醫療院所名稱：${e(r.institution)}</p><p>主治醫師：${e(r.doctor)}</p><p>核發日期：${e(r.issued)}</p>
    <section class="certificate-note" id="certificateNote">
      <div class="certificate-note-heading"><h3>醫師備註</h3>${editable?'<button type="button" id="editCertificate">編輯</button>':''}</div>
      <p class="certificate-note-text">${e(r.note)}</p>
      ${r.updatedAt?`<p class="certificate-edit-time">最新編輯日期：<time datetime="${e(r.updatedAt)}">${e(certificateEditTime(r.updatedAt))}</time>（高譚時間）</p>`:''}
    </section>
  </div></div>`);
  document.getElementById('certificateSearch').onclick=()=>querySystemGate('medical');
  if(editable) document.getElementById('editCertificate').onclick=()=>editDeathCertificate(code);
}

function editDeathCertificate(code){
  if(!sessionActive || currentAccount!=='a.strange' || code!==MICHAEL_CERTIFICATE_CODE) return;
  let record;
  try{record=readDeathCertificate(code);}catch{showDeathCertificate(code,'本機資料無法讀取，請先以清除快捷鍵恢復原版。');return;}
  const e=escapeMedical;
  const section=document.getElementById('certificateNote');
  if(!section || document.querySelector('.certificate-document')?.dataset.certificateCode!==code) return;
  const scroll=modalBody.scrollTop;
  const finish=notice=>{showDeathCertificate(code,notice);modalBody.scrollTop=scroll;};
  section.innerHTML=`<form class="certificate-editor" id="certificateEditor">
    <label for="cert-note">醫師備註</label><textarea id="cert-note" name="note" rows="4" maxlength="10000" required>${e(record.note)}</textarea>
    <p class="certificate-status" id="certificateSaveStatus" role="status"></p>
    <div class="medical-toolbar"><button type="submit">儲存修改</button><button type="button" id="cancelCertificateEdit">取消</button></div>
  </form>`;
  const form=document.getElementById('certificateEditor');
  document.getElementById('cancelCertificateEdit').onclick=()=>finish('');
  form.onsubmit=event=>{
    event.preventDefault();
    if(!sessionActive || currentAccount!=='a.strange') return;
    const note=form.elements.namedItem('note').value.trim();
    if(!note || note.length>10000){
      document.getElementById('certificateSaveStatus').textContent='請填寫醫師備註，不能只輸入空白。';return;
    }
    try{
      localStorage.setItem(CERTIFICATE_STORAGE_KEY,JSON.stringify({version:2,note,updatedAt:new Date().toISOString()}));
    }catch{document.getElementById('certificateSaveStatus').textContent='儲存失敗，請確認瀏覽器允許本機儲存；修改仍保留在編輯欄位中。';return;}
    finish('醫師備註已儲存。');
  };
  document.getElementById('cert-note').focus({preventScroll:true});
}

// Clear only this application's saved certificate, never unrelated site data.
document.addEventListener('keydown',event=>{
  if(!(event.ctrlKey && event.altKey && event.shiftKey && !event.metaKey && event.code==='KeyD') || event.repeat) return;
  if(sessionActive && currentAccount!=='a.strange') return;
  event.preventDefault();
  if(!confirm('清除麥可死亡證明的本機修改，並恢復原始內容？')) return;
  try{localStorage.removeItem(CERTIFICATE_STORAGE_KEY);}catch{alert('清除失敗，瀏覽器目前不允許存取本機儲存。');return;}
  if(sessionActive && (document.getElementById('certificateEditor') || document.querySelector(`[data-certificate-code="${MICHAEL_CERTIFICATE_CODE}"]`))){
    showDeathCertificate(MICHAEL_CERTIFICATE_CODE,'已清除本機修改，恢復原始內容。');
  }else alert('已清除麥可死亡證明的本機修改，恢復原始內容。');
});
