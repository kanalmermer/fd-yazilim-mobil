// Cold personnel dashboard/role cards and shared notification transport; no private workspace state.
(function(){'use strict';let fdWorkColdSetup=false;
const FDX_ENDPOINT='work-center-v2';
function fdxEsc(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
function fdxManager(){try{return typeof isManagerUser==='function'&&isManagerUser()}catch(_){return false}}
function fdxPersonel(){try{return Boolean(activeUser&&activeUser.rol==='Personel')}catch(_){return false}}
function fdxTarihSaat(value){if(!value)return '-';const date=new Date(value);return Number.isNaN(date.getTime())?fdxEsc(value):date.toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function fdxTarih(value){if(!value)return '-';try{return typeof tarihFormati==='function'?tarihFormati(value):new Date(value+'T00:00:00').toLocaleDateString('tr-TR')}catch(_){return String(value)}}
function fdxHata(error,varsayilan='İşlem tamamlanamadı.'){return String(error?.message||varsayilan)}
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
async function fdxApi(body,fdScope){
        if(fdScope&&!fdScope())throw Error('Oturum değişti.');
        if(!window.supabase||typeof supabaseClient==='undefined')throw new Error('Denetim Merkezi bağlantısı kullanılamıyor. Ana kayıtlarınız etkilenmedi.');
        let sessionResult;
        try{sessionResult=await supabaseClient.auth.getSession()}catch(_){throw new Error('Denetim Merkezi bağlantısı doğrulanamadı. Ana program açık kalır ve kayıtlarınız etkilenmez.');}
        if(fdScope&&!fdScope())throw Error('Oturum değişti.');
        const token=sessionResult?.data?.session?.access_token;
        if(sessionResult?.error||!token)throw new Error('Denetim Merkezi bağlantısı doğrulanamadı. Ana program açık kalır ve kayıtlarınız etkilenmez.');
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000);
        try{
            const response=await fetch(SUPABASE_URL+'/functions/v1/'+FDX_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token,'apikey':SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify(body||{}),signal:controller.signal});
            let data={};try{data=await response.json()}catch(_){throw new Error('Denetim Merkezi sunucusundan geçerli yanıt alınamadı.');}
            if(fdScope&&!fdScope())throw Error('Oturum değişti.');
            if(!response.ok||!data?.success){if(response.status===401)throw new Error('Denetim Merkezi bağlantısı doğrulanamadı. Ana ekran ve kayıtlar etkilenmedi.');throw new Error(data?.message||'İşlem tamamlanamadı.');}
            return data;
        }catch(error){if(error?.name==='AbortError')throw new Error('Denetim Merkezi yanıt vermedi. Ana program ve kayıtlar etkilenmedi.');throw error}finally{clearTimeout(timer)}
    }
window.fdxPlanliBildirimApi=fdxApi;
function fdxKur(){
        if(fdWorkColdSetup)return;fdWorkColdSetup=true;
        const launcher=document.querySelector('#appHub .workspace-launcher');
        if(launcher&&!document.getElementById('fdxMyRequestsCard')){
            const requestCard=document.createElement('button');requestCard.type='button';requestCard.id='fdxMyRequestsCard';requestCard.className='workspace-card fdx-personel-card';requestCard.dataset.personelMenu='talepler';requestCard.style.display='none';requestCard.onclick=()=>fdxTaleplerimAc();requestCard.innerHTML='<span class="workspace-card-icon" style="background:linear-gradient(135deg,#7c3aed,#a855f7)" aria-hidden="true">📝</span><span><strong>Taleplerim</strong><small>İzin, avans veya giriş–çıkış düzeltme talebi oluşturun</small></span><b style="color:#7c3aed">Talep oluştur →</b>';launcher.appendChild(requestCard);
        }
        fdxGorunumuGuncelle();
        const hub=document.getElementById('appHub');if(hub)new MutationObserver(()=>fdxGorunumuGuncelle()).observe(hub,{attributes:true,attributeFilter:['style','class']});const dashboard=document.getElementById('personelDashboardApp');if(dashboard){const watch=()=>{if(getComputedStyle(dashboard).display!=='none')fdxPdksKartiniKur()};new MutationObserver(watch).observe(dashboard,{attributes:true,attributeFilter:['style','class']});watch()}
    }
function fdxGorunumuGuncelle(){
        const managerCard=document.getElementById('fdxWorkCenterCard'),requestCard=document.getElementById('fdxMyRequestsCard'),launcher=document.querySelector('#appHub .workspace-launcher');
        if(managerCard){managerCard.style.display=fdxManager()?'grid':'none'}
        if(requestCard){requestCard.style.display=fdxPersonel()?'grid':'none';if(fdxPersonel()&&launcher){if(typeof personelAnaMenuKartlariniSirala==='function')personelAnaMenuKartlariniSirala();else launcher.insertBefore(requestCard,launcher.firstElementChild)}}
        if(!fdxManager()&&!fdxPersonel()){
            ['workCenterApp','fdxWorkCenterModal','fdxMyRequestsModal','fdxReviewModal','fdxAuditDetailModal'].forEach(id=>{const modal=document.getElementById(id);if(modal)modal.style.display='none'});
            window.FDModules?.sessionChanged();
        }
    }
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fdxKur);else fdxKur();
})();
