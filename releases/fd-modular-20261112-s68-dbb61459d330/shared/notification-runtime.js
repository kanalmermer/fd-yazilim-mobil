function showGlobalOverlay(t, s) {
        document.getElementById('overlayTitle').innerText = kullaniciMesajiniSadlestir(t);
        document.getElementById('overlaySub').innerText = kullaniciMesajiniSadlestir(s);
        const ilerleme=document.getElementById('overlayProgress'),dolgu=document.getElementById('overlayProgressFill'),oran=document.getElementById('overlayProgressText');
        if(ilerleme)ilerleme.style.display='none';if(dolgu)dolgu.style.width='0%';if(oran)oran.textContent='0%';
        document.getElementById('globalOverlay').style.display = 'flex';
    }

function showToast(mesaj, tur = 'success') {
        mesaj = kullaniciMesajiniSadlestir(mesaj);
        let alan = document.getElementById('portalToastAlani');
        if (!alan) {
            alan = document.createElement('div');
            alan.id = 'portalToastAlani';
            alan.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:120000;display:flex;flex-direction:column-reverse;gap:9px;width:min(430px,calc(100vw - 28px));pointer-events:none;';
            document.body.appendChild(alan);
        }
        const renkler = tur === 'error' ? ['#fee2e2','#991b1b','#ef4444'] : tur === 'warning' ? ['#fef3c7','#92400e','#f59e0b'] : ['#dcfce7','#166534','#22c55e'];
        const ikon = tur === 'error' ? '⛔' : tur === 'warning' ? '⚠️' : '✓';
        const baslik = tur === 'error' ? 'İşlem tamamlanamadı' : tur === 'warning' ? 'Uyarı' : 'İşlem başarılı';
        const bildirim = document.createElement('div');
        bildirim.style.cssText = `position:relative;padding:12px 38px 12px 14px;border-radius:12px;background:${renkler[0]};color:${renkler[1]};border:1px solid ${renkler[2]}55;border-left:5px solid ${renkler[2]};box-shadow:0 14px 34px rgba(15,23,42,.22);font-size:.82rem;line-height:1.45;white-space:pre-line;overflow-wrap:anywhere;transition:.25s ease;pointer-events:auto;`;
        bildirim.innerHTML='<div style="display:flex;gap:9px;align-items:flex-start"><span style="font-size:1rem;line-height:1.2">'+ikon+'</span><div><strong style="display:block;margin-bottom:3px;font-size:.84rem">'+baslik+'</strong><div></div></div></div><button type="button" aria-label="Bildirimi kapat" style="position:absolute;right:8px;top:8px;border:0;background:transparent;color:inherit;font-size:1rem;cursor:pointer">×</button>';
        bildirim.querySelector('div div div').textContent=String(mesaj??'');
        bildirim.querySelector('button').onclick=()=>bildirim.remove();
        alan.appendChild(bildirim);
        const sure=tur==='success'?5000:9000;
        setTimeout(() => { if(!bildirim.isConnected)return;bildirim.style.opacity='0';bildirim.style.transform='translateY(7px)';setTimeout(()=>bildirim.remove(),260); }, sure);
    }

function hideGlobalOverlay() { const katman=document.getElementById('globalOverlay'),ilerleme=document.getElementById('overlayProgress'),dolgu=document.getElementById('overlayProgressFill');if(katman)katman.style.display='none';if(ilerleme)ilerleme.style.display='none';if(dolgu)dolgu.style.width='0%'; }

function gunlukHatirlatmalariKapat(){fdGunlukHatirlatmaIstek?.cancel();if(window.FDModules?.status('gunlukhatirlatma').loaded)return FDModules.callIfLoaded('gunlukhatirlatma','gunlukHatirlatmalariKapat',[],this)}

