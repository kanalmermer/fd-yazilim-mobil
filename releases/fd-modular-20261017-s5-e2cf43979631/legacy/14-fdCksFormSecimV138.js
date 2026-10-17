
(function(){
    function norm(v){return tapuCksNorm(String(v||''))}
    function tarimsal(t){return /tarla|arazi|bahce|bag|zeytinlik|cayir|tarim|sera|findik|fistik/.test(norm(t?.nitelik||''))}
    function tarlaSahipleri(){const m=new Map();[...tapuKayitlari.filter(tarimsal).map(t=>t.sahibi),...tapuCksKayitlari.map(c=>c.cksSahibi)].map(s=>String(s||'').trim()).filter(Boolean).forEach(s=>{if(!m.has(norm(s)))m.set(norm(s),s)});return[...m.values()].sort((a,b)=>a.localeCompare(b,'tr'))}
    function sahipListeleriniDuzelt(){
        const sahipler=tarlaSahipleri(),d=document.getElementById('tapuCksSahipListe');
        if(d)d.innerHTML=sahipler.map(s=>'<option value="'+tapuHtml(s)+'"></option>').join('');
        const select=document.getElementById('cksBelgeSahip');
        if(select){
            [...select.options].forEach(o=>{if(o.value&&!sahipler.some(s=>norm(s)===norm(o.value)))o.remove()});
            if(select.value&&!sahipler.some(s=>norm(s)===norm(select.value)))select.value='';
        }
    }
    function parselSeciminiEsitle(){
        const input=document.getElementById('tapuCksTapuAra'),select=document.getElementById('tapuCksTapuSec');
        if(!input||!select)return null;
        const metin=String(input.value||'').trim(),liste=Array.isArray(input._cksSecenekler)?input._cksSecenekler:[];
        let secim=liste.find(x=>String(x.etiket)===metin)||liste.find(x=>norm(x.etiket)===norm(metin));
        if(!secim&&select.value)secim=liste.find(x=>String(x.id)===String(select.value));
        if(secim){select.value=String(secim.id);input.dataset.tapuId=String(secim.id);return secim}
        select.value='';delete input.dataset.tapuId;return null;
    }
    function parselOlaylariniKur(){
        const input=document.getElementById('tapuCksTapuAra');if(!input||input.dataset.fdCksSync==='1')return;
        input.dataset.fdCksSync='1';['input','change','blur'].forEach(ad=>input.addEventListener(ad,()=>setTimeout(parselSeciminiEsitle,0)));
    }
    const formEski=window.tapuCksFormuAc;
    window.tapuCksFormuAc=function(){const r=formEski.apply(this,arguments);setTimeout(()=>{parselOlaylariniKur();parselSeciminiEsitle();sahipListeleriniDuzelt()},0);return r};
    const kaydetEski=window.tapuCksKaydet;
    window.tapuCksKaydet=async function(e){
        const input=document.getElementById('tapuCksTapuAra'),select=document.getElementById('tapuCksTapuSec');
        if(input&&select&&!select.value){const secim=parselSeciminiEsitle();if(!secim){e?.preventDefault?.();return alert('Listeden geçerli bir tapu parseli seçin.')}}
        const r=await kaydetEski.apply(this,arguments);sahipListeleriniDuzelt();return r;
    };
    const acEski=window.openCksTakipApp;
    window.openCksTakipApp=async function(){const r=await acEski.apply(this,arguments);sahipListeleriniDuzelt();return r};
    const yenileEski=window.cksTakipYenile;
    window.cksTakipYenile=async function(){const r=await yenileEski.apply(this,arguments);sahipListeleriniDuzelt();return r};
    const yilEski=window.cksYilDegisti;
    window.cksYilDegisti=function(){const r=yilEski.apply(this,arguments);setTimeout(sahipListeleriniDuzelt,0);return r};
    sahipListeleriniDuzelt();
})();

