(function (root) {
    'use strict';

    // Attendance-only presentation of the printer's already selected, read-only models.
    // There are no data queries, attendance calculations or changes to selected source values.
    const text = value => value == null ? '' : String(value);
    const norm = value => text(value).toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').trim();
    const escape = value => text(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const unique = values => [...new Set(values.map(text).filter(value => value.trim()))];
    const A3_WIDTH = 1600, A3_HEIGHT = A3_WIDTH * 297 / 420;
    let directPending = false;
    function normalize(model) {
        const columns = (model.columns || []).map((column, index) => typeof column === 'string' ? {key:String(index),label:column,type:''} : {...column});
        return {title:text(model.title),subtitle:text(model.subtitle),columns,rows:(model.rows || []).map(row => columns.map((column, index) => Array.isArray(row) ? row[index] ?? '' : row?.[column.key] ?? '')),footnotes:unique(model.footnotes || [])};
    }
    function attendanceGroup(group) {
        const source = [group?.handler,group?.onclick,...(group?.items || []).map(item => item.button?.getAttribute?.('onclick') || text(item.button?.onclick))].join(' ');
        return /\bmagicpassAylik(?:Excel|Pdf)Al\s*\(/.test(source);
    }
    function summaryModel(model) { return norm(model.title) === 'aylik calisma ozeti'; }
    function dailyModel(model) { return /giris[\s–-]*cikis/.test(norm(model.title)); }
    function printable(model) {
        const result=normalize(model),isSummary=summaryModel(result);
        if(isSummary){
            const indices=result.columns.map((column,index)=>['aciklama','saat'].includes(norm(column.label))?index:-1).filter(index=>index>=0);
            result.columns=indices.map(index=>result.columns[index]);result.rows=result.rows.map(row=>indices.map(index=>row[index]));
            const description=result.columns.findIndex(column=>norm(column.label)==='aciklama'),hours=result.columns.findIndex(column=>norm(column.label)==='saat');
            const records=[],notes=[];let explanatory=false;
            result.rows.forEach(row=>{if(row.every(value=>!text(value).trim()))return;if(description>=0&&norm(row[description])==='aciklamalar'){explanatory=true;return;}if(explanatory||(description>=0&&hours>=0&&!text(row[hours]).trim())){const note=row.map(text).filter(Boolean).join(' · ');if(note)notes.push(note);}else records.push(row);});
            result.rows=records;result.footnotes=unique([...notes,...result.footnotes]);
        }
        return result;
    }
    function columnWeight(column) {
        const label=norm(column.label);
        if(label==='tarih')return 90;if(label==='gun')return 95;if(label==='vardiya')return 115;
        if(label==='giris'||label==='cikis')return 170;if(label==='durum')return 175;if(label==='aciklama')return 270;
        if(label==='toplam calisma'||label==='fazla mesai')return 100;return 75;
    }
    function shown(value,column){return root.fdOutputRenderers?.display ? root.fdOutputRenderers.display(value,column) : text(value);}
    function tableHtml(model,isSummary) {
        const weights=model.columns.map(column=>isSummary?(norm(column.label)==='saat'?24:76):columnWeight(column)),total=weights.reduce((sum,value)=>sum+value,0)||1;
        const header=model.columns.map(column=>'<th scope="col">'+escape(column.label)+'</th>').join('');
        const body=model.rows.map((row,index)=>'<tr data-fd-attendance-source-row="'+index+'">'+model.columns.map((column,c)=>'<td'+(norm(column.label)==='saat'?' class="fd-att-print-hours"':'')+'>'+escape(shown(row[c],column).replace(/\s*\n\s*/g,' / '))+'</td>').join('')+'</tr>').join('');
        return '<table><colgroup>'+weights.map(weight=>'<col style="width:'+weight/total*100+'%">').join('')+'</colgroup><thead><tr>'+header+'</tr></thead><tbody>'+body+'</tbody></table>';
    }
    function panelHtml(model,kind,omitted) {
        const isSummary=kind==='summary',title=isSummary?'Aylık Çalışma Özeti':'Aylık Personel Giriş-Çıkış Raporu';
        const notes=unique(model.footnotes),identifying=notes.filter(note=>/^(?:personel|şube|sube|görev|gorev|cihaz no|dönem|donem)\s*[:·]/i.test(note));
        const rest=notes.filter(note=>!identifying.includes(note)&&norm(note)!==norm(title));
        return '<style>[data-fd-attendance-report-print]{--fd-print-font:'+(isSummary?'16':'12')+'px;--fd-print-pad:'+(isSummary?'7':'3')+'px}'+
            '[data-fd-attendance-report-print] *{box-sizing:border-box}'+
            '[data-fd-attendance-report-print] h2{font:800 23px/1.3 Arial;margin:0 0 9px;color:#173c4a}'+
            '[data-fd-attendance-report-print] header{padding:0 0 13px;margin-bottom:13px;border-bottom:2px solid #0f766e}'+
            '[data-fd-attendance-report-print] .fd-att-print-id{font:12px/1.4 Arial;color:#475569;white-space:normal;overflow-wrap:anywhere}'+
            '[data-fd-attendance-report-print] table{width:100%!important;min-width:0!important;max-width:100%!important;table-layout:fixed;border-collapse:collapse;font-family:Arial,sans-serif}'+
            '[data-fd-attendance-report-print] th,[data-fd-attendance-report-print] td{position:static!important;z-index:auto!important;padding:var(--fd-print-pad) 5px;border:1px solid #cbd5e1;font-size:var(--fd-print-font);line-height:1.22;white-space:normal!important;overflow-wrap:anywhere;vertical-align:middle;text-align:left;color:#173b51}'+
            '[data-fd-attendance-report-print] th{font-weight:750;background:#e2edf3}'+
            '[data-fd-attendance-report-print] tbody tr:nth-child(even){background:#f7fafc}'+
            '[data-fd-attendance-report-print] .fd-att-print-hours{text-align:right;font-variant-numeric:tabular-nums}'+
            '[data-fd-attendance-report-print] .fd-att-print-notes{display:grid;grid-template-columns:'+(isSummary?'1fr':'1fr 1fr')+';gap:4px 18px;margin-top:11px;font:'+(isSummary?'12':'10')+'px/1.35 Arial;color:#52647a}'+
            '[data-fd-attendance-report-print] footer{margin-top:12px;text-align:right;font:10px/1.3 Arial;color:#64748b}</style>'+
            '<header><h2>'+escape(title)+'</h2><div class="fd-att-print-id">'+escape(unique([...identifying,...model.subtitle&&!/\.xlsx?$/i.test(model.subtitle)?[model.subtitle]:[]]).join(' · '))+'</div></header>'+tableHtml(model,isSummary)+
            '<div class="fd-att-print-notes">'+[...rest,...omitted?['Durum ve açıklama sütunları, aylık çizelgenin tek sayfaya sığması için yalnız bu PDF çıktısında gösterilmemiştir.']:[]].map(note=>'<div>'+escape(note)+'</div>').join('')+'</div><footer>FD YAZILIM</footer>';
    }
    function withoutOptional(model) {
        const indices=model.columns.map((column,index)=>['durum','aciklama'].includes(norm(column.label))?-1:index).filter(index=>index>=0);
        return {...model,columns:indices.map(index=>model.columns[index]),rows:model.rows.map(row=>indices.map(index=>row[index]))};
    }
    async function render(models,options) {
        const check=()=>{if(options.isCurrent&&!options.isCurrent())throw Error('Çıktı işlemi oturum değiştiği için iptal edildi.');};
        check();const JsPDF=root.jspdf?.jsPDF||root.jsPDF;if(!JsPDF||typeof root.html2canvas!=='function')throw Error('PDF bileşeni yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
        await root.document.fonts?.ready;check();
        const sections=models.map(model=>({model:printable(model),kind:summaryModel(model)?'summary':'monthly',pages:[]})),panels=new Set();
        const filename=text(options.filename||'Aylık_Giriş_Çıkış.pdf').replace(/\.pdf$/i,'')+'.pdf';let pdf,modal,completed=0;
        try{
            for(const section of sections){
                check();const panel=root.document.createElement('section');panels.add(panel);panel.setAttribute('data-fd-attendance-report-print',section.kind);panel.className='fd-attendance-report-print-panel';
                panel.style.cssText='position:fixed;left:0;top:0;z-index:2147483000;width:'+A3_WIDTH+'px;padding:32px;background:#fff;color:#173b51;font-family:Arial,sans-serif;pointer-events:none;';
                panel.innerHTML=panelHtml(section.model,section.kind,false);root.document.body.appendChild(panel);let omitted=[];
                if(section.kind==='monthly'&&panel.scrollHeight>A3_HEIGHT){
                    const optional=section.model.columns.filter(column=>['durum','aciklama'].includes(norm(column.label)));
                    if(optional.length){omitted=optional.map(column=>column.label);section.model=withoutOptional(section.model);panel.innerHTML=panelHtml(section.model,section.kind,true);}
                    for(const size of [11.5,11,10.5,10]){if(panel.scrollHeight<=A3_HEIGHT)break;panel.style.setProperty('--fd-print-font',size+'px');panel.style.setProperty('--fd-print-pad','2px');}
                }
                section.omittedColumns=omitted;section.renderedHeight=panel.scrollHeight;section.renderedWidth=panel.scrollWidth;check();
                const canvas=await root.html2canvas(panel,{scale:2,backgroundColor:'#fff',logging:false,scrollX:0,scrollY:0,width:panel.scrollWidth,height:panel.scrollHeight,windowWidth:Math.max(panel.scrollWidth,1600),windowHeight:Math.max(panel.scrollHeight,1200)});
                try{
                    check();if(!canvas?.width||!canvas?.height)throw Error('Rapor görüntüsü boş oluştu.');
                    const image=canvas.toDataURL('image/jpeg',.98);check();
                    if(!pdf){pdf=new JsPDF({orientation:'landscape',unit:'mm',format:'a3',compress:true});pdf.setProperties?.({title:'Aylık Personel Giriş-Çıkış Raporu',creator:'FD YAZILIM'});}
                    else pdf.addPage('a3','landscape');check();
                    const width=pdf.internal.pageSize.getWidth(),height=pdf.internal.pageSize.getHeight(),margin=8,scale=Math.min((width-margin*2)/canvas.width,(height-margin*2)/canvas.height),w=canvas.width*scale,h=canvas.height*scale;
                    pdf.addImage(image,'JPEG',(width-w)/2,margin,w,h,undefined,'FAST');
                    const page={kind:section.kind,rowIndices:section.model.rows.map((_,index)=>index),rowCount:section.model.rows.length,columns:section.model.columns.map(column=>column.label),dates:unique(section.model.rows.flatMap(row=>row.map(text).filter(value=>/^\d{2}\.\d{2}\.\d{4}$/.test(value)))),omittedColumns:omitted};
                    section.pages.push(page);completed++;options.onProgress?.({completed,total:sections.length});
                }finally{panel.remove();panels.delete(panel);if(canvas){canvas.width=1;canvas.height=1;}}
                await new Promise(resolve=>root.setTimeout(resolve,0));check();
            }
            if(!pdf)throw Error('Çıktı için tablo bulunamadı.');const blob=pdf.output('blob');check();if(!blob||blob.size<100)throw Error('PDF dosyası oluşturulamadı.');
            if(options.preview!==false&&typeof root.fdCiktiPdfOnizle==='function'){modal=typeof root.fdCiktiOnizlemeAc==='function'?root.fdCiktiOnizlemeAc('pdf',filename):null;check();await root.fdCiktiPdfOnizle(blob,filename,modal);}
            return{blob,filename,plan:{sections,pages:sections.flatMap((section,sectionIndex)=>section.pages.map(page=>({...page,sectionIndex})))}};
        }catch(error){modal?.remove();throw error;}finally{for(const panel of panels)panel.remove();}
    }
    async function direct(options={}) {
        if(typeof options.isCurrent!=='function')throw Error('PDF rapor oturumu doğrulanamadı.');
        const check=()=>{if(!options.isCurrent())throw Error('Çıktı işlemi oturum değiştiği için iptal edildi.');};
        check();if(directPending)throw Error('Aylık PDF raporu zaten hazırlanıyor.');
        if(typeof root.fdUnifiedOutput?.capture!=='function')throw Error('Aylık raporun çıktı kaynağı yüklenemedi.');
        const button=[...root.document.querySelectorAll('#magicpass-tab-liste button')].find(node=>/\bmagicpassAylikExcelAl\s*\(/.test(node.getAttribute('onclick')||''));
        if(!button?.isConnected)throw Error('Aylık raporun çıktı kaynağı bulunamadı.');
        directPending=true;
        try{
            check();const title=text(root.document.getElementById('magicpassSeciliPersonelBaslik')?.textContent||'Aylık Personel Giriş-Çıkış Raporu');
            const captured=await root.fdUnifiedOutput.capture(button,title);check();
            // This is the same metadata fold as the existing printer prepareModels.
            const models=captured.map(model=>({...model,footnotes:[...(model.footnotes||[])]}));
            const metadata=models.filter(model=>/^(rapor bilgisi|report info)$/i.test(model.title||''));
            const notes=metadata.flatMap(model=>model.rows.map(row=>model.columns.map((column,index)=>Array.isArray(row)?row[index]:row[column.key]).filter(value=>value!==''&&value!=null).join(': ')));
            const reports=models.filter(model=>!metadata.includes(model));
            for(const model of reports){
                if(/\.xlsx?$/i.test(model.subtitle||''))model.subtitle=title;
                model.footnotes=[...new Set([...(model.footnotes||[]),...notes])];
                const identifying=model.columns.find(column=>/personel|ad soyad|ad soyadi|plaka|urun|tasinmaz|kiraci|mulk/i.test(norm(column.label)));
                if(identifying&&!model.identifierKey)model.identifierKey=identifying.key;
            }
            if(!reports.length||reports.some(model=>!dailyModel(model)&&!summaryModel(model)))throw Error('Aylık raporun tüm satırları hazırlanamadı.');
            check();const result=await render(reports,options);check();return result;
        }finally{directPending=false;}
    }
    root.fdAttendanceReportLayout={direct,pdf(group,input,options={}){
        if(!attendanceGroup(group))return null;
        const models=Array.isArray(input)?input:[];
        if(!models.length||models.some(model=>!Array.isArray(model?.columns)||!Array.isArray(model?.rows))||models.some(model=>!dailyModel(model)&&!summaryModel(model)))return null;
        return render(models,options);
    }};
})(typeof window!=='undefined'?window:globalThis);
