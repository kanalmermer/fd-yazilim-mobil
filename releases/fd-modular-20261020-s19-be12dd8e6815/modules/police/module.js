window.FDModules.define('police',function(){

let fdPolicyDisposed=false,fdPolicyOverlay=false;
const fdPolicyInitial=fdPolicyContext(),fdPolicyListeners=[],fdPolicyTimers=new Set(),fdPolicyUrls=new Set();
function fdPolicyContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('police')])}
function fdPolicyValid(){return !fdPolicyDisposed&&fdPolicyInitial===fdPolicyContext()&&anaMenuModulErisimiVar('police')}
function fdPolicyAssert(write=false){if(!fdPolicyValid())throw Error('Oturum değişti; Poliçe Takip ekranını yeniden açın.');if(write&&!anaMenuModulYazmaYetkisiVar('police'))throw Error('Bu modülde değişiklik yapma yetkiniz yok.')}
async function fdPolicyAwait(promise){fdPolicyAssert();const result=await promise;fdPolicyAssert();return result}
function showGlobalOverlay(...args){fdPolicyOverlay=true;return window.showGlobalOverlay(...args)}
function hideGlobalOverlay(){fdPolicyOverlay=false;return window.hideGlobalOverlay()}
function fdPoliceListen(target,...args){if(!target)return;target.addEventListener(...args);fdPolicyListeners.push([target,...args])}
function setTimeout(fn,delay,...args){const id=window.setTimeout(()=>{fdPolicyTimers.delete(id);if(fdPolicyValid())fn(...args)},delay);fdPolicyTimers.add(id);return id}
const URL={createObjectURL(blob){const url=window.URL.createObjectURL(blob);fdPolicyUrls.add(url);return url},revokeObjectURL(url){fdPolicyUrls.delete(url);window.URL.revokeObjectURL(url)}};
function fdPolicyInit(){fdPolicyAssert();const slot=document.querySelector('[data-fd-policy-preview-frame]');if(slot){const frame=document.createElement('iframe');frame.id='policeOnizlemeFrame';frame.title='Poliçe önizleme';frame.style.cssText='display:block;width:100%;height:100%;min-height:62vh;border:0;border-radius:8px;background:#fff';slot.replaceWith(frame)}window.fdSupplementalOutputInstall?.();window.fdUnifiedOutput?.scan()}
// Policy-local guarded transport; the shared rental transport remains unchanged.
async function kiraBelgeDriveYukle(dosya,d,tur){
try{
fdPolicyAssert(true);
if(!dosya)return null;const base64=await fdPolicyAwait(dosyayiBase64Oku(dosya)),ad=kiraBelgeDosyaAdi(d,tur,dosya),sonuc=dosya.type==='application/pdf'?await fdPolicyAwait(fdYazilimDrivePdfYukle(base64,ad,'','KİRA TAKİP')):await fdPolicyAwait(fdYazilimDriveDosyaYukle(base64,ad,dosya.type||'application/octet-stream','','KİRA TAKİP'));return {id:sonuc.id,url:sonuc.url,ad:sonuc.ad||ad,mimeType:dosya.type||''};
}catch(fdPolicyError){if(!fdPolicyValid())return;throw fdPolicyError;}
}
function policeTurSecenekleriniDoldur(secili=''){
fdPolicyAssert(false);

        const turler=policeTurleriniDuzelt(),form=document.getElementById('policeTur'),filtre=document.getElementById('policeTurFiltre');
        if(form){form.innerHTML=turler.map(t=>`<option value="${escapeDashboardText(t)}">${escapeDashboardText(t)}</option>`).join('');if(secili&&turler.includes(secili))form.value=secili;}
        if(filtre){const onceki=filtre.value;filtre.innerHTML='<option value="">Tüm Poliçe Türleri</option>'+turler.map(t=>`<option value="${escapeDashboardText(t)}">${escapeDashboardText(t)}</option>`).join('');if([...filtre.options].some(o=>o.value===onceki))filtre.value=onceki;}
    }

function policeSirketOnerileriniDoldur(){
fdPolicyAssert(false);

        const adlar=new Set();policeTumKayitlar().forEach(p=>{
if(!fdPolicyValid())return;
const ad=String(p.sirket||'').trim();if(ad)adlar.add(ad);});
        document.getElementById('policeSirketListesi').innerHTML=[...adlar].sort((a,b)=>a.localeCompare(b,'tr')).map(x=>`<option value="${escapeDashboardText(x)}"></option>`).join('');
    }

function policeHedefSecenekleriniDoldur(secili=''){
fdPolicyAssert(false);

        const tip=document.getElementById('policeHedefTip')?.value||'arac',select=document.getElementById('policeHedefId'),secimGrubu=document.getElementById('policeHedefSecimGrubu'),diger=document.getElementById('policeDigerAdGrubu');
        const liste=tip==='arac'?araclar.filter(a=>aktifSirketeAit(a)&&policeMetinAnahtari(a.durum)!=='SATILDI').map(a=>({id:String(a.id),ad:a.plaka+' · '+[a.marka,a.model].filter(Boolean).join(' ')})):tip==='daire'||tip==='isyeri'?kiraDaireler().filter(d=>(d.mulkTuru==='isyeri'?'isyeri':'daire')===tip).map(d=>({id:String(d.id),ad:d.kisaAd+(d.uavt?' · UAVT '+d.uavt:' · UAVT YOK')})):[];
        secimGrubu.style.display=tip==='diger'?'none':'';diger.style.display=tip==='diger'?'':'none';select.required=tip!=='diger';document.getElementById('policeDigerAd').required=tip==='diger';
        select.innerHTML=liste.map(x=>`<option value="${escapeDashboardText(x.id)}">${escapeDashboardText(x.ad)}</option>`).join('');if(secili&&liste.some(x=>x.id===String(secili)))select.value=String(secili);policeHedefBilgisiniGuncelle();
    }

function policeHedefBilgisiniGuncelle(){
fdPolicyAssert(false);

        const tip=document.getElementById('policeHedefTip')?.value||'arac',id=document.getElementById('policeHedefId')?.value,kod=document.getElementById('policeEslesmeKodu'),etiket=document.getElementById('policeEslesmeKoduEtiket');
        if(tip==='arac'){const a=araclar.find(x=>String(x.id)===String(id));etiket.textContent='Plaka';if(a)kod.value=a.plaka||'';kod.readOnly=true;}
        else if(tip==='daire'||tip==='isyeri'){const d=kiraDaireler().find(x=>String(x.id)===String(id));etiket.textContent='UAVT Kodu';if(d)kod.value=d.uavt||'';kod.readOnly=true;}
        else{etiket.textContent='Referans / Kimlik Kodu';kod.readOnly=false;}
    }

function policeBitisiniBirYilSonrayaAyarla(){
fdPolicyAssert(false);
const bas=document.getElementById('policeBaslangic')?.value,bit=document.getElementById('policeBitis');if(!bas||!bit)return;const [y,m,g]=bas.split('-').map(Number),d=new Date(y+1,m-1,g,12);if(d.getMonth()!==m-1)d.setDate(0);bit.value=d.toISOString().slice(0,10);}

