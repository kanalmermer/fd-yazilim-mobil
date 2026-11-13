window.FDModules.define('wordonizleme',function(){
const root=window,initial=fdWordBelgeBaglami(),requests=new Set();let disposed=false;
const valid=r=>!disposed&&initial===fdWordBelgeBaglami()&&fdWordOnizlemeKayitlari.has(r)&&r?.current();
async function execute(request){
 if(!valid(request)||!request.args)return false;requests.add(request);request.onCancel=()=>requests.delete(request);const stage=request.area.cloneNode(false),nativeDocx=root.docx;request.releaseStage=()=>stage.replaceChildren();
 const check=()=>{if(!valid(request))throw Error('Belge önizleme ekranı değişti.')};
 const document={getElementById:id=>id==='personelBelgeOnizleme'?stage:root.document.getElementById(id)};
 const window={docx:nativeDocx?.renderAsync?{renderAsync:async(...args)=>{request.started=true;check();request.area.replaceChildren();await nativeDocx.renderAsync(...args);check()}}:nativeDocx};
 const console={error:(...args)=>{if(valid(request))root.console.error(...args)}};
 const originalPreview=async function personelBelgeOnizlemeAc(blob, dosyaAdi, baslik, secenek = {}) {
        personelBelgeOnizlemeBlobu = blob;
        personelBelgeOnizlemeAdi = dosyaAdi;
        personelBelgeOnizlemeBasligi = baslik || 'Personel Belgesi';
        const pdfButonu = document.getElementById('personelBelgePdfIndirBtn');
        if (pdfButonu) pdfButonu.style.display = secenek.pdfIndir ? '' : 'none';
        document.getElementById('personelBelgeBaslik').textContent = '📄 ' + baslik;
        document.getElementById('personelBelgeDosyaAdi').textContent = dosyaAdi;
        const alan = document.getElementById('personelBelgeOnizleme');
        alan.innerHTML = '<div style="margin:24px auto;width:max-content;padding:16px 20px;background:#fff;border-radius:10px;font-weight:700;">Word önizlemesi hazırlanıyor...</div>';
        document.getElementById('modalPersonelBelge').style.display = 'flex';
        if (!window.docx?.renderAsync) {
            alan.innerHTML = '<div style="margin:24px auto;max-width:560px;padding:18px;background:#fff;border-radius:10px;">Word önizleme bileşeni yüklenemedi. Belgeyi Word İndir düğmesiyle açıp yazdırabilirsiniz.</div>';
            return;
        }
        alan.innerHTML = '';
        try {
            await window.docx.renderAsync(blob, alan, alan, { inWrapper:true, breakPages:true, ignoreLastRenderedPageBreak:false, renderHeaders:true, renderFooters:true, renderFootnotes:true, ignoreWidth:false, ignoreHeight:false, ignoreFonts:false, useBase64URL:true, experimental:true });
            alan.querySelectorAll('.docx-wrapper > section.docx').forEach((sayfa, index) => {
                sayfa.dataset.sayfa = String(index + 1);
                sayfa.style.position = 'relative';
                sayfa.style.overflow = 'hidden';
                sayfa.style.flex = '0 0 auto';
            });
        } catch (error) {
            console.error('Word önizleme:', error);
            alan.innerHTML = '<div style="margin:24px auto;max-width:560px;padding:18px;background:#fff;border-radius:10px;">Belge hazırlandı ancak tarayıcı önizlemesi açılamadı. Word İndir düğmesini kullanabilirsiniz.</div>';
        }
    };
 try{await originalPreview(...request.args);request.started=true;if(!valid(request))return;request.area.replaceChildren(...stage.childNodes);request.nodes=[...request.area.childNodes];request.finished=true;return undefined}finally{request.args=null;stage.replaceChildren();request.releaseStage=null;}
}
return{open:execute,api:{},dispose(){disposed=true;for(const r of [...requests])r.cancel();requests.clear()}};
});
