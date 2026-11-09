function pdfMetniniDuzelt(metin) {
        return String(metin || '').replace(/\u0000/g, ' ').replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
    }

function exportPuantajToExcel(){if(!window.fdExcelCiktiYetkisi())return;const workbook=XLSX.utils.book_new(),table=document.getElementById('puantajTablosu'),clone=puantajTablosunuExcelIcinHazirla();return window.fdExcelCiktiCagir.call(this,'payroll',[],table,{clone,workbook})}

function fdTabloGoruntuImzasi(table){return table?JSON.stringify([table.textContent,[...table.querySelectorAll('input,select,textarea')].map(n=>[n.value,n.checked]),[table,...table.querySelectorAll('tr,td,th')].map(n=>[n.className,n.closest('thead')?null:n.getAttribute('style')])]):null}

async function fdTabloGoruntuCagir(action,args){
        if(!window.fdTabloGoruntuYetkisi())return;
        const table=action==='canvas'?args[0]:document.getElementById('puantajTablosu'),scope=fdWordBelgeBaglami(),epoch=fdTabloGoruntuNesli,signature=fdTabloGoruntuImzasi(table),parent=table?.parentNode,connected=table?.isConnected;
        const initialOutput=action==='pdf'?document.getElementById('fdOrtakCiktiOnizleme'):null,controls=action==='canvas'?null:[document.getElementById('puanAySec'),document.getElementById('puanYilSec')],period=controls?.map(n=>n?.value),mode=action==='canvas'?null:puantajGorunumu;
        const keyed=table&&typeof table==='object',previous=keyed?fdTabloGoruntuTablolari.get(table):null;previous?.request.cancel();let releaseQueue;const turn=new Promise(resolve=>releaseQueue=resolve),queue=previous?.tail||Promise.resolve();
        let observer,overlayObserver,timer,owned=false,overlayTitle='',overlaySub='',overlay=null;
        const h={showGlobalOverlay,hideGlobalOverlay};
        const request={action,args,queue,output:null,outputBlob:null,finished:false,cancelled:false,
        contextCurrent(){return !request.cancelled&&fdTabloGoruntuKayitlari.has(request)&&epoch===fdTabloGoruntuNesli&&scope===fdWordBelgeBaglami()&&window.fdTabloGoruntuYetkisi()&&(!connected||(table.isConnected&&table.parentNode===parent))&&signature===fdTabloGoruntuImzasi(table)&&(action!=='pdf'||document.getElementById('fdOrtakCiktiOnizleme')===(request.output||initialOutput))&&(!controls||(mode===puantajGorunumu&&controls.every((n,i)=>n===document.getElementById(i?'puanYilSec':'puanAySec')&&n?.value===period[i])&&table===document.getElementById('puantajTablosu')))},
        current(){return request.contextCurrent()&&(!request.output||(request.output.isConnected&&request.output===document.getElementById('fdOrtakCiktiOnizleme')&&request.output._blob===request.outputBlob))},
        ownsOverlay(){return owned&&overlay?.isConnected&&overlay===document.getElementById('globalOverlay')&&document.getElementById('overlayTitle')?.textContent===overlayTitle&&document.getElementById('overlaySub')?.textContent===overlaySub},
        show(...a){if(!request.current())throw Error('Çıktı ekranı değişti.');if(overlay&&!request.ownsOverlay())throw Error('Çıktı işlemi değişti.');h.showGlobalOverlay(...a);overlay=document.getElementById('globalOverlay');overlayTitle=document.getElementById('overlayTitle')?.textContent||'';overlaySub=document.getElementById('overlaySub')?.textContent||'';owned=true;if(!overlayObserver){overlayObserver=new MutationObserver(()=>{if(owned){owned=false;request.cancel()}});for(const n of [document.getElementById('overlayTitle'),document.getElementById('overlaySub')])if(n)overlayObserver.observe(n,{childList:true,characterData:true,subtree:true});if(overlay)overlayObserver.observe(overlay,{attributes:true,attributeFilter:['style']});}overlayObserver.takeRecords();},
        hide(){const owns=request.ownsOverlay();owned=false;overlayObserver?.disconnect();overlayObserver=null;if(owns)h.hideGlobalOverlay();overlay=null;},
        later(fn,ms){timer=setTimeout(()=>{timer=null;if(request.current()&&request.ownsOverlay())fn();request.cancel()},ms);return timer},
        cancel(){if(request.cancelled)return;request.cancelled=true;clearTimeout(timer);timer=null;observer?.disconnect();request.hide();if(request.output){if(request.output._url)URL.revokeObjectURL(request.output._url);request.output._blob=null;request.output.remove()}request.output=null;request.outputBlob=null;request.args=null;request.onCancel?.();request.onCancel=null;fdTabloGoruntuKayitlari.delete(request)}};
        fdTabloGoruntuKayitlari.add(request);if(keyed)fdTabloGoruntuTablolari.set(table,{request,tail:queue.catch(()=>{}).then(()=>turn)});
        observer=new MutationObserver(()=>{if(!request.current())request.cancel()});observer.observe(document.body,{childList:true});
        try{const result=await FDModules.embedded('tablogoruntu',[request],this);if(result?.ok===false&&result.error)throw result.error;if(!request.current()||!result?.ok){if(action==='canvas')throw Error('Tablo görüntüsü oturumu değişti.');return;}request.finished=Boolean(request.output||timer);return result.value}finally{releaseQueue();request.args=null;if(!request.finished)request.cancel();if(keyed&&fdTabloGoruntuTablolari.get(table)?.request===request&&!request.finished)fdTabloGoruntuTablolari.delete(table)}
    }

