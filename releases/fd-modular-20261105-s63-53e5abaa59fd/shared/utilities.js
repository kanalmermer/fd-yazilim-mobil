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

function showGlobalOverlay(t, s) {
        document.getElementById('overlayTitle').innerText = kullaniciMesajiniSadlestir(t);
        document.getElementById('overlaySub').innerText = kullaniciMesajiniSadlestir(s);
        const ilerleme=document.getElementById('overlayProgress'),dolgu=document.getElementById('overlayProgressFill'),oran=document.getElementById('overlayProgressText');
        if(ilerleme)ilerleme.style.display='none';if(dolgu)dolgu.style.width='0%';if(oran)oran.textContent='0%';
        document.getElementById('globalOverlay').style.display = 'flex';
    }

function showToast(mesaj, tur = 'success') {
        mesaj = kullaniciMesajiniSadlestir(mesaj);
        let alan = document.getElementById('portalToastAlani');
        if (!alan) {
            alan = document.createElement('div');
            alan.id = 'portalToastAlani';
            alan.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:120000;display:flex;flex-direction:column-reverse;gap:9px;width:min(430px,calc(100vw - 28px));pointer-events:none;';
            document.body.appendChild(alan);
        }
        const renkler = tur === 'error' ? ['#fee2e2','#991b1b','#ef4444'] : tur === 'warning' ? ['#fef3c7','#92400e','#f59e0b'] : ['#dcfce7','#166534','#22c55e'];
        const ikon = tur === 'error' ? '⛔' : tur === 'warning' ? '⚠️' : '✓';
        const baslik = tur === 'error' ? 'İşlem tamamlanamadı' : tur === 'warning' ? 'Uyarı' : 'İşlem başarılı';
        const bildirim = document.createElement('div');
        bildirim.style.cssText = `position:relative;padding:12px 38px 12px 14px;border-radius:12px;background:${renkler[0]};color:${renkler[1]};border:1px solid ${renkler[2]}55;border-left:5px solid ${renkler[2]};box-shadow:0 14px 34px rgba(15,23,42,.22);font-size:.82rem;line-height:1.45;white-space:pre-line;overflow-wrap:anywhere;transition:.25s ease;pointer-events:auto;`;
        bildirim.innerHTML='<div style="display:flex;gap:9px;align-items:flex-start"><span style="font-size:1rem;line-height:1.2">'+ikon+'</span><div><strong style="display:block;margin-bottom:3px;font-size:.84rem">'+baslik+'</strong><div></div></div></div><button type="button" aria-label="Bildirimi kapat" style="position:absolute;right:8px;top:8px;border:0;background:transparent;color:inherit;font-size:1rem;cursor:pointer">×</button>';
        bildirim.querySelector('div div div').textContent=String(mesaj??'');
        bildirim.querySelector('button').onclick=()=>bildirim.remove();
        alan.appendChild(bildirim);
        const sure=tur==='success'?5000:9000;
        setTimeout(() => { if(!bildirim.isConnected)return;bildirim.style.opacity='0';bildirim.style.transform='translateY(7px)';setTimeout(()=>bildirim.remove(),260); }, sure);
    }

function hideGlobalOverlay() { const katman=document.getElementById('globalOverlay'),ilerleme=document.getElementById('overlayProgress'),dolgu=document.getElementById('overlayProgressFill');if(katman)katman.style.display='none';if(ilerleme)ilerleme.style.display='none';if(dolgu)dolgu.style.width='0%'; }

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
