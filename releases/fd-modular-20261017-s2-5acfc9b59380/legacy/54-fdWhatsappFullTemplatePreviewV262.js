
/* Read-only, complete WhatsApp previews next to the editable message bodies. */
(function(root){
 'use strict';
 const state={key:'',epoch:0,loaded:0,promise:null,personnel:[],price:null,error:''};
 const catalog=Array.isArray(root.fdPersonnelTemplateCatalog)?root.fdPersonnelTemplateCatalog:[];
 const signature='Kanal Mermer bildirim sisteminden gönderilmiştir.';
 function context(){const u=typeof activeUser!=='undefined'?activeUser:null;return u&&['Admin','Yonetici'].includes(u.rol)?[u.sirketId,u.supabaseUserId||u.id||u.tcNo,u.rol].join('|'):''}
 function content(name,message){let value=String(message||'').trim();for(const prefix of ['Sayın '+name+',',name+',']){if(name&&value.slice(0,prefix.length).toLocaleLowerCase('tr-TR')===prefix.toLocaleLowerCase('tr-TR')){value=value.slice(prefix.length).trimStart();break}}if(value.endsWith(signature))value=value.slice(0,-signature.length).trimEnd();return value}
 function render(template,message,title,price=false,name='{AD}'){
  const parts=Array.isArray(template?.components)?template.components:[],body=parts.find(p=>p.type==='BODY');
  if(!body?.text)return '';
  const two=body.text.includes('{{2}}')&&!body.text.includes('{{3}}');
  const parameters=(two?[name,content(name,message)]:[name,price?'fiyat listesi':title,message]).map(value=>String(value||'').replace(/[\r\n\t]+/g,' ').replace(/ {4,}/g,' ').trim());
  return parts.filter(p=>['HEADER','BODY','FOOTER'].includes(p.type)&&typeof p.text==='string').map(p=>p.text.replace(/\{\{\s*(\d+)\s*\}\}/g,(match,n)=>parameters[Number(n)-1]??match)).join('\n\n');
 }
 function paint(){
  document.querySelectorAll('textarea[id^="ayarMagicBildirim"]').forEach(input=>{
   const box=input.parentElement.querySelector('.fd-wa-full-template');if(!box)return;
   const price=input.id==='ayarMagicBildirimFiyatDegisiklik',key='magicpassBildirim'+input.id.slice('ayarMagicBildirim'.length)+'Metni';
   const entry=catalog.find(e=>e.key===key),item=state.personnel.find(e=>e.key===key),template=price?state.price:item?.template;
   const label=box.querySelector('strong'),status=box.querySelector('small'),pre=box.querySelector('pre');
   const approved=price?template?.status==='APPROVED'&&template?.category==='UTILITY':item?.ready===true;
   const changed=!price&&entry&&input.value.replace(/\r\n/g,'\n').trim()!==entry.text;
   label.textContent=approved?'WhatsApp’a gidecek tam mesaj':template?.status==='REJECTED'?'Meta tarafından reddedilen şablon':template?'Onay sonrası tam mesaj':'Hazırlanan tam mesaj';
   status.textContent=changed?'Düzenlenen metin gönderim şablonundan farklı; yeni Meta onayı gerekir.':state.error||(!price&&item?.status==='NOT_SUBMITTED'?'Henüz onaya gönderilmedi':template?(approved?'Onaylı'+(template.category==='MARKETING'?' · Pazarlama':''):template.status==='REJECTED'?(item?.rejectedReason==='INCORRECT_CATEGORY'?'Kategori nedeniyle reddedildi · Meta’da inceleme gerekiyor':'Reddedildi · Gönderim bekletiliyor'):template.category!==entry?.payload?.category&&!price?'Meta kategorisi farklı · Gönderim bekletiliyor':template.status==='PENDING'?'Meta onayı bekleniyor':String(template.status||'Onay doğrulanamadı')):'Şablon kontrol ediliyor…');
   let full='';
   if(price)full=template?render(template,input.value,'Fiyat Listesi Güncellemesi',true):'Tam mesaj henüz doğrulanamadı.';
   else if(template)full=(template.components||[]).filter(p=>['HEADER','BODY','FOOTER'].includes(p.type)&&typeof p.text==='string').map(p=>p.text.replace(/\{\{\s*(\d+)\s*\}\}/g,(match,n)=>entry?.variables[Number(n)-1]?'{'+entry.variables[Number(n)-1]+'}':match)).join('\n\n');
   else full=entry?.text||'Tam mesaj henüz doğrulanamadı.';
   pre.innerHTML=format(full);
  });
 }
 async function load(force=false){
  const key=context();if(!key)return;
  if(state.key!==key){state.key=key;state.epoch++;state.loaded=0;state.promise=null;state.personnel=[];state.price=null;state.error=''}
  if(state.promise)return state.promise;if(!force&&Date.now()-state.loaded<60000){paint();return}
  const epoch=state.epoch;state.error='';paint();
  const valid=()=>context()===key&&state.key===key&&state.epoch===epoch;
  const promise=(async()=>{
   try{
    const [p,f]=await Promise.all([whatsappCagir({action:'personnel-template-info'}),whatsappCagir({action:'price-template-info'})]);
    if(!valid())return;
    state.personnel=Array.isArray(p.items)?p.items:[];
    state.price=(f.templates||[]).find(t=>t.name===f.templateName&&t.language==='tr')||null;
    state.loaded=Date.now();state.error=state.personnel.length?'':'Personel şablonları doğrulanamadı.';
   }catch(error){if(!valid())return;state.error='Meta onayı doğrulanamadı. Durumu yenileyin.';state.personnel=[];state.price=null}
   finally{if(valid()){state.promise=null;paint()}}
  })();state.promise=promise;return promise;
 }
 function format(value){
  if(typeof root.fdWhatsappMetniBicimle==='function')return root.fdWhatsappMetniBicimle(value);
  return String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])).replace(/\*([^*\n]+)\*/g,'<strong>$1</strong>').replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s).,!?:;])/g,'$1<em>$2</em>');
 }
 function install(){
  if(!context())return;
  if(!document.getElementById('fdWhatsappFullPreviewStyle')){const style=document.createElement('style');style.id='fdWhatsappFullPreviewStyle';style.textContent='.fd-wa-full-template{margin:8px 0 14px;padding:11px 13px;border:1px solid #c9e2d7;border-radius:9px;background:#f3faf6}.fd-wa-full-template>div{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}.fd-wa-full-template strong{font-size:12px;color:#22543d}.fd-wa-full-template small{font-size:11px;color:#64748b}.fd-wa-full-template pre{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.6 inherit;font-family:inherit;margin:8px 0 0;color:#253e35}.fd-wa-full-template button{border:0;background:transparent;color:#0369a1;font-size:11px;cursor:pointer;padding:2px 0}';document.head.append(style)}
  document.querySelectorAll('textarea[id^="ayarMagicBildirim"]').forEach(input=>{
   if(input.parentElement.querySelector('.fd-wa-full-template'))return;
   input.maxLength=1024;
   const box=document.createElement('section');box.className='fd-wa-full-template';box.innerHTML='<div><strong></strong><small></small><button type="button">Durumu yenile</button></div><pre></pre>';
   input.parentElement.append(box);input.addEventListener('input',paint);box.querySelector('button').onclick=()=>load(true);
  });paint();return load();
 }
 root.fdWhatsappTamSablonOnizle={install,refresh:()=>load(true),render,content,format};
 const previous=root.magicpassGunlukRaporAyarlariniDoldur;
 if(typeof previous==='function')root.magicpassGunlukRaporAyarlariniDoldur=function(){const value=previous.apply(this,arguments);install();return value};
})(window);

