
(function(){
    let temizlikCalisiyor=false,temizlikYapildi=false;
    async function tumCksSatirlariniAl(){
        const tum=[];
        for(let bas=0;;bas+=500){
            const {data,error}=await supabaseClient.from('portal_records').select('legacy_id,data').eq('company_id',activeUser.sirketId).eq('module','taputakip').like('legacy_id','cks_%').order('legacy_id').range(bas,bas+499);
            if(error)throw error;
            const parca=data||[];tum.push(...parca);if(parca.length<500)break;
        }
        return tum;
    }
    async function yetimPdfKayitlariniTemizle(zorla=false){
        if(temizlikCalisiyor||(!zorla&&temizlikYapildi)||!tapuYazabilir?.())return 0;
        temizlikCalisiyor=true;
        try{
            const tum=!zorla&&Array.isArray(window.fdTapuTumSatirlari)?window.fdTapuTumSatirlari:await tumCksSatirlariniAl(),belgeler=new Set(tum.filter(x=>x?.data?.kayitTipi==='cksBelge').map(x=>String(x.legacy_id))),yetimler=tum.filter(x=>x?.data?.kayitTipi==='cks'&&x.data.kaynak==='ÇKS PDF'&&x.data.kaynakBelgeId&&!belgeler.has(String(x.data.kaynakBelgeId))),idler=yetimler.map(x=>String(x.legacy_id));
            for(let i=0;i<idler.length;i+=100){const {error}=await supabaseClient.from('portal_records').delete().eq('company_id',activeUser.sirketId).eq('module','taputakip').in('legacy_id',idler.slice(i,i+100));if(error)throw error}
            if(idler.length){const silinen=new Set(idler);tapuCksKayitlari=tapuCksKayitlari.filter(x=>!silinen.has(String(x.id)));window.cksFiltreDegisti?.();showToast?.(idler.length+' adet silinen ÇKS belgesine ait tekrar kayıt kaldırıldı.','success')}
            temizlikYapildi=true;return idler.length;
        }catch(e){console.error('Yetim ÇKS PDF kayıtları temizlenemedi',e);showToast?.('Silinen ÇKS belgesinin eski kayıtları temizlenemedi: '+(e.message||e),'warning');return 0}
        finally{temizlikCalisiyor=false}
    }
    window.fdCksYetimPdfKayitlariniTemizle=yetimPdfKayitlariniTemizle;
    const acEski=window.openCksTakipApp;
    window.openCksTakipApp=async function(){const r=await acEski.apply(this,arguments);await yetimPdfKayitlariniTemizle();return r};
    const silEski=window.cksYilBelgeSil;
    window.cksYilBelgeSil=async function(){const r=await silEski.apply(this,arguments);await yetimPdfKayitlariniTemizle(true);return r};
})();