function policeFormunuAc(hedefTip='arac',hedefId='',kayitId=''){
fdPolicyAssert(true);

        const form=document.getElementById('policeForm');form.reset();document.getElementById('policeEditId').value='';document.getElementById('policeModalBaslik').textContent='🛡️ Yeni Poliçe';document.getElementById('policeKaydetBtn').textContent='💾 Poliçeyi Kaydet';
        policeTurSecenekleriniDoldur();policeSirketOnerileriniDoldur();document.getElementById('policeHedefTip').value=hedefTip||'arac';policeHedefSecenekleriniDoldur(hedefId);document.getElementById('policeBaslangic').value=bugununYerelTarihi();policeBitisiniBirYilSonrayaAyarla();
        if(kayitId){const p=policeMerkeziKayitlar().find(x=>String(x.id)===String(kayitId));if(p){document.getElementById('policeEditId').value=String(p.id);document.getElementById('policeModalBaslik').textContent='✏️ Poliçeyi Düzenle';document.getElementById('policeKaydetBtn').textContent='💾 Değişiklikleri Kaydet';document.getElementById('policeHedefTip').value=policeKayitHedefTipi(p);policeHedefSecenekleriniDoldur(p.hedefId||p.daireId);document.getElementById('policeDigerAd').value=p.hedefAdi||p.varlikAdi||'';document.getElementById('policeEslesmeKodu').value=policeKayitEslesmeKodu(p);policeTurSecenekleriniDoldur(policeMetinAnahtari(p.tur));document.getElementById('policeSirket').value=p.sirket||'';document.getElementById('policeNo').value=p.policeNo||'';document.getElementById('policeBedel').value=Number((p.bedel??p.tutar)||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});document.getElementById('policeBaslangic').value=p.baslangic||'';document.getElementById('policeBitis').value=p.bitis||'';document.getElementById('policeAciklama').value=p.aciklama||p.not||'';}}
        document.getElementById('modalPoliceKayit').style.display='flex';
    }

async function policeKaydet(event){
try{
fdPolicyAssert(true);

        event.preventDefault();const buton=document.getElementById('policeKaydetBtn'),editId=String(document.getElementById('policeEditId').value||''),eski=editId?policeMerkeziKayitlar().find(p=>String(p.id)===editId):null,hedefTip=document.getElementById('policeHedefTip').value,hedefId=policeBagliVarlikTuruMu(hedefTip)?document.getElementById('policeHedefId').value:'';
        const arac=hedefTip==='arac'?araclar.find(a=>String(a.id)===String(hedefId)):null,daire=['daire','isyeri'].includes(hedefTip)?kiraDaireler().find(d=>String(d.id)===String(hedefId)):null,hedefAdi=arac?.plaka||daire?.kisaAd||document.getElementById('policeDigerAd').value.trim(),eslesmeKodu=arac?.plaka||daire?.uavt||document.getElementById('policeEslesmeKodu').value.trim(),bas=document.getElementById('policeBaslangic').value,bit=document.getElementById('policeBitis').value,dosya=document.getElementById('policeBelge').files?.[0];
        if(!hedefAdi)return showToast('Poliçenin bağlı olduğu varlığı yazın.','warning');if(!bas||!bit||bit<bas)return showToast('Poliçe tarihlerini kontrol edin.','warning');let yeniBelge=null;
        buton.disabled=true;showGlobalOverlay('Poliçe kaydediliyor',dosya?'Belge hazırlanıyor ve kayıt doğrulanıyor...':'Kayıt sunucuda doğrulanıyor...');
        try{if(dosya)yeniBelge=await fdPolicyAwait(kiraBelgeDriveYukle(dosya,{kisaAd:hedefAdi,policeDosyaAdi:policeBelgeDosyaAdiOlustur(hedefAdi,document.getElementById('policeTur').value,bas,bit,dosya.name)},'POLICE'));const kayit={...(eski||{}),id:String(eski?.id||kiraYeniId('police')),tip:'police',merkezi:true,sirketId:aktifSirketId(),hedefTip,hedefId:String(hedefId||''),daireId:daire?String(daire.id):'',hedefAdi,eslesmeKodu,tur:document.getElementById('policeTur').value,sirket:document.getElementById('policeSirket').value.trim(),policeNo:document.getElementById('policeNo').value.trim(),bedel:paraMetniniSayiyaCevir(document.getElementById('policeBedel').value),tutar:paraMetniniSayiyaCevir(document.getElementById('policeBedel').value),baslangic:bas,bitis:bit,aciklama:document.getElementById('policeAciklama').value.trim(),belge:yeniBelge||eski?.belge||fdPoliceSentetikDuzenleme?.belge||null};const kaydedilen=await fdPolicyAwait(kiraTekKaydiVeritabaninaKaydet(kayit)),i=kiraKayitlari.findIndex(x=>String(x.id)===String(kayit.id));if(i>=0)kiraKayitlari[i]=kaydedilen;else kiraKayitlari.push(kaydedilen);veriKayitGoruntusunuYenile('kiratakip');veriOnbelleginiKaydet();modalKapat('modalPoliceKayit');policeListesiniCiz();showToast(eski?'Poliçe güncellendi.':'Poliçe kaydedildi.');}
        catch(error){
if(!fdPolicyValid())return;
if(yeniBelge?.id)fdYazilimDrivePdfSil(yeniBelge.id).catch(()=>{
if(!fdPolicyValid())return;
});showToast('Poliçe kaydedilemedi: '+(error.message||error),'error');}finally{
if(fdPolicyValid()){
buton.disabled=false;hideGlobalOverlay();
}
}
    
}catch(fdPolicyError){if(!fdPolicyValid())return;throw fdPolicyError;}
}

async function policeSil(id){
try{
fdPolicyAssert(true);
const p=policeMerkeziKayitlar().find(x=>String(x.id)===String(id));if(!p||!await fdPolicyAwait(fdYuzerOnaySor('Bu poliçe ve bağlı belgesi silinsin mi?')))return;showGlobalOverlay('Poliçe siliniyor','Kayıt kaldırılıyor...');try{if(SUPABASE_MODE){const {error}=await fdPolicyAwait(supabaseClient.from('portal_records').delete().eq('company_id',activeUser.sirketId).eq('module','kiratakip').eq('legacy_id',String(id)));if(error)throw error;}kiraKayitlari=kiraKayitlari.filter(x=>String(x.id)!==String(id));veriKayitGoruntusunuYenile('kiratakip');veriOnbelleginiKaydet();if(p.belge?.id)fdYazilimDrivePdfSil(p.belge.id).catch(()=>{
if(!fdPolicyValid())return;
});policeListesiniCiz();showToast('Poliçe silindi.');}catch(error){
if(!fdPolicyValid())return;
showToast('Poliçe silinemedi: '+(error.message||error),'error');}finally{
if(fdPolicyValid()){
hideGlobalOverlay();
}
}
}catch(fdPolicyError){if(!fdPolicyValid())return;throw fdPolicyError;}
}

