// Stable facades retain existing personnel/menu/role/tab wrapper order.
(function(root){
let pending=null;
const identity=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',typeof fdAktifUygulamaSekmesi==='undefined'?'':fdAktifUygulamaSekmesi]);
root.fdAdvanceLaunchOptions=function(){const p=pending;pending=null;return p&&p.identity===identity()?p.options:null};
root.fdAdvanceLaunch=function(action,args,receiver){const options={fdAdvanceAction:action,args:Array.from(args)};pending={identity:identity(),options};return FDModules.open('avans',[options],receiver)};
})(window);
function avansListeyiYenile(){return FDModules.callIfLoaded('avans','avansListeyiYenile',Array.from(arguments),this)}
function avansSekmeDegistir(){return FDModules.callIfLoaded('avans','avansSekmeDegistir',Array.from(arguments),this)}
function avansYeniKayitAc(){return FDModules.callIfLoaded('avans','avansYeniKayitAc',Array.from(arguments),this)}
function avansDuzenleVazgec(){return FDModules.callIfLoaded('avans','avansDuzenleVazgec',Array.from(arguments),this)}
function openAvansApp(){return window.fdAdvanceLaunch('',arguments,this)}
function avansPersonelListesiniDoldur(){return FDModules.callIfLoaded('avans','avansPersonelListesiniDoldur',Array.from(arguments),this)}
function avansPersonelSecimKontrol(){return FDModules.callIfLoaded('avans','avansPersonelSecimKontrol',Array.from(arguments),this)}
function avansTaksitAlaniniGuncelle(){return FDModules.callIfLoaded('avans','avansTaksitAlaniniGuncelle',Array.from(arguments),this)}
function avansTaksitButonlariniOlustur(){return FDModules.callIfLoaded('avans','avansTaksitButonlariniOlustur',Array.from(arguments),this)}
function avansTaksitSec(){return FDModules.callIfLoaded('avans','avansTaksitSec',Array.from(arguments),this)}
function avansPlanOnizle(){return FDModules.callIfLoaded('avans','avansPlanOnizle',Array.from(arguments),this)}
function siradakiAvansNo(){return FDModules.callIfLoaded('avans','siradakiAvansNo',Array.from(arguments),this)}
function avansKaydet(){return FDModules.callIfLoaded('avans','avansKaydet',Array.from(arguments),this)}
function avansFormReset(){return FDModules.callIfLoaded('avans','avansFormReset',Array.from(arguments),this)}
function avansDuzenle(){return FDModules.callIfLoaded('avans','avansDuzenle',Array.from(arguments),this)}
function avansSil(){return FDModules.callIfLoaded('avans','avansSil',Array.from(arguments),this)}
function avansEtiketi(){return FDModules.callIfLoaded('avans','avansEtiketi',Array.from(arguments),this)}
function avansGecmisKayitlari(){return FDModules.callIfLoaded('avans','avansGecmisKayitlari',Array.from(arguments),this)}
function avansGecmisiniAc(){if(FDModules.status('avans').loaded){window.fdAdvanceLaunchOptions();return FDModules.callIfLoaded('avans','avansGecmisiniAc',Array.from(arguments),this)}return window.fdAdvanceLaunch('avansGecmisiniAc',arguments,this)}
function avansGecmisiniKapat(){return FDModules.callIfLoaded('avans','avansGecmisiniKapat',Array.from(arguments),this)}
function avansGecmisExcelIndir(){return FDModules.callIfLoaded('avans','avansGecmisExcelIndir',Array.from(arguments),this)}
function avansKayitSubeFiltreleriniDoldur(){return FDModules.callIfLoaded('avans','avansKayitSubeFiltreleriniDoldur',Array.from(arguments),this)}
function avansKayitFiltreleriniTemizle(){return FDModules.callIfLoaded('avans','avansKayitFiltreleriniTemizle',Array.from(arguments),this)}
function avansKayitFiltreliListe(){return FDModules.callIfLoaded('avans','avansKayitFiltreliListe',Array.from(arguments),this)}
function renderAvansKayitListesi(){return FDModules.callIfLoaded('avans','renderAvansKayitListesi',Array.from(arguments),this)}
function avansGelecekDonemi(){return FDModules.callIfLoaded('avans','avansGelecekDonemi',Array.from(arguments),this)}
function renderAvansGelecekKesintileri(){return FDModules.callIfLoaded('avans','renderAvansGelecekKesintileri',Array.from(arguments),this)}
function avansGelecekExcelAl(){return FDModules.callIfLoaded('avans','avansGelecekExcelAl',Array.from(arguments),this)}
function avansGelecekPdfAl(){return FDModules.callIfLoaded('avans','avansGelecekPdfAl',Array.from(arguments),this)}
function avansGelecekGoruntuAl(){return FDModules.callIfLoaded('avans','avansGelecekGoruntuAl',Array.from(arguments),this)}
function renderAvansKesintiListesi(){return FDModules.callIfLoaded('avans','renderAvansKesintiListesi',Array.from(arguments),this)}
function avansGecmisPdfIndir(){return FDModules.callIfLoaded('avans','avansGecmisPdfIndir',Array.from(arguments),this)}