async function exportPuantajToPDF(){return fdTabloGoruntuCagir.call(this,'pdf',[])}

function fdCiktiOnizlemeAc(tur,ad){
        const eski=document.getElementById('fdOrtakCiktiOnizleme');if(eski){if(eski._url)URL.revokeObjectURL(eski._url);eski.remove();}
        const m=document.createElement('div');m.id='fdOrtakCiktiOnizleme';m.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#0f172ac2;display:flex;align-items:center;justify-content:center;padding:16px';
        m.innerHTML='<div style="width:min(1240px,98vw);height:min(920px,97vh);background:#fff;border-radius:15px;overflow:hidden;display:flex;flex-direction:column"><div style="padding:11px 14px;border-bottom:1px solid #dbe5ef;display:flex;align-items:center;gap:9px;background:#f8fafc"><div style="min-width:0;flex:1"><strong data-cikti-baslik></strong><small data-cikti-ad style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#64748b"></small></div><button data-cikti-yazdir class="btn-modern btn-detail-modern">Yazdır</button><a data-cikti-kaydet class="btn-modern '+(tur==='excel'?'btn-excel':'btn-pdf')+'" style="opacity:.45;pointer-events:none">Kaydet</a><button data-cikti-kapat class="btn-cancel" style="width:auto">Kapat</button></div><div data-cikti-icerik style="flex:1;min-height:0;overflow:auto;background:#cbd5e1;padding:16px"><div style="margin:24px auto;width:max-content;padding:18px 24px;background:#fff;border-radius:10px;font-weight:700">Çıktı hazırlanıyor...</div></div></div>';
        m.querySelector('[data-cikti-baslik]').textContent=(tur==='excel'?'Excel':'PDF')+' Önizleme';m.querySelector('[data-cikti-ad]').textContent=ad||'';m._tur=tur;m.dosyaAdi=ad;m.katman=m;m.sayfalar=m.querySelector('[data-cikti-icerik]');const kapat=()=>{if(m._url)URL.revokeObjectURL(m._url);m.remove();};m.querySelector('[data-cikti-kapat]').onclick=kapat;m.onclick=e=>{if(e.target===m)kapat();};m.querySelector('[data-cikti-yazdir]').onclick=()=>fdCiktiYazdir(m);document.body.appendChild(m);return m;
    }

function fdCiktiBlobBagla(m,blob,ad){if(m._url)URL.revokeObjectURL(m._url);m._url=URL.createObjectURL(blob);m._blob=blob;m.dosyaAdi=ad;const a=m.querySelector('[data-cikti-kaydet]');a.href=m._url;a.download=ad;a.style.opacity='1';a.style.pointerEvents='auto';}

function fdCiktiPdfOnizle(blob,ad,m=null){m=m||fdCiktiOnizlemeAc('pdf',ad);m._tur='pdf';fdCiktiBlobBagla(m,blob,ad);const alan=m.querySelector('[data-cikti-icerik]');alan.style.padding='0';alan.innerHTML='<iframe title="PDF önizleme" style="display:block;width:100%;height:100%;border:0;background:#64748b"></iframe>';alan.querySelector('iframe').src=m._url;return m;}

function fdCiktiTablo(satirlar){const sar=document.createElement('div'),tablo=document.createElement('table');sar.style.cssText='overflow:auto;background:#fff;border:1px solid #cbd5e1;border-radius:9px';tablo.style.cssText='width:max-content;min-width:100%;border-collapse:collapse;font:12px Arial;color:#0f172a';(satirlar||[]).forEach((satir,r)=>{const tr=document.createElement('tr');(Array.isArray(satir)?satir:[]).forEach(deger=>{const td=document.createElement(r?'td':'th'),metin=deger instanceof Date?deger.toLocaleDateString('tr-TR'):deger&&typeof deger==='object'?(deger.text||deger.result||deger.formula||''):deger;td.textContent=metin==null?'':String(metin);td.style.cssText='border:1px solid #cbd5e1;padding:6px 8px;white-space:pre-wrap;vertical-align:top'+(r?'':';position:sticky;top:0;background:#e2e8f0;font-weight:800;z-index:1');tr.appendChild(td);});tablo.appendChild(tr);});sar.appendChild(tablo);return sar;}

