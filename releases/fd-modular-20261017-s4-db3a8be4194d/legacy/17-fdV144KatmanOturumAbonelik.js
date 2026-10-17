
(function(){
    /* Kaydetme perdesi açıkken Esc arkadaki pencereyi kapatmasın. */
    window.addEventListener('keydown',function(e){
        if(e.key!=='Escape')return;
        const o=document.getElementById('globalOverlay');
        if(o&&getComputedStyle(o).display!=='none'){e.preventDefault();e.stopImmediatePropagation()}
    },true);

    /* Bir saat gerçek kullanıcı hareketi olmazsa oturumu kapat. */
    const BOS_KALMA_SURESI=60*60*1000;
    let sonHareket=Date.now(),cikisYapiliyor=false;
    function hareket(){sonHareket=Date.now()}
    ['pointerdown','pointermove','keydown','touchstart','wheel','scroll'].forEach(ad=>window.addEventListener(ad,hareket,{capture:true,passive:true}));
    async function eskiAcikOturumlariKapat(){
        if(!SUPABASE_MODE||!supabaseClient||!activeUser?.sirketId)return;
        const esik=Date.now()-BOS_KALMA_SURESI,baslangic=new Date(Date.now()-35*24*60*60*1000).toISOString();
        try{
            const{data,error}=await supabaseClient.from('portal_user_sessions').select('id,signed_in_at,last_seen_at,signed_out_at').eq('company_id',activeUser.sirketId).gte('signed_in_at',baslangic).order('signed_in_at',{ascending:false}).limit(1000);
            if(error)throw error;
            const duzeltilecek=(data||[]).map(k=>{const sonEtkinlik=String(k.last_seen_at||k.signed_in_at||''),sonMs=new Date(sonEtkinlik).getTime(),cikisMs=new Date(k.signed_out_at||'').getTime(),acikVeSuresiDoldu=!k.signed_out_at&&Number.isFinite(sonMs)&&sonMs<esik,tutarsizCikis=k.signed_out_at&&Number.isFinite(sonMs)&&Number.isFinite(cikisMs)&&cikisMs-sonMs>KULLANICI_OTURUM_TUTARSIZ_CIKIS_ESIGI;return(acikVeSuresiDoldu||tutarsizCikis)?{id:k.id,sonEtkinlik}:null}).filter(Boolean);
            const sonuclar=await Promise.allSettled(duzeltilecek.map(k=>supabaseClient.from('portal_user_sessions').update({signed_out_at:k.sonEtkinlik}).eq('company_id',activeUser.sirketId).eq('id',k.id)));
            const hata=sonuclar.find(x=>x.status==='rejected'||x.value?.error);if(hata)console.warn('Bazı eski oturum süreleri düzeltilemedi:',hata.reason||hata.value?.error);
            if(duzeltilecek.length){fdOturumKayitZamani=0;fdOturumKayitOnbellegi=[]}
        }catch(e){console.warn('Süresi dolan oturumlar kapatılamadı:',e)}
    }
    let arkaPlanKapanisGonderildi=false;
    function kullaniciOturumunuArkaPlandaKapat(){
        if(arkaPlanKapanisGonderildi||!aktifKullaniciOturumId||!activeUser?.supabaseUserId||!aktifKullaniciOturumToken)return;
        arkaPlanKapanisGonderildi=true;const simdi=new Date().toISOString(),id=aktifKullaniciOturumId,userId=activeUser.supabaseUserId,token=aktifKullaniciOturumToken;
        fetch(SUPABASE_URL+'/rest/v1/portal_user_sessions?id=eq.'+encodeURIComponent(id)+'&user_id=eq.'+encodeURIComponent(userId),{method:'PATCH',keepalive:true,headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+token,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({last_seen_at:simdi,signed_out_at:simdi})}).catch(()=>{});
        aktifKullaniciOturumId='';aktifKullaniciOturumToken='';sessionStorage.removeItem(KULLANICI_OTURUM_ANAHTARI);
    }
    async function bosKalmaKontrolu(){
        if(cikisYapiliyor||!activeUser||Date.now()-sonHareket<BOS_KALMA_SURESI)return false;
        cikisYapiliyor=true;
        try{await logout();setTimeout(()=>showToast?.('1 saat işlem yapılmadığı için oturum kapatıldı.','warning'),100)}catch(e){console.warn('Otomatik çıkış yapılamadı:',e);cikisYapiliyor=false}
        return true;
    }
    const oturumBaslatEski=window.kullaniciOturumunuBaslat;
    if(typeof oturumBaslatEski==='function')window.kullaniciOturumunuBaslat=async function(){hareket();arkaPlanKapanisGonderildi=false;const r=await oturumBaslatEski.apply(this,arguments);await eskiAcikOturumlariKapat();return r};
    const kalpAtisiEski=window.kullaniciOturumKalpAtisi;
    if(typeof kalpAtisiEski==='function')window.kullaniciOturumKalpAtisi=async function(){if(await bosKalmaKontrolu())return;return kalpAtisiEski.apply(this,arguments)};
    setInterval(bosKalmaKontrolu,30000);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')bosKalmaKontrolu()},true);
    window.addEventListener('pagehide',e=>{if(!e.persisted)kullaniciOturumunuArkaPlandaKapat()},true);

    /* Abonelik faturalarında ödeme durumu takibini kaldır. */
    function abonelikArayuzunuSadelestir(){
        document.getElementById('kiraAbonelikDurumFiltre')?.remove();
        ['kiraAbonelikDurum','kiraAbonelikOdemeTarih'].forEach(id=>{const grup=document.getElementById(id)?.closest('.form-group');if(grup)grup.style.display='none'});
        const tablo=document.getElementById('kiraAbonelikTbody')?.closest('table');
        if(tablo)tablo.querySelector('thead').innerHTML='<tr><th>Daire</th><th>Dönem</th><th>Tür</th><th>Fatura No</th><th>Tutar</th><th>Not</th><th>İşlem</th></tr>';
    }
    const arayuzEski=window.kiraVergiVeAbonelikArayuzuHazirla;
    if(typeof arayuzEski==='function')window.kiraVergiVeAbonelikArayuzuHazirla=function(){const r=arayuzEski.apply(this,arguments);abonelikArayuzunuSadelestir();return r};
    const formEski=window.kiraAbonelikFormuAc;
    if(typeof formEski==='function')window.kiraAbonelikFormuAc=function(){const r=formEski.apply(this,arguments);abonelikArayuzunuSadelestir();return r};
    const kaydetEski=window.kiraAbonelikKaydet;
    if(typeof kaydetEski==='function')window.kiraAbonelikKaydet=async function(e){
        let durum=document.getElementById('kiraAbonelikDurum'),tarih=document.getElementById('kiraAbonelikOdemeTarih');
        if(!durum){durum=document.createElement('select');durum.id='kiraAbonelikDurum';durum.innerHTML='<option value="bekliyor">Bekliyor</option>';document.querySelector('#modalKiraAbonelik form')?.appendChild(durum)}
        if(!tarih){tarih=document.createElement('input');tarih.id='kiraAbonelikOdemeTarih';tarih.type='date';document.querySelector('#modalKiraAbonelik form')?.appendChild(tarih)}
        durum.value='bekliyor';tarih.value='';return kaydetEski.apply(this,arguments);
    };
    window.kiraAbonelikleriCiz=function(){
        abonelikArayuzunuSadelestir();const body=document.getElementById('kiraAbonelikTbody');if(!body)return;
        const daire=document.getElementById('kiraAbonelikDaireFiltre')?.value||'',tur=document.getElementById('kiraAbonelikTurFiltre')?.value||'',liste=kiraAbonelikler().filter(f=>(!daire||String(f.daireId)===daire)&&(!tur||f.tur===tur)).sort((a,b)=>String(b.donem||'').localeCompare(String(a.donem||''))),toplam=liste.reduce((s,f)=>s+Number(f.tutar||0),0);
        document.getElementById('kiraAbonelikToplam').textContent='Liste Toplamı: '+paraFormatla(toplam);
        body.innerHTML=liste.map(f=>{const id=typeof fdEsc==='function'?fdEsc(f.id):escapeDashboardText(String(f.id));return '<tr><td><button class="kira-link" onclick="kiraDaireDetayAc(\''+escapeDashboardText(String(f.daireId))+'\')">'+escapeDashboardText(kiraDaireAdi(f.daireId))+'</button></td><td>'+escapeDashboardText(f.donem||'-')+'</td><td>'+escapeDashboardText(f.tur||'-')+'</td><td>'+escapeDashboardText(f.faturaNo||'-')+'</td><td><strong>'+paraFormatla(f.tutar)+'</strong></td><td>'+escapeDashboardText(f.not||'-')+'</td><td><span class="fd-mini-actions"><button class="fd-icon-btn fd-icon-edit" title="Düzenle" onclick="kiraAbonelikFormuAc(\''+id+'\')">✎</button><button class="fd-icon-btn fd-icon-delete" title="Sil" onclick="kiraKayitSil(\''+id+'\')">🗑</button></span></td></tr>'}).join('')||'<tr><td colspan="7" style="text-align:center;padding:24px;color:#64748b">Abonelik faturası bulunmuyor.</td></tr>';
    };
    abonelikArayuzunuSadelestir();
})();

