
(function(){
    if(document.getElementById('fdCksCokluDuzenleModal'))return;
    const m=document.createElement('div');m.id='fdCksCokluDuzenleModal';m.className='modal-overlay';m.style.zIndex='10070';
    m.innerHTML='<div class="modal-card"><div class="modal-header"><h3>ÇKS Kaydını Düzenle veya Sil</h3><button class="modal-close" onclick="modalKapat(\'fdCksCokluDuzenleModal\')">✕</button></div><div class="modal-body"><div id="fdCksCokluDuzenleListe"></div></div></div>';
    document.body.appendChild(m);
})();

