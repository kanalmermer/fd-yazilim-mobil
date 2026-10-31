(function (root) {
    'use strict';

    // Attendance-only presentation of the printer's already selected, read-only models.
    // Only the existing read-only photo transport is used; attendance data/calculations stay intact.
    const text = value => value == null ? '' : String(value);
    const norm = value => text(value).toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').trim();
    const escape = value => text(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const unique = values => {const seen=new Set();return values.map(text).filter(value=>{const key=norm(value).replace(/\s+/g,' ');if(!key||seen.has(key))return false;seen.add(key);return true;});};
    const A3_WIDTH = 1600, A3_HEIGHT = A3_WIDTH * 297 / 420;
    let directPending = false;
    function normalize(model) {
        const columns = (model.columns || []).map((column, index) => typeof column === 'string' ? {key:String(index),label:column,type:''} : {...column});
        return {...model,title:text(model.title),subtitle:text(model.subtitle),attendanceContext:model.attendanceContext,columns,rows:(model.rows || []).map(row => columns.map((column, index) => Array.isArray(row) ? row[index] ?? '' : row?.[column.key] ?? '')),footnotes:unique(model.footnotes || [])};
    }
    function attendanceGroup(group) {
        const source = [group?.handler,group?.onclick,...(group?.items || []).map(item => item.button?.getAttribute?.('onclick') || text(item.button?.onclick))].join(' ');
        return /\bmagicpassAylik(?:Excel|Pdf)Al\s*\(/.test(source);
    }
    function summaryModel(model) { return norm(model.title) === 'aylik calisma ozeti'; }
    function dailyModel(model) { return /giris[\s–-]*cikis/.test(norm(model.title)); }
    function context(){
        const p=typeof magicpassRaporPersoneli==='function'?magicpassRaporPersoneli():null,month=text(root.document.getElementById('magicpassAy')?.value);
        if(!p||!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw Error('Rapor personeli veya dönemi doğrulanamadı.');
        const current=fdAttendanceSummaryExportScope(p,month);
        const person={id:text(p.id),ad:text(p.ad||'Personel'),sube:text(p.sube||'Merkez'),gorev:text(p.gorev||'-'),cihazPersonelNo:text(p.cihazPersonelNo||'-'),fotografDosya:p.fotografDosya?{...p.fotografDosya}:null,fotografUrl:text(p.fotografUrl),fotografKadraj:{...p.fotografKadraj}};
        return{person,month,current,fields:[['Personel',person.ad],['Şube',person.sube],['Görev',person.gorev],['Cihaz No',person.cihazPersonelNo],['Dönem',month]]};
    }
    function prepare(group,input){
        if(group&&!attendanceGroup(group))return null;
        if(!input.length||input.some(model=>!dailyModel(model)&&!summaryModel(model)))return null;
        const ctx=input[0].attendanceContext||context();if(!ctx.current())throw Error('Rapor seçimi değişti. Çıktıyı yeniden açın.');
        if(input.some(model=>model.attendanceContext&&model.attendanceContext!==ctx))throw Error('Rapor seçimleri uyuşmuyor.');
        const identifying=/^(?:personel|şube|sube|görev|gorev|cihaz no|dönem|donem)\s*[:·]/i;
        const raw=input.map(model=>printable(model)),notes=unique(raw.flatMap(model=>model.footnotes).filter(note=>!identifying.test(note)&&![ctx.person.ad,ctx.month,'Aylık Personel Giriş–Çıkış Raporu','Aylık Personel Giriş-Çıkış Raporu','Aylık Çalışma Özeti'].some(value=>norm(note)===norm(value))));
        const last=Math.max(0,raw.findIndex(summaryModel));
        return raw.map((model,index)=>({...model,attendanceContext:ctx,subtitle:ctx.fields.map(([key,value])=>key+': '+value).join(' · '),footnotes:index===last?notes:[]}));
    }
    async function photo(ctx,check){
        const p=ctx.person;if(!p.fotografDosya?.id&&!p.fotografUrl)return '';
        let image;try{
            let url=p.fotografUrl;
            if(p.fotografDosya?.id){const file=await root.fdYazilimDriveDosyaIndir(p.fotografDosya.id,'PERSONEL FOTOĞRAFLARI');check();if(!/^image\/(jpeg|png|webp)$/i.test(file.mimeType||'')||!file.base64||file.base64.length>15*1024*1024)throw Error('Geçersiz fotoğraf yanıtı');url='data:'+file.mimeType+';base64,'+file.base64.replace(/^data:[^,]+,/,'');}
            if(!/^data:image\/(jpeg|png|webp|svg\+xml)[;,]/i.test(url)){const response=await root.fetch(url,{mode:'cors',credentials:'omit'});check();if(!response.ok)throw Error('Fotoğraf okunamadı');const blob=await response.blob();check();if(!/^image\/(jpeg|png|webp)$/i.test(blob.type)||blob.size>10*1024*1024)throw Error('Geçersiz fotoğraf');url=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob)});}
            check();image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url});check();
            if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>80000000)throw Error('Geçersiz fotoğraf boyutu');
            const crop=root.fdPersonnelPhoto.normalize(p.fotografKadraj),c=root.document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d'),scale=Math.max(160/image.naturalWidth,160/image.naturalHeight)*crop.zoom,w=image.naturalWidth*scale,h=image.naturalHeight*scale;
            g.beginPath();g.arc(80,80,80,0,Math.PI*2);g.clip();g.drawImage(image,(160-w)*crop.x/100,(160-h)*crop.y/100,w,h);const result=c.toDataURL('image/png');c.width=c.height=1;check();return result;
        }catch(error){check();root.showToast?.('Personel fotoğrafı alınamadı; çıktı fotoğrafsız hazırlanıyor.','warning');return '';}
        finally{if(image){image.onload=null;image.onerror=null;image.removeAttribute('src');}}
    }
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
    function panelHtml(model,kind,omitted,avatar='') {
        const isSummary=kind==='summary',title=isSummary?'Aylık Çalışma Özeti':'Aylık Personel Giriş-Çıkış Raporu';
        const rest=unique(model.footnotes),ctx=model.attendanceContext;
        return '<style>[data-fd-attendance-report-print]{--fd-print-font:'+(isSummary?'16':'12')+'px;--fd-print-pad:'+(isSummary?'7':'3')+'px}'+
            '[data-fd-attendance-report-print] *{box-sizing:border-box}'+
            '[data-fd-attendance-report-print] h2{font:800 23px/1.3 Arial;margin:0 0 9px;color:#173c4a}'+
            '[data-fd-attendance-report-print] header{padding:0 0 13px;margin-bottom:13px;border-bottom:2px solid #0f766e}'+
            '[data-fd-attendance-report-print] header h2::before{display:none}'+
            '[data-fd-attendance-report-print] .fd-att-print-person{display:flex;align-items:center;gap:12px}'+
            '[data-fd-attendance-report-print] .fd-att-print-photo{width:62px;height:62px;flex:0 0 62px;border-radius:50%;object-fit:contain;border:2px solid #d0e2ee}'+
            '[data-fd-attendance-report-print] .fd-att-print-name{font:700 16px/1.4 Arial;color:#173c4a;margin-bottom:5px}'+
            '[data-fd-attendance-report-print] .fd-att-print-id{font:12px/1.4 Arial;color:#475569;white-space:normal;overflow-wrap:anywhere}'+
            '[data-fd-attendance-report-print] table{width:100%!important;min-width:0!important;max-width:100%!important;table-layout:fixed;border-collapse:collapse;font-family:Arial,sans-serif}'+
            '[data-fd-attendance-report-print] th,[data-fd-attendance-report-print] td{position:static!important;z-index:auto!important;padding:var(--fd-print-pad) 5px;border:1px solid #cbd5e1;font-size:var(--fd-print-font);line-height:1.22;white-space:normal!important;overflow-wrap:anywhere;vertical-align:middle;text-align:left;color:#173b51}'+
            '[data-fd-attendance-report-print] th{font-weight:750;background:#e2edf3}'+
            '[data-fd-attendance-report-print] tbody tr:nth-child(even){background:#f7fafc}'+
            '[data-fd-attendance-report-print] .fd-att-print-hours{text-align:right;font-variant-numeric:tabular-nums}'+
            '[data-fd-attendance-report-print] .fd-att-print-notes{display:grid;grid-template-columns:'+(isSummary?'1fr':'1fr 1fr')+';gap:4px 18px;margin-top:11px;font:'+(isSummary?'12':'10')+'px/1.35 Arial;color:#52647a}'+
            '[data-fd-attendance-report-print] footer{margin-top:12px;text-align:right;font:10px/1.3 Arial;color:#64748b}</style>'+
            '<header><h2>'+escape(title)+'</h2><div class="fd-att-print-person">'+(avatar?'<img class="fd-att-print-photo" src="'+escape(avatar)+'" alt="Personel fotoğrafı">':'')+'<div><div class="fd-att-print-name">'+escape(ctx?.person.ad||'')+'</div><div class="fd-att-print-id">'+escape(ctx?ctx.fields.slice(1).map(([key,value])=>key+': '+value).join(' · '):model.subtitle)+'</div></div></div></header>'+tableHtml(model,isSummary)+
            '<div class="fd-att-print-notes">'+[...rest,...omitted?['Durum ve açıklama sütunları, aylık çizelgenin tek sayfaya sığması için yalnız bu PDF çıktısında gösterilmemiştir.']:[]].map(note=>'<div>'+escape(note)+'</div>').join('')+'</div><footer>FD YAZILIM</footer>';
    }
    function withoutOptional(model) {
        const indices=model.columns.map((column,index)=>['durum','aciklama'].includes(norm(column.label))?-1:index).filter(index=>index>=0);
        return {...model,columns:indices.map(index=>model.columns[index]),rows:model.rows.map(row=>indices.map(index=>row[index]))};
    }
    async function render(models,options) {
        models=prepare(null,models);if(!models)throw Error('Giriş–çıkış raporu bulunamadı.');const ctx=models[0].attendanceContext;
        const check=()=>{if(!ctx.current()||options.isCurrent&&!options.isCurrent())throw Error('Çıktı işlemi oturum değiştiği için iptal edildi.');};
        check();const JsPDF=root.jspdf?.jsPDF||root.jsPDF;if(!options.imageOnly&&!JsPDF||typeof root.html2canvas!=='function')throw Error('PDF bileşeni yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
        await root.document.fonts?.ready;check();
        const avatar=await photo(ctx,check);check();const images=[];
        const sections=models.map(model=>({model:printable(model),kind:summaryModel(model)?'summary':'monthly',pages:[]})),panels=new Set();
        const filename=text(options.filename||'Aylık_Giriş_Çıkış.pdf').replace(/\.pdf$/i,'')+'.pdf';let pdf,modal,completed=0;
        try{
            for(const section of sections){
                check();const panel=root.document.createElement('section');panels.add(panel);panel.setAttribute('data-fd-attendance-report-print',section.kind);panel.className='fd-attendance-report-print-panel';
                panel.style.cssText='position:fixed;left:0;top:0;z-index:2147483000;width:'+A3_WIDTH+'px;padding:32px;background:#fff;color:#173b51;font-family:Arial,sans-serif;pointer-events:none;';
                panel.innerHTML=panelHtml(section.model,section.kind,false,avatar);root.document.body.appendChild(panel);let omitted=[];
                if(section.kind==='monthly'&&panel.scrollHeight>A3_HEIGHT){
                    const optional=section.model.columns.filter(column=>['durum','aciklama'].includes(norm(column.label)));
                    if(optional.length){omitted=optional.map(column=>column.label);section.model=withoutOptional(section.model);panel.innerHTML=panelHtml(section.model,section.kind,true,avatar);}
                    for(const size of [11.5,11,10.5,10]){if(panel.scrollHeight<=A3_HEIGHT)break;panel.style.setProperty('--fd-print-font',size+'px');panel.style.setProperty('--fd-print-pad','2px');}
                }
                section.omittedColumns=omitted;section.renderedHeight=panel.scrollHeight;section.renderedWidth=panel.scrollWidth;check();
                const canvas=await root.html2canvas(panel,{scale:2,backgroundColor:'#fff',logging:false,scrollX:0,scrollY:0,width:panel.scrollWidth,height:panel.scrollHeight,windowWidth:Math.max(panel.scrollWidth,1600),windowHeight:Math.max(panel.scrollHeight,1200)});
                try{
                    check();if(!canvas?.width||!canvas?.height)throw Error('Rapor görüntüsü boş oluştu.');
                    if(options.imageOnly){const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('Görüntü hazırlanamadı.')),'image/png'));check();images.push({blob,width:canvas.width,height:canvas.height});completed++;continue;}
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
            if(options.imageOnly){const width=Math.max(...images.map(i=>i.width)),height=images.reduce((sum,i)=>sum+i.height,0)+32*(images.length-1);if(!images.length||width>32760||height>32760||width*height>80000000)throw Error('Görüntü için daha az alan seçin.');const canvas=root.document.createElement('canvas'),bitmaps=[];canvas.width=width;canvas.height=height;try{const g=canvas.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,width,height);let y=0;for(const item of images){const bitmap=await root.createImageBitmap(item.blob);bitmaps.push(bitmap);check();g.drawImage(bitmap,0,y);y+=item.height+32;}const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('Görüntü hazırlanamadı.')),'image/png'));check();return{blob,width,height};}finally{bitmaps.forEach(b=>b.close());canvas.width=canvas.height=1;}}
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
    function excel(group,input,options={}){
        if(!attendanceGroup(group))return null;
        const models=prepare(group,input);if(!models)throw Error('Giriş–çıkış raporu bulunamadı.');const ctx=models[0].attendanceContext,current=()=>ctx.current()&&(!options.isCurrent||options.isCurrent());
        if(!current())throw Error('Rapor seçimi değişti.');
        if(root.ExcelJS?.Workbook)return root.fdOutputRenderers.excel(models,{...options,isCurrent:current});
        return(async()=>{const X=root.XLSX;if(!X?.utils)throw Error('Excel bileşeni yüklenemedi.');const wb=X.utils.book_new(),names=new Set();
            for(const model of models){if(!current())throw Error('Rapor seçimi değişti.');const source=root.fdOutputRenderers.workbook(model).workbook.Sheets.Liste,sheet={},offset=7;
                for(const[key,value]of Object.entries(source)){if(key.startsWith('!'))continue;const at=X.utils.decode_cell(key);sheet[X.utils.encode_cell({r:at.r+offset,c:at.c})]={...value};}
                const end=Math.max(1,model.columns.length-1),last=offset+model.rows.length;
                sheet['!cols']=source['!cols'];sheet['!ref']=X.utils.encode_range({s:{r:0,c:0},e:{r:last,c:end}});
                X.utils.sheet_add_aoa(sheet,[[model.title],...ctx.fields,[]],{origin:'A1'});
                if(model.footnotes.length)X.utils.sheet_add_aoa(sheet,[[],['Açıklamalar'],...model.footnotes.map(note=>[note])],{origin:{r:last+1,c:0}});
                sheet['!merges']=[{s:{r:0,c:0},e:{r:0,c:end}},...ctx.fields.map((_,i)=>({s:{r:i+1,c:1},e:{r:i+1,c:end}})).filter(m=>m.s.c<m.e.c)];
                sheet['!autofilter']={ref:X.utils.encode_range({s:{r:offset,c:0},e:{r:last,c:model.columns.length-1}})};sheet['!freeze']={xSplit:0,ySplit:8};sheet['!pageSetup']={orientation:model.columns.length>6?'landscape':'portrait',fitToWidth:1,fitToHeight:1};sheet['!margins']={left:.3,right:.3,top:.35,bottom:.35};
                let name=model.title.replace(/[\\/\[\]*?:]/g,' ').slice(0,31)||'Liste',suffix=1,base=name;while(names.has(norm(name)))name=base.slice(0,26)+' ('+(++suffix)+')';names.add(norm(name));X.utils.book_append_sheet(wb,sheet,name);
            }
            const bytes=X.write(wb,{type:'array',bookType:'xlsx'});if(!current())throw Error('Rapor seçimi değişti.');return{blob:new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),filename:text(options.filename||'Aylık_Giriş_Çıkış.xlsx'),workbook:wb};
        })();
    }
    root.fdAttendanceReportLayout={direct,prepare,excel,copyImage(group,input,options={}){
        if(!attendanceGroup(group))return null;
        if(options.copy===false)return render(input,{...options,imageOnly:true,preview:false});
        if(!root.navigator?.clipboard?.write||typeof root.ClipboardItem!=='function')throw Error('Bu cihazda panoya görüntü kopyalama desteklenmiyor.');
        let result;const pending=render(input,{...options,imageOnly:true,preview:false}).then(value=>{result=value;return value.blob;});pending.catch(()=>{});
        return root.navigator.clipboard.write([new root.ClipboardItem({'image/png':pending})]).then(()=>pending).then(()=>result);
    },pdf(group,input,options={}){
        if(!attendanceGroup(group))return null;
        const models=Array.isArray(input)?input:[];
        if(!models.length||models.some(model=>!Array.isArray(model?.columns)||!Array.isArray(model?.rows))||models.some(model=>!dailyModel(model)&&!summaryModel(model)))return null;
        return render(models,options);
    }};
})(typeof window!=='undefined'?window:globalThis);
