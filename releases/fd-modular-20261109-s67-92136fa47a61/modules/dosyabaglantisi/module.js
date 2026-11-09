window.FDModules.define('dosyabaglantisi',function(){
 'use strict';
 const host=window,jobs=new Set();let disposed=false;
 async function execute(request){
  if(disposed||!request?.current())return null;
  jobs.add(request);const native=request.native,readers=new Set(),controllers=new Set(),timers=new Map(),databases=new Set();let overlay=null,uygulamaAyarlari={...request.settings};
  const alive=()=>!disposed&&request.current(),check=()=>{if(!alive())throw Error('Dosya bağlantısı ekranı veya oturumu değişti.');};
  const ownOverlay=()=>overlay&&overlay.node===host.document.getElementById('globalOverlay')&&overlay.title===host.document.getElementById('overlayTitle')?.textContent&&overlay.sub===host.document.getElementById('overlaySub')?.textContent;
  const rememberOverlay=()=>{overlay={node:host.document.getElementById('globalOverlay'),title:host.document.getElementById('overlayTitle')?.textContent,sub:host.document.getElementById('overlaySub')?.textContent};};
  const hideGlobalOverlay=()=>{if(ownOverlay())native.hide();overlay=null;};
  request.onCancel=()=>{hideGlobalOverlay();for(const r of readers)try{r.abort();}catch(_){}readers.clear();for(const c of controllers)c.abort();controllers.clear();for(const db of databases)try{db.close();}catch(_){}databases.clear();for(const [id,done]of timers){host.clearTimeout(id);done();}timers.clear();};
  const showGlobalOverlay=(...a)=>{check();native.show(...a);rememberOverlay();},globalOverlayIlerleme=(...a)=>{check();native.progress(...a);if(overlay)rememberOverlay();};
  const magicpassDosyaDurumuYaz=(...a)=>{if(alive())return native.status(...a);},showToast=(...a)=>{if(alive())return native.toast(...a);},alert=(...a)=>{if(alive())return native.alert(...a);};
  const aktifSirketId=()=>{check();return request.company;},isManagerUser=()=>{check();return request.manager;},activeUser=request.user,sirketler=request.companies,VARSAYILAN_UYGULAMA_AYARLARI=request.defaults,SUPABASE_MODE=request.supabase,GOOGLE_SCRIPT_URL=request.googleUrl;
  const guarded=fn=>async function(...args){check();const result=await fn.apply(this,args);check();return result;};
  const chain=query=>new Proxy(query,{get(target,key){if(key==='then')return(resolve,reject)=>Promise.resolve().then(()=>{check();return target;}).then(value=>{check();return value;}).then(resolve,reject);const value=Reflect.get(target,key,target);return typeof value==='function'?(...a)=>{check();const next=value.apply(target,a);return next&&typeof next==='object'?chain(next):next;}:value;}});
  const supabaseClient={from(...a){check();return chain(request.client.from(...a));}};
  const navigator={storage:host.navigator?.storage&&{persist:host.navigator.storage.persist&&guarded(()=>host.navigator.storage.persist())}};
  const FileReader=function(){check();const reader=new native.FileReader();readers.add(reader);reader.addEventListener('loadend',()=>readers.delete(reader));reader.addEventListener('abort',()=>reader.onerror?.());return reader;};
  const fetch=async(url,options)=>{check();const controller=new host.AbortController();controllers.add(controller);try{const response=await native.fetch.call(host,url,{...options,signal:controller.signal});check();return new Proxy(response,{get(target,key){if(key==='json')return guarded(()=>target.json());const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}});}finally{controllers.delete(controller);}};
  const setTimeout=(done,delay)=>{const id=host.setTimeout(()=>{timers.delete(id);done();},delay);timers.set(id,done);return id;};
  const magicpassDosyasiniIsle=guarded(async(...a)=>{const result=await native.import.apply(host,a);if(!result)throw Error('Giriş–çıkış aktarımı tamamlanmadı; kaynak TXT korunuyor.');return result;});
  const magicpassDosyaVeritabaniAc=async()=>{check();const db=await host.magicpassDosyaVeritabaniAc();if(!alive()){db.close();check();}databases.add(db);return new Proxy(db,{get(target,key){const value=Reflect.get(target,key,target);if(key==='close')return()=>{databases.delete(db);return target.close();};return typeof value==='function'?(...a)=>{check();return value.apply(target,a);}:value;}});};
  const handles=new WeakMap(),wrapped=new WeakMap();
  function wrapHandle(handle,permission){
   if(!handle||typeof handle!=='object')return handle;if(wrapped.has(handle))return wrapped.get(handle);
   const proxy=new Proxy(handle,{get(target,key){const value=Reflect.get(target,key,target);if(typeof value!=='function')return value;
    if(request.action==='import'&&(key==='queryPermission'||key==='requestPermission'))return guarded(()=>permission);
    if(key==='createWritable')return async(...a)=>{check();const stream=await value.apply(target,a);if(!alive()){try{await stream.abort();}catch(_){}check();}return new Proxy(stream,{get(s,k){const method=Reflect.get(s,k,s);if(typeof method!=='function')return method;if(k==='abort')return method.bind(s);return guarded((...args)=>method.apply(s,args));}});};
    return guarded((...a)=>value.apply(target,a));
   }});wrapped.set(handle,proxy);handles.set(proxy,handle);return proxy;
  }
  const window=host.showOpenFilePicker?{showOpenFilePicker:guarded(async()=>{const picked=await request.picker;return picked?.map(wrapHandle);})}:{};
async function magicpassDosyaHandleGetir() {
        const db = await magicpassDosyaVeritabaniAc();
        return new Promise((resolve,reject) => {
            const istek = db.transaction('dosyalar','readonly').objectStore('dosyalar').get('magicpass_' + aktifSirketId());
            istek.onsuccess = () => { db.close(); resolve(istek.result || null); };
            istek.onerror = () => { db.close(); reject(istek.error); };
        });
    }
async function magicpassDosyaHandleKaydet(handle) {
        const db = await magicpassDosyaVeritabaniAc();
        return new Promise((resolve,reject) => {
            const istek = db.transaction('dosyalar','readwrite').objectStore('dosyalar').put(handle,'magicpass_' + aktifSirketId());
            istek.onsuccess = () => { db.close(); resolve(); };
            istek.onerror = () => { db.close(); reject(istek.error); };
        });
    }
async function magicpassDosyaAdiniSirketAyarinaKaydet(dosyaAdi) {
        uygulamaAyarlari={...uygulamaAyarlari,magicpassDosyaAdi:String(dosyaAdi||''),magicpassDosyaGuncelleme:new Date().toISOString()};
        if(!SUPABASE_MODE||!isManagerUser())return;
        const {data:sirket,error:okumaHatasi}=await supabaseClient.from('companies').select('data').eq('id',aktifSirketId()).maybeSingle();if(okumaHatasi)throw okumaHatasi;
        const yeniAyarlar={...(sirket?.data?.uygulamaAyarlari||{}),...uygulamaAyarlari,magicpassDosyaAdi:String(dosyaAdi||''),magicpassDosyaGuncelleme:new Date().toISOString()};
        const {error}=await supabaseClient.from('companies').update({data:{...(sirket?.data||{}),uygulamaAyarlari:yeniAyarlar}}).eq('id',aktifSirketId());if(error)throw error;
        uygulamaAyarlari={...VARSAYILAN_UYGULAMA_AYARLARI,...yeniAyarlar};
    }
async function magicpassDosyaDurumunuGuncelle() {
        try {
            const handle = await magicpassDosyaHandleGetir();
            if (!handle) {
                const bilinen=String(uygulamaAyarlari.magicpassDosyaAdi||'');
                return magicpassDosyaDurumuYaz(bilinen?('Şirkette kayıtlı dosya: '+bilinen+' · dosyaya erişim verin'):'Henüz sabit dosya seçilmedi.','#b45309');
            }
            const izin = typeof handle.queryPermission==='function'?await handle.queryPermission({ mode:'read' }):'granted';
            magicpassDosyaDurumuYaz('Sabit dosya: ' + handle.name + (izin === 'granted' ? ' · Giriş–Çıkış Aktar düğmesiyle okumaya hazır' : ' · bu oturumda erişim izni gerekli'), izin === 'granted' ? '#047857' : '#b45309');
        } catch(error) {
            magicpassDosyaDurumuYaz('Dosya bağlantısı bu tarayıcıda kullanılamıyor; dosyayı yeniden seçin.','#b91c1c');
        }
    }
async function magicpassDosyaBaglantisiniAyarla() {
        if (!window.showOpenFilePicker) {
            return alert('Bu tarayıcı sabit dosya bağlantısını desteklemiyor. Uygulamayı güncel Chrome veya Edge ile açın.');
        }
        try {
            const secim = await window.showOpenFilePicker({ id:'fd-magicpass-txt', startIn:'documents', multiple:false, types:[{ description:'MagicPass TXT/CSV', accept:{ 'text/plain':['.txt','.csv'] } }] });
            const handle = secim?.[0];
            if (!handle) return;
            try{await navigator.storage?.persist?.();}catch(_){}
            await magicpassDosyaHandleKaydet(handle);
            const dogrulanan=await magicpassDosyaHandleGetir();if(!dogrulanan||dogrulanan.name!==handle.name)throw new Error('Dosya bağlantısı tarayıcıya kalıcı olarak kaydedilemedi.');
            let izin=typeof dogrulanan.queryPermission==='function'?await dogrulanan.queryPermission({mode:'readwrite'}):'granted';if(izin!=='granted'&&typeof dogrulanan.requestPermission==='function')izin=await dogrulanan.requestPermission({mode:'readwrite'});if(izin!=='granted')throw new Error('Dosya okuma izni verilmedi.');
            await dogrulanan.getFile();await magicpassDosyaAdiniSirketAyarinaKaydet(dogrulanan.name);
            magicpassDosyaDurumuYaz('Sabit dosya: ' + dogrulanan.name + ' · bağlantı doğrulandı; Giriş–Çıkış Aktar düğmesiyle okumaya hazır','#047857');
            showToast('TXT dosyası sabitlendi. Kayıtları almak için Giriş–Çıkış Aktar düğmesine basın.','success');
        } catch(error) {
            if (error?.name !== 'AbortError') {
                const hataMetni=String(error?.message||error||'');
                const korumaliKonum=error?.name==='SecurityError'||/system files|system folder|sistem dosya|korumalı|protected|sensitive/i.test(hataMetni);
                if(korumaliKonum){
                    magicpassDosyaDurumuYaz('TXT dosyasını ayrı bir aktarım klasörüne taşıyıp tekrar seçin.','#b45309');
                    alert('Tarayıcı bu dosyanın bulunduğu korumalı konuma kalıcı erişim veremiyor.\n\nMagicPass TXT dosyası için Belgeler içinde MagicPass Aktarım adlı ayrı bir klasör oluşturun, dosyayı oraya taşıyın ve yeniden seçin. Windows, Program Files veya Drive ana klasörünü kullanmayın.');
                }else{
                    alert('MagicPass dosyası sabitlenemedi: ' + hataMetni);
                }
            }
        }
    }
function magicpassDosyasiniBase64Yap(dosya){
        return new Promise((resolve,reject)=>{const okuyucu=new FileReader();okuyucu.onload=()=>resolve(String(okuyucu.result||'').split(',')[1]||'');okuyucu.onerror=()=>reject(okuyucu.error||new Error('TXT dosyası yedek için okunamadı.'));okuyucu.readAsDataURL(dosya);});
    }
async function magicpassTxtDriveaYedekle(dosya,aktarimSonucu){
        const base64=await magicpassDosyasiniBase64Yap(dosya);if(!base64)throw new Error('TXT yedek verisi hazırlanamadı.');
        const sirket=sirketler.find(s=>String(s.id)===String(aktifSirketId())),sirketAdi=String(sirket?.unvan||sirket?.ad||activeUser?.sirketAdi||'Şirket');
        const response=await fetch(GOOGLE_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({islem:'magicpassTxtYedekle',modul:'MAGICPASS TXT YEDEK',base64,kaynakDosyaAdi:dosya.name,sirketAdi,hareketSayisi:Number(aktarimSonucu?.kaydedilen||0)+Number(aktarimSonucu?.yenilenen||0)})});
        if(!response.ok)throw new Error('Drive TXT yedekleme servisi yanıt vermedi ('+response.status+').');
        const sonuc=await response.json();if(!sonuc?.basarili||!sonuc?.yedek?.id||Number(sonuc.yedek.boyut)!==Number(dosya.size))throw new Error(sonuc?.hata||'TXT yedeği Drive üzerinde doğrulanamadı.');
        return sonuc.yedek;
    }
async function magicpassSabitTxtDosyasiniTemizle(handle,okunanDosya){
        if(typeof handle.createWritable!=='function')throw new Error('Tarayıcı sabit TXT dosyasını temizlemeyi desteklemiyor.');
        const guncel=await handle.getFile();
        if(Number(guncel.size)!==Number(okunanDosya.size)||Number(guncel.lastModified)!==Number(okunanDosya.lastModified))throw new Error('TXT yedekleme sırasında değişti. Yeni hareketleri korumak için dosya temizlenmedi; tekrar aktarın.');
        const yazici=await handle.createWritable({keepExistingData:false});
        try{await yazici.write('');await yazici.close();}catch(error){try{await yazici.abort();}catch(_){}throw error;}
        const dogrulama=await handle.getFile();if(Number(dogrulama.size)!==0)throw new Error('TXT dosyası temizlendiği doğrulanamadı.');
    }
async function magicpassSabitDosyayiOtomatikOku(izinIste) {
        let yedek=null;
        try {
            const handle=await magicpassDosyaHandleGetir();
            if(!handle){magicpassDosyaDurumuYaz('Ayarlardan MagicPass TXT dosyasını bir kez sabitleyin.','#b45309');if(izinIste)showToast('Önce TXT dosyasını seçip sabitleyin.','warning');return;}
            const izinSecenegi={mode:'readwrite'};let izin=typeof handle.queryPermission==='function'?await handle.queryPermission(izinSecenegi):'granted';
            if(izin!=='granted'&&izinIste&&typeof handle.requestPermission==='function')izin=await handle.requestPermission(izinSecenegi);
            if(izin!=='granted'){magicpassDosyaDurumuYaz('Sabit dosya kayıtlı; aktarım ve temizleme için dosya izni verin.','#b45309');if(izinIste)showToast('TXT dosyasını okumak ve işlem sonunda temizlemek için izin vermeniz gerekiyor.','warning');return;}
            const dosya=await handle.getFile();if(!dosya.size)return showToast('Sabit TXT dosyası boş; aktarılacak hareket bulunmuyor.','warning');
            showGlobalOverlay('Giriş–çıkış aktarılıyor','Dosya okunuyor...');globalOverlayIlerleme(8,'Dosya okunuyor...');
            magicpassDosyaDurumuYaz('Aktarılıyor: '+handle.name,'#0369a1');globalOverlayIlerleme(18,'Kayıtlar okunuyor ve doğrulanıyor...');
            const aktarim=await magicpassDosyasiniIsle(dosya,true,true,false);globalOverlayIlerleme(62,'Kayıtlar kaydedildi, yedek hazırlanıyor...');
            yedek=await magicpassTxtDriveaYedekle(dosya,aktarim);globalOverlayIlerleme(88,'Yedek tamamlandı, kaynak dosya temizleniyor...');
            await magicpassSabitTxtDosyasiniTemizle(handle,dosya);globalOverlayIlerleme(100,'Aktarım tamamlandı.');await new Promise(resolve=>setTimeout(resolve,260));
            const aktarilanToplam=Number(aktarim.kaydedilen||0)+Number(aktarim.yenilenen||0),sonHareket=aktarim.son?new Date(aktarim.son).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'-';magicpassDosyaDurumuYaz('Son aktarım tamamlandı · '+aktarilanToplam+' hareket · Son hareket: '+sonHareket+' · TXT yedeklendi ve temizlendi','#047857');
            showToast(aktarilanToplam+' hareket işlendi. Okunan TXT belgesi yedeklendi. Otomatik personel bildirimleri saat 12.00’de güncel kayıtlara göre gönderilecek.','success');
            return{aktarim,yedek};
        } catch(error) {
            magicpassDosyaDurumuYaz('Aktarım tamamlanamadı: '+(error.message||error),'#b91c1c');
            showToast('Giriş–çıkış aktarımı tamamlanamadı: '+(error.message||error)+(yedek?' Drive yedeği oluşturuldu; kaynak TXT güvenlik için temizlenmedi.':''),'error');
            return null;
        } finally { hideGlobalOverlay(); }
    }
  // Keep every original function body intact; boundaries validate after each await.
  const originalGet=magicpassDosyaHandleGetir,originalPut=magicpassDosyaHandleKaydet,originalSettings=magicpassDosyaAdiniSirketAyarinaKaydet;
  magicpassDosyaHandleGetir=guarded(async()=>{if(request.action==='import'){const prepared=await request.prepared;return wrapHandle(prepared.handle,prepared.permission);}return wrapHandle(await originalGet());});
  magicpassDosyaHandleKaydet=guarded(handle=>originalPut(handles.get(handle)||handle));
  magicpassDosyaAdiniSirketAyarinaKaydet=guarded(async(...a)=>{await originalSettings(...a);check();request.commitSettings(uygulamaAyarlari);});
  magicpassDosyasiniBase64Yap=guarded(magicpassDosyasiniBase64Yap);
  magicpassTxtDriveaYedekle=guarded(magicpassTxtDriveaYedekle);
  magicpassSabitTxtDosyasiniTemizle=guarded(magicpassSabitTxtDosyasiniTemizle);
  try{
   if(request.action==='choose')return await magicpassDosyaBaglantisiniAyarla();
   if(request.action==='import')return await magicpassSabitDosyayiOtomatikOku(request.arg);
   if(request.action==='status')return await magicpassDosyaDurumunuGuncelle();
   return null;
  }catch(error){if(alive())throw error;return null;}finally{request.onCancel();jobs.delete(request);}
 }
 return{open:execute,dispose(){disposed=true;for(const request of jobs)request.cancel();jobs.clear();}};
});
