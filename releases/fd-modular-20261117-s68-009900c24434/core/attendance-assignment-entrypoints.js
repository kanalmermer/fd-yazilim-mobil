(function(root){
 'use strict';
 let epoch=0,pending=null;
 const fields=['magicpassAy','magicpassPersonel','magicTopluBaslangic','magicTopluBitis','magicTopluVardiya','magicTopluSadeceBos'];
 const clone=x=>JSON.parse(JSON.stringify(x)),signature=x=>JSON.stringify(x);
 const identity=()=>signature([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulAyarlariniDuzelt().map(x=>[x.anahtar,anaMenuModulYetkisi(x.anahtar)])]);
 root.fdVardiyaAtamaYetkisi=()=>Boolean(activeUser?.sirketId&&isManagerUser()&&!isPersonelUser()&&anaMenuModulYazmaYetkisiVar('personel'));
 root.fdVardiyaAtamaIptalEt=()=>{epoch++;pending?.request.cancel();pending=null;};
 root.fdVardiyaAtamaCagir=function(action,arg){
  if(!root.fdVardiyaAtamaYetkisi())return Promise.resolve(null);
  if(pending?.request.current())return pending.promise;
  root.fdVardiyaAtamaIptalEt();const generation=epoch,key=identity(),company=String(aktifSirketId()),workspace=document.getElementById('magicpassApp'),table=document.getElementById('magicpassAylikTablo'),bulk=document.getElementById('modalMagicpassTopluPlan');
  const selected=[...magicpassSeciliGunler],nodes=Object.fromEntries(fields.map(id=>[id,document.getElementById(id)])),values=Object.fromEntries(fields.map(id=>[id,{value:nodes[id]?.value||'',checked:Boolean(nodes[id]?.checked)}])),checks=[...document.querySelectorAll('#magicTopluPersoneller input:checked')].map(x=>x.value),settings=uygulamaAyarlari,settingsKey=signature(settings);
  const native={save:root.supabaseVerileriKaydet,render:root.magicpassAylikCizelgeyiCiz,close:root.magicpassTopluPlanlamaKapat,confirm:root.fdYuzerOnaySor,prompt:root.fdYuzerDegerSor,toast:root.showToast,alert:root.alert,prepareNotice:root.personelVardiyaBildirimiHazirla,notices:root.personelVardiyaBildirimleriniPlanla};
  let active=true,committed=false,ownClose=false,ownRender=false;const records=vardiyaKayitlari,recordsKey=signature(records),leaves=izinler,leavesKey=signature(leaves);
  const inputsCurrent=()=>fields.filter(id=>action==='bulk'||!id.startsWith('magicToplu')).every(id=>nodes[id]===document.getElementById(id)&&values[id].value===(nodes[id]?.value||'')&&values[id].checked===Boolean(nodes[id]?.checked));
  const periodCurrent=()=>['magicpassAy','magicpassPersonel'].every(id=>nodes[id]===document.getElementById(id)&&values[id].value===(nodes[id]?.value||''));
  const selectionCurrent=()=>ownRender||action==='bulk'?ownRender||signature(checks)===signature([...document.querySelectorAll('#magicTopluPersoneller input:checked')].map(x=>x.value)):signature(selected)===signature([...magicpassSeciliGunler]);
  const request={action,arg,company,selected,values,checks,records:clone(records),leaves:clone(leaves),native,
   current:()=>active&&epoch===generation&&key===identity()&&root.fdVardiyaAtamaYetkisi()&&company===String(aktifSirketId())&&settings===uygulamaAyarlari&&(committed||settingsKey===signature(settings))&&workspace===document.getElementById('magicpassApp')&&workspace?.style.display!=='none'&&table===document.getElementById('magicpassAylikTablo')&&native.save===root.supabaseVerileriKaydet&&native.notices===root.personelVardiyaBildirimleriniPlanla&&periodCurrent()&&(committed||records===vardiyaKayitlari&&recordsKey===signature(vardiyaKayitlari)&&leaves===izinler&&leavesKey===signature(izinler))&&(ownClose||inputsCurrent()&&selectionCurrent()&&(action!=='bulk'||bulk===document.getElementById('modalMagicpassTopluPlan')&&bulk?.style.display!=='none')),
   commit(rows){if(!request.current())throw Error('Vardiya atama oturumu değişti.');const belongs=k=>!k.sirketId||String(k.sirketId)===company;vardiyaKayitlari=[...records.filter(k=>!belongs(k)),...rows];yuklenenVeriler.add('vardiya');committed=true;},
   close(){if(!request.current())return;ownClose=true;native.close();},
   render(){if(!request.current())return;ownRender=true;native.render();},
   cancel(){active=false;}
  };
  let promise;try{promise=Promise.resolve(root.FDModules.embedded('vardiyaatama',[request],this)).finally(()=>{request.cancel();if(pending?.request===request)pending=null;});}catch(error){request.cancel();throw error;}
  pending={request,promise};return promise;
 };
})(window);
