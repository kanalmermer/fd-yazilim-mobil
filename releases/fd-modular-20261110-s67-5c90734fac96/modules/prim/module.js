window.FDModules.define('prim',function(){

let fdBonusDisposed=false;const fdBonusInitial=fdBonusContext();
function fdBonusContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function fdBonusValid(){return !fdBonusDisposed&&fdBonusInitial===fdBonusContext()&&anaMenuModulErisimiVar('personel')}
function fdBonusAssert(write=false){if(!fdBonusValid())throw Error('Oturum değişti; Prim ekranını yeniden açın.');if(write&&(!isManagerUser()||isPersonelUser()||!anaMenuModulYazmaYetkisiVar('personel')))throw Error('Prim işlemi için yazma yetkiniz yok.')}
async function fdBonusAwait(p){fdBonusAssert();const result=await p;fdBonusAssert();return result}
function fdBonusOpenWorkspace(gorunum){fdBonusAssert();return window.openPuantajGorunumu(gorunum,fdBonusValid)}
let manuelPrimHakkiTarget = null;
function openPrimApp() {
fdBonusAssert(false);

        if(!personelPrimMenusuAcikMi())return showToast('Bu personel için prim takibi aktif değil.','warning');
        fdBonusOpenWorkspace('prim');
    }
async function primSabitTutariniKaydet(input) {
try{
fdBonusAssert(true);

        const tutar = Math.max(0, paraMetniniSayiyaCevir(input.value));
        input.value = tutar.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        const fdDraft=fdFinancialCapture('puantaj',fdBonusValid);
        const mevcut = primAyarKaydiBul();
        const yeni = { pId: '__AYAR__', tarih: '0000-00-00', durum: 'PRIM_AYAR', kayitTipi: 'primAyar', tutar, sirketId: aktifSirketId() };
        if (mevcut) puantajVerileri[puantajVerileri.indexOf(mevcut)] = { ...mevcut, ...yeni };
        else puantajVerileri.push(yeni);
        await fdBonusAwait(fdDraft.save(()=>verileriKaydet()));
        renderPuantajMatrisi();
    
}catch(fdBonusError){if(!fdBonusValid())return;if(fdBonusError.fdFinancialReported)return false;throw fdBonusError;}
}
function openPrimHakkiDuzenleme(event, pId) {
fdBonusAssert(true);

        event.preventDefault();
        if (!isManagerUser()) {
            alert('Prim hakkı manuel değişikliği yalnızca Admin veya Yönetici tarafından yapılabilir.');
            return;
        }

        const ay = Number(document.getElementById('puanAySec').value);
        const yil = Number(document.getElementById('puanYilSec').value);
        const personel = personeller.find(item => String(item.id) === String(pId));
        if (!personel) return;

        const durum = personelPrimDurumu(personel, ay, yil);
        manuelPrimHakkiTarget = { pId: String(pId), ay, yil };
        document.getElementById('manuelPrimPersonel').textContent = `${personel.ad} — ${yil} / ${String(ay + 1).padStart(2, '0')}`;
        document.getElementById('manuelPrimHakki').value = durum.hakkiVar ? 'Var' : 'Yok';
        document.getElementById('modalPrimHakki').style.display = 'flex';
    }
function closePrimHakkiModal() {
fdBonusAssert(false);

        manuelPrimHakkiTarget = null;
        document.getElementById('modalPrimHakki').style.display = 'none';
    }
async function manuelPrimHakkiniKaydet() {
try{
fdBonusAssert(true);

        if (!manuelPrimHakkiTarget) return;
        const fdTarget=manuelPrimHakkiTarget;
        const { pId, ay, yil } = manuelPrimHakkiTarget;
        const primHakki = document.getElementById('manuelPrimHakki').value;
        const personel = personeller.find(item => String(item.id) === String(pId));
        if (!personel) return;

        const ozetTarihi = `${yil}-${String(ay + 1).padStart(2, '0')}-00`;
        const fdDraft=fdFinancialCapture('puantaj',fdBonusValid);
        const mevcut = primOzetKaydiBul(pId, ay, yil);
        const calisilmayanGun = personelPrimCalisilmayanGunSayisi(personel, ay, yil);
        const yeniKayit = {
            ...mevcut,
            pId,
            tarih: ozetTarihi,
            durum: 'PRIM_OZET',
            kayitTipi: 'primOzet',
            primHakki,
            primHakkiManuel: 'true',
            calisilmayanGun,
            sirketId: aktifSirketId()
        };

        if (mevcut) puantajVerileri[puantajVerileri.indexOf(mevcut)] = yeniKayit;
        else puantajVerileri.push(yeniKayit);

        await fdBonusAwait(fdDraft.save(()=>verileriKaydet()));
        if(manuelPrimHakkiTarget!==fdTarget){renderPuantajMatrisi();return true;}
        closePrimHakkiModal();
        renderPuantajMatrisi();
    
}catch(fdBonusError){if(!fdBonusValid())return;if(fdBonusError.fdFinancialReported)return false;throw fdBonusError;}
}
return{init(){if(puantajGorunumu!=='prim')document.getElementById('puanPrimFiltreWrap').style.display='none';window.fdSupplementalOutputInstall?.();window.fdUnifiedOutput?.scan()},open(options){fdBonusAssert();const pending=window.fdBonusLaunchOptions?.();options=options||pending||{};if(options.fdBonusAction==='manual'){if(options.period&&JSON.stringify(options.period)!==JSON.stringify([document.getElementById('puanAySec').value,document.getElementById('puanYilSec').value]))return showToast('Seçili dönem değişti; prim hücresine yeniden sağ tıklayın.','warning');return openPrimHakkiDuzenleme({preventDefault(){}},options.pId);} return openPrimApp()},api:{get primSabitTutariniKaydet(){return primSabitTutariniKaydet},get openPrimHakkiDuzenleme(){return openPrimHakkiDuzenleme},get closePrimHakkiModal(){return closePrimHakkiModal},get manuelPrimHakkiniKaydet(){return manuelPrimHakkiniKaydet}},dispose(){fdBonusDisposed=true;manuelPrimHakkiTarget=null;if(puantajGorunumu==='prim'){const workspace=document.getElementById('puantajApp');if(workspace)workspace.style.display='none';const table=document.getElementById('puantajTablosu');if(table){if(table.tHead)table.tHead.innerHTML='';for(const b of table.tBodies)b.innerHTML=''}if(typeof fdAcikUygulamaSekmeleri!=='undefined')for(const tab of fdAcikUygulamaSekmeleri)if(tab.alanId==='puantajApp'){tab.alanId='';tab.fonksiyonAdi='openPrimApp';}}}};
});
