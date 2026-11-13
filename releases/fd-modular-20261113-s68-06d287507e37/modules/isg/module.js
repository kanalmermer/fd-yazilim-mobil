window.FDModules.define('isg',function(){

'use strict';
let fdIsgDisposed=false;const fdIsgInitial=fdIsgContext(),fdIsgListeners=[],fdIsgTimers=new Set(),fdIsgNodes=new Set(),fdIsgPopups=new Set();
let fdIsgCancel;const fdIsgCancelled=new Promise(resolve=>fdIsgCancel=resolve),fdIsgExports=Object.create(null);
function fdIsgContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('isg'),anaMenuModulYetkisi('ayarlar')])}
function fdIsgSettingsAllowed(){return activeUser?.rol==='Admin'&&anaMenuModulErisimiVar('ayarlar')}
function fdIsgValid(){return !fdIsgDisposed&&fdIsgInitial===fdIsgContext()&&(anaMenuModulErisimiVar('isg')||fdIsgSettingsAllowed())}
function fdIsgAssert(kind='',write=false){if(!fdIsgValid())throw Error('Oturum değişti; İSG ekranını yeniden açın.');if(kind==='workspace'&&!anaMenuModulErisimiVar('isg'))throw Error('İSG modülüne erişim yetkiniz yok.');if(kind==='settings'&&!fdIsgSettingsAllowed())throw Error('İSG ayarlarını yalnız yönetici hesabı düzenleyebilir.');if(write&&!anaMenuModulYazmaYetkisiVar(kind==='settings'?'ayarlar':'isg'))throw Error('Bu modülde değişiklik yapma yetkiniz yok.')}
async function fdIsgAwait(promise){fdIsgAssert();const value=await Promise.race([Promise.resolve(promise),fdIsgCancelled]);fdIsgAssert();return value}
function setTimeout(fn,delay,...args){const id=window.setTimeout(()=>{fdIsgTimers.delete(id);if(fdIsgValid())fn(...args)},delay);fdIsgTimers.add(id);return id}
function fdIsgListen(target,...args){target.addEventListener(...args);fdIsgListeners.push([target,...args])}
function fdIsgListenOptional(target,...args){return target==null?undefined:fdIsgListen(target,...args)}
function fdIsgAppend(...nodes){for(const n of nodes)if(n&&typeof n==='object')fdIsgNodes.add(n);return document.body.append(...nodes)}
function fdIsgAppendChild(node){fdIsgNodes.add(node);return document.body.appendChild(node)}
function fdIsgClean(node){if(!node)return;if(node._url){window.URL.revokeObjectURL(node._url);node._url=null}node.querySelectorAll?.('iframe').forEach(f=>f.src='about:blank');node._blob=null;node.remove?.()}
const fdIsgRoot=new Proxy({}, {get(_target,key){if(Object.hasOwn(fdIsgExports,key))return fdIsgExports[key];if(key==='confirm')return(...args)=>window.confirm(...args);if(key==='open')return(...args)=>{if(!fdIsgValid())return;const popup=window.open(...args);if(popup)fdIsgPopups.add(popup);return popup};if(key==='fdCiktiPdfOnizle')return(...args)=>{if(!fdIsgValid())return;const node=window.fdCiktiPdfOnizle(...args);if(node)fdIsgNodes.add(node);return node};return window[key]},set(_target,key,value){fdIsgExports[key]=value;return true}});
// Track the shared chooser's current group without changing other modules' output behavior.
const fdIsgPriorOutput=window.fdUnifiedOutput?.open;
function fdIsgTrackOutput(group){if(fdIsgValid()&&group?.isgModels){const original=group.isCurrent;group.isCurrent=()=>fdIsgValid()&&(!original||original());}const result=fdIsgPriorOutput.apply(this,arguments),node=document.getElementById('fdUnifiedOutputModal');if(node){if(fdIsgValid()&&group?.isgModels)fdIsgNodes.add(node);else fdIsgNodes.delete(node)}return result}
// The chooser hook is installed only after a verified HTML mount, never during factory construction.


