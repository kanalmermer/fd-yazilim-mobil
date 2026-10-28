window.FDModules.define('manuelduzeltme',function(){
let disposed=false,bound=null,owned=null,observer=null;const initial=context();
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',JSON.stringify(anaMenuModulAyarlariniDuzelt().map(v=>[v.anahtar,anaMenuModulYetkisi(v.anahtar)]))])}
function valid(){return !disposed&&context()===initial&&bound?.current()}
function clear(){bound?.cancel();bound=null;if(!owned)return;owned.style.display='none';for(const n of owned.querySelectorAll('input,textarea'))n.value='';for(const id of ['magicpassDuzeltmeBilgi','magicpassDuzeltmeVardiyaBilgi','magicpassDuzeltmeAraliklar'])owned.querySelector('#'+id)?.replaceChildren();observer?.takeRecords()}
function selectionChanged(){if(bound&&!valid())clear()}
function magicpassDuzeltmeGorunumunuAc(tarih){
        if(isPersonelUser())return showToast('Giriş–çıkış kayıtlarınızı yalnızca görüntüleyebilirsiniz.','warning');
        if(magicpassDuzeltmeKayitIslemi)return;
        const personel=personeller.find(p=>String(p.id)===String(document.getElementById('magicpassPersonel')?.value));if(!personel)return;
        const hesap=magicpassGunHesapla(personel,tarih),duzeltme=hesap.duzeltme||{},saatler=magicpassVardiyaSaatleri(hesap.vardiya||magicpassGunVardiyasi(personel,tarih),tarih);
        document.getElementById('magicpassDuzeltmePersonelId').value=String(personel.id);document.getElementById('magicpassDuzeltmeTarih').value=tarih;
        document.getElementById('magicpassDuzeltmeBilgi').textContent=(personel.ad||'Personel')+' · '+tarihFormati(tarih);
        document.getElementById('magicpassDuzeltmeVardiyaBilgi').innerHTML='<strong>'+escapeDashboardText(saatler.tanim?.ad||magicpassVardiyaAdi(hesap.vardiya))+'</strong><br>Planlanan saat: '+escapeDashboardText(hesap.vardiya==='izin'?'-':magicpassYerelTarihSaatDegeri(saatler.bas).slice(11,16)+'–'+magicpassYerelTarihSaatDegeri(saatler.bit).slice(11,16))+(hesap.tatilAdi?'<br>Tatil: '+escapeDashboardText(hesap.tatilAdi):'')+(hesap.izinAdi?'<br>İzin: '+escapeDashboardText(hesap.izinAdi):'');
        const araliklar=hesap.duzeltme?magicpassDuzeltmeCalismaAraliklari(duzeltme,tarih,saatler):(hesap.calismaAraliklari?.length?hesap.calismaAraliklari:magicpassCalismaAraliklari(hesap.hareketler||[],saatler));
        magicpassDuzeltmeAraliklariniCiz(araliklar.length?araliklar:[{giris:hesap.giris,cikis:hesap.cikis}],saatler);
        document.getElementById('magicpassDuzeltmeAciklama').value=String(duzeltme.aciklama||'');
        document.getElementById('modalMagicpassDuzeltme').style.display='flex';
    }
return{init(){owned=document.getElementById('modalMagicpassDuzeltme');observer=new MutationObserver(()=>{if(bound&&owned.style.display==='none')clear()});observer.observe(owned,{attributes:true,attributeFilter:['style']});for(const id of ['magicpassPersonel','magicpassAy'])document.getElementById(id)?.addEventListener('change',selectionChanged)},open(request=window.fdManuelDuzeltmeAcmaIstegi?.()){if(disposed||!request?.current()||context()!==initial||magicpassDuzeltmeKayitIslemi)return false;if(bound&&bound!==request)clear();bound=request;request.clearError();magicpassDuzeltmeGorunumunuAc(...request.args);return owned.style.display==='flex'},api:{fdManuelDuzeltmePenceresiniKapat:clear},dispose(){clear();disposed=true;observer?.disconnect();for(const id of ['magicpassPersonel','magicpassAy'])document.getElementById(id)?.removeEventListener('change',selectionChanged);owned=null}};
});
