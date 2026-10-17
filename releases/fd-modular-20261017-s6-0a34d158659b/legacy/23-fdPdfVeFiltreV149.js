
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
            await document.fonts?.ready;await new Promise(requestAnimationFrame);await bekle(80);let pdf=null;const sayfalar=[...sahne.children];
            for(let i=0;i<sayfalar.length;i++){
                modal.querySelector('[data-cikti-ad]').textContent=dosyaAdi+' · '+(i+1)+' / '+sayfalar.length+' hazırlanıyor';
                icerik.scrollLeft=0;const sayfa=sayfalar[i],canvas=await html2canvas(sayfa,{scale:sec.scale||1.45,useCORS:true,backgroundColor:'#fff',logging:false,scrollX:0,scrollY:0,width:sayfa.scrollWidth,height:sayfa.scrollHeight,windowWidth:Math.max(sayfa.scrollWidth,1100),windowHeight:Math.max(sayfa.scrollHeight,800)});
                if(pdfKanvasBosMu(canvas))throw new Error((i+1)+'. PDF sayfası boş oluştu; çıktı kaydedilmedi.');
                if(!pdf)pdf=new window.jspdf.jsPDF({orientation:yon,unit:'mm',format,compress:true});else pdf.addPage(format,yon);
                const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),kenarX=7,ust=7,alt=14,oran=Math.min((pw-kenarX*2)/canvas.width,(ph-ust-alt)/canvas.height),w=canvas.width*oran,h=canvas.height*oran;
                pdf.addImage(canvas.toDataURL('image/jpeg',.91),'JPEG',(pw-w)/2,ust,w,h,undefined,'FAST');await bekle(0);
            }
            pdfSayfaNumarala(pdf,sec.altBaslik||baslik);const blob=pdf.output('blob');fdCiktiPdfOnizle(blob,dosyaAdi,modal);return blob;
        }catch(e){modal.remove();console.error(e);alert('PDF hazırlanamadı: '+(e.message||e));}
    }    window.fdTabloPdfOnizle=tabloPdfOnizle;
    window.aracTabloDisariAktar=async function(tbodyId,tur,baslik,dosyaAdi){
        const tbody=document.getElementById(tbodyId),veri=tabloCiktiVerisi(tbody?.closest('table'));if(!veri)return;
        if(!veri.satirlar.length)return alert('Aktarılacak filtrelenmiş kayıt bulunmuyor.');
        if(tur==='excel'){const ws=XLSX.utils.aoa_to_sheet([veri.kolonlar,...veri.satirlar,...veri.toplamlar]);ws['!cols']=veri.kolonlar.map((a,i)=>({wch:Math.min(36,Math.max(14,a.length+4,...veri.satirlar.map(s=>String(s[i]||'').length+2)))}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Liste');XLSX.writeFile(wb,(dosyaAdi||'Rapor')+'.xlsx');return;}
        return tabloPdfOnizle(veri.tablo,baslik,(dosyaAdi||'Rapor')+'.pdf');
    };

    window.avansGecmisPdfIndir=function(){const tablo=document.querySelector('#avansGecmisRaporu table');return tabloPdfOnizle(tablo,document.getElementById('avansGecmisBaslik')?.textContent||'Avans Geçmişi','Avans_Gecmisi_'+avansGecmisYili+'.pdf',{yon:'landscape',altBaslik:'Avans Geçmişi'});};

    window.personelBelgePdfOnizlemeAc=async function(wordBlob,dosyaAdi,baslik,secenek={}){
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

