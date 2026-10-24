// Existing common calculations, screen transition and cross-module document viewer.
function icraKalanBorc(icra) {
        const kesilen = (Array.isArray(icra.kesintiler) ? icra.kesintiler : [])
            .reduce((toplam, k) => toplam + Number(k.tutar || 0), 0);
        return Math.max(0, Number(icra.toplamBorc || 0) - kesilen);
    }
function icraSiradakiniAktifEt(pId) {
        const aktifVar = icralar.some(i =>
            String(i.pId) === String(pId) &&
            String(i.durum) === 'Aktif' &&
            icraKalanBorc(i) > 0
        );
        if (aktifVar) return;
        const siradaki = icralar
            .filter(i => String(i.pId) === String(pId) && ['Bekleyen Sıra', 'Beklemede'].includes(String(i.durum)))
            .sort((a, b) => Number(a.siraTarihi || 0) - Number(b.siraTarihi || 0))[0];
        if (siradaki) siradaki.durum = 'Aktif';
    }
async function icraPdfAc(url, dosyaNo, belgeTuru = 'İcra Yazısı') {
        let dosyaUrl = String(url || '');
        if (dosyaUrl.startsWith('supabase:')) {
            const yol = dosyaUrl.slice('supabase:'.length);
            const { data, error } = await supabaseClient.storage.from('icra-pdf').createSignedUrl(yol, 300);
            if (error || !data?.signedUrl) {
                alert('PDF için güvenli görüntüleme bağlantısı oluşturulamadı.');
                return;
            }
            dosyaUrl = data.signedUrl;
        }
        const driveId = dosyaUrl.match(/\/d\/([^/]+)/)?.[1];
        const onizlemeUrl = driveId ? `https:\x2f\x2fdrive.google.com/file/d/${driveId}/preview` : dosyaUrl;
        document.getElementById('icraPdfBaslik').textContent = `${belgeTuru} — ${dosyaNo || ''}`;
        document.getElementById('icraPdfFrame').src = onizlemeUrl;
        document.getElementById('modalIcraPdf').style.display = 'flex';
    }
function icraPdfKapat() {
        document.getElementById('modalIcraPdf').style.display = 'none';
        document.getElementById('icraPdfFrame').src = 'about:blank';
    }
function icraEkraniniKapat() {
        const app = document.getElementById('icraApp');
        if (app) app.style.display = 'none';
        const dashboard = document.getElementById('personelDashboardApp');
        if (dashboard) dashboard.style.display = 'none';
    }
