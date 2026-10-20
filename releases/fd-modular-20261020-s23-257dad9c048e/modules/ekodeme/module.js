window.FDModules.define('ekodeme',function(){

let fdExtraDisposed=false;const fdExtraInitial=fdExtraContext(),fdExtraTimers=new Set(),fdExtraNodes=new Set(),fdExtraDialogs=new Set();let fdExtraOverlay=null;
function fdExtraContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function fdExtraValid(){return !fdExtraDisposed&&fdExtraInitial===fdExtraContext()&&anaMenuModulErisimiVar('personel')}
function fdExtraAssert(write=false){if(!fdExtraValid())throw Error('Oturum değişti; Ek Ödeme ekranını yeniden açın.');if(write&&!anaMenuModulYazmaYetkisiVar('personel'))throw Error('Bu modülde değişiklik yapma yetkiniz yok.')}
async function fdExtraAwait(p){fdExtraAssert();const r=await p;fdExtraAssert();return r}
function fdExtraTimeout(fn,ms,...args){fdExtraAssert();const id=window.setTimeout(()=>{fdExtraTimers.delete(id);if(fdExtraValid()&&anaMenuModulYazmaYetkisiVar('personel'))fn(...args)},ms);fdExtraTimers.add(id);return id}
function fdExtraClearTimeout(id){fdExtraTimers.delete(id);window.clearTimeout(id)}
function fdExtraClean(n){if(!n)return;if(n._url){URL.revokeObjectURL(n._url);n._url=null}n.querySelectorAll?.('iframe').forEach(f=>f.src='about:blank');n._blob=null;n.remove()}
function fdExtraDialog(fn,id,args){fdExtraAssert();const previous=document.getElementById(id),p=fn(...args),node=document.getElementById(id);if(node&&node!==previous)fdExtraDialogs.add(node);return p}
function fdExtraConfirm(...args){return fdExtraDialog(window.fdYuzerOnaySor,'fdYuzerOnayKatmani',args)}
function fdExtraPrompt(...args){return fdExtraDialog(window.fdYuzerDegerSor,'fdYuzerDegerKatmani',args)}
function fdExtraShowOverlay(...args){fdExtraAssert();window.showGlobalOverlay(...args);const n=document.getElementById('globalOverlay');fdExtraOverlay=n?{node:n,html:n.innerHTML}:null}
function fdExtraHideOverlay(){if(fdExtraOverlay&&fdExtraOverlay.node.innerHTML===fdExtraOverlay.html)window.hideGlobalOverlay();fdExtraOverlay=null}
function fdExtraPdf(...args){fdExtraAssert();args[3]={...args[3],fdIsCurrent:fdExtraValid};const previous=document.getElementById('fdOrtakCiktiOnizleme'),p=window.fdTabloPdfOnizle(...args),node=document.getElementById('fdOrtakCiktiOnizleme'),owned=node!==previous?node:null;if(owned)fdExtraNodes.add(owned);return Promise.resolve(p).then(v=>{if(fdExtraValid())return v},e=>{if(fdExtraValid())throw e}).finally(()=>{if(!fdExtraValid())fdExtraClean(owned)})}
function fdExtraPagehide(){if(!fdExtraValid()||!anaMenuModulYazmaYetkisiVar('personel'))return;
        if (SUPABASE_MODE) return;
        if (!ekOdemeKayitBekliyor || !ekOdemeler.length || !navigator.sendBeacon) return;
        const veri = new Blob([JSON.stringify({ ekOdemeler })], { type: 'text/plain;charset=utf-8' });
        navigator.sendBeacon(GOOGLE_SCRIPT_URL, veri);
    }

async function openEkOdemeApp() {
try{
fdExtraAssert(false);

        anaMenuDonusButonunuGoster();
        ['appHub', 'personelDashboardApp', 'personelApp', 'izinTakipApp', 'puantajApp', 'avansApp', 'sirketApp', 'icraApp', 'kkdApp'].forEach(id => {
fdExtraAssert(false);
 const el = document.getElementById(id); if (el) el.style.display = 'none'; });
        const app = document.getElementById('ekOdemeApp');
        app.style.display = 'block';
        workspaceSekmesiniAktifEt('ekodeme');
        const ay = document.getElementById('ekOdemeAySec');
        if (!ay.value) ay.value = new Date().toISOString().slice(0, 7);
        await fdExtraAwait(new Promise(requestAnimationFrame));
        await fdExtraAwait(ekOdemeCizelgesiniHazirla());
        if (!fdModulVerisiTazeMi('ekodeme', String(ay.value || '').slice(0, 4))) {
            driveVerileriniYukleBaslangicta('ekodeme', String(ay.value || '').slice(0, 4)).then(() => {
fdExtraAssert(false);

                if (document.getElementById('ekOdemeApp')?.style.display !== 'block') return;
                return ekOdemeCizelgesiniHazirla();
            }).catch(error => {
fdExtraAssert(false);

                console.error('Ek ödeme verileri yenilenemedi:', error);
                showToast('Ek ödeme verileri arka planda yenilenemedi.', 'warning');
            });
        }
    
}catch(fdExtraError){if(!fdExtraValid())return;throw fdExtraError;}
}
async function ekOdemeAyiDegistir() {
try{
fdExtraAssert(false);

        const yil = String(document.getElementById('ekOdemeAySec').value || '').slice(0, 4);
        if (yil && yil !== aktifKayitYili) {
            fdExtraShowOverlay('Yıl kayıtları yükleniyor', `${yil} ek ödeme kayıtları hazırlanıyor...`);
            try { await fdExtraAwait(driveVerileriniYukleBaslangicta('ekodeme', yil)); }
            finally {
if(fdExtraValid()){
 fdExtraHideOverlay(); 
}
}
        }
        ekOdemeCizelgesiniHazirla();
    
}catch(fdExtraError){if(!fdExtraValid())return;throw fdExtraError;}
}
function ekOdemeOncekiAy(ay) {
fdExtraAssert(false);

        const tarih = new Date(`${ay}-01T00:00:00`); tarih.setMonth(tarih.getMonth() - 1);
        return `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, '0')}`;
    }
function ekOdemeAnahtari(kayit) {
fdExtraAssert(false);
 return `${ekOdemeAyiniNormalizeEt(kayit.ay)}|${kayit.pId}|${kayit.kalem || 'ek'}|${kayit.sirketId || aktifSirketId()}`; }
function ekOdemeKaydiBul(pId, ay, kalem = 'ek') {
fdExtraAssert(false);
 return ekOdemeler.find(k => String(k.pId) === String(pId) && ekOdemeAyiniNormalizeEt(k.ay) === ekOdemeAyiniNormalizeEt(ay) && String(k.kalem || 'ek') === kalem && (!k.sirketId || String(k.sirketId) === aktifSirketId())); }
function ekOdemeDonemTutariBul(personel, ay) {
fdExtraAssert(false);

        const hedefAy = ekOdemeAyiniNormalizeEt(ay);
        const gecmis = (Array.isArray(personel?.ekOdemeUcretGecmisi) ? personel.ekOdemeUcretGecmisi : [])
            .map((kayit, sira) => ({ ...kayit, sira, baslangicAyi:ekOdemeAyiniNormalizeEt(kayit.baslangicAyi || kayit.baslangicTarihi) }))
            .filter(kayit => kayit.baslangicAyi && kayit.baslangicAyi <= hedefAy)
            .sort((a, b) => a.baslangicAyi.localeCompare(b.baslangicAyi) || a.sira - b.sira);
        const donem = gecmis.at(-1);
        return {
            ekOdemeTuru:donem?.ekOdemeTuru ?? personel?.ekOdemeTuru ?? 'EK ÖDEME',
            ekOdemeTutari:ekOdemeParaDegeri(donem?.ekOdemeTutari ?? personel?.ekOdemeTutari),
            yolUcreti:ekOdemeParaDegeri(donem?.yolUcreti ?? personel?.yolUcreti)
        };
    }
let ekOdemeEkranSatirlari = [];
let ekOdemeHareketPersonelId = '';
let ekOdemeHareketYili = '';
function ekOdemeHareketToplami(kayit) {
fdExtraAssert(false);

        return (Array.isArray(kayit?.odemeler) ? kayit.odemeler : []).reduce((toplam, odeme) => toplam + ekOdemeKurusDegeri(odeme.tutar), 0) / 100;
    }
function ekOdemeKaydininHareketleriniDuzelt(kayit) {
fdExtraAssert(false);

        if (Array.isArray(kayit.odemeler)) {
            kayit.odemeler = kayit.odemeler.map(odeme => ({ ...odeme, tutar:ekOdemeParaDegeri(odeme.tutar) }));
        } else {
            const eskiToplam = ekOdemeParaDegeri(kayit.odenenTutar);
            kayit.odemeler = eskiToplam > 0 ? [{
                id:`eski_${kayit.id || Date.now()}`,
                tarih:kayit.odemeTarihi || `${ekOdemeAyiniNormalizeEt(kayit.ay)}-01`,
                tutar:eskiToplam,
                aciklama:'ÖNCEKİ TOPLAM KAYIT'
            }] : [];
        }
        kayit.odenenTutar = ekOdemeHareketToplami(kayit);
        kayit.kalanTutar = Math.max(0, ekOdemeKurusDegeri(kayit.toplamTutar) - ekOdemeKurusDegeri(kayit.odenenTutar)) / 100;
        return kayit;
    }
function ekOdemeKayitlariniDuzelt() {
fdExtraAssert(false);

        const eskiAdet = ekOdemeler.length;
        const donusumGerekiyor = ekOdemeler.some(k => !k.kalem || !Array.isArray(k.odemeler) || String(k.ekOdemeTuru || '') !== String(k.ekOdemeTuru || '').toLocaleUpperCase('tr-TR'));
        const donusmus = ekOdemeler.flatMap(k => {
fdExtraAssert(false);

            if (k.kalem) return [ekOdemeKaydininHareketleriniDuzelt({ ...k, ay: ekOdemeAyiniNormalizeEt(k.ay), ekOdemeTuru: String(k.ekOdemeTuru || (k.kalem === 'yol' ? 'YOL ÜCRETİ' : 'EK ÖDEME')).toLocaleUpperCase('tr-TR'), tutar: ekOdemeParaDegeri(k.tutar), devredenTutar: ekOdemeParaDegeri(k.devredenTutar), toplamTutar: ekOdemeParaDegeri(k.toplamTutar), odenenTutar: ekOdemeParaDegeri(k.odenenTutar), kalanTutar: ekOdemeParaDegeri(k.kalanTutar) })];
            const ek = ekOdemeParaDegeri(k.ekOdemeTutari), yol = ekOdemeParaDegeri(k.yolUcreti), odenen = ekOdemeParaDegeri(k.odenenTutar);
            return [
                ...(ek ? [ekOdemeKaydininHareketleriniDuzelt({ ...k, ay: ekOdemeAyiniNormalizeEt(k.ay), id: `ekodeme_${ekOdemeAyiniNormalizeEt(k.ay)}_${k.pId}_ek`, kalem: 'ek', tutar: ek, devredenTutar: 0, toplamTutar: ek, odenenTutar: Math.min(ek, odenen), kalanTutar: Math.max(0, ek - odenen) })] : []),
                ...(yol ? [ekOdemeKaydininHareketleriniDuzelt({ ...k, ay: ekOdemeAyiniNormalizeEt(k.ay), id: `ekodeme_${ekOdemeAyiniNormalizeEt(k.ay)}_${k.pId}_yol`, kalem: 'yol', ekOdemeTuru: 'YOL ÜCRETİ', tutar: yol, devredenTutar: ekOdemeParaDegeri(k.devredenTutar), toplamTutar: yol + ekOdemeParaDegeri(k.devredenTutar), odenenTutar: Math.max(0, odenen - ek), kalanTutar: Math.max(0, yol + ekOdemeParaDegeri(k.devredenTutar) - Math.max(0, odenen - ek)) })] : [])
            ];
        });
        const tekil = new Map();
        donusmus.forEach(k => {
fdExtraAssert(false);
 const onceki = tekil.get(ekOdemeAnahtari(k)); if (!onceki || Number(k.odenenTutar) >= Number(onceki.odenenTutar)) tekil.set(ekOdemeAnahtari(k), k); });
        ekOdemeler = [...tekil.values()];
        return ekOdemeler.length !== eskiAdet || donusumGerekiyor;
    }
function ekOdemeAylariniGetir(baslangic,bitis){
fdExtraAssert(false);
const sonuc=[],d=new Date(`${baslangic}-01T12:00:00`),son=new Date(`${bitis}-01T12:00:00`);for(let i=0;d<=son&&i<600;i++,d.setMonth(d.getMonth()+1))sonuc.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);return sonuc}
function ekOdemeBakiyeHesapla(personel,kalem,hedefAy){
fdExtraAssert(false);
const kayitlar=ekOdemeler.filter(k=>aktifSirketeAit(k)&&String(k.pId)===String(personel.id)&&String(k.kalem||'ek')===kalem&&ekOdemeAyiniNormalizeEt(k.ay)<=hedefAy),ilk=kayitlar.map(k=>ekOdemeAyiniNormalizeEt(k.ay)).filter(Boolean).sort()[0]||hedefAy;let bakiye=0,onceki=0,buAyOdeme=0;for(const ay of ekOdemeAylariniGetir(ilk,hedefAy)){if(ay===hedefAy)onceki=bakiye;const ucret=ekOdemeDonemTutariBul(personel,ay),tutar=ekOdemeKurusDegeri(kalem==='yol'?ucret.yolUcreti:ucret.ekOdemeTutari),odemeler=kayitlar.filter(k=>ekOdemeAyiniNormalizeEt(k.ay)===ay).reduce((s,k)=>s+ekOdemeKurusDegeri(ekOdemeHareketToplami(k)),0);bakiye+=odemeler-tutar;if(ay===hedefAy)buAyOdeme=odemeler}return{onceki:onceki/100,bakiye:bakiye/100,buAyOdeme:buAyOdeme/100,borc:Math.max(0,-bakiye)/100,kredi:Math.max(0,bakiye)/100}}
function ekOdemeCizelgesiniHazirla() {
fdExtraAssert(false);

        const ay = document.getElementById('ekOdemeAySec').value; if (!ay) return;
        const kayitlarDuzeltildi = ekOdemeKayitlariniDuzelt();
        if (kayitlarDuzeltildi && anaMenuModulYazmaYetkisiVar('personel')) { yuklenenVeriler.add('ekOdemeler'); ekOdemeleriKaydet(true); }
        const satirlar = [];
        personeller.filter(p => aktifSirketeAit(p) && (!p.cikisTarihi || String(p.cikisTarihi) === 'null')).forEach(p => {
fdExtraAssert(false);

            const donemUcreti = ekOdemeDonemTutariBul(p, ay);
            [['ek', donemUcreti.ekOdemeTuru || 'EK ÖDEME', donemUcreti.ekOdemeTutari], ['yol', 'YOL ÜCRETİ', donemUcreti.yolUcreti]].forEach(([kalem, tur, tutar]) => {
fdExtraAssert(false);

                const mevcut = ekOdemeKaydiBul(p.id, ay, kalem),gecmisVar=ekOdemeler.some(k=>aktifSirketeAit(k)&&String(k.pId)===String(p.id)&&String(k.kalem||'ek')===kalem);
                if (!mevcut && !tutar && !gecmisVar) return;
                const bakiye=ekOdemeBakiyeHesapla(p,kalem,ay);
                satirlar.push({ id: mevcut?.id || `ekodeme_${ay}_${p.id}_${kalem}`, kalem, sirketId: aktifSirketId(), ay, pId: String(p.id), personelAd: p.ad || '', ekOdemeTuru: String(mevcut?.ekOdemeTuru || tur).toLocaleUpperCase('tr-TR'), tutar, odemeler:Array.isArray(mevcut?.odemeler) ? mevcut.odemeler : [], ...bakiye });
            });
        });
        ekOdemeEkranSatirlari = satirlar.sort((a, b) => String(a.personelAd).localeCompare(String(b.personelAd), 'tr') || String(a.kalem).localeCompare(String(b.kalem)));
        const body = document.querySelector('#ekOdemeTablosu tbody'), ayTarihi = new Date(`${ay}-01T00:00:00`);
        document.getElementById('ekOdemeGoruntuBaslik').textContent = `AYLIK EK ÖDEME ÇİZELGESİ — ${ayTarihi.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }).toLocaleUpperCase('tr-TR')}`;
        body.innerHTML = ekOdemeEkranSatirlari.map(k => `<tr><td><button type="button" class="fd-table-cell-link" onclick="ekOdemeHareketleriniAc('${k.pId}')">${escapeDashboardText(k.personelAd)}</button></td><td>${escapeDashboardText(k.ekOdemeTuru)}</td><td>${paraFormatla(k.tutar)}</td><td style="color:${k.onceki>=0?'#047857':'#b91c1c'};font-weight:800">${k.onceki>=0?'+':''}${paraFormatla(k.onceki)}</td><td><strong style="color:#047857">${paraFormatla(k.buAyOdeme)}</strong></td><td><input type="text" inputmode="numeric" value="" placeholder="Tutar gir" title="Yüksek tutar girebilirsiniz; artan bakiye sonraki aylara aktarılır." oninput="ekOdemeOdenenYazilirken('${k.id}', this)" onchange="ekOdemeOdenenGuncelle('${k.id}', this.value)" style="min-width:120px"></td><td class="ek-odeme-kalan" style="font-weight:900;color:${k.kredi>0?'#047857':'#b91c1c'}">${k.kredi>0?'Devreden kredi: '+paraFormatla(k.kredi):'Kalan borç: '+paraFormatla(k.borc)}</td></tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:#64748b;padding:22px;">Bu ay için ek ödeme veya yol ücreti tanımlı personel bulunmuyor.</td></tr>';
    }
let ekOdemeKaydetmeZamanlayicisi = null;
let ekOdemeKayitBekliyor = false;
function ekOdemeleriKaydet(acil = false) {
fdExtraAssert(true);

        yuklenenVeriler.add('ekOdemeler');
        veriOnbelleginiKaydet();
        ekOdemeKayitBekliyor = true;
        fdExtraClearTimeout(ekOdemeKaydetmeZamanlayicisi);
        if (acil) return verileriKaydet();
        ekOdemeKaydetmeZamanlayicisi = fdExtraTimeout(() => verileriKaydet(), 250);
    }
function ekOdemeOdenenYazilirken(id, input) {
fdExtraAssert(false);

        const kayit = ekOdemeEkranSatirlari.find(k => String(k.id) === String(id)); if (!kayit) return;
        paraGirisiFormatla(input);
        const yeniOdeme = Math.max(0, ekOdemeParaDegeri(input.value));
        const kalanHucresi = input.closest('tr')?.querySelector('.ek-odeme-kalan');
        if (kalanHucresi) { const yeniBakiye=(ekOdemeKurusDegeri(kayit.bakiye)+ekOdemeKurusDegeri(yeniOdeme))/100;kalanHucresi.textContent=yeniBakiye>=0?'Devreden kredi: '+paraFormatla(yeniBakiye):'Kalan borç: '+paraFormatla(-yeniBakiye);kalanHucresi.style.color=yeniBakiye>=0?'#047857':'#b91c1c'; }
    }
async function ekOdemeOdenenGuncelle(id, deger) {
try{
fdExtraAssert(true);

        const ekranKaydi = ekOdemeEkranSatirlari.find(k => String(k.id) === String(id));
        if (!ekranKaydi) return;
        const input = [...document.querySelectorAll('#ekOdemeTablosu input')].find(item => item.getAttribute('onchange')?.includes(`'${id}'`));
        const girilenOdeme = Math.max(0, ekOdemeParaDegeri(input?.value ?? deger));
        if (!girilenOdeme) return;
        const index = ekOdemeler.findIndex(k => String(k.id) === String(id));
        const kayit = index === -1 ? { ...ekranKaydi, odemeler:[] } : ekOdemeler[index];
        if (!Array.isArray(kayit.odemeler)) kayit.odemeler = [];
        const fark = girilenOdeme;
        const simdi = new Date();
        const bugun = `${simdi.getFullYear()}-${String(simdi.getMonth() + 1).padStart(2, '0')}-${String(simdi.getDate()).padStart(2, '0')}`;
        kayit.odemeler.push({ id:`odeme_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, tarih:bugun, tutar:fark, aciklama:'ÖDEME' });
        kayit.tutar=ekranKaydi.tutar;kayit.toplamTutar=ekranKaydi.tutar;kayit.odenenTutar = ekOdemeHareketToplami(kayit);
        kayit.kalanTutar = Math.max(0, ekOdemeKurusDegeri(ekranKaydi.tutar) - ekOdemeKurusDegeri(kayit.odenenTutar)) / 100;
        if (index === -1) ekOdemeler.push(kayit); else ekOdemeler[index] = kayit;
        await fdExtraAwait(ekOdemeleriKaydet(true));
        ekOdemeCizelgesiniHazirla();
    
}catch(fdExtraError){if(!fdExtraValid())return;throw fdExtraError;}
}
function ekOdemeHareketleriniKapat() {
fdExtraAssert(false);
 document.getElementById('modalEkOdemeHareketleri').style.display = 'none'; }
