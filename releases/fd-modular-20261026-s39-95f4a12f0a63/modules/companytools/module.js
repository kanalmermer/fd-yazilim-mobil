window.FDModules.define('companytools',function(){

let fdToolsDisposed=false,fdToolsOverlay=null,fdToolsNavigation=0;const fdToolsInitial=fdToolsContext(),fdToolsDialogs=new Set(),fdToolsHooks=[];
function fdToolsContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||''])}
function fdToolsValid(){return !fdToolsDisposed&&fdToolsInitial===fdToolsContext()&&Boolean(activeUser)&&!isPersonelUser()}
function fdToolsAssert(write=false){if(!fdToolsValid())throw Error('Oturum değişti; arama veya takvimi yeniden açın.');if(write&&!isManagerUser())throw Error('Bu işlem için yetkiniz yok.')}
async function fdToolsAwait(p,ticket){fdToolsAssert();const v=await p;fdToolsAssert();if(ticket!==undefined&&ticket!==fdToolsNavigation)throw Error('Gezinme değişti.');return v}
function showGlobalOverlay(...args){fdToolsAssert();window.showGlobalOverlay(...args);fdToolsOverlay=[document.getElementById('overlayTitle')?.textContent,document.getElementById('overlaySub')?.textContent]}
function hideGlobalOverlay(){if(fdToolsOverlay&&fdToolsOverlay[0]===document.getElementById('overlayTitle')?.textContent&&fdToolsOverlay[1]===document.getElementById('overlaySub')?.textContent)window.hideGlobalOverlay();fdToolsOverlay=null}
function fdToolsConfirm(...args){fdToolsAssert(true);const previous=document.getElementById('fdYuzerOnayKatmani'),p=window.fdYuzerOnaySor(...args),node=document.getElementById('fdYuzerOnayKatmani');if(node&&node!==previous)fdToolsDialogs.add(node);return p}
// Separately approved repair: the old calendar referenced a private, unreachable fdxApi.
function fdxApi(body){fdToolsAssert(true);return window.fdxPlanliBildirimApi(body,fdToolsValid)}
function ortakModalKur(){fdToolsAssert();if(!document.querySelector('#fdOrtakModal[data-fd-module-root]'))throw Error('Arama ekranı bağlanamadı.')}
function fdTakvimModalKur(){fdToolsAssert();if(!document.querySelector('#fdTakvimKayitModal[data-fd-module-root]'))throw Error('Takvim formu bağlanamadı.')}
let fdAramaSonucAc,fdGlobalAra,fdTakvimKayitFormuAc,fdTakvimKaydet,fdTakvimSil,fdTakvimAc,fdTakvimGorunumSec,fdTakvimAyDegistir,fdTakvimCiz,fdTakvimBugun;
const esc=v=>escapeDashboardText(String(v??''));
let ortakVeriHazir=false,takvimAy=new Date(new Date().getFullYear(),new Date().getMonth(),1),takvimGorunum='ay',takvimKayitlari=[],takvimKayitlariYuklendi=false,fdGlobalSonuclar=[];
async function ortakVeriyiHazirla(){
try{
fdToolsAssert(false);
if(ortakVeriHazir)return;showGlobalOverlay('Şirket bilgileri hazırlanıyor','Arama ve takvim için gerekli bölümler bir kez yükleniyor...');try{const isler=[supabaseVerileriniYukle('personel'),supabaseVerileriniYukle('arac'),driveVerileriniYukleBaslangicta('kira')];if(typeof evrakVerileriniYukle==='function')isler.push(evrakVerileriniYukle());const sonuc=await fdToolsAwait(Promise.allSettled(isler));if(sonuc.every(x=>x.status==='rejected'))throw sonuc[0].reason;ortakVeriHazir=true}finally{
if(fdToolsValid()){
hideGlobalOverlay()
}
}
}catch(fdToolsError){if(!fdToolsValid())return;throw fdToolsError;}
}
function personelAdi(id){
fdToolsAssert(false);
return personeller.find(p=>String(p.id)===String(id))?.ad||''}
fdAramaSonucAc=async function(index){
try{
fdToolsAssert(false);
const x=fdGlobalSonuclar[Number(index)];if(!x)return;modalKapat('fdOrtakModal');if(x.tip==='personel'){await fdToolsAwait(openPersonelApp());return openPersonelDetayModal(x.id)}if(x.tip==='izin'){await fdToolsAwait(openIzinTakipApp());const s=document.getElementById('izinPersonelSelect');if(s){s.value=String(x.pId);s.dispatchEvent(new Event('change',{bubbles:true}))}else if(typeof personelSecildi==='function')personelSecildi(String(x.pId));return}if(x.tip==='puantaj'){await fdToolsAwait(openPuantajApp());const ay=document.querySelector('#puantajApp input[type="month"]');if(ay&&x.tarih){ay.value=String(x.tarih).slice(0,7);ay.dispatchEvent(new Event('change',{bubbles:true}))}const s=document.querySelector('#puantajApp select[id*="Personel"],#puantajApp select[id*="personel"]');if(s){s.value=String(x.pId);s.dispatchEvent(new Event('change',{bubbles:true}))}return}if(x.tip==='kkd'){await fdToolsAwait(openKkdApp());return kkdGecmisiniAc(String(x.pId),String(x.tarih||'').slice(0,4))}if(x.tip==='arac'){await fdToolsAwait(openAracTakipApp());return aracDetayModaliniAc(x.id)}if(x.tip==='bakim'){await fdToolsAwait(openAracTakipApp());return aracBakimModaliniAc(x.aracId)}if(x.tip==='ceza'){await fdToolsAwait(openAracTakipApp());const b=document.getElementById('aracCezaSekmeBtn');aracAnaSekmeDegistir('arac-tab-ceza',b);return aracTrafikCezasiFormuAc(x.aracId,x.id)}if(x.tip==='kira'){await fdToolsAwait(openKiraTakipApp());if(x.daireId)return kiraDaireDetayAc(x.daireId);return}if(x.tip==='abonelik'){await fdToolsAwait(openKiraTakipApp());const b=[...document.querySelectorAll('#kiraSekmeler button')].find(e=>String(e.textContent).includes('Abonelik'));kiraSekmeAc('abonelikler',b);return kiraAbonelikFormuAc(x.id)}if(x.tip==='evrak'){await fdToolsAwait(openEvrakTakipApp());return evrakGoruntule(x.id)}
}catch(fdToolsError){if(!fdToolsValid())return;throw fdToolsError;}
};
fdGlobalAra=async function(){
const fdToolsTicket=fdToolsNavigation;
try{
fdToolsAssert(false);
const q=String(document.getElementById('fdGlobalArama')?.value||'').trim().toLocaleLowerCase('tr-TR');if(q.length<2)return showToast('Aramak için en az 2 karakter yazın.','warning');try{await fdToolsAwait(ortakVeriyiHazirla(),fdToolsTicket)}catch(e){
if(!fdToolsValid()||fdToolsTicket!==fdToolsNavigation)return;
return alert('Arama verileri alınamadı: '+(e.message||e))}const r=[],ekle=(kategori,baslik,detay,kayit)=>{
fdToolsAssert(false);
const metin=[baslik,detay].join(' ').toLocaleLowerCase('tr-TR');if(metin.includes(q))r.push({kategori,baslik,detay,...kayit})};personeller.filter(aktifSirketeAit).forEach(p=>ekle('Personel',p.ad,[p.sube,p.gorev,p.tc,p.telefon].join(' · '),{tip:'personel',id:p.id}));kkdKayitlari.filter(aktifSirketeAit).forEach(x=>ekle('Zimmet / KKD',personelAdi(x.pId)||'Personel',[x.urun||x.malzeme,x.tarih,x.aciklama].join(' · '),{tip:'kkd',id:x.id,pId:x.pId,tarih:x.tarih}));araclar.filter(aktifSirketeAit).forEach(a=>{
fdToolsAssert(false);
ekle('Araç',a.plaka,[a.marka,a.model,a.aracSahibi,a.sube,personelAdi(a.personelId)].join(' · '),{tip:'arac',id:a.id});(a.bakimlar||[]).forEach(b=>ekle('Bakım / Arıza',a.plaka,[b.tur,b.servis,b.islemler,b.tarih].join(' · '),{tip:'bakim',id:b.id,aracId:a.id}))});kiraKayitlari.filter(aktifSirketeAit).forEach(x=>{
fdToolsAssert(false);
const abonelik=x.tip==='abonelik';if(abonelik)return;ekle('Kira / Daire',x.kisaAd||x.kiraciAd||kiraDaireAdi(x.daireId),[x.tip,x.adres,x.not].join(' · '),{tip:'kira',id:x.id,daireId:x.daireId||x.id})});if(typeof evrakKayitlari!=='undefined')evrakKayitlari.filter(x=>x.tip==='evrak').forEach(x=>ekle('Evrak',x.evrakAdi||x.ad||x.baslik||x.dosya?.ad,[x.kategoriAd,x.belgeNo,x.aciklama,x.gecerlilikBitis].join(' · '),{tip:'evrak',id:x.id}));fdGlobalSonuclar=r.slice(0,250);ortakModalKur();document.getElementById('fdOrtakModalBaslik').textContent='Arama Sonuçları · '+r.length;document.getElementById('fdOrtakModalIcerik').innerHTML=fdGlobalSonuclar.length?'<div class="fd-tool-list">'+fdGlobalSonuclar.map((x,i)=>'<button class="fd-tool-row" onclick="fdAramaSonucAc('+i+')"><strong>'+esc(x.kategori)+' · '+esc(x.baslik)+'</strong><small>'+esc(x.detay)+'</small></button>').join('')+'</div>':'<div class="dashboard-empty">Aradığınız ifadeyle eşleşen ana kayıt bulunamadı.</div>';document.getElementById('fdOrtakModal').style.display='flex'
}catch(fdToolsError){if(!fdToolsValid()||fdToolsTicket!==fdToolsNavigation)return;throw fdToolsError;}
};
async function fdTakvimKayitlariniYukle(zorla=false){
try{
fdToolsAssert(false);
if(takvimKayitlariYuklendi&&!zorla)return takvimKayitlari;const {data,error}=await fdToolsAwait(supabaseClient.from('portal_records').select('legacy_id,data').eq('company_id',aktifSirketId()).eq('module','takvim').order('updated_at',{ascending:false}).range(0,999));if(error)throw error;takvimKayitlari=(data||[]).map(x=>({...x.data,id:String(x.data?.id||x.legacy_id)}));takvimKayitlariYuklendi=true;return takvimKayitlari
}catch(fdToolsError){if(!fdToolsValid())return;throw fdToolsError;}
}
function fdTakvimTarih(d){
fdToolsAssert(false);
return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function takvimOlaylari(aralikBas,aralikSon=aralikBas){
fdToolsAssert(false);
const ilk=typeof aralikBas==='string'?aralikBas:fdTakvimTarih(aralikBas),son=typeof aralikSon==='string'?aralikSon:fdTakvimTarih(aralikSon),olay=[];const ekle=(tarih,metin,tur='',kayit=null)=>{
fdToolsAssert(false);
const t=String(tarih||'').slice(0,10);if(t>=ilk&&t<=son)olay.push({tarih:t,metin,tur,kayit})};izinler.filter(aktifSirketeAit).forEach(x=>{
fdToolsAssert(false);
let d=new Date(String(x.baslangic||x.tarih||'').slice(0,10)+'T12:00:00'),bit=new Date(String(x.bitis||x.baslangic||x.tarih||'').slice(0,10)+'T12:00:00');for(let i=0;!isNaN(d)&&d<=bit&&i<370;i++,d.setDate(d.getDate()+1))ekle(fdTakvimTarih(d),(x.tur||'İzin')+' · '+personelAdi(x.pId),'leave')});araclar.filter(aktifSirketeAit).forEach(v=>{
fdToolsAssert(false);
ekle(v.muayeneBitis,'Muayene · '+v.plaka,'vehicle');ekle(v.egzozMuayeneBitis,'Egzoz · '+v.plaka,'vehicle');ekle(v.sigortaBitis,'Sigorta · '+v.plaka,'vehicle');ekle(v.kaskoBitis,'Kasko · '+v.plaka,'vehicle');(v.bakimlar||[]).forEach(b=>ekle(b.sonrakiTarih,'Bakım · '+v.plaka,'vehicle'))});kiraSozlesmeler().forEach(s=>ekle(s.gercekBitis||s.bitis,'Sözleşme bitişi · '+kiraDaireAdi(s.daireId),'rent'));kiraPoliceler().forEach(p=>ekle(p.bitis,'Poliçe bitişi · '+kiraDaireAdi(p.daireId),'rent'));if(typeof evrakKayitlari!=='undefined')evrakKayitlari.filter(x=>x.tip==='evrak').forEach(x=>{
fdToolsAssert(false);
const k=typeof evrakKategorileri==='function'?evrakKategorileri().find(k=>String(k.id)===String(x.kategoriId)):null,ad=x.evrakAdi||x.dosya?.ad||x.ad||x.baslik||'Adsız evrak';ekle(x.gecerlilikBitis||x.bitis,'Belge bitişi · '+ad+(k?.ad?' · '+k.ad:''),'doc')});takvimKayitlari.forEach(x=>{
fdToolsAssert(false);
let d=new Date(String(x.baslangicTarihi||'').slice(0,10)+'T12:00:00'),bit=new Date(String(x.bitisTarihi||x.baslangicTarihi||'').slice(0,10)+'T12:00:00');for(let i=0;!isNaN(d)&&d<=bit&&i<370;i++,d.setDate(d.getDate()+1))ekle(fdTakvimTarih(d),(x.saat?x.saat+' · ':'')+x.baslik,'manual',x)});return olay.sort((a,b)=>a.tarih.localeCompare(b.tarih)||a.metin.localeCompare(b.metin,'tr'))}
const fdGlobalAraTemizlemeEski=fdGlobalAra;
fdGlobalAra=async function(){
const fdToolsTicket=fdToolsNavigation;
try{
fdToolsAssert(false);
if(isPersonelUser())return showToast('Arama aracı personel hesaplarında kullanılamaz.','warning');const sonuc=await fdToolsAwait(fdGlobalAraTemizlemeEski.apply(this,arguments),fdToolsTicket),aramaKutusu=document.getElementById('fdGlobalArama');if(aramaKutusu)aramaKutusu.value='';return sonuc
}catch(fdToolsError){if(!fdToolsValid()||fdToolsTicket!==fdToolsNavigation)return;throw fdToolsError;}
};
fdTakvimKayitFormuAc=function(id='',tarih=''){
fdToolsAssert(false);
if(!isManagerUser())return showToast('Takvim kaydı eklemek için admin veya kullanıcı yetkisi gerekir.','warning');fdTakvimModalKur();const x=takvimKayitlari.find(k=>String(k.id)===String(id));document.querySelector('#fdTakvimKayitModal form').reset();document.getElementById('fdTakvimId').value=x?.id||'';document.getElementById('fdTakvimBaslik').value=x?.baslik||'';document.getElementById('fdTakvimBaslangic').value=x?.baslangicTarihi||tarih||fdTakvimTarih(new Date());document.getElementById('fdTakvimBitis').value=x?.bitisTarihi||'';document.getElementById('fdTakvimSaat').value=x?.saat||'';document.getElementById('fdTakvimTur').value=x?.tur||'Hatırlatma';document.getElementById('fdTakvimAciklama').value=x?.aciklama||'';document.getElementById('fdTakvimBildirimGun').value=x?.bildirimGun??uygulamaAyarlari.takvimHatirlatmaGunu??1;document.getElementById('fdTakvimBildirimSaat').value=x?.bildirimSaat||uygulamaAyarlari.takvimHatirlatmaSaati||'09:00';document.getElementById('fdTakvimBildirim').checked=x?x.bildirim!==false:true;document.getElementById('fdTakvimSilBtn').style.visibility=x?'visible':'hidden';document.getElementById('fdTakvimKayitModal').style.display='flex'};
async function fdTakvimPlaniniIptal(x){
try{
fdToolsAssert(true);
if(!x?.bildirimPlanId)return;try{await fdToolsAwait(fdxApi({action:'schedule-cancel',id:x.bildirimPlanId}))}catch(e){
if(!fdToolsValid())return;
console.warn('Eski takvim bildirimi iptal edilemedi',e)}
}catch(fdToolsError){if(!fdToolsValid())return;throw fdToolsError;}
}
fdTakvimKaydet=async function(e){
try{
fdToolsAssert(true);

        e.preventDefault();
        const id=document.getElementById('fdTakvimId').value||'takvim_'+Date.now();
        const eski=takvimKayitlari.find(x=>String(x.id)===String(id));
        const baslangic=document.getElementById('fdTakvimBaslangic').value;
        const bitis=document.getElementById('fdTakvimBitis').value||baslangic;
        if(bitis<baslangic)return alert('Bitiş tarihi başlangıçtan önce olamaz.');
        const kayit={...(eski||{}),id,sirketId:aktifSirketId(),kayitTipi:'takvimOlayi',baslik:document.getElementById('fdTakvimBaslik').value.trim(),baslangicTarihi:baslangic,bitisTarihi:bitis,saat:document.getElementById('fdTakvimSaat').value,tur:document.getElementById('fdTakvimTur').value,aciklama:document.getElementById('fdTakvimAciklama').value.trim(),bildirim:document.getElementById('fdTakvimBildirim').checked,bildirimGun:Number(document.getElementById('fdTakvimBildirimGun').value||0),bildirimSaat:document.getElementById('fdTakvimBildirimSaat').value||'09:00',guncellemeZamani:new Date().toISOString()};
        showGlobalOverlay('Takvim kaydediliyor','Kayıt ve bildirim planı hazırlanıyor...');
        try{
            await fdToolsAwait(fdTakvimPlaniniIptal(eski));
            delete kayit.bildirimPlanId;
            const satir={company_id:aktifSirketId(),module:'takvim',legacy_id:id,record_year:Number(baslangic.slice(0,4)),employee_legacy_id:null,data:kayit};
            const {error}=await fdToolsAwait(supabaseClient.from('portal_records').upsert(satir,{onConflict:'company_id,module,legacy_id'}));
            if(error)throw error;
            let bildirimUyarisi='';
            if(kayit.bildirim){
                const zaman=new Date(baslangic+'T'+kayit.bildirimSaat+':00');
                zaman.setDate(zaman.getDate()-kayit.bildirimGun);
                if(zaman.getTime()>Date.now()+30000){
                    try{
                        const plan=await fdToolsAwait(fdxApi({action:'schedule-create',title:kayit.baslik,message:kayit.aciklama||kayit.baslik,scheduledFor:zaman.toISOString(),audienceMode:'managers',targetEmployeeIds:[]}));
                        kayit.bildirimPlanId=plan.item?.id||'';
                        const {error:planKayitHatasi}=await fdToolsAwait(supabaseClient.from('portal_records').update({data:kayit}).eq('company_id',aktifSirketId()).eq('module','takvim').eq('legacy_id',id));
                        if(planKayitHatasi)throw planKayitHatasi;
                    }catch(planHatasi){
if(!fdToolsValid())return;

                        console.warn('Takvim kaydı oluşturuldu ancak bildirimi planlanamadı',planHatasi);
                        bildirimUyarisi=' Bildirim planlanamadı; kayıt takvimde oluşturuldu.';
                    }
                }else{
                    bildirimUyarisi=' Bildirim zamanı geçmiş olduğu için telefon bildirimi planlanmadı.';
                }
            }
            const i=takvimKayitlari.findIndex(x=>String(x.id)===String(id));
            if(i>=0)takvimKayitlari[i]=kayit;else takvimKayitlari.push(kayit);
            modalKapat('fdTakvimKayitModal');
            fdTakvimCiz();
            showToast('Takvim kaydı kaydedildi.'+bildirimUyarisi,bildirimUyarisi?'warning':'success');
        }catch(error){
if(!fdToolsValid())return;

            alert('Takvim kaydı tamamlanamadı: '+(error.message||error));
        }finally{
if(fdToolsValid()){

            hideGlobalOverlay();
        
}
}
    
}catch(fdToolsError){if(!fdToolsValid())return;throw fdToolsError;}
};
fdTakvimSil=async function(){
try{
fdToolsAssert(true);
const id=document.getElementById('fdTakvimId').value,x=takvimKayitlari.find(k=>String(k.id)===String(id));if(!x||!await fdToolsAwait(fdToolsConfirm('Bu takvim kaydı silinsin mi?')))return;try{await fdToolsAwait(fdTakvimPlaniniIptal(x));const {error}=await fdToolsAwait(supabaseClient.from('portal_records').delete().eq('company_id',aktifSirketId()).eq('module','takvim').eq('legacy_id',id));if(error)throw error;takvimKayitlari=takvimKayitlari.filter(k=>String(k.id)!==String(id));modalKapat('fdTakvimKayitModal');fdTakvimCiz()}catch(error){
if(!fdToolsValid())return;
alert('Takvim kaydı silinemedi: '+(error.message||error))}
}catch(fdToolsError){if(!fdToolsValid())return;throw fdToolsError;}
};
fdTakvimAc=async function(){
const fdToolsTicket=fdToolsNavigation;
try{
fdToolsAssert(false);
if(isPersonelUser())return showToast('Takvim personel hesaplarında kullanılamaz.','warning');try{await fdToolsAwait(Promise.all([ortakVeriyiHazirla(),fdTakvimKayitlariniYukle()]),fdToolsTicket)}catch(e){
if(!fdToolsValid()||fdToolsTicket!==fdToolsNavigation)return;
return alert('Takvim verileri alınamadı: '+(e.message||e))}ortakModalKur();fdTakvimCiz();document.getElementById('fdOrtakModal').style.display='flex'
}catch(fdToolsError){if(!fdToolsValid()||fdToolsTicket!==fdToolsNavigation)return;throw fdToolsError;}
};
fdTakvimGorunumSec=function(g){
fdToolsAssert(false);
if(g!=='ay'&&takvimGorunum==='ay'){const bugun=new Date();if(takvimAy.getFullYear()===bugun.getFullYear()&&takvimAy.getMonth()===bugun.getMonth())takvimAy=bugun}takvimGorunum=g;fdTakvimCiz()};
fdTakvimAyDegistir=function(n){
fdToolsAssert(false);
const miktar=Number(n);if(takvimGorunum==='ay')takvimAy=new Date(takvimAy.getFullYear(),takvimAy.getMonth()+miktar,1);else takvimAy=new Date(takvimAy.getFullYear(),takvimAy.getMonth(),takvimAy.getDate()+miktar*(takvimGorunum==='hafta'?7:1));fdTakvimCiz()};
fdTakvimCiz=function(){
fdToolsAssert(false);
document.getElementById('fdOrtakModalBaslik').textContent='Takvim';let ilk,son,icerik='';if(takvimGorunum==='ay'){const yil=takvimAy.getFullYear(),ay=takvimAy.getMonth(),ilkGun=(new Date(yil,ay,1).getDay()+6)%7,gunSayisi=new Date(yil,ay+1,0).getDate(),gunler=['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];ilk=new Date(yil,ay,1);son=new Date(yil,ay,gunSayisi);const olay=takvimOlaylari(ilk,son);let hucre=gunler.map(x=>'<div class="fd-calendar-week">'+x+'</div>').join('');for(let i=0;i<ilkGun;i++)hucre+='<div class="fd-calendar-day muted"></div>';for(let g=1;g<=gunSayisi;g++){const tarih=fdTakvimTarih(new Date(yil,ay,g)),liste=olay.filter(x=>x.tarih===tarih);hucre+='<div class="fd-calendar-day" ondblclick="fdTakvimKayitFormuAc(\'\',\''+tarih+'\')"><strong>'+g+'</strong>'+liste.map(x=>x.kayit?'<button class="fd-calendar-event manual" onclick="event.stopPropagation();fdTakvimKayitFormuAc(\''+esc(x.kayit.id)+'\')">'+esc(x.metin)+'</button>':'<span class="fd-calendar-event '+esc(x.tur)+'">'+esc(x.metin)+'</span>').join('')+'</div>'}icerik='<div class="fd-calendar-grid">'+hucre+'</div>'}else{const ref=new Date(takvimAy);if(takvimGorunum==='hafta'){const fark=(ref.getDay()+6)%7;ilk=new Date(ref.getFullYear(),ref.getMonth(),ref.getDate()-fark);son=new Date(ilk.getFullYear(),ilk.getMonth(),ilk.getDate()+6)}else ilk=son=ref;const olay=takvimOlaylari(ilk,son);let gun=new Date(ilk);const blok=[];while(gun<=son){const tarih=fdTakvimTarih(gun),liste=olay.filter(x=>x.tarih===tarih);blok.push('<section class="card" style="margin-bottom:10px"><div class="card-header"><strong>'+gun.toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'})+'</strong>'+(isManagerUser()?'<button class="btn-modern btn-detail-modern" onclick="fdTakvimKayitFormuAc(\'\',\''+tarih+'\')">＋ Kayıt</button>':'')+'</div><div class="fd-tool-list">'+(liste.map(x=>x.kayit?'<button class="fd-tool-row" onclick="fdTakvimKayitFormuAc(\''+esc(x.kayit.id)+'\')"><strong>'+esc(x.metin)+'</strong><small>'+esc(x.kayit.aciklama||x.kayit.tur||'')+'</small></button>':'<div class="fd-tool-row"><strong>'+esc(x.metin)+'</strong></div>').join('')||'<div class="dashboard-empty">Kayıt yok.</div>')+'</div></section>');gun.setDate(gun.getDate()+1)}icerik=blok.join('')}const baslik=takvimGorunum==='ay'?takvimAy.toLocaleDateString('tr-TR',{month:'long',year:'numeric'}):ilk.toLocaleDateString('tr-TR')+(fdTakvimTarih(ilk)!==fdTakvimTarih(son)?' – '+son.toLocaleDateString('tr-TR'):'');document.getElementById('fdOrtakModalIcerik').innerHTML='<div class="fd-calendar-head" style="flex-wrap:wrap"><button class="fd-tool-btn soft" onclick="fdTakvimAyDegistir(-1)">← Önceki</button><strong>'+esc(baslik.toLocaleUpperCase('tr-TR'))+'</strong><button class="fd-tool-btn soft" onclick="fdTakvimAyDegistir(1)">Sonraki →</button><span style="margin-left:auto;display:flex;gap:6px"><button class="fd-tool-btn '+(takvimGorunum==='gun'?'':'soft')+'" onclick="fdTakvimGorunumSec(\'gun\')">Gün</button><button class="fd-tool-btn '+(takvimGorunum==='hafta'?'':'soft')+'" onclick="fdTakvimGorunumSec(\'hafta\')">Hafta</button><button class="fd-tool-btn '+(takvimGorunum==='ay'?'':'soft')+'" onclick="fdTakvimGorunumSec(\'ay\')">Ay</button>'+(isManagerUser()?'<button class="fd-tool-btn" onclick="fdTakvimKayitFormuAc()">＋ Yeni Kayıt</button>':'')+'</span></div>'+icerik};
fdTakvimBugun=function(){
fdToolsAssert(false);
takvimAy=new Date();fdTakvimCiz()};
const fdTakvimCizTemel=fdTakvimCiz;
fdTakvimCiz=function(){
fdToolsAssert(false);
fdTakvimCizTemel();const bas=document.querySelector('#fdOrtakModalIcerik .fd-calendar-head');if(bas&&!bas.querySelector('[data-takvim-bugun]')){const dugme=document.createElement('button');dugme.type='button';dugme.className='fd-tool-btn soft';dugme.dataset.takvimBugun='1';dugme.textContent='Bugün';dugme.onclick=fdTakvimBugun;bas.firstElementChild?.after(dugme)}};
return{init(){for(const name of ['fdAnaEkranaHafifDon','closeAppsToHub','logout']){const previous=window[name];if(typeof previous!=='function')continue;const hook=function(...args){fdToolsNavigation++;return previous.apply(this,args)};window[name]=hook;fdToolsHooks.push({name,previous,hook})}window.fdSupplementalOutputInstall?.();window.fdUnifiedOutput?.scan()},open(options){const pending=window.fdCompanyToolsLaunchOptions?.();options=options||pending||{};fdToolsAssert();fdToolsNavigation++;return options.mode==='search'?fdGlobalAra():options.mode==='form'?fdTakvimKayitFormuAc(...(options.args||[])):fdTakvimAc()},api:{get fdAramaSonucAc(){return fdAramaSonucAc},get fdGlobalAra(){return fdGlobalAra},get fdTakvimKayitFormuAc(){return fdTakvimKayitFormuAc},get fdTakvimKaydet(){return fdTakvimKaydet},get fdTakvimSil(){return fdTakvimSil},get fdTakvimAc(){return fdTakvimAc},get fdTakvimGorunumSec(){return fdTakvimGorunumSec},get fdTakvimAyDegistir(){return fdTakvimAyDegistir},get fdTakvimCiz(){return fdTakvimCiz},get fdTakvimBugun(){return fdTakvimBugun}},dispose(){fdToolsDisposed=true;fdToolsNavigation++;hideGlobalOverlay();for(const node of fdToolsDialogs)if(node.isConnected)node.querySelector('[data-fd-iptal]')?.click();fdToolsDialogs.clear();for(const {name,previous,hook}of fdToolsHooks)if(window[name]===hook)window[name]=previous;fdToolsHooks.length=0;takvimKayitlari=[];fdGlobalSonuclar=[];ortakVeriHazir=false;takvimKayitlariYuklendi=false;document.querySelector('#fdTakvimKayitModal form')?.reset();}};
});
