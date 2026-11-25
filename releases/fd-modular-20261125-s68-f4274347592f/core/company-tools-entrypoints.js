(function(root){
// Pending launch intent only, never search results/calendar records. Consumed on mount/retry.
let pending=null;
const identity=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'']);
root.fdCompanyToolsLaunchOptions=function(){const value=pending;pending=null;return value&&value.identity===identity()?{mode:value.mode,args:value.args}:null};
function launch(mode,args,receiver){const options={mode,args:Array.from(args)};pending={...options,identity:identity()};return FDModules.open('companytools',[options],receiver)}
window.fdAramaSonucAc=function(){return FDModules.callIfLoaded('companytools','fdAramaSonucAc',Array.from(arguments),this)};
window.fdGlobalAra=function(){return launch('search',arguments,this)};
window.fdTakvimKayitFormuAc=function(){if(FDModules.status('companytools').loaded){root.fdCompanyToolsLaunchOptions();return FDModules.callIfLoaded('companytools','fdTakvimKayitFormuAc',Array.from(arguments),this)}return launch('form',arguments,this)};
window.fdTakvimKaydet=function(){return FDModules.callIfLoaded('companytools','fdTakvimKaydet',Array.from(arguments),this)};
window.fdTakvimSil=function(){return FDModules.callIfLoaded('companytools','fdTakvimSil',Array.from(arguments),this)};
window.fdTakvimAc=function(){return launch('calendar',arguments,this)};
window.fdTakvimGorunumSec=function(){return FDModules.callIfLoaded('companytools','fdTakvimGorunumSec',Array.from(arguments),this)};
window.fdTakvimAyDegistir=function(){return FDModules.callIfLoaded('companytools','fdTakvimAyDegistir',Array.from(arguments),this)};
window.fdTakvimCiz=function(){return FDModules.callIfLoaded('companytools','fdTakvimCiz',Array.from(arguments),this)};
window.fdTakvimBugun=function(){return FDModules.callIfLoaded('companytools','fdTakvimBugun',Array.from(arguments),this)};
})(window);
