// Original menu/permission/tab registration; no order data/form initialization.
(function(){const MODUL='siparistakip';
function moduluKur(){if(!VARSAYILAN_ANA_MENU_MODULLERI.some(m=>m.anahtar===MODUL))VARSAYILAN_ANA_MENU_MODULLERI.splice(Math.min(8,VARSAYILAN_ANA_MENU_MODULLERI.length),0,{anahtar:MODUL,ad:'Sipariş Takibi',aciklama:'Firma, ürün, sipariş miktarı ve tarihli teslimat takibi',ikon:'📦',renk:'linear-gradient(135deg,#0f766e,#2563eb)',fonksiyon:'openSiparisTakipApp',roller:['Admin','Yonetici'],yetkiler:{Admin:'yazma',Yonetici:'yazma',Personel:'yok'},aktif:true});ANA_MENU_MODUL_KOKLERI[MODUL]='#fdSiparisApp';fdUygulamaSekmeTanimlari[MODUL]={ad:'Sipariş Takibi',ikon:'📦',acilis:'openSiparisTakipApp'};fdSekmeFonksiyonlari.openSiparisTakipApp=MODUL;if(!fdSekmeAlanlari.includes('fdSiparisApp'))fdSekmeAlanlari.push('fdSiparisApp');const launcher=document.querySelector('#appHub .workspace-launcher');if(launcher&&!launcher.querySelector('[data-ana-menu-modul="'+MODUL+'"]')){const kart=document.createElement('button');kart.type='button';kart.className='workspace-card';kart.dataset.anaMenuModul=MODUL;kart.onclick=e=>anaMenuModulunuAc(MODUL,e);kart.innerHTML='<span class="workspace-card-icon" aria-hidden="true">📦</span><span><strong>Sipariş Takibi</strong><small>Firma, ürün ve teslimat geçmişi</small></span><b>Modülü aç →</b>';launcher.appendChild(kart)}anaMenuModulKartlariniUygula?.();fdSekmeSisteminiKur?.()}
function siparisAnaMenuSirasiniDuzelt(){const mevcut=VARSAYILAN_ANA_MENU_MODULLERI.findIndex(m=>m.anahtar===MODUL),hedef=VARSAYILAN_ANA_MENU_MODULLERI.findIndex(m=>m.anahtar==='irsaliye');if(mevcut>=0&&hedef>=0&&mevcut!==hedef+1){const[m]=VARSAYILAN_ANA_MENU_MODULLERI.splice(mevcut,1),yeniHedef=VARSAYILAN_ANA_MENU_MODULLERI.findIndex(x=>x.anahtar==='irsaliye');VARSAYILAN_ANA_MENU_MODULLERI.splice(yeniHedef+1,0,m)}anaMenuModulKartlariniUygula?.()}
function kur(){moduluKur();siparisAnaMenuSirasiniDuzelt()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',kur);else kur();})();
function fdSiparisBirimSecenekleriniYenile(){return FDModules.callIfLoaded('siparistakip','fdSiparisBirimSecenekleriniYenile',Array.from(arguments),this)}
function fdSiparisSekmeAc(){return FDModules.callIfLoaded('siparistakip','fdSiparisSekmeAc',Array.from(arguments),this)}
function fdSiparisKaydet(){return FDModules.callIfLoaded('siparistakip','fdSiparisKaydet',Array.from(arguments),this)}
function fdSiparisYeniFormuAc(){return FDModules.callIfLoaded('siparistakip','fdSiparisYeniFormuAc',Array.from(arguments),this)}
function fdSiparisDuzenle(){return FDModules.callIfLoaded('siparistakip','fdSiparisDuzenle',Array.from(arguments),this)}
function fdSiparisFormIptal(){return FDModules.callIfLoaded('siparistakip','fdSiparisFormIptal',Array.from(arguments),this)}
function fdSiparisSil(){return FDModules.callIfLoaded('siparistakip','fdSiparisSil',Array.from(arguments),this)}
function fdSiparisSatirAc(){return FDModules.callIfLoaded('siparistakip','fdSiparisSatirAc',Array.from(arguments),this)}
function fdSiparisFirmayaGir(){return FDModules.callIfLoaded('siparistakip','fdSiparisFirmayaGir',Array.from(arguments),this)}
function fdSiparisFirmalaraDon(){return FDModules.callIfLoaded('siparistakip','fdSiparisFirmalaraDon',Array.from(arguments),this)}
function fdSiparisUruneGir(){return FDModules.callIfLoaded('siparistakip','fdSiparisUruneGir',Array.from(arguments),this)}
function fdSiparisUrunlereDon(){return FDModules.callIfLoaded('siparistakip','fdSiparisUrunlereDon',Array.from(arguments),this)}
function fdSiparisTeslimatlariGoster(){return FDModules.callIfLoaded('siparistakip','fdSiparisTeslimatlariGoster',Array.from(arguments),this)}
function fdSiparisSeciliUrunDuzenle(){return FDModules.callIfLoaded('siparistakip','fdSiparisSeciliUrunDuzenle',Array.from(arguments),this)}
function fdSiparisSeciliFirmaDuzenle(){return FDModules.callIfLoaded('siparistakip','fdSiparisSeciliFirmaDuzenle',Array.from(arguments),this)}
function fdSiparisFirmaAra(){return FDModules.callIfLoaded('siparistakip','fdSiparisFirmaAra',Array.from(arguments),this)}
function fdSiparisFiltrele(){return FDModules.callIfLoaded('siparistakip','fdSiparisFiltrele',Array.from(arguments),this)}
function fdSiparisTarihFiltrele(){return FDModules.callIfLoaded('siparistakip','fdSiparisTarihFiltrele',Array.from(arguments),this)}
function fdSiparisTarihTemizle(){return FDModules.callIfLoaded('siparistakip','fdSiparisTarihTemizle',Array.from(arguments),this)}
function fdSiparisFirmaFormuAc(){return FDModules.callIfLoaded('siparistakip','fdSiparisFirmaFormuAc',Array.from(arguments),this)}
function fdSiparisFirmaKaydet(){return FDModules.callIfLoaded('siparistakip','fdSiparisFirmaKaydet',Array.from(arguments),this)}
function fdSiparisFirmaSil(){return FDModules.callIfLoaded('siparistakip','fdSiparisFirmaSil',Array.from(arguments),this)}
function fdSiparisUrunFormuAc(){return FDModules.callIfLoaded('siparistakip','fdSiparisUrunFormuAc',Array.from(arguments),this)}
function fdSiparisUrunKaydet(){return FDModules.callIfLoaded('siparistakip','fdSiparisUrunKaydet',Array.from(arguments),this)}
function fdSiparisUrunSil(){return FDModules.callIfLoaded('siparistakip','fdSiparisUrunSil',Array.from(arguments),this)}
function fdSiparisTeslimatAc(){return FDModules.callIfLoaded('siparistakip','fdSiparisTeslimatAc',Array.from(arguments),this)}
function fdSiparisTeslimatDuzenle(){return FDModules.callIfLoaded('siparistakip','fdSiparisTeslimatDuzenle',Array.from(arguments),this)}
function fdSiparisTeslimatKaydet(){return FDModules.callIfLoaded('siparistakip','fdSiparisTeslimatKaydet',Array.from(arguments),this)}
function fdSiparisTeslimatSil(){return FDModules.callIfLoaded('siparistakip','fdSiparisTeslimatSil',Array.from(arguments),this)}
function fdSiparisExcel(){return FDModules.callIfLoaded('siparistakip','fdSiparisExcel',Array.from(arguments),this)}
function fdSiparisPdf(){return FDModules.callIfLoaded('siparistakip','fdSiparisPdf',Array.from(arguments),this)}
function fdSiparisGoruntu(){return FDModules.callIfLoaded('siparistakip','fdSiparisGoruntu',Array.from(arguments),this)}
function fdSiparisYenile(){return FDModules.callIfLoaded('siparistakip','fdSiparisYenile',Array.from(arguments),this)}
function openSiparisTakipApp(){return FDModules.open('siparistakip',Array.from(arguments),this)}
