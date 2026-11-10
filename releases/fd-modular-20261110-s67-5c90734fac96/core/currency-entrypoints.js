window.openKurGecmisiApp=function(){return FDModules.open('kurgecmisi',[],this);};
fdUygulamaSekmeTanimlari.kurgecmisi={ad:'Kur Geçmişi',ikon:'💱',acilis:'openKurGecmisiApp'};
fdSekmeFonksiyonlari.openKurGecmisiApp='kurgecmisi';
if(!fdSekmeAlanlari.includes('kurGecmisiApp'))fdSekmeAlanlari.push('kurGecmisiApp');
ANA_MENU_MODUL_KOKLERI.kurgecmisi='#kurGecmisiApp';
fdSekmeSisteminiKur();
