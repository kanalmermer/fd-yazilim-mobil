window.FDModules.define('bildirimizni',function(){
let disposed=false,bound=null,owned=null,observer=null;const initial=context();
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||activeUser?.tcNo||'',activeUser?.sirketId||'',activeUser?.rol||'',JSON.stringify(anaMenuModulAyarlariniDuzelt().map(value=>[value.anahtar,anaMenuModulYetkisi(value.anahtar)]))])}
function valid(){return !disposed&&context()===initial&&bound?.current()}
function izinHatirlatmaAnahtari(){return bound.key}
function clear(){bound?.cancel();bound=null;if(owned&&owned.style.display!=='none')owned.style.display='none';observer?.takeRecords()}
function invoke(fn){if(!valid()){clear();return false}return fn()}
function fdBildirimIzniGorunumunuGoster(){const modal=document.getElementById('modalBildirimIzni');
if(modal&&modal.style.display!=='flex')modal.style.display='flex';}
function fdBildirimIzniniErtele(){localStorage.setItem(izinHatirlatmaAnahtari(),'1');modalKapat('modalBildirimIzni')}
function fdBildirimIzniniOnayla(){modalKapat('modalBildirimIzni');fdBildirimleriAc()}
return{init(){owned=document.getElementById('modalBildirimIzni');observer=new MutationObserver(()=>{if(bound&&owned.style.display==='none')clear()});observer.observe(owned,{attributes:true,attributeFilter:['style']})},open(request=window.fdBildirimIzniAcmaIstegi?.()){if(disposed||!request?.current()||context()!==initial)return false;if(bound&&bound!==request)clear();bound=request;request.clearError();fdBildirimIzniGorunumunuGoster();return true},api:{fdBildirimIzniniErtele(){return invoke(fdBildirimIzniniErtele)},fdBildirimIzniniOnayla(){return invoke(fdBildirimIzniniOnayla)},fdBildirimIzniPenceresiniKapat:clear},dispose(){clear();disposed=true;observer?.disconnect();owned=null}};
});
