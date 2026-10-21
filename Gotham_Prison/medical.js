/* Medical records use a separate lookup and never enter the prison file map. */
const medicalAliases = {
  'ARKH-318-NYGMA':['愛德華尼格瑪','尼格瑪','謎語人'],
  'ARKH-426-ISLEY':['帕蜜拉艾斯利','潘蜜拉艾斯利','帕蜜拉','潘蜜拉','艾斯利','毒藤女'],
  'ARKH-592-MORRO':['亞瑟莫羅','莫羅'],
  'ELSF-206-CBPLT':['葛芮楚柯波特','葛芮楚'],
  'ARKH-185-THMPS':['賈斯廷湯普森','賈斯廷','湯普森'],
  'ARKH-249-BURKS':['諾蘭布魯克斯','諾蘭','布魯克斯'],
  'ARKH-302-JACBS':['桑德爾雅各斯','桑德爾','雅各斯'],
  'ARKH-417-HYUIC':['賽繆爾馬什','賽謬爾馬什','賽繆爾','賽謬爾','馬什'],
  'ARKH-273-JCWTB':['傑克懷特','傑克','懷特','小丑'],
  'ARKH-379-HLNQN':['哈琳昆澤','哈莉奎茵','哈琳','昆澤','哈莉','奎茵'],
  'ELSF-508-ELICT':['艾琳卡特','艾琳'],
  'ARKH-405-APOSM':['史密斯']
};
const medicalAliasLookup = new Map(Object.entries(medicalAliases).flatMap(([code,names])=>names.map(name=>[name,code])));
const medicalNamePattern = new RegExp([...medicalAliasLookup.keys()].sort((a,b)=>b.length-a.length)
  .map(name=>[...name].join('[．‧·・.\\s]*')).join('|'),'g');
let medicalHistory=[];
let unlockedMedicalRecords=null;

