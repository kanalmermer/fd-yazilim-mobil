// Scoped failure recovery for Icra and Prim only. Existing server/RLS/period
// rules still apply; this is not a new server transaction or CAS protocol.
(function(root){
 'use strict';
 const pending=new Set(),clone=value=>JSON.parse(JSON.stringify(value));
 function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));return value}
 const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
 function identity(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
 function allowed(){return Boolean(activeUser?.sirketId)&&isManagerUser()&&!isPersonelUser()&&anaMenuModulYazmaYetkisiVar('personel')}
 function read(key){return key==='icralar'?icralar:puantajVerileri}
 function write(key,value){if(key==='icralar')icralar=value;else puantajVerileri=value}
 function map(key,rows){return new Map(rows.map((r,i)=>[supabaseKayitAnahtari(key,r,i),r]))}
 function snapshot(key){try{return JSON.parse(veriSonKayitGoruntuleri.get(key)||'[]')}catch(_){throw Error('Son doğrulanmış kayıt bilgisi okunamadı; listeyi yenileyin.')}}
 root.fdFinancialJsonEqual=equal;
 root.fdFinancialAcknowledge=function(key,rows){
  if(!['icralar','puantaj'].includes(key)||!allowed())throw Error('Kayıt onayı için yetki yok.');
  const confirmed=map(key,snapshot(key));for(const row of rows){if(!row||row.module!==key||!row.data||String(row.data.sirketId||'')!==String(activeUser.sirketId))throw Error('Sunucunun kayıt onayı geçersiz.');confirmed.set(String(row.legacy_id),clone(row.data))}
  veriSonKayitGoruntuleri.set(key,JSON.stringify([...confirmed.values()]));
 };
 root.fdFinancialCapture=function(key,isCurrent,options={}){
  if(!['icralar','puantaj'].includes(key)||!allowed())throw Error('Bu kayıt işlemi için yazma yetkiniz yok.');
  if(!SUPABASE_MODE)throw Error('Bu bağlantıda kayıt sonucu doğrulanamıyor. Doğrulanmış sistem bağlantısını kullanın; değişiklik kaydedilmedi.');
  const initial=identity(),valid=()=>initial===identity()&&allowed()&&isCurrent(),before=clone(read(key)),confirmedBefore=map(key,snapshot(key)),beforeMap=map(key,before),lock=initial+'|'+key;
  if(!valid())throw Error('Oturum değişti; işlemi yeniden açın.');
  if(pending.has(lock)){const error=Error('Önceki kayıt işlemi sürüyor; tamamlanmasını bekleyin.');error.fdFinancialReported=true;showToast(error.message,'warning');throw error;}
  let sent,changes,readbackStarted=false,readbackCompleted=false;
  function track(){
   sent=clone(read(key));const after=map(key,sent),ids=new Set([...beforeMap.keys(),...after.keys()]);changes=[...ids].filter(id=>!equal(beforeMap.get(id),after.get(id))).map(id=>({id,before:beforeMap.get(id),sent:after.get(id)}));
   for(const c of changes){const r=c.sent||c.before;if(String(r.sirketId||'')!==String(activeUser.sirketId))throw Error('Başka şirkete ait kayıt değiştirilemez.');if(key==='puantaj'&&!['primOzet','primAyar'].includes(r.kayitTipi))throw Error('Bu işlem yalnız prim kararını değiştirebilir.')}
   return changes;
  }
  function recover(){
   if(!valid()||!changes)return;
   const current=map(key,read(key)),order=[...current.keys()],acknowledged=map(key,snapshot(key));
   if(readbackStarted&&!readbackCompleted){for(const c of changes){const prior=confirmedBefore.get(c.id);if(prior===undefined)acknowledged.delete(c.id);else acknowledged.set(c.id,clone(prior))}const ackOrder=[...confirmedBefore.keys(),...[...acknowledged.keys()].filter(id=>!confirmedBefore.has(id))];veriSonKayitGoruntuleri.set(key,JSON.stringify(ackOrder.filter(id=>acknowledged.has(id)).map(id=>acknowledged.get(id))));}
   for(const c of changes){
    // Never replace an edit made after this request, nor roll back a confirmed
    // subset of an existing non-atomic multi-record save.
    if(!equal(current.get(c.id),c.sent))continue;
    const ack=acknowledged.get(c.id),prior=confirmedBefore.get(c.id),replacement=!equal(ack,prior)?ack:c.before;
    if(replacement===undefined)current.delete(c.id);else{
     if(!current.has(c.id)){
      const original=[...beforeMap.keys()],at=original.indexOf(c.id),next=original.slice(at+1).find(id=>order.includes(id)),previous=original.slice(0,at).reverse().find(id=>order.includes(id));
      order.splice(next?order.indexOf(next):previous?order.indexOf(previous)+1:order.length,0,c.id);
     }
     current.set(c.id,clone(replacement));
    }
   }
   write(key,order.filter(id=>current.has(id)).map(id=>current.get(id)));veriOnbelleginiKaydet();
  }
  return{
   async save(transport){
    try{
     track();if(!valid())throw Error('Oturum değişti; işlem durduruldu.');
     if(pending.has(lock))throw Error('Önceki kayıt işlemi sürüyor.');pending.add(lock);
     await transport(changes);if(!valid())throw Error('Oturum değişti; önceki işlemin sonucu bu ekrana uygulanmadı.');
     if(changes.length){
      readbackStarted=true;
      const result=await zamanAsimliBekle(supabaseClient.from('portal_records').select('module,legacy_id,data').eq('company_id',String(activeUser.sirketId)).eq('module',key).in('legacy_id',changes.map(c=>c.id)),15000,'Kayıt sonucu zamanında doğrulanamadı. Tekrar kayıt oluşturmadan listeyi kontrol edin.');
      if(!valid())throw Error('Oturum değişti; kayıt sonucu önceki oturuma aittir.');if(result.error)throw result.error;
      if(!Array.isArray(result.data))throw Error('Sunucunun doğrulama yanıtı geçersiz.');
      const actual=new Map();for(const row of result.data){if(row.module!==key||!row.data||String(row.data.sirketId||'')!==String(activeUser.sirketId)||!changes.some(c=>c.id===String(row.legacy_id))||actual.has(String(row.legacy_id)))throw Error('Sunucunun kayıt kapsamı doğrulanamadı.');actual.set(String(row.legacy_id),clone(row.data))}
      const confirmed=map(key,snapshot(key));for(const c of changes){if(actual.has(c.id))confirmed.set(c.id,actual.get(c.id));else confirmed.delete(c.id)}veriSonKayitGoruntuleri.set(key,JSON.stringify([...confirmed.values()]));readbackCompleted=true;
     }
     const ack=map(key,snapshot(key));for(const c of changes)if(!equal(ack.get(c.id),c.sent))throw Error('Kayıt sunucuda doğrulanamadı. Formdaki bilgileri koruduk; listeyi kontrol edip yeniden deneyin.');
     veriOnbelleginiKaydet();return true;
    }catch(error){
     if(valid()){recover();if(options.reportError!==false){showToast('Değişiklik kaydedilemedi: '+(error.message||'Bağlantıyı kontrol edin.')+' Formdaki bilgiler korunuyor.','error');error.fdFinancialReported=true}}
     throw error;
    }finally{pending.delete(lock)}
   }
  };
 };
})(window);
