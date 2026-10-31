window.FDModules.define('bildirim',function(){

let fdWaDisposed=false,fdWaOverlay='';const fdWaTimers=new Set(),fdWaInitial=fdWaContext();
const fdWaShared=window.fdWhatsappWorkspaceServices,{error:hataMesaji,badge:fdWhatsappRozetiniGuncelle,date:fdBildirimTarihi,footer:WHATSAPP_SISTEM_ALT_BILGISI}=fdWaShared;
function fdWaContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('bildirim')])}
function fdWaValid(){return !fdWaDisposed&&fdWaInitial===fdWaContext()&&isManagerUser()&&anaMenuModulErisimiVar('bildirim')}
function fdWaAssert(write=false){if(!fdWaValid())throw Error('Oturum değişti; WhatsApp ekranını yeniden açın.');if(write&&!anaMenuModulYazmaYetkisiVar('bildirim'))throw Error('WhatsApp mesajlarında değişiklik yetkiniz yok.')}
async function fdWaAwait(p){fdWaAssert();const result=await p;fdWaAssert();return result}
function fdWaWriteAction(body){return ['send','resend-unread','resend-recipient','queue-pause','queue-resume','queue-cancel','queue-cancel-many','queue-cancel-price','schedule-update','schedule-create','schedule-cancel'].includes(body?.action)}
function whatsappCagir(body){fdWaAssert(fdWaWriteAction(body));return fdWaShared.call(body,fdWaValid)}
function fdWaPlan(body){fdWaAssert(fdWaWriteAction(body));return window.fdxPlanliBildirimApi(body,fdWaValid)}
function fdWaTimer(fn,ms,...a){const id=window.setTimeout(()=>{fdWaTimers.delete(id);if(fdWaValid())fn(...a)},ms);fdWaTimers.add(id);return id}
function fdWaClearTimer(id){fdWaTimers.delete(id);window.clearTimeout(id)}
function fdWaShowOverlay(...a){fdWaAssert();showGlobalOverlay?.(...a);fdWaOverlay=document.getElementById('globalOverlay')?.innerHTML||''}
function fdWaHideOverlay(){if(fdWaOverlay&&document.getElementById('globalOverlay')?.innerHTML===fdWaOverlay)hideGlobalOverlay?.();fdWaOverlay=''}
let fdWhatsappCalismaOturumuDegisti,fdWhatsappCalismaAlaniniSifirla,fdWhatsappGelenKutusuCiz,fdWhatsappKonusmaAc,fdWhatsappBasarisizMesajiTekrarGonder,fdWhatsappGelenKutusuYukle,fdWhatsappKisiyeMesajHazirla,fdWhatsappKuyrukSec,fdWhatsappKuyrukTumunuSec,fdWhatsappKuyrukDuzenle,fdWhatsappKuyrukYukle,fdWhatsappKuyrukDuraklat,fdWhatsappKuyrukSecilenleriSil,fdWhatsappKuyrukIptal,fdWhatsappSekmeAc,openWhatsappMesajlari,fdWhatsappMesajOnizle,fdWhatsappMesajFormunuTemizle,fdBildirimModuDegisti,fdBildirimPlanDuzenlemeAc,openBildirimModal,fdBildirimHedefleriniDoldur,fdBildirimPersonelleriniDoldur,fdBildirimSeciliPersonelIds,fdBildirimTumPersonelleriSec,fdBildirimHedefOzetiniGuncelle,fdWhatsappGidenPersonelleriniDoldur,fdBildirimGecmisiniYukle,fdBildirimOkumayanlaraTekrarGonder,fdBildirimGonder;
let fdWhatsappGelenMesajlar=[],fdWhatsappGidenOzetleri=[],fdWhatsappAktifGonderen='',fdWhatsappGelenYukleniyor=false,fdWhatsappKonusmalarYuklendi=false;
let fdWhatsappCalismaOturumu='',fdWhatsappCalismaYuklemeSurumu=0,fdWhatsappCalismaAcilisSurumu=0,fdWhatsappGelenYuklemeSurumu=0;
const fdWhatsappSohbetGidenleri=new Map(),fdWhatsappSohbetYuklenenler=new Set(),fdWhatsappSohbetIstekleri=new Map();
const fdBildirimSeciliIdler=new Set();let fdWaKuyrukSayfaBoyutu=50;
function fdWhatsappCalismaGecerli(oturum,surum){return fdWaValid()&&surum===fdWhatsappCalismaYuklemeSurumu&&oturum===fdWhatsappCalismaOturumu&&fdWhatsappKuyrukOturumuGecerli(oturum)&&anaMenuModulErisimiVar('bildirim')}
fdWhatsappCalismaOturumuDegisti=function(){
fdWaAssert(false);
return fdWhatsappCalismaOturumu!==fdWhatsappKuyrukOturumAnahtari()};
fdWhatsappCalismaAlaniniSifirla=function(){
fdWaAssert(false);

        fdWhatsappCalismaOturumu='';fdWhatsappCalismaYuklemeSurumu++;fdWhatsappCalismaAcilisSurumu++;fdWhatsappGelenYuklemeSurumu++;
        fdWhatsappGelenMesajlar=[];fdWhatsappGidenOzetleri=[];fdWhatsappAktifGonderen='';fdWhatsappGelenYukleniyor=false;fdWhatsappKonusmalarYuklendi=false;
        fdWhatsappSohbetGidenleri.clear();fdWhatsappSohbetYuklenenler.clear();fdWhatsappSohbetIstekleri.clear();fdBildirimSeciliIdler.clear();
        fdWhatsappKuyrukYuklemeSira++;fdWhatsappKuyrukOturum='';fdWhatsappKuyrukSirket='';fdWhatsappKuyrukHazir=false;fdWhatsappKuyrukIslemde=false;fdWhatsappKuyrukDuraklatildi=false;fdWhatsappKuyrukKayitlari=[];fdWhatsappKuyrukSecimleri.clear();fdWhatsappKuyrukMetaErisiminiSifirla();
        const alan=document.getElementById('whatsappMesajApp'),kabuk=document.getElementById('modalBildirimGonder');if(alan)alan.style.display='none';if(kabuk){delete kabuk.dataset.tab;kabuk.dataset.mode='instant'}
        alan?.querySelectorAll('input,textarea,select').forEach(kutu=>{if(kutu.tagName==='SELECT')kutu.selectedIndex=0;else if(kutu.type==='checkbox')kutu.checked=false;else kutu.value=''});
        const liste=document.getElementById('fdWhatsappKonusmalar'),sohbet=document.getElementById('fdWhatsappSohbet'),kuyruk=document.getElementById('fdWhatsappKuyrukListesi');
        if(liste)liste.replaceChildren();if(sohbet)sohbet.replaceChildren();if(kuyruk){kuyruk.replaceChildren();delete kuyruk.dataset.loaded;delete kuyruk.dataset.loading}document.getElementById('fdBildirimPersonelListesi')?.replaceChildren();const sayac=document.getElementById('fdBildirimCihazSayisi');if(sayac)sayac.textContent='Kontrol ediliyor...';
        document.getElementById('fdWhatsappKuyrukMetaUyarisi')?.remove();fdWhatsappRozetiniGuncelle(0);const rozet=document.getElementById('fdWhatsappKuyrukRozeti');if(rozet){rozet.textContent='0';rozet.style.display='none'}
        const dugme=document.getElementById('fdBildirimGonderBtn');if(dugme)dugme.disabled=false;fdBildirimModuDegisti('instant');fdWhatsappMesajOnizle();
    };
function fdWhatsappTelefonuYaz(deger){
fdWaAssert();
const rakam=String(deger||'').replace(/\D/g,'');if(rakam.startsWith('90')&&rakam.length===12)return '+90 '+rakam.slice(2,5)+' '+rakam.slice(5,8)+' '+rakam.slice(8,10)+' '+rakam.slice(10);return rakam?('+'+rakam):'-'}
function fdWhatsappMesajMetni(mesaj){
fdWaAssert();
const metin=String(mesaj?.message_text||'').trim();if(metin)return metin;const tur=String(mesaj?.message_type||'').toLowerCase();return({image:'Görsel gönderildi.',video:'Video gönderildi.',audio:'Sesli mesaj gönderildi.',document:mesaj?.media_filename?('Belge: '+mesaj.media_filename):'Belge gönderildi.',sticker:'Çıkartma gönderildi.',location:'Konum gönderildi.',contacts:'Kişi bilgisi gönderildi.',reaction:'Mesaja tepki verildi.'})[tur]||'Desteklenmeyen bir WhatsApp mesajı gönderildi.'}
function fdWhatsappMesajTuru(mesaj){
fdWaAssert();
const tur=String(mesaj?.message_type||'').toLowerCase();return({image:'Görsel',video:'Video',audio:'Sesli mesaj',document:'Belge',sticker:'Çıkartma',location:'Konum',contacts:'Kişi',reaction:'Tepki',interactive:'Seçim',button:'Düğme'})[tur]||''}
function fdWhatsappGonderenAdi(mesaj){
fdWaAssert();
return String(mesaj?.employee_name||mesaj?.sender_profile_name||fdWhatsappTelefonuYaz(mesaj?.sender_wa_id)||'Bilinmeyen kişi')}
function fdWhatsappKonusmaGruplari(){
fdWaAssert();

        const gruplar=new Map(),tumPersoneller=(Array.isArray(personeller)?personeller:[]).filter(p=>aktifSirketeAit(p));
        const telefonAnahtari=deger=>{let rakam=String(deger||'').replace(/\D/g,'');if(rakam.startsWith('00'))rakam=rakam.slice(2);if(rakam.length===11&&rakam.startsWith('0'))rakam='90'+rakam.slice(1);else if(rakam.length===10)rakam='90'+rakam;return rakam};
        const personelHaritasi=new Map(tumPersoneller.map(p=>[String(p.id),p])),telefonHaritasi=new Map();
        tumPersoneller.forEach(p=>{const telefon=telefonAnahtari(p.telefon||p.gsm||p.telefonNo||p.cepTelefonu);if(telefon)telefonHaritasi.set(telefon,p)});
        const grupAl=(employeeId,senderWaId,ad='')=>{const personel=personelHaritasi.get(String(employeeId||''))||telefonHaritasi.get(telefonAnahtari(senderWaId)),pid=String(personel?.id||employeeId||''),wa=telefonAnahtari(senderWaId||personel?.telefon||personel?.gsm||''),anahtar=pid?'p:'+pid:'w:'+wa;if(!anahtar||anahtar==='w:')return null;if(!gruplar.has(anahtar))gruplar.set(anahtar,{anahtar,employeeId:pid,senderWaId:wa,ad:String(personel?.ad||ad||fdWhatsappTelefonuYaz(wa)||'Bilinmeyen kişi'),messages:[],outgoingSummary:null});const grup=gruplar.get(anahtar);if(!grup.senderWaId&&wa)grup.senderWaId=wa;if(!grup.employeeId&&pid)grup.employeeId=pid;return grup};
        fdWhatsappGelenMesajlar.forEach(mesaj=>{const grup=grupAl(mesaj?.employee_legacy_id,mesaj?.sender_wa_id,fdWhatsappGonderenAdi(mesaj));if(grup)grup.messages.push(mesaj)});
        fdWhatsappGidenOzetleri.forEach(ozet=>{const grup=grupAl(ozet?.employee_legacy_id,ozet?.phone_e164,ozet?.employee_name);if(grup&&(!grup.outgoingSummary||new Date(ozet.sent_at||ozet.created_at||ozet.notification?.created_at||0)>new Date(grup.outgoingSummary.sent_at||grup.outgoingSummary.created_at||grup.outgoingSummary.notification?.created_at||0)))grup.outgoingSummary=ozet});
        return [...gruplar.values()].map(grup=>{grup.messages.sort((a,b)=>new Date(a.received_at||a.created_at||0)-new Date(b.received_at||b.created_at||0));const sonGelen=grup.messages[grup.messages.length-1]||null,sonGiden=grup.outgoingSummary||null,gelenZaman=new Date(sonGelen?.received_at||sonGelen?.created_at||0).getTime(),gidenZaman=new Date(sonGiden?.sent_at||sonGiden?.created_at||sonGiden?.notification?.created_at||0).getTime(),gidenMi=gidenZaman>gelenZaman,son=gidenMi?sonGiden:sonGelen;return{...grup,son,sonYon:gidenMi?'out':'in',sonZaman:gidenMi?(sonGiden?.sent_at||sonGiden?.created_at||sonGiden?.notification?.created_at):(sonGelen?.received_at||sonGelen?.created_at),sonMesaj:gidenMi?String(sonGiden?.sent_message_snapshot?.body||sonGiden?.notification?.message||'Gönderilen mesaj'):fdWhatsappMesajMetni(sonGelen),okunmamis:grup.messages.filter(m=>!m.read_at).length}}).sort((a,b)=>new Date(b.sonZaman||0)-new Date(a.sonZaman||0));
    }
