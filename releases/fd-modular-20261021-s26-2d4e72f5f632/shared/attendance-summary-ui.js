// Read-only monthly attendance disclosure. No transport, mutations or persisted UI state.
function fdAttendanceSummaryIdentity(personel,ay){
 return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',typeof anaMenuModulYetkisi==='function'?anaMenuModulYetkisi('personel'):'',String(personel?.id||''),String(ay||'')]);
}
function fdAttendanceSummaryExportScope(personel,ay){
 const key=fdAttendanceSummaryIdentity(personel,ay);
 return()=>key===fdAttendanceSummaryIdentity(personel,ay)&&Boolean(activeUser)&&aktifSirketeAit(personel)&&(!isPersonelUser()||String(personel.id)===String(activeUser?.tcNo||''))&&String(document.getElementById('magicpassAy')?.value||'')===String(ay)&&String(document.getElementById('magicpassPersonel')?.value||'')===String(personel.id);
}
function fdAttendanceSummaryClear(table){
 if(table?._fdAttendanceSummary){table._fdAttendanceSummary.remove();delete table._fdAttendanceSummary;}
}
function fdAttendanceSummaryMount(table,liste,personel){
 if(!table||!personel){fdAttendanceSummaryClear(table);return;}
 if(!activeUser||!aktifSirketeAit(personel)||(isPersonelUser()&&String(personel.id)!==String(activeUser?.tcNo||''))){fdAttendanceSummaryClear(table);return;}
 const ay=String(liste?.[0]?.tarih||document.getElementById('magicpassAy')?.value||'').slice(0,7),key=fdAttendanceSummaryIdentity(personel,ay),anchor=table.closest('.magicpass-aylik-table-wrap')||table.closest('.table-wrapper')||table;
 let details=table._fdAttendanceSummary;
 if(!details?.isConnected){details=document.createElement('details');details.className='fd-att-summary';details.dataset.fdAttendanceSummary='true';table._fdAttendanceSummary=details;anchor.insertAdjacentElement('afterend',details);}
 const opened=details.dataset.context===key&&details.open;details.dataset.context=key;
 try{
  const summary=fdAttendanceMonthlySummary(personel,liste,ay);
  details.innerHTML='<summary><span>Aylık Çalışma Özeti</span><small>Saat · Gün Sayısı · Gün Karşılığı</small></summary><div class="fd-att-summary-body">'+fdAttendanceSummaryTableHtml(summary)+'</div>';
 }catch(error){details.innerHTML='<summary><span>Aylık Çalışma Özeti</span></summary><p role="alert" class="fd-att-summary-error">Özet hazırlanamadı. Listeyi yenileyip tekrar deneyin.</p>';}
 details.open=Boolean(opened);
}
