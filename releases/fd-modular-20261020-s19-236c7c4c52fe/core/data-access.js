function supabaseKayitAnahtari(modul, kayit, index) {
        if (kayit?.id !== undefined && kayit?.id !== null && String(kayit.id)) return String(kayit.id);
        if (modul === 'puantaj') return [kayit?.pId || '', kayit?.tarih || '', kayit?.kayitTipi || kayit?.durum || ''].join('|');
        if (modul === 'ekOdemeler') return [kayit?.pId || '', kayit?.ay || '', kayit?.kalem || ''].join('|');
        if (modul === 'izinler') return [kayit?.pId || '', kayit?.baslangic || '', kayit?.bitis || '', kayit?.tur || '', index].join('|');
        return String(kayit?.pId || kayit?.username || kayit?.ad || index);
    }

function supabaseKayitYili(modul, kayit) {
        const kaynak = modul === 'kiratakip'
            ? (kayit?.giderYili || kayit?.baslangic || kayit?.baslangicAy || kayit?.ay || kayit?.donem || kayit?.tarih)
            : (modul === 'ekOdemeler' ? kayit?.ay : (modul === 'izinler' ? kayit?.baslangic : (modul === 'vardiya' ? kayit?.haftaBaslangic : kayit?.tarih)));
        const eslesme = String(kaynak || '').match(/^(\d{4})/);
        return eslesme ? Number(eslesme[1]) : Number(aktifKayitYili || new Date().getFullYear());
    }

function supabasePersonelKimligi(kayit, modul = '') {
        if (modul === 'personeller') return String(kayit?.id || kayit?.tcNo || '');
        return String(kayit?.pId || kayit?.personelId || kayit?.tcNo || '');
    }

function supabaseKapaliDonemHatasiMi(error) {
        return /20\d{2}-(0[1-9]|1[0-2]) d[oö]nemi kapal[ıi]d[ıi]r/i.test(String(error?.message || error || ''));
    }

function supabaseKapaliDonemAyiniBul(error) {
        return String(error?.message || error || '').match(/20\d{2}-(?:0[1-9]|1[0-2])/)?.[0] || '';
    }

function supabaseYerelKaydiGeriAl(anahtar, legacyId, eskiJson) {
        const liste = veriDizisiniGetir(anahtar);
        const index = liste.findIndex((kayit, sira) => supabaseKayitAnahtari(anahtar, kayit, sira) === legacyId);
        if (eskiJson === undefined) {
            if (index !== -1) liste.splice(index, 1);
            return;
        }
        const eskiKayit = JSON.parse(eskiJson);
        if (index === -1) liste.push(eskiKayit);
        else liste[index] = eskiKayit;
    }

function supabaseKullaniciEpostalari(kullaniciAdi) {
        const temiz = String(kullaniciAdi || '').trim().toLocaleLowerCase('tr-TR')
            .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9._-]/g, '');
        return [`${temiz}@fd-yazilim.local`, `${temiz}@kanalportal.local`];
    }

function fdPortalVeriOturumu() { return String(activeUser?.supabaseUserId || '') + '|' + String(activeUser?.sirketId || '') + '|' + String(activeUser?.rol || ''); }

