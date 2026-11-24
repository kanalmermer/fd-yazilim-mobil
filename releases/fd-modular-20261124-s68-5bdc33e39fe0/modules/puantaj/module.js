window.FDModules.define('puantaj',function(){
 let disposed=false,operation=null,operationDone=null,contextMenuTargetInput=null,overlay=null;
 const identity=()=>JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',JSON.stringify(anaMenuModulAyarlariniDuzelt().map(v=>[v.anahtar,anaMenuModulYetkisi(v.anahtar)]))]);const initial=identity();
 const fdPayrollValid=()=>!disposed&&initial===identity()&&anaMenuModulErisimiVar('personel')&&(!operation||operation.valid());
 function check(write=false){if(!fdPayrollValid())throw Error('Puantaj oturumu veya dönem değişti.');if(write&&(!isManagerUser()||isPersonelUser()||!anaMenuModulYazmaYetkisiVar('personel')))throw Error('Puantaj için yazma yetkiniz yok.');}
 async function wait(p){const result=await p;check();return result;}
 const renderPuantajMatrisi=(...args)=>{if(fdPayrollValid())return window.renderPuantajMatrisi(...args)};
 const openPuantajGorunumu=mode=>{check();const selected=operation;return window.fdPuantajGirisindeCalistir(()=>window.openPuantajGorunumu(mode,()=>!disposed&&initial===identity()&&selected.valid()))};
 const verileriKaydet=(...args)=>{check(true);return wait(window.verileriKaydet(...args))};
 const driveVerileriniYukleBaslangicta=(...args)=>{check();return wait(window.driveVerileriniYukleBaslangicta(...args))};
 const fdYuzerOnaySor=(...args)=>{check(true);return wait(window.fdYuzerOnaySor(...args))};
 const showGlobalOverlay=(...args)=>{check();window.showGlobalOverlay(...args);overlay={node:document.getElementById('globalOverlay'),title:document.getElementById('overlayTitle')?.textContent,sub:document.getElementById('overlaySub')?.textContent}};
 const hideGlobalOverlay=()=>{if(overlay&&overlay.node===document.getElementById('globalOverlay')&&overlay.title===document.getElementById('overlayTitle')?.textContent&&overlay.sub===document.getElementById('overlaySub')?.textContent)window.hideGlobalOverlay();overlay=null};
 function openPuantajApp() {
        openPuantajGorunumu('puantaj');
    }

async function puantajYiliDegistir() {
        const yil = document.getElementById('puanYilSec').value;
        if (!yil || yil === aktifKayitYili) { renderPuantajMatrisi(); return; }
        showGlobalOverlay('Yıl kayıtları yükleniyor', `${yil} puantaj kayıtları hazırlanıyor...`);
        try {
            await driveVerileriniYukleBaslangicta('puantaj', yil);
            renderPuantajMatrisi();
        } finally {
            hideGlobalOverlay();
        }
    }

function puantajGunleriniGosterGizle() {
        puantajGunlerGizli = !puantajGunlerGizli;
        renderPuantajMatrisi();
    }

function openContextMenu(event, inputEl, pId, dateKey) {
        event.preventDefault();
        if (isPersonelUser()) return;
        contextMenuTargetInput = { inputEl, pId, dateKey };
        const menu = document.getElementById('customContextMenu');
        menu.style.display = 'block';
        menu.style.left = `${event.pageX}px`;
        menu.style.top = `${event.pageY}px`;
    }

async function selectContextMenuValue(val) {
        if (isPersonelUser()) return;
        if (!contextMenuTargetInput) return;
        const { inputEl, pId, dateKey } = contextMenuTargetInput;

        inputEl.value = val;
        inputEl.className = getPuantajCellClass(val);

        document.getElementById('customContextMenu').style.display = 'none';
        try {
            await kaydetVeyaGuncellePuantaj(pId, dateKey, val);
        } finally {
            contextMenuTargetInput = null;
            renderPuantajMatrisi();
        }
    }

async function puantajHucreDegisti(pId, dateKey, inputEl) {
        if (isPersonelUser()) return;
        let val = inputEl.value.trim().toUpperCase();
        if (!['X', 'Y', 'R', 'Ü', 'Z', 'M', 'HS', 'RT', 'RC', 'PZ'].includes(val)) {
            val = 'X';
            inputEl.value = 'X';
        }
        
        inputEl.className = getPuantajCellClass(val);
        try {
            await kaydetVeyaGuncellePuantaj(pId, dateKey, val);
        } finally {
            renderPuantajMatrisi();
        }
    }

async function kaydetVeyaGuncellePuantaj(pId, dateKey, val) {
        const oncekiPuantajVerileri = puantajVerileri;
        puantajVerileri = puantajVerileri.filter(item => !(!item.kayitTipi && aktifSirketeAit(item) && String(item.pId) === String(pId) && String(item.tarih) === String(dateKey)));
        puantajVerileri.push({ id:`puantaj_gun_${String(pId)}_${String(dateKey)}`, pId: String(pId), tarih: String(dateKey), durum: String(val).toUpperCase(), sirketId: aktifSirketId() });
        const fdPayrollWrittenRows=puantajVerileri;
        try {
            await verileriKaydet();
        } catch (error) {
            if(initial===identity()&&puantajVerileri===fdPayrollWrittenRows) puantajVerileri = oncekiPuantajVerileri;
            throw error;
        }
    }

async function manuelPuantajKayitlariniTemizle() {
        if (!isManagerUser()) {
            alert('Manuel puantaj ve prim müdahalelerini yalnızca Admin veya Yönetici temizleyebilir.');
            return;
        }

        const mesaj = puantajGorunumu === 'prim'
            ? 'Prim uyarısı: Bu işlem yalnızca manuel prim kararlarını ve elle girilmiş puantaj günlerini kaldırır. İzinlerden gelen kayıtlar ile otomatik hesaplamalar korunur. Devam edilsin mi?'
            : 'Bu işlem yalnızca elle girilmiş puantaj günlerini ve manuel prim kararlarını kaldırır. İzin bölümündeki kayıtlar ile otomatik günler korunur. Devam edilsin mi?';
        if (!await fdYuzerOnaySor(mesaj)) return;

        const sirketId = aktifSirketId();
        puantajVerileri = puantajVerileri.filter(item => {
            if (sirketId && item.sirketId && String(item.sirketId) !== sirketId) return true;
            if (item.kayitTipi === 'primOzet') return String(item.primHakkiManuel) !== 'true';
            return Boolean(item.kayitTipi);
        });

        await verileriKaydet();
        renderPuantajMatrisi();
        alert('Manuel puantaj ve prim müdahaleleri temizlendi. İzin ve otomatik kayıtlar korunuyor.');
    }
 const actions={openPuantajApp,puantajYiliDegistir,puantajGunleriniGosterGizle,openContextMenu,selectContextMenuValue,puantajHucreDegisti,kaydetVeyaGuncellePuantaj,manuelPuantajKayitlariniTemizle};
 const writes=new Set(['openContextMenu','selectContextMenuValue','puantajHucreDegisti','kaydetVeyaGuncellePuantaj','manuelPuantajKayitlariniTemizle']);
 async function run(options){if(!options?.valid?.())return;while(operation)await operationDone;if(!options.valid())return;operation=options;let release;operationDone=new Promise(resolve=>release=resolve);
  try{check(writes.has(options.name));options.accept?.();const result=await actions[options.name].apply(this,options.args);if(!fdPayrollValid())return;return result;}catch(error){if(!fdPayrollValid())return;throw error;}finally{operation=null;release();operationDone=null;}
 }
 function cancel(){contextMenuTargetInput=null;const menu=document.getElementById('customContextMenu');if(menu)menu.style.display='none';hideGlobalOverlay();}
 return{init(){window.fdUnifiedOutput?.scan()},open(options){if(options)return run.call(this,options)},api:{fdPuantajIslem:run,fdPuantajIptalEt:cancel},dispose(){disposed=true;cancel()}};
});
