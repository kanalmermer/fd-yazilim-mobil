window.FDModules.define('siparistakip',function(){

let fdOrderDisposed=false;
const fdOrderInitial=fdOrderContext(),fdOrderListeners=[],fdOrderTimers=new Set(),fdOrderNodes=new Set();
function fdOrderContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||activeUser?.company_id||'',activeUser?.rol||'',anaMenuModulYetkisi('siparistakip')])}
function fdOrderValid(){return !fdOrderDisposed&&fdOrderInitial===fdOrderContext()&&anaMenuModulErisimiVar('siparistakip')}
function fdOrderAssert(write=false){if(!fdOrderValid())throw Error('Oturum değişti; Sipariş Takibi ekranını yeniden açın.');if(write&&!anaMenuModulYazmaYetkisiVar('siparistakip'))throw Error('Bu modülde değişiklik yapma yetkiniz yok.')}
async function fdOrderAwait(promise){fdOrderAssert();const r=await promise;fdOrderAssert();return r}
function fdOrderListen(target,...args){target.addEventListener(...args);fdOrderListeners.push([target,...args])}
function fdOrderAppend(node){fdOrderNodes.add(node);return document.body.appendChild(node)}
function setTimeout(fn,delay,...args){const id=window.setTimeout(()=>{fdOrderTimers.delete(id);if(fdOrderValid())fn(...args)},delay);fdOrderTimers.add(id);return id}
function fdOrderCleanNode(node){if(!node)return;if(node._url){window.URL.revokeObjectURL(node._url);node._url=null}node.querySelectorAll?.('iframe').forEach(frame=>frame.src='about:blank');node._blob=null;node.remove()}
// Shared sinks remain patchable by the selectable-output capture adapter.
// Existing shared PDF work can finish on its detached node; discard its result and late URL.
function fdOrderScopedPdf(table,title,name,options){return window.fdTabloPdfOnizle?.(table,title,name,{...options,fdIsCurrent:fdOrderValid})}
function fdOrderOutput(fn,args){fdOrderAssert();const previous=document.getElementById('fdOrtakCiktiOnizleme'),result=fn(...args),current=document.getElementById('fdOrtakCiktiOnizleme'),node=current!==previous?current:null;if(node)fdOrderNodes.add(node);if(result&&typeof result.then==='function')return Promise.resolve(result).then(value=>{if(!fdOrderValid()){fdOrderCleanNode(node);return}return value},error=>{if(!fdOrderValid()){fdOrderCleanNode(node);return}throw error}).finally(()=>{if(!fdOrderValid())fdOrderCleanNode(node)});return result}

'use strict';
const MODUL='siparistakip';
let kayitlar=[],firmaKayitlari=[],urunKayitlari=[],seciliFirmaId='',seciliUrunId='',seciliSiparisId='',teslimatSiparisId='',durumFiltre='',turFiltre='',arama='',firmaArama='',tarihBaslangic='',tarihBitis='',duzenlenenId='',duzenlenenFirmaId='',duzenlenenUrunId='',aktifSiparisSekme='siparisler',acikSatirlar=new Set(),yukleniyor=false;
const el=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const js=v=>JSON.stringify(String(v??'')).replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
const temiz=v=>String(v??'').trim();
const trBuyuk=v=>temiz(v).toLocaleUpperCase('tr-TR');
const anahtar=v=>temiz(v).toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c');
const sirketId=()=>String(activeUser?.sirketId||(typeof aktifSirketId==='function'?aktifSirketId():'')||'');
const yazabilir=()=>typeof anaMenuModulYetkisi!=='function'||anaMenuModulYetkisi(MODUL)==='yazma';
const bugun=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const tarih=v=>{
fdOrderAssert(false);
if(!v)return'-';if(typeof tarihFormati==='function')return tarihFormati(v);const [y,m,d]=String(v).slice(0,10).split('-');return d&&m&&y?d+'.'+m+'.'+y:String(v)};
const sayi=v=>{
fdOrderAssert(false);
let s=String(v??'').trim().replace(/\s/g,'');if(!s)return 0;if(s.includes(',')&&s.includes('.'))s=s.lastIndexOf(',')>s.lastIndexOf('.')?s.replace(/\./g,'').replace(',','.'):s.replace(/,/g,'');else if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');const n=Number(s);return Number.isFinite(n)?n:NaN};
const miktar=v=>Number(v||0).toLocaleString('tr-TR',{maximumFractionDigits:3});
const hataMetni=e=>{
fdOrderAssert(false);
const m=String(e?.message||e||'İşlem tamamlanamadı.');return /portal_records_module_check/i.test(m)?'Sipariş Takibi veritabanı tanımı güncel değil. Sayfayı yenileyip tekrar deneyin.':m};
const yeniId=onEk=>(onEk||'siparis')+'-'+(crypto.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));
const mirasFirmaId=ad=>'siparis-firma-miras-'+anahtar(ad).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const mirasUrunId=(firmaId,ad)=>'siparis-urun-miras-'+anahtar(firmaId+'-'+ad).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function firmaDuzelt(k={},legacy=''){
fdOrderAssert(false);
return{id:String(k.id||legacy||yeniId('siparis-firma')),kayitTipi:'firma',ad:trBuyuk(k.ad||k.firma||''),yetkili:trBuyuk(k.yetkili||''),telefon:temiz(k.telefon||''),eposta:temiz(k.eposta||''),not:temiz(k.not||''),miras:Boolean(k.miras),olusturmaTarihi:k.olusturmaTarihi||new Date().toISOString(),guncellemeTarihi:k.guncellemeTarihi||''}}
const ayarBirimleri=()=>{
fdOrderAssert(false);
const liste=Array.isArray(uygulamaAyarlari?.siparisBirimleri)?uygulamaAyarlari.siparisBirimleri:VARSAYILAN_UYGULAMA_AYARLARI.siparisBirimleri;return[...new Set(liste.map(trBuyuk).filter(Boolean))]};
const varsayilanBirim=()=>{
fdOrderAssert(false);
const liste=ayarBirimleri(),secili=trBuyuk(uygulamaAyarlari?.siparisVarsayilanBirim||'ADET');return liste.includes(secili)?secili:(liste[0]||'ADET')};
function urunDuzelt(k={},legacy=''){
fdOrderAssert(false);
return{id:String(k.id||legacy||yeniId('siparis-urun')),kayitTipi:'urun',firmaId:String(k.firmaId||''),ad:trBuyuk(k.ad||k.urun||''),birim:trBuyuk(k.birim||varsayilanBirim()),aciklama:temiz(k.aciklama||''),miras:Boolean(k.miras),olusturmaTarihi:k.olusturmaTarihi||new Date().toISOString(),guncellemeTarihi:k.guncellemeTarihi||''}}
function teslimatDuzelt(t={}){
fdOrderAssert(false);
return{id:String(t.id||yeniId('teslimat')),grupId:String(t.grupId||''),tarih:temiz(t.tarih||bugun()),miktar:Number(t.miktar||0),irsaliyeNo:trBuyuk(t.irsaliyeNo||''),aciklama:temiz(t.aciklama||'')}}
function kayitDuzelt(k={},legacy=''){
fdOrderAssert(false);

        return{id:String(k.id||legacy||yeniId()),kayitTipi:'siparis',firmaId:String(k.firmaId||''),firma:trBuyuk(k.firma||''),urunId:String(k.urunId||''),siparisTuru:k.siparisTuru==='alis'?'alis':'satis',siparisNo:trBuyuk(k.siparisNo||''),siparisTarihi:temiz(k.siparisTarihi||bugun()),urun:trBuyuk(k.urun||''),aciklama:temiz(k.aciklama||''),birim:trBuyuk(k.birim||varsayilanBirim()),siparisMiktari:Number(k.siparisMiktari||0),terminTarihi:temiz(k.terminTarihi||''),not:temiz(k.not||''),iptal:Boolean(k.iptal),teslimatlar:(Array.isArray(k.teslimatlar)?k.teslimatlar:[]).map(teslimatDuzelt).sort((a,b)=>String(a.tarih).localeCompare(String(b.tarih))),olusturmaTarihi:k.olusturmaTarihi||new Date().toISOString(),guncellemeTarihi:k.guncellemeTarihi||''}
    }
