// Original common leave data, recovery storage and personnel dashboard; available to cold consumers.
function getTurBadgeClass(tur) {
        switch (tur) {
            case 'Yıllık İzin': return 'badge-yillik';
            case 'Ücretsiz İzin': return 'badge-ucretsiz';
            case 'Sağlık / Rapor': return 'badge-saglik';
            case 'Mazeretsiz İzin': return 'badge-mazeretsiz';
            case 'Ücretli İzin':
            case 'Doğum İzni':
            case 'Evlenme İzni':
            case 'Ölüm İzni': return 'badge-ucretli';
            default: return 'badge-sube-diger';
        }
    }
function yasHesapla(dogumStr, referansTarih = new Date()) {
        if (!dogumStr) return 25;
        const b = new Date(referansTarih), d = new Date(dogumStr);
        let y = b.getFullYear() - d.getFullYear();
        if (b.getMonth() < d.getMonth() || (b.getMonth() === d.getMonth() && b.getDate() < d.getDate())) y--;
        return y;
    }
function hesaplaIzinHakki(yil, yas) {
        if (yil < 1) return 0;
        let h = (yil <= 5) ? 14 : (yil < 15 ? 20 : 26);
        if ((yas <= 18 || yas >= 50) && h < 20) h = 20;
        return h;
    }
function personelDonemleriniGetir(p) {
        if (!p || !p.girisTarihi) return [];
        let gt = new Date(p.girisTarihi), ref = (p.cikisTarihi && p.cikisTarihi !== "null") ? new Date(p.cikisTarihi) : new Date();
        let donemler = [], temp = new Date(gt), sayac = 1;
        while (true) {
            let next = new Date(temp); next.setFullYear(next.getFullYear() + 1);
            if (next > ref) break;
            const hakEdisTarihindekiYas = yasHesapla(p.dogumTarihi, next);
            donemler.push({ donem:String(temp.getFullYear())+'-'+String(next.getFullYear()), hak:hesaplaIzinHakki(sayac, hakEdisTarihindekiYas) });
            temp = next; sayac++;
        }
        return donemler;
    }
function izinGecmisAciklamaMetni(izin) {
        const bilgiler = [];
        const rapor = String(izin?.raporBilgisi || '').trim();
        const aciklama = String(izin?.sebep || izin?.aciklama || '').trim();
        if (rapor) bilgiler.push('Rapor: ' + rapor);
        if (aciklama && aciklama !== rapor) bilgiler.push(aciklama);
        return bilgiler.join(' · ') || '-';
    }
function izinGecmisAciklamaHtml(izin) {
        return '<span style="display:block;min-width:170px;max-width:320px;white-space:normal;line-height:1.35;">' +
            escapeDashboardText(izinGecmisAciklamaMetni(izin)).replace(/\n/g, '<br>') +
            '</span>';
    }
function isTatil(d) {
        if (d.getDay() === 0) return true; // Pazar
        const m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
        return sabitResmiTatiller.includes(`${m}-${day}`);
    }
function mazeretsizSahitKaydiniDiziyeCevir(deger) {
        if (Array.isArray(deger)) return deger;
        if (typeof deger === 'string' && deger.trim()) {
            try { return JSON.parse(deger); } catch (e) { return []; }
        }
        return [];
    }
function izinBekleyenKayitlariOku() {
        try {
            const ham = localStorage.getItem(IZIN_BEKLEYEN_KAYIT_ANAHTARI) || sessionStorage.getItem(IZIN_BEKLEYEN_KAYIT_ANAHTARI);
            const veri = ham ? JSON.parse(ham) : [];
            return Array.isArray(veri) ? veri : [];
        } catch (error) {
            console.warn('Bekleyen izin yedeği okunamadı:', error);
            return [];
        }
    }
function izinBekleyenKayitlariniYaz(kayitlar) {
        const benzersiz = [...new Map((kayitlar || []).map(item => [`${item.sirketId || ''}|${item.id}`, item])).values()];
        const ham = JSON.stringify(benzersiz);
        try {
            if (benzersiz.length) localStorage.setItem(IZIN_BEKLEYEN_KAYIT_ANAHTARI, ham);
            else localStorage.removeItem(IZIN_BEKLEYEN_KAYIT_ANAHTARI);
            sessionStorage.removeItem(IZIN_BEKLEYEN_KAYIT_ANAHTARI);
        } catch (error) {
            if (benzersiz.length) sessionStorage.setItem(IZIN_BEKLEYEN_KAYIT_ANAHTARI, ham);
            else sessionStorage.removeItem(IZIN_BEKLEYEN_KAYIT_ANAHTARI);
        }
    }
function izinBekleyenKayitlariEkle(kayitlar) {
        izinBekleyenKayitlariniYaz([...izinBekleyenKayitlariOku(), ...(kayitlar || [])]);
    }
function izinBekleyenKayitlariniSil(kayitlar) {
        const silinecek = new Set((kayitlar || []).map(item => `${item.sirketId || ''}|${item.id}`));
        izinBekleyenKayitlariniYaz(izinBekleyenKayitlariOku().filter(item => !silinecek.has(`${item.sirketId || ''}|${item.id}`)));
    }
function renderIzinDashAndTables() {
        const dashBody = document.querySelector('#dashIzinTablo tbody');
        dashBody.innerHTML = '';
        
        let stats = { 'Yıllık İzin': 0, 'Ücretli İzin': 0, 'Sağlık / Rapor': 0, 'Ücretsiz İzin': 0, 'Doğum İzni': 0, 'Evlenme İzni': 0, 'Ölüm İzni': 0 };
        let bugunStr = new Date().toISOString().split('T')[0];

        const siraliIzinler = izinler
            .filter(i => aktifSirketeAit(i) && (!isPersonelUser() || String(i.pId) === String(activeUser.tcNo)))
            .sort((a, b) => b.id - a.id);

        siraliIzinler.forEach(i => {
            if (i.baslangic <= bugunStr && bugunStr <= i.bitis && stats[i.tur] !== undefined) stats[i.tur]++;
        });

        siraliIzinler.slice(0, 10).forEach((i, idx) => {
            const p = personeller.find(x => String(x.id) === String(i.pId));
            if (!p) return;

            let badgeCls = getTurBadgeClass(i.tur);
            dashBody.innerHTML += `
                <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${p.ad}</strong></td>
                    <td>${p.sube || 'Merkez'}</td>
                    <td><span class="badge ${badgeCls}">${i.tur}</span></td>
                    <td>${i.donem}</td>
                    <td>${tarihFormati(i.baslangic)} - ${tarihFormati(i.bitis)}</td>
                    <td><strong>${i.gun} Gün</strong></td>
                </tr>
            `;
        });

        document.getElementById('statYillik').innerText = stats['Yıllık İzin'];
        document.getElementById('statBugunIzinli').innerText = izinler.filter(i => aktifSirketeAit(i) && i.baslangic <= bugunStr && bugunStr <= i.bitis).length;
        document.getElementById('statUcretli').innerText = stats['Ücretli İzin'];
        document.getElementById('statSaglik').innerText = stats['Sağlık / Rapor'];
        document.getElementById('statUcretsiz').innerText = stats['Ücretsiz İzin'];
        document.getElementById('statDogum').innerText = stats['Doğum İzni'];
        document.getElementById('statEvlenme').innerText = stats['Evlenme İzni'];
        document.getElementById('statOlum').innerText = stats['Ölüm İzni'];
        document.getElementById('badgeIzinSayisi').innerText = `${izinler.length} İzin`;
    }
