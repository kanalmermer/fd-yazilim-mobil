window.FDModules.define('topluplan',function(){
let disposed=false,bound=null,owned=null,observer=null;const initial=context();
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function valid(){return !disposed&&Boolean(activeUser)&&isManagerUser()&&anaMenuModulYazmaYetkisiVar('personel')&&context()===initial&&bound?.current()}
function clear(){bound?.cancel();bound=null;if(!owned)return;if(owned.style.display!=='none')magicpassTopluPlanlamaKapat();owned.querySelector('#magicTopluPersoneller').replaceChildren();owned.querySelector('#magicTopluSecimSayisi').textContent='0 personel';owned.querySelector('#magicTopluUyari').textContent='';for(const id of ['magicTopluBaslangic','magicTopluBitis'])owned.querySelector('#'+id).value='';for(const id of ['magicTopluSube','magicTopluGorev']){const select=owned.querySelector('#'+id);while(select.options.length>1)select.remove(1);select.value=''}observer?.takeRecords()}
function invoke(fn,args){if(!valid()){clear();return false}return fn(...args)}
function monthChanged(){if(bound&&!valid())clear()}
function magicpassTopluPlanlamaAc() {
        const sube = document.getElementById('magicTopluSube'), gorev = document.getElementById('magicTopluGorev');
        const aktifler = personeller.filter(p => aktifSirketeAit(p) && !p.cikisTarihi);
        const subeler = [...new Set(aktifler.map(p => p.sube).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'tr'));
        const gorevler = [...new Set(aktifler.map(p => p.gorev).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'tr'));
        sube.innerHTML = '<option value="">Tüm şubeler</option>' + subeler.map(x=>'<option>' + escapeDashboardText(x) + '</option>').join('');
        gorev.innerHTML = '<option value="">Tüm görevler</option>' + gorevler.map(x=>'<option>' + escapeDashboardText(x) + '</option>').join('');
        const ay = document.getElementById('magicpassAy').value || magicpassTarihAnahtari(new Date()).slice(0,7);
        document.getElementById('magicTopluBaslangic').value = ay + '-01';
        document.getElementById('magicTopluBitis').value = ay + '-' + String(new Date(Number(ay.slice(0,4)),Number(ay.slice(5,7)),0).getDate()).padStart(2,'0');
        magicpassTopluPersonelleriCiz();
        document.getElementById('modalMagicpassTopluPlan').style.display='flex';
    }
function magicpassTopluPlanlamaKapat() { document.getElementById('modalMagicpassTopluPlan').style.display='none'; }
function magicpassTopluPersonelleriCiz() {
        const sube=document.getElementById('magicTopluSube').value, gorev=document.getElementById('magicTopluGorev').value, mevcut=document.getElementById('magicTopluMevcut').value;
        const tarih=document.getElementById('magicTopluBaslangic').value || magicpassTarihAnahtari(new Date());
        const liste=personeller.filter(p=>aktifSirketeAit(p)&&!p.cikisTarihi&&(!sube||p.sube===sube)&&(!gorev||p.gorev===gorev)&&(!mevcut||magicpassGunVardiyasi(p,tarih)===mevcut)).sort((a,b)=>String(a.ad).localeCompare(String(b.ad),'tr'));
        document.getElementById('magicTopluPersoneller').innerHTML=liste.map(p=>'<label><input type="checkbox" value="'+escapeDashboardText(p.id)+'" onchange="magicpassTopluSecimSayisiniGuncelle()"><span><strong>'+escapeDashboardText(p.ad)+'</strong><br><small>'+escapeDashboardText(p.sube||'-')+' · '+escapeDashboardText(p.gorev||'-')+' · '+(p.cihazPersonelNo?'Cihaz '+escapeDashboardText(p.cihazPersonelNo):'Cihaz no yok')+'</small></span></label>').join('') || '<div style="padding:18px;color:#64748b;">Filtreye uygun personel yok.</div>';
        magicpassTopluSecimSayisiniGuncelle();
    }
function magicpassTopluSecimSayisiniGuncelle() {
        const adet=document.querySelectorAll('#magicTopluPersoneller input:checked').length;
        document.getElementById('magicTopluSecimSayisi').textContent=adet+' personel';
        document.getElementById('magicTopluUyari').textContent=adet ? 'Seçili personeller için tarih aralığındaki izinli günler atlanır; mevcut atamalar üzerine yazılabilir.' : 'Vardiya atanacak personelleri seçin.';
    }
function magicpassTopluTumunuSec(secili) {
        document.querySelectorAll('#magicTopluPersoneller input').forEach(x=>x.checked=secili);
        magicpassTopluSecimSayisiniGuncelle();
    }
return{init(){owned=document.getElementById('modalMagicpassTopluPlan');observer=new MutationObserver(()=>{if(bound&&owned.style.display==='none')clear()});observer.observe(owned,{attributes:true,attributeFilter:['style']});document.getElementById('magicpassAy')?.addEventListener('change',monthChanged)},open(request=fdTopluPlanIstek){if(disposed||!request?.current()||context()!==initial)return false;if(bound&&bound!==request)clear();bound=request;request.clearError();magicpassTopluPlanlamaAc();return true},api:{magicpassTopluPlanlamaKapat:clear,magicpassTopluPersonelleriCiz(...args){return invoke(magicpassTopluPersonelleriCiz,args)},magicpassTopluSecimSayisiniGuncelle(...args){return invoke(magicpassTopluSecimSayisiniGuncelle,args)},magicpassTopluTumunuSec(...args){return invoke(magicpassTopluTumunuSec,args)}},dispose(){clear();disposed=true;observer?.disconnect();document.getElementById('magicpassAy')?.removeEventListener('change',monthChanged);owned=null}};
});