function fdPortalVeriOturumuGecerli(oturum) { return oturum === fdPortalVeriOturumu() && !!activeUser?.sirketId && !['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol); }

function supabaseDiziAta(anahtar, kayitlar) {
        if (['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol)) return false;
        if (anahtar === 'personeller') personeller = kayitlar.map(item => ({ ...item, id: String(item.id) }));
        if (anahtar === 'izinler') {
            const sunucuIdleri = new Set(kayitlar.map(item => String(item.id)));
            const sirketId = aktifSirketId();
            const bekleyenler = izinBekleyenKayitlariOku().filter(item => String(item.sirketId || '') === String(sirketId));
            const onbellekYeniMi = izinYerelOnbellekZamani > 0 && Date.now() - izinYerelOnbellekZamani < 14 * 24 * 60 * 60 * 1000;
            const onbellektekiler = onbellekYeniMi ? izinYerelOnbellekKopyasi.filter(item => !item.sirketId || String(item.sirketId) === String(sirketId)) : [];
            const adayHaritasi = new Map([...bekleyenler, ...onbellektekiler]
                .filter(item => item?.id !== undefined && !sunucuIdleri.has(String(item.id)))
                .map(item => [String(item.id), item]));
            izinKurtarmaAdaylari = [...adayHaritasi.values()];
            izinler = kayitlar;
        }
        if (anahtar === 'kullanicilar') kullanicilar = kayitlar;
        if (anahtar === 'puantaj') puantajVerileri = kayitlar.map(item => ({ ...item, pId: String(item.pId || ''), tarih: String(item.tarih || '').split('T')[0], durum: String(item.durum || '').toUpperCase() }));
        if (anahtar === 'avanslar') avanslar = kayitlar;
        if (anahtar === 'ekOdemeler') ekOdemeler = kayitlar;
        if (anahtar === 'kkd') kkdKayitlari = kayitlar;
        if (anahtar === 'vardiya') vardiyaKayitlari = kayitlar;
        if (anahtar === 'irsaliyeler') tasimaIrsaliyeleri = kayitlar;
        if (anahtar === 'kiratakip') kiraKayitlari = kayitlar;
        if (anahtar === 'ihracat') ihracatFirmalari = kayitlar.map(item=>({ ...item, yuklemeler:Array.isArray(item.yuklemeler)?item.yuklemeler:[] }));
        if (anahtar === 'icralar') icralar = kayitlar.map(item => ({ ...item, kesintiler: Array.isArray(item.kesintiler) ? item.kesintiler : [] }));
        if (anahtar === 'araclar') araclar = kayitlar.map(item => ({ ...item, bakimlar:Array.isArray(item.bakimlar) ? item.bakimlar : [], mtvOdemeleri:Array.isArray(item.mtvOdemeleri) ? item.mtvOdemeleri : [], sigortaGecmisi:Array.isArray(item.sigortaGecmisi) ? item.sigortaGecmisi : [], vizeGecmisi:Array.isArray(item.vizeGecmisi) ? item.vizeGecmisi : [], trafikCezalari:Array.isArray(item.trafikCezalari) ? item.trafikCezalari : [] }));
        if (anahtar === 'akaryakit') akaryakitKayitlari = kayitlar;
        if (anahtar === 'subeler') subeler = kayitlar;
        yuklenenVeriler.add(anahtar);
        veriKayitGoruntusunuYenile(anahtar);
    }

async function supabaseSirketiYukle() {
        if (!activeUser?.sirketId) return;
        const fdVeriOturumu = fdPortalVeriOturumu();
        if (!fdPortalVeriOturumuGecerli(fdVeriOturumu)) return;
        const { data, error } = await supabaseClient.from('companies').select('id,short_name,title,data').eq('id', activeUser.sirketId).maybeSingle();
        if (!fdPortalVeriOturumuGecerli(fdVeriOturumu)) return;
        if (error) throw error;
        const sirket = data ? { ...(data.data || {}), id: data.id, kisaAd: data.short_name || data.data?.kisaAd || '', unvan: data.title || data.data?.unvan || '' } : null;
        sirketler = sirket ? [sirket] : [];
        uygulamaAyarlari = { ...VARSAYILAN_UYGULAMA_AYARLARI, ...(data?.data?.uygulamaAyarlari || {}) };
        if (['Admin','Yonetici'].includes(activeUser?.rol)) {
            try {
                const { data:ortakYedek } = await supabaseClient.from('portal_settings').select('value').eq('company_id',activeUser.sirketId).eq('setting_key','bulut_yedekleme').maybeSingle();
                if (!fdPortalVeriOturumuGecerli(fdVeriOturumu)) return;
                if (ortakYedek?.value && !data?.data?.uygulamaAyarlari?.yedekleme) uygulamaAyarlari.yedekleme = { ...VARSAYILAN_UYGULAMA_AYARLARI.yedekleme, ...ortakYedek.value };
            } catch (error) { console.warn('Ortak yedekleme ayarı okunamadı:', error); }
        }
        try {
            const { data:ortakRenk, error:renkHatasi } = await supabaseClient.from('portal_settings').select('value').eq('company_id',activeUser.sirketId).eq('setting_key','puantaj_renkleri').maybeSingle();
            if (!fdPortalVeriOturumuGecerli(fdVeriOturumu)) return;
            if (renkHatasi) throw renkHatasi;
            if (ortakRenk?.value) uygulamaAyarlari.puantajRenkleri = ortakRenk.value;
        } catch (error) { console.warn('Puantaj renk ayarı ayrı kayıttan okunamadı:', error); }
        if (!fdPortalVeriOturumuGecerli(fdVeriOturumu)) return;
        if (typeof fdPuantajRenkleriniUygula === 'function') fdPuantajRenkleriniUygula();
        izinAyarEtiketleriniGuncelle();
        const izinSebepAlani = document.getElementById('izinSebep');
        if (izinSebepAlani && (!izinSebepAlani.value || izinSebepAlani.value === VARSAYILAN_UYGULAMA_AYARLARI.varsayilanIzinSebebi)) izinSebepAlani.value = varsayilanIzinSebebi();
        yuklenenVeriler.add('sirketler');
        veriKayitGoruntusunuYenile('sirketler');
        await alanAdiTescilBelgesiniGoster(uygulamaAyarlari.alanAdiTescilBelgesi);
    }

async function supabaseKullanicilariYukle() {
        if (!SUPABASE_MODE || !activeUser?.sirketId || !['Admin', 'Yonetici'].includes(activeUser.rol)) {
            kullanicilar = [];
            return;
        }
        const fdVeriOturumu = fdPortalVeriOturumu();
        const tumKayitlar = [];
        const paketBoyutu = 1000;
        for (let baslangic = 0; ; baslangic += paketBoyutu) {
            const { data, error } = await supabaseClient.from('user_directory')
                .select('legacy_username, role, data')
                .eq('company_id', activeUser.sirketId)
                .order('legacy_username')
                .range(baslangic, baslangic + paketBoyutu - 1);
            if (!fdPortalVeriOturumuGecerli(fdVeriOturumu)) return;
            if (error) throw error;
            const paket = data || [];
            tumKayitlar.push(...paket);
            if (paket.length < paketBoyutu) break;
        }
        kullanicilar = tumKayitlar.map(kayit => ({
            username: String(kayit.legacy_username || ''),
            rol: String(kayit.role || 'Personel'),
            tcNo: String(kayit.data?.tcNo || ''),
            ad: String(kayit.data?.fullName || ''),
            sifreDegismeli: Boolean(kayit.data?.mustChangePassword),
            sifreKaynagi: String(kayit.data?.passwordSource || ''),
            sirketId: activeUser.sirketId
        }));
    }

function fdUzakImzaAnahtari(anahtar, yil) {
        const yilEki = anahtar === 'puantaj' ? String(yil || '') : 'tum';
        return `${String(activeUser?.sirketId || '')}|${anahtar}|${yilEki}`;
    }

function fdUzakImzayiSatirlardanKaydet(anahtar, yil, satirlar) {
        if (!Array.isArray(satirlar) || (satirlar.length && !satirlar.every(satir => satir?.updated_at))) return;
        const sonGuncelleme = satirlar.reduce((son, satir) => String(satir?.updated_at || '') > son ? String(satir.updated_at) : son, '');
        fdUzakVeriImzalari.set(fdUzakImzaAnahtari(anahtar, yil), `${satirlar.length}:${sonGuncelleme}`);
    }

async function fdUzakAnahtarImzasiniGetir(anahtar, yil) {
        const fdVeriOturumu = fdPortalVeriOturumu();
        let sorgu = supabaseClient.from('portal_records')
            .select('updated_at', { count:'exact' })
            .eq('company_id', activeUser.sirketId)
            .eq('module', anahtar)
            .order('updated_at', { ascending:false })
            .limit(1);
        if (anahtar === 'puantaj') sorgu = sorgu.eq('record_year', Number(yil));
        const { data, error, count } = await sorgu;
        if (!fdPortalVeriOturumuGecerli(fdVeriOturumu)) throw new Error('Oturum değişti; veri kontrolü iptal edildi.');
        if (error) throw error;
        return `${Number(count || 0)}:${String(data?.[0]?.updated_at || '')}`;
    }

async function fdUzakAnahtarImzasiniPaylasimliGetir(anahtar, yil) {
        const imzaAnahtari = fdPortalVeriOturumu() + '|' + fdUzakImzaAnahtari(anahtar, yil);
        const devamEden = fdUzakImzaKontrolSozleri.get(imzaAnahtari);
        if (devamEden) return devamEden;
        const kontrolSozu = fdUzakAnahtarImzasiniGetir(anahtar, yil);
        fdUzakImzaKontrolSozleri.set(imzaAnahtari, kontrolSozu);
        try { return await kontrolSozu; }
        finally { if (fdUzakImzaKontrolSozleri.get(imzaAnahtari) === kontrolSozu) fdUzakImzaKontrolSozleri.delete(imzaAnahtari); }
    }

async function fdUzakDegisenAnahtarlariGetir(anahtarlar, yil) {
        const sonuclar = await Promise.all(anahtarlar.map(async anahtar => ({
            anahtar,
            imza:await fdUzakAnahtarImzasiniPaylasimliGetir(anahtar, yil)
        })));
        const degisenler = [];
        sonuclar.forEach(({ anahtar, imza }) => {
            const imzaAnahtari = fdUzakImzaAnahtari(anahtar, yil);
            const onceki = fdUzakVeriImzalari.get(imzaAnahtari);
            if (onceki === undefined || onceki !== imza) degisenler.push(anahtar);
            if (onceki === undefined || onceki === imza) fdUzakVeriImzalari.set(imzaAnahtari, imza);
        });
        return degisenler;
    }

async function fdUzakModuldeDegisiklikVarMi(anahtarlar, yil) { return (await fdUzakDegisenAnahtarlariGetir(anahtarlar, yil)).length > 0; }

async function fdUzakModulImzalariniYenile(anahtarlar, yil) {
        const sonuclar = await Promise.all(anahtarlar.map(async anahtar => ({ anahtar, imza:await fdUzakAnahtarImzasiniPaylasimliGetir(anahtar, yil) })));
        sonuclar.forEach(({ anahtar, imza }) => fdUzakVeriImzalari.set(fdUzakImzaAnahtari(anahtar, yil), imza));
    }

async function supabasePortalModulKayitlariniTumunuGetir(anahtar, yil) {
        const fdVeriOturumu = fdPortalVeriOturumu();
        if (!fdPortalVeriOturumuGecerli(fdVeriOturumu)) return [];
        const tumKayitlar = [];
        const paketBoyutu = 1000;
        for (let baslangic = 0; ; baslangic += paketBoyutu) {
            let sorgu;
            if (activeUser?.rol === 'Personel') {
                sorgu = supabaseClient.rpc('portal_my_module_records', { requested_module:anahtar })
                    .order('id', { ascending:true })
                    .range(baslangic, baslangic + paketBoyutu - 1);
            } else {
                sorgu = supabaseClient.from('portal_records')
                    .select('id,legacy_id,data,record_year,updated_at')
                    .eq('company_id', activeUser.sirketId)
                    .eq('module', anahtar)
                    .order('id', { ascending:true })
                    .range(baslangic, baslangic + paketBoyutu - 1);
            }
            if (anahtar === 'puantaj') sorgu = sorgu.eq('record_year', yil);
            const { data, error } = await sorgu;
            if (!fdPortalVeriOturumuGecerli(fdVeriOturumu)) return [];
            if (error) throw error;
            const paket = data || [];
            tumKayitlar.push(...paket);
            if (paket.length < paketBoyutu) break;
        }
        return tumKayitlar;
    }

async function supabaseVerileriniYukle(modul = 'giris', kayitYili = '', secenekler = {}) {
        if (!activeUser?.sirketId) return false;
        // Dedicated ISG accounts use the branch-filtered projection endpoint, never payroll/portal records.
        if (['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol)) return false;
        const fdVeriOturumu = fdPortalVeriOturumu();
        let veriDegisti = false;
        let onbellekDegisti = false;
        const yil = Number(kayitYili || kayitYiliniSeciliEkrandanBul(modul) || new Date().getFullYear());
        aktifKayitYili = String(yil);
        const puantajKapsamAnahtari = fdVeriOturumu + '|puantaj-yuklu-yil', puantajIstekAnahtari = fdVeriOturumu + '|puantaj-istenen-yil';
        if ((SUPABASE_MODULLERI[modul] || Object.values(SUPABASE_MODULLERI).flat()).includes('puantaj') && (!Array.isArray(secenekler.anahtarlar) || secenekler.anahtarlar.includes('puantaj'))) fdUzakAnahtarSonYukleme.set(puantajIstekAnahtari, yil);
        const sirketOnbellekAnahtari = String(activeUser.sirketId);
        const sirketIstekAnahtari = fdVeriOturumu + '|' + sirketOnbellekAnahtari;
        const sirketYuklemeZamani = Number(fdSirketSonYukleme.get(sirketOnbellekAnahtari) || 0);
        if (secenekler.sirketYukle !== false && (secenekler.onbellekKullan === false || Date.now() - sirketYuklemeZamani >= FD_SIRKET_AYARI_ONBELLEK_SURESI)) {
            let sirketYuklemeSozu = fdSirketYuklemeSozleri.get(sirketIstekAnahtari);
            if (!sirketYuklemeSozu) {
                sirketYuklemeSozu = supabaseSirketiYukle().then(() => { if (fdPortalVeriOturumuGecerli(fdVeriOturumu)) { fdSirketSonYukleme.set(sirketOnbellekAnahtari, Date.now()); onbellekDegisti = true; } });
                fdSirketYuklemeSozleri.set(sirketIstekAnahtari, sirketYuklemeSozu);
            }
            try { await sirketYuklemeSozu; veriDegisti = true; }
            finally { if (fdSirketYuklemeSozleri.get(sirketIstekAnahtari) === sirketYuklemeSozu) fdSirketYuklemeSozleri.delete(sirketIstekAnahtari); }
        }
        if (!fdPortalVeriOturumuGecerli(fdVeriOturumu)) return false;
        const anahtarlar = SUPABASE_MODULLERI[modul] || Object.values(SUPABASE_MODULLERI).flat();
        const benzersiz = [...new Set(anahtarlar)].filter(anahtar => !Array.isArray(secenekler.anahtarlar) || secenekler.anahtarlar.includes(anahtar));
        await Promise.all(benzersiz.map(async anahtar => {
            const yuklemeAnahtari = fdUzakImzaAnahtari(anahtar, yil);
            const istekAnahtari = fdVeriOturumu + '|' + yuklemeAnahtari;
            const devamEden = fdUzakAnahtarYuklemeSozleri.get(istekAnahtari);
            if (devamEden) { if (await devamEden) veriDegisti = true; return; }
            const sonYukleme = Number(fdUzakAnahtarSonYukleme.get(yuklemeAnahtari) || 0);
            const yilUygun = anahtar !== 'puantaj' || fdUzakAnahtarSonYukleme.get(puantajKapsamAnahtari) === yil;
            if (secenekler.onbellekKullan !== false && yilUygun && yuklenenVeriler.has(anahtar) && Date.now() - sonYukleme < FD_AYNI_VERI_YUKLEME_KORUMASI) return;
            const yuklemeSozu = (async () => {
                let dogrulananUzakImza = '';
                if (secenekler.onbellekKullan !== false && yilUygun && fdUzakAnahtarSonYukleme.has(yuklemeAnahtari) && !(activeUser?.rol === 'Personel' && anahtar === 'vardiya')) {
                    dogrulananUzakImza = await fdUzakAnahtarImzasiniPaylasimliGetir(anahtar, yil);
                    if (!fdPortalVeriOturumuGecerli(fdVeriOturumu)) return false;
                    const oncekiImza = fdUzakVeriImzalari.get(yuklemeAnahtari);
                    if (oncekiImza !== undefined && oncekiImza === dogrulananUzakImza) {
                        fdUzakAnahtarSonYukleme.set(yuklemeAnahtari, Date.now());
                        return false;
                    }
                }
                const yerelJson = JSON.stringify(veriDizisiniGetir(anahtar));
                const kismiVardiya = anahtar === 'vardiya' ? window.fdVardiyaArsivBirlesimAnligi?.() : null;
                if (veriSonKayitGoruntuleri.has(anahtar) && veriSonKayitGoruntuleri.get(anahtar) !== yerelJson && !(kismiVardiya && window.fdVardiyaKismiYuklemeAktifMi?.())) return false;
                const data = await supabasePortalModulKayitlariniTumunuGetir(anahtar, yil);
                if (!fdPortalVeriOturumuGecerli(fdVeriOturumu)) return false;
                const vardiyaBirlestir = kismiVardiya && window.fdVardiyaKismiYuklemeAktifMi?.();
                if (!vardiyaBirlestir && (JSON.stringify(veriDizisiniGetir(anahtar)) !== yerelJson || (secenekler.yerelDegisiklikleriKoru && supabaseKaydetmeBekleyen > 0))) return false;
                if (anahtar === 'puantaj' && fdUzakAnahtarSonYukleme.get(puantajIstekAnahtari) !== yil) return false;
                const kayitlar = data.map(kayit => ({ ...(kayit.data || {}), id: kayit.data?.id ?? kayit.legacy_id }));
                if (vardiyaBirlestir) { if (!window.fdVardiyaTamArsiviUygula(kayitlar, kismiVardiya)) return false; }
                else supabaseDiziAta(anahtar, kayitlar);
                veriDegisti = true;
                onbellekDegisti = true;
                fdUzakImzayiSatirlardanKaydet(anahtar, yil, data);
                if (dogrulananUzakImza) fdUzakVeriImzalari.set(yuklemeAnahtari, dogrulananUzakImza);
                fdUzakAnahtarSonYukleme.set(yuklemeAnahtari, Date.now());
                if (anahtar === 'puantaj') fdUzakAnahtarSonYukleme.set(puantajKapsamAnahtari, yil);
                return true;
            })();
            fdUzakAnahtarYuklemeSozleri.set(istekAnahtari, yuklemeSozu);
            try { await yuklemeSozu; }
            finally { if (fdUzakAnahtarYuklemeSozleri.get(istekAnahtari) === yuklemeSozu) fdUzakAnahtarYuklemeSozleri.delete(istekAnahtari); }
        }));
        if (!fdPortalVeriOturumuGecerli(fdVeriOturumu)) return false;
        if (onbellekDegisti) veriOnbelleginiKaydet();
        return veriDegisti;
    }

function fdModulVerisiTazeMi(modul, kayitYili = '') {
        if (!SUPABASE_MODE || !activeUser?.sirketId) return false;
        const yil = Number(kayitYili || kayitYiliniSeciliEkrandanBul(modul) || new Date().getFullYear());
        const anahtarlar = [...new Set(SUPABASE_MODULLERI[modul] || [])];
        if (!anahtarlar.length) return true;
        return anahtarlar.every(anahtar => {
            const yuklemeAnahtari = fdUzakImzaAnahtari(anahtar, yil);
            const sonYukleme = Number(fdUzakAnahtarSonYukleme.get(yuklemeAnahtari) || 0);
            return (anahtar !== 'puantaj' || fdUzakAnahtarSonYukleme.get(fdPortalVeriOturumu() + '|puantaj-yuklu-yil') === yil) && yuklenenVeriler.has(anahtar) && Date.now() - sonYukleme < FD_AYNI_VERI_YUKLEME_KORUMASI;
        });
    }

function supabaseVerileriKaydet(kapsam = null) {
        const kayitKapsami = kapsam == null ? null : { modul:String(kapsam.modul||''), personelId:String(kapsam.personelId||''), tarih:String(kapsam.tarih||'') };
        if (kayitKapsami && (kayitKapsami.modul !== 'vardiya' || !kayitKapsami.personelId || !/^\d{4}-\d{2}-\d{2}$/.test(kayitKapsami.tarih))) return Promise.reject(new Error('Giriş–çıkış kayıt kapsamı geçersiz.'));
        const fdVeriOturumu = fdPortalVeriOturumu();
        supabaseKaydetmeBekleyen++;
        const islem = supabaseKaydetmeKuyrugu.catch(() => {}).then(() => { if (!fdPortalVeriOturumuGecerli(fdVeriOturumu)) throw new Error('Oturum değişti; önceki kayıt işlemi iptal edildi.'); return supabaseVerileriKaydetGercek(fdVeriOturumu,kayitKapsami); }).finally(() => { supabaseKaydetmeBekleyen = Math.max(0, supabaseKaydetmeBekleyen - 1); });
        supabaseKaydetmeKuyrugu = islem;
        return islem;
    }

async function supabaseVerileriKaydetGercek(fdVeriOturumu = fdPortalVeriOturumu(), kayitKapsami = null) {
        if (!activeUser?.sirketId) throw new Error('Şirket oturumu bulunamadı.');
        const kapsamDogrula = () => { if (!fdPortalVeriOturumuGecerli(fdVeriOturumu)) throw new Error('Oturum değişti; önceki kayıt işlemi iptal edildi.'); };
        kapsamDogrula();
        const sirketId = String(activeUser.sirketId);
        if (activeUser?.rol === 'Personel') { veriOnbelleginiKaydet(); return; }
        if (!kayitKapsami && yuklenenVeriler.has('sirketler') && veriDegistiMi('sirketler')) {
            const sirketlerJson = JSON.stringify(sirketler), sirket = JSON.parse(sirketlerJson).find(item => String(item.id) === sirketId);
            if (sirket) {
                const { error } = await supabaseClient.from('companies').update({ short_name:sirket.kisaAd || sirket.ad || null, title:sirket.unvan || sirket.kisaAd || sirket.ad || null, data:sirket }).eq('id', sirketId);
                kapsamDogrula(); if (error) throw error;
            }
            veriSonKayitGoruntuleri.set('sirketler', sirketlerJson);
        }
        const anahtarlar = ['personeller', 'izinler', 'kullanicilar', 'puantaj', 'subeler', 'avanslar', 'ekOdemeler', 'kkd', 'vardiya', 'irsaliyeler', 'kiratakip', 'ihracat', 'icralar', 'araclar', 'akaryakit'];
        const atlananKapaliDonemler = new Set(); let basariliKayitSayisi = 0;
        const kayitKapsaminda = kayit => !kayitKapsami || (kayit.kayitTipi === 'magicpassDuzeltme' && String(kayit.pId) === kayitKapsami.personelId && String(kayit.tarih) === kayitKapsami.tarih && String(kayit.sirketId||sirketId) === sirketId);
        const kapsamliIstegiCalistir = async olustur => {
            kapsamDogrula();let sonuc=await olustur();kapsamDogrula();
            // SQL 57014 explicitly aborts the statement. Retry this day's stable-ID
            // operation once only; never retry ambiguous network/permission errors.
            if(kayitKapsami && sonuc.error?.code==='57014' && /statement timeout/i.test(sonuc.error.message||'')){
                kapsamDogrula();sonuc=await olustur();kapsamDogrula();
            }
            return sonuc;
        };
        for (const anahtar of anahtarlar) {
            kapsamDogrula(); if ((kayitKapsami && anahtar !== kayitKapsami.modul) || !yuklenenVeriler.has(anahtar)) continue;
            // Snapshot the values sent, not mutable local data after an awaited reply.
            const yeniJson = JSON.stringify(veriDizisiniGetir(anahtar));
            if (veriSonKayitGoruntuleri.get(anahtar) === yeniJson) continue;
            const yeni = JSON.parse(yeniJson); let eski = [];
            try { eski = JSON.parse(veriSonKayitGoruntuleri.get(anahtar) || '[]'); } catch (_) {}
            const eskiHarita = new Map(eski.map((kayit,index) => [supabaseKayitAnahtari(anahtar,kayit,index),JSON.stringify(kayit)]));
            const yeniHarita = new Map(yeni.map((kayit,index) => [supabaseKayitAnahtari(anahtar,kayit,index),kayit]));
            const sunucuHaritasi = new Map(eski.map((kayit,index) => [supabaseKayitAnahtari(anahtar,kayit,index),kayit]));
            const uygulandi = (satirlar, sunucuSatirlari) => {
                const donen = new Map((sunucuSatirlari || []).map(s => [String(s.legacy_id),s.data]));
                for (const satir of satirlar) sunucuHaritasi.set(satir.legacy_id, donen.get(satir.legacy_id) || satir.data);
            };
            const degismediyseGeriAl = (legacyId, gonderilen) => {
                const guncel = veriDizisiniGetir(anahtar).find((kayit,index) => supabaseKayitAnahtari(anahtar,kayit,index) === legacyId);
                // Do not overwrite an edit/re-add made while the rejected request was pending.
                if (gonderilen === undefined ? !guncel : JSON.stringify(guncel) === JSON.stringify(gonderilen)) supabaseYerelKaydiGeriAl(anahtar,legacyId,eskiHarita.get(legacyId));
            };
            const degisenler = [];
            yeniHarita.forEach((kayit,legacyId) => { if (kayitKapsaminda(kayit) && eskiHarita.get(legacyId) !== JSON.stringify(kayit)) degisenler.push({company_id:sirketId,module:anahtar,legacy_id:legacyId,record_year:supabaseKayitYili(anahtar,kayit),employee_legacy_id:supabasePersonelKimligi(kayit,anahtar)||null,data:kayit}); });
            try {
                if (anahtar === 'avanslar') {
                    // Never send a blind bulk upsert/delete of financial records.
                    for (const satir of degisenler) {
                        kapsamDogrula();
                        try {
                            const beklenen = eskiHarita.has(satir.legacy_id) ? JSON.parse(eskiHarita.get(satir.legacy_id)) : null;
                            const sonuc = await avansGuvenliSunucuKaydi(sirketId, satir.data, beklenen); kapsamDogrula();
                            avansSunucuKaydiniUygula(sonuc, satir.data, false);
                            uygulandi([satir], [sonuc]); basariliKayitSayisi++;
                        } catch (hata) {
                            kapsamDogrula(); if (!supabaseKapaliDonemHatasiMi(hata)) throw hata;
                            atlananKapaliDonemler.add(supabaseKapaliDonemAyiniBul(hata)); degismediyseGeriAl(satir.legacy_id,satir.data);
                        }
                    }
                    for (const id of [...eskiHarita.keys()].filter(id => !yeniHarita.has(id))) {
                        kapsamDogrula();
                        try { await avansGuvenliSunucuSil(sirketId,id,JSON.parse(eskiHarita.get(id))); kapsamDogrula(); sunucuHaritasi.delete(id); basariliKayitSayisi++; }
                        catch(hata){kapsamDogrula();if(!supabaseKapaliDonemHatasiMi(hata))throw hata;atlananKapaliDonemler.add(supabaseKapaliDonemAyiniBul(hata));degismediyseGeriAl(id);}
                    }
                    continue;
                }
                if (anahtar === 'vardiya') {
                    // Weekly rosters must never enter a blind bulk upsert. Other attendance types keep their existing transport.
                    for (const satir of [...degisenler].filter(s => fdHaftalikVardiyaKaydiMi(s.data))) {
                        kapsamDogrula();
                        const beklenen = eskiHarita.has(satir.legacy_id) ? JSON.parse(eskiHarita.get(satir.legacy_id)) : null;
                        const sonuc = await fdVardiyaGuvenliSunucuKaydi(sirketId,satir.data,beklenen,()=>fdPortalVeriOturumuGecerli(fdVeriOturumu)&&fdVardiyaYazmaYetkisi());
                        kapsamDogrula(); fdVardiyaYerelKaydiniDogrula(sonuc,satir.data,false);
                        uygulandi([satir],[sonuc]);basariliKayitSayisi++;degisenler.splice(degisenler.indexOf(satir),1);
                    }
                }
                if (degisenler.length) {
                    const {error,data:kaydedilenSatirlar} = await kapsamliIstegiCalistir(()=>{
                        let istek = supabaseClient.from('portal_records').upsert(degisenler,{onConflict:'company_id,module,legacy_id'});
                        if (anahtar === 'personeller') istek = istek.select('module,legacy_id,data');
                        return istek;
                    });
                    if (!error) {
                        if (anahtar === 'personeller') fdUcretDonemleriniYereldeGuncelle(kaydedilenSatirlar);
                        uygulandi(degisenler,kaydedilenSatirlar); basariliKayitSayisi += degisenler.length;
                    } else {
                        if (!supabaseKapaliDonemHatasiMi(error)) throw error;
                        for (const satir of degisenler) {
                            kapsamDogrula(); let satirIstegi = supabaseClient.from('portal_records').upsert(satir,{onConflict:'company_id,module,legacy_id'});
                            if (anahtar === 'personeller') satirIstegi = satirIstegi.select('module,legacy_id,data');
                            const {error:satirHatasi,data:kaydedilenSatir} = await satirIstegi; kapsamDogrula();
                            if (!satirHatasi) { if (anahtar === 'personeller') fdUcretDonemleriniYereldeGuncelle(kaydedilenSatir); uygulandi([satir],kaydedilenSatir); basariliKayitSayisi++; continue; }
                            if (!supabaseKapaliDonemHatasiMi(satirHatasi)) throw satirHatasi;
                            atlananKapaliDonemler.add(supabaseKapaliDonemAyiniBul(satirHatasi));
                            degismediyseGeriAl(satir.legacy_id,satir.data);
                        }
                    }
                }
                const silinenler = [...eskiHarita.keys()].filter(id => !yeniHarita.has(id) && kayitKapsaminda(JSON.parse(eskiHarita.get(id))));
                if (anahtar === 'vardiya') {
                    for (const id of [...silinenler].filter(id=>fdHaftalikVardiyaKaydiMi(JSON.parse(eskiHarita.get(id))))) {
                        kapsamDogrula();await fdVardiyaGuvenliSunucuSil(sirketId,id,JSON.parse(eskiHarita.get(id)),()=>fdPortalVeriOturumuGecerli(fdVeriOturumu)&&fdVardiyaYazmaYetkisi());
                        kapsamDogrula();sunucuHaritasi.delete(id);basariliKayitSayisi++;silinenler.splice(silinenler.indexOf(id),1);
                    }
                }
                if (silinenler.length) {
                    const {error} = await kapsamliIstegiCalistir(()=>supabaseClient.from('portal_records').delete().eq('company_id',sirketId).eq('module',anahtar).in('legacy_id',silinenler));
                    if (!error) { silinenler.forEach(id=>sunucuHaritasi.delete(id)); basariliKayitSayisi += silinenler.length; }
                    else {
                        if (!supabaseKapaliDonemHatasiMi(error)) throw error;
                        for (const legacyId of silinenler) {
                            kapsamDogrula(); const {error:satirHatasi} = await supabaseClient.from('portal_records').delete().eq('company_id',sirketId).eq('module',anahtar).eq('legacy_id',legacyId); kapsamDogrula();
                            if (!satirHatasi) { sunucuHaritasi.delete(legacyId); basariliKayitSayisi++; continue; }
                            if (!supabaseKapaliDonemHatasiMi(satirHatasi)) throw satirHatasi;
                            atlananKapaliDonemler.add(supabaseKapaliDonemAyiniBul(satirHatasi)); degismediyseGeriAl(legacyId);
                        }
                    }
                }
            } finally {
                // A partial success is acknowledged individually. Later edits remain dirty.
                if (fdPortalVeriOturumuGecerli(fdVeriOturumu)) {
                    const sirali = [...yeniHarita.keys()].filter(id=>sunucuHaritasi.has(id)).map(id=>sunucuHaritasi.get(id));
                    for (const [id,kayit] of sunucuHaritasi) if (!yeniHarita.has(id)) sirali.push(kayit);
                    veriSonKayitGoruntuleri.set(anahtar,JSON.stringify(sirali));
                }
            }
        }
        kapsamDogrula(); veriOnbelleginiKaydet();
        if (atlananKapaliDonemler.size) {
            const aylar = [...atlananKapaliDonemler].filter(Boolean).join(', ');
            showToast(basariliKayitSayisi ? 'İşleminiz kaydedildi. '+(aylar||'Kapalı dönem')+' kapalı dönemine ait cihazdaki eski bir değişiklik aktarılmadan temizlendi.' : (aylar||'Kapalı dönem')+' kapalı olduğu için bu döneme ait değişiklik kaydedilmedi ve ekrandaki eski değer geri getirildi.','warning');
        }
    }

async function fdUzakKayitlariOtomatikEsitle(oncelikli=false){
        if(fdOtomatikEsitlemeCalisiyor||fdOtomatikEsitlemeEngelliMi())return;
        const simdi=Date.now(),bekleme=oncelikli?FD_ODAK_KONTROL_ARALIGI:FD_OTOMATIK_KONTROL_ARALIGI;
        if(simdi-fdOtomatikEsitlemeSon<bekleme)return;
        const bilgi=fdOtomatikEsitlemeBilgisi();if(!bilgi.modul)return;
        fdOtomatikEsitlemeCalisiyor=true;fdOtomatikEsitlemeSon=simdi;
        try{
            const anahtarlar=[...new Set(SUPABASE_MODULLERI[bilgi.modul]||[])];
            const yil=Number(kayitYiliniSeciliEkrandanBul(bilgi.modul)||new Date().getFullYear());
            if(!anahtarlar.length)return;
            const fdVeriOturumu=fdPortalVeriOturumu(),degisenler=await fdUzakDegisenAnahtarlariGetir(anahtarlar,yil);
            if(!fdPortalVeriOturumuGecerli(fdVeriOturumu)||!degisenler.length||fdOtomatikEsitlemeEngelliMi())return;
            const once=JSON.stringify(degisenler.map(k=>veriDizisiniGetir(k)));
            await supabaseVerileriniYukle(bilgi.modul,yil,{sirketYukle:false,onbellekKullan:false,anahtarlar:degisenler,yerelDegisiklikleriKoru:true});
            if(!fdPortalVeriOturumuGecerli(fdVeriOturumu))return;
            const sonra=JSON.stringify(degisenler.map(k=>veriDizisiniGetir(k)));
            if(once!==sonra&&fdOtomatikEsitlemeBilgisi().id===bilgi.id&&!fdOtomatikEsitlemeEngelliMi()){fdOtomatikEsitlemeEkraniniCiz(bilgi.id);showToast('Yeni kay\u0131tlar otomatik g\u00fcncellendi.','success');}
        }catch(error){console.warn('Otomatik veri e\u015fitleme:',error);}
        finally{fdOtomatikEsitlemeCalisiyor=false;}
    }

function supabasePdfDosyaAdiTemizle(dosyaAdi = 'belge.pdf') {
        const nokta = String(dosyaAdi).lastIndexOf('.');
        const govde = (nokta > 0 ? String(dosyaAdi).slice(0, nokta) : String(dosyaAdi))
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'belge';
        return `${govde}.pdf`;
    }

async function driveVerileriniYukleBaslangicta(modul = 'giris', kayitYili = '') {
        if (SUPABASE_MODE) return supabaseVerileriniYukle(modul, kayitYili);
        try {
            const yil = String(kayitYili || kayitYiliniSeciliEkrandanBul(modul));
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?modul=${encodeURIComponent(modul)}&yil=${encodeURIComponent(yil)}&_=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            if (data) {
                if (data.yil) aktifKayitYili = String(data.yil);
                if (data.personeller) { personeller = data.personeller; yuklenenVeriler.add('personeller'); }
                if (data.izinler) { izinler = data.izinler; yuklenenVeriler.add('izinler'); }
                if (data.kullanicilar) { kullanicilar = data.kullanicilar; yuklenenVeriler.add('kullanicilar'); }
                if (data.sirketler) {
                    sirketler = data.sirketler;
                    yuklenenVeriler.add('sirketler');
                    localStorage.setItem('loginSirketOnbellegi', JSON.stringify(sirketler));
                }
                if (data.subeler) { subeler = data.subeler; yuklenenVeriler.add('subeler'); }
                if (data.avanslar) { avanslar = data.avanslar; yuklenenVeriler.add('avanslar'); }
                if (data.ekOdemeler) { ekOdemeler = data.ekOdemeler; yuklenenVeriler.add('ekOdemeler'); }
                if (data.kkd) { kkdKayitlari = data.kkd; yuklenenVeriler.add('kkd'); }
                if (data.vardiya) { vardiyaKayitlari = data.vardiya; yuklenenVeriler.add('vardiya'); }
                if (data.araclar) { araclar = data.araclar; yuklenenVeriler.add('araclar'); }
                if (data.akaryakit) { akaryakitKayitlari = data.akaryakit; yuklenenVeriler.add('akaryakit'); }
                if (data.icralar) {
                    icralar = data.icralar.map(i => {
                        if (typeof i.kesintiler === 'string') {
                            try { i.kesintiler = JSON.parse(i.kesintiler); } catch (e) { i.kesintiler = []; }
                        }
                        if (!Array.isArray(i.kesintiler)) i.kesintiler = [];
                        return i;
                    });
                    yuklenenVeriler.add('icralar');
                }
                
                if (data.puantaj) {
                    puantajVerileri = data.puantaj.map(item => ({
                        ...item,
                        pId: String(item.pId),
                        tarih: String(item.tarih).split('T')[0],
                        durum: String(item.durum).toUpperCase()
                    }));
                }
                if (data.puantaj) yuklenenVeriler.add('puantaj');
                
                personeller.forEach(p => p.id = String(p.id));
                izinler.forEach(i => { i.id = Number(i.id); i.pId = String(i.pId); i.gun = Number(i.gun); });

                eksikSirketKimlikleriniTamamla();
                localStorage.setItem('loginSirketOnbellegi', JSON.stringify(sirketler));
                veriOnbelleginiKaydet();
                Object.keys(data).filter(anahtar => ['personeller', 'izinler', 'kullanicilar', 'puantaj', 'avanslar', 'ekOdemeler', 'kkd', 'icralar', 'sirketler', 'subeler'].includes(anahtar)).forEach(veriKayitGoruntusunuYenile);
                populateLoginCompanySelect();
            }
        } catch (e) { console.error("İlk yükleme hatası:", e); }
    }

async function driveVerileriniYukle() {
        if (SUPABASE_MODE) {
            showGlobalOverlay('FD YAZILIM', 'Bulut kayıtları yükleniyor...');
            try { await supabaseVerileriniYukle('personel'); }
            finally { initUI(); hideGlobalOverlay(); }
            return;
        }
        showGlobalOverlay("FD YAZILIM", "Veriler E-Tablo'dan yükleniyor...");
        try {
            const res = await fetch(GOOGLE_SCRIPT_URL);
            const data = await res.json();
            if (data) {
                if (data.personeller) personeller = data.personeller;
                if (data.izinler) izinler = data.izinler;
                if (data.kullanicilar) kullanicilar = data.kullanicilar;
                if (data.sirketler) sirketler = data.sirketler;
                if (data.subeler) subeler = data.subeler;
                if (data.avanslar) avanslar = data.avanslar;
                
                if (data.puantaj && data.puantaj.length > 0) {
                    puantajVerileri = data.puantaj.map(item => ({
                        ...item,
                        pId: String(item.pId),
                        tarih: String(item.tarih).split('T')[0],
                        durum: String(item.durum).toUpperCase()
                    }));
                }
                
                personeller.forEach(p => p.id = String(p.id));
                izinler.forEach(i => { i.id = Number(i.id); i.pId = String(i.pId); i.gun = Number(i.gun); });

            }
        } catch (e) { console.error("İlk yükleme hatası:", e); }
        finally { initUI(); hideGlobalOverlay(); }
    }