function fdWhatsappGidenDurumu(alici){
fdWaAssert();

        if(alici?.status==='cancelled')return{sinif:'',metin:'İptal edildi'};
        if(alici?.queue_state==='processing')return{sinif:'',metin:'◷ Gönderiliyor'};
        if(alici?.status==='pending')return{sinif:'',metin:'◷ Kuyrukta bekliyor'+(alici.next_attempt_at?' · En erken '+fdBildirimTarihi(alici.next_attempt_at):'')};
        if(alici?.read_at||alici?.status==='read')return{sinif:'read',metin:'✓✓ Okundu'+(alici.read_at?' · '+fdBildirimTarihi(alici.read_at):'')};
        if(alici?.delivered_at||alici?.status==='delivered')return{sinif:'delivered',metin:'✓✓ Teslim edildi'+(alici.delivered_at?' · '+fdBildirimTarihi(alici.delivered_at):'')};
        if(alici?.status==='failed')return{sinif:'failed',metin:'⚠ Gönderilemedi'+(alici.error_message?' · '+fdWhatsappHataMetniDuzelt(alici.error_message):'')};
        if(alici?.sent_at||alici?.status==='sent')return{sinif:'',metin:'✓ Gönderildi · '+fdBildirimTarihi(alici.sent_at||alici.created_at)};
        return{sinif:'',metin:'◷ Gönderim bekliyor'};
    }
function fdWhatsappMetniBicimle(metin){
fdWaAssert();

        return escapeDashboardText(String(metin||'')).replace(/\*([^*\n]+)\*/g,'<strong>$1</strong>').replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s).,!?:;])/g,'$1<em>$2</em>');
    }
function fdWhatsappGidenIcerigi(bildirim,alici){
fdWaAssert();

        const kayit=alici?.sent_message_snapshot,tam=kayit?.version===1&&kayit.complete===true&&typeof kayit.body==='string',bilinen=kayit?.version===1&&typeof kayit.body==='string',bicim=fdWhatsappMetniBicimle;
        if(tam)return (kayit.header?'<strong class="fd-wa-bubble-title">'+bicim(kayit.header)+'</strong>':'')+'<p class="fd-wa-message-text">'+bicim(kayit.body)+'</p>'+(kayit.footer?'<span class="fd-wa-bubble-footer">'+bicim(kayit.footer)+'</span>':'');
        const hazir=alici?.status==='pending'?alici.prepared_message_snapshot:null;
        if(hazir?.complete===true&&typeof hazir.body==='string')return '<p class="fd-wa-message-text">'+bicim(hazir.body)+'</p><span class="fd-wa-bubble-footer" style="font-style:normal">Henüz gönderilmedi · Hazırlanan tam mesaj</span>';
        const bekliyor=alici?.status==='pending'||alici?.status==='cancelled',not=bekliyor?'Henüz gönderilmedi · Hazırlanan mesaj':bilinen?'Şablonun tam metni doğrulanamadı; kayıtlı mesaj içeriği gösteriliyor.':'Bu eski gönderimin tam WhatsApp metni kayıtlı değil; kayıtlı mesaj içeriği gösteriliyor.';
        return '<strong class="fd-wa-bubble-title">'+escapeDashboardText(bildirim?.title||'Bilgilendirme')+'</strong><p class="fd-wa-message-text">'+bicim(bilinen?kayit.body:bildirim?.message)+'</p><span class="fd-wa-bubble-footer" style="font-style:normal">'+escapeDashboardText(not)+'</span>';
    }
function fdWhatsappSohbetiCiz(grup){
fdWaAssert();

        const sohbet=document.getElementById('fdWhatsappSohbet');if(!sohbet)return;
        if(!grup){sohbet.innerHTML='<div class="fd-wa-empty"><div><span>👈</span>Görüntülemek için soldan bir konuşma seçin.</div></div>';return}
        const akıs=(grup.messages||[]).map(m=>({yon:'in',zaman:m.received_at||m.created_at,mesaj:m})),giden=grup.employeeId?fdWhatsappSohbetGidenleri.get(String(grup.employeeId)):null;
        (giden?.notifications||[]).forEach(b=>{const alici=(giden.recipients||[]).find(a=>String(a.notification_id)===String(b.id))||{};akıs.push({yon:'out',zaman:b.created_at||alici.created_at,bildirim:b,alici})});
        if(!giden&&grup.outgoingSummary?.notification)akıs.push({yon:'out',zaman:grup.outgoingSummary.notification.created_at||grup.outgoingSummary.created_at,bildirim:grup.outgoingSummary.notification,alici:grup.outgoingSummary});
        akıs.sort((a,b)=>new Date(a.zaman||0)-new Date(b.zaman||0));
        const balonlar=akıs.map(item=>{if(item.yon==='in'){const tur=fdWhatsappMesajTuru(item.mesaj);return '<div class="fd-wa-bubble">'+(tur?'<span class="fd-wa-message-kind">'+escapeDashboardText(tur)+'</span>':'')+'<p>'+escapeDashboardText(fdWhatsappMesajMetni(item.mesaj))+'</p><small>'+escapeDashboardText(fdBildirimTarihi(item.zaman))+'</small></div>'}const durum=fdWhatsappGidenDurumu(item.alici),baslik=String(item.bildirim?.title||''),yeniden=Number(item.bildirim?.resend_count||0)>0&&item.bildirim?.last_resent_at?'<span class="fd-wa-retry-result '+(item.alici?.status==='failed'?'failed':'success')+'">'+(item.alici?.status==='failed'?'Son yeniden gönderim başarısız':item.alici?.status==='pending'?'Tekrar gönderim kuyrukta':item.alici?.status==='cancelled'?'İptal edildi':'Yeniden gönderildi')+' · '+escapeDashboardText(fdBildirimTarihi(item.bildirim.last_resent_at))+'</span>':'',tekrar=item.alici?.status==='failed'&&item.bildirim?.id&&grup.employeeId?'<button type="button" class="fd-wa-retry-btn" onclick="fdWhatsappBasarisizMesajiTekrarGonder(\''+escapeDashboardText(String(item.bildirim.id))+'\',\''+escapeDashboardText(String(item.bildirim.source_price_event_id?item.alici.employee_legacy_id||grup.employeeId:grup.employeeId))+'\',this,\''+escapeDashboardText(String(grup.employeeId))+'\')">↻ Tekrar Gönder</button>':'';return '<div class="fd-wa-bubble outgoing">'+fdWhatsappGidenIcerigi(item.bildirim,item.alici)+'<small class="fd-wa-bubble-meta '+durum.sinif+'"><span>'+escapeDashboardText(fdBildirimTarihi(item.zaman))+'</span><span>'+escapeDashboardText(durum.metin)+'</span></small>'+yeniden+tekrar+'</div>'}).join('');
        const yukleniyor=grup.employeeId&&!fdWhatsappSohbetYuklenenler.has(String(grup.employeeId))?'<div class="fd-wa-empty" style="min-height:70px;padding:10px"><div>Gönderilen mesajlar yükleniyor...</div></div>':'';
        sohbet.innerHTML='<div class="fd-wa-chat-head"><div><strong>'+escapeDashboardText(grup.ad)+'</strong><small>'+escapeDashboardText(fdWhatsappTelefonuYaz(grup.senderWaId))+(grup.employeeId?String(grup.employeeId).startsWith('user:')?' · Kullanıcı hesabı':' · Personel kaydıyla eşleşti':' · Kayıtsız numara')+'</small></div>'+(grup.employeeId&&!String(grup.employeeId).startsWith('user:')?'<button type="button" class="fd-wa-chat-head-action" onclick="fdWhatsappKisiyeMesajHazirla(\''+escapeDashboardText(grup.employeeId)+'\')">Mesaj Gönder</button>':'')+'</div><div class="fd-wa-chat-messages">'+(balonlar||'<div class="fd-wa-empty"><div><span>💬</span>Bu konuşmada mesaj bulunmuyor.</div></div>')+yukleniyor+'</div>';
        const mesajAlani=sohbet.querySelector('.fd-wa-chat-messages');if(mesajAlani)mesajAlani.scrollTop=mesajAlani.scrollHeight;
    }
fdWhatsappGelenKutusuCiz=function(){
fdWaAssert(false);

        const liste=document.getElementById('fdWhatsappKonusmalar'),sohbet=document.getElementById('fdWhatsappSohbet');if(!liste||!sohbet)return;
        const arama=String(document.getElementById('fdWhatsappGelenAra')?.value||'').toLocaleLowerCase('tr-TR'),tumGruplar=fdWhatsappKonusmaGruplari(),gruplar=tumGruplar.filter(g=>!arama||[g.ad,g.senderWaId,g.sonMesaj,...g.messages.map(fdWhatsappMesajMetni)].join(' ').toLocaleLowerCase('tr-TR').includes(arama));
        if(!fdWhatsappAktifGonderen||!tumGruplar.some(g=>g.anahtar===fdWhatsappAktifGonderen))fdWhatsappAktifGonderen=tumGruplar[0]?.anahtar||'';
        liste.innerHTML=gruplar.length?gruplar.map(g=>'<button type="button" class="fd-wa-conversation '+(g.anahtar===fdWhatsappAktifGonderen?'active':'')+'" onclick="fdWhatsappKonusmaAc(\''+escapeDashboardText(g.anahtar)+'\')"><span><strong>'+escapeDashboardText(g.ad)+'</strong><small>'+escapeDashboardText(fdWhatsappTelefonuYaz(g.senderWaId))+' · '+escapeDashboardText(fdBildirimTarihi(g.sonZaman))+'</small><span>'+(g.sonYon==='out'?'<i class="fd-wa-conversation-direction">✓</i>':'')+escapeDashboardText(g.sonMesaj)+'</span></span>'+(g.okunmamis?'<b>'+g.okunmamis+'</b>':'')+'</button>').join(''):'<div class="fd-wa-empty"><div><span>📭</span>'+(arama?'Aramanıza uygun konuşma bulunamadı.':'Henüz WhatsApp konuşması yok.')+'</div></div>';
        fdWhatsappSohbetiCiz(tumGruplar.find(g=>g.anahtar===fdWhatsappAktifGonderen));
    };
function fdWhatsappSohbetGecmisiniYukle(employeeId,zorla=false){
fdWaAssert();

        const id=String(employeeId||'');if(!id)return Promise.resolve();
        const oturum=fdWhatsappCalismaOturumu,surum=fdWhatsappCalismaYuklemeSurumu;if(!fdWhatsappCalismaGecerli(oturum,surum))return Promise.resolve();
        if(!zorla&&fdWhatsappSohbetYuklenenler.has(id))return Promise.resolve();
        if(fdWhatsappSohbetIstekleri.has(id))return fdWhatsappSohbetIstekleri.get(id);
        const istek=whatsappCagir({action:'history',employeeId:id}).then(sonuc=>{
            if(!fdWhatsappCalismaGecerli(oturum,surum))return;
            fdWhatsappSohbetGidenleri.set(id,{notifications:Array.isArray(sonuc.notifications)?sonuc.notifications:[],recipients:Array.isArray(sonuc.recipients)?sonuc.recipients:[]});
            fdWhatsappSohbetYuklenenler.add(id);
            fdWhatsappGelenKutusuCiz();
        }).catch(error=>{if(!fdWhatsappCalismaGecerli(oturum,surum))return;fdWhatsappSohbetYuklenenler.add(id);fdWhatsappGelenKutusuCiz();showToast(hataMesaji(error,'Gönderilen mesajlar yüklenemedi.'),'error')}).finally(()=>{if(fdWhatsappSohbetIstekleri.get(id)===istek)fdWhatsappSohbetIstekleri.delete(id)});
        fdWhatsappSohbetIstekleri.set(id,istek);return istek;
    }