function ekOdemeHareketExcelIndir() {
fdExtraAssert(false);

        const satirlar = ekOdemeHareketSatirlari();
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([['ÖDEME TARİHİ','DÖNEM','ÖDEME TÜRÜ','ÖDENEN TUTAR'], ...satirlar.map(h => [tarihFormati(h.tarih), h.ay, String(h.tur).toLocaleUpperCase('tr-TR'), Number(h.tutar || 0)])]);
        ws['!cols'] = [{wch:16},{wch:12},{wch:28},{wch:18}];
        ws['!autofilter'] = { ref:ws['!ref'] };
        XLSX.utils.book_append_sheet(wb, ws, 'Ödeme Hareketleri');
        XLSX.writeFile(wb, `Ek_Odeme_Hareketleri_${ekOdemeHareketYili}.xlsx`);
    }
function ekOdemeHareketPdfIndir() {
fdExtraAssert(false);

        const tablo=document.querySelector('#ekOdemeHareketRaporu table');
        return fdExtraPdf(tablo,'EK ÖDEME HAREKETLERİ · '+ekOdemeHareketYili,'Ek_Odeme_Hareketleri_'+ekOdemeHareketYili+'.pdf',{yon:'portrait'});
    }
function ekOdemeExcelIndir() {
fdExtraAssert(false);
 const wb = XLSX.utils.book_new(), ws = XLSX.utils.table_to_sheet(document.getElementById('ekOdemeTablosu')); ws['!autofilter'] = {ref:ws['!ref']}; XLSX.utils.book_append_sheet(wb, ws, 'Ek Odemeler'); XLSX.writeFile(wb, `Ek_Odemeler_${document.getElementById('ekOdemeAySec').value}.xlsx`); }
