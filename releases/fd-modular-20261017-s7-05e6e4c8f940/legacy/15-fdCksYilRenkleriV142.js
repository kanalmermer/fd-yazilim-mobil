
(function(){
    const palet=[
        {arka:'#dcfce7',yazi:'#166534',kenar:'#86efac',satir:'#22c55e'},
        {arka:'#dbeafe',yazi:'#1e40af',kenar:'#93c5fd',satir:'#3b82f6'},
        {arka:'#ede9fe',yazi:'#5b21b6',kenar:'#c4b5fd',satir:'#8b5cf6'},
        {arka:'#ffedd5',yazi:'#9a3412',kenar:'#fdba74',satir:'#f97316'},
        {arka:'#ffe4e6',yazi:'#9f1239',kenar:'#fda4af',satir:'#f43f5e'},
        {arka:'#ccfbf1',yazi:'#115e59',kenar:'#5eead4',satir:'#14b8a6'},
        {arka:'#fef3c7',yazi:'#92400e',kenar:'#fcd34d',satir:'#eab308'}
    ];
    function renk(yil){const fark=2026-Number(yil||0),i=((fark%palet.length)+palet.length)%palet.length;return palet[i]}
    function uygula(){
        document.querySelectorAll('#cksDetayGovde .cks-year').forEach(rozet=>{
            const yil=Number(String(rozet.textContent||'').replace(/\D/g,''));if(!yil)return;
            const r=renk(yil),tr=rozet.closest('tr');
            rozet.classList.add('fd-cks-year-badge');
            rozet.style.setProperty('--fd-cks-yil-arka',r.arka);rozet.style.setProperty('--fd-cks-yil-yazi',r.yazi);rozet.style.setProperty('--fd-cks-yil-kenar',r.kenar);
            if(tr){tr.classList.add('fd-cks-year-row');tr.style.setProperty('--fd-cks-yil-renk',r.satir)}
        });
    }
    const govde=document.getElementById('cksDetayGovde');if(govde)new MutationObserver(uygula).observe(govde,{childList:true,subtree:true});
    uygula();
})();