function fdCiktiExcelOnizle(wb,ad,sec={}){const tur=String(ad||'').toLowerCase().endsWith('.xls')?'biff8':'xlsx',veri=XLSX.write(wb,{...sec,bookType:tur,type:'array'}),blob=new Blob([veri],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),m=fdCiktiOnizlemeAc('excel',ad),alan=m.querySelector('[data-cikti-icerik]');fdCiktiBlobBagla(m,blob,ad);alan.innerHTML='';alan.style.cssText+=';display:grid;gap:16px;align-content:start';(wb.SheetNames||[]).forEach(sayfa=>{const bolum=document.createElement('section'),h=document.createElement('h3');h.textContent=sayfa;h.style.cssText='margin:0 0 7px;color:#0f172a';bolum.append(h,fdCiktiTablo(XLSX.utils.sheet_to_json(wb.Sheets[sayfa],{header:1,defval:'',raw:false})));alan.appendChild(bolum);});return m;}

function fdCiktiExcelJsOnizle(wb,blob,ad){const m=fdCiktiOnizlemeAc('excel',ad),alan=m.querySelector('[data-cikti-icerik]');fdCiktiBlobBagla(m,blob,ad);alan.innerHTML='';alan.style.cssText+=';display:grid;gap:16px;align-content:start';wb.worksheets.forEach(ws=>{const bolum=document.createElement('section'),h=document.createElement('h3'),satirlar=[];h.textContent=ws.name;h.style.cssText='margin:0 0 7px;color:#0f172a';ws.eachRow({includeEmpty:false},r=>satirlar.push(r.values.slice(1)));bolum.append(h,fdCiktiTablo(satirlar));alan.appendChild(bolum);});return m;}

function fdCiktiDogrudanKaydet(blob,ad){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=ad;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}

function fdCiktiYazdir(m){if(m._tur==='pdf'){const f=m.querySelector('iframe');try{f?.contentWindow?.focus();f?.contentWindow?.print();}catch(_){showToast('PDF yazdırma penceresi açılamadı.','warning');}return;}const alan=m.querySelector('[data-cikti-icerik]'),w=window.open('','_blank','width=1100,height=800');if(!w)return showToast('Yazdırma penceresi engellendi.','warning');w.document.write('<!doctype html><html><head><title>Excel Önizleme</title><style>body{font-family:Arial;padding:16px}section{break-after:page}table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:5px;font-size:10px}th{background:#e2e8f0}</style></head><body>'+alan.innerHTML+'</body></html>');w.document.close();w.focus();setTimeout(()=>w.print(),300);}

function fdCiktiOnizlemeyiEtkinlestir(){
        if(window.XLSX&&!XLSX._fdOnizleme){XLSX._fdOnizleme=true;XLSX.writeFile=(wb,ad,sec)=>fdCiktiExcelOnizle(wb,ad||'Rapor.xlsx',sec||{});}
        if(typeof window.html2pdf==='function'&&!window.html2pdf._fdOnizleme){const eski=window.html2pdf,proto=eski.Worker?.prototype;if(proto)proto.save=function(ad){const dosyaAdi=ad||this.opt?.filename||'Rapor.pdf';return this.outputPdf('blob').then(blob=>fdCiktiPdfOnizle(blob,dosyaAdi));};else{const yeni=function(...args){const worker=eski.apply(this,args);worker.save=function(ad){const dosyaAdi=ad||worker.opt?.filename||'Rapor.pdf';return worker.outputPdf('blob').then(blob=>fdCiktiPdfOnizle(blob,dosyaAdi));};return worker;};Object.keys(eski).forEach(k=>{try{yeni[k]=eski[k];}catch(_){}});window.html2pdf=yeni;}window.html2pdf._fdOnizleme=true;}
    }

