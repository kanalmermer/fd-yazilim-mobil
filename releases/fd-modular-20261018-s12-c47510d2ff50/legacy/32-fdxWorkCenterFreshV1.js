
(function(){
    'use strict';
    const FDX_ENDPOINT='work-center-v2';
    const fdxState={tab:'requests',requests:[],myRequests:[],closures:[],schedules:[],audit:[],auditPage:1,auditPageSize:20,auditTotal:0,auditModules:[],auditActors:[],auditHasSystemActor:false,closureCheck:null,reviewId:'',auditId:'',auditDetail:null};
    try{
        if(typeof fdUygulamaSekmeTanimlari==='object')fdUygulamaSekmeTanimlari.workCenter={ad:'Denetim Merkezi',ikon:'🎯',acilis:'openWorkCenterApp'};
        if(typeof fdSekmeFonksiyonlari==='object')fdSekmeFonksiyonlari.openWorkCenterApp='workCenter';
        if(typeof fdSekmeAlanlari==='object'&&!fdSekmeAlanlari.includes('workCenterApp'))fdSekmeAlanlari.push('workCenterApp');
    }catch(_){ }
    window.openWorkCenterApp=function(){return window.fdxIsMerkeziAc?.()};
    const fdxStatus={pending:'Bekliyor',approved:'Onaylandı',rejected:'Reddedildi',cancelled:'İptal Edildi',processing:'Gönderiliyor',sent:'Gönderildi',failed:'Başarısız',locked:'Kapalı',open:'Açık'};
    const fdxRequestTypes={leave:'İzin',advance:'Avans',attendance:'Giriş–Çıkış Düzeltme'};
    const fdxModules={personeller:'Personel',izinler:'İzin',puantaj:'Puantaj',avanslar:'Avans',icralar:'İcra',vardiya:'Giriş–Çıkış / Vardiya',ekodemeler:'Ek Ödeme',ekOdemeler:'Ek Ödeme',kkd:'KKD',araclar:'Araç',akaryakit:'Akaryakıt',policeler:'Poliçe',irsaliyeler:'İrsaliye',kiratakip:'Kira',tapu:'Tapu',taputakip:'Tapu / ÇKS',evrak:'Evrak',evraktakip:'Evrak',ihracat:'İhracat',sirketler:'Şirket',subeler:'Şube'};
    const fdxRecordTypes={magicpassHareket:'Giriş–çıkış cihaz hareketi',magicpassDuzeltme:'Manuel giriş–çıkış düzeltmesi',magicpassGunTuru:'Personel çalışma günü ayarı',magicpassGunTuruGenel:'Genel çalışma günü ayarı',vardiyaAtama:'Günlük vardiya ataması',vardiyaIslem:'Toplu vardiya işlemi',maasOzet:'Maaş özeti',primAyar:'Prim ayarı',primOzet:'Prim özeti',ucretPusulasi:'Ücret pusulası',cks:'ÇKS kaydı',cksBelge:'ÇKS belgesi',cksBos:'ÇKS verilmeyen parsel',tapu:'Tapu kaydı',tapuArsiv:'Arşivlenmiş tapu kaydı',aktarim:'Aktarım kaydı'};
    const fdxFieldLabels={pId:'Personel',personelId:'Personel',employeeId:'Personel',employee_legacy_id:'Personel',kayitTipi:'Kayıt türü',ad:'Ad Soyad',soyad:'Soyad',personelAd:'Personel',unvan:'Unvan',firma:'Firma',sirket:'Şirket',sube:'Şube',departman:'Departman',gorev:'Görev',rol:'Rol',tarih:'Tarih',zamanDamgasi:'Hareket zamanı',haftaBaslangic:'Hafta başlangıcı',baslangic:'Başlangıç',bitis:'Bitiş',iseBaslama:'İşe başlama',tur:'Tür',donem:'Dönem',ay:'Ay',yil:'Yıl',gun:'Gün',durum:'Durum',status:'Durum',aciklama:'Açıklama',not:'Not',vardiya:'Vardiya',giris:'Giriş saati',cikis:'Çıkış saati',girisZamani:'Giriş zamanı',cikisZamani:'Çıkış zamanı',cihazNo:'Cihaz numarası',kaynakDosya:'Kaynak dosya',tutar:'Tutar',taksitSayisi:'Taksit sayısı',baslangicAy:'Başlangıç ayı',dosyaNo:'Dosya numarası',alacakliKurum:'Alacaklı kurum',toplamBorc:'Toplam borç',kalanBorc:'Kalan borç',odenenTutar:'Ödenen tutar',kesintiTutari:'Kesinti tutarı',plaka:'Plaka',marka:'Marka',model:'Model',yilModel:'Model yılı',irsaliyeNo:'İrsaliye numarası',miktar:'Miktar',birim:'Birim',fiyat:'Birim fiyat',faturaNo:'Fatura numarası',faturaTarih:'Fatura tarihi',faturaAciklamasi:'Fatura açıklaması',belgeNo:'Belge numarası',policeNo:'Poliçe numarası',telefon:'Telefon',email:'E-posta',adres:'Adres',cikisTarihi:'İşten çıkış tarihi',girisTarihi:'İşe giriş tarihi',title:'Başlık',message:'Mesaj',scheduled_for:'Gönderim zamanı',audience_mode:'Hedef türü',target_employee_ids:'Hedef personeller',request_type:'Talep türü',request_data:'Talep bilgileri',manager_note:'Yönetici notu',summary:'Kontrol özeti',satirSayilari:'Vardiya satır sayıları',satirlar:'Vardiya personel listesi',primHakki:'Prim hakkı',primHakkiManuel:'Prim hakkı belirleme yöntemi',calisilmayanGun:'Çalışılmayan gün',primTutari:'Prim tutarı',primTutariManuel:'Prim tutarı belirleme yöntemi',fazlaMesaiSaati:'Fazla mesai saati',fazlaMesaiSaatiManuel:'Fazla mesai belirleme yöntemi',pazarMesaiSaati:'Pazar mesaisi saati',pazarMesaiSaatiManuel:'Pazar mesaisi belirleme yöntemi',resmiTatilMesaiSaati:'Resmî tatil mesaisi saati',resmiTatilMesaiSaatiManuel:'Resmî tatil mesaisi belirleme yöntemi',toplamUcretGunu:'Toplam ücret günü',gunlukYevmiye:'Günlük yevmiye',toplamUcret:'Toplam ücret',toplamMaas:'Toplam maaş',avansKesintisi:'Avans kesintisi',icraKesintisi:'İcra kesintisi',izinGunSayisi:'İzin gün sayısı',gunSayisi:'Gün sayısı',izinTuru:'İzin türü',yillikIzin:'Yıllık izin',kalanIzin:'Kalan izin',hakEdilenIzin:'Hak edilen izin',seriNo:'Seri numarası',beden:'Beden',adet:'Adet',teslimTarihi:'Teslim tarihi',iadeTarihi:'İade tarihi',muayeneBitis:'Muayene bitiş tarihi',egzozMuayeneBitis:'Egzoz muayenesi bitiş tarihi',sigortaBitis:'Sigorta bitiş tarihi',kaskoBitis:'Kasko bitiş tarihi',baslangicTarihi:'Başlangıç tarihi',bitisTarihi:'Bitiş tarihi',odemeTarihi:'Ödeme tarihi',vadeTarihi:'Vade tarihi',kiraTutari:'Kira tutarı',malik:'Malik',kiraci:'Kiracı',mahalle:'Mahalle',ada:'Ada',parsel:'Parsel',alan:'Alan',nitelik:'Nitelik',urun:'Ürün',ulke:'Ülke',musteri:'Müşteri',konteynerNo:'Konteyner numarası',beyannameNo:'Beyanname numarası',aktif:'Aktif',manuel:'Manuel işlem',odendi:'Ödendi',faturali:'Faturalı',onaylandi:'Onaylandı'};
    Object.assign(fdxFieldLabels,{evrakAdi:'Evrak adı',kategoriId:'Evrak kategorisi',kategoriAdi:'Kategori',dosya:'Dosya',surumNo:'Sürüm numarası',surumGecmisi:'Önceki sürümler',normalSaat:'Normal çalışma saati',normalMesaiSaati:'Normal çalışma saati',calismaSaati:'Çalışma saati',toplamSaat:'Toplam saat',mesaiSaati:'Fazla mesai saati',toplamMesai:'Toplam mesai',eksikSaat:'Eksik saat',besKesintisi:'BES kesintisi',kiraciAd:'Kiracı',aboneNo:'Abone numarası',foto:'Fotoğraf',belgeler:'Belgeler',trafikCezalari:'Trafik cezaları',bakimlar:'Bakım kayıtları'});
    const fdxAuditIgnoredFields=new Set(['id','kayitTipi','sirketId','company_id','created_at','updated_at','sonGuncelleme','sonGuncelleyen','guncellemeZamani','zaman','faturaGrupId','legacy_id','actor_user_id','actor_employee_legacy_id']);
    ['url','webViewLink','mimeType','boyut','base64','denetimOnceki'].forEach(key=>fdxAuditIgnoredFields.add(key));
    const fdxAuditBooleanFields=new Set(['aktif','pasif','manuel','odendi','faturali','onaylandi','primHakkiManuel','primTutariManuel','fazlaMesaiSaatiManuel','pazarMesaiSaatiManuel','resmiTatilMesaiSaatiManuel','manuelPersonel']);

    function fdxEsc(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
    function fdxManager(){try{return typeof isManagerUser==='function'&&isManagerUser()}catch(_){return false}}
    function fdxPersonel(){try{return Boolean(activeUser&&activeUser.rol==='Personel')}catch(_){return false}}
    function fdxAktifPersoneller(){try{return (Array.isArray(personeller)?personeller:[]).filter(p=>aktifSirketeAit(p)&&(!p.cikisTarihi||String(p.cikisTarihi)==='null')).sort((a,b)=>String(a.ad||'').localeCompare(String(b.ad||''),'tr'))}catch(_){return []}}
    function fdxTarihSaat(value){if(!value)return '-';const date=new Date(value);return Number.isNaN(date.getTime())?fdxEsc(value):date.toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}
    function fdxTarih(value){if(!value)return '-';try{return typeof tarihFormati==='function'?tarihFormati(value):new Date(value+'T00:00:00').toLocaleDateString('tr-TR')}catch(_){return String(value)}}
    function fdxPara(value){const number=Number(value||0);return Number.isFinite(number)?number.toLocaleString('tr-TR',{minimumFractionDigits:0,maximumFractionDigits:2})+' TL':'-'}
    function fdxDurum(status){const key=String(status||'');return '<span class="fdx-badge '+fdxEsc(key)+'">'+fdxEsc(fdxStatus[key]||key||'-')+'</span>'}
    function fdxHata(error,varsayilan='İşlem tamamlanamadı.'){return String(error?.message||varsayilan)}
    function fdxYerelHata(hedef,error){const alan=typeof hedef==='string'?document.getElementById(hedef):hedef;if(alan)alan.innerHTML='<div class="fdx-state error">'+fdxEsc(fdxHata(error))+'</div>'}
    async function fdxOnay(mesaj,baslik='İşlemi Onayla',buton='Onayla'){try{if(typeof fdYuzerOnaySor==='function')return await fdYuzerOnaySor(mesaj,baslik,buton)}catch(_){}return window.confirm(mesaj)}

    async function fdxApi(body){
        if(!window.supabase||typeof supabaseClient==='undefined')throw new Error('Denetim Merkezi bağlantısı kullanılamıyor. Ana kayıtlarınız etkilenmedi.');
        let sessionResult;
        try{sessionResult=await supabaseClient.auth.getSession()}catch(_){throw new Error('Denetim Merkezi bağlantısı doğrulanamadı. Ana program açık kalır ve kayıtlarınız etkilenmez.');}
        const token=sessionResult?.data?.session?.access_token;
        if(sessionResult?.error||!token)throw new Error('Denetim Merkezi bağlantısı doğrulanamadı. Ana program açık kalır ve kayıtlarınız etkilenmez.');
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000);
        try{
            const response=await fetch(SUPABASE_URL+'/functions/v1/'+FDX_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token,'apikey':SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify(body||{}),signal:controller.signal});
            let data={};try{data=await response.json()}catch(_){throw new Error('Denetim Merkezi sunucusundan geçerli yanıt alınamadı.');}
            if(!response.ok||!data?.success){if(response.status===401)throw new Error('Denetim Merkezi bağlantısı doğrulanamadı. Ana ekran ve kayıtlar etkilenmedi.');throw new Error(data?.message||'İşlem tamamlanamadı.');}
            return data;
        }catch(error){if(error?.name==='AbortError')throw new Error('Denetim Merkezi yanıt vermedi. Ana program ve kayıtlar etkilenmedi.');throw error}finally{clearTimeout(timer)}
    }
    window.fdxPlanliBildirimApi=fdxApi;

    const FDX_PDKS_AKTARIM_SAATLERI=['08:30','13:30','17:30','20:30','23:30'];
    function fdxPdksSonrakiAktarim(){const saatler=FDX_PDKS_AKTARIM_SAATLERI,now=new Date(),dakika=now.getHours()*60+now.getMinutes(),sirali=saatler.map(s=>{const p=s.split(':').map(Number);return{metin:s,dakika:p[0]*60+p[1]}}),sonraki=sirali.find(item=>item.dakika>dakika);return sonraki?.metin||'yarın '+saatler[0]}
    function fdxPdksCalismaSaati(value){if(!value)return'Son';const date=new Date(value);if(Number.isNaN(date.getTime()))return'Son';const dakika=date.getHours()*60+date.getMinutes(),saatler=FDX_PDKS_AKTARIM_SAATLERI;let yakin=saatler[0],fark=Infinity;saatler.forEach(s=>{const [h,m]=s.split(':').map(Number),yeni=Math.abs(h*60+m-dakika);if(yeni<fark){fark=yeni;yakin=s}});return fark<=20?yakin:'Son'}
    function fdxPdksDurumCiz(run,today){
        const state=document.getElementById('fdxPdksState'),grid=document.getElementById('fdxPdksGrid'),note=document.getElementById('fdxPdksNote');
        if(!state||!grid||!note)return;
        if(!run){
            state.innerHTML='<span class="fdx-pdks-dot"></span><span>Bugünün ilk aktarımı bekleniyor</span>';
            grid.innerHTML='<div class="fdx-pdks-metric"><span>Son çalışma zamanı</span><strong>—</strong></div><div class="fdx-pdks-metric"><span>Aktarılan kayıt</span><strong>0</strong></div><div class="fdx-pdks-metric"><span>Sonuç</span><strong>Bekleniyor</strong></div><div class="fdx-pdks-metric"><span>Bilgisayar</span><strong>—</strong></div>';
            note.textContent='Henüz aktarım kaydı oluşmadı · Sonraki aktarım: '+fdxPdksSonrakiAktarim();
            return;
        }
        const status=String(run.status||''),ok=status==='success'||status==='ok'||status==='completed',failed=status==='failed'||status==='error',attempt=run.last_attempt_at||run.last_success_at,calisma=fdxPdksCalismaSaati(attempt),eskiGun=Boolean(today&&run.run_date&&String(run.run_date)!==String(today)),labelOnu=eskiGun?'Son ':'';
        const label=ok?labelOnu+calisma+' aktarımı başarılı':failed?labelOnu+calisma+' aktarımı başarısız':'Aktarım durumu bekleniyor',dot=ok?'success':failed?'error':'',count=Math.max(0,Number(run.record_count||0));
        state.innerHTML='<span class="fdx-pdks-dot '+dot+'"></span><span>'+fdxEsc(label)+'</span>';
        grid.innerHTML='<div class="fdx-pdks-metric"><span>Bu çalışmanın zamanı</span><strong>'+fdxEsc(attempt?fdxTarihSaat(attempt):'—')+'</strong></div><div class="fdx-pdks-metric"><span>Bu çalışmada aktarılan</span><strong>'+count+'</strong></div><div class="fdx-pdks-metric"><span>Sonuç</span><strong>'+(ok?(count?count+' yeni hareket':'Yeni hareket yok'):(failed?'Hata':'Bekleniyor'))+'</strong></div><div class="fdx-pdks-metric"><span>Bilgisayar</span><strong>'+fdxEsc(run.machine_name||'—')+'</strong></div>';
        const sonuc=failed&&run.message?String(run.message):(count?count+' yeni hareket personel kayıtlarına işlendi.':'Bu çalışmada yeni aktarılacak hareket bulunmadı.');
        note.textContent=sonuc+(eskiGun?' · Son kayıt: '+fdxTarih(run.run_date):'')+' · Sonraki aktarım: '+fdxPdksSonrakiAktarim();
    }
    let fdxPdksYuklemeSozu=null,fdxPdksSonBasarili=null;
    window.fdxPdksDurumunuYukle=function(){
        const card=document.getElementById('fdxPdksSummary');
        if(!card||!fdxManager()||typeof supabaseClient==='undefined')return Promise.resolve();
        if(fdxPdksYuklemeSozu)return fdxPdksYuklemeSozu;
        const button=document.getElementById('fdxPdksRefresh');if(button)button.disabled=true;
        fdxPdksYuklemeSozu=(async()=>{
            try{
                let sessionResult=await supabaseClient.auth.getSession(),token=sessionResult?.data?.session?.access_token;
                if(!token){sessionResult=await supabaseClient.auth.refreshSession();token=sessionResult?.data?.session?.access_token;}
                if(!token)throw new Error('Oturum doğrulanamadı.');
                const istek=async accessToken=>{
                    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
                    try{return await fetch(SUPABASE_URL+'/functions/v1/pdks-status',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+accessToken,'apikey':SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify({action:'get-pdks-run-status'}),signal:controller.signal})}finally{clearTimeout(timer)}
                };
                let response=await istek(token);
                if(response.status===401){const refreshed=await supabaseClient.auth.refreshSession();token=refreshed?.data?.session?.access_token;if(token)response=await istek(token);}
                let data={};try{data=await response.json()}catch(_){throw new Error('Aktarım durum servisinden geçerli yanıt alınamadı.');}
                if(!response.ok||!data?.success)throw new Error(data?.message||'Aktarım durumu alınamadı.');
                fdxPdksSonBasarili={run:data.run||null,today:data.today||''};
                fdxPdksDurumCiz(fdxPdksSonBasarili.run,fdxPdksSonBasarili.today);
            }catch(error){
                if(fdxPdksSonBasarili){fdxPdksDurumCiz(fdxPdksSonBasarili.run,fdxPdksSonBasarili.today);const note=document.getElementById('fdxPdksNote');if(note)note.textContent+=' · Durum şu anda yenilenemedi.';}
                else fdxPdksDurumCiz({status:'error',message:fdxHata(error,'Aktarım durumu alınamadı.')},'');
            }finally{if(button)button.disabled=false;fdxPdksYuklemeSozu=null;}
        })();
        return fdxPdksYuklemeSozu;
    }
    function fdxPdksKartiniKur(){const card=document.getElementById('fdxPdksSummary');if(!card)return;const manager=fdxManager();card.style.display=manager?'block':'none';if(!manager)return;const saat=document.getElementById('fdxPdksScheduleTimes');if(saat)saat.textContent=FDX_PDKS_AKTARIM_SAATLERI.join(' · ');fdxPdksDurumunuYukle()}
    function fdxKur(){
        if(document.getElementById('fdxWorkCenterModal'))return;
        const launcher=document.querySelector('#appHub .workspace-launcher');
        if(launcher&&!document.getElementById('fdxMyRequestsCard')){
            const requestCard=document.createElement('button');requestCard.type='button';requestCard.id='fdxMyRequestsCard';requestCard.className='workspace-card fdx-personel-card';requestCard.dataset.personelMenu='talepler';requestCard.style.display='none';requestCard.onclick=()=>fdxTaleplerimAc();requestCard.innerHTML='<span class="workspace-card-icon" style="background:linear-gradient(135deg,#7c3aed,#a855f7)" aria-hidden="true">📝</span><span><strong>Taleplerim</strong><small>İzin, avans veya giriş–çıkış düzeltme talebi oluşturun</small></span><b style="color:#7c3aed">Talep oluştur →</b>';launcher.appendChild(requestCard);
        }
        document.body.insertAdjacentHTML('beforeend',fdxModalHtml());
        const oncekiAy=new Date();oncekiAy.setDate(1);oncekiAy.setMonth(oncekiAy.getMonth()-1);const ayKey=oncekiAy.getFullYear()+'-'+String(oncekiAy.getMonth()+1).padStart(2,'0');
        const monthInput=document.getElementById('fdxClosureMonth');if(monthInput)monthInput.value=ayKey;
        fdxPlanVarsayilanZaman();fdxTalepTuruDegisti();fdxGorunumuGuncelle();
        const hub=document.getElementById('appHub');if(hub)new MutationObserver(()=>fdxGorunumuGuncelle()).observe(hub,{attributes:true,attributeFilter:['style','class']});const dashboard=document.getElementById('personelDashboardApp');if(dashboard){const watch=()=>{if(getComputedStyle(dashboard).display!=='none')fdxPdksKartiniKur()};new MutationObserver(watch).observe(dashboard,{attributes:true,attributeFilter:['style','class']});watch()}
    }

    function fdxGorunumuGuncelle(){
        const managerCard=document.getElementById('fdxWorkCenterCard'),requestCard=document.getElementById('fdxMyRequestsCard'),launcher=document.querySelector('#appHub .workspace-launcher');
        if(managerCard){managerCard.style.display=fdxManager()?'grid':'none'}
        if(requestCard){requestCard.style.display=fdxPersonel()?'grid':'none';if(fdxPersonel()&&launcher){if(typeof personelAnaMenuKartlariniSirala==='function')personelAnaMenuKartlariniSirala();else launcher.insertBefore(requestCard,launcher.firstElementChild)}}
        if(!fdxManager()&&!fdxPersonel()){
            ['workCenterApp','fdxWorkCenterModal','fdxMyRequestsModal','fdxReviewModal','fdxAuditDetailModal'].forEach(id=>{const modal=document.getElementById(id);if(modal)modal.style.display='none'});
            fdxState.requests=[];fdxState.myRequests=[];fdxState.closures=[];fdxState.schedules=[];fdxState.audit=[];fdxState.closureCheck=null;fdxState.reviewId='';fdxState.auditId='';
        }
    }

    function fdxModalHtml(){return `
        <div id="workCenterApp" class="fdx-work-center-app"><div id="fdxWorkCenterModal" class="fdx-work-center-shell">
            <div class="modal-header"><div><h3>🎯 Denetim Merkezi</h3><small>Personel taleplerini, dönemleri ve tüm kullanıcı değişikliklerini tek yerden denetleyin.</small></div><button type="button" class="modal-close" onclick="fdxKapat('fdxWorkCenterModal')">✕</button></div>
            <nav class="fdx-tabs"><button type="button" data-fdx-tab="requests" onclick="fdxSekmeAc('requests',this)">📝 Personel Talepleri</button><button type="button" data-fdx-tab="closure" onclick="fdxSekmeAc('closure',this)">📅 Aylık Kapanış</button><button type="button" data-fdx-tab="schedule" onclick="fdxSekmeAc('schedule',this)">🔔 Planlı Bildirimler</button><button type="button" data-fdx-tab="audit" onclick="fdxSekmeAc('audit',this)">🕘 Denetim İzi</button></nav>
            <div class="modal-body">
                <section id="fdxPanelRequests" class="fdx-panel"><div class="fdx-toolbar"><div><h4>Personel Talepleri</h4><p>Personelin gönderdiği talepleri inceleyip sonuçlandırın.</p></div><div class="fdx-toolbar-actions"><select id="fdxRequestStatus" onchange="fdxTalepleriCiz()"><option value="">Tüm durumlar</option><option value="pending">Bekleyenler</option><option value="approved">Onaylananlar</option><option value="rejected">Reddedilenler</option><option value="cancelled">İptal edilenler</option></select><button type="button" class="fdx-btn" onclick="fdxTalepleriYukle()">↻ Yenile</button></div></div><div class="fdx-section-note">Talep onayı ilgili kaydı otomatik değiştirmez. Önce talebi onaylayın, ardından gerekli kaydı kendi ekranından kontrollü biçimde oluşturun.</div><div id="fdxManagerRequests" class="fdx-list"><div class="fdx-empty">Talepler yüklenmedi.</div></div></section>
                <section id="fdxPanelClosure" class="fdx-panel"><div class="fdx-toolbar"><div><h4>Aylık Kapanış</h4><p>Giriş–çıkış eksiklerini ve belgesiz puantaj kodlarını kontrol edin.</p></div><button type="button" class="fdx-btn" onclick="fdxKapanislariYukle()">↻ Durumu Yenile</button></div><div class="fdx-section-note">Cihaz numarası eksik personel burada hata olarak gösterilmez. Kontrol yalnızca ekrandaki mevcut kayıtları okur; hiçbir kaydı değiştirmez.</div><div class="fdx-form-grid"><div class="fdx-field"><label>Dönem</label><input id="fdxClosureMonth" type="month" onchange="fdxKapanisAyDegisti()"></div><div class="fdx-field" style="align-self:end"><button type="button" class="fdx-btn primary" onclick="fdxAylikKontrol()">Dönemi Kontrol Et</button></div></div><div id="fdxClosureContent" style="margin-top:13px"><div class="fdx-empty">Kontrol etmek istediğiniz ayı seçin.</div></div></section>
                 <section id="fdxPanelSchedule" class="fdx-panel"><div class="fdx-toolbar"><div><h4>Planlı Bildirimler</h4><p>Planlanan bildirimleri burada listeleyin, düzenleyin veya silin.</p></div><button type="button" class="fdx-btn" onclick="fdxPlanlariYukle()">↻ Listeyi Yenile</button></div><div class="fdx-section-note">Yeni plan eklemek veya bekleyen bir planı düzenlemek için <strong>Bildirim Gönder → Planlı Gönder</strong> bölümünü kullanın.</div><div id="fdxScheduleList" class="fdx-list"><div class="fdx-empty">Planlar yüklenmedi.</div></div></section>
                <section id="fdxPanelAudit" class="fdx-panel"><div class="fdx-toolbar"><div><h4>Ayrıntılı Denetim İzi</h4><p>Kimin, ne zaman, hangi kaydı eklediğini, sildiğini veya hangi değeri neyle değiştirdiğini görün. Cihazdan gelen ham giriş–çıkış hareketleri listeye alınmaz.</p></div><div class="fdx-toolbar-actions"><select id="fdxAuditModule" onchange="fdxAuditFiltreDegisti()"><option value="">Tüm bölümler</option></select><select id="fdxAuditOperation" onchange="fdxAuditFiltreDegisti()"><option value="">Tüm işlemler</option><option value="insert">Eklenenler</option><option value="update">Güncellenenler</option><option value="delete">Silinenler</option><option value="restore">Geri alınanlar</option></select><select id="fdxAuditActor" onchange="fdxAuditFiltreDegisti()"><option value="">Tüm kullanıcılar</option></select><button type="button" class="fdx-btn" onclick="fdxAuditYukle()">↻ Yenile</button></div></div><div id="fdxAuditList" class="fdx-list"><div class="fdx-empty">Denetim kayıtları yüklenmedi.</div></div></section>
            </div>
        </div></div>
        <div id="fdxMyRequestsModal" class="modal-overlay fdx-overlay"><div class="modal-card" style="max-width:850px"><div class="modal-header"><div><h3>📝 Taleplerim</h3><small>Talebiniz yöneticilere iletilir ve sonuçlandığında bildirim alırsınız.</small></div><button type="button" class="modal-close" onclick="fdxKapat('fdxMyRequestsModal')">✕</button></div><div class="modal-body"><form class="fdx-form" onsubmit="fdxTalepGonder(event)"><div class="fdx-form-grid"><div class="fdx-field full"><label>Talep türü</label><select id="fdxRequestType" onchange="fdxTalepTuruDegisti()"><option value="leave">İzin Talebi</option><option value="advance">Avans Talebi</option><option value="attendance">Giriş–Çıkış Düzeltme</option></select></div><div class="fdx-request-fields" data-fdx-request="leave"><div class="fdx-field"><label>İzin türü</label><select id="fdxLeaveType"><option>Yıllık İzin</option><option>Ücretli İzin</option><option>Ücretsiz İzin</option><option>Sağlık / Rapor</option><option>Mazeretsiz İzin</option><option>Doğum İzni</option><option>Evlenme İzni</option><option>Ölüm İzni</option></select></div><div class="fdx-field"><label>Başlangıç</label><input id="fdxLeaveStart" type="date"></div><div class="fdx-field"><label>Bitiş</label><input id="fdxLeaveEnd" type="date"></div></div><div class="fdx-request-fields" data-fdx-request="advance"><div class="fdx-field"><label>Avans tutarı</label><input id="fdxAdvanceAmount" type="number" min="1" step="0.01"></div><div class="fdx-field"><label>Taksit sayısı</label><input id="fdxAdvanceInstallments" type="number" min="1" max="24" value="1"></div><div class="fdx-field"><label>Başlangıç ayı</label><input id="fdxAdvanceStartMonth" type="month"></div></div><div class="fdx-request-fields" data-fdx-request="attendance"><div class="fdx-field"><label>Tarih</label><input id="fdxAttendanceDate" type="date"></div><div class="fdx-field"><label>Doğru giriş saati</label><input id="fdxAttendanceEntry" type="time"></div><div class="fdx-field"><label>Doğru çıkış saati</label><input id="fdxAttendanceExit" type="time"></div></div><div class="fdx-field full"><label>Açıklama</label><textarea id="fdxRequestNote" maxlength="500" data-case-preserve="true" placeholder="Talebinizle ilgili kısa açıklama yazın..."></textarea></div></div><button id="fdxRequestSubmit" type="submit" class="fdx-btn success">Talebi Gönder</button></form><div style="height:18px"></div><div class="fdx-toolbar"><h4>Önceki Taleplerim</h4><button type="button" class="fdx-btn" onclick="fdxTaleplerimiYukle()">↻ Yenile</button></div><div id="fdxMyRequests" class="fdx-list"><div class="fdx-empty">Talepler yüklenmedi.</div></div></div></div></div>
        <div id="fdxReviewModal" class="modal-overlay fdx-overlay"><div class="modal-card" style="max-width:650px"><div class="modal-header"><div><h3>Talebi İncele</h3><small id="fdxReviewSubtitle"></small></div><button type="button" class="modal-close" onclick="fdxKapat('fdxReviewModal')">✕</button></div><div class="modal-body"><div id="fdxReviewSummary" class="fdx-review-box"></div><div class="fdx-field" style="margin-top:12px"><label>Yönetici notu <small>(isteğe bağlı)</small></label><textarea id="fdxReviewNote" maxlength="500" data-case-preserve="true"></textarea></div><div class="fdx-item-actions"><button type="button" class="fdx-btn danger" onclick="fdxTalepKarari('rejected')">Talebi Reddet</button><button type="button" class="fdx-btn success" onclick="fdxTalepKarari('approved')">Talebi Onayla</button></div></div></div></div>
        <div id="fdxAuditDetailModal" class="modal-overlay fdx-overlay"><div class="modal-card" style="max-width:820px"><div class="modal-header"><div><h3 id="fdxAuditDetailTitle">Değişiklik Detayı</h3><small id="fdxAuditDetailSubtitle"></small></div><button type="button" class="modal-close" onclick="fdxKapat('fdxAuditDetailModal')">✕</button></div><div class="modal-body"><div id="fdxAuditDetailMeta" class="fdx-section-note"></div><div id="fdxAuditChanges" class="fdx-change-list"></div><div id="fdxAuditRestoreActions" class="fdx-item-actions" style="display:none;margin-top:16px"></div></div></div></div>`}

    window.fdxKapat=function(id){if(id==='fdxWorkCenterModal'||id==='workCenterApp'){if(typeof fdUygulamaSekmesineGec==='function')return fdUygulamaSekmesineGec('home');const root=document.getElementById('workCenterApp');if(root)root.style.display='none';return}const modal=document.getElementById(id);if(modal)modal.style.display='none'};
    window.fdxIsMerkeziAc=function(){if(!fdxManager())return showToast?.('Bu bölüm için yönetici yetkisi gerekli.','warning');if(typeof fdTumUygulamaAlanlariniGizle==='function')fdTumUygulamaAlanlariniGizle();else{const hub=document.getElementById('appHub');if(hub)hub.style.display='none'}const root=document.getElementById('workCenterApp'),shell=document.getElementById('fdxWorkCenterModal');if(root)root.style.display='block';if(shell)shell.style.display='block';anaMenuDonusButonunuGoster?.();fdxSekmeAc(fdxState.tab||'requests')};
    window.fdxTaleplerimAc=function(){if(!fdxPersonel())return showToast?.('Talep ekranı personel hesabı içindir.','warning');document.getElementById('fdxMyRequestsModal').style.display='flex';fdxTaleplerimiYukle()};
    window.fdxSekmeAc=function(tab,button){fdxState.tab=tab;document.querySelectorAll('#fdxWorkCenterModal .fdx-panel').forEach(el=>el.classList.remove('active'));document.querySelectorAll('#fdxWorkCenterModal [data-fdx-tab]').forEach(el=>el.classList.toggle('active',el.dataset.fdxTab===tab));document.getElementById('fdxPanel'+tab.charAt(0).toUpperCase()+tab.slice(1))?.classList.add('active');if(tab==='requests')fdxTalepleriYukle();if(tab==='closure')fdxKapanislariYukle();if(tab==='schedule'){fdxPlanHedefleriniDoldur();fdxPlanlariYukle()}if(tab==='audit')fdxAuditYukle()};

    function fdxPersonelBul(id){try{return (Array.isArray(personeller)?personeller:[]).find(p=>String(p.id)===String(id))||null}catch(_){return null}}
    function fdxTalepOzeti(item){
        const data=item?.request_data||{},type=String(item?.request_type||'');
        if(type==='leave')return (data.leaveType||'İzin')+' · '+fdxTarih(data.start)+' – '+fdxTarih(data.end)+(data.note?'\n'+data.note:'');
        if(type==='advance')return fdxPara(data.amount)+' · '+(Number(data.installments||1)===1?'Tek seferde':Number(data.installments||1)+' taksit')+' · Başlangıç '+String(data.startMonth||'-')+(data.note?'\n'+data.note:'');
        if(type==='attendance')return fdxTarih(data.date)+' · Giriş '+String(data.entry||'-')+' / Çıkış '+String(data.exit||'-')+(data.note?'\n'+data.note:'');
        return 'Talep ayrıntısı bulunamadı.';
    }

    window.fdxTalepTuruDegisti=function(){
        const type=String(document.getElementById('fdxRequestType')?.value||'leave');
        document.querySelectorAll('#fdxMyRequestsModal .fdx-request-fields').forEach(group=>group.classList.toggle('active',group.dataset.fdxRequest===type));
        const required={fdxLeaveType:type==='leave',fdxLeaveStart:type==='leave',fdxLeaveEnd:type==='leave',fdxAdvanceAmount:type==='advance',fdxAdvanceInstallments:type==='advance',fdxAdvanceStartMonth:type==='advance',fdxAttendanceDate:type==='attendance'};
        Object.entries(required).forEach(([id,value])=>{const input=document.getElementById(id);if(input)input.required=value});
        const note=document.getElementById('fdxRequestNote');if(note)note.required=type==='attendance';
        const today=new Date(),dateKey=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0'),monthKey=dateKey.slice(0,7);
        if(!document.getElementById('fdxLeaveStart')?.value)document.getElementById('fdxLeaveStart').value=dateKey;
        if(!document.getElementById('fdxLeaveEnd')?.value)document.getElementById('fdxLeaveEnd').value=dateKey;
        if(!document.getElementById('fdxAdvanceStartMonth')?.value)document.getElementById('fdxAdvanceStartMonth').value=monthKey;
        if(!document.getElementById('fdxAttendanceDate')?.value)document.getElementById('fdxAttendanceDate').value=dateKey;
    };

    window.fdxTalepGonder=async function(event){
        event.preventDefault();if(!fdxPersonel())return;
        const type=String(document.getElementById('fdxRequestType').value),note=document.getElementById('fdxRequestNote').value.trim();let data={note};
        if(type==='leave')data={leaveType:document.getElementById('fdxLeaveType').value,start:document.getElementById('fdxLeaveStart').value,end:document.getElementById('fdxLeaveEnd').value,note};
        if(type==='advance')data={amount:Number(document.getElementById('fdxAdvanceAmount').value),installments:Number(document.getElementById('fdxAdvanceInstallments').value),startMonth:document.getElementById('fdxAdvanceStartMonth').value,note};
        if(type==='attendance')data={date:document.getElementById('fdxAttendanceDate').value,entry:document.getElementById('fdxAttendanceEntry').value,exit:document.getElementById('fdxAttendanceExit').value,note};
        const button=document.getElementById('fdxRequestSubmit');button.disabled=true;button.textContent='Gönderiliyor...';
        try{
            await fdxApi({action:'request-create',requestType:type,requestData:data});
            showToast?.('Talebiniz yöneticilere iletildi.','success');document.getElementById('fdxRequestNote').value='';
            if(type==='advance')document.getElementById('fdxAdvanceAmount').value='';
            if(type==='attendance'){document.getElementById('fdxAttendanceEntry').value='';document.getElementById('fdxAttendanceExit').value=''}
            await fdxTaleplerimiYukle();
        }catch(error){fdxYerelHata('fdxMyRequests',error)}finally{button.disabled=false;button.textContent='Talebi Gönder'}
    };

    window.fdxTaleplerimiYukle=async function(){
        const area=document.getElementById('fdxMyRequests');if(!area||!fdxPersonel())return;area.innerHTML='<div class="fdx-empty">Talepler yükleniyor...</div>';
        try{const result=await fdxApi({action:'request-list'});fdxState.myRequests=Array.isArray(result.requests)?result.requests:[];fdxTaleplerimiCiz()}catch(error){fdxYerelHata(area,error)}
    };
    function fdxTaleplerimiCiz(){
        const area=document.getElementById('fdxMyRequests'),items=fdxState.myRequests;if(!area)return;
        area.innerHTML=items.length?items.map(item=>'<article class="fdx-item"><div class="fdx-item-head"><div class="fdx-item-title"><strong>'+fdxEsc(fdxRequestTypes[item.request_type]||'Talep')+'</strong><small>'+fdxTarihSaat(item.created_at)+'</small></div>'+fdxDurum(item.status)+'</div><div class="fdx-item-detail">'+fdxEsc(fdxTalepOzeti(item))+'</div>'+(item.manager_note?'<div class="fdx-state" style="margin-top:9px"><strong>Yönetici notu:</strong> '+fdxEsc(item.manager_note)+'</div>':'')+(item.status==='pending'?'<div class="fdx-item-actions"><button type="button" class="fdx-btn danger" onclick="fdxTalepIptal(\''+fdxEsc(item.id)+'\')">Talebi İptal Et</button></div>':'')+'</article>').join(''):'<div class="fdx-empty">Henüz talebiniz bulunmuyor.</div>';
    }
    window.fdxTalepIptal=async function(id){
        if(!await fdxOnay('Bekleyen talebiniz iptal edilsin mi?','Talebi İptal Et','İptal Et'))return;
        try{await fdxApi({action:'request-cancel',id});showToast?.('Talebiniz iptal edildi.','success');await fdxTaleplerimiYukle()}catch(error){fdxYerelHata('fdxMyRequests',error)}
    };

    window.fdxTalepleriYukle=async function(){
        const area=document.getElementById('fdxManagerRequests');if(!area||!fdxManager())return;area.innerHTML='<div class="fdx-empty">Talepler yükleniyor...</div>';
        try{const result=await fdxApi({action:'request-list'});fdxState.requests=Array.isArray(result.requests)?result.requests:[];fdxTalepleriCiz()}catch(error){fdxYerelHata(area,error)}
    };
    window.fdxTalepleriCiz=function(){
        const area=document.getElementById('fdxManagerRequests');if(!area)return;const filter=String(document.getElementById('fdxRequestStatus')?.value||'');const items=fdxState.requests.filter(item=>!filter||item.status===filter);
        area.innerHTML=items.length?items.map(item=>{const person=fdxPersonelBul(item.employee_legacy_id),name=person?.ad||('Personel '+String(item.employee_legacy_id||'').slice(-4)),branch=person?.sube||'';return '<article class="fdx-item"><div class="fdx-item-head"><div class="fdx-item-title"><strong>'+fdxEsc(name)+' · '+fdxEsc(fdxRequestTypes[item.request_type]||'Talep')+'</strong><small>'+fdxEsc(branch)+(branch?' · ':'')+fdxTarihSaat(item.created_at)+'</small></div>'+fdxDurum(item.status)+'</div><div class="fdx-item-detail">'+fdxEsc(fdxTalepOzeti(item))+'</div>'+(item.manager_note?'<div class="fdx-state" style="margin-top:9px"><strong>Yönetici notu:</strong> '+fdxEsc(item.manager_note)+'</div>':'')+(item.status==='pending'?'<div class="fdx-item-actions"><button type="button" class="fdx-btn primary" onclick="fdxTalepIncele(\''+fdxEsc(item.id)+'\')">Talebi İncele</button></div>':'')+'</article>'}).join(''):'<div class="fdx-empty">Bu filtrede talep bulunmuyor.</div>';
    };
    window.fdxTalepIncele=function(id){
        const item=fdxState.requests.find(row=>String(row.id)===String(id));if(!item)return;fdxState.reviewId=String(id);const person=fdxPersonelBul(item.employee_legacy_id);document.getElementById('fdxReviewSubtitle').textContent=(person?.ad||'Personel')+' · '+(fdxRequestTypes[item.request_type]||'Talep');document.getElementById('fdxReviewSummary').textContent=fdxTalepOzeti(item);document.getElementById('fdxReviewNote').value='';document.getElementById('fdxReviewModal').style.display='flex';
    };
    window.fdxTalepKarari=async function(decision){
        const id=fdxState.reviewId;if(!id)return;const approved=decision==='approved',message=approved?'Talep onaylansın mı? Onay, ana kaydı otomatik oluşturmayacak.':'Talep reddedilsin mi?';
        if(!await fdxOnay(message,approved?'Talebi Onayla':'Talebi Reddet',approved?'Onayla':'Reddet'))return;
        const note=document.getElementById('fdxReviewNote').value.trim();
        try{await fdxApi({action:'request-review',id,decision,note});fdxKapat('fdxReviewModal');showToast?.(approved?'Talep onaylandı. İlgili kaydı kendi ekranından oluşturabilirsiniz.':'Talep reddedildi.','success');await fdxTalepleriYukle()}catch(error){fdxYerelHata('fdxReviewSummary',error)}
    };

    function fdxDateKey(value){try{return typeof tarihInputDegeri==='function'?String(tarihInputDegeri(value)||''):String(value||'').slice(0,10)}catch(_){return String(value||'').slice(0,10)}}
    function fdxAyGunleri(month){const parts=String(month||'').split('-').map(Number),year=parts[0],monthIndex=parts[1]-1;if(!year||monthIndex<0||monthIndex>11)return[];const count=new Date(year,monthIndex+1,0).getDate(),days=[];for(let day=1;day<=count;day++)days.push(year+'-'+String(monthIndex+1).padStart(2,'0')+'-'+String(day).padStart(2,'0'));return days}
    function fdxPuantajKoduAciklamasi(code){return ({M:'M yazılmış ancak izin kaydı/dilekçesi yok',R:'Rapor yazılmış ancak izin/rapor kaydı yok',Z:'Ücretsiz izin yazılmış ancak izin kaydı yok',Y:'Yıllık izin yazılmış ancak izin kaydı yok','Ü':'Ücretli izin yazılmış ancak izin kaydı yok'}[code]||'Puantaj kodunun bağlı kaydı yok')}
    function fdxAylikSorunlariBul(month){
        const issues=[],counts={girisEksik:0,cikisEksik:0,tamEksik:0,belgesizKod:0},today=fdxDateKey(new Date()),days=fdxAyGunleri(month);
        let staff=[];try{staff=(Array.isArray(personeller)?personeller:[]).filter(p=>aktifSirketeAit(p))}catch(_){staff=[]}
        for(const person of staff){
            const employmentStart=fdxDateKey(person.girisTarihi),employmentEnd=fdxDateKey(person.cikisTarihi);
            for(const date of days){
                if(date>today||(employmentStart&&date<employmentStart)||(employmentEnd&&employmentEnd!=='null'&&date>employmentEnd))continue;
                let leave=null;try{leave=(Array.isArray(izinler)?izinler:[]).find(row=>aktifSirketeAit(row)&&String(row.pId)===String(person.id)&&date>=String(row.baslangic||'')&&date<=String(row.bitis||''))||null}catch(_){}
                let manual=null;try{manual=(Array.isArray(puantajVerileri)?puantajVerileri:[]).find(row=>aktifSirketeAit(row)&&!row.kayitTipi&&String(row.pId)===String(person.id)&&String(row.tarih)===date)||null}catch(_){}
                const code=String(manual?.durum||'').trim().toLocaleUpperCase('tr-TR');
                if(!leave&&['M','R','Z','Y','Ü'].includes(code)){
                    issues.push({personId:String(person.id),name:person.ad||'Personel',branch:person.sube||'',date,type:'Belgesiz puantaj kodu',detail:fdxPuantajKoduAciklamasi(code)});counts.belgesizKod++;continue;
                }
                if(leave)continue;
                let result=null;try{if(typeof magicpassGunHesapla==='function')result=magicpassGunHesapla(person,date)}catch(_){}
                if(!result||result.durum==='Cihaz No Tanımsız')continue;
                if(['Giriş Eksik','Giriş Yok'].includes(result.durum)){issues.push({personId:String(person.id),name:person.ad||'Personel',branch:person.sube||'',date,type:'Giriş eksik',detail:'Giriş kaydı bulunmuyor'});counts.girisEksik++}
                else if(['Çıkış Eksik','Çıkış Yok'].includes(result.durum)){issues.push({personId:String(person.id),name:person.ad||'Personel',branch:person.sube||'',date,type:'Çıkış eksik',detail:'Çıkış kaydı bulunmuyor'});counts.cikisEksik++}
                else if(result.durum==='Gelmedi'){issues.push({personId:String(person.id),name:person.ad||'Personel',branch:person.sube||'',date,type:'Giriş ve çıkış eksik',detail:'Bu çalışma gününde giriş ve çıkış kaydı bulunmuyor'});counts.tamEksik++}
            }
        }
        return {month,issues,counts,checkedAt:new Date().toISOString()};
    }

    window.fdxKapanislariYukle=async function(){
        const area=document.getElementById('fdxClosureContent');if(!area||!fdxManager())return;area.innerHTML='<div class="fdx-empty">Dönem durumu yükleniyor...</div>';
        try{const result=await fdxApi({action:'closure-list'});fdxState.closures=Array.isArray(result.closures)?result.closures:[];fdxKapanisCiz()}catch(error){fdxYerelHata(area,error)}
    };
    window.fdxKapanisAyDegisti=function(){fdxState.closureCheck=null;fdxKapanisCiz()};
    window.fdxAylikKontrol=async function(){
        const month=String(document.getElementById('fdxClosureMonth')?.value||''),area=document.getElementById('fdxClosureContent');if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)){if(area)area.innerHTML='<div class="fdx-state error">Geçerli bir dönem seçin.</div>';return}
        if(area)area.innerHTML='<div class="fdx-empty">Kayıtlar yenileniyor ve dönem kontrol ediliyor...</div>';
        try{
            const refreshKeys=['personeller','izinler','puantaj','vardiya'],dirty=refreshKeys.some(key=>typeof veriDegistiMi==='function'&&veriDegistiMi(key));
            if(!dirty&&typeof supabaseVerileriniYukle==='function'&&activeUser?.sirketId)await supabaseVerileriniYukle('personel',Number(month.slice(0,4)));
            else if(dirty)showToast?.('Kaydedilmemiş değişiklikler bulunduğu için kontrol mevcut ekran kayıtlarıyla yapıldı.','warning');
            fdxState.closureCheck=fdxAylikSorunlariBul(month);fdxKapanisCiz();
        }catch(error){fdxYerelHata(area,error)}
    };
    function fdxKapanisCiz(){
        const area=document.getElementById('fdxClosureContent');if(!area)return;const month=String(document.getElementById('fdxClosureMonth')?.value||''),closure=fdxState.closures.find(item=>String(item.month_key)===month),check=fdxState.closureCheck?.month===month?fdxState.closureCheck:null,status=closure?.status||'open';
        let html='<div class="fdx-toolbar"><div><strong>'+fdxEsc(month||'Dönem')+'</strong><div style="margin-top:5px">'+fdxDurum(status)+'</div></div><div class="fdx-toolbar-actions">';
        if(status==='locked')html+='<button type="button" class="fdx-btn danger" onclick="fdxKapanisDurumDegistir(\'open\')">Dönemi Yeniden Aç</button>';
        else if(check&&check.issues.length===0)html+='<button type="button" class="fdx-btn success" onclick="fdxKapanisDurumDegistir(\'locked\')">Sorun Yok · Dönemi Kapat</button>';
        html+='</div></div>';
        if(!check){
            if(status==='locked'&&closure?.summary){const summary=closure.summary||{},counts=summary.counts||{};html+='<div class="fdx-section-note">Bu dönem daha önce kontrol edilip kapatıldı. Aşağıdaki değerler son kapanış kontrolünün özetidir; güncel kayıtları karşılaştırmak için <strong>Dönemi Kontrol Et</strong> düğmesine basın.</div><div class="fdx-close-summary"><div class="fdx-metric"><span>Son kontrol sorunu</span><strong>'+Number(summary.issueCount||0)+'</strong></div><div class="fdx-metric"><span>Giriş / çıkış eksikleri</span><strong>'+Number(counts.girisEksik||0)+Number(counts.cikisEksik||0)+Number(counts.tamEksik||0)+'</strong></div><div class="fdx-metric"><span>Belgesiz puantaj kodu</span><strong>'+Number(counts.belgesizKod||0)+'</strong></div></div>'}
            else html+='<div class="fdx-empty">Bu dönem henüz kontrol edilmedi. Güncel kayıtları okumak için <strong>Dönemi Kontrol Et</strong> düğmesine basın.</div>';area.innerHTML=html;return
        }
        html+='<div class="fdx-close-summary"><div class="fdx-metric"><span>Toplam sorun</span><strong>'+check.issues.length+'</strong></div><div class="fdx-metric"><span>Giriş / çıkış eksikleri</span><strong>'+(check.counts.girisEksik+check.counts.cikisEksik+check.counts.tamEksik)+'</strong></div><div class="fdx-metric"><span>İzin kaydı olmayan kodlar</span><strong>'+check.counts.belgesizKod+'</strong></div></div>';
        if(!check.issues.length)html+='<div class="fdx-state success">Kontrol tamamlandı. Eksik giriş–çıkış veya belgesiz puantaj kodu bulunmadı.</div>';
        else html+='<div class="fdx-item"><div style="font-weight:900;color:#991b1b;margin-bottom:6px">Dönem kapatılmadan önce düzeltilmesi gerekenler</div>'+check.issues.slice(0,300).map(issue=>'<div class="fdx-issue"><strong>'+fdxEsc(issue.name)+(issue.branch?' · '+fdxEsc(issue.branch):'')+'</strong><span>'+fdxTarih(issue.date)+'</span><span><b>'+fdxEsc(issue.type)+':</b> '+fdxEsc(issue.detail)+'</span></div>').join('')+(check.issues.length>300?'<div class="fdx-state">İlk 300 sorun gösteriliyor. Toplam '+check.issues.length+' sorun var.</div>':'')+'</div>';
        area.innerHTML=html;
    }
    window.fdxKapanisDurumDegistir=async function(status){
        const month=String(document.getElementById('fdxClosureMonth')?.value||''),check=fdxState.closureCheck?.month===month?fdxState.closureCheck:null;
        if(status==='locked'&&(!check||check.issues.length))return showToast?.('Dönemi kapatmadan önce kontrolü tamamlayın ve sorunları düzeltin.','warning');
        const message=status==='locked'?month+' dönemi kapatılsın mı? Bu aya ait kayıtlar yeniden açılana kadar değiştirilemez.':month+' dönemi yeniden açılsın mı?';
        if(!await fdxOnay(message,status==='locked'?'Dönemi Kapat':'Dönemi Aç',status==='locked'?'Kapat':'Aç'))return;
        const area=document.getElementById('fdxClosureContent');if(area)area.innerHTML='<div class="fdx-empty">Dönem durumu kaydediliyor...</div>';
        try{await fdxApi({action:'closure-set',month,status,issueCount:check?.issues.length||0,checkedAt:check?.checkedAt||new Date().toISOString(),summary:{counts:check?.counts||{}}});showToast?.(status==='locked'?'Dönem kapatıldı.':'Dönem yeniden açıldı.','success');await fdxKapanislariYukle()}catch(error){fdxYerelHata(area,error)}
    };

    function fdxPlanVarsayilanZaman(){const input=document.getElementById('fdxScheduleAt');if(!input||input.value)return;const date=new Date(Date.now()+60*60*1000);date.setMinutes(Math.ceil(date.getMinutes()/5)*5,0,0);input.value=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')+'T'+String(date.getHours()).padStart(2,'0')+':'+String(date.getMinutes()).padStart(2,'0')}
    function fdxPlanHedefleriniDoldur(){
        const branch=document.getElementById('fdxScheduleBranch');if(!branch)return;const previous=branch.value,branches=[...new Set(fdxAktifPersoneller().map(p=>String(p.sube||'Merkez').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));branch.innerHTML='<option value="">Tüm şubeler</option>'+branches.map(name=>'<option value="'+fdxEsc(name)+'">'+fdxEsc(name)+'</option>').join('');if(branches.includes(previous))branch.value=previous;fdxPlanPersonelleriniDoldur();fdxPlanHedefTuruDegisti();fdxPlanVarsayilanZaman();
    }
    window.fdxPlanPersonelleriniDoldur=function(){
        const area=document.getElementById('fdxSchedulePeople');if(!area)return;const branch=String(document.getElementById('fdxScheduleBranch')?.value||''),selected=new Set([...area.querySelectorAll('input:checked')].map(input=>String(input.value))),people=fdxAktifPersoneller().filter(p=>!branch||String(p.sube||'Merkez')===branch);
        area.innerHTML=people.length?people.map(person=>'<label><input type="checkbox" class="fdx-plan-person" value="'+fdxEsc(String(person.id))+'" '+(selected.has(String(person.id))?'checked':'')+'><span>'+fdxEsc(person.ad||'-')+'<small style="display:block;color:#64748b">'+fdxEsc(person.sube||'Merkez')+'</small></span></label>').join(''):'<div class="fdx-empty" style="grid-column:1/-1">Bu şubede aktif personel bulunamadı.</div>';
    };
    window.fdxPlanTumunuSec=function(selected){document.querySelectorAll('#fdxSchedulePeople .fdx-plan-person').forEach(input=>input.checked=selected)};
    window.fdxPlanHedefTuruDegisti=function(){const all=document.getElementById('fdxScheduleAudience')?.value==='all',wrap=document.getElementById('fdxSchedulePeopleWrap'),branch=document.getElementById('fdxScheduleBranch');if(wrap)wrap.style.display=all?'none':'grid';if(branch)branch.disabled=all};
    function fdxPlanSeciliIds(){return [...document.querySelectorAll('#fdxSchedulePeople .fdx-plan-person:checked')].map(input=>String(input.value))}
    window.fdxPlanOlustur=async function(event){
        event.preventDefault();const title=document.getElementById('fdxScheduleTitle').value.trim(),message=document.getElementById('fdxScheduleMessage').value.trim(),localTime=document.getElementById('fdxScheduleAt').value,audienceMode=document.getElementById('fdxScheduleAudience').value,targetEmployeeIds=audienceMode==='all'?[]:fdxPlanSeciliIds();
        if(audienceMode!=='all'&&!targetEmployeeIds.length)return showToast?.('En az bir personel seçin veya hedefi Tüm şirket yapın.','warning');
        const when=new Date(localTime);if(!localTime||Number.isNaN(when.getTime())||when.getTime()<Date.now()+30000)return showToast?.('Gelecekte bir gönderim zamanı seçin.','warning');
        const targetText=audienceMode==='all'?'tüm şirkete':targetEmployeeIds.length+' seçili personele';if(!await fdxOnay('Bildirim '+fdxTarihSaat(when.toISOString())+' tarihinde '+targetText+' gönderilmek üzere planlansın mı?','Bildirimi Planla','Planla'))return;
        const button=document.getElementById('fdxScheduleSubmit');button.disabled=true;button.textContent='Planlanıyor...';
        try{const result=await fdxApi({action:'schedule-create',title,message,scheduledFor:when.toISOString(),audienceMode,targetEmployeeIds});showToast?.(result.ignoredTargetCount?('Bildirim planlandı. Uygulama hesabı olmayan '+result.ignoredTargetCount+' personel hedefe eklenmedi.'):'Bildirim planlandı.',result.ignoredTargetCount?'warning':'success');document.getElementById('fdxScheduleTitle').value='';document.getElementById('fdxScheduleMessage').value='';document.getElementById('fdxScheduleAt').value='';fdxPlanVarsayilanZaman();fdxPlanTumunuSec(false);await fdxPlanlariYukle()}catch(error){fdxYerelHata('fdxScheduleList',error)}finally{button.disabled=false;button.textContent='Bildirimi Planla'}
    };
    window.fdxPlanlariYukle=async function(){
        const area=document.getElementById('fdxScheduleList');if(!area||!fdxManager())return;area.innerHTML='<div class="fdx-empty">Planlar yükleniyor...</div>';
        try{const result=await fdxApi({action:'schedule-list'});fdxState.schedules=Array.isArray(result.items)?result.items:[];fdxPlanlariCiz()}catch(error){fdxYerelHata(area,error)}
    };
    function fdxPlanHedefMetni(item){const roller=(Array.isArray(item.target_roles)?item.target_roles:[]).filter(rol=>rol!=='VardiyaOtomatik');if(roller.length)return'Admin ve kullanıcılar';const ids=Array.isArray(item.target_employee_ids)?item.target_employee_ids.map(String):[];if(!ids.length)return'Tüm şirket';const names=ids.map(id=>fdxPersonelBul(id)?.ad||('Personel '+id.slice(-4)));return names.length<=3?names.join(', '):names.slice(0,3).join(', ')+' ve '+(names.length-3)+' kişi daha'}
    function fdxPlanlariCiz(){
        const area=document.getElementById('fdxScheduleList'),items=fdxState.schedules;if(!area)return;area.innerHTML=items.length?items.map(item=>'<article class="fdx-item"><div class="fdx-item-head"><div class="fdx-item-title"><strong>'+fdxEsc(item.title||'Başlıksız bildirim')+'</strong><small>'+fdxTarihSaat(item.scheduled_for)+' · '+fdxEsc(fdxPlanHedefMetni(item))+'</small></div>'+fdxDurum(item.status)+'</div><div class="fdx-item-detail">'+fdxEsc(item.message||'')+'</div>'+(item.status==='sent'?'<div class="fdx-state success" style="margin-top:9px">'+Number(item.sent_count||0)+' cihaza gönderildi.</div>':'')+(item.error_message?'<div class="fdx-state error" style="margin-top:9px">'+fdxEsc(item.error_message)+'</div>':'')+(item.status==='pending'?'<div class="fdx-item-actions"><button type="button" class="fdx-btn" onclick="fdxPlanDuzenle(\''+fdxEsc(item.id)+'\')">Düzenle</button><button type="button" class="fdx-btn danger" onclick="fdxPlanIptal(\''+fdxEsc(item.id)+'\')">Sil / İptal Et</button></div>':'')+'</article>').join(''):'<div class="fdx-empty">Planlanmış bildirim bulunmuyor.</div>';
    }
    window.fdxPlanDuzenle=function(id){const item=fdxState.schedules.find(row=>String(row.id)===String(id));if(!item)return showToast?.('Planlı bildirim bulunamadı.','warning');if(typeof window.openBildirimModal!=='function')return showToast?.('Bildirim ekranı hazır değil.','warning');window.openBildirimModal({item})};
    window.fdxPlanIptal=async function(id){if(!await fdxOnay('Bu planlı bildirim silinsin ve gönderim iptal edilsin mi?','Planlı Bildirimi Sil','Sil / İptal Et'))return;try{await fdxApi({action:'schedule-cancel',id});showToast?.('Planlı bildirim silindi / iptal edildi.','success');await fdxPlanlariYukle()}catch(error){fdxYerelHata('fdxScheduleList',error)}};

    function fdxModuleLabel(value){return fdxModules[value]||({employee_requests:'Personel Talebi',monthly_closures:'Aylık Kapanış',scheduled_push_notifications:'Planlı Bildirim',taputakip:'Tapu / ÇKS'}[value])||String(value||'Kayıt')}
    function fdxOperationLabel(value){return ({insert:'Eklendi',update:'Güncellendi',delete:'Silindi',restore:'Geri Alındı'}[value]||String(value||'İşlem'))}
    function fdxActorName(item){return String(item?.actor?.full_name||item?.actor?.employee_legacy_id||'Sistem / eski kayıt')}
    function fdxAuditPersonName(data){const id=String(data?.pId||data?.employee_legacy_id||data?.personelId||'');return data?.personelAd||(id?(fdxPersonelBul(id)?.ad||id):'')}
    function fdxVardiyaAdi(value){return ({ana:'Ana vardiya',ek:'Ek vardiya',gece:'Gece vardiyası',gunduz:'Gündüz vardiyası',izin:'İzin / çalışma yok'}[String(value||'').toLocaleLowerCase('tr-TR')]||String(value||'Vardiya'))}
    function fdxAuditEntityLabel(item){const preview=item?.preview||item?.new_data||item?.old_data||{},type=String(preview.kayitTipi||''),module=String(item?.module||'');if(module==='vardiya'&&(preview.haftaBaslangic||String(item?.legacy_id||'').startsWith('vardiya_')))return'Haftalık vardiya planı';if(fdxRecordTypes[type])return fdxRecordTypes[type];if(module==='puantaj'&&preview.tarih)return'Puantaj günü';if(module==='irsaliyeler')return'Taşıma irsaliyesi';return fdxModuleLabel(module)}
    function fdxAuditActionLabel(item){return fdxAuditEntityLabel(item)+' · '+fdxOperationLabel(item?.operation)}
    function fdxAuditRecordName(item){
        const p=item?.preview||{},module=String(item?.module||''),person=fdxAuditPersonName(p),date=p.zamanDamgasi||p.tarih||p.haftaBaslangic||p.baslangic||p.scheduled_for||'',dateText=date?(String(date).includes('T')?fdxTarihSaat(date):fdxTarih(String(date).slice(0,10))):'',parts=[];
        if(module==='personeller')parts.push(p.ad||p.personelAd||person);
        else if(['izinler','puantaj','avanslar','icralar','ekodemeler','ekOdemeler','kkd','vardiya'].includes(module))parts.push(person);
        if(module==='izinler')parts.push(p.tur||'İzin',p.baslangic&&p.bitis?(fdxTarih(p.baslangic)+' – '+fdxTarih(p.bitis)):dateText);
        else if(module==='icralar')parts.push(p.dosyaNo?('Dosya '+p.dosyaNo):'',p.alacakliKurum||'',Number.isFinite(Number(p.tutar||p.toplamBorc))?fdxPara(p.tutar||p.toplamBorc):'');
        else if(module==='avanslar')parts.push(Number.isFinite(Number(p.tutar))?fdxPara(p.tutar):'',dateText);
        else if(module==='araclar')parts.push(p.plaka||'',p.marka||p.model||'');
        else if(module==='irsaliyeler')parts.push(p.firma||p.unvan||'',p.irsaliyeNo?('İrsaliye '+p.irsaliyeNo):'',dateText);
        else if(module==='policeler')parts.push(p.policeNo?('Poliçe '+p.policeNo):'',p.plaka||'',dateText);
        else if(module==='evrak'||module==='evraktakip')parts.push(p.evrakAdi||p.ad||p.belgeNo||p.title||'',p.kategoriAdi||'',p.surumNo?('Sürüm '+p.surumNo):'',dateText);
        else if(module==='scheduled_push_notifications')parts.push(p.title||'Bildirim',p.scheduled_for?fdxTarihSaat(p.scheduled_for):'');
        else parts.push(p.ad||p.unvan||p.firma||p.plaka||p.dosyaNo||p.title||'',p.sube||'',dateText);
        const clean=[...new Set(parts.filter(Boolean).map(String))];return clean.length?clean.join(' · '):(item?.legacy_id?('Kayıt '+String(item.legacy_id).slice(-12)):'Kayıt');
    }
    function fdxAlanAdiniDuzelt(value){return String(value||'Alan').replace(/_/g,' ').replace(/([a-zçğıöşü0-9])([A-ZÇĞİÖŞÜ])/g,'$1 $2').replace(/\s+/g,' ').trim().replace(/^./,char=>char.toLocaleUpperCase('tr-TR'))}
    function fdxFieldLabel(key){const value=String(key||'Alan');if(value.startsWith('satirSayilari.'))return fdxVardiyaAdi(value.split('.').pop())+' satır sayısı';if(value.includes('.'))return value.split('.').map(part=>fdxFieldLabels[part]||fdxAlanAdiniDuzelt(part)).join(' · ');return fdxFieldLabels[value]||fdxAlanAdiniDuzelt(value)}
    function fdxAuditBadge(operation){const op=String(operation||'');return '<span class="fdx-badge '+fdxEsc(op)+'">'+fdxEsc(fdxOperationLabel(op))+'</span>'}
    function fdxComparable(value){try{return JSON.stringify(value??null)}catch(_){return String(value??'')}}
    function fdxAuditBosDeger(value){return value===undefined||value===null||value===''||(Array.isArray(value)&&!value.length)}
    function fdxAuditAlanGosterilir(key,value){if(fdxAuditIgnoredFields.has(String(key)))return false;if(typeof value==='string'&&(value.startsWith('data:')||value.length>12000))return false;return true}
    function fdxChangedKeys(oldData,newData,operation='update'){
        const oldRow=oldData&&typeof oldData==='object'?oldData:{},newRow=newData&&typeof newData==='object'?newData:{},source=operation==='delete'?oldRow:newRow;
        const all=[...new Set([...Object.keys(oldRow),...Object.keys(newRow)])].filter(key=>fdxAuditAlanGosterilir(key,source[key]??oldRow[key])&&fdxComparable(oldRow[key])!==fdxComparable(newRow[key]));
        const usable=operation==='update'?all:all.filter(key=>!fdxAuditBosDeger(source[key]));
        const preferred=['pId','employee_legacy_id','personelAd','ad','unvan','firma','sube','departman','plaka','irsaliyeNo','belgeNo','policeNo','dosyaNo','alacakliKurum','tarih','haftaBaslangic','baslangic','bitis','tur','durum','vardiya','giris','cikis','miktar','birim','fiyat','tutar','toplamBorc','kesintiTutari','primHakki','primHakkiManuel','calisilmayanGun','faturaNo','faturaTarih','aciklama','request_type','scheduled_for','status'];
        return [...preferred.filter(key=>usable.includes(key)),...usable.filter(key=>!preferred.includes(key))];
    }
    function fdxValue(value,key=''){
        const simpleKey=String(key).split('.').pop();
        if(value===undefined||value===null||value==='')return /Manuel$/.test(simpleKey)?'Otomatik hesaplandı':'—';
        if((/tarih|baslangic|bitis|zaman/i.test(simpleKey)||simpleKey==='scheduled_for')&&/^20\d{2}-\d{2}-\d{2}/.test(String(value)))return String(value).includes('T')?fdxTarihSaat(value):fdxTarih(String(value).slice(0,10));
        if(['giris','cikis','girisSaati','cikisSaati'].includes(simpleKey)&&/^\d{1,2}:\d{2}/.test(String(value)))return String(value).slice(0,5);
        if(simpleKey==='surumNo'&&Number.isFinite(Number(value)))return'Sürüm '+Number(value);
        if(simpleKey==='surumGecmisi'&&Array.isArray(value))return value.length+' önceki sürüm';
        if(simpleKey==='dosya'&&value&&typeof value==='object')return String(value.ad||value.name||'Dosya kaydı');
        if(simpleKey==='kategoriId'){try{return evrakKategorileri().find(k=>String(k.id)===String(value))?.ad||String(value)}catch(_){return String(value)}}
        if(/(?:saat|mesai)$/i.test(simpleKey)&&Number.isFinite(Number(value)))return Number(value).toLocaleString('tr-TR',{maximumFractionDigits:2})+' saat';
        const boolValue=typeof value==='boolean'?value:(['1','true','evet','yes'].includes(String(value).toLocaleLowerCase('tr-TR'))?true:(['0','false','hayır','hayir','no'].includes(String(value).toLocaleLowerCase('tr-TR'))?false:null));
        if(simpleKey==='primHakkiManuel'&&boolValue!==null)return boolValue?'Manuel belirlendi':'Otomatik hesaplandı';
        if(/Manuel$/.test(simpleKey)&&boolValue!==null)return boolValue?'Manuel girildi':'Otomatik hesaplandı';
        if(fdxAuditBooleanFields.has(simpleKey)&&boolValue!==null)return boolValue?'Evet':'Hayır';
        if(typeof value==='boolean')return value?'Evet':'Hayır';
        const personKeys=['pId','personelId','employeeId','employee_legacy_id'];if(personKeys.includes(simpleKey)){const person=fdxPersonelBul(value);return person?.ad||String(value)}
        if(simpleKey==='target_employee_ids'&&Array.isArray(value))return value.map(id=>fdxPersonelBul(id)?.ad||('Personel '+String(id).slice(-4))).join(', ');
        if(simpleKey==='vardiya')return fdxVardiyaAdi(value);
        if(simpleKey==='status')return fdxStatus[String(value)]||String(value);
        if(simpleKey==='request_type')return fdxRequestTypes[String(value)]||String(value);
        if(simpleKey==='audience_mode')return({all:'Tüm şirket',selected:'Seçili personeller'}[String(value)]||String(value));
        if(simpleKey==='primHakki')return String(value).toLocaleLowerCase('tr-TR')==='var'?'Prim var':String(value).toLocaleLowerCase('tr-TR')==='yok'?'Prim yok':String(value);
        if(simpleKey==='calisilmayanGun'||simpleKey==='gunSayisi'||simpleKey==='izinGunSayisi')return Number(value).toLocaleString('tr-TR',{maximumFractionDigits:2})+' gün';
        if(simpleKey==='durum'){const code=String(value).toLocaleUpperCase('tr-TR'),labels={PRIM_OZET:'Prim özeti',M:'Mazeretsiz gelmedi',R:'Sağlık / rapor',Z:'Ücretsiz izin',X:'Çalıştı',Y:'Yıllık izin',U:'Ücretli izin','Ü':'Ücretli izin'};if(labels[code])return labels[code]}
        if(/tutar|borc|kesinti|ucret|ücret|fiyat|maas|yevmiye/i.test(simpleKey)&&Number.isFinite(Number(value)))return fdxPara(value);
        if(Array.isArray(value)){if(!value.length)return'—';if(value.every(item=>typeof item!=='object'))return value.map(item=>fdxValue(item,key)).join(', ');return value.map((item,index)=>(index+1)+'. '+fdxValue(item,key)).join('\n')}
        if(typeof value==='object'){const entries=Object.entries(value).filter(([name,item])=>fdxAuditAlanGosterilir(name,item)&&!fdxAuditBosDeger(item));return entries.length?entries.map(([name,item])=>fdxFieldLabel(name)+': '+fdxValue(item,name)).join('\n'):'—'}
        return String(value);
    }
    function fdxAuditPreviewValue(value,key){if(value&&typeof value==='object'&&!Array.isArray(value)){const row=value,person=fdxAuditPersonName(row),vardiya=row.vardiya?fdxVardiyaAdi(row.vardiya):'',gorev=row.gorev||'';return[person||(!row.personelId?'Boş satır':''),vardiya,gorev].filter(Boolean).join(' · ')||'Vardiya satırı'}return fdxValue(value,key)}
    function fdxAuditPreviewLabel(change){const context=change?.context||{},key=String(change?.key||'');if(context.vardiya!==undefined)return fdxVardiyaAdi(context.vardiya)+' '+(Number(context.sira||0)+1)+'. satır · '+fdxFieldLabel(key);return fdxFieldLabel(change?.label||key)}
    function fdxAuditListSummary(item){const changes=Array.isArray(item?.change_preview)?item.change_preview:[],shown=changes.slice(0,3),more=changes.length>shown.length?' · Diğer değişiklikler için detayı açın.':'';if(item.operation==='update'&&shown.length)return shown.map(change=>fdxAuditPreviewLabel(change)+': '+fdxAuditPreviewValue(change.oldValue,change.key)+' → '+fdxAuditPreviewValue(change.newValue,change.key)).join(' · ')+more;if(item.operation==='insert')return'Yeni kayıt eklendi.'+(shown.length?' '+shown.map(change=>fdxAuditPreviewLabel(change)+': '+fdxAuditPreviewValue(change.newValue,change.key)).join(' · '):'');if(item.operation==='delete')return'Kayıt silindi.'+(shown.length?' '+shown.map(change=>fdxAuditPreviewLabel(change)+': '+fdxAuditPreviewValue(change.oldValue,change.key)).join(' · '):'');if(item.operation==='restore')return'Kayıt geri alındı.'+(shown.length?' '+shown.map(change=>fdxAuditPreviewLabel(change)+': '+fdxAuditPreviewValue(change.newValue,change.key)).join(' · '):'');return fdxAuditEntityLabel(item)+' bilgileri güncellendi.'}
    function fdxAuditNarrative(item){const actor=fdxActorName(item),time=fdxTarihSaat(item.created_at),record=fdxAuditRecordName(item),summary=fdxAuditListSummary(item);return actor+', '+time+' tarihinde “'+record+'” kaydında '+summary}
    window.fdxAuditYukle=async function(page){
        const area=document.getElementById('fdxAuditList');if(!area||!fdxManager())return;const requested=Number(page);fdxState.auditPage=Number.isFinite(requested)&&requested>0?Math.floor(requested):Math.max(1,fdxState.auditPage||1);area.innerHTML='<div class="fdx-empty">Denetim kayıtları yükleniyor...</div>';const module=String(document.getElementById('fdxAuditModule')?.value||''),operation=String(document.getElementById('fdxAuditOperation')?.value||''),actor=String(document.getElementById('fdxAuditActor')?.value||'');
        try{const result=await fdxApi({action:'audit-list',page:fdxState.auditPage,pageSize:fdxState.auditPageSize,module,operation,actor});fdxState.audit=Array.isArray(result.items)?result.items:[];fdxState.auditTotal=Number(result.total||0);fdxState.auditPage=Number(result.page||fdxState.auditPage);fdxState.auditModules=Array.isArray(result.modules)?result.modules:[];fdxState.auditActors=Array.isArray(result.actors)?result.actors:[];fdxState.auditHasSystemActor=Boolean(result.hasSystemActor);const select=document.getElementById('fdxAuditModule'),previous=select?.value||'',modules=fdxState.auditModules.sort((a,b)=>fdxModuleLabel(a).localeCompare(fdxModuleLabel(b),'tr'));if(select){select.innerHTML='<option value="">Tüm bölümler</option>'+modules.map(item=>'<option value="'+fdxEsc(item)+'">'+fdxEsc(fdxModuleLabel(item))+'</option>').join('');if(modules.includes(previous))select.value=previous}const actorSelect=document.getElementById('fdxAuditActor'),previousActor=actorSelect?.value||'';if(actorSelect){actorSelect.innerHTML='<option value="">Tüm kullanıcılar</option>'+fdxState.auditActors.map(user=>'<option value="'+fdxEsc(String(user.id||''))+'">'+fdxEsc(user.full_name||user.employee_legacy_id||'Kullanıcı')+'</option>').join('')+(fdxState.auditHasSystemActor?'<option value="system">Sistem / eski kayıt</option>':'');if(previousActor==='system'||fdxState.auditActors.some(user=>String(user.id)===previousActor))actorSelect.value=previousActor}if(!fdxState.audit.length&&fdxState.auditPage>1)return fdxAuditYukle(fdxState.auditPage-1);fdxAuditCiz()}catch(error){fdxYerelHata(area,error)}
    };
    window.fdxAuditFiltreDegisti=function(){fdxState.auditPage=1;fdxAuditYukle(1)};
    window.fdxAuditSayfaDegistir=function(page){const max=Math.max(1,Math.ceil(fdxState.auditTotal/fdxState.auditPageSize));const next=Math.min(max,Math.max(1,Number(page)||1));if(next!==fdxState.auditPage)fdxAuditYukle(next)};
    function fdxAuditSayfaDugmeleri(page,pages){const wanted=new Set([1,2,3,4,5,pages-1,pages,page-2,page-1,page,page+1,page+2]),numbers=[...wanted].filter(value=>value>=1&&value<=pages).sort((a,b)=>a-b);let previous=0,html='';numbers.forEach(value=>{if(previous&&value-previous>1)html+='<span class="fdx-page-dots">…</span>';html+='<button type="button" class="fdx-btn fdx-page-btn '+(value===page?'active':'')+'" '+(value===page?'disabled':'')+' onclick="fdxAuditSayfaDegistir('+value+')">'+value+'</button>';previous=value});return html}
    window.fdxAuditCiz=function(){
        const area=document.getElementById('fdxAuditList');if(!area)return;const items=fdxState.audit,total=fdxState.auditTotal,page=fdxState.auditPage,pageSize=fdxState.auditPageSize,pages=Math.max(1,Math.ceil(total/pageSize)),start=total?(page-1)*pageSize+1:0,end=Math.min(total,page*pageSize),rows=items.length?items.map(item=>'<button type="button" class="fdx-audit-row" onclick="fdxAuditDetay(\''+fdxEsc(String(item.id))+'\')"><span class="fdx-audit-row-top"><span><strong>'+fdxEsc(fdxAuditActionLabel(item))+'</strong><small>'+fdxEsc(fdxAuditRecordName(item))+'</small></span>'+fdxAuditBadge(item.operation)+'</span><span class="fdx-audit-summary"><b>Denetim izi:</b> '+fdxEsc(fdxAuditNarrative(item))+'</span></button>').join(''):'<div class="fdx-empty">Bu filtrede denetim kaydı bulunmuyor.</div>';const pager=total>pageSize?'<div class="fdx-audit-pagination"><span>'+start+'–'+end+' / '+total+' kayıt · Sayfa '+page+' / '+pages+'</span><div><button type="button" class="fdx-btn" '+(page<=1?'disabled':'')+' onclick="fdxAuditSayfaDegistir('+(page-1)+')">←</button>'+fdxAuditSayfaDugmeleri(page,pages)+'<button type="button" class="fdx-btn" '+(page>=pages?'disabled':'')+' onclick="fdxAuditSayfaDegistir('+(page+1)+')">→</button></div></div>':'';area.innerHTML=rows+pager;
    };
    function fdxVardiyaSatirAnahtari(row,index){return String(row?.id||[row?.vardiya,row?.sira??index].join('|'))}
    function fdxVardiyaSatirMetni(row){if(!row)return'—';return[fdxAuditPersonName(row)||(!row.personelId?'Boş satır':''),fdxVardiyaAdi(row.vardiya),row.gorev||''].filter(Boolean).join(' · ')||'Vardiya satırı'}
    function fdxAuditDiziKayitAdi(row,index){if(!row||typeof row!=='object')return(index+1)+'. kayıt';return row.evrakAdi||row.ad||row.personelAd||fdxAuditPersonName(row)||row.plaka||row.dosyaNo||row.irsaliyeNo||row.policeNo||row.tur||((index+1)+'. kayıt')}
    function fdxVardiyaSatirDegisiklikleri(oldRows,newRows){const before=new Map(oldRows.map((row,index)=>[fdxVardiyaSatirAnahtari(row,index),row])),after=new Map(newRows.map((row,index)=>[fdxVardiyaSatirAnahtari(row,index),row])),changes=[];[...new Set([...before.keys(),...after.keys()])].forEach(id=>{const oldRow=before.get(id),newRow=after.get(id),context=newRow||oldRow||{},prefix=fdxVardiyaAdi(context.vardiya)+' '+(Number(context.sira||0)+1)+'. satır';if(!oldRow||!newRow){changes.push({label:prefix,oldValue:fdxVardiyaSatirMetni(oldRow),newValue:fdxVardiyaSatirMetni(newRow)});return}if(String(oldRow.personelId||'')!==String(newRow.personelId||''))changes.push({label:prefix+' · Personel',oldValue:fdxValue(oldRow.personelId,'personelId'),newValue:fdxValue(newRow.personelId,'personelId')});if(String(oldRow.vardiya||'')!==String(newRow.vardiya||''))changes.push({label:prefix+' · Vardiya',oldValue:fdxVardiyaAdi(oldRow.vardiya),newValue:fdxVardiyaAdi(newRow.vardiya)});if(String(oldRow.gorev||'')!==String(newRow.gorev||''))changes.push({label:prefix+' · Görev',oldValue:oldRow.gorev||'—',newValue:newRow.gorev||'—'});if(Number(oldRow.sira||0)!==Number(newRow.sira||0))changes.push({label:prefix+' · Sıra',oldValue:Number(oldRow.sira||0)+1,newValue:Number(newRow.sira||0)+1})});return changes}
    function fdxAuditAlanDegisiklikleri(key,before,after,operation,depth=0){
        if(key==='satirlar'&&(Array.isArray(before)||Array.isArray(after)))return fdxVardiyaSatirDegisiklikleri(Array.isArray(before)?before:[],Array.isArray(after)?after:[]);
        if(key==='surumGecmisi'&&(Array.isArray(before)||Array.isArray(after)))return[{label:'Önceki evrak sürümleri',oldValue:(Array.isArray(before)?before.length:0)+' sürüm',newValue:(Array.isArray(after)?after.length:0)+' sürüm'}];
        if(Array.isArray(before)||Array.isArray(after)){
            const oldList=Array.isArray(before)?before:[],newList=Array.isArray(after)?after:[],changes=[],max=Math.max(oldList.length,newList.length);
            for(let index=0;index<max;index++){
                const oldItem=oldList[index],newItem=newList[index],name=fdxAuditDiziKayitAdi(newItem||oldItem,index),prefix=fdxFieldLabel(key)+' · '+name;
                if(fdxComparable(oldItem)===fdxComparable(newItem))continue;
                if(oldItem&&newItem&&typeof oldItem==='object'&&typeof newItem==='object'){
                    fdxChangedKeys(oldItem,newItem,operation).forEach(subKey=>changes.push({label:prefix+' · '+fdxFieldLabel(subKey),oldValue:fdxValue(oldItem[subKey],subKey),newValue:fdxValue(newItem[subKey],subKey)}));
                }else changes.push({label:prefix,oldValue:fdxValue(oldItem,key),newValue:fdxValue(newItem,key)});
            }
            return changes;
        }
        const beforeObject=before&&typeof before==='object'&&!Array.isArray(before),afterObject=after&&typeof after==='object'&&!Array.isArray(after);
        if(depth<4&&(beforeObject||afterObject)){
            const oldRow=beforeObject?before:{},newRow=afterObject?after:{},nested=[];
            fdxChangedKeys(oldRow,newRow,operation).forEach(subKey=>nested.push(...fdxAuditAlanDegisiklikleri(key+'.'+subKey,oldRow[subKey],newRow[subKey],operation,depth+1)));
            return nested.length?nested:[{label:fdxFieldLabel(key),oldValue:fdxValue(before,key),newValue:fdxValue(after,key)}];
        }
        return[{label:fdxFieldLabel(key),oldValue:fdxValue(before,key),newValue:fdxValue(after,key)}];
    }
    function fdxAuditDegisiklikleri(item,oldData,newData){const changes=[];fdxChangedKeys(oldData,newData,item.operation).forEach(key=>changes.push(...fdxAuditAlanDegisiklikleri(key,oldData[key],newData[key],item.operation)));return changes.map(change=>item.operation==='insert'?{...change,oldValue:'Kayıt yoktu'}:item.operation==='delete'?{...change,newValue:'Kayıt silindi'}:item.operation==='restore'?{...change,oldValue:'Önceki kayıt silinmişti'}:change)}
    window.fdxAuditDetay=async function(id){
        fdxState.auditId=String(id);fdxState.auditDetail=null;const modal=document.getElementById('fdxAuditDetailModal'),changes=document.getElementById('fdxAuditChanges'),actions=document.getElementById('fdxAuditRestoreActions');modal.style.display='flex';changes.innerHTML='<div class="fdx-empty">Değişiklik ayrıntısı yükleniyor...</div>';if(actions){actions.style.display='none';actions.innerHTML=''}
        try{
            const result=await fdxApi({action:'audit-detail',id}),item=result.item||{},oldData=item.old_data&&typeof item.old_data==='object'?item.old_data:{},newData=item.new_data&&typeof item.new_data==='object'?item.new_data:{},rows=fdxAuditDegisiklikleri(item,oldData,newData);
            fdxState.auditDetail=item;
            document.getElementById('fdxAuditDetailTitle').textContent=fdxAuditActionLabel(item);document.getElementById('fdxAuditDetailSubtitle').textContent=fdxAuditRecordName({...item,preview:item.new_data||item.old_data||{}});document.getElementById('fdxAuditDetailMeta').innerHTML='<strong>İşlemi yapan:</strong> '+fdxEsc(fdxActorName(item))+' &nbsp;·&nbsp; <strong>İşlem zamanı:</strong> '+fdxTarihSaat(item.created_at);
            changes.innerHTML=rows.length?'<div class="fdx-change-head"><span>Değişen alan</span><span>Eski değer</span><span></span><span>Yeni değer</span></div>'+rows.map(row=>'<div class="fdx-change"><div class="fdx-change-label">'+fdxEsc(row.label)+'</div><div class="fdx-change-old">'+fdxEsc(row.oldValue)+'</div><div class="fdx-change-arrow">→</div><div class="fdx-change-new">'+fdxEsc(row.newValue)+'</div></div>').join(''):'<div class="fdx-empty">Bu işlemde kullanıcıya gösterilebilecek bir alan değişikliği bulunmuyor.</div>';
            if(actions){if(result.can_restore){const label=item.operation==='insert'?'Eklenen Kaydı Geri Al':item.operation==='delete'?'Silinen Kaydı Geri Getir':'Değişikliği Geri Al';actions.innerHTML='<button id="fdxAuditRestoreButton" type="button" class="fdx-btn danger" onclick="fdxAuditGeriAl()">↶ '+fdxEsc(label)+'</button>';actions.style.display='flex'}else if(result.restore_reason){actions.innerHTML='<div class="fdx-state" style="width:100%">'+fdxEsc(result.restore_reason)+'</div>';actions.style.display='flex'}}
        }catch(error){fdxYerelHata(changes,error)}
    };
    window.fdxAuditGeriAl=async function(){
        const item=fdxState.auditDetail;if(!item||!fdxState.auditId)return;
        const action=item.operation==='insert'?'Bu işlemle eklenen kayıt kaldırılacak.':item.operation==='delete'?'Bu işlemle silinen kayıt yeniden oluşturulacak.':'Kayıt bu işlemden önceki değerlerine döndürülecek.';
        if(!await fdxOnay(action+' Sonradan yapılmış bir değişiklik varsa sistem işleme izin vermeyecektir. Devam edilsin mi?','Kaydı Geri Al','Geri Al'))return;
        const button=document.getElementById('fdxAuditRestoreButton');if(button){button.disabled=true;button.textContent='Geri alınıyor...'}
        try{await fdxApi({action:'audit-restore',id:fdxState.auditId});showToast?.('Kayıt güvenli biçimde geri alındı. Ekran yenileniyor...','success');setTimeout(()=>window.location.reload(),700)}catch(error){if(button){button.disabled=false;button.textContent='↶ Tekrar Dene'}alert(fdxHata(error,'Kayıt geri alınamadı.'))}
    };

    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fdxKur);else fdxKur();
})();

