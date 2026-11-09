// Only context-scoped card retry identity is retained here, never personnel records.
(function(root){let intent=null;const identity=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',activeUser?.tcNo||'',anaMenuModulYetkisi('personel')]);
root.fdPersonelDetayKaynaklariniHazirla=function(id){if(isPersonelUser()&&String(id)!==String(activeUser?.tcNo||''))return Promise.resolve(false);intent={identity:identity(),id};return FDModules.embedded('personeldetay',['prepare',id],this)};
root.fdPersonelDetayAcmaIstegi=function(){return intent?.identity===identity()?intent.id:null};
})(window);
