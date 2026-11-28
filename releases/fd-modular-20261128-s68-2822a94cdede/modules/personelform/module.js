window.FDModules.define('personelform',function(){
let disposed=false,busy=false,generation=0,activeOperation=0,owned=null,form=null,observer=null,overlay=null;const initial=context();
const nativeDocument=window.document;
let transferSnapshot=null,transferMode=false,hireDraft='';
const document=new Proxy(nativeDocument,{get(target,key){if(key==='getElementById')return id=>{if(owned&&(id===owned.id||owned.querySelector('[id="'+id+'"]')))return id===owned.id?owned:owned.querySelector('[id="'+id+'"]');return target.getElementById(id)};const value=target[key];return typeof value==='function'?value.bind(target):value}});
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function current(){return !disposed&&Boolean(activeUser)&&isManagerUser()&&anaMenuModulYazmaYetkisiVar('personel')&&context()===initial}
function assertCurrent(){if(!current()){const e=Error('Personel formunun oturumu veya yetkisi değişti.');e.fdPersonnelFormStale=true;throw e}}
async function fdFormWait(start){assertCurrent();const operation=activeOperation;let value,error,failed=false;try{value=await start()}catch(reason){failed=true;error=reason}assertCurrent();if(operation!==activeOperation){const e=Error('Personel formu isteği değişti.');e.fdPersonnelFormStale=true;throw e}if(failed)throw error;return value}
function alert(...args){if(current())return window.alert(...args)}
function showGlobalOverlay(...args){assertCurrent();window.showGlobalOverlay(...args);overlay={title:nativeDocument.getElementById('overlayTitle')?.textContent,sub:nativeDocument.getElementById('overlaySub')?.textContent}}
function hideGlobalOverlay(){if(overlay&&current()&&nativeDocument.getElementById('overlayTitle')?.textContent===overlay.title&&nativeDocument.getElementById('overlaySub')?.textContent===overlay.sub)window.hideGlobalOverlay();overlay=null}
function transferToday(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function transferBranches(){return [...new Set(subeler.filter(s=>s.durum!=='Pasif'&&aktifSirketeAit(s)).map(s=>String(s.ad||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'))}
function transferDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===value}
function transferDisplay(value){return transferDate(String(value||''))?value.split('-').reverse().join('.'):String(value||'—')}
// Form-local, read-only preview; only the final form submission can create a settlement.
let exitSettlement=null,exitReadToken=0,exitLoading=false;
function exitNode(id){return document.getElementById(id)}
function resetExitSettlement(){exitReadToken++;exitLoading=false;exitSettlement=null;exitNode('pExitSettlementOpen').hidden=false;exitNode('pExitSettlementEditor').hidden=true;exitNode('pExitSettlementError').textContent='';exitNode('pExitSettlementLoans').replaceChildren();exitNode('pExitSettlementConfirm').checked=false;for(const id of ['pExitKidem','pExitIhbar','pExitDiger'])exitNode(id).value='0.00';exitNode('pExitSettlementNote').value='';exitNode('pExitOldLoans').checked=false;exitNode('pExitSettlementOpen').disabled=false;exitNode('pExitSettlementOpen').textContent='Tazminat ve avans hesabını aç'}
function exitSettlementSummary(entry,host){
 host.replaceChildren();const list=document.createElement('dl');list.className='personnel-exit-totals';
 for(const [label,key] of [['Toplam net alacak','toplamKurus'],['Onaylanan avans borcu','borcKurus'],['Tazminattan düşülen avans','mahsupKurus'],['Personele ödenecek net','netKurus'],['Kalan avans borcu','kalanBorcKurus']]){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=paraFormatla(Number(entry[key]||0)/100);row.append(dt,dd);list.append(row)}host.append(list);
}
function updateExitSettlement(){
 const visible=!transferMode&&Boolean(transferSnapshot)&&Boolean(exitNode('pCikisTarihi').value),date=exitNode('pCikisTarihi').value;exitNode('pExitSettlement').hidden=!visible;
 if(exitSettlement&&exitSettlement.date!==date)resetExitSettlement();
 const history=exitNode('pExitSettlementHistory');history.replaceChildren();
 for(const entry of (transferSnapshot?.cikisHesaplasmalari||[]).slice().reverse()){
  const card=document.createElement('section'),title=document.createElement('h5');title.textContent=transferDisplay(entry.tarih)+' · Kayıtlı hesaplaşma';card.append(title);exitSettlementSummary(entry,card.appendChild(document.createElement('div')));
  for(const a of entry.avanslar||[]){const line=document.createElement('p');line.textContent=(a.avansNo||'Avans')+' · Borç: '+paraFormatla(a.borcKurus/100)+' · Tazminattan mahsup: '+paraFormatla(a.mahsupKurus/100)+' · Kalan: '+paraFormatla(a.kalanKurus/100);card.append(line)}
  if(entry.not){const note=document.createElement('p');note.textContent=entry.not;card.append(note)}history.append(card);
 }
 const saved=(transferSnapshot?.cikisHesaplasmalari||[]).some(h=>h.tarih===date);exitNode('pExitSettlementOpen').disabled=saved;
 exitNode('pExitSettlementOpen').textContent=saved?'Bu çıkışın hesaplaşması kayıtlı':'Tazminat ve avans hesabını aç';
}
function exitOwnLoans(list,id){return list.filter(a=>String(a.pId)===String(id)&&(!a.sirketId||String(a.sirketId)===String(activeUser.sirketId)))}
async function readExitPersonnel(){const r=await supabaseClient.from('portal_records').select('legacy_id,data').eq('company_id',String(activeUser.sirketId)).eq('module','personeller').eq('legacy_id',String(transferSnapshot.id)).maybeSingle();if(r.error)throw r.error;if(!r.data)throw Error('Personel kaydı sunucuda bulunamadı.');return r.data}
async function openExitSettlement(){
 if(!current()||busy||exitSettlement||transferMode||!transferSnapshot)return;
 const date=exitNode('pCikisTarihi').value,token=++exitReadToken,person=JSON.parse(JSON.stringify(transferSnapshot));
 if(!transferDate(date)||date>transferToday())return alert('Hesaplaşma için geçerli, bugünden ileri olmayan bir çıkış tarihi girin.');
 if(!SUPABASE_MODE||!supabaseClient)return alert('Hesaplaşma için sunucu bağlantısı gerekiyor.');
 exitLoading=true;exitNode('pExitSettlementOpen').disabled=true;exitNode('pExitSettlementError').textContent='Güncel avans borçları alınıyor…';
 const valid=()=>current()&&token===exitReadToken&&transferSnapshot?.id===person.id&&!transferMode&&exitNode('pCikisTarihi').value===date;
 try{
  const record=await readExitPersonnel();if(!valid())return;
  if(!avansJsonAyniMi({...record.data,id:String(record.data.id??record.legacy_id)},person))throw Error('Personel kaydı değişmiş. Kartı kapatıp yeniden açın.');
  const rows=[];for(let offset=0;;offset+=100){const r=await supabaseClient.from('portal_records').select('legacy_id,data').eq('company_id',String(activeUser.sirketId)).eq('module','avanslar').eq('data->>pId',String(person.id)).order('legacy_id',{ascending:true}).range(offset,offset+99);if(!valid())return;if(r.error)throw r.error;if(!Array.isArray(r.data))throw Error('Avans listesi doğrulanamadı.');rows.push(...r.data);if(r.data.length<100)break;if(rows.length>10000)throw Error('Avans listesi sınırı aşıldı.');}
  const localLoans=JSON.parse(JSON.stringify(exitOwnLoans(avanslar,person.id))),ack=veriSonKayitGoruntuleri.get('avanslar');if(ack&&!avansJsonAyniMi(localLoans,exitOwnLoans(JSON.parse(ack),person.id)))throw Error('Kaydedilmemiş avans değişiklikleri var. Önce bu değişiklikleri tamamlayıp kartı yeniden açın.');
  const loans=rows.map(r=>({...r.data,id:String(r.legacy_id)}));for(const a of loans)fdAvansCikisBorcu(a,date,[person]);
  exitSettlement={date,expected:record.data,localLoans,rows:rows.map(r=>({id:String(r.legacy_id),data:r.data})),loans,requestId:crypto.randomUUID()};
  exitNode('pExitCarry').value=avansAyEkle(date.slice(0,7),1);exitNode('pExitCarry').min=avansAyEkle(date.slice(0,7),1);renderExitSettlementLoans();exitNode('pExitSettlementEditor').hidden=false;exitNode('pExitSettlementOpen').hidden=true;exitNode('pExitSettlementError').textContent='';previewExitSettlement();
 }catch(e){if(valid()){exitNode('pExitSettlementError').textContent=e.message||String(e);exitNode('pExitSettlementOpen').disabled=false;}}finally{if(valid())exitLoading=false;}
}
function renderExitSettlementLoans(){
 if(!exitSettlement)return;const body=exitNode('pExitSettlementLoans');body.replaceChildren();
 for(const a of exitSettlement.loans){const state=fdAvansCikisBorcu(a,exitSettlement.date,[transferSnapshot]);if(!state.azamiKurus)continue;
  const row=document.createElement('div');row.className='personnel-exit-loan';row.dataset.loan=a.id;row.hidden=!state.onerilenKurus&&!exitNode('pExitOldLoans').checked;
  const title=document.createElement('strong');title.textContent=(a.avansNo||'Avans')+' · '+transferDisplay(a.kayitTarihi);const note=document.createElement('small');note.textContent='Çıkış ayı ve sonrası plan: '+paraFormatla(state.onerilenKurus/100)+' · Maaştan kesilmemiş gerçek borcu kontrol edin.';
  const label=document.createElement('label');label.textContent='Kalan borç (TL)';const input=document.createElement('input');input.type='number';input.min='0';input.step='0.01';input.max=(state.azamiKurus/100).toFixed(2);input.value=(state.onerilenKurus/100).toFixed(2);input.dataset.debt=a.id;input.setAttribute('aria-label',(a.avansNo||'Avans')+' kalan borç');label.append(input);row.append(title,note,label);body.append(row);
 }
 if(!body.children.length){const note=document.createElement('p');note.textContent='Bu personelin hesaplaşmaya alınacak açık avans borcu bulunmuyor.';body.append(note)}
}
function exitCents(input){const s=input.value.trim();if(!/^\d+(?:\.\d{1,2})?$/.test(s))throw Error('Tutarları en fazla iki ondalık basamakla, sıfır veya daha büyük girin.');return fdCikisKurus(Math.round(Number(s)*100))}
function exitSettlementPayload(){
 if(!exitSettlement)return null;if(transferMode||exitNode('pCikisTarihi').value!==exitSettlement.date)throw Error('Hesaplaşma tarihi değişmiş. Hesabı yeniden açın.');
 const choices=[...exitNode('pExitSettlementLoans').querySelectorAll('[data-debt]')].filter(n=>!n.closest('[data-loan]').hidden).map(n=>({id:n.dataset.debt,borcKurus:exitCents(n)}));
 const amounts={kidemKurus:exitCents(exitNode('pExitKidem')),ihbarKurus:exitCents(exitNode('pExitIhbar')),digerKurus:exitCents(exitNode('pExitDiger'))},carry=exitNode('pExitCarry').value;
 return {choices,amounts,carry,result:fdCikisTazminatHesapla(transferSnapshot,exitSettlement.loans,choices,amounts,exitSettlement.date,carry,[transferSnapshot])};
}
function previewExitSettlement(event){
 if(event?.target!==exitNode('pExitSettlementConfirm'))exitNode('pExitSettlementConfirm').checked=false;
 if(event?.target===exitNode('pExitOldLoans'))for(const row of exitNode('pExitSettlementLoans').querySelectorAll('[data-loan]')){const loan=exitSettlement.loans.find(a=>a.id===row.dataset.loan);row.hidden=!exitNode('pExitOldLoans').checked&&!fdAvansCikisBorcu(loan,exitSettlement.date,[transferSnapshot]).onerilenKurus;}
 if(!exitSettlement)return;try{const draft=exitSettlementPayload();exitSettlementSummary(draft.result,exitNode('pExitSettlementPreview'));exitNode('pExitCarryField').hidden=!draft.result.kalanBorcKurus;exitNode('pExitSettlementError').textContent='';}catch(e){exitNode('pExitSettlementPreview').replaceChildren();exitNode('pExitSettlementError').textContent=e.message||String(e)}
}
function exitSettlementBeforeSave(){if(exitLoading)throw Error('Güncel avans listesi yükleniyor. Lütfen bekleyin.');if(!exitSettlement)return null;const draft=exitSettlementPayload();if(!exitNode('pExitSettlementConfirm').checked)throw Error('Avans borçlarını ve net hesaplaşma tutarını kontrol edip onay kutusunu işaretleyin.');if(!avansJsonAyniMi(exitOwnLoans(avanslar,transferSnapshot.id),exitSettlement.localLoans))throw Error('Avans listesi değişti. Kartı kapatıp yeniden açın.');if(!avansJsonAyniMi(personeller.find(p=>String(p.id)===String(transferSnapshot.id)&&aktifSirketeAit(p)),transferSnapshot))throw Error('Personel kaydı değişmiş. Kartı kapatıp yeniden açın.');return {...draft,requestId:exitSettlement.requestId,note:exitNode('pExitSettlementNote').value.trim(),expected:exitSettlement.expected,advances:exitSettlement.rows};}
async function saveExitSettlement(payload,draft){
 const args={p_company_id:String(activeUser.sirketId),p_id:String(payload.id),p_expected:draft.expected,p_data:payload,p_advances:draft.advances,p_choices:draft.choices,p_amounts:draft.amounts,p_carry:draft.carry,p_request_id:draft.requestId,p_note:draft.note};if(exitSettlement.lastAttempt&&!avansJsonAyniMi(exitSettlement.lastAttempt,args))throw Object.assign(Error('Önceki kayıt isteğinin sonucu kesinleşmeden içeriği değiştirilemez. Kartı kapatıp yeniden açın.'),{fdSettlementUncertain:true});exitSettlement.lastAttempt=JSON.parse(JSON.stringify(args));
 let result;try{const r=await supabaseClient.rpc('fd_personnel_exit_settlement_save',args);if(r.error)throw r.error;result=r.data;}catch(e){
  // A lost response may follow a committed transaction. Read back before any retry or photo cleanup.
  try{const r=await readExitPersonnel(),entry=r.data?.cikisHesaplasmalari?.find(h=>h.id===draft.requestId);if(entry)result={legacy_id:r.legacy_id,data:r.data,settlement:entry};else if(e.code)throw e;}catch(readError){if(readError===e)throw e;}
  if(!result){const error=Error((e.message||String(e))+' Sonuç doğrulanamadı; yeniden kaydetmeden önce kartı kapatıp açın.');error.fdSettlementUncertain=true;throw error;}
 }
 if(!result?.data||String(result.legacy_id)!==String(payload.id)||result.settlement?.id!==draft.requestId||!result.data.cikisHesaplasmalari?.some(h=>h.id===draft.requestId)||!['toplamKurus','borcKurus','mahsupKurus','netKurus','kalanBorcKurus'].every(k=>result.settlement[k]===draft.result[k])){const e=Error('Sunucu hesaplaşma yanıtı doğrulanamadı. Tekrar kaydetmeden önce kartı kapatıp açın.');e.fdSettlementUncertain=true;throw e;}
 return result;
}
function applyExitSettlement(result,expected){
 const saved={...result.data,id:String(result.legacy_id)},index=personeller.findIndex(p=>String(p.id)===saved.id&&aktifSirketeAit(p));
 if(index<0||!avansJsonAyniMi(personeller[index],transferSnapshot))throw Object.assign(Error('Hesaplaşma sunucuda kayıtlı; yerel personel listesi değişti. Sayfayı yenileyin.'),{fdSettlementUncertain:true});
 if(!avansJsonAyniMi(exitOwnLoans(avanslar,saved.id),exitSettlement.localLoans))throw Object.assign(Error('Hesaplaşma sunucuda kayıtlı; avans listesi değişti. Sayfayı yenileyin.'),{fdSettlementUncertain:true});
 const freshLoans=exitSettlement.rows.map(r=>({...r.data,id:r.id}));avanslar=[...avanslar.filter(a=>!exitOwnLoans([a],saved.id).length),...freshLoans];const advanceAck=JSON.parse(veriSonKayitGoruntuleri.get('avanslar')||'[]');veriSonKayitGoruntuleri.set('avanslar',JSON.stringify([...advanceAck.filter(a=>!exitOwnLoans([a],saved.id).length),...freshLoans]));
 personeller[index]=saved;const snapshot=JSON.parse(veriSonKayitGoruntuleri.get('personeller')||'[]'),i=snapshot.findIndex(p=>String(p.id)===saved.id&&(!p.sirketId||String(p.sirketId)===String(saved.sirketId)));if(i<0)snapshot.push(saved);else snapshot[i]=saved;veriSonKayitGoruntuleri.set('personeller',JSON.stringify(snapshot));veriOnbelleginiKaydet();
}
function updateExitReason(){
    const visible=!transferMode&&Boolean(document.getElementById('pCikisTarihi').value);
    document.getElementById('pCikisSebebiAlan').hidden=!visible;
    document.getElementById('pCikisSebebi').disabled=!visible;updateExitSettlement();
}
function updateTransferMode(){
    const next=document.getElementById('pIstihdamIslemi').value==='nakil';
    if(next&&exitSettlement){resetExitSettlement();exitNode('pExitSettlementOpen').hidden=false;}
    if(next&&!transferMode){hireDraft=document.getElementById('pGirisTarihi').value;document.getElementById('pGirisTarihi').value=tarihInputDegeri(transferSnapshot?.girisTarihi)}
    if(!next&&transferMode)document.getElementById('pGirisTarihi').value=hireDraft;
    transferMode=next;
    document.getElementById('pNakilAlanlari').hidden=!next;
    document.getElementById('pNormalExit').hidden=next;
    document.getElementById('pCikisTarihi').disabled=next;
    document.getElementById('pGirisTarihi').readOnly=next;
    for(const id of ['pNakilCikis','pNakilYeniSube','pNakilGiris']){const node=document.getElementById(id);node.disabled=!next;node.required=next}
    updateExitReason();
}
function prepareTransfer(personel){
    resetExitSettlement();exitNode('pExitSettlementOpen').hidden=false;transferSnapshot=personel?JSON.parse(JSON.stringify(personel)):null;transferMode=false;hireDraft='';
    const mode=document.getElementById('pIstihdamIslemi');mode.value='normal';
    mode.querySelector('[value="nakil"]').disabled=!personel||Boolean(personel.cikisTarihi&&personel.cikisTarihi!=='null');
    document.getElementById('pSube').disabled=Boolean(personel);
    document.getElementById('pGirisTarihi').readOnly=false;
    document.getElementById('pCikisSebebi').value=personel?.cikisSebebi||'';
    document.getElementById('pNakilEskiSube').value=personel?.sube||'';
    document.getElementById('pNakilIlkGiris').value=tarihInputDegeri(personel?.girisTarihi);
    const select=document.getElementById('pNakilYeniSube');select.replaceChildren();select.add(new Option('Şube seçin',''));
    transferBranches().filter(s=>s!==personel?.sube).forEach(s=>select.add(new Option(s,s)));
    for(const id of ['pNakilCikis','pNakilGiris']){const node=document.getElementById(id);node.value='';node.max=transferToday();node.min=tarihInputDegeri(personel?.subeGirisTarihi||personel?.girisTarihi)}
    document.getElementById('pSubeGirisBilgi').textContent=personel?'Mevcut şubeye giriş: '+transferDisplay(tarihInputDegeri(personel.subeGirisTarihi||personel.girisTarihi))+'. Şube değişikliği için aşağıdan “Şube nakli” seçin.':'';
    const list=document.getElementById('pNakilGecmisListe');list.replaceChildren();
    const history=(Array.isArray(personel?.subeNakilleri)?personel.subeNakilleri:[]).filter(n=>n&&typeof n==='object').slice().sort((a,b)=>String(a.yeniGirisTarihi||'').localeCompare(String(b.yeniGirisTarihi||'')));
    for(const [index,n] of history.slice().reverse().entries()){
        const item=document.createElement('li');item.className='personnel-transfer-history-card';const title=document.createElement('strong');title.textContent=transferDisplay(n.yeniGirisTarihi)+' · Şube nakli';item.append(title);
        if(index===0){const badge=document.createElement('span');badge.className='personnel-transfer-latest';badge.textContent='Son nakil';title.append(badge)}
        const route=document.createElement('div');route.className='personnel-transfer-route';
        for(const [side,branch,dateLabel,date]of [['old',n.eskiSube,'Eski şubeden çıkış',n.eskiCikisTarihi],['new',n.yeniSube,'Yeni şubede başlangıç',n.yeniGirisTarihi]]){
            if(side==='new'){const arrow=document.createElement('span');arrow.className='personnel-transfer-arrow';arrow.textContent='→';arrow.setAttribute('aria-hidden','true');route.append(arrow)}
            const block=document.createElement('dl');block.className='personnel-transfer-branch personnel-transfer-branch-'+side;
            for(const [label,value]of [[side==='old'?'Ayrıldığı şube':'Geçtiği şube',branch],[dateLabel,transferDisplay(date)]]){const field=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=String(value||'—');field.append(dt,dd);block.append(field)}
            route.append(block);
        }
        item.append(route);list.appendChild(item);
    }
    document.getElementById('pNakilIlkGirisBilgi')?.remove();if(history.length){const first=document.createElement('p');first.id='pNakilIlkGirisBilgi';first.className='personnel-transfer-note';first.textContent='Şirkette ilk işe giriş: '+transferDisplay(tarihInputDegeri(personel?.girisTarihi))+' · Kıdem ve yıllık izin başlangıcı korunur.';list.before(first)}document.getElementById('pNakilGecmisi').hidden=!list.children.length;updateTransferMode();
}
function transferPayload(personel){
    if(document.getElementById('pIstihdamIslemi').value!=='nakil')return null;
    if(!personel||!transferSnapshot||JSON.stringify(personel)!==JSON.stringify(transferSnapshot))throw Error('Personel kaydı değişti. Kartı kapatıp yeniden açın.');
    if(personel.cikisTarihi&&personel.cikisTarihi!=='null')throw Error('Şube nakli için personelin mevcut iş kaydı aktif olmalıdır.');
    const eskiCikisTarihi=document.getElementById('pNakilCikis').value,yeniGirisTarihi=document.getElementById('pNakilGiris').value,yeniSube=document.getElementById('pNakilYeniSube').value;
    const ilkGirisTarihi=tarihInputDegeri(personel.girisTarihi),eskiGirisTarihi=tarihInputDegeri(personel.subeGirisTarihi||personel.girisTarihi);
    if(!personel.sube||!yeniSube||yeniSube===personel.sube||!transferBranches().includes(yeniSube))throw Error('Mevcut şubeden farklı, bu şirkete ait aktif bir yeni şube seçin.');
    if(![ilkGirisTarihi,eskiGirisTarihi,eskiCikisTarihi,yeniGirisTarihi].every(transferDate)||eskiCikisTarihi<eskiGirisTarihi||yeniGirisTarihi<eskiCikisTarihi||yeniGirisTarihi<=eskiGirisTarihi)throw Error('Çıkış mevcut şubeye girişten önce, yeni giriş de çıkıştan önce olamaz. Nakil tarihlerini kontrol edin.');
    if(yeniGirisTarihi>transferToday())throw Error('Nakli yeni şubedeki işe giriş günü veya sonrasında kaydedebilirsiniz.');
    if(document.getElementById('pGirisTarihi').value!==ilkGirisTarihi)throw Error('Şube naklinde ilk işe giriş tarihi değiştirilemez.');
    return {eskiSube:personel.sube,yeniSube,eskiGirisTarihi,eskiCikisTarihi,yeniGirisTarihi,ilkGirisTarihi,kayitZamani:new Date().toISOString(),kaydeden:String(activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'')};
}
function clear(){if(!owned)return;if(nativeDocument.getElementById('modalPersonel')===owned)window.fdPersonnelPhoto.end();form?.reset();prepareTransfer(null);if(owned.style.display!=='none')owned.style.display='none';owned.querySelectorAll('[data-personel-wa-key]').forEach(n=>n.checked=false);const wa=owned.querySelector('[data-employee-id]');if(wa){wa.dataset.employeeId='';wa.dataset.companyId=''}const edit=owned.querySelector('#pEditOriginalId');if(edit)edit.value='';const tc=owned.querySelector('#pTcNo');if(tc)tc.disabled=false;const heading=owned.querySelector('#modalPersonelBaslik');if(heading)heading.textContent='Yeni Personel Kaydı';const photo=owned.querySelector('#pFotoDurum');if(photo)photo.textContent='JPG, PNG veya WEBP dosyası seçebilirsiniz.'}
async function submit(event){event.preventDefault();if(busy)return;assertCurrent();busy=true;activeOperation=++generation;const operation=activeOperation,buttons=[...form.querySelectorAll('button[type="submit"]')],before=buttons.map(n=>n.disabled);buttons.forEach(n=>n.disabled=true);try{return await fdSubmitOriginal(event)}catch(error){if(!error?.fdPersonnelFormStale&&current())window.alert('Personel kaydı tamamlanamadı: '+(error.message||error))}finally{if(operation===activeOperation){busy=false;if(current())buttons.forEach((n,i)=>n.disabled=before[i]);if(!current()||owned?.style.display==='none')clear()}}}

function organizePersonnelForm() {
        const form = document.getElementById('personelForm');
        if (!form || form.dataset.organized === 'true') return;
        const submitButton = form.querySelector('button[type="submit"]');
        const groupFor = id => document.getElementById(id)?.closest('.form-group');
        const sections = [
            ['Kimlik ve İstihdam Bilgileri', ['pTcNo', 'pCihazPersonelNo', 'pAd', 'pKimlikSeri', 'pDogumTarihi', 'pCinsiyet', 'pSube', 'pDepartman', 'pGorev', 'pKadro', 'pYonetici', 'pGirisTarihi', 'pFotoDosya']],
            ['İletişim ve Aile Bilgileri', ['pTelefon', 'pKurumsalTelefon', 'pEposta', 'pAcilDurumAd', 'pAcilDurumYakinlik', 'pAcilDurumTelefon', 'pMedeniDurum', 'pCocukSayisi', 'pAdres']],
            ['Finansal ve Özlük Bilgileri', ['pBankaAdi', 'pIban', 'pSgkNo', 'pEmeklilikTuru', 'pEmekli', 'pEngelli', 'pVergiMuafiyet', 'pAskerlikDurumu', 'pTecilBitis', 'pTerhisTarihi', 'pUcretTipi', 'pUcret', 'pEkOdemeTuru', 'pEkOdemeTutari', 'pYolUcreti', 'pPrimVar']],
            ['Eğitim, Belgeler ve Yetkinlikler', ['pEgitimSeviyesi', 'pOkulBolum', 'pMezuniyetYili', 'pBelgeler', 'pSertifikalar', 'pSertifikaBitis', 'pEhliyetDil']],
            ['Sağlık ve İş Güvenliği', ['pKanGrubu', 'pSonSaglikTaramasi', 'pIsyeriHekimi', 'pKronikRahatsizlik', 'pAlerjiler', 'pSaglikNotu']],
            ['Zimmet ve Kariyer Geçmişi', ['pZimmetNotu', 'pTerfiGecmisi', 'pPerformansNotu']]
        ];

        const secondPhoneLabel = document.getElementById('pKurumsalTelefon')?.closest('.form-group')?.querySelector('label');
        if (secondPhoneLabel) secondPhoneLabel.textContent = '2. Telefon';

        const builtSections = sections.map(([title, fields], index) => {
            const details = document.createElement('details');
            details.className = 'profile-section';
            details.open = index === 0;
            const summary = document.createElement('summary');
            summary.textContent = title;
            const layout = document.createElement('div');
            layout.className = 'profile-layout';
            fields.map(groupFor).filter(Boolean).forEach(group => layout.appendChild(group));
            details.append(summary, layout);
            details.addEventListener('toggle', () => {
                if (details.open) {
                    form.querySelectorAll('details.profile-section[open]').forEach(other => {
                        if (other !== details) other.open = false;
                    });
                }
            });
            return details;
        });

        form.querySelectorAll('.profile-section').forEach(section => section.remove());
        form.querySelectorAll(':scope > .form-row').forEach(row => {
            if (!row.children.length) row.remove();
        });
        builtSections.forEach(section => form.insertBefore(section, submitButton));
        const addStandaloneSection = (title, group, className) => {
            if (!group) return;
            const section = document.createElement('section');
            section.className = `profile-section ${className}`;
            const heading = document.createElement('h4');
            heading.className = 'profile-section-heading';
            heading.textContent = title;
            const body = document.createElement('div');
            body.appendChild(group);
            section.append(heading, body);
            form.insertBefore(section, submitButton);
        };
        addStandaloneSection('Açıklamalar ve Notlar', groupFor('pAciklama'), 'profile-notes');
        addStandaloneSection('İşten Ayrılış / Şube Nakli', document.getElementById('pEmploymentChanges'), 'exit-warning');
        form.dataset.organized = 'true';
    }
function updateAskerlikTarihAlani() {
        const status = document.getElementById('pAskerlikDurumu');
        const discharge = document.getElementById('pTerhisTarihi');
        const deferment = document.getElementById('pTecilBitis');
        const dischargeGroup = discharge?.closest('.form-group');
        const defermentGroup = deferment?.closest('.form-group');
        if (!status || !discharge || !deferment || !dischargeGroup || !defermentGroup) return;
        const completed = status.value === 'Yapıldı';
        const deferred = status.value === 'Tecilli';
        dischargeGroup.style.display = completed ? '' : 'none';
        defermentGroup.style.display = deferred ? '' : 'none';
        discharge.required = completed;
        deferment.required = deferred;
    }
function personelFotografSeciminiGoster(input) {
        const durum = document.getElementById('pFotoDurum');
        if (!durum) return;
        const dosya = input?.files?.[0];
        durum.textContent = dosya ? `Seçilen fotoğraf: ${dosya.name}` : 'JPG, PNG veya WEBP dosyası seçebilirsiniz.';
        window.fdPersonnelPhoto.selected(input);
    }
function openPersonelModal() {
        if (isPersonelUser()) {
            showToast('Bu hesap yalnızca kendi kayıtlarını görüntüleyebilir.', 'warning');
            return;
        }
        document.getElementById('modalPersonelBaslik').innerText = "Yeni Personel Kaydı";
        document.getElementById('personelForm').reset();
        document.getElementById('pFotoDurum').textContent = 'JPG, PNG veya WEBP dosyası seçebilirsiniz.';
        document.getElementById('pEditOriginalId').value = "";
        document.getElementById('pTcNo').disabled = false;
        prepareTransfer(null);
        document.getElementById('modalPersonel').style.display = 'flex';
        window.fdPersonnelPhoto.begin(null);
    }
function closePersonelModal() { window.fdPersonnelPhoto.end(); document.getElementById('modalPersonel').style.display = 'none'; }
function personelDuzenle(id) {
        const p = personeller.find(item => String(item.id) === String(id));
        if (!p) return;

        document.getElementById('modalPersonelBaslik').innerText = "Personel Kartını Güncelle";
        document.getElementById('pEditOriginalId').value = p.id;
        document.getElementById('pTcNo').value = p.id;
        document.getElementById('pTcNo').disabled = true;
        document.getElementById('pCihazPersonelNo').value = p.cihazPersonelNo || '';
        document.getElementById('pAd').value = p.ad;
        document.getElementById('pSube').value = p.sube || '';
        document.getElementById('pGorev').value = p.gorev || '';
        document.getElementById('pTelefon').value = p.telefon || '';
        document.getElementById('pKanGrubu').value = p.kanGrubu || '';
        document.getElementById('pCinsiyet').value = p.cinsiyet || '';
        document.getElementById('pEngelli').value = p.engelli || 'Hayır';
        document.getElementById('pEmekli').value = p.emekli || 'Hayır';
        document.getElementById('pBelgeler').value = p.belgeler || '';
        document.getElementById('pAciklama').value = p.aciklama || '';
        document.getElementById('pGirisTarihi').value = tarihInputDegeri(p.girisTarihi);
        document.getElementById('pDogumTarihi').value = tarihInputDegeri(p.dogumTarihi);
        document.getElementById('pKimlikSeri').value = p.kimlikSeriNo || '';
        document.getElementById('pFotoDosya').value = '';
        document.getElementById('pFotoDurum').textContent = personelFotografAdresi(p) ? 'Mevcut fotoğraf kayıtlı. Değiştirmek için yeni bir dosya seçin.' : 'JPG, PNG veya WEBP dosyası seçebilirsiniz.';
        window.fdPersonnelPhoto.begin(p);
        document.getElementById('pAdres').value = p.adres || '';
        document.getElementById('pKurumsalTelefon').value = p.kurumsalTelefon || '';
        document.getElementById('pEposta').value = p.eposta || '';
        document.getElementById('pAcilDurumAd').value = p.acilDurumAd || '';
        document.getElementById('pAcilDurumYakinlik').value = p.acilDurumYakinlik || '';
        document.getElementById('pAcilDurumTelefon').value = p.acilDurumTelefon || '';
        document.getElementById('pMedeniDurum').value = p.medeniDurum || '';
        document.getElementById('pCocukSayisi').value = p.cocukSayisi ?? 0;
        document.getElementById('pAskerlikDurumu').value = p.askerlikDurumu || '';
        document.getElementById('pTecilBitis').value = tarihInputDegeri(p.tecilBitis);
        document.getElementById('pTerhisTarihi').value = tarihInputDegeri(p.terhisTarihi);
        document.getElementById('pBankaAdi').value = p.bankaAdi || '';
        document.getElementById('pIban').value = p.iban || '';
        document.getElementById('pSgkNo').value = p.sgkNo || '';
        document.getElementById('pEmeklilikTuru').value = p.emeklilikTuru || '';
        document.getElementById('pVergiMuafiyet').value = p.vergiMuafiyet || '';
        document.getElementById('pDepartman').value = p.departman || '';
        document.getElementById('pKadro').value = p.kadro || '';
        document.getElementById('pYonetici').value = p.yonetici || '';
        document.getElementById('pEgitimSeviyesi').value = p.egitimSeviyesi || '';
        document.getElementById('pOkulBolum').value = p.okulBolum || '';
        document.getElementById('pSertifikalar').value = p.sertifikalar || '';
        document.getElementById('pSertifikaBitis').value = tarihInputDegeri(p.sertifikaBitis);
        document.getElementById('pEhliyetDil').value = p.ehliyetDil || '';
        document.getElementById('pZimmetNotu').value = p.zimmetNotu || '';
        document.getElementById('pTerfiGecmisi').value = p.terfiGecmisi || '';
        document.getElementById('pPerformansNotu').value = p.performansNotu || '';
        document.getElementById('pSonSaglikTaramasi').value = tarihInputDegeri(p.sonSaglikTaramasi);
        document.getElementById('pIsyeriHekimi').value = p.isyeriHekimi || '';
        document.getElementById('pKronikRahatsizlik').value = p.kronikRahatsizlik || '';
        document.getElementById('pAlerjiler').value = p.alerjiler || '';
        document.getElementById('pSaglikNotu').value = p.saglikNotu || '';
        document.getElementById('pMezuniyetYili').value = mezuniyetYiliniDuzelt(p.mezuniyetYili || p.mezuniyetTarihi);
        document.getElementById('pUcretTipi').value = p.ucretTipi || '';
        document.getElementById('pUcret').value = p.fdUcretDonemleri?.length ? personelGunlukUcretiniGetir(p).toLocaleString('tr-TR',{maximumFractionDigits:2}) : (p.ucret || '');
        document.getElementById('pEkOdemeTuru').value = p.ekOdemeTuru || '';
        document.getElementById('pEkOdemeTutari').value = p.ekOdemeTutari || '';
        document.getElementById('pYolUcreti').value = p.yolUcreti || '';
        ['pUcret', 'pEkOdemeTutari', 'pYolUcreti'].forEach(id => paraGirisiFormatla(document.getElementById(id)));
        document.getElementById('pPrimVar').value = p.primVar || 'Hayır';
        updateAskerlikTarihAlani();
        document.getElementById('pCikisTarihi').value = (p.cikisTarihi && p.cikisTarihi !== "null") ? tarihInputDegeri(p.cikisTarihi) : '';
        prepareTransfer(p);

        document.getElementById('modalPersonel').style.display = 'flex';
    }
const fdSubmitOriginal=async (e) => {
        e.preventDefault();
        const origId = document.getElementById('pEditOriginalId').value;
        const tcNo = document.getElementById('pTcNo').value.trim();
        const nakilSecili = document.getElementById('pIstihdamIslemi').value === 'nakil';
        const yeniCikisTarihi = nakilSecili ? '' : document.getElementById('pCikisTarihi').value;
        const yeniCikisSebebi = yeniCikisTarihi ? document.getElementById('pCikisSebebi').value.trim() : '';

        if (tcNo.length !== 11 || isNaN(tcNo)) { alert("Geçerli 11 haneli T.C. giriniz."); return; }
        const cihazPersonelNo = magicpassCihazNoAnahtari(document.getElementById('pCihazPersonelNo').value);
        document.getElementById('pCihazPersonelNo').value = cihazPersonelNo;
        if (cihazPersonelNo && personeller.some(p => magicpassCihazNoAnahtari(p.cihazPersonelNo) === cihazPersonelNo && String(p.id) !== String(origId))) { alert('Bu cihaz personel numaras? ba?ka bir personele tan?ml?.'); return; }

        const mevcutPersonel = personeller.find(p => String(p.id) === String(origId) && aktifSirketeAit(p));
        if (origId && !mevcutPersonel) { alert('Düzenlenecek personel bu şirkette bulunamadı.'); return; }
        const nakil = transferPayload(mevcutPersonel);
        if (mevcutPersonel && !nakil && document.getElementById('pSube').value !== mevcutPersonel.sube) { alert('Şube değişikliği için “Şube nakli” işlemini seçin.'); return; }
        const hesaplasmaTaslagi=exitSettlementBeforeSave();
        const fotoKadrajKaydi = window.fdPersonnelPhoto.payload(mevcutPersonel);
        if (fotoKadrajKaydi === null) { alert('Fotoğraf ayarı bu oturuma ait değil. Personel kartını yeniden açın.'); return; }
        const cikisTarihiYeniEklendi = yeniCikisTarihi && origId && String(mevcutPersonel?.cikisTarihi || '') !== String(yeniCikisTarihi);
        const kullaniciHesabiKapatilacak = Boolean(yeniCikisTarihi && origId && !String(mevcutPersonel?.cikisTarihi || '').trim());
        if (cikisTarihiYeniEklendi) {
            const pTemp = {
                id: String(tcNo),
                girisTarihi: document.getElementById('pGirisTarihi').value,
                dogumTarihi: document.getElementById('pDogumTarihi').value,
                cikisTarihi: yeniCikisTarihi
            };
            const donemler = personelDonemleriniGetir(pTemp);
            let toplamKalan = 0;
            donemler.forEach(d => {
                let kullanilan = izinler.filter(i => String(i.pId) === String(tcNo) && i.donem === d.donem && i.tur === 'Yıllık İzin').reduce((s, x) => s + x.gun, 0);
                let kalan = d.hak - kullanilan;
                if (kalan > 0) toplamKalan += kalan;
            });

            const personelIdleri = [String(tcNo), String(origId)];
            const acikIcralar = icralar.filter(icra =>
                personelIdleri.includes(String(icra.pId)) &&
                (!icra.sirketId || String(icra.sirketId) === String(aktifSirketId() || mevcutPersonel?.sirketId || '')) &&
                icraKalanBorc(icra) > 0
            );
            const cikisAvansKaynak = hesaplasmaTaslagi ? exitSettlement.loans : avanslar;
            const devamEdenAvanslar = cikisAvansKaynak
                .filter(avans => personelIdleri.includes(String(avans.pId)) && (!avans.sirketId || String(avans.sirketId) === String(aktifSirketId() || mevcutPersonel?.sirketId || '')))
                .map(avans => {const mahsup=hesaplasmaTaslagi?.result.avanslar.find(kayit=>String(kayit.id)===String(avans.id));return {avans,kalan:mahsup?mahsup.kalanKurus/100:cikisIcinKalanAvansTutariniBul(avans,yeniCikisTarihi)};})
                .filter(({kalan}) => kalan > 0);
            const kalanEkOdemeler = ekOdemeler.filter(kayit =>
                personelIdleri.includes(String(kayit.pId)) &&
                (!kayit.sirketId || String(kayit.sirketId) === String(aktifSirketId() || mevcutPersonel?.sirketId || '')) &&
                paraMetniniSayiyaCevir(kayit.kalanTutar) > 0
            );
            const uyarilar = [];
            if (acikIcralar.length) uyarilar.push({ baslik: `Açık icra kaydı (${acikIcralar.length})`, aciklama: acikIcralar.map(icra => `${escapeDashboardText(icra.dosyaNo || 'Dosya no yok')} · Kalan borç: ${paraFormatla(icraKalanBorc(icra))}`).join('<br>') });
            if (devamEdenAvanslar.length) uyarilar.push({ baslik: `${hesaplasmaTaslagi ? 'Tazminat mahsubundan sonra kalan avans borcu' : 'Devam eden avans kesintisi'} (${devamEdenAvanslar.length})`, aciklama: devamEdenAvanslar.map(({ avans, kalan }) => `${escapeDashboardText(avans.avansNo || 'Avans')} · ${hesaplasmaTaslagi ? 'Kalan borç' : 'Planlanan kalan'}: ${paraFormatla(kalan)}`).join('<br>') });
            if (kalanEkOdemeler.length) uyarilar.push({ baslik: `Ödenmemiş ek ödeme / yol ücreti (${kalanEkOdemeler.length})`, aciklama: kalanEkOdemeler.map(kayit => `${escapeDashboardText(String(kayit.ay || 'Ay bilgisi yok'))} · ${escapeDashboardText(kayit.ekOdemeTuru || 'Ek ödeme')} · Kalan: ${paraFormatla(paraMetniniSayiyaCevir(kayit.kalanTutar))}`).join('<br>') });
            if (toplamKalan > 0) uyarilar.push({ baslik: 'Kullanılmamış yıllık izin', aciklama: `Bu personelin toplam <strong>${toplamKalan} gün</strong> kullanılmamış yıllık izin hakkı bulunuyor.` });
            if (uyarilar.length && !(await fdFormWait(()=>(cikisUyariyiGoster(uyarilar))))) return;
        }

        const mezuniyetYiliGirdisi = document.getElementById('pMezuniyetYili').value.trim();
        const mezuniyetYili = mezuniyetYiliniDuzelt(mezuniyetYiliGirdisi);
        if (mezuniyetYiliGirdisi && !mezuniyetYili) {
            alert('Mezuniyet yılı 1900 ile ' + new Date().getFullYear() + ' arasında olmalıdır.');
            return;
        }

        if (!origId && personeller.some(p => String(p.id) === String(tcNo))) { alert("Bu T.C. numarasına sahip personel zaten var!"); return; }

        const fotoDosyasi = document.getElementById('pFotoDosya')?.files?.[0] || null;
        const eskiFotograf = mevcutPersonel?.fotografDosya || null;
        let yeniFotograf = null;
        if (fotoDosyasi) {
            if (!['image/jpeg','image/png','image/webp'].includes(String(fotoDosyasi.type || '').toLowerCase())) {
                alert('Personel fotoğrafı JPG, PNG veya WEBP biçiminde olmalıdır.');
                return;
            }
            if (fotoDosyasi.size > 8 * 1024 * 1024) {
                alert('Personel fotoğrafı en fazla 8 MB olabilir.');
                return;
            }
            showGlobalOverlay('Personel fotoğrafı yükleniyor', 'Fotoğraf Drive klasörüne kaydediliyor...');
            try {
                const hazirlik = await fdFormWait(()=>(window.fdPersonnelPhoto.prepare(fotoDosyasi))), hazirFoto = hazirlik.file;
                const uzanti = (hazirFoto.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg';
                const fotoAdi = `PERSONEL_${tcNo}_${Date.now()}.${uzanti}`;
                const fotoIcerigi = await fdFormWait(()=>(dosyayiBase64Oku(hazirFoto)));hazirlik.check();
                const yuklenen = await fdFormWait(()=>(fdYazilimDriveDosyaYukle(fotoIcerigi, fotoAdi, hazirFoto.type, '', 'PERSONEL FOTOĞRAFLARI')));
                yeniFotograf = { id:yuklenen.id, url:yuklenen.url || '', ad:yuklenen.ad || fotoAdi, mimeType:hazirFoto.type, boyut:hazirFoto.size };
                hazirlik.check();
            } catch (hata) {
if(hata?.fdPersonnelFormStale)return;

                hideGlobalOverlay();
                alert('Personel fotoğrafı yüklenemedi: ' + (hata.message || 'Bilinmeyen hata'));
                return;
            }
        }
        const kullanilanFotograf = yeniFotograf || eskiFotograf || null;
        const pObj = {
            ...(mevcutPersonel || {}),
            ...fotoKadrajKaydi,
            whatsappMesajTercihleri: window.fdPersonelWhatsappTercihleri?.read(mevcutPersonel) ?? mevcutPersonel?.whatsappMesajTercihleri ?? {},
            cihazPersonelNo,
            id: String(tcNo),
            sirketId: aktifSirketId() || mevcutPersonel?.sirketId || '',
            ad: document.getElementById('pAd').value,
            sube: nakil ? nakil.yeniSube : document.getElementById('pSube').value,
            gorev: document.getElementById('pGorev').value,
            telefon: document.getElementById('pTelefon').value,
            kanGrubu: document.getElementById('pKanGrubu').value,
            cinsiyet: document.getElementById('pCinsiyet').value,
            engelli: document.getElementById('pEngelli').value,
            emekli: document.getElementById('pEmekli').value,
            belgeler: document.getElementById('pBelgeler').value,
            aciklama: document.getElementById('pAciklama').value,
            girisTarihi: nakil ? mevcutPersonel.girisTarihi : document.getElementById('pGirisTarihi').value,
            dogumTarihi: document.getElementById('pDogumTarihi').value,
            cikisTarihi: yeniCikisTarihi || null,
            cikisSebebi: yeniCikisSebebi,
            ...(nakil ? {subeGirisTarihi:nakil.yeniGirisTarihi,subeNakilleri:[...(Array.isArray(mevcutPersonel.subeNakilleri)?mevcutPersonel.subeNakilleri:[]),nakil]} : {}),
            kimlikSeriNo: document.getElementById('pKimlikSeri').value,
            fotografDosya: kullanilanFotograf,
            fotografUrl: personelFotografAdresi({ fotografDosya:kullanilanFotograf, fotografUrl:mevcutPersonel?.fotografUrl || '' }),
            adres: document.getElementById('pAdres').value,
            kurumsalTelefon: document.getElementById('pKurumsalTelefon').value,
            eposta: document.getElementById('pEposta').value,
            acilDurumAd: document.getElementById('pAcilDurumAd').value,
            acilDurumYakinlik: document.getElementById('pAcilDurumYakinlik').value,
            acilDurumTelefon: document.getElementById('pAcilDurumTelefon').value,
            medeniDurum: document.getElementById('pMedeniDurum').value,
            cocukSayisi: document.getElementById('pCocukSayisi').value,
            askerlikDurumu: document.getElementById('pAskerlikDurumu').value,
            tecilBitis: document.getElementById('pTecilBitis').value,
            terhisTarihi: document.getElementById('pTerhisTarihi').value,
            bankaAdi: document.getElementById('pBankaAdi').value,
            iban: document.getElementById('pIban').value,
            sgkNo: document.getElementById('pSgkNo').value,
            emeklilikTuru: document.getElementById('pEmeklilikTuru').value,
            vergiMuafiyet: document.getElementById('pVergiMuafiyet').value,
            departman: document.getElementById('pDepartman').value,
            kadro: document.getElementById('pKadro').value,
            yonetici: document.getElementById('pYonetici').value,
            egitimSeviyesi: document.getElementById('pEgitimSeviyesi').value,
            okulBolum: document.getElementById('pOkulBolum').value,
            sertifikalar: document.getElementById('pSertifikalar').value,
            sertifikaBitis: document.getElementById('pSertifikaBitis').value,
            ehliyetDil: document.getElementById('pEhliyetDil').value,
            zimmetNotu: document.getElementById('pZimmetNotu').value,
            terfiGecmisi: document.getElementById('pTerfiGecmisi').value,
            performansNotu: document.getElementById('pPerformansNotu').value,
            sonSaglikTaramasi: document.getElementById('pSonSaglikTaramasi').value,
            isyeriHekimi: document.getElementById('pIsyeriHekimi').value,
            kronikRahatsizlik: document.getElementById('pKronikRahatsizlik').value,
            alerjiler: document.getElementById('pAlerjiler').value,
            saglikNotu: document.getElementById('pSaglikNotu').value,
            mezuniyetYili,
            ucretTipi: document.getElementById('pUcretTipi').value,
            ucret: document.getElementById('pUcret').value,
            ekOdemeTuru: document.getElementById('pEkOdemeTuru').value,
            ekOdemeTutari: document.getElementById('pEkOdemeTutari').value,
            yolUcreti: document.getElementById('pYolUcreti').value,
            ekOdemeUcretGecmisi: ekOdemeUcretGecmisiniHazirla(mevcutPersonel, {
                ekOdemeTuru:document.getElementById('pEkOdemeTuru').value,
                ekOdemeTutari:document.getElementById('pEkOdemeTutari').value,
                yolUcreti:document.getElementById('pYolUcreti').value,
                girisTarihi:document.getElementById('pGirisTarihi').value
            }),
            primVar: document.getElementById('pPrimVar').value
        };

        if (nakil && JSON.stringify(personeller.find(p=>String(p.id)===String(origId)&&aktifSirketeAit(p))) !== JSON.stringify(transferSnapshot)) {
            if (yeniFotograf?.id) await fdFormWait(()=>fdYazilimDriveDosyaSil(yeniFotograf.id, 'PERSONEL FOTOĞRAFLARI'));
            hideGlobalOverlay();alert('Personel kaydı değişti. Nakil kaydedilmedi; kartı kapatıp yeniden açın.');return;
        }
        if (!hesaplasmaTaslagi && origId) {
            const idx = personeller.findIndex(p => String(p.id) === String(origId) && aktifSirketeAit(p));
            if (idx !== -1) personeller[idx] = pObj;
        } else if(!hesaplasmaTaslagi) {
            if (personeller.some(p => String(p.id) === String(tcNo))) { alert("Bu T.C. numarasına sahip personel zaten var!"); return; }
            personeller.push(pObj);
        }

        showGlobalOverlay('Personel kaydediliyor', 'Bilgiler ve giriş hesabı hazırlanıyor, lütfen bekleyin...');
        let hesaplasmaKayitli=false;
        let personelHesabiOlustu = false;
        let personelKaydiBasarili = false;
        let kullaniciHesabiOlusturmaHatasi = null;
        let kullaniciHesabiSilmeHatasi = null;
        try {
            if(hesaplasmaTaslagi){const result=await fdFormWait(()=>saveExitSettlement(pObj,hesaplasmaTaslagi));hesaplasmaKayitli=true;applyExitSettlement(result,mevcutPersonel);Object.assign(pObj,result.data);}else await fdFormWait(()=>(verileriKaydet()));
            if (!origId) {
                try { personelHesabiOlustu = await fdFormWait(()=>(personelKullaniciHesabiOlustur(pObj))); }
                catch (hesapHatasi) {
if(hesapHatasi?.fdPersonnelFormStale)return;
 kullaniciHesabiOlusturmaHatasi = hesapHatasi; }
            }
            if (kullaniciHesabiKapatilacak) {
                try { await fdFormWait(()=>(ayrilanPersonelKullaniciHesabiniSil(origId))); }
                catch (hesapHatasi) {
if(hesapHatasi?.fdPersonnelFormStale)return;
 kullaniciHesabiSilmeHatasi = hesapHatasi; }
            }
            if (yeniFotograf?.id && eskiFotograf?.id && String(yeniFotograf.id) !== String(eskiFotograf.id)) {
                try { await fdFormWait(()=>(fdYazilimDriveDosyaSil(eskiFotograf.id, 'PERSONEL FOTOĞRAFLARI'))); } catch (silmeHatasi) {
if(silmeHatasi?.fdPersonnelFormStale)return;
 console.warn('Eski personel fotoğrafı silinemedi:', silmeHatasi); }
            }
            initUI();
            closePersonelModal();
            personelKaydiBasarili = true;
        } catch (error) {
if(error?.fdPersonnelFormStale)return;

            if(error.fdSettlementUncertain||hesaplasmaKayitli){alert(error.fdSettlementUncertain?error.message:'Hesaplaşma sunucuda kaydedildi. Görünümü yenilemek için sayfayı yeniden açın.');return;}
            if (!origId) personeller = personeller.filter(personel => String(personel.id) !== String(tcNo));
            else if (mevcutPersonel) {
                const eskiIndex = personeller.findIndex(personel => String(personel.id) === String(origId) && aktifSirketeAit(personel));
                if (eskiIndex !== -1) personeller[eskiIndex] = mevcutPersonel;
            }
            if (yeniFotograf?.id) {
                try { await fdFormWait(()=>(fdYazilimDriveDosyaSil(yeniFotograf.id, 'PERSONEL FOTOĞRAFLARI'))); } catch (silmeHatasi) {
if(silmeHatasi?.fdPersonnelFormStale)return;
 console.warn('Yarım kalan personel fotoğrafı temizlenemedi:', silmeHatasi); }
            }
            alert('Personel kaydı tamamlanamadı: ' + (error.message || 'Bilinmeyen hata'));
        } finally {
            hideGlobalOverlay();
        }
        if (personelKaydiBasarili && !origId) personelKayitHatirlatmasiniGoster(tcNo, personelHesabiOlustu);
        if (personelKaydiBasarili && !origId && personelHesabiOlustu) {
            const bildirimSonucu = await fdFormWait(()=>(personelBildirimleriniTopluGonder([personelIseGirisBildirimiHazirla(pObj)])));
            if (bildirimSonucu.basarisiz) showToast('Personel ve giriş hesabı kaydedildi; işe giriş WhatsApp bildirimi gönderilemedi.', 'warning');
        }
        if (personelKaydiBasarili && cikisTarihiYeniEklendi) {
            const bildirimSonucu = await fdFormWait(()=>(personelBildirimleriniTopluGonder([personelIstenAyrilisBildirimiHazirla(pObj)])));
            if (bildirimSonucu.basarisiz) showToast('İşten ayrılış kaydedildi; WhatsApp bildirimi gönderilemedi.', 'warning');
        }
        if (personelKaydiBasarili && kullaniciHesabiOlusturmaHatasi) showToast('Personel kaydı oluşturuldu; ancak giriş hesabı açılamadı: ' + (kullaniciHesabiOlusturmaHatasi.message || kullaniciHesabiOlusturmaHatasi), 'warning');
        if (personelKaydiBasarili && kullaniciHesabiSilmeHatasi) showToast('Personel çıkışı kaydedildi ancak giriş hesabı kapatılamadı: ' + (kullaniciHesabiSilmeHatasi.message || kullaniciHesabiSilmeHatasi), 'warning');
        else if (personelKaydiBasarili && kullaniciHesabiKapatilacak) showToast('Personel çıkışı kaydedildi ve kullanıcı giriş hesabı kapatıldı.');
    };
return{init(){owned=nativeDocument.getElementById('modalPersonel');form=owned.querySelector('#personelForm');organizePersonnelForm();syncSubeDatalist();owned.querySelector('#pCikisTarihi').addEventListener('input',updateExitReason);owned.querySelector('#pCikisTarihi').addEventListener('change',updateExitReason);owned.querySelector('#pIstihdamIslemi').addEventListener('change',updateTransferMode);owned.querySelector('#pAskerlikDurumu').addEventListener('change',updateAskerlikTarihAlani);updateAskerlikTarihAlani();exitNode('pExitSettlementOpen').addEventListener('click',openExitSettlement);exitNode('pExitSettlementEditor').addEventListener('input',previewExitSettlement);exitNode('pExitSettlementEditor').addEventListener('change',previewExitSettlement);form.addEventListener('submit',submit);observer=new MutationObserver(()=>{if(!busy&&owned?.style.display==='none')clear()});observer.observe(owned,{attributes:true,attributeFilter:['style']})},open(request=fdPersonelFormIstek){if(!current()||!request||request.cancelled||request!==fdPersonelFormIstek||request.snapshot!==context())return false;if(busy)return false;if(request.action==='edit'){if(!personeller.some(p=>String(p.id)===String(request.id)&&aktifSirketeAit(p)))return false;personelDuzenle(request.id)}else openPersonelModal();return owned.style.display==='flex'},api:{organizePersonnelForm,updateAskerlikTarihAlani,personelFotografSeciminiGoster,fdPersonelFormKaydiSuruyor(){return busy},closePersonelModal(){if(busy)return false;closePersonelModal();clear();return true},cancelForNavigation(){if(busy){owned.style.display='none';return}clear()}},dispose(){exitReadToken++;exitNode('pExitSettlementOpen')?.removeEventListener('click',openExitSettlement);exitNode('pExitSettlementEditor')?.removeEventListener('input',previewExitSettlement);exitNode('pExitSettlementEditor')?.removeEventListener('change',previewExitSettlement);disposed=true;generation++;activeOperation=generation;observer?.disconnect();form?.removeEventListener('submit',submit);owned?.querySelector('#pCikisTarihi')?.removeEventListener('input',updateExitReason);owned?.querySelector('#pCikisTarihi')?.removeEventListener('change',updateExitReason);owned?.querySelector('#pIstihdamIslemi')?.removeEventListener('change',updateTransferMode);clear();overlay=null;owned=null;form=null}};

});



