// Stable public Puantaj actions. No eager private menu/draft state.
(function(root){
 let generation=0,request=0,entering=0;const context=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',JSON.stringify(anaMenuModulAyarlariniDuzelt().map(v=>[v.anahtar,anaMenuModulYetkisi(v.anahtar)]))]);
 root.fdPuantajGirisindeCalistir=callback=>{entering++;try{return callback()}finally{entering--}};
 root.fdPuantajGecisiniIptalEt=()=>{if(entering)return;generation++;try{root.FDModules?.callIfLoaded('puantaj','fdPuantajIptalEt',[],root)}catch(_){}};
 document.addEventListener('pointerdown',()=>{request++},true);
 root.fdPuantajCagir=function(name,args,receiver){
  const id=context(),epoch=generation,ticket=++request,workspace=document.getElementById('puantajApp'),period=JSON.stringify([document.getElementById('puanAySec')?.value,document.getElementById('puanYilSec')?.value,puantajGorunumu]);
  const current=()=>id===context()&&epoch===generation&&ticket===request&&workspace===document.getElementById('puantajApp')&&(name==='openPuantajApp'||(workspace?.style.display==='block'&&period===JSON.stringify([document.getElementById('puanAySec')?.value,document.getElementById('puanYilSec')?.value,puantajGorunumu])));
  const input=name==='openContextMenu'?args[1]:name==='puantajHucreDegisti'?args[2]:null,inputValue=input?.value;
  let accepted=false;const valid=()=>current()&&(accepted||!input||(input.isConnected&&input.value===inputValue));
  const options={name,args,valid,accept(){accepted=true}};if(name==='openPuantajApp')return root.FDModules.open('puantaj',[options],receiver);
  if(root.FDModules.status('puantaj').loaded)return root.FDModules.callIfLoaded('puantaj','fdPuantajIslem',[options],receiver);
  return root.FDModules.embedded('puantaj',[options],receiver);
 };
})(window);
