// Original common Prim calculations: payroll, personnel, menu and cold report consumers.
function personelPrimMenusuAcikMi(){
        if(!isPersonelUser())return true;
        const personel=personeller.find(p=>aktifSirketeAit(p)&&String(p.id)===String(activeUser?.tcNo||''));
        return String(personel?.primVar||'').trim().toLocaleLowerCase('tr-TR')==='evet';
    }
function fdYarimTatilSabahDevamsizMi(personel,tarihKey,kayit){
        if(String(tarihKey)<'2026-10-01'||typeof magicpassYarimGunResmiTatilMi!=='function'||!magicpassYarimGunResmiTatilMi(tarihKey))return false;
        const gun=kayit||magicpassGunHesapla(personel,tarihKey);
        return Boolean(gun&&String(gun.tarih)===String(tarihKey)&&gun.gunTuru==='yarimResmiTatil'&&!gun.fdHolidayNight&&!gun.izin&&!gun.istihdamDisi&&gun.vardiya!=='izin'&&gun.durum==='Gelmedi'&&!gun.giris&&!gun.cikis&&!(gun.calismaAraliklari||[]).length&&Number(gun.normal||0)===0&&Number(gun.yarimTatilPlanliSabahDakika)>0&&Number(gun.yarimTatilEksikDakika)>=Number(gun.yarimTatilPlanliSabahDakika));
    }
function primGunTatilGosterimi(personel, tarihKey, hesapKodu) {
        if(hesapKodu==='M'&&fdYarimTatilSabahDevamsizMi(personel,tarihKey))return{kod:'M',aciklama:'Sabah gelmedi: işyeri muhasebe kuralına göre 1 gün devamsızlık ve 1 gün ücret kesintisi.'};
        if (!['X', ''].includes(hesapKodu) || typeof magicpassYarimGunResmiTatilMi !== 'function' || !magicpassYarimGunResmiTatilMi(tarihKey)) return { kod:hesapKodu, aciklama:'' };
        const gecmisVeyaBugun = String(tarihKey) <= magicpassTarihAnahtari(new Date());
        const gun = gecmisVeyaBugun ? magicpassGunHesapla(personel, tarihKey) : null;
        const tatildeCalisti = !gun?.izin && Number(gun?.resmiTatilMesaiDakika || 0) > 0;
        return tatildeCalisti
            ? { kod:'RC', aciklama:'Resmî Tatilde Çalışma — Öğleden sonraki çalışma süresi giriş–çıkış saatlerinden hesaplanır.' }
            : { kod:'YT', aciklama:'Yarım Gün Resmî Tatil — Öğleden Sonra Resmî Tatil. Ücret ve prim hakkı korunur.' };
    }
function primGunuTamamlandiMi(personel, tarihKey, simdi = new Date()) {
        const bugunKey = magicpassTarihAnahtari(simdi);
        if (String(tarihKey) < bugunKey) return true;
        if (String(tarihKey) > bugunKey) return false;

        const vardiya = magicpassGunVardiyasi(personel, tarihKey);
        if (vardiya === 'izin') return true;
        const saatler = magicpassVardiyaSaatleri(vardiya, tarihKey);
        if(String(tarihKey)>='2026-10-01'&&magicpassYarimGunResmiTatilMi(tarihKey)&&!saatler?.bitErtesi&&magicpassArefeSabahDakikasi(tarihKey,vardiya)>0&&saatler?.bit instanceof Date){const tatilBas=magicpassSaatliTarih(tarihKey,'13:00');return simdi>=new Date(Math.min(+saatler.bit,+tatilBas));}
        return saatler?.bit instanceof Date && !Number.isNaN(saatler.bit.getTime()) && simdi >= saatler.bit;
    }
