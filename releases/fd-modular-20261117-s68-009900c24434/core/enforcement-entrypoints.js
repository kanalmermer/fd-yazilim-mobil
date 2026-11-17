// Stable facades preserve existing menu/role/tab wrapper order.
(function(root){let pending=null;const identity=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',typeof fdAktifUygulamaSekmesi==='undefined'?'':fdAktifUygulamaSekmesi]);root.fdLienLaunchOptions=function(){const p=pending;pending=null;return p&&p.identity===identity()?p.options:null};root.fdLienLaunch=function(action,args,receiver){const options={fdLienAction:action,args:Array.from(args)};pending={identity:identity(),options};return FDModules.open('icra',[options],receiver)}})(window);
function icraPdfDurumMesaji(){return FDModules.callIfLoaded('icra','icraPdfDurumMesaji',Array.from(arguments),this)}
function icraPdfMetniniOku(){return FDModules.callIfLoaded('icra','icraPdfMetniniOku',Array.from(arguments),this)}
function icraPdfEtiketDegeri(){return FDModules.callIfLoaded('icra','icraPdfEtiketDegeri',Array.from(arguments),this)}
function icraPdfDosyaNoBul(){return FDModules.callIfLoaded('icra','icraPdfDosyaNoBul',Array.from(arguments),this)}
function icraPdfParaBul(){return FDModules.callIfLoaded('icra','icraPdfParaBul',Array.from(arguments),this)}
function icraPdfHesapAdiBul(){return FDModules.callIfLoaded('icra','icraPdfHesapAdiBul',Array.from(arguments),this)}
function icraPdfDaireVeTarihBul(){return FDModules.callIfLoaded('icra','icraPdfDaireVeTarihBul',Array.from(arguments),this)}
function icraPdfAlanlariniBul(){return FDModules.callIfLoaded('icra','icraPdfAlanlariniBul',Array.from(arguments),this)}
function icraPdfPersoneliniSec(){return FDModules.callIfLoaded('icra','icraPdfPersoneliniSec',Array.from(arguments),this)}
function icraPdfBilgileriniCikar(){return FDModules.callIfLoaded('icra','icraPdfBilgileriniCikar',Array.from(arguments),this)}
function icraBugunAnahtari(){return FDModules.callIfLoaded('icra','icraBugunAnahtari',Array.from(arguments),this)}
function icraDairesiYeriniBul(){return FDModules.callIfLoaded('icra','icraDairesiYeriniBul',Array.from(arguments),this)}
function icraDairesiBasligi(){return FDModules.callIfLoaded('icra','icraDairesiBasligi',Array.from(arguments),this)}
function icraDilekceDonemiYaz(){return FDModules.callIfLoaded('icra','icraDilekceDonemiYaz',Array.from(arguments),this)}
function icraDilekcePara(){return FDModules.callIfLoaded('icra','icraDilekcePara',Array.from(arguments),this)}
function icraDilekceDosyaTarihi(){return FDModules.callIfLoaded('icra','icraDilekceDosyaTarihi',Array.from(arguments),this)}
function icraDilekceSatirlariniOlustur(){return FDModules.callIfLoaded('icra','icraDilekceSatirlariniOlustur',Array.from(arguments),this)}
function icraDilekceTuruBul(){return FDModules.callIfLoaded('icra','icraDilekceTuruBul',Array.from(arguments),this)}
function icraDilekceSablonBaytlari(){return FDModules.callIfLoaded('icra','icraDilekceSablonBaytlari',Array.from(arguments),this)}
function icraDocxKirmiziDoldur(){return FDModules.callIfLoaded('icra','icraDocxKirmiziDoldur',Array.from(arguments),this)}
function icraDocxHucreDoldur(){return FDModules.callIfLoaded('icra','icraDocxHucreDoldur',Array.from(arguments),this)}
function icraDilekceCokluTabloyuDoldur(){return FDModules.callIfLoaded('icra','icraDilekceCokluTabloyuDoldur',Array.from(arguments),this)}
function icraResmiDocxXml(){return FDModules.callIfLoaded('icra','icraResmiDocxXml',Array.from(arguments),this)}
function icraResmiDocxRun(){return FDModules.callIfLoaded('icra','icraResmiDocxRun',Array.from(arguments),this)}
function icraResmiDocxParagraf(){return FDModules.callIfLoaded('icra','icraResmiDocxParagraf',Array.from(arguments),this)}
function icraResmiDocxBaslikTablosu(){return FDModules.callIfLoaded('icra','icraResmiDocxBaslikTablosu',Array.from(arguments),this)}
function icraDilekceKisiAdiYaz(){return FDModules.callIfLoaded('icra','icraDilekceKisiAdiYaz',Array.from(arguments),this)}
function icraResmiDocxHucre(){return FDModules.callIfLoaded('icra','icraResmiDocxHucre',Array.from(arguments),this)}
function icraResmiDocxImza(){return FDModules.callIfLoaded('icra','icraResmiDocxImza',Array.from(arguments),this)}
function icraResmiDocxTablosu(){return FDModules.callIfLoaded('icra','icraResmiDocxTablosu',Array.from(arguments),this)}
function icraResmiDilekceDocxOlustur(){return FDModules.callIfLoaded('icra','icraResmiDilekceDocxOlustur',Array.from(arguments),this)}
function icraDilekceBlobuOlustur(){return FDModules.callIfLoaded('icra','icraDilekceBlobuOlustur',Array.from(arguments),this)}
function icraDilekceDosyaAdi(){return FDModules.callIfLoaded('icra','icraDilekceDosyaAdi',Array.from(arguments),this)}
function icraDilekceAc(){if(FDModules.status('icra').loaded){window.fdLienLaunchOptions();return FDModules.callIfLoaded('icra','icraDilekceAc',Array.from(arguments),this)}return window.fdLienLaunch('icraDilekceAc',arguments,this)}
function icraPersonelListesiniDoldur(){return FDModules.callIfLoaded('icra','icraPersonelListesiniDoldur',Array.from(arguments),this)}
function icraSekmeDegistir(){return FDModules.callIfLoaded('icra','icraSekmeDegistir',Array.from(arguments),this)}
function icraYeniKayitAc(){return FDModules.callIfLoaded('icra','icraYeniKayitAc',Array.from(arguments),this)}
function icraYeniKayitKapat(){return FDModules.callIfLoaded('icra','icraYeniKayitKapat',Array.from(arguments),this)}
function icraPdfAlanBilgisi(){return FDModules.callIfLoaded('icra','icraPdfAlanBilgisi',Array.from(arguments),this)}
function icraPdfDurumunuGoster(){return FDModules.callIfLoaded('icra','icraPdfDurumunuGoster',Array.from(arguments),this)}
function icraPdfSilmekIcinIsaretle(){return FDModules.callIfLoaded('icra','icraPdfSilmekIcinIsaretle',Array.from(arguments),this)}
function icraPdfDosyasiSecildi(){return FDModules.callIfLoaded('icra','icraPdfDosyasiSecildi',Array.from(arguments),this)}
function icraFormReset(){return FDModules.callIfLoaded('icra','icraFormReset',Array.from(arguments),this)}
function icraDuzenle(){if(FDModules.status('icra').loaded){window.fdLienLaunchOptions();return FDModules.callIfLoaded('icra','icraDuzenle',Array.from(arguments),this)}return window.fdLienLaunch('icraDuzenle',arguments,this)}
function openIcraApp(){return window.fdLienLaunch('',arguments,this)}
function icraKaydet(){return FDModules.callIfLoaded('icra','icraKaydet',Array.from(arguments),this)}
function icraTekKaydiKaydet(){return FDModules.callIfLoaded('icra','icraTekKaydiKaydet',Array.from(arguments),this)}
function icraKaydetIslemi(){return FDModules.callIfLoaded('icra','icraKaydetIslemi',Array.from(arguments),this)}
function renderIcraListesi(){return FDModules.callIfLoaded('icra','renderIcraListesi',Array.from(arguments),this)}
function icraGecmisKayitlari(){return FDModules.callIfLoaded('icra','icraGecmisKayitlari',Array.from(arguments),this)}
function icraGecmisiniAc(){if(FDModules.status('icra').loaded){window.fdLienLaunchOptions();return FDModules.callIfLoaded('icra','icraGecmisiniAc',Array.from(arguments),this)}return window.fdLienLaunch('icraGecmisiniAc',arguments,this)}
function icraGecmisiniKapat(){return FDModules.callIfLoaded('icra','icraGecmisiniKapat',Array.from(arguments),this)}
function icraGecmisExcelIndir(){return FDModules.callIfLoaded('icra','icraGecmisExcelIndir',Array.from(arguments),this)}
function icraDetayAc(){if(FDModules.status('icra').loaded){window.fdLienLaunchOptions();return FDModules.callIfLoaded('icra','icraDetayAc',Array.from(arguments),this)}return window.fdLienLaunch('icraDetayAc',arguments,this)}
function icraDetayKapat(){return FDModules.callIfLoaded('icra','icraDetayKapat',Array.from(arguments),this)}
function renderIcraKesintiDetayi(){return FDModules.callIfLoaded('icra','renderIcraKesintiDetayi',Array.from(arguments),this)}
function icraKesintiEkle(){return FDModules.callIfLoaded('icra','icraKesintiEkle',Array.from(arguments),this)}
function icraKesintiSil(){return FDModules.callIfLoaded('icra','icraKesintiSil',Array.from(arguments),this)}
function icraSil(){return FDModules.callIfLoaded('icra','icraSil',Array.from(arguments),this)}
function icraListePdfAl(){return FDModules.callIfLoaded('icra','icraListePdfAl',Array.from(arguments),this)}
function icraGecmisPdfIndir(){return FDModules.callIfLoaded('icra','icraGecmisPdfIndir',Array.from(arguments),this)}
