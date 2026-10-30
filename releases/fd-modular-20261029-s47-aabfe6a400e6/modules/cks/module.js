window.FDModules.define('cks',function(){

let fdCksDisposed=false,tapuCksGenelAcik=false;
const fdCksInitial=fdCksContext(),fdCksListeners=[],fdCksTimers=new Set(),fdCksObservers=new Set(),fdCksUrls=new Set(),fdCksNodes=new Set();
function fdCksContext(){return JSON.stringify([fdCksDataContext(),anaMenuModulYetkisi('cks')])}
function fdCksValid(){return !fdCksDisposed&&fdCksInitial===fdCksContext()&&anaMenuModulErisimiVar('cks')}
function fdCksAssert(write=false){if(!fdCksValid())throw Error('Oturum değişti; ÇKS ekranını yeniden açın.');if(write&&!anaMenuModulYazmaYetkisiVar('cks'))throw Error('Bu modülde değişiklik yapma yetkiniz yok.')}
async function fdCksAwait(promise){fdCksAssert();const r=await promise;fdCksAssert();return r}
function fdCksListen(target,...args){target.addEventListener(...args);fdCksListeners.push([target,...args])}
function fdCksAppend(node){fdCksNodes.add(node);return document.body.appendChild(node)}
function setTimeout(fn,delay,...args){const id=window.setTimeout(()=>{fdCksTimers.delete(id);if(fdCksValid())fn(...args)},delay);fdCksTimers.add(id);return id}
class MutationObserver extends window.MutationObserver{constructor(fn){super((...args)=>{if(fdCksValid())fn(...args)});fdCksObservers.add(this)}}
const URL={createObjectURL(blob){const u=window.URL.createObjectURL(blob);fdCksUrls.add(u);return u},revokeObjectURL(u){fdCksUrls.delete(u);window.URL.revokeObjectURL(u)}};

let fdCksCiktiVerisi,cksParselDetayAc,cksListeyeDon,cksAktifParseleYeniKayit,cksFiltreDegisti,cksYilDegisti,cksFiltreTemizle,cksSayfaDegistir,cksSayfaBoyutuDegistir,cksTakipYenile,openCksTakipApp,cksYilBelgeSec,cksYilBelgeYukle,cksYilBelgeGoruntule,cksYilBelgeKapat,cksYilBelgeDriveAc,cksYilBelgeIndir,cksYilBelgeSil,cksBelgeSahipDegisti,fdCksSatirDahil,fdCksSatirTapuSec,fdCksTapuSecListele,fdCksTapuAta,fdCksPdfKontrolKapat,fdCksPdfOnayla,fdCksCokluKayitSec,fdCksCokluKayitDuzenle,fdCksCokluKayitSil,fdCksYetimPdfKayitlariniTemizle;
function tapuCksFiltreleriYenile(){
fdCksAssert(false);
const y=[...new Set(tapuCksKayitlari.map(x=>Number(x.yil)).filter(Boolean))].sort((a,b)=>b-a),sah=[...new Set(tapuCksKayitlari.map(x=>String(x.cksSahibi||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));const d=(id,l,ilk)=>{const s=document.getElementById(id);if(!s)return;const o=s.value;s.innerHTML='<option value="">'+ilk+'</option>'+l.map(v=>'<option value="'+tapuHtml(v)+'">'+tapuHtml(v)+'</option>').join('');if([...s.options].some(x=>x.value===o))s.value=o};d('tapuCksYilFiltre',y,'Tüm ÇKS yılları');d('tapuCksGenelYil',y,'Tüm yıllar');d('tapuCksGenelSahip',sah,'Tüm ÇKS sahipleri');const c=document.getElementById('tapuCksUstSayac');if(c)c.textContent=tapuCksKayitlari.length}
function tapuCksParseller(secili=''){
fdCksAssert(false);
const s=document.getElementById('tapuCksTapuSec'),l=tapuKayitlari.filter(t=>t.ada&&t.parsel&&!t.bagimsizBolum).sort((a,b)=>String(a.mahalle||'').localeCompare(String(b.mahalle||''),'tr')||String(a.ada||'').localeCompare(String(b.ada||''),undefined,{numeric:true})||String(a.parsel||'').localeCompare(String(b.parsel||''),undefined,{numeric:true}));s.innerHTML='<option value="">Tapu parselini seçin</option>'+l.map(t=>'<option value="'+tapuHtml(String(t.id))+'">'+tapuHtml(tapuCksEtiket(t))+'</option>').join('');s.value=String(secili||'')}
function fdCksDurumKaydi(c){return ['verilmeyecek','bekleniyor'].includes(c?.cksDurum)}
function fdCksParselAnahtari(c){const t=tapuCksTapuBul(c.tapuId)||c;return tapuCksNorm([t.il,t.ilce,t.mahalle,fdCksAda(t.ada),t.parsel].join('|'))}
function fdCksDurumAlanlari(){fdCksAssert(true);const normal=document.getElementById('fdCksDurum').value==='kayitli';if(normal&&['cks verilmeyecek','cks verilmedi'].includes(tapuCksNorm(document.getElementById('tapuCksUrun').value)))document.getElementById('tapuCksUrun').value='';for(const id of ['tapuCksUrun','tapuCksEken','tapuCksSahibi']){const el=document.getElementById(id);el.closest('.tapu-form-group').style.display=normal?'':'none';el.disabled=!normal;}}
function tapuCksFormuAc(tapuId='',id=''){
fdCksAssert(true);
if(!tapuYazabilir())return;const c=tapuCksKayitlari.find(x=>String(x.id)===String(id))||{};document.getElementById('tapuCksId').value=c.id||'';tapuCksParseller(tapuId||c.tapuId||'');document.getElementById('tapuCksYil').value=c.yil||new Date().getFullYear();document.getElementById('tapuCksUrun').value=c.urun||'';document.getElementById('tapuCksEken').value=c.ekenNotu||'';document.getElementById('tapuCksSahibi').value=c.cksSahibi||'';document.getElementById('tapuCksAciklama').value=c.aciklama||'';const durum=document.getElementById('fdCksDurum');durum.value=fdCksDurumKaydi(c)?c.cksDurum:'kayitli';durum.onchange=fdCksDurumAlanlari;fdCksDurumAlanlari();document.getElementById('tapuCksFormBaslik').textContent=id?'ÇKS Kaydını Düzenle':'Yeni ÇKS Kaydı';document.getElementById('modalTapuCksKayit').style.display='flex'}
function tapuCksFormuKapat(){
fdCksAssert(false);
document.getElementById('modalTapuCksKayit').style.display='none'}
async function tapuCksKaydet(e){
try{
fdCksAssert(true);
e.preventDefault();const b=document.getElementById('tapuCksKaydetBtn'),tid=document.getElementById('tapuCksTapuSec').value,y=Number(document.getElementById('tapuCksYil').value),t=tapuCksTapuBul(tid);if(!t||(t.sirketId&&String(t.sirketId)!==String(activeUser.sirketId)))return alert('Tapu parselini seçin.');if(!(y>=2000&&y<=2100))return alert('Geçerli bir ÇKS yılı girin.');const durum=document.getElementById('fdCksDurum').value;if(!['kayitli','verilmeyecek','bekleniyor'].includes(durum))return alert('Geçerli bir ÇKS durumu seçin.');const anahtar=fdCksParselAnahtari({tapuId:tid}),ayni=tapuCksKayitlari.filter(x=>Number(x.yil)===y&&fdCksParselAnahtari(x)===anahtar),gizliId=document.getElementById('tapuCksId').value;if(durum!=='kayitli'&&ayni.some(x=>!fdCksDurumKaydi(x)))return alert('Bu parselin seçilen yılda mevcut ÇKS kaydı var. Kayıt korunmuştur; verilmedi/verilmeyecek durumuna çevrilmedi.');const durumKaydi=ayni.find(fdCksDurumKaydi),id=gizliId||durumKaydi?.id||(durum==='kayitli'?tapuCksYeniId():'cks_durum_'+y+'_'+encodeURIComponent(anahtar)),eski=tapuCksKayitlari.find(x=>String(x.id)===String(id))||{};if(durum==='kayitli'&&fdCksDurumKaydi(eski)&&!document.getElementById('tapuCksUrun').value.trim())return alert('ÇKS kaydı için ürün/kullanım bilgisini girin. ÇKS henüz verilmediyse ÇKS Bekleniyor seçin.');const c={...eski,id,kayitTipi:'cks',tapuId:String(tid),eslesmeDurumu:'eslesti',ada:String(t.ada||''),parsel:String(t.parsel||''),il:String(t.il||''),ilce:String(t.ilce||''),mahalle:String(t.mahalle||''),malik:String(t.sahibi||''),toplamAlan:Number(t.toplamAlan||0),sahipOlunanAlan:Number(t.sahipOlunanAlan||0),hisseDurumu:String(t.hisseDurumu||''),yil:y,cksDurum:durum,urun:durum==='verilmeyecek'?'ÇKS Verilmeyecek':durum==='bekleniyor'?'ÇKS Verilmedi':document.getElementById('tapuCksUrun').value.trim().toLocaleUpperCase('tr-TR'),ekenNotu:durum==='kayitli'?document.getElementById('tapuCksEken').value.trim().toLocaleUpperCase('tr-TR'):'',cksSahibi:durum==='kayitli'?document.getElementById('tapuCksSahibi').value.trim().toLocaleUpperCase('tr-TR'):'',aciklama:document.getElementById('tapuCksAciklama').value.trim(),guncellemeTarihi:new Date().toISOString()};b.disabled=true;b.textContent='Kaydediliyor...';try{const{error}=await fdCksAwait(supabaseClient.from('portal_records').upsert({company_id:activeUser.sirketId,module:'taputakip',legacy_id:String(id),record_year:y,employee_legacy_id:null,data:c},{onConflict:'company_id,module,legacy_id'}));if(error)throw error;const i=tapuCksKayitlari.findIndex(x=>String(x.id)===String(id));if(i>=0)tapuCksKayitlari[i]=c;else tapuCksKayitlari.push(c);tapuCksFormuKapat();tapuCksFiltreleriYenile();if(document.getElementById('modalTapuDetay').style.display==='flex')tapuCksDetayCiz(fdTapuDetayKimligi());if(tapuCksGenelAcik)tapuCksGenelCiz();showToast?.('ÇKS kaydı kaydedildi.')}catch(error){
if(!fdCksValid())return;
alert('ÇKS kaydı kaydedilemedi: '+tapuHataMetni(error))}finally{
if(fdCksValid()){
b.disabled=false;b.textContent='Kaydet'
}
}
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
}
async function tapuCksSil(id){
try{
fdCksAssert(true);
if(!tapuYazabilir())return;const c=tapuCksKayitlari.find(x=>String(x.id)===String(id));if(!c||!confirm(c.yil+' yılı ÇKS kaydı silinsin mi?'))return;try{const{error}=await fdCksAwait(supabaseClient.from('portal_records').delete().eq('company_id',activeUser.sirketId).eq('module','taputakip').eq('legacy_id',String(id)));if(error)throw error;tapuCksKayitlari=tapuCksKayitlari.filter(x=>String(x.id)!==String(id));tapuCksFiltreleriYenile();if(document.getElementById('modalTapuDetay').style.display==='flex')tapuCksDetayCiz(fdTapuDetayKimligi());if(tapuCksGenelAcik)tapuCksGenelCiz();showToast?.('ÇKS kaydı silindi.')}catch(error){
if(!fdCksValid())return;
alert('ÇKS kaydı silinemedi: '+tapuHataMetni(error))}
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
}
function tapuCksGenelAc(){
fdCksAssert(false);
tapuCksGenelAcik=true;tapuCksFiltreleriYenile();tapuCksGenelCiz();document.getElementById('modalTapuCksGenel').style.display='flex'}
function tapuCksGenelKapat(){
fdCksAssert(false);
tapuCksGenelAcik=false;document.getElementById('modalTapuCksGenel').style.display='none'}
function tapuCksGenelCiz(){
fdCksAssert(false);
const q=tapuCksNorm(document.getElementById('tapuCksGenelArama')?.value),y=Number(document.getElementById('tapuCksGenelYil')?.value||0),s=document.getElementById('tapuCksGenelSahip')?.value||'',l=tapuCksKayitlari.filter(c=>(!y||Number(c.yil)===y)&&(!s||c.cksSahibi===s)&&(!q||tapuCksNorm([c.ada,c.parsel,c.ilce,c.mahalle,c.urun,c.ekenNotu,c.cksSahibi,c.malik].join(' ')).includes(q))).sort((a,b)=>Number(b.yil)-Number(a.yil)||String(a.mahalle||'').localeCompare(String(b.mahalle||''),'tr')||String(a.ada||'').localeCompare(String(b.ada||''),undefined,{numeric:true})||String(a.parsel||'').localeCompare(String(b.parsel||''),undefined,{numeric:true}));document.getElementById('tapuCksGenelGovde').innerHTML=l.length?l.map(c=>{const t=tapuCksTapuBul(c.tapuId),k=t?[t.mahalle,t.ilce].filter(Boolean).join(' / '):[c.mahalle,c.ilce].filter(Boolean).join(' / '),d=t?'<button style="all:unset;cursor:pointer;color:#15803d;font-weight:800" onclick="tapuCksGenelKapat();tapuDetayAc(\''+tapuHtml(String(t.id))+'\')">Tapuya bağlı</button>':'<span class="tapu-cks-eslesmedi">Eşleşme bekliyor</span>';return'<tr><td><strong>'+tapuHtml(c.ada||'-')+' / '+tapuHtml(c.parsel||'-')+'</strong><br><small>'+tapuHtml(t?.tasinmazNo||c.malik||'')+'</small></td><td>'+tapuHtml(k||'-')+'</td><td><span class="tapu-cks-yil">'+tapuHtml(c.yil)+'</span></td><td><strong>'+tapuHtml(c.urun||'-')+'</strong></td><td>'+tapuHtml(c.ekenNotu||'-')+'</td><td>'+tapuHtml(c.cksSahibi||'-')+'</td><td>'+d+'</td><td>'+(tapuYazabilir()?'<button class="tapu-icon tapu-icon-edit" onclick="tapuCksFormuAc(\''+tapuHtml(String(c.tapuId||''))+'\',\''+tapuHtml(String(c.id))+'\')">✎</button><button class="tapu-icon tapu-icon-delete" onclick="tapuCksSil(\''+tapuHtml(String(c.id))+'\')">🗑</button>':'')+'</td></tr>'}).join(''):'<tr><td colspan="8" class="tapu-cks-empty">Filtreye uygun ÇKS kaydı bulunamadı.</td></tr>'}
function fdCksInitialize(){
(function(){
fdCksAssert(false);
const app=document.getElementById("cksTakipApp");app.style.display='none';let cksSeciliYil=0,cksSayfa=1,cksBoyut=50,cksAktifAnahtar='';function esc(v){
fdCksAssert(false);
return tapuHtml(v)}function anahtar(c){
fdCksAssert(false);
const t=tapuCksTapuBul(c.tapuId),x=t||c;return's:'+tapuCksNorm([x.il,x.ilce,x.mahalle,fdCksAda(x.ada),x.parsel].join('|'))}function kayitlar(key){
fdCksAssert(false);
return tapuCksKayitlari.filter(c=>anahtar(c)===key)}function grup(cListe){
fdCksAssert(false);
const m=new Map();cListe.forEach(c=>{const k=anahtar(c);if(!m.has(k))m.set(k,{key:k,items:[]});m.get(k).items.push(c)});return[...m.values()].map(g=>{g.tapu=tapuCksTapuBul(g.items.find(x=>x.tapuId)?.tapuId);g.ornek=g.items[0];return g})}function birlesik(items,alan){
fdCksAssert(false);
const m=new Map();items.map(x=>String(x[alan]||'').normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/\s+/g,' ').trim()).filter(Boolean).forEach(v=>{const k=tapuCksNorm(v);if(!m.has(k))m.set(k,v)});return[...m.values()]}function cksTarimsalTapuMu(t){
fdCksAssert(false);
return!t?.bagimsizBolum&&!!String(t?.parsel||'').trim()&&/tarla|arazi|bahce|bag|zeytinlik|cayir|tarim|sera|findik|fistik/.test(tapuCksNorm(t?.nitelik||''))}function seciliYilKayitlari(){
fdCksAssert(false);
const yilKayitlari=tapuCksKayitlari.filter(c=>Number(c.yil)===Number(cksSeciliYil)),gercek=yilKayitlari.filter(c=>!fdCksDurumKaydi(c)||!yilKayitlari.some(x=>!fdCksDurumKaydi(x)&&anahtar(x)===anahtar(c))).map(c=>c.cksDurum==='bekleniyor'?{...c,kayitTipi:'cksBos',urun:'ÇKS Verilmedi'}:c),varOlan=new Set(gercek.map(anahtar)),sonuc=[...gercek];tapuKayitlari.filter(cksTarimsalTapuMu).forEach(t=>{const yMatch=String(t.alisTarihi||'').match(/\b(20\d{2})\b/),alisYili=yMatch?Number(yMatch[1]):0,yeni=alisYili&&alisYili>=Number(cksSeciliYil)-1,gecici={id:'',kayitTipi:'cksBos',cksDurum:'verilmedi',tapuId:String(t.id||''),ada:fdCksAda(t.ada),parsel:String(t.parsel||''),il:String(t.il||''),ilce:String(t.ilce||''),mahalle:String(t.mahalle||''),malik:String(t.sahibi||''),toplamAlan:Number(t.toplamAlan||0),sahipOlunanAlan:Number(t.sahipOlunanAlan||0),hisseDurumu:String(t.hisseDurumu||''),yil:Number(cksSeciliYil),urun:'ÇKS Verilmedi',ekenNotu:yeni?'Yeni Alındı':'Boşta',cksSahibi:'',aciklama:''},k=anahtar(gecici);if(!varOlan.has(k)){sonuc.push(gecici);varOlan.add(k)}});return sonuc}function yillariKur(){
fdCksAssert(false);
const bu=new Date().getFullYear(),onceki=Number(document.getElementById('cksYil')?.value||cksSeciliYil||0),y=[...new Set([bu+1,bu,...tapuCksKayitlari.map(x=>Number(x.yil)).filter(Boolean)])].sort((a,b)=>b-a);cksSeciliYil=y.includes(onceki)?onceki:bu;const s=document.getElementById('cksYil');s.innerHTML=y.map(v=>'<option value="'+v+'">'+v+' yılı</option>').join('');s.value=String(cksSeciliYil)}function stats(){
fdCksAssert(false);
const l=seciliYilKayitlari(),g=grup(l),alan=g.reduce((t,x)=>t+Number(x.tapu?.sahipOlunanAlan??x.ornek.sahipOlunanAlan??0),0),urun=new Set(l.filter(x=>x.kayitTipi!=='cksBos'&&!fdCksDurumKaydi(x)).map(x=>String(x.urun||'').trim()).filter(Boolean)).size,es=g.filter(x=>!x.tapu).length;document.getElementById('cksStats').innerHTML=[['Seçili Yıl',cksSeciliYil],['Parsel',g.length],['ÇKS Kaydı',l.filter(x=>x.kayitTipi!=='cksBos'&&!fdCksDurumKaydi(x)).length],['Toplam Alan',tapuAlan(alan)+' m²'],['Ürün / Kullanım',urun+(es?' · '+es+' eşleşmemiş':'')]].map(x=>'<div class="cks-stat"><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div>').join('')}function filtreliGruplar(){
fdCksAssert(false);
const q=tapuCksNorm(document.getElementById('cksArama')?.value||''),durum=document.getElementById('cksDurumFiltre')?.value||'';return grup(seciliYilKayitlari()).filter(g=>{const verilmedi=g.items.every(x=>x.kayitTipi==='cksBos');if(durum==='verilmedi'&&!verilmedi)return false;const verilmeyecek=g.items.every(x=>x.cksDurum==='verilmeyecek');if(durum==='kayitli'&&(verilmedi||verilmeyecek))return false;if(durum==='verilmeyecek'&&!verilmeyecek)return false;return!q||tapuCksNorm([g.ornek.ada,g.ornek.parsel,g.ornek.il,g.ornek.ilce,g.ornek.mahalle,g.tapu?.sahibi,g.ornek.malik,...birlesik(g.items,'urun'),...birlesik(g.items,'ekenNotu'),...birlesik(g.items,'cksSahibi')].join(' ')).includes(q)}).sort((a,b)=>String(a.ornek.ada||'').localeCompare(String(b.ornek.ada||''),undefined,{numeric:true})||String(a.ornek.parsel||'').localeCompare(String(b.ornek.parsel||''),undefined,{numeric:true})||String(a.ornek.mahalle||'').localeCompare(String(b.ornek.mahalle||''),'tr'))}function ciz(){
fdCksAssert(false);
stats();const l=filtreliGruplar(),sayfa=Math.max(1,Math.ceil(l.length/cksBoyut));cksSayfa=Math.min(cksSayfa,sayfa);const bas=(cksSayfa-1)*cksBoyut,parca=l.slice(bas,bas+cksBoyut),body=document.getElementById('cksListeGovde');body.innerHTML=parca.length?parca.map(g=>{const c=g.ornek,t=g.tapu,gecmis=kayitlar(g.key).length,kod=encodeURIComponent(g.key),urun=birlesik(g.items,'urun'),eken=birlesik(g.items,'ekenNotu'),sahip=birlesik(g.items,'cksSahibi');return'<tr><td><button class="cks-parsel-link" onclick="cksParselDetayAc(\''+kod+'\')">'+esc(c.ada||'-')+' / '+esc(c.parsel||'-')+'</button><br><small class="cks-muted">'+esc(t?.tasinmazNo||'')+'</small></td><td class="cks-location">'+esc([c.mahalle,c.ilce,c.il].filter(Boolean).join(' / ')||'-')+'</td><td>'+esc(t?.sahibi||c.malik||'-')+'</td><td>'+esc(tapuAlan(t?.sahipOlunanAlan??c.sahipOlunanAlan))+' m²</td><td><div class="cks-stack">'+(urun.length?urun.map(x=>'<span class="cks-product">'+esc(x)+'</span>').join(''):'-')+'</div></td><td><div class="cks-stack">'+(eken.length?eken.map(x=>'<span>'+esc(x)+'</span>').join(''):'-')+'</div></td><td><div class="cks-stack">'+(sahip.length?sahip.map(x=>'<span>'+esc(x)+'</span>').join(''):'-')+'</div></td><td><button class="cks-parsel-link" onclick="cksParselDetayAc(\''+kod+'\')">'+gecmis+' yıl/kayıt →</button></td><td>'+(tapuYazabilir()?g.items.map(x=>'<button class="cks-icon-btn edit" title="Düzenle" onclick="tapuCksFormuAc(\''+esc(String(x.tapuId||''))+'\',\''+esc(String(x.id))+'\')">✎</button>').join(''):'')+'</td></tr>'}).join(''):'<tr><td colspan="9" class="cks-empty">Bu yıl için filtreye uygun kayıt yok.</td></tr>';document.getElementById('cksListeBilgi').textContent=l.length?`${l.length} parselden ${bas+1}-${Math.min(bas+cksBoyut,l.length)} arası gösteriliyor`:'Kayıt bulunamadı';document.getElementById('cksSayfaBilgi').textContent=cksSayfa+' / '+sayfa;document.getElementById('cksOncekiBtn').disabled=cksSayfa<=1;document.getElementById('cksSonrakiBtn').disabled=cksSayfa>=sayfa;document.getElementById('cksYeniKayitBtn').style.display=tapuYazabilir()?'inline-flex':'none'}function detay(key){
fdCksAssert(false);
cksAktifAnahtar=key;const l=kayitlar(key).sort((a,b)=>Number(b.yil)-Number(a.yil)||String(b.id).localeCompare(String(a.id))),c=l[0],t=tapuCksTapuBul(l.find(x=>x.tapuId)?.tapuId);if(!c)return;document.getElementById('cksListePanel').style.display='none';document.getElementById('cksDetayPanel').style.display='block';document.getElementById('cksDetayBaslik').innerHTML='<h3>'+esc(c.ada||'-')+' / '+esc(c.parsel||'-')+' Parsel</h3><p>'+esc([c.mahalle,c.ilce,c.il].filter(Boolean).join(' / '))+' · '+l.length+' geçmiş kayıt</p>';document.getElementById('cksDetayOzet').innerHTML=[['Tapu Sahibi',t?.sahibi||c.malik||'-'],['Taşınmaz No',t?.tasinmazNo||'-'],['Sahip Olunan Alan',tapuAlan(t?.sahipOlunanAlan??c.sahipOlunanAlan)+' m²'],['Hisse',t?.hisseDurumu||c.hisseDurumu||'-']].map(x=>'<div class="cks-detail-card"><span>'+x[0]+'</span><strong>'+esc(x[1])+'</strong></div>').join('');document.getElementById('cksDetayGovde').innerHTML=l.map(x=>'<tr><td><span class="cks-year">'+esc(x.yil)+'</span></td><td class="cks-product">'+esc(x.urun||'-')+'</td><td>'+esc(x.ekenNotu||'-')+'</td><td>'+esc(x.cksSahibi||'-')+'</td><td>'+esc(t?.sahibi||x.malik||'-')+'</td><td>'+esc(tapuAlan(t?.sahipOlunanAlan??x.sahipOlunanAlan))+' m²</td><td class="cks-note">'+esc(x.aciklama||'-')+'</td><td>'+(tapuYazabilir()?'<button class="cks-icon-btn edit" title="Düzenle" onclick="tapuCksFormuAc(\''+esc(String(x.tapuId||''))+'\',\''+esc(String(x.id))+'\')">✎</button><button class="cks-icon-btn delete" title="Sil" onclick="tapuCksSil(\''+esc(String(x.id))+'\')">🗑</button>':'')+'</td></tr>').join('');const b=document.getElementById('cksDetayYeniBtn');b.style.display=tapuYazabilir()?'inline-flex':'none';b.disabled=!t}fdCksCiktiVerisi=function(){
fdCksAssert(false);
const sayilar=new Map();for(const c of tapuCksKayitlari){const k=anahtar(c);sayilar.set(k,(sayilar.get(k)||0)+1)}return{yil:cksSeciliYil,gruplar:filtreliGruplar().map(g=>({...g,gecmisSayisi:sayilar.get(g.key)||0})),detayAnahtari:cksAktifAnahtar,detayKayitlari:cksAktifAnahtar?kayitlar(cksAktifAnahtar).slice().sort((a,b)=>Number(b.yil)-Number(a.yil)||String(b.id).localeCompare(String(a.id))):[]}};cksParselDetayAc=function(k){
fdCksAssert(false);
detay(decodeURIComponent(k))};cksListeyeDon=function(){
fdCksAssert(false);
cksAktifAnahtar='';document.getElementById('cksDetayPanel').style.display='none';document.getElementById('cksListePanel').style.display='block';ciz()};cksAktifParseleYeniKayit=function(){
fdCksAssert(true);
const l=kayitlar(cksAktifAnahtar),t=tapuCksTapuBul(l.find(x=>x.tapuId)?.tapuId);if(t)tapuCksFormuAc(t.id)};cksFiltreDegisti=function(){
fdCksAssert(false);
cksSayfa=1;ciz()};cksYilDegisti=function(){
fdCksAssert(false);
cksSeciliYil=Number(document.getElementById('cksYil').value);cksSayfa=1;cksListeyeDon()};cksFiltreTemizle=function(){
fdCksAssert(false);
document.getElementById('cksArama').value='';const d=document.getElementById('cksDurumFiltre');if(d)d.value='';cksSayfa=1;ciz()};cksSayfaDegistir=function(n){
fdCksAssert(false);
cksSayfa+=n;ciz()};cksSayfaBoyutuDegistir=function(){
fdCksAssert(false);
cksBoyut=Number(document.getElementById('cksSayfaBoyutu').value)||50;cksSayfa=1;ciz()};cksTakipYenile=async function(){
try{
fdCksAssert(false);
showGlobalOverlay?.('ÇKS kayıtları yenileniyor','Güncel kayıtlar alınıyor...');try{await fdCksAwait(tapuVerileriniYukle());yillariKur();cksListeyeDon()}finally{
if(fdCksValid()){
hideGlobalOverlay?.()
}
}
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};openCksTakipApp=async function(){
try{
fdCksAssert(false);
if(!anaMenuModulErisimiVar('cks'))return showToast('Bu modül bu kullanıcı için görünür değil.','warning');personelModuluYetkiGorunumunuUygula('cks');fdTumUygulamaAlanlariniGizle();document.getElementById('cksTakipApp').style.display='block';showGlobalOverlay?.('ÇKS Takip açılıyor','Parsel ve yıl kayıtları hazırlanıyor...');try{await fdCksAwait(tapuVerileriniYukle());if(!tapuAktarimTamam&&tapuYazabilir())await fdCksAwait(tapuExcelKayitlariniAktar(false));if(!tapuCksAktarimTamam&&tapuYazabilir())await fdCksAwait(tapuCksExcelAktar());yillariKur();cksSayfa=1;document.getElementById('cksArama').value='';cksListeyeDon()}catch(e){
if(!fdCksValid())return;
console.error(e);showToast?.('ÇKS kayıtları açılamadı: '+tapuHataMetni(e),'error')}finally{
if(fdCksValid()){
hideGlobalOverlay?.()
}
}
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};/* Title-owned toolbar override moved to the lazy title module. *//* Title-owned toolbar override moved to the lazy title module. */tapuCksArayuzunuKur();const eskiKaydet=tapuCksKaydet;tapuCksKaydet=async function(e){
try{
fdCksAssert(true);
await fdCksAwait(eskiKaydet(e));if(document.getElementById('cksTakipApp').style.display!=='none'){ciz();if(cksAktifAnahtar)detay(cksAktifAnahtar)}
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};const eskiSil=tapuCksSil;tapuCksSil=async function(id){
try{
fdCksAssert(true);
await fdCksAwait(eskiSil(id));if(document.getElementById('cksTakipApp').style.display!=='none'){if(cksAktifAnahtar&&kayitlar(cksAktifAnahtar).length)detay(cksAktifAnahtar);else cksListeyeDon()}
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};anaMenuModulKartlariniUygula();fdSekmeSisteminiKur()})();

(function(){
fdCksAssert(false);
/* Shared Tapu-card CKS history component. *//* Shared Tapu-card CKS history component. *//* Shared Tapu-card CKS history component. */function secimAlanlariniKur(){
fdCksAssert(false);
const select=document.getElementById('tapuCksTapuSec');if(select&&!document.getElementById('tapuCksTapuAra')){const wrap=document.createElement('div');wrap.className='tapu-cks-search-wrap';const input=document.createElement('input');input.id='tapuCksTapuAra';input.className='tapu-field';input.type='search';input.required=true;input.setAttribute('list','tapuCksTapuDatalist');input.placeholder='Ada, parsel, mahalle, malik veya taşınmaz no yazın...';input.autocomplete='off';input.oninput=()=>{const m=(input._cksSecenekler||[]).find(x=>x.etiket===input.value);select.value=m?.id||''};const liste=document.createElement('datalist');liste.id='tapuCksTapuDatalist';wrap.append(input,liste);select.parentElement.insertBefore(wrap,select);select.style.display='none';select.required=false;const yardim=document.createElement('small');yardim.className='tapu-cks-search-help';yardim.textContent='Yazmaya başlayın ve çıkan listeden parseli seçin.';wrap.appendChild(yardim)}const urun=document.getElementById('tapuCksUrun'),sahip=document.getElementById('tapuCksSahibi');if(urun&&!document.getElementById('tapuCksUrunListe')){const d=document.createElement('datalist');d.id='tapuCksUrunListe';urun.setAttribute('list',d.id);urun.after(d)}if(sahip&&!document.getElementById('tapuCksSahipListe')){const d=document.createElement('datalist');d.id='tapuCksSahipListe';sahip.setAttribute('list',d.id);sahip.after(d)}}function gecmisOnerileriYenile(){
fdCksAssert(false);
const doldur=(id,alan)=>{const d=document.getElementById(id);if(!d)return;const l=[...new Set(tapuCksKayitlari.map(x=>String(x[alan]||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));d.innerHTML=l.map(x=>'<option value="'+tapuHtml(x)+'"></option>').join('')};doldur('tapuCksUrunListe','urun');doldur('tapuCksSahipListe','cksSahibi')}secimAlanlariniKur();const parsellerEski=tapuCksParseller;tapuCksParseller=function(secili=''){
fdCksAssert(false);
secimAlanlariniKur();const select=document.getElementById('tapuCksTapuSec'),input=document.getElementById('tapuCksTapuAra'),d=document.getElementById('tapuCksTapuDatalist'),l=tapuKayitlari.filter(t=>t.ada&&t.parsel&&!t.bagimsizBolum).sort((a,b)=>String(a.mahalle||'').localeCompare(String(b.mahalle||''),'tr')||String(a.ada||'').localeCompare(String(b.ada||''),undefined,{numeric:true})||String(a.parsel||'').localeCompare(String(b.parsel||''),undefined,{numeric:true})),o=l.map(t=>({id:String(t.id),etiket:tapuCksEtiket(t)+(t.tasinmazNo?' · No: '+t.tasinmazNo:'')}));select.innerHTML='<option value=""></option>'+o.map(x=>'<option value="'+tapuHtml(x.id)+'">'+tapuHtml(x.etiket)+'</option>').join('');d.innerHTML=o.map(x=>'<option value="'+tapuHtml(x.etiket)+'"></option>').join('');input._cksSecenekler=o;select.value=String(secili||'');input.value=o.find(x=>x.id===String(secili||''))?.etiket||'';gecmisOnerileriYenile()};const formEski=tapuCksFormuAc;tapuCksFormuAc=function(tapuId='',id=''){
fdCksAssert(true);
const r=formEski(tapuId,id);setTimeout(()=>{secimAlanlariniKur();gecmisOnerileriYenile();const s=document.getElementById('tapuCksTapuSec'),i=document.getElementById('tapuCksTapuAra');if(i&&s?.value){const o=(i._cksSecenekler||[]).find(x=>x.id===String(s.value));if(o)i.value=o.etiket}i?.focus()},0);return r};const kaydetV127=tapuCksKaydet;tapuCksKaydet=async function(e){
try{
fdCksAssert(true);
await fdCksAwait(kaydetV127(e));gecmisOnerileriYenile()
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
}})();

(function(){
fdCksAssert(false);
function duzelt(){
fdCksAssert(false);
document.querySelectorAll('#cksListeGovde tr').forEach(tr=>{const td=tr.children[1];if(!td||td.dataset.konumSade)return;const p=td.textContent.split('/').map(x=>x.trim()).filter(Boolean);if(p.length>2)td.textContent=p.slice(0,2).join(' / ');td.dataset.konumSade='1'})}const g=document.getElementById('cksListeGovde');if(g)new MutationObserver(duzelt).observe(g,{childList:true});duzelt()})();

(function(){
fdCksAssert(false);
let belgeler=[];const bar=document.getElementById('cksYilBelgeBar');const input=document.getElementById('cksYilBelgeInput');input.onchange=()=>cksYilBelgeYukle(input.files?.[0]);const modal=document.getElementById("modalCksYilBelge");modal.style.cssText='display:none;z-index:10035';let onizlemeYil=0;function yil(){
fdCksAssert(false);
return Number(document.getElementById('cksYil')?.value||new Date().getFullYear())}function bul(y=yil()){
fdCksAssert(false);
return belgeler.find(x=>Number(x.yil)===Number(y))}async function yukle(){
try{
fdCksAssert(false);
const data=Array.isArray(window.fdTapuTumSatirlari)?window.fdTapuTumSatirlari:[];belgeler=data.filter(x=>x?.data?.kayitTipi==='cksBelge').map(x=>({...x.data,id:String(x.data.id||x.legacy_id)}));yilSecenekleri();ciz()
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
}function yilSecenekleri(){
fdCksAssert(false);
const s=document.getElementById('cksYil');if(!s)return;const mevcut=new Set([...s.options].map(x=>Number(x.value))),ek=[new Date().getFullYear(),...belgeler.map(x=>Number(x.yil))].filter(Boolean);ek.forEach(y=>{if(!mevcut.has(y)){const o=document.createElement('option');o.value=String(y);o.textContent=y+' yılı';s.appendChild(o)}});[...s.options].sort((a,b)=>Number(b.value)-Number(a.value)).forEach(o=>s.appendChild(o))}function ciz(){
fdCksAssert(false);
const y=yil(),b=bul(y),yaz=tapuYazabilir();bar.innerHTML='<div class="cks-year-doc-main"><span class="cks-year-doc-icon">PDF</span><div class="cks-year-doc-text"><strong>'+y+' ÇKS Belgesi</strong><small>'+(b?.dosya?.ad?tapuHtml(b.dosya.ad):'Bu yıl için henüz PDF yüklenmedi.')+'</small></div></div><div class="cks-year-doc-actions">'+(b?'<button class="cks-doc-btn cks-doc-view" title="Görüntüle" onclick="cksYilBelgeGoruntule('+y+')">👁</button><button class="cks-doc-btn cks-doc-download" title="İndir" onclick="cksYilBelgeIndir('+y+')">⬇</button>'+(yaz?'<button class="cks-doc-btn cks-doc-replace" title="Belgeyi değiştir" onclick="cksYilBelgeSec('+y+')">✎</button><button class="cks-doc-btn cks-doc-delete" title="Belgeyi sil" onclick="cksYilBelgeSil('+y+')">🗑</button>':''):(yaz?'<button class="cks-doc-btn cks-doc-upload" onclick="cksYilBelgeSec('+y+')">＋ PDF Yükle</button>':''))+'</div>'}cksYilBelgeSec=function(y){
fdCksAssert(true);
document.getElementById('cksYil').value=String(y);input.value='';input.click()};cksYilBelgeYukle=async function(dosya){
try{
fdCksAssert(true);
if(!dosya)return;if(dosya.type!=='application/pdf'&&!String(dosya.name).toLowerCase().endsWith('.pdf'))return alert('Yalnızca PDF dosyası yükleyebilirsiniz.');const max=ayarSayisi('pdfAzamiMb',10);if(dosya.size>max*1024*1024)return alert('PDF en fazla '+max+' MB olabilir.');const y=yil(),eski=bul(y),butonAlan=bar.querySelector('.cks-year-doc-actions');butonAlan.innerHTML='<div id="cksBelgeIlerleme" class="cks-doc-progress" style="--p:10%"><span>Yükleniyor %10</span></div>';try{const base64=await fdCksAwait(dosyayiBase64Oku(dosya)),p=document.getElementById('cksBelgeIlerleme');p.style.setProperty('--p','45%');p.querySelector('span').textContent='Yükleniyor %45';const ad='CKS_'+y+'_BELGESI.pdf',d=await fdCksAwait(fdYazilimDrivePdfYukle(base64,ad,eski?.dosya?.id||'','ÇKS TAKİP'));p.style.setProperty('--p','85%');p.querySelector('span').textContent='Kaydediliyor %85';const kayit={id:'cks_belge_'+y,kayitTipi:'cksBelge',yil:y,dosya:{id:d.id,url:d.url,ad:d.ad||ad,mimeType:'application/pdf'},guncellemeTarihi:new Date().toISOString()},{error}=await fdCksAwait(supabaseClient.from('portal_records').upsert({company_id:activeUser.sirketId,module:'taputakip',legacy_id:kayit.id,record_year:y,employee_legacy_id:null,data:kayit},{onConflict:'company_id,module,legacy_id'}));if(error)throw error;const i=belgeler.findIndex(x=>Number(x.yil)===y);if(i>=0)belgeler[i]=kayit;else belgeler.push(kayit);p.style.setProperty('--p','100%');p.querySelector('span').textContent='Tamamlandı %100';setTimeout(ciz,350);showToast?.(y+' ÇKS belgesi kaydedildi.')}catch(e){
if(!fdCksValid())return;
console.error(e);ciz();alert('ÇKS belgesi yüklenemedi: '+(e.message||e))}
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};cksYilBelgeGoruntule=function(y=yil()){
fdCksAssert(false);
const b=bul(y);if(!b?.dosya?.id)return;onizlemeYil=Number(y);document.getElementById('cksBelgeModalBaslik').textContent=y+' ÇKS Belgesi';document.getElementById('cksBelgeFrame').src='https:\x2f\x2fdrive.google.com/file/d/'+encodeURIComponent(b.dosya.id)+'/preview';modal.style.display='flex'};cksYilBelgeKapat=function(){
fdCksAssert(false);
document.getElementById('cksBelgeFrame').src='about:blank';modal.style.display='none';onizlemeYil=0};cksYilBelgeDriveAc=function(){
fdCksAssert(false);
const b=bul(onizlemeYil||yil());if(b?.dosya?.url)window.open(b.dosya.url,'_blank','noopener');else if(b?.dosya?.id)window.open('https:\x2f\x2fdrive.google.com/open?id='+encodeURIComponent(b.dosya.id),'_blank','noopener')};cksYilBelgeIndir=async function(y=onizlemeYil||yil()){
try{
fdCksAssert(false);
const b=bul(y);if(!b?.dosya?.id)return;showGlobalOverlay?.('ÇKS belgesi indiriliyor',y+' yılı PDF hazırlanıyor...');try{const d=await fdCksAwait(fdYazilimDriveDosyaIndir(b.dosya.id,'ÇKS TAKİP')),blob=new Blob([base64DizisineCevir(d.base64)],{type:'application/pdf'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=d.ad||b.dosya.ad||('CKS_'+y+'_BELGESI.pdf');fdCksAppend(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}catch(e){
if(!fdCksValid())return;
alert('Belge indirilemedi: '+(e.message||e))}finally{
if(fdCksValid()){
hideGlobalOverlay?.()
}
}
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};cksYilBelgeSil=async function(y=yil()){
try{
fdCksAssert(true);
const b=bul(y);if(!b||!confirm(y+' yılı ÇKS belgesi tamamen silinsin mi?'))return;showGlobalOverlay?.('ÇKS belgesi siliniyor',y+' yılı belgesi kaldırılıyor...');try{const{error}=await fdCksAwait(supabaseClient.from('portal_records').delete().eq('company_id',activeUser.sirketId).eq('module','taputakip').eq('legacy_id',String(b.id)));if(error)throw error;try{await fdCksAwait(fdYazilimDrivePdfSil(b.dosya?.id||''))}catch(e){
if(!fdCksValid())return;
console.warn(e)}belgeler=belgeler.filter(x=>Number(x.yil)!==Number(y));ciz();showToast?.(y+' ÇKS belgesi silindi.')}catch(e){
if(!fdCksValid())return;
alert('Belge silinemedi: '+(e.message||e))}finally{
if(fdCksValid()){
hideGlobalOverlay?.()
}
}
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};const yilEski=cksYilDegisti;cksYilDegisti=function(){
fdCksAssert(false);
const r=yilEski.apply(this,arguments);ciz();return r};const acEski=openCksTakipApp;openCksTakipApp=async function(){
try{
fdCksAssert(false);
const r=await fdCksAwait(acEski.apply(this,arguments));try{await fdCksAwait(yukle())}catch(e){
if(!fdCksValid())return;
console.error(e);showToast?.('Yıllık ÇKS belgeleri alınamadı.','warning')}return r
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};const yenileEski=cksTakipYenile;cksTakipYenile=async function(){
try{
fdCksAssert(false);
const r=await fdCksAwait(yenileEski.apply(this,arguments));await fdCksAwait(yukle());return r
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};ciz()})();

(function(){
fdCksAssert(false);
let kisiBelgeleri=[],seciliSahip='',kisiOnizleme=null;/* Shared Tapu-card CKS history component. *//* Shared Tapu-card CKS history component. */const bar=document.getElementById('cksYilBelgeBar'),input=document.getElementById('cksYilBelgeInput'),modal=document.getElementById('modalCksYilBelge');function yil(){
fdCksAssert(false);
return Number(document.getElementById('cksYil')?.value||new Date().getFullYear())}function norm(v){
fdCksAssert(false);
return tapuCksNorm(v)}function belgeBul(y,s){
fdCksAssert(false);
return kisiBelgeleri.find(x=>Number(x.yil)===Number(y)&&norm(x.cksSahibi||'')===norm(s||''))}function sahipListesi(y){
fdCksAssert(false);
const tum=[...tapuCksKayitlari.filter(x=>Number(x.yil)===Number(y)).map(x=>x.cksSahibi),...kisiBelgeleri.filter(x=>Number(x.yil)===Number(y)).map(x=>x.cksSahibi)].map(x=>String(x||'').trim()).filter(Boolean);if(!tum.length)tum.push(...tapuCksKayitlari.map(x=>x.cksSahibi).map(x=>String(x||'').trim()).filter(Boolean));const m=new Map();tum.forEach(x=>{if(!m.has(norm(x)))m.set(norm(x),x)});return[...m.values()].sort((a,b)=>a.localeCompare(b,'tr'))}function eskiAdsizVar(y){
fdCksAssert(false);
return kisiBelgeleri.some(x=>Number(x.yil)===Number(y)&&!String(x.cksSahibi||'').trim())}function secimiDuzelt(y){
fdCksAssert(false);
const l=sahipListesi(y);if(seciliSahip&&!l.some(x=>norm(x)===norm(seciliSahip)))seciliSahip='';if(!seciliSahip&&l.length)seciliSahip=l[0];return l}async function belgeleriYukle(){
try{
fdCksAssert(false);
const data=Array.isArray(window.fdTapuTumSatirlari)?window.fdTapuTumSatirlari:[];kisiBelgeleri=data.filter(x=>x?.data?.kayitTipi==='cksBelge').map(x=>({...x.data,id:String(x.data.id||x.legacy_id)}));ciz()
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
}function ciz(){
fdCksAssert(false);
if(!bar)return;const y=yil(),liste=secimiDuzelt(y),adsiz=eskiAdsizVar(y),b=belgeBul(y,seciliSahip),yaz=tapuYazabilir(),secenek=(adsiz?'<option value=""'+(!seciliSahip?' selected':'')+'>Sahibi belirtilmemiş (eski belge)</option>':'')+liste.map(x=>'<option value="'+tapuHtml(x)+'"'+(norm(x)===norm(seciliSahip)?' selected':'')+'>'+tapuHtml(x)+'</option>').join('');bar.innerHTML='<div class="cks-year-doc-main"><span class="cks-year-doc-icon">PDF</span><div class="cks-year-doc-text"><strong>'+y+' ÇKS Belgesi</strong><small>'+(b?.dosya?.ad?tapuHtml(b.dosya.ad):(seciliSahip?tapuHtml(seciliSahip)+' için PDF yüklenmedi.':'Önce ÇKS sahibini seçin.'))+'</small></div></div><div class="cks-year-doc-owner"><label>ÇKS Sahibi</label><select id="cksBelgeSahip" class="cks-field cks-owner-select" onchange="cksBelgeSahipDegisti(this.value)"><option value=""'+(!adsiz&&!seciliSahip?' selected':'')+'>Kişi seçin</option>'+secenek+'</select></div><div class="cks-year-doc-actions">'+(b?'<button class="cks-doc-btn cks-doc-view" title="Görüntüle" onclick="cksYilBelgeGoruntule()">👁</button><button class="cks-doc-btn cks-doc-download" title="İndir" onclick="cksYilBelgeIndir()">⬇</button>'+(yaz&&seciliSahip?'<button class="cks-doc-btn cks-doc-replace" title="Belgeyi değiştir" onclick="cksYilBelgeSec()">✎</button>':'')+(yaz?'<button class="cks-doc-btn cks-doc-delete" title="Belgeyi sil" onclick="cksYilBelgeSil()">🗑</button>':''):(yaz&&seciliSahip?'<button class="cks-doc-btn cks-doc-upload" onclick="cksYilBelgeSec()">＋ PDF Yükle</button>':''))+'</div>'}cksBelgeSahipDegisti=function(v){
fdCksAssert(false);
seciliSahip=String(v||'');ciz()};cksYilBelgeSec=function(){
fdCksAssert(true);
const y=yil();if(!seciliSahip)return alert('Önce ÇKS sahibini seçin.');input.value='';input.dataset.yil=String(y);input.dataset.sahip=seciliSahip;input.click()};input.onchange=()=>cksYilBelgeYukle(input.files?.[0],Number(input.dataset.yil||yil()),input.dataset.sahip||seciliSahip);function dosyaAnahtari(v){
fdCksAssert(false);
return tapuCksNorm(v).replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').toUpperCase().slice(0,80)||'KISI'}cksYilBelgeYukle=async function(dosya,y=yil(),s=seciliSahip){
try{
fdCksAssert(true);
if(!dosya)return;if(!s)return alert('ÇKS sahibini seçin.');if(dosya.type!=='application/pdf'&&!String(dosya.name).toLowerCase().endsWith('.pdf'))return alert('Yalnızca PDF dosyası yükleyebilirsiniz.');const max=ayarSayisi('pdfAzamiMb',10);if(dosya.size>max*1024*1024)return alert('PDF en fazla '+max+' MB olabilir.');const eski=belgeBul(y,s),aks=bar.querySelector('.cks-year-doc-actions');aks.innerHTML='<div id="cksBelgeIlerleme" class="cks-doc-progress" style="--p:10%"><span>Yükleniyor %10</span></div>';try{const base64=await fdCksAwait(dosyayiBase64Oku(dosya)),p=document.getElementById('cksBelgeIlerleme');p.style.setProperty('--p','45%');p.querySelector('span').textContent='Yükleniyor %45';const anahtar=dosyaAnahtari(s),ad='CKS_'+y+'_'+anahtar+'_BELGESI.pdf',d=await fdCksAwait(fdYazilimDrivePdfYukle(base64,ad,eski?.dosya?.id||'','ÇKS TAKİP'));p.style.setProperty('--p','85%');p.querySelector('span').textContent='Kaydediliyor %85';const kayit={id:'cks_belge_'+y+'_'+anahtar.toLowerCase(),kayitTipi:'cksBelge',yil:Number(y),cksSahibi:String(s),dosya:{id:d.id,url:d.url,ad:d.ad||ad,mimeType:'application/pdf'},guncellemeTarihi:new Date().toISOString()},{error}=await fdCksAwait(supabaseClient.from('portal_records').upsert({company_id:activeUser.sirketId,module:'taputakip',legacy_id:kayit.id,record_year:Number(y),employee_legacy_id:null,data:kayit},{onConflict:'company_id,module,legacy_id'}));if(error)throw error;const i=kisiBelgeleri.findIndex(x=>Number(x.yil)===Number(y)&&norm(x.cksSahibi)===norm(s));if(i>=0)kisiBelgeleri[i]=kayit;else kisiBelgeleri.push(kayit);p.style.setProperty('--p','100%');p.querySelector('span').textContent='Tamamlandı %100';setTimeout(ciz,350);showToast?.(y+' '+s+' ÇKS belgesi kaydedildi.')}catch(e){
if(!fdCksValid())return;
console.error(e);ciz();alert('ÇKS belgesi yüklenemedi: '+(e.message||e))}
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};cksYilBelgeGoruntule=function(){
fdCksAssert(false);
const b=belgeBul(yil(),seciliSahip);if(!b?.dosya?.id)return;kisiOnizleme=b;document.getElementById('cksBelgeModalBaslik').textContent=b.yil+' · '+(b.cksSahibi||'ÇKS')+' Belgesi';document.getElementById('cksBelgeFrame').src='https:\x2f\x2fdrive.google.com/file/d/'+encodeURIComponent(b.dosya.id)+'/preview';modal.style.display='flex'};cksYilBelgeKapat=function(){
fdCksAssert(false);
document.getElementById('cksBelgeFrame').src='about:blank';modal.style.display='none';kisiOnizleme=null};cksYilBelgeDriveAc=function(){
fdCksAssert(false);
const b=kisiOnizleme||belgeBul(yil(),seciliSahip);if(b?.dosya?.url)window.open(b.dosya.url,'_blank','noopener');else if(b?.dosya?.id)window.open('https:\x2f\x2fdrive.google.com/open?id='+encodeURIComponent(b.dosya.id),'_blank','noopener')};cksYilBelgeIndir=async function(){
try{
fdCksAssert(false);
const b=kisiOnizleme||belgeBul(yil(),seciliSahip);if(!b?.dosya?.id)return;showGlobalOverlay?.('ÇKS belgesi indiriliyor',(b.cksSahibi||b.yil)+' PDF hazırlanıyor...');try{const d=await fdCksAwait(fdYazilimDriveDosyaIndir(b.dosya.id,'ÇKS TAKİP')),blob=new Blob([base64DizisineCevir(d.base64)],{type:'application/pdf'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=d.ad||b.dosya.ad||('CKS_'+b.yil+'_'+dosyaAnahtari(b.cksSahibi)+'_BELGESI.pdf');fdCksAppend(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}catch(e){
if(!fdCksValid())return;
alert('Belge indirilemedi: '+(e.message||e))}finally{
if(fdCksValid()){
hideGlobalOverlay?.()
}
}
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};cksYilBelgeSil=async function(){
try{
fdCksAssert(true);
const b=belgeBul(yil(),seciliSahip);if(!b||!confirm(b.yil+' '+(b.cksSahibi||'sahibi belirtilmemiş')+' ÇKS belgesi tamamen silinsin mi?'))return;showGlobalOverlay?.('ÇKS belgesi siliniyor',(b.cksSahibi||b.yil)+' belgesi kaldırılıyor...');try{const{error}=await fdCksAwait(supabaseClient.from('portal_records').delete().eq('company_id',activeUser.sirketId).eq('module','taputakip').eq('legacy_id',String(b.id)));if(error)throw error;try{await fdCksAwait(fdYazilimDrivePdfSil(b.dosya?.id||''))}catch(e){
if(!fdCksValid())return;
console.warn(e)}kisiBelgeleri=kisiBelgeleri.filter(x=>String(x.id)!==String(b.id));ciz();showToast?.('ÇKS belgesi silindi.')}catch(e){
if(!fdCksValid())return;
alert('Belge silinemedi: '+(e.message||e))}finally{
if(fdCksValid()){
hideGlobalOverlay?.()
}
}
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};const yilDegisEski=cksYilDegisti;cksYilDegisti=function(){
fdCksAssert(false);
seciliSahip='';const r=yilDegisEski.apply(this,arguments);ciz();return r};const acV129=openCksTakipApp;openCksTakipApp=async function(){
try{
fdCksAssert(false);
const r=await fdCksAwait(acV129.apply(this,arguments));try{await fdCksAwait(belgeleriYukle())}catch(e){
if(!fdCksValid())return;
console.error(e);showToast?.('Kişi bazlı ÇKS belgeleri alınamadı.','warning')}return r
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};const yenileV129=cksTakipYenile;cksTakipYenile=async function(){
try{
fdCksAssert(false);
const r=await fdCksAwait(yenileV129.apply(this,arguments));await fdCksAwait(belgeleriYukle());return r
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};ciz()})();


(function(){
fdCksAssert(false);

    const oncekiCksBelgeYukle=cksYilBelgeYukle;
    let aktarim=null,secimSatiri=-1;
    function esc(v){
fdCksAssert(false);
return typeof tapuHtml==='function'?tapuHtml(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
    function norm(v){
fdCksAssert(false);
return typeof tapuCksNorm==='function'?tapuCksNorm(v):String(v||'').toLocaleLowerCase('tr-TR').replace(/[^a-z0-9çğıöşü]+/gi,' ').trim()}
    function tarimsalTapular(){
fdCksAssert(false);
return tapuKayitlari.filter(t=>/tarla|arazi|bahce|bag|zeytinlik|cayir|tarim|sera|findik|fistik/.test(norm(t.nitelik||'')))}
    function kisiAnahtari(v){
fdCksAssert(false);
return norm(v).replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,80)||'kisi'}
    function sayi(v){
fdCksAssert(false);
const s=String(v||'').trim().replace(/\s/g,'').replace(',','.');const n=Number(s);return Number.isFinite(n)?n:0}
    function pdfSatirlariniGrupla(items){
fdCksAssert(false);
const sirali=items.filter(x=>String(x.str||'').trim()).map(x=>({s:String(x.str).trim(),x:Number(x.transform?.[4]||0),y:Number(x.transform?.[5]||0)})).sort((a,b)=>b.y-a.y||a.x-b.x),satirlar=[];sirali.forEach(it=>{let s=satirlar[satirlar.length-1];if(!s||Math.abs(s.y-it.y)>1.8){s={y:it.y,items:[]};satirlar.push(s)}s.items.push(it)});satirlar.forEach(s=>s.items.sort((a,b)=>a.x-b.x));return satirlar}
    function satirMetni(s){
fdCksAssert(false);
return s.items.map(x=>x.s).join(' ').replace(/\s+/g,' ').trim()}
    function baslangicNo(s){
fdCksAssert(false);
const no=s.items.find(x=>x.x<55&&/^\d{1,3}$/.test(x.s)),tapu=s.items.some(x=>x.x>=55&&x.x<88&&norm(x.s)==='tapu');return no&&tapu?Number(no.s):0}
    function sutun(block,min,max){
fdCksAssert(false);
return block.flatMap(s=>s.items.filter(x=>x.x>=min&&x.x<max)).map(x=>x.s).join(' ').replace(/\s+/g,' ').trim()}
    function urunTemizle(v){
fdCksAssert(false);
return String(v||'').replace(/\s*\/\s*/g,' ').replace(/\bMUHTEL[İI]F\b/gi,'').replace(/\s+/g,' ').trim().toLocaleUpperCase('tr-TR')}
    function konumAyir(v){
fdCksAssert(false);
const p=String(v||'').split('/').map(x=>x.trim()).filter(Boolean);return{il:p[0]||'',ilce:p[1]||'',mahalle:p.slice(2).join(' / ')||''}}
    function belgeSahibiniBul(metinler){
fdCksAssert(false);

        function adayTemizle(v){
fdCksAssert(false);

            const ad=String(v||'').replace(/^[\s:;,.\-]+/u,'').replace(/\s+(?:Doğum|Baba|Ana|Yerleşim|Adres|İkamet|Telefon|Veriliş|Vergi|ÇKS).*$/iu,'').replace(/\s+/g,' ').trim();
            const harf=ad.match(/\p{L}/gu)||[];
            return harf.length>=3?ad.toLocaleUpperCase('tr-TR'):'';
        }
        for(let i=0;i<metinler.length;i++){
            const satir=String(metinler[i]||''),n=norm(satir);
            if(!n.includes('adi soyadi'))continue;
            const m=satir.match(/Ad.\s*Soyad.\s*:?\s*(.*)$/iu),ad=adayTemizle(m?.[1]);
            if(ad)return ad;
        }
        for(let i=0;i<metinler.length;i++){
            const satir=String(metinler[i]||''),n=norm(satir);
            if(!n.includes('isletme adi'))continue;
            const m=satir.match(/İşletme\s+Ad.\s*:?\s*(.*)$/iu);
            let ad=adayTemizle(m?.[1]);
            if(!ad)ad=adayTemizle(metinler[i+1]);
            if(ad)return ad;
        }
        for(const satir0 of metinler){
            const satir=String(satir0||''),n=norm(satir),konum=n.indexOf(' isimli ciftci');
            if(konum<0)continue;
            const isimli=satir.search(/\s+isimli\b/iu),ad=adayTemizle(isimli>0?satir.slice(0,isimli):'');
            if(ad)return ad;
        }
        return'';
    }
    function belgeSahibiUyusuyor(secili,belgedeki){
fdCksAssert(false);
const a=norm(secili),b=norm(belgedeki);if(!a||!b)return false;if(a===b)return true;const ak=a.split(/\s+/).filter(Boolean),bk=b.split(/\s+/).filter(Boolean);if(ak.length<2||bk.length<2)return false;return b.startsWith(a+' ')||a.startsWith(b+' ')}
    async function cksPdfOku(dosya){
try{
fdCksAssert(false);

        if(typeof pdfjsLib==='undefined')throw new Error('PDF okuma bileşeni yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
        if(pdfjsLib.GlobalWorkerOptions&&!pdfjsLib.GlobalWorkerOptions.workerSrc)pdfjsLib.GlobalWorkerOptions.workerSrc='https:\x2f\x2fcdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf=await fdCksAwait(pdfjsLib.getDocument({data:new Uint8Array(await fdCksAwait(dosya.arrayBuffer()))}).promise),tumMetin=[],kayitlar=[];
        for(let p=1;p<=pdf.numPages;p++){
            const page=await fdCksAwait(pdf.getPage(p)),content=await fdCksAwait(page.getTextContent()),satirlar=pdfSatirlariniGrupla(content.items);tumMetin.push(...satirlar.map(satirMetni));
            const baslar=[];satirlar.forEach((s,i)=>{const no=baslangicNo(s);if(no)baslar.push({i,no,y:s.y})});
            baslar.forEach((b,bi)=>{const sonraki=baslar[bi+1]?.i??satirlar.length,block=satirlar.slice(b.i,sonraki).filter(s=>b.y-s.y<=24),ap=sutun(block,88,123).match(/([^\s/]+)\s*\/\s*([^\s/]+)/);if(!ap)return;const konum=konumAyir(sutun(block,385,435));kayitlar.push({sayfa:p,siraNo:b.no,ada:ap[1],parsel:ap[2],tapuAlaniDa:sayi(sutun(block,123,160)),tasarrufAlaniDa:sayi(sutun(block,160,196)),kullanilanAlanDa:sayi(sutun(block,196,232)),urun:urunTemizle(sutun(block,232,282)),suluKuru:sutun(block,329,354).replace(/\s+/g,' ').trim(),mulkiyet:sutun(block,354,385).replace(/\s+/g,' ').trim(),...konum})});
        }
        const tamam=tumMetin.join('\n'),ym=tamam.match(/\b(20\d{2})\s+Üretim\s+Yılı/iu)||norm(tamam).match(/\b(20\d{2})\s+uretim\s+yili/);return{yil:ym?Number(ym[1]):0,sahip:belgeSahibiniBul(tumMetin),kayitlar};
    
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
}
    function tapuEsle(k){
fdCksAssert(false);
let aday=tarimsalTapular().filter(t=>fdCksAdaEsit(t.ada,k.ada)&&norm(t.parsel)===norm(k.parsel));if(aday.length>1&&k.ilce){const a=aday.filter(t=>norm(t.ilce)===norm(k.ilce));if(a.length)aday=a}if(aday.length>1&&k.mahalle){const a=aday.filter(t=>norm(t.mahalle)===norm(k.mahalle));if(a.length)aday=a}if(aday.length>1&&k.tapuAlaniDa){const hedef=k.tapuAlaniDa*1000,a=aday.filter(t=>Math.abs(Number(t.toplamAlan||0)-hedef)<=5);if(a.length)aday=a}return{tapu:aday.length===1?aday[0]:null,durum:aday.length===1?'Eşleşti':(aday.length?'Birden fazla tapu bulundu':'Tapu bulunamadı'),adaySayisi:aday.length}}
    function oncekiYilBilgisi(t,y){
fdCksAssert(false);
if(!t)return{yil:Number(y)-1,ekenNotu:'',aciklama:''};const oncekiYil=Number(y)-1,liste=tapuCksKayitlari.filter(x=>Number(x.yil)===oncekiYil&&(String(x.tapuId||'')===String(t.id)||(fdCksAdaEsit(x.ada,t.ada)&&norm(x.parsel)===norm(t.parsel)&&norm(x.ilce)===norm(t.ilce)&&norm(x.mahalle)===norm(t.mahalle)))).sort((a,b)=>String(b.guncellemeTarihi||'').localeCompare(String(a.guncellemeTarihi||''))),eken=liste.find(x=>String(x.ekenNotu||'').trim()),acik=liste.find(x=>String(x.aciklama||'').trim()&&norm(x.kaynak||'')!==norm('ÇKS PDF'))||liste.find(x=>String(x.aciklama||'').trim());return{yil:oncekiYil,ekenNotu:String(eken?.ekenNotu||''),aciklama:String(acik?.aciklama||'')}}
    function modalleriKur(){
fdCksAssert(false);
if(document.getElementById('fdCksPdfKontrolModal'))return;const m=document.createElement('div');m.id='fdCksPdfKontrolModal';m.className='modal-overlay';m.style.zIndex='10060';m.innerHTML='<div class="modal-card fd-cks-review-card"><div class="modal-header"><h3>🌾 ÇKS Belgesi Kontrolü</h3><button class="modal-close" onclick="fdCksPdfKontrolKapat()">✕</button></div><div class="modal-body fd-cks-review-body"><div id="fdCksPdfOzet" class="fd-cks-review-summary"></div><div class="fd-cks-review-table-wrap"><table class="fd-cks-review-table"><thead><tr><th>Al</th><th>Sıra</th><th>Ada / Parsel</th><th>Konum</th><th>Ürün / Alan</th><th>Önceki Yıl Bilgisi</th><th>Tapu Eşleşmesi</th></tr></thead><tbody id="fdCksPdfGovde"></tbody></table></div><div class="fd-cks-review-footer"><span id="fdCksPdfNot" class="fd-cks-review-note"></span><div class="fd-cks-review-actions"><button class="fd-cks-cancel" onclick="fdCksPdfKontrolKapat()">Vazgeç</button><button id="fdCksPdfKaydetBtn" class="fd-cks-save" onclick="fdCksPdfOnayla()">Onayla ve Kaydet</button></div></div></div></div>';fdCksAppend(m);const s=document.createElement('div');s.id='fdCksTapuSecModal';s.className='modal-overlay';s.style.zIndex='10061';s.innerHTML='<div class="modal-card fd-cks-picker-card"><div class="modal-header"><h3>Tapu Parselini Seç</h3><button class="modal-close" onclick="modalKapat(\'fdCksTapuSecModal\')">✕</button></div><div class="modal-body"><input id="fdCksTapuAra" class="fd-cks-picker-search" type="search" placeholder="Ada, parsel, mahalle veya tapu sahibi ara..." oninput="fdCksTapuSecListele()"><div id="fdCksTapuSecListe" class="fd-cks-picker-list"></div></div></div>';fdCksAppend(s)}
    function kontrolCiz(){
fdCksAssert(false);
if(!aktarim)return;modalleriKur();const eslesen=aktarim.satirlar.filter(x=>x.tapu).length,secilen=aktarim.satirlar.filter(x=>x.dahil&&x.tapu).length,eksik=aktarim.satirlar.length-eslesen;document.getElementById('fdCksPdfOzet').innerHTML='<strong>'+esc(aktarim.sahip)+' · '+aktarim.yil+'</strong>'+(norm(aktarim.sahip)!==norm(aktarim.belgeSahibi)?'<span class="fd-cks-badge info" title="Belgedeki resmi unvan">Belge: '+esc(aktarim.belgeSahibi)+'</span>':'')+'<span class="fd-cks-badge info">'+aktarim.satirlar.length+' PDF satırı</span><span class="fd-cks-badge ok">'+eslesen+' tapu eşleşti</span>'+(eksik?'<span class="fd-cks-badge warn">'+eksik+' kontrol bekliyor</span>':'');document.getElementById('fdCksPdfGovde').innerHTML=aktarim.satirlar.map((r,i)=>'<tr data-ok="'+(r.tapu?'1':'0')+'"><td><input type="checkbox" '+(r.dahil&&r.tapu?'checked':'')+' '+(!r.tapu?'disabled':'')+' onchange="fdCksSatirDahil('+i+',this.checked)"></td><td>'+r.siraNo+'</td><td class="fd-cks-parcel">'+esc(r.ada)+' / '+esc(r.parsel)+'</td><td class="fd-cks-location">'+esc([r.mahalle,r.ilce].filter(Boolean).join(' / ')||'-')+'</td><td class="fd-cks-product"><strong>'+esc(r.urun||'-')+'</strong><small>'+Number(r.kullanilanAlanDa||0).toLocaleString('tr-TR',{maximumFractionDigits:3})+' da</small></td><td class="fd-cks-prev"><span>'+esc(r.onceki?.ekenNotu||'-')+'</span><small title="'+esc(r.onceki?.aciklama||'')+'">'+esc(r.onceki?.aciklama||'-')+'</small></td><td><div class="fd-cks-match"><span class="fd-cks-match-label '+(r.tapu?'ok':'warn')+'" title="'+esc(r.tapu?tapuCksEtiket(r.tapu):r.durum)+'">'+esc(r.tapu?tapuCksEtiket(r.tapu):r.durum)+'</span><button class="fd-cks-pick" title="Tapuyu seç veya değiştir" onclick="fdCksSatirTapuSec('+i+')">✎</button></div></td></tr>').join('');document.getElementById('fdCksPdfNot').textContent=eksik?eksik+' satır eşleşmedi. Tapu seçilmezse bu satırlar kaydedilmeyecek.':'Tüm satırlar tapu listesiyle eşleşti. Kontrol edip onaylayabilirsiniz.';const btn=document.getElementById('fdCksPdfKaydetBtn');btn.disabled=!secilen;btn.textContent=secilen+' Kaydı Onayla ve Kaydet';document.getElementById('fdCksPdfKontrolModal').style.display='flex'}
    fdCksSatirDahil=function(i,v){
fdCksAssert(false);
if(aktarim?.satirlar[i])aktarim.satirlar[i].dahil=!!v;kontrolCiz()};
    fdCksSatirTapuSec=function(i){
fdCksAssert(false);
if(!aktarim?.satirlar[i])return;secimSatiri=i;modalleriKur();document.getElementById('fdCksTapuAra').value=[aktarim.satirlar[i].ada,aktarim.satirlar[i].parsel].join(' / ');document.getElementById('fdCksTapuSecModal').style.display='flex';fdCksTapuSecListele()};
    fdCksTapuSecListele=function(){
fdCksAssert(false);
const q=norm(document.getElementById('fdCksTapuAra')?.value||''),liste=tarimsalTapular().filter(t=>!q||norm([t.ada,t.parsel,t.mahalle,t.ilce,t.sahibi,t.nitelik].join(' ')).includes(q.replace(/\s*\/\s*/g,' '))).slice(0,80);document.getElementById('fdCksTapuSecListe').innerHTML=liste.map(t=>'<button class="fd-cks-picker-item" onclick="fdCksTapuAta(\''+esc(String(t.id).replace(/'/g,"\\'"))+'\')"><span><strong>'+esc((t.ada||'-')+' / '+(t.parsel||'-')+' · '+(t.mahalle||'-'))+'</strong><small>'+esc([t.ilce,t.sahibi,t.nitelik].filter(Boolean).join(' · '))+'</small></span><b>Seç</b></button>').join('')||'<div class="dashboard-empty">Uygun tarla bulunamadı.</div>'};
    fdCksTapuAta=function(id){
fdCksAssert(false);
const r=aktarim?.satirlar[secimSatiri],t=tapuCksTapuBul(id);if(!r||!t)return;r.tapu=t;r.durum='Manuel eşleştirildi';r.dahil=true;modalKapat('fdCksTapuSecModal');kontrolCiz()};
    fdCksPdfKontrolKapat=function(){
fdCksAssert(false);
const m=document.getElementById('fdCksPdfKontrolModal');if(m)m.style.display='none';aktarim=null;secimSatiri=-1};
    async function belgeKaydiniDogrula(y,s,baslangic){
try{
fdCksAssert(false);
const id='cks_belge_'+Number(y)+'_'+kisiAnahtari(s),{data,error}=await fdCksAwait(supabaseClient.from('portal_records').select('legacy_id,data').eq('company_id',activeUser.sirketId).eq('module','taputakip').eq('legacy_id',id).maybeSingle());if(error)throw error;const tarih=Date.parse(data?.data?.guncellemeTarihi||'');if(!data||!Number.isFinite(tarih)||tarih<baslangic-3000)throw new Error('Belge yükleme işlemi tamamlanmadı. ÇKS kayıtları kaydedilmedi.');return data.data
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
}
    async function pdfKayitlariniKaydet(){
try{
fdCksAssert(false);
const secilen=aktarim.satirlar.filter(x=>x.dahil&&x.tapu),anahtar=kisiAnahtari(aktarim.sahip),prefix='cks_pdf_'+aktarim.yil+'_'+anahtar+'_',simdi=new Date().toISOString(),kayitlar=secilen.map((r,i)=>{const t=r.tapu,id=prefix+String(r.siraNo||i+1).padStart(3,'0');return{id,kayitTipi:'cks',tapuId:String(t.id),eslesmeDurumu:'eslesti',ada:String(t.ada||''),parsel:String(t.parsel||''),il:String(t.il||r.il||''),ilce:String(t.ilce||r.ilce||''),mahalle:String(t.mahalle||r.mahalle||''),malik:String(t.sahibi||''),toplamAlan:Number(t.toplamAlan||0),sahipOlunanAlan:Number(t.sahipOlunanAlan||0),hisseDurumu:String(t.hisseDurumu||''),yil:Number(aktarim.yil),urun:String(r.urun||'').toLocaleUpperCase('tr-TR'),ekenNotu:String(r.onceki?.ekenNotu||''),cksSahibi:String(aktarim.sahip).toLocaleUpperCase('tr-TR'),belgedekiCksSahibi:String(aktarim.belgeSahibi||aktarim.sahip).toLocaleUpperCase('tr-TR'),aciklama:String(r.onceki?.aciklama||''),pdfAktarimNotu:'Belge sıra '+r.siraNo+' · Kullanılan alan '+Number(r.kullanilanAlanDa||0).toLocaleString('tr-TR',{maximumFractionDigits:3})+' da',oncekiYilBilgisi:Number(aktarim.yil)-1,kaynak:'ÇKS PDF',kaynakBelgeId:'cks_belge_'+aktarim.yil+'_'+anahtar,cksSiraNo:r.siraNo,pdfTapuAlaniDa:r.tapuAlaniDa,pdfTasarrufAlaniDa:r.tasarrufAlaniDa,pdfKullanilanAlanDa:r.kullanilanAlanDa,suluKuru:r.suluKuru,mulkiyetKodu:r.mulkiyet,guncellemeTarihi:simdi}}),rows=kayitlar.map(k=>({company_id:activeUser.sirketId,module:'taputakip',legacy_id:k.id,record_year:Number(k.yil),employee_legacy_id:null,data:k}));const del=await fdCksAwait(supabaseClient.from('portal_records').delete().eq('company_id',activeUser.sirketId).eq('module','taputakip').like('legacy_id',prefix+'%'));if(del.error)throw del.error;for(let i=0;i<rows.length;i+=100){const{error}=await fdCksAwait(supabaseClient.from('portal_records').upsert(rows.slice(i,i+100),{onConflict:'company_id,module,legacy_id'}));if(error)throw error}tapuCksKayitlari=tapuCksKayitlari.filter(x=>!String(x.id||'').startsWith(prefix));tapuCksKayitlari.push(...kayitlar);return kayitlar.length
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
}
    fdCksPdfOnayla=async function(){
try{
fdCksAssert(true);
if(!aktarim)return;const secilen=aktarim.satirlar.filter(x=>x.dahil&&x.tapu),atlanacak=aktarim.satirlar.length-secilen.length;if(!secilen.length)return alert('Kaydedilecek eşleşmiş satır bulunmuyor.');if(atlanacak&&!confirm(atlanacak+' satır kaydedilmeyecek. Eşleşen '+secilen.length+' kayıtla devam edilsin mi?'))return;const btn=document.getElementById('fdCksPdfKaydetBtn'),durum={...aktarim};btn.disabled=true;btn.textContent='Belge yükleniyor...';showGlobalOverlay?.('ÇKS belgesi ve kayıtlar kaydediliyor',secilen.length+' parsel hazırlanıyor...');try{const baslangic=Date.now();await fdCksAwait(oncekiCksBelgeYukle(durum.dosya,durum.yil,durum.sahip));await fdCksAwait(belgeKaydiniDogrula(durum.yil,durum.sahip,baslangic));btn.textContent='Parseller kaydediliyor...';aktarim=durum;const adet=await fdCksAwait(pdfKayitlariniKaydet());document.getElementById('fdCksPdfKontrolModal').style.display='none';aktarim=null;tapuCksFiltreleriYenile?.();if(typeof cksTakipYenile==='function')await fdCksAwait(cksTakipYenile());else{if(typeof tapuCksGenelCiz==='function')tapuCksGenelCiz();if(document.getElementById('modalTapuDetay')?.style.display==='flex')tapuCksDetayCiz(fdTapuDetayKimligi())}showToast?.(adet+' ÇKS parsel kaydı onaylanıp kaydedildi.')}catch(e){
if(!fdCksValid())return;
console.error(e);alert('ÇKS aktarımı tamamlanamadı: '+(e.message||e));if(aktarim){btn.disabled=false;kontrolCiz()}}finally{
if(fdCksValid()){
hideGlobalOverlay?.()
}
}
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};
    cksYilBelgeYukle=async function(dosya,y=Number(document.getElementById('cksYil')?.value||new Date().getFullYear()),s=document.getElementById('cksBelgeSahip')?.value||''){
try{
fdCksAssert(true);
if(!dosya)return;if(!s)return alert('Önce ÇKS sahibini seçin.');if(dosya.type!=='application/pdf'&&!String(dosya.name).toLowerCase().endsWith('.pdf'))return alert('Yalnızca PDF dosyası yükleyebilirsiniz.');const max=ayarSayisi('pdfAzamiMb',10);if(dosya.size>max*1024*1024)return alert('PDF en fazla '+max+' MB olabilir.');showGlobalOverlay?.('ÇKS belgesi okunuyor','Kişi, yıl ve parsel kayıtları kontrol ediliyor...');try{const sonuc=await fdCksAwait(cksPdfOku(dosya)),belgeSahibi=String(sonuc.sahip||'').trim();if(!belgeSahibi)throw new Error('Belgedeki “Adı Soyadı” bilgisi okunamadı. Belge kaydedilmedi.');if(!belgeSahibiUyusuyor(s,belgeSahibi)){alert('Kişi / işletme uyuşmuyor.\n\nSeçilen kişi: '+s+'\nBelgede yazan kişi: '+belgeSahibi+'\n\nYanlış kişiye kayıt yapılmadı.');return}if(!sonuc.yil)throw new Error('Belgedeki üretim yılı okunamadı. Belge kaydedilmedi.');if(Number(sonuc.yil)!==Number(y)){alert('Yıl uyuşmuyor.\n\nSeçilen yıl: '+y+'\nBelgedeki üretim yılı: '+sonuc.yil+'\n\nKayıt yapılmadı.');return}if(!sonuc.kayitlar.length)throw new Error('Belgede parsel kaydı bulunamadı.');const satirlar=sonuc.kayitlar.map(r=>{const e=tapuEsle(r),onceki=oncekiYilBilgisi(e.tapu,sonuc.yil);return{...r,...e,onceki,dahil:!!e.tapu}});aktarim={dosya,yil:Number(sonuc.yil),sahip:String(s),belgeSahibi:belgeSahibi,satirlar};kontrolCiz()}catch(e){
if(!fdCksValid())return;
console.error(e);alert('ÇKS belgesi okunamadı: '+(e.message||e))}finally{
if(fdCksValid()){
hideGlobalOverlay?.()
}
}
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};
    modalleriKur();
})();



(function(){
fdCksAssert(false);

    function norm(v){
fdCksAssert(false);
return tapuCksNorm(String(v||''))}
    function tarimsal(t){
fdCksAssert(false);
return /tarla|arazi|bahce|bag|zeytinlik|cayir|tarim|sera|findik|fistik/.test(norm(t?.nitelik||''))}
    function tarlaSahipleri(){
fdCksAssert(false);
const m=new Map();[...tapuKayitlari.filter(tarimsal).map(t=>t.sahibi),...tapuCksKayitlari.map(c=>c.cksSahibi)].map(s=>String(s||'').trim()).filter(Boolean).forEach(s=>{if(!m.has(norm(s)))m.set(norm(s),s)});return[...m.values()].sort((a,b)=>a.localeCompare(b,'tr'))}
    function sahipListeleriniDuzelt(){
fdCksAssert(false);

        const sahipler=tarlaSahipleri(),d=document.getElementById('tapuCksSahipListe');
        if(d)d.innerHTML=sahipler.map(s=>'<option value="'+tapuHtml(s)+'"></option>').join('');
        const select=document.getElementById('cksBelgeSahip');
        if(select){
            [...select.options].forEach(o=>{if(o.value&&!sahipler.some(s=>norm(s)===norm(o.value)))o.remove()});
            if(select.value&&!sahipler.some(s=>norm(s)===norm(select.value)))select.value='';
        }
    }
    function parselSeciminiEsitle(){
fdCksAssert(false);

        const input=document.getElementById('tapuCksTapuAra'),select=document.getElementById('tapuCksTapuSec');
        if(!input||!select)return null;
        const metin=String(input.value||'').trim(),liste=Array.isArray(input._cksSecenekler)?input._cksSecenekler:[];
        let secim=liste.find(x=>String(x.etiket)===metin)||liste.find(x=>norm(x.etiket)===norm(metin));
        if(!secim&&select.value)secim=liste.find(x=>String(x.id)===String(select.value));
        if(secim){select.value=String(secim.id);input.dataset.tapuId=String(secim.id);return secim}
        select.value='';delete input.dataset.tapuId;return null;
    }
    function parselOlaylariniKur(){
fdCksAssert(false);

        const input=document.getElementById('tapuCksTapuAra');if(!input||input.dataset.fdCksSync==='1')return;
        input.dataset.fdCksSync='1';['input','change','blur'].forEach(ad=>fdCksListen(input,ad,()=>setTimeout(parselSeciminiEsitle,0)));
    }
    const formEski=tapuCksFormuAc;
    tapuCksFormuAc=function(){
fdCksAssert(true);
const r=formEski.apply(this,arguments);setTimeout(()=>{parselOlaylariniKur();parselSeciminiEsitle();sahipListeleriniDuzelt()},0);return r};
    const kaydetEski=tapuCksKaydet;
    tapuCksKaydet=async function(e){
try{
fdCksAssert(true);

        const input=document.getElementById('tapuCksTapuAra'),select=document.getElementById('tapuCksTapuSec');
        if(input&&select&&!select.value){const secim=parselSeciminiEsitle();if(!secim){e?.preventDefault?.();return alert('Listeden geçerli bir tapu parseli seçin.')}}
        const r=await fdCksAwait(kaydetEski.apply(this,arguments));sahipListeleriniDuzelt();return r;
    
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};
    const acEski=openCksTakipApp;
    openCksTakipApp=async function(){
try{
fdCksAssert(false);
const r=await fdCksAwait(acEski.apply(this,arguments));sahipListeleriniDuzelt();return r
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};
    const yenileEski=cksTakipYenile;
    cksTakipYenile=async function(){
try{
fdCksAssert(false);
const r=await fdCksAwait(yenileEski.apply(this,arguments));sahipListeleriniDuzelt();return r
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};
    const yilEski=cksYilDegisti;
    cksYilDegisti=function(){
fdCksAssert(false);
const r=yilEski.apply(this,arguments);setTimeout(sahipListeleriniDuzelt,0);return r};
    sahipListeleriniDuzelt();
})();



(function(){
fdCksAssert(false);

    const palet=[
        {arka:'#dcfce7',yazi:'#166534',kenar:'#86efac',satir:'#22c55e'},
        {arka:'#dbeafe',yazi:'#1e40af',kenar:'#93c5fd',satir:'#3b82f6'},
        {arka:'#ede9fe',yazi:'#5b21b6',kenar:'#c4b5fd',satir:'#8b5cf6'},
        {arka:'#ffedd5',yazi:'#9a3412',kenar:'#fdba74',satir:'#f97316'},
        {arka:'#ffe4e6',yazi:'#9f1239',kenar:'#fda4af',satir:'#f43f5e'},
        {arka:'#ccfbf1',yazi:'#115e59',kenar:'#5eead4',satir:'#14b8a6'},
        {arka:'#fef3c7',yazi:'#92400e',kenar:'#fcd34d',satir:'#eab308'}
    ];
    function renk(yil){
fdCksAssert(false);
const fark=2026-Number(yil||0),i=((fark%palet.length)+palet.length)%palet.length;return palet[i]}
    function uygula(){
fdCksAssert(false);

        document.querySelectorAll('#cksDetayGovde .cks-year').forEach(rozet=>{
            const yil=Number(String(rozet.textContent||'').replace(/\D/g,''));if(!yil)return;
            const r=renk(yil),tr=rozet.closest('tr');
            rozet.classList.add('fd-cks-year-badge');
            rozet.style.setProperty('--fd-cks-yil-arka',r.arka);rozet.style.setProperty('--fd-cks-yil-yazi',r.yazi);rozet.style.setProperty('--fd-cks-yil-kenar',r.kenar);
            if(tr){tr.classList.add('fd-cks-year-row');tr.style.setProperty('--fd-cks-yil-renk',r.satir)}
        });
    }
    const govde=document.getElementById('cksDetayGovde');if(govde)new MutationObserver(uygula).observe(govde,{childList:true,subtree:true});
    uygula();
})();



(function(){
fdCksAssert(false);

    function modalKur(){
fdCksAssert(false);

        if(document.getElementById('fdCksCokluDuzenleModal'))return;
        const m=document.createElement('div');m.id='fdCksCokluDuzenleModal';m.className='modal-overlay';m.style.zIndex='10070';
        m.innerHTML='<div class="modal-card"><div class="modal-header"><h3>ÇKS Kaydını Düzenle</h3><button class="modal-close" onclick="modalKapat(\'fdCksCokluDuzenleModal\')">✕</button></div><div class="modal-body"><div id="fdCksCokluDuzenleListe"></div></div></div>';
        fdCksAppend(m);
    }
    function butonKaydi(btn){
fdCksAssert(false);

        const metin=String(btn.getAttribute('onclick')||'');
        const es=metin.match(/tapuCksFormuAc\('([^']*)','([^']*)'\)/);
        return es?{tapuId:es[1],id:es[2]}:null;
    }
    fdCksCokluKayitSec=function(btn){
fdCksAssert(false);

        modalKur();
        let secimler=[];try{secimler=JSON.parse(decodeURIComponent(btn.dataset.fdCksKayitlar||''))}catch(e){
if(!fdCksValid())return;
}
        const kayitlar=secimler.map(s=>tapuCksKayitlari.find(x=>String(x.id)===String(s.id))).filter(Boolean);
        if(!kayitlar.length)return;
        if(kayitlar.length===1)return tapuCksFormuAc(String(kayitlar[0].tapuId||''),String(kayitlar[0].id));
        document.getElementById('fdCksCokluDuzenleListe').innerHTML=kayitlar.map(k=>'<div class="fd-cks-edit-choice"><span class="year">'+tapuHtml(k.yil||'-')+'</span><div><strong>'+tapuHtml(k.urun||'Ürün bilgisi yok')+'</strong><small>'+tapuHtml(k.ekenNotu||k.aciklama||'Düzenlenecek kaydı seçin')+'</small></div><button title="Bu kaydı düzenle" onclick="fdCksCokluKayitDuzenle(\''+encodeURIComponent(String(k.tapuId||''))+'\',\''+encodeURIComponent(String(k.id))+'\')">✎</button></div>').join('');
        document.getElementById('fdCksCokluDuzenleModal').style.display='flex';
    };
    fdCksCokluKayitDuzenle=function(tapuId,id){
fdCksAssert(true);
modalKapat('fdCksCokluDuzenleModal');tapuCksFormuAc(decodeURIComponent(tapuId),decodeURIComponent(id))};
    function tekKalemYap(){
fdCksAssert(false);

        document.querySelectorAll('#cksListeGovde tr').forEach(tr=>{
            const kalemler=[...tr.querySelectorAll('td:last-child .cks-icon-btn.edit')];if(kalemler.length<2)return;
            const secimler=kalemler.map(butonKaydi).filter(Boolean),kalem=kalemler[0];
            kalemler.slice(1).forEach(b=>b.remove());
            kalem.setAttribute('onclick','fdCksCokluKayitSec(this)');
            kalem.dataset.fdCksKayitlar=encodeURIComponent(JSON.stringify(secimler));
            kalem.title='Bu yıldaki kaydı seçip düzenle';kalem.dataset.fdCksCoklu='1';
        });
    }
    const govde=document.getElementById('cksListeGovde');if(govde)new MutationObserver(tekKalemYap).observe(govde,{childList:true,subtree:true});
    tekKalemYap();
})();



(function(){
fdCksAssert(false);

    let duzenlenenKayitId='',kayitIslemde=false;
    const formAcEski=tapuCksFormuAc;
    tapuCksFormuAc=function(tapuId='',id=''){
fdCksAssert(true);

        const kayit=id?tapuCksKayitlari.find(x=>String(x.id)===String(id)):null;
        duzenlenenKayitId=kayit?String(kayit.id):'';
        const r=formAcEski.apply(this,arguments);
        const gizli=document.getElementById('tapuCksId');
        if(gizli){gizli.value=duzenlenenKayitId;gizli.dataset.fdDuzenlenenId=duzenlenenKayitId}
        if(id&&!duzenlenenKayitId){tapuCksFormuKapat();alert('Düzenlenecek ÇKS kaydı bulunamadı. Listeyi yenileyip tekrar deneyin.')}
        return r;
    };
    const kaydetEski=tapuCksKaydet;
    tapuCksKaydet=async function(e){
try{
fdCksAssert(true);

        e?.preventDefault?.();if(kayitIslemde)return;
        const gizli=document.getElementById('tapuCksId'),kilit=duzenlenenKayitId||String(gizli?.dataset.fdDuzenlenenId||'');
        if(kilit){
            if(!tapuCksKayitlari.some(x=>String(x.id)===String(kilit)))return alert('Düzenlenen eski kayıt bulunamadı. Yeni kayıt açılmadı. Listeyi yenileyip tekrar deneyin.');
            gizli.value=String(kilit);
        }
        kayitIslemde=true;
        try{return await fdCksAwait(kaydetEski.apply(this,arguments))}finally{
if(fdCksValid()){
kayitIslemde=false;duzenlenenKayitId='';if(gizli)delete gizli.dataset.fdDuzenlenenId
}
}
    
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};
    fdCksCokluKayitSec=function(btn){
fdCksAssert(false);

        let secimler=[];try{secimler=JSON.parse(decodeURIComponent(btn.dataset.fdCksKayitlar||''))}catch(e){
if(!fdCksValid())return;
}
        const kayitlar=secimler.map(s=>tapuCksKayitlari.find(x=>String(x.id)===String(s.id))).filter(Boolean);
        if(!kayitlar.length)return;
        if(kayitlar.length===1)return tapuCksFormuAc(String(kayitlar[0].tapuId||''),String(kayitlar[0].id));
        const liste=document.getElementById('fdCksCokluDuzenleListe');if(!liste)return;
        liste.innerHTML=kayitlar.map(k=>'<div class="fd-cks-edit-choice"><span class="year">'+tapuHtml(k.yil||'-')+'</span><div><strong>'+tapuHtml(k.urun||'Ürün bilgisi yok')+'</strong><small>'+tapuHtml(k.ekenNotu||k.aciklama||'Kayıt bilgisi yok')+'</small></div><span class="fd-cks-choice-actions"><button title="Bu kaydı düzenle" onclick="fdCksCokluKayitDuzenle(\''+encodeURIComponent(String(k.tapuId||''))+'\',\''+encodeURIComponent(String(k.id))+'\')">✎</button><button class="delete" title="Bu kaydı sil" onclick="fdCksCokluKayitSil(\''+encodeURIComponent(String(k.id))+'\')">🗑</button></span></div>').join('');
        document.getElementById('fdCksCokluDuzenleModal').style.display='flex';
    };
    fdCksCokluKayitSil=async function(kodluId){
try{
fdCksAssert(true);

        const id=decodeURIComponent(kodluId),once=tapuCksKayitlari.some(x=>String(x.id)===String(id));
        if(!once)return;
        await fdCksAwait(tapuCksSil(id));
        if(!tapuCksKayitlari.some(x=>String(x.id)===String(id))){modalKapat('fdCksCokluDuzenleModal');showToast?.('Fazla ÇKS kaydı silindi.')}
    
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};
})();



(function(){
fdCksAssert(false);

    if(document.getElementById('fdCksCokluDuzenleModal'))return;
    const m=document.createElement('div');m.id='fdCksCokluDuzenleModal';m.className='modal-overlay';m.style.zIndex='10070';
    m.innerHTML='<div class="modal-card"><div class="modal-header"><h3>ÇKS Kaydını Düzenle veya Sil</h3><button class="modal-close" onclick="modalKapat(\'fdCksCokluDuzenleModal\')">✕</button></div><div class="modal-body"><div id="fdCksCokluDuzenleListe"></div></div></div>';
    fdCksAppend(m);
})();



(function(){
fdCksAssert(false);

    function eksikleriIsaretle(){
fdCksAssert(false);

        document.querySelectorAll('#cksListeGovde tr').forEach(tr=>{
            const urun=[...tr.querySelectorAll('.cks-product')].find(x=>tapuCksNorm(x.textContent)==='cks verilmedi');
            if(!urun||tr.dataset.fdCksV147==='1')return;
            tr.dataset.fdCksV147='1';tr.classList.add('cks-missing-row');urun.classList.add('cks-missing-badge');
            const durum=[...tr.querySelectorAll('td:nth-child(6) span')].find(x=>/Yeni Alındı|Boşta/i.test(x.textContent||''));if(durum)durum.classList.add(durum.textContent.includes('Yeni')?'cks-new-badge':'cks-missing-badge');
            const edit=tr.querySelector('td:last-child button');if(edit){edit.textContent='＋';edit.title='Bu parsele ÇKS kaydı ekle'}
            const gecmis=tr.querySelector('td:nth-last-child(2) button');if(gecmis){gecmis.textContent='Kayıt yok';const onclick=edit?.getAttribute('onclick');if(onclick)gecmis.setAttribute('onclick',onclick)}
        });
    }
    const govde=document.getElementById('cksListeGovde');if(govde)new MutationObserver(eksikleriIsaretle).observe(govde,{childList:true,subtree:true});
    const formEski=tapuCksFormuAc;
    tapuCksFormuAc=function(tapuId='',kayitId=''){
fdCksAssert(true);

        const r=formEski.apply(this,arguments);
        setTimeout(()=>{if(!kayitId&&document.getElementById('cksTakipApp')?.style.display!=='none'){const y=document.getElementById('cksYil')?.value,alan=document.getElementById('tapuCksYil');if(y&&alan)alan.value=y}},20);
        return r;
    };
    eksikleriIsaretle();
})();



(function(){
fdCksAssert(false);

    let temizlikCalisiyor=false,temizlikYapildi=false;
    async function tumCksSatirlariniAl(){
try{
fdCksAssert(false);

        const tum=[];
        for(let bas=0;;bas+=500){
            const {data,error}=await fdCksAwait(supabaseClient.from('portal_records').select('legacy_id,data').eq('company_id',activeUser.sirketId).eq('module','taputakip').like('legacy_id','cks_%').order('legacy_id').range(bas,bas+499));
            if(error)throw error;
            const parca=data||[];tum.push(...parca);if(parca.length<500)break;
        }
        return tum;
    
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
}
    async function yetimPdfKayitlariniTemizle(zorla=false){
try{
fdCksAssert(false);

        if(temizlikCalisiyor||(!zorla&&temizlikYapildi)||!tapuYazabilir?.())return 0;
        temizlikCalisiyor=true;
        try{
            const tum=!zorla&&Array.isArray(window.fdTapuTumSatirlari)?window.fdTapuTumSatirlari:await fdCksAwait(tumCksSatirlariniAl()),belgeler=new Set(tum.filter(x=>x?.data?.kayitTipi==='cksBelge').map(x=>String(x.legacy_id))),yetimler=tum.filter(x=>x?.data?.kayitTipi==='cks'&&x.data.kaynak==='ÇKS PDF'&&x.data.kaynakBelgeId&&!belgeler.has(String(x.data.kaynakBelgeId))),idler=yetimler.map(x=>String(x.legacy_id));
            for(let i=0;i<idler.length;i+=100){const {error}=await fdCksAwait(supabaseClient.from('portal_records').delete().eq('company_id',activeUser.sirketId).eq('module','taputakip').in('legacy_id',idler.slice(i,i+100)));if(error)throw error}
            if(idler.length){const silinen=new Set(idler);tapuCksKayitlari=tapuCksKayitlari.filter(x=>!silinen.has(String(x.id)));cksFiltreDegisti?.();showToast?.(idler.length+' adet silinen ÇKS belgesine ait tekrar kayıt kaldırıldı.','success')}
            temizlikYapildi=true;return idler.length;
        }catch(e){
if(!fdCksValid())return;
console.error('Yetim ÇKS PDF kayıtları temizlenemedi',e);showToast?.('Silinen ÇKS belgesinin eski kayıtları temizlenemedi: '+(e.message||e),'warning');return 0}
        finally{
if(fdCksValid()){
temizlikCalisiyor=false
}
}
    
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
}
    fdCksYetimPdfKayitlariniTemizle=yetimPdfKayitlariniTemizle;
    const acEski=openCksTakipApp;
    openCksTakipApp=async function(){
try{
fdCksAssert(false);
const r=await fdCksAwait(acEski.apply(this,arguments));await fdCksAwait(yetimPdfKayitlariniTemizle());return r
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};
    const silEski=cksYilBelgeSil;
    cksYilBelgeSil=async function(){
try{
fdCksAssert(true);
const r=await fdCksAwait(silEski.apply(this,arguments));await fdCksAwait(yetimPdfKayitlariniTemizle(true));return r
}catch(fdCksError){if(!fdCksValid())return;throw fdCksError;}
};
})();


}
const api={get tapuCksFiltreleriYenile(){return tapuCksFiltreleriYenile},get tapuCksParseller(){return tapuCksParseller},get tapuCksFormuAc(){return tapuCksFormuAc},get tapuCksFormuKapat(){return tapuCksFormuKapat},get tapuCksKaydet(){return tapuCksKaydet},get tapuCksSil(){return tapuCksSil},get tapuCksGenelAc(){return tapuCksGenelAc},get tapuCksGenelKapat(){return tapuCksGenelKapat},get tapuCksGenelCiz(){return tapuCksGenelCiz},get fdCksCiktiVerisi(){return fdCksCiktiVerisi},get cksParselDetayAc(){return cksParselDetayAc},get cksListeyeDon(){return cksListeyeDon},get cksAktifParseleYeniKayit(){return cksAktifParseleYeniKayit},get cksFiltreDegisti(){return cksFiltreDegisti},get cksYilDegisti(){return cksYilDegisti},get cksFiltreTemizle(){return cksFiltreTemizle},get cksSayfaDegistir(){return cksSayfaDegistir},get cksSayfaBoyutuDegistir(){return cksSayfaBoyutuDegistir},get cksTakipYenile(){return cksTakipYenile},get openCksTakipApp(){return openCksTakipApp},get cksYilBelgeSec(){return cksYilBelgeSec},get cksYilBelgeYukle(){return cksYilBelgeYukle},get cksYilBelgeGoruntule(){return cksYilBelgeGoruntule},get cksYilBelgeKapat(){return cksYilBelgeKapat},get cksYilBelgeDriveAc(){return cksYilBelgeDriveAc},get cksYilBelgeIndir(){return cksYilBelgeIndir},get cksYilBelgeSil(){return cksYilBelgeSil},get cksBelgeSahipDegisti(){return cksBelgeSahipDegisti},get fdCksSatirDahil(){return fdCksSatirDahil},get fdCksSatirTapuSec(){return fdCksSatirTapuSec},get fdCksTapuSecListele(){return fdCksTapuSecListele},get fdCksTapuAta(){return fdCksTapuAta},get fdCksPdfKontrolKapat(){return fdCksPdfKontrolKapat},get fdCksPdfOnayla(){return fdCksPdfOnayla},get fdCksCokluKayitSec(){return fdCksCokluKayitSec},get fdCksCokluKayitDuzenle(){return fdCksCokluKayitDuzenle},get fdCksCokluKayitSil(){return fdCksCokluKayitSil},get fdCksYetimPdfKayitlariniTemizle(){return fdCksYetimPdfKayitlariniTemizle}};
return{init(){document.querySelector("[data-cks-frame-host]").outerHTML="<iframe id=\"cksBelgeFrame\" style=\"width:100%;height:100%;border:0;background:#f8fafc\"></iframe>";fdCksInitialize();window.fdVarlikKisiListesiniGuncelle?.();window.fdSupplementalOutputInstall?.();window.fdUnifiedOutput?.scan()},open(...args){fdCksAssert();if(args[0]?.fdCksAction)return api[args[0].fdCksAction](...args[0].args);return openCksTakipApp(...args)},api,dispose(){fdCksDisposed=true;const tab=typeof fdAcikUygulamaSekmeleri!=="undefined"?fdAcikUygulamaSekmeleri.find(t=>t.anahtar==="cks"):null;if(tab)tab.alanId="";for(const[t,...a]of fdCksListeners)t.removeEventListener(...a);for(const id of fdCksTimers)window.clearTimeout(id);for(const o of fdCksObservers)o.disconnect();for(const u of fdCksUrls)window.URL.revokeObjectURL(u);for(const n of fdCksNodes)n.remove();const f=document.getElementById("cksBelgeFrame");if(f)f.src="about:blank";document.querySelectorAll("[data-fd-module-root=cks] input[type=file]").forEach(f=>f.value="");document.getElementById("tapuCksForm")?.reset();}};
});
