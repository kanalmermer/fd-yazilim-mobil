
(function(){
    'use strict';
    const navObserved=new WeakSet();
    const icons=[[/Özet|Dashboard/i,'📊'],[/Personel Kayıtları/i,'👥'],[/İzin Takibi/i,'🏖️'],[/Puantaj/i,'🗓️'],[/Prim Takibi/i,'💰'],[/Avans/i,'💳'],[/İcra/i,'⚖️'],[/Ek Ödeme/i,'🧾'],[/KKD/i,'🦺'],[/Vardiya/i,'🕒'],[/Giriş.?Çıkış/i,'🪪'],[/Aktif Personeller/i,'🟢'],[/Ayrılan Personeller/i,'🔴'],[/Yeni Personel/i,'➕']];
    function navDuzenle(nav){
        nav.querySelectorAll('button').forEach(b=>{const text=b.textContent.trim();if(/\p{Extended_Pictographic}/u.test(text)||/^[+＋]/u.test(text)||b.querySelector('svg,img,.fd-app-tab-icon')){delete b.dataset.fdNavIcon;return;}const icon=icons.find(x=>x[0].test(text));if(icon)b.dataset.fdNavIcon=icon[1];else delete b.dataset.fdNavIcon;});
        if(!navObserved.has(nav)){navObserved.add(nav);let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;navDuzenle(nav)});}).observe(nav,{childList:true,subtree:true,characterData:true});}
    }
    function navlariKur(root=document){if(root.matches?.('.workspace-nav,.module-subnav'))navDuzenle(root);root.querySelectorAll?.('.workspace-nav,.module-subnav').forEach(navDuzenle);}
    
    
    const eskiRender=window.renderPersonelTables;
    if(typeof eskiRender==='function')window.renderPersonelTables=function(){const r=eskiRender.apply(this,arguments);FDModules.callIfLoaded('personelliste','listeleriDuzenle',[],this);return r;};
    window.fdPersonelNavlariKur=navlariKur;
    function kur(){navlariKur();new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1)navlariKur(n);}).observe(document.body,{childList:true});}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',kur);else kur();
})();

