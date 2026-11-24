window.FDModules.define('personelaktar',function(){

let fdImportDisposed=false,fdImportOperation=0,fdImportOverlay=null,fdImportSaving=null;const fdImportDialogs=new Set(),fdImportInitial=fdImportContext();
function fdImportContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('ayarlar')])}
function fdImportValid(){return !fdImportDisposed&&Boolean(activeUser)&&anaMenuModulErisimiVar('ayarlar')&&fdImportContext()===fdImportInitial}
function fdImportAssert(manager=false){if(!fdImportValid()||(manager&&!isManagerUser()))throw Error('Oturum veya yetki değişti; personel aktarımını yeniden açın.')}
function fdImportCurrent(ticket){return fdImportValid()&&isManagerUser()&&ticket===fdImportOperation}
async function fdImportAwait(p,ticket){fdImportAssert(true);if(!fdImportCurrent(ticket))throw Error('Aktarım iptal edildi.');const value=await p;if(!fdImportCurrent(ticket))throw Error('Aktarım iptal edildi.');return value}
function showGlobalOverlay(...args){fdImportAssert(true);window.showGlobalOverlay(...args);fdImportOverlay=[document.getElementById('overlayTitle')?.textContent,document.getElementById('overlaySub')?.textContent]}
function hideGlobalOverlay(){if(fdImportOverlay&&fdImportOverlay[0]===document.getElementById('overlayTitle')?.textContent&&fdImportOverlay[1]===document.getElementById('overlaySub')?.textContent)window.hideGlobalOverlay();fdImportOverlay=null}
function fdYuzerOnaySor(...args){fdImportAssert(true);const before=document.getElementById('fdYuzerOnayKatmani'),p=window.fdYuzerOnaySor(...args),after=document.getElementById('fdYuzerOnayKatmani');if(after&&after!==before)fdImportDialogs.add(after);return p}
function fdImportClear(){fdImportOperation++;personelTopluAktarSatirlari=[];for(const n of fdImportDialogs)n.remove();fdImportDialogs.clear();hideGlobalOverlay()}
function fdImportRead(input){fdImportAssert(true);if(fdImportSaving)return;fdImportOperation++;return personelExcelDosyasiniOku(input)}
function fdImportSave(){fdImportAssert(true);if(fdImportSaving)return fdImportSaving;const ticket=fdImportOperation,p=personelTopluAktarimiKaydet().catch(error=>{if(fdImportCurrent(ticket))throw error});fdImportSaving=p;const done=()=>{if(fdImportSaving===p)fdImportSaving=null};p.then(done,done);return p}
const PERSONEL_TOPLU_AKTAR_BASLIKLARI = [
        'T.C. Kimlik No', 'Ad Soyad', 'SGK Sicil No', 'Adres', 'Telefon', 'Cinsiyet',
        'Şube', 'Görev', 'İşe Giriş Tarihi', 'Doğum Tarihi', 'Ücret (TL)',
        'Banka Adı', 'IBAN', 'Askerlik Durumu', 'Terhis Tarihi', 'Tecil Bitiş Tarihi',
        'Eğitim Seviyesi', 'Mezuniyet Yılı'
    ];