/* Shared output setup: invoked at the original source positions. */
window.FDOutputRuntimeStep = (function(__fdOutputSteps65){
 return function(__fdOutputStep65){ return __fdOutputSteps65[__fdOutputStep65].call(window); };
})([
function(){
window.fdExcelCiktiYetkisi=()=>Boolean(activeUser?.sirketId);
},
function(){
window.fdExcelCiktiKayitli=r=>fdExcelCiktiKayitlari.has(r);
},
function(){
window.fdExcelCiktiIptalEt=function(onlyInvalid=false){for(const r of [...fdExcelCiktiKayitlari])if(!onlyInvalid||!r.current())r.cancel();if(!onlyInvalid)fdExcelCiktiNesli++};
},
function(){
window.fdExcelCiktiCagir=function(action,args,table,data){
        if(!window.fdExcelCiktiYetkisi())return;
        const scope=fdWordBelgeBaglami(),epoch=fdExcelCiktiNesli,signature=fdTabloGoruntuImzasi(table),parent=table?.parentNode,connected=table?.isConnected,initialOutput=document.getElementById('fdOrtakCiktiOnizleme'),library=XLSX,sink=XLSX.writeFile;
        const controls=action==='payroll'?[document.getElementById('puanAySec'),document.getElementById('puanYilSec')]:null,period=controls?.map(n=>n?.value),mode=action==='payroll'?puantajGorunumu:null;
        for(const r of [...fdExcelCiktiKayitlari])if(!r.finished)r.cancel();let observer;
        const request={action,args,data,helpers:{library,sink,utils:{book_new:library.utils.book_new,book_append_sheet:library.utils.book_append_sheet,table_to_sheet:library.utils.table_to_sheet,aoa_to_sheet:library.utils.aoa_to_sheet}},output:null,outputBlob:null,finished:false,cancelled:false,
        contextCurrent(){return !request.cancelled&&fdExcelCiktiKayitlari.has(request)&&epoch===fdExcelCiktiNesli&&scope===fdWordBelgeBaglami()&&window.fdExcelCiktiYetkisi()&&signature===fdTabloGoruntuImzasi(table)&&(!connected||(table.isConnected&&table.parentNode===parent))&&(!controls||(table===document.getElementById('puantajTablosu')&&mode===puantajGorunumu&&controls.every((n,i)=>n===document.getElementById(i?'puanYilSec':'puanAySec')&&n?.value===period[i])))},
        current(){return request.contextCurrent()&&(request.finished||(fdExcelCiktiIstegi===request&&XLSX===library&&XLSX.writeFile===sink&&Object.entries(request.helpers?.utils||{}).every(([k,v])=>XLSX.utils[k]===v)))&&(request.output?(request.output.isConnected&&request.output===document.getElementById('fdOrtakCiktiOnizleme')&&request.output._blob===request.outputBlob):document.getElementById('fdOrtakCiktiOnizleme')===initialOutput)},
        cancel(){if(request.cancelled)return;request.cancelled=true;observer?.disconnect();if(request.output){if(request.output._url)URL.revokeObjectURL(request.output._url);request.output._blob=null;request.output.remove()}request.output=null;request.outputBlob=null;request.args=null;request.data=null;request.helpers=null;request.onCancel?.();request.onCancel=null;fdExcelCiktiKayitlari.delete(request);if(fdExcelCiktiIstegi===request)fdExcelCiktiIstegi=null}};
        fdExcelCiktiIstegi=request;fdExcelCiktiKayitlari.add(request);observer=new MutationObserver(()=>{if(!request.current())request.cancel()});observer.observe(document.body,{childList:true});
        return(async()=>{try{const result=await FDModules.embedded('excelcikti',[request],this);if(result?.ok===false&&result.error)throw result.error;if(!request.current()||!result?.ok)return;request.finished=Boolean(request.output);return result.value}finally{request.args=null;request.data=null;request.helpers=null;if(!request.finished)request.cancel()}})();
    };
},
function(){
window.fdTabloGoruntuYetkisi=()=>Boolean(activeUser?.sirketId);
},
function(){
window.fdTabloGoruntuKayitli=r=>fdTabloGoruntuKayitlari.has(r);
},
function(){
window.fdTabloGoruntuIptalEt=function(onlyInvalid=false){for(const r of [...fdTabloGoruntuKayitlari])if(!onlyInvalid||!r.current())r.cancel();if(!onlyInvalid)fdTabloGoruntuNesli++};
},
function(){
fdCiktiOnizlemeyiEtkinlestir();
},
function(){
document.addEventListener('keydown',function(event){if(event.key!=='Escape'||event.defaultPrevented)return;const cikti=document.getElementById('fdOrtakCiktiOnizleme');if(cikti){event.preventDefault();event.stopImmediatePropagation();cikti.querySelector('[data-cikti-kapat]')?.click();return;}const gorunen=[...document.querySelectorAll('.modal-overlay')].filter(m=>m.id!=='modalKvkkAydinlatma'&&(m.id!=='modalZorunluSifre'||!sifreDegistirmeZorunluMu)&&getComputedStyle(m).display!=='none');if(!gorunen.length)return;const ust=gorunen.sort((a,b)=>(Number(getComputedStyle(a).zIndex)||0)-(Number(getComputedStyle(b).zIndex)||0)||[...document.querySelectorAll('.modal-overlay')].indexOf(a)-[...document.querySelectorAll('.modal-overlay')].indexOf(b)).pop();event.preventDefault();event.stopImmediatePropagation();modalKapat(ust.id);},{capture:true});
}
]);