function escapeMedical(text){
  return text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function medicalRuns(runs){
  return runs.map(run=>{
    if(run.locked) return `<button type="button" class="medical-redaction ${run.long?'long':''}" style="--redaction-width:${run.width}ch" data-sealed="${escapeMedical(JSON.stringify(run.locked))}" aria-label="解鎖黑底文字">點擊解鎖</button>`;
    const text=escapeMedical(run.text).replace(/█+/g,'<span class="source-omission" title="原始文件未提供此處文字">$&</span>');
    const formatted=run.bold?`<strong>${text}</strong>`:text;
    return run.black?`<mark class="medical-revealed">${formatted}</mark>`:formatted;
  }).join('');
}

function medicalMetadata(blocks){
  if(!blocks.length) return '';
  const first=blocks[0];
  const text=first.runs.map(run=>run.text || '').join('');
  const fields=text.match(/^((?:登錄|病患)?姓名[：:].*?)\s+(病歷(?:識別碼|編號|號)[：:]\s*[A-Z]{4}-\d{3}-[A-Z]{5})(?:\s+(性別[：:].*?))?\s*$/u);
  if(!fields || first.runs.some(run=>run.locked)) return medicalBlocks(blocks);
  const cells=fields.slice(1).map((field,index)=>{
    if(!field) return '';
    const start=text.indexOf(field), end=start+field.length;
    let offset=0;
    const runs=first.runs.flatMap(run=>{
      const from=Math.max(start-offset,0), to=Math.min(end-offset,run.text.length);
      offset+=run.text.length;
      return to>from?[{...run,text:run.text.slice(from,to)}]:[];
    });
    return `<div class="medical-identity-field medical-identity-${index}">${medicalRuns(runs)}</div>`;
  }).join('');
  return `<div class="medical-identity-row">${cells}</div>${medicalBlocks(blocks.slice(1))}`;
}

function medicalBlocks(blocks){
  let concealed=false;
  return blocks.map(block=>{
    if(block.runs.every(run=>run.locked)){
      if(concealed) return '';
      concealed=true;
      return '<button type="button" class="medical-redaction long" data-unlock-all aria-label="輸入密碼解鎖全部病歷" title="點擊輸入密碼"></button>';
    }
    concealed=false;
    const tag=block.kind==='heading'?'h3':block.kind==='subheading'?'h4':'p';
    return `<${tag}>${medicalRuns(block.runs)}</${tag}>`;
  }).join('');
}

// Rebuild links in document order after unlocking, so each other person has only
// one link, even if their earliest mention was originally concealed.
function linkMedicalNames(article, currentCode){
  article.querySelectorAll('a[data-medical-code]').forEach(a=>a.replaceWith(document.createTextNode(a.textContent)));
  article.normalize();
  const seen=new Set([currentCode]);
  const walker=document.createTreeWalker(article,NodeFilter.SHOW_TEXT,{acceptNode:node=>
    node.parentElement.closest('button, .medical-record-heading h2, .medical-lock, .source-omission')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  const nodes=[];
  while(walker.nextNode()) nodes.push(walker.currentNode);
  for(const node of nodes){
    const fragment=document.createDocumentFragment();
    let offset=0;
    for(const match of node.textContent.matchAll(medicalNamePattern)){
      const code=medicalAliasLookup.get(match[0].replace(/[．‧·・.\s]/g,''));
      if(seen.has(code)) continue;
      seen.add(code);
      fragment.append(document.createTextNode(node.textContent.slice(offset,match.index)));
      const link=document.createElement('a');
      link.href=`#medical-${code}`;
      link.dataset.medicalCode=code;
      link.textContent=match[0];
      link.title='開啟相關病歷';
      link.addEventListener('click',event=>{event.preventDefault();showMedicalRecord(code,true);});
      fragment.append(link);
      offset=match.index+match[0].length;
    }
    if(offset){fragment.append(document.createTextNode(node.textContent.slice(offset)));node.replaceWith(fragment);}
  }
}

function showMedicalRecord(code, followLink=false, refresh=false){
  if(!sessionActive || !medicalRecords[code]) return;
  if(!refresh){
    if(!followLink) medicalHistory=[];
    medicalHistory.push(code);
  }
  const record=medicalRecords[code];
  const vip=currentAccount==='vip-guest' && !unlockedMedicalRecords;
  const titles=record.titles || [record.name];
  const contentBlocks=[...(unlockedMedicalRecords?.[code] || record.blocks)];
  // Some originals put their title in the body instead of the Word header.
  for(const title of titles){
    if(contentBlocks[0]?.runs.map(run=>run.text || '').join('').trim()===title) contentBlocks.shift();
  }
  const firstSection=contentBlocks.findIndex(block=>block.kind==='heading');
  const metadataBlocks=contentBlocks.splice(0,firstSection<0?0:firstSection);
  const metadata=vip
    ? `姓名：${escapeMedical(record.name)}<br>病歷編號：${record.code}`
    : medicalMetadata(metadataBlocks);
  openModal(`<div class="document-bg"><div class="document medical-sheet">
    <nav class="medical-toolbar" aria-label="病歷導覽">
      <button type="button" id="medicalSearch">返回醫療查詢</button>
      ${medicalHistory.length>1?'<button type="button" id="medicalBack">上一份病歷</button>':''}
    </nav>
    <article id="medicalArticle">
      <header class="doc-header medical-record-heading">
        <h2>${titles.map(escapeMedical).join('<br>')}</h2><div class="meta-box medical-metadata">${metadata}</div>
      </header>
      <div id="medicalContent">${vip?`<h3>${escapeMedical(record.previewHeading)}</h3>${medicalBlocks([record.preview])}
        <section class="medical-lock"><h3>權限不足</h3><p>訪客僅可閱覽部分病史。其餘病歷已加密。</p>
        <button type="button" id="unlockMedicalRecord" class="medical-redaction long" aria-label="輸入密碼解鎖全部病歷" title="點擊輸入密碼"></button></section>`:medicalBlocks(contentBlocks)}</div>
    </article>
    ${code==='ARKH-592-MORRO'?`<aside class="medical-objective" aria-labelledby="medicalObjectiveTitle">
      <h3 id="medicalObjectiveTitle">【目標】</h3>
      <p><span class="medical-objective-check" aria-hidden="true">✓</span><span>你找到了莫羅的病歷，病歷看起來一切正常，你們可以去找艾森獄警回報狀況了，請記住病例的重點，以防艾森想確認內容。</span></p>
    </aside>`:''}
  </div></div>`);
  document.getElementById('medicalSearch').onclick=()=>querySystemGate('medical');
  const back=document.getElementById('medicalBack');
  if(back) back.onclick=()=>{medicalHistory.pop();const previous=medicalHistory.pop();showMedicalRecord(previous,true);};
  const article=document.getElementById('medicalArticle');
  linkMedicalNames(article,code);
  article.querySelectorAll('[data-sealed], [data-unlock-all], #unlockMedicalRecord').forEach(button=>{
    button.onclick=()=>requestMedicalPassword(button,code,()=>{
      const scroll=modalBody.scrollTop;
      showMedicalRecord(code,false,true);
      modalBody.scrollTop=scroll;
    });
  });
}

async function decryptMedical(payload,password){
  const bytes=base64=>Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(payload.salt),iterations:120000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(payload.iv)},key,bytes(payload.data));
  return JSON.parse(new TextDecoder().decode(plain));
}

function requestMedicalPassword(trigger,code,onUnlock){
  const dialog=document.createElement('dialog');
  dialog.className='medical-password-dialog';
  dialog.setAttribute('aria-labelledby','medicalPasswordTitle');
  dialog.innerHTML=`<form><h2 id="medicalPasswordTitle">醫療檔案解鎖</h2><p>解鎖後，本次登入可查看全部病歷內容。</p>
    <label for="medicalPassword">請輸入密碼（區分大小寫）</label>
    <input id="medicalPassword" type="password" autocomplete="off" autocapitalize="none" spellcheck="false" required>
    <p class="medical-password-error" role="alert"></p>
    <div class="medical-password-actions"><button type="button">取消</button><button type="submit">確認解鎖</button></div></form>`;
  document.body.append(dialog);
  const close=()=>{dialog.close();dialog.remove();if(trigger.isConnected)trigger.focus();};
  dialog.querySelector('button[type="button"]').onclick=close;
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.querySelector('form').onsubmit=async event=>{
    event.preventDefault();
    const input=dialog.querySelector('input');
    const submit=dialog.querySelector('[type="submit"]');
    submit.disabled=true;
    try{
      if(!crypto.subtle) throw new Error('secure-context');
      const password=input.value;
      // Verify once, then decrypt all records into this login's memory only.
      const current=await decryptMedical(medicalRecords[code].sealed,password);
      const entries=await Promise.all(Object.entries(medicalRecords).map(async([id,record])=>
        [id,id===code?current:await decryptMedical(record.sealed,password)]));
      if(sessionActive && trigger.isConnected && dialog.isConnected && dialog.open){
        unlockedMedicalRecords=Object.fromEntries(entries);
        onUnlock();
      }
      close();
    }catch(error){
      dialog.querySelector('[role="alert"]').textContent=error.message==='secure-context'?'此瀏覽器無法解鎖，請使用 HTTPS 或以本機開啟網頁。':'密碼錯誤，請重新輸入。';
      input.value='';input.focus();
    }finally{submit.disabled=false;}
  };
  dialog.showModal();
  dialog.querySelector('input').focus();
}
