
(function(){
    const FONKSIYON='push-notification';
    const WHATSAPP_FONKSIYON='whatsapp-notification';
    const WHATSAPP_SISTEM_ALT_BILGISI='Bu mesaj Kanal Mermer bilgilendirme sisteminden gönderilmiştir.';
    const BEKLEYEN_BILDIRIM_ANAHTARI='fd_pending_push_notification';
    const bildirimKuyrugu=[];
    let aktifBildirim=null,okunmamisKontrolEdiliyor=false,sonOkunmamisKontrolu=0;
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    function destekleniyor(){return 'Notification' in window&&'serviceWorker' in navigator&&'PushManager' in window}
    function mobilUygulamaOrtami(){return location.hostname==='kanalmermer.github.io'||window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
    function hataMesaji(error,varsayilan='İşlem tamamlanamadı.'){
        let mesaj=error?.message||varsayilan;
        try{const govde=error?.context?.body;if(govde&&typeof govde==='object')mesaj=govde.message||mesaj}catch(_){}
        return mesaj;
    }
    async function cagir(body){
        if(!SUPABASE_MODE||!supabaseClient)throw new Error('Bildirim sistemi için güvenli oturum gerekli.');
        const{data:oturumVerisi,error:oturumHatasi}=await supabaseClient.auth.getSession();if(oturumHatasi)throw oturumHatasi;
        const token=oturumVerisi?.session?.access_token;if(!token)throw new Error('Oturum süresi dolmuş. Çıkış yapıp yeniden giriş yapın.');
        const response=await fetch(SUPABASE_URL+'/functions/v1/'+FONKSIYON,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token,'apikey':SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify(body)});
        let data={};try{data=await response.json()}catch(_){throw new Error('Bildirim sunucusundan geçerli yanıt alınamadı. ('+response.status+')')}
        if(!response.ok||!data?.success)throw new Error(data?.message||('Bildirim sunucusu hatası: '+response.status));return data;
    }
    async function whatsappCagir(body,fdScope){
        if(typeof fdScope==='function'&&!fdScope())throw Error('WhatsApp ekranı oturumu değişti.');
        if(!SUPABASE_MODE||!supabaseClient)throw new Error('WhatsApp gönderimi için güvenli oturum gerekli.');
        const{data:oturumVerisi,error:oturumHatasi}=await supabaseClient.auth.getSession();if(oturumHatasi)throw oturumHatasi;if(typeof fdScope==='function'&&!fdScope())throw Error('WhatsApp ekranı oturumu değişti.');
        const token=oturumVerisi?.session?.access_token;if(!token)throw new Error('Oturum süresi dolmuş. Çıkış yapıp yeniden giriş yapın.');
        const response=await fetch(SUPABASE_URL+'/functions/v1/'+WHATSAPP_FONKSIYON,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token,'apikey':SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify(body)});
        let data={};if(typeof fdScope==='function'&&!fdScope())throw Error('WhatsApp ekranı oturumu değişti.');try{data=await response.json();if(typeof fdScope==='function'&&!fdScope())throw Error('WhatsApp ekranı oturumu değişti.');}catch(_){throw new Error('WhatsApp sunucusundan geçerli yanıt alınamadı. ('+response.status+')')}
        if(!response.ok||!data?.success)throw new Error(data?.message||('WhatsApp sunucusu hatası: '+response.status));return data;
    }
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    function fdWhatsappRozetiniGuncelle(adet){const rozet=document.getElementById('fdWhatsappGelenRozeti'),sayi=Math.max(0,Number(adet)||0);if(!rozet)return;rozet.textContent=sayi>99?'99+':String(sayi);rozet.style.display=sayi?'inline-flex':'none'}
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    async function fdWhatsappGelenSayaciniYenile(){if(!isManagerUser())return;try{const sonuc=await whatsappCagir({action:'config'});fdWhatsappRozetiniGuncelle(sonuc.inboxUnreadCount)}catch(error){console.warn('WhatsApp gelen kutusu sayacı alınamadı:',error)}}
    /* Private WhatsApp workspace moved to modules/bildirim. */
    function base64UrlDizisi(deger){
        const dolgu='='.repeat((4-deger.length%4)%4),base64=(deger+dolgu).replace(/-/g,'+').replace(/_/g,'/'),ham=atob(base64),sonuc=new Uint8Array(ham.length);
        for(let i=0;i<ham.length;i++)sonuc[i]=ham.charCodeAt(i);return sonuc;
    }
    function bildirimiBeklet(baslik,mesaj,notificationId){try{sessionStorage.setItem(BEKLEYEN_BILDIRIM_ANAHTARI,JSON.stringify({baslik:String(baslik||'Bildirim'),mesaj:String(mesaj||'Yeni bir bildiriminiz var.'),notificationId:String(notificationId||'')}))}catch(_){}}
    function bildirimKuyrugunaEkle(bildirim){
        const item={baslik:String(bildirim?.baslik||bildirim?.title||'Bildirim'),mesaj:String(bildirim?.mesaj||bildirim?.message||'Yeni bir bildiriminiz var.'),notificationId:String(bildirim?.notificationId||bildirim?.id||'')};
        if(!item.mesaj)return;
        if(item.notificationId&&((aktifBildirim&&aktifBildirim.notificationId===item.notificationId)||bildirimKuyrugu.some(row=>row.notificationId===item.notificationId)))return;
        bildirimKuyrugu.push(item);siradakiBildirimiGoster();
    }
    function siradakiBildirimiGoster(){
        if(!activeUser||aktifBildirim||!bildirimKuyrugu.length)return;
        const modal=document.getElementById('modalGelenBildirim');if(!modal)return;
        aktifBildirim=bildirimKuyrugu.shift();
        document.getElementById('fdGelenBildirimBaslik').textContent=aktifBildirim.baslik;
        document.getElementById('fdGelenBildirimMesaj').textContent=aktifBildirim.mesaj;
        const durum=document.getElementById('fdGelenBildirimDurum'),dugme=document.getElementById('fdGelenBildirimOnayBtn');
        if(durum){durum.style.display='none';durum.textContent=''}if(dugme){dugme.disabled=false;dugme.textContent='Okudum, Devam Et'}
        modal.style.display='flex';
    }
    window.fdGelenBildirimiGoster=function(baslik,mesaj,notificationId){
        if(!activeUser){bildirimiBeklet(baslik,mesaj,notificationId);return}
        bildirimKuyrugunaEkle({baslik,mesaj,notificationId});try{sessionStorage.removeItem(BEKLEYEN_BILDIRIM_ANAHTARI)}catch(_){}
    };
    window.fdGelenBildirimiOnayla=async function(){
        if(!aktifBildirim)return;
        const dugme=document.getElementById('fdGelenBildirimOnayBtn'),durum=document.getElementById('fdGelenBildirimDurum');
        if(dugme){dugme.disabled=true;dugme.textContent='Onay kaydediliyor...'}if(durum)durum.style.display='none';
        try{
            if(aktifBildirim.notificationId)await cagir({action:'mark-read',notificationId:aktifBildirim.notificationId});
            aktifBildirim=null;document.getElementById('modalGelenBildirim').style.display='none';siradakiBildirimiGoster();
            if(!aktifBildirim&&!bildirimKuyrugu.length)setTimeout(()=>okunmamisBildirimleriYukle(true),250);
        }catch(error){
            if(durum){durum.textContent=hataMesaji(error,'Okundu onayı kaydedilemedi. İnternet bağlantısını kontrol edip tekrar deneyin.');durum.style.display='block'}
            if(dugme){dugme.disabled=false;dugme.textContent='Tekrar Dene'}
        }
    };
    async function okunmamisBildirimleriYukle(zorla=false){
        if(!activeUser||okunmamisKontrolEdiliyor)return;
        const simdi=Date.now();if(!zorla&&simdi-sonOkunmamisKontrolu<10000)return;
        okunmamisKontrolEdiliyor=true;sonOkunmamisKontrolu=simdi;
        try{const sonuc=await cagir({action:'unread',limit:50});(Array.isArray(sonuc.notifications)?sonuc.notifications:[]).forEach(bildirimKuyrugunaEkle)}
        catch(error){console.warn('Okunmamış bildirimler alınamadı:',error)}finally{okunmamisKontrolEdiliyor=false}
    }
    window.fdBekleyenBildirimiGoster=function(){
        if(!activeUser)return;let bildirim=null;try{bildirim=JSON.parse(sessionStorage.getItem(BEKLEYEN_BILDIRIM_ANAHTARI)||'null')}catch(_){}
        if(bildirim?.mesaj)fdGelenBildirimiGoster(bildirim.baslik,bildirim.mesaj,bildirim.notificationId);
        okunmamisBildirimleriYukle(true);
    };
    function urlBildirimiKontrolEt(){
        const params=new URLSearchParams(location.search),mesaj=params.get('fdPushMessage');if(!mesaj)return;
        const baslik=params.get('fdPushTitle')||'FD YAZILIM',notificationId=params.get('fdPushId')||'';bildirimiBeklet(baslik,mesaj,notificationId);params.delete('fdPushTitle');params.delete('fdPushMessage');params.delete('fdPushId');const yeni=location.pathname+(params.toString()?'?'+params.toString():'')+location.hash;history.replaceState(null,'',yeni);fdBekleyenBildirimiGoster();
    }
    if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',event=>{if(['FD_PUSH_NOTIFICATION_OPEN','FD_PUSH_NOTIFICATION_RECEIVED'].includes(event.data?.type))fdGelenBildirimiGoster(event.data.title,event.data.body,event.data.notificationId)});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')okunmamisBildirimleriYukle()});
    window.addEventListener('focus',()=>okunmamisBildirimleriYukle());
    async function aboneligiKaydet(registration,config){
        let subscription=await registration.pushManager.getSubscription();
        if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:base64UrlDizisi(config.publicKey)});
        await cagir({action:'subscribe',subscription:subscription.toJSON(),userAgent:navigator.userAgent});
        return subscription;
    }
    function izinDugmesiniGuncelle(){
        const dugme=document.getElementById('fdBildirimIzinBtn');if(!dugme)return;
        const acik=destekleniyor()&&Notification.permission==='granted';
        const goster=Boolean(activeUser)&&destekleniyor()&&mobilUygulamaOrtami()&&!acik;dugme.style.display=goster?'inline-flex':'none';
        if(!goster)return;
        dugme.classList.remove('enabled');dugme.textContent='🔔 Bildirimleri Aç';
    }
    function izinHatirlatmaAnahtari(){return 'fd_push_prompt_seen_'+String(activeUser?.supabaseUserId||activeUser?.tcNo||'user')}
    function ilkIzinPenceresiniGoster(){
        if(!activeUser||!destekleniyor()||!mobilUygulamaOrtami()||Notification.permission!=='default'||localStorage.getItem(izinHatirlatmaAnahtari())==='1')return;
        const modal=document.getElementById('modalBildirimIzni');if(modal&&modal.style.display!=='flex')modal.style.display='flex';
    }
    window.fdBildirimIzniniErtele=function(){localStorage.setItem(izinHatirlatmaAnahtari(),'1');modalKapat('modalBildirimIzni')};
    window.fdBildirimIzniniOnayla=function(){modalKapat('modalBildirimIzni');fdBildirimleriAc()};
    window.fdBildirimleriAc=async function(){
        if(!mobilUygulamaOrtami())return showToast('Bildirimleri telefona yüklediğiniz uygulama içinden açın.','warning');
        if(!destekleniyor())return showToast('Bu cihaz bildirim özelliğini desteklemiyor.','warning');
        try{
            if(Notification.permission==='denied')throw new Error('Bildirim izni engellenmiş. Telefonun site/uygulama ayarlarından bildirime izin verin.');
            const izin=Notification.permission==='granted'?'granted':await Notification.requestPermission();
            if(izin!=='granted')throw new Error('Bildirim izni verilmedi.');
            showGlobalOverlay?.('Bildirimler açılıyor','Bu telefon hesabınıza bağlanıyor...');
            const config=await cagir({action:'config'}),registration=await navigator.serviceWorker.ready;
            await aboneligiKaydet(registration,config);izinDugmesiniGuncelle();showToast('Bildirimler bu telefonda açıldı.','success');
        }catch(error){showToast(hataMesaji(error,'Bildirimler açılamadı.'),'error')}finally{hideGlobalOverlay?.()}
    };
    async function sessizEsitle(){
        izinDugmesiniGuncelle();
        if(activeUser&&destekleniyor()&&mobilUygulamaOrtami()&&Notification.permission==='default'){setTimeout(ilkIzinPenceresiniGoster,350);return}
        if(!activeUser||!destekleniyor()||!mobilUygulamaOrtami()||Notification.permission!=='granted')return;
        try{const registration=await navigator.serviceWorker.ready,config=await cagir({action:'config'});await aboneligiKaydet(registration,config);izinDugmesiniGuncelle()}catch(error){console.warn('Bildirim aboneliği yenilenemedi:',error)}
    }
    window.fdPersonelOtomatikBildirimGonder=async function(personelId,baslik,mesaj,ayrilanPersonel=false,messageCategory='manual'){
        const hedef=String(personelId||'').trim();
        if(!hedef)throw new Error('Bildirim gönderilecek personel bulunamadı.');
        const personel=(Array.isArray(personeller)?personeller:[]).find(p=>String(p.id)===hedef&&aktifSirketeAit(p));
        if(window.fdPersonelWhatsappTercihleri?.allowed(personel,messageCategory)===false)return {success:true,atlandi:true,skippedByPreference:1};
        return whatsappCagir({action:'send',title:String(baslik||'Bilgilendirme'),message:String(mesaj||''),targetMode:'selection',targetEmployeeIds:[hedef],allowInactiveTargets:Boolean(ayrilanPersonel),messageCategory});
    };
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    function fdBildirimTarihi(deger){try{return new Date(deger).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}catch(_){return '-'}}
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    /* Private WhatsApp workspace moved to modules/bildirim. */
    const eskiShowHub=window.showHub;
    if(typeof eskiShowHub==='function')window.showHub=function(){const sonuc=eskiShowHub.apply(this,arguments);setTimeout(()=>{sessizEsitle();fdBekleyenBildirimiGoster();fdWhatsappGelenSayaciniYenile()},500);return sonuc};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{izinDugmesiniGuncelle();urlBildirimiKontrolEt()});else{izinDugmesiniGuncelle();urlBildirimiKontrolEt()}
    if(typeof fdSekmeSisteminiKur==='function')fdSekmeSisteminiKur();
window.fdWhatsappWorkspaceServices=Object.freeze({call:whatsappCagir,error:hataMesaji,badge:fdWhatsappRozetiniGuncelle,date:fdBildirimTarihi,footer:WHATSAPP_SISTEM_ALT_BILGISI});
})();

