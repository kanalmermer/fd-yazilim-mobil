window.FDModules.define('avans',function(){

let fdAdvanceDisposed=false,fdAdvanceOverlay=null,fdAdvancePostponement=null;const fdAdvanceInitial=fdAdvanceContext(),fdAdvanceTimers=new Set(),fdAdvanceIntervals=new Set(),fdAdvanceListeners=[],fdAdvanceNodes=new Set(),fdAdvanceDialogs=new Set();
function fdAdvanceContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',anaMenuModulYetkisi('personel')])}
function fdAdvanceValid(){return !fdAdvanceDisposed&&fdAdvanceInitial===fdAdvanceContext()&&anaMenuModulErisimiVar('personel')}
function fdAdvanceAssert(write=false){if(!fdAdvanceValid())throw Error('Oturum değişti; Avans ekranını yeniden açın.');if(write&&(!avansIslemYetkisiVar()||!anaMenuModulYazmaYetkisiVar('personel')))throw Error('Avans işlemi için yazma yetkiniz yok.')}
async function fdAdvanceAwait(p){fdAdvanceAssert();const v=await p;fdAdvanceAssert();return v}
function fdAdvanceListen(target,...args){target.addEventListener(...args);fdAdvanceListeners.push([target,...args])}
function fdAdvanceTimeout(fn,ms,...args){const id=window.setTimeout(()=>{fdAdvanceTimers.delete(id);if(fdAdvanceValid())fn(...args)},ms);fdAdvanceTimers.add(id);return id}
function setInterval(fn,ms){const id=window.setInterval(fn,ms);fdAdvanceIntervals.add(id);return id}
function clearInterval(id){fdAdvanceIntervals.delete(id);window.clearInterval(id)}
function fdAdvanceConfirm(...args){fdAdvanceAssert();const before=document.getElementById('fdYuzerOnayKatmani'),p=window.fdYuzerOnaySor(...args),node=document.getElementById('fdYuzerOnayKatmani');if(node&&node!==before)fdAdvanceDialogs.add(node);return p}
function fdAdvanceShowOverlay(...args){fdAdvanceAssert();window.showGlobalOverlay(...args);const node=document.getElementById('globalOverlay');fdAdvanceOverlay=node?{node,html:node.innerHTML}:null}
function fdAdvanceHideOverlay(){if(fdAdvanceOverlay&&fdAdvanceOverlay.node.innerHTML===fdAdvanceOverlay.html)window.hideGlobalOverlay();fdAdvanceOverlay=null}
function fdAdvanceClean(node){if(!node)return;if(node._url){URL.revokeObjectURL(node._url);node._url=null}node.querySelectorAll?.('iframe').forEach(f=>f.src='about:blank');node._blob=null;node.remove()}
function fdAdvancePdf(...args){fdAdvanceAssert();args[3]={...args[3],fdIsCurrent:fdAdvanceValid};const before=document.getElementById('fdOrtakCiktiOnizleme'),p=window.fdTabloPdfOnizle(...args),node=document.getElementById('fdOrtakCiktiOnizleme'),owned=node!==before?node:null;if(owned)fdAdvanceNodes.add(owned);return Promise.resolve(p).then(v=>{if(fdAdvanceValid())return v},e=>{if(fdAdvanceValid())throw e}).finally(()=>{if(!fdAdvanceValid())fdAdvanceClean(owned)})}
let avansIslemSuruyor = false;
let avansDuzenlemeKopyasi = null;
let avansYeniTaslakId = '';
async function avansListeyiYenile() {
try{
fdAdvanceAssert(false);

        if (avansIslemSuruyor || !SUPABASE_MODE || !supabaseClient) return;
        if (supabaseKaydetmeBekleyen > 0) return showToast('Kayıt işlemi devam ediyor. Tamamlanınca listeyi yenileyin.','warning');
        const oturum=fdPortalVeriOturumu(), yerel=JSON.stringify(avanslar), btn=document.getElementById('avansListeYenileBtn');
        avansIslemSuruyor=true;if(btn)btn.disabled=true;
        try {
            if(veriSonKayitGoruntuleri.has('avanslar')&&veriSonKayitGoruntuleri.get('avanslar')!==yerel) {
                if(!await fdAdvanceAwait(fdAdvanceConfirm('Bu cihazda kaydedilmemiş avans değişiklikleri var. Sunucudaki kayıtlar değişmeden, yalnızca bu cihazdaki kaydedilmemiş değişiklikler bırakılıp güncel liste yüklensin mi?','Avans Listesini Yenile','Güncel Listeyi Yükle')))return;
            }
            if(!fdPortalVeriOturumuGecerli(oturum))return;
            const yil=Number(aktifKayitYili||new Date().getFullYear()),rows=await fdAdvanceAwait(supabasePortalModulKayitlariniTumunuGetir('avanslar',yil));
            if(!fdPortalVeriOturumuGecerli(oturum))return;
            if(JSON.stringify(avanslar)!==yerel)throw Error('Avans bilgileri bu sırada değişti; yenileme iptal edildi.');
            supabaseDiziAta('avanslar',rows.map(r=>({...r.data,id:r.data?.id??r.legacy_id})));
            fdUzakImzayiSatirlardanKaydet('avanslar',yil,rows);fdUzakAnahtarSonYukleme.set(fdUzakImzaAnahtari('avanslar',yil),Date.now());
            veriOnbelleginiKaydet();renderAvansKayitListesi();renderAvansKesintiListesi();renderAvansGelecekKesintileri();showToast('Avans listesi sunucudan yenilendi.');
        }catch(error){
if(!fdAdvanceValid())return;
if(fdPortalVeriOturumuGecerli(oturum))showToast('Liste yenilenemedi: '+(error.message||error),'warning');}
        finally{
if(fdAdvanceValid()){
avansIslemSuruyor=false;if(btn)btn.disabled=false;
}
}
    
}catch(fdAdvanceError){if(!fdAdvanceValid())return;throw fdAdvanceError;}
}
function avansSekmeDegistir(sekme, button) {
fdAdvanceAssert(false);

        if (sekme === 'yeni' && activeUser?.rol === 'Personel') return;
        const kartlar = {
            yeni: document.getElementById('avansKayitCard'),
            kayitlar: document.getElementById('avansKayitlarCard'),
            aylik: document.getElementById('avansAylikCard'),
            gelecek: document.getElementById('avansGelecekCard')
        };
        Object.entries(kartlar).forEach(([ad, kart]) => {
fdAdvanceAssert(false);

            if (kart) kart.style.display = ad === sekme ? '' : 'none';
        });
        document.querySelectorAll('#avansApp .module-subnav button').forEach(el => el.classList.remove('active'));
        if (button) button.classList.add('active');
        if (sekme === 'kayitlar') renderAvansKayitListesi();
        if (sekme === 'aylik') renderAvansKesintiListesi();
        if (sekme === 'gelecek') renderAvansGelecekKesintileri();
    }
let avansDuzenlemeId = '';
function avansYeniKayitAc() {
fdAdvanceAssert(true);

        if (avansIslemSuruyor || !avansIslemYetkisiVar()) return;
        avansFormReset();
        avansSekmeDegistir('yeni', document.getElementById('btnAvansYeniSekme'));
    }
function avansDuzenleVazgec() {
fdAdvanceAssert(false);

        if (avansIslemSuruyor) return;
        avansFormReset();
        avansSekmeDegistir('kayitlar', document.getElementById('btnAvansKayitlarSekme'));
    }
function openAvansApp() {
fdAdvanceAssert(false);

        icraEkraniniKapat();
        if (!activeUser) return;
        anaMenuDonusButonunuGoster();
        document.getElementById('appHub').style.display = 'none';
        document.getElementById('personelApp').style.display = 'none';
        document.getElementById('izinTakipApp').style.display = 'none';
        document.getElementById('puantajApp').style.display = 'none';
        document.getElementById('sirketApp').style.display = 'none';
        document.getElementById('ekOdemeApp').style.display = 'none';
        document.getElementById('kkdApp').style.display = 'none';
        document.getElementById('avansApp').style.display = 'block';
        workspaceSekmesiniAktifEt('avans');
        document.getElementById('btnAvansYeniSekme').style.display = activeUser.rol === 'Personel' ? 'none' : '';
        avansSekmeDegistir('kayitlar', document.getElementById('btnAvansKayitlarSekme'));
        const ayInput = document.getElementById('avansListeAy');
        const baslangicInput = document.getElementById('avansBaslangicAy');
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7);
        const currentDate = now.toISOString().slice(0, 10);
        if (!ayInput.value) ayInput.value = currentMonth;
        if (!baslangicInput.value) baslangicInput.value = currentMonth;
        if (!document.getElementById('avansYatirmaTarihi').value) document.getElementById('avansYatirmaTarihi').value = currentDate;
        avansTaksitButonlariniOlustur();
        avansTaksitAlaniniGuncelle();
        avansPersonelListesiniDoldur();
        renderAvansKayitListesi();
        renderAvansKesintiListesi();
        if (!fdModulVerisiTazeMi('avans')) {
            avansVerileriniYukle().then(() => {
fdAdvanceAssert(false);

                if (document.getElementById('avansApp')?.style.display !== 'block') return;
                avansPersonelListesiniDoldur();
                renderAvansKayitListesi();
                renderAvansKesintiListesi();
                renderAvansGelecekKesintileri();
            }).catch(error => {
if(!fdAdvanceValid())return;

                console.error('Avans ekranı yükleme hatası:', error);
                showToast('Avans verileri arka planda yenilenemedi.', 'warning');
            });
        }
    }
function avansPersonelListesiniDoldur() {
fdAdvanceAssert(false);

        const liste = document.getElementById('avansPersonelListesi');
        if (!liste) return;
        liste.innerHTML = '';
        personeller.filter(p => aktifSirketeAit(p) && !p.cikisTarihi).sort((a, b) => String(a.ad || '').localeCompare(String(b.ad || ''), 'tr')).forEach(p => {
fdAdvanceAssert(false);

            const option = document.createElement('option');
            option.value = `${p.ad} — ${p.sube || 'Şube yok'}`;
            option.dataset.id = p.id;
            liste.appendChild(option);
        });
    }
function avansPersonelSecimKontrol() {
fdAdvanceAssert(false);

        const input = document.getElementById('avansPersonelAra');
        const personel = personeller.find(p => aktifSirketeAit(p) && `${p.ad} — ${p.sube || 'Şube yok'}` === input.value);
        document.getElementById('avansPersonelId').value = personel ? personel.id : '';
        document.getElementById('avansSeciliPersonel').textContent = personel ? `✓ Seçilen personel: ${personel.ad}` : '';
    }
function avansTaksitAlaniniGuncelle() {
fdAdvanceAssert(false);

        document.querySelectorAll('#avansTaksitButonlari button').forEach(button => {
fdAdvanceAssert(false);

            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        });
        avansPlanOnizle();
    }
function avansTaksitButonlariniOlustur() {
fdAdvanceAssert(false);

        const alan = document.getElementById('avansTaksitButonlari');
        if (!alan || alan.children.length) return;
        for (let sayi = 1; sayi <= 12; sayi++) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = String(sayi);
            button.className = 'btn-modern';
            button.style.minWidth = '38px';
            button.style.justifyContent = 'center';
            button.onclick = () => avansTaksitSec(sayi);
            alan.appendChild(button);
        }
        avansTaksitSec(1);
    }
