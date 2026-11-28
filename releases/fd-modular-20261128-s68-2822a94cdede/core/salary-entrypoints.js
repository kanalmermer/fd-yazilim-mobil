// Stable salary dialog entries. Drafts and wage history UI are private and lazy.
(function(root){
 let epoch=0,ticket=0;
 const identity=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',JSON.stringify(anaMenuModulAyarlariniDuzelt().map(v=>[v.anahtar,anaMenuModulYetkisi(v.anahtar)]))]);
 root.fdUcretGuncellemeGecisiniIptalEt=()=>{epoch++;try{root.FDModules?.callIfLoaded('ucretguncelleme','fdUcretGuncellemeIptalEt',[],root)}catch(_){}};
 root.fdUcretGuncellemeCagir=function(name,args,receiver){
  if(!isManagerUser()||isPersonelUser()||!anaMenuModulErisimiVar('personel'))return;
  if(name==='fdUcretGecmisiAc'&&args[0]&&!personeller.some(p=>String(p.id)===String(args[0])&&aktifSirketeAit(p)))return;
  const opening=['fdTopluZamAc','fdUcretGecmisiAc'].includes(name),selected=opening?++ticket:ticket,id=identity(),generation=epoch,input=name==='fdTopluZamSatirHesapla'?args[0]:null,value=input?.value;
  const current=()=>id===identity()&&generation===epoch&&selected===ticket&&(!input||(input.isConnected&&input.value===value));
  const options={name,args,receiver,current};
  if(root.FDModules.status('ucretguncelleme').loaded)return root.FDModules.callIfLoaded('ucretguncelleme','fdUcretGuncellemeIslem',[options],receiver);
  if(opening)return root.FDModules.embedded('ucretguncelleme',[options],receiver);
 };
 for(const name of ["fdTopluZamAc","fdTopluZamCiz","fdTopluZamSatirHesapla","fdTopluZamOranUygula","fdUcretGecmisiAc","fdTopluZamlariKaydet"])root[name]=function(...args){return root.fdUcretGuncellemeCagir(name,args,this)};
})(window);