function policeListesiniCiz(){
fdPolicyAssert(false);

        const body=document.getElementById('policeTakipBody');if(!body)return;policeTurSecenekleriniDoldur();const arama=String(document.getElementById('policeArama')?.value||'').toLocaleLowerCase('tr-TR'),hedef=document.getElementById('policeHedefFiltre')?.value||'',tur=document.getElementById('policeTurFiltre')?.value||'',durum=document.getElementById('policeDurumFiltre')?.value||'';
        const tum=policeTumKayitlar(),liste=tum.filter(p=>(!hedef||p.hedefTip===hedef)&&(!tur||policeMetinAnahtari(p.tur)===tur)&&(!durum||policeDurumu(p).tur===durum)&&(!arama||`${p.hedefAdi} ${p.eslesmeKodu} ${p.tur} ${p.sirket} ${p.policeNo}`.toLocaleLowerCase('tr-TR').includes(arama)));
        body.innerHTML=liste.map((p,i)=>{
if(!fdPolicyValid())return;
const d=policeDurumu(p);return`<tr><td>${i+1}</td><td><strong>${escapeDashboardText(p.hedefAdi||'-')}</strong><br><small>${escapeDashboardText(({arac:'Araç',daire:'Daire',isyeri:'İşyeri',diger:'Diğer'}[p.hedefTip]||p.hedefTip||'-'))}</small></td><td>${escapeDashboardText(p.eslesmeKodu||'-')}</td><td>${escapeDashboardText(p.tur||'-')}</td><td>${escapeDashboardText(p.sirket||'-')}<br><small>${escapeDashboardText(p.policeNo||'-')}</small></td><td>${tarihFormati(p.baslangic)}</td><td>${tarihFormati(p.bitis)}</td><td>${Number(p.bedel||0)?paraFormatla(p.bedel):'-'}</td><td><span class="police-durum police-durum-${d.tur}">${escapeDashboardText(d.metin)}</span>${p._kaynak?`<br><small>${escapeDashboardText(p._kaynak)}</small>`:''}</td><td>${policeBelgeHtml(p)}</td><td><div class="action-btns">${p._sentetik?'':`<button type="button" class="btn-modern btn-edit-modern" title="Düzenle" onclick="policeFormunuAc('${p.hedefTip}','${p.hedefId||p.daireId||''}','${p.id}')">✏️</button><button type="button" class="btn-modern btn-del-modern" title="Sil" onclick="policeSil('${p.id}')">🗑️</button>`}</div></td></tr>`;}).join('')||'<tr><td colspan="11" style="text-align:center;padding:26px;color:#64748b">Filtreye uygun poliçe bulunmuyor.</td></tr>';
        const say=(x)=>tum.filter(p=>policeDurumu(p).tur===x).length;document.getElementById('policeOzetleri').innerHTML=`<article class="personel-summary-card"><span>Toplam Poliçe</span><strong>${tum.length}</strong></article><article class="personel-summary-card"><span>Aktif</span><strong>${say('aktif')}</strong></article><article class="personel-summary-card"><span>Yaklaşan</span><strong>${say('yaklasan')}</strong></article><article class="personel-summary-card"><span>Süresi Geçen</span><strong>${say('gecen')}</strong></article>${say('planli')?`<article class="personel-summary-card"><span>Başlamadı</span><strong>${say('planli')}</strong></article>`:''}`;
    }

async function openPoliceTakipApp(hedefTip='',hedefId=''){
try{
fdPolicyAssert(false);

        if(!anaMenuModulErisimiVar('police'))return;anaMenuDonusButonunuGoster();document.querySelectorAll('body > div[id$="App"]').forEach(el=>el.style.display='none');document.getElementById('appHub').style.display='none';document.getElementById('policeTakipApp').style.display='block';showGlobalOverlay('Poliçeler yükleniyor','Araç ve mülk kayıtları eşleştiriliyor...');try{await fdPolicyAwait(supabaseVerileriniYukle('police'));policeTurSecenekleriniDoldur();policeSirketOnerileriniDoldur();policeListesiniCiz();if(hedefTip)policeFormunuAc(hedefTip,hedefId);}catch(error){
if(!fdPolicyValid())return;
showToast('Poliçe kayıtları yüklenemedi: '+(error.message||error),'error');policeListesiniCiz();}finally{
if(fdPolicyValid()){
hideGlobalOverlay();
}
}
}catch(fdPolicyError){if(!fdPolicyValid())return;throw fdPolicyError;}
}

function policeHedefTipSecenekleriniDoldur(secili=''){
fdPolicyAssert(false);

        const turler=policeVarlikTurleriniDuzelt(),form=document.getElementById('policeHedefTip'),filtre=document.getElementById('policeHedefFiltre');
        if(form){const onceki=secili||form.value;form.innerHTML=turler.map(ad=>`<option value="${policeVarlikKodu(ad)}">${escapeDashboardText(ad)}</option>`).join('');if([...form.options].some(o=>o.value===onceki))form.value=onceki;}
        if(filtre){const onceki=filtre.value;filtre.innerHTML='<option value="">Tüm Varlıklar</option>'+turler.map(ad=>`<option value="${policeVarlikKodu(ad)}">${escapeDashboardText(ad)}</option>`).join('');if([...filtre.options].some(o=>o.value===onceki))filtre.value=onceki;}
    }

