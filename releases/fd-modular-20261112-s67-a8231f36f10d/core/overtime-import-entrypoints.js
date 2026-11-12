// Keep the existing native file picker synchronous; only its reader loads lazily.
(function(root){
 let epoch=0,sequence=0;const jobs=new Set();
 root.fdMesaiAktarYetkisi=()=>Boolean(activeUser?.sirketId&&isManagerUser()&&!isPersonelUser()&&anaMenuModulYazmaYetkisiVar('personel'));
 const identity=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',JSON.stringify(anaMenuModulAyarlariniDuzelt().map(v=>[v.anahtar,anaMenuModulYetkisi(v.anahtar)]))]);
 root.fdMesaiAktarIptalEt=()=>{epoch++;for(const r of jobs)r.cancel();jobs.clear();};
 root.fdMesaiAktarCagir=function(event){
  const file=event?.target?.files?.[0];if(event?.target)event.target.value='';if(!file||!root.fdMesaiAktarYetkisi())return;
  if(typeof XLSX==='undefined'){alert('Excel okuma kütüphanesi yüklenemedi. Sayfayı yenileyip tekrar deneyin.');return;}
  root.fdMesaiAktarIptalEt();const generation=epoch,ticket=++sequence,key=identity(),workspace=document.getElementById('puantajApp'),input=document.getElementById('mesaiExcelDosyasi'),month=document.getElementById('puanAySec'),year=document.getElementById('puanYilSec'),period=JSON.stringify([month?.value,year?.value,puantajGorunumu]),records=puantajVerileri,people=personeller,library=XLSX;
  let active=true;const request={file,library,records,people,current:()=>active&&generation===epoch&&ticket===sequence&&key===identity()&&root.fdMesaiAktarYetkisi()&&workspace===document.getElementById('puantajApp')&&workspace?.style.display==='block'&&input===document.getElementById('mesaiExcelDosyasi')&&month===document.getElementById('puanAySec')&&year===document.getElementById('puanYilSec')&&period===JSON.stringify([month?.value,year?.value,puantajGorunumu])&&records===puantajVerileri&&people===personeller&&library===XLSX,cancel(){active=false;request.onCancel?.();}};
  if(!request.current())return;jobs.add(request);
  const finish=()=>{request.cancel();jobs.delete(request);};
  try{const value=root.FDModules.embedded('mesaiaktar',[request],this);return Promise.resolve(value).finally(finish)}catch(error){finish();throw error;}
 };
})(window);