function ekOdemePdfIndir() {
fdExtraAssert(false);
 const tablo=document.querySelector('#ekOdemeCizelgeAlani table'); return fdExtraPdf(tablo,'EK ÖDEME ÇİZELGESİ · '+document.getElementById('ekOdemeAySec').value,'Ek_Odemeler_'+document.getElementById('ekOdemeAySec').value+'.pdf',{yon:'landscape'}); }
async function ekOdemeGoruntuAl() {
try{
fdExtraAssert(false);

        try {
            const canvas = await fdExtraAwait(html2canvas(document.getElementById('ekOdemeCizelgeAlani'), { scale: 2, backgroundColor: '#ffffff' }));
            const blob = await fdExtraAwait(new Promise(resolve => canvas.toBlob(resolve, 'image/png')));
            if (!blob || !navigator.clipboard || !window.ClipboardItem) throw new Error('Tarayıcı desteği yok');
            await fdExtraAwait(navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]));
            alert('Seçili ay bilgisiyle birlikte çizelge panoya kopyalandı.');
        } catch (error) {
if(!fdExtraValid())return;

            alert('Görsel panoya kopyalanamadı. Tarayıcının pano iznine izin verip tekrar deneyin.');
        }
    
}catch(fdExtraError){if(!fdExtraValid())return;throw fdExtraError;}
}
function ekOdemeHareketSatirlari(pId=ekOdemeHareketPersonelId,yil=ekOdemeHareketYili){
fdExtraAssert(false);

        return ekOdemeler.filter(k=>aktifSirketeAit(k)&&String(k.pId)===String(pId)&&String(k.ay||'').startsWith(String(yil))).flatMap(k=>(Array.isArray(k.odemeler)?k.odemeler:[]).map(odeme=>({...odeme,kayitId:String(k.id),ay:k.ay,tur:k.ekOdemeTuru||(k.kalem==='yol'?'YOL ÜCRETİ':'EK ÖDEME')}))).sort((a,b)=>String(a.tarih||'').localeCompare(String(b.tarih||''))||String(a.ay||'').localeCompare(String(b.ay||'')));
    }
