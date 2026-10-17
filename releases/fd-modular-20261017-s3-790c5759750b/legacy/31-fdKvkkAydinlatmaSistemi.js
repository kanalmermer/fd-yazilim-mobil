
(function(){
    const FONKSIYON='kvkk-notice';
    let aktifBelge=null, kontrolSozu=null;
    function hataMetni(error,varsayilan='İşlem tamamlanamadı.'){
        return String(error?.message||error?.context?.body?.message||varsayilan);
    }
    async function cagir(body){
        if(!SUPABASE_MODE||!supabaseClient)throw new Error('KVKK kaydı için güvenli oturum gerekli.');
        const istek=async(token)=>fetch(SUPABASE_URL+'/functions/v1/'+FONKSIYON,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token,'apikey':SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify(body)});
        let {data:oturum,error:oturumHatasi}=await supabaseClient.auth.getSession();if(oturumHatasi)throw oturumHatasi;
        let token=oturum?.session?.access_token;if(!token){await new Promise(resolve=>setTimeout(resolve,250));const yeniden=await supabaseClient.auth.getSession();if(yeniden.error)throw yeniden.error;token=yeniden.data?.session?.access_token}
        if(!token)throw new Error('Oturum süresi dolmuş. Yeniden giriş yapın.');
        let response=await istek(token);
        if(response.status===401){const yenileme=await supabaseClient.auth.refreshSession();if(yenileme.error)throw yenileme.error;token=yenileme.data?.session?.access_token;if(!token)throw new Error('Güvenli oturum yenilenemedi. Yeniden giriş yapın.');response=await istek(token)}
        let data={};try{data=await response.json()}catch(_){throw new Error('KVKK sunucusundan geçerli yanıt alınamadı. ('+response.status+')')}
        if(!response.ok||!data?.success)throw new Error(data?.message||('KVKK sunucusu hatası: '+response.status));return data;
    }
    function modalHazirla(){
        const modal=document.getElementById('modalKvkkAydinlatma');if(!modal)return null;
        modal.style.display='flex';document.getElementById('kvkkModalYukleniyor').style.display='block';document.getElementById('kvkkModalIcerik').style.display='none';document.getElementById('kvkkModalHata').style.display='none';document.getElementById('kvkkOnaySatiri').style.display='none';document.getElementById('kvkkOkudum').checked=false;document.getElementById('kvkkOnaylaBtn').disabled=true;return modal;
    }
    window.fdKvkkErisimKontrolu=async function(zorla=false){
        if(!activeUser||!SUPABASE_MODE){document.getElementById('modalKvkkAydinlatma').style.display='none';return true}
        if(['Personel','IsgUzmani','IsyeriHekimi'].includes(activeUser.rol)&&activeUser.sifreDegismeli){document.getElementById('modalKvkkAydinlatma').style.display='none';return false}
        if(kontrolSozu&&!zorla)return kontrolSozu;
        kontrolSozu=(async()=>{
            try{
                const sonuc=await cagir({action:'get-active'});aktifBelge=sonuc.document;
                if(sonuc.acknowledged){document.getElementById('modalKvkkAydinlatma').style.display='none';return true}
                modalHazirla();
                document.getElementById('kvkkModalYukleniyor').style.display='none';
                const icerik=document.getElementById('kvkkModalIcerik');icerik.textContent=aktifBelge.content||'';icerik.style.display='block';
                document.getElementById('kvkkModalSurum').textContent=(aktifBelge.title||'KVKK Aydınlatma Metni')+' · Sürüm '+(aktifBelge.version||'-');
                document.getElementById('kvkkOnaySatiri').style.display='flex';return false;
            }catch(error){
                modalHazirla();
                document.getElementById('kvkkModalYukleniyor').style.display='none';const alan=document.getElementById('kvkkModalHata');alan.innerHTML=escapeDashboardText(hataMetni(error,'Aydınlatma metni alınamadı.'))+'<br><button type="button" class="btn-modern btn-detail-modern" style="margin-top:10px" onclick="fdKvkkErisimKontrolu(true)">Yeniden Dene</button>';alan.style.display='block';return false;
            }finally{kontrolSozu=null}
        })();return kontrolSozu;
    };
    window.kvkkAydinlatmayiOnayla=async function(){
        if(!document.getElementById('kvkkOkudum')?.checked)return;
        const dugme=document.getElementById('kvkkOnaylaBtn');dugme.disabled=true;dugme.textContent='Kaydediliyor...';
        try{await cagir({action:'accept',userAgent:navigator.userAgent});document.getElementById('modalKvkkAydinlatma').style.display='none';showToast('KVKK aydınlatma teyidiniz kaydedildi.','success');}
        catch(error){showToast(hataMetni(error,'KVKK teyidi kaydedilemedi.'),'error');dugme.disabled=false}
        finally{dugme.textContent='Okudum, Devam Et'}
    };
    window.kvkkAyarlariniYukle=async function(){
        if(!isManagerUser())return;const durum=document.getElementById('ayarKvkkDurum');if(!durum)return;durum.textContent='Güncel metin yükleniyor...';
        try{const sonuc=await cagir({action:'get-active'}),belge=sonuc.document||{};document.getElementById('ayarKvkkBaslik').value=belge.title||'';document.getElementById('ayarKvkkSurum').value=belge.version||'1.0';document.getElementById('ayarKvkkMetni').value=belge.content||'';durum.textContent='Yürürlükteki sürüm: '+(belge.version||'-')+' · '+new Date(belge.created_at).toLocaleString('tr-TR');}
        catch(error){durum.textContent=hataMetni(error,'Metin yüklenemedi.');durum.style.color='#b91c1c'}
    };
    window.kvkkMetniniYayinla=async function(dugme){
        if(!isManagerUser())return;const title=document.getElementById('ayarKvkkBaslik').value.trim(),version=document.getElementById('ayarKvkkSurum').value.trim(),content=document.getElementById('ayarKvkkMetni').value.trim();
        if(!title||!version||content.length<300)return showToast('Başlık, sürüm ve ayrıntılı metni doldurun.','warning');
        if(!await fdYuzerOnaySor('Yeni sürüm yayımlandığında tüm kullanıcıların uygulamaya devam etmek için bu metni yeniden teyit etmesi gerekir. Yayımlansın mı?','KVKK Metnini Yayımla','Yayımla'))return;
        const eski=dugme.innerHTML;dugme.disabled=true;dugme.textContent='Yayımlanıyor...';
        try{const sonuc=await cagir({action:'publish',title,version,content});if(sonuc.unchanged)showToast('Metinde veya sürümde değişiklik yok.','warning');else{showToast('Yeni KVKK aydınlatma metni yayımlandı.','success');await fdKvkkErisimKontrolu(true)}}
        catch(error){showToast(hataMetni(error,'Metin yayımlanamadı.'),'error')}
        finally{dugme.disabled=false;dugme.innerHTML=eski}
    };
    window.kvkkPersonelDurumunuYukle=async function(employeeId){
        const alan=document.getElementById('personelKvkkDurumu');if(!alan)return;alan.textContent='Onay kaydı kontrol ediliyor...';
        try{const sonuc=await cagir({action:'employee-status',employeeId:String(employeeId||'')}),durum=sonuc.status;if(!durum){alan.innerHTML='<span style="color:#b45309;font-weight:800;">Yürürlükte bir aydınlatma metni bulunmuyor.</span>';return}if(durum.acknowledged){alan.innerHTML='<span class="badge" style="background:#dcfce7;color:#166534;">✓ Teyit Edildi</span><div style="margin-top:7px;"><strong>Sürüm '+escapeDashboardText(durum.version||'-')+'</strong> · '+new Date(durum.acceptedAt).toLocaleString('tr-TR')+'</div>'}else alan.innerHTML='<span class="badge" style="background:#fee2e2;color:#b91c1c;">Teyit Edilmedi</span><div style="margin-top:7px;">Personel, yürürlükteki '+escapeDashboardText(durum.version||'-')+' sürümünü henüz teyit etmedi.</div>'}
        catch(error){alan.innerHTML='<span style="color:#b91c1c;">'+escapeDashboardText(hataMetni(error,'Onay kaydı alınamadı.'))+'</span>'}
    };
    const oncekiShowHub=window.showHub;
    if(typeof oncekiShowHub==='function')window.showHub=function(){const sonuc=oncekiShowHub.apply(this,arguments);if(!(activeUser?.rol==='Personel'&&activeUser?.sifreDegismeli))fdKvkkErisimKontrolu();return sonuc};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(activeUser&&!(activeUser.rol==='Personel'&&activeUser.sifreDegismeli))fdKvkkErisimKontrolu()});else if(activeUser&&!(activeUser.rol==='Personel'&&activeUser.sifreDegismeli))fdKvkkErisimKontrolu();
})();

