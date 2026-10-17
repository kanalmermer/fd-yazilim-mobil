
(function(){
    window.fdPersonelDriveBelgesiOnizle=function(belge,baslik){
        let modal=document.getElementById('fdPersonelDriveBelgeModal');
        if(!modal){
            modal=document.createElement('div');modal.id='fdPersonelDriveBelgeModal';modal.className='modal-overlay';modal.style.zIndex='10120';
            modal.innerHTML='<div class="modal-card" style="width:min(1180px,97vw);height:96vh;max-height:96vh"><div class="modal-header"><div><h3 id="fdPersonelDriveBelgeBaslik" style="margin:0">Personel Belgesi</h3><small id="fdPersonelDriveBelgeAdi" style="color:#64748b"></small></div><div style="display:flex;gap:8px"><button type="button" class="btn-modern btn-detail-modern" id="fdPersonelDriveAcBtn">Drive’da Aç</button><button type="button" class="modal-close" id="fdPersonelDriveKapatBtn">✕</button></div></div><div class="modal-body" style="padding:0;height:calc(100% - 58px);overflow:hidden;background:#e2e8f0"><iframe id="fdPersonelDriveBelgeFrame" title="Personel belgesi önizleme" style="width:100%;height:100%;border:0;background:#fff"></iframe></div></div>';
            document.body.appendChild(modal);
            modal.querySelector('#fdPersonelDriveKapatBtn').onclick=()=>{modal.querySelector('#fdPersonelDriveBelgeFrame').src='about:blank';modal.style.display='none'};
        }
        const id=String(belge?.id||''),url='https:\x2f\x2fdrive.google.com/file/d/'+encodeURIComponent(id)+'/preview';
        modal.querySelector('#fdPersonelDriveBelgeBaslik').textContent=baslik||'Personel Belgesi';
        modal.querySelector('#fdPersonelDriveBelgeAdi').textContent=String(belge?.ad||'');
        modal.querySelector('#fdPersonelDriveBelgeFrame').src=url;
        modal.querySelector('#fdPersonelDriveAcBtn').onclick=()=>window.open(belge?.url||('https:\x2f\x2fdrive.google.com/open?id='+encodeURIComponent(id)),'_blank','noopener');
        modal.style.display='flex';
    };

})();

