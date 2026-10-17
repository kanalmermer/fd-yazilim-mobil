
(function(){
    let duzenlenenKayitId='',kayitIslemde=false;
    const formAcEski=window.tapuCksFormuAc;
    window.tapuCksFormuAc=function(tapuId='',id=''){
        const kayit=id?tapuCksKayitlari.find(x=>String(x.id)===String(id)):null;
        duzenlenenKayitId=kayit?String(kayit.id):'';
        const r=formAcEski.apply(this,arguments);
        const gizli=document.getElementById('tapuCksId');
        if(gizli){gizli.value=duzenlenenKayitId;gizli.dataset.fdDuzenlenenId=duzenlenenKayitId}
        if(id&&!duzenlenenKayitId){tapuCksFormuKapat();alert('Düzenlenecek ÇKS kaydı bulunamadı. Listeyi yenileyip tekrar deneyin.')}
        return r;
    };
    const kaydetEski=window.tapuCksKaydet;
    window.tapuCksKaydet=async function(e){
        e?.preventDefault?.();if(kayitIslemde)return;
        const gizli=document.getElementById('tapuCksId'),kilit=duzenlenenKayitId||String(gizli?.dataset.fdDuzenlenenId||'');
        if(kilit){
            if(!tapuCksKayitlari.some(x=>String(x.id)===String(kilit)))return alert('Düzenlenen eski kayıt bulunamadı. Yeni kayıt açılmadı. Listeyi yenileyip tekrar deneyin.');
            gizli.value=String(kilit);
        }
        kayitIslemde=true;
        try{return await kaydetEski.apply(this,arguments)}finally{kayitIslemde=false;duzenlenenKayitId='';if(gizli)delete gizli.dataset.fdDuzenlenenId}
    };
    window.fdCksCokluKayitSec=function(btn){
        let secimler=[];try{secimler=JSON.parse(decodeURIComponent(btn.dataset.fdCksKayitlar||''))}catch(e){}
        const kayitlar=secimler.map(s=>tapuCksKayitlari.find(x=>String(x.id)===String(s.id))).filter(Boolean);
        if(!kayitlar.length)return;
        if(kayitlar.length===1)return tapuCksFormuAc(String(kayitlar[0].tapuId||''),String(kayitlar[0].id));
        const liste=document.getElementById('fdCksCokluDuzenleListe');if(!liste)return;
        liste.innerHTML=kayitlar.map(k=>'<div class="fd-cks-edit-choice"><span class="year">'+tapuHtml(k.yil||'-')+'</span><div><strong>'+tapuHtml(k.urun||'Ürün bilgisi yok')+'</strong><small>'+tapuHtml(k.ekenNotu||k.aciklama||'Kayıt bilgisi yok')+'</small></div><span class="fd-cks-choice-actions"><button title="Bu kaydı düzenle" onclick="fdCksCokluKayitDuzenle(\''+encodeURIComponent(String(k.tapuId||''))+'\',\''+encodeURIComponent(String(k.id))+'\')">✎</button><button class="delete" title="Bu kaydı sil" onclick="fdCksCokluKayitSil(\''+encodeURIComponent(String(k.id))+'\')">🗑</button></span></div>').join('');
        document.getElementById('fdCksCokluDuzenleModal').style.display='flex';
    };
    window.fdCksCokluKayitSil=async function(kodluId){
        const id=decodeURIComponent(kodluId),once=tapuCksKayitlari.some(x=>String(x.id)===String(id));
        if(!once)return;
        await tapuCksSil(id);
        if(!tapuCksKayitlari.some(x=>String(x.id)===String(id))){modalKapat('fdCksCokluDuzenleModal');showToast?.('Fazla ÇKS kaydı silindi.')}
    };
})();

