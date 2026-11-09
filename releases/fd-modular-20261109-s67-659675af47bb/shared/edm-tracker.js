(function(root){'use strict';
const settingsView="<section id=\"fdEdmConnectionSettings\" class=\"fd-edm-tracker\"><div class=\"ayarlar-panel-baslik\"><div><h3>EDM Bağlantısı ve Tarama Ayarları</h3><p>Portal bağlantısı ve geriye dönük kontrol tercihleri.</p></div></div>\n    <p>Portal: <a href=\"https://portal4.edmbilisim.com.tr/EFaturaUI/Login.aspx?\" target=\"_blank\" rel=\"noopener noreferrer\">EDM portalını aç</a></p>\n    <div class=\"form-row\"><div class=\"form-group\"><label for=\"fdEdmUsername\">EDM kullanıcı adı</label><input id=\"fdEdmUsername\" data-edm=\"username\" name=\"edm_account_identifier\" autocomplete=\"off\" data-case-preserve=\"true\"></div><div class=\"form-group\"><label for=\"fdEdmPassword\">EDM parolası</label><input id=\"fdEdmPassword\" data-edm=\"password\" name=\"edm_portal_secret\" type=\"password\" autocomplete=\"new-password\" data-case-preserve=\"true\"><small>Boş bırakırsanız aynı kullanıcı için kayıtlı parola korunur.</small></div></div>\n    <button type=\"button\" class=\"btn-submit\" data-edm=\"saveConnection\" data-edm-write>Bu tarayıcıda şifreli kaydet</button>\n    <p data-edm=\"vaultStatus\" aria-live=\"polite\"></p>\n    <small>Bağlantı bilgileri yalnız bu tarayıcıda saklanır. Başka bir cihazda yeniden tanımlamanız gerekir. Otomatik portal kontrolü henüz etkin değildir.</small>\n    <div class=\"form-row\"><div class=\"form-group\"><label for=\"fdEdmDays\">Her kontrolde geriye taranacak gün</label><input id=\"fdEdmDays\" data-edm=\"days\" type=\"number\" min=\"14\" max=\"365\" value=\"30\"><small>Geçmiş tarihli kesilen faturaları da kapsar.</small></div><div class=\"form-group\"><label for=\"fdEdmInterval\">Kontrol aralığı (dakika)</label><input id=\"fdEdmInterval\" data-edm=\"interval\" type=\"number\" min=\"5\" max=\"1440\" value=\"15\"></div></div>\n    <button type=\"button\" class=\"btn-submit\" data-edm=\"saveTiming\" data-edm-write>Tarama tercihlerini kaydet</button>\n  <p data-edm=\"status\" role=\"status\" aria-live=\"polite\"></p></section>",workspaceView="<section id=\"fdAlisFiyatPanel\" class=\"card fd-edm-tracker\" aria-label=\"EDM Alış Fiyat Takibi\">\n  <div class=\"card-header\"><h2>🧾 Alış Fiyat Takibi</h2></div>\n  <p>Faturaları takip edin; WhatsApp bildirimlerini firma ve alıcı bazında ayrıca belirleyin.</p>\n  <div class=\"fd-edm-tabs\" role=\"tablist\" aria-label=\"EDM işlemleri\">\n<button type=\"button\" role=\"tab\" id=\"fdEdmTabFirms\" data-edm-tab=\"firms\" aria-selected=\"true\" aria-controls=\"fdEdmPageFirms\">Takip Firmaları</button>\n    <button type=\"button\" role=\"tab\" id=\"fdEdmTabRecipients\" data-edm-tab=\"recipients\" aria-selected=\"false\" aria-controls=\"fdEdmPageRecipients\">WhatsApp Alıcıları</button>\n    <button type=\"button\" role=\"tab\" id=\"fdEdmTabRules\" data-edm-tab=\"rules\" aria-selected=\"false\" aria-controls=\"fdEdmPageRules\">Bildirim Kuralları</button>\n    <button type=\"button\" role=\"tab\" id=\"fdEdmTabPreview\" data-edm-tab=\"preview\" aria-selected=\"false\" aria-controls=\"fdEdmPagePreview\">Önizleme</button>\n  </div>\n  <div role=\"tabpanel\" id=\"fdEdmPageFirms\" data-edm-page=\"firms\" aria-labelledby=\"fdEdmTabFirms\">\n    <p>Buradaki tanımlar fatura takibini açar. WhatsApp bildirimi açılmaz.</p>\n    <div class=\"form-row\"><div class=\"form-group\"><label for=\"fdEdmVkn\">Vergi numarası</label><input id=\"fdEdmVkn\" data-edm=\"vkn\" inputmode=\"numeric\" maxlength=\"10\"></div><div class=\"form-group\"><label for=\"fdEdmFirmName\">Firma adı</label><input id=\"fdEdmFirmName\" data-edm=\"firmName\" data-case-preserve=\"true\"></div></div>\n    <label class=\"fd-edm-check\"><input type=\"checkbox\" data-edm=\"trackEnabled\" checked> Fatura takibi açık</label>\n    <button type=\"button\" class=\"btn-submit\" data-edm=\"saveFirm\" data-edm-write>Firmayı ekle / güncelle</button>\n    <div data-edm=\"firms\" class=\"fd-edm-list\"></div>\n  </div>\n  <div role=\"tabpanel\" id=\"fdEdmPageRecipients\" data-edm-page=\"recipients\" aria-labelledby=\"fdEdmTabRecipients\" hidden>\n    <p>Raporları alabilecek kişileri tanımlayın. Hangi firmaların raporunu alacaklarını Bildirim Kuralları’ndan seçin.</p>\n    <div class=\"form-row\"><div class=\"form-group\"><label for=\"fdEdmRecipientName\">Alıcı adı</label><input id=\"fdEdmRecipientName\" data-edm=\"recipientName\" data-case-preserve=\"true\"></div><div class=\"form-group\"><label for=\"fdEdmPhone\">WhatsApp numarası</label><input id=\"fdEdmPhone\" data-edm=\"phone\" type=\"tel\" placeholder=\"+90...\"></div></div>\n    <label class=\"fd-edm-check\"><input type=\"checkbox\" data-edm=\"recipientEnabled\" checked> Alıcı aktif</label>\n    <button type=\"button\" class=\"btn-submit\" data-edm=\"saveRecipient\" data-edm-write>Alıcıyı ekle / güncelle</button>\n    <div data-edm=\"recipients\" class=\"fd-edm-list\"></div>\n  </div>\n  <div role=\"tabpanel\" id=\"fdEdmPageRules\" data-edm-page=\"rules\" aria-labelledby=\"fdEdmTabRules\" hidden>\n    <p>Takip ettiğiniz firmalardan yalnız burada izin verdiklerinizin raporu seçilen alıcıya hazırlanır.</p>\n    <div class=\"form-row\"><div class=\"form-group\"><label for=\"fdEdmRuleFirm\">Takip firması</label><select id=\"fdEdmRuleFirm\" data-edm=\"ruleFirm\"></select></div><div class=\"form-group\"><label for=\"fdEdmRuleRecipient\">Rapor alıcısı</label><select id=\"fdEdmRuleRecipient\" data-edm=\"ruleRecipient\"></select></div></div>\n    <label class=\"fd-edm-check\"><input type=\"checkbox\" data-edm=\"ruleEnabled\"> Bu firma için bu alıcıya WhatsApp bildirimi açık</label>\n    <button type=\"button\" class=\"btn-submit\" data-edm=\"saveRule\" data-edm-write>Bildirim tercihini kaydet</button>\n    <div data-edm=\"rules\" class=\"fd-edm-list\"></div>\n  </div>\n  <div role=\"tabpanel\" id=\"fdEdmPagePreview\" data-edm-page=\"preview\" aria-labelledby=\"fdEdmTabPreview\" hidden>\n    <p>XML’den ürün ve hizmet satırları okunur. PDF’nin fatura numarası, ETTN’si ve satıcı VKN’si eşleştirilir. Dosyalar bu önizleme sırasında sunucuya yüklenmez.</p>\n    <div class=\"form-row\"><div class=\"form-group\"><label for=\"fdEdmXml\">Fatura XML dosyası</label><input id=\"fdEdmXml\" data-edm=\"xml\" type=\"file\" accept=\".xml,application/xml\"></div><div class=\"form-group\"><label for=\"fdEdmPdf\">Aynı faturanın PDF dosyası</label><input id=\"fdEdmPdf\" data-edm=\"pdf\" type=\"file\" accept=\".pdf,application/pdf\"></div></div>\n    <button type=\"button\" class=\"btn-modern btn-detail-modern\" data-edm=\"read\">Önizlemeyi Aç</button>\n    <small>Birden fazla XML’yi sırayla okuyarak bu oturumda son 10 alış karşılaştırmasını görebilirsiniz. Kalıcı fatura arşivi ve gerçek WhatsApp gönderimi bu ilk aşamada etkin değildir.</small>\n    <div data-edm=\"report\" class=\"fd-edm-report\"></div>\n  </div>\n  <p data-edm=\"status\" role=\"status\" aria-live=\"polite\"></p>\n</section>\n";
root.FDEdmTracker=Object.freeze({settingsView,workspaceView,create(options){const fdAyarDogrula=options.assert,fdAyarGecerli=options.current;async function fdAyarBekle(p){fdAyarDogrula();const v=await p;fdAyarDogrula();return v;}
// EDM first phase lives inside the existing Settings module and shares its lifecycle.
let fdEdmPanel=null,fdEdmEvents=null,fdEdmInvoices=[],fdEdmPdf=null,fdEdmBusy=false;
const fdEdmNs={b:'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',a:'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2'};
function fdEdmNode(node,path){return path.split('/').reduce((p,part)=>{const [prefix,name]=part.split(':');return p&&Array.from(p.children).find(e=>e.namespaceURI===fdEdmNs[prefix]&&e.localName===name)},node)}
function fdEdmText(node,path,fallback=''){return fdEdmNode(node,path)?.textContent.trim()||fallback}
function fdEdmDecimal(value){const s=String(value);if(!/^-?\d{1,20}(?:\.\d{1,12})?$/.test(s))throw Error('Geçersiz fatura sayısı.');const [a,b='']=s.split('.');return {n:BigInt(a+b),s:10n**BigInt(b.length)}}
function fdEdmDivide(a,b){a=fdEdmDecimal(a);b=fdEdmDecimal(b);if(b.n<=0n)throw Error('Fatura miktarı pozitif olmalı.');const n=a.n*b.s*100000000n/(a.s*b.n);return String(n/100000000n)+'.'+String(n%100000000n).padStart(8,'0')}
function fdEdmParse(xml){
    if(xml.length>20000000||/<!\s*(?:DOCTYPE|ENTITY)/i.test(xml))throw Error('XML boyutu veya DTD/entity içeriği uygun değil.');
    const doc=new DOMParser().parseFromString(xml,'application/xml'),r=doc.documentElement;
    if(doc.querySelector('parsererror')||r.localName!=='Invoice'||r.namespaceURI!=='urn:oasis:names:specification:ubl:schema:xsd:Invoice-2')throw Error('Geçerli UBL fatura XML dosyası seçin.');
    const invoice={id:fdEdmText(r,'b:UUID'),number:fdEdmText(r,'b:ID'),date:fdEdmText(r,'b:IssueDate'),currency:fdEdmText(r,'b:DocumentCurrencyCode'),type:fdEdmText(r,'b:InvoiceTypeCode'),supplier:fdEdmText(r,'a:AccountingSupplierParty/a:Party/a:PartyName/b:Name'),vkn:'',lines:[]};
    const party=fdEdmNode(r,'a:AccountingSupplierParty/a:Party');
    for(const el of Array.from(party?.children||[]).filter(x=>x.localName==='PartyIdentification'&&x.namespaceURI===fdEdmNs.a)){const id=fdEdmNode(el,'b:ID');if(id?.getAttribute('schemeID')==='VKN')invoice.vkn=id.textContent.trim()}
    if(!invoice.id||!invoice.number||!/^\d{10}$/.test(invoice.vkn)||!/^\d{4}-\d{2}-\d{2}$/.test(invoice.date))throw Error('Fatura numarası, ETTN, tarih veya vergi numarası eksik.');
    if(invoice.type!=='SATIS')throw Error('İade/istisna faturaları bu ilk aşamada ayrıca incelenmelidir.');
    if(Array.from(r.children).some(x=>x.namespaceURI===fdEdmNs.a&&x.localName==='AllowanceCharge'))throw Error('Belge düzeyi iskonto/masraf bulunan fatura için ayrı dağıtım kontrolü gerekiyor.');
    for(const line of Array.from(r.children).filter(e=>e.namespaceURI===fdEdmNs.a&&e.localName==='InvoiceLine')){
        const quantity=fdEdmText(line,'b:InvoicedQuantity'),amount=fdEdmText(line,'b:LineExtensionAmount'),unit=fdEdmNode(line,'b:InvoicedQuantity')?.getAttribute('unitCode')||'',code=fdEdmText(line,'a:Item/a:SellersItemIdentification/b:ID');
        if(fdEdmDecimal(amount).n<0n)throw Error('Negatif satır tutarı ayrıca incelenmelidir.');
        for(const node of [fdEdmNode(line,'b:LineExtensionAmount'),fdEdmNode(line,'a:Price/b:PriceAmount')])if(node?.getAttribute('currencyID')!==invoice.currency)throw Error('Satır ve fatura para birimi uyuşmuyor.');
        const net=fdEdmDivide(amount,quantity),name=fdEdmText(line,'a:Item/b:Name');
        invoice.lines.push({id:fdEdmText(line,'b:ID'),name,code,unit,quantity,amount,net,key:JSON.stringify([invoice.vkn,code||'REVIEW:'+name,unit,invoice.currency]),review:!code});
    }
    if(!invoice.lines.length||invoice.lines.length>300)throw Error('Fatura satır sayısı uygun değil.');
    invoice.payable=fdEdmText(r,'a:LegalMonetaryTotal/b:PayableAmount');
    fdEdmDecimal(invoice.payable);
    return invoice;
}
function fdEdmScope(){fdAyarDogrula();return JSON.stringify([activeUser.supabaseUserId||activeUser.id||activeUser.username,activeUser.sirketId])}
function fdEdmDb(){return new Promise((resolve,reject)=>{const request=indexedDB.open('fd-edm-private-v1',1);request.onupgradeneeded=()=>request.result.createObjectStore('connections',{keyPath:'scope'});request.onerror=()=>reject(Error('Şifreli tarayıcı kasası açılamadı.'));request.onsuccess=()=>resolve(request.result)})}
async function fdEdmVaultGet(){const scope=fdEdmScope(),db=await fdEdmDb();try{fdAyarDogrula();return await new Promise((resolve,reject)=>{const tx=db.transaction('connections'),r=tx.objectStore('connections').get(scope);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('Bağlantı kaydı okunamadı.'))})}finally{db.close()}}
async function fdEdmVaultSave(username,password){
    fdAyarDogrula(true);const scope=fdEdmScope(),existing=await fdEdmVaultGet();fdAyarDogrula(true);
    if(!password){if(!existing||existing.username!==username)throw Error('Yeni bağlantı için parola girin.');return}
    const key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']),iv=crypto.getRandomValues(new Uint8Array(12));fdAyarDogrula(true);
    const bytes=new TextEncoder().encode(password);let cipher;
    try{cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(scope)},key,bytes)}finally{bytes.fill(0)}
    fdAyarDogrula(true);const db=await fdEdmDb();try{
        fdAyarDogrula(true);if(scope!==fdEdmScope())throw Error('Oturum değişti.');
        await new Promise((resolve,reject)=>{const tx=db.transaction('connections','readwrite');tx.objectStore('connections').put({scope,username,key,iv,cipher,updatedAt:new Date().toISOString()});tx.oncomplete=resolve;tx.onerror=()=>reject(Error('Bağlantı kaydedilemedi.'));tx.onabort=()=>reject(Error('Bağlantı kaydı iptal edildi.'))});
        fdAyarDogrula(true);
    }finally{db.close()}
}
function fdEdmConfig(){const source=uygulamaAyarlari.edmAlisTakibi||{};return {lookbackDays:source.lookbackDays||30,intervalMinutes:source.intervalMinutes||15,suppliers:structuredClone(source.suppliers||[]),recipients:structuredClone(source.recipients||[]),rules:structuredClone(source.rules||[]),automaticImportEnabled:false}}
function fdEdmTargets(cfg,vkn){if(!cfg.suppliers.some(f=>f.vkn===vkn&&f.enabled))return [];return cfg.rules.filter(r=>r.vkn===vkn&&r.enabled).flatMap(r=>cfg.recipients.filter(p=>p.id===r.recipientId&&p.enabled))}
async function fdEdmPersist(cfg){fdAyarDogrula(true);const saved=await fdAyarBekle(sirketUygulamaAyarParcasiKaydet({edmAlisTakibi:cfg}));if(JSON.stringify(saved.edmAlisTakibi)!==JSON.stringify(cfg))throw Error('EDM ayarları sunucuda doğrulanamadı.');fdEdmRenderLists()}
function fdEdmEl(id){return fdEdmPanel?.querySelector('[data-edm="'+id+'"]')}
function fdEdmMessage(message,error=false){const e=fdEdmEl('status');if(e){e.textContent=message;e.dataset.error=String(error)}}
function fdEdmBind(el,event,callback){if(!el)return;el.addEventListener(event,async e=>{try{fdAyarDogrula();await callback(e)}catch(error){if(fdAyarGecerli())fdEdmMessage(error.message,true)}},{signal:fdEdmEvents.signal})}
function fdEdmRenderLists(){
    fdAyarDogrula();const cfg=fdEdmConfig();
    const render=(id,values,label)=>{const host=fdEdmEl(id);if(!host)return;host.replaceChildren();for(const row of values){const p=document.createElement('p');p.textContent=label(row);host.append(p)}if(!values.length)host.textContent='Henüz tanım yok.'};
    render('firms',cfg.suppliers,f=>f.vkn+' · '+f.name+' · Takip '+(f.enabled?'açık':'kapalı'));
    render('recipients',cfg.recipients,r=>r.name+' · '+r.phone+' · '+(r.enabled?'aktif':'pasif'));
    render('rules',cfg.rules,r=>r.vkn+' → '+(cfg.recipients.find(p=>p.id===r.recipientId)?.name||'Alıcı bulunamadı')+' · Bildirim '+(r.enabled?'açık':'kapalı'));
    for(const [id,items,label,value] of [['ruleFirm',cfg.suppliers,f=>f.name,f=>f.vkn],['ruleRecipient',cfg.recipients,r=>r.name,r=>r.id]]){const select=fdEdmEl(id);if(!select)continue;select.replaceChildren(new Option('Seçin',''));for(const item of items)select.add(new Option(label(item),value(item)))}
}
function fdEdmMoney(n){return Number(n).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function fdEdmUnit(unit){return {NT:'net ton',KGM:'kg',C62:'adet',TNE:'ton',LTR:'litre'}[unit]||unit}
function fdEdmRenderReport(){
    const host=fdEdmEl('report'),images=Array.from(host.querySelectorAll('[data-edm="pdfCanvas"]'));host.replaceChildren();const latest=fdEdmInvoices.at(-1);if(!latest)return;
    const heading=document.createElement('h3');heading.textContent='Fatura '+latest.number+' · '+latest.date;host.append(heading);
    const supplier=document.createElement('p');supplier.textContent=latest.supplier+' · VKN '+latest.vkn;host.append(supplier);
    const note=document.createElement('p');note.textContent='GÖNDERİLMEMİŞ ÖNİZLEME · KDV hariç net birim fiyatlar';host.append(note);
    host.append(...images);
    for(const line of latest.lines.filter((line,index,list)=>list.findIndex(x=>x.key===line.key)===index)){
        const title=document.createElement('h4');title.textContent=line.name+' · '+fdEdmMoney(line.net)+' '+latest.currency+'/'+fdEdmUnit(line.unit);host.append(title);
        const matches=fdEdmInvoices.filter(i=>i.date<=latest.date&&(!line.review||i===latest)).flatMap(i=>i.lines.filter(l=>l.key===line.key).map(l=>({invoice:i,line:l})));
        // Limit by invoices, retaining every same-product line price within each invoice.
        const grouped=new Map();for(const match of matches){const key=match.invoice.vkn+'|'+match.invoice.id;if(!grouped.has(key))grouped.set(key,{invoice:match.invoice,lines:[]});grouped.get(key).lines.push(match.line)}
        const history=Array.from(grouped.values()).sort((a,b)=>b.invoice.date.localeCompare(a.invoice.date)||b.invoice.number.localeCompare(a.invoice.number)).slice(0,10);
        const table=document.createElement('table'),head=table.createTHead().insertRow();for(const t of ['Tarih','Fatura numarası','Net birim fiyat']){const th=document.createElement('th');th.textContent=t;head.append(th)}
        const body=table.createTBody();for(const h of history){const row=body.insertRow(),prices=h.lines.map(l=>fdEdmMoney(l.net)+' '+h.invoice.currency).join(' / ');for(const value of [h.invoice.date,h.invoice.number,prices+(h.lines.length>1?' ('+h.lines.length+' satır)':'')])row.insertCell().textContent=value}host.append(table);
        const info=document.createElement('p');info.textContent=line.review?'Ürün kodu yok; otomatik eşleştirme için inceleme gerekiyor.':history.length===1?'1/10 fatura mevcut. İlk kayıt; geçmiş fiyat olmadığı için değişim hesaplanmadı.':history.length+'/10 fatura mevcut.';host.append(info);
    }
    const targets=fdEdmTargets(fdEdmConfig(),latest.vkn),footer=document.createElement('p');footer.textContent=targets.length?'Bu firma için '+targets.length+' bildirim alıcısı tanımlı. Bu aşamada gönderim yapılmaz.':'Bu firma için WhatsApp bildirimi kapalı. Takip tanımı gönderim izni oluşturmaz.';host.append(footer);
}
async function fdEdmImport(){
    if(fdEdmBusy)return;fdEdmBusy=true;const button=fdEdmEl('read');button.disabled=true;
    let loading=null;
    try{
        fdAyarDogrula();const xml=fdEdmEl('xml').files[0],pdf=fdEdmEl('pdf').files[0];if(!xml)throw Error('XML dosyasını seçin.');if(xml.size>20000000||pdf?.size>20000000)throw Error('Dosya en fazla 20 MB olabilir.');
        const raw=await fdAyarBekle(xml.text()),invoice=fdEdmParse(raw),digest=await fdAyarBekle(crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw)));invoice.hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
        const old=fdEdmInvoices.find(i=>i.id===invoice.id&&i.vkn===invoice.vkn);
        if(old&&old.hash!==invoice.hash)throw Error('Aynı ETTN için farklı XML bulundu; otomatik üzerine yazılmaz.');
        let canvases=[];
        if(pdf){
            if(typeof pdfjsLib==='undefined')throw Error('PDF görüntüleyici yüklenemedi.');
            pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            loading=pdfjsLib.getDocument({data:new Uint8Array(await fdAyarBekle(pdf.arrayBuffer())),isEvalSupported:false});fdEdmPdf=loading;
            const document=await fdAyarBekle(loading.promise);if(document.numPages>20)throw Error('En fazla 20 sayfalı örnek PDF seçin.');
            let fullText='';
            for(let n=1;n<=document.numPages;n++){
                const page=await fdAyarBekle(document.getPage(n)),content=await fdAyarBekle(page.getTextContent());fullText+=content.items.map(i=>i.str).join(' ')+'\n';
                const viewport=page.getViewport({scale:1.5}),canvas=window.document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;canvas.dataset.edm='pdfCanvas';
                await fdAyarBekle(page.render({canvasContext:canvas.getContext('2d'),viewport}).promise);
                const ctx=canvas.getContext('2d'),pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let bottom=0;
                for(let y=canvas.height-1;y>=0&&!bottom;y--)for(let x=0;x<canvas.width;x++){const p=(y*canvas.width+x)*4;if(pixels[p]<245||pixels[p+1]<245||pixels[p+2]<245){bottom=y+1;break}}
                if(bottom&&bottom+24<canvas.height){const cropped=window.document.createElement('canvas');cropped.width=canvas.width;cropped.height=Math.min(canvas.height,bottom+24);cropped.dataset.edm='pdfCanvas';cropped.getContext('2d').drawImage(canvas,0,0);canvases.push(cropped);canvas.width=canvas.height=0}else canvases.push(canvas);
            }
            for(const expected of [invoice.id,invoice.number,invoice.vkn])if(!fullText.includes(expected))throw Error('PDF ve XML fatura numarası/ETTN/VKN eşleşmiyor.');
        }
        if(!old)fdEdmInvoices.push(invoice);else fdEdmInvoices=fdEdmInvoices.filter(i=>i!==old).concat(old);
        fdEdmEl('report').replaceChildren(...canvases);fdEdmRenderReport();fdEdmMessage((old?'Aynı fatura yeniden eklenmedi. ':'Fatura okundu. ')+(pdf?'PDF ve XML kimlikleri eşleşti. ':'PDF seçilmedi. ')+'Bu oturumda '+fdEdmInvoices.length+' fatura var; arşive veya WhatsApp’a yazılmadı.');
    }finally{if(loading){await loading.destroy();if(fdEdmPdf===loading)fdEdmPdf=null}fdEdmBusy=false;if(fdAyarGecerli())button.disabled=false}
}
function fdEdmUnmount(){fdEdmEvents?.abort();fdEdmEvents=null;fdEdmPdf?.destroy();fdEdmPdf=null;fdEdmInvoices=[];fdEdmBusy=false;if(fdEdmPanel){fdEdmPanel.querySelectorAll('input').forEach(e=>e.value='');fdEdmPanel.remove()}fdEdmPanel=null}
function fdEdmMount(host){
    fdAyarDogrula();if(fdEdmPanel?.isConnected){fdEdmRenderLists();return;}
    fdEdmEvents=new AbortController();const template=document.createElement('template');template.innerHTML=options.view;fdEdmPanel=template.content.firstElementChild;
    host.append(fdEdmPanel);
    for(const button of fdEdmPanel.querySelectorAll('[data-edm-tab]'))fdEdmBind(button,'click',()=>{for(const b of fdEdmPanel.querySelectorAll('[data-edm-tab]'))b.setAttribute('aria-selected',String(b===button));for(const panel of fdEdmPanel.querySelectorAll('[data-edm-page]'))panel.hidden=panel.dataset.edmPage!==button.dataset.edmTab});
    const cfg=fdEdmConfig();if(fdEdmEl('days'))fdEdmEl('days').value=cfg.lookbackDays;if(fdEdmEl('interval'))fdEdmEl('interval').value=cfg.intervalMinutes;
    if(fdEdmEl('username'))fdEdmVaultGet().then(row=>{if(fdAyarGecerli()&&fdEdmPanel){fdEdmEl('username').value=row?.username||'';fdEdmEl('vaultStatus').textContent=row?'EDM bilgileri bu tarayıcıda şifreli kayıtlı. Portal bağlantısı henüz doğrulanmadı.':'EDM bilgileri henüz kaydedilmedi.'}}).catch(e=>{if(fdAyarGecerli())fdEdmMessage(e.message,true)});
    fdEdmBind(fdEdmEl('saveConnection'),'click',async()=>{fdAyarDogrula(true);const name=fdEdmEl('username').value.trim(),pass=fdEdmEl('password').value;try{if(!name)throw Error('Kullanıcı adı gerekli.');await fdEdmVaultSave(name,pass);fdEdmEl('vaultStatus').textContent='EDM bilgileri bu tarayıcıda şifreli kayıtlı. Portal bağlantısı henüz doğrulanmadı.';fdEdmMessage('Bağlantı bilgileri şifreli kaydedildi; EDM’ye giriş veya otomatik tarama yapılmadı.')}finally{if(fdAyarGecerli()&&fdEdmEl('password'))fdEdmEl('password').value=''}});
    fdEdmBind(fdEdmEl('saveTiming'),'click',async()=>{const c=fdEdmConfig(),days=Number(fdEdmEl('days').value),interval=Number(fdEdmEl('interval').value);if(!Number.isInteger(days)||days<14||days>365||!Number.isInteger(interval)||interval<5||interval>1440)throw Error('Geriye tarama 14-365 gün; aralık 5-1440 dakika olmalı.');c.lookbackDays=days;c.intervalMinutes=interval;await fdEdmPersist(c);fdEdmMessage('Tarama tercihleri kaydedildi. Otomatik tarama henüz bağlı değil.')});
    fdEdmBind(fdEdmEl('saveFirm'),'click',async()=>{const c=fdEdmConfig(),vkn=fdEdmEl('vkn').value.trim(),name=fdEdmEl('firmName').value.trim();if(!/^\d{10}$/.test(vkn)||!name)throw Error('10 rakamlı vergi numarası ve firma adı girin.');c.suppliers=c.suppliers.filter(f=>f.vkn!==vkn).concat({vkn,name,enabled:fdEdmEl('trackEnabled').checked});await fdEdmPersist(c);fdEdmMessage('Firma takibi kaydedildi. WhatsApp kuralı oluşturulmadı.')});
    fdEdmBind(fdEdmEl('saveRecipient'),'click',async()=>{const c=fdEdmConfig(),phone=fdEdmEl('phone').value.trim(),name=fdEdmEl('recipientName').value.trim();if(!/^\+[1-9]\d{7,14}$/.test(phone)||!name)throw Error('Alıcı adı ve +90... biçiminde numara girin.');c.recipients=c.recipients.filter(r=>r.id!==phone).concat({id:phone,phone,name,enabled:fdEdmEl('recipientEnabled').checked});await fdEdmPersist(c);fdEdmMessage('Alıcı kaydedildi. Hangi firmalar için bildirim alacağını ayrıca seçin.')});
    fdEdmBind(fdEdmEl('saveRule'),'click',async()=>{const c=fdEdmConfig(),vkn=fdEdmEl('ruleFirm').value,recipientId=fdEdmEl('ruleRecipient').value;if(!c.suppliers.some(f=>f.vkn===vkn)||!c.recipients.some(r=>r.id===recipientId))throw Error('Takip firması ve alıcı seçin.');c.rules=c.rules.filter(r=>!(r.vkn===vkn&&r.recipientId===recipientId)).concat({vkn,recipientId,enabled:fdEdmEl('ruleEnabled').checked});await fdEdmPersist(c);fdEdmMessage('Firma bazındaki bildirim tercihi kaydedildi. Bu aşamada gerçek gönderim yok.')});
    fdEdmBind(fdEdmEl('read'),'click',fdEdmImport);
    fdEdmRenderLists();
    if(!options.canWrite())for(const e of fdEdmPanel.querySelectorAll('[data-edm-write]'))e.disabled=true;
}


return Object.freeze({mount:fdEdmMount,dispose:fdEdmUnmount});}});
})(window);