function ekOdemeHareketleriniAc(pId){
fdExtraAssert(false);

        ekOdemeHareketPersonelId=String(pId);ekOdemeHareketYili=String(document.getElementById('ekOdemeAySec').value||'').slice(0,4);const personel=personeller.find(p=>String(p.id)===String(pId)),baslik=String(personel?.ad||'PERSONEL').toLocaleUpperCase('tr-TR')+' — '+ekOdemeHareketYili+' ÖDEME HAREKETLERİ',satirlar=ekOdemeHareketSatirlari();
        document.getElementById('ekOdemeHareketBaslik').textContent=baslik;document.getElementById('ekOdemeHareketRaporBaslik').textContent=baslik;document.querySelector('#ekOdemeHareketTablosu tbody').innerHTML=satirlar.map(h=>'<tr><td>'+tarihFormati(h.tarih)+'</td><td>'+escapeDashboardText(h.ay)+'</td><td>'+escapeDashboardText(String(h.tur).toLocaleUpperCase('tr-TR'))+'</td><td style="font-weight:800;color:#047857">'+paraFormatla(h.tutar)+'</td><td data-html2canvas-ignore="true"><div class="action-btns"><button type="button" class="btn-modern btn-edit-modern" onclick="ekOdemeHareketDuzenle(\''+escapeDashboardText(h.kayitId)+'\',\''+escapeDashboardText(h.id)+'\')">Düzenle</button><button type="button" class="btn-modern btn-del-modern" onclick="ekOdemeHareketSil(\''+escapeDashboardText(h.kayitId)+'\',\''+escapeDashboardText(h.id)+'\')">Sil</button></div></td></tr>').join('')||'<tr><td colspan="5" style="text-align:center;padding:20px;color:#64748b">Bu yıl için kayıtlı ödeme hareketi yok.</td></tr>';document.querySelector('#ekOdemeHareketTablosu tfoot').innerHTML='<tr><th colspan="3" style="text-align:right">TOPLAM ÖDENEN</th><th>'+paraFormatla(satirlar.reduce((t,h)=>t+ekOdemeKurusDegeri(h.tutar),0)/100)+'</th><th></th></tr>';document.getElementById('modalEkOdemeHareketleri').style.display='flex';
    }
