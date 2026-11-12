window.FDModules.define('kayithatirlatma',function(){
let disposed=false,bound=null,owned=null,observer=null;const initial=context();
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function valid(request){return !disposed&&context()===initial&&request?.current()}
function clear(){bound?.cancel();bound=null;if(owned&&document.getElementById('modalPersonelKayitHatirlatma')===owned){personelKayitHatirlatmasiniKapat();owned.querySelector('#personelKayitHesapBilgisi')?.replaceChildren()}}
function personelKayitHatirlatmasiniGoster(tcNo, hesapOlustu) {
        const hesapAlani = document.getElementById('personelKayitHesapBilgisi');
        if (hesapOlustu) {
            hesapAlani.style.display = 'block';
            hesapAlani.innerHTML = `<strong>Personel giriş hesabı oluşturuldu.</strong><br>Kullanıcı adı: ${escapeDashboardText(tcNo)} · İlk şifre: ${escapeDashboardText(tcNo.slice(0,6))}<br><small>Personel ilk girişinde şifresini değiştirmelidir.</small>`;
        } else {
            hesapAlani.style.display = 'none';
            hesapAlani.innerHTML = '';
        }
        document.getElementById('modalPersonelKayitHatirlatma').style.display = 'flex';
    }
function personelKayitHatirlatmasiniKapat() {
        document.getElementById('modalPersonelKayitHatirlatma').style.display = 'none';
    }
return{init(){owned=document.getElementById('modalPersonelKayitHatirlatma');observer=new MutationObserver(()=>{if(bound&&(!valid(bound)||owned?.style.display!=='flex'))clear()});observer.observe(owned,{attributes:true,attributeFilter:['style']})},open(request=fdKayitHatirlatmaIstek){if(!valid(request))return false;if(bound&&bound!==request)clear();bound=request;request.clearError();personelKayitHatirlatmasiniGoster(request.tc,request.account);return true},api:{personelKayitHatirlatmasiniKapat:clear},dispose(){clear();disposed=true;observer?.disconnect();owned=null}};
});