let personelTopluAktarSatirlari = [];
function personelExcelSablonuIndir() {
        if (typeof XLSX === 'undefined') {
            alert('Excel aracı yüklenemedi. İnternet bağlantısını kontrol edip sayfayı yenileyin.');
            return;
        }
        const ornekSube = subeler.find(s => aktifSirketeAit(s) && String(s.durum || 'Aktif') !== 'Pasif')?.ad
            || personeller.find(p => aktifSirketeAit(p) && p.sube)?.sube || 'MERKEZ';
        const veri = [
            PERSONEL_TOPLU_AKTAR_BASLIKLARI,
            [
                '12345678901', 'AHMET YILMAZ', '1234567890', 'ÖRNEK MAHALLESİ NO:1 BURDUR',
                '0 532 123 45 67', 'ERKEK', String(ornekSube).toLocaleUpperCase('tr-TR'), 'MUHASEBE ELEMANI',
                new Date(2026, 0, 2), new Date(1995, 4, 15), 1500, 'ZİRAAT BANKASI',
                'TR120001000000001234567890', 'YAPILDI', new Date(2015, 5, 1), '',
                'LİSANS', 2018
            ]
        ];
        const ws = XLSX.utils.aoa_to_sheet(veri);
        ws['!cols'] = [
            { wch:18 }, { wch:26 }, { wch:18 }, { wch:38 }, { wch:17 }, { wch:13 },
            { wch:24 }, { wch:25 }, { wch:18 }, { wch:18 }, { wch:16 }, { wch:22 },
            { wch:30 }, { wch:18 }, { wch:16 }, { wch:18 }, { wch:18 }, { wch:18 }
        ];
        ws['!autofilter'] = { ref:'A1:R2' };
        ws['A2'].t = 's';
        ws['A2'].z = '@';
        ws['C2'].t = 's';
        ws['E2'].t = 's';
        ws['I2'].z = 'dd.mm.yyyy';
        ws['J2'].z = 'dd.mm.yyyy';
        ws['K2'].z = '#,##0.00';
        ws['M2'].t = 's';
        ws['O2'].z = 'dd.mm.yyyy';
        ws['P2'].z = 'dd.mm.yyyy';
        ws['R2'].t = 'n';
        ws['R2'].z = '0';
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Personeller');
        const aktifSubeler = [...new Set(subeler.filter(s => aktifSirketeAit(s) && String(s.durum || 'Aktif') !== 'Pasif').map(s => String(s.ad || '').trim()).filter(Boolean))];
        const bilgi = [
            ['PERSONEL TOPLU AKTARIM AÇIKLAMASI'],
            ['1', 'Personeller sayfasındaki örnek satırı silip kendi personellerinizi alt alta yazın.'],
            ['2', 'Sütun adlarını değiştirmeyin ve yeni sütun eklemeyin.'],
            ['3', 'T.C. Kimlik No 11 haneli olmalı; Excel bu alanı metin olarak tutmalıdır.'],
            ['4', 'Tarihleri gg.aa.yyyy biçiminde; Mezuniyet Yılını yalnızca 4 haneli yıl olarak yazın.'],
            ['5', 'Şube adını aşağıdaki kayıtlı şubelerden biriyle aynı yazın.'],
            ['6', 'Cinsiyet alanına KADIN veya ERKEK yazın.'],
            ['7', 'Askerlik Durumu: YAPILDI, TECİLLİ veya MUAF. YAPILDI için Terhis Tarihi; TECİLLİ için Tecil Bitiş Tarihi zorunludur.'],
            ['8', 'Eğitim Seviyesi: İLKOKUL, ORTAOKUL, LİSE, ÖN LİSANS, LİSANS, YÜKSEK LİSANS veya DOKTORA.'],
            [],
            ['KAYITLI ŞUBELER'],
            ...(aktifSubeler.length ? aktifSubeler.map(ad => [ad]) : [['Henüz kayıtlı aktif şube bulunmuyor.']])
        ];
        const bilgiWs = XLSX.utils.aoa_to_sheet(bilgi);
        bilgiWs['!cols'] = [{ wch:18 }, { wch:90 }];
        XLSX.utils.book_append_sheet(wb, bilgiWs, 'Açıklama');
        XLSX.writeFile(wb, 'PERSONEL_TOPLU_AKTARIM_SABLONU.xlsx');
    }
function personelExcelTarihiniCoz(deger) {
        if (!deger) return '';
        if (deger instanceof Date && !Number.isNaN(deger.getTime())) {
            return `${deger.getFullYear()}-${String(deger.getMonth() + 1).padStart(2, '0')}-${String(deger.getDate()).padStart(2, '0')}`;
        }
        if (typeof deger === 'number' && XLSX?.SSF?.parse_date_code) {
            const tarih = XLSX.SSF.parse_date_code(deger);
            if (tarih) return `${tarih.y}-${String(tarih.m).padStart(2, '0')}-${String(tarih.d).padStart(2, '0')}`;
        }
        const metin = String(deger).trim();
        let eslesme = metin.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
        if (eslesme) return `${eslesme[1]}-${String(eslesme[2]).padStart(2, '0')}-${String(eslesme[3]).padStart(2, '0')}`;
        eslesme = metin.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
        if (eslesme) return `${eslesme[3]}-${String(eslesme[2]).padStart(2, '0')}-${String(eslesme[1]).padStart(2, '0')}`;
        return '';
    }
