window.FDModules.define('personeldetay',function(){

let fdDetailDisposed=false,fdDetailRequest=0,fdDetailEmployee=null;const fdDetailInitial=fdDetailContext();
function fdDetailContext(){return JSON.stringify([activeUser?.supabaseUserId||activeUser?.id||activeUser?.username||'',activeUser?.sirketId||'',activeUser?.rol||'',activeUser?.tcNo||'',anaMenuModulYetkisi('personel')])}
function fdDetailValid(){return !fdDetailDisposed&&Boolean(activeUser)&&anaMenuModulErisimiVar('personel')&&!['IsgUzmani','IsyeriHekimi'].includes(activeUser?.rol)&&fdDetailContext()===fdDetailInitial}
function fdDetailAssert(){if(!fdDetailValid())throw Error('Oturum veya yetki değişti; personel kartını yeniden açın.')}
function fdDetailCanRead(id){return fdDetailValid()&&(!isPersonelUser()||String(id)===String(activeUser?.tcNo||''))&&personeller.some(p=>String(p.id)===String(id)&&aktifSirketeAit(p))}
function fdDetailCurrent(ticket,id){const modal=document.getElementById('modalPersonelDetay');return fdDetailCanRead(id)&&ticket===fdDetailRequest&&fdDetailEmployee===String(id)&&modal?.isConnected&&modal.style.display!=='none'}
function switchDetayTab(tabId, btn) {
        const modalCard = btn.closest('.modal-card');
        modalCard.querySelectorAll('.detay-tab-content').forEach(el => el.classList.remove('active'));
        modalCard.querySelectorAll('.detay-tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        btn.classList.add('active');
    }
function openPersonelDetayModal(id) {
const fdDetailTicket=fdDetailRequest;
        if (kullaniciRolAnahtari() === 'personel' && String(id) !== String(activeUser?.tcNo || '')) return;
        const p = personeller.find(item => String(item.id) === String(id) && aktifSirketeAit(item));
        if (!p) return;
        const detayBasligi = document.querySelector('#modalPersonelDetay .modal-header h3');
        if (detayBasligi) detayBasligi.textContent = isPersonelUser() ? '👤 Personel Bilgilerim' : '👤 Personel Detay Kartı';

        document.querySelectorAll('#modalPersonelDetay .detay-tab-btn').forEach((b, idx) => {
            if(idx === 0) b.classList.add('active'); else b.classList.remove('active');
        });
        document.querySelectorAll('#modalPersonelDetay .detay-tab-content').forEach((tab, idx) => tab.classList.toggle('active', idx === 0));
        const detaySekmeleri = document.querySelector('#modalPersonelDetay .detay-tab-header');
        if (detaySekmeleri) detaySekmeleri.style.display = kullaniciRolAnahtari() === 'personel' ? 'none' : '';

        const body = document.getElementById('detayModalBody');
        const fotografAdresi = personelFotografAdresi(p);
        const foto = window.fdPersonnelPhoto.html(p, 'detail');

        const detayBugun = bugununYerelTarihi();
        const detayVardiyaId = magicpassGunVardiyasi(p, detayBugun);
        const detayVardiyaSaat = magicpassVardiyaSaatEtiketi(detayVardiyaId);
        body.innerHTML = `
            <div style="text-align:center; margin-bottom:16px;">
                ${foto}
                <h4 style="font-size:1.1rem; color:#0f172a; font-weight:800;">${p.ad}</h4>
                <p style="color:#64748b; font-size:0.85rem;">${p.gorev || 'Görev Belirtilmemiş'} • <span class="badge" style="${getSubeBadgeStyle(p.sube)}">${p.sube || 'Merkez'}</span></p>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
                <div><strong>T.C. Kimlik No:</strong><br><code>${p.id}</code></div>
                <div><strong>Telefon Numarası:</strong><br>${p.telefon || '-'}</div>
                <div><strong>Kan Grubu:</strong><br>${p.kanGrubu || '-'}</div>
                <div><strong>Kimlik Seri No:</strong><br>${p.kimlikSeriNo || '-'}</div>
                <div><strong>İşe Giriş Tarihi:</strong><br>${tarihFormati(p.girisTarihi)}</div>
                <div><strong>Doğum Tarihi:</strong><br>${tarihFormati(p.dogumTarihi)}</div>
                ${(p.cikisTarihi && p.cikisTarihi !== "null") ? `<div><strong>İşten Çıkış Tarihi:</strong><br><span style="color:#ef4444; font-weight:700;">${tarihFormati(p.cikisTarihi)}</span></div>` : ''}
            </div>
            <div style="margin-top:12px; background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
                <div style="margin-bottom:8px;"><strong>Aldığı Belgeler:</strong><br>${p.belgeler || 'Kayıtlı belge yok'}</div>
                <div style="margin-bottom:8px;"><strong>Açıklamalar / Notlar:</strong><br>${p.aciklama || 'Ek açıklama yok'}</div>
                <div><strong>Adres:</strong><br>${p.adres || 'Adres belirtilmemiş'}</div>
            </div>
        `;

        const safe = value => value === undefined || value === null || value === '' ? '-' : escapeDashboardText(value);
        const date = value => value ? tarihFormati(value) : '-';
        const item = (label, value, danger = false) => `<div style="padding:9px 0; border-bottom:1px solid #edf2f7;"><span style="display:block; color:#64748b; font-size:.69rem; font-weight:750; text-transform:uppercase;">${label}</span><strong style="display:block; margin-top:3px; color:${danger ? '#b91c1c' : '#1e293b'}; font-size:.82rem; font-weight:650; overflow-wrap:anywhere;">${value}</strong></div>`;
        const section = (title, content) => `<section style="margin-top:12px; border:1px solid #dce8f1; border-radius:10px; background:#fbfdff; overflow:hidden;"><h5 style="margin:0; padding:10px 12px; color:#0f4c6e; background:#f0f8fc; font-size:.8rem;">${title}</h5><div style="display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 14px; padding:2px 12px 10px;">${content}</div></section>`;

        body.innerHTML = `
            <div style="text-align:center; margin-bottom:16px;">${foto}<h4 style="font-size:1.1rem; color:#0f172a; font-weight:800;">${safe(p.ad)}</h4><p style="color:#64748b; font-size:.82rem;">${safe(p.gorev)} · <span class="badge" style="${getSubeBadgeStyle(p.sube)}">${safe(p.sube || 'Merkez')}</span></p></div>
            ${section('Kimlik ve İstihdam Bilgileri',
                item('T.C. Kimlik No', `<code>${safe(p.id)}</code>`) + item('Cihaz Personel No', safe(p.cihazPersonelNo)) + item('Kimlik Seri No', safe(p.kimlikSeriNo)) + item('Doğum Tarihi', date(p.dogumTarihi)) + item('Cinsiyet', safe(p.cinsiyet)) + item('Şube / Şantiye', safe(p.sube)) + item('Departman', safe(p.departman)) + item('Görev / Ünvan', safe(p.gorev)) + item('Kadro', safe(p.kadro)) + item('Bağlı Yönetici', safe(p.yonetici)) + item('İşe Giriş Tarihi', date(p.girisTarihi)) + item('İşten Çıkış Tarihi', date(p.cikisTarihi), Boolean(p.cikisTarihi && p.cikisTarihi !== 'null')))}
            ${section('İletişim ve Aile Bilgileri',
                item('Telefon', safe(p.telefon)) + item('2. Telefon', safe(p.kurumsalTelefon)) + item('E-posta', safe(p.eposta)) + item('Medeni Durum', safe(p.medeniDurum)) + item('Çocuk Sayısı', safe(p.cocukSayisi)) + item('Acil Durum Kişisi', safe(p.acilDurumAd)) + item('Yakınlık Derecesi', safe(p.acilDurumYakinlik)) + item('Acil Durum Telefonu', safe(p.acilDurumTelefon)) + item('Adres', safe(p.adres)))}
            ${section('Finansal ve Özlük Bilgileri',
                item('Banka', safe(p.bankaAdi)) + item('IBAN', safe(p.iban)) + item('SGK Sicil No', safe(p.sgkNo)) + item('Emeklilik Durumu', safe(p.emekli)) + item('Emeklilik Türü', safe(p.emeklilikTuru)) + item('Engelli Durumu', safe(p.engelli)) + item('Vergi Muafiyeti', safe(p.vergiMuafiyet)) + item('Askerlik Durumu', safe(p.askerlikDurumu)) + item('Terhis Tarihi', date(p.terhisTarihi)) + item('Tecil Bitiş Tarihi', date(p.tecilBitis)) + item('Ücret Tipi', safe(p.ucretTipi)) + item('Ücret', safe(p.fdUcretDonemleri?.length ? paraFormatla(personelGunlukUcretiniGetir(p)) : p.ucret)) + item('Ek Ödeme', `${safe(p.ekOdemeTuru)} / ${safe(p.ekOdemeTutari)}`) + item('Yol Ücreti', safe(p.yolUcreti)) + item('Prim Uygulaması', safe(p.primVar)))}
            ${section('Eğitim, Belgeler ve Yetkinlikler',
                item('Eğitim Seviyesi', safe(p.egitimSeviyesi)) + item('Okul / Bölüm', safe(p.okulBolum)) + item('Mezuniyet Yılı', safe(mezuniyetYiliniDuzelt(p.mezuniyetYili||p.mezuniyetTarihi))) + item('Aldığı Belgeler', safe(p.belgeler)) + item('Sertifikalar', safe(p.sertifikalar)) + item('Sertifika Bitişi', date(p.sertifikaBitis)) + item('Ehliyetler ve Yabancı Dil', safe(p.ehliyetDil)))}
            ${section('Sağlık ve İş Güvenliği',
                item('Kan Grubu', safe(p.kanGrubu)) + item('Son Sağlık Taraması', date(p.sonSaglikTaramasi)) + item('İş Yeri Hekimi', safe(p.isyeriHekimi)) + item('Kronik Rahatsızlıklar', safe(p.kronikRahatsizlik)) + item('Alerjiler', safe(p.alerjiler)) + item('Sağlık / İSG Notu', safe(p.saglikNotu)))}
            ${section('Zimmet, Kariyer ve Notlar',
                item('Zimmet Bilgisi', safe(p.zimmetNotu)) + item('Terfi / Ünvan Geçmişi', safe(p.terfiGecmisi)) + item('Performans / Ödül Notları', safe(p.performansNotu)) + item('Açıklamalar', safe(p.aciklama)))}
            <section style="margin-top:12px;border:1px solid #dce8f1;border-radius:10px;background:#fbfdff;overflow:hidden;"><h5 style="margin:0;padding:10px 12px;color:#0f4c6e;background:#f0f8fc;font-size:.8rem;">KVKK Aydınlatma Teyidi</h5><div id="personelKvkkDurumu" style="padding:12px;color:#64748b;">Onay kaydı kontrol ediliyor...</div></section>
            ${personelSubeBelgeleriHtml(p)}
        `;
        personelBelgeButonlariniBagla(p.id, body);

        const izinBody = document.querySelector('#detayIzinTablosu tbody');
        izinBody.innerHTML = '';
        const pIzinleri = izinler.filter(i => String(i.pId) === String(id)).sort((a, b) => new Date(b.baslangic) - new Date(a.baslangic));

        if (pIzinleri.length === 0) {
            izinBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#64748b;">Bu personele ait kayıtlı geçmiş izin bulunmuyor.</td></tr>';
        } else {
            izinBody.innerHTML = pIzinleri.map((i, idx) => {
                let badgeCls = getTurBadgeClass(i.tur);
                return `
                    <tr>
                        <td>${idx + 1}</td>
                        <td><span class="badge ${badgeCls}">${i.tur}</span></td>
                        <td>${i.donem || '-'}</td>
                        <td>${tarihFormati(i.baslangic)} - ${tarihFormati(i.bitis)}</td>
                        <td><strong>${i.gun} Gün</strong></td>
                        <td>${izinGecmisAciklamaHtml(i)}</td>
                    </tr>
                `;
            }).join('');
        }

        const bilgiTablosu = (basliklar, satirlar, bosMesaj) => `
            <div class="table-wrapper"><table><thead><tr>${basliklar.map(b => `<th>${b}</th>`).join('')}</tr></thead>
            <tbody>${satirlar.length ? satirlar.join('') : `<tr><td colspan="${basliklar.length}" style="text-align:center;color:#64748b;padding:22px;">${bosMesaj}</td></tr>`}</tbody></table></div>`;

        const puantajKayitlari = puantajVerileri
            .filter(k => k.kayitTipi === 'maasOzet' && String(k.pId) === String(id) && aktifSirketeAit(k))
            .sort((a, b) => String(b.tarih || '').localeCompare(String(a.tarih || '')));
        document.getElementById('detayPuantajBody').innerHTML = bilgiTablosu(
            ['Dönem', 'Fazla Mesai', 'Pazar Mesai', 'Resmi Tatil Mesai', 'Prim', 'Avans', 'İcra', 'BES'],
            puantajKayitlari.map(k => `<tr><td>${safe(String(k.tarih || '').slice(0, 7))}</td><td>${safe(k.fazlaMesaiSaati || 0)} saat</td><td>${safe(k.pazarMesaiSaati || 0)} saat</td><td>${safe(k.resmiTatilMesaiSaati || 0)} saat</td><td>${paraFormatla(k.primTutari || 0)}</td><td>${paraFormatla(k.avansKesintisi || 0)}</td><td>${paraFormatla(k.icraKesintisi || 0)}</td><td>${paraFormatla(k.besKesintisi || 0)}</td></tr>`),
            'Bu personele ait kaydedilmiş puantaj özeti bulunmuyor.'
        );

        const pAvanslari = avanslar.filter(a => String(a.pId) === String(id) && avansAktifSirketinMi(a))
            .sort((a, b) => String(b.kayitTarihi || '').localeCompare(String(a.kayitTarihi || '')));
        document.getElementById('detayAvansBody').innerHTML = bilgiTablosu(
            ['Kayıt Tarihi', 'Başlangıç Ayı', 'Tutar', 'Taksit', 'Durum', 'Açıklama'],
            pAvanslari.map(a => `<tr><td>${date(a.kayitTarihi)}</td><td>${safe(a.baslangicAy)}</td><td>${paraFormatla(a.tutar)}</td><td>${safe(a.taksitSayisi || 1)} ay</td><td>${safe(a.durum || 'Aktif')}</td><td>${safe(a.aciklama)}</td></tr>`),
            'Bu personele ait avans kaydı bulunmuyor.'
        );

        const pIcralari = icralar.filter(i => String(i.pId) === String(id) && aktifSirketeAit(i));
        document.getElementById('detayIcraBody').innerHTML = bilgiTablosu(
            ['Dosya No', 'Toplam Borç', 'Kesilen', 'Kalan', 'Durum', 'Belge'],
            pIcralari.map(i => {
                const kesilen = (i.kesintiler || []).reduce((toplam, k) => toplam + Number(k.tutar || 0), 0);
                const belgeler = [
                    i.pdfUrl ? `<button type="button" class="btn-modern btn-detail-modern" onclick='icraPdfAc(${JSON.stringify(String(i.pdfUrl))}, ${JSON.stringify(String(i.dosyaNo || ''))}, "İcra Yazısı")'>📄 İcra Yazısı</button>` : '',
                    i.bitisPdfUrl ? `<button type="button" class="btn-modern btn-detail-modern" onclick='icraPdfAc(${JSON.stringify(String(i.bitisPdfUrl))}, ${JSON.stringify(String(i.dosyaNo || ''))}, "Bitiş Yazısı")'>✅ Bitiş Yazısı</button>` : ''
                ].filter(Boolean).join(' ');
                return `<tr><td>${safe(i.dosyaNo)}</td><td>${paraFormatla(i.toplamBorc)}</td><td>${paraFormatla(kesilen)}</td><td>${paraFormatla(icraKalanBorc(i))}</td><td>${safe(i.durum || 'Aktif')}</td><td>${belgeler || '-'}</td></tr>`;
            }),
            'Bu personele ait icra kaydı bulunmuyor.'
        );

        const pEkOdemeleri = ekOdemeler.filter(k => String(k.pId) === String(id) && aktifSirketeAit(k))
            .sort((a, b) => String(b.ay || '').localeCompare(String(a.ay || '')));
        const ekOdemeAylikOzet = bilgiTablosu(
            ['Ay', 'Ödeme Türü', 'Bu Ay Toplam', 'Ödenen', 'Kalan'],
            pEkOdemeleri.map(k => `<tr><td>${safe(ekOdemeAyiniNormalizeEt(k.ay))}</td><td>${safe(k.ekOdemeTuru || (k.kalem === 'yol' ? 'Yol Ücreti' : 'Ek Ödeme'))}</td><td>${paraFormatla(k.toplamTutar || k.tutar)}</td><td>${paraFormatla(k.odenenTutar)}</td><td style="color:#b91c1c;font-weight:800;">${paraFormatla(k.kalanTutar)}</td></tr>`),
            'Bu personele ait ek ödeme veya yol ücreti kaydı bulunmuyor.'
        );
        const ekOdemeHareketleri = pEkOdemeleri.flatMap(k => (Array.isArray(k.odemeler) ? k.odemeler : []).map(o => ({ ...o, ay:k.ay, tur:k.ekOdemeTuru || (k.kalem === 'yol' ? 'YOL ÜCRETİ' : 'EK ÖDEME') }))).sort((a, b) => String(b.tarih || '').localeCompare(String(a.tarih || '')));
        const ekOdemeHareketTablosu = bilgiTablosu(
            ['Ödeme Tarihi', 'Dönem', 'Ödeme Türü', 'Ödenen Tutar'],
            ekOdemeHareketleri.map(o => `<tr><td>${date(o.tarih)}</td><td>${safe(o.ay)}</td><td>${safe(o.tur)}</td><td>${paraFormatla(o.tutar)}</td></tr>`),
            'Bu personele ait ödeme hareketi bulunmuyor.'
        );
        document.getElementById('detayEkOdemeBody').innerHTML = `<h4 style="margin:0 0 8px;">Aylık Özet</h4>${ekOdemeAylikOzet}<h4 style="margin:18px 0 8px;">Tarih Bazlı Ödeme Hareketleri</h4>${ekOdemeHareketTablosu}`;

        const pKkdKayitlari = kkdKayitlari.filter(k => String(k.pId) === String(id) && aktifSirketeAit(k)).sort((a, b) => String(b.tarih || '').localeCompare(String(a.tarih || '')));
        document.getElementById('detayKkdBody').innerHTML = bilgiTablosu(
            ['Teslim Tarihi', 'KKD Türü', 'Adet', 'Not'],
            pKkdKayitlari.map(k => `<tr><td>${date(k.tarih)}</td><td>${safe(k.tur)}</td><td>${Number(k.adet || 1)}</td><td>${safe(k.not)}</td></tr>`),
            'Bu personele ait KKD teslim kaydı bulunmuyor.'
        );

        const vardiyaGecmisi = vardiyaKayitlari.filter(kayit => !kayit.kayitTipi && aktifSirketeAit(kayit) && (kayit.satirlar || []).some(satir => String(satir.personelId || '') === String(id)))
            .sort((a,b) => String(b.haftaBaslangic || '').localeCompare(String(a.haftaBaslangic || '')));
        document.getElementById('detayVardiyaBody').innerHTML = `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:14px;">
            <div class="dashboard-stat" style="min-height:auto;padding:14px;--stat-color:#7c3aed;"><span class="dashboard-stat-label">Bugünkü Vardiya</span><strong style="display:block;margin-top:7px;">${safe(detayVardiyaSaat)}</strong></div>
            <div class="dashboard-stat" style="min-height:auto;padding:14px;--stat-color:#0ea5e9;"><span class="dashboard-stat-label">Vardiya Tanımı</span><strong style="display:block;margin-top:7px;">${safe(magicpassVardiyaTanimiBul(detayVardiyaId)?.ad || detayVardiyaId)}</strong></div>
        </div>` + bilgiTablosu(
            ['Hafta', 'Şube', 'Bölüm', 'Vardiya', 'Saat'],
            vardiyaGecmisi.map(kayit => {
                const satir = (kayit.satirlar || []).find(s => String(s.personelId || '') === String(id));
                const vardiyaId = vardiyaKayitTanimHaritasi(kayit)[satir?.vardiya] || detayVardiyaId;
                const bolum = vardiyaBolumleriniDuzelt(kayit).find(b => String(b.id) === String(satir?.vardiya));
                return `<tr><td>${date(kayit.haftaBaslangic)} - ${date(vardiyaHaftaBitisi(kayit.haftaBaslangic))}</td><td>${safe(kayit.sube)}</td><td>${safe(bolum?.baslik || satir?.vardiya)}</td><td>${safe(magicpassVardiyaTanimiBul(vardiyaId)?.ad || vardiyaId)}</td><td><strong>${safe(magicpassVardiyaSaatEtiketi(vardiyaId))}</strong></td></tr>`;
            }),
            'Bu personele ait haftalık vardiya kaydı bulunmuyor.'
        );

        const simdi = new Date(), detayAy = simdi.getMonth(), detayYil = simdi.getFullYear(), detayGunSayisi = new Date(detayYil, detayAy + 1, 0).getDate();
        const girisCikisSatirlari = [], girisCikisGunleri = [];
        for (let gun = 1; gun <= detayGunSayisi; gun++) {
            const tarihKey = `${detayYil}-${String(detayAy + 1).padStart(2,'0')}-${String(gun).padStart(2,'0')}`;
            const sonuc = magicpassGunHesapla(p, tarihKey);
            girisCikisGunleri.push(sonuc);
            girisCikisSatirlari.push(`<tr><td>${date(tarihKey)}<br><small>${new Date(tarihKey + 'T12:00:00').toLocaleDateString('tr-TR',{weekday:'long'})}</small></td><td>${safe(magicpassVardiyaSaatEtiketi(sonuc.vardiya))}</td><td>${magicpassSaatHucresiHtml(sonuc,'giris')}</td><td>${magicpassSaatHucresiHtml(sonuc,'cikis')}</td><td>${safe(sonuc.durum)}</td><td>${magicpassDakikaMetni(sonuc.gec)}</td><td>${magicpassDakikaMetni(sonuc.erken)}</td><td>${magicpassYapilanMesaiHucresiHtml(sonuc)}</td><td>${magicpassDakikaMetni(magicpassToplamCalismaDakikasi(sonuc))}</td></tr>`);
        }
        document.getElementById('detayGirisCikisBody').innerHTML = `<div style="margin-bottom:10px;color:#475569;font-weight:750;">${simdi.toLocaleDateString('tr-TR',{month:'long',year:'numeric'})} giriş–çıkış çizelgesi</div><div id="detayGirisCikisOzeti" class="magicpass-aylik-ozet">${magicpassAylikOzetHtml(girisCikisGunleri)}</div>` + bilgiTablosu(
            ['Tarih', 'Vardiya', 'Giriş', 'Çıkış', 'Durum', 'Geç', 'Erken', 'Fazla Mesai', 'Toplam Çalışma'], girisCikisSatirlari, 'Giriş–çıkış kaydı bulunmuyor.'
        );
        magicpassAylikTabloOzetiniEkle(document.querySelector('#detayGirisCikisBody table'),girisCikisGunleri,p);

        document.getElementById('modalPersonelDetay').style.display = 'flex';
        kvkkPersonelDurumunuYukle(String(p.id),()=>fdDetailCurrent(fdDetailTicket,String(p.id)));
    }
function closePersonelDetayModal() {
        document.getElementById('modalPersonelDetay').style.display = 'none';
        if (isPersonelUser()) closeAppsToHub();
    }
return{open(action,id){fdDetailAssert();if(action==='prepare')return true;const request=window.fdPersonelDetayAcmaIstegi?.();if(request!==null&&request!==undefined)return window.openPersonelDetayModal(request);return false},api:{openPersonelDetayModal(id){fdDetailAssert();if(!fdDetailCanRead(id))return false;fdDetailRequest++;fdDetailEmployee=String(id);return openPersonelDetayModal(id)},closePersonelDetayModal(){fdDetailAssert();fdDetailRequest++;fdDetailEmployee=null;return closePersonelDetayModal()},switchDetayTab(...args){fdDetailAssert();return switchDetayTab(...args)}},dispose(){fdDetailDisposed=true;fdDetailRequest++;fdDetailEmployee=null;const modal=document.getElementById('modalPersonelDetay');if(modal){modal.style.display='none';modal.querySelectorAll('.detay-tab-content').forEach(n=>n.replaceChildren())}}};
});
