(function(root){
 'use strict';
 let generation=0;const jobs=new Set();let statusPending=null;
 root.fdDosyaBagYetkisi=action=>Boolean(activeUser?.sirketId&&!isPersonelUser()&&(action==='status'||isManagerUser()&&(action==='import'?anaMenuModulYazmaYetkisiVar('personel'):(anaMenuModulYazmaYetkisiVar('personel')||anaMenuModulYazmaYetkisiVar('ayarlar')))));
 const identity=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulAyarlariniDuzelt().map(v=>[v.anahtar,anaMenuModulYetkisi(v.anahtar)])]);
 root.fdDosyaBagIptalEt=()=>{generation++;for(const request of jobs)request.cancel();jobs.clear();statusPending=null;};
 root.fdDosyaBagCagir=function(action,arg){
  if(!root.fdDosyaBagYetkisi(action))return Promise.resolve(null);
  if(action==='status'&&[...jobs].some(r=>r.action!=='status'))return Promise.resolve(null);
  if(action==='status'&&statusPending)return statusPending;
  if(action!=='status'){root.fdDosyaBagIptalEt();root.fdHareketAktarIptalEt?.();}
  const epoch=generation,key=identity(),company=String(aktifSirketId()),workspace=document.getElementById('magicpassApp'),nodes=['ayarMagicDosyaDurumu','magicpassDosyaDurumu'].map(id=>document.getElementById(id));
  const native={status:root.magicpassDosyaDurumuYaz,show:root.showGlobalOverlay,hide:root.hideGlobalOverlay,progress:root.globalOverlayIlerleme,toast:root.showToast,alert:root.alert,import:root.magicpassDosyasiniIsle,fetch:root.fetch,FileReader:root.FileReader};
  let active=true,settings=uygulamaAyarlari;
  const request={action,arg,company,settings,user:{...activeUser},companies:sirketler.slice(),defaults:VARSAYILAN_UYGULAMA_AYARLARI,client:typeof supabaseClient==='undefined'?null:supabaseClient,supabase:SUPABASE_MODE,manager:isManagerUser(),googleUrl:GOOGLE_SCRIPT_URL,native,picker:null,
   current:()=>active&&epoch===generation&&key===identity()&&root.fdDosyaBagYetkisi(action)&&company===String(aktifSirketId())&&settings===uygulamaAyarlari&&workspace===document.getElementById('magicpassApp')&&nodes.every((node,i)=>node===document.getElementById(['ayarMagicDosyaDurumu','magicpassDosyaDurumu'][i]))&&native.import===root.magicpassDosyasiniIsle&&native.fetch===root.fetch,
   commitSettings(value){if(!request.current())throw Error('Dosya bağlantısı oturumu değişti.');uygulamaAyarlari=value;settings=value;},
   cancel(){if(!active)return;active=false;request.onCancel?.();}
  };
  // Start the native picker in the original click turn, before any lazy await.
  if(action==='choose'&&root.showOpenFilePicker){try{request.picker=Promise.resolve(root.showOpenFilePicker({id:'fd-magicpass-txt',startIn:'documents',multiple:false,types:[{description:'MagicPass TXT/CSV',accept:{'text/plain':['.txt','.csv']}}]}));}catch(error){request.picker=Promise.reject(error);}request.picker.catch(()=>{});}
  jobs.add(request);
  // Resolve the remembered handle and native permission alongside resource loading.
  // No lazy wait is inserted before the user-activated permission request.
  if(action==='import'){
   request.prepared=(async()=>{const db=await root.magicpassDosyaVeritabaniAc();let handle;
    try{if(!request.current())throw Error('Dosya bağlantısı oturumu değişti.');handle=await new Promise((resolve,reject)=>{const query=db.transaction('dosyalar','readonly').objectStore('dosyalar').get('magicpass_'+company);query.onsuccess=()=>resolve(query.result||null);query.onerror=()=>reject(query.error);});}finally{db.close();}
    if(!request.current())throw Error('Dosya bağlantısı oturumu değişti.');if(!handle)return {handle:null,permission:null};
    let permission=typeof handle.queryPermission==='function'?await handle.queryPermission({mode:'readwrite'}):'granted';
    if(!request.current())throw Error('Dosya bağlantısı oturumu değişti.');
    if(permission!=='granted'&&arg&&typeof handle.requestPermission==='function')permission=await handle.requestPermission({mode:'readwrite'});
    if(!request.current())throw Error('Dosya bağlantısı oturumu değişti.');return {handle,permission};
   })();request.prepared.catch(()=>{});
  }
  const finish=()=>{request.cancel();jobs.delete(request);};
  let result;try{result=Promise.resolve(root.FDModules.embedded('dosyabaglantisi',[request],this)).finally(finish);}catch(error){finish();throw error;}
  if(action==='status'){statusPending=result;result.finally(()=>{if(statusPending===result)statusPending=null;}).catch(()=>{});}
  return result;
 };
})(window);
