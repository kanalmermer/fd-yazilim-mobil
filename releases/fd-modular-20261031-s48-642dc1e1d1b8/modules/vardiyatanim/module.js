window.FDModules.define('vardiyatanim',function(){

let fdShiftDisposed=false,fdShiftOverlay=null;const fdShiftInitial=fdShiftContext(),fdShiftDialogs=new Set();let magicpassVardiyaAyarFormunuDoldur;
function fdShiftContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function fdShiftValid(){return !fdShiftDisposed&&Boolean(activeUser)&&!isPersonelUser()&&anaMenuModulErisimiVar('personel')&&fdShiftContext()===fdShiftInitial}
function fdShiftAssert(write=false){if(!fdShiftValid())throw Error('Oturum değişti; vardiya ayarlarını yeniden açın.');if(write&&(!isManagerUser()||!anaMenuModulYazmaYetkisiVar('personel')))throw Error('Vardiya tanımı düzenleme yetkiniz yok.')}
async function fdShiftAwait(p){fdShiftAssert();const value=await p;fdShiftAssert();return value}
function showGlobalOverlay(...args){fdShiftAssert(true);window.showGlobalOverlay(...args);fdShiftOverlay=[document.getElementById('overlayTitle')?.textContent,document.getElementById('overlaySub')?.textContent]}
function hideGlobalOverlay(){if(fdShiftOverlay&&fdShiftOverlay[0]===document.getElementById('overlayTitle')?.textContent&&fdShiftOverlay[1]===document.getElementById('overlaySub')?.textContent)window.hideGlobalOverlay();fdShiftOverlay=null}
function fdShiftConfirm(...args){fdShiftAssert(true);const previous=document.getElementById('fdYuzerOnayKatmani'),promise=window.fdYuzerOnaySor(...args),node=document.getElementById('fdYuzerOnayKatmani');if(node&&node!==previous)fdShiftDialogs.add(node);return promise}
let vardiyaTanimSeciliId = '';
function vardiyaTanimFormunuDoldur(id) {
        const tanim = magicpassVardiyaTanimlariniDuzelt().find(x => String(x.id) === String(id));
        if (!tanim) return vardiyaTanimYeni();
        vardiyaTanimSeciliId = tanim.id;
        const degerler = {
            vardiyaTanimId:tanim.id, vardiyaTanimAdi:tanim.ad, vardiyaTanimAciklama:tanim.aciklama,
            vardiyaTanimBaslangic:tanim.baslangic, vardiyaTanimBitis:tanim.bitis,
            vardiyaTanimYemekBaslangic:tanim.yemekBaslangic, vardiyaTanimYemekBitis:tanim.yemekBitis,
            vardiyaTanimMesaiBaslangic:tanim.mesaiBaslangic, vardiyaTanimMesaiBitis:tanim.mesaiBitis
        };
        Object.entries(degerler).forEach(([id,deger]) => { const el=document.getElementById(id); if(el) el.value=deger || ''; });
        ['Tatil','ResmiTatil','GirisCikisYasak'].forEach(alan => {
            const el=document.getElementById('vardiyaTanim' + alan);
            if(el) el.checked = Boolean(tanim[alan.charAt(0).toLowerCase() + alan.slice(1)]);
        });
        vardiyaTanimListesiniCiz();
    }
function vardiyaTanimListesiniCiz() {
        const alan = document.getElementById('vardiyaTanimListesi');
        if (!alan) return;
        alan.innerHTML = magicpassVardiyaTanimlariniDuzelt().map(x =>
            `<button type="button" class="${String(x.id)===String(vardiyaTanimSeciliId)?'active':''}" onclick="vardiyaTanimFormunuDoldur('${escapeDashboardText(x.id)}')"><strong>${escapeDashboardText(x.ad)}</strong><small style="display:block;margin-top:3px;color:#64748b">${escapeDashboardText(x.baslangic + '–' + x.bitis)}</small></button>`
        ).join('');
    }
function vardiyaTanimYeni() {
        vardiyaTanimSeciliId = '';
        const form=document.getElementById('vardiyaTanimForm');
        if(form) form.reset();
        const id=document.getElementById('vardiyaTanimId');if(id)id.value='';
        const bas=document.getElementById('vardiyaTanimBaslangic');if(bas)bas.value='08:00';
        const bit=document.getElementById('vardiyaTanimBitis');if(bit)bit.value='17:00';
        vardiyaTanimListesiniCiz();
        document.getElementById('vardiyaTanimAdi')?.focus();
    }
async function vardiyaTanimlariniSirketAyarinaKaydet(liste, mesaj) {
try{fdShiftAssert(true);

        const yeniAyarlar = { ...uygulamaAyarlari, vardiyaTanimlari:liste };
        const gunduz = liste.find(x=>x.id==='gunduz') || liste[0], gece = liste.find(x=>x.id==='gece') || liste.find(x=>String(x.bitis)<=String(x.baslangic)) || liste[1] || liste[0];
        if(gunduz) Object.assign(yeniAyarlar,{vardiyaGunduzBaslik:gunduz.ad,magicpassGunduzBaslangic:gunduz.baslangic,magicpassGunduzBitis:gunduz.bitis,magicpassGunduzMesaiSiniri:gunduz.mesaiBitis||gunduz.bitis});
        if(gece) Object.assign(yeniAyarlar,{vardiyaGeceBaslik:gece.ad,magicpassGeceBaslangic:gece.baslangic,magicpassGeceBitis:gece.bitis,magicpassGeceMesaiSiniri:gece.mesaiBitis||gece.bitis});
        showGlobalOverlay('Vardiyalar kaydediliyor','Haftalık plan ve giriş–çıkış hesabı güncelleniyor...');
        try {
            const {data:sirket,error:okumaHatasi}=await fdShiftAwait(supabaseClient.from('companies').select('data').eq('id',aktifSirketId()).maybeSingle());
            if(okumaHatasi)throw okumaHatasi;
            const {error,data:kayitliSirket}=await fdShiftAwait(supabaseClient.from('companies').update({data:{...(sirket?.data||{}),uygulamaAyarlari:yeniAyarlar}}).eq('id',aktifSirketId()).select('data').single());
            if(error)throw error;
            uygulamaAyarlari={...VARSAYILAN_UYGULAMA_AYARLARI,...kayitliSirket.data.uygulamaAyarlari};
            vardiyaTanimListesiniCiz();vardiyaCiz();magicpassAylikCizelgeyiCiz();
            showToast(mesaj || 'Vardiya tanımı kaydedildi.');
            return true;
        } catch(error) {
if(!fdShiftValid())return;
 showToast('Vardiya kaydedilemedi: '+(error.message||error),'error'); return false; }
        finally {
if(fdShiftValid()){
 hideGlobalOverlay(); 
}
}
    
}catch(fdShiftError){if(!fdShiftValid())return;throw fdShiftError}
}
async function vardiyaTanimKaydet(event) {
try{fdShiftAssert(true);

        event.preventDefault();
        if(!isManagerUser())return;
        const ad=String(document.getElementById('vardiyaTanimAdi')?.value||'').trim();
        const baslangic=document.getElementById('vardiyaTanimBaslangic')?.value||'',bitis=document.getElementById('vardiyaTanimBitis')?.value||'';
        if(!ad||!baslangic||!bitis)return showToast('Vardiya adı, başlama ve bitiş saatini doldurun.','warning');
        let id=String(document.getElementById('vardiyaTanimId')?.value||vardiyaTanimSeciliId||'').trim();
        if(!id)id='vardiya_'+Date.now();
        const kayit={id,ad:ad.toLocaleUpperCase('tr-TR'),aciklama:String(document.getElementById('vardiyaTanimAciklama')?.value||'').trim(),baslangic,bitis,yemekBaslangic:document.getElementById('vardiyaTanimYemekBaslangic')?.value||'',yemekBitis:document.getElementById('vardiyaTanimYemekBitis')?.value||'',mesaiBaslangic:document.getElementById('vardiyaTanimMesaiBaslangic')?.value||bitis,mesaiBitis:document.getElementById('vardiyaTanimMesaiBitis')?.value||'',tatil:Boolean(document.getElementById('vardiyaTanimTatil')?.checked),resmiTatil:Boolean(document.getElementById('vardiyaTanimResmiTatil')?.checked),girisCikisYasak:Boolean(document.getElementById('vardiyaTanimGirisCikisYasak')?.checked)};
        const liste=magicpassVardiyaTanimlariniDuzelt().map(x=>({...x})),index=liste.findIndex(x=>x.id===id);
        if(index>=0)liste[index]=kayit;else liste.push(kayit);
        vardiyaTanimSeciliId=id;
        if(await fdShiftAwait(vardiyaTanimlariniSirketAyarinaKaydet(liste,'Vardiya tanımı ve saatleri kaydedildi.')))vardiyaTanimFormunuDoldur(id);
    
}catch(fdShiftError){if(!fdShiftValid())return;throw fdShiftError}
}
async function vardiyaTanimSil() {
try{fdShiftAssert(true);

        const id=String(document.getElementById('vardiyaTanimId')?.value||vardiyaTanimSeciliId||'');
        const liste=magicpassVardiyaTanimlariniDuzelt();
        if(!id)return;
        if(liste.length<=1)return showToast('En az bir vardiya tanımı kalmalıdır.','warning');
        const tanim=liste.find(x=>x.id===id);if(!tanim)return;
        if(!(await fdShiftAwait(fdShiftConfirm(tanim.ad+' vardiya tanımı silinsin mi?','Vardiya Tanımını Sil','Sil'))))return;
        const kalan=liste.filter(x=>x.id!==id),yedek=kalan[0].id;
        vardiyaKayitlari.forEach(k=>{if(k.vardiyaTanimlari)Object.keys(k.vardiyaTanimlari).forEach(a=>{if(k.vardiyaTanimlari[a]===id)k.vardiyaTanimlari[a]=yedek;});if(k.kayitTipi==='vardiyaAtama'&&k.vardiya===id)k.vardiya=yedek;});
        yuklenenVeriler.add('vardiya');await fdShiftAwait(supabaseVerileriKaydet());
        vardiyaTanimSeciliId=kalan[0].id;
        if(await fdShiftAwait(vardiyaTanimlariniSirketAyarinaKaydet(kalan,'Vardiya tanımı silindi.')))vardiyaTanimFormunuDoldur(vardiyaTanimSeciliId);
    
}catch(fdShiftError){if(!fdShiftValid())return;throw fdShiftError}
}
magicpassVardiyaAyarFormunuDoldur=function(){
        const liste=magicpassVardiyaTanimlariniDuzelt();
        if(!vardiyaTanimSeciliId||!liste.some(x=>x.id===vardiyaTanimSeciliId))vardiyaTanimSeciliId=liste[0].id;
        vardiyaTanimFormunuDoldur(vardiyaTanimSeciliId);
    };
return{init(){fdShiftAssert();magicpassVardiyaAyarFormunuDoldur()},open(){fdShiftAssert();const detail=document.getElementById('vardiyaTanimDetay');if(!detail?.open)return false;magicpassVardiyaAyarFormunuDoldur()},api:{vardiyaTanimFormunuDoldur:function(...args){fdShiftAssert(false);return vardiyaTanimFormunuDoldur(...args)},vardiyaTanimListesiniCiz:function(...args){fdShiftAssert(false);return vardiyaTanimListesiniCiz(...args)},vardiyaTanimYeni:function(...args){fdShiftAssert(false);return vardiyaTanimYeni(...args)},vardiyaTanimlariniSirketAyarinaKaydet:function(...args){fdShiftAssert(true);return vardiyaTanimlariniSirketAyarinaKaydet(...args)},vardiyaTanimKaydet:function(...args){fdShiftAssert(true);return vardiyaTanimKaydet(...args)},vardiyaTanimSil:function(...args){fdShiftAssert(true);return vardiyaTanimSil(...args)},magicpassVardiyaAyarFormunuDoldur:function(...args){fdShiftAssert(false);return magicpassVardiyaAyarFormunuDoldur(...args)}},dispose(){fdShiftDisposed=true;hideGlobalOverlay();for(const node of fdShiftDialogs)if(node.isConnected)node.querySelector('[data-fd-iptal]')?.click();fdShiftDialogs.clear();document.getElementById('vardiyaTanimForm')?.reset();vardiyaTanimSeciliId=''}};
});
