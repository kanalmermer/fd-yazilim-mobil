// Stable cold refresh above lives in legacy03 to preserve original synchronous bootstrap order.
(function(root){'use strict';
root.fdVardiyaTanimAc=function(){const detail=document.getElementById('vardiyaTanimDetay'),workspace=document.getElementById('vardiyaApp');if(!detail?.open||!workspace?.contains(detail)||!detail.getClientRects().length||getComputedStyle(workspace).display==='none')return;return FDModules.embedded('vardiyatanim',[],this)};
root.vardiyaTanimFormunuDoldur=function(){return FDModules.callIfLoaded('vardiyatanim','vardiyaTanimFormunuDoldur',Array.from(arguments),this)};
root.vardiyaTanimListesiniCiz=function(){return FDModules.callIfLoaded('vardiyatanim','vardiyaTanimListesiniCiz',Array.from(arguments),this)};
root.vardiyaTanimYeni=function(){return FDModules.callIfLoaded('vardiyatanim','vardiyaTanimYeni',Array.from(arguments),this)};
root.vardiyaTanimlariniSirketAyarinaKaydet=function(){return FDModules.callIfLoaded('vardiyatanim','vardiyaTanimlariniSirketAyarinaKaydet',Array.from(arguments),this)};
root.vardiyaTanimKaydet=function(){return FDModules.callIfLoaded('vardiyatanim','vardiyaTanimKaydet',Array.from(arguments),this)};
root.vardiyaTanimSil=function(){return FDModules.callIfLoaded('vardiyatanim','vardiyaTanimSil',Array.from(arguments),this)};
document.addEventListener('toggle',event=>{if(event.target.id==='vardiyaTanimDetay'&&event.target.open)root.fdVardiyaTanimAc()},true);
})(window);
