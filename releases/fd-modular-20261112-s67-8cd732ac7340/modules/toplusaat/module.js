window.FDModules.define('toplusaat',function(){
let disposed=false,busy=false,generation=0,ownedStyle=null,ownedOverlay=null,observer=null;const initial=context(),dialogs=new Set();
function context(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',activeUser?.tcNo||'',anaMenuModulYetkisi('personel')])}
function current(){return !disposed&&Boolean(activeUser)&&isManagerUser()&&anaMenuModulErisimiVar('personel')&&context()===initial}
function assertCurrent(write=false){if(!current()||(write&&!anaMenuModulYazmaYetkisiVar('personel')))throw Error('Oturum veya yetki değişti; toplu saat ekranını yeniden açın.')}
function visible(){const modal=document.getElementById('modalMagicpassTopluSaat');return modal?.isConnected&&modal.style.display==='flex'}
function cancel(){generation++;for(const node of dialogs)if(node.isConnected)node.querySelector('[data-fd-iptal]')?.click();dialogs.clear()}
function fdTopluSaatKapat(){cancel();modalKapat('modalMagicpassTopluSaat')}
function showGlobalOverlay(...args){assertCurrent(true);window.showGlobalOverlay(...args);ownedOverlay=[document.getElementById('overlayTitle')?.textContent,document.getElementById('overlaySub')?.textContent]}
function hideGlobalOverlay(){if(ownedOverlay&&ownedOverlay[0]===document.getElementById('overlayTitle')?.textContent&&ownedOverlay[1]===document.getElementById('overlaySub')?.textContent)window.hideGlobalOverlay();ownedOverlay=null}
function fdBulkConfirm(...args){assertCurrent(true);const old=document.getElementById('fdYuzerOnayKatmani'),promise=window.fdYuzerOnaySor(...args),node=document.getElementById('fdYuzerOnayKatmani');if(node&&node!==old)dialogs.add(node);return promise}
function stylesInOriginalOrder(){const verified=document.querySelector('style[data-fd-module-style="toplusaat"]'),anchor=document.querySelector('[data-fd-personnel-style-slot="00.css"]');if(!verified||!anchor)throw Error('Toplu saat stili yüklenemedi.');verified.media='not all';ownedStyle=document.createElement('style');ownedStyle.dataset.fdBulkHoursStyle='00.css';ownedStyle.textContent=verified.textContent;anchor.after(ownedStyle)}
function magicpassTopluSaatAktifPersonelleri() {
        return personeller.filter(personel => {
            const cikis=String(personel?.cikisTarihi??'').trim().toLocaleLowerCase('tr-TR');
            return aktifSirketeAit(personel)&&(!cikis||['null','undefined','-','0000-00-00'].includes(cikis));
        }).sort((a,b)=>String(a.ad||'').localeCompare(String(b.ad||''),'tr'));
    }
function magicpassTopluSaatDoldurmaAc() {
        if(!isManagerUser())return;
        const aktifler=magicpassTopluSaatAktifPersonelleri(),subeSelect=document.getElementById('magicTopluSaatSube');
        const subeAdlari=[...new Set(aktifler.map(p=>String(p.sube||'Merkez')).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));
        const mevcutSube=String(document.getElementById('magicpassSubeFiltre')?.value||'');
        subeSelect.innerHTML=subeAdlari.map(ad=>`<option value="${escapeDashboardText(ad)}">${escapeDashboardText(ad)}</option>`).join('');
        subeSelect.value=subeAdlari.includes(mevcutSube)?mevcutSube:(subeAdlari[0]||'');
        const vardiyaSelect=document.getElementById('magicTopluSaatVardiya');
        vardiyaSelect.innerHTML='<option value="gunluk">Personelin günlük vardiya planını kullan</option>'+magicpassVardiyaTanimlariniDuzelt().map(v=>`<option value="${escapeDashboardText(v.id)}">${escapeDashboardText(v.ad)} · ${escapeDashboardText(v.baslangic+'-'+v.bitis)}</option>`).join('');
        vardiyaSelect.value='gunluk';
        const ay=String(document.getElementById('magicpassAy')?.value||magicpassTarihAnahtari(new Date()).slice(0,7)),parca=ay.split('-').map(Number),sonGun=new Date(parca[0],parca[1],0).getDate();
        document.getElementById('magicTopluSaatBaslangic').value=ay+'-01';
        document.getElementById('magicTopluSaatBitis').value=ay+'-'+String(sonGun).padStart(2,'0');
        document.getElementById('magicTopluSaatGiris').value='';document.getElementById('magicTopluSaatCikis').value='';
        document.getElementById('magicTopluSaatCihazsiz').checked=true;document.getElementById('magicTopluSaatTumPersoneller').checked=true;
        document.getElementById('magicTopluSaatIzinAtla').checked=true;document.getElementById('magicTopluSaatTatilAtla').checked=true;document.getElementById('magicTopluSaatSadeceBos').checked=true;
        magicpassTopluSaatPersonelleriniCiz();
        document.getElementById('modalMagicpassTopluSaat').style.display='flex';
    }
function magicpassTopluSaatPersonelleriniCiz() {
        const alan=document.getElementById('magicTopluSaatPersoneller');if(!alan)return;
        const sube=String(document.getElementById('magicTopluSaatSube')?.value||''),sadeceCihazsiz=document.getElementById('magicTopluSaatCihazsiz')?.checked;
        const onceki=new Set([...alan.querySelectorAll('input[name="magicTopluSaatPersonel"]:checked')].map(input=>input.value));
        const tumSecili=document.getElementById('magicTopluSaatTumPersoneller')?.checked;
        const liste=magicpassTopluSaatAktifPersonelleri().filter(p=>String(p.sube||'Merkez')===sube&&(!sadeceCihazsiz||!String(p.cihazPersonelNo||'').trim()));
        alan.innerHTML=liste.length?liste.map(p=>`<label><input type="checkbox" name="magicTopluSaatPersonel" value="${escapeDashboardText(p.id)}" ${(tumSecili||onceki.has(String(p.id)))?'checked':''} onchange="magicpassTopluSaatSecimOzetiniGuncelle()"><span><strong>${escapeDashboardText(p.ad||'Personel')}</strong><small>${escapeDashboardText(p.gorev||'-')} · ${p.cihazPersonelNo?'Cihaz '+escapeDashboardText(p.cihazPersonelNo):'Cihaz no yok'}</small></span></label>`).join(''):'<div style="grid-column:1/-1;padding:18px;text-align:center;color:#64748b;">Bu filtreye uygun personel bulunmuyor.</div>';
        magicpassTopluSaatSecimOzetiniGuncelle();
    }
function magicpassTopluSaatTumunuSec(secili) {
        document.querySelectorAll('input[name="magicTopluSaatPersonel"]').forEach(input=>input.checked=Boolean(secili));
        magicpassTopluSaatSecimOzetiniGuncelle();
    }
function magicpassTopluSaatSecimOzetiniGuncelle() {
        const tum=[...document.querySelectorAll('input[name="magicTopluSaatPersonel"]')],secili=tum.filter(input=>input.checked).length;
        const ozet=document.getElementById('magicTopluSaatSecimOzeti');if(ozet)ozet.textContent=secili+' personel seçili';
        const tumSec=document.getElementById('magicTopluSaatTumPersoneller');if(tumSec)tumSec.checked=Boolean(tum.length&&secili===tum.length);
    }
function magicpassTopluSaatVardiyaDegisti() {
        const id=String(document.getElementById('magicTopluSaatVardiya')?.value||'gunluk');
        const giris=document.getElementById('magicTopluSaatGiris'),cikis=document.getElementById('magicTopluSaatCikis');
        if(id==='gunluk'){giris.value='';cikis.value='';return;}
        const tanim=magicpassVardiyaTanimiBul(id);giris.value=tanim?.baslangic||'';cikis.value=tanim?.bitis||'';
    }
async function magicpassTopluSaatKaydet(event,fdBulkValid) {
        event.preventDefault();if(!isManagerUser())return;
        const pIdler=[...document.querySelectorAll('input[name="magicTopluSaatPersonel"]:checked')].map(input=>String(input.value));
        const bas=String(document.getElementById('magicTopluSaatBaslangic').value||''),bit=String(document.getElementById('magicTopluSaatBitis').value||'');
        const vardiyaSecimi=String(document.getElementById('magicTopluSaatVardiya').value||'gunluk'),girisOverride=String(document.getElementById('magicTopluSaatGiris').value||''),cikisOverride=String(document.getElementById('magicTopluSaatCikis').value||'');
        const tatilAtla=document.getElementById('magicTopluSaatTatilAtla').checked,sadeceBos=document.getElementById('magicTopluSaatSadeceBos').checked;
        if(!pIdler.length)return showToast('En az bir personel seçin.','warning');if(!bas||!bit||bit<bas)return showToast('Geçerli bir başlangıç ve bitiş tarihi seçin.','warning');
        const seciliPersoneller=pIdler.map(id=>personeller.find(p=>String(p.id)===id&&aktifSirketeAit(p))).filter(Boolean),islemler=[];
        const atlanan={izin:0,tatil:0,dolu:0,istihdam:0,saat:0};
        for(const d=new Date(bas+'T12:00:00'),son=new Date(bit+'T12:00:00');d<=son;d.setDate(d.getDate()+1)){
            const tarih=magicpassTarihAnahtari(d);
            for(const personel of seciliPersoneller){
                const girisTarihi=String(personel.girisTarihi||'').slice(0,10),cikisTarihi=String(personel.cikisTarihi||'').slice(0,10);
                if((girisTarihi&&tarih<girisTarihi)||(cikisTarihi&&tarih>cikisTarihi)){atlanan.istihdam++;continue;}
                const izin=izinler.some(i=>aktifSirketeAit(i)&&String(i.pId)===String(personel.id)&&tarih>=String(i.baslangic)&&tarih<=String(i.bitis));
                if(izin){atlanan.izin++;continue;}
                const vardiya=vardiyaSecimi==='gunluk'?magicpassGunVardiyasi(personel,tarih):vardiyaSecimi,tanim=magicpassVardiyaTanimiBul(vardiya),gunTuru=magicpassGunTuruBul(personel,tarih);
                if(tatilAtla&&(gunTuru||vardiya==='izin'||tanim?.tatil||tanim?.resmiTatil||tanim?.girisCikisYasak)){atlanan.tatil++;continue;}
                const girisSaat=girisOverride||tanim?.baslangic||'',cikisSaat=cikisOverride||tanim?.bitis||'';
                if(!girisSaat||!cikisSaat){atlanan.saat++;continue;}
                const mevcutDuzeltmeler=magicpassKayitlari('magicpassDuzeltme').filter(k=>String(k.pId)===String(personel.id)&&String(k.tarih)===tarih);
                const hareketler=String(personel.cihazPersonelNo||'').trim()?magicpassGunHareketleri(personel,tarih,vardiya):[];
                if(sadeceBos&&(mevcutDuzeltmeler.length||hareketler.length)){atlanan.dolu++;continue;}
                const girisZamani=magicpassSaatliTarih(tarih,girisSaat),cikisZamani=magicpassSaatliTarih(tarih,cikisSaat,cikisSaat<=girisSaat);
                islemler.push({personel,tarih,vardiya,tanim,girisSaat,cikisSaat,girisZamani,cikisZamani,mevcutDuzeltmeler});
            }
        }
        if(!islemler.length)return showToast('Seçilen aralıkta doldurulacak uygun boş gün bulunamadı.','warning');
        const mesaj=`${seciliPersoneller.length} personel için ${islemler.length} günlük giriş–çıkış kaydı oluşturulacak.\n\nGiriş: ${girisOverride||'günlük vardiyadan'} · Çıkış: ${cikisOverride||'günlük vardiyadan'}${atlanan.izin?`\n${atlanan.izin} izinli gün atlandı.`:''}${atlanan.tatil?`\n${atlanan.tatil} tatil/çalışma olmayan gün atlandı.`:''}${atlanan.dolu?`\n${atlanan.dolu} dolu gün korundu.`:''}\n\nDevam edilsin mi?`;
        if(!(await fdBulkConfirm(mesaj,'Tarih Aralığını Doldur','Doldur'))||!fdBulkValid())return;
        assertCurrent(true);
        const oncekiKayitlar=[...vardiyaKayitlari],zaman=Date.now();showGlobalOverlay('Giriş–çıkış saatleri kaydediliyor',`${islemler.length} günlük kayıt hazırlanıyor...`);
        try{
            islemler.forEach((islem,index)=>{
                vardiyaKayitlari=vardiyaKayitlari.filter(k=>!(k.kayitTipi==='magicpassDuzeltme'&&aktifSirketeAit(k)&&String(k.pId)===String(islem.personel.id)&&String(k.tarih)===islem.tarih));
                vardiyaKayitlari.push({id:'mduz_toplu_'+islem.personel.id+'_'+islem.tarih+'_'+zaman+'_'+index,kayitTipi:'magicpassDuzeltme',sirketId:aktifSirketId(),pId:String(islem.personel.id),tarih:islem.tarih,girisZamani:islem.girisZamani.toISOString(),cikisZamani:islem.cikisZamani.toISOString(),giris:islem.girisSaat,cikis:islem.cikisSaat,aciklama:'Tarih aralığı toplu doldurma · '+(vardiyaSecimi==='gunluk'?'Günlük vardiya planı':String(islem.tanim?.ad||islem.vardiya)),kaynak:'topluSaat',zaman:zaman+index});
            });
            yuklenenVeriler.add('vardiya');await supabaseVerileriKaydet();if(!fdBulkValid())return;assertCurrent(true);modalKapat('modalMagicpassTopluSaat');magicpassAylikCizelgeyiCiz();
            showToast(islemler.length+' günlük giriş–çıkış kaydı vardiya saatleri temel alınarak dolduruldu.');
        }catch(error){if(!fdBulkValid())return;vardiyaKayitlari=oncekiKayitlar;showToast('Toplu saatler kaydedilemedi: '+(error.message||error),'error');}
        finally{hideGlobalOverlay();}
    }
return{init(){assertCurrent();stylesInOriginalOrder();observer=new MutationObserver(()=>{if(!visible()||document.getElementById('magicpassApp')?.style.display==='none')cancel()});observer.observe(document.getElementById('modalMagicpassTopluSaat'),{attributes:true,attributeFilter:['style']});const app=document.getElementById('magicpassApp');if(app)observer.observe(app,{attributes:true,attributeFilter:['style']})},open(){assertCurrent();if(busy)return false;cancel();return magicpassTopluSaatDoldurmaAc()},api:{magicpassTopluSaatAktifPersonelleri(...args){assertCurrent();return magicpassTopluSaatAktifPersonelleri(...args)},magicpassTopluSaatPersonelleriniCiz(...args){assertCurrent();return magicpassTopluSaatPersonelleriniCiz(...args)},magicpassTopluSaatTumunuSec(...args){assertCurrent();return magicpassTopluSaatTumunuSec(...args)},magicpassTopluSaatSecimOzetiniGuncelle(...args){assertCurrent();return magicpassTopluSaatSecimOzetiniGuncelle(...args)},magicpassTopluSaatVardiyaDegisti(...args){assertCurrent();return magicpassTopluSaatVardiyaDegisti(...args)},fdTopluSaatKapat,async magicpassTopluSaatKaydet(event){event.preventDefault();assertCurrent(true);if(busy||!visible())return;busy=true;const ticket=generation,valid=()=>current()&&ticket===generation&&visible();try{return await magicpassTopluSaatKaydet(event,valid)}finally{busy=false;hideGlobalOverlay()}}},dispose(){disposed=true;observer?.disconnect();cancel();hideGlobalOverlay();ownedStyle?.remove();document.getElementById('magicpassTopluSaatForm')?.reset();document.getElementById('magicTopluSaatPersoneller')?.replaceChildren()}};
});