function avansTaksitSec(sayi) {
fdAdvanceAssert(false);

        const deger = Math.min(12, Math.max(1, Number(sayi || 1)));
        document.getElementById('avansTaksitSayisi').value = String(deger);
        document.querySelectorAll('#avansTaksitButonlari button').forEach((button, index) => {
fdAdvanceAssert(false);

            const secili = index + 1 === deger;
            button.style.background = secili ? '#0284c7' : '#e2e8f0';
            button.style.color = secili ? '#fff' : '#334155';
        });
        avansPlanOnizle();
    }
function avansPlanOnizle() {
fdAdvanceAssert(false);

        const tutar = paraMetniniSayiyaCevir(document.getElementById('avansTutar').value);
        const taksit = Number(document.getElementById('avansTaksitSayisi').value || 1);
        const plan = document.getElementById('avansPlanOnizleme');
        if (!tutar || !taksit) { plan.style.display = 'none'; return; }
        plan.style.display = 'block';
        plan.textContent = `${taksit} ay boyunca aylık yaklaşık ${paraFormatla(tutar / taksit)} kesilir. Son taksit kuruş farkını tamamlar.`;
    }
function siradakiAvansNo(kayitTarihi, haricId = '') {
fdAdvanceAssert(false);

        const tarihEslesme = String(kayitTarihi || '').match(/^(\d{4})-(\d{2})/);
        if (!tarihEslesme) return String(Date.now()).slice(-6);
        const ayAnahtari = `${tarihEslesme[1]}-${tarihEslesme[2]}`;
        const onEk = `${tarihEslesme[1].slice(-2)}${tarihEslesme[2]}`;
        const ayniAydakiler = avanslar.filter(a =>
            String(a.id) !== String(haricId) &&
            String(a.kayitTarihi || '').slice(0, 7) === ayAnahtari
        );
        const enBuyukSira = ayniAydakiler.reduce((enBuyuk, avans) => {
fdAdvanceAssert(false);

            const eslesme = String(avans.avansNo || '').match(new RegExp(`^${onEk}(\\d+)$`));
            return eslesme ? Math.max(enBuyuk, Number(eslesme[1])) : enBuyuk;
        }, 0);
        const sira = Math.max(enBuyukSira, ayniAydakiler.length) + 1;
        return `${onEk}${String(sira).padStart(2, '0')}`;
    }