function personelExcelYiliniCoz(deger) {
        if (deger instanceof Date && !Number.isNaN(deger.getTime())) return mezuniyetYiliniDuzelt(deger);
        if (typeof deger === 'number' && deger >= 1900 && deger <= new Date().getFullYear()) return String(Math.trunc(deger));
        if (typeof deger === 'number' && XLSX?.SSF?.parse_date_code) {
            const tarih = XLSX.SSF.parse_date_code(deger);
            if (tarih?.y) return mezuniyetYiliniDuzelt(tarih.y);
        }
        return mezuniyetYiliniDuzelt(deger);
    }
function personelExcelHucreDegeri(satir, baslikHaritasi, adlar) {
        const anahtar = adlar.map(personelExcelBasliginiNormallestir).find(ad => baslikHaritasi.has(ad));
        return anahtar ? satir[baslikHaritasi.get(anahtar)] : '';
    }
async function personelExcelDosyasiniOku(input) {
const fdImportTicket=fdImportOperation;fdImportAssert(true);
        const dosya = input.files?.[0];
        if (!dosya) return;
        try {
            const veri = await fdImportAwait(dosya.arrayBuffer(),fdImportTicket);
            const wb = XLSX.read(veri, { type:'array', cellDates:true });
            const ws = wb.Sheets['Personeller'] || wb.Sheets[wb.SheetNames[0]];
            const satirlar = XLSX.utils.sheet_to_json(ws, { header:1, raw:true, defval:'' });
            if (satirlar.length < 2) throw new Error('Excel dosyasında aktarılacak personel satırı bulunamadı.');
            const baslikHaritasi = new Map(satirlar[0].map((baslik, index) => [personelExcelBasliginiNormallestir(baslik), index]));
            const eksikBasliklar = PERSONEL_TOPLU_AKTAR_BASLIKLARI.filter(b => !baslikHaritasi.has(personelExcelBasliginiNormallestir(b)));
            if (eksikBasliklar.length) throw new Error(`Şablonda şu sütunlar bulunamadı: ${eksikBasliklar.join(', ')}`);
            const hamKayitlar = satirlar.slice(1).map((satir, index) => {
                const tcNo = String(personelExcelHucreDegeri(satir, baslikHaritasi, ['T.C. Kimlik No', 'TC Kimlik No', 'TC No'])).replace(/\D/g, '');
                return {
                    excelSatiri:index + 2,
                    id:tcNo,
                    ad:String(personelExcelHucreDegeri(satir, baslikHaritasi, ['Ad Soyad', 'Adı Soyadı'])).trim().toLocaleUpperCase('tr-TR'),
                    sgkNo:String(personelExcelHucreDegeri(satir, baslikHaritasi, ['SGK Sicil No', 'SGK No'])).trim(),
                    adres:String(personelExcelHucreDegeri(satir, baslikHaritasi, ['Adres'])).trim().toLocaleUpperCase('tr-TR'),
                    telefon:String(personelExcelHucreDegeri(satir, baslikHaritasi, ['Telefon', 'Telefon Numarası'])).trim(),
                    cinsiyet:String(personelExcelHucreDegeri(satir, baslikHaritasi, ['Cinsiyet'])).trim().toLocaleUpperCase('tr-TR'),
                    sube:String(personelExcelHucreDegeri(satir, baslikHaritasi, ['Şube'])).trim().toLocaleUpperCase('tr-TR'),
                    gorev:String(personelExcelHucreDegeri(satir, baslikHaritasi, ['Görev', 'Görevi'])).trim().toLocaleUpperCase('tr-TR'),
                    girisTarihi:personelExcelTarihiniCoz(personelExcelHucreDegeri(satir, baslikHaritasi, ['İşe Giriş Tarihi'])),
                    dogumTarihi:personelExcelTarihiniCoz(personelExcelHucreDegeri(satir, baslikHaritasi, ['Doğum Tarihi'])),
                    ucret:paraMetniniSayiyaCevir(personelExcelHucreDegeri(satir, baslikHaritasi, ['Ücret (TL)', 'Ücret', 'Ücret Tutarı'])),
                    bankaAdi:String(personelExcelHucreDegeri(satir, baslikHaritasi, ['Banka Adı', 'Banka'])).trim().toLocaleUpperCase('tr-TR'),
                    iban:String(personelExcelHucreDegeri(satir, baslikHaritasi, ['IBAN'])).replace(/\s/g, '').toLocaleUpperCase('tr-TR'),
                    askerlikDurumu:String(personelExcelHucreDegeri(satir, baslikHaritasi, ['Askerlik Durumu'])).trim().toLocaleUpperCase('tr-TR'),
                    terhisTarihi:personelExcelTarihiniCoz(personelExcelHucreDegeri(satir, baslikHaritasi, ['Terhis Tarihi'])),
                    tecilBitis:personelExcelTarihiniCoz(personelExcelHucreDegeri(satir, baslikHaritasi, ['Tecil Bitiş Tarihi', 'Tecil Bitişi'])),
                    egitimSeviyesi:String(personelExcelHucreDegeri(satir, baslikHaritasi, ['Eğitim Seviyesi'])).trim().toLocaleUpperCase('tr-TR'),
                    mezuniyetYili:personelExcelYiliniCoz(personelExcelHucreDegeri(satir, baslikHaritasi, ['Mezuniyet Yılı', 'Mezuniyet Yili', 'Mezuniyet Tarihi']))
                };
            }).filter(k => k.id || k.ad || k.sgkNo || k.adres || k.telefon || k.sube || k.gorev || k.girisTarihi || k.dogumTarihi || k.ucret);
            if (!hamKayitlar.length) throw new Error('Excel dosyasında dolu personel satırı bulunamadı.');
            const tcSayilari = hamKayitlar.reduce((harita, k) => harita.set(k.id, (harita.get(k.id) || 0) + 1), new Map());
            const mevcutTc = new Set(personeller.filter(aktifSirketeAit).map(p => String(p.id)));
            const subeHaritasi = new Map();
            subeler.filter(s => aktifSirketeAit(s) && String(s.durum || 'Aktif') !== 'Pasif').forEach(s => subeHaritasi.set(String(s.ad || '').trim().toLocaleUpperCase('tr-TR'), String(s.ad || '').trim()));
            personeller.filter(aktifSirketeAit).forEach(p => { if (p.sube) subeHaritasi.set(String(p.sube).trim().toLocaleUpperCase('tr-TR'), String(p.sube).trim()); });
            personelTopluAktarSatirlari = hamKayitlar.map(k => {
                const hatalar = [];
                if (!/^\d{11}$/.test(k.id)) hatalar.push('T.C. No 11 haneli değil');
                if (!k.ad) hatalar.push('Ad Soyad boş');
                if (!k.sgkNo) hatalar.push('SGK Sicil No boş');
                if (!k.adres) hatalar.push('Adres boş');
                if (!k.telefon) hatalar.push('Telefon boş');
                if (!['KADIN', 'ERKEK'].includes(k.cinsiyet)) hatalar.push('Cinsiyet KADIN veya ERKEK olmalı');
                if (!k.sube) hatalar.push('Şube boş');
                else if (!subeHaritasi.has(k.sube)) hatalar.push('Şube sistemde kayıtlı değil');
                if (!k.gorev) hatalar.push('Görev boş');
                if (!k.girisTarihi) hatalar.push('İşe giriş tarihi geçersiz');
                if (!k.dogumTarihi) hatalar.push('Doğum tarihi geçersiz');
                if (!(Number(k.ucret) > 0)) hatalar.push('Ücret boş veya geçersiz');
                if (!k.bankaAdi) hatalar.push('Banka adı boş');
                if (!/^TR\d{24}$/.test(k.iban)) hatalar.push('IBAN TR ile başlayan 26 karakter olmalı');
                if (!['YAPILDI', 'TECİLLİ', 'TECILLI', 'MUAF'].includes(k.askerlikDurumu)) hatalar.push('Askerlik durumu geçersiz');
                if (k.askerlikDurumu === 'YAPILDI' && !k.terhisTarihi) hatalar.push('Terhis tarihi gerekli');
                if (['TECİLLİ', 'TECILLI'].includes(k.askerlikDurumu) && !k.tecilBitis) hatalar.push('Tecil bitiş tarihi gerekli');
                if (!['İLKOKUL', 'ILKOKUL', 'ORTAOKUL', 'LİSE', 'LISE', 'ÖN LİSANS', 'ON LISANS', 'LİSANS', 'LISANS', 'YÜKSEK LİSANS', 'YUKSEK LISANS', 'DOKTORA'].includes(k.egitimSeviyesi)) hatalar.push('Eğitim seviyesi geçersiz');
                if (!k.mezuniyetYili) hatalar.push('Mezuniyet yılı 1900 ile günümüz arasında 4 haneli olmalı');
                if (k.id && tcSayilari.get(k.id) > 1) hatalar.push('Excel içinde T.C. tekrarlı');
                if (mevcutTc.has(k.id)) hatalar.push('Bu T.C. sistemde zaten kayıtlı');
                return { ...k, sube:subeHaritasi.get(k.sube) || k.sube, hatalar, gecerli:hatalar.length === 0 };
            });
            personelTopluAktarOnizlemesiniGoster();
        } catch (error) {if(!fdImportCurrent(fdImportTicket))return;
            alert('Excel okunamadı: ' + (error.message || 'Bilinmeyen hata'));
        } finally {
            input.value = '';
        }
    }