/* Authenticated, branch-scoped ISG workspace. No production records are invented here. */
(function(root){
if(!fdIsgValid())return;

 'use strict';
 const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=v=>String(v??'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
 const statuses={draft:'Taslak',planned:'Planlandı',open:'Açık',in_progress:'Devam ediyor',pending:'Doğrulama bekliyor',completed:'Tamamlandı',approved:'Onaylandı',closed:'Kapandı',cancelled:'İptal edildi',expired:'Süresi geçti'};
 const F=(key,label,type='text',options=null,required=false)=>({key,label,type,options,required});
 const schemas={
  task:{label:'İş / hatırlatma',group:'tasks',fields:[F('category','Konu','select',{general:'Genel',training:'Eğitim',health:'Sağlık',inspection:'Kontrol',emergency:'Acil durum',document:'Evrak'}),F('priority','Öncelik','select',{normal:'Normal',high:'Yüksek',critical:'Kritik'}),F('description','Yapılacak iş','textarea',null,true),F('completionEvidence','Tamamlanma bilgisi / kanıt','textarea'),F('verificationNote','Kontrol / doğrulama notu','textarea')]},
  personDocument:{label:'Personel belgesi / sağlık durumu',group:'people',fields:[F('kind','Belge türü','select',{training:'İSG eğitimi',medical:'Sağlık uygunluk durumu',vocational:'Mesleki yeterlilik',operator:'Operatör belgesi',firstAid:'İlk yardım',other:'Diğer'},true),F('documentNo','Belge numarası'),F('issuer','Düzenleyen kişi / kurum'),F('validFrom','Belge / muayene tarihi','date'),F('validUntil','Geçerlilik / sonraki kontrol','date'),F('fitStatus','Sağlık uygunluk durumu','select',{assessmentPending:'Değerlendirme bekliyor',suitable:'Uygun',restricted:'Hekim değerlendirmesi gerekli'}),F('notes','Not','textarea')]},
  training:{label:'Eğitim',group:'training',fields:[F('subject','Eğitim konusu','textarea',null,true),F('hours','Süre (saat)','number',null,true),F('trainer','Eğitmen adı','text',null,true),F('trainerQualification','Eğitmen yetkisi / unvanı'),F('method','Yöntem','select',{classroom:'Yüz yüze',practice:'Uygulamalı',distance:'Uzaktan',mixed:'Karma'}),F('location','Eğitim yeri'),F('trainingVerified','Eğitim gerçekleşti; katılım ve değerlendirme kontrol edildi','checkbox'),F('notes','Eğitim notu','textarea')]},
  equipment:{label:'Ekipman',group:'equipment',fields:[F('category','Ekipman türü','select',{lifting:'Kaldırma / iletme',pressure:'Basınçlı kap',electrical:'Elektrik tesisatı',grounding:'Topraklama',fire:'Yangın ekipmanı',machine:'İş makinesi',other:'Diğer'}),F('serialNo','Seri / ekipman numarası'),F('location','Bulunduğu yer','text',null,true),F('manufacturer','Üretici'),F('model','Model'),F('inServiceDate','Kullanıma giriş','date'),F('vehicleId','İlgili araç','vehicle'),F('notes','Ekipman notu','textarea')]},
  inspection:{label:'Periyodik kontrol',group:'equipment',fields:[F('controlKind','Kontrol konusu'),F('inspectionDate','Gerçek kontrol tarihi','date',null,true),F('reportNo','Kontrol rapor numarası'),F('controller','Kontrolü yapan kişi / kuruluş'),F('controllerRegistration','Yetki / kayıt numarası'),F('qualified','Kontrolü yapanın yetkisi doğrulandı','checkbox'),F('result','Kontrol sonucu','select',{pending:'Rapor bekleniyor',suitable:'Uygun',conditional:'Koşullu / takip gerekli',unsuitable:'Uygun değil'}),F('findings','Tespit / uygunsuzluklar','textarea'),F('notes','Not','textarea')]},
  risk:{label:'Risk / uygunsuzluk',group:'risks',fields:[F('hazard','Tehlike','textarea',null,true),F('consequence','Olası sonuç','textarea',null,true),F('probability','Olasılık (1–5)','number',null,true),F('severity','Şiddet (1–5)','number',null,true),F('existingMeasures','Mevcut önlemler','textarea'),F('measures','Alınacak önlemler','textarea',null,true),F('reviewDate','Yeniden değerlendirme','date'),F('notes','Not','textarea')]},
  action:{label:'Düzeltici faaliyet',group:'risks',fields:[F('relatedRecordId','İlgili risk / kayıt','record'),F('actionText','Yapılacak düzeltme','textarea',null,true),F('completionEvidence','Yapılan iş / kanıt','textarea'),F('verificationNote','Doğrulama / kapanış notu','textarea')]},
  emergencyTeam:{label:'Acil durum ekibi',group:'emergency',fields:[F('role','Ekip görevi','select',{firstAid:'İlk yardım',fire:'Yangınla mücadele',evacuation:'Tahliye',searchRescue:'Arama / kurtarma',other:'Diğer'},true),F('leaderId','Ekip sorumlusu','person'),F('notes','Görevlendirme / yeterlilik notu','textarea')]},
  drill:{label:'Tatbikat',group:'emergency',fields:[F('scenario','Senaryo','textarea',null,true),F('location','Tatbikat yeri','text',null,true),F('startTime','Başlangıç saati','time'),F('minutes','Süre (dakika)','number'),F('coordinator','Koordinatör'),F('findings','Gözlemler / eksikler','textarea'),F('improvements','İyileştirmeler','textarea'),F('notes','Not','textarea')]},
  incident:{label:'İş kazası / ramak kala',group:'incidents',fields:[F('kind','Olay türü','select',{accident:'İş kazası',nearMiss:'Ramak kala'},true),F('eventTime','Olay saati','time'),F('location','Olay yeri','text',null,true),F('description','Olay açıklaması','textarea',null,true),F('injuryStatus','Sağlık değerlendirmesi','select',{none:'Yaralanma bildirilmedi',medicalAssessmentRequired:'Hekim değerlendirmesi gerekli',handledByDoctor:'Hekime yönlendirildi'}),F('affectedCount','Etkilenen kişi sayısı','number'),F('immediateMeasures','İlk alınan önlemler','textarea'),F('rootCause','Kök neden / inceleme','textarea'),F('correctiveAction','Önleyici faaliyet','textarea'),F('sgkRequired','SGK bildirim takibi gerekiyor','checkbox'),F('sgkDeadline','Uzman tarafından belirlenen bildirim son tarihi','date'),F('sgkStatus','SGK takip durumu','select',{notRequired:'Gerekli değil',pending:'Bildirim bekliyor',submitted:'Bildirim yapıldı',verified:'Bildirim doğrulandı'}),F('sgkReference','Bildirim referansı'),F('sgkNotificationDate','Bildirim tarihi','date'),F('notes','Takip notu','textarea')]},
  measurement:{label:'Ortam ölçümü',group:'measurements',fields:[F('kind','Ölçüm türü','select',{dust:'Toz',noise:'Gürültü',vibration:'Titreşim',lighting:'Aydınlatma',chemical:'Kimyasal',thermal:'Termal konfor',other:'Diğer'},true),F('location','Ölçüm yeri','text',null,true),F('lab','Laboratuvar / kuruluş'),F('reportNo','Rapor numarası'),F('measuredValue','Ölçüm değeri'),F('unit','Birim'),F('referenceValue','Rapordaki referans / sınır'),F('result','Rapor sonucu','select',{pending:'Değerlendirme bekliyor',suitable:'Uygun',followUp:'İyileştirme / takip gerekli'}),F('notes','Uzman değerlendirmesi','textarea')]},
  provider:{label:'OSGB / hizmet sağlayıcı',group:'providers',fields:[F('providerName','Kuruluş / kişi','text',null,true),F('serviceKind','Hizmet','select',{osgb:'OSGB',specialist:'İSG uzmanı',doctor:'İşyeri hekimi',lab:'Laboratuvar',inspection:'Kontrol kuruluşu',other:'Diğer'}),F('contactName','İlgili kişi'),F('phone','Telefon','tel'),F('email','E-posta','email'),F('contractStart','Sözleşme başlangıcı','date'),F('contractEnd','Sözleşme bitişi','date'),F('notes','Hizmet notu','textarea')]},
  visit:{label:'Uzman / hekim ziyareti',group:'providers',fields:[F('providerId','Hizmet sağlayıcı','provider'),F('visitKind','Ziyaret türü','select',{specialist:'İSG uzmanı',doctor:'İşyeri hekimi',other:'Diğer'}),F('hours','Süre (saat)','number'),F('recommendations','Öneri / yapılacak işler','textarea',null,true),F('notes','Ziyaret notu','textarea')]},
  annualPlan:{label:'Yıllık çalışma / eğitim planı',group:'providers',fields:[F('year','Yıl','number',null,true),F('planKind','Plan türü','select',{work:'Yıllık çalışma planı',training:'Yıllık eğitim planı',evaluation:'Yıllık değerlendirme'}),F('notes','Plan açıklaması','textarea')]},
  document:{label:'İSG evrakı',group:'documents',fields:[F('kind','Belge konusu','select',{riskAssessment:'Risk değerlendirmesi',emergencyPlan:'Acil durum planı',instruction:'Talimat',contract:'Sözleşme',other:'Diğer'}),F('documentNo','Belge numarası'),F('issuer','Düzenleyen'),F('validFrom','Düzenlenme tarihi','date'),F('validUntil','Gözden geçirme / geçerlilik','date'),F('notes','Açıklama','textarea')]}
 };
 const tabs=[['overview','Takip'],['people','Personel'],['training','Eğitimler'],['equipment','Ekipman / Kontroller'],['risks','Risk / Faaliyet'],['emergency','Acil Durum'],['incidents','Olaylar'],['measurements','Ölçümler'],['providers','OSGB / Plan'],['documents','Evrak / Formlar']];
 const renewalKinds=[['training','Eğitim'],['medical','Sağlık değerlendirmesi'],['vocational','Mesleki belge'],['operator','Operatör belgesi'],['firstAid','İlk yardım'],['inspection','Periyodik kontrol']];
 const S={records:[],people:[],branches:[],vehicles:[],kkd:[],users:[],activity:[],settings:{},permissions:{},view:'overview',filters:{query:'',branch:'',status:'',from:'',to:'',type:'',archive:false,deadline:''},loaded:false,loading:false,busy:false,error:'',company:'',revision:0};
 let app=null,dialog=null,previousFocus=null,settingsHost=null,settingsForm=null,settingsDirty=false,settingsDraft=null,settingsDraftRevision=null,settingsRenderedBranches=[],settingsSaving=null,refreshPromise=null,loadSequence=0,sessionEpoch=0;
 const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const displayDate=v=>/^\d{4}-\d{2}-\d{2}/.test(v||'')?String(v).slice(0,10).split('-').reverse().join('.'):v||'—';
 const personName=p=>p?.name||p?.adSoyad||p?.adsoyad||[p?.ad,p?.soyad].filter(Boolean).join(' ')||p?.isim||'İsimsiz personel';
 const personBranch=p=>p?.branch||p?.sube||p?.subeAdi||'';
 const personId=p=>String(p?.id??p?.personelId??p?.personel_id??'');
 const branchName=b=>typeof b==='string'?b:b?.name||b?.ad||b?.subeAdi||b?.id||'';
 const userName=id=>{
if(!fdIsgValid())return;
const u=S.users.find(x=>String(x.id)===String(id));return u?.name||u?.adSoyad||u?.username||S.people.find(x=>personId(x)===String(id))&&personName(S.people.find(x=>personId(x)===String(id)))||'—';};
 const can=(key)=>S.permissions.read===true&&!S.permissions.mustChangePassword&&S.permissions[key]===true;
 const canSettings=key=>S.permissions.role==='Admin'&&can(key);
 const mayEdit=()=>S.permissions.read===true&&S.permissions.write===true&&!S.permissions.mustChangePassword;
 const active=r=>!r.archivedAt&&r.status!=='cancelled';
 const done=r=>['completed','approved','closed','cancelled'].includes(r.status);
 function deadline(r){
fdIsgAssert();
if(!r.dueDate||done(r))return '';const now=today();if(r.dueDate<now)return 'overdue';const days=Math.round((Date.parse(r.dueDate+'T12:00:00Z')-Date.parse(now+'T12:00:00Z'))/86400000);const reminder=Array.isArray(S.settings.reminderDays)?Math.max(0,...S.settings.reminderDays):Number(S.settings.reminderDays)||30;return days<=reminder?'soon':'';}
 function notice(text,type='success'){
fdIsgAssert();
if(settingsHost)settingsNotice(text,type);if(typeof root.showToast==='function')root.showToast(text,type);else if(app){const message=app.querySelector('[data-isg-message]');if(message)message.textContent=text;}}
 function settingsNotice(text,type='success'){
fdIsgAssert();
const message=settingsHost?.querySelector('[data-isg-settings-message]');if(message){message.textContent=text;message.className=type==='error'?'isg-error':'isg-settings-success';message.setAttribute('role',type==='error'?'alert':'status');}}
 async function api(action,payload={}){
try{
fdIsgAssert();
if(typeof root.fdIsgApi!=='function')throw new Error('İSG bağlantısı hazır değil. Uygulamayı yenileyin.');const epoch=sessionEpoch,result=await fdIsgAwait(root.fdIsgApi(action,payload));if(epoch!==sessionEpoch)throw new Error('Oturum değişti. İSG sayfasını yeniden açın.');if(result?.success===false||result?.error)throw Object.assign(new Error(result.message||result.error?.message||result.error||'İşlem tamamlanamadı.'),{code:result.code||result.error?.code});return result?.result??result;
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
}
 function mount(host){
fdIsgAssert();
app=document.getElementById('isgApp');if(!app){app=document.createElement('div');app.id='isgApp';(host instanceof Element?host:document.body).appendChild(app);}app.style.display='block';app.onclick=onAppClick;app.oninput=onAppInput;app.onchange=onAppChange;return app;}
 async function open(host){
try{
fdIsgAssert();
mount(host);if(S.loaded){render();return;}await fdIsgAwait(refresh());
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
}
 async function refresh(){
try{
fdIsgAssert();
if(S.loading)return refreshPromise;S.loading=true;S.error='';const seq=++loadSequence;render();refreshPromise=(async()=>{
try{
if(!fdIsgValid())return;
try{const b=await fdIsgAwait(api('bootstrap'));if(seq!==loadSequence)return;S.records=Array.isArray(b.records)?b.records:[];S.people=Array.isArray(b.people)?b.people:[];S.branches=Array.from(new Set((Array.isArray(b.branches)?b.branches:[]).map(branchName).filter(Boolean)));S.users=b.users||b.owners||[];S.vehicles=b.vehicles||[];S.kkd=b.kkd||[];S.settings=b.settings||{};S.permissions=b.permissions||{};S.activity=b.activity||[];S.company=typeof b.company==='object'?b.company.name||'İşyeri':b.company||root.firmaAdi||'İşyeri';S.revision=b.settings?.revision||0;S.loaded=true;if(S.filters.branch&&!S.branches.includes(S.filters.branch))S.filters.branch='';if(!tabs.some(([key])=>key===S.view))S.view='overview';}catch(err){
if(!fdIsgValid())return;
if(seq===loadSequence)S.error=err.message;}finally{
if(fdIsgValid()){
if(seq===loadSequence){S.loading=false;render();}
}
}
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
})();return refreshPromise;
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
}
 function options(values,value,empty='Seçiniz'){
fdIsgAssert();
const list=Array.isArray(values)?values.map(x=>[x,x]):Object.entries(values||{});return (empty===null?'':`<option value="">${e(empty)}</option>`)+list.map(([k,v])=>`<option value="${e(k)}" ${String(value??'')===String(k)?'selected':''}>${e(v)}</option>`).join('');}
 function filtered(){
fdIsgAssert();
const f=S.filters;return S.records.filter(r=>{
if(!fdIsgValid())return;
if(Boolean(r.archivedAt)!==f.archive)return false;if(S.view!=='overview'&&S.view!=='people'&&S.view!=='settings'&&schemas[r.type]?.group!==S.view)return false;if(f.branch&&r.branch!==f.branch)return false;if(f.type&&r.type!==f.type)return false;if(f.status&&r.status!==f.status)return false;if(f.deadline==='overdue'&&deadline(r)!=='overdue')return false;if(f.deadline==='soon'&&deadline(r)!=='soon')return false;if(f.deadline==='open'&&done(r))return false;if(f.from&&(r.recordDate||'')<f.from)return false;if(f.to&&(r.recordDate||'')>f.to)return false;if(f.query&&!norm([r.title,r.branch,schemas[r.type]?.label,userName(r.ownerId),...Object.values(r.data||{}).filter(x=>typeof x!=='object'),...(r.personIds||[]).map(id=>personName(S.people.find(p=>personId(p)===String(id))))].join(' ')).includes(norm(f.query)))return false;return true;}).sort((a,b)=>{
if(!fdIsgValid())return;
const aa=deadline(a)==='overdue'?0:done(a)?2:1,bb=deadline(b)==='overdue'?0:done(b)?2:1;return aa-bb||String(a.dueDate||'9999').localeCompare(String(b.dueDate||'9999'))||String(b.recordDate||'').localeCompare(String(a.recordDate||''));});}
 function statusHtml(r){
fdIsgAssert();
const late=deadline(r)==='overdue';return `<span class="isg-badge ${e(late?'overdue':r.status)}">${e(late?'Gecikmiş · '+(statuses[r.status]||r.status):statuses[r.status]||r.status||'Planlandı')}</span>`;}
 function render(){
fdIsgAssert();
renderSettingsHost();if(!app)return;app.innerHTML=`<header class="isg-header"><div><h2>İş Sağlığı ve Güvenliği</h2><p>Şube, personel ve ekipman bazında işler, belgeler ve tamamlanma takibi.</p></div><div class="isg-actions"><button data-act="refresh" ${S.loading?'disabled':''}>${S.loading?'Yenileniyor…':'Yenile'}</button><button data-act="output" data-fd-output-own="true">Çıktı</button>${mayEdit()?'<button class="isg-primary" data-act="new">+ Yeni Kayıt</button>':''}</div></header><nav class="isg-nav" aria-label="İSG bölümleri">${tabs.map(([k,t])=>`<button data-act="tab" data-view="${k}" ${S.view===k?'aria-current="page"':''}>${t}</button>`).join('')}</nav><div data-isg-message role="status" class="isg-muted" aria-live="polite"></div>${S.error?`<div class="isg-error" role="alert">${e(S.error)} <button data-act="refresh">Tekrar dene</button></div>`:''}${!S.loaded?`<div class="isg-panel isg-empty"><strong>${S.loading?'İSG kayıtları yükleniyor…':'İSG kayıtları yüklenemedi'}</strong>${S.loading?'Lütfen bekleyin.':'Bağlantıyı yenileyerek tekrar deneyebilirsiniz.'}</div>`:renderMain()}`;}
 function renderMain(){
fdIsgAssert();
const records=S.records.filter(active).filter(r=>!S.filters.branch||r.branch===S.filters.branch);const counters=[['open','Açık işler',records.filter(r=>!done(r)).length,''],['overdue','Geciken',records.filter(r=>deadline(r)==='overdue').length,'isg-late'],['soon','Yaklaşan tarihler',records.filter(r=>deadline(r)==='soon').length,'isg-soon'],['review','Doğrulama bekliyor',records.filter(r=>r.status==='pending').length,'']];const list=filtered();const title=tabs.find(x=>x[0]===S.view)?.[1]||'Takip';return `${S.view==='overview'?`<section class="isg-strip" aria-label="İSG durum özeti">${counters.map(([k,l,n,c])=>`<button data-act="counter" data-value="${k}" class="${c}"><strong>${n}</strong><span>${l}</span></button>`).join('')}</section>`:''}${S.view==='people'?'<div class="isg-notice">Bu ekran belge ve sağlık uygunluk durumlarını gösterir. Tanı, tetkik ve ayrıntılı sağlık dosyaları yalnız yetkili işyeri hekimine açıktır.</div>':''}${S.view==='equipment'?'<div class="isg-notice">Periyodik kontrol kayıtları bakım kaydından ayrıdır. Kontrol raporu, yetkili kontrolör ve rapor sonucuyla takip edilir.</div>':''}${S.view==='incidents'?'<div class="isg-notice">Olay ve SGK bildirim durumunu takip edin. Bu ekranda kayıt oluşturmak resmî bildirim yerine geçmez; bildirim ayrı kanaldan yapılmalıdır.</div>':''}<section class="isg-panel"><div class="isg-panel-head"><div><h3>${e(title==='Takip'?'Yapılacak İşler ve Kayıtlar':title)}</h3><p class="isg-muted">${S.view==='people'?'Personel bazında eksik ve süresi yaklaşan belgeler.':S.filters.archive?'Arşivlenen kayıtlar; geçmiş korunur.':'Kaydın üzerine basarak ayrıntı, ekler ve değişiklik geçmişini açın.'}</p></div><div class="isg-actions">${S.view==='people'?'<button data-act="person-list">Belge Kayıtları</button>':''}${S.view==='documents'?'<button data-act="forms">Form Hazırla</button>':''}<label class="isg-check"><input data-filter="archive" type="checkbox" ${S.filters.archive?'checked':''}> Arşiv</label></div></div>${filterHtml()}<div class="isg-table-wrap">${S.view==='people'&&!S.filters.archive&&!S.filters.type?renderMatrix():recordTable(list)}</div><footer class="isg-footer"><span>${S.view==='people'&&!S.filters.type?matrixPeople().length+' personel':list.length+' kayıt'} · Son tarihler uzman / hekim tarafından doğrulanmalıdır.</span><span>Kaydetmek belgeyi imzalamış veya işlemi gerçekleştirmiş saymaz.</span></footer></section>`;}
 function filterHtml(){
fdIsgAssert();
const f=S.filters;const types=Object.entries(schemas).filter(([,v])=>S.view==='overview'||S.view==='people'?S.view!=='people'||v.group==='people':v.group===S.view).map(([k,v])=>[k,v.label]);return `<div class="isg-filters"><label>Ara<input data-filter="query" value="${e(f.query)}" placeholder="İş, personel, ekipman veya belge ara"></label><label>Şube<select data-filter="branch">${options(S.branches,f.branch,'Tüm şubeler')}</select></label><label>Durum<select data-filter="status">${options(statuses,f.status,'Tüm durumlar')}</select></label><label>Başlangıç<input data-filter="from" type="date" value="${e(f.from)}"></label><label>Bitiş<input data-filter="to" type="date" value="${e(f.to)}"></label><button class="isg-filter-clear" data-act="clear">Temizle</button><label>Kayıt türü<select data-filter="type">${options(Object.fromEntries(types),f.type,'Tüm türler')}</select></label>${f.deadline?`<span class="isg-check isg-muted">${e({open:'Açık işler',overdue:'Geciken işler',soon:'Yaklaşan tarihler'}[f.deadline])}</span>`:''}</div>`;}
 function recordTable(list){
fdIsgAssert();
return `<table><colgroup><col style="width:10%"><col style="width:26%"><col style="width:13%"><col style="width:13%"><col style="width:10%"><col style="width:13%"><col style="width:15%"></colgroup><thead><tr><th>Tür</th><th>Kayıt / Yapılacak İş</th><th>Şube</th><th>Sorumlu</th><th>Son Tarih</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>${list.length?list.map(r=>`<tr><td>${e(schemas[r.type]?.label||r.type)}</td><td><button class="isg-record-title" data-act="detail" data-id="${e(r.id)}">${e(r.title)}</button><span class="isg-row-sub">${displayDate(r.recordDate)}${r.personIds?.length?' · '+r.personIds.length+' personel':''}</span></td><td>${e(r.branch)}</td><td>${e(userName(r.ownerId))}</td><td>${displayDate(r.dueDate)}</td><td>${statusHtml(r)}</td><td><div class="isg-actions"><button data-act="detail" data-id="${e(r.id)}">Aç</button>${mayEdit()&&!r.archivedAt?`<button data-act="edit" data-id="${e(r.id)}">Düzenle</button>`:''}${mayEdit()&&r.archivedAt?`<button data-act="restore" data-id="${e(r.id)}">Geri Al</button>`:''}</div></td></tr>`).join(''):'<tr><td colspan="7"><div class="isg-empty"><strong>Kayıt bulunmuyor</strong>Yeni kayıt ekleyebilir veya filtreleri değiştirebilirsiniz.</div></td></tr>'}</tbody></table>`;}
 function latestDocument(id,kind){
fdIsgAssert();
return S.records.filter(r=>!r.archivedAt&&r.status!=='cancelled'&&(r.personIds||[]).some(p=>String(p)===String(id))&&((r.type==='personDocument'&&r.data?.kind===kind)||(kind==='training'&&r.type==='training'&&['completed','approved','closed'].includes(r.status)&&r.data?.trainingVerified&&r.data?.attendance?.some(a=>String(a.personId)===String(id)&&a.attended&&a.passed&&a.approved)))).sort((a,b)=>String(b.data?.validFrom||b.recordDate||'').localeCompare(String(a.data?.validFrom||a.recordDate||'')))[0];}
 function matrixPeople(){
fdIsgAssert();
const f=S.filters;return S.people.filter(p=>(!f.branch||personBranch(p)===f.branch)&&(!f.query||norm(personName(p)+' '+personBranch(p)+' '+(p.jobTitle||p.job||p.gorev||'')).includes(norm(f.query)))).sort((a,b)=>personBranch(a).localeCompare(personBranch(b),'tr')||personName(a).localeCompare(personName(b),'tr'));}
 function documentStatus(r){
fdIsgAssert();
if(!r)return {label:'Kayıt yok',status:'missing'};if(['draft','planned','open','in_progress'].includes(r.status))return {label:'Bekliyor',status:'pending'};const date=r.data?.validUntil||r.dueDate;if(date&&date<today())return {label:'Süresi geçti',status:'overdue'};if(r.status==='pending')return {label:'Doğrulama bekliyor',status:'pending'};return {label:date?displayDate(date):r.type==='training'?displayDate(r.recordDate)+' · Doğrulandı':'Süre belirtilmedi',status:done(r)?'completed':'pending'};}
 function renderMatrix(){
fdIsgAssert();
const kinds={training:'İSG Eğitimi',medical:'Sağlık Uygunluğu',vocational:'Mesleki Yeterlilik',operator:'Operatör',firstAid:'İlk Yardım'};const people=matrixPeople();return `<table class="isg-matrix"><colgroup><col style="width:26%">${Object.keys(kinds).map(()=>'<col style="width:14.8%">').join('')}</colgroup><thead><tr><th>Personel / Şube</th>${Object.values(kinds).map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>${people.length?people.map(p=>`<tr><td><button class="isg-record-title" data-act="person" data-id="${e(personId(p))}">${e(personName(p))}</button><span class="isg-row-sub">${e(personBranch(p))} · ${e(p.job||p.gorev||'')}</span></td>${Object.keys(kinds).map(kind=>{
if(!fdIsgValid())return;
const r=latestDocument(personId(p),kind),s=documentStatus(r);return `<td><button class="isg-record-title" data-act="${r?'detail':'new-person'}" data-id="${e(r?.id||personId(p))}" data-kind="${kind}"><span class="isg-badge ${e(s.status)}">${e(s.label)}</span></button></td>`;}).join('')}</tr>`).join(''):'<tr><td colspan="6"><div class="isg-empty">Bu filtreye uygun personel bulunmuyor.</div></td></tr>'}</tbody></table>`;}
 function onAppInput(event){
fdIsgAssert();
const key=event.target.dataset.filter;if(key!=='query')return;S.filters.query=event.target.value;const oldStart=event.target.selectionStart;render();const input=app.querySelector('[data-filter=query]');input.focus();input.setSelectionRange(oldStart,oldStart);}
 function onAppChange(event){
fdIsgAssert();
const k=event.target.dataset.filter;if(!k)return;S.filters[k]=event.target.type==='checkbox'?event.target.checked:event.target.value;render();}
 async function onAppClick(event){
try{
fdIsgAssert();
const b=event.target.closest('[data-act]');if(!b||b.disabled)return;const r=S.records.find(x=>String(x.id)===b.dataset.id);switch(b.dataset.act){case'refresh':return refresh();case'tab':S.view=b.dataset.view;S.filters.type='';S.filters.deadline='';S.filters.status='';render();break;case'clear':S.filters={query:'',branch:'',status:'',from:'',to:'',type:'',archive:false,deadline:''};render();break;case'counter':S.filters.status=b.dataset.value==='review'?'pending':'';S.filters.deadline=b.dataset.value==='review'?'':b.dataset.value;S.filters.archive=false;render();break;case'new':return newPicker();case'detail':return detail(r);case'edit':return edit(r?.type,r);case'restore':return archive(r,true);case'output':return output(b);case'forms':return forms();case'person':return personDetail(b.dataset.id);case'new-person':return edit('personDocument',null,{personIds:[b.dataset.id],data:{kind:b.dataset.kind}});case'person-list':S.filters.type=S.filters.type?'':'personDocument';render();break;case'settings-save':return saveSettings(b);case'new-user':return userForm();case'access-edit':return accessForm(S.users.find(u=>String(u.id)===b.dataset.id));}
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
}
 function closeDialog(force=false){if(dialog?.busy&&!force)return;dialog?.overlay.remove();dialog=null;document.removeEventListener('keydown',dialogKey);previousFocus?.focus?.();}
 function dialogKey(ev){
fdIsgAssert();
if(!dialog)return;if(ev.key==='Escape'){ev.preventDefault();closeDialog();}if(ev.key==='Tab'){const all=Array.from(dialog.overlay.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]')).filter(x=>x.offsetParent!==null);if(!all.length)return;const first=all[0],last=all[all.length-1];if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus();}else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus();}}}
 function modal(title,body,foot='',wide=false){
fdIsgAssert();
closeDialog(true);previousFocus=document.activeElement;const overlay=document.createElement('div');overlay.className='isg-overlay';overlay.dataset.casePreserve='true';overlay.innerHTML=`<section role="dialog" aria-modal="true" aria-labelledby="isgDialogTitle" class="isg-dialog ${wide?'isg-wide':''}"><header class="isg-dialog-head"><h3 id="isgDialogTitle">${e(title)}</h3><button type="button" data-close aria-label="Kapat">✕</button></header><div class="isg-dialog-body">${body}</div>${foot?`<footer class="isg-dialog-foot">${foot}</footer>`:''}</section>`;/* The portal's global uppercase listener must never rewrite opaque IDs or ISG form text. */overlay.querySelectorAll('input,textarea').forEach(input=>input.dataset.casePreserve='true');fdIsgAppendChild(overlay);dialog={overlay,busy:false};overlay.querySelector('[data-close]').onclick=()=>closeDialog();overlay.onclick=ev=>{
if(!fdIsgValid())return;
if(ev.target===overlay)closeDialog();};fdIsgListen(document,'keydown',dialogKey);setTimeout(()=>overlay.querySelector('input:not([type=checkbox]),select,button')?.focus(),0);return dialog;}
 function modalError(err){
fdIsgAssert();
const body=dialog?.overlay.querySelector('.isg-dialog-body');if(!body)return;body.querySelector('[data-form-error]')?.remove();const x=document.createElement('div');x.className='isg-error';x.dataset.formError='true';x.setAttribute('role','alert');x.textContent=['REVISION_CONFLICT','VERSION_CONFLICT'].includes(err?.code)?'Bu kayıt başka bir kullanıcı tarafından değiştirildi. Pencereyi kapatıp Yenile ile son kaydı alın; değişiklikleriniz kaydedilmedi.':err.message||String(err);body.prepend(x);body.scrollTop=0;}
 function busy(value,message='Kaydediliyor…'){
fdIsgAssert();
if(!dialog)return;dialog.busy=value;dialog.overlay.querySelectorAll('button,input,select,textarea').forEach(x=>{
if(!fdIsgValid())return;
if(value){x.dataset.wasDisabled=x.disabled?'yes':'no';x.disabled=true;}else{x.disabled=x.dataset.wasDisabled==='yes';delete x.dataset.wasDisabled;}});const status=dialog.overlay.querySelector('[data-save-state]');if(status)status.textContent=value?message:'';}
 function newPicker(){
fdIsgAssert();
if(!mayEdit())return;const types=Object.entries(schemas).filter(([,s])=>S.view==='overview'||S.view==='people'?S.view!=='people'||s.group==='people':S.view==='settings'||s.group===S.view);const d=modal('Yeni İSG Kaydı',`<p class="isg-muted" style="margin-bottom:13px">Kaydetmek istediğiniz kayıt türünü seçin.</p><div class="isg-form-grid">${types.map(([k,s])=>`<button data-type="${k}" style="text-align:left;padding:13px">${e(s.label)}</button>`).join('')}</div>`);d.overlay.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>edit(b.dataset.type));}
 function linkedValues(kind,branch,excludeId=''){
fdIsgAssert();

  if(kind==='person')return Object.fromEntries(S.people.filter(p=>!branch||personBranch(p)===branch).map(p=>[personId(p),personName(p)]));
  if(kind==='vehicle')return Object.fromEntries(S.vehicles.filter(v=>!branch||(v.branch||v.sube||v.subeAdi||'')===branch).map(v=>[String(v.id),v.plate||v.plaka||'Araç']));
  const types=kind==='equipment'?['equipment']:kind==='provider'?['provider']:['risk','task','inspection','incident'];
  return Object.fromEntries(S.records.filter(x=>active(x)&&x.id!==excludeId&&types.includes(x.type)&&(!branch||x.branch===branch)).map(x=>[x.id,x.title]));
 }
 function fieldDisplay(f,value){
fdIsgAssert();

  if(value==null||value==='')return '—';
  if(f.type==='checkbox')return value?'Evet':'Hayır';
  if(f.type==='date')return displayDate(value);
  if(f.options)return f.options[value]??value;
  if(f.type==='person')return personName(S.people.find(p=>personId(p)===String(value)));
  if(f.type==='vehicle'){const vehicle=S.vehicles.find(v=>String(v.id)===String(value));return vehicle?.plate||vehicle?.plaka||'Araç kaydı bulunamadı';}
  if(['record','provider'].includes(f.type))return S.records.find(r=>r.id===value)?.title||'İlişkili kayıt bulunamadı';
  return value;
 }
 function fieldHtml(f,value,branch='',recordId=''){
fdIsgAssert();
let input='';const required=f.required?'required':'';if(f.type==='textarea')input=`<textarea name="data.${e(f.key)}" rows="3" ${required}>${e(value)}</textarea>`;else if(f.type==='checkbox')return `<label class="isg-check isg-field isg-full"><input name="data.${e(f.key)}" type="checkbox" ${value?'checked':''}> ${e(f.label)}</label>`;else if(['select','person','vehicle','provider','record'].includes(f.type)){const values=f.options||linkedValues(f.type,branch,recordId);input=`<select name="data.${e(f.key)}" ${required}>${options(values,value)}</select>`;}else input=`<input name="data.${e(f.key)}" type="${e(f.type)}" value="${e(value)}" ${f.type==='number'?'step="any" min="0"':''} ${required}>`;return `<label class="isg-field ${f.type==='textarea'?'isg-full':''}" data-field="${e(f.key)}"><span>${e(f.label)}${f.required?' *':''}</span>${input}</label>`;}
 function seededBranch(seed){
fdIsgAssert();
const branches=new Set((seed.personIds||[]).map(id=>S.people.find(p=>personId(p)===String(id))).filter(Boolean).map(personBranch).filter(Boolean));return branches.size===1?[...branches][0]:'';}
 function peoplePicker(ids,branch){
fdIsgAssert();
const selected=new Set((ids||[]).map(String));return `<div class="isg-section-title">İlgili Personeller <span class="isg-muted" data-person-count></span></div><div class="isg-people-tools"><input data-person-search placeholder="Personel ara" data-case-preserve="true"><button type="button" data-people="all">Görünenleri Seç</button><button type="button" data-people="none">Seçimi Temizle</button></div><div class="isg-people-list">${S.people.map(p=>`<label class="isg-person-option" data-person-option data-branch="${e(personBranch(p))}" data-search="${e(norm(personName(p)+' '+personBranch(p)))}" ${branch&&personBranch(p)!==branch?'hidden':''}><input type="checkbox" name="personIds" value="${e(personId(p))}" data-case-preserve="true" ${selected.has(personId(p))?'checked':''}><span>${e(personName(p))}<small>${e(personBranch(p))} · ${e(p.job||p.gorev||'')}</small></span></label>`).join('')}</div>`;}
 function edit(type,record,seed={}){
fdIsgAssert();
if(!mayEdit()||!schemas[type])return;if(!record&&!seed.branch&&seed.personIds?.length){const branch=seededBranch(seed);if(branch)seed={...seed,branch};}const schema=schemas[type],original=record?JSON.parse(JSON.stringify(record)):null;const r=original||{type,branch:S.filters.branch||S.branches[0]||'',title:'',status:'planned',ownerId:'',recordDate:today(),dueDate:'',personIds:[],data:{},attachments:[],...seed};r.data={...(r.data||{}),...(seed.data||{})};const owners=Object.fromEntries(S.users.filter(u=>u.active!==false).map(u=>[u.id,u.name||u.adSoyad||u.username||u.id]));let content=`<form id="isgRecordForm"><div class="isg-notice">Kayıt tamamlandığında kanıtı ve doğrulama notunu ekleyin. Ayrıntılı sağlık bilgilerini bu forma yazmayın.</div><div class="isg-form-grid"><label class="isg-field"><span>Kayıt başlığı *</span><input name="title" value="${e(r.title)}" required maxlength="240"></label><label class="isg-field"><span>Şube *</span><select name="branch" required>${options(S.branches,r.branch)}</select></label><label class="isg-field"><span>Kayıt / gerçekleşme tarihi *</span><input name="recordDate" type="date" value="${e(r.recordDate)}" required></label><label class="isg-field"><span>Son tarih / sonraki takip</span><input name="dueDate" type="date" value="${e(r.dueDate)}"></label><label class="isg-field"><span>Sorumlu kullanıcı</span><select name="ownerId">${options(owners,r.ownerId,'Atanmadı')}</select></label><label class="isg-field"><span>Durum</span><select name="status">${options(statuses,r.status,null)}</select></label>${type==='inspection'?`<label class="isg-field isg-full"><span>Ekipman *</span><select name="equipmentId" required>${options(linkedValues('equipment',r.branch,r.id),r.equipmentId)}</select></label>`:''}</div><h4 class="isg-section-title">${e(schema.label)} Bilgileri</h4><div class="isg-form-grid">${schema.fields.map(f=>fieldHtml(f,r.data[f.key],r.branch,r.id)).join('')}</div>${type!=='equipment'&&type!=='provider'&&type!=='annualPlan'?peoplePicker(r.personIds,r.branch):''}${type==='training'?'<div data-attendance></div>':''}${type==='annualPlan'?'<h4 class="isg-section-title">Plan Kalemleri</h4><div data-plan-items></div><button type="button" data-add-plan>+ Plan Kalemi Ekle</button>':''}</form>`;const d=modal((record?'Düzenle · ':'Yeni · ')+schema.label,content,'<span class="isg-form-state" role="status" data-save-state></span><button type="button" data-cancel>Vazgeç</button><button type="submit" form="isgRecordForm" class="isg-primary">Kaydet</button>');const form=d.overlay.querySelector('form'),pendingFiles=[];const uploadSection=document.createElement('div');uploadSection.innerHTML=recordFilePicker();form.appendChild(uploadSection);const fileInput=uploadSection.querySelector('[data-record-files]');function drawPendingFiles(){
fdIsgAssert();
uploadSection.querySelector('[data-pending-files]').innerHTML=fileRows(pendingFiles);uploadSection.querySelectorAll('[data-file-remove]').forEach(button=>button.onclick=()=>{
if(!fdIsgValid())return;
pendingFiles.splice(Number(button.dataset.fileRemove),1);drawPendingFiles();});d.overlay.querySelector('[type=submit][form=isgRecordForm]').textContent=pendingFiles.length?'Kaydet ve Evrakları Yükle':'Kaydet';}fileInput.onchange=()=>{
if(!fdIsgValid())return;
try{addFiles(pendingFiles,fileInput.files);drawPendingFiles();fileInput.value='';}catch(error){
if(!fdIsgValid())return;
fileInput.value='';modalError(error);}};function refreshLinks(){
fdIsgAssert();
const branch=form.elements.branch.value;schema.fields.filter(f=>['person','vehicle','provider','record'].includes(f.type)).forEach(f=>{
if(!fdIsgValid())return;
const field=form.elements.namedItem('data.'+f.key),value=field.value,choices=linkedValues(f.type,branch,r.id);field.innerHTML=options(choices,Object.hasOwn(choices,value)?value:'');});if(type==='inspection'){const field=form.elements.equipmentId,value=field.value,choices=linkedValues('equipment',branch,r.id);field.innerHTML=options(choices,Object.hasOwn(choices,value)?value:'');}}d.overlay.querySelector('[data-cancel]').onclick=()=>closeDialog();const planned=JSON.parse(JSON.stringify(r.data.items||[]));function drawPlans(){
fdIsgAssert();
const div=form.querySelector('[data-plan-items]');if(!div)return;div.innerHTML=planned.map((x,i)=>`<div class="isg-form-grid" style="margin-bottom:9px" data-plan-index="${i}"><input data-plan="title" placeholder="Yapılacak iş" value="${e(x.title)}" required><div class="isg-actions"><input data-plan="dueDate" type="date" value="${e(x.dueDate)}" style="flex:1"><button type="button" data-plan-remove="${i}">Kaldır</button></div></div>`).join('');div.oninput=ev=>{
if(!fdIsgValid())return;
const row=ev.target.closest('[data-plan-index]');if(row&&ev.target.dataset.plan)planned[Number(row.dataset.planIndex)][ev.target.dataset.plan]=ev.target.value;};div.onclick=ev=>{
if(!fdIsgValid())return;
const b=ev.target.closest('[data-plan-remove]');if(b){planned.splice(Number(b.dataset.planRemove),1);drawPlans();}};}
  if(type==='annualPlan'){drawPlans();form.querySelector('[data-add-plan]').onclick=()=>{
if(!fdIsgValid())return;
planned.push({title:'',dueDate:'',status:'planned'});drawPlans();};}
  let attendance=new Map((r.data.attendance||[]).map(x=>[String(x.personId),{personId:String(x.personId),attended:x.attended===true,passed:x.passed===true,approved:x.approved===true}]));function drawAttendance(){
fdIsgAssert();
const box=form.querySelector('[data-attendance]');if(!box)return;const ids=Array.from(form.querySelectorAll('[name=personIds]:checked')).map(x=>x.value),labels={attended:'Katıldı',passed:'Başarılı',approved:'Doğrulandı'};box.innerHTML=`<h4 class="isg-section-title">Katılım ve Değerlendirme</h4><p class="isg-muted">Katılım ve başarı bilgisi gerçek eğitim kayıtlarına göre işaretlenmelidir. Katılım belgesi yalnız doğrulanan personel için hazırlanır.</p><div class="isg-attendance-wrap"><table><thead><tr><th>Personel</th><th>Katıldı</th><th>Başarılı</th><th>Doğrulandı</th></tr></thead><tbody>${ids.map(id=>{
if(!fdIsgValid())return;
const a=attendance.get(id)||{},person=S.people.find(p=>personId(p)===id),name=person?personName(person):'Personel seçimi güncel değil; seçimi yenileyin';return `<tr><td>${e(name)}</td>${['attended','passed','approved'].map(k=>`<td><input type="checkbox" data-attend="${k}" data-person="${e(id)}" data-case-preserve="true" ${a[k]?'checked':''} aria-label="${e(name+' · '+labels[k])}"></td>`).join('')}</tr>`;}).join('')||'<tr><td colspan="4">Personel seçildiğinde katılım satırları açılır.</td></tr>'}</tbody></table></div>`;box.onchange=ev=>{
if(!fdIsgValid())return;
if(!['attended','passed','approved'].includes(ev.target.dataset.attend))return;const id=ev.target.dataset.person,a=attendance.get(id)||{personId:id,attended:false,passed:false,approved:false};a[ev.target.dataset.attend]=ev.target.checked;if(!a.attended){a.passed=false;a.approved=false;}if(!a.passed)a.approved=false;attendance.set(id,a);drawAttendance();};}
  function refreshPeople(){
fdIsgAssert();
const branch=form.elements.branch.value,query=norm(form.querySelector('[data-person-search]')?.value);form.querySelectorAll('[data-person-option]').forEach(x=>{
if(!fdIsgValid())return;
x.hidden=(!!branch&&x.dataset.branch!==branch)||(!!query&&!x.dataset.search.includes(query));});const count=form.querySelector('[data-person-count]');if(count)count.textContent='· '+form.querySelectorAll('[name=personIds]:checked').length+' seçili';}
  function medicalFields(){
fdIsgAssert();
if(type!=='personDocument')return;const medical=form.elements['data.kind'].value==='medical';form.querySelector('[data-field=fitStatus]').hidden=!medical;form.querySelector('[data-field=notes]').hidden=medical;uploadSection.hidden=medical&&!can('medical');if(uploadSection.hidden){pendingFiles.length=0;drawPendingFiles();}}
  if(['personDocument','training','inspection'].includes(type)){const button=document.createElement('button');button.type='button';button.textContent='Ayarlara Göre Takip Tarihi Öner';button.style.marginTop='12px';form.append(button);button.onclick=()=>{
if(!fdIsgValid())return;
const kind=type==='personDocument'?form.elements.namedItem('data.kind').value:type;const rule=(S.settings.documentRenewals||[]).find(x=>x.kind===kind&&x.branch===form.elements.branch.value)||(S.settings.documentRenewals||[]).find(x=>x.kind===kind&&!x.branch);if(!rule?.months){modalError(new Error('Bu kayıt türü için ayarlarda süre önerisi tanımlanmamış. Son tarihi uzman / hekim değerlendirmesine göre yazın.'));return;}const start=form.elements.namedItem('data.validFrom')?.value||form.elements.namedItem('data.inspectionDate')?.value||form.elements.recordDate.value;if(!start){modalError(new Error('Önce gerçekleşme / belge tarihini seçin.'));return;}const date=new Date(start+'T12:00:00Z'),day=date.getUTCDate();date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()+Number(rule.months));const last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();date.setUTCDate(Math.min(day,last));const value=date.toISOString().slice(0,10),target=type==='personDocument'?form.elements.namedItem('data.validUntil'):form.elements.dueDate;target.value=value;target.focus();};}
  form.oninput=ev=>{
if(!fdIsgValid())return;
if(ev.target.hasAttribute('data-person-search'))refreshPeople();};form.onchange=ev=>{
if(!fdIsgValid())return;
if(ev.target.name==='branch'){refreshLinks();form.querySelectorAll('[name=personIds]').forEach(x=>{
if(!fdIsgValid())return;
if(x.closest('[data-person-option]').dataset.branch!==form.elements.branch.value)x.checked=false;});refreshPeople();drawAttendance();}if(ev.target.name==='personIds'){refreshPeople();drawAttendance();}if(ev.target.name==='data.kind')medicalFields();};form.querySelectorAll('[data-people]').forEach(b=>b.onclick=()=>{
if(!fdIsgValid())return;
form.querySelectorAll('[data-person-option]').forEach(x=>{
if(!fdIsgValid())return;
if(b.dataset.people==='none'||!x.hidden)x.querySelector('input').checked=b.dataset.people==='all';});refreshPeople();drawAttendance();});refreshPeople();drawAttendance();medicalFields();
  form.onsubmit=async ev=>{
try{
if(!fdIsgValid())return;
ev.preventDefault();if(d.busy||!form.reportValidity())return;const get=k=>form.elements.namedItem(k)?.value||'';const selected=Array.from(form.querySelectorAll('[name=personIds]:checked')).map(x=>x.value);const data={};schema.fields.forEach(f=>{
if(!fdIsgValid())return;
if(type==='personDocument'&&get('data.kind')==='medical'&&f.key==='notes')return;if(type==='personDocument'&&get('data.kind')!=='medical'&&f.key==='fitStatus')return;const input=form.elements.namedItem('data.'+f.key);data[f.key]=f.type==='checkbox'?Boolean(input?.checked):f.type==='number'?(input?.value===''?null:Number(input?.value)):input?.value||'';});if(type==='training')data.attendance=selected.map(id=>attendance.get(id)||{personId:id,attended:false,passed:false,approved:false});if(type==='emergencyTeam')data.members=selected;if(type==='risk'){if(![data.probability,data.severity].every(x=>Number.isInteger(x)&&x>=1&&x<=5)){modalError(new Error('Olasılık ve şiddet 1–5 arasında tam sayı olmalıdır.'));return;}data.score=data.probability*data.severity;}if(type==='annualPlan')data.items=planned;const next={id:r.id||null,type,title:get('title').trim(),branch:get('branch'),recordDate:get('recordDate'),dueDate:get('dueDate')||null,status:get('status'),ownerId:get('ownerId')||null,personIds:selected,equipmentId:r.equipmentId||null,data};if(type==='inspection')next.equipmentId=get('equipmentId');try{validateRecord(next);pendingFiles.forEach(entry=>fileSpec(entry.file));busy(true);const saved=await fdIsgAwait(api('save',{record:next,expectedRevision:r.revision||0,idempotencyKey:r.id||d.idempotencyKey||(d.idempotencyKey=globalThis.crypto?.randomUUID?.()||'isg-'+Date.now()+'-'+Math.random().toString(36).slice(2))}));if(dialog!==d)return;const recordValue=saved.record||saved;replaceRecord(recordValue);closeDialog(true);render();notice('İSG kaydı kaydedildi.');if(pendingFiles.length){const target=detail(recordValue);await fdIsgAwait(upload(recordValue,pendingFiles.map(entry=>entry.file),target));}}catch(err){
if(!fdIsgValid())return;
if(dialog!==d)return;busy(false);modalError(err);}
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
};
 }
 function validateRecord(r){
fdIsgAssert();

  if(!r.title||!r.branch)throw new Error('Başlık ve şube zorunludur.');
  const d=r.data||{},selected=Array.isArray(r.personIds)?r.personIds:[];
  if(selected.some(id=>!S.people.some(p=>personId(p)===id)))throw new Error('Personel seçimi güncel değil. Seçimi temizleyip personelleri yeniden seçin.');
  if(selected.some(id=>S.people.some(p=>personId(p)===id&&personBranch(p)!==r.branch)))throw new Error('Seçilen personeller kayıt şubesiyle aynı şubede olmalıdır.');
  for(const f of schemas[r.type]?.fields||[]){if(['person','vehicle','provider','record'].includes(f.type)&&d[f.key]&&!Object.hasOwn(linkedValues(f.type,r.branch,r.id),d[f.key]))throw new Error(f.label+': kayıt şubesindeki etkin bir kayıt seçin.');}
  if(r.type==='inspection'&&(!r.equipmentId||!Object.hasOwn(linkedValues('equipment',r.branch,r.id),r.equipmentId)))throw new Error('Kayıt şubesindeki etkin bir ekipman seçin.');
  if(r.type==='personDocument'&&d.kind==='medical'&&selected.length!==1)throw new Error('Sağlık durumu kaydını tek personel için oluşturun. Hekim dosyası kişiye özel tutulur.');
  if(r.type==='personDocument'&&!selected.length)throw new Error('En az bir personel seçin.');
  if(r.type==='personDocument'&&d.validFrom&&d.validUntil&&d.validUntil<d.validFrom)throw new Error('Belgenin bitiş tarihi başlangıçtan önce olamaz.');
  if(r.type==='training'){
   if(!selected.length)throw new Error('Eğitim için en az bir personel seçin.');
   if(!String(d.trainer||'').trim())throw new Error('Eğitmen adını yazın.');
   if(d.trainingVerified&&(!String(d.trainerQualification||'').trim()))throw new Error('Eğitimi doğrulamak için eğitmen ve yeterlilik bilgisi gereklidir.');
   if(!Number.isFinite(d.hours)||!(d.hours>0))throw new Error('Eğitim süresi sıfırdan büyük olmalıdır.');
   const rows=Array.isArray(d.attendance)?d.attendance:[],rowIds=rows.map(a=>a.personId);
   if(rows.length!==selected.length||new Set(rowIds).size!==rows.length||rowIds.some(id=>!selected.includes(id)))throw new Error('Katılım satırları seçili personellerle eşleşmiyor. Personel seçimini yeniden kontrol edin.');
   if(rows.some(a=>(a.passed||a.approved)&&!a.attended))throw new Error('Katılmayan personel başarılı veya doğrulanmış olarak işaretlenemez.');
   if(rows.some(a=>a.approved&&!a.passed))throw new Error('Değerlendirmeyi geçmeyen personelin belgesi doğrulanamaz.');
   if(['completed','approved','closed'].includes(r.status)&&(!d.trainingVerified||!rows.some(a=>a.attended)))throw new Error('Tamamlanan eğitim için gerçekleşme doğrulaması ve katılım kaydı gereklidir.');
  }
  if(r.type==='inspection'&&['completed','approved','closed'].includes(r.status)&&(!d.reportNo||!d.controller||!d.controllerRegistration||!d.qualified||!['suitable','conditional','unsuitable'].includes(d.result)))throw new Error('Kontrolü tamamlamak için rapor, kontrolör, yetki / kayıt numarası, yetki doğrulaması ve sonuç gereklidir.');
  if(['task','action'].includes(r.type)&&['completed','approved','closed'].includes(r.status)&&(!d.completionEvidence||!d.verificationNote))throw new Error('Tamamlandı olarak kapatmak için yapılan işin kanıtı ve doğrulama notu gereklidir.');
  if(r.type==='incident'&&['submitted','verified'].includes(d.sgkStatus)&&(!d.sgkReference||!d.sgkNotificationDate))throw new Error('Bildirim yapıldı durumu için referans ve bildirim tarihi gereklidir.');
  if(r.type==='provider'&&d.contractStart&&d.contractEnd&&d.contractEnd<d.contractStart)throw new Error('Sözleşme bitişi başlangıçtan önce olamaz.');
  if(r.type==='annualPlan'&&(!Number.isInteger(d.year)||d.year<2000||d.year>2200))throw new Error('Geçerli bir plan yılı yazın.');
  if(r.type==='risk'&&['completed','approved','closed'].includes(r.status))throw new Error('Risk değerlendirmesi kayıt olarak tutulur; önlemi tamamlamak için bağlı düzeltici faaliyet açın.');
 }
 function replaceRecord(record){
fdIsgAssert();
if(!record?.id)throw new Error('Sunucu kayıt numarası dönmedi; tekrar kaydetmeden önce Yenile ile kontrol edin.');const i=S.records.findIndex(x=>x.id===record.id);if(i>=0)S.records[i]=record;else S.records.push(record);}
 function detail(r){
fdIsgAssert();
if(!r)return;const schema=schemas[r.type]||{label:r.type,fields:[]},data=r.data||{};const values=[['Tür',schema.label],['Şube',r.branch],['Sorumlu',userName(r.ownerId)],['Kayıt tarihi',displayDate(r.recordDate)],['Son tarih',displayDate(r.dueDate)],...(r.equipmentId?[['Ekipman',S.records.find(x=>x.id===r.equipmentId)?.title||'Ekipman kaydı bulunamadı']]:[]),['Durum',statuses[r.status]||r.status],...schema.fields.filter(f=>f.type!=='checkbox'||data[f.key]).filter(f=>r.type!=='personDocument'||data.kind!=='medical'||f.key!=='notes').filter(f=>r.type!=='personDocument'||data.kind==='medical'||f.key!=='fitStatus').map(f=>[f.label,fieldDisplay(f,data[f.key])])];const d=modal(r.title,`<div class="isg-details">${values.map(([k,v])=>`<div class="${String(v).length>100?'isg-full':''}"><small>${e(k)}</small>${e(v)}</div>`).join('')}</div>${r.personIds?.length?`<h4 class="isg-section-title">İlgili Personeller</h4><p>${r.personIds.map(id=>e(personName(S.people.find(p=>personId(p)===String(id))))).join(', ')}</p>`:''}${r.type==='training'?`<h4 class="isg-section-title">Katılım</h4><div class="isg-attendance-wrap"><table><thead><tr><th>Personel</th><th>Katıldı</th><th>Başarılı</th><th>Doğrulandı</th></tr></thead><tbody>${(data.attendance||[]).map(a=>`<tr><td>${e(personName(S.people.find(p=>personId(p)===String(a.personId))))}</td><td>${a.attended?'Evet':'Hayır'}</td><td>${a.passed?'Evet':'Hayır'}</td><td>${a.approved?'Evet':'Hayır'}</td></tr>`).join('')}</tbody></table></div>`:''}${r.type==='annualPlan'?`<h4 class="isg-section-title">Plan Kalemleri</h4><ul>${(data.items||[]).map(x=>`<li>${e(x.title)} · ${displayDate(x.dueDate)} · ${e(statuses[x.status]||x.status)}</li>`).join('')}</ul>`:''}<h4 class="isg-section-title">Ekler / İmzalı Nüshalar</h4><div data-attachments>${attachmentsHtml(r)}</div>${mayEdit()&&!r.archivedAt&&(r.type!=='personDocument'||r.data?.kind!=='medical'||can('medical'))?`<label class="isg-field" style="margin-top:12px"><span>Belge / fotoğraf ekle</span><input type="file" data-upload multiple accept="${fileAccept}"><small>Birden fazla belge seçebilirsiniz. Her dosya en fazla 20 MB.</small></label>`:''}<section class="isg-upload-section" data-upload-queue></section><h4 class="isg-section-title">Değişiklik Geçmişi</h4><div data-history class="isg-muted">Geçmiş yükleniyor…</div>`,`<span class="isg-form-state" data-save-state></span><button data-form>Form Hazırla</button>${['risk','inspection','incident'].includes(r.type)&&mayEdit()&&!r.archivedAt?'<button data-action>Faaliyet Aç</button>':''}${mayEdit()&&!r.archivedAt?'<button data-edit>Düzenle</button><button class="isg-danger" data-archive>Arşivle</button>':''}${mayEdit()&&r.archivedAt?'<button data-restore>Geri Al</button>':''}`);d.overlay.querySelector('[data-form]').onclick=()=>forms(r);if(r.type==='personDocument'&&r.data?.kind==='medical'&&can('medical')){const button=document.createElement('button');button.textContent='Hekim Kaydı';button.onclick=()=>medicalForm(r);d.overlay.querySelector('.isg-dialog-foot').prepend(button);}fdIsgListenOptional(d.overlay.querySelector('[data-edit]'),'click',()=>edit(r.type,r));fdIsgListenOptional(d.overlay.querySelector('[data-action]'),'click',()=>edit('action',null,{branch:r.branch,title:r.title+' · Düzeltici faaliyet',personIds:r.personIds,data:{relatedRecordId:r.id}}));fdIsgListenOptional(d.overlay.querySelector('[data-archive]'),'click',()=>archive(r));fdIsgListenOptional(d.overlay.querySelector('[data-restore]'),'click',()=>archive(r,true));fdIsgListenOptional(d.overlay.querySelector('[data-upload]'),'change',ev=>upload(r,ev.target.files,d));d.overlay.querySelector('[data-attachments]').onclick=ev=>{
if(!fdIsgValid())return;
const b=ev.target.closest('[data-download]');if(b)download(r.id,b.dataset.download,b);};api('history',{id:r.id}).then(res=>{
if(!fdIsgValid())return;
if(dialog!==d)return;const items=res.items||res.history||res.events||res.activity||[];const versions=res.versions||[];d.overlay.querySelector('[data-history]').innerHTML=items.length?`<ol class="isg-history">${items.map(x=>`<li>${e(x.action||x.eventType||'Değişiklik')}<small>${e(x.actorName||userName(x.actor_id||x.actorId)||'')} · ${e(displayDate(x.created_at||x.createdAt||x.at))} · ${e(x.reason||x.details?.reason||'')}</small></li>`).join('')}</ol>`:'Henüz değişiklik geçmişi bulunmuyor.';if(versions.length)d.overlay.querySelector('[data-history]').innerHTML+='<h4 class="isg-section-title">Önceki Kayıt Sürümleri</h4>'+versions.map(v=>'<details style="padding:8px 0;border-bottom:1px solid #e3edf2"><summary style="cursor:pointer">Sürüm '+e(v.revision)+' · '+e(displayDate(v.createdAt))+' · '+e(userName(v.actorId))+'</summary><p>'+e(v.record?.title)+' · '+e(statuses[v.record?.status]||v.record?.status)+' · '+e(v.record?.branch)+'</p><dl>'+Object.entries(v.record?.data||{}).filter(([k,val])=>typeof val!=="object"&&!(v.record?.type==='personDocument'&&v.record?.data?.kind==='medical'&&k==='notes')).map(([k,val])=>'<dt>'+e(schemas[v.record?.type]?.fields.find(f=>f.key===k)?.label||k)+'</dt><dd>'+e(val)+'</dd>').join('')+'</dl></details>').join('');}).catch(err=>{
if(!fdIsgValid())return;
if(dialog===d)d.overlay.querySelector('[data-history]').textContent='Geçmiş okunamadı: '+err.message;});renderUploadQueue(r,d);return d;}
 const uploadQueues=new Map(),fileMimes={pdf:'application/pdf',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
 const fileAccept='.pdf,.jpg,.jpeg,.png,.docx,.xlsx,'+Object.values(fileMimes).join(',');
 function fileSpec(file){
fdIsgAssert();

  const extension=String(file?.name||'').split('.').pop().toLowerCase(),mime=fileMimes[extension],reported=String(file?.type||'').toLowerCase();
  if(!mime||!file?.name||/[\\/\x00-\x1f]/.test(file.name))throw new Error('PDF, JPG, PNG, Word (.docx) veya Excel (.xlsx) dosyası seçin.');
  if(reported&&reported!=='application/octet-stream'&&reported!==mime)throw new Error(file.name+': dosya türü uzantısıyla eşleşmiyor.');
  if(!Number.isFinite(file.size)||file.size<=0)throw new Error(file.name+': dosya boş veya okunamıyor.');
  if(file.size>20*1024*1024)throw new Error(file.name+': dosya 20 MB sınırını aşıyor.');
  return {name:file.name,mime,size:file.size};
 }
 function addFiles(queue,files){
fdIsgAssert();

  const additions=Array.from(files||[]);additions.forEach(fileSpec);
  const distinct=additions.filter((file,i)=>!queue.some(x=>x.file.name===file.name&&x.file.size===file.size&&x.file.lastModified===file.lastModified)&&!additions.slice(0,i).some(x=>x.name===file.name&&x.size===file.size&&x.lastModified===file.lastModified));
  if(queue.filter(x=>x.state!=='ready').length+distinct.length>20)throw new Error('Bir işlemde en fazla 20 evrak seçebilirsiniz.');
  distinct.forEach(file=>queue.push({file,state:'waiting',init:null,error:'',idempotencyKey:globalThis.crypto.randomUUID()}));
 }
 function fileRows(queue){
fdIsgAssert();
return queue.map((item,index)=>`<div class="isg-upload-row"><span><strong>${e(item.file.name)}</strong><small>${(item.file.size/1024/1024).toLocaleString('tr-TR',{maximumFractionDigits:2})} MB${item.error?' · '+e(item.error):''}</small></span><span class="isg-upload-state" data-state="${item.state}">${e({waiting:'Seçildi',uploading:'Yükleniyor…',ready:'Eklendi',failed:'Tamamlanmadı'}[item.state])}</span>${item.state!=='ready'?`<button type="button" data-file-remove="${index}" aria-label="${e(item.file.name+' · seçimden kaldır')}">Kaldır</button>`:''}</div>`).join('');}
 function recordFilePicker(){
fdIsgAssert();
return `<section class="isg-upload-section" data-record-uploads><h4 class="isg-section-title">İşleme Ait Evraklar</h4><label class="isg-field"><span>Belge / fotoğraf seç (isteğe bağlı)</span><input type="file" data-record-files multiple accept="${fileAccept}"><small>PDF, JPG, PNG, Word ve Excel · Her dosya en fazla 20 MB.</small></label><div class="isg-upload-list" data-pending-files></div></section>`;}
 function attachmentsHtml(r){
fdIsgAssert();
return (r.attachments||[]).length?r.attachments.map(a=>`<div class="isg-attachment"><span>${e(a.filename||a.name||'Belge')}<small class="isg-muted">${a.size?(a.size/1024/1024).toLocaleString('tr-TR',{maximumFractionDigits:2})+' MB':''}${a.uploadedAt||a.createdAt?' · '+e(displayDate(a.uploadedAt||a.createdAt)):''}</small></span><button type="button" data-download="${e(a.id)}">Aç / İndir</button></div>`).join(''):'<p class="isg-muted">Henüz belge yüklenmedi.</p>';}
 function renderUploadQueue(r,d){
fdIsgAssert();

  if(dialog!==d)return;
  const section=d.overlay.querySelector('[data-upload-queue]');if(!section)return;
  if(!mayEdit()||r.archivedAt||(r.type==='personDocument'&&r.data?.kind==='medical'&&!can('medical'))){section.replaceChildren();return;}
  const queue=uploadQueues.get(r.id)||[],ready=queue.filter(x=>x.state==='ready').length,remaining=queue.length-ready;
  section.innerHTML=queue.length?`<div class="isg-upload-summary" role="status" aria-live="polite">${ready} / ${queue.length} evrak eklendi${remaining?' · '+remaining+' bekliyor':''}</div><div class="isg-upload-list">${fileRows(queue)}</div>${remaining&&!d.busy?'<div class="isg-upload-actions"><button type="button" data-upload-retry>Tamamlanmayanları Yeniden Dene</button></div>':''}`:'';
  section.querySelectorAll('[data-file-remove]').forEach(button=>{
if(!fdIsgValid())return;
button.disabled=d.busy;button.onclick=()=>{
if(!fdIsgValid())return;
if(d.busy)return;queue.splice(Number(button.dataset.fileRemove),1);renderUploadQueue(r,d);};});
  fdIsgListenOptional(section.querySelector('[data-upload-retry]'),'click',()=>upload(r,null,d));
 }
 async function finishUpload(init,d,epoch){
try{
fdIsgAssert();

  for(let attempt=0;attempt<3;attempt++){
   if(dialog!==d||epoch!==sessionEpoch)throw new Error('Oturum değişti. İSG sayfasını yeniden açın.');
   try{return await fdIsgAwait(api('upload-finish',{uploadId:init.uploadId}));}
   catch(error){
if(!fdIsgValid())return;
if(error.code!=='UPLOAD_PENDING'||attempt===2)throw error;await fdIsgAwait(new Promise(resolve=>setTimeout(resolve,1500)));}
  }
 
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
}
 async function upload(r,files,d){
try{
fdIsgAssert();

  if(!d||dialog!==d||d.busy||!mayEdit()||r.archivedAt||(r.type==='personDocument'&&r.data?.kind==='medical'&&!can('medical')))return;
  const epoch=sessionEpoch,queue=uploadQueues.get(r.id)||[];uploadQueues.set(r.id,queue);
  try{if(files)addFiles(queue,files instanceof File?[files]:files);}catch(error){
if(!fdIsgValid())return;
modalError(error);return;}
  if(!queue.some(x=>x.state!=='ready'))return;
  busy(true,'Evraklar yükleniyor…');renderUploadQueue(r,d);let errors=0;
  try{
   for(const entry of queue){
    if(entry.state==='ready')continue;if(dialog!==d||epoch!==sessionEpoch)return;
    entry.state='uploading';entry.error='';renderUploadQueue(r,d);
    try{
     const spec=fileSpec(entry.file);let result=null;
     // A lost response may already have committed this exact upload. Check it
     // before transferring again; never reserve a second object blindly.
     if(entry.init){try{result=await fdIsgAwait(api('upload-finish',{uploadId:entry.init.uploadId}));}catch(error){
if(!fdIsgValid())return;
if(error.code==='UPLOAD_EXPIRED'){entry.init=null;entry.idempotencyKey=globalThis.crypto.randomUUID();}else if(error.code!=='UPLOAD_PENDING')throw error;}}
     if(!result){
      if(!entry.init)entry.init=await fdIsgAwait(api('upload-init',{recordId:r.id,filename:spec.name,mimeType:spec.mime,size:spec.size,expectedRevision:r.revision,medical:r.type==='personDocument'&&r.data?.kind==='medical',idempotencyKey:entry.idempotencyKey}));
      if(dialog!==d||epoch!==sessionEpoch)return;
      if(typeof root.fdIsgUploadFile!=='function')throw new Error('Dosya yükleme bileşeni hazır değil. Uygulamayı yenileyin.');
      let transferError=null;if(!entry.init.alreadyUploaded){try{await fdIsgAwait(root.fdIsgUploadFile(entry.init,entry.file));}catch(error){
if(!fdIsgValid())return;
transferError=error;}}
      if(dialog!==d||epoch!==sessionEpoch)return;
      try{result=await fdIsgAwait(finishUpload(entry.init,d,epoch));}catch(error){
if(!fdIsgValid())return;
if(error.code==='UPLOAD_PENDING'&&transferError)throw transferError;throw error;}
     }
     if(dialog!==d||epoch!==sessionEpoch)return;
     if(!result.record?.id)throw new Error('Evrak doğrulandı ancak güncel kayıt alınamadı. Yenile ile kontrol edin.');
     replaceRecord(result.record);Object.assign(r,result.record);entry.state='ready';entry.error='';
     d.overlay.querySelector('[data-attachments]').innerHTML=attachmentsHtml(r);
    }catch(error){
if(!fdIsgValid())return;

     if(dialog!==d||epoch!==sessionEpoch)return;
     errors++;entry.state='failed';entry.error=error.message||'Yükleme tamamlanmadı.';
     if(['UPLOAD_EXPIRED','UPLOAD_MISMATCH'].includes(error.code)){entry.init=null;entry.idempotencyKey=globalThis.crypto.randomUUID();}
     // Other files retain their ready status. A record save is not rolled back
     // or repeated merely because an attachment failed.
     if(['REVISION_CONFLICT','ARCHIVED'].includes(error.code))break;
    }
    renderUploadQueue(r,d);
   }
  }finally{
if(fdIsgValid()){

   if(dialog===d&&epoch===sessionEpoch){busy(false);renderUploadQueue(r,d);const input=d.overlay.querySelector('[data-upload]');if(input)input.value='';render();notice(errors?'Kayıt kaydedildi. Tamamlanmayan evrakları bu pencereden yeniden deneyebilirsiniz.':'Evraklar kayda eklendi.',errors?'warning':'success');}
  
}
}
 
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
}
 async function download(recordId,id,button){
try{
fdIsgAssert();
const popup=root.open('about:blank','_blank');try{button.disabled=true;const result=await fdIsgAwait(api('download',{recordId,attachmentId:id}));if(!/^https:\/\//.test(result.signedUrl||''))throw new Error('Belge bağlantısı alınamadı.');if(popup){popup.opener=null;popup.location.href=result.signedUrl;}else {const link=document.createElement('a');link.href=result.signedUrl;link.target='_blank';link.rel='noopener';link.textContent='Belgeyi Aç';button.after(link);}}catch(err){
if(!fdIsgValid())return;
popup?.close();modalError(err);}finally{
if(fdIsgValid()){
button.disabled=false;
}
}
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
}
 function archive(r,restore=false){
fdIsgAssert();
if(!r||!mayEdit())return;const d=modal(restore?'Arşivden Geri Al':'Kaydı Arşivle',`<p>${e(r.title)}</p><div class="isg-notice">${restore?'Kayıt etkin listeye geri alınır.':'Kayıt listeden kaldırılır; evrakları ve değişiklik geçmişi korunur.'}</div><label class="isg-field"><span>İşlem nedeni *</span><textarea data-reason required rows="3"></textarea></label>`,'<span class="isg-form-state" data-save-state></span><button data-cancel>Vazgeç</button><button class="isg-primary" data-confirm>Onayla</button>');d.overlay.querySelector('[data-cancel]').onclick=()=>closeDialog();d.overlay.querySelector('[data-confirm]').onclick=async()=>{
try{
if(!fdIsgValid())return;
if(d.busy)return;const reason=d.overlay.querySelector('[data-reason]').value.trim();if(!reason){modalError(new Error('İşlem nedenini yazın.'));return;}try{busy(true);const res=await fdIsgAwait(api(restore?'restore':'archive',{id:r.id,expectedRevision:r.revision,reason}));replaceRecord(res.record||res);closeDialog(true);render();notice(restore?'Kayıt geri alındı.':'Kayıt arşivlendi.');}catch(err){
if(!fdIsgValid())return;
busy(false);modalError(err);}
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
};}
 function personDetail(id){
fdIsgAssert();

  const p=S.people.find(x=>personId(x)===String(id));if(!p)return;const records=S.records.filter(r=>!r.archivedAt&&(r.personIds||[]).some(x=>String(x)===String(id)));const kkd=S.kkd.filter(r=>String(r.personId??r.personelId??r.personel_id??'')===String(id)),groups=new Map();kkd.forEach(x=>{
if(!fdIsgValid())return;
const key=x.date||x.recordDate||x.tarih||x.teslimTarihi||'';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(x);});
  const kkdHtml=Array.from(groups).sort(([a],[b])=>String(b).localeCompare(String(a))).map(([date,items])=>'<div style="padding:10px 0;border-bottom:1px solid #e2eaef"><div class="isg-actions" style="justify-content:space-between"><strong>'+e(displayDate(date))+'</strong><button data-ppe-date="'+e(date)+'">Teslim Formu</button></div><ul>'+items.map(x=>'<li>'+e(x.item||x.title||x.urunAdi||x.malzeme||x.urun||'KKD')+' · '+e(x.quantity||x.miktar||'')+'</li>').join('')+'</ul></div>').join('');
  const d=modal(personName(p),'<p class="isg-muted">'+e(personBranch(p))+' · '+e(p.jobTitle||p.job||p.gorev||'')+'</p><h4 class="isg-section-title">İSG Belgeleri ve İşlemler</h4><div class="isg-table-wrap">'+recordTable(records)+'</div><h4 class="isg-section-title">KKD Teslim Kayıtları</h4>'+(kkdHtml||'<p class="isg-muted">İlişkili KKD kaydı bulunmuyor. KKD Takip modülünden teslim kayıtlarını yönetebilirsiniz.</p>'),mayEdit()?'<button class="isg-primary" data-new-person>+ Belge / Durum Kaydı</button>':'',true);
  fdIsgListen(d.overlay,'click',ev=>{
if(!fdIsgValid())return;
const b=ev.target.closest('[data-act=detail]');if(b)detail(S.records.find(x=>x.id===b.dataset.id));const editButton=ev.target.closest('[data-act=edit]');if(editButton){const r=S.records.find(x=>x.id===editButton.dataset.id);edit(r.type,r);}const ppe=ev.target.closest('[data-ppe-date]');if(ppe){const items=groups.get(ppe.dataset.ppeDate)||[];root.fdIsgDocuments?.open({record:{id:'legacy-kkd-'+items.map(x=>x.id).join('-'),revision:0,type:'personDocument',title:'KKD Teslim Formu',recordDate:ppe.dataset.ppeDate,branch:personBranch(p),personIds:[id],status:'completed',data:{kind:'ppe',notes:'Mevcut KKD teslim kayıtlarından hazırlandı.'}},people:S.people,branch:personBranch(p),company:S.company,settings:S.settings,permissions:S.permissions,ppeItems:items.map(x=>({id:x.id,name:x.item||x.title||'KKD',item:x.item||x.title||'KKD',quantity:x.quantity||x.miktar||'',date:x.date})),sourceLegacyIds:items.map(x=>x.id)});}});
  fdIsgListenOptional(d.overlay.querySelector('[data-new-person]'),'click',()=>edit('personDocument',null,{branch:personBranch(p),personIds:[id]}));
 }
 function forms(record){
fdIsgAssert();
if(!root.fdIsgDocuments?.open){notice('Belge hazırlama bölümü yüklenemedi. Uygulamayı yenileyin.','error');return;}const context={record:record||null,records:S.records,users:S.users,equipment:S.records.find(x=>x.id===record?.equipmentId),ownerName:userName(record?.ownerId),people:S.people,branch:record?.branch||S.filters.branch||S.branches[0]||'',company:S.company,settings:S.settings,permissions:S.permissions};root.fdIsgDocuments.open(context);}
 function getExportModels(){
fdIsgAssert();
if(S.view==='people'&&!S.filters.type){const kinds={training:'İSG Eğitimi',medical:'Sağlık Uygunluğu',vocational:'Mesleki Yeterlilik',operator:'Operatör',firstAid:'İlk Yardım'};return [{title:'Personel İSG Durumu',subtitle:S.company,columns:[{key:'name',label:'Personel',type:'text'},{key:'branch',label:'Şube',type:'text'},...Object.entries(kinds).map(([k,l])=>({key:k,label:l,type:'text'}))],rows:matrixPeople().map(p=>({name:personName(p),branch:personBranch(p),...Object.fromEntries(Object.keys(kinds).map(k=>[k,documentStatus(latestDocument(personId(p),k)).label]))})),footnotes:['Sağlık bilgileri yalnız uygunluk durumu olarak gösterilir.'] }];}return [{title:tabs.find(x=>x[0]===S.view)?.[1]||'İSG Kayıtları',subtitle:S.company+(S.filters.branch?' · '+S.filters.branch:''),columns:[{key:'type',label:'Kayıt Türü',type:'text'},{key:'title',label:'Kayıt / İş',type:'text'},{key:'branch',label:'Şube',type:'text'},{key:'owner',label:'Sorumlu',type:'text'},{key:'recordDate',label:'Kayıt Tarihi',type:'date'},{key:'dueDate',label:'Son Tarih',type:'date'},{key:'status',label:'Durum',type:'text'},{key:'people',label:'İlgili Personeller',type:'text'}],rows:filtered().map(r=>({type:schemas[r.type]?.label||r.type,title:r.title,branch:r.branch,owner:userName(r.ownerId),recordDate:r.recordDate,dueDate:r.dueDate,status:statuses[r.status]||r.status,people:(r.personIds||[]).map(id=>personName(S.people.find(p=>personId(p)===String(id)))).join(', ')})),footnotes:['Şube ve tarih filtrelerine uygun kayıtlar aktarılmıştır. Ayrıntılı sağlık verileri bu çıktıya dahil değildir.']}];}
 function output(button){
fdIsgAssert();
if(!S.loaded)return;if(typeof root.fdIsgOutput==='function')return root.fdIsgOutput(getExportModels(),button);notice('Ortak çıktı penceresi yüklenemedi. Uygulamayı yenileyin.','error');}
 function ensureSettingsForm(){
fdIsgAssert();

  if(settingsForm?.isConnected)return settingsForm;
  settingsForm=document.createElement('form');settingsForm.id='isgSettingsForm';settingsForm.hidden=true;
  const container=document.getElementById('ayarlarApp');(container&&!container.closest('form')?container:document.body).appendChild(settingsForm);
  settingsForm.onsubmit=event=>{
if(!fdIsgValid())return;
event.preventDefault();event.stopPropagation();saveSettings(settingsHost?.querySelector('[data-act=settings-save]'));};return settingsForm;
 }
 async function mountSettings(host){
try{
fdIsgAssert();

  if(!(host instanceof Element))return;
  if(settingsHost===host&&host.childElementCount){ensureSettingsForm();return;}
  unmountSettings();settingsHost=host;settingsHost.classList.add('isg-settings-host');ensureSettingsForm();
  settingsHost.onclick=event=>{
if(!fdIsgValid())return;
event.stopPropagation();const button=event.target.closest('[data-act]');if(!button||button.disabled)return;if(button.dataset.act==='settings-refresh'){if(settingsDirty&&!root.confirm('Kaydedilmemiş İSG ayarları bırakılarak yeniden yüklensin mi?'))return;settingsDirty=false;settingsDraft=null;settingsDraftRevision=null;return refresh();}if(['new-user','access-edit'].includes(button.dataset.act))return onAppClick(event);};
  settingsHost.oninput=settingsHost.onchange=event=>{
if(!fdIsgValid())return;
event.stopPropagation();if(event.target.form===settingsForm){if(!settingsDirty)settingsDraftRevision=S.revision;settingsDirty=true;settingsNotice('Kaydedilmemiş İSG değişiklikleri var.');}};
  fdIsgListen(settingsHost,'invalid',onSettingsInvalid,true);
  settingsHost.onsubmit=event=>{
if(!fdIsgValid())return;
event.preventDefault();event.stopPropagation();};
  await fdIsgAwait(refresh());
 
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
}
 function onSettingsInvalid(event){
fdIsgAssert();
if(event.target.form!==settingsForm)return;event.target.closest('details')?.setAttribute('open','');settingsNotice('İSG alanlarını kontrol edin. Süreler 1–240 arasında tam sayı olmalıdır.','error');}
 function unmountSettings(){if(settingsHost){delete settingsHost.dataset.isgSettingsScope;settingsHost.removeEventListener('invalid',onSettingsInvalid,true);settingsHost.replaceChildren();settingsHost.onclick=settingsHost.oninput=settingsHost.onchange=settingsHost.onsubmit=null;}if(settingsSaving){settingsSaving=null;S.busy=false;}settingsForm?.remove();settingsHost=null;settingsForm=null;settingsDirty=false;settingsDraft=null;settingsDraftRevision=null;settingsRenderedBranches=[];}
 function settingsDraftField(control){
fdIsgAssert();
const match=control.name.match(/^(hazard|nace|hazardNote|branchRule|branchRuleNote)\.(\d+)(\..*)?$/),draft={name:control.name,value:control.value,checked:control.checked};if(match){draft.branch=settingsRenderedBranches[Number(match[2])];draft.prefix=match[1];draft.suffix=match[3]||'';}return draft;}
 function restoreSettingsDraft(){
fdIsgAssert();
settingsDraft?.forEach(draft=>{
if(!fdIsgValid())return;
let name=draft.name;if(draft.prefix){const index=S.branches.indexOf(draft.branch);if(index<0)return;name=draft.prefix+'.'+index+draft.suffix;}const control=settingsForm.elements.namedItem(name);if(control){control.value=draft.value;if(control.type==='checkbox')control.checked=draft.checked;}});}
 function freezeSettingsControls(context=settingsSaving){
fdIsgAssert();
if(!context||context!==settingsSaving||context.epoch!==sessionEpoch||context.host!==settingsHost||context.form!==settingsForm)return;settingsHost.querySelectorAll('input,select,textarea,button').forEach(control=>{
if(!fdIsgValid())return;
if(!context.controls.has(control))context.controls.set(control,control.disabled);control.disabled=true;});}
 function releaseSettingsControls(context){if(context!==settingsSaving||context.epoch!==sessionEpoch||context.host!==settingsHost||context.form!==settingsForm)return false;context.controls.forEach((wasDisabled,control)=>{if(control.isConnected&&settingsHost.contains(control))control.disabled=wasDisabled;});settingsSaving=null;S.busy=false;return true;}
 function renderSettingsHost(){
fdIsgAssert();

  if(!settingsHost)return;
  if(S.loaded&&!S.loading&&!S.error&&!canSettings('manageSettings')&&!canSettings('manageUsers')){settingsDirty=false;settingsDraft=null;settingsDraftRevision=null;settingsHost.innerHTML='<div class="isg-notice" role="status">İSG ayarları ve erişim yönetimi yalnız yöneticiye açıktır.</div>';return;}
  if(settingsDirty&&settingsHost.querySelector('#isgSettingsFields'))settingsDraft=Array.from(settingsHost.querySelectorAll('input[name],select[name],textarea[name]')).map(settingsDraftField);
  if(S.loading||!S.loaded||S.error){settingsHost.innerHTML=`<div class="isg-panel isg-empty" role="status"><strong>${S.loading?'İSG ayarları yükleniyor…':'İSG ayarları yüklenemedi'}</strong>${S.loading?'Lütfen bekleyin.':e(S.error||'Bağlantıyı yenileyerek tekrar deneyebilirsiniz.')}${!S.loading?'<div class="isg-actions"><button type="button" form="isgSettingsForm" data-act="settings-refresh">Tekrar dene</button></div>':''}</div>`;return;}
  settingsHost.innerHTML=renderSettings();settingsRenderedBranches=S.branches.slice();
  if(settingsDirty&&settingsDraft){restoreSettingsDraft();settingsNotice('Kaydedilmemiş İSG değişiklikleri var.');}freezeSettingsControls();
 }
 function renewalRows(branch='',index=null){
fdIsgAssert();

  const rules=Array.isArray(S.settings.documentRenewals)?S.settings.documentRenewals:[];
  return renewalKinds.map(([kind,label])=>{
if(!fdIsgValid())return;
const rule=rules.find(item=>item.kind===kind&&(item.branch||'')===branch)||{},name=index===null?'rule.'+kind:'branchRule.'+index+'.'+kind,noteName=index===null?'ruleNote.'+kind:'branchRuleNote.'+index+'.'+kind;return `<div class="isg-renewal-row"><span>${e(label)}</span><label class="isg-field"><span>Ay</span><input form="isgSettingsForm" name="${name}" type="number" min="1" max="240" step="1" value="${e(rule.months||'')}" placeholder="${branch?'Genel süre':'Önerme'}" aria-label="${e((branch?branch+' · ':'Genel · ')+label+' süresi, ay')}"></label><label class="isg-field"><span>Uzman / hekim notu</span><input form="isgSettingsForm" name="${noteName}" maxlength="2000" value="${e(rule.note||'')}" aria-label="${e((branch?branch+' · ':'Genel · ')+label+' uzman notu')}"></label></div>`;}).join('');
 }
 function renderSettings(){
fdIsgAssert();

  const set=S.settings,catalog=root.fdIsgDocuments?.catalog||[],templates=Array.isArray(set.templates)?set.templates:[],reminderDays=Array.isArray(set.reminderDays)?set.reminderDays:Number.isFinite(Number(set.reminderDays))&&Number(set.reminderDays)>0?[Number(set.reminderDays)]:[30,15,7];
  const branchSections=S.branches.map((branch,index)=>{
if(!fdIsgValid())return;
const hazard=(set.branchHazards||[]).find(item=>item.branch===branch)||{};return `<details class="isg-settings-accordion"><summary>${e(branch)}</summary><div class="isg-accordion-body"><div class="isg-form-grid"><label class="isg-field"><span>Tehlike sınıfı</span><select form="isgSettingsForm" name="hazard.${index}">${options({unconfirmed:'Uzman belirlesin',azTehlikeli:'Az tehlikeli',tehlikeli:'Tehlikeli',cokTehlikeli:'Çok tehlikeli'},hazard.hazardClass||'unconfirmed',null)}</select></label><label class="isg-field"><span>NACE kodu</span><input form="isgSettingsForm" name="nace.${index}" maxlength="40" value="${e(hazard.naceCode)}"></label><label class="isg-field isg-full"><span>Tehlike sınıfı uzman notu</span><textarea form="isgSettingsForm" name="hazardNote.${index}" rows="2" maxlength="2000">${e(hazard.expertNote)}</textarea></label></div><h4 class="isg-section-title">Şubeye Özel Süre Önerileri</h4><p class="isg-muted">Ay alanı boşsa genel süre kullanılır. Şubeye özel öneri için ayı ve değerlendirme notunu yazın.</p><div class="isg-renewal-list">${renewalRows(branch,index)}</div></div></details>`;}).join('');
  const templateSections=catalog.map(template=>{
if(!fdIsgValid())return;
const custom=templates.find(item=>item.id===template.id)||{};return `<details class="isg-settings-accordion"><summary>${e(custom.title??template.name)}</summary><div class="isg-accordion-body isg-form-grid"><label class="isg-field"><span>Belge başlığı</span><input form="isgSettingsForm" name="templateTitle.${e(template.id)}" maxlength="300" value="${e(custom.title??template.name)}"></label><label class="isg-check"><input form="isgSettingsForm" type="checkbox" name="templateEnabled.${e(template.id)}" ${custom.enabled!==false?'checked':''}> Kullanıma açık</label><label class="isg-field isg-full"><span>Şablon metni</span><textarea form="isgSettingsForm" name="templateBody.${e(template.id)}" rows="4" maxlength="15000">${e(custom.body??template.body??'')}</textarea></label><label class="isg-field isg-full"><span>Alt açıklama</span><textarea form="isgSettingsForm" name="templateFooter.${e(template.id)}" rows="2" maxlength="3000">${e(custom.footer??'')}</textarea></label></div></details>`;}).join('');
  const accessUsers=S.users.filter(user=>['IsgUzmani','IsyeriHekimi'].includes(user.role)).map(user=>`<div class="isg-attachment"><span>${e(user.name||user.username||user.adSoyad)}<small class="isg-muted">${e(user.role==='IsyeriHekimi'?'İşyeri Hekimi':'İSG Uzmanı')} · ${e(user.allBranches?'Tüm şubeler':(user.branches||[]).join(', '))}</small></span><div class="isg-actions"><span class="isg-badge">${user.active===false?'Pasif':'Aktif'}</span><button type="button" form="isgSettingsForm" data-act="access-edit" data-id="${e(user.id)}">Yetkiler</button></div></div>`).join('');
  return `<div id="isgSettingsFields"><div class="isg-settings-head"><button type="button" form="isgSettingsForm" data-act="settings-refresh">Yenile</button></div><div data-isg-settings-message role="status" aria-live="polite"></div><div class="isg-notice">Takip sürelerini şube tehlike sınıfı, ekipman türü ve uzman / hekim değerlendirmesine göre belirleyin. Süre önerileri yasal onay yerine geçmez; eski kayıtların tarihleri değiştirilmez.</div><div class="isg-settings-grid">${canSettings('manageSettings')?`<section class="isg-settings-wide"><h3>Genel Takip Kuralları</h3><label class="isg-field isg-reminder-field"><span>Yaklaşan tarih uyarıları · gün</span><input form="isgSettingsForm" name="reminderDays" value="${e(reminderDays.join(', '))}" placeholder="30, 15, 7"><small>Takip ekranında yaklaşan işleri işaretler. Otomatik mesaj göndermez.</small></label><h4 class="isg-section-title">Yeni Kayıtlar İçin Süre Önerileri</h4><p class="isg-muted">Ay alanını boş bırakırsanız bu tür için genel tarih önerisi verilmez.</p><div class="isg-renewal-list">${renewalRows()}</div></section><section class="isg-settings-wide"><h3>Şube Bilgileri ve Özel Takip Süreleri</h3>${branchSections||'<p class="isg-muted">Henüz şube tanımlanmadı.</p>'}</section><section class="isg-settings-wide"><h3>Evrak / Dilekçe / Form Şablonları</h3><p class="isg-muted">Alan kodları: {{firma}}, {{sube}}, {{tarih}}, {{personel}}, {{gorev}}, {{egitim}}, {{konu}}, {{aciklama}}, {{ekipman}}, {{yil}}, {{muhatap}}.</p>${templateSections||'<p class="isg-muted">Belge şablonları henüz yüklenmedi.</p>'}</section>`:''}${canSettings('manageUsers')?`<section class="isg-settings-wide" id="isgAccessSection"><h3>İSG Uzmanı ve İşyeri Hekimi Erişimi</h3><p class="isg-muted">Uzman yalnız İSG modülüne ve verilen şubelere erişir. Maaş, banka, genel personel dosyaları ve ayrıntılı sağlık verileri açılmaz.</p><div class="isg-actions isg-access-actions"><button type="button" form="isgSettingsForm" data-act="new-user">+ İSG Kullanıcısı Aç</button></div>${accessUsers||'<p class="isg-muted">Henüz uzman erişimi tanımlanmadı.</p>'}</section>`:''}</div>${canSettings('manageSettings')?'<div class="isg-settings-save"><span class="isg-muted">İSG ayarlarını ayrı kaydeder.</span><button class="isg-primary" type="submit" form="isgSettingsForm" data-act="settings-save">İSG Ayarlarını Kaydet</button></div>':''}</div>`;
 }
 async function saveSettings(button){
try{
fdIsgAssert();

  if(S.busy||!canSettings('manageSettings')||!settingsForm||!settingsHost||!button)return;
  if(!settingsForm.reportValidity())return;
  const get=key=>settingsForm.elements.namedItem(key),reminderDays=Array.from(new Set(get('reminderDays').value.split(/[,;\s]+/).filter(Boolean).map(Number)));
  if(!reminderDays.length||reminderDays.length>10||reminderDays.some(value=>!Number.isInteger(value)||value<1||value>365)){settingsNotice('En fazla 10 hatırlatma gününü 1–365 arasında, virgülle ayırarak yazın.','error');return;}
  const oldRules=Array.isArray(S.settings.documentRenewals)?S.settings.documentRenewals:[],knownKinds=new Set(renewalKinds.map(([kind])=>kind)),knownBranches=new Set(S.branches),ruleMap=new Map();
  oldRules.filter(rule=>!knownKinds.has(rule.kind)||(rule.branch&&!knownBranches.has(rule.branch))).forEach(rule=>ruleMap.set(rule.kind+'\u0000'+(rule.branch||''),{...rule,branch:rule.branch||''}));
  const writeRules=(branch,index)=>renewalKinds.forEach(([kind])=>{
if(!fdIsgValid())return;
const name=index===null?'rule.'+kind:'branchRule.'+index+'.'+kind,noteName=index===null?'ruleNote.'+kind:'branchRuleNote.'+index+'.'+kind,value=get(name)?.value;if(!value)return;const old=oldRules.find(rule=>rule.kind===kind&&(rule.branch||'')===branch)||{};ruleMap.set(kind+'\u0000'+branch,{...old,kind,branch,months:Number(value),note:get(noteName)?.value||''});});
  writeRules('',null);S.branches.forEach((branch,index)=>writeRules(branch,index));const documentRenewals=Array.from(ruleMap.values());
  if(documentRenewals.length>100||documentRenewals.some(rule=>!Number.isInteger(rule.months)||rule.months<1||rule.months>240)){settingsNotice('En fazla 100 süre önerisi tanımlanabilir. Ay değerleri 1–240 arasında tam sayı olmalıdır.','error');return;}
  const hazardMap=new Map();(S.settings.branchHazards||[]).filter(hazard=>!knownBranches.has(hazard.branch)).forEach(hazard=>hazardMap.set(hazard.branch,{...hazard}));S.branches.forEach((branch,index)=>{
if(!fdIsgValid())return;
const old=(S.settings.branchHazards||[]).find(hazard=>hazard.branch===branch)||{};hazardMap.set(branch,{...old,branch,hazardClass:get('hazard.'+index).value,naceCode:get('nace.'+index).value,expertNote:get('hazardNote.'+index).value});});const branchHazards=Array.from(hazardMap.values());
  const oldTemplates=Array.isArray(S.settings.templates)?S.settings.templates:[],catalog=root.fdIsgDocuments?.catalog||[],catalogIds=new Set(catalog.map(template=>template.id)),templateMap=new Map();oldTemplates.filter(template=>!catalogIds.has(template.id)).forEach(template=>templateMap.set(template.id,{...template}));
  catalog.forEach(template=>{
if(!fdIsgValid())return;
const old=oldTemplates.find(item=>item.id===template.id)||{},title=get('templateTitle.'+template.id).value,body=get('templateBody.'+template.id).value,footer=get('templateFooter.'+template.id).value,enabled=get('templateEnabled.'+template.id).checked,changed=(old.title??template.name)!==title||(old.body??template.body??'')!==body||(old.footer??'')!==footer||(old.enabled!==false)!==enabled;templateMap.set(template.id,{...old,id:template.id,title,body,footer,enabled,version:Number(old.version||template.version||1)+(changed&&old.id?1:0)});});
  const settings={...S.settings,branchHazards,reminderDays,documentRenewals,templates:Array.from(templateMap.values()),companyInfo:S.settings.companyInfo||{}};delete settings.revision;delete settings.updatedAt;S.busy=true;const context=settingsSaving={epoch:sessionEpoch,host:settingsHost,form:settingsForm,controls:new Map()};freezeSettingsControls(context);button.textContent='Kaydediliyor…';
  try{const res=await fdIsgAwait(api('settings-save',{settings,expectedRevision:settingsDirty&&settingsDraftRevision!==null?settingsDraftRevision:S.revision}));if(!releaseSettingsControls(context))return;S.settings=res.settings||res;S.revision=S.settings.revision||S.revision+1;settingsDirty=false;settingsDraft=null;settingsDraftRevision=null;render();settingsNotice('İSG ayarları kaydedildi.');}catch(err){
if(!fdIsgValid())return;
if(releaseSettingsControls(context)){settingsNotice(err.message,'error');button.textContent='İSG Ayarlarını Kaydet';}}finally{
if(fdIsgValid()){
releaseSettingsControls(context);
}
}
 
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
}
 function userForm(){
fdIsgAssert();
if(!canSettings('manageUsers'))return;const d=modal('İSG Kullanıcısı Aç',`<form id="isgUserForm"><div class="isg-notice">Şifreyi güvenli bir kanaldan uzmana verin. Hesap yalnız seçili şubelerdeki İSG işlerine erişir.</div><div class="isg-form-grid"><label class="isg-field"><span>Ad soyad *</span><input name="name" required></label><label class="isg-field"><span>Kullanıcı adı *</span><input name="username" autocomplete="off" required></label><label class="isg-field"><span>İlk şifre *</span><input name="password" type="password" minlength="6" autocomplete="new-password" required><small>En az 6 karakter; harf veya rakam zorunluluğu yoktur.</small></label><label class="isg-field"><span>Görev *</span><select name="role"><option value="IsgUzmani">İSG Uzmanı</option><option value="IsyeriHekimi">İşyeri Hekimi</option></select></label><div class="isg-field isg-full"><span>Yetkili Şubeler *</span>${S.branches.map(b=>`<label class="isg-check"><input type="checkbox" name="branches" value="${e(b)}"> ${e(b)}</label>`).join('')}</div></div></form>`,'<span class="isg-form-state" data-save-state></span><button data-cancel>Vazgeç</button><button type="submit" form="isgUserForm" class="isg-primary">Kullanıcı Oluştur</button>');d.overlay.querySelector('[data-cancel]').onclick=()=>closeDialog();const form=d.overlay.querySelector('form');form.onsubmit=async ev=>{
try{
if(!fdIsgValid())return;
ev.preventDefault();if(d.busy||!form.reportValidity())return;const branches=Array.from(form.querySelectorAll('[name=branches]:checked')).map(x=>x.value);if(!branches.length){modalError(new Error('En az bir yetkili şube seçin.'));return;}try{busy(true);const res=await fdIsgAwait(api('access-create-user',{fullName:form.elements.namedItem('name').value.trim(),username:form.elements.username.value.trim(),password:form.elements.password.value,role:form.elements.role.value,branches,allBranches:false,active:true,write:true,idempotencyKey:d.idempotencyKey||(d.idempotencyKey=globalThis.crypto?.randomUUID?.()||'access-'+Date.now()+'-'+Math.random().toString(36).slice(2))}));form.elements.password.value='';if(res.user)S.users.push(res.user);closeDialog(true);await fdIsgAwait(refresh());notice('İSG kullanıcısı oluşturuldu.');}catch(err){
if(!fdIsgValid())return;
busy(false);modalError(err);}
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
};}
 function accessForm(user){
fdIsgAssert();

  if(!user||!canSettings('manageUsers'))return;const d=modal('İSG Erişim Yetkileri · '+(user.name||user.username||''),`<form id="isgAccessForm"><div class="isg-notice">Erişimi durdurmak için Aktif seçimini kaldırın. Geçmiş kayıtları silinmez.</div><label class="isg-check"><input name="active" type="checkbox" ${user.active?'checked':''}> Aktif hesap</label><label class="isg-check"><input name="write" type="checkbox" ${user.write?'checked':''}> Kayıt ekleme / düzenleme yetkisi</label><label class="isg-check"><input name="allBranches" type="checkbox" ${user.allBranches?'checked':''}> Tüm şubeler</label><h4 class="isg-section-title">Yetkili Şubeler</h4>${S.branches.map(b=>`<label class="isg-check"><input name="branches" type="checkbox" value="${e(b)}" ${(user.branches||[]).includes(b)?'checked':''}> ${e(b)}</label>`).join('')}</form>`,'<span class="isg-form-state" data-save-state></span><button data-password>Şifre Sıfırla</button><button data-cancel>Vazgeç</button><button type="submit" form="isgAccessForm" class="isg-primary">Yetkileri Kaydet</button>');d.overlay.querySelector('[data-cancel]').onclick=()=>closeDialog();d.overlay.querySelector('[data-password]').onclick=()=>passwordForm(user);const form=d.overlay.querySelector('form');form.onsubmit=async ev=>{
try{
if(!fdIsgValid())return;
ev.preventDefault();if(d.busy)return;const branches=Array.from(form.querySelectorAll('[name=branches]:checked')).map(x=>x.value);if(form.elements.active.checked&&!form.elements.allBranches.checked&&!branches.length){modalError(new Error('Aktif hesap için en az bir şube seçin.'));return;}try{busy(true);await fdIsgAwait(api('access-save',{userId:user.id,role:user.role,active:form.elements.active.checked,write:form.elements.write.checked,allBranches:form.elements.allBranches.checked,branches,expectedRevision:user.revision||0}));closeDialog(true);await fdIsgAwait(refresh());notice('İSG erişim yetkileri kaydedildi.');}catch(err){
if(!fdIsgValid())return;
busy(false);modalError(err);}
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
};
 }
 function passwordForm(user){
fdIsgAssert();
if(!canSettings('manageUsers'))return;const d=modal('Geçici Şifre Belirle · '+(user.name||''),'<form id="isgPasswordForm"><div class="isg-notice">Yeni şifreyi güvenli kanaldan iletin. Kullanıcı ilk girişte şifresini değiştirmek zorundadır.</div><label class="isg-field"><span>Yeni geçici şifre *</span><input type="password" name="password" minlength="6" autocomplete="new-password" required><small>En az 6 karakter; harf veya rakam zorunluluğu yoktur.</small></label></form>','<span class="isg-form-state" data-save-state></span><button data-cancel>Vazgeç</button><button type="submit" form="isgPasswordForm" class="isg-primary">Şifreyi Sıfırla</button>');d.overlay.querySelector('[data-cancel]').onclick=()=>closeDialog();const form=d.overlay.querySelector('form');form.onsubmit=async ev=>{
try{
if(!fdIsgValid())return;
ev.preventDefault();if(d.busy||!form.reportValidity())return;try{busy(true);await fdIsgAwait(api('access-reset-password',{userId:user.id,password:form.elements.password.value}));form.elements.password.value='';closeDialog(true);notice('Geçici şifre belirlendi. Kullanıcı ilk girişte değiştirecek.');}catch(err){
if(!fdIsgValid())return;
busy(false);modalError(err);}
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
};}
 async function medicalForm(record){
try{
fdIsgAssert();

  if(!record||!can('medical'))return;const d=modal('Hekim Kaydı · '+record.title,'<div class="isg-notice">Bu içerik yalnız işyeri hekimine açıktır. Genel İSG listelerine, çıktılara ve mesajlara dahil edilmez.</div><div data-medical-body class="isg-muted">Hekim kaydı yükleniyor…</div>','<span class="isg-form-state" data-save-state></span><button data-cancel>Kapat</button><button type="submit" form="isgMedicalForm" class="isg-primary" data-medical-save disabled>Hekim Kaydını Kaydet</button>');d.overlay.querySelector('[data-cancel]').onclick=()=>closeDialog();
  try{const res=await fdIsgAwait(api('medical-get',{recordId:record.id}));if(dialog!==d)return;const stored=res.medical||{},m=stored.data||{};const people=S.people.filter(p=>(record.personIds||[]).map(String).includes(personId(p)));const fields=[F('assessmentDate','Muayene tarihi','date',null,true),F('assessment','Hekim değerlendirmesi','textarea'),F('restrictions','Hekim tarafından belirlenen kısıtlar','textarea'),F('doctorNote','Hekim notu','textarea'),F('nextReviewDate','Sonraki değerlendirme','date')];d.overlay.querySelector('[data-medical-body]').innerHTML=`<form id="isgMedicalForm"><div class="isg-form-grid"><label class="isg-field isg-full"><span>Personel *</span><select name="personId" required>${options(Object.fromEntries(people.map(p=>[personId(p),personName(p)])),m.personId)}</select></label>${fields.map(f=>fieldHtml(f,m[f.key])).join('')}</div></form>`;d.overlay.querySelector('[data-medical-save]').disabled=!mayEdit();const form=d.overlay.querySelector('form');form.onsubmit=async ev=>{
try{
if(!fdIsgValid())return;
ev.preventDefault();if(d.busy||!mayEdit()||!form.reportValidity())return;const medical={personId:form.elements.personId.value};fields.forEach(f=>medical[f.key]=form.elements.namedItem('data.'+f.key).value||'');try{busy(true);await fdIsgAwait(api('medical-save',{recordId:record.id,medical,expectedRevision:stored.revision||0}));closeDialog(true);notice('Hekim kaydı güvenli alana kaydedildi.');}catch(err){
if(!fdIsgValid())return;
busy(false);modalError(err);}
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
};}catch(err){
if(!fdIsgValid())return;
modalError(err);}
 
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
}
 function reset(){sessionEpoch++;uploadQueues.clear();loadSequence++;closeDialog(true);unmountSettings();refreshPromise=null;root.fdIsgDocuments?.clear?.();Object.assign(S,{records:[],people:[],branches:[],vehicles:[],kkd:[],users:[],activity:[],settings:{},permissions:{},view:'overview',filters:{query:'',branch:'',status:'',from:'',to:'',type:'',archive:false,deadline:''},loaded:false,loading:false,busy:false,error:'',company:'',revision:0});if(app){app.replaceChildren();app.style.display='none';}}
 root.openIsgApp=open;
 root.fdIsgWorkspace={open,refresh,mountSettings,unmountSettings,edit,detail,getExportModels,validateRecord,documentStatus,schemas,state:S,filtered,personName,personBranch,personId,reset,access:()=>{
if(!fdIsgValid())return;
if(!canSettings('manageUsers'))return;return root.fdIsgSettingsOpen?.(true);},close:()=>{
if(!fdIsgValid())return;
closeDialog();if(app)app.style.display='none';}};
})(fdIsgRoot);



/* ISG document forms. Read-only generation; signatures and statutory reports are never fabricated. */
(function (root) {
if(!fdIsgValid())return;

    'use strict';
    const VERSION = 1;
    let generationEpoch = 0;
    const safe = value => value == null ? '' : String(value).replace(/\u0000/g, '').slice(0, 50000);
    const clone = value => JSON.parse(JSON.stringify(value || {}));
    const nameOf = person => [person?.name, person?.adSoyad, person?.adsoyad, person?.adiSoyadi, person?.fullName, person?.full_name, person?.isim, [person?.ad, person?.soyad].filter(Boolean).join(' ')].map(value => safe(value).trim()).find(Boolean) || '';
    const idOf = person => safe(person?.id ?? person?.personelId ?? person?.personel_id ?? person?.ID);
    const jobOf = person => [person?.job, person?.jobTitle, person?.gorev, person?.unvan].map(value => safe(value).trim()).find(Boolean) || '';
    const branchOf = value => safe(typeof value === 'object' ? value?.name || value?.ad || value?.label : value);
    const date = value => {
if(!fdIsgValid())return;
 const text = safe(value); const match = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/); return match ? `${match[3]}.${match[2]}.${match[1]}` : text || '-'; };
    const now = () => new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
    const templates = [
        { id: 'trainingAttendance', name: 'Eğitim Katılım ve İmza Çizelgesi', types: ['training'], roster: true },
        { id: 'trainingMinutes', name: 'Eğitim Tutanağı', types: ['training'], body: '{{tarih}} tarihinde {{sube}} işyerinde {{egitim}} konulu eğitim gerçekleştirilmesine ilişkin kayıt ve değerlendirmeler aşağıdadır. Bu form, fiilen gerçekleştirilen eğitim ve imza kayıtlarıyla birlikte tamamlanır.' },
        { id: 'trainingAssessment', name: 'Eğitim Değerlendirme Formu', types: ['training'], individual: true },
        { id: 'trainingCertificate', name: 'Eğitim Katılım Belgesi', types: ['training'], individual: true, certificate: true },
        { id: 'ppeDelivery', name: 'KKD Teslim ve Zimmet Tutanağı', types: ['personDocument', 'task'], individual: true, body: 'Aşağıda belirtilen kişisel koruyucu donanımların teslimi, kullanım bilgilendirmesi ve teslim alanın imzası ile kayıt altına alınması için düzenlenmiştir.' },
        { id: 'medicalReferral', name: 'Sağlık Muayenesi Sevk Yazısı', types: ['personDocument', 'task'], individual: true, body: '{{personel}} adlı personelin, {{gorev}} işi kapsamında gerekli işe giriş / periyodik sağlık değerlendirmesi için yetkili sağlık birimine yönlendirilmesini rica ederiz. Bu yazı sağlık raporu veya işe uygunluk kararı değildir.' },
        { id: 'emergencyAssignment', name: 'Acil Durum Ekibi Görevlendirme Yazısı', types: ['emergencyTeam'], roster: true, body: '{{sube}} işyerinin acil durum organizasyonu kapsamında aşağıdaki personellerin belirtilen görevler için görevlendirilmesi önerilir. Görevlendirme, yetkili onay ve personele tebliğ ile tamamlanır.' },
        { id: 'drillAttendance', name: 'Tatbikat Katılım ve İmza Formu', types: ['drill'], roster: true },
        { id: 'drillMinutes', name: 'Tatbikat Tutanağı', types: ['drill'], body: 'Tatbikatın amacı, gerçekleşen uygulama, gözlemler ve iyileştirme faaliyetleri aşağıda kayıt altına alınmıştır.' },
        { id: 'nonconformity', name: 'Uygunsuzluk Tespit Formu', types: ['risk', 'action', 'inspection', 'measurement', 'task'], body: 'Tespit edilen uygunsuzluk, alınacak önlemler, sorumlu kişiler ve hedef tarihler aşağıda belirtilmiştir. Tamamlanma kaydı, gerçekleştirilen faaliyetin kontrolü ve yetkili onayı ile oluşturulur.' },
        { id: 'correctiveAction', name: 'Düzeltici Faaliyet ve Kapanış Formu', types: ['risk', 'action', 'inspection', 'measurement', 'task'] },
        { id: 'incident', name: 'İş Kazası / Ramak Kala Olay Tutanağı', types: ['incident'], body: 'Olayın bilinen koşulları ve tanık beyanları aşağıda kayıt altına alınmıştır. Bu tutanak, gerekli resmi bildirimlerin yerine geçmez; olayın nedeni hakkında kesin hüküm içermez.' },
        { id: 'inspectionRequest', name: 'Periyodik Kontrol / Ölçüm Talep Yazısı', types: ['equipment', 'inspection', 'measurement'], body: '{{ekipman}} için kapsamı aşağıda belirtilen kontrol / ölçüm hizmetinin yetkili kişi veya kuruluştan alınması talep edilmektedir. Bu belge kontrol raporu veya uygunluk belgesi değildir.' },
        { id: 'providerVisit', name: 'İSG Uzmanı / OSGB Ziyaret ve Öneri Formu', types: ['provider', 'visit'], body: 'Ziyaret sırasında ele alınan konular, tespitler, öneriler ve takip edilecek işler aşağıda belirtilmiştir. Gerekli resmi defter ve kayıt işlemleri ayrıca yürütülür.' },
        { id: 'annualWorkPlan', name: 'Yıllık İSG Çalışma Planı', types: ['annualPlan', 'provider'], body: '{{yil}} yılı için planlanan çalışmalar, sorumlular ve hedef tarihler aşağıda gösterilmiştir. Plan, yetkili değerlendirme ve onay ile uygulanır.' },
        { id: 'annualTrainingPlan', name: 'Yıllık Eğitim Planı', types: ['annualPlan', 'training'], body: '{{yil}} yılı için planlanan eğitimler, hedef katılımcılar, eğitmenler ve tarihler aşağıda belirtilmiştir.' },
        { id: 'notification', name: 'Bildirim / Tebliğ Yazısı', types: ['*'], individual: true, body: 'Sayın {{personel}},\n\n{{konu}}\n\nAçıklama: {{aciklama}}\n\nBilgilerinize sunarız.' },
        { id: 'petition', name: 'Dilekçe Taslağı', types: ['*'], individual: true, body: '{{muhatap}}\n\nKonu: {{konu}}\n\n{{aciklama}}\n\nGereğini arz / rica ederim.\n\n{{tarih}}\n{{personel}}' },
        { id: 'recordSummary', name: 'İSG İş / Kayıt Özet Formu', types: ['*'] }
    ];
    const catalog = Object.freeze(templates.map(item => Object.freeze({ ...item, version: VERSION })));
    const labels = { draft: 'Taslak', planned: 'Planlandı', pending: 'Kontrol / onay bekliyor', open: 'Açık', inProgress: 'Devam ediyor', in_progress: 'Devam ediyor', awaitingReview: 'Kontrol / onay bekliyor', review: 'Kontrol / onay bekliyor', completed: 'Tamamlandı', approved: 'Onaylandı', closed: 'Kapandı', cancelled: 'İptal edildi', expired: 'Süresi doldu' };
    const teamLabels = { firstAid: 'İlk yardım', fire: 'Yangınla mücadele', evacuation: 'Tahliye', searchRescue: 'Arama / kurtarma' };
    const isMedical = record => record?.type === 'personDocument' && /^(medical|health|saglik|sağlık|sağlık raporu|saglik raporu|sağlık muayenesi)$/i.test(safe(record?.data?.kind).trim());
    function list(context = {}) {
fdIsgAssert();
 return catalog.filter(item => item.types.includes('*') || item.types.includes(context.record?.type)); }
    function contextValues(context, person) {
fdIsgAssert();

        const r = context.record || {}, d = r.data || {}, company = context.company;
        return { firma: (safe(typeof company === 'object' ? company?.name || company?.unvan || company?.ad : company) || safe(context.settings?.companyName) || 'İşyeri').slice(0, 400), sube: (branchOf(context.branch || r.branch) || '-').slice(0, 200), tarih: date(r.recordDate || d.date), personel: person ? nameOf(person) : '-', gorev: safe(person?.job || person?.gorev || person?.unvan) || '-', egitim: safe(d.subject || r.title) || '-', konu: safe(r.title) || '-', aciklama: isMedical(r) ? 'Sağlık kaydı - ayrıntılı sağlık bilgileri bu çıktıda yer almaz.' : safe(d.description || d.notes || r.description) || '-', ekipman: safe(d.equipmentName || d.name || context.equipment?.name || r.title) || '-', yil: safe(d.year || (r.recordDate || '').slice(0, 4)), muhatap: safe(d.addressee || context.settings?.documentAddressee) || 'İLGİLİ MAKAMA' };
    }
    function substitute(text, values) {
fdIsgAssert();

        const unknown = new Set();
        const result = safe(text).replace(/\{\{\s*([a-zA-ZÇĞİÖŞÜçğıöşü_]+)\s*\}\}/g, (_, key) => {
if(!fdIsgValid())return;
 if (!(key in values)) { unknown.add(key); return ''; } return safe(values[key]); });
        if (unknown.size) throw new Error('Şablonda bilinmeyen alan var: ' + Array.from(unknown).join(', '));
        return result;
    }
    function configured(template, settings) {
fdIsgAssert();

        const all = settings?.templates || settings?.documentTemplates || settings?.isgDocumentTemplates || {};
        const custom = Array.isArray(all) ? all.find(item => item.id === template.id) : all[template.id];
        if (custom?.enabled === false) throw new Error('Bu belge şablonu ayarlardan kapatılmış.');
        return { ...template, name: safe(custom?.title || custom?.name || template.name).slice(0, 150), body: custom?.body == null ? template.body : safe(custom.body).slice(0, 20000), footer: safe(custom?.footer).slice(0, 2000), version: safe(custom?.version || template.version).slice(0, 30) };
    }
    function selectedPeople(context) {
fdIsgAssert();

        const supplied = context.personIds || context.record?.personIds || [], ids = new Set(supplied.map(safe));
        return (context.people || []).filter(person => ids.has(idOf(person))).map(person => ({ id: idOf(person), name: nameOf(person), branch: branchOf(person.branch || person.sube || person.subeAdi), job: jobOf(person) }));
    }
    function canCertificate(context, person) {
fdIsgAssert();

        const r = context.record || {}, d = r.data || {}, attendee = (d.attendance || []).find(item => safe(item.personId) === person.id);
        return r.type === 'training' && ['completed', 'approved', 'closed'].includes(r.status) && d.trainingVerified === true && safe(d.trainerQualification).trim().length > 0 && attendee?.attended === true && attendee?.passed === true && attendee?.approved === true;
    }
    function textBlock(title, text) {
fdIsgAssert();
 return { kind: 'text', title, text: safe(text) }; }
    function table(title, columns, rows, options = {}) {
fdIsgAssert();
 return { kind: 'table', title, columns: columns.map((label, index) => ({ label, width: options.widths?.[index] || 1 })), rows: rows.map(row => row.map(safe)), minHeight: options.minHeight || 9 }; }
    function metadata(values, extra = []) {
fdIsgAssert();
 return table('Kayıt Bilgileri', ['Alan', 'Bilgi'], [['İşyeri / şube', `${values.firma} / ${values.sube}`], ['Konu / tarih', `${values.konu} / ${values.tarih}`], ...extra], { widths: [1, 3] }); }
    function signature(names = ['Düzenleyen', 'İşveren / Yetkili Onay', 'İlgili Personel']) {
fdIsgAssert();
 return table('İmza ve Onay', names, [names.map(() => 'Ad Soyad:\n\nTarih:\n\nİmza:')], { minHeight: 30 }); }
    function valueFor(context, key) {
fdIsgAssert();

        const r = context.record || {}, d = r.data || {}, records = context.records || [], related = records.find(item => safe(item.id) === safe(d.relatedRecordId)), equipment = context.equipment || records.find(item => safe(item.id) === safe(r.equipmentId)), provider = records.find(item => safe(item.id) === safe(d.providerId));
        const join = (...parts) => parts.filter(part => part != null && String(part).trim()).join(' / ');
        const aliases = { finding: d.findings || (r.type === 'risk' ? join(d.hazard, d.consequence) : related ? join(related.data?.hazard, related.data?.consequence, related.data?.findings) : d.description), measure: d.measures || d.actionText || (r.type === 'task' ? d.description : ''), responsibleName: context.ownerName || (context.users || []).find(item => safe(item.id) === safe(r.ownerId))?.name, completedAction: d.completionEvidence, reviewResult: d.verificationNote, completedDate: r.completedAt ? safe(r.completedAt).slice(0, 10) : '', equipmentName: equipment?.title || (r.type === 'equipment' ? r.title : ''), serialNo: equipment?.data?.serialNo, scope: d.controlKind || d.kind, providerName: provider?.data?.providerName || provider?.title || d.controller || d.lab, locationTime: join(d.eventTime, d.location), involvedNames: selectedPeople(context).map(p => p.name).join(', '), initialMeasures: d.immediateMeasures, followUp: d.correctiveAction, timeRange: r.type === 'visit' ? (d.hours == null ? '' : `${d.hours} saat`) : r.type === 'drill' ? join(d.startTime, d.minutes == null ? '' : `${d.minutes} dakika`) : '', meetingPoint: d.location, observations: d.findings, method: { classroom: 'Yüz yüze', practice: 'Uygulamalı', distance: 'Uzaktan', mixed: 'Karma' }[d.method] || d.method };
        return d[key] != null && d[key] !== '' && key !== 'method' ? d[key] : aliases[key];
    }
    function details(context, fields) {
fdIsgAssert();
 return fields.map(([label, key]) => [label, safe(valueFor(context, key)) || '-']); }
    function buildModel(templateId, context = {}) {
fdIsgAssert();

        if (context.permissions?.read === false) throw new Error('İSG kayıtlarını görüntüleme yetkiniz yok.');
        const found = catalog.find(item => item.id === templateId); if (!found) throw new Error('Belge şablonu bulunamadı.');
        if (!found.types.includes('*') && !found.types.includes(context.record?.type)) throw new Error('Bu kayıt türü için belge kullanılamıyor.');
        const t = configured(found, context.settings), r = context.record || {}, d = r.data || {}, people = selectedPeople(context);
        if ((t.roster || t.individual) && !people.length) throw new Error('Belge için en az bir kayıtlı personel seçin.');
        if (t.certificate && people.some(person => !canCertificate(context, person))) throw new Error('Katılım belgesi için eğitim tamamlanmış ve doğrulanmış; seçili personelin katılım, başarı ve onayı kayıtlı olmalı.');
        const selectedIds = new Set(people.map(person => person.id));
        if ((context.personIds || r.personIds || []).some(id => !(context.people || []).some(person => idOf(person) === safe(id)))) throw new Error('Seçili personellerden biri kayıtlı personel listesinde bulunamadı.');
        const units = t.individual ? people.map(person => [person]) : [people];
        const documents = units.map(unit => {
if(!fdIsgValid())return;

            const p = t.individual ? unit[0] : null, v = contextValues(context, p), status = labels[r.status] || safe(r.status) || '-';
            // The certificate header already identifies the workplace, training and date.
            // Do not repeat those long values in a second table and strand its signatures.
            const blocks = t.certificate ? [table('Katılımcı Bilgileri', ['Alan', 'Bilgi'], [['Ad soyad', p.name], ['Görev', p.job || '-'], ['Durum', status]], { widths: [1, 3] })] : [metadata(v, [['Durum', status], ...(p ? [['Personel / görev', `${p.name} / ${p.job || '-'}`]] : [])])];
            const body = context.bodyOverride == null ? t.body : safe(context.bodyOverride).slice(0, 20000); if (body) blocks.push(textBlock('', substitute(body, v)));
            if (['trainingAttendance', 'trainingMinutes', 'trainingCertificate', 'trainingAssessment'].includes(t.id)) {
                const fields = [['Eğitim konusu', 'subject'], ['Eğitmen / unvan', 'trainer'], ['Eğitmen yeterliliği', 'trainerQualification'], ['Süre (saat)', 'hours'], ['Yöntem / yer', 'method'], ['Eğitim yeri', 'location']];
                if (!t.certificate || valueFor(context, 'timeRange')) fields.push(['Başlangıç / bitiş', 'timeRange']);
                blocks.push(table('Eğitim Bilgileri', ['Alan', 'Bilgi'], details(context, fields), { widths: [1, 3] }));
            }
            if (t.id === 'trainingAttendance' || t.id === 'drillAttendance') blocks.push(table('Katılımcılar - imzalar fiilen alınır', ['#', 'Ad Soyad', 'Görev', 'Katılım / giriş imzası', 'Çıkış imzası'], unit.map((person, index) => [index + 1, person.name, person.job || '-', '', '']), { widths: [.35, 2, 1.3, 1.25, 1.25], minHeight: 14 }));
            if (t.id === 'trainingMinutes') blocks.push(textBlock('Kapsam, uygulama ve değerlendirme', safe(d.topics || d.description || d.notes) || '........................................................................................................\n........................................................................................................'));
            if (t.id === 'trainingAssessment') {
                const questions = Array.isArray(d.assessmentQuestions) ? d.assessmentQuestions : [];
                blocks.push(table('Değerlendirme', ['#', 'Soru / uygulama', 'Cevap / gözlem', 'Puan'], (questions.length ? questions : Array.from({ length: 5 }, () => '')).map((question, index) => [index + 1, typeof question === 'object' ? question.text || '' : question, '', '']), { widths: [.4, 2.4, 2, .5], minHeight: 18 }));
                blocks.push(textBlock('Sonuç', 'Toplam puan: ....................   Değerlendiren: ........................................\nBaşarı / katılım onayı sistemde ayrıca kaydedilir.'));
            }
            if (t.id === 'trainingCertificate') blocks.push(textBlock('Doğrulanmış katılım', `${p.name}, ${v.tarih} tarihli ${v.egitim} eğitimine ilişkin kayıtlı katılım ve değerlendirme koşullarını sağlamıştır. Bu belge yalnızca belirtilen eğitime ait kurum içi katılım kaydıdır; mesleki yeterlilik / operatör yetkisi vermez.`));
            if (t.id === 'ppeDelivery') {
                const suppliedItems = Array.isArray(context.ppeItems) ? context.ppeItems : Array.isArray(d.ppeItems) ? d.ppeItems : [], items = suppliedItems.filter(item => !item.personId || safe(item.personId) === p.id);
                blocks.push(table('Teslim Edilen KKD', ['Donanım / standart', 'Miktar', 'Ölçü / beden', 'Teslim tarihi', 'Açıklama'], (items.length ? items : [{}]).map(item => [item.name || item.item || item.equipment || '', item.quantity ?? '', item.size || '', item.date ? date(item.date) : '', item.note || '']), { widths: [2, .7, 1, 1.1, 1.5], minHeight: 14 }));
                if (Array.isArray(context.ppeItems) && items.length) blocks.push(textBlock('Kaynak', 'Seçilmiş mevcut KKD teslim kayıtlarından hazırlanmıştır. Bu çıktı yeni bir teslim kaydı veya imza oluşturmaz.'));
                blocks.push(textBlock('Teslim ve bilgilendirme', 'Kullanım, bakım ve muhafaza bilgileri: ...................................................................\nTeslim alanın açıklaması: ........................................................................................'));
            }
            if (t.id === 'medicalReferral') blocks.push(textBlock('Sevk Bilgileri', `Sevk edilen birim: ${safe(d.referralUnit) || '........................................................'}\nİş / maruziyet bilgisi: ${safe(d.exposure) || '........................................................'}\nBu formda teşhis, muayene bulgusu veya ayrıntılı sağlık verisi bulunmaz.`));
            if (t.id === 'emergencyAssignment') blocks.push(table('Görevlendirme ve Tebliğ', ['Ad Soyad', 'Ekip / görev', 'Görev başlangıcı', 'Tebellüğ imzası'], unit.map(person => [person.name, teamLabels[d.role] || safe(d.role) || '-', date(d.startDate || r.recordDate), '']), { widths: [2, 1.5, 1.2, 1.5], minHeight: 16 }));
            if (t.id === 'drillMinutes') blocks.push(table('Tatbikat Değerlendirmesi', ['Alan', 'Kayıt'], details(context, [['Senaryo / amaç', 'scenario'], ['Başlangıç / süre', 'timeRange'], ['Tatbikat yeri', 'meetingPoint'], ['Koordinatör', 'coordinator'], ['Gözlemler', 'observations'], ['Tespit / iyileştirme', 'improvements']]), { widths: [1, 3] }));
            if (['nonconformity', 'correctiveAction'].includes(t.id)) blocks.push(table('Tespit ve Faaliyet', ['Alan', 'Kayıt'], [...details(context, [['Tespit / risk', 'finding'], ['Alınacak önlem', 'measure'], ['Sorumlu', 'responsibleName'], ['Gerçekleştirilen işlem', 'completedAction'], ['Kontrol / kapanış sonucu', 'reviewResult']]), ['Hedef tarih', date(r.dueDate)], ['Kapanış tarihi', date(valueFor(context, 'completedDate'))]], { widths: [1, 3] }));
            if (t.id === 'incident') blocks.push(table('Olay Kaydı', ['Alan', 'Kayıt'], [['Olay türü', d.kind === 'nearMiss' ? 'Ramak kala' : 'İş kazası / olay'], ...details(context, [['Saat / yer', 'locationTime'], ['Olayın açıklaması', 'description'], ['İlgili kişiler', 'involvedNames'], ['Tanıklar / beyanlar', 'witnesses'], ['İlk alınan önlemler', 'initialMeasures'], ['Kök neden / inceleme', 'rootCause'], ['Takip faaliyetleri', 'followUp']]), ['Resmi bildirim takip durumu', safe(d.sgkStatus) || '-'], ['Bildirim referansı / tarihi', `${safe(d.sgkReference) || '-'} / ${date(d.sgkNotificationDate)}`]], { widths: [1, 3] }));
            if (t.id === 'inspectionRequest') blocks.push(table('Talep Kapsamı', ['Alan', 'Bilgi'], details(context, [['Ekipman / tesisat', 'equipmentName'], ['Envanter / seri no', 'serialNo'], ['Kontrol / ölçüm kapsamı', 'scope'], ['Yetkili kişi / kuruluş', 'providerName'], ['Talep notu', 'notes']]), { widths: [1, 3] }));
            if (t.id === 'providerVisit') blocks.push(table('Ziyaret Kaydı', ['Alan', 'Kayıt'], details(context, [['Uzman / kuruluş', 'providerName'], ['Ziyaret süresi', 'timeRange'], ['Ele alınan konular', 'topics'], ['Tespit ve öneriler', 'recommendations'], ['Takip edilecek işler', 'followUp']]), { widths: [1, 3] }));
            if (['annualWorkPlan', 'annualTrainingPlan'].includes(t.id)) {
                const tasks = Array.isArray(d.items) ? d.items : Array.isArray(d.planItems) ? d.planItems : [];
                blocks.push(table('Planlanan Çalışmalar', ['Konu / faaliyet', 'Hedef tarih', 'Sorumlu / eğitmen', 'Katılımcılar / kapsam', 'Durum'], (tasks.length ? tasks : [{}]).map(item => [item.title || item.subject || '', date(item.date || item.dueDate), item.owner || item.trainer || '', item.scope || item.participants || '', labels[item.status] || safe(item.status)]), { widths: [1.9, 1.1, 1.5, 1.6, 1], minHeight: 14 }));
            }
            if (t.id === 'recordSummary') blocks.push(textBlock('Açıklama / takip', isMedical(r) ? 'Sağlık kaydı - ayrıntılı sağlık bilgileri bu çıktıda yer almaz.' : safe(d.description || d.notes || r.description) || '-'));
            blocks.push(signature(t.id === 'petition' ? ['Başvuran / İmza'] : t.id === 'medicalReferral' ? ['Sevk Eden / Yetkili'] : ['Düzenleyen', 'İşveren / Yetkili Onay', ...(p ? ['İlgili Personel'] : [])]));
            if (t.footer) blocks.push(textBlock('', substitute(t.footer, v)));
            return { title: t.name, subtitle: `${v.firma} - ${v.sube}`, reference: `${v.konu.slice(0, 240)} / ${v.tarih}`, person: p?.name || '', blocks };
        });
        const generatedAt = context.generatedAt || now();
        const snapshot = { schemaVersion: VERSION, templateId: t.id, templateVersion: t.version, sourceId: safe(r.id), sourceRevision: Number(r.revision) || 0, recordType: safe(r.type), branch: branchOf(context.branch || r.branch), selectedPersonIds: Array.from(selectedIds), sourceKkdIds: templateId === 'ppeDelivery' ? (context.ppeItems || []).filter(item => !item.personId || selectedIds.has(safe(item.personId))).map(item => safe(item.id)).filter(Boolean) : [], generatedAt, state: 'draft', documents: clone(documents) };
        return { schemaVersion: VERSION, templateId: t.id, templateVersion: t.version, title: t.name, generatedAt, sourceId: snapshot.sourceId, sourceRevision: snapshot.sourceRevision, state: 'draft', documents, snapshot };
    }
    function approximateMeasure(text, pt, bold) {
fdIsgAssert();
 return Array.from(safe(text)).reduce((sum, char) => sum + (/\s/.test(char) ? .28 : /[ilIıİ.,:;'!|]/.test(char) ? .3 : /[MWĞÖÜ@%]/.test(char) ? .8 : .54), 0) * pt * 25.4 / 72 * (bold ? 1.04 : 1); }
    function browserMeasure() {
fdIsgAssert();
 const canvas = root.document?.createElement('canvas'), ctx = canvas?.getContext('2d'); return ctx ? (text, pt, bold) => {
if(!fdIsgValid())return;
 ctx.font = `${bold ? 'bold ' : ''}${pt * 96 / 72}px Arial`; return ctx.measureText(safe(text)).width * 25.4 / 96; } : approximateMeasure; }
    function wrap(text, width, measure, size = 10, bold = false) {
fdIsgAssert();

        if (!(width > 0)) throw new Error('Belge alanı genişliği geçersiz.');
        const lines = [];
        safe(text).split('\n').forEach(paragraph => {
if(!fdIsgValid())return;

            if (!paragraph) { lines.push(''); return; }
            let current = '';
            paragraph.split(/\s+/).forEach(word => {
if(!fdIsgValid())return;

                const test = current ? `${current} ${word}` : word;
                if (measure(test, size, bold) <= width) { current = test; return; }
                if (current) { lines.push(current); current = ''; }
                if (measure(word, size, bold) <= width) { current = word; return; }
                for (const char of Array.from(word)) { if (current && measure(current + char, size, bold) > width) { lines.push(current); current = ''; } current += char; }
            });
            lines.push(current);
        }); return lines;
    }
    function plan(model, measure = approximateMeasure) {
fdIsgAssert();

        const pages = [], width = 182, left = 14, bottom = 278, line = 4.6, padding = 2.4, font = 10;
        model.documents.forEach((document, documentIndex) => {
if(!fdIsgValid())return;

            let page, y;
            const headerTitles = wrap(document.title, 145, measure, 15, true), headerSubtitles = wrap(document.subtitle, 182, measure, 8.5), headerReferences = wrap(document.reference || '', 182, measure, 8), subtitleY = 17 + headerTitles.length * 6 + 3, referenceY = subtitleY + headerSubtitles.length * 3.9 + 1, headerBottom = Math.max(40, referenceY + headerReferences.length * 3.7 + 4), bodyTop = headerBottom + 4;
            const fresh = () => {
if(!fdIsgValid())return;
 page = { documentIndex, title: document.title, subtitle: document.subtitle, person: document.person, headerTitles, headerSubtitles, headerReferences, subtitleY, referenceY, headerBottom, commands: [] }; pages.push(page); y = bodyTop; };
            const ensure = height => {
if(!fdIsgValid())return;
 if (y + height > bottom) fresh(); };
            const heading = title => {
if(!fdIsgValid())return;
 if (!title) return; ensure(12); page.commands.push({ kind: 'heading', x: left, y, text: title, height: 8 }); y += 9; };
            fresh();
            document.blocks.forEach(block => {
if(!fdIsgValid())return;

                if (block.kind === 'text') {
                    const lines = wrap(block.text, width, measure, font);
                    ensure((block.title ? 9 : 0) + Math.min(2, lines.length) * line + 2); heading(block.title);
                    lines.forEach(text => {
if(!fdIsgValid())return;
 ensure(line); page.commands.push({ kind: 'line', x: left, y, text, size: font, height: line }); y += line; }); y += 4; return;
                }
                const total = block.columns.reduce((sum, col) => sum + col.width, 0), widths = block.columns.map(col => width * col.width / total);
                const heads = block.columns.map((col, index) => wrap(col.label, widths[index] - padding * 2, measure, 9, true));
                const headHeight = Math.max(...heads.map(lines => lines.length)) * 4.2 + padding * 2;
                const firstHeight = block.rows.length ? Math.max(block.minHeight, Math.min(22, Math.max(...block.rows[0].map((cell, index) => wrap(cell, widths[index] - padding * 2, measure, font).length)) * line + padding * 2)) : 0;
                ensure((block.title ? 9 : 0) + headHeight + firstHeight); heading(block.title);
                const drawHead = continued => {
if(!fdIsgValid())return;
 if (continued && block.title) heading(block.title + ' (devam)'); page.commands.push({ kind: 'row', x: left, y, widths, cells: heads, height: headHeight, header: true, font: 9, lineHeight: 4.2, padding }); y += headHeight; };
                drawHead(false);
                block.rows.forEach((row, rowIndex) => {
if(!fdIsgValid())return;

                    const cells = row.map((value, index) => wrap(value, widths[index] - padding * 2, measure, font)), count = Math.max(...cells.map(lines => lines.length)), minHeight = block.minHeight;
                    let offset = 0;
                    while (offset < count) {
                        const available = bottom - y, remaining = count - offset, desired = Math.max(minHeight, remaining * line + padding * 2);
                        if (desired > available && desired <= bottom - bodyTop - headHeight - (block.title ? 9 : 0)) { fresh(); drawHead(true); continue; }
                        const capacity = Math.floor((bottom - y - padding * 2) / line);
                        if (capacity < 1 || (Math.max(minHeight, line + padding * 2) > bottom - y)) { fresh(); drawHead(true); continue; }
                        const take = Math.min(remaining, capacity), height = Math.max(minHeight, take * line + padding * 2);
                        page.commands.push({ kind: 'row', x: left, y, widths, cells: cells.map(lines => lines.slice(offset, offset + take)), height, header: false, font, lineHeight: line, padding, rowIndex, continuation: offset > 0 }); y += height; offset += take;
                        if (offset < count) { fresh(); drawHead(true); }
                    }
                }); y += 5;
            });
        });
        pages.forEach((page, index) => {
if(!fdIsgValid())return;
 page.number = index + 1; page.total = pages.length; });
        return { pageWidth: 210, pageHeight: 297, left, width, bottom, pages, sourceId: model.sourceId, sourceRevision: model.sourceRevision, generatedAt: model.generatedAt, templateVersion: model.templateVersion, digest: model.digest || '' };
    }
    function drawPage(layout, index, scale = 8.5) {
fdIsgAssert();

        if (!root.document) throw new Error('PDF çizim bileşeni yüklenemedi.');
        const page = layout.pages[index], canvas = root.document.createElement('canvas'); canvas.width = Math.round(210 * scale); canvas.height = Math.round(297 * scale);
        const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('PDF çizim alanı oluşturulamadı.');
        ctx.scale(scale, scale); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 210, 297);
        function text(value, x, y, size = 10, bold = false, color = '#203447') {
fdIsgAssert();
 ctx.font = `${bold ? 'bold ' : ''}${size * 25.4 / 72}px Arial`; ctx.fillStyle = color; ctx.textBaseline = 'top'; ctx.fillText(safe(value), x, y); }
        text('İŞ SAĞLIĞI VE GÜVENLİĞİ', 14, 11, 8, true, '#087b80');
        page.headerTitles.forEach((title, line) => text(title, 14, 17 + line * 6, 15, true));
        text('İMZA İÇİN TASLAK', 158, 12, 8, true, '#6f7180');
        page.headerSubtitles.forEach((value, line) => text(value, 14, page.subtitleY + line * 3.9, 8.5, false, '#64748b'));
        page.headerReferences.forEach((value, line) => text(value, 14, page.referenceY + line * 3.7, 8, false, '#64748b'));
        ctx.strokeStyle = '#b6cad4'; ctx.lineWidth = .3; ctx.beginPath(); ctx.moveTo(14, page.headerBottom); ctx.lineTo(196, page.headerBottom); ctx.stroke();
        page.commands.forEach(command => {
if(!fdIsgValid())return;

            if (command.kind === 'heading') { ctx.fillStyle = '#edf4f7'; ctx.fillRect(command.x, command.y, layout.width, command.height - 1); text(command.text, command.x + 2.3, command.y + 1.5, 10, true); return; }
            if (command.kind === 'line') { text(command.text, command.x, command.y, command.size); return; }
            let x = command.x;
            command.widths.forEach((width, column) => {
if(!fdIsgValid())return;

                ctx.fillStyle = command.header ? '#e4edf2' : '#ffffff'; ctx.fillRect(x, command.y, width, command.height);
                ctx.strokeStyle = '#b9cad3'; ctx.lineWidth = .2; ctx.strokeRect(x, command.y, width, command.height);
                (command.cells[column] || []).forEach((value, line) => text(value, x + command.padding, command.y + command.padding + line * command.lineHeight, command.font, command.header)); x += width;
            });
        });
        ctx.strokeStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(14, 282); ctx.lineTo(196, 282); ctx.stroke();
        text(`Kayıt: ${safe(layout.sourceId).slice(0, 28) || '-'} / rev. ${layout.sourceRevision} - Şablon v${safe(layout.templateVersion)}`, 14, 284, 7, false, '#64748b');
        text(`${page.number} / ${page.total}`, 183, 284, 8, true, '#64748b');
        text(`Oluşturma: ${layout.generatedAt} - Belge izi: ${safe(layout.digest).slice(0, 16) || '-'}`, 14, 289, 7, false, '#64748b');
        return canvas;
    }
    function canonical(value) {
fdIsgAssert();
 if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']'; if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}'; return JSON.stringify(value); }
    async function digest(snapshot) {
try{
fdIsgAssert();

        if (!root.crypto?.subtle || typeof TextEncoder === 'undefined') throw new Error('Belge doğrulama bileşeni kullanılamıyor. Güvenli bağlantıdan tekrar deneyin.');
        const bytes = await fdIsgAwait(root.crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(snapshot)))); return Array.from(new Uint8Array(bytes)).map(value => value.toString(16).padStart(2, '0')).join('');
    
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
}
    async function buildPdf(templateId, context = {}, options = {}) {
try{
fdIsgAssert();

        const epoch = generationEpoch; const assertSession = () => {
if(!fdIsgValid())return;
 if (epoch !== generationEpoch) throw new Error('Oturum değiştiği için belge hazırlama iptal edildi.'); };
        const model = buildModel(templateId, context); model.digest = await fdIsgAwait(digest(model.snapshot)); assertSession();
        const JsPDF = root.jspdf?.jsPDF || root.jsPDF; if (!JsPDF) throw new Error('PDF bileşeni yüklenemedi. Sayfayı yenileyin.');
        await fdIsgAwait(root.document?.fonts?.ready); assertSession();
        const layout = plan(model, browserMeasure()), pdf = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
        for (let index = 0; index < layout.pages.length; index++) { assertSession(); if (index) pdf.addPage('a4', 'portrait'); const canvas = drawPage(layout, index); pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297, undefined, 'FAST'); canvas.width = canvas.height = 1; options.onProgress?.({ completed: index + 1, total: layout.pages.length }); await fdIsgAwait(new Promise(resolve => setTimeout(resolve, 0))); }
        pdf.setProperties({ title: model.title, subject: `ISG source ${model.sourceId} rev ${model.sourceRevision}; SHA-256 ${model.digest}`, creator: 'FD Yazılım - ISG', author: contextValues(context).firma });
        const blob = pdf.output('blob'), filename = `${model.title}_${safe(context.record?.recordDate || '').replace(/[^0-9-]/g, '') || 'Taslak'}.pdf`.replace(/[\\/:*?"<>|]/g, '_');
        assertSession();
        if (options.preview !== false) { if (typeof root.fdCiktiPdfOnizle !== 'function') throw new Error('PDF önizleme penceresi bulunamadı.'); root.fdCiktiPdfOnizle(blob, filename); }
        const result = { blob, filename, model, layout, snapshot: { ...model.snapshot, digest: model.digest } };
        if (typeof options.onGenerated === 'function') await fdIsgAwait(options.onGenerated(result.snapshot));
        assertSession();
        return result;
    
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
}
    function open(context = {}) {
fdIsgAssert();

        if (!root.document) throw new Error('Belge penceresi kullanılamıyor.');
        if (context.permissions?.read === false) throw new Error('İSG belgelerini görüntüleme yetkiniz yok.');
        const available = list(context).filter(t => {
if(!fdIsgValid())return;
 try { return configured(t, context.settings).enabled !== false; } catch (_) {
if(!fdIsgValid())return;
 return false; } });
        if (!available.length) throw new Error('Kullanılabilir belge şablonu yok.');
        const existing = root.document.querySelector('[data-isg-document-dialog]'); if (existing?._fdIsgBusy) return existing; existing?._fdIsgCleanup?.(); existing?.remove();
        const epoch = generationEpoch;
        const doc = root.document, backdrop = doc.createElement('div'); backdrop.dataset.isgDocumentDialog = ''; backdrop.dataset.casePreserve = 'true'; backdrop.style.cssText = 'position:fixed;inset:0;z-index:210520;background:#0f172a66;display:flex;align-items:center;justify-content:center;padding:12px';
        const panel = doc.createElement('section'); panel.role = 'dialog'; panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'İSG belgesi hazırla'); panel.style.cssText = 'width:min(760px,100%);max-height:92dvh;display:flex;flex-direction:column;background:white;border-radius:15px;box-shadow:0 18px 70px #0f172a40;overflow:hidden;font:14px Arial,sans-serif;color:#203447';
        const header = doc.createElement('div'); header.style.cssText = 'padding:17px 20px;border-bottom:1px solid #dce7ef;display:flex;align-items:center;justify-content:space-between;flex-shrink:0';
        const title = doc.createElement('strong'); title.textContent = 'İSG Belgesi Hazırla'; title.style.fontSize = '18px';
        const close = doc.createElement('button'); close.type = 'button'; close.textContent = 'Kapat'; close.style.cssText = 'padding:7px 10px;border:1px solid #cbd5e1;background:#f8fafc;border-radius:7px;cursor:pointer'; header.append(title, close);
        const content = doc.createElement('div'); content.style.cssText = 'min-height:0;overflow:auto;overscroll-behavior:contain;padding:18px 20px;display:grid;gap:14px';
        const selectLabel = doc.createElement('label'); selectLabel.textContent = 'Belge türü'; selectLabel.style.cssText = 'display:grid;gap:6px;font-weight:600';
        const select = doc.createElement('select'); select.style.cssText = 'width:100%;padding:11px;border:1px solid #cbd5e1;border-radius:8px;background:white;font:14px Arial'; available.forEach(t => {
if(!fdIsgValid())return;
 const option = doc.createElement('option'); option.value = t.id; option.textContent = t.name; select.append(option); }); selectLabel.append(select);
        const personArea = doc.createElement('fieldset'); personArea.style.cssText = 'margin:0;border:1px solid #dce7ef;border-radius:9px;padding:12px;display:grid;gap:7px'; const legend = doc.createElement('legend'); legend.textContent = 'Belgeye dahil edilecek personeller'; personArea.append(legend);
        const allowedIds = new Set((context.personIds || context.record?.personIds || []).map(safe)), selectedBranch = branchOf(context.branch || context.record?.branch); const people = (context.people || []).filter(person => allowedIds.size ? allowedIds.has(idOf(person)) : !selectedBranch || branchOf(person.branch || person.sube || person.subeAdi) === selectedBranch); const checks = [];
        const selectionTools = doc.createElement('div'); selectionTools.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap'; const all = doc.createElement('button'), clear = doc.createElement('button'); all.type = clear.type = 'button'; all.textContent = 'Tümünü seç'; clear.textContent = 'Seçimi temizle'; [all, clear].forEach(item => item.style.cssText = 'padding:6px 9px;border:1px solid #cbd5e1;border-radius:6px;background:#f8fafc;cursor:pointer'); all.onclick = () => checks.forEach(check => check.checked = true); clear.onclick = () => checks.forEach(check => check.checked = false); selectionTools.append(all, clear); personArea.append(selectionTools);
        people.forEach(person => {
if(!fdIsgValid())return;
 const label = doc.createElement('label'); label.style.cssText = 'display:flex;align-items:center;gap:9px;min-height:31px'; const checkbox = doc.createElement('input'); checkbox.type = 'checkbox'; checkbox.value = idOf(person); checkbox.checked = allowedIds.has(idOf(person)); const text = doc.createElement('span'); text.textContent = nameOf(person) + (jobOf(person) ? ' - ' + jobOf(person) : ''); checks.push(checkbox); label.append(checkbox, text); personArea.append(label); });
        const editLabel = doc.createElement('label'); editLabel.textContent = 'Belge metni'; editLabel.style.cssText = 'display:grid;gap:7px;font-weight:600'; const textarea = doc.createElement('textarea'); textarea.rows = 7; textarea.maxLength = 20000; textarea.style.cssText = 'padding:11px;border:1px solid #cbd5e1;border-radius:8px;font:14px/1.5 Arial;resize:vertical'; editLabel.append(textarea);
        const help = doc.createElement('p'); help.style.cssText = 'margin:0;color:#64748b;font:12px/1.5 Arial'; help.textContent = 'İmzalar boş bırakılır. İmzalı belgeyi daha sonra ilgili kayda yükleyebilirsiniz.';
        const error = doc.createElement('p'); error.role = 'alert'; error.style.cssText = 'display:none;margin:0;padding:9px;border:1px solid #fecaca;background:#fff1f2;border-radius:7px;color:#b91c1c';
        content.append(selectLabel, personArea, editLabel, help, error);
        const footer = doc.createElement('div'); footer.style.cssText = 'padding:14px 20px;border-top:1px solid #dce7ef;display:flex;justify-content:flex-end;gap:9px;background:#f8fafc;flex-shrink:0';
        const button = doc.createElement('button'); button.type = 'button'; button.dataset.fdOutputOwn = '1'; button.textContent = 'PDF Hazırla / Yazdır'; button.style.cssText = 'border:0;border-radius:8px;background:#087b80;color:white;padding:11px 18px;font:bold 14px Arial;cursor:pointer'; footer.append(button); panel.append(header, content, footer); backdrop.append(panel); fdIsgAppend(backdrop);
        const focused = doc.activeElement; let busy = false;
        function remove(force = false) { if (busy && force !== true) return; backdrop.remove(); doc.removeEventListener('keydown', onKey, true); focused?.focus?.(); }
        backdrop._fdIsgCleanup = remove;
        function onKey(event) {
fdIsgAssert();
 if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); remove(); } if (event.key === 'Tab') { event.stopPropagation(); const elements = Array.from(panel.querySelectorAll('button,input,select,textarea')).filter(element => !element.disabled && element.offsetParent !== null), first = elements[0], last = elements[elements.length - 1]; if (event.shiftKey && doc.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && doc.activeElement === last) { event.preventDefault(); first?.focus(); } } }
        function update() {
fdIsgAssert();
 const template = configured(available.find(t => t.id === select.value), context.settings); textarea.value = template.body || ''; editLabel.hidden = !template.body; personArea.hidden = !template.roster && !template.individual; error.style.display = 'none'; }
        fdIsgListen(button,'click', async () => {
try{
if(!fdIsgValid())return;

            if (busy) return; busy = true; backdrop._fdIsgBusy = true; const controls = Array.from(panel.querySelectorAll('button,input,select,textarea')).map(control => [control, control.disabled]); controls.forEach(([control]) => control.disabled = true); error.style.display = 'none'; button.textContent = 'PDF hazırlanıyor...';
            try { const template = available.find(t => t.id === select.value), ids = template.roster || template.individual ? checks.filter(check => check.checked).map(check => check.value) : []; const result = await fdIsgAwait(buildPdf(select.value, { ...context, personIds: ids, bodyOverride: textarea.value }, { onGenerated: context.onGenerated, onProgress: status => button.textContent = `PDF hazırlanıyor ${status.completed}/${status.total}` })); if (epoch !== generationEpoch || !backdrop.isConnected) return; await fdIsgAwait(context.onComplete?.(result)); if (epoch !== generationEpoch || !backdrop.isConnected) return; busy = false; remove(); }
            catch (e) {
if(!fdIsgValid())return;
 if (epoch === generationEpoch && backdrop.isConnected) { error.textContent = e.message || 'Belge hazırlanamadı.'; error.style.display = 'block'; } }
            finally {
if(fdIsgValid()){
 busy = false; backdrop._fdIsgBusy = false; controls.forEach(([control, disabled]) => control.disabled = disabled); button.textContent = 'PDF Hazırla / Yazdır'; 
}
}
        
}catch(fdIsgError){if(!fdIsgValid())return;throw fdIsgError;}
});
        fdIsgListen(close,'click', remove); fdIsgListen(backdrop,'click', event => {
if(!fdIsgValid())return;
 if (event.target === backdrop) remove(); }); fdIsgListen(select,'change', update); fdIsgListen(doc,'keydown', onKey, true); update(); select.focus(); return backdrop;
    }
    function clear() { generationEpoch++; root.document?.querySelector('[data-isg-document-dialog]')?._fdIsgCleanup?.(true); }
    root.fdIsgDocuments = { version: VERSION, catalog, list, buildModel, buildPdf, open, clear, plan, wrap, browserMeasure, drawPage, canonical, digest, canCertificate };
})(fdIsgRoot);


const api={fdIsgSettingsMount(host){fdIsgAssert('settings');return fdIsgExports.fdIsgWorkspace.mountSettings(host)},fdIsgSettingsUnmount(){return fdIsgExports.fdIsgWorkspace.unmountSettings()},fdIsgReset(){return fdIsgExports.fdIsgWorkspace.reset()},fdIsgDocumentClear(){return fdIsgExports.fdIsgDocuments.clear()},fdIsgState(){if(!fdIsgValid())return;return structuredClone(fdIsgExports.fdIsgWorkspace.state)},fdIsgSchemas(){if(!fdIsgValid())return;return structuredClone(fdIsgExports.fdIsgWorkspace.schemas)},fdIsgCatalog(){if(!fdIsgValid())return;return structuredClone(fdIsgExports.fdIsgDocuments.catalog)},fdIsgWork_refresh(...args){fdIsgAssert('workspace',false);return fdIsgExports.fdIsgWorkspace.refresh(...args)},fdIsgWork_edit(...args){fdIsgAssert('workspace',true);return fdIsgExports.fdIsgWorkspace.edit(...args)},fdIsgWork_detail(...args){fdIsgAssert('workspace',false);return fdIsgExports.fdIsgWorkspace.detail(...args)},fdIsgWork_getExportModels(...args){fdIsgAssert('workspace',false);return fdIsgExports.fdIsgWorkspace.getExportModels(...args)},fdIsgWork_validateRecord(...args){fdIsgAssert('workspace',false);return fdIsgExports.fdIsgWorkspace.validateRecord(...args)},fdIsgWork_documentStatus(...args){fdIsgAssert('workspace',false);return fdIsgExports.fdIsgWorkspace.documentStatus(...args)},fdIsgWork_filtered(...args){fdIsgAssert('workspace',false);return fdIsgExports.fdIsgWorkspace.filtered(...args)},fdIsgWork_personName(...args){fdIsgAssert('workspace',false);return fdIsgExports.fdIsgWorkspace.personName(...args)},fdIsgWork_personBranch(...args){fdIsgAssert('workspace',false);return fdIsgExports.fdIsgWorkspace.personBranch(...args)},fdIsgWork_personId(...args){fdIsgAssert('workspace',false);return fdIsgExports.fdIsgWorkspace.personId(...args)},fdIsgWork_close(...args){fdIsgAssert('workspace',false);return fdIsgExports.fdIsgWorkspace.close(...args)},fdIsgDoc_list(...args){fdIsgAssert('workspace');return fdIsgExports.fdIsgDocuments.list(...args)},fdIsgDoc_buildModel(...args){fdIsgAssert('workspace');return fdIsgExports.fdIsgDocuments.buildModel(...args)},fdIsgDoc_buildPdf(...args){fdIsgAssert('workspace');return fdIsgExports.fdIsgDocuments.buildPdf(...args)},fdIsgDoc_open(...args){fdIsgAssert('workspace');return fdIsgExports.fdIsgDocuments.open(...args)},fdIsgDoc_plan(...args){fdIsgAssert('workspace');return fdIsgExports.fdIsgDocuments.plan(...args)},fdIsgDoc_wrap(...args){fdIsgAssert('workspace');return fdIsgExports.fdIsgDocuments.wrap(...args)},fdIsgDoc_browserMeasure(...args){fdIsgAssert('workspace');return fdIsgExports.fdIsgDocuments.browserMeasure(...args)},fdIsgDoc_drawPage(...args){fdIsgAssert('workspace');return fdIsgExports.fdIsgDocuments.drawPage(...args)},fdIsgDoc_canonical(...args){fdIsgAssert('workspace');return fdIsgExports.fdIsgDocuments.canonical(...args)},fdIsgDoc_digest(...args){fdIsgAssert('workspace');return fdIsgExports.fdIsgDocuments.digest(...args)},fdIsgDoc_canCertificate(...args){fdIsgAssert('workspace');return fdIsgExports.fdIsgDocuments.canCertificate(...args)}};
return{
 init(){if(fdIsgPriorOutput)window.fdUnifiedOutput.open=fdIsgTrackOutput},
 open(action){if(action?.fdIsgAction==="settings"){fdIsgAssert("settings");return api.fdIsgSettingsMount(action.host)}fdIsgAssert("workspace");return fdIsgExports.openIsgApp()},
 api,
 dispose(){fdIsgDisposed=true;fdIsgCancel();fdIsgExports.fdIsgWorkspace.reset();fdIsgExports.fdIsgDocuments.clear();for(const[t,...args]of fdIsgListeners)t.removeEventListener(...args);for(const id of fdIsgTimers)window.clearTimeout(id);for(const popup of fdIsgPopups)try{popup.close?.()}catch(_){}for(const node of fdIsgNodes)fdIsgClean(node);if(window.fdUnifiedOutput?.open===fdIsgTrackOutput)window.fdUnifiedOutput.open=fdIsgPriorOutput;const tab=typeof fdAcikUygulamaSekmeleri!=="undefined"?fdAcikUygulamaSekmeleri.find(t=>t.anahtar==="isg"):null;if(tab)tab.alanId="";}
};
});
