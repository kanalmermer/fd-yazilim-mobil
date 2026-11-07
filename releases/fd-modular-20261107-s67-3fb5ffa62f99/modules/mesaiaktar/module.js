window.FDModules.define('mesaiaktar',function(){
 const host=window,jobs=new Set();let disposed=false;
 async function execute(request){
  if(disposed||!request?.current())return false;jobs.add(request);let overlay=null;
  const alive=()=>!disposed&&request.current();const check=()=>{if(!alive())throw Error('Mesai aktarımı ekranı veya seçimi değişti.');};
  const native={show:host.showGlobalOverlay,hide:host.hideGlobalOverlay,save:host.verileriKaydet,render:host.renderPuantajMatrisi,alert:host.alert};
  const hide=()=>{if(overlay&&overlay.node===host.document.getElementById('globalOverlay')&&overlay.title===host.document.getElementById('overlayTitle')?.textContent&&overlay.sub===host.document.getElementById('overlaySub')?.textContent)native.hide();overlay=null;};request.onCancel=hide;
  const document={getElementById:(...a)=>{check();return host.document.getElementById(...a);}};
  const XLSX=request.library,personeller=request.people,puantajVerileri=request.records;
  const file={arrayBuffer:async()=>{check();const data=await request.file.arrayBuffer();check();return data;}};
  const event={target:{files:[file],value:''}};
  const showGlobalOverlay=(...a)=>{check();native.show(...a);overlay={node:host.document.getElementById('globalOverlay'),title:host.document.getElementById('overlayTitle')?.textContent,sub:host.document.getElementById('overlaySub')?.textContent};};
  const hideGlobalOverlay=hide,alert=(...a)=>{if(alive())return native.alert(...a);};
  const verileriKaydet=async()=>{check();const result=await native.save();check();return result;};
  const renderPuantajMatrisi=(...a)=>{check();return native.render(...a);};
function mesaiMetniniEslestirmeIcinDuzenle(deger) {
        return String(deger || '').trim().toLocaleUpperCase('tr-TR')
            .replace(/Ç/g, 'C').replace(/Ğ/g, 'G').replace(/İ/g, 'I').replace(/İ/g, 'I')
            .replace(/Ö/g, 'O').replace(/Ş/g, 'S').replace(/Ü/g, 'U')
            .replace(/[^A-Z0-9]/g, '');
    }
function excelMesaiSaatiniSayiyaCevir(deger) {
        if (typeof deger === 'number') return Number.isFinite(deger) ? Math.max(0, deger) : 0;
        let metin = String(deger || '').trim().replace(/\s/g, '');
        if (!metin) return 0;
        if (metin.includes(',') && metin.includes('.')) metin = metin.replace(/\./g, '').replace(',', '.');
        else if (metin.includes(',')) metin = metin.replace(',', '.');
        const sayi = Number(metin);
        return Number.isFinite(sayi) ? Math.max(0, sayi) : 0;
    }
  async function mesaiExcelDosyasiniOku(event) {
        const dosya = event.target.files?.[0];
        event.target.value = '';
        if (!dosya) return;
        if (typeof XLSX === 'undefined') { alert('Excel okuma kütüphanesi yüklenemedi. Sayfayı yenileyip tekrar deneyin.'); return; }

        try {
            showGlobalOverlay('Excel okunuyor', 'Personel adları ve mesai saatleri eşleştiriliyor...');
            const veri = await dosya.arrayBuffer();
            const kitap = XLSX.read(veri, { type:'array' });
            const sayfa = kitap.Sheets[kitap.SheetNames[0]];
            const satirlar = XLSX.utils.sheet_to_json(sayfa, { header:1, defval:'', raw:true });
            if (!satirlar.length) throw new Error('Excel dosyasında okunabilir satır bulunamadı.');

            const baslikSatirNo = satirlar.findIndex(satir => satir.some(h => /ad\s*soyad|personel|mesai|saat/i.test(String(h))));
            const baslik = satirlar[baslikSatirNo > -1 ? baslikSatirNo : 0].map(mesaiMetniniEslestirmeIcinDuzenle);
            let adSutunu = baslik.findIndex(h => /ADSOYAD|PERSONELADI|PERSONEL|ISIMSOYISIM|AD/.test(h));
            let mesaiSutunu = baslik.findIndex(h => /FAZLAMESAI|MESAI|MESAISAA?TI|SAA?T/.test(h));
            if (adSutunu < 0) adSutunu = 0;
            if (mesaiSutunu < 0) mesaiSutunu = 1;
            const veriBaslangici = baslikSatirNo > -1 ? baslikSatirNo + 1 : 1;

            const excelMesaileri = new Map();
            satirlar.slice(veriBaslangici).forEach(satir => {
                const ad = mesaiMetniniEslestirmeIcinDuzenle(satir[adSutunu]);
                const saat = excelMesaiSaatiniSayiyaCevir(satir[mesaiSutunu]);
                if (ad && saat > 0) excelMesaileri.set(ad, (excelMesaileri.get(ad) || 0) + saat);
            });
            if (!excelMesaileri.size) throw new Error('Ad soyad ve mesai saati sütunları bulunamadı. İlk sayfada bu iki sütunun olduğundan emin olun.');

            const ay = Number(document.getElementById('puanAySec').value);
            const yil = Number(document.getElementById('puanYilSec').value);
            const tarih = `${puantajAyAnahtari(ay, yil)}-00`;
            const personelIndeksi = new Map(personeller.filter(p => aktifSirketeAit(p)).map(p => [mesaiMetniniEslestirmeIcinDuzenle(p.ad), p]));
            const eslesmeyenler = [];
            let aktarilan = 0;

            excelMesaileri.forEach((saat, ad) => {
                const personel = personelIndeksi.get(ad);
                if (!personel) { eslesmeyenler.push(ad); return; }
                const yuvarlanmisSaat = mesaiSaatiniYukariYarimaYuvarla(saat);
                const mevcut = puantajVerileri.find(k => k.kayitTipi === 'maasOzet' && String(k.pId) === String(personel.id) && String(k.tarih) === tarih && String(k.sirketId || '') === aktifSirketId());
                const yeni = { ...(mevcut || {}), pId:String(personel.id), tarih, durum:'MAAS_OZET', kayitTipi:'maasOzet', sirketId:aktifSirketId(), fazlaMesaiSaati:yuvarlanmisSaat, fazlaMesaiSaatiManuel:'true' };
                if (mevcut) puantajVerileri[puantajVerileri.indexOf(mevcut)] = yeni;
                else puantajVerileri.push(yeni);
                aktarilan++;
            });

            if (!aktarilan) throw new Error('Exceldeki personel adları kayıtlı personellerle eşleşmedi.');
            yuklenenVeriler.add('puantaj');
            await verileriKaydet();
            renderPuantajMatrisi();
            const ekBilgi = eslesmeyenler.length ? ` Eşleşmeyen ${eslesmeyenler.length} isim aktarılmadı.` : '';
            alert(`${aktarilan} personelin fazla mesai saati seçili aya aktarıldı.${ekBilgi}`);
        } catch (error) {
            console.error(error);
            alert(error.message || 'Excel dosyası okunamadı.');
        } finally {
            hideGlobalOverlay();
        }
    }
  try{return await mesaiExcelDosyasiniOku(event)}finally{hide();jobs.delete(request);request.onCancel=null;}
 }
 return{open:execute,api:{},dispose(){disposed=true;for(const r of jobs)r.cancel();jobs.clear();}};
});
