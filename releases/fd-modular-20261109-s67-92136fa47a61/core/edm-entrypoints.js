window.openAlisFiyatApp=function(){return FDModules.open('alisfiyat',[],this);};
fdUygulamaSekmeTanimlari.alisfiyat={ad:'Alış Fiyat Takibi',ikon:'🧾',acilis:'openAlisFiyatApp'};
fdSekmeFonksiyonlari.openAlisFiyatApp='alisfiyat';
if(!fdSekmeAlanlari.includes('alisFiyatApp'))fdSekmeAlanlari.push('alisFiyatApp');
ANA_MENU_MODUL_KOKLERI.alisfiyat='#alisFiyatApp';
fdSekmeSisteminiKur();
