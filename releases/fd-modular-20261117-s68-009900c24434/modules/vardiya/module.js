window.FDModules.define('vardiya',function(){

let fdRosterDisposed=false;const fdRosterTimers=new Set(),fdRosterListeners=[],fdRosterOutputs=new Set(),fdRosterURLs=new Set(),fdRosterInitial=fdRosterContext();
function fdRosterContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function fdRosterValid(){return !fdRosterDisposed&&fdRosterInitial===fdRosterContext()&&anaMenuModulErisimiVar('personel')}
let fdRosterEditApproval='';
function fdRosterEditScope(){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),part=type=>parts.find(x=>x.type===type)?.value;
    const current=vardiyaPazartesi(`${part('year')}-${part('month')}-${part('day')}`),week=vardiyaPazartesi(document.getElementById('vardiyaHafta')?.value),branch=String(document.getElementById('vardiyaSube')?.value||'');
    return {current,week,branch,key:JSON.stringify([fdRosterContext(),current,week,branch])};
}
function fdRosterAutoSaveAllowed(){const s=fdRosterEditScope();return s.week>s.current||fdRosterEditApproval===s.key}
function fdRosterAssert(write=false){
    if(!fdRosterValid())throw Error('Oturum değişti; vardiya ekranını yeniden açın.');
    if(write&&!fdVardiyaYazmaYetkisi())throw Error('Vardiya düzenleme yetkiniz yok.');
    if(!write)return true;
    const s=fdRosterEditScope();
    if(!s.week||!s.branch)return false;
    if(s.week>s.current||fdRosterEditApproval===s.key)return true;
    const start=new Date(s.week+'T12:00:00'),end=new Date(start);end.setDate(end.getDate()+6);
    const dates=`${start.toLocaleDateString('tr-TR')} – ${end.toLocaleDateString('tr-TR')}`;
    if(!window.confirm(`${s.week===s.current?'İçinde bulunduğumuz':'Geçmiş'} haftanın vardiyasını değiştiriyorsunuz.\n\n${s.branch}\n${dates}\n\nKaydedilen değişiklikler bu haftanın vardiya ve devam hesaplarına yansır; vardiya mesajları yeniden planlanabilir.\n\nBu haftayı düzenlemeye devam etmek istiyor musunuz?`))return false;
    if(!fdRosterValid()||!fdVardiyaYazmaYetkisi()||fdRosterEditScope().key!==s.key)return false;
    fdRosterEditApproval=s.key;return true;
}
async function fdRosterAwait(p){fdRosterAssert();const value=await p;fdRosterAssert();return value}
function fdRosterTimer(fn,ms,...args){const id=window.setTimeout(()=>{fdRosterTimers.delete(id);if(fdRosterValid())fn(...args)},ms);fdRosterTimers.add(id);return id}
function fdRosterClearTimer(id){fdRosterTimers.delete(id);window.clearTimeout(id)}
function fdRosterListen(type,fn,options){const guarded=(...a)=>{if(fdRosterValid())return fn(...a)};document.addEventListener(type,guarded,options);fdRosterListeners.push([type,guarded,options])}
function fdRosterPreview(...a){fdRosterAssert();const node=fdCiktiOnizlemeAc(...a);fdRosterOutputs.add(node);return node}
function fdRosterCreateURL(blob){const url=URL.createObjectURL(blob);fdRosterURLs.add(url);return url}
function fdRosterRevokeURL(url){fdRosterURLs.delete(url);URL.revokeObjectURL(url)}
const fdRosterSettings=document.getElementById('vardiyaTanimDetay'),fdRosterSettingsParent=fdRosterSettings?.parentNode,fdRosterSettingsNext=fdRosterSettings?.nextSibling;
let vardiyaPdfAl;const fdRosterSaveAPI={};
async function openVardiyaApp() {
fdRosterEditApproval='';
try{

fdRosterAssert(false);

        anaMenuDonusButonunuGoster();
        ['appHub','personelDashboardApp','personelApp','izinTakipApp','puantajApp','avansApp','sirketApp','icraApp','ekOdemeApp','kkdApp','aracTakipApp','ayarlarApp','magicpassApp'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        document.getElementById('vardiyaApp').style.display = 'block';
        workspaceSekmesiniAktifEt('vardiya');
        const app = document.getElementById('vardiyaApp'), board = document.getElementById('vardiyaBoard');
        const session = fdPortalVeriOturumu(), user = String(activeUser?.id || activeUser?.username || '');
        const version = app.__fdLoadVersion = (app.__fdLoadVersion || 0) + 1;
        const current = () => session === fdPortalVeriOturumu() && user === String(activeUser?.id || activeUser?.username || '') && app.__fdLoadVersion === version && app.style.display === 'block';
        const status = document.getElementById('fdVardiyaKayitDurumu'); if (status) status.hidden = true;
        app.inert = true;
        try {
            if (SUPABASE_MODE) {
                board.textContent = 'Vardiya listesi yükleniyor…';
                await fdRosterAwait(fdVardiyaHizliListeYukle());
            } else if (!fdModulVerisiTazeMi('vardiya')) {
                board.textContent = 'Vardiya listesi yükleniyor…';
                await fdRosterAwait(driveVerileriniYukleBaslangicta('vardiya'));
            }
            if (!current()) return false;
            if (SUPABASE_MODE && !yuklenenVeriler.has('vardiya') && !vardiyaKayitlari.some(aktifSirketeAit) && !window.fdVardiyaHaftalikListeHazirMi?.()) throw Error('Vardiya listesi sunucudan alınamadı.');
            vardiyaFiltreleriniHazirla();
            vardiyaCiz();
            return true;
        } catch (error) {if(!fdRosterValid())return;

            if (!current()) return false;
            board.innerHTML = '<div role="alert" style="padding:20px">Vardiya listesi yüklenemedi. <button type="button" onclick="openVardiyaApp()">Tekrar dene</button></div>';
            showToast('Vardiya listesi yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.', 'error');
            return false;
        } finally { if (app.__fdLoadVersion === version) app.inert = false; }
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
}
let vardiyaSeciliKartId = '';
let vardiyaSeciliPersonelSatirId = '';
let vardiyaSuruklenenKartId = '';
let vardiyaSuruklenenTur = '';
let vardiyaSonSuruklemeZamani = 0;
let vardiyaDuzenlemeDevamEdiyor = false;
let vardiyaKayitSurumu = 0;
let vardiyaKayitKuyrugu = Promise.resolve();
const vardiyaBildirimGorunumleri = new Map();
let vardiyaNumaraHaritasi = new Map();
let vardiyaKayitZamanlayici = null;
function vardiyaFiltreleriniHazirla() {
fdRosterAssert(false);

        const sube = document.getElementById('vardiyaSube');
        const mevcut = sube.value;
        const adlar = [...new Set(personeller.filter(p=>aktifSirketeAit(p)&&!p.cikisTarihi).map(p=>String(p.sube||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));
        sube.innerHTML = '<option value="">Şube seçin</option>' + adlar.map(ad=>`<option value="${escapeDashboardText(ad)}">${escapeDashboardText(ad)}</option>`).join('');
        sube.value = adlar.includes(mevcut) ? mevcut : (adlar[0] || '');
        const hafta = document.getElementById('vardiyaHafta');
        if (!hafta.value) hafta.value = vardiyaPazartesi();
        else hafta.value = vardiyaPazartesi(hafta.value);
    }
function vardiyaAktifKayit(olustur = true) {
fdRosterAssert(false);

        const sube = document.getElementById('vardiyaSube').value;
        const haftaBaslangic = vardiyaPazartesi(document.getElementById('vardiyaHafta').value);
        if (!sube || !haftaBaslangic) return null;
        let kayit = vardiyaKayitlari.find(k=>String(k.sube)===String(sube)&&String(k.haftaBaslangic)===haftaBaslangic&&aktifSirketeAit(k));
        if (!kayit && olustur) {
            const aktifler = personeller.filter(p=>aktifSirketeAit(p)&&!p.cikisTarihi&&String(p.sube||'')===sube).sort((a,b)=>String(a.ad).localeCompare(String(b.ad),'tr'));
            const bolumler=['gunduz','gece','ana','ek'];
            const oncekiHaftaTarihi = new Date(`${haftaBaslangic}T12:00:00`);
            oncekiHaftaTarihi.setDate(oncekiHaftaTarihi.getDate()-7);
            const oncekiHafta = magicpassTarihAnahtari(oncekiHaftaTarihi);
            const oncekiKayit = vardiyaKayitlari.find(k=>String(k.sube)===String(sube)&&String(k.haftaBaslangic)===oncekiHafta&&aktifSirketeAit(k)&&Array.isArray(k.satirlar));
            const aktifIdler = new Set(aktifler.map(p=>String(p.id)));
            const kopyalananSatirlar = oncekiKayit ? oncekiKayit.satirlar.map((satir,index)=>{
                const personelId=aktifIdler.has(String(satir.personelId||''))?String(satir.personelId):'';
                const manuelPersonelAd=!satir.personelId?String(satir.personelAd||''):'';
                return {
                    ...satir,
                    id:`vk_${haftaBaslangic}_${index}_${Date.now()}`,
                    personelId,
                    personelAd:personelId?String(satir.personelAd||''):manuelPersonelAd,
                    manuelPersonel:!!manuelPersonelAd,
                    gorev:(personelId||manuelPersonelAd)?String(satir.gorev||''):''
                };
            }) : null;

            kayit = {
                id:`vardiya_${sube.toLocaleLowerCase('tr-TR').replace(/[^a-z0-9]+/gi,'_')}_${haftaBaslangic}`,
                sirketId:aktifSirketId(), sube, haftaBaslangic,
                satirlar:kopyalananSatirlar||aktifler.map((p,index)=>({ id:`vk_${p.id}_${index}`, personelId:String(p.id), gorev:String(p.gorev||''), vardiya:bolumler[index%bolumler.length], sira:Math.floor(index/bolumler.length) })),
                basliklar:{ anaBaslik:'PERSONEL VARDİYA LİSTESİ', gunduz:uygulamaAyarlari.vardiyaGunduzBaslik, gece:uygulamaAyarlari.vardiyaGeceBaslik, genel:uygulamaAyarlari.vardiyaGunduzBaslik, ana:'ANA BİNA', ek:'EK BİNA' },
                notlar:uygulamaAyarlari.vardiyaAciklamalar
            };
            vardiyaKayitlari.push(kayit);
            if(oncekiKayit){
                kayit.basliklar={...(oncekiKayit.basliklar||{})};
                kayit.notlar=String(oncekiKayit.notlar||'');
                kayit.satirSayilari={...(oncekiKayit.satirSayilari||{})};
                kayit.bolumler=Array.isArray(oncekiKayit.bolumler)?oncekiKayit.bolumler.map(bolum=>({...bolum})):undefined;
                kayit.vardiyaTanimlari={...(oncekiKayit.vardiyaTanimlari||{})};
                kayit.personelHaricIdleri=Array.isArray(oncekiKayit.personelHaricIdleri)?[...oncekiKayit.personelHaricIdleri]:[];
            }
            fdRosterClearTimer(vardiyaKayitZamanlayici);
            if(fdRosterAutoSaveAllowed())vardiyaKayitZamanlayici=fdRosterTimer(()=>vardiyaDegisiklikKaydet(false),150);

        }
        if (kayit && !Array.isArray(kayit.satirlar)) kayit.satirlar = [];
        if (kayit) {
            kayit.basliklar = { anaBaslik:'PERSONEL VARDİYA LİSTESİ', gunduz:uygulamaAyarlari.vardiyaGunduzBaslik, gece:uygulamaAyarlari.vardiyaGeceBaslik, genel:uygulamaAyarlari.vardiyaGunduzBaslik, ana:'ANA BİNA', ek:'EK BİNA', ...(kayit.basliklar||{}) };
            kayit.satirlar.forEach(s=>{ if(s.vardiya==='genel')s.vardiya='ana'; });
            if (haftaBaslangic >= vardiyaPazartesi()) vardiyaYeniPersonelleriEkle(kayit, sube);
        }
        return kayit;
    }
function vardiyaYeniPersonelleriEkle(kayit, sube) {
fdRosterAssert(false);

        const kayitli = new Set(kayit.satirlar.map(s=>String(s.personelId||'')).filter(Boolean));
        const eksikler = personeller.filter(p=>aktifSirketeAit(p)&&!p.cikisTarihi&&String(p.sube||'')===sube&&!kayitli.has(String(p.id))).sort((a,b)=>String(a.ad).localeCompare(String(b.ad),'tr'));
        if (!eksikler.length) return;
        const bolumler=['gunduz','gece','ana','ek'];
        eksikler.forEach(p=>{
            let hedef=kayit.satirlar.find(s=>!s.personelId);
            if(!hedef){
                const vardiya=bolumler.slice().sort((a,b)=>kayit.satirlar.filter(s=>s.vardiya===a).length-kayit.satirlar.filter(s=>s.vardiya===b).length)[0];
                const adet=kayit.satirlar.filter(s=>s.vardiya===vardiya).length;
                hedef={id:`vk_${p.id}_${Date.now()}`,personelId:'',gorev:'',vardiya,sira:adet};
                kayit.satirlar.push(hedef);
            }
            hedef.personelId=String(p.id);
            hedef.gorev=String(p.gorev||'');
            kayit.satirSayilari=kayit.satirSayilari||{};
            kayit.satirSayilari[hedef.vardiya]=Math.max(Number(kayit.satirSayilari[hedef.vardiya]||0),kayit.satirlar.filter(s=>s.vardiya===hedef.vardiya).length);
        });
        fdRosterClearTimer(vardiyaKayitZamanlayici);
        if(fdRosterAutoSaveAllowed())vardiyaKayitZamanlayici=fdRosterTimer(()=>vardiyaDegisiklikKaydet(false),100);
    }
function vardiyaSecimiDegisti() {
fdRosterEditApproval='';
fdRosterAssert(false);

        const hafta = document.getElementById('vardiyaHafta');
        if (hafta.value) hafta.value = vardiyaPazartesi(hafta.value);
        vardiyaSeciliKartId = '';
        vardiyaCiz();
    }
function vardiyaSatirBul(id) {
fdRosterAssert(false);

        return vardiyaAktifKayit(false)?.satirlar.find(s=>String(s.id)===String(id));
    }
function vardiyaSurukleBaslat(event,id) {
fdRosterAssert(false);
 vardiyaSuruklenenKartId=id; event.currentTarget.classList.add('dragging'); event.dataTransfer.effectAllowed='move'; }
function vardiyaSurukleBitir(event) {
fdRosterAssert(false);
 event.currentTarget.classList.remove('dragging'); vardiyaSuruklenenKartId=''; }
function vardiyaKartUstuneBirak(event,hedefId) {
fdRosterAssert(false);
 event.preventDefault(); event.stopPropagation(); vardiyaKartlariDegistir(vardiyaSuruklenenKartId,hedefId); }
function vardiyaLaneBirak(event,vardiya) {
if(!fdRosterAssert(true))return false;

        event.preventDefault();
        const satir=vardiyaSatirBul(vardiyaSuruklenenKartId); if(!satir)return;
        satir.vardiya=vardiya; satir.sira=Date.now(); vardiyaDegisiklikKaydet();
    }
function vardiyaKartaTikla(id) {
fdRosterAssert(false);

        if (!vardiyaSeciliKartId) { vardiyaSeciliKartId=id; vardiyaCiz(); return; }
        if (vardiyaSeciliKartId===id) { vardiyaSeciliKartId=''; vardiyaCiz(); return; }
        vardiyaKartlariDegistir(vardiyaSeciliKartId,id);
        vardiyaSeciliKartId='';
    }
async function vardiyaGorevDuzenle(event,id) {
try{

if(!fdRosterAssert(true))return false;

        event.preventDefault();event.stopPropagation();
        const satir=vardiyaSatirBul(id);if(!satir)return;
        const yeni=await fdRosterAwait(fdYuzerDegerSor('Görev yerini yazın:',satir.gorev||''));
        if(yeni===null)return;satir.gorev=String(yeni).trim().toLocaleUpperCase('tr-TR');vardiyaDegisiklikKaydet();
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
}
async function vardiyaPersonelAdiDuzenle(event,id){
try{

if(!fdRosterAssert(true))return false;

        event.preventDefault();event.stopPropagation();
        const kayit=vardiyaAktifKayit(false),satir=vardiyaSatirBul(id);if(!kayit||!satir)return;
        const personel=personeller.find(p=>String(p.id)===String(satir.personelId));
        const mevcutAd=String(personel?.ad||satir.personelAd||'');
        const yeni=await fdRosterAwait(fdYuzerDegerSor('Vardiya listesinde görünecek ismi yazın:',mevcutAd,'Personel Adı','Kaydet'));
        if(yeni===null)return;
        const yeniAd=String(yeni).trim().toLocaleUpperCase('tr-TR');if(yeniAd===mevcutAd.trim().toLocaleUpperCase('tr-TR'))return;
        kayit.personelHaricIdleri=Array.isArray(kayit.personelHaricIdleri)?kayit.personelHaricIdleri:[];
        if(satir.personelId&&!kayit.personelHaricIdleri.includes(String(satir.personelId)))kayit.personelHaricIdleri.push(String(satir.personelId));
        satir.personelId='';satir.personelAd=yeniAd;satir.manuelPersonel=!!yeniAd;
        await fdRosterAwait(vardiyaDegisiklikKaydet());
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
}
function vardiyaKartlariDegistir(kaynakId,hedefId) {
if(!fdRosterAssert(true))return false;

        if(!kaynakId||!hedefId||kaynakId===hedefId)return;
        const kaynak=vardiyaSatirBul(kaynakId),hedef=vardiyaSatirBul(hedefId);if(!kaynak||!hedef)return;
        [kaynak.gorev,hedef.gorev]=[hedef.gorev,kaynak.gorev];
        vardiyaSeciliKartId='';
        vardiyaDegisiklikKaydet();
    }
function vardiyaBosSatirlariTamamla(kayit) {
fdRosterAssert(false);

        const minimumlar={gunduz:1,gece:1,ana:1,ek:1};
        kayit.satirSayilari=kayit.satirSayilari||{};
        Object.entries(minimumlar).forEach(([vardiya,minimum])=>{
            const mevcut=kayit.satirlar.filter(s=>s.vardiya===vardiya);
            if(!Number.isFinite(Number(kayit.satirSayilari[vardiya]))) kayit.satirSayilari[vardiya]=Math.max(minimum,mevcut.length);
            const hedef=Math.max(1,Number(kayit.satirSayilari[vardiya]));
            for(let i=mevcut.length;i<hedef;i++) kayit.satirlar.push({id:`bos_${vardiya}_${Date.now()}_${i}`,personelId:'',gorev:'',vardiya,sira:i});
        });
    }
function vardiyaCiz() {
fdRosterAssert(false);

        const kayit=vardiyaAktifKayit(true),board=document.getElementById('vardiyaBoard');
        if(!kayit){board.innerHTML='<div style="text-align:center;padding:35px;color:#64748b;">Vardiya listesini görmek için şube seçin.</div>';return;}
        vardiyaBosSatirlariTamamla(kayit);
        document.getElementById('vardiyaAnaBaslik').textContent=kayit.basliklar.anaBaslik;
        document.getElementById('vardiyaTarihBaslik').textContent=`${tarihFormati(kayit.haftaBaslangic)} - ${tarihFormati(vardiyaHaftaBitisi(kayit.haftaBaslangic))}`;
        document.getElementById('vardiyaNotlar').innerText=kayit.notlar||'';
        vardiyaNumaraHaritasi=new Map();
        let siraNo=1;
        ['gunduz','ana','gece','ek'].forEach(vardiya=>{
            kayit.satirlar.filter(s=>s.vardiya===vardiya).sort((a,b)=>Number(a.sira||0)-Number(b.sira||0)).forEach(satir=>{
                if(satir.personelId) vardiyaNumaraHaritasi.set(String(satir.id),siraNo++);
            });
        });
        board.innerHTML=`<div class="vardiya-pair">${vardiyaPanelHtml(kayit,'gunduz')}${vardiyaPanelHtml(kayit,'gece')}</div><div class="vardiya-pair"><div class="vardiya-alt-ust-baslik" oncontextmenu="vardiyaBaslikDuzenle(event,'genel')">${escapeDashboardText(kayit.basliklar.genel)}</div>${vardiyaPanelHtml(kayit,'ana')}${vardiyaPanelHtml(kayit,'ek')}</div>`;
    }
function vardiyaPanelHtml(kayit,vardiya,baslangic=1) {
fdRosterAssert(false);

        const satirlar=kayit.satirlar.filter(s=>s.vardiya===vardiya).sort((a,b)=>Number(a.sira||0)-Number(b.sira||0));
        return `<section class="vardiya-panel"><div class="vardiya-panel-baslik" oncontextmenu="vardiyaBaslikDuzenle(event,'${vardiya}')">${escapeDashboardText(kayit.basliklar[vardiya]||vardiya)}<span class="vardiya-satir-kontrolleri" data-html2canvas-ignore="true"><button type="button" title="Satır ekle" onclick="event.stopPropagation();vardiyaSatirEkle('${vardiya}')">＋</button><button type="button" title="Son satırı sil" onclick="event.stopPropagation();vardiyaSatirSil('${vardiya}')">−</button></span></div>${satirlar.map(satir=>vardiyaKartHtml(satir,vardiyaNumaraHaritasi.get(String(satir.id))||'')).join('')}</section>`;
    }
function vardiyaSatirEkle(vardiya){
if(!fdRosterAssert(true))return false;

        const kayit=vardiyaAktifKayit(false);if(!kayit)return;
        const satirlar=kayit.satirlar.filter(s=>s.vardiya===vardiya);
        kayit.satirSayilari=kayit.satirSayilari||{};
        kayit.satirSayilari[vardiya]=satirlar.length+1;
        kayit.satirlar.push({id:`bos_${vardiya}_${Date.now()}`,personelId:'',gorev:'',vardiya,sira:satirlar.length});
        vardiyaDegisiklikKaydet();
    }
async function vardiyaSatirSil(vardiya){
try{

if(!fdRosterAssert(true))return false;

        const kayit=vardiyaAktifKayit(false);if(!kayit)return;
        const satirlar=kayit.satirlar.filter(s=>s.vardiya===vardiya).sort((a,b)=>Number(a.sira||0)-Number(b.sira||0));
        if(satirlar.length<=1)return;
        const son=satirlar[satirlar.length-1];
        if((son.personelId||son.personelAd||son.gorev)&&!await fdRosterAwait(fdYuzerOnaySor('Son satırda kayıt var. Satırı yine de silmek istiyor musunuz?')))return;
        kayit.satirlar=kayit.satirlar.filter(s=>s.id!==son.id);
        kayit.satirSayilari=kayit.satirSayilari||{};
        kayit.satirSayilari[vardiya]=satirlar.length-1;
        vardiyaDegisiklikKaydet();
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
}
async function vardiyaBaslikDuzenle(event,alan){
try{

if(!fdRosterAssert(true))return false;

        event.preventDefault();event.stopPropagation();
        const kayit=vardiyaAktifKayit(false);if(!kayit)return;
        const yeni=await fdRosterAwait(fdYuzerDegerSor('Başlık bilgisini yazın:',kayit.basliklar[alan]||''));
        if(yeni===null)return;kayit.basliklar[alan]=String(yeni).trim().toLocaleUpperCase('tr-TR');vardiyaDegisiklikKaydet();
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
}
function vardiyaKartHtml(satir,sira) {
fdRosterAssert(false);

        const personel=personeller.find(p=>String(p.id)===String(satir.personelId));
        const secili=vardiyaSeciliPersonelSatirId===satir.id?'secili':'';
        return `<div class="vardiya-satir ${secili}" draggable="true" onclick="vardiyaHucreTikla(event,'${satir.id}')" ondragstart="vardiyaHucreSurukleBaslat(event,'${satir.id}')" ondragend="vardiyaHucreSurukleBitir(event)" ondragover="event.preventDefault()" ondrop="vardiyaHucreBirak(event,'${satir.id}')"><span class="vardiya-sira">${sira}</span><span class="vardiya-personel ${secili}" title="İsmi düzenlemek için sağ tıklayın" oncontextmenu="vardiyaPersonelAdiDuzenle(event,'${satir.id}')">${escapeDashboardText(personel?.ad||satir.personelAd||'')}</span><span class="vardiya-gorev ${secili}" title="G&#246;revi d&#252;zenlemek i&#231;in sa&#287; t&#305;klay&#305;n" oncontextmenu="vardiyaGorevDuzenle(event,'${satir.id}')">${escapeDashboardText(satir.gorev||'')}</span></div>`;
    }
function vardiyaHucreSurukleBaslat(event,id){
if(!fdRosterAssert(true))return false;
vardiyaSuruklenenKartId=id;vardiyaSuruklenenTur='satir';vardiyaSonSuruklemeZamani=0;vardiyaDuzenlemeDevamEdiyor=true;event.currentTarget.classList.add('dragging');event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',String(id));}
function vardiyaHucreSurukleBitir(event){
fdRosterAssert(false);
event.currentTarget.classList.remove('dragging');vardiyaSonSuruklemeZamani=Date.now();fdRosterTimer(()=>{vardiyaSuruklenenKartId='';vardiyaSuruklenenTur='';},0);}
function vardiyaHucreBirak(event,hedefId){
if(!fdRosterAssert(true))return false;
event.preventDefault();event.stopPropagation();const kaynakId=event.dataTransfer?.getData('text/plain')||vardiyaSuruklenenKartId;vardiyaSonSuruklemeZamani=Date.now();vardiyaSatiriTasi(kaynakId,hedefId);}
function vardiyaHucreTikla(event,id){
fdRosterAssert(false);

        if(Date.now()-vardiyaSonSuruklemeZamani<500){event?.preventDefault();event?.stopPropagation();return;}
        const secili=vardiyaSeciliPersonelSatirId;
        if(!secili){vardiyaSeciliPersonelSatirId=id;vardiyaCiz();return;}
        if(secili===id){vardiyaSeciliPersonelSatirId='';vardiyaCiz();return;}
        vardiyaSatiriTasi(secili,id);
    }
function vardiyaSatiriTasi(kaynakId,hedefId){
if(!fdRosterAssert(true))return false;

        const kayit=vardiyaAktifKayit(false),kaynak=vardiyaSatirBul(kaynakId),hedef=vardiyaSatirBul(hedefId);if(!kayit||!kaynak||!hedef||kaynak===hedef||!(kaynak.personelId||kaynak.personelAd))return;
        const paneller=['gunduz','gece','ana','ek'];
        const listeler=Object.fromEntries(paneller.map(v=>[v,kayit.satirlar.filter(s=>s.vardiya===v).sort((a,b)=>Number(a.sira||0)-Number(b.sira||0))]));
        const kaynakListe=listeler[kaynak.vardiya],hedefListe=listeler[hedef.vardiya];if(!kaynakListe||!hedefListe)return;
        const kaynakIndex=kaynakListe.indexOf(kaynak);if(kaynakIndex<0)return;
        kaynakListe.splice(kaynakIndex,1);
        if(!hedef.personelId&&!hedef.personelAd){
            hedef.personelId=kaynak.personelId;hedef.personelAd=kaynak.personelAd||'';hedef.manuelPersonel=!!kaynak.manuelPersonel;hedef.gorev=kaynak.gorev||'';
        }else{
            kaynak.vardiya=hedef.vardiya;
            const hedefIndex=hedefListe.indexOf(hedef);
            hedefListe.splice(hedefIndex<0?hedefListe.length:hedefIndex,0,kaynak);
        }
        const diger=kayit.satirlar.filter(s=>!paneller.includes(s.vardiya));
        kayit.satirlar=[...paneller.flatMap(v=>listeler[v]),...diger];
        paneller.forEach(vardiya=>{
            const satirlar=listeler[vardiya];
            satirlar.forEach((satir,index)=>satir.sira=index);
            kayit.satirSayilari=kayit.satirSayilari||{};
            kayit.satirSayilari[vardiya]=Math.max(1,satirlar.length);
        });
        vardiyaSeciliPersonelSatirId='';vardiyaSeciliKartId='';
        vardiyaDegisiklikKaydet();
    }
function vardiyaHucreleriDegistir(kaynakId,hedefId){
if(!fdRosterAssert(true))return false;
vardiyaSatiriTasi(kaynakId,hedefId);}
function vardiyaKaydiniGecikmeliYap() {
if(!fdRosterAssert(true))return false;

        const kayit=vardiyaAktifKayit(false);if(!kayit)return;
        kayit.notlar=document.getElementById('vardiyaNotlar').innerText;
        fdRosterClearTimer(vardiyaKayitZamanlayici);
        vardiyaKayitZamanlayici=fdRosterTimer(()=>vardiyaDegisiklikKaydet(false),500);
    }
async function vardiyaDegisiklikKaydet(ciz=true) {
try{

if(!fdRosterAssert(true))return false;

        if (typeof window.fdVardiyaHaftalikKaydet !== 'function') return false;
        return window.fdVardiyaHaftalikKaydet(ciz);
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
}
function vardiyaRaporSatirlari() {
fdRosterAssert(false);

        const kayit=vardiyaAktifKayit(false);if(!kayit)return[];
        const adlar={gunduz:'GÜNDÜZ',gece:'GECE',ana:'ANA BİNA',ek:'EK BİNA',genel:'GENEL'};
        return kayit.satirlar.slice().sort((a,b)=>String(a.vardiya).localeCompare(String(b.vardiya))||Number(a.sira)-Number(b.sira)).map((s,i)=>{
            const p=personeller.find(x=>String(x.id)===String(s.personelId));
            return [i+1,adlar[s.vardiya]||s.vardiya,p?.ad||'-',s.gorev||'-'];
        });
    }
function vardiyaExcelAl() {
fdRosterAssert(false);

        const kayit=vardiyaAktifKayit(false);if(!kayit)return;
        const aoa=[['PERSONEL VARDİYA LİSTESİ'],[`${tarihFormati(kayit.haftaBaslangic)} - ${tarihFormati(vardiyaHaftaBitisi(kayit.haftaBaslangic))}`],[kayit.sube],[],['#','Vardiya','Personel','Görev Yeri'],...vardiyaRaporSatirlari(),[],['Notlar'],...String(kayit.notlar||'').split('\\n').map(x=>[x])];
        const ws=XLSX.utils.aoa_to_sheet(aoa),wb=XLSX.utils.book_new();ws['!cols']=[{wch:5},{wch:18},{wch:28},{wch:28}];XLSX.utils.book_append_sheet(wb,ws,'Vardiya');XLSX.writeFile(wb,`Vardiya_${kayit.haftaBaslangic}_${kayit.sube}.xlsx`);
    }
async function vardiyaGoruntuCanvasHazirla(alan,seciliAlanlar) {
try{

fdRosterAssert(false);

        if (!alan) throw new Error('Vardiya tablosu bulunamadı.');
        const sahne=document.createElement('div'),kopya=alan.cloneNode(true);
        const stil=(el,degerler)=>Object.entries(degerler).forEach(([anahtar,deger])=>el.style.setProperty(anahtar,deger,'important'));
        sahne.setAttribute('data-fd-vardiya-goruntu','');
        sahne.style.cssText='position:fixed;left:0;top:0;width:900px;margin:0;padding:0;background:#fff;pointer-events:none;z-index:1';
        kopya.querySelectorAll('button,[data-html2canvas-ignore],.vardiya-satir-kontrolleri').forEach(el=>el.remove());
        const alanlar=Array.isArray(seciliAlanlar)?new Set(seciliAlanlar):null;
        const hucreler=[['no','.vardiya-sira','27px'],['personel','.vardiya-personel','minmax(125px,1.12fr)'],['gorev','.vardiya-gorev','minmax(110px,.88fr)']];
        if(alanlar){
            hucreler.filter(([anahtar])=>!alanlar.has(anahtar)).forEach(([,secici])=>kopya.querySelectorAll(secici).forEach(el=>el.remove()));
            if(!alanlar.has('vardiya'))kopya.querySelectorAll('.vardiya-panel-baslik').forEach(el=>el.remove());
            if(!hucreler.some(([anahtar])=>alanlar.has(anahtar)))kopya.querySelectorAll('.vardiya-satir').forEach(el=>el.remove());
        }
        const notlar=kopya.querySelector('#vardiyaNotlar'),aciklama=String(alan.querySelector('#vardiyaNotlar')?.innerText||'').trim();
        if (notlar) {
            if (!aciklama) notlar.remove();
            else {
                notlar.textContent=aciklama;notlar.removeAttribute('data-placeholder');
                stil(notlar,{height:'auto','min-height':'0','max-height':'none',padding:'6px 8px',border:'1px solid #cbd5e1','border-radius':'7px',background:'#fff',color:'#0f172a','font-size':'11.2px','line-height':'1.45','white-space':'pre-wrap','overflow-wrap':'anywhere',overflow:'visible'});
            }
        }
        [kopya,...kopya.querySelectorAll('[id]')].forEach(el=>el.removeAttribute('id'));
        kopya.querySelectorAll('[contenteditable]').forEach(el=>el.removeAttribute('contenteditable'));
        stil(kopya,{width:'900px','min-width':'900px','max-width':'none',height:'auto','min-height':'0','max-height':'none',overflow:'visible',margin:'0',padding:'8px',background:'#fff','box-sizing':'border-box','box-shadow':'none'});
        kopya.querySelectorAll('.vardiya-board').forEach(el=>stil(el,{width:'100%','min-width':'0',height:'auto','min-height':'0','max-height':'none',overflow:'visible','box-shadow':'none'}));
        kopya.querySelectorAll('.vardiya-dinamik-grid,.vardiya-pair').forEach(el=>stil(el,{display:'grid','grid-template-columns':'repeat(2,minmax(0,1fr))',height:'auto','min-height':'0','max-height':'none'}));
        const kolonlar=hucreler.filter(([anahtar])=>!alanlar||alanlar.has(anahtar)).map(([, ,genislik])=>genislik).join(' ');
        kopya.querySelectorAll('.vardiya-satir').forEach(el=>stil(el,{display:'grid','grid-template-columns':kolonlar}));
        sahne.appendChild(kopya);document.body.appendChild(sahne);
        try {
            await fdRosterAwait(document.fonts?.ready);
            await fdRosterAwait(new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
            const genislik=Math.ceil(kopya.getBoundingClientRect().width),yukseklik=Math.ceil(kopya.getBoundingClientRect().height);
            return await fdRosterAwait(html2canvas(kopya,{scale:2,backgroundColor:'#fff',useCORS:true,width:genislik,height:yukseklik,windowWidth:900,windowHeight:Math.max(yukseklik,900),scrollX:0,scrollY:0}));
        } finally { sahne.remove(); }
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
}
async function vardiyaGoruntusuAl() {
try{

fdRosterAssert(false);

        try {
            const kayit=vardiyaAktifKayit(false);if(!kayit)return;
            const alan=document.getElementById('vardiyaCiktiAlani');
            const canvas=await fdRosterAwait(vardiyaGoruntuCanvasHazirla(alan));
            const blob=await fdRosterAwait(new Promise(resolve=>canvas.toBlob(resolve,'image/png')));
            if(!blob)throw new Error('Görüntü oluşturulamadı.');
            if(navigator.clipboard?.write&&window.ClipboardItem) {
                try { await fdRosterAwait(navigator.clipboard.write([new ClipboardItem({'image/png':blob})])); showToast('Vardiya görüntüsü panoya kopyalandı.'); return; } catch(_){if(!fdRosterValid())return;
}
            }
            const dosya=new File([blob],`Vardiya_${kayit.haftaBaslangic}.png`,{type:'image/png'});
            if(navigator.canShare?.({files:[dosya]})) { await fdRosterAwait(navigator.share({files:[dosya],title:'Personel Vardiya Listesi'})); return; }
            const bag=document.createElement('a');bag.href=fdRosterCreateURL(blob);bag.download=dosya.name;bag.click();fdRosterTimer(()=>fdRosterRevokeURL(bag.href),1000);
            showToast('Görüntü indirildi.');
        } catch(error) {if(!fdRosterValid())return;
 alert('Vardiya görüntüsü alınamadı: '+(error.message||error)); }
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
}
function vardiyaHaftalikBildirimGorunumunuBaslat(kayit) {
fdRosterAssert(false);

        if(!kayit)return;const anahtar=vardiyaHaftalikBildirimAnahtari(kayit);
        if(!vardiyaBildirimGorunumleri.has(anahtar))vardiyaBildirimGorunumleri.set(anahtar,vardiyaHaftalikBildirimGorunumu(kayit));
    }
let vardiyaBaslikSecimAlani = '';
vardiyaBaslikDuzenle=async function(event,alan){
try{

if(!fdRosterAssert(true))return false;

        event?.preventDefault?.();event?.stopPropagation?.();
        const kayit=vardiyaAktifKayit(false);if(!kayit)return;
        if(alan==='genel'||alan==='anaBaslik'){
            const yeni=await fdRosterAwait(fdYuzerDegerSor('Başlık bilgisini yazın:',kayit.basliklar[alan]||''));
            if(yeni===null)return;kayit.basliklar[alan]=String(yeni).trim().toLocaleUpperCase('tr-TR');vardiyaDegisiklikKaydet();return;
        }
        vardiyaBaslikSecimAlani=alan;vardiyaKayitTanimHaritasi(kayit);
        const menu=document.getElementById('vardiyaBaslikVardiyaMenu'),secili=kayit.vardiyaTanimlari[alan];
        menu.innerHTML='<div style="padding:6px 9px;color:#64748b;font-size:.72rem;font-weight:800">BU BAŞLIKTA KULLANILACAK VARDİYA</div>'+magicpassVardiyaTanimlariniDuzelt().map(x=>`<button type="button" onclick="vardiyaBasligaTanimAta('${escapeDashboardText(x.id)}')"><strong>${x.id===secili?'✓ ':''}${escapeDashboardText(x.ad)}</strong><small>${escapeDashboardText(x.baslangic+'–'+x.bitis+(x.aciklama?' · '+x.aciklama:''))}</small></button>`).join('');
        menu.style.left=Math.min(event.clientX,window.innerWidth-380)+'px';menu.style.top=Math.min(event.clientY,window.innerHeight-Math.min(420,menu.scrollHeight+20))+'px';menu.style.display='block';
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
};
async function vardiyaBasligaTanimAta(tanimId){
try{

if(!fdRosterAssert(true))return false;

        const kayit=vardiyaAktifKayit(false),tanim=magicpassVardiyaTanimiBul(tanimId);if(!kayit||!vardiyaBaslikSecimAlani||!tanim)return;
        vardiyaKayitTanimHaritasi(kayit)[vardiyaBaslikSecimAlani]=tanim.id;
        kayit.basliklar[vardiyaBaslikSecimAlani]=tanim.ad+' · '+tanim.baslangic+'–'+tanim.bitis;
        document.getElementById('vardiyaBaslikVardiyaMenu').style.display='none';
        vardiyaDegisiklikKaydet();
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
}
fdRosterListen('click',e=>{if(!e.target.closest('#vardiyaBaslikVardiyaMenu')){const m=document.getElementById('vardiyaBaslikVardiyaMenu');if(m)m.style.display='none';}});
const fdVardiyaAktifKayitOnceki=vardiyaAktifKayit;
vardiyaAktifKayit=function(olustur=true){
fdRosterAssert(false);

        const kayit=fdVardiyaAktifKayitOnceki(olustur);
        if(kayit)vardiyaBolumleriniDuzelt(kayit);
        return kayit;
    };
vardiyaYeniPersonelleriEkle=function(kayit,sube){
fdRosterAssert(false);

        const kayitli=new Set((kayit.satirlar||[]).map(s=>String(s.personelId||'')).filter(Boolean)),haric=new Set((kayit.personelHaricIdleri||[]).map(String)),ilk=vardiyaBolumleriniDuzelt(kayit)[0]?.id||'gunduz';
        const eksikler=personeller.filter(p=>aktifSirketeAit(p)&&!p.cikisTarihi&&String(p.sube||'')===String(sube)&&!kayitli.has(String(p.id))&&!haric.has(String(p.id))).sort((a,b)=>String(a.ad||'').localeCompare(String(b.ad||''),'tr'));
        eksikler.forEach(p=>{let hedef=kayit.satirlar.find(s=>!s.personelId&&!s.personelAd);if(!hedef){hedef={id:'vk_'+p.id+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),personelId:'',personelAd:'',gorev:'',vardiya:ilk,sira:kayit.satirlar.filter(s=>s.vardiya===ilk).length};kayit.satirlar.push(hedef);}hedef.personelId=String(p.id);hedef.personelAd='';hedef.manuelPersonel=false;hedef.gorev=String(p.gorev||'');});
    };
vardiyaBosSatirlariTamamla=function(kayit){
fdRosterAssert(false);

        kayit.satirSayilari=kayit.satirSayilari||{};
        vardiyaBolumleriniDuzelt(kayit).forEach(bolum=>{
            const mevcut=kayit.satirlar.filter(s=>s.vardiya===bolum.id);
            const hedef=Math.max(1,Number(kayit.satirSayilari[bolum.id]||mevcut.length||1));
            kayit.satirSayilari[bolum.id]=hedef;
            for(let i=mevcut.length;i<hedef;i++)kayit.satirlar.push({id:'bos_'+bolum.id+'_'+Date.now()+'_'+i,personelId:'',gorev:'',vardiya:bolum.id,sira:i});
        });
    };
vardiyaPanelHtml=function(kayit,vardiya){
fdRosterAssert(false);

        const bolum=vardiyaBolumleriniDuzelt(kayit).find(x=>x.id===vardiya)||{id:vardiya,baslik:vardiya},tanimId=vardiyaKayitTanimHaritasi(kayit)[vardiya],tanim=magicpassVardiyaTanimiBul(tanimId);
        const satirlar=kayit.satirlar.filter(s=>s.vardiya===vardiya).sort((a,b)=>Number(a.sira||0)-Number(b.sira||0));
        return '<section class="vardiya-panel"><div class="vardiya-panel-baslik" oncontextmenu="vardiyaBaslikDuzenle(event,\''+escapeDashboardText(vardiya)+'\')">'+escapeDashboardText(bolum.baslik)+'<small class="vardiya-panel-saat">'+escapeDashboardText((tanim?.baslangic||'--:--')+'-'+(tanim?.bitis||'--:--'))+'</small><span class="vardiya-satir-kontrolleri" data-html2canvas-ignore="true"><button type="button" title="Satır ekle" onclick="event.stopPropagation();vardiyaSatirEkle(\''+escapeDashboardText(vardiya)+'\')">＋</button><button type="button" title="Son satırı sil" onclick="event.stopPropagation();vardiyaSatirSil(\''+escapeDashboardText(vardiya)+'\')">−</button><button type="button" class="vardiya-bolum-sil" title="Bölümü sil" onclick="event.stopPropagation();vardiyaBolumSil(\''+escapeDashboardText(vardiya)+'\')">×</button></span></div>'+satirlar.map(s=>vardiyaKartHtml(s,vardiyaNumaraHaritasi.get(String(s.id))||'')).join('')+'</section>';
    };
vardiyaCiz=function(){
fdRosterAssert(false);

        const kayit=vardiyaAktifKayit(true),board=document.getElementById('vardiyaBoard');if(!board)return;
        if(!kayit){board.innerHTML='<div style="text-align:center;padding:35px;color:#64748b;">Vardiya listesini görmek için şube seçin.</div>';return;}
        vardiyaBosSatirlariTamamla(kayit);document.getElementById('vardiyaAnaBaslik').textContent=kayit.basliklar?.anaBaslik||'PERSONEL VARDİYA LİSTESİ';document.getElementById('vardiyaTarihBaslik').textContent=tarihFormati(kayit.haftaBaslangic)+' - '+tarihFormati(vardiyaHaftaBitisi(kayit.haftaBaslangic));document.getElementById('vardiyaNotlar').innerText=kayit.notlar||'';
        vardiyaNumaraHaritasi=new Map();let no=1;vardiyaBolumleriniDuzelt(kayit).forEach(b=>kayit.satirlar.filter(s=>s.vardiya===b.id).sort((a,c)=>Number(a.sira||0)-Number(c.sira||0)).forEach(s=>{if(s.personelId||s.personelAd)vardiyaNumaraHaritasi.set(String(s.id),no++);}));
        board.innerHTML='<div class="vardiya-dinamik-grid">'+vardiyaBolumleriniDuzelt(kayit).map(b=>vardiyaPanelHtml(kayit,b.id)).join('')+'</div>';
        vardiyaHaftalikBildirimGorunumunuBaslat(kayit);
    };
async function vardiyaYeniBolumEkle(){
try{

if(!fdRosterAssert(true))return false;

        const kayit=vardiyaAktifKayit(false);if(!kayit)return showToast('Önce şube ve hafta seçin.','warning');
        const ad=await fdRosterAwait(fdYuzerDegerSor('Yeni bölüm / sütun başlığını yazın:','','Yeni Vardiya Bölümü','Ekle'));if(ad===null||!String(ad).trim())return;
        const id='bolum_'+Date.now(),baslik=String(ad).trim().toLocaleUpperCase('tr-TR');vardiyaBolumleriniDuzelt(kayit).push({id,baslik});kayit.basliklar=kayit.basliklar||{};kayit.basliklar[id]=baslik;kayit.vardiyaTanimlari=kayit.vardiyaTanimlari||{};kayit.vardiyaTanimlari[id]=fdVardiyaVarsayilanGunduzId();kayit.satirSayilari=kayit.satirSayilari||{};kayit.satirSayilari[id]=1;kayit.satirlar.push({id:'bos_'+id+'_'+Date.now(),personelId:'',gorev:'',vardiya:id,sira:0});await fdRosterAwait(vardiyaDegisiklikKaydet());
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
}
async function vardiyaBolumSil(id){
try{

if(!fdRosterAssert(true))return false;

        const kayit=vardiyaAktifKayit(false),bolum=vardiyaBolumleriniDuzelt(kayit).find(x=>x.id===id);if(!kayit||!bolum)return;if(kayit.bolumler.length<=1)return showToast('En az bir bölüm kalmalıdır.','warning');
        const dolu=kayit.satirlar.some(s=>s.vardiya===id&&(s.personelId||s.gorev)),mesaj=dolu?'Bu bölümde personel veya görev kayıtları var. Bölüm ve içindeki satırlar silinsin mi?':'Bu bölüm silinsin mi?';
        if(!(await fdRosterAwait(fdYuzerOnaySor(mesaj,bolum.baslik+' Bölümünü Sil','Bölümü Sil'))))return;
        kayit.bolumler=kayit.bolumler.filter(x=>x.id!==id);kayit.satirlar=kayit.satirlar.filter(s=>s.vardiya!==id);delete kayit.basliklar?.[id];delete kayit.vardiyaTanimlari?.[id];delete kayit.satirSayilari?.[id];await fdRosterAwait(vardiyaDegisiklikKaydet());
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
}
async function vardiyaBolumBasliginiDegistir(){
try{

if(!fdRosterAssert(true))return false;

        const kayit=vardiyaAktifKayit(false),bolum=vardiyaBolumleriniDuzelt(kayit).find(x=>x.id===vardiyaBaslikSecimAlani);if(!bolum)return;
        const ad=await fdRosterAwait(fdYuzerDegerSor('Bölüm başlığını yazın:',bolum.baslik,'Bölüm Başlığı','Kaydet'));if(ad===null||!String(ad).trim())return;bolum.baslik=String(ad).trim().toLocaleUpperCase('tr-TR');kayit.basliklar[bolum.id]=bolum.baslik;document.getElementById('vardiyaBaslikVardiyaMenu').style.display='none';await fdRosterAwait(vardiyaDegisiklikKaydet());
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
}
vardiyaBaslikDuzenle=async function(event,alan){
try{

if(!fdRosterAssert(true))return false;

        event?.preventDefault?.();event?.stopPropagation?.();const kayit=vardiyaAktifKayit(false);if(!kayit)return;
        if(alan==='anaBaslik'||alan==='genel'){const yeni=await fdRosterAwait(fdYuzerDegerSor('Başlık bilgisini yazın:',kayit.basliklar?.[alan]||''));if(yeni!==null){kayit.basliklar[alan]=String(yeni).trim().toLocaleUpperCase('tr-TR');vardiyaDegisiklikKaydet();}return;}
        vardiyaBaslikSecimAlani=alan;const menu=document.getElementById('vardiyaBaslikVardiyaMenu'),secili=vardiyaKayitTanimHaritasi(kayit)[alan];
        menu.innerHTML='<button type="button" onclick="vardiyaBolumBasliginiDegistir()"><strong>✏️ Bölüm Başlığını Değiştir</strong><small>Başlığın görünen adını düzenler</small></button><div style="padding:7px 9px;color:#64748b;font-size:.7rem;font-weight:900">VARDİYA SAATİNİ SEÇİN</div>'+magicpassVardiyaTanimlariniDuzelt().map(x=>'<button type="button" onclick="vardiyaBasligaTanimAta(\''+escapeDashboardText(x.id)+'\')"><strong>'+(x.id===secili?'✓ ':'')+escapeDashboardText(x.ad)+'</strong><small>'+escapeDashboardText(x.baslangic+'-'+x.bitis)+'</small></button>').join('');
        menu.style.left=Math.min(event.clientX,window.innerWidth-380)+'px';menu.style.top=Math.min(event.clientY,window.innerHeight-Math.min(440,menu.scrollHeight+20))+'px';menu.style.display='block';
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
};
vardiyaBasligaTanimAta=async function(tanimId){
try{

if(!fdRosterAssert(true))return false;

        const kayit=vardiyaAktifKayit(false),tanim=magicpassVardiyaTanimiBul(tanimId);if(!kayit||!vardiyaBaslikSecimAlani||!tanim)return;vardiyaKayitTanimHaritasi(kayit)[vardiyaBaslikSecimAlani]=tanim.id;document.getElementById('vardiyaBaslikVardiyaMenu').style.display='none';await fdRosterAwait(vardiyaDegisiklikKaydet());
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
};
vardiyaRaporSatirlari=function(){
fdRosterAssert(false);

        const kayit=vardiyaAktifKayit(false);if(!kayit)return[];let no=1;return vardiyaBolumleriniDuzelt(kayit).flatMap(b=>kayit.satirlar.filter(s=>s.vardiya===b.id&&(s.personelId||s.personelAd||s.gorev)).sort((a,c)=>Number(a.sira||0)-Number(c.sira||0)).map(s=>{const p=personeller.find(x=>String(x.id)===String(s.personelId));return[no++,b.baslik,p?.ad||s.personelAd||'-',s.gorev||'-'];}));
    };
function fdVardiyaArayuzunuKur(){
fdRosterAssert(false);

        const main=document.querySelector('#vardiyaApp main'),kart=document.querySelector('#magicpass-tab-vardiya .vardiya-tanim-karti');if(!main)return;
        const kullanimNotu=main.querySelector('.card > div:first-child p');if(kullanimNotu)kullanimNotu.textContent='Personeli g\u00f6rev bilgisiyle birlikte s\u00fcr\u00fckleyin. Araya b\u0131rakt\u0131\u011f\u0131n\u0131zda di\u011fer sat\u0131rlar otomatik kayar. Telefonda ta\u015f\u0131mak i\u00e7in iki sat\u0131ra s\u0131rayla dokunun.';
        let detay=document.getElementById('vardiyaTanimDetay');if(!detay){detay=document.createElement('details');detay.id='vardiyaTanimDetay';detay.innerHTML='<summary>🕒 Vardiya Tanımları ve Saat Ayarları</summary>';}const ciktiAlani=document.getElementById('vardiyaCiktiAlani');if(ciktiAlani&&ciktiAlani.nextElementSibling!==detay)ciktiAlani.after(detay);else if(!detay.parentElement)main.appendChild(detay);if(kart&&!detay.contains(kart))detay.appendChild(kart);detay.open=false;
        const notlar=document.getElementById('vardiyaNotlar');if(notlar)notlar.contentEditable=isPersonelUser()?'false':'true';
        const aksiyon=main.querySelector('.vardiya-filtre-aksiyon');if(aksiyon&&!document.getElementById('vardiyaYeniBolumBtn')){const b=document.createElement('button');b.id='vardiyaYeniBolumBtn';b.type='button';b.className='btn-export';b.style.cssText='background:#7c3aed;color:#fff';b.textContent='＋ Yeni Bölüm / Sütun';b.onclick=vardiyaYeniBolumEkle;aksiyon.prepend(b);}
        const mpButon=[...document.querySelectorAll('#magicpassAltSekmeler button')].find(b=>String(b.getAttribute('onclick')||'').includes('magicpass-tab-vardiya'));if(mpButon)mpButon.textContent='⚙️ Dosya Ayarı';
        document.getElementById('magicpassTatilToolbar')?.remove();
    }
const fdOpenVardiyaAppOnceki=openVardiyaApp;
openVardiyaApp=async function(){
try{

fdRosterAssert(false);
const result=await fdRosterAwait(fdOpenVardiyaAppOnceki());if(result===false)return false;fdVardiyaArayuzunuKur();vardiyaCiz();return result;
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
};
(function(root){
    let identity='',latest=new Map(),errorContext=null;
    const copy=x=>JSON.parse(JSON.stringify(x));
    const valid=key=>fdRosterValid()&&fdVardiyaKayitOturumuGecerli(key);
    function selected(id){const week=vardiyaPazartesi(document.getElementById('vardiyaHafta')?.value),branch=document.getElementById('vardiyaSube')?.value;return vardiyaKayitlari.find(x=>String(x.id)===String(id)&&x.haftaBaslangic===week&&String(x.sube)===String(branch)&&aktifSirketeAit(x));}
    function status(ctx,state,text){if(!valid(ctx.identity)||!selected(ctx.id))return;const box=document.getElementById('fdVardiyaKayitDurumu');if(!box)return;box.hidden=false;box.dataset.state=state;box.querySelector('span').textContent=text;box.querySelector('button').hidden=state!=='error';if(state==='error')errorContext=ctx;}
    function expectedFor(id){return JSON.parse(veriSonKayitGoruntuleri.get('vardiya')||'[]').find(x=>String(x.id)===id)||null;}
    async function verifyPartialBaseline(ctx,expected){
        if(yuklenenVeriler.has('vardiya'))return;
        const {data,error}=await supabaseClient.from('portal_records').select('legacy_id,data').eq('company_id',ctx.company).eq('module','vardiya').eq('legacy_id',ctx.id).maybeSingle();
        if(!valid(ctx.identity))throw Error('Vardiya kayıt oturumu değişti.');if(error)throw error;
        if(data&&(String(data.legacy_id)!==ctx.id||!fdHaftalikVardiyaKaydiMi(data.data)))throw Error('Vardiya sunucu kaydı doğrulanamadı.');
        if(!fdVardiyaJsonAyniMi(data?.data||null,expected))throw Error('Vardiya başka bir oturumda değişmiş veya cihazdaki kopyası doğrulanamıyor. Güncel listeyi yükleyip tekrar düzenleyin.');
        // Only this weekly row was read. Never mark the entire attendance dataset loaded.
    }
    async function saveOne(ctx,payload,ticket){
        supabaseKaydetmeBekleyen++;
        const work=supabaseKaydetmeKuyrugu.catch(()=>{}).then(async()=>{
            if(!valid(ctx.identity))throw Error('Oturum değişti; önceki vardiya işlemi iptal edildi.');
            if(latest.get(ctx.id)!==ticket)return null;
            const expected=expectedFor(ctx.id);await verifyPartialBaseline(ctx,expected);
            const result=await fdVardiyaGuvenliSunucuKaydi(ctx.company,payload,expected,()=>valid(ctx.identity));
            if(!valid(ctx.identity))return null;
            fdVardiyaYerelKaydiniDogrula(result,payload);veriOnbelleginiKaydet();return result;
        }).finally(()=>{supabaseKaydetmeBekleyen=Math.max(0,supabaseKaydetmeBekleyen-1);});
        supabaseKaydetmeKuyrugu=work;return work;
    }
    root.fdVardiyaHaftalikKaydet=async function(redraw=true){
        if(!fdRosterValid()||!fdVardiyaYazmaYetkisi()){vardiyaDuzenlemeDevamEdiyor=false;return false;}
        if(!fdRosterAssert(true))return false;
        const key=fdVardiyaOturumAnahtari();if(key!==identity){identity=key;latest.clear();errorContext=null;}
        clearTimeout(vardiyaKayitZamanlayici);const record=vardiyaAktifKayit(false);if(!record)return false;
        const ctx={id:String(record.id),company:String(aktifSirketId()),identity:key},ticket=++vardiyaKayitSurumu;latest.set(ctx.id,ticket);vardiyaDuzenlemeDevamEdiyor=true;
        if(!SUPABASE_MODE||!supabaseClient){status(ctx,'error','Sunucu bağlantısı yok; vardiya kaydedilmedi.');vardiyaDuzenlemeDevamEdiyor=false;return false;}
        record.guncellemeZamani=Date.now();if(redraw)vardiyaCiz();const payload=copy(record),notificationKey=vardiyaHaftalikBildirimAnahtari(payload),previous=vardiyaBildirimGorunumleri.get(notificationKey)||vardiyaHaftalikBildirimGorunumu(payload),notice=vardiyaHaftalikBildirimleriHazirla(payload,previous);
        status(ctx,'saving','Vardiya sunucuda doğrulanarak kaydediliyor…');
        const queued=vardiyaKayitKuyrugu.catch(()=>{}).then(()=>saveOne(ctx,payload,ticket));vardiyaKayitKuyrugu=queued;
        try{
            const result=await queued;if(!result||!valid(key)||latest.get(ctx.id)!==ticket)return false;
            errorContext=null;status(ctx,'saved','Kaydedildi · Sunucudaki vardiya doğrulandı.');
            if(selected(ctx.id))magicpassAylikCizelgeyiCiz();showToast('Vardiya listesi sunucuda doğrulanarak kaydedildi.','success');
            vardiyaBildirimGorunumleri.set(notificationKey,notice.guncel);
            const notifications=await personelVardiyaBildirimleriniPlanla(notice.bildirimler,()=>valid(key)&&latest.get(ctx.id)===ticket);
            if(!valid(key))return true;if(notifications.basarisiz)showToast(notifications.basarisiz+' vardiya WhatsApp bildirimi planlanamadı.','warning');return true;
        }catch(e){if(!valid(key)||latest.get(ctx.id)!==ticket)return false;status(ctx,'error','Kaydedilemedi: '+String(e?.message||e));showToast('Vardiya kaydedilemedi. Taslağınız ekranda korundu; güncel listeyi yükleyerek karşılaştırın.','error');return false;}
        finally{if(ticket===vardiyaKayitSurumu){vardiyaDuzenlemeDevamEdiyor=false;fdOtomatikEsitlemeSon=Date.now();}}
    };
    root.fdVardiyaGuncelListeyiYukle=async function(){
        const ctx=errorContext;if(!ctx||!valid(ctx.identity)||!selected(ctx.id))return;
        if(!await fdYuzerOnaySor('Kaydedilemeyen ekrandaki taslak yerine sunucudaki son vardiya listesi yüklensin mi?','Güncel Vardiyayı Yükle','Güncel Listeyi Yükle'))return;
        if(!valid(ctx.identity)||errorContext!==ctx)return;
        try{
            const {data,error}=await supabaseClient.from('portal_records').select('legacy_id,data').eq('company_id',ctx.company).eq('module','vardiya').eq('legacy_id',ctx.id).maybeSingle();
            if(!valid(ctx.identity)||errorContext!==ctx||!selected(ctx.id))return;if(error)throw error;
            if(!data?.data||!fdHaftalikVardiyaKaydiMi(data.data))throw Error('Sunucuda bu haftanın listesi bulunamadı. Sayfayı yenileyin.');
            const local=selected(ctx.id);fdVardiyaYerelKaydiniDogrula(data,local);latest.delete(ctx.id);errorContext=null;vardiyaCiz();status(ctx,'saved','Sunucudaki güncel vardiya yüklendi.');veriOnbelleginiKaydet();
        }catch(e){status(ctx,'error','Güncel liste yüklenemedi: '+String(e?.message||e));}
    };
})(fdRosterSaveAPI);
const bekle=ms=>new Promise(r=>window.setTimeout(r,ms));
vardiyaPdfAl=async function(){
try{

fdRosterAssert(false);

        const kayit=vardiyaAktifKayit(false),kaynak=document.getElementById('vardiyaCiktiAlani');if(!kayit||!kaynak)return;
        if(typeof html2canvas!=='function'||!window.jspdf?.jsPDF)return alert('PDF bileşenleri yüklenemedi.');
        const dosyaAdi='Vardiya_'+kayit.haftaBaslangic+'_'+kayit.sube+'.pdf',modal=fdRosterPreview('pdf',dosyaAdi),icerik=modal.querySelector('[data-cikti-icerik]');
        icerik.innerHTML='';icerik.style.cssText+=';padding:18px;overflow:auto;background:#cbd5e1';
        const sahne=document.createElement('div'),kopya=kaynak.cloneNode(true);sahne.style.cssText='width:900px;max-width:none;height:auto;max-height:none;overflow:visible;margin:0 auto;padding:0;background:#fff;box-sizing:border-box';
        kopya.querySelectorAll('button,[data-html2canvas-ignore],.vardiya-satir-kontrolleri').forEach(x=>x.remove());kopya.querySelectorAll('[contenteditable]').forEach(x=>x.removeAttribute('contenteditable'));kopya.style.cssText='width:900px;max-width:none;height:auto;max-height:none;overflow:visible;margin:0;padding:12px;background:#fff;box-sizing:border-box';kopya.querySelectorAll('.vardiya-board,.table-wrapper').forEach(x=>{x.style.height='auto';x.style.maxHeight='none';x.style.overflow='visible'});sahne.appendChild(kopya);icerik.appendChild(sahne);
        try{await fdRosterAwait(document.fonts?.ready);await fdRosterAwait(new Promise(requestAnimationFrame));await fdRosterAwait(bekle(70));const canvas=await fdRosterAwait(html2canvas(kopya,{scale:1.55,useCORS:true,backgroundColor:'#fff',logging:false,scrollX:0,scrollY:0,width:kopya.scrollWidth,height:kopya.scrollHeight,windowWidth:Math.max(kopya.scrollWidth,1000),windowHeight:Math.max(kopya.scrollHeight,1000)})),pdf=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true}),pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),kenarX=8,ust=9,alt=14,oran=Math.min((pw-kenarX*2)/canvas.width,(ph-ust-alt)/canvas.height),w=canvas.width*oran,h=canvas.height*oran;pdf.addImage(canvas.toDataURL('image/jpeg',.94),'JPEG',(pw-w)/2,ust,w,h,undefined,'FAST');pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.setTextColor(100,116,139);pdf.text('Personel Vardiya Listesi',kenarX,ph-6);pdf.text('Sayfa 1 / 1',pw-kenarX,ph-6,{align:'right'});const blob=pdf.output('blob');fdCiktiPdfOnizle(blob,dosyaAdi,modal);return blob}catch(e){if(!fdRosterValid())return;
modal.remove();console.error(e);alert('Vardiya PDF hazırlanamadı: '+(e.message||e))}
    
}catch(fdRosterError){if(!fdRosterValid())return;throw fdRosterError;}
};
return{init(){fdRosterAssert();fdVardiyaArayuzunuKur();window.fdSupplementalOutputInstall?.();window.fdUnifiedOutput?.scan()},open(){fdRosterAssert();return openVardiyaApp()},api:{get vardiyaFiltreleriniHazirla(){return vardiyaFiltreleriniHazirla},get vardiyaAktifKayit(){return vardiyaAktifKayit},get vardiyaYeniPersonelleriEkle(){return vardiyaYeniPersonelleriEkle},get vardiyaSecimiDegisti(){return vardiyaSecimiDegisti},get vardiyaSatirBul(){return vardiyaSatirBul},get vardiyaSurukleBaslat(){return vardiyaSurukleBaslat},get vardiyaSurukleBitir(){return vardiyaSurukleBitir},get vardiyaKartUstuneBirak(){return vardiyaKartUstuneBirak},get vardiyaLaneBirak(){return vardiyaLaneBirak},get vardiyaKartaTikla(){return vardiyaKartaTikla},get vardiyaGorevDuzenle(){return vardiyaGorevDuzenle},get vardiyaPersonelAdiDuzenle(){return vardiyaPersonelAdiDuzenle},get vardiyaKartlariDegistir(){return vardiyaKartlariDegistir},get vardiyaBosSatirlariTamamla(){return vardiyaBosSatirlariTamamla},get vardiyaCiz(){return vardiyaCiz},get vardiyaPanelHtml(){return vardiyaPanelHtml},get vardiyaSatirEkle(){return vardiyaSatirEkle},get vardiyaSatirSil(){return vardiyaSatirSil},get vardiyaBaslikDuzenle(){return vardiyaBaslikDuzenle},get vardiyaKartHtml(){return vardiyaKartHtml},get vardiyaHucreSurukleBaslat(){return vardiyaHucreSurukleBaslat},get vardiyaHucreSurukleBitir(){return vardiyaHucreSurukleBitir},get vardiyaHucreBirak(){return vardiyaHucreBirak},get vardiyaHucreTikla(){return vardiyaHucreTikla},get vardiyaSatiriTasi(){return vardiyaSatiriTasi},get vardiyaHucreleriDegistir(){return vardiyaHucreleriDegistir},get vardiyaKaydiniGecikmeliYap(){return vardiyaKaydiniGecikmeliYap},get vardiyaDegisiklikKaydet(){return vardiyaDegisiklikKaydet},get vardiyaRaporSatirlari(){return vardiyaRaporSatirlari},get vardiyaExcelAl(){return vardiyaExcelAl},get vardiyaGoruntuCanvasHazirla(){return vardiyaGoruntuCanvasHazirla},get vardiyaGoruntusuAl(){return vardiyaGoruntusuAl},get vardiyaHaftalikBildirimGorunumunuBaslat(){return vardiyaHaftalikBildirimGorunumunuBaslat},get vardiyaBasligaTanimAta(){return vardiyaBasligaTanimAta},get vardiyaYeniBolumEkle(){return vardiyaYeniBolumEkle},get vardiyaBolumSil(){return vardiyaBolumSil},get vardiyaBolumBasliginiDegistir(){return vardiyaBolumBasliginiDegistir},get fdVardiyaArayuzunuKur(){return fdVardiyaArayuzunuKur},get vardiyaPdfAl(){return vardiyaPdfAl},get fdVardiyaHaftalikKaydet(){return fdRosterSaveAPI.fdVardiyaHaftalikKaydet},get fdVardiyaGuncelListeyiYukle(){return fdRosterSaveAPI.fdVardiyaGuncelListeyiYukle}},dispose(){fdRosterDisposed=true;for(const id of fdRosterTimers)window.clearTimeout(id);fdRosterTimers.clear();for(const [type,fn,options]of fdRosterListeners)document.removeEventListener(type,fn,options);for(const u of fdRosterURLs)URL.revokeObjectURL(u);fdRosterURLs.clear();for(const n of fdRosterOutputs){if(n?._url)URL.revokeObjectURL(n._url);n?.remove()}if(fdRosterSettings&&fdRosterSettingsParent){fdRosterSettingsParent.insertBefore(fdRosterSettings,fdRosterSettingsNext?.parentNode===fdRosterSettingsParent?fdRosterSettingsNext:null)}for(const n of document.querySelectorAll('[data-fd-vardiya-goruntu]'))n.remove();if(typeof fdAcikUygulamaSekmeleri!=='undefined')for(const tab of fdAcikUygulamaSekmeleri)if(tab.alanId==='vardiyaApp')tab.alanId='';}};
});
