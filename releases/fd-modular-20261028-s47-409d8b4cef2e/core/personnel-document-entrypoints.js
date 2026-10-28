// Cold batch-document entrypoints. Only retry intent is kept here, never document/personnel state.
(function(root){let intent=null,pending=null;const key=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')]);
root.yillikPersonelBelgePaneliniAc=function(...args){if(!isManagerUser())return showToast('Bu belgeler için admin veya kullanıcı yetkisi gerekir.','error');const identity=key(),requestKey=identity+'|'+JSON.stringify(args);intent={identity,args};if(pending?.key===requestKey)return pending.promise;const promise=FDModules.embedded('personelbelge',args,this);pending={key:requestKey,promise};const release=()=>{if(pending?.promise===promise)pending=null};promise.then(release,release);return promise};
root.fdYillikBelgeAcmaIstegi=function(){if(intent?.identity!==key()){intent=null;return null}return intent.args.slice()};
root.yillikPersonelBelgePaneliniKapat=function(...args){return FDModules.callIfLoaded('personelbelge','yillikPersonelBelgePaneliniKapat',args,this)};
root.yillikBelgeTumSubeleriSec=function(...args){return FDModules.callIfLoaded('personelbelge','yillikBelgeTumSubeleriSec',args,this)};
root.yillikBelgeSubeSeciminiGuncelle=function(...args){return FDModules.callIfLoaded('personelbelge','yillikBelgeSubeSeciminiGuncelle',args,this)};
root.yillikPersonelBelgeleriniTopluHazirla=function(...args){return FDModules.callIfLoaded('personelbelge','yillikPersonelBelgeleriniTopluHazirla',args,this)};
root.yillikPersonelBelgeleriniTopluYazdir=function(...args){return FDModules.callIfLoaded('personelbelge','yillikPersonelBelgeleriniTopluYazdir',args,this)};
root.fdYillikBelgeTopluDurumunuTemizle=function(){try{return FDModules.callIfLoaded('personelbelge','fdYillikBelgeTopluDurumunuTemizle',[],this)}catch(_){}};
root.fdYillikBelgeTopluModuAktifMi=function(){try{return Boolean(FDModules.callIfLoaded('personelbelge','fdYillikBelgeTopluModuAktifMi',[],this))}catch(_){return false}};
})(window);
