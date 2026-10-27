window.FDModules.define('evrak',function(){

let fdDocDisposed=false;
const fdDocInitial=fdDocContext(),fdDocListeners=[],fdDocTimers=new Set(),fdDocReaders=new Set(),fdDocUrls=new Set(),fdDocNodes=new Set();
function fdDocContext(){return JSON.stringify([fdDocDataContext(),anaMenuModulYetkisi('evrak')])}
function fdDocValid(){return !fdDocDisposed&&fdDocInitial===fdDocContext()&&anaMenuModulErisimiVar('evrak')}
function fdDocAssert(write=false){if(!fdDocValid())throw Error('Oturum değişti; Evrak Takip ekranını yeniden açın.');if(write&&!anaMenuModulYazmaYetkisiVar('evrak'))throw Error('Bu modülde değişiklik yapma yetkiniz yok.')}
async function fdDocAwait(promise){fdDocAssert();const r=await promise;fdDocAssert();return r}
function fdDocListen(target,...args){target.addEventListener(...args);fdDocListeners.push([target,...args])}
function fdDocAppend(node){fdDocNodes.add(node);return document.body.appendChild(node)}
function setTimeout(fn,delay,...args){const id=window.setTimeout(()=>{fdDocTimers.delete(id);if(fdDocValid())fn(...args)},delay);fdDocTimers.add(id);return id}
const URL={createObjectURL(blob){const u=window.URL.createObjectURL(blob);fdDocUrls.add(u);return u},revokeObjectURL(u){fdDocUrls.delete(u);window.URL.revokeObjectURL(u)}};
function fdEvrakOnizlemeKimligi(){return evrakOnizlemeId}
// Same base64 semantics as the shared Tapu reader, with local cancellation ownership.
function evrakDosyayiOku(dosya){fdDocAssert();return new Promise((resolve,reject)=>{const okuyucu=new window.FileReader();fdDocReaders.add(okuyucu);const finish=(error,value)=>{fdDocReaders.delete(okuyucu);error?reject(error):resolve(value)};okuyucu.onload=()=>{if(!fdDocValid())return finish(Error('Oturum değişti.'));const base64=String(okuyucu.result||'').split(',')[1]||'';base64?finish(null,base64):finish(Error('Seçilen dosya okunamadı.'))};okuyucu.onerror=()=>finish(Error('Seçilen dosya okunamadı.'));okuyucu.onabort=()=>finish(Error('Dosya okuma iptal edildi.'));okuyucu.readAsDataURL(dosya)})}

let evrakAktifKategori = 'tumu';
let evrakYukleniyor = false;
let evrakDuzenlemeId = '';
let evrakKategoriDuzenlemeId = '';
let evrakOnizlemeId = '';
let evrakWhatsappDuzenlemeId = '';
let evrakWhatsappEvrakId = '';
let evrakWhatsappGonderilecekIds = [];
const evrakWhatsappSepeti = new Set();
function evrakYeniId(onEk){
fdDocAssert(false);
return String(onEk || 'evrak') + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);}
function evrakTarih(deger){
fdDocAssert(false);
if(!deger)return '-';const d=new Date(String(deger).length===10?String(deger)+'T00:00:00':deger);return Number.isNaN(d.getTime())?'-':d.toLocaleDateString('tr-TR');}
function evrakBoyut(deger){
fdDocAssert(false);
const n=Number(deger||0);if(!n)return '-';if(n<1024*1024)return Math.max(1,Math.round(n/1024))+' KB';return (n/1024/1024).toFixed(1).replace('.',',')+' MB';}
function evrakBildirim(mesaj,tur){
fdDocAssert(false);
if(typeof showToast==='function')showToast(mesaj,tur||'success');else alert(mesaj);}
function evrakBelgeleri(){
fdDocAssert(false);
return evrakKayitlari.filter(x=>x&&x.tip==='evrak');}
function evrakWhatsappKisileri(){
fdDocAssert(false);
return evrakKayitlari.filter(x=>x&&x.tip==='whatsapp_kisi').sort((a,b)=>String(a.ad||'').localeCompare(String(b.ad||''),'tr-TR',{sensitivity:'base'}));}
function evrakWhatsappNumarasi(deger){
fdDocAssert(false);
let n=String(deger||'').replace(/\D/g,'');if(n.startsWith('00'))n=n.slice(2);if(n.startsWith('0'))n='90'+n.slice(1);else if(n.length===10)n='90'+n;return n;}
function evrakWhatsappKisiFormunuTemizle(){
fdDocAssert(false);
evrakWhatsappDuzenlemeId='';document.getElementById('evrakWhatsappKisiForm')?.reset();document.getElementById('evrakWhatsappKisiId').value='';document.getElementById('evrakWhatsappKisiKaydetBtn').textContent='Kişiyi Kaydet';document.getElementById('evrakWhatsappKisiVazgecBtn').style.display='none';}
function evrakWhatsappKisiListesiniCiz(){
fdDocAssert(false);
const alan=document.getElementById('evrakWhatsappKisiListesi'),kisiler=evrakWhatsappKisileri();if(!alan)return;alan.innerHTML=kisiler.length?kisiler.map(k=>'<div class="evrak-wa-kisi"><div><strong>'+escapeDashboardText(k.ad||'-')+'</strong><small>+'+escapeDashboardText(k.telefon||'')+'</small></div><div class="evrak-wa-kisi-actions"><button class="evrak-icon-btn edit" type="button" title="Düzenle" onclick="evrakWhatsappKisiDuzenle(\''+escapeDashboardText(String(k.id))+'\')">✏</button><button class="evrak-icon-btn delete" type="button" title="Sil" onclick="evrakWhatsappKisiSil(\''+escapeDashboardText(String(k.id))+'\')">🗑</button></div></div>').join(''):'<div class="evrak-wa-empty">Henüz WhatsApp kişisi eklenmedi.</div>';}
function evrakWhatsappKisileriniAc(){
fdDocAssert(true);
if(!anaMenuModulYazmaYetkisiVar('evrak'))return;evrakWhatsappKisiFormunuTemizle();evrakWhatsappKisiListesiniCiz();document.getElementById('modalEvrakWhatsappKisiler').style.display='flex';setTimeout(()=>document.getElementById('evrakWhatsappKisiAdi')?.focus(),50);}
function evrakWhatsappKisiDuzenle(id){
fdDocAssert(true);
const k=evrakWhatsappKisileri().find(x=>String(x.id)===String(id));if(!k)return;evrakWhatsappDuzenlemeId=String(k.id);document.getElementById('evrakWhatsappKisiId').value=String(k.id);document.getElementById('evrakWhatsappKisiAdi').value=k.ad||'';document.getElementById('evrakWhatsappKisiTelefon').value=k.telefon||'';document.getElementById('evrakWhatsappKisiKaydetBtn').textContent='Değişiklikleri Kaydet';document.getElementById('evrakWhatsappKisiVazgecBtn').style.display='';}
async function evrakWhatsappKisiKaydet(event){
try{
fdDocAssert(true);
event.preventDefault();if(!anaMenuModulYazmaYetkisiVar('evrak'))return;const ad=document.getElementById('evrakWhatsappKisiAdi').value.trim(),telefon=evrakWhatsappNumarasi(document.getElementById('evrakWhatsappKisiTelefon').value),id=String(evrakWhatsappDuzenlemeId||'');if(!ad||!/^[1-9]\d{9,14}$/.test(telefon))return alert('Geçerli bir WhatsApp numarası girin. Örnek: 05xx xxx xx xx');if(evrakWhatsappKisileri().some(x=>String(x.id)!==id&&String(x.telefon)===telefon))return alert('Bu WhatsApp numarası zaten kayıtlı.');const eski=id?evrakKayitlari.find(x=>String(x.id)===id):null,kayit=eski?{...eski,ad,telefon,duzenlemeZamani:new Date().toISOString()}:{id:evrakYeniId('whatsapp'),tip:'whatsapp_kisi',sirketId:activeUser.sirketId,ad,telefon,olusturmaZamani:new Date().toISOString()};const btn=event.submitter;btn.disabled=true;try{await fdDocAwait(evrakKaydiYaz(kayit));await fdDocAwait(evrakVerileriniYukle());evrakWhatsappKisiFormunuTemizle();evrakWhatsappKisiListesiniCiz();evrakBildirim(id?'WhatsApp kişisi güncellendi.':'WhatsApp kişisi eklendi.');}catch(hata){
if(!fdDocValid())return;
console.error(hata);alert('WhatsApp kişisi kaydedilemedi. Lütfen tekrar deneyin.');}finally{
if(fdDocValid()){
btn.disabled=false;
}
}
}catch(fdDocError){if(!fdDocValid())return;throw fdDocError;}
}
async function evrakWhatsappKisiSil(id){
try{
fdDocAssert(true);
if(!anaMenuModulYazmaYetkisiVar('evrak'))return;const k=evrakWhatsappKisileri().find(x=>String(x.id)===String(id));if(!k||!confirm('“'+k.ad+'” WhatsApp kişilerinden silinsin mi?'))return;try{const sonuc=await fdDocAwait(supabaseClient.from('portal_records').delete().eq('company_id',activeUser.sirketId).eq('module','evraktakip').eq('legacy_id',String(id)));if(sonuc.error)throw sonuc.error;await fdDocAwait(evrakVerileriniYukle());evrakWhatsappKisiFormunuTemizle();evrakWhatsappKisiListesiniCiz();evrakBildirim('WhatsApp kişisi silindi.');}catch(hata){
if(!fdDocValid())return;
console.error(hata);alert('WhatsApp kişisi silinemedi.');}
}catch(fdDocError){if(!fdDocValid())return;throw fdDocError;}
}
function evrakWhatsappSepetiniGuncelle(){
fdDocAssert(false);
const mevcut=new Set(evrakBelgeleri().map(x=>String(x.id)));[...evrakWhatsappSepeti].forEach(id=>{if(!mevcut.has(id))evrakWhatsappSepeti.delete(id);});const adet=evrakWhatsappSepeti.size,wa=document.getElementById('evrakSepetWhatsappBtn'),indir=document.getElementById('evrakSepetIndirBtn'),temizle=document.getElementById('evrakSepetTemizleBtn');if(wa){wa.style.display=adet?'inline-flex':'none';wa.textContent='💬 Gönder ('+adet+')';}if(indir){indir.style.display=adet?'inline-flex':'none';indir.textContent='⬇ Toplu İndir ('+adet+')';}if(temizle)temizle.style.display=adet?'inline-flex':'none';}
function evrakWhatsappSepetDegistir(id,secili){
fdDocAssert(false);
id=String(id);if(secili)evrakWhatsappSepeti.add(id);else evrakWhatsappSepeti.delete(id);evrakWhatsappSepetiniGuncelle();}
function evrakWhatsappGorunenleriSec(secili){
fdDocAssert(false);
document.querySelectorAll('#evrakListeAlani .evrak-secim-kutu[value]').forEach(kutu=>{kutu.checked=secili;evrakWhatsappSepetDegistir(kutu.value,secili);});}
function evrakWhatsappSepetiniTemizle(){
fdDocAssert(false);
evrakWhatsappSepeti.clear();document.querySelectorAll('#evrakListeAlani .evrak-secim-kutu').forEach(kutu=>kutu.checked=false);evrakWhatsappSepetiniGuncelle();}
function evrakWhatsappSepetBelgeleri(){
fdDocAssert(false);
return [...evrakWhatsappSepeti].map(id=>evrakBelgeleri().find(x=>String(x.id)===id)).filter(x=>x&&(x.dosya?.id||x.dosya?.url));}
function evrakWhatsappKisiSeciminiGoster(baslik){
fdDocAssert(false);
document.getElementById('evrakWhatsappGonderBaslik').textContent=baslik;const alan=document.getElementById('evrakWhatsappGonderListesi'),kisiler=evrakWhatsappKisileri();alan.innerHTML=kisiler.length?kisiler.map(k=>'<button class="evrak-wa-secim" type="button" onclick="evrakWhatsappGonder(\''+escapeDashboardText(String(k.id))+'\')"><span>💬</span><span><strong>'+escapeDashboardText(k.ad||'-')+'</strong><small>+'+escapeDashboardText(k.telefon||'')+'</small></span></button>').join(''):'<div class="evrak-wa-empty">Kayıtlı WhatsApp kişisi yok.'+(anaMenuModulYazmaYetkisiVar('evrak')?'<br><button class="btn-modern" type="button" style="margin-top:10px" onclick="modalKapat(\'modalEvrakWhatsappGonder\');evrakWhatsappKisileriniAc()">Kişi Ekle</button>':'')+'</div>';document.getElementById('modalEvrakWhatsappGonder').style.display='flex';}
function evrakWhatsappTopluSeciminiAc(){
fdDocAssert(false);
const belgeler=evrakWhatsappSepetBelgeleri();if(!belgeler.length)return alert('Göndermek için en az bir evrak seçin.');evrakWhatsappGonderilecekIds=belgeler.map(x=>String(x.id));evrakWhatsappKisiSeciminiGoster('💬 '+belgeler.length+' Evrakı Gönder');}
async function evrakWhatsappSepetiTopluIndir(){
try{
fdDocAssert(false);
const belgeler=evrakWhatsappSepetBelgeleri(),btn=document.getElementById('evrakSepetIndirBtn');if(!belgeler.length)return alert('İndirmek için en az bir evrak seçin.');if(typeof JSZip==='undefined')return alert('Toplu indirme hazırlanamadı.');btn.disabled=true;try{const zip=new JSZip();for(let i=0;i<belgeler.length;i++){const evrak=belgeler[i];btn.textContent='Hazırlanıyor '+(i+1)+' / '+belgeler.length;const dosya=await fdDocAwait(fdYazilimDriveDosyaIndir(evrak.dosya.id,'EVRAK TAKİP')),ad=dosya.ad||evrak.dosya.ad||((evrak.evrakAdi||'evrak')+'.pdf');zip.file(String(i+1).padStart(2,'0')+'_'+ad,dosya.base64,{base64:true});}const arsiv=await fdDocAwait(zip.generateAsync({type:'blob'},bilgi=>{btn.textContent='Arşivleniyor %'+Math.round(bilgi.percent);})),adres=URL.createObjectURL(arsiv),a=document.createElement('a');a.href=adres;a.download='EVRAKLAR_'+new Date().toISOString().slice(0,10)+'.zip';fdDocAppend(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(adres),1500);evrakWhatsappSepetiniTemizle();evrakBildirim(belgeler.length+' evrak indirildi.');}catch(hata){
if(!fdDocValid())return;
console.error(hata);alert('Seçilen evraklar indirilemedi. Lütfen tekrar deneyin.');}finally{
if(fdDocValid()){
btn.disabled=false;evrakWhatsappSepetiniGuncelle();
}
}
}catch(fdDocError){if(!fdDocValid())return;throw fdDocError;}
}
function evrakWhatsappSeciminiAc(id){
fdDocAssert(false);
const kayit=evrakBelgeleri().find(x=>String(x.id)===String(id));if(!kayit?.dosya?.id&&!kayit?.dosya?.url)return alert('Bu evrakın gönderilecek dosya bağlantısı bulunamadı.');evrakWhatsappGonderilecekIds=[String(kayit.id)];evrakWhatsappKisiSeciminiGoster('💬 '+(kayit.evrakAdi||'Evrak')+' Gönder');}
function evrakWhatsappGonder(kisiId){
fdDocAssert(false);

        if(!activeUser?.sirketId)return alert('Şirket oturumu bulunamadı.');
        if(typeof anaMenuModulErisimiVar==='function'&&!anaMenuModulErisimiVar('evrak'))return alert('Evrak paylaşma yetkiniz yok.');
        const kisi=evrakWhatsappKisileri().find(x=>String(x.id)===String(kisiId)),ids=[...new Set(evrakWhatsappGonderilecekIds.map(String))],belgeler=ids.map(id=>evrakBelgeleri().find(x=>String(x.id)===id));
        if(!kisi||!ids.length)return;
        if(belgeler.some(x=>!x||(!x.dosya?.id&&!x.dosya?.url&&!x.dosya?.webViewLink)))return alert('Seçilen evraklardan birinin dosya bağlantısı bulunamadı. Seçimi kontrol edin.');
        const telefon=evrakWhatsappNumarasi(kisi.telefon);if(!/^[1-9]\d{9,14}$/.test(telefon))return alert('Kişi numarası geçerli değil.');
        const satirlar=belgeler.map((kayit,i)=>(belgeler.length>1?(i+1)+'. ':'')+(kayit.evrakAdi||'Evrak')+(kayit.yil?' ('+kayit.yil+')':'')+'\n'+evrakDosyaBaglantisi(kayit.dosya));
        const mesaj='Merhaba,\n'+(belgeler.length>1?'İstediğiniz evrakları gönderiyorum:':'Evrakı iletiyorum:')+'\n\n'+satirlar.join('\n\n');
        // Open synchronously from the user's click; no file preparation or helper.
        window.open('https:\x2f\x2fwa.me/'+telefon+'?text='+encodeURIComponent(mesaj),'_blank','noopener,noreferrer');
        modalKapat('modalEvrakWhatsappGonder');
    }
async function evrakKaydiYaz(kayit){
try{
fdDocAssert(true);

        const satir={company_id:activeUser.sirketId,module:'evraktakip',legacy_id:String(kayit.id),record_year:Number(kayit.yil||new Date().getFullYear()),employee_legacy_id:null,data:kayit};
        const sonuc=await fdDocAwait(supabaseClient.from('portal_records').upsert(satir,{onConflict:'company_id,module,legacy_id'}).select('legacy_id,data').single());
        if(sonuc.error)throw sonuc.error;
        if(!sonuc.data?.data)throw new Error('Evrak kaydı doğrulanamadı.');
        return {...sonuc.data.data,id:String(sonuc.data.data.id||sonuc.data.legacy_id)};
    
}catch(fdDocError){if(!fdDocValid())return;throw fdDocError;}
}
async function openEvrakTakipApp(){
try{
fdDocAssert(false);

        if(!anaMenuModulErisimiVar('evrak'))return;
        anaMenuDonusButonunuGoster();
        fdTumUygulamaAlanlariniGizle();
        document.getElementById('evrakTakipApp').style.display='block';
        const yazabilir=anaMenuModulYazmaYetkisiVar('evrak');
        document.getElementById('evrakKategoriEkleBtn').style.display=yazabilir?'':'none';
        document.getElementById('evrakBelgeEkleBtn').style.display=yazabilir?'':'none';
        document.getElementById('evrakWhatsappKisiBtn').style.display=yazabilir?'':'none';
        document.getElementById('evrakListeAlani').innerHTML='<div class="evrak-empty"><span>⏳</span><strong>Evraklar yükleniyor</strong><div>Kayıtlar hazırlanıyor.</div></div>';
        try{await fdDocAwait(evrakVerileriniYukle());evrakEkraniniCiz();}catch(hata){
if(!fdDocValid())return;
console.error(hata);document.getElementById('evrakListeAlani').innerHTML='<div class="evrak-empty"><span>⚠️</span><strong>Evraklar yüklenemedi</strong><div>'+'Lütfen sayfayı yenileyip tekrar deneyin.'+'</div></div>';}
    
}catch(fdDocError){if(!fdDocValid())return;throw fdDocError;}
}
function evrakKategoriSec(id){
fdDocAssert(false);

        evrakAktifKategori=String(id||'tumu');
        const arama=document.getElementById('evrakArama');if(arama)arama.value='';
        evrakEkraniniCiz();
    }
function evrakAramayiTemizle(){
fdDocAssert(false);
const a=document.getElementById('evrakArama');if(a){a.value='';a.focus();}evrakEkraniniCiz();}
function evrakSonKullanmaEtiketi(tarih){
fdDocAssert(false);

        if(!tarih)return '<span class="evrak-muted">Süresiz / belirtilmedi</span>';
        const bitis=new Date(tarih+'T23:59:59'),bugun=new Date(),gun=Math.ceil((bitis-bugun)/86400000),sinif=gun<0?' expired':(gun<=45?' soon':'');
        const metin=gun<0?'Süresi doldu':(gun<=45?gun+' gün kaldı':'Geçerli');
        return '<span class="evrak-expiry'+sinif+'" title="'+escapeDashboardText(evrakTarih(tarih))+'">'+escapeDashboardText(metin)+'</span>';
    }
function evrakDosyaIkonu(dosya){
fdDocAssert(false);

        const tip=String(dosya?.mimeType||'').toLowerCase(),ad=String(dosya?.ad||'').toLowerCase();
        if(tip.includes('pdf')||ad.endsWith('.pdf'))return '📕';
        if(tip.includes('image'))return '🖼️';
        if(tip.includes('word')||ad.endsWith('.doc')||ad.endsWith('.docx'))return '📘';
        if(tip.includes('excel')||tip.includes('spreadsheet')||ad.endsWith('.xls')||ad.endsWith('.xlsx'))return '📗';
        return '📄';
    }
function evrakEkraniniCiz(){
fdDocAssert(false);

        const listeAlani=document.getElementById('evrakListeAlani');if(!listeAlani)return;evrakWhatsappSepetiniGuncelle();
        const kategoriler=evrakKategorileri(),belgeler=evrakBelgeleri(),buYil=String(new Date().getFullYear()),aramaHam=String(document.getElementById('evrakArama')?.value||'').trim(),arama=evrakMetin(aramaHam);
        document.getElementById('evrakStatKategori').textContent=kategoriler.length;
        document.getElementById('evrakStatBelge').textContent=belgeler.length;
        document.getElementById('evrakStatBuYil').textContent=belgeler.filter(x=>String(x.yil)===buYil).length;
        document.getElementById('evrakKategoriOzeti').textContent=kategoriler.length+' kategori';
        const kategoriHaritasi=new Map(kategoriler.map(x=>[String(x.id),x])),yazabilir=anaMenuModulYazmaYetkisiVar('evrak');
        const tumButon='<button class="evrak-kategori '+(evrakAktifKategori==='tumu'?'active':'')+'" type="button" onclick="evrakKategoriSec(\'tumu\')"><span class="evrak-kategori-ikon">🗂️</span><span><strong>Tüm Evraklar</strong><small>Bütün kategoriler</small></span><span class="evrak-kategori-count">'+belgeler.length+'</span></button>';
        document.getElementById('evrakKategoriListesi').innerHTML=tumButon+kategoriler.map(k=>{
            const adet=belgeler.filter(x=>String(x.kategoriId)===String(k.id)).length;
            return '<button class="evrak-kategori '+(evrakAktifKategori===String(k.id)?'active':'')+'" type="button" onclick="evrakKategoriSec(&quot;'+escapeDashboardText(String(k.id))+'&quot;)"'+(yazabilir?' oncontextmenu="event.preventDefault();evrakKategoriFormuAc(&quot;'+escapeDashboardText(String(k.id))+'&quot;);return false;" title="Sağ tıklayarak düzenleyin"':'')+'><span class="evrak-kategori-ikon">'+escapeDashboardText(k.ikon||'📁')+'</span><span><strong>'+escapeDashboardText(k.ad)+'</strong><small>'+escapeDashboardText(k.aciklama||'Belge kategorisi')+'</small></span><span class="evrak-kategori-count">'+adet+'</span></button>';
        }).join('');
        let liste=belgeler.filter(x=>{
            const k=kategoriHaritasi.get(String(x.kategoriId));
            const aranan=evrakMetin([x.evrakAdi,x.yil,x.aciklama,x.dosya?.ad,k?.ad,x.belgeTarihi,x.gecerlilikBitis].join(' '));
            if(arama)return aranan.includes(arama);
            return evrakAktifKategori==='tumu'||String(x.kategoriId)===evrakAktifKategori;
        });
        liste.sort((a,b)=>Number(b.yil||0)-Number(a.yil||0)||String(b.belgeTarihi||b.olusturmaZamani||'').localeCompare(String(a.belgeTarihi||a.olusturmaZamani||'')));
        const aktifKat=kategoriHaritasi.get(evrakAktifKategori);
        document.getElementById('evrakListeBaslik').textContent=aramaHam?'“'+aramaHam+'” arama sonuçları':(aktifKat?.ad||'Tüm Evraklar');
        document.getElementById('evrakListeOzeti').textContent=liste.length+' belge / sürüm';
        if(!liste.length){
            listeAlani.innerHTML='<div class="evrak-empty"><span>🔍</span><strong>'+(aramaHam?'Aramanızla eşleşen evrak bulunamadı.':'Bu kategoride henüz evrak yok.')+'</strong><div>'+(aramaHam?'Başka bir evrak adı, yıl veya kategori deneyin.':'Yeni sürüm eklemek için “Evrak Yükle” düğmesini kullanın.')+'</div></div>';return;
        }
        listeAlani.innerHTML='<table class="evrak-table"><thead><tr><th><input class="evrak-secim-kutu" type="checkbox" title="Görünenlerin tümünü seç" onchange="evrakWhatsappGorunenleriSec(this.checked)"></th><th>Evrak</th><th>Kategori</th><th>Yıl</th><th>Belge Tarihi</th><th>Geçerlilik</th><th style="text-align:right">İşlem</th></tr></thead><tbody>'+liste.map(x=>{
            const k=kategoriHaritasi.get(String(x.kategoriId))||{ad:x.kategoriAdi||'Diğer'};
            const surumSayisi=1+(Array.isArray(x.surumGecmisi)?x.surumGecmisi.length:0);
            return '<tr><td class="evrak-secim-hucre"><input class="evrak-secim-kutu" type="checkbox" value="'+escapeDashboardText(String(x.id))+'"'+(evrakWhatsappSepeti.has(String(x.id))?' checked':'')+' onchange="evrakWhatsappSepetDegistir(\''+escapeDashboardText(String(x.id))+'\',this.checked)"></td><td><div class="evrak-doc-name"><span class="evrak-file-icon">'+evrakDosyaIkonu(x.dosya)+'</span><span><strong>'+escapeDashboardText(x.evrakAdi||x.dosya?.ad||'Adsız Evrak')+'</strong><small>'+surumSayisi+' sürüm'+(x.aciklama?' · '+escapeDashboardText(x.aciklama):'')+'</small></span></div></td><td>'+escapeDashboardText(k.ad)+'</td><td><span class="evrak-year">'+escapeDashboardText(x.yil||'-')+'</span></td><td>'+evrakTarih(x.belgeTarihi)+'</td><td>'+evrakSonKullanmaEtiketi(x.gecerlilikBitis)+'</td><td><div class="evrak-row-actions"><button class="evrak-icon-btn view" type="button" title="Güncel belgeyi görüntüle" onclick="evrakGoruntule(\''+escapeDashboardText(String(x.id))+'\')">👁</button><button class="evrak-icon-btn" type="button" title="Tüm sürümleri göster" onclick="evrakSurumGecmisiAc(\''+escapeDashboardText(String(x.id))+'\')">🗂️</button><button class="evrak-icon-btn whatsapp" type="button" title="WhatsApp ile gönder" onclick="evrakWhatsappSeciminiAc(\''+escapeDashboardText(String(x.id))+'\')">💬</button>'+(yazabilir?'<button class="evrak-icon-btn edit" type="button" title="Evrakı düzenle / yeni sürüm yükle" onclick="evrakBelgeFormuAc(\''+escapeDashboardText(String(x.id))+'\')">✏</button><button class="evrak-icon-btn delete" type="button" title="Evrakı sil" onclick="evrakBelgeSil(\''+escapeDashboardText(String(x.id))+'\')">🗑</button>':'')+'</div></td></tr>';
        }).join('')+'</tbody></table>';
    }
function evrakKategoriFormuAc(id=''){
fdDocAssert(true);

        if(!anaMenuModulYazmaYetkisiVar('evrak'))return;
        const mevcut=id?evrakKategorileri().find(x=>String(x.id)===String(id)):null;
        evrakKategoriDuzenlemeId=mevcut?String(mevcut.id):'';
        document.getElementById('evrakKategoriDuzenlemeId').value=evrakKategoriDuzenlemeId;
        document.getElementById('evrakKategoriModalBaslik').textContent=mevcut?'Kategoriyi Düzenle':'Yeni Evrak Kategorisi';
        document.getElementById('evrakYeniKategoriAdi').value=mevcut?.ad||'';
        document.getElementById('evrakYeniKategoriAciklama').value=mevcut?.aciklama||'';
        document.getElementById('evrakKategoriKaydetBtn').textContent=mevcut?'Değişiklikleri Kaydet':'Kategoriyi Ekle';
        document.getElementById('modalEvrakKategori').style.display='flex';
        setTimeout(()=>document.getElementById('evrakYeniKategoriAdi').focus(),50);
    }
async function evrakKategoriKaydet(event){
try{
fdDocAssert(true);

        event.preventDefault();
        const ad=document.getElementById('evrakYeniKategoriAdi').value.trim(),aciklama=document.getElementById('evrakYeniKategoriAciklama').value.trim(),id=String(evrakKategoriDuzenlemeId||'');
        if(!ad)return;
        if(evrakKategorileri().some(x=>String(x.id)!==id&&evrakMetin(x.ad)===evrakMetin(ad)))return alert('Bu adla bir kategori zaten var.');
        const kayitli=id?evrakKayitlari.find(x=>x&&x.tip==='kategori'&&String(x.id)===id):null;
        const kayit=kayitli?{...kayitli,ad,aciklama,ikon:evrakKategoriIkonu(ad),duzenlemeZamani:new Date().toISOString(),duzenleyen:activeUser.username||activeUser.ad||''}:{id:id||evrakYeniId('kategori'),tip:'kategori',sirketId:activeUser.sirketId,ad,aciklama,ikon:evrakKategoriIkonu(ad),olusturmaZamani:new Date().toISOString(),olusturan:activeUser.username||activeUser.ad||''};
        const buton=event.submitter;buton.disabled=true;buton.textContent=id?'Kaydediliyor...':'Ekleniyor...';
        try{
            await fdDocAwait(evrakKaydiYaz(kayit));await fdDocAwait(evrakVerileriniYukle());evrakAktifKategori=String(kayit.id);evrakKategoriDuzenlemeId='';modalKapat('modalEvrakKategori');evrakEkraniniCiz();evrakBildirim(id?'Kategori güncellendi.':'Kategori eklendi.');
        }catch(hata){
if(!fdDocValid())return;

            console.error(hata);alert((id?'Kategori güncellenemedi. ':'Kategori eklenemedi. ')+String(hata?.message||'Lütfen tekrar deneyin.'));
        }finally{
if(fdDocValid()){

            buton.disabled=false;buton.textContent=id?'Değişiklikleri Kaydet':'Kategoriyi Ekle';
        
}
}
    
}catch(fdDocError){if(!fdDocValid())return;throw fdDocError;}
}
function evrakBelgeFormuAc(id=''){
fdDocAssert(true);

        if(!anaMenuModulYazmaYetkisiVar('evrak'))return;
        const kategoriler=evrakKategorileri(),sec=document.getElementById('evrakKategoriSec'),mevcut=id?evrakKayitlari.find(x=>x.tip==='evrak'&&String(x.id)===String(id)):null;
        evrakDuzenlemeId=mevcut?String(mevcut.id):'';
        document.getElementById('evrakDuzenlemeId').value=evrakDuzenlemeId;
        document.getElementById('evrakBelgeModalBaslik').textContent=mevcut?'✏ Evrakı Düzenle':'🗂️ Yeni Evrak / Sürüm Ekle';
        sec.innerHTML=kategoriler.map(x=>'<option value="'+escapeDashboardText(x.id)+'">'+escapeDashboardText(x.ad)+'</option>').join('');
        document.getElementById('evrakDosya').value='';
        const dosyaGrubu=document.getElementById('evrakDosya').closest('.form-group'),bilgi=document.querySelector('#evrakBelgeForm .evrak-form-note');
        if(mevcut){
            sec.value=String(mevcut.kategoriId||'diger');
            document.getElementById('evrakAdi').value=mevcut.evrakAdi||'';
            document.getElementById('evrakYil').value=mevcut.yil||new Date().getFullYear();
            document.getElementById('evrakBelgeTarihi').value=mevcut.belgeTarihi||'';
            document.getElementById('evrakGecerlilikBitis').value=mevcut.gecerlilikBitis||'';
            document.getElementById('evrakAciklama').value=mevcut.aciklama||'';
            dosyaGrubu.style.display='';
            document.getElementById('evrakDosya').required=false;
            document.getElementById('evrakDosyaLabel').textContent='Yeni Sürüm Dosyası (isteğe bağlı)';
            document.getElementById('evrakDosyaYardim').textContent='Yeni dosya seçerseniz mevcut dosya silinmez; önceki sürüm olarak saklanır. PDF, görsel, Word veya Excel · en fazla 20 MB';
            document.getElementById('evrakKaydetBtn').textContent='Değişiklikleri Kaydet';
            if(bilgi)bilgi.textContent='Yalnızca bilgileri değiştirebilir veya yeni dosya seçerek yeni sürüm oluşturabilirsiniz. Eski dosyalar sürüm geçmişinde korunur.';
        }else{
            sec.value=evrakAktifKategori!=='tumu'&&kategoriler.some(x=>String(x.id)===String(evrakAktifKategori))?String(evrakAktifKategori):'vergi-levhasi';
            document.getElementById('evrakAdi').value=kategoriler.find(x=>String(x.id)===String(sec.value))?.ad||'';
            document.getElementById('evrakYil').value=new Date().getFullYear();
            document.getElementById('evrakBelgeTarihi').value='';
            document.getElementById('evrakGecerlilikBitis').value='';
            document.getElementById('evrakAciklama').value='';
            dosyaGrubu.style.display='';
            document.getElementById('evrakDosya').required=true;
            document.getElementById('evrakDosyaLabel').textContent='Dosya *';
            document.getElementById('evrakDosyaYardim').textContent='PDF, görsel, Word veya Excel · en fazla 20 MB';
            document.getElementById('evrakKaydetBtn').textContent='Kaydet';
            if(bilgi)bilgi.textContent='Aynı evrakın yenisi çıktığında eski kaydı silmeyin; yeni yıl ve dosyayla tekrar ekleyin. Böylece tüm sürümler birlikte görünür.';
        }
        sec.onchange=function(){
fdDocAssert(false);
const k=evrakKategorileri().find(x=>String(x.id)===String(sec.value)),ad=document.getElementById('evrakAdi');if(!mevcut&&k)ad.value=k.ad;};
        document.getElementById('modalEvrakBelge').style.display='flex';
    }
function evrakDosyaMimeTuru(dosya){
fdDocAssert(false);

        const uzanti=String(dosya?.name||'').split('.').pop().toLocaleLowerCase('tr-TR');
        const turler={pdf:'application/pdf',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xls:'application/vnd.ms-excel',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
        return turler[uzanti]||'';
    }
async function evrakBelgeKaydet(event){
try{
fdDocAssert(true);

        event.preventDefault();if(evrakYukleniyor)return;
        const mevcut=evrakDuzenlemeId?evrakKayitlari.find(x=>x.tip==='evrak'&&String(x.id)===String(evrakDuzenlemeId)):null,dosya=document.getElementById('evrakDosya').files[0];
        if(!mevcut&&!dosya)return alert('Yüklenecek dosyayı seçin.');
        const azami=20*1024*1024;if(dosya&&dosya.size>azami)return alert('Dosya en fazla 20 MB olabilir.');
        const mimeType=dosya?evrakDosyaMimeTuru(dosya):'';if(dosya&&!mimeType)return alert('Bu dosya türü desteklenmiyor. PDF, JPG, PNG, WEBP, Word veya Excel dosyası seçin.');
        const kategori=evrakKategorileri().find(x=>String(x.id)===String(document.getElementById('evrakKategoriSec').value));if(!kategori)return alert('Kategori seçin.');
        const buton=document.getElementById('evrakKaydetBtn');evrakYukleniyor=true;buton.disabled=true;buton.textContent='Kaydediliyor...';let driveDosyasi=null,kayitAsamasi='evrak bilgileri hazırlanırken';
        try{
            let kayit;
            if(mevcut){
                const simdi=new Date().toISOString(),duzenleyen=activeUser.username||activeUser.ad||'',gecmis=Array.isArray(mevcut.surumGecmisi)?[...mevcut.surumGecmisi]:[];
                let yeniDosya=mevcut.dosya,surumNo=Math.max(1,Number(mevcut.surumNo||gecmis.length+1));
                if(dosya){
                    kayitAsamasi='yeni sürüm dosyası okunurken';const base64=await fdDocAwait(evrakDosyayiOku(dosya));
                    kayitAsamasi='yeni sürüm dosyası yüklenirken';const evrakAdi=document.getElementById('evrakAdi').value.trim(),dosyaUzantisi=String(dosya.name||'').includes('.')?'.'+String(dosya.name).split('.').pop():'';
                    driveDosyasi=await fdDocAwait(fdYazilimDriveEvrakYukle(base64,(evrakAdi||'EVRAK').replace(/[\\/:*?"<>|]/g,'-')+'_S'+(surumNo+1)+dosyaUzantisi,mimeType,yuzde=>{buton.classList.add('evrak-yukleniyor');buton.style.setProperty('--evrak-ilerleme',yuzde+'%');buton.textContent='Yükleniyor · %'+yuzde;}));
                    if(mevcut.dosya?.id||mevcut.dosya?.url)gecmis.push({surumNo,dosya:mevcut.dosya,evrakAdi:mevcut.evrakAdi||'',kategoriId:mevcut.kategoriId||'',kategoriAdi:mevcut.kategoriAdi||'',yil:mevcut.yil||'',belgeTarihi:mevcut.belgeTarihi||'',gecerlilikBitis:mevcut.gecerlilikBitis||'',aciklama:mevcut.aciklama||'',kaydeden:mevcut.duzenleyen||mevcut.olusturan||'',kayitZamani:mevcut.duzenlemeZamani||mevcut.olusturmaZamani||simdi});
                    yeniDosya={...driveDosyasi,mimeType:mimeType,boyut:dosya.size};surumNo+=1;
                }
                kayit={...mevcut,kategoriId:kategori.id,kategoriAdi:kategori.ad,evrakAdi:document.getElementById('evrakAdi').value.trim(),yil:Number(document.getElementById('evrakYil').value),belgeTarihi:document.getElementById('evrakBelgeTarihi').value,gecerlilikBitis:document.getElementById('evrakGecerlilikBitis').value,aciklama:document.getElementById('evrakAciklama').value.trim(),dosya:yeniDosya,surumNo,surumGecmisi:gecmis,duzenlemeZamani:simdi,duzenleyen};
                await fdDocAwait(evrakKaydiYaz(kayit));await fdDocAwait(evrakVerileriniYukle());
                evrakBildirim(dosya?'Evrakın yeni sürümü kaydedildi. Eski dosya korundu.':'Evrak bilgileri güncellendi.');
            }else{
                kayitAsamasi='dosya okunurken';
                const base64=await fdDocAwait(evrakDosyayiOku(dosya));
                kayitAsamasi='dosya yüklenirken';
                const evrakAdi=document.getElementById('evrakAdi').value.trim();
                const dosyaUzantisi=String(dosya.name||'').includes('.')?'.'+String(dosya.name).split('.').pop():'';
                const driveDosyaAdi=(evrakAdi||'EVRAK').replace(/[\\/:*?"<>|]/g,'-')+dosyaUzantisi;
                driveDosyasi=await fdDocAwait(fdYazilimDriveEvrakYukle(base64,driveDosyaAdi,mimeType,yuzde=>{buton.classList.add('evrak-yukleniyor');buton.style.setProperty('--evrak-ilerleme',yuzde+'%');buton.textContent='Yükleniyor · %'+yuzde;}));
                kayit={id:evrakYeniId('evrak'),tip:'evrak',sirketId:activeUser.sirketId,kategoriId:kategori.id,kategoriAdi:kategori.ad,evrakAdi:document.getElementById('evrakAdi').value.trim(),yil:Number(document.getElementById('evrakYil').value),belgeTarihi:document.getElementById('evrakBelgeTarihi').value,gecerlilikBitis:document.getElementById('evrakGecerlilikBitis').value,aciklama:document.getElementById('evrakAciklama').value.trim(),dosya:{...driveDosyasi,mimeType:mimeType,boyut:dosya.size},surumNo:1,surumGecmisi:[],olusturmaZamani:new Date().toISOString(),olusturan:activeUser.username||activeUser.ad||''};
                kayitAsamasi='evrak kaydı oluşturulurken';
                await fdDocAwait(evrakKaydiYaz(kayit));await fdDocAwait(evrakVerileriniYukle());evrakBildirim(kayit.evrakAdi+' kaydedildi.');
            }
            evrakDuzenlemeId='';evrakAktifKategori=kategori.id;modalKapat('modalEvrakBelge');document.getElementById('evrakArama').value='';evrakEkraniniCiz();
        }catch(hata){
if(!fdDocValid())return;

            if(driveDosyasi?.id){try{await fdDocAwait(fdYazilimDriveDosyaSil(driveDosyasi.id,'EVRAK TAKİP'));}catch(temizlemeHatasi){
if(!fdDocValid())return;
console.warn('Yarım kalan evrak dosyası temizlenemedi:',temizlemeHatasi);}}
            console.error(hata);const ayrinti=String(hata?.message||'Bilinmeyen hata.').replace(/^Error:\s*/i,'');alert(mevcut?'Evrak güncellenemedi: '+ayrinti:'Evrak kaydedilemedi ('+kayitAsamasi+'): '+ayrinti);
        }finally{
if(fdDocValid()){
evrakYukleniyor=false;buton.disabled=false;buton.classList.remove('evrak-yukleniyor');buton.style.removeProperty('--evrak-ilerleme');buton.textContent=mevcut?'Değişiklikleri Kaydet':'Kaydet';
}
}
    
}catch(fdDocError){if(!fdDocValid())return;throw fdDocError;}
}
function evrakGoruntule(id){
fdDocAssert(false);

        const kayit=evrakKayitlari.find(x=>x.tip==='evrak'&&String(x.id)===String(id));if(!kayit?.dosya?.id)return alert('Belge dosyası bulunamadı.');
        evrakOnizlemeId=String(kayit.id);document.getElementById('evrakOnizlemeBaslik').textContent=kayit.evrakAdi||kayit.dosya.ad||'Belge Görüntüleme';
        document.getElementById('evrakOnizlemeFrame').src='https:\x2f\x2fdrive.google.com/file/d/'+encodeURIComponent(kayit.dosya.id)+'/preview';
        document.getElementById('modalEvrakOnizleme').style.display='flex';
    }
function evrakDosyaBaglantisi(dosya){
fdDocAssert(false);
return dosya?.url||dosya?.webViewLink||(dosya?.id?'https:\x2f\x2fdrive.google.com/open?id='+encodeURIComponent(dosya.id):'')}
function evrakSurumGecmisiAc(id){
fdDocAssert(false);

        const kayit=evrakKayitlari.find(x=>x.tip==='evrak'&&String(x.id)===String(id));if(!kayit)return;
        const gecmis=Array.isArray(kayit.surumGecmisi)?kayit.surumGecmisi:[],guncelNo=Math.max(1,Number(kayit.surumNo||gecmis.length+1));
        const surumler=[{surumNo:guncelNo,dosya:kayit.dosya,evrakAdi:kayit.evrakAdi,yil:kayit.yil,belgeTarihi:kayit.belgeTarihi,gecerlilikBitis:kayit.gecerlilikBitis,kaydeden:kayit.duzenleyen||kayit.olusturan,kayitZamani:kayit.duzenlemeZamani||kayit.olusturmaZamani,guncel:true},...gecmis].sort((a,b)=>Number(b.surumNo||0)-Number(a.surumNo||0));
        document.getElementById('evrakSurumBaslik').textContent='🗂️ '+(kayit.evrakAdi||'Evrak')+' · Sürüm Geçmişi';
        document.getElementById('evrakSurumAltBaslik').textContent=surumler.length+' sürüm · Eski dosyalar değiştirilmeden korunur';
        document.getElementById('evrakSurumListesi').innerHTML='<div class="table-wrapper"><table><thead><tr><th>Sürüm</th><th>Dosya</th><th>Belge Bilgisi</th><th>Kaydeden</th><th>Kayıt Zamanı</th><th>İşlem</th></tr></thead><tbody>'+surumler.map(s=>{const url=evrakDosyaBaglantisi(s.dosya);return '<tr><td><strong>Sürüm '+escapeDashboardText(s.surumNo||'-')+'</strong>'+(s.guncel?'<br><span class="badge" style="background:#dcfce7;color:#166534">Güncel</span>':'')+'</td><td>'+escapeDashboardText(s.dosya?.ad||s.evrakAdi||'-')+'</td><td>'+escapeDashboardText(String(s.yil||'-'))+' · '+evrakTarih(s.belgeTarihi)+(s.gecerlilikBitis?' · Bitiş: '+evrakTarih(s.gecerlilikBitis):'')+'</td><td>'+escapeDashboardText(s.kaydeden||'Sistem / eski kayıt')+'</td><td>'+escapeDashboardText(s.kayitZamani?new Date(s.kayitZamani).toLocaleString('tr-TR'):'-')+'</td><td>'+(url?'<a class="btn-modern btn-detail-modern" href="'+escapeDashboardText(url)+'" target="_blank" rel="noopener">Aç</a>':'-')+'</td></tr>'}).join('')+'</tbody></table></div>';
        document.getElementById('modalEvrakSurumleri').style.display='flex';
    }
function evrakOnizlemeyiKapat(){
fdDocAssert(false);

        document.getElementById('evrakOnizlemeFrame').src='about:blank';evrakOnizlemeId='';modalKapat('modalEvrakOnizleme');
    }
function evrakOnizlemeyiDrivedaAc(){
fdDocAssert(false);

        const kayit=evrakKayitlari.find(x=>String(x.id)===String(evrakOnizlemeId));if(!kayit?.dosya)return;
        const url=kayit.dosya.url||('https:\x2f\x2fdrive.google.com/open?id='+encodeURIComponent(kayit.dosya.id||''));window.open(url,'_blank','noopener');
    }
async function evrakOnizlemeIndir(){
try{
fdDocAssert(false);

        const kayit=evrakKayitlari.find(x=>String(x.id)===String(evrakOnizlemeId)),buton=document.getElementById('evrakOnizlemeIndirBtn');if(!kayit?.dosya?.id)return;
        buton.disabled=true;buton.textContent='İndiriliyor...';
        try{
            const dosya=await fdDocAwait(fdYazilimDriveDosyaIndir(kayit.dosya.id,'EVRAK TAKİP')),ikili=atob(dosya.base64),baytlar=new Uint8Array(ikili.length);for(let i=0;i<ikili.length;i++)baytlar[i]=ikili.charCodeAt(i);
            const adres=URL.createObjectURL(new Blob([baytlar],{type:dosya.mimeType||kayit.dosya.mimeType||'application/octet-stream'})),baglanti=document.createElement('a');baglanti.href=adres;baglanti.download=dosya.ad||kayit.dosya.ad||'evrak';fdDocAppend(baglanti);baglanti.click();baglanti.remove();setTimeout(()=>URL.revokeObjectURL(adres),1000);
        }catch(hata){
if(!fdDocValid())return;
console.error(hata);alert('Belge indirilemedi. Lütfen tekrar deneyin.');}finally{
if(fdDocValid()){
buton.disabled=false;buton.textContent='⬇ İndir';
}
}
    
}catch(fdDocError){if(!fdDocValid())return;throw fdDocError;}
}
async function evrakBelgeSil(id){
try{
fdDocAssert(true);

        if(!anaMenuModulYazmaYetkisiVar('evrak'))return;const kayit=evrakKayitlari.find(x=>String(x.id)===String(id));if(!kayit)return;
        if(!confirm('“'+(kayit.evrakAdi||'Bu evrak')+'” silinsin mi?'))return;
        try{
            const sonuc=await fdDocAwait(supabaseClient.from('portal_records').delete().eq('company_id',activeUser.sirketId).eq('module','evraktakip').eq('legacy_id',String(id)));if(sonuc.error)throw sonuc.error;
            evrakKayitlari=evrakKayitlari.filter(x=>String(x.id)!==String(id));evrakEkraniniCiz();
            const dosyaIds=[kayit.dosya,...(Array.isArray(kayit.surumGecmisi)?kayit.surumGecmisi.map(s=>s?.dosya):[])].map(d=>d?.id).filter(Boolean).filter((id,index,liste)=>liste.indexOf(id)===index);let dosyaHatasi=false;
            for(const dosyaId of dosyaIds){try{await fdDocAwait(fdYazilimDriveDosyaSil(dosyaId,'EVRAK TAKİP'));}catch(hata){
if(!fdDocValid())return;
dosyaHatasi=true;console.warn(hata)}}
            if(dosyaHatasi){evrakBildirim('Evrak silindi ancak sürüm dosyalarından biri kaldırılamadı.','warning');return;}
            evrakBildirim('Evrak silindi.');
        }catch(hata){
if(!fdDocValid())return;
console.error(hata);alert('Evrak silinemedi. Lütfen tekrar deneyin.');}
    
}catch(fdDocError){if(!fdDocValid())return;throw fdDocError;}
}
const api={get evrakYeniId(){return evrakYeniId},get evrakTarih(){return evrakTarih},get evrakBoyut(){return evrakBoyut},get evrakBildirim(){return evrakBildirim},get evrakBelgeleri(){return evrakBelgeleri},get evrakWhatsappKisileri(){return evrakWhatsappKisileri},get evrakWhatsappNumarasi(){return evrakWhatsappNumarasi},get evrakWhatsappKisiFormunuTemizle(){return evrakWhatsappKisiFormunuTemizle},get evrakWhatsappKisiListesiniCiz(){return evrakWhatsappKisiListesiniCiz},get evrakWhatsappKisileriniAc(){return evrakWhatsappKisileriniAc},get evrakWhatsappKisiDuzenle(){return evrakWhatsappKisiDuzenle},get evrakWhatsappKisiKaydet(){return evrakWhatsappKisiKaydet},get evrakWhatsappKisiSil(){return evrakWhatsappKisiSil},get evrakWhatsappSepetiniGuncelle(){return evrakWhatsappSepetiniGuncelle},get evrakWhatsappSepetDegistir(){return evrakWhatsappSepetDegistir},get evrakWhatsappGorunenleriSec(){return evrakWhatsappGorunenleriSec},get evrakWhatsappSepetiniTemizle(){return evrakWhatsappSepetiniTemizle},get evrakWhatsappSepetBelgeleri(){return evrakWhatsappSepetBelgeleri},get evrakWhatsappKisiSeciminiGoster(){return evrakWhatsappKisiSeciminiGoster},get evrakWhatsappTopluSeciminiAc(){return evrakWhatsappTopluSeciminiAc},get evrakWhatsappSepetiTopluIndir(){return evrakWhatsappSepetiTopluIndir},get evrakWhatsappSeciminiAc(){return evrakWhatsappSeciminiAc},get evrakWhatsappGonder(){return evrakWhatsappGonder},get evrakKaydiYaz(){return evrakKaydiYaz},get evrakKategoriSec(){return evrakKategoriSec},get evrakAramayiTemizle(){return evrakAramayiTemizle},get evrakSonKullanmaEtiketi(){return evrakSonKullanmaEtiketi},get evrakDosyaIkonu(){return evrakDosyaIkonu},get evrakEkraniniCiz(){return evrakEkraniniCiz},get evrakKategoriFormuAc(){return evrakKategoriFormuAc},get evrakKategoriKaydet(){return evrakKategoriKaydet},get evrakBelgeFormuAc(){return evrakBelgeFormuAc},get evrakDosyaMimeTuru(){return evrakDosyaMimeTuru},get evrakBelgeKaydet(){return evrakBelgeKaydet},get evrakGoruntule(){return evrakGoruntule},get evrakDosyaBaglantisi(){return evrakDosyaBaglantisi},get evrakSurumGecmisiAc(){return evrakSurumGecmisiAc},get evrakOnizlemeyiKapat(){return evrakOnizlemeyiKapat},get evrakOnizlemeyiDrivedaAc(){return evrakOnizlemeyiDrivedaAc},get evrakOnizlemeIndir(){return evrakOnizlemeIndir},get evrakBelgeSil(){return evrakBelgeSil},get fdEvrakOnizlemeKimligi(){return fdEvrakOnizlemeKimligi}};
return{init(){document.querySelector("[data-document-frame-host]").outerHTML="<iframe id=\"evrakOnizlemeFrame\" title=\"Evrak önizleme\"></iframe>";window.fdSupplementalOutputInstall?.();window.fdUnifiedOutput?.scan()},open(...args){fdDocAssert();if(args[0]?.fdDocAction)return api[args[0].fdDocAction](...args[0].args);return openEvrakTakipApp(...args)},api,dispose(){fdDocDisposed=true;const tab=typeof fdAcikUygulamaSekmeleri!=="undefined"?fdAcikUygulamaSekmeleri.find(t=>t.anahtar==="evrak"):null;if(tab)tab.alanId="";for(const[t,...a]of fdDocListeners)t.removeEventListener(...a);for(const id of fdDocTimers)window.clearTimeout(id);for(const r of fdDocReaders)if(r.readyState===1)r.abort();for(const u of fdDocUrls)window.URL.revokeObjectURL(u);for(const n of fdDocNodes)n.remove();const frame=document.getElementById("evrakOnizlemeFrame");if(frame)frame.src="about:blank";document.querySelectorAll("[data-fd-module-root=evrak] form").forEach(f=>f.reset());document.querySelectorAll("[data-fd-module-root=evrak] input[type=file]").forEach(f=>f.value="");evrakWhatsappSepeti.clear();evrakWhatsappGonderilecekIds=[];evrakOnizlemeId="";}};
});
