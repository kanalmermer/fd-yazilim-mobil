
(function(){
    const bekle=ms=>new Promise(r=>setTimeout(r,ms));
    /* Weekly PDF implementation moved to modules/vardiya. */
    function filtreleriKesinTemizle(anahtar){
        const secici=typeof ANA_MENU_MODUL_KOKLERI!=='undefined'?ANA_MENU_MODUL_KOKLERI?.[anahtar]:'';if(!secici)return;
        document.querySelectorAll(secici).forEach(kok=>kok.querySelectorAll('input,select,textarea').forEach(el=>{const bilgi=[el.id,el.name,el.className,el.placeholder].join(' ').toLocaleLowerCase('tr-TR'),filtreMi=el.type==='search'||/arama|ara\.\.\.|filtre/.test(bilgi);if(!filtreMi)return;if(el.tagName==='SELECT')el.selectedIndex=0;else if(!['date','month','number'].includes(el.type))el.value=''}));
    }
    window.fdModulFiltreleriniKesinTemizle=filtreleriKesinTemizle;document.addEventListener('click',function(e){const kapat=e.target?.closest?.('.fd-app-tab-close');if(!kapat)return;const anahtar=kapat.closest('.fd-app-tab')?.dataset?.fdTab;if(!anahtar)return;filtreleriKesinTemizle(anahtar)},true);
})();

