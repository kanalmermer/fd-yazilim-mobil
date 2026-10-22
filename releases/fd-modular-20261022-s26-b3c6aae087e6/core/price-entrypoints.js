// Stable menu/permission/tab registration only. Price records, forms and writes are lazy.
(function(){const MODUL='insaatfiyat';
function moduluKur(){if(!VARSAYILAN_ANA_MENU_MODULLERI.some(m=>m.anahtar===MODUL))VARSAYILAN_ANA_MENU_MODULLERI.splice(Math.min(7,VARSAYILAN_ANA_MENU_MODULLERI.length),0,{anahtar:MODUL,ad:'İnşaat Malzemeleri',aciklama:'Güncel satış fiyatları, tarihli fiyat sayfaları ve ürün fiyat geçmişi',ikon:'🧱',renk:'linear-gradient(135deg,#047857,#d97706)',fonksiyon:'openInsaatFiyatApp',roller:['Admin','Yonetici'],yetkiler:{Admin:'yazma',Yonetici:'yazma',Personel:'yok'},aktif:true});ANA_MENU_MODUL_KOKLERI[MODUL]='#insaatFiyatApp';fdUygulamaSekmeTanimlari[MODUL]={ad:'İnşaat Malzemeleri',ikon:'🧱',acilis:'openInsaatFiyatApp'};fdSekmeFonksiyonlari.openInsaatFiyatApp=MODUL;if(!fdSekmeAlanlari.includes('insaatFiyatApp'))fdSekmeAlanlari.push('insaatFiyatApp');const launcher=document.querySelector('#appHub .workspace-launcher');if(launcher&&!launcher.querySelector('[data-ana-menu-modul="'+MODUL+'"]')){const kart=document.createElement('button');kart.type='button';kart.className='workspace-card';kart.dataset.anaMenuModul=MODUL;kart.onclick=e=>anaMenuModulunuAc(MODUL,e);kart.innerHTML='<span class="workspace-card-icon" aria-hidden="true">🧱</span><span><strong>İnşaat Malzemeleri</strong><small>Güncel fiyatlar ve ürün geçmişi</small></span><b>Modülü aç →</b>';launcher.appendChild(kart)}anaMenuModulKartlariniUygula();fdSekmeSisteminiKur()}
function modulAdiniGuncelle(){const m=VARSAYILAN_ANA_MENU_MODULLERI.find(x=>x.anahtar===MODUL);if(m){m.ad='Fiyat ve Teklifler';m.aciklama='Firmalara göre güncel fiyatlar, tarihli sayfalar ve ürün geçmişi';m.ikon='💼'}if(fdUygulamaSekmeTanimlari?.[MODUL]){fdUygulamaSekmeTanimlari[MODUL].ad='Fiyat ve Teklifler';fdUygulamaSekmeTanimlari[MODUL].ikon='💼'}anaMenuModulKartlariniUygula?.();const kart=document.querySelector('#appHub .workspace-launcher [data-ana-menu-modul="'+MODUL+'"]');if(kart){const ikon=kart.querySelector('.workspace-card-icon'),ad=kart.querySelector('strong'),aciklama=kart.querySelector('small');if(ikon)ikon.textContent='💼';if(ad)ad.textContent='Fiyat ve Teklifler';if(aciklama)aciklama.textContent='Firmalara göre güncel ve geçmiş fiyatlar'}}
function kur(){moduluKur();modulAdiniGuncelle()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',kur);else kur();})();
function fdFiyatV2DosyaAra(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2DosyaAra',Array.from(arguments),this)}
function fdFiyatV2UrunAra(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2UrunAra',Array.from(arguments),this)}
function fdFiyatV2SayfaAra(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2SayfaAra',Array.from(arguments),this)}
function fdFiyatV2DosyaSec(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2DosyaSec',Array.from(arguments),this)}
function fdFiyatV2Gorunum(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2Gorunum',Array.from(arguments),this)}
function fdFiyatV2SayfaAc(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2SayfaAc',Array.from(arguments),this)}
function fdFiyatV2Excel(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2Excel',Array.from(arguments),this)}
function fdFiyatV2Pdf(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2Pdf',Array.from(arguments),this)}
function fdFiyatV2Goruntu(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2Goruntu',Array.from(arguments),this)}
function fdFiyatV2BelgeSec(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2BelgeSec',Array.from(arguments),this)}
function fdFiyatV2BelgeAc(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2BelgeAc',Array.from(arguments),this)}
function fdFiyatV2BelgeKapat(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2BelgeKapat',Array.from(arguments),this)}
function fdFiyatV2BelgeleriYukle(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2BelgeleriYukle',Array.from(arguments),this)}
function fdFiyatV2BelgeSil(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2BelgeSil',Array.from(arguments),this)}
function fdFiyatV2GecmisAc(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2GecmisAc',Array.from(arguments),this)}
function fdFiyatV2DosyaFormuAc(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2DosyaFormuAc',Array.from(arguments),this)}
function fdFiyatV2DosyaKaydet(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2DosyaKaydet',Array.from(arguments),this)}
function fdFiyatV2YeniSayfaAc(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2YeniSayfaAc',Array.from(arguments),this)}
function fdFiyatV2ZamYap(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2ZamYap',Array.from(arguments),this)}
function fdFiyatV2YeniSayfaKaydet(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2YeniSayfaKaydet',Array.from(arguments),this)}
function fdFiyatV2EditorSatirTasi(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2EditorSatirTasi',Array.from(arguments),this)}
function fdFiyatV2UrunSatiriEkle(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2UrunSatiriEkle',Array.from(arguments),this)}
function fdFiyatV2Duzenle(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2Duzenle',Array.from(arguments),this)}
function fdFiyatV2EditorKaydet(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2EditorKaydet',Array.from(arguments),this)}
function fdFiyatV2SayfaSil(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2SayfaSil',Array.from(arguments),this)}
function fdFiyatV2Yenile(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2Yenile',Array.from(arguments),this)}
function openInsaatFiyatApp(){return FDModules.open('insaatfiyat',Array.from(arguments),this)}
function fdFiyatV2SeciliDosyaKimligi(){return FDModules.callIfLoaded('insaatfiyat','fdFiyatV2SeciliDosyaKimligi',Array.from(arguments),this)}
