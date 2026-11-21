window.FDModules.define('cikisuyari',function(){
let disposed=false,bound=null,owned=null,ownedStyle=null,observer=null;const initial=context();
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function valid(request){return !disposed&&context()===initial&&Boolean(request)&&!request.settled&&!request.cancelled&&request.current()}
function finish(approved,request=bound){if(!request||request!==bound)return;const allow=approved===true&&valid(request)&&owned?.style.display==='flex';if(!allow)request.cancel();if(owned&&document.getElementById('modalCikisUyari')===owned)cikisUyariyiKapat(allow);else{cikisUyariCozumle?.(false);cikisUyariCozumle=null;request.cancel()}bound=null;owned?.querySelector('#cikisUyariIcerik')?.replaceChildren()}
function stylesInOriginalOrder(){const verified=document.querySelector('style[data-fd-module-style="cikisuyari"]'),anchor=document.querySelector('[data-fd-personnel-style-slot="00.css"]');if(!verified||!anchor)throw Error('Çıkış uyarısı stili yüklenemedi.');verified.media='not all';ownedStyle=document.createElement('style');ownedStyle.dataset.fdExitWarningStyle='00.css';ownedStyle.textContent=verified.textContent;anchor.after(ownedStyle)}
function changed(){if(bound&&!valid(bound))finish(false)}
let cikisUyariCozumle = null;
function cikisUyariyiGoster(uyarilar) {
        const alan = document.getElementById('cikisUyariIcerik');
        alan.innerHTML = uyarilar.map(uyari => `<div class="cikis-uyari-kart"><strong>${uyari.baslik}</strong><span>${uyari.aciklama}</span></div>`).join('');
        document.getElementById('modalCikisUyari').style.display = 'flex';
        return new Promise(resolve => { cikisUyariCozumle = resolve; });
    }
function cikisUyariyiKapat(onaylandi) {
        document.getElementById('modalCikisUyari').style.display = 'none';
        if (cikisUyariCozumle) cikisUyariCozumle(onaylandi);
        cikisUyariCozumle = null;
    }
return{init(){owned=document.getElementById('modalCikisUyari');stylesInOriginalOrder();observer=new MutationObserver(changed);const form=document.getElementById('modalPersonel');if(form)observer.observe(form,{attributes:true,attributeFilter:['style'],childList:true,subtree:true});document.addEventListener('input',changed,true);document.addEventListener('change',changed,true)},open(request=fdCikisUyariIstek){if(!valid(request)){if(!request&&!disposed)showToast('Personel formundaki Kaydet düğmesiyle yeniden deneyin.','warning');return false}if(bound&&bound!==request)return false;bound=request;const answer=cikisUyariyiGoster(request.uyarilar);answer.then(value=>{if(valid(request))request.complete(value===true);else request.cancel()});return true},api:{cikisUyariyiKapat(approved,request){finish(approved,request)}},dispose(){if(bound)finish(false);disposed=true;observer?.disconnect();document.removeEventListener('input',changed,true);document.removeEventListener('change',changed,true);ownedStyle?.remove();owned?.querySelector('#cikisUyariIcerik')?.replaceChildren();cikisUyariCozumle?.(false);cikisUyariCozumle=null;owned=null}};
});