function gunlukHatirlatmalariGoster(){
 if(!isManagerUser()||!activeUser?.sirketId)return Promise.resolve();
 const day=bugununYerelTarihi(),key=`fdYazilimGunlukHatirlatma:${activeUser.sirketId}:${activeUser.username||activeUser.id||'yonetici'}:${day}`;if(localStorage.getItem(key)==='1')return Promise.resolve();
 if(fdGunlukHatirlatmaIstek?.current())return fdGunlukHatirlatmaIstek.promise;
 fdGunlukHatirlatmaIstek?.cancel();const context=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',...['personel','irsaliye','police'].map(id=>anaMenuModulYetkisi(id))]),scope=context();
 const request={day,cancelled:false,errorButton:null,errorClose:null,current(){return fdGunlukHatirlatmaIstek===request&&!request.cancelled&&Boolean(activeUser?.sirketId)&&isManagerUser()&&scope===context()&&day===bugununYerelTarihi()},clearError(){if(request.errorButton&&request.errorClose)request.errorButton.removeEventListener('click',request.errorClose);request.errorButton=null;request.errorClose=null},cancel(){request.cancelled=true;request.resolveCancellation?.();request.clearError();if(fdGunlukHatirlatmaIstek===request)fdGunlukHatirlatmaIstek=null}};
 request.whenCancelled=new Promise(resolve=>request.resolveCancellation=resolve);fdGunlukHatirlatmaIstek=request;request.promise=FDModules.embedded('gunlukhatirlatma',[request],this).then(value=>{if(!request.current())request.cancel();else if(value===false){const panel=document.getElementById('fdModuleLoadError');request.errorButton=Array.from(panel?.querySelectorAll('button')||[]).find(b=>b.textContent==='Kapat')||null;request.errorClose=()=>request.cancel();request.errorButton?.addEventListener('click',request.errorClose,{once:true});}return value},()=>{request.cancel()});return request.promise;
}

function modalKapat(id){const modal=document.getElementById(id);if(modal?.dataset?.forceOpen==='true')return;if(modal)modal.style.display='none';}

function izinBildirimGonderimZamani() {
        const dakika=Math.min(120,Math.max(0,Number(uygulamaAyarlari?.whatsappIzinBeklemeDakika??3)));
        return new Date(Date.now() + dakika * 60 * 1000);
    }

function izinBildirimBeklemeMetni(){const dakika=Math.min(120,Math.max(0,Number(uygulamaAyarlari?.whatsappIzinBeklemeDakika??3)));return dakika?dakika+' dakikalık düzeltme süresiyle':'bekletilmeden';}

