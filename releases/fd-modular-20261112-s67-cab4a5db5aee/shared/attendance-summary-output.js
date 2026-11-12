(function (root) {
    'use strict';

    const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    const finite = value => value !== null && value !== '' && value !== undefined && Number.isFinite(Number(value)) ? Number(value) : null;
    const duration = value => { const n = finite(value); if(n === null)return '—';const minutes=Math.max(0,Math.round(n));return String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0'); };
    const rows = summary => Array.isArray(summary?.rows) ? summary.rows : [];
    function notes(summary) {
        const normalize = values => (Array.isArray(values) ? values : values ? [values] : []).map(value => typeof value === 'object' && value !== null ? String(value.text ?? value.message ?? '') : String(value ?? '')).filter(value => value.trim());
        const hoursOnly = note => /^Gün:/.test(note) ? 'Süreler saat:dakika biçimindedir; saat toplamları 24 saati aşabilir.' : note.includes('gün sayısı, geç/erken') ? 'Mevcut geç/erken mahsubu ay toplamında hesaplanır; yarım tatil devamsızlığı ayrı gösterilir ve fazla mesaiden otomatik düşülmez.' : note;
        return [...new Set([...normalize(summary?.notes), ...normalize(summary?.warnings)].map(hoursOnly))];
    }

    function fdAttendanceSummaryTableHtml(summary, options = {}) {
        const print = Boolean(options.print),headStyle = print ? ' style="border:1px solid #94a3b8;padding:8px 10px;background:#e2e8f0;color:#173c4a;font-size:14px;text-align:left;line-height:1.35"' : '',cellStyle = print ? ' style="border:1px solid #cbd5e1;padding:7px 10px;font-size:14px;line-height:1.35;text-align:left;vertical-align:top"' : '',valueStyle = print ? ' style="border:1px solid #cbd5e1;padding:7px 10px;font-size:14px;line-height:1.35;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;vertical-align:top"' : '';
        const body=rows(summary).map(row=>'<tr data-attendance-summary-row="'+escape(row.key||'')+'"><th scope="row"'+cellStyle+'>'+escape(row.label||'')+'</th><td class="fd-attendance-summary-value"'+valueStyle+'>'+duration(row.minutes)+'</td></tr>').join('')||'<tr><td colspan="2"'+cellStyle+'>Gösterilecek özet bulunmuyor.</td></tr>';
        const explanations=notes(summary),noteStyle=print?' style="margin:10px 0 0;padding-left:20px;font-size:12px;line-height:1.5;color:#475569"':'';
        return '<div class="fd-attendance-summary-output"><table class="fd-attendance-summary-table"'+(print?' style="width:100%;table-layout:fixed;border-collapse:collapse;color:#0f172a;font-family:Arial,sans-serif"':'')+'><caption'+(print?' style="caption-side:top;text-align:left;font-size:20px;font-weight:800;color:#173c4a;padding:8px 0 12px"':'')+'>Aylık Çalışma Özeti</caption><colgroup><col style="width:78%"><col style="width:22%"></colgroup><thead><tr><th scope="col"'+headStyle+'>Açıklama</th><th scope="col"'+headStyle+'>Saat</th></tr></thead><tbody>'+body+'</tbody></table>'+(explanations.length?'<ul class="fd-attendance-summary-notes"'+noteStyle+'>'+explanations.map(note=>'<li>'+escape(note)+'</li>').join('')+'</ul>':'')+'</div>';
    }

    function fdAttendanceSummaryWorkbook(workbook, summary) {
        if(!workbook||!rows(summary).length)return false;
        if(!root.XLSX?.utils?.aoa_to_sheet)throw Error('Excel kütüphanesi yüklenemedi.');
        const data=[['Açıklama','Saat'],...rows(summary).map(row=>[String(row.label||''),duration(row.minutes)])],lastDataRow=data.length,explanations=notes(summary);
        if(explanations.length)data.push([],['Açıklamalar'],...explanations.map(note=>[note]));
        const sheet=root.XLSX.utils.aoa_to_sheet(data);
        sheet['!autofilter']={ref:'A1:B'+lastDataRow};sheet['!cols']=[{wch:70},{wch:18}];
        sheet['!freeze']={xSplit:0,ySplit:1,topLeftCell:'A2',activePane:'bottomLeft',state:'frozen'};
        sheet['!pageSetup']={orientation:'portrait',paperSize:9,fitToWidth:1,fitToHeight:1};sheet['!margins']={left:.3,right:.3,top:.35,bottom:.35,header:.1,footer:.1};sheet['!printArea']='A1:B'+data.length;
        sheet['!rows']=data.map((_,index)=>({hpt:index===0?26:index>lastDataRow?30:24}));
        if(explanations.length)sheet['!merges']=explanations.map((_,index)=>({s:{r:lastDataRow+2+index,c:0},e:{r:lastDataRow+2+index,c:1}}));
        const base='Aylık Çalışma Özeti';let name=base,index=1;while((workbook.SheetNames||[]).some(value=>String(value).toLocaleLowerCase('tr-TR')===name.toLocaleLowerCase('tr-TR'))){const suffix=' ('+(++index)+')';name=base.slice(0,31-suffix.length)+suffix;}
        root.XLSX.utils.book_append_sheet(workbook,sheet,name);return name;
    }

    async function fdAttendanceSummaryPdfPage(pdf, summary, personel, ay, isCurrent = () => true) {
        const assertCurrent=()=>{if(!isCurrent())throw Error('Çıktı işlemi oturum değiştiği için iptal edildi.');};
        assertCurrent();if(!rows(summary).length)return false;
        if(!pdf||typeof pdf.addPage!=='function'||typeof pdf.addImage!=='function'||typeof root.html2canvas!=='function')throw Error('PDF özet sayfası hazırlanamadı.');
        const panel=root.document.createElement('div');panel.className='fd-attendance-summary-pdf-panel';panel.setAttribute('data-fd-attendance-summary-pdf','');
        panel.style.cssText='position:fixed;left:0;top:0;z-index:2147483000;width:1240px;box-sizing:border-box;padding:22px 26px;font-family:Arial,sans-serif;color:#0f172a;background:#fff;pointer-events:none;';
        panel.innerHTML='<header style="display:flex;justify-content:space-between;gap:18px;align-items:flex-start;border-bottom:2px solid #0f766e;padding-bottom:12px;margin-bottom:8px"><div><strong style="display:block;font-size:18px;line-height:1.4">'+escape(personel?.ad||'Personel')+'</strong>'+(personel?.sube?'<span style="display:block;font-size:13px;line-height:1.5;color:#64748b">'+escape(personel.sube)+'</span>':'')+'</div><div style="text-align:right;font-size:13px;color:#475569"><span style="display:block">Rapor Dönemi</span><strong style="display:block;margin-top:4px;font-size:16px">'+escape(ay||summary?.month||'—')+'</strong></div></header>'+fdAttendanceSummaryTableHtml(summary,{print:true})+'<footer style="margin-top:12px;text-align:right;color:#64748b;font-size:11px">FD YAZILIM</footer>';
        try{
            assertCurrent();root.document.body.appendChild(panel);
            if(root.document.fonts?.ready){await root.document.fonts.ready;assertCurrent();}
            const canvas=await root.html2canvas(panel,{scale:2,backgroundColor:'#fff',logging:false,scrollX:0,scrollY:0,width:panel.scrollWidth,height:panel.scrollHeight,windowWidth:Math.max(panel.scrollWidth,1280),windowHeight:Math.max(panel.scrollHeight,900)});
            assertCurrent();if(!canvas?.width||!canvas?.height)throw Error('PDF özet görüntüsü boş oluştu.');
            const image=canvas.toDataURL('image/jpeg',.98);assertCurrent();
            pdf.addPage('a3','landscape');assertCurrent();
            const width=pdf.internal?.pageSize?.getWidth?.()||420,height=pdf.internal?.pageSize?.getHeight?.()||297,margin=9,scale=Math.min((width-margin*2)/canvas.width,(height-margin*2)/canvas.height),w=canvas.width*scale,h=canvas.height*scale;
            pdf.addImage(image,'JPEG',(width-w)/2,margin,w,h,undefined,'FAST');return true;
        }finally{panel.remove();}
    }

    root.fdAttendanceSummaryTableHtml=fdAttendanceSummaryTableHtml;
    root.fdAttendanceSummaryWorkbook=fdAttendanceSummaryWorkbook;
    root.fdAttendanceSummaryPdfPage=fdAttendanceSummaryPdfPage;
})(typeof window!=='undefined'?window:globalThis);
