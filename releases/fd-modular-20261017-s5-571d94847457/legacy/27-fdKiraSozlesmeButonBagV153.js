
document.addEventListener('click',function(e){
    const buton=e.target?.closest?.('button[onclick*="kiraSozlesmePdfOlustur"]');if(!buton)return;
    const es=String(buton.getAttribute('onclick')||'').match(/kiraSozlesmePdfOlustur\(['"]([^'"]+)['"]\)/);if(!es)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    if(typeof window.fdKiraSozlesmePdfV153==='function')window.fdKiraSozlesmePdfV153(es[1]);
},true);

