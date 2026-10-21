
(function(){
    'use strict';
    const navObserved=new WeakSet();
    const icons=[[/Özet|Dashboard/i,'📊'],[/Personel Kayıtları/i,'👥'],[/İzin Takibi/i,'🏖️'],[/Puantaj/i,'🗓️'],[/Prim Takibi/i,'💰'],[/Avans/i,'💳'],[/İcra/i,'⚖️'],[/Ek Ödeme/i,'🧾'],[/KKD/i,'🦺'],[/Vardiya/i,'🕒'],[/Giriş.?Çıkış/i,'🪪'],[/Aktif Personeller/i,'🟢'],[/Ayrılan Personeller/i,'🔴'],[/Yeni Personel/i,'➕']];
    function navDuzenle(nav){
        nav.querySelectorAll('button').forEach(b=>{const text=b.textContent.trim();if(/\p{Extended_Pictographic}/u.test(text)||/^[+＋]/u.test(text)||b.querySelector('svg,img,.fd-app-tab-icon')){delete b.dataset.fdNavIcon;return;}const icon=icons.find(x=>x[0].test(text));if(icon)b.dataset.fdNavIcon=icon[1];else delete b.dataset.fdNavIcon;});
        if(!navObserved.has(nav)){navObserved.add(nav);let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;navDuzenle(nav)});}).observe(nav,{childList:true,subtree:true,characterData:true});}
    }
    function navlariKur(root=document){if(root.matches?.('.workspace-nav,.module-subnav'))navDuzenle(root);root.querySelectorAll?.('.workspace-nav,.module-subnav').forEach(navDuzenle);}
    function listeleriDuzenle(){
        for(const id of ['tabloAktifPersonel','tabloAyrilanPersonel']){const table=document.getElementById(id);if(!table)continue;const labels=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());table.querySelectorAll('tbody tr').forEach(tr=>{if(tr.children.length!==labels.length)return;[...tr.children].forEach((td,i)=>td.dataset.fdLabel=labels[i]);});table.querySelectorAll('.tc-link').forEach(link=>{link.setAttribute('role','button');link.tabIndex=0;if(!link.dataset.fdKeyBound){link.dataset.fdKeyBound='1';link.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();link.click();}});}});}
    }
    function personelDuzeniKur(){
        navlariKur();const main=document.querySelector('#personelApp .app-layout>main');if(main&&!main.querySelector('.fd-personel-intro')){const intro=document.createElement('header');intro.className='fd-personel-intro';intro.innerHTML='<h2>Personel Kayıtları</h2><p>Aktif ve ayrılan personeller, şube toplamları ve özlük bilgileri</p>';main.prepend(intro);}
        for(const id of ['personelSubeOzet','ayrilanSubeOzet']){const el=document.getElementById(id);if(!el||el.parentElement.matches('section.fd-personel-branches'))continue;const oldTitle=el.previousElementSibling,section=document.createElement('section'),heading=document.createElement('h3');section.className='fd-personel-branches';heading.textContent=oldTitle?.textContent||'Şube bazında toplamlar';el.before(section);section.append(heading,el);if(oldTitle?.classList.contains('personel-summary-title'))oldTitle.remove();}
        listeleriDuzenle();
    }
    const eskiRender=window.renderPersonelTables;
    if(typeof eskiRender==='function')window.renderPersonelTables=function(){const r=eskiRender.apply(this,arguments);listeleriDuzenle();return r;};
    function kur(){personelDuzeniKur();new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1)navlariKur(n);}).observe(document.body,{childList:true});}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',kur);else kur();
})();