fdWhatsappKonusmaAc=async function(anahtar,zorla=false){
try{
fdWaAssert(false);

        const oturum=fdWhatsappCalismaOturumu,surum=fdWhatsappCalismaYuklemeSurumu;if(!fdWhatsappCalismaGecerli(oturum,surum))return;
        fdWhatsappAktifGonderen=String(anahtar||'');fdWhatsappGelenKutusuCiz();const grup=fdWhatsappKonusmaGruplari().find(g=>g.anahtar===fdWhatsappAktifGonderen);if(!grup)return;
        const okunmamis=(grup.messages||[]).filter(m=>!m.read_at),simdi=new Date().toISOString();if(okunmamis.length){okunmamis.forEach(m=>m.read_at=simdi);fdWhatsappGelenKutusuCiz();fdWhatsappRozetiniGuncelle(fdWhatsappGelenMesajlar.filter(m=>!m.read_at).length)}
        const islemler=[];
        if(okunmamis.length&&grup.senderWaId)islemler.push(whatsappCagir({action:'inbox-mark-read',senderWaId:grup.senderWaId}).then(sonuc=>{if(fdWhatsappCalismaGecerli(oturum,surum))fdWhatsappRozetiniGuncelle(sonuc.unreadCount)}).catch(error=>{if(!fdWhatsappCalismaGecerli(oturum,surum))return;okunmamis.forEach(m=>m.read_at=null);fdWhatsappGelenKutusuCiz();fdWhatsappRozetiniGuncelle(fdWhatsappGelenMesajlar.filter(m=>!m.read_at).length);showToast(hataMesaji(error,'Mesajlar okundu olarak işaretlenemedi.'),'error')}));
        if(grup.employeeId&&(zorla||!fdWhatsappSohbetYuklenenler.has(String(grup.employeeId))))islemler.push(fdWhatsappSohbetGecmisiniYukle(grup.employeeId,zorla));
        await fdWaAwait(Promise.all(islemler));
    
}catch(fdWaError){if(!fdWaValid())return;throw fdWaError;}
};
fdWhatsappBasarisizMesajiTekrarGonder=async function(notificationId,employeeId,button,historyEmployeeId=employeeId){
try{
fdWaAssert(true);

        if(button){button.disabled=true;button.textContent='Gönderiliyor...';}
        try{
            const sonuc=await fdWaAwait(whatsappCagir({action:'resend-recipient',notificationId:String(notificationId||''),employeeId:String(employeeId||'')})),ilkHata=sonuc.failureReasons?.[0]?.error_message;
            fdWhatsappGonderimSonucuGoster(sonuc);
            const historyId=String(historyEmployeeId||employeeId||'');
            fdWhatsappSohbetYuklenenler.delete(historyId);
            await fdWaAwait(fdWhatsappSohbetGecmisiniYukle(historyId,true));
        }catch(error){if(!fdWaValid())return;
showToast(hataMesaji(error,'Mesaj yeniden gönderilemedi.'),'error')}
        finally{if(button&&button.isConnected){button.disabled=false;button.textContent='↻ Tekrar Gönder';}}
    
}catch(fdWaError){if(!fdWaValid())return;throw fdWaError;}
};
fdWhatsappGelenKutusuYukle=async function(zorla=false){
try{
fdWaAssert(false);

        const oturum=fdWhatsappCalismaOturumu,surum=fdWhatsappCalismaYuklemeSurumu;if(!fdWhatsappCalismaGecerli(oturum,surum))return;
        if(fdWhatsappGelenYukleniyor||(!zorla&&fdWhatsappKonusmalarYuklendi)){fdWhatsappGelenKutusuCiz();return}fdWhatsappGelenYukleniyor=true;const liste=document.getElementById('fdWhatsappKonusmalar');if(liste)liste.innerHTML='<div class="fd-wa-empty"><div><span>⏳</span>Konuşmalar yükleniyor...</div></div>';if(zorla){fdWhatsappSohbetGidenleri.clear();fdWhatsappSohbetYuklenenler.clear()}
        const istek=++fdWhatsappGelenYuklemeSurumu;
        try{const sonuc=await fdWaAwait(whatsappCagir({action:'inbox'}));if(istek!==fdWhatsappGelenYuklemeSurumu||!fdWhatsappCalismaGecerli(oturum,surum))return;fdWhatsappGelenMesajlar=Array.isArray(sonuc.messages)?sonuc.messages:[];fdWhatsappGidenOzetleri=Array.isArray(sonuc.outgoingSummaries)?sonuc.outgoingSummaries:[];fdWhatsappKonusmalarYuklendi=true;fdWhatsappGelenKutusuCiz();fdWhatsappRozetiniGuncelle(fdWhatsappGelenMesajlar.filter(m=>!m.read_at).length);if(fdWhatsappAktifGonderen)await fdWaAwait(fdWhatsappKonusmaAc(fdWhatsappAktifGonderen,zorla))}catch(error){if(!fdWaValid())return;
if(istek!==fdWhatsappGelenYuklemeSurumu||!fdWhatsappCalismaGecerli(oturum,surum))return;fdWhatsappKonusmalarYuklendi=false;if(liste)liste.innerHTML='<div class="fd-wa-empty" style="color:#b91c1c"><div><span>⚠️</span>'+escapeDashboardText(hataMesaji(error,'WhatsApp konuşmaları yüklenemedi.'))+'</div></div>'}finally{if(istek===fdWhatsappGelenYuklemeSurumu)fdWhatsappGelenYukleniyor=false}
    
}catch(fdWaError){if(!fdWaValid())return;throw fdWaError;}
};
fdWhatsappKisiyeMesajHazirla=function(employeeId){
fdWaAssert(false);
fdWhatsappSekmeAc('send');fdBildirimSeciliIdler.clear();fdBildirimSeciliIdler.add(String(employeeId));const sube=document.getElementById('fdBildirimSube'),ara=document.getElementById('fdBildirimPersonelAra');if(sube)sube.value='';if(ara)ara.value='';fdBildirimPersonelleriniDoldur(false);fdBildirimHedefOzetiniGuncelle();const secili=document.querySelector('#fdBildirimPersonelListesi .fd-bildirim-personel-sec:checked');if(!secili)showToast('Bu personel aktif gönderim listesinde bulunmuyor.','warning');else document.getElementById('fdBildirimMesaj')?.focus()};
let fdWhatsappKuyrukKayitlari=[],fdWhatsappKuyrukDuraklatildi=false,fdWhatsappKuyrukHazir=false,fdWhatsappKuyrukIslemde=false,fdWhatsappKuyrukSirket='',fdWhatsappKuyrukOturum='',fdWhatsappKuyrukYuklemeSira=0;
let fdWhatsappKuyrukMetaEngelli=false,fdWhatsappKuyrukMetaEngelTarihi='',fdWhatsappKuyrukMetaKontrolTarihi='',fdWhatsappKuyrukMetaEngelNedeni='';
const fdWhatsappKuyrukSecimleri=new Set();
function fdWhatsappKuyrukMetaErisiminiSifirla(){
fdWaAssert();
fdWhatsappKuyrukMetaEngelli=false;fdWhatsappKuyrukMetaEngelTarihi='';fdWhatsappKuyrukMetaKontrolTarihi='';fdWhatsappKuyrukMetaEngelNedeni=''}
function fdWhatsappKuyrukMetaUyarisiCiz(){
fdWaAssert();

        const liste=document.getElementById('fdWhatsappKuyrukListesi');if(!liste)return;
        let uyari=document.getElementById('fdWhatsappKuyrukMetaUyarisi');
        if(!uyari){uyari=document.createElement('div');uyari.id='fdWhatsappKuyrukMetaUyarisi';uyari.setAttribute('role','status');uyari.style.cssText='margin-bottom:10px;padding:11px 13px;border:1px solid #fcd34d;border-radius:10px;background:#fffbeb;color:#92400e;font-size:.76rem;line-height:1.5;overflow-wrap:anywhere;min-width:0';liste.before(uyari)}
        uyari.style.display=fdWhatsappKuyrukHazir&&fdWhatsappKuyrukMetaEngelli?'block':'none';uyari.replaceChildren();
        if(!fdWhatsappKuyrukHazir||!fdWhatsappKuyrukMetaEngelli)return;
        const baslik=document.createElement('strong');baslik.textContent='Meta erişimi engelli; mesajlar kuyrukta korunuyor. Erişim açıldığında sıralı gönderim yeniden denenecek.';uyari.append(baslik);
        const detaylar=[];
        if(fdWhatsappKuyrukMetaEngelNedeni)detaylar.push('Neden: '+fdWhatsappHataMetniDuzelt(fdWhatsappKuyrukMetaEngelNedeni));
        if(Number.isFinite(Date.parse(fdWhatsappKuyrukMetaEngelTarihi)))detaylar.push('Son erişim hatası: '+fdBildirimTarihi(fdWhatsappKuyrukMetaEngelTarihi));
        if(Number.isFinite(Date.parse(fdWhatsappKuyrukMetaKontrolTarihi)))detaylar.push('Sonraki erişim kontrolü: '+fdBildirimTarihi(fdWhatsappKuyrukMetaKontrolTarihi)+' · Kontrol saati gönderim saati değildir.');
        if(detaylar.length){const detay=document.createElement('small');detay.style.cssText='display:block;margin-top:5px;white-space:pre-line;overflow-wrap:anywhere';detay.textContent=detaylar.join('\n');uyari.append(detay)}
    }
