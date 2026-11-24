(function(root){
 root.fdHareketAktarKayitlari=function(value){if(arguments.length)vardiyaKayitlari=value;return vardiyaKayitlari;};
 root.fdHareketAktarYuklendi=(...args)=>yuklenenVeriler.add(...args);
 let generation=0,sequence=0;const jobs=new Set();
 root.fdHareketAktarYetkisi=()=>Boolean(activeUser?.sirketId&&isManagerUser()&&!isPersonelUser()&&anaMenuModulYazmaYetkisiVar('personel'));
 const identity=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulAyarlariniDuzelt().map(v=>[v.anahtar,anaMenuModulYetkisi(v.anahtar)])]);
 root.fdHareketAktarIptalEt=()=>{generation++;for(const r of jobs)r.cancel();jobs.clear();};
 root.fdHareketAktarCagir=function(file,silent,throwError=false,notify=true){
  if(!file)return Promise.resolve();if(!root.fdHareketAktarYetkisi())return Promise.resolve(null);
  root.fdHareketAktarIptalEt();const epoch=generation,ticket=++sequence,key=identity(),people=personeller,workspace=document.getElementById('magicpassApp');
  let active=true,records=vardiyaKayitlari;const request={file,silent,throwError,notify,people,records,current:()=>active&&epoch===generation&&ticket===sequence&&key===identity()&&root.fdHareketAktarYetkisi()&&people===personeller&&records===vardiyaKayitlari&&workspace===document.getElementById('magicpassApp')&&workspace?.style.display==='block',adopt(next){records=next;},cancel(){active=false;request.onCancel?.();}};
  jobs.add(request);const finish=()=>{request.cancel();jobs.delete(request);};
  try{return Promise.resolve(root.FDModules.embedded('hareketaktar',[request],this)).then(result=>{if(throwError&&(!result||!request.current()))throw Error('Giriş–çıkış aktarımı tamamlanmadı; kaynak TXT korunuyor.');return result;}).finally(finish)}catch(error){finish();throw error;}
 };
})(window);
