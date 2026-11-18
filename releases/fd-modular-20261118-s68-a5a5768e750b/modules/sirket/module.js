window.FDModules.define('sirket',function(){

let fdSirketDisposed=false;
let fdSirketOverlayAktif=false;
function showGlobalOverlay(...args){fdSirketOverlayAktif=true;return window.showGlobalOverlay(...args)}
function hideGlobalOverlay(){fdSirketOverlayAktif=false;return window.hideGlobalOverlay()}
const fdSirketIlkOturum=fdSirketAnahtari();
function fdSirketAnahtari(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('sirket')])}
function fdSirketGecerli(){return !fdSirketDisposed&&fdSirketIlkOturum===fdSirketAnahtari()&&anaMenuModulErisimiVar('sirket')}
function fdSirketDogrula(write=false){if(!fdSirketGecerli())throw new Error('Oturum değişti; şirket ekranını yeniden açın.');if(write&&!anaMenuModulYazmaYetkisiVar('sirket'))throw new Error('Bu modülde değişiklik yapma yetkiniz yok.')}
async function fdSirketBekle(promise){fdSirketDogrula();const result=await promise;fdSirketDogrula();return result}
function sirketModulunuBaslat(){for(const [id,handler]of [['sirketForm','saveSirket'],['subeForm','saveSube']]){const form=document.getElementById(id);if(form&&!form.dataset.fdSirketBagli){form.dataset.fdSirketBagli='1';form.addEventListener('submit',window[handler])}}}
let subeBelgeBekleyenDosyalar = {};
let subeBelgeSilinecekler = new Set();
let aktifSubeDuzenlemeId = '';
let aktifSubeDuzenlemeEskiAdi = '';
let subeKayitIslemiDevamEdiyor = false;
const SUBE_KURTARMA_TASLAGI_ANAHTARI = 'fdSubeKurtarmaTaslagiV1';
async function openSirketApp() {
try{
fdSirketDogrula(false);

        if (!anaMenuModulErisimiVar('sirket')) return;
        anaMenuDonusButonunuGoster();
        icraEkraniniKapat();
        document.getElementById('appHub').style.display = 'none';
        document.getElementById('personelApp').style.display = 'none';
        document.getElementById('izinTakipApp').style.display = 'none';
        document.getElementById('puantajApp').style.display = 'none';
        document.getElementById('avansApp').style.display = 'none';
        document.getElementById('ekOdemeApp').style.display = 'none';
        document.getElementById('kkdApp').style.display = 'none';
        document.getElementById('sirketApp').style.display = 'block';
        showGlobalOverlay('Şirket bilgileri yükleniyor', 'Güncel şirket ve şube kayıtları hazırlanıyor...');
        try {
            if (SUPABASE_MODE) await fdSirketBekle(supabaseVerileriniYukle('sirket'));
            renderSirketYonetimi();
            const aktifSirket = sirketler.find(item => String(item.id) === String(aktifSirketId())) || sirketler[0];
            if (aktifSirket) editSirket(aktifSirket.id);
        } catch (error) {
if(!fdSirketGecerli()) return;

            console.error('Şirket ekranı:', error);
            renderSirketYonetimi();
            showToast('Şirket bilgileri yenilenemedi; mevcut kayıtlar gösteriliyor.', 'warning');
        } finally {
if(fdSirketGecerli()){

            hideGlobalOverlay();
        
}
}
    
}catch(fdScopeError){if(!fdSirketGecerli())return;throw fdScopeError;}
}

function switchSirketTab(tabId, button) {
fdSirketDogrula(false);

        document.querySelectorAll('#sirketApp .tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('#sirketApp .workspace-nav button').forEach(el => el.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        if (button) button.classList.add('active');
    }

function subeSifreGorunumunuDegistir(goster) {
fdSirketDogrula(false);

        ['subeIskurSifre','subeSgkSistemSifresi','subeSgkIsyeriSifresi'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.type = goster ? 'text' : 'password';
        });
        const secim = document.getElementById('subeSifreleriGoster');
        if (secim) secim.checked = Boolean(goster);
    }

function subeBelgeMevcutKaydi() {
fdSirketDogrula(false);

        const editId = document.getElementById('subeEditId')?.value || '';
        return subeler.find(item => String(item.id) === String(editId)) || null;
    }

function subeBelgeAlanlariniSifirla() {
fdSirketDogrula(false);

        subeBelgeBekleyenDosyalar = {};
        subeBelgeSilinecekler = new Set();
        subeBelgeAlanlariniCiz();
    }

