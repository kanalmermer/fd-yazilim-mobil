// Stable cold facades: no operational records, document catalog or form state at startup.
(function(root){
 function invoke(name,args=[]){if(!FDModules.status('isg').loaded)return;return FDModules.callIfLoaded('isg',name,args,root)}
 function cleanup(name){try{return invoke(name)}catch(_){return undefined}}
 root.openIsgApp=function(){return FDModules.open('isg',[],this)};
 root.fdIsgWorkspace={open:root.openIsgApp,mountSettings:host=>FDModules.open('isg',[{fdIsgAction:'settings',host}]),unmountSettings:()=>cleanup('fdIsgSettingsUnmount'),reset:()=>cleanup('fdIsgReset'),access:()=>root.fdIsgSettingsOpen?.(true),refresh:(...args)=>invoke("fdIsgWork_refresh",args),edit:(...args)=>invoke("fdIsgWork_edit",args),detail:(...args)=>invoke("fdIsgWork_detail",args),getExportModels:(...args)=>invoke("fdIsgWork_getExportModels",args),validateRecord:(...args)=>invoke("fdIsgWork_validateRecord",args),documentStatus:(...args)=>invoke("fdIsgWork_documentStatus",args),filtered:(...args)=>invoke("fdIsgWork_filtered",args),personName:(...args)=>invoke("fdIsgWork_personName",args),personBranch:(...args)=>invoke("fdIsgWork_personBranch",args),personId:(...args)=>invoke("fdIsgWork_personId",args),close:(...args)=>invoke("fdIsgWork_close",args),get state(){return invoke('fdIsgState')},get schemas(){return invoke('fdIsgSchemas')}};
 root.fdIsgDocuments={clear:()=>cleanup('fdIsgDocumentClear'),get catalog(){return invoke('fdIsgCatalog')||[]},get version(){return FDModules.status('isg').loaded?1:undefined},list:(...args)=>invoke("fdIsgDoc_list",args),buildModel:(...args)=>invoke("fdIsgDoc_buildModel",args),buildPdf:(...args)=>invoke("fdIsgDoc_buildPdf",args),open:(...args)=>invoke("fdIsgDoc_open",args),plan:(...args)=>invoke("fdIsgDoc_plan",args),wrap:(...args)=>invoke("fdIsgDoc_wrap",args),browserMeasure:(...args)=>invoke("fdIsgDoc_browserMeasure",args),drawPage:(...args)=>invoke("fdIsgDoc_drawPage",args),canonical:(...args)=>invoke("fdIsgDoc_canonical",args),digest:(...args)=>invoke("fdIsgDoc_digest",args),canCertificate:(...args)=>invoke("fdIsgDoc_canCertificate",args)};
 // Preserve the requested Settings host on resource retry; never fall through to operational UI.
 root.fdIsgWorkspace.mountSettings=async function(host){
  const identity=JSON.stringify([activeUser?.supabaseUserId,activeUser?.sirketId,activeUser?.rol]);
  const result=await FDModules.open('isg',[{fdIsgAction:'settings',host}]);
  if(result===false&&host?.isConnected&&identity===JSON.stringify([activeUser?.supabaseUserId,activeUser?.sirketId,activeUser?.rol])){
   const retry=document.querySelector('#fdModuleLoadError button');if(retry)retry.onclick=()=>{if(host.isConnected&&identity===JSON.stringify([activeUser?.supabaseUserId,activeUser?.sirketId,activeUser?.rol]))return root.fdIsgWorkspace.mountSettings(host)};
  }
  return result;
 };
})(window);
