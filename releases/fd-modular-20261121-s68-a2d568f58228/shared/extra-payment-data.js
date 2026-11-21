// Ek Ödeme-only money conversion; never reinterpret an already numeric decimal as Turkish thousands.
function ekOdemeKurusDegeri(deger) {
    const sayi = typeof deger === 'number' ? deger : paraMetniniSayiyaCevir(deger);
    if (!Number.isFinite(sayi)) return 0;
    return Math.sign(sayi) * Math.round((Math.abs(sayi) + Number.EPSILON) * 100);
}
function ekOdemeParaDegeri(deger) { return ekOdemeKurusDegeri(deger) / 100; }
// Cold personnel salary-history helpers; no screen download or writes.
function ekOdemeAyiniNormalizeEt(deger) {
        const eslesme = String(deger || '').match(/^(\d{4})-(\d{1,2})/);
        return eslesme ? `${eslesme[1]}-${String(eslesme[2]).padStart(2, '0')}` : '';
    }
function ekOdemeOncekiDonem(ay) {
        const tarih = new Date(`${ekOdemeAyiniNormalizeEt(ay)}-01T00:00:00`);
        tarih.setMonth(tarih.getMonth() - 1);
        return `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, '0')}`;
    }
function ekOdemeUcretDegerleriAyni(a, b) {
        return String(a?.ekOdemeTuru || '').trim().toLocaleUpperCase('tr-TR') === String(b?.ekOdemeTuru || '').trim().toLocaleUpperCase('tr-TR')
            && ekOdemeKurusDegeri(a?.ekOdemeTutari) === ekOdemeKurusDegeri(b?.ekOdemeTutari)
            && ekOdemeKurusDegeri(a?.yolUcreti) === ekOdemeKurusDegeri(b?.yolUcreti);
    }
function ekOdemeUcretGecmisiniHazirla(eskiPersonel, yeniDegerler) {
        const bugun = new Date();
        const baslangicAyi = `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, '0')}`;
        const gecmis = (Array.isArray(eskiPersonel?.ekOdemeUcretGecmisi) ? eskiPersonel.ekOdemeUcretGecmisi : [])
            .map(kayit => ({
                baslangicAyi:ekOdemeAyiniNormalizeEt(kayit.baslangicAyi || kayit.baslangicTarihi),
                ekOdemeTuru:String(kayit.ekOdemeTuru || ''),
                ekOdemeTutari:kayit.ekOdemeTutari ?? '',
                yolUcreti:kayit.yolUcreti ?? ''
            }))
            .filter(kayit => kayit.baslangicAyi);
        if (!eskiPersonel) {
            const ilkAy = ekOdemeAyiniNormalizeEt(yeniDegerler.girisTarihi) || baslangicAyi;
            return [{ baslangicAyi:ilkAy, ekOdemeTuru:yeniDegerler.ekOdemeTuru, ekOdemeTutari:yeniDegerler.ekOdemeTutari, yolUcreti:yeniDegerler.yolUcreti }];
        }
        if (ekOdemeUcretDegerleriAyni(eskiPersonel, yeniDegerler)) return gecmis;
        if (!gecmis.length) {
            let eskiBaslangic = ekOdemeAyiniNormalizeEt(eskiPersonel.girisTarihi) || '1900-01';
            if (eskiBaslangic >= baslangicAyi) eskiBaslangic = ekOdemeOncekiDonem(baslangicAyi);
            gecmis.push({ baslangicAyi:eskiBaslangic, ekOdemeTuru:eskiPersonel.ekOdemeTuru || '', ekOdemeTutari:eskiPersonel.ekOdemeTutari || '', yolUcreti:eskiPersonel.yolUcreti || '' });
        }
        const ayniAy = gecmis.findIndex(kayit => kayit.baslangicAyi === baslangicAyi);
        const yeniKayit = { baslangicAyi, ekOdemeTuru:yeniDegerler.ekOdemeTuru, ekOdemeTutari:yeniDegerler.ekOdemeTutari, yolUcreti:yeniDegerler.yolUcreti };
        if (ayniAy === -1) gecmis.push(yeniKayit); else gecmis[ayniAy] = yeniKayit;
        return gecmis.sort((a, b) => a.baslangicAyi.localeCompare(b.baslangicAyi));
    }