async function avansKaydet(event) {
try{
fdAdvanceAssert(true);

        event.preventDefault();
        if (avansIslemSuruyor || !avansIslemYetkisiVar()) return;
        if (!SUPABASE_MODE || !supabaseClient || !activeUser?.sirketId) return alert('Güvenli avans kaydı için sunucu bağlantısı gerekiyor.');
        const oturum = fdPortalVeriOturumu(), sirketId = String(aktifSirketId());
        const editId = String(avansDuzenlemeId || document.getElementById('avansEditId').value || '');
        const mevcutIndex = editId ? avanslar.findIndex(a => String(a.id) === editId) : -1;
        const mevcutAvans = mevcutIndex >= 0 ? avanslar[mevcutIndex] : null;
        if (editId && (!mevcutAvans || !avansAktifSirketinMi(mevcutAvans) || !avansDuzenlemeKopyasi || avansDuzenlemeKopyasi.oturum !== oturum || avansDuzenlemeKopyasi.id !== editId)) {
            alert('Düzenlenen avans kaydı veya oturum değişmiş. Listeyi yenileyip tekrar düzenleyin.');
            return;
        }
        const beklenen = editId ? avansDuzenlemeKopyasi.data : null;
        if (beklenen && !avansJsonAyniMi(mevcutAvans,beklenen)) return alert('Avans bu sırada değişmiş. Eski bilgilerle üzerine yazılmadı; listeyi yenileyip tekrar düzenleyin.');
        avansPersonelSecimKontrol();
        const personelId = document.getElementById('avansPersonelId').value;
        const personel = personeller.find(p => String(p.id) === String(personelId) && aktifSirketeAit(p));
        const tutar = paraMetniniSayiyaCevir(document.getElementById('avansTutar').value);
        const baslangicAy = String(document.getElementById('avansBaslangicAy').value || '');
        const kayitTarihi = String(document.getElementById('avansYatirmaTarihi').value || '');
        const aciklama = String(document.getElementById('avansAciklama').value || '').trim();
        const taksitSayisi = Number(document.getElementById('avansTaksitSayisi').value || 1);

        if (!personel) {
            alert('Lütfen personeli açılan listeden seçin.');
            return;
        }
        const tarih = new Date(kayitTarihi + 'T12:00:00Z');
        if (!Number.isFinite(tutar) || tutar <= 0 || tutar > 1000000000 || !Number.isInteger(taksitSayisi) || taksitSayisi < 1 || taksitSayisi > 1200 || !/^\d{4}-(0[1-9]|1[0-2])$/.test(baslangicAy) || !/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(kayitTarihi) || !Number.isFinite(tarih.getTime()) || tarih.toISOString().slice(0,10) !== kayitTarihi) {
            alert('Avans bilgilerini eksiksiz doldurun.');
            return;
        }
        if (!sirketId) {
            alert('Personelin şirket bilgisi bulunamadı.');
            return;
        }

        const yeniAvans = {
            ...(beklenen || {}),
            id: editId || (avansYeniTaslakId ||= 'avans_' + (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).slice(2))),
            avansNo: mevcutAvans?.avansNo && String(mevcutAvans.kayitTarihi || '').slice(0, 7) === kayitTarihi.slice(0, 7)
                ? mevcutAvans.avansNo
                : siradakiAvansNo(kayitTarihi, editId),
            sirketId: String(sirketId),
            pId: String(personel.id),
            personelAd: String(personel.ad || ''),
            sube: String(personel.sube || ''),
            tutar,
            taksitSayisi,
            baslangicAy,
            kayitTarihi,
            aciklama,
            durum: beklenen ? beklenen.durum : 'Aktif'
        };
        avansIslemSuruyor = true;
        const alanlar = [...document.querySelectorAll('#avansForm input,#avansForm button')], pasifliklar = alanlar.map(a=>a.disabled);
        alanlar.forEach(a=>a.disabled=true);
        fdAdvanceShowOverlay('Avans kaydediliyor', 'Kesinti planı oluşturuluyor...');
        try {
            const sonuc = await fdAdvanceAwait(avansGuvenliSunucuKaydi(sirketId, yeniAvans, beklenen));
            if (!fdPortalVeriOturumuGecerli(oturum)) return;
            avansSunucuKaydiniUygula(sonuc, beklenen);
            yuklenenVeriler.add('avanslar');
            document.getElementById('avansListeAy').value = baslangicAy;
            ['avansKayitArama','avansKayitSubeFiltre','avansKayitDurumFiltre'].forEach(id=>document.getElementById(id).value='');
            document.getElementById('avansKayitAyFiltre').value = kayitTarihi.slice(0,7);
            // The confirmed record stays saved even if a notification fails.
            if (sonuc.created === true) {
                Promise.resolve().then(() => {
fdAdvanceAssert(false);

                if (!fdPortalVeriOturumuGecerli(oturum)) return;
                const taksitBilgisi = taksitSayisi === 1 ? 'tek seferde' : `${taksitSayisi} taksit halinde`;
                const mesaj = personelBildirimSablonunuDoldur('magicpassBildirimAvansKayitMetni', {
                    AD: personel.ad || 'Personel', TUTAR: paraFormatla(tutar), TAKSİT: taksitSayisi,
                    TAKSIT: taksitSayisi, 'TAKSİT_BİLGİSİ': taksitBilgisi, TAKSIT_BILGISI: taksitBilgisi,
                    'BAŞLANGIÇ_AYI': new Date(baslangicAy + '-01T12:00:00+03:00').toLocaleDateString('tr-TR',{month:'long',year:'numeric',timeZone:'Europe/Istanbul'})
                });
                return personelKayitBildirimiGonder(personel.id, 'Avans Kaydı', mesaj, { messageCategory:'advance' });
                }).catch(bildirimHatasi => {
if(!fdAdvanceValid())return;

                    console.warn('Avans kaydedildi ancak personel bildirimi gönderilemedi:', bildirimHatasi);
                    if (fdPortalVeriOturumuGecerli(oturum)) showToast('Avans kaydedildi; personel bildirimi gönderilemedi.', 'warning');
                });
            }
            if (!fdPortalVeriOturumuGecerli(oturum)) return;
            avansFormReset();
            avansSekmeDegistir('kayitlar', document.getElementById('btnAvansKayitlarSekme'));
            showToast(mevcutAvans ? 'Avans değişikliği kaydedildi.' : 'Avans kaydedildi.');
        } catch (error) {
if(!fdAdvanceValid())return;

            if (!fdPortalVeriOturumuGecerli(oturum)) return;
            console.error('Avans kaydedilemedi:', error);
            alert('Avans işlemi tamamlanamadı: ' + (error.message || 'Bağlantıyı kontrol edip listeyi yenileyin.'));
        } finally {
if(fdAdvanceValid()){

            avansIslemSuruyor = false;
            alanlar.forEach((a,i)=>a.disabled=pasifliklar[i]);
            fdAdvanceHideOverlay();
        
}
}
        if (!fdPortalVeriOturumuGecerli(oturum)) return;
        renderAvansKayitListesi();
        renderAvansKesintiListesi();
        renderAvansGelecekKesintileri();
    
}catch(fdAdvanceError){if(!fdAdvanceValid())return;throw fdAdvanceError;}
}
function avansFormReset() {
fdAdvanceAssert(false);

        avansDuzenlemeId = '';
        avansDuzenlemeKopyasi = null;
        avansYeniTaslakId = '';
        document.getElementById('avansForm').reset();
        document.getElementById('avansEditId').value = '';
        document.getElementById('avansPersonelId').value = '';
        document.getElementById('avansSeciliPersonel').textContent = '';
        document.getElementById('avansTaksitSayisi').value = '1';
        document.getElementById('avansYatirmaTarihi').value = new Date().toISOString().slice(0, 10);
        document.getElementById('avansBaslangicAy').value = new Date().toISOString().slice(0, 7);
        document.getElementById('avansPlanOnizleme').style.display = 'none';
        document.getElementById('btnAvansKaydet').textContent = '💾 Avansı Kaydet';
        document.getElementById('btnAvansVazgec').style.display = 'none';
        avansTaksitButonlariniOlustur();
        avansTaksitSec(1);
        avansTaksitAlaniniGuncelle();
    }