function policeVarlikAramaAnahtari(deger){
fdPolicyAssert(false);
return String(deger||'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();}

function policeHedefPanelKonumunuAyarla(){
fdPolicyAssert(false);

        const panel=document.getElementById('policeHedefPanel'),ac=document.getElementById('policeHedefAc');if(!panel||panel.hidden||!ac)return;
        const alan=ac.getBoundingClientRect(),govde=ac.closest('.modal-body').getBoundingClientRect(),viewport=window.visualViewport;
        const ust=Math.max(govde.top,viewport?.offsetTop||0)+7,alt=Math.min(govde.bottom,(viewport?.offsetTop||0)+(viewport?.height||window.innerHeight))-7;
        const asagi=alt-alan.bottom-6,yukari=alan.top-ust-6,ters=asagi<180&&yukari>asagi;
        panel.classList.toggle('yukari',ters);panel.style.maxHeight=Math.max(100,Math.min(340,ters?yukari:asagi))+'px';
    }

function policeHedefAktifSatiriAyarla(sira){
fdPolicyAssert(false);

        const liste=document.getElementById('policeHedefListe'),arama=document.getElementById('policeHedefArama'),ac=document.getElementById('policeHedefAc');if(!liste)return;
        const satirlar=[...liste.querySelectorAll('[role="option"]')],aktif=sira>=0&&satirlar.length?satirlar[Math.min(sira,satirlar.length-1)]:null;
        liste.dataset.aktif=aktif?String(satirlar.indexOf(aktif)):'-1';satirlar.forEach(s=>s.classList.toggle('klavye-aktif',s===aktif));
        for(const el of [arama,ac]){if(!el)continue;if(aktif)el.setAttribute('aria-activedescendant',aktif.id);else el.removeAttribute('aria-activedescendant');}
        if(aktif&&!document.getElementById('policeHedefPanel').hidden){const r=aktif.getBoundingClientRect(),kutu=liste.getBoundingClientRect();if(r.top<kutu.top)liste.scrollTop-=kutu.top-r.top;else if(r.bottom>kutu.bottom)liste.scrollTop+=r.bottom-kutu.bottom;}
    }

function policeHedefSeciciGuncelle(){
fdPolicyAssert(false);

        const secici=document.getElementById('policeHedefSecici'),select=document.getElementById('policeHedefId'),liste=document.getElementById('policeHedefListe'),ac=document.getElementById('policeHedefAc');if(!secici||!select||!liste)return;
        const secilen=(select.fdPoliceHedefListe||[]).find(x=>x.id===select.value),etiket=document.getElementById('policeHedefGorunen');etiket.textContent=secilen?.ad||'Varlık seçin';ac.title=secilen?.ad||'Varlık listesini aç';if(secilen)ac.removeAttribute('aria-invalid');
        let i=0;liste.innerHTML=[...select.options].filter(o=>o.value).map(o=>{
if(!fdPolicyValid())return;

            const parcalar=o.textContent.split(' · '),ad=parcalar.shift(),detay=parcalar.join(' · '),korunan=o.parentElement.tagName==='OPTGROUP',id='policeHedefSonuc_'+i++;
            return(korunan?'<div class="police-varlik-mevcut">Mevcut seçim</div>':'')+'<button type="button" tabindex="-1" role="option" class="police-varlik-sonuc" id="'+id+'" data-id="'+escapeDashboardText(o.value)+'" '+(korunan?'data-korunan="1" ':'')+'aria-selected="'+String(o.value===select.value)+'" onclick="policeHedefListesindenSec(this.dataset.id)"><strong>'+escapeDashboardText(ad)+'</strong>'+(detay?'<small>'+escapeDashboardText(detay)+'</small>':'')+'</button>';
        }).join('');
        const satirlar=[...liste.querySelectorAll('[role="option"]')],arama=document.getElementById('policeHedefArama');
        policeHedefAktifSatiriAyarla(arama.value?satirlar.findIndex(s=>!s.dataset.korunan):Math.max(0,satirlar.findIndex(s=>s.dataset.id===select.value)));
        if(!secici.dataset.dinleyiciler){
            secici.dataset.dinleyiciler='1';
            fdPoliceListen(select,'invalid',event=>{
if(!fdPolicyValid())return;
event.preventDefault();ac.setAttribute('aria-invalid','true');policeHedefListesiniAc(true);});
            fdPoliceListen(document,'pointerdown',event=>{
if(!fdPolicyValid())return;
if(!secici.contains(event.target))policeHedefListesiniKapat();},true);
            fdPoliceListen(document.getElementById('policeForm'),'reset',()=>policeHedefListesiniKapat());
            fdPoliceListen(window,'resize',policeHedefPanelKonumunuAyarla);fdPoliceListen(window.visualViewport,'resize',policeHedefPanelKonumunuAyarla);
            fdPoliceListen(document,'scroll',event=>{
if(!fdPolicyValid())return;
if(event.target!==liste)policeHedefPanelKonumunuAyarla();},true);
        }
        policeHedefPanelKonumunuAyarla();
    }

function policeHedefListesiniKapat(odak=false){
fdPolicyAssert(false);

        const panel=document.getElementById('policeHedefPanel'),ac=document.getElementById('policeHedefAc');if(panel)panel.hidden=true;
        if(ac){ac.setAttribute('aria-expanded','false');ac.removeAttribute('aria-activedescendant');if(odak)ac.focus();}
        document.getElementById('policeHedefArama')?.removeAttribute('aria-activedescendant');
    }

function policeHedefListesiniAc(acik){
fdPolicyAssert(false);

        const panel=document.getElementById('policeHedefPanel'),ac=document.getElementById('policeHedefAc'),arama=document.getElementById('policeHedefArama');if(!panel||!ac)return;
        if(acik!==true&&!panel.hidden){policeHedefListesiniKapat();return;}
        if(panel.hidden){arama.value='';policeHedefAramasiniUygula();}
        panel.hidden=false;ac.setAttribute('aria-expanded','true');policeHedefPanelKonumunuAyarla();arama.focus({preventScroll:true});
    }

function policeHedefListesindenSec(id){
fdPolicyAssert(false);

        const select=document.getElementById('policeHedefId');if(!select||(select.fdPoliceHedefListe||[]).every(x=>x.id!==String(id)))return;
        select.value=String(id);if(select.value!==String(id))return;
        select.dispatchEvent(new Event('change',{bubbles:true}));policeHedefListesiniKapat(true);
    }

function policeHedefKlavye(event){
fdPolicyAssert(false);

        const panel=document.getElementById('policeHedefPanel'),liste=document.getElementById('policeHedefListe');if(!panel||!liste)return;
        if(event.key==='Escape'&&!panel.hidden){event.preventDefault();event.stopPropagation();policeHedefListesiniKapat(true);return;}
        if(event.key==='Tab'&&!panel.hidden){policeHedefListesiniKapat();return;}
        if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)&&(event.target.id==='policeHedefAc'||event.key.startsWith('Arrow'))){
            event.preventDefault();const kapali=panel.hidden;policeHedefListesiniAc(true);const n=liste.querySelectorAll('[role="option"]').length,onceki=Number(liste.dataset.aktif??-1);
            policeHedefAktifSatiriAyarla(event.key==='Home'?0:event.key==='End'?n-1:kapali?(event.key==='ArrowUp'?n-1:0):event.key==='ArrowDown'?Math.min(n-1,onceki+1):Math.max(0,onceki-1));return;
        }
        if(event.key==='Enter'&&!panel.hidden){event.preventDefault();event.stopPropagation();const satir=liste.querySelectorAll('[role="option"]')[Number(liste.dataset.aktif)];if(satir)policeHedefListesindenSec(satir.dataset.id);}
    }

function policeHedefAramasiniUygula(secili){
fdPolicyAssert(false);

        const select=document.getElementById('policeHedefId'),arama=document.getElementById('policeHedefArama'),ozet=document.getElementById('policeHedefAramaOzeti'),temizle=document.getElementById('policeHedefAramaTemizle');if(!select)return;
        const liste=select.fdPoliceHedefListe||[],aranan=policeVarlikAramaAnahtari(arama?.value),kompakt=aranan.replace(/\s/g,''),secim=String(secili??select.value??''),secilen=liste.find(x=>x.id===secim),sonuclar=liste.filter(x=>{
if(!fdPolicyValid())return;
const ad=policeVarlikAramaAnahtari(x.ad);return !aranan||ad.includes(aranan)||ad.replace(/\s/g,'').includes(kompakt);}),korunan=secilen&&!sonuclar.some(x=>x.id===secilen.id),option=x=>`<option value="${escapeDashboardText(x.id)}">${escapeDashboardText(x.ad)}</option>`;
        select.innerHTML='<option value="">'+(sonuclar.length?'Varlık seçin':'Aramaya uygun varlık bulunamadı')+'</option>'+(korunan?'<optgroup label="Mevcut seçim">'+option(secilen)+'</optgroup>':'')+sonuclar.map(option).join('');select.value=secilen?secilen.id:'';
        if(ozet)ozet.textContent=(sonuclar.length?sonuclar.length+' varlık'+(aranan?' bulundu':' listeleniyor'):'Aramaya uygun varlık bulunamadı')+(korunan?' · Mevcut seçim korunuyor':'');if(temizle)temizle.disabled=!arama?.value;policeHedefBilgisiniGuncelle();policeHedefSeciciGuncelle();
    }

function policeHedefAramasiniTemizle(){
fdPolicyAssert(false);
const arama=document.getElementById('policeHedefArama');if(arama)arama.value='';policeHedefAramasiniUygula();arama?.focus();}