async function ekOdemeHareketDuzenle(kayitId,hareketId){
try{
fdExtraAssert(true);
const kayit=ekOdemeler.find(k=>String(k.id)===String(kayitId)),hareket=kayit?.odemeler?.find(o=>String(o.id)===String(hareketId));if(!hareket)return alert('Ödeme hareketi bulunamadı.');const tutarMetni=await fdExtraAwait(fdExtraPrompt('Ödeme tutarını düzeltin:',Number(hareket.tutar||0).toLocaleString('tr-TR'),'Ek Ödeme Hareketini Düzenle','Devam'));if(tutarMetni===null)return;const tutar=ekOdemeParaDegeri(tutarMetni);if(!(tutar>0))return alert('Geçerli bir tutar girin.');const tarih=await fdExtraAwait(fdExtraPrompt('Ödeme tarihini YYYY-AA-GG biçiminde girin:',hareket.tarih||new Date().toISOString().slice(0,10),'Ödeme Tarihi','Kaydet'));if(tarih===null)return;if(!/^\d{4}-\d{2}-\d{2}$/.test(String(tarih)))return alert('Tarihi 2026-09-19 biçiminde girin.');hareket.tutar=tutar;hareket.tarih=String(tarih);kayit.odenenTutar=ekOdemeHareketToplami(kayit);try{await fdExtraAwait(ekOdemeleriKaydet(true));ekOdemeCizelgesiniHazirla();ekOdemeHareketleriniAc(ekOdemeHareketPersonelId);showToast('Ödeme hareketi güncellendi.')}catch(error){
if(!fdExtraValid())return;
alert('Ödeme hareketi güncellenemedi: '+(error.message||error))}
}catch(fdExtraError){if(!fdExtraValid())return;throw fdExtraError;}
}
async function ekOdemeHareketSil(kayitId,hareketId){
try{
fdExtraAssert(true);

        if(!await fdExtraAwait(fdExtraConfirm('Bu deneme/ödeme hareketi kalıcı olarak silinsin mi?')))return;const index=ekOdemeler.findIndex(k=>String(k.id)===String(kayitId));if(index<0)return alert('Ek ödeme kaydı bulunamadı.');const kayit=ekOdemeler[index];kayit.odemeler=(kayit.odemeler||[]).filter(o=>String(o.id)!==String(hareketId));kayit.odenenTutar=ekOdemeHareketToplami(kayit);kayit.kalanTutar=Math.max(0,ekOdemeKurusDegeri(kayit.toplamTutar)-ekOdemeKurusDegeri(kayit.odenenTutar))/100;if(!kayit.odemeler.length)ekOdemeler.splice(index,1);
        try{await fdExtraAwait(ekOdemeleriKaydet(true));ekOdemeCizelgesiniHazirla();ekOdemeHareketleriniAc(ekOdemeHareketPersonelId);showToast('Ek ödeme hareketi silindi.');}catch(error){
if(!fdExtraValid())return;
alert('Ek ödeme hareketi silinemedi: '+(error.message||error));}
    
}catch(fdExtraError){if(!fdExtraValid())return;throw fdExtraError;}
}
ekOdemeHareketSil=async function(kayitId,hareketId){
try{
fdExtraAssert(true);

        if(!(await fdExtraAwait(fdExtraConfirm('Bu deneme/ödeme hareketi kalıcı olarak silinsin mi?','Ek Ödeme Hareketini Sil','Hareketi Sil'))))return;
        const index=ekOdemeler.findIndex(k=>String(k.id)===String(kayitId));if(index<0)return alert('Ek ödeme kaydı bulunamadı.');const kayit=ekOdemeler[index];kayit.odemeler=(kayit.odemeler||[]).filter(o=>String(o.id)!==String(hareketId));kayit.odenenTutar=ekOdemeHareketToplami(kayit);kayit.kalanTutar=Math.max(0,ekOdemeKurusDegeri(kayit.toplamTutar)-ekOdemeKurusDegeri(kayit.odenenTutar))/100;if(!kayit.odemeler.length)ekOdemeler.splice(index,1);
        try{await fdExtraAwait(ekOdemeleriKaydet(true));ekOdemeCizelgesiniHazirla();ekOdemeHareketleriniAc(ekOdemeHareketPersonelId);showToast('Ek ödeme hareketi silindi.');}catch(error){
if(!fdExtraValid())return;
alert('Ek ödeme hareketi silinemedi: '+(error.message||error));}
    
}catch(fdExtraError){if(!fdExtraValid())return;throw fdExtraError;}
};
return{init(){ekOdemeSekmeleriniKur();window.addEventListener("pagehide",fdExtraPagehide);window.fdSupplementalOutputInstall?.();window.fdUnifiedOutput?.scan()},open(...args){fdExtraAssert();return openEkOdemeApp(...args)},api:{get ekOdemeAyiDegistir(){return ekOdemeAyiDegistir},get ekOdemeOncekiAy(){return ekOdemeOncekiAy},get ekOdemeAnahtari(){return ekOdemeAnahtari},get ekOdemeKaydiBul(){return ekOdemeKaydiBul},get ekOdemeDonemTutariBul(){return ekOdemeDonemTutariBul},get ekOdemeHareketToplami(){return ekOdemeHareketToplami},get ekOdemeKaydininHareketleriniDuzelt(){return ekOdemeKaydininHareketleriniDuzelt},get ekOdemeKayitlariniDuzelt(){return ekOdemeKayitlariniDuzelt},get ekOdemeAylariniGetir(){return ekOdemeAylariniGetir},get ekOdemeBakiyeHesapla(){return ekOdemeBakiyeHesapla},get ekOdemeCizelgesiniHazirla(){return ekOdemeCizelgesiniHazirla},get ekOdemeleriKaydet(){return ekOdemeleriKaydet},get ekOdemeOdenenYazilirken(){return ekOdemeOdenenYazilirken},get ekOdemeOdenenGuncelle(){return ekOdemeOdenenGuncelle},get ekOdemeHareketleriniKapat(){return ekOdemeHareketleriniKapat},get ekOdemeHareketExcelIndir(){return ekOdemeHareketExcelIndir},get ekOdemeHareketPdfIndir(){return ekOdemeHareketPdfIndir},get ekOdemeExcelIndir(){return ekOdemeExcelIndir},get ekOdemePdfIndir(){return ekOdemePdfIndir},get ekOdemeGoruntuAl(){return ekOdemeGoruntuAl},get ekOdemeHareketSatirlari(){return ekOdemeHareketSatirlari},get ekOdemeHareketleriniAc(){return ekOdemeHareketleriniAc},get ekOdemeHareketDuzenle(){return ekOdemeHareketDuzenle},get ekOdemeHareketSil(){return ekOdemeHareketSil}},dispose(){fdExtraDisposed=true;window.removeEventListener("pagehide",fdExtraPagehide);for(const id of fdExtraTimers)window.clearTimeout(id);fdExtraTimers.clear();fdExtraHideOverlay();for(const n of fdExtraDialogs)if(n.isConnected)n.querySelector("[data-fd-iptal],[data-fd-deger-iptal]")?.click();fdExtraDialogs.clear();for(const n of fdExtraNodes)fdExtraClean(n);fdExtraNodes.clear();ekOdemeEkranSatirlari=[];ekOdemeHareketPersonelId="";ekOdemeHareketYili="";ekOdemeKaydetmeZamanlayicisi=null;ekOdemeKayitBekliyor=false;const tab=typeof fdAcikUygulamaSekmeleri!=="undefined"?fdAcikUygulamaSekmeleri.find(t=>t.alanId==="ekOdemeApp"):null;if(tab)tab.alanId="";}};
});
