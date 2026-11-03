window.FDModules.define('drivebelge',function(){
let disposed=false,bound=null,owned=null,observer=null;const initial=fdDriveBelgeBaglami();
const originalOpen=function(belge,baslik){
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
function valid(request=bound){return !disposed&&initial===fdDriveBelgeBaglami()&&fdDriveBelgeYetkisi()&&request===fdDriveBelgeIstek&&request?.current()}
function clear(){bound?.cancel();bound=null;if(owned&&document.getElementById('fdPersonelDriveBelgeModal')===owned){owned.querySelector('#fdPersonelDriveBelgeFrame').src='about:blank';owned.style.display='none';owned.querySelector('#fdPersonelDriveBelgeBaslik').textContent='Personel Belgesi';owned.querySelector('#fdPersonelDriveBelgeAdi').textContent='';owned.querySelector('#fdPersonelDriveAcBtn').onclick=null}observer?.disconnect();observer=null}
return{open(request){if(!valid(request)||!request.args)return false;clear();bound=request;if(!valid(request))return false;originalOpen(...request.args);owned=document.getElementById('fdPersonelDriveBelgeModal');const action=owned.querySelector('#fdPersonelDriveAcBtn'),open=action.onclick;action.onclick=()=>{if(valid(request))return open();clear()};observer=new MutationObserver(()=>{if(bound&&(!valid(bound)||owned?.style.display==='none'))clear()});observer.observe(owned,{attributes:true,attributeFilter:['style']});const detail=document.getElementById('modalPersonelDetay'),body=document.getElementById('detayModalBody');if(detail)observer.observe(detail,{attributes:true,attributeFilter:['style']});if(body)observer.observe(body,{childList:true,subtree:true});return true},api:{clear},dispose(){clear();disposed=true;owned?.remove();owned=null}};
});
