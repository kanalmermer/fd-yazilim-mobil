window.FDModules.define('ayarlar',function(){

let fdAyarDisposed=false,fdAyarOverlay=false;
const fdAyarTimers=new Set();
function setTimeout(callback,delay,...args){const timer=window.setTimeout(()=>{fdAyarTimers.delete(timer);if(fdAyarGecerli())callback(...args)},delay);fdAyarTimers.add(timer);return timer}
function requestAnimationFrame(callback){return window.requestAnimationFrame(time=>{if(fdAyarGecerli())callback(time)})}
const fdAyarIlkOturum=fdAyarAnahtari();
function fdAyarAnahtari(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('ayarlar')])}
function fdAyarGecerli(){return !fdAyarDisposed&&fdAyarIlkOturum===fdAyarAnahtari()&&anaMenuModulErisimiVar('ayarlar')}
function fdAyarDogrula(write=false){if(!fdAyarGecerli())throw Error('Oturum değişti; Ayarlar ekranını yeniden açın.');if(write&&!anaMenuModulYazmaYetkisiVar('ayarlar'))throw Error('Bu modülde değişiklik yapma yetkiniz yok.')}
async function fdAyarBekle(promise){fdAyarDogrula();const result=await promise;fdAyarDogrula();return result}
function showGlobalOverlay(...args){fdAyarOverlay=true;return window.showGlobalOverlay(...args)}
function hideGlobalOverlay(){fdAyarOverlay=false;return window.hideGlobalOverlay()}
function cagir(body){fdAyarDogrula(body.action==='publish');return window.fdKvkkSettingsTransport.cagir(body,()=>fdAyarDogrula(body.action==='publish'))}
function hataMetni(...args){return window.fdKvkkSettingsTransport.hataMetni(...args)}
const esc=escapeDashboardText;
let anaMenuAyarTaslagi=[];
let fdAyarTamSablonOnizle;
const fdAyarIstekleri=new Set();
async function fdAyarWhatsappDurumunuOku(action){
 fdAyarDogrula();
 if(!['personnel-template-info','price-template-info'].includes(action))throw Error('Bu bağlantı yalnızca şablon durumunu okuyabilir.');
 if(!SUPABASE_MODE||!supabaseClient)throw Error('Meta durumunu görmek için güvenli oturum gerekli.');
 const {data,error}=await fdAyarBekle(supabaseClient.auth.getSession());if(error)throw error;
 const token=data?.session?.access_token;if(!token)throw Error('Oturum süresi dolmuş. Yeniden giriş yapın.');
 const controller=new AbortController();fdAyarIstekleri.add(controller);
 const timer=window.setTimeout(()=>controller.abort(),45000);
 try{
  const response=await fdAyarBekle(fetch(SUPABASE_URL+'/functions/v1/whatsapp-notification',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,apikey:SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify({action}),signal:controller.signal}));
  let result;try{result=await fdAyarBekle(response.json())}catch(error){fdAyarDogrula();throw Error('Şablon sunucusu geçerli yanıt vermedi ('+response.status+').')}
  if(!response.ok||result?.success!==true)throw Error(response.status===401?'Oturum doğrulanamadı. Yeniden giriş yapın.':response.status===403?'Bu hesapla şablon durumunu görme yetkisi bulunamadı.':String(result?.message||'Şablon servisine ulaşılamadı ('+response.status+').'));
  return result;
 }catch(error){if(error.name==='AbortError')throw Error('Meta durum sorgusu zaman aşımına uğradı. Durumu yenileyin.');throw error}
 finally{window.clearTimeout(timer);fdAyarIstekleri.delete(controller)}
}

/* Read-only, complete WhatsApp previews next to the editable message bodies. */
(function(root){
 'use strict';
 const state={key:'',epoch:0,loaded:0,promise:null,personnel:[],price:null,priceReady:false,priceRevision:'',error:'',priceError:''};
 const catalog=Array.isArray(root.fdPersonnelTemplateCatalog)?root.fdPersonnelTemplateCatalog:[];
 const signature='Kanal Mermer bildirim sisteminden gönderilmiştir.';
 function context(){if(!fdAyarGecerli())return '';const u=typeof activeUser!=='undefined'?activeUser:null;return u&&['Admin','Yonetici'].includes(u.rol)?[u.sirketId,u.supabaseUserId||u.id||u.tcNo,u.rol].join('|'):''}
 function content(name,message){let value=String(message||'').trim();for(const prefix of ['Sayın '+name+',',name+',']){if(name&&value.slice(0,prefix.length).toLocaleLowerCase('tr-TR')===prefix.toLocaleLowerCase('tr-TR')){value=value.slice(prefix.length).trimStart();break}}if(value.endsWith(signature))value=value.slice(0,-signature.length).trimEnd();return value}
 function render(template,message,title,price=false,name='{AD}'){
  const parts=Array.isArray(template?.components)?template.components:[],body=parts.find(p=>p.type==='BODY');
  if(!body?.text)return '';
  const two=body.text.includes('{{2}}')&&!body.text.includes('{{3}}');
  if(price)message=priceMessage(message,name);
  const parameters=(two&&!price?[name,content(name,message)]:[String(name).slice(0,120),price?'fiyat listesi':String(title).slice(0,80),String(message).slice(0,500)]).map(value=>String(value||'').replace(/[\r\n\t]+/g,' ').replace(/ {4,}/g,' ').trim());
  return parts.filter(p=>['HEADER','BODY','FOOTER'].includes(p.type)&&typeof p.text==='string').map(p=>p.text.replace(/\{\{\s*(\d+)\s*\}\}/g,(match,n)=>parameters[Number(n)-1]??match)).join('\n\n');
 }
 function priceMessage(message,name){
  const personalized=String(message??'').replaceAll('{AD}',(String(name??'').trim()||'Kullanıcı').slice(0,80));
  if(personalized.length<=500)return personalized;
  const url=(personalized.match(/https?:\/\/[^\s<>]+/g)||[]).at(-1)||'';
  if(url&&url.length<450&&personalized.lastIndexOf(url)+url.length>499)return personalized.slice(0,498-url.length).trimEnd()+'…\n'+url;
  return personalized.slice(0,499).trimEnd()+'…';
 }
 const metaEditor={host:null,dirty:false,busy:false,submitted:'',poll:null,polls:0};
 const metaTokens=text=>String(text||'').replace(/\{\{\s*1\s*\}\}/g,'{AD}').replace(/\{\{\s*2\s*\}\}/g,'{KONU}').replace(/\{\{\s*3\s*\}\}/g,'{MESAJ}');
 function metaFields(template){return Object.fromEntries(['header','body','footer'].map(name=>[name,metaTokens(template?.components?.find(p=>p.type===name.toUpperCase())?.text||'')]))}
 function metaDraft(){const draft={version:1};for(const name of ['header','body','footer'])draft[name]=String(metaEditor.host.querySelector('[data-meta-'+name+']').value||'').replace(/\r\n/g,'\n').trim();return draft}
 function metaKey(draft){return JSON.stringify(['header','body','footer'].map(name=>String(draft?.[name]||'').replace(/\r\n/g,'\n').trim()))}
 function metaValidate(draft){
  if(draft.header.length>60||draft.footer.length>60||/[{}]/.test(draft.header+draft.footer))throw Error('Başlık ve gönderici satırı en fazla 60 karakter olmalı; değişken içermemelidir.');
  if([...draft.body.matchAll(/\{(AD|KONU|MESAJ)\}/g)].map(x=>x[1]).join(',')!=='AD,KONU,MESAJ'||/[{}]/.test(draft.body.replace(/\{(?:AD|KONU|MESAJ)\}/g,''))||draft.body.replaceAll('{AD}','{{1}}').replaceAll('{KONU}','{{2}}').replaceAll('{MESAJ}','{{3}}').length>1024)throw Error('Şablon metni en fazla 1024 karakter olmalı; {AD}, {KONU}, {MESAJ} alanlarını bu sırayla birer kez içermelidir.');
 }
 function metaAdmin(){fdAyarDogrula(true);if(activeUser?.rol!=='Admin')throw Error('Şablonu yalnızca Admin düzenleyip Meta’ya gönderebilir.')}
 function metaPaint(){
  if(!fdAyarGecerli()||!metaEditor.host)return;
  const draft=metaDraft(),same=metaKey(draft)===metaKey(metaFields(state.price)),saved=metaKey(draft)===metaKey(uygulamaAyarlari.whatsappFiyatMetaTaslak),status=String(state.price?.status||''),admin=activeUser?.rol==='Admin'&&anaMenuModulYazmaYetkisiVar('ayarlar');
  const template={components:[...(draft.header?[{type:'HEADER',text:draft.header}]:[]),{type:'BODY',text:draft.body.replaceAll('{AD}','{{1}}').replaceAll('{KONU}','{{2}}').replaceAll('{MESAJ}','{{3}}')},...(draft.footer?[{type:'FOOTER',text:draft.footer}]:[])]};
  metaEditor.host.querySelector('[data-meta-preview]').innerHTML=format(render(template,document.getElementById('ayarMagicBildirimFiyatDegisiklik')?.value||'','Fiyat Listesi Güncellemesi',true));
  const message=state.priceError||(!state.price?'Önce güncel Meta şablonunu yükleyin.':same&&status==='APPROVED'&&state.priceReady?'Onaylı · Meta’daki şablonla aynı':same&&status==='REJECTED'?'Meta reddetti · Taslağı düzenleyip tekrar gönderebilirsiniz.':['PENDING','IN_APPEAL'].includes(status)?'Meta onayı bekleniyor.':metaEditor.submitted===metaKey(draft)?'Başvuru Meta’ya iletildi · Güncel durum bekleniyor.':'Taslak · Henüz Meta’ya gönderilmedi.');
  metaEditor.host.querySelector('[data-meta-status]').textContent=message+(metaEditor.dirty?' · Kaydedilmemiş değişiklik':saved?' · Taslak kayıtlı':'');
  for(const input of metaEditor.host.querySelectorAll('input,textarea'))input.disabled=!admin||metaEditor.busy;
  for(const b of metaEditor.host.querySelectorAll('button'))b.disabled=metaEditor.busy||(b.dataset.metaAction!=='current'&&!admin)||(b.dataset.metaAction==='submit'&&(Boolean(state.priceError)||!state.priceRevision||!state.price||!['APPROVED','REJECTED','PAUSED'].includes(status)||metaEditor.submitted===metaKey(draft)));
  if(same&&status==='APPROVED')metaEditor.submitted='';
  const waiting=['PENDING','IN_APPEAL'].includes(status)||Boolean(metaEditor.submitted&&!same);
  if(waiting&&!metaEditor.poll&&metaEditor.polls<40&&!metaEditor.host.hidden){metaEditor.poll=setTimeout(()=>{metaEditor.poll=null;metaEditor.polls++;const card=metaEditor.host.closest('.fd-wa-message-accordion');if(fdAyarGecerli()&&card?.open&&!metaEditor.host.hidden)load(true)},45000)}
  else if(!waiting&&metaEditor.poll){window.clearTimeout(metaEditor.poll);fdAyarTimers.delete(metaEditor.poll);metaEditor.poll=null}
 }
 async function metaPersist(draft){metaAdmin();metaValidate(draft);const stored=await fdAyarBekle(sirketUygulamaAyarParcasiKaydet({whatsappFiyatMetaTaslak:draft}));metaAdmin();if(!fdAyarAyniDeger(stored.whatsappFiyatMetaTaslak,draft))throw Error('Şablon taslağı sunucuda doğrulanamadı.');metaEditor.dirty=false}
 async function metaSubmit(draft){
  metaAdmin();metaValidate(draft);if(!state.priceRevision)throw Error('Meta şablonunu yenileyip tekrar deneyin.');
  const expectedRevision=state.priceRevision,{data,error}=await fdAyarBekle(supabaseClient.auth.getSession());if(error)throw error;const token=data?.session?.access_token;if(!token)throw Error('Oturum süresi doldu. Yeniden giriş yapın.');
  metaAdmin();const controller=new AbortController();fdAyarIstekleri.add(controller);const timer=window.setTimeout(()=>controller.abort(),45000);
  try{const response=await fdAyarBekle(fetch(SUPABASE_URL+'/functions/v1/whatsapp-notification',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,apikey:SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify({action:'price-template-update',draft,expectedRevision}),signal:controller.signal}));const result=await fdAyarBekle(response.json());metaAdmin();if(!response.ok||result?.success!==true)throw Error(result?.message||'Meta başvuruyu kabul etmedi.');return result}
  catch(error){if(error?.name==='AbortError'||error instanceof TypeError)throw Error('Başvuru sonucu doğrulanamadı. Yeniden göndermeden önce Durumu yenile düğmesini kullanın.');throw error}
  finally{window.clearTimeout(timer);fdAyarIstekleri.delete(controller)}
 }
 async function metaAction(action){
  if(metaEditor.busy)return;
  try{fdAyarDogrula(action!=='current');if(action!=='current')metaAdmin();if(action==='current'&&metaEditor.dirty)throw Error('Kaydedilmemiş taslağınız var. Önce Taslağı Kaydet düğmesini kullanın.');metaEditor.busy=true;metaPaint();
   if(action==='current'){await load(true);fdAyarDogrula();if(state.priceError||!state.price)throw Error(state.priceError||'Güncel Meta şablonu alınamadı.');const values=metaFields(state.price);for(const name of ['header','body','footer'])metaEditor.host.querySelector('[data-meta-'+name+']').value=values[name];metaEditor.dirty=false;metaEditor.submitted=''}
   else {const draft=metaDraft();await metaPersist(draft);if(action==='submit'){const result=await metaSubmit(draft);metaEditor.submitted=result.submitted?metaKey(draft):'';metaEditor.polls=0;showToast(result.submitted?'Şablon Meta’ya gönderildi. Onay durumu burada güncellenecek.':'Şablon Meta’daki metinle aynı; tekrar başvuru gönderilmedi.','success');await load(true)}else showToast('Şablon taslağı kaydedildi. Meta’ya henüz gönderilmedi.','success')}
  }catch(error){if(fdAyarGecerli())showToast(error.message||String(error),'error')}
  finally{if(fdAyarGecerli()){metaEditor.busy=false;metaPaint()}}
 }
 function metaOpen(card){
  fdAyarDogrula();if(metaEditor.host){metaEditor.host.hidden=!metaEditor.host.hidden;metaPaint();return}
  const host=document.createElement('fieldset');host.className='fd-wa-timing';host.dataset.priceMetaEditor='1';host.style.marginTop='14px';host.innerHTML='<legend>WhatsApp Şablonunu Düzenle</legend><p style="margin:0 0 12px;color:#64748b;font-size:.8rem">Başlığı, karşılama metnini ve kapanışı buradan değiştirebilirsiniz. Taslağı kaydetmek Meta’ya göndermez; başvuru için ayrı düğmeyi kullanın.</p><div class="form-group"><label>Başlık</label><input data-meta-header maxlength="60" data-case-preserve="true"></div><div class="form-group"><label>Şablon metni</label><textarea data-meta-body rows="8" maxlength="1100" data-case-preserve="true"></textarea><small>{AD}: alıcı adı · {KONU}: fiyat listesi · {MESAJ}: yukarıdaki fiyat değişikliği metni. Bu üç alanı sırayla birer kez koruyun; aralarındaki metinleri değiştirebilirsiniz.</small></div><div class="form-group"><label>Gönderici / Kapanış</label><input data-meta-footer maxlength="60" data-case-preserve="true"></div><p data-meta-status role="status" style="font-weight:700;color:#0369a1"></p><div style="border:1px solid #c9e3da;border-radius:9px;padding:14px;background:#f3faf6"><strong>Taslak önizleme</strong><pre data-meta-preview style="white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;line-height:1.7"></pre></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button type="button" class="btn-submit" style="width:auto;margin:0" data-meta-action="save">Taslağı Kaydet</button><button type="button" class="btn-submit" style="width:auto;margin:0;background:#0369a1" data-meta-action="submit">Meta’ya Onaya Gönder</button><button type="button" class="btn-cancel" style="width:auto;margin:0" data-meta-action="current">Meta’daki Şablonu Getir</button></div><small>İnceleme süresince fiyat bildirimleri bekleyebilir. Onay durumu bu ekran açıkken otomatik yenilenir.</small>';
  const actions=card.querySelector(':scope > .fd-wa-card-actions');card.insertBefore(host,actions||null);metaEditor.host=host;
  const saved=uygulamaAyarlari.whatsappFiyatMetaTaslak,values=saved?.version===1&&['header','body','footer'].every(k=>typeof saved[k]==='string')?saved:metaFields(state.price);for(const name of ['header','body','footer'])host.querySelector('[data-meta-'+name+']').value=values[name];
  host.addEventListener('input',()=>{metaEditor.dirty=true;metaPaint()});for(const button of host.querySelectorAll('button'))button.onclick=()=>metaAction(button.dataset.metaAction);metaPaint();
 }

 function paint(){if(!fdAyarGecerli())return;
  document.querySelectorAll('textarea[id^="ayarMagicBildirim"]').forEach(input=>{
   const box=input.closest('.fd-wa-message-card')?.querySelector('.fd-wa-full-template');if(!box)return;
   const price=input.id==='ayarMagicBildirimFiyatDegisiklik',key='magicpassBildirim'+input.id.slice('ayarMagicBildirim'.length)+'Metni';
   const entry=catalog.find(e=>e.key===key),item=state.personnel.find(e=>e.key===key),template=price?state.price:item?.template;
   const label=box.querySelector('strong'),status=box.querySelector('small'),pre=box.querySelector('pre');
   const lookupError=price?state.priceError:state.error;
   const approved=!lookupError&&(price?template?.status==='APPROVED'&&template?.category==='UTILITY'&&state.priceReady:item?.ready===true);
   const changed=!price&&entry&&input.value.replace(/\r\n/g,'\n').trim()!==entry.text;
   label.textContent=approved?'WhatsApp’a gidecek tam mesaj':template?.status==='REJECTED'?'Meta tarafından reddedilen şablon':template?'Onay sonrası tam mesaj':'Hazırlanan tam mesaj';
   status.textContent=changed?'Düzenlenen metin gönderim şablonundan farklı; yeni Meta onayı gerekir.':lookupError||(!price&&item?.status==='NOT_SUBMITTED'?'Henüz onaya gönderilmedi':template?(approved?'Onaylı'+(template.category==='MARKETING'?' · Pazarlama':''):template.status==='REJECTED'?(item?.rejectedReason==='INCORRECT_CATEGORY'?'Kategori nedeniyle reddedildi · Meta’da inceleme gerekiyor':'Reddedildi · Gönderim bekletiliyor'):template.category!==entry?.payload?.category&&!price?'Meta kategorisi farklı · Gönderim bekletiliyor':template.status==='PENDING'?'Meta onayı bekleniyor':String(template.status||'Onay doğrulanamadı')):'Şablon kontrol ediliyor…');
   if(price&&approved){const saved=String(uygulamaAyarlari[key]||VARSAYILAN_UYGULAMA_AYARLARI[key]||'').replace(/\r\n/g,'\n').trim();status.textContent+=' · '+(input.value.replace(/\r\n/g,'\n').trim()===saved?'Kayıtlı metin':'Kaydedilmemiş değişiklik');}
   status.setAttribute('role','status');
   box.querySelector('button').disabled=Boolean(state.promise);
   let full='';
   if(price)full=template?render(template,input.value,'Fiyat Listesi Güncellemesi',true):'Tam mesaj henüz doğrulanamadı.';
   else if(template)full=(template.components||[]).filter(p=>['HEADER','BODY','FOOTER'].includes(p.type)&&typeof p.text==='string').map(p=>p.text.replace(/\{\{\s*(\d+)\s*\}\}/g,(match,n)=>entry?.variables[Number(n)-1]?'{'+entry.variables[Number(n)-1]+'}':match)).join('\n\n');
   else full=entry?.text||'Tam mesaj henüz doğrulanamadı.';
   pre.innerHTML=format(full);
   if(price)metaPaint();

  });
  fdWhatsappMesajOzetleriniGuncelle();
 }
 async function load(force=false){
  const key=context();if(!key)return;
  if(state.key!==key){state.key=key;state.epoch++;state.loaded=0;state.promise=null;state.personnel=[];state.price=null;state.priceReady=false;state.priceRevision='';state.error='';state.priceError=''}
  if(state.promise)return state.promise;if(!force&&Date.now()-state.loaded<60000){paint();return}
  const epoch=state.epoch;state.error='Şablon durumu kontrol ediliyor…';state.priceError=state.error;paint();
  const valid=()=>context()===key&&state.key===key&&state.epoch===epoch;
  const promise=(async()=>{
   try{
    const [p,f]=await Promise.allSettled([fdAyarWhatsappDurumunuOku('personnel-template-info'),fdAyarWhatsappDurumunuOku('price-template-info')]);
    if(!valid())return;
    if(p.status==='fulfilled'){state.personnel=Array.isArray(p.value.items)?p.value.items:[];state.error=state.personnel.length?'':'Personel şablon bilgisi boş döndü. Durumu yenileyin.'}else state.error='Personel şablonları: '+String(p.reason?.message||'Bağlantı kurulamadı.');
    if(f.status==='fulfilled'){state.priceReady=f.value.ready===true;state.priceRevision=String(f.value.templateRevision||'');state.price=(f.value.templates||[]).find(t=>t.name===f.value.templateName&&t.language==='tr')||null;state.priceError=state.price?'':'Fiyat şablonu Meta hesabında bulunamadı.'}else state.priceError='Fiyat şablonu: '+String(f.reason?.message||'Bağlantı kurulamadı.');
    state.loaded=p.status==='fulfilled'&&f.status==='fulfilled'?Date.now():0;
   }catch(error){if(!valid())return;state.error='Şablon durumu: '+String(error.message||error);state.priceError=state.error}
   finally{if(valid()){state.promise=null;paint()}}
  })();state.promise=promise;paint();return promise;
 }
 function format(value){
  if(typeof root.fdWhatsappMetniBicimle==='function')return root.fdWhatsappMetniBicimle(value);
  return String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])).replace(/\*([^*\n]+)\*/g,'<strong>$1</strong>').replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s).,!?:;])/g,'$1<em>$2</em>');
 }
 function install(){
  if(!context())return;
  
  document.querySelectorAll('textarea[id^="ayarMagicBildirim"]').forEach(input=>{
   const card=input.closest('.fd-wa-message-card');if(!card||card.querySelector('.fd-wa-full-template'))return;
   const price=input.id==='ayarMagicBildirimFiyatDegisiklik';
   input.maxLength=price?500:1024;
   input.rows=6;input.classList.add('fd-wa-template-input');
   const box=document.createElement('section');box.className='fd-wa-full-template';box.innerHTML='<div><strong></strong><small></small><button type="button">Durumu yenile</button></div><pre></pre>';
   card.append(box);
   if(price){
    const note=document.createElement('small');note.className='fd-wa-price-note';note.textContent='Kaydettiğiniz metin yeni fiyat değişikliği bildirimlerinde kullanılır. Aşağıdaki önizleme, WhatsApp’ın onaylı başlık, karşılama ve kapanışıyla birlikte tam mesajı gösterir.';input.after(note);
    const tools=document.createElement('div');tools.style.marginTop='12px';const edit=document.createElement('button');edit.type='button';edit.className='btn-cancel';edit.style.cssText='width:auto;margin:0';edit.textContent='Başlık ve Şablon Metnini Düzenle';edit.dataset.priceMetaOpen='1';edit.onclick=()=>metaOpen(card);tools.append(edit);box.after(tools);
   }
   const actions=card.querySelector(':scope > .fd-wa-card-actions');if(actions)card.appendChild(actions);
   input.addEventListener('input',paint);box.querySelector('button').onclick=()=>load(true);
  });paint();return load();
 }
 fdAyarTamSablonOnizle=root.fdWhatsappTamSablonOnizle={install,refresh:()=>load(true),update:paint,render,content,format};
})(window);


