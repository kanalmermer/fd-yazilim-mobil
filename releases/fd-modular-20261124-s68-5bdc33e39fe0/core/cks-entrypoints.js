const CKS_MODUL={anahtar:'cks',ad:'ÇKS Takip',aciklama:'Parsellerin yıllara göre ÇKS, ürün ve eken kişi geçmişini takip edin',ikon:'🌾',renk:'linear-gradient(135deg,#166534,#84cc16)',fonksiyon:'openCksTakipApp',roller:['Admin','Yonetici'],yetkiler:{Admin:'yazma',Yonetici:'yazma',Personel:'yok'},aktif:true};
if(!VARSAYILAN_ANA_MENU_MODULLERI.some(x=>x.anahtar==='cks')){const i=VARSAYILAN_ANA_MENU_MODULLERI.findIndex(x=>x.anahtar==='tapu');VARSAYILAN_ANA_MENU_MODULLERI.splice(i<0?VARSAYILAN_ANA_MENU_MODULLERI.length:i+1,0,CKS_MODUL)}
if(!Array.isArray(uygulamaAyarlari.anaMenuModulleri))uygulamaAyarlari.anaMenuModulleri=[];
if(!uygulamaAyarlari.anaMenuModulleri.some(x=>x.anahtar==='cks'))uygulamaAyarlari.anaMenuModulleri.push({...CKS_MODUL,sira:6.5});
ANA_MENU_MODUL_KOKLERI.cks='#cksTakipApp';
fdUygulamaSekmeTanimlari.cks={ad:'ÇKS Takip',ikon:'🌾',acilis:'openCksTakipApp'};
fdSekmeFonksiyonlari.openCksTakipApp='cks';
if(!fdSekmeAlanlari.includes('cksTakipApp'))fdSekmeAlanlari.push('cksTakipApp');
const launcher=document.querySelector('#appHub .workspace-launcher');
if(launcher&&!launcher.querySelector('[data-ana-menu-modul="cks"]')){const card=document.createElement('button');card.type='button';card.className='workspace-card';card.dataset.anaMenuModul='cks';card.onclick=e=>anaMenuModulunuAc('cks',e);card.innerHTML='<span class="workspace-card-icon" style="background:linear-gradient(135deg,#166534,#84cc16)" aria-hidden="true">🌾</span><span><strong>ÇKS Takip</strong><small>Parsellerin yıllara göre ÇKS ve ürün geçmişini takip edin</small></span><b style="color:#166534">Modülü aç →</b>';const tapu=launcher.querySelector('[data-ana-menu-modul="tapu"]')||[...launcher.children].find(x=>String(x.getAttribute('onclick')||'').includes('openTapuTakipApp'));tapu?.after(card)}
function tapuCksFiltreleriYenile(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','tapuCksFiltreleriYenile',args,this)}
function tapuCksParseller(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','tapuCksParseller',args,this)}
function tapuCksFormuAc(){const args=Array.from(arguments);if(!FDModules.status('cks').loaded)return FDModules.open('cks',[{fdCksAction:'tapuCksFormuAc',args}],this);return FDModules.callIfLoaded('cks','tapuCksFormuAc',args,this)}
function tapuCksFormuKapat(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','tapuCksFormuKapat',args,this)}
function tapuCksKaydet(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','tapuCksKaydet',args,this)}
function tapuCksSil(){const args=Array.from(arguments);if(!FDModules.status('cks').loaded)return FDModules.open('cks',[{fdCksAction:'tapuCksSil',args}],this);return FDModules.callIfLoaded('cks','tapuCksSil',args,this)}
function tapuCksGenelAc(){const args=Array.from(arguments);if(!FDModules.status('cks').loaded)return FDModules.open('cks',[{fdCksAction:'tapuCksGenelAc',args}],this);return FDModules.callIfLoaded('cks','tapuCksGenelAc',args,this)}
function tapuCksGenelKapat(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','tapuCksGenelKapat',args,this)}
function tapuCksGenelCiz(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','tapuCksGenelCiz',args,this)}
function fdCksCiktiVerisi(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','fdCksCiktiVerisi',args,this)}
function cksParselDetayAc(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksParselDetayAc',args,this)}
function cksListeyeDon(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksListeyeDon',args,this)}
function cksAktifParseleYeniKayit(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksAktifParseleYeniKayit',args,this)}
function cksFiltreDegisti(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksFiltreDegisti',args,this)}
function cksYilDegisti(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksYilDegisti',args,this)}
function cksFiltreTemizle(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksFiltreTemizle',args,this)}
function cksSayfaDegistir(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksSayfaDegistir',args,this)}
function cksSayfaBoyutuDegistir(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksSayfaBoyutuDegistir',args,this)}
function cksTakipYenile(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksTakipYenile',args,this)}
function openCksTakipApp(){return FDModules.open('cks',Array.from(arguments),this)}
function cksYilBelgeSec(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksYilBelgeSec',args,this)}
function cksYilBelgeYukle(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksYilBelgeYukle',args,this)}
function cksYilBelgeGoruntule(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksYilBelgeGoruntule',args,this)}
function cksYilBelgeKapat(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksYilBelgeKapat',args,this)}
function cksYilBelgeDriveAc(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksYilBelgeDriveAc',args,this)}
function cksYilBelgeIndir(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksYilBelgeIndir',args,this)}
function cksYilBelgeSil(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksYilBelgeSil',args,this)}
function cksBelgeSahipDegisti(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','cksBelgeSahipDegisti',args,this)}
function fdCksSatirDahil(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','fdCksSatirDahil',args,this)}
function fdCksSatirTapuSec(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','fdCksSatirTapuSec',args,this)}
function fdCksTapuSecListele(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','fdCksTapuSecListele',args,this)}
function fdCksTapuAta(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','fdCksTapuAta',args,this)}
function fdCksPdfKontrolKapat(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','fdCksPdfKontrolKapat',args,this)}
function fdCksPdfOnayla(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','fdCksPdfOnayla',args,this)}
function fdCksCokluKayitSec(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','fdCksCokluKayitSec',args,this)}
function fdCksCokluKayitDuzenle(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','fdCksCokluKayitDuzenle',args,this)}
function fdCksCokluKayitSil(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','fdCksCokluKayitSil',args,this)}
function fdCksYetimPdfKayitlariniTemizle(){const args=Array.from(arguments);return FDModules.callIfLoaded('cks','fdCksYetimPdfKayitlariniTemizle',args,this)}
