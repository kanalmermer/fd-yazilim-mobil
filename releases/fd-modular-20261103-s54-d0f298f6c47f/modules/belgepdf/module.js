window.FDModules.define('belgepdf',function(){
const root=window,initial=fdWordBelgeBaglami(),requests=new Set();let disposed=false;
const valid=r=>!disposed&&initial===fdWordBelgeBaglami()&&root.fdPersonelPdfKayitli(r)&&r?.current();
async function execute(request){
 if(!valid(request)||!request.args||!request.helpers)return false;requests.add(request);request.onCancel=()=>requests.delete(request);
 const check=()=>{if(!valid(request))throw Error('PDF belge ekranı değişti.')};
 const checked=async value=>{check();const result=await value;check();return result};
 const helpers=request.helpers,nativeDocx=root.docx,nativeCanvas=root.html2canvas;
 const window={docx:nativeDocx?.renderAsync?{renderAsync:async(...args)=>{check();request.stage=args[1];await nativeDocx.renderAsync(...args);check()}}:nativeDocx,jspdf:root.jspdf};
 const html2canvas=typeof nativeCanvas==='function'?async(...args)=>{check();return checked(nativeCanvas(...args))}:nativeCanvas;
 const bekle=ms=>checked(helpers.bekle(ms)),pdfSayfaNumarala=(...args)=>{check();return helpers.pdfSayfaNumarala(...args)};
 const document={fonts:root.document.fonts,body:root.document.body,createElement:(...args)=>{check();const node=root.document.createElement(...args);if(request.args[3]?.onizle===false&&!request.hidden&&args[0]==='div')request.hidden=node;return node}};
 const fdCiktiOnizlemeAc=(...args)=>{check();const node=root.fdCiktiOnizlemeAc(...args);request.overlay=node;return node};
 const fdCiktiPdfOnizle=(blob,name,node)=>{check();node=node||fdCiktiOnizlemeAc('pdf',name);request.outputReady=true;request.outputBlob=blob;const result=root.fdCiktiPdfOnizle(blob,name,node);check();return result};
 const showToast=(...args)=>{check();root.showToast?.(...args)};
 const originalConvert=async function(wordBlob,dosyaAdi,baslik,secenek={}){
        const onizle=secenek.onizle!==false,baslikAnahtari=String(baslik||'').toLocaleLowerCase('tr-TR'),resmiIcraDilekcesi=baslikAnahtari.includes('icra')&&baslikAnahtari.includes('dilekçe'),baytlar=new Uint8Array(await wordBlob.arrayBuffer()),pdfMi=baytlar.length>4&&baytlar[0]===0x25&&baytlar[1]===0x50&&baytlar[2]===0x44&&baytlar[3]===0x46;
        if(pdfMi){const pdfBlob=new Blob([baytlar],{type:'application/pdf'});if(onizle)fdCiktiPdfOnizle(pdfBlob,(dosyaAdi||'personel_belgesi.pdf').replace(/\.docx$/i,'.pdf'));return pdfBlob}
        if(!window.docx?.renderAsync||typeof html2canvas!=='function'||!window.jspdf?.jsPDF)throw new Error('PDF hazırlama bileşenleri yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
        const modal=onizle?fdCiktiOnizlemeAc('pdf',dosyaAdi||'personel_belgesi.pdf'):document.createElement('div');
        if(!onizle){modal.style.cssText='position:fixed;left:-100000px;top:0;width:1200px;min-height:1600px;overflow:visible;background:#fff;z-index:-1;';modal.innerHTML='<span data-cikti-ad></span><div data-cikti-icerik></div>';document.body.appendChild(modal)}
        const icerik=modal.querySelector('[data-cikti-icerik]');icerik.innerHTML='';icerik.style.cssText+=';padding:0;overflow:auto;background:#cbd5e1';
        const sahne=document.createElement('div');sahne.className='fd-v149-docx-stage';icerik.appendChild(sahne);
        try{
            await window.docx.renderAsync(wordBlob,sahne,sahne,{inWrapper:true,breakPages:true,ignoreLastRenderedPageBreak:false,renderHeaders:true,renderFooters:true,renderFootnotes:true,ignoreWidth:false,ignoreHeight:false,ignoreFonts:false,useBase64URL:true,experimental:false});
            await document.fonts?.ready;const sayfalar=[...sahne.querySelectorAll('.docx-wrapper > section.docx')];if(!sayfalar.length)throw new Error('Belge sayfaları hazırlanamadı.');
            let pdf=null;const olcek=sayfalar.length>15?1.05:1.2;
            for(let i=0;i<sayfalar.length;i++){
                modal.querySelector('[data-cikti-ad]').textContent=(dosyaAdi||'Personel belgesi')+' · '+(i+1)+' / '+sayfalar.length+' hazırlanıyor';
                const sayfa=sayfalar[i];sayfa.style.boxShadow='none';sayfa.style.overflow='hidden';
                await new Promise(requestAnimationFrame);const canvas=await html2canvas(sayfa,{scale:olcek,backgroundColor:'#fff',useCORS:true,logging:false,scrollX:0,scrollY:0,windowWidth:Math.max(sayfa.scrollWidth,900),windowHeight:Math.max(sayfa.scrollHeight,1100)}),yon=canvas.width>canvas.height?'landscape':'portrait';
                if(!pdf)pdf=new window.jspdf.jsPDF({orientation:yon,unit:'mm',format:'a4',compress:true});else pdf.addPage('a4',yon);
                const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),kenarX=resmiIcraDilekcesi?0:8,ust=resmiIcraDilekcesi?0:9,alt=resmiIcraDilekcesi?0:13,oran=Math.min((pw-kenarX*2)/canvas.width,(ph-ust-alt)/canvas.height),w=canvas.width*oran,h=canvas.height*oran;
                pdf.addImage(canvas.toDataURL('image/jpeg',.88),'JPEG',(pw-w)/2,ust,w,h,undefined,'FAST');await bekle(0);
            }
            if(!resmiIcraDilekcesi)pdfSayfaNumarala(pdf,baslik||'Personel Belgesi');const blob=pdf.output('blob');if(onizle)fdCiktiPdfOnizle(blob,dosyaAdi||'personel_belgesi.pdf',modal);else modal.remove();showToast?.((baslik||'Personel belgesi')+' PDF olarak hazırlandı.');return blob;
        }catch(e){modal.remove();throw e;}
    };
 try{const value=await originalConvert(...request.args);check();return{ok:true,value}}catch(error){return{ok:false,error}}finally{request.args=null;request.hidden?.remove();request.hidden=null;request.stage=null;}
}
return{open:execute,api:{},dispose(){disposed=true;for(const r of [...requests])r.cancel();requests.clear()}};
});
