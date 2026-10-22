// Shared advance records/projections/verified transport; no lazy UI dependency.
function avansJsonAyniMi(a, b) {
        const sirala = v => Array.isArray(v) ? v.map(sirala) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sirala(v[k])])) : v;
        return JSON.stringify(sirala(a)) === JSON.stringify(sirala(b));
    }
function avansIslemYetkisiVar() { return isManagerUser() && !isPersonelUser() && !['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol); }
function avansSunucuKaydiniUygula(kayit, onceki, goruntuGuncelle = true) {
        const id = String(kayit.legacy_id), dogrulanan = { ...kayit.data, id:String(kayit.data.id || id) };
        const index = avanslar.findIndex(a => String(a.id) === id);
        if (index < 0 ? onceki === null : avansJsonAyniMi(avanslar[index], onceki)) {
            if (index < 0) avanslar.push(dogrulanan); else avanslar[index] = dogrulanan;
        }
        if (goruntuGuncelle) {
            const goruntu = JSON.parse(veriSonKayitGoruntuleri.get('avanslar') || '[]'), sira = goruntu.findIndex(a => String(a.id) === id);
            if (sira < 0) goruntu.push(dogrulanan); else goruntu[sira] = dogrulanan;
            veriSonKayitGoruntuleri.set('avanslar', JSON.stringify(goruntu));
            veriOnbelleginiKaydet();
        }
        return dogrulanan;
    }
async function avansGuvenliSunucuKaydi(sirketId, kayit, onceki) {
        const { data, error } = await supabaseClient.rpc('fd_advance_save', { p_company_id:sirketId, p_id:String(kayit.id), p_expected:onceki, p_data:kayit });
        if (error) throw error;
        if (!data?.data || String(data.legacy_id) !== String(kayit.id)) throw new Error('Avans kaydı sunucuda doğrulanamadı. Listeyi yenileyip kontrol edin.');
        return data;
    }
async function avansGuvenliSunucuSil(sirketId, id, onceki) {
        const { data, error } = await supabaseClient.rpc('fd_advance_delete', { p_company_id:sirketId, p_id:String(id), p_expected:onceki });
        if (error) throw error;
        if (!data?.deleted || String(data.legacy_id) !== String(id)) throw new Error('Avans silme işlemi doğrulanamadı. Listeyi yenileyip kontrol edin.');
        return data;
    }
function avansAnahtariniTemizle(deger) {
        return String(deger || '')
            .toLocaleLowerCase('tr-TR')
            .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
            .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9]/g, '');
    }
function avansSatiriniDonustur(satir) {
        if (!satir || typeof satir !== 'object' || Array.isArray(satir)) return null;
        const alanlar = {};
        Object.keys(satir).forEach(anahtar => {
            alanlar[avansAnahtariniTemizle(anahtar)] = satir[anahtar];
        });
        const al = (...adlar) => {
            for (const ad of adlar) {
                const deger = alanlar[avansAnahtariniTemizle(ad)];
                if (deger !== undefined && deger !== null && deger !== '') return deger;
            }
            return '';
        };
        const personelId = al('pId', 'personelId', 'personel id', 'tcNo', 'tc');
        const personel = personeller.find(p => String(p.id) === String(personelId));
        const tarih = tarihInputDegeri(al('kayitTarihi', 'yatirmaTarihi', 'avansYatirmaTarihi', 'kayıt tarihi', 'yatırma tarihi'));
        const baslangicHam = al('baslangicAy', 'kesintiBaslangicAy', 'başlangıç ayı', 'kesinti başlangıç ayı');
        const baslangicEslesme = String(baslangicHam).match(/(\d{4})-(\d{1,2})/);
        return {
            ...satir,
            id: String(al('id', 'avansId') || `avans_${Date.now()}_${Math.random().toString(36).slice(2)}`),
            avansNo: String(al('avansNo', 'avans no', 'referansNo') || ''),
            sirketId: String(al('sirketId', 'şirket id', 'firmaId') || personel?.sirketId || ''),
            pId: String(personelId || ''),
            personelAd: String(al('personelAd', 'personel adı', 'adSoyad', 'ad soyad') || personel?.ad || ''),
            sube: String(al('sube', 'şube') || personel?.sube || ''),
            tutar: typeof al('tutar', 'avansTutari', 'avans tutarı', 'toplam avans') === 'number' ? al('tutar', 'avansTutari', 'avans tutarı', 'toplam avans') : paraMetniniSayiyaCevir(al('tutar', 'avansTutari', 'avans tutarı', 'toplam avans')),
            taksitSayisi: Math.max(1, Number(al('taksitSayisi', 'taksit sayısı', 'kacAy', 'kaç ay') || 1)),
            baslangicAy: baslangicEslesme ? `${baslangicEslesme[1]}-${String(baslangicEslesme[2]).padStart(2, '0')}` : '',
            kayitTarihi: tarih,
            aciklama: String(al('aciklama', 'açıklama', 'avansAciklama') || ''),
            durum: String(al('durum', 'status') || 'Aktif')
        };
    }