function kullaniciMesajiniSadlestir(metin) {
        return String(metin ?? '')
            .replace(/Supabase\s+veritabanına/gi,'sisteme').replace(/Supabase/gi,'sistem')
            .replace(/bulut\s+veritabanına/gi,'sisteme').replace(/veritabanına/gi,'sisteme')
            .replace(/Drive['’]?a/gi,'dosya alanına').replace(/Drive\s+belgeleri/gi,'belgeler')
            .replace(/bilgiler\s+geçmişe\s+işleniyor/gi,'bilgiler güncelleniyor')
            .replace(/kayıt\s+ve\s+bağlı\s+dosya\s+alanına\s+belgeleri/gi,'kayıt ve bağlı belgeler');
    }

function globalOverlayIlerleme(yuzde,metin='') {
        const deger=Math.max(0,Math.min(100,Math.round(Number(yuzde)||0))),ilerleme=document.getElementById('overlayProgress'),dolgu=document.getElementById('overlayProgressFill'),oran=document.getElementById('overlayProgressText');
        if(ilerleme)ilerleme.style.display='flex';if(dolgu)dolgu.style.width=deger+'%';if(oran)oran.textContent=deger+'%';
        if(metin)document.getElementById('overlaySub').innerText=kullaniciMesajiniSadlestir(metin);
    }

function portalBasariliIslemMesajiMi(mesaj) {
        const metin = String(mesaj || '').toLocaleLowerCase('tr-TR');
        const hataIfadeleri = ['kaydedilemedi','silinemedi','güncellenemedi','oluşturulamadı','aktarılamadı','indirilemedi','kopyalanamadı','bulunamadı','geçersiz','hata','yetkisiz','zorunlu','lütfen','uyarı'];
        if (hataIfadeleri.some(ifade => metin.includes(ifade))) return false;
        const basariIfadeleri = ['kaydedildi','silindi','güncellendi','eklendi','işlendi','aktarıldı','indirildi','kopyalandı','temizlendi','oluşturuldu','tamamlandı','başarıyla'];
        return basariIfadeleri.some(ifade => metin.includes(ifade));
    }

function fdYuzerOnaySor(mesaj,baslik='İşlemi Onayla',onayMetni='Tamam'){
        return new Promise(resolve=>{
            let katman=document.getElementById('fdYuzerOnayKatmani');if(katman)katman.remove();katman=document.createElement('div');katman.id='fdYuzerOnayKatmani';katman.style.cssText='position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(15,23,42,.58);backdrop-filter:blur(3px)';
            katman.innerHTML='<div role="dialog" aria-modal="true" style="width:min(440px,96vw);border:1px solid #cbd5e1;border-radius:14px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,.34);overflow:hidden"><div style="padding:17px 18px 10px"><h3 data-fd-onay-baslik style="margin:0;color:#0f172a;font-size:1rem"></h3><p data-fd-onay-mesaj style="margin:11px 0 0;color:#475569;line-height:1.55;white-space:pre-wrap"></p></div><div style="display:flex;justify-content:flex-end;gap:9px;padding:13px 18px 17px;background:#f8fafc;border-top:1px solid #e2e8f0"><button type="button" data-fd-iptal class="btn-modern" style="background:#e2e8f0;color:#334155">İptal</button><button type="button" data-fd-onay class="btn-modern" style="background:#dc2626;color:#fff"></button></div></div>';
            katman.querySelector('[data-fd-onay-baslik]').textContent=baslik;katman.querySelector('[data-fd-onay-mesaj]').textContent=mesaj;katman.querySelector('[data-fd-onay]').textContent=onayMetni;
            let bitti=false;const kapat=sonuc=>{if(bitti)return;bitti=true;document.removeEventListener('keydown',tus);katman.remove();resolve(sonuc);},tus=e=>{if(e.key==='Escape')kapat(false);};
            katman.querySelector('[data-fd-iptal]').onclick=()=>kapat(false);katman.querySelector('[data-fd-onay]').onclick=()=>kapat(true);katman.onclick=e=>{if(e.target===katman)kapat(false);};document.addEventListener('keydown',tus);document.body.appendChild(katman);setTimeout(()=>katman.querySelector('[data-fd-onay]').focus(),0);
        });
    }

function fdYuzerDegerSor(mesaj,varsayilan='',baslik='Bilgi Girin',onayMetni='Tamam'){
        return new Promise(resolve=>{
            let katman=document.getElementById('fdYuzerDegerKatmani');if(katman)katman.remove();katman=document.createElement('div');katman.id='fdYuzerDegerKatmani';katman.style.cssText='position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(15,23,42,.58);backdrop-filter:blur(3px)';
            katman.innerHTML='<div role="dialog" aria-modal="true" style="width:min(480px,96vw);border:1px solid #cbd5e1;border-radius:14px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,.34);overflow:hidden"><div style="padding:17px 18px 13px"><h3 data-fd-deger-baslik style="margin:0;color:#0f172a;font-size:1rem"></h3><p data-fd-deger-mesaj style="margin:11px 0;color:#475569;line-height:1.55;white-space:pre-wrap"></p><input data-fd-deger-input type="text" style="width:100%;box-sizing:border-box"></div><div style="display:flex;justify-content:flex-end;gap:9px;padding:13px 18px 17px;background:#f8fafc;border-top:1px solid #e2e8f0"><button type="button" data-fd-deger-iptal class="btn-modern" style="background:#e2e8f0;color:#334155">İptal</button><button type="button" data-fd-deger-onay class="btn-modern" style="background:#0f766e;color:#fff"></button></div></div>';
            const input=katman.querySelector('[data-fd-deger-input]');katman.querySelector('[data-fd-deger-baslik]').textContent=baslik;katman.querySelector('[data-fd-deger-mesaj]').textContent=String(mesaj||'');katman.querySelector('[data-fd-deger-onay]').textContent=onayMetni;input.value=String(varsayilan??'');
            let bitti=false;const kapat=sonuc=>{if(bitti)return;bitti=true;document.removeEventListener('keydown',tus);katman.remove();resolve(sonuc);},tus=e=>{if(e.key==='Escape')kapat(null);if(e.key==='Enter'){e.preventDefault();kapat(input.value);}};
            katman.querySelector('[data-fd-deger-iptal]').onclick=()=>kapat(null);katman.querySelector('[data-fd-deger-onay]').onclick=()=>kapat(input.value);katman.onclick=e=>{if(e.target===katman)kapat(null);};document.addEventListener('keydown',tus);document.body.appendChild(katman);setTimeout(()=>{input.focus();input.select();},0);
        });
    }

/* Notification setup: invoked at the original source positions. */
window.FDNotificationRuntimeStep = (function(__fdNotificationSteps66){
 return function(__fdNotificationStep66){ return __fdNotificationSteps66[__fdNotificationStep66].call(window); };
})([
function(){
window.fdGunlukHatirlatmaGecisiniIptalEt=gunlukHatirlatmalariKapat;
},
function(){
window.alert = function(mesaj) {
        const metin=String(mesaj??''),kucuk=metin.toLocaleLowerCase('tr-TR');
        if(portalBasariliIslemMesajiMi(metin))showToast(metin,'success');
        else if(['hata','bulunamadı','kaydedilemedi','silinemedi','güncellenemedi','oluşturulamadı','bağlantı','yetkisiz','tamamlanamadı'].some(x=>kucuk.includes(x)))showToast(metin,'error');
        else showToast(metin,'warning');
    };
}
]);