policeHedefSecenekleriniDoldur=function(secili=''){
fdPolicyAssert(false);

        policeHedefListesiniKapat();
        const tip=document.getElementById('policeHedefTip')?.value||'arac',select=document.getElementById('policeHedefId'),secimGrubu=document.getElementById('policeHedefSecimGrubu'),serbest=document.getElementById('policeDigerAdGrubu'),bagli=policeBagliVarlikTuruMu(tip);
        const liste=tip==='arac'?araclar.filter(a=>aktifSirketeAit(a)&&(policeMetinAnahtari(a.durum)!=='SATILDI'||String(a.id)===String(secili))).map(a=>({id:String(a.id),ad:a.plaka+' · '+[a.marka,a.model].filter(Boolean).join(' ')})):tip==='daire'||tip==='isyeri'?kiraDaireler().filter(d=>aktifSirketeAit(d)&&((d.mulkTuru==='isyeri'?'isyeri':'daire')===tip||String(d.id)===String(secili))).map(d=>({id:String(d.id),ad:(d.kisaAd||d.ad||'İsimsiz mülk')+(d.uavt?' · UAVT '+d.uavt:' · UAVT YOK')})):[];
        secimGrubu.style.display=bagli?'':'none';serbest.style.display=bagli?'none':'';select.required=bagli;document.getElementById('policeDigerAd').required=!bagli;select.fdPoliceHedefListe=liste.sort((a,b)=>a.ad.localeCompare(b.ad,'tr',{numeric:true}));const arama=document.getElementById('policeHedefArama');if(arama){arama.value='';arama.placeholder=tip==='arac'?'Plaka, marka veya model ara':'Daire/işyeri adı veya UAVT ara';}policeHedefAramasiniUygula(String(secili||''));
    };

policeHedefBilgisiniGuncelle=function(){
fdPolicyAssert(false);

        const tip=document.getElementById('policeHedefTip')?.value||'arac',id=document.getElementById('policeHedefId')?.value,kod=document.getElementById('policeEslesmeKodu'),etiket=document.getElementById('policeEslesmeKoduEtiket');
        if(tip==='arac'){const a=araclar.find(x=>String(x.id)===String(id));etiket.textContent='Plaka';kod.value=a?.plaka||'';kod.readOnly=true;}
        else if(tip==='daire'||tip==='isyeri'){const d=kiraDaireler().find(x=>String(x.id)===String(id));etiket.textContent='UAVT Kodu';kod.value=d?.uavt||'';kod.readOnly=true;}
        else{etiket.textContent='Referans / Kimlik Kodu';kod.readOnly=false;if(!document.getElementById('policeEditId')?.value)kod.value='';}
    };

const policeFormVarlikOncesi=policeFormunuAc;

policeFormunuAc=function(hedefTip='arac',hedefId='',kayitId=''){
fdPolicyAssert(true);
policeHedefTipSecenekleriniDoldur(hedefTip);policeFormVarlikOncesi(hedefTip,hedefId,kayitId);};

const policeEkranAcmaOncesi=openPoliceTakipApp;

openPoliceTakipApp=async function(hedefTip='',hedefId=''){
try{
fdPolicyAssert(false);
if(hedefTip&&typeof hedefTip==='object'){hedefTip='';hedefId='';}policeHedefTipSecenekleriniDoldur();return policeEkranAcmaOncesi(hedefTip,hedefId);
}catch(fdPolicyError){if(!fdPolicyValid())return;throw fdPolicyError;}
};

function fdPoliceFiltreliListe(tum=policeGuncelKayitlar()){
fdPolicyAssert(false);

        tum=policeGuncelKayitlar(tum);
        const arama=String(document.getElementById('policeArama')?.value||'').toLocaleLowerCase('tr-TR'),hedef=document.getElementById('policeHedefFiltre')?.value||'',tur=document.getElementById('policeTurFiltre')?.value||'',durum=document.getElementById('policeDurumFiltre')?.value||'',varlikMetni=p=>`${p.hedefAdi||''} ${p.eslesmeKodu||''}`.toLocaleLowerCase('tr-TR'),varliktaEslesen=Boolean(arama&&tum.some(p=>varlikMetni(p).includes(arama))),aramaUyuyor=p=>!arama||(varliktaEslesen?varlikMetni(p).includes(arama):`${p.hedefAdi||''} ${p.eslesmeKodu||''} ${p.tur||''} ${p.sirket||''} ${p.policeNo||''}`.toLocaleLowerCase('tr-TR').includes(arama));
        return tum.filter(p=>(!hedef||p.hedefTip===hedef)&&(!tur||policeMetinAnahtari(p.tur)===tur)&&(!durum||policeDurumu(p).tur===durum)&&aramaUyuyor(p));
    }

policeListesiniCiz=function(){
fdPolicyAssert(false);

        const body=document.getElementById('policeTakipBody');if(!body)return;policeHedefTipSecenekleriniDoldur();policeTurSecenekleriniDoldur();const tum=policeGuncelKayitlar(),liste=fdPoliceFiltreliListe(tum);
        body.innerHTML=liste.map((p,i)=>{
if(!fdPolicyValid())return;
const d=policeDurumu(p);return`<tr><td>${i+1}</td><td><strong>${escapeDashboardText(p.hedefAdi||'-')}</strong><br><small>${escapeDashboardText(policeVarlikTurAdi(p.hedefTip))}</small></td><td>${escapeDashboardText(p.eslesmeKodu||'-')}</td><td>${policeTurRozeti(p.tur)}</td><td>${escapeDashboardText(p.sirket||'-')}<br><small>${escapeDashboardText(p.policeNo||'-')}</small></td><td>${tarihFormati(p.baslangic)}</td><td>${tarihFormati(p.bitis)}</td><td>${Number(p.bedel||0)?paraFormatla(p.bedel):'-'}</td><td><span class="police-durum police-durum-${d.tur}">${escapeDashboardText(d.metin)}</span></td><td>${policeBelgeHtml(p)}</td><td><div class="action-btns">${p._sentetik?'':`<button type="button" class="btn-modern btn-edit-modern" title="Düzenle" onclick="policeFormunuAc('${p.hedefTip}','${p.hedefId||p.daireId||''}','${p.id}')">✏️</button><button type="button" class="btn-modern btn-del-modern" title="Sil" onclick="policeSil('${p.id}')">🗑️</button>`}</div></td></tr>`;}).join('')||'<tr><td colspan="11" style="text-align:center;padding:26px;color:#64748b">Filtreye uygun poliçe bulunmuyor.</td></tr>';const say=x=>tum.filter(p=>policeDurumu(p).tur===x).length;document.getElementById('policeOzetleri').innerHTML=`<article class="personel-summary-card"><span>Toplam Poliçe</span><strong>${tum.length}</strong></article><article class="personel-summary-card"><span>Aktif</span><strong>${say('aktif')}</strong></article><article class="personel-summary-card"><span>Yaklaşan</span><strong>${say('yaklasan')}</strong></article><article class="personel-summary-card"><span>Süresi Geçen</span><strong>${say('gecen')}</strong></article>${say('planli')?`<article class="personel-summary-card"><span>Başlamadı</span><strong>${say('planli')}</strong></article>`:''}`;
    };

let fdPoliceSentetikDuzenleme=null;

const fdPoliceFormAcmaOnceki=policeFormunuAc;

policeFormunuAc=function(hedefTip='arac',hedefId='',kayitId=''){
fdPolicyAssert(true);
fdPoliceSentetikDuzenleme=null;const sonuc=fdPoliceFormAcmaOnceki(hedefTip,hedefId,kayitId),sil=document.getElementById('policeModalSilBtn'),modal=document.getElementById('modalPoliceKayit');if(modal)modal.dataset.editId=String(kayitId||'');if(sil)sil.style.display=kayitId?'inline-flex':'none';return sonuc;};

