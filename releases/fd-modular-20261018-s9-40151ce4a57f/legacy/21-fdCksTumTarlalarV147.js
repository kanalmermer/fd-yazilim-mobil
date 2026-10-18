
(function(){
    function eksikleriIsaretle(){
        document.querySelectorAll('#cksListeGovde tr').forEach(tr=>{
            const urun=[...tr.querySelectorAll('.cks-product')].find(x=>tapuCksNorm(x.textContent)==='cks verilmedi');
            if(!urun||tr.dataset.fdCksV147==='1')return;
            tr.dataset.fdCksV147='1';tr.classList.add('cks-missing-row');urun.classList.add('cks-missing-badge');
            const durum=[...tr.querySelectorAll('td:nth-child(6) span')].find(x=>/Yeni Alındı|Boşta/i.test(x.textContent||''));if(durum)durum.classList.add(durum.textContent.includes('Yeni')?'cks-new-badge':'cks-missing-badge');
            const edit=tr.querySelector('td:last-child button');if(edit){edit.textContent='＋';edit.title='Bu parsele ÇKS kaydı ekle'}
            const gecmis=tr.querySelector('td:nth-last-child(2) button');if(gecmis){gecmis.textContent='Kayıt yok';const onclick=edit?.getAttribute('onclick');if(onclick)gecmis.setAttribute('onclick',onclick)}
        });
    }
    const govde=document.getElementById('cksListeGovde');if(govde)new MutationObserver(eksikleriIsaretle).observe(govde,{childList:true,subtree:true});
    const formEski=window.tapuCksFormuAc;
    window.tapuCksFormuAc=function(tapuId='',kayitId=''){
        const r=formEski.apply(this,arguments);
        setTimeout(()=>{if(!kayitId&&document.getElementById('cksTakipApp')?.style.display!=='none'){const y=document.getElementById('cksYil')?.value,alan=document.getElementById('tapuCksYil');if(y&&alan)alan.value=y}},20);
        return r;
    };
    eksikleriIsaretle();
})();

