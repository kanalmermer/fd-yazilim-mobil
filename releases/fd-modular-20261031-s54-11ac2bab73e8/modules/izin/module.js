window.FDModules.define('izin',function(){

 let fdLeaveDraftId=null;
 const fdLeaveAttempts=new Map();
 const fdLeaveCopy=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
 function fdLeaveCanonical(value){if(Array.isArray(value))return value.map(fdLeaveCanonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,fdLeaveCanonical(value[k])]));return value}
 const fdLeaveEqual=(a,b)=>JSON.stringify(fdLeaveCanonical(a))===JSON.stringify(fdLeaveCanonical(b));
 function fdLeaveFormSignature(){const form=document.getElementById('izinForm');return form?JSON.stringify([...form.querySelectorAll('input,select,textarea')].map(x=>[x.id,x.value,x.checked])):''}
 function fdLeaveConfirmedRow(row,company,id){return row&&row.company_id===company&&row.module==='izinler'&&String(row.legacy_id)===id&&row.data&&(!row.data.sirketId||String(row.data.sirketId)===company)}
 async function fdLeaveSaveOne(record,before){
  fdLeaveAssert(true);
  if(!SUPABASE_MODE)throw Error('Bu bağlantıda kayıt sonucu doğrulanamıyor. Doğrulanmış bağlantıyı kullanın; formdaki bilgiler korunuyor.');
  const company=String(activeUser.sirketId||''),id=String(record.id),sent=fdLeaveCopy(record),priorAttempt=fdLeaveCopy(fdLeaveAttempts.get(id));
  if(!company||String(sent.sirketId)!==company)throw Error('İzin kaydının şirketi doğrulanamadı.');
  if(!personeller.some(p=>String(p.id)===String(sent.pId)&&aktifSirketeAit(p)))throw Error('Şirkete ait personel bulunamadı.');
  const read=()=>supabaseClient.from('portal_records').select('company_id,module,legacy_id,data').eq('company_id',company).eq('module','izinler').eq('legacy_id',id).maybeSingle();
  supabaseKaydetmeBekleyen++;
  const task=supabaseKaydetmeKuyrugu.catch(()=>{}).then(async()=>{
   fdLeaveAssert(true);
   const local=izinler.find(i=>String(i.id)===id);
   if(!fdLeaveEqual(local,before))throw Error('Bu izin kaydı beklerken değişti. Listeyi kontrol edin; formdaki bilgiler korunuyor.');
   const initial=await zamanAsimliBekle(read(),15000,'Önceki izin kaydı okunamadı. Değişiklik gönderilmedi.');
   fdLeaveAssert(true);if(initial.error)throw initial.error;
   const server=initial.data;
   if(server&&!fdLeaveConfirmedRow(server,company,id))throw Error('Sunucunun kayıt kapsamı doğrulanamadı.');
   const already=server&&fdLeaveEqual(server.data,sent);
   if(!already){
    const expected=server&&(fdLeaveEqual(server.data,before)||(priorAttempt&&fdLeaveEqual(server.data,priorAttempt)));
    if(before&&!expected)throw Error('İzin kaydı sunucuda değişmiş veya kaldırılmış. Listeyi yenileyip karşılaştırın.');
    if(!before&&server&&!expected)throw Error('Bu kayıt kimliği sunucuda zaten kullanılıyor; otomatik üzerine yazılmadı.');
    // If a previous request is uncertain, a modified retry must first observe it.
    if(priorAttempt&&!fdLeaveEqual(priorAttempt,sent)&&!expected)throw Error('Önceki gönderimin sonucu belirsiz. Yeni değişiklik göndermeden önce listeyi kontrol edin.');
    const payload={company_id:company,module:'izinler',legacy_id:id,record_year:supabaseKayitYili('izinler',sent),employee_legacy_id:supabasePersonelKimligi(sent,'izinler')||null,data:sent};
    fdLeaveAttempts.set(id,fdLeaveCopy(sent));
    const reply=await zamanAsimliBekle(supabaseClient.from('portal_records').upsert(payload,{onConflict:'company_id,module,legacy_id'}).select('company_id,module,legacy_id,data'),15000,'İzin kaydının sonucu zamanında alınamadı. Aynı formu koruduk; tekrar kayıt oluşturmadan önce listeyi kontrol edin.');
    fdLeaveAssert(true);if(reply.error)throw reply.error;
    if(!Array.isArray(reply.data)||reply.data.length!==1||!fdLeaveConfirmedRow(reply.data[0],company,id)||!fdLeaveEqual(reply.data[0].data,sent))throw Error('İzin kaydının sunucu onayı alınamadı. Formdaki bilgiler korunuyor.');
   }
   const verify=await zamanAsimliBekle(read(),15000,'İzin kaydı geri okunarak doğrulanamadı. Formdaki bilgiler korunuyor.');
   fdLeaveAssert(true);if(verify.error)throw verify.error;
   if(!fdLeaveConfirmedRow(verify.data,company,id)||!fdLeaveEqual(verify.data.data,sent))throw Error('İzin kaydı sunucuda doğrulanamadı. Formdaki bilgiler korunuyor.');
   const confirmed=fdLeaveCopy(verify.data.data),current=izinler.find(i=>String(i.id)===id),apply=fdLeaveEqual(current,before);
   // Acknowledge only this row, not unrelated pending leave edits.
   let snapshot;try{snapshot=JSON.parse(veriSonKayitGoruntuleri.get('izinler')||'[]')}catch(_){throw Error('Son kayıt görünümü okunamadı; formdaki bilgiler korunuyor.')}
   if(!Array.isArray(snapshot))throw Error('Son kayıt görünümü geçersiz; formdaki bilgiler korunuyor.');
   const at=snapshot.findIndex(i=>String(i.id)===id);if(at<0)snapshot.push(confirmed);else snapshot[at]=confirmed;
   veriSonKayitGoruntuleri.set('izinler',JSON.stringify(snapshot));
   if(apply){const index=izinler.findIndex(i=>String(i.id)===id);if(index<0)izinler.push(confirmed);else izinler[index]=confirmed}
   fdLeaveAttempts.delete(id);try{veriOnbelleginiKaydet()}catch(error){console.warn('Doğrulanmış iznin önbelleği yazılamadı:',error)}
   return{record:confirmed,localApplied:apply};
  }).finally(()=>{supabaseKaydetmeBekleyen=Math.max(0,supabaseKaydetmeBekleyen-1)});
  supabaseKaydetmeKuyrugu=task;return task;
 }
 async function fdLeaveSaveSubmit(e){
  e.preventDefault();if(izinIslemde)return;
  let submitButton,started=false,saved=false;
  try{
   fdLeaveAssert(true);
   const pId=document.getElementById('izinPersonelSelect').value,baslangic=document.getElementById('izinBaslangic').value,bitis=document.getElementById('izinBitis').value,editIdVal=document.getElementById('iEditId').value,editIzinId=editIdVal?parseInt(editIdVal):null;
   if(!pId||hesaplananNetGun<=0){alert('Lütfen geçerli personel ve tarih aralığı seçin.');return}
   const overlap=izindeCakisinaIzinVarMi(pId,baslangic,bitis,editIzinId||fdLeaveDraftId);
   if(overlap){alert(`⚠️ Bu personel seçilen tarihler arasında (${tarihFormati(overlap.baslangic)} - ${tarihFormati(overlap.bitis)}) zaten [${overlap.tur}] iznindedir!\n\nİzindeyken bu tarihler arasına yeni izin girilemez.`);return}
   const before=editIzinId?fdLeaveCopy(izinler.find(i=>i.id===editIzinId)):undefined;
   if(editIzinId&&!before)throw Error('Düzenlenecek izin kaydı bulunamadı. Listeyi yenileyin.');
   if(before&&!aktifSirketeAit(before))throw Error('Başka şirkete ait izin kaydı değiştirilemez.');
   const tur=document.getElementById('izinTur').value,donem=tur==='Yıllık İzin'?document.getElementById('izinDonem').value:'-',sahitler=tur==='Mazeretsiz İzin'?mazeretsizSahitleriGetir():[],sebep=['Mazeretsiz İzin','Sağlık / Rapor','Yıllık İzin'].includes(tur)?'':(document.getElementById('izinSebep').value.trim()||varsayilanIzinSebebi()),iseBaslama=tur==='Mazeretsiz İzin'?'':document.getElementById('iseBaslama').value,raporBilgisi=tur==='Sağlık / Rapor'?document.getElementById('raporBilgisi').value.trim():'';
   if(!editIzinId&&!fdLeaveDraftId)fdLeaveDraftId=Date.now();
   const record={...(before||{}),id:editIzinId||fdLeaveDraftId,sirketId:aktifSirketId(),pId:String(pId),tur,donem,gun:hesaplananNetGun,baslangic,bitis,iseBaslama,sebep,sahitler,raporBilgisi},signature=fdLeaveFormSignature(),draft=fdLeaveDraftId,oldPerson=String(before?.pId||'');
   izinIslemde=true;started=true;submitButton=document.getElementById('btnIzinSubmit');submitButton.disabled=true;fdLeaveShowOverlay('İzin kaydediliyor','Yalnızca bu izin kaydı yazılıyor ve sunucudan doğrulanıyor...');
   const result=await fdLeaveSaveOne(record,before);fdLeaveAssert(true);saved=true;
   if(signature===fdLeaveFormSignature()&&result.localApplied){
    initUI();if(tur!=='Sağlık / Rapor')dilekceHazirla(result.record);izinFormReset();personelSelectDoldur();document.getElementById('izinPersonelSelect').value=String(pId);personelSecildi(String(pId));
   }else{if(draft===fdLeaveDraftId)fdLeaveDraftId=null;showToast('İzin sunucuda kaydedildi. Bu sırada değiştirdiğiniz yeni form korunuyor.','warning')}
   if(oldPerson&&oldPerson!==String(result.record.pId))await fdLeaveAwait(personelIzinBildiriminiIptalEt(oldPerson));
   const notice=await fdLeaveAwait(personelIzinBildirimleriniPlanla([personelIzinBildirimiHazirla(result.record)],fdLeaveValid));
   if(notice.basarisiz)showToast('İzin kaydedildi; WhatsApp bildirimi kuyruğa alınamadı.','warning');
   else if(notice.planlanan)showToast('İzin kaydedildi. WhatsApp mesajı '+izinBildirimBeklemeMetni()+' son haliyle gönderilecek.','success');
   else showToast('İzin kaydı sunucuda doğrulandı.','success');
  }catch(error){if(fdLeaveValid())showToast(saved?'İzin kaydedildi; sonraki ekran veya bildirim işlemi tamamlanamadı: '+(error.message||error):'İzin kaydedilemedi veya doğrulanamadı: '+(error.message||error)+' Formdaki bilgiler korunuyor.','error')}
  finally{if(started){if(submitButton?.isConnected)submitButton.disabled=false;izinIslemde=false;fdLeaveHideOverlay()}}
 }



let fdLeaveDisposed=false,fdLeaveOverlay='',fdLeaveOutput=null,exportBakiyeToPDF;const fdLeaveListeners=[],fdLeaveTimers=new Set(),fdLeaveInitial=fdLeaveContext();
function fdLeaveContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function fdLeaveValid(){return !fdLeaveDisposed&&fdLeaveInitial===fdLeaveContext()&&anaMenuModulErisimiVar('personel')}
function fdLeaveAssert(write=false){if(!fdLeaveValid())throw Error('Oturum değişti; İzin ekranını yeniden açın.');if(write&&(isPersonelUser()||!isManagerUser()||!anaMenuModulYazmaYetkisiVar('personel')))throw Error('İzin işlemi için yazma yetkiniz yok.')}
async function fdLeaveAwait(p){fdLeaveAssert();const v=await p;fdLeaveAssert();return v}
function fdLeaveTimer(fn,ms,...args){const id=window.setTimeout(()=>{fdLeaveTimers.delete(id);if(fdLeaveValid())fn(...args)},ms);fdLeaveTimers.add(id);return id}
function fdLeaveClearTimer(id){fdLeaveTimers.delete(id);window.clearTimeout(id)}
function fdLeaveShowOverlay(...args){fdLeaveAssert();showGlobalOverlay(...args);fdLeaveOverlay=document.getElementById('globalOverlay')?.innerHTML||''}
function fdLeaveHideOverlay(){if(fdLeaveOverlay&&document.getElementById('globalOverlay')?.innerHTML===fdLeaveOverlay)hideGlobalOverlay();fdLeaveOverlay=''}
function fdLeaveListen(type,fn,options){const guarded=(...a)=>{if(fdLeaveValid())return fn(...a)};window.addEventListener(type,guarded,options);fdLeaveListeners.push([type,guarded,options])}
function fdLeavePDF(...args){fdLeaveAssert();const result=window.fdTabloPdfOnizle(...args);fdLeaveOutput=document.getElementById('fdOrtakCiktiOnizleme');return result}
function izinAyarEtiketleriniGuncelle() {
fdLeaveAssert(false);

        const select = document.getElementById('izinTur');
        if (!select) return;
        const yaz = (tur, gun) => {
fdLeaveAssert(false);
 const option = [...select.options].find(item => item.value === tur); if (option) option.textContent = `${tur} (Max ${gun} Gün)`; };
        yaz('Doğum İzni', ayarSayisi('dogumIzinGunu', 5));
        yaz('Evlenme İzni', ayarSayisi('evlenmeIzinGunu', 3));
        yaz('Ölüm İzni', ayarSayisi('olumIzinGunu', 3));
    }
function fdIzinArayuzunuYenile(filtreleriYenile = false) {
fdLeaveAssert(false);

        if (filtreleriYenile) {
            const secimler = fdSelectDegerleriniSakla(['fBakiyeSube','fBakiyeDonem']);
            filtreDropdownlariDoldur();
            fdSelectDegerleriniGeriYukle(secimler);
        }
        renderIzinDashAndTables();
        renderBakiyeTable();
        personelSelectDoldur();
    }
function openIzinTakipApp() {
fdLeaveAssert(false);

        anaMenuDonusButonunuGoster();
        icraEkraniniKapat();
        document.getElementById('appHub').style.display = 'none';
        document.getElementById('personelApp').style.display = 'none';
        document.getElementById('sirketApp').style.display = 'none';
        document.getElementById('puantajApp').style.display = 'none';
        document.getElementById('avansApp').style.display = 'none';
        document.getElementById('ekOdemeApp').style.display = 'none';
        document.getElementById('kkdApp').style.display = 'none';
        document.getElementById('izinTakipApp').style.display = 'block';
        workspaceSekmesiniAktifEt('izin');
        fdLeaveHideOverlay();
        fdIzinArayuzunuYenile(false);
        switchIzinTab('i-tab-form', document.getElementById('btnNavForm'));
        izinFormReset();
        const kendiPersonelId = isPersonelUser() ? String(activeUser.tcNo || '') : '';
        document.getElementById('izinPersonelSelect').value = kendiPersonelId;
        personelSecildi(kendiPersonelId);
        if (!fdModulVerisiTazeMi('izin')) {
            driveVerileriniYukleBaslangicta('izin').then(() => {
fdLeaveAssert(false);

                if (document.getElementById('izinTakipApp')?.style.display !== 'block') return;
                const seciliPersonelId = isPersonelUser() ? String(activeUser.tcNo || '') : document.getElementById('izinPersonelSelect').value;
                fdIzinArayuzunuYenile(true);
                switchIzinTab('i-tab-form', document.getElementById('btnNavForm'));
                if (seciliPersonelId) {
                    document.getElementById('izinPersonelSelect').value = seciliPersonelId;
                    personelSecildi(seciliPersonelId);
                }
                fdLeaveTimer(izinKurtarmaUyarisiGoster, 120);
            }).catch(error => {
                if(!fdLeaveValid())return;
fdLeaveAssert(false);

                console.error('İzin verileri yenilenemedi:', error);
                showToast('İzin verileri arka planda yenilenemedi.', 'warning');
            });
        }
    }