function policeSentetikFormunuDoldur(p){
fdPolicyAssert(true);

        policeFormunuAc(p.hedefTip||'arac',p.hedefId||p.daireId||'','');fdPoliceSentetikDuzenleme={...p};document.getElementById('policeModalSilBtn').style.display='inline-flex';document.getElementById('policeModalBaslik').textContent='✏️ Poliçeyi Düzenle';document.getElementById('policeKaydetBtn').textContent='💾 Değişiklikleri Kaydet';document.getElementById('policeDigerAd').value=p.hedefAdi||p.varlikAdi||'';document.getElementById('policeEslesmeKodu').value=policeKayitEslesmeKodu(p);policeTurSecenekleriniDoldur(policeMetinAnahtari(p.tur));document.getElementById('policeSirket').value=p.sirket||'';document.getElementById('policeNo').value=p.policeNo||'';document.getElementById('policeBedel').value=Number(p.bedel||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});document.getElementById('policeBaslangic').value=p.baslangic||'';document.getElementById('policeBitis').value=p.bitis||'';document.getElementById('policeAciklama').value=p.aciklama||p.not||'';
    }

async function policeKaydiniDuzenle(id){
try{
fdPolicyAssert(true);
const p=policeTumKayitlar().find(x=>String(x.id)===String(id));if(!p)return showToast('Poliçe kaydı bulunamadı.','error');if(!anaMenuModulYazmaYetkisiVar('police'))return showToast('Poliçe düzenleme yetkiniz bulunmuyor.','warning');if(p._sentetik)return policeSentetikFormunuDoldur(p);policeFormunuAc(p.hedefTip,p.hedefId||p.daireId||'',p.id);
}catch(fdPolicyError){if(!fdPolicyValid())return;throw fdPolicyError;}
}

function policeVarlikGecmisiniAc(id,saltGorunum=false){
fdPolicyAssert(false);

        const tum=policeTumKayitlar(),secili=tum.find(p=>String(p.id)===String(id));if(!secili)return;const varlik=policeGuncelVarlikAnahtari(secili),liste=tum.filter(p=>varlik?policeGuncelVarlikAnahtari(p)===varlik:p===secili).sort(policeBitisSiralama);let modal=document.getElementById('modalPoliceVarlikGecmis');if(!modal){modal=document.createElement('div');modal.id='modalPoliceVarlikGecmis';modal.className='modal-overlay';document.body.appendChild(modal);}
        modal.innerHTML=`<div class="modal-card" style="max-width:1180px"><div class="modal-header police-gecmis-baslik"><h3>🛡️ ${escapeDashboardText(secili.hedefAdi||'-')} — Poliçe Geçmişi</h3><button type="button" class="modal-close" onclick="modalKapat('modalPoliceVarlikGecmis')">✕</button></div><div class="modal-body"><div class="table-wrapper"><table class="police-gecmis-tablo"><thead><tr><th>#</th><th>Poliçe Türü</th><th>Şirket / Poliçe No</th><th>Başlangıç</th><th>Bitiş</th><th>Prim</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>${liste.map((p,i)=>{
if(!fdPolicyValid())return;
const d=policeDurumu(p);return`<tr><td>${i+1}</td><td>${policeTurRozeti(p.tur,p.belge,p.id)}</td><td>${escapeDashboardText(p.sirket||'-')}<br><small>${escapeDashboardText(p.policeNo||'-')}</small></td><td>${tarihFormati(p.baslangic)}</td><td>${tarihFormati(p.bitis)}</td><td>${Number(p.bedel||0)?paraFormatla(p.bedel):'-'}</td><td><span class="police-durum police-durum-${d.tur}">${escapeDashboardText(d.metin)}</span></td><td><button type="button" class="btn-modern btn-edit-modern" title="Düzenle" onclick="modalKapat('modalPoliceVarlikGecmis');policeKaydiniDuzenle('${escapeDashboardText(String(p.id))}')">✏️</button></td></tr>`;}).join('')}</tbody></table></div></div></div>`;if(saltGorunum)modal.querySelectorAll('table tr').forEach(tr=>tr.lastElementChild?.remove());modal.style.display='flex';
    }

function policeBelgeDosyaAdiOlustur(varlik,tur,baslangic,bitis,dosyaAdi='belge.pdf'){
fdPolicyAssert(false);

        const uzanti=String(dosyaAdi).split('.').pop().replace(/[^a-zA-Z0-9]/g,'').toLowerCase()||'pdf',temiz=x=>String(x||'').trim().toLocaleUpperCase('tr-TR').replace(/[^A-ZÇĞİÖŞÜ0-9]+/g,'_').replace(/^_+|_+$/g,''),tarih=x=>{
if(!fdPolicyValid())return;
const [y,a,g]=String(x||'').split('-');return y&&a&&g?`${g}.${a}.${y}`:'';};
        return [temiz(varlik)||'VARLIK',temiz(tur)||'POLİÇE',tarih(baslangic),tarih(bitis)].filter(Boolean).join('_')+'.'+uzanti;
    }

let policeOnizlemeId='';

function policeOnizlemePenceresiniHazirla(){
fdPolicyAssert(false);

        let modal=document.getElementById('modalPoliceOnizleme');if(modal)return modal;
        modal=document.createElement('div');modal.id='modalPoliceOnizleme';modal.className='modal-overlay evrak-preview-modal';modal.innerHTML='<div class="modal-card"><div class="modal-header"><h3 id="policeOnizlemeBaslik">Poliçe Görüntüleme</h3><button class="modal-close" type="button" onclick="policeOnizlemeyiKapat()">✕</button></div><div class="evrak-preview-body"><iframe id="policeOnizlemeFrame" title="Poliçe önizleme" style="display:block;width:100%;height:100%;min-height:62vh;border:0;border-radius:8px;background:#fff"></iframe></div><div class="evrak-preview-actions"><button id="policeOnizlemeIndirBtn" class="btn-modern btn-detail-modern" type="button" onclick="policeOnizlemeIndir()">⬇ İndir</button><button class="btn-submit" type="button" onclick="policeOnizlemeyiDrivedaAc()">↗ Drive\'da Aç</button></div></div>';
        document.body.appendChild(modal);return modal;
    }

function policeBelgesiniAc(kayitId){
fdPolicyAssert(false);

        const p=policeTumKayitlar().find(x=>String(x.id)===String(kayitId));if(!p?.belge?.id)return showToast('Bu poliçeye bağlı belge bulunmuyor.','warning');
        const modal=policeOnizlemePenceresiniHazirla();policeOnizlemeId=String(p.id);document.getElementById('policeOnizlemeBaslik').textContent=(p.hedefAdi||'Poliçe')+' · '+(p.tur||'Poliçe');document.getElementById('policeOnizlemeFrame').src='https:\x2f\x2fdrive.google.com/file/d/'+encodeURIComponent(p.belge.id)+'/preview';modal.style.display='flex';
    }

function policeOnizlemeyiKapat(){
fdPolicyAssert(false);
const frame=document.getElementById('policeOnizlemeFrame');if(frame)frame.src='about:blank';policeOnizlemeId='';modalKapat('modalPoliceOnizleme');}

function policeOnizlemeyiDrivedaAc(){
fdPolicyAssert(false);
const p=policeTumKayitlar().find(x=>String(x.id)===String(policeOnizlemeId));if(!p?.belge)return;window.open(p.belge.url||('https:\x2f\x2fdrive.google.com/open?id='+encodeURIComponent(p.belge.id||'')),'_blank','noopener');}

