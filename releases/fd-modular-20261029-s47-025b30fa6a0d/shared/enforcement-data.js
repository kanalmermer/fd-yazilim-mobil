// Existing common calculations, screen transition and cross-module document viewer.
function icraKalanBorc(icra) {
        const kesilen = (Array.isArray(icra.kesintiler) ? icra.kesintiler : [])
            .reduce((toplam, k) => toplam + Number(k.tutar || 0), 0);
        return Math.max(0, Number(icra.toplamBorc || 0) - kesilen);
    }
function icraSiradakiniAktifEt(pId) {
        const aktifVar = icralar.some(i =>
            String(i.pId) === String(pId) &&
            String(i.durum) === 'Aktif' &&
            icraKalanBorc(i) > 0
        );
        if (aktifVar) return;
        const siradaki = icralar
            .filter(i => String(i.pId) === String(pId) && ['Bekleyen Sıra', 'Beklemede'].includes(String(i.durum)))
            .sort((a, b) => Number(a.siraTarihi || 0) - Number(b.siraTarihi || 0))[0];
        if (siradaki) siradaki.durum = 'Aktif';
    }
let fdPdfOnizlemeIstek=null;
function icraPdfAc(url,dosyaNo,belgeTuru='İcra Yazısı'){
 if(!activeUser?.sirketId)return Promise.resolve();
 fdPdfOnizlemeIstek?.cancel();const context=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',...['personel','arac','police'].map(id=>anaMenuModulYetkisi(id))]),scope=context();
 const request={args:[url,dosyaNo,belgeTuru],cancelled:false,errorButton:null,errorClose:null,current(){return fdPdfOnizlemeIstek===request&&!request.cancelled&&Boolean(activeUser?.sirketId)&&scope===context()},clearError(){if(request.errorButton&&request.errorClose)request.errorButton.removeEventListener('click',request.errorClose);request.errorButton=null;request.errorClose=null},cancel(){request.cancelled=true;request.resolveCancellation?.();request.clearError();request.args=null;if(fdPdfOnizlemeIstek===request)fdPdfOnizlemeIstek=null}};
 request.whenCancelled=new Promise(resolve=>request.resolveCancellation=resolve);fdPdfOnizlemeIstek=request;request.promise=FDModules.embedded('pdfonizleme',[request],this).then(value=>{if(!request.current())request.cancel();else if(value===false){const panel=document.getElementById('fdModuleLoadError');request.errorButton=Array.from(panel?.querySelectorAll('button')||[]).find(b=>b.textContent==='Kapat')||null;request.errorClose=()=>request.cancel();request.errorButton?.addEventListener('click',request.errorClose,{once:true});}return value},()=>request.cancel());return request.promise;
}
function icraPdfKapat(){fdPdfOnizlemeIstek?.cancel();if(window.FDModules?.status('pdfonizleme').loaded)return FDModules.callIfLoaded('pdfonizleme','icraPdfKapat',[],this)}
window.fdPdfOnizlemeGecisiniIptalEt=(close=>function(onlyInvalid=false){if(!onlyInvalid||(fdPdfOnizlemeIstek&&!fdPdfOnizlemeIstek.current()))return close()})(icraPdfKapat);
function icraEkraniniKapat() {
        const app = document.getElementById('icraApp');
        if (app) app.style.display = 'none';
        const dashboard = document.getElementById('personelDashboardApp');
        if (dashboard) dashboard.style.display = 'none';
    }
