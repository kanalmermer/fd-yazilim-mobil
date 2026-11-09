// Keep native Settings file selection synchronous in the original eager function.
(function(root){let intent=null;const identity=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('ayarlar')]);
function open(action,input){intent={identity:identity(),action};return FDModules.embedded('personelaktar',[action,input],root)}
root.fdPersonelAktarIstegi=function(){return intent?.identity===identity()?intent.action:null};
root.personelExcelSablonuIndir=function(){return open('template')};
root.personelExcelDosyasiniOku=function(input){const file=input?.files?.[0];if(!file)return;input.value='';return open('read',{files:[file],value:''})};
root.personelTopluAktarModaliniKapat=function(...args){return FDModules.callIfLoaded('personelaktar','personelTopluAktarModaliniKapat',args,this)};
root.personelTopluAktarimiKaydet=function(...args){return FDModules.callIfLoaded('personelaktar','personelTopluAktarimiKaydet',args,this)};
})(window);
