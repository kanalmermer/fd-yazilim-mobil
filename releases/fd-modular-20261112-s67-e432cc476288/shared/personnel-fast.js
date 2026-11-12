'use strict';
(function(root){
    // Only the list's read dependencies change. Shared full-record transport,
    // snapshots, dirty-edit guards and authorization remain authoritative.
    const listKeys=['personeller','subeler'];
    const exitKeys=['personeller','subeler','izinler','avanslar','icralar','ekOdemeler'];
    let listRequest=0,detailRequest=0,editRequest=0;
    const blocked=new WeakMap();
    const identity=()=>fdPortalVeriOturumu()+'|'+String(activeUser?.id||activeUser?.username||'')+'|'+anaMenuModulYetkisi('personel');
    const valid=key=>key===identity()&&!!activeUser?.sirketId&&anaMenuModulErisimiVar('personel')&&!['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol);
    const visible=el=>el&&el.style.display!=='none'&&el.isConnected;
    function status(host,message,retry){
        let box=host.querySelector(':scope > .fd-personnel-load');
        if(!box){box=document.createElement('div');box.className='fd-personnel-load';box.setAttribute('role','status');box.setAttribute('aria-live','polite');host.prepend(box)}
        box.replaceChildren();box.hidden=!message;
        if(message){const text=document.createElement('span');text.textContent=message;box.append(text)}
        if(retry){const button=document.createElement('button');button.type='button';button.textContent='Tekrar dene';button.onclick=retry;box.append(button)}
        return box;
    }
    function block(host,busy){
        host.setAttribute('aria-busy',String(busy));
        if(busy){if(!blocked.has(host))blocked.set(host,new Map());const state=blocked.get(host);for(const el of host.children){if(el.classList.contains('fd-personnel-load'))continue;if(!state.has(el))state.set(el,el.inert);el.inert=true}}
        else {for(const [el,inert]of blocked.get(host)||[])el.inert=inert;blocked.delete(host)}
    }
    async function load(keys){
        if(!SUPABASE_MODE)return driveVerileriniYukleBaslangicta('personel');
        await supabaseVerileriniYukle('personel','',{anahtarlar:keys});
        if(!keys.every(key=>yuklenenVeriler.has(key)))throw Error('Personel bilgileri tamamen yüklenemedi.');
    }
    root.fdPersonelListeyiHazirla=async function(){
        const host=document.getElementById('personelApp'),key=identity(),request=++listRequest;
        if(!host||!valid(key))return false;
        const current=()=>request===listRequest&&valid(key)&&visible(host);
        status(host,'Personel listesi yükleniyor…');block(host,true);
        try{
            await load(listKeys);
            if(!current())return false;
            fdPersonelArayuzunuYenile(true);status(host,'');block(host,false);
            if(isPersonelUser())await root.openPersonelDetayModal(String(activeUser.tcNo||''));
            return current();
        }catch(error){
            if(current()){status(host,'Personel listesi yüklenemedi. Kayıtlarınız değiştirilmedi.',()=>root.fdPersonelListeyiHazirla());console.warn('Personel listesi yüklenemedi:',error)}
            return false;
        }
    };
    // Wrap AFTER the original detail/preference adapters so none runs on
    // unloaded history, and stale/cancelled reads never mount a different card.
    const originalDetail=root.openPersonelDetayModal;
    root.openPersonelDetayModal=async function(id){
        const key=identity(),request=++detailRequest;
        if(!valid(key)||(isPersonelUser()&&String(id)!==String(activeUser.tcNo||'')))return false;
        if(!personeller.some(p=>String(p.id)===String(id)&&aktifSirketeAit(p)))return false;
        if(typeof root.fdPersonelDetayKaynaklariniHazirla==='function'){const prepared=await root.fdPersonelDetayKaynaklariniHazirla(id);if(!prepared||request!==detailRequest||!valid(key))return false;}
        const modal=document.getElementById('modalPersonelDetay'),host=modal.querySelector('.modal-content')||modal.firstElementChild;
        const current=()=>request===detailRequest&&valid(key)&&visible(modal);
        modal.style.display='flex';host.classList.add('fd-personnel-detail-loading');status(host,'Personel kartı ve geçmiş bilgileri yükleniyor…');
        try{
            await load(SUPABASE_MODULLERI.personel);
            if(!current())return false;
            status(host,'');host.classList.remove('fd-personnel-detail-loading');
            return originalDetail.call(this,id);
        }catch(error){if(current())status(host,'Personel kartı yüklenemedi. Geçmiş bilgiler henüz hazır değil.',()=>root.openPersonelDetayModal(id));return false}
    };
    const originalClose=root.closePersonelDetayModal;
    root.closePersonelDetayModal=function(...args){++detailRequest;const modal=document.getElementById('modalPersonelDetay');modal?.querySelector('.fd-personnel-detail-loading')?.classList.remove('fd-personnel-detail-loading');return originalClose.apply(this,args)};
    const originalEdit=root.personelDuzenle;
    root.personelDuzenle=async function(id){
        const host=document.getElementById('personelApp'),key=identity(),request=++editRequest,listGeneration=listRequest;
        if(!host||!valid(key))return false;
        const current=()=>request===editRequest&&listGeneration===listRequest&&valid(key)&&visible(host);
        status(host,'Personel düzenleme bilgileri hazırlanıyor…');block(host,true);
        try{
            // Existing exit/debt/leave warnings read these arrays on submit.
            await load(exitKeys);
            if(!current())return false;
            status(host,'');block(host,false);return originalEdit.call(this,id);
        }catch(error){if(current())status(host,'Düzenleme bilgileri yüklenemedi. Kayıtlarınız değiştirilmedi.',()=>root.personelDuzenle(id));return false}
    };
})(window);
