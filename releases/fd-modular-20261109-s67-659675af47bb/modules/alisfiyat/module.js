window.FDModules.define('alisfiyat',function(){
let disposed=false,controller=null;const initial=context();
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('alisfiyat')]);}
function current(){return !disposed&&initial===context()&&anaMenuModulErisimiVar('alisfiyat');}
function assert(write=false){if(!current())throw Error('Oturum değişti; Alış Fiyat Takibi ekranını yeniden açın.');if(write&&!anaMenuModulYazmaYetkisiVar('alisfiyat'))throw Error('Bu modülde değişiklik yapma yetkiniz yok.');}
return{open(){assert();fdTumUygulamaAlanlariniGizle();document.getElementById('alisFiyatApp').style.display='block';anaMenuDonusButonunuGoster();if(!controller)controller=window.FDEdmTracker.create({view:window.FDEdmTracker.workspaceView,assert,current,canWrite:()=>anaMenuModulYazmaYetkisiVar('alisfiyat')});controller.mount(document.getElementById('fdAlisFiyatHost'));},api:{},dispose(){disposed=true;controller?.dispose();controller=null;const tab=fdAcikUygulamaSekmeleri.find(t=>t.anahtar==='alisfiyat');if(tab)tab.alanId='';}};
});