function personelPrimCalisilmayanGunSayisi(personel, ay, yil) {
        const onbellekAnahtari = `${String(personel?.id || '')}|${Number(yil)}-${String(Number(ay) + 1).padStart(2, '0')}`;
        if (fdPuantajPrimCalisilmayanCache?.has(onbellekAnahtari)) return fdPuantajPrimCalisilmayanCache.get(onbellekAnahtari);
        const daysInMonth = new Date(yil, ay + 1, 0).getDate();
        const ayBaslangic = `${yil}-${String(ay + 1).padStart(2, '0')}-01`;
        const ayBitis = `${yil}-${String(ay + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
        const girisTarihi = tarihInputDegeri(personel?.girisTarihi);
        const cikisTarihi = tarihInputDegeri(personel?.cikisTarihi);
        if (girisTarihi && girisTarihi > ayBaslangic) {
            fdPuantajPrimCalisilmayanCache?.set(onbellekAnahtari, 0);
            return 0;
        }
        if (cikisTarihi && cikisTarihi < ayBitis) {
            fdPuantajPrimCalisilmayanCache?.set(onbellekAnahtari, 0);
            return 0;
        }
        let calisilmayanGun = 0;
        const bugunKey = magicpassTarihAnahtari(new Date());
        const personelId = String(personel?.id || '');
        const personelIzinleri = fdPuantajIzinlerByPersonelCache?.get(personelId) || null;

        for (let d = 1; d <= daysInMonth; d++) {
            const dateKey = `${yil}-${String(ay + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const gunTamamlandi = primGunuTamamlandiMi(personel, dateKey);
            let durum = '';
            let cihazGunu = null;
            const izin = personelIzinleri
                ? personelIzinleri.find(item => dateKey >= item.baslangic && dateKey <= item.bitis)
                : izinler.find(item => aktifSirketeAit(item) && String(item.pId) === personelId && dateKey >= item.baslangic && dateKey <= item.bitis);
            if (izin) {
                if (izin.tur === 'Sağlık / Rapor') durum = 'R';
                if (izin.tur === 'Ücretsiz İzin') durum = 'Z';
                if (izin.tur === 'Mazeretsiz İzin' && dateKey >= '2026-10-01' && magicpassYarimGunResmiTatilMi(dateKey)) durum = 'M';
            }
            if (!izin && gunTamamlandi) {
                cihazGunu = magicpassGunHesapla(personel, dateKey);
                if (!durum && cihazGunu.durum === 'Gelmedi') durum = 'M';
            }
            const puantaj = fdPuantajManuelByGunCache?.get(`${personelId}|${dateKey}`)
                || puantajVerileri.find(item => aktifSirketeAit(item) && !item.kayitTipi && String(item.pId) === personelId && String(item.tarih) === dateKey);
            if (!izin && puantaj?.durum) durum = puantaj.durum;
            if (!izin && dateKey === bugunKey && !gunTamamlandi) durum = '';
            if (durum === 'R' || durum === 'Z' || durum === 'M') {
                calisilmayanGun += 1;
            } else if (gunTamamlandi && !izin) {
                const eksikCalismaDakikasi = Math.max(0, Number(cihazGunu?.gec ?? puantaj?.gec ?? 0)) + Math.max(0, Number(cihazGunu?.erken ?? puantaj?.erken ?? 0));
                if (eksikCalismaDakikasi >= ayarSayisi('primYarimGunEksikMesaiDakika', 210)) calisilmayanGun += 0.5;
            }
        }
        const sonuc = Math.round(calisilmayanGun * 2) / 2;
        fdPuantajPrimCalisilmayanCache?.set(onbellekAnahtari, sonuc);
        return sonuc;
    }
function personelPrimHakkiVarMi(personel, ay, yil) {
        const gunSayisi = new Date(yil, ay + 1, 0).getDate();
        const ayBaslangic = `${yil}-${String(ay + 1).padStart(2, '0')}-01`;
        const ayBitis = `${yil}-${String(ay + 1).padStart(2, '0')}-${String(gunSayisi).padStart(2, '0')}`;
        const girisTarihi = tarihInputDegeri(personel?.girisTarihi);
        const cikisTarihi = tarihInputDegeri(personel?.cikisTarihi);
        if (girisTarihi && girisTarihi > ayBaslangic) return false;
        if (cikisTarihi && cikisTarihi < ayBitis) return false;
        return personelPrimCalisilmayanGunSayisi(personel, ay, yil) <= ayarSayisi('primDevamsizlikSiniri', 1.5);
    }
function primAyarKaydiBul() {
        return puantajVerileri.find(item => item.kayitTipi === 'primAyar' && String(item.sirketId || '') === aktifSirketId());
    }
function primSabitTutariniGetir() {
        return ayarSayisi('primTutari', 2000);
    }
function primOzetKaydiBul(pId, ay, yil) {
        const ozetTarihi = `${yil}-${String(ay + 1).padStart(2, '0')}-00`;
        return puantajVerileri.find(item =>
            item.kayitTipi === 'primOzet' &&
            String(item.pId) === String(pId) &&
            String(item.tarih) === ozetTarihi &&
            String(item.sirketId || '') === aktifSirketId()
        );
    }
function personelPrimDurumu(personel, ay, yil) {
        const otomatikVar = personelPrimHakkiVarMi(personel, ay, yil);
        const ozet = primOzetKaydiBul(personel.id, ay, yil);
        const manuel = ozet && String(ozet.primHakkiManuel) === 'true';
        return {
            hakkiVar: manuel ? ozet.primHakki === 'Var' : otomatikVar,
            manuel: manuel
        };
    }