function avansDizisiniBul(data) {
        if (Array.isArray(data)) return data;
        if (!data || typeof data !== 'object') return [];
        for (const anahtar of Object.keys(data)) {
            if (['avans', 'avanslar', 'avanskayitlari'].includes(avansAnahtariniTemizle(anahtar)) && Array.isArray(data[anahtar])) {
                return data[anahtar];
            }
        }
        return [];
    }
async function avansVerileriniYukle() {
        const fdAdvanceReadSession=fdPortalVeriOturumu();
        if (SUPABASE_MODE) {
            // The shared loader acknowledges only actual server replies. Never
            // normalize/re-acknowledge unsaved local changes after a skipped load.
            return supabaseVerileriniYukle('avans', '', { yerelDegisiklikleriKoru:true });
        }
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?modul=avans&_=${Date.now()}`, { cache: 'no-store' });
        if(!fdPortalVeriOturumuGecerli(fdAdvanceReadSession))return;
        if (!response.ok) throw new Error(`Avans verisi alınamadı (${response.status})`);
        const data = await response.json();
        if(!fdPortalVeriOturumuGecerli(fdAdvanceReadSession))return;
        avanslar = avansDizisiniBul(data).map(avansSatiriniDonustur).filter(Boolean);
        yuklenenVeriler.add('avanslar');
        veriOnbelleginiKaydet();
    }
function avansSirketIdBul(personel) {
        const tekSirket = sirketler.length === 1 ? sirketler[0].id : '';
        return String(aktifSirketId() || personel?.sirketId || localStorage.getItem('lastSelectedCompanyId') || tekSirket || '');
    }
function avansSirketIdleriniDuzelt() {
        let degisiklikVar = false;
        avanslar.forEach(avans => {
            if (avans.sirketId) return;
            const personel = personeller.find(p => String(p.id) === String(avans.pId));
            const sirketId = avansSirketIdBul(personel);
            if (sirketId) {
                avans.sirketId = sirketId;
                degisiklikVar = true;
            }
        });
        return degisiklikVar;
    }
function avansAylikKesinti(avans, hedefAy) {
        if (avans?.kesintiErtelemeleri && typeof avansErtelenmisAylikKesinti === 'function') return avansErtelenmisAylikKesinti(avans, hedefAy);
        const fark = aySirasi(hedefAy) - aySirasi(avans.baslangicAy);
        const taksitSayisi = Number(avans.taksitSayisi || 1);
        if (!Number.isFinite(fark) || fark < 0 || fark >= taksitSayisi) return null;
        const tutar = Number(avans.tutar || 0);
        const standart = Math.floor((tutar / taksitSayisi) * 100) / 100;
        const kesinti = fark === taksitSayisi - 1 ? Number((tutar - standart * (taksitSayisi - 1)).toFixed(2)) : standart;
        const kalan = fark === taksitSayisi - 1 ? 0 : Math.max(0, Number((tutar - standart * (fark + 1)).toFixed(2)));
        return { kesinti, kalan, sira: fark + 1, taksitSayisi };
    }
function avansAktifSirketinMi(avans) {
        const personelRolu = kullaniciRolAnahtari() === 'personel';
        if (personelRolu) {
            const kendiPersonelId = String(activeUser?.tcNo || '').trim();
            const kayitPersonelId = String(avans?.pId ?? avans?.personelId ?? avans?.employee_legacy_id ?? '').trim();
            if (!kendiPersonelId || kayitPersonelId !== kendiPersonelId) return false;
            const aktifId = String(aktifSirketId() || '').trim();
            if (!aktifId) return false;
            if (avans?.sirketId) return String(avans.sirketId) === aktifId;
            const personel = personeller.find(p => String(p.id).trim() === kendiPersonelId);
            return String(personel?.sirketId || '') === aktifId;
        }
        const aktifId = String(aktifSirketId() || '').trim();
        if (!aktifId) return false;
        if (avans?.sirketId) return String(avans.sirketId) === aktifId;
        return personeller.some(p => String(p.id) === String(avans?.pId) && aktifSirketeAit(p));
    }
function avansAyEkle(ay, adet) {
        const eslesme = String(ay || '').match(/^(\d{4})-(\d{2})$/);if (!eslesme) return '';
        const tarih = new Date(Number(eslesme[1]), Number(eslesme[2]) - 1 + Number(adet || 0), 1);
        return `${tarih.getFullYear()}-${String(tarih.getMonth()+1).padStart(2,'0')}`;
    }
function avansAyBasligi(ay, yilGoster) {
        const [y,m]=String(ay).split('-').map(Number),ad=new Date(y,m-1,1).toLocaleDateString('tr-TR',{month:'long'}).toLocaleUpperCase('tr-TR');
        return yilGoster?ad+' '+y:ad;
    }
function avansGelecekPlanVerisi(ilkAy,sonAy) {
        const aylar=[],kesintiler=[],personelHarita=new Map();
        for(let ay=ilkAy;ay<=sonAy;ay=avansAyEkle(ay,1))aylar.push(ay);
        avanslar.filter(avansAktifSirketinMi).forEach(a=>{
            const baslangic=String(a.baslangicAy||''),taksit=Number(a.taksitSayisi||1);
            if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(baslangic)||!Number.isInteger(taksit)||taksit<1)return;
            if(a.kesintiErtelemeleri&&typeof avansKesintiTaksitlari==='function'){
                avansKesintiTaksitlari(a).filter(x=>x.ay>=ilkAy&&x.ay<=sonAy).forEach(x=>kesintiler.push({ay:x.ay,avans:a,kuruş:x.kurus}));return;
            }
            // Kapalı / tamamlanmış avansların geçmiş planını da göster; ödeme kayıtlarını değiştirme.
            const ilkSira=Math.max(0,aySirasi(ilkAy)-aySirasi(baslangic)),sonSira=Math.min(taksit-1,aySirasi(sonAy)-aySirasi(baslangic));
            for(let i=ilkSira;i<=sonSira;i++){
                const ay=avansAyEkle(baslangic,i),plan=avansAylikKesinti(a,ay);
                if(plan&&Number.isFinite(Number(plan.kesinti)))kesintiler.push({ay,avans:a,kuruş:Math.round(Number(plan.kesinti)*100)});
            }
        });
        kesintiler.forEach(x=>{const id=String(x.avans.pId||x.avans.personelAd||''),mevcut=personelHarita.get(id)||{id,ad:x.avans.personelAd||'-',sube:x.avans.sube||'',aylar:{},toplam:0};mevcut.aylar[x.ay]=(mevcut.aylar[x.ay]||0)+x.kuruş;mevcut.toplam+=x.kuruş;personelHarita.set(id,mevcut);});
        const kisiler=[...personelHarita.values()].sort((a,b)=>String(a.sube||'').localeCompare(String(b.sube||''),'tr-TR',{sensitivity:'base'})||String(a.ad||'').localeCompare(String(b.ad||''),'tr-TR',{sensitivity:'base'})),ayToplamlari=Object.fromEntries(aylar.map(ay=>[ay,0]));
        kisiler.forEach(k=>aylar.forEach(ay=>ayToplamlari[ay]+=Number(k.aylar[ay]||0)));
        const genelToplam=kisiler.reduce((t,k)=>t+k.toplam,0)/100;
        kisiler.forEach(k=>{k.toplam/=100;Object.keys(k.aylar).forEach(ay=>k.aylar[ay]/=100);});
        aylar.forEach(ay=>ayToplamlari[ay]/=100);
        return {aylar,kisiler,ayToplamlari,genelToplam};
    }