function switchIzinTab(tabId, btn) {
fdLeaveAssert(false);

        if (tabId === 'i-tab-bakiye') renderBakiyeTable();
        document.querySelectorAll('#izinTakipApp .tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('#izinTakipApp .nav-btn').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('#izinTakipApp .module-subnav button').forEach(el => el.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        if (btn) btn.classList.add('active');
        document.querySelectorAll('#izinTakipApp .module-subnav button').forEach(el => {
fdLeaveAssert(false);
 if (el.getAttribute('onclick').includes(tabId)) el.classList.add('active'); });
    }
let izinIslemde = false;
let hesaplananNetGun = 0;
function personelSelectDoldur() {
fdLeaveAssert(false);

        const select = document.getElementById('izinPersonelSelect');
        const datalist = document.getElementById('izinPersonelDatalist');
        const mevcutSecim = select.value;
        select.innerHTML = '<option value="">-- Personel Seçiniz --</option>';
        datalist.innerHTML = '';
        personeller
            .filter(p => {
fdLeaveAssert(false);

                const cikis = String(p.cikisTarihi ?? '').trim().toLocaleLowerCase('tr-TR');
                const aktif = !cikis || ['null','undefined','-','0000-00-00'].includes(cikis);
                return aktifSirketeAit(p) && aktif && (!isPersonelUser() || String(p.id) === String(activeUser.tcNo));
            })
            .sort((a, b) => {
fdLeaveAssert(false);

                const subeSirasi = String(a.sube || 'Merkez').localeCompare(String(b.sube || 'Merkez'), 'tr', { sensitivity: 'base' });
                return subeSirasi || String(a.ad || '').localeCompare(String(b.ad || ''), 'tr', { sensitivity: 'base' });
            })
            .forEach(p => {
fdLeaveAssert(false);

                const etiket = `${p.ad || 'İsimsiz Personel'} · ${p.sube || 'Merkez'} · ${p.id}`;
                const option = document.createElement('option');
                option.value = String(p.id);
                option.textContent = etiket;
                option.dataset.etiket = etiket;
                select.appendChild(option);
                const aramaOption = document.createElement('option');
                aramaOption.value = etiket;
                aramaOption.dataset.personelId = String(p.id);
                datalist.appendChild(aramaOption);
            });
        if ([...select.options].some(option => option.value === mevcutSecim)) select.value = mevcutSecim;
    }
function izinPersonelAramaliSecimYap(secimiTamamla = false) {
fdLeaveAssert(false);

        const select = document.getElementById('izinPersonelSelect');
        const kutu = document.getElementById('izinPersonelSecimKutusu');
        const arama = String(kutu.value || '').trim().toLocaleLowerCase('tr-TR');
        const secenekler = [...select.options].slice(1);
        let eslesen = secenekler.find(option => String(option.dataset.etiket || '').toLocaleLowerCase('tr-TR') === arama);
        if (!eslesen && secimiTamamla) {
            const bulunanlar = secenekler.filter(option => String(option.dataset.etiket || '').toLocaleLowerCase('tr-TR').includes(arama));
            if (bulunanlar.length === 1) eslesen = bulunanlar[0];
        }
        if (!eslesen) {
            select.value = '';
            return;
        }
        select.value = eslesen.value;
        kutu.value = eslesen.dataset.etiket || eslesen.textContent;
        if (String(kutu.dataset.seciliPersonel || '') === String(select.value)) return;
        personelSecildi(select.value);
    }
function izinTuruDegisti() {
fdLeaveAssert(false);

        const tur = document.getElementById('izinTur').value;
        const group = document.getElementById('donemGroup');
        const donemSel = document.getElementById('izinDonem');
        const mazeretsizMi = tur === 'Mazeretsiz İzin';
        const raporMu = tur === 'Sağlık / Rapor';
        const yillikMi = tur === 'Yıllık İzin';
        document.getElementById('izinSebepGroup').style.display = (mazeretsizMi || raporMu || yillikMi) ? 'none' : 'block';
        document.getElementById('raporBilgiGroup').style.display = raporMu ? 'block' : 'none';
        document.getElementById('mazeretsizSahitGroup').style.display = mazeretsizMi ? 'block' : 'none';
        document.getElementById('iseBaslamaGroup').style.display = mazeretsizMi ? 'none' : 'block';
        document.getElementById('iseBaslama').required = !mazeretsizMi;
        if (!document.getElementById('iEditId').value) document.getElementById('btnIzinSubmit').innerText = raporMu ? 'Raporu Kaydet' : (mazeretsizMi ? 'Tutanağı Kaydet & Önizle' : 'İzin Kaydet & Dilekçe Önizle');
        ['mazeretsizSahit1', 'mazeretsizSahit2', 'mazeretsizSahit3'].forEach(id => document.getElementById(id).required = false);
        if (tur === 'Yıllık İzin') {
            group.style.display = 'block';
            donemSel.setAttribute('required', 'required');
        } else {
            group.style.display = 'none';
            donemSel.removeAttribute('required');
            donemSel.value = '';
        }
        mazeretsizSahitleriDoldur(document.getElementById('izinPersonelSelect').value);
        baslangicTarihiDegisti();
    }
function mazeretsizSahitleriDoldur(pId) {
fdLeaveAssert(false);

        const secili = personeller.find(item => String(item.id) === String(pId));
        const sahitSelectleri = ['mazeretsizSahit1', 'mazeretsizSahit2', 'mazeretsizSahit3'].map(id => document.getElementById(id));
        sahitSelectleri.forEach(select => {
fdLeaveAssert(false);

            const oncekiDeger = select.value;
            const adaylar = secili ? personeller.filter(p => aktifSirketeAit(p) && !p.cikisTarihi && String(p.id) !== String(secili.id) && String(p.sube || '') === String(secili.sube || '')) : [];
            select.innerHTML = `<option value="">${secili ? 'Şahit seçin' : 'Önce personel seçin'}</option>` + adaylar
                .sort((a, b) => String(a.ad || '').localeCompare(String(b.ad || ''), 'tr'))
                .map(p => `<option value="${p.id}">${p.ad} · T.C.: ${p.id}</option>`).join('');
            if (adaylar.some(p => String(p.id) === String(oncekiDeger))) select.value = oncekiDeger;
        });
    }
function mazeretsizSahitDegisti(select) {
fdLeaveAssert(false);

        const secilenler = ['mazeretsizSahit1', 'mazeretsizSahit2', 'mazeretsizSahit3'].map(id => document.getElementById(id).value).filter(Boolean);
        if (new Set(secilenler).size !== secilenler.length) {
            alert('Aynı çalışan birden fazla şahit olarak seçilemez.');
            select.value = '';
        }
    }
function mazeretsizSahitleriGetir() {
fdLeaveAssert(false);

        const secilenler = ['mazeretsizSahit1', 'mazeretsizSahit2', 'mazeretsizSahit3'].map(id => document.getElementById(id).value).filter(Boolean);
        if (new Set(secilenler).size !== secilenler.length) return [];
        return secilenler.map(id => personeller.find(p => String(p.id) === String(id))).filter(Boolean).map(p => ({ id: String(p.id), ad: p.ad || '-' }));
    }
function personelSecildi(pId) {
fdLeaveAssert(false);

        const secimKutusu = document.getElementById('izinPersonelSecimKutusu');
        const gizliSelect = document.getElementById('izinPersonelSelect');
        if (secimKutusu) secimKutusu.dataset.seciliPersonel = String(pId || '');
        if (pId) {
            gizliSelect.value = String(pId);
            const option = [...gizliSelect.options].find(item => String(item.value) === String(pId));
            if (option && secimKutusu) secimKutusu.value = option.dataset.etiket || option.textContent;
        } else if (secimKutusu) {
            secimKutusu.value = '';
        }
        if (!pId) {
            document.getElementById('personelOzetCard').style.display = 'none';
            izinMTopluPersonelDegisti('');
            document.getElementById('izinDonem').innerHTML = '<option value="">-- Önce Personel Seçiniz --</option>';
            mazeretsizSahitleriDoldur('');
            document.getElementById('seciliPersonelGecmisBaslik').innerText = 'Seçili Personelin İzin Geçmişi';
            document.querySelector('#izinTabloGecmis tbody').innerHTML = '<tr><td colspan="7" style="text-align:center; color:#64748b;">Personel seçildiğinde izin geçmişi burada gösterilir.</td></tr>';
            izinPersonelNotunuFormaYukle('');
            return;
        }
        const p = personeller.find(item => String(item.id) === String(pId));
        if (p) {
            donemSeciminiGuncelle(p);
            mazeretsizSahitleriDoldur(p.id);
            personelOzetKutusunuGuncelle(p);
            tekPersonelGecmisiniCiz(p.id, p.ad);
            izinMTopluPersonelDegisti(p.id);
        }
    }
function donemSeciminiGuncelle(p) {
fdLeaveAssert(false);

        const donemSel = document.getElementById('izinDonem');
        donemSel.innerHTML = '<option value="">-- Dönem Seçiniz --</option>';
        const donemler = personelDonemleriniGetir(p);
        donemler.forEach(d => {
fdLeaveAssert(false);

            let kullanilan = izinler.filter(i => String(i.pId) === String(p.id) && i.donem === d.donem && i.tur === 'Yıllık İzin').reduce((s, x) => s + x.gun, 0);
            let kalan = d.hak - kullanilan;
            if (kalan > 0) {
                donemSel.innerHTML += `<option value="${d.donem}">${d.donem} Hakedişi (Kalan: ${kalan} Gün)</option>`;
            }
        });
    }
function personelOzetKutusunuGuncelle(p) {
fdLeaveAssert(false);

        const girisTarihFormatted = tarihFormati(p.girisTarihi);
        document.getElementById('ozetAd').innerText = `📊 ${p.ad} - İzin Durumu Özeti | İşe Giriş: ${girisTarihFormatted} (${p.sube || 'Merkez'})`;
        
        const hakedisBody = document.querySelector('#ozetHakedisTablo tbody');
        const kullanilanBadges = document.getElementById('ozetKullanilanBadges');
        
        hakedisBody.innerHTML = '';
        kullanilanBadges.innerHTML = '';

        const donemler = personelDonemleriniGetir(p);
        let aktifKalanDonemVarMi = false;
        let toplamKalanGenel = 0;

        if (donemler.length === 0) {
            hakedisBody.innerHTML = '<tr><td colspan="5"><em>Henüz 1 yılı dolmadığı için hakedişi yok.</em></td></tr>';
        } else {
            donemler.forEach(d => {
fdLeaveAssert(false);

                const kullanilan = izinler.filter(i => String(i.pId) === String(p.id) && i.donem === d.donem && i.tur === 'Yıllık İzin').reduce((s, x) => s + x.gun, 0);
                const kalan = d.hak - kullanilan;
                
                if (kalan > 0) {
                    aktifKalanDonemVarMi = true;
                    toplamKalanGenel += kalan;
                    let rozetHtml = '';

                    if (kullanilan === 0) {
                        rozetHtml = `<span class="badge badge-tam-kalan">Tam Kalan (${d.hak} Gün)</span>`;
                    } else {
                        rozetHtml = `<span class="badge badge-kismi-kalan">Kısmi (${d.hak} / ${kalan} Gün Kalan)</span>`;
                    }

                    hakedisBody.innerHTML += `
                        <tr>
                            <td><strong>${d.donem}</strong></td>
                            <td>${d.hak} Gün</td>
                            <td>${kullanilan} Gün</td>
                            <td><strong>${kalan} Gün</strong></td>
                            <td>${rozetHtml}</td>
                        </tr>
                    `;
                }
            });

            if (!aktifKalanDonemVarMi) {
                hakedisBody.innerHTML = '<tr><td colspan="5"><em>Kullanılabilir aktif yıllık izin hakkı kalmamıştır.</em></td></tr>';
            }
        }

        document.getElementById('genelToplamKalanDeger').innerText = `${toplamKalanGenel} Gün`;

        const turler = ['Yıllık İzin', 'Ücretli İzin', 'Sağlık / Rapor', 'Ücretsiz İzin', 'Mazeretsiz İzin', 'Doğum İzni', 'Evlenme İzni', 'Ölüm İzni'];
        let izinKullanilmisMi = false;

        turler.forEach(t => {
fdLeaveAssert(false);

            const topGun = izinler.filter(i => String(i.pId) === String(p.id) && i.tur === t).reduce((sum, i) => sum + i.gun, 0);
            if (topGun > 0) {
                izinKullanilmisMi = true;
                let badgeCls = getTurBadgeClass(t);
                kullanilanBadges.innerHTML += `<span class="ozet-badge ${badgeCls}">${t}: ${topGun} Gün</span>`;
            }
        });

        if (!izinKullanilmisMi) {
            kullanilanBadges.innerHTML = '<span style="font-size:0.8rem; color:#64748b;">Henüz izin kullanılmamış.</span>';
        }

        document.getElementById('personelOzetCard').style.display = 'block';
    }
function sendWhatsAppOzet() {
fdLeaveAssert(false);

        const pId = document.getElementById('izinPersonelSelect').value;
        if (!pId) {
            alert("Lütfen önce bir personel seçiniz.");
            return;
        }
        const p = personeller.find(x => String(x.id) === String(pId));
        const telefon = p?.telefon || p?.kurumsalTelefon;
        if (!p || !telefon) {
            alert("⚠️ Bu personelin kayıtlı bir telefon numarası bulunmuyor! Lütfen personel kartından telefon numarasını ekleyin.");
            return;
        }

        let metin = `*${p.ad}* - İzin ve Bakiye Durum Özeti\n`;
        metin += `İşe Giriş: ${tarihFormati(p.girisTarihi)} | Şube: ${p.sube || 'Merkez'}\n\n`;
        metin += `*🗓️ Kalan Yıllık İzin Hakları:*\n`;

        const donemler = personelDonemleriniGetir(p);
        let toplamKalanGenel = 0;
        donemler.forEach(d => {
fdLeaveAssert(false);

            let kullanilan = izinler.filter(i => String(i.pId) === String(p.id) && i.donem === d.donem && i.tur === 'Yıllık İzin').reduce((s, x) => s + x.gun, 0);
            let kalan = d.hak - kullanilan;
            if (kalan > 0) {
                toplamKalanGenel += kalan;
                metin += `• ${d.donem}: *${kalan} Gün* Kalan\n`;
            }
        });

        metin += `\n*Toplam Kalan Yıllık İzin:* *${toplamKalanGenel} Gün*\n\n`;
        metin += `*📋 Kullanılan İzin Geçmişi (Tarih ve Günleri ile):*\n`;

        const izinNotu = String(p.izinNotu || '').trim();
        if (izinNotu) metin += '*📝 İzinlerle İlgili Ek Not:* ' + izinNotu + '\n\n';

        const pIzinleri = izinler
            .filter(i => String(i.pId) === String(pId))
            .sort((a, b) => new Date(b.baslangic) - new Date(a.baslangic));

        if (pIzinleri.length === 0) {
            metin += `_Kayıtlı geçmiş izin bulunmuyor._\n`;
        } else {
            pIzinleri.forEach(i => {
fdLeaveAssert(false);

                metin += `• [${i.tur}] ${tarihFormati(i.baslangic)} - ${tarihFormati(i.bitis)} (*${i.gun} Gün*)`;
                if (i.donem && i.donem !== '-') {
                    metin += ` (${i.donem})`;
                }
                metin += `\n`;
            });
        }

        metin += `\n_FD YAZILIM Bilgilendirme Sistemidir._`;

        let temizTel = String(telefon).replace(/\D/g, '');
        if (temizTel.startsWith('0')) {
            temizTel = '9' + temizTel;
        } else if (!temizTel.startsWith('90')) {
            temizTel = '90' + temizTel;
        }

        const url = `https:\x2f\x2fwa.me/${temizTel}?text=${encodeURIComponent(metin)}`;
        const pencere = window.open(url, '_blank');
        if (!pencere) window.location.assign(url);
    }
function izinOzetDosyaAdi(uzanti) {
fdLeaveAssert(false);

        const pId = document.getElementById('izinPersonelSelect').value;
        const personel = personeller.find(p => String(p.id) === String(pId));
        const ad = String(personel?.ad || 'Personel')
            .replace(/[\\/:*?"<>|]/g, '_')
            .replace(/\s+/g, '_');
        return `${ad}_Izin_Durumu_Ozeti.${uzanti}`;
    }
function seciliPersonelIzinCiktiVerisi() {
fdLeaveAssert(false);

        const pId=document.getElementById('izinPersonelSelect').value,personel=personeller.find(p=>String(p.id)===String(pId));
        if(!personel)return null;
        const gecmis=izinler.filter(i=>String(i.pId)===String(pId)).sort((a,b)=>new Date(b.baslangic)-new Date(a.baslangic));
        const hakedis=personelDonemleriniGetir(personel).map(d=>{
fdLeaveAssert(false);
const kullanilan=izinler.filter(i=>String(i.pId)===String(personel.id)&&i.donem===d.donem&&i.tur==='Yıllık İzin').reduce((s,x)=>s+Number(x.gun||0),0);return{...d,kullanilan,kalan:d.hak-kullanilan}}).filter(d=>d.kalan>0);
        return{personel,gecmis,hakedis,toplamKalan:hakedis.reduce((t,d)=>t+d.kalan,0),kullanilanOzet:document.getElementById('ozetKullanilanBadges').innerText.trim()||'Henüz izin kullanılmamış.',izinNotu:String(personel.izinNotu||'').trim()||'-'};
    }
function exportIzinOzetExcel() {
fdLeaveAssert(false);

        const veri=seciliPersonelIzinCiktiVerisi();if(!veri)return alert('Lütfen önce bir personel seçin.');
        const ozetSatirlari=[['PERSONEL İZİN DURUMU ÖZETİ'],['Personel',veri.personel.ad],['İşe Giriş',tarihFormati(veri.personel.girisTarihi)],['Şube',veri.personel.sube||'Merkez'],['Toplam Kalan Yıllık İzin',veri.toplamKalan+' Gün'],['Kullandığı İzin Toplamları',veri.kullanilanOzet],['İzinlerle İlgili Ek Not',veri.izinNotu],[],['AKTİF VE KALAN YILLIK İZİN HAKEDİŞLERİ'],['Dönem','Toplam Hak','Kullanılan','Kalan','Durum'],...veri.hakedis.map(d=>[d.donem,d.hak+' Gün',d.kullanilan+' Gün',d.kalan+' Gün',d.kullanilan?'Kısmi kullanım':'Tam kalan'])];
        if(!veri.hakedis.length)ozetSatirlari.push(['Aktif yıllık izin hakedişi bulunmuyor.']);
        const gecmisSatirlari=[['#','İzin Türü','Dönem','Başlangıç','Bitiş','Süre','Rapor / Açıklama'],...veri.gecmis.map((i,index)=>[index+1,i.tur||'-',i.donem||'-',tarihFormati(i.baslangic),tarihFormati(i.bitis),Number(i.gun||0)+' Gün',izinGecmisAciklamaMetni(i)])];
        if(!veri.gecmis.length)gecmisSatirlari.push(['','','','','','','Kayıtlı geçmiş izin bulunmuyor.']);
        const wb=XLSX.utils.book_new(),wsOzet=XLSX.utils.aoa_to_sheet(ozetSatirlari),wsGecmis=XLSX.utils.aoa_to_sheet(gecmisSatirlari);
        wsOzet['!cols']=[{wch:34},{wch:72},{wch:16},{wch:16},{wch:22}];wsGecmis['!cols']=[{wch:6},{wch:22},{wch:15},{wch:15},{wch:15},{wch:12},{wch:55}];
        XLSX.utils.book_append_sheet(wb,wsOzet,'İzin Özeti');XLSX.utils.book_append_sheet(wb,wsGecmis,'Geçmiş İzinler');XLSX.writeFile(wb,izinOzetDosyaAdi('xlsx'));
    }
function exportIzinOzetPdf() {
fdLeaveAssert(false);

        const veri=seciliPersonelIzinCiktiVerisi();if(!veri)return alert('Lütfen önce bir personel seçin.');
        const alan=document.createElement('div'),satirlar=[];
        veri.hakedis.forEach(d=>satirlar.push(['Yıllık İzin Hakedişi',d.donem,'-',d.hak+' Gün',d.kullanilan+' Gün',d.kalan+' Gün kalan'+(d.kullanilan?' · Kısmi kullanım':' · Tam kalan')]));
        if(!veri.hakedis.length)satirlar.push(['Yıllık İzin Hakedişi','-','-','-','-','Aktif hakediş bulunmuyor.']);
        veri.gecmis.forEach(i=>satirlar.push(['Geçmiş İzin',i.tur||'-',tarihFormati(i.baslangic)+' – '+tarihFormati(i.bitis),Number(i.gun||0)+' Gün',i.donem||'-',izinGecmisAciklamaMetni(i)]));
        if(!veri.gecmis.length)satirlar.push(['Geçmiş İzin','-','-','-','-','Kayıtlı geçmiş izin bulunmuyor.']);
        satirlar.push(['Genel Özet','Toplam Kalan','-',veri.toplamKalan+' Gün','-',veri.kullanilanOzet]);
        if(veri.izinNotu!=='-')satirlar.push(['Ek Not','-','-','-','-',veri.izinNotu]);
        alan.innerHTML='<table><thead><tr><th>Bölüm</th><th>Tür / Dönem</th><th>Tarih Aralığı</th><th>Süre / Hak</th><th>Kullanılan / Dönem</th><th>Açıklama</th></tr></thead><tbody>'+satirlar.map(s=>'<tr>'+s.map(v=>'<td>'+escapeDashboardText(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
        return fdLeavePDF(alan.querySelector('table'),veri.personel.ad+' · İZİN DURUMU VE GEÇMİŞİ',izinOzetDosyaAdi('pdf'),{yon:'landscape',ilkKolonGenislik:'15%',altBaslik:'Personel İzin Durumu ve Geçmişi',fdIsCurrent:fdLeaveValid});
    }
function izinPersonelNotunuFormaYukle(pId) {
fdLeaveAssert(false);

        const menu = document.getElementById('izinPersonelNotMenu');
        const alan = document.getElementById('izinPersonelNotu');
        const buton = document.getElementById('izinPersonelNotKaydetBtn');
        if (!menu || !alan) return;
        const personel = personeller.find(p => String(p.id) === String(pId));
        menu.dataset.personelId = personel ? String(personel.id) : '';
        menu.style.display = personel && !isPersonelUser() ? 'block' : 'none';
        alan.value = personel?.izinNotu || '';
        alan.readOnly = isPersonelUser();
        if (buton) buton.style.display = isPersonelUser() ? 'none' : 'inline-flex';
    }
async function izinPersonelNotunuKaydet() {
try{
fdLeaveAssert(true);

        if (isPersonelUser()) return showToast('Personel hesab\u0131n\u0131n not de\u011fi\u015ftirme yetkisi yoktur.', 'warning');
        const menu=document.getElementById('izinPersonelNotMenu'),alan=document.getElementById('izinPersonelNotu');
        const personel=personeller.find(p=>String(p.id)===String(menu?.dataset.personelId||document.getElementById('izinPersonelSelect')?.value));
        if(!personel||!alan)return showToast('\u00d6nce personel se\u00e7in.','warning');
        const onceki=personel.izinNotu||'',yeniNot=alan.value.trim(),personelIndex=personeller.indexOf(personel);
        personel.izinNotu=yeniNot;
        try{
            yuklenenVeriler.add('personeller');
            if(SUPABASE_MODE&&supabaseClient&&activeUser?.sirketId){
                const legacyId=supabaseKayitAnahtari('personeller',personel,personelIndex);
                const payload={company_id:activeUser.sirketId,module:'personeller',legacy_id:legacyId,record_year:supabaseKayitYili('personeller',personel),employee_legacy_id:supabasePersonelKimligi(personel,'personeller')||null,data:personel};
                const {error}=await fdLeaveAwait(supabaseClient.from('portal_records').upsert(payload,{onConflict:'company_id,module,legacy_id'}));if(error)throw error;
                const {data:kontrol,error:kontrolHatasi}=await fdLeaveAwait(supabaseClient.from('portal_records').select('data').eq('company_id',activeUser.sirketId).eq('module','personeller').eq('legacy_id',legacyId).maybeSingle());
                if(kontrolHatasi)throw kontrolHatasi;
                if(String(kontrol?.data?.izinNotu||'')!==yeniNot)throw new Error('\u0130zin notu veritaban\u0131nda do\u011frulanamad\u0131.');
                veriKayitGoruntusunuYenile('personeller');veriOnbelleginiKaydet();
            }else await fdLeaveAwait(verileriKaydet());
            personelOzetKutusunuGuncelle(personel);
            showToast('Personelin izin notu kaydedildi.','success');
        }catch(error){if(!fdLeaveValid())return;

            personel.izinNotu=onceki;alan.value=onceki;showToast('\u0130zin notu kaydedilemedi: '+(error.message||error),'error');
        }
    
}catch(fdLeaveError){if(!fdLeaveValid())return;throw fdLeaveError;}
}
function tekPersonelGecmisiniCiz(pId, pAd) {
fdLeaveAssert(false);

        const body = document.querySelector('#izinTabloGecmis tbody');
        body.innerHTML = '';
        izinPersonelNotunuFormaYukle(pId);
        document.getElementById('seciliPersonelGecmisBaslik').innerText = `📝 ${pAd} - Geçmiş İzinler`;
        
        const pIzinleri = izinler
            .filter(i => String(i.pId) === String(pId))
            .sort((a, b) => new Date(b.baslangic) - new Date(a.baslangic));

        if (pIzinleri.length === 0) {
            body.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#64748b;">Kayıtlı izin yok.</td></tr>';
            return;
        }
        pIzinleri.forEach((i, idx) => {
fdLeaveAssert(false);

            let badgeCls = getTurBadgeClass(i.tur);
            if (isPersonelUser()) {
                body.innerHTML += `
                    <tr>
                        <td>${idx + 1}</td>
                        <td><span class="badge ${badgeCls}">${i.tur}</span></td>
                        <td>${i.donem || '-'}</td>
                        <td>${tarihFormati(i.baslangic)} - ${tarihFormati(i.bitis)}</td>
                        <td><strong>${i.gun} Gün</strong></td>
                        <td>${izinGecmisAciklamaHtml(i)}</td>
                        <td><span style="color:#64748b;font-weight:700;">Salt okunur</span></td>
                    </tr>
                `;
                return;
            }
            body.innerHTML += `
                <tr>
                    <td>${idx + 1}</td>
                    <td><span class="badge ${badgeCls}">${i.tur}</span></td>
                    <td>${i.donem || '-'}</td>
                    <td>${tarihFormati(i.baslangic)} - ${tarihFormati(i.bitis)}</td>
                    <td><strong>${i.gun} Gün</strong></td>
                        <td>${izinGecmisAciklamaHtml(i)}</td>
                    <td class="action-btns">
                        <button class="btn-modern btn-edit-modern" onclick='izinDuzenle(${JSON.stringify(i)})'>✏️ Düzenle</button>
                        ${i.tur === 'Sağlık / Rapor' ? '' : `<button class="btn-modern btn-print-modern" onclick='dilekceTekrarBas(${JSON.stringify(i)})'>📄 ${i.tur === 'Mazeretsiz İzin' ? 'Tutanak' : 'Dilekçe'}</button>`}
                        <button type="button" class="btn-modern btn-del-modern" onclick="izinSil('${escapeDashboardText(String(i.id))}',this)">🗑️ Sil</button>
                    </td>
                </tr>
            `;
        });
    }
function izinDuzenle(izinObj) {
fdLeaveAssert(true);

        if (isPersonelUser()) {
            showToast('Personel hesabının kayıt değiştirme yetkisi yoktur.', 'warning');
            return;
        }
        const personelSelect = document.getElementById('izinPersonelSelect');
        const donemSelect = document.getElementById('izinDonem');
        switchIzinTab('i-tab-form', document.getElementById('btnNavForm'));

        document.getElementById('iEditId').value = izinObj.id;
        personelSelect.value = String(izinObj.pId);
        personelSecildi(String(izinObj.pId));

        document.getElementById('izinTur').value = izinObj.tur;
        izinTuruDegisti();
        if (izinObj.tur === 'Mazeretsiz İzin') {
            mazeretsizSahitKaydiniDiziyeCevir(izinObj.sahitler).slice(0, 3).forEach((sahit, index) => {
fdLeaveAssert(false);

                const select = document.getElementById(`mazeretsizSahit${index + 1}`);
                if (select) select.value = String(sahit.id || '');
            });
        }

        if (izinObj.tur === 'Yıllık İzin') {
            donemSelect.value = izinObj.donem;
        }

        document.getElementById('izinBaslangic').value = String(izinObj.baslangic).split('T')[0];
        baslangicTarihiDegisti();
        document.getElementById('izinBitis').value = String(izinObj.bitis).split('T')[0];
        document.getElementById('iseBaslama').value = String(izinObj.iseBaslama).split('T')[0];
        document.getElementById('izinSebep').value = izinObj.sebep || varsayilanIzinSebebi();
        document.getElementById('raporBilgisi').value = izinObj.raporBilgisi || '';

        document.getElementById('btnIzinSubmit').innerText = 'Güncellemeyi Kaydet';
        document.getElementById('btnIzinCancel').style.display = 'block';

        hesaplaIzinTarihleri();
    }
function izinFormReset() {
fdLeaveDraftId=null;

fdLeaveAssert(false);

        document.getElementById('iEditId').value = '';
        document.getElementById('izinForm').reset();
        document.getElementById('btnIzinSubmit').innerText = 'İzin Kaydet & Dilekçe Yazdır';
        document.getElementById('btnIzinCancel').style.display = 'none';
        document.getElementById('calcInfo').style.display = 'none';
        document.getElementById('izinBitis').removeAttribute('max');
        document.getElementById('raporBilgisi').value = '';
        ['mazeretsizSahit1', 'mazeretsizSahit2', 'mazeretsizSahit3'].forEach(id => document.getElementById(id).value = '');
        izinTuruDegisti();
    }
function dilekceTekrarBas(izinObjesi) {
fdLeaveAssert(false);

        dilekceHazirla(izinObjesi);
    }
function baslangicTarihiDegisti() {
fdLeaveAssert(false);

        const bas = document.getElementById('izinBaslangic').value;
        const bitInput = document.getElementById('izinBitis');
        const tur = document.getElementById('izinTur').value;
        const pId = document.getElementById('izinPersonelSelect').value;
        const donemSecim = document.getElementById('izinDonem').value;

        if (!bas) {
            bitInput.removeAttribute('min');
            bitInput.removeAttribute('max');
            delete bitInput.dataset.azamiBitis;
            return;
        }

        bitInput.removeAttribute('min');
        bitInput.removeAttribute('max');

        let maxNetGun = 999;
        if (tur === 'Doğum İzni') maxNetGun = ayarSayisi('dogumIzinGunu', 5);
        else if (tur === 'Evlenme İzni') maxNetGun = ayarSayisi('evlenmeIzinGunu', 3);
        else if (tur === 'Ölüm İzni') maxNetGun = ayarSayisi('olumIzinGunu', 3);
        else if (tur === 'Yıllık İzin' && pId && donemSecim) {
            const p = personeller.find(x => String(x.id) === String(pId));
            const donemler = personelDonemleriniGetir(p);
            const dObj = donemler.find(d => d.donem === donemSecim);
            if (dObj) {
                const editIdVal = document.getElementById('iEditId').value;
                const mevcutId = editIdVal ? parseInt(editIdVal) : null;
                let kullanilan = izinler.filter(i => String(i.pId) === String(pId) && i.donem === donemSecim && i.tur === 'Yıllık İzin' && i.id !== mevcutId).reduce((s, x) => s + x.gun, 0);
                maxNetGun = dObj.hak - kullanilan;
            }
        }

        let tatilDus = ['Yıllık İzin', 'Ücretli İzin', 'Evlenme İzni', 'Doğum İzni', 'Ölüm İzni'].includes(tur);
        let curr = new Date(bas);
        let sayilanNet = 0;
        let sonGecerliTarih = new Date(bas);

        for (let safety = 0; safety < 365; safety++) {
            let isRest = tatilDus && isTatil(curr);
            if (!isRest) {
                sayilanNet++;
            }
            sonGecerliTarih = new Date(curr);
            if (sayilanNet >= maxNetGun) {
                break;
            }
            curr.setDate(curr.getDate() + 1);
        }

        let maxDateStr = sonGecerliTarih.toISOString().split('T')[0];
        bitInput.dataset.azamiBitis = maxDateStr;

        hesaplaIzinTarihleri();
    }
function bitisTarihiKisitiniGuncelle() {
fdLeaveAssert(false);

        baslangicTarihiDegisti();
    }
function hesaplaIzinTarihleri() {
fdLeaveAssert(false);

        const bas = document.getElementById('izinBaslangic').value;
        const bit = document.getElementById('izinBitis').value;
        const tur = document.getElementById('izinTur').value;
        const info = document.getElementById('calcInfo');
        hesaplananNetGun = 0; info.style.display = 'none';
        if (!bas || !bit) return;

        let dStart = new Date(bas), dEnd = new Date(bit);
        if (dEnd < dStart) {
            info.style.display = 'block';
            info.style.background = '#fff7ed';
            info.style.borderColor = '#fdba74';
            info.style.color = '#9a3412';
            info.textContent = 'Bitiş tarihi başlangıç tarihinden önce olamaz.';
            return;
        }
        const azamiBitis = document.getElementById('izinBitis').dataset.azamiBitis || '';
        if (azamiBitis && bit > azamiBitis) {
            info.style.display = 'block';
            info.style.background = '#fff7ed';
            info.style.borderColor = '#fdba74';
            info.style.color = '#9a3412';
            info.textContent = 'Bu izin için seçilebilecek son bitiş tarihi: ' + tarihFormati(azamiBitis);
            return;
        }

        let tatilDus = ['Yıllık İzin', 'Ücretli İzin', 'Evlenme İzni', 'Doğum İzni', 'Ölüm İzni'].includes(tur);
        let net = 0, tatilSayisi = 0, curr = new Date(dStart);
        while (curr <= dEnd) {
            if (tatilDus && isTatil(curr)) tatilSayisi++;
            else net++;
            curr.setDate(curr.getDate() + 1);
        }
        hesaplananNetGun = net;

        let nextWork = new Date(dEnd);
        nextWork.setDate(nextWork.getDate() + 1);
        while (isTatil(nextWork)) nextWork.setDate(nextWork.getDate() + 1);

        document.getElementById('iseBaslama').value = nextWork.toISOString().split('T')[0];
        info.style.display = 'block';
        info.style.background = '#f0fdf4';
        info.style.borderColor = '#bbf7d0';
        info.style.color = '#166534';
        info.innerHTML = `Net İzin Süresi: <strong>${net} Gün</strong> ${tatilSayisi > 0 ? `(${tatilSayisi} gün tatil/pazar düşüldü)` : ''}`;
    }
function izindeCakisinaIzinVarMi(pId, yeniBaslangicStr, yeniBitisStr, mevcutIzinId = null) {
fdLeaveAssert(false);

        const yeniBas = new Date(yeniBaslangicStr);
        const yeniBit = new Date(yeniBitisStr);
        const pIzinleri = izinler.filter(i => String(i.pId) === String(pId) && i.id !== mevcutIzinId);

        for (let i of pIzinleri) {
            const varBas = new Date(i.baslangic);
            const varBit = new Date(i.bitis);
            if (yeniBas <= varBit && yeniBit >= varBas) {
                return i;
            }
        }
        return null;
    }
let izinMTopluAtamaSayaci = 0;
let izinMTopluDurum = { pId:'', ay:'', mGunleri:[], secili:new Set(), atamalar:new Map() };
function izinMTopluPersonelDegisti(pId) {
fdLeaveAssert(false);

        const kart = document.getElementById('izinMTopluCard');
        if (!kart) return;
        const goster = Boolean(pId) && isManagerUser();
        kart.style.display = goster ? 'block' : 'none';
        if (!goster) {
            izinMTopluDurum = { pId:'', ay:'', mGunleri:[], secili:new Set(), atamalar:new Map() };
            return;
        }
        const ayInput = document.getElementById('izinMTopluAy');
        if (!ayInput.value) ayInput.value = new Date().toISOString().slice(0,7);
        if (String(izinMTopluDurum.pId) !== String(pId)) {
            izinMTopluDurum = { pId:String(pId), ay:ayInput.value, mGunleri:[], secili:new Set(), atamalar:new Map() };
            document.getElementById('izinMTopluGunler').innerHTML = '';
            document.getElementById('izinMTopluAtananlar').innerHTML = '';
            document.getElementById('izinMTopluAtama').style.display = 'none';
            document.getElementById('izinMTopluBilgi').textContent = 'Ayı seçip M günlerini getirin.';
            document.getElementById('izinMTopluSayac').textContent = '0 gün';
        }
        izinMTopluDonemleriDoldur();
    }
function izinMTopluPuantajKodu(personel, tarihKey) {
fdLeaveAssert(false);

        const izin = izinler.find(i => aktifSirketeAit(i) && String(i.pId) === String(personel.id) && tarihKey >= String(i.baslangic).slice(0,10) && tarihKey <= String(i.bitis).slice(0,10));
        if (izin) return 'İZİN';
        const manuel = puantajVerileri.find(item => aktifSirketeAit(item) && !item.kayitTipi && String(item.pId) === String(personel.id) && String(item.tarih).slice(0,10) === tarihKey);
        if (manuel?.durum) return String(manuel.durum).toLocaleUpperCase('tr-TR');
        const tarih = new Date(tarihKey + 'T00:00:00');
        const iseGiris = tarihInputDegeri(personel.girisTarihi);
        const istenCikis = tarihInputDegeri(personel.cikisTarihi);
        if ((iseGiris && tarihKey < iseGiris) || (istenCikis && tarihKey > istenCikis)) return '-';
        const mmdd = tarihKey.slice(5);
        let kod = tarih.getDay() === 0 ? 'HS' : (sabitResmiTatiller.includes(mmdd) ? 'RT' : '');
        const cihazGunTuru = typeof magicpassGunTuruBul === 'function' ? magicpassGunTuruBul(personel, tarihKey) : '';
        if (cihazGunTuru === 'pazar') kod = 'HS';
        else if (cihazGunTuru === 'resmiTatil') kod = 'RT';
        const hesap = magicpassGunHesapla(personel, tarihKey);
        if (hesap.giris || hesap.cikis) return kod === 'HS' ? 'PZ' : (kod === 'RT' ? 'RC' : 'X');
        if (hesap.pazarHakkiYok) return 'M';
        if (hesap.durum === 'Gelmedi' && kod !== 'HS' && kod !== 'RT') return 'M';
        return kod;
    }
async function izinMTopluGunleriYukle(yenile = false) {
try{
fdLeaveAssert(false);

        if (!isManagerUser()) return;
        const pId = document.getElementById('izinPersonelSelect').value;
        const ay = document.getElementById('izinMTopluAy').value;
        const bilgi = document.getElementById('izinMTopluBilgi');
        if (!pId || !ay) { showToast('Önce personel ve ay seçin.', 'warning'); return; }
        const personel = personeller.find(p => String(p.id) === String(pId));
        if (!personel) return;
        const yil = ay.slice(0,4);
        fdLeaveShowOverlay('M günleri hazırlanıyor', `${personel.ad || 'Personel'} için ${ay} puantajı kontrol ediliyor...`);
        try {
            if (yenile || String(aktifKayitYili) !== String(yil)) await fdLeaveAwait(driveVerileriniYukleBaslangicta('puantaj', yil));
            const gunSayisi = new Date(Number(yil), Number(ay.slice(5,7)), 0).getDate();
            const mGunleri = [];
            for (let gun=1; gun<=gunSayisi; gun++) {
                const tarih = ay + '-' + String(gun).padStart(2,'0');
                if (izinMTopluPuantajKodu(personel, tarih) === 'M') mGunleri.push(tarih);
            }
            izinMTopluDurum = { pId:String(pId), ay, mGunleri, secili:new Set(), atamalar:new Map() };
            bilgi.textContent = mGunleri.length ? `${mGunleri.length} adet M günü bulundu. Günleri seçip aşağıdan izin türüne atayın.` : 'Bu ay için puantajda M görünen gün bulunamadı.';
            document.getElementById('izinMTopluAtama').style.display = mGunleri.length ? 'block' : 'none';
            izinMTopluDonemleriDoldur();
            izinMTopluCiz();
        } catch (error) {if(!fdLeaveValid())return;

            showToast('M günleri yüklenemedi: ' + (error.message || 'Bilinmeyen hata'), 'error');
        } finally { fdLeaveHideOverlay(); }
    
}catch(fdLeaveError){if(!fdLeaveValid())return;throw fdLeaveError;}
}
function izinMTopluGunSec(tarih) {
fdLeaveAssert(false);

        if (!izinMTopluDurum.mGunleri.includes(tarih)) return;
        const kaldirilacak = izinMTopluDurum.secili.has(tarih);
        const adaylar = (kaldirilacak ? [...izinMTopluDurum.secili].filter(gun => gun !== tarih) : [...izinMTopluDurum.secili, tarih]).sort();
        const kesintisiz = adaylar.every((gun,index) => {
fdLeaveAssert(false);

            if (!index) return true;
            const onceki = new Date(adaylar[index-1] + 'T00:00:00');
            onceki.setDate(onceki.getDate() + 1);
            return magicpassTarihAnahtari(onceki) === gun;
        });
        if (!kesintisiz) {
            showToast(kaldirilacak ? 'Arada boşluk oluşmaması için önce seçimin uç günlerinden kaldırın.' : 'Aynı grupta yalnızca birbirini takip eden günleri seçebilirsiniz. Bu günü ayrı bir işlem olarak ekleyin.', 'warning');
            return;
        }
        if (kaldirilacak) izinMTopluDurum.secili.delete(tarih); else izinMTopluDurum.secili.add(tarih);
        izinMTopluCiz();
    }
function izinMTopluTurDegisti() {
fdLeaveAssert(false);

        const yillik = document.getElementById('izinMTopluTur').value === 'Yıllık İzin';
        document.getElementById('izinMTopluDonemGroup').style.display = yillik ? 'block' : 'none';
        if (yillik) izinMTopluDonemleriDoldur();
    }
function izinMTopluDonemleriDoldur() {
fdLeaveAssert(false);

        const select = document.getElementById('izinMTopluDonem');
        if (!select) return;
        const onceki = select.value;
        const pId = document.getElementById('izinPersonelSelect')?.value || izinMTopluDurum.pId;
        const personel = personeller.find(p => String(p.id) === String(pId));
        const atanan = [...izinMTopluDurum.atamalar.values()];
        const secenekler = personel ? personelDonemleriniGetir(personel).map(d => {
fdLeaveAssert(false);

            const kullanilan = izinler.filter(i => String(i.pId) === String(pId) && i.tur === 'Yıllık İzin' && i.donem === d.donem).reduce((t,i) => t + Number(i.gun || 0), 0);
            const taslak = atanan.filter(a => a.tur === 'Yıllık İzin' && a.donem === d.donem).length;
            return { donem:d.donem, kalan:Math.max(0, d.hak - kullanilan - taslak) };
        }).filter(d => d.kalan > 0) : [];
        select.innerHTML = '<option value="">-- Dönem Seçin --</option>' + secenekler.map(d => `<option value="${d.donem}">${d.donem} (Taslak sonrası kalan: ${d.kalan} gün)</option>`).join('');
        if (secenekler.some(d => d.donem === onceki)) select.value = onceki;
    }
function izinMTopluSecilenleriAta() {
fdLeaveAssert(false);

        const tarihler = [...izinMTopluDurum.secili].sort();
        if (!tarihler.length) { showToast('Önce en az bir M günü seçin.', 'warning'); return; }
        const tur = document.getElementById('izinMTopluTur').value;
        const donem = tur === 'Yıllık İzin' ? document.getElementById('izinMTopluDonem').value : '-';
        if (tur === 'Yıllık İzin' && !donem) { showToast('Yıllık izin için hakediş dönemini seçin.', 'warning'); return; }
        const sira = ++izinMTopluAtamaSayaci;
        const grupId = `${Date.now().toString(36)}-${sira}`;
        tarihler.forEach(tarih => izinMTopluDurum.atamalar.set(tarih, { tur, donem, grupId, sira }));
        izinMTopluDurum.secili.clear();
        izinMTopluDonemleriDoldur();
        izinMTopluCiz();
    }
function izinMTopluGrupListesi() {
fdLeaveAssert(false);

        const gruplar = new Map();
        [...izinMTopluDurum.atamalar.entries()].sort((a,b) => a[0].localeCompare(b[0])).forEach(([tarih,atama]) => {
fdLeaveAssert(false);

            const anahtar = atama.grupId || (atama.tur + '|' + atama.donem);
            if (!gruplar.has(anahtar)) gruplar.set(anahtar, { anahtar, ...atama, tarihler:[] });
            gruplar.get(anahtar).tarihler.push(tarih);
        });
        return [...gruplar.values()].sort((a,b) => Number(a.sira || 0) - Number(b.sira || 0));
    }
function izinMTopluAtamayiSil(kodluAnahtar) {
fdLeaveAssert(false);

        const anahtar = decodeURIComponent(kodluAnahtar);
        [...izinMTopluDurum.atamalar.entries()].forEach(([tarih,atama]) => {
fdLeaveAssert(false);

            const atamaAnahtari = atama.grupId || (atama.tur + '|' + atama.donem);
            if (atamaAnahtari === anahtar) izinMTopluDurum.atamalar.delete(tarih);
        });
        izinMTopluDonemleriDoldur();
        izinMTopluCiz();
    }
function izinMTopluCiz() {
fdLeaveAssert(false);

        const gunler = document.getElementById('izinMTopluGunler');
        if (!gunler) return;
        gunler.innerHTML = izinMTopluDurum.mGunleri.map(tarih => {
fdLeaveAssert(false);

            const atama = izinMTopluDurum.atamalar.get(tarih);
            const secili = izinMTopluDurum.secili.has(tarih);
            const gunAdi = new Date(tarih + 'T00:00:00').toLocaleDateString('tr-TR', { weekday:'short' });
            return `<button type="button" class="izin-m-toplu-gun${secili?' secili':''}${atama?' atanmis':''}" onclick="izinMTopluGunSec('${tarih}')"><span>${tarih.slice(8,10)}</span><small>${gunAdi}${fdYarimTatilSabahDevamsizMi(personeller.find(p=>String(p.id)===String(izinMTopluDurum.pId)),tarih) ? ' · 1 gün' : ''}${atama ? ' · ' + atama.tur.replace(' İzin','') : ''}</small></button>`;
        }).join('');
        const gruplar = izinMTopluGrupListesi();
        document.getElementById('izinMTopluAtananlar').innerHTML = gruplar.length ? gruplar.map(grup => `<div class="izin-m-toplu-satir"><span><strong>${escapeHtml(grup.tur)}</strong>${grup.donem !== '-' ? ` · ${escapeHtml(grup.donem)}` : ''}<br><small>${grup.tarihler.map(tarihFormati).join(', ')}</small></span><button type="button" onclick="izinMTopluAtamayiSil('${encodeURIComponent(grup.anahtar)}')">Kaldır</button></div>`).join('') : '<small style="color:#64748b;">Henüz bir izin türüne atanmış gün yok.</small>';
        document.getElementById('izinMTopluSayac').textContent = `${izinMTopluDurum.atamalar.size}/${izinMTopluDurum.mGunleri.length} gün atandı`;
        document.getElementById('izinMTopluKaydetBtn').disabled = izinMTopluDurum.atamalar.size === 0;
    }
function izinMTopluTemizle() {
fdLeaveAssert(false);

        izinMTopluDurum.secili.clear();
        izinMTopluDurum.atamalar.clear();
        izinMTopluDonemleriDoldur();
        izinMTopluCiz();
    }
function izinMTopluAraliklaraBol() {
fdLeaveAssert(false);

        const sonuc = [];
        izinMTopluGrupListesi().forEach(grup => {
fdLeaveAssert(false);

            let aralik = null;
            grup.tarihler.forEach(tarih => {
fdLeaveAssert(false);

                const oncekiErtesi = aralik ? new Date(aralik.bitis + 'T00:00:00') : null;
                if (oncekiErtesi) oncekiErtesi.setDate(oncekiErtesi.getDate() + 1);
                const bitisik = oncekiErtesi && magicpassTarihAnahtari(oncekiErtesi) === tarih;
                if (!aralik || !bitisik) {
                    aralik = { tur:grup.tur, donem:grup.donem, baslangic:tarih, bitis:tarih };
                    sonuc.push(aralik);
                } else aralik.bitis = tarih;
            });
        });
        return sonuc.sort((a,b) => a.baslangic.localeCompare(b.baslangic));
    }
function izinMTopluKayitlariHazirla() {
fdLeaveAssert(false);

        const pId = String(izinMTopluDurum.pId || '');
        const personel = personeller.find(p => String(p.id) === pId);
        if (!personel) throw new Error('Seçili personel bulunamadı.');
        const araliklar = izinMTopluAraliklaraBol();
        if (!araliklar.length) throw new Error('İzin türüne atanmış gün bulunmuyor.');
        const yillikKullanim = new Map();
        const kayitlar = araliklar.map((aralik,index) => {
fdLeaveAssert(false);

            if (izindeCakisinaIzinVarMi(pId, aralik.baslangic, aralik.bitis)) throw new Error(`${tarihFormati(aralik.baslangic)} tarihini kapsayan başka bir izin kaydı var.`);
            const gun = izinTopluNetGunHesapla(aralik.baslangic, aralik.bitis, aralik.tur);
            if (gun <= 0) throw new Error(`${tarihFormati(aralik.baslangic)} için net izin süresi hesaplanamadı.`);
            if (aralik.tur === 'Yıllık İzin') {
                const donem = personelDonemleriniGetir(personel).find(d => d.donem === aralik.donem);
                if (!donem) throw new Error(`${aralik.donem} hakediş dönemi geçerli değil.`);
                const mevcut = izinler.filter(i => String(i.pId) === pId && i.tur === 'Yıllık İzin' && i.donem === aralik.donem).reduce((t,i) => t + Number(i.gun || 0), 0);
                const taslak = Number(yillikKullanim.get(aralik.donem) || 0) + gun;
                if (mevcut + taslak > donem.hak) throw new Error(`${aralik.donem} yıllık izin bakiyesi yetersiz. Kalan: ${Math.max(0,donem.hak-mevcut)} gün.`);
                yillikKullanim.set(aralik.donem, taslak);
            }
            const azami = aralik.tur === 'Doğum İzni' ? ayarSayisi('dogumIzinGunu',5) : aralik.tur === 'Evlenme İzni' ? ayarSayisi('evlenmeIzinGunu',3) : aralik.tur === 'Ölüm İzni' ? ayarSayisi('olumIzinGunu',3) : 0;
            if (azami && gun > azami) throw new Error(`${aralik.tur} en fazla ${azami} gün olabilir.`);
            return { id:Date.now()+index, sirketId:aktifSirketId(), pId, tur:aralik.tur, donem:aralik.donem, gun, baslangic:aralik.baslangic, bitis:aralik.bitis, iseBaslama:izinTopluIseBaslamaHesapla(aralik.bitis, aralik.tur), sebep:aralik.tur === 'Yıllık İzin' ? '' : varsayilanIzinSebebi(), sahitler:[], raporBilgisi:'' };
        });
        for (let bas=0; bas<kayitlar.length;) {
            let son=bas;
            while (son+1 < kayitlar.length) {
                const ertesi = new Date(kayitlar[son].bitis + 'T00:00:00');
                ertesi.setDate(ertesi.getDate() + 1);
                if (magicpassTarihAnahtari(ertesi) !== kayitlar[son+1].baslangic) break;
                son++;
            }
            const ortakIseBaslama = izinTopluIseBaslamaHesapla(kayitlar[son].bitis, 'Ücretsiz İzin');
            for (let index=bas; index<=son; index++) kayitlar[index].iseBaslama = ortakIseBaslama;
            bas = son + 1;
        }
        return kayitlar;
    }
function izinMTopluKayitSonrasiSifirla(kayitlar) {
fdLeaveAssert(false);

        const kaydedilenGunler = new Set();
        (kayitlar || []).forEach(kayit => {
fdLeaveAssert(false);

            const baslangic = new Date(String(kayit.baslangic).slice(0,10) + 'T00:00:00');
            const bitis = new Date(String(kayit.bitis).slice(0,10) + 'T00:00:00');
            for (const gun = new Date(baslangic); gun <= bitis; gun.setDate(gun.getDate() + 1)) kaydedilenGunler.add(magicpassTarihAnahtari(gun));
        });
        izinMTopluDurum.mGunleri = izinMTopluDurum.mGunleri.filter(tarih => !kaydedilenGunler.has(tarih));
        izinMTopluDurum.secili.clear();
        izinMTopluDurum.atamalar.clear();
        const kalan = izinMTopluDurum.mGunleri.length;
        const bilgi = document.getElementById('izinMTopluBilgi');
        if (bilgi) bilgi.textContent = kalan ? `${kalan} işlem yapılmamış M günü kaldı.` : 'Seçilen aydaki M günlerinin izin kayıtları tamamlandı.';
        const atama = document.getElementById('izinMTopluAtama');
        if (atama) atama.style.display = kalan ? 'block' : 'none';
        const tur = document.getElementById('izinMTopluTur');
        if (tur) tur.value = 'Ücretsiz İzin';
        izinMTopluTurDegisti();
        izinMTopluCiz();
    }
async function izinMTopluKaydetVeYazdir() {
try{
fdLeaveAssert(true);

        if (!isManagerUser() || izinIslemde) return;
        let yeniIzinler;
        try { yeniIzinler = izinMTopluKayitlariHazirla(); }
        catch (error) {if(!fdLeaveValid())return;
 showToast(error.message || 'Toplu izinler hazırlanamadı.', 'error'); return; }
        if (!await fdLeaveAwait(fdYuzerOnaySor(`${yeniIzinler.length} izin kaydı oluşturulacak ve dilekçeleri toplu hazırlanacak. Devam edilsin mi?`, 'Toplu İzin Kaydı', 'Kaydet ve Hazırla'))) return;
        izinIslemde = true;
        fdLeaveShowOverlay('Toplu izinler kaydediliyor', `${yeniIzinler.length} kayıt buluta yazılıyor ve doğrulanıyor...`);
        try {
            izinBekleyenKayitlariEkle(yeniIzinler);
            izinler.push(...yeniIzinler);
            yuklenenVeriler.add('izinler');
            veriOnbelleginiKaydet();
            await fdLeaveAwait(verileriKaydet());
            await fdLeaveAwait(izinKayitlariniSupabaseDogrula(yeniIzinler));
            if (SUPABASE_MODE) await fdLeaveAwait(supabaseVerileriniYukle('izin'));
            izinKayitlariniYuklenenListedeDogrula(yeniIzinler);
            izinBekleyenKayitlariniSil(yeniIzinler);
            const pId = String(yeniIzinler[0].pId);
            initUI();
            document.getElementById('izinPersonelSelect').value = pId;
            personelSecildi(pId);
            izinMTopluKayitSonrasiSifirla(yeniIzinler);
            izinMTopluDilekceleriAc(yeniIzinler);
            showToast(`${yeniIzinler.length} izin kaydedildi; dilekçeler toplu hazırlandı.`);
            const bildirimSonucu=await fdLeaveAwait(personelIzinBildirimleriniPlanla(yeniIzinler.map(personelIzinBildirimiHazirla),fdLeaveValid));
            if(bildirimSonucu.basarisiz)showToast(bildirimSonucu.basarisiz+' izin WhatsApp bildirimi kuyruğa alınamadı.','warning');
            else if(bildirimSonucu.planlanan)showToast('WhatsApp mesajı '+izinBildirimBeklemeMetni()+' kuyruğa alındı.','success');
        } catch (error) {if(!fdLeaveValid())return;

            veriOnbelleginiKaydet();
            showToast('Toplu izin kaydı tamamlanamadı. Yerel kurtarma yedeği korundu: ' + (error.message || 'Bilinmeyen hata'), 'error');
        } finally { izinIslemde = false; fdLeaveHideOverlay(); }
    
}catch(fdLeaveError){if(!fdLeaveValid())return;throw fdLeaveError;}
}
const IZIN_TOPLU_AKTAR_BASLIKLARI = [
        'T.C. Kimlik No', 'Ad Soyad', 'İzin Türü', 'Hakediş Dönemi',
        'Başlangıç Tarihi', 'Bitiş Tarihi', 'Açıklama / Rapor Bilgisi'
    ];
const IZIN_TOPLU_AKTAR_TURLERI = [
        'Yıllık İzin', 'Ücretli İzin', 'Sağlık / Rapor', 'Ücretsiz İzin',
        'Mazeretsiz İzin', 'Doğum İzni', 'Evlenme İzni', 'Ölüm İzni'
    ];
let izinTopluAktarSatirlari = [];
function izinExcelSablonuIndir() {
fdLeaveAssert(false);

        if (typeof XLSX === 'undefined') {
            alert('Excel aracı yüklenemedi. İnternet bağlantısını kontrol edip sayfayı yenileyin.');
            return;
        }
        const ornekPersonel = personeller.find(p => aktifSirketeAit(p) && !p.cikisTarihi);
        const ornekDonem = ornekPersonel ? (personelDonemleriniGetir(ornekPersonel).slice(-1)[0]?.donem || '') : '';
        const ws = XLSX.utils.aoa_to_sheet([
            IZIN_TOPLU_AKTAR_BASLIKLARI,
            [String(ornekPersonel?.id || '12345678901'), ornekPersonel?.ad || 'AHMET YILMAZ',
             'Yıllık İzin', ornekDonem, new Date(2026,7,3), new Date(2026,7,7), '']
        ]);
        ws['!cols'] = [{wch:18},{wch:28},{wch:22},{wch:20},{wch:18},{wch:18},{wch:42}];
        ws['!autofilter'] = { ref:'A1:G2' };
        ws['A2'].t = 's';
        ['E2','F2'].forEach(adres => {
fdLeaveAssert(false);
 ws[adres].z = 'dd.mm.yyyy'; });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'İzinler');
        const aktifPersoneller = personeller.filter(p => aktifSirketeAit(p) && !p.cikisTarihi).sort((a,b) => String(a.ad || '').localeCompare(String(b.ad || ''), 'tr'));
        const bilgi = [
            ['İZİN TOPLU AKTARIM AÇIKLAMASI'],
            ['1', 'İzinler sayfasındaki örnek satırı silip izin kayıtlarını alt alta yazın.'],
            ['2', 'Sütun adlarını değiştirmeyin. T.C. Kimlik No, İzin Türü, Başlangıç ve Bitiş Tarihi zorunludur.'],
            ['3', 'Tarihleri gg.aa.yyyy biçiminde yazabilirsiniz. İşe Başlama Tarihini sistem izin bitişine göre otomatik hesaplar.'],
            ['4', 'Yıllık İzin için Hakediş Dönemi (ör. 2025-2026) zorunludur ve bakiye kontrol edilir.'],
            ['5', 'İzin türleri: ' + IZIN_TOPLU_AKTAR_TURLERI.join(', ')],
            ['6', 'Çakışan, bakiyesi yetersiz veya sınırı aşan izinler kaydedilmez.'],
            [], ['AKTİF PERSONELLER'], ['T.C. Kimlik No', 'Ad Soyad', 'Şube'],
            ...(aktifPersoneller.length ? aktifPersoneller.map(p => [String(p.id), p.ad || '', p.sube || '']) : [['Aktif personel bulunmuyor.']])
        ];
        const bilgiWs = XLSX.utils.aoa_to_sheet(bilgi);
        bilgiWs['!cols'] = [{wch:20},{wch:88},{wch:25}];
        XLSX.utils.book_append_sheet(wb, bilgiWs, 'Açıklama');
        XLSX.writeFile(wb, 'IZIN_TOPLU_AKTARIM_SABLONU.xlsx');
    }
function izinExcelDosyasiSec() {
fdLeaveAssert(false);

        if (!isManagerUser()) {
            alert('Toplu izin aktarımını yalnızca Admin veya Yönetici yapabilir.');
            return;
        }
        const input = document.getElementById('izinTopluExcelInput');
        input.value = '';
        input.click();
    }
function izinTopluTurunuCoz(deger) {
fdLeaveAssert(false);

        const normal = personelExcelBasliginiNormallestir(deger);
        const esAnlamlilar = {
            yillik:'Yıllık İzin', yillikizin:'Yıllık İzin',
            ucretli:'Ücretli İzin', ucretliizin:'Ücretli İzin',
            ucretsiz:'Ücretsiz İzin', ucretsizizin:'Ücretsiz İzin',
            rapor:'Sağlık / Rapor', saglik:'Sağlık / Rapor', saglikrapor:'Sağlık / Rapor', saglikizni:'Sağlık / Rapor', hastalik:'Sağlık / Rapor',
            mazeretsiz:'Mazeretsiz İzin', mazeretsizizin:'Mazeretsiz İzin',
            dogum:'Doğum İzni', dogumizni:'Doğum İzni',
            evlenme:'Evlenme İzni', evlilik:'Evlenme İzni', evlenmeizni:'Evlenme İzni',
            olum:'Ölüm İzni', olumizni:'Ölüm İzni'
        };
        return esAnlamlilar[normal] || IZIN_TOPLU_AKTAR_TURLERI.find(tur => personelExcelBasliginiNormallestir(tur) === normal) || '';
    }
function izinTopluNetGunHesapla(baslangic, bitis, tur) {
fdLeaveAssert(false);

        const bas = new Date(baslangic + 'T00:00:00');
        const son = new Date(bitis + 'T00:00:00');
        if (Number.isNaN(bas.getTime()) || Number.isNaN(son.getTime()) || son < bas) return 0;
        const tatilDus = ['Yıllık İzin','Ücretli İzin','Evlenme İzni','Doğum İzni','Ölüm İzni'].includes(tur);
        let gun = 0;
        for (const tarih = new Date(bas); tarih <= son; tarih.setDate(tarih.getDate() + 1)) if (!tatilDus || !isTatil(tarih)) gun++;
        return gun;
    }
function izinTopluIseBaslamaHesapla(bitis, tur) {
fdLeaveAssert(false);

        if (tur === 'Mazeretsiz İzin') return '';
        const tarih = new Date(bitis + 'T00:00:00');
        if (Number.isNaN(tarih.getTime())) return '';
        tarih.setDate(tarih.getDate() + 1);
        while (isTatil(tarih)) tarih.setDate(tarih.getDate() + 1);
        return tarih.getFullYear() + '-' + String(tarih.getMonth()+1).padStart(2,'0') + '-' + String(tarih.getDate()).padStart(2,'0');
    }
function izinTopluKayitlarCakisiyorMu(a, b) {
fdLeaveAssert(false);

        return String(a.pId) === String(b.pId) && a.baslangic <= b.bitis && a.bitis >= b.baslangic;
    }
async function izinExcelDosyasiniOku(input) {
try{
fdLeaveAssert(false);

        const dosya = input.files?.[0];
        if (!dosya) return;
        if (!isManagerUser()) { alert('Toplu izin aktarımını yalnızca Admin veya Yönetici yapabilir.'); return; }
        try {
            const wb = XLSX.read(await fdLeaveAwait(dosya.arrayBuffer()), { type:'array', cellDates:false });
            const ws = wb.Sheets['İzinler'] || wb.Sheets[wb.SheetNames[0]];
            const satirlar = XLSX.utils.sheet_to_json(ws, { header:1, raw:true, defval:'' });
            if (satirlar.length < 2) throw new Error('Excel dosyasında aktarılacak izin satırı bulunamadı.');
            const baslikHaritasi = new Map(satirlar[0].map((baslik,index) => [personelExcelBasliginiNormallestir(baslik), index]));
            const eksik = IZIN_TOPLU_AKTAR_BASLIKLARI.filter(b => !baslikHaritasi.has(personelExcelBasliginiNormallestir(b)));
            if (eksik.length) throw new Error('Şablonda şu sütunlar bulunamadı: ' + eksik.join(', '));
            const hucre = (satir, adlar) => personelExcelHucreDegeri(satir, baslikHaritasi, adlar);
            const hamKayitlar = satirlar.slice(1).map((satir,index) => ({
                excelSatiri:index + 2,
                pId:String(hucre(satir, ['T.C. Kimlik No','TC Kimlik No','TC No'])).replace(/\D/g,''),
                ad:String(hucre(satir, ['Ad Soyad','Adı Soyadı'])).trim(),
                tur:izinTopluTurunuCoz(hucre(satir, ['İzin Türü','İzin Tipi'])),
                donem:String(hucre(satir, ['Hakediş Dönemi','Dönem'])).trim(),
                baslangic:personelExcelTarihiniCoz(hucre(satir, ['Başlangıç Tarihi','İzin Başlangıç'])),
                bitis:personelExcelTarihiniCoz(hucre(satir, ['Bitiş Tarihi','İzin Bitiş'])),
                iseBaslama:'',
                aciklama:String(hucre(satir, ['Açıklama / Rapor Bilgisi','Açıklama','Rapor Bilgisi'])).trim()
            })).filter(k => k.pId || k.ad || k.tur || k.baslangic || k.bitis || k.aciklama);
            if (!hamKayitlar.length) throw new Error('Excel dosyasında dolu izin satırı bulunamadı.');
            const kabulEdilenler = [];
            izinTopluAktarSatirlari = hamKayitlar.map(kayit => {
fdLeaveAssert(false);

                const hatalar = [];
                const personel = personeller.find(p => String(p.id) === kayit.pId && aktifSirketeAit(p));
                if (!/^\d{11}$/.test(kayit.pId)) hatalar.push('T.C. No 11 haneli olmalı');
                else if (!personel) hatalar.push('Şirkete ait personel bulunamadı');
                else if (personel.cikisTarihi) hatalar.push('Personel aktif değil');
                if (!kayit.tur) hatalar.push('İzin türü geçersiz');
                if (!kayit.baslangic || !kayit.bitis) hatalar.push('Tarihler geçersiz');
                else if (kayit.bitis < kayit.baslangic) hatalar.push('Bitiş başlangıçtan önce');
                kayit.gun = izinTopluNetGunHesapla(kayit.baslangic, kayit.bitis, kayit.tur);
                if (kayit.baslangic && kayit.bitis && kayit.gun <= 0) hatalar.push('Net izin günü sıfır');
                kayit.iseBaslama = kayit.iseBaslama || izinTopluIseBaslamaHesapla(kayit.bitis, kayit.tur);
                kayit.donem = kayit.tur === 'Yıllık İzin' ? kayit.donem : '-';
                kayit.sebep = ['Mazeretsiz İzin','Sağlık / Rapor','Yıllık İzin'].includes(kayit.tur) ? '' : (kayit.aciklama || varsayilanIzinSebebi());
                kayit.raporBilgisi = kayit.tur === 'Sağlık / Rapor' ? kayit.aciklama : '';
                if (personel && kayit.tur === 'Yıllık İzin') {
                    const donem = personelDonemleriniGetir(personel).find(d => d.donem === kayit.donem);
                    if (!kayit.donem) hatalar.push('Hakediş dönemi zorunlu');
                    else if (!donem) hatalar.push('Hakediş dönemi geçersiz');
                    else {
                        const mevcut = izinler.filter(i => String(i.pId) === kayit.pId && i.tur === 'Yıllık İzin' && i.donem === kayit.donem).reduce((t,i) => t + Number(i.gun || 0), 0);
                        const dosyadaki = kabulEdilenler.filter(i => i.pId === kayit.pId && i.tur === 'Yıllık İzin' && i.donem === kayit.donem).reduce((t,i) => t + Number(i.gun || 0), 0);
                        if (mevcut + dosyadaki + kayit.gun > donem.hak) hatalar.push('Yıllık izin bakiyesi yetersiz (kalan ' + Math.max(0,donem.hak-mevcut-dosyadaki) + ' gün)');
                    }
                }
                const azami = kayit.tur === 'Doğum İzni' ? ayarSayisi('dogumIzinGunu',5) : kayit.tur === 'Evlenme İzni' ? ayarSayisi('evlenmeIzinGunu',3) : kayit.tur === 'Ölüm İzni' ? ayarSayisi('olumIzinGunu',3) : 0;
                if (azami && kayit.gun > azami) hatalar.push('Azami ' + azami + ' gün kullanılabilir');
                if (kayit.baslangic && kayit.bitis) {
                    if (izinler.some(i => izinTopluKayitlarCakisiyorMu(kayit,i))) hatalar.push('Mevcut izin kaydıyla çakışıyor');
                    else if (kabulEdilenler.some(i => izinTopluKayitlarCakisiyorMu(kayit,i))) hatalar.push('Dosyadaki başka izinle çakışıyor');
                }
                kayit.personelAdi = personel?.ad || kayit.ad || '-';
                kayit.hatalar = [...new Set(hatalar)];
                kayit.gecerli = kayit.hatalar.length === 0;
                if (kayit.gecerli) kabulEdilenler.push(kayit);
                return kayit;
            });
            izinTopluAktarOnizlemesiniGoster();
        } catch (error) {if(!fdLeaveValid())return;

            alert('İzin Excel dosyası okunamadı: ' + (error.message || 'Bilinmeyen hata'));
        } finally { input.value = ''; }
    
}catch(fdLeaveError){if(!fdLeaveValid())return;throw fdLeaveError;}
}
function izinTopluAktarOnizlemesiniGoster() {
fdLeaveAssert(false);

        const gecerli = izinTopluAktarSatirlari.filter(k => k.gecerli).length;
        const hatali = izinTopluAktarSatirlari.length - gecerli;
        document.getElementById('izinTopluAktarOzet').innerHTML = '<div style="display:flex;gap:10px;flex-wrap:wrap;"><span class="badge" style="background:#dcfce7;color:#166534;">' + gecerli + ' geçerli kayıt</span><span class="badge" style="background:#fee2e2;color:#991b1b;">' + hatali + ' hatalı kayıt</span></div><p style="margin:10px 0 0;color:#64748b;">Hatalı satırlar kaydedilmez. Kırmızı satırları Excel’de düzeltip dosyayı yeniden yükleyebilirsiniz.</p>';
        document.getElementById('izinTopluAktarBody').innerHTML = izinTopluAktarSatirlari.map(k => '<tr style="' + (k.gecerli ? '' : 'background:#fff1f2;') + '"><td>' + k.excelSatiri + '</td><td>' + escapeDashboardText(k.pId || '-') + '</td><td>' + escapeDashboardText(k.personelAdi) + '</td><td>' + escapeDashboardText(k.tur || '-') + '</td><td>' + (k.baslangic && k.bitis ? tarihFormati(k.baslangic) + ' - ' + tarihFormati(k.bitis) : '-') + '</td><td>' + (k.gun || '-') + '</td><td>' + (k.gecerli ? '<span style="color:#047857;font-weight:800;">✓ Hazır</span>' : '<span style="color:#b91c1c;font-weight:750;">' + escapeDashboardText(k.hatalar.join(' · ')) + '</span>') + '</td></tr>').join('');
        const buton = document.getElementById('btnIzinTopluAktarOnay');
        buton.disabled = gecerli === 0;
        buton.textContent = gecerli ? gecerli + ' Geçerli Kaydı Kaydet' : 'Geçerli Kayıt Yok';
        document.getElementById('modalIzinTopluAktar').style.display = 'flex';
    }
function izinTopluAktarModaliniKapat() {
fdLeaveAssert(false);

        document.getElementById('modalIzinTopluAktar').style.display = 'none';
        izinTopluAktarSatirlari = [];
    }
async function izinKayitlariniSupabaseDogrula(kayitlar) {
try{
fdLeaveAssert(false);

        if (!SUPABASE_MODE || !kayitlar.length) return;
        const idler = kayitlar.map(item => String(item.id));
        const { data, error } = await fdLeaveAwait(supabaseClient.from('portal_records')
            .select('legacy_id,data')
            .eq('company_id', aktifSirketId())
            .eq('module', 'izinler')
            .in('legacy_id', idler));
        if (error) throw error;
        const bulunanlar = new Map((data || []).map(item => [String(item.legacy_id), item.data || {}]));
        const eksikler = kayitlar.filter(kayit => {
fdLeaveAssert(false);

            const sunucu = bulunanlar.get(String(kayit.id));
            return !sunucu || String(sunucu.pId || '') !== String(kayit.pId || '') || String(sunucu.baslangic || '') !== String(kayit.baslangic || '') || String(sunucu.bitis || '') !== String(kayit.bitis || '') || String(sunucu.tur || '') !== String(kayit.tur || '');
        });
        if (eksikler.length) throw new Error(`${eksikler.length} izin kaydı bulut doğrulamasından geçmedi.`);
    
}catch(fdLeaveError){if(!fdLeaveValid())return;throw fdLeaveError;}
}
function izinKayitlariniYuklenenListedeDogrula(kayitlar) {
fdLeaveAssert(false);

        const mevcut = new Map(izinler.map(item => [String(item.id), item]));
        const eksikler = kayitlar.filter(kayit => {
fdLeaveAssert(false);

            const yuklenen = mevcut.get(String(kayit.id));
            return !yuklenen || String(yuklenen.pId || '') !== String(kayit.pId || '') || String(yuklenen.baslangic || '') !== String(kayit.baslangic || '') || String(yuklenen.bitis || '') !== String(kayit.bitis || '') || String(yuklenen.tur || '') !== String(kayit.tur || '');
        });
        if (eksikler.length) throw new Error(`${eksikler.length} izin kaydı yeniden yüklenen listede bulunamadı.`);
    }
async function izinKurtarmaUyarisiGoster() {
try{
fdLeaveAssert(true);

        if (!isManagerUser() || !izinKurtarmaAdaylari.length || izinIslemde) return;
        const adaylar = izinKurtarmaAdaylari.map(item => ({ ...item, sirketId:item.sirketId || aktifSirketId(), pId:String(item.pId || '') }));
        izinKurtarmaAdaylari = [];
        const satirlar = adaylar.slice(0, 10).map(item => {
fdLeaveAssert(false);

            const personel = personeller.find(p => String(p.id) === String(item.pId));
            return `${personel?.ad || item.pId || 'Personel'}: ${item.baslangic || '-'} - ${item.bitis || '-'} (${item.tur || 'İzin'})`;
        });
        const devam = adaylar.length > satirlar.length ? `\n... ve ${adaylar.length - satirlar.length} kayıt daha` : '';
        if (!await fdLeaveAwait(fdYuzerOnaySor(`Yerel yedekte bulunup bulut kaydında görünmeyen ${adaylar.length} izin kaydı bulundu:\n\n${satirlar.join('\n')}${devam}\n\nBu kayıtlar şimdi yeniden buluta kaydedilsin mi?`, 'İzin Kayıtlarını Kurtar', 'Kayıtları Kurtar'))) return;
        const mevcutIdler = new Set(izinler.map(item => String(item.id)));
        const eklenecekler = adaylar.filter(item => !mevcutIdler.has(String(item.id)));
        if (!eklenecekler.length) return;
        izinIslemde = true;
        fdLeaveShowOverlay('İzin kayıtları kurtarılıyor', `${eklenecekler.length} kayıt buluta yazılıyor ve doğrulanıyor...`);
        try {
            izinBekleyenKayitlariEkle(eklenecekler);
            izinler.push(...eklenecekler);
            yuklenenVeriler.add('izinler');
            veriOnbelleginiKaydet();
            await fdLeaveAwait(verileriKaydet());
            await fdLeaveAwait(izinKayitlariniSupabaseDogrula(eklenecekler));
            if (SUPABASE_MODE) await fdLeaveAwait(supabaseVerileriniYukle('izin'));
            izinKayitlariniYuklenenListedeDogrula(eklenecekler);
            izinBekleyenKayitlariniSil(eklenecekler);
            initUI();
            showToast(`${eklenecekler.length} izin kaydı kurtarıldı ve bulut kaydında doğrulandı.`);
        } catch (error) {if(!fdLeaveValid())return;

            veriOnbelleginiKaydet();
            showToast('Kurtarma tamamlanamadı; kayıtlar yerel yedekte korunuyor: ' + (error.message || 'Bilinmeyen hata'), 'error');
        } finally {
            izinIslemde = false;
            fdLeaveHideOverlay();
        }
    
}catch(fdLeaveError){if(!fdLeaveValid())return;throw fdLeaveError;}
}
async function izinTopluAktarimiKaydet() {
try{
fdLeaveAssert(true);

        if (!isManagerUser()) { showToast('Toplu izin aktarımını yalnızca Admin veya Yönetici yapabilir.', 'warning'); return; }
        if (izinIslemde) return;
        const kayitlar = izinTopluAktarSatirlari.filter(k => k.gecerli);
        if (!kayitlar.length) return;
        const yeniIzinler = kayitlar.map((k,index) => ({
            id:Date.now()+index, sirketId:aktifSirketId(), pId:String(k.pId), tur:k.tur, donem:k.donem,
            gun:k.gun, baslangic:k.baslangic, bitis:k.bitis, iseBaslama:k.iseBaslama,
            sebep:k.sebep, sahitler:[], raporBilgisi:k.raporBilgisi
        }));
        izinIslemde = true;
        fdLeaveShowOverlay('İzinler topluca kaydediliyor', yeniIzinler.length + ' kayıt buluta yazılıyor, tüm liste yeniden yükleniyor...');
        try {
            izinBekleyenKayitlariEkle(yeniIzinler);
            izinler.push(...yeniIzinler);
            yuklenenVeriler.add('izinler');
            veriOnbelleginiKaydet();
            await fdLeaveAwait(verileriKaydet());
            await fdLeaveAwait(izinKayitlariniSupabaseDogrula(yeniIzinler));
            if (SUPABASE_MODE) await fdLeaveAwait(supabaseVerileriniYukle('izin'));
            izinKayitlariniYuklenenListedeDogrula(yeniIzinler);
            izinBekleyenKayitlariniSil(yeniIzinler);
            const kaydedilenPersonelId = String(yeniIzinler[0]?.pId || '');
            izinTopluAktarModaliniKapat();
            initUI();
            if (kaydedilenPersonelId) {
                document.getElementById('izinPersonelSelect').value = kaydedilenPersonelId;
                personelSecildi(kaydedilenPersonelId);
            }
            showToast(yeniIzinler.length + ' izin kaydı kaydedildi ve yeniden yüklenerek doğrulandı.');
            const bildirimSonucu=await fdLeaveAwait(personelIzinBildirimleriniPlanla(yeniIzinler.map(personelIzinBildirimiHazirla),fdLeaveValid));
            if(bildirimSonucu.basarisiz)showToast(bildirimSonucu.basarisiz+' izin WhatsApp bildirimi kuyruğa alınamadı.','warning');
            else if(bildirimSonucu.planlanan)showToast('WhatsApp mesajı '+izinBildirimBeklemeMetni()+' kuyruğa alındı.','success');
        } catch (error) {if(!fdLeaveValid())return;

            veriOnbelleginiKaydet();
            showToast('Toplu izin kaydı tamamlanamadı. Kayıtlar silinmedi; yerel kurtarma yedeğinde korunuyor: ' + (error.message || 'Bilinmeyen hata'), 'error');
        } finally {
            izinIslemde = false;
            fdLeaveHideOverlay();
        }
    
}catch(fdLeaveError){if(!fdLeaveValid())return;throw fdLeaveError;}
}
function renderBakiyeTable() {
fdLeaveAssert(false);

        const body = document.querySelector('#bakiyeTablo tbody');
        body.innerHTML = '';
        let sira = 1;

        const arama = document.getElementById('fBakiyeArama').value.toLowerCase();
        const seciliSube = document.getElementById('fBakiyeSube').value;
        const seciliDonem = document.getElementById('fBakiyeDonem').value;

        personeller.filter(p => (!p.cikisTarihi || p.cikisTarihi === "null") && (!isPersonelUser() || String(p.id) === String(activeUser.tcNo)))
            .sort((a, b) => String(a.sube || 'Merkez').localeCompare(String(b.sube || 'Merkez'), 'tr-TR', { sensitivity: 'base' })
                || String(a.ad || '').localeCompare(String(b.ad || ''), 'tr-TR', { sensitivity: 'base' })
                || String(a.id).localeCompare(String(b.id)))
            .forEach(p => {
fdLeaveAssert(false);

            if (arama && !p.ad.toLowerCase().includes(arama) && !String(p.id).includes(arama)) return;
            if (seciliSube && p.sube !== seciliSube) return;

            const donemler = personelDonemleriniGetir(p);
            let toplamKalan = 0, detayHtml = '';

            donemler.forEach(d => {
fdLeaveAssert(false);

                if (seciliDonem && d.donem !== seciliDonem) return;

                let kullanilan = izinler.filter(i => String(i.pId) === String(p.id) && i.donem === d.donem && i.tur === 'Yıllık İzin').reduce((s, x) => s + x.gun, 0);
                let kalan = d.hak - kullanilan;
                if (kalan > 0) {
                    toplamKalan += kalan;
                    detayHtml += `<span class="badge" style="background:#e0f2fe; color:#0369a1; border:1px solid #7dd3fc; margin-right:3px;">${d.donem}: ${kalan} Gün</span>`;
                }
            });

            if (toplamKalan > 0) {
                body.innerHTML += `
                    <tr>
                        <td>${sira++}</td>
                        <td><code>${p.id}</code></td>
                        <td><strong>${p.ad}</strong></td>
                        <td><span class="badge" style="${getSubeBadgeStyle(p.sube)}">${p.sube || 'Merkez'}</span></td>
                        <td>${detayHtml}</td>
                        <td style="text-align:right; font-weight:800; color:#10b981;">${toplamKalan} Gün</td>
                    </tr>
                `;
            }
        });
    }
function exportBakiyeToExcel() {
fdLeaveAssert(false);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.table_to_sheet(document.getElementById('bakiyeTablo')), "Bakiyeler");
        XLSX.writeFile(wb, "Yillik_Izin_Bakiye.xlsx");
    }
function izinDilekceRaporunuDoldur(i) {
fdLeaveAssert(false);

        const p = personeller.find(x => String(x.id) === String(i.pId));
        if (!p) return false;
        const sube = subeler.find(item => item.ad === p.sube && (!p.sirketId || String(item.sirketId) === String(p.sirketId)))
            || subeler.find(item => item.ad === p.sube);
        const tur = i.tur || 'İzin';
        const sebep = tur === 'Yıllık İzin' ? '' : (i.sebep || varsayilanIzinSebebi()).replace(/\s*[.,;:]+\s*$/, '');
        const baslangic = tarihFormati(i.baslangic);
        const bitis = tarihFormati(i.bitis);
        const iseBaslama = tarihFormati(i.iseBaslama);

        document.getElementById('dilBaslik').innerText = `${tur} İSTEK FORMU`;
        document.getElementById('dilAd').innerText = p.ad || '-';
        document.getElementById('dilTcNo').innerText = p.id || '-';
        document.getElementById('dilSgkNo').innerText = p.sgkNo || '-';
        document.getElementById('dilGirisTarihi').innerText = p.girisTarihi ? tarihFormati(p.girisTarihi) : '-';
        document.getElementById('dilUnvan').innerText = p.gorev || 'Personel';
        document.getElementById('dilSubeAdresi').innerText = sube?.adres || 'Şube adresi belirtilmemiş';
        const donem = String(i.donem || '').trim();
        const izinTalepMetni = tur === 'Yıllık İzin' && donem && donem !== '-'
            ? `${donem} yıllık izin hakkımı kullanmak üzere ${baslangic} tarihinden itibaren ${bitis} tarihine kadar yıllık izne ayrılmak istiyorum.`
            : `${sebep ? `${sebep} ` : ''}${baslangic} tarihinden itibaren ${bitis} tarihine kadar ${tur.toLowerCase()} izne ayrılmak istiyorum.`;
        document.getElementById('dilIzinMetni').innerText = izinTalepMetni;
        document.getElementById('dilPersonelImzaAdi').innerText = p.ad || '-';
        document.getElementById('dilOnayTur').innerText = tur.toLowerCase();
        document.getElementById('dilCikisTarihi').innerText = baslangic;
        document.getElementById('dilIzinBitisTarihi').innerText = bitis;
        document.getElementById('dilIseBaslama').innerText = iseBaslama;
        return true;
    }
function dilekceHazirla(i) {
fdLeaveAssert(false);

        const p = personeller.find(x => String(x.id) === String(i.pId));
        if (!p) return;
        if (i.tur === 'Mazeretsiz İzin') {
            mazeretsizTutanakHazirla(i, p);
            return;
        }
        if (!izinDilekceRaporunuDoldur(i)) return;
        dilekceOnizlemeAc('izin');
    }
function izinMTopluDilekceleriAc(kayitlar) {
fdLeaveAssert(false);

        const kaynak = document.getElementById('izinTopluDilekceRaporu');
        const sayfalar = (kayitlar || []).filter(i => i.tur !== 'Sağlık / Rapor' && i.tur !== 'Mazeretsiz İzin').map(i => {
fdLeaveAssert(false);

            if (!izinDilekceRaporunuDoldur(i)) return '';
            return `<section class="izin-toplu-dilekce-sayfa">${document.getElementById('dilekceRaporu').innerHTML}</section>`;
        }).filter(Boolean);
        if (!sayfalar.length) return;
        kaynak.innerHTML = sayfalar.join('');
        dilekceOnizlemeTuru = 'toplu-izin';
        document.getElementById('dilekceOnizlemeBaslik').textContent = `Toplu İzin Dilekçeleri (${sayfalar.length})`;
        document.getElementById('dilekceOnizlemeIcerik').innerHTML = sayfalar.join('');
        document.getElementById('modalDilekceOnizleme').style.display = 'flex';
    }
function mazeretsizTutanakHazirla(i, p) {
fdLeaveAssert(false);

        const sahitler = mazeretsizSahitKaydiniDiziyeCevir(i.sahitler).map(sahit => {
fdLeaveAssert(false);

            const guncel = personeller.find(personel => String(personel.id) === String(sahit.id));
            return { id: String(guncel?.id || sahit.id || '-'), ad: guncel?.ad || sahit.ad || '-' };
        });
        const baslangic = tarihFormati(i.baslangic);
        const bitis = tarihFormati(i.bitis);
        const tarihMetni = String(i.baslangic) === String(i.bitis)
            ? `${baslangic} tarihinde`
            : `${baslangic} - ${bitis} tarihleri arasında`;
        document.getElementById('tutMetin').textContent = `Şirketimiz bünyesinde görev yapan, T.C. Kimlik No ${p.id || '-'} olan ${p.ad || '-'} isimli çalışanımızın ${tarihMetni} herhangi bir mazeret bildirmeksizin görevli olduğu işyerine gelmediği ve mesaisine başlamadığı tarafımızca tespit edilmiştir. İşbu tutanak; olayın tespiti ve kayıt altına alınması amacıyla, aşağıda bilgileri ve imzaları bulunan çalışanların huzurunda düzenlenerek imza altına alınmıştır.`;
        document.getElementById('tutSahitler').innerHTML = sahitler.length ? sahitler.map(sahit => `<div style="padding:4mm 3mm 6mm; border-top:1px solid #111;"><strong>${escapeHtml(sahit.ad)}</strong><br><span style="font-size:9pt;">T.C. Kimlik No: ${escapeHtml(sahit.id)}</span><div style="margin-top:6mm; border-top:1px solid #111; padding-top:2mm;">İmza</div></div>`).join('') : '<div style="grid-column:1 / -1; padding:8mm; border-top:1px solid #111; color:#555;">Şahit bilgisi eklenmemiştir.</div>';
        dilekceOnizlemeAc('mazeretsiz');
    }
let dilekceOnizlemeTuru = '';
function dilekceOnizlemeAc(tur) {
fdLeaveAssert(false);

        dilekceOnizlemeTuru = tur;
        const kaynak = document.getElementById(tur === 'mazeretsiz' ? 'mazeretsizTutanakRaporu' : 'dilekceRaporu');
        const onizleme = document.getElementById('dilekceOnizlemeIcerik');
        const baslik = document.getElementById('dilekceOnizlemeBaslik');
        baslik.textContent = tur === 'mazeretsiz' ? 'Tutanak Önizleme' : 'İzin Dilekçesi Önizleme';
        onizleme.innerHTML = `<div style="width:210mm; min-height:297mm; margin:0 auto; padding:19mm 18mm 17mm; box-sizing:border-box; background:#fff; color:#000; font-family:Arial,sans-serif; font-size:10pt; line-height:1.45; box-shadow:0 2px 10px rgba(15,23,42,.18);">${kaynak.innerHTML}</div>`;
        document.getElementById('modalDilekceOnizleme').style.display = 'flex';
    }
function dilekceOnizlemeKapat() {
fdLeaveAssert(false);

        document.getElementById('modalDilekceOnizleme').style.display = 'none';
        dilekceOnizlemeTuru = '';
    }
function dilekceOnizlemeYazdir() {
fdLeaveAssert(false);

        const tur = dilekceOnizlemeTuru;
        if (!tur) return;
        document.getElementById('modalDilekceOnizleme').style.display = 'none';
        yazdirmaGorunumunuAc(tur === 'mazeretsiz' ? 'print-mazeretsiz' : (tur === 'toplu-izin' ? 'print-toplu-izin' : 'print-izin'));
    }
function yazdirmaGorunumunuAc(sinif) {
fdLeaveAssert(false);

        document.body.classList.remove('print-izin', 'print-mazeretsiz', 'print-toplu-izin');
        document.body.classList.add(sinif);
        fdLeaveListen('afterprint', () => document.body.classList.remove(sinif), { once: true });
        window.print();
    }
function izinTekKaydiSil(kayit) {
fdLeaveAssert(true);

        if (!SUPABASE_MODE) return (async () => {
try{
fdLeaveAssert(false);

            const onceki = izinler;
            izinler = izinler.filter(i => String(i.id) !== String(kayit.id));
            try { await fdLeaveAwait(verileriKaydet()); } catch (error) {if(!fdLeaveValid())return;
 izinler = onceki; throw error; }
            await fdLeaveAwait(personelIzinBildiriminiIptalEt(kayit.pId));
        
}catch(fdLeaveError){if(!fdLeaveValid())return;throw fdLeaveError;}
})();
        supabaseKaydetmeBekleyen++;
        const islem = supabaseKaydetmeKuyrugu.catch(() => {
fdLeaveAssert(false);
}).then(async () => {
try{
fdLeaveAssert(false);

            if (!activeUser?.sirketId || !aktifSirketeAit(kayit)) throw new Error('Şirket oturumu doğrulanamadı.');
            const legacyId = supabaseKayitAnahtari('izinler', kayit, izinler.indexOf(kayit));
            const kontrol = new AbortController(), zamanlayici = fdLeaveTimer(() => kontrol.abort(), 15000);
            try {
                // Silme ve eski WhatsApp kuyruğunun iptali aynı veritabanı işlemindedir.
                const { data, error } = await fdLeaveAwait(supabaseClient.from('portal_records').delete()
                    .eq('company_id', activeUser.sirketId).eq('module', 'izinler').eq('legacy_id', legacyId)
                    .select('legacy_id').abortSignal(kontrol.signal));
                if (error) throw error;
                if (!data?.length) {
                    const dogrulama = await fdLeaveAwait(supabaseClient.from('portal_records').select('legacy_id')
                        .eq('company_id', activeUser.sirketId).eq('module', 'izinler').eq('legacy_id', legacyId)
                        .maybeSingle().abortSignal(kontrol.signal));
                    if (dogrulama.error) throw dogrulama.error;
                    if (dogrulama.data) throw new Error('İzin kaydı silinemedi. Yetkinizi kontrol edin.');
                }
                izinler = izinler.filter(i => String(i.id) !== String(kayit.id));
                try {
                    const onceki = JSON.parse(veriSonKayitGoruntuleri.get('izinler') || '[]');
                    veriSonKayitGoruntuleri.set('izinler', JSON.stringify(onceki.filter((i,index) => supabaseKayitAnahtari('izinler',i,index) !== legacyId)));
                    izinBekleyenKayitlariniSil([kayit]);
                    veriOnbelleginiKaydet();
                } catch (error) {if(!fdLeaveValid())return;
 console.warn('Silinen iznin yerel önbelleği yenilenemedi:', error); }
            } finally { fdLeaveClearTimer(zamanlayici); }
        
}catch(fdLeaveError){if(!fdLeaveValid())return;throw fdLeaveError;}
}).finally(() => { supabaseKaydetmeBekleyen = Math.max(0, supabaseKaydetmeBekleyen - 1); });
        supabaseKaydetmeKuyrugu = islem;
        return islem;
    }
async function izinSil(id, buton = null) {
try{
fdLeaveAssert(true);

        if (isPersonelUser()) {
            showToast('Personel hesabının kayıt silme yetkisi yoktur.', 'warning');
            return;
        }
        if (izinIslemde) return;
        const silinenIzin = izinler.find(i => String(i.id) === String(id));
        if (!silinenIzin) return showToast('İzin kaydı bulunamadı. Listeyi yenileyin.', 'warning');
        izinIslemde = true;
        const oncekiYazi = buton?.textContent;
        if (buton) { buton.disabled = true; buton.textContent = 'Onay bekleniyor…'; }
        let katmanAcik = false;
        try {
            if (!await fdLeaveAwait(fdYuzerOnaySor('Bu izin kaydı silinsin mi? Bekleyen eski WhatsApp bildirimi de iptal edilecek.', 'İzin Kaydını Sil', 'Sil'))) return;
            if (buton) buton.textContent = 'Siliniyor…';
            fdLeaveShowOverlay('İzin siliniyor', 'Yalnızca seçilen izin kaydı kaldırılıyor...');katmanAcik = true;
            await fdLeaveAwait(izinTekKaydiSil(silinenIzin));
            renderIzinDashAndTables();
            const pId = document.getElementById('izinPersonelSelect')?.value;
            if (pId) personelSecildi(pId);
            showToast('İzin kaydı silindi; bekleyen eski WhatsApp mesajı iptal edildi.', 'success');
        } catch (error) {if(!fdLeaveValid())return;

            showToast('İzin silinemedi veya silme doğrulanamadı: ' + (error.message || 'Bağlantıyı kontrol edip listeyi yenileyin.'), 'error');
        } finally {
            izinIslemde = false;
            if (buton?.isConnected) { buton.disabled = false; buton.textContent = oncekiYazi; }
            if (katmanAcik) fdLeaveHideOverlay();
        }
    
}catch(fdLeaveError){if(!fdLeaveValid())return;throw fdLeaveError;}
}
function izinPersonelSeciminiTemizle(){
fdLeaveAssert(false);

        const kutu=document.getElementById('izinPersonelSecimKutusu'),select=document.getElementById('izinPersonelSelect');
        if(kutu)kutu.value='';if(select)select.value='';personelSecildi('');
        fdLeaveTimer(()=>{
fdLeaveAssert(false);
kutu?.focus();kutu?._fdPersonelListesiniAc?.();},200);
    }
const fdPersonelOzetToplamOncesi=personelOzetKutusunuGuncelle;
personelOzetKutusunuGuncelle=function(p){
        fdPersonelOzetToplamOncesi(p);const donemler=personelDonemleriniGetir(p),hak=donemler.reduce((t,d)=>t+Number(d.hak||0),0),kullanilan=izinler.filter(i=>String(i.pId)===String(p.id)&&i.tur==='Yıllık İzin').reduce((t,i)=>t+Number(i.gun||0),0),kalan=Math.max(0,hak-kullanilan);
        const hakEl=document.getElementById('genelToplamHakDeger'),kulEl=document.getElementById('genelToplamKullanilanDeger'),kalEl=document.getElementById('genelToplamKalanDeger');if(hakEl)hakEl.textContent=hak+' Gün';if(kulEl)kulEl.textContent=kullanilan+' Gün';if(kalEl)kalEl.textContent=kalan+' Gün';
    };
exportBakiyeToPDF=function(){return fdLeavePDF(document.getElementById('bakiyeTablo'),'KALAN YILLIK İZİN BAKİYELERİ · '+new Date().toLocaleDateString('tr-TR'),'Kalan_Yillik_Izinler.pdf',{yon:'landscape',fdIsCurrent:fdLeaveValid});};
return{init(){fdLeaveAssert();izinAyarEtiketleriniGuncelle();fdPersonelAramaPaneliOlustur('izinPersonelSecimKutusu','izinPersonelAramaPaneli',()=>[...document.querySelectorAll('#izinPersonelSelect option')].slice(1).map(o=>({id:o.value,etiket:String(o.dataset.etiket||o.textContent).split(' · ')[0],alt:String(o.dataset.etiket||o.textContent).split(' · ').slice(1).join(' · '),tam:o.dataset.etiket||o.textContent})),x=>{document.getElementById('izinPersonelSecimKutusu').value=x.tam;document.getElementById('izinPersonelSelect').value=x.id;personelSecildi(x.id);});
document.getElementById('izinForm').addEventListener('submit',fdLeaveSaveSubmit);;window.fdSupplementalOutputInstall?.();window.fdUnifiedOutput?.scan()},open(){fdLeaveAssert();return openIzinTakipApp()},api:{get izinAyarEtiketleriniGuncelle(){return izinAyarEtiketleriniGuncelle},get fdIzinArayuzunuYenile(){return fdIzinArayuzunuYenile},get switchIzinTab(){return switchIzinTab},get personelSelectDoldur(){return personelSelectDoldur},get izinPersonelAramaliSecimYap(){return izinPersonelAramaliSecimYap},get izinTuruDegisti(){return izinTuruDegisti},get mazeretsizSahitleriDoldur(){return mazeretsizSahitleriDoldur},get mazeretsizSahitDegisti(){return mazeretsizSahitDegisti},get mazeretsizSahitleriGetir(){return mazeretsizSahitleriGetir},get personelSecildi(){return personelSecildi},get donemSeciminiGuncelle(){return donemSeciminiGuncelle},get personelOzetKutusunuGuncelle(){return personelOzetKutusunuGuncelle},get sendWhatsAppOzet(){return sendWhatsAppOzet},get izinOzetDosyaAdi(){return izinOzetDosyaAdi},get seciliPersonelIzinCiktiVerisi(){return seciliPersonelIzinCiktiVerisi},get exportIzinOzetExcel(){return exportIzinOzetExcel},get exportIzinOzetPdf(){return exportIzinOzetPdf},get izinPersonelNotunuFormaYukle(){return izinPersonelNotunuFormaYukle},get izinPersonelNotunuKaydet(){return izinPersonelNotunuKaydet},get tekPersonelGecmisiniCiz(){return tekPersonelGecmisiniCiz},get izinDuzenle(){return izinDuzenle},get izinFormReset(){return izinFormReset},get dilekceTekrarBas(){return dilekceTekrarBas},get baslangicTarihiDegisti(){return baslangicTarihiDegisti},get bitisTarihiKisitiniGuncelle(){return bitisTarihiKisitiniGuncelle},get hesaplaIzinTarihleri(){return hesaplaIzinTarihleri},get izindeCakisinaIzinVarMi(){return izindeCakisinaIzinVarMi},get izinMTopluPersonelDegisti(){return izinMTopluPersonelDegisti},get izinMTopluPuantajKodu(){return izinMTopluPuantajKodu},get izinMTopluGunleriYukle(){return izinMTopluGunleriYukle},get izinMTopluGunSec(){return izinMTopluGunSec},get izinMTopluTurDegisti(){return izinMTopluTurDegisti},get izinMTopluDonemleriDoldur(){return izinMTopluDonemleriDoldur},get izinMTopluSecilenleriAta(){return izinMTopluSecilenleriAta},get izinMTopluGrupListesi(){return izinMTopluGrupListesi},get izinMTopluAtamayiSil(){return izinMTopluAtamayiSil},get izinMTopluCiz(){return izinMTopluCiz},get izinMTopluTemizle(){return izinMTopluTemizle},get izinMTopluAraliklaraBol(){return izinMTopluAraliklaraBol},get izinMTopluKayitlariHazirla(){return izinMTopluKayitlariHazirla},get izinMTopluKayitSonrasiSifirla(){return izinMTopluKayitSonrasiSifirla},get izinMTopluKaydetVeYazdir(){return izinMTopluKaydetVeYazdir},get izinExcelSablonuIndir(){return izinExcelSablonuIndir},get izinExcelDosyasiSec(){return izinExcelDosyasiSec},get izinTopluTurunuCoz(){return izinTopluTurunuCoz},get izinTopluNetGunHesapla(){return izinTopluNetGunHesapla},get izinTopluIseBaslamaHesapla(){return izinTopluIseBaslamaHesapla},get izinTopluKayitlarCakisiyorMu(){return izinTopluKayitlarCakisiyorMu},get izinExcelDosyasiniOku(){return izinExcelDosyasiniOku},get izinTopluAktarOnizlemesiniGoster(){return izinTopluAktarOnizlemesiniGoster},get izinTopluAktarModaliniKapat(){return izinTopluAktarModaliniKapat},get izinKayitlariniSupabaseDogrula(){return izinKayitlariniSupabaseDogrula},get izinKayitlariniYuklenenListedeDogrula(){return izinKayitlariniYuklenenListedeDogrula},get izinKurtarmaUyarisiGoster(){return izinKurtarmaUyarisiGoster},get izinTopluAktarimiKaydet(){return izinTopluAktarimiKaydet},get renderBakiyeTable(){return renderBakiyeTable},get exportBakiyeToExcel(){return exportBakiyeToExcel},get izinDilekceRaporunuDoldur(){return izinDilekceRaporunuDoldur},get dilekceHazirla(){return dilekceHazirla},get izinMTopluDilekceleriAc(){return izinMTopluDilekceleriAc},get mazeretsizTutanakHazirla(){return mazeretsizTutanakHazirla},get dilekceOnizlemeAc(){return dilekceOnizlemeAc},get dilekceOnizlemeKapat(){return dilekceOnizlemeKapat},get dilekceOnizlemeYazdir(){return dilekceOnizlemeYazdir},get yazdirmaGorunumunuAc(){return yazdirmaGorunumunuAc},get izinTekKaydiSil(){return izinTekKaydiSil},get izinSil(){return izinSil},get izinPersonelSeciminiTemizle(){return izinPersonelSeciminiTemizle},get exportBakiyeToPDF(){return exportBakiyeToPDF}},dispose(){fdLeaveHideOverlay();fdLeaveDisposed=true;for(const [type,fn,options]of fdLeaveListeners)window.removeEventListener(type,fn,options);if(fdLeaveOutput?.isConnected){if(fdLeaveOutput._url)URL.revokeObjectURL(fdLeaveOutput._url);fdLeaveOutput.remove()}for(const id of fdLeaveTimers)window.clearTimeout(id);fdLeaveTimers.clear();document.body.classList.remove('print-izin','print-mazeretsiz','print-toplu-izin');if(typeof fdAcikUygulamaSekmeleri!=='undefined')for(const tab of fdAcikUygulamaSekmeleri)if(tab.alanId==='izinTakipApp')tab.alanId='';}};
});