function fdWhatsappKuyrukOturumAnahtari(){
fdWaAssert();
return String(activeUser?.supabaseUserId||activeUser?.username||'')+'|'+String(activeUser?.sirketId||'')+'|'+String(activeUser?.rol||'')}
function fdWhatsappKuyrukOturumuGecerli(oturum){return fdWaValid()&&!!activeUser?.sirketId&&oturum===fdWhatsappKuyrukOturumAnahtari()&&(typeof isManagerUser!=='function'||isManagerUser())}
function fdWhatsappKuyrukTuru(item){
fdWaAssert();
if(item?.priceEventQueue)return'Fiyat listesi';const roller=Array.isArray(item?.target_roles)?item.target_roles:[];if(roller.includes('IzinOtomatik'))return'🌴 İzin';if(roller.includes('VardiyaOtomatik'))return'🕓 Vardiya';if(roller.includes('BordroOtomatik'))return'📄 Ücret pusulası';return'💬 Planlı mesaj'}
function fdWhatsappKuyrukOtomatikMi(item){
fdWaAssert();
if(item?.priceEventQueue)return true;const roller=Array.isArray(item?.target_roles)?item.target_roles:[];return roller.some(x=>['IzinOtomatik','VardiyaOtomatik','BordroOtomatik'].includes(x))}
function fdWhatsappKuyrukHedefi(item){
fdWaAssert();
if(item?.priceEventQueue){const names=(Array.isArray(item.recipients)?item.recipients:[]).map(r=>String(r.name||'')).filter(Boolean);return names.length?names.join(', '):'Seçili uygun kullanıcı bulunmuyor';}const idler=Array.isArray(item?.target_employee_ids)?item.target_employee_ids.map(String):[],adlar=idler.map(id=>personeller.find(p=>String(p.id)===id)?.ad).filter(Boolean);if(adlar.length)return adlar.join(', ');const roller=Array.isArray(item?.target_roles)?item.target_roles:[];return roller.some(x=>['Admin','Yonetici'].includes(x))?'Yöneticiler':'Tüm aktif personel'}
function fdWhatsappKuyrukAnahtari(item){
fdWaAssert();
return(item.priceEventQueue?'price:':item.recipientQueue?'recipient:':'schedule:')+String(item.id)}
function fdWhatsappKuyrukTahminleriniHesapla(planlar,alicilar,options={}){
fdWaAssert();

        const tarih=value=>{const sonuc=typeof value==='number'?value:Date.parse(value);return Number.isFinite(sonuc)?sonuc:null},simdi=tarih(options.now)??Date.now();
        const saniye=Number(options.intervalSeconds),aralik=(Number.isFinite(saniye)?Math.max(240,saniye):240)*1000;
        const kaynakPlanlar=new Set((Array.isArray(alicilar)?alicilar:[]).map(item=>String(item?.whatsapp_notifications?.source_schedule_id||'')).filter(Boolean));
        const satirlar=[...(Array.isArray(planlar)?planlar:[]).filter(item=>!kaynakPlanlar.has(String(item.id))).map(item=>({...item,recipientQueue:false,priceEventQueue:false})),
            ...(Array.isArray(alicilar)?alicilar:[]).map(item=>{const bildirim=item.whatsapp_notifications||{};return{...item,title:bildirim.title||item.title,message:item.prepared_message_snapshot?.body||bildirim.message||item.message,
                recipientQueue:true,priceEventQueue:false,status:item.queue_state==='processing'?'processing':'pending',scheduled_for:item.scheduled_for||item.next_attempt_at||''}})];
        const sirala=(a,b)=>{
            const ilk=(tarih(a.recipientQueue?a.next_attempt_at:a.scheduled_for)??simdi)-(tarih(b.recipientQueue?b.next_attempt_at:b.scheduled_for)??simdi);if(ilk)return ilk;
            if(a.recipientQueue!==b.recipientQueue)return a.recipientQueue?-1:1;
            if(a.recipientQueue){const olusma=(tarih(a.created_at)??0)-(tarih(b.created_at)??0);if(olusma)return olusma}
            return String(a.id||'').localeCompare(String(b.id||''));
        };
        const gonderilen=satirlar.filter(item=>item.recipientQueue&&item.status==='processing').sort(sirala),bekleyen=satirlar.filter(item=>!item.recipientQueue||item.status!=='processing').sort(sirala);
        let zaman=Math.max(simdi,tarih(options.nextSendAt)??simdi,gonderilen.length?simdi+aralik:simdi),sira=1,belirsiz=false;
        const sonuc=gonderilen.map(item=>({...item,estimated_send_at:null,estimated_end_at:null,queue_sequence:null,estimated_recipient_count:1,queue_interval_seconds:aralik/1000,estimate_uncertain:false}));
        for(const item of bekleyen){
            const idler=[...new Set((Array.isArray(item.target_employee_ids)?item.target_employee_ids:[]).map(id=>String(id).trim()).filter(Boolean))],adet=item.recipientQueue?1:(idler.length||null);
            const baslama=tarih(item.recipientQueue?item.next_attempt_at:item.scheduled_for);zaman=Math.max(zaman,baslama??simdi);belirsiz=belirsiz||adet===null||baslama===null;
            sonuc.push({...item,estimated_send_at:options.paused?null:new Date(zaman).toISOString(),estimated_end_at:options.paused||adet===null?null:new Date(zaman+(adet-1)*aralik).toISOString(),
                queue_sequence:sira,estimated_recipient_count:adet,queue_interval_seconds:aralik/1000,estimate_uncertain:belirsiz});
            zaman+=(adet||1)*aralik;sira+=adet||1;
        }
        return sonuc;
    }
function fdWhatsappKuyrukKontrolleriniCiz(){
fdWaAssert();

        const bekleyen=fdWhatsappKuyrukKayitlari.filter(x=>x.status==='pending'),gecerli=new Set(bekleyen.map(fdWhatsappKuyrukAnahtari));
        for(const key of fdWhatsappKuyrukSecimleri)if(!gecerli.has(key))fdWhatsappKuyrukSecimleri.delete(key);
        const durum=document.getElementById('fdWhatsappKuyrukDurumu'),durdur=document.getElementById('fdWhatsappKuyrukDurdur'),devam=document.getElementById('fdWhatsappKuyrukDevam'),tum=document.getElementById('fdWhatsappKuyrukTumunuSec'),sil=document.getElementById('fdWhatsappKuyrukSecilenleriSil');
        if(durum){durum.textContent=!fdWhatsappKuyrukHazir?'Kuyruk durumu alınıyor...':fdWhatsappKuyrukMetaEngelli?'⚠ Meta erişimi bekleniyor · '+bekleyen.length+' bekleyen'+(fdWhatsappKuyrukDuraklatildi?' · Gönderimler ayrıca durduruldu':''):fdWhatsappKuyrukDuraklatildi?'⏸ Gönderimler durduruldu · '+bekleyen.length+' bekleyen':'▶ Gönderimler açık · '+bekleyen.length+' bekleyen · En az 4 dk aralıkla';durum.classList.toggle('paused',fdWhatsappKuyrukDuraklatildi);durum.classList.toggle('access-blocked',fdWhatsappKuyrukMetaEngelli);durum.style.color=fdWhatsappKuyrukMetaEngelli?'#92400e':''}
        fdWhatsappKuyrukMetaUyarisiCiz();
        if(durdur)durdur.disabled=!fdWhatsappKuyrukHazir||fdWhatsappKuyrukIslemde||fdWhatsappKuyrukDuraklatildi;
        if(devam)devam.disabled=!fdWhatsappKuyrukHazir||fdWhatsappKuyrukIslemde||!fdWhatsappKuyrukDuraklatildi;
        if(tum){tum.disabled=!fdWhatsappKuyrukHazir||fdWhatsappKuyrukIslemde||!bekleyen.length;tum.checked=!!bekleyen.length&&fdWhatsappKuyrukSecimleri.size===bekleyen.length;tum.indeterminate=fdWhatsappKuyrukSecimleri.size>0&&!tum.checked}
        if(sil){sil.disabled=!fdWhatsappKuyrukHazir||fdWhatsappKuyrukIslemde||!fdWhatsappKuyrukSecimleri.size;sil.textContent=fdWhatsappKuyrukIslemde?'İşleniyor...':'Seçilenleri Sil'+(fdWhatsappKuyrukSecimleri.size?' ('+fdWhatsappKuyrukSecimleri.size+')':'')}
        document.querySelectorAll('#fdWhatsappKuyrukListesi button,#fdWhatsappKuyrukListesi input').forEach(x=>x.disabled=fdWhatsappKuyrukIslemde);
        const sayfalama=document.getElementById('fdWhatsappKuyrukSayfalama');
        if(sayfalama){sayfalama.hidden=!fdWhatsappKuyrukHazir;sayfalama.querySelectorAll('button,select').forEach(x=>x.disabled=fdWhatsappKuyrukIslemde||x.dataset.edgeDisabled==='1')}
    }
function fdWhatsappKuyrukSayfalamaCiz(alan,sayfa,sayfaSayisi,toplam){
fdWaAssert();

        let nav=document.getElementById('fdWhatsappKuyrukSayfalama');
        if(!nav){nav=document.createElement('nav');nav.id='fdWhatsappKuyrukSayfalama';nav.className='fd-wa-queue-pagination';nav.setAttribute('aria-label','WhatsApp kuyruk sayfaları');alan.after(nav)}
        nav.replaceChildren();nav.hidden=!fdWhatsappKuyrukHazir;
        const ozet=document.createElement('span');ozet.setAttribute('role','status');ozet.setAttribute('aria-live','polite');ozet.textContent=(toplam?(sayfa-1)*fdWaKuyrukSayfaBoyutu+1:0)+'–'+Math.min(sayfa*fdWaKuyrukSayfaBoyutu,toplam)+' / '+toplam+' kayıt · Sayfa '+sayfa+' / '+sayfaSayisi;nav.append(ozet);
        const kontroller=document.createElement('div'),oturum=fdWhatsappKuyrukOturumAnahtari(),boyut=document.createElement('select');boyut.className='fd-page-size';boyut.setAttribute('aria-label','Sayfadaki kayıt sayısı');for(const n of [25,50,75,100]){const option=document.createElement('option');option.value=String(n);option.textContent=n+' kayıt';boyut.append(option);}boyut.value=String(fdWaKuyrukSayfaBoyutu);boyut.disabled=fdWhatsappKuyrukIslemde;boyut.onchange=()=>{if(fdWhatsappKuyrukIslemde||!fdWhatsappKuyrukHazir||!fdWhatsappKuyrukOturumuGecerli(oturum))return;fdWaKuyrukSayfaBoyutu=[25,50,75,100].includes(Number(boyut.value))?Number(boyut.value):50;alan.dataset.queuePage='1';fdWhatsappKuyrukCiz();};kontroller.append(boyut);
        for(const [etiket,hedef]of [['İlk',1],['Önceki',sayfa-1],['Sonraki',sayfa+1],['Son',sayfaSayisi]]){
            const button=document.createElement('button');button.type='button';button.textContent=etiket;button.setAttribute('aria-label',etiket+' kuyruk sayfası');button.dataset.edgeDisabled=hedef<1||hedef>sayfaSayisi||hedef===sayfa?'1':'0';button.disabled=fdWhatsappKuyrukIslemde||button.dataset.edgeDisabled==='1';
            button.onclick=()=>{if(fdWhatsappKuyrukIslemde||!fdWhatsappKuyrukHazir||!fdWhatsappKuyrukOturumuGecerli(oturum)||hedef<1||hedef>sayfaSayisi||hedef===sayfa)return;alan.dataset.queuePage=String(hedef);fdWhatsappKuyrukCiz();alan.scrollIntoView({block:'start'})};kontroller.append(button);
        }
        nav.append(kontroller);
    }