function subeBelgeAlanlariniCiz(item = null) {
fdSirketDogrula(false);

        const alan = document.getElementById('subeBelgeAlanlari');
        if (!alan) return;
        item = item || subeBelgeMevcutKaydi();
        const belgeler = item?.personelBelgeleri || {};
        alan.innerHTML = SUBE_PERSONEL_BELGELERI.map(tanim => {
            const bekleyen = subeBelgeBekleyenDosyalar[tanim.key];
            const mevcut = subeBelgeSilinecekler.has(tanim.key) ? null : belgeler[tanim.key];
            const ad = bekleyen?.name || mevcut?.ad || '';
            const durum = bekleyen ? 'Kaydedildiğinde Drive’a yüklenecek: ' + ad : (mevcut ? 'Kayıtlı: ' + ad : 'Henüz Word dosyası yüklenmedi.');
            return '<div class="branch-document-card">' +
                '<div><strong>' + sirketText(tanim.baslik) + (tanim.otomatik ? ' · Otomatik doldurulur' : '') + '</strong><small>' + sirketText(tanim.aciklama) + '</small><small style="color:' + (ad ? '#047857' : '#b45309') + ';font-weight:700;">' + sirketText(durum) + '</small></div>' +
                '<div class="branch-document-actions">' +
                    (mevcut || bekleyen ? '<button type="button" class="btn-modern btn-detail-modern" data-sube-belge-indir="' + tanim.key + '">⬇️ Düzenlemek İçin İndir</button>' : '') +
                    '<label class="btn-modern btn-edit-modern" style="cursor:pointer;">' + (mevcut || bekleyen ? '🔄 Değiştir' : '📤 Word Yükle') + '<input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" data-sube-belge-sec="' + tanim.key + '" hidden></label>' +
                    (mevcut || bekleyen ? '<button type="button" class="btn-modern btn-del-modern" data-sube-belge-sil="' + tanim.key + '">🗑️ Kaldır</button>' : '') +
                '</div></div>';
        }).join('');
        alan.querySelectorAll('[data-sube-belge-sec]').forEach(input => input.onchange = () => subeBelgeDosyasiSecildi(input, input.dataset.subeBelgeSec));
        alan.querySelectorAll('[data-sube-belge-indir]').forEach(button => button.onclick = () => subeBelgeSablonunuIndir(button.dataset.subeBelgeIndir));
        alan.querySelectorAll('[data-sube-belge-sil]').forEach(button => button.onclick = () => subeBelgeKaldir(button.dataset.subeBelgeSil));
    }

async function subeBelgeDosyasiSecildi(input, key) {
try{
fdSirketDogrula(true);

        const dosya = input.files?.[0];
        if (!dosya) return;
        const tanim = SUBE_PERSONEL_BELGELERI.find(item => item.key === key);
        try {
            if (!/\.docx$/i.test(dosya.name)) throw new Error('Yalnızca DOCX biçimindeki Word dosyaları yüklenebilir.');
            if (dosya.size > 10 * 1024 * 1024) throw new Error('Word dosyası en fazla 10 MB olabilir.');
            if (tanim?.otomatik) {
                const grupSayisi = await fdSirketBekle(wordBelgesiKirmiziGrupSayisi(await fdSirketBekle(dosya.arrayBuffer())));
                if (grupSayisi !== 5) throw new Error('Bu belgede 5 kırmızı alan grubu bulunmalıdır: T.C. no, şube adresi, şirket unvanı, tarih aralığı ve personel adı. Bulunan grup: ' + grupSayisi + '.');
            }
            subeBelgeBekleyenDosyalar[key] = dosya;
            subeBelgeSilinecekler.delete(key);
            subeBelgeAlanlariniCiz();
            showToast(tanim.baslik + ' kaydetmeye hazırlandı.');
        } catch (error) {
if(!fdSirketGecerli()) return;

            input.value = '';
            alert(error.message || error);
        }
    
}catch(fdScopeError){if(!fdSirketGecerli())return;throw fdScopeError;}
}

async function subeBelgeKaldir(key) {
try{
fdSirketDogrula(true);

        const tanim = SUBE_PERSONEL_BELGELERI.find(item => item.key === key);
        if (!await fdSirketBekle(fdYuzerOnaySor((tanim?.baslik || 'Belge') + ' bu şubeden kaldırılsın mı? Değişiklik Şubeyi Kaydet dediğinizde uygulanır.'))) return;
        delete subeBelgeBekleyenDosyalar[key];
        subeBelgeSilinecekler.add(key);
        subeBelgeAlanlariniCiz();
    
}catch(fdScopeError){if(!fdSirketGecerli())return;throw fdScopeError;}
}

