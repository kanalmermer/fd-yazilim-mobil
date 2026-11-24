window.FDModules.define('belgehazirla',function(){
let disposed=false,overlayOwner=null;const initial=fdWordBelgeBaglami(),requests=new Set();
const valid=r=>!disposed&&initial===fdWordBelgeBaglami()&&fdBelgeHazirlamaKayitlari.has(r)&&r?.current();
async function execute(request){
 if(!valid(request)||!request.args)return false;let overlay=null,title='';
 const check=()=>{if(!valid(request))throw Error('Belge hazırlama ekranı değişti.');};
 const alert=message=>{if(valid(request))window.alert(message)};
 const showGlobalOverlay=(...args)=>{check();window.showGlobalOverlay(...args);overlayOwner=request;overlay=document.getElementById('globalOverlay');title=document.getElementById('overlayTitle')?.textContent||'';};
 const hideGlobalOverlay=()=>{if(overlayOwner===request){if(overlay===document.getElementById('globalOverlay')&&title===(document.getElementById('overlayTitle')?.textContent||''))window.hideGlobalOverlay();overlayOwner=null;}overlay=null;};
 const fdYazilimDriveDosyaIndir=async(...args)=>{check();const result=await window.fdYazilimDriveDosyaIndir(...args);check();return result;};
 const personelWordBelgesiniHazirla=async(...args)=>{check();const result=await window.personelWordBelgesiniHazirla(...args);check();return result;};
 const personelBelgePdfOnizlemeAc=(...args)=>{check();return window.personelBelgePdfOnizlemeAc(...args);};
 const originalPrepare=async function personelBelgeHazirla(personelId, belgeKey) {
        const personel = personeller.find(item => String(item.id) === String(personelId));
        const tanim = SUBE_PERSONEL_BELGELERI.find(item => item.key === belgeKey);
        const sube = personel ? personelSubesiniBul(personel) : null;
        const sirket = sirketler.find(item => String(item.id) === String(personel?.sirketId || aktifSirketId() || '')) || sirketler[0];
        const belge = sube?.personelBelgeleri?.[belgeKey];
        if (!personel || !tanim || !sube || !belge?.id) return alert('Personelin şubesine ait Word belgesi bulunamadı.');
        if (!personel.girisTarihi && tanim.otomatik) return alert('Belge tarihlerini hazırlamak için personelin işe giriş tarihi kayıtlı olmalıdır.');
        if (belgeKey === 'calisanElKitabi' && typeof window.fdPersonelDriveBelgesiOnizle === 'function') {
            window.fdPersonelDriveBelgesiOnizle(belge, tanim.baslik);
            return;
        }
        showGlobalOverlay('Personel belgesi hazırlanıyor', tanim.baslik + ' · ' + personel.ad);
        try {
            const sonuc = await fdYazilimDriveDosyaIndir(belge.id);
            const kaynak = base64DizisineCevir(sonuc.base64);
            let blob = new Blob([kaynak], { type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            if (tanim.otomatik) {
                const yil = String(personel.girisTarihi).slice(0, 4);
                const degerler = [
                    String(personel.id || ''),
                    String(sube.adres || ''),
                    String(sirket?.unvan || sirket?.kisaAd || ''),
                    tarihFormati(personel.girisTarihi) + ' - 31.12.' + yil + ' ',
                    String(personel.ad || '').toLocaleUpperCase('tr-TR')
                ];
                blob = await personelWordBelgesiniHazirla(kaynak.buffer, degerler, belgeKey);
            }
            const dosyaAdi = subeBelgeDriveDosyaAdi(personel.ad, tanim.baslik).replace(/\.docx$/i, '.pdf');
            await personelBelgePdfOnizlemeAc(blob, dosyaAdi, tanim.baslik);
        } catch (error) {
            alert('Personel belgesi hazırlanamadı: ' + (error.message || error));
        } finally {
            hideGlobalOverlay();
        }
    };
 try{await originalPrepare(...request.args);return valid(request);}finally{hideGlobalOverlay();}
}
return {async open(request){if(!valid(request))return false;requests.add(request);try{return await execute(request)}finally{requests.delete(request)}},api:{},dispose(){disposed=true;for(const r of requests)r.cancel();requests.clear()}};
});
