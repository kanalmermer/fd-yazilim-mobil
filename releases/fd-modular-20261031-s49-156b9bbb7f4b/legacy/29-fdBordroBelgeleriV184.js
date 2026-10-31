// Stable payroll-document facades. Cold payroll/Prim rendering does not load the UI.
(function(root){
let booted=document.readyState!=='loading';
const active=()=>!!activeUser&&(isManagerUser()||isPersonelUser())&&anaMenuModulErisimiVar('personel');
root.fdBordroBelgeleriniYenile=function(){if(!booted||!active())return;const panel=document.getElementById('bordroBelgeleriPanel'),visible=document.getElementById('puantajApp')?.style.display==='block',payroll=String(root.puantajGorunumu||puantajGorunumu||'puantaj')==='puantaj';if(!visible||!payroll){if(panel)panel.style.display='none';return}if(FDModules.status('bordro').loaded)return Promise.resolve(FDModules.callIfLoaded('bordro','fdBordroBelgeleriniYenile',[],this)).catch(()=>{});return FDModules.embedded('bordro',[],this)};
const previous=root.renderPuantajMatrisi;root.renderPuantajMatrisi=function(){const value=previous.apply(this,arguments);Promise.resolve().then(()=>root.fdBordroBelgeleriniYenile());return value};
root.bordroMaasKarsilastirmayiAc=function(){return FDModules.embedded('bordro',[{action:"bordroMaasKarsilastirmayiAc",args:Array.from(arguments)}],this)};
root.bordroBelgeleriYuklemeAc=function(){return FDModules.embedded('bordro',[{action:"bordroBelgeleriYuklemeAc",args:Array.from(arguments)}],this)};
root.bordroBelgeleriniTopluKaydet=function(){return FDModules.callIfLoaded('bordro',"bordroBelgeleriniTopluKaydet",Array.from(arguments),this)};
root.bordroBelgesiGoruntule=function(){return FDModules.embedded('bordro',[{action:"bordroBelgesiGoruntule",args:Array.from(arguments)}],this)};
root.bordroPersonelPusulasiGoruntule=function(){return FDModules.embedded('bordro',[{action:"bordroPersonelPusulasiGoruntule",args:Array.from(arguments)}],this)};
root.bordroBelgeOnizlemeKapat=function(){return FDModules.callIfLoaded('bordro',"bordroBelgeOnizlemeKapat",Array.from(arguments),this)};
root.bordroBelgesiIndir=function(){return FDModules.embedded('bordro',[{action:"bordroBelgesiIndir",args:Array.from(arguments)}],this)};
root.bordroPersonelPusulasiIndir=function(){return FDModules.embedded('bordro',[{action:"bordroPersonelPusulasiIndir",args:Array.from(arguments)}],this)};
root.bordroOnizlenenBelgeIndir=function(){return FDModules.callIfLoaded('bordro',"bordroOnizlenenBelgeIndir",Array.from(arguments),this)};
root.bordroBelgesiSil=function(){return FDModules.callIfLoaded('bordro',"bordroBelgesiSil",Array.from(arguments),this)};
root.bordroBelgeleriAyiDegisti=root.fdBordroBelgeleriniYenile;
function ready(){booted=true;root.fdBordroBelgeleriniYenile()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>window.setTimeout(ready,0),{once:true});else Promise.resolve().then(ready);
})(window);

