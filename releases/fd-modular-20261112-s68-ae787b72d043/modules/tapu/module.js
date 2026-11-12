window.FDModules.define('tapu',function(){

let fdTitleDisposed=false,tapuSayfa=1,tapuSayfaBoyutu=50,tapuAciliyor=false,tapuOnizlemeId='',tapuDetayId='';
const fdTitleInitial=fdTitleContext(),fdTitleListeners=[],fdTitleTimers=new Set(),fdTitleUrls=new Set(),fdTitleNodes=new Set();
function fdTitleContext(){return JSON.stringify([fdTitleDataContext(),anaMenuModulYetkisi('tapu')])}
function fdTitleValid(){return !fdTitleDisposed&&fdTitleInitial===fdTitleContext()&&anaMenuModulErisimiVar('tapu')}
function fdTitleAssert(write=false){if(!fdTitleValid())throw Error('Oturum değişti; Tapu Takip ekranını yeniden açın.');if(write&&!anaMenuModulYazmaYetkisiVar('tapu'))throw Error('Bu modülde değişiklik yapma yetkiniz yok.')}
async function fdTitleAwait(promise){fdTitleAssert();const result=await promise;fdTitleAssert();return result}
function fdTitleListen(target,...args){target.addEventListener(...args);fdTitleListeners.push([target,...args])}
function fdTitleAppend(node){fdTitleNodes.add(node);return document.body.appendChild(node)}
function setTimeout(fn,delay,...args){const id=window.setTimeout(()=>{fdTitleTimers.delete(id);if(fdTitleValid())fn(...args)},delay);fdTitleTimers.add(id);return id}
const URL={createObjectURL(blob){const url=window.URL.createObjectURL(blob);fdTitleUrls.add(url);return url},revokeObjectURL(url){fdTitleUrls.delete(url);window.URL.revokeObjectURL(url)}};
function fdTapuDetayKimligi(){return tapuDetayId}

let fdTapuFiltreTemizle,fdTapuRaporTablosu,fdTapuDisariAl;
function tapuMalikStili(ad){
fdTitleAssert(false);
const renkler=[['#dbeafe','#1d4ed8'],['#dcfce7','#15803d'],['#ffedd5','#c2410c'],['#fce7f3','#be185d'],['#ede9fe','#7c3aed'],['#fef3c7','#a16207'],['#cffafe','#0e7490'],['#fee2e2','#b91c1c'],['#e0e7ff','#4338ca'],['#ccfbf1','#0f766e'],['#fae8ff','#a21caf'],['#ecfccb','#4d7c0f']];const malik=String(ad||'').trim(),malikler=[...new Set(tapuKayitlari.map(x=>String(x.sahibi||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr-TR',{sensitivity:'base'})),sira=Math.max(0,malikler.indexOf(malik)),r=renkler[sira%renkler.length];return 'background:'+r[0]+';color:'+r[1];}
async function openTapuTakipApp(){
try{
fdTitleAssert(false);

 if(typeof anaMenuModulErisimiVar==='function'&&!anaMenuModulErisimiVar('tapu'))return;if(tapuAciliyor)return;tapuAciliyor=true;fdTumUygulamaAlanlariniGizle();document.getElementById('tapuTakipApp').style.display='block';tapuYetkiGorunumunuAyarla();document.getElementById('tapuTabloGovde').innerHTML='<tr><td colspan="12" class="tapu-empty">Kayıtlar yükleniyor...</td></tr>';
 try{await fdTitleAwait(tapuVerileriniYukle());if(!tapuAktarimTamam&&tapuYazabilir())await fdTitleAwait(tapuExcelKayitlariniAktar(false));else tapuEkraniniCiz();}catch(error){
if(!fdTitleValid())return;
console.error('Tapu kayıtları:',error);document.getElementById('tapuTabloGovde').innerHTML='<tr><td colspan="12" class="tapu-empty">Kayıtlar yüklenemedi.</td></tr>';alert('Tapu kayıtları yüklenemedi: '+tapuHataMetni(error));}finally{
if(fdTitleValid()){
tapuAciliyor=false;
}
}

}catch(fdTitleError){if(!fdTitleValid())return;throw fdTitleError;}
}
function tapuYetkiGorunumunuAyarla(){
fdTitleAssert(false);
const yaz=tapuYazabilir();document.getElementById('tapuYeniBtn').style.display=yaz?'inline-flex':'none';document.getElementById('tapuExcelAktarBtn').style.display=yaz&&!tapuAktarimTamam?'inline-flex':'none';}
function tapuFiltreSecenekleri(){
fdTitleAssert(false);
const doldur=(id,liste,ilk)=>{const s=document.getElementById(id),deger=s.value;s.innerHTML='<option value="">'+ilk+'</option>'+[...new Set(liste.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'tr')).map(v=>'<option value="'+tapuHtml(v)+'">'+tapuHtml(v)+'</option>').join('');s.value=deger;};doldur('tapuMalikFiltre',tapuKayitlari.map(x=>x.sahibi),'Tüm malikler');doldur('tapuNitelikFiltre',tapuKayitlari.map(x=>x.nitelik),'Tüm nitelikler');doldur('tapuIlFiltre',tapuKayitlari.map(x=>x.il),'Tüm iller');}
function tapuFiltreliListe(){
fdTitleAssert(false);
const q=tapuMetin(document.getElementById('tapuArama').value),malik=document.getElementById('tapuMalikFiltre').value,nitelik=document.getElementById('tapuNitelikFiltre').value,il=document.getElementById('tapuIlFiltre').value,ada=tapuMetin(document.getElementById('tapuAdaFiltre').value),parsel=tapuMetin(document.getElementById('tapuParselFiltre').value);return tapuKayitlari.filter(k=>(!malik||k.sahibi===malik)&&(!nitelik||k.nitelik===nitelik)&&(!il||k.il===il)&&(!ada||tapuMetin(k.ada).includes(ada))&&(!parsel||tapuMetin(k.parsel).includes(parsel))&&(!q||tapuMetin([k.tasinmazNo,k.nitelik,k.il,k.ilce,k.mahalle,k.ada,k.parsel,k.bagimsizBolum,k.sahibi].join(' ')).includes(q))).sort((a,b)=>String(a.siraNo||'').localeCompare(String(b.siraNo||''),undefined,{numeric:true})||String(a.tasinmazNo).localeCompare(String(b.tasinmazNo),undefined,{numeric:true}));}
function tapuFiltreDegisti(){
fdTitleAssert(false);
tapuSayfa=1;tapuListeyiCiz();}
function tapuEkraniniCiz(){
fdTitleAssert(false);
tapuFiltreSecenekleri();const toplam=tapuKayitlari.reduce((s,k)=>s+tapuSayisal(k.sahipOlunanAlan),0),turSay=(...aranan)=>tapuKayitlari.filter(k=>aranan.some(a=>tapuMetin(k.nitelik).includes(tapuMetin(a)))).length;document.getElementById('tapuStatKayit').textContent=tapuKayitlari.length;document.getElementById('tapuStatAlan').textContent=tapuAlan(toplam)+' m²';document.getElementById('tapuStatTarla').textContent=turSay('TARLA');document.getElementById('tapuStatMesken').textContent=turSay('MESKEN');document.getElementById('tapuStatArsa').textContent=turSay('ARSA');document.getElementById('tapuStatIsyeri').textContent=turSay('İŞYERİ','DÜKKAN','DEPO');tapuYetkiGorunumunuAyarla();tapuListeyiCiz();}
function tapuListeyiCiz(){
fdTitleAssert(false);
const liste=tapuFiltreliListe(),sayfaSayisi=Math.max(1,Math.ceil(liste.length/tapuSayfaBoyutu));tapuSayfa=Math.min(Math.max(1,tapuSayfa),sayfaSayisi);const bas=(tapuSayfa-1)*tapuSayfaBoyutu,parca=liste.slice(bas,bas+tapuSayfaBoyutu),yaz=tapuYazabilir();document.getElementById('tapuTabloGovde').innerHTML=parca.length?parca.map((k,i)=>{const url=tapuParselUrlDogrula(k.parselSorguUrl),no=tapuHtml(k.tasinmazNo||'-'),noAlan=url?'<a class="tapu-link" href="'+tapuHtml(url)+'" target="_blank" rel="noopener" title="Parsel Sorgu ekranını aç">'+no+'</a>':'<span>'+no+'</span>';return '<tr><td>'+(bas+i+1)+'</td><td>'+noAlan+'</td><td><button type="button" class="tapu-nitelik-link" title="Tüm tapu bilgilerini görüntüle" onclick="tapuDetayAc(\''+tapuHtml(k.id)+'\')">'+tapuHtml(k.nitelik||'-')+'</button></td><td class="tapu-location">'+tapuHtml([k.mahalle,k.ilce,k.il].filter(Boolean).join(' / ')||'-')+'</td><td class="tapu-area"><strong>'+tapuAlan(k.sahipOlunanAlan)+' m²</strong><span class="tapu-muted"> · Toplam '+tapuAlan(k.toplamAlan)+' m²</span></td><td>'+tapuHtml(k.hisseDurumu||'-')+'</td><td class="tapu-parsel-kolon">'+tapuHtml(k.ada||'-')+'</td><td class="tapu-parsel-kolon">'+tapuHtml(k.parsel||'-')+'</td><td class="tapu-bb-kolon">'+tapuHtml(k.bagimsizBolum||'-')+'</td><td>'+tapuTarih(k.alisTarihi)+'</td><td><span class="tapu-owner" style="'+tapuMalikStili(k.sahibi)+'">'+tapuHtml(k.sahibi||'-')+'</span></td><td><div class="tapu-row-actions">'+(k.tapuDosya?.id?'<button class="tapu-icon tapu-icon-view" title="Tapu görüntüsünü aç" onclick="tapuGoruntule(\''+tapuHtml(k.id)+'\')">👁</button>':'')+(yaz?'<button class="tapu-icon tapu-icon-edit" title="Düzenle" onclick="tapuFormuAc(\''+tapuHtml(k.id)+'\')">✎</button><button class="tapu-icon tapu-icon-delete" title="Sil" onclick="tapuSil(\''+tapuHtml(k.id)+'\')">🗑</button>':'')+'</div></td></tr>';}).join(''):'<tr><td colspan="12" class="tapu-empty">Aramanıza uygun tapu kaydı bulunamadı.</td></tr>';document.getElementById('tapuListeBilgi').textContent=(liste.length?(bas+1)+'-'+(bas+parca.length)+' / ':'0 / ')+liste.length+' kayıt';document.getElementById('tapuSayfaBilgi').textContent=tapuSayfa+' / '+sayfaSayisi;document.getElementById('tapuOnceki').disabled=tapuSayfa<=1;document.getElementById('tapuSonraki').disabled=tapuSayfa>=sayfaSayisi;}
function tapuSayfaDegistir(y){
fdTitleAssert(false);
tapuSayfa+=y;tapuListeyiCiz();document.querySelector('#tapuTakipApp .tapu-table-wrap')?.scrollTo({top:0,behavior:'smooth'});}
function tapuSayfaBoyutuDegistir(deger){
fdTitleAssert(false);
const boyut=Number(deger);tapuSayfaBoyutu=[25,50,75,100].includes(boyut)?boyut:50;tapuSayfa=1;tapuListeyiCiz();document.querySelector('#tapuTakipApp .tapu-table-wrap')?.scrollTo({top:0,behavior:'smooth'});}
function tapuDetayAc(id){
fdTitleAssert(false);
const k=tapuKayitlari.find(x=>String(x.id)===String(id));if(!k)return;tapuDetayId=String(k.id);const bilgi=(etiket,deger,genis=false)=>'<div class="tapu-detail-item'+(genis?' tapu-detail-wide':'')+'"><small>'+tapuHtml(etiket)+'</small><strong>'+tapuHtml(deger??'-')+'</strong></div>';document.getElementById('tapuDetayBaslik').textContent=(k.tasinmazNo||'Tapu')+' · '+(k.nitelik||'Tapu Detayı');document.getElementById('tapuDetayIcerik').innerHTML='<div class="tapu-detail-grid">'+bilgi('Taşınmaz No',k.tasinmazNo||'-')+bilgi('Nitelik',k.nitelik||'-')+bilgi('Sahibi',k.sahibi||'-')+bilgi('İl',k.il||'-')+bilgi('İlçe',k.ilce||'-')+bilgi('Mahalle',k.mahalle||'-')+bilgi('Sahip Olunan Alan',tapuAlan(k.sahipOlunanAlan)+' m²')+bilgi('Toplam Alan',tapuAlan(k.toplamAlan)+' m²')+bilgi('Hisse Durumu',k.hisseDurumu||'-')+bilgi('Ada',k.ada||'-')+bilgi('Parsel',k.parsel||'-')+bilgi('Bağımsız Bölüm',k.bagimsizBolum||'-')+bilgi('Alış Tarihi',tapuTarih(k.alisTarihi))+bilgi('Tapu Görüntüsü',k.tapuDosya?.id?'Yüklü':'Yüklenmemiş')+bilgi('Parsel Sorgu',tapuParselUrlDogrula(k.parselSorguUrl)?'Bağlantı mevcut':'Bağlantı yok')+bilgi('Açıklama',k.aciklama||'-',true)+'</div>';const url=tapuParselUrlDogrula(k.parselSorguUrl),yaz=tapuYazabilir();document.getElementById('tapuDetayAksiyonlar').innerHTML=(url?'<a class="tapu-btn tapu-cancel" href="'+tapuHtml(url)+'" target="_blank" rel="noopener" style="text-decoration:none">Parsel Sorguyu Aç</a>':'')+(k.tapuDosya?.id?'<button type="button" class="tapu-btn" style="background:#0284c7;color:#fff" onclick="tapuDetayGoruntusunuAc()">Tapu Görüntüsünü Aç</button>':'')+(yaz?'<button type="button" class="tapu-btn tapu-save" onclick="tapuDetayDuzenle()">Düzenle</button>':'');document.getElementById('modalTapuDetay').style.display='flex';}
function tapuDetayKapat(){
fdTitleAssert(false);
tapuDetayId='';document.getElementById('modalTapuDetay').style.display='none';}
function tapuDetayGoruntusunuAc(){
fdTitleAssert(false);
const id=tapuDetayId;tapuDetayKapat();if(id)tapuGoruntule(id);}
function tapuDetayDuzenle(){
fdTitleAssert(false);
const id=tapuDetayId;tapuDetayKapat();if(id)tapuFormuAc(id);}
function tapuFormuAc(id=''){
fdTitleAssert(true);
if(!tapuYazabilir())return;const k=tapuKayitlari.find(x=>String(x.id)===String(id))||{};document.getElementById('tapuForm').reset();document.getElementById('tapuId').value=k.id||'';document.getElementById('tapuTasinmazNo').value=k.tasinmazNo||'';document.getElementById('tapuNitelik').value=k.nitelik||'';document.getElementById('tapuSahibi').value=k.sahibi||'';document.getElementById('tapuIl').value=k.il||'';document.getElementById('tapuIlce').value=k.ilce||'';document.getElementById('tapuMahalle').value=k.mahalle||'';document.getElementById('tapuToplamAlan').value=k.toplamAlan??'';document.getElementById('tapuSahipAlan').value=k.sahipOlunanAlan??'';document.getElementById('tapuHisse').value=k.hisseDurumu||'';document.getElementById('tapuAda').value=k.ada||'';document.getElementById('tapuParsel').value=k.parsel||'';document.getElementById('tapuBagimsiz').value=k.bagimsizBolum||'';document.getElementById('tapuAlisTarihi').value=String(k.alisTarihi||'').slice(0,10);document.getElementById('tapuParselUrl').value=tapuParselUrlDogrula(k.parselSorguUrl);document.getElementById('tapuAciklama').value=k.aciklama||'';document.getElementById('tapuDosyaDurum').textContent=k.tapuDosya?.id?'Mevcut: '+(k.tapuDosya.ad||'Tapu görüntüsü')+' · Yeni dosya seçerseniz değiştirilir.':'PDF veya görsel · en fazla 10 MB';document.getElementById('tapuModalBaslik').textContent=id?'Tapu Kaydını Düzenle':'Yeni Tapu Kaydı';document.getElementById('modalTapuKayit').style.display='flex';setTimeout(()=>document.getElementById('tapuTasinmazNo').focus(),40);}
function tapuFormuKapat(){
fdTitleAssert(false);
document.getElementById('modalTapuKayit').style.display='none';}
async function tapuKaydet(e){
try{
fdTitleAssert(true);

 e.preventDefault();const btn=document.getElementById('tapuKaydetBtn'),id=document.getElementById('tapuId').value||tapuYeniId(),eski=tapuKayitlari.find(x=>String(x.id)===String(id))||{},urlHam=document.getElementById('tapuParselUrl').value.trim(),url=tapuParselUrlDogrula(urlHam),dosya=document.getElementById('tapuDosya').files[0];if(urlHam&&!url)return alert('Parsel bağlantısı parselsorgu.tkgm.gov.tr adresi olmalıdır.');if(dosya&&dosya.size>10*1024*1024)return alert('Tapu görüntüsü en fazla 10 MB olabilir.');const mimeType=dosya?tapuDosyaMime(dosya):'';if(dosya&&!mimeType)return alert('Tapu görüntüsü PDF, JPG, PNG veya WEBP olmalıdır.');let yeniDosya=null,kayitYazildi=false;
 const kayit={...eski,id,kayitTipi:'tapu',tasinmazNo:document.getElementById('tapuTasinmazNo').value.trim(),nitelik:document.getElementById('tapuNitelik').value.trim().toLocaleUpperCase('tr-TR'),il:document.getElementById('tapuIl').value.trim().toLocaleUpperCase('tr-TR'),ilce:document.getElementById('tapuIlce').value.trim().toLocaleUpperCase('tr-TR'),mahalle:document.getElementById('tapuMahalle').value.trim().toLocaleUpperCase('tr-TR'),toplamAlan:tapuSayisal(document.getElementById('tapuToplamAlan').value),sahipOlunanAlan:tapuSayisal(document.getElementById('tapuSahipAlan').value),hisseDurumu:document.getElementById('tapuHisse').value.trim().toLocaleUpperCase('tr-TR'),ada:document.getElementById('tapuAda').value.trim(),parsel:document.getElementById('tapuParsel').value.trim(),bagimsizBolum:document.getElementById('tapuBagimsiz').value.trim(),alisTarihi:document.getElementById('tapuAlisTarihi').value,sahibi:document.getElementById('tapuSahibi').value.trim().toLocaleUpperCase('tr-TR'),parselSorguUrl:url,aciklama:document.getElementById('tapuAciklama').value.trim(),guncellemeTarihi:new Date().toISOString()};btn.disabled=true;btn.textContent='Kaydediliyor...';
 try{if(dosya){const base64=await fdTitleAwait(evrakDosyayiOku(dosya));yeniDosya=await fdTitleAwait(fdYazilimDriveEvrakYukle(base64,dosya.name,mimeType,yuzde=>{btn.textContent='Yükleniyor · %'+yuzde;},'EVRAK TAKİP'));kayit.tapuDosya={...yeniDosya,mimeType,boyut:dosya.size};}const satir={company_id:activeUser.sirketId,module:'taputakip',legacy_id:String(kayit.id),record_year:Number(String(kayit.alisTarihi||'').slice(0,4))||new Date().getFullYear(),employee_legacy_id:null,data:kayit},{error}=await fdTitleAwait(supabaseClient.from('portal_records').upsert(satir,{onConflict:'company_id,module,legacy_id'}));if(error)throw error;kayitYazildi=true;const i=tapuKayitlari.findIndex(x=>String(x.id)===String(kayit.id));if(i>=0)tapuKayitlari[i]=kayit;else tapuKayitlari.push(kayit);if(yeniDosya?.id&&eski.tapuDosya?.id&&eski.tapuDosya.id!==yeniDosya.id){try{await fdTitleAwait(fdYazilimDriveDosyaSil(eski.tapuDosya.id,'EVRAK TAKİP'));}catch(h){
if(!fdTitleValid())return;
console.warn('Eski tapu görüntüsü silinemedi:',h);}}tapuFormuKapat();tapuEkraniniCiz();showToast?.('Tapu kaydı kaydedildi.');}
 catch(error){
if(!fdTitleValid())return;
if(!kayitYazildi&&yeniDosya?.id){try{await fdTitleAwait(fdYazilimDriveDosyaSil(yeniDosya.id,'EVRAK TAKİP'));}catch(h){
if(!fdTitleValid())return;
console.warn('Yarım kalan tapu görüntüsü temizlenemedi:',h);}}console.error('Tapu kaydet:',error);alert(kayitYazildi?'Tapu kaydı kaydedildi ancak ekran yenilenemedi. Tekrar kaydetmeyin; listeyi yenileyin.':'Tapu kaydı kaydedilemedi: '+tapuHataMetni(error));}finally{
if(fdTitleValid()){
btn.disabled=false;btn.textContent='Kaydet';
}
}

}catch(fdTitleError){if(!fdTitleValid())return;throw fdTitleError;}
}
async function tapuSil(id){
try{
fdTitleAssert(true);
if(!tapuYazabilir())return;const k=tapuKayitlari.find(x=>String(x.id)===String(id));if(!k||!confirm((k.tasinmazNo||'Bu')+' numaralı tapu kaydı silinsin mi?'))return;try{const {error}=await fdTitleAwait(supabaseClient.from('portal_records').delete().eq('company_id',activeUser.sirketId).eq('module','taputakip').eq('legacy_id',String(id)));if(error)throw error;tapuKayitlari=tapuKayitlari.filter(x=>String(x.id)!==String(id));tapuEkraniniCiz();if(k.tapuDosya?.id){try{await fdTitleAwait(fdYazilimDriveDosyaSil(k.tapuDosya.id,'EVRAK TAKİP'));}catch(h){
if(!fdTitleValid())return;
console.warn('Tapu görüntüsü silinemedi:',h);}}showToast?.('Tapu kaydı silindi.');}catch(error){
if(!fdTitleValid())return;
console.error('Tapu sil:',error);alert('Tapu kaydı silinemedi: '+tapuHataMetni(error));}
}catch(fdTitleError){if(!fdTitleValid())return;throw fdTitleError;}
}
function tapuGoruntule(id){
fdTitleAssert(false);
const k=tapuKayitlari.find(x=>String(x.id)===String(id));if(!k?.tapuDosya?.id)return alert('Tapu görüntüsü bulunamadı.');tapuOnizlemeId=String(id);document.getElementById('tapuOnizlemeBaslik').textContent=(k.tasinmazNo||'Tapu')+' · Tapu Görüntüsü';document.getElementById('tapuOnizlemeFrame').src='https:\x2f\x2fdrive.google.com/file/d/'+encodeURIComponent(k.tapuDosya.id)+'/preview';document.getElementById('modalTapuOnizleme').style.display='flex';}
function tapuGoruntuKapat(){
fdTitleAssert(false);
document.getElementById('tapuOnizlemeFrame').src='about:blank';tapuOnizlemeId='';document.getElementById('modalTapuOnizleme').style.display='none';}
function tapuGoruntuYeniSekme(){
fdTitleAssert(false);
const k=tapuKayitlari.find(x=>String(x.id)===String(tapuOnizlemeId));if(!k?.tapuDosya?.id)return;window.open(k.tapuDosya.url||('https:\x2f\x2fdrive.google.com/open?id='+encodeURIComponent(k.tapuDosya.id)),'_blank','noopener');}
async function tapuGoruntuIndir(){
try{
fdTitleAssert(false);
const k=tapuKayitlari.find(x=>String(x.id)===String(tapuOnizlemeId)),btn=document.getElementById('tapuOnizlemeIndirBtn');if(!k?.tapuDosya?.id)return;btn.disabled=true;btn.textContent='İndiriliyor...';try{const d=await fdTitleAwait(fdYazilimDriveDosyaIndir(k.tapuDosya.id,'EVRAK TAKİP')),raw=atob(d.base64),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);const url=URL.createObjectURL(new Blob([bytes],{type:d.mimeType||k.tapuDosya.mimeType||'application/octet-stream'})),a=document.createElement('a');a.href=url;a.download=d.ad||k.tapuDosya.ad||'tapu';fdTitleAppend(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){
if(!fdTitleValid())return;
console.error(error);alert('Tapu görüntüsü indirilemedi.');}finally{
if(fdTitleValid()){
btn.disabled=false;btn.textContent='⬇ İndir';
}
}
}catch(fdTitleError){if(!fdTitleValid())return;throw fdTitleError;}
}
function tapuCksArayuzunuKur(){
fdTitleAssert(false);
const a=document.querySelector('#tapuTakipApp .tapu-actions');if(a&&!document.getElementById('tapuCksGenelBtn')){const b=document.createElement('button');b.id='tapuCksGenelBtn';b.type='button';b.className='tapu-btn tapu-cks-btn';b.onclick=tapuCksGenelAc;b.innerHTML='🌾 ÇKS Kayıtları <span id="tapuCksUstSayac" class="tapu-cks-count">0</span>';a.insertBefore(b,document.getElementById('tapuYeniBtn'))}const f=document.querySelector('#tapuTakipApp .tapu-filters');if(f&&!document.getElementById('tapuCksYilFiltre')){const s=document.createElement('select');s.id='tapuCksYilFiltre';s.className='tapu-field';s.onchange=tapuFiltreDegisti;s.innerHTML='<option value="">Tüm ÇKS yılları</option>';f.appendChild(s);f.style.gridTemplateColumns='minmax(220px,2fr) repeat(6,minmax(105px,1fr))'}document.getElementById('tapuCksYeniGenelBtn').style.display=tapuYazabilir()?'inline-flex':'none'}
const tapuCksOpenOncesi=openTapuTakipApp;
openTapuTakipApp=async function(){
try{
fdTitleAssert(false);
tapuCksArayuzunuKur();await fdTitleAwait(tapuCksOpenOncesi());if(!tapuCksAktarimTamam&&tapuYazabilir())await fdTitleAwait(tapuCksExcelAktar());tapuCksFiltreleriYenile()
}catch(fdTitleError){if(!fdTitleValid())return;throw fdTitleError;}
};
const tapuCksSecOncesi=tapuFiltreSecenekleri;
tapuFiltreSecenekleri=function(){
fdTitleAssert(false);
tapuCksSecOncesi();tapuCksFiltreleriYenile()};
const tapuCksListeOncesi=tapuFiltreliListe;
tapuFiltreliListe=function(){
fdTitleAssert(false);
const l=tapuCksListeOncesi(),y=Number(document.getElementById('tapuCksYilFiltre')?.value||0);return y?l.filter(t=>tapuCksKayitlari.some(c=>String(c.tapuId)===String(t.id)&&Number(c.yil)===y)):l};
const tapuCksDetayOncesi=tapuDetayAc;
tapuDetayAc=function(id){
fdTitleAssert(false);
tapuCksDetayOncesi(id);tapuCksDetayCiz(id)};
const eskiArayuz=tapuCksArayuzunuKur;
tapuCksArayuzunuKur=function(){document.getElementById('tapuCksGenelBtn')?.remove();document.getElementById('tapuCksYilFiltre')?.remove();const f=document.querySelector('#tapuTakipApp .tapu-filters');if(f)f.style.gridTemplateColumns='minmax(240px,2fr) repeat(5,minmax(110px,1fr))'};
(function(){
fdTitleAssert(false);
let tapuDuzenlenenId="",tapuKayitIslemde=false;
const tapuFormEski=tapuFormuAc;
tapuFormuAc=function(id=''){
fdTitleAssert(true);

        if(typeof fdVarlikKisiListesiniGuncelle==='function')fdVarlikKisiListesiniGuncelle();
        const kayit=id?tapuKayitlari.find(x=>String(x.id)===String(id)):null;
        tapuDuzenlenenId=kayit?String(kayit.id):'';
        const r=tapuFormEski.apply(this,arguments),gizli=document.getElementById('tapuId');
        if(gizli){gizli.value=tapuDuzenlenenId;gizli.dataset.fdDuzenlenenId=tapuDuzenlenenId}
        if(id&&!tapuDuzenlenenId){tapuFormuKapat();alert('Düzenlenecek tapu kaydı bulunamadı. Listeyi yenileyip tekrar deneyin.')}
        return r;
    };
const tapuKaydetEski=tapuKaydet;
tapuKaydet=async function(e){
try{
fdTitleAssert(true);

        e?.preventDefault?.();if(tapuKayitIslemde)return;
        const gizli=document.getElementById('tapuId'),kilit=tapuDuzenlenenId||String(gizli?.dataset.fdDuzenlenenId||'');
        if(kilit){if(!tapuKayitlari.some(x=>String(x.id)===String(kilit)))return alert('Düzenlenen eski tapu kaydı bulunamadı. Yeni kayıt açılmadı.');gizli.value=kilit}
        tapuKayitIslemde=true;
        try{return await fdTitleAwait(tapuKaydetEski.apply(this,arguments))}finally{
if(fdTitleValid()){
tapuKayitIslemde=false;tapuDuzenlenenId='';if(gizli)delete gizli.dataset.fdDuzenlenenId
}
}
    
}catch(fdTitleError){if(!fdTitleValid())return;throw fdTitleError;}
};
})();
const fdTitleDesign=()=>{
(function(){
fdTitleAssert(false);

 const el=id=>document.getElementById(id),esc=tapuHtml;
 fdTapuFiltreTemizle=function(){
fdTitleAssert(false);
for(const id of ['tapuArama','tapuMalikFiltre','tapuNitelikFiltre','tapuIlFiltre','tapuAdaFiltre','tapuParselFiltre','tapuCksYilFiltre','fdTapuIlce','fdTapuMahalle','fdTapuBelge'])if(el(id))el(id).value='';if(el('fdTapuSirala'))el('fdTapuSirala').value='kayit';tapuFiltreDegisti()};
 function secenekler(id,alan,baslik){
fdTitleAssert(false);
const s=el(id);if(!s)return;const onceki=s.value;s.innerHTML='<option value="">'+baslik+'</option>'+[...new Set(tapuKayitlari.map(k=>String(k[alan]||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr')).map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');s.value=[...s.options].some(o=>o.value===onceki)?onceki:''}
 const filtre=tapuFiltreliListe;tapuFiltreliListe=function(){
fdTitleAssert(false);
let liste=filtre.apply(this,arguments);const ilce=el('fdTapuIlce')?.value,mahalle=el('fdTapuMahalle')?.value,belge=el('fdTapuBelge')?.value,sira=el('fdTapuSirala')?.value;liste=liste.filter(k=>(!ilce||String(k.ilce||'').trim()===ilce)&&(!mahalle||String(k.mahalle||'').trim()===mahalle)&&(!belge||(belge==='var'?Boolean(k.tapuDosya?.id):!k.tapuDosya?.id)));if(sira==='malik')liste.sort((a,b)=>String(a.sahibi||'').localeCompare(String(b.sahibi||''),'tr'));else if(sira==='alan')liste.sort((a,b)=>tapuSayisal(b.sahipOlunanAlan)-tapuSayisal(a.sahipOlunanAlan));else if(sira==='alis')liste.sort((a,b)=>String(b.alisTarihi||'').localeCompare(String(a.alisTarihi||'')));return liste};
 const sec=tapuFiltreSecenekleri;tapuFiltreSecenekleri=function(){
fdTitleAssert(false);
const r=sec.apply(this,arguments);secenekler('fdTapuIlce','ilce','Tüm ilçeler');secenekler('fdTapuMahalle','mahalle','Tüm mahalleler');return r};
 const ciz=tapuListeyiCiz;tapuListeyiCiz=function(){
fdTitleAssert(false);
const r=ciz.apply(this,arguments),liste=tapuFiltreliListe();const o=el('fdTapuListeOzet');if(o)o.textContent=liste.length+' tapu · '+new Set(liste.map(k=>k.sahibi).filter(Boolean)).size+' malik · Sahip olunan alan: '+tapuAlan(liste.reduce((s,k)=>s+tapuSayisal(k.sahipOlunanAlan),0))+' m²';for(const b of document.querySelectorAll('#tapuTabloGovde button')){b.type='button';if(!b.getAttribute('aria-label'))b.setAttribute('aria-label',b.title||b.textContent)}return r};
 fdTapuRaporTablosu=function(){
fdTitleAssert(false);
const liste=tapuFiltreliListe();const table=document.createElement('table');table.innerHTML='<thead><tr>'+['Taşınmaz No','Nitelik','İl','İlçe','Mahalle','Sahip Olunan Alan (m²)','Toplam Alan (m²)','Hisse','Ada','Parsel','Bağımsız Bölüm','Alış Tarihi','Malik','Tapu Belgesi'].map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+liste.map(k=>'<tr>'+[k.tasinmazNo,k.nitelik,k.il,k.ilce,k.mahalle,tapuAlan(k.sahipOlunanAlan),tapuAlan(k.toplamAlan),k.hisseDurumu,k.ada,k.parsel,k.bagimsizBolum,tapuTarih(k.alisTarihi),k.sahibi,k.tapuDosya?.id?'Yüklü':'Yüklenmemiş'].map(v=>'<td>'+esc(v??'')+'</td>').join('')+'</tr>').join('')+'</tbody>';return table};
 fdTapuDisariAl=async function(tur,button){
try{
fdTitleAssert(false);
const tablo=fdTapuRaporTablosu();if(!tablo.tBodies[0].rows.length)return showToast?.('Çıktı için kayıt bulunmuyor.','warning');if(tur==='pdf')return window.fdTabloPdfOnizle?.(tablo,'TAPU VE TAŞINMAZ LİSTESİ','Tapu_Listesi.pdf',{yon:'landscape',format:'a3',altBaslik:el('fdTapuListeOzet')?.textContent});if(tur==='excel'){const wb=XLSX.utils.book_new(),ws=XLSX.utils.aoa_to_sheet([[...tablo.tHead.rows[0].cells].map(c=>c.textContent),...tapuFiltreliListe().map(k=>[String(k.tasinmazNo??''),k.nitelik,k.il,k.ilce,k.mahalle,tapuSayisal(k.sahipOlunanAlan),tapuSayisal(k.toplamAlan),k.hisseDurumu,String(k.ada??''),String(k.parsel??''),String(k.bagimsizBolum??''),tapuTarih(k.alisTarihi),k.sahibi,k.tapuDosya?.id?'Yüklü':'Yüklenmemiş'])]);ws['!cols']=[14,24,16,18,24,20,20,12,10,10,16,15,30,16].map(wch=>({wch}));XLSX.utils.book_append_sheet(wb,ws,'Tapu Listesi');return XLSX.writeFile(wb,'Tapu_Listesi.xlsx')}
  if(button?.disabled)return;const eski=button?.textContent;if(button){button.disabled=true;button.textContent='Hazırlanıyor…'}const host=document.createElement('div');host.style.cssText='position:fixed;left:-20000px;top:0;width:1700px;background:white';tablo.style.cssText='width:100%;font:13px Arial;border-collapse:collapse';for(const cell of tablo.querySelectorAll('td,th'))cell.style.cssText='padding:9px;border:1px solid #d7e3eb;white-space:normal;overflow-wrap:anywhere';host.appendChild(tablo);fdTitleAppend(host);try{const clipboard=window.fdPanoyaCanvasYaz;if(typeof clipboard!=='function'&&(!navigator.clipboard?.write||!window.ClipboardItem))throw Error('Bu cihazda görüntüyü panoya kopyalama desteklenmiyor.');const canvas=await fdTitleAwait(puantajCanvasOlustur(tablo,Math.min(2,15000/Math.max(tablo.scrollWidth,tablo.scrollHeight+72,1)),'TAPU VE TAŞINMAZ LİSTESİ'));const blob=await fdTitleAwait(new Promise(resolve=>canvas.toBlob(resolve,'image/png')));if(!blob)throw Error('Görüntü oluşturulamadı.');await fdTitleAwait(navigator.clipboard.write([new ClipboardItem({'image/png':blob})]));showToast?.('Tablonun tamamı panoya kopyalandı.','success')}catch(e){
if(!fdTitleValid())return;
showToast?.(e.message||'Görüntü alınamadı.','error')}finally{
if(fdTitleValid()){
host.remove();if(button){button.disabled=false;button.textContent=eski}
}
}
}catch(fdTitleError){if(!fdTitleValid())return;throw fdTitleError;}
};
 const kaydet=tapuKaydet;let kayitMesgul=false;tapuKaydet=async function(event){
try{
fdTitleAssert(true);
event?.preventDefault?.();if(kayitMesgul)return;if(!tapuYazabilir())return showToast?.('Bu kaydı değiştirme yetkiniz yok.','error');const form=el('tapuForm');if(!form.reportValidity())return;const toplam=tapuSayisal(el('tapuToplamAlan').value),sahip=tapuSayisal(el('tapuSahipAlan').value);if(toplam>0&&sahip>toplam)return showToast?.('Sahip olunan alan toplam alandan büyük olamaz.','warning');if(!['tapuTasinmazNo','tapuNitelik','tapuSahibi'].every(id=>el(id).value.trim()))return showToast?.('Taşınmaz numarası, nitelik ve malik bilgisi zorunludur.','warning');kayitMesgul=true;try{return await fdTitleAwait(kaydet.apply(this,arguments))}finally{
if(fdTitleValid()){
kayitMesgul=false
}
}
}catch(fdTitleError){if(!fdTitleValid())return;throw fdTitleError;}
};
 const sil=tapuSil,silinen=new Set();tapuSil=async function(id){
try{
fdTitleAssert(true);
if(silinen.has(String(id)))return;silinen.add(String(id));try{return await fdTitleAwait(sil.apply(this,arguments))}finally{
if(fdTitleValid()){
silinen.delete(String(id))
}
}
}catch(fdTitleError){if(!fdTitleValid())return;throw fdTitleError;}
};
 const root=el('tapuTakipApp');if(!root)return;const actions=root.querySelector('.tapu-actions');for(const [tur,ad,renk] of [['goruntu','Görüntü Al','goruntu'],['excel','Excel','excel'],['pdf','PDF','pdf']]){const b=document.createElement('button');b.type='button';b.className='tapu-btn fd-tapu-'+renk;b.textContent=ad;b.onclick=()=>fdTapuDisariAl(tur,b);actions.insertBefore(b,el('tapuYeniBtn'))}
 const bar=root.querySelector('.tapu-filters');bar.insertAdjacentHTML('beforeend','<select id="fdTapuIlce" class="tapu-field" aria-label="İlçe" onchange="tapuFiltreDegisti()"></select><select id="fdTapuMahalle" class="tapu-field" aria-label="Mahalle" onchange="tapuFiltreDegisti()"></select><select id="fdTapuBelge" class="tapu-field" aria-label="Tapu belgesi" onchange="tapuFiltreDegisti()"><option value="">Tüm belge durumları</option><option value="var">Tapu belgesi yüklü</option><option value="yok">Tapu belgesi eksik</option></select><select id="fdTapuSirala" class="tapu-field" aria-label="Sıralama" onchange="tapuFiltreDegisti()"><option value="kayit">Kayıt sırası</option><option value="malik">Malik A–Z</option><option value="alan">Sahip olunan alan ↓</option><option value="alis">Alış tarihi: yeniden eskiye</option></select><button type="button" class="tapu-btn tapu-cancel" onclick="fdTapuFiltreTemizle()">Filtreleri Temizle</button>');bar.insertAdjacentHTML('afterend','<div class="fd-tapu-liste-ozet"><span id="fdTapuListeOzet" aria-live="polite"></span><span>Niteliğe basarak tapu detayını açabilirsiniz.</span></div>');for(const [id,ad] of [['tapuArama','Tapu ara'],['tapuMalikFiltre','Malik'],['tapuNitelikFiltre','Nitelik'],['tapuIlFiltre','İl'],['tapuAdaFiltre','Ada'],['tapuParselFiltre','Parsel']])el(id)?.setAttribute('aria-label',ad);
 for(const label of document.querySelectorAll('#modalTapuKayit label,#modalTapuCksKayit label')){const alan=label.parentElement.querySelector('input,select,textarea');if(alan?.id)label.htmlFor=alan.id}
})();

};
const api={get tapuMalikStili(){return tapuMalikStili},get tapuYetkiGorunumunuAyarla(){return tapuYetkiGorunumunuAyarla},get tapuFiltreSecenekleri(){return tapuFiltreSecenekleri},get tapuFiltreliListe(){return tapuFiltreliListe},get tapuFiltreDegisti(){return tapuFiltreDegisti},get tapuEkraniniCiz(){return tapuEkraniniCiz},get tapuListeyiCiz(){return tapuListeyiCiz},get tapuSayfaDegistir(){return tapuSayfaDegistir},get tapuSayfaBoyutuDegistir(){return tapuSayfaBoyutuDegistir},get tapuDetayAc(){return tapuDetayAc},get tapuDetayKapat(){return tapuDetayKapat},get tapuDetayGoruntusunuAc(){return tapuDetayGoruntusunuAc},get tapuDetayDuzenle(){return tapuDetayDuzenle},get tapuFormuAc(){return tapuFormuAc},get tapuFormuKapat(){return tapuFormuKapat},get tapuKaydet(){return tapuKaydet},get tapuSil(){return tapuSil},get tapuGoruntule(){return tapuGoruntule},get tapuGoruntuKapat(){return tapuGoruntuKapat},get tapuGoruntuYeniSekme(){return tapuGoruntuYeniSekme},get tapuGoruntuIndir(){return tapuGoruntuIndir},get tapuCksArayuzunuKur(){return tapuCksArayuzunuKur},get fdTapuFiltreTemizle(){return fdTapuFiltreTemizle},get fdTapuRaporTablosu(){return fdTapuRaporTablosu},get fdTapuDisariAl(){return fdTapuDisariAl},get fdTapuDetayKimligi(){return fdTapuDetayKimligi}};
return{init(){document.querySelector("[data-title-frame-host]").outerHTML="<iframe id=\"tapuOnizlemeFrame\" title=\"Tapu görüntüsü\" style=\"border:0;width:100%;height:100%;background:#eef2f7\"></iframe>";fdTitleDesign();window.fdVarlikKisiListesiniGuncelle?.();window.fdSupplementalOutputInstall?.();window.fdUnifiedOutput?.scan()},open(...args){fdTitleAssert();if(args[0]?.fdTitleAction)return api[args[0].fdTitleAction](...args[0].args);return openTapuTakipApp(...args)},api,dispose(){fdTitleDisposed=true;const tab=typeof fdAcikUygulamaSekmeleri!=="undefined"?fdAcikUygulamaSekmeleri.find(t=>t.anahtar==="tapu"):null;if(tab)tab.alanId="";for(const[t,...a]of fdTitleListeners)t.removeEventListener(...a);for(const id of fdTitleTimers)window.clearTimeout(id);for(const url of fdTitleUrls)window.URL.revokeObjectURL(url);for(const n of fdTitleNodes)n.remove();const frame=document.getElementById("tapuOnizlemeFrame");if(frame)frame.src="about:blank";document.getElementById("tapuForm")?.reset();document.querySelectorAll("[data-fd-module-root=tapu] input[type=file]").forEach(f=>f.value="");tapuDetayId="";tapuOnizlemeId="";}};
});
