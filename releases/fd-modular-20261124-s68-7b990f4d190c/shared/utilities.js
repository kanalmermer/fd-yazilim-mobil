function aktifSirketId() {
        return String(activeUser?.sirketId || '');
    }

function aktifSirketeAit(kayit) {
        const companyId = aktifSirketId();
        if (!companyId) return true;
        if (activeUser?.rol === 'Personel') {
            if (String(kayit?.sirketId || '') !== companyId) return false;
            const kayitPersonelId = kayit?.pId ?? kayit?.personelId ?? kayit?.employee_legacy_id ?? kayit?.tcNo;
            if (kayitPersonelId !== undefined && kayitPersonelId !== null && String(kayitPersonelId) !== '') {
                return String(kayitPersonelId) === String(activeUser.tcNo || '');
            }
            if (kayit?.id !== undefined && kayit?.ad !== undefined) {
                return String(kayit.id) === String(activeUser.tcNo || '');
            }
            return true;
        }
        // Eski, şirket kimliği olmayan kayıtlar yönetici/kullanıcılar için geçiş sürecinde görünmeye devam eder.
        return !kayit?.sirketId || String(kayit.sirketId) === companyId;
    }

function escapeDashboardText(value) {
        const text = String(value ?? '');
        return text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
    }

function ayarSayisi(anahtar, varsayilan) {
        const sayi = Number(uygulamaAyarlari?.[anahtar]);
        return Number.isFinite(sayi) ? sayi : varsayilan;
    }

function bugununYerelTarihi() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }

function paraMetniniSayiyaCevir(deger) {
        const temiz = String(deger || '').replace(/[.\s]/g, '').replace(',', '.').replace(/[^\d.-]/g, '');
        return Number(temiz || 0);
    }

function paraGirisiFormatla(input) {
        paraGirisiVirgulluFormatla(input);
    }

function paraGirisiVirgulluFormatla(input) {
        const ham = String(input.value || '').replace(/\./g, '').replace(/[^\d,]/g, '');
        const virgulVar = ham.includes(','), parcalar = ham.split(','), tamRakamlar = parcalar.shift().replace(/^0+(?=\d)/, '').slice(0, 15), ondalik = parcalar.join('').slice(0, 2);
        const tam = tamRakamlar ? Number(tamRakamlar).toLocaleString('tr-TR') : (virgulVar ? '0' : '');
        input.value = tam + (virgulVar ? ',' + ondalik : '');
    }

function paraGirisiOndaliklariniKaldir(input) {
        input.value = String(input.value || '').replace(/,00$/, '');
    }

function paraGirisiIkiOndalikFormatla(input) {
        const tutar = paraMetniniSayiyaCevir(input.value);
        input.value = Number.isFinite(tutar) && String(input.value || '').trim()
            ? tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '';
    }

/* FD notification API: showGlobalOverlay */

/* FD notification API: showToast */

/* FD notification API: hideGlobalOverlay */

function tarihFormati(s) {
        if (!s) return '';
        const raw = String(s).trim();
        const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) return `${isoMatch[3]}.${isoMatch[2]}.${isoMatch[1]}`;
        const parsed = new Date(raw);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
        return raw;
    }