function avansDuzenle(id) {
fdAdvanceAssert(true);

        if (avansIslemSuruyor || !avansIslemYetkisiVar()) return;
        const avans = avanslar.find(a => String(a.id) === String(id));
        if (!avans || !avansAktifSirketinMi(avans)) return;
        const personel = personeller.find(p => String(p.id) === String(avans.pId) && aktifSirketeAit(p));
        avansDuzenlemeKopyasi = { id:String(avans.id), oturum:fdPortalVeriOturumu(), data:JSON.parse(JSON.stringify(avans)) };
        avansDuzenlemeId = String(avans.id);
        document.getElementById('avansEditId').value = avansDuzenlemeId;
        document.getElementById('avansPersonelId').value = String(avans.pId);
        document.getElementById('avansPersonelAra').value = `${personel?.ad || avans.personelAd || ''} — ${personel?.sube || avans.sube || 'Şube yok'}`;
        document.getElementById('avansSeciliPersonel').textContent = `✓ Seçilen personel: ${avans.personelAd || personel?.ad || ''}`;
        document.getElementById('avansYatirmaTarihi').value = tarihInputDegeri(avans.kayitTarihi);
        document.getElementById('avansTutar').value = Number(avans.tutar || 0).toLocaleString('tr-TR');
        document.getElementById('avansBaslangicAy').value = String(avans.baslangicAy || '').slice(0, 7);
        document.getElementById('avansAciklama').value = avans.aciklama || '';
        avansTaksitButonlariniOlustur();
        avansTaksitSec(Number(avans.taksitSayisi || 1));
        avansTaksitAlaniniGuncelle();
        document.getElementById('btnAvansKaydet').textContent = '💾 Değişiklikleri Kaydet';
        document.getElementById('btnAvansVazgec').style.display = '';
        avansSekmeDegistir('yeni', document.getElementById('btnAvansYeniSekme'));
        document.getElementById('avansKayitCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
async function avansSil(id) {
try{
fdAdvanceAssert(true);

        if (avansIslemSuruyor || !avansIslemYetkisiVar()) return;
        const mevcut = avanslar.find(a=>String(a.id)===String(id));
        if (!mevcut || !avansAktifSirketinMi(mevcut)) return;
        if (!SUPABASE_MODE || !supabaseClient) return alert('Güvenli silme işlemi için sunucu bağlantısı gerekiyor.');
        const oturum=fdPortalVeriOturumu(), sirketId=String(aktifSirketId()), beklenen=JSON.parse(JSON.stringify(mevcut));
        avansIslemSuruyor=true;
        try {
        if (!await fdAdvanceAwait(fdAdvanceConfirm('Bu avans kaydı silinsin mi?'))) return;
        if (!fdPortalVeriOturumuGecerli(oturum)) return;
        if (!avansJsonAyniMi(avanslar.find(a=>String(a.id)===String(id)),beklenen)) throw Error('Avans bu sırada değişti; silinmedi. Listeyi yenileyin.');
        await fdAdvanceAwait(avansGuvenliSunucuSil(sirketId,id,beklenen));
        if (!fdPortalVeriOturumuGecerli(oturum)) return;
        avanslar = avanslar.filter(a => String(a.id) !== String(id));
        const goruntu=JSON.parse(veriSonKayitGoruntuleri.get('avanslar')||'[]').filter(a=>String(a.id)!==String(id));
        veriSonKayitGoruntuleri.set('avanslar',JSON.stringify(goruntu));veriOnbelleginiKaydet();
        renderAvansKayitListesi();
        renderAvansKesintiListesi();
        renderAvansGelecekKesintileri();showToast('Avans silindi.');
        } catch(error){
if(!fdAdvanceValid())return;
if(fdPortalVeriOturumuGecerli(oturum))alert('Avans silinmedi: '+(error.message||error));}
        finally{
if(fdAdvanceValid()){
avansIslemSuruyor=false;
}
}
    
}catch(fdAdvanceError){if(!fdAdvanceValid())return;throw fdAdvanceError;}
}
function avansEtiketi(avans) {
fdAdvanceAssert(false);

        const numara = avans.avansNo || `AV-${String(avans.id || '').replace(/\D/g, '').slice(-6) || 'ESKI'}`;
        return `<strong>${escapeHtml(numara)}</strong>${avans.aciklama ? `<br><small>${escapeHtml(avans.aciklama)}</small>` : ''}`;
    }
let avansGecmisPersonelId = '';
let avansGecmisYili = '';
function avansGecmisKayitlari() {
fdAdvanceAssert(false);

        return avanslar.filter(a => avansAktifSirketinMi(a) && String(a.pId) === String(avansGecmisPersonelId) && String(a.kayitTarihi || '').startsWith(avansGecmisYili))
            .sort((a, b) => String(a.kayitTarihi || '').localeCompare(String(b.kayitTarihi || '')));
    }
function avansGecmisiniAc(pId, yil = '') {
fdAdvanceAssert(false);

        if (kullaniciRolAnahtari() === 'personel' && String(pId).trim() !== String(activeUser?.tcNo || '').trim()) return;
        avansGecmisPersonelId = String(pId);
        avansGecmisYili = String(yil || document.getElementById('avansListeAy')?.value || new Date().getFullYear()).slice(0, 4);
        const personel = personeller.find(p => String(p.id) === String(pId));
        const baslik = `${String(personel?.ad || 'PERSONEL').toLocaleUpperCase('tr-TR')} — ${avansGecmisYili} AVANS GEÇMİŞİ`;
        const kayitlar = avansGecmisKayitlari();
        document.getElementById('avansGecmisBaslik').textContent = baslik;
        document.getElementById('avansGecmisRaporBaslik').textContent = baslik;
        document.querySelector('#avansGecmisTablosu tbody').innerHTML = kayitlar.map(a => `<tr><td>${escapeHtml(a.avansNo || '-')}</td><td>${tarihFormati(a.kayitTarihi)}</td><td>${escapeHtml(String(a.baslangicAy || '-').slice(0, 7))}</td><td>${paraFormatla(a.tutar)}</td><td>${Number(a.taksitSayisi || 1)} AY</td><td>${escapeHtml(a.durum || 'Aktif')}</td><td>${escapeHtml(a.aciklama || '-')}</td></tr>`).join('') || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#64748b;">Bu yıl için avans kaydı yok.</td></tr>';
        document.querySelector('#avansGecmisTablosu tfoot').innerHTML = `<tr><th colspan="3" style="text-align:right;">TOPLAM AVANS</th><th>${paraFormatla(kayitlar.reduce((t, a) => t + Number(a.tutar || 0), 0))}</th><th colspan="3"></th></tr>`;
        document.getElementById('modalAvansGecmisi').style.display = 'flex';
    }
function avansGecmisiniKapat() {
fdAdvanceAssert(false);
 document.getElementById('modalAvansGecmisi').style.display = 'none'; }
function avansGecmisExcelIndir() {
fdAdvanceAssert(false);

        const kayitlar = avansGecmisKayitlari();
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([['AVANS NO','YATIRMA TARİHİ','KESİNTİ BAŞLANGICI','TUTAR','TAKSİT','DURUM','AÇIKLAMA'], ...kayitlar.map(a => [a.avansNo || '-', tarihFormati(a.kayitTarihi), String(a.baslangicAy || '').slice(0, 7), Number(a.tutar || 0), Number(a.taksitSayisi || 1), a.durum || 'Aktif', a.aciklama || '-'])]);
        ws['!cols'] = [{wch:14},{wch:16},{wch:20},{wch:16},{wch:10},{wch:14},{wch:32}];
        XLSX.utils.book_append_sheet(wb, ws, 'Avans Geçmişi');
        XLSX.writeFile(wb, `Avans_Gecmisi_${avansGecmisYili}.xlsx`);
    }
function avansKayitSubeFiltreleriniDoldur() {
fdAdvanceAssert(false);

        const select = document.getElementById('avansKayitSubeFiltre');
        if (!select) return;
        const secili = select.value;
        const subeAdlari = [...new Set(avanslar.filter(avansAktifSirketinMi).map(a => String(a.sube || '').trim()).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, 'tr-TR', { sensitivity:'base' }));
        select.innerHTML = '<option value="">Tüm şubeler</option>' + subeAdlari.map(sube => `<option value="${escapeHtml(sube)}">${escapeHtml(sube)}</option>`).join('');
        select.value = subeAdlari.includes(secili) ? secili : '';
    }
function avansKayitFiltreleriniTemizle() {
fdAdvanceAssert(false);

        ['avansKayitArama','avansKayitAyFiltre','avansKayitSubeFiltre','avansKayitDurumFiltre'].forEach(id => {
fdAdvanceAssert(false);

            const alan = document.getElementById(id);
            if (alan) alan.value = '';
        });
        renderAvansKayitListesi();
    }
function avansKayitFiltreliListe() {
fdAdvanceAssert(false);

        const arama = String(document.getElementById('avansKayitArama')?.value || '').trim().toLocaleLowerCase('tr-TR');
        const kayitAyi = String(document.getElementById('avansKayitAyFiltre')?.value || '');
        const sube = String(document.getElementById('avansKayitSubeFiltre')?.value || '');
        const durum = String(document.getElementById('avansKayitDurumFiltre')?.value || '');
        return avanslar.filter(avansAktifSirketinMi).filter(avans => {
fdAdvanceAssert(false);

            const kayitTarihi = String(avans.kayitTarihi || '').slice(0, 10);
            const aramaMetni = [avans.personelAd, avans.avansNo, avans.aciklama, avans.sube, avans.baslangicAy, avans.durum].join(' ').toLocaleLowerCase('tr-TR');
            return (!arama || aramaMetni.includes(arama)) && (!kayitAyi || kayitTarihi.slice(0, 7) === kayitAyi) && (!sube || String(avans.sube || '') === sube) && (!durum || String(avans.durum || 'Aktif') === durum);
        }).sort((a, b) => String(b.kayitTarihi || '').localeCompare(String(a.kayitTarihi || '')) || String(a.personelAd || '').localeCompare(String(b.personelAd || ''), 'tr-TR'));
    }
function renderAvansKayitListesi() {
fdAdvanceAssert(false);

        const body = document.getElementById('avansKayitListesiBody');
        if (!body) return;
        avansKayitSubeFiltreleriniDoldur();
        const tumKayitlar = avanslar.filter(avansAktifSirketinMi);
        const kayitlar = avansKayitFiltreliListe();
        const ozet = document.getElementById('avansKayitFiltreOzeti');
        if (ozet) ozet.textContent = `${kayitlar.length} / ${tumKayitlar.length} kayıt · ${paraFormatla(kayitlar.reduce((toplam, avans) => toplam + Number(avans.tutar || 0), 0))} · Kayıt ayı: ${document.getElementById('avansKayitAyFiltre')?.value || 'Tüm aylar'}`;

        if (!kayitlar.length) {
            body.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#64748b; padding:22px;">${tumKayitlar.length ? 'Seçilen filtrelerle eşleşen avans bulunmuyor.' : 'Kayıtlı avans bulunmuyor.'}</td></tr>`;
            return;
        }

        body.innerHTML = kayitlar.map(avans => `<tr>
            <td>${avansEtiketi(avans)}</td>
            <td><button type="button" class="fd-table-cell-link" onclick="avansGecmisiniAc('${avans.pId}', '${String(avans.kayitTarihi || '').slice(0, 4)}')">${escapeHtml(avans.personelAd || '-')}</button></td>
            <td>${escapeHtml(avans.sube || '-')}</td>
            <td>${escapeHtml(tarihFormati(avans.kayitTarihi) || '-')}</td>
            <td>${escapeHtml(String(avans.baslangicAy || '-').slice(0, 7))}</td>
            <td>${Number(avans.taksitSayisi || 1)} ay</td>
            <td style="font-weight:800;">${paraFormatla(avans.tutar)}</td>
            <td><span class="badge">${escapeHtml(avans.durum || 'Aktif')}</span></td>
            <td>${activeUser?.rol === 'Personel' ? '' : `<div class="action-btns"><button class="btn-modern btn-edit-modern" onclick="avansDuzenle('${avans.id}')">✏️ Düzenle</button><button class="btn-modern btn-del-modern" onclick="avansSil('${avans.id}')">🗑️ Sil</button></div>`}</td>
        </tr>`).join('');
    }
function avansGelecekDonemi() {
fdAdvanceAssert(false);

        const ilkAy=document.getElementById('avansGelecekBaslangicAy')?.value||'',sonAy=document.getElementById('avansGelecekBitisAy')?.value||'',gecerliAy=ay=>/^\d{4}-(0[1-9]|1[0-2])$/.test(ay)&&Number(ay.slice(0,4))>=100;
        let hata='';
        if(!gecerliAy(ilkAy)||!gecerliAy(sonAy))hata='Başlangıç ve bitiş ayını seçin.';
        else if(ilkAy>sonAy)hata='Bitiş ayı, başlangıç ayından önce olamaz.';
        else if(aySirasi(sonAy)-aySirasi(ilkAy)>=1200)hata='Lütfen 100 yıldan kısa bir ay aralığı seçin.';
        return {ilkAy,sonAy,hata,baslik:hata?'':avansAyBasligi(ilkAy,true)+(ilkAy===sonAy?'':' — '+avansAyBasligi(sonAy,true))};
    }
function renderAvansGelecekKesintileri() {
fdAdvanceAssert(false);

        const body=document.getElementById('avansGelecekBody'),head=document.getElementById('avansGelecekHead'),foot=document.getElementById('avansGelecekToplam');if(!body||!head||!foot)return;
        const card=document.getElementById('avansGelecekCard'),baslangic=document.getElementById('avansGelecekBaslangicAy'),bitis=document.getElementById('avansGelecekBitisAy');
        if(!baslangic||!bitis)return false;
        if(card.dataset.goruntuHazirlaniyor==='1')return false;
        const sirket=String(aktifSirketId()||''),otomatik=baslangic.value===card.dataset.varsayilanBaslangic&&bitis.value===card.dataset.varsayilanBitis;
        if(card.dataset.donemHazir!=='1'||card.dataset.donemSirket!==sirket||otomatik){
            const planlar=avanslar.filter(avansAktifSirketinMi).filter(a=>/^\d{4}-(0[1-9]|1[0-2])$/.test(String(a.baslangicAy||''))&&Number.isInteger(Number(a.taksitSayisi||1))&&Number(a.taksitSayisi||1)>0),buAy=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit'}).format(new Date());
            baslangic.value=avansAyEkle(buAy,-1);
            const sonPlanAyi=planlar.map(a=>typeof avansKesintiSonAyi==='function'?avansKesintiSonAyi(a):avansAyEkle(a.baslangicAy,Number(a.taksitSayisi||1)-1)).sort().pop();
            bitis.value=sonPlanAyi&&sonPlanAyi>buAy?sonPlanAyi:buAy;
            card.dataset.donemHazir='1';
            card.dataset.donemSirket=sirket;
            card.dataset.varsayilanBaslangic=baslangic.value;
            card.dataset.varsayilanBitis=bitis.value;
        }
        const donem=avansGelecekDonemi(),hata=document.getElementById('avansGelecekDonemHatasi');
        if(hata){hata.textContent=donem.hata;hata.style.display=donem.hata?'':'none';}
        card.querySelectorAll('.avans-plan-ciktilari button').forEach(b=>b.disabled=!!donem.hata);
        if(donem.hata){head.innerHTML='';body.innerHTML='';foot.innerHTML='';document.getElementById('avansGelecekOzet').textContent='';return false;}
        const plan=avansGelecekPlanVerisi(donem.ilkAy,donem.sonAy),aylar=plan.aylar,yilGoster=true,kolon=aylar.length+2;
        const aramaAnahtari=metin=>String(metin||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').trim();
        const arama=aramaAnahtari(document.getElementById('avansGelecekArama')?.value),sozcukler=arama.split(/\s+/).filter(Boolean);
        const kisiler=arama?plan.kisiler.filter(k=>{const metin=aramaAnahtari(k.ad+' '+(k.sube||''));return sozcukler.every(sozcuk=>metin.includes(sozcuk));}):plan.kisiler;
        const ayToplamlari=arama?Object.fromEntries(aylar.map(ay=>[ay,kisiler.reduce((toplam,k)=>toplam+Math.round(Number(k.aylar[ay]||0)*100),0)/100])):plan.ayToplamlari;
        const genelToplam=arama?kisiler.reduce((toplam,k)=>toplam+Math.round(Number(k.toplam||0)*100),0)/100:plan.genelToplam;
        head.innerHTML='<tr><th>AD SOYAD</th>'+aylar.map(ay=>'<th>'+escapeHtml(avansAyBasligi(ay,yilGoster))+'</th>').join('')+'<th>TOPLAM</th></tr>';
        body.innerHTML=kisiler.map(k=>'<tr><td><strong>'+escapeHtml(k.ad)+'</strong>'+(k.sube?'<br><small style="color:#64748b">'+escapeHtml(k.sube)+'</small>':'')+'</td>'+aylar.map(ay=>{
fdAdvanceAssert(false);
const tutar=Number(k.aylar[ay]||0);return '<td class="avans-ay-tutar"'+(tutar&&typeof avansPlanHucreOzellikleri==='function'?avansPlanHucreOzellikleri(k.id,ay):'')+'>'+(tutar?paraFormatla(tutar):'')+'</td>';}).join('')+'<td class="avans-satir-toplam">'+paraFormatla(k.toplam)+'</td></tr>').join('')||'<tr><td colspan="'+kolon+'" style="text-align:center!important;padding:28px;color:#64748b;position:static">'+(arama?'Aramanıza uygun personel veya şube bulunmuyor.':'Seçilen dönem için planlanmış avans kesintisi bulunmuyor.')+'</td></tr>';
        foot.innerHTML=kisiler.length?'<tr><th>TOPLAM</th>'+aylar.map(ay=>'<th>'+paraFormatla(ayToplamlari[ay])+'</th>').join('')+'<th>'+paraFormatla(genelToplam)+'</th></tr>':'';
        document.getElementById('avansGelecekOzet').textContent=kisiler.length+(arama?' / '+plan.kisiler.length:'')+' personel · '+aylar.length+' ay · '+paraFormatla(genelToplam);
        return true;
    }
function avansGelecekExcelAl() {
fdAdvanceAssert(false);

        if(!renderAvansGelecekKesintileri())return;
        const donem=avansGelecekDonemi();
        return aracTabloDisariAktar('avansGelecekBody','excel','AVANS KESİNTİ PLANI — '+donem.baslik,'Avans_Kesinti_Plani_'+donem.ilkAy+'_'+donem.sonAy);
    }
function avansGelecekPdfAl() {
fdAdvanceAssert(false);

        if(!renderAvansGelecekKesintileri())return;
        const tablo=document.querySelector('#avansGelecekCard .avans-matris'),donem=avansGelecekDonemi();
        return fdAdvancePdf?.(tablo,'AVANS KESİNTİ PLANI','Avans_Kesinti_Plani_'+donem.ilkAy+'_'+donem.sonAy+'.pdf',{donem:donem.baslik,format:'a3',genislik:'400mm',ilkKolonGenislik:'16%',altBaslik:'Avans Kesinti Planı'});
    }
async function avansGelecekGoruntuAl(button) {
try{
fdAdvanceAssert(false);

        if(!renderAvansGelecekKesintileri())return;
        const tablo=document.querySelector('#avansGelecekCard .avans-matris');
        if(!tablo||!tablo.rows.length)return alert('Görüntüsü alınacak gelecek kesinti tablosu bulunmuyor.');
        const donem=avansGelecekDonemi().baslik,ozet=document.getElementById('avansGelecekOzet')?.textContent?.trim()||'',eskiMetin=button?.innerHTML||'';
        const card=document.getElementById('avansGelecekCard');card.dataset.goruntuHazirlaniyor='1';
        card.querySelectorAll('.avans-gelecek-aksiyonlar input,.avans-plan-ciktilari button').forEach(el=>el.disabled=true);
        if(button){button.disabled=true;button.innerHTML='⏳ Hazırlanıyor';}
        fdAdvanceShowOverlay('Görüntü hazırlanıyor','Gelecek kesintiler tablosunun tamamı resme aktarılıyor...');
        try{
            await fdAdvanceAwait(document.fonts?.ready);
            const enBuyukBoyut=Math.max(tablo.scrollWidth,tablo.scrollHeight+72,1),olcek=Math.min(2,15000/enBuyukBoyut),baslik='AVANS KESİNTİ PLANI — '+donem.toLocaleUpperCase('tr-TR')+(ozet?' · '+ozet:''),canvas=await fdAdvanceAwait(puantajCanvasOlustur(tablo,olcek,baslik));
            if(!canvas||canvas.width<2||canvas.height<2)throw new Error('Görüntü boş oluştu.');
            const blob=await fdAdvanceAwait(new Promise(resolve=>canvas.toBlob(resolve,'image/png')));
            if(!blob)throw new Error('PNG görüntüsü oluşturulamadı.');
            if(!navigator.clipboard?.write||!window.ClipboardItem)throw new Error('Tarayıcı görüntüyü panoya kopyalamayı desteklemiyor.');
            await fdAdvanceAwait(navigator.clipboard.write([new ClipboardItem({'image/png':blob})]));
            fdAdvanceHideOverlay();showToast('Tam tablo görüntüsü panoya kopyalandı.');
        }catch(error){
if(!fdAdvanceValid())return;

            fdAdvanceHideOverlay();console.error('Gelecek avans kesintileri görüntüsü alınamadı:',error);alert('Görüntü alınamadı: '+(error?.message||error));
        }finally{
if(fdAdvanceValid()){

            delete card.dataset.goruntuHazirlaniyor;
            card.querySelectorAll('.avans-gelecek-aksiyonlar input').forEach(el=>el.disabled=false);
            if(button)button.innerHTML=eskiMetin;
            renderAvansGelecekKesintileri();
        
}
}
    
}catch(fdAdvanceError){if(!fdAdvanceValid())return;throw fdAdvanceError;}
}
function renderAvansKesintiListesi() {
fdAdvanceAssert(false);

        const body = document.getElementById('avansKesintiBody');
        const ay = document.getElementById('avansListeAy').value;
        if (!body || !ay) return;
        const avansKesintiSirala = (a, b) => String(a.sube || '').localeCompare(String(b.sube || ''), 'tr-TR', {sensitivity:'base'}) || String(a.personelAd || '').localeCompare(String(b.personelAd || ''), 'tr-TR', {sensitivity:'base'});
        const tumAvanslar = avanslar.filter(a => {
fdAdvanceAssert(false);

            const durum = String(a.durum || '').trim().toLocaleLowerCase('tr-TR');
            return avansAktifSirketinMi(a) && !['kapandı','kapandi','tamamlandı','tamamlandi'].includes(durum);
        }).sort(avansKesintiSirala);
        const satirlar = tumAvanslar.map(a => ({ avans: a, plan: avansAylikKesinti(a, ay) })).filter(item => item.plan).sort((a, b) => avansKesintiSirala(a.avans, b.avans));
        if (!satirlar.length) {
            body.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#64748b; padding:22px;">Seçilen ay için avans kesintisi bulunmuyor. Önceki kayıtları “Kaydedilen Avanslar” bölümünden görebilirsiniz.</td></tr>';
            return;
        }
        body.innerHTML = satirlar.map(({ avans, plan }) => `<tr>
            <td>${avansEtiketi(avans)}</td>
            <td><strong>${escapeHtml(avans.personelAd || '-')}</strong></td>
            <td>${escapeHtml(tarihFormati(avans.kayitTarihi) || '-')}</td>
            <td style="font-weight:850; color:#b45309;">${paraFormatla(plan.kesinti)}</td>
            <td>${plan.sira}. / ${plan.taksitSayisi} taksit</td>
            <td>${paraFormatla(avans.tutar)}</td>
            <td style="font-weight:750;">${paraFormatla(plan.kalan)}</td>
        </tr>`).join('');
    }
function avansGecmisPdfIndir(){
fdAdvanceAssert(false);
const tablo=document.querySelector('#avansGecmisRaporu table');return fdAdvancePdf(tablo,document.getElementById('avansGecmisBaslik')?.textContent||'Avans Geçmişi','Avans_Gecmisi_'+avansGecmisYili+'.pdf',{yon:'landscape',altBaslik:'Avans Geçmişi'});}
function fdAdvancePostponementInstall(root){

    let ui=null,menu=null,watch=null,busyOwner=null;
    const clone=x=>JSON.parse(JSON.stringify(x));
    const identity=()=>fdPortalVeriOturumu()+'|'+String(activeUser?.id||activeUser?.username||'')+'|'+String(anaMenuModulYetkisi('personel'));
    const allowed=()=>avansIslemYetkisiVar()&&anaMenuModulYazmaYetkisiVar('personel');
    const valid=ctx=>!!ctx&&ctx.identity===identity()&&allowed()&&document.getElementById('avansApp')?.style.display!=='none';
    const closed=a=>['kapandi','tamamlandi'].includes(kullaniciRolAnahtari(a.durum));
    function candidates(pId,month){return avanslar.filter(a=>avansAktifSirketinMi(a)&&String(a.pId)===String(pId)&&!closed(a)).flatMap(a=>avansKesintiTaksitlari(a).filter(x=>x.ay===month&&x.kurus>0).map(x=>({...x,id:String(a.id),record:clone(a)})));}
    function hideMenu(){menu?.remove();menu=null;}
    function stopWatch(){if(watch)clearInterval(watch);watch=null;}
    function close(){const prior=ui;ui=null;hideMenu();stopWatch();prior?.node.remove();if(prior?.returnFocus?.isConnected)prior.returnFocus.focus();}
    function observe(ctx){stopWatch();watch=setInterval(()=>{if(!valid(ctx))close();},200);}
    function error(ctx,message){if(ui===ctx&&valid(ctx)){ctx.error.textContent=message;ctx.error.hidden=false;}}
    function selected(ctx){return ctx.items[Number(ctx.select.value)];}
    function summary(ctx){const entry=selected(ctx);if(!entry)return;ctx.info.textContent=entry.record.personelAd+' · '+(entry.record.avansNo||'Avans')+' · '+entry.sira+'. taksit · '+paraFormatla(entry.kurus/100)+' · '+avansAyBasligi(ctx.month,true);ctx.target.min=avansAyEkle(ctx.month,1);const target=ctx.target.value;if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(target)||target<=ctx.month){ctx.preview.textContent='Daha sonraki bir ay seçin.';return;}const total=avansGelecekPlanVerisi(target,target).kisiler.find(x=>String(x.id)===ctx.personelId)?.toplam||0;ctx.preview.textContent='Hedef aydaki mevcut kesinti: '+paraFormatla(total)+' · Erteleme sonrası: '+paraFormatla(total+entry.kurus/100);}
    function openDialog(pId,month,returnFocus){
        close();if(!allowed()||avansIslemSuruyor)return;const items=candidates(pId,month);if(!items.length)return showToast('Bu hücrede ertelenebilecek aktif taksit yok.','warning');
        const node=document.createElement('div');node.id='fdAvansErteleModal';node.className='fd-avans-ertele-overlay';node.innerHTML='<section class="fd-avans-ertele-card" role="dialog" aria-modal="true" aria-labelledby="fdAvansErteleBaslik"><header><h2 id="fdAvansErteleBaslik">Kesintiyi başka aya ertele</h2><button type="button" data-close aria-label="Kapat">×</button></header><form><p data-info></p><label>Erteleyeceğiniz taksit<select id="fdAvansErteleTaksit"></select></label><small data-multiple></small><label>Kesintinin yapılacağı ay<input id="fdAvansErteleAy" type="month" required max="9999-12"></label><p data-preview class="fd-avans-ertele-preview" aria-live="polite"></p><p class="fd-avans-ertele-note">Yalnız seçilen taksit taşınır; diğer taksitler ve toplam avans tutarı değişmez. Kaydedilmiş puantaj ve ücret pusulaları değiştirilmez. Kapalı dönemlere işlem yapılamaz.</p><p data-error role="alert" hidden></p><footer><button type="button" data-close>Vazgeç</button><button type="submit" class="fd-avans-ertele-save">Ertelemeyi Kaydet</button></footer></form></section>';
        const ctx={node,items,personelId:String(pId),month,returnFocus,identity:identity(),select:node.querySelector('select'),target:node.querySelector('input'),info:node.querySelector('[data-info]'),preview:node.querySelector('[data-preview]'),error:node.querySelector('[data-error]')};ui=ctx;
        items.forEach((entry,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=(entry.record.avansNo||'Avans')+' · '+entry.sira+'. taksit · '+paraFormatla(entry.kurus/100);ctx.select.append(option);});
        node.querySelector('[data-multiple]').textContent=items.length>1?'Bu hücre birden fazla taksit içeriyor. Yalnız seçtiğiniz taksit ertelenecek.':'';
        ctx.target.value=avansAyEkle(month,1);node.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{if(!busyOwner)close();}));
        node.addEventListener('click',e=>{if(e.target===node&&!busyOwner)close();});ctx.select.addEventListener('change',()=>summary(ctx));ctx.target.addEventListener('input',()=>summary(ctx));
        node.querySelector('form').addEventListener('submit',e=>{e.preventDefault();save(ctx);});document.body.append(node);summary(ctx);observe(ctx);ctx.target.focus();
    }
    async function save(ctx){
        if(ui!==ctx||!valid(ctx)||busyOwner||avansIslemSuruyor)return;
        const item=selected(ctx),target=ctx.target.value;if(!item||!/^\d{4}-(0[1-9]|1[0-2])$/.test(target)||target<=ctx.month)return error(ctx,'Kesintinin bulunduğu aydan sonraki bir ay seçin.');
        if(!SUPABASE_MODE||!supabaseClient||!activeUser?.sirketId)return error(ctx,'Güvenli kayıt için sunucu bağlantısı gerekiyor.');
        const current=avanslar.find(a=>String(a.id)===item.id&&avansAktifSirketinMi(a));
        if(!current||closed(current)||!avansJsonAyniMi(current,item.record))return error(ctx,'Avans bu sırada değişmiş. Pencereyi kapatıp listeyi yenileyin; eski bilgilerle üzerine yazılmadı.');
        const expected=clone(item.record),payload={...expected,kesintiErtelemeleri:{...(expected.kesintiErtelemeleri||{}),[item.sira]:target}},company=String(aktifSirketId()),owner={};
        busyOwner=owner;avansIslemSuruyor=true;ctx.error.hidden=true;const fields=[...ctx.node.querySelectorAll('button,input,select')];fields.forEach(x=>x.disabled=true);ctx.node.setAttribute('aria-busy','true');
        try{
            if(typeof root.fdxPlanliBildirimApi!=='function')throw Error('Dönem kontrol bağlantısı hazır değil; işlem kaydedilmedi.');
            const closures=await root.fdxPlanliBildirimApi({action:'closure-list'},()=>valid(ctx));
            if(!valid(ctx)||ui!==ctx)return;
            if(!Array.isArray(closures?.closures))throw Error('Dönem kapanış durumu doğrulanamadı; işlem kaydedilmedi.');
            if(closures.closures.some(x=>[ctx.month,target,String(expected.baslangicAy)].includes(String(x.month_key))&&x.status==='locked'))throw Error('Avansın başlangıç, kaynak veya hedef dönemi kapalı. Önce Denetim Merkezi üzerinden dönemi yeniden açın.');
            const latest=avanslar.find(a=>String(a.id)===item.id&&avansAktifSirketinMi(a));if(!latest||!avansJsonAyniMi(latest,expected))throw Error('Avans bu sırada değişmiş. Listeyi yenileyin; eski bilgilerle üzerine yazılmadı.');
            const result=await avansGuvenliSunucuKaydi(company,payload,expected);
            if(!valid(ctx)||ui!==ctx)return;
            if(!Object.keys(payload).every(k=>avansJsonAyniMi(result.data?.[k],payload[k])))throw Error('Sunucu yanıtında erteleme doğrulanamadı. Tekrar kaydetmeden önce listeyi yenileyin.');
            const local=avanslar.find(a=>String(a.id)===item.id);if(!local||!avansJsonAyniMi(local,expected))throw Error('Sunucuda kayıt tamamlandı fakat yerel liste değişti. Tekrar kaydetmeden önce listeyi yenileyin.');
            avansSunucuKaydiniUygula(result,expected);close();renderAvansKesintiListesi();renderAvansGelecekKesintileri();showToast('Taksit '+avansAyBasligi(target,true)+' ayına ertelendi.','success');
        }catch(e){error(ctx,'Erteleme tamamlanamadı: '+String(e?.message||e));}
        finally{if(busyOwner===owner){busyOwner=null;avansIslemSuruyor=false;}if(ui===ctx){fields.forEach(x=>x.disabled=false);ctx.node.removeAttribute('aria-busy');}}
    }
    function showMenu(cell,x,y){
        close();const ctx={identity:identity()};if(!valid(ctx)||avansIslemSuruyor)return;
        const items=candidates(cell.dataset.avansPersonel,cell.dataset.avansAy);if(!items.length)return showToast('Kapalı veya tamamlanmış avans ertelenemez.','warning');
        menu=document.createElement('div');menu.id='fdAvansErteleMenu';menu.className='fd-avans-ertele-menu';menu.setAttribute('role','menu');const b=document.createElement('button');b.type='button';b.setAttribute('role','menuitem');b.textContent='Başka aya ertele…';b.addEventListener('click',()=>{if(valid(ctx))openDialog(cell.dataset.avansPersonel,cell.dataset.avansAy,cell);else close();});menu.append(b);document.body.append(menu);const box=menu.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(x,innerWidth-box.width-8))+'px';menu.style.top=Math.max(8,Math.min(y,innerHeight-box.height-8))+'px';observe(ctx);b.focus();
    }
    const cellFrom=e=>e.target.closest?.('#avansGelecekBody td[data-avans-personel]');
    fdAdvanceListen(document,'contextmenu',e=>{const cell=cellFrom(e);if(!cell)return;e.preventDefault();showMenu(cell,e.clientX,e.clientY);});
    fdAdvanceListen(document,'click',e=>{const cell=cellFrom(e);if(cell&&!menu){openDialog(cell.dataset.avansPersonel,cell.dataset.avansAy,cell);return;}if(menu&&!menu.contains(e.target)){hideMenu();stopWatch();}});
    fdAdvanceListen(document,'keydown',e=>{
        if(e.key==='Escape'&&(ui||menu)){if(!busyOwner)close();e.preventDefault();return;}
        const cell=cellFrom(e);if(cell&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openDialog(cell.dataset.avansPersonel,cell.dataset.avansAy,cell);return;}
        if(ui&&e.key==='Tab'){const controls=[...ui.node.querySelectorAll('button,input,select')].filter(x=>!x.disabled),first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){last?.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first?.focus();e.preventDefault();}}
    });
    fdAdvanceListen(root,'pagehide',close);fdAdvanceListen(root,'resize',()=>{if(menu){hideMenu();if(!ui)stopWatch();}});

