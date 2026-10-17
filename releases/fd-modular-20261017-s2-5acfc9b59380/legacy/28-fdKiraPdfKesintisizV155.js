
(function(){
    const bekle=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    function boslukKesimi(canvas,baslangic,hedef,pxMm){
        if(hedef>=canvas.height)return canvas.height;
        const ctx=canvas.getContext('2d',{willReadFrequently:true}),alt=Math.max(baslangic+Math.round(pxMm*95),hedef-Math.round(pxMm*18));let bos=0;
        for(let y=hedef;y>=alt;y--){const satir=ctx.getImageData(0,y,canvas.width,1).data;let dolu=0;for(let x=0;x<canvas.width;x+=4){const i=x*4;if(satir[i+3]>20&&(satir[i]<242||satir[i+1]<242||satir[i+2]<242)){if(++dolu>2)break}}if(dolu<=2){if(++bos>=4)return Math.min(hedef,y+Math.floor(bos/2))}else bos=0}return hedef;
    }
    window.kiraSozlesmeOnizlemeKaydet=async function(){
        const kaynak=document.querySelector('#kiraSozlesmeOnizlemeIcerik .kira-sozlesme-pdf');if(!kaynak)return;if(typeof html2canvas!=='function'||!window.jspdf?.jsPDF)return alert('PDF bileşenleri yüklenemedi. Sayfayı yenileyin.');
        const dosyaAdi=kiraSozlesmeOnizlemeDosyaAdi||'Kira_Sozlesmesi.pdf',modal=fdCiktiOnizlemeAc('pdf',dosyaAdi),sahne=document.createElement('div'),kopya=kaynak.cloneNode(true);
        sahne.id='fdKiraPdfSahneV155';sahne.style.cssText='position:fixed;left:0;top:0;width:180mm;height:auto;margin:0;padding:0;background:#fff;overflow:visible;z-index:2147483000;pointer-events:none';kopya.style.cssText='display:block;position:static;transform:none;float:none;clear:both;width:180mm;min-width:180mm;max-width:180mm;height:auto;margin:0!important;padding:0;box-sizing:border-box;background:#fff;color:#111;font-family:Arial,sans-serif;font-size:9.6pt;line-height:1.36;box-shadow:none!important;overflow:visible';kopya.querySelectorAll('*').forEach(el=>{el.style.transform='none';el.style.maxWidth='100%'});sahne.appendChild(kopya);document.body.appendChild(sahne);
        try{
            await document.fonts?.ready;await new Promise(requestAnimationFrame);await bekle(80);const kaynakEn=Math.ceil(kopya.scrollWidth),kaynakBoy=Math.ceil(kopya.scrollHeight),canvas=await html2canvas(kopya,{scale:1.75,useCORS:true,backgroundColor:'#fff',logging:false,scrollX:0,scrollY:0,width:kaynakEn,height:kaynakBoy,windowWidth:Math.max(kaynakEn,900),windowHeight:Math.max(kaynakBoy,1200)});
            const pdf=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true}),sayfaEn=pdf.internal.pageSize.getWidth(),sayfaBoy=pdf.internal.pageSize.getHeight(),sol=15,ust=14,alt=17,icerikEn=180,pxMm=canvas.width/icerikEn,hedefPx=Math.floor((sayfaBoy-ust-alt)*pxMm);let baslangic=0,sayfa=0;
            while(baslangic<canvas.height){const hedef=Math.min(canvas.height,baslangic+hedefPx),bitis=boslukKesimi(canvas,baslangic,hedef,pxMm),parcaBoy=Math.max(1,bitis-baslangic),parca=document.createElement('canvas');parca.width=canvas.width;parca.height=parcaBoy;parca.getContext('2d').drawImage(canvas,0,baslangic,canvas.width,parcaBoy,0,0,canvas.width,parcaBoy);if(sayfa++>0)pdf.addPage('a4','portrait');pdf.addImage(parca.toDataURL('image/jpeg',.95),'JPEG',sol,ust,icerikEn,parcaBoy/pxMm,undefined,'FAST');baslangic=bitis}
            const toplam=pdf.internal.getNumberOfPages();for(let i=1;i<=toplam;i++){pdf.setPage(i);pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.setTextColor(100,116,139);pdf.text('Sayfa '+i+' / '+toplam,sayfaEn-sol,sayfaBoy-6,{align:'right'})}const blob=pdf.output('blob');fdCiktiPdfOnizle(blob,dosyaAdi,modal);return blob;
        }catch(error){modal.remove();console.error('Kira sözleşmesi PDF:',error);alert('Kira sözleşmesi PDF hazırlanamadı: '+(error?.message||error))}finally{sahne.remove()}
    };
})();

