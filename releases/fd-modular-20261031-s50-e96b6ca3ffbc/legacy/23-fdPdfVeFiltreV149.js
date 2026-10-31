
(function(){
    const bekle=ms=>new Promise(r=>setTimeout(r,ms));
    const esc=v=>typeof escapeDashboardText==='function'?escapeDashboardText(String(v??'')):String(v??'').replace(/[&<>\"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[s]));
    function pdfSayfaNumarala(pdf,etiket=''){
        const adet=pdf.internal.getNumberOfPages();
        for(let i=1;i<=adet;i++){
            pdf.setPage(i);const w=pdf.internal.pageSize.getWidth(),h=pdf.internal.pageSize.getHeight();
            pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.setTextColor(100,116,139);
            if(etiket)pdf.text(String(etiket),10,h-6);
            pdf.text('Sayfa '+i+' / '+adet,w-10,h-6,{align:'right'});
        }
    }
    function pdfKaynaginiTemizle(kopya){
        kopya.querySelectorAll('input,select,textarea').forEach(alan=>{
            let deger='';
            if(alan.tagName==='SELECT')deger=[...(alan.selectedOptions||[])].map(x=>x.textContent?.trim()).filter(Boolean).join(', ');
            else if(alan.type==='checkbox'||alan.type==='radio')deger=alan.checked?'Evet':'Hayır';
            else deger=alan.value||alan.getAttribute('value')||'';
            const metin=kopya.ownerDocument.createElement('span');metin.className='fd-pdf-form-degeri';metin.textContent=String(deger||'-');
            alan.replaceWith(metin);
        });
        kopya.querySelectorAll('[data-html2canvas-ignore],button,.action-btns').forEach(x=>x.remove());
        kopya.querySelectorAll('[contenteditable]').forEach(x=>x.removeAttribute('contenteditable'));
        kopya.querySelectorAll('.table-wrapper').forEach(x=>{x.style.overflow='visible';x.style.maxHeight='none';x.style.height='auto'});
        kopya.querySelectorAll('table').forEach(t=>{t.style.width='100%';t.style.maxWidth='100%';t.style.tableLayout='auto';t.style.borderCollapse='collapse'});
        kopya.querySelectorAll('tr').forEach(x=>{x.style.breakInside='avoid';x.style.pageBreakInside='avoid'});
        return kopya;
    }
    async function pdfOnizlemeUret(kaynak,dosyaAdi,sec={}){
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
    }
    window.fdPdfOnizlemeUret=pdfOnizlemeUret;

    function tabloHucreMetni(hucre){
        if(!hucre)return '';
        const alanlar=[...(hucre.querySelectorAll?.('input,select,textarea')||[])];
        const alanMetinleri=alanlar.map(alan=>{
            if(alan.tagName==='SELECT')return[...(alan.selectedOptions||[])].map(x=>x.textContent?.trim()).filter(Boolean).join(', ');
            if(alan.type==='checkbox'||alan.type==='radio')return alan.checked?'Evet':'Hayır';
            return alan.value||alan.getAttribute('value')||'';
        }).filter(Boolean);
        const metin=alanMetinleri.length?alanMetinleri.join(' · '):hucre.innerText;
        return String(metin||'').replace(/\s+/g,' ').trim();
    }
    function tabloSatirlariniMatriseCevir(satirlar,baslikMi=false){
        const matris=[];
        [...satirlar].forEach((tr,satirNo)=>{
            matris[satirNo]||=[];let sutunNo=0;
            [...tr.cells].forEach(hucre=>{
                while(matris[satirNo][sutunNo]!==undefined)sutunNo++;
                const metin=tabloHucreMetni(hucre),colspan=Math.max(1,Number(hucre.colSpan||1)),rowspan=Math.max(1,Number(hucre.rowSpan||1));
                for(let dr=0;dr<rowspan;dr++){
                    matris[satirNo+dr]||=[];
                    for(let dc=0;dc<colspan;dc++)matris[satirNo+dr][sutunNo+dc]=(baslikMi||dr>0||dc===0)?metin:'';
                }
                sutunNo+=colspan;
            });
        });
        return matris;
    }
    function tabloCiktiVerisi(kaynak){
        const tablo=kaynak?.matches?.('table')?kaynak:kaynak?.querySelector?.('table');if(!tablo)return null;
        const tumGovdeSatirlari=[...tablo.tBodies].flatMap(t=>[...t.rows]),baslikMatrisi=tabloSatirlariniMatriseCevir(tablo.tHead?.rows||[],true),kolonAdedi=Math.max(0,...baslikMatrisi.map(r=>r.length),...tumGovdeSatirlari.map(r=>[...r.cells].reduce((n,c)=>n+Math.max(1,Number(c.colSpan||1)),0)));
        const kullanilan=Array.from({length:kolonAdedi},(_,i)=>{
            const parcalar=baslikMatrisi.map(r=>String(r[i]||'').trim()).filter((v,n,a)=>v&&a.indexOf(v)===n),ad=parcalar.join(' / ')||('Sütun '+(i+1));return{i,ad};
        }).filter(x=>!/^işlem(?:ler)?(?:\s*\/.*)?$/i.test(x.ad.toLocaleLowerCase('tr-TR')));
        const govdeMatrisi=tabloSatirlariniMatriseCevir(tumGovdeSatirlari),satirlar=govdeMatrisi.filter((r,index)=>{
            const tr=tumGovdeSatirlari[index],tekGenisHucre=tr?.cells?.length===1&&Number(tr.cells[0].colSpan||1)>=kolonAdedi;return !tekGenisHucre&&r.some(v=>String(v||'').trim());
        }).map(r=>kullanilan.map(x=>String(r[x.i]??'')));
        const toplamlar=tabloSatirlariniMatriseCevir(tablo.tFoot?.rows||[]).map(r=>kullanilan.map(x=>String(r[x.i]??'')));
        return{tablo,kolonlar:kullanilan.map(x=>x.ad),satirlar,toplamlar};
    }
    function pdfKanvasBosMu(canvas){
        if(!canvas||canvas.width<2||canvas.height<2)return true;
        try{
            const ctx=canvas.getContext('2d'),adim=Math.max(1,Math.floor(Math.sqrt((canvas.width*canvas.height)/25000))),veri=ctx.getImageData(0,0,canvas.width,canvas.height).data;
            for(let y=0;y<canvas.height;y+=adim)for(let x=0;x<canvas.width;x+=adim){const i=(y*canvas.width+x)*4;if(veri[i+3]>10&&(veri[i]<245||veri[i+1]<245||veri[i+2]<245))return false;}
            return true;
        }catch(_){return false;}
    }
    async function tabloPdfOnizle(kaynak,baslik,dosyaAdi,sec={}){
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
    }    window.fdTabloPdfOnizle=tabloPdfOnizle;
    window.aracTabloDisariAktar=async function(tbodyId,tur,baslik,dosyaAdi,secenek={}){
        const tbody=document.getElementById(tbodyId),veri=tabloCiktiVerisi(secenek.fdTable||tbody?.closest('table'));if(!veri)return;
        if(!veri.satirlar.length)return alert('Aktarılacak filtrelenmiş kayıt bulunmuyor.');
        if(tur==='excel'){const ws=XLSX.utils.aoa_to_sheet([veri.kolonlar,...veri.satirlar,...veri.toplamlar]);ws['!cols']=veri.kolonlar.map((a,i)=>({wch:Math.min(36,Math.max(14,a.length+4,...veri.satirlar.map(s=>String(s[i]||'').length+2)))}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Liste');XLSX.writeFile(wb,(dosyaAdi||'Rapor')+'.xlsx');return;}
        return tabloPdfOnizle(veri.tablo,baslik,(dosyaAdi||'Rapor')+'.pdf');
    };

    /* Private advance history PDF adapter moved to modules/avans. */

    let fdPersonelPdfIstegi=null,fdPersonelPdfNesli=0;const fdPersonelPdfKayitlari=new Set();
    window.fdPersonelPdfYetkisi=()=>Boolean(activeUser?.sirketId)&&anaMenuModulErisimiVar('personel');
    window.fdPersonelPdfKayitli=r=>fdPersonelPdfKayitlari.has(r);
    window.fdPersonelPdfIptalEt=function(onlyInvalid=false){const r=fdPersonelPdfIstegi;if(!onlyInvalid||!r?.current())r?.cancel();if(!onlyInvalid)fdPersonelPdfNesli++};
    window.personelBelgePdfOnizlemeAc=async function(wordBlob,dosyaAdi,baslik,secenek={}){
        if(!window.fdPersonelPdfYetkisi())throw Error('Bu belgeyi görüntüleme yetkiniz yok.');
        window.fdPersonelPdfIptalEt();const scope=fdWordBelgeBaglami(),epoch=fdPersonelPdfNesli,detail=document.getElementById('modalPersonelDetay'),body=detail?.style.display==='flex'?document.getElementById('detayModalBody'):null,node=body?.firstElementChild||null,word=document.getElementById('modalPersonelBelge'),area=word?.style.display==='flex'?document.getElementById('personelBelgeOnizleme'):null,ownerBlob=area?personelBelgeOnizlemeBlobu:null;let observer;
        const request={args:[wordBlob,dosyaAdi,baslik,secenek],helpers:{bekle,pdfSayfaNumarala},overlay:null,hidden:null,stage:null,outputReady:false,outputBlob:null,finished:false,cancelled:false,
        current(){return !request.cancelled&&fdPersonelPdfIstegi===request&&fdPersonelPdfKayitlari.has(request)&&epoch===fdPersonelPdfNesli&&scope===fdWordBelgeBaglami()&&window.fdPersonelPdfYetkisi()&&(!node||(detail.style.display==='flex'&&node.isConnected&&body.firstElementChild===node))&&(!area||(word.style.display==='flex'&&area===document.getElementById('personelBelgeOnizleme')&&!area.dataset.fdAnnualOwner&&personelBelgeOnizlemeBlobu===ownerBlob))&&(!request.overlay||(request.overlay.isConnected&&request.overlay===document.getElementById('fdOrtakCiktiOnizleme')&&(!request.outputReady||request.overlay._blob===request.outputBlob)))&&(!request.stage||request.outputReady||!request.overlay||request.overlay.contains(request.stage))},
        cancel(remove=true){if(request.cancelled)return;request.cancelled=true;request.args=null;request.helpers=null;observer?.disconnect();request.stage?.replaceChildren();request.stage=null;request.hidden?.remove();request.hidden=null;if(remove&&request.overlay){if(request.overlay._url)URL.revokeObjectURL(request.overlay._url);request.overlay._blob=null;request.overlay.remove()}request.overlay=null;request.outputBlob=null;request.onCancel?.();request.onCancel=null;fdPersonelPdfKayitlari.delete(request);if(fdPersonelPdfIstegi===request)fdPersonelPdfIstegi=null}};
        fdPersonelPdfIstegi=request;fdPersonelPdfKayitlari.add(request);observer=new MutationObserver(()=>{if(!request.current())request.cancel()});observer.observe(document.body,{childList:true});if(node){observer.observe(detail,{attributes:true,attributeFilter:['style']});observer.observe(body,{childList:true,subtree:true})}if(area){observer.observe(word,{attributes:true,attributeFilter:['style']});observer.observe(area,{attributes:true,attributeFilter:['data-fd-annual-owner'],childList:true})}
        try{const result=await FDModules.embedded('belgepdf',[request],this);if(result?.ok===false&&result.error)throw result.error;if(!request.current())throw Error('Ekran veya oturum değişti; PDF işlemini yeniden başlatın.');if(!result?.ok)throw result?.error||Error('PDF modülü yüklenemedi; işlemi yeniden başlatın.');request.finished=true;return result.value}finally{request.args=null;request.helpers=null;if(!request.finished||secenek.onizle===false)request.cancel()}
    };

    function filtreleriTemizle(anahtar){
        const kok=typeof ANA_MENU_MODUL_KOKLERI!=='undefined'?ANA_MENU_MODUL_KOKLERI?.[anahtar]:'',alan=kok?document.querySelector(kok):null;if(!alan)return;
        alan.querySelectorAll('input,select,textarea').forEach(el=>{
            const bilgi=[el.id,el.name,el.className,el.placeholder].join(' ').toLocaleLowerCase('tr-TR'),arama=el.type==='search'||/arama|ara\.\.\.|filtre/.test(bilgi),filtreSecim=el.tagName==='SELECT'&&/filtre/.test(bilgi);if(!arama&&!filtreSecim)return;
            if(el.tagName==='SELECT')el.selectedIndex=0;else if(!['date','month','number'].includes(el.type))el.value='';
        });
    }
    window.fdModulFiltreleriniTemizle=filtreleriTemizle;
    const sekmeKapatEski=window.fdUygulamaSekmesiniKapat;
    window.fdUygulamaSekmesiniKapat=function(e,anahtar){return sekmeKapatEski.apply(this,arguments)};
})();