const teslimToplami=k=>k.teslimatlar.reduce((t,x)=>t+Number(x.miktar||0),0);
const kalan=k=>Math.max(0,Number(k.siparisMiktari||0)-teslimToplami(k));
const urunSiparisleri=(urunId=seciliUrunId)=>firmaSiparisleri(seciliFirmaId).filter(k=>k.urunId===String(urunId));
function urunTeslimatGruplari(urunId=seciliUrunId){
fdOrderAssert(false);
const gruplar=new Map();urunSiparisleri(urunId).forEach(k=>k.teslimatlar.forEach(t=>{
fdOrderAssert(false);
const grupId=String(t.grupId||t.id),mevcut=gruplar.get(grupId)||{id:grupId,tarih:t.tarih,irsaliyeNo:t.irsaliyeNo,aciklama:t.aciklama,miktar:0,dagitimlar:[]};mevcut.miktar+=Number(t.miktar||0);mevcut.dagitimlar.push({siparisId:k.id,siparisNo:k.siparisNo,miktar:Number(t.miktar||0),teslimatId:t.id});gruplar.set(grupId,mevcut)}));return[...gruplar.values()].sort((a,b)=>String(b.tarih).localeCompare(String(a.tarih)))}
function urunToplamlari(urunId=seciliUrunId){
fdOrderAssert(false);
const siparisler=urunSiparisleri(urunId).filter(k=>!k.iptal),siparis=siparisler.reduce((t,k)=>t+Number(k.siparisMiktari||0),0),teslim=siparisler.reduce((t,k)=>t+teslimToplami(k),0);return{siparisler,siparis,teslim,kalan:Math.max(0,siparis-teslim)}}
function durum(k){
fdOrderAssert(false);
const t=teslimToplami(k),kal=kalan(k);if(k.iptal)return{kod:'iptal',ad:'İptal'};if(kal<=.0001)return{kod:'tamamlandi',ad:'Tamamlandı'};if(k.terminTarihi){const son=new Date(String(k.terminTarihi).slice(0,10)+'T12:00:00'),tolerans=Math.min(365,Math.max(0,Number(uygulamaAyarlari?.siparisGecikmeToleransGunu||0)));son.setDate(son.getDate()+tolerans);if(son<new Date(bugun()+'T12:00:00'))return{kod:'gecikti',ad:t>0?'Kısmi / Gecikti':'Gecikti'}}if(t>0)return{kod:'kismi',ad:'Kısmi Teslim'};return{kod:'bekliyor',ad:'Bekliyor'}}
const seciliFirma=()=>firmaKayitlari.find(f=>f.id===seciliFirmaId)||null;
const firmaSiparisleri=id=>kayitlar.filter(k=>k.firmaId===String(id)||(!k.firmaId&&anahtar(k.firma)===anahtar(firmaKayitlari.find(f=>f.id===String(id))?.ad)));
const firmaUrunleri=id=>urunKayitlari.filter(u=>u.firmaId===String(id)).sort((a,b)=>a.ad.localeCompare(b.ad,'tr'));
const seciliUrun=()=>urunKayitlari.find(u=>u.id===seciliUrunId)||null;
const tarihFiltresineUyar=v=>(!tarihBaslangic||String(v||'')>=tarihBaslangic)&&(!tarihBitis||String(v||'')<=tarihBitis);
function filtreli(){
fdOrderAssert(false);
const q=anahtar(arama);return firmaSiparisleri(seciliFirmaId).filter(k=>(!seciliUrunId||k.urunId===seciliUrunId)&&tarihFiltresineUyar(k.siparisTarihi)&&(!durumFiltre||durum(k).kod===durumFiltre)&&(!q||[k.siparisNo,k.aciklama,k.not,...k.teslimatlar.flatMap(t=>[t.irsaliyeNo,t.aciklama])].some(v=>anahtar(v).includes(q)))).sort((a,b)=>String(b.siparisTarihi).localeCompare(String(a.siparisTarihi))||a.siparisNo.localeCompare(b.siparisNo,'tr'))}
const filtreliTeslimatGruplari=()=>urunTeslimatGruplari().filter(t=>tarihFiltresineUyar(t.tarih));
async function yukle(){
try{
fdOrderAssert(false);
if(!sirketId())throw new Error('Şirket bilgisi bulunamadı.');const{data,error}=await fdOrderAwait(supabaseClient.from('portal_records').select('legacy_id,data,record_year').eq('company_id',sirketId()).eq('module',MODUL));if(error)throw error;firmaKayitlari=[];urunKayitlari=[];kayitlar=[];(data||[]).forEach(r=>{
fdOrderAssert(false);
if(r.data?.kayitTipi==='firma')firmaKayitlari.push(firmaDuzelt(r.data,r.legacy_id));else if(r.data?.kayitTipi==='urun')urunKayitlari.push(urunDuzelt(r.data,r.legacy_id));else kayitlar.push(kayitDuzelt(r.data,r.legacy_id))});const adlar=[...new Set(kayitlar.map(k=>k.firma).filter(Boolean))];adlar.forEach(ad=>{
fdOrderAssert(false);
let f=firmaKayitlari.find(x=>anahtar(x.ad)===anahtar(ad));if(!f){f=firmaDuzelt({id:mirasFirmaId(ad),ad,miras:true});firmaKayitlari.push(f)}kayitlar.filter(k=>!k.firmaId&&anahtar(k.firma)===anahtar(ad)).forEach(k=>k.firmaId=f.id)});kayitlar.forEach(k=>{
fdOrderAssert(false);
let u=urunKayitlari.find(x=>x.id===k.urunId)||(urunKayitlari.find(x=>x.firmaId===k.firmaId&&anahtar(x.ad)===anahtar(k.urun)));if(!u){u=urunDuzelt({id:mirasUrunId(k.firmaId,k.urun),firmaId:k.firmaId,ad:k.urun,birim:k.birim,miras:true});urunKayitlari.push(u)}k.urunId=u.id;k.urun=u.ad;k.birim=u.birim});firmaKayitlari.sort((a,b)=>a.ad.localeCompare(b.ad,'tr'));if(seciliFirmaId&&!firmaKayitlari.some(f=>f.id===seciliFirmaId))seciliFirmaId='';if(seciliUrunId&&!urunKayitlari.some(u=>u.id===seciliUrunId))seciliUrunId='';listeleriYenile()
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
}
async function kaydet(k){
try{
fdOrderAssert(false);
const f=seciliFirma(),u=urunKayitlari.find(x=>x.id===(k.urunId||seciliUrunId)),s=kayitDuzelt({...k,firmaId:k.firmaId||f?.id||'',firma:k.firma||f?.ad||'',urunId:k.urunId||u?.id||'',urun:k.urun||u?.ad||'',birim:k.birim||u?.birim||'ADET',guncellemeTarihi:new Date().toISOString()},k.id),satir={company_id:sirketId(),module:MODUL,legacy_id:s.id,record_year:Number(String(s.siparisTarihi).slice(0,4))||new Date().getFullYear(),employee_legacy_id:null,data:s},{error}=await fdOrderAwait(supabaseClient.from('portal_records').upsert(satir,{onConflict:'company_id,module,legacy_id'}));if(error)throw error;const i=kayitlar.findIndex(x=>x.id===s.id);if(i>=0)kayitlar[i]=s;else kayitlar.push(s);listeleriYenile();return s
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
}
async function siparisleriKaydet(liste){
try{
fdOrderAssert(false);
const guncellemeTarihi=new Date().toISOString(),duzeltilen=liste.map(k=>kayitDuzelt({...k,guncellemeTarihi},k.id)),satirlar=duzeltilen.map(s=>({company_id:sirketId(),module:MODUL,legacy_id:s.id,record_year:Number(String(s.siparisTarihi).slice(0,4))||new Date().getFullYear(),employee_legacy_id:null,data:s}));if(!satirlar.length)return[];const{error}=await fdOrderAwait(supabaseClient.from('portal_records').upsert(satirlar,{onConflict:'company_id,module,legacy_id'}));if(error)throw error;duzeltilen.forEach(s=>{
fdOrderAssert(false);
const i=kayitlar.findIndex(x=>x.id===s.id);if(i>=0)kayitlar[i]=s;else kayitlar.push(s)});return duzeltilen
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
}
async function firmaKaydet(f){
try{
fdOrderAssert(false);
const s=firmaDuzelt({...f,miras:false,guncellemeTarihi:new Date().toISOString()},f.id),eski=firmaKayitlari.find(x=>x.id===s.id),ilgili=kayitlar.filter(k=>k.firmaId===s.id||anahtar(k.firma)===anahtar(eski?.ad));const satirlar=[{company_id:sirketId(),module:MODUL,legacy_id:s.id,record_year:null,employee_legacy_id:null,data:s},...ilgili.map(k=>{
fdOrderAssert(false);
const g=kayitDuzelt({...k,firmaId:s.id,firma:s.ad,guncellemeTarihi:new Date().toISOString()},k.id);return{company_id:sirketId(),module:MODUL,legacy_id:g.id,record_year:Number(String(g.siparisTarihi).slice(0,4))||new Date().getFullYear(),employee_legacy_id:null,data:g}})],{error}=await fdOrderAwait(supabaseClient.from('portal_records').upsert(satirlar,{onConflict:'company_id,module,legacy_id'}));if(error)throw error;ilgili.forEach(k=>{
fdOrderAssert(false);
k.firmaId=s.id;k.firma=s.ad});const i=firmaKayitlari.findIndex(x=>x.id===s.id);if(i>=0)firmaKayitlari[i]=s;else firmaKayitlari.push(s);firmaKayitlari.sort((a,b)=>a.ad.localeCompare(b.ad,'tr'));listeleriYenile();return s
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
}
async function urunKaydet(u){
try{
fdOrderAssert(false);
const s=urunDuzelt({...u,firmaId:u.firmaId||seciliFirmaId,miras:false,guncellemeTarihi:new Date().toISOString()},u.id),eski=urunKayitlari.find(x=>x.id===s.id),ilgili=kayitlar.filter(k=>k.urunId===s.id||(!k.urunId&&k.firmaId===s.firmaId&&anahtar(k.urun)===anahtar(eski?.ad))),satirlar=[{company_id:sirketId(),module:MODUL,legacy_id:s.id,record_year:null,employee_legacy_id:null,data:s},...ilgili.map(k=>{
fdOrderAssert(false);
const g=kayitDuzelt({...k,urunId:s.id,urun:s.ad,birim:s.birim,guncellemeTarihi:new Date().toISOString()},k.id);return{company_id:sirketId(),module:MODUL,legacy_id:g.id,record_year:Number(String(g.siparisTarihi).slice(0,4))||new Date().getFullYear(),employee_legacy_id:null,data:g}})],{error}=await fdOrderAwait(supabaseClient.from('portal_records').upsert(satirlar,{onConflict:'company_id,module,legacy_id'}));if(error)throw error;ilgili.forEach(k=>{
fdOrderAssert(false);
k.urunId=s.id;k.urun=s.ad;k.birim=s.birim});const i=urunKayitlari.findIndex(x=>x.id===s.id);if(i>=0)urunKayitlari[i]=s;else urunKayitlari.push(s);listeleriYenile();return s
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
}
async function sil(id){
try{
fdOrderAssert(false);
const{error}=await fdOrderAwait(supabaseClient.from('portal_records').delete().eq('company_id',sirketId()).eq('module',MODUL).eq('legacy_id',String(id)));if(error)throw error;kayitlar=kayitlar.filter(x=>x.id!==String(id));acikSatirlar.delete(String(id));listeleriYenile()
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
}
function listeleriYenile(){
fdOrderAssert(false);
const urunList=el('fdSiparisUrunListesi');if(urunList)urunList.innerHTML=[...new Set(kayitlar.map(x=>x.urun).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr')).map(x=>'<option value="'+esc(x)+'"></option>').join('')}
function birimListesiniYenile(){
fdOrderAssert(false);
const liste=el('fdSiparisBirimListesi');if(liste)liste.innerHTML=ayarBirimleri().map(x=>'<option value="'+esc(x)+'"></option>').join('');const alan=el('fdSiparisUrunBirim');if(alan&&!alan.value)alan.value=varsayilanBirim()}
const fdSiparisBirimSecenekleriniYenile=birimListesiniYenile;
function ozetCiz(){
fdOrderAssert(false);
const u=seciliUrun(),top=urunToplamlari(),birim=u?.birim||'';el('fdSiparisOzet').innerHTML=[['Toplam Sipariş',miktar(top.siparis)+' '+birim,'#2563eb'],['Teslim Edilen',miktar(top.teslim)+' '+birim,'#059669'],['Kalan',miktar(top.kalan)+' '+birim,top.kalan>.0001?'#d97706':'#059669'],['Sipariş Sayısı',top.siparisler.length,'#64748b']].map(([ad,n,renk])=>'<div class="fd-siparis-stat" style="--renk:'+renk+'"><small>'+ad+'</small><strong>'+n+'</strong></div>').join('')}
function firmaKartlariCiz(){
fdOrderAssert(false);
const alan=el('fdSiparisFirmaKartlari');if(!alan)return;const q=anahtar(firmaArama),liste=firmaKayitlari.filter(f=>!q||[f.ad,f.yetkili,f.telefon,f.eposta].some(v=>anahtar(v).includes(q)));alan.innerHTML=liste.map(f=>{
fdOrderAssert(false);
const sip=firmaSiparisleri(f.id),acik=sip.filter(k=>!['tamamlandi','iptal'].includes(durum(k).kod)).length,tamam=sip.filter(k=>durum(k).kod==='tamamlandi').length,gecik=sip.filter(k=>durum(k).kod==='gecikti').length;return'<article class="fd-siparis-firma-card"><div class="fd-siparis-firma-card-head"><span class="fd-siparis-firma-icon">🏢</span><div><h3>'+esc(f.ad)+'</h3><p>'+esc(f.yetkili||'Yetkili belirtilmedi')+(f.telefon?' · '+esc(f.telefon):'')+'</p></div></div><div class="fd-siparis-firma-sayilar"><span><b>'+sip.length+'</b> Sipariş</span><span><b>'+acik+'</b> Açık</span><span><b>'+tamam+'</b> Tamam</span>'+(gecik?'<span class="gecik"><b>'+gecik+'</b> Geciken</span>':'')+'</div><div class="fd-siparis-firma-card-actions"><button class="btn-submit" type="button" onclick="fdSiparisFirmayaGir(\''+esc(f.id)+'\')">Firmaya Gir →</button>'+(yazabilir()?'<button class="btn-modern" type="button" onclick="fdSiparisFirmaFormuAc(\''+esc(f.id)+'\')">Düzenle</button><button class="btn-modern danger" type="button" onclick="fdSiparisFirmaSil(\''+esc(f.id)+'\')">Sil</button>':'')+'</div></article>'}).join('')||'<div class="fd-siparis-firma-empty"><strong>Firma kaydı bulunmuyor.</strong><span>Sipariş girebilmek için önce firma kaydı oluşturun.</span>'+(yazabilir()?'<button class="btn-submit" type="button" onclick="fdSiparisFirmaFormuAc()">+ İlk Firmayı Ekle</button>':'')+'</div>';const bilgi=el('fdSiparisFirmaSonuc');if(bilgi)bilgi.textContent=liste.length+' firma'}
function firmaMatrisVerisi(){
fdOrderAssert(false);
const tamamlananGoster=Boolean(uygulamaAyarlari?.siparisTamamlananlariGoster),tum=firmaUrunleri(seciliFirmaId).map(u=>{
fdOrderAssert(false);
const sip=kayitlar.filter(k=>k.urunId===u.id&&!k.iptal&&(tamamlananGoster||kalan(k)>.0001)),siparisToplam=sip.reduce((t,k)=>t+Number(k.siparisMiktari||0),0),teslimToplam=sip.reduce((t,k)=>t+teslimToplami(k),0);return{u,sip,siparisToplam,teslimToplam,kalan:Math.max(0,siparisToplam-teslimToplam)}}),liste=tum.filter(x=>x.sip.length&&(tamamlananGoster||x.kalan>.0001)),siparisTarihleri=[...new Set(liste.flatMap(x=>x.sip.map(k=>k.siparisTarihi).filter(Boolean)))].sort(),teslimatTarihleri=[...new Set(liste.flatMap(x=>x.sip.flatMap(k=>k.teslimatlar.map(t=>t.tarih).filter(Boolean))))].sort();return{liste,siparisTarihleri,teslimatTarihleri,tamamlananGoster}}
function urunKartlariCiz(){
fdOrderAssert(false);
const alan=el('fdSiparisUrunKartlari'),baslik=el('fdSiparisUrunBaslik');if(!alan||!baslik)return;const{liste,siparisTarihleri,teslimatTarihleri,tamamlananGoster}=firmaMatrisVerisi(),tarihBaslik=d=>'<th class="fd-siparis-matrix-date"><span>'+tarih(d)+'</span></th>';baslik.innerHTML='<tr><th rowspan="2" class="fd-siparis-matrix-product">Ürünler</th><th colspan="'+(siparisTarihleri.length+1)+'" class="fd-siparis-matrix-group siparis">Siparişler</th><th colspan="'+(teslimatTarihleri.length+1)+'" class="fd-siparis-matrix-group teslimat">Teslimatlar</th><th rowspan="2" class="fd-siparis-matrix-remaining">Kalan</th></tr><tr>'+siparisTarihleri.map(tarihBaslik).join('')+'<th class="fd-siparis-matrix-total">Toplam</th>'+teslimatTarihleri.map(tarihBaslik).join('')+'<th class="fd-siparis-matrix-total">Toplam</th></tr>';alan.innerHTML=liste.map(x=>{
fdOrderAssert(false);
const siparisHucreleri=siparisTarihleri.map(d=>{
fdOrderAssert(false);
const n=x.sip.filter(k=>k.siparisTarihi===d).reduce((t,k)=>t+Number(k.siparisMiktari||0),0);return'<td data-label="Sipariş '+tarih(d)+'">'+(n?'<strong>'+miktar(n)+'</strong>':'')+'</td>'}).join(''),teslimHucreleri=teslimatTarihleri.map(d=>{
fdOrderAssert(false);
const n=x.sip.flatMap(k=>k.teslimatlar).filter(t=>t.tarih===d).reduce((t,k)=>t+Number(k.miktar||0),0);return'<td data-label="Teslimat '+tarih(d)+'">'+(n?'<strong>'+miktar(n)+'</strong>':'')+'</td>'}).join('');return'<tr><td data-label="Ürün"><button class="fd-siparis-product-link" type="button" title="Sipariş ve teslimat detaylarını aç" onclick="fdSiparisUruneGir(\''+esc(x.u.id)+'\')"><span>'+esc(x.u.ad)+'</span></button></td>'+siparisHucreleri+'<td data-label="Sipariş Toplam"><strong>'+miktar(x.siparisToplam)+'</strong></td>'+teslimHucreleri+'<td data-label="Teslimat Toplam"><strong>'+miktar(x.teslimToplam)+'</strong></td><td data-label="Kalan" class="fd-siparis-matrix-kalan"><strong>'+miktar(x.kalan)+'</strong><small>'+esc(x.u.birim)+'</small></td></tr>'}).join('')||'<tr><td colspan="'+(siparisTarihleri.length+teslimatTarihleri.length+4)+'"><div class="fd-siparis-empty"><strong>'+esc(tamamlananGoster?'Sipariş kaydı bulunmuyor.':'Açık sipariş bulunmuyor.')+'</strong><br>'+(tamamlananGoster?'Bu firmaya ait ürün ve sipariş kaydı bulunamadı.':'Tamamı teslim edilmiş ürünler ana tablodan kaldırıldı. Geçmiş kayıtları ürün detayından görebilirsiniz.')+'</div></td></tr>';const bilgi=el('fdSiparisUrunSonuc');if(bilgi)bilgi.textContent=liste.length+(tamamlananGoster?' ürün · tamamlananlar dahil':' açık ürün · tamamlananlar gösterilmiyor')}
function teslimatOzet(k){
fdOrderAssert(false);
if(!k.teslimatlar.length)return'<span class="fd-siparis-muted">Teslimat yok</span>';const son=k.teslimatlar[k.teslimatlar.length-1];return'<strong>'+miktar(teslimToplami(k))+' '+esc(k.birim)+'</strong><small>Son: '+tarih(son.tarih)+'</small>'}
function teslimatPaneliCiz(){
fdOrderAssert(false);
const body=el('fdSiparisTeslimatBody'),u=seciliUrun(),top=urunToplamlari(),gruplar=filtreliTeslimatGruplari(),gosterilen=gruplar.reduce((t,x)=>t+Number(x.miktar||0),0);if(!body)return;if(!u){body.innerHTML='';return}el('fdSiparisTeslimatPanelBaslik').textContent='Teslimat Geçmişi';el('fdSiparisTeslimatPanelBilgi').textContent=(tarihBaslangic||tarihBitis?'Gösterilen ':'Toplam ')+miktar(tarihBaslangic||tarihBitis?gosterilen:top.teslim)+' '+u.birim+' teslim edildi';const ekle=el('fdSiparisPanelTeslimatEkle');if(ekle)ekle.style.display=yazabilir()&&top.kalan>.0001?'':'none';body.innerHTML=gruplar.map(t=>'<tr><td data-label="Teslim Tarihi"><strong>'+tarih(t.tarih)+'</strong></td><td data-label="Miktar"><strong>'+miktar(t.miktar)+' '+esc(u.birim)+'</strong></td><td data-label="İrsaliye">'+esc(t.irsaliyeNo||'-')+'</td><td data-label="Açıklama">'+esc(t.aciklama||'-')+'</td><td data-label="İşlem">'+(yazabilir()?'<div class="fd-siparis-actions"><button type="button" onclick="fdSiparisTeslimatDuzenle(\''+esc(t.id)+'\')">Düzenle</button><button type="button" class="danger" onclick="fdSiparisTeslimatSil(\''+esc(t.id)+'\')">Sil</button></div>':'')+'</td></tr>').join('')||'<tr><td colspan="5"><div class="fd-siparis-empty">'+(tarihBaslangic||tarihBitis?'Seçilen tarih aralığında teslimat bulunmuyor.':'Bu ürüne henüz teslimat girilmedi.')+'</div></td></tr>'}
function siparisSekmeleriniUygula(){
fdOrderAssert(false);
const siparisPanel=el('fdSiparisSiparisPaneli'),teslimatPanel=el('fdSiparisTeslimatBolumu'),siparisSayisi=filtreli().length,teslimatSayisi=filtreliTeslimatGruplari().length;if(siparisPanel)siparisPanel.style.display='block';if(teslimatPanel)teslimatPanel.style.display='block';if(el('fdSiparisSiparisSayisi'))el('fdSiparisSiparisSayisi').textContent=siparisSayisi+' kayıt';if(el('fdSiparisTeslimatSayisi'))el('fdSiparisTeslimatSayisi').textContent=teslimatSayisi+' kayıt'}
const fdSiparisSekmeAc=()=>{fdOrderAssert(false);return siparisSekmeleriniUygula()};
function tabloCiz(){
fdOrderAssert(false);
const liste=filtreli(),body=el('fdSiparisBody');if(!body)return;if(!liste.some(k=>k.id===seciliSiparisId))seciliSiparisId=liste[0]?.id||'';body.innerHTML=liste.map(k=>{
fdOrderAssert(false);
const d=durum(k),secili=k.id===seciliSiparisId?' secili':'';return'<tr class="fd-siparis-row'+secili+'"><td data-label="Sipariş"><strong>'+esc(k.siparisNo)+'</strong><small>'+tarih(k.siparisTarihi)+'</small></td><td data-label="Açıklama"><strong>'+esc(k.aciklama||'-')+'</strong><small>'+esc(k.not||'')+'</small></td><td data-label="Sipariş">'+miktar(k.siparisMiktari)+' '+esc(k.birim)+'</td><td data-label="Teslim" class="fd-siparis-teslim">'+teslimatOzet(k)+'</td><td data-label="Kalan"><strong>'+miktar(kalan(k))+' '+esc(k.birim)+'</strong></td><td data-label="Termin / Durum">'+tarih(k.terminTarihi)+'<small><span class="fd-siparis-status '+d.kod+'">'+esc(d.ad)+'</span></small></td><td data-label="İşlem"><div class="fd-siparis-actions"><button type="button" class="fd-siparis-delivery-open" onclick="fdSiparisTeslimatlariGoster(\''+esc(k.id)+'\')">Teslimatlar</button>'+(yazabilir()?'<button type="button" title="Düzenle" onclick="fdSiparisDuzenle(\''+esc(k.id)+'\')">Düzenle</button><button type="button" class="danger" title="Sil" onclick="fdSiparisSil(\''+esc(k.id)+'\')">Sil</button>':'')+'</div></td></tr>'}).join('')||'<tr><td colspan="7"><div class="fd-siparis-empty">Bu ürüne ait sipariş kaydı bulunmuyor.</div></td></tr>';teslimatPaneliCiz();ozetCiz();siparisSekmeleriniUygula();yazmaDurumu()}
function ciz(){
fdOrderAssert(false);
const firmaG=el('fdSiparisFirmaGorunumu'),detayG=el('fdSiparisDetayGorunumu'),urunG=el('fdSiparisUrunGorunumu'),urunDetayG=el('fdSiparisUrunDetayGorunumu'),firmaBaslik=el('fdSiparisFirmaBaglamBasligi'),f=seciliFirma(),u=seciliUrun();if(!firmaG||!detayG)return;firmaG.style.display=f?'none':'block';detayG.style.display=f?'block':'none';el('fdSiparisCiktiAraclari').style.display=f?'flex':'none';if(!f){firmaKartlariCiz();yazmaDurumu();return}el('fdSiparisDetayFirmaAdi').textContent=f.ad;el('fdSiparisDetayFirmaBilgi').textContent=[f.yetkili,f.telefon,f.eposta].filter(Boolean).join(' · ')||'Firma iletişim bilgisi eklenmedi.';if(firmaBaslik)firmaBaslik.style.display=u?'none':'flex';urunG.style.display=u?'none':'block';urunDetayG.style.display=u?'block':'none';if(!u){urunKartlariCiz();yazmaDurumu();return}el('fdSiparisCalismaFirma').textContent=f.ad;el('fdSiparisSeciliUrunAdi').textContent=u.ad;el('fdSiparisSeciliUrunBilgi').textContent=u.birim+(u.aciklama?' · '+u.aciklama:'');tabloCiz();const bilgi=el('fdSiparisSonucBilgi'),l=filtreli();if(bilgi)bilgi.textContent=l.length+' sipariş gösteriliyor'}
function yazmaDurumu(){
fdOrderAssert(false);
const y=yazabilir();document.querySelectorAll('#fdSiparisApp [data-siparis-write]').forEach(n=>n.style.display=y?'':'none');const form=el('fdSiparisYeniForm');if(form)form.classList.toggle('readonly',!y)}
function formTemizle(){
fdOrderAssert(false);
duzenlenenId='';el('fdSiparisYeniForm').reset();el('fdSiparisTarih').value=bugun();el('fdSiparisFormBaslik').textContent='Yeni Sipariş Girişi';el('fdSiparisKaydetBtn').textContent='Siparişi Ekle';el('fdSiparisIptal').checked=false;el('fdSiparisDuzenIptalBtn').style.display='none'}
function formVerisi(){
fdOrderAssert(false);
const f=seciliFirma(),u=seciliUrun(),miktarDeger=sayi(el('fdSiparisMiktar').value);if(!f)throw new Error('Önce firma seçin.');if(!u)throw new Error('Önce ürün seçin.');if(!temiz(el('fdSiparisNo').value))throw new Error('Sipariş numarasını girin.');if(!(miktarDeger>0))throw new Error('Sipariş miktarı sıfırdan büyük olmalı.');return{firmaId:f.id,firma:f.ad,urunId:u.id,urun:u.ad,birim:u.birim,siparisTuru:'satis',siparisNo:trBuyuk(el('fdSiparisNo').value),siparisTarihi:el('fdSiparisTarih').value||bugun(),aciklama:temiz(el('fdSiparisAciklama').value),siparisMiktari:miktarDeger,terminTarihi:el('fdSiparisTermin').value,not:temiz(el('fdSiparisNot').value),iptal:el('fdSiparisIptal').checked}}
const fdSiparisKaydet=async event=>{
try{
fdOrderAssert(true);
event.preventDefault();if(!yazabilir()||yukleniyor)return;const buton=event.submitter||el('fdSiparisKaydetBtn');try{const veri=formVerisi(),mevcut=kayitlar.find(k=>k.id===duzenlenenId),ayni=kayitlar.find(k=>k.id!==duzenlenenId&&k.urunId===veri.urunId&&anahtar(k.siparisNo)===anahtar(veri.siparisNo));if(ayni)throw new Error('Bu ürün ve sipariş numarası için zaten bir kayıt bulunuyor. Mevcut siparişi düzenleyin.');yukleniyor=true;buton.disabled=true;buton.textContent='Kaydediliyor...';const kayit=await fdOrderAwait(kaydet({...mevcut,...veri,id:mevcut?.id||yeniId(),teslimatlar:mevcut?.teslimatlar||[],olusturmaTarihi:mevcut?.olusturmaTarihi||new Date().toISOString()}));seciliSiparisId=kayit.id;aktifSiparisSekme='siparisler';modalKapat('fdSiparisFormModal');formTemizle();ciz();showToast?.('Sipariş kaydedildi.','success')}catch(e){
if(!fdOrderValid())return;
alert('Sipariş kaydedilemedi: '+hataMetni(e))}finally{
if(fdOrderValid()){
yukleniyor=false;buton.disabled=false;buton.textContent=duzenlenenId?'Değişiklikleri Kaydet':'Siparişi Ekle'
}
}
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
};
const fdSiparisYeniFormuAc=()=>{
fdOrderAssert(true);
if(!yazabilir()||!seciliUrun())return;formTemizle();el('fdSiparisFormModal').style.display='flex'};
const fdSiparisDuzenle=id=>{
fdOrderAssert(true);
if(!yazabilir())return;const k=kayitlar.find(x=>x.id===String(id));if(!k)return;duzenlenenId=k.id;el('fdSiparisNo').value=k.siparisNo;el('fdSiparisTarih').value=k.siparisTarihi;el('fdSiparisAciklama').value=k.aciklama;el('fdSiparisMiktar').value=String(k.siparisMiktari).replace('.',',');el('fdSiparisTermin').value=k.terminTarihi;el('fdSiparisNot').value=k.not;el('fdSiparisIptal').checked=k.iptal;el('fdSiparisFormBaslik').textContent='Siparişi Düzenle';el('fdSiparisKaydetBtn').textContent='Değişiklikleri Kaydet';el('fdSiparisDuzenIptalBtn').style.display='';el('fdSiparisFormModal').style.display='flex'};
const fdSiparisFormIptal=()=>{
fdOrderAssert(false);
modalKapat('fdSiparisFormModal');formTemizle()};
const fdSiparisSil=async id=>{
try{
fdOrderAssert(true);
if(!yazabilir())return;const k=kayitlar.find(x=>x.id===String(id));if(!k||!confirm(k.firma+' · '+k.urun+' sipariş satırı ve bütün teslimat geçmişi silinsin mi?'))return;showGlobalOverlay?.('Sipariş siliniyor','Sipariş ve teslimat geçmişi kaldırılıyor...');try{await fdOrderAwait(sil(k.id));if(seciliSiparisId===k.id)seciliSiparisId='';ciz();showToast?.('Sipariş satırı silindi.','success')}catch(e){
if(!fdOrderValid())return;
alert('Sipariş silinemedi: '+(e.message||e))}finally{
if(fdOrderValid()){
hideGlobalOverlay?.()
}
}
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
};
const fdSiparisSatirAc=id=>{
fdOrderAssert(false);
const s=String(id);acikSatirlar.has(s)?acikSatirlar.delete(s):acikSatirlar.add(s);tabloCiz()};
const fdSiparisFirmayaGir=id=>{
fdOrderAssert(false);
const f=firmaKayitlari.find(x=>x.id===String(id));if(!f)return;seciliFirmaId=f.id;seciliUrunId='';seciliSiparisId='';arama='';durumFiltre='';turFiltre='';tarihBaslangic='';tarihBitis='';acikSatirlar.clear();formTemizle();ciz();el('fdSiparisApp')?.scrollIntoView({block:'start'})};
const fdSiparisFirmalaraDon=()=>{
fdOrderAssert(false);
seciliFirmaId='';seciliUrunId='';seciliSiparisId='';duzenlenenId='';tarihBaslangic='';tarihBitis='';acikSatirlar.clear();ciz();el('fdSiparisApp')?.scrollIntoView({block:'start'})};
const fdSiparisUruneGir=id=>{
fdOrderAssert(false);
const u=urunKayitlari.find(x=>x.id===String(id)&&x.firmaId===seciliFirmaId);if(!u)return;seciliUrunId=u.id;seciliSiparisId='';aktifSiparisSekme='siparisler';arama='';durumFiltre='';turFiltre='';const gun=Math.max(0,Number(uygulamaAyarlari?.siparisDetayVarsayilanGun||0)),bugunTarih=bugun();tarihBitis=gun?bugunTarih:'';if(gun){const bas=new Date(bugunTarih+'T12:00:00');bas.setDate(bas.getDate()-gun+1);tarihBaslangic=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(bas)}else tarihBaslangic='';formTemizle();if(el('fdSiparisAra'))el('fdSiparisAra').value='';if(el('fdSiparisDurumFiltre'))el('fdSiparisDurumFiltre').value='';if(el('fdSiparisTurFiltre'))el('fdSiparisTurFiltre').value='';if(el('fdSiparisTarihBaslangic'))el('fdSiparisTarihBaslangic').value=tarihBaslangic;if(el('fdSiparisTarihBitis'))el('fdSiparisTarihBitis').value=tarihBitis;ciz();el('fdSiparisApp')?.scrollIntoView({block:'start'})};
const fdSiparisUrunlereDon=()=>{
fdOrderAssert(false);
seciliUrunId='';seciliSiparisId='';duzenlenenId='';tarihBaslangic='';tarihBitis='';ciz();el('fdSiparisApp')?.scrollIntoView({block:'start'})};
const fdSiparisTeslimatlariGoster=id=>{
fdOrderAssert(false);
const k=kayitlar.find(x=>x.id===String(id)&&x.urunId===seciliUrunId);if(!k)return;seciliSiparisId=k.id;tabloCiz();el('fdSiparisTeslimatBolumu')?.scrollIntoView({behavior:'smooth',block:'start'})};
const fdSiparisSeciliUrunDuzenle=()=>{
fdOrderAssert(true);
if(seciliUrunId)window.fdSiparisUrunFormuAc(seciliUrunId)};
const fdSiparisSeciliFirmaDuzenle=()=>{
fdOrderAssert(true);
if(seciliFirmaId)window.fdSiparisFirmaFormuAc(seciliFirmaId)};
const fdSiparisFirmaAra=v=>{
fdOrderAssert(false);
firmaArama=String(v||'');firmaKartlariCiz()};
const fdSiparisFiltrele=()=>{
fdOrderAssert(false);
durumFiltre=el('fdSiparisDurumFiltre').value;turFiltre='';arama=el('fdSiparisAra').value;ciz()};
const fdSiparisTarihFiltrele=()=>{
fdOrderAssert(false);
let baslangic=el('fdSiparisTarihBaslangic')?.value||'',bitis=el('fdSiparisTarihBitis')?.value||'';if(baslangic&&bitis&&baslangic>bitis){bitis=baslangic;el('fdSiparisTarihBitis').value=bitis}tarihBaslangic=baslangic;tarihBitis=bitis;tabloCiz();const bilgi=el('fdSiparisSonucBilgi'),l=filtreli();if(bilgi)bilgi.textContent=l.length+' sipariş gösteriliyor'};
const fdSiparisTarihTemizle=()=>{
fdOrderAssert(false);
tarihBaslangic='';tarihBitis='';if(el('fdSiparisTarihBaslangic'))el('fdSiparisTarihBaslangic').value='';if(el('fdSiparisTarihBitis'))el('fdSiparisTarihBitis').value='';tabloCiz();const bilgi=el('fdSiparisSonucBilgi'),l=filtreli();if(bilgi)bilgi.textContent=l.length+' sipariş gösteriliyor'};
const fdSiparisFirmaFormuAc=id=>{
fdOrderAssert(true);
if(!yazabilir())return;const f=firmaKayitlari.find(x=>x.id===String(id));duzenlenenFirmaId=f?.id||'';el('fdSiparisFirmaForm').reset();el('fdSiparisFirmaModalBaslik').textContent=f?'Firma Kaydını Düzenle':'Yeni Firma Kaydı';el('fdSiparisFirmaAd').value=f?.ad||'';el('fdSiparisFirmaYetkili').value=f?.yetkili||'';el('fdSiparisFirmaTelefon').value=f?.telefon||'';el('fdSiparisFirmaEposta').value=f?.eposta||'';el('fdSiparisFirmaNot').value=f?.not||'';el('fdSiparisFirmaModal').style.display='flex'};
const fdSiparisFirmaKaydet=async event=>{
try{
fdOrderAssert(true);
event.preventDefault();if(yukleniyor)return;const buton=event.submitter,ad=trBuyuk(el('fdSiparisFirmaAd').value);if(!ad)return alert('Firma adını girin.');const ayni=firmaKayitlari.find(f=>f.id!==duzenlenenFirmaId&&anahtar(f.ad)===anahtar(ad));if(ayni)return alert('Bu firma zaten kayıtlı.');const mevcut=firmaKayitlari.find(f=>f.id===duzenlenenFirmaId);try{yukleniyor=true;buton.disabled=true;buton.textContent='Kaydediliyor...';const f=await fdOrderAwait(firmaKaydet({...mevcut,id:mevcut?.id||yeniId('siparis-firma'),ad,yetkili:el('fdSiparisFirmaYetkili').value,telefon:el('fdSiparisFirmaTelefon').value,eposta:el('fdSiparisFirmaEposta').value,not:el('fdSiparisFirmaNot').value}));modalKapat('fdSiparisFirmaModal');duzenlenenFirmaId='';if(seciliFirmaId===f.id)seciliFirmaId=f.id;ciz();showToast?.('Firma kaydı kaydedildi.','success')}catch(e){
if(!fdOrderValid())return;
alert('Firma kaydedilemedi: '+hataMetni(e))}finally{
if(fdOrderValid()){
yukleniyor=false;buton.disabled=false;buton.textContent='Firma Kaydını Kaydet'
}
}
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
};
const fdSiparisFirmaSil=async id=>{
try{
fdOrderAssert(true);
if(!yazabilir())return;const f=firmaKayitlari.find(x=>x.id===String(id));if(!f)return;if(firmaSiparisleri(f.id).length||firmaUrunleri(f.id).length)return alert('Bu firmaya bağlı ürün veya siparişler var. Önce firmanın içine girip kayıtları silin.');if(!confirm(f.ad+' firma kaydı silinsin mi?'))return;showGlobalOverlay?.('Firma siliniyor','Firma kaydı kaldırılıyor...');try{if(!f.miras){const{error}=await fdOrderAwait(supabaseClient.from('portal_records').delete().eq('company_id',sirketId()).eq('module',MODUL).eq('legacy_id',f.id));if(error)throw error}firmaKayitlari=firmaKayitlari.filter(x=>x.id!==f.id);ciz();showToast?.('Firma kaydı silindi.','success')}catch(e){
if(!fdOrderValid())return;
alert('Firma silinemedi: '+hataMetni(e))}finally{
if(fdOrderValid()){
hideGlobalOverlay?.()
}
}
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
};
const fdSiparisUrunFormuAc=id=>{
fdOrderAssert(true);
if(!yazabilir()||!seciliFirmaId)return;const u=urunKayitlari.find(x=>x.id===String(id));duzenlenenUrunId=u?.id||'';el('fdSiparisUrunForm').reset();el('fdSiparisUrunModalBaslik').textContent=u?'Ürün Kartını Düzenle':'Yeni Ürün Kartı';el('fdSiparisUrunAd').value=u?.ad||'';el('fdSiparisUrunBirim').value=u?.birim||varsayilanBirim();el('fdSiparisUrunAciklama').value=u?.aciklama||'';el('fdSiparisUrunModal').style.display='flex'};
const fdSiparisUrunKaydet=async event=>{
try{
fdOrderAssert(true);
event.preventDefault();if(yukleniyor)return;const buton=event.submitter,ad=trBuyuk(el('fdSiparisUrunAd').value),birim=trBuyuk(el('fdSiparisUrunBirim').value||varsayilanBirim());if(!ad)return alert('Ürün adını girin.');const ayni=urunKayitlari.find(u=>u.id!==duzenlenenUrunId&&u.firmaId===seciliFirmaId&&anahtar(u.ad)===anahtar(ad));if(ayni)return alert('Bu ürün firmada zaten kayıtlı.');const mevcut=urunKayitlari.find(u=>u.id===duzenlenenUrunId);try{yukleniyor=true;buton.disabled=true;buton.textContent='Kaydediliyor...';const u=await fdOrderAwait(urunKaydet({...mevcut,id:mevcut?.id||yeniId('siparis-urun'),firmaId:seciliFirmaId,ad,birim,aciklama:el('fdSiparisUrunAciklama').value}));modalKapat('fdSiparisUrunModal');duzenlenenUrunId='';if(seciliUrunId===u.id)seciliUrunId=u.id;ciz();showToast?.('Ürün kartı kaydedildi.','success')}catch(e){
if(!fdOrderValid())return;
alert('Ürün kaydedilemedi: '+hataMetni(e))}finally{
if(fdOrderValid()){
yukleniyor=false;buton.disabled=false;buton.textContent='Ürün Kartını Kaydet'
}
}
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
};
const fdSiparisUrunSil=async id=>{
try{
fdOrderAssert(true);
if(!yazabilir())return;const u=urunKayitlari.find(x=>x.id===String(id));if(!u)return;if(kayitlar.some(k=>k.urunId===u.id))return alert('Bu ürüne bağlı siparişler var. Önce ürünün içindeki siparişleri silin.');if(!confirm(u.ad+' ürün kartı silinsin mi?'))return;showGlobalOverlay?.('Ürün siliniyor','Ürün kartı kaldırılıyor...');try{if(!u.miras){const{error}=await fdOrderAwait(supabaseClient.from('portal_records').delete().eq('company_id',sirketId()).eq('module',MODUL).eq('legacy_id',u.id));if(error)throw error}urunKayitlari=urunKayitlari.filter(x=>x.id!==u.id);if(seciliUrunId===u.id)seciliUrunId='';ciz();showToast?.('Ürün kartı silindi.','success')}catch(e){
if(!fdOrderValid())return;
alert('Ürün silinemedi: '+hataMetni(e))}finally{
if(fdOrderValid()){
hideGlobalOverlay?.()
}
}
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
};
function teslimatiSiparislereDagit(grupId,veri,tercihSiparisId=''){
fdOrderAssert(false);
const tum=urunSiparisleri().filter(k=>!k.iptal),temizlenmis=tum.map(k=>({...k,teslimatlar:k.teslimatlar.filter(t=>String(t.grupId||t.id)!==String(grupId))})),sirali=temizlenmis.slice().sort((a,b)=>a.id===tercihSiparisId?-1:b.id===tercihSiparisId?1:String(a.siparisTarihi).localeCompare(String(b.siparisTarihi))),sonuc=new Map(temizlenmis.map(k=>[k.id,k])),kalanMiktar=Number(veri.miktar||0);let dagitilacak=kalanMiktar;sirali.forEach(k=>{
fdOrderAssert(false);
if(dagitilacak<=.0001)return;const kapasite=Math.max(0,Number(k.siparisMiktari||0)-teslimToplami(k)),pay=Math.min(kapasite,dagitilacak);if(pay>.0001){const satir=sonuc.get(k.id);satir.teslimatlar=satir.teslimatlar.concat(teslimatDuzelt({...veri,id:yeniId('teslimat'),grupId,miktar:pay}));dagitilacak-=pay}});if(dagitilacak>.0001)throw new Error('Teslimat miktarı ürünün toplam kalan miktarını aşıyor.');return[...sonuc.values()]}
const fdSiparisTeslimatAc=(kayitId='',teslimatGrupId='')=>{
fdOrderAssert(true);
if(!yazabilir())return;const top=urunToplamlari(),k=kayitlar.find(x=>x.id===String(kayitId||seciliSiparisId))||top.siparisler[0],grup=urunTeslimatGruplari().find(x=>x.id===String(teslimatGrupId));if(!k||!seciliUrun())return alert('Teslimat eklenecek ürün siparişi bulunamadı. Listeyi yenileyip tekrar deneyin.');teslimatSiparisId=k.id;seciliSiparisId=k.id;const form=el('fdSiparisTeslimatForm');form.reset();form.dataset.siparisId=k.id;el('fdSiparisTeslimatKayitId').value=k.id;el('fdSiparisTeslimatId').value=grup?.id||'';el('fdSiparisTeslimatTarih').value=grup?.tarih||bugun();el('fdSiparisTeslimatMiktar').value=grup?String(grup.miktar).replace('.',','):String(top.kalan).replace('.',',');el('fdSiparisTeslimatIrsaliye').value=grup?.irsaliyeNo||'';el('fdSiparisTeslimatAciklama').value=grup?.aciklama||'';el('fdSiparisTeslimatBaslik').textContent=(grup?'Teslimatı Düzenle':'Teslimat Ekle')+' · '+seciliUrun().ad;el('fdSiparisTeslimatBilgi').textContent='Toplam sipariş '+miktar(top.siparis)+' '+seciliUrun().birim+' · Kaydedilebilir '+miktar(top.kalan+Number(grup?.miktar||0))+' '+seciliUrun().birim;el('fdSiparisTeslimatModal').style.display='flex'};
const fdSiparisTeslimatDuzenle=grupId=>{fdOrderAssert(true);return window.fdSiparisTeslimatAc('',grupId)};
const fdSiparisTeslimatKaydet=async event=>{
try{
fdOrderAssert(true);
event.preventDefault();if(yukleniyor)return;const form=event.currentTarget,buton=event.submitter||form.querySelector('button[type="submit"]'),tercihId=String(teslimatSiparisId||form.dataset.siparisId||el('fdSiparisTeslimatKayitId').value||''),grupId=el('fdSiparisTeslimatId').value,eski=urunTeslimatGruplari().find(x=>x.id===grupId),m=sayi(el('fdSiparisTeslimatMiktar').value),top=urunToplamlari();if(!urunSiparisleri().some(k=>k.id===tercihId))return alert('Sipariş kayıtları yenilenmiş. Teslimat penceresini kapatıp tekrar deneyin.');if(!(m>0))return alert('Teslim edilen miktar sıfırdan büyük olmalı.');const azami=top.kalan+Number(eski?.miktar||0);if(m>azami+.0001)return alert('Teslimat miktarı toplam kalan '+miktar(azami)+' '+seciliUrun().birim+' miktarını aşamaz.');const yeniGrupId=eski?.id||yeniId('teslimat-grup'),veri={tarih:el('fdSiparisTeslimatTarih').value||bugun(),miktar:m,irsaliyeNo:el('fdSiparisTeslimatIrsaliye').value,aciklama:el('fdSiparisTeslimatAciklama').value};try{yukleniyor=true;buton.disabled=true;buton.textContent='Kaydediliyor...';const guncellenen=teslimatiSiparislereDagit(yeniGrupId,veri,tercihId);await fdOrderAwait(siparisleriKaydet(guncellenen));seciliSiparisId=tercihId;aktifSiparisSekme='teslimatlar';teslimatSiparisId='';form.dataset.siparisId='';modalKapat('fdSiparisTeslimatModal');ciz();showToast?.(miktar(m)+' '+seciliUrun().birim+' teslimat kaydedildi; ürün toplamı güncellendi.','success')}catch(e){
if(!fdOrderValid())return;
alert('Teslimat kaydedilemedi: '+hataMetni(e))}finally{
if(fdOrderValid()){
yukleniyor=false;buton.disabled=false;buton.textContent='Teslimatı Kaydet'
}
}
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
};
const fdSiparisTeslimatSil=async grupId=>{
try{
fdOrderAssert(true);
if(!yazabilir())return;const grup=urunTeslimatGruplari().find(x=>x.id===String(grupId)),u=seciliUrun();if(!grup||!u||!confirm(tarih(grup.tarih)+' tarihli '+miktar(grup.miktar)+' '+u.birim+' teslimat silinsin mi?'))return;showGlobalOverlay?.('Teslimat siliniyor','Ürün ve sipariş toplamları yeniden hesaplanıyor...');try{const guncellenen=urunSiparisleri().map(k=>({...k,teslimatlar:k.teslimatlar.filter(t=>String(t.grupId||t.id)!==grup.id)}));await fdOrderAwait(siparisleriKaydet(guncellenen));ciz();showToast?.('Teslimat silindi; ürün toplamı güncellendi.','success')}catch(e){
if(!fdOrderValid())return;
alert('Teslimat silinemedi: '+hataMetni(e))}finally{
if(fdOrderValid()){
hideGlobalOverlay?.()
}
}
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
};
function raporVerisi(){
fdOrderAssert(false);
return filtreli().map(k=>{
fdOrderAssert(false);
const d=durum(k);return[k.firma,k.siparisNo,tarih(k.siparisTarihi),k.urun,k.aciklama,k.birim,Number(k.siparisMiktari),teslimToplami(k),kalan(k),tarih(k.terminTarihi),d.ad,k.teslimatlar.map(t=>tarih(t.tarih)+' · '+miktar(t.miktar)+' '+k.birim+(t.irsaliyeNo?' · '+t.irsaliyeNo:'')).join(' | '),k.not]})}
const raporBasliklari=['Firma','Sipariş No','Sipariş Tarihi','Ürün','Açıklama','Birim','Sipariş','Teslim','Kalan','Termin','Durum','Teslimat Geçmişi','Not'];
function raporTablosu(){
fdOrderAssert(false);
const alan=document.createElement('div'),satirlar=raporVerisi();alan.innerHTML='<table class="fd-siparis-export-table"><thead><tr>'+raporBasliklari.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+satirlar.map(s=>'<tr>'+s.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';return alan.querySelector('table')}
function matrisRaporVerisi(){
fdOrderAssert(false);
const{liste,siparisTarihleri,teslimatTarihleri}=firmaMatrisVerisi(),satirlar=liste.map(x=>[x.u.ad,...siparisTarihleri.map(d=>x.sip.filter(k=>k.siparisTarihi===d).reduce((t,k)=>t+Number(k.siparisMiktari||0),0)||''),x.siparisToplam,...teslimatTarihleri.map(d=>x.sip.flatMap(k=>k.teslimatlar).filter(t=>t.tarih===d).reduce((t,k)=>t+Number(k.miktar||0),0)||''),x.teslimToplam,miktar(x.kalan)+' '+x.u.birim]);return{liste,siparisTarihleri,teslimatTarihleri,satirlar}}
function matrisRaporTablosu(){
fdOrderAssert(false);
const{siparisTarihleri,teslimatTarihleri,satirlar}=matrisRaporVerisi(),alan=document.createElement('div'),siparisAlt=siparisTarihleri.map(d=>'<th>'+tarih(d)+'</th>').join(''),teslimatAlt=teslimatTarihleri.map(d=>'<th>'+tarih(d)+'</th>').join('');alan.innerHTML='<table class="fd-siparis-export-table"><thead><tr><th rowspan="2">Ürünler</th><th colspan="'+(siparisTarihleri.length+1)+'">Siparişler</th><th colspan="'+(teslimatTarihleri.length+1)+'">Teslimatlar</th><th rowspan="2">Kalan</th></tr><tr>'+siparisAlt+'<th>Toplam</th>'+teslimatAlt+'<th>Toplam</th></tr></thead><tbody>'+satirlar.map(s=>'<tr>'+s.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';return alan.querySelector('table')}
const aktifRaporTablosu=()=>seciliUrun()?raporTablosu():matrisRaporTablosu();
const aktifRaporKaydiVar=()=>seciliUrun()?filtreli().length:firmaMatrisVerisi().liste.length;
function ciktiAdi(uzanti){
fdOrderAssert(false);
return'Siparis_Takip_'+[seciliFirma()?.ad,seciliUrun()?.ad].filter(Boolean).join('_').replace(/[^\p{L}\p{N}]+/gu,'_')+'_'+bugun()+'.'+uzanti}
const fdSiparisExcel=()=>{
fdOrderAssert(false);
if(!aktifRaporKaydiVar())return alert('Excel için açık sipariş kaydı bulunmuyor.');if(typeof XLSX==='undefined')return alert('Excel bileşeni yüklenemedi.');const wb=XLSX.utils.book_new();if(!seciliUrun()){const m=matrisRaporVerisi(),ilk=['Ürünler','Siparişler',...Array(m.siparisTarihleri.length).fill(''),'Teslimatlar',...Array(m.teslimatTarihleri.length).fill(''),'Kalan'],ikinci=['',...m.siparisTarihleri.map(tarih),'Toplam',...m.teslimatTarihleri.map(tarih),'Toplam',''],ws=XLSX.utils.aoa_to_sheet([ilk,ikinci,...m.satirlar]),siparisSon=1+m.siparisTarihleri.length,teslimBas=siparisSon+1,teslimSon=teslimBas+m.teslimatTarihleri.length,kalanSutun=teslimSon+1;ws['!merges']=[{s:{r:0,c:0},e:{r:1,c:0}},{s:{r:0,c:1},e:{r:0,c:siparisSon}},{s:{r:0,c:teslimBas},e:{r:0,c:teslimSon}},{s:{r:0,c:kalanSutun},e:{r:1,c:kalanSutun}}];ws['!cols']=[{wch:38},...Array(kalanSutun-1).fill({wch:14}),{wch:16}];ws['!freeze']={xSplit:1,ySplit:2};XLSX.utils.book_append_sheet(wb,ws,'Açık Siparişler');XLSX.writeFile(wb,ciktiAdi('xlsx'));return}const liste=filtreli(),ws=XLSX.utils.aoa_to_sheet([raporBasliklari,...raporVerisi()]);ws['!cols']=[25,18,15,30,35,12,14,14,14,15,18,55,35].map(w=>({wch:w}));ws['!freeze']={xSplit:0,ySplit:1};XLSX.utils.book_append_sheet(wb,ws,'Siparişler');const teslim=[['Firma','Sipariş No','Ürün','Teslim Tarihi','Miktar','Birim','İrsaliye No','Açıklama'],...liste.flatMap(k=>k.teslimatlar.map(t=>[k.firma,k.siparisNo,k.urun,t.tarih,Number(t.miktar),k.birim,t.irsaliyeNo,t.aciklama]))],ws2=XLSX.utils.aoa_to_sheet(teslim);ws2['!cols']=[25,18,30,15,14,12,20,40].map(w=>({wch:w}));XLSX.utils.book_append_sheet(wb,ws2,'Teslimatlar');XLSX.writeFile(wb,ciktiAdi('xlsx'))};
const fdSiparisPdf=()=>{
fdOrderAssert(false);
if(!aktifRaporKaydiVar())return alert('PDF için açık sipariş kaydı bulunmuyor.');const matris=!seciliUrun();return fdOrderScopedPdf?.(aktifRaporTablosu(),matris?'AÇIK SİPARİŞ VE TESLİMAT DURUMU':'SİPARİŞ VE TESLİMAT TAKİBİ',ciktiAdi('pdf'),{yon:'landscape',format:matris?'a4':'a3',genislik:matris?'277mm':'400mm',altBaslik:[seciliFirma()?.ad,seciliUrun()?.ad].filter(Boolean).join(' · ')})};
const fdSiparisGoruntu=async button=>{
try{
fdOrderAssert(false);
if(!aktifRaporKaydiVar())return alert('Görüntü için açık sipariş kaydı bulunmuyor.');const eski=button?.textContent||'📸 Görüntü Al',matris=!seciliUrun();try{if(button){button.disabled=true;button.textContent='Hazırlanıyor...'}const tablo=aktifRaporTablosu(),olcek=Math.min(2,15000/Math.max(tablo.scrollWidth,tablo.scrollHeight+80,1)),canvas=await fdOrderAwait(puantajCanvasOlustur(tablo,olcek,(matris?'AÇIK SİPARİŞ VE TESLİMAT DURUMU':'SİPARİŞ VE TESLİMAT TAKİBİ')+' — '+[seciliFirma()?.ad,seciliUrun()?.ad].filter(Boolean).join(' · '))),blob=await fdOrderAwait(new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Görüntü oluşturulamadı.')),'image/png')));if(!navigator.clipboard?.write||!window.ClipboardItem)throw new Error('Tarayıcı görüntüyü panoya kopyalamayı desteklemiyor.');await fdOrderAwait(navigator.clipboard.write([new ClipboardItem({'image/png':blob})]));showToast?.('Sipariş tablosunun tamamı panoya kopyalandı.','success')}catch(e){
if(!fdOrderValid())return;
alert('Tablo görüntüsü panoya kopyalanamadı: '+(e.message||e))}finally{
if(fdOrderValid()){
if(button){button.disabled=false;button.textContent=eski}
}
}
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
};
const fdSiparisYenile=async()=>{
try{
fdOrderAssert(false);
showGlobalOverlay?.('Siparişler yenileniyor','Firma, sipariş ve teslimat kayıtları alınıyor...');try{await fdOrderAwait(yukle());ciz();showToast?.('Sipariş kayıtları yenilendi.','success')}catch(e){
if(!fdOrderValid())return;
alert('Siparişler alınamadı: '+(e.message||e))}finally{
if(fdOrderValid()){
hideGlobalOverlay?.()
}
}
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
};
const openSiparisTakipApp=async function(){
try{
fdOrderAssert(false);
if(!anaMenuModulErisimiVar(MODUL))return;fdTumUygulamaAlanlariniGizle();el('fdSiparisApp').style.display='block';anaMenuDonusButonunuGoster?.();seciliFirmaId='';seciliUrunId='';seciliSiparisId='';teslimatSiparisId='';showGlobalOverlay?.('Siparişler yükleniyor','Firma, ürün ve teslimat geçmişi hazırlanıyor...');try{await fdOrderAwait(yukle());ciz()}catch(e){
if(!fdOrderValid())return;
console.error(e);kayitlar=[];firmaKayitlari=[];urunKayitlari=[];ciz();showToast?.('Sipariş kayıtları yüklenemedi: '+(e.message||e),'error')}finally{
if(fdOrderValid()){
hideGlobalOverlay?.()
}
}
}catch(fdOrderError){if(!fdOrderValid())return;throw fdOrderError;}
};
const api={get fdSiparisBirimSecenekleriniYenile(){return fdSiparisBirimSecenekleriniYenile},get fdSiparisSekmeAc(){return fdSiparisSekmeAc},get fdSiparisKaydet(){return fdSiparisKaydet},get fdSiparisYeniFormuAc(){return fdSiparisYeniFormuAc},get fdSiparisDuzenle(){return fdSiparisDuzenle},get fdSiparisFormIptal(){return fdSiparisFormIptal},get fdSiparisSil(){return fdSiparisSil},get fdSiparisSatirAc(){return fdSiparisSatirAc},get fdSiparisFirmayaGir(){return fdSiparisFirmayaGir},get fdSiparisFirmalaraDon(){return fdSiparisFirmalaraDon},get fdSiparisUruneGir(){return fdSiparisUruneGir},get fdSiparisUrunlereDon(){return fdSiparisUrunlereDon},get fdSiparisTeslimatlariGoster(){return fdSiparisTeslimatlariGoster},get fdSiparisSeciliUrunDuzenle(){return fdSiparisSeciliUrunDuzenle},get fdSiparisSeciliFirmaDuzenle(){return fdSiparisSeciliFirmaDuzenle},get fdSiparisFirmaAra(){return fdSiparisFirmaAra},get fdSiparisFiltrele(){return fdSiparisFiltrele},get fdSiparisTarihFiltrele(){return fdSiparisTarihFiltrele},get fdSiparisTarihTemizle(){return fdSiparisTarihTemizle},get fdSiparisFirmaFormuAc(){return fdSiparisFirmaFormuAc},get fdSiparisFirmaKaydet(){return fdSiparisFirmaKaydet},get fdSiparisFirmaSil(){return fdSiparisFirmaSil},get fdSiparisUrunFormuAc(){return fdSiparisUrunFormuAc},get fdSiparisUrunKaydet(){return fdSiparisUrunKaydet},get fdSiparisUrunSil(){return fdSiparisUrunSil},get fdSiparisTeslimatAc(){return fdSiparisTeslimatAc},get fdSiparisTeslimatDuzenle(){return fdSiparisTeslimatDuzenle},get fdSiparisTeslimatKaydet(){return fdSiparisTeslimatKaydet},get fdSiparisTeslimatSil(){return fdSiparisTeslimatSil},get fdSiparisExcel(){return (...args)=>fdOrderOutput(fdSiparisExcel,args)},get fdSiparisPdf(){return (...args)=>fdOrderOutput(fdSiparisPdf,args)},get fdSiparisGoruntu(){return (...args)=>fdOrderOutput(fdSiparisGoruntu,args)},get fdSiparisYenile(){return fdSiparisYenile}};
return{init(){birimListesiniYenile();formTemizle();ciz();window.fdUnifiedOutput?.scan()},open(...args){fdOrderAssert();return openSiparisTakipApp(...args)},api,dispose(){fdOrderDisposed=true;const tab=typeof fdAcikUygulamaSekmeleri!=="undefined"?fdAcikUygulamaSekmeleri.find(t=>t.anahtar==="siparistakip"):null;if(tab)tab.alanId="";for(const[t,...a]of fdOrderListeners)t.removeEventListener(...a);for(const id of fdOrderTimers)window.clearTimeout(id);for(const node of fdOrderNodes)fdOrderCleanNode(node);document.querySelectorAll("[data-fd-module-root=siparistakip] form").forEach(f=>f.reset());kayitlar=[];firmaKayitlari=[];urunKayitlari=[];seciliFirmaId="";seciliUrunId="";seciliSiparisId="";teslimatSiparisId="";duzenlenenId="";duzenlenenFirmaId="";duzenlenenUrunId="";acikSatirlar.clear();}};
});
