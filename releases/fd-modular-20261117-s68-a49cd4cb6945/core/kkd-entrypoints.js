// Stable eager facades preserve personnel navigation and role/tab wrappers.
function openKkdApp(){return FDModules.open('kkd',Array.from(arguments),this)}
function kkdFiltreleriniDoldur(){return FDModules.callIfLoaded('kkd','kkdFiltreleriniDoldur',Array.from(arguments),this)}
function kkdPersonelSecenekleriniDoldur(){return FDModules.callIfLoaded('kkd','kkdPersonelSecenekleriniDoldur',Array.from(arguments),this)}
function kkdKalemEkle(){return FDModules.callIfLoaded('kkd','kkdKalemEkle',Array.from(arguments),this)}
function kkdKalemSil(){return FDModules.callIfLoaded('kkd','kkdKalemSil',Array.from(arguments),this)}
function kkdKalemTuruDegisti(){return FDModules.callIfLoaded('kkd','kkdKalemTuruDegisti',Array.from(arguments),this)}
function kkdKalemleriAl(){return FDModules.callIfLoaded('kkd','kkdKalemleriAl',Array.from(arguments),this)}
function kkdOncekiTeslimBul(){return FDModules.callIfLoaded('kkd','kkdOncekiTeslimBul',Array.from(arguments),this)}
function kkdOncekiTeslimUyarisiGuncelle(){return FDModules.callIfLoaded('kkd','kkdOncekiTeslimUyarisiGuncelle',Array.from(arguments),this)}
function kkdTeslimKaydet(){return FDModules.callIfLoaded('kkd','kkdTeslimKaydet',Array.from(arguments),this)}
function kkdFiltrelenmisKayitlariAl(){return FDModules.callIfLoaded('kkd','kkdFiltrelenmisKayitlariAl',Array.from(arguments),this)}
function kkdDonemBasligi(){return FDModules.callIfLoaded('kkd','kkdDonemBasligi',Array.from(arguments),this)}
function kkdCizelgesiniHazirla(){return FDModules.callIfLoaded('kkd','kkdCizelgesiniHazirla',Array.from(arguments),this)}
function kkdKaydiSil(){return FDModules.callIfLoaded('kkd','kkdKaydiSil',Array.from(arguments),this)}
function kkdAyiDegistir(){return FDModules.callIfLoaded('kkd','kkdAyiDegistir',Array.from(arguments),this)}
function kkdExcelIndir(){return FDModules.callIfLoaded('kkd','kkdExcelIndir',Array.from(arguments),this)}
function kkdPdfIndir(){return FDModules.callIfLoaded('kkd','kkdPdfIndir',Array.from(arguments),this)}
function kkdGecmisKayitlari(){return FDModules.callIfLoaded('kkd','kkdGecmisKayitlari',Array.from(arguments),this)}
function kkdGecmisiniAc(pId,year){if(FDModules.status('kkd').loaded)return FDModules.callIfLoaded('kkd','kkdGecmisiniAc',[pId,year],this);return FDModules.open('kkd',[{fdHistoryOnly:true,pId,year}],this)}
function kkdGecmisiniKapat(){return FDModules.callIfLoaded('kkd','kkdGecmisiniKapat',Array.from(arguments),this)}
function kkdGecmisExcelIndir(){return FDModules.callIfLoaded('kkd','kkdGecmisExcelIndir',Array.from(arguments),this)}
function kkdGecmisPdfIndir(){return FDModules.callIfLoaded('kkd','kkdGecmisPdfIndir',Array.from(arguments),this)}
function fdKkdPersonelGorunumunuUygula(){return FDModules.callIfLoaded('kkd','fdKkdPersonelGorunumunuUygula',Array.from(arguments),this)}