function ayarlarBolumAc(panelId,buton){
fdAyarDogrula(false);

        if(document.getElementById('ayarlarPanelModuller')?.classList.contains('active'))anaMenuAyarTaslaginiFormdanOku();
        document.querySelectorAll('#ayarlarApp .ayarlar-panel').forEach(panel=>panel.classList.toggle('active',panel.id===panelId));
        document.querySelectorAll('#ayarlarApp .ayarlar-sol-menu button').forEach(btn=>{const aktif=btn===buton;btn.classList.toggle('active',aktif);if(aktif)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');});
    }

function siparisAyarBirimSeciminiYenile(secili){
fdAyarDogrula(false);

        const alan=document.getElementById('ayarSiparisBirimleri'),select=document.getElementById('ayarSiparisVarsayilanBirim');if(!select)return;
        const birimler=siparisAyarBirimleriniDuzelt(alan?.value),onceki=String(secili||select.value||uygulamaAyarlari?.siparisVarsayilanBirim||'ADET').toLocaleUpperCase('tr-TR');
        select.innerHTML=birimler.map(birim=>'<option value="'+escapeDashboardText(birim)+'">'+escapeDashboardText(birim)+'</option>').join('');select.value=birimler.includes(onceki)?onceki:birimler[0];
    }

function whatsappVardiyaSubeSeciminiCiz(){
fdAyarDogrula(false);

        const alan=document.getElementById('ayarWhatsappVardiyaSubeleri');if(!alan)return;
        const secili=new Set(whatsappVardiyaSubeleriniDuzelt()),subeler=[...new Set((Array.isArray(personeller)?personeller:[]).filter(p=>aktifSirketeAit(p)&&!p.cikisTarihi).map(p=>String(p.sube||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));
        alan.innerHTML=subeler.map(sube=>'<label style="display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid #dbe4ee;border-radius:8px;background:#fff;cursor:pointer"><input type="checkbox" value="'+escapeDashboardText(sube)+'" '+(secili.has(sube)?'checked':'')+' style="width:17px;height:17px"><span>'+escapeDashboardText(sube)+'</span></label>').join('')||'<div style="color:#64748b;padding:8px 0">Aktif personel şubesi bulunamadı.</div>';
    }

function whatsappVardiyaSubeSecilenleriniOku(){
fdAyarDogrula(false);

        return [...document.querySelectorAll('#ayarWhatsappVardiyaSubeleri input:checked')].map(input=>String(input.value||'').trim()).filter(Boolean);
    }

function ozelAyarPanelleriniKur(whatsappPanel,siparisPanel){
fdAyarDogrula(false);

        if(whatsappPanel&&!document.getElementById('ayarWhatsappGonderimDetayi')&&!document.getElementById('ayarWhatsappVardiyaAksam')){
            const detay=document.createElement('details');detay.id='ayarWhatsappGonderimDetayi';detay.className='profile-section';detay.innerHTML='<summary>WhatsApp Gönderim Kuralları</summary><div><div class="form-row"><div class="form-group"><label>İzin Mesajlarını Otomatik Gönder</label><select id="ayarWhatsappIzinAktif"><option value="true">Evet</option><option value="false">Hayır</option></select></div><div class="form-group"><label>İzin Düzeltme Bekleme Süresi (Dakika)</label><input id="ayarWhatsappIzinBekleme" type="number" min="0" max="120" step="1"><small>Bu sürede izin değiştirilirse kuyruktaki eski mesaj son kayıtla değiştirilir.</small></div></div><div class="form-row"><div class="form-group"><label>Vardiya Mesajlarını Otomatik Gönder</label><select id="ayarWhatsappVardiyaAktif"><option value="true">Evet</option><option value="false">Hayır</option></select></div><div class="form-group"><label>Aynı Gün Vardiya Gönderim Saati</label><input id="ayarWhatsappVardiyaAksam" type="time"></div></div><div class="form-group"><label>Vardiya Mesajı Gönderilecek Şubeler</label><div id="ayarWhatsappVardiyaSubeleri" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:7px;margin-top:6px"></div><small>İşaretlediğiniz şubelerde vardiya listesi kaydedildiğinde, vardiyası değişsin veya değişmesin listedeki tüm personele mesaj hazırlanır. Personel kartında vardiya mesajı kapalı olanlar atlanır. Hiç şube seçilmezse vardiya mesajı gönderilmez.</small></div><div class="form-group"><label>Akşam Saati Geçildiyse Ertesi Gün Gönderim Saati</label><input id="ayarWhatsappVardiyaErtesi" type="time"><small>Örneğin vardiya saat 20.00’den sonra kaydedilirse mesaj ertesi gün seçilen saatte gönderilir.</small></div><div style="padding:9px 11px;border:1px solid #bae6fd;border-radius:8px;background:#f0f9ff;color:#075985;font-size:.76rem;line-height:1.5">Bekleyen mesajları <strong>WhatsApp Mesajları → Gönderim Kuyruğu</strong> bölümünden görebilir ve iptal edebilirsiniz.</div></div>';const panelBasligi=whatsappPanel.querySelector(':scope > .ayarlar-panel-baslik');if(panelBasligi)panelBasligi.after(detay);else whatsappPanel.appendChild(detay);
        }
        if(siparisPanel&&!document.getElementById('ayarSiparisTakipDetayi')){
            const detay=document.createElement('details');detay.id='ayarSiparisTakipDetayi';detay.className='profile-section';detay.innerHTML='<summary>Sipariş Takibi Genel Ayarları</summary><div><div class="form-group"><label>Kullanılacak Ürün Birimleri</label><textarea id="ayarSiparisBirimleri" rows="3" data-case-preserve="true" placeholder="ADET, KASA, TON" oninput="siparisAyarBirimSeciminiYenile()"></textarea><small>Virgül veya yeni satırla ayırın. Ürün kartındaki birim listesinde görünür.</small></div><div class="form-row"><div class="form-group"><label>Varsayılan Ürün Birimi</label><select id="ayarSiparisVarsayilanBirim"></select></div><div class="form-group"><label>Gecikmiş Sayılması İçin Tolerans (Gün)</label><input id="ayarSiparisGecikmeTolerans" type="number" min="0" max="365" step="1"><small>0 seçilirse termin tarihi geçer geçmez gecikmiş sayılır.</small></div></div><div class="form-row"><div class="form-group"><label>Tamamlananları Ana Tabloda Göster</label><select id="ayarSiparisTamamlananGoster"><option value="false">Hayır, yalnızca detayda göster</option><option value="true">Evet</option></select></div><div class="form-group"><label>Ürün Detayında Varsayılan Tarih Aralığı</label><select id="ayarSiparisDetayGun"><option value="0">Tüm kayıtlar</option><option value="30">Son 30 gün</option><option value="90">Son 90 gün</option><option value="180">Son 180 gün</option><option value="365">Son 1 yıl</option></select></div></div></div>';siparisPanel.appendChild(detay);
        }
    }

function ozelAyarFormlariniDoldur(){
fdAyarDogrula(false);

        const yaz=(id,deger)=>{const alan=document.getElementById(id);if(alan)alan.value=String(deger??'');};
        yaz('ayarWhatsappIzinAktif',uygulamaAyarlari.whatsappIzinOtomatikAktif!==false);yaz('ayarWhatsappIzinBekleme',Number(uygulamaAyarlari.whatsappIzinBeklemeDakika??3));
        yaz('ayarWhatsappVardiyaAktif',uygulamaAyarlari.whatsappVardiyaOtomatikAktif!==false);yaz('ayarWhatsappVardiyaAksam',uygulamaAyarlari.whatsappVardiyaAksamSaati||'20:00');yaz('ayarWhatsappVardiyaErtesi',uygulamaAyarlari.whatsappVardiyaErtesiGunSaati||'10:00');whatsappVardiyaSubeSeciminiCiz();
        const birimler=siparisAyarBirimleriniDuzelt();yaz('ayarSiparisBirimleri',birimler.join(', '));siparisAyarBirimSeciminiYenile(uygulamaAyarlari.siparisVarsayilanBirim||'ADET');
        yaz('ayarSiparisGecikmeTolerans',Number(uygulamaAyarlari.siparisGecikmeToleransGunu??0));yaz('ayarSiparisTamamlananGoster',Boolean(uygulamaAyarlari.siparisTamamlananlariGoster));yaz('ayarSiparisDetayGun',Number(uygulamaAyarlari.siparisDetayVarsayilanGun??0));
    }

function ayarlarModulListesiniFiltrele(deger){
fdAyarDogrula(false);

        const liste=document.getElementById('ayarlarModulListesi');if(!liste)return;
        const aranan=String(deger||'').toLocaleLowerCase('tr-TR').trim();let gorunen=0;
        liste.querySelectorAll('.ayarlar-modul-satiri').forEach(satir=>{const eslesir=!aranan||String(satir.textContent||'').toLocaleLowerCase('tr-TR').includes(aranan);satir.hidden=!eslesir;if(eslesir)gorunen++;});
        const sayac=document.getElementById('ayarlarModulSayac');if(sayac)sayac.textContent=gorunen+' / '+liste.querySelectorAll('.ayarlar-modul-satiri').length+' modül';
    }

function ayarlarModulAktifDurumunuGuncelle(input){
fdAyarDogrula(false);

        const durum=input?.closest('.ayarlar-modul-satiri')?.querySelector('.ayarlar-modul-durum');if(!durum)return;
        durum.textContent=input.checked?'Aktif':'Kapalı';durum.classList.toggle('pasif',!input.checked);
    }

function ayarlarArayuzunuDuzenle(){
fdAyarDogrula(false);

        const kart=document.querySelector('#ayarlarApp .ayarlar-ana-kart'),form=document.getElementById('uygulamaAyarlariForm');if(!kart||!form)return;
        if(form.dataset.duzenlendi==='1'&&document.getElementById('ayarlarPanelModuller'))return;
        form.dataset.duzenlendi='1';const eskiBaslik=kart.querySelector(':scope > .card-header'),eskiAciklama=kart.querySelector(':scope > p');
        const ust=document.createElement('div');ust.className='ayarlar-ust';ust.innerHTML='<div><h2>⚙️ Şirket Uygulama Ayarları</h2><p></p></div><span class="badge" style="background:#dbeafe;color:#1d4ed8">'+escapeDashboardText(activeUser?.sirketAdi||'Seçili şirket')+'</span>';kart.insertBefore(ust,form);eskiBaslik?.remove();eskiAciklama?.remove();
        const detaylar=[...form.querySelectorAll(':scope > details.profile-section')],kaydet=form.querySelector(':scope > div:last-child'),kabuk=document.createElement('div');kabuk.className='ayarlar-kabuk';kabuk.innerHTML='<nav class="ayarlar-sol-menu"><button type="button" onclick="ayarlarBolumAc(\'ayarlarPanelModuller\',this)">🧩 Ana Menü ve Yetkiler</button><button type="button" onclick="ayarlarBolumAc(\'ayarlarPanelPersonel\',this)">👥 Personel ve Çalışma</button><button type="button" onclick="ayarlarBolumAc(\'ayarlarPanelWhatsapp\',this)">💬 WhatsApp</button><button type="button" onclick="ayarlarBolumAc(\'ayarlarPanelSiparis\',this)">📦 Sipariş Takibi</button><button type="button" onclick="ayarlarBolumAc(\'ayarlarPanelOperasyon\',this)">🚚 Operasyon Modülleri</button><button type="button" onclick="ayarlarBolumAc(\'ayarlarPanelSistem\',this)">🔔 Sistem ve Belgeler</button><button type="button" onclick="ayarlarBolumAc(\'ayarlarPanelAktarim\',this)">📥 Veri Aktarımı</button></nav><div class="ayarlar-icerik"><section id="ayarlarPanelModuller" class="ayarlar-panel"><div class="ayarlar-panel-baslik"><div><h3>Ana Menü Modülleri ve Kullanıcı Yetkileri</h3><p>Admin her aktif modülde otomatik tam yetkilidir. Kullanıcı ve Personel için rol varsayılanı belirleyin; yalnızca gerektiğinde kişiye özel istisna ekleyin.</p></div></div><div id="ayarlarModulListesi" class="ayarlar-modul-listesi"></div></section><section id="ayarlarPanelPersonel" class="ayarlar-panel"><div class="ayarlar-panel-baslik"><div><h3>Personel ve Çalışma Ayarları</h3><p>Prim, puantaj, izin ve vardiya kuralları.</p></div></div></section><section id="ayarlarPanelWhatsapp" class="ayarlar-panel"><div class="ayarlar-panel-baslik"><div><h3>WhatsApp ve Gönderim Kuyruğu</h3><p>Otomatik mesajların çalışma şeklini, bekleme süresini, gönderim saatlerini ve mesaj metinlerini yönetin.</p></div></div></section><section id="ayarlarPanelSiparis" class="ayarlar-panel"><div class="ayarlar-panel-baslik"><div><h3>Sipariş Takibi Ayarları</h3><p>Ürün birimleri, gecikme hesabı ve ana tablo görünümünü yönetin.</p></div></div></section><section id="ayarlarPanelOperasyon" class="ayarlar-panel"><div class="ayarlar-panel-baslik"><div><h3>Operasyon Modülü Ayarları</h3><p>Araç, irsaliye ve ihracat süreçlerinde kullanılacak varsayılanlar.</p></div></div></section><section id="ayarlarPanelSistem" class="ayarlar-panel"><div class="ayarlar-panel-baslik"><div><h3>Sistem ve Belge Ayarları</h3><p>Hatırlatmalar ve belge sınırları.</p></div></div></section><section id="ayarlarPanelAktarim" class="ayarlar-panel"><div class="ayarlar-panel-baslik"><div><h3>Veri Aktarımı</h3><p>Toplu kayıt ve şablon işlemleri.</p></div></div></section></div>';
        form.insertBefore(kabuk,kaydet);const modulPanel=kabuk.querySelector('#ayarlarPanelModuller'),modulListesi=kabuk.querySelector('#ayarlarModulListesi'),personel=kabuk.querySelector('#ayarlarPanelPersonel'),whatsapp=kabuk.querySelector('#ayarlarPanelWhatsapp'),siparis=kabuk.querySelector('#ayarlarPanelSiparis'),operasyon=kabuk.querySelector('#ayarlarPanelOperasyon'),sistem=kabuk.querySelector('#ayarlarPanelSistem'),aktarim=kabuk.querySelector('#ayarlarPanelAktarim');
        if(modulPanel&&modulListesi){const araclar=document.createElement('div');araclar.className='ayarlar-modul-araclar';araclar.innerHTML='<input id="ayarlarModulAra" type="search" placeholder="Modül adı veya açıklaması ara..." oninput="ayarlarModulListesiniFiltrele(this.value)"><span id="ayarlarModulSayac"></span>';modulPanel.insertBefore(araclar,modulListesi);}
        detaylar.forEach(detay=>{detay.open=false;const baslik=String(detay.querySelector('summary')?.textContent||'');if(/WhatsApp Otomatik/i.test(baslik))whatsapp.appendChild(detay);else if(/Toplu Aktarım|Bulut Yedekleme/i.test(baslik))aktarim.appendChild(detay);else if(/Prim|Puantaj|İzin Ayarları|Personel Tarih|Günlük Rapor|Kart Okuma/i.test(baslik))personel.appendChild(detay);else if(/Araç|Taşıma|İhracat/i.test(baslik))operasyon.appendChild(detay);else sistem.appendChild(detay);});
        ozelAyarPanelleriniKur(whatsapp,siparis);
        if(!form.dataset.akordeonKuruldu){form.dataset.akordeonKuruldu='1';form.addEventListener('toggle',event=>{const acilan=event.target;if(!(acilan instanceof HTMLDetailsElement)||!acilan.matches('details.profile-section')||!acilan.open)return;const panel=acilan.closest('.ayarlar-panel');panel?.querySelectorAll('details.profile-section[open]').forEach(detay=>{if(detay!==acilan)detay.open=false;});},true);}
        if(!sistem.querySelector('details')){[...kabuk.querySelectorAll('.ayarlar-sol-menu button')].find(b=>b.getAttribute('onclick')?.includes('ayarlarPanelSistem'))?.remove();sistem.remove();}if(kaydet)kaydet.className='ayarlar-kaydet-cubugu';window.ayarlarBolumAc('ayarlarPanelModuller',kabuk.querySelector('.ayarlar-sol-menu button'));
    }

function irsaliyeAyarBirimDegerleri() {
fdAyarDogrula(false);

        return [...new Set([...document.querySelectorAll('#ayarIrsaliyeBirimListesi .ayar-irsaliye-birim')].map(input => String(input.value || '').trim().toLocaleUpperCase('tr-TR')).filter(Boolean))];
    }

function irsaliyeAyarVarsayilanSecenegiGuncelle() {
fdAyarDogrula(false);

        const select = document.getElementById('ayarIrsaliyeVarsayilanBirim');
        if (!select) return;
        const onceki = String(select.value || uygulamaAyarlari.irsaliyeVarsayilanBirim || '').toLocaleUpperCase('tr-TR');
        const birimler = irsaliyeAyarBirimDegerleri();
        select.innerHTML = birimler.map(birim => `<option value="${escapeDashboardText(birim)}">${escapeDashboardText(birim)}</option>`).join('');
        if (birimler.length) select.value = birimler.includes(onceki) ? onceki : birimler[0];
    }

function irsaliyeAyarBirimSatiriEkle(deger = '') {
fdAyarDogrula(false);

        const liste = document.getElementById('ayarIrsaliyeBirimListesi');
        if (!liste) return;
        const satir = document.createElement('div'); satir.className = 'irsaliye-birim-satiri';
        const input = document.createElement('input'); input.className = 'ayar-irsaliye-birim'; input.value = String(deger || '').toLocaleUpperCase('tr-TR'); input.required = true; input.placeholder = 'Birim adı';
        input.addEventListener('input', irsaliyeAyarVarsayilanSecenegiGuncelle);
        const sil = document.createElement('button'); sil.type = 'button'; sil.className = 'btn-modern btn-del-modern'; sil.textContent = '🗑️ Sil';
        sil.addEventListener('click', () => { if (liste.children.length <= 1) return alert('En az bir birim bulunmalıdır.'); satir.remove(); irsaliyeAyarVarsayilanSecenegiGuncelle(); });
        satir.append(input, sil); liste.appendChild(satir);
    }

function irsaliyeAyarBirimListesiniDoldur() {
fdAyarDogrula(false);

        const liste = document.getElementById('ayarIrsaliyeBirimListesi'); if (!liste) return;
        liste.innerHTML = ''; irsaliyeBirimleriniDuzelt().forEach(irsaliyeAyarBirimSatiriEkle); irsaliyeAyarVarsayilanSecenegiGuncelle();
        const secili = String(uygulamaAyarlari.irsaliyeVarsayilanBirim || 'TON').toLocaleUpperCase('tr-TR');
        if ([...document.getElementById('ayarIrsaliyeVarsayilanBirim').options].some(o => o.value === secili)) document.getElementById('ayarIrsaliyeVarsayilanBirim').value = secili;
    }

function irsaliyeAyarBirimiEkle() {
fdAyarDogrula(false);

        const alan = document.getElementById('ayarYeniIrsaliyeBirim');
        const deger = String(alan?.value || '').trim().toLocaleUpperCase('tr-TR');
        if (!deger) return alert('Eklenecek birim adını yazın.');
        if (irsaliyeAyarBirimDegerleri().includes(deger)) return alert('Bu birim zaten listede.');
        irsaliyeAyarBirimSatiriEkle(deger); alan.value = ''; irsaliyeAyarVarsayilanSecenegiGuncelle();
    }

function aracAyarTurDegerleri() {
fdAyarDogrula(false);
 return [...document.querySelectorAll('#ayarAracTurListesi .ayar-arac-turu')].map(x => String(x.value || '').trim()).filter(Boolean); }

function aracAyarTurSatiriEkle(deger = '') {
fdAyarDogrula(false);

        const liste=document.getElementById('ayarAracTurListesi'); if(!liste)return;
        const satir=document.createElement('div');satir.className='irsaliye-birim-satiri';
        satir.innerHTML=`<input class="ayar-arac-turu" value="${escapeDashboardText(String(deger||''))}" placeholder="Araç türü" required><button type="button" class="btn-modern btn-del-modern">🗑️ Sil</button>`;
        satir.querySelector('button').onclick=()=>{if(liste.children.length<=1)return alert('En az bir araç türü bulunmalıdır.');satir.remove();};liste.appendChild(satir);
    }

function aracAyarTurListesiniDoldur(){
fdAyarDogrula(false);
const liste=document.getElementById('ayarAracTurListesi');if(!liste)return;liste.innerHTML='';aracTurleriniDuzelt().forEach(aracAyarTurSatiriEkle);}

function aracAyarTuruEkle(){
fdAyarDogrula(false);
const alan=document.getElementById('ayarYeniAracTuru'),deger=String(alan?.value||'').trim();if(!deger)return alert('Eklenecek araç türünü yazın.');if(aracAyarTurDegerleri().some(x=>personelExcelBasliginiNormallestir(x)===personelExcelBasliginiNormallestir(deger)))return alert('Bu araç türü zaten listede.');aracAyarTurSatiriEkle(deger);alan.value='';}

async function aracTurleriniAyricaKaydet() {
try{
fdAyarDogrula(true);

        if (!isManagerUser()) return showToast('Araç takip ayarlarını değiştirme yetkiniz yok.', 'error');
        const aracTurleri = aracAyarTurDegerleri();
        if (!aracTurleri.length) return showToast('En az bir araç türü bulunmalıdır.', 'warning');
        const benzersizTurler = aracTurleriniDuzelt(aracTurleri);
        if (benzersizTurler.length !== aracTurleri.length) return showToast('Aynı araç türü birden fazla kez yazılmış.', 'warning');
        const aracAyarlari = {
            aracHatirlatmaGunu:Math.min(365, Math.max(1, Number(document.getElementById('ayarAracHatirlatmaGunu')?.value || 45))),
            aracBakimKmAraligi:Math.max(1000, paraMetniniSayiyaCevir(document.getElementById('ayarAracBakimKmAraligi')?.value || 10000)),
            aracBakimAyAraligi:Math.min(60, Math.max(1, Number(document.getElementById('ayarAracBakimAyAraligi')?.value || 12))),
            aracYakitRaporYilSayisi:Math.min(20, Math.max(1, Number(document.getElementById('ayarAracYakitRaporYilSayisi')?.value || 7))),
            aracTurleri:benzersizTurler
        };
        const buton = document.getElementById('ayarAracTurKaydetBtn');
        if (buton) buton.disabled = true;
        showGlobalOverlay('Araç takip ayarları kaydediliyor', 'Araç türleri ve takip değerleri uygulanıyor...');
        try {
            await fdAyarBekle(sirketUygulamaAyarParcasiKaydet(aracAyarlari));
            aracAyarTurListesiniDoldur();
            aracTurSecenekleriniYenile();
            showToast('Araç takip ayarlarının tamamı kaydedildi.');
        } catch (error) {
if(!fdAyarGecerli())return;

            console.error('Araç takip ayarları kaydedilemedi:', error);
            showToast('Araç takip ayarları kaydedilemedi: ' + (error?.message || 'Bilinmeyen hata'), 'error');
        } finally {
if(fdAyarGecerli()){

            hideGlobalOverlay();
            if (buton) buton.disabled = false;
        
}
}
    
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
}

function alanAdiTescilAyarlariniFormdanOku(){
fdAyarDogrula(false);

        return alanAdiTescilAyarlariniDuzelt({aktif:document.getElementById('ayarAlanAdiTescilAktif')?.value==='true',token:document.getElementById('ayarAlanAdiTescilToken')?.value,styleType:document.getElementById('ayarAlanAdiTescilKonum')?.value,imgsize:document.getElementById('ayarAlanAdiTescilBoyut')?.value,position:'fixed'});
    }

async function alanAdiTescilBelgesiniOnizle(){
try{
fdAyarDogrula(false);
const ayar=alanAdiTescilAyarlariniFormdanOku(),gosterildi=await fdAyarBekle(alanAdiTescilBelgesiniGoster(ayar));showToast(gosterildi?'Tescil belgesi rozeti seçtiğiniz konumda gösterildi.':'Rozet gösterilemedi. Ayarlar bölümündeki durum bilgisini kontrol edin.',gosterildi?'success':'warning');
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
}

async function alanAdiTescilAyariniKaydet(buton){
try{
fdAyarDogrula(true);

        if(!isManagerUser())return showToast('Bu ayarı değiştirme yetkiniz yok.','error');const ayar=alanAdiTescilAyarlariniFormdanOku(),eski=buton?.innerHTML;if(buton){buton.disabled=true;buton.textContent='Kaydediliyor...';}
        showGlobalOverlay('Tescil belgesi ayarı kaydediliyor','Rozet ayarı uygulanıyor...');
        try{await fdAyarBekle(sirketUygulamaAyarParcasiKaydet({alanAdiTescilBelgesi:ayar}));await fdAyarBekle(alanAdiTescilBelgesiniGoster(ayar));showToast('Alan adı tescil belgesi ayarı kaydedildi.','success');}
        catch(error){
if(!fdAyarGecerli())return;
showToast('Tescil belgesi ayarı kaydedilemedi: '+(error.message||error),'error');}
        finally{
if(fdAyarGecerli()){
hideGlobalOverlay();if(buton){buton.disabled=false;buton.innerHTML=eski;}
}
}
    
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
}

function ayarlarFormunuDoldur() {
fdAyarDogrula(false);

        anaMenuAyarTaslagi=anaMenuModulAyarlariniDuzelt();
        ayarlarModulListesiniCiz();
        document.getElementById('ayarPrimTutari').value = ayarSayisi('primTutari', 2000).toLocaleString('tr-TR');
        document.getElementById('ayarPrimDevamsizlikSiniri').value = ayarSayisi('primDevamsizlikSiniri', 1.5);
        document.getElementById('ayarPrimYarimGunEksikMesai').value = ayarSayisi('primYarimGunEksikMesaiDakika', 210);
        document.getElementById('ayarGunlukCalismaSaati').value = ayarSayisi('gunlukCalismaSaati', 7.5);
        document.getElementById('ayarMesaiKatsayisi').value = ayarSayisi('mesaiKatsayisi', 1.5);
        document.getElementById('ayarMesaiYuvarlama').value = String(ayarSayisi('mesaiYuvarlamaAdimi', 0.5));
        fdMesaiMahsupAyarlariniFormaYaz();
        document.getElementById('ayarVarsayilanIzinSebebi').value = uygulamaAyarlari.varsayilanIzinSebebi || VARSAYILAN_UYGULAMA_AYARLARI.varsayilanIzinSebebi;
        document.getElementById('ayarDogumIzinGunu').value = ayarSayisi('dogumIzinGunu', 5);
        document.getElementById('ayarEvlenmeIzinGunu').value = ayarSayisi('evlenmeIzinGunu', 3);
        document.getElementById('ayarOlumIzinGunu').value = ayarSayisi('olumIzinGunu', 3);
        document.getElementById('ayarHatirlatmaGunu').value = ayarSayisi('hatirlatmaGunu', 45);
        document.getElementById('ayarPdfAzamiMb').value = ayarSayisi('pdfAzamiMb', 10);

        document.getElementById('ayarAracHatirlatmaGunu').value = ayarSayisi('aracHatirlatmaGunu', 45);
        document.getElementById('ayarAracBakimKmAraligi').value = ayarSayisi('aracBakimKmAraligi', 10000).toLocaleString('tr-TR');
        document.getElementById('ayarAracBakimAyAraligi').value = ayarSayisi('aracBakimAyAraligi', 12);
        document.getElementById('ayarAracYakitRaporYilSayisi').value = ayarSayisi('aracYakitRaporYilSayisi', 7);
        aracAyarTurListesiniDoldur();
        document.getElementById('ayarIrsaliyeFaturaSuresi').value = ayarSayisi('irsaliyeFaturaSuresi', 7);
        irsaliyeAyarBirimListesiniDoldur();
        document.getElementById('ayarIrsaliyeAciklamaSablonu').value = uygulamaAyarlari.irsaliyeAciklamaSablonu || VARSAYILAN_UYGULAMA_AYARLARI.irsaliyeAciklamaSablonu;
        document.getElementById('ayarIhracatParaBirimi').value = uygulamaAyarlari.ihracatVarsayilanParaBirimi || 'USD';
        document.getElementById('ayarIhracatSatisTuru').value = ihracatSatisTurunuDuzelt(uygulamaAyarlari.ihracatVarsayilanSatisTuru);
	        document.getElementById('ayarIhracatToplamaModu').value = uygulamaAyarlari.ihracatVarsayilanToplamaModu || 'olcu';
	        document.getElementById('ayarIhracatNetKgKatsayisi').value = ayarSayisi('ihracatNetKgKatsayisi', 28);
	        document.getElementById('ayarIhracatBrutKgEkleme').value = ayarSayisi('ihracatBrutKgEkleme', 30);
	        document.getElementById('ayarIhracatGorselAzamiMb').value = ayarSayisi('ihracatGorselAzamiMb', 10);
        document.getElementById('ayarIhracatGorselSayisi').value = ayarSayisi('ihracatCekiBasinaAzamiGorsel', 20);
        const ayarDegeriYaz = (id, deger) => { const alan = document.getElementById(id); if (alan) alan.value = deger; };
        ayarDegeriYaz('ayarVardiyaGunduzBaslik', uygulamaAyarlari.vardiyaGunduzBaslik || VARSAYILAN_UYGULAMA_AYARLARI.vardiyaGunduzBaslik);
        ayarDegeriYaz('ayarVardiyaGeceBaslik', uygulamaAyarlari.vardiyaGeceBaslik || VARSAYILAN_UYGULAMA_AYARLARI.vardiyaGeceBaslik);
        ayarDegeriYaz('ayarMagicGunduzBaslangic', uygulamaAyarlari.magicpassGunduzBaslangic || '08:00');
        ayarDegeriYaz('ayarMagicGunduzBitis', uygulamaAyarlari.magicpassGunduzBitis || '17:00');
        ayarDegeriYaz('ayarMagicGunduzSinir', uygulamaAyarlari.magicpassGunduzMesaiSiniri || '20:00');
        ayarDegeriYaz('ayarMagicGeceBaslangic', uygulamaAyarlari.magicpassGeceBaslangic || '23:00');
        ayarDegeriYaz('ayarMagicGeceBitis', uygulamaAyarlari.magicpassGeceBitis || '08:00');
        ayarDegeriYaz('ayarMagicGeceSinir', uygulamaAyarlari.magicpassGeceMesaiSiniri || '12:00');
        magicpassDosyaDurumunuGuncelle();
        ayarDegeriYaz('ayarVardiyaAciklamalar', uygulamaAyarlari.vardiyaAciklamalar || VARSAYILAN_UYGULAMA_AYARLARI.vardiyaAciklamalar);
        const yedek = { ...VARSAYILAN_UYGULAMA_AYARLARI.yedekleme, ...(uygulamaAyarlari.yedekleme || {}) };
        document.getElementById('ayarYedekAktif').value = String(Boolean(yedek.aktif));
        document.getElementById('ayarYedekPeriyot').value = ['gunluk','haftalik','aylik'].includes(yedek.periyot) ? yedek.periyot : 'haftalik';
        document.getElementById('ayarYedekSaat').value = /^\d{2}:\d{2}$/.test(String(yedek.saat || '')) ? yedek.saat : '03:00';
        document.getElementById('ayarYedekHaftaGunu').value = String(Math.min(6, Math.max(0, Number(yedek.haftaGunu || 0))));
        document.getElementById('ayarYedekAyGunu').value = Math.min(28, Math.max(1, Number(yedek.ayGunu || 1)));
        document.getElementById('ayarYedekSaklamaAdedi').value = Math.min(100, Math.max(1, Number(yedek.saklamaAdedi || 20)));
        yedeklemeAyarGorunumunuGuncelle();
        yedeklemeDurumunuGoster(yedek);
        if(typeof window.magicpassGunlukRaporAyarlariniDoldur==='function')window.magicpassGunlukRaporAyarlariniDoldur();
        ozelAyarFormlariniDoldur();
        anaMenuAyarTaslagi=anaMenuModulAyarlariniDuzelt();
        ayarlarModulListesiniCiz();
    }

function yedeklemeAyarGorunumunuGuncelle() {
fdAyarDogrula(false);

        const periyot = document.getElementById('ayarYedekPeriyot')?.value || 'haftalik';
        const aktif = document.getElementById('ayarYedekAktif')?.value === 'true';
        const hafta = document.getElementById('ayarYedekHaftaGunuGrup');
        const ay = document.getElementById('ayarYedekAyGunuGrup');
        if (hafta) hafta.style.display = periyot === 'haftalik' ? '' : 'none';
        if (ay) ay.style.display = periyot === 'aylik' ? '' : 'none';
        ['ayarYedekPeriyot','ayarYedekSaat','ayarYedekHaftaGunu','ayarYedekAyGunu','ayarYedekSaklamaAdedi'].forEach(id => {
            const alan = document.getElementById(id); if (alan) alan.disabled = !aktif;
        });
    }

function yedeklemeFormDegerleriniOku(mevcut = uygulamaAyarlari.yedekleme || {}) {
fdAyarDogrula(false);

        return {
            ...VARSAYILAN_UYGULAMA_AYARLARI.yedekleme,
            ...mevcut,
            aktif: document.getElementById('ayarYedekAktif')?.value === 'true',
            periyot: ['gunluk','haftalik','aylik'].includes(document.getElementById('ayarYedekPeriyot')?.value) ? document.getElementById('ayarYedekPeriyot').value : 'haftalik',
            saat: document.getElementById('ayarYedekSaat')?.value || '03:00',
            haftaGunu: Math.min(6, Math.max(0, Number(document.getElementById('ayarYedekHaftaGunu')?.value || 0))),
            ayGunu: Math.min(28, Math.max(1, Number(document.getElementById('ayarYedekAyGunu')?.value || 1))),
            saklamaAdedi: Math.min(100, Math.max(1, Number(document.getElementById('ayarYedekSaklamaAdedi')?.value || 20)))
        };
    }

async function yedeklemeAyariniOrtakKaydet(yedek = {}) {
try{
fdAyarDogrula(true);

        if (!SUPABASE_MODE || !activeUser?.sirketId || !isManagerUser()) return;
        const value = { aktif:Boolean(yedek.aktif), periyot:yedek.periyot || 'haftalik', saat:yedek.saat || '03:00', haftaGunu:Number(yedek.haftaGunu || 0), ayGunu:Number(yedek.ayGunu || 1), saklamaAdedi:Number(yedek.saklamaAdedi || 20) };
        const { error } = await fdAyarBekle(supabaseClient.from('portal_settings').upsert({ company_id:activeUser.sirketId, setting_key:'bulut_yedekleme', value }, { onConflict:'company_id,setting_key' }));
        if (error) throw error;
    
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
}

async function yedeklemeAyariniSunucudanDogrula(beklenen) {
try{
fdAyarDogrula(false);

        const { data, error } = await fdAyarBekle(supabaseClient.from('companies').select('data').eq('id',aktifSirketId()).maybeSingle());
        if (error) throw error;
        const kayitli = data?.data?.uygulamaAyarlari?.yedekleme || {};
        if (Boolean(kayitli.aktif) !== Boolean(beklenen.aktif) || String(kayitli.periyot || '') !== String(beklenen.periyot || '') || String(kayitli.saat || '') !== String(beklenen.saat || '')) throw new Error('Yedekleme ayarı sunucuda doğrulanamadı. Lütfen yeniden kaydedin.');
        return kayitli;
    
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
}

async function yedeklemeAyarlariniKaydet() {
try{
fdAyarDogrula(true);

        if(!isManagerUser())return;
        const yedekleme=yedeklemeFormDegerleriniOku();
        showGlobalOverlay('Yedekleme ayarı kaydediliyor','Ayar kaydediliyor...');
        try {
            await fdAyarBekle(sirketUygulamaAyarParcasiKaydet({yedekleme}));
            try{await fdAyarBekle(yedeklemeAyariniOrtakKaydet(yedekleme));}catch(ortakHata){
if(!fdAyarGecerli())return;
console.warn('Ortak yedekleme ayarı ayrıca kaydedilemedi:',ortakHata);}
            const dogrulanan=SUPABASE_MODE?await fdAyarBekle(yedeklemeAyariniSunucudanDogrula(yedekleme)):yedekleme;
            uygulamaAyarlari.yedekleme={...VARSAYILAN_UYGULAMA_AYARLARI.yedekleme,...dogrulanan};
            yedeklemeDurumunuGoster(uygulamaAyarlari.yedekleme);
            showToast('Bulut yedekleme ayarı kaydedildi ve doğrulandı.');
        }catch(error){
if(!fdAyarGecerli())return;
showToast('Yedekleme ayarı kaydedilemedi: '+(error.message||error),'error');}
        finally{
if(fdAyarGecerli()){
hideGlobalOverlay();
}
}
    
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
}

function yedeklemeDurumunuGoster(yedek = {}) {
fdAyarDogrula(false);

        const alan = document.getElementById('ayarYedekDurum'), link = document.getElementById('ayarYedekDriveLink');
        if (!alan) return;
        const zaman = yedek.sonBasarili ? new Date(yedek.sonBasarili).toLocaleString('tr-TR') : '';
        if (yedek.durum === 'hata') {
            alan.innerHTML = '<strong style="color:#b91c1c;">Hata</strong><br>' + escapeDashboardText(yedek.sonHata || 'Yedekleme tamamlanamadı.');
        } else if (yedek.durum === 'calisiyor') {
            alan.innerHTML = '<strong style="color:#0369a1;">Yedek hazırlanıyor...</strong>';
        } else if (zaman) {
            alan.innerHTML = '<strong style="color:#047857;">Son yedek başarılı</strong><br>' + escapeDashboardText(zaman + (yedek.sonDosya ? ' · ' + yedek.sonDosya : ''));
        } else {
            alan.textContent = yedek.hemenIstek ? 'Yedekleme isteği sırada.' : 'Henüz yedek alınmadı.';
        }
        if (link) {
            link.href = yedek.sonDriveUrl || '#';
            link.style.display = yedek.sonDriveUrl ? 'inline-flex' : 'none';
        }
    }

async function yedeklemeHemenIste() {
try{
fdAyarDogrula(true);

        if (!isManagerUser()) return showToast('Bu işlem için admin veya kullanıcı yetkisi gerekir.','error');
        const yedekleme = { ...yedeklemeFormDegerleriniOku(), aktif:true, hemenIstek:new Date().toISOString(), durum:'bekliyor', sonHata:'' };
        document.getElementById('ayarYedekAktif').value = 'true';
        yedeklemeAyarGorunumunuGuncelle();
        showGlobalOverlay('Yedekleme isteği kaydediliyor','Bulut görevi en geç 15 dakika içinde başlayacak...');
        try {
            const { data:sirket, error:okumaHatasi } = await fdAyarBekle(supabaseClient.from('companies').select('data').eq('id',aktifSirketId()).maybeSingle());
            if (okumaHatasi) throw okumaHatasi;
            const yeniAyarlar = { ...uygulamaAyarlari, yedekleme };
            kullaniciYetkiMatrisiniKoru(yeniAyarlar, sirket?.data?.uygulamaAyarlari || {});
            const { error } = await fdAyarBekle(supabaseClient.from('companies').update({ data:{ ...(sirket?.data || {}), uygulamaAyarlari:yeniAyarlar } }).eq('id',aktifSirketId()));
            if (error) throw error;
            try { await fdAyarBekle(yedeklemeAyariniOrtakKaydet(yedekleme)); } catch (ortakHata) {
if(!fdAyarGecerli())return;
 console.warn('Ortak yedekleme ayarı ayrıca kaydedilemedi:', ortakHata); }
            await fdAyarBekle(yedeklemeAyariniSunucudanDogrula(yedekleme));
            uygulamaAyarlari = { ...VARSAYILAN_UYGULAMA_AYARLARI, ...yeniAyarlar };
            yedeklemeDurumunuGoster(yedekleme);
            showToast('Yedekleme isteği alındı. En geç 15 dakika içinde Drive’a kaydedilecek.');
        } catch (error) {
if(!fdAyarGecerli())return;

            showToast('Yedekleme isteği kaydedilemedi: ' + (error.message || error),'error');
        } finally {
if(fdAyarGecerli()){

            hideGlobalOverlay();
        
}
}
    
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
}

function openAyarlarApp() {
fdAyarDogrula(false);

        if (!anaMenuModulErisimiVar('ayarlar')) return;
        anaMenuDonusButonunuGoster();
        icraEkraniniKapat();
        if(typeof fdTumUygulamaAlanlariniGizle==='function')fdTumUygulamaAlanlariniGizle();
        ['appHub','personelDashboardApp','personelApp','izinTakipApp','puantajApp','avansApp','sirketApp','icraApp','ekOdemeApp','kkdApp','aracTakipApp','vardiyaApp','magicpassApp','irsaliyeTakipApp','kiraTakipApp','ihracatApp'].forEach(id => {
            const el = document.getElementById(id); if (el) el.style.display = 'none';
        });
        document.getElementById('ayarlarApp').style.display = 'block';
        window.ayarlarArayuzunuDuzenle();
        ayarlarAnaMenuPaneliniYenile();
        try{ayarlarFormunuDoldur();}catch(error){
if(!fdAyarGecerli())return;
console.error('Ayar formu doldurulamadı:',error);showToast('Bazı ayarlar yüklenemedi; Ana Menü yetkileri kullanılabilir.','warning');}
        setTimeout(() => { if (typeof fdTakvimAyarlariniKur === 'function') fdTakvimAyarlariniKur(); }, 0);
    }

function fdMesaiMahsupAyarlariniFormaYaz(){
 const ay=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit'}).format(new Date());
 document.getElementById('ayarMesaiMahsupYontemi').value=fdMesaiMahsupYontemi(ay);
}
function fdMesaiMahsupAyarlariniOku(){
 const from=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit'}).format(new Date()),yontem=String(document.getElementById('ayarMesaiMahsupYontemi')?.value||'');
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(from)||from<'2026-10')throw Error('Geçerli kayıt ayı belirlenemedi. Sistem tarihini kontrol edin.');if(!['hafta-ici-once','orantili','yalniz-hafta-ici'].includes(yontem))throw Error('Geçerli bir mesai düşme yöntemi seçin.');
 const eski=Array.isArray(uygulamaAyarlari.mesaiMahsupDonemleri)?uygulamaAyarlari.mesaiMahsupDonemleri:[],onceki=eski.find(k=>k?.from===from)||{};return{mesaiMahsupDonemleri:[...eski.filter(k=>k?.from!==from),{...onceki,from,yontem}].sort((a,b)=>String(a?.from||'').localeCompare(String(b?.from||'')))};
}
async function uygulamaAyarlariniKaydet(event) {
try{
fdAyarDogrula(true);

        event.preventDefault();
        if (!isManagerUser()) return showToast('Bu ayarları kaydetmek için admin veya kullanıcı yetkisi gerekir.','error');
        let mesaiMahsupAyari;try{mesaiMahsupAyari=fdMesaiMahsupAyarlariniOku()}catch(error){return showToast(error.message,'warning')}
        const anaMenuModulleri = anaMenuAyarlariniFormdanOku();
        const irsaliyeBirimleri = irsaliyeAyarBirimDegerleri();
        const aracTurleri = aracAyarTurDegerleri();
        if (!aracTurleri.length) return alert('En az bir araç türü tanımlayın.');
        if (!irsaliyeBirimleri.length) return alert('Taşıma irsaliyesi için en az bir birim tanımlayın.');
        const irsaliyeVarsayilanBirim = irsaliyeBirimleri.includes(String(document.getElementById('ayarIrsaliyeVarsayilanBirim').value || '').toLocaleUpperCase('tr-TR')) ? String(document.getElementById('ayarIrsaliyeVarsayilanBirim').value).toLocaleUpperCase('tr-TR') : irsaliyeBirimleri[0];
        const yeniAyarlar = {
            ...uygulamaAyarlari,
            ...mesaiMahsupAyari,
            primTutari:Math.max(0, paraMetniniSayiyaCevir(document.getElementById('ayarPrimTutari').value)),
            primDevamsizlikSiniri:Math.max(0, Number(document.getElementById('ayarPrimDevamsizlikSiniri').value || 0)),
            primYarimGunEksikMesaiDakika:Math.min(1440, Math.max(1, Number(document.getElementById('ayarPrimYarimGunEksikMesai').value || 210))),
            gunlukCalismaSaati:Math.max(0.5, Number(document.getElementById('ayarGunlukCalismaSaati').value || 7.5)),
            mesaiKatsayisi:Math.max(1, Number(document.getElementById('ayarMesaiKatsayisi').value || 1.5)),
            mesaiYuvarlamaAdimi:Math.max(0.25, Number(document.getElementById('ayarMesaiYuvarlama').value || 0.5)),
            varsayilanIzinSebebi:String(document.getElementById('ayarVarsayilanIzinSebebi').value || '').trim() || VARSAYILAN_UYGULAMA_AYARLARI.varsayilanIzinSebebi,
            dogumIzinGunu:Math.max(1, Number(document.getElementById('ayarDogumIzinGunu').value || 5)),
            evlenmeIzinGunu:Math.max(1, Number(document.getElementById('ayarEvlenmeIzinGunu').value || 3)),
            olumIzinGunu:Math.max(1, Number(document.getElementById('ayarOlumIzinGunu').value || 3)),
            hatirlatmaGunu:Math.min(365, Math.max(1, Number(document.getElementById('ayarHatirlatmaGunu').value || 45))),
            pdfAzamiMb:Math.min(10, Math.max(1, Number(document.getElementById('ayarPdfAzamiMb').value || 10))),
            alanAdiTescilBelgesi:alanAdiTescilAyarlariniFormdanOku(),
            aracHatirlatmaGunu:Math.min(365, Math.max(1, Number(document.getElementById('ayarAracHatirlatmaGunu').value || 45))),
            aracBakimKmAraligi:Math.max(1000, paraMetniniSayiyaCevir(document.getElementById('ayarAracBakimKmAraligi').value || 10000)),
            aracBakimAyAraligi:Math.min(60, Math.max(1, Number(document.getElementById('ayarAracBakimAyAraligi').value || 12))),
            aracYakitRaporYilSayisi:Math.min(20, Math.max(1, Number(document.getElementById('ayarAracYakitRaporYilSayisi').value || 7))),
            aracTurleri,
            irsaliyeFaturaSuresi:Math.min(30, Math.max(1, Number(document.getElementById('ayarIrsaliyeFaturaSuresi').value || 7))),
            irsaliyeVarsayilanBirim,
            irsaliyeBirimleri,
            irsaliyeAciklamaSablonu:String(document.getElementById('ayarIrsaliyeAciklamaSablonu').value || '').trim() || VARSAYILAN_UYGULAMA_AYARLARI.irsaliyeAciklamaSablonu,
            ihracatVarsayilanParaBirimi:String(document.getElementById('ayarIhracatParaBirimi').value || 'USD'),
            ihracatVarsayilanSatisTuru:String(document.getElementById('ayarIhracatSatisTuru').value || VARSAYILAN_UYGULAMA_AYARLARI.ihracatVarsayilanSatisTuru),
	            ihracatVarsayilanToplamaModu:['urun','olcu','ceki'].includes(document.getElementById('ayarIhracatToplamaModu').value)?document.getElementById('ayarIhracatToplamaModu').value:'olcu',
	            ihracatNetKgKatsayisi:Math.max(0,Number(document.getElementById('ayarIhracatNetKgKatsayisi').value||28)),
	            ihracatBrutKgEkleme:Math.max(0,Number(document.getElementById('ayarIhracatBrutKgEkleme').value||30)),
	            ihracatGorselAzamiMb:Math.min(10,Math.max(1,Number(document.getElementById('ayarIhracatGorselAzamiMb').value||10))),
            ihracatCekiBasinaAzamiGorsel:Math.min(100,Math.max(1,Number(document.getElementById('ayarIhracatGorselSayisi').value||20))),
            vardiyaGunduzBaslik:String(document.getElementById('ayarVardiyaGunduzBaslik')?.value || uygulamaAyarlari.vardiyaGunduzBaslik || '').trim() || VARSAYILAN_UYGULAMA_AYARLARI.vardiyaGunduzBaslik,
            vardiyaGeceBaslik:String(document.getElementById('ayarVardiyaGeceBaslik')?.value || uygulamaAyarlari.vardiyaGeceBaslik || '').trim() || VARSAYILAN_UYGULAMA_AYARLARI.vardiyaGeceBaslik,
            magicpassGunduzBaslangic:String(document.getElementById('ayarMagicGunduzBaslangic')?.value || uygulamaAyarlari.magicpassGunduzBaslangic || '08:00'),
            magicpassGunduzBitis:String(document.getElementById('ayarMagicGunduzBitis')?.value || uygulamaAyarlari.magicpassGunduzBitis || '17:00'),
            magicpassGunduzMesaiSiniri:String(document.getElementById('ayarMagicGunduzSinir')?.value || uygulamaAyarlari.magicpassGunduzMesaiSiniri || '20:00'),
            magicpassGeceBaslangic:String(document.getElementById('ayarMagicGeceBaslangic')?.value || uygulamaAyarlari.magicpassGeceBaslangic || '23:00'),
            magicpassGeceBitis:String(document.getElementById('ayarMagicGeceBitis')?.value || uygulamaAyarlari.magicpassGeceBitis || '08:00'),
            magicpassGeceMesaiSiniri:String(document.getElementById('ayarMagicGeceSinir')?.value || uygulamaAyarlari.magicpassGeceMesaiSiniri || '12:00'),
            ...otomatikBildirimSablonDegerleriniOku(true),
            whatsappBildirimSablonAktifleri:whatsappSablonBildirimAyarlariniOku(),
            whatsappBildirimZamanlamalari:fdWhatsappZamanlamaDegerleriniOku(),
            whatsappFiyatBildirimAktif:document.getElementById('ayarWhatsappFiyatBildirimAktif')?.value!=='false',
            whatsappIzinOtomatikAktif:document.getElementById('ayarWhatsappIzinAktif')?.value!=='false',
            whatsappIzinBeklemeDakika:Math.min(120,Math.max(0,Number(document.getElementById('ayarWhatsappIzinBekleme')?.value??3))),
            whatsappVardiyaOtomatikAktif:document.getElementById('ayarWhatsappVardiyaAktif')?.value!=='false',
            whatsappVardiyaSubeleri:whatsappVardiyaSubeSecilenleriniOku(),
            whatsappVardiyaAksamSaati:/^\d{2}:\d{2}$/.test(String(document.getElementById('ayarWhatsappVardiyaAksam')?.value||''))?document.getElementById('ayarWhatsappVardiyaAksam').value:'20:00',
            whatsappVardiyaErtesiGunSaati:/^\d{2}:\d{2}$/.test(String(document.getElementById('ayarWhatsappVardiyaErtesi')?.value||''))?document.getElementById('ayarWhatsappVardiyaErtesi').value:'10:00',
            siparisBirimleri:siparisAyarBirimleriniDuzelt(document.getElementById('ayarSiparisBirimleri')?.value),
            siparisVarsayilanBirim:String(document.getElementById('ayarSiparisVarsayilanBirim')?.value||'ADET').toLocaleUpperCase('tr-TR'),
            siparisGecikmeToleransGunu:Math.min(365,Math.max(0,Number(document.getElementById('ayarSiparisGecikmeTolerans')?.value||0))),
            siparisTamamlananlariGoster:document.getElementById('ayarSiparisTamamlananGoster')?.value==='true',
            siparisDetayVarsayilanGun:[0,30,90,180,365].includes(Number(document.getElementById('ayarSiparisDetayGun')?.value))?Number(document.getElementById('ayarSiparisDetayGun').value):0,
            vardiyaAciklamalar:String(document.getElementById('ayarVardiyaAciklamalar')?.value || uygulamaAyarlari.vardiyaAciklamalar || '').trim() || VARSAYILAN_UYGULAMA_AYARLARI.vardiyaAciklamalar,
            yedekleme:yedeklemeFormDegerleriniOku(),
            anaMenuModulleri
        };
        showGlobalOverlay('Ayarlar kaydediliyor', 'Şirket ayarları güncelleniyor...');
        try {
            const kaydedilenAyarlar = await fdAyarBekle(sirketUygulamaAyarParcasiKaydet(yeniAyarlar));
            if(!fdMesaiKurallariAyniMi(kaydedilenAyarlar?.mesaiMahsupDonemleri,mesaiMahsupAyari.mesaiMahsupDonemleri))throw Error('Mesai yöntemi ve geçerlilik ayı sunucuda doğrulanamadı.');
            const istisnalariKarsilastirmayaHazirla=moduller=>Object.fromEntries((moduller||[]).map(modul=>[
                modul.anahtar,
                Object.fromEntries(Object.entries(modul.kullaniciYetkileri||{}).sort(([ilk],[ikinci])=>ilk.localeCompare(ikinci,'tr')))
            ]));
            const beklenenIstisnalar=istisnalariKarsilastirmayaHazirla(anaMenuModulleri);
            const kayitliModuller=anaMenuModulAyarlariniDuzelt(kaydedilenAyarlar?.anaMenuModulleri);
            const kayitliIstisnalar=istisnalariKarsilastirmayaHazirla(kayitliModuller);
            if(JSON.stringify(kayitliIstisnalar)!==JSON.stringify(beklenenIstisnalar))throw new Error('Kişiye özel kullanıcı yetkileri sunucuda doğrulanamadı.');
            try { await fdAyarBekle(yedeklemeAyariniOrtakKaydet(yeniAyarlar.yedekleme)); } catch (ortakHata) {
if(!fdAyarGecerli())return;
 console.warn('Ortak yedekleme ayarı ayrıca kaydedilemedi:', ortakHata); }
            uygulamaAyarlari = { ...VARSAYILAN_UYGULAMA_AYARLARI, ...kaydedilenAyarlar };
            anaMenuAyarTaslagi = kayitliModuller;
            aracTurSecenekleriniYenile();
            izinAyarEtiketleriniGuncelle();
            irsaliyeBirimSecenekleriniYenile();
            window.fdSiparisBirimSecenekleriniYenile?.();
            anaMenuModulKartlariniUygula();
            await fdAyarBekle(alanAdiTescilBelgesiniGoster(yeniAyarlar.alanAdiTescilBelgesi));
            const izinSebep = document.getElementById('izinSebep');
            if (izinSebep && (!izinSebep.value || izinSebep.value === VARSAYILAN_UYGULAMA_AYARLARI.varsayilanIzinSebebi)) izinSebep.value = uygulamaAyarlari.varsayilanIzinSebebi;
            alert('Uygulama ayarları kaydedildi.');
            window.FDModules.permissionsSaved('ayarlar');
            window.fdAyarKayitTamamlandi?.();
        } catch (error) {
if(!fdAyarGecerli())return;

            alert('Ayarlar kaydedilemedi: ' + (error.message || 'Bilinmeyen hata'));
        } finally {
if(fdAyarGecerli()){

            hideGlobalOverlay();
        
}
}
    
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
}

function whatsappSablonBildirimAyarlariniDoldur(){
fdAyarDogrula(false);

        const flags=uygulamaAyarlari.whatsappBildirimSablonAktifleri||{};
        const legacy={magicpassBildirimIzinKayitMetni:['ayarWhatsappIzinAktif','whatsappIzinOtomatikAktif'],magicpassBildirimVardiyaDegisiklikMetni:['ayarWhatsappVardiyaAktif','whatsappVardiyaOtomatikAktif']};
        Object.keys(otomatikBildirimSablonDegerleriniOku(true)).filter(k=>k!=='magicpassBildirimFiyatDegisiklikMetni').forEach(key=>{
            const id=key.replace(/^magicpassBildirim/,'ayarMagicBildirim').replace(/Metni$/,''),text=document.getElementById(id);if(!text)return;
            let control=document.getElementById(id+'Aktif');
            if(!control&&typeof document.createElement==='function'){
                const box=document.createElement('div');box.className='fd-wa-template-switch';box.style.cssText='display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:8px 0 14px';
                const label=document.createElement('label');label.htmlFor=id+'Aktif';label.textContent='Bildirim Gönderimi';label.style.margin='0';
                control=document.createElement('select');control.id=id+'Aktif';control.dataset.whatsappTemplateKey=key;control.style.cssText='width:auto;min-width:110px';control.innerHTML='<option value="true">Açık</option><option value="false">Kapalı</option>';
                box.append(label,control);text.closest('.form-group')?.appendChild(box);
                if(legacy[key]){control.addEventListener('change',()=>{const other=document.getElementById(legacy[key][0]);if(other)other.value=control.value});const other=document.getElementById(legacy[key][0]);if(other&&!other.dataset.templateSwitchBound){other.dataset.templateSwitchBound='1';other.addEventListener('change',()=>{const current=document.getElementById(id+'Aktif');if(current)current.value=other.value})}}
            }
            if(control)control.value=String(flags[key]!==false&&(!legacy[key]||uygulamaAyarlari[legacy[key][1]]!==false));
        });
    }

function whatsappSablonBildirimAyarlariniOku(){
fdAyarDogrula(false);

        const flags={...(uygulamaAyarlari.whatsappBildirimSablonAktifleri||{})};
        Object.keys(otomatikBildirimSablonDegerleriniOku(true)).filter(k=>k!=='magicpassBildirimFiyatDegisiklikMetni').forEach(key=>{
            const id=key.replace(/^magicpassBildirim/,'ayarMagicBildirim').replace(/Metni$/,''),control=document.getElementById(id+'Aktif');if(control)flags[key]=control.value!=='false';
        });
        return flags;
    }

// A timing belongs to its message card, not to a separate global form.
const fdWhatsappZamanlamaTurleri={Gelmedi:'daily',GirisYok:'daily',CikisYok:'daily',DogumGunu:'daily',YillikIzin:'daily',IcraAylik:'monthly',BordroYayin:'payslip',BordroAvans:'payslip',AvansKayit:'event',IcraKayit:'event',IzinKayit:'event',IseGiris:'event',IstenAyrilis:'event',FiyatDegisiklik:'event',VardiyaDegisiklik:'shift'};
function fdWhatsappMesajOzetleriniGuncelle(){
 if(!fdAyarGecerli())return;
 for(const [name,type] of Object.entries(fdWhatsappZamanlamaTurleri)){
  const details=document.getElementById('fdWaMesaj'+name);if(!details)continue;
  const enabled=document.getElementById(name==='FiyatDegisiklik'?'ayarWhatsappFiyatBildirimAktif':'ayarMagicBildirim'+name+'Aktif')?.value!=='false';
  const flag=details.querySelector('[data-wa-enabled]');flag.textContent=enabled?'Açık':'Kapalı';flag.dataset.waEnabled=String(enabled);
  const p='ayarWaZaman'+name,time=document.getElementById(p+'Saat')?.value||'';
  details.querySelector('[data-wa-time]').textContent=type==='shift'?'Vardiya · '+(document.getElementById('ayarWhatsappVardiyaAksam')?.value||'20:00'):type==='monthly'?'Her ay '+(document.getElementById(p+'Gun')?.value||15)+'. gün · '+time:type==='daily'?'Her gün · '+time:type==='payslip'?'Yayımlandığı gün · '+time:document.getElementById(p+'Mod')?.value==='clock'?'İşlem sonrası · '+time:(Number(document.getElementById(p+'Bekleme')?.value||0)===0?'İşlem sonrası sıraya alınır':document.getElementById(p+'Bekleme').value+' dakika sonra');
 }
}
function fdWhatsappMesajListesiniKur(){
 const outer=document.getElementById('ayarOtomatikBildirimBolumu'),host=outer?.querySelector(':scope > div');if(!host)return;
 if(!host.querySelector('.fd-wa-message-toolbar')){
  const toolbar=document.createElement('div');toolbar.className='fd-wa-message-toolbar';toolbar.innerHTML='<input type="search" aria-label="Mesaj türü ara" placeholder="Mesaj türü ara…"><span data-wa-count></span><button type="button">Tümünü daralt</button>';
  host.querySelector('p')?.after(toolbar);outer.open=true;
  const search=toolbar.querySelector('input'),filter=()=>{const q=search.value.toLocaleLowerCase('tr-TR').trim();let count=0;host.querySelectorAll('.fd-wa-message-accordion').forEach(d=>{d.hidden=!d.querySelector('[data-wa-title]').textContent.toLocaleLowerCase('tr-TR').includes(q);if(!d.hidden)count++});toolbar.querySelector('[data-wa-count]').textContent=count+' mesaj türü'};
  search.addEventListener('input',e=>{e.stopPropagation();filter()});search.addEventListener('change',e=>e.stopPropagation());toolbar.querySelector('button').onclick=()=>host.querySelectorAll('.fd-wa-message-accordion').forEach(d=>d.open=false);toolbar.fdFilter=filter;
 }
 for(const name of Object.keys(fdWhatsappZamanlamaTurleri)){
  const input=document.getElementById('ayarMagicBildirim'+name),card=input?.closest('.fd-wa-message-card');if(!card||card.parentElement.classList.contains('fd-wa-message-accordion'))continue;
  const label=card.querySelector(':scope > label'),title=label?.textContent||name,details=document.createElement('details');details.id='fdWaMesaj'+name;details.className='fd-wa-message-accordion';details.setAttribute('name','fd-wa-message');details.innerHTML='<summary><span data-wa-title></span><span class="fd-wa-message-badges"><small data-wa-time></small><span data-wa-enabled></span></span></summary>';
  details.querySelector('[data-wa-title]').textContent=title;
  card.before(details);details.appendChild(card);
  if(label){label.textContent='Mesaj metni';label.htmlFor=input.id;}
  details.addEventListener('toggle',()=>{if(details.open)host.querySelectorAll('.fd-wa-message-accordion').forEach(d=>{if(d!==details)d.open=false})});
  const actions=document.createElement('div');actions.className='fd-wa-card-actions';const button=document.createElement('button');button.type='button';button.className='btn-submit';button.textContent='Bu Mesajın Ayarlarını Kaydet';button.onclick=()=>otomatikBildirimMetinleriniKaydet(button,'magicpassBildirim'+name+'Metni');actions.appendChild(button);card.appendChild(actions);
 }
 host.querySelector('.fd-wa-message-toolbar').fdFilter();fdWhatsappMesajOzetleriniGuncelle();
 if(!host.dataset.waBound){host.dataset.waBound='1';host.addEventListener('input',fdWhatsappMesajOzetleriniGuncelle);host.addEventListener('change',fdWhatsappMesajOzetleriniGuncelle);}
}
function fdWhatsappZamanlamaFormunuKur(){
 fdAyarDogrula();
 for(const [name,type] of Object.entries(fdWhatsappZamanlamaTurleri)){
  const input=document.getElementById('ayarMagicBildirim'+name);if(!input)continue;
  const card=input.closest('.form-group');card.classList.add('fd-wa-message-card');
  let box=card.querySelector('.fd-wa-timing');
  if(!box){
   box=document.createElement('fieldset');box.className='fd-wa-timing';box.innerHTML='<legend>Gönderim zamanı</legend>';
   const prefix='ayarWaZaman'+name;
   if(type==='shift'){
    for(const id of ['ayarWhatsappVardiyaAksam','ayarWhatsappVardiyaErtesi','ayarWhatsappVardiyaSubeleri']){const node=document.getElementById(id)?.closest('.form-group');if(node)box.appendChild(node)}
    box.insertAdjacentHTML('beforeend','<small>Vardiya listesi kaydedildiğinde hazırlanır; seçilen saat kuyruğun başlayabileceği en erken saattir.</small>');
   }else if(type==='event'){
    box.insertAdjacentHTML('beforeend','<label for="'+prefix+'Mod">Kayıt veya işlem sonrasında</label><select id="'+prefix+'Mod"><option value="delay">Bekleme süresinden sonra</option><option value="clock">Belirlenen saatte</option></select><div class="fd-wa-timing-fields"><label>Bekleme (dakika)<input id="'+prefix+'Bekleme" type="number" min="0" max="1440" step="1"></label><label>Gönderim saati<input id="'+prefix+'Saat" type="time"></label></div><small>0 dakika: işlemden sonra kuyruğa alınır. Belirlenen saat geçmişse ertesi gün başlar.</small>');
    const mode=box.querySelector('select'),toggle=()=>{box.querySelector('#'+prefix+'Bekleme').closest('label').hidden=mode.value!=='delay';box.querySelector('#'+prefix+'Saat').closest('label').hidden=mode.value!=='clock'};mode.addEventListener('change',toggle);box.fdToggle=toggle;
   }else{
    box.insertAdjacentHTML('beforeend','<div class="fd-wa-timing-fields">'+(type==='monthly'?'<label>Ayın günü<input id="'+prefix+'Gun" type="number" min="1" max="28" step="1"></label>':'')+'<label>Gönderim saati<input id="'+prefix+'Saat" type="time"></label></div><small>'+(type==='daily'?'Günlük kontrol sonucunda hazırlanır. Giriş-çıkış mesajları sabah veri aktarımı tamamlandıktan sonra kuyruğa eklenir.':type==='monthly'?'Her ay seçilen günde açık icra dosyaları kontrol edilir.':'Ücret pusulası yayımlandığı gün seçilen saatte başlar; saat geçmişse hazır olduktan sonra sıraya girer.')+'</small>');
   }
   card.appendChild(box);
   if(name==='FiyatDegisiklik'){const old=document.getElementById('ayarWhatsappFiyatBildirimAktif')?.closest('.form-group');if(old){old.classList.add('fd-wa-price-switch');card.appendChild(old)}}
  }
  if(type==='shift')continue;
  const key='magicpassBildirim'+name+'Metni',saved=uygulamaAyarlari.whatsappBildirimZamanlamalari?.[key]||{},prefix='ayarWaZaman'+name;
  const hour=document.getElementById(prefix+'Saat');if(hour)hour.value=saved.time||(type==='payslip'?'20:00':'12:00');
  const day=document.getElementById(prefix+'Gun');if(day)day.value=String(saved.day??15);
  const mode=document.getElementById(prefix+'Mod');if(mode)mode.value=saved.mode==='clock'?'clock':'delay';
  const delay=document.getElementById(prefix+'Bekleme');if(delay)delay.value=String(saved.delayMinutes??(name==='IzinKayit'?(uygulamaAyarlari.whatsappIzinBeklemeDakika??3):0));
  box.fdToggle?.();
 }
 const rules=document.getElementById('ayarWhatsappGonderimDetayi');if(rules){
  // Legacy enable switches retain their IDs for existing save/integration paths.
  for(const [name,id] of [['IzinKayit','ayarWhatsappIzinAktif'],['VardiyaDegisiklik','ayarWhatsappVardiyaAktif']]){
   const control=document.getElementById(id)?.closest('.form-group');if(control){control.hidden=true;document.getElementById('ayarMagicBildirim'+name)?.closest('.form-group')?.appendChild(control)}
  }
  const delay=document.getElementById('ayarWhatsappIzinBekleme')?.closest('.form-group');if(delay){delay.hidden=true;document.getElementById('ayarMagicBildirimIzinKayit')?.closest('.form-group')?.appendChild(delay)}
  rules.remove();
 }
 fdWhatsappMesajListesiniKur();
}
function fdWhatsappZamanlamaDegerleriniOku(onlyKey=null){
 fdAyarDogrula();
 const result=structuredClone(uygulamaAyarlari.whatsappBildirimZamanlamalari||{});
 for(const [name,type] of Object.entries(fdWhatsappZamanlamaTurleri)){
  if(onlyKey&&onlyKey!=='magicpassBildirim'+name+'Metni')continue;
  if(type==='shift')continue;
  const prefix='ayarWaZaman'+name,field=document.getElementById(prefix+'Saat');if(!field)continue;
  const key='magicpassBildirim'+name+'Metni',mode=document.getElementById(prefix+'Mod')?.value||type;
  if((mode!=='delay')&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(field.value))throw Error('Geçerli bir WhatsApp gönderim saati seçin.');
  const delay=Number(document.getElementById(prefix+'Bekleme')?.value??0),day=Number(document.getElementById(prefix+'Gun')?.value??15);
  if(mode==='delay'&&(!Number.isInteger(delay)||delay<0||delay>1440))throw Error('Bekleme süresi 0–1440 dakika arasında olmalıdır.');
  if(type==='monthly'&&(!Number.isInteger(day)||day<1||day>28))throw Error('İcra bildirim günü 1–28 arasında olmalıdır.');
  result[key]={...(result[key]||{}),mode,time:field.value||'12:00',...(type==='event'?{delayMinutes:delay}:{}),...(type==='monthly'?{day}:{})};
 }
 return result;
}
function fdWhatsappZamanlamaKayitParcasi(onlyKey=null){
 return{whatsappBildirimZamanlamalari:fdWhatsappZamanlamaDegerleriniOku(onlyKey),...(!onlyKey||onlyKey==='magicpassBildirimVardiyaDegisiklikMetni'?{whatsappVardiyaSubeleri:whatsappVardiyaSubeSecilenleriniOku(),whatsappVardiyaAksamSaati:document.getElementById('ayarWhatsappVardiyaAksam')?.value||'20:00',whatsappVardiyaErtesiGunSaati:document.getElementById('ayarWhatsappVardiyaErtesi')?.value||'10:00'}:{})};
}

function magicpassGunlukRaporAyarlariniDoldur(){
fdAyarDogrula(false);

        const mesai=document.getElementById('ayarMagicGunlukMesaiEsik'),eksikMesai=document.getElementById('ayarMagicGunlukEksikMesaiEsik'),mukerrer=document.getElementById('ayarMagicMukerrerDakika'),durum=document.getElementById('ayarMagicCihazsizDurum');
        if(mesai)mesai.value=magicpassGunlukMesaiEsigi();if(eksikMesai)eksikMesai.value=magicpassGunlukEksikMesaiEsigi();if(mukerrer)mukerrer.value=Math.min(30,Math.max(0,Number(uygulamaAyarlari.magicpassMukerrerBasimDakika??3)));if(durum)durum.value=String(uygulamaAyarlari.magicpassCihazsizDurumMetni||'Kayıt Yok');
        const sablonlar={ayarMagicBildirimGelmedi:'magicpassBildirimGelmediMetni',ayarMagicBildirimGirisYok:'magicpassBildirimGirisYokMetni',ayarMagicBildirimCikisYok:'magicpassBildirimCikisYokMetni',ayarMagicBildirimDogumGunu:'magicpassBildirimDogumGunuMetni',ayarMagicBildirimYillikIzin:'magicpassBildirimYillikIzinMetni',ayarMagicBildirimAvansKayit:'magicpassBildirimAvansKayitMetni',ayarMagicBildirimIcraKayit:'magicpassBildirimIcraKayitMetni',ayarMagicBildirimIcraAylik:'magicpassBildirimIcraAylikMetni',ayarMagicBildirimIzinKayit:'magicpassBildirimIzinKayitMetni',ayarMagicBildirimBordroYayin:'magicpassBildirimBordroYayinMetni',ayarMagicBildirimBordroAvans:'magicpassBildirimBordroAvansMetni',ayarMagicBildirimVardiyaDegisiklik:'magicpassBildirimVardiyaDegisiklikMetni',ayarMagicBildirimIseGiris:'magicpassBildirimIseGirisMetni',ayarMagicBildirimIstenAyrilis:'magicpassBildirimIstenAyrilisMetni',ayarMagicBildirimFiyatDegisiklik:'magicpassBildirimFiyatDegisiklikMetni'};Object.entries(sablonlar).forEach(([id,anahtar])=>{const alan=document.getElementById(id);if(alan)alan.value=String(uygulamaAyarlari[anahtar]||VARSAYILAN_UYGULAMA_AYARLARI[anahtar]||'')});
        const fiyatBildirimAktif=document.getElementById('ayarWhatsappFiyatBildirimAktif');if(fiyatBildirimAktif)fiyatBildirimAktif.value=String(uygulamaAyarlari.whatsappFiyatBildirimAktif!==false);
        whatsappSablonBildirimAyarlariniDoldur();
        fdWhatsappZamanlamaFormunuKur();
    
fdAyarTamSablonOnizle.install();
}

function otomatikBildirimSablonDegerleriniOku(varsayılanKullan=false){
fdAyarDogrula(false);

        const alanlar={magicpassBildirimGelmediMetni:'ayarMagicBildirimGelmedi',magicpassBildirimGirisYokMetni:'ayarMagicBildirimGirisYok',magicpassBildirimCikisYokMetni:'ayarMagicBildirimCikisYok',magicpassBildirimDogumGunuMetni:'ayarMagicBildirimDogumGunu',magicpassBildirimYillikIzinMetni:'ayarMagicBildirimYillikIzin',magicpassBildirimAvansKayitMetni:'ayarMagicBildirimAvansKayit',magicpassBildirimIcraKayitMetni:'ayarMagicBildirimIcraKayit',magicpassBildirimIcraAylikMetni:'ayarMagicBildirimIcraAylik',magicpassBildirimIzinKayitMetni:'ayarMagicBildirimIzinKayit',magicpassBildirimBordroYayinMetni:'ayarMagicBildirimBordroYayin',magicpassBildirimBordroAvansMetni:'ayarMagicBildirimBordroAvans',magicpassBildirimVardiyaDegisiklikMetni:'ayarMagicBildirimVardiyaDegisiklik',magicpassBildirimIseGirisMetni:'ayarMagicBildirimIseGiris',magicpassBildirimIstenAyrilisMetni:'ayarMagicBildirimIstenAyrilis',magicpassBildirimFiyatDegisiklikMetni:'ayarMagicBildirimFiyatDegisiklik'};
        return Object.fromEntries(Object.entries(alanlar).map(([anahtar,id])=>{
            const girilen=String(document.getElementById(id)?.value||'').trim();
            const deger=varsayılanKullan?(girilen||String(uygulamaAyarlari[anahtar]||VARSAYILAN_UYGULAMA_AYARLARI[anahtar]||'')):girilen;
            return[anahtar,deger];
        }));
    }

function fdAyarAyniDeger(a,b){const normal=v=>Array.isArray(v)?v.map(normal):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,normal(v[k])])):v;return JSON.stringify(normal(a))===JSON.stringify(normal(b))}
async function otomatikBildirimMetinleriniKaydet(buton=null,onlyKey=null){
try{
fdAyarDogrula(true);

        if(!isManagerUser())return showToast('Bu ayarları değiştirme yetkiniz yok.','error');
        const all=otomatikBildirimSablonDegerleriniOku(false);
        if(onlyKey&&!Object.hasOwn(all,onlyKey))return showToast('Mesaj türü bulunamadı.','warning');
        const sablonlar=onlyKey?{[onlyKey]:all[onlyKey]}:all;
        const uiFlags=whatsappSablonBildirimAyarlariniOku(),flags=onlyKey?{...(uygulamaAyarlari.whatsappBildirimSablonAktifleri||{}),...(Object.hasOwn(uiFlags,onlyKey)?{[onlyKey]:uiFlags[onlyKey]}:{})}:uiFlags;
        if(Object.entries(sablonlar).some(([key,metin])=>!metin&&(key==='magicpassBildirimFiyatDegisiklikMetni'?document.getElementById('ayarWhatsappFiyatBildirimAktif')?.value!=='false':flags[key]!==false)))return showToast('Açık bildirimlerin mesaj metinlerini doldurun.','warning');
        Object.keys(sablonlar).forEach(key=>{if(!sablonlar[key])sablonlar[key]=String(uygulamaAyarlari[key]||VARSAYILAN_UYGULAMA_AYARLARI[key]||'')});
        const farkliSablon=(window.fdPersonnelTemplateCatalog||[]).find(entry=>Object.hasOwn(sablonlar,entry.key)&&String(sablonlar[entry.key]||'').replace(/\r\n/g,'\n').trim()!==String(uygulamaAyarlari[entry.key]||VARSAYILAN_UYGULAMA_AYARLARI[entry.key]||'').replace(/\r\n/g,'\n').trim()&&String(sablonlar[entry.key]||'').replace(/\r\n/g,'\n').trim()!==entry.text);
        if(farkliSablon)return showToast(farkliSablon.title+': Metin gönderim şablonundan farklı. Çalışan gönderimleri bozmamak için önce yeni Meta onayı alınmalıdır.','warning');
        const fiyatBildirimAktif=document.getElementById('ayarWhatsappFiyatBildirimAktif')?.value!=='false';
        if(Object.hasOwn(sablonlar,'magicpassBildirimFiyatDegisiklikMetni')&&sablonlar.magicpassBildirimFiyatDegisiklikMetni.length>500)return showToast('Fiyat bildirimi metni en fazla 500 karakter olabilir.','warning');
        const eskiYazi=buton?.innerHTML||'';
        if(buton){buton.disabled=true;buton.innerHTML='⏳ Kaydediliyor...';}
        showGlobalOverlay('Bildirim metinleri kaydediliyor','Otomatik ve kayıt bildirimlerinde kullanılacak mesajlar güncelleniyor...');
        try{
            const patch={...sablonlar,...(!onlyKey||onlyKey==='magicpassBildirimFiyatDegisiklikMetni'?{whatsappFiyatBildirimAktif:fiyatBildirimAktif}:{}),whatsappBildirimSablonAktifleri:flags,...fdWhatsappZamanlamaKayitParcasi(onlyKey)};
            if((!onlyKey||onlyKey==='magicpassBildirimIzinKayitMetni')&&Object.hasOwn(flags,'magicpassBildirimIzinKayitMetni'))patch.whatsappIzinOtomatikAktif=flags.magicpassBildirimIzinKayitMetni;
            if((!onlyKey||onlyKey==='magicpassBildirimVardiyaDegisiklikMetni')&&Object.hasOwn(flags,'magicpassBildirimVardiyaDegisiklikMetni'))patch.whatsappVardiyaOtomatikAktif=flags.magicpassBildirimVardiyaDegisiklikMetni;
            const kayitli=await fdAyarBekle(sirketUygulamaAyarParcasiKaydet(patch));
            if(Object.entries(sablonlar).some(([anahtar,deger])=>String(kayitli[anahtar]||'')!==deger)||(Object.hasOwn(patch,'whatsappFiyatBildirimAktif')&&kayitli.whatsappFiyatBildirimAktif!==fiyatBildirimAktif))throw new Error('Kaydedilen bildirim metinleri doğrulanamadı.');
            if(Object.entries(flags).some(([key,value])=>JSON.stringify(kayitli.whatsappBildirimSablonAktifleri?.[key])!==JSON.stringify(value)))throw new Error('Bildirim açık/kapalı ayarları doğrulanamadı.');
            if(Object.entries(patch).some(([key,value])=>!fdAyarAyniDeger(kayitli[key],value)))throw Error('Kaydedilen mesaj ayarları sunucuda doğrulanamadı.');
            fdWhatsappMesajOzetleriniGuncelle();
            fdAyarTamSablonOnizle.update();
            showToast('WhatsApp mesaj metinleri, gönderim zamanları ve bildirim tercihleri kaydedildi.','success');
        }catch(error){
if(!fdAyarGecerli())return;
showToast('Bildirim metinleri kaydedilemedi: '+(error.message||error),'error');}
        finally{
if(fdAyarGecerli()){
hideGlobalOverlay();if(buton){buton.disabled=false;buton.innerHTML=eskiYazi;}
}
}
    
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
}

async function magicpassRaporAyarlariniKaydet(buton=null){
try{
fdAyarDogrula(true);

        if(!isManagerUser())return showToast('Bu ayarları değiştirme yetkiniz yok.','error');
        const mesaiAlani=document.getElementById('ayarMagicGunlukMesaiEsik'),eksikMesaiAlani=document.getElementById('ayarMagicGunlukEksikMesaiEsik'),mukerrerAlani=document.getElementById('ayarMagicMukerrerDakika'),durumAlani=document.getElementById('ayarMagicCihazsizDurum');
        if(!mesaiAlani||!eksikMesaiAlani||!mukerrerAlani||!durumAlani)return showToast('Rapor ayar alanları bulunamadı. Ayarlar ekranını yeniden açın.','error');
        const mesai=Math.min(1440,Math.max(0,Number(mesaiAlani.value))),eksikMesai=Math.min(1440,Math.max(0,Number(eksikMesaiAlani.value))),mukerrer=Math.min(30,Math.max(0,Number(mukerrerAlani.value))),durum=String(durumAlani.value||'').trim()||'Kayıt Yok';
        if(!Number.isFinite(mesai)||!Number.isFinite(eksikMesai)||!Number.isFinite(mukerrer))return showToast('Dakika alanlarına geçerli bir sayı yazın.','warning');
        const sablonDegerleri=otomatikBildirimSablonDegerleriniOku(false);if(Object.values(sablonDegerleri).some(x=>!x))return showToast('Otomatik bildirim mesajlarının tamamını doldurun.','warning');
        const degisiklik={magicpassGunlukMesaiEsikDakika:mesai,magicpassGunlukMesaiEsikAyarlandiV2:true,magicpassGunlukEksikMesaiEsikDakika:eksikMesai,magicpassMukerrerBasimDakika:mukerrer,magicpassCihazsizDurumMetni:durum,...sablonDegerleri},eskiYazi=buton?.innerHTML||'';
        if(buton){buton.disabled=true;buton.innerHTML='⏳ Kaydediliyor...';}
        showGlobalOverlay('Rapor ayarları kaydediliyor','Ayarlar kaydediliyor...');
        try{
            const kayitli=await fdAyarBekle(sirketUygulamaAyarParcasiKaydet(degisiklik));
            if(Number(kayitli.magicpassGunlukMesaiEsikDakika)!==mesai||Number(kayitli.magicpassGunlukEksikMesaiEsikDakika)!==eksikMesai||Number(kayitli.magicpassMukerrerBasimDakika)!==mukerrer||String(kayitli.magicpassCihazsizDurumMetni||'')!==durum||Object.entries(sablonDegerleri).some(([anahtar,deger])=>String(kayitli[anahtar]||'')!==deger))throw new Error('Kaydedilen değerler doğrulanamadı.');
            window.magicpassGunlukRaporAyarlariniDoldur();if(typeof magicpassGunlukRaporuCiz==='function')magicpassGunlukRaporuCiz();showToast('Günlük rapor ve kart okuma ayarları kaydedildi.','success');
        }catch(error){
if(!fdAyarGecerli())return;
showToast('Rapor ayarları kaydedilemedi: '+(error.message||error),'error');}
        finally{
if(fdAyarGecerli()){
hideGlobalOverlay();if(buton){buton.disabled=false;buton.innerHTML=eskiYazi;}
}
}
    
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
}

function policeAyarArayuzunuKur(){
fdAyarDogrula(false);

        const panel=document.getElementById('ayarlarPanelOperasyon');if(!panel||document.getElementById('policeAyarDetay'))return;const detay=document.createElement('details');detay.id='policeAyarDetay';detay.className='profile-section';detay.innerHTML='<summary>Poliçe Takip Ayarları</summary><div><div class="form-group"><label>Yaklaşan Poliçe Uyarısı (Gün)</label><input id="ayarPoliceHatirlatmaGunu" type="number" min="1" max="365"></div><div class="form-group"><label>Kullanılacak Poliçe Türleri</label><div id="ayarPoliceTurListesi"></div><div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px"><input id="ayarYeniPoliceTuru" placeholder="Yeni poliçe türü"><button type="button" class="btn-modern btn-detail-modern" onclick="policeAyarTuruEkle()">＋ Ekle</button></div></div><div style="display:flex;justify-content:flex-end"><button type="button" class="btn-submit" style="width:auto;margin:0" onclick="policeAyarlariniKaydet()">💾 Poliçe Ayarlarını Kaydet</button></div></div>';panel.appendChild(detay);policeAyarFormunuDoldur();
    }

function policeAyarTurSatiri(tur=''){
fdAyarDogrula(false);
const liste=document.getElementById('ayarPoliceTurListesi'),satir=document.createElement('div');satir.className='police-ayar-tur-satiri';satir.innerHTML=`<input class="ayar-police-turu" value="${escapeDashboardText(tur)}"><button type="button" class="btn-modern btn-del-modern" title="Sil">🗑️</button>`;satir.querySelector('button').onclick=()=>{if(liste.children.length<=1)return showToast('En az bir poliçe türü bulunmalıdır.','warning');satir.remove();};liste.appendChild(satir);}

function policeAyarFormunuDoldur(){
fdAyarDogrula(false);
const liste=document.getElementById('ayarPoliceTurListesi');if(!liste)return;liste.innerHTML='';policeTurleriniDuzelt().forEach(policeAyarTurSatiri);document.getElementById('ayarPoliceHatirlatmaGunu').value=policeHatirlatmaGunu();}

function policeAyarTuruEkle(){
fdAyarDogrula(false);
const alan=document.getElementById('ayarYeniPoliceTuru'),tur=policeMetinAnahtari(alan.value);if(!tur)return;const mevcut=[...document.querySelectorAll('.ayar-police-turu')].map(x=>policeMetinAnahtari(x.value));if(mevcut.includes(tur))return showToast('Bu poliçe türü zaten listede.','warning');policeAyarTurSatiri(tur);alan.value='';}

async function policeAyarlariniKaydet(){
try{
fdAyarDogrula(true);
const turler=policeTurleriniDuzelt([...document.querySelectorAll('.ayar-police-turu')].map(x=>x.value)),gun=Math.min(365,Math.max(1,Number(document.getElementById('ayarPoliceHatirlatmaGunu').value||30)));showGlobalOverlay('Poliçe ayarları kaydediliyor','Türler ve uyarı süresi uygulanıyor...');try{await fdAyarBekle(sirketUygulamaAyarParcasiKaydet({policeTurleri:turler,policeHatirlatmaGunu:gun}));policeAyarFormunuDoldur();policeTurSecenekleriniDoldur();showToast('Poliçe ayarları kaydedildi.');}catch(error){
if(!fdAyarGecerli())return;
showToast('Poliçe ayarları kaydedilemedi: '+(error.message||error),'error');}finally{
if(fdAyarGecerli()){
hideGlobalOverlay();
}
}
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
}

function policeAyarVarlikSatiri(ad=''){
fdAyarDogrula(false);
const liste=document.getElementById('ayarPoliceVarlikListesi'),zorunlu=['ARAÇ','DAİRE','İŞYERİ'].includes(policeMetinAnahtari(ad)),satir=document.createElement('div');satir.className='police-ayar-tur-satiri';satir.innerHTML=`<input class="ayar-police-varlik-turu" value="${escapeDashboardText(ad)}" ${zorunlu?'readonly title="Plaka/UAVT eşleştirmesi için zorunlu tür"':''}><button type="button" class="btn-modern btn-del-modern" title="${zorunlu?'Sistem türü silinemez':'Sil'}" ${zorunlu?'disabled':''}>🗑️</button>`;if(!zorunlu)satir.querySelector('button').onclick=()=>satir.remove();liste.appendChild(satir);}

function policeAyarVarliklariniDoldur(){
fdAyarDogrula(false);
const liste=document.getElementById('ayarPoliceVarlikListesi');if(!liste)return;liste.innerHTML='';policeVarlikTurleriniDuzelt().forEach(policeAyarVarlikSatiri);}

function policeAyarVarlikEkle(){
fdAyarDogrula(false);
const alan=document.getElementById('ayarYeniPoliceVarlik'),ad=policeMetinAnahtari(alan.value);if(!ad)return;const mevcut=[...document.querySelectorAll('.ayar-police-varlik-turu')].map(x=>policeMetinAnahtari(x.value));if(mevcut.includes(ad))return showToast('Bu varlık türü zaten listede.','warning');policeAyarVarlikSatiri(ad);alan.value='';}

function anaMenuAyarTaslaginiFormdanOku(){
fdAyarDogrula(false);

        if (!yetkiMatrisiniDuzenleyebilir()) return anaMenuModulAyarlariniDuzelt();
        const liste=document.getElementById('ayarlarModulListesi');if(!liste)return anaMenuAyarTaslagi;
        anaMenuAyarTaslagi=anaMenuAyarTaslagi.map(modul=>{
            const satir=liste.querySelector('[data-modul-anahtar="'+modul.anahtar+'"]');if(!satir)return modul;
            const yetkiler={Admin:'yazma'};satir.querySelectorAll('.ayar-rol-yetki-select').forEach(select=>{yetkiler[select.dataset.rol]=['yok','okuma','yazma'].includes(select.value)?select.value:'yok';});
            const kullaniciYetkileri={};satir.querySelectorAll('.ayar-kullanici-yetki').forEach(select=>{const anahtar=kullaniciYetkiAnahtari(select.dataset.kullanici);if(anahtar&&['yok','okuma','yazma'].includes(select.value))kullaniciYetkileri[anahtar]=select.value;});
            const aktif=Boolean(satir.querySelector('.ayar-modul-aktif')?.checked),roller=Object.entries(yetkiler).filter(([,seviye])=>seviye!=='yok').map(([rol])=>rol);
            return {...modul,ad:String(satir.querySelector('.ayar-modul-ad')?.value||'').trim()||modul.ad,aciklama:String(satir.querySelector('.ayar-modul-aciklama')?.value||'').trim()||modul.aciklama,yetkiler,kullaniciYetkileri,kullaniciBazliYetki:false,roller,aktif};
        });
        return anaMenuAyarTaslagi;
    }

function ayarlarKullaniciIstisnasiEkle(modulAnahtari){
fdAyarDogrula(true);

        if (!yetkiMatrisiniDuzenleyebilir()) return showToast('Modül yetkilerini yalnızca Admin değiştirebilir.','warning');
        anaMenuAyarTaslaginiFormdanOku();
        const satir=document.getElementById('ayarlarModulListesi')?.querySelector('[data-modul-anahtar="'+modulAnahtari+'"]'),secim=satir?.querySelector('.ayar-istisna-kullanici-sec')?.value,anahtar=kullaniciYetkiAnahtari(secim);
        if(!anahtar)return showToast('Önce kullanıcı seçin.','warning');
        anaMenuAyarTaslagi=anaMenuAyarTaslagi.map(modul=>modul.anahtar===modulAnahtari?{...modul,kullaniciYetkileri:{...(modul.kullaniciYetkileri||{}),[anahtar]:'yazma'}}:modul);
        ayarlarModulListesiniCiz();
        const yeniSatir=document.getElementById('ayarlarModulListesi')?.querySelector('[data-modul-anahtar="'+modulAnahtari+'"]');
        if(yeniSatir){yeniSatir.open=true;const detay=yeniSatir.querySelector('.ayar-istisna-detay');if(detay)detay.open=true;}
        showToast('İstisna eklendi. Kalıcı olması için Ayarları Kaydet düğmesine basın.','success');
    }

function ayarlarKullaniciIstisnaYetkisiniGuncelle(modulAnahtari,kullaniciAnahtari,seviye){
fdAyarDogrula(true);

        if (!yetkiMatrisiniDuzenleyebilir()) return showToast('Modül yetkilerini yalnızca Admin değiştirebilir.','warning');
        const anahtar=kullaniciYetkiAnahtari(kullaniciAnahtari),duzey=['yok','okuma','yazma'].includes(seviye)?seviye:'yok';
        if(!anahtar)return;
        anaMenuAyarTaslagi=anaMenuAyarTaslagi.map(modul=>modul.anahtar===modulAnahtari?{...modul,kullaniciYetkileri:{...(modul.kullaniciYetkileri||{}),[anahtar]:duzey}}:modul);
    }

function ayarlarKullaniciIstisnasiSil(modulAnahtari,kullaniciAnahtari){
fdAyarDogrula(true);

        if (!yetkiMatrisiniDuzenleyebilir()) return showToast('Modül yetkilerini yalnızca Admin değiştirebilir.','warning');
        anaMenuAyarTaslaginiFormdanOku();
        anaMenuAyarTaslagi=anaMenuAyarTaslagi.map(modul=>{if(modul.anahtar!==modulAnahtari)return modul;const kullaniciYetkileri={...(modul.kullaniciYetkileri||{})};delete kullaniciYetkileri[kullaniciYetkiAnahtari(kullaniciAnahtari)];return {...modul,kullaniciYetkileri};});
        ayarlarModulListesiniCiz();
    }

function ayarlarModulListesiniCiz(){
fdAyarDogrula(false);

        const liste=document.getElementById('ayarlarModulListesi');if(!liste)return;
        if(!Array.isArray(anaMenuAyarTaslagi)||!anaMenuAyarTaslagi.length)anaMenuAyarTaslagi=anaMenuModulAyarlariniDuzelt(VARSAYILAN_ANA_MENU_MODULLERI);
        const seviyeSecenekleri=[['yok','Gizli'],['okuma','Sadece Okuma'],['yazma','Tam Yetki']];
        const seviyeEtiketleri=Object.fromEntries(seviyeSecenekleri);
        let yetkiKullanicilari=[];
        try{yetkiKullanicilari=anaMenuYetkiKullanicilari();}catch(error){
if(!fdAyarGecerli())return;
console.warn('Yetki kullanıcıları hazırlanamadı:',error);}
        const kullaniciHaritasi=new Map(yetkiKullanicilari.map(k=>[kullaniciYetkiAnahtari(k.username),k]));
        const modulSatiri=(modul,index,kisilerAktif=true)=>{
            const rolAlanlari=[['Yonetici','Kullanıcı'],['Personel','Personel']].map(([rol,etiket])=>{const seviye=String(modul.yetkiler?.[rol]||'yok');return '<label class="ayar-rol-yetki"><span>'+etiket+'</span><select class="ayar-rol-yetki-select" data-rol="'+rol+'" data-seviye="'+seviye+'" onchange="this.dataset.seviye=this.value">'+seviyeSecenekleri.map(([deger,ad])=>'<option value="'+deger+'" '+(deger===seviye?'selected':'')+'>'+ad+'</option>').join('')+'</select></label>';}).join('');
            const istisnalar=kisilerAktif?Object.entries(modul.kullaniciYetkileri||{}).filter(([anahtar])=>kullaniciHaritasi.has(anahtar)):[];
            const istisnaSatirlari=istisnalar.length?istisnalar.map(([anahtar,seviye])=>{const kullanici=kullaniciHaritasi.get(anahtar),ad=String(kullanici?.ad||kullanici?.username||anahtar);return '<div class="ayar-kullanici-istisna"><strong title="'+escapeDashboardText(kullanici?.username||anahtar)+'">'+escapeDashboardText(ad)+'</strong><select class="ayar-kullanici-yetki" data-kullanici="'+escapeDashboardText(anahtar)+'" onchange="ayarlarKullaniciIstisnaYetkisiniGuncelle(\''+escapeDashboardText(modul.anahtar)+'\',\''+escapeDashboardText(anahtar)+'\',this.value)">'+seviyeSecenekleri.map(([deger,etiket])=>'<option value="'+deger+'" '+(deger===seviye?'selected':'')+'>'+etiket+'</option>').join('')+'</select><button type="button" title="Rol ayarına döndür" onclick="ayarlarKullaniciIstisnasiSil(\''+escapeDashboardText(modul.anahtar)+'\',\''+escapeDashboardText(anahtar)+'\')">×</button></div>';}).join(''):'<small style="color:#64748b;">Kişiye özel istisna yok; rol ayarı kullanılır.</small>';
            const kullanilabilir=kisilerAktif?yetkiKullanicilari.filter(k=>!Object.prototype.hasOwnProperty.call(modul.kullaniciYetkileri||{},kullaniciYetkiAnahtari(k.username))):[];
            const ekleme=kullanilabilir.length?'<div class="ayar-istisna-ekle"><select class="ayar-istisna-kullanici-sec"><option value="">Kullanıcı seçin...</option>'+kullanilabilir.map(k=>'<option value="'+escapeDashboardText(kullaniciYetkiAnahtari(k.username))+'">'+escapeDashboardText(String(k.ad||k.username))+'</option>').join('')+'</select><button type="button" onclick="ayarlarKullaniciIstisnasiEkle(\''+escapeDashboardText(modul.anahtar)+'\')">＋ İstisna Ekle</button></div>':'';
            const yetkiAlani='<div class="ayar-yetki-kapsam"><div class="ayar-yetki-grup"><span class="ayar-yetki-grup-baslik">Rol varsayılanları</span><div class="ayarlar-roller">'+rolAlanlari+'</div></div><details class="ayar-istisna-detay"><summary><span>Kişiye özel kullanıcı yetkileri</span><b>'+istisnalar.length+'</b></summary><div class="ayar-istisna-icerik"><div class="ayar-istisna-listesi">'+istisnaSatirlari+'</div>'+ekleme+'</div></details></div>';
            const yetkiOzetleri=[['Kullanıcı',seviyeEtiketleri[String(modul.yetkiler?.Yonetici||'yok')]||'Gizli'],['Personel',seviyeEtiketleri[String(modul.yetkiler?.Personel||'yok')]||'Gizli']].map(([rol,seviye])=>'<span>'+rol+': '+seviye+'</span>').join('')+(istisnalar.length?'<span>'+istisnalar.length+' kullanıcı istisnası</span>':'');
            return '<details class="ayarlar-modul-satiri" data-modul-anahtar="'+escapeDashboardText(modul.anahtar)+'"><summary class="ayarlar-modul-ozet"><span class="ayarlar-modul-no">'+(index+1)+'</span><span class="ayarlar-modul-kimlik"><strong>'+escapeDashboardText(modul.ad)+'</strong><small>'+escapeDashboardText(modul.aciklama)+'</small></span><span class="ayarlar-modul-yetki-ozet">'+yetkiOzetleri+'</span><span class="ayarlar-modul-durum '+(modul.aktif?'':'pasif')+'">'+(modul.aktif?'Aktif':'Kapalı')+'</span></summary><div class="ayarlar-modul-govde"><div class="ayarlar-modul-sira"><span>Sıra</span><button type="button" title="Yukarı taşı" onclick="ayarlarModulSirasiniDegistir('+index+',-1)">↑</button><button type="button" title="Aşağı taşı" onclick="ayarlarModulSirasiniDegistir('+index+',1)">↓</button></div><div class="ayarlar-modul-bilgiler"><label class="ayarlar-modul-alan"><span>Modül adı</span><input class="ayar-modul-ad" type="text" data-case-preserve="true" value="'+escapeDashboardText(modul.ad)+'"></label><label class="ayarlar-modul-alan"><span>Ana menü açıklaması</span><textarea class="ayar-modul-aciklama" data-case-preserve="true">'+escapeDashboardText(modul.aciklama)+'</textarea></label><div class="ayarlar-aktif"><label><input class="ayar-modul-aktif" type="checkbox" '+(modul.aktif?'checked':'')+' onchange="ayarlarModulAktifDurumunuGuncelle(this)"> Ana menüde göster</label></div></div>'+yetkiAlani+'</div></details>';
        };
        try{liste.innerHTML=anaMenuAyarTaslagi.map((modul,index)=>modulSatiri(modul,index,true)).join('');}
        catch(error){
if(!fdAyarGecerli())return;
console.error('Ana Menü yetki listesi ayrıntılı çizilemedi:',error);anaMenuAyarTaslagi=anaMenuModulAyarlariniDuzelt(VARSAYILAN_ANA_MENU_MODULLERI);liste.innerHTML=anaMenuAyarTaslagi.map((modul,index)=>modulSatiri(modul,index,false)).join('');}
        if(!liste.children.length)liste.innerHTML='<div style="padding:18px;border:1px solid #fecaca;border-radius:12px;background:#fff1f2;color:#991b1b;font-weight:800;">Ana Menü listesi hazırlanamadı. Sayfayı yenileyip tekrar açın.</div>';
        liste.querySelectorAll('.ayarlar-modul-satiri').forEach(detay=>detay.addEventListener('toggle',()=>{if(!detay.open)return;liste.querySelectorAll('.ayarlar-modul-satiri[open]').forEach(diger=>{if(diger!==detay)diger.open=false;});}));
        if (!yetkiMatrisiniDuzenleyebilir()) liste.querySelectorAll('input,select,button,textarea').forEach(field=>field.disabled=true);
        ayarlarModulListesiniFiltrele(document.getElementById('ayarlarModulAra')?.value||'');
    }

function ayarlarAnaMenuPaneliniYenile(){
fdAyarDogrula(false);

        const liste=document.getElementById('ayarlarModulListesi');if(!liste)return;
        try{
            const kayitli=Array.isArray(uygulamaAyarlari?.anaMenuModulleri)&&uygulamaAyarlari.anaMenuModulleri.length?uygulamaAyarlari.anaMenuModulleri:VARSAYILAN_ANA_MENU_MODULLERI;
            anaMenuAyarTaslagi=anaMenuModulAyarlariniDuzelt(kayitli);
        }catch(error){
if(!fdAyarGecerli())return;
console.error('Ana Menü ayarları hazırlanamadı:',error);anaMenuAyarTaslagi=anaMenuModulAyarlariniDuzelt(VARSAYILAN_ANA_MENU_MODULLERI);}
        ayarlarModulListesiniCiz();
    }

function ayarlarModulSirasiniDegistir(index,yons){
fdAyarDogrula(true);

        if (!yetkiMatrisiniDuzenleyebilir()) return showToast('Modül yetkilerini yalnızca Admin değiştirebilir.','warning');
        anaMenuAyarTaslaginiFormdanOku();const hedef=index+yons;if(hedef<0||hedef>=anaMenuAyarTaslagi.length)return;[anaMenuAyarTaslagi[index],anaMenuAyarTaslagi[hedef]]=[anaMenuAyarTaslagi[hedef],anaMenuAyarTaslagi[index]];anaMenuAyarTaslagi=anaMenuAyarTaslagi.map((m,sira)=>({...m,sira}));ayarlarModulListesiniCiz();
    }

function anaMenuAyarlariniFormdanOku(){
fdAyarDogrula(false);
if(!yetkiMatrisiniDuzenleyebilir())return anaMenuModulAyarlariniDuzelt();return anaMenuModulAyarlariniDuzelt(anaMenuAyarTaslaginiFormdanOku().map((m,sira)=>({...m,sira})));}

function fdPuantajRenkAyarlariniKur(){
fdAyarDogrula(false);
const panel=document.getElementById('ayarlarPanelPersonel')||document.getElementById('uygulamaAyarlariForm');if(!panel||document.getElementById('fdPuantajRenkAyari'))return;const detay=document.createElement('details');detay.id='fdPuantajRenkAyari';detay.className='profile-section';const adlar={X:'Çalıştı',Y:'Yıllık İzin',R:'Rapor','Ü':'Ücretli İzin',Z:'Ücretsiz İzin',M:'Gelmedi / Mazeretsiz',HS:'Hafta Sonu',RT:'Resmi Tatil',YT:'Yarım Gün Resmî Tatil',RC:'Resmi Tatil Çalışma',PZ:'Pazar Çalışma','-':'Boş'};const renkler=fdPuantajRenkleri();detay.innerHTML='<summary>Puantaj ve Prim Hücre Renkleri</summary><div><p style="margin:0 0 10px;color:#64748b">Hücre ve yazı renkleri puantaj ile prim tablolarına birlikte uygulanır.</p><div style="display:grid;gap:7px">'+Object.keys(adlar).map(k=>'<div style="display:grid;grid-template-columns:minmax(150px,1fr) 92px 92px;gap:8px;align-items:center"><strong>'+k+' · '+adlar[k]+'</strong><label style="font-size:.72rem">Hücre <input type="color" data-pr-kod="'+k+'" data-pr-tip="0" value="'+renkler[k][0]+'"></label><label style="font-size:.72rem">Yazı <input type="color" data-pr-kod="'+k+'" data-pr-tip="1" value="'+renkler[k][1]+'"></label></div>').join('')+'</div><div style="display:flex;justify-content:flex-end;margin-top:12px"><button type="button" class="btn-submit" style="width:auto;margin:0" onclick="fdPuantajRenkleriniKaydet()">Renkleri Kaydet</button></div></div>';panel.prepend(detay);}

async function fdPuantajRenkleriniKaydet(){
try{
fdAyarDogrula(true);
const renkler=fdPuantajRenkleri();document.querySelectorAll('#fdPuantajRenkAyari input[type=color]').forEach(x=>renkler[x.dataset.prKod][Number(x.dataset.prTip)]=fdRenkHex(x.value,renkler[x.dataset.prKod][Number(x.dataset.prTip)]));try{await fdAyarBekle(sirketUygulamaAyarParcasiKaydet({puantajRenkleri:renkler}));if(SUPABASE_MODE&&activeUser?.sirketId){const {error}=await fdAyarBekle(supabaseClient.from('portal_settings').upsert({company_id:activeUser.sirketId,setting_key:'puantaj_renkleri',value:renkler},{onConflict:'company_id,setting_key'}));if(error)throw error;}uygulamaAyarlari.puantajRenkleri=renkler;fdPuantajRenkleriniUygula();showToast('Puantaj ve prim renkleri kalıcı olarak kaydedildi.');}catch(e){
if(!fdAyarGecerli())return;
showToast('Renkler kaydedilemedi: '+(e.message||e),'error');}
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
}

function fdTakvimAyarlariniKur(){
fdAyarDogrula(false);
const panel=document.getElementById('ayarlarPanelSistem');if(!panel||document.getElementById('fdTakvimAyarlari'))return;const d=document.createElement('details');d.id='fdTakvimAyarlari';d.className='profile-section';d.innerHTML='<summary>Takvim ve Hatırlatma Ayarları</summary><div><div class="form-row"><div class="form-group"><label>Varsayılan Bildirim (Gün Önce)</label><input id="ayarTakvimBildirimGun" type="number" min="0" max="365" value="'+Number(uygulamaAyarlari.takvimHatirlatmaGunu??1)+'"></div><div class="form-group"><label>Varsayılan Bildirim Saati</label><input id="ayarTakvimBildirimSaat" type="time" value="'+esc(uygulamaAyarlari.takvimHatirlatmaSaati||'09:00')+'"></div></div><p style="color:#64748b">Manuel takvim kayıtlarının bildirimleri yalnızca Admin ve Kullanıcı rollerine gönderilir.</p><button type="button" class="btn-submit" style="width:auto;margin:0" onclick="fdTakvimAyarlariniKaydet()">Ayarları Kaydet</button></div>';panel.appendChild(d)}

async function fdTakvimAyarlariniKaydet(){
try{
fdAyarDogrula(true);
const gun=Math.min(365,Math.max(0,Number(document.getElementById('ayarTakvimBildirimGun').value||0))),saat=document.getElementById('ayarTakvimBildirimSaat').value||'09:00';try{await fdAyarBekle(sirketUygulamaAyarParcasiKaydet({takvimHatirlatmaGunu:gun,takvimHatirlatmaSaati:saat}));uygulamaAyarlari.takvimHatirlatmaGunu=gun;uygulamaAyarlari.takvimHatirlatmaSaati=saat;showToast('Takvim ayarları kaydedildi.')}catch(e){
if(!fdAyarGecerli())return;
showToast('Takvim ayarları kaydedilemedi: '+(e.message||e),'error')}
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
}

async function kvkkAyarlariniYukle(){
try{
fdAyarDogrula(false);

        if(!isManagerUser())return;const durum=document.getElementById('ayarKvkkDurum');if(!durum)return;durum.textContent='Güncel metin yükleniyor...';
        try{const sonuc=await fdAyarBekle(cagir({action:'get-active'})),belge=sonuc.document||{};document.getElementById('ayarKvkkBaslik').value=belge.title||'';document.getElementById('ayarKvkkSurum').value=belge.version||'1.0';document.getElementById('ayarKvkkMetni').value=belge.content||'';durum.textContent='Yürürlükteki sürüm: '+(belge.version||'-')+' · '+new Date(belge.created_at).toLocaleString('tr-TR');}
        catch(error){
if(!fdAyarGecerli())return;
durum.textContent=hataMetni(error,'Metin yüklenemedi.');durum.style.color='#b91c1c'}
    
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
}

async function kvkkMetniniYayinla(dugme){
try{
fdAyarDogrula(true);

        if(!isManagerUser())return;const title=document.getElementById('ayarKvkkBaslik').value.trim(),version=document.getElementById('ayarKvkkSurum').value.trim(),content=document.getElementById('ayarKvkkMetni').value.trim();
        if(!title||!version||content.length<300)return showToast('Başlık, sürüm ve ayrıntılı metni doldurun.','warning');
        if(!await fdAyarBekle(fdYuzerOnaySor('Yeni sürüm yayımlandığında tüm kullanıcıların uygulamaya devam etmek için bu metni yeniden teyit etmesi gerekir. Yayımlansın mı?','KVKK Metnini Yayımla','Yayımla')))return;
        const eski=dugme.innerHTML;dugme.disabled=true;dugme.textContent='Yayımlanıyor...';
        try{const sonuc=await fdAyarBekle(cagir({action:'publish',title,version,content}));if(sonuc.unchanged)showToast('Metinde veya sürümde değişiklik yok.','warning');else{showToast('Yeni KVKK aydınlatma metni yayımlandı.','success');await fdAyarBekle(fdKvkkErisimKontrolu(true))}}
        catch(error){
if(!fdAyarGecerli())return;
showToast(hataMetni(error,'Metin yayımlanamadı.'),'error')}
        finally{
if(fdAyarGecerli()){
dugme.disabled=false;dugme.innerHTML=eski
}
}
    
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
}
const policeAyarKurVarlikOncesi=policeAyarArayuzunuKur;
policeAyarArayuzunuKur=function policeAyarArayuzunuKur(){
fdAyarDogrula(false);
policeAyarKurVarlikOncesi();const detay=document.getElementById('policeAyarDetay');if(!detay||document.getElementById('ayarPoliceVarlikListesi'))return;const kaydet=detay.querySelector('.btn-submit')?.parentElement,grup=document.createElement('div');grup.className='form-group';grup.innerHTML='<label>Kullanılacak Varlık Türleri</label><div id="ayarPoliceVarlikListesi"></div><div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px"><input id="ayarYeniPoliceVarlik" placeholder="Yeni varlık türü"><button type="button" class="btn-modern btn-detail-modern" onclick="policeAyarVarlikEkle()">＋ Ekle</button></div>';kaydet?.before(grup);policeAyarVarliklariniDoldur();};
policeAyarlariniKaydet=async function policeAyarlariniKaydet(){
try{
fdAyarDogrula(true);
const turler=policeTurleriniDuzelt([...document.querySelectorAll('.ayar-police-turu')].map(x=>x.value)),varlikTurleri=policeVarlikTurleriniDuzelt([...document.querySelectorAll('.ayar-police-varlik-turu')].map(x=>x.value)),gun=Math.min(365,Math.max(1,Number(document.getElementById('ayarPoliceHatirlatmaGunu').value||30)));showGlobalOverlay('Poliçe ayarları kaydediliyor','Türler ve uyarı süresi uygulanıyor...');try{await fdAyarBekle(sirketUygulamaAyarParcasiKaydet({policeTurleri:turler,policeVarlikTurleri:varlikTurleri,policeHatirlatmaGunu:gun}));policeAyarFormunuDoldur();policeAyarVarliklariniDoldur();policeTurSecenekleriniDoldur();policeHedefTipSecenekleriniDoldur();showToast('Poliçe ayarları kaydedildi.');}catch(error){
if(!fdAyarGecerli())return;
showToast('Poliçe ayarları kaydedilemedi: '+(error.message||error),'error');}finally{
if(fdAyarGecerli()){
hideGlobalOverlay();
}
}
}catch(fdScopeError){if(!fdAyarGecerli())return;throw fdScopeError;}
};
let fdAyarKayitTamamlandi;
{
    let mesgul=false,degisti=false;
    const el=id=>document.getElementById(id),normalize=s=>String(s||'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    function durum(){const alan=el('fdAyarKayitDurumu');if(alan){alan.textContent=mesgul?'Ayarlar kaydediliyor…':degisti?'Kaydedilmemiş değişiklikler var.':'Ayarlar seçili şirkete aittir.';alan.classList.toggle('degisti',degisti)}}
    fdAyarKayitTamamlandi=function(){degisti=false;durum()};
    function bolumAc(panel){if(!panel)return;const buton=[...document.querySelectorAll('#ayarlarApp .ayarlar-sol-menu button')].find(b=>(b.getAttribute('onclick')||'').includes(panel.id));ayarlarBolumAc(panel.id,buton)}
    function alaniGoster(alan){bolumAc(alan.closest('.ayarlar-panel'));for(let p=alan.parentElement;p&&p!==el('uygulamaAyarlariForm');p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;requestAnimationFrame(()=>{alan.scrollIntoView({block:'center',behavior:'smooth'});alan.focus({preventScroll:true});const grup=alan.closest('.form-group')||alan;grup.classList.add('fd-ayar-vurgu');setTimeout(()=>grup.classList.remove('fd-ayar-vurgu'),2200)})}
    function ara(q){const sonuc=el('fdAyarAramaSonuclari');if(!sonuc)return;sonuc.replaceChildren();q=normalize(q).trim();sonuc.hidden=!q;if(!q)return;const form=el('uygulamaAyarlariForm'),alanlar=[...form.querySelectorAll('.form-group,.isg-field')].map(grup=>({grup,alan:grup.querySelector('input:not([type=file]),select,textarea'),etiket:(grup.matches('label')?grup.querySelector('span'):grup.querySelector('label'))?.textContent?.trim()})).filter(x=>x.alan&&x.etiket&&normalize(x.grup.textContent+' '+x.alan.closest('.ayarlar-panel')?.querySelector('h3')?.textContent).includes(q));
        const detaylar=[...form.querySelectorAll('details.profile-section')].filter(d=>normalize(d.querySelector('summary')?.textContent).includes(q));const ekle=(ad,panel,ac)=>{const b=document.createElement('button');b.type='button';const bas=document.createElement('span');bas.textContent=ad;const alt=document.createElement('small');alt.textContent=panel?.querySelector('h3')?.textContent||'Ayarlar';b.append(bas,alt);b.addEventListener('click',ac);sonuc.appendChild(b)};
        alanlar.slice(0,18).forEach(x=>ekle(x.etiket,x.alan.closest('.ayarlar-panel'),()=>alaniGoster(x.alan)));detaylar.filter(d=>!alanlar.some(x=>d.contains(x.alan))).slice(0,8).forEach(d=>ekle(d.querySelector('summary').textContent,d.closest('.ayarlar-panel'),()=>{bolumAc(d.closest('.ayarlar-panel'));d.open=true;d.scrollIntoView({block:'start',behavior:'smooth'})}));[...form.querySelectorAll('.ayarlar-panel')].filter(p=>!alanlar.some(x=>p.contains(x.alan))&&normalize(p.querySelector('.ayarlar-panel-baslik')?.textContent).includes(q)).slice(0,5).forEach(p=>ekle(p.querySelector('h3')?.textContent||'Ayarlar',p,()=>bolumAc(p)));if(!sonuc.children.length)sonuc.textContent='Bu kelimeyle eşleşen ayar bulunamadı.';
    }
    function kur(){const form=el('uygulamaAyarlariForm'),ust=document.querySelector('#ayarlarApp .ayarlar-ust');if(!form||!ust||el('fdAyarAra'))return;
        ust.querySelector('p').textContent='Şirketin çalışma kurallarını ve modül tercihlerini tek yerden yönetin.';
        const arama=document.createElement('div');arama.className='fd-ayar-arama';arama.innerHTML='<input id="fdAyarAra" type="search" aria-label="Tüm ayarlarda ara" placeholder="Ayar ara… ör. vardiya, izin, araç, yedekleme"><div id="fdAyarAramaSonuclari" class="fd-ayar-sonuclar" aria-live="polite" hidden></div>';ust.after(arama);el('fdAyarAra').addEventListener('input',e=>ara(e.target.value));
        const kaydet=form.querySelector('.ayarlar-kaydet-cubugu');if(kaydet){const span=document.createElement('span');span.id='fdAyarKayitDurumu';span.className='fd-ayar-durum';span.setAttribute('aria-live','polite');kaydet.prepend(span)}
        const personel=el('ayarlarPanelPersonel');if(personel){const bilgi=document.createElement('p');bilgi.className='fd-ayar-bilgi';bilgi.textContent='Maaş ve mesai hesabını etkileyen değişiklikler içinde bulunduğunuz ay ve sonrasında uygulanır. Önceki ayların kayıtlı hesap ayarları korunur.';personel.querySelector('.ayarlar-panel-baslik')?.after(bilgi)}
        const sablon=el('ayarOtomatikBildirimBolumu');const aciklama=sablon?.querySelector(':scope > div > p');if(aciklama)aciklama.textContent='Her mesajın saatini veya işlem sonrası bekleme süresini kendi kartından ayarlayın. Saatler Türkiye saatidir; kuyruk bu saatten önce başlamaz. Sabah giriş–çıkış verileri aktarıldıktan sonra günlük mesajlar hazırlanır. Değişiklikler yeni hazırlanacak mesajlara uygulanır; mevcut kuyruk, personel tercihleri ve gönderilmiş mesajlar değişmez.';
        for(const detay of form.querySelectorAll('details.profile-section')){const summary=detay.querySelector('summary');if(!summary)continue;if(/Bulut Yedekleme/.test(summary.textContent)){const bilgi=document.createElement('p');bilgi.className='fd-ayar-bilgi';bilgi.textContent='Bu bölümde değiştirdiğiniz yedekleme seçenekleri otomatik kaydedilir.';detay.querySelector(':scope > div')?.prepend(bilgi)}for(const label of detay.querySelectorAll('.form-group>label')){const input=label.parentElement.querySelector('input,select,textarea');if(input?.id&&!label.querySelector('input,select,textarea'))label.htmlFor=input.id}}
        form.addEventListener('input',e=>{if(e.target.id==='ayarlarModulAra'||e.target.type==='file')return;const d=e.target.closest('details.profile-section');if(/Bulut Yedekleme/.test(d?.querySelector('summary')?.textContent||''))return;degisti=true;durum()});
        form.addEventListener('change',e=>{const d=e.target.closest('details.profile-section');if(e.target.type!=='file'&&!/Bulut Yedekleme/.test(d?.querySelector('summary')?.textContent||'')){degisti=true;durum()}});
        form.addEventListener('invalid',e=>{if(e.target.form===form&&[...form.elements].find(x=>x.willValidate&&!x.validity.valid)===e.target)alaniGoster(e.target)},true);durum();
    }
    const duzenle=ayarlarArayuzunuDuzenle;ayarlarArayuzunuDuzenle=function(){const r=duzenle.apply(this,arguments);kur();const badge=document.querySelector('#ayarlarApp .ayarlar-ust .badge');if(badge)badge.textContent=activeUser?.sirketAdi||'Seçili şirket';return r};
    const kaydet=uygulamaAyarlariniKaydet;uygulamaAyarlariniKaydet=async function(event){fdAyarDogrula(true);event.preventDefault();if(mesgul)return;const form=el('uygulamaAyarlariForm');if(!form.checkValidity()){alaniGoster([...form.elements].find(x=>x.willValidate&&!x.validity.valid));return form.reportValidity()}mesgul=true;durum();const buttons=[...form.elements].filter(b=>b.tagName==='BUTTON'&&b.type==='submit').map(b=>({b,disabled:b.disabled,text:b.textContent}));buttons.forEach(({b})=>{b.disabled=true;b.textContent='Kaydediliyor…'});try{return await kaydet.apply(this,arguments)}finally{mesgul=false;if(fdAyarGecerli())buttons.forEach(({b,disabled,text})=>{b.disabled=disabled;b.textContent=text});if(fdAyarGecerli())durum()}};
}
function note(){const panel=document.getElementById('ayarlarPanelPersonel');if(panel&&!document.getElementById('fdDonemKorumaNotu'))panel.insertAdjacentHTML('afterbegin','<div id="fdDonemKorumaNotu" style="padding:12px 14px;margin-bottom:14px;border:1px solid #b9dce9;border-radius:9px;background:#f0f9fc;color:#315b72;font-size:13px;line-height:1.5">Vardiya, mesai, prim ve ücret değişiklikleri kaydedildiği aydan itibaren geçerlidir. Önceki aylar kendi ayarlarıyla hesaplanır; geçmiş kayıtlar geriye dönük değiştirilmez.</div>');}
return {open(){fdAyarDogrula();openAyarlarApp.apply(this,arguments);policeAyarArayuzunuKur();fdPuantajRenkAyarlariniKur();fdPuantajRenkleriniUygula();note();},api:{ayarlarBolumAc,siparisAyarBirimSeciminiYenile,whatsappVardiyaSubeSeciminiCiz,whatsappVardiyaSubeSecilenleriniOku,ozelAyarPanelleriniKur,ozelAyarFormlariniDoldur,ayarlarModulListesiniFiltrele,ayarlarModulAktifDurumunuGuncelle,ayarlarArayuzunuDuzenle,irsaliyeAyarBirimDegerleri,irsaliyeAyarVarsayilanSecenegiGuncelle,irsaliyeAyarBirimSatiriEkle,irsaliyeAyarBirimListesiniDoldur,irsaliyeAyarBirimiEkle,aracAyarTurDegerleri,aracAyarTurSatiriEkle,aracAyarTurListesiniDoldur,aracAyarTuruEkle,aracTurleriniAyricaKaydet,alanAdiTescilAyarlariniFormdanOku,alanAdiTescilBelgesiniOnizle,alanAdiTescilAyariniKaydet,ayarlarFormunuDoldur,yedeklemeAyarGorunumunuGuncelle,yedeklemeFormDegerleriniOku,yedeklemeAyariniOrtakKaydet,yedeklemeAyariniSunucudanDogrula,yedeklemeAyarlariniKaydet,yedeklemeDurumunuGoster,yedeklemeHemenIste,uygulamaAyarlariniKaydet,whatsappSablonBildirimAyarlariniDoldur,whatsappSablonBildirimAyarlariniOku,magicpassGunlukRaporAyarlariniDoldur,otomatikBildirimSablonDegerleriniOku,otomatikBildirimMetinleriniKaydet,magicpassRaporAyarlariniKaydet,policeAyarArayuzunuKur,policeAyarTurSatiri,policeAyarFormunuDoldur,policeAyarTuruEkle,policeAyarlariniKaydet,policeAyarVarlikSatiri,policeAyarVarliklariniDoldur,policeAyarVarlikEkle,anaMenuAyarTaslaginiFormdanOku,ayarlarKullaniciIstisnasiEkle,ayarlarKullaniciIstisnaYetkisiniGuncelle,ayarlarKullaniciIstisnasiSil,ayarlarModulListesiniCiz,ayarlarAnaMenuPaneliniYenile,ayarlarModulSirasiniDegistir,anaMenuAyarlariniFormdanOku,fdPuantajRenkAyarlariniKur,fdPuantajRenkleriniKaydet,fdTakvimAyarlariniKur,fdTakvimAyarlariniKaydet,kvkkAyarlariniYukle,kvkkMetniniYayinla,fdAyarKayitTamamlandi},dispose(){fdAyarDisposed=true;for(const request of fdAyarIstekleri)request.abort();fdAyarIstekleri.clear();for(const timer of fdAyarTimers)window.clearTimeout(timer);fdAyarTimers.clear();window.fdIsgWorkspace?.unmountSettings?.();anaMenuAyarTaslagi=[];if(fdAyarOverlay)hideGlobalOverlay();document.querySelectorAll("#ayarlarApp form").forEach(f=>f.reset());}};
});
