window.FDModules.define('aylikrapor',function(){
const real=window,initial=fdWordBelgeBaglami(),requests=new Set();let disposed=false;
const valid=r=>!disposed&&initial===fdWordBelgeBaglami()&&real.fdAylikRaporKayitli(r)&&r?.current();
async function execute(request){
 if(!valid(request)||!request.data||!request.helpers||!request.options)return false;requests.add(request);request.onCancel=()=>requests.delete(request);
 const check=()=>{if(!valid(request))throw Error('Rapor seçimi değişti. Çıktıyı yeniden açın.')},h=request.helpers,d=request.data;
 const output=(fn,args)=>{check();const before=real.document.getElementById('fdOrtakCiktiOnizleme'),value=fn(...args),node=real.document.getElementById('fdOrtakCiktiOnizleme');if(node&&(node!==before||node===request.output)){request.output=node;request.outputBlob=node._blob}check();return value};
 const root=new Proxy(real,{get(target,key){if(key==='fdOutputRenderers')return {...target.fdOutputRenderers,excel:async(models,options)=>{check();const value=await target.fdOutputRenderers.excel(models,{...options,preview:false,download:false});check();if(options.preview!==false){if(target.ExcelJS?.Workbook&&options.styled!==false&&typeof target.fdCiktiExcelJsOnizle==='function')output(target.fdCiktiExcelJsOnizle,[value.workbook,value.blob,value.filename]);else if(typeof target.fdCiktiExcelOnizle==='function')output(target.fdCiktiExcelOnizle,[value.workbook,value.filename]);}check();if(options.download===true&&typeof target.fdCiktiDogrudanKaydet==='function')target.fdCiktiDogrudanKaydet(value.blob,value.filename);return value}};if(key==='fdCiktiOnizlemeAc')return(...args)=>output(real.fdCiktiOnizlemeAc,args);if(key==='fdCiktiPdfOnizle')return(...args)=>output(real.fdCiktiPdfOnizle,args);return ['fetch','setTimeout','createImageBitmap'].includes(key)&&typeof target[key]==='function'?target[key].bind(target):target[key]}});
 const {attendanceGroup,unique,text,norm,A3_WIDTH,A3_HEIGHT,printable,summaryModel,panelHtml,withoutOptional}=h;
 const prepare=()=>{check();return d.models};
 const utils={};for(const[k,fn]of Object.entries(h.utils||{}))utils[k]=(...args)=>{check();return fn.apply(h.library.utils,args)};
 const XLSX={utils,writeFile:(...args)=>output(h.sink,args)};
 const document={getElementById:id=>id==='magicpassAy'?{value:d.month}:root.document.getElementById(id)};
 const magicpassRaporPersoneli=()=>d.person,magicpassAylikCizelgeVerisi=()=>d.list,magicpassRaporDosyaAdi=()=>d.filename;
 const {tarihFormati,fdAttendanceShiftDisplayLabel,magicpassCalismaSaatleriMetni,magicpassDakikaMetni,magicpassYapilanMesaiDakikasi,magicpassToplamCalismaDakikasi,magicpassMesaiTurlerineGoreTopla,fdAttendanceSummaryWorkbook,fdAttendanceMonthlySummary}=h;
 const showToast=(...a)=>{check();return real.showToast(...a)};
 const originalNativeExcel=function(){
        const personel=magicpassRaporPersoneli();if(!personel)return showToast('Önce soldaki listeden personel seçin.','warning');if(typeof XLSX==='undefined')return showToast('Excel kütüphanesi yüklenemedi.','error');
        const ay=document.getElementById('magicpassAy').value,liste=magicpassAylikCizelgeVerisi(personel,ay),toplam=a=>liste.reduce((t,k)=>t+Number(k[a]||0),0),satirlar=liste.map(k=>[tarihFormati(k.tarih),new Date(k.tarih+'T12:00:00').toLocaleDateString('tr-TR',{weekday:'long'}),fdAttendanceShiftDisplayLabel(k),magicpassCalismaSaatleriMetni(k,'giris'),magicpassCalismaSaatleriMetni(k,'cikis'),magicpassDakikaMetni(k.normal),magicpassDakikaMetni(k.gec),magicpassDakikaMetni(k.erken),magicpassDakikaMetni(magicpassYapilanMesaiDakikasi(k)),magicpassDakikaMetni(magicpassToplamCalismaDakikasi(k)),k.durum,(k.duzeltme?'MANUEL · ':'')+(k.uyarilar||[]).join(' · ')]);
        const hesap=magicpassMesaiTurlerineGoreTopla(liste);
        const veri=[['AYLIK PERSONEL GİRİŞ–ÇIKIŞ RAPORU'],['Personel',personel.ad||'-'],['Şube',personel.sube||'Merkez'],['Görev',personel.gorev||'-'],['Cihaz No',personel.cihazPersonelNo||'-'],['Dönem',ay],[],['Tarih','Gün','Vardiya','Giriş','Çıkış','Normal','Geç','Erken','Fazla Mesai','Toplam Çalışma','Durum','Açıklama'],...satirlar,[],['TOPLAM','','','','',magicpassDakikaMetni(toplam('normal')),magicpassDakikaMetni(hesap.gec),magicpassDakikaMetni(hesap.erken),magicpassDakikaMetni(liste.reduce((t,k)=>t+magicpassYapilanMesaiDakikasi(k),0)),magicpassDakikaMetni(liste.reduce((t,k)=>t+magicpassToplamCalismaDakikasi(k),0))]];
        const ws=XLSX.utils.aoa_to_sheet(veri),wb=XLSX.utils.book_new();ws['!cols']=[{wch:12},{wch:11},{wch:13},{wch:8},{wch:8},{wch:9},{wch:8},{wch:8},{wch:14},{wch:16},{wch:22},{wch:35}];ws['!pageSetup']={orientation:'landscape',paperSize:9,fitToWidth:1,fitToHeight:1};ws['!margins']={left:.2,right:.2,top:.3,bottom:.3,header:.1,footer:.1};ws['!printArea']='A1:L'+veri.length;XLSX.utils.book_append_sheet(wb,ws,'Giriş Çıkış');
        const bilgi=[['Personel',personel.ad||'-'],['Dönem',ay]],bilgiSayfasi=XLSX.utils.aoa_to_sheet(bilgi);bilgiSayfasi['!cols']=[{wch:28},{wch:24}];XLSX.utils.book_append_sheet(wb,bilgiSayfasi,'Rapor Bilgisi');
        fdAttendanceSummaryWorkbook(wb,fdAttendanceMonthlySummary(personel,liste,ay));
        XLSX.writeFile(wb,magicpassRaporDosyaAdi(personel,'xlsx'));showToast('Aylık giriş–çıkış Excel raporu hazırlandı.');
    };
 const photo=async function photo(ctx,check){
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
    };
 const originalRender=async function render(models,options) {
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
    };
 const originalExcel=function excel(group,input,options={}){
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
    };
 try{check();const options={...request.options,isCurrent:()=>valid(request)};const value=await(request.action==='native'?originalNativeExcel():request.action==='render'?originalRender(d.models,options):originalExcel(d.group,d.models,options));check();return{ok:true,value}}catch(error){return{ok:false,error}}
}
return{open:execute,api:{},dispose(){disposed=true;for(const r of [...requests])r.cancel();requests.clear()}};
});