function fdWhatsappKuyrukCiz(){
fdWaAssert();

        const alan=document.getElementById('fdWhatsappKuyrukListesi'),rozet=document.getElementById('fdWhatsappKuyrukRozeti');
        if(rozet){rozet.textContent=String(fdWhatsappKuyrukKayitlari.length);rozet.style.display=fdWhatsappKuyrukKayitlari.length?'inline-flex':'none'}if(!alan)return;
        const oturum=fdWhatsappKuyrukOturumAnahtari();if(alan.dataset.queuePageScope!==oturum||!fdWhatsappKuyrukOturum){alan.dataset.queuePageScope=oturum;alan.dataset.queuePage='1';fdWaKuyrukSayfaBoyutu=50}
        const sayfaSayisi=Math.max(1,Math.ceil(fdWhatsappKuyrukKayitlari.length/fdWaKuyrukSayfaBoyutu)),sayfa=Math.max(1,Math.min(sayfaSayisi,Math.trunc(Number(alan.dataset.queuePage)||1)));alan.dataset.queuePage=String(sayfa);
        alan.innerHTML=fdWhatsappKuyrukKayitlari.length?fdWhatsappKuyrukKayitlari.slice((sayfa-1)*fdWaKuyrukSayfaBoyutu,sayfa*fdWaKuyrukSayfaBoyutu).map(item=>{
            const bekliyor=item.status==='pending',duzenlenebilir=bekliyor&&!item.recipientQueue&&!item.priceEventQueue&&!fdWhatsappKuyrukOtomatikMi(item),id=escapeDashboardText(String(item.id)),key=escapeDashboardText(fdWhatsappKuyrukAnahtari(item)),secili=fdWhatsappKuyrukSecimleri.has(fdWhatsappKuyrukAnahtari(item));
            const durum=fdWhatsappKuyrukMetaEngelli?'Meta erişimi bekleniyor':item.status==='processing'?(item.recipientQueue?'Şu anda gönderiliyor':'Kuyruğa aktarılıyor'):fdWhatsappKuyrukDuraklatildi?'Durduruldu':item.template_hold?'Meta şablon onayı bekleniyor':item.priceEventQueue?'Hazırlanıyor · ardından sıralı kuyruk':'Sıralı kuyruk · En az 4 dk aralıkla';
            const baslik=item.priceEventQueue?item.title:(item.recipientQueue?'⏳ Sıralı gönderim':fdWhatsappKuyrukTuru(item))+' · '+(item.title||'Bilgilendirme');
            const baslama=item.recipientQueue?item.next_attempt_at:item.scheduled_for;
            const tarihMetni=item.template_hold?'Şablon onayından sonra sıralı gönderim':item.priceEventQueue?'Oluşturuldu: '+fdBildirimTarihi(item.created_at):fdWhatsappKuyrukMetaEngelli?'Erişim açılınca gönderim sırası yeniden hesaplanır':item.recipientQueue&&item.status==='processing'?'Gönderim sürüyor':fdWhatsappKuyrukDuraklatildi?'Devam ettirilince sırayla':item.estimated_send_at?(item.estimate_uncertain?'En erken tahmini: ':'Tahmini gönderim: ')+fdBildirimTarihi(item.estimated_send_at)+(item.estimated_end_at&&item.estimated_end_at!==item.estimated_send_at?' — '+fdBildirimTarihi(item.estimated_end_at):''):'Gönderim sırası hazırlanıyor';
            const planMetni=!item.priceEventQueue&&!(item.recipientQueue&&item.status==='processing')&&baslama?'<span>Başlangıç / en erken: '+escapeDashboardText(fdBildirimTarihi(baslama))+'</span>':'';
            const aliciMetni=!item.priceEventQueue&&!item.recipientQueue?(item.estimated_recipient_count?'<span>'+item.estimated_recipient_count+' alıcı · tek tek gönderilir</span>':'<span>Alıcılar hazırlanırken sıra netleşir</span>'):'';
            return '<article class="fd-wa-queue-item '+escapeDashboardText(item.status||'pending')+(secili?' selected':'')+'"><div>'+(bekliyor?'<label class="fd-wa-queue-selection"><input type="checkbox" data-queue-key="'+key+'" '+(secili?'checked ':'')+'onchange="fdWhatsappKuyrukSec(\''+key+'\',this.checked)"> Seç</label>':'')+'<h4>'+escapeDashboardText(baslik)+'</h4><p>'+fdWhatsappMetniBicimle(item.message||'')+'</p><div class="fd-wa-queue-meta"><span>👤 '+escapeDashboardText(item.priceEventQueue?fdWhatsappKuyrukHedefi(item):item.employee_name||fdWhatsappKuyrukHedefi(item))+'</span><span>🗓 '+escapeDashboardText(tarihMetni)+'</span>'+planMetni+aliciMetni+(item.priceEventQueue?'<span>'+escapeDashboardText(String(Number(item.changed_count)||0))+' ürün değişikliği</span>':'')+'<span>'+durum+'</span></div>'+(item.error_message?'<small>'+escapeDashboardText(fdWhatsappHataMetniDuzelt(item.error_message))+'</small>':'')+'</div>'+(bekliyor?'<div class="fd-wa-queue-actions">'+(duzenlenebilir?'<button type="button" class="fd-wa-queue-edit" onclick="fdWhatsappKuyrukDuzenle(\''+id+'\')">Düzenle</button>':'')+'<button type="button" class="fd-wa-queue-cancel" onclick="fdWhatsappKuyrukIptal(\''+id+'\',this,\''+key+'\')">İptal Et</button></div>':'')+'</article>'
        }).join(''):'<div class="fd-wa-empty"><div><span>✓</span>Bekleyen WhatsApp mesajı bulunmuyor.</div></div>';
        fdWhatsappKuyrukSayfalamaCiz(alan,sayfa,sayfaSayisi,fdWhatsappKuyrukKayitlari.length);
        fdWhatsappKuyrukKontrolleriniCiz();
    }
fdWhatsappKuyrukSec=function(key,sec){
fdWaAssert(false);
const item=fdWhatsappKuyrukKayitlari.find(x=>fdWhatsappKuyrukAnahtari(x)===key);if(fdWhatsappKuyrukIslemde||item?.status!=='pending')return;if(sec)fdWhatsappKuyrukSecimleri.add(key);else fdWhatsappKuyrukSecimleri.delete(key);document.querySelectorAll('#fdWhatsappKuyrukListesi input[data-queue-key]').forEach(x=>x.closest('article')?.classList.toggle('selected',fdWhatsappKuyrukSecimleri.has(x.dataset.queueKey)));fdWhatsappKuyrukKontrolleriniCiz()};
fdWhatsappKuyrukTumunuSec=function(sec){
fdWaAssert(false);
if(fdWhatsappKuyrukIslemde)return;fdWhatsappKuyrukSecimleri.clear();if(sec)fdWhatsappKuyrukKayitlari.filter(x=>x.status==='pending').forEach(x=>fdWhatsappKuyrukSecimleri.add(fdWhatsappKuyrukAnahtari(x)));fdWhatsappKuyrukCiz()};
fdWhatsappKuyrukDuzenle=function(id){
fdWaAssert(false);
if(fdWhatsappKuyrukIslemde)return;const item=fdWhatsappKuyrukKayitlari.find(kayit=>String(kayit.id)===String(id)&&!kayit.recipientQueue&&!kayit.priceEventQueue&&kayit.status==='pending');if(!item)return showToast('Planlı mesaj kuyruğunda bulunamadı.','warning');if(fdWhatsappKuyrukOtomatikMi(item))return showToast('Otomatik mesajlar WhatsApp ayarlarından yönetilir.','warning');fdWhatsappSekmeAc('send');fdBildirimPlanDuzenlemeAc(item);const dugme=document.getElementById('fdBildirimGonderBtn');if(dugme)dugme.textContent='💾 Planlı Mesajı Güncelle';document.getElementById('fdBildirimMesaj')?.focus()};
fdWhatsappKuyrukYukle=async function(zorla=false){
try{
fdWaAssert(false);
const alan=document.getElementById('fdWhatsappKuyrukListesi');if(!alan)return;
        const sirket=String(activeUser?.sirketId||''),oturum=fdWhatsappKuyrukOturumAnahtari();if(fdWhatsappKuyrukOturum!==oturum){fdWhatsappKuyrukOturum=oturum;fdWhatsappKuyrukYuklemeSira++;fdWhatsappKuyrukSirket=sirket;fdWhatsappKuyrukHazir=false;fdWhatsappKuyrukIslemde=false;fdWhatsappKuyrukDuraklatildi=false;fdWhatsappKuyrukMetaErisiminiSifirla();fdWhatsappKuyrukKayitlari=[];fdWhatsappKuyrukSecimleri.clear();delete alan.dataset.loaded;delete alan.dataset.loading}
        if(!fdWhatsappKuyrukOturumuGecerli(oturum)){fdWhatsappKuyrukHazir=false;fdWhatsappKuyrukMetaErisiminiSifirla();fdWhatsappKuyrukKayitlari=[];fdWhatsappKuyrukSecimleri.clear();delete alan.dataset.loaded;fdWhatsappKuyrukCiz();return}if(alan.dataset.loading==='1')return;
        const istek=++fdWhatsappKuyrukYuklemeSira;
        if(!zorla&&alan.dataset.loaded==='1'){fdWhatsappKuyrukCiz();return}alan.dataset.loading='1';fdWhatsappKuyrukHazir=false;fdWhatsappKuyrukKontrolleriniCiz();alan.innerHTML='<div class="fd-wa-empty"><div><span>⏳</span>Gönderim kuyruğu yükleniyor...</div></div>';try{
            if(typeof window.fdxPlanliBildirimApi!=='function')throw new Error('Planlı mesaj bağlantısı hazır değil.');
            const [sonuc,kuyruk]=await fdWaAwait(Promise.all([fdWaPlan({action:'schedule-queue-list'}),whatsappCagir({action:'queue-list'})]));
            if(istek!==fdWhatsappKuyrukYuklemeSira||!fdWhatsappKuyrukOturumuGecerli(oturum))return;
            fdWhatsappKuyrukMetaEngelli=kuyruk.accessBlocked===true;fdWhatsappKuyrukMetaEngelTarihi=String(kuyruk.accessBlockedAt||'');fdWhatsappKuyrukMetaKontrolTarihi=String(kuyruk.accessNextCheckAt||'');fdWhatsappKuyrukMetaEngelNedeni=String(kuyruk.accessBlockedReason||'');
            const sirali=fdWhatsappKuyrukTahminleriniHesapla(sonuc.items,kuyruk.items,{now:Date.now(),nextSendAt:kuyruk.nextSendAt,intervalSeconds:kuyruk.intervalSeconds,paused:!!kuyruk.paused||fdWhatsappKuyrukMetaEngelli});
            const fiyatlar=(Array.isArray(kuyruk.priceEvents)?kuyruk.priceEvents:[]).map(item=>({...item,priceEventQueue:true,recipientQueue:false,target_roles:[],status:item.status==='processing'?'processing':'pending',title:'Fiyat listesi: '+String(item.list_name||'Fiyat listesi'),message:String(item.blocked_reason||'Fiyat bildirimi hazırlanıyor'),scheduled_for:item.created_at||new Date().toISOString()}));
            fdWhatsappKuyrukDuraklatildi=!!kuyruk.paused;fdWhatsappKuyrukHazir=true;
            fdWhatsappKuyrukKayitlari=[...sirali,...fiyatlar];alan.dataset.loaded='1';fdWhatsappKuyrukCiz();
        }catch(error){if(!fdWaValid())return;
if(istek===fdWhatsappKuyrukYuklemeSira&&fdWhatsappKuyrukOturumuGecerli(oturum)){alan.innerHTML='<div class="fd-wa-empty"><div>'+escapeDashboardText(error?.message||error)+'</div></div>';delete alan.dataset.loaded;fdWhatsappKuyrukKontrolleriniCiz()}}finally{if(istek===fdWhatsappKuyrukYuklemeSira){delete alan.dataset.loading;if(!fdWhatsappKuyrukOturumuGecerli(oturum)){fdWhatsappKuyrukHazir=false;fdWhatsappKuyrukMetaErisiminiSifirla();fdWhatsappKuyrukKayitlari=[];fdWhatsappKuyrukSecimleri.clear();delete alan.dataset.loaded;fdWhatsappKuyrukCiz()}}}
}catch(fdWaError){if(!fdWaValid())return;throw fdWaError;}
};
fdWhatsappKuyrukDuraklat=async function(durdur){
try{
fdWaAssert(true);
if(fdWhatsappKuyrukIslemde||!fdWhatsappKuyrukHazir)return;fdWhatsappKuyrukIslemde=true;fdWhatsappKuyrukKontrolleriniCiz();try{const sonuc=await fdWaAwait(whatsappCagir({action:durdur?'queue-pause':'queue-resume'}));fdWhatsappKuyrukDuraklatildi=!!sonuc.paused;showToast(durdur?'Bu şirketin tüm bekleyen WhatsApp gönderimleri durduruldu. Gönderime başlamış mesajlar geri alınamaz.':fdWhatsappKuyrukMetaEngelli?'Kullanıcı durdurması kaldırıldı. Meta erişimi açılana kadar mesajlar kuyrukta bekleyecek.':'Gönderimler kaldığı yerden, en az 4 dakika arayla devam edecek.','success')}catch(error){if(!fdWaValid())return;
showToast('Kuyruk durumu değiştirilemedi: '+(error?.message||error),'error')}finally{fdWhatsappKuyrukIslemde=false;await fdWaAwait(fdWhatsappKuyrukYukle(true))}
}catch(fdWaError){if(!fdWaValid())return;throw fdWaError;}
};
fdWhatsappKuyrukSecilenleriSil=async function(){
try{
fdWaAssert(true);
if(fdWhatsappKuyrukIslemde||!fdWhatsappKuyrukHazir)return;const secilen=fdWhatsappKuyrukKayitlari.filter(x=>x.status==='pending'&&fdWhatsappKuyrukSecimleri.has(fdWhatsappKuyrukAnahtari(x)));if(!secilen.length)return;
        fdWhatsappKuyrukIslemde=true;fdWhatsappKuyrukKontrolleriniCiz();
        try{if(!await fdWaAwait(fdYuzerOnaySor(secilen.length+' bekleyen mesaj gönderim kuyruğundan silinsin mi? Gönderilmiş ve gönderime başlamış mesajlara dokunulmaz.','Seçilen Mesajları Sil','Sil')))return;
            const sonuc=await fdWaAwait(whatsappCagir({action:'queue-cancel-many',scheduleIds:secilen.filter(x=>!x.recipientQueue&&!x.priceEventQueue).map(x=>x.id),recipientIds:secilen.filter(x=>x.recipientQueue).map(x=>x.id),priceEventIds:secilen.filter(x=>x.priceEventQueue).map(x=>x.id)}));
            const adet=Number(sonuc.cancelled||0);showToast(adet+' bekleyen mesaj kuyruktan silindi.'+(adet<secilen.length?' Diğer mesajlar gönderime alınmış veya daha önce kaldırılmış.':''),adet?'success':'warning');fdWhatsappKuyrukSecimleri.clear();
        }catch(error){if(!fdWaValid())return;
showToast('Mesajlar silinemedi: '+(error?.message||error),'error')}finally{fdWhatsappKuyrukIslemde=false;await fdWaAwait(fdWhatsappKuyrukYukle(true))}
}catch(fdWaError){if(!fdWaValid())return;throw fdWaError;}
};
fdWhatsappKuyrukIptal=async function(id,button,key=''){
try{
fdWaAssert(true);
if(fdWhatsappKuyrukIslemde||!id)return;const item=fdWhatsappKuyrukKayitlari.find(x=>String(x.id)===String(id)&&(!key||fdWhatsappKuyrukAnahtari(x)===key)&&x.status==='pending');if(!item)return;
        fdWhatsappKuyrukIslemde=true;fdWhatsappKuyrukKontrolleriniCiz();
        try{if(!await fdWaAwait(fdYuzerOnaySor('Bu bekleyen WhatsApp mesajı iptal edilsin mi?','Gönderimi İptal Et','İptal Et')))return;
            if(item.priceEventQueue)await fdWaAwait(whatsappCagir({action:'queue-cancel-price',id}));else if(item.recipientQueue)await fdWaAwait(whatsappCagir({action:'queue-cancel',id}));else await fdWaAwait(fdWaPlan({action:'schedule-cancel',id}));showToast('Bekleyen WhatsApp mesajı iptal edildi.','success');
        }catch(error){if(!fdWaValid())return;
showToast('Mesaj iptal edilemedi: '+(error?.message||error),'error')}finally{fdWhatsappKuyrukIslemde=false;await fdWaAwait(fdWhatsappKuyrukYukle(true))}
}catch(fdWaError){if(!fdWaValid())return;throw fdWaError;}
};
fdWhatsappSekmeAc=function(sekme){
fdWaAssert(false);

        const secim=['send','queue'].includes(sekme)?sekme:'inbox',kabuk=document.getElementById('modalBildirimGonder');if(kabuk)kabuk.dataset.tab=secim;
        [['inbox','fdWhatsappGelenPanel','fdWhatsappSekmeGelen'],['send','fdWhatsappGonderPanel','fdWhatsappSekmeGonder'],['queue','fdWhatsappKuyrukPanel','fdWhatsappSekmeKuyruk']].forEach(([ad,panelId,dugmeId])=>{const aktif=secim===ad,panel=document.getElementById(panelId),dugme=document.getElementById(dugmeId);if(panel)panel.style.display=aktif?(ad==='inbox'?'flex':'block'):'none';if(dugme){dugme.classList.toggle('active',aktif);dugme.setAttribute('aria-selected',String(aktif))}});
        if(secim==='inbox')fdWhatsappGelenKutusuYukle(false);if(secim==='queue')fdWhatsappKuyrukYukle(true);
    };