function personelTopluAktarOnizlemesiniGoster() {
        const gecerli = personelTopluAktarSatirlari.filter(k => k.gecerli).length;
        const hatali = personelTopluAktarSatirlari.length - gecerli;
        document.getElementById('personelTopluAktarOzet').innerHTML = `<div style="display:flex;gap:10px;flex-wrap:wrap;"><span class="badge" style="background:#dcfce7;color:#166534;">${gecerli} geçerli kayıt</span><span class="badge" style="background:#fee2e2;color:#991b1b;">${hatali} hatalı kayıt</span></div><p style="margin:10px 0 0;color:#64748b;">Hatalı satırlar kaydedilmez. Kırmızı satırları Excel'de düzeltip dosyayı yeniden yükleyebilirsiniz.</p>`;
        document.getElementById('personelTopluAktarBody').innerHTML = personelTopluAktarSatirlari.map(k => `<tr style="${k.gecerli ? '' : 'background:#fff1f2;'}"><td>${k.excelSatiri}</td><td>${escapeDashboardText(k.id || '-')}</td><td>${escapeDashboardText(k.ad || '-')}</td><td>${escapeDashboardText(k.sube || '-')}</td><td>${escapeDashboardText(k.gorev || '-')}</td><td>${Number(k.ucret) > 0 ? paraFormatla(k.ucret) : '-'}</td><td>${k.gecerli ? '<span style="color:#047857;font-weight:800;">✓ Hazır</span>' : `<span style="color:#b91c1c;font-weight:750;">${escapeDashboardText(k.hatalar.join(' · '))}</span>`}</td></tr>`).join('');
        const buton = document.getElementById('btnPersonelTopluAktarOnay');
        buton.disabled = !gecerli;
        buton.textContent = gecerli ? `${gecerli} Personeli Kaydet` : 'Kaydedilecek Geçerli Kayıt Yok';
        document.getElementById('modalPersonelTopluAktar').style.display = 'flex';
    }
