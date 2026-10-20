
(function(){
    const bekle=ms=>new Promise(r=>setTimeout(r,ms));
    window.vardiyaPdfAl=async function(){
        const kayit=vardiyaAktifKayit(false),kaynak=document.getElementById('vardiyaCiktiAlani');if(!kayit||!kaynak)return;
        if(typeof html2canvas!=='function'||!window.jspdf?.jsPDF)return alert('PDF bileşenleri yüklenemedi.');
        const dosyaAdi='Vardiya_'+kayit.haftaBaslangic+'_'+kayit.sube+'.pdf',modal=fdCiktiOnizlemeAc('pdf',dosyaAdi),icerik=modal.querySelector('[data-cikti-icerik]');
        icerik.innerHTML='';icerik.style.cssText+=';padding:18px;overflow:auto;background:#cbd5e1';
        const sahne=document.createElement('div'),kopya=kaynak.cloneNode(true);sahne.style.cssText='width:900px;max-width:none;height:auto;max-height:none;overflow:visible;margin:0 auto;padding:0;background:#fff;box-sizing:border-box';
        kopya.querySelectorAll('button,[data-html2canvas-ignore],.vardiya-satir-kontrolleri').forEach(x=>x.remove());kopya.querySelectorAll('[contenteditable]').forEach(x=>x.removeAttribute('contenteditable'));kopya.style.cssText='width:900px;max-width:none;height:auto;max-height:none;overflow:visible;margin:0;padding:12px;background:#fff;box-sizing:border-box';kopya.querySelectorAll('.vardiya-board,.table-wrapper').forEach(x=>{x.style.height='auto';x.style.maxHeight='none';x.style.overflow='visible'});sahne.appendChild(kopya);icerik.appendChild(sahne);
        try{await document.fonts?.ready;await new Promise(requestAnimationFrame);await bekle(70);const canvas=await html2canvas(kopya,{scale:1.55,useCORS:true,backgroundColor:'#fff',logging:false,scrollX:0,scrollY:0,width:kopya.scrollWidth,height:kopya.scrollHeight,windowWidth:Math.max(kopya.scrollWidth,1000),windowHeight:Math.max(kopya.scrollHeight,1000)}),pdf=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true}),pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),kenarX=8,ust=9,alt=14,oran=Math.min((pw-kenarX*2)/canvas.width,(ph-ust-alt)/canvas.height),w=canvas.width*oran,h=canvas.height*oran;pdf.addImage(canvas.toDataURL('image/jpeg',.94),'JPEG',(pw-w)/2,ust,w,h,undefined,'FAST');pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.setTextColor(100,116,139);pdf.text('Personel Vardiya Listesi',kenarX,ph-6);pdf.text('Sayfa 1 / 1',pw-kenarX,ph-6,{align:'right'});const blob=pdf.output('blob');fdCiktiPdfOnizle(blob,dosyaAdi,modal);return blob}catch(e){modal.remove();console.error(e);alert('Vardiya PDF hazırlanamadı: '+(e.message||e))}
    };
    function filtreleriKesinTemizle(anahtar){
        const secici=typeof ANA_MENU_MODUL_KOKLERI!=='undefined'?ANA_MENU_MODUL_KOKLERI?.[anahtar]:'';if(!secici)return;
        document.querySelectorAll(secici).forEach(kok=>kok.querySelectorAll('input,select,textarea').forEach(el=>{const bilgi=[el.id,el.name,el.className,el.placeholder].join(' ').toLocaleLowerCase('tr-TR'),filtreMi=el.type==='search'||/arama|ara\.\.\.|filtre/.test(bilgi);if(!filtreMi)return;if(el.tagName==='SELECT')el.selectedIndex=0;else if(!['date','month','number'].includes(el.type))el.value=''}));
    }
    window.fdModulFiltreleriniKesinTemizle=filtreleriKesinTemizle;document.addEventListener('click',function(e){const kapat=e.target?.closest?.('.fd-app-tab-close');if(!kapat)return;const anahtar=kapat.closest('.fd-app-tab')?.dataset?.fdTab;if(!anahtar)return;filtreleriKesinTemizle(anahtar)},true);
})();

