window.FDModules.define('genelpdf',function(){
const root=window,initial=fdWordBelgeBaglami(),requests=new Set();let disposed=false;
const valid=r=>!disposed&&initial===fdWordBelgeBaglami()&&root.fdGenelPdfKayitli(r)&&r?.current();
async function execute(request){
 if(!valid(request)||!request.args||!request.helpers)return false;requests.add(request);request.onCancel=()=>requests.delete(request);
 const check=()=>{if(!valid(request))throw Error('PDF çıktı ekranı değişti.')};
 const checked=async value=>{check();const result=await value;check();return result};
 const h=request.helpers,nativeCanvas=root.html2canvas;
 const window={jspdf:root.jspdf};
 const html2canvas=typeof nativeCanvas==='function'?async(...args)=>{check();return checked(nativeCanvas(...args))}:nativeCanvas;
 const bekle=ms=>checked(h.bekle(ms)),esc=h.esc,pdfSayfaNumarala=(...args)=>{check();return h.pdfSayfaNumarala(...args)},pdfKaynaginiTemizle=(...args)=>{check();return h.pdfKaynaginiTemizle(...args)},pdfKanvasBosMu=(...args)=>{check();return h.pdfKanvasBosMu(...args)},tabloCiktiVerisi=(...args)=>{check();return h.tabloCiktiVerisi(...args)};
 const document={get fonts(){return root.document.fonts?{get ready(){return checked(root.document.fonts.ready)}}:undefined},body:root.document.body,createElement:(...args)=>{check();const node=root.document.createElement(...args);request.nodes.add(node);return node}};
 const fdCiktiOnizlemeAc=(...args)=>{check();if(request.overlay)return request.overlay;const node=root.fdCiktiOnizlemeAc(...args);request.overlay=node;return node};
 const fdCiktiPdfOnizle=(blob,name,node)=>{check();request.outputReady=true;request.outputBlob=blob;const result=root.fdCiktiPdfOnizle(blob,name,node);check();return result};
 const alert=(...args)=>{if(request.contextCurrent())return root.alert(...args)},console={error:(...args)=>{if(request.contextCurrent())root.console.error(...args)}};
 const originalContent=async function pdfOnizlemeUret(kaynak,dosyaAdi,sec={}){
        if(typeof html2canvas!=='function'||!window.jspdf?.jsPDF)return alert('PDF bileşenleri yüklenemedi.');
        if(!kaynak)return alert('PDF için içerik bulunamadı.');
        const yon=sec.yon||'landscape',format=sec.format||'a4',genislik=sec.genislik||((format==='a3'&&yon==='landscape')?'400mm':(yon==='landscape'?'277mm':'190mm')),modal=fdCiktiOnizlemeAc('pdf',dosyaAdi),icerik=modal.querySelector('[data-cikti-icerik]');
        icerik.innerHTML='';icerik.style.cssText+=';padding:16px;overflow:auto;background:#cbd5e1';
        const sahne=document.createElement('div');sahne.className='fd-v149-pdf-stage';sahne.style.width=genislik;
        const kopya=sec.kopyalama===false?kaynak:pdfKaynaginiTemizle(kaynak.cloneNode(true));
        if(sec.baslik){const ust=document.createElement('div');ust.innerHTML='<h2 style="margin:0 0 4px;font-size:18px">'+esc(sec.baslik)+'</h2><p style="margin:0 0 11px;color:#64748b;font-size:10px">Rapor Tarihi: '+new Date().toLocaleDateString('tr-TR')+'</p>';sahne.appendChild(ust)}
        sahne.appendChild(kopya);
        const olcumAlani=document.createElement('div');olcumAlani.style.cssText='position:absolute;left:0;top:0;z-index:2147483000;width:'+genislik+';max-height:none;overflow:visible;background:#fff;pointer-events:none;';olcumAlani.appendChild(sahne);document.body.appendChild(olcumAlani);
        try{
            await document.fonts?.ready;await new Promise(requestAnimationFrame);await bekle(80);
            if(!String(sahne.innerText||'').trim()&&!sahne.querySelector('img,canvas,svg,table'))throw new Error('PDF içeriği boş; çıktı oluşturulmadı.');
            const canvas=await html2canvas(sahne,{scale:sec.scale||1.65,useCORS:true,backgroundColor:'#fff',logging:false,scrollX:0,scrollY:0,width:sahne.scrollWidth,height:sahne.scrollHeight,windowWidth:Math.max(sahne.scrollWidth,1100),windowHeight:Math.max(sahne.scrollHeight,800)});
            if(pdfKanvasBosMu(canvas))throw new Error('PDF görüntüsü boş oluştu; çıktı kaydedilmedi.');
            const pdf=new window.jspdf.jsPDF({unit:'mm',format,orientation:yon,compress:true}),pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),kenarX=10,ust=10,alt=15,kullanilabilirW=pw-kenarX*2,kullanilabilirH=ph-ust-alt,kaynakParcaYuksekligi=Math.max(1,Math.floor(canvas.width*kullanilabilirH/kullanilabilirW));
            let baslangicY=0,sayfaNo=0;
            while(baslangicY<canvas.height){
                const parcaYuksekligi=Math.min(kaynakParcaYuksekligi,canvas.height-baslangicY),parca=document.createElement('canvas');parca.width=canvas.width;parca.height=parcaYuksekligi;parca.getContext('2d').drawImage(canvas,0,baslangicY,canvas.width,parcaYuksekligi,0,0,canvas.width,parcaYuksekligi);if(sayfaNo++)pdf.addPage(format,yon);const h=kullanilabilirW*parcaYuksekligi/canvas.width;pdf.addImage(parca.toDataURL('image/jpeg',.91),'JPEG',kenarX,ust,kullanilabilirW,h,undefined,'FAST');baslangicY+=parcaYuksekligi;await bekle(0);
            }
            if(pdf.internal.getNumberOfPages()<1)throw new Error('PDF sayfası oluşturulamadı.');pdfSayfaNumarala(pdf,sec.altBaslik||'FD YAZILIM');const blob=pdf.output('blob');if(!blob||blob.size<1000)throw new Error('PDF dosyası boş oluştu.');fdCiktiPdfOnizle(blob,dosyaAdi,modal);return blob;
        }catch(e){modal.remove();console.error(e);alert('PDF hazırlanamadı: '+(e.message||e));}
        finally{if(modal.isConnected)icerik.appendChild(sahne);olcumAlani.remove();}
    };
 const originalTable=async function tabloPdfOnizle(kaynak,baslik,dosyaAdi,sec={}){
const fdScopedPdfCurrent=()=>typeof sec.fdIsCurrent!=='function'||sec.fdIsCurrent();
async function fdScopedPdfAwait(value){if(!fdScopedPdfCurrent())throw Error('PDF oturumu değişti.');const result=await value;if(!fdScopedPdfCurrent())throw Error('PDF oturumu değişti.');return result}
if(!fdScopedPdfCurrent())return;

        const veri=tabloCiktiVerisi(kaynak);if(!veri)return alert('PDF için tablo bulunamadı.');if(!veri.satirlar.length)return alert('PDF için gösterilecek kayıt bulunmuyor.');
        if(typeof html2canvas!=='function'||!window.jspdf?.jsPDF)return alert('PDF bileşenleri yüklenemedi.');
        const kolon=veri.kolonlar.length,buyuk=kolon>8,format=sec.format||(buyuk?'a3':'a4'),yon=sec.yon||'landscape',genislik=sec.genislik||((format==='a3'&&yon==='landscape')?'400mm':(yon==='landscape'?'277mm':'190mm')),font=sec.font||(kolon>12?'6.6px':(kolon>8?'7.4px':'8.7px')),pad=kolon>12?'3px 2px':(kolon>8?'4px':'5px'),ilkGenislik=sec.ilkKolonGenislik||(kolon>10?'16%':'auto'),satirSayisi=Number(sec.satirSayisi)||(format==='a3'?(kolon>12?34:38):(yon==='portrait'?27:(kolon>8?27:32))),tamBaslik=baslik+(sec.donem?' · '+sec.donem:''),parcalar=[];
        for(let i=0;i<veri.satirlar.length;i+=satirSayisi)parcalar.push(veri.satirlar.slice(i,i+satirSayisi));
        const modal=fdCiktiOnizlemeAc('pdf',dosyaAdi),icerik=modal.querySelector('[data-cikti-icerik]');icerik.innerHTML='';icerik.style.cssText+=';padding:16px;overflow:auto;background:#cbd5e1';
        const sahne=document.createElement('div');sahne.style.cssText='display:grid;gap:16px;justify-content:center;width:max-content;min-width:100%;';
        const hucre='position:static!important;left:auto!important;right:auto!important;top:auto!important;transform:none!important;padding:'+pad+';border:1px solid #cbd5e1;white-space:normal;vertical-align:middle;text-align:right;overflow-wrap:anywhere;',ilk='text-align:left;width:'+ilkGenislik+';';
        parcalar.forEach((satirlar,sayfaNo)=>{const son=sayfaNo===parcalar.length-1,sayfa=document.createElement('section');sayfa.className='fd-v149-table-pdf-page';sayfa.style.cssText='position:relative;overflow:hidden;width:'+genislik+';box-sizing:border-box;padding:7mm;background:#fff;color:#0f172a;font-family:Arial,sans-serif;';sayfa.innerHTML='<h2 style="display:block!important;position:static!important;margin:0 0 3px;font-size:18px">'+esc(tamBaslik)+'</h2><p style="display:block!important;position:static!important;margin:0 0 9px;color:#64748b;font-size:10px">Rapor Tarihi: '+new Date().toLocaleDateString('tr-TR')+' · '+(sayfaNo+1)+' / '+parcalar.length+'</p><table style="position:static!important;width:100%;border-collapse:collapse;font-size:'+font+';table-layout:'+(buyuk?'fixed':'auto')+'"><thead><tr>'+veri.kolonlar.map((v,i)=>'<th style="'+hucre+'background:#0f766e;color:#fff;font-weight:800;'+(i===0?ilk:'')+'">'+esc(v)+'</th>').join('')+'</tr></thead><tbody>'+satirlar.map(s=>'<tr>'+s.map((v,i)=>'<td style="'+hucre+'font-weight:400;'+(i===0?ilk:'')+'">'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody>'+(son&&veri.toplamlar.length?'<tfoot>'+veri.toplamlar.map(s=>'<tr>'+s.map((v,i)=>'<th style="'+hucre+'background:#d1fae5;color:#14532d;font-weight:800;'+(i===0?ilk:'')+'">'+esc(v)+'</th>').join('')+'</tr>').join('')+'</tfoot>':'')+'</table>';sahne.appendChild(sayfa)});
        icerik.appendChild(sahne);
        try{
            await fdScopedPdfAwait(document.fonts?.ready);await fdScopedPdfAwait(new Promise(requestAnimationFrame));await fdScopedPdfAwait(bekle(80));let pdf=null;const sayfalar=[...sahne.children];
            for(let i=0;i<sayfalar.length;i++){
                modal.querySelector('[data-cikti-ad]').textContent=dosyaAdi+' · '+(i+1)+' / '+sayfalar.length+' hazırlanıyor';
                icerik.scrollLeft=0;const sayfa=sayfalar[i],canvas=await fdScopedPdfAwait(html2canvas(sayfa,{scale:sec.scale||1.45,useCORS:true,backgroundColor:'#fff',logging:false,scrollX:0,scrollY:0,width:sayfa.scrollWidth,height:sayfa.scrollHeight,windowWidth:Math.max(sayfa.scrollWidth,1100),windowHeight:Math.max(sayfa.scrollHeight,800)}));
                if(pdfKanvasBosMu(canvas))throw new Error((i+1)+'. PDF sayfası boş oluştu; çıktı kaydedilmedi.');
                if(!pdf)pdf=new window.jspdf.jsPDF({orientation:yon,unit:'mm',format,compress:true});else pdf.addPage(format,yon);
                const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),kenarX=7,ust=7,alt=14,oran=Math.min((pw-kenarX*2)/canvas.width,(ph-ust-alt)/canvas.height),w=canvas.width*oran,h=canvas.height*oran;
                pdf.addImage(canvas.toDataURL('image/jpeg',.91),'JPEG',(pw-w)/2,ust,w,h,undefined,'FAST');await fdScopedPdfAwait(bekle(0));
            }
            pdfSayfaNumarala(pdf,sec.altBaslik||baslik);const blob=pdf.output('blob');fdCiktiPdfOnizle(blob,dosyaAdi,modal);return blob;
        }catch(e){if(!fdScopedPdfCurrent()){if(modal._url)URL.revokeObjectURL(modal._url);modal._blob=null;modal.remove();return;}modal.remove();console.error(e);alert('PDF hazırlanamadı: '+(e.message||e));}
    };
 try{const value=await(request.action==='table'?originalTable:originalContent)(...request.args);return{ok:true,value}}catch(error){return{ok:false,error}}finally{request.args=null;request.helpers=null;}
}
return{open:execute,api:{},dispose(){disposed=true;for(const r of [...requests])r.cancel();requests.clear()}};
});