function personelTopluAktarModaliniKapat() {
        document.getElementById('modalPersonelTopluAktar').style.display = 'none';
        personelTopluAktarSatirlari = [];
    }
async function personelTopluAktarimiKaydet() {
const fdImportTicket=fdImportOperation;fdImportAssert(true);
        const kayitlar = personelTopluAktarSatirlari.filter(k => k.gecerli);
        if (!kayitlar.length || !await fdImportAwait(fdYuzerOnaySor(`${kayitlar.length} personel ve bunlara ait giriş hesapları kaydedilecek. Devam edilsin mi?`),fdImportTicket)) return;
        const yeniPersoneller = kayitlar.map(k => ({
            id:String(k.id), sirketId:aktifSirketId(), ad:k.ad, sube:k.sube, gorev:k.gorev,
            girisTarihi:k.girisTarihi, dogumTarihi:k.dogumTarihi, cikisTarihi:null,
            engelli:'Hayır', emekli:'Hayır', cocukSayisi:'0', primVar:'Hayır',
            sgkNo:k.sgkNo, adres:k.adres, telefon:k.telefon,
            cinsiyet:k.cinsiyet === 'KADIN' ? 'Kadın' : 'Erkek',
            bankaAdi:k.bankaAdi, iban:k.iban,
            askerlikDurumu:k.askerlikDurumu === 'YAPILDI' ? 'Yapıldı' : (k.askerlikDurumu === 'MUAF' ? 'Muaf' : 'Tecilli'),
            terhisTarihi:k.terhisTarihi || '', tecilBitis:k.tecilBitis || '',
            egitimSeviyesi:({
                'İLKOKUL':'İlkokul', 'ILKOKUL':'İlkokul', 'ORTAOKUL':'Ortaokul', 'LİSE':'Lise', 'LISE':'Lise', 'ÖN LİSANS':'Ön Lisans', 'ON LISANS':'Ön Lisans',
                'LİSANS':'Lisans', 'LISANS':'Lisans', 'YÜKSEK LİSANS':'Yüksek Lisans',
                'YUKSEK LISANS':'Yüksek Lisans', 'DOKTORA':'Doktora'
            })[k.egitimSeviyesi] || k.egitimSeviyesi,
            mezuniyetYili:k.mezuniyetYili,
            ucret:Number(k.ucret).toLocaleString('tr-TR', { minimumFractionDigits:0, maximumFractionDigits:2 })
        }));
        showGlobalOverlay('Personeller topluca kaydediliyor', `${yeniPersoneller.length} kayıt ve giriş hesabı hazırlanıyor...`);
        const eklenenTcNoListesi = yeniPersoneller.map(p => p.id);
        const hesapHatalari = [];
        const hesapOlusturulanIdler = new Set();
        try {
            personeller.push(...yeniPersoneller);
            for (let i = 0; i < yeniPersoneller.length; i += 4) {
                const grup = yeniPersoneller.slice(i, i + 4);
                const sonuclar = await fdImportAwait(Promise.allSettled(grup.map(p => personelKullaniciHesabiOlustur(p))),fdImportTicket);
                sonuclar.forEach((sonuc, index) => {
                    if (sonuc.status === 'rejected') hesapHatalari.push(`${grup[index].ad}: ${sonuc.reason?.message || 'hesap oluşturulamadı'}`);
                    else if (sonuc.value) hesapOlusturulanIdler.add(String(grup[index].id));
                });
            }
            await fdImportAwait(verileriKaydet(),fdImportTicket);
            const bildirimSonucu = await fdImportAwait(personelBildirimleriniTopluGonder(yeniPersoneller.filter(p => hesapOlusturulanIdler.has(String(p.id))).map(personelIseGirisBildirimiHazirla)),fdImportTicket);
            if (bildirimSonucu.basarisiz) hesapHatalari.push(`${bildirimSonucu.basarisiz} personele işe giriş WhatsApp bildirimi gönderilemedi.`);
            personelTopluAktarModaliniKapat();
            initUI();
            alert(`${yeniPersoneller.length} personel başarıyla kaydedildi.${hesapHatalari.length ? `\n\n${hesapHatalari.length} giriş hesabı oluşturulamadı; personel kayıtları kaydedildi:\n${hesapHatalari.join('\n')}` : `\n\nKullanıcı adları T.C. numarası, ilk şifreleri T.C. numarasının ilk 6 hanesidir.`}`);
        } catch (error) {if(!fdImportCurrent(fdImportTicket))return;
            personeller = personeller.filter(p => !eklenenTcNoListesi.includes(String(p.id)));
            alert('Toplu personel kaydı tamamlanamadı: ' + (error.message || 'Bilinmeyen hata'));
        } finally {
            hideGlobalOverlay();
        }
    }
return{open(action,input){fdImportAssert();action=action||window.fdPersonelAktarIstegi?.();if(action==='template')return personelExcelSablonuIndir();if(action==='read'&&input?.files?.[0])return fdImportRead(input);if(action==='read')window.showToast('Excel dosyasını yeniden seçin.','warning')},api:{personelExcelSablonuIndir(){fdImportAssert();return personelExcelSablonuIndir()},personelExcelDosyasiniOku:fdImportRead,personelTopluAktarimiKaydet:fdImportSave,personelTopluAktarModaliniKapat(){fdImportAssert();if(fdImportSaving)return;fdImportClear();return personelTopluAktarModaliniKapat()}},dispose(){fdImportDisposed=true;fdImportClear();document.getElementById('personelTopluAktarBody')?.replaceChildren();document.getElementById('personelTopluAktarOzet')?.replaceChildren()}};
});
