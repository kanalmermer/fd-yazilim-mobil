
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
    let fdGenelPdfIstegi=null,fdGenelPdfNesli=0;const fdGenelPdfKayitlari=new Set();
    window.fdGenelPdfYetkisi=()=>Boolean(activeUser?.sirketId);
    window.fdGenelPdfKayitli=r=>fdGenelPdfKayitlari.has(r);
    window.fdGenelPdfIptalEt=function(onlyInvalid=false){const r=fdGenelPdfIstegi;if(!onlyInvalid||!r?.current())r?.cancel();if(!onlyInvalid)fdGenelPdfNesli++};
    async function fdGenelPdfCagir(action,args){
        if(!window.fdGenelPdfYetkisi())return;
        const sec=args[action==='table'?3:2]||{},scopeCheck=typeof sec.fdIsCurrent==='function'?sec.fdIsCurrent:null;if(scopeCheck&&!scopeCheck())return;
        const veri=action==='table'?tabloCiktiVerisi(args[0]):null,components=typeof html2canvas==='function'&&Boolean(window.jspdf?.jsPDF),reserve=components&&Boolean(args[0])&&(action!=='table'||Boolean(veri?.satirlar.length));
        if(action==='table'){if(!veri)return alert('PDF için tablo bulunamadı.');if(!veri.satirlar.length)return alert('PDF için gösterilecek kayıt bulunmuyor.');if(!components)return alert('PDF bileşenleri yüklenemedi.')}else{if(!components)return alert('PDF bileşenleri yüklenemedi.');if(!args[0])return alert('PDF için içerik bulunamadı.')}
        window.fdGenelPdfIptalEt();const scope=fdWordBelgeBaglami(),epoch=fdGenelPdfNesli;let observer;
        if(action==='content'&&args[0]&&sec.kopyalama!==false)args[0]=args[0].cloneNode(true);
        const request={action,args,helpers:{bekle,esc,pdfSayfaNumarala,pdfKaynaginiTemizle,pdfKanvasBosMu,tabloCiktiVerisi:()=>veri},scopeCheck,overlay:null,nodes:new Set(),outputReady:false,outputBlob:null,finished:false,cancelled:false,
        contextCurrent(){return !request.cancelled&&fdGenelPdfIstegi===request&&fdGenelPdfKayitlari.has(request)&&epoch===fdGenelPdfNesli&&scope===fdWordBelgeBaglami()&&window.fdGenelPdfYetkisi()&&(!request.scopeCheck||request.scopeCheck())},
        current(){return request.contextCurrent()&&(!request.overlay||(request.overlay.isConnected&&request.overlay===document.getElementById('fdOrtakCiktiOnizleme')&&(!request.outputReady||request.overlay._blob===request.outputBlob)))},
        cancel(){if(request.cancelled)return;request.cancelled=true;request.args=null;request.helpers=null;request.scopeCheck=null;observer?.disconnect();if(request.overlay){if(request.overlay._url)URL.revokeObjectURL(request.overlay._url);request.overlay._blob=null;request.overlay.remove()}for(const node of request.nodes)node.remove();request.nodes.clear();request.overlay=null;request.outputBlob=null;request.onCancel?.();request.onCancel=null;fdGenelPdfKayitlari.delete(request);if(fdGenelPdfIstegi===request)fdGenelPdfIstegi=null}};
        fdGenelPdfIstegi=request;fdGenelPdfKayitlari.add(request);
        if(reserve)request.overlay=fdCiktiOnizlemeAc('pdf',args[action==='table'?2:1]);
        observer=new MutationObserver(()=>{if(!request.current())request.cancel()});observer.observe(document.body,{childList:true});
        try{const result=await FDModules.embedded('genelpdf',[request],this);if(result?.ok===false&&result.error)throw result.error;if(!request.current()||!result?.ok)return;request.finished=result.value instanceof Blob;return result.value}finally{request.args=null;request.helpers=null;if(!request.finished)request.cancel()}
    }
    async function pdfOnizlemeUret(kaynak,dosyaAdi,sec={}){return fdGenelPdfCagir.call(this,'content',[kaynak,dosyaAdi,sec])}

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
    async function tabloPdfOnizle(kaynak,baslik,dosyaAdi,sec={}){return fdGenelPdfCagir.call(this,'table',[kaynak,baslik,dosyaAdi,sec])}    window.fdTabloPdfOnizle=tabloPdfOnizle;
    window.aracTabloDisariAktar=async function(tbodyId,tur,baslik,dosyaAdi,secenek={}){
        const tbody=document.getElementById(tbodyId),veri=tabloCiktiVerisi(secenek.fdTable||tbody?.closest('table'));if(!veri)return;
        if(!veri.satirlar.length)return alert('Aktarılacak filtrelenmiş kayıt bulunmuyor.');
        if(tur!=='excel')return tabloPdfOnizle(veri.tablo,baslik,(dosyaAdi||'Rapor')+'.pdf');
        if(!window.fdExcelCiktiYetkisi())return;
        return window.fdExcelCiktiCagir.call(this,'table',[tbodyId,tur,baslik,dosyaAdi,secenek],veri.tablo,{veri});
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

