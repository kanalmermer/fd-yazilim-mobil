let fdDriveBelgeIstek=null,fdDriveBelgeNesli=0;
function fdDriveBelgeBaglami(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',JSON.stringify(anaMenuModulAyarlariniDuzelt().map(v=>[v.anahtar,anaMenuModulYetkisi(v.anahtar)]))])}
function fdDriveBelgeYetkisi(){return Boolean(activeUser?.sirketId)&&anaMenuModulErisimiVar('personel')&&!['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol)}
window.fdDriveBelgeGecisiniIptalEt=function(onlyInvalid=false){if(!onlyInvalid||!fdDriveBelgeIstek?.current()){fdDriveBelgeIstek?.cancel();if(window.FDModules?.status('drivebelge').loaded)FDModules.callIfLoaded('drivebelge','clear',[]);if(!onlyInvalid)fdDriveBelgeNesli++}};
window.fdPersonelDriveBelgesiOnizle=async function(belge,baslik){
 if(!fdDriveBelgeYetkisi())return false;
 window.fdDriveBelgeGecisiniIptalEt();const scope=fdDriveBelgeBaglami(),epoch=fdDriveBelgeNesli,detail=document.getElementById('modalPersonelDetay'),body=detail?.style.display==='flex'?document.getElementById('detayModalBody'):null,node=body?.firstElementChild||null;
 const request={args:[{id:belge?.id,ad:belge?.ad,url:belge?.url},baslik],cancelled:false,current(){return !request.cancelled&&request===fdDriveBelgeIstek&&epoch===fdDriveBelgeNesli&&scope===fdDriveBelgeBaglami()&&fdDriveBelgeYetkisi()&&(!node||(detail.style.display==='flex'&&body.firstElementChild===node&&node.isConnected))},cancel(){request.cancelled=true;request.args=null;if(fdDriveBelgeIstek===request)fdDriveBelgeIstek=null}};fdDriveBelgeIstek=request;let opened=false;
 try{opened=await FDModules.embedded('drivebelge',[request],this)===true;return opened}finally{request.args=null;if(!opened)request.cancel()}
};
