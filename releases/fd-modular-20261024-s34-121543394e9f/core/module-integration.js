(function(root){
  'use strict';
  root.FDModules.configure(()=>{
    if(typeof activeUser==='undefined'||!activeUser)return null;
    return {
      user:String(activeUser.supabaseUserId||activeUser.id||activeUser.username||''),
      company:String(activeUser.sirketId||''),role:String(activeUser.rol||''),
      permissions:JSON.stringify(anaMenuModulAyarlariniDuzelt().map(value=>[value.anahtar,anaMenuModulYetkisi(value.anahtar)])),
      canRead:id=>id==='personelcikti'?(!isPersonelUser()&&anaMenuModulErisimiVar('personel')):id==='personeldetay'?(anaMenuModulErisimiVar('personel')&&!['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol)):id==='personelaktar'?anaMenuModulErisimiVar('ayarlar'):id==='personelbelge'?(isManagerUser()&&anaMenuModulErisimiVar('personel')):id==='personelozet'?(!isPersonelUser()&&anaMenuModulErisimiVar('personel')):id==='gunlukrapor'?(!isPersonelUser()&&anaMenuModulErisimiVar('personel')):id==='vardiyatanim'?(!isPersonelUser()&&anaMenuModulErisimiVar('personel')):id==='asistan'?!isPersonelUser():id==='companytools'?!isPersonelUser():id==='workcenter'?(isPersonelUser()||(isManagerUser()&&anaMenuModulErisimiVar('isMerkezi'))):id==='isg'?(anaMenuModulErisimiVar('isg')||(activeUser.rol==='Admin'&&anaMenuModulErisimiVar('ayarlar'))):(id!=='bordro'||isManagerUser()||isPersonelUser())&&(id!=='kullanici'||isManagerUser())&&anaMenuModulErisimiVar(['ekodeme','kkd','avans','icra','prim','izin','vardiya','bordro','vardiyatanim','gunlukrapor','personelozet','personelbelge'].includes(id)?'personel':id),canWrite:id=>id==='asistan'?false:id==='companytools'?isManagerUser():id==='workcenter'?(isPersonelUser()||(isManagerUser()&&anaMenuModulYazmaYetkisiVar('isMerkezi'))):id==='isg'?(anaMenuModulYazmaYetkisiVar('isg')||(activeUser.rol==='Admin'&&anaMenuModulYazmaYetkisiVar('ayarlar'))):anaMenuModulYazmaYetkisiVar(['ekodeme','kkd','avans','icra','prim','izin','vardiya','bordro','vardiyatanim','gunlukrapor','personelozet','personelbelge'].includes(id)?'personel':id)
    };
  });
  // Keep stable opener bindings already protected by the original role/navigation wrappers.
  const existingLogout=root.logout;
  if(typeof existingLogout==='function')root.logout=async function(...args){root.FDModules.cancelNavigation();try{return await existingLogout.apply(this,args)}finally{root.FDModules.sessionChanged()}};
  const existingHome=root.closeAppsToHub;
  if(typeof existingHome==='function')root.closeAppsToHub=function(...args){root.FDModules.cancelNavigation();return existingHome.apply(this,args)};
  const existingSwitch=root.fdUygulamaSekmesineGec;
  if(typeof existingSwitch==='function')root.fdUygulamaSekmesineGec=function(id,...args){if(id!=='ihracat')root.FDModules.cancelNavigation();return existingSwitch.call(this,id,...args)};
  const existingMenu=root.anaMenuModulunuAc;
  if(typeof existingMenu==='function')root.anaMenuModulunuAc=function(id,...args){if(id!=='ihracat')root.FDModules.cancelNavigation();return existingMenu.call(this,id,...args)};
  const existingHomeTransition=root.fdAnaEkranaHafifDon;
  if(typeof existingHomeTransition==='function')root.fdAnaEkranaHafifDon=function(...args){root.FDModules.cancelNavigation();return existingHomeTransition.apply(this,args)};
  const existingTabRegistration=root.fdSekmeyiKaydet;
  if(typeof existingTabRegistration==='function')root.fdSekmeyiKaydet=function(id,...args){if(id!=='ihracat')root.FDModules.cancelNavigation();return existingTabRegistration.call(this,id,...args)};
  // Login/session refresh can change user without passing through logout.
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)root.FDModules.sessionChanged()});
  document.addEventListener('fd:module-mounted',event=>{
    if(['ekodeme','kkd','avans','icra','prim','izin','vardiya','bordro','vardiyatanim','gunlukrapor','personelozet','personelbelge'].includes(event.detail.id)&&typeof ekOdemeSekmeleriniKur==='function')ekOdemeSekmeleriniKur();
    if(typeof personelModuluYetkiGorunumunuUygula==='function'&&typeof activeUser!=='undefined'&&activeUser)personelModuluYetkiGorunumunuUygula(event.detail.id==='workcenter'?'isMerkezi':['ekodeme','kkd','avans','icra','prim','izin','vardiya','bordro','vardiyatanim','gunlukrapor','personelozet','personelbelge'].includes(event.detail.id)?'personel':event.detail.id);
  });
})(window);