openWhatsappMesajlari=function(){
fdWaAssert(false);
return openBildirimModal({tab:'inbox',preserveTab:true})};
async function fdWhatsappWebhookunuDogrula(){
try{
fdWaAssert();
const anahtar='fd_whatsapp_webhook_subscribed_v1';if(sessionStorage.getItem(anahtar)==='1')return;try{await fdWaAwait(whatsappCagir({action:'ensure-webhook'}));sessionStorage.setItem(anahtar,'1')}catch(error){if(!fdWaValid())return;
console.warn('WhatsApp webhook aboneliği kurulamadı:',error);showToast('Gelen mesaj bağlantısı doğrulanamadı: '+hataMesaji(error),'warning')}
}catch(fdWaError){if(!fdWaValid())return;throw fdWaError;}
}
fdWhatsappMesajOnizle=function(){
fdWaAssert(false);

        const mesaj=String(document.getElementById('fdBildirimMesaj')?.value||''),mesajAlan=document.getElementById('fdWhatsappOnizlemeMesaj'),sayac=document.getElementById('fdBildirimKarakterSayisi'),ornek=document.getElementById('fdWhatsappOnizlemeAlicisi');
        const sube=String(document.getElementById('fdBildirimSube')?.value||''),secili=fdBildirimSeciliPersonelIds();
        const personel=(Array.isArray(personeller)?personeller:[]).find(p=>aktifSirketeAit(p)&&(!p.cikisTarihi||String(p.cikisTarihi)==='null')&&(secili.length?secili.includes(String(p.id)):!sube||String(p.sube||'Merkez')===sube));
        const ad=String(personel?.ad||'').trim();
        if(ornek)ornek.textContent=ad?'Örnek alıcı: '+ad+' · Her alıcıya kendi adıyla gönderilir.':'Alıcı adı örnektir; gönderimde kayıtlı personel adı kullanılır.';
        if(mesajAlan)mesajAlan.innerHTML=fdWhatsappMetniBicimle(fdWaManualPreviewText(ad,mesaj));
        if(sayac)sayac.textContent=mesaj.length+' / 500';
    };
