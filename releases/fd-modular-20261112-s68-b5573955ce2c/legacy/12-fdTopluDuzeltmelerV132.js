
(function(){
    const fdEsc=v=>typeof escapeDashboardText==='function'?escapeDashboardText(String(v??'')):String(v??'').replace(/[&<>\"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[s]));
    const fdWait=ms=>new Promise(r=>setTimeout(r,ms));

    // Drive isteklerini geçici ağ/Apps Script hatalarında yeniden dene.
    async function fdDriveSaglamIstek(payload){
        let sonHata=null;
        for(let deneme=1;deneme<=4;deneme++){
            try{
                const response=await fetch(GOOGLE_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
                const metin=await response.text();let sonuc=null;
                try{sonuc=JSON.parse(metin);}catch(_){throw Object.assign(new Error('Dosya servisinden geçersiz yanıt alındı.'),{gecici:true});}
                if(!response.ok)throw Object.assign(new Error(sonuc?.hata||('Dosya servisi yanıt vermedi ('+response.status+').')),{gecici:[404,408,425,429,500,502,503,504].includes(response.status)});
                if(!sonuc?.basarili||!sonuc?.dosya?.id)throw new Error(sonuc?.hata||'Dosya yüklenemedi.');
                return sonuc.dosya;
            }catch(hata){sonHata=hata;const gecici=hata?.name==='TypeError'||hata?.gecici;if(!gecici||deneme===4)break;await fdWait(700*deneme);}
        }
        throw sonHata||new Error('Dosya yüklenemedi.');
    }
    fdYazilimDrivePdfYukle=(base64,dosyaAdi,eskiDosyaId='',modul='GENEL BELGELER')=>fdDriveSaglamIstek({islem:'pdfYukle',base64,dosyaAdi,eskiDosyaId,modul,yuklemeId:'pdf_'+Date.now()+'_'+Math.random().toString(36).slice(2)});
    fdYazilimDriveDosyaYukle=(base64,dosyaAdi,mimeType,eskiDosyaId='',modul='GENEL BELGELER')=>fdDriveSaglamIstek({islem:'dosyaYukle',base64,dosyaAdi,mimeType,eskiDosyaId,modul,yuklemeId:'dosya_'+Date.now()+'_'+Math.random().toString(36).slice(2)});

    // İcra listeleri de ortak, görünür PDF üretimini kullanır.
    /* Enforcement PDF adapter moved to modules/icra. */
    /* Enforcement PDF adapter moved to modules/icra. */
    // Daire detayında masraf ekleme düğmesini kaldır.
    /* Rental workflow moved to the lazy module. */
// Ana ekranda giriş yapmış tüm kullanıcılar; aktiflik, son giriş/çıkış ve kişi bazlı bildirim.
    function fdSessionModalKur(){if(document.getElementById('fdSessionHistoryModal'))return;const m=document.createElement('div');m.id='fdSessionHistoryModal';m.className='modal-overlay';m.innerHTML='<div class="modal-card" style="width:min(920px,96vw);max-height:90vh"><div class="modal-header"><h3 id="fdSessionHistoryTitle">Giriş Geçmişi</h3><button class="modal-close" onclick="modalKapat(\'fdSessionHistoryModal\')">✕</button></div><div class="modal-body" id="fdSessionHistoryBody"></div></div>';document.body.appendChild(m);}
    window.fdAktifKullaniciGecmisi=async function(userId,ad){fdSessionModalKur();const body=document.getElementById('fdSessionHistoryBody');document.getElementById('fdSessionHistoryTitle').textContent=ad+' · Son 1 Aylık Girişler';body.innerHTML='<div class="dashboard-empty">Girişler yükleniyor...</div>';document.getElementById('fdSessionHistoryModal').style.display='flex';try{const d=new Date();d.setDate(d.getDate()-30);const{data,error}=await supabaseClient.from('portal_user_sessions').select('role,signed_in_at,last_seen_at,signed_out_at').eq('company_id',aktifSirketId()).eq('user_id',userId).gte('signed_in_at',d.toISOString()).order('signed_in_at',{ascending:false});if(error)throw error;body.innerHTML=(data||[]).length?'<table class="fd-session-history-table"><thead><tr><th>Giriş</th><th>Çıkış / Son Etkinlik</th><th>Rol</th></tr></thead><tbody>'+(data||[]).map(s=>'<tr><td>'+kullaniciOturumTarihSaat(s.signed_in_at)+'</td><td>'+kullaniciOturumBitisMetni(s)+'</td><td>'+fdEsc(s.role==='Yonetici'?'Kullanıcı':(s.role||'-'))+'</td></tr>').join('')+'</tbody></table>':'<div class="dashboard-empty">Son 1 ayda giriş kaydı bulunmuyor.</div>';}catch(e){body.innerHTML='<div class="dashboard-empty" style="color:#b91c1c">Giriş geçmişi alınamadı.</div>';}};
    let fdOturumKullaniciListesi=[];
    let fdOturumKayitOnbellegi=[],fdOturumKayitZamani=0,fdOturumKayitSozu=null;
    async function fdTumOturumKayitlariniAl(zorla=false){
        if(!zorla&&fdOturumKayitZamani&&Date.now()-fdOturumKayitZamani<60*1000)return fdOturumKayitOnbellegi;
        if(fdOturumKayitSozu)return fdOturumKayitSozu;
        fdOturumKayitSozu=(async()=>{
        const tum=[];
        for(let bas=0;bas<10000;bas+=1000){
            const{data,error}=await supabaseClient.from('portal_user_sessions').select('user_id,employee_legacy_id,username,role,signed_in_at,last_seen_at,signed_out_at').eq('company_id',aktifSirketId()).order('signed_in_at',{ascending:false}).range(bas,bas+999);
            if(error)throw error;tum.push(...(data||[]));if(!data||data.length<1000)break;
        }
        fdOturumKayitOnbellegi=tum;fdOturumKayitZamani=Date.now();return tum;
        })();
        try{return await fdOturumKayitSozu}finally{fdOturumKayitSozu=null}
    }
    window.fdOturumKullanicilariniFiltrele=function(){
        const q=String(document.getElementById('fdOturumKullaniciAra')?.value||'').toLocaleLowerCase('tr-TR');
        fdOturumKartlariniCiz(fdOturumKullaniciListesi.filter(s=>!q||String([s.ad,s.sube].join(' ')).toLocaleLowerCase('tr-TR').includes(q)));
    };
    function fdOturumKartlariniCiz(liste){
        const alan=document.getElementById('fdOturumKullaniciKartlari');if(!alan)return;
        alan.innerHTML=liste.length?liste.map(s=>'<div class="fd-active-user '+(s.aktif?'active':'offline')+'"><button type="button" class="fd-active-user-main" title="Giriş–çıkış geçmişini göster" data-user="'+fdEsc(s.user_id)+'" data-ad="'+fdEsc(s.ad)+'" onclick="fdAktifKullaniciGecmisi(this.dataset.user,this.dataset.ad)"><span class="fd-active-dot"></span><span><strong>'+fdEsc(s.ad)+'</strong><small>'+fdEsc(s.sube||'Şube belirtilmemiş')+'</small></span></button><button type="button" class="fd-session-notify" title="Bu kişiye bildirim gönder" data-personel="'+fdEsc(s.personelTc||'')+'" data-ad="'+fdEsc(s.ad)+'" onclick="fdOturumKullanicisinaBildirim(this)" '+(!s.personelTc?'disabled':'')+'>🔔</button></div>').join(''):'<div class="dashboard-empty">Aramaya uygun kullanıcı bulunamadı.</div>';
    }
    window.fdOturumKullanicisinaBildirim=async function(dugme){
        const personelId=String(dugme?.dataset?.personel||''),ad=String(dugme?.dataset?.ad||'Kullanıcı');if(!personelId)return showToast('Bu kullanıcı personel kaydıyla eşleşmiyor.','warning');
        await openBildirimModal();fdBildirimTumPersonelleriSec(false);const kutu=[...document.querySelectorAll('#fdBildirimPersonelListesi .fd-bildirim-personel-sec')].find(x=>String(x.value)===personelId);
        if(!kutu){return showToast(ad+' aktif personel listesinde bulunamadı.','warning')}kutu.checked=true;fdBildirimHedefOzetiniGuncelle();document.getElementById('fdBildirimBaslik').value='';document.getElementById('fdBildirimMesaj')?.focus();
    };
    kullaniciOturumPaneliniYukle=async function(bildirimGoster=false){
        const panel=document.getElementById('adminSessionPanel'),body=document.getElementById('adminSessionBody');if(!panel||!body)return;const adminMi=activeUser?.rol==='Admin';panel.style.display=adminMi?'block':'none';if(!adminMi||!SUPABASE_MODE||!supabaseClient)return;if(bildirimGoster)body.innerHTML='<div class="dashboard-empty">Kullanıcılar yenileniyor...</div>';
        try{
            const simdi=new Date(),kayitlar=await fdTumOturumKayitlariniAl(bildirimGoster),tekil=new Map();
            kayitlar.forEach(s=>{const id=String(s.user_id);if(!tekil.has(id))tekil.set(id,s)});
            fdOturumKullaniciListesi=[...tekil.values()].map(s=>{const tc=String(s.employee_legacy_id||''),hesap=kullanicilar.find(k=>String(k.supabaseUserId||k.id||'')===String(s.user_id)||(tc&&String(k.tcNo||'')===tc)),personelTc=tc||String(hesap?.tcNo||''),p=personeller.find(x=>String(x.id)===personelTc&&aktifSirketeAit(x)),son=new Date(s.last_seen_at||s.signed_in_at).getTime(),aktif=!s.signed_out_at&&Number.isFinite(son)&&simdi.getTime()-son<=KULLANICI_OTURUM_AKTIFLIK_ESIGI;return{...s,personelTc,ad:p?.ad||hesap?.ad||s.username||'Kullanıcı',sube:p?.sube||'',rol:s.role==='Yonetici'?'Kullanıcı':(s.role||'-'),aktif}}).sort((a,b)=>Number(b.aktif)-Number(a.aktif)||String(b.last_seen_at||b.signed_in_at).localeCompare(String(a.last_seen_at||a.signed_in_at)));
            const aktif=fdOturumKullaniciListesi.filter(s=>s.aktif).length,cevrimdisi=fdOturumKullaniciListesi.length-aktif;document.getElementById('adminSessionActiveCount').textContent=aktif+' aktif';document.getElementById('adminSessionOfflineCount').textContent=cevrimdisi+' çevrimdışı';document.getElementById('adminSessionTotalCount').textContent=fdOturumKullaniciListesi.length+' kullanıcı';
            body.innerHTML=fdOturumKullaniciListesi.length?'<div class="fd-session-toolbar"><input id="fdOturumKullaniciAra" placeholder="İsim veya şube ara..." oninput="fdOturumKullanicilariniFiltrele()"><small style="margin-left:auto;color:#64748b">Karta tıklayın: giriş geçmişi · 🔔: kişiye bildirim</small></div><div id="fdOturumKullaniciKartlari" class="fd-active-user-grid"></div>':'<div class="dashboard-empty">Henüz giriş yapmış kullanıcı bulunmuyor.</div>';fdOturumKartlariniCiz(fdOturumKullaniciListesi);if(bildirimGoster)showToast('Kullanıcı oturumları yenilendi.');
        }catch(e){console.warn(e);body.innerHTML='<div class="dashboard-empty" style="color:#b45309">Kullanıcı oturumları alınamadı.</div>';}
    };

    // Faturaya dönüşen irsaliyenin fatura bilgisini düzenle.
    /* Waybill invoice edit/list wrapper moved in original order to modules/irsaliye. */
    // Puantaj başlığını kompaktlaştır.
    function fdPuantajMazeretsizBaslik(){document.querySelectorAll('#puantajApp th').forEach(e=>{const t=String(e.textContent||'').replace(/\s+/g,' ').trim().toLocaleLowerCase('tr-TR');if(t.includes('gelmedi')&&t.includes('mazeretsiz')){e.textContent='Gelmedi-Mazrtsz';e.dataset.fdMazeretsiz='1';}});}
    const fdPuantajCizV132=renderPuantajMatrisi;renderPuantajMatrisi=function(){const r=fdPuantajCizV132.apply(this,arguments);fdPuantajMazeretsizBaslik();return r;};

    // Toplu maaş zammı ve ücret geçmişi.
    /* Salary UI moved together to modules/ucretguncelleme. */
    /* Salary UI moved together to modules/ucretguncelleme. */
    /* Salary UI moved together to modules/ucretguncelleme. */
    /* Salary UI moved together to modules/ucretguncelleme. */
    /* Salary UI moved together to modules/ucretguncelleme. */
    /* Salary UI moved together to modules/ucretguncelleme. */
    /* Salary UI moved together to modules/ucretguncelleme. */
    /* Salary UI moved together to modules/ucretguncelleme. */
    function fdTopluZamButonuKur(){if(isPersonelUser()||document.getElementById('fdTopluZamBtn'))return;const alan=document.querySelector('#personelApp main>div:first-child .personel-export-actions');if(!alan)return;const b=document.createElement('button');b.id='fdTopluZamBtn';b.type='button';b.className='btn-export';b.style.cssText='background:#0f766e;color:#fff;border-color:#0f766e';b.textContent='₺ Toplu Maaş Zammı';b.onclick=fdTopluZamAc;alan.prepend(b);}
    window.fdPersonelListeOrtakDugmeleriniKur=fdTopluZamButonuKur;
    function fdV132Kur(){fdSessionModalKur();fdTopluZamButonuKur();fdPuantajMazeretsizBaslik();const panel=document.getElementById('adminSessionPanel');if(panel)panel.open=localStorage.getItem('fdOturumPaneliAcik')==='1';}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fdV132Kur);else fdV132Kur();
})();

