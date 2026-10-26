// Original registration and stable facades precede shared dashboard bootstrap.
try{
        if(typeof fdUygulamaSekmeTanimlari==='object')fdUygulamaSekmeTanimlari.workCenter={ad:'Denetim Merkezi',ikon:'🎯',acilis:'openWorkCenterApp'};
        if(typeof fdSekmeFonksiyonlari==='object')fdSekmeFonksiyonlari.openWorkCenterApp='workCenter';
        if(typeof fdSekmeAlanlari==='object'&&!fdSekmeAlanlari.includes('workCenterApp'))fdSekmeAlanlari.push('workCenterApp');
    }catch(_){ }
window.openWorkCenterApp=function(){return FDModules.open('workcenter',[{mode:'manager'}],this)};
window.fdxKapat=function(){return FDModules.callIfLoaded('workcenter','fdxKapat',Array.from(arguments),this)};
window.fdxIsMerkeziAc=function(){return FDModules.open('workcenter',[{mode:'manager'}],this)};
window.fdxTaleplerimAc=function(){return FDModules.open('workcenter',[{mode:'own'}],this)};
window.fdxSekmeAc=function(){return FDModules.callIfLoaded('workcenter','fdxSekmeAc',Array.from(arguments),this)};
window.fdxTalepTuruDegisti=function(){return FDModules.callIfLoaded('workcenter','fdxTalepTuruDegisti',Array.from(arguments),this)};
window.fdxTalepGonder=function(){return FDModules.callIfLoaded('workcenter','fdxTalepGonder',Array.from(arguments),this)};
window.fdxTaleplerimiYukle=function(){return FDModules.callIfLoaded('workcenter','fdxTaleplerimiYukle',Array.from(arguments),this)};
window.fdxTalepIptal=function(){return FDModules.callIfLoaded('workcenter','fdxTalepIptal',Array.from(arguments),this)};
window.fdxTalepleriYukle=function(){return FDModules.callIfLoaded('workcenter','fdxTalepleriYukle',Array.from(arguments),this)};
window.fdxTalepleriCiz=function(){return FDModules.callIfLoaded('workcenter','fdxTalepleriCiz',Array.from(arguments),this)};
window.fdxTalepIncele=function(){return FDModules.callIfLoaded('workcenter','fdxTalepIncele',Array.from(arguments),this)};
window.fdxTalepKarari=function(){return FDModules.callIfLoaded('workcenter','fdxTalepKarari',Array.from(arguments),this)};
window.fdxKapanislariYukle=function(){return FDModules.callIfLoaded('workcenter','fdxKapanislariYukle',Array.from(arguments),this)};
window.fdxKapanisAyDegisti=function(){return FDModules.callIfLoaded('workcenter','fdxKapanisAyDegisti',Array.from(arguments),this)};
window.fdxAylikKontrol=function(){return FDModules.callIfLoaded('workcenter','fdxAylikKontrol',Array.from(arguments),this)};
window.fdxKapanisDurumDegistir=function(){return FDModules.callIfLoaded('workcenter','fdxKapanisDurumDegistir',Array.from(arguments),this)};
window.fdxPlanPersonelleriniDoldur=function(){return FDModules.callIfLoaded('workcenter','fdxPlanPersonelleriniDoldur',Array.from(arguments),this)};
window.fdxPlanTumunuSec=function(){return FDModules.callIfLoaded('workcenter','fdxPlanTumunuSec',Array.from(arguments),this)};
window.fdxPlanHedefTuruDegisti=function(){return FDModules.callIfLoaded('workcenter','fdxPlanHedefTuruDegisti',Array.from(arguments),this)};
window.fdxPlanOlustur=function(){return FDModules.callIfLoaded('workcenter','fdxPlanOlustur',Array.from(arguments),this)};
window.fdxPlanlariYukle=function(){return FDModules.callIfLoaded('workcenter','fdxPlanlariYukle',Array.from(arguments),this)};
window.fdxPlanDuzenle=function(){return FDModules.callIfLoaded('workcenter','fdxPlanDuzenle',Array.from(arguments),this)};
window.fdxPlanIptal=function(){return FDModules.callIfLoaded('workcenter','fdxPlanIptal',Array.from(arguments),this)};
window.fdxAuditYukle=function(){return FDModules.callIfLoaded('workcenter','fdxAuditYukle',Array.from(arguments),this)};
window.fdxAuditFiltreDegisti=function(){return FDModules.callIfLoaded('workcenter','fdxAuditFiltreDegisti',Array.from(arguments),this)};
window.fdxAuditSayfaDegistir=function(){return FDModules.callIfLoaded('workcenter','fdxAuditSayfaDegistir',Array.from(arguments),this)};
window.fdxAuditCiz=function(){return FDModules.callIfLoaded('workcenter','fdxAuditCiz',Array.from(arguments),this)};
window.fdxAuditDetay=function(){return FDModules.callIfLoaded('workcenter','fdxAuditDetay',Array.from(arguments),this)};
window.fdxAuditGeriAl=function(){return FDModules.callIfLoaded('workcenter','fdxAuditGeriAl',Array.from(arguments),this)};
