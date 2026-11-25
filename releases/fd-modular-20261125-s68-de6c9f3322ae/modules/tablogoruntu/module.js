window.FDModules.define('tablogoruntu',function(){
const root=window,initial=fdWordBelgeBaglami(),requests=new Set();let disposed=false;
const valid=r=>!disposed&&initial===fdWordBelgeBaglami()&&root.fdTabloGoruntuKayitli(r)&&r?.current();
async function execute(request){
 if(!valid(request)||!request.args)return false;requests.add(request);request.onCancel=()=>requests.delete(request);
 const check=()=>{if(!valid(request))throw Error('Tablo görüntüsü oturumu değişti.')};
 const checked=async value=>{check();const result=await value;check();return result};
 try{await request.queue;check()}catch(error){return{ok:false,error}}
 const args=request.args,nativeCanvas=root.html2canvas;
 const window={jspdf:root.jspdf,jsPDF:root.jsPDF,ClipboardItem:root.ClipboardItem},ClipboardItem=root.ClipboardItem;
 const html2canvas=typeof nativeCanvas==='function'?async(...a)=>{check();return checked(nativeCanvas(...a))}:nativeCanvas;
 const document={getElementById:(...a)=>{check();return root.document.getElementById(...a)},createElement:(...a)=>{check();return root.document.createElement(...a)}};
 const getComputedStyle=(...a)=>{check();return root.getComputedStyle(...a)};
 const showGlobalOverlay=(...a)=>request.show(...a),hideGlobalOverlay=()=>request.hide(),setTimeout=(fn,ms)=>request.later(fn,ms);
 const navigator={clipboard:root.navigator.clipboard?{write:a=>{check();return checked(root.navigator.clipboard.write(a))}}:undefined};
 const fdCiktiPdfOnizle=(blob,name)=>{check();const node=root.fdCiktiPdfOnizle(blob,name);request.output=node;request.outputBlob=blob;check();return node};
 const alert=(...a)=>{if(request.contextCurrent())return root.alert(...a)},console={warn:(...a)=>{if(request.contextCurrent())root.console.warn(...a)},error:(...a)=>{if(request.contextCurrent())root.console.error(...a)}};
 const originalCanvas=async function puantajCanvasOlustur(table, scale = 2, baslik = '') {
        try {
            if (typeof html2canvas === 'function') {
                const sabitler=[...table.querySelectorAll('thead,thead tr,thead th')],oncekiStiller=sabitler.map(el=>el.getAttribute('style'));
                sabitler.forEach(el=>{el.style.setProperty('position','static','important');el.style.setProperty('top','auto','important');el.style.setProperty('transform','none','important');el.style.setProperty('inset','auto','important');});
                try {
                    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
                    return await html2canvas(table, { backgroundColor:'#ffffff', scale, useCORS:true, width:table.scrollWidth, height:table.scrollHeight, windowWidth:table.scrollWidth, scrollY:0, onclone:doc=>{const kopya=doc.getElementById('puantajTablosu');kopya?.querySelectorAll('thead,thead tr,thead th').forEach(el=>{el.style.setProperty('position','static','important');el.style.setProperty('top','auto','important');el.style.setProperty('transform','none','important');el.style.setProperty('inset','auto','important');});} });
                } finally {
                    sabitler.forEach((el,index)=>{const stil=oncekiStiller[index];if(stil===null)el.removeAttribute('style');else el.setAttribute('style',stil);});
                }
            }
        } catch (error) {
            console.warn('Standart görüntü alma denemesi başarısız oldu, yedek yöntem kullanılıyor.', error);
        }

        const rows = Array.from(table.rows);
        const widths = Array.from(rows[0].cells).map(cell => Math.max(cell.getBoundingClientRect().width, 34));
        const rowHeight = 31;
        const width = Math.ceil(widths.reduce((sum, value) => sum + value, 0));
        const baslikYuksekligi = baslik ? 48 : 0;
        const height = Math.max(rows.length * rowHeight, rowHeight) + baslikYuksekligi;
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.font = '600 11px Arial';
        ctx.textBaseline = 'middle';

        if (baslik) {
            const [cizelgeBasligi, donemBilgisi] = String(baslik).split(' — ');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, baslikYuksekligi);
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(0, baslikYuksekligi - 3, width, 3);
            ctx.fillStyle = '#0f172a';
            ctx.font = '800 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(cizelgeBasligi, 18, 25, Math.max(width * .68, 10));
            ctx.fillStyle = '#475569';
            ctx.font = '700 12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(donemBilgisi || '', width - 18, 25, Math.max(width * .30, 10));
            ctx.font = '600 11px Arial';
        }

        rows.forEach((row, rowIndex) => {
            const y = baslikYuksekligi + (rowIndex * rowHeight);
            let x = 0;
            Array.from(row.cells).forEach((cell, cellIndex) => {
                const cellWidth = widths[cellIndex];
                const isHeader = row.parentElement.tagName === 'THEAD';
                const style = getComputedStyle(cell), rowStyle = getComputedStyle(row);
                const hucreArka = style.backgroundColor === 'rgba(0, 0, 0, 0)' ? rowStyle.backgroundColor : style.backgroundColor;
                ctx.fillStyle = isHeader ? '#0f172a' : (!hucreArka || hucreArka === 'rgba(0, 0, 0, 0)' ? '#ffffff' : hucreArka);
                ctx.fillRect(x, y, cellWidth, rowHeight);
                ctx.strokeStyle = '#cbd5e1';
                ctx.strokeRect(x, y, cellWidth, rowHeight);
                const input = cell.querySelector('input');
                const text = String(input ? input.value : cell.innerText).replace(/\s+/g, ' ').trim();
                ctx.fillStyle = isHeader ? '#ffffff' : (style.color && style.color !== 'rgba(0, 0, 0, 0)' ? style.color : '#0f172a');
                ctx.textAlign = cellIndex === 1 ? 'left' : 'center';
                const textX = cellIndex === 1 ? x + 7 : x + (cellWidth / 2);
                ctx.fillText(text, textX, y + (rowHeight / 2), Math.max(cellWidth - 8, 10));
                x += cellWidth;
            });
        });
        return canvas;
    };
 const puantajCanvasOlustur=(...a)=>{check();return checked(originalCanvas(...a))};
 const originalPdf=async function exportPuantajToPDF() {
        const ay = document.getElementById('puanAySec').options[document.getElementById('puanAySec').selectedIndex].text;
        const yil = document.getElementById('puanYilSec').value;
        const table = document.getElementById('puantajTablosu');
        if(!table||table.rows.length<2)return alert('PDF için gösterilecek puantaj kaydı bulunmuyor.');
        showGlobalOverlay('PDF hazırlanıyor', 'Çizelge tek sayfaya sığdırılıyor...');
        try {
            const cizelgeAdi = puantajGorunumu === 'prim' ? 'AYLIK PRİM HAKEDİŞ ÇİZELGESİ' : 'AYLIK PERSONEL PUANTAJ ÇİZELGESİ';
            const tabloCanvas = await puantajCanvasOlustur(table, 1.5, '');
            if(!tabloCanvas||tabloCanvas.width<2||tabloCanvas.height<2)throw new Error('Puantaj görüntüsü boş oluştu.');
            const baslikYuksekligi=72,canvas=document.createElement('canvas');canvas.width=tabloCanvas.width;canvas.height=tabloCanvas.height+baslikYuksekligi;const baslikCtx=canvas.getContext('2d');baslikCtx.fillStyle='#fff';baslikCtx.fillRect(0,0,canvas.width,canvas.height);baslikCtx.fillStyle='#0f172a';baslikCtx.font='800 28px Arial';baslikCtx.textBaseline='middle';baslikCtx.textAlign='left';baslikCtx.fillText(cizelgeAdi,24,31,Math.max(100,canvas.width*.68));baslikCtx.fillStyle='#475569';baslikCtx.font='700 21px Arial';baslikCtx.textAlign='right';baslikCtx.fillText(`${String(ay).toLocaleUpperCase('tr-TR')} ${yil}`,canvas.width-24,31,Math.max(100,canvas.width*.28));baslikCtx.fillStyle='#0f766e';baslikCtx.fillRect(0,baslikYuksekligi-5,canvas.width,5);baslikCtx.drawImage(tabloCanvas,0,baslikYuksekligi);
            const JsPDF = window.jspdf?.jsPDF || window.jsPDF;
            if (!JsPDF) throw new Error('PDF kütüphanesi yüklenemedi.');

            // Görseli doğrudan A2 yatay sayfa genişliğine ölçekle: sağ tarafın kesilmesini önler.
            const pdf = new JsPDF({ orientation:'landscape', unit:'mm', format:'a2' });
            const kenar = 8;
            const sayfaGenisligi = pdf.internal.pageSize.getWidth();
            const sayfaYuksekligi = pdf.internal.pageSize.getHeight();
            const yazdirmaGenisligi = sayfaGenisligi - (kenar * 2);
            const yazdirmaYuksekligi = sayfaYuksekligi - (kenar * 2);
            const kaynakParcaYuksekligi = Math.max(1, Math.floor(canvas.width * yazdirmaYuksekligi / yazdirmaGenisligi));
            let baslangicY = 0;
            let sayfa = 0;

            while (baslangicY < canvas.height) {
                const parcaYuksekligi = Math.min(kaynakParcaYuksekligi, canvas.height - baslangicY);
                const parca = document.createElement('canvas');
                parca.width = canvas.width;
                parca.height = parcaYuksekligi;
                parca.getContext('2d').drawImage(canvas, 0, baslangicY, canvas.width, parcaYuksekligi, 0, 0, canvas.width, parcaYuksekligi);
                if (sayfa > 0) pdf.addPage('a2', 'landscape');
                pdf.addImage(parca.toDataURL('image/jpeg',.91), 'JPEG', kenar, kenar, yazdirmaGenisligi, parcaYuksekligi * yazdirmaGenisligi / canvas.width, undefined, 'FAST');
                baslangicY += parcaYuksekligi;
                sayfa++;
            }
            fdCiktiPdfOnizle(pdf.output('blob'),`${yil}_${ay}_${puantajGorunumu === 'prim' ? 'Prim' : 'Puantaj'}.pdf`);
        } catch (error) {
            console.error('Puantaj PDF oluşturma hatası:', error);
            alert('Puantaj PDF oluşturulamadı: ' + (error?.message || error));
        } finally {
            hideGlobalOverlay();
        }
    };
 const originalImage=async function puantajGoruntusuAlVePaylas() {
        const table = document.getElementById('puantajTablosu');
        if (!table || !table.rows.length) return;

        showGlobalOverlay('Ekran görüntüsü alınıyor', 'Puantaj çizelgesi hazırlanıyor...');

        try {
            const ay = document.getElementById('puanAySec').options[document.getElementById('puanAySec').selectedIndex].text;
            const yil = document.getElementById('puanYilSec').value;
            const cizelgeAdi = puantajGorunumu === 'prim' ? 'AYLIK PRİM HAKEDİŞ ÇİZELGESİ' : 'AYLIK PERSONEL PUANTAJ ÇİZELGESİ';
            const canvas = await puantajCanvasOlustur(table, 2, `${cizelgeAdi} — ${String(ay).toLocaleUpperCase('tr-TR')} ${yil}`);
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error('Görüntü oluşturulamadı.');

            if (!(navigator.clipboard && window.ClipboardItem)) {
                throw new Error('Tarayıcı görüntüyü panoya kopyalamayı desteklemiyor.');
            }
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showGlobalOverlay('Ekran görüntüsü kopyalandı', 'Görüntü panoya kopyalandı. İstediğiniz yere yapıştırabilirsiniz.');
            setTimeout(hideGlobalOverlay, 1300);
        } catch (error) {
            hideGlobalOverlay();
            alert('Ekran görüntüsü alınamadı. Lütfen tekrar deneyin.');
            console.error(error);
        }
    };
 try{const value=await(request.action==='canvas'?puantajCanvasOlustur:request.action==='pdf'?originalPdf:originalImage)(...args);return{ok:true,value}}catch(error){return{ok:false,error}}
}
return{open:execute,api:{},dispose(){disposed=true;for(const r of [...requests])r.cancel();requests.clear()}};
});
