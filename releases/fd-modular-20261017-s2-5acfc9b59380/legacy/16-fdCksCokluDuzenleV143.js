
(function(){
    function modalKur(){
        if(document.getElementById('fdCksCokluDuzenleModal'))return;
        const m=document.createElement('div');m.id='fdCksCokluDuzenleModal';m.className='modal-overlay';m.style.zIndex='10070';
        m.innerHTML='<div class="modal-card"><div class="modal-header"><h3>ÇKS Kaydını Düzenle</h3><button class="modal-close" onclick="modalKapat(\'fdCksCokluDuzenleModal\')">✕</button></div><div class="modal-body"><div id="fdCksCokluDuzenleListe"></div></div></div>';
        document.body.appendChild(m);
    }
    function butonKaydi(btn){
        const metin=String(btn.getAttribute('onclick')||'');
        const es=metin.match(/tapuCksFormuAc\('([^']*)','([^']*)'\)/);
        return es?{tapuId:es[1],id:es[2]}:null;
    }
    window.fdCksCokluKayitSec=function(btn){
        modalKur();
        let secimler=[];try{secimler=JSON.parse(decodeURIComponent(btn.dataset.fdCksKayitlar||''))}catch(e){}
        const kayitlar=secimler.map(s=>tapuCksKayitlari.find(x=>String(x.id)===String(s.id))).filter(Boolean);
        if(!kayitlar.length)return;
        if(kayitlar.length===1)return tapuCksFormuAc(String(kayitlar[0].tapuId||''),String(kayitlar[0].id));
        document.getElementById('fdCksCokluDuzenleListe').innerHTML=kayitlar.map(k=>'<div class="fd-cks-edit-choice"><span class="year">'+tapuHtml(k.yil||'-')+'</span><div><strong>'+tapuHtml(k.urun||'Ürün bilgisi yok')+'</strong><small>'+tapuHtml(k.ekenNotu||k.aciklama||'Düzenlenecek kaydı seçin')+'</small></div><button title="Bu kaydı düzenle" onclick="fdCksCokluKayitDuzenle(\''+encodeURIComponent(String(k.tapuId||''))+'\',\''+encodeURIComponent(String(k.id))+'\')">✎</button></div>').join('');
        document.getElementById('fdCksCokluDuzenleModal').style.display='flex';
    };
    window.fdCksCokluKayitDuzenle=function(tapuId,id){modalKapat('fdCksCokluDuzenleModal');tapuCksFormuAc(decodeURIComponent(tapuId),decodeURIComponent(id))};
    function tekKalemYap(){
        document.querySelectorAll('#cksListeGovde tr').forEach(tr=>{
            const kalemler=[...tr.querySelectorAll('td:last-child .cks-icon-btn.edit')];if(kalemler.length<2)return;
            const secimler=kalemler.map(butonKaydi).filter(Boolean),kalem=kalemler[0];
            kalemler.slice(1).forEach(b=>b.remove());
            kalem.setAttribute('onclick','fdCksCokluKayitSec(this)');
            kalem.dataset.fdCksKayitlar=encodeURIComponent(JSON.stringify(secimler));
            kalem.title='Bu yıldaki kaydı seçip düzenle';kalem.dataset.fdCksCoklu='1';
        });
    }
    const govde=document.getElementById('cksListeGovde');if(govde)new MutationObserver(tekKalemYap).observe(govde,{childList:true,subtree:true});
    tekKalemYap();
})();