return {dispose:close};
}

return{init(){ekOdemeSekmeleriniKur();window.fdSupplementalOutputInstall?.();window.fdUnifiedOutput?.scan();fdAdvancePostponement=fdAdvancePostponementInstall(window)},open(options){fdAdvanceAssert();const pending=window.fdAdvanceLaunchOptions?.();options=options||pending||{};if(options.fdAdvanceAction==='avansGecmisiniAc')return avansGecmisiniAc(...(options.args||[]));return openAvansApp()},api:{get avansListeyiYenile(){return avansListeyiYenile},get avansSekmeDegistir(){return avansSekmeDegistir},get avansYeniKayitAc(){return avansYeniKayitAc},get avansDuzenleVazgec(){return avansDuzenleVazgec},get avansPersonelListesiniDoldur(){return avansPersonelListesiniDoldur},get avansPersonelSecimKontrol(){return avansPersonelSecimKontrol},get avansTaksitAlaniniGuncelle(){return avansTaksitAlaniniGuncelle},get avansTaksitButonlariniOlustur(){return avansTaksitButonlariniOlustur},get avansTaksitSec(){return avansTaksitSec},get avansPlanOnizle(){return avansPlanOnizle},get siradakiAvansNo(){return siradakiAvansNo},get avansKaydet(){return avansKaydet},get avansFormReset(){return avansFormReset},get avansDuzenle(){return avansDuzenle},get avansSil(){return avansSil},get avansEtiketi(){return avansEtiketi},get avansGecmisKayitlari(){return avansGecmisKayitlari},get avansGecmisiniAc(){return avansGecmisiniAc},get avansGecmisiniKapat(){return avansGecmisiniKapat},get avansGecmisExcelIndir(){return avansGecmisExcelIndir},get avansKayitSubeFiltreleriniDoldur(){return avansKayitSubeFiltreleriniDoldur},get avansKayitFiltreleriniTemizle(){return avansKayitFiltreleriniTemizle},get avansKayitFiltreliListe(){return avansKayitFiltreliListe},get renderAvansKayitListesi(){return renderAvansKayitListesi},get avansGelecekDonemi(){return avansGelecekDonemi},get renderAvansGelecekKesintileri(){return renderAvansGelecekKesintileri},get avansGelecekExcelAl(){return avansGelecekExcelAl},get avansGelecekPdfAl(){return avansGelecekPdfAl},get avansGelecekGoruntuAl(){return avansGelecekGoruntuAl},get renderAvansKesintiListesi(){return renderAvansKesintiListesi},get avansGecmisPdfIndir(){return avansGecmisPdfIndir}},dispose(){fdAdvanceDisposed=true;fdAdvancePostponement?.dispose();for(const [target,...args]of fdAdvanceListeners)target.removeEventListener(...args);fdAdvanceListeners.length=0;for(const id of fdAdvanceTimers)window.clearTimeout(id);fdAdvanceTimers.clear();for(const id of fdAdvanceIntervals)window.clearInterval(id);fdAdvanceIntervals.clear();fdAdvanceHideOverlay();for(const n of fdAdvanceDialogs)if(n.isConnected)n.querySelector("[data-fd-iptal]")?.click();fdAdvanceDialogs.clear();for(const n of fdAdvanceNodes)fdAdvanceClean(n);fdAdvanceNodes.clear();avansDuzenlemeKopyasi=null;avansDuzenlemeId="";avansYeniTaslakId="";avansGecmisPersonelId="";avansGecmisYili="";document.getElementById("avansForm")?.reset();const tab=typeof fdAcikUygulamaSekmeleri!=="undefined"?fdAcikUygulamaSekmeleri.find(t=>t.anahtar==="avans"||t.alanId==="avansApp"):null;if(tab)tab.alanId="";}};
});