// Keep this pure projection identical to server personnel-message.ts. Tests compare
// both template delivery and the recent-inbound text path; no sending occurs here.
function fdWaManualPreviewText(name,message){
    const signature='Kanal Mermer bildirim sisteminden gönderilmiştir.';
    let content=String(message||'').trim();
    for(const prefix of ['Sayın '+name+',',name+',']){
        if(name&&content.slice(0,prefix.length).toLocaleLowerCase('tr-TR')===prefix.toLocaleLowerCase('tr-TR')){content=content.slice(prefix.length).trimStart();break}
    }
    if(content.endsWith(signature))content=content.slice(0,-signature.length).trimEnd();
    const parameter=value=>String(value||'').replace(/[\r\n\t]+/g,' ').replace(/ {4,}/g,' ').trim();
    return 'Sayın '+parameter(String(name||'Personel').slice(0,120))+',\n'+parameter(content.slice(0,500))+'\n'+signature;
}
fdWhatsappMesajFormunuTemizle=function(){
fdWaAssert(false);
const baslik=document.getElementById('fdBildirimBaslik'),mesaj=document.getElementById('fdBildirimMesaj');if(baslik)baslik.value='';if(mesaj)mesaj.value='';fdWhatsappMesajOnizle();mesaj?.focus()};
function fdBildirimPlanZamaniVarsayilan(force=false){
fdWaAssert();
const input=document.getElementById('fdBildirimPlanZamani');if(!input||(!force&&input.value))return;const date=new Date(Date.now()+60*60*1000);date.setMinutes(Math.ceil(date.getMinutes()/5)*5,0,0);input.value=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')+'T'+String(date.getHours()).padStart(2,'0')+':'+String(date.getMinutes()).padStart(2,'0')}
fdBildirimModuDegisti=function(mode){
fdWaAssert(false);
const modal=document.getElementById('modalBildirimGonder'),planned=mode==='scheduled',instantButton=document.getElementById('fdBildirimModuAnlik'),plannedButton=document.getElementById('fdBildirimModuPlanli'),settings=document.getElementById('fdBildirimPlanAyarlari'),submit=document.getElementById('fdBildirimGonderBtn');if(!modal)return;modal.dataset.mode=planned?'scheduled':'instant';instantButton?.classList.toggle('active',!planned);plannedButton?.classList.toggle('active',planned);if(settings)settings.style.display=planned?'block':'none';if(submit)submit.textContent=planned?'💬 WhatsApp Mesajını Planla':'💬 WhatsApp\'tan Gönder';if(planned)fdBildirimPlanZamaniVarsayilan()};
fdBildirimPlanDuzenlemeAc=function(item){
fdWaAssert(false);
const modal=document.getElementById('modalBildirimGonder');if(!modal||!item)return;const planId=document.getElementById('fdBildirimPlanId'),title=document.getElementById('fdBildirimBaslik'),message=document.getElementById('fdBildirimMesaj'),at=document.getElementById('fdBildirimPlanZamani');if(planId)planId.value=String(item.id||'');if(title)title.value=String(item.title||'');if(message)message.value=String(item.message||'');if(at){const date=new Date(item.scheduled_for);if(!Number.isNaN(date.getTime())){at.value=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')+'T'+String(date.getHours()).padStart(2,'0')+':'+String(date.getMinutes()).padStart(2,'0')}}fdBildirimModuDegisti('scheduled');fdBildirimSeciliIdler.clear();(Array.isArray(item.target_employee_ids)?item.target_employee_ids:[]).forEach(id=>fdBildirimSeciliIdler.add(String(id)));fdBildirimPersonelleriniDoldur(false);fdBildirimHedefOzetiniGuncelle();fdWhatsappMesajOnizle()};
openBildirimModal=async function(options={}){
try{
fdWaAssert(false);

        if(!isManagerUser()||!anaMenuModulErisimiVar('bildirim'))return showToast('WhatsApp mesajları için erişim yetkiniz yok.','warning');
        const alan=document.getElementById('whatsappMesajApp'),kabuk=document.getElementById('modalBildirimGonder'),sayac=document.getElementById('fdBildirimCihazSayisi');if(!alan||!kabuk)return;
        const oturum=fdWhatsappKuyrukOturumAnahtari(),ilkAcilis=fdWhatsappCalismaOturumu!==oturum;if(ilkAcilis){fdWhatsappCalismaAlaniniSifirla();fdWhatsappCalismaOturumu=oturum;fdBildirimModuDegisti('instant')}
        const surum=fdWhatsappCalismaYuklemeSurumu,acilis=++fdWhatsappCalismaAcilisSurumu;
        document.querySelectorAll('.modal-overlay').forEach(pencere=>{if(pencere.id!=='modalZorunluSifre')pencere.style.display='none'});fdTumUygulamaAlanlariniGizle();alan.style.display='block';kabuk.style.display='block';personelModuluYetkiGorunumunuUygula('bildirim');anaMenuDonusButonunuGoster();
        fdBildirimHedefleriniDoldur();fdWhatsappMesajOnizle();if(ilkAcilis&&sayac)sayac.textContent='Kontrol ediliyor...';
        const sekme=options?.item?'send':options?.preserveTab&&!ilkAcilis?(kabuk.dataset.tab||'inbox'):(options?.tab||'send');fdWhatsappSekmeAc(sekme);if(options?.item)fdBildirimPlanDuzenlemeAc(options.item);
        if(typeof fdSekmeyiKaydet==='function'){const kayit=fdSekmeyiKaydet('bildirim','openWhatsappMesajlari');kayit.alanId='whatsappMesajApp'}
        try{const sonuc=await fdWaAwait(whatsappCagir({action:'config'}));if(acilis!==fdWhatsappCalismaAcilisSurumu||!fdWhatsappCalismaGecerli(oturum,surum))return;if(sayac)sayac.textContent=sonuc.whatsappRecipientCount+' personel'+(sonuc.missingPhoneCount?' · '+sonuc.missingPhoneCount+' telefonsuz':'');fdWhatsappRozetiniGuncelle(sonuc.inboxUnreadCount);fdWhatsappKuyrukYukle(true);if(sekme==='inbox')await fdWaAwait(fdWhatsappWebhookunuDogrula());if(fdWhatsappCalismaGecerli(oturum,surum)&&!sonuc.configured)showToast('WhatsApp sunucu anahtarı ve şablonu henüz etkinleştirilmedi.','warning')}catch(error){if(!fdWaValid())return;
if(acilis!==fdWhatsappCalismaAcilisSurumu||!fdWhatsappCalismaGecerli(oturum,surum))return;if(sayac)sayac.textContent='Alınamadı';showToast(hataMesaji(error),'error')}
    
}catch(fdWaError){if(!fdWaValid())return;throw fdWaError;}
};
fdBildirimHedefleriniDoldur=function(){
fdWaAssert(false);

        const secim=document.getElementById('fdBildirimSube');if(!secim)return;
        const onceki=secim.value,aktifler=(Array.isArray(personeller)?personeller:[]).filter(p=>aktifSirketeAit(p)&&(!p.cikisTarihi||String(p.cikisTarihi)==='null'));
        const adlar=[...new Set(aktifler.map(p=>String(p.sube||'Merkez').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));
        secim.innerHTML='<option value="">Tüm Şubeler</option>'+adlar.map(ad=>'<option value="'+escapeDashboardText(ad)+'">'+escapeDashboardText(ad)+'</option>').join('');
        if(adlar.includes(onceki))secim.value=onceki;fdBildirimPersonelleriniDoldur(false);
    };
fdBildirimPersonelleriniDoldur=function(secimleriOku=true){
fdWaAssert(false);

        if(secimleriOku)fdBildirimSecimleriSenkronla();const sube=String(document.getElementById('fdBildirimSube')?.value||''),arama=String(document.getElementById('fdBildirimPersonelAra')?.value||'').trim().toLocaleLowerCase('tr-TR'),alan=document.getElementById('fdBildirimPersonelListesi');if(!alan)return;
        const liste=(Array.isArray(personeller)?personeller:[]).filter(p=>aktifSirketeAit(p)&&(!p.cikisTarihi||String(p.cikisTarihi)==='null')&&(!sube||String(p.sube||'Merkez')===sube)&&(!arama||[p.ad,p.gorev,p.sube].join(' ').toLocaleLowerCase('tr-TR').includes(arama))).sort((a,b)=>String(a.ad||'').localeCompare(String(b.ad||''),'tr'));
        alan.innerHTML=liste.length?liste.map(p=>'<label><input type="checkbox" class="fd-bildirim-personel-sec" value="'+escapeDashboardText(String(p.id))+'" '+(fdBildirimSeciliIdler.has(String(p.id))?'checked':'')+' onchange="fdBildirimHedefOzetiniGuncelle()"><span><strong>'+escapeDashboardText(p.ad||'-')+'</strong><small style="display:block;margin-top:2px;color:#64748b">'+escapeDashboardText([p.sube||'Merkez',p.gorev||'Görev belirtilmemiş'].join(' · '))+'</small></span></label>').join(''):'<div class="push-personel-empty">Aramanıza uygun aktif personel bulunamadı.</div>';
        fdBildirimHedefOzetiniGuncelle();
    };
function fdBildirimSecimleriSenkronla(){
fdWaAssert();
document.querySelectorAll('#fdBildirimPersonelListesi .fd-bildirim-personel-sec').forEach(kutu=>{const id=String(kutu.value);if(kutu.checked)fdBildirimSeciliIdler.add(id);else fdBildirimSeciliIdler.delete(id)})}
fdBildirimSeciliPersonelIds=function(){
fdWaAssert(false);
fdBildirimSecimleriSenkronla();return[...fdBildirimSeciliIdler]};
fdBildirimTumPersonelleriSec=function(secili){
fdWaAssert(false);
if(!secili)fdBildirimSeciliIdler.clear();document.querySelectorAll('#fdBildirimPersonelListesi .fd-bildirim-personel-sec').forEach(kutu=>kutu.checked=secili);fdBildirimSecimleriSenkronla();fdBildirimHedefOzetiniGuncelle()};
fdBildirimHedefOzetiniGuncelle=function(){
fdWaAssert(false);

        const sube=String(document.getElementById('fdBildirimSube')?.value||''),secili=fdBildirimSeciliPersonelIds(),alan=document.getElementById('fdBildirimHedefOzeti'),rozet=document.getElementById('fdBildirimSecimRozeti'),onizleme=document.getElementById('fdWhatsappOnizlemeHedefi');
        const hedef=secili.length?(secili.length+' seçili personel'):(sube?sube+' şubesi':'Tüm aktif personel');if(rozet)rozet.textContent=secili.length?(secili.length+' seçili'):(sube?'Şube':'Tümü');if(onizleme)onizleme.textContent=hedef;
        if(alan)alan.textContent=secili.length?('Mesaj seçilen '+secili.length+' personelin kayıtlı WhatsApp numarasına gönderilecek.'):(sube?'Personel seçmezseniz '+sube+' şubesindeki telefonu kayıtlı aktif personellere gönderilecek.':'Personel seçmezseniz telefonu kayıtlı tüm aktif personellere gönderilecek.');
        fdWhatsappMesajOnizle();
    };
function fdBildirimAliciAdi(alici){
fdWaAssert();
const id=String(alici.employee_legacy_id||''),personel=(Array.isArray(personeller)?personeller:[]).find(p=>String(p.id)===id);return personel?.ad||('Kullanıcı '+id.slice(-4))}
function fdWhatsappHataMetniDuzelt(deger){
fdWaAssert();
const metin=String(deger||'').trim();if(!metin)return 'WhatsApp mesajı gönderilemedi.';if(metin.includes('132001')||/template name does not exist/i.test(metin))return 'Mesaj şablonu Meta onayında; onay tamamlanınca gönderilebilir.';if(metin.includes('131049')||/not delivered to maintain healthy ecosystem engagement/i.test(metin))return 'Meta bu alıcı için mesaj teslimini kısıtladı. Yalnızca gönderimi yavaşlatmak bunu kesin olarak çözmez. Tekrar denendiğinde en az 24 saat 1 dakika bekletilir.';if(/130429|131056|rate limit/i.test(metin))return 'WhatsApp gönderim hız sınırı. Mesaj daha uzun bekleme ile kuyrukta tekrar denenir.';if(metin.includes('131026')||/message undeliverable/i.test(metin))return 'Mesaj bu WhatsApp numarasına ulaştırılamadı.';return metin}
function fdWhatsappGonderimSonucuGoster(sonuc){
fdWaAssert();

        if(sonuc.skippedBySettings){showToast('Bu bildirim türü şirket ayarlarında kapalı olduğu için gönderilmedi.','info');return}if(sonuc.atlandi||sonuc.skippedByPreference){showToast('Personelin mesaj tercihi kapalı olduğu için gönderilmedi.','info');if(!sonuc.queued&&!sonuc.sent&&!sonuc.alreadyQueued&&!sonuc.alreadySent)return}
        if(sonuc.queued||sonuc.alreadyQueued){showToast((sonuc.queued?sonuc.queued+' mesaj gönderim kuyruğuna eklendi.':'Mesaj zaten gönderim kuyruğunda.')+' Gönderim Kuyruğu sekmesinden takip edebilirsiniz.','success');fdWhatsappKuyrukYukle(true);return}
        if(sonuc.alreadySent){showToast('Bu mesaj gönderilmiş; çift mesaj oluşturmamak için tekrar gönderilmedi.','info');return}
        if(sonuc.sent){showToast(sonuc.sent+' personele WhatsApp mesajı gönderildi.','success');return}
        const hata=sonuc.failureReasons?.[0]?.error_message;showToast(hata?fdWhatsappHataMetniDuzelt(hata):'Yeniden gönderilecek başarısız mesaj bulunmuyor.','warning')
    }
fdWhatsappGidenPersonelleriniDoldur=function(){
fdWaAssert(false);

        const secim=document.getElementById('fdWhatsappGidenPersonel');if(!secim)return;const onceki=String(secim.value||''),tum=(Array.isArray(personeller)?personeller:[]).filter(p=>aktifSirketeAit(p)),sirala=(a,b)=>String(a.ad||'').localeCompare(String(b.ad||''),'tr'),aktif=tum.filter(p=>!p.cikisTarihi||String(p.cikisTarihi)==='null').sort(sirala),ayrilan=tum.filter(p=>p.cikisTarihi&&String(p.cikisTarihi)!=='null').sort(sirala),secenekler=liste=>liste.map(p=>'<option value="'+escapeDashboardText(String(p.id||''))+'">'+escapeDashboardText(String(p.ad||p.id||'-'))+'</option>').join('');
        secim.innerHTML='<option value="">Personel seçin</option>'+(aktif.length?'<optgroup label="Aktif Personeller">'+secenekler(aktif)+'</optgroup>':'')+(ayrilan.length?'<optgroup label="Ayrılan Personeller">'+secenekler(ayrilan)+'</optgroup>':'');if(tum.some(p=>String(p.id)===onceki))secim.value=onceki;
    };
fdBildirimGecmisiniYukle=async function(zorla=false){
try{
fdWaAssert(false);

        const alan=document.getElementById('fdBildirimGecmisi'),employeeId=String(document.getElementById('fdWhatsappGidenPersonel')?.value||'');if(!alan||alan.dataset.loading==='1')return;if(!employeeId){alan.innerHTML='<div class="push-personel-empty">Geçmişini görmek için bir personel seçin.</div>';return}if(!zorla&&alan.dataset.employeeId===employeeId&&alan.dataset.loaded==='1')return;alan.dataset.loading='1';alan.dataset.employeeId=employeeId;alan.innerHTML='<div class="push-personel-empty">Gönderim geçmişi yükleniyor...</div>';
        try{
            const sonuc=await fdWaAwait(whatsappCagir({action:'history',employeeId})),alicilar=Array.isArray(sonuc.recipients)?sonuc.recipients:[],bildirimler=Array.isArray(sonuc.notifications)?sonuc.notifications:[];
            alan.innerHTML=bildirimler.length?bildirimler.map(b=>{const alici=alicilar.find(a=>String(a.notification_id)===String(b.id))||{},hata=alici.status==='failed'?fdWhatsappHataMetniDuzelt(alici.error_message):'',durum=alici.read_at||alici.status==='read'?'Okundu':(alici.delivered_at||alici.status==='delivered'?'Teslim edildi':(alici.status==='sent'?'Gönderildi':(alici.status==='failed'?'Gönderilemedi':'Bekliyor'))),sinif=alici.read_at||alici.status==='read'?'read':(alici.delivered_at||alici.status==='delivered'?'unread':'undelivered'),teslimZamani=alici.delivered_at?fdBildirimTarihi(alici.delivered_at):'Henüz teslim edilmedi',okunmaZamani=alici.read_at?fdBildirimTarihi(alici.read_at):'Henüz okunmadı';return '<details class="push-history-item"><summary><span><strong>'+escapeDashboardText(b.title||'Bilgilendirme')+'</strong><small>'+fdBildirimTarihi(b.created_at)+'</small></span><b class="push-history-count">'+durum+'</b></summary><div class="push-history-detail">'+fdWhatsappGidenIcerigi(b,alici)+'<div class="push-receipt-list"><div class="push-receipt '+sinif+'"><span>'+escapeDashboardText(alici.employee_name||fdBildirimAliciAdi(alici))+(hata?'<small style="display:block;margin-top:3px;color:#b45309;white-space:normal">'+escapeDashboardText(hata)+'</small>':'')+'</span><div class="push-receipt-times"><span class="push-receipt-time delivery-time"><span>Teslim:</span><strong>'+escapeDashboardText(teslimZamani)+'</strong></span><span class="push-receipt-time read-time"><span>Okundu:</span><strong>'+escapeDashboardText(okunmaZamani)+'</strong></span></div></div></div></div></details>'}).join(''):'<div class="push-personel-empty">Seçilen personele gönderilmiş WhatsApp mesajı bulunmuyor.</div>';alan.dataset.loaded='1';
        }catch(error){if(!fdWaValid())return;
delete alan.dataset.loaded;alan.innerHTML='<div class="push-personel-empty" style="color:#b91c1c">'+escapeDashboardText(hataMesaji(error,'Gönderim geçmişi alınamadı.'))+'</div>'}finally{delete alan.dataset.loading}
    
}catch(fdWaError){if(!fdWaValid())return;throw fdWaError;}
};
fdBildirimOkumayanlaraTekrarGonder=async function(event,notificationId,okumayan){
try{
fdWaAssert(true);

        event?.preventDefault();event?.stopPropagation();if(!notificationId||!okumayan)return;
        if(!await fdWaAwait(fdYuzerOnaySor('Bu bildirim okumayan '+okumayan+' personele tekrar gönderilsin mi?','Tekrar Gönder','Gönder')))return;
        const dugme=event?.currentTarget;if(dugme)dugme.disabled=true;fdWaShowOverlay?.('WhatsApp mesajı tekrar gönderiliyor','Yalnızca okumayan personelin numaralarına gönderiliyor...');
        try{const sonuc=await fdWaAwait(whatsappCagir({action:'resend-unread',notificationId}));fdWhatsappGonderimSonucuGoster(sonuc);const alan=document.getElementById('fdBildirimGecmisi');if(alan){delete alan.dataset.loaded;await fdWaAwait(fdBildirimGecmisiniYukle(true))}}
        catch(error){if(!fdWaValid())return;
showToast(hataMesaji(error,'WhatsApp mesajı tekrar gönderilemedi.'),'error');if(dugme)dugme.disabled=false}finally{fdWaHideOverlay?.()}
    
}catch(fdWaError){if(!fdWaValid())return;throw fdWaError;}
};
fdBildirimGonder=async function(event){
try{
fdWaAssert(true);

        event.preventDefault();const oturum=fdWhatsappCalismaOturumu,surum=fdWhatsappCalismaYuklemeSurumu;if(!fdWhatsappCalismaGecerli(oturum,surum))return;
        const modal=document.getElementById('modalBildirimGonder'),mode=modal?.dataset.mode||'instant',planId=String(document.getElementById('fdBildirimPlanId')?.value||''),baslik=document.getElementById('fdBildirimBaslik').value.trim(),mesaj=document.getElementById('fdBildirimMesaj').value.trim(),dugme=document.getElementById('fdBildirimGonderBtn'),sube=String(document.getElementById('fdBildirimSube')?.value||''),seciliPersoneller=fdBildirimSeciliPersonelIds();
        if(!mesaj)return showToast('Gönderilecek mesajı yazın.','warning');
        const hedefPersoneller=seciliPersoneller.length?seciliPersoneller:(sube?(Array.isArray(personeller)?personeller:[]).filter(p=>aktifSirketeAit(p)&&(!p.cikisTarihi||String(p.cikisTarihi)==='null')&&String(p.sube||'Merkez')===sube).map(p=>String(p.id)):[]),hedefModu=(seciliPersoneller.length||sube)?'selection':'all';
        const hedefMetni=seciliPersoneller.length?(seciliPersoneller.length+' seçili personel'):(sube?sube+' şubesi':'tüm şirket');
        if(mode==='scheduled'){
            const localTime=String(document.getElementById('fdBildirimPlanZamani')?.value||''),when=new Date(localTime);if(!localTime||Number.isNaN(when.getTime())||when.getTime()<Date.now()+30000)return showToast('Gelecekte bir gönderim zamanı seçin.','warning');
            if(!await fdWaAwait(fdYuzerOnaySor('Bildirim '+fdBildirimTarihi(when.toISOString())+' tarihinde '+hedefMetni+' hedefine planlansın mı?',planId?'Planlı Bildirimi Güncelle':'Bildirimi Planla',planId?'Güncelle':'Planla')))return;
            if(!fdWhatsappCalismaGecerli(oturum,surum))return;dugme.disabled=true;fdWaShowOverlay?.(planId?'Bildirim planı güncelleniyor':'Bildirim planlanıyor','Plan kaydı güvenli biçimde kaydediliyor...');
            try{if(typeof window.fdxPlanliBildirimApi!=='function')throw new Error('Planlı WhatsApp bağlantısı hazır değil.');const sonuc=await fdWaAwait(fdWaPlan({action:planId?'schedule-update':'schedule-create',...(planId?{id:planId}:{}),title:baslik,message:mesaj,scheduledFor:when.toISOString(),audienceMode:hedefModu,targetEmployeeIds:hedefPersoneller}));if(!fdWhatsappCalismaGecerli(oturum,surum))return;showToast(sonuc.atlandi?'Personelin mesaj tercihi kapalı olduğu için mesaj planlanmadı.':sonuc.skippedByPreferenceCount?('WhatsApp mesajı planlandı. Tercihi kapalı '+sonuc.skippedByPreferenceCount+' personel hedefe eklenmedi.'):sonuc.ignoredTargetCount?('WhatsApp mesajı planlandı. Geçerli telefonu olmayan '+sonuc.ignoredTargetCount+' personel hedefe eklenmedi.'):planId?'WhatsApp mesaj planı güncellendi.':'WhatsApp mesajı planlandı.',sonuc.atlandi?'info':sonuc.ignoredTargetCount?'warning':'success');if(typeof window.fdxPlanlariYukle==='function')await fdWaAwait(window.fdxPlanlariYukle());if(!fdWhatsappCalismaGecerli(oturum,surum))return;if(planId)document.getElementById('fdBildirimPlanId').value='';fdBildirimModuDegisti('instant');document.getElementById('fdBildirimMesaj').value='';fdWhatsappMesajOnizle();fdWhatsappKuyrukHazir=false;const liste=document.getElementById('fdWhatsappKuyrukListesi');if(liste)delete liste.dataset.loaded;fdWhatsappSekmeAc('queue')}catch(error){if(!fdWaValid())return;
if(!fdWhatsappCalismaGecerli(oturum,surum))return;showToast(hataMesaji(error,'WhatsApp mesajı planlanamadı.'),'error')}finally{if(fdWhatsappCalismaGecerli(oturum,surum))dugme.disabled=false;fdWaHideOverlay?.()}
            return;
        }
        if(!await fdWaAwait(fdYuzerOnaySor('WhatsApp mesajı '+hedefMetni+' hedefine gönderilsin mi?','WhatsApp Mesajı Gönder','Gönder')))return;
        if(!fdWhatsappCalismaGecerli(oturum,surum))return;dugme.disabled=true;fdWaShowOverlay?.('WhatsApp mesajı gönderiliyor','Kayıtlı personel numaralarına ulaştırılıyor...');
        try{const sonuc=await fdWaAwait(whatsappCagir({action:'send',title:baslik,message:mesaj,targetMode:hedefModu,targetEmployeeIds:hedefPersoneller}));if(!fdWhatsappCalismaGecerli(oturum,surum))return;fdWhatsappGonderimSonucuGoster(sonuc);document.getElementById('fdBildirimMesaj').value='';fdWhatsappMesajOnizle();document.getElementById('fdBildirimCihazSayisi').textContent=sonuc.total+' WhatsApp alıcısı';fdWhatsappKonusmalarYuklendi=false;fdWhatsappSohbetGidenleri.clear();fdWhatsappSohbetYuklenenler.clear();const gecmis=document.getElementById('fdBildirimGecmisi');if(gecmis)delete gecmis.dataset.loaded}
        catch(error){if(!fdWaValid())return;
if(!fdWhatsappCalismaGecerli(oturum,surum))return;showToast(hataMesaji(error,'WhatsApp mesajı gönderilemedi.'),'error')}finally{if(fdWhatsappCalismaGecerli(oturum,surum))dugme.disabled=false;fdWaHideOverlay?.()}
    
}catch(fdWaError){if(!fdWaValid())return;throw fdWaError;}
};
return{init(){fdWaAssert();window.fdSupplementalOutputInstall?.();window.fdUnifiedOutput?.scan()},open(options){fdWaAssert();return openBildirimModal(options||{tab:'inbox',preserveTab:true})},api:{get fdWhatsappCalismaOturumuDegisti(){return fdWhatsappCalismaOturumuDegisti},get fdWhatsappCalismaAlaniniSifirla(){return fdWhatsappCalismaAlaniniSifirla},get fdWhatsappGelenKutusuCiz(){return fdWhatsappGelenKutusuCiz},get fdWhatsappKonusmaAc(){return fdWhatsappKonusmaAc},get fdWhatsappBasarisizMesajiTekrarGonder(){return fdWhatsappBasarisizMesajiTekrarGonder},get fdWhatsappGelenKutusuYukle(){return fdWhatsappGelenKutusuYukle},get fdWhatsappKisiyeMesajHazirla(){return fdWhatsappKisiyeMesajHazirla},get fdWhatsappKuyrukSec(){return fdWhatsappKuyrukSec},get fdWhatsappKuyrukTumunuSec(){return fdWhatsappKuyrukTumunuSec},get fdWhatsappKuyrukDuzenle(){return fdWhatsappKuyrukDuzenle},get fdWhatsappKuyrukYukle(){return fdWhatsappKuyrukYukle},get fdWhatsappKuyrukDuraklat(){return fdWhatsappKuyrukDuraklat},get fdWhatsappKuyrukSecilenleriSil(){return fdWhatsappKuyrukSecilenleriSil},get fdWhatsappKuyrukIptal(){return fdWhatsappKuyrukIptal},get fdWhatsappSekmeAc(){return fdWhatsappSekmeAc},get fdWhatsappMesajOnizle(){return fdWhatsappMesajOnizle},get fdWhatsappMesajFormunuTemizle(){return fdWhatsappMesajFormunuTemizle},get fdBildirimModuDegisti(){return fdBildirimModuDegisti},get fdBildirimPlanDuzenlemeAc(){return fdBildirimPlanDuzenlemeAc},get fdBildirimHedefleriniDoldur(){return fdBildirimHedefleriniDoldur},get fdBildirimPersonelleriniDoldur(){return fdBildirimPersonelleriniDoldur},get fdBildirimSeciliPersonelIds(){return fdBildirimSeciliPersonelIds},get fdBildirimTumPersonelleriSec(){return fdBildirimTumPersonelleriSec},get fdBildirimHedefOzetiniGuncelle(){return fdBildirimHedefOzetiniGuncelle},get fdWhatsappGidenPersonelleriniDoldur(){return fdWhatsappGidenPersonelleriniDoldur},get fdBildirimGecmisiniYukle(){return fdBildirimGecmisiniYukle},get fdBildirimOkumayanlaraTekrarGonder(){return fdBildirimOkumayanlaraTekrarGonder},get fdBildirimGonder(){return fdBildirimGonder}},dispose(){fdWaHideOverlay();fdWaDisposed=true;fdWhatsappCalismaYuklemeSurumu++;fdWhatsappCalismaAcilisSurumu++;fdWhatsappGelenYuklemeSurumu++;fdWhatsappKuyrukYuklemeSira++;for(const id of fdWaTimers)window.clearTimeout(id);fdWaTimers.clear();fdWhatsappGelenMesajlar=[];fdWhatsappGidenOzetleri=[];fdWhatsappKuyrukKayitlari=[];fdWhatsappSohbetGidenleri.clear();fdWhatsappSohbetYuklenenler.clear();fdWhatsappSohbetIstekleri.clear();fdBildirimSeciliIdler.clear();fdWhatsappKuyrukSecimleri.clear();if(typeof fdAcikUygulamaSekmeleri!=='undefined')for(const tab of fdAcikUygulamaSekmeleri)if(tab.alanId==='whatsappMesajApp')tab.alanId='';}};
});
