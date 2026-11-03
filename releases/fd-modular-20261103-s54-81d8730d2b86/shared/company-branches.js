// Shared company text, branch picker and personnel Word contracts; original bodies unchanged.
const SUBE_PERSONEL_BELGELERI = [
        { key:'calisanElKitabi', baslik:'Çalışan El Kitabı', otomatik:false, aciklama:'Şubeye özel el kitabı; personel alanı değiştirilmeden hazırlanır.' },
        { key:'fazlaMesaiOnayi', baslik:'Fazla Mesai Onay Belgesi', otomatik:true, aciklama:'Kırmızı alanlara personel, şirket, şube ve tarih bilgileri yazılır.' },
        { key:'vardiyaliCalismaOnayi', baslik:'Vardiyalı Çalışma Onay Belgesi', otomatik:true, aciklama:'Kırmızı alanlara personel, şirket, şube ve tarih bilgileri yazılır.' }
    ];

function sirketText(value) {
        return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
    }

function base64DizisineCevir(base64) {
        const temiz = String(base64 || '').replace(/^data:[^,]+,/, '');
        const ikili = atob(temiz);
        const sonuc = new Uint8Array(ikili.length);
        for (let i = 0; i < ikili.length; i++) sonuc[i] = ikili.charCodeAt(i);
        return sonuc;
    }

function subeBelgeDriveDosyaAdi(subeAdi, belgeBasligi) {
        const temizle = deger => String(deger || '').trim().toLocaleUpperCase('tr-TR').replace(/[^A-ZÇĞİÖŞÜ0-9]+/g, '_').replace(/^_+|_+$/g, '');
        return temizle(subeAdi) + '_PERSONEL_' + temizle(belgeBasligi) + '.docx';
    }

function syncSubeDatalist() {
        const select = document.getElementById('pSube'); if (!select) return;
        const currentValue = select.value;
        const savedNames = subeler
            .filter(item => item.durum !== 'Pasif')
            .filter(item => !activeUser?.sirketId || String(item.sirketId) === String(activeUser.sirketId))
            .map(item => item.ad).filter(Boolean);
        const legacyNames = personeller.map(item => item.sube).filter(Boolean);
        const names = [...new Set([...savedNames, ...legacyNames])].sort((a, b) => String(a).localeCompare(String(b), 'tr'));
        select.innerHTML = '<option value="">Şube seçin</option>' + names.map(name => `<option value="${sirketText(name)}">${sirketText(name)}</option>`).join('');
        if (currentValue && names.includes(currentValue)) select.value = currentValue;
    }