async function subeBelgeSablonunuIndir(key) {
try{
fdSirketDogrula(false);

        const tanim = SUBE_PERSONEL_BELGELERI.find(item => item.key === key);
        const bekleyen = subeBelgeBekleyenDosyalar[key];
        if (bekleyen) return fdCiktiDogrudanKaydet(bekleyen, bekleyen.name);
        const belge = subeBelgeMevcutKaydi()?.personelBelgeleri?.[key];
        if (!belge?.id) return alert('İndirilecek Word belgesi bulunamadı.');
        showGlobalOverlay('Word belgesi indiriliyor', tanim?.baslik || 'Şube belgesi');
        try {
            const sonuc = await fdSirketBekle(fdYazilimDriveDosyaIndir(belge.id));
            const blob = new Blob([base64DizisineCevir(sonuc.base64)], { type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            fdCiktiDogrudanKaydet(blob, sonuc.ad || belge.ad || 'sube_belgesi.docx');
        } catch (error) {
if(!fdSirketGecerli()) return;

            alert('Word belgesi indirilemedi: ' + (error.message || error));
        } finally {
if(fdSirketGecerli()){

            hideGlobalOverlay();
        
}
}
    
}catch(fdScopeError){if(!fdSirketGecerli())return;throw fdScopeError;}
}

function renderSirketYonetimi() {
fdSirketDogrula(false);

        const companyList = document.getElementById('sirketListesi');
        const branchList = document.getElementById('subeListesi');
        const companySelect = document.getElementById('subeSirketId');
        if (!companyList || !branchList || !companySelect) return;
        companySelect.innerHTML = sirketler.length ? '<option value="">Şirket seçin</option>' + sirketler.map(item => `<option value="${sirketText(item.id)}">${sirketText(item.unvan)}</option>`).join('') : '<option value="">Önce şirket kaydı ekleyin</option>';
        companyList.innerHTML = sirketler.length ? sirketler.map(item => `<div class="dashboard-list-item"><div><div class="company-table-name">${sirketText(item.unvan)}</div><div class="company-table-meta">${sirketText(item.kisaAd || 'Kısa ad yok')} · ${sirketText(item.vergiNo || 'Vergi no yok')} · ${sirketText(item.ticaretSicilNo || 'Ticaret sicil no yok')}</div></div><button class="btn-modern btn-edit-modern" onclick="editSirket('${sirketText(item.id)}')">✏️ Düzenle</button></div>`).join('') : '<div class="company-empty">Henüz şirket kaydı bulunmuyor.</div>';
        branchList.innerHTML = subeler.length ? subeler.map(item => { const company = sirketler.find(s => String(s.id) === String(item.sirketId)); return `<div class="dashboard-list-item"><div><div class="company-table-name">${sirketText(item.ad)} <span class="badge" style="background:${item.durum === 'Pasif' ? '#64748b' : '#0f766e'};color:#fff;">${sirketText(item.durum || 'Aktif')}</span></div><div class="company-table-meta">${sirketText(company?.kisaAd || company?.unvan || 'Şirket belirtilmemiş')} · ${sirketText(item.konum || 'Konum yok')} · SGK: ${sirketText(item.sgkSicilNo || 'Belirtilmemiş')}</div></div><div class="action-btns"><button class="btn-modern btn-edit-modern" onclick="editSube('${sirketText(item.id)}')">✏️ Düzenle</button><button class="btn-modern btn-del-modern" onclick="subeSil('${sirketText(item.id)}')">🗑️ Sil</button></div></div>`; }).join('') : '<div class="company-empty">Henüz şube veya şantiye kaydı bulunmuyor.</div>';
        document.getElementById('sirketSayisi').textContent = sirketler.length;
        document.getElementById('subeSayisiYonetim').textContent = subeler.filter(item => item.durum !== 'Pasif').length;
        subeBelgeAlanlariniCiz();
    }

async function saveSirket(event) {
try{
fdSirketDogrula(true);

        event.preventDefault();
        const formEditId = document.getElementById('sirketEditId').value;
        const aktifId = String(aktifSirketId() || '');
        const hedefId = String(formEditId || (SUPABASE_MODE ? aktifId : '') || '');
        const mevcut = sirketler.find(s => String(s.id) === hedefId) || (SUPABASE_MODE ? sirketler.find(s => String(s.id) === aktifId) || sirketler[0] : null);
        const item = {
            ...(mevcut || {}),
            id: SUPABASE_MODE ? aktifId : (hedefId || 'sirket-' + Date.now()),
            unvan: document.getElementById('sirketUnvan').value.trim(),
            kisaAd: document.getElementById('sirketKisaAd').value.trim(),
            vergiDairesi: document.getElementById('sirketVergiDairesi').value.trim(),
            vergiNo: document.getElementById('sirketVergiNo').value.trim(),
            mersisNo: document.getElementById('sirketMersisNo').value.trim(),
            ticaretSicilNo: document.getElementById('sirketTicaretSicilNo').value.trim(),
            sermaye: paraMetniniSayiyaCevir(document.getElementById('sirketSermaye').value),
            ortaklar: document.getElementById('sirketOrtaklar').value.trim(),
            telefon: document.getElementById('sirketTelefon').value.trim(),
            eposta: document.getElementById('sirketEposta').value.trim(),
            adres: document.getElementById('sirketAdres').value.trim(),
            web: document.getElementById('sirketWeb').value.trim(),
            logoUrl: document.getElementById('sirketLogoUrl').value.trim(),
            digerBilgiler: document.getElementById('sirketDigerBilgiler').value.trim(),
            notlar: document.getElementById('sirketNotlar').value.trim()
        };
        if (!item.id) return alert('Aktif şirket kimliği bulunamadı. Oturumu kapatıp yeniden giriş yapın.');
        if (mevcut) sirketler = sirketler.map(s => String(s.id) === String(mevcut.id) ? item : s);
        else sirketler.push(item);
        yuklenenVeriler.add('sirketler');
        showGlobalOverlay('Şirket kaydediliyor', 'Şirket bilgileri güncelleniyor...');
        try {
            await fdSirketBekle(verileriKaydet());
            document.getElementById('sirketEditId').value = item.id;
            renderSirketYonetimi();
            showToast('Şirket bilgileri kaydedildi.');
        } catch (error) {
if(!fdSirketGecerli()) return;

            console.error('Şirket kaydı:', error);
            alert('Şirket bilgileri kaydedilemedi: ' + (error.message || error));
        } finally {
if(fdSirketGecerli()){

            hideGlobalOverlay();
        
}
}
    
}catch(fdScopeError){if(!fdSirketGecerli())return;throw fdScopeError;}
}

function kararliJsonDegeri(deger) {
fdSirketDogrula(false);

        if (Array.isArray(deger)) return deger.map(kararliJsonDegeri);
        if (deger && typeof deger === 'object') return Object.keys(deger).sort().reduce((sonuc, anahtar) => {
            if (deger[anahtar] !== undefined) sonuc[anahtar] = kararliJsonDegeri(deger[anahtar]);
            return sonuc;
        }, {});
        return deger;
    }

function subeDizisiniKayitlaGuncelle(item) {
fdSirketDogrula(true);

        const index = subeler.findIndex(s => String(s.id) === String(item.id));
        if (index >= 0) subeler = subeler.map((s, i) => i === index ? item : s);
        else subeler = [...subeler, item];
        yuklenenVeriler.add('subeler');
        veriKayitGoruntusunuYenile('subeler');
        veriOnbelleginiKaydet();
    }

async function subeKaydiniDogrulayarakKaydet(item) {
try{
fdSirketDogrula(true);

        if (!SUPABASE_MODE) {
            const oncekiSubeler = subeler;
            const index = subeler.findIndex(s => String(s.id) === String(item.id));
            subeler = index >= 0 ? subeler.map((s, i) => i === index ? item : s) : [...subeler, item];
            yuklenenVeriler.add('subeler');
            try {
                await fdSirketBekle(verileriKaydet());
                return item;
            } catch (error) {
if(!fdSirketGecerli()) return;

                subeler = oncekiSubeler;
                throw error;
            }
        }
        if (!activeUser?.sirketId) throw new Error('Şirket oturumu bulunamadı.');
        if (activeUser?.rol === 'Personel') throw new Error('Şube kaydetme yetkiniz bulunmuyor.');
        const satir = {
            company_id: activeUser.sirketId,
            module: 'subeler',
            legacy_id: String(item.id),
            record_year: supabaseKayitYili('subeler', item),
            employee_legacy_id: null,
            data: item
        };
        const { error: kayitHatasi } = await fdSirketBekle(supabaseClient.from('portal_records').upsert(satir, { onConflict:'company_id,module,legacy_id' }));
        if (kayitHatasi) throw kayitHatasi;
        const { data: kontrol, error: kontrolHatasi } = await fdSirketBekle(supabaseClient.from('portal_records')
            .select('legacy_id,data,updated_at')
            .eq('company_id', activeUser.sirketId)
            .eq('module', 'subeler')
            .eq('legacy_id', String(item.id))
            .maybeSingle());
        if (kontrolHatasi) throw kontrolHatasi;
        if (!kontrol?.data) throw new Error('Şube kaydı Supabase üzerinden doğrulanamadı.');
        const beklenen = JSON.stringify(kararliJsonDegeri(item));
        const kaydedilen = JSON.stringify(kararliJsonDegeri(kontrol.data));
        if (beklenen !== kaydedilen) throw new Error('Şube kaydı eksik yazıldı; form korunarak işlem durduruldu.');
        const dogrulanan = { ...kontrol.data, id:kontrol.data.id ?? kontrol.legacy_id };
        subeDizisiniKayitlaGuncelle(dogrulanan);
        return dogrulanan;
    
}catch(fdScopeError){if(!fdSirketGecerli())return;throw fdScopeError;}
}

function subeFormKaydiniOlustur(mevcut, editId, subeAdi) {
fdSirketDogrula(false);

        return {
            ...(mevcut || {}),
            id: editId || 'sube-' + Date.now(),
            sirketId: document.getElementById('subeSirketId').value,
            ad: subeAdi,
            kod: document.getElementById('subeKod').value.trim(),
            durum: document.getElementById('subeDurum').value,
            konum: document.getElementById('subeKonum').value.trim(),
            telefon: document.getElementById('subeTelefon').value.trim(),
            sgkSicilNo: document.getElementById('subeSgkSicilNo').value.trim(),
            temsilci: document.getElementById('subeTemsilci').value.trim(),
            sorumlu: document.getElementById('subeSorumlu').value.trim(),
            adres: document.getElementById('subeAdres').value.trim(),
            digerBilgiler: document.getElementById('subeDigerBilgiler').value.trim(),
            notlar: document.getElementById('subeNotlar').value.trim(),
            iskur: {
                isyeriNo:document.getElementById('subeIskurIsyeriNo').value.trim(),
                isverenTcNo:document.getElementById('subeIskurIsverenTc').value.trim(),
                sifre:document.getElementById('subeIskurSifre').value
            },
            sgkErisim: {
                kullaniciKodu:document.getElementById('subeSgkKullaniciKodu').value.trim(),
                kullaniciEk:document.getElementById('subeSgkKullaniciEk').value.trim(),
                sistemSifresi:document.getElementById('subeSgkSistemSifresi').value,
                isyeriSifresi:document.getElementById('subeSgkIsyeriSifresi').value
            },
            personelBelgeleri: { ...(mevcut?.personelBelgeleri || {}) },
            sonGuncelleme: new Date().toISOString(),
            sonGuncelleyen: activeUser?.username || ''
        };
    }

function subeKurtarmaTaslaginiSakla(item) {
fdSirketDogrula(true);

        try {
            sessionStorage.setItem(SUBE_KURTARMA_TASLAGI_ANAHTARI, JSON.stringify({
                sirketId: activeUser?.sirketId || '',
                subeId: String(item.id || ''),
                kayitZamani: new Date().toISOString(),
                item
            }));
        } catch (error) {
if(!fdSirketGecerli()) return;

            console.warn('Şube kurtarma taslağı saklanamadı:', error);
        }
    }

function subeKurtarmaTaslaginiTemizle() {
fdSirketDogrula(true);

        try { sessionStorage.removeItem(SUBE_KURTARMA_TASLAGI_ANAHTARI); } catch (error) {
if(!fdSirketGecerli()) return;
}
    }

async function subeKurtarmaTaslaginiUygula(subeId) {
try{
fdSirketDogrula(false);

        try {
            const taslak = JSON.parse(sessionStorage.getItem(SUBE_KURTARMA_TASLAGI_ANAHTARI) || 'null');
            if (!taslak?.item || String(taslak.sirketId || '') !== String(activeUser?.sirketId || '') || String(taslak.subeId || '') !== String(subeId || '')) return;
            if (!await fdSirketBekle(fdYuzerOnaySor('Bu şube için tamamlanamamış bir kayıt denemesinden kalan form taslağı bulundu. Taslaktaki bilgileri forma geri getireyim mi?'))) return;
            const item = taslak.item;
            ['SirketId','Ad','Kod','Durum','Konum','Telefon','SgkSicilNo','Temsilci','Sorumlu','Adres','DigerBilgiler','Notlar'].forEach(key => document.getElementById('sube' + key).value = item[key.charAt(0).toLowerCase() + key.slice(1)] || '');
            document.getElementById('subeIskurIsyeriNo').value = item.iskur?.isyeriNo || '';
            document.getElementById('subeIskurIsverenTc').value = item.iskur?.isverenTcNo || '';
            document.getElementById('subeIskurSifre').value = item.iskur?.sifre || '';
            document.getElementById('subeSgkKullaniciKodu').value = item.sgkErisim?.kullaniciKodu || '';
            document.getElementById('subeSgkKullaniciEk').value = item.sgkErisim?.kullaniciEk || '';
            document.getElementById('subeSgkSistemSifresi').value = item.sgkErisim?.sistemSifresi || '';
            document.getElementById('subeSgkIsyeriSifresi').value = item.sgkErisim?.isyeriSifresi || '';
            showToast('Kaydedilemeyen şube formu taslaktan geri getirildi.', 'warning');
        } catch (error) {
if(!fdSirketGecerli()) return;

            console.warn('Şube kurtarma taslağı okunamadı:', error);
        }
    
}catch(fdScopeError){if(!fdSirketGecerli())return;throw fdScopeError;}
}

function subePersonelEskiAdlariniBul(mevcutSube, yeniAdi, sirketId, formEskiAdi = '') {
fdSirketDogrula(false);

        const anahtar = deger => String(deger || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR');
        const adaylar = [...(Array.isArray(mevcutSube?.oncekiAdlar) ? mevcutSube.oncekiAdlar : []), formEskiAdi, mevcutSube?.ad]
            .map(deger => String(deger || '').trim()).filter(ad => ad && anahtar(ad) !== anahtar(yeniAdi));
        const sirketPersonelleri = personeller.filter(personel => !sirketId || !personel.sirketId || String(personel.sirketId) === String(sirketId));
        const adayEslesmesiVar = sirketPersonelleri.some(personel => adaylar.some(ad => anahtar(personel.sube) === anahtar(ad)));
        if (!adayEslesmesiVar) {
            const gecerliAdlar = new Set(subeler
                .filter(sube => !sirketId || !sube.sirketId || String(sube.sirketId) === String(sirketId))
                .map(sube => anahtar(sube.ad)).filter(Boolean));
            gecerliAdlar.add(anahtar(yeniAdi));
            const yetimAdlar = [...new Set(sirketPersonelleri.map(personel => String(personel.sube || '').trim())
                .filter(ad => ad && !gecerliAdlar.has(anahtar(ad))))];
            const hedefteKayitVar = sirketPersonelleri.some(personel => anahtar(personel.sube) === anahtar(mevcutSube?.ad) || anahtar(personel.sube) === anahtar(yeniAdi));
            if (!hedefteKayitVar && yetimAdlar.length === 1) adaylar.push(yetimAdlar[0]);
        }
        return [...new Map(adaylar.map(ad => [anahtar(ad), ad])).values()];
    }

async function subeAdiPersonellereYansit(eskiAdlar, yeniAdi, sirketId, subeId = '') {
try{
fdSirketDogrula(true);

        const anahtar = deger => String(deger || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR');
        const adlar = (Array.isArray(eskiAdlar) ? eskiAdlar : [eskiAdlar]).map(ad => String(ad || '').trim()).filter(Boolean);
        const eskiAnahtarlar = new Set(adlar.map(anahtar).filter(ad => ad && ad !== anahtar(yeniAdi)));
        if (!eskiAnahtarlar.size) return 0;
        const eslesiyor = personel => {
            const ayniSirket = !sirketId || !personel?.sirketId || String(personel.sirketId) === String(sirketId);
            const kimlikEslesmesi = subeId && String(personel?.subeId || personel?.branchId || '') === String(subeId);
            return ayniSirket && (kimlikEslesmesi || eskiAnahtarlar.has(anahtar(personel?.sube)));
        };
        const guncelle = personel => {
            const sonuc = { ...personel, sube:yeniAdi };
            if (subeId) sonuc.subeId = String(subeId);
            return sonuc;
        };

        if (SUPABASE_MODE) {
            const uzakKayitlar = await fdSirketBekle(supabasePortalModulKayitlariniTumunuGetir('personeller'));
            const degisenler = uzakKayitlar.filter(kayit => eslesiyor(kayit.data || {})).map(kayit => {
                const data = guncelle(kayit.data || {});
                return {
                    company_id:activeUser.sirketId,
                    module:'personeller',
                    legacy_id:String(kayit.legacy_id),
                    record_year:kayit.record_year ?? supabaseKayitYili('personeller', data),
                    employee_legacy_id:supabasePersonelKimligi(data, 'personeller') || null,
                    data
                };
            });
            if (!degisenler.length) return 0;
            const { error:kayitHatasi } = await fdSirketBekle(supabaseClient.from('portal_records').upsert(degisenler, { onConflict:'company_id,module,legacy_id' }));
            if (kayitHatasi) throw kayitHatasi;
            const kimlikler = degisenler.map(kayit => kayit.legacy_id);
            for (let baslangic = 0; baslangic < kimlikler.length; baslangic += 200) {
                const paket = kimlikler.slice(baslangic, baslangic + 200);
                const { data:kontrol, error:kontrolHatasi } = await fdSirketBekle(supabaseClient.from('portal_records')
                    .select('legacy_id,data').eq('company_id', activeUser.sirketId).eq('module', 'personeller').in('legacy_id', paket));
                if (kontrolHatasi) throw kontrolHatasi;
                if ((kontrol || []).length !== paket.length || (kontrol || []).some(kayit => anahtar(kayit.data?.sube) !== anahtar(yeniAdi))) {
                    throw new Error('Bağlı personellerin şube adı bulut kaydında doğrulanamadı.');
                }
            }
            const guncellenenIdler = new Set(kimlikler.map(String));
            personeller = personeller.map(personel => guncellenenIdler.has(String(personel.id)) || eslesiyor(personel) ? guncelle(personel) : personel);
            yuklenenVeriler.add('personeller');
            veriKayitGoruntusunuYenile('personeller');
            veriOnbelleginiKaydet();
            renderPersonelTables();
            personelSelectDoldur();
            return degisenler.length;
        }

        const oncekiPersoneller = personeller;
        personeller = personeller.map(personel => eslesiyor(personel) ? guncelle(personel) : personel);
        const adet = personeller.filter((personel, index) => personel !== oncekiPersoneller[index]).length;
        if (!adet) return 0;
        yuklenenVeriler.add('personeller');
        try {
            await fdSirketBekle(verileriKaydet());
            renderPersonelTables();
            personelSelectDoldur();
            return adet;
        } catch (error) {
if(!fdSirketGecerli()) return;

            personeller = oncekiPersoneller;
            veriOnbelleginiKaydet();
            throw error;
        }
    
}catch(fdScopeError){if(!fdSirketGecerli())return;throw fdScopeError;}
}

async function saveSube(event) {
try{
fdSirketDogrula(true);

        event.preventDefault();
        if (subeKayitIslemiDevamEdiyor) return;
        const formEditId = String(document.getElementById('subeEditId').value || '');
        const subeAdi = document.getElementById('subeAd').value.trim();
        const sirketId = document.getElementById('subeSirketId').value;
        const adAnahtari = deger => String(deger || '').trim().toLocaleLowerCase('tr-TR');
        const ayniSirketMi = s => !sirketId || !s.sirketId || String(s.sirketId) === String(sirketId);
        const formKimlikKaydi = subeler.find(s => String(s.id) === formEditId) || null;
        const aktifKimlikKaydi = subeler.find(s => String(s.id) === String(aktifSubeDuzenlemeId)) || null;
        const eskiAdliSube = aktifSubeDuzenlemeEskiAdi ? subeler.find(s => ayniSirketMi(s) && adAnahtari(s.ad) === adAnahtari(aktifSubeDuzenlemeEskiAdi)) || null : null;
        const ayniAdliSube = subeler.find(s => ayniSirketMi(s) && adAnahtari(s.ad) === adAnahtari(subeAdi)) || null;
        const mevcut = formKimlikKaydi || aktifKimlikKaydi || eskiAdliSube || ayniAdliSube || null;
        if ((aktifSubeDuzenlemeId || aktifSubeDuzenlemeEskiAdi) && !mevcut) return alert('Düzenlemeye açılan şube güncel listede bulunamadı. Yeni kayıt oluşturulmadı; Şube Kayıtları ekranını yeniden açıp Düzenle butonuna basın.');
        const oncekiSubeAdi = String(aktifSubeDuzenlemeEskiAdi || mevcut?.ad || '');
        const eskiSubeAdlari = subePersonelEskiAdlariniBul(mevcut, subeAdi, sirketId, oncekiSubeAdi);
        const hedefId = String(mevcut?.id || '');
        if (mevcut) {
            aktifSubeDuzenlemeId = String(mevcut.id);
            document.getElementById('subeEditId').value = String(mevcut.id);
        }
        const temelItem = subeFormKaydiniOlustur(mevcut, hedefId, subeAdi);
        temelItem.oncekiAdlar = [...new Set([...(Array.isArray(mevcut?.oncekiAdlar) ? mevcut.oncekiAdlar : []), ...eskiSubeAdlari].map(ad => String(ad || '').trim()).filter(ad => ad && ad.toLocaleLowerCase('tr-TR') !== subeAdi.toLocaleLowerCase('tr-TR')))];
        aktifSubeDuzenlemeId = String(temelItem.id);
        document.getElementById('subeEditId').value = String(temelItem.id);
        subeKurtarmaTaslaginiSakla(temelItem);
        const ayricaSilinecekler = [];
        const yeniYuklenenler = [];
        let bilgilerDogrulandi = false;
        let guncellenenPersonelSayisi = 0;
        subeKayitIslemiDevamEdiyor = true;
        showGlobalOverlay('Şube kaydediliyor', 'Şube bilgileri güncelleniyor...');
        try {
            const dogrulananTemelItem = await fdSirketBekle(subeKaydiniDogrulayarakKaydet(temelItem));
            bilgilerDogrulandi = true;
            const belgeler = { ...(dogrulananTemelItem.personelBelgeleri || {}) };
            const belgeDegisikligiVar = SUBE_PERSONEL_BELGELERI.some(tanim => subeBelgeSilinecekler.has(tanim.key) || subeBelgeBekleyenDosyalar[tanim.key]);
            if (belgeDegisikligiVar) {
                showGlobalOverlay('Belgeler güncelleniyor', 'Şube bilgileri kaydedildi. Seçilen belgeler hazırlanıyor...');
                for (const tanim of SUBE_PERSONEL_BELGELERI) {
                    const eskiBelge = belgeler[tanim.key];
                    if (subeBelgeSilinecekler.has(tanim.key)) {
                        if (eskiBelge?.id) ayricaSilinecekler.push(eskiBelge.id);
                        delete belgeler[tanim.key];
                    }
                    const dosya = subeBelgeBekleyenDosyalar[tanim.key];
                    if (!dosya) continue;
                    const base64 = await fdSirketBekle(dosyayiBase64Oku(dosya));
                    const yuklenen = await fdSirketBekle(fdYazilimDriveDosyaYukle(base64, subeBelgeDriveDosyaAdi(subeAdi, tanim.baslik), dosya.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '', 'PERSONEL ŞUBE BELGELERİ'));
                    yeniYuklenenler.push(yuklenen.id);
                    if (eskiBelge?.id) ayricaSilinecekler.push(eskiBelge.id);
                    belgeler[tanim.key] = { id:yuklenen.id, url:yuklenen.url, ad:yuklenen.ad, boyut:yuklenen.boyut || dosya.size, mimeType:yuklenen.mimeType || dosya.type, otomatik:tanim.otomatik, guncelleme:new Date().toISOString() };
                }
                await fdSirketBekle(subeKaydiniDogrulayarakKaydet({ ...dogrulananTemelItem, personelBelgeleri:belgeler, sonGuncelleme:new Date().toISOString() }));
                const silmeSonuclari = await fdSirketBekle(Promise.allSettled([...new Set(ayricaSilinecekler)].map(id => fdYazilimDriveDosyaSil(id))));
                if (silmeSonuclari.some(sonuc => sonuc.status === 'rejected')) showToast('Şube kaydedildi; kaldırılan eski Word dosyalarından biri Drive’da kalmış olabilir.', 'warning');
            }
            guncellenenPersonelSayisi = await fdSirketBekle(subeAdiPersonellereYansit(temelItem.oncekiAdlar, subeAdi, sirketId, temelItem.id));
            document.getElementById('subeForm').reset();
            document.getElementById('subeEditId').value = '';
            aktifSubeDuzenlemeId = '';
            aktifSubeDuzenlemeEskiAdi = '';
            subeSifreGorunumunuDegistir(false);
            subeBelgeAlanlariniSifirla();
            renderSirketYonetimi();
            syncSubeDatalist();
            subeKurtarmaTaslaginiTemizle();
            showToast((belgeDegisikligiVar ? 'Şube ve personel belgeleri kaydedilip doğrulandı.' : 'Şube bilgileri kaydedilip doğrulandı.') + (guncellenenPersonelSayisi ? ' ' + guncellenenPersonelSayisi + ' personelin şube adı da güncellendi.' : ''));
        } catch (error) {
if(!fdSirketGecerli()) return;

            console.error('Şube kaydı:', error);
            const mesaj = bilgilerDogrulandi
                ? 'Şube bilgileri kaydedildi; bağlı personel veya Word belgeleri güncellenemedi. Form korunuyor, tekrar deneyebilirsiniz.'
                : 'Şube kaydedilemedi. Supabase doğrulaması başarısız olduğu için form korunuyor.';
            alert(mesaj + '\n\nHata: ' + (error.message || error));
            renderSirketYonetimi();
        } finally {
if(fdSirketGecerli()){

            subeKayitIslemiDevamEdiyor = false;
            hideGlobalOverlay();
        
}
}
    
}catch(fdScopeError){if(!fdSirketGecerli())return;throw fdScopeError;}
}

function editSirket(id) {
fdSirketDogrula(false);

        const item = sirketler.find(s => String(s.id) === String(id)); if (!item) return;
        document.getElementById('sirketEditId').value = item.id;
        ['Unvan','KisaAd','VergiDairesi','VergiNo','MersisNo','TicaretSicilNo','Sermaye','Ortaklar','Telefon','Eposta','Adres','Web','LogoUrl','DigerBilgiler','Notlar'].forEach(key => document.getElementById(`sirket${key}`).value = item[key.charAt(0).toLowerCase() + key.slice(1)] || '');
        const sermayeTutari = paraMetniniSayiyaCevir(item.sermaye);
        document.getElementById('sirketSermaye').value = String(item.sermaye ?? '').trim() && Number.isFinite(sermayeTutari)
            ? sermayeTutari.toLocaleString('tr-TR', { minimumFractionDigits:2, maximumFractionDigits:2 })
            : '';        switchSirketTab('sirket-tab-genel', document.querySelector('#sirketApp .workspace-nav button'));
    }

function editSube(id) {
fdSirketDogrula(false);

        const item = subeler.find(s => String(s.id) === String(id)); if (!item) return;
        aktifSubeDuzenlemeId = String(item.id);
        aktifSubeDuzenlemeEskiAdi = String(item.ad || '');
        subeSifreGorunumunuDegistir(false);
        subeBelgeBekleyenDosyalar = {};
        subeBelgeSilinecekler = new Set();
        document.getElementById('subeEditId').value = item.id;
        ['SirketId','Ad','Kod','Durum','Konum','Telefon','SgkSicilNo','Temsilci','Sorumlu','Adres','DigerBilgiler','Notlar'].forEach(key => document.getElementById('sube' + key).value = item[key.charAt(0).toLowerCase() + key.slice(1)] || '');
        document.getElementById('subeIskurIsyeriNo').value = item.iskur?.isyeriNo || '';
        document.getElementById('subeIskurIsverenTc').value = item.iskur?.isverenTcNo || '';
        document.getElementById('subeIskurSifre').value = item.iskur?.sifre || '';
        document.getElementById('subeSgkKullaniciKodu').value = item.sgkErisim?.kullaniciKodu || '';
        document.getElementById('subeSgkKullaniciEk').value = item.sgkErisim?.kullaniciEk || '';
        document.getElementById('subeSgkSistemSifresi').value = item.sgkErisim?.sistemSifresi || '';
        document.getElementById('subeSgkIsyeriSifresi').value = item.sgkErisim?.isyeriSifresi || '';
        subeBelgeAlanlariniCiz(item);
        subeKurtarmaTaslaginiUygula(item.id);
        switchSirketTab('sirket-tab-subeler', document.querySelectorAll('#sirketApp .workspace-nav button')[1]);
    }

async function subeSil(id) {
try{
fdSirketDogrula(true);

        const item = subeler.find(s => String(s.id) === String(id));
        if (!item) return alert('Silinecek şube kaydı bulunamadı.');
        const bagliPersonelSayisi = personeller.filter(p => String(p.sube || '').trim().toLocaleLowerCase('tr-TR') === String(item.ad || '').trim().toLocaleLowerCase('tr-TR')).length;
        const personelUyarisi = bagliPersonelSayisi ? `\n\nBu şube adı ${bagliPersonelSayisi} personel kaydında kullanılıyor. Personeller silinmeyecek; şube adları personel kartlarında kalacak.` : '';
        if (!await fdSirketBekle(fdYuzerOnaySor(`“${item.ad || 'Şube'}” şubesi kalıcı olarak silinsin mi? Şubeye yüklenen Word belgeleri de kaldırılacaktır.${personelUyarisi}`))) return;
        showGlobalOverlay('Şube siliniyor', 'Supabase kaydı siliniyor ve sonuç doğrulanıyor...');
        try {
            if (SUPABASE_MODE) {
                if (!activeUser?.sirketId) throw new Error('Şirket oturumu bulunamadı.');
                const { error:silmeHatasi } = await fdSirketBekle(supabaseClient.from('portal_records').delete()
                    .eq('company_id', activeUser.sirketId).eq('module', 'subeler').eq('legacy_id', String(item.id)));
                if (silmeHatasi) throw silmeHatasi;
                const { data:kontrol, error:kontrolHatasi } = await fdSirketBekle(supabaseClient.from('portal_records').select('legacy_id')
                    .eq('company_id', activeUser.sirketId).eq('module', 'subeler').eq('legacy_id', String(item.id)).maybeSingle());
                if (kontrolHatasi) throw kontrolHatasi;
                if (kontrol) throw new Error('Şube Supabase üzerinden silinemedi; ekrandaki kayıt korunuyor.');
            } else {
                const oncekiSubeler = subeler;
                subeler = subeler.filter(s => String(s.id) !== String(item.id));
                yuklenenVeriler.add('subeler');
                try { await fdSirketBekle(verileriKaydet()); } catch (error) {
if(!fdSirketGecerli()) return;
 subeler = oncekiSubeler; throw error; }
            }
            subeler = subeler.filter(s => String(s.id) !== String(item.id));
            yuklenenVeriler.add('subeler');
            veriKayitGoruntusunuYenile('subeler');
            veriOnbelleginiKaydet();
            if (String(aktifSubeDuzenlemeId) === String(item.id) || String(document.getElementById('subeEditId').value) === String(item.id)) {
                aktifSubeDuzenlemeId = '';
                aktifSubeDuzenlemeEskiAdi = '';
            document.getElementById('subeForm').reset();
                subeSifreGorunumunuDegistir(false);
                document.getElementById('subeEditId').value = '';
                subeBelgeAlanlariniSifirla();
                subeKurtarmaTaslaginiTemizle();
            }
            renderSirketYonetimi();
            syncSubeDatalist();
            const belgeIds = Object.values(item.personelBelgeleri || {}).map(belge => belge?.id).filter(Boolean);
            const belgeSilmeSonuclari = await fdSirketBekle(Promise.allSettled(belgeIds.map(dosyaId => fdYazilimDriveDosyaSil(dosyaId))));
            if (belgeSilmeSonuclari.some(sonuc => sonuc.status === 'rejected')) showToast('Şube silindi; Word belgelerinden biri Drive’da kalmış olabilir.', 'warning');
            else showToast('Şube kaydı silindi.');
        } catch (error) {
if(!fdSirketGecerli()) return;

            console.error('Şube silme:', error);
            alert('Şube silinemedi: ' + (error.message || error));
        } finally {
if(fdSirketGecerli()){

            hideGlobalOverlay();
        
}
}
    
}catch(fdScopeError){if(!fdSirketGecerli())return;throw fdScopeError;}
}
return {open:openSirketApp,init:sirketModulunuBaslat,api:{switchSirketTab,subeSifreGorunumunuDegistir,subeBelgeMevcutKaydi,subeBelgeAlanlariniSifirla,subeBelgeAlanlariniCiz,subeBelgeDosyasiSecildi,subeBelgeKaldir,subeBelgeSablonunuIndir,renderSirketYonetimi,saveSirket,kararliJsonDegeri,subeDizisiniKayitlaGuncelle,subeKaydiniDogrulayarakKaydet,subeFormKaydiniOlustur,subeKurtarmaTaslaginiSakla,subeKurtarmaTaslaginiTemizle,subeKurtarmaTaslaginiUygula,subePersonelEskiAdlariniBul,subeAdiPersonellereYansit,saveSube,editSirket,editSube,subeSil,sirketModulunuBaslat},dispose(){fdSirketDisposed=true;document.querySelectorAll("#sirketApp form").forEach(form=>form.reset());subeBelgeBekleyenDosyalar={};subeBelgeSilinecekler.clear();aktifSubeDuzenlemeId="";aktifSubeDuzenlemeEskiAdi="";if(fdSirketOverlayAktif)hideGlobalOverlay();subeKayitIslemiDevamEdiyor=false;}};
});