async function policeOnizlemeIndir(){
try{
fdPolicyAssert(false);
const p=policeTumKayitlar().find(x=>String(x.id)===String(policeOnizlemeId)),buton=document.getElementById('policeOnizlemeIndirBtn');if(!p?.belge?.id)return;buton.disabled=true;buton.textContent='İndiriliyor...';try{const dosya=await fdPolicyAwait(fdYazilimDriveDosyaIndir(p.belge.id,'KİRA TAKİP')),ham=atob(dosya.base64),baytlar=new Uint8Array(ham.length);for(let i=0;i<ham.length;i++)baytlar[i]=ham.charCodeAt(i);const adres=URL.createObjectURL(new Blob([baytlar],{type:dosya.mimeType||p.belge.mimeType||'application/octet-stream'})),baglanti=document.createElement('a');baglanti.href=adres;baglanti.download=dosya.ad||p.belge.ad||'police';document.body.appendChild(baglanti);baglanti.click();baglanti.remove();setTimeout(()=>URL.revokeObjectURL(adres),1000);}catch(error){
if(!fdPolicyValid())return;
console.error(error);showToast('Poliçe indirilemedi: '+(error.message||error),'error');}finally{
if(fdPolicyValid()){
buton.disabled=false;buton.textContent='⬇ İndir';
}
}
}catch(fdPolicyError){if(!fdPolicyValid())return;throw fdPolicyError;}
}

policeListesiniCiz=function(){
fdPolicyAssert(false);

        const body=document.getElementById('policeTakipBody');if(!body)return;policeHedefTipSecenekleriniDoldur();policeTurSecenekleriniDoldur();const tum=policeGuncelKayitlar(),liste=fdPoliceFiltreliListe(tum);
        body.innerHTML=liste.map((p,i)=>{
if(!fdPolicyValid())return;
const d=policeDurumu(p);return`<tr><td>${i+1}</td><td><button type="button" class="police-varlik-link" onclick="policeVarlikGecmisiniAc('${escapeDashboardText(String(p.id))}')">${escapeDashboardText(p.hedefAdi||'-')}</button><br><small>${escapeDashboardText(policeVarlikTurAdi(p.hedefTip))}</small></td><td>${policeTurRozeti(p.tur,p.belge,p.id)}</td><td>${escapeDashboardText(p.sirket||'-')}<br><small>${escapeDashboardText(p.policeNo||'-')}</small></td><td>${tarihFormati(p.baslangic)}</td><td>${tarihFormati(p.bitis)}</td><td>${Number(p.bedel||0)?paraFormatla(p.bedel):'-'}</td><td><span class="police-durum police-durum-${d.tur}">${escapeDashboardText(d.metin)}</span></td><td><div class="action-btns"><button type="button" class="btn-modern btn-edit-modern" title="Düzenle" onclick="policeKaydiniDuzenle('${escapeDashboardText(String(p.id))}')">✏️</button></div></td></tr>`;}).join('')||'<tr><td colspan="9" style="text-align:center;padding:26px;color:#64748b">Filtreye uygun poliçe bulunmuyor.</td></tr>';const say=x=>tum.filter(p=>policeDurumu(p).tur===x).length;document.getElementById('policeOzetleri').innerHTML=`<article class="personel-summary-card"><span>Toplam Poliçe</span><strong>${tum.length}</strong></article><article class="personel-summary-card"><span>Aktif</span><strong>${say('aktif')}</strong></article><article class="personel-summary-card"><span>Yaklaşan</span><strong>${say('yaklasan')}</strong></article><article class="personel-summary-card"><span>Süresi Geçen</span><strong>${say('gecen')}</strong></article>${say('planli')?`<article class="personel-summary-card"><span>Başlamadı</span><strong>${say('planli')}</strong></article>`:''}`;
    };

async function policeSentetikKaydiniSil(p){
try{
fdPolicyAssert(true);

        const arac=araclar.find(a=>String(a.id)===String(p.hedefId));if(!arac)throw new Error('Poliçenin bağlı olduğu araç bulunamadı.');const onceki=JSON.parse(JSON.stringify(arac));let belge=p.belge||null;
        if(String(p.id).startsWith('eski_sigorta_')){Object.assign(arac,{sigortaSirketi:'',sigortaPoliceNo:'',sigortaBedeli:0,sigortaBaslangic:'',sigortaBitis:''});if(arac.belgeler)arac.belgeler.sigorta=null;}
        else if(String(p.id).startsWith('eski_kasko_')){Object.assign(arac,{kaskoSirketi:'',kaskoPoliceNo:'',kaskoBedeli:0,kaskoBaslangic:'',kaskoBitis:''});if(arac.belgeler)arac.belgeler.kasko=null;}
        else{const ayni=k=>policeMetinAnahtari(k.policeNo||'')===policeMetinAnahtari(p.policeNo||'')&&String(k.baslangic||'')===String(p.baslangic||'')&&String(k.bitis||'')===String(p.bitis||'')&&policeMetinAnahtari(k.tur||'')===policeMetinAnahtari(p.tur||'');const bulunan=(arac.sigortaGecmisi||[]).find(ayni);belge=bulunan?.belge||belge;arac.sigortaGecmisi=(arac.sigortaGecmisi||[]).filter(k=>!ayni(k));}
        try{await fdPolicyAwait(aracTekKaydiKaydet(arac));if(belge?.id)fdYazilimDrivePdfSil(belge.id).catch(()=>{
if(!fdPolicyValid())return;
});}catch(error){
if(!fdPolicyValid())return;
Object.keys(arac).forEach(k=>delete arac[k]);Object.assign(arac,onceki);throw error;}
    
}catch(fdPolicyError){if(!fdPolicyValid())return;throw fdPolicyError;}
}

async function policeModalKaydiniSil(){
try{
fdPolicyAssert(true);

        const sentetik=fdPoliceSentetikDuzenleme,editId=String(document.getElementById('policeEditId')?.value||document.getElementById('modalPoliceKayit')?.dataset.editId||'');if(sentetik){if(!await fdPolicyAwait(fdYuzerOnaySor('Bu poliçe ve bağlı belgesi silinsin mi?')))return;showGlobalOverlay('Poliçe siliniyor','Kayıt kaldırılıyor...');try{await fdPolicyAwait(policeSentetikKaydiniSil(sentetik));fdPoliceSentetikDuzenleme=null;modalKapat('modalPoliceKayit');policeListesiniCiz();aracTumTakipListeleriniCiz();showToast('Poliçe silindi.');}catch(error){
if(!fdPolicyValid())return;
showToast('Poliçe silinemedi: '+(error.message||error),'error');}finally{
if(fdPolicyValid()){
hideGlobalOverlay();
}
}return;}if(!editId)return;modalKapat('modalPoliceKayit');await fdPolicyAwait(policeSil(editId));
    
}catch(fdPolicyError){if(!fdPolicyValid())return;throw fdPolicyError;}
}

const fdPoliceMerkeziKaydetOnceki=policeKaydet;

async function policeSentetikDegisikliginiKaydet(event,p){
try{
fdPolicyAssert(true);

        event.preventDefault();const buton=document.getElementById('policeKaydetBtn'),arac=araclar.find(a=>String(a.id)===String(p.hedefId));if(!arac)return showToast('Poliçenin bağlı olduğu araç bulunamadı.','error');const onceki=JSON.parse(JSON.stringify(arac)),dosya=document.getElementById('policeBelge').files?.[0],deger={tur:document.getElementById('policeTur').value,sirket:document.getElementById('policeSirket').value.trim(),policeNo:document.getElementById('policeNo').value.trim(),bedel:paraMetniniSayiyaCevir(document.getElementById('policeBedel').value),baslangic:document.getElementById('policeBaslangic').value,bitis:document.getElementById('policeBitis').value,aciklama:document.getElementById('policeAciklama').value.trim()},eskiBelge=p.belge||null;let yeniBelge=null;
        if(!deger.sirket||!deger.policeNo||!deger.baslangic||!deger.bitis||deger.bitis<deger.baslangic)return showToast('Poliçe bilgilerini ve tarihlerini kontrol edin.','warning');buton.disabled=true;showGlobalOverlay('Poliçe güncelleniyor',dosya?'Yeni belge yükleniyor ve araç kaydı doğrulanıyor...':'Araç poliçesi kaydediliyor...');
        try{
            if(dosya)yeniBelge=await fdPolicyAwait(kiraBelgeDriveYukle(dosya,{kisaAd:arac.plaka,policeDosyaAdi:policeBelgeDosyaAdiOlustur(arac.plaka,deger.tur,deger.baslangic,deger.bitis,dosya.name)},'POLICE'));const belge=yeniBelge||eskiBelge;arac.belgeler||={};
            if(String(p.id).startsWith('eski_sigorta_')){Object.assign(arac,{sigortaSirketi:deger.sirket,sigortaPoliceNo:deger.policeNo,sigortaBedeli:deger.bedel,sigortaBaslangic:deger.baslangic,sigortaBitis:deger.bitis});arac.belgeler.sigorta=belge;}
            else if(String(p.id).startsWith('eski_kasko_')){Object.assign(arac,{kaskoSirketi:deger.sirket,kaskoPoliceNo:deger.policeNo,kaskoBedeli:deger.bedel,kaskoBaslangic:deger.baslangic,kaskoBitis:deger.bitis});arac.belgeler.kasko=belge;}
            else{const ayni=k=>policeMetinAnahtari(k.policeNo||'')===policeMetinAnahtari(p.policeNo||'')&&String(k.baslangic||'')===String(p.baslangic||'')&&String(k.bitis||'')===String(p.bitis||'')&&policeMetinAnahtari(k.tur||'')===policeMetinAnahtari(p.tur||''),index=(arac.sigortaGecmisi||[]).findIndex(ayni);if(index<0)throw new Error('Düzenlenecek eski poliçe kaydı bulunamadı.');arac.sigortaGecmisi[index]={...arac.sigortaGecmisi[index],...deger,belge};}
            await fdPolicyAwait(aracTekKaydiKaydet(arac));fdPoliceSentetikDuzenleme=null;modalKapat('modalPoliceKayit');policeListesiniCiz();aracTumTakipListeleriniCiz();showToast('Poliçe değişiklikleri kaydedildi.');
        }catch(error){
if(!fdPolicyValid())return;
Object.keys(arac).forEach(k=>delete arac[k]);Object.assign(arac,onceki);if(yeniBelge?.id)fdYazilimDrivePdfSil(yeniBelge.id).catch(()=>{
if(!fdPolicyValid())return;
});showToast('Poliçe güncellenemedi: '+(error.message||error),'error');}finally{
if(fdPolicyValid()){
buton.disabled=false;hideGlobalOverlay();
}
}
    
}catch(fdPolicyError){if(!fdPolicyValid())return;throw fdPolicyError;}
}

policeKaydet=async function(event){
try{
fdPolicyAssert(true);
if(fdPoliceSentetikDuzenleme)return policeSentetikDegisikliginiKaydet(event,fdPoliceSentetikDuzenleme);const gizli=document.getElementById('policeEditId'),modal=document.getElementById('modalPoliceKayit'),duzenlenen=String(modal?.dataset.editId||'');if(gizli&&duzenlenen)gizli.value=duzenlenen;return fdPoliceMerkeziKaydetOnceki(event);
}catch(fdPolicyError){if(!fdPolicyValid())return;throw fdPolicyError;}
};
const api={get policeTurSecenekleriniDoldur(){return policeTurSecenekleriniDoldur},get policeSirketOnerileriniDoldur(){return policeSirketOnerileriniDoldur},get policeHedefSecenekleriniDoldur(){return policeHedefSecenekleriniDoldur},get policeHedefBilgisiniGuncelle(){return policeHedefBilgisiniGuncelle},get policeBitisiniBirYilSonrayaAyarla(){return policeBitisiniBirYilSonrayaAyarla},get policeFormunuAc(){return policeFormunuAc},get policeKaydet(){return policeKaydet},get policeSil(){return policeSil},get policeListesiniCiz(){return policeListesiniCiz},get policeHedefTipSecenekleriniDoldur(){return policeHedefTipSecenekleriniDoldur},get policeVarlikAramaAnahtari(){return policeVarlikAramaAnahtari},get policeHedefPanelKonumunuAyarla(){return policeHedefPanelKonumunuAyarla},get policeHedefAktifSatiriAyarla(){return policeHedefAktifSatiriAyarla},get policeHedefSeciciGuncelle(){return policeHedefSeciciGuncelle},get policeHedefListesiniKapat(){return policeHedefListesiniKapat},get policeHedefListesiniAc(){return policeHedefListesiniAc},get policeHedefListesindenSec(){return policeHedefListesindenSec},get policeHedefKlavye(){return policeHedefKlavye},get policeHedefAramasiniUygula(){return policeHedefAramasiniUygula},get policeHedefAramasiniTemizle(){return policeHedefAramasiniTemizle},get fdPoliceFiltreliListe(){return fdPoliceFiltreliListe},get policeSentetikFormunuDoldur(){return policeSentetikFormunuDoldur},get policeKaydiniDuzenle(){return policeKaydiniDuzenle},get policeVarlikGecmisiniAc(){return policeVarlikGecmisiniAc},get policeBelgeDosyaAdiOlustur(){return policeBelgeDosyaAdiOlustur},get policeOnizlemePenceresiniHazirla(){return policeOnizlemePenceresiniHazirla},get policeBelgesiniAc(){return policeBelgesiniAc},get policeOnizlemeyiKapat(){return policeOnizlemeyiKapat},get policeOnizlemeyiDrivedaAc(){return policeOnizlemeyiDrivedaAc},get policeOnizlemeIndir(){return policeOnizlemeIndir},get policeSentetikKaydiniSil(){return policeSentetikKaydiniSil},get policeModalKaydiniSil(){return policeModalKaydiniSil},get policeSentetikDegisikliginiKaydet(){return policeSentetikDegisikliginiKaydet}};
return {init:fdPolicyInit,open(...args){fdPolicyAssert();const action=args[0];if(action?.fdPolicyAction){const fn=api[action.fdPolicyAction];if(!fn)throw Error("Tanımsız poliçe işlemi");return fn(...action.args)}return openPoliceTakipApp(...args)},api,dispose(){fdPolicyDisposed=true;const tab=typeof fdAcikUygulamaSekmeleri!=="undefined"?fdAcikUygulamaSekmeleri.find(t=>t.anahtar==="police"):null;if(tab)tab.alanId="";for(const [target,...args] of fdPolicyListeners)target.removeEventListener(...args);fdPolicyListeners.length=0;for(const id of fdPolicyTimers)window.clearTimeout(id);fdPolicyTimers.clear();for(const url of fdPolicyUrls)window.URL.revokeObjectURL(url);fdPolicyUrls.clear();const frame=document.getElementById("policeOnizlemeFrame");if(frame)frame.src="about:blank";document.getElementById("policeForm")?.reset();document.querySelectorAll("#modalPoliceKayit input[type=file]").forEach(el=>el.value="");fdPoliceSentetikDuzenleme=null;policeOnizlemeId="";if(fdPolicyOverlay)hideGlobalOverlay();}};
});

